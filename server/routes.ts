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

  app.get("/api/votes", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.json({ votedDeputies: [], hasVoted: false });
      }
      const votes = await storage.getUserVotes(req.user.id);
      res.json(votes || { votedDeputies: [], hasVoted: false });
    } catch (error) {
      console.error("Error fetching votes:", error);
      res.status(500).json({ error: "Failed to fetch votes" });
    }
  });

  app.post("/api/vote/:deputyId", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Nav autorizēts" });
      }

      const { deputyId } = req.params;
      const votes = await storage.getUserVotes(req.user.id) || { votedDeputies: [] };

      if (!votes) {
        // Initialize votes for new users
        await storage.initializeUserVotes(req.user.id);
      }

      if (votes.votedDeputies.length >= 5) {
        return res.status(400).json({ message: "Jūs jau esat izmantojis visas savas balsis" });
      }

      if (votes.votedDeputies.includes(deputyId)) {
        return res.status(400).json({ message: "Jūs jau esat nobalsojis par šo deputātu" });
      }

      const success = await storage.voteForDeputy(req.user.id, deputyId);
      if (!success) {
        return res.status(400).json({ message: "Neizdevās nobalsot" });
      }
      
      const updatedDeputies = await storage.getDeputies();
      const updatedVotes = await storage.getUserVotes(req.user.id);

      // Broadcast updates to all connected clients
      const updateMessage = JSON.stringify({
        type: "VOTE_UPDATE",
        deputies: updatedDeputies,
        userVotes: updatedVotes
      });

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(updateMessage);
        }
      });

      res.json({ message: "Balss veiksmīgi reģistrēta" });
    } catch (error) {
      console.error("Error voting:", error);
      res.status(500).json({ message: "Neizdevās reģistrēt balsi" });
    }
  });

  return httpServer;
}