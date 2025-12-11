#!/bin/bash

# Deployment Script für Website-UX-Agent API Route
# Kopiert die Route auf den Server und baut den Container neu

set -e

SERVER="root@167.235.224.149"
SERVER_PATH="/opt/hd-app/The-Connection-Key"
ROUTE_SOURCE="integration/api-routes/app-router/agents/website-ux-agent/route.ts"
ROUTE_TARGET="$SERVER_PATH/frontend/app/api/agents/website-ux-agent/route.ts"

echo "🚀 Deploy Website-UX-Agent API Route"
echo "===================================="

# Prüfe ob lokale Datei existiert
if [ ! -f "$ROUTE_SOURCE" ]; then
    echo "❌ Fehler: Route-Datei nicht gefunden: $ROUTE_SOURCE"
    exit 1
fi

echo "✅ Lokale Datei gefunden: $ROUTE_SOURCE"

# Erstelle Verzeichnis auf Server
echo "📁 Erstelle Verzeichnis auf Server..."
ssh $SERVER "mkdir -p $SERVER_PATH/frontend/app/api/agents/website-ux-agent"

# Kopiere Datei auf Server
echo "📤 Kopiere Route-Datei auf Server..."
scp "$ROUTE_SOURCE" "$SERVER:$ROUTE_TARGET"

# Prüfe ob Datei kopiert wurde
echo "🔍 Prüfe ob Datei auf Server existiert..."
ssh $SERVER "test -f $ROUTE_TARGET && echo '✅ Datei erfolgreich kopiert' || echo '❌ Datei nicht gefunden'"

# Container neu bauen
echo "🔨 Baue Frontend-Container neu..."
ssh $SERVER "cd $SERVER_PATH && docker compose build --no-cache frontend"

# Container neu starten
echo "🔄 Starte Frontend-Container neu..."
ssh $SERVER "cd $SERVER_PATH && docker compose up -d frontend"

# Warte 15 Sekunden
echo "⏳ Warte 15 Sekunden..."
sleep 15

# Teste API
echo "🧪 Teste API..."
echo ""
echo "GET Request:"
ssh $SERVER "curl -s -X GET http://localhost:3000/api/agents/website-ux-agent | head -20"
echo ""
echo ""
echo "POST Request (Test):"
ssh $SERVER "curl -s -X POST http://localhost:3000/api/agents/website-ux-agent \
  -H 'Content-Type: application/json' \
  -d '{\"message\": \"Test\", \"userId\": \"test\"}' | head -50"

echo ""
echo "✅ Deployment abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Prüfe Container-Logs: docker compose logs frontend"
echo "2. Teste API: curl -X POST http://localhost:3000/api/agents/website-ux-agent -H 'Content-Type: application/json' -d '{\"message\": \"Test\"}'"



