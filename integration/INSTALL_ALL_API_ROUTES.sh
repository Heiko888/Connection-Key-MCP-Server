#!/bin/bash
# Installiere ALLE fehlenden API-Routes auf CK-App Server
# Führen Sie dieses Script auf dem CK-App Server aus

set -e

FRONTEND_DIR="/opt/hd-app/The-Connection-Key/frontend"
API_DIR="$FRONTEND_DIR/pages/api/agents"

echo "🚀 Installiere ALLE Agent API-Routes"
echo "====================================="
echo ""

# Prüfe ob wir im richtigen Verzeichnis sind
if [ ! -f "$FRONTEND_DIR/package.json" ]; then
    echo "❌ Fehler: package.json nicht gefunden!"
    echo "   Bitte führen Sie dieses Script im Frontend-Verzeichnis aus"
    exit 1
fi

echo "✅ Frontend-Verzeichnis gefunden: $FRONTEND_DIR"
echo ""

# Erstelle API-Verzeichnis
echo "📁 Erstelle API-Verzeichnis..."
mkdir -p "$API_DIR"
echo "   ✅ Verzeichnis erstellt: $API_DIR"
echo ""

# Funktion zum Erstellen einer API-Route
create_api_route() {
    local AGENT_ID=$1
    local AGENT_NAME=$2
    local FILE="$API_DIR/$AGENT_ID.ts"
    
    echo "📝 Erstelle $AGENT_NAME Agent Route..."
    cat > "$FILE" << EOF
/**
 * API Route für $AGENT_NAME Agent
 * Route: /api/agents/$AGENT_ID
 */

import type { NextApiRequest, NextApiResponse } from 'next';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const AGENT_ID = '$AGENT_ID';

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

    const response = await fetch(\`\${MCP_SERVER_URL}/agent/\${AGENT_ID}\`, {
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
      throw new Error(\`Agent request failed: \${response.status} \${errorText}\`);
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
    console.error('$AGENT_NAME Agent API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      agent: AGENT_ID
    });
  }
}
EOF
    echo "   ✅ $AGENT_NAME Agent Route erstellt: $FILE"
}

# Erstelle alle fehlenden Routes
create_api_route "marketing" "Marketing"
create_api_route "automation" "Automation"
create_api_route "sales" "Sales"
create_api_route "social-youtube" "Social-YouTube"

echo ""

# Prüfe welche Routes jetzt existieren
echo "📋 Vorhandene API-Routes:"
ls -1 "$API_DIR"/*.ts 2>/dev/null | while read file; do
    echo "   ✅ $(basename $file)"
done
echo ""

# Prüfe Environment Variables
echo "🔍 Prüfe Environment Variables..."
ENV_FILE="$FRONTEND_DIR/.env.local"
if [ ! -f "$ENV_FILE" ]; then
    echo "   ⚠️  .env.local nicht gefunden, erstelle..."
    touch "$ENV_FILE"
fi

# MCP_SERVER_URL hinzufügen, falls nicht vorhanden
if ! grep -q "^MCP_SERVER_URL=" "$ENV_FILE"; then
    echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> "$ENV_FILE"
    echo "   ✅ MCP_SERVER_URL hinzugefügt"
else
    echo "   ✅ MCP_SERVER_URL bereits vorhanden"
fi

# READING_AGENT_URL hinzufügen, falls nicht vorhanden
if ! grep -q "^READING_AGENT_URL=" "$ENV_FILE"; then
    echo "READING_AGENT_URL=http://138.199.237.34:4001" >> "$ENV_FILE"
    echo "   ✅ READING_AGENT_URL hinzugefügt"
else
    echo "   ✅ READING_AGENT_URL bereits vorhanden"
fi
echo ""

# Berechtigungen setzen
echo "🔐 Setze Berechtigungen..."
chmod 644 "$API_DIR"/*.ts 2>/dev/null || true
echo "   ✅ Berechtigungen gesetzt"
echo ""

# Zusammenfassung
echo "====================================="
echo "✅ Installation abgeschlossen!"
echo "====================================="
echo ""
echo "📋 Erstellte API-Routes:"
echo "   ✅ /api/agents/marketing"
echo "   ✅ /api/agents/automation"
echo "   ✅ /api/agents/sales"
echo "   ✅ /api/agents/social-youtube"
echo ""
echo "🔄 Nächste Schritte:"
echo "   1. Next.js App neu starten:"
echo "      docker restart the-connection-key-frontend-1"
echo ""
echo "   2. Testen:"
echo "      curl -X POST http://localhost:3000/api/agents/marketing \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"message\": \"Test\"}'"
echo ""

