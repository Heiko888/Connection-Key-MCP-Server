#!/bin/bash
# Installiere alle Agent API-Routes auf CK-App Server
# Führen Sie dieses Script auf dem CK-App Server aus: /opt/hd-app/The-Connection-Key/frontend

set -e

FRONTEND_DIR="/opt/hd-app/The-Connection-Key/frontend"
API_DIR="$FRONTEND_DIR/pages/api/agents"

echo "🚀 Installiere Agent API-Routes auf CK-App Server"
echo "=================================================="
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

# 1. Marketing Agent API-Route
echo "1. Erstelle Marketing Agent API-Route..."
cat > "$API_DIR/marketing.ts" << 'MARKETING_END'
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
MARKETING_END
echo "   ✅ Marketing Agent API-Route erstellt"
echo ""

# 2. Automation Agent API-Route
echo "2. Erstelle Automation Agent API-Route..."
cat > "$API_DIR/automation.ts" << 'AUTOMATION_END'
/**
 * API Route für Automation Agent
 * Route: /api/agents/automation
 */

import type { NextApiRequest, NextApiResponse } from 'next';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const AGENT_ID = 'automation';

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
    console.error('Automation Agent API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      agent: AGENT_ID
    });
  }
}
AUTOMATION_END
echo "   ✅ Automation Agent API-Route erstellt"
echo ""

# 3. Sales Agent API-Route
echo "3. Erstelle Sales Agent API-Route..."
cat > "$API_DIR/sales.ts" << 'SALES_END'
/**
 * API Route für Sales Agent
 * Route: /api/agents/sales
 */

import type { NextApiRequest, NextApiResponse } from 'next';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const AGENT_ID = 'sales';

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
    console.error('Sales Agent API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      agent: AGENT_ID
    });
  }
}
SALES_END
echo "   ✅ Sales Agent API-Route erstellt"
echo ""

# 4. Social-YouTube Agent API-Route
echo "4. Erstelle Social-YouTube Agent API-Route..."
cat > "$API_DIR/social-youtube.ts" << 'SOCIAL_END'
/**
 * API Route für Social-YouTube Agent
 * Route: /api/agents/social-youtube
 */

import type { NextApiRequest, NextApiResponse } from 'next';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const AGENT_ID = 'social-youtube';

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
    console.error('Social-YouTube Agent API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      agent: AGENT_ID
    });
  }
}
SOCIAL_END
echo "   ✅ Social-YouTube Agent API-Route erstellt"
echo ""

# 5. Prüfe Environment Variables
echo "5. Prüfe Environment Variables..."
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

# 6. Berechtigungen setzen
echo "6. Setze Berechtigungen..."
chmod 644 "$API_DIR"/*.ts
echo "   ✅ Berechtigungen gesetzt"
echo ""

# 7. Zusammenfassung
echo "=================================================="
echo "✅ Installation abgeschlossen!"
echo "=================================================="
echo ""
echo "📋 Erstellte API-Routes:"
echo "   ✅ /api/agents/marketing"
echo "   ✅ /api/agents/automation"
echo "   ✅ /api/agents/sales"
echo "   ✅ /api/agents/social-youtube"
echo ""
echo "📁 Dateien erstellt in: $API_DIR"
echo ""
echo "🔄 Nächste Schritte:"
echo "   1. Next.js App neu starten:"
echo "      docker restart the-connection-key-frontend-1"
echo "      ODER"
echo "      pm2 restart next-app"
echo ""
echo "   2. Testen:"
echo "      curl -X POST http://localhost:3000/api/agents/marketing \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"message\": \"Test\"}'"
echo ""

