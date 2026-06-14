/**
 * W7 — Evolution Worker
 * Queue: reading-queue-v4-evolution
 *
 * Analysiert die ENTWICKLUNG (Dekonditionierung) eines Menschen über mehrere
 * Readings hinweg. Anders als die alte, oberflächliche Single-Claude-Call-Variante
 * auf ck-agent (.167) erzeugt diese Engine eine mehrdimensionale, wissensgeerdete
 * Analyse:
 *   - Zentren- & Autoritäts-Verlauf (pro offenem Zentrum: Druck → Weisheit)
 *   - Not-Self ↔ Signatur-Tracking (zentraler Fortschritts-Indikator)
 *   - Zeitleiste & Trends (Engagement über die Zeit, für Diagramme)
 *   - Verknüpfung Coaching/Lernpfade (Empfehlungen → konkrete Übungen & Session-Themen)
 *
 * Grundprinzip: Das natale Chart ist KONSTANT. „Evolution" = die wachsende
 * Stimmigkeit mit Typ/Strategie/Autorität, abgelesen an der Abfolge der Readings,
 * Coaching-Sessions und Lernpfaden. Das Chart wird als deterministischer
 * Fakten-Block (Whitelist) geerdet, exakt wie im Psychology-Worker.
 *
 * Pattern bewusst gespiegelt von workers/psychology-worker.js:
 *   - eine vom Endpoint angelegte Zeile fortschreiben (kein Doppel-Insert)
 *   - 2 Claude-Calls (strukturiertes JSON + Narrativ) statt Truncation-Risiko
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
const QUEUE_NAME = "reading-queue-v4-evolution";
const MAX_READINGS = parseInt(process.env.EVOLUTION_MAX_READINGS || "12", 10);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = path.join(__dirname, "..", "knowledge", "evolution");

function loadKnowledge(name) {
  try {
    return fs.readFileSync(path.join(KNOWLEDGE_DIR, `${name}.md`), "utf8");
  } catch (err) {
    console.warn(`   ⚠️ [Evolution] Wissensdatei ${name}.md nicht ladbar: ${err.message}`);
    return "";
  }
}

const KNOWLEDGE = loadKnowledge("evolution-knowledge");

// Not-Self-Theme + Signatur pro HD-Typ (deterministisch). Spiegelt die Engine-Map
// (chartCalculation.js) bzw. psychology-worker.js. Read-Time-Fallback für Charts,
// die ohne not_self_theme persistiert wurden — ohne Prod-Daten zu mutieren.
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
  "WICHTIG: Stütze dich ausschließlich auf die gelieferten Chart-Fakten und " +
  "Verlaufs-Signale (Reading-Typen, Daten, Coaching, Lernpfade). Erfinde KEINE " +
  "Tore, Kanäle, Zentren oder Ereignisse. Das natale Chart ist KONSTANT — tu nie " +
  "so, als hätten sich Tore/Kanäle/Zentren verändert; Evolution meint allein die " +
  "wachsende Stimmigkeit mit Typ, Strategie und Autorität (Dekonditionierung). " +
  "Fehlt eine Information, lass sie weg, statt sie zu erfinden.";

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
  // Evolution-Daten leben im public-Schema (wie evolution_analyses selbst).
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  return { redis, supabase, anthropic };
}

// ─── Supabase Helpers ─────────────────────────────────────────────────────────

// Lädt die abgeschlossenen Readings eines Users (chronologisch) als Verlaufsbasis.
// Wenn reading_ids vorgegeben sind, wird darauf eingeschränkt; sonst die letzten
// MAX_READINGS. Das natale Chart wird aus dem jüngsten Reading mit Chart-Daten
// abgeleitet (es ist über alle Readings identisch).
async function fetchUserReadings(supabase, userId, readingIds) {
  // Eigentümerschaft wie in der v3-Liste (.167 /api/readings): Reading gehört dem
  // User per user_id ODER profile_id. Nur user_id zu filtern verfehlte alle
  // profile_id-verknüpften Readings → "Keine Readings gefunden" trotz Auswahl.
  let query = supabase
    .schema("public")
    .from("readings")
    .select("id, reading_type, client_name, status, chart_data, reading_data, content, created_at, completed_at")
    .or(`user_id.eq.${userId},profile_id.eq.${userId}`)
    .order("created_at", { ascending: true });

  if (Array.isArray(readingIds) && readingIds.length) {
    query = query.in("id", readingIds);
  }

  const { data, error } = await query;
  if (error) throw new Error(`readings laden fehlgeschlagen: ${error.message}`);

  // Bevorzugt abgeschlossene Readings (status=completed); falls keine, alle nehmen.
  const all = data || [];
  const completed = all.filter((r) => r.status === "completed" || r.status === "done");
  const list = (completed.length ? completed : all).slice(-MAX_READINGS);
  return list;
}

// Best-effort: Coaching-Sessions & Lernpfade als zusätzliche Verlaufs-Signale.
// Fehlende Tabellen/Spalten dürfen die Analyse NICHT abbrechen.
async function fetchEngagementSignals(supabase, userId) {
  const signals = { coaching_sessions: [], learning_paths: [] };

  try {
    const { data } = await supabase
      .schema("public")
      .from("coaching_sessions")
      .select("session_type, goal, status, insights, created_at, completed_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(30);
    if (Array.isArray(data)) signals.coaching_sessions = data;
  } catch (err) {
    console.warn(`   ⚠️ [Evolution] coaching_sessions nicht ladbar: ${err.message}`);
  }

  try {
    const { data } = await supabase
      .schema("public")
      .from("learning_paths")
      .select("title, topic, status, progress_percentage, completed_exercises_count, total_exercises, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(30);
    if (Array.isArray(data)) signals.learning_paths = data;
  } catch (err) {
    console.warn(`   ⚠️ [Evolution] learning_paths nicht ladbar: ${err.message}`);
  }

  return signals;
}

async function updateRecord(supabase, id, fields) {
  const { error } = await supabase
    .schema("public")
    .from("evolution_analyses")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`evolution_analyses UPDATE fehlgeschlagen: ${error.message}`);
}

async function createRecord(supabase, { user_id, reading_ids, focus_area }) {
  // type + reading_ids sind NOT NULL (reading_ids default '{}') → defensiv setzen.
  const { data, error } = await supabase
    .schema("public")
    .from("evolution_analyses")
    .insert({
      user_id,
      type: "deconditioning",
      reading_ids: Array.isArray(reading_ids) ? reading_ids : [],
      focus_area: focus_area || null,
      status: "processing",
      progress: 0,
    })
    .select("id")
    .single();
  if (error) throw new Error(`evolution_analyses INSERT fehlgeschlagen: ${error.message}`);
  return data.id;
}

// ─── Daten-Aufbereitung ─────────────────────────────────────────────────────

// Extrahiert das rohe Chart-Objekt aus einem Reading (gleiche Logik wie psychology).
function chartOf(reading) {
  return reading?.reading_data?.chart_data || reading?.chart_data || {};
}

// Kurz-Zusammenfassung eines Readings für die Zeitleiste (deterministisch, kein LLM).
function readingSummary(reading) {
  const c = reading.content || reading.reading_data || {};
  // Häufige Felder, in denen ein Reading-Text/Essenz liegt — best effort, knapp halten.
  const raw =
    c.summary || c.essence || c.essenz || c.overview || c.intro ||
    (typeof c.text === "string" ? c.text : "") ||
    (typeof reading.content === "string" ? reading.content : "");
  const text = String(raw || "").replace(/\s+/g, " ").trim();
  return text ? text.slice(0, 240) : "";
}

function chartFactsBlock(chart) {
  try {
    return buildFactsBlock(chart || {}, { readingType: "detailed" });
  } catch (err) {
    console.warn(`   ⚠️ [Evolution] Faktenblock nicht baubar: ${err.message}`);
    return "";
  }
}

function openCenters(chart) {
  const centers = chart?.centers && typeof chart.centers === "object" ? chart.centers : {};
  const isDefined = (v) => v === true || v === "defined";
  return Object.entries(centers).filter(([, v]) => !isDefined(v)).map(([k]) => k);
}

// Baut den deterministischen Verlaufs-/Kontextblock, der dem Modell als
// Wahrheitsquelle für die Trajektorie dient.
function buildTimelineBlock(readings, signals, chart) {
  const lines = [];
  const type = chart?.type || readings[readings.length - 1]?.reading_type || "—";
  const notSelf = chart?.not_self_theme || chart?.notSelfTheme || NOT_SELF_BY_TYPE[type] || "—";
  const signature = SIGNATURE_BY_TYPE[type] || "—";

  lines.push("=== VERLAUFS-SIGNALE (deterministisch — Wahrheitsquelle für die Trajektorie) ===");
  lines.push(`HD-Typ: ${type}`);
  lines.push(`Autorität: ${chart?.authority || "—"} | Strategie: ${chart?.strategy || "—"} | Profil: ${chart?.profile || "—"}`);
  lines.push(`Not-Self-Thema: ${notSelf} → Signatur (Ziel): ${signature}`);
  lines.push(`Offene Zentren (Lernfelder): ${openCenters(chart).join(", ") || "—"}`);
  lines.push("");

  lines.push(`READINGS (${readings.length}, chronologisch):`);
  readings.forEach((r, i) => {
    const date = (r.created_at || "").slice(0, 10);
    const summary = readingSummary(r);
    lines.push(`  ${i + 1}. [${date}] Typ: ${r.reading_type || "—"}${summary ? ` — ${summary}` : ""}`);
  });

  if (signals.coaching_sessions.length) {
    lines.push("");
    lines.push(`COACHING-SESSIONS (${signals.coaching_sessions.length}):`);
    signals.coaching_sessions.forEach((s) => {
      const date = (s.created_at || "").slice(0, 10);
      const ins = s.insights && typeof s.insights === "object"
        ? (Array.isArray(s.insights.key_insights) ? s.insights.key_insights.slice(0, 2).join("; ") : "")
        : "";
      lines.push(`  - [${date}] ${s.session_type || "general"} (${s.status || "?"})${s.goal ? ` Ziel: ${String(s.goal).slice(0, 120)}` : ""}${ins ? ` | Erkenntnisse: ${ins}` : ""}`);
    });
  }

  if (signals.learning_paths.length) {
    lines.push("");
    lines.push(`LERNPFADE (${signals.learning_paths.length}):`);
    signals.learning_paths.forEach((p) => {
      lines.push(`  - ${p.title || p.topic || "Lernpfad"} (${p.topic || "—"}): ${p.progress_percentage ?? 0}% [${p.completed_exercises_count ?? 0}/${p.total_exercises ?? "?"} Übungen, ${p.status || "?"}]`);
    });
  }

  lines.push("");
  lines.push("=== ENDE VERLAUFS-SIGNALE ===");
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
    console.warn(`   ⚠️ [Evolution] claudeJSON an max_tokens (${maxTokens}) abgeschnitten — JSON evtl. unvollständig.`);
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
  const { user_id, reading_ids, focus_area, evolution_analysis_id: existingId } = job.data;
  console.log(`📥 [Evolution] Job ${job.id} | user=${user_id} | focus=${focus_area || "—"}`);

  // DB-Eintrag zuerst auflösen (vom Endpoint angelegte Zeile fortschreiben), damit
  // der catch-Block auch Lade-Fehler als failed festhält statt ewig pending.
  let analysisId;
  if (existingId) {
    analysisId = existingId;
    await updateRecord(supabase, analysisId, { status: "processing", progress: 5 });
    console.log(`   ✅ [Evolution] Record wiederverwendet: ${analysisId}`);
  } else {
    analysisId = await createRecord(supabase, { user_id, reading_ids, focus_area });
    console.log(`   ✅ [Evolution] Record erstellt: ${analysisId}`);
  }

  try {
    // 1. Verlaufsdaten laden
    const readings = await fetchUserReadings(supabase, user_id, reading_ids);
    if (!readings.length) {
      throw new Error("Keine Readings für diesen User gefunden — Evolution-Analyse braucht mindestens 1 Reading.");
    }
    const signals = await fetchEngagementSignals(supabase, user_id);

    // Natales Chart aus dem jüngsten Reading mit Chart-Daten (Chart ist konstant).
    const chart = [...readings].reverse().map(chartOf).find((c) => c && Object.keys(c).length) || {};
    const type = chart.type || readings[readings.length - 1].reading_type || null;
    const isBaseline = readings.length < 2;

    await updateRecord(supabase, analysisId, { progress: 20 });

    const factsBlock = chartFactsBlock(chart);
    const timelineBlock = buildTimelineBlock(readings, signals, chart);

    // 2. Call 1 — strukturierte, mehrdimensionale Analyse als EIN JSON-Objekt.
    console.log(`   🧠 [Evolution] Call 1: strukturierte Analyse (${readings.length} Readings${isBaseline ? ", Baseline" : ""})...`);
    const analysis = await claudeJSON(
      anthropic,
      `Du bist ein erfahrener Human-Design-Entwicklungsbegleiter. Du analysierst die
DEKONDITIONIERUNGS-REISE eines Menschen über die Zeit — die wachsende Stimmigkeit
mit Typ, Strategie und Autorität. Antworte ausschließlich auf Deutsch und NUR mit
einem validen JSON-Objekt (kein Markdown, keine Erklärungen davor/danach).
${GROUNDING_RULE}

=== FACHWISSEN EVOLUTION & DEKONDITIONIERUNG ===
${KNOWLEDGE}`,
      `${factsBlock}

${timelineBlock}
${focus_area ? `\nFOKUS-BEREICH des Users: ${focus_area}\n` : ""}
${isBaseline
  ? "Es liegt nur EIN Reading vor → behandle dies als AUSGANGSPUNKT (Baseline): konservativer Score, mache transparent, dass die Trajektorie erst mit weiteren Readings sichtbar wird."
  : "Es liegen mehrere Readings vor → arbeite die ENTWICKLUNG/TRAJEKTORIE über die Zeit heraus (vorwärts/stagnierend/Rückfall), belegt durch die Verlaufs-Signale."}

Erstelle die Evolutions-Analyse als EIN JSON-Objekt mit EXAKT dieser Struktur
(halte jeden String knapp, Arrays max. so lang wie angegeben, damit das JSON
vollständig bleibt):
{
  "overall_growth_score": <0-100, ganzzahlig, gemäß Bewertungs-Rahmen, mit Belegen im narrative>,
  "phase": "<eine von: Erkennen | Experimentieren | Verkörpern | Weisheit>",
  "not_self_tracking": {
    "not_self_theme": "<Not-Self des Typs>",
    "signature": "<Signatur des Typs>",
    "current_position": "<knappe Einschätzung wo auf der Achse Not-Self→Signatur>",
    "movement": "<vorwärts | stagnierend | rückfall | baseline>",
    "evidence": ["<max 3 Belege aus den Signalen>"]
  },
  "authority_alignment": {
    "authority": "<Autorität>",
    "strategy": "<Strategie>",
    "alignment": "<niedrig | wachsend | gefestigt>",
    "observations": ["<max 3 Beobachtungen zur Entscheidungs-/Strategie-Stimmigkeit>"],
    "next_step": "<ein konkreter nächster Schritt für gelebte Autorität>"
  },
  "center_evolution": [
    // genau die offenen Zentren der Person, je Eintrag:
    { "center": "<Zentrum>", "conditioned_pattern": "<Druck-Muster>", "wisdom_potential": "<Weisheit>", "trajectory": "<wo die Person hier steht>", "practice": "<eine konkrete Übung>" }
  ],
  "timeline": [
    // je Reading ein Eintrag, chronologisch (max so viele wie Readings):
    { "date": "<YYYY-MM>", "reading_type": "<typ>", "milestone": "<knapper Entwicklungs-Marker>", "score_estimate": <0-100> }
  ],
  "key_changes": [
    { "area": "<Bereich>", "change": "<was sich verändert hat>", "direction": "<positiv | neutral | herausfordernd>" }
    // max 5
  ],
  "growth_areas": [
    { "title": "<Titel>", "description": "<knappe Beschreibung>", "progress": <0-100> }
    // max 5
  ],
  "recommendations": [
    { "title": "<Titel>", "description": "<konkrete Empfehlung>", "priority": "<hoch | mittel | niedrig>" }
    // max 5
  ],
  "coaching_links": {
    "session_topics": [
      { "title": "<Session-Thema>", "session_type": "<general|authority|strategy|centers|gates|profile>", "rationale": "<warum jetzt>" }
      // max 3, abgeleitet aus growth_areas
    ],
    "learning_exercises": [
      { "title": "<Übungstitel>", "topic": "<relationships|authority|strategy|centers>", "description": "<was tun>" }
      // max 3, abgeleitet aus growth_areas
    ]
  },
  "insights": {
    "summary": "<2-3 Sätze Kernaussage der Entwicklung>",
    "patterns": ["<max 3 wiederkehrende Muster>"],
    "strengths": ["<max 3 Stärken/Fortschritte>"]
  }
}`,
      8000
    );

    // Sicherheitsnetz: kein verwertbares JSON → sichtbar scheitern statt Leer-Analyse.
    const coreKeys = ["overall_growth_score", "center_evolution", "not_self_tracking", "growth_areas"];
    const present = coreKeys.filter((k) => analysis[k] !== undefined).length;
    if (present === 0) {
      throw new Error("Analyse-Call lieferte kein verwertbares JSON (Kernfelder fehlen)");
    }

    await updateRecord(supabase, analysisId, { progress: 60 });

    // 3. Call 2 — warmes Narrativ (Markdown) auf Basis der strukturierten Analyse.
    console.log("   🧠 [Evolution] Call 2: Narrativ...");
    const clientName = readings[readings.length - 1]?.client_name || "du";
    const narrative = await claudeText(
      anthropic,
      `Du bist ein einfühlsamer Human-Design-Entwicklungsbegleiter. Schreibe warm,
ermutigend, konkret und direkt ansprechend auf Deutsch (Du-Form). Entwicklung ist
nicht linear — würdige Fortschritte UND benenne Lernfelder ohne zu pathologisieren.
Keine Fachbegriffe ohne kurze Erklärung. Antworte mit formatiertem Markdown.
${GROUNDING_RULE}`,
      `Name: ${clientName}
HD-Typ: ${type || "—"}

Strukturierte Evolutions-Analyse (Wahrheitsquelle für deinen Text — nichts hinzufügen):
${JSON.stringify(analysis)}

Schreibe einen integrierten Entwicklungs-Bericht (900-1500 Wörter) in dieser Struktur:
## Deine Entwicklungsreise
### Wo du stehst${isBaseline ? " (dein Ausgangspunkt)" : ""}
### Dein Weg von ${analysis?.not_self_tracking?.not_self_theme || "Not-Self"} zu ${analysis?.not_self_tracking?.signature || "Signatur"}
### Deine offenen Zentren: von Druck zu Weisheit
### Deine Autorität im Alltag
### Deine nächsten Schritte`,
      4096
    );

    // 4. Ergebnis speichern (vollständiges, kompatibles Datenmodell).
    await updateRecord(supabase, analysisId, {
      overall_growth_score: Math.round(Number(analysis.overall_growth_score) || 0),
      not_self_tracking: analysis.not_self_tracking || {},
      authority_alignment: analysis.authority_alignment || {},
      center_evolution: analysis.center_evolution || [],
      timeline: analysis.timeline || [],
      key_changes: analysis.key_changes || [],
      growth_areas: analysis.growth_areas || [],
      recommendations: analysis.recommendations || [],
      coaching_links: analysis.coaching_links || {},
      insights: analysis.insights || {},
      comparison_data: { focus_area: focus_area || null, readings_count: readings.length, baseline: isBaseline, phase: analysis.phase || null },
      narrative,
      model: MODEL,
      status: "completed",
      progress: 100,
      completed_at: new Date().toISOString(),
    });

    console.log(`   ✅ [Evolution] Job ${job.id} abgeschlossen (score=${analysis.overall_growth_score})`);
    return { evolution_analysis_id: analysisId, status: "completed" };

  } catch (err) {
    console.error(`   ❌ [Evolution] Job ${job.id} fehlgeschlagen:`, err.message);
    await updateRecord(supabase, analysisId, { status: "failed", error_message: err.message });
    throw err;
  }
}

// ─── Queue Export ─────────────────────────────────────────────────────────────

let evolutionQueue = null;

export function getEvolutionQueue() {
  return evolutionQueue;
}

export function startEvolutionWorker() {
  const { redis, supabase, anthropic } = createClients();

  evolutionQueue = new Queue(QUEUE_NAME, { connection: redis });

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
    console.error(`❌ [Evolution] Job failed: ${job?.id}`, err.message);
  });

  console.log(`🟢 Evolution Worker aktiv (Queue: ${QUEUE_NAME})`);
  return { worker, queue: evolutionQueue };
}
