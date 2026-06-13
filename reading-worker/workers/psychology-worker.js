/**
 * W6 — Psychology Worker
 * Queue: reading-queue-v4-psychology
 * Analysiert Human Design Charts durch 5 psychologische Linsen:
 * Polyvagal, Attachment, Jung, Big Five → Synthese
 */

import { Worker, Queue } from "bullmq";
import IORedis from "ioredis";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildFactsBlock } from "../lib/facts-builder.js";
import { runReadingPipeline } from "../reading-pipeline.js";

// ─── Config ───────────────────────────────────────────────────────────────────

const MODEL = "claude-sonnet-4-6";
const TIMEOUT = parseInt(process.env.CLAUDE_TIMEOUT_MS || "120000", 10);
const QUEUE_NAME = "reading-queue-v4-psychology";

// ─── Knowledge-Grounding ────────────────────────────────────────────────────────
// Die vier Linsen werden mit dedizierten Wissensdateien geerdet, damit das Modell
// nicht aus dem Allgemeinwissen frei assoziiert, sondern fachlich sauber bleibt.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = path.join(__dirname, "..", "knowledge", "psychology");

function loadLensKnowledge(name) {
  try {
    return fs.readFileSync(path.join(KNOWLEDGE_DIR, `${name}.md`), "utf8");
  } catch (err) {
    console.warn(`   ⚠️ [Psychology] Wissensdatei ${name}.md nicht ladbar: ${err.message}`);
    return "";
  }
}

const KNOWLEDGE = {
  polyvagal: loadLensKnowledge("polyvagal-knowledge"),
  attachment: loadLensKnowledge("attachment-knowledge"),
  jungian: loadLensKnowledge("jung-knowledge"),
  bigfive: loadLensKnowledge("bigfive-knowledge"),
  ifs: loadLensKnowledge("ifs-knowledge"),
};

// Strikte Erdungs-Regel: nur Chart-Fakten nutzen, nichts erfinden.
const GROUNDING_RULE =
  "WICHTIG: Stütze dich ausschließlich auf die unten gelieferten Chart-Fakten " +
  "(Typ, Profil, Autorität, definierte/offene Zentren, Kanäle, Tore). Erfinde " +
  "KEINE Tore, Kanäle oder Zentren, die nicht im FAKTEN-Block stehen. Wenn eine " +
  "Information fehlt, lass sie weg, statt sie zu erfinden.";

// Baut den deterministischen Fakten-Block (Whitelist) für eine Person.
function factsFor(reading) {
  try {
    return buildFactsBlock(reading.chart || {}, { readingType: "detailed" });
  } catch (err) {
    console.warn(`   ⚠️ [Psychology] Faktenblock nicht baubar: ${err.message}`);
    return chartSummary(reading);
  }
}

// ─── Clients ──────────────────────────────────────────────────────────────────

function createClients() {
  const redis = new IORedis({
    host: process.env.REDIS_HOST || "redis",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
  });

  const supabaseUrl = process.env.V4_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.V4_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const supabasePublic = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  return { redis, supabase, supabasePublic, anthropic };
}

// ─── Supabase Helpers ─────────────────────────────────────────────────────────

