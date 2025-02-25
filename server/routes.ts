import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
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

  app.get("/api/votes", async (_req, res) => {
    res.json({ votedDeputies: [], hasVoted: false });
  });

  app.post("/api/vote/:deputyId", async (req, res) => {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const { deputyId } = req.params;
    const success = await storage.voteForDeputy(req.user.id, deputyId);

    if (!success) {
      return res.status(400).json({ message: "Failed to register vote" });
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