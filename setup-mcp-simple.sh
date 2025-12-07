#!/bin/bash
# MCP Multi-Agent System Setup (mit Express Server)

set -e

MCP_DIR="/opt/mcp"
AGENT_DIR="/opt/ck-agent"
SERVER_IP="138.199.237.34"

echo "🚀 MCP Multi-Agent System - Setup"
echo "=================================="
echo ""

# 1. Node.js prüfen/installieren
echo "📦 Prüfe Node.js..."
if ! command -v node &> /dev/null; then
    echo "   Node.js wird installiert..."
    apt update
    apt install -y nodejs npm
else
    echo "✅ Node.js bereits installiert: $(node --version)"
fi
echo ""

# 2. Verzeichnisse erstellen
echo "📁 Erstelle Verzeichnisse..."
mkdir -p $MCP_DIR
mkdir -p $AGENT_DIR/agents
mkdir -p $AGENT_DIR/prompts
echo "✅ Verzeichnisse erstellt"
echo ""

# 3. Express Server installieren
echo "📦 Installiere Express Server..."
cd $MCP_DIR
if [ ! -f "package.json" ]; then
    npm init -y
    npm install express axios
    echo "✅ Express Server installiert"
else
    echo "✅ Express Server bereits installiert"
    npm install express axios 2>/dev/null || true
fi
echo ""

# 4. Marketing-Agent Prompt
echo "📝 Erstelle Marketing-Agent Prompt..."
cat > $AGENT_DIR/prompts/marketing.txt << 'PROMPT_END'
Du bist der Marketing & Growth Agent.

Deine Spezialgebiete:
- Marketingstrategien
- Reels & Social Media Content
- Newsletter & E-Mail-Marketing
- Funnels & Sales-Funnels
- Salescopy & Werbetexte
- Content-Marketing
- Growth-Hacking
- Brand-Entwicklung

Deine Arbeitsweise:
1. ANALYSE: Zielgruppe, Markt, Wettbewerb
2. STRATEGIE: Klare Marketing-Strategie entwickeln
3. KREATION: Vollständigen Content erstellen
4. OPTIMIERUNG: Conversion & Engagement optimieren

Stil:
- Authentisch
- Wertvoll
- Klar & direkt
- Ergebnisfokussiert

Sprache: Deutsch
PROMPT_END
echo "✅ Marketing-Agent Prompt erstellt"
echo ""

# 5. Automation-Agent Prompt
echo "📝 Erstelle Automation-Agent Prompt..."
cat > $AGENT_DIR/prompts/automation.txt << 'PROMPT_END'
Du bist der Automation & Tech Agent.

Du bist spezialisiert auf:
- n8n Workflows
- Zapier & Make
- Mailchimp Integrationen
- Webhooks & APIs
- JSON-Transformationen
- Serverkonfiguration
- Supabase
- Next.js Backend-Flows
- Docker & Deployment

Deine Aufgaben:
- Optimierung von Prozessen
- Erstellung von n8n-Flows
- Erstellung von API-Routen
- Debugging & Fehlerbehebung
- Konzeption technischer Systeme
- Planung von Automatisierungen

Sprache:
- Deutsch
- Technisch, präzise, lösungsorientiert
- Konkrete Schritte, keine Theorie
- Code-Beispiele wenn nötig
PROMPT_END
echo "✅ Automation-Agent Prompt erstellt"
echo ""

# 6. Sales-Agent Prompt
echo "📝 Erstelle Sales-Agent Prompt..."
cat > $AGENT_DIR/prompts/sales.txt << 'PROMPT_END'
Du bist der Sales & Conversion Agent.

Schwerpunkte:
- Verkaufspsychologie
- Buyer Journey
- Storyselling
- Closing-Techniken
- Funnel-Analyse
- Conversion-Optimierung
- Argumentation
- NLP & Energetik im Verkauf
- Human Design in Verkaufsprozessen

Stil:
- direkt
- kraftvoll
- klar
- 100% ergebnisorientiert
- emotional intelligent
- kein Druck, aber Klarheit

Aufgaben:
- Optimiert Funnels
- Schreibt Salespages
- Erzeugt CTAs
- Baut Einwandbehandlung ein
- Strukturiert Verkaufs-E-Mails
- Definiert Verkaufs-Frameworks

Sprache: Deutsch
PROMPT_END
echo "✅ Sales-Agent Prompt erstellt"
echo ""

# 7. Social-YouTube-Agent Prompt
echo "📝 Erstelle Social-YouTube-Agent Prompt..."
cat > $AGENT_DIR/prompts/social-youtube.txt << 'PROMPT_END'
Du bist der Social Media & YouTube Content Agent.

Deine Spezialgebiete:

🎬 YouTube:
- Video-Skripte (Hook, Problem, Story, Lösung, CTA)
- Thumbnail-Ideen mit hoher Klickrate
- SEO-optimierte Titel & Beschreibungen
- Tags & Keywords für maximale Reichweite
- Video-Ideen basierend auf Trends
- Struktur für verschiedene Video-Formate

📱 Social Media (Instagram, TikTok, LinkedIn):
- Reels-Skripte (Hook, Content, CTA)
- Instagram-Posts & Captions
- Carousel-Posts mit klarer Struktur
- Story-Ideen
- Hashtag-Strategien
- Engagement-optimierte Captions

🎯 Deine Arbeitsweise:
1. ANALYSE: Verstehe Zielgruppe, Thema, Plattform
2. STRUKTUR: Erstelle klare Content-Struktur
3. KREATION: Generiere vollständigen Content
4. OPTIMIERUNG: SEO, Hashtags, Keywords, CTAs
5. FORMAT: Plattform-spezifisch optimiert

