#!/bin/bash
# Behebt die production/.env Konfiguration

set -e

cd /opt/mcp-connection-key

echo "🔧 Behebe production/.env Konfiguration..."
echo "========================================"
echo ""

# 1. Prüfe ob production/.env existiert
if [ ! -f "production/.env" ]; then
    echo "📋 Erstelle production/.env..."
    cp production/env.example production/.env
    chmod 600 production/.env
fi

# 2. Setze OPENAI_API_KEY
echo "🔐 Setze OPENAI_API_KEY..."
sed -i '/^OPENAI_API_KEY=/d' production/.env
echo "OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE" >> production/.env

# 3. Setze AGENT_SECRET
echo "🔐 Setze AGENT_SECRET..."
NEW_SECRET=$(openssl rand -hex 32)
sed -i '/^AGENT_SECRET=/d' production/.env
echo "AGENT_SECRET=$NEW_SECRET" >> production/.env

# 4. Setze MCP_PORT (falls nicht gesetzt)
if ! grep -q "^MCP_PORT=" production/.env; then
    sed -i '/^MCP_PORT=/d' production/.env
    echo "MCP_PORT=4000" >> production/.env
fi

# 5. Setze Pfade
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
echo "✅ Konfiguration abgeschlossen!"
echo ""
echo "📋 Aktuelle Konfiguration:"
grep -E "^(OPENAI_API_KEY|AGENT_SECRET|MCP_PORT|KNOWLEDGE_PATH|TEMPLATE_PATH|LOGS_PATH)=" production/.env | sed 's/OPENAI_API_KEY=.*/OPENAI_API_KEY=sk-proj-.../' | sed 's/AGENT_SECRET=.*/AGENT_SECRET=***/'
echo ""

