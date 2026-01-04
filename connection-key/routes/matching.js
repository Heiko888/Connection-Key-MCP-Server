import express from "express";
import axios from "axios";
import { config } from "../config.js";
import { validateMatchingRequest } from "../middleware/validation.js";

const router = express.Router();
const READING_AGENT_URL = config.readingAgent.url;

/**
 * POST /api/matching
 * Führt Partner-Matching durch
 */
router.post("/", validateMatchingRequest, async (req, res, next) => {
  try {
    const { userId1, userId2, user1Chart, user2Chart, matchingType } = req.body;

    // Option 1: Über ChatGPT-Agent (empfohlen)
    if (req.query.method === "agent" || !req.query.method) {
      const message = `Führe ein Partner-Matching durch zwischen User ${userId1 || "1"} und User ${userId2 || "2"}. ${matchingType ? `Art: ${matchingType}` : ""}`;

      const response = await axios.post(
        `${READING_AGENT_URL}/chat`,
        {
          userId: userId1 || "matching-user",
          message,
          context: {
            userId1,
            userId2,
            user1Chart,
            user2Chart,
            matchingType: matchingType || "full"
          }
        },
        {
          timeout: config.readingAgent.timeout
        }
      );

      return res.json({
        success: true,
        method: "agent",
        ...response.data
      });
    }

    // Option 2: Direkt über Agent-API
    const response = await axios.post(
      `${READING_AGENT_URL}/matching`,
      {
        userId1,
        userId2,
        user1Chart,
        user2Chart
      },
      {
        timeout: config.readingAgent.timeout
      }
    );

    res.json({
      success: true,
      method: "direct",
      ...response.data
    });
  } catch (error) {
    if (error.response) {
      res.status(error.response.status || 500).json({
        success: false,
        error: error.response.data?.error || error.message
      });
    } else if (error.request) {
      res.status(503).json({
        success: false,
        error: "Reading Agent nicht erreichbar"
      });
    } else {
      next(error);
    }
  }
});

/**
 * GET /api/matching/:matchId
 * Holt Matching-Ergebnisse anhand der ID
 */
router.get("/:matchId", async (req, res, next) => {
  try {
    const { matchId } = req.params;

    // Hier würde normalerweise die Datenbank abgefragt
    res.json({
      success: true,
      matchId,
      message: "Matching-Endpoint - Datenbank-Integration erforderlich"
    });
  } catch (error) {
    next(error);
  }
});

export { router as matchingRouter };

