#!/bin/bash

# Script zum Installieren der Marketing Agent API-Route

echo "🔧 Installiere Marketing Agent API-Route..."
echo ""

CONTAINER_NAME="the-connection-key-frontend-1"
PROJECT_DIR="/opt/hd-app/The-Connection-Key"

cd "$PROJECT_DIR" || exit 1

# 1. API-Route erstellen
echo "📝 Erstelle API-Route..."
docker exec "$CONTAINER_NAME" mkdir -p /app/pages/api/agents

# API-Route Inhalt
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
  // Nur POST erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { message, userId } = req.body;

    // Validierung
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'message is required and must be a string'
      });
    }

    // Marketing Agent aufrufen
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

    // Erfolgreiche Antwort
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

# Datei in Container kopieren
docker cp /tmp/agents-marketing.ts "$CONTAINER_NAME:/app/pages/api/agents/marketing.ts"
echo "   ✅ API-Route erstellt"

# 2. MCP_SERVER_URL in .env setzen
echo ""
echo "📝 Setze MCP_SERVER_URL..."
if ! grep -q '^MCP_SERVER_URL=' .env; then
    echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env
    echo "   ✅ MCP_SERVER_URL hinzugefügt"
else
    sed -i 's|^MCP_SERVER_URL=.*|MCP_SERVER_URL=http://138.199.237.34:7000|' .env
    echo "   ✅ MCP_SERVER_URL aktualisiert"
fi
grep MCP_SERVER_URL .env

# 3. Container neu starten
echo ""
echo "🔄 Starte Container neu..."
docker compose restart frontend
sleep 5

# 4. Prüfe Umgebungsvariable
echo ""
echo "📋 Prüfe Umgebungsvariable im Container..."
docker exec "$CONTAINER_NAME" env | grep MCP_SERVER_URL || echo "   ⚠️  MCP_SERVER_URL nicht gefunden"

# 5. Prüfe API-Route
echo ""
echo "📋 Prüfe API-Route..."
docker exec "$CONTAINER_NAME" ls -la /app/pages/api/agents/marketing.ts && echo "   ✅ API-Route vorhanden" || echo "   ❌ API-Route fehlt"

echo ""
echo "✅ Installation abgeschlossen!"
echo ""
echo "🧪 Test:"
echo "   curl -X POST http://localhost:3000/api/agents/marketing \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\":\"Test\"}'"

