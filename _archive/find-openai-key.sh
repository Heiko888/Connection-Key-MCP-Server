#!/bin/bash
# Findet den OpenAI API Key auf dem Server

echo "🔍 Suche OpenAI API Key..."
echo "=========================="
echo ""

# Mögliche Orte
LOCATIONS=(
    "/opt/mcp-connection-key/.env"
    "/opt/mcp/.env"
    "/opt/ck-agent/.env"
    "/root/.env"
    "/home/*/.env"
    "/etc/environment"
)

FOUND=false

# 1. Prüfe Haupt-.env
if [ -f "/opt/mcp-connection-key/.env" ]; then
    echo "📁 Prüfe /opt/mcp-connection-key/.env..."
    if grep -q "OPENAI_API_KEY=" "/opt/mcp-connection-key/.env"; then
        KEY=$(grep "OPENAI_API_KEY=" "/opt/mcp-connection-key/.env" | cut -d= -f2 | tr -d '"' | tr -d "'" | xargs)
        if [ ! -z "$KEY" ] && [ "$KEY" != "" ]; then
            KEY_LENGTH=${#KEY}
            KEY_PREFIX="${KEY:0:7}"
            KEY_SUFFIX="${KEY: -4}"
            echo "✅ OPENAI_API_KEY gefunden!"
            echo "   Länge: $KEY_LENGTH Zeichen"
            echo "   Format: $KEY_PREFIX...$KEY_SUFFIX"
            echo ""
            echo "📋 Vollständiger Key:"
            echo "$KEY"
            FOUND=true
        else
            echo "   ⚠️  OPENAI_API_KEY ist leer"
        fi
    else
        echo "   ⚠️  OPENAI_API_KEY nicht gefunden"
    fi
else
    echo "   ⚠️  Datei existiert nicht"
fi
echo ""

# 2. Prüfe MCP Server Environment
if [ -f "/opt/mcp/server.js" ]; then
    echo "📁 Prüfe MCP Server Konfiguration..."
    if grep -q "OPENAI_API_KEY" "/opt/mcp/server.js"; then
        echo "   ✅ MCP Server verwendet OPENAI_API_KEY"
        if grep -q "/opt/mcp-connection-key/.env" "/opt/mcp/server.js"; then
            echo "   📍 Liest aus: /opt/mcp-connection-key/.env"
        fi
    fi
fi
echo ""

# 3. Prüfe ob MCP Server läuft und Key verwendet
if systemctl is-active --quiet mcp 2>/dev/null; then
    echo "📡 Prüfe MCP Server Status..."
    if curl -s http://localhost:7000/health | grep -q "openai.*configured"; then
        echo "   ✅ MCP Server hat OpenAI konfiguriert"
    else
        echo "   ⚠️  MCP Server hat OpenAI NICHT konfiguriert"
    fi
fi
echo ""

# 4. Zusammenfassung
if [ "$FOUND" = true ]; then
    echo "======================================"
    echo "✅ OpenAI API Key gefunden!"
    echo ""
    echo "📍 Ort: /opt/mcp-connection-key/.env"
    echo ""
    echo "📋 Nächste Schritte:"
    echo "   1. Key in production/.env kopieren:"
    echo "      cd /opt/mcp-connection-key"
    echo "      ./setup-production-env.sh"
    echo ""
else
    echo "======================================"
    echo "⚠️  OpenAI API Key nicht gefunden!"
    echo ""
    echo "📋 Sie müssen den Key manuell setzen:"
    echo ""
    echo "   1. Erstellen Sie einen OpenAI API Key:"
    echo "      https://platform.openai.com/api-keys"
    echo ""
    echo "   2. Fügen Sie ihn zu /opt/mcp-connection-key/.env hinzu:"
    echo "      echo 'OPENAI_API_KEY=sk-your-key-here' >> /opt/mcp-connection-key/.env"
    echo ""
    echo "   3. Dann für Production Agent:"
    echo "      cd /opt/mcp-connection-key"
    echo "      ./setup-production-env.sh"
    echo ""
fi

