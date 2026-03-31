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
        // Objekt-Format (personality.planets.sun etc.)
        personality: chart.personality,
        design: chart.design,
        // Array-Format (Backward-Kompatibilität)
        personalityPlanets: chart.personalityPlanets,
        designPlanets: chart.designPlanets,
        createdAt: chartData?.created_at
      },
      source: "swiss-ephemeris",
      version: "2.0.0"
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

const HD_CHANNELS = [
  [1,8],[2,14],[3,60],[4,63],[5,15],[6,59],[7,31],[9,52],[10,20],[10,57],
  [11,56],[12,22],[13,33],[16,48],[17,62],[18,58],[19,49],[20,34],[20,57],
  [21,45],[23,43],[24,61],[25,51],[26,44],[27,50],[28,38],[29,46],[30,41],
  [32,54],[34,57],[35,36],[37,40],[39,55],[42,53],[47,64],
];

const GATE_CENTER = {
  1:'g',2:'g',3:'sacral',4:'ajna',5:'sacral',6:'emotional',7:'g',8:'throat',
  9:'sacral',10:'g',11:'ajna',12:'throat',13:'g',14:'sacral',15:'g',16:'throat',
  17:'ajna',18:'spleen',19:'root',20:'throat',21:'heart',22:'emotional',23:'throat',
  24:'ajna',25:'g',26:'heart',27:'spleen',28:'spleen',29:'sacral',30:'emotional',
  31:'throat',32:'spleen',33:'throat',34:'sacral',35:'throat',36:'emotional',
  37:'emotional',38:'root',39:'root',40:'heart',41:'root',42:'sacral',43:'ajna',
  44:'spleen',45:'throat',46:'g',47:'ajna',48:'spleen',49:'emotional',50:'spleen',
  51:'heart',52:'root',53:'root',54:'root',55:'emotional',56:'throat',57:'spleen',
  58:'root',59:'sacral',60:'root',61:'head',62:'throat',63:'head',64:'head',
};

router.post('/composite', async (req, res) => {
  try {
    const { persons } = req.body;
    if (!persons || persons.length < 2) {
      return res.status(400).json({ success: false, error: 'Mindestens 2 Personen erforderlich' });
    }

    const results = await Promise.all(persons.map(p =>
      calculateHumanDesignChart({
        birthDate: p.date || p.birthDate,
        birthTime: p.time || p.birthTime,
        birthPlace: p.coords || p.birthPlace || p.location,
      })
    ));

    const gateNumbers = results.map(r => (r.gates || []).map(g => typeof g === 'object' ? g.number : g));
    const gateSets = gateNumbers.map(arr => new Set(arr));
    const allGates = [...new Set(gateNumbers.flat())];
    const compositeChannels = [];
    const connections = { electromagnetic: [], dominance: [], companionship: [], compromise: [] };

    for (const [gA, gB] of HD_CHANNELS) {
      const hasA = gateSets.map(s => s.has(gA));
      const hasB = gateSets.map(s => s.has(gB));
      if (!hasA.some(Boolean) && !hasB.some(Boolean)) continue;

      const channelKey = `${gA}-${gB}`;

      for (let i = 0; i < persons.length; i++) {
        for (let j = i + 1; j < persons.length; j++) {
          if ((hasA[i] && hasB[j]) || (hasB[i] && hasA[j])) {
            connections.electromagnetic.push({ channel: channelKey, persons: [i, j] });
            if (!compositeChannels.includes(channelKey)) compositeChannels.push(channelKey);
          }
        }
      }

      for (let i = 0; i < persons.length; i++) {
        if (hasA[i] && hasB[i]) {
          if (!compositeChannels.includes(channelKey)) compositeChannels.push(channelKey);
          for (let j = 0; j < persons.length; j++) {
            if (i !== j && (hasA[j] || hasB[j]) && !(hasA[j] && hasB[j])) {
              connections.dominance.push({ channel: channelKey, dominant: i, other: j });
            }
          }
          const othersHaveNone = gateSets.every((_, j) => i === j || (!hasA[j] && !hasB[j]));
          if (othersHaveNone) connections.companionship.push({ channel: channelKey, person: i });
        }
      }

      const aCount = hasA.filter(Boolean).length;
      const bCount = hasB.filter(Boolean).length;
      if ((aCount > 1 || bCount > 1) && !compositeChannels.includes(channelKey)) {
        connections.compromise.push({ channel: channelKey });
      }
    }

    const compositeCenters = {};
    const allCenter = new Set(allGates.map(g => GATE_CENTER[g]).filter(Boolean));
    for (const c of allCenter) compositeCenters[c] = true;
    const allGatesWithNames = allGates.map(num => {
      const found = results.flatMap(r => r.gates || []).find(g => (typeof g === 'object' ? g.number : g) === num);
      return found || { number: num, name: `Gate ${num}` };
    });

    res.json({
      success: true,
      persons: results,
      composite: { gates: allGatesWithNames, channels: compositeChannels, centers: compositeCenters, connections },
    });
  } catch (err) {
    console.error('[composite]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
