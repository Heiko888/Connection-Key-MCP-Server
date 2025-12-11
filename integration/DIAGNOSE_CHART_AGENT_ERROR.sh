#!/bin/bash
# Diagnose-Script für Chart Agent Fehler
# Führen Sie auf CK-App Server aus: /opt/hd-app/The-Connection-Key/frontend

set -e

FRONTEND_DIR="/opt/hd-app/The-Connection-Key/frontend"
CHART_PAGE="$FRONTEND_DIR/app/agents/chart/page.tsx"
CHART_COMPONENT="$FRONTEND_DIR/components/agents/ChartDevelopment.tsx"
API_ROUTE="$FRONTEND_DIR/pages/api/agents/chart-development.ts"

echo "🔍 Diagnose: Chart Agent Fehler"
echo "================================"
echo ""

cd "$FRONTEND_DIR"

# 1. Prüfe Chart-Seite
echo "1. Prüfe Chart-Seite..."
if [ -f "$CHART_PAGE" ]; then
    echo "   ✅ Chart-Seite existiert: $CHART_PAGE"
    
    # Prüfe ob ChartDevelopment importiert wird
    if grep -q "ChartDevelopment" "$CHART_PAGE"; then
        echo "   ✅ ChartDevelopment wird importiert"
        echo "   📄 Import-Zeile:"
        grep "ChartDevelopment" "$CHART_PAGE" | head -1
    else
        echo "   ❌ ChartDevelopment wird NICHT importiert!"
    fi
    
    # Prüfe ob ChartDevelopment verwendet wird
    if grep -q "<ChartDevelopment" "$CHART_PAGE"; then
        echo "   ✅ ChartDevelopment wird verwendet"
    else
        echo "   ❌ ChartDevelopment wird NICHT verwendet!"
    fi
else
    echo "   ❌ Chart-Seite nicht gefunden!"
fi
echo ""

# 2. Prüfe ChartDevelopment-Komponente
echo "2. Prüfe ChartDevelopment-Komponente..."
if [ -f "$CHART_COMPONENT" ]; then
    echo "   ✅ ChartDevelopment-Komponente existiert: $CHART_COMPONENT"
    
    # Prüfe API-Endpoint
    if grep -q "chart-development" "$CHART_COMPONENT"; then
        echo "   ✅ API-Endpoint korrekt: /api/agents/chart-development"
        echo "   📄 Endpoint-Zeile:"
        grep -A 1 "chart-development" "$CHART_COMPONENT" | head -2
    else
        echo "   ❌ API-Endpoint nicht gefunden oder falsch!"
        echo "   📄 Suche nach fetch:"
        grep -A 3 "fetch" "$CHART_COMPONENT" | head -5
    fi
    
    # Prüfe ob POST verwendet wird
    if grep -q "method.*POST" "$CHART_COMPONENT"; then
        echo "   ✅ POST-Methode verwendet"
    else
        echo "   ⚠️  POST-Methode nicht explizit gefunden"
    fi
else
    echo "   ❌ ChartDevelopment-Komponente nicht gefunden!"
fi
echo ""

# 3. Prüfe API-Route
echo "3. Prüfe API-Route..."
if [ -f "$API_ROUTE" ]; then
    echo "   ✅ API-Route existiert: $API_ROUTE"
    
    # Prüfe MCP_SERVER_URL
    if grep -q "MCP_SERVER_URL" "$API_ROUTE"; then
        echo "   ✅ MCP_SERVER_URL verwendet"
        echo "   📄 MCP_SERVER_URL Zeile:"
        grep "MCP_SERVER_URL" "$API_ROUTE" | head -1
    else
        echo "   ❌ MCP_SERVER_URL nicht gefunden!"
    fi
    
    # Prüfe AGENT_ID
    if grep -q "chart-development" "$API_ROUTE"; then
        echo "   ✅ AGENT_ID korrekt: chart-development"
    else
        echo "   ❌ AGENT_ID nicht gefunden oder falsch!"
    fi
else
    echo "   ❌ API-Route nicht gefunden!"
fi
echo ""

# 4. Teste API-Route direkt
echo "4. Teste API-Route direkt..."
echo "   📤 Sende Test-Request..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/agents/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}' 2>&1)

if echo "$RESPONSE" | grep -q "success.*true"; then
    echo "   ✅ API-Route funktioniert!"
    echo "   📄 Antwort:"
    echo "$RESPONSE" | head -3
else
    echo "   ❌ API-Route Fehler!"
    echo "   📄 Fehler-Response:"
    echo "$RESPONSE"
fi
echo ""

# 5. Prüfe Environment Variables
echo "5. Prüfe Environment Variables..."
ENV_FILE="$FRONTEND_DIR/.env.local"
if [ -f "$ENV_FILE" ]; then
    echo "   ✅ .env.local existiert"
    
    if grep -q "MCP_SERVER_URL" "$ENV_FILE"; then
        echo "   ✅ MCP_SERVER_URL gesetzt"
        grep "MCP_SERVER_URL" "$ENV_FILE"
    else
        echo "   ❌ MCP_SERVER_URL nicht gesetzt!"
    fi
    
    if grep -q "READING_AGENT_URL" "$ENV_FILE"; then
        echo "   ✅ READING_AGENT_URL gesetzt"
        grep "READING_AGENT_URL" "$ENV_FILE"
    else
        echo "   ⚠️  READING_AGENT_URL nicht gesetzt (optional)"
    fi
else
    echo "   ❌ .env.local nicht gefunden!"
fi
echo ""

# 6. Prüfe MCP Server (Hetzner)
echo "6. Prüfe MCP Server (Hetzner)..."
MCP_RESPONSE=$(curl -s http://138.199.237.34:7000/agents 2>&1)
if echo "$MCP_RESPONSE" | grep -q "chart-development"; then
    echo "   ✅ Chart Agent im MCP Server konfiguriert"
    echo "   📄 Agent-Info:"
    echo "$MCP_RESPONSE" | grep -A 2 "chart-development"
else
    echo "   ❌ Chart Agent NICHT im MCP Server konfiguriert!"
    echo "   📄 Verfügbare Agenten:"
    echo "$MCP_RESPONSE"
fi
echo ""

# 7. Teste MCP Server direkt
echo "7. Teste MCP Server direkt..."
MCP_TEST=$(curl -s -X POST http://138.199.237.34:7000/agent/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}' 2>&1)

if echo "$MCP_TEST" | grep -q "response"; then
    echo "   ✅ MCP Server funktioniert!"
    echo "   📄 Antwort (erste Zeile):"
    echo "$MCP_TEST" | head -1
else
    echo "   ❌ MCP Server Fehler!"
    echo "   📄 Fehler-Response:"
    echo "$MCP_TEST"
fi
echo ""

# 8. Prüfe Browser-Console-Fehler (Hinweis)
echo "8. Browser-Console prüfen..."
echo "   📋 Öffnen Sie die Browser-Console (F12) und prüfen Sie:"
echo "      - Fehler in der Console"
echo "      - Network-Tab: Prüfen Sie den Request zu /api/agents/chart-development"
echo "      - Response-Status und -Body"
echo ""

echo "================================"
echo "✅ Diagnose abgeschlossen!"
echo "================================"
echo ""
echo "📋 Zusammenfassung:"
echo "   - Prüfen Sie die oben genannten Punkte"
echo "   - Besonders wichtig: Browser-Console (F12)"
echo "   - Prüfen Sie Network-Tab für API-Requests"
echo ""

