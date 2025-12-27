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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.MCP_PORT || 7000;
const MCP_API_KEY = process.env.MCP_API_KEY;

if (!MCP_API_KEY) {
  console.error('❌ MCP_API_KEY nicht gesetzt!');
  process.exit(1);
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
    service: 'mcp-http-gateway'
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
});
