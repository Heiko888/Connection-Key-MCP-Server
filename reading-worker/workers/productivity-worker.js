/**
 * W12 — Productivity Worker
 * Queue: reading-queue-v4-productivity
 *
 * Produktivität-ohne-Burnout-Reading: EINZEL-Chart-Analyse (analog Nervous-System),
 * die Typ/Strategie/Autorität + definierte/offene Zentren auf nachhaltige,
 * designgerechte Produktivität und Burnout-Prävention abbildet.
 *
 * Pattern gespiegelt von workers/nervous-system-worker.js (eine Zeile fortschreiben,
 * 2 Claude-Calls JSON+Narrativ, parseJSONLoose + Sicherheitsnetz).
 */

import { Worker, Queue } from "bullmq";
import IORedis from "ioredis";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildFactsBlock } from "../lib/facts-builder.js";

const MODEL = "claude-sonnet-4-6";
const QUEUE_NAME = "reading-queue-v4-productivity";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = path.join(__dirname, "..", "knowledge", "productivity");

function loadKnowledge(name) {
  try {
    return fs.readFileSync(path.join(KNOWLEDGE_DIR, `${name}.md`), "utf8");
  } catch (err) {
    console.warn(`   ⚠️ [Productivity] Wissensdatei ${name}.md nicht ladbar: ${err.message}`);
    return "";
  }
}

const KNOWLEDGE = loadKnowledge("productivity-knowledge");

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
  "KEINE Tore, Kanäle oder Zentren. Das natale Chart ist KONSTANT. Keine Hustle-/" +
  "Leistungssprache — weniger-aber-stimmig schlägt mehr-aber-fremd. Fehlt eine " +
  "Information, lass sie weg, statt sie zu erfinden.";

function createClients() {
  const redis = new IORedis({
    host: process.env.REDIS_HOST || "redis",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
  });
  const supabaseUrl = process.env.V4_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.V4_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return { redis, supabase, anthropic };
}

async function fetchReadingData(supabase, readingId) {
  const { data, error } = await supabase
    .schema("public").from("readings")
    .select("reading_type, client_name, reading_data, chart_data")
    .eq("id", readingId).single();
  if (error) throw new Error(`Reading ${readingId} nicht gefunden: ${error.message}`);
  const chart = data.reading_data?.chart_data || data.chart_data || {};
  return { ...data, chart };
}

