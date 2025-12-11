#!/bin/bash
# Startet den Reading Agent (Agent #5) auf Port 4001

set -e

cd /opt/mcp-connection-key

echo "🚀 Starte Reading Agent (Agent #5)..."
echo "====================================="
echo ""

# 1. Prüfe ob production/.env existiert
if [ ! -f "production/.env" ]; then
    echo "📋 Erstelle production/.env..."
    cp production/env.example production/.env
    chmod 600 production/.env
fi

# 2. Setze OPENAI_API_KEY (falls nicht gesetzt)
if ! grep -q "^OPENAI_API_KEY=" production/.env || grep -q "^OPENAI_API_KEY=$" production/.env; then
    echo "🔐 Setze OPENAI_API_KEY..."
    sed -i '/^OPENAI_API_KEY=/d' production/.env
    echo "OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE" >> production/.env
fi

# 3. Setze AGENT_SECRET (falls nicht gesetzt)
if ! grep -q "^AGENT_SECRET=" production/.env || grep -q "^AGENT_SECRET=$" production/.env; then
    echo "🔐 Generiere AGENT_SECRET..."
    NEW_SECRET=$(openssl rand -hex 32)
    sed -i '/^AGENT_SECRET=/d' production/.env
    echo "AGENT_SECRET=$NEW_SECRET" >> production/.env
    echo "✅ AGENT_SECRET gesetzt"
fi

# 4. Setze Port auf 4001 (da 4000 von chatgpt-agent verwendet wird)
echo "🔧 Setze MCP_PORT auf 4001..."
sed -i '/^MCP_PORT=/d' production/.env
echo "MCP_PORT=4001" >> production/.env

# 5. Prüfe andere Einstellungen
if ! grep -q "^KNOWLEDGE_PATH=" production/.env; then
    echo "KNOWLEDGE_PATH=./production/knowledge" >> production/.env
fi

if ! grep -q "^TEMPLATE_PATH=" production/.env; then
    echo "TEMPLATE_PATH=./production/templates" >> production/.env
fi

if ! grep -q "^LOGS_PATH=" production/.env; then
    echo "LOGS_PATH=./production/logs" >> production/.env
fi

# 6. Zeige Konfiguration
echo ""
echo "📋 Aktuelle Konfiguration:"
grep -E "^(OPENAI_API_KEY|AGENT_SECRET|MCP_PORT|KNOWLEDGE_PATH|TEMPLATE_PATH|LOGS_PATH)=" production/.env | sed 's/OPENAI_API_KEY=.*/OPENAI_API_KEY=sk-proj-.../' | sed 's/AGENT_SECRET=.*/AGENT_SECRET=***/'
echo ""

# 7. Installiere Dependencies
cd production
if [ ! -d "node_modules" ]; then
    echo "📦 Installiere Dependencies..."
    npm install
else
    echo "✅ Dependencies bereits installiert"
fi

# 8. Stoppe alten Agent (falls vorhanden)
if pm2 list | grep -q "reading-agent"; then
    echo "🛑 Stoppe alten reading-agent..."
    pm2 delete reading-agent || true
fi

# 9. Starte Agent
echo ""
echo "🚀 Starte Reading Agent..."
chmod +x start.sh
./start.sh

# 10. Warte kurz
sleep 3

# 11. Prüfe Status
echo ""
echo "📊 PM2 Status:"
pm2 status reading-agent

# 12. Prüfe Health
echo ""
echo "🏥 Health Check (Port 4001):"
curl -s http://localhost:4001/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:4001/health
echo ""

echo "====================================="
echo "✅ Reading Agent (Agent #5) gestartet!"
echo ""
echo "📡 Endpoints:"
echo "   - Health: http://localhost:4001/health"
echo "   - Generate Reading: POST http://localhost:4001/reading/generate"
echo ""
echo "📊 Alle 5 Agenten:"
echo "   1. ✅ Marketing Agent (MCP Server, Port 7000)"
echo "   2. ✅ Automation Agent (MCP Server, Port 7000)"
echo "   3. ✅ Sales Agent (MCP Server, Port 7000)"
echo "   4. ✅ Social-YouTube Agent (MCP Server, Port 7000)"
echo "   5. ✅ Reading Agent (Production Server, Port 4001)"
echo ""

