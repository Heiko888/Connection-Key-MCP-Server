# 🚀 Schnell-Installation: Agent API-Routes auf CK-App Server

## Problem

Die API-Route `pages/api/agents/marketing.ts` existiert nicht auf dem CK-App Server.

## Lösung

### Option 1: Script ausführen (Empfohlen)

```bash
# Auf dem CK-App Server ausführen
cd /opt/hd-app/The-Connection-Key/frontend

# Script herunterladen (falls nicht vorhanden)
# Oder direkt ausführen:
bash <(curl -s https://raw.githubusercontent.com/.../INSTALL_API_ROUTES_CK_APP.sh)

# Oder lokal kopieren und ausführen:
chmod +x integration/INSTALL_API_ROUTES_CK_APP.sh
./integration/INSTALL_API_ROUTES_CK_APP.sh
```

### Option 2: Manuell erstellen

```bash
# Auf dem CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend

# Verzeichnis erstellen
mkdir -p pages/api/agents

# Marketing Agent Route erstellen
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

### Option 3: Von lokalem Repository kopieren

```bash
# Von lokalem Rechner (Windows)
scp integration/api-routes/agents-marketing.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/pages/api/agents/marketing.ts
scp integration/api-routes/agents-automation.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/pages/api/agents/automation.ts
scp integration/api-routes/agents-sales.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/pages/api/agents/sales.ts
scp integration/api-routes/agents-social-youtube.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/pages/api/agents/social-youtube.ts
```

## Nach der Installation

### 1. Next.js App neu starten

```bash
# Docker Container
docker restart the-connection-key-frontend-1

# Oder PM2
pm2 restart next-app
```

### 2. Testen

```bash
# Test Marketing Agent
curl -X POST http://localhost:3000/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Gib mir 3 Hooks für ein Reel"}'
```

### 3. Prüfen

```bash
# Prüfe ob Dateien existieren
ls -la /opt/hd-app/The-Connection-Key/frontend/pages/api/agents/

# Sollte zeigen:
# - marketing.ts
# - automation.ts
# - sales.ts
# - social-youtube.ts
```

## ✅ Fertig!

Nach der Installation sollte `https://www.the-connection-key.de/agents/marketing` funktionieren.

