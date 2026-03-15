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

// Server starten
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ MCP HTTP Gateway läuft auf Port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth: Bearer ${MCP_API_KEY.substring(0, 8)}...`);
  console.log(`🤖 Claude: ${process.env.ANTHROPIC_API_KEY ? '✅ Connected' : '❌ Not configured'}`);
});
