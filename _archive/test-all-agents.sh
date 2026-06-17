#!/bin/bash

# Teste alle Agent-Routen
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🧪 Teste alle Agent-Routen"
echo "=========================="
echo ""

# Basis-URL
BASE_URL="http://localhost:3000"
TEST_MESSAGE="Test-Nachricht für Agent-Prüfung"

# Arrays für Ergebnisse
declare -a SUCCESSFUL_AGENTS
declare -a FAILED_AGENTS
declare -a SKIPPED_AGENTS

# Funktion zum Testen einer Route
test_agent_route() {
    local AGENT_ID=$1
    local AGENT_NAME=$2
    local ENDPOINT="${BASE_URL}/api/agents/${AGENT_ID}"
    
    echo "🔍 Teste: ${AGENT_NAME} (${AGENT_ID})"
    echo "   Endpoint: ${ENDPOINT}"
    
    # Teste GET (falls vorhanden)
    HTTP_CODE_GET=$(curl -s -o /tmp/${AGENT_ID}-get.json -w "%{http_code}" \
        -X GET "${ENDPOINT}" 2>/dev/null || echo "000")
    
    # Teste POST
    HTTP_CODE_POST=$(curl -s -o /tmp/${AGENT_ID}-post.json -w "%{http_code}" \
        -X POST "${ENDPOINT}" \
        -H "Content-Type: application/json" \
        -d "{\"message\": \"${TEST_MESSAGE}\"}" 2>/dev/null || echo "000")
    
    # Auswertung POST
    if [ "$HTTP_CODE_POST" = "200" ]; then
        echo "   ✅ POST funktioniert (HTTP $HTTP_CODE_POST)"
        SUCCESSFUL_AGENTS+=("${AGENT_NAME} (${AGENT_ID}) - POST")
        
        # Zeige Response (erste Zeilen)
        if [ -f "/tmp/${AGENT_ID}-post.json" ]; then
            RESPONSE_PREVIEW=$(cat /tmp/${AGENT_ID}-post.json | head -3 | jq -r '.success, .error, .message' 2>/dev/null | head -1)
            if [ -n "$RESPONSE_PREVIEW" ]; then
                echo "   📄 Response: $RESPONSE_PREVIEW"
            fi
        fi
    elif [ "$HTTP_CODE_POST" = "500" ]; then
        echo "   ❌ POST gibt HTTP 500 (Fehler)"
        FAILED_AGENTS+=("${AGENT_NAME} (${AGENT_ID}) - POST")
        
        # Zeige Fehler-Details
        if [ -f "/tmp/${AGENT_ID}-post.json" ]; then
            ERROR_MSG=$(cat /tmp/${AGENT_ID}-post.json | jq -r '.error // .details // "Unbekannter Fehler"' 2>/dev/null | head -1)
            echo "   ⚠️  Fehler: $ERROR_MSG"
        fi
    elif [ "$HTTP_CODE_POST" = "404" ]; then
        echo "   ⚠️  POST gibt HTTP 404 (Route nicht gefunden)"
        SKIPPED_AGENTS+=("${AGENT_NAME} (${AGENT_ID}) - POST")
    elif [ "$HTTP_CODE_POST" = "400" ]; then
        echo "   ⚠️  POST gibt HTTP 400 (Bad Request)"
        FAILED_AGENTS+=("${AGENT_NAME} (${AGENT_ID}) - POST")
    elif [ "$HTTP_CODE_POST" = "401" ]; then
        echo "   ⚠️  POST gibt HTTP 401 (Unauthorized - Authentifizierung erforderlich)"
        FAILED_AGENTS+=("${AGENT_NAME} (${AGENT_ID}) - POST")
    else
        echo "   ⚠️  POST gibt HTTP $HTTP_CODE_POST (unbekannter Status)"
        FAILED_AGENTS+=("${AGENT_NAME} (${AGENT_ID}) - POST")
    fi
    
    # GET-Status (optional, separat zählen)
    if [ "$HTTP_CODE_GET" = "200" ]; then
        echo "   ✅ GET funktioniert (HTTP $HTTP_CODE_GET)"
        SUCCESSFUL_AGENTS+=("${AGENT_NAME} (${AGENT_ID}) - GET")
    elif [ "$HTTP_CODE_GET" = "401" ]; then
        echo "   ⚠️  GET gibt HTTP 401 (Unauthorized)"
        FAILED_AGENTS+=("${AGENT_NAME} (${AGENT_ID}) - GET")
    elif [ "$HTTP_CODE_GET" != "000" ] && [ "$HTTP_CODE_GET" != "404" ]; then
        echo "   ℹ️  GET gibt HTTP $HTTP_CODE_GET"
    fi
    
    echo ""
}

