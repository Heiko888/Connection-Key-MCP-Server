/**
 * W11 — Women's-Design Worker
 * Queue: reading-queue-v4-womens-design
 *
 * Weibliches Design / Hormonzyklus-Reading: eine EINZEL-Chart-Analyse (analog
 * Nervous-System), die Human Design mit den vier Zyklusphasen verbindet:
 *   - die 4 inneren Jahreszeiten (Menstruation/Follikel/Ovulation/Luteal)
 *   - Typ-Energie × zyklische Energie (wann Ruhe stimmig ist)
 *   - Autorität über den Zyklus (v.a. emotional/prämenstruell)
 *   - offene Zentren über den Zyklus verstärkt + Not-Self prämenstruell
 *
 * Selbsterkenntnis & Selbstfürsorge — KEINE medizinische Beratung. Pattern bewusst
 * gespiegelt von workers/nervous-system-worker.js:
 *   - eine vom Endpoint angelegte Zeile fortschreiben (kein Doppel-Insert)
 *   - 2 Claude-Calls (strukturiertes JSON + Narrativ)
 *   - parseJSONLoose + Sicherheitsnetz bei leerem JSON → Job failed
 */

import { Worker, Queue } from "bullmq";
import IORedis from "ioredis";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildFactsBlock } from "../lib/facts-builder.js";

// ─── Config ─────────────────────────────────────────────────────────────────

const MODEL = "claude-sonnet-4-6";
const QUEUE_NAME = "reading-queue-v4-womens-design";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = path.join(__dirname, "..", "knowledge", "womens-design");

function loadKnowledge(name) {
  try {
    return fs.readFileSync(path.join(KNOWLEDGE_DIR, `${name}.md`), "utf8");
  } catch (err) {
    console.warn(`   ⚠️ [WomensDesign] Wissensdatei ${name}.md nicht ladbar: ${err.message}`);
    return "";
  }
}

const KNOWLEDGE = loadKnowledge("womens-design-knowledge");

const NOT_SELF_BY_TYPE = {
  "Generator": "Frustration",
  "Manifesting Generator": "Frustration und Wut",
  "Manifestor": "Wut",
  "Projector": "Verbitterung",
  "Reflector": "Enttäuschung",
};
const SIGNATURE_BY_TYPE = {
  "Generator": "Zufriedenheit",
  "Manifesting Generator": "Zufriedenheit",
  "Manifestor": "Frieden",
  "Projector": "Erfolg",
  "Reflector": "Überraschung",
};

const GROUNDING_RULE =
  "WICHTIG: Stütze dich ausschließlich auf die gelieferten Chart-Fakten. Erfinde " +
  "KEINE Tore, Kanäle oder Zentren. Das natale Chart ist KONSTANT. Dies ist " +
  "Selbsterkenntnis- und Selbstfürsorge-Wissen, KEINE medizinische Beratung, " +
  "keine Diagnose, keine Zyklus-/Verhütungsempfehlung — framen wie Selbstfürsorge, " +
  "warm und entlastend. Bei Beschwerden/Schmerzen/Zyklusstörungen/Kinderwunsch auf " +
  "ärztliche/fachliche Begleitung verweisen. Fehlt eine Information, lass sie weg.";

// ─── Clients ──────────────────────────────────────────────────────────────────

function createClients() {
  const redis = new IORedis({
    host: process.env.REDIS_HOST || "redis",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
  });

  const supabaseUrl = process.env.V4_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.V4_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  return { redis, supabase, anthropic };
}

// ─── Supabase Helpers ─────────────────────────────────────────────────────────

async function fetchReadingData(supabase, readingId) {
  const { data, error } = await supabase
    .schema("public")
    .from("readings")
    .select("reading_type, client_name, reading_data, chart_data")
    .eq("id", readingId)
    .single();
  if (error) throw new Error(`Reading ${readingId} nicht gefunden: ${error.message}`);
  const chart = data.reading_data?.chart_data || data.chart_data || {};
  return { ...data, chart };
}

async function updateRecord(supabase, id, fields) {
  const { error } = await supabase
    .schema("public")
    .from("womens_design_readings")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`womens_design_readings UPDATE fehlgeschlagen: ${error.message}`);
}

