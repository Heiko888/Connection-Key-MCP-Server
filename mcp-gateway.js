/**
 * MCP HTTP Gateway
 *
 * Läuft in Docker auf Port 7000
 * Endpoint: POST /agents/run
 * Auth: Authorization: Bearer MCP_API_KEY
 *
 * Leitet Requests an MCP Core weiter (stdio)
 */

import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';
import Anthropic from '@anthropic-ai/sdk';

const require = createRequire(import.meta.url);
const { handleMarketingAgent } = require('./production/agent-marketing.cjs');
const { handleSalesAgent }     = require('./production/agent-sales.cjs');
const { handleSocialAgent }    = require('./production/agent-social.cjs');
const { handleVideoAgent }     = require('./production/agent-video.cjs');
const { handleDesignAgent }    = require('./production/agent-design.cjs');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.MCP_PORT || 7000;
const MCP_API_KEY = process.env.MCP_API_KEY;

if (!MCP_API_KEY) {
  console.error('❌ MCP_API_KEY nicht gesetzt!');
  process.exit(1);
}

// Anthropic Client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('⚠️  ANTHROPIC_API_KEY nicht gesetzt - Reading Agent wird mit Placeholder arbeiten');
}

const ALLOWED_ORIGINS = [
  "https://the-connection-key.de",
  "https://www.the-connection-key.de",
  "https://coach.the-connection-key.de",
  "https://agent.the-connection-key.de",
  "http://localhost:3000",
  "http://localhost:3002"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} nicht erlaubt`));
  },
  credentials: true
}));
app.use(express.json());

// Request Queue (max 1 gleichzeitig)
let isProcessing = false;

// Auth Middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      requestId: req.body?.requestId || 'unknown',
      data: null,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid Authorization header'
      },
      runtimeMs: 0
    });
  }

  const token = authHeader.substring(7);

  if (token !== MCP_API_KEY) {
    return res.status(401).json({
      success: false,
      requestId: req.body?.requestId || 'unknown',
      data: null,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid MCP_API_KEY'
      },
      runtimeMs: 0
    });
  }

  next();
}

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    port: PORT,
    service: 'mcp-http-gateway',
    claude: !!process.env.ANTHROPIC_API_KEY
  });
});

// Agent Routes - Vereinfachte Endpoints mit Claude Integration
const AGENT_SYSTEM_PROMPTS = {
  'marketing': 'Du bist ein Marketing-Begleiter für Human Design Coaches. Du hilfst authentische Marketingstrategien zu entwickeln, die zum Human Design passen. Du kennst die 5 Typen und ihre natürlichen Kommunikationsstile. Antworte auf Deutsch.',
  'automation': 'Du bist ein Prozess- und Automatisierungs-Helfer für Human Design Coaches. Du hilfst, wiederkehrende Aufgaben zu automatisieren und effiziente Workflows zu erstellen. Antworte auf Deutsch.',
  'sales': 'Du bist ein Verkaufs-Unterstützer für Human Design Coaches. Du hilfst Angebote authentisch zu kommunizieren und Verkaufsgespräche zu führen, die zum eigenen Human Design passen. Antworte auf Deutsch.',
  'social-youtube': 'Du bist ein Social Media und YouTube Begleiter für Human Design Coaches. Du hilfst bei Content-Strategien, Video-Ideen und Social-Media-Posts. Antworte auf Deutsch.',
  'chart': 'Du bist ein Human Design Chart-Analytiker. Du analysierst tiefgehend Human Design Charts und erklärst Zentren, Kanäle, Tore, Profile und Inkarnationskreuze präzise. Antworte auf Deutsch.',
  'ui-ux': 'Du bist ein Design-Begleiter für Human Design Coaches. Du hilfst bei der visuellen Gestaltung von Webseiten und Materialien. Antworte auf Deutsch.',
};

app.post('/agent/marketing',      handleMarketingAgent);
app.post('/agent/sales',          handleSalesAgent);
app.post('/agent/social-youtube', handleSocialAgent);
app.post('/agent/video',          handleVideoAgent);
app.post('/agent/video-creation', handleVideoAgent);
app.post('/agent/ui-ux',          handleDesignAgent);


// Chart-Architect / Bodygraph-Gestalter
app.post('/agent/chart-architect', async (req, res) => {
  const { message, userId, chartData } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, agent: 'chart-architect', error: 'message is required', timestamp: new Date().toISOString() });
  }
  try {
    const systemPrompt = `Du bist ein Human Design Bodygraph-Gestalter und Chart-Architekt. Du hast tiefes Expertise in der visuellen und strukturellen Analyse von Human Design Charts. Du erklärst den Bodygraph präzise: alle 9 Zentren, 36 Kanäle, 64 Tore, Definitionen (Single, Split, Triple Split, Quadruple Split), Inkarnationskreuze und Variablen. Du arbeitest präzise mit konkreten Chart-Daten. Antworte auf Deutsch.`;
    const userMessage = chartData
      ? `Chart-Daten:\n${JSON.stringify(chartData, null, 2)}

