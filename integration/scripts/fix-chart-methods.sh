#!/bin/bash
# Fix für Chart-Berechnung - "Keine verfügbare Methode"

set -e

CONNECTION_KEY_DIR="/opt/mcp-connection-key"
ENV_FILE="$CONNECTION_KEY_DIR/.env"

echo "🔧 Fix: Chart-Berechnung - Keine verfügbare Methode"
echo "=================================================="
echo ""

# 1. Prüfe Environment Variables
echo "1. Prüfe Environment Variables..."
if [ ! -f "$ENV_FILE" ]; then
    echo "   ⚠️  .env nicht gefunden - erstelle..."
    touch "$ENV_FILE"
fi

# Setze READING_AGENT_URL
if ! grep -q "^READING_AGENT_URL=" "$ENV_FILE"; then
    echo "   📝 Füge READING_AGENT_URL hinzu..."
    echo "READING_AGENT_URL=http://localhost:4001" >> "$ENV_FILE"
    echo "   ✅ READING_AGENT_URL gesetzt"
else
    echo "   ✅ READING_AGENT_URL bereits gesetzt"
    grep "^READING_AGENT_URL=" "$ENV_FILE"
fi

# Setze N8N_BASE_URL
if ! grep -q "^N8N_BASE_URL=" "$ENV_FILE"; then
    echo "   📝 Füge N8N_BASE_URL hinzu..."
    echo "N8N_BASE_URL=http://localhost:5678" >> "$ENV_FILE"
    echo "   ✅ N8N_BASE_URL gesetzt"
else
    echo "   ✅ N8N_BASE_URL bereits gesetzt"
    grep "^N8N_BASE_URL=" "$ENV_FILE"
fi
echo ""

# 2. Prüfe Reading Agent
echo "2. Prüfe Reading Agent..."
if curl -s --max-time 2 http://localhost:4001/health > /dev/null 2>&1; then
    echo "   ✅ Reading Agent läuft"
    HEALTH=$(curl -s http://localhost:4001/health | head -1)
    echo "   📄 Health: $HEALTH"
else
    echo "   ⚠️  Reading Agent läuft nicht!"
    echo "   📋 Versuche Reading Agent zu starten..."
    
    if command -v pm2 > /dev/null; then
        pm2 start reading-agent 2>/dev/null || pm2 restart reading-agent 2>/dev/null || echo "   ⚠️  PM2 Fehler"
        sleep 2
        
        if curl -s --max-time 2 http://localhost:4001/health > /dev/null 2>&1; then
            echo "   ✅ Reading Agent gestartet"
        else
            echo "   ❌ Reading Agent konnte nicht gestartet werden"
        fi
    else
        echo "   ⚠️  PM2 nicht gefunden"
    fi
fi
echo ""

# 3. Teste Reading Agent direkt
echo "3. Teste Reading Agent direkt..."
READING_TEST=$(curl -s -X POST http://localhost:4001/reading/generate \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin", "readingType": "detailed"}' 2>&1)

if echo "$READING_TEST" | grep -q "success\|reading"; then
    echo "   ✅ Reading Agent antwortet"
    
    # Prüfe ob chartData vorhanden ist
    if echo "$READING_TEST" | grep -q "chartData"; then
        echo "   ✅ chartData in Response vorhanden"
    else
        echo "   ⚠️  chartData NICHT in Response (kann normal sein)"
        echo "   📄 Response (erste Zeile):"
        echo "$READING_TEST" | head -1
    fi
else
    echo "   ❌ Reading Agent antwortet nicht korrekt"
    echo "   📄 Response:"
    echo "$READING_TEST" | head -5
fi
echo ""

# 4. MCP Server neu starten (damit ENV geladen wird)
echo "4. Starte MCP Server neu (damit ENV geladen wird)..."
systemctl restart mcp
sleep 3

if systemctl is-active --quiet mcp; then
    echo "   ✅ MCP Server läuft"
    
    # Prüfe Logs
    echo "   📄 Logs (letzte 5 Zeilen):"
    journalctl -u mcp -n 5 --no-pager | tail -3
else
    echo "   ❌ MCP Server Fehler"
    journalctl -u mcp -n 10 --no-pager
    exit 1
fi
echo ""

# 5. Test Chart-Berechnung
echo "5. Teste Chart-Berechnung..."
sleep 2

CHART_TEST=$(curl -s -X POST http://localhost:7000/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin, Germany"}' 2>&1)

if echo "$CHART_TEST" | grep -q "success\|chartData"; then
    echo "   ✅ Chart-Berechnung funktioniert!"
    echo "   📄 Antwort (erste Zeile):"
    echo "$CHART_TEST" | head -1
elif echo "$CHART_TEST" | grep -q "error"; then
    echo "   ⚠️  Chart-Berechnung Fehler:"
    echo "$CHART_TEST" | head -3
    
    # Prüfe ob Reading Agent chartData zurückgibt
    echo ""
    echo "   🔍 Prüfe Reading Agent Response..."
    READING_RESPONSE=$(curl -s -X POST http://localhost:4001/reading/generate \
      -H "Content-Type: application/json" \
      -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin", "readingType": "detailed"}')
    
    if echo "$READING_RESPONSE" | grep -q "chartData"; then
        echo "   ✅ Reading Agent gibt chartData zurück"
    else
        echo "   ⚠️  Reading Agent gibt KEIN chartData zurück"
        echo "   📋 Chart-Berechnungs-Modul muss angepasst werden"
    fi
else
    echo "   ❌ Unerwartete Antwort:"
    echo "$CHART_TEST" | head -5
fi
echo ""

echo "=================================================="
echo "✅ Fix abgeschlossen!"
echo "=================================================="
echo ""

