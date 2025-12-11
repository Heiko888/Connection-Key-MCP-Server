# 🔧 Marketing Agent API-Route installieren

## Problem
Marketing Agent gibt Fehler: "failed to call marketing agent"

## Lösung - Befehle direkt auf dem Server ausführen

### Schritt 1: API-Route erstellen

```bash
cd /opt/hd-app/The-Connection-Key

# Erstelle Verzeichnis im Container
docker exec the-connection-key-frontend-1 mkdir -p /app/pages/api/agents

# Erstelle API-Route Datei
cat > /tmp/agents-marketing.ts << 'EOF'
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

# Kopiere Datei in Container
docker cp /tmp/agents-marketing.ts the-connection-key-frontend-1:/app/pages/api/agents/marketing.ts

# Prüfe ob Datei erstellt wurde
docker exec the-connection-key-frontend-1 ls -la /app/pages/api/agents/marketing.ts
```

### Schritt 2: MCP_SERVER_URL setzen

```bash
cd /opt/hd-app/The-Connection-Key

# Prüfe ob .env existiert
if [ ! -f .env ]; then
    touch .env
fi

# Setze MCP_SERVER_URL
if ! grep -q '^MCP_SERVER_URL=' .env; then
    echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env
else
    sed -i 's|^MCP_SERVER_URL=.*|MCP_SERVER_URL=http://138.199.237.34:7000|' .env
fi

# Prüfe Ergebnis
grep MCP_SERVER_URL .env
```

### Schritt 3: Container neu starten

```bash
cd /opt/hd-app/The-Connection-Key
docker compose restart frontend
sleep 5
```

### Schritt 4: Prüfen

```bash
# Prüfe Umgebungsvariable
docker exec the-connection-key-frontend-1 env | grep MCP_SERVER_URL

# Prüfe MCP Server erreichbar
curl http://138.199.237.34:7000/health

# Test API-Route
curl -X POST http://localhost:3000/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message":"Test"}'
```

## Alle Schritte in einem Befehl

```bash
cd /opt/hd-app/The-Connection-Key && \
docker exec the-connection-key-frontend-1 mkdir -p /app/pages/api/agents && \
cat > /tmp/agents-marketing.ts << 'EOFFILE'
import type { NextApiRequest, NextApiResponse } from 'next';
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const AGENT_ID = 'marketing';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  try {
    const { message, userId } = req.body;
    if (!message || typeof message !== 'string') return res.status(400).json({ success: false, error: 'message is required and must be a string' });
    const response = await fetch(\`\${MCP_SERVER_URL}/agent/\${AGENT_ID}\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, userId: userId || 'anonymous' }) });
    if (!response.ok) { const errorText = await response.text(); throw new Error(\`Agent request failed: \${response.status} \${errorText}\`); }
    const data = await response.json();
    return res.status(200).json({ success: true, agent: AGENT_ID, message: message, response: data.response || data.message || 'Keine Antwort erhalten', tokens: data.tokens, model: data.model || 'gpt-4', timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error('Marketing Agent API Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error', agent: AGENT_ID });
  }
}
EOFFILE
docker cp /tmp/agents-marketing.ts the-connection-key-frontend-1:/app/pages/api/agents/marketing.ts && \
[ ! -f .env ] && touch .env && \
if ! grep -q '^MCP_SERVER_URL=' .env; then echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env; else sed -i 's|^MCP_SERVER_URL=.*|MCP_SERVER_URL=http://138.199.237.34:7000|' .env; fi && \
docker compose restart frontend && \
echo "✅ Installation abgeschlossen!"
```

