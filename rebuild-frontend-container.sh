#!/bin/bash

# Baut Frontend-Container neu
# Führt auf Server aus (167.235.224.149)

set -e

cd /opt/hd-app/The-Connection-Key

echo "🔨 Baue Frontend-Container neu"
echo "==============================="
echo ""

# 1. Prüfe ob Routes lokal existieren
echo "1. Prüfe ob Routes lokal existieren:"
echo "-----------------------------------"
if [ -d "frontend/app/api" ]; then
    echo "   ✅ frontend/app/api existiert"
    find frontend/app/api -name "route.ts" -type f | wc -l | xargs echo "   Anzahl route.ts Dateien:"
else
    echo "   ⚠️  frontend/app/api existiert nicht"
    echo "   Prüfe ob Routes in integration/api-routes sind..."
    if [ -d "integration/api-routes/app-router" ]; then
        echo "   ✅ integration/api-routes/app-router existiert"
        echo "   ⚠️  Routes müssen nach frontend/app/api kopiert werden!"
    fi
fi
echo ""

# 2. Stoppe Container
echo "2. Stoppe Frontend-Container:"
echo "----------------------------"
docker compose stop frontend 2>/dev/null || echo "   Container läuft nicht"
echo ""

# 3. Entferne alten Container
echo "3. Entferne alten Container:"
echo "---------------------------"
docker compose rm -f frontend 2>/dev/null || echo "   Container existiert nicht"
echo ""

# 4. Baue Container neu
echo "4. Baue Container neu:"
echo "--------------------"
docker compose build frontend
echo ""

# 5. Starte Container
echo "5. Starte Container:"
echo "-------------------"
docker compose up -d frontend
echo ""

# 6. Warte auf Start
echo "6. Warte 10 Sekunden auf Container-Start..."
sleep 10
echo ""

# 7. Prüfe ob Container läuft
echo "7. Prüfe Container-Status:"
echo "-------------------------"
if docker ps | grep -q "the-connection-key-frontend-1"; then
    echo "   ✅ Container läuft"
else
    echo "   ❌ Container läuft nicht!"
    echo "   Prüfe Logs: docker compose logs frontend"
    exit 1
fi
echo ""

# 8. Prüfe ob Routes im Container sind
echo "8. Prüfe ob Routes im Container sind:"
echo "------------------------------------"
if docker exec the-connection-key-frontend-1 test -d /app/app/api 2>/dev/null; then
    echo "   ✅ /app/app/api existiert im Container"
    docker exec the-connection-key-frontend-1 find /app/app/api -name "route.ts" -type f 2>/dev/null | wc -l | xargs echo "   Anzahl route.ts Dateien:"
else
    echo "   ⚠️  /app/app/api existiert nicht im Container"
    echo "   Routes müssen möglicherweise manuell kopiert werden"
fi
echo ""

# 9. Teste API
echo "9. Teste API:"
echo "-----------"
echo "   GET /api/agents/website-ux-agent:"
curl -s -X GET http://localhost:3000/api/agents/website-ux-agent 2>/dev/null | head -3 || echo "   ⚠️  Route antwortet nicht"
echo ""

echo "✅ Container-Neubau abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Prüfe Logs: docker compose logs frontend"
echo "2. Teste weitere Routes: curl http://localhost:3000/api/agents/tasks"
echo "3. Prüfe Container: docker exec the-connection-key-frontend-1 ls -la /app/app/api"
