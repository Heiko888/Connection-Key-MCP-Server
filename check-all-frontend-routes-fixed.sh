#!/bin/bash

# Prüft alle Frontend API Routes im Container
# Führt auf Server aus (167.235.224.149)

set -e

CONTAINER_NAME="the-connection-key-frontend-1"

echo "🔍 Prüfe alle Frontend API Routes"
echo "=================================="
echo ""

# Prüfe ob Container läuft
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ Container $CONTAINER_NAME läuft nicht!"
    exit 1
fi

echo "✅ Container läuft"
echo ""

# App Router Routes
echo "📁 App Router Routes:"
echo "-------------------"
docker exec $CONTAINER_NAME find /app/app/api -name "route.ts" -type f 2>/dev/null | sort || echo "Keine App Router Routes gefunden"
echo ""

# Pages Router Routes
echo "📁 Pages Router Routes:"
echo "---------------------"
docker exec $CONTAINER_NAME find /app/pages/api -name "*.ts" -type f 2>/dev/null | sort || echo "Keine Pages Router Routes gefunden"
echo ""

# Detaillierte Liste
echo "📋 Detaillierte Route-Liste:"
echo "============================"
echo ""

# App Router
echo "### App Router (app/api/):"
docker exec $CONTAINER_NAME find /app/app/api -name "route.ts" -type f 2>/dev/null | while read route; do
    # Extrahiere Route-Pfad
    route_path=$(echo "$route" | sed 's|/app/app/api||' | sed 's|/route.ts||' | sed 's|^/||')
    if [ -n "$route_path" ]; then
        echo "  ✅ /api/$route_path"
    fi
done
echo ""

# Pages Router
echo "### Pages Router (pages/api/):"
docker exec $CONTAINER_NAME find /app/pages/api -name "*.ts" -type f 2>/dev/null | while read route; do
    # Extrahiere Route-Pfad
    route_path=$(echo "$route" | sed 's|/app/pages/api||' | sed 's|\.ts$||' | sed 's|^/||')
    if [ -n "$route_path" ]; then
        echo "  ✅ /api/$route_path"
    fi
done
echo ""

# Teste wichtige Routes
echo "🧪 Teste wichtige Routes:"
echo "======================"
echo ""

# Test 1: Website-UX-Agent
echo "1. Website-UX-Agent:"
if docker exec $CONTAINER_NAME test -f /app/app/api/agents/website-ux-agent/route.ts 2>/dev/null; then
    echo "   ✅ Route existiert"
    curl -s -X GET http://localhost:3000/api/agents/website-ux-agent 2>/dev/null | head -5 || echo "   ⚠️  Route gibt Fehler"
else
    echo "   ❌ Route fehlt"
fi
echo ""

# Test 2: Tasks
echo "2. Tasks:"
if docker exec $CONTAINER_NAME test -f /app/app/api/agents/tasks/route.ts 2>/dev/null; then
    echo "   ✅ Route existiert"
    curl -s -X GET http://localhost:3000/api/agents/tasks 2>/dev/null | head -5 || echo "   ⚠️  Route gibt Fehler"
else
    echo "   ❌ Route fehlt"
fi
echo ""

# Test 3: Reading Generate
echo "3. Reading Generate:"
if docker exec $CONTAINER_NAME test -f /app/app/api/reading/generate/route.ts 2>/dev/null; then
    echo "   ✅ Route existiert"
else
    echo "   ❌ Route fehlt"
fi
echo ""

# Test 4: Coach Readings
echo "4. Coach Readings:"
if docker exec $CONTAINER_NAME test -f /app/app/api/coach/readings/route.ts 2>/dev/null; then
    echo "   ✅ Route existiert"
    curl -s -X GET http://localhost:3000/api/coach/readings 2>/dev/null | head -5 || echo "   ⚠️  Route gibt Fehler"
else
    echo "   ❌ Route fehlt"
fi
echo ""

echo "✅ Prüfung abgeschlossen!"
