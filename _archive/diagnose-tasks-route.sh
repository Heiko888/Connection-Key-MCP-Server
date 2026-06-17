#!/bin/bash

# Diagnose-Script für Tasks Route Problem
# Führt auf Server aus (167.235.224.149)

set -e

CONTAINER_NAME="the-connection-key-frontend-1"
ROUTE_DIR="/app/app/api/agents/tasks"
ROUTE_FILE="$ROUTE_DIR/route.ts"
LOCAL_ROUTE_FILE="/opt/hd-app/The-Connection-Key/frontend/app/api/agents/tasks/route.ts"

echo "🔍 Diagnose: Tasks Route Problem"
echo "=================================="
echo ""

# 1. Prüfe Container-Status
echo "1. Container-Status:"
echo "-------------------"
if docker ps | grep -q "$CONTAINER_NAME"; then
    echo "   ✅ Container läuft"
    docker ps | grep "$CONTAINER_NAME" | awk '{print "   Name: " $NF "\n   Status: " $7 " " $8}'
else
    echo "   ❌ Container läuft nicht!"
    exit 1
fi
echo ""

# 2. Prüfe ob Datei lokal existiert
echo "2. Lokale Datei:"
echo "---------------"
if [ -f "$LOCAL_ROUTE_FILE" ]; then
    echo "   ✅ Datei existiert: $LOCAL_ROUTE_FILE"
    ls -lh "$LOCAL_ROUTE_FILE" | awk '{print "   Größe: " $5 "\n   Datum: " $6 " " $7 " " $8}'
else
    echo "   ❌ Datei existiert NICHT: $LOCAL_ROUTE_FILE"
fi
echo ""

# 3. Prüfe ob Datei im Container existiert
echo "3. Datei im Container:"
echo "---------------------"
if docker exec $CONTAINER_NAME test -f "$ROUTE_FILE" 2>/dev/null; then
    echo "   ✅ Datei existiert im Container: $ROUTE_FILE"
    docker exec $CONTAINER_NAME ls -lh "$ROUTE_FILE" 2>/dev/null | awk '{print "   Größe: " $5 "\n   Datum: " $6 " " $7 " " $8}'
else
    echo "   ❌ Datei existiert NICHT im Container: $ROUTE_FILE"
fi
echo ""

# 4. Prüfe Next.js Modus (Development vs Production)
echo "4. Next.js Modus:"
echo "----------------"
NODE_ENV=$(docker exec $CONTAINER_NAME sh -c 'echo $NODE_ENV' 2>/dev/null || echo "nicht gefunden")
if [ "$NODE_ENV" = "production" ]; then
    echo "   ⚠️  NODE_ENV=production (Routen müssen beim Build vorhanden sein!)"
    echo "   ❌ Kopieren zur Laufzeit funktioniert NICHT im Production-Modus!"
elif [ "$NODE_ENV" = "development" ]; then
    echo "   ✅ NODE_ENV=development (Routen werden zur Laufzeit geladen)"
else
    echo "   ⚠️  NODE_ENV nicht gesetzt oder unbekannt: $NODE_ENV"
fi
echo ""

# 5. Prüfe ob Route im Build vorhanden ist
echo "5. Route im Build:"
echo "------------------"
BUILD_DIR="/app/.next/server/app/api/agents/tasks"
if docker exec $CONTAINER_NAME test -d "$BUILD_DIR" 2>/dev/null; then
    echo "   ✅ Build-Verzeichnis existiert: $BUILD_DIR"
    docker exec $CONTAINER_NAME find "$BUILD_DIR" -name "*.js" -o -name "route.js" 2>/dev/null | head -5
    if docker exec $CONTAINER_NAME test -f "$BUILD_DIR/route.js" 2>/dev/null; then
        echo "   ✅ route.js im Build gefunden!"
    else
        echo "   ❌ route.js NICHT im Build gefunden!"
    fi
else
    echo "   ❌ Build-Verzeichnis existiert NICHT: $BUILD_DIR"
fi
echo ""

# 6. Prüfe Docker Compose Konfiguration
echo "6. Docker Compose Konfiguration:"
echo "-------------------------------"
cd /opt/hd-app/The-Connection-Key
if [ -f "docker-compose.yml" ]; then
    echo "   ✅ docker-compose.yml gefunden"
    if grep -q "volumes:" docker-compose.yml && grep -A 5 "frontend:" docker-compose.yml | grep -q "volumes:"; then
        echo "   ⚠️  Volumes sind gemountet - Dateien sollten direkt verfügbar sein"
        grep -A 10 "frontend:" docker-compose.yml | grep -E "(volumes|\./frontend)" || echo "   Keine Volumes für frontend gefunden"
    else
        echo "   ⚠️  Keine Volumes gemountet - Container muss neu gebaut werden"
    fi
else
    echo "   ❌ docker-compose.yml nicht gefunden"
fi
echo ""

# 7. Teste API Route
echo "7. API Route Test:"
echo "-----------------"
echo "   Teste GET /api/agents/tasks..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/agents/tasks || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Route funktioniert! (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "   ❌ Route gibt 404 zurück"
elif [ "$HTTP_CODE" = "500" ]; then
    echo "   ⚠️  Route gibt 500 zurück (Server-Fehler)"
else
    echo "   ❌ Route nicht erreichbar (HTTP $HTTP_CODE)"
fi
echo ""

# 8. Zusammenfassung und Lösung
echo "8. Zusammenfassung:"
echo "------------------"
echo ""

if [ "$NODE_ENV" = "production" ]; then
    echo "❌ PROBLEM: Next.js läuft im Production-Modus!"
    echo ""
    echo "🔧 LÖSUNG: Route muss beim Build vorhanden sein!"
    echo ""
    echo "Schritte:"
    echo "1. Stelle sicher, dass die Datei lokal existiert:"
    echo "   $LOCAL_ROUTE_FILE"
    echo ""
    echo "2. Baue Container neu (mit --no-cache):"
    echo "   cd /opt/hd-app/The-Connection-Key"
    echo "   docker compose build --no-cache frontend"
    echo "   docker compose up -d frontend"
    echo ""
    echo "3. Prüfe Build-Logs auf Fehler:"
    echo "   docker compose logs frontend | grep -i error"
    echo ""
    echo "4. Falls das nicht funktioniert, prüfe:"
    echo "   - Ob die Datei im richtigen Verzeichnis ist (frontend/app/api/agents/tasks/route.ts)"
    echo "   - Ob es TypeScript-Fehler gibt"
    echo "   - Ob die Route-Datei korrekt exportiert (export async function GET/POST)"
else
    echo "✅ Next.js läuft im Development-Modus"
    echo "   Route sollte zur Laufzeit geladen werden"
    echo ""
    echo "🔧 Falls Route nicht funktioniert:"
    echo "1. Prüfe ob Datei im Container ist:"
    echo "   docker exec $CONTAINER_NAME ls -la $ROUTE_FILE"
    echo ""
    echo "2. Prüfe Container-Logs:"
    echo "   docker compose logs frontend | tail -50"
fi
echo ""
