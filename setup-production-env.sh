#!/bin/bash
# Setup Production Environment - Kopiert OPENAI_API_KEY von Haupt-.env

set -e

MAIN_ENV="/opt/mcp-connection-key/.env"
PROD_ENV="/opt/mcp-connection-key/production/.env"
PROD_DIR="/opt/mcp-connection-key/production"

echo "🔧 Setup Production Environment"
echo "==============================="
echo ""

# 1. Prüfe ob Haupt-.env existiert
if [ ! -f "$MAIN_ENV" ]; then
    echo "❌ Haupt-.env nicht gefunden: $MAIN_ENV"
    exit 1
fi

echo "✅ Haupt-.env gefunden"
echo ""

# 2. Prüfe ob production Verzeichnis existiert
if [ ! -d "$PROD_DIR" ]; then
    echo "❌ Production-Verzeichnis nicht gefunden: $PROD_DIR"
    exit 1
fi

echo "✅ Production-Verzeichnis gefunden"
echo ""

# 3. OPENAI_API_KEY finden
OPENAI_KEY=""

# Versuche aus Haupt-.env zu lesen
if [ -f "$MAIN_ENV" ] && grep -q "OPENAI_API_KEY=" "$MAIN_ENV"; then
    OPENAI_KEY=$(grep "OPENAI_API_KEY=" "$MAIN_ENV" | cut -d= -f2 | tr -d '"' | tr -d "'" | xargs)
fi

# Falls nicht gefunden, versuche aus MCP Server Environment
if [ -z "$OPENAI_KEY" ] || [ "$OPENAI_KEY" = "" ]; then
    if [ -f "/opt/mcp/.env" ] && grep -q "OPENAI_API_KEY=" "/opt/mcp/.env"; then
        OPENAI_KEY=$(grep "OPENAI_API_KEY=" "/opt/mcp/.env" | cut -d= -f2 | tr -d '"' | tr -d "'" | xargs)
        echo "   ℹ️  Key aus /opt/mcp/.env gelesen"
    fi
fi

# Falls immer noch nicht gefunden
if [ -z "$OPENAI_KEY" ] || [ "$OPENAI_KEY" = "" ]; then
    echo "⚠️  OPENAI_API_KEY nicht in .env Dateien gefunden!"
    echo ""
    echo "📋 Mögliche Lösungen:"
    echo "   1. Key manuell in /opt/mcp-connection-key/.env setzen:"
    echo "      echo 'OPENAI_API_KEY=sk-your-key-here' >> /opt/mcp-connection-key/.env"
    echo ""
    echo "   2. Oder Key direkt in production/.env eintragen:"
    echo "      nano $PROD_ENV"
    echo ""
    echo "   3. Prüfen Sie, ob MCP Agenten funktionieren:"
    echo "      curl -X POST http://localhost:7000/agent/marketing -H 'Content-Type: application/json' -d '{\"message\":\"Test\"}'"
    echo ""
    read -p "Möchten Sie den Key jetzt manuell eingeben? (j/n): " response
    if [[ "$response" =~ ^[Jj]$ ]]; then
        read -sp "OPENAI_API_KEY eingeben: " OPENAI_KEY
        echo ""
        if [ -z "$OPENAI_KEY" ] || [ "$OPENAI_KEY" = "" ]; then
            echo "❌ Kein Key eingegeben. Abgebrochen."
            exit 1
        fi
    else
        echo "⚠️  Setup abgebrochen. Bitte setzen Sie OPENAI_API_KEY manuell."
        exit 1
    fi
fi

echo "✅ OPENAI_API_KEY gefunden (Länge: ${#OPENAI_KEY} Zeichen)"
echo ""

# 4. Production .env erstellen oder aktualisieren
if [ ! -f "$PROD_ENV" ]; then
    echo "📝 Erstelle production/.env aus env.example..."
    cp "$PROD_DIR/env.example" "$PROD_ENV"
    echo "✅ production/.env erstellt"
else
    echo "📝 production/.env existiert bereits"
fi
echo ""

# 5. OPENAI_API_KEY in production/.env setzen
echo "🔐 Setze OPENAI_API_KEY in production/.env..."

# Entferne alte OPENAI_API_KEY Zeile falls vorhanden
sed -i '/^OPENAI_API_KEY=/d' "$PROD_ENV"

# Füge neue OPENAI_API_KEY Zeile hinzu (am Anfang, nach Kommentaren)
if grep -q "^# OpenAI API Key" "$PROD_ENV"; then
    # Füge nach dem Kommentar hinzu
    sed -i '/^# OpenAI API Key/a OPENAI_API_KEY='"$OPENAI_KEY" "$PROD_ENV"
else
    # Füge am Anfang hinzu
    sed -i '1i OPENAI_API_KEY='"$OPENAI_KEY" "$PROD_ENV"
fi

echo "✅ OPENAI_API_KEY gesetzt"
echo ""

# 6. Prüfe andere wichtige Variablen
echo "📋 Prüfe weitere Konfiguration..."

# MCP_PORT
if ! grep -q "^MCP_PORT=" "$PROD_ENV"; then
    echo "   ⚠️  MCP_PORT nicht gesetzt, verwende Standard: 4000"
    echo "MCP_PORT=4000" >> "$PROD_ENV"
fi

# AGENT_SECRET (optional, aber empfohlen)
if ! grep -q "^AGENT_SECRET=" "$PROD_ENV" || grep -q "^AGENT_SECRET=$" "$PROD_ENV"; then
    echo "   ⚠️  AGENT_SECRET nicht gesetzt (optional, aber empfohlen)"
    echo "   Sie können später einen Secret generieren mit:"
    echo "   openssl rand -hex 32"
fi

echo "✅ Konfiguration geprüft"
echo ""

# 7. Zusammenfassung
echo "======================================"
echo "✅ Production Environment Setup abgeschlossen!"
echo ""
echo "📁 Datei: $PROD_ENV"
echo ""
echo "📋 Nächste Schritte:"
echo "   1. Prüfe production/.env:"
echo "      nano $PROD_ENV"
echo ""
echo "   2. Optional: AGENT_SECRET setzen"
echo "      openssl rand -hex 32"
echo ""
echo "   3. Dependencies installieren:"
echo "      cd $PROD_DIR && npm install"
echo ""
echo "   4. Agent starten:"
echo "      cd $PROD_DIR && ./start.sh"
echo ""

