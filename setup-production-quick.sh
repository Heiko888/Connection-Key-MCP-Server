#!/bin/bash
# Schnelles Setup für Production Reading Agent auf Server

set -e

CONNECTION_KEY_DIR="/opt/mcp-connection-key"
PRODUCTION_DIR="$CONNECTION_KEY_DIR/production"
PRODUCTION_ENV_FILE="$PRODUCTION_DIR/.env"
PRODUCTION_ENV_EXAMPLE="$PRODUCTION_DIR/env.example"

echo "⚙️  Richte Production Environment für Reading Agent ein"
echo "====================================================="
echo ""

# 1. Prüfe ob production/.env existiert
if [ ! -f "$PRODUCTION_ENV_FILE" ]; then
    echo "📋 Erstelle $PRODUCTION_ENV_FILE von $PRODUCTION_ENV_EXAMPLE..."
    if [ -f "$PRODUCTION_ENV_EXAMPLE" ]; then
        cp "$PRODUCTION_ENV_EXAMPLE" "$PRODUCTION_ENV_FILE"
        chmod 600 "$PRODUCTION_ENV_FILE"
        echo "✅ $PRODUCTION_ENV_FILE erstellt."
    else
        echo "❌ $PRODUCTION_ENV_EXAMPLE nicht gefunden!"
        exit 1
    fi
else
    echo "✅ $PRODUCTION_ENV_FILE existiert bereits."
fi

# 2. Setze OPENAI_API_KEY aus Haupt-.env
OPENAI_KEY=""
if [ -f "$CONNECTION_KEY_DIR/.env" ]; then
    OPENAI_KEY=$(grep "OPENAI_API_KEY=" "$CONNECTION_KEY_DIR/.env" | cut -d= -f2)
    if [ ! -z "$OPENAI_KEY" ] && [ "$OPENAI_KEY" != "sk-your-openai-api-key-here" ]; then
        echo "✅ OPENAI_API_KEY gefunden in Haupt-.env"
    else
        echo "⚠️  OPENAI_API_KEY ist leer oder Platzhalter in Haupt-.env"
        OPENAI_KEY=""
    fi
fi

# Falls Key nicht gefunden, verwende den neuen Key
if [ -z "$OPENAI_KEY" ]; then
    OPENAI_KEY="YOUR_OPENAI_API_KEY_HERE"
    echo "✅ Verwende bereitgestellten OPENAI_API_KEY"
fi

# Setze OPENAI_API_KEY in production/.env
echo "📝 Setze OPENAI_API_KEY in $PRODUCTION_ENV_FILE..."
sed -i '/^OPENAI_API_KEY=/d' "$PRODUCTION_ENV_FILE"
echo "OPENAI_API_KEY=$OPENAI_KEY" >> "$PRODUCTION_ENV_FILE"
echo "✅ OPENAI_API_KEY in $PRODUCTION_ENV_FILE gesetzt."

# 3. Prüfe und setze AGENT_SECRET
AGENT_SECRET=$(grep "^AGENT_SECRET=" "$PRODUCTION_ENV_FILE" | cut -d= -f2)
if [ -z "$AGENT_SECRET" ] || [ "$AGENT_SECRET" == "your-agent-secret" ] || [ "$AGENT_SECRET" == "" ]; then
    NEW_AGENT_SECRET=$(openssl rand -hex 32)
    echo "🔐 Generiere neuen AGENT_SECRET..."
    sed -i '/^AGENT_SECRET=/d' "$PRODUCTION_ENV_FILE"
    echo "AGENT_SECRET=$NEW_AGENT_SECRET" >> "$PRODUCTION_ENV_FILE"
    echo "✅ Neuer AGENT_SECRET in $PRODUCTION_ENV_FILE gesetzt."
else
    echo "✅ AGENT_SECRET bereits in $PRODUCTION_ENV_FILE gesetzt."
fi

# 4. Prüfe MCP_PORT
if ! grep -q "^MCP_PORT=" "$PRODUCTION_ENV_FILE"; then
    echo "MCP_PORT=4000" >> "$PRODUCTION_ENV_FILE"
    echo "✅ MCP_PORT gesetzt."
fi

# 5. Prüfe Pfade
if ! grep -q "^KNOWLEDGE_PATH=" "$PRODUCTION_ENV_FILE"; then
    echo "KNOWLEDGE_PATH=./production/knowledge" >> "$PRODUCTION_ENV_FILE"
fi

if ! grep -q "^TEMPLATE_PATH=" "$PRODUCTION_ENV_FILE"; then
    echo "TEMPLATE_PATH=./production/templates" >> "$PRODUCTION_ENV_FILE"
fi

if ! grep -q "^LOGS_PATH=" "$PRODUCTION_ENV_FILE"; then
    echo "LOGS_PATH=./production/logs" >> "$PRODUCTION_ENV_FILE"
fi

echo ""
echo "====================================================="
echo "✅ Production Environment Setup abgeschlossen!"
echo "====================================================="
echo ""
echo "📋 Überprüfen Sie die Datei: nano $PRODUCTION_ENV_FILE"
echo ""
echo "🚀 Nächste Schritte:"
echo "1. Dependencies installieren: cd $PRODUCTION_DIR && npm install"
echo "2. Agent starten: cd $PRODUCTION_DIR && ./start.sh"
echo "3. Status prüfen: pm2 status reading-agent"
echo ""

