#!/bin/bash

# Fix für Tasks Route - OHNE CACHE neu bauen
# Führt auf Server aus

set -e

cd /opt/hd-app/The-Connection-Key

echo "🔧 Fix Tasks Route - Container OHNE CACHE neu bauen"
echo "==================================================="
echo ""

# 1. Prüfe ob Datei existiert
echo "1. Prüfe ob Datei existiert..."
if [ -f "frontend/app/api/agents/tasks/route.ts" ]; then
    echo "   ✅ Datei existiert"
    echo "   Zeilen: $(wc -l < frontend/app/api/agents/tasks/route.ts)"
else
    echo "   ❌ Datei existiert nicht!"
    exit 1
fi
echo ""

# 2. Prüfe ob Route im Build ist (vorher)
echo "2. Prüfe ob Route im Build ist (vorher)..."
BUILD_ROUTE_BEFORE=$(docker exec the-connection-key-frontend-1 find /app/.next -path "*/api/agents/tasks/*" -name "route.js" -type f 2>/dev/null | head -1)
if [ -n "$BUILD_ROUTE_BEFORE" ]; then
    echo "   ✅ Route ist bereits im Build"
    echo "   $BUILD_ROUTE_BEFORE"
    exit 0
else
    echo "   ❌ Route ist NICHT im Build (das ist das Problem)"
fi
echo ""

# 3. Container OHNE CACHE neu bauen
echo "3. Baue Container OHNE CACHE neu..."
echo "   (Das kann einige Minuten dauern...)"
docker compose build --no-cache frontend
echo ""

# 4. Container neu starten
echo "4. Starte Container neu..."
docker compose restart frontend
echo ""

# 5. Warte auf Build (Next.js braucht Zeit)
echo "5. Warte 30 Sekunden auf Build..."
sleep 30
echo ""

# 6. Prüfe ob Route jetzt im Build ist
echo "6. Prüfe ob Route jetzt im Build ist..."
BUILD_ROUTE_AFTER=$(docker exec the-connection-key-frontend-1 find /app/.next -path "*/api/agents/tasks/*" -name "route.js" -type f 2>/dev/null | head -1)
if [ -n "$BUILD_ROUTE_AFTER" ]; then
    echo "   ✅ Route ist jetzt im Build!"
    echo "   $BUILD_ROUTE_AFTER"
else
    echo "   ⚠️  Route ist immer noch nicht im Build"
    echo "   Prüfe Build-Logs auf Fehler..."
    docker compose logs frontend | grep -i "error\|fail\|tasks" | tail -10 || echo "   Keine offensichtlichen Fehler"
fi
echo ""

# 7. Teste Route
echo "7. Teste Route..."
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://localhost:3000/api/agents/tasks 2>/dev/null)
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d' | head -3)

if [ "$http_code" = "200" ]; then
    echo "   ✅ Route funktioniert! (HTTP $http_code)"
    echo "$body" | head -1
elif echo "$body" | grep -q "success"; then
    echo "   ✅ Route antwortet! (HTTP $http_code)"
    echo "$body" | head -1
else
    echo "   ⚠️  Route antwortet mit HTTP $http_code"
    if [ "$http_code" = "404" ]; then
        echo "   Route ist immer noch nicht im Build"
        echo "   Möglicherweise Build-Fehler - prüfe Logs"
    fi
fi
echo ""

echo "✅ Fertig!"
