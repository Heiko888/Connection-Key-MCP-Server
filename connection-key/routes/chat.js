import express from "express";
import axios from "axios";
import { config } from "../config.js";
import { validateChatRequest } from "../middleware/validation.js";

const router = express.Router();
const CHATGPT_AGENT_URL = config.chatgptAgent.url;

/**
 * POST /api/chat
 * Verarbeitet Chat-Nachrichten vom Nutzer
 */
router.post("/", validateChatRequest, async (req, res, next) => {
  try {
    const { userId, message, context } = req.body;

    // An ChatGPT-Agent weiterleiten
    const response = await axios.post(
      `${CHATGPT_AGENT_URL}/chat`,
      {
        userId,
        message,
        context: context || {}
      },
      {
        timeout: config.chatgptAgent.timeout,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    // Antwort zurückgeben
    res.json({
      success: true,
      ...response.data
    });
  } catch (error) {
    // Fehlerbehandlung
    if (error.response) {
      // ChatGPT-Agent hat Fehler zurückgegeben
      res.status(error.response.status || 500).json({
        success: false,
        error: error.response.data?.error || error.message,
        details: error.response.data
      });
    } else if (error.request) {
      // Keine Antwort vom ChatGPT-Agent
      res.status(503).json({
        success: false,
        error: "ChatGPT-Agent nicht erreichbar",
        message: "Der Agent-Service ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut."
      });
    } else {
      // Anderer Fehler
      next(error);
    }
  }
});

/**
 * GET /api/chat/session/:userId
 * Gibt Session-Informationen zurück
 */
router.get("/session/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    const response = await axios.get(
      `${CHATGPT_AGENT_URL}/session/${userId}`,
      {
        timeout: config.chatgptAgent.timeout
      }
    );

    res.json({
      success: true,
      ...response.data
    });
  } catch (error) {
    if (error.response) {
      res.status(error.response.status || 500).json({
        success: false,
        error: error.response.data?.error || error.message
      });
    } else {
      next(error);
    }
  }
});

/**
 * DELETE /api/chat/session/:userId
 * Löscht eine Session
 */
router.delete("/session/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    const response = await axios.delete(
      `${CHATGPT_AGENT_URL}/session/${userId}`,
      {
        timeout: config.chatgptAgent.timeout
      }
    );

    res.json({
      success: true,
      ...response.data
    });
  } catch (error) {
    if (error.response) {
      res.status(error.response.status || 500).json({
        success: false,
        error: error.response.data?.error || error.message
      });
    } else {
      next(error);
    }
  }
});

export { router as chatRouter };

