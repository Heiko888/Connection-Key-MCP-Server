/**
 * Combined Reading Worker (V3 + V4)
 * MIT Chart-Integration: Ruft /api/chart/calculate auf connection-key auf
 *
 * Änderungen gegenüber Original:
 * - NEU: fetchChartData() Hilfsfunktion für Chart-Berechnung via connection-key
 * - FIX: processHumanDesignJob holt Chart-Daten automatisch wenn nicht vorhanden
 * - FIX: V4 Worker holt Chart-Daten automatisch wenn nicht vorhanden
 * - FIX: Connection Worker nutzt echte Charts statt Placeholder
 * - FIX: Penta Worker nutzt echte Charts statt Placeholder
 * - CLEANUP: Unreachable Code nach throw entfernt
 * - CLEANUP: OpenAI model config bereinigt (nur Claude aktiv)
 *
 * Stand: 09.03.2026
 */

import express from "express";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { createLiveReadingRouter } from "./lib/live-reading/routes.js";
import { startPsychologyWorker, getPsychologyQueue } from "./workers/psychology-worker.js";
import { calculateCrossReference } from "./lib/transitCrossReference.js";
import { getCrossName, buildCrossPromptFragment } from "./lib/incarnation-cross-helper.js";
import { runReadingPipeline, setPipelineSupabase } from "./reading-pipeline.js";
import { classifyTwoPersonChannels, classifyCompositeConnections, HD_CHANNELS } from "./lib/composite-classification.js";
import { buildFactsBlock, formatCompositeBlock, formatConditioningMatrix } from "./lib/facts-builder.js";

// ── Feature-Flag Baustein 4 ──────────────────────────────────────────────────
// READING_STRICT_MODE=true → buildChartInfo() wird durch buildFactsBlock() ersetzt,
// der Fakten-Block enthält Whitelist + Verbote + Wahrheitsquelle-Instruktion.
// Bei Problemen: READING_STRICT_MODE=false setzen, altes Verhalten kommt zurück.
const READING_STRICT_MODE = (process.env.READING_STRICT_MODE || 'true').toLowerCase() !== 'false';

const app = express();
app.use(express.json());

// ======================================================
// Chart API - Proxy zu connection-key auf 138
// ======================================================
const CHART_SERVICE_URL = process.env.CHART_SERVICE_URL || "http://connection-key:3000/api/chart/calculate";

// ── Telegram Hilfsfunktionen ─────────────────────────────────────────────────
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || '';

function escapeTgMd2(text) {
  if (!text) return '';
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

async function sendTelegramMessage(chatId, text, parseMode = 'MarkdownV2') {
  if (!TELEGRAM_BOT_TOKEN || !chatId) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn(`[Telegram] sendMessage failed (${res.status}): ${body.substring(0, 100)}`);
    }
  } catch (e) {
    console.warn('[Telegram] sendMessage error:', e.message);
  }
}

// ── Mattermost Integration ────────────────────────────────────────────────────
// Webhook-URLs per Kanal — Fallback auf MATTERMOST_WEBHOOK_URL
const MM_WEBHOOKS = {
  readings: process.env.MATTERMOST_WEBHOOK_READINGS || process.env.MATTERMOST_WEBHOOK_URL || '',
  channel:  process.env.MATTERMOST_WEBHOOK_CHANNEL  || process.env.MATTERMOST_WEBHOOK_URL || '',
  business: process.env.MATTERMOST_WEBHOOK_BUSINESS || process.env.MATTERMOST_WEBHOOK_URL || '',
  errors:   process.env.MATTERMOST_WEBHOOK_ERRORS   || process.env.MATTERMOST_WEBHOOK_URL || '',
};

/**
 * Sendet eine Nachricht an Mattermost.
 * @param {string} text   - Markdown-Text
 * @param {'readings'|'channel'|'business'|'errors'} type - Kanal-Routing
 */
async function sendMattermost(text, type = 'readings') {
  const url = MM_WEBHOOKS[type] || MM_WEBHOOKS.readings;
  if (!url) return; // nicht konfiguriert — still ignorieren
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn(`[Mattermost] Fehler (${res.status}): ${body.substring(0, 100)}`);
    }
  } catch (e) {
    console.warn('[Mattermost] sendMessage error:', e.message);
  }
}

/**
 * fetchChartData() – Zentrale Hilfsfunktion
 * Ruft connection-key:3000/api/chart/calculate auf und gibt Chart-Daten zurück.
 * Gibt null zurück bei Fehler (Reading wird dann ohne Chart generiert).
 */
async function fetchChartData(birthDate, birthTime, birthPlace) {
  if (!birthDate || !birthTime || !birthPlace) {
    console.warn("   ⚠️ [Chart] Fehlende Geburtsdaten, überspringe Chart-Berechnung");
    return null;
  }
  try {
    console.log(`   📊 [Chart] Berechne Chart für ${birthPlace} (${birthDate} ${birthTime})...`);
    const chartRes = await fetch(CHART_SERVICE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.API_KEY || "" },
      body: JSON.stringify({ birthDate, birthTime, birthPlace }),
      signal: AbortSignal.timeout(15000),
    });
    if (!chartRes.ok) {
      console.warn(`   ⚠️ [Chart] HTTP ${chartRes.status} – Chart-Berechnung fehlgeschlagen`);
      return null;
    }
    const data = await chartRes.json();
    const chart = data.chart || data;
    console.log(`   ✅ [Chart] Typ=${chart.type}, Profil=${chart.profile}, Autorität=${chart.authority}`);
    return chart;
  } catch (err) {
    console.warn(`   ⚠️ [Chart] Fehler: ${err.message} – Reading wird ohne Chart generiert`);
    return null;
  }
}

/**
 * fetchChartFromReading(personId)
 * Lädt Chart-Daten aus public.readings (vorberechnete Daten).
 * Fallback: Berechnung via Chart-API mit Geburtsdaten aus dem Reading.
 */
async function fetchChartFromReading(personId) {
  if (!personId) return null;
  try {
    const { data, error } = await supabasePublic
      .from("readings")
      .select("chart_data, reading_data, client_name, birth_data, birth_data2")
      .eq("id", personId)
      .maybeSingle();

    if (error) {
      console.warn(`   ⚠️ [Chart] Supabase-Fehler für Reading ${personId}:`, error.message);
    }

    // 1. Vorberechneter Chart in chart_data
    if (data?.chart_data && data.chart_data.type) {
      console.log(`   ✅ [Chart] Reading ${personId}: Chart aus DB geladen (${data.chart_data.type})`);
      return { chart: data.chart_data, name: data.client_name };
    }

    // 2. Chart in reading_data.chart_data
    if (data?.reading_data?.chart_data?.type) {
      console.log(`   ✅ [Chart] Reading ${personId}: Chart aus reading_data geladen`);
      return { chart: data.reading_data.chart_data, name: data.client_name };
    }

    // 3. Fallback: Neu berechnen mit Geburtsdaten aus birth_data (jsonb)
    const bd = data?.birth_data || {};
    const birthDate = bd.date;
    const birthTime = bd.time;
    const birthPlace = bd.location || bd.name;

    if (birthDate && birthTime && birthPlace) {
      console.log(`   📊 [Chart] Reading ${personId}: Kein vorberechneter Chart – berechne neu...`);
      const chart = await fetchChartData(birthDate, birthTime, birthPlace);
      return { chart, name: data?.client_name };
    }

    console.warn(`   ⚠️ [Chart] Reading ${personId}: Keine Chart-Daten und keine Geburtsdaten vorhanden`);
    return { chart: null, name: data?.client_name };
  } catch (err) {
    console.warn(`   ⚠️ [Chart] fetchChartFromReading(${personId}) Fehler:`, err.message);
    return null;
  }
}

// Chart-Proxy Endpoint (für externe Aufrufe)
app.post("/api/chart/calculate", async (req, res) => {
  try {
    const { birthDate, birthTime, birthPlace } = req.body || {};
    if (!birthDate || !birthTime || !birthPlace) {
      return res.status(400).json({
        success: false,
        error: "birthDate, birthTime und birthPlace sind erforderlich"
      });
    }
    const chart = await fetchChartData(birthDate, birthTime, birthPlace);
    if (!chart) {
      return res.status(500).json({ success: false, error: "Chart-Berechnung fehlgeschlagen" });
    }
    return res.json({
      type: chart.type || "Generator",
      profile: chart.profile || "1/3",
      authority: chart.authority || "Emotional",
      strategy: chart.strategy || "Warten und antworten",
      centers: chart.centers || {},
      channels: chart.channels || [],
      gates: chart.gates || [],
    });
  } catch (err) {
    console.error("[Chart API] Fehler:", err);
    return res.status(500).json({ success: false, error: err.message || "Chart-Berechnung fehlgeschlagen" });
  }
});

// ======================================================
// loadKnowledge()
// ======================================================
function loadKnowledge(knowledgePath = "/app/knowledge") {
  const knowledge = {};
  if (!fs.existsSync(knowledgePath)) {
    console.warn(`⚠️  Knowledge-Pfad nicht gefunden: ${knowledgePath}`);
    return knowledge;
  }
  try {
    const files = fs.readdirSync(knowledgePath);
    files.forEach(file => {
      const filePath = path.join(knowledgePath, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile() && (file.endsWith('.txt') || file.endsWith('.md'))) {
        const content = fs.readFileSync(filePath, 'utf8');
        const key = path.basename(file, path.extname(file));
        knowledge[key] = content;
        console.log(`✅ Knowledge geladen: ${key}`);
      } else if (stat.isDirectory()) {
        try {
          const subFiles = fs.readdirSync(filePath);
          subFiles.forEach(subFile => {
            if (subFile.endsWith('.txt') || subFile.endsWith('.md')) {
              const subFilePath = path.join(filePath, subFile);
              const subContent = fs.readFileSync(subFilePath, 'utf8');
              const subKey = `${file}-${path.basename(subFile, path.extname(subFile))}`;
              knowledge[subKey] = subContent;
              console.log(`✅ Knowledge geladen (Unterordner): ${subKey}`);
            }
          });
        } catch (subError) {
          console.warn(`⚠️  Konnte Unterordner nicht lesen: ${filePath}`, subError);
        }
      }
    });
  } catch (error) {
    console.error("❌ Fehler beim Laden der Knowledge:", error);
  }
  return knowledge;
}

// ======================================================
// loadTemplates()
// ======================================================
function loadTemplates(templatePath = "/app/templates") {
  const templates = {};
  if (!fs.existsSync(templatePath)) {
    console.warn(`⚠️  Template-Pfad nicht gefunden: ${templatePath}`);
    return templates;
  }
  try {
    const files = fs.readdirSync(templatePath);
    files.forEach(file => {
      if (file.endsWith('.txt') || file.endsWith('.md') || file.endsWith('.json')) {
        const filePath = path.join(templatePath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const key = path.basename(file, path.extname(file));
        templates[key] = content;
        console.log(`✅ Template geladen: ${key}`);
      }
    });
  } catch (error) {
    console.error("❌ Fehler beim Laden der Templates:", error);
  }
  return templates;
}

// ======================================================
// Knowledge & Templates laden
// ======================================================
const knowledge = loadKnowledge("/app/knowledge");
const templates = loadTemplates("/app/templates");

console.log("📚 Knowledge-Dateien:", Object.keys(knowledge).length);
console.log("📄 Template-Dateien:", Object.keys(templates).length);

// ======================================================
// Supabase Clients
// ======================================================
const supabaseUrl = process.env.V4_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.V4_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase fehlt! Setze V4_SUPABASE_URL und V4_SUPABASE_SERVICE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'v4' }
});

const supabasePublic = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Baustein 8: Pipeline bekommt Supabase-Client fuer validation-log-Insert
setPipelineSupabase(supabasePublic);

console.log("✅ Supabase (V4):", supabaseUrl.substring(0, 40) + "...");

// ======================================================
// Error Monitoring — Webhook Notification
// ======================================================
const ERROR_WEBHOOK_URL = process.env.ERROR_WEBHOOK_URL || null;

