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

const app = express();
app.use(express.json());

// ======================================================
// Chart API - Proxy zu connection-key auf 138
// ======================================================
const CHART_SERVICE_URL = process.env.CHART_SERVICE_URL || "http://connection-key:3000/api/chart/calculate";

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
      headers: { "Content-Type": "application/json" },
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

console.log("✅ Supabase (V4):", supabaseUrl.substring(0, 40) + "...");

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
    maxTokens: 8000,
  },
  "claude-opus": {
    provider: "claude",
    models: ["claude-opus-4-6", "claude-sonnet-4-6", "claude-opus-4-5-20251101"],
    maxTokens: 8000,
  },
  "claude-haiku": {
    provider: "claude",
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6"],
    maxTokens: 4000,
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

async function generateWithClaude(prompt, options = {}) {
  if (!anthropicClient) {
    throw new Error("Claude API nicht konfiguriert. ANTHROPIC_API_KEY setzen.");
  }
  const model = options.model || "claude-sonnet-4-6";
  const maxTokens = options.maxTokens || 8000;
  const temperature = options.temperature ?? 0.8;

  console.log(`   [Claude] Start ${model}, max_tokens=${maxTokens}, timeout=${CLAUDE_TIMEOUT_MS / 1000}s`);
  const apiCall = anthropicClient.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    messages: [{ role: "user", content: prompt }],
  });

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Claude Timeout nach ${CLAUDE_TIMEOUT_MS / 1000}s`)), CLAUDE_TIMEOUT_MS);
  });

  const response = await Promise.race([apiCall, timeoutPromise]);
  console.log(`   [Claude] Antwort erhalten (${(response.content[0]?.text || "").length} Zeichen)`);
  const content = response.content[0]?.text || "";
  if (!content) throw new Error("Claude lieferte leere Antwort");
  return content;
}

// ======================================================
// generateReading()
// ======================================================
function formatChartCenters(centers) {
  if (!centers) return 'Keine Daten';
  const names = { head: 'Kopf', ajna: 'Ajna', throat: 'Kehle', g: 'G-Zentrum', heart: 'Herz', spleen: 'Milz', 'solar-plexus': 'Solar Plexus', sacral: 'Sakral', root: 'Wurzel' };
  return Object.entries(centers).map(([k, v]) => `  - ${names[k] || k}: ${v ? 'DEFINIERT' : 'offen'}`).join('\n');
}
function formatChartChannels(channels) {
  if (!channels?.length) return 'Keine Daten';
  return channels.map(c => `  - ${c.name || c.gates?.join('-')}: ${(c.gates || []).join(', ')}`).join('\n');
}
function formatChartGates(gates) {
  if (!gates?.length) return 'Keine Daten';
  return gates.slice(0, 15).map(g => `  - Tor ${g.number || g}: ${g.name || 'Unbekannt'}`).join('\n');
}

async function generateReading({ agentId, template, userData, chartData }) {
  const selectedModelId = userData?.ai_model || DEFAULT_MODEL;
  let modelConfig = MODEL_CONFIG[selectedModelId] || MODEL_CONFIG[DEFAULT_MODEL];
  const maxTokens = userData?.ai_config?.max_tokens || modelConfig.maxTokens;

  if (modelConfig.provider === "claude" && !isClaudeAvailable()) {
    throw new Error(`Claude (${selectedModelId}) nicht verfügbar`);
  }

  console.log("🤖 Generiere Reading:", { agentId, template, model: selectedModelId, provider: modelConfig.provider, hasChart: !!chartData });

  const templateContent = templates[template] || templates['default'] ||
    "Erstelle ein Human Design Reading basierend auf den gegebenen Daten.";

  const chartInfo = chartData ? `
BERECHNETE CHART-DATEN (Präzise für diese Person!):
TYP: ${chartData.type || 'Unbekannt'}
PROFIL: ${chartData.profile || 'Unbekannt'}
AUTORITÄT: ${chartData.authority || 'Unbekannt'}
STRATEGIE: ${chartData.strategy || 'Unbekannt'}

ZENTREN:
${formatChartCenters(chartData.centers)}

KANÄLE:
${formatChartChannels(chartData.channels)}

