#!/bin/bash
# Vollständiges MCP Setup mit allen Agenten
# Marketing, Automation, Sales, Social-YouTube

set -e

MCP_DIR="/opt/mcp"
AGENT_DIR="/opt/ck-agent"
SERVER_IP="138.199.237.34"

echo "🚀 MCP Multi-Agent System - Vollständiges Setup"
echo "================================================"
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

# 3. MCP Server installieren
echo "📦 Installiere MCP Server..."
cd $MCP_DIR
if [ ! -f "package.json" ]; then
    npm init -y
    npm install @modelcontextprotocol/server
    echo "✅ MCP Server installiert"
else
    echo "✅ MCP Server bereits installiert"
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

# Marketing
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

# Automation
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

# Sales
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

# Social-YouTube
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

# 9. MCP Server.js erstellen
echo "🔧 Erstelle MCP Server..."
cat > $MCP_DIR/server.js << 'SERVER_END'
const MCP = require("@modelcontextprotocol/server");
const config = require("./mcp.config.json");

MCP.start(config).then(() => {
  console.log("✅ MCP läuft auf Port " + config.port);
  console.log("📡 Verfügbare Agenten:");
  config.agents.forEach(agent => {
    console.log("   - " + agent.id);
  });
}).catch((error) => {
  console.error("❌ MCP Fehler:", error);
  process.exit(1);
});
SERVER_END

echo "✅ MCP Server.js erstellt"
echo ""

# 10. MCP Konfiguration
echo "⚙️  Erstelle MCP Konfiguration..."
cat > $MCP_DIR/mcp.config.json << 'CONFIG_END'
{
  "host": "0.0.0.0",
  "port": 7000,
  "agents": [
    {
      "id": "marketing",
      "file": "/opt/ck-agent/agents/marketing.json"
    },
    {
      "id": "automation",
      "file": "/opt/ck-agent/agents/automation.json"
    },
    {
      "id": "sales",
      "file": "/opt/ck-agent/agents/sales.json"
    },
    {
      "id": "social-youtube",
      "file": "/opt/ck-agent/agents/social-youtube.json"
    }
  ]
}
CONFIG_END

echo "✅ MCP Konfiguration erstellt"
echo ""

# 11. Systemdienst erstellen
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

# 12. Berechtigungen setzen
echo "🔐 Setze Berechtigungen..."
chown -R root:root $MCP_DIR
chown -R root:root $AGENT_DIR
chmod -R 755 $MCP_DIR
chmod -R 755 $AGENT_DIR
echo "✅ Berechtigungen gesetzt"
echo ""

# 13. MCP starten
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

# 14. Zusammenfassung
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
echo "   - Status: systemctl status mcp"
echo ""
echo "🧪 Testen:"
echo "   curl -X POST http://$SERVER_IP:7000/agent/marketing \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\":\"Gib mir 3 Hooks für ein Reel\"}'"
echo ""
echo "🎉 Fertig!"
echo ""

