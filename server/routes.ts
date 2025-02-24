import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  app.get("/api/deputies", async (_req, res) => {
    const deputies = await storage.getDeputies();
    res.json(deputies);
  });

  app.get("/api/votes", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userVotes = await storage.getUserVotes(req.user.id);
    if (!userVotes) {
      const newUserVotes = await storage.createUserVotes(req.user.id);
      return res.json(newUserVotes);
    }
    res.json(userVotes);
  });

  app.post("/api/vote/:deputyId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const success = await storage.voteForDeputy(req.user.id, req.params.deputyId);
    if (!success) {
      return res.status(400).send("Invalid vote");
    }

    const deputies = await storage.getDeputies();
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "VOTE_UPDATE", deputies }));
      }
    });

    res.sendStatus(200);
  });

  app.get("/api/users", async (_req, res) => {
    const users = Array.from(storage.users.values()).map(user => ({
      id: user.id,
      username: user.username
    }));
    res.json(users);
  });

  return httpServer;
}
