#!/bin/bash

# Build Container und teste System-Auth
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🔧 Build Container und Teste System-Auth"
echo "========================================"
echo ""

# 1. Prüfe ob Dateien vorhanden sind
echo "1. Prüfe Dateien..."
echo "------------------"

if [ ! -f "frontend/lib/system-auth.ts" ]; then
    echo "   ❌ system-auth.ts fehlt!"
    echo "   📝 Führe aus: ./deploy-system-auth-direkt.sh"
    exit 1
fi

if [ ! -f "frontend/app/api/system/agents/tasks/route.ts" ]; then
    echo "   ❌ Route fehlt!"
    echo "   📝 Führe aus: ./deploy-system-auth-direkt.sh"
    exit 1
fi

echo "   ✅ Alle Dateien vorhanden"
echo ""

# 2. Container neu bauen
echo "2. Container neu bauen..."
echo "------------------------"

FRONTEND_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i frontend | head -1)

if [ -n "$FRONTEND_CONTAINER" ]; then
    echo "   Stoppe Container: $FRONTEND_CONTAINER"
    docker compose -f docker-compose.yml stop frontend
fi

echo "   Baue Container neu (das kann einige Minuten dauern)..."
docker compose -f docker-compose.yml build frontend

if [ $? -ne 0 ]; then
    echo "   ❌ Build fehlgeschlagen!"
    echo "   📝 Prüfe Build-Logs:"
    echo "      docker compose -f docker-compose.yml build frontend 2>&1 | tail -50"
    exit 1
fi

echo "   ✅ Build erfolgreich"
echo ""

# 3. Container starten
echo "3. Container starten..."
echo "----------------------"

docker compose -f docker-compose.yml up -d frontend

echo "   ⏳ Warte 15 Sekunden auf Container-Start..."
sleep 15

echo ""

# 4. Prüfe Container
echo "4. Prüfe Container..."
echo "-------------------"

FRONTEND_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i frontend | head -1)

if [ -z "$FRONTEND_CONTAINER" ]; then
    echo "   ❌ Container läuft nicht!"
    echo "   📝 Prüfe Logs:"
    echo "      docker compose -f docker-compose.yml logs frontend | tail -50"
    exit 1
fi

echo "   ✅ Container läuft: $FRONTEND_CONTAINER"
echo ""

# 5. Prüfe ob Dateien im Container sind
echo "5. Prüfe Dateien im Container..."
echo "-------------------------------"

if docker exec $FRONTEND_CONTAINER test -f /app/lib/system-auth.ts; then
    echo "   ✅ system-auth.ts im Container"
else
    echo "   ❌ system-auth.ts FEHLT im Container!"
    exit 1
fi

if docker exec $FRONTEND_CONTAINER test -f /app/app/api/system/agents/tasks/route.ts; then
    echo "   ✅ Route im Container"
else
    echo "   ❌ Route FEHLT im Container!"
    exit 1
fi

echo ""

# 6. Teste Route
echo "6. Teste System-Auth Route..."
echo "----------------------------"

if [ -f "test-system-auth-final.sh" ]; then
    chmod +x test-system-auth-final.sh
    ./test-system-auth-final.sh
else
    echo "   ⚠️  test-system-auth-final.sh nicht gefunden"
    echo ""
    echo "   📝 Manueller Test:"
    TOKEN=$(grep "AGENT_SYSTEM_TOKEN" .env | cut -d'=' -f2 | tr -d ' ')
    echo ""
    echo "   Test ohne Token (sollte 401):"
    echo "   curl -X GET http://localhost:3000/api/system/agents/tasks"
    echo ""
    echo "   Test mit Token (sollte 200):"
    echo "   curl -X GET http://localhost:3000/api/system/agents/tasks -H \"x-agent-token: $TOKEN\""
fi

echo ""
echo "✅ Build und Test abgeschlossen!"