Frage: ${message}`
      : message;
    const claudeRes = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      max_tokens: 2000,
    });
    res.json({
      success: true,
      agent: 'chart-architect',
      message: message,
      response: claudeRes.content[0].text,
      tokens: claudeRes.usage.input_tokens + claudeRes.usage.output_tokens,
      model: 'claude-sonnet-4-5',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Agent chart-architect] Fehler:', error.message);
    res.status(500).json({ success: false, agent: 'chart-architect', error: error.message, timestamp: new Date().toISOString() });
  }
});
// ============================================
// READING AGENT - Single endpoint for all 4 types
// ============================================
app.post('/agent/reading', async (req, res) => {
  const startTime = Date.now();
  const { readingType, message, userId } = req.body;

  // Validation
  if (!readingType || !message) {
    return res.status(400).json({
      success: false,
      agent: 'reading',
      message: '',
      response: '',
      error: 'readingType and message are required',
      timestamp: new Date().toISOString()
    });
  }

  const validTypes = ['business', 'relationship', 'crisis', 'personality'];
  if (!validTypes.includes(readingType)) {
    return res.status(400).json({
      success: false,
      agent: 'reading',
      message: '',
      response: '',
      error: `Invalid readingType. Must be one of: ${validTypes.join(', ')}`,
      timestamp: new Date().toISOString()
    });
  }

  console.log(`📖 Reading Agent - Type: ${readingType}, User: ${userId || 'anonymous'}, Message: ${message.substring(0, 50)}...`);

  // Reading-specific system prompts
  const readingPrompts = {
    business: `Du bist ein Reading-Interpretations-Agent für Human Design mit Fokus auf Business.

Fokus:
- Berufliche Entscheidungen
- Energieeinsatz im Business
- Zusammenarbeit und Leadership
- Strategisches Handeln im Beruf

Haltung: klar, professionell, handlungsorientiert
Sprache: Deutsch, präzise, ohne Esoterik

Antworte in ca. 300-500 Wörtern mit konkreten, umsetzbaren Hinweisen.`,

    relationship: `Du bist ein Reading-Interpretations-Agent für Human Design mit Fokus auf Beziehungen.

Fokus:
- Nähe und Distanz
- Bindungsmuster
- Kommunikation in Beziehungen
- Partnerschaftsdynamik

Haltung: empathisch, ruhig, wertfrei
Sprache: Deutsch, einfühlsam, ohne Heilsversprechen

Antworte in ca. 300-500 Wörtern mit einfühlsamen, differenzierten Perspektiven.`,

    crisis: `Du bist ein Reading-Interpretations-Agent für Human Design mit Fokus auf Krisenbewältigung.

Fokus:
- Emotionale Regulation
- Stabilisierung
- Orientierung in Krisen
- Ressourcenaktivierung

