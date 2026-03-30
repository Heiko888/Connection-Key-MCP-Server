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
import { createLiveReadingRouter } from "./lib/live-reading/routes.js";
import { startPsychologyWorker, getPsychologyQueue } from "./workers/psychology-worker.js";

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
  return gates.slice(0, 30).map(g => `  - Tor ${g.number || g}: ${g.name || 'Unbekannt'}`).join('\n');
}

function buildChartInfo(chartData) {
  if (!chartData) return '';
  return `
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
`;
}

function buildKnowledgeText(maxEntries = 8, maxCharsPerEntry = 1000) {
  return Object.entries(knowledge)
    .slice(0, maxEntries)
    .map(([key, val]) => `\n### ${key}\n${val.substring(0, maxCharsPerEntry)}`)
    .join('\n');
}

async function generateDetailedReadingTwoParts({ userData, chartData, modelConfig }) {
  const chartInfo = buildChartInfo(chartData);
  const knowledgeText = buildKnowledgeText(8, 1000);
  const personContext = `Name: ${userData.client_name || 'Unbekannt'}
Geburtsdatum: ${userData.birth_date || 'Unbekannt'}
Geburtszeit: ${userData.birth_time || 'Unbekannt'}
Geburtsort: ${userData.birth_location || 'Unbekannt'}
${chartInfo}`;

  const part1Prompt = `Du bist ein erfahrener Human Design Coach. Verwende folgendes Hintergrundwissen:
${knowledgeText}

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
      console.log(`   [Detailed 2-Pass] Versuche Claude-Modell: ${modelId}`);
      [part1, part2] = await Promise.all([
        generateWithClaude(part1Prompt, { model: modelId, maxTokens: 8000, temperature: 0.7 }),
        generateWithClaude(part2Prompt, { model: modelId, maxTokens: 8000, temperature: 0.7 })
      ]);
      console.log(`   ✅ [Detailed 2-Pass] ${modelId} erfolgreich (${part1.length + part2.length} Zeichen gesamt)`);
      break;
    } catch (err) {
      console.warn(`   ⚠️ [Detailed 2-Pass] ${modelId} fehlgeschlagen:`, err.message);
    }
  }

  if (!part1 && !part2) throw new Error('Alle Claude-Modelle fehlgeschlagen (Detailed 2-Pass)');
  return `${part1}\n\n---\n\n${part2}`;
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
  const tone     = userData?.tone     || userData?.ai_config?.tone;
  const length   = userData?.length   || userData?.ai_config?.length;
  const audience = userData?.audience || userData?.ai_config?.audience;
  const tuningInstructions = buildTuningInstructions({ tone, length, audience });

  console.log("🤖 Generiere Reading:", { agentId, template, model: selectedModelId, provider: modelConfig.provider, hasChart: !!chartData, tone, length, audience });

  // Template-Mapping: explizite Zuordnung reading_type → template-Datei
  const TEMPLATE_MAP = {
    'detailed': 'detailed',
    'depth-analysis': 'depth-analysis',
    'shadow-work': 'shadow-work',
    'transit': 'transit',
    'jahres': 'jahres-reading',
  };
  if (TEMPLATE_MAP[template]) {
    template = TEMPLATE_MAP[template];
  }

  // Detailed readings: 2-Pass-Generierung für vollständige Ausgabe ohne Token-Kürzung
  if (template === 'detailed') {
    return await generateDetailedReadingTwoParts({ userData, chartData, modelConfig });
  }

  const templateContent = templates[template] || templates['default'] ||
    "Erstelle ein Human Design Reading basierend auf den gegebenen Daten.";

  const systemPrompt = `Du bist ein Reading-Agent für Human Design.

${templateContent}

Verwende folgendes Wissen:
${buildKnowledgeText(8, 1000)}
${tuningInstructions}

Erstelle ein professionelles Reading basierend auf den Nutzerdaten.`;

  // Connection-Reading: Beide Personen mit ihren Charts übergeben
  let userMessage;
  if (userData.personA && userData.personB) {
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
VERBINDUNGS-DYNAMIK:
Elektromagnetische Kanäle: ${JSON.stringify(userData.dynamics.electromagnetic_channels || [])}
Komplementäre Gates: ${JSON.stringify(userData.dynamics.complementary_gates || [])}
Gemeinsamkeiten: ${JSON.stringify(userData.dynamics.similarities || [])}
Unterschiede: ${JSON.stringify(userData.dynamics.differences || [])}
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

      const userData = {
        client_name: reading.client_name,
        birth_date: birth.date || reading.birth_date,
        birth_time: birth.time || reading.birth_time,
        birth_location: birth.location || reading.birth_location,
        ...(reading.reading_data || {}),
        ...(reading.client_data || {})
      };

      const [content, reflexionsfragen] = await Promise.all([
        generateReading({
          agentId: reading.reading_type || 'default',
          template: reading.reading_type || 'default',
          userData,
          chartData
        }),
        generateReflexionsfragen(chartData, userData)
      ]);

      const existingData = reading.reading_data || {};
      const newReadingData = {
        ...existingData,
        text: content,
        chart_data: chartData || existingData.chart_data,
        ...(reflexionsfragen ? { reflexionsfragen } : {})
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

      const dynamics = analyzeConnectionDynamics(personAChart, personBChart);

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
          .eq(filterKey, filterVal)
          .catch(e => console.warn("⚠️ [Connection] connection_readings Update fehlgeschlagen:", e.message));
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
          .eq("id", connection_reading_id)
          .catch(() => {});
      }
      await supabase
        .from("reading_jobs")
        .update({ status: "failed", error: err.message })
        .eq("reading_id", readingId)
        .catch(e => console.warn("⚠️ Konnte Job nicht als failed markieren:", e.message));
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
        let chart = null;
        if (member.reading_id) {
          const result = await fetchChartFromReading(member.reading_id);
          chart = result?.chart || null;
          console.log(`   📂 [Penta] ${member.name}: Chart aus Supabase (reading_id=${member.reading_id})`);
        }
        if (!chart) {
          chart = await fetchChartData(member.birthDate, member.birthTime, member.birthPlace)
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
          template: 'relationship',
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

        if (readingType === 'tagesimpuls') {
          await processTagesimpulsJob(job, reading);
        } else if (['connection', 'composite'].includes(readingType) ||
          (['relationship', 'compatibility'].includes(readingType) && (job.payload?.personA || job.payload?.birthdate2))) {
          await processConnectionJob(job, reading);
        } else if (readingType === 'sexuality' && job.payload?.birthdate2) {
          await processSexualityJob(job, reading);
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
      const res = await fetch(`${CONNECTION_KEY_URL}/api/transits/today`, { signal: AbortSignal.timeout(10000) });
      if (res.ok) { transitData = await res.json(); console.log(`   📅 [Tagesimpuls] Transit von API geladen`); }
    }
  } catch (e) {
    console.warn('[Tagesimpuls] Transit-Fetch fehlgeschlagen:', e.message);
  }

  // 2. Chart-Daten laden oder berechnen
  let chartData = null;
  let existingReadingData = {};
  if (readingId) {
    const { data: row } = await supabasePublic.from('readings').select('reading_data').eq('id', readingId).maybeSingle();
    if (row?.reading_data) { existingReadingData = row.reading_data; chartData = row.reading_data.chart_data || null; }
  }
  if (!chartData && birthdate && birthtime && birthplace) {
    chartData = await fetchChartData(birthdate, birthtime, birthplace);
  }

  // 3. Kreuzreferenz berechnen
  const crossRef = calcTransitCrossReference(transitData?.allPlanets, chartData);

  await supabase.from('reading_jobs').update({ status: 'processing', started_at: new Date().toISOString() }).eq('id', job.id);

  try {
    const hdUserData = {
      client_name: name,
      birth_date: birthdate,
      birth_time: birthtime,
      birth_location: birthplace,
      ai_config: {
        ...(ai_config || {}),
        transit: transitData,
        cross_reference: crossRef,
        format: format || 'standard',
        focus_topic: focus_topic || null,
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
    const hdUserData = {
      client_name: name,
      birth_date: birthdate,
      birth_time: birthtime,
      birth_location: birthplace,
      ai_model,
      ai_config
    };

    const [content, reflexionsfragen] = await Promise.all([
      generateReading({
        agentId: 'human_design',
        template: templateName,
        userData: hdUserData,
        chartData
      }),
      generateReflexionsfragen(chartData, hdUserData)
    ]);

    console.log(`✅ [Human Design] Reading generiert: ${content.substring(0, 100)}...`);

    if (readingId) {
      const newReadingData = {
        ...existingReadingData,
        text: content,
        chart_data: chartData || existingReadingData.chart_data,
        ...(reflexionsfragen ? { reflexionsfragen } : {})
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

  const dynamics = analyzeConnectionDynamics(personAChart, personBChart);

  // Template wählen
  const templateName = readingType === 'compatibility' ? 'compatibility'
    : readingType === 'relationship' ? 'relationship'
    : 'connection';

  const content = await generateReading({
    agentId: 'connection',
    template: templateName,
    userData: {
      personA: { name: nameA },
      personB: { name: nameB },
      personAChart,
      personBChart,
      dynamics,
      compositeData,
      connectionQuestion,
    }
  });

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
      .eq("id", connectionReadingId)
      .catch(e => console.warn("⚠️ [Connection] connection_readings Update fehlgeschlagen:", e.message));
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

  const dynamics = analyzeConnectionDynamics(chartA, chartB);

  const systemPrompt = `Du bist ein erfahrener Human Design Coach mit Expertise in Beziehungs- und Intimität-Readings.

${templates['sexuality'] || 'Erstelle ein Intimität & Sexualität Reading für zwei Personen.'}

Verwende folgendes Wissen:
${buildKnowledgeText(8, 1000)}`;

  const userMessage = `Erstelle ein Intimität & Sexualität Resonanz-Reading für:

Person A: ${nameA}
  Typ: ${chartA.type || 'Unbekannt'}
  Profil: ${chartA.profile || 'Unbekannt'}
  Autorität: ${chartA.authority || 'Unbekannt'}
  Strategie: ${chartA.strategy || 'Unbekannt'}
  Zentren: ${formatChartCenters(chartA.centers)}
  Kanäle: ${formatChartChannels(chartA.channels)}
  Tore: ${formatChartGates(chartA.gates)}

Person B: ${nameB}
  Typ: ${chartB.type || 'Unbekannt'}
  Profil: ${chartB.profile || 'Unbekannt'}
  Autorität: ${chartB.authority || 'Unbekannt'}
  Strategie: ${chartB.strategy || 'Unbekannt'}
  Zentren: ${formatChartCenters(chartB.centers)}
  Kanäle: ${formatChartChannels(chartB.channels)}
  Tore: ${formatChartGates(chartB.gates)}

VERBINDUNGS-DYNAMIK:
Elektromagnetische Kanäle: ${JSON.stringify(dynamics.electromagnetic_channels || [])}
Komplementäre Gates: ${JSON.stringify(dynamics.complementary_gates || [])}
Gemeinsamkeiten: ${JSON.stringify(dynamics.similarities || [])}

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

  const reflexionsfragen = await generateConnectionReflexionsfragen(chartA, chartB, nameA, nameB);

  const newReadingData = {
    ...existingReadingData,
    text: content,
    chart_data: chartA,
    chart_data2: chartB,
    personA: { name: nameA },
    personB: { name: nameB },
    ...(reflexionsfragen ? { reflexionsfragen } : {}),
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
  const members = payload.members || [];
  const groupName = payload.groupName || payload.name || 'Gruppe';
  const groupContext = payload.groupContext || '';
  const readingId = payload.reading_id;

  await supabase
    .from("reading_jobs")
    .update({ status: "processing", started_at: new Date().toISOString() })
    .eq("id", job.id);

  // Bestehende Reading-Daten laden
  let existingReadingData = {};
  if (readingId) {
    const { data: row } = await supabasePublic.from("readings").select("reading_data").eq("id", readingId).maybeSingle();
    if (row?.reading_data) existingReadingData = row.reading_data;
  }

  if (!members.length) {
    throw new Error(`[Penta] Keine Mitglieder im Payload für Job ${job.id}`);
  }

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
      chart = await fetchChartData(member.birthDate, member.birthTime, member.birthPlace)
        || { type: "Unbekannt", gates: [], centers: {} };
    }
    memberCharts.push({ name: member.name, chart });
    console.log(`   [Penta] Chart für ${member.name}: ${chart.type}`);
  }

  const groupDynamics = analyzePentaDynamics(memberCharts);
  const pentaChart = calculatePentaChart(memberCharts);

  const content = await generateReading({
    agentId: 'penta',
    template: 'penta',
    userData: { groupName, groupContext, members, memberCharts, groupDynamics, pentaChart }
  });

  const newReadingData = {
    ...existingReadingData,
    text: content,
    members: memberCharts.map(m => ({ name: m.name, chart: m.chart })),
    group_dynamics: groupDynamics,
    penta_chart: pentaChart,
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

async function startSpecialReading(readingType, { reading_id, transit_gates, year, year_transits, name, birthdate, birthtime, birthplace, ai_config: extraConfig }) {
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
    const { reading_id, name, birthdate, birthtime, birthplace, format, focus_topic } = req.body || {};
    const job_id = await startSpecialReading("tagesimpuls", {
      reading_id, name, birthdate, birthtime, birthplace,
      ai_config: { format: format || 'standard', focus_topic },
    });
    console.log(`✅ [Tagesimpuls] Job erstellt: ${job_id}`);
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
