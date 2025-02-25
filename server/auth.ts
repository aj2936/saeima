import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { z } from "zod";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

const registerSchema = z.object({
  username: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Lūdzu ievadiet derīgu e-pasta adresi ar @gmail.com"),
  password: z.string().min(1, "Parolei jābūt vismaz 1 simbolam garam"),
});

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Nepareizs e-pasts vai parole" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ 
          message: "Lietotājs ar šādu e-pasta adresi jau eksistē" 
        });
      }

      const user = await storage.createUser({
        ...data,
        password: await hashPassword(data.password),
      });

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ 
            message: "Kļūda lietotāja autentifikācijā" 
          });
        }
        res.status(201).json(user);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Nederīgi ievades dati",
          errors: error.errors 
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({ 
        message: "Kļūda reģistrācijas procesā" 
      });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(500).json({ 
          message: "Kļūda autentifikācijas procesā" 
        });
      }
      if (!user) {
        return res.status(401).json({ 
          message: info?.message || "Nepareizs e-pasts vai parole" 
        });
      }
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ 
            message: "Kļūda lietotāja autentifikācijā" 
          });
        }
        res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ 
          message: "Kļūda izrakstīšanās procesā" 
        });
      }
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        message: "Nav autorizēts" 
      });
    }
    res.json(req.user);
  });
}