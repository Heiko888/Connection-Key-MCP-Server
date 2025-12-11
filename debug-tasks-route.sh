#!/bin/bash

# Debug Script für Tasks Route 404
# Führt auf Server aus

set -e

cd /opt/hd-app/The-Connection-Key

echo "🔍 Debug Tasks Route 404"
echo "========================"
echo ""

# 1. Prüfe ob Datei lokal existiert
echo "1. Prüfe ob Datei lokal existiert..."
if [ -f "frontend/app/api/agents/tasks/route.ts" ]; then
    echo "   ✅ Datei existiert"
    echo "   Zeilen: $(wc -l < frontend/app/api/agents/tasks/route.ts)"
    echo "   Größe: $(du -h frontend/app/api/agents/tasks/route.ts | cut -f1)"
    echo ""
    echo "   Erste 10 Zeilen:"
    head -10 frontend/app/api/agents/tasks/route.ts
else
    echo "   ❌ Datei existiert NICHT!"
    echo "   Erstelle sie jetzt..."
    mkdir -p frontend/app/api/agents/tasks
    # Datei wird unten erstellt
fi
echo ""

# 2. Prüfe ob Route im Build ist
echo "2. Prüfe ob Route im Build ist..."
BUILD_ROUTE=$(docker exec the-connection-key-frontend-1 find /app/.next -path "*/api/agents/tasks/*" -name "route.js" -type f 2>/dev/null | head -1)
if [ -n "$BUILD_ROUTE" ]; then
    echo "   ✅ Route ist im Build: $BUILD_ROUTE"
else
    echo "   ❌ Route ist NICHT im Build!"
    echo "   Das ist das Problem - Route muss neu gebaut werden"
fi
echo ""

# 3. Prüfe Build-Logs auf Fehler
echo "3. Prüfe Build-Logs auf Fehler..."
docker compose logs frontend 2>&1 | grep -i "error\|fail\|tasks" | tail -10 || echo "   Keine offensichtlichen Fehler gefunden"
echo ""

# 4. Prüfe ob Datei im Container ist (Quellcode)
echo "4. Prüfe ob Datei im Container ist (Quellcode)..."
if docker exec the-connection-key-frontend-1 test -f /app/app/api/agents/tasks/route.ts 2>/dev/null; then
    echo "   ✅ Quellcode-Datei existiert im Container"
else
    echo "   ⚠️  Quellcode-Datei existiert NICHT im Container"
    echo "   (Das ist normal für Production-Builds)"
fi
echo ""

# 5. Prüfe welche Routes im Build sind
echo "5. Prüfe welche Agent-Routes im Build sind..."
docker exec the-connection-key-frontend-1 find /app/.next -path "*/api/agents/*" -name "route.js" -type f 2>/dev/null | grep -v node_modules | sort
echo ""

# 6. Lösungsvorschlag
echo "6. Lösungsvorschlag:"
echo "-------------------"
if [ -f "frontend/app/api/agents/tasks/route.ts" ] && [ -z "$BUILD_ROUTE" ]; then
    echo "   ✅ Datei existiert lokal"
    echo "   ❌ Route ist nicht im Build"
    echo ""
    echo "   Lösung: Container OHNE CACHE neu bauen"
    echo "   docker compose build --no-cache frontend"
    echo "   docker compose restart frontend"
elif [ ! -f "frontend/app/api/agents/tasks/route.ts" ]; then
    echo "   ❌ Datei existiert nicht lokal"
    echo ""
    echo "   Lösung: Datei erstellen (siehe copy-tasks-route-to-server.sh)"
fi
echo ""

echo "✅ Debug abgeschlossen!"

