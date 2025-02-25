import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { db } from "./db"; // Assuming db.ts exports a Prisma Client instance


export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  app.get("/api/deputies", async (_req, res) => {
    const deputies = await db.query.deputies.findMany({
      orderBy: (deputies, { desc }) => [desc(deputies.votes)]
    });
    res.json(deputies);
  });

  app.get("/api/votes", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.sendStatus(401);
    }

    const userVotes = await db.query.userVotes.findFirst({
      where: (userVotes, { eq }) => eq(userVotes.userId, userId)
    });
    res.json(userVotes);
  });

  app.post("/api/vote/:deputyId", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.sendStatus(401);
    }

    const { deputyId } = req.params;

    const userVotes = await db.query.userVotes.findFirst({
      where: (userVotes, { eq }) => eq(userVotes.userId, userId)
    });

    if (!userVotes) {
      await db.insert(userVotes).values({
        userId,
        hasVoted: false,
        votedDeputies: [deputyId]
      });
    } else if (userVotes.votedDeputies.length >= 5) {
      return res.status(400).json({ error: "You have already voted 5 times" });
    } else {
      await db.update(userVotes)
        .set({ 
          votedDeputies: [...userVotes.votedDeputies, deputyId],
          hasVoted: userVotes.votedDeputies.length + 1 >= 5
        })
        .where(eq(userVotes.userId, userId));
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
  });

  app.get("/api/users", async (_req, res) => {
    const users = await db.query.users.findMany(); // Assuming a 'users' model in your database
    res.json(users);
  });

  return httpServer;
}