import express from "express";
import cors from "cors";
import { ChatGPTAgent } from "./agent.js";

/**
 * Express Server für den ChatGPT-Agent
 * 
 * API-Endpoints:
 * - POST /chat - Chat-Nachricht verarbeiten
 * - GET /session/:userId - Session-Info abrufen
 * - DELETE /session/:userId - Session löschen
 * - POST /reading/generate - Reading direkt generieren
 * - POST /matching - Partner-Matching durchführen
 * - GET /health - Health Check
 */
export class AgentServer {
  constructor(config = {}) {
    this.config = {
      port: config.port || process.env.PORT || 4000,
      ...config
    };

    this.app = express();
    this.agent = new ChatGPTAgent(config);

    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // CORS
    this.app.use(cors());
    
    // JSON Body Parser
    this.app.use(express.json());

    // Request Logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health Check
    this.app.get("/health", (req, res) => {
      res.json({
        status: "ok",
        service: "chatgpt-agent",
        timestamp: new Date().toISOString()
      });
    });

    // Chat-Endpoint
    this.app.post("/chat", async (req, res) => {
      try {
        const { userId, message, context } = req.body;

        if (!userId || !message) {
          return res.status(400).json({
            success: false,
            error: "userId und message sind erforderlich"
          });
        }

        const result = await this.agent.processMessage(userId, message, context || {});

        res.json(result);
      } catch (error) {
        console.error("Fehler im Chat-Endpoint:", error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Session-Info
    this.app.get("/session/:userId", (req, res) => {
      try {
        const { userId } = req.params;
        const sessionInfo = this.agent.getSessionInfo(userId);
        res.json(sessionInfo);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Session löschen
    this.app.delete("/session/:userId", (req, res) => {
      try {
        const { userId } = req.params;
        this.agent.clearSession(userId);
        res.json({
          success: true,
          message: "Session gelöscht"
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Reading direkt generieren
    this.app.post("/reading/generate", async (req, res) => {
      try {
        const { userId, birthDate, birthTime, birthPlace, readingType } = req.body;

        if (!birthDate || !birthTime || !birthPlace) {
          return res.status(400).json({
            success: false,
            error: "birthDate, birthTime und birthPlace sind erforderlich"
          });
        }

        const result = await this.agent.generateReading(userId, {
          birthDate,
          birthTime,
          birthPlace,
          readingType: readingType || "detailed"
        });

        res.json(result);
      } catch (error) {
        console.error("Fehler beim Generieren des Readings:", error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Partner-Matching
    this.app.post("/matching", async (req, res) => {
      try {
        const { userId1, userId2, user1Chart, user2Chart } = req.body;

        if (!user1Chart || !user2Chart) {
          return res.status(400).json({
            success: false,
            error: "user1Chart und user2Chart sind erforderlich"
          });
        }

        const result = await this.agent.matchPartners(
          userId1,
          userId2,
          user1Chart,
          user2Chart
        );

        res.json(result);
      } catch (error) {
        console.error("Fehler beim Partner-Matching:", error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Error Handler
    this.app.use((err, req, res, next) => {
      console.error("Unbehandelter Fehler:", err);
      res.status(500).json({
        success: false,
        error: "Interner Serverfehler"
      });
    });
  }

  start() {
    this.app.listen(this.config.port, () => {
      console.log(`🤖 ChatGPT-Agent Server läuft auf Port ${this.config.port}`);
      console.log(`📡 Health Check: http://localhost:${this.config.port}/health`);
      console.log(`💬 Chat Endpoint: http://localhost:${this.config.port}/chat`);
    });
  }
}

// Server starten, wenn direkt ausgeführt
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new AgentServer();
  server.start();
}