TORE:
${formatChartGates(chartData.gates)}

Nutze diese KONKRETEN Daten! Beschreibe JEDES definierte Zentrum und JEDEN Kanal ausführlich.
` : '';

  const systemPrompt = `Du bist ein Reading-Agent für Human Design.

${templateContent}

Verwende folgendes Wissen:
${Object.entries(knowledge).slice(0, 5).map(([key, val]) => `\n### ${key}\n${val.substring(0, 500)}`).join('\n')}

Erstelle ein professionelles Reading basierend auf den Nutzerdaten.`;

  const userMessage = `Erstelle ein Reading für:
Name: ${userData.client_name || 'Unbekannt'}
Geburtsdatum: ${userData.birth_date || 'Unbekannt'}
Geburtszeit: ${userData.birth_time || 'Unbekannt'}
Geburtsort: ${userData.birth_location || 'Unbekannt'}
${chartInfo}

${userData.client_data ? JSON.stringify(userData.client_data, null, 2) : ''}`;

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
  { connection: redis }
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
      let chartData = reading.reading_data?.chart_data || null;
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
      }

      await supabase
        .from("reading_jobs")
        .update({ progress: 30 })
        .eq("reading_id", readingId);

      const content = await generateReading({
        agentId: reading.reading_type || 'default',
        template: reading.reading_type || 'default',
        userData: {
          client_name: reading.client_name,
          birth_date: birth.date || reading.birth_date,
          birth_time: birth.time || reading.birth_time,
          birth_location: birth.location || reading.birth_location,
          ...(reading.reading_data || {}),
          ...(reading.client_data || {})
        },
        chartData
      });

      const existingData = reading.reading_data || {};
      const newReadingData = { ...existingData, text: content, chart_data: chartData || existingData.chart_data };

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
      await supabase
        .from("reading_jobs")
        .update({ status: "failed", error: err.message })
        .eq("reading_id", readingId)
        .catch(e => console.warn("⚠️ Konnte Job nicht als failed markieren:", e));
      throw err;
    }
  },
  { connection: redis }
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
    const { readingId, personA, personB, connectionQuestion } = job.data;
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

      // Echte Chart-Berechnung für beide Personen
      console.log("   📊 [Connection] Berechne Charts für Person A und B...");
      const personAChart = await fetchChartData(
        personA?.birthDate, personA?.birthTime, personA?.birthPlace
      ) || { type: "Unbekannt", gates: [], centers: {}, note: "Chart-Berechnung fehlgeschlagen" };

      const personBChart = await fetchChartData(
        personB?.birthDate, personB?.birthTime, personB?.birthPlace
      ) || { type: "Unbekannt", gates: [], centers: {}, note: "Chart-Berechnung fehlgeschlagen" };

      await supabase
        .from("reading_jobs")
        .update({ progress: 30 })
        .eq("reading_id", readingId);

      const dynamics = analyzeConnectionDynamics(personAChart, personBChart);

      await supabase
        .schema("public")
        .from("connection_readings")
        .update({
          person_a_chart: personAChart,
          person_b_chart: personBChart,
          electromagnetic_channels: dynamics.electromagnetic_channels,
          complementary_gates: dynamics.complementary_gates,
          dynamics: dynamics,
          similarities: dynamics.similarities,
          differences: dynamics.differences
        })
        .eq("reading_id", readingId);

      const content = await generateReading({
        agentId: 'connection',
        template: 'relationship',
        userData: {
          personA,
          personB,
          personAChart,
          personBChart,
          dynamics,
          connectionQuestion
        },
        chartData: null // Chart-Daten sind in userData integriert
      });

      await supabasePublic
        .from("readings")
        .update({
          status: "completed",
          reading_data: { text: content, person_a_chart: personAChart, person_b_chart: personBChart },
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

      console.log("✅ [Connection] Reading abgeschlossen:", readingId);
    } catch (err) {
      console.error("❌ [Connection] Fehler:", err);
      await supabase
        .from("reading_jobs")
        .update({ status: "failed", error: err.message })
        .eq("reading_id", readingId)
        .catch(e => console.warn("⚠️ Konnte Job nicht als failed markieren:", e));
      throw err;
    }
  },
  { connection: redis }
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
    const { readingId, groupName, groupContext, members } = job.data;
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

      // Echte Chart-Berechnung für alle Mitglieder
      console.log(`   📊 [Penta] Berechne Charts für ${members.length} Mitglieder...`);
      const memberCharts = [];
      for (const member of members) {
        const chart = await fetchChartData(
          member.birthDate, member.birthTime, member.birthPlace
        ) || { type: "Unbekannt", gates: [], centers: {}, note: "Chart-Berechnung fehlgeschlagen" };
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

      const content = await generateReading({
        agentId: 'penta',
        template: 'relationship',
        userData: {
          groupName,
          groupContext,
          members,
          memberCharts,
          pentaChart,
          groupDynamics
        },
        chartData: null // Chart-Daten sind in userData integriert
      });

      await supabasePublic
        .from("readings")
        .update({
          status: "completed",
          reading_data: { text: content, penta_chart: pentaChart, member_charts: memberCharts },
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
      await supabase
        .from("reading_jobs")
        .update({ status: "failed", error: err.message })
        .eq("reading_id", readingId)
        .catch(e => console.warn("⚠️ Konnte Job nicht als failed markieren:", e));
      throw err;
    }
  },
  { connection: redis }
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

      await supabasePublic
        .from("readings")
        .update({
          status: "completed",
          reading_data: { text: finalContent, chart_data: chartData },
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
      await supabase
        .from("reading_jobs")
        .update({ status: "failed", error: err.message })
        .eq("reading_id", readingId)
        .catch(e => console.warn("⚠️ Konnte Job nicht als failed markieren:", e));
      throw err;
    }
  },
  { connection: redis }
);

multiAgentWorker.on("failed", (job, err) => {
  console.error("❌ [Multi-Agent] Job failed:", job?.id, err);
});

console.log("🟢 Multi-Agent Worker aktiv (Queue: reading-queue-v4-multi-agent)");

// ======================================================
// Job Polling System
// ======================================================
async function pollForJobs() {
  try {
    const { data: pendingJobs, error } = await supabase
      .from("reading_jobs")
      .select("id, reading_type, payload, created_at")
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

        if (readingType === 'connection') {
          await processConnectionJob(job, reading);
        } else if (readingType === 'penta') {
          await processPentaJob(job, reading);
        } else if (readingType === 'multi-agent') {
          await processMultiAgentJob(job, reading);
        } else {
          await processHumanDesignJob(job, reading);
        }
      } catch (jobError) {
        console.error(`❌ Fehler bei Job ${job.id}:`, jobError);
      }
    }
  } catch (error) {
    console.error("❌ Polling System Fehler:", error);
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
      .select("reading_data")
      .eq("id", readingId)
      .maybeSingle();
    if (readingRow?.reading_data) {
      existingReadingData = readingRow.reading_data;
      chartData = existingReadingData.chart_data || null;
      if (chartData) console.log(`   📊 Chart-Daten aus DB geladen: Typ=${chartData.type}, Profil=${chartData.profile}`);
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
    const content = await generateReading({
      agentId: 'human_design',
      template: templateName,
      userData: {
        client_name: name,
        birth_date: birthdate,
        birth_time: birthtime,
        birth_location: birthplace,
        ai_model,
        ai_config
      },
      chartData
    });

    console.log(`✅ [Human Design] Reading generiert: ${content.substring(0, 100)}...`);

    if (readingId) {
      // Merge: chart_data setzen/erhalten, text setzen
      const newReadingData = { ...existingReadingData, text: content, chart_data: chartData || existingReadingData.chart_data };
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
  const { personA, personB, connectionQuestion } = reading.client_data || {};

  await supabase
    .from("reading_jobs")
    .update({ status: "processing", started_at: new Date().toISOString() })
    .eq("id", job.id);

  // Echte Chart-Berechnung
  const personAChart = await fetchChartData(
    personA?.birthDate, personA?.birthTime, personA?.birthPlace
  ) || { type: "Unbekannt", gates: [], centers: {} };

  const personBChart = await fetchChartData(
    personB?.birthDate, personB?.birthTime, personB?.birthPlace
  ) || { type: "Unbekannt", gates: [], centers: {} };

  const dynamics = analyzeConnectionDynamics(personAChart, personBChart);

  const content = await generateReading({
    agentId: 'connection',
    template: 'relationship',
    userData: { personA, personB, personAChart, personBChart, dynamics, connectionQuestion }
  });

  await supabase
    .from("reading_jobs")
    .update({ status: "completed", finished_at: new Date().toISOString() })
    .eq("id", job.id);

  console.log(`✅ [Connection] Job ${job.id} abgeschlossen`);
}

// ======================================================
// processPentaJob – FIX: Echte Charts
// ======================================================
async function processPentaJob(job, reading) {
  console.log(`🔄 [Penta] Verarbeite Job ${job.id}`);
  const { members, groupName, groupContext } = reading.client_data || {};

  await supabase
    .from("reading_jobs")
    .update({ status: "processing", started_at: new Date().toISOString() })
    .eq("id", job.id);

  // Echte Chart-Berechnung für alle Mitglieder
  const memberCharts = [];
  for (const member of (members || [])) {
    const chart = await fetchChartData(
      member.birthDate, member.birthTime, member.birthPlace
    ) || { type: "Unbekannt", gates: [], centers: {} };
    memberCharts.push({ name: member.name, chart });
  }

  const groupDynamics = analyzePentaDynamics(memberCharts);
  const pentaChart = calculatePentaChart(memberCharts);

  const content = await generateReading({
    agentId: 'penta',
    template: 'relationship',
    userData: { groupName, members, memberCharts, groupDynamics, pentaChart }
  });

  await supabase
    .from("reading_jobs")
    .update({ status: "completed", finished_at: new Date().toISOString() })
    .eq("id", job.id);

  console.log(`✅ [Penta] Job ${job.id} abgeschlossen`);
}

// ======================================================
// processMultiAgentJob
// ======================================================
async function processMultiAgentJob(job, reading) {
  console.log(`🔄 [Multi-Agent] Verarbeite Job ${job.id}`);
  const { agents, synthesis, birthData, focus } = reading.client_data || {};

  await supabase
    .from("reading_jobs")
    .update({ status: "processing", started_at: new Date().toISOString() })
    .eq("id", job.id);

  // Chart berechnen
  const chartData = await fetchChartData(
    birthData?.birthDate, birthData?.birthTime, birthData?.birthLocation
  );

  const agentPromises = agents.map(async (agentId) => {
    const agentReading = await generateReading({
      agentId,
      template: agentId,
      userData: birthData,
      chartData
    });
    return { agentId, reading: agentReading };
  });

  const agentResults = await Promise.all(agentPromises);

  let synthesisText = "";
  if (synthesis) {
    synthesisText = `Synthesis der ${agents.length} Agent-Perspektiven wird hier erstellt.`;
  }

  let content = `# Multi-Agent Reading\n\n`;
  agentResults.forEach(r => {
    content += `## ${r.agentId}\n\n${r.reading}\n\n`;
  });
  if (synthesisText) {
    content += `## Synthesis\n\n${synthesisText}\n\n`;
  }

  await supabase
    .from("reading_jobs")
    .update({ status: "completed", finished_at: new Date().toISOString() })
    .eq("id", job.id);

  console.log(`✅ [Multi-Agent] Job ${job.id} abgeschlossen`);
}

// ======================================================
// Polling starten
// ======================================================
setInterval(pollForJobs, 10000);
console.log("🔄 Job Polling System aktiv (prüft alle 10 Sekunden)");
pollForJobs();

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

function analyzeConnectionDynamics(chartA, chartB) {
  const dynamics = {
    electromagnetic_channels: [],
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

  for (const gateA of gatesA) {
    for (const gateB of gatesB) {
      if (areConnectedGates(gateA, gateB)) {
        dynamics.electromagnetic_channels.push({
          personA_gate: gateA,
          personB_gate: gateB,
          channel: `${gateA}-${gateB}`
        });
      }
    }
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
// Health Endpoint
// ======================================================
app.get("/health", async (_, res) => {
  try {
    const { error: dbError } = await supabasePublic.from("readings").select("id").limit(1);
    res.json({
      status: "ok",
      version: "2.0.0-chart-integration",
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
      templates: Object.keys(templates).length
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
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