# 1. Teste Tasks Route (GET/POST)
echo "📋 1. Tasks Route"
echo "-----------------"
echo "🔍 Teste: Tasks Route"
echo "   Endpoint: ${BASE_URL}/api/agents/tasks"

# GET Test
HTTP_CODE_GET=$(curl -s -o /tmp/tasks-get.json -w "%{http_code}" \
    -X GET "${BASE_URL}/api/agents/tasks" 2>/dev/null || echo "000")

if [ "$HTTP_CODE_GET" = "200" ]; then
    echo "   ✅ GET funktioniert (HTTP $HTTP_CODE_GET)"
    TASK_COUNT=$(cat /tmp/tasks-get.json | jq -r '.tasks | length' 2>/dev/null || echo "?")
    echo "   📊 Tasks gefunden: $TASK_COUNT"
    SUCCESSFUL_AGENTS+=("Tasks (GET)")
else
    echo "   ❌ GET gibt HTTP $HTTP_CODE_GET"
    FAILED_AGENTS+=("Tasks (GET)")
fi

# POST Test (Statistics)
HTTP_CODE_POST=$(curl -s -o /tmp/tasks-post.json -w "%{http_code}" \
    -X POST "${BASE_URL}/api/agents/tasks" \
    -H "Content-Type: application/json" \
    -d '{"userId": "test"}' 2>/dev/null || echo "000")

if [ "$HTTP_CODE_POST" = "200" ]; then
    echo "   ✅ POST (Statistics) funktioniert (HTTP $HTTP_CODE_POST)"
    SUCCESSFUL_AGENTS+=("Tasks (POST)")
elif [ "$HTTP_CODE_POST" = "401" ]; then
    echo "   ⚠️  POST gibt HTTP 401 (Unauthorized - möglicherweise Middleware)"
    FAILED_AGENTS+=("Tasks (POST)")
else
    echo "   ⚠️  POST gibt HTTP $HTTP_CODE_POST"
    if [ "$HTTP_CODE_POST" != "000" ]; then
        FAILED_AGENTS+=("Tasks (POST)")
    fi
fi

echo ""

# 2. Teste alle Agent-Routen
echo "🤖 2. Agent-Routen"
echo "------------------"

# Liste aller Agenten
AGENTS=(
    "website-ux-agent:Website / UX Agent"
    "marketing:Marketing Agent"
    "automation:Automation Agent"
    "sales:Sales Agent"
    "social-youtube:Social-YouTube Agent"
    "chart-development:Chart Development Agent"
)

# Teste jeden Agenten
for AGENT in "${AGENTS[@]}"; do
    AGENT_ID=$(echo $AGENT | cut -d':' -f1)
    AGENT_NAME=$(echo $AGENT | cut -d':' -f2)
    test_agent_route "$AGENT_ID" "$AGENT_NAME"
done

# 3. Zusammenfassung
echo "📊 3. Zusammenfassung"
echo "====================="
echo ""