Sprache: Deutsch
PROMPT_END
echo "✅ Social-YouTube-Agent Prompt erstellt"
echo ""

# 8. Agent Configs erstellen
echo "⚙️  Erstelle Agent-Konfigurationen..."

cat > $AGENT_DIR/agents/marketing.json << 'JSON_END'
{
  "id": "marketing",
  "name": "Marketing & Growth Agent",
  "description": "Erstellt Marketingstrategien, Reels, Newsletter, Funnels und Salescopy.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/marketing.txt",
  "model": "gpt-4",
  "temperature": 0.7,
  "maxTokens": 5000
}
JSON_END

cat > $AGENT_DIR/agents/automation.json << 'JSON_END'
{
  "id": "automation",
  "name": "Automation Agent",
  "description": "Erstellt n8n-Flows, API-Strukturen, Webhooks, Integrationen und technische Prozesse.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/automation.txt",
  "model": "gpt-4",
  "temperature": 0.2,
  "maxTokens": 6000
}
JSON_END

cat > $AGENT_DIR/agents/sales.json << 'JSON_END'
{
  "id": "sales",
  "name": "Sales Agent",
  "description": "Experte für Verkaufstexte, Funnels, Buyer Journey, Closing und Verkaufspsychologie.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/sales.txt",
  "model": "gpt-4",
  "temperature": 0.6,
  "maxTokens": 6000
}
JSON_END

cat > $AGENT_DIR/agents/social-youtube.json << 'JSON_END'
{
  "id": "social-youtube",
  "name": "Social Media & YouTube Agent",
  "description": "Erstellt YouTube-Video-Skripte, Reels, Posts, Captions, Thumbnail-Ideen und Social-Media-Content.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/social-youtube.txt",
  "model": "gpt-4",
  "temperature": 0.7,
  "maxTokens": 6000
}
JSON_END

echo "✅ Agent-Konfigurationen erstellt"
echo ""

# 9. MCP Server.js erstellen (Express Server)
echo "🔧 Erstelle MCP Server (Express)..."
cat > $MCP_DIR/server.js << 'SERVER_END'
const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = 7000;
const AGENT_DIR = '/opt/ck-agent';

app.use(express.json());

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
  res.json({ status: 'ok', port: PORT });
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
        description: config.description
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

  const prompt = loadPrompt(agentConfig.promptFile);
  if (!prompt) {
    return res.status(500).json({ error: 'Prompt file not found' });
  }

  // Hier würde normalerweise OpenAI API aufgerufen werden
  // Für jetzt geben wir eine einfache Antwort zurück
  const response = {
    agent: agentConfig.id,
    message: message,
    prompt: prompt.substring(0, 200) + '...',
    note: 'OpenAI API Integration erforderlich. Siehe .env für OPENAI_API_KEY'
  };

  res.json(response);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ MCP Server läuft auf Port ${PORT}`);
  console.log(`📡 Verfügbare Endpunkte:`);
  console.log(`   - GET  /health`);
  console.log(`   - GET  /agents`);
  console.log(`   - POST /agent/:agentId`);
});
SERVER_END

echo "✅ MCP Server.js erstellt"
echo ""

# 10. Systemdienst erstellen
echo "🔄 Erstelle Systemdienst..."
cat > /etc/systemd/system/mcp.service << 'SERVICE_END'
[Unit]
Description=MCP Multi-Agent Server
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/node /opt/mcp/server.js
Restart=always
RestartSec=10
User=root
Environment=NODE_ENV=production
WorkingDirectory=/opt/mcp

[Install]
WantedBy=multi-user.target
SERVICE_END

systemctl daemon-reload
systemctl enable mcp
echo "✅ Systemdienst erstellt"
echo ""

# 11. Berechtigungen setzen
echo "🔐 Setze Berechtigungen..."
chown -R root:root $MCP_DIR
chown -R root:root $AGENT_DIR
chmod -R 755 $MCP_DIR
chmod -R 755 $AGENT_DIR
echo "✅ Berechtigungen gesetzt"
echo ""

# 12. MCP starten
echo "🚀 Starte MCP Server..."
systemctl start mcp
sleep 3

# Status prüfen
if systemctl is-active --quiet mcp; then
    echo "✅ MCP läuft!"
else
    echo "⚠️  MCP Status unklar, prüfe: systemctl status mcp"
fi
echo ""

# 13. Zusammenfassung
echo "================================================"
echo "✅ MCP Multi-Agent System Setup abgeschlossen!"
echo ""
echo "📁 Verzeichnisse:"
echo "   - MCP: $MCP_DIR"
echo "   - Agenten: $AGENT_DIR"
echo ""
echo "🤖 Verfügbare Agenten:"
echo "   1. Marketing Agent"
echo "   2. Automation Agent"
echo "   3. Sales Agent"
echo "   4. Social-YouTube Agent"
echo ""
echo "🌐 MCP Server:"
echo "   - URL: http://$SERVER_IP:7000"
echo "   - Health: http://$SERVER_IP:7000/health"
echo "   - Agents: http://$SERVER_IP:7000/agents"
echo "   - Status: systemctl status mcp"
echo ""
echo "🧪 Testen:"
echo "   curl http://$SERVER_IP:7000/health"
echo "   curl http://$SERVER_IP:7000/agents"
echo ""
echo "🎉 Fertig!"
echo ""
