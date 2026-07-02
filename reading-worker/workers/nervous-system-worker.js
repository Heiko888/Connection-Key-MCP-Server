/**
 * W10 — Nervous-System Worker
 * Queue: reading-queue-v4-nervous-system
 *
 * Nervensystem-/Regulations-Reading: eine EINZEL-Chart-Analyse (analog Psychology),
 * die Human Design auf Nervensystem-Regulation (Polyvagal) abbildet:
 *   - Zustands-Map (ventral/sympathisch/dorsal) für diesen Menschen
 *   - offene Zentren als Antennen → was sie aufnehmen + konkreter Reset
 *   - Autorität/Strategie als somatische Entscheidungs-/Regulationsinstanz
 *   - Not-Self als chronischer Stresszustand + Weg zurück in Sicherheit
 *
 * Grundprinzip: Das natale Chart ist KONSTANT (deterministischer Faktenblock).
 * „Regulation" = der wandelbare Zustand des Nervensystems. Pattern bewusst
 * gespiegelt von workers/evolution-worker.js:
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
import { syncNarrativeToReading } from "../lib/panel-narrative.js";

// ─── Config ─────────────────────────────────────────────────────────────────

const MODEL = "claude-sonnet-4-6";
const QUEUE_NAME = "reading-queue-v4-nervous-system";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = path.join(__dirname, "..", "knowledge", "nervous-system");

function loadKnowledge(name) {
  try {
    return fs.readFileSync(path.join(KNOWLEDGE_DIR, `${name}.md`), "utf8");
  } catch (err) {
    console.warn(`   ⚠️ [NervousSystem] Wissensdatei ${name}.md nicht ladbar: ${err.message}`);
    return "";
  }
}

const KNOWLEDGE = loadKnowledge("nervous-system-knowledge");

// Not-Self-Theme + Signatur pro HD-Typ (deterministisch, Read-Time-Fallback für
// Charts ohne persistiertes not_self_theme — spiegelt psychology/evolution-worker).
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
  "Selbsterkenntnis- und Regulationswissen, KEINE Therapie und KEINE Diagnose — " +
  "framen wie Selbstwahrnehmung, niemals pathologisierend. Bei Hinweisen auf akute " +
  "Krise/Trauma-Überflutung auf professionelle Begleitung verweisen. Fehlt eine " +
  "Information, lass sie weg, statt sie zu erfinden.";

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
  // Daten leben im public-Schema (wie nervous_system_readings selbst).
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  return { redis, supabase, anthropic };
}

// ─── Supabase Helpers ─────────────────────────────────────────────────────────

// Lädt das Quell-Reading und mappt das Chart flach (wie psychology-worker).
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
    .from("nervous_system_readings")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`nervous_system_readings UPDATE fehlgeschlagen: ${error.message}`);
}

async function createRecord(supabase, { user_id, reading_id }) {
  const { data, error } = await supabase
    .schema("public")
    .from("nervous_system_readings")
    .insert({ user_id: user_id || null, reading_id: reading_id || null, status: "processing", progress: 0 })
    .select("id")
    .single();
  if (error) throw new Error(`nervous_system_readings INSERT fehlgeschlagen: ${error.message}`);
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
    console.warn(`   ⚠️ [NervousSystem] Faktenblock nicht baubar: ${err.message}`);
    return "";
  }
}

// Deterministischer Regulations-Kontextblock als Wahrheitsquelle fürs Modell.
function buildRegulationBlock(chart) {
  const type = chart?.type || "—";
  const notSelf = chart?.not_self_theme || chart?.notSelfTheme || NOT_SELF_BY_TYPE[type] || "—";
  const signature = SIGNATURE_BY_TYPE[type] || "—";
  const lines = [];
  lines.push("=== REGULATIONS-KONTEXT (deterministisch — Wahrheitsquelle) ===");
  lines.push(`HD-Typ: ${type}`);
  lines.push(`Autorität: ${chart?.authority || "—"} | Strategie: ${chart?.strategy || "—"} | Profil: ${chart?.profile || "—"}`);
  lines.push(`Not-Self (chronischer Stress): ${notSelf} → Signatur (Sicherheit): ${signature}`);
  lines.push(`Offene Zentren (NS-Antennen): ${openCenters(chart).join(", ") || "—"}`);
  lines.push(`Definierte Zentren (Stabilität): ${definedCenters(chart).join(", ") || "—"}`);
  lines.push("=== ENDE REGULATIONS-KONTEXT ===");
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
    console.warn(`   ⚠️ [NervousSystem] claudeJSON an max_tokens (${maxTokens}) abgeschnitten — JSON evtl. unvollständig.`);
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
  const { user_id, reading_id, nervous_system_reading_id: existingId } = job.data;
  console.log(`📥 [NervousSystem] Job ${job.id} | user=${user_id} | reading=${reading_id}`);

  // DB-Eintrag zuerst auflösen (vom Endpoint angelegte Zeile fortschreiben), damit
  // der catch-Block auch Lade-Fehler als failed festhält statt ewig pending.
  let recordId;
  if (existingId) {
    recordId = existingId;
    await updateRecord(supabase, recordId, { status: "processing", progress: 5 });
    console.log(`   ✅ [NervousSystem] Record wiederverwendet: ${recordId}`);
  } else {
    recordId = await createRecord(supabase, { user_id, reading_id });
    console.log(`   ✅ [NervousSystem] Record erstellt: ${recordId}`);
  }

  try {
    if (!reading_id) {
      throw new Error("reading_id ist erforderlich — das Nervensystem-Reading braucht ein Quell-Reading mit Chart.");
    }

    // 1. Chart laden + erden
    const reading = await fetchReadingData(supabase, reading_id);
    const chart = reading.chart || {};
    if (!chart || !Object.keys(chart).length) {
      throw new Error("Quell-Reading enthält keine Chart-Daten.");
    }
    const type = chart.type || reading.reading_type || null;
    const clientName = reading.client_name || "du";

    await updateRecord(supabase, recordId, { progress: 20 });

    const factsBlock = chartFactsBlock(chart);
    const regulationBlock = buildRegulationBlock(chart);

    // 2. Call 1 — strukturierte, mehrdimensionale Analyse als EIN JSON-Objekt.
    console.log("   🧠 [NervousSystem] Call 1: strukturierte Analyse...");
    const analysis = await claudeJSON(
      anthropic,
      `Du bist ein erfahrener, somatisch geschulter Human-Design-Begleiter mit
fundiertem Wissen über die Polyvagal-Theorie und Nervensystem-Regulation. Du
übersetzt das Chart eines Menschen in seine Nervensystem-Dynamik. Antworte
ausschließlich auf Deutsch und NUR mit einem validen JSON-Objekt (kein Markdown,
keine Erklärungen davor/danach).
${GROUNDING_RULE}

=== FACHWISSEN NERVENSYSTEM & REGULATION ===
${KNOWLEDGE}`,
      `${factsBlock}

${regulationBlock}

Erstelle die Nervensystem-/Regulations-Analyse als EIN JSON-Objekt mit EXAKT
dieser Struktur (halte jeden String knapp, Arrays max. so lang wie angegeben,
damit das JSON vollständig bleibt):
{
  "regulation_score": <0-100, ganzzahlig, gemäß Bewertungs-Rahmen — Momentaufnahme, im narrative begründet>,
  "baseline_state": "<dominante NS-Tendenz im Not-Self, 1 Satz>",
  "state_map": {
    "ventral": "<wie Sicherheit/Verbindung sich bei DIESEM Menschen zeigt>",
    "sympathetic": "<typische Kampf/Flucht-Auslöser & Anzeichen>",
    "dorsal": "<typische Shutdown/Rückzug-Auslöser & Anzeichen>",
    "path_back": "<konkretester Weg zurück nach ventral für diesen Typ>"
  },
  "center_sensitivities": [
    // genau die OFFENEN Zentren der Person, je Eintrag:
    { "center": "<Zentrum>", "absorbs": "<was hier aufgenommen/verstärkt wird>", "overwhelm_sign": "<woran man Überreizung merkt>", "regulation_practice": "<ein konkreter Reset>" }
  ],
  "authority_regulation": {
    "authority": "<Autorität>",
    "strategy": "<Strategie>",
    "somatic_signal": "<wie sich ein stimmiges Ja/Nein im Körper zeigt>",
    "misalignment_stress": "<was passiert, wenn gegen die Autorität entschieden wird>",
    "co_regulation": "<wie dieser Mensch am besten mit anderen co-reguliert>"
  },
  "triggers": [
    { "trigger": "<Situation>", "body_response": "<Körperreaktion>", "reset": "<schneller Reset>" }
    // max 5, abgeleitet aus offenen Zentren & Not-Self
  ],
  "daily_practices": [
    { "title": "<kurzer Titel>", "when": "<wann/wozu>", "how": "<konkrete Durchführung>" }
    // max 5, niedrigschwellig & typgerecht
  ],
  "insights": {
    "summary": "<2-3 Sätze Kernaussage der NS-Dynamik>",
    "strengths": ["<max 3 regulatorische Stärken/Ressourcen>"],
    "watch_outs": ["<max 3 wiederkehrende Stress-Fallen>"]
  }
}`,
      8000
    );

    // Sicherheitsnetz: kein verwertbares JSON → sichtbar scheitern statt Leer-Reading.
    const coreKeys = ["regulation_score", "state_map", "center_sensitivities", "authority_regulation"];
    const present = coreKeys.filter((k) => analysis[k] !== undefined).length;
    if (present === 0) {
      throw new Error("Analyse-Call lieferte kein verwertbares JSON (Kernfelder fehlen)");
    }

    await updateRecord(supabase, recordId, { progress: 60 });

    // 3. Call 2 — warmes Narrativ (Markdown) auf Basis der strukturierten Analyse.
    console.log("   🧠 [NervousSystem] Call 2: Narrativ...");
    const notSelf = chart?.not_self_theme || chart?.notSelfTheme || NOT_SELF_BY_TYPE[type] || "Not-Self";
    const signature = SIGNATURE_BY_TYPE[type] || "Signatur";
    const narrative = await claudeText(
      anthropic,
      `Du bist ein einfühlsamer, somatisch geschulter Human-Design-Begleiter. Schreibe
warm, ermutigend, konkret und direkt ansprechend auf Deutsch (Du-Form). Erkläre
Nervensystem-Begriffe knapp, ohne zu pathologisieren — Sensibilität ist eine Gabe,
kein Defekt. Antworte mit formatiertem Markdown.
${GROUNDING_RULE}`,
      `Name: ${clientName}
HD-Typ: ${type || "—"}

Strukturierte Nervensystem-Analyse (Wahrheitsquelle für deinen Text — nichts hinzufügen):
${JSON.stringify(analysis)}

Schreibe einen integrierten Nervensystem-Bericht (900-1500 Wörter) in dieser Struktur:
## Dein Nervensystem im Überblick
### Deine Zustände: Sicherheit, Mobilisierung, Rückzug
### Deine offenen Zentren: wo du am empfänglichsten bist
### Deine Autorität als Körperkompass
### Dein Weg von ${notSelf} zurück zu ${signature}
### Deine täglichen Regulations-Anker`,
      4096
    );

    // 4. Ergebnis speichern.
    await updateRecord(supabase, recordId, {
      regulation_score: Math.round(Number(analysis.regulation_score) || 0),
      baseline_state: analysis.baseline_state || null,
      state_map: analysis.state_map || {},
      center_sensitivities: analysis.center_sensitivities || [],
      authority_regulation: analysis.authority_regulation || {},
      triggers: analysis.triggers || [],
      daily_practices: analysis.daily_practices || [],
      insights: analysis.insights || {},
      narrative,
      metadata: { type, reading_id, client_name: clientName, open_centers: openCenters(chart) },
      model: MODEL,
      status: "completed",
      progress: 100,
      completed_at: new Date().toISOString(),
    });

    // Narrativ ins Eltern-Reading spiegeln (reading_data.text) — sonst zeigen
    // PDF/E-Mail/Klienten-Ansicht nur den Panel-Platzhalter. Best-Effort.
    await syncNarrativeToReading(supabase, reading_id, narrative, "NervousSystem");

    console.log(`   ✅ [NervousSystem] Job ${job.id} abgeschlossen (score=${analysis.regulation_score})`);
    return { nervous_system_reading_id: recordId, status: "completed" };

  } catch (err) {
    console.error(`   ❌ [NervousSystem] Job ${job.id} fehlgeschlagen:`, err.message);
    await updateRecord(supabase, recordId, { status: "failed", error_message: err.message });
    throw err;
  }
}

// ─── Queue Export ─────────────────────────────────────────────────────────────

let nervousSystemQueue = null;

export function getNervousSystemQueue() {
  return nervousSystemQueue;
}

export function startNervousSystemWorker() {
  const { redis, supabase, anthropic } = createClients();

  nervousSystemQueue = new Queue(QUEUE_NAME, { connection: redis });

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
    console.error(`❌ [NervousSystem] Job failed: ${job?.id}`, err.message);
  });

  console.log(`🟢 Nervous-System Worker aktiv (Queue: ${QUEUE_NAME})`);
  return { worker, queue: nervousSystemQueue };
}