async function createRecord(supabase, { user_id, reading_id }) {
  const { data, error } = await supabase
    .schema("public")
    .from("womens_design_readings")
    .insert({ user_id: user_id || null, reading_id: reading_id || null, status: "processing", progress: 0 })
    .select("id")
    .single();
  if (error) throw new Error(`womens_design_readings INSERT fehlgeschlagen: ${error.message}`);
  return data.id;
}

// ─── Daten-Aufbereitung ─────────────────────────────────────────────────────

function openCenters(chart) {
  const centers = chart?.centers && typeof chart.centers === "object" ? chart.centers : {};
  const isDefined = (v) => v === true || v === "defined";
  return Object.entries(centers).filter(([, v]) => !isDefined(v)).map(([k]) => k);
}

function definedCenters(chart) {
  const centers = chart?.centers && typeof chart.centers === "object" ? chart.centers : {};
  const isDefined = (v) => v === true || v === "defined";
  return Object.entries(centers).filter(([, v]) => isDefined(v)).map(([k]) => k);
}

function chartFactsBlock(chart) {
  try {
    return buildFactsBlock(chart || {}, { readingType: "detailed" });
  } catch (err) {
    console.warn(`   ⚠️ [WomensDesign] Faktenblock nicht baubar: ${err.message}`);
    return "";
  }
}

function buildCycleBlock(chart) {
  const type = chart?.type || "—";
  const notSelf = chart?.not_self_theme || chart?.notSelfTheme || NOT_SELF_BY_TYPE[type] || "—";
  const signature = SIGNATURE_BY_TYPE[type] || "—";
  const lines = [];
  lines.push("=== ZYKLUS-KONTEXT (deterministisch — Wahrheitsquelle) ===");
  lines.push(`HD-Typ: ${type}`);
  lines.push(`Autorität: ${chart?.authority || "—"} | Strategie: ${chart?.strategy || "—"} | Profil: ${chart?.profile || "—"}`);
  lines.push(`Not-Self (prämenstruell verstärkt): ${notSelf} → Signatur (Stimmigkeit): ${signature}`);
  lines.push(`Offene Zentren (über den Zyklus verstärkt): ${openCenters(chart).join(", ") || "—"}`);
  lines.push(`Definierte Zentren (Stabilität): ${definedCenters(chart).join(", ") || "—"}`);
  lines.push("Innere Jahreszeiten: Winter=Menstruation, Frühling=Follikel, Sommer=Ovulation, Herbst=Luteal");
  lines.push("=== ENDE ZYKLUS-KONTEXT ===");
  return lines.join("\n");
}

// ─── Claude ──────────────────────────────────────────────────────────────────

