/**
 * reading-pipeline.js
 * Validation & Correction Pipeline for Human Design Readings
 *
 * Exports:
 *   validateReading(readingText, chartData)  → ValidationResult
 *   correctReading(readingText, chartData, validationResult) → string
 *   runReadingPipeline(rawText, chartData)   → { text, validated, corrected, errorCount, errors }
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// ── Konfiguration ─────────────────────────────────────────────────────────────
const TEMPLATE_PATH = process.env.TEMPLATE_PATH || "/app/templates";
const PIPELINE_MODEL = "claude-sonnet-4-6";
// Validator gibt nur eine kleine JSON-Antwort zurück → 120s reichen.
// Korrektur schreibt das gesamte Reading neu (oft 50k+ Zeichen) → braucht mehr.
const VALIDATOR_TIMEOUT_MS = parseInt(process.env.VALIDATOR_TIMEOUT_MS || "120000", 10);
const CORRECTOR_TIMEOUT_MS = parseInt(process.env.CORRECTOR_TIMEOUT_MS || "300000", 10);
// Legacy-Konstante — wird wo immer möglich durch die rolle-spezifischen ersetzt.
const PIPELINE_TIMEOUT_MS = VALIDATOR_TIMEOUT_MS;

// Minimale Textlänge: Korrekturtext muss mind. 50% des Originals haben
const MIN_CORRECTION_RATIO = 0.5;

// Baustein 8 (Monitoring): Jedes N-te Reading wird in die Review-Queue geschrieben
const REVIEW_SAMPLING_RATE = parseInt(process.env.REVIEW_SAMPLING_RATE || "20", 10);

function chartFingerprint(chartData) {
  if (!chartData) return null;
  try {
    const gates = (chartData.gates || [])
      .map(g => typeof g === 'object' ? g.number : g)
      .filter(Boolean)
      .sort((a, b) => a - b);
    const norm = {
      type: chartData.type,
      profile: chartData.profile,
      authority: chartData.authority,
      gates,
      centers: chartData.centers || {},
    };
    return crypto.createHash('sha256').update(JSON.stringify(norm)).digest('hex').slice(0, 16);
  } catch { return null; }
}

// Module-Level-Supabase-Client, wird via setPipelineSupabase() einmal gesetzt.
// Minimal-invasiv: bestehende runReadingPipeline()-Callsites brauchen
// nicht angepasst zu werden.
let _pipelineSupabase = null;
export function setPipelineSupabase(client) { _pipelineSupabase = client; }

async function logValidationRun(opts) {
  const supabasePublic = opts.supabasePublic || _pipelineSupabase;
  if (!supabasePublic) return;
  try {
    await supabasePublic
      .from('reading_validation_log')
      .insert({
        reading_id:             opts.readingId || null,
        reading_type:           opts.readingType || null,
        template:               opts.template || null,
        error_count:            opts.errorCount || 0,
        errors:                 opts.errors || [],
        correction_applied:     opts.correctionApplied || false,
        pre_correction_length:  opts.preLength ?? null,
        post_correction_length: opts.postLength ?? null,
        chart_fingerprint:      opts.chartFingerprint || null,
        model_used:             opts.model || PIPELINE_MODEL,
        duration_ms:            opts.durationMs || null,
        strict_mode:            opts.strictMode ?? null,
        sampled_for_review:     opts.sampledForReview || false,
      });
  } catch (e) {
    console.warn('[Pipeline] Validation-Log Insert fehlgeschlagen:', e.message);
  }
}

// ── Anthropic Client ──────────────────────────────────────────────────────────
let anthropic = null;
try {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  if (apiKey) {
    anthropic = new Anthropic({ apiKey });
    console.log("[Pipeline] Anthropic Client initialisiert");
  } else {
    console.warn("[Pipeline] ANTHROPIC_API_KEY fehlt — Pipeline deaktiviert");
  }
} catch (e) {
  console.warn("[Pipeline] Anthropic SDK Fehler:", e.message);
}

// ── Template laden ────────────────────────────────────────────────────────────
function loadPipelineTemplate(name) {
  const filePath = path.join(TEMPLATE_PATH, `${name}.txt`);
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (e) {
    console.warn(`[Pipeline] Template nicht gefunden: ${filePath}`);
    return null;
  }
}

// ── Chart-Daten für Prompt aufbereiten ───────────────────────────────────────
function formatChartForPrompt(chartData) {
  if (!chartData) return "Keine Chart-Daten verfügbar";

  // Zentren-Namen (Mapping API-Key → Deutsches Label)
  const centerNames = {
    head:           "Kopf",
    ajna:           "Ajna",
    throat:         "Kehle",
    g:              "G-Zentrum",
    heart:          "Herz/Ego",
    spleen:         "Milz",
    "solar-plexus": "Solarplexus",
    sacral:         "Sakral",
    root:           "Wurzel",
  };

  const centerLines = Object.entries(chartData.centers || {}).map(([k, v]) => {
    const label = centerNames[k] || k;
    const status = v ? "DEFINIERT" : "OFFEN";
    return `  ${label}: ${status}`;
  });

  const definedCount = Object.values(chartData.centers || {}).filter(Boolean).length;

  const channelLines = (chartData.channels || []).map(
    (c) => `  ${c.name || c.gates?.join("-")}: Tore ${(c.gates || []).join(" + ")}`
  );

  const gateLines = (chartData.gates || [])
    .slice(0, 40)
    .map((g) => `  Tor ${g.number ?? g}: ${g.name || ""}`);

  // Inkarnationskreuz aus verschiedenen möglichen Feldern lesen
  const cross =
    chartData.incarnationCross?.name ||
    chartData.incarnation_cross?.name ||
    chartData.incarnation_cross ||
    chartData.cross?.name ||
    chartData.cross ||
    "nicht angegeben";

  // Persönlichkeitssonne / -erde / Design-Sonne / Design-Erde
  // Liest aus flachen Feldern (personality_sun.gate) ODER verschachtelten (personality.planets.sun.gate)
  const pSunGate =
    chartData.personality_sun?.gate ??
    chartData.personalitySun?.gate ??
    chartData.personality?.planets?.sun?.gate ??
    null;
  const pEarthGate =
    chartData.personality_earth?.gate ??
    chartData.personalityEarth?.gate ??
    chartData.personality?.planets?.earth?.gate ??
    null;
  const dSunGate =
    chartData.design_sun?.gate ??
    chartData.designSun?.gate ??
    chartData.design?.planets?.sun?.gate ??
    null;
  const dEarthGate =
    chartData.design_earth?.gate ??
    chartData.designEarth?.gate ??
    chartData.design?.planets?.earth?.gate ??
    null;

  const crossGatesLines = [];
  if (pSunGate !== null) crossGatesLines.push(`  Persönlichkeitssonne: Tor ${pSunGate}`);
  if (pEarthGate !== null) crossGatesLines.push(`  Persönlichkeitserde:  Tor ${pEarthGate}`);
  if (dSunGate !== null)  crossGatesLines.push(`  Design-Sonne:         Tor ${dSunGate}`);
  if (dEarthGate !== null) crossGatesLines.push(`  Design-Erde:          Tor ${dEarthGate}`);

  const gender =
    chartData.gender ||
    chartData.person?.gender ||
    chartData.client?.gender ||
    "nicht angegeben";

  return [
    `Typ: ${chartData.type || "unbekannt"}`,
    `Profil: ${chartData.profile || "unbekannt"}`,
    `Autorität: ${chartData.authority || "unbekannt"}`,
    `Strategie: ${chartData.strategy || "unbekannt"}`,
    `Geschlecht: ${gender}`,
    ``,
    `Zentren (${definedCount} von 9 definiert):`,
    ...centerLines,
    ``,
    `Kanäle (${channelLines.length}):`,
    ...(channelLines.length > 0 ? channelLines : ["  keine"]),
    ``,
    `Aktivierte Tore:`,
    ...(gateLines.length > 0 ? gateLines : ["  keine"]),
    ``,
    `Inkarnationskreuz: ${cross}`,
    ...(crossGatesLines.length > 0 ? [
      `Solar- und Erd-Gates (WICHTIG — exakt diese 4 Tore für den Kreuz-Abschnitt verwenden):`,
      ...crossGatesLines,
    ] : []),
    ...(formatPlanetBlock(chartData)),
  ].join("\n");
}

// Planet-Aktivierungen so formatieren, dass der Validator CHECK 8 sie sehen kann.
// Sonst flagged er Modell-Aussagen wie „Uranus Persönlichkeit Tor 44.1" als
// Halluzination, obwohl die Position aus Swiss Ephemeris stammt.
function formatPlanetBlock(chartData) {
  const planetLabel = {
    sun: 'Sonne', earth: 'Erde', moon: 'Mond',
    'north-node': 'Nordknoten', 'south-node': 'Südknoten',
    northNode: 'Nordknoten', southNode: 'Südknoten',
    mercury: 'Merkur', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn',
    uranus: 'Uranus', neptune: 'Neptun', pluto: 'Pluto', chiron: 'Chiron', lilith: 'Lilith',
  };
  const fmt = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return [];
    return arr.map(p => {
      const name = planetLabel[p.planet] || p.planet || '?';
      const line = p.line != null ? `.${p.line}` : '';
      return `  ${name}: Tor ${p.gate ?? '?'}${line}`;
    });
  };
  const pp = fmt(chartData.personalityPlanets || (chartData.personality && chartData.personality.planets) || []);
  const dp = fmt(chartData.designPlanets      || (chartData.design      && chartData.design.planets)      || []);
  const out = [];
  if (pp.length || dp.length) {
    out.push('');
    out.push('Planeten-Aktivierungen (verbindlich — falls Reading eine Planet-Tor-Position nennt, MUSS sie hier stehen):');
  }
  if (pp.length) { out.push('Persönlichkeits-Planeten:'); out.push(...pp); }
  if (dp.length) { out.push('Design-Planeten:'); out.push(...dp); }
  return out;
}

// ── Claude API call (einfach, ohne Continuation-Loop) ────────────────────────
async function callClaude(prompt, maxTokens, temperature = 0, timeoutMs = PIPELINE_TIMEOUT_MS) {
  if (!anthropic) {
    throw new Error("[Pipeline] Anthropic Client nicht verfügbar");
  }

  const apiCall = anthropic.messages.create({
    model: PIPELINE_MODEL,
    max_tokens: maxTokens,
    temperature,
    messages: [{ role: "user", content: prompt }],
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () =>
        reject(
          new Error(`[Pipeline] Claude Timeout nach ${timeoutMs / 1000}s`)
        ),
      timeoutMs
    )
  );

  const response = await Promise.race([apiCall, timeoutPromise]);
  return response.content[0]?.text || "";
}

// ── validateReading ───────────────────────────────────────────────────────────
export async function validateReading(readingText, chartData) {
  const template = loadPipelineTemplate("validate-reading");
  if (!template) {
    throw new Error("[Pipeline] validate-reading.txt nicht gefunden");
  }

  const chartStr = formatChartForPrompt(chartData);
  const prompt = template
    .replace("{{chartData}}", chartStr)
    .replace("{{readingText}}", readingText);

  console.log(
    `[Pipeline] Validierung startet — Reading: ${readingText.length} Zeichen, ` +
    `Chart: ${chartStr.length} Zeichen`
  );

  const rawResult = await callClaude(prompt, 2000, 0, VALIDATOR_TIMEOUT_MS);

  // Markdown-Backticks entfernen (falls Claude sie trotzdem schreibt)
  const cleaned = rawResult
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```\s*$/m, "")
    .trim();

  try {
    const result = JSON.parse(cleaned);
    console.log(
      `[Pipeline] Validierung abgeschlossen — valid=${result.valid}, errors=${result.errorCount}`
    );
    if (result.errors?.length > 0) {
      result.errors.forEach((e, i) =>
        console.log(`[Pipeline]   Fehler ${i + 1}: [${e.check}] ${e.description}`)
      );
    }
    return result;
  } catch (parseErr) {
    console.warn(
      "[Pipeline] JSON-Parse fehlgeschlagen. Rohausgabe:",
      rawResult.substring(0, 300)
    );
    throw new Error(
      `[Pipeline] Validierung lieferte kein valides JSON: ${parseErr.message}`
    );
  }
}

// ── correctReading ────────────────────────────────────────────────────────────
export async function correctReading(readingText, chartData, validationResult) {
  const template = loadPipelineTemplate("correct-reading");
  if (!template) {
    throw new Error("[Pipeline] correct-reading.txt nicht gefunden");
  }

  const chartStr = formatChartForPrompt(chartData);
  const validationStr = JSON.stringify(validationResult, null, 2);

  const prompt = template
    .replace("{{chartData}}", chartStr)
    .replace("{{readingText}}", readingText)
    .replace("{{validationResult}}", validationStr);

  console.log(
    `[Pipeline] Korrektur startet — ${validationResult.errorCount} Fehler, ` +
    `Reading: ${readingText.length} Zeichen, Timeout: ${CORRECTOR_TIMEOUT_MS / 1000}s`
  );

  const corrected = await callClaude(prompt, 16000, 0.3, CORRECTOR_TIMEOUT_MS);

  if (!corrected) {
    throw new Error("[Pipeline] Korrektur lieferte leere Antwort");
  }

  console.log(`[Pipeline] Korrektur abgeschlossen — ${corrected.length} Zeichen`);
  return corrected;
}

// ── runReadingPipeline ────────────────────────────────────────────────────────
/**
 * Führt Validierung und ggf. Korrektur durch.
 * Gibt IMMER einen Text zurück — niemals undefined/null.
 *
 * @param {string}  rawText   - Original-Reading-Text
 * @param {object}  chartData - Chart-Daten (Quelle der Wahrheit)
 * @returns {{ text, validated, corrected, errorCount, errors }}
 */
