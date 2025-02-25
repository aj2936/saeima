import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { db } from "./db";
import { and, eq } from "drizzle-orm";
import { deputies, userVotes } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  app.get("/api/deputies", async (_req, res) => {
    const allDeputies = await db.query.deputies.findMany({
      orderBy: (deputies, { desc }) => [desc(deputies.votes)]
    });
    res.json(allDeputies);
  });

  app.get("/api/votes", async (req, res) => {
    if (!req.user?.id) {
      return res.sendStatus(401);
    }

    const votes = await db.query.userVotes.findFirst({
      where: (userVotes, { eq }) => eq(userVotes.userId, req.user!.id)
    });
    res.json(votes || { userId: req.user.id, hasVoted: false, votedDeputies: [] });
  });

  app.post("/api/vote/:deputyId", async (req, res) => {
    if (!req.user?.id) {
      return res.sendStatus(401);
    }

    const { deputyId } = req.params;

    try {
      const existingVotes = await db.query.userVotes.findFirst({
        where: (userVotes, { eq }) => eq(userVotes.userId, req.user!.id)
      });

      if (!existingVotes) {
        await db.insert(userVotes).values({
          userId: req.user.id,
          hasVoted: false,
          votedDeputies: [deputyId]
        });
      } else if (existingVotes.votedDeputies.length >= 5) {
        return res.status(400).json({ message: "Jūs jau esat izmantojis visas 5 balsis" });
      } else if (existingVotes.votedDeputies.includes(deputyId)) {
        return res.status(400).json({ message: "Jūs jau esat nobalsojis par šo deputātu" });
      } else {
        await db.update(userVotes)
          .set({ 
            votedDeputies: [...existingVotes.votedDeputies, deputyId],
            hasVoted: existingVotes.votedDeputies.length + 1 >= 5
          })
          .where(eq(userVotes.userId, req.user.id));
      }

      await db.update(deputies)
        .set({ votes: sql`votes + 1` })
        .where(eq(deputies.id, deputyId));

      const updatedDeputies = await db.query.deputies.findMany({
        orderBy: (deputies, { desc }) => [desc(deputies.votes)]
      });

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "VOTE_UPDATE", deputies: updatedDeputies }));
        }
      });

      res.sendStatus(200);
    } catch (error) {
      console.error("Balsošanas kļūda:", error);
      res.status(500).json({ message: "Radās kļūda balsošanas laikā" });
    }
  });

  app.get("/api/users", async (_req, res) => {
    const users = await db.query.users.findMany(); 
    res.json(users);
  });

  return httpServer;
}