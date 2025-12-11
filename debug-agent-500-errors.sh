#!/bin/bash

# Debug HTTP 500 Fehler bei Agent-Routen
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🔍 Debug HTTP 500 Fehler"
echo "========================"
echo ""

# 1. Prüfe Container-Logs für Fehler
echo "1. Prüfe Container-Logs (letzte 100 Zeilen)..."
echo "----------------------------------------------"
docker compose -f docker-compose.yml logs frontend --tail 100 | grep -i -E "(error|500|marketing|sales|failed)" || echo "   Keine offensichtlichen Fehler gefunden"
echo ""

# 2. Teste Marketing Route direkt
echo "2. Teste Marketing Route..."
echo "--------------------------"
MARKETING_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/agents/marketing" \
    -H "Content-Type: application/json" \
    -d '{"message": "Test"}' 2>&1)

echo "   Response:"
echo "$MARKETING_RESPONSE" | head -20
echo ""

# 3. Teste Sales Route direkt
echo "3. Teste Sales Route..."
echo "----------------------"
SALES_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/agents/sales" \
    -H "Content-Type: application/json" \
    -d '{"message": "Test"}' 2>&1)

echo "   Response:"
echo "$SALES_RESPONSE" | head -20
echo ""

# 4. Prüfe Route-Dateien
echo "4. Prüfe Route-Dateien..."
echo "------------------------"

# Marketing
if [ -f "frontend/app/api/agents/marketing/route.ts" ]; then
    echo "   ✅ marketing/route.ts vorhanden"
    
    # Prüfe auf Syntax-Fehler
    if grep -q "AGENT_ID = 'marketing'" "frontend/app/api/agents/marketing/route.ts"; then
        echo "   ✅ AGENT_ID korrekt"
    else
        echo "   ⚠️  AGENT_ID könnte falsch sein"
    fi
    
    # Prüfe auf Supabase
    if grep -q "createClient" "frontend/app/api/agents/marketing/route.ts"; then
        echo "   ✅ Supabase Client vorhanden"
    else
        echo "   ⚠️  Supabase Client fehlt"
    fi
else
    echo "   ❌ marketing/route.ts fehlt!"
fi

# Sales
if [ -f "frontend/app/api/agents/sales/route.ts" ]; then
    echo "   ✅ sales/route.ts vorhanden"
    
    # Prüfe auf Syntax-Fehler
    if grep -q "AGENT_ID = 'sales'" "frontend/app/api/agents/sales/route.ts"; then
        echo "   ✅ AGENT_ID korrekt"
    else
        echo "   ⚠️  AGENT_ID könnte falsch sein"
    fi
    
    # Prüfe auf Supabase
    if grep -q "createClient" "frontend/app/api/agents/sales/route.ts"; then
        echo "   ✅ Supabase Client vorhanden"
    else
        echo "   ⚠️  Supabase Client fehlt"
    fi
else
    echo "   ❌ sales/route.ts fehlt!"
fi

echo ""

# 5. Prüfe Environment Variables
echo "5. Prüfe Environment Variables..."
echo "---------------------------------"
if docker exec $(docker ps -q -f name=frontend) env | grep -q "NEXT_PUBLIC_SUPABASE_URL"; then
    echo "   ✅ NEXT_PUBLIC_SUPABASE_URL gesetzt"
else
    echo "   ❌ NEXT_PUBLIC_SUPABASE_URL fehlt!"
fi

if docker exec $(docker ps -q -f name=frontend) env | grep -q "SUPABASE_SERVICE_ROLE_KEY"; then
    echo "   ✅ SUPABASE_SERVICE_ROLE_KEY gesetzt"
else
    echo "   ❌ SUPABASE_SERVICE_ROLE_KEY fehlt!"
fi

if docker exec $(docker ps -q -f name=frontend) env | grep -q "MCP_SERVER_URL"; then
    echo "   ✅ MCP_SERVER_URL gesetzt"
    docker exec $(docker ps -q -f name=frontend) env | grep "MCP_SERVER_URL"
else
    echo "   ❌ MCP_SERVER_URL fehlt!"
fi

echo ""

# 6. Prüfe ob MCP Server erreichbar ist
echo "6. Prüfe MCP Server Erreichbarkeit..."
echo "-------------------------------------"
MCP_URL=$(docker exec $(docker ps -q -f name=frontend) env | grep "MCP_SERVER_URL" | cut -d'=' -f2 || echo "http://138.199.237.34:7000")

