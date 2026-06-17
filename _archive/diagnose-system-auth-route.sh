#!/bin/bash

# Diagnose System-Auth Route Problem
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🔍 Diagnose System-Auth Route"
echo "============================="
echo ""

# 1. Prüfe ob Dateien auf Server existieren
echo "1. Prüfe Dateien auf Server..."
echo "-------------------------------"

FRONTEND_DIR="integration/frontend"
SYSTEM_AUTH_FILE="$FRONTEND_DIR/lib/system-auth.ts"
SYSTEM_ROUTE_FILE="$FRONTEND_DIR/app/api/system/agents/tasks/route.ts"

if [ -f "$SYSTEM_AUTH_FILE" ]; then
    echo "   ✅ system-auth.ts vorhanden: $SYSTEM_AUTH_FILE"
else
    echo "   ❌ system-auth.ts FEHLT: $SYSTEM_AUTH_FILE"
fi

if [ -f "$SYSTEM_ROUTE_FILE" ]; then
    echo "   ✅ Route vorhanden: $SYSTEM_ROUTE_FILE"
    echo "   Erste 5 Zeilen:"
    head -5 "$SYSTEM_ROUTE_FILE" | sed 's/^/      /'
else
    echo "   ❌ Route FEHLT: $SYSTEM_ROUTE_FILE"
fi

echo ""

# 2. Prüfe Container
echo "2. Prüfe Container..."
echo "-------------------"

FRONTEND_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i frontend | head -1)

if [ -z "$FRONTEND_CONTAINER" ]; then
    echo "   ❌ Frontend-Container nicht gefunden!"
    exit 1
fi

echo "   Container: $FRONTEND_CONTAINER"
echo ""

# 3. Prüfe ob Dateien im Container sind
echo "3. Prüfe Dateien im Container..."
echo "-------------------------------"

echo "   Prüfe system-auth.ts..."
if docker exec $FRONTEND_CONTAINER test -f /app/lib/system-auth.ts; then
    echo "   ✅ system-auth.ts im Container vorhanden"
    echo "   Erste 5 Zeilen:"
    docker exec $FRONTEND_CONTAINER head -5 /app/lib/system-auth.ts | sed 's/^/      /'
else
    echo "   ❌ system-auth.ts FEHLT im Container!"
    echo "   📝 Container muss neu gebaut werden"
fi

echo ""

echo "   Prüfe Route..."
if docker exec $FRONTEND_CONTAINER test -f /app/app/api/system/agents/tasks/route.ts; then
    echo "   ✅ Route im Container vorhanden"
    echo "   Erste 5 Zeilen:"
    docker exec $FRONTEND_CONTAINER head -5 /app/app/api/system/agents/tasks/route.ts | sed 's/^/      /'
else
    echo "   ❌ Route FEHLT im Container!"
    echo "   📝 Container muss neu gebaut werden"
fi

echo ""

# 4. Prüfe Next.js Build
echo "4. Prüfe Next.js Build..."
echo "------------------------"

echo "   Prüfe .next Verzeichnis..."
if docker exec $FRONTEND_CONTAINER test -d /app/.next; then
    echo "   ✅ .next Verzeichnis vorhanden"
    
    echo "   Prüfe Route im Build..."
    if docker exec $FRONTEND_CONTAINER test -f /app/.next/server/app/api/system/agents/tasks/route.js; then
        echo "   ✅ Route im Build vorhanden"
    else
        echo "   ❌ Route NICHT im Build!"
        echo "   Verfügbare API-Routen im Build:"
        docker exec $FRONTEND_CONTAINER find /app/.next/server/app/api -name "route.js" 2>/dev/null | head -10 | sed 's/^/      /'
    fi
else
    echo "   ❌ .next Verzeichnis nicht gefunden!"
fi

echo ""

# 5. Prüfe Verzeichnisstruktur im Container
echo "5. Prüfe Verzeichnisstruktur..."
echo "-------------------------------"

echo "   /app/app/api/ Verzeichnisse:"
docker exec $FRONTEND_CONTAINER ls -la /app/app/api/ 2>/dev/null | sed 's/^/      /' || echo "      ❌ /app/app/api/ nicht gefunden"

echo ""
echo "   /app/app/api/system/ (falls vorhanden):"
docker exec $FRONTEND_CONTAINER ls -la /app/app/api/system/ 2>/dev/null | sed 's/^/      /' || echo "      ❌ /app/app/api/system/ nicht gefunden"

echo ""

# 6. Prüfe Dockerfile / Build Context
echo "6. Prüfe Build Context..."
echo "------------------------"

echo "   Prüfe Dockerfile..."
if [ -f "Dockerfile" ]; then
    echo "   ✅ Dockerfile vorhanden"
    echo "   Build Context:"
    grep -E "COPY|WORKDIR|FROM" Dockerfile | head -10 | sed 's/^/      /'
else
    echo "   ⚠️  Dockerfile nicht gefunden"
fi

echo ""

# 7. Zusammenfassung & Lösung
echo "7. Zusammenfassung & Lösung:"
echo "---------------------------"
echo ""

if [ ! -f "$SYSTEM_AUTH_FILE" ] || [ ! -f "$SYSTEM_ROUTE_FILE" ]; then
    echo "❌ PROBLEM: Dateien fehlen auf Server!"
    echo ""
    echo "📝 Lösung:"
    echo "   1. Deploy System-Auth Dateien:"
    echo "      ./deploy-system-auth-auf-server.sh"
    echo ""
    echo "   2. Container neu bauen:"
    echo "      docker compose -f docker-compose.yml build frontend"
    echo ""
    echo "   3. Container starten:"
    echo "      docker compose -f docker-compose.yml up -d frontend"
elif ! docker exec $FRONTEND_CONTAINER test -f /app/lib/system-auth.ts || ! docker exec $FRONTEND_CONTAINER test -f /app/app/api/system/agents/tasks/route.ts; then
    echo "❌ PROBLEM: Dateien fehlen im Container!"
    echo ""
    echo "📝 Lösung:"
    echo "   1. Container neu bauen:"
    echo "      docker compose -f docker-compose.yml build frontend"
    echo ""
    echo "   2. Container starten:"
    echo "      docker compose -f docker-compose.yml up -d frontend"
    echo ""
    echo "   3. Warte 15 Sekunden und teste:"
    echo "      ./test-system-auth-final.sh"
else
    echo "✅ Dateien vorhanden, aber Route funktioniert nicht"
    echo ""
    echo "📝 Mögliche Ursachen:"
    echo "   1. Next.js Build ist veraltet"
    echo "   2. Route-Pfad ist falsch"
    echo "   3. Import-Pfad in route.ts ist falsch"
    echo ""
    echo "📝 Lösung:"
    echo "   1. Container komplett neu bauen:"
    echo "      docker compose -f docker-compose.yml build --no-cache frontend"
    echo ""
    echo "   2. Container starten:"
    echo "      docker compose -f docker-compose.yml up -d frontend"
    echo ""
    echo "   3. Prüfe Container-Logs:"
    echo "      docker logs $FRONTEND_CONTAINER | tail -100"
fi

echo ""
