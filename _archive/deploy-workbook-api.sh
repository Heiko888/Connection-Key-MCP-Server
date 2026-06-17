#!/bin/bash

# Deployment-Script für Workbook API
# Kopiert die notwendigen Dateien auf den Server

set -e

echo "🚀 Workbook API Deployment"
echo "========================="
echo ""

# Frontend-Verzeichnis
FRONTEND_DIR="/opt/hd-app/The-Connection-Key/frontend"
INTEGRATION_DIR="/opt/hd-app/The-Connection-Key/integration"

# Prüfe ob Frontend-Verzeichnis existiert
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Fehler: Frontend-Verzeichnis nicht gefunden: $FRONTEND_DIR"
    exit 1
fi

echo "📍 Frontend-Verzeichnis: $FRONTEND_DIR"
echo ""

# Schritt 1: API-Route kopieren
echo "📋 Schritt 1: API-Route kopieren"
echo "--------------------------------"

API_ROUTE_SOURCE="$INTEGRATION_DIR/api-routes/app-router/workbook/chart-data/route.ts"
API_ROUTE_TARGET="$FRONTEND_DIR/app/api/workbook/chart-data/route.ts"

if [ ! -f "$API_ROUTE_SOURCE" ]; then
    echo "❌ Fehler: API-Route nicht gefunden: $API_ROUTE_SOURCE"
    echo "💡 Stelle sicher, dass die Datei im integration/ Verzeichnis existiert"
    exit 1
fi

mkdir -p "$FRONTEND_DIR/app/api/workbook/chart-data"
cp "$API_ROUTE_SOURCE" "$API_ROUTE_TARGET"

if [ -f "$API_ROUTE_TARGET" ]; then
    echo "✅ API-Route kopiert: $API_ROUTE_TARGET"
else
    echo "❌ Fehler: API-Route konnte nicht kopiert werden"
    exit 1
fi

echo ""

# Schritt 2: Service kopieren (optional)
echo "📋 Schritt 2: Service kopieren (optional)"
echo "----------------------------------------"

SERVICE_SOURCE="$INTEGRATION_DIR/services/workbook-service.ts"
SERVICE_TARGET="$FRONTEND_DIR/lib/services/workbook-service.ts"

if [ -f "$SERVICE_SOURCE" ]; then
    mkdir -p "$FRONTEND_DIR/lib/services"
    cp "$SERVICE_SOURCE" "$SERVICE_TARGET"
    echo "✅ Service kopiert: $SERVICE_TARGET"
else
    echo "⚠️  Service nicht gefunden (optional, wird übersprungen): $SERVICE_SOURCE"
fi

echo ""

# Schritt 3: Environment Variable prüfen/setzen
echo "📋 Schritt 3: Environment Variable prüfen"
echo "------------------------------------------"

ENV_FILE="$FRONTEND_DIR/.env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  .env.local nicht gefunden, erstelle neue Datei"
    touch "$ENV_FILE"
fi

if grep -q "MCP_SERVER_URL" "$ENV_FILE"; then
    echo "✅ MCP_SERVER_URL bereits gesetzt"
    grep "MCP_SERVER_URL" "$ENV_FILE"
else
    echo "⚠️  MCP_SERVER_URL nicht gefunden, füge hinzu"
    echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> "$ENV_FILE"
    echo "✅ MCP_SERVER_URL hinzugefügt"
fi

echo ""

# Schritt 4: Frontend neu starten
echo "📋 Schritt 4: Frontend neu starten"
echo "----------------------------------"

# Prüfe ob Docker verwendet wird
if [ -f "$FRONTEND_DIR/../docker-compose.yml" ]; then
    echo "🐳 Docker-Compose erkannt"
    cd "$FRONTEND_DIR/.."
    
    echo "🔄 Starte Frontend-Container neu..."
    docker-compose restart frontend || docker-compose up -d --build frontend
    
    echo "✅ Frontend-Container neu gestartet"
else
    echo "⚠️  Docker-Compose nicht gefunden"
    echo "💡 Bitte starte das Frontend manuell neu:"
    echo "   cd $FRONTEND_DIR"
    echo "   pm2 restart frontend"
    echo "   # ODER"
    echo "   npm run dev -p 3005"
fi

echo ""

# Schritt 5: Verifikation
echo "📋 Schritt 5: Verifikation"
echo "---------------------------"

echo "⏳ Warte 5 Sekunden, damit Frontend startet..."
sleep 5

# Test API-Endpoint
echo "🧪 Teste API-Endpoint..."
if curl -s -f -X GET http://localhost:3005/api/workbook/chart-data > /dev/null; then
    echo "✅ API-Endpoint erreichbar"
else
    echo "⚠️  API-Endpoint nicht erreichbar (Frontend läuft möglicherweise noch nicht)"
    echo "💡 Prüfe Frontend-Status:"
    echo "   docker ps | grep frontend"
    echo "   # ODER"
    echo "   pm2 status"
fi

echo ""
echo "✅ Deployment abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "   1. Teste API: curl -X GET http://localhost:3005/api/workbook/chart-data"
echo "   2. Teste POST: Siehe WORKBOOK_API_TEST_ANLEITUNG.md"
echo "   3. Prüfe Logs: docker logs frontend (oder pm2 logs frontend)"
