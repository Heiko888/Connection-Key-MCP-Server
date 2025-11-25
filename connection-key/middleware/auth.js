/**
 * Authentication Middleware
 * 
 * Unterstützt:
 * - API Key Authentication
 * - JWT Tokens (optional)
 */

import { config } from "../config.js";

export const authMiddleware = (req, res, next) => {
  // Wenn Auth deaktiviert, weiterleiten
  if (!config.auth.enabled) {
    return next();
  }

  // API Key aus Header oder Query holen
  const apiKey = req.headers["x-api-key"] || req.headers["authorization"]?.replace("Bearer ", "") || req.query.apiKey;

  // Wenn API Key in Config gesetzt ist, prüfen
  if (config.auth.apiKey) {
    if (!apiKey || apiKey !== config.auth.apiKey) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Ungültiger oder fehlender API Key"
      });
    }
  }

  // JWT Token prüfen (wenn vorhanden)
  // TODO: JWT Implementation hinzufügen

  // User-ID aus Token oder Header extrahieren
  req.userId = req.headers["x-user-id"] || req.query.userId || "anonymous";

  next();
};