async function notifyError(context, err) {
  if (!ERROR_WEBHOOK_URL) return;
  const text = `🚨 *Reading-Worker Fehler*\n*Kontext:* ${context}\n*Fehler:* ${err?.message || String(err)}\n*Zeit:* ${new Date().toISOString()}`;
  try {
    await fetch(ERROR_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (webhookErr) {
    console.warn("⚠️ Webhook-Benachrichtigung fehlgeschlagen:", webhookErr.message);
  }
}

// ======================================================
// Redis / BullMQ
// ======================================================
const redis = new IORedis({
  host: process.env.REDIS_HOST || "redis",
  port: 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null
});

// ======================================================
// KI-Modell-Konfiguration (nur Claude)
// ======================================================
const MODEL_CONFIG = {
  "claude-sonnet": {
    provider: "claude",
    models: ["claude-sonnet-4-6", "claude-sonnet-4-5-20250929", "claude-sonnet-4-20250514"],
    maxTokens: 16000,
  },
  "claude-opus": {
    provider: "claude",
    models: ["claude-opus-4-6", "claude-sonnet-4-6", "claude-opus-4-5-20251101"],
    maxTokens: 16000,
  },
  "claude-haiku": {
    provider: "claude",
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6"],
    maxTokens: 8000,
  },
};

const DEFAULT_MODEL = "claude-sonnet";

let anthropicClient = null;
try {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  if (apiKey) {
    anthropicClient = new Anthropic({ apiKey });
    console.log("✅ Claude API verfügbar");
  } else {
    console.warn("⚠️  ANTHROPIC_API_KEY nicht gesetzt – Claude-Modelle nicht verfügbar");
  }
} catch (e) {
  console.warn("⚠️  @anthropic-ai/sdk nicht installiert:", e.message);
}

function isClaudeAvailable() {
  return !!anthropicClient;
}

const CLAUDE_TIMEOUT_MS = parseInt(process.env.CLAUDE_TIMEOUT_MS || "120000", 10);

// ── BullMQ Worker-Lifecycle ────────────────────────────────────────────────
// lockDuration: max. Zeit die ein Job einen Worker "sperrt" bevor ein anderer
// Worker annimmt dass der Job hängt und ihn übernimmt. Muss größer sein als
// die längste Reading-Generierung (2-Pass Detailed + Pipeline).
// 2-Pass ~360s + Validator 60s + Corrector 60s + Sections 30s ≈ 510s worst case.
// Default 480s (8 min) — via ENV überschreibbar.
const WORKER_LOCK_DURATION_MS = parseInt(process.env.WORKER_LOCK_DURATION_MS || "480000", 10);
function workerOptions(extra = {}) {
  return { connection: redis, lockDuration: WORKER_LOCK_DURATION_MS, ...extra };
}

async function generateWithClaude(prompt, options = {}) {
  if (!anthropicClient) {
    throw new Error("Claude API nicht konfiguriert. ANTHROPIC_API_KEY setzen.");
  }
  const model = options.model || "claude-sonnet-4-6";
  const maxTokens = options.maxTokens || 8000;
  const temperature = options.temperature ?? 0.8;

  console.log(`   [Claude] Start ${model}, max_tokens=${maxTokens}, timeout=${CLAUDE_TIMEOUT_MS / 1000}s`);

  const messages = [{ role: "user", content: prompt }];
  let fullContent = "";
  let totalOutputTokens = 0;
  const MAX_CONTINUATIONS = 3;

  for (let attempt = 0; attempt <= MAX_CONTINUATIONS; attempt++) {
    const apiCall = anthropicClient.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages,
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Claude Timeout nach ${CLAUDE_TIMEOUT_MS / 1000}s`)), CLAUDE_TIMEOUT_MS);
    });

    const response = await Promise.race([apiCall, timeoutPromise]);
    const chunk = response.content[0]?.text || "";
    const stopReason = response.stop_reason;
    totalOutputTokens += response.usage?.output_tokens || 0;
    fullContent += chunk;

    console.log(`   [Claude] Antwort erhalten (${chunk.length} Zeichen, stop_reason=${stopReason}, output_tokens=${response.usage?.output_tokens})`);

    if (stopReason !== "max_tokens" || attempt >= MAX_CONTINUATIONS) break;

    // Fortsetzung: bisherige Antwort als Assistent-Turn + neues "Weiter"-Request
    console.log(`   [Claude] ⚠️  max_tokens erreicht — Fortsetzung ${attempt + 1}/${MAX_CONTINUATIONS}...`);
    messages.push({ role: "assistant", content: chunk });
    messages.push({ role: "user", content: "Bitte fahre direkt dort fort, wo du aufgehört hast. Kein Satz wie 'Ich fahre fort' — einfach weiterschreiben." });
  }

  if (!fullContent) throw new Error("Claude lieferte leere Antwort");
  if (totalOutputTokens > 0) console.log(`   [Claude] Gesamt: ${fullContent.length} Zeichen, ~${totalOutputTokens} output_tokens`);
  return fullContent;
}

// ======================================================
// generateReading()
// ======================================================
function formatChartCenters(centers) {
  if (!centers) return 'Keine Daten';
  const names = { head: 'Kopf', ajna: 'Ajna', throat: 'Kehle', g: 'G-Zentrum', heart: 'Herz', spleen: 'Milz', 'solar-plexus': 'Solar Plexus', sacral: 'Sakral', root: 'Wurzel' };
  const defined = [], open = [];
  Object.entries(centers).forEach(([k, v]) => {
    const label = names[k] || k;
    if (v) defined.push(`  - ${label}: DEFINIERT`);
    else open.push(`  - ${label}: offen → Konditionierungsfeld`);
  });
  return [...defined, ...(open.length ? ['\n  Offene Zentren (Konditionierung beachten!):'] : []), ...open].join('\n');
}
function formatChartChannels(channels) {
  if (!channels?.length) return 'Keine Daten';
  const centerDE = { head: 'Kopf', ajna: 'Ajna', throat: 'Kehle', g: 'G-Zentrum', heart: 'Herz', spleen: 'Milz', 'solar-plexus': 'Solar Plexus', sacral: 'Sakral', root: 'Wurzel' };
  return channels.map(c => {
    const gates = c.gates || [];
    const label = c.name || gates.join('-');
    const centers = gates.map(g => centerDE[GATE_TO_CENTER[g]] || '?').filter((v,i,a) => a.indexOf(v) === i);
    const centerInfo = centers.length ? ` (${centers.join(' ↔ ')})` : '';
    return `  - ${label}${centerInfo}: Tore ${gates.join(', ')}`;
  }).join('\n');
}
function formatChartGates(gates) {
  if (!gates?.length) return 'Keine Daten';
  const centerDE = { head: 'Kopf', ajna: 'Ajna', throat: 'Kehle', g: 'G-Zentrum', heart: 'Herz', spleen: 'Milz', 'solar-plexus': 'Solar Plexus', sacral: 'Sakral', root: 'Wurzel' };
  return gates.slice(0, 30).map(g => {
    const num = g.number || g;
    const line = g.line ? `.${g.line}` : '';
    const center = GATE_TO_CENTER[num];
    const centerLabel = center ? ` [${centerDE[center] || center}]` : '';
    const src = g.isPersonality === false ? ' (Design/Rot)' : g.isPersonality === true ? ' (Persönlichkeit/Schwarz)' : '';
    return `  - Tor ${num}${line}${centerLabel}${src}: ${g.name || 'Unbekannt'}`;
  }).join('\n');
}

// ── Planeten-Aktivierungen für tiefe Chart-Analyse ────────────────────────────
function formatPlanetActivations(chartData) {
  const PLANET_NAMES = {
    sun: 'Sonne', earth: 'Erde', moon: 'Mond', north_node: 'Nordknoten',
    south_node: 'Südknoten', mercury: 'Merkur', venus: 'Venus', mars: 'Mars',
    jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptun', pluto: 'Pluto'
  };
  const personality = chartData?.personality?.planets || {};
  const design = chartData?.design?.planets || {};
  const allPlanets = Object.keys({ ...personality, ...design });
  if (!allPlanets.length) return '';
  const lines = [];
  for (const planet of allPlanets) {
    const p = personality[planet];
    const d = design[planet];
    const parts = [];
    if (p?.gate) parts.push(`Persönlichkeit: Tor ${p.gate}${p.line ? '.' + p.line : ''}`);
    if (d?.gate) parts.push(`Design: Tor ${d.gate}${d.line ? '.' + d.line : ''}`);
    if (parts.length) lines.push(`  - ${PLANET_NAMES[planet] || planet}: ${parts.join(' | ')}`);
  }
  return lines.join('\n');
}

function buildChartInfo(chartData, opts = {}) {
  if (!chartData) return '';

  // Baustein 4: im Strict-Mode liefert der Fakten-Block den deterministischen
  // deutschen Chart-Block inkl. Whitelist/Verbote/Wahrheitsquelle.
  if (READING_STRICT_MODE) {
    return buildFactsBlock(chartData, opts);
  }

  // Inkarnationskreuz — name + gates aus allen möglichen Strukturen lesen
  const cross = chartData.incarnationCross || chartData.incarnation_cross || {};
  const crossName = cross.name || chartData.cross?.name || chartData.cross || '';
  const cg = cross.gates || {};

  // Solar/Erd-Gates: incarnationCross.gates hat Vorrang, dann personality.planets.*
  const pSunGate  = cg.personalitySun  ?? chartData.personality?.planets?.sun?.gate   ?? chartData.personalitySun?.gate  ?? null;
  const pEarthGate= cg.personalityEarth?? chartData.personality?.planets?.earth?.gate ?? chartData.personalityEarth?.gate ?? null;
  const dSunGate  = cg.designSun       ?? chartData.design?.planets?.sun?.gate        ?? chartData.designSun?.gate       ?? null;
  const dEarthGate= cg.designEarth     ?? chartData.design?.planets?.earth?.gate      ?? chartData.designEarth?.gate     ?? null;

  const crossBlock = (pSunGate && pEarthGate && dSunGate && dEarthGate)
    ? buildCrossPromptFragment({incarnationCross:{type:cross.type||'',personalitySun:pSunGate,personalityEarth:pEarthGate,designSun:dSunGate,designEarth:dEarthGate}}, 'gates')
    : crossName ? `INKARNATIONSKREUZ: ${crossName}` : '';

  // Splits / Definitionen
  const splitInfo = chartData.definition
    ? `DEFINITION: ${chartData.definition}${chartData.splits ? ` (${chartData.splits} Split${chartData.splits > 1 ? 's' : ''})` : ''}`
    : '';

  // Planeten-Aktivierungen (Linien-Level)
  const planetBlock = formatPlanetActivations(chartData);

  // Variable / PHS (Pfeile)
  const variableBlock = formatVariablePHS(chartData);

  return `
BERECHNETE CHART-DATEN (Präzise für diese Person — via Swiss Ephemeris):
TYP: ${chartData.type || 'Unbekannt'}
PROFIL: ${chartData.profile || 'Unbekannt'}
AUTORITÄT: ${chartData.authority || 'Unbekannt'}
STRATEGIE: ${chartData.strategy || 'Unbekannt'}
${splitInfo ? splitInfo + '\n' : ''}${crossBlock}

ZENTREN (definiert = konstante Energie; offen = Konditionierungsfeld):
${formatChartCenters(chartData.centers)}

KANÄLE (alle definierten Lebensthemen):
${formatChartChannels(chartData.channels)}

TORE mit Linie und Quelle (Persönlichkeit = bewusst; Design = unbewusst/körperlich):
${formatChartGates(chartData.gates)}
${planetBlock ? `\nPLANETEN-AKTIVIERUNGEN (Gate.Linie für jeden Planeten):\n${planetBlock}` : ''}${variableBlock ? `\nVARIABLE / PHS (Pfeile):\n${variableBlock}` : ''}
PFLICHT: Beschreibe JEDES definierte Zentrum, JEDEN Kanal und JEDE offene Zentrum-Konditionierung konkret für diese Person. Keine generischen Erklärungen.
`;
}

// Deep-Fallback: nur wenn kein KNOWLEDGE_MAP-Eintrag greift.
// Defaults großzügig gewählt, damit die Regel-Inhalte nicht abgeschnitten werden.
function buildKnowledgeText(maxEntries = 20, maxCharsPerEntry = 5000) {
  return Object.entries(knowledge)
    .slice(0, maxEntries)
    .map(([key, val]) => `\n### ${key}\n${val.substring(0, maxCharsPerEntry)}`)
    .join('\n');
}

// ── Variable / PHS aus Chart-Daten ───────────────────────────────────────────
function formatVariablePHS(chartData) {
  if (!chartData) return '';
  // Swiss Ephemeris liefert Pfeile als arrows-Objekt oder als vier separate Felder
  const arrows = chartData.arrows || chartData.variable || {};
  const phs = chartData.phs || {};

  const lines = [];

  // Pfeile (digestion, environment, perspective, motivation)
  if (arrows.digestion || phs.digestion) {
    lines.push(`  - Ernährung/Verdauung: ${arrows.digestion || phs.digestion}`);
  }
  if (arrows.environment || phs.environment) {
    lines.push(`  - Umgebung: ${arrows.environment || phs.environment}`);
  }
  if (arrows.perspective || phs.perspective) {
    lines.push(`  - Perspektive/Bewusstsein: ${arrows.perspective || phs.perspective}`);
  }
  if (arrows.motivation || phs.motivation) {
    lines.push(`  - Motivation/Antrieb: ${arrows.motivation || phs.motivation}`);
  }

  // Rohwerte: color/tone/base falls verfügbar
  const raw = [];
  if (chartData.color) raw.push(`Farbe: ${chartData.color}`);
  if (chartData.tone)  raw.push(`Ton: ${chartData.tone}`);
  if (chartData.base)  raw.push(`Basis: ${chartData.base}`);
  if (raw.length) lines.push(`  - Rohwerte: ${raw.join(', ')}`);

  // Pfeilrichtungen direkt (left/right up/down)
  const arrowRaw = chartData.arrowsRaw || chartData.arrows_raw || chartData.fourArrows;
  if (arrowRaw && typeof arrowRaw === 'string') lines.push(`  - Pfeile (roh): ${arrowRaw}`);

  return lines.length ? lines.join('\n') : '';
}

// ── Aktuelle Transite holen (Supabase → API-Fallback) ─────────────────────────
let _cachedTransit = null;
let _cachedTransitDate = null;

async function fetchCurrentTransits() {
  const today = new Date().toISOString().split('T')[0];
  if (_cachedTransitDate === today && _cachedTransit) return _cachedTransit;

  try {
    // 1. Supabase daily_transits
    const { data: stored } = await supabasePublic
      .from('daily_transits').select('*').eq('date', today).maybeSingle();
    if (stored) {
      _cachedTransit = {
        date: stored.date,
        sun: { gate: stored.sun_gate, line: stored.sun_line },
        earth: { gate: stored.earth_gate, line: stored.earth_line },
        moon: { gate: stored.moon_gate, line: stored.moon_line },
        allPlanets: stored.all_planets || [],
        activeChannels: stored.active_channels || [],
        moonPhase: stored.moon_phase || '',
      };
      _cachedTransitDate = today;
      return _cachedTransit;
    }
    // 2. API-Fallback
    const CK_URL = process.env.CONNECTION_KEY_URL || 'http://connection-key:3000';
    const res = await fetch(`${CK_URL}/api/transits/today`, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      _cachedTransit = await res.json();
      _cachedTransitDate = today;
      return _cachedTransit;
    }
  } catch (e) {
    console.warn('[Transit-Overlay] Fetch fehlgeschlagen:', e.message);
  }
  return null;
}

// ── Transit-Overlay Block für Prompt ─────────────────────────────────────────
// Fügt einen kompakten "Jetzt-Moment" Abschnitt an — nur für nicht-transit-spezifische Readings.
const TRANSIT_SKIP_TYPES = new Set(['transit', 'jahres-reading', 'tagesimpuls']);

function buildTransitOverlay(transitData, chartData) {
  if (!transitData || !chartData) return '';

  const today = transitData.date || new Date().toISOString().split('T')[0];
  const sun   = transitData.sun   ? `Sonne: Tor ${transitData.sun.gate}.${transitData.sun.line || '?'}` : '';
  const earth = transitData.earth ? `Erde: Tor ${transitData.earth.gate}.${transitData.earth.line || '?'}` : '';
  const moon  = transitData.moon  ? `Mond: Tor ${transitData.moon.gate}.${transitData.moon.line || '?'}` : '';

  // Persönliche Aktivierungen: welche Transit-Gates treffen den Chart?
  const personalGates = new Set((chartData.gates || []).map(g => g.number || g));
  const hits = (transitData.allPlanets || [])
    .filter(p => personalGates.has(p.gate))
    .map(p => `Tor ${p.gate} (${p.planet || '?'}) — im persönlichen Chart!`);

  const phaseInfo = transitData.moonPhase ? `Mondphase: ${transitData.moonPhase}` : '';

  return `AKTUELLER TRANSIT-KONTEXT (${today}):
${[sun, earth, moon, phaseInfo].filter(Boolean).join(' | ')}
${hits.length ? `Persönliche Transit-Aktivierungen: ${hits.join(', ')}` : 'Keine direkten Kanal-Aktivierungen heute.'}
→ Integriere einen kurzen "Jetzt-Moment" Abschnitt am Ende des Readings: Was ist heute energetisch aktiviert? Wie trifft der aktuelle Transit diesen Chart konkret?`;
}

// ── Vorherige Readings für Delta-Kontext ─────────────────────────────────────
async function fetchPreviousReadings(birthDate, clientName, currentReadingId, limit = 2) {
  if (!birthDate && !clientName) return [];
  try {
    let query = supabasePublic
      .from('readings')
      .select('id, reading_type, created_at, reading_data')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(limit + 1); // +1 wegen evtl. aktuellem Reading

    if (birthDate) {
      // birth_data ist JSONB — filter über ->> Operator via .filter()
      query = query.filter('birth_data->>date', 'ilike', `%${birthDate}%`);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data
      .filter(r => r.id !== currentReadingId && r.reading_data?.text)
      .slice(0, limit)
      .map(r => ({
        id: r.id,
        type: r.reading_type,
        date: r.created_at?.split('T')[0],
        // Nur die ersten 800 Zeichen des Texts als Kontext-Zusammenfassung
        summary: r.reading_data.text.substring(0, 800).replace(/\n+/g, ' '),
      }));
  } catch (e) {
    console.warn('[Delta-Reading] Fehler beim Laden vorheriger Readings:', e.message);
    return [];
  }
}

function buildDeltaContext(previousReadings) {
  if (!previousReadings?.length) return '';
  const entries = previousReadings.map(r =>
    `Reading vom ${r.date} (Typ: ${r.type}): ${r.summary}…`
  ).join('\n\n');
  return `KONTEXT AUS VORHERIGEN READINGS (für Evolution & Tiefe):
${entries}
→ Beziehe dich auf diese früheren Erkenntnisse wenn relevant. Zeige Entwicklung und Vertiefung — nicht Wiederholung.`;
}

// ── Typen-spezifisches Knowledge-Bundle ──────────────────────────────────────
// Jeder Reading-Typ bekommt gezielt die relevanten Knowledge-Files — vollständig,
// keine Substring-Kürzung bei Kern-Files. Fallback auf generisches Bundle.
const KNOWLEDGE_MAP = {
  // Kern-Reading-Typen
  'detailed':         ['human-design-basics', 'types-detailed', 'authority-detailed', 'strategy-authority', 'centers-detailed', 'channels-gates', 'profiles-detailed', 'incarnation-cross'],
  'basic':            ['human-design-basics', 'types-detailed', 'strategy-authority', 'authority-detailed', 'profiles-detailed'],
  'business':         ['human-design-basics', 'types-detailed', 'strategy-authority', 'authority-detailed', 'channels-gates', 'profiles-detailed'],
  'career':           ['human-design-basics', 'types-detailed', 'strategy-authority', 'authority-detailed', 'channels-gates', 'profiles-detailed'],
  // Connection / Beziehungs-Typen
  'connection':       ['connection-knowledge', 'channels-gates', 'centers-detailed', 'types-detailed', 'authority-detailed', 'profiles-detailed'],
  'relationship':     ['connection-knowledge', 'channels-gates', 'types-detailed', 'authority-detailed', 'centers-detailed'],
  'compatibility':    ['connection-knowledge', 'channels-gates', 'types-detailed', 'centers-detailed'],
  // Penta
  'penta':            ['penta-knowledge', 'channels-gates', 'centers-detailed', 'types-detailed'],
  'penta-communication': ['penta-knowledge', 'penta-communication-dynamics', 'penta-strategy-impulses', 'channels-gates', 'centers-detailed', 'types-detailed'],
  // Psychologie / Tiefe
  'depth-analysis':   ['channels-gates', 'centers-detailed', 'splits-detailed', 'authority-detailed', 'profiles-detailed', 'incarnation-cross'],
  'shadow-work':      ['shadow-work-knowledge', 'centers-detailed', 'authority-detailed', 'splits-detailed', 'profiles-detailed', 'strategy-authority', 'variable-arrows', 'bodygraph-statistics', 'crisis-resources'],
  'psychology':       ['centers-detailed', 'authority-detailed', 'splits-detailed', 'profiles-detailed', 'channels-gates', 'variable-arrows', 'crisis-resources'],
  'reflection':       ['reflection-knowledge', 'strategy-authority', 'authority-detailed', 'profiles-detailed', 'types-detailed', 'centers-detailed', 'variable-arrows', 'bodygraph-statistics'],
  'trauma':           ['trauma-knowledge', 'centers-detailed', 'authority-detailed', 'splits-detailed', 'profiles-detailed', 'variable-arrows', 'bodygraph-statistics', 'crisis-resources'],
  'reflection-profiles': ['profiles-detailed', 'strategy-authority', 'types-detailed', 'authority-detailed'],
  'emotions':         ['authority-detailed', 'strategy-authority', 'centers-detailed', 'types-detailed', 'crisis-resources'],
  // Körper / Gesundheit
  'health':           ['health-knowledge', 'human-design-basics', 'arrows-detailed', 'variable-arrows', 'bodygraph-statistics', 'centers-detailed', 'types-detailed', 'authority-detailed'],
  'sexuality':        ['sexuality-knowledge', 'variable-arrows', 'bodygraph-statistics', 'crisis-resources', 'centers-detailed', 'channels-gates', 'types-detailed', 'authority-detailed'],
  'spiritual':        ['spiritual-knowledge', 'incarnation-cross', 'profiles-detailed', 'channels-gates', 'centers-detailed', 'arrows-detailed', 'variable-arrows'],
  'geld-ueberfluss':  ['geld-ueberfluss-knowledge', 'human-design-basics', 'types-detailed', 'authority-detailed', 'channels-gates', 'centers-detailed', 'variable-arrows', 'bodygraph-statistics', 'crisis-resources'],
  'money':            ['geld-ueberfluss-knowledge', 'human-design-basics', 'types-detailed', 'authority-detailed', 'channels-gates', 'variable-arrows', 'crisis-resources'],
  'life-purpose':     ['life-purpose-knowledge', 'human-design-basics', 'types-detailed', 'incarnation-cross', 'profiles-detailed', 'channels-gates', 'authority-detailed', 'variable-arrows', 'bodygraph-statistics'],
  // Zeit / Transit
  'transit':          ['channels-gates', 'centers-detailed', 'types-detailed', 'strategy-authority'],
  'jahres-reading':   ['channels-gates', 'centers-detailed', 'types-detailed', 'strategy-authority', 'incarnation-cross'],
  // Tagesimpuls
  'tagesimpuls':      ['type-specific-impulse-rules', 'authority-specific-impulse-rules', 'profile-specific-impulse-rules', 'transit-impulse-instructions'],
  // Familie
  'parenting':        ['types-detailed', 'authority-detailed', 'profiles-detailed', 'centers-detailed', 'strategy-authority'],
  'kinder':           ['types-detailed', 'authority-detailed', 'profiles-detailed', 'centers-detailed'],
  // Weitere
  'correct-reading':  ['human-design-basics', 'types-detailed', 'authority-detailed', 'strategy-authority'],
};

// Always-prepend: Dateien die für jedes Reading hart im Kontext stehen müssen.
// Baustein 6: hd-regeln-strikt liefert verbindliche HD-Mechaniken (Konditionierung,
// Kanäle, Verbindungstypen, Inkarnationskreuze, Planeten, Kehlkopf-Gates) als
// nicht-verhandelbare Regel-Liste. Wird im Strict-Mode in jedem Prompt vollständig
// vor allen anderen Knowledge-Dateien geladen.
const ALWAYS_KNOWLEDGE_KEYS = READING_STRICT_MODE ? ['hd-regeln-strikt'] : [];

function buildReadingKnowledge(readingType) {
  const typeKeys = KNOWLEDGE_MAP[readingType]
    || ['human-design-basics', 'types-detailed', 'authority-detailed', 'strategy-authority', 'centers-detailed', 'profiles-detailed'];

  // Dedup: Always-Keys zuerst, dann Type-Keys, dann einzigartig
  const seen = new Set();
  const ordered = [...ALWAYS_KNOWLEDGE_KEYS, ...typeKeys].filter(k => {
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return ordered
    .filter(k => knowledge[k])
    .map(k => `\n### ${k}\n${knowledge[k]}`)
    .join('\n');
}

// Dediziertes Knowledge-Bundle für Tagesimpuls — lädt die 3 Personalisierungs-Files vollständig
function buildTagesimpulsKnowledge() {
  return buildReadingKnowledge('tagesimpuls') || buildKnowledgeText(8, 1000);
}

async function generateDetailedReadingTwoParts({ userData, chartData, modelConfig }) {
  const chartInfo = buildChartInfo(chartData);
  const knowledgeText = buildReadingKnowledge('detailed');

  const [transitData, previousReadings] = await Promise.all([
    fetchCurrentTransits(),
    fetchPreviousReadings(userData.birth_date, userData.client_name, userData.reading_id, 2),
  ]);
  const transitOverlay = buildTransitOverlay(transitData, chartData);
  const deltaContext = buildDeltaContext(previousReadings);

  const personContext = `Name: ${userData.client_name || 'Unbekannt'}
Geburtsdatum: ${userData.birth_date || 'Unbekannt'}
Geburtszeit: ${userData.birth_time || 'Unbekannt'}
Geburtsort: ${userData.birth_location || 'Unbekannt'}
${chartInfo}
${transitOverlay}
${deltaContext}`;

  const part1Prompt = `Du bist ein erfahrener Human Design Coach. Verwende folgendes Hintergrundwissen:
${knowledgeText}

WICHTIGE ANWEISUNG: Die Chart-Daten wurden präzise via Swiss Ephemeris berechnet und sind vollständig im Prompt enthalten. Füge KEINEN Disclaimer ein, dass du kein Berechnungstool hast. Beginne das Reading direkt ohne Vorbemerkungen.

Erstelle TEIL 1 eines tiefgründigen, persönlichen Human Design Readings für:
${personContext}

Schreibe direkt an die Person gerichtet (Du-Form), mit vollem Einsatz – wie eine 90-Minuten-Coaching-Session.
Keine Plattitüden. Keine generischen Erklärungen. Spiegel dieser einen Person.

---

## 1. Dein Typ: Wer du wirklich bist

Der Typ ${chartData?.type || 'unbekannt'} ist nicht das, was du bist – er ist, wie deine Energie in der Welt funktioniert. Erkläre:

- Die Essenz dieses Typs und was er im Kern über diese Person aussagt
- Wie die Energie dieser Person auf andere wirkt – was Menschen spüren, wenn sie mit ihr zusammen sind
- Die Strategie im Detail (${chartData?.strategy || 'unbekannt'}): konkrete Alltagssituationen wo sie anzuwenden ist (Entscheidungen, Beziehungen, Arbeit, Spontanität), und was passiert wenn dagegen gehandelt wird
- Die Not-Self-Emotion als Navigationssystem: was sie signalisiert und wie sie als Frühwarnsystem genutzt werden kann
- Die Signatur des Typs als Zielzustand: wann diese Person weiß, dass sie im Flow ist, wie sich das anfühlt

## 2. Deine Autorität: Der ehrlichste Entscheidungskompass

Die Autorität ${chartData?.authority || 'unbekannt'} ist wichtiger als jeder rationale Verstand:

- Wie genau diese Autorität funktioniert – die Mechanik dahinter
- Woran die Person erkennt, dass sie aus der Autorität heraus entscheidet (vs. aus Angst, Druck, Konditionierung)
- Die häufigsten Fallen: wie der Verstand die Autorität überschreibt und welche Lebenssituationen dadurch entstehen
- Konkrete Übungen und Praktiken, um dieser Autorität täglich zu vertrauen
- Wie diese Autorität bei großen Entscheidungen (Beziehungen, Karriere, Wohnort) UND bei Alltagsentscheidungen angewendet wird

## 3. Deine Zentren: Die Energiearchitektur

Für jedes DEFINIERTE Zentrum:
- Die spezifische Energie, die konstant ausgestrahlt wird
- Das Geschenk und wie andere diese Energie erleben
- Wie dieses Zentrum bewusst eingesetzt werden kann
- Die Schattenseite oder Überwältigungsgefahr

Für jedes OFFENE Zentrum:
- Welche Konditionierungen typischerweise dort entstehen – und welche konkreten Verhaltensmuster dadurch entstehen
- Die Weisheit, die durch das Nicht-Fixiert-Sein entsteht
- Die Befreiungsfrage: "Ist das meine Energie oder habe ich sie aufgenommen?"
- Was das undefinierte Zentrum als Lernfeld bedeutet

Schreibe mindestens 2500 Wörter für diesen Teil. Sprache: Deutsch, Du-Form, tiefgründig, persönlich – kein Human-Design-Lehrbuch.`;

  const part2Prompt = `Du bist ein erfahrener Human Design Coach. Verwende folgendes Hintergrundwissen:
${knowledgeText}

WICHTIGE ANWEISUNG: Die Chart-Daten wurden präzise via Swiss Ephemeris berechnet und sind vollständig im Prompt enthalten. Füge KEINEN Disclaimer ein, dass du kein Berechnungstool hast. Beginne direkt ohne Vorbemerkungen.

Erstelle TEIL 2 eines tiefgründigen, persönlichen Human Design Readings für:
${personContext}

Schreibe direkt an die Person gerichtet (Du-Form), mit vollem Einsatz – wie eine Fortsetzung einer 90-Minuten-Coaching-Session.
Keine Plattitüden. Kein Lehrbuch. Echter Spiegel dieser einen Person.

---

## 4. Channels & Gates: Deine einzigartigen Talente

Für jeden vollständig aktivierten Channel:
- Die Themenenergie dieses Channels und was er über die Person aussagt
- Welche Talente und Fähigkeiten dadurch in die Welt gebracht werden
- Wie diese Energie sich im Alltag zeigt – konkrete Lebensmomente
- Die Herausforderung oder Schattenseite dieses Channels

Für die wichtigsten aktivierten Gates:
- Die Energie-Qualität und tiefste Bedeutung
- Die höchste Ausdrucksform (bewusst gelebt) vs. die bedingte Form (aus Konditionierung)
- Wie dieses Gate das Denken, Fühlen und Handeln beeinflusst

Solar- und Erd-Gates:
- Persönlichkeitssonne: das bewusste Lebensthema
- Persönlichkeitserde: das, was Stabilität gibt
- Design-Sonne: die unbewusste Kraft, die andere sehen
- Design-Erde: die tiefe Verwurzelung

## 5. Das Profil: Deine Lebensrolle

Das Profil ${chartData?.profile || ''} beschreibt, wie diese Person in der Welt lebt und lernt:

- Die tiefe Bedeutung beider Linien des Profils – einzeln und im Zusammenspiel
- Das Spannungsfeld und die Synergie zwischen den beiden Linien
- Typische Lebensmuster, die durch dieses Profil entstehen
- Beziehungen mit diesem Profil: wie diese Person in Intimität und Freundschaft agiert
- Beruf und Berufung mit diesem Profil: welche Rollen natürlich entstehen
- Die größte Stärke und die größte Herausforderung dieses Profils

## 6. Das Inkarnationskreuz: Die Lebensaufgabe

Das Inkarnationskreuz ist der tiefste Kontext – nicht ein Auftrag, den man erfüllen muss, sondern eine Energie, die durch einen hindurchfließt, wenn man sich selbst treu lebt:

- Der Name und die Essenz des Kreuzes
- Die vier Gates, die dieses Kreuz bilden – Zusammenspiel und Gesamtbild
- Das übergeordnete Lebensthema, das sich wie ein roter Faden durch alles zieht
- Wann diese Lebensaufgabe gelebt wird – und wann nicht (konkrete Lebensmuster)
- Was diese Person in die Welt bringt, das kein anderer Mensch auf dieselbe Art bringen kann

## 7. Konditionierung und der Weg zur Dekonditionierung

- Die typischsten Konditionierungen dieser Person (basierend auf offenen Zentren und Typ)
- Welche gesellschaftlichen Botschaften dem Design widersprechen
- Was konkret losgelassen werden muss, um sich selbst zu leben
- Das 7-jährige Dekonditionierungsexperiment: was es bedeutet und wie damit beginnen

## 8. Praktische Integration

Konkrete, sofort anwendbare Empfehlungen – spezifisch für diesen Chart:

- Strategie täglich üben: 3 konkrete Situationen, in denen diese Person die Strategie morgen schon anwenden kann
- Autoritäts-Praxis: wie die Autorität ${chartData?.authority || ''} bei der nächsten Entscheidung genutzt wird
- Not-Self beobachten: Signale erkennen und den Unterschied spüren lernen
- Energie-Hygiene: wie der Tag gestaltet werden sollte, damit Energie fließt
- Die drei wichtigsten Erkenntnisse für diese Person – und wie sie im Alltag verankert werden

## 9. Eine persönliche Einladung

Schreibe abschließend eine tiefgründige, inspirierende Einladung an diese Person, das eigene Design als lebendiges Experiment anzunehmen – ohne Perfektionismus, mit Neugier, Mut und Selbstmitgefühl. Sprich direkt zu ihr. Nicht als Lehrer, sondern als jemand, der den Spiegel hält.

Schreibe mindestens 2500 Wörter für diesen Teil. Sprache: Deutsch, Du-Form, persönlich, tiefgründig – wo angemessen auch poetisch.`;

  const modelsToTry = modelConfig.models || [];
  let part1 = '', part2 = '';

  for (const modelId of modelsToTry) {
    try {
      console.log(`   [Detailed 2-Pass] Versuche Claude-Modell: ${modelId} (${READING_STRICT_MODE ? 'sequential' : 'parallel'})`);
      if (READING_STRICT_MODE) {
        // Baustein 7: Part 2 bekommt Part 1 als Kontext + Anti-Widerspruch-Instruktion
        part1 = await generateWithClaude(part1Prompt, { model: modelId, maxTokens: 8000, temperature: 0.7 });
        const part2WithContext = injectPart1Context(part2Prompt, part1);
        part2 = await generateWithClaude(part2WithContext, { model: modelId, maxTokens: 8000, temperature: 0.7 });
      } else {
        [part1, part2] = await Promise.all([
          generateWithClaude(part1Prompt, { model: modelId, maxTokens: 8000, temperature: 0.7 }),
          generateWithClaude(part2Prompt, { model: modelId, maxTokens: 8000, temperature: 0.7 })
        ]);
      }
      console.log(`   ✅ [Detailed 2-Pass] ${modelId} erfolgreich (${part1.length + part2.length} Zeichen gesamt)`);
      break;
    } catch (err) {
      console.warn(`   ⚠️ [Detailed 2-Pass] ${modelId} fehlgeschlagen:`, err.message);
    }
  }

  if (!part1 && !part2) throw new Error('Alle Claude-Modelle fehlgeschlagen (Detailed 2-Pass)');
  return `${part1}\n\n---\n\n${part2}`;
}

// ── Generische 2-Pass-Generierung ────────────────────────────────────────────
// Nutzbar für alle Reading-Typen die mehr als ~4000 Tokens Inhalt brauchen.
// part1Prompt / part2Prompt: fertige Prompt-Strings
// modelConfig: { models: [...], maxTokens: N }
//
// Baustein 7 (2026-04-22): Im Strict-Mode wird Part 2 SEQUENTIELL nach Part 1
// erzeugt, und bekommt Part 1 als Kontext-Präfix im Prompt (Anti-Widerspruch-
// Anweisung). Im Non-Strict-Mode parallel (alte Semantik, schneller aber mit
// Widersprüchen zwischen Teilen).
async function generateTwoParts({ readingType, part1Prompt, part2Prompt, modelConfig, tokensPerPart = 8000 }) {
  const models = (modelConfig?.models || ['claude-sonnet-4-6']);
  let part1 = '', part2 = '';
  for (const modelId of models) {
    try {
      console.log(`   [2-Pass:${readingType}] Versuche ${modelId} (${READING_STRICT_MODE ? 'sequential' : 'parallel'})`);
      if (READING_STRICT_MODE) {
        // Part 1 zuerst
        part1 = await generateWithClaude(part1Prompt, { model: modelId, maxTokens: tokensPerPart, temperature: 0.7 });
        // Part 2 mit Part 1 als Kontext-Präfix
        const part2WithContext = injectPart1Context(part2Prompt, part1);
        part2 = await generateWithClaude(part2WithContext, { model: modelId, maxTokens: tokensPerPart, temperature: 0.7 });
      } else {
        [part1, part2] = await Promise.all([
          generateWithClaude(part1Prompt, { model: modelId, maxTokens: tokensPerPart, temperature: 0.7 }),
          generateWithClaude(part2Prompt, { model: modelId, maxTokens: tokensPerPart, temperature: 0.7 }),
        ]);
      }
      console.log(`   ✅ [2-Pass:${readingType}] ${modelId} — ${part1.length + part2.length} Zeichen`);
      break;
    } catch (err) {
      console.warn(`   ⚠️ [2-Pass:${readingType}] ${modelId} fehlgeschlagen:`, err.message);
    }
  }
  if (!part1 && !part2) throw new Error(`2-Pass fehlgeschlagen (${readingType})`);
  return `${part1}\n\n---\n\n${part2}`;
}

// Baustein 4 Helper: berechnet den Composite-Block (Block-2-Klassifikation +
// Konditionierungs-Matrix) für 2 Personen. Wird in Connection / Sexuality /
// ChannelAnalysis verwendet.
// Returns '' wenn READING_STRICT_MODE=false oder Charts fehlen.
function buildTwoPersonCompositeBlock(chartA, chartB, nameA = 'Person A', nameB = 'Person B') {
  if (!READING_STRICT_MODE) return '';
  if (!chartA || !chartB) return '';
  const normalizeGates = (gates) => (gates || []).map(g => typeof g === 'object' ? g.number : g).filter(Boolean);
  const gatesA = normalizeGates(chartA.gates);
  const gatesB = normalizeGates(chartB.gates);
  const composite = classifyCompositeConnections(HD_CHANNELS, [gatesA, gatesB]);
  const compositeText = formatCompositeBlock(composite, [nameA, nameB]);

  const CENTER_KEYS = ['head','ajna','throat','g','heart','solar-plexus','sacral','spleen','root'];
  const conditioning = {};
  for (const key of CENTER_KEYS) {
    const aDef = chartA.centers?.[key] === true;
    const bDef = chartB.centers?.[key] === true;
    const definedBy = [];
    const conditions = [];
    if (aDef) definedBy.push(0);
    if (bDef) definedBy.push(1);
    if (aDef && !bDef) conditions.push(1);
    if (bDef && !aDef) conditions.push(0);
    conditioning[key] = { definedBy, conditions };
  }
  const conditioningText = formatConditioningMatrix(conditioning, [nameA, nameB]);

  return `\n=== COMPOSITE ${nameA} + ${nameB} (Block-2-Klassifikation) ===
${compositeText}

KONDITIONIERUNG (nur zentrum-zu-zentrum gleichen Typs):
${conditioningText}
=== ENDE COMPOSITE ===`;
}

// Baustein 7: Part-1-Text als Kontext-Präfix in den Part-2-Prompt einfügen.
// Position: direkt nach dem System-Teil, vor den konkreten Abschnitts-Anweisungen.
// Markiert durch einen klaren Header damit das Model versteht dass es sich um
// bereits geschriebenen Text handelt.
function injectPart1Context(part2Prompt, part1Text) {
  const contextBlock = `

=== TEIL 1 BEREITS GESCHRIEBEN (nicht widersprechen, nur vertiefen) ===
${part1Text}
=== ENDE TEIL 1 ===

ANWEISUNG FÜR TEIL 2:
- Widerspreche KEINER Aussage aus Teil 1 oben.
- Vertiefe und ergänze die Themen, die in Teil 1 angerissen wurden.
- Keine Wiederholungen — nur Erweiterung.
- Wenn ein Kanal, ein Gate oder eine Dynamik in Teil 1 bereits beschrieben wurde,
  baue darauf auf statt neu zu interpretieren.
- Wenn eine Verbindungstyp-Kategorie (elektromagnetisch / Kompromiss / Companionship /
  parallel) in Teil 1 für einen bestimmten Kanal gesetzt wurde, bleibt diese Kategorie
  in Teil 2 unverändert.

`;
  // Einfügen vor "---" (Trenner vor den Abschnitten) oder am Anfang falls nicht gefunden
  const sepIdx = part2Prompt.indexOf('\n---\n');
  if (sepIdx >= 0) {
    return part2Prompt.slice(0, sepIdx) + contextBlock + part2Prompt.slice(sepIdx);
  }
  return contextBlock + part2Prompt;
}

// ── 2-Pass: Connection / Relationship / Compatibility ────────────────────────
async function generateConnectionReadingTwoParts({ userData, personAChart, personBChart, modelConfig, templateName }) {
  const knowledgeText = buildReadingKnowledge('connection');
  const nameA = userData.personA?.name || 'Person A';
  const nameB = userData.personB?.name || 'Person B';
  const dynamics = userData.dynamics || {};
  const dynamicsText = dynamics.activatedChannels?.length
    ? `\nAKTIVIERTE VERBINDUNGS-KANÄLE: ${dynamics.activatedChannels.map(c => `${c.name || c.gates?.join('-')} (${c.type || '?'})`).join(', ')}`
    : '';

  const chartA = `${nameA}:\n${buildChartInfo(personAChart)}`;
  const chartB = `${nameB}:\n${buildChartInfo(personBChart)}`;
  const connectionQuestion = userData.connectionQuestion ? `\nVerbindungsfrage: ${userData.connectionQuestion}` : '';

  // Composite-Block via Helper (Block-2-Klassifikation + Konditionierungs-Matrix)
  const compositeBlock = buildTwoPersonCompositeBlock(personAChart, personBChart, nameA, nameB);

  const [transitData, prevA, prevB] = await Promise.all([
    fetchCurrentTransits(),
    fetchPreviousReadings(userData.personA?.birthDate, nameA, null, 1),
    fetchPreviousReadings(userData.personB?.birthDate, nameB, null, 1),
  ]);
  const transitOverlay = buildTransitOverlay(transitData, personAChart);
  const deltaContextA = buildDeltaContext(prevA);
  const deltaContextB = buildDeltaContext(prevB);
  const connectionDelta = [deltaContextA ? `${nameA}: ${deltaContextA}` : '', deltaContextB ? `${nameB}: ${deltaContextB}` : ''].filter(Boolean).join('\n');

  const baseSystem = `Du bist ein erfahrener Human Design Coach mit Expertise in Beziehungs-Readings.

${(templates[templateName] || templates['connection'] || '')}

Verwende folgendes Wissen:
${knowledgeText}
${transitOverlay ? '\n' + transitOverlay : ''}${connectionDelta ? '\n\n' + connectionDelta : ''}
ANWEISUNG: Die Chart-Daten wurden via Swiss Ephemeris berechnet. Füge KEINEN Disclaimer ein. Beginne direkt.
PFLICHT: Nenne BEIDE Personen (${nameA} UND ${nameB}) in JEDER Sektion explizit!`;

  const part1Prompt = `${baseSystem}

Erstelle TEIL 1 des Connection Key Readings für ${nameA} & ${nameB}.
${chartA}

${chartB}
${dynamicsText}${connectionQuestion}${compositeBlock}

---

# 1. Die Verbindung im Überblick
Beschreibe die energetische Qualität dieser Verbindung. Was macht sie einzigartig? Wie erleben ${nameA} und ${nameB} sich gegenseitig? Welches übergeordnete Thema verbindet sie?

# 2. Konditionierungsdynamik
Wie konditioniert ${nameA} ${nameB} durch ihre/seine offenen Zentren — und umgekehrt? Welche Muster entstehen dadurch? Wie können beide diese Dynamik bewusst nutzen?
WICHTIG: Konditionierung gibt es NUR zentrum-zu-zentrum gleichen Typs (Sakral konditioniert Sakral, Wurzel konditioniert Wurzel). Niemals quer (Sakral→Wurzel ist KEINE gültige Konditionierung).

# 3. Kommunikation & Entscheidungsfindung
Wie unterscheiden sich die Autoritäten (${personAChart?.authority || '?'} vs. ${personBChart?.authority || '?'})? Was bedeutet das konkret, wenn wichtige Entscheidungen gemeinsam getroffen werden müssen? Praktische Empfehlungen.

# 4. Aktivierte Kanäle nach Block-2-Klassifikation
Analysiere jeden aktivierten Kanal aus dem COMPOSITE-Block oben. Pro Kanal: korrekte Kategorie (Elektromagnetisch / Kompromiss / Companionship / Parallel), wer trägt was, was das für die Verbindung bedeutet. Verwende NICHT den Begriff "Goldader" — nutze die exakte Kategorie aus dem Composite-Block.

Schreibe mindestens 2000 Wörter. Deutsch, Du/Ihr-Form, tiefgründig und konkret.`;

  const part2Prompt = `${baseSystem}

Erstelle TEIL 2 des Connection Key Readings für ${nameA} & ${nameB}.
${chartA}

${chartB}
${dynamicsText}${connectionQuestion}${compositeBlock}

Schreibe direkt weiter als Fortsetzung. Kein neuer Titel, keine Wiederholung.

---

# 5. Herausforderungen & Wachstumsfelder
Wo entstehen die größten Reibungspunkte zwischen diesen beiden Designs? Was sind die typischen Konflikte und wie können sie transformiert werden?

# 6. Strategien im Zusammenspiel
Wie müssen ${nameA} (${personAChart?.strategy || '?'}) und ${nameB} (${personBChart?.strategy || '?'}) ihre Strategien im Miteinander leben? Konkrete Alltagssituationen.

# 7. Das Potenzial dieser Verbindung
Was kann NUR diese Verbindung erschaffen — weder ${nameA} noch ${nameB} allein? Welches gemeinsame Feld öffnet sich, wenn beide ihr Design leben?

# 8. Praktische Integration
Konkrete, sofort umsetzbare Empfehlungen für beide:
- Kommunikationsrituale passend zu den Autoritäten
- Energie-Hygiene für diese Verbindung
- Die drei wichtigsten Erkenntnisse und wie sie im Alltag verankert werden

Schreibe mindestens 2000 Wörter. Deutsch, Du/Ihr-Form, tiefgründig und konkret.`;

  return generateTwoParts({ readingType: 'connection', part1Prompt, part2Prompt, modelConfig });
}

// ── 2-Pass: Business / Career / Life-Purpose ─────────────────────────────────
async function generateBusinessReadingTwoParts({ readingType, userData, chartData, modelConfig }) {
  const knowledgeText = buildReadingKnowledge(readingType);
  const chartInfo = buildChartInfo(chartData);

  const [transitData, previousReadings] = await Promise.all([
    fetchCurrentTransits(),
    fetchPreviousReadings(userData.birth_date, userData.client_name, userData.reading_id, 2),
  ]);
  const transitOverlay = buildTransitOverlay(transitData, chartData);
  const deltaContext = buildDeltaContext(previousReadings);

  const personContext = `Name: ${userData.client_name || 'Unbekannt'}
Geburtsdatum: ${userData.birth_date || 'Unbekannt'}
Geburtsort: ${userData.birth_location || 'Unbekannt'}
${chartInfo}
${transitOverlay}
${deltaContext}`;
  const templateContent = templates[readingType] || templates['business'] || '';

  const baseSystem = `Du bist ein erfahrener Human Design Business Coach.

${templateContent}

Verwende folgendes Wissen:
${knowledgeText}

ANWEISUNG: Die Chart-Daten wurden via Swiss Ephemeris berechnet. Füge KEINEN Disclaimer ein. Beginne direkt.`;

  const part1Prompt = `${baseSystem}

Erstelle TEIL 1 eines tiefgründigen Human Design ${readingType === 'career' ? 'Karriere' : readingType === 'life-purpose' ? 'Lebensaufgabe' : 'Business'}-Readings für:
${personContext}

Schreibe direkt an die Person (Du-Form). Kein Lehrbuch — echter Spiegel für diese eine Person.

---

## 1. Dein energetisches Business-Fundament
Wie wirkt der Typ ${chartData?.type || '?'} mit Strategie ${chartData?.strategy || '?'} im Business-Kontext? Was ist das natürliche Energie-Muster dieser Person bei der Arbeit? Wo entstehen die typischen Business-Fallen?

## 2. Deine Entscheidungsautorität im Business
Die Autorität ${chartData?.authority || '?'} im Geschäftsleben: Wie trifft diese Person ihre besten Business-Entscheidungen? Konkrete Situationen (Angebote annehmen/ablehnen, Kooperationen, Investitionen, Pricing).

## 3. Dein natürlicher Business-Stil (Profil ${chartData?.profile || '?'})
Wie lernt und wächst dieses Profil im Business? Welche Rollen liegen natürlich? Was sind die Stärken und Fallen im Unternehmerischen?

## 4. Deine Business-Zentren
Für jedes definierte Zentrum: Wie zeigt sich diese Energie konkret im Business-Alltag?
Für jedes offene Zentrum: Welche Business-Konditionierungen entstehen dort typischerweise (z.B. offenes Sakral → Überarbeitung)?

Schreibe mindestens 2000 Wörter. Deutsch, Du-Form, Business-Kontext, konkret und direkt.`;

  const part2Prompt = `${baseSystem}

Erstelle TEIL 2 des Human Design ${readingType === 'career' ? 'Karriere' : readingType === 'life-purpose' ? 'Lebensaufgabe' : 'Business'}-Readings für:
${personContext}

Schreibe direkt als Fortsetzung. Kein neuer Titel, keine Wiederholung von Teil 1.

---

## 5. Deine Business-Kanäle & Kernkompetenzen
Für jeden aktivierten Kanal: Was ist die spezifische Business-Kompetenz, die dieser Kanal mitbringt? Wie kann sie im Markt positioniert werden?

## 6. Marketing & Sichtbarkeit nach deinem Design
Wie positioniert sich diese Person authentisch? Welche Kommunikationsstile und Kanäle passen zum Design? Was passiert wenn sie gegen ihr Design marketed?

## 7. Business-Modell & Angebots-Struktur
Welche Angebotsstruktur (1:1, Gruppen, Produkte, Lizenzen) passt zum Typ? Welches Pricing-Modell ist authentisch? Welche Kollaborationsformen funktionieren?

## 8. Deine Lebensaufgabe im Business-Kontext
Wie manifestiert sich das Inkarnationskreuz in der beruflichen Mission? Was kann nur diese Person auf diese Art in die Welt bringen?

## 9. Konkrete nächste Schritte
3-5 sofort umsetzbare Empfehlungen, spezifisch für diesen Chart. Keine generischen Ratschläge.

Schreibe mindestens 2000 Wörter. Deutsch, Du-Form, Business-Kontext, konkret und direkt.`;

  return generateTwoParts({ readingType, part1Prompt, part2Prompt, modelConfig });
}

// ── 2-Pass: Shadow-Work ───────────────────────────────────────────────────────
async function generateShadowWorkTwoParts({ userData, chartData, modelConfig }) {
  const knowledgeText = buildReadingKnowledge('shadow-work');
  const chartInfo = buildChartInfo(chartData);

  const previousReadings = await fetchPreviousReadings(userData.birth_date, userData.client_name, userData.reading_id, 2);
  const deltaContext = buildDeltaContext(previousReadings);

  const personContext = `Name: ${userData.client_name || 'Unbekannt'}
${chartInfo}
${deltaContext}`;
  const templateContent = templates['shadow-work'] || '';

  const baseSystem = `Du bist ein erfahrener Human Design Coach mit Fokus auf Schattenarbeit und Dekonditionierung.

${templateContent}

Verwende folgendes Wissen:
${knowledgeText}

ANWEISUNG: Beginne direkt. Kein Disclaimer.`;

  const part1Prompt = `${baseSystem}

Erstelle TEIL 1 eines tiefgründigen Shadow-Work Readings für:
${personContext}

Schreibe direkt an die Person (Du-Form). Klar, direkt, mitfühlend — kein Weichzeichner.

---

## 1. Deine zentralen Konditionierungsfelder
Analysiere die offenen Zentren als Konditionierungsräume. Für jedes: Welche spezifische gesellschaftliche oder familiäre Botschaft hat dort Wurzeln geschlagen? Wie zeigt sich das in konkreten Verhaltensmustern, Glaubenssätzen, Entscheidungen?

## 2. Typ-Schatten: Das Not-Self-Muster
Der Schatten des Typs ${chartData?.type || '?'} — was passiert wenn diese Person nicht ihre Strategie lebt? Konkrete Lebensmuster, Beziehungsdynamiken, Arbeitssituationen die aus dem Not-Self entstehen.

## 3. Autoritäts-Schatten
Wann übergeht diese Person (Autorität: ${chartData?.authority || '?'}) ihre innere Autorität zugunsten von Verstand, Erwartungen anderer, oder Angst? Welche Entscheidungen entstehen daraus? Was kostet das?

## 4. Profil-Schatten (Profil ${chartData?.profile || '?'})
Das Profil trägt eigene Schattenmuster. Was sind die typischen Fallen, die Menschen mit diesem Profil immer wieder in dieselben Situationen führen?

Schreibe mindestens 2000 Wörter. Direkt, tief, ohne Weichzeichner. Deutsch, Du-Form.`;

  const part2Prompt = `${baseSystem}

Erstelle TEIL 2 des Shadow-Work Readings für:
${personContext}

Direkte Fortsetzung — kein Rückblick auf Teil 1.

---

## 5. Kanal-Schatten
Für jeden definierten Kanal: Wie manifestiert sich die Energie dieses Kanals in seiner konditionierten, ängstlichen Form? Was wäre die befreite Ausdrucksform?

## 6. Die tiefen Glaubenssätze
Basierend auf Typ, offenen Zentren und Profil: Welche Glaubenssätze haben sich im Laufe des Lebens gebildet? Formuliere sie konkret (z.B. "Ich muss..." / "Ich darf nicht..." / "Ich bin nur wertvoll wenn...").

## 7. Integrations-Arbeit
Konkrete Shadow-Work-Praktiken spezifisch für diesen Chart:
- Täglich: Was beobachten, was wahrnehmen?
- Bei Entscheidungen: Welche innere Stimme ist die Autorität — welche ist Konditionierung?
- In Beziehungen: Welche Dynamiken signalisieren Not-Self?

## 8. Die Einladung zur Dekonditionierung
Was bedeutet das 7-jährige Dekonditionierungs-Experiment für diese Person konkret? Was fällt weg? Was entsteht? Eine persönliche Einladung — direkt, ehrlich, mitfühlend.

Schreibe mindestens 2000 Wörter. Direkt, tief. Deutsch, Du-Form.`;

  return generateTwoParts({ readingType: 'shadow-work', part1Prompt, part2Prompt, modelConfig });
}

function buildChartSummary(chart, name) {
  if (!chart) return `${name || 'Person'}: Keine Chart-Daten`;
  const definedCenters = Object.entries(chart.centers || {})
    .filter(([, v]) => v).map(([k]) => k).join(', ') || 'keine';
  return `${name ? `${name} – ` : ''}Typ: ${chart.type || 'unbekannt'}, Profil: ${chart.profile || 'unbekannt'}, Autorität: ${chart.authority || 'unbekannt'}, Definierte Zentren: ${definedCenters}, Channels: ${(chart.channels || []).slice(0, 8).map(c => c.name || c.gates?.join('-')).filter(Boolean).join(', ') || 'keine'}`;
}

async function generateReflexionsfragen(chartData, userData) {
  if (!isClaudeAvailable()) return null;

  const chartSummary = chartData
    ? buildChartSummary(chartData, userData?.client_name)
    : `Person: ${userData?.client_name || 'unbekannt'}`;

  const prompt = `Du bist ein erfahrener Human Design Coach. Erstelle 10 tiefgründige, hochpersonalisierte Reflexionsfragen basierend auf diesem Human Design Chart:

${chartSummary}

Die Fragen müssen:
- Direkt auf spezifische Chart-Elemente bezogen sein (Typ, Autorität, Profil, Channels, Gates – NICHT generisch!)
- Wirklich zum Nachdenken einladen und innere Prozesse anstoßen
- In der Du-Form formuliert sein
- Eine Mischung aus verschiedenen Lebensbereichen abdecken: Alltag, Beziehungen, Arbeit/Business, innere Welt, Körper, Entscheidungen
- Konkret genug sein, dass die Person sofort weiß, worüber sie nachdenkt
- Die Not-Self-Themen des Typs adressieren (mindestens 2 Fragen)
- Das Potenzial des Designs aktivieren (mindestens 2 Fragen)
- Auf Deutsch und in einem einladenden, nicht wertenden Ton formuliert sein

Antworte NUR mit einem JSON-Array mit genau 10 Strings, ohne weiteren Text:
["Frage 1", "Frage 2", "Frage 3", "Frage 4", "Frage 5", "Frage 6", "Frage 7", "Frage 8", "Frage 9", "Frage 10"]`;

  try {
    const result = await generateWithClaude(prompt, {
      model: 'claude-sonnet-4-6',
      maxTokens: 1200,
      temperature: 0.8,
    });
    const match = result.match(/\[[\s\S]*?\]/);
    if (match) return JSON.parse(match[0]);
    return null;
  } catch (err) {
    console.warn('⚠️ Reflexionsfragen-Generierung fehlgeschlagen:', err.message);
    return null;
  }
}

async function generateConnectionReflexionsfragen(personAChart, personBChart, personAName, personBName) {
  if (!isClaudeAvailable()) return null;

  const prompt = `Du bist ein erfahrener Human Design Coach. Erstelle 10 tiefgründige Reflexionsfragen für ZWEI Personen in ihrer Verbindung, basierend auf ihren Human Design Charts:

${buildChartSummary(personAChart, personAName || 'Person A')}

${buildChartSummary(personBChart, personBName || 'Person B')}

Die Fragen müssen:
- Die VERBINDUNG zwischen beiden Personen ansprechen (NICHT nur eine Person – immer beide!)
- Auf konkrete Chart-Elemente beider Personen bezogen sein (Typ-Kombination, geteilte/komplementäre/elektromagnetische Gates, Konditionierungsdynamiken)
- Zur gemeinsamen Reflexion einladen (z.B. "Wie geht ihr beide mit..." oder "Was passiert zwischen euch, wenn...")
- Verschiedene Beziehungsbereiche abdecken: Kommunikation, Energie-Dynamik, Entscheidungen, Konflikt, Nähe/Distanz, gemeinsames Wachstum
- In der Ihr-Form oder als gemeinsame Frage formuliert sein
- Die typische Konditionierungsdynamik zwischen diesen Typen adressieren (mindestens 2 Fragen)
- Das gemeinsame Potenzial dieser Verbindung aktivieren (mindestens 2 Fragen)
- Auf Deutsch und in einem einladenden, nicht wertenden Ton formuliert sein

Antworte NUR mit einem JSON-Array mit genau 10 Strings, ohne weiteren Text:
["Frage 1", "Frage 2", "Frage 3", "Frage 4", "Frage 5", "Frage 6", "Frage 7", "Frage 8", "Frage 9", "Frage 10"]`;

  try {
    const result = await generateWithClaude(prompt, {
      model: 'claude-sonnet-4-6',
      maxTokens: 1200,
      temperature: 0.8,
    });
    const match = result.match(/\[[\s\S]*?\]/);
    if (match) return JSON.parse(match[0]);
    return null;
  } catch (err) {
    console.warn('⚠️ Connection-Reflexionsfragen-Generierung fehlgeschlagen:', err.message);
    return null;
  }
}

// ======================================================
// buildTuningInstructions()
// Erzeugt Tuning-Anweisungen aus tone/length/audience
// ======================================================
function buildTuningInstructions({ tone, length, audience } = {}) {
  const lines = [];
  const toneMap = {
    sachlich:    'Ton: sachlich, nüchtern, präzise – keine emotionale Färbung, keine Metaphern.',
    empathisch:  'Ton: warm, einfühlsam, einladend – die Person fühlt sich gesehen und verstanden.',
    spirituell:  'Ton: tiefgründig, bedeutsam, spirituell offen – verweise auf größere Zusammenhänge, ohne dogmatisch zu sein.',
    direkt:      'Ton: direkt, klar, auf den Punkt – kein Drumherumreden, keine Abschwächungen.',
  };
  const lengthMap = {
    kurz:     'Länge: Kompakt und prägnant. Jede Sektion maximal 3–5 Sätze. Gesamtlänge: ca. 400–600 Wörter.',
    standard: 'Länge: Standard-Tiefe. Jede Sektion vollständig ausgeführt. Gesamtlänge: ca. 800–1200 Wörter.',
    tief:     'Länge: Tiefenanalyse. Jede Sektion ausführlich mit Nuancen. Gesamtlänge: ca. 1500–2500 Wörter.',
  };
  const audienceMap = {
    einsteiger:      'Zielgruppe: Einsteiger. Vermeide Fachbegriffe, erkläre HD-Konzepte kurz beim ersten Auftreten.',
    fortgeschritten: 'Zielgruppe: Fortgeschrittene mit HD-Grundkenntnissen. Fachbegriffe können genutzt werden.',
    profi:           'Zielgruppe: Profis / HD-Coaches. Maximale Präzision und Tiefe, keine Vereinfachungen.',
  };
  if (tone     && toneMap[tone])         lines.push(toneMap[tone]);
  if (length   && lengthMap[length])     lines.push(lengthMap[length]);
  if (audience && audienceMap[audience]) lines.push(audienceMap[audience]);
  return lines.length > 0 ? `\n\n🎛️ TUNING-PARAMETER:\n${lines.join('\n')}` : '';
}

async function generateReading({ agentId, template, userData, chartData }) {
  const rawModelId = userData?.ai_model || DEFAULT_MODEL;
  // Normalize: full model IDs wie "claude-sonnet-4-6" → config key "claude-sonnet"
  const selectedModelId = MODEL_CONFIG[rawModelId]
    ? rawModelId
    : Object.keys(MODEL_CONFIG).find(k => rawModelId.startsWith(k)) || DEFAULT_MODEL;
  let modelConfig = MODEL_CONFIG[selectedModelId] || MODEL_CONFIG[DEFAULT_MODEL];
  const maxTokens = userData?.ai_config?.max_tokens || modelConfig.maxTokens;

  if (modelConfig.provider === "claude" && !isClaudeAvailable()) {
    throw new Error(`Claude (${selectedModelId}) nicht verfügbar`);
  }

  // Tuning-Parameter aus userData
  const tone     = userData?.tone     || userData?.ai_config?.tone     || userData?.reading_options?.tone;
  const length   = userData?.length   || userData?.ai_config?.length   || userData?.reading_options?.length;
  const audience = userData?.audience || userData?.ai_config?.audience || userData?.reading_options?.audience;
  const language = userData?.language || userData?.ai_config?.language || userData?.reading_options?.language || 'de';
  const tuningInstructions = buildTuningInstructions({ tone, length, audience });

  console.log("🤖 Generiere Reading:", { agentId, template, model: selectedModelId, provider: modelConfig.provider, hasChart: !!chartData, tone, length, audience, language });

  // Template-Mapping: explizite Zuordnung reading_type → template-Datei
  const TEMPLATE_MAP = {
    'detailed': 'detailed',
    'depth-analysis': 'depth-analysis',
    'channel-analysis': 'channel-analysis',
    'shadow-work': 'shadow-work',
    'transit': 'transit',
    'jahres': 'jahres-reading',
  };
  if (TEMPLATE_MAP[template]) {
    template = TEMPLATE_MAP[template];
  }

  // 2-Pass-Generierung für alle langen Reading-Typen
  if (template === 'detailed') {
    return await generateDetailedReadingTwoParts({ userData, chartData, modelConfig });
  }
  if (['business', 'career', 'life-purpose'].includes(template)) {
    return await generateBusinessReadingTwoParts({ readingType: template, userData, chartData, modelConfig });
  }
  if (template === 'shadow-work') {
    return await generateShadowWorkTwoParts({ userData, chartData, modelConfig });
  }

  let templateContent = templates[template] || templates['default'] ||
    "Erstelle ein Human Design Reading basierend auf den gegebenen Daten.";

  // Penta-Template: {{placeholders}} ersetzen
  if (userData.members && userData.memberCharts) {
    const memberCount = userData.members.length;
    const memberNames = userData.members.map(m => m.name).join(', ');
    templateContent = templateContent
      .replace(/\{\{memberCount\}\}/g, String(memberCount))
      .replace(/\{\{groupName\}\}/g, userData.groupName || 'Gruppe')
      .replace(/\{\{memberNames\}\}/g, memberNames);
  }

  // Single-Person-Templates: Chart-Fakten als Placeholder injizieren
  // (greift für depth-analysis, single, parenting, geld-ueberfluss, channel-analysis etc.)
  if (chartData && !userData.members && !(userData.personA && userData.personB)) {
    const centerNamesDe = { head: 'Krone', ajna: 'Ajna', throat: 'Kehle', g: 'G-Zentrum', heart: 'Herz/Ego', spleen: 'Milz', 'solar-plexus': 'Solarplexus', sacral: 'Sakral', root: 'Wurzel' };
    const centers = chartData.centers || {};
    const definedNames = Object.entries(centers).filter(([_, v]) => v).map(([k]) => centerNamesDe[k] || k);
    const openNames = Object.entries(centers).filter(([_, v]) => !v).map(([k]) => centerNamesDe[k] || k);
    const channels = (chartData.channels || []);
    const channelsList = channels.map(c => {
      const gates = (c.gates || []).join('-');
      const name = c.name_de || c.name || '';
      return name ? `${gates} (${name})` : gates;
    }).filter(Boolean).join(', ') || 'keine';
    const gates = (chartData.gates || []).map(g => typeof g === 'object' ? g.number : g).filter(Boolean);
    const ic = chartData.incarnationCross || chartData.incarnation_cross || {};
    const icGates = ic.gates || {};
    const icName = ic.name_de || ic.name || '?';

    // Planet-Aktivierungen (nur die, die Swiss Ephemeris berechnet hat)
    const planetLabelDe = {
      sun: 'Sonne', earth: 'Erde', moon: 'Mond',
      'north-node': 'Nordknoten', 'south-node': 'Südknoten',
      northNode: 'Nordknoten', southNode: 'Südknoten',
      mercury: 'Merkur', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn',
      uranus: 'Uranus', neptune: 'Neptun', pluto: 'Pluto', chiron: 'Chiron', lilith: 'Lilith',
    };
    const formatPlanetList = (arr) => {
      if (!Array.isArray(arr) || arr.length === 0) return '(keine Daten)';
      return arr.map(p => {
        const planet = planetLabelDe[p.planet] || p.planet || '?';
        const gate = p.gate ?? '?';
        const line = p.line != null ? `.${p.line}` : '';
        return `${planet} ${gate}${line}`;
      }).join(', ');
    };
    const personalityPlanetsList = formatPlanetList(chartData.personalityPlanets || (chartData.personality && chartData.personality.planets) || []);
    const designPlanetsList      = formatPlanetList(chartData.designPlanets      || (chartData.design      && chartData.design.planets)      || []);

    const subs = {
      clientName: userData.client_name || 'die Person',
      birthDate: userData.birth_date || userData.birthdate || 'Unbekannt',
      birthTime: userData.birth_time || userData.birthtime || 'Unbekannt',
      birthPlace: userData.birth_location || userData.birthplace || 'Unbekannt',
      type: chartData.type || 'Unbekannt',
      profile: chartData.profile || '?',
      authority: chartData.authority || '?',
      strategy: chartData.strategy || '?',
      definition: chartData.definition || '?',
      definedCentersCount: String(definedNames.length),
      definedCenters: definedNames.join(', ') || '(keine)',
      openCentersCount: String(openNames.length),
      openCenters: openNames.join(', ') || '(keine)',
      channelsCount: String(channels.length),
      channelsList,
      gatesCount: String(gates.length),
      gatesList: gates.sort((a,b) => a-b).join(', ') || '(keine)',
      incarnationCrossName: icName,
      personalitySun: String(icGates.personalitySun ?? '?'),
      personalityEarth: String(icGates.personalityEarth ?? '?'),
      designSun: String(icGates.designSun ?? '?'),
      designEarth: String(icGates.designEarth ?? '?'),
      personalityPlanetsList,
      designPlanetsList,
    };
    for (const [key, val] of Object.entries(subs)) {
      templateContent = templateContent.split(`{{${key}}}`).join(String(val));
    }
  }

  const knowledgeText = buildReadingKnowledge(agentId);

  // ── Transit-Overlay (für alle nicht-transit-spezifischen Readings) ───────
  let transitOverlay = '';
  if (!TRANSIT_SKIP_TYPES.has(agentId)) {
    const transitData = await fetchCurrentTransits();
    transitOverlay = buildTransitOverlay(transitData, chartData);
  }

  // ── Delta-Reading: vorherige Readings als Kontext ─────────────────────────
  let deltaContext = '';
  const birthDate = userData.birth_date || userData.birthdate || userData.birthDate;
  const readingId = userData.reading_id;
  if (birthDate && readingId) {
    const prev = await fetchPreviousReadings(birthDate, userData.client_name, readingId, 2);
    deltaContext = buildDeltaContext(prev);
  }

  const languageInstruction = language === 'en'
    ? '\n\nLANGUAGE: Write the entire reading in English. Use professional, empathetic language.'
    : '';

  const systemPrompt = `Du bist ein Reading-Agent für Human Design.

${templateContent}

Verwende folgendes Wissen:
${knowledgeText}
${tuningInstructions}${languageInstruction}

WICHTIGE ANWEISUNG: Dir werden vollständig berechnete Chart-Daten (via Swiss Ephemeris) direkt im Prompt übergeben. Nutze NUR diese Daten. Füge KEINEN Disclaimer, KEINE Einleitung und KEINE Anmerkung ein, die besagt, dass du kein Berechnungstool hast oder die Daten ableitest. Die Daten sind präzise und vollständig — beginne das Reading direkt.
${transitOverlay ? '\n' + transitOverlay : ''}${deltaContext ? '\n\n' + deltaContext : ''}
Erstelle ein professionelles Reading basierend auf den Nutzerdaten.`;

  // Connection-Reading: Beide Personen mit ihren Charts übergeben
  let userMessage;
  if (userData.members && userData.memberCharts) {
    // Penta-Reading: Gruppenfeld mit allen Mitgliedern aufbauen
    const memberDetails = userData.memberCharts.map((mc, idx) => {
      const member = userData.members[idx] || {};
      const chart = mc.chart || {};
      return `**${mc.name}:**
Geburtsdatum: ${member.birthDate || member.birth_date || member.date || 'Unbekannt'}
Geburtszeit: ${member.birthTime || member.birth_time || member.time || 'Unbekannt'}
Geburtsort: ${member.birthPlace || member.birth_place || member.location || 'Unbekannt'}
Typ: ${chart.type || 'Unbekannt'}
Profil: ${chart.profile || 'Unbekannt'}
Autorität: ${chart.authority || 'Unbekannt'}
Strategie: ${chart.strategy || 'Unbekannt'}
Zentren:
${formatChartCenters(chart.centers)}
Kanäle:
${formatChartChannels(chart.channels)}
Tore:
${formatChartGates(chart.gates)}`;
    }).join('\n\n---\n\n');

    const pentaChart = userData.pentaChart || {};
    const groupDynamics = userData.groupDynamics || {};

    userMessage = `Erstelle ein Penta Human Design Reading für die Gruppe "${userData.groupName || 'Gruppe'}" (${userData.members.length} Personen):

Kontext: ${userData.groupContext || 'Gruppe'}

=== MITGLIEDER & CHARTS ===

${memberDetails}

=== PENTA-CHART (Kombinationsfeld) ===
Aktivierte Kanäle:
${formatChartChannels(pentaChart.channels)}
Aktivierte Zentren:
${formatChartCenters(pentaChart.centers)}

${groupDynamics.roles ? `=== GRUPPEN-DYNAMIK ===
Rollen: ${JSON.stringify(groupDynamics.roles)}
Energiefluss: ${JSON.stringify(groupDynamics.energy_flow || [])}
Kommunikationsmuster: ${JSON.stringify(groupDynamics.communication_patterns || [])}
Kollektive Stärken: ${JSON.stringify(groupDynamics.collective_strengths || [])}` : ''}

WICHTIG: Nenne alle ${userData.members.length} Personen bei ihren echten Namen (${userData.members.map(m => m.name).join(', ')}) in jeder Sektion! Dies ist ein Gruppenfeld-Reading, kein Sammlung von Einzel-Readings.`;
  } else if (userData.personA && userData.personB) {
    const personAName = userData.personA?.name || 'Person A';
    const personBName = userData.personB?.name || 'Person B';

    const formatPersonChart = (chart, name) => {
      if (!chart) return `${name}: Keine Chart-Daten`;
      return `${name}:
  Typ: ${chart.type || 'Unbekannt'}
  Profil: ${chart.profile || 'Unbekannt'}
  Autorität: ${chart.authority || 'Unbekannt'}
  Strategie: ${chart.strategy || 'Unbekannt'}
  Zentren: ${formatChartCenters(chart.centers)}
  Kanäle: ${formatChartChannels(chart.channels)}
  Tore: ${formatChartGates(chart.gates)}`;
    };

    const dynamicsText = userData.dynamics ? `
VERBINDUNGS-DYNAMIK — AKTIVIERTE KANÄLE:
${JSON.stringify(userData.dynamics.activatedChannels || [], null, 2)}

KANAL-TYPEN ERKLÄRUNG (PFLICHT — NIEMALS alle Kanäle pauschal als "elektromagnetisch" bezeichnen!):
- "EM" (Elektromagnetische Verbindung): Jede Person trägt genau eine Seite des Kanals. → Im Reading kennzeichnen als "Elektromagnetische Verbindung (EM)" | carriedBy: "niemand allein"
- "Goldader": Eine Person trägt den kompletten Kanal allein (beide Gates). → Im Reading kennzeichnen als "Goldader" | "Wer trägt: [Name aus carriedBy]"
- "Stabile Parallelenergie": Beide Personen haben den kompletten Kanal unabhängig voneinander. → Im Reading kennzeichnen als "Stabile Parallelenergie" | carriedBy: "beide"

ANWEISUNGEN FÜR KANAL-DARSTELLUNG:
1. Für jeden Kanal in activatedChannels den Typ korrekt aus dem "type"-Feld übernehmen
2. Bei Goldader explizit "Wer trägt: ${personAName}" oder "Wer trägt: ${personBName}" angeben
3. Bei EM explizit "Wer trägt: Niemand allein — ${personAName} & ${personBName} ergänzen sich"
4. Bei Stabile Parallelenergie "Beide tragen diesen Kanal unabhängig voneinander"
5. NIEMALS alle Kanäle als "elektromagnetisch" bezeichnen — jeden Kanal nach seinem type-Feld einordnen

Gemeinsamkeiten (gleiche Gates): ${JSON.stringify(userData.dynamics.similarities || [])}
Unterschiede: ${JSON.stringify(userData.dynamics.differences || {})}
` : '';

    userMessage = `Erstelle ein Connection Key Reading für:

${formatPersonChart(userData.personAChart, personAName)}

${formatPersonChart(userData.personBChart, personBName)}

${dynamicsText}
${userData.connectionQuestion ? `Verbindungsfrage: ${userData.connectionQuestion}` : ''}

WICHTIG: Dieses Reading MUSS beide Personen (${personAName} UND ${personBName}) in jeder Sektion explizit ansprechen und ihre Charts miteinander in Beziehung setzen!`;
  } else {
    const chartInfo = buildChartInfo(chartData);

    // ai_config-Parameter (year, transit_gates, year_transits) in Prompt einbetten
    let aiConfigContext = '';
    const cfg = userData.ai_config || {};
    if (cfg.year) {
      aiConfigContext += `\nJahr des Readings: ${cfg.year}`;
    }
    if (cfg.year_transits) {
      aiConfigContext += `\nJahres-Transits:\n${JSON.stringify(cfg.year_transits, null, 2)}`;
    }
    if (cfg.transit_gates) {
      aiConfigContext += `\nAktuelle Planeten-Transits:\n${JSON.stringify(cfg.transit_gates, null, 2)}`;
    }
    if (cfg.transit) {
      const t = cfg.transit;
      aiConfigContext += `\nTages-Transit (${t.date || 'heute'}):
Sonne: Tor ${t.sun?.gate}.${t.sun?.line} | Erde: Tor ${t.earth?.gate}.${t.earth?.line} | Mond: Tor ${t.moon?.gate}.${t.moon?.line}
Nordknoten: Tor ${t.northNode?.gate} | Mondphase: ${t.moonPhase || '–'}
Aktive Transit-Kanäle: ${(t.activeChannels || []).join(', ') || 'keine'}
Aktivierte Transit-Zentren: ${(t.definedCenters || []).join(', ') || 'keine'}`;
    }
    if (cfg.cross_reference?.length) {
      aiConfigContext += `\nChart-Transit-Kreuzreferenz (Transit trifft persönliches Chart):`;
      for (const a of cfg.cross_reference) {
        aiConfigContext += `\n  → ${a.planet}: Transit-Tor ${a.gate}.${a.line} ist in diesem Chart definiert`;
      }
    }
    if (cfg.format) aiConfigContext += `\nAusgabeformat: ${cfg.format}`;
    if (cfg.focus_topic) aiConfigContext += `\nFokus-Thema heute: ${cfg.focus_topic}`;

    // Tagesimpuls — 5 Personalisierungsschichten
    if (cfg.client_type) aiConfigContext += `\n\n## KLIENT — Schicht 1: Typ\n${cfg.client_type}`;
    if (cfg.client_authority) aiConfigContext += `\n## KLIENT — Schicht 2: Autorität\n${cfg.client_authority}`;
    if (cfg.client_profile) aiConfigContext += `\n## KLIENT — Schicht 3: Profil\n${cfg.client_profile}`;
    if (cfg.cross_reference_full) aiConfigContext += `\n## KLIENT — Schicht 4: Kreuzreferenz\n${cfg.cross_reference_full}`;
    if (cfg.client_definition || cfg.client_open_centers) {
      aiConfigContext += `\n## KLIENT — Schicht 5: Definition & offene Zentren`;
      if (cfg.client_definition) aiConfigContext += `\nDefinition: ${cfg.client_definition}`;
      if (cfg.client_open_centers) aiConfigContext += `\nOffene Zentren: ${cfg.client_open_centers}`;
    }

    // Tier-spezifische Anweisungen
    if (cfg.tier_instructions) aiConfigContext += `\n\n## TIER-ANWEISUNG\n${cfg.tier_instructions}`;
    // VIP-Erweiterung: Coaching-Aufgabe + Reflexionsfrage
    if (cfg.vip_instructions) aiConfigContext += `\n\n## VIP-MODUS\n${cfg.vip_instructions}`;

    userMessage = `Erstelle ein Reading für:
Name: ${userData.client_name || 'Unbekannt'}
Geburtsdatum: ${userData.birth_date || 'Unbekannt'}
Geburtszeit: ${userData.birth_time || 'Unbekannt'}
Geburtsort: ${userData.birth_location || 'Unbekannt'}
${chartInfo}
${aiConfigContext}
${userData.client_data ? JSON.stringify(userData.client_data, null, 2) : ''}`;
  }

  const fullPrompt = `${systemPrompt}\n\n---\n\n${userMessage}`;

  if (modelConfig.provider === "claude") {
    const modelsToTry = modelConfig.models || [];
    for (const modelId of modelsToTry) {
      try {
        console.log(`   Versuche Claude-Modell: ${modelId}`);
        const result = await generateWithClaude(fullPrompt, {
          model: modelId,
          maxTokens,
          temperature: 0.7,
        });
        console.log(`   ✅ Claude (${modelId}) erfolgreich`);
        return result;
      } catch (claudeErr) {
        console.warn(`   ⚠️  Claude (${modelId}) fehlgeschlagen:`, claudeErr.message);
      }
    }
    throw new Error("Alle Claude-Modelle fehlgeschlagen");
  }

  throw new Error(`Unbekannter Provider: ${modelConfig.provider}`);
}

// ======================================================
// WORKER 1: V3 Queue (reading-queue)
// ======================================================
const workerV3 = new Worker(
  "reading-queue",
  async (job) => {
    console.log("📥 [V3] Job empfangen:", job.id);
    const { readingId, agentId } = job.data;
    try {
      const content = await generateReading({
        agentId: agentId || 'default',
        template: agentId || 'default',
        userData: job.data
      });
      const { error } = await supabase
        .from("coach_readings")
        .update({ status: "completed", content })
        .eq("id", readingId);
      if (error) throw error;
      console.log("✅ [V3] Reading abgeschlossen:", readingId);
    } catch (err) {
      console.error("❌ [V3] Fehler:", err);
      throw err;
    }
  },
  workerOptions()
);

workerV3.on("failed", (job, err) => {
  console.error("❌ [V3] Job failed:", job?.id, err);
});

console.log("🟢 V3 Worker aktiv (Queue: reading-queue)");

// ======================================================
// WORKER 2: V4 Queue (reading-queue-v4)
// FIX: Holt Chart-Daten automatisch wenn nicht vorhanden
// ======================================================
const workerV4 = new Worker(
  "reading-queue-v4",
  async (job) => {
    console.log("📥 [V4] Job empfangen:", job.id);
    const { readingId } = job.data;
    try {
      const { data: reading, error: readingError } = await supabasePublic
        .from("readings")
        .select("*")
        .eq("id", readingId)
        .single();

      if (readingError) throw readingError;

      const { error: jobUpdateError } = await supabase
        .from("reading_jobs")
        .update({
          status: "processing",
          progress: 10,
          started_at: new Date().toISOString()
        })
        .eq("reading_id", readingId);

      if (jobUpdateError) {
        console.warn("⚠️ [V4] Konnte reading_jobs nicht aktualisieren:", jobUpdateError.message);
      }

      // Chart-Daten: Aus Reading laden oder neu berechnen
      // Prüfe alle möglichen Speicherpfade (reading_data.chart_data oder chart_data Top-Level)
      let chartData = reading.reading_data?.chart_data || reading.chart_data || null;
      const birth = reading.birth_data || {};

      if (!chartData) {
        console.log("   📊 [V4] Keine Chart-Daten vorhanden – berechne neu...");
        chartData = await fetchChartData(
          birth.date || reading.birth_date,
          birth.time || reading.birth_time,
          birth.location || reading.birth_location
        );
      } else {
        console.log(`   📊 [V4] Chart-Daten vorhanden: Typ=${chartData.type}, Profil=${chartData.profile}`);
        if (!chartData.incarnationCross && !chartData.incarnation_cross) {
          console.warn(`   ⚠️ [V4] incarnationCross fehlt in Chart-Daten — wird im Reading fehlen!`);
        }
      }

      await supabase
        .from("reading_jobs")
        .update({ progress: 30 })
        .eq("reading_id", readingId);

      const userData = {
        client_name: reading.client_name,
        birth_date: birth.date || reading.birth_date,
        birth_time: birth.time || reading.birth_time,
        birth_location: birth.location || reading.birth_location,
        ...(reading.reading_data || {}),
        ...(reading.client_data || {})
      };

      const [rawContent, reflexionsfragen] = await Promise.all([
        generateReading({
          agentId: reading.reading_type || 'default',
          template: reading.reading_type || 'default',
          userData,
          chartData
        }),
        generateReflexionsfragen(chartData, userData)
      ]);

      // ── Pipeline: Validierung & Korrektur ──────────────────────────────────
      let pipelineInfo = { validated: false, corrected: false, errorCount: 0 };
      let content = rawContent;
      try {
        const pipeline = await runReadingPipeline(rawContent, chartData);
        content = pipeline.text;
        pipelineInfo = {
          validated: pipeline.validated,
          corrected: pipeline.corrected,
          errorCount: pipeline.errorCount,
        };
      } catch (pipelineErr) {
        console.warn("[Pipeline] [V4] Fehler — Fallback auf Original:", pipelineErr.message);
      }

      const existingData = reading.reading_data || {};
      const newReadingData = {
        ...existingData,
        text: content,
        chart_data: chartData || existingData.chart_data,
        ...(reflexionsfragen ? { reflexionsfragen } : {}),
        _pipeline: pipelineInfo,
      };

      const { data: updatedRow, error: updateError } = await supabasePublic
        .from("readings")
        .update({
          status: "completed",
          reading_data: newReadingData,
          updated_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
        .eq("id", readingId)
        .select("id, reading_data")
        .maybeSingle();

      if (updateError) throw updateError;
      if (!updatedRow) {
        console.error(`❌ [V4] Update: 0 Zeilen – Reading ${readingId} nicht gefunden!`);
      } else {
        const len = updatedRow?.reading_data?.text?.length || 0;
        console.log(`✅ [V4] Reading ${readingId} aktualisiert (${len} Zeichen)`);
      }

      await supabase
        .from("reading_jobs")
        .update({
          status: "completed",
          progress: 100,
          completed_at: new Date().toISOString()
        })
        .eq("reading_id", readingId);

      console.log("✅ [V4] Reading abgeschlossen:", readingId);
    } catch (err) {
      console.error("❌ [V4] Fehler:", err);
      const { error: v4FailErr } = await supabase
        .from("reading_jobs")
        .update({ status: "failed", error: err.message })
        .eq("reading_id", readingId);
      if (v4FailErr) console.warn("⚠️ Konnte Job nicht als failed markieren:", v4FailErr);
      throw err;
    }
  },
  workerOptions()
);

workerV4.on("failed", (job, err) => {
  console.error("❌ [V4] Job failed:", job?.id, err);
});

console.log("🟢 V4 Worker aktiv (Queue: reading-queue-v4)");

// ======================================================
// WORKER 3: Connection Queue (V4 - 2 Personen)
// FIX: Echte Chart-Berechnung statt Placeholder
// ======================================================
const connectionWorker = new Worker(
  "reading-queue-v4-connection",
  async (job) => {
    console.log("📥 [Connection] Job empfangen:", job.id);
    const {
      readingId,
      personA, personB,
      person_a_id, person_b_id,
      connection_reading_id,
      connectionQuestion
    } = job.data;

    try {
      await supabase
        .from("reading_jobs")
        .update({ status: "processing", progress: 10, started_at: new Date().toISOString() })
        .eq("reading_id", readingId);

      // ── Chart-Daten laden ───────────────────────────────────────────────
      // Priorität: 1) person_a_id/person_b_id aus readings-Tabelle
      //            2) Geburtsdaten aus personA/personB Objekt (legacy)
      let personAChart, personBChart, nameA, nameB;

      if (person_a_id) {
        const result = await fetchChartFromReading(person_a_id);
        personAChart = result?.chart;
        nameA = result?.name || personA?.name || "Person A";
        console.log(`   ✅ [Connection] Person A aus Reading ${person_a_id}: ${personAChart?.type || "kein Chart"}`);
      }
      if (person_b_id) {
        const result = await fetchChartFromReading(person_b_id);
        personBChart = result?.chart;
        nameB = result?.name || personB?.name || "Person B";
        console.log(`   ✅ [Connection] Person B aus Reading ${person_b_id}: ${personBChart?.type || "kein Chart"}`);
      }

      // Fallback auf Geburtsdaten
      if (!personAChart) {
        personAChart = await fetchChartData(personA?.birthDate, personA?.birthTime, personA?.birthPlace);
        nameA = nameA || personA?.name || "Person A";
      }
      if (!personBChart) {
        personBChart = await fetchChartData(personB?.birthDate, personB?.birthTime, personB?.birthPlace);
        nameB = nameB || personB?.name || "Person B";
      }

      personAChart = personAChart || { type: "Unbekannt", gates: [], centers: {} };
      personBChart = personBChart || { type: "Unbekannt", gates: [], centers: {} };

      // ── Composite-Daten aus connection_readings laden (falls vorhanden) ─
      let compositeData = null;
      if (connection_reading_id) {
        const { data: connRow } = await supabasePublic
          .schema("public")
          .from("connection_readings")
          .select("composite_chart, composite_analysis, dynamics")
          .eq("id", connection_reading_id)
          .maybeSingle();
        compositeData = connRow?.composite_chart || connRow?.composite_analysis || null;
      }

      await supabase
        .from("reading_jobs")
        .update({ progress: 30 })
        .eq("reading_id", readingId);

      const dynamics = analyzeConnectionDynamics(personAChart, personBChart, nameA, nameB);

      // ── Claude-Prompt: beide Charts + Composite ─────────────────────────
      const [content, reflexionsfragen] = await Promise.all([
        generateReading({
          agentId: "connection",
          template: "connection",
          userData: {
            personA: { name: nameA },
            personB: { name: nameB },
            personAChart,
            personBChart,
            dynamics,
            compositeData,
            connectionQuestion,
            client_name: `${nameA} & ${nameB}`
          }
        }),
        generateConnectionReflexionsfragen(personAChart, personBChart, nameA, nameB)
      ]);

      // ── connection_readings aktualisieren ───────────────────────────────
      const connUpdateTarget = connection_reading_id
        ? { id: connection_reading_id }
        : readingId ? { reading_id: readingId } : null;

      if (connUpdateTarget) {
        const filterKey = Object.keys(connUpdateTarget)[0];
        const filterVal = connUpdateTarget[filterKey];
        await supabasePublic
          .schema("public")
          .from("connection_readings")
          .update({
            chart_a: personAChart,
            chart_b: personBChart,
            person_a_chart: personAChart,
            person_b_chart: personBChart,
            dynamics: dynamics,
            electromagnetic_channels: dynamics.electromagnetic_channels,
            complementary_gates: dynamics.complementary_gates,
            similarities: dynamics.similarities,
            differences: dynamics.differences,
            composite_analysis: { text: content, generated_at: new Date().toISOString() },
            updated_at: new Date().toISOString()
          })
          .eq(filterKey, filterVal);
      }

      // ── readings aktualisieren ──────────────────────────────────────────
      if (readingId) {
        await supabasePublic
          .from("readings")
          .update({
            status: "completed",
            reading_data: {
              text: content,
              chart_data: personAChart,
              chart_data2: personBChart,
              personA: { name: nameA },
              personB: { name: nameB },
              ...(reflexionsfragen ? { reflexionsfragen } : {})
            },
            completed_at: new Date().toISOString()
          })
          .eq("id", readingId);
      }

      await supabase
        .from("reading_jobs")
        .update({ status: "completed", progress: 100, completed_at: new Date().toISOString() })
        .eq("reading_id", readingId);

      console.log(`✅ [Connection] Reading abgeschlossen: A=${nameA}, B=${nameB}, ${content.length} Zeichen`);
    } catch (err) {
      console.error("❌ [Connection] Fehler:", err.message);
      if (connection_reading_id) {
        await supabasePublic.schema("public").from("connection_readings")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", connection_reading_id);
      }
      const { error: connFailErr } = await supabase
        .from("reading_jobs")
        .update({ status: "failed", error: err.message })
        .eq("reading_id", readingId);
      if (connFailErr) console.warn("⚠️ Konnte Job nicht als failed markieren:", connFailErr.message);
      throw err;
    }
  },
  workerOptions()
);

connectionWorker.on("failed", (job, err) => {
  console.error("❌ [Connection] Job failed:", job?.id, err);
});

console.log("🟢 Connection Worker aktiv (Queue: reading-queue-v4-connection)");

// ======================================================
// WORKER 4: Penta Queue (V4 - 3-7 Personen)
// FIX: Echte Chart-Berechnung statt Placeholder
// ======================================================
const pentaWorker = new Worker(
  "reading-queue-v4-penta",
  async (job) => {
    console.log("📥 [Penta] Job empfangen:", job.id);
    const { readingId, groupName: jobGroupName, groupContext, members: jobMembers } = job.data;
    try {
      const { data: reading, error: readingError } = await supabasePublic
        .from("readings")
        .select("*, penta_persons")
        .eq("id", readingId)
        .single();

      if (readingError) throw readingError;

      // penta_persons aus DB hat Vorrang vor job.data.members
      const rawMembers = reading.penta_persons?.length ? reading.penta_persons : (jobMembers || []);
      const groupName = jobGroupName || reading.client_name || 'Gruppe';

      // Normalisiere Felder: penta_persons nutzt date/time/location/coords
      const members = rawMembers.map(m => ({
        name:       m.name,
        birthDate:  m.birthDate  || m.birth_date  || m.date     || null,
        birthTime:  m.birthTime  || m.birth_time  || m.time     || '12:00',
        birthPlace: m.birthPlace || m.birth_place || m.location || null,
        coords:     m.coords     || null,
        reading_id: m.reading_id || null,
      }));

      await supabase
        .from("reading_jobs")
        .update({
          status: "processing",
          progress: 10,
          started_at: new Date().toISOString()
        })
        .eq("reading_id", readingId);

      // Echte Chart-Berechnung für alle Mitglieder
      console.log(`   📊 [Penta] Berechne Charts für ${members.length} Mitglieder: ${members.map(m => m.name).join(', ')}`);
      const memberCharts = [];
      for (const member of members) {
        let chart = null;
        if (member.reading_id) {
          const result = await fetchChartFromReading(member.reading_id);
          chart = result?.chart || null;
          console.log(`   📂 [Penta] ${member.name}: Chart aus Supabase (reading_id=${member.reading_id})`);
        }
        if (!chart) {
          const birthPlace = member.coords
            ? { lat: member.coords.lat, lon: member.coords.lon }
            : member.birthPlace;
          chart = await fetchChartData(member.birthDate, member.birthTime, birthPlace)
            || { type: "Unbekannt", gates: [], centers: {}, note: "Chart-Berechnung fehlgeschlagen" };
        }
        memberCharts.push({ name: member.name, chart });
        console.log(`   ✅ [Penta] ${member.name}: Typ=${chart.type}`);
      }

      await supabase
        .from("reading_jobs")
        .update({ progress: 40 })
        .eq("reading_id", readingId);

      const groupDynamics = analyzePentaDynamics(memberCharts);
      const pentaChart = calculatePentaChart(memberCharts);

      await supabase
        .schema("public")
        .from("penta_readings")
        .update({
          penta_chart: pentaChart,
          group_dynamics: groupDynamics,
          roles: groupDynamics.roles,
          energy_flow: groupDynamics.energy_flow,
          communication_patterns: groupDynamics.communication_patterns,
          collective_strengths: groupDynamics.collective_strengths
        })
        .eq("reading_id", readingId);

      const pentaUserData = {
        groupName,
        groupContext,
        members,
        memberCharts,
        pentaChart,
        groupDynamics,
        client_name: groupName || 'Gruppe'
      };

      const [content, reflexionsfragen] = await Promise.all([
        generateReading({
          agentId: 'penta',
          template: 'penta',
          userData: pentaUserData,
          chartData: null
        }),
        generateReflexionsfragen(pentaChart, { client_name: pentaUserData.client_name })
      ]);

      await supabasePublic
        .from("readings")
        .update({
          status: "completed",
          reading_data: {
            text: content,
            penta_chart: pentaChart,
            member_charts: memberCharts,
            ...(reflexionsfragen ? { reflexionsfragen } : {})
          },
          completed_at: new Date().toISOString()
        })
        .eq("id", readingId);

      await supabase
        .from("reading_jobs")
        .update({
          status: "completed",
          progress: 100,
          completed_at: new Date().toISOString()
        })
        .eq("reading_id", readingId);

      console.log("✅ [Penta] Reading abgeschlossen:", readingId);
    } catch (err) {
      console.error("❌ [Penta] Fehler:", err);
      const { error: pentaFailErr } = await supabase
        .from("reading_jobs")
        .update({ status: "failed", error: err.message })
        .eq("reading_id", readingId);
      if (pentaFailErr) console.warn("⚠️ Konnte Job nicht als failed markieren:", pentaFailErr);
      throw err;
    }
  },
  workerOptions()
);

pentaWorker.on("failed", (job, err) => {
  console.error("❌ [Penta] Job failed:", job?.id, err);
});

console.log("🟢 Penta Worker aktiv (Queue: reading-queue-v4-penta)");

// ======================================================
// WORKER 5: Multi-Agent Queue (V4 - mehrere Agents)
// ======================================================
const multiAgentWorker = new Worker(
  "reading-queue-v4-multi-agent",
  async (job) => {
    console.log("📥 [Multi-Agent] Job empfangen:", job.id);
    const { readingId, agents, synthesis, birthData, focus } = job.data;
    try {
      const { data: reading, error: readingError } = await supabasePublic
        .from("readings")
        .select("*")
        .eq("id", readingId)
        .single();

      if (readingError) throw readingError;

      await supabase
        .from("reading_jobs")
        .update({
          status: "processing",
          progress: 10,
          started_at: new Date().toISOString()
        })
        .eq("reading_id", readingId);

      // Chart für Multi-Agent berechnen
      const chartData = await fetchChartData(
        birthData?.birthDate, birthData?.birthTime, birthData?.birthLocation
      );

      console.log(`🔄 [Multi-Agent] Starte ${agents.length} Agents parallel...`);

      const agentPromises = agents.map(async (agentId) => {
        console.log(`   - Agent ${agentId} startet...`);
        const agentReading = await generateReading({
          agentId,
          template: agentId,
          userData: {
            client_name: birthData.name || reading.client_name,
            birth_date: birthData.birthDate,
            birth_time: birthData.birthTime,
            birth_location: birthData.birthLocation,
            focus: focus || `${agentId} Reading`
          },
          chartData
        });
        console.log(`   ✅ Agent ${agentId} fertig (${agentReading.length} Zeichen)`);
        return {
          agentId,
          reading: agentReading,
          insights: extractInsights(agentReading, agentId)
        };
      });

      const agentResults = await Promise.all(agentPromises);

      await supabase
        .from("reading_jobs")
        .update({ progress: 60 })
        .eq("reading_id", readingId);

      let synthesisResult = null;
      let combinedInsights = [];
      let crossReferences = [];

      if (synthesis) {
        console.log("🔄 [Multi-Agent] Erstelle Synthesis...");
        synthesisResult = await generateMultiAgentSynthesis(agentResults, birthData, knowledge);
        combinedInsights = agentResults.flatMap(r => r.insights);
        crossReferences = findCrossReferences(agentResults);
        console.log("✅ [Multi-Agent] Synthesis fertig");
      }

      let finalContent = "";
      finalContent += `# Multi-Agent Reading für ${birthData.name || reading.client_name}\n\n`;
      finalContent += `Dieses Reading wurde von ${agents.length} spezialisierten Agents erstellt.\n\n`;
      finalContent += `## Perspektiven der Agents\n\n`;
      for (const result of agentResults) {
        finalContent += `### ${result.agentId.toUpperCase()} Agent\n\n`;
        finalContent += result.reading + "\n\n";
      }
      if (synthesisResult) {
        finalContent += `## Synthesis\n\n`;
        finalContent += synthesisResult + "\n\n";
        if (crossReferences.length > 0) {
          finalContent += `### Gemeinsame Themen\n\n`;
          crossReferences.forEach(ref => {
            finalContent += `- **${ref.theme}**: ${ref.agents.join(', ')}\n`;
          });
          finalContent += "\n";
        }
      }

      const agentResultsObj = {};
      agentResults.forEach(r => {
        agentResultsObj[r.agentId] = {
          reading: r.reading,
          insights: r.insights
        };
      });

      await supabase
        .schema("public")
        .from("multi_agent_readings")
        .update({
          agent_results: agentResultsObj,
          synthesis: synthesisResult,
          combined_insights: combinedInsights,
          cross_references: crossReferences
        })
        .eq("reading_id", readingId);

      const reflexionsfragen = await generateReflexionsfragen(chartData, { client_name: birthData.name || reading.client_name });

      await supabasePublic
        .from("readings")
        .update({
          status: "completed",
          reading_data: {
            text: finalContent,
            chart_data: chartData,
            ...(reflexionsfragen ? { reflexionsfragen } : {})
          },
          completed_at: new Date().toISOString()
        })
        .eq("id", readingId);

      await supabase
        .from("reading_jobs")
        .update({
          status: "completed",
          progress: 100,
          completed_at: new Date().toISOString()
        })
        .eq("reading_id", readingId);

      console.log("✅ [Multi-Agent] Reading abgeschlossen:", readingId);
    } catch (err) {
      console.error("❌ [Multi-Agent] Fehler:", err);
      const { error: maFailErr } = await supabase
        .from("reading_jobs")
        .update({ status: "failed", error: err.message })
        .eq("reading_id", readingId);
      if (maFailErr) console.warn("⚠️ Konnte Job nicht als failed markieren:", maFailErr);
      throw err;
    }
  },
  workerOptions()
);

multiAgentWorker.on("failed", (job, err) => {
  console.error("❌ [Multi-Agent] Job failed:", job?.id, err);
});

console.log("🟢 Multi-Agent Worker aktiv (Queue: reading-queue-v4-multi-agent)");

// ======================================================
// W6 — Psychology Worker
// ======================================================
startPsychologyWorker();
console.log("[W6] Psychology Worker gestartet");

// ======================================================
// Job Polling System
// ======================================================
async function pollForJobs() {
  try {
    const { data: pendingJobs, error } = await supabase
      .from("reading_jobs")
      .select("id, reading_type, payload, created_at, attempts, max_attempts")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(10);

    if (error) {
      console.error("❌ Job Polling Fehler:", error);
      return;
    }

    if (!pendingJobs || pendingJobs.length === 0) {
      return;
    }

    console.log(`📥 [Polling] ${pendingJobs.length} pending Jobs gefunden`);

    for (const job of pendingJobs) {
      try {
        let readingType = job.reading_type;
        const reading = {
          id: job.id,
          reading_type: job.reading_type,
          client_data: job.payload,
          status: 'processing'
        };

        if (!readingType) {
          console.error(`❌ Job ${job.id}: Kein reading_type gefunden`);
          continue;
        }

        console.log(`🔄 Processing job ${job.id} (type: ${readingType}, version: V4)`);

        // ── Retry-Limit prüfen ─────────────────────────────────
        const attempts = job.attempts ?? 0;
        const maxAttempts = job.max_attempts ?? 3;
        if (attempts >= maxAttempts) {
          console.warn(`🚫 [Polling] Job ${job.id} max_attempts (${maxAttempts}) erreicht — permanent failed`);
          const readingId = job.payload?.reading_id;
          const errMsg = `Max Versuche (${maxAttempts}) erreicht`;
          await supabase.from('reading_jobs')
            .update({ status: 'failed', error: errMsg, finished_at: new Date().toISOString() })
            .eq('id', job.id);
          if (readingId) {
            await supabasePublic.from('readings')
              .update({ status: 'failed', error: errMsg, updated_at: new Date().toISOString() })
              .eq('id', readingId);
          }
          sendMattermost(
            `🚫 **Reading abgebrochen** | \`${readingType}\` | Job \`${job.id}\` | ${errMsg}`,
            'errors'
          );
          continue;
        }

        // Versuch hochzählen + als processing markieren
        const { error: attemptsErr } = await supabase.from('reading_jobs')
          .update({ attempts: attempts + 1, status: 'processing', started_at: new Date().toISOString() })
          .eq('id', job.id);
        if (attemptsErr) console.warn('⚠️ attempts-Update fehlgeschlagen:', attemptsErr.message);

        const jobStart = Date.now();
        if (readingType === 'tagesimpuls') {
          await processTagesimpulsJob(job, reading);
        } else if (['connection', 'composite', 'connection-basic'].includes(readingType) ||
          (['relationship', 'compatibility'].includes(readingType) && (job.payload?.personA || job.payload?.birthdate2))) {
          await processConnectionJob(job, reading);
        } else if (readingType === 'channel-analysis') {
          await processChannelAnalysisJob(job, reading);
        } else if (readingType === 'sexuality' && job.payload?.birthdate2) {
          await processSexualityJob(job, reading);
        } else if (readingType === 'phasen-reading') {
          await processPhasenReadingJob(job, reading);
        } else if (readingType === 'penta' || readingType === 'penta-communication' || readingType === 'penta-basic') {
          await processPentaJob(job, reading);
        } else if (readingType === 'multi-agent') {
          console.warn('🚫 [Multi-Agent] Gesperrt — Job abgelehnt:', job.id);
          const maReadingId = job.payload?.reading_id;
          await supabase.from('reading_jobs')
            .update({ status: 'failed', error: 'Multi-Agent nicht verfügbar', finished_at: new Date().toISOString() })
            .eq('id', job.id);
          if (maReadingId) {
            await supabasePublic.from('readings')
              .update({ status: 'failed', error: 'Multi-Agent nicht verfügbar', updated_at: new Date().toISOString() })
              .eq('id', maReadingId);
          }
          continue;
        } else {
          await processHumanDesignJob(job, reading);
        }

        // ── Dynamic Blueprint: Sections auto-erzeugen ─────────
        const readingId = job.payload?.reading_id;
        if (readingId) {
          try {
            const { writeSectionsForReading } = await import('./lib/sectionsWriter.js');
            const sectionsResult = await writeSectionsForReading(supabasePublic, readingId);
            console.log(`[blueprint] sections written for ${readingId}: ${sectionsResult.created} sections, clientId=${sectionsResult.clientId}`);
          } catch (blueprintErr) {
            // Sections-Fehler dürfen das Reading nicht scheitern lassen
            console.error('[blueprint] sectionsWriter error:', blueprintErr.message);
          }
        }

        // ── Mattermost: Reading fertig ──────────────────────────
        const elapsed = Math.round((Date.now() - jobStart) / 1000);
        const clientName = job.payload?.name || job.payload?.personA?.name || 'Unbekannt';
        const readingLink = readingId ? `https://coach.the-connection-key.de/readings-v4/${readingId}` : null;
        sendMattermost(
          `✅ **Reading fertig** | \`${readingType}\` | ${clientName} | ${elapsed}s${readingLink ? `\n[→ Reading öffnen](${readingLink})` : ''}`,
          'readings'
        );
      } catch (jobError) {
        console.error(`❌ Fehler bei Job ${job.id}:`, jobError);
        // ── DB-Updates: Job + public.readings auf failed ────────
        const failedReadingId = job.payload?.reading_id;
        const errMsg = jobError?.message || String(jobError);
        const { error: jobUpdateErr } = await supabase.from('reading_jobs')
          .update({ status: 'failed', error: errMsg, finished_at: new Date().toISOString() })
          .eq('id', job.id);
        if (jobUpdateErr) console.warn('⚠️ reading_jobs failed-Update fehlgeschlagen:', jobUpdateErr.message);
        if (failedReadingId) {
          const { error: readingsUpdateErr } = await supabasePublic.from('readings')
            .update({ status: 'failed', error: errMsg, updated_at: new Date().toISOString() })
            .eq('id', failedReadingId);
          if (readingsUpdateErr) console.warn('⚠️ public.readings failed-Update fehlgeschlagen:', readingsUpdateErr.message);
        }
        // ── Mattermost: Job-Fehler ──────────────────────────────
        const clientName = job.payload?.name || job.payload?.personA?.name || 'Unbekannt';
        sendMattermost(
          `❌ **Reading-Fehler** | \`${job.reading_type}\` | ${clientName} | Job \`${job.id}\`\n\`\`\`\n${errMsg}\n\`\`\``,
          'errors'
        );
      }
    }
  } catch (error) {
    console.error("❌ Polling System Fehler:", error);
  }
}

// ======================================================
// processTagesimpulsJob
// ======================================================
function calcTransitCrossReference(transitPlanets, chartData) {
  if (!chartData || !transitPlanets?.length) return [];
  const clientGates = new Set((chartData.gates || []).map(g => typeof g === 'object' ? g.number : g));
  return transitPlanets
    .filter(p => clientGates.has(p.gate))
    .map(p => ({ planet: p.planet, gate: p.gate, line: p.line }));
}

async function processTagesimpulsJob(job, reading) {
  console.log(`🌅 [Tagesimpuls] Verarbeite Job ${job.id}`);
  const payload = reading.client_data || job.payload || {};
  const { birthdate, birthtime, birthplace, name, ai_config } = payload;
  const format = payload.format || ai_config?.format || 'standard';
  const focus_topic = payload.focus_topic || ai_config?.focus_topic || null;
  const readingId = job.payload?.reading_id;
  const today = new Date().toISOString().split('T')[0];

  // Tier + Auto-Generierung
  const tier = payload.tier || ai_config?.tier || 'free';
  const userId = payload.user_id || ai_config?.user_id || null;
  const autoGenerated = !!(payload.auto_generated || ai_config?.auto_generated);
  console.log(`   📊 [Tagesimpuls] Tier: ${tier}, Auto: ${autoGenerated}, User: ${userId || '(anonym)'}`);

  // 1. Transit-Daten holen (Supabase → API-Fallback)
  let transitData = null;
  try {
    const { data: stored } = await supabasePublic
      .from('daily_transits').select('*').eq('date', today).maybeSingle();
    if (stored) {
      transitData = {
        date: stored.date,
        sun: { gate: stored.sun_gate, line: stored.sun_line },
        earth: { gate: stored.earth_gate, line: stored.earth_line },
        moon: { gate: stored.moon_gate, line: stored.moon_line },
        northNode: { gate: stored.north_node_gate, line: stored.north_node_line },
        allPlanets: stored.all_planets,
        activeChannels: stored.active_channels,
        definedCenters: stored.defined_centers,
        moonPhase: stored.moon_phase,
      };
      console.log(`   📅 [Tagesimpuls] Transit aus DB geladen`);
    } else {
      const res = await fetch(`${CONNECTION_KEY_URL}/api/transits/today`, {
        signal: AbortSignal.timeout(10000),
        headers: { 'x-api-key': process.env.API_KEY || '' },
      });
      if (res.ok) { transitData = await res.json(); console.log(`   📅 [Tagesimpuls] Transit von API geladen`); }
    }
  } catch (e) {
    console.warn('[Tagesimpuls] Transit-Fetch fehlgeschlagen:', e.message);
  }

  // 2. Chart-Daten laden oder berechnen
  let chartData = null;
  let existingReadingData = {};
  if (readingId) {
    const { data: row } = await supabasePublic.from('readings').select('reading_data, chart_data').eq('id', readingId).maybeSingle();
    if (row?.reading_data) { existingReadingData = row.reading_data; chartData = row.reading_data.chart_data || row.chart_data || null; }
  }
  if (!chartData && birthdate && birthtime && birthplace) {
    chartData = await fetchChartData(birthdate, birthtime, birthplace);
  }

  // 3. Kreuzreferenz berechnen (vollständig mit Typ/Autorität/Profil-Kontext)
  const clientCtx = payload.client_context || {};
  // Merge: client_context hat Vorrang vor chartData für HD-Metadaten
  const chartForCrossRef = {
    gates: clientCtx.gates || chartData?.gates || [],
    centers: clientCtx.centers || chartData?.centers || {},
    type: clientCtx.type || chartData?.type,
    authority: clientCtx.authority || chartData?.authority,
    profile: clientCtx.profile || chartData?.profile,
    definition: clientCtx.definition || chartData?.definition,
    channels: clientCtx.channels || chartData?.channels || [],
  };
  const crossRefFull = calculateCrossReference(transitData, chartForCrossRef);

  // Offene Zentren für Prompt ermitteln
  const openCentersText = Object.entries(chartForCrossRef.centers || {})
    .filter(([, v]) => typeof v === 'boolean' ? !v : (typeof v === 'object' ? !v?.defined : false))
    .map(([k]) => k)
    .join(', ') || 'keine';

  await supabase.from('reading_jobs').update({ status: 'processing', started_at: new Date().toISOString() }).eq('id', job.id);

  try {
    // ── Tier-abhängige Personalisierungsschichten ──────────────────────────
    // free:    generischer ~80-Wort-Impuls, keine Chart-Schichten
    // basic:   Schicht 1 (Typ) + Schicht 2 (Autorität)
    // premium: alle 5 Schichten
    // vip:     alle 5 Schichten + Coaching-Aufgabe + Reflexionsfrage
    const tierLayers = {};
    const isFree = tier === 'free';
    const isBasic = tier === 'basic';
    const isPremiumPlus = ['premium', 'vip'].includes(tier);
    const isVip = tier === 'vip';

    if (!isFree) {
      // Schicht 1: Typ
      if (chartForCrossRef.type) tierLayers.client_type = chartForCrossRef.type;
      // Schicht 2: Autorität
      if (chartForCrossRef.authority) tierLayers.client_authority = chartForCrossRef.authority;
    }
    if (isPremiumPlus) {
      // Schicht 3: Profil
      if (chartForCrossRef.profile) tierLayers.client_profile = chartForCrossRef.profile;
      // Schicht 4: Kreuzreferenz
      if (crossRefFull.compact) tierLayers.cross_reference_full = crossRefFull.compact;
      // Schicht 5: Definition & offene Zentren
      if (chartForCrossRef.definition) tierLayers.client_definition = chartForCrossRef.definition;
      if (openCentersText !== 'keine') tierLayers.client_open_centers = openCentersText;
    }
    if (isFree) {
      tierLayers.tier_instructions =
        'Erstelle einen kurzen, generischen Tagesimpuls von ca. 80 Wörtern. ' +
        'Keine individuelle Chart-Personalisierung — beschreibe nur die kollektive Tagesenergie.';
    }
    if (isVip) {
      tierLayers.vip_instructions =
        'Füge nach dem Haupt-Impuls ZWEI extra Abschnitte hinzu:\n' +
        '1. Beginne mit "[COACHING-AUFGABE]: " — eine einzige konkrete, sofort umsetzbare Aufgabe für heute.\n' +
        '2. Beginne mit "[REFLEXIONSFRAGE]: " — eine tiefe, persönliche Reflexionsfrage passend zum Typ und Chart.';
    }

    const hdUserData = {
      client_name: name,
      birth_date: birthdate,
      birth_time: birthtime,
      birth_location: birthplace,
      ai_config: {
        ...(ai_config || {}),
        transit: transitData,
        cross_reference: crossRefFull.activatedGates.map(g => ({
          planet: g.planet, gate: g.gate, line: g.line,
        })),
        format: format || 'standard',
        focus_topic: focus_topic || null,
        tier,
        ...tierLayers,
      },
    };

    const isReel = (format || 'standard') === 'reel';
    const usedTemplate = isReel ? 'tagesimpuls-reel' : 'tagesimpuls';
    const rawContent = await generateReading({ agentId: 'tagesimpuls', template: usedTemplate, userData: hdUserData, chartData });
    console.log(`✅ [Tagesimpuls] Generiert (${usedTemplate}): ${rawContent.substring(0, 80)}...`);

    // Reel: JSON parsen
    let resultPayload;
    if (isReel) {
      try {
        // Entferne optionale Markdown-Blöcke falls Claude sie trotzdem erzeugt
        const cleaned = rawContent.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
        const parsed = JSON.parse(cleaned);
        resultPayload = { format: 'reel', reel: parsed };
        console.log(`🎬 [Tagesimpuls] Reel-JSON geparst: hook="${parsed.hook?.substring(0, 40)}..."`);
      } catch (parseErr) {
        console.warn('[Tagesimpuls] Reel-JSON-Parse fehlgeschlagen, speichere als Text:', parseErr.message);
        resultPayload = { format: 'reel', text: rawContent, parse_error: parseErr.message };
      }
    } else {
      resultPayload = { text: rawContent };
    }

    if (readingId) {
      await supabasePublic.from('readings').update({
        status: 'completed',
        reading_data: { ...existingReadingData, ...resultPayload, chart_data: chartData },
        updated_at: new Date().toISOString(),
      }).eq('id', readingId);
    }

    await supabase.from('reading_jobs').update({
      status: 'completed',
      result: resultPayload,
      finished_at: new Date().toISOString(),
    }).eq('id', job.id);

    // ── Subscriber-DM: Direkter telegram_chat_id im Payload (kein userId) → persönliche DM ──
    const directChatId = payload.telegram_chat_id || null;
    if (directChatId && !userId && resultPayload.text) {
      try {
        const today_de = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const coachingMatch = resultPayload.text.match(/\[COACHING-AUFGABE\]:\s*(.+)/s);
        const reflexionMatch = resultPayload.text.match(/\[REFLEXIONSFRAGE\]:\s*(.+)/s);
        let mainText = resultPayload.text
          .replace(/\[COACHING-AUFGABE\]:[\s\S]*/, '')
          .replace(/\[REFLEXIONSFRAGE\]:[\s\S]*/, '')
          .trim();

        const recipientName = payload.name || 'du';
        const lines = [
          `✨ *Dein Tagesimpuls — ${escapeTgMd2(today_de)}*`,
          '',
          escapeTgMd2(mainText),
        ];
        if (coachingMatch) {
          lines.push('', `🎯 *Coaching\\-Aufgabe:*`, escapeTgMd2(coachingMatch[1].trim()));
        }
        if (reflexionMatch) {
          lines.push('', `💭 *Reflexionsfrage:*`, `_${escapeTgMd2(reflexionMatch[1].trim())}_`);
        }
        lines.push('', '_The Connection Key_');

        await sendTelegramMessage(directChatId, lines.join('\n'));
        console.log(`📲 [Subscriber] DM gesendet an ${directChatId} (${recipientName}, tier=${tier})`);
      } catch (tgErr) {
        console.warn('[Subscriber] DM Fehler:', tgErr.message);
      }
    }

    // Kein Channel-Post — persönliche Reading-Daten gehören nicht in einen öffentlichen Kanal

    // ── Aufgabe 3: In daily_impulses speichern (nur bei Auto-Generierung + user_id) ──
    if (autoGenerated && userId) {
      try {
        const impulseRow = {
          user_id: userId,
          date: today,
          tier,
          format: format || 'standard',
          text: resultPayload.text || null,
          reel: resultPayload.reel || null,
          transit_data: transitData ? {
            date: transitData.date,
            sun: transitData.sun,
            earth: transitData.earth,
            moon: transitData.moon,
            moonPhase: transitData.moonPhase,
          } : null,
          chart_summary: chartData ? {
            type: chartData.type,
            authority: chartData.authority,
            profile: chartData.profile,
          } : null,
          job_id: job.id,
        };
        const { error: diErr } = await supabasePublic
          .from('daily_impulses')
          .upsert(impulseRow, { onConflict: 'user_id,date,format' });
        if (diErr) {
          console.warn('[Tagesimpuls] daily_impulses Upsert fehlgeschlagen:', diErr.message);
        } else {
          console.log(`✅ [Tagesimpuls] Gespeichert in daily_impulses (user=${userId}, tier=${tier})`);
        }
      } catch (saveErr) {
        console.warn('[Tagesimpuls] daily_impulses Fehler:', saveErr.message);
      }

      // VIP: Telegram-DM mit persönlichem Impuls senden
      if (isVip && resultPayload.text) {
        try {
          // telegram_chat_id aus payload oder Supabase nachladen
          let tgChatId = payload.telegram_chat_id || null;
          if (!tgChatId && userId) {
            const { data: prof } = await supabasePublic
              .from('profiles').select('telegram_chat_id').eq('id', userId).maybeSingle();
            tgChatId = prof?.telegram_chat_id || null;
          }
          if (tgChatId) {
            const today_de = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const nameEsc = escapeTgMd2(name || 'dein');
            const bodyEsc = escapeTgMd2(resultPayload.text);

            // VIP-spezifische Teile extrahieren und formatieren
            const coachingMatch = resultPayload.text.match(/\[COACHING-AUFGABE\]:\s*(.+)/);
            const reflexionMatch = resultPayload.text.match(/\[REFLEXIONSFRAGE\]:\s*(.+)/);
            let mainText = resultPayload.text
              .replace(/\[COACHING-AUFGABE\]:.*/, '')
              .replace(/\[REFLEXIONSFRAGE\]:.*/, '')
              .trim();

            const lines = [
              `✨ *Dein VIP\\-Tagesimpuls — ${escapeTgMd2(today_de)}*`,
              '',
              escapeTgMd2(mainText),
            ];
            if (coachingMatch) {
              lines.push('', `🎯 *Coaching\\-Aufgabe:*`, escapeTgMd2(coachingMatch[1].trim()));
            }
            if (reflexionMatch) {
              lines.push('', `💭 *Reflexionsfrage:*`, `_${escapeTgMd2(reflexionMatch[1].trim())}_`);
            }
            lines.push('', '_The Connection Key_');

            await sendTelegramMessage(tgChatId, lines.join('\n'));
            console.log(`📲 [Tagesimpuls] VIP Telegram-DM gesendet an ${tgChatId}`);
          }
        } catch (tgErr) {
          console.warn('[Tagesimpuls] VIP Telegram-DM Fehler:', tgErr.message);
        }
      }
    }
  } catch (err) {
    console.error('[Tagesimpuls] Fehler:', err.message);
    await supabase.from('reading_jobs').update({
      status: 'failed', error: err.message, finished_at: new Date().toISOString(),
    }).eq('id', job.id);
    throw err;
  }
}

// ======================================================
// processHumanDesignJob – FIX: Chart-Berechnung integriert
// ======================================================
async function processHumanDesignJob(job, reading) {
  console.log(`🔄 [Human Design] Verarbeite Job ${job.id}`);

  const payload = reading.client_data || job.payload || {};
  const { birthdate, birthtime, birthplace, name, ai_model, ai_config, reading_type } = payload;
  const templateName = reading_type || job.reading_type || 'basic';
  const readingId = job.payload?.reading_id;

  // Chart-Daten: Erst aus Reading laden, dann ggf. neu berechnen
  let chartData = null;
  let existingReadingData = {};
  if (readingId) {
    const { data: readingRow } = await supabasePublic
      .from("readings")
      .select("reading_data, chart_data")
      .eq("id", readingId)
      .maybeSingle();
    if (readingRow?.reading_data) {
      existingReadingData = readingRow.reading_data;
      chartData = existingReadingData.chart_data || readingRow.chart_data || null;
      if (chartData) {
        console.log(`   📊 Chart-Daten aus DB geladen: Typ=${chartData.type}, Profil=${chartData.profile}`);
        if (!chartData.incarnationCross && !chartData.incarnation_cross) {
          console.warn(`   ⚠️ incarnationCross fehlt in Chart-Daten — wird im Reading fehlen!`);
        }
      }
    }
  }

  // NEU: Wenn keine Chart-Daten vorhanden, berechne sie
  if (!chartData && birthdate && birthtime && birthplace) {
    console.log("   📊 [Human Design] Keine Chart-Daten vorhanden – berechne neu...");
    chartData = await fetchChartData(birthdate, birthtime, birthplace);
  }

  await supabase
    .from("reading_jobs")
    .update({ status: "processing", started_at: new Date().toISOString() })
    .eq("id", job.id);

  try {
    const hdUserData = {
      client_name: name,
      birth_date: birthdate,
      birth_time: birthtime,
      birth_location: birthplace,
      ai_model,
      ai_config
    };

    const [rawContent, reflexionsfragen] = await Promise.all([
      generateReading({
        agentId: 'human_design',
        template: templateName,
        userData: hdUserData,
        chartData
      }),
      generateReflexionsfragen(chartData, hdUserData)
    ]);

    console.log(`✅ [Human Design] Reading generiert: ${rawContent.substring(0, 100)}...`);

    // ── Pipeline: Validierung & Korrektur ──────────────────────────────────
    let pipelineInfo = { validated: false, corrected: false, errorCount: 0 };
    let content = rawContent;
    try {
      const pipeline = await runReadingPipeline(rawContent, chartData);
      content = pipeline.text;
      pipelineInfo = {
        validated: pipeline.validated,
        corrected: pipeline.corrected,
        errorCount: pipeline.errorCount,
      };
    } catch (pipelineErr) {
      console.warn("[Pipeline] [HumanDesign] Fehler — Fallback auf Original:", pipelineErr.message);
    }

    if (readingId) {
      const newReadingData = {
        ...existingReadingData,
        text: content,
        chart_data: chartData || existingReadingData.chart_data,
        ...(reflexionsfragen ? { reflexionsfragen } : {}),
        _pipeline: pipelineInfo,
      };
      const { data: updatedRow, error: updateError } = await supabasePublic
        .from("readings")
        .update({
          status: "completed",
          reading_data: newReadingData,
          updated_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
        .eq("id", readingId)
        .select("id, reading_data")
        .maybeSingle();

      if (updateError) {
        console.error(`❌ [Human Design] Fehler beim Update von Reading ${readingId}:`, updateError);
      } else if (!updatedRow) {
        console.error(`❌ [Human Design] Update: 0 Zeilen – Reading ${readingId} nicht gefunden!`);
      } else {
        const len = updatedRow?.reading_data?.text?.length || 0;
        console.log(`✅ [Human Design] Reading ${readingId} aktualisiert (${len} Zeichen)`);
      }
    } else {
      console.warn(`⚠️ [Human Design] Keine reading_id in Job ${job.id} gefunden!`);
    }

    await supabase
      .from("reading_jobs")
      .update({
        status: "completed",
        finished_at: new Date().toISOString()
      })
      .eq("id", job.id);

    console.log(`✅ [Human Design] Job ${job.id} abgeschlossen`);
  } catch (error) {
    console.error(`❌ [Human Design] Fehler bei Job ${job.id}:`, error);

    await supabase
      .from("reading_jobs")
      .update({
        status: "failed",
        error: error.message,
        finished_at: new Date().toISOString()
      })
      .eq("id", job.id);

    if (readingId) {
      await supabasePublic
        .from("readings")
        .update({
          status: "failed",
          error: error.message,
          updated_at: new Date().toISOString()
        })
        .eq("id", readingId);
    }
  }
}

// ======================================================
// processConnectionJob – FIX: Echte Charts
// ======================================================
async function processConnectionJob(job, reading) {
  console.log(`🔄 [Connection] Verarbeite Job ${job.id}`);
  const payload = reading.client_data || job.payload || {};

  // Payload-Normalisierung: v4-API sendet flaches Format, ältere senden verschachteltes
  let nameA = payload.name || payload.personA?.name || 'Person A';
  let nameB = payload.name2 || payload.personB?.name || 'Person B';
  const birthDateA = payload.birthdate || payload.personA?.birthDate;
  const birthTimeA = payload.birthtime || payload.personA?.birthTime;
  const birthPlaceA = payload.birthplace || payload.personA?.birthPlace;
  const birthDateB = payload.birthdate2 || payload.personB?.birthDate;
  const birthTimeB = payload.birthtime2 || payload.personB?.birthTime;
  const birthPlaceB = payload.birthplace2 || payload.personB?.birthPlace;
  const connectionQuestion = payload.connectionQuestion || payload.personA?.connectionQuestion;
  const readingId = payload.reading_id;
  const connectionReadingId = payload.connection_reading_id;
  const personAId = payload.person_a_id;
  const personBId = payload.person_b_id;
  const readingType = job.reading_type || payload.reading_type || 'connection';

  await supabase
    .from("reading_jobs")
    .update({ status: "processing", started_at: new Date().toISOString() })
    .eq("id", job.id);

  // ── Chart-Daten laden ─────────────────────────────────────────────────
  // Priorität: 1) person_a_id/person_b_id → readings-Tabelle
  //            2) Geburtsdaten → Chart-API
  //            3) Bestehende Daten aus reading_data
  let existingReadingData = {};
  if (readingId) {
    const { data: row } = await supabasePublic.from("readings").select("reading_data").eq("id", readingId).maybeSingle();
    if (row?.reading_data) existingReadingData = row.reading_data;
  }

  let personAChart = null;
  let personBChart = null;

  if (personAId) {
    const result = await fetchChartFromReading(personAId);
    personAChart = result?.chart || null;
    if (result?.name) nameA = result.name;
    console.log(`   ✅ [Connection] Person A aus Reading ${personAId}: ${personAChart?.type || "kein Chart"}`);
  }
  if (personBId) {
    const result = await fetchChartFromReading(personBId);
    personBChart = result?.chart || null;
    if (result?.name) nameB = result.name;
    console.log(`   ✅ [Connection] Person B aus Reading ${personBId}: ${personBChart?.type || "kein Chart"}`);
  }

  // Fallback: Geburtsdaten → Chart-API → bestehende Daten
  if (!personAChart) personAChart = await fetchChartData(birthDateA, birthTimeA, birthPlaceA)
    || existingReadingData.chart_data || { type: "Unbekannt", gates: [], centers: {} };
  if (!personBChart) personBChart = await fetchChartData(birthDateB, birthTimeB, birthPlaceB)
    || existingReadingData.chart_data2 || { type: "Unbekannt", gates: [], centers: {} };

  console.log(`   [Connection] Charts: A=${personAChart.type || "?"}, B=${personBChart.type || "?"}`);

  // ── Composite-Daten laden ─────────────────────────────────────────────
  let compositeData = null;
  if (connectionReadingId) {
    const { data: connRow } = await supabasePublic
      .schema("public")
      .from("connection_readings")
      .select("composite_chart, composite_analysis, dynamics")
      .eq("id", connectionReadingId)
      .maybeSingle();
    compositeData = connRow?.composite_chart || null;
  }

  const dynamics = analyzeConnectionDynamics(personAChart, personBChart, nameA, nameB);

  // Template wählen
  const templateName = readingType === 'connection-basic' ? 'connection-basic'
    : readingType === 'compatibility' ? 'compatibility'
    : readingType === 'relationship' ? 'relationship'
    : 'connection';

  // Connection: immer 2-Pass für vollständige Qualität
  const rawContent = await generateConnectionReadingTwoParts({
    userData: {
      personA: { name: nameA },
      personB: { name: nameB },
      personAChart,
      personBChart,
      dynamics,
      compositeData,
      connectionQuestion,
    },
    personAChart,
    personBChart,
    modelConfig: MODEL_CONFIG[DEFAULT_MODEL],
    templateName,
  });

  // ── Pipeline: Validierung & Korrektur ─────────────────────────────────
  let pipelineInfo = { validated: false, corrected: false, errorCount: 0 };
  let content = rawContent;
  try {
    const pipeline = await runReadingPipeline(rawContent, personAChart);
    content = pipeline.text;
    pipelineInfo = { validated: pipeline.validated, corrected: pipeline.corrected, errorCount: pipeline.errorCount };
  } catch (pipelineErr) {
    console.warn('[Pipeline] [Connection] Fehler — Fallback auf Original:', pipelineErr.message);
  }

  const reflexionsfragen = await generateConnectionReflexionsfragen(personAChart, personBChart, nameA, nameB);

  // ── connection_readings aktualisieren ─────────────────────────────────
  if (connectionReadingId) {
    await supabasePublic
      .schema("public")
      .from("connection_readings")
      .update({
        chart_a: personAChart,
        chart_b: personBChart,
        person_a_chart: personAChart,
        person_b_chart: personBChart,
        dynamics: dynamics,
        electromagnetic_channels: dynamics.electromagnetic_channels,
        complementary_gates: dynamics.complementary_gates,
        similarities: dynamics.similarities,
        differences: dynamics.differences,
        composite_analysis: { text: content, generated_at: new Date().toISOString() },
        updated_at: new Date().toISOString()
      })
      .eq("id", connectionReadingId);
  }

  // ── readings aktualisieren ────────────────────────────────────────────
  const newReadingData = {
    ...existingReadingData,
    text: content,
    chart_data: personAChart,
    chart_data2: personBChart,
    personA: { name: nameA },
    personB: { name: nameB },
    ...(reflexionsfragen ? { reflexionsfragen } : {}),
    _pipeline: pipelineInfo,
  };

  if (readingId) {
    await supabasePublic
      .from("readings")
      .update({ status: "completed", progress: 100, reading_data: newReadingData, updated_at: new Date().toISOString() })
      .eq("id", readingId);
  }

  await supabase
    .from("reading_jobs")
    .update({ status: "completed", finished_at: new Date().toISOString() })
    .eq("id", job.id);

  console.log(`✅ [Connection] Job ${job.id} abgeschlossen (${content?.length} Zeichen, A=${nameA}, B=${nameB})`);
}


// ============================================================================
// PHASEN-READING — 90-Tage-Phasenanalyse (Anziehung / Reibung / Wahrheit)
// ============================================================================

// Phasen-Berechnung anhand des Beziehungsstart-Datums
function calculatePhase(relationshipStartDate) {
  const start = new Date(relationshipStartDate);
  if (isNaN(start.getTime())) {
    throw new Error(`Ungültiges relationshipStartDate: ${relationshipStartDate}`);
  }
  const today = new Date();
  const diffMs = today - start;
  const currentDay = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);

  let currentPhase, phaseLabel;
  if (currentDay <= 30) {
    currentPhase = 'phase-1-anziehung';
    phaseLabel = 'Phase 1 — Die Anziehung (Tag 1–30)';
  } else if (currentDay <= 60) {
    currentPhase = 'phase-2-reibung';
    phaseLabel = 'Phase 2 — Die Reibung (Tag 31–60)';
  } else if (currentDay <= 90) {
    currentPhase = 'phase-3-wahrheit';
    phaseLabel = 'Phase 3 — Die Wahrheit (Tag 61–90)';
  } else {
    currentPhase = 'post-90';
    phaseLabel = `Beziehung läuft seit ${currentDay} Tagen — über die 90-Tage-Phase hinaus (retrospektive Analyse)`;
  }

  return { currentDay, currentPhase, phaseLabel };
}

// 2-Pass-Generierung für phasen-reading (analog generateConnectionReadingTwoParts)
async function generatePhasenReadingTwoParts({ userData, personAChart, personBChart, modelConfig, phaseInfo }) {
  const knowledgeText = buildReadingKnowledge('connection');
  const nameA = userData.personA?.name || 'Person A';
  const nameB = userData.personB?.name || 'Person B';

  const chartAInfo = `${nameA}:\n${buildChartInfo(personAChart)}`;
  const chartBInfo = `${nameB}:\n${buildChartInfo(personBChart)}`;
  const compositeBlock = buildTwoPersonCompositeBlock(personAChart, personBChart, nameA, nameB);

  // Template aus Memory mit Placeholdern füllen
  let template = templates['phasen-reading'] || '';

  // Hilfsfunktionen — Composite-Kanäle als Text (snake_case-Felder sind die Wahrheit;
  // camelCase-Aliasse existieren nicht in dynamics, deshalb Fallback nötig).
  const formatChannelList = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return 'keine';
    return arr.map(c => (typeof c === 'string' ? c : (c.channel || (c.gate1 && c.gate2 ? `${c.gate1}-${c.gate2}` : '')))).filter(Boolean).join(', ') || 'keine';
  };
  const dyn = userData.dynamics || {};
  const emList            = formatChannelList(dyn.electromagneticChannels || dyn.electromagnetic_channels);
  const compromiseList    = formatChannelList(dyn.compromiseChannels      || dyn.compromise_channels);
  const companionshipList = formatChannelList(dyn.companionshipChannels   || dyn.companionship_channels);
  const parallelList      = formatChannelList(dyn.parallelChannels        || dyn.parallel_channels);

  // Definierte Zentren explizit zählen + benennen, damit das Modell keine
  // Off-by-One-Fehler macht.
  const centerNamesDe = { head: 'Krone', ajna: 'Ajna', throat: 'Kehle', g: 'G-Zentrum', heart: 'Herz/Ego', spleen: 'Milz', 'solar-plexus': 'Solarplexus', sacral: 'Sakral', root: 'Wurzel' };
  const summarizeCenters = (chart) => {
    const c = chart?.centers || {};
    const def = Object.entries(c).filter(([_, v]) => v).map(([k]) => centerNamesDe[k] || k);
    const open = Object.entries(c).filter(([_, v]) => !v).map(([k]) => centerNamesDe[k] || k);
    return { count: def.length, openCount: open.length, defNames: def.join(', ') || '(keine)', openNames: open.join(', ') || '(keine)' };
  };
  const sumA = summarizeCenters(personAChart);
  const sumB = summarizeCenters(personBChart);

  const placeholders = {
    personAName: nameA,
    personBName: nameB,
    typeA: personAChart?.type || 'Unbekannt',
    typeB: personBChart?.type || 'Unbekannt',
    strategyA: personAChart?.strategy || '?',
    strategyB: personBChart?.strategy || '?',
    authorityA: personAChart?.authority || '?',
    authorityB: personBChart?.authority || '?',
    profileA: personAChart?.profile || '?',
    profileB: personBChart?.profile || '?',
    relationshipStartDate: userData.relationshipStartDate || '',
    currentDay: String(phaseInfo.currentDay),
    currentPhase: phaseInfo.phaseLabel,
    electromagneticChannels: emList,
    compromiseChannels: compromiseList,
    companionshipChannels: companionshipList,
    parallelChannels: parallelList,
    // Legacy-Aliasse für ältere Templates — gleiche Inhalte, neue Begriffe sind Standard.
    dominanceChannels: companionshipList,
    compromiseGates: compromiseList,
    // Center-Anzahl explizit, gegen Off-by-One-Halluzinationen
    definedCentersCountA: String(sumA.count),
    definedCentersCountB: String(sumB.count),
    definedCentersA: sumA.defNames,
    definedCentersB: sumB.defNames,
    openCentersCountA: String(sumA.openCount),
    openCentersCountB: String(sumB.openCount),
    openCentersA: sumA.openNames,
    openCentersB: sumB.openNames,
  };
  for (const [key, val] of Object.entries(placeholders)) {
    template = template.split(`{{${key}}}`).join(String(val));
  }

  const baseSystem = `${template}

Verwende folgendes Wissen:
${knowledgeText}

ANWEISUNG: Die Chart-Daten wurden via Swiss Ephemeris berechnet. Füge KEINEN Disclaimer ein. Beginne direkt mit "## 1. Wo ihr gerade steht".
PFLICHT: Nenne BEIDE Personen (${nameA} UND ${nameB}) in JEDER Sektion explizit!
PFLICHT: Beziehe jede Sektion auf den aktuellen Tag ${phaseInfo.currentDay} und die aktuelle Phase (${phaseInfo.phaseLabel}).`;

  const part1Prompt = `${baseSystem}

CHART PERSON A — ${chartAInfo}

CHART PERSON B — ${chartBInfo}
${compositeBlock}

BEZIEHUNGSSTART: ${userData.relationshipStartDate}
AKTUELLER TAG: ${phaseInfo.currentDay} von 90
AKTUELLE PHASE: ${phaseInfo.phaseLabel}

ERSTELLE NUR SEKTIONEN 1 BIS 5:
## 1. Wo ihr gerade steht
## 2. Phase 1 — Die Anziehung (Tag 1–30)
## 3. Phase 2 — Die Reibung (Tag 31–60)
## 4. Phase 3 — Die Wahrheit (Tag 61–90)
## 5. Eure Composite-Dynamik im Detail

Mindestlänge: 2500 Wörter. Beginne direkt mit "## 1. Wo ihr gerade steht". Deutsch, ihr/euch-Form, würdevoll und präzise.`;

  const part2Prompt = `${baseSystem}

CHART PERSON A — ${chartAInfo}

CHART PERSON B — ${chartBInfo}
${compositeBlock}

BEZIEHUNGSSTART: ${userData.relationshipStartDate}
AKTUELLER TAG: ${phaseInfo.currentDay} von 90
AKTUELLE PHASE: ${phaseInfo.phaseLabel}

ERSTELLE NUR SEKTIONEN 6 BIS 10 als Fortsetzung des Readings (kein neuer Titel):
## 6. Eure Strategien und Autoritäten im 90-Tage-Rhythmus
## 7. Konditionierungsmuster: Was ihr voneinander übernehmt
## 8. Stärken und Wachstumsfeld eurer Konstellation
## 9. Empfehlungen für die kommenden Tage bis Tag 90
## 10. Das Muster, das bleibt

Mindestlänge: 2500 Wörter. Beginne direkt mit "## 6.". Deutsch, ihr/euch-Form, würdevoll und präzise.`;

  return generateTwoParts({ readingType: 'phasen-reading', part1Prompt, part2Prompt, modelConfig, tokensPerPart: 8000 });
}

// 5 Reflexionsfragen für das Paar in der aktuellen Phase
async function generatePhasenReflexionsfragen(personAChart, personBChart, personAName, personBName, phaseInfo) {
  if (!isClaudeAvailable()) return null;
  const prompt = `Du bist ein erfahrener Human Design Coach. Erstelle 5 tiefe, persönliche Reflexionsfragen für dieses Paar (${personAName} & ${personBName}), basierend auf der spezifischen Composite-Konstellation und der aktuellen Phase (Tag ${phaseInfo.currentDay} — ${phaseInfo.phaseLabel}).

${buildChartSummary(personAChart, personAName || 'Person A')}

${buildChartSummary(personBChart, personBName || 'Person B')}

Anforderungen:
- Genau 5 Fragen
- 1–2 Sätze pro Frage
- keine Ja/Nein-Fragen
- konkret zur aktuellen Phase passen
- in der ihr-Form, einladend, nicht wertend

Antworte NUR mit einem JSON-Array mit genau 5 Strings, ohne weiteren Text:
["Frage 1", "Frage 2", "Frage 3", "Frage 4", "Frage 5"]`;
  try {
    const result = await generateWithClaude(prompt, { model: 'claude-sonnet-4-6', maxTokens: 1000, temperature: 0.8 });
    const match = result.match(/\[[\s\S]*?\]/);
    if (match) return JSON.parse(match[0]);
    return null;
  } catch (err) {
    console.warn('⚠️ Phasen-Reflexionsfragen fehlgeschlagen:', err.message);
    return null;
  }
}

// Worker für phasen-reading Jobs (analog processConnectionJob)
async function processPhasenReadingJob(job, reading) {
  console.log(`🔄 [Phasen] Verarbeite Job ${job.id}`);
  const payload = reading.client_data || job.payload || {};

  const nameA = payload.name || payload.personA?.name || 'Person A';
  const nameB = payload.name2 || payload.personB?.name || 'Person B';
  const birthDateA = payload.birthdate || payload.personA?.birthDate;
  const birthTimeA = payload.birthtime || payload.personA?.birthTime;
  const birthPlaceA = payload.birthplace || payload.personA?.birthPlace;
  const birthDateB = payload.birthdate2 || payload.personB?.birthDate;
  const birthTimeB = payload.birthtime2 || payload.personB?.birthTime;
  const birthPlaceB = payload.birthplace2 || payload.personB?.birthPlace;
  const relationshipStartDate = payload.relationshipStartDate || payload.relationship_start_date;
  const readingId = payload.reading_id;

  // Pflichtfelder validieren
  if (!birthDateB || !birthTimeB || !birthPlaceB) {
    throw new Error('phasen-reading: zweite Person (birthdate2/birthtime2/birthplace2) ist Pflicht');
  }
  if (!relationshipStartDate) {
    throw new Error('phasen-reading: relationshipStartDate ist Pflicht (Format YYYY-MM-DD)');
  }

  const phaseInfo = calculatePhase(relationshipStartDate);
  console.log(`   [Phasen] Tag ${phaseInfo.currentDay} | ${phaseInfo.phaseLabel}`);

  if (readingId) {
    await supabasePublic.from('readings').update({ status: 'processing', progress: 10 }).eq('id', readingId);
  }

  // Charts laden (Geburtsdaten → Chart-API, Fallback existing reading_data)
  let existingReadingData = {};
  if (readingId) {
    const { data: row } = await supabasePublic.from('readings').select('reading_data').eq('id', readingId).maybeSingle();
    if (row?.reading_data) existingReadingData = row.reading_data;
  }

  const personAChart = await fetchChartData(birthDateA, birthTimeA, birthPlaceA)
    || existingReadingData.chart_data || { type: 'Unbekannt', gates: [], centers: {} };
  const personBChart = await fetchChartData(birthDateB, birthTimeB, birthPlaceB)
    || existingReadingData.chart_data2 || { type: 'Unbekannt', gates: [], centers: {} };

  console.log(`   [Phasen] Charts: A=${personAChart.type || '?'}, B=${personBChart.type || '?'}`);

  const dynamics = analyzeConnectionDynamics(personAChart, personBChart, nameA, nameB);

  if (readingId) {
    await supabasePublic.from('readings').update({ progress: 30 }).eq('id', readingId);
  }

  // 2-Pass + Reflexionsfragen parallel
  const [rawContent, reflexionsfragen] = await Promise.all([
    generatePhasenReadingTwoParts({
      userData: {
        personA: { name: nameA, birthDate: birthDateA },
        personB: { name: nameB, birthDate: birthDateB },
        relationshipStartDate,
        dynamics,
      },
      personAChart,
      personBChart,
      modelConfig: MODEL_CONFIG[DEFAULT_MODEL],
      phaseInfo,
    }),
    generatePhasenReflexionsfragen(personAChart, personBChart, nameA, nameB, phaseInfo),
  ]);

  if (readingId) {
    await supabasePublic.from('readings').update({ progress: 80 }).eq('id', readingId);
  }

  // Pipeline-Validierung (analog Connection)
  let pipelineInfo = { validated: false, corrected: false, errorCount: 0 };
  let content = rawContent;
  try {
    const pipeline = await runReadingPipeline(rawContent, personAChart);
    content = pipeline.text;
    pipelineInfo = { validated: pipeline.validated, corrected: pipeline.corrected, errorCount: pipeline.errorCount };
  } catch (pipelineErr) {
    console.warn('[Pipeline] [Phasen] Fehler — Fallback auf Original:', pipelineErr.message);
  }

  // Reading speichern
  const newReadingData = {
    ...existingReadingData,
    text: content,
    chart_data: personAChart,
    chart_data2: personBChart,
    personA: { name: nameA },
    personB: { name: nameB },
    phase_info: phaseInfo,
    relationship_start_date: relationshipStartDate,
    ...(reflexionsfragen ? { reflexionsfragen } : {}),
    _pipeline: pipelineInfo,
  };

  if (readingId) {
    await supabasePublic.from('readings').update({
      status: 'completed',
      progress: 100,
      reading_data: newReadingData,
      updated_at: new Date().toISOString(),
    }).eq('id', readingId);
  }

  await supabase.from('reading_jobs').update({
    status: 'completed',
    finished_at: new Date().toISOString(),
  }).eq('id', job.id);

  console.log(`✅ [Phasen] Job ${job.id} abgeschlossen (${content?.length} Zeichen, Tag ${phaseInfo.currentDay})`);
}


// ======================================================
// processChannelAnalysisJob – Kanal-Analyse (1 oder 2 Personen)
// ======================================================
async function processChannelAnalysisJob(job, reading) {
  console.log(`🔄 [ChannelAnalysis] Verarbeite Job ${job.id}`);
  const payload = reading.client_data || job.payload || {};

  const nameA = payload.name || 'Klient';
  const nameB = payload.name2 || null;
  const birthDateA = payload.birthdate;
  const birthTimeA = payload.birthtime;
  const birthPlaceA = payload.birthplace;
  const birthDateB = payload.birthdate2 || null;
  const birthTimeB = payload.birthtime2 || null;
  const birthPlaceB = payload.birthplace2 || null;
  const readingId = payload.reading_id;
  const hasPartner = !!(birthDateB && birthTimeB && birthPlaceB);

  await supabase
    .from('reading_jobs')
    .update({ status: 'processing', started_at: new Date().toISOString() })
    .eq('id', job.id);

  let existingReadingData = {};
  if (readingId) {
    const { data: row } = await supabasePublic.from('readings').select('reading_data').eq('id', readingId).maybeSingle();
    if (row?.reading_data) existingReadingData = row.reading_data;
  }

  const chartA = await fetchChartData(birthDateA, birthTimeA, birthPlaceA)
    || existingReadingData.chart_data
    || { type: 'Unbekannt', gates: [], channels: [], centers: {} };

  let chartB = null;
  let dynamics = { electromagnetic_channels: [] };
  if (hasPartner) {
    chartB = await fetchChartData(birthDateB, birthTimeB, birthPlaceB)
      || existingReadingData.chart_data2
      || { type: 'Unbekannt', gates: [], channels: [], centers: {} };
    dynamics = analyzeConnectionDynamics(chartA, chartB, nameA, nameB);
    console.log(`   [ChannelAnalysis] Aktivierte Kanäle: ${dynamics.activatedChannels?.length || 0} (EM: ${dynamics.electromagnetic_channels?.length || 0}, Kompromiss: ${dynamics.compromise_channels?.length || 0}, Companionship: ${dynamics.companionship_channels?.length || 0}, Parallel: ${dynamics.parallel_channels?.length || 0})`);
  }

  // Dead Code entfernt: CHANNEL_NAMES_MAP / getChName / emText —
  // Composite-Block (siehe unten) liefert deutsche Kanal-Namen direkt.

  const sectionNum = hasPartner ? 7 : 6;

  const systemPrompt = `Du bist ein Human Design Experte mit tiefem Verständnis der 36 Kanäle, ihrer Circuit-Zugehörigkeit und ihrer Wirkung im Alltag. Dieses Reading ist ein professionelles Coach-Tool.\n\n${templates['channel-analysis'] || ''}`;

  // Baustein 4: deutsche Fakten-Blöcke für beide Personen
  const factsA = `=== ${nameA} ===\n${buildChartInfo(chartA)}`;
  const factsB = hasPartner ? `\n=== ${nameB} ===\n${buildChartInfo(chartB)}` : '';
  const compositeBlock = hasPartner ? buildTwoPersonCompositeBlock(chartA, chartB, nameA, nameB) : '';

  // Legacy-Sektion mit deutschem Kanal-Namen (CHANNEL_NAMES_MAP) bleibt als
  // ergänzender Hinweis — der Composite-Block oben ist die Wahrheitsquelle.
  const partnerBlock = hasPartner ? `
${factsB}
${compositeBlock}

Sektion 6 (Elektromagnetische Verbindung) nur für die im Composite-Block oben
unter "Elektromagnetisch" gelisteten Kanäle einschließen.
` : '\nKein Partner — Sektion 6 weglassen.';

  const userMessage = `Erstelle eine vollständige Kanal-Analyse für ${nameA}${hasPartner ? ` & ${nameB}` : ''}:

${factsA}
${partnerBlock}
Letzte Sektion (Coach-Werkzeugkasten) = Sektion ${sectionNum}.
Nur angegebene Kanäle/Gates verwenden. ${nameA} in jeder Sektion beim Namen nennen.`;

  const aiModel = payload.ai_model || DEFAULT_MODEL;
  const modelConfig = MODEL_CONFIG[aiModel] || MODEL_CONFIG[DEFAULT_MODEL];
  const modelsToTry = modelConfig.models || [aiModel];

  let content = null;
  for (const modelId of modelsToTry) {
    try {
      content = await generateWithClaude(systemPrompt + '\n\n' + userMessage, {
        model: modelId, maxTokens: 10000, temperature: 0.7,
      });
      if (content) break;
    } catch (err) {
      console.warn(`   [ChannelAnalysis] Modell ${modelId} fehlgeschlagen:`, err.message);
    }
  }
  if (!content) throw new Error('[ChannelAnalysis] Keine Antwort von Claude');

  // ── Pipeline: Validierung & Korrektur ─────────────────────────────────
  let pipelineInfoCA = { validated: false, corrected: false, errorCount: 0 };
  try {
    const pipeline = await runReadingPipeline(content, chartA);
    content = pipeline.text;
    pipelineInfoCA = { validated: pipeline.validated, corrected: pipeline.corrected, errorCount: pipeline.errorCount };
  } catch (pErr) { console.warn('[Pipeline] [ChannelAnalysis] Fehler:', pErr.message); }

  const newReadingData = {
    ...existingReadingData,
    text: content,
    chart_data: chartA,
    ...(chartB ? { chart_data2: chartB } : {}),
    ...(hasPartner ? { electromagnetic_channels: dynamics.electromagnetic_channels, partner_name: nameB } : {}),
    _pipeline: pipelineInfoCA,
  };

  if (readingId) {
    await supabasePublic
      .from('readings')
      .update({ status: 'completed', progress: 100, reading_data: newReadingData, updated_at: new Date().toISOString() })
      .eq('id', readingId);
  }
  await supabase
    .from('reading_jobs')
    .update({ status: 'completed', finished_at: new Date().toISOString() })
    .eq('id', job.id);

  console.log(`✅ [ChannelAnalysis] Job ${job.id} abgeschlossen (${content?.length} Zeichen, Partner: ${hasPartner})`);
}

// ======================================================
// processSexualityJob – Intimität & Resonanz (2 Personen)
// ======================================================
async function processSexualityJob(job, reading) {
  console.log(`🔄 [Sexuality] Verarbeite Job ${job.id}`);
  const payload = reading.client_data || job.payload || {};

  await supabase
    .from("reading_jobs")
    .update({ status: "processing", started_at: new Date().toISOString() })
    .eq("id", job.id);

  const readingId = payload.reading_id;
  let existingReadingData = {};
  if (readingId) {
    const { data: row } = await supabasePublic.from("readings").select("reading_data").eq("id", readingId).maybeSingle();
    if (row?.reading_data) existingReadingData = row.reading_data;
  }

  const nameA = payload.name || 'Person A';
  const nameB = payload.name2 || 'Person B';

  const chartA = await fetchChartData(payload.birthdate, payload.birthtime, payload.birthplace)
    || existingReadingData.chart_data
    || { type: 'Unbekannt', gates: [], centers: {} };

  const chartB = await fetchChartData(payload.birthdate2, payload.birthtime2, payload.birthplace2)
    || existingReadingData.chart_data2
    || { type: 'Unbekannt', gates: [], centers: {} };

  const dynamics = analyzeConnectionDynamics(chartA, chartB, nameA, nameB);

  const systemPrompt = `Du bist ein erfahrener Human Design Coach mit Expertise in Beziehungs- und Intimität-Readings.

${templates['sexuality'] || 'Erstelle ein Intimität & Sexualität Reading für zwei Personen.'}

Verwende folgendes Wissen:
${buildReadingKnowledge('sexuality')}`;

  // Baustein 4: deutsche Fakten-Blöcke pro Person + Composite-Block
  const factsA = `=== ${nameA} ===\n${buildChartInfo(chartA)}`;
  const factsB = `=== ${nameB} ===\n${buildChartInfo(chartB)}`;
  const compositeBlock = buildTwoPersonCompositeBlock(chartA, chartB, nameA, nameB);

  const userMessage = `Erstelle ein Intimität & Sexualität Resonanz-Reading für ${nameA} & ${nameB}.

${factsA}

${factsB}
${compositeBlock}

WICHTIG: Nenne beide Personen (${nameA} UND ${nameB}) in jeder Sektion bei ihren Namen!`;

  const aiModel = payload.ai_model || DEFAULT_MODEL;
  const modelConfig = MODEL_CONFIG[aiModel] || MODEL_CONFIG[DEFAULT_MODEL];
  const modelsToTry = modelConfig.models || [aiModel];

  let content = null;
  for (const modelId of modelsToTry) {
    try {
      content = await generateWithClaude(systemPrompt + '\n\n' + userMessage, {
        model: modelId,
        maxTokens: 8000,
        temperature: 0.7,
      });
      if (content) break;
    } catch (err) {
      console.warn(`   [Sexuality] Modell ${modelId} fehlgeschlagen:`, err.message);
    }
  }

  if (!content) throw new Error('Sexuality reading generation fehlgeschlagen – kein Modell verfügbar');

  // ── Pipeline: Validierung & Korrektur ─────────────────────────────────
  let pipelineInfoSex = { validated: false, corrected: false, errorCount: 0 };
  try {
    const pipeline = await runReadingPipeline(content, chartA);
    content = pipeline.text;
    pipelineInfoSex = { validated: pipeline.validated, corrected: pipeline.corrected, errorCount: pipeline.errorCount };
  } catch (pErr) { console.warn('[Pipeline] [Sexuality] Fehler:', pErr.message); }

  const reflexionsfragen = await generateConnectionReflexionsfragen(chartA, chartB, nameA, nameB);

  const newReadingData = {
    ...existingReadingData,
    text: content,
    chart_data: chartA,
    chart_data2: chartB,
    personA: { name: nameA },
    personB: { name: nameB },
    ...(reflexionsfragen ? { reflexionsfragen } : {}),
    _pipeline: pipelineInfoSex,
  };

  if (readingId) {
    await supabasePublic
      .from("readings")
      .update({ status: "completed", progress: 100, reading_data: newReadingData, updated_at: new Date().toISOString() })
      .eq("id", readingId);
  }

  await supabase
    .from("reading_jobs")
    .update({ status: "completed", finished_at: new Date().toISOString() })
    .eq("id", job.id);

  console.log(`✅ [Sexuality] Job ${job.id} abgeschlossen (${content.length} Zeichen)`);
}

// ======================================================
// processPentaJob – FIX: Echte Charts
// ======================================================
async function processPentaJob(job, reading) {
  console.log(`🔄 [Penta] Verarbeite Job ${job.id}`);
  const payload = reading.client_data || job.payload || {};
  const readingId = payload.reading_id;
  const groupName = payload.groupName || payload.group_name || payload.name || 'Gruppe';
  const groupContext = payload.groupContext || payload.group_context || '';

  await supabase
    .from("reading_jobs")
    .update({ status: "processing", started_at: new Date().toISOString() })
    .eq("id", job.id);

  // Lade readings-Zeile für penta_persons + bestehende reading_data
  let existingReadingData = {};
  let rawMembers = payload.members || payload.persons || [];
  if (readingId) {
    const { data: row } = await supabasePublic
      .from("readings")
      .select("reading_data, penta_persons, client_name")
      .eq("id", readingId)
      .maybeSingle();
    if (row?.reading_data) existingReadingData = row.reading_data;
    // penta_persons aus der DB hat Vorrang vor payload.members
    if (row?.penta_persons?.length) rawMembers = row.penta_persons;
  }

  // Normalisiere Member-Felder: penta_persons nutzt date/time/location/coords,
  // der restliche Code erwartet birthDate/birthTime/birthPlace
  const members = rawMembers.map(m => ({
    name:       m.name,
    birthDate:  m.birthDate  || m.birth_date  || m.date     || null,
    birthTime:  m.birthTime  || m.birth_time  || m.time     || '12:00',
    birthPlace: m.birthPlace || m.birth_place || m.location || null,
    coords:     m.coords     || null,
    reading_id: m.reading_id || null,
  }));

  if (!members.length) {
    throw new Error(`[Penta] Keine Mitglieder für Job ${job.id} (payload.members/persons/penta_persons alle leer)`);
  }

  console.log(`   [Penta] ${members.length} Mitglieder: ${members.map(m => m.name).join(', ')}`);

  // Charts für alle Mitglieder berechnen
  const memberCharts = [];
  for (const member of members) {
    let chart = null;
    if (member.reading_id) {
      const result = await fetchChartFromReading(member.reading_id);
      chart = result?.chart || null;
      console.log(`   [Penta] ${member.name}: Chart aus Supabase (reading_id=${member.reading_id})`);
    }
    if (!chart) {
      // coords bevorzugt für maximale Präzision
      const birthPlace = member.coords
        ? { lat: member.coords.lat, lon: member.coords.lon }
        : member.birthPlace;
      chart = await fetchChartData(member.birthDate, member.birthTime, birthPlace)
        || { type: "Unbekannt", gates: [], centers: {} };
    }
    memberCharts.push({ name: member.name, chart });
    console.log(`   [Penta] Chart für ${member.name}: ${chart.type}`);
  }

  const groupDynamics = analyzePentaDynamics(memberCharts);
  const pentaChart = calculatePentaChart(memberCharts);

  const pentaReadingType = reading.reading_type || 'penta';
  const rawPentaContent = await generateReading({
    agentId: 'penta',
    template: pentaReadingType,
    userData: { groupName, groupContext, members, memberCharts, groupDynamics, pentaChart }
  });

  // ── Pipeline: Validierung & Korrektur ─────────────────────────────────
  let pipelineInfoPenta = { validated: false, corrected: false, errorCount: 0 };
  let content = rawPentaContent;
  try {
    const pipeline = await runReadingPipeline(rawPentaContent, memberCharts[0]?.chart);
    content = pipeline.text;
    pipelineInfoPenta = { validated: pipeline.validated, corrected: pipeline.corrected, errorCount: pipeline.errorCount };
  } catch (pErr) { console.warn('[Pipeline] [Penta] Fehler:', pErr.message); }

  const newReadingData = {
    ...existingReadingData,
    text: content,
    members: memberCharts.map(m => ({ name: m.name, chart: m.chart })),
    group_dynamics: groupDynamics,
    penta_chart: pentaChart,
    _pipeline: pipelineInfoPenta,
  };

  if (readingId) {
    await supabasePublic
      .from("readings")
      .update({ status: "completed", progress: 100, reading_data: newReadingData, updated_at: new Date().toISOString() })
      .eq("id", readingId);
  }

  await supabase
    .from("reading_jobs")
    .update({ status: "completed", finished_at: new Date().toISOString() })
    .eq("id", job.id);

  console.log(`✅ [Penta] Job ${job.id} abgeschlossen (${memberCharts.length} Personen, ${content?.length} Zeichen)`);
}

// ======================================================
// processMultiAgentJob
// ======================================================
async function processMultiAgentJob(job, reading) {
  console.log(`🔄 [Multi-Agent] Verarbeite Job ${job.id}`);
  const { agents, synthesis, birthData, focus } = reading.client_data || {};
  const readingId = job.payload?.reading_id;

  const markFailed = async (err) => {
    console.error(`❌ [Multi-Agent] Job ${job.id} fehlgeschlagen:`, err?.message || err);
    await supabase.from("reading_jobs")
      .update({ status: "failed", error: err?.message || String(err), finished_at: new Date().toISOString() })
      .eq("id", job.id);
    if (readingId) {
      await supabasePublic.from("readings")
        .update({ status: "error", error: err?.message || String(err), completed_at: new Date().toISOString() })
        .eq("id", readingId);
    }
  };

  try {
    await supabase
      .from("reading_jobs")
      .update({ status: "processing", started_at: new Date().toISOString() })
      .eq("id", job.id);

    if (!agents?.length) throw new Error("Keine Agents angegeben");
    if (!birthData?.birthDate) throw new Error("Geburtsdatum fehlt");

    // Chart berechnen
    const chartData = await fetchChartData(
      birthData?.birthDate, birthData?.birthTime, birthData?.birthLocation
    );

    console.log(`🔄 [Multi-Agent] Starte ${agents.length} Agents parallel...`);

    const runAgent = async (agentId) => {
      try {
        const agentReading = await generateReading({
          agentId,
          template: agentId,
          userData: {
            client_name: birthData?.name,
            birth_date: birthData?.birthDate,
            birth_time: birthData?.birthTime,
            birth_location: birthData?.birthLocation,
            focus: focus || `${agentId} Reading`,
            ai_config: { max_tokens: 5000 }
          },
          chartData
        });
        console.log(`   ✅ Agent ${agentId} fertig (${agentReading.length} Zeichen)`);
        return { agentId, reading: agentReading, insights: extractInsights(agentReading, agentId) };
      } catch (agentErr) {
        console.error(`   ❌ Agent ${agentId} fehlgeschlagen:`, agentErr?.message);
        return { agentId, reading: `[Agent ${agentId} konnte kein Reading erstellen: ${agentErr?.message}]`, insights: [] };
      }
    };

    // Agents in Batches à 3 ausführen um Claude-API-Overload zu vermeiden
    const BATCH_SIZE = 3;
    const agentResults = [];
    for (let i = 0; i < agents.length; i += BATCH_SIZE) {
      const batch = agents.slice(i, i + BATCH_SIZE);
      console.log(`   🔄 Batch ${Math.floor(i/BATCH_SIZE)+1}/${Math.ceil(agents.length/BATCH_SIZE)}: ${batch.join(', ')}`);
      const batchResults = await Promise.all(batch.map(runAgent));
      agentResults.push(...batchResults);
    }

  let synthesisResult = null;
  let combinedInsights = [];
  let crossReferences = [];

  if (synthesis) {
    console.log("🔄 [Multi-Agent] Erstelle Synthesis...");
    synthesisResult = await generateMultiAgentSynthesis(agentResults, birthData, knowledge);
    combinedInsights = agentResults.flatMap(r => r.insights);
    crossReferences = findCrossReferences(agentResults);
    console.log("✅ [Multi-Agent] Synthesis fertig");
  }

  let content = `# Multi-Agent Reading für ${birthData?.name || 'Klient'}\n\n`;
  content += `Dieses Reading wurde von ${agents.length} spezialisierten Agents erstellt.\n\n`;
  content += `## Perspektiven der Agents\n\n`;
  agentResults.forEach(r => {
    content += `### ${r.agentId.toUpperCase()} Agent\n\n${r.reading}\n\n`;
  });
  if (synthesisResult) {
    content += `## Synthesis\n\n${synthesisResult}\n\n`;
    if (crossReferences.length > 0) {
      content += `### Gemeinsame Themen\n\n`;
      crossReferences.forEach(ref => {
        content += `- **${ref.theme}**: ${ref.agents.join(', ')}\n`;
      });
      content += "\n";
    }
  }

  // multi_agent_readings + readings aktualisieren (falls readingId vorhanden)
  if (readingId) {
    const agentResultsObj = {};
    agentResults.forEach(r => {
      agentResultsObj[r.agentId] = { reading: r.reading, insights: r.insights };
    });

    try {
      await supabase
        .schema("public")
        .from("multi_agent_readings")
        .update({
          agent_results: agentResultsObj,
          synthesis: synthesisResult,
          combined_insights: combinedInsights,
          cross_references: crossReferences
        })
        .eq("reading_id", readingId);
    } catch (e) { console.warn("⚠️ multi_agent_readings update fehlgeschlagen:", e.message); }

    try {
      await supabasePublic
        .from("readings")
        .update({
          status: "completed",
          reading_data: { text: content, chart_data: chartData },
          completed_at: new Date().toISOString()
        })
        .eq("id", readingId);
    } catch (e) { console.warn("⚠️ readings update fehlgeschlagen:", e.message); }
  }

    await supabase
      .from("reading_jobs")
      .update({ status: "completed", finished_at: new Date().toISOString(), progress: 100 })
      .eq("id", job.id);

    console.log(`✅ [Multi-Agent] Job ${job.id} abgeschlossen`);
  } catch (err) {
    await markFailed(err);
  }
}

// ======================================================
// Polling starten
// ======================================================
setInterval(pollForJobs, 10000);
console.log("🔄 Job Polling System aktiv (prüft alle 10 Sekunden)");
pollForJobs();

// ── Stale-Job-Recovery ────────────────────────────────────────────────────
// Jobs die länger als 20 Minuten auf "processing" hängen (z.B. nach Worker-Neustart)
// werden zurück auf "pending" gesetzt damit der Poller sie erneut verarbeitet.
async function recoverStaleJobs() {
  try {
    const { data, error } = await supabase
      .from("reading_jobs")
      .update({ status: "pending" })
      .eq("status", "processing")
      .lt("started_at", new Date(Date.now() - 20 * 60 * 1000).toISOString())
      .select("id, payload");
    if (error) { console.warn("⚠️ [Recovery] Fehler:", error.message); return; }
    if (data && data.length > 0) {
      console.log(`🔄 [Recovery] ${data.length} stale Job(s) zurück auf pending: ${data.map(j => j.id).join(', ')}`);
      // public.readings ebenfalls zurücksetzen
      for (const job of data) {
        const readingId = job.payload?.reading_id;
        if (readingId) {
          await supabasePublic.schema("public").from("readings")
            .update({ status: "pending" })
            .eq("id", readingId)
            .eq("status", "processing");
        }
      }
    }
  } catch (e) {
    console.warn("⚠️ [Recovery] Exception:", e.message);
  }
}
setInterval(recoverStaleJobs, 5 * 60 * 1000); // alle 5 Minuten
recoverStaleJobs(); // direkt beim Start (nach Worker-Neustart sofort recovern)

// ======================================================
// Error Monitoring — zusätzliche Failed-Handler (additiv)
// ======================================================
[
  { worker: workerV3, name: "V3" },
  { worker: workerV4, name: "V4" },
  { worker: connectionWorker, name: "Connection" },
  { worker: pentaWorker, name: "Penta" },
  { worker: multiAgentWorker, name: "Multi-Agent" },
].forEach(({ worker, name }) => {
  worker.on("failed", (job, err) => {
    notifyError(`Worker [${name}] Job ${job?.id}`, err);
  });
});
console.log("🔔 Error Monitoring aktiv (Webhook:", ERROR_WEBHOOK_URL ? "konfiguriert ✅" : "nicht gesetzt ⚠️", ")");

// ======================================================
// Hilfsfunktionen
// ======================================================
async function generateMultiAgentSynthesis(agentResults, birthData, knowledge) {
  const agentSummaries = agentResults.map(r =>
    `${r.agentId}: ${r.insights.slice(0, 3).join(', ')}`
  ).join('\n');
  const synthesisPrompt = `Du bist ein Meta-Analyst, der die Perspektiven mehrerer Human Design Agents integriert.

Du hast ${agentResults.length} verschiedene Readings für ${birthData.name || 'die Person'} erhalten:

${agentSummaries}

Erstelle eine Synthesis, die:
1. Die gemeinsamen Themen über alle Perspektiven hinweg hervorhebt
2. Widersprüche oder Spannungen zwischen den Perspektiven aufzeigt
3. Eine ganzheitliche Perspektive bietet
4. Praktische Empfehlungen gibt, die alle Aspekte berücksichtigen

Struktur:
- Gemeinsame Themen
- Spannungen & Balance
- Ganzheitliche Perspektive
- Integration in den Alltag

Stil: Klar, präzise, nicht esoterisch.`;

  const synthResult = await generateWithClaude(synthesisPrompt, {
    model: "claude-sonnet-4-6",
    maxTokens: 2000,
    temperature: 0.7,
  });
  return synthResult.trim();
}

function extractInsights(readingText, agentId) {
  const sentences = readingText.split(/[.!?]+/).filter(s => s.trim().length > 20);
  return sentences.slice(0, 5).map(s => s.trim());
}

function findCrossReferences(agentResults) {
  const references = [];
  const commonThemes = [
    { keywords: ['energie', 'power', 'kraft'], theme: 'Energie & Kraft' },
    { keywords: ['kommunikation', 'ausdruck', 'sprechen'], theme: 'Kommunikation' },
    { keywords: ['entscheidung', 'autorität', 'klarheit'], theme: 'Entscheidungen' },
    { keywords: ['beziehung', 'verbindung', 'interaktion'], theme: 'Beziehungen' },
    { keywords: ['kreativität', 'schöpfung', 'ausdruck'], theme: 'Kreativität' }
  ];
  commonThemes.forEach(({ keywords, theme }) => {
    const agentsWithTheme = agentResults.filter(r =>
      keywords.some(kw => r.reading.toLowerCase().includes(kw))
    );
    if (agentsWithTheme.length >= 2) {
      references.push({
        theme,
        agents: agentsWithTheme.map(r => r.agentId),
        count: agentsWithTheme.length
      });
    }
  });
  return references.sort((a, b) => b.count - a.count);
}

function analyzePentaDynamics(memberCharts) {
  const dynamics = {
    roles: [],
    energy_flow: {},
    communication_patterns: {},
    collective_strengths: [],
    team_challenges: []
  };
  if (!memberCharts || memberCharts.length < 3) {
    return dynamics;
  }
  const typeCounts = {};
  memberCharts.forEach((member) => {
    const type = member.chart.type;
    typeCounts[type] = (typeCounts[type] || 0) + 1;
    if (type === 'Manifestor') {
      dynamics.roles.push({ member: member.name, role: 'Initiator', description: 'Startet Prozesse' });
    } else if (type === 'Generator' || type === 'Manifesting Generator') {
      dynamics.roles.push({ member: member.name, role: 'Umsetzer', description: 'Liefert Energie' });
    } else if (type === 'Projector') {
      dynamics.roles.push({ member: member.name, role: 'Guide', description: 'Erkennt Potenziale' });
    } else if (type === 'Reflector') {
      dynamics.roles.push({ member: member.name, role: 'Spiegel', description: 'Reflektiert Gruppendynamik' });
    }
  });
  dynamics.energy_flow = {
    dominant_types: Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([type, count]) => ({ type, count })),
    balance: calculateTypeBalance(typeCounts)
  };
  const hasManifestor = typeCounts['Manifestor'] > 0;
  const hasProjector = typeCounts['Projector'] > 0;
  dynamics.communication_patterns = {
    style: hasManifestor ? 'Direkt und initierend' : hasProjector ? 'Beratend und erkennend' : 'Responsiv',
    recommendation: hasManifestor && hasProjector ?
      'Manifestors initiieren, Projectors führen aus' :
      'Gemeinsame Response nutzen'
  };
  const allGates = new Set();
  memberCharts.forEach(member => {
    const gates = member.chart.gates || [];
    gates.forEach(gate => {
      const gateNum = typeof gate === 'object' ? gate.number : gate;
      if (gateNum) allGates.add(gateNum);
    });
  });
  dynamics.collective_strengths = Array.from(allGates);
  if (!hasManifestor && !hasProjector) {
    dynamics.team_challenges.push('Keine Initiatoren - Team braucht externe Impulse');
  }
  if (typeCounts['Generator'] === memberCharts.length) {
    dynamics.team_challenges.push('Nur Generatoren - Warten auf externe Initiation');
  }
  return dynamics;
}

function calculateTypeBalance(typeCounts) {
  const total = Object.values(typeCounts).reduce((a, b) => a + b, 0);
  const balance = {};
  for (const [type, count] of Object.entries(typeCounts)) {
    balance[type] = Math.round((count / total) * 100) + '%';
  }
  return balance;
}

function calculatePentaChart(memberCharts) {
  const allGates = new Set();
  const allCenters = new Set();
  memberCharts.forEach(member => {
    const gates = member.chart.gates || [];
    gates.forEach(gate => {
      const gateNum = typeof gate === 'object' ? gate.number : gate;
      if (gateNum) allGates.add(gateNum);
    });
    const centers = member.chart.centers || {};
    if (typeof centers === 'object' && !Array.isArray(centers)) {
      Object.entries(centers).forEach(([center, defined]) => {
        if (defined) allCenters.add(center);
      });
    } else if (Array.isArray(centers)) {
      centers.forEach(center => allCenters.add(center));
    }
  });
  return {
    composite_gates: Array.from(allGates).sort((a, b) => a - b),
    composite_centers: Array.from(allCenters),
    member_count: memberCharts.length,
    note: 'Composite Chart aller Gruppenmitglieder'
  };
}

// Vollständige Gate→Zentrum Zuordnung (alle 64 Tore)
const GATE_TO_CENTER = {
  64:'head', 61:'head', 63:'head',
  47:'ajna', 24:'ajna', 4:'ajna', 17:'ajna', 43:'ajna', 11:'ajna',
  62:'throat', 23:'throat', 56:'throat', 35:'throat', 12:'throat',
  45:'throat', 33:'throat', 8:'throat', 20:'throat', 31:'throat', 16:'throat',
  1:'g', 13:'g', 25:'g', 46:'g', 2:'g', 15:'g', 10:'g', 7:'g',
  26:'heart', 51:'heart', 21:'heart', 40:'heart',
  5:'sacral', 14:'sacral', 29:'sacral', 59:'sacral', 9:'sacral',
  3:'sacral', 42:'sacral', 27:'sacral', 34:'sacral',
  53:'root', 60:'root', 52:'root', 19:'root', 39:'root',
  41:'root', 58:'root', 38:'root', 54:'root',
  48:'spleen', 57:'spleen', 44:'spleen', 50:'spleen', 32:'spleen', 28:'spleen', 18:'spleen',
  36:'solar-plexus', 22:'solar-plexus', 37:'solar-plexus', 6:'solar-plexus',
  49:'solar-plexus', 55:'solar-plexus', 30:'solar-plexus'
};
const CENTER_NAMES_DE = {
  head: 'Krone', ajna: 'Ajna', throat: 'Kehle', g: 'Selbst',
  heart: 'Herz', sacral: 'Sakral', root: 'Wurzel',
  spleen: 'Milz', 'solar-plexus': 'Solarplexus'
};

// analyzeConnectionDynamics: klassifiziert Kanäle zwischen zwei Personen
// nach Block-2-Doktrin (electromagnetic / compromise / companionship / parallel).
//
// Historie: Diese Funktion nutzte bis 2026-04-22 eine eigene Duplikat-Logik
// (classifyChannel) mit den alten Labels EM / Goldader / Stabile Parallelenergie.
// Das war ein Block-2-Follow-up, den Block 2 im connection-key nicht mit erfasst
// hat — reading-worker hat parallel eine falsche Klassifikation produziert.
// Jetzt nutzen beide Container dieselbe Logik (classifyCompositeConnections).
function analyzeConnectionDynamics(chartA, chartB, nameA, nameB) {
  const labelA = nameA || 'Person A';
  const labelB = nameB || 'Person B';
  const dynamics = {
    activatedChannels: [],
    // Neue (Block-2-konforme) Kategorien
    electromagnetic_channels: [],
    compromise_channels: [],
    companionship_channels: [],
    parallel_channels: [],
    // Legacy-Felder (DEPRECATED, bleiben aus Rückwärtskompatibilität befüllt)
    dominanz_channels: [],      // alt: Goldader = companionship + compromise
    kompromiss_channels: [],    // alt: Parallelenergie — irreführender Name, bleibt = parallel
    complementary_gates: [],
    similarities: [],
    differences: [],
    challenges: [],
    growth_opportunities: []
  };
  if (!chartA || !chartB) {
    return dynamics;
  }

  // Gates normalisieren (können Objekte oder Zahlen sein)
  const normalizeGates = (gates) => (gates || []).map(g => typeof g === 'object' ? g.number : g).filter(Boolean);
  const gatesA = normalizeGates(chartA.gates);
  const gatesB = normalizeGates(chartB.gates);
  const centersA = chartA.centers || {};
  const centersB = chartB.centers || {};

  const gateInfo = (gate, centers) => {
    const centerKey = GATE_TO_CENTER[gate];
    return {
      gate,
      center: CENTER_NAMES_DE[centerKey] || centerKey || 'Unbekannt',
      defined: centerKey ? (centers[centerKey] === true) : false
    };
  };

  // Typ-Label auf Deutsch für Prompt-Text
  const TYPE_LABEL_DE = {
    electromagnetic: 'elektromagnetisch',
    compromise:      'Kompromiss',
    companionship:   'Companionship',
    parallel:        'parallel',
  };

  // Einheitliche Klassifikation via lib/composite-classification.js
  const classified = classifyTwoPersonChannels(gatesA, gatesB);

  // Pro Kategorie entry im activatedChannels + legacy-Mapping
  const addActivated = (key, gates, type, carriedBy) => {
    const [g1, g2] = gates;
    dynamics.activatedChannels.push({
      channelId:   key,
      type,                            // 'electromagnetic' | 'compromise' | 'companionship' | 'parallel'
      typeLabelDe: TYPE_LABEL_DE[type] || type,
      carriedBy,
      personAGate: gateInfo(g1, centersA),
      personBGate: gateInfo(g2, centersB),
    });
  };

  for (const e of classified.electromagnetic) {
    addActivated(e.channel, e.gates, 'electromagnetic', 'niemand allein');
    dynamics.electromagnetic_channels.push({ gate1: e.gates[0], gate2: e.gates[1], channel: e.channel, type: 'electromagnetic' });
  }
  for (const c of classified.compromise) {
    const dominant = c.dominantSide === 'A' ? labelA : labelB;
    addActivated(c.channel, c.gates, 'compromise', dominant);
    const legacy = { gate1: c.gates[0], gate2: c.gates[1], channel: c.channel, type: 'compromise' };
    dynamics.compromise_channels.push(legacy);
    dynamics.dominanz_channels.push(legacy); // legacy: alt-Goldader == kompletter Kanal bei einer Person
  }
  for (const cs of classified.companionship) {
    const carrier = cs.side === 'A' ? labelA : labelB;
    addActivated(cs.channel, cs.gates, 'companionship', carrier);
    const legacy = { gate1: cs.gates[0], gate2: cs.gates[1], channel: cs.channel, type: 'companionship' };
    dynamics.companionship_channels.push(legacy);
    dynamics.dominanz_channels.push(legacy); // legacy: alt-Goldader == kompletter Kanal bei einer Person
  }
  for (const p of classified.parallel) {
    addActivated(p.channel, p.gates, 'parallel', 'beide');
    const legacy = { gate1: p.gates[0], gate2: p.gates[1], channel: p.channel, type: 'parallel' };
    dynamics.parallel_channels.push(legacy);
    dynamics.kompromiss_channels.push(legacy); // legacy: alt-Parallelenergie (!Name ist historisch falsch)
  }

  dynamics.similarities = gatesA.filter(g => gatesB.includes(g));
  dynamics.differences = {
    personA_unique: gatesA.filter(g => !gatesB.includes(g)),
    personB_unique: gatesB.filter(g => !gatesA.includes(g))
  };
  if (chartA.type && chartB.type) {
    dynamics.type_interaction = {
      typeA: chartA.type,
      typeB: chartB.type,
      note: getTypeInteractionNote(chartA.type, chartB.type)
    };
  }
  return dynamics;
}

function areConnectedGates(gate1, gate2) {
  const channels = {
    1: [8], 2: [14], 3: [60], 4: [63], 5: [15],
    6: [59], 7: [31], 9: [52], 10: [20, 34, 57],
    11: [56], 12: [22], 13: [33], 16: [48], 17: [62],
    18: [58], 19: [49], 20: [34, 57], 21: [45], 23: [43],
    24: [61], 25: [51], 26: [44], 27: [50], 28: [38],
    29: [46], 30: [41], 32: [54], 35: [36], 37: [40],
    39: [55], 42: [53], 47: [64]
  };
  return channels[gate1]?.includes(gate2) || channels[gate2]?.includes(gate1);
}

function getTypeInteractionNote(typeA, typeB) {
  const interactions = {
    'Generator-Manifestor': 'Generator liefert Energie, Manifestor initiiert',
    'Generator-Generator': 'Hohe Energie, gemeinsame Response',
    'Manifesting Generator-Generator': 'Hohe Energie, gemeinsame Response',
    'Manifestor-Projector': 'Manifestor initiiert, Projector guided',
    'Projector-Generator': 'Projector erkennt, Generator reagiert',
    'Reflector-Generator': 'Reflector spiegelt Generator-Energie'
  };
  const key = `${typeA}-${typeB}`;
  return interactions[key] || interactions[`${typeB}-${typeA}`] || 'Einzigartige Dynamik';
}

// ======================================================
// Live Reading Agent
// ======================================================
app.use("/api/live-reading", createLiveReadingRouter(supabase));

// ======================================================
// W6 — Psychology Endpoints
// ======================================================
app.post("/api/readings/psychology/start", async (req, res) => {
  try {
    const { mode, reading_id, connection_reading_id, person_a_id, person_b_id } = req.body || {};
    if (!mode || !["single", "connection"].includes(mode)) {
      return res.status(400).json({ success: false, error: 'mode muss "single" oder "connection" sein' });
    }
    if (!person_a_id) {
      return res.status(400).json({ success: false, error: "person_a_id ist erforderlich" });
    }

    const { data, error } = await supabase
      .schema("public")
      .from("psychology_readings")
      .insert({ mode, reading_id, connection_reading_id, person_a_id, person_b_id, status: "pending" })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    const queue = getPsychologyQueue();
    await queue.add("psychology", { mode, reading_id, connection_reading_id, person_a_id, person_b_id });

    return res.status(202).json({ success: true, psychology_reading_id: data.id });
  } catch (err) {
    console.error("[Psychology] Start fehlgeschlagen:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/readings/psychology/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .schema("public")
      .from("psychology_readings")
      .select("id, status, polyvagal, attachment, jungian, bigfive, synthesis, error_message, created_at")
      .eq("id", req.params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return res.status(404).json({ success: false, error: "Nicht gefunden" });
      throw new Error(error.message);
    }
    return res.json(data);
  } catch (err) {
    console.error("[Psychology] GET fehlgeschlagen:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ======================================================
// Shadow Work Endpoints
// ======================================================
app.post("/api/readings/shadow-work/start", async (req, res) => {
  try {
    const { reading_id, name, birthdate, birthtime, birthplace } = req.body || {};
    if (!reading_id) {
      return res.status(400).json({ success: false, error: "reading_id ist erforderlich" });
    }

    let payload = { reading_id, reading_type: "shadow-work" };

    if (name || birthdate) {
      payload = { ...payload, name, birthdate, birthtime, birthplace };
    } else {
      const { data: reading } = await supabasePublic
        .from("readings")
        .select("client_name, birth_data, reading_data")
        .eq("id", reading_id)
        .maybeSingle();
      if (reading) {
        payload = {
          ...payload,
          name: reading.client_name,
          birthdate: reading.birth_data?.date || reading.reading_data?.birth_date,
          birthtime: reading.birth_data?.time || reading.reading_data?.birth_time,
          birthplace: reading.birth_data?.location || reading.reading_data?.birth_location,
        };
      }
    }

    const { data, error } = await supabase
      .from("reading_jobs")
      .insert({ reading_type: "shadow-work", payload, status: "pending" })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    console.log(`✅ [Shadow Work] Job erstellt: ${data.id}`);
    return res.status(202).json({
      success: true,
      job_id: data.id,
      status: "pending",
      poll_url: `/api/readings/shadow-work/status/${data.id}`
    });
  } catch (err) {
    console.error("[Shadow Work] Start fehlgeschlagen:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/readings/shadow-work/status/:job_id", async (req, res) => {
  try {
    const { job_id } = req.params;
    const { data, error } = await supabase
      .from("reading_jobs")
      .select("id, status, payload, error, created_at, started_at, finished_at")
      .eq("id", job_id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return res.status(404).json({ success: false, error: "Job nicht gefunden" });
      throw new Error(error.message);
    }

    let result = null;
    if (data.status === "completed" && data.payload?.reading_id) {
      const { data: reading } = await supabasePublic
        .from("readings")
        .select("reading_data")
        .eq("id", data.payload.reading_id)
        .maybeSingle();
      if (reading?.reading_data?.text) {
        result = { text: reading.reading_data.text };
      }
    }

    return res.json({
      success: true,
      job_id: data.id,
      status: data.status,
      error: data.error || null,
      created_at: data.created_at,
      started_at: data.started_at || null,
      finished_at: data.finished_at || null,
      ...(result ? { result } : {})
    });
  } catch (err) {
    console.error("[Shadow Work] Status fehlgeschlagen:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ======================================================
// Transit-Reading Endpoints
// ======================================================

async function startSpecialReading(readingType, { reading_id, transit_gates, year, year_transits, name, birthdate, birthtime, birthplace, ai_config: extraConfig, telegram_chat_id, user_id, auto_generated, tier }) {
  let payload = { reading_id, reading_type: readingType };

  if (name || birthdate) {
    payload = { ...payload, name, birthdate, birthtime, birthplace };
  } else if (reading_id) {
    const { data: reading } = await supabasePublic
      .from("readings")
      .select("client_name, birth_data, reading_data")
      .eq("id", reading_id)
      .maybeSingle();
    if (reading) {
      payload = {
        ...payload,
        name: reading.client_name,
        birthdate: reading.birth_data?.date || reading.reading_data?.birth_date,
        birthtime: reading.birth_data?.time || reading.reading_data?.birth_time,
        birthplace: reading.birth_data?.location || reading.reading_data?.birth_location,
      };
    }
  }

  if (transit_gates) payload.ai_config = { ...(payload.ai_config || {}), transit_gates };
  if (year) payload.ai_config = { ...(payload.ai_config || {}), year };
  if (year_transits) payload.ai_config = { ...(payload.ai_config || {}), year_transits };
  if (extraConfig) payload.ai_config = { ...(payload.ai_config || {}), ...extraConfig };
  if (telegram_chat_id) payload.telegram_chat_id = telegram_chat_id;
  if (user_id) payload.user_id = user_id;
  if (auto_generated) payload.auto_generated = auto_generated;
  if (tier) payload.tier = tier;

  const { data, error } = await supabase
    .from("reading_jobs")
    .insert({ reading_type: readingType, payload, status: "pending" })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

async function getJobStatus(job_id) {
  const { data, error } = await supabase
    .from("reading_jobs")
    .select("id, status, payload, result, error, created_at, started_at, finished_at")
    .eq("id", job_id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  let result = null;
  if (data.status === "completed") {
    // Direktes Ergebnis in reading_jobs (z.B. tagesimpuls ohne reading_id)
    if (data.result?.text || data.result?.reel || data.result?.format) {
      result = data.result;
    } else if (data.payload?.reading_id) {
      const { data: reading } = await supabasePublic
        .from("readings")
        .select("reading_data")
        .eq("id", data.payload.reading_id)
        .maybeSingle();
      if (reading?.reading_data?.text) result = { text: reading.reading_data.text };
    }
  }

  return {
    success: true,
    job_id: data.id,
    status: data.status,
    error: data.error || null,
    created_at: data.created_at,
    started_at: data.started_at || null,
    finished_at: data.finished_at || null,
    ...(result ? { result } : {})
  };
}

const CONNECTION_KEY_URL = process.env.CONNECTION_KEY_URL || "http://connection-key:3000";

app.post("/api/readings/transit/start", async (req, res) => {
  try {
    let { reading_id, transit_gates, name, birthdate, birthtime, birthplace } = req.body || {};
    if (!reading_id) return res.status(400).json({ success: false, error: "reading_id ist erforderlich" });

    // Auto-Berechnung aktueller Transits wenn transit_gates fehlt
    let auto_calculated = false;
    if (!transit_gates || (Array.isArray(transit_gates) && transit_gates.length === 0)) {
      try {
        const transitRes = await fetch(`${CONNECTION_KEY_URL}/api/transits/current`, {
          signal: AbortSignal.timeout(8000),
        });
        if (transitRes.ok) {
          const transitData = await transitRes.json();
          transit_gates = transitData.transits || [];
          auto_calculated = true;
          console.log(`   🌍 [Transit] Auto-Transits geladen: ${transit_gates.length} Planeten`);
        }
      } catch (fetchErr) {
        console.warn("[Transit] Auto-Transit-Berechnung fehlgeschlagen:", fetchErr.message);
      }
    }

    const job_id = await startSpecialReading("transit", {
      reading_id, transit_gates, name, birthdate, birthtime, birthplace,
    });
    console.log(`✅ [Transit] Job erstellt: ${job_id} (auto=${auto_calculated})`);
    return res.status(202).json({
      success: true,
      job_id,
      status: "pending",
      auto_calculated,
      transit_gates_count: transit_gates?.length || 0,
      poll_url: `/api/readings/transit/status/${job_id}`,
    });
  } catch (err) {
    console.error("[Transit] Start fehlgeschlagen:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/readings/transit/status/:job_id", async (req, res) => {
  try {
    const result = await getJobStatus(req.params.job_id);
    if (!result) return res.status(404).json({ success: false, error: "Job nicht gefunden" });
    return res.json(result);
  } catch (err) {
    console.error("[Transit] Status fehlgeschlagen:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ======================================================
// Jahres-Reading Endpoints
// ======================================================
app.post("/api/readings/jahres/start", async (req, res) => {
  try {
    const { reading_id, name, birthdate, birthtime, birthplace } = req.body || {};
    let { year, year_transits } = req.body || {};
    if (!reading_id) return res.status(400).json({ success: false, error: "reading_id ist erforderlich" });

    year = year || new Date().getFullYear();

    // Auto-Berechnung monatlicher Jahres-Transits wenn nicht mitgeliefert
    let auto_calculated = false;
    if (!year_transits || (Array.isArray(year_transits) && year_transits.length === 0)) {
      try {
        const yearRes = await fetch(`${CONNECTION_KEY_URL}/api/transits/year/${year}`, {
          signal: AbortSignal.timeout(8000),
        });
        if (yearRes.ok) {
          const yearData = await yearRes.json();
          year_transits = yearData.months || [];
          auto_calculated = true;
          console.log(`   📅 [Jahres] Auto-Transits geladen: ${year_transits.length} Monate für ${year}`);
        }
      } catch (fetchErr) {
        console.warn("[Jahres] Auto-Transit-Berechnung fehlgeschlagen:", fetchErr.message);
      }
    }

    const job_id = await startSpecialReading("jahres-reading", {
      reading_id, year, year_transits, name, birthdate, birthtime, birthplace,
    });
    console.log(`✅ [Jahres] Job erstellt: ${job_id} (auto=${auto_calculated})`);
    return res.status(202).json({
      success: true,
      job_id,
      status: "pending",
      year,
      auto_calculated,
      months_count: year_transits?.length || 0,
      poll_url: `/api/readings/jahres/status/${job_id}`,
    });
  } catch (err) {
    console.error("[Jahres] Start fehlgeschlagen:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/readings/jahres/status/:job_id", async (req, res) => {
  try {
    const result = await getJobStatus(req.params.job_id);
    if (!result) return res.status(404).json({ success: false, error: "Job nicht gefunden" });
    return res.json(result);
  } catch (err) {
    console.error("[Jahres] Status fehlgeschlagen:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ======================================================
// Tagesimpuls Endpoint
// ======================================================
app.post("/api/readings/tagesimpuls/start", async (req, res) => {
  try {
    const {
      reading_id, name, birthdate, birthtime, birthplace,
      format, focus_topic,
      tier, user_id, auto_generated, telegram_chat_id,
      transit, client_context,
    } = req.body || {};
    const job_id = await startSpecialReading("tagesimpuls", {
      reading_id, name, birthdate, birthtime, birthplace,
      tier: tier || 'free',
      user_id: user_id || null,
      auto_generated: !!auto_generated,
      telegram_chat_id: telegram_chat_id || null,
      client_context: client_context || null,
      ai_config: {
        format: format || 'standard',
        focus_topic: focus_topic || null,
        tier: tier || 'free',
        user_id: user_id || null,
        auto_generated: !!auto_generated,
        ...(transit ? { transit } : {}),
      },
    });
    console.log(`✅ [Tagesimpuls] Job erstellt: ${job_id} (tier=${tier || 'free'})`);
    return res.status(202).json({ success: true, job_id, status: "pending", reading_type: "tagesimpuls", poll_url: `/api/readings/tagesimpuls/status/${job_id}` });
  } catch (err) {
    console.error("[Tagesimpuls] Start fehlgeschlagen:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/readings/tagesimpuls/status/:job_id", async (req, res) => {
  try {
    const result = await getJobStatus(req.params.job_id);
    if (!result) return res.status(404).json({ success: false, error: "Job nicht gefunden" });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ======================================================
// Generische Reading-Endpunkte (alle nicht-spezialisierten Typen)
// ======================================================
const GENERIC_READING_TYPES = new Set([
  'basic', 'business', 'career', 'compatibility', 'relationship',
  'emotions', 'health', 'life-purpose', 'parenting',
  'reflection', 'reflection-profiles', 'spiritual',
  'detailed', 'depth-analysis', 'default', 'sexuality',
  'geld-ueberfluss', 'kinder', 'trauma', 'variable-phs',
]);

app.post("/api/readings/:type/start", async (req, res) => {
  const { type } = req.params;
  if (!GENERIC_READING_TYPES.has(type)) {
    return res.status(400).json({ success: false, error: `Unbekannter Reading-Typ: ${type}` });
  }
  try {
    const { reading_id, name, birthdate, birthtime, birthplace, ai_config } = req.body || {};
    if (!reading_id) return res.status(400).json({ success: false, error: "reading_id ist erforderlich" });

    const job_id = await startSpecialReading(type, {
      reading_id, name, birthdate, birthtime, birthplace, ai_config,
    });
    console.log(`✅ [${type}] Job erstellt: ${job_id}`);
    return res.status(202).json({
      success: true,
      job_id,
      status: "pending",
      reading_type: type,
      poll_url: `/api/readings/${type}/status/${job_id}`,
    });
  } catch (err) {
    console.error(`[${type}] Start fehlgeschlagen:`, err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/readings/:type/status/:job_id", async (req, res) => {
  const { type, job_id } = req.params;
  if (!GENERIC_READING_TYPES.has(type)) {
    return res.status(400).json({ success: false, error: `Unbekannter Reading-Typ: ${type}` });
  }
  try {
    const result = await getJobStatus(job_id);
    if (!result) return res.status(404).json({ success: false, error: "Job nicht gefunden" });
    return res.json(result);
  } catch (err) {
    console.error(`[${type}] Status fehlgeschlagen:`, err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ======================================================
// Reading-Chat Endpoint — Interaktive Vertiefung mit Reading-Kontext
// POST /api/readings/:readingId/chat
// Body: { message, userId? }
// Lädt das Reading + Chart und antwortet als HD-Coach mit vollem Kontext
// ======================================================
app.post('/api/readings/:readingId/chat', async (req, res) => {
  if (!isClaudeAvailable()) return res.status(503).json({ error: 'Claude nicht verfügbar' });

  const { readingId } = req.params;
  const { message, userId } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message erforderlich' });

  try {
    // Reading + Chart laden
    const { data: reading, error } = await supabasePublic
      .from('readings')
      .select('reading_data, chart_data, reading_type, client_name, birth_data')
      .eq('id', readingId)
      .maybeSingle();

    if (error || !reading) return res.status(404).json({ error: 'Reading nicht gefunden' });

    const readingText = reading.reading_data?.text || '';
    const chartData = reading.chart_data || reading.reading_data?.chart_data || {};
    const clientName = reading.client_name || 'Klient';
    const chartInfo = buildChartInfo(chartData);

    const systemPrompt = `Du bist ein erfahrener Human Design Coach. Der Klient heißt ${clientName}.

CHART-DATEN:
${chartInfo}

VORLIEGENDES READING (erstellt am ${new Date().toLocaleDateString('de-DE')}):
${readingText.substring(0, 6000)}

Antworte als Coach direkt auf Fragen und Vertiefungsanfragen zum Reading. Sei konkret, warm und auf diesen spezifischen Chart bezogen. Maximal 400 Wörter pro Antwort.`;

    // generateWithClaude hat kein systemPrompt-Param — System + User zusammenführen
    const fullPrompt = `${systemPrompt}\n\n---\n\nFrage des Klienten: ${message}`;
    const responseText = await generateWithClaude(
      fullPrompt,
      { model: 'claude-sonnet-4-6', maxTokens: 1500, temperature: 0.7 }
    );

    res.json({ success: true, response: responseText, readingId, clientName });
  } catch (err) {
    console.error('[Reading-Chat] Fehler:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ======================================================
// Streaming SSE Endpoint — direkte Generierung ohne Queue
// POST /api/readings/stream
// Body: { reading_type, name, birth_date, birth_time, birth_location, chart_data?, reading_id? }
// Response: text/event-stream  →  data: {"type":"chunk","text":"..."}\n\n
//                                  data: {"type":"done","length":N}\n\n
// ======================================================
app.post('/api/readings/stream', async (req, res) => {
  if (!isClaudeAvailable()) {
    return res.status(503).json({ error: 'Claude nicht verfügbar' });
  }

  const { reading_type, name, birth_date, birth_time, birth_location, chart_data, reading_id, language, focus } = req.body || {};
  if (!reading_type) return res.status(400).json({ error: 'reading_type erforderlich' });

  // SSE-Header setzen
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  try {
    // Chart-Daten laden oder berechnen
    let chartData = chart_data;
    if (!chartData && birth_date) {
      send({ type: 'status', text: 'Chart wird berechnet…' });
      chartData = await fetchChartData(birth_date, birth_time, birth_location) || {};
    }

    // Transit + Delta parallel
    send({ type: 'status', text: 'Kontext wird aufgebaut…' });
    const [transitData, previousReadings] = await Promise.all([
      TRANSIT_SKIP_TYPES.has(reading_type) ? Promise.resolve(null) : fetchCurrentTransits(),
      reading_id ? fetchPreviousReadings(birth_date, name, reading_id, 2) : Promise.resolve([]),
    ]);

    const chartInfo = buildChartInfo(chartData);
    const knowledgeText = buildReadingKnowledge(reading_type);
    const transitOverlay = buildTransitOverlay(transitData, chartData);
    const deltaContext = buildDeltaContext(previousReadings);
    const templateContent = templates[reading_type] || templates['default'] || '';
    const langInstruction = language === 'en' ? '\n\nLANGUAGE: Write in English.' : '';

    const systemPrompt = `Du bist ein Reading-Agent für Human Design.\n\n${templateContent}\n\nVerwende folgendes Wissen:\n${knowledgeText}\n${langInstruction}\n${transitOverlay ? '\n' + transitOverlay : ''}${deltaContext ? '\n\n' + deltaContext : ''}\n\nANWEISUNG: Keine Disclaimer. Beginne direkt.`;

    const userMessage = `Erstelle ein ${reading_type} Reading für:
Name: ${name || 'Unbekannt'}
Geburtsdatum: ${birth_date || 'Unbekannt'}
Geburtszeit: ${birth_time || 'Unbekannt'}
Geburtsort: ${birth_location || 'Unbekannt'}
${chartInfo}${focus ? `\n\nBESONDERER FOKUS FÜR DIESES READING:\n${focus}` : ''}`;

    send({ type: 'status', text: 'Reading wird generiert…' });

    // Claude streaming
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey });

    let totalText = '';
    const MAX_TOKENS = 16000;
    const MAX_CONTINUATIONS = 3;
    const messages = [{ role: 'user', content: userMessage }];

    for (let attempt = 0; attempt <= MAX_CONTINUATIONS; attempt++) {
      const stream = await client.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
        system: systemPrompt,
        messages,
      });

      let chunkText = '';
      let stopReason = 'end_turn';

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
          const text = chunk.delta.text;
          chunkText += text;
          totalText += text;
          send({ type: 'chunk', text });
        }
        if (chunk.type === 'message_delta' && chunk.delta?.stop_reason) {
          stopReason = chunk.delta.stop_reason;
        }
      }

      // Wenn nicht wegen max_tokens gestoppt → fertig
      if (stopReason !== 'max_tokens' || attempt >= MAX_CONTINUATIONS) break;

      // Continuation: bisherigen Text als Assistant-Turn + Fortsetzen
      console.log(`   [SSE Stream] max_tokens erreicht — Fortsetzung ${attempt + 1}/${MAX_CONTINUATIONS}...`);
      send({ type: 'status', text: 'Fortsetzung wird generiert…' });
      messages.push({ role: 'assistant', content: chunkText });
      messages.push({ role: 'user', content: 'Bitte fahre direkt dort fort, wo du aufgehört hast. Kein Satz wie "Ich fahre fort" — einfach weiterschreiben.' });
    }

    send({ type: 'done', length: totalText.length });
  } catch (err) {
    console.error('[SSE Stream] Fehler:', err.message);
    send({ type: 'error', message: err.message });
  } finally {
    res.end();
  }
});

// ======================================================
// Health Endpoint
// ======================================================
// ======================================================
// Monitoring: Reading-Health Dashboard (Baustein 8)
// ======================================================
//
// Liefert aggregierte Statistiken fuer /admin/reading-health UI im
// Frontend-Coach. Query-Param `days` begrenzt das Zeitfenster (Default 7).
app.get("/admin/reading-health", async (req, res) => {
  try {
    const days = Math.max(1, Math.min(90, parseInt(req.query.days || "7", 10)));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Alle Logs im Zeitfenster (für In-Memory-Aggregation)
    const { data: logs, error } = await supabasePublic
      .from("reading_validation_log")
      .select("reading_type, error_count, errors, correction_applied, validated_at, sampled_for_review, reviewed_at")
      .gte("validated_at", since)
      .order("validated_at", { ascending: false });

    if (error) throw error;

    const total = logs.length;
    const withErrors = logs.filter(l => l.error_count > 0).length;
    const corrected = logs.filter(l => l.correction_applied).length;
    const errorRate = total > 0 ? +(withErrors / total * 100).toFixed(1) : 0;

    // Fehlerrate pro Reading-Typ
    const byType = {};
    for (const l of logs) {
      const t = l.reading_type || 'unbekannt';
      if (!byType[t]) byType[t] = { total: 0, withErrors: 0 };
      byType[t].total++;
      if (l.error_count > 0) byType[t].withErrors++;
    }
    const typeStats = Object.entries(byType).map(([type, s]) => ({
      type, total: s.total, withErrors: s.withErrors,
      errorRate: +(s.withErrors / s.total * 100).toFixed(1),
    })).sort((a, b) => b.errorRate - a.errorRate);

    // Fehlerrate pro CHECK-Nummer
    const byCheck = {};
    for (const l of logs) {
      for (const e of (l.errors || [])) {
        const c = e.check || 'UNKNOWN';
        byCheck[c] = (byCheck[c] || 0) + 1;
      }
    }
    const checkStats = Object.entries(byCheck)
      .map(([check, count]) => ({ check, count }))
      .sort((a, b) => b.count - a.count);

    // Offene Stichproben-Reviews
    const { count: pendingReviews } = await supabasePublic
      .from("reading_validation_log")
      .select("id", { count: "exact", head: true })
      .eq("sampled_for_review", true)
      .is("reviewed_at", null);

    res.json({
      window_days: days,
      total_runs: total,
      runs_with_errors: withErrors,
      corrections_applied: corrected,
      overall_error_rate_pct: errorRate,
      by_reading_type: typeStats,
      by_check: checkStats,
      pending_reviews: pendingReviews || 0,
    });
  } catch (err) {
    console.error("[reading-health] Fehler:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Letzte N Validator-Läufe (für Tabellen-Ansicht im Dashboard)
app.get("/admin/reading-health/recent", async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || "20", 10)));
    const onlyErrors = req.query.only_errors === 'true';

    let q = supabasePublic
      .from("reading_validation_log")
      .select("id, reading_id, reading_type, template, validated_at, error_count, errors, correction_applied, chart_fingerprint, sampled_for_review, reviewed_at, review_verdict")
      .order("validated_at", { ascending: false })
      .limit(limit);
    if (onlyErrors) q = q.gt("error_count", 0);

    const { data, error } = await q;
    if (error) throw error;
    res.json({ count: data.length, logs: data });
  } catch (err) {
    console.error("[reading-health/recent] Fehler:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/health", async (_, res) => {
  try {
    const { error: dbError } = await supabasePublic.from("readings").select("id").limit(1);
    // Blueprint: Sections der letzten 24h
    let sectionsLast24h = 0;
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabasePublic.from("reading_sections").select("id", { count: "exact", head: true }).gte("created_at", since);
      sectionsLast24h = count || 0;
    } catch {}
    res.json({
      status: "ok",
      version: "2.1.0-dynamic-blueprint",
      workers: {
        v3: workerV3.isRunning() ? "running" : "stopped",
        v4: workerV4.isRunning() ? "running" : "stopped",
        connection: connectionWorker.isRunning() ? "running" : "stopped",
        penta: pentaWorker.isRunning() ? "running" : "stopped",
        multiAgent: multiAgentWorker.isRunning() ? "running" : "stopped"
      },
      chartService: CHART_SERVICE_URL,
      supabase: dbError ? "error" : "ok",
      redis: redis.status,
      knowledge: Object.keys(knowledge).length,
      templates: Object.keys(templates).length,
      blueprint: { sections_last_24h: sectionsLast24h }
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// ======================================================
// Auto-Impuls Subscriber Dispatcher (täglich 05:02 UTC)
// Verarbeitet telegram_impulse_subscribers WHERE active=true
// ======================================================
async function dispatchSubscriberImpulses() {
  console.log('📬 [Subscriber] Starte Auto-Impuls Dispatch...');
  try {
    const { data: subscribers, error } = await supabasePublic
      .from('telegram_impulse_subscribers')
      .select('telegram_chat_id, client_name, birth_date, birth_time, birth_place, tier')
      .eq('active', true)
      .not('telegram_chat_id', 'is', null);

    if (error) { console.error('[Subscriber] Lade-Fehler:', error.message); return; }
    if (!subscribers?.length) { console.log('[Subscriber] Keine aktiven Subscriber'); return; }

    console.log(`📬 [Subscriber] ${subscribers.length} Subscriber gefunden`);

    for (const sub of subscribers) {
      try {
        await startSpecialReading('tagesimpuls', {
          name: sub.client_name,
          birthdate: sub.birth_date,
          birthtime: sub.birth_time,
          birthplace: sub.birth_place,
          tier: sub.tier || 'free',
          telegram_chat_id: sub.telegram_chat_id,
          auto_generated: true,
          ai_config: { tier: sub.tier || 'free', auto_generated: true },
        });
        console.log(`✅ [Subscriber] Job für ${sub.client_name} (${sub.telegram_chat_id}) erstellt`);
        await new Promise(r => setTimeout(r, 2000)); // 2s Pause zwischen Jobs
      } catch (e) {
        console.error(`[Subscriber] Fehler für ${sub.client_name}:`, e.message);
      }
    }
  } catch (e) {
    console.error('[Subscriber] dispatchSubscriberImpulses Fehler:', e.message);
  }
}

// Cron: täglich 05:02 UTC (2 Minuten nach dem Kanal-Post)
function scheduleDailyAt(hourUTC, minuteUTC, fn) {
  function msUntilNext() {
    const now = new Date();
    const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hourUTC, minuteUTC, 0, 0));
    if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
    return next - now;
  }
  function schedule() { setTimeout(() => { fn(); setTimeout(schedule, 1000); }, msUntilNext()); }
  schedule();
}
scheduleDailyAt(5, 2, dispatchSubscriberImpulses);

// POST /api/readings/tagesimpuls/dispatch-subscribers — manueller Trigger
app.post('/api/readings/tagesimpuls/dispatch-subscribers', async (req, res) => {
  res.json({ success: true, message: 'Dispatch gestartet' });
  dispatchSubscriberImpulses();
});

// ======================================================
// MARKETING AUTOMATION: Instagram-Captions aus Channel-Posts
// ======================================================

/**
 * Generiert eine Instagram-Caption aus einem Channel-Post-Text und speichert sie in Supabase.
 */
async function generateAndSaveInstagramCaption(text, type, topic = null, opts = {}) {
  const { dryRun = false } = opts || {};
  try {
    const prompt = `Du bist ein Social-Media-Experte für Human Design Coaches.

Erstelle eine Instagram-Caption basierend auf diesem Telegram-Post:

---
${text}
---

REGELN:
- Maximal 150 Wörter
- Hook in der ersten Zeile (kein Emoji am Anfang — nur Text)
- 1–2 Emojis sparsam eingesetzt
- Natürliche Sprache, kein Corporate-Speak
- Am Ende: 5–8 relevante Hashtags (Mix aus groß und nischig)
- Hashtags auf einer eigenen Zeile
- Kein "Link in Bio" oder Call-to-Action für Produkte
- Sprache: Deutsch

Antworte NUR mit der Caption, kein Kommentar davor/danach.`;

    const caption = await generateWithClaude(prompt, { maxTokens: 400, temperature: 0.85 });

    // In Supabase speichern
    let savedRow = null;
    if (supabasePublic) {
      const today = new Date().toISOString().split('T')[0];
      try {
        const row = {
          date: today,
          type,
          topic: topic || type,
          telegram_text: text,
          instagram_caption: caption.trim(),
          telegram_sent: !dryRun,
          ...(dryRun ? {} : { sent_at: new Date().toISOString() }),
          status: dryRun ? 'draft' : 'published',
          created_at: new Date().toISOString(),
        };
        const { data } = await supabasePublic
          .from('channel_posts')
          .upsert(row, { onConflict: 'date,type' })
          .select()
          .single();
        savedRow = data || null;
      } catch (dbErr) {
        console.warn('[Marketing] Supabase-Save Fehler:', dbErr.message);
      }
    }

    console.log(`📸 [Marketing] Instagram-Caption gespeichert (${type}, ${caption.length} Zeichen${dryRun ? ', draft' : ''})`);
    return { caption: caption.trim(), row: savedRow };
  } catch (err) {
    console.warn('[Marketing] Instagram-Caption Fehler:', err.message);
    return { caption: null, row: null };
  }
}

// ── Admin Basic-Auth ──────────────────────────────────────────────────────
// ADMIN_PASS muss gesetzt sein, sonst sind alle /admin/* Routes dicht (403).
// ADMIN_USER default: "admin".
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || null;
if (!ADMIN_PASS) {
  console.warn('⚠️  ADMIN_PASS nicht gesetzt — /admin/* Routes sind blockiert. Setze ADMIN_PASS in .env.');
}
function requireAdminAuth(req, res, next) {
  // Service-to-Service: x-api-key (konsistent mit anderen .138-APIs)
  const apiKey = req.headers['x-api-key'];
  if (apiKey && process.env.API_KEY && apiKey === process.env.API_KEY) {
    return next();
  }

  // Interaktiv via Browser: HTTP Basic Auth
  if (!ADMIN_PASS) {
    return res.status(503).send('Admin-Bereich nicht konfiguriert. ADMIN_PASS in .env setzen.');
  }
  const header = req.headers.authorization || '';
  const match = header.match(/^Basic (.+)$/);
  if (match) {
    try {
      const [u, p] = Buffer.from(match[1], 'base64').toString('utf8').split(':');
      if (u === ADMIN_USER && p === ADMIN_PASS) return next();
    } catch {}
  }
  res.set('WWW-Authenticate', 'Basic realm="Admin"');
  res.status(401).send('Unauthorized');
}

// GET /admin/posts — simple Admin-UI zum Anzeigen/Editieren/Kopieren der
// generierten Channel-Posts (Instagram-Captions + Telegram-Texte).
app.get('/admin/posts', requireAdminAuth, (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'posts.html'));
});

// GET /api/channel/content/today — alle heutigen Posts + Instagram-Captions
app.get('/api/channel/content/today', requireAdminAuth, async (req, res) => {
  if (!supabasePublic) return res.status(503).json({ error: 'Datenbank nicht verfügbar' });
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabasePublic
    .from('channel_posts')
    .select('*')
    .eq('date', today)
    .order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ date: today, posts: data || [] });
});

// GET /api/channel/content?days=7&type=tagesimpuls&q=search — Content mit Filtern
app.get('/api/channel/content', requireAdminAuth, async (req, res) => {
  if (!supabasePublic) return res.status(503).json({ error: 'Datenbank nicht verfügbar' });
  const days = req.query.days ? parseInt(req.query.days) : 7;
  const month = req.query.month; // Format: "2026-04" für Monatsansicht
  const typeFilter = req.query.type;
  const searchQuery = req.query.q;

  let query = supabasePublic.from('channel_posts').select('*');

  if (month) {
    // Monatsansicht: exakt diesen Monat
    const [year, mon] = month.split('-');
    const firstDay = `${year}-${mon}-01`;
    const lastDay = new Date(parseInt(year), parseInt(mon), 0).toISOString().split('T')[0];
    query = query.gte('date', firstDay).lte('date', lastDay);
  } else if (days > 0) {
    const since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    query = query.gte('date', since);
  }

  if (typeFilter) query = query.eq('type', typeFilter);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  let posts = data || [];
  // Volltextsuche (einfache clientseitige Filterung)
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    posts = posts.filter(p =>
      (p.telegram_text || '').toLowerCase().includes(q) ||
      (p.instagram_caption || '').toLowerCase().includes(q) ||
      (p.topic || '').toLowerCase().includes(q)
    );
  }

  return res.json({ posts, total: posts.length });
});

// PATCH /api/channel/content/:id — Post bearbeiten
app.patch('/api/channel/content/:id', requireAdminAuth, async (req, res) => {
  if (!supabasePublic) return res.status(503).json({ error: 'Datenbank nicht verfügbar' });
  const { id } = req.params;
  const { telegram_text, instagram_caption, scheduled_for } = req.body;
  const updates = { edited: true };
  if (telegram_text !== undefined) updates.telegram_text = telegram_text;
  if (instagram_caption !== undefined) updates.instagram_caption = instagram_caption;
  if (scheduled_for !== undefined) {
    // Akzeptiert ISO-String oder null (Schedule entfernen)
    if (scheduled_for === null || scheduled_for === '') {
      updates.scheduled_for = null;
    } else {
      const d = new Date(scheduled_for);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ error: 'Ungültiges Datum für scheduled_for' });
      }
      updates.scheduled_for = d.toISOString();
    }
  }
  const { data, error } = await supabasePublic
    .from('channel_posts').update(updates).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, post: data });
});

// POST /api/channel/content/:id/send-telegram — manuell zu Telegram senden
app.post('/api/channel/content/:id/send-telegram', requireAdminAuth, async (req, res) => {
  if (!supabasePublic) return res.status(503).json({ error: 'Datenbank nicht verfügbar' });
  const { id } = req.params;
  const { data: post, error: fetchErr } = await supabasePublic
    .from('channel_posts').select('*').eq('id', id).single();
  if (fetchErr || !post) return res.status(404).json({ error: 'Post nicht gefunden' });
  if (!TELEGRAM_CHANNEL_ID) return res.status(503).json({ error: 'TELEGRAM_CHANNEL_ID fehlt' });
  try {
    await sendTelegramMessage(TELEGRAM_CHANNEL_ID, post.telegram_text, '');
    await supabasePublic.from('channel_posts').update({
      telegram_sent: true, sent_at: new Date().toISOString(), status: 'published',
    }).eq('id', id);
    console.log(`📤 [Channel] Post ${id} manuell zu Telegram gesendet`);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ======================================================
// KANAL-CONTENT: Tagesimpuls + HD-Wissen
// ======================================================

const HD_WISSEN_TOPICS = JSON.parse(fs.readFileSync(path.join(__dirname, '../content-topics/telegram-hd-wissen.json'), 'utf-8'));

/**
 * Lädt Transit-Daten für heute aus Supabase oder API.
 */
async function loadTodayTransit() {
  const today = new Date().toISOString().split('T')[0];
  try {
    const { data: stored } = await supabasePublic
      .from('daily_transits').select('*').eq('date', today).maybeSingle();
    if (stored?.sun_gate) {
      console.log(`   📅 [Channel] Transit aus Supabase: ☀️ ${stored.sun_gate} 🌍 ${stored.earth_gate} 🌙 ${stored.moon_gate}`);
      return {
        date: stored.date,
        sun: { gate: stored.sun_gate, line: stored.sun_line },
        earth: { gate: stored.earth_gate, line: stored.earth_line },
        moon: { gate: stored.moon_gate, line: stored.moon_line },
        moonPhase: stored.moon_phase,
        activeChannels: stored.active_channels,
      };
    }
    const res = await fetch(`${CONNECTION_KEY_URL}/api/transits/today`, {
      signal: AbortSignal.timeout(10000),
      headers: { 'x-api-key': process.env.API_KEY || '' },
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`   📅 [Channel] Transit von API: ☀️ ${data.sun?.gate} 🌍 ${data.earth?.gate} 🌙 ${data.moon?.gate}`);
      return data;
    }
  } catch (e) {
    console.warn('[Channel] Transit-Fetch fehlgeschlagen:', e.message);
  }
  return null;
}

/**
 * Postet täglich einen allgemeinen Transit-Tagesimpuls in den Telegram-Kanal.
 */
async function postChannelTagesimpuls({ dryRun = false } = {}) {
  if (!TELEGRAM_CHANNEL_ID && !dryRun) {
    console.warn('[Channel] TELEGRAM_CHANNEL_ID nicht gesetzt — überspringe');
    return null;
  }
  console.log(`📢 [Channel] Generiere Tagesimpuls${dryRun ? ' (Entwurf)' : ' für Kanal'}...`);
  try {
    const transit = await loadTodayTransit();
    const today_de = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const gateNames = {
      1:'Kreativität',2:'Richtung',3:'Ordnung',4:'Formulierung',5:'Warten',6:'Reibung',
      7:'Rolle des Selbst',8:'Beitrag',9:'Fokus',10:'Verhalten des Selbst',11:'Ideen',
      12:'Vorsicht',13:'Zuhörer',14:'Kraftfelder',15:'Extreme',16:'Fähigkeiten',
      17:'Meinungen',18:'Korrektur',19:'Wollen',20:'Jetzt',21:'Kontrolle',22:'Anmut',
      23:'Assimilation',24:'Rationalisierung',25:'Unschuld',26:'Egoist',27:'Fürsorge',
      28:'Spiel des Lebens',29:'Das Ja',30:'Flammen',31:'Einfluss',32:'Kontinuität',
      33:'Privatsphäre',34:'Kraft',35:'Veränderung',36:'Krise',37:'Freundschaft',
      38:'Kämpfer',39:'Provokateur',40:'Einsamkeit',41:'Kontraktion',42:'Wachstum',
      43:'Durchbruch',44:'Energie',45:'Versammler',46:'Bestimmung des Körpers',
      47:'Erkenntnis',48:'Tiefe',49:'Prinzipien',50:'Werte',51:'Schock',52:'Stillstand',
      53:'Entwicklung',54:'Ambitionen',55:'Geist',56:'Stimulation',57:'Intuition',
      58:'Lebensfreude',59:'Sexualität',60:'Akzeptanz',61:'Wahrheit',62:'Details',
      63:'Zweifel',64:'Verwirrung',
    };

    const sunGate = transit?.sun?.gate || '?';
    const sunLine = transit?.sun?.line || '?';
    const earthGate = transit?.earth?.gate || '?';
    const earthLine = transit?.earth?.line || '?';
    const moonGate = transit?.moon?.gate || '?';
    const moonLine = transit?.moon?.line || '?';
    const sunGateName = gateNames[sunGate] || '';

    const templateText = templates['channel-tagesimpuls'] || '';
    const filledTemplate = templateText
      .replace(/\{\{date\}\}/g, today_de)
      .replace(/\{\{sunGate\}\}/g, sunGate).replace(/\{\{sunLine\}\}/g, sunLine)
      .replace(/\{\{sunGateName\}\}/g, sunGateName)
      .replace(/\{\{earthGate\}\}/g, earthGate).replace(/\{\{earthLine\}\}/g, earthLine)
      .replace(/\{\{moonGate\}\}/g, moonGate).replace(/\{\{moonLine\}\}/g, moonLine)
      .replace(/\{\{#moonPhase\}\}[\s\S]*?\{\{\/moonPhase\}\}/g, transit?.moonPhase ? `Mondphase: ${transit.moonPhase}` : '')
      .replace(/\{\{#activeChannels\}\}[\s\S]*?\{\{\/activeChannels\}\}/g, transit?.activeChannels?.length ? `Aktive Kanäle: ${transit.activeChannels.join(', ')}` : '');

    const prompt = `${filledTemplate}\n\nErstelle jetzt den Tagesimpuls für heute (${today_de}).`;
    const text = await generateWithClaude(prompt, { maxTokens: 600, temperature: 0.85 });

    if (!dryRun) {
      const escHtml = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const header = `✨ <b>Tagesimpuls — ${escHtml(today_de)}</b>\n${escHtml(`☀️ Tor ${sunGate}.${sunLine} · 🌙 Tor ${moonGate}.${moonLine}`)}\n\n`;
      await sendTelegramMessage(TELEGRAM_CHANNEL_ID, header + escHtml(text.trim()), 'HTML');
      console.log(`📢 [Channel] Tagesimpuls gepostet (${text.length} Zeichen)`);
    } else {
      console.log(`📝 [Channel] Tagesimpuls-Entwurf erstellt (${text.length} Zeichen)`);
    }
    const { row } = await generateAndSaveInstagramCaption(text.trim(), 'tagesimpuls', null, { dryRun });
    if (!dryRun) {
      sendMattermost(`✨ **Tagesimpuls gepostet** | ☀️ Tor ${sunGate}.${sunLine} · 🌙 Tor ${moonGate}.${moonLine}\n${text.trim().substring(0, 200)}...`, 'channel');
      generateSocialContent(text.trim(), `Sonne Tor ${sunGate}, Mond Tor ${moonGate}`);
    }
    return row;
  } catch (err) {
    console.error('[Channel] Tagesimpuls Fehler:', err.message);
    if (!dryRun) sendMattermost(`❌ **Tagesimpuls-Fehler**: ${err.message}`, 'errors');
    throw err;
  }
}

const HD_BEZIEHUNG_TOPICS = JSON.parse(fs.readFileSync(path.join(__dirname, '../content-topics/telegram-hd-beziehung.json'), 'utf-8'));

/**
 * Postet täglich einen Beziehungs- und Resonanz-Beitrag in den Telegram-Kanal.
 */
async function postChannelBeziehung({ dryRun = false } = {}) {
  if (!TELEGRAM_CHANNEL_ID && !dryRun) return null;
  console.log(`💞 [Channel] Generiere Beziehung & Resonanz Post${dryRun ? ' (Entwurf)' : ''}...`);
  try {
    const dayOfYear = Math.floor((Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 86400000);
    const { topic, topicHashtag } = HD_BEZIEHUNG_TOPICS[dayOfYear % HD_BEZIEHUNG_TOPICS.length];

    const templateText = templates['channel-hd-wissen'] || '';
    const topicHashtagClean = topicHashtag.replace(/[^a-zA-ZäöüÄÖÜß]/g, '');
    const prompt = templateText.replace(/\{\{topic\}\}/g, topic).replace(/\{\{topicHashtag\}\}/g, topicHashtagClean)
      + `\n\nErstelle jetzt den Post über: ${topic}`;
    const text = await generateWithClaude(prompt, { maxTokens: 500, temperature: 0.9 });

    if (!dryRun) {
      await sendTelegramMessage(TELEGRAM_CHANNEL_ID, text.trim(), '');
      console.log(`💞 [Channel] Beziehung gepostet: ${topic} (${text.length} Zeichen)`);
    } else {
      console.log(`📝 [Channel] Beziehungs-Entwurf erstellt: ${topic} (${text.length} Zeichen)`);
    }
    const { row } = await generateAndSaveInstagramCaption(text.trim(), 'beziehung', topic, { dryRun });
    if (!dryRun) sendMattermost(`💞 **Beziehung & Resonanz gepostet** | ${topic}`, 'channel');
    return row;
  } catch (err) {
    console.error('[Channel] Beziehung Fehler:', err.message);
    if (!dryRun) sendMattermost(`❌ **Beziehung-Fehler**: ${err.message}`, 'errors');
    throw err;
  }
}

/**
 * Postet Mo–Fr einen HD-Wissen-Beitrag in den Telegram-Kanal.
 */
async function postChannelHDWissen({ dryRun = false } = {}) {
  if (!TELEGRAM_CHANNEL_ID && !dryRun) {
    console.warn('[Channel] TELEGRAM_CHANNEL_ID nicht gesetzt — überspringe');
    return null;
  }
  // Nur Sonntag (0) — ausser dryRun (Coach kann jederzeit einen Entwurf bauen)
  const day = new Date().getUTCDay();
  if (!dryRun && day !== 0) {
    console.log(`[Channel] HD-Wissen: nur sonntags (heute Wochentag ${day})`);
    return null;
  }
  console.log(`📚 [Channel] Generiere HD-Wissen-Post${dryRun ? ' (Entwurf)' : ''}...`);
  try {
    // Topic anhand des Datums rotieren
    const dayOfYear = Math.floor((Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 86400000);
    const { topic, topicHashtag } = HD_WISSEN_TOPICS[dayOfYear % HD_WISSEN_TOPICS.length];

    const templateText = templates['channel-hd-wissen'] || '';
    const filledTemplate = templateText
      .replace(/\{\{topic\}\}/g, topic)
      .replace(/\{\{topicHashtag\}\}/g, topicHashtag);

    const prompt = `${filledTemplate}\n\nErstelle jetzt den HD-Wissen-Post über: ${topic}`;
    const text = await generateWithClaude(prompt, { maxTokens: 500, temperature: 0.9 });

    if (!dryRun) {
      await sendTelegramMessage(TELEGRAM_CHANNEL_ID, text.trim(), '');
      console.log(`📚 [Channel] HD-Wissen gepostet: ${topic} (${text.length} Zeichen)`);
    } else {
      console.log(`📝 [Channel] HD-Wissen-Entwurf erstellt: ${topic} (${text.length} Zeichen)`);
    }
    const { row } = await generateAndSaveInstagramCaption(text.trim(), 'hd-wissen', topic, { dryRun });
    if (!dryRun) sendMattermost(`📚 **HD-Wissen gepostet** | ${topic}`, 'channel');
    return row;
  } catch (err) {
    console.error('[Channel] HD-Wissen Fehler:', err.message);
    if (!dryRun) sendMattermost(`❌ **HD-Wissen-Fehler**: ${err.message}`, 'errors');
    throw err;
  }
}

/**
 * Postet täglich um 21:00 CEST eine ruhige Abend-Reflexion mit einer Frage zum Tagesabschluss.
 */
async function postChannelAbendReflexion({ dryRun = false } = {}) {
  if (!TELEGRAM_CHANNEL_ID && !dryRun) return null;
  console.log(`🌙 [Channel] Generiere Abend-Reflexion${dryRun ? ' (Entwurf)' : ''}...`);
  try {
    const transit = await loadTodayTransit();
    const today_de = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const sunGate = transit?.sun?.gate || '?';
    const sunLine = transit?.sun?.line || '?';
    const moonGate = transit?.moon?.gate || '?';
    const moonLine = transit?.moon?.line || '?';

    const templateText = templates['channel-abend-reflexion'] || '';
    const filledTemplate = templateText
      .replace(/\{\{date\}\}/g, today_de)
      .replace(/\{\{sunGate\}\}/g, sunGate).replace(/\{\{sunLine\}\}/g, sunLine)
      .replace(/\{\{sunGateName\}\}/g, '')
      .replace(/\{\{moonGate\}\}/g, moonGate).replace(/\{\{moonLine\}\}/g, moonLine)
      .replace(/\{\{#moonPhase\}\}[\s\S]*?\{\{\/moonPhase\}\}/g, transit?.moonPhase ? `Mondphase: ${transit.moonPhase}` : '');

    const prompt = `${filledTemplate}\n\nErstelle jetzt die Abend-Reflexion für heute (${today_de}).`;
    const text = await generateWithClaude(prompt, { maxTokens: 600, temperature: 0.85 });

    let row = null;
    if (supabasePublic) {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabasePublic.from('channel_posts').insert({
        date: today,
        type: 'abend-reflexion',
        topic: 'Tagesabschluss',
        telegram_text: text.trim(),
        instagram_caption: '',
        telegram_sent: !dryRun,
        sent_at: dryRun ? null : new Date().toISOString(),
        status: dryRun ? 'draft' : 'published',
        created_at: new Date().toISOString(),
      }).select().single();
      row = data;
    }

    if (!dryRun) {
      const escHtml = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const header = `🌙 <b>Abend-Reflexion — ${escHtml(today_de)}</b>\n\n`;
      await sendTelegramMessage(TELEGRAM_CHANNEL_ID, header + escHtml(text.trim()), 'HTML');
      console.log(`🌙 [Channel] Abend-Reflexion gepostet (${text.length} Zeichen)`);
      sendMattermost(`🌙 **Abend-Reflexion gepostet**\n${text.trim().substring(0, 200)}...`, 'channel');
    } else {
      console.log(`📝 [Channel] Abend-Reflexion-Entwurf erstellt (${text.length} Zeichen)`);
    }
    return row;
  } catch (err) {
    console.error('[Channel] Abend-Reflexion Fehler:', err.message);
    if (!dryRun) sendMattermost(`❌ **Abend-Reflexion-Fehler**: ${err.message}`, 'errors');
    throw err;
  }
}

// Kanal-Tagesimpuls täglich 07:00 UTC (09:00 CEST)
scheduleDailyAt(7, 0, postChannelTagesimpuls);

// Beziehung & Resonanz: nur Fr + Sa → 18:00 UTC (20:00 CEST). 12:00-Mittagsslot entfernt (User-Wunsch).
scheduleDailyAt(18, 0, async () => {
  const day = new Date().getUTCDay();
  if (day !== 5 && day !== 6) return; // nur Fr (5) + Sa (6)
  return postChannelBeziehung();
});

// HD-Wissen nur sonntags 15:00 UTC (17:00 CEST) — Funktion prüft intern den Wochentag
scheduleDailyAt(15, 0, postChannelHDWissen);

// Abend-Reflexion täglich 19:00 UTC (21:00 CEST)
scheduleDailyAt(19, 0, postChannelAbendReflexion);

// Manueller Trigger für Abend-Reflexion (Coach-UI / curl)
app.post('/api/channel/post-abend-reflexion', async (req, res) => {
  const dryRun = !!(req.body && req.body.dryRun);
  if (dryRun) {
    try {
      const row = await postChannelAbendReflexion({ dryRun: true });
      return res.json({ success: true, post: row, dryRun: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  res.json({ success: true, message: 'Abend-Reflexion gestartet' });
  postChannelAbendReflexion({ dryRun: false }).catch(e => console.error('[Channel] Abend-Reflexion async:', e.message));
});

// Manuelle Trigger
// Wenn body.dryRun === true: Entwurf-Modus — kein Telegram-Versand, nur DB-Save als 'draft'.
// Return wird dann synchron mit der gespeicherten Row zurueckgegeben.
// Ohne dryRun: fire-and-forget wie bisher (fuer Cron-Kompatibilitaet).
app.post('/api/channel/post-beziehung', async (req, res) => {
  const dryRun = !!(req.body && req.body.dryRun);
  if (dryRun) {
    try {
      const row = await postChannelBeziehung({ dryRun: true });
      return res.json({ success: true, post: row, dryRun: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  res.json({ success: true, message: 'Beziehung & Resonanz Post gestartet' });
  postChannelBeziehung({ dryRun: false }).catch(e => console.error('[Channel] Beziehung async:', e.message));
});
app.post('/api/channel/post-tagesimpuls', async (req, res) => {
  const dryRun = !!(req.body && req.body.dryRun);
  if (dryRun) {
    try {
      const row = await postChannelTagesimpuls({ dryRun: true });
      return res.json({ success: true, post: row, dryRun: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  res.json({ success: true, message: 'Tagesimpuls-Post gestartet' });
  postChannelTagesimpuls({ dryRun: false }).catch(e => console.error('[Channel] Tagesimpuls async:', e.message));
});
app.post('/api/channel/post-hd-wissen', async (req, res) => {
  const { topic } = req.body || {};
  const dryRun = !!(req.body && req.body.dryRun);
  if (dryRun) {
    try {
      const row = await postChannelHDWissen({ dryRun: true });
      return res.json({ success: true, post: row, dryRun: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  res.json({ success: true, message: 'HD-Wissen-Post gestartet' });
  if (topic) {
    // Direktes Topic aus Request — Legacy-Path, nur live (kein dryRun)
    try {
      const templateText = templates['channel-hd-wissen'] || '';
      const topicHashtag = topic.replace(/[^a-zA-ZäöüÄÖÜ]/g, '');
      const prompt = templateText.replace(/\{\{topic\}\}/g, topic).replace(/\{\{topicHashtag\}\}/g, topicHashtag)
        + `\n\nErstelle jetzt den HD-Wissen-Post über: ${topic}`;
      const text = await generateWithClaude(prompt, { maxTokens: 500, temperature: 0.9 });
      await sendTelegramMessage(TELEGRAM_CHANNEL_ID, text.trim(), '');
      console.log(`📚 [Channel] HD-Wissen (manuell) gepostet: ${topic}`);
    } catch (err) {
      console.error('[Channel] HD-Wissen Fehler:', err.message);
    }
  } else {
    postChannelHDWissen({ dryRun: false }).catch(e => console.error('[Channel] HD-Wissen async:', e.message));
  }
});

// ======================================================
// AUTOMATIONS: Social/YouTube, Video, Transit-Ausblick, Business-Tipp
// ======================================================

const MCP_GATEWAY_URL = process.env.MCP_SERVER_URL || 'http://mcp-gateway:7000';

/**
 * Ruft einen MCP-Agenten auf und gibt den Text zurück.
 */
async function callMcpAgent(endpoint, body) {
  const res = await fetch(`${MCP_GATEWAY_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.AGENT_SECRET || ''}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`MCP ${endpoint} Fehler: ${res.status}`);
  const data = await res.json();
  return data.response || data.text || data.content || JSON.stringify(data);
}

/**
 * #1 Social/YouTube: Nach jedem Channel-Tagesimpuls Reel-Skript + YouTube-Short generieren.
 * Wird direkt nach postChannelTagesimpuls aufgerufen (nicht standalone).
 */
async function generateSocialContent(telegramText, transitInfo) {
  if (!TELEGRAM_CHANNEL_ID) return;
  console.log('🎬 [Social] Generiere Reel-Skript + YouTube-Short...');
  try {
    const prompt = `Basierend auf diesem Tagesimpuls-Text:

---
${telegramText}
---

${transitInfo ? `Aktuelle Transite: ${transitInfo}` : ''}

Erstelle:

1. REEL-SKRIPT (15-30 Sekunden, Hook → Kern → CTA):
Hook: [1 Satz, maximal provokant]
Kern: [2-3 Sätze, die wichtigste Erkenntnis]
CTA: [1 Satz Einladung zur Reflexion]

2. YOUTUBE-SHORT-BESCHREIBUNG (für Video-Upload):
Titel: [max 60 Zeichen, SEO-optimiert für Human Design]
Beschreibung: [2-3 Sätze + 5 Hashtags]

Sprache: Deutsch. Kein Markdown, klare Trennung mit Überschriften.`;

    const text = await generateWithClaude(prompt, { maxTokens: 600, temperature: 0.9 });

    if (supabasePublic) {
      const today = new Date().toISOString().split('T')[0];
      try {
        await supabasePublic.from('channel_posts').upsert({
          date: today,
          type: 'social-content',
          topic: 'Reel + YouTube',
          telegram_text: telegramText,
          instagram_caption: text.trim(),
          telegram_sent: false,
          status: 'published',
          created_at: new Date().toISOString(),
        }, { onConflict: 'date,type' });
      } catch (e) {
        console.warn('[Social] Supabase-Save Fehler:', e.message);
      }
    }
    console.log(`🎬 [Social] Reel-Skript + YouTube gespeichert (${text.length} Zeichen)`);
  } catch (err) {
    console.error('[Social] Fehler:', err.message);
  }
}

/**
 * #2 Video Creation: Wöchentlich montags ein Video-Konzept basierend auf aktuellen Transiten.
 */
async function postWeeklyVideoConcept(force = false, { dryRun = false } = {}) {
  const day = new Date().getUTCDay();
  if (!force && !dryRun && day !== 1) {
    console.log('[Video] Kein Montag — überspringe Weekly Video Concept');
    return null;
  }
  if (!TELEGRAM_CHANNEL_ID && !dryRun) return null;
  console.log(`🎥 [Video] Generiere wöchentliches Video-Konzept${dryRun ? ' (Entwurf)' : ''}...`);
  try {
    const transit = await loadTodayTransit();
    const sunGate = transit?.sun?.gate || '?';
    const moonGate = transit?.moon?.gate || '?';
    const weekStart = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long' });

    const prompt = `Du bist ein Human Design Content-Stratege. Erstelle ein Video-Konzept für die Woche ab ${weekStart}.

Aktuelle Transit-Energie:
- Sonne: Tor ${sunGate}
- Mond: Tor ${moonGate}

Erstelle ein komplettes Video-Konzept:

TITEL: [1 starker YouTube-Titel, max 60 Zeichen]
HOOK (erste 5 Sekunden): [Was den Zuschauer sofort fesselt]
STRUKTUR:
  - Intro (30 Sek): [Kernversprechen]
  - Teil 1 (2-3 Min): [Hauptthema mit HD-Bezug]
  - Teil 2 (2-3 Min): [Praktische Anwendung]
  - Outro (30 Sek): [CTA + Reflexionsfrage]
THUMBNAIL-IDEE: [Kurzbeschreibung was drauf sein soll]
ZIELGRUPPE: [Wer profitiert am meisten]
HASHTAGS: [5-7 YouTube-Hashtags]

Sprache: Deutsch. Praxisnah, kein Esoterik-Jargon.`;

    const text = await generateWithClaude(prompt, { maxTokens: 700, temperature: 0.85 });

    let savedRow = null;
    if (supabasePublic) {
      try {
        const row = {
          date: new Date().toISOString().split('T')[0],
          type: 'video-concept',
          topic: `Video-Konzept KW ${weekStart}`,
          telegram_text: text.trim(),
          instagram_caption: null,
          telegram_sent: !dryRun,
          ...(dryRun ? {} : { sent_at: new Date().toISOString() }),
          status: dryRun ? 'draft' : 'published',
          created_at: new Date().toISOString(),
        };
        const { data } = await supabasePublic
          .from('channel_posts')
          .upsert(row, { onConflict: 'date,type' })
          .select()
          .single();
        savedRow = data || null;
        // Instagram-Caption für Video-Konzept nachträglich generieren
        generateAndSaveInstagramCaption(text.trim(), 'video-concept', `Video-Konzept KW ${weekStart}`, { dryRun });
      } catch (e) {
        console.warn('[Video] Supabase-Save Fehler:', e.message);
      }
    }
    console.log(`🎥 [Video] Wöchentliches Video-Konzept gespeichert (${text.length} Zeichen${dryRun ? ', draft' : ''})`);
    if (!dryRun) sendMattermost(`🎥 **Video-Konzept gespeichert** | KW ab ${weekStart}\n[→ Channel-Content](https://coach.the-connection-key.de/channel-content)`, 'business');
    return savedRow;
  } catch (err) {
    console.error('[Video] Fehler:', err.message);
    if (!dryRun) sendMattermost(`❌ **Video-Konzept-Fehler**: ${err.message}`, 'errors');
    throw err;
  }
}

/**
 * #3 Transit-Wochenausblick: Montags eine Übersicht der Wochenenergie posten.
 */
async function postWeeklyTransitOutlook(force = false, { dryRun = false } = {}) {
  const day = new Date().getUTCDay();
  if (!force && !dryRun && day !== 1) return null;
  if (!TELEGRAM_CHANNEL_ID && !dryRun) return null;
  console.log(`🌍 [Transit] Generiere Wochen-Transit-Ausblick${dryRun ? ' (Entwurf)' : ''}...`);
  try {
    const transit = await loadTodayTransit();
    const weekStart = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });

    const prompt = `Du bist ein Human Design Transit-Spezialist. Erstelle einen öffentlichen Wochen-Ausblick für Telegram.

Aktuelle Transit-Positionen:
- Sonne: Tor ${transit?.sun?.gate || '?'}.${transit?.sun?.line || '?'}
- Erde: Tor ${transit?.earth?.gate || '?'}.${transit?.earth?.line || '?'}
- Mond: Tor ${transit?.moon?.gate || '?'}.${transit?.moon?.line || '?'}
${transit?.moonPhase ? `- Mondphase: ${transit.moonPhase}` : ''}
${transit?.activeChannels?.length ? `- Aktive Kanäle: ${transit.activeChannels.join(', ')}` : ''}

Erstelle einen Wochen-Ausblick (150-200 Wörter):
1. Kollektive Wochenenergie (2-3 Sätze): Was bewegt sich diese Woche?
2. Für jeden Typ ein Satz (Generator, Projektor, Manifestor, Reflektor): Was ist die Einladung?
3. Eine Frage für die Woche.
4. 3-4 Hashtags.

Kein Markdown. Reiner Text mit Zeilenumbrüchen.`;

    const text = await generateWithClaude(prompt, { maxTokens: 500, temperature: 0.85 });

    if (!dryRun) {
      const header = `🌍 <b>Wochen-Transit — ${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long' })}</b>\n\n`;
      await sendTelegramMessage(TELEGRAM_CHANNEL_ID, header + escHtmlGlobal(text.trim()), 'HTML');
    }
    const { row } = await generateAndSaveInstagramCaption(text.trim(), 'transit-ausblick', `Woche ${weekStart}`, { dryRun });
    console.log(`🌍 [Transit] Wochen-Ausblick ${dryRun ? 'Entwurf erstellt' : 'gepostet'}`);
    if (!dryRun) sendMattermost(`🌍 **Wochen-Transit-Ausblick gepostet** | Woche ab ${weekStart}\n${text.trim().substring(0, 300)}...`, 'business');
    return row;
  } catch (err) {
    console.error('[Transit] Fehler:', err.message);
    if (!dryRun) sendMattermost(`❌ **Transit-Ausblick-Fehler**: ${err.message}`, 'errors');
    throw err;
  }
}

/**
 * #4 Business-Tipp: Montags ein HD-Business-Tipp für den Channel.
 */
async function postWeeklyBusinessTip(force = false, { dryRun = false } = {}) {
  const day = new Date().getUTCDay();
  if (!force && !dryRun && day !== 1) return null;
  if (!TELEGRAM_CHANNEL_ID && !dryRun) return null;
  console.log(`💼 [Business] Generiere wöchentlichen Business-Tipp${dryRun ? ' (Entwurf)' : ''}...`);
  try {
    const BUSINESS_TOPICS = JSON.parse(fs.readFileSync(path.join(__dirname, '../content-topics/telegram-business.json'), 'utf-8'));
    const dayOfYear = Math.floor((Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 86400000);
    const topic = BUSINESS_TOPICS[dayOfYear % BUSINESS_TOPICS.length];

    const prompt = `Du bist ein Human Design Business Coach. Schreibe einen kurzen Business-Tipp für den öffentlichen Telegram-Kanal.

Thema diese Woche: ${topic}

Struktur (120-150 Wörter):
1. Eine provozierende Eröffnungsaussage (kein Emoji, direkt)
2. 3-4 Sätze: Warum das für HD-Typen unterschiedlich ist
3. Je 1 Satz für Generator, Projektor, Manifestor, Reflektor — konkret und direkt
4. 1 Abschlussfrage
5. 3-4 Hashtags (#HumanDesign #Business #Selbstständig etc.)

Kein Markdown. Kein "Liebe Community". Direkte Sprache.`;

    const text = await generateWithClaude(prompt, { maxTokens: 400, temperature: 0.88 });

    if (!dryRun) await sendTelegramMessage(TELEGRAM_CHANNEL_ID, text.trim(), '');
    const { row } = await generateAndSaveInstagramCaption(text.trim(), 'business-tipp', topic, { dryRun });
    console.log(`💼 [Business] Business-Tipp ${dryRun ? 'Entwurf erstellt' : 'gepostet'}: ${topic}`);
    if (!dryRun) sendMattermost(`💼 **Business-Tipp gepostet** | ${topic}`, 'business');
    return row;
  } catch (err) {
    console.error('[Business] Fehler:', err.message);
    if (!dryRun) sendMattermost(`❌ **Business-Tipp-Fehler**: ${err.message}`, 'errors');
    throw err;
  }
}

// Hilfsfunktion für HTML-Escaping (global verwendbar)
function escHtmlGlobal(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Montags 08:00 UTC (10:00 CEST): Transit-Ausblick + Business-Tipp + Video-Konzept — alle deaktiviert (User-Wunsch 2026-04-27)
// scheduleDailyAt(8, 0, postWeeklyTransitOutlook);
// scheduleDailyAt(8, 15, postWeeklyBusinessTip);
// scheduleDailyAt(8, 30, postWeeklyVideoConcept);

// Manuelle Trigger
app.post('/api/channel/post-transit-ausblick', async (req, res) => {
  const dryRun = !!(req.body && req.body.dryRun);
  if (dryRun) {
    try {
      const row = await postWeeklyTransitOutlook(true, { dryRun: true });
      return res.json({ success: true, post: row, dryRun: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  res.json({ success: true, message: 'Transit-Ausblick gestartet' });
  postWeeklyTransitOutlook(true).catch(e => console.error('[Transit] async:', e.message));
});
app.post('/api/channel/post-business-tipp', async (req, res) => {
  const dryRun = !!(req.body && req.body.dryRun);
  if (dryRun) {
    try {
      const row = await postWeeklyBusinessTip(true, { dryRun: true });
      return res.json({ success: true, post: row, dryRun: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  res.json({ success: true, message: 'Business-Tipp gestartet' });
  postWeeklyBusinessTip(true).catch(e => console.error('[Business] async:', e.message));
});
app.post('/api/channel/post-video-concept', async (req, res) => {
  const dryRun = !!(req.body && req.body.dryRun);
  if (dryRun) {
    try {
      const row = await postWeeklyVideoConcept(true, { dryRun: true });
      return res.json({ success: true, post: row, dryRun: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  res.json({ success: true, message: 'Video-Konzept gestartet' });
  postWeeklyVideoConcept(true).catch(e => console.error('[Video] async:', e.message));
});
app.post('/api/channel/post-social-content', async (req, res) => {
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'text erforderlich' });
  res.json({ success: true, message: 'Social-Content gestartet' });
  generateSocialContent(text);
});

// POST /api/channel/custom-post — Custom Post zu einem freien Thema generieren
app.post('/api/channel/custom-post', async (req, res) => {
  const { topic, type = 'custom', send_telegram = false } = req.body || {};
  if (!topic) return res.status(400).json({ error: 'topic erforderlich' });
  try {
    const transit = await loadTodayTransit();
    const today_de = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const transitBlock = transit?.sun?.gate
      ? `\nAktuelle Transite: ☀️ Tor ${transit.sun.gate}.${transit.sun.line} · 🌍 Tor ${transit.earth.gate}.${transit.earth.line} · 🌙 Tor ${transit.moon.gate}.${transit.moon.line}\n`
      : '';

    const prompt = `Du bist ein erfahrener Human Design Coach und Content Creator.

Erstelle einen Telegram-Post für den Human Design Kanal "The Connection Key".
Datum: ${today_de}
Thema: ${topic}
${transitBlock}
REGELN:
- 150–250 Wörter
- Inspirierend, tiefgehend, praktisch anwendbar
- Kein Corporate-Speak, persönliche Sprache
- Kein Hashtag im Telegram-Text
- Auf Deutsch

Antworte NUR mit dem Post-Text, kein Kommentar davor/danach.`;

    const text = await generateWithClaude(prompt, { maxTokens: 500, temperature: 0.85 });

    const { caption: instagramCaption } = await generateAndSaveInstagramCaption(text.trim(), type, topic);

    const today = new Date().toISOString().split('T')[0];
    let savedId = null;
    if (supabasePublic) {
      const { data } = await supabasePublic.from('channel_posts').insert({
        date: today,
        type,
        topic,
        telegram_text: text.trim(),
        instagram_caption: instagramCaption || null,
        telegram_sent: false,
        status: 'draft',
        created_at: new Date().toISOString(),
      }).select('id').single();
      savedId = data?.id || null;
    }

    if (send_telegram && TELEGRAM_CHANNEL_ID) {
      const escHtml = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      await sendTelegramMessage(TELEGRAM_CHANNEL_ID, escHtml(text.trim()), 'HTML');
      if (savedId && supabasePublic) {
        await supabasePublic.from('channel_posts').update({ telegram_sent: true, sent_at: new Date().toISOString(), status: 'published' }).eq('id', savedId);
      }
    }

    console.log(`✏️ [Custom] Post generiert: "${topic}" (${text.length} Zeichen)`);
    return res.json({ success: true, id: savedId, text: text.trim(), instagram_caption: instagramCaption, topic, type });
  } catch (err) {
    console.error('[Custom] Fehler:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/channel/content/:id — Post löschen
app.delete('/api/channel/content/:id', async (req, res) => {
  if (!supabasePublic) return res.status(503).json({ error: 'DB nicht verfügbar' });
  const { id } = req.params;
  const { error } = await supabasePublic.from('channel_posts').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

// ======================================================
// NEWSLETTER (wöchentlicher Mailchimp-Draft, Mittwoch 08:00 UTC)
// ======================================================

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY || '';
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID || '';
function mailchimpServerPrefix() {
  const parts = MAILCHIMP_API_KEY.split('-');
  return parts[parts.length - 1] || 'us21';
}
function mailchimpBaseUrl() {
  return `https://${mailchimpServerPrefix()}.api.mailchimp.com/3.0`;
}
function mailchimpAuthHeader() {
  return `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`;
}
function mailchimpConfigured() {
  return !!(MAILCHIMP_API_KEY && MAILCHIMP_AUDIENCE_ID);
}

async function mailchimpCreateCampaign({ subject, previewText, fromName = 'The Connection Key', replyTo = 'info@the-connection-key.de' }) {
  const res = await fetch(`${mailchimpBaseUrl()}/campaigns`, {
    method: 'POST',
    headers: { Authorization: mailchimpAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'regular',
      recipients: { list_id: MAILCHIMP_AUDIENCE_ID },
      settings: { subject_line: subject, preview_text: previewText, title: subject, from_name: fromName, reply_to: replyTo, to_name: '*|FNAME|* *|LNAME|*' },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Mailchimp createCampaign ${res.status}: ${data.detail || data.title || 'unknown'}`);
  return data;
}

async function mailchimpSetContent(campaignId, html) {
  const res = await fetch(`${mailchimpBaseUrl()}/campaigns/${campaignId}/content`, {
    method: 'PUT',
    headers: { Authorization: mailchimpAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ html }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`Mailchimp setContent ${res.status}: ${data.detail || data.title || 'unknown'}`);
  }
  return true;
}

function buildNewsletterHtml({ weekLabel, intro, items, reflectionQuestion, closing }) {
  const itemsHtml = items.map(it => `
    <tr><td style="padding:0 0 22px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(242,159,5,0.05);border:1px solid rgba(242,159,5,0.18);border-radius:10px;">
        <tr><td style="padding:18px 22px;">
          <div style="font-size:10px;font-weight:700;letter-spacing:0.18em;color:#F29F05;text-transform:uppercase;margin:0 0 8px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">${it.category}</div>
          <div style="font-size:17px;font-weight:700;color:#0b0a0f;line-height:1.35;margin:0 0 10px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">${it.title}</div>
          <div style="font-size:14.5px;color:#3a3942;line-height:1.7;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">${it.excerpt}</div>
        </td></tr>
      </table>
    </td></tr>`).join('\n');

  const LOGO_URL = 'https://the-connection-key.de/images/connection-key-optimized.png';

  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Newsletter</title></head>
<body style="margin:0;padding:0;background:#0b0a0f;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#e9e7f0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0b0a0f;padding:32px 12px;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background:linear-gradient(180deg,#13121a 0%,#0f0e15 100%);border:1px solid rgba(242,159,5,0.18);border-radius:14px;overflow:hidden;">

        <!-- Logo-Header mit Gradient-Schimmer -->
        <tr><td style="padding:40px 32px 28px;text-align:center;background:radial-gradient(ellipse 80% 100% at 50% 0%, rgba(242,159,5,0.12) 0%, transparent 70%);">
          <a href="https://the-connection-key.de" style="display:inline-block;text-decoration:none;">
            <img src="${LOGO_URL}" alt="The Connection Key" width="180" style="max-width:180px;height:auto;display:block;margin:0 auto 14px;" />
          </a>
          <div style="display:inline-block;padding:5px 14px;font-size:10px;font-weight:700;letter-spacing:0.28em;color:#F29F05;background:rgba(242,159,5,0.08);border:1px solid rgba(242,159,5,0.35);border-radius:100px;">
            ${weekLabel.toUpperCase()}
          </div>
        </td></tr>

        <!-- Gold-Trenner -->
        <tr><td style="padding:0 32px;">
          <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(242,159,5,0.5),transparent);"></div>
        </td></tr>

        <!-- Intro -->
        <tr><td style="padding:28px 32px 8px;">
          <div style="font-size:15px;line-height:1.75;color:#c9c6d4;">${intro}</div>
        </td></tr>

        <!-- Items -->
        <tr><td style="padding:20px 32px 4px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            ${itemsHtml}
          </table>
        </td></tr>

        <!-- Reflexionsfrage -->
        <tr><td style="padding:4px 32px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,rgba(242,159,5,0.10) 0%,rgba(140,29,4,0.08) 100%);border:1px solid rgba(242,159,5,0.25);border-radius:12px;">
            <tr><td style="padding:22px 24px;text-align:center;">
              <div style="font-size:10px;letter-spacing:0.22em;color:#F29F05;text-transform:uppercase;font-weight:700;margin:0 0 10px;">✦ Frage der Woche ✦</div>
              <div style="font-size:16px;line-height:1.55;color:#e9e7f0;font-weight:500;">${reflectionQuestion}</div>
            </td></tr>
          </table>
        </td></tr>

        <!-- Closing + CTA -->
        <tr><td style="padding:8px 32px 36px;">
          <div style="font-size:14.5px;line-height:1.75;color:#c9c6d4;margin:0 0 26px;">${closing}</div>
          <div style="text-align:center;">
            <a href="https://the-connection-key.de/persoenlichkeitsanalyse/sofort" style="display:inline-block;background:linear-gradient(135deg,#F29F05 0%,#8C1D04 100%);color:#0b0a0f;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:0.02em;box-shadow:0 4px 20px rgba(242,159,5,0.25);">
              ✨ Kostenloses Reading anfordern →
            </a>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 32px 32px;background:rgba(0,0,0,0.4);border-top:1px solid rgba(242,159,5,0.12);color:#7a7685;font-size:11px;line-height:1.7;text-align:center;">
          <div style="margin:0 0 8px;">
            <a href="https://the-connection-key.de" style="color:#F29F05;text-decoration:none;margin:0 8px;">Website</a>·
            <a href="https://the-connection-key.de/impressum" style="color:#F29F05;text-decoration:none;margin:0 8px;">Impressum</a>·
            <a href="*|UNSUB|*" style="color:#F29F05;text-decoration:none;margin:0 8px;">Abmelden</a>
          </div>
          <div style="color:#55525f;">
            The Connection Key · Heiko Schwaninger<br>
            Dompfaffenweg 30 · 63920 Großheubach
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function generateNewsletterDraft() {
  if (!mailchimpConfigured()) {
    throw new Error('Mailchimp nicht konfiguriert (MAILCHIMP_API_KEY / MAILCHIMP_AUDIENCE_ID fehlt)');
  }
  if (!supabasePublic) throw new Error('Supabase nicht verfügbar');

  console.log('📰 [Newsletter] Wähle Kandidaten aus channel_posts…');
  const since = new Date(Date.now() - 8 * 86400 * 1000).toISOString();
  const { data: candidates, error } = await supabasePublic
    .from('channel_posts')
    .select('id, date, type, topic, telegram_text, instagram_caption, created_at')
    .gte('created_at', since)
    .eq('used_in_newsletter', false)
    .in('status', ['published', 'draft'])
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Supabase-Fehler: ${error.message}`);
  if (!candidates || candidates.length === 0) {
    throw new Error('Keine ungenutzten Channel-Posts in den letzten 8 Tagen — nichts zum Kuratieren');
  }

  // Diversität: max 1 pro type, Priorität tagesimpuls > beziehung > hd-wissen > business-tipp > transit-ausblick > andere
  const prioByType = { tagesimpuls: 1, beziehung: 2, 'hd-wissen': 3, 'business-tipp': 4, 'transit-ausblick': 5, 'video-concept': 6, 'social-content': 7, custom: 8 };
  const byType = new Map();
  for (const c of candidates) {
    if (!byType.has(c.type)) byType.set(c.type, c);
  }
  const picked = Array.from(byType.values())
    .sort((a, b) => (prioByType[a.type] || 99) - (prioByType[b.type] || 99))
    .slice(0, 4);

  const categoryLabels = {
    tagesimpuls: 'Tagesimpuls', beziehung: 'Beziehung & Resonanz', 'hd-wissen': 'HD-Wissen',
    'business-tipp': 'Business', 'transit-ausblick': 'Transit-Ausblick', 'video-concept': 'Video-Inspiration',
    'social-content': 'Social-Content', custom: 'Custom',
  };

  // Claude komponiert Intro, Item-Titel/Exzerpte, Reflexionsfrage, Closing
  const composerPrompt = `Du bist Newsletter-Kuratorin für The Connection Key (Human Design + Coaching).
Ein wöchentlicher Newsletter soll aus diesen bestehenden Channel-Posts komponiert werden.
Datum: ${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}

Posts:
${picked.map((p, i) => `
[${i + 1}] ${categoryLabels[p.type] || p.type} — ${p.topic || '(ohne Thema)'}
${p.telegram_text}
`).join('\n---\n')}

Erstelle den Newsletter-Content als JSON:
{
  "subjectLine": "E-Mail-Betreff, 40–65 Zeichen, neugierig machend ohne Clickbait",
  "previewText": "Preview-Text, 70–110 Zeichen",
  "intro": "2–3 Sätze Einleitung, warm, persönlich, verbindet aktuelle Wochenenergie mit dem Thema",
  "items": [
    { "category": "Kategorie-Label", "title": "prägnanter Item-Titel", "excerpt": "3–4 Sätze, destilliert aus dem Original, ohne 1:1 Copy" }
  ],
  "reflectionQuestion": "Eine einzelne, offene Reflexionsfrage zur Mitnahme",
  "closing": "2 Sätze Schluss, ermutigend, mit sanftem Bogen zum Reading-CTA"
}

Antworte AUSSCHLIESSLICH mit validem JSON — kein Markdown, kein Kommentar davor/danach.`;

  const rawComposition = await generateWithClaude(composerPrompt, { maxTokens: 2000, temperature: 0.7 });
  let composition;
  try {
    const jsonMatch = rawComposition.match(/\{[\s\S]*\}/);
    composition = JSON.parse(jsonMatch ? jsonMatch[0] : rawComposition);
  } catch (err) {
    throw new Error(`Claude-Response ist kein valides JSON: ${err.message}`);
  }

  if (!composition.subjectLine || !composition.items?.length) {
    throw new Error('Claude-Composition unvollständig');
  }

  const weekLabel = `Woche ${String(Math.ceil((Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / (7 * 86400000))).padStart(2, '0')} · ${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long' })}`;

  const html = buildNewsletterHtml({
    weekLabel,
    intro: composition.intro || '',
    items: composition.items,
    reflectionQuestion: composition.reflectionQuestion || '',
    closing: composition.closing || '',
  });

  console.log(`📰 [Newsletter] Erstelle Mailchimp-Campaign "${composition.subjectLine}"…`);
  const campaign = await mailchimpCreateCampaign({
    subject: composition.subjectLine,
    previewText: composition.previewText || composition.intro?.slice(0, 100) || '',
  });
  await mailchimpSetContent(campaign.id, html);

  // Posts als verwendet markieren
  const usedIds = picked.map(p => p.id);
  await supabasePublic
    .from('channel_posts')
    .update({ used_in_newsletter: true, newsletter_campaign_id: campaign.id })
    .in('id', usedIds);

  console.log(`📰 [Newsletter] Draft erstellt: ${campaign.id} (${picked.length} items)`);
  sendMattermost(
    `📰 **Newsletter-Entwurf bereit** | ${composition.subjectLine}\n` +
    `${picked.length} kuratierte Posts · Audience: ${MAILCHIMP_AUDIENCE_ID}\n` +
    `[→ In Mailchimp öffnen](https://${mailchimpServerPrefix()}.admin.mailchimp.com/campaigns/edit?id=${campaign.web_id || campaign.id})`,
    'business',
  );

  return {
    campaignId: campaign.id,
    webId: campaign.web_id,
    subject: composition.subjectLine,
    itemsUsed: picked.length,
    editUrl: `https://${mailchimpServerPrefix()}.admin.mailchimp.com/campaigns/edit?id=${campaign.web_id || campaign.id}`,
  };
}

// Mittwoch 08:00 UTC (10:00 CEST) — weekly check, nur an Mittwochen
scheduleDailyAt(8, 0, async () => {
  if (new Date().getUTCDay() !== 3) return; // Mi = 3
  try {
    await generateNewsletterDraft();
  } catch (err) {
    console.error('[Newsletter] Cron-Fehler:', err.message);
    sendMattermost(`❌ **Newsletter-Draft-Fehler**: ${err.message}`, 'errors');
  }
});

// Manueller Trigger (Coach kann jederzeit einen Draft bauen)
app.post('/api/newsletter/generate-draft', requireAdminAuth, async (req, res) => {
  try {
    const result = await generateNewsletterDraft();
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[Newsletter] Fehler:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ======================================================
// Server starten
// ======================================================
app.listen(4000, () => {
  console.log("🚀 Combined Reading Worker v2.0 läuft auf Port 4000");
  console.log("   - Chart-Service: " + CHART_SERVICE_URL);
  console.log("   - V3 Queue: reading-queue");
  console.log("   - V4 Queue: reading-queue-v4 (mit Chart-Integration)");
  console.log("   - Connection Queue: reading-queue-v4-connection (echte Charts)");
  console.log("   - Penta Queue: reading-queue-v4-penta (echte Charts)");
  console.log("   - Multi-Agent Queue: reading-queue-v4-multi-agent (mit Chart)");
  console.log("   - Knowledge:", Object.keys(knowledge).length);
  console.log("   - Templates:", Object.keys(templates).length);
});
