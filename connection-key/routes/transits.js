import express from "express";
import { getCurrentTransits, getTransitsForYear } from "../utils/transit-calculator.js";

const router = express.Router();

/**
 * GET /api/transits/current
 * Aktuelle Planetenpositionen als Human Design Gates (1h Cache)
 */
router.get("/current", async (req, res) => {
  try {
    const transits = await getCurrentTransits();
    res.json({
      success: true,
      calculated_at: new Date().toISOString(),
      transits,
    });
  } catch (err) {
    console.error("[Transits] Fehler:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/transits/year/:year
 * Monatliche Planeten-Snapshots für ein ganzes Jahr (12 Einträge).
 * Für Jahres-Readings: gibt Claude den planetaren Jahresverlauf.
 */
router.get("/year/:year", (req, res) => {
  const year = parseInt(req.params.year, 10);
  if (isNaN(year) || year < 1900 || year > 2100) {
    return res.status(400).json({ success: false, error: "Ungültiges Jahr (1900–2100)" });
  }
  try {
    const months = getTransitsForYear(year);
    res.json({ success: true, year, months });
  } catch (err) {
    console.error("[Transits/Year] Fehler:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