async function fetchReadingData(supabasePublic, readingId) {
  const { data, error } = await supabasePublic
    .from("readings")
    .select("reading_type, client_name, reading_data, chart_data")
    .eq("id", readingId)
    .single();
  if (error) throw new Error(`Reading ${readingId} nicht gefunden: ${error.message}`);
  // HD-Attribute liegen im JSON (reading_data.chart_data bzw. Spalte chart_data),
  // nicht als eigene Spalten -> flach mappen, damit chartSummary() sie wie bisher liest.
  const chart = data.reading_data?.chart_data || data.chart_data || {};
  const centers = chart.centers && typeof chart.centers === "object" ? chart.centers : {};
  const isDefined = (v) => v === true || v === "defined";
  return {
    ...data,
    chart, // rohes Chart-Objekt für den deterministischen Faktenblock
    reading_type: data.reading_type || chart.type,
    type: data.reading_type || chart.type, // Alias (Bugfix: Big-Five-Prompt las personA.type)
    profile: chart.profile,
    authority: chart.authority,
    strategy: chart.strategy,
    defined_centers: Object.entries(centers).filter(([, v]) => isDefined(v)).map(([k]) => k),
    undefined_centers: Object.entries(centers).filter(([, v]) => !isDefined(v)).map(([k]) => k),
    not_self_theme: chart.not_self_theme || chart.notSelfTheme || null,
    gates: Array.isArray(chart.gates) ? chart.gates.map((g) => g.number || g) : [],
    channels: Array.isArray(chart.channels) ? chart.channels.map((c) => c.name_de || c.name || `${c.gate1}-${c.gate2}`) : [],
  };
}

async function fetchConnectionData(supabasePublic, connectionReadingId) {
  const { data, error } = await supabasePublic
    .schema("public")
    .from("connection_readings")
    .select("composite_data")
    .eq("id", connectionReadingId)
    .single();
  if (error) throw new Error(`Connection Reading ${connectionReadingId} nicht gefunden: ${error.message}`);
  return data;
}

async function createPsychologyRecord(supabase, { mode, reading_id, connection_reading_id, person_a_id, person_b_id }) {
  const { data, error } = await supabase
    .schema("public")
    .from("psychology_readings")
    .insert({ mode, reading_id, connection_reading_id, person_a_id, person_b_id, status: "processing" })
    .select("id")
    .single();
  if (error) throw new Error(`psychology_readings INSERT fehlgeschlagen: ${error.message}`);
  return data.id;
}

async function updatePsychologyRecord(supabase, id, fields) {
  const { error } = await supabase
    .schema("public")
    .from("psychology_readings")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`psychology_readings UPDATE fehlgeschlagen: ${error.message}`);
}

// ─── Claude Calls ─────────────────────────────────────────────────────────────

async function claudeJSON(anthropic, system, user, maxTokens = 2000) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  const raw = response.content[0]?.text || "{}";
  try {
    return JSON.parse(raw);
  } catch {
    const stripped = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    try { return JSON.parse(stripped); } catch { return { raw }; }
  }
}

async function claudeText(anthropic, system, user) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: user }],
  });
  return response.content[0]?.text || "";
}

function chartSummary(reading) {
  return [
    `HD-Typ: ${reading.reading_type || reading.type || "—"}`,
    `Strategie: ${reading.strategy || "—"}`,
    `Autorität: ${reading.authority || "—"}`,
    `Profil: ${reading.profile || "—"}`,
    `Definierte Zentren: ${Array.isArray(reading.defined_centers) ? reading.defined_centers.join(", ") : reading.defined_centers || "—"}`,
    `Undefinierte Zentren: ${Array.isArray(reading.undefined_centers) ? reading.undefined_centers.join(", ") : reading.undefined_centers || "—"}`,
    `Not-Self-Theme: ${reading.not_self_theme || "—"}`,
  ].join("\n");
}

// ─── Job Processor ────────────────────────────────────────────────────────────

