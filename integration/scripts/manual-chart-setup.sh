#!/bin/bash
# Manuelle Chart-Berechnungs-Einrichtung
# Fügt Code zu server.js hinzu (ohne sed-Probleme)

set -e

MCP_DIR="/opt/mcp"
SERVER_FILE="$MCP_DIR/server.js"
TEMP_FILE=$(mktemp)

echo "🔧 Manuelle Chart-Berechnungs-Einrichtung"
echo "=========================================="
echo ""

# Prüfe ob Modul existiert
if [ ! -f "$MCP_DIR/chart-calculation.js" ]; then
    echo "❌ Chart-Berechnungs-Modul nicht gefunden!"
    echo "   📋 Führen Sie zuerst aus: setup-chart-calculation-clean.sh"
    exit 1
fi

echo "✅ Chart-Berechnungs-Modul gefunden"
echo ""

# Prüfe ob bereits erweitert
if grep -q "chart-calculation" "$SERVER_FILE"; then
    echo "⚠️  Chart-Berechnung bereits in server.js vorhanden"
    echo "   📋 Überspringe Erweiterung"
    exit 0
fi

echo "📝 Erweitere server.js..."
echo ""

# Kopiere server.js
cp "$SERVER_FILE" "$TEMP_FILE"

# Füge require hinzu (nach require('dotenv') oder require('express'))
if grep -q "require('dotenv')" "$TEMP_FILE"; then
    # Füge nach require('dotenv') hinzu
    awk '/require\('\''dotenv'\''\)/ { print; print "const chartCalculationService = require('\''./chart-calculation'\'');"; next }1' "$TEMP_FILE" > "${TEMP_FILE}.new"
    mv "${TEMP_FILE}.new" "$TEMP_FILE"
elif grep -q "require('express')" "$TEMP_FILE"; then
    # Füge nach require('express') hinzu
    awk '/require\('\''express'\''\)/ { print; print "const chartCalculationService = require('\''./chart-calculation'\'');"; next }1' "$TEMP_FILE" > "${TEMP_FILE}.new"
    mv "${TEMP_FILE}.new" "$TEMP_FILE"
else
    echo "   ⚠️  Kann require-Statement nicht finden"
    echo "   📋 Bitte manuell hinzufügen: const chartCalculationService = require('./chart-calculation');"
fi

# Füge Endpoints hinzu (vor app.listen)
cat >> "$TEMP_FILE" << 'ENDPOINTS_END'

// Chart-Berechnungs-Endpoint
app.post('/chart/calculate', async (req, res) => {
  const { birthDate, birthTime, birthPlace, skipCache } = req.body;
  
  if (!birthDate || !birthTime || !birthPlace) {
    return res.status(400).json({ 
      error: 'birthDate, birthTime, birthPlace are required' 
    });
  }
  
  try {
    const chartData = await chartCalculationService.calculate(
      birthDate, 
      birthTime, 
      birthPlace,
      { skipCache: skipCache || false }
    );
    
    res.json({ 
      success: true, 
      chartData,
      method: chartData.method,
      cached: chartData.cached,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chart-Berechnung Fehler:', error);
    res.status(500).json({ 
      error: 'Chart calculation failed',
      message: error.message 
    });
  }
});

// Chart-Berechnungs-Statistiken
app.get('/chart/stats', (req, res) => {
  const stats = chartCalculationService.getCacheStats();
  res.json({
    success: true,
    ...stats
  });
});

// Chart-Cache leeren
app.post('/chart/cache/clear', (req, res) => {
  chartCalculationService.clearCache();
  res.json({
    success: true,
    message: 'Cache cleared'
  });
});
ENDPOINTS_END

# Ersetze server.js
mv "$TEMP_FILE" "$SERVER_FILE"

echo "✅ server.js erweitert"
echo ""

# Environment Variables
echo "📝 Prüfe Environment Variables..."
ENV_FILE="/opt/mcp-connection-key/.env"

if [ -f "$ENV_FILE" ]; then
    if ! grep -q "^READING_AGENT_URL=" "$ENV_FILE"; then
        echo "READING_AGENT_URL=http://localhost:4001" >> "$ENV_FILE"
        echo "   ✅ READING_AGENT_URL hinzugefügt"
    fi
    
    if ! grep -q "^N8N_BASE_URL=" "$ENV_FILE"; then
        echo "N8N_BASE_URL=http://localhost:5678" >> "$ENV_FILE"
        echo "   ✅ N8N_BASE_URL hinzugefügt"
    fi
else
    echo "   ⚠️  .env nicht gefunden"
fi
echo ""

# MCP Server neu starten
echo "🔄 Starte MCP Server neu..."
systemctl restart mcp
sleep 3

if systemctl is-active --quiet mcp; then
    echo "   ✅ MCP Server läuft"
else
    echo "   ❌ MCP Server Fehler"
    journalctl -u mcp -n 20
    exit 1
fi
echo ""

# Test
echo "🧪 Teste Chart-Berechnung..."
sleep 2

curl -s -X POST http://localhost:7000/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin, Germany"}' | head -3

echo ""
echo "✅ Einrichtung abgeschlossen!"
echo ""

