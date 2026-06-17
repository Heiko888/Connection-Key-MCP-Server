#!/bin/bash
# Fix MCP Server ES Module Problem

set -e

SERVER_DIR="/opt/mcp-connection-key"

echo "🔧 Fixe MCP Server ES Module Problem..."
echo ""

cd "$SERVER_DIR"

# Erstelle server.js mit ES Module Syntax
cat > server.js << 'EOF'
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, '.env') });

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

echo "✅ server.js mit ES Module Syntax erstellt"
echo ""

# Prüfe package.json
if [ -f "package.json" ]; then
  # Prüfe ob "type": "module" vorhanden ist
  if grep -q '"type": "module"' package.json; then
    echo "✅ package.json hat bereits 'type: module'"
  else
    echo "📝 Füge 'type: module' zu package.json hinzu..."
    # Backup erstellen
    cp package.json package.json.backup
    # type: module hinzufügen (falls nicht vorhanden)
    node -e "const pkg = require('./package.json'); pkg.type = 'module'; require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));"
    echo "✅ package.json aktualisiert"
  fi
else
  echo "⚠️  package.json nicht gefunden, erstelle es..."
  npm init -y
  node -e "const pkg = require('./package.json'); pkg.type = 'module'; require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));"
  echo "✅ package.json erstellt mit 'type: module'"
fi

echo ""
echo "✅ MCP Server gefixt!"
echo ""
echo "Nächste Schritte:"
echo "1. Service neu starten: systemctl restart mcp"
echo "2. Status prüfen: systemctl status mcp"
echo "3. Health Check: curl http://localhost:7000/health"
echo ""

