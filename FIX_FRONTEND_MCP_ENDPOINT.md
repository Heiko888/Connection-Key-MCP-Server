# 🔧 Frontend MCP Endpoint-Fix

## ✅ Situation

**Frontend-Route:** `https://www.the-connection-key.de/agents/marketing`  
**Next.js API-Route:** `/api/agents/marketing` ✅ (korrekt)  
**MCP Server Endpoint:** `/agent/marketing` ✅ (korrekt in API-Route)

## 📋 Flow

```
Frontend (https://www.the-connection-key.de/agents/marketing)
    │
    │ POST /api/agents/marketing
    ▼
Next.js API Route (pages/api/agents/marketing.ts)
    │
    │ POST http://138.199.237.34:7000/agent/marketing ✅
    ▼
MCP Server (138.199.237.34:7000)
    │
    │ /agent/marketing ✅
    ▼
OpenAI API
```

## ✅ Die API-Route ist korrekt!

Die Datei `integration/api-routes/agents-marketing.ts` verwendet bereits den korrekten Endpoint:

```typescript
// Zeile 35 - KORREKT ✅
const response = await fetch(`${MCP_SERVER_URL}/agent/${AGENT_ID}`, {
  method: 'POST',
  // ...
});
```

## 🔍 Mögliche Probleme

### 1. API-Route nicht auf Server installiert

**Prüfen Sie auf dem CK-App Server:**

```bash
# Prüfe ob API-Route existiert
ls -la /opt/hd-app/The-Connection-Key/frontend/pages/api/agents/marketing.ts

# Falls nicht vorhanden, kopieren:
mkdir -p /opt/hd-app/The-Connection-Key/frontend/pages/api/agents
cp integration/api-routes/agents-marketing.ts \
   /opt/hd-app/The-Connection-Key/frontend/pages/api/agents/marketing.ts
```

### 2. Frontend ruft falschen Endpoint auf

**Prüfen Sie die Frontend-Komponente:**

Die `AgentChat` Komponente sollte `/api/agents/marketing` aufrufen (mit 's'), nicht direkt den MCP Server.

**Korrekt:**
```typescript
const res = await fetch('/api/agents/marketing', {
  method: 'POST',
  // ...
});
```

**Falsch:**
```typescript
const res = await fetch('http://138.199.237.34:7000/agents/marketing', {
  // ❌ Falsch - sollte /api/agents/marketing sein
});
```

### 3. MCP Server nicht erreichbar

**Prüfen Sie auf dem Hetzner Server:**

```bash
# MCP Server Status
systemctl status mcp

# Health Check
curl http://138.199.237.34:7000/health

# Test Agent direkt
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

### 4. CORS-Problem

**Prüfen Sie CORS-Konfiguration:**

```bash
# Auf Hetzner Server prüfen
grep -A 5 "cors" /opt/mcp/server.js
```

**Sollte enthalten:**
```javascript
const cors = require('cors');
app.use(cors());
```

---

## 🛠️ Lösungsschritte

### Schritt 1: API-Route auf CK-App Server prüfen

```bash
# SSH zum CK-App Server
ssh root@167.235.224.149

# Prüfe ob Route existiert
cd /opt/hd-app/The-Connection-Key/frontend
ls -la pages/api/agents/marketing.ts
```

**Falls nicht vorhanden:**

```bash
# Erstelle Verzeichnis
mkdir -p pages/api/agents

# Kopiere API-Route
cat > pages/api/agents/marketing.ts << 'EOF'
/**
 * API Route für Marketing Agent
 * Route: /api/agents/marketing
 */

import type { NextApiRequest, NextApiResponse } from 'next';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const AGENT_ID = 'marketing';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { message, userId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'message is required and must be a string'
      });
    }

    // Marketing Agent aufrufen - KORREKTER ENDPOINT ✅
    const response = await fetch(`${MCP_SERVER_URL}/agent/${AGENT_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userId: userId || 'anonymous'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Agent request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      agent: AGENT_ID,
      message: message,
      response: data.response || data.message || 'Keine Antwort erhalten',
      tokens: data.tokens,
      model: data.model || 'gpt-4',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Marketing Agent API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      agent: AGENT_ID
    });
  }
}
EOF
```

### Schritt 2: Next.js App neu starten

```bash
# Docker Container neu starten
docker restart the-connection-key-frontend-1

# Oder falls PM2:
pm2 restart next-app
```

### Schritt 3: Testen

```bash
# Test API-Route direkt
curl -X POST http://localhost:3000/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

---

## 📝 Zusammenfassung

**Frontend:** `/agents/marketing` ✅ (korrekt)  
**Next.js API:** `/api/agents/marketing` ✅ (korrekt)  
**MCP Server:** `/agent/marketing` ✅ (korrekt in API-Route)

**Das Problem ist wahrscheinlich:**
1. API-Route nicht auf Server installiert
2. Next.js App nicht neu gestartet nach Installation
3. MCP Server nicht erreichbar oder nicht gestartet

**Lösung:**
1. API-Route auf CK-App Server installieren
2. Next.js App neu starten
3. MCP Server Status prüfen

