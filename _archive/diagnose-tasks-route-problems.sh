#!/bin/bash

# Diagnose Tasks Route Probleme
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🔍 Diagnose Tasks Route Probleme"
echo "================================"
echo ""

BASE_URL="http://localhost:3000"

# 1. Prüfe Route-Datei
echo "1. Prüfe Route-Datei..."
echo "----------------------"
if [ -f "frontend/app/api/agents/tasks/route.ts" ]; then
    echo "   ✅ Route vorhanden"
    echo "   Zeilen: $(wc -l < frontend/app/api/agents/tasks/route.ts)"
    
    # Prüfe auf Syntax-Fehler
    if grep -q "SUPABASE_SERVICE_ROLE_KEY" "frontend/app/api/agents/tasks/route.ts"; then
        echo "   ✅ Verwendet Service Role Key"
    else
        echo "   ❌ Verwendet KEIN Service Role Key!"
    fi
    
    # Prüfe auf Import-Fehler
    if grep -q "import.*createClient" "frontend/app/api/agents/tasks/route.ts"; then
        echo "   ✅ Supabase Import vorhanden"
    else
        echo "   ❌ Supabase Import fehlt!"
    fi
    
    # Zeige erste 30 Zeilen
    echo ""
    echo "   Erste 30 Zeilen:"
    head -30 frontend/app/api/agents/tasks/route.ts | sed 's/^/      /'
else
    echo "   ❌ Route fehlt komplett!"
fi
echo ""

# 2. Teste Route mit detaillierter Ausgabe
echo "2. Teste Route (GET)..."
echo "----------------------"
HTTP_CODE=$(curl -s -o /tmp/tasks-diagnose-get.json -w "%{http_code}" \
    -X GET "${BASE_URL}/api/agents/tasks" 2>&1)

echo "   HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Route funktioniert!"
    RESPONSE=$(cat /tmp/tasks-diagnose-get.json)
    echo "   Response:"
    echo "$RESPONSE" | jq '.' 2>/dev/null | head -20 || echo "$RESPONSE" | head -20
elif [ "$HTTP_CODE" = "401" ]; then
    echo "   ❌ HTTP 401 - Unauthorized"
    RESPONSE=$(cat /tmp/tasks-diagnose-get.json)
    echo "   Response:"
    echo "$RESPONSE" | head -20
    echo ""
    echo "   ⚠️  Mögliche Ursachen:"
    echo "   1. Supabase RLS blockiert trotz Service Role Key"
    echo "   2. Environment Variables fehlen oder sind falsch"
    echo "   3. Next.js Middleware blockiert die Route"
elif [ "$HTTP_CODE" = "500" ]; then
    echo "   ❌ HTTP 500 - Internal Server Error"
    RESPONSE=$(cat /tmp/tasks-diagnose-get.json)
    echo "   Response:"
    echo "$RESPONSE" | head -20
    echo ""
    echo "   ⚠️  Server-Fehler - prüfe Logs"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "   ❌ HTTP 404 - Route nicht gefunden"
    echo "   ⚠️  Route ist nicht im Build enthalten"
else
    echo "   ⚠️  Unbekannter Status: $HTTP_CODE"
    RESPONSE=$(cat /tmp/tasks-diagnose-get.json)
    echo "   Response:"
    echo "$RESPONSE" | head -20
fi
echo ""

# 3. Prüfe Container-Logs
echo "3. Prüfe Container-Logs (letzte 50 Zeilen)..."
echo "----------------------------------------------"
docker compose -f docker-compose.yml logs frontend 2>&1 | tail -50 | grep -i -E "tasks|error|401|500|supabase" || echo "   Keine relevanten Logs gefunden"
echo ""

# 4. Prüfe Environment Variables
echo "4. Prüfe Environment Variables..."
echo "---------------------------------"
CONTAINER_ID=$(docker ps -q -f name=frontend)

if [ -z "$CONTAINER_ID" ]; then
    echo "   ❌ Container läuft nicht!"
else
    echo "   Container ID: $CONTAINER_ID"
    echo ""
    
    # Supabase URL
    if docker exec $CONTAINER_ID env | grep -q "NEXT_PUBLIC_SUPABASE_URL"; then
        SUPABASE_URL=$(docker exec $CONTAINER_ID env | grep "NEXT_PUBLIC_SUPABASE_URL" | cut -d'=' -f2)
        echo "   ✅ NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL:0:50}..."
    else
        echo "   ❌ NEXT_PUBLIC_SUPABASE_URL fehlt!"
    fi
    
    # Service Role Key
    if docker exec $CONTAINER_ID env | grep -q "SUPABASE_SERVICE_ROLE_KEY"; then
        KEY_LENGTH=$(docker exec $CONTAINER_ID env | grep "SUPABASE_SERVICE_ROLE_KEY" | cut -d'=' -f2 | wc -c)
        echo "   ✅ SUPABASE_SERVICE_ROLE_KEY: $KEY_LENGTH Zeichen"
        
        if [ $KEY_LENGTH -lt 50 ]; then
            echo "   ⚠️  Key ist zu kurz (sollte ~100+ Zeichen sein)"
        fi
    else
        echo "   ❌ SUPABASE_SERVICE_ROLE_KEY fehlt!"
    fi
fi
echo ""

# 5. Prüfe ob Route im Build enthalten ist
echo "5. Prüfe ob Route im Build enthalten ist..."
echo "-------------------------------------------"
if docker exec $CONTAINER_ID ls -la /app/app/api/agents/tasks/route.js 2>/dev/null; then
    echo "   ✅ Route ist im Build enthalten"
    echo "   Dateigröße: $(docker exec $CONTAINER_ID ls -lh /app/app/api/agents/tasks/route.js | awk '{print $5}')"
