# 📋 Reading-Flow Implementation - Produktionsreif

**Datum:** 26.12.2025  
**Architektur:** Frontend → MCP HTTP Gateway → MCP Core → n8n → Response

---

## 1️⃣ JSON SCHEMAS (Verbindlich)

### Request Schema für `/agents/run`

```json
{
  "domain": "reading",
  "task": "generate",
  "payload": {
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Deutschland",
    "userId": "optional-user-id",
    "readingType": "detailed"
  },
  "requestId": "optional-request-id-uuid"
}
```

**TypeScript Interface:**
```typescript
interface MCPRequest {
  domain: string;
  task: string;
  payload: {
    birthDate: string;      // Format: "YYYY-MM-DD"
    birthTime: string;      // Format: "HH:MM"
    birthPlace: string;
    userId?: string;
    readingType?: string;    // "basic" | "detailed" | "business" | "relationship"
  };
  requestId?: string;
}
```

---

### Response Schema (Immer gleich)

```json
{
  "success": true,
  "requestId": "request-id-uuid",
  "data": {
    "readingId": "reading-uuid",
    "reading": "Generierter Reading-Text...",
    "chartData": {},
    "tokens": 1234
  },
  "error": null,
  "runtimeMs": 2345
}
```

**Bei Fehler:**
```json
{
  "success": false,
  "requestId": "request-id-uuid",
  "data": null,
  "error": {
    "code": "INVALID_PAYLOAD",
    "message": "birthDate is required",
    "details": {}
  },
  "runtimeMs": 12
}
```

**TypeScript Interface:**
```typescript
interface MCPResponse {
  success: boolean;
  requestId: string;
  data: object | null;
  error: {
    code: string;
    message: string;
    details?: object;
  } | null;
  runtimeMs: number;
}
```

---

## 2️⃣ CODE-ÄNDERUNGEN

### A) MCP HTTP Gateway (`mcp-gateway.js`)

**Neu erstellen:** `mcp-gateway.js`

```javascript
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
const requestQueue = [];

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

    // Request an MCP Core senden (als JSON)
    const mcpRequest = JSON.stringify({
      method: 'tools/call',
      params: {
        name: req.body.domain === 'reading' && req.body.task === 'generate' 
          ? 'generateReading' 
          : `${req.body.domain}_${req.body.task}`,
        arguments: req.body.payload
      }
    });

    mcpCore.stdin.write(mcpRequest + '\n');
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
      // MCP gibt JSON zurück
      const lines = stdout.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      mcpResponse = JSON.parse(lastLine);
    } catch (parseError) {
      throw new Error(`Failed to parse MCP response: ${parseError.message}`);
    }

    // Normalisiere Response ins Standard-Schema
    const normalizedResponse = {
      success: mcpResponse.structuredContent?.success !== false,
      requestId,
      data: mcpResponse.structuredContent?.success !== false 
        ? {
            readingId: mcpResponse.structuredContent?.readingId || '',
            reading: mcpResponse.structuredContent?.reading || mcpResponse.content?.[0]?.text || '',
            chartData: mcpResponse.structuredContent?.chartData || {},
            tokens: mcpResponse.structuredContent?.tokens || 0
          }
        : null,
      error: mcpResponse.structuredContent?.success === false
        ? {
            code: 'MCP_ERROR',
            message: mcpResponse.structuredContent?.reading || mcpResponse.content?.[0]?.text || 'Unknown error',
            details: mcpResponse.structuredContent
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

```

---

### B) MCP Core Tool-Handler anpassen (`index.js`)

**Ändern:** `index.js` (Zeile 417-498)

**Vorher:** Tool `generateReading` direkt registriert

**Nachher:** Tool-Handler für `domain="reading"` & `task="generate"` anpassen

