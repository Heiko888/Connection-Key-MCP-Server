#!/bin/bash

# Detaillierte Prüfung aller Routes im Container
CONTAINER_NAME="the-connection-key-frontend-1"

echo "🔍 Detaillierte Route-Prüfung"
echo "============================="
echo ""

if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ Container $CONTAINER_NAME läuft nicht!"
    exit 1
fi

echo "✅ Container läuft"
echo ""

# Prüfe Verzeichnisstruktur
echo "📁 Prüfe Verzeichnisstruktur:"
echo "----------------------------"
echo ""

echo "1. Existiert /app/app?"
docker exec $CONTAINER_NAME test -d /app/app && echo "   ✅ /app/app existiert" || echo "   ❌ /app/app existiert nicht"
echo ""

echo "2. Existiert /app/pages?"
docker exec $CONTAINER_NAME test -d /app/pages && echo "   ✅ /app/pages existiert" || echo "   ❌ /app/pages existiert nicht"
echo ""

echo "3. Was ist in /app?"
docker exec $CONTAINER_NAME ls -la /app/ | head -20
echo ""

# Suche nach route.ts Dateien
echo "4. Suche nach route.ts Dateien (alle):"
docker exec $CONTAINER_NAME find /app -name "route.ts" -type f 2>/dev/null | head -20
echo ""

# Suche nach .ts Dateien in api Verzeichnissen
echo "5. Suche nach .ts Dateien in api Verzeichnissen:"
docker exec $CONTAINER_NAME find /app -path "*/api/*" -name "*.ts" -type f 2>/dev/null | head -20
echo ""

# Prüfe spezifische Pfade
echo "6. Prüfe spezifische Pfade:"
echo ""

PATHS=(
    "/app/app/api"
    "/app/pages/api"
    "/app/src/app/api"
    "/app/src/pages/api"
    "/app/api"
)

for path in "${PATHS[@]}"; do
    if docker exec $CONTAINER_NAME test -d "$path" 2>/dev/null; then
        echo "   ✅ $path existiert"
        docker exec $CONTAINER_NAME find "$path" -name "*.ts" -o -name "route.ts" 2>/dev/null | head -5
    else
        echo "   ❌ $path existiert nicht"
    fi
done

echo ""
echo "✅ Prüfung abgeschlossen!"
