import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { chatRouter } from "./routes/chat.js";
import { readingRouter } from "./routes/reading.js";
import { stripeRouter } from "./routes/stripe.js";
import { matchingRouter } from "./routes/matching.js";
import { userRouter } from "./routes/user.js";
import chartRouter from "./routes/chart.js";
import liveReadingRouter from "./routes/live-reading.js";
import shadowWorkRouter from "./routes/shadow-work.js";
import transitRouter from "./routes/transit.js";
import jahresReadingRouter from "./routes/jahres-reading.js";
import relationshipRouter from "./routes/relationship.js";
import careerRouter from "./routes/career.js";
import healthReadingRouter from "./routes/health-reading.js";
import emotionsRouter from "./routes/emotions.js";
import tagesimpulsRouter from "./routes/tagesimpuls.js";
import telegramRouter from "./routes/telegram.js";
import impulseImageRouter from "./routes/impulse-image.js";
import impulseDispatchRouter from "./routes/impulse-dispatch.js";
import transitsRouter from "./routes/transits.js";
import genericReadingsRouter from "./routes/readings-generic.js";
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
      readingAgentUrl: options.readingAgentUrl || config.readingAgent.url,
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

    // Stripe Webhook benötigt raw body
    this.app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

    // Body Parser für alle anderen Routes
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
          chart: "POST /api/chart/calculate (NEW)",
          matching: "POST /api/matching",
          stripe_webhook: "POST /api/stripe/webhook (public)",
          stripe_checkout: "POST /api/stripe/create-checkout-session",
          user: "GET /api/user/:userId"
        }
      });
    });

    // Stripe Webhook Route (PUBLIC - ohne Auth, da Stripe Signature prüft)
    const stripeWebhookRouter = express.Router();
    stripeWebhookRouter.use(stripeRouter);
    this.app.use("/api/stripe", stripeWebhookRouter);

    // API Routes (mit Auth, wenn aktiviert)
    const apiRouter = express.Router();

    if (this.config.enableAuth) {
      apiRouter.use(authMiddleware);
    }

    // Routes registrieren
    apiRouter.use("/chat", chatRouter);
    apiRouter.use("/reading", readingRouter);
    apiRouter.use("/chart", chartRouter);
    apiRouter.use("/charts", chartRouter); // Alias für Frontend-Kompatibilität
    apiRouter.use("/matching", matchingRouter);
    apiRouter.use("/live-reading", liveReadingRouter);
    apiRouter.use("/readings/shadow-work", shadowWorkRouter);
    apiRouter.use("/readings/transit", transitRouter);
    apiRouter.use("/readings/jahres", jahresReadingRouter);
    apiRouter.use("/readings/relationship", relationshipRouter);
    apiRouter.use("/readings/career", careerRouter);
    apiRouter.use("/readings/health", healthReadingRouter);
    apiRouter.use("/readings/emotions", emotionsRouter);
    apiRouter.use("/readings/tagesimpuls", tagesimpulsRouter);
    apiRouter.use("/telegram", telegramRouter);
    apiRouter.use("/impulse", impulseImageRouter);
    apiRouter.use("/impulse", impulseDispatchRouter);
    // Generischer Handler für alle übrigen Reading-Typen (nach spezifischen registrieren!)
    apiRouter.use("/readings", genericReadingsRouter);
    apiRouter.use("/transits", transitsRouter);
    apiRouter.use("/user", userRouter);

    this.app.use("/api", apiRouter);

    // ── Subscriber-Onboarding (Mailchimp/n8n Webhook) ────────────────────────
    // POST /api/new-subscriber
    // Erwartet: { email, firstname, lastname, source, birthdate?, birthtime?, birthplace? }
    this.app.post("/api/new-subscriber", async (req, res) => {
      const { email, firstname, lastname, source, birthdate, birthtime, birthplace } = req.body || {};
      if (!email) return res.status(400).json({ success: false, error: 'email erforderlich' });

      try {
        const { createClient } = await import('@supabase/supabase-js');
        const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
        const name = [firstname, lastname].filter(Boolean).join(' ') || email.split('@')[0];

        // Profil anlegen / aktualisieren
        await sb.from('profiles').upsert({
          email,
          full_name: name,
          source: source || 'mailchimp',
          subscribed_at: new Date().toISOString(),
          ...(birthdate && { birth_date: birthdate }),
          ...(birthtime && { birth_time: birthtime }),
          ...(birthplace && { birth_place: birthplace }),
        }, { onConflict: 'email' });

        // Welcome-Reading wenn Geburtsdaten vorhanden
        if (birthdate && birthplace) {
          const readingWorker = process.env.READING_AGENT_URL || 'http://reading-worker:4000';
          fetch(`${readingWorker}/api/readings/generic`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reading_type: 'basic',
              name,
              birthdate,
              birthtime: birthtime || '12:00',
              birthplace,
              auto_generated: true,
            }),
          }).catch(e => console.warn('[new-subscriber] Reading-Trigger Fehler:', e.message));
        }

        // Mattermost-Benachrichtigung
        const mmUrl = process.env.MATTERMOST_WEBHOOK_READINGS || process.env.MATTERMOST_WEBHOOK_URL;
        if (mmUrl) {
          fetch(mmUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: `📧 **Neuer Subscriber** | ${name} | ${email} | Quelle: ${source || 'mailchimp'}` }),
          }).catch(() => {});
        }

        console.log(`[new-subscriber] ${email} (${source || 'mailchimp'}) onboarded`);
        res.json({ success: true, name, email });
      } catch (err) {
        console.error('[new-subscriber] Fehler:', err.message);
        res.status(500).json({ success: false, error: err.message });
      }
    });
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
      console.log(`Connection-Key Server läuft auf Port ${this.config.port}`);
      console.log(`Health Check: http://localhost:${this.config.port}/health`);
      console.log(`API Base: http://localhost:${this.config.port}/api`);
      console.log(`Stripe Webhook (public): http://localhost:${this.config.port}/api/stripe/webhook`);
      console.log(`Authentication: ${this.config.enableAuth ? "Aktiviert" : "Deaktiviert"}`);
    });
  }
}

// Server starten, wenn direkt ausgeführt
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new ConnectionKeyServer();
  server.start();
}
