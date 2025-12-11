#!/bin/bash

# Fix HTTP 500 Fehler bei Marketing und Sales Agent
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🔧 Fix Marketing & Sales HTTP 500"
echo "=================================="
echo ""

# 1. Hole vollständige Fehler-Logs
echo "1. Hole Fehler-Logs..."
echo "---------------------"
echo "   Marketing Route Logs:"
docker compose -f docker-compose.yml logs frontend 2>&1 | grep -i -A 5 -B 5 "marketing\|error\|500" | tail -30
echo ""

echo "   Sales Route Logs:"
docker compose -f docker-compose.yml logs frontend 2>&1 | grep -i -A 5 -B 5 "sales\|error\|500" | tail -30
echo ""

# 2. Teste mit detaillierter Ausgabe
echo "2. Teste mit detaillierter Ausgabe..."
echo "------------------------------------"

echo "   Marketing Route Test:"
curl -v -X POST "http://localhost:3000/api/agents/marketing" \
    -H "Content-Type: application/json" \
    -d '{"message": "Test"}' 2>&1 | grep -E "< HTTP|error|Error|ERROR" | head -10
echo ""

echo "   Sales Route Test:"
curl -v -X POST "http://localhost:3000/api/agents/sales" \
    -H "Content-Type: application/json" \
    -d '{"message": "Test"}' 2>&1 | grep -E "< HTTP|error|Error|ERROR" | head -10
echo ""

# 3. Prüfe ob Dateien identisch sind
echo "3. Prüfe Route-Dateien..."
echo "------------------------"

# Vergleiche Marketing mit Automation (funktioniert)
if [ -f "frontend/app/api/agents/marketing/route.ts" ] && [ -f "frontend/app/api/agents/automation/route.ts" ]; then
    echo "   Vergleich Marketing vs Automation:"
    DIFF_COUNT=$(diff -u frontend/app/api/agents/automation/route.ts frontend/app/api/agents/marketing/route.ts | grep -E "^\+|^-" | grep -v "^+++\|^---\|AGENT_ID\|AGENT_NAME" | wc -l)
    if [ $DIFF_COUNT -eq 0 ]; then
        echo "   ✅ Dateien sind identisch (außer AGENT_ID/AGENT_NAME)"
    else
        echo "   ⚠️  $DIFF_COUNT Unterschiede gefunden"
        echo "   Erste Unterschiede:"
        diff -u frontend/app/api/agents/automation/route.ts frontend/app/api/agents/marketing/route.ts | grep -E "^\+|^-" | grep -v "^+++\|^---" | head -10
    fi
fi

# Vergleiche Sales mit Automation
if [ -f "frontend/app/api/agents/sales/route.ts" ] && [ -f "frontend/app/api/agents/automation/route.ts" ]; then
    echo "   Vergleich Sales vs Automation:"
    DIFF_COUNT=$(diff -u frontend/app/api/agents/automation/route.ts frontend/app/api/agents/sales/route.ts | grep -E "^\+|^-" | grep -v "^+++\|^---\|AGENT_ID\|AGENT_NAME" | wc -l)
    if [ $DIFF_COUNT -eq 0 ]; then
        echo "   ✅ Dateien sind identisch (außer AGENT_ID/AGENT_NAME)"
    else
        echo "   ⚠️  $DIFF_COUNT Unterschiede gefunden"
        echo "   Erste Unterschiede:"
        diff -u frontend/app/api/agents/automation/route.ts frontend/app/api/agents/sales/route.ts | grep -E "^\+|^-" | grep -v "^+++\|^---" | head -10
    fi
fi

echo ""

# 4. Prüfe MCP Server für diese Agenten
echo "4. Prüfe MCP Server..."
echo "---------------------"
MCP_URL="http://138.199.237.34:7000"

echo "   Teste Marketing Agent auf MCP Server:"
MARKETING_MCP=$(curl -s -X POST "${MCP_URL}/agent/marketing" \
    -H "Content-Type: application/json" \
    -d '{"message": "Test", "userId": "test"}' 2>&1)

if echo "$MARKETING_MCP" | grep -q "response\|error"; then
    echo "   ✅ Marketing Agent antwortet"
    echo "$MARKETING_MCP" | head -5
else
    echo "   ❌ Marketing Agent antwortet nicht korrekt"
    echo "   Response: $MARKETING_MCP"
fi
echo ""

echo "   Teste Sales Agent auf MCP Server:"
SALES_MCP=$(curl -s -X POST "${MCP_URL}/agent/sales" \
    -H "Content-Type: application/json" \
    -d '{"message": "Test", "userId": "test"}' 2>&1)

if echo "$SALES_MCP" | grep -q "response\|error"; then
    echo "   ✅ Sales Agent antwortet"
    echo "$SALES_MCP" | head -5
else
    echo "   ❌ Sales Agent antwortet nicht korrekt"
    echo "   Response: $SALES_MCP"
fi
echo ""

# 5. Prüfe Supabase-Verbindung
echo "5. Prüfe Supabase-Verbindung..."
echo "-------------------------------"
# Teste über eine funktionierende Route
echo "   Teste Supabase über Automation Route (funktioniert):"
AUTO_TASK=$(curl -s -X POST "http://localhost:3000/api/agents/automation" \
    -H "Content-Type: application/json" \
    -d '{"message": "Supabase Test"}' | jq -r '.taskId // "keine taskId"')

if [ "$AUTO_TASK" != "keine taskId" ] && [ -n "$AUTO_TASK" ]; then
    echo "   ✅ Supabase funktioniert (Task erstellt: $AUTO_TASK)"
else
    echo "   ⚠️  Supabase könnte Probleme haben"
fi
echo ""

# 6. Empfehlungen
echo "6. Empfehlungen:"
echo "----------------"
echo ""
echo "📋 Mögliche Lösungen:"
echo ""
echo "   Option 1: Container-Logs prüfen"
echo "   docker compose -f docker-compose.yml logs frontend | grep -i -A 10 'marketing\|sales' | tail -50"
echo ""
echo "   Option 2: Route-Dateien neu kopieren"
echo "   cp integration/api-routes/app-router/agents/marketing/route.ts frontend/app/api/agents/marketing/route.ts"
echo "   cp integration/api-routes/app-router/agents/sales/route.ts frontend/app/api/agents/sales/route.ts"
echo "   docker compose -f docker-compose.yml build --no-cache frontend"
echo "   docker compose -f docker-compose.yml up -d frontend"
echo ""
echo "   Option 3: MCP Server prüfen"
echo "   curl -X POST http://138.199.237.34:7000/agent/marketing -H 'Content-Type: application/json' -d '{\"message\": \"Test\"}'"
echo "   curl -X POST http://138.199.237.34:7000/agent/sales -H 'Content-Type: application/json' -d '{\"message\": \"Test\"}'"
echo ""
echo "   Option 4: Environment Variables prüfen"
echo "   docker exec \$(docker ps -q -f name=frontend) env | grep SUPABASE"
echo "   docker exec \$(docker ps -q -f name=frontend) env | grep MCP"
echo ""
