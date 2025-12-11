#!/bin/bash
# Prüft ob Chart-Berechnung implementiert ist

set -e

MCP_DIR="/opt/mcp"
SERVER_FILE="$MCP_DIR/server.js"
CHART_MODULE="$MCP_DIR/chart-calculation.js"

echo "🔍 Prüfe Chart-Berechnungs-Implementierung"
echo "=========================================="
echo ""

# 1. Prüfe Chart-Berechnungs-Modul
echo "1. Prüfe Chart-Berechnungs-Modul..."
if [ -f "$CHART_MODULE" ]; then
    echo "   ✅ Chart-Berechnungs-Modul gefunden: $CHART_MODULE"
    echo "   📄 Größe: $(wc -l < "$CHART_MODULE") Zeilen"
else
    echo "   ❌ Chart-Berechnungs-Modul nicht gefunden!"
fi
echo ""

# 2. Prüfe server.js
echo "2. Prüfe server.js..."
if [ -f "$SERVER_FILE" ]; then
    echo "   ✅ server.js gefunden: $SERVER_FILE"
    
    # Prüfe ob chart-calculation importiert wird
    if grep -q "chart-calculation" "$SERVER_FILE"; then
        echo "   ✅ chart-calculation wird importiert"
        echo "   📄 Import-Zeile:"
        grep "chart-calculation" "$SERVER_FILE" | head -1
    else
        echo "   ❌ chart-calculation wird NICHT importiert!"
    fi
    
    # Prüfe ob Chart-Endpoints vorhanden sind
    if grep -q "/chart/calculate" "$SERVER_FILE"; then
        echo "   ✅ Chart-Endpoints vorhanden"
        echo "   📄 Endpoints:"
        grep -E "(/chart/calculate|/chart/stats|/chart/cache)" "$SERVER_FILE" | head -3
    else
        echo "   ❌ Chart-Endpoints NICHT vorhanden!"
    fi
else
    echo "   ❌ server.js nicht gefunden!"
fi
echo ""

# 3. Teste Endpoints
echo "3. Teste Chart-Berechnungs-Endpoints..."

# Test /chart/calculate
echo "   📤 Teste POST /chart/calculate..."
RESPONSE=$(curl -s -X POST http://localhost:7000/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin, Germany"}' 2>&1)

if echo "$RESPONSE" | grep -q "success\|chartData\|error"; then
    echo "   ✅ /chart/calculate antwortet"
    echo "   📄 Antwort (erste Zeile):"
    echo "$RESPONSE" | head -1
else
    echo "   ❌ /chart/calculate antwortet nicht oder Fehler"
    echo "   📄 Antwort:"
    echo "$RESPONSE"
fi
echo ""

# Test /chart/stats
echo "   📤 Teste GET /chart/stats..."
STATS_RESPONSE=$(curl -s http://localhost:7000/chart/stats 2>&1)
if echo "$STATS_RESPONSE" | grep -q "success\|size\|methods"; then
    echo "   ✅ /chart/stats antwortet"
    echo "   📄 Antwort:"
    echo "$STATS_RESPONSE"
else
    echo "   ⚠️  /chart/stats antwortet nicht (kann normal sein, falls nicht implementiert)"
fi
echo ""

# 4. Prüfe MCP Server Logs
echo "4. Prüfe MCP Server Logs (letzte 10 Zeilen)..."
journalctl -u mcp -n 10 --no-pager | tail -5
echo ""

echo "=========================================="
echo "✅ Prüfung abgeschlossen!"
echo "=========================================="
echo ""

