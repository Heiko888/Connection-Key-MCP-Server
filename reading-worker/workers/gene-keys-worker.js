/**
 * W13 — Gene-Keys Worker
 * Queue: reading-queue-v4-gene-keys
 *
 * Gene-Keys-Reading: EINZEL-Chart-Analyse, die die Tore des Charts auf Gene Keys
 * (Schatten → Geschenk → Siddhi) abbildet. Die Aktivierungssequenz (Life's Work,
 * Evolution, Radiance, Purpose) leitet sich aus Sonne/Erde in Persönlichkeit & Design
 * ab, wenn vorhanden. Kontemplativer Ton, KEIN Score.
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
import { syncNarrativeToReading } from "../lib/panel-narrative.js";

const MODEL = "claude-sonnet-4-6";
const QUEUE_NAME = "reading-queue-v4-gene-keys";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = path.join(__dirname, "..", "knowledge", "gene-keys");

function loadKnowledge(name) {
  try {
    return fs.readFileSync(path.join(KNOWLEDGE_DIR, `${name}.md`), "utf8");
  } catch (err) {
    console.warn(`   ⚠️ [GeneKeys] Wissensdatei ${name}.md nicht ladbar: ${err.message}`);
    return "";
  }
}

const KNOWLEDGE = loadKnowledge("gene-keys-knowledge");

const GROUNDING_RULE =
  "WICHTIG: Gene Key N = Tor N. Verwende AUSSCHLIESSLICH die kanonischen Triaden " +
  "(Schatten/Geschenk/Siddhi) aus der Wissensbasis — erfinde KEINE eigenen Namen und " +
  "KEINE Tore, die nicht in den Chart-Fakten stehen. Wenn Sonne/Erde (Persönlichkeit & " +
  "Design) nicht eindeutig vorliegen, mache transparent, dass die exakte " +
  "Aktivierungssequenz die genauen Planetenpositionen braucht, und arbeite mit den " +
  "vorhandenen Toren. Kontemplativ, poetisch, einladend — keine Diagnose, kein Score.";

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
    .schema("public").from("gene_keys_readings")
    .update({ ...fields, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(`gene_keys_readings UPDATE fehlgeschlagen: ${error.message}`);
}

async function createRecord(supabase, { user_id, reading_id }) {
  const { data, error } = await supabase
    .schema("public").from("gene_keys_readings")
    .insert({ user_id: user_id || null, reading_id: reading_id || null, status: "processing", progress: 0 })
    .select("id").single();
  if (error) throw new Error(`gene_keys_readings INSERT fehlgeschlagen: ${error.message}`);
  return data.id;
}

function chartFactsBlock(chart) {
  try { return buildFactsBlock(chart || {}, { readingType: "detailed" }); }
  catch (err) { console.warn(`   ⚠️ [GeneKeys] Faktenblock nicht baubar: ${err.message}`); return ""; }
}

// Sammelt Tor-Hinweise + (falls vorhanden) Sonne/Erde-Aktivierungen deterministisch.
function buildGatesBlock(chart) {
  const lines = [];
  lines.push("=== GENE-KEYS-KONTEXT (deterministisch — Wahrheitsquelle) ===");
  lines.push(`HD-Typ: ${chart?.type || "—"} | Profil: ${chart?.profile || "—"}`);

  const gates = Array.isArray(chart?.gates)
    ? chart.gates.map((g) => (typeof g === "object" ? (g.number ?? g.gate ?? g.id) : g)).filter((n) => n != null)
    : [];
  lines.push(`Aktive Tore (= Gene Keys): ${gates.length ? gates.join(", ") : "—"}`);

  // Best effort: Sonne/Erde aus gängigen Strukturen (personality/design) ziehen.
  const pick = (obj, body) => {
    if (!obj || typeof obj !== "object") return null;
    const v = obj[body] || obj[body?.toLowerCase?.()] || obj[body?.toUpperCase?.()];
    if (v == null) return null;
    if (typeof v === "object") return v.gate != null ? `${v.gate}${v.line != null ? "." + v.line : ""}` : null;
    return String(v);
  };
  const p = chart?.personality || chart?.conscious || chart?.design_personality;
  const d = chart?.design || chart?.unconscious;
  const pSun = pick(p, "sun") || pick(p, "Sun");
  const pEarth = pick(p, "earth") || pick(p, "Earth");
  const dSun = pick(d, "sun") || pick(d, "Sun");
  const dEarth = pick(d, "earth") || pick(d, "Earth");
  if (pSun || pEarth || dSun || dEarth) {
    lines.push("Aktivierungssequenz (falls ableitbar):");
    lines.push(`  Life's Work (Persönlichkeits-Sonne): ${pSun || "—"}`);
    lines.push(`  Evolution (Persönlichkeits-Erde): ${pEarth || "—"}`);
    lines.push(`  Radiance (Design-Sonne): ${dSun || "—"}`);
    lines.push(`  Purpose (Design-Erde): ${dEarth || "—"}`);
  } else {
    lines.push("Sonne/Erde-Aktivierungen nicht eindeutig im Chart — Aktivierungssequenz");
    lines.push("aus den vorhandenen Toren ableiten und Einschränkung transparent machen.");
  }
  lines.push("=== ENDE GENE-KEYS-KONTEXT ===");
  return lines.join("\n");
}

// Strukturierter Markdown-Anhang für den Reading-Text (PDF/E-Mail/Klienten-Ansicht):
// die Aktivierungssequenz als Übersicht mit kanonischen Triaden. Das Narrativ erwähnt
// sie nur im Fließtext — ohne diesen Anhang fehlt sie im PDF-Export.
// Gegenstück auf .167: frontend-coach/lib/panel-readings.ts (buildGeneKeysAppendix).
export function buildActivationAppendix(analysis) {
  const seq = Array.isArray(analysis?.activation_sequence) ? analysis.activation_sequence : [];
  const spheres = Array.isArray(analysis?.spheres) ? analysis.spheres : [];
  if (!seq.length && !spheres.length) return "";

  const lines = ["", "---", ""];
  if (seq.length) {
    lines.push("## Deine Aktivierungssequenz im Überblick", "");
    for (const s of seq) {
      const title = [s.sphere, s.gene_key ? `Gene Key ${s.gene_key}` : null].filter(Boolean).join(" — ");
      if (title) lines.push(`#### ${title}`);
      const triad = [
        s.shadow ? `**Schatten:** ${s.shadow}` : null,
        s.gift ? `**Geschenk:** ${s.gift}` : null,
        s.siddhi ? `**Siddhi:** ${s.siddhi}` : null,
      ].filter(Boolean).join("  ·  ");
      if (triad) lines.push(triad);
      if (s.meaning) lines.push(s.meaning);
      if (s.contemplation) lines.push(`**Kontemplation:** ${s.contemplation}`);
      lines.push("");
    }
  }
  if (spheres.length) {
    lines.push("## Weitere Gene Keys in deinem Chart", "");
    for (const s of spheres) {
      if (s.gene_key) lines.push(`#### Gene Key ${s.gene_key}`);
      const triad = [
        s.shadow ? `**Schatten:** ${s.shadow}` : null,
        s.gift ? `**Geschenk:** ${s.gift}` : null,
        s.siddhi ? `**Siddhi:** ${s.siddhi}` : null,
      ].filter(Boolean).join("  ·  ");
      if (triad) lines.push(triad);
      if (s.note) lines.push(s.note);
      lines.push("");
    }
  }
  return lines.join("\n");
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
  if (response.stop_reason === "max_tokens") console.warn(`   ⚠️ [GeneKeys] claudeJSON an max_tokens (${maxTokens}) abgeschnitten.`);
  return parseJSONLoose(response.content[0]?.text || "{}");
}
async function claudeText(anthropic, system, user, maxTokens = 4096) {
  const response = await anthropic.messages.create({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: "user", content: user }] });
  return response.content[0]?.text || "";
}

async function processJob(job, { supabase, anthropic }) {
  const { user_id, reading_id, gene_keys_reading_id: existingId } = job.data;
  console.log(`📥 [GeneKeys] Job ${job.id} | user=${user_id} | reading=${reading_id}`);

  let recordId;
  if (existingId) {
    recordId = existingId;
    await updateRecord(supabase, recordId, { status: "processing", progress: 5 });
  } else {
    recordId = await createRecord(supabase, { user_id, reading_id });
  }

  try {
    if (!reading_id) throw new Error("reading_id ist erforderlich — Gene-Keys-Reading braucht ein Quell-Reading mit Chart.");
    const reading = await fetchReadingData(supabase, reading_id);
    const chart = reading.chart || {};
    if (!chart || !Object.keys(chart).length) throw new Error("Quell-Reading enthält keine Chart-Daten.");
    const clientName = reading.client_name || "du";

    await updateRecord(supabase, recordId, { progress: 20 });
    const factsBlock = chartFactsBlock(chart);
    const gatesBlock = buildGatesBlock(chart);

    console.log("   🧠 [GeneKeys] Call 1: strukturierte Analyse...");
    const analysis = await claudeJSON(
      anthropic,
      `Du bist ein erfahrener Gene-Keys-Begleiter (im Sinne von Richard Rudd). Du
übersetzt die Tore eines Charts in ihre Gene-Keys-Frequenzen (Schatten → Geschenk →
Siddhi). Antworte ausschließlich auf Deutsch und NUR mit einem validen JSON-Objekt
(kein Markdown, nichts davor/danach).
${GROUNDING_RULE}

=== FACHWISSEN GENE KEYS (inkl. kanonischer 64 Triaden) ===
${KNOWLEDGE}`,
      `${factsBlock}

${gatesBlock}

Erstelle das Gene-Keys-Reading als EIN JSON-Objekt mit EXAKT dieser Struktur
(Strings knapp, kanonische Triaden verwenden):
{
  "core_theme": "<Kernthema der Reise in 1 Satz>",
  "activation_sequence": [
    // die 4 Primärsphären, wenn ableitbar (sonst die wichtigsten vorhandenen Tore),
    // je Eintrag:
    { "sphere": "<Life's Work | Evolution | Radiance | Purpose>", "gene_key": "<Nr(.Linie)>", "shadow": "<kanonischer Schatten>", "gift": "<kanonisches Geschenk>", "siddhi": "<kanonischer Siddhi>", "meaning": "<was diese Sphäre für den Menschen bedeutet>", "contemplation": "<eine Kontemplationsfrage>" }
  ],
  "spheres": [
    // optional: bis zu 4 weitere markante Tore der Person als Gene Keys
    { "gene_key": "<Nr>", "shadow": "<...>", "gift": "<...>", "siddhi": "<...>", "note": "<kurzer Bezug>" }
  ],
  "shadow_work": {
    "central_shadow": "<der zentrale Schatten der Reise>",
    "path_to_gift": "<wie sich daraus das Geschenk entfaltet (Kontemplation, nicht Wegmachen)>"
  },
  "contemplation": ["<max 3 Kontemplations-Impulse zum Verweilen>"],
  "insights": {
    "summary": "<2-3 Sätze Essenz>",
    "gifts_emerging": ["<max 3 sich entfaltende Geschenke>"]
  }
}`,
      8000
    );

    const coreKeys = ["core_theme", "activation_sequence", "shadow_work"];
    if (coreKeys.filter((k) => analysis[k] !== undefined).length === 0) {
      throw new Error("Analyse-Call lieferte kein verwertbares JSON (Kernfelder fehlen)");
    }
    await updateRecord(supabase, recordId, { progress: 60 });

    console.log("   🧠 [GeneKeys] Call 2: Narrativ...");
    const narrative = await claudeText(
      anthropic,
      `Du bist ein einfühlsamer Gene-Keys-Begleiter. Schreibe kontemplativ, poetisch,
warm und einladend auf Deutsch (Du-Form) — eine Einladung zum Verweilen, keine
Bewertung, keine To-dos. Erkläre Begriffe knapp. Antworte mit formatiertem Markdown.
${GROUNDING_RULE}`,
      `Name: ${clientName}

Strukturierte Gene-Keys-Analyse (Wahrheitsquelle — nichts hinzufügen, kanonische Triaden):
${JSON.stringify(analysis)}

Schreibe einen kontemplativen Bericht (900-1400 Wörter) in dieser Struktur:
## Deine Gene-Keys-Reise
### Dein Kernthema
### Deine Aktivierungssequenz (Schatten → Geschenk → Siddhi)
### Die Einladung deines zentralen Schattens
### Womit du verweilen darfst`,
      4096
    );

    await updateRecord(supabase, recordId, {
      core_theme: analysis.core_theme || null,
      activation_sequence: analysis.activation_sequence || [],
      spheres: analysis.spheres || [],
      shadow_work: analysis.shadow_work || {},
      contemplation: analysis.contemplation || [],
      insights: analysis.insights || {},
      narrative,
      metadata: { reading_id, client_name: clientName },
      model: MODEL,
      status: "completed",
      progress: 100,
      completed_at: new Date().toISOString(),
    });

    // Narrativ + strukturierte Aktivierungssequenz ins Eltern-Reading spiegeln
    // (reading_data.text) — sonst zeigen PDF/E-Mail/Klienten-Ansicht nur den
    // Panel-Platzhalter bzw. es fehlt die Aktivierungssequenz. Best-Effort.
    await syncNarrativeToReading(supabase, reading_id, narrative + buildActivationAppendix(analysis), "GeneKeys");

    console.log(`   ✅ [GeneKeys] Job ${job.id} abgeschlossen`);
    return { gene_keys_reading_id: recordId, status: "completed" };
  } catch (err) {
    console.error(`   ❌ [GeneKeys] Job ${job.id} fehlgeschlagen:`, err.message);
    await updateRecord(supabase, recordId, { status: "failed", error_message: err.message });
    throw err;
  }
}

let geneKeysQueue = null;
export function getGeneKeysQueue() { return geneKeysQueue; }
export function startGeneKeysWorker() {
  const { redis, supabase, anthropic } = createClients();
  geneKeysQueue = new Queue(QUEUE_NAME, { connection: redis });
  const worker = new Worker(QUEUE_NAME, (job) => processJob(job, { supabase, anthropic }), {
    connection: redis, concurrency: 2, settings: { maxStalledCount: 1 },
  });
  worker.on("failed", (job, err) => console.error(`❌ [GeneKeys] Job failed: ${job?.id}`, err.message));
  console.log(`🟢 Gene-Keys Worker aktiv (Queue: ${QUEUE_NAME})`);
  return { worker, queue: geneKeysQueue };
}
