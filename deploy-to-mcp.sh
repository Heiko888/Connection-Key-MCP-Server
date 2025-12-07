#!/bin/bash
# Deploy Reading Agent zu MCP Server (138.199.237.34)

set -e

SERVER="root@138.199.237.34"
REMOTE_DIR="/opt/reading-agent"
LOCAL_PRODUCTION_DIR="./production"

echo "🚀 Deploy Reading Agent zu MCP Server"
echo "======================================="
echo ""
echo "Server: $SERVER"
echo "Ziel-Verzeichnis: $REMOTE_DIR"
echo ""

# Prüfe ob production-Verzeichnis existiert
if [ ! -d "$LOCAL_PRODUCTION_DIR" ]; then
    echo "❌ Production-Verzeichnis nicht gefunden: $LOCAL_PRODUCTION_DIR"
    exit 1
fi

# Prüfe ob .env.example existiert
if [ ! -f "$LOCAL_PRODUCTION_DIR/env.example" ]; then
    echo "❌ env.example nicht gefunden!"
    exit 1
fi

echo "📦 Kopiere Dateien zum Server..."
echo ""

# Erstelle Remote-Verzeichnis
ssh $SERVER "mkdir -p $REMOTE_DIR/production"

# Kopiere Dateien (ohne .env, node_modules, logs)
rsync -avz --exclude '.env' \
           --exclude 'node_modules' \
           --exclude 'logs' \
           --exclude '.git' \
           "$LOCAL_PRODUCTION_DIR/" "$SERVER:$REMOTE_DIR/production/"

echo ""
echo "✅ Dateien kopiert"
echo ""

# Dependencies installieren
echo "📦 Installiere Dependencies auf Server..."
ssh $SERVER "cd $REMOTE_DIR/production && npm install"

echo ""
echo "✅ Dependencies installiert"
echo ""

# Prüfe ob .env existiert, falls nicht: env.example kopieren
echo "🔐 Prüfe .env Datei..."
if ssh $SERVER "[ ! -f $REMOTE_DIR/production/.env ]"; then
    echo "⚠️  .env nicht gefunden, kopiere env.example..."
    ssh $SERVER "cd $REMOTE_DIR/production && cp env.example .env"
    echo ""
    echo "⚠️  WICHTIG: Bearbeiten Sie .env auf dem Server:"
    echo "   ssh $SERVER"
    echo "   nano $REMOTE_DIR/production/.env"
    echo ""
else
    echo "✅ .env bereits vorhanden"
fi

echo ""

# PM2 Reload oder Start
echo "🔄 Starte/Neustarte Agent..."
if ssh $SERVER "pm2 list | grep -q reading-agent"; then
    echo "   Agent läuft bereits, starte neu..."
    ssh $SERVER "cd $REMOTE_DIR/production && pm2 restart reading-agent"
else
    echo "   Agent läuft nicht, starte neu..."
    ssh $SERVER "cd $REMOTE_DIR/production && chmod +x start.sh && ./start.sh"
fi

echo ""
echo "✅ Agent gestartet"
echo ""

# Status anzeigen
echo "📊 Agent Status:"
ssh $SERVER "pm2 status reading-agent"

echo ""
echo "======================================="
echo "✅ Deploy abgeschlossen!"
echo ""
echo "🌐 Agent sollte erreichbar sein:"
echo "   http://138.199.237.34:4000/health"
echo ""
echo "📋 Nächste Schritte:"
echo "   1. Prüfe .env Datei auf Server"
echo "   2. Nginx konfigurieren (siehe deployment/INSTALL_ON_SERVER.md)"
echo "   3. SSL-Zertifikat erstellen"
echo ""

