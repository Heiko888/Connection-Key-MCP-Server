#!/bin/bash

# Fix HTTP 401 bei Tasks Route
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🔧 Fix HTTP 401 bei Tasks Route"
echo "==============================="
echo ""

# 1. Prüfe Middleware
echo "1. Prüfe Middleware..."
echo "---------------------"
if [ -f "frontend/middleware.ts" ]; then
    echo "   ⚠️  Middleware.ts gefunden"
    echo "   Inhalt:"
    cat frontend/middleware.ts | head -30
    echo ""
elif [ -f "frontend/middleware.js" ]; then
    echo "   ⚠️  Middleware.js gefunden"
    echo "   Inhalt:"
    cat frontend/middleware.js | head -30
    echo ""
else
    echo "   ✅ Keine Middleware gefunden"
fi
echo ""

# 2. Teste Tasks Route mit verschiedenen Headers
echo "2. Teste Tasks Route..."
echo "----------------------"

BASE_URL="http://localhost:3000"

# Test ohne Header
echo "   Test ohne Header:"
HTTP_CODE=$(curl -s -o /tmp/tasks-test1.json -w "%{http_code}" \
    -X GET "${BASE_URL}/api/agents/tasks" 2>/dev/null || echo "000")
echo "   HTTP $HTTP_CODE"
if [ "$HTTP_CODE" = "401" ]; then
    echo "   ⚠️  HTTP 401 - Authentifizierung erforderlich"
    cat /tmp/tasks-test1.json | head -5
fi
echo ""

# Test mit Content-Type
echo "   Test mit Content-Type Header:"
HTTP_CODE=$(curl -s -o /tmp/tasks-test2.json -w "%{http_code}" \
    -X GET "${BASE_URL}/api/agents/tasks" \
    -H "Content-Type: application/json" 2>/dev/null || echo "000")
echo "   HTTP $HTTP_CODE"
if [ "$HTTP_CODE" = "401" ]; then
    echo "   ⚠️  HTTP 401 - Authentifizierung erforderlich"
    cat /tmp/tasks-test2.json | head -5
fi
echo ""

# 3. Prüfe Route-Datei
echo "3. Prüfe Route-Datei..."
echo "----------------------"
if [ -f "frontend/app/api/agents/tasks/route.ts" ]; then
    echo "   ✅ Route vorhanden"
    
    # Prüfe auf Authentifizierung
    if grep -q "auth\|Auth\|401\|unauthorized" "frontend/app/api/agents/tasks/route.ts"; then
        echo "   ⚠️  Route enthält Authentifizierungs-Code"
        grep -n "auth\|Auth\|401\|unauthorized" "frontend/app/api/agents/tasks/route.ts" | head -5
    else
        echo "   ✅ Route hat keine explizite Authentifizierung"
    fi
else
    echo "   ❌ Route fehlt!"
fi
echo ""

# 4. Prüfe Next.js Config
echo "4. Prüfe Next.js Config..."
echo "-------------------------"
if [ -f "frontend/next.config.js" ] || [ -f "frontend/next.config.mjs" ] || [ -f "frontend/next.config.ts" ]; then
    echo "   ✅ Next.js Config gefunden"
    
    CONFIG_FILE=$(find frontend -name "next.config.*" | head -1)
    if [ -n "$CONFIG_FILE" ]; then
        echo "   Datei: $CONFIG_FILE"
        if grep -q "middleware\|auth\|401" "$CONFIG_FILE"; then
            echo "   ⚠️  Config enthält Auth/Middleware-Einstellungen"
            grep -n "middleware\|auth\|401" "$CONFIG_FILE"
        fi
    fi
else
    echo "   ⚠️  Next.js Config nicht gefunden"
fi
echo ""

# 5. Prüfe Container-Logs
echo "5. Prüfe Container-Logs für Tasks Route..."
echo "-------------------------------------------"
docker compose -f docker-compose.yml logs frontend 2>&1 | grep -i -A 5 -B 5 "tasks\|401\|unauthorized" | tail -30 || echo "   Keine relevanten Logs gefunden"
echo ""

# 6. Empfehlungen
echo "6. Empfehlungen:"
echo "---------------"
echo ""
echo "📋 Mögliche Ursachen für HTTP 401:"
echo "   1. Next.js Middleware blockiert die Route"
echo "   2. Supabase RLS (Row Level Security) ist aktiv"
echo "   3. Authentifizierung ist in der Route erforderlich"
echo ""
echo "🔧 Lösungen:"
echo ""
echo "   Option 1: Middleware prüfen/anpassen"
echo "   - Prüfe frontend/middleware.ts oder middleware.js"
echo "   - Stelle sicher, dass /api/agents/tasks nicht blockiert wird"
echo ""
echo "   Option 2: Supabase RLS prüfen"
echo "   - Prüfe Supabase Dashboard -> Authentication -> Policies"
echo "   - Stelle sicher, dass agent_tasks Tabelle lesbar ist"
echo ""
echo "   Option 3: Route direkt testen"
echo "   curl -v http://localhost:3000/api/agents/tasks"
echo "   - Prüfe Response-Header für WWW-Authenticate"
echo ""
echo "   Option 4: Container-Logs prüfen"
echo "   docker compose -f docker-compose.yml logs frontend | grep -i tasks"
echo ""