async function processJob(job, { supabase, supabasePublic, anthropic }) {
  const { mode, reading_id, connection_reading_id, person_a_id, person_b_id } = job.data;
  console.log(`📥 [Psychology] Job ${job.id} | mode=${mode} | person_a=${person_a_id}`);

  // 1. Chart-Daten laden
  const personA = await fetchReadingData(supabasePublic, person_a_id);
  let personB = null;
  let compositeData = null;

  if (mode === "connection") {
    personB = await fetchReadingData(supabasePublic, person_b_id);
    if (connection_reading_id) {
      const connData = await fetchConnectionData(supabasePublic, connection_reading_id);
      compositeData = connData?.composite_data || null;
    }
  }

  // 2. DB-Eintrag anlegen
  const psychology_reading_id = await createPsychologyRecord(supabase, {
    mode, reading_id, connection_reading_id, person_a_id, person_b_id,
  });
  console.log(`   ✅ [Psychology] Record erstellt: ${psychology_reading_id}`);

  // Deterministische Fakten-Blöcke (Whitelist) als Erdung für alle Linsen
  const factsA = factsFor(personA);
  const factsB = personB ? factsFor(personB) : "";
  const connectionBlock = personB
    ? `\n\n=== PERSON B ===\n${chartSummary(personB)}\n\n${factsB}`
    : "";

  try {
    // 3. Call 1 — Vier Linsen in einem kombinierten Call.
    // Konsolidiert (vormals 4 Einzel-Calls): halbiert Kosten/Latenz und erzeugt
    // kohärentere Cross-Linsen-Analyse, da das Modell alle vier Perspektiven
    // gemeinsam auf dieselben Chart-Fakten anwendet.
    console.log("   🧠 [Psychology] Call 1: Vier Linsen (kombiniert)...");
    const lenses = await claudeJSON(
      anthropic,
      `Du bist ein interdisziplinäres Team aus fünf Experten — Polyvagal-Theorie,
Bindungstheorie, Jungsche Psychologie, Big-Five-Persönlichkeitspsychologie und
Internal Family Systems (IFS) — und verbindest jede Disziplin mit Human Design.
Antworte ausschließlich auf Deutsch. Antworte NUR mit einem validen JSON-Objekt,
kein Markdown, keine Erklärungen. ${GROUNDING_RULE}

=== FACHWISSEN POLYVAGAL ===
${KNOWLEDGE.polyvagal}

=== FACHWISSEN BINDUNGSTHEORIE ===
${KNOWLEDGE.attachment}

=== FACHWISSEN JUNG ===
${KNOWLEDGE.jungian}

=== FACHWISSEN BIG FIVE ===
${KNOWLEDGE.bigfive}

=== FACHWISSEN IFS (PARTS-WORK) ===
${KNOWLEDGE.ifs}`,
      `${chartSummary(personA)}

${factsA}${connectionBlock}

Analysiere die Person durch alle fünf Linsen — jede nutzt ausschließlich die
obigen Chart-Fakten und ihr jeweiliges Fachwissen. Den Profil-Archetyp (Jung)
aus dem Profil ableiten; Big Five jeden Faktor als Spektrum/Hypothese rahmen;
IFS-Teile (Protectors/Exiles) aus offenen Zentren und Not-Self ableiten.
Output als EIN JSON-Objekt mit exakt dieser Struktur:
{
  "polyvagal": { "summary": "string", "patterns": ["string"], "regulation_approach": "string", "connection_dynamics": "string" },
  "attachment": { "attachment_type": "string", "triggers": ["string"], "dynamics": "string", "connection_patterns": "string" },
  "jungian": { "shadow_theme": "string", "archetype": "string", "individuation_path": "string", "shadow_projections": ["string"] },
  "bigfive": { "openness": "string", "conscientiousness": "string", "extraversion": "string", "agreeableness": "string", "neuroticism": "string", "scientific_framing": "string" },
  "ifs": { "protectors": ["string"], "exiles": ["string"], "self_energy": "string", "integration_path": "string" }
}`,
      6000
    );

    // Linsen extrahieren (mit Fallback auf {}, falls ein Teil fehlt)
    const polyvagal = lenses.polyvagal || {};
    const attachment = lenses.attachment || {};
    const jungian = lenses.jungian || {};
    const bigfive = lenses.bigfive || {};
    const ifs = lenses.ifs || {};

    // 7. Call 2 — Synthese
    console.log("   🧠 [Psychology] Call 2: Synthese...");
    const clientName = personA.client_name || personA.reading_data?.client_name || "der Klient";
    const connectionSection = mode === "connection"
      ? "\n[Connection-Mode: Ergänze Beziehungsabschnitte über die Dynamik zwischen beiden Personen.]"
      : "";

    const synthesis = await claudeText(
      anthropic,
      `Du bist ein einfühlsamer psychologischer Coach der Human Design als Diagnosetool und moderne Psychologie als Interventionsrahmen verbindet. Schreibe warm, tiefgründig und direkt ansprechend auf Deutsch. Keine Fachbegriffe ohne Erklärung. Antworte mit formatiertem Markdown.`,
      `Name: ${clientName}

Polyvagal-Analyse: ${JSON.stringify(polyvagal)}
Attachment-Analyse: ${JSON.stringify(attachment)}
Jungscher Schatten: ${JSON.stringify(jungian)}
Big Five: ${JSON.stringify(bigfive)}
IFS / Innere Anteile: ${JSON.stringify(ifs)}

Schreibe ein integriertes psychologisches Coaching-Profil (1700-2700 Wörter).
Struktur:
## Dein psychologisches Profil
### Dein Nervensystem
### Deine Bindungsmuster
### Dein Schatten & Dein Weg
### Deine inneren Anteile
### Wissenschaftliche Einordnung
## Dein Weg zur Integration${connectionSection}`
    );

    // 7b. Validierungs-Pipeline (nur Single-Mode):
    // Prüft die Synthese gegen die echten Chart-Fakten und korrigiert erfundene
    // Tore/Zentren/Kanäle. Im Connection-Mode übersprungen, da die Synthese auch
    // Person B's Chart referenziert — eine Validierung nur gegen Person A würde
    // gültige B-Tore fälschlich als Halluzination flaggen.
    let finalSynthesis = synthesis;
    if (mode === "single") {
      try {
        console.log("   🔎 [Psychology] Validierungs-Pipeline...");
        const pipe = await runReadingPipeline(synthesis, personA.chart || {}, {
          supabasePublic,
          readingId: psychology_reading_id,
          readingType: "psychology-single",
          template: "psychology-synthesis",
        });
        finalSynthesis = pipe.text;
        console.log(
          `   ✅ [Psychology] Pipeline: validated=${pipe.validated} corrected=${pipe.corrected} errors=${pipe.errorCount}`
        );
      } catch (pipeErr) {
        console.warn(`   ⚠️ [Psychology] Pipeline-Fehler, nutze Original-Synthese: ${pipeErr.message}`);
      }
    }

    // 8. Ergebnis speichern
    await updatePsychologyRecord(supabase, psychology_reading_id, {
      polyvagal,
      attachment,
      jungian,
      bigfive,
      ifs,
      synthesis: finalSynthesis,
      status: "completed",
    });

    console.log(`   ✅ [Psychology] Job ${job.id} abgeschlossen`);
    return { psychology_reading_id, status: "completed" };

  } catch (err) {
    console.error(`   ❌ [Psychology] Job ${job.id} fehlgeschlagen:`, err.message);
    await updatePsychologyRecord(supabase, psychology_reading_id, {
      status: "failed",
      error_message: err.message,
    });
    throw err;
  }
}

// ─── Queue Export ─────────────────────────────────────────────────────────────

let psychologyQueue = null;

export function getPsychologyQueue() {
  return psychologyQueue;
}

export function startPsychologyWorker() {
  const { redis, supabase, supabasePublic, anthropic } = createClients();

  psychologyQueue = new Queue(QUEUE_NAME, { connection: redis });

  const worker = new Worker(
    QUEUE_NAME,
    (job) => processJob(job, { supabase, supabasePublic, anthropic }),
    {
      connection: redis,
      concurrency: 2,
      settings: { maxStalledCount: 1 },
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`❌ [Psychology] Job failed: ${job?.id}`, err.message);
  });

  console.log(`🟢 Psychology Worker aktiv (Queue: ${QUEUE_NAME})`);
  return { worker, queue: psychologyQueue };
}
