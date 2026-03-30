import express from "express";
import { buildImpulseHtml, renderHtmlToPng, generateAndStoreImpulseImage } from "../lib/impulseImage.js";

const router = express.Router();

/**
 * POST /api/impulse/generate-image
 *
 * Body:
 *   impulseText   string   — Der fertige Impuls-Text
 *   sunGate       number   — Sonnen-Tor
 *   sunLine       number
 *   sunGateName   string   — z.B. "Zweck"
 *   moonGate      number
 *   moonLine      number
 *   moonGateName  string
 *   date          string   — YYYY-MM-DD
 *   format        string   — "story" (1080×1920, default) | "feed" (1080×1350)
 *   store         boolean  — true = in Supabase Storage speichern + URL zurückgeben
 *                            false (default) = PNG direkt in Response
 */
router.post("/generate-image", async (req, res) => {
  const {
    impulseText, sunGate, sunLine, sunGateName,
    moonGate, moonLine, moonGateName,
    date = new Date().toISOString().split("T")[0],
    format = "story",
    store = false,
  } = req.body || {};

  if (!impulseText) {
    return res.status(400).json({ success: false, error: "impulseText ist erforderlich" });
  }

  try {
    const params = { impulseText, sunGate, sunLine, sunGateName, moonGate, moonLine, moonGateName, date, format };

    if (store) {
      const { buffer, url, fileName } = await generateAndStoreImpulseImage(params);
      return res.json({ success: true, fileName, url });
    } else {
      const width = 1080;
      const height = format === "feed" ? 1350 : 1920;
      const html = buildImpulseHtml(params);
      const buffer = await renderHtmlToPng(html, width, height);
      res.set("Content-Type", "image/png");
      res.set("Content-Disposition", `inline; filename="impulse-${date}-${format}.png"`);
      return res.send(buffer);
    }
  } catch (err) {
    console.error("[ImpulseImage] Fehler:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/impulse/store-image
 * Wie generate-image, aber gibt immer URL zurück (store=true erzwungen).
 */
router.post("/store-image", async (req, res) => {
  const {
    impulseText, sunGate, sunLine, sunGateName,
    moonGate, moonLine, moonGateName,
    date = new Date().toISOString().split("T")[0],
    format = "story",
  } = req.body || {};

  if (!impulseText) {
    return res.status(400).json({ success: false, error: "impulseText ist erforderlich" });
  }

  try {
    const { buffer, url, fileName } = await generateAndStoreImpulseImage({
      impulseText, sunGate, sunLine, sunGateName,
      moonGate, moonLine, moonGateName, date, format,
    });
    return res.json({ success: true, fileName, url });
  } catch (err) {
    console.error("[ImpulseImage] Store-Fehler:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