```javascript
// generateReading - Generiert ein Human Design Reading
server.registerTool(
  "generateReading",
  {
    title: "Human Design Reading generieren",
    description: "Generiert ein Human Design Reading basierend auf Geburtsdaten. Ruft n8n Workflow auf.",
    inputSchema: z.object({
      birthDate: z.string().describe("Geburtsdatum im Format YYYY-MM-DD"),
      birthTime: z.string().describe("Geburtszeit im Format HH:MM"),
      birthPlace: z.string().describe("Geburtsort"),
      userId: z.string().optional().describe("User-ID (optional)"),
      readingType: z.enum(["basic", "detailed", "business", "relationship"]).optional().default("detailed").describe("Art des Readings")
    }),
    outputSchema: z.object({
      readingId: z.string(),
      chartData: z.record(z.unknown()),
      reading: z.string(),
      success: z.boolean()
    })
  },
  async ({ birthDate, birthTime, birthPlace, userId, readingType = "detailed" }) => {
    const startTime = Date.now();
    
    try {
      // Chart-Daten vorbereiten
      const chartData = {
        birthDate,
        birthTime,
        birthPlace,
        userId: userId || 'anonymous',
        readingType,
        timestamp: new Date().toISOString()
      };

      // n8n Webhook aufrufen
      const webhookPath = config.n8n.webhooks.reading;
      const url = `${config.n8n.baseUrl}${webhookPath}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(chartData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`n8n webhook failed: ${errorText}`);
      }

      const result = await response.json();

      // Normalisierte Response (für MCP Gateway)
      return {
        content: [
          {
            type: "text",
            text: result.reading || result.summary || "Reading wurde generiert"
          }
        ],
        structuredContent: {
          success: true,
          readingId: result.readingId || result.id || `reading-${Date.now()}`,
          reading: result.reading || result.summary || "Reading wurde generiert",
          chartData: result.chartData || chartData,
          tokens: result.tokens || 0,
          runtimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      // Normalisierte Error-Response
      return {
        content: [
          {
            type: "text",
            text: `Fehler beim Generieren des Readings: ${error.message}`
          }
        ],
        structuredContent: {
          success: false,
          readingId: "",
          reading: `Fehler: ${error.message}`,
          chartData: {},
          tokens: 0,
          runtimeMs: Date.now() - startTime,
          error: {
            code: "READING_GENERATION_ERROR",
            message: error.message
          }
        }
      };
    }
  }
);
```

---

### C) Frontend API Route anpassen

**Ändern:** `integration/api-routes/app-router/reading/generate/route.ts`

**Wichtig:** 
- Entferne `READING_AGENT_URL` (Port 4001)
- Verwende `MCP_SERVER_URL` (Port 7000)
- Sende Request an `/agents/run` mit Bearer Token

```typescript
/**
 * Reading Generate API Route (App Router)
 * Route: /api/reading/generate
 * 
 * Frontend → MCP HTTP Gateway → MCP Core → n8n → Response
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateReadingRequest, formatValidationErrors } from '../../../reading-validation';
import { createReadingResponse, createErrorResponse, ReadingResponse } from '../../../reading-response-types';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const MCP_API_KEY = process.env.MCP_API_KEY;

if (!MCP_API_KEY) {
  console.error('❌ MCP_API_KEY nicht gesetzt!');
}

// Supabase Client (Service Role für Admin-Zugriff)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  let readingId: string | null = null;
  const startTime = Date.now();
  
  try {
    // Request Body parsen
    const body = await request.json();

    // Input-Validierung
    const validation = validateReadingRequest(body);

    if (!validation.valid) {
      return NextResponse.json(
        formatValidationErrors(validation.errors),
        { status: 400 }
      );
    }

    // Validierte Daten
    const { data } = validation;
    const readingType = (data?.readingType || 'detailed') as any;

    // ============================================
    // SCHRITT 1: Reading-Eintrag in Supabase erstellen (Status: pending)
    // ============================================
    const { data: pendingReading, error: createError } = await supabase
      .from('readings')
      .insert([{
        user_id: data?.userId || null,
        reading_type: readingType,
        birth_date: data?.birthDate,
        birth_time: data?.birthTime,
        birth_place: data?.birthPlace,
        ...(data?.readingType === 'compatibility' && {
          birth_date2: data?.birthDate2,
          birth_time2: data?.birthTime2,
          birth_place2: data?.birthPlace2
        }),
        reading_text: '',
        status: 'pending'
      }])
      .select()
      .single();

    if (createError || !pendingReading) {
      console.error('Supabase Create Error:', createError);
      return NextResponse.json(
        createErrorResponse(
          'Failed to create reading entry',
          'DB_CREATE_ERROR',
          createError?.message || 'Unknown error'
        ),
        { status: 500 }
      );
    }

    readingId = pendingReading.id;

    // ============================================
    // SCHRITT 2: Status auf 'processing' setzen
    // ============================================
    await supabase
      .from('readings')
      .update({ status: 'processing' })
      .eq('id', readingId);

    // ============================================
    // SCHRITT 3: MCP HTTP Gateway aufrufen
    // ============================================
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const mcpResponse = await fetch(`${MCP_SERVER_URL}/agents/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MCP_API_KEY}`
      },
      body: JSON.stringify({
        domain: 'reading',
        task: 'generate',
        payload: {
          birthDate: data?.birthDate,
          birthTime: data?.birthTime,
          birthPlace: data?.birthPlace,
          userId: data?.userId || null,
          readingType: readingType
        },
        requestId
      })
    });

    if (!mcpResponse.ok) {
      const errorData = await mcpResponse.json();
      
      // Status auf 'failed' setzen
      await supabase
        .from('readings')
        .update({ 
          status: 'failed',
          metadata: {
            error: errorData.error?.message || 'MCP Gateway error',
            failedAt: new Date().toISOString()
          }
        })
        .eq('id', readingId);

      return NextResponse.json(
        createErrorResponse(
          errorData.error?.message || 'MCP Gateway request failed',
          errorData.error?.code || 'MCP_ERROR',
          errorData.error?.details || {}
        ),
        { status: mcpResponse.status }
      );
    }

    const mcpResult = await mcpResponse.json();

    if (!mcpResult.success) {
      // Status auf 'failed' setzen
      await supabase
        .from('readings')
        .update({ 
          status: 'failed',
          metadata: {
            error: mcpResult.error?.message || 'Reading generation failed',
            failedAt: new Date().toISOString()
          }
        })
        .eq('id', readingId);

      return NextResponse.json(
        createErrorResponse(
          mcpResult.error?.message || 'Reading generation failed',
          mcpResult.error?.code || 'READING_ERROR',
          mcpResult.error?.details || {}
        ),
        { status: 500 }
      );
    }

    // ============================================
    // SCHRITT 4: Reading-Daten in Supabase aktualisieren (Status: completed)
    // ============================================
    const readingText = mcpResult.data?.reading || '';
    const readingIdFromMCP = mcpResult.data?.readingId || readingId;

    const metadata = {
      birthDate: data?.birthDate || '',
      birthTime: data?.birthTime || '',
      birthPlace: data?.birthPlace || '',
      tokens: mcpResult.data?.tokens || 0,
      model: 'gpt-4',
      timestamp: new Date().toISOString(),
      userId: data?.userId,
      runtimeMs: mcpResult.runtimeMs || 0,
      ...(data?.readingType === 'compatibility' && {
        birthDate2: data?.birthDate2,
        birthTime2: data?.birthTime2,
        birthPlace2: data?.birthPlace2
      })
    };

    await supabase
      .from('readings')
      .update({
        reading_text: readingText,
        reading_sections: null,
        chart_data: mcpResult.data?.chartData || null,
        metadata: {
          tokens: mcpResult.data?.tokens || 0,
          model: 'gpt-4',
          timestamp: new Date().toISOString(),
          runtimeMs: mcpResult.runtimeMs || 0
        },
        status: 'completed'
      })
      .eq('id', readingId)
      .select()
      .single();

    // ============================================
    // SCHRITT 5: Standardisierte Response zurückgeben
    // ============================================
    const standardizedResponse: ReadingResponse = createReadingResponse(
      readingId,
      readingText,
      readingType,
      metadata,
      undefined,
      mcpResult.data?.chartData
    );

    return NextResponse.json(standardizedResponse);

  } catch (error: any) {
    console.error('Reading Generate API Error:', error);

    // Status auf 'failed' setzen (falls readingId vorhanden)
    if (readingId) {
      await supabase
        .from('readings')
        .update({ 
          status: 'failed',
          metadata: {
            error: error.message || 'Internal server error',
            failedAt: new Date().toISOString()
          }
        })
        .eq('id', readingId);
    }

    // JSON Parse Error
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        createErrorResponse(
          'Invalid JSON in request body',
          'INVALID_JSON'
        ),
        { status: 400 }
      );
    }

    // Allgemeiner Fehler
    return NextResponse.json(
      createErrorResponse(
        error.message || 'Internal server error',
        'INTERNAL_ERROR'
      ),
      { status: 500 }
    );
  }
}

// GET: API Info
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Reading Generate API',
    endpoint: '/api/reading/generate',
    method: 'POST',
    flow: 'Frontend → MCP HTTP Gateway → MCP Core → n8n → Response',
    requiredFields: ['birthDate', 'birthTime', 'birthPlace'],
    optionalFields: ['readingType', 'userId']
  });
}
```

---

## 3️⃣ CURL TESTS

### Test 1: Health Check
```bash
curl http://138.199.237.34:7000/health
```

**Erwartete Antwort:**
```json
{
  "status": "ok",
  "port": 7000,
  "service": "mcp-http-gateway"
}
```

---

### Test 2: Reading Generate (End-to-End)
```bash
curl -X POST http://138.199.237.34:7000/agents/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MCP_API_KEY" \
  -d '{
    "domain": "reading",
    "task": "generate",
    "payload": {
      "birthDate": "1990-05-15",
      "birthTime": "14:30",
      "birthPlace": "Berlin, Deutschland",
      "userId": "test-user-123",
      "readingType": "detailed"
    },
    "requestId": "test-req-001"
  }'
```

**Erwartete Antwort:**
```json
{
  "success": true,
  "requestId": "test-req-001",
  "data": {
    "readingId": "reading-uuid",
    "reading": "Generierter Reading-Text...",
    "chartData": {},
    "tokens": 1234
  },
  "error": null,
  "runtimeMs": 2345
}
```

---

### Test 3: Invalid Auth
```bash
curl -X POST http://138.199.237.34:7000/agents/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer WRONG_KEY" \
  -d '{
    "domain": "reading",
    "task": "generate",
    "payload": {
      "birthDate": "1990-05-15",
      "birthTime": "14:30",
      "birthPlace": "Berlin"
    }
  }'
```

**Erwartete Antwort (401):**
```json
{
  "success": false,
  "requestId": "unknown",
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid MCP_API_KEY"
  },
  "runtimeMs": 0
}
```

---

### Test 4: Invalid Payload
```bash
curl -X POST http://138.199.237.34:7000/agents/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MCP_API_KEY" \
  -d '{
    "domain": "reading",
    "task": "generate",
    "payload": {
      "birthDate": "1990-05-15"
    }
  }'
```

**Erwartete Antwort (400):**
```json
{
  "success": false,
  "requestId": "req-...",
  "data": null,
  "error": {
    "code": "INVALID_PAYLOAD",
    "message": "birthDate, birthTime, and birthPlace are required for reading.generate"
  },
  "runtimeMs": 12
}
```

---

### Test 5: Frontend API Route
```bash
curl -X POST http://167.235.224.149:3000/api/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Deutschland",
    "userId": "test-user-123",
    "readingType": "detailed"
  }'
```

**Erwartete Antwort:**
```json
{
  "success": true,
  "readingId": "uuid-from-supabase",
  "reading": "Generierter Reading-Text...",
  "readingType": "detailed",
  "metadata": {
    "tokens": 1234,
    "runtimeMs": 2345
  }
}
```

---

## 4️⃣ DEPLOYMENT-CHECKLISTE

### Hetzner Server (138.199.237.34)

#### Schritt 1: MCP HTTP Gateway erstellen
```bash
cd /opt/mcp-connection-key
# Datei mcp-gateway.js erstellen (siehe Code oben)
chmod +x mcp-gateway.js
```

#### Schritt 2: ENV-Variablen prüfen
```bash
# In .env prüfen:
grep MCP_API_KEY /opt/mcp-connection-key/.env
grep MCP_PORT /opt/mcp-connection-key/.env
grep N8N_BASE_URL /opt/mcp-connection-key/.env
```

**Erforderlich:**
- `MCP_API_KEY=your-secret-key-here`
- `MCP_PORT=7000` (optional, Default: 7000)
- `N8N_BASE_URL=http://n8n:5678`

#### Schritt 3: Docker Compose anpassen
```bash
cd /opt/mcp-connection-key
# docker-compose.yml bearbeiten
```

**Hinzufügen:**
```yaml
services:
  mcp-gateway:
    build:
      context: .
      dockerfile: Dockerfile.mcp-gateway
    container_name: mcp-gateway
    ports:
      - "7000:7000"
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - MCP_PORT=7000
    restart: unless-stopped
    networks:
      - app-network
```

#### Schritt 4: Dockerfile.mcp-gateway erstellen
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY mcp-gateway.js ./
COPY index.js ./
COPY config.js ./

EXPOSE 7000

CMD ["node", "mcp-gateway.js"]
```

#### Schritt 5: Container bauen und starten
```bash
cd /opt/mcp-connection-key
docker compose build mcp-gateway
docker compose up -d mcp-gateway
```

#### Schritt 6: Logs prüfen
```bash
docker logs mcp-gateway --tail 50
```

#### Schritt 7: Health Check testen
```bash
curl http://localhost:7000/health
```

---

### CK-App Server (167.235.224.149)

#### Schritt 1: ENV-Variablen prüfen
```bash
cd /opt/hd-app/The-Connection-Key/frontend
# In .env.local prüfen:
grep MCP_SERVER_URL .env.local
grep MCP_API_KEY .env.local
```

**Erforderlich:**
- `MCP_SERVER_URL=http://138.199.237.34:7000`
- `MCP_API_KEY=your-secret-key-here` (muss gleich sein wie auf Hetzner!)

#### Schritt 2: Frontend API Route deployen
```bash
cd /opt/hd-app/The-Connection-Key
# Datei integration/api-routes/app-router/reading/generate/route.ts aktualisieren
git pull  # oder manuell kopieren
```

#### Schritt 3: Frontend Container neu bauen
```bash
cd /opt/hd-app/The-Connection-Key
docker compose -f docker-compose-redis-fixed.yml build frontend
docker compose -f docker-compose-redis-fixed.yml up -d frontend
```

#### Schritt 4: Logs prüfen
```bash
docker logs the-connection-key-frontend-1 --tail 50
```

#### Schritt 5: API Route testen
```bash
curl -X POST http://localhost:3000/api/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin"
  }'
```

---

## 5️⃣ WICHTIGE HINWEISE

### MCP_API_KEY
- **MUSS** auf beiden Servern identisch sein!
- Hetzner: `/opt/mcp-connection-key/.env`
- CK-App: `/opt/hd-app/The-Connection-Key/frontend/.env.local`

### Ports
- ✅ Port 7000: MCP HTTP Gateway
- ✅ Port 4000: chatgpt-agent (bleibt unverändert)
- ✅ Port 5678: n8n (intern, Docker Network)
- ❌ Port 4001: NICHT mehr verwenden!
- ❌ Port 7777: NICHT mehr verwenden!

### n8n Webhook
- Webhook-Pfad: `/webhook/reading` (aus `config.js`)
- URL: `http://n8n:5678/webhook/reading` (intern, Docker Network)
- MCP Core ruft diesen Webhook auf

---

## ✅ STATUS

**Implementierung:** ✅ Abgeschlossen  
**Tests:** ✅ Vorbereitet  
**Deployment:** ⏳ Ausstehend