Haltung: ruhig, klar, stabilisierend
Sprache: Deutsch, beruhigend, ohne Ratschläge

Antworte in ca. 200-400 Wörtern mit beruhigenden, stabilisierenden Impulsen.`,

    personality: `Du bist ein Reading-Interpretations-Agent für Human Design mit Fokus auf Persönlichkeit.

Fokus:
- Selbstbild und Muster
- Stärken und Entwicklungspotenziale
- Persönlichkeitsentwicklung
- Authentizität

Haltung: klar, differenziert, wertfrei
Sprache: Deutsch, präzise, ohne Wertungen

Antworte in ca. 300-500 Wörtern mit klaren, differenzierten Perspektiven.`
  };

  const systemPrompt = readingPrompts[readingType];

  // Call Anthropic Claude API
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      // Fallback wenn kein API Key
      return res.json({
        success: true,
        agent: 'reading',
        readingType: readingType,
        message: message,
        response: `[READING AGENT - ${readingType.toUpperCase()}] (Placeholder Mode)\n\nAnthropic API Key nicht konfiguriert.\n\nSystem Prompt:\n${systemPrompt}`,
        tokens: 0,
        model: 'placeholder',
        runtimeMs: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🤖 Calling Claude for ${readingType} reading...`);

    const completion = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    });

    const response = completion.content[0].text;
    const tokens = completion.usage.input_tokens + completion.usage.output_tokens;

    console.log(`✅ Claude Response received - ${tokens} tokens, ${Date.now() - startTime}ms`);

    res.json({
      success: true,
      agent: 'reading',
      readingType: readingType,
      message: message,
      response: response,
      tokens: tokens,
      model: 'claude-sonnet-4-5',
      runtimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ Claude Error for ${readingType}:`, error.message);

    res.status(500).json({
      success: false,
      agent: 'reading',
      readingType: readingType,
      message: message,
      response: '',
      error: `Claude API Error: ${error.message}`,
      runtimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
  }
});

// Reading Agent Route - Spezialfall (alter Endpoint, bleibt für Kompatibilität)
app.post('/agents/reading', async (req, res) => {
  const { readingType, clientName, readingData, agentConfig } = req.body;

  if (!readingType || !clientName) {
    return res.status(400).json({
      ok: false,
      error: 'readingType and clientName are required'
    });
  }

  // TODO: Hier Reading-Generierung implementieren
  // Placeholder Response
  res.json({
    ok: true,
    result: `[READING AGENT] Reading für ${clientName} (Typ: ${readingType}) wird generiert. Die vollständige Integration wird gerade implementiert.`
  });
});


// POST /agents/run
app.post('/agents/run', authMiddleware, async (req, res) => {
  const startTime = Date.now();
  const requestId = req.body.requestId || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Validierung
  if (!req.body.domain || !req.body.task || !req.body.payload) {
    return res.status(400).json({
      success: false,
      requestId,
      data: null,
      error: {
        code: 'INVALID_PAYLOAD',
        message: 'domain, task, and payload are required'
      },
      runtimeMs: Date.now() - startTime
    });
  }

  // Domain/Task Validierung für Reading
  if (req.body.domain === 'reading' && req.body.task === 'generate') {
    const { birthDate, birthTime, birthPlace } = req.body.payload;

    if (!birthDate || !birthTime || !birthPlace) {
      return res.status(400).json({
        success: false,
        requestId,
        data: null,
        error: {
          code: 'INVALID_PAYLOAD',
          message: 'birthDate, birthTime, and birthPlace are required for reading.generate'
        },
        runtimeMs: Date.now() - startTime
      });
    }
  }

  // Queue Management (max 1 Request gleichzeitig)
  if (isProcessing) {
    return res.status(429).json({
      success: false,
      requestId,
      data: null,
      error: {
        code: 'BUSY',
        message: 'MCP Core is currently processing another request'
      },
      runtimeMs: Date.now() - startTime
    });
  }

  isProcessing = true;

  try {
    // MCP Core via stdio starten
    const mcpCore = spawn('node', [join(__dirname, 'index.js')], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    let stdout = '';
    let stderr = '';

    mcpCore.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    mcpCore.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // MCP JSON-RPC Request erstellen
    const toolName = req.body.domain === 'reading' && req.body.task === 'generate'
      ? 'generateReading'
      : `${req.body.domain}_${req.body.task}`;

    const mcpRequest = {
      jsonrpc: '2.0',
      id: requestId,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: req.body.payload
      }
    };

    // Request an MCP Core senden (als JSON über stdin)
    mcpCore.stdin.write(JSON.stringify(mcpRequest) + '\n');
    mcpCore.stdin.end();

    // Warte auf Response
    await new Promise((resolve, reject) => {
      mcpCore.on('close', (code) => {
        if (code !== 0 && stderr) {
          reject(new Error(stderr));
        } else {
          resolve();
        }
      });

      mcpCore.on('error', (error) => {
        reject(error);
      });
    });

    // Parse Response
    let mcpResponse;
    try {
      // MCP gibt JSON-RPC Response zurück
      const lines = stdout.trim().split('\n').filter(line => line.trim());
      const lastLine = lines[lines.length - 1];
      mcpResponse = JSON.parse(lastLine);
    } catch (parseError) {
      throw new Error(`Failed to parse MCP response: ${parseError.message}. stdout: ${stdout}`);
    }

    // Normalisiere Response ins Standard-Schema
    const result = mcpResponse.result || mcpResponse;
    const structuredContent = result.structuredContent || result;

    const normalizedResponse = {
      success: structuredContent?.success !== false && !mcpResponse.error,
      requestId,
      data: structuredContent?.success !== false && !mcpResponse.error
        ? {
            readingId: structuredContent?.readingId || '',
            reading: structuredContent?.reading || result.content?.[0]?.text || '',
            chartData: structuredContent?.chartData || {},
            tokens: structuredContent?.tokens || 0
          }
        : null,
      error: structuredContent?.success === false || mcpResponse.error
        ? {
            code: mcpResponse.error?.code || 'MCP_ERROR',
            message: mcpResponse.error?.message || structuredContent?.reading || structuredContent?.error?.message || 'Unknown error',
            details: mcpResponse.error || structuredContent
          }
        : null,
      runtimeMs: Date.now() - startTime
    };

    // HTTP Status Code
    const statusCode = normalizedResponse.success ? 200 : 500;

    res.status(statusCode).json(normalizedResponse);

  } catch (error) {
    console.error('MCP Gateway Error:', error);

    res.status(500).json({
      success: false,
      requestId,
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Internal server error',
        details: {}
      },
      runtimeMs: Date.now() - startTime
    });
  } finally {
    isProcessing = false;
  }
});

// ============================================
// NEUE KI-AGENTS
// ============================================

// Gemeinsame Hilfsfunktion für alle neuen Agenten
async function runAgent({ agentName, systemPrompt, message, maxTokens = 1500, startTime, res }) {
  if (!message) {
    return res.status(400).json({ success: false, agent: agentName, error: 'message is required', timestamp: new Date().toISOString() });
  }
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.json({ success: true, agent: agentName, response: `[${agentName.toUpperCase()} - Placeholder] API Key nicht konfiguriert.`, tokens: 0, model: 'placeholder', timestamp: new Date().toISOString() });
    }
    const completion = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }]
    });
    const response = completion.content[0].text;
    const tokens = completion.usage.input_tokens + completion.usage.output_tokens;
    res.json({ success: true, agent: agentName, response, tokens, model: 'claude-sonnet-4-5', runtimeMs: Date.now() - startTime, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error(`❌ [${agentName}] Fehler:`, error.message);
    res.status(500).json({ success: false, agent: agentName, error: error.message, timestamp: new Date().toISOString() });
  }
}

// --------------------------------------------
// REFLEXIONS-AGENT
// Stellt Folgefragen basierend auf Client-Antworten
// POST /agent/reflection
// Body: { message, chartContext? }
// --------------------------------------------
app.post('/agent/reflection', async (req, res) => {
  const startTime = Date.now();
  const { message, chartContext } = req.body;
  const chartInfo = chartContext ? `\n\nChart-Kontext:\n${typeof chartContext === 'object' ? JSON.stringify(chartContext, null, 2) : chartContext}` : '';
  await runAgent({
    agentName: 'reflection',
    systemPrompt: `Du bist ein einfühlsamer Reflexions-Begleiter im Human Design Kontext. Deine einzige Aufgabe ist es, tiefe, offene Folgefragen zu stellen – basierend auf dem, was der Client gerade geschrieben hat.

Regeln:
- Stelle IMMER nur eine einzige Folgefrage – nie mehrere
- Die Frage muss direkt auf das Geschriebene eingehen, nicht auf allgemeines HD-Wissen
- Keine Ratschläge, keine Interpretationen, keine Erklärungen
- Keine Ja/Nein-Fragen
- Keine Bewertungen oder Bestätigungen ("Das ist toll, dass du...", "Super, du hast...")
- Kurze Einleitung (1 Satz) die zeigt, dass du wirklich zugehört hast – dann die Frage
- Ton: warm, präsent, neugierig${chartInfo}

Sprache: Deutsch`,
    message,
    maxTokens: 300,
    startTime,
    res
  });
});

// --------------------------------------------
// SHADOW-WORK-AGENT
// Begleitet Konditionierungsthemen interaktiv
// POST /agent/shadow-work
// Body: { message, chartContext? }
// --------------------------------------------
app.post('/agent/shadow-work', async (req, res) => {
  const startTime = Date.now();
  const { message, chartContext } = req.body;
  const chartInfo = chartContext ? `\n\nChart-Kontext:\n${typeof chartContext === 'object' ? JSON.stringify(chartContext, null, 2) : chartContext}` : '';
  await runAgent({
    agentName: 'shadow-work',
    systemPrompt: `Du bist ein erfahrener Shadow-Work-Begleiter im Human Design Kontext. Du hilfst dabei, Konditionierungsmuster zu erkennen und zu benennen – ohne zu urteilen, ohne zu dramatisieren.

Deine Haltung:
- Neutral, klar, präsent – kein Mitleid, keine Dramatisierung
- Du benennst, was du siehst – du wertest nicht
- Du arbeitest mit dem, was der Client gerade bringt
- Keine Ratschläge, keine Lösungen, keine Heilsversprechen
- Wenn du ein Konditionierungsmuster erkennst: benenne es ruhig und direkt
- Stelle eine Folgefrage, wenn das hilfreich ist – aber nicht immer
- Kurze, präzise Antworten (3–6 Sätze) – kein langes Erklären${chartInfo}

Kontext: Human Design Shadow-Work. Not-Self-Themen: Wut (Manifestor), Frustration (Generator/MG), Bitterkeit (Projektor), Enttäuschung (Reflektor). Offene Zentren als Konditionierungs-Einfallstore.

Sprache: Deutsch`,
    message,
    maxTokens: 500,
    startTime,
    res
  });
});

// --------------------------------------------
// RELATIONSHIP-AGENT
// Kompatibilitätsanalyse zweier Charts (Chat)
// POST /agent/relationship
// Body: { message, chartA?, chartB? }
// --------------------------------------------
app.post('/agent/relationship', async (req, res) => {
  const startTime = Date.now();
  const { message, chartA, chartB } = req.body;
  const chartsInfo = (chartA || chartB) ? `\n\nChart Person A:\n${JSON.stringify(chartA || {}, null, 2)}\n\nChart Person B:\n${JSON.stringify(chartB || {}, null, 2)}` : '';
  await runAgent({
    agentName: 'relationship',
    systemPrompt: `Du bist ein Human Design Relationship-Spezialist. Du analysierst die Dynamik zwischen zwei Menschen auf Basis ihrer Charts – respektvoll, differenziert, ohne Urteile.

Fokus:
- Energiedynamik zwischen den beiden Typen
- Kommunikationsmuster aus den Autoritäten
- Komplementäre und spannungsvolle Verbindungen (Kanäle, Zentren)
- Nähe/Distanz-Bedürfnisse aus dem Chart

Haltung: neutral, einfühlsam, direkt
Keine Diagnosen, keine Schuldzuweisungen, keine Heilsversprechen
Antworte in 3–6 Sätzen, präzise und konkret${chartsInfo}

Sprache: Deutsch`,
    message,
    maxTokens: 600,
    startTime,
    res
  });
});

// --------------------------------------------
// TRANSIT-AGENT
// Aktuelle planetarische Einflüsse (Chat)
// POST /agent/transit
// Body: { message, chartContext?, currentTransits? }
// --------------------------------------------
app.post('/agent/transit', async (req, res) => {
  const startTime = Date.now();
  const { message, chartContext, currentTransits } = req.body;
  const context = [
    chartContext ? `Chart:\n${typeof chartContext === 'object' ? JSON.stringify(chartContext, null, 2) : chartContext}` : '',
    currentTransits ? `Aktuelle Transits:\n${typeof currentTransits === 'object' ? JSON.stringify(currentTransits, null, 2) : currentTransits}` : ''
  ].filter(Boolean).join('\n\n');
  await runAgent({
    agentName: 'transit',
    systemPrompt: `Du bist ein Human Design Transit-Spezialist. Du erklärst, wie aktuelle planetarische Konstellationen mit dem persönlichen Chart interagieren.

Fokus:
- Welche Gates aktivieren aktuelle Planeten im Chart?
- Welche temporären Kanäle entstehen dadurch?
- Was bedeutet das energetisch für diese Person gerade?
- Welche Entscheidungen sollten geprüft werden?

Haltung: klar, nüchtern, informativ – wie ein guter Navigator
Keine Alarmstimmung, keine Vorhersagen, keine Heilsversprechen
Antworte konkret und kurz (4–7 Sätze)${context ? '\n\n' + context : ''}

Sprache: Deutsch`,
    message,
    maxTokens: 500,
    startTime,
    res
  });
});

// --------------------------------------------
// BUSINESS-HD-AGENT
// Unternehmer-Strategien basierend auf HD-Typ (Chat)
// POST /agent/business-hd
// Body: { message, chartContext? }
// --------------------------------------------
app.post('/agent/business-hd', async (req, res) => {
  const startTime = Date.now();
  const { message, chartContext } = req.body;
  const chartInfo = chartContext ? `\n\nChart-Kontext:\n${typeof chartContext === 'object' ? JSON.stringify(chartContext, null, 2) : chartContext}` : '';
  await runAgent({
    agentName: 'business-hd',
    systemPrompt: `Du bist ein Human Design Business Coach. Du hilfst Selbstständigen und Unternehmern dabei, ihr Business aus ihrem Design heraus aufzubauen – nicht gegen es.

Fokus:
- Entscheidungen aus Strategie und Autorität treffen
- Energieeinsatz und Burnout-Prävention nach Typ
- Angebote, Positionierung und Kommunikation aus dem Design
- Zusammenarbeit und Teamdynamiken

Haltung: direkt, businessorientiert, klar – kein Coaching-Jargon
Keine Erfolgsversprechen, keine generischen Tipps
Antworte konkret und umsetzbar (4–6 Sätze)${chartInfo}

Sprache: Deutsch`,
    message,
    maxTokens: 600,
    startTime,
    res
  });
});

// --------------------------------------------
// EMOTIONS-AGENT
// Emotionale Autorität und Wellenarbeit (Chat)
// POST /agent/emotions
// Body: { message, chartContext? }
// --------------------------------------------
app.post('/agent/emotions', async (req, res) => {
  const startTime = Date.now();
  const { message, chartContext } = req.body;
  const chartInfo = chartContext ? `\n\nChart-Kontext:\n${typeof chartContext === 'object' ? JSON.stringify(chartContext, null, 2) : chartContext}` : '';
  await runAgent({
    agentName: 'emotions',
    systemPrompt: `Du bist ein Human Design Emotions-Begleiter. Dein Schwerpunkt liegt auf dem Solarplexus-Zentrum, emotionalen Wellen und dem Unterschied zwischen emotionaler Autorität und emotionaler Konditionierung.

Fokus:
- Ist das Solarplexus definiert oder offen? Das bestimmt alles.
- Definiert: Wellenmuster erkennen, Entscheidungen verzögern, Klarheit abwarten
- Offen: Fremde Emotionen erkennen und nicht als eigene übernehmen
- Emotionen als Information – nicht als Problem
- Konkrete Praxis für den Moment, in dem der Client gerade ist

Haltung: warm, präsent, klar – kein Mitleid, keine Dramatisierung
Keine Diagnosen, keine Heilsversprechen
Antworte kurz und direkt (3–5 Sätze) – präzise für das, was gerade beschrieben wird${chartInfo}

Sprache: Deutsch`,
    message,
    maxTokens: 400,
    startTime,
    res
  });
});


// --------------------------------------------
// HEALTH & WELLNESS AGENT (inkl. Variable/PHS)
// POST /agent/health
// Body: { message, chartContext? }
// --------------------------------------------
app.post('/agent/health', async (req, res) => {
  const startTime = Date.now();
  const { message, chartContext } = req.body;
  const chartInfo = chartContext ? `\n\nChart-Kontext:\n${typeof chartContext === 'object' ? JSON.stringify(chartContext, null, 2) : chartContext}` : '';
  await runAgent({
    agentName: 'health',
    systemPrompt: `Du bist der Health & Wellness Agent von The Connection Key. Du analysierst Gesundheitsmuster auf Basis von Human Design: Zentren, Typ & Strategie, Variables/PHS, relevante Kanäle und Tore (Kanal 25-51, Tor 57, Tor 34). Stil: klar, ruhig, präzise, praxisnah. Keine Diagnosen, keine Esoterik-Floskeln. Format: Markdown, für Coaching-Sessions und PDF-Exports.${chartInfo}`,
    message,
    maxTokens: 500,
    startTime,
    res
  });
});

// --------------------------------------------
// GELD & ÜBERFLUSS AGENT
// POST /agent/abundance
// Body: { message, chartContext? }
// --------------------------------------------
app.post('/agent/abundance', async (req, res) => {
  const startTime = Date.now();
  const { message, chartContext } = req.body;
  const chartInfo = chartContext ? `\n\nChart-Kontext:\n${typeof chartContext === 'object' ? JSON.stringify(chartContext, null, 2) : chartContext}` : '';
  await runAgent({
    agentName: 'abundance',
    systemPrompt: `Du bist der Abundance & Prosperity Agent von The Connection Key. Du analysierst Überfluss-Muster auf Basis von Human Design: HD-Typ und Ressourcen-Anziehung, Strategie & Autorität bei finanziellen Entscheidungen, Zentren (Ego, Sakral, Wurzel, G-Zentrum), Kanäle und Tore (Kanal 21-45, Kanal 37-40, Tor 14, Tor 2). Stil: klar, strategisch, kein Law-of-Attraction-Jargon, keine Finanzberatung. Format: Markdown, für Business Readings und PDF-Exports.${chartInfo}`,
    message,
    maxTokens: 500,
    startTime,
    res
  });
});

// Server starten
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ MCP HTTP Gateway läuft auf Port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth: Bearer ${MCP_API_KEY.substring(0, 8)}...`);
  console.log(`🤖 Claude: ${process.env.ANTHROPIC_API_KEY ? '✅ Connected' : '❌ Not configured'}`);
});