echo "   MCP Server URL: $MCP_URL"

# Teste Marketing Agent auf MCP Server
MARKETING_MCP=$(curl -s -X POST "${MCP_URL}/agent/marketing" \
    -H "Content-Type: application/json" \
    -d '{"message": "Test"}' 2>&1 | head -5)

if echo "$MARKETING_MCP" | grep -q "response\|error"; then
    echo "   ✅ Marketing Agent auf MCP Server erreichbar"
else
    echo "   ⚠️  Marketing Agent auf MCP Server möglicherweise nicht erreichbar"
    echo "   Response: $MARKETING_MCP"
fi

# Teste Sales Agent auf MCP Server
SALES_MCP=$(curl -s -X POST "${MCP_URL}/agent/sales" \
    -H "Content-Type: application/json" \
    -d '{"message": "Test"}' 2>&1 | head -5)

if echo "$SALES_MCP" | grep -q "response\|error"; then
    echo "   ✅ Sales Agent auf MCP Server erreichbar"
else
    echo "   ⚠️  Sales Agent auf MCP Server möglicherweise nicht erreichbar"
    echo "   Response: $SALES_MCP"
fi

echo ""

# 7. Vergleich mit funktionierenden Routen
echo "7. Vergleich mit funktionierenden Routen..."
echo "------------------------------------------"

# Prüfe Automation (funktioniert)
if [ -f "frontend/app/api/agents/automation/route.ts" ]; then
    echo "   Automation Route (funktioniert):"
    echo "   - AGENT_ID: $(grep "AGENT_ID = " frontend/app/api/agents/automation/route.ts | head -1)"
    echo "   - Zeilen: $(wc -l < frontend/app/api/agents/automation/route.ts)"
fi

# Prüfe Marketing (fehlerhaft)
if [ -f "frontend/app/api/agents/marketing/route.ts" ]; then
    echo "   Marketing Route (fehlerhaft):"
    echo "   - AGENT_ID: $(grep "AGENT_ID = " frontend/app/api/agents/marketing/route.ts | head -1)"
    echo "   - Zeilen: $(wc -l < frontend/app/api/agents/marketing/route.ts)"
    
    # Prüfe Unterschiede
    if [ -f "frontend/app/api/agents/automation/route.ts" ]; then
        DIFF_LINES=$(diff -u frontend/app/api/agents/automation/route.ts frontend/app/api/agents/marketing/route.ts | grep -E "^\+|^-" | grep -v "^+++\|^---" | wc -l)
        echo "   - Unterschiede zu Automation: $DIFF_LINES Zeilen"
    fi
fi

echo ""

# 8. Prüfe Build-Output
echo "8. Prüfe Build-Output für Fehler..."
echo "----------------------------------"
docker compose -f docker-compose.yml logs frontend | grep -i -E "(error|failed|marketing|sales)" | tail -20 || echo "   Keine Build-Fehler gefunden"
echo ""

# 9. Zusammenfassung
echo "9. Zusammenfassung & Empfehlungen:"
echo "----------------------------------"
echo ""
echo "📋 Mögliche Ursachen für HTTP 500:"
echo "   1. Supabase-Verbindungsfehler"
echo "   2. MCP Server nicht erreichbar"
echo "   3. Fehler in der Route-Logik"
echo "   4. Fehlende Environment Variables"
echo "   5. Syntax-Fehler in TypeScript"
echo ""
echo "🔧 Nächste Schritte:"
echo "   1. Prüfe vollständige Logs:"
echo "      docker compose -f docker-compose.yml logs frontend | tail -100"
echo ""
echo "   2. Prüfe Route-Dateien auf Fehler:"
echo "      cat frontend/app/api/agents/marketing/route.ts | head -50"
echo "      cat frontend/app/api/agents/sales/route.ts | head -50"
echo ""
echo "   3. Teste MCP Server direkt:"
echo "      curl -X POST http://138.199.237.34:7000/agent/marketing -H 'Content-Type: application/json' -d '{\"message\": \"Test\"}'"
echo "      curl -X POST http://138.199.237.34:7000/agent/sales -H 'Content-Type: application/json' -d '{\"message\": \"Test\"}'"
echo ""
