import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { chatRouter } from "./routes/chat.js";
import { readingRouter } from "./routes/reading.js";
import { matchingRouter } from "./routes/matching.js";
import { userRouter } from "./routes/user.js";
import { authMiddleware } from "./middleware/auth.js";
import { errorHandler } from "./middleware/error-handler.js";
import { requestLogger } from "./middleware/logger.js";

/**
 * Connection-Key Server
 * 
 * Zentrale API für die App
 * - Kommuniziert mit ChatGPT-Agent
 * - Verwaltet Authentication
 * - Validiert Inputs
 * - Stellt API-Endpoints bereit
 */
export class ConnectionKeyServer {
  constructor(options = {}) {
    this.config = {
      port: options.port || config.port || process.env.PORT || 3000,
      chatgptAgentUrl: options.chatgptAgentUrl || config.chatgptAgent.url,
      enableAuth: options.enableAuth !== false, // Standard: true
      ...options
    };

    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // CORS
    this.app.use(cors({
      origin: config.cors.allowedOrigins || "*",
      credentials: true
    }));

    // Body Parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request Logging
    this.app.use(requestLogger);

    // Health Check (vor Auth)
    this.app.get("/health", (req, res) => {
      res.json({
        status: "ok",
        service: "connection-key-server",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      });
    });
  }

  setupRoutes() {
    // Public Routes (ohne Auth)
    this.app.get("/", (req, res) => {
      res.json({
        service: "Connection-Key Server",
        version: "1.0.0",
        endpoints: {
          health: "GET /health",
          chat: "POST /api/chat",
          reading: "POST /api/reading/generate",
          matching: "POST /api/matching",
          user: "GET /api/user/:userId"
        }
      });
    });

    // API Routes (mit Auth, wenn aktiviert)
    const apiRouter = express.Router();

    if (this.config.enableAuth) {
      apiRouter.use(authMiddleware);
    }

    // Routes registrieren
    apiRouter.use("/chat", chatRouter);
    apiRouter.use("/reading", readingRouter);
    apiRouter.use("/matching", matchingRouter);
    apiRouter.use("/user", userRouter);

    this.app.use("/api", apiRouter);
  }

  setupErrorHandling() {
    // 404 Handler
    this.app.use((req, res, next) => {
      res.status(404).json({
        success: false,
        error: "Endpoint nicht gefunden",
        path: req.path
      });
    });

    // Error Handler
    this.app.use(errorHandler);
  }

  start() {
    this.app.listen(this.config.port, () => {
      console.log(`🚀 Connection-Key Server läuft auf Port ${this.config.port}`);
      console.log(`📡 Health Check: http://localhost:${this.config.port}/health`);
      console.log(`💬 API Base: http://localhost:${this.config.port}/api`);
      console.log(`🔐 Authentication: ${this.config.enableAuth ? "Aktiviert" : "Deaktiviert"}`);
    });
  }
}

// Server starten, wenn direkt ausgeführt
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new ConnectionKeyServer();
  server.start();
}

