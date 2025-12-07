#!/bin/bash
# OpenAI Integration für MCP Server

set -e

MCP_DIR="/opt/mcp"
CONNECTION_KEY_DIR="/opt/mcp-connection-key"

echo "🤖 OpenAI Integration für MCP Server"
echo "===================================="
echo ""

# 1. OpenAI Package installieren
echo "📦 Installiere OpenAI Package..."
cd $MCP_DIR
npm install openai dotenv
echo "✅ OpenAI Package installiert"
echo ""

# 2. Prüfe OPENAI_API_KEY
echo "🔐 Prüfe OPENAI_API_KEY..."
if [ -f "$CONNECTION_KEY_DIR/.env" ]; then
    if grep -q "OPENAI_API_KEY=" "$CONNECTION_KEY_DIR/.env"; then
        OPENAI_KEY=$(grep "OPENAI_API_KEY=" "$CONNECTION_KEY_DIR/.env" | cut -d= -f2)
        if [ ! -z "$OPENAI_KEY" ] && [ "$OPENAI_KEY" != "" ]; then
            echo "✅ OPENAI_API_KEY gefunden in .env"
        else
            echo "⚠️  OPENAI_API_KEY ist leer in .env"
            echo "   Bitte setzen Sie OPENAI_API_KEY in $CONNECTION_KEY_DIR/.env"
        fi
    else
        echo "⚠️  OPENAI_API_KEY nicht in .env gefunden"
        echo "   Bitte fügen Sie hinzu: OPENAI_API_KEY=your-key-here"
    fi
else
    echo "⚠️  .env Datei nicht gefunden"
fi
echo ""

# 3. Server.js mit OpenAI Integration aktualisieren
echo "🔧 Aktualisiere Server.js mit OpenAI Integration..."
cat > $MCP_DIR/server.js << 'SERVER_END'
const express = require('express');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config({ path: '/opt/mcp-connection-key/.env' });

const app = express();
const PORT = 7000;
const AGENT_DIR = '/opt/ck-agent';

app.use(express.json());

// OpenAI Client initialisieren
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log('✅ OpenAI Client initialisiert');
} else {
  console.log('⚠️  OPENAI_API_KEY nicht gefunden - Agenten werden ohne KI arbeiten');
}

// Lade Agent-Konfiguration
function loadAgentConfig(agentId) {
  const configPath = path.join(AGENT_DIR, 'agents', `${agentId}.json`);
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  return null;
}

// Lade Prompt
function loadPrompt(promptFile) {
  if (fs.existsSync(promptFile)) {
    return fs.readFileSync(promptFile, 'utf8');
  }
  return null;
}

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    port: PORT,
    openai: openai ? 'configured' : 'not configured'
  });
});

// Liste aller Agenten
app.get('/agents', (req, res) => {
  const agentsDir = path.join(AGENT_DIR, 'agents');
  const files = fs.readdirSync(agentsDir);
  const agents = files
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const config = JSON.parse(fs.readFileSync(path.join(agentsDir, f), 'utf8'));
      return {
        id: config.id,
        name: config.name,
        description: config.description || ''
      };
    });
  res.json({ agents });
});

// Agent ansprechen
app.post('/agent/:agentId', async (req, res) => {
  const { agentId } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const agentConfig = loadAgentConfig(agentId);
  if (!agentConfig) {
    return res.status(404).json({ error: `Agent ${agentId} not found` });
  }

  const systemPrompt = loadPrompt(agentConfig.promptFile);
  if (!systemPrompt) {
    return res.status(500).json({ error: 'Prompt file not found' });
  }

  // Wenn OpenAI nicht konfiguriert, gebe Platzhalter zurück
  if (!openai) {
    return res.json({
      agent: agentConfig.id,
      message: message,
      response: '⚠️ OpenAI API Key nicht konfiguriert. Bitte setzen Sie OPENAI_API_KEY in .env',
      note: 'OpenAI Integration erforderlich'
    });
  }

  try {
    // OpenAI API aufrufen
    const completion = await openai.chat.completions.create({
      model: agentConfig.model || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: agentConfig.temperature || 0.7,
      max_tokens: agentConfig.maxTokens || 2000
    });

    const response = completion.choices[0].message.content;

    res.json({
      agent: agentConfig.id,
      message: message,
      response: response,
      model: agentConfig.model || 'gpt-4',
      tokens: completion.usage.total_tokens
    });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({
      error: 'OpenAI API Fehler',
      message: error.message
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ MCP Server läuft auf Port ${PORT}`);
  console.log(`📡 Verfügbare Endpunkte:`);
  console.log(`   - GET  /health`);
  console.log(`   - GET  /agents`);
  console.log(`   - POST /agent/:agentId`);
  if (openai) {
    console.log(`   - OpenAI: ✅ Konfiguriert`);
  } else {
    console.log(`   - OpenAI: ⚠️  Nicht konfiguriert`);
  }
});
SERVER_END

echo "✅ Server.js aktualisiert"
echo ""

# 4. MCP neu starten
echo "🔄 Starte MCP Server neu..."
systemctl restart mcp
sleep 3

# Status prüfen
if systemctl is-active --quiet mcp; then
    echo "✅ MCP läuft mit OpenAI Integration!"
else
    echo "⚠️  MCP Status unklar, prüfe: systemctl status mcp"
    echo "   Logs: journalctl -u mcp -n 20"
fi
echo ""

# 5. Test
echo "🧪 Test OpenAI Integration..."
echo ""
echo "Führen Sie aus:"
echo "  curl -X POST http://138.199.237.34:7000/agent/marketing \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"message\":\"Gib mir 3 Hooks für ein Reel über Manifestation\"}'"
echo ""

echo "===================================="
echo "✅ OpenAI Integration abgeschlossen!"
echo ""
echo "📝 Wichtig:"
echo "   - OPENAI_API_KEY muss in /opt/mcp-connection-key/.env gesetzt sein"
echo "   - Prüfen Sie: grep OPENAI_API_KEY /opt/mcp-connection-key/.env"
echo ""
echo "🎉 Fertig!"
echo ""