TOTAL_SUCCESS=${#SUCCESSFUL_AGENTS[@]}
TOTAL_FAILED=${#FAILED_AGENTS[@]}
TOTAL_SKIPPED=${#SKIPPED_AGENTS[@]}
TOTAL_AGENTS=$((TOTAL_SUCCESS + TOTAL_FAILED + TOTAL_SKIPPED))

echo "✅ Erfolgreich: $TOTAL_SUCCESS"
if [ $TOTAL_SUCCESS -gt 0 ]; then
    for AGENT in "${SUCCESSFUL_AGENTS[@]}"; do
        echo "   - $AGENT"
    done
fi
echo ""

if [ $TOTAL_FAILED -gt 0 ]; then
    echo "❌ Fehler: $TOTAL_FAILED"
    for AGENT in "${FAILED_AGENTS[@]}"; do
        echo "   - $AGENT"
    done
    echo ""
fi

if [ $TOTAL_SKIPPED -gt 0 ]; then
    echo "⚠️  Übersprungen: $TOTAL_SKIPPED"
    for AGENT in "${SKIPPED_AGENTS[@]}"; do
        echo "   - $AGENT"
    done
    echo ""
fi

echo "📈 Gesamt: $TOTAL_AGENTS Routen getestet"
echo ""

# 4. Detaillierte Fehler-Analyse
if [ $TOTAL_FAILED -gt 0 ]; then
    echo "🔍 4. Fehler-Analyse"
    echo "-------------------"
    echo ""
    
    for AGENT in "${FAILED_AGENTS[@]}"; do
        AGENT_ID=$(echo "$AGENT" | grep -oP '\([^)]+\)' | tr -d '()')
        if [ -n "$AGENT_ID" ] && [ "$AGENT_ID" != "GET" ] && [ "$AGENT_ID" != "POST" ]; then
            echo "📄 ${AGENT}:"
            if [ -f "/tmp/${AGENT_ID}-post.json" ]; then
                echo "   Response:"
                cat /tmp/${AGENT_ID}-post.json | jq '.' 2>/dev/null | head -10 || cat /tmp/${AGENT_ID}-post.json | head -10
                echo ""
            fi
        fi
    done
fi

# 5. Empfehlungen
echo "💡 5. Empfehlungen"
echo "----------------"
echo ""

if [ $TOTAL_FAILED -eq 0 ]; then
    echo "✅ Alle Agent-Routen funktionieren!"
    echo ""
    echo "🎯 Nächste Schritte:"
    echo "   1. Frontend-Seiten testen:"
    echo "      curl http://localhost:3000/coach/agents/tasks"
    echo "      curl http://localhost:3000/coach/agents/marketing"
    echo ""
    echo "   2. Route Status Matrix aktualisieren:"
    echo "      Alle Routen als ✅ markieren"
else
    echo "⚠️  Einige Routen haben Probleme"
    echo ""
    echo "🔧 Debugging-Schritte:"
    echo "   1. Prüfe Container-Logs:"
    echo "      docker compose -f docker-compose.yml logs frontend | tail -100"
    echo ""
    echo "   2. Prüfe spezifische Route-Dateien:"
    for AGENT in "${FAILED_AGENTS[@]}"; do
        AGENT_ID=$(echo "$AGENT" | grep -oP '\([^)]+\)' | tr -d '()')
        if [ -n "$AGENT_ID" ] && [ "$AGENT_ID" != "GET" ] && [ "$AGENT_ID" != "POST" ]; then
            echo "      cat frontend/app/api/agents/${AGENT_ID}/route.ts | head -60"
        fi
    done
    echo ""
    echo "   3. Teste MCP Server direkt:"
    echo "      curl -X POST http://138.199.237.34:7000/agent/[AGENT_ID] -H 'Content-Type: application/json' -d '{\"message\": \"Test\"}'"
fi
echo ""

# 6. Teste Frontend-Seiten (optional)
echo "🌐 6. Frontend-Seiten (optional)"
echo "--------------------------------"
echo ""

FRONTEND_PAGES=(
    "/coach/agents/tasks"
    "/coach/agents/marketing"
    "/coach/agents/automation"
    "/coach/agents/sales"
    "/coach/agents/social-youtube"
    "/coach/agents/chart"
)

FRONTEND_SUCCESS=0
FRONTEND_FAILED=0

for PAGE in "${FRONTEND_PAGES[@]}"; do
    PAGE_NAME=$(echo $PAGE | cut -d'/' -f4)
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
        "${BASE_URL}${PAGE}" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   ✅ ${PAGE} (HTTP $HTTP_CODE)"
        FRONTEND_SUCCESS=$((FRONTEND_SUCCESS + 1))
    else
        echo "   ⚠️  ${PAGE} (HTTP $HTTP_CODE)"
        FRONTEND_FAILED=$((FRONTEND_FAILED + 1))
    fi
done

echo ""
echo "   Frontend: $FRONTEND_SUCCESS erfolgreich, $FRONTEND_FAILED fehlerhaft"
echo ""

# Cleanup
rm -f /tmp/*-get.json /tmp/*-post.json 2>/dev/null

# Finale Zusammenfassung
echo "════════════════════════════════════════"
echo "📊 FINALE ZUSAMMENFASSUNG"
echo "════════════════════════════════════════"
echo ""
echo "API-Routen:"
echo "  ✅ Erfolgreich: $TOTAL_SUCCESS"
echo "  ❌ Fehler: $TOTAL_FAILED"
echo "  ⚠️  Übersprungen: $TOTAL_SKIPPED"
echo ""
echo "Frontend-Seiten:"
echo "  ✅ Erfolgreich: $FRONTEND_SUCCESS"
echo "  ⚠️  Fehler: $FRONTEND_FAILED"
echo ""

if [ $TOTAL_FAILED -eq 0 ] && [ $FRONTEND_FAILED -eq 0 ]; then
    echo "🎉 ALLES FUNKTIONIERT PERFEKT!"
else
    echo "⚠️  Es gibt noch Probleme zu beheben"
fi
echo ""
echo "✅ Test abgeschlossen!"
echo ""
