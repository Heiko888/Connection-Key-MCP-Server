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

async function claudeJSON(anthropic, system, user) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
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
    // 3. Call 1 — Polyvagal
    console.log("   🧠 [Psychology] Call 1: Polyvagal...");
    const polyvagal = await claudeJSON(
      anthropic,
      `Du bist ein Experte für Polyvagal-Theorie und Human Design. Antworte ausschließlich auf Deutsch. Antworte NUR mit validem JSON, kein Markdown, keine Erklärungen. ${GROUNDING_RULE}

=== FACHWISSEN POLYVAGAL ===
${KNOWLEDGE.polyvagal}`,
      `${chartSummary(personA)}

${factsA}${connectionBlock}

Analysiere das Nervensystem-Muster auf Basis der obigen Chart-Fakten. Output als JSON:
{ "summary": "string", "patterns": ["string"], "regulation_approach": "string", "connection_dynamics": "string" }`
    );

    // 4. Call 2 — Attachment
    console.log("   🧠 [Psychology] Call 2: Attachment...");
    const attachment = await claudeJSON(
      anthropic,
      `Du bist ein Experte für Attachment Theory und Human Design. Antworte ausschließlich auf Deutsch. Antworte NUR mit validem JSON. ${GROUNDING_RULE}

=== FACHWISSEN BINDUNGSTHEORIE ===
${KNOWLEDGE.attachment}`,
      `${chartSummary(personA)}

${factsA}${connectionBlock}

Mappe auf Bindungsmuster — nutze die Zuordnungen aus dem Fachwissen und die
konkreten offenen/definierten Zentren oben. Output als JSON:
{ "attachment_type": "string", "triggers": ["string"], "dynamics": "string", "connection_patterns": "string" }`
    );

    // 5. Call 3 — Jung
    console.log("   🧠 [Psychology] Call 3: Jung...");
    const jungian = await claudeJSON(
      anthropic,
      `Du bist ein Experte für Jungsche Psychologie und Human Design. Antworte ausschließlich auf Deutsch. Antworte NUR mit validem JSON. ${GROUNDING_RULE}

=== FACHWISSEN JUNG ===
${KNOWLEDGE.jungian}`,
      `${chartSummary(personA)}

${factsA}

Leite den Profil-Archetyp aus dem Profil oben ab und analysiere Schatten und
Individuationsweg. Output als JSON:
{ "shadow_theme": "string", "archetype": "string", "individuation_path": "string", "shadow_projections": ["string"] }`
    );

    // 6. Call 4 — Big Five
    console.log("   🧠 [Psychology] Call 4: Big Five...");
    const bigfive = await claudeJSON(
      anthropic,
      `Du bist ein Persönlichkeitspsychologe mit Expertise in Big Five und Human Design. Antworte ausschließlich auf Deutsch. Antworte NUR mit validem JSON. ${GROUNDING_RULE}

=== FACHWISSEN BIG FIVE ===
${KNOWLEDGE.bigfive}`,
      `Typ: ${personA.type || "—"}, Profil: ${personA.profile || "—"}

${factsA}

Ordne wissenschaftlich in Big Five ein (jeder Faktor als Spektrum, als Hypothese
gerahmt). Output als JSON:
{ "openness": "string", "conscientiousness": "string", "extraversion": "string", "agreeableness": "string", "neuroticism": "string", "scientific_framing": "string" }`
    );

    // 7. Call 5 — Synthese
    console.log("   🧠 [Psychology] Call 5: Synthese...");
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

Schreibe ein integriertes psychologisches Coaching-Profil (1500-2500 Wörter).
Struktur:
## Dein psychologisches Profil
### Dein Nervensystem
### Deine Bindungsmuster
### Dein Schatten & Dein Weg
### Wissenschaftliche Einordnung
## Dein Weg zur Integration${connectionSection}`
    );

    // 8. Ergebnis speichern
    await updatePsychologyRecord(supabase, psychology_reading_id, {
      polyvagal,
      attachment,
      jungian,
      bigfive,
      synthesis,
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