function parseJSONLoose(raw) {
  try { return JSON.parse(raw); } catch { /* weiter */ }
  const stripped = raw.replace(/```(?:json)?/gi, "").trim();
  try { return JSON.parse(stripped); } catch { /* weiter */ }
  const a = stripped.indexOf("{");
  const b = stripped.lastIndexOf("}");
  if (a >= 0 && b > a) {
    try { return JSON.parse(stripped.slice(a, b + 1)); } catch { /* aufgeben */ }
  }
  return { raw };
}

async function claudeJSON(anthropic, system, user, maxTokens = 8000) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  if (response.stop_reason === "max_tokens") {
    console.warn(`   ⚠️ [WomensDesign] claudeJSON an max_tokens (${maxTokens}) abgeschnitten — JSON evtl. unvollständig.`);
  }
  return parseJSONLoose(response.content[0]?.text || "{}");
}

async function claudeText(anthropic, system, user, maxTokens = 4096) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  return response.content[0]?.text || "";
}

// ─── Job Processor ────────────────────────────────────────────────────────────

async function processJob(job, { supabase, anthropic }) {
  const { user_id, reading_id, womens_design_reading_id: existingId } = job.data;
  console.log(`📥 [WomensDesign] Job ${job.id} | user=${user_id} | reading=${reading_id}`);

  let recordId;
  if (existingId) {
    recordId = existingId;
    await updateRecord(supabase, recordId, { status: "processing", progress: 5 });
    console.log(`   ✅ [WomensDesign] Record wiederverwendet: ${recordId}`);
  } else {
    recordId = await createRecord(supabase, { user_id, reading_id });
    console.log(`   ✅ [WomensDesign] Record erstellt: ${recordId}`);
  }

  try {
    if (!reading_id) {
      throw new Error("reading_id ist erforderlich — das Weibliches-Design-Reading braucht ein Quell-Reading mit Chart.");
    }

    const reading = await fetchReadingData(supabase, reading_id);
    const chart = reading.chart || {};
    if (!chart || !Object.keys(chart).length) {
      throw new Error("Quell-Reading enthält keine Chart-Daten.");
    }
    const type = chart.type || reading.reading_type || null;
    const clientName = reading.client_name || "du";

    await updateRecord(supabase, recordId, { progress: 20 });

    const factsBlock = chartFactsBlock(chart);
    const cycleBlock = buildCycleBlock(chart);

    // Call 1 — strukturierte Analyse als EIN JSON-Objekt.
    console.log("   🧠 [WomensDesign] Call 1: strukturierte Analyse...");
    const analysis = await claudeJSON(
      anthropic,
      `Du bist eine erfahrene Human-Design-Begleiterin mit fundiertem Wissen über den
weiblichen Zyklus (zyklisches Leben, vier innere Jahreszeiten). Du verbindest das
Chart eines Menschen mit seinem Zyklus. Antworte ausschließlich auf Deutsch und NUR
mit einem validen JSON-Objekt (kein Markdown, keine Erklärungen davor/danach).
${GROUNDING_RULE}

=== FACHWISSEN WEIBLICHES DESIGN & ZYKLUS ===
${KNOWLEDGE}`,
      `${factsBlock}

${cycleBlock}

Erstelle die Weibliches-Design-/Zyklus-Analyse als EIN JSON-Objekt mit EXAKT
dieser Struktur (halte jeden String knapp, Arrays max. so lang wie angegeben):
{
  "cycle_alignment_score": <0-100, ganzzahlig, gemäß Bewertungs-Rahmen — Momentaufnahme, im narrative begründet>,
  "baseline_pattern": "<Kernmuster im Umgang mit Energie/Zyklus, 1 Satz>",
  "cycle_phases": [
    // GENAU diese 4 Einträge, in dieser Reihenfolge:
    { "phase": "Menstruation (innerer Winter)", "energy": "<Energie/Stimmung>", "for_this_design": "<was DIESER Typ/diese Autorität hier braucht>", "practice": "<eine konkrete Praxis>" },
    { "phase": "Follikelphase (innerer Frühling)", "energy": "...", "for_this_design": "...", "practice": "..." },
    { "phase": "Ovulation (innerer Sommer)", "energy": "...", "for_this_design": "...", "practice": "..." },
    { "phase": "Lutealphase (innerer Herbst)", "energy": "...", "for_this_design": "...", "practice": "..." }
  ],
  "type_rhythm": {
    "type": "<HD-Typ>",
    "strategy": "<Strategie>",
    "insight": "<wie die Typ-Energie mit dem Zyklus zusammenspielt>",
    "rest_permission": "<wann Ruhe/leiseres Ja stimmig ist, statt Faulheit>"
  },
  "authority_in_cycle": {
    "authority": "<Autorität>",
    "shift": "<wie sich die Autoritäts-Stimme über den Zyklus verändert>",
    "decision_timing": "<wann Entscheidungen gut/schlecht sind, v.a. prämenstruell>"
  },
  "center_amplification": [
    // genau die OFFENEN Zentren der Person, je Eintrag:
    { "center": "<Zentrum>", "cycle_effect": "<wie es über den Zyklus verstärkt wird>", "phase_peak": "<in welcher Phase am stärksten>", "support": "<ein konkreter Reset>" }
  ],
  "not_self_amplified": {
    "not_self_theme": "<Not-Self>",
    "signature": "<Signatur>",
    "premenstrual_signal": "<was die prämenstruelle Verstärkung dieses Menschen sichtbar macht>",
    "reframe": "<entlastende Deutung statt Selbstkritik>"
  },
  "selfcare_practices": [
    { "phase": "<innere Jahreszeit>", "title": "<kurzer Titel>", "how": "<konkrete Selbstfürsorge>" }
    // max 6, über die Phasen verteilt
  ],
  "insights": {
    "summary": "<2-3 Sätze Kernaussage>",
    "strengths": ["<max 3 Ressourcen/Stärken>"],
    "watch_outs": ["<max 3 wiederkehrende Fallen>"]
  }
}`,
      8000
    );

    const coreKeys = ["cycle_alignment_score", "cycle_phases", "type_rhythm", "authority_in_cycle"];
    const present = coreKeys.filter((k) => analysis[k] !== undefined).length;
    if (present === 0) {
      throw new Error("Analyse-Call lieferte kein verwertbares JSON (Kernfelder fehlen)");
    }

    await updateRecord(supabase, recordId, { progress: 60 });

    // Call 2 — warmes Narrativ (Markdown).
    console.log("   🧠 [WomensDesign] Call 2: Narrativ...");
    const notSelf = chart?.not_self_theme || chart?.notSelfTheme || NOT_SELF_BY_TYPE[type] || "Not-Self";
    const signature = SIGNATURE_BY_TYPE[type] || "Signatur";
    const narrative = await claudeText(
      anthropic,
      `Du bist eine einfühlsame Human-Design-Begleiterin. Schreibe warm, ermächtigend
und entlastend auf Deutsch (Du-Form). Der Zyklus ist keine Schwäche, sondern eine
zusätzliche Intelligenz — keine Leistungssprache, keine Scham. Erkläre Begriffe
knapp. Antworte mit formatiertem Markdown.
${GROUNDING_RULE}`,
      `Name: ${clientName}
HD-Typ: ${type || "—"}

Strukturierte Zyklus-Analyse (Wahrheitsquelle für deinen Text — nichts hinzufügen):
${JSON.stringify(analysis)}

Schreibe einen integrierten Bericht (900-1500 Wörter) in dieser Struktur:
## Dein Design im Rhythmus deines Zyklus
### Deine vier inneren Jahreszeiten
### Dein Typ und das Recht auf Ruhe
### Deine Autorität über den Zyklus
### Wenn ${notSelf} prämenstruell lauter wird
### Deine Selbstfürsorge-Anker`,
      4096
    );

    await updateRecord(supabase, recordId, {
      cycle_alignment_score: Math.round(Number(analysis.cycle_alignment_score) || 0),
      baseline_pattern: analysis.baseline_pattern || null,
      cycle_phases: analysis.cycle_phases || [],
      type_rhythm: analysis.type_rhythm || {},
      authority_in_cycle: analysis.authority_in_cycle || {},
      center_amplification: analysis.center_amplification || [],
      not_self_amplified: analysis.not_self_amplified || {},
      selfcare_practices: analysis.selfcare_practices || [],
      insights: analysis.insights || {},
      narrative,
      metadata: { type, reading_id, client_name: clientName, open_centers: openCenters(chart) },
      model: MODEL,
      status: "completed",
      progress: 100,
      completed_at: new Date().toISOString(),
    });

    console.log(`   ✅ [WomensDesign] Job ${job.id} abgeschlossen (score=${analysis.cycle_alignment_score})`);
    return { womens_design_reading_id: recordId, status: "completed" };

  } catch (err) {
    console.error(`   ❌ [WomensDesign] Job ${job.id} fehlgeschlagen:`, err.message);
    await updateRecord(supabase, recordId, { status: "failed", error_message: err.message });
    throw err;
  }
}

// ─── Queue Export ─────────────────────────────────────────────────────────────

let womensDesignQueue = null;

export function getWomensDesignQueue() {
  return womensDesignQueue;
}

export function startWomensDesignWorker() {
  const { redis, supabase, anthropic } = createClients();

  womensDesignQueue = new Queue(QUEUE_NAME, { connection: redis });

  const worker = new Worker(
    QUEUE_NAME,
    (job) => processJob(job, { supabase, anthropic }),
    {
      connection: redis,
      concurrency: 2,
      settings: { maxStalledCount: 1 },
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`❌ [WomensDesign] Job failed: ${job?.id}`, err.message);
  });

  console.log(`🟢 Women's-Design Worker aktiv (Queue: ${QUEUE_NAME})`);
  return { worker, queue: womensDesignQueue };
}
