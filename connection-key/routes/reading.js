import express from "express";
import axios from "axios";
import { config } from "../config.js";
import { validateReadingRequest } from "../middleware/validation.js";

const router = express.Router();
const READING_AGENT_URL = config.readingAgent.url;

/**
 * POST /api/reading/generate
 * Generiert ein Human Design Reading
 */
router.post("/generate", validateReadingRequest, async (req, res, next) => {
  try {
    const { userId, birthDate, birthTime, birthPlace, readingType } = req.body;

    // Direkt über Reading Agent API (production/server.js)
    const response = await axios.post(
      `${READING_AGENT_URL}/reading/generate`,
      {
        userId,
        birthDate,
        birthTime,
        birthPlace,
        readingType: readingType || "detailed"
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
 * GET /api/reading/:readingId
 * Holt ein Reading anhand der ID
 */
router.get("/:readingId", async (req, res, next) => {
  try {
    const { readingId } = req.params;
    const { userId } = req.query;

    // Hier würde normalerweise die Datenbank abgefragt
    // Für jetzt: Placeholder
    res.json({
      success: true,
      readingId,
      message: "Reading-Endpoint - Datenbank-Integration erforderlich",
      note: "Dieser Endpoint benötigt eine Datenbank-Integration"
    });
  } catch (error) {
    next(error);
  }
});

export { router as readingRouter };

