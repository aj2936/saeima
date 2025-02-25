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
    try {
      const deputies = await storage.getDeputies();
      console.log(`Sending ${deputies.length} deputies to client`);
      res.json(deputies);
    } catch (error) {
      console.error("Error fetching deputies:", error);
      res.status(500).json({ error: "Failed to fetch deputies" });
    }
  });

  app.get("/api/votes", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.sendStatus(401);
    }

    const userVotes = await storage.getUserVotes(userId);
    res.json(userVotes);
  });

  app.post("/api/vote/:deputyId", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.sendStatus(401);
    }

    const { deputyId } = req.params;

    let userVotes = await storage.getUserVotes(userId);
    if (!userVotes) {
      userVotes = await storage.createUserVotes(userId);
    }

    if (userVotes.votedDeputies.length >= 5) {
      return res.status(400).json({ error: "You have already voted 5 times" });
    }

    const success = await storage.voteForDeputy(userId, deputyId);
    if (!success) {
      return res.status(400).json({ error: "Failed to register vote" });
    }

    const updatedDeputies = await storage.getDeputies();

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "VOTE_UPDATE", deputies: updatedDeputies }));
      }
    });

    res.sendStatus(200);
  });

  return httpServer;
}