import express from "express";
import { createClient } from "@supabase/supabase-js";
import { calculateHumanDesignChart } from "../lib/astro/chartCalculation.js";

// Supabase optional – nur für Persistenz. Chart-Berechnung funktioniert auch ohne.
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const router = express.Router();

/**
 * POST /api/chart/calculate
 * Berechnet Human Design Chart. Persistiert in Supabase nur wenn userId vorhanden.
 */
router.post("/calculate", async (req, res, next) => {
  try {
    const { userId, birthDate, birthTime, birthPlace } = req.body;

    if (!birthDate || !birthTime || !birthPlace) {
      return res.status(400).json({
        error: "Birth date, time, and place are required",
        details: {
          birthDate: !birthDate ? "missing" : "ok",
          birthTime: !birthTime ? "missing" : "ok",
          birthPlace: !birthPlace ? "missing" : "ok"
        }
      });
    }

    const placeStr = typeof birthPlace === "string" ? birthPlace : (birthPlace?.name || birthPlace?.city || null);
    console.log(`[Chart] Calculating: ${birthDate} ${birthTime} at ${placeStr}`);

    const chart = await calculateHumanDesignChart({
      birthDate,
      birthTime,
      birthPlace: placeStr
    });

    console.log(`[Chart] Result: Type=${chart.type}, Profile=${chart.profile}, Authority=${chart.authority}`);

    let chartData = null;
    if (userId && supabase) {
      try {
        const chartRecord = {
          user_id: userId,
          birth_date: birthDate,
          birth_time: birthTime,
          birth_place: typeof birthPlace === "string" ? { name: birthPlace } : birthPlace,
          chart_data: chart,
          type: chart.type,
          profile: chart.profile,
          authority: chart.authority,
          strategy: chart.strategy,
          definition: chart.definition || null,
          incarnation_cross: chart.incarnationCross || null,
          chart_version: "1.0.0",
          calculation_engine: "astronomy-engine"
        };
        const { data, error } = await supabase.from("charts").insert(chartRecord).select().single();
        if (!error) chartData = data;
      } catch (e) {
        console.warn("[Chart] Supabase persist skipped:", e?.message);
      }
    }

    res.json({
      success: true,
      chartId: chartData?.id || null,
      chart: {
        id: chartData?.id,
        type: chart.type,
        profile: chart.profile,
        authority: chart.authority,
        strategy: chart.strategy,
        definition: chart.definition,
        incarnationCross: chart.incarnationCross,
        gates: chart.gates,
        channels: chart.channels,
        centers: chart.centers,
        createdAt: chartData?.created_at
      },
      source: "astronomy-engine",
      version: "1.0.0"
    });
  } catch (error) {
    console.error("[Chart] Calculation failed:", error?.message);
    next(error);
  }
});

/**
 * GET /api/chart/:chartId
 * Lädt gespeichertes Chart aus Supabase (optional)
 */
router.get("/:chartId", async (req, res, next) => {
  try {
    const { chartId } = req.params;
    if (!supabase) return res.status(503).json({ error: "Supabase not configured" });
    const { data, error } = await supabase.from("charts").select("*").eq("id", chartId).single();
    if (error || !data) return res.status(404).json({ error: "Chart not found" });
    res.json({ success: true, chart: data.chart_data || data });
  } catch (error) {
    next(error);
  }
});

export default router;
