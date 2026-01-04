/**
 * Connection-Key Server Konfiguration
 */
export const config = {
  // Server Port
  port: process.env.PORT || 3000,

  // Reading Agent URL (production/server.js über PM2)
  readingAgent: {
    url: process.env.READING_AGENT_URL || "http://localhost:4000",
    timeout: parseInt(process.env.READING_AGENT_TIMEOUT || "30000", 10)
  },

  // MCP Server URL (optional, für direkte Aufrufe)
  mcpServer: {
    url: process.env.MCP_SERVER_URL || "http://localhost:7777",
    timeout: parseInt(process.env.MCP_SERVER_TIMEOUT || "30000", 10)
  },

  // n8n URL (optional, für direkte Aufrufe)
  n8n: {
    baseUrl: process.env.N8N_BASE_URL || "http://localhost:5678",
    apiKey: process.env.N8N_API_KEY || ""
  },

  // Authentication
  auth: {
    enabled: process.env.AUTH_ENABLED !== "false", // Standard: true
    apiKey: process.env.API_KEY || process.env.CONNECTION_KEY_API_KEY || "",
    jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h"
  },

  // CORS
  cors: {
    allowedOrigins: process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(",")
      : ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"]
  },

  // Rate Limiting
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED !== "false",
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10), // 1 Minute
    max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10) // 100 Requests pro Minute
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: process.env.LOG_FORMAT || "json"
  }
};