export async function runReadingPipeline(rawText, chartData, opts = {}) {
  const startedAt = Date.now();
  const fingerprint = chartFingerprint(chartData);
  const sampledForReview = Math.random() * REVIEW_SAMPLING_RATE < 1;

  // Helper für konsistentes Logging
  const logRun = async (info) => logValidationRun({
    ...opts,
    ...info,
    chartFingerprint: fingerprint,
    sampledForReview,
    durationMs: Date.now() - startedAt,
    strictMode: process.env.READING_STRICT_MODE?.toLowerCase() !== 'false',
  });

  // ── Frühe Rückgabe wenn keine Eingabe ────────────────────────────────────
  if (!rawText) {
    console.log("[Pipeline] Übersprungen: kein Reading-Text");
    return { text: rawText, validated: false, corrected: false, errorCount: 0, errors: [] };
  }
  if (!chartData) {
    console.log("[Pipeline] Übersprungen: keine Chart-Daten — keine Validierung möglich");
    return { text: rawText, validated: false, corrected: false, errorCount: 0, errors: [] };
  }
  if (!anthropic) {
    console.log("[Pipeline] Übersprungen: kein Anthropic Client");
    return { text: rawText, validated: false, corrected: false, errorCount: 0, errors: [] };
  }

  // ── 1. Validierung ────────────────────────────────────────────────────────
  let validationResult;
  try {
    validationResult = await validateReading(rawText, chartData);
  } catch (validateErr) {
    console.warn("[Pipeline] Validierung fehlgeschlagen — Fallback auf Original:", validateErr.message);
    await logRun({ errorCount: 0, errors: [], preLength: rawText.length, postLength: rawText.length, correctionApplied: false });
    return {
      text: rawText,
      validated: false,
      corrected: false,
      errorCount: 0,
      errors: [],
      _error: validateErr.message,
    };
  }

  // ── 2. Valide → Original zurückgeben ─────────────────────────────────────
  if (validationResult.valid || validationResult.errorCount === 0) {
    console.log("[Pipeline] Reading valide — keine Korrektur nötig");
    await logRun({ errorCount: 0, errors: [], preLength: rawText.length, postLength: rawText.length, correctionApplied: false });
    return {
      text: rawText,
      validated: true,
      corrected: false,
      errorCount: 0,
      errors: [],
    };
  }

  // ── 3. Fehler gefunden → Korrektur ───────────────────────────────────────
  let correctedText = rawText; // Fallback
  let correctionApplied = false;
  try {
    const candidate = await correctReading(rawText, chartData, validationResult);

    // Sicherheitscheck: Korrektur darf nicht wesentlich kürzer sein als Original
    if (candidate && candidate.length >= rawText.length * MIN_CORRECTION_RATIO) {
      correctedText = candidate;
      correctionApplied = true;
      console.log(
        `[Pipeline] Korrektur akzeptiert — Original: ${rawText.length} Zeichen, ` +
        `Korrigiert: ${correctedText.length} Zeichen`
      );
    } else {
      console.warn(
        `[Pipeline] Korrektur verworfen (zu kurz: ${candidate?.length} vs ${rawText.length}) ` +
        `— Fallback auf Original`
      );
    }
  } catch (correctErr) {
    console.warn("[Pipeline] Korrektur fehlgeschlagen — Fallback auf Original:", correctErr.message);
  }

  const errorCount = validationResult.errorCount || validationResult.errors?.length || 0;
  const errors = validationResult.errors || [];

  await logRun({
    errorCount,
    errors,
    preLength: rawText.length,
    postLength: correctedText.length,
    correctionApplied,
  });

  return {
    text: correctedText,
    validated: true,
    corrected: correctedText !== rawText,
    errorCount,
    errors,
  };
}
