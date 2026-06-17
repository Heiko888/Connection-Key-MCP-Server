#!/bin/bash

# Prüft Tasks Route nach dem Build
# Führt auf Server aus

cd /opt/hd-app/The-Connection-Key

echo "🔍 Prüfe Tasks Route nach dem Build"
echo "===================================="
echo ""

# 1. Prüfe ob Route im Build ist
echo "1. Prüfe ob Route im Build ist..."
BUILD_ROUTE=$(docker exec the-connection-key-frontend-1 find /app/.next -path "*/api/agents/tasks/*" -name "route.js" -type f 2>/dev/null | head -1)
if [ -n "$BUILD_ROUTE" ]; then
    echo "   ✅ Route ist im Build!"
    echo "   $BUILD_ROUTE"
else
    echo "   ❌ Route ist NICHT im Build"
    echo "   Das ist das Problem!"
fi
echo ""

# 2. Prüfe ob Datei lokal existiert
echo "2. Prüfe ob Datei lokal existiert..."
if [ -f "frontend/app/api/agents/tasks/route.ts" ]; then
    echo "   ✅ Datei existiert"
    echo "   Zeilen: $(wc -l < frontend/app/api/agents/tasks/route.ts)"
    echo "   Größe: $(du -h frontend/app/api/agents/tasks/route.ts | cut -f1)"
else
    echo "   ❌ Datei existiert nicht!"
fi
echo ""

# 3. Prüfe Build-Logs auf Fehler
echo "3. Prüfe Build-Logs auf Fehler..."
docker compose logs frontend 2>&1 | grep -i "error\|fail\|tasks\|route" | tail -20 || echo "   Keine offensichtlichen Fehler"
echo ""

# 4. Prüfe Datei-Inhalt auf Syntax-Fehler
echo "4. Prüfe Datei-Inhalt..."
if [ -f "frontend/app/api/agents/tasks/route.ts" ]; then
    echo "   Erste 15 Zeilen:"
    head -15 frontend/app/api/agents/tasks/route.ts
    echo ""
    echo "   Letzte 5 Zeilen:"
    tail -5 frontend/app/api/agents/tasks/route.ts
fi
echo ""

# 5. Vergleich: Andere Agent-Routes
echo "5. Vergleich: Andere Agent-Routes im Build..."
docker exec the-connection-key-frontend-1 find /app/.next -path "*/api/agents/*" -name "route.js" -type f 2>/dev/null | grep -v node_modules | sort
echo ""

# 6. Lösungsvorschlag
echo "6. Lösungsvorschlag:"
echo "-------------------"
if [ -f "frontend/app/api/agents/tasks/route.ts" ] && [ -z "$BUILD_ROUTE" ]; then
    echo "   ✅ Datei existiert lokal"
    echo "   ❌ Route ist nicht im Build"
    echo ""
    echo "   Mögliche Ursachen:"
    echo "   1. Build-Fehler (TypeScript/Syntax)"
    echo "   2. Next.js erkennt Route nicht"
    echo "   3. Datei wurde nach Build erstellt"
    echo ""
    echo "   Lösung: Prüfe Build-Logs auf TypeScript-Fehler"
    echo "   docker compose logs frontend | grep -i 'error\|typescript'"
elif [ ! -f "frontend/app/api/agents/tasks/route.ts" ]; then
    echo "   ❌ Datei existiert nicht lokal"
    echo "   Lösung: Datei erstellen"
fi
echo ""

echo "✅ Prüfung abgeschlossen!"
