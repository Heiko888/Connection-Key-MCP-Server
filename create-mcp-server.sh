#!/bin/bash
# Erstellt MCP Server auf dem Server

set -e

SERVER_DIR="/opt/mcp-connection-key"
AGENT_DIR="/opt/ck-agent"

echo "🔧 Erstelle MCP Server..."
echo ""

cd "$SERVER_DIR"

# Erstelle server.js
cat > server.js << 'EOF'
const express = require('express');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = 7000;
const AGENT_DIR = '/opt/ck-agent';

app.use(express.json());

// CORS aktivieren
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

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
  res.json({ status: 'ok', port: PORT, service: 'mcp-server' });
});

// Liste aller Agenten
app.get('/agents', (req, res) => {
  try {
    const agentsDir = path.join(AGENT_DIR, 'agents');
    if (!fs.existsSync(agentsDir)) {
      return res.json({ agents: [] });
    }
    const files = fs.readdirSync(agentsDir);
    const agents = files
      .filter(f => f.endsWith('.json'))
      .map(f => {
        try {
          const config = JSON.parse(fs.readFileSync(path.join(agentsDir, f), 'utf8'));
          return {
            id: config.id,
            name: config.name,
            description: config.description
          };
        } catch (e) {
          return null;
        }
      })
      .filter(a => a !== null);
    res.json({ agents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agent ansprechen
app.post('/agent/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Lade Agent-Konfiguration
    const config = loadAgentConfig(agentId);
    if (!config) {
      return res.status(404).json({ error: `Agent ${agentId} not found` });
    }

    // Lade Prompt
    const promptFile = config.promptFile || path.join(AGENT_DIR, 'prompts', `${agentId}.txt`);
    const systemPrompt = loadPrompt(promptFile);

    if (!systemPrompt) {
      return res.status(500).json({ error: `Prompt file not found for agent ${agentId}` });
    }

    // OpenAI Client initialisieren
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY not set' });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // OpenAI API aufrufen
    const completion = await openai.chat.completions.create({
      model: config.model || 'gpt-4',
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
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 2000
    });

    const response = completion.choices[0].message.content;

    res.json({
      success: true,
      agentId,
      response,
      tokens: completion.usage.total_tokens,
      model: config.model || 'gpt-4'
    });

  } catch (error) {
    console.error('Agent Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Server starten
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ MCP Server läuft auf Port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/health`);
  console.log(`📋 Agenten: http://localhost:${PORT}/agents`);
});
EOF

echo "✅ server.js erstellt"
echo ""

# Prüfe ob package.json existiert
if [ ! -f "package.json" ]; then
  echo "📦 Erstelle package.json..."
  npm init -y
  echo "✅ package.json erstellt"
else
  echo "✅ package.json vorhanden"
fi

# Installiere Dependencies
echo ""
echo "📦 Installiere Dependencies..."
npm install express dotenv openai --save
echo "✅ Dependencies installiert"
echo ""

# Prüfe ob .env existiert
if [ ! -f ".env" ]; then
  echo "⚠️  .env Datei nicht gefunden!"
  echo "   Bitte erstelle .env mit OPENAI_API_KEY"
else
  echo "✅ .env Datei vorhanden"
fi

echo ""
echo "✅ MCP Server erstellt!"
echo ""
echo "Nächste Schritte:"
echo "1. Service neu laden: systemctl daemon-reload"
echo "2. Service starten: systemctl restart mcp"
echo "3. Status prüfen: systemctl status mcp"
echo "4. Health Check: curl http://localhost:7000/health"
echo ""

