#!/bin/bash
# Startet den Reading Agent mit korrekter Konfiguration

set -e

cd /opt/mcp-connection-key

echo "🚀 Starte Reading Agent..."
echo "=========================="
echo ""

# 1. Setze AGENT_SECRET (falls nicht gesetzt)
if ! grep -q "^AGENT_SECRET=" production/.env || grep -q "^AGENT_SECRET=$" production/.env; then
    echo "🔐 Generiere AGENT_SECRET..."
    NEW_SECRET=$(openssl rand -hex 32)
    sed -i '/^AGENT_SECRET=/d' production/.env
    echo "AGENT_SECRET=$NEW_SECRET" >> production/.env
    echo "✅ AGENT_SECRET gesetzt"
fi

# 2. Prüfe Port - Port 4000 wird von chatgpt-agent verwendet!
# Ändere auf Port 4001 für Reading Agent
if grep -q "^MCP_PORT=4000" production/.env; then
    echo "⚠️  Port 4000 wird bereits von chatgpt-agent verwendet"
    echo "🔄 Ändere MCP_PORT auf 4001..."
    sed -i 's/^MCP_PORT=4000/MCP_PORT=4001/' production/.env
    echo "✅ MCP_PORT auf 4001 geändert"
fi

# 3. Prüfe Konfiguration
echo ""
echo "📋 Aktuelle Konfiguration:"
grep -E "^(OPENAI_API_KEY|AGENT_SECRET|MCP_PORT)=" production/.env | sed 's/OPENAI_API_KEY=.*/OPENAI_API_KEY=sk-proj-.../' | sed 's/AGENT_SECRET=.*/AGENT_SECRET=***/'
echo ""

# 4. Installiere Dependencies (falls noch nicht geschehen)
cd production
if [ ! -d "node_modules" ]; then
    echo "📦 Installiere Dependencies..."
    npm install
fi

# 5. Stoppe alten Agent (falls vorhanden)
if pm2 list | grep -q "reading-agent"; then
    echo "🛑 Stoppe alten reading-agent..."
    pm2 delete reading-agent || true
fi

# 6. Starte Agent
echo "🚀 Starte Reading Agent..."
chmod +x start.sh
./start.sh

# 7. Warte kurz
sleep 3

# 8. Prüfe Status
echo ""
echo "📊 PM2 Status:"
pm2 status reading-agent

# 9. Prüfe Health (mit neuem Port)
MCP_PORT=$(grep "^MCP_PORT=" ../production/.env | cut -d= -f2)
echo ""
echo "🏥 Health Check (Port $MCP_PORT):"
curl -s http://localhost:$MCP_PORT/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:$MCP_PORT/health
echo ""

echo "✅ Reading Agent sollte jetzt laufen!"
echo ""

