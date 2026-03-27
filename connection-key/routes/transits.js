import express from "express";
import { getCurrentTransits } from "../utils/transit-calculator.js";

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

export default router;
