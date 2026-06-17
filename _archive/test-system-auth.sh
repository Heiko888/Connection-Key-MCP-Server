#!/bin/bash

# Test System Auth Route
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🧪 Test System Auth Route"
echo "========================="
echo ""

BASE_URL="http://localhost:3000"

# Hole Token aus Environment
CONTAINER_ID=$(docker ps -q -f name=frontend)

if [ -z "$CONTAINER_ID" ]; then
    echo "❌ Container läuft nicht!"
    exit 1
fi

SYSTEM_TOKEN=$(docker exec $CONTAINER_ID env | grep "AGENT_SYSTEM_TOKEN" | cut -d'=' -f2 || echo "")

if [ -z "$SYSTEM_TOKEN" ]; then
    echo "⚠️  AGENT_SYSTEM_TOKEN nicht gesetzt!"
    echo ""
    echo "🔧 Setze Token in docker-compose.yml:"
    echo "   AGENT_SYSTEM_TOKEN=your-64-char-random-secret"
    echo ""
    echo "📋 Teste ohne Token (sollte 401 geben):"
    SYSTEM_TOKEN=""
else
    echo "✅ AGENT_SYSTEM_TOKEN gefunden"
    echo ""
fi

# 1. Test ohne Token (sollte 401 geben)
echo "1. Test ohne Token..."
echo "-------------------"
HTTP_CODE=$(curl -s -o /tmp/system-test-no-token.json -w "%{http_code}" \
    -X GET "${BASE_URL}/api/system/agents/tasks" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "401" ]; then
    echo "   ✅ Korrekt: HTTP 401 (Unauthorized)"
    RESPONSE=$(cat /tmp/system-test-no-token.json)
    echo "   Response:"
    echo "$RESPONSE" | jq '.' 2>/dev/null | head -5 || echo "$RESPONSE" | head -5
elif [ "$HTTP_CODE" = "200" ]; then
    echo "   ⚠️  HTTP 200 - Route akzeptiert Requests ohne Token (Sicherheitsproblem!)"
else
    echo "   ⚠️  HTTP $HTTP_CODE"
    cat /tmp/system-test-no-token.json | head -5
fi
echo ""

# 2. Test mit Token (sollte 200 geben)
if [ -n "$SYSTEM_TOKEN" ]; then
    echo "2. Test mit Token..."
    echo "------------------"
    HTTP_CODE=$(curl -s -o /tmp/system-test-with-token.json -w "%{http_code}" \
        -X GET "${BASE_URL}/api/system/agents/tasks" \
        -H "x-agent-token: ${SYSTEM_TOKEN}" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   ✅ Erfolg: HTTP 200"
        RESPONSE=$(cat /tmp/system-test-with-token.json)
        echo "   Response:"
        echo "$RESPONSE" | jq '.' 2>/dev/null | head -20 || echo "$RESPONSE" | head -20
        
        # Prüfe Response-Schema
        if echo "$RESPONSE" | jq -e '.success == true' >/dev/null 2>&1; then
            echo ""
            echo "   ✅ Response-Schema korrekt (success: true)"
        fi
        
        if echo "$RESPONSE" | jq -e '.meta.source == "system"' >/dev/null 2>&1; then
            echo "   ✅ Meta-Schema korrekt (source: system)"
        fi
    elif [ "$HTTP_CODE" = "401" ]; then
        echo "   ❌ HTTP 401 - Token wird nicht akzeptiert"
        RESPONSE=$(cat /tmp/system-test-with-token.json)
        echo "   Response:"
        echo "$RESPONSE" | head -10
    else
        echo "   ⚠️  HTTP $HTTP_CODE"
        cat /tmp/system-test-with-token.json | head -10
    fi
    echo ""
    
    # 3. Test POST
    echo "3. Test POST (Statistics)..."
    echo "---------------------------"
    HTTP_CODE=$(curl -s -o /tmp/system-test-post.json -w "%{http_code}" \
        -X POST "${BASE_URL}/api/system/agents/tasks" \
        -H "x-agent-token: ${SYSTEM_TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{"userId": "test"}' 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   ✅ POST funktioniert: HTTP 200"
        RESPONSE=$(cat /tmp/system-test-post.json)
        echo "   Response:"
        echo "$RESPONSE" | jq '.' 2>/dev/null | head -10 || echo "$RESPONSE" | head -10
    else
        echo "   ⚠️  POST gibt HTTP $HTTP_CODE"
        cat /tmp/system-test-post.json | head -10
    fi
    echo ""
fi

# 4. Vergleich: Alte Route vs. Neue Route
echo "4. Vergleich: Alte vs. Neue Route..."
echo "------------------------------------"

# Alte Route (sollte 401 geben wegen checkCoachAuth)
echo "   Alte Route /api/agents/tasks:"
OLD_HTTP=$(curl -s -o /tmp/old-route-test.json -w "%{http_code}" \
    -X GET "${BASE_URL}/api/agents/tasks" 2>/dev/null || echo "000")
echo "   HTTP $OLD_HTTP"

# Neue Route (sollte 401 geben ohne Token)
if [ -n "$SYSTEM_TOKEN" ]; then
    echo "   Neue Route /api/system/agents/tasks (mit Token):"
    NEW_HTTP=$(curl -s -o /tmp/new-route-test.json -w "%{http_code}" \
        -X GET "${BASE_URL}/api/system/agents/tasks" \
        -H "x-agent-token: ${SYSTEM_TOKEN}" 2>/dev/null || echo "000")
    echo "   HTTP $NEW_HTTP"
fi
echo ""

# 5. Zusammenfassung
echo "5. Zusammenfassung:"
echo "------------------"
echo ""

if [ "$HTTP_CODE" = "200" ] && [ -n "$SYSTEM_TOKEN" ]; then
    echo "✅ System Auth funktioniert perfekt!"
    echo ""
    echo "🎯 Nächste Schritte:"
    echo "   1. Alte Route /api/agents/tasks kann entfernt werden"
    echo "   2. Alle Agent-Routen auf /api/system/agents/* migrieren"
    echo "   3. Frontend-Komponenten auf neue Route umstellen"
else
    echo "⚠️  System Auth hat noch Probleme"
    echo ""
    echo "🔧 Prüfe:"
    echo "   1. AGENT_SYSTEM_TOKEN in docker-compose.yml gesetzt?"
    echo "   2. Container neu gebaut?"
    echo "   3. Route-Datei vorhanden?"
fi
echo ""

# Cleanup
rm -f /tmp/system-test-*.json /tmp/old-route-test.json /tmp/new-route-test.json 2>/dev/null

echo "✅ Test abgeschlossen!"
echo ""