async function updateRecord(supabase, id, fields) {
  const { error } = await supabase
    .schema("public").from("productivity_readings")
    .update({ ...fields, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(`productivity_readings UPDATE fehlgeschlagen: ${error.message}`);
}

async function createRecord(supabase, { user_id, reading_id }) {
  const { data, error } = await supabase
    .schema("public").from("productivity_readings")
    .insert({ user_id: user_id || null, reading_id: reading_id || null, status: "processing", progress: 0 })
    .select("id").single();
  if (error) throw new Error(`productivity_readings INSERT fehlgeschlagen: ${error.message}`);
  return data.id;
}

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
  try { return buildFactsBlock(chart || {}, { readingType: "detailed" }); }
  catch (err) { console.warn(`   ⚠️ [Productivity] Faktenblock nicht baubar: ${err.message}`); return ""; }
}

function buildContextBlock(chart) {
  const type = chart?.type || "—";
  const notSelf = chart?.not_self_theme || chart?.notSelfTheme || NOT_SELF_BY_TYPE[type] || "—";
  const signature = SIGNATURE_BY_TYPE[type] || "—";
  return [
    "=== PRODUKTIVITÄTS-KONTEXT (deterministisch — Wahrheitsquelle) ===",
    `HD-Typ: ${type}`,
    `Autorität: ${chart?.authority || "—"} | Strategie: ${chart?.strategy || "—"} | Profil: ${chart?.profile || "—"}`,
    `Not-Self (Burnout-Frühwarnung): ${notSelf} → Signatur (stimmig): ${signature}`,
    `Definierte Zentren (verlässlicher Output): ${definedCenters(chart).join(", ") || "—"}`,
    `Offene Zentren (Energie-Lecks): ${openCenters(chart).join(", ") || "—"}`,
    "=== ENDE PRODUKTIVITÄTS-KONTEXT ===",
  ].join("\n");
}

function parseJSONLoose(raw) {
  try { return JSON.parse(raw); } catch { /* weiter */ }
  const stripped = raw.replace(/```(?:json)?/gi, "").trim();
  try { return JSON.parse(stripped); } catch { /* weiter */ }
  const a = stripped.indexOf("{"); const b = stripped.lastIndexOf("}");
  if (a >= 0 && b > a) { try { return JSON.parse(stripped.slice(a, b + 1)); } catch { /* aufgeben */ } }
  return { raw };
}

async function claudeJSON(anthropic, system, user, maxTokens = 8000) {
  const response = await anthropic.messages.create({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: "user", content: user }] });
  if (response.stop_reason === "max_tokens") console.warn(`   ⚠️ [Productivity] claudeJSON an max_tokens (${maxTokens}) abgeschnitten.`);
  return parseJSONLoose(response.content[0]?.text || "{}");
}
async function claudeText(anthropic, system, user, maxTokens = 4096) {
  const response = await anthropic.messages.create({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: "user", content: user }] });
  return response.content[0]?.text || "";
}

async function processJob(job, { supabase, anthropic }) {
  const { user_id, reading_id, productivity_reading_id: existingId } = job.data;
  console.log(`📥 [Productivity] Job ${job.id} | user=${user_id} | reading=${reading_id}`);

  let recordId;
  if (existingId) {
    recordId = existingId;
    await updateRecord(supabase, recordId, { status: "processing", progress: 5 });
  } else {
    recordId = await createRecord(supabase, { user_id, reading_id });
  }

  try {
    if (!reading_id) throw new Error("reading_id ist erforderlich — Produktivitäts-Reading braucht ein Quell-Reading mit Chart.");
    const reading = await fetchReadingData(supabase, reading_id);
    const chart = reading.chart || {};
    if (!chart || !Object.keys(chart).length) throw new Error("Quell-Reading enthält keine Chart-Daten.");
    const type = chart.type || reading.reading_type || null;
    const clientName = reading.client_name || "du";

    await updateRecord(supabase, recordId, { progress: 20 });
    const factsBlock = chartFactsBlock(chart);
    const contextBlock = buildContextBlock(chart);

    console.log("   🧠 [Productivity] Call 1: strukturierte Analyse...");
    const analysis = await claudeJSON(
      anthropic,
      `Du bist ein Human-Design-Coach für nachhaltige Produktivität & Burnout-Prävention.
Du übersetzt das Chart in einen energie-stimmigen Arbeitsstil. Antworte ausschließlich
auf Deutsch und NUR mit einem validen JSON-Objekt (kein Markdown, nichts davor/danach).
${GROUNDING_RULE}

=== FACHWISSEN PRODUKTIVITÄT OHNE BURNOUT ===
${KNOWLEDGE}`,
      `${factsBlock}

${contextBlock}

Erstelle die Produktivitäts-Analyse als EIN JSON-Objekt mit EXAKT dieser Struktur
(Strings knapp, Arrays max. wie angegeben):
{
  "productivity_score": <0-100, ganzzahlig, gemäß Bewertungs-Rahmen — Momentaufnahme>,
  "work_rhythm": {
    "type": "<HD-Typ>",
    "strategy": "<Strategie>",
    "ideal_rhythm": "<wie dieser Mensch am natürlichsten/nachhaltigsten arbeitet>",
    "rest_pattern": "<wann/wie Pausen & Ruhe stimmig sind>"
  },
  "energy_management": [
    // definierte Zentren als Stärke-Output + offene Zentren als Leck, je Eintrag:
    { "center": "<Zentrum>", "kind": "<definiert|offen>", "effect": "<Output-Stärke ODER Energie-Leck>", "use_or_protect": "<wie nutzen bzw. schützen>" }
  ],
  "decision_load": {
    "authority": "<Autorität>",
    "commit_to": "<woran sich binden / wie entscheiden, was Arbeit wird>",
    "false_yes_risk": "<das typische falsche Ja dieses Designs>"
  },
  "burnout_signals": {
    "not_self_theme": "<Not-Self>",
    "early_warning": "<wie sich der Frühwarn-Zustand im Arbeitsalltag zeigt>",
    "course_correction": "<konkrete Korrektur, wenn das Signal auftaucht>"
  },
  "focus_practices": [
    { "title": "<kurzer Titel>", "how": "<konkrete Durchführung>" }  // max 5, designgerecht
  ],
  "boundaries": [
    { "title": "<Grenze/Nein>", "why": "<warum sie schützt>" }  // max 4
  ],
  "insights": {
    "summary": "<2-3 Sätze Kernaussage>",
    "strengths": ["<max 3 Produktivitäts-Stärken>"],
    "watch_outs": ["<max 3 Burnout-Fallen>"]
  }
}`,
      8000
    );

    const coreKeys = ["productivity_score", "work_rhythm", "energy_management", "burnout_signals"];
    if (coreKeys.filter((k) => analysis[k] !== undefined).length === 0) {
      throw new Error("Analyse-Call lieferte kein verwertbares JSON (Kernfelder fehlen)");
    }
    await updateRecord(supabase, recordId, { progress: 60 });

    console.log("   🧠 [Productivity] Call 2: Narrativ...");
    const narrative = await claudeText(
      anthropic,
      `Du bist ein einfühlsamer Human-Design-Produktivitäts-Coach. Schreibe warm,
konkret, entlastend auf Deutsch (Du-Form), ohne Hustle-Sprache. Erkläre Begriffe knapp.
Antworte mit formatiertem Markdown.
${GROUNDING_RULE}`,
      `Name: ${clientName}
HD-Typ: ${type || "—"}

Strukturierte Analyse (Wahrheitsquelle — nichts hinzufügen):
${JSON.stringify(analysis)}

Schreibe einen integrierten Bericht (800-1300 Wörter) in dieser Struktur:
## Dein nachhaltiger Arbeitsstil
### Dein natürlicher Arbeits- und Energierhythmus
### Deine Stärken vs. deine Energie-Lecks
### Woran du dich (nicht) binden solltest
### Dein Burnout-Frühwarnsystem
### Deine Fokus- und Grenz-Anker`,
      4096
    );

    await updateRecord(supabase, recordId, {
      productivity_score: Math.round(Number(analysis.productivity_score) || 0),
      work_rhythm: analysis.work_rhythm || {},
      energy_management: analysis.energy_management || [],
      decision_load: analysis.decision_load || {},
      burnout_signals: analysis.burnout_signals || {},
      focus_practices: analysis.focus_practices || [],
      boundaries: analysis.boundaries || [],
      insights: analysis.insights || {},
      narrative,
      metadata: { type, reading_id, client_name: clientName, open_centers: openCenters(chart) },
      model: MODEL,
      status: "completed",
      progress: 100,
      completed_at: new Date().toISOString(),
    });

    console.log(`   ✅ [Productivity] Job ${job.id} abgeschlossen (score=${analysis.productivity_score})`);
    return { productivity_reading_id: recordId, status: "completed" };
  } catch (err) {
    console.error(`   ❌ [Productivity] Job ${job.id} fehlgeschlagen:`, err.message);
    await updateRecord(supabase, recordId, { status: "failed", error_message: err.message });
    throw err;
  }
}

let productivityQueue = null;
export function getProductivityQueue() { return productivityQueue; }
export function startProductivityWorker() {
  const { redis, supabase, anthropic } = createClients();
  productivityQueue = new Queue(QUEUE_NAME, { connection: redis });
  const worker = new Worker(QUEUE_NAME, (job) => processJob(job, { supabase, anthropic }), {
    connection: redis, concurrency: 2, settings: { maxStalledCount: 1 },
  });
  worker.on("failed", (job, err) => console.error(`❌ [Productivity] Job failed: ${job?.id}`, err.message));
  console.log(`🟢 Productivity Worker aktiv (Queue: ${QUEUE_NAME})`);
  return { worker, queue: productivityQueue };
}
