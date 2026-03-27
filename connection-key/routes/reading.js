import express from "express";
import axios from "axios";
import { config } from "../config.js";
import { validateReadingRequest } from "../middleware/validation.js";

const router = express.Router();
const READING_AGENT_URL = config.readingAgent.url;

// Supabase Client
let supabase = null;
try {
  const supabaseModule = await import("../config-with-supabase.js");
  supabase = supabaseModule.supabase;
} catch (error) {
  console.warn("⚠️  Supabase nicht verfügbar in reading.js");
}

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

    if (!supabase) {
      return res.status(503).json({ success: false, error: "Datenbank nicht verfügbar" });
    }

    const { data, error } = await supabase
      .from("coach_readings_v3")
      .select("*, coach_readings_v3_edits(*)")
      .eq("reading_id", readingId)
      .single();

    if (error) {
      return res.status(404).json({ success: false, error: "Reading nicht gefunden" });
    }

    res.json({ success: true, reading: data });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/reading/:readingId
 * Bearbeitet ein Reading (Coach-Edit)
 */
router.patch("/:readingId", async (req, res, next) => {
  try {
    const { readingId } = req.params;
    const { edited_text, additional_notes, coach_id } = req.body;

    if (!edited_text && !additional_notes) {
      return res.status(400).json({ success: false, error: "edited_text oder additional_notes erforderlich" });
    }

    if (!supabase) {
      return res.status(503).json({ success: false, error: "Datenbank nicht verfügbar" });
    }

    // Upsert: bestehenden Edit aktualisieren oder neu anlegen
    const { data, error } = await supabase
      .from("coach_readings_v3_edits")
      .upsert(
        {
          reading_id: readingId,
          coach_id: coach_id || null,
          edited_text: edited_text || "",
          additional_notes: additional_notes || "",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "reading_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("[PATCH reading] Supabase-Fehler:", error);
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, edit: data });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/reading/:readingId/answers
 * Speichert Client-Antworten auf Reflexionsfragen
 */
router.post("/:readingId/answers", async (req, res, next) => {
  try {
    const { readingId } = req.params;
    const { answers, user_id } = req.body;

    // answers = [{ question: "...", answer: "..." }, ...]
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, error: "answers (Array) erforderlich" });
    }

    if (!supabase) {
      return res.status(503).json({ success: false, error: "Datenbank nicht verfügbar" });
    }

    const rows = answers.map(({ question, answer }) => ({
      reading_id: readingId,
      user_id: user_id || null,
      question,
      answer,
    }));

    const { data, error } = await supabase
      .from("reflection_answers")
      .insert(rows)
      .select();

    if (error) {
      console.error("[POST answers] Supabase-Fehler:", error);
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, saved: data.length });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reading/:readingId/answers
 * Holt alle Antworten zu einem Reading (für Coach-Dashboard)
 */
router.get("/:readingId/answers", async (req, res, next) => {
  try {
    const { readingId } = req.params;

    if (!supabase) {
      return res.status(503).json({ success: false, error: "Datenbank nicht verfügbar" });
    }

    const { data, error } = await supabase
      .from("reflection_answers")
      .select("*")
      .eq("reading_id", readingId)
      .order("created_at", { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, answers: data });
  } catch (error) {
    next(error);
  }
});

export { router as readingRouter };

