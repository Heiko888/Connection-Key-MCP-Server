import express from "express";
import { createClient } from "@supabase/supabase-js";
import { getCurrentTransits, getTransitsForYear, getTransitsForMonth } from "../utils/transit-calculator.js";
import { calculateHumanDesignChart } from "../lib/astro/chartCalculation.js";

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// In-Memory Cache: { date -> { data, cachedAt } }
const todayCache = new Map();

function getMoonPhase(date) {
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const lunarCycle = 29.53058867;
  const daysSince = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
  const phase = ((daysSince % lunarCycle) + lunarCycle) % lunarCycle;
  if (phase < 1.85)  return 'Neumond';
  if (phase < 7.38)  return 'Zunehmende Sichel';
  if (phase < 9.22)  return 'Erstes Viertel';
  if (phase < 14.76) return 'Zunehmender Mond';
  if (phase < 16.61) return 'Vollmond';
  if (phase < 22.15) return 'Abnehmender Mond';
  if (phase < 24.00) return 'Letztes Viertel';
  return 'Abnehmende Sichel';
}

function planetMap(personalityPlanets) {
  const m = {};
  for (const p of personalityPlanets) m[p.planet] = { gate: p.gate, line: p.line };
  return m;
}

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

/**
 * GET /api/transits/today
 * Vollständiger Transit-Chart für heute (oder ?date=YYYY-MM-DD).
 * Nutzt calculateHumanDesignChart für Channels + Centers.
 * Speichert automatisch in daily_transits (Upsert).
 * Cache: 1 Stunde.
 */
router.get("/today", async (req, res) => {
  const now = new Date();
  const dateStr = req.query.date || now.toISOString().split('T')[0];
  const cacheKey = dateStr;
  const cached = todayCache.get(cacheKey);
  if (cached && (Date.now() - cached.cachedAt) < 3_600_000) {
    return res.json({ ...cached.data, cached: true });
  }

  try {
    // Für präzise Mond-Position: aktuelle Uhrzeit nutzen
    const timeStr = req.query.date
      ? '12:00'
      : `${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')}`;

    const chart = await calculateHumanDesignChart({
      birthDate: dateStr,
      birthTime: timeStr,
      birthPlace: 'London',
    });

    const pm = planetMap(chart.personalityPlanets);

    const transit = {
      date: dateStr,
      sun:       pm['sun']        || null,
      earth:     pm['earth']      || null,
      moon:      pm['moon']       || null,
      northNode: pm['north-node'] || null,
      southNode: pm['south-node'] || null,
      mercury:   pm['mercury']    || null,
      venus:     pm['venus']      || null,
      mars:      pm['mars']       || null,
      jupiter:   pm['jupiter']    || null,
      saturn:    pm['saturn']     || null,
      uranus:    pm['uranus']     || null,
      neptune:   pm['neptune']    || null,
      pluto:     pm['pluto']      || null,
      allPlanets: chart.personalityPlanets,
      activeChannels: (chart.channels || []).map(c => c.name || c.gates?.join('-')),
      definedCenters: Object.entries(chart.centers || {}).filter(([,v]) => v).map(([k]) => k),
      cross: chart.incarnationCross || null,
      moonPhase: getMoonPhase(now),
    };

    // Supabase Upsert
    if (supabase) {
      const row = {
        date: dateStr,
        sun_gate: transit.sun?.gate,
        sun_line: transit.sun?.line,
        earth_gate: transit.earth?.gate,
        earth_line: transit.earth?.line,
        moon_gate: transit.moon?.gate,
        moon_line: transit.moon?.line,
        north_node_gate: transit.northNode?.gate,
        north_node_line: transit.northNode?.line,
        all_planets: transit.allPlanets,
        active_channels: transit.activeChannels,
        defined_centers: transit.definedCenters,
        cross_data: transit.cross,
        moon_phase: transit.moonPhase,
        updated_at: new Date().toISOString(),
      };
      supabase.from('daily_transits').upsert(row, { onConflict: 'date' })
        .then(({ error }) => { if (error) console.warn('[Transits/Today] Supabase upsert:', error.message); });
    }

    todayCache.set(cacheKey, { data: transit, cachedAt: Date.now() });
    res.json({ ...transit, cached: false });
  } catch (err) {
    console.error('[Transits/Today] Fehler:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/transits/month/:year/:month
 * Tägliche Planeten-Snapshots für einen Monat (Sonne, Mond, Erde, Merkur, Mars + Mondphase).
 * Optimiert für Kalender-Darstellung.
 */
router.get("/month/:year/:month", (req, res) => {
  const year  = parseInt(req.params.year,  10);
  const month = parseInt(req.params.month, 10);
  if (isNaN(year) || year < 1900 || year > 2100) {
    return res.status(400).json({ success: false, error: "Ungültiges Jahr (1900–2100)" });
  }
  if (isNaN(month) || month < 1 || month > 12) {
    return res.status(400).json({ success: false, error: "Ungültiger Monat (1–12)" });
  }
  try {
    const days = getTransitsForMonth(year, month);
    res.json({ success: true, year, month, days });
  } catch (err) {
    console.error("[Transits/Month] Fehler:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