else
    echo "   ❌ Route ist NICHT im Build enthalten!"
    echo "   ⚠️  Das ist wahrscheinlich das Problem!"
    echo ""
    echo "   Prüfe Build-Verzeichnis:"
    docker exec $CONTAINER_ID ls -la /app/app/api/agents/ 2>/dev/null || echo "   Verzeichnis existiert nicht"
fi
echo ""

# 6. Teste Supabase-Verbindung direkt
echo "6. Teste Supabase-Verbindung direkt..."
echo "--------------------------------------"
if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_KEY" ]; then
    echo "   Teste Supabase REST API..."
    
    # Test GET Request
    SUPABASE_TEST=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/agent_tasks?select=*&limit=1" \
        -H "apikey: ${SUPABASE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_KEY}" \
        -H "Content-Type: application/json" 2>&1)
    
    if echo "$SUPABASE_TEST" | grep -q "error\|Error\|ERROR"; then
        echo "   ❌ Supabase Query gibt Fehler:"
        echo "$SUPABASE_TEST" | head -10
    else
        echo "   ✅ Supabase-Verbindung funktioniert"
        echo "   Response (erste 5 Zeilen):"
        echo "$SUPABASE_TEST" | head -5
    fi
else
    echo "   ⚠️  Kann Supabase nicht testen (URL oder Key fehlt)"
fi
echo ""

# 7. Prüfe Middleware
echo "7. Prüfe Middleware..."
echo "---------------------"
if [ -f "frontend/middleware.ts" ]; then
    echo "   ⚠️  Middleware.ts gefunden"
    echo "   Prüfe ob /api/agents/tasks blockiert wird:"
    if grep -q "/api/agents/tasks" "frontend/middleware.ts"; then
        echo "   ⚠️  Route wird in Middleware erwähnt:"
        grep -n "/api/agents/tasks" "frontend/middleware.ts" | head -5
    else
        echo "   ✅ Route wird nicht explizit blockiert"
    fi
elif [ -f "frontend/middleware.js" ]; then
    echo "   ⚠️  Middleware.js gefunden"
    if grep -q "/api/agents/tasks" "frontend/middleware.js"; then
        echo "   ⚠️  Route wird in Middleware erwähnt:"
        grep -n "/api/agents/tasks" "frontend/middleware.js" | head -5
    else
        echo "   ✅ Route wird nicht explizit blockiert"
    fi
else
    echo "   ✅ Keine Middleware gefunden"
fi
echo ""

# 8. Zusammenfassung & Empfehlungen
echo "8. Zusammenfassung & Empfehlungen:"
echo "----------------------------------"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Route funktioniert!"
    echo ""
    echo "🎯 Teste POST:"
    echo "   curl -X POST ${BASE_URL}/api/agents/tasks -H 'Content-Type: application/json' -d '{\"userId\": \"test\"}'"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "❌ HTTP 401 Problem identifiziert"
    echo ""
    echo "🔧 Lösungsvorschläge:"
    echo ""
    echo "   1. Prüfe Supabase RLS Policies:"
    echo "      - Gehe zu Supabase Dashboard"
    echo "      - Prüfe Authentication -> Policies für agent_tasks"
    echo "      - Stelle sicher, dass Service Role Key RLS umgeht"
    echo ""
    echo "   2. Prüfe Environment Variables:"
    echo "      docker exec \$(docker ps -q -f name=frontend) env | grep SUPABASE"
    echo ""
    echo "   3. Route neu bauen:"
    echo "      ./fix-tasks-401-complete.sh"
    echo ""
elif [ "$HTTP_CODE" = "500" ]; then
    echo "❌ HTTP 500 - Server-Fehler"
    echo ""
    echo "🔧 Lösungsvorschläge:"
    echo ""
    echo "   1. Prüfe vollständige Logs:"
    echo "      docker compose -f docker-compose.yml logs frontend | tail -100"
    echo ""
    echo "   2. Prüfe Route auf Syntax-Fehler:"
    echo "      cat frontend/app/api/agents/tasks/route.ts"
    echo ""
    echo "   3. Container neu bauen:"
    echo "      docker compose -f docker-compose.yml build --no-cache frontend"
    echo "      docker compose -f docker-compose.yml up -d frontend"
    echo ""
elif [ "$HTTP_CODE" = "404" ]; then
    echo "❌ HTTP 404 - Route nicht gefunden"
    echo ""
    echo "🔧 Lösungsvorschläge:"
    echo ""
    echo "   1. Route kopieren:"
    echo "      mkdir -p frontend/app/api/agents/tasks"
    echo "      cp integration/api-routes/app-router/agents/tasks/route.ts frontend/app/api/agents/tasks/route.ts"
    echo ""
    echo "   2. Container neu bauen:"
    echo "      docker compose -f docker-compose.yml build --no-cache frontend"
    echo "      docker compose -f docker-compose.yml up -d frontend"
    echo ""
else
    echo "⚠️  Unbekanntes Problem (HTTP $HTTP_CODE)"
    echo ""
    echo "🔧 Debugging:"
    echo "   1. Prüfe Container-Logs:"
    echo "      docker compose -f docker-compose.yml logs frontend | tail -100"
    echo ""
    echo "   2. Teste Route manuell:"
    echo "      curl -v ${BASE_URL}/api/agents/tasks"
fi
echo ""

# Cleanup
rm -f /tmp/tasks-diagnose-*.json 2>/dev/null

echo "✅ Diagnose abgeschlossen!"
echo ""
