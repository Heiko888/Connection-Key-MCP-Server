/**
 * Authentication Middleware
 *
 * Unterstützt:
 * 1. API Key — x-api-key Header (interne Services: .167, n8n, reading-worker)
 * 2. Supabase JWT — Authorization: Bearer <token> (Coach-Frontend User-Sessions)
 */

import { config } from "../config.js";
import { createClient } from "@supabase/supabase-js";

// Supabase-Client für JWT-Verifikation (lazy init)
let _supabase = null;
function getSupabase() {
  if (!_supabase && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    _supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  }
  return _supabase;
}

export const authMiddleware = async (req, res, next) => {
  if (!config.auth.enabled) return next();

  const apiKey = req.headers["x-api-key"];
  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  // 1. API-Key prüfen (interne Services)
  if (apiKey) {
    if (apiKey === config.auth.apiKey) {
      req.userId = req.headers["x-user-id"] || "internal";
      req.authMethod = "api-key";
      return next();
    }
    return res.status(401).json({ success: false, error: "Ungültiger API Key" });
  }

  // 2. Supabase JWT prüfen (Frontend-User)
  if (bearerToken) {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(bearerToken);
        if (user && !error) {
          req.userId = user.id;
          req.userEmail = user.email;
          req.authMethod = "supabase-jwt";
          return next();
        }
      } catch (e) {
        console.warn("[Auth] Supabase JWT-Fehler:", e.message);
      }
    }
    return res.status(401).json({ success: false, error: "Ungültiger oder abgelaufener Token" });
  }

  // 3. Query-Parameter API Key (Legacy-Support)
  if (req.query.apiKey && req.query.apiKey === config.auth.apiKey) {
    req.userId = "anonymous";
    req.authMethod = "query-key";
    return next();
  }

  return res.status(401).json({
    success: false,
    error: "Unauthorized",
    message: "x-api-key Header oder Authorization Bearer Token erforderlich",
  });
};
