#!/bin/bash
# Fügt Chart-Berechnungs-Endpoints zu server.js hinzu
# Führt auf Hetzner Server aus: /opt/mcp

set -e

MCP_DIR="/opt/mcp"
SERVER_FILE="$MCP_DIR/server.js"
BACKUP_FILE="$SERVER_FILE.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔧 Füge Chart-Berechnungs-Endpoints hinzu"
echo "=========================================="
echo ""

# Backup erstellen
if [ -f "$SERVER_FILE" ]; then
    cp "$SERVER_FILE" "$BACKUP_FILE"
    echo "✅ Backup erstellt: $BACKUP_FILE"
fi

# Prüfe ob Endpoints bereits vorhanden
if grep -q "/chart/calculate" "$SERVER_FILE"; then
    echo "⚠️  Chart-Endpoints bereits vorhanden!"
    exit 0
fi

echo "📝 Füge Chart-Endpoints hinzu..."
echo ""

# Erstelle temporäre Datei mit Endpoints
ENDPOINTS_FILE=$(mktemp)
cat > "$ENDPOINTS_FILE" << 'ENDPOINTS_END'
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

# Füge Endpoints vor app.listen hinzu
# Finde die Zeile mit app.listen und füge davor ein
TEMP_SERVER=$(mktemp)

# Kopiere alles bis app.listen
awk '/app\.listen\(PORT/ { exit }1' "$SERVER_FILE" > "$TEMP_SERVER"

# Füge Endpoints hinzu
cat "$ENDPOINTS_FILE" >> "$TEMP_SERVER"

# Füge app.listen und Rest hinzu
awk '/app\.listen\(PORT/,0' "$SERVER_FILE" >> "$TEMP_SERVER"

# Ersetze server.js
mv "$TEMP_SERVER" "$SERVER_FILE"

# Cleanup
rm -f "$ENDPOINTS_FILE"

echo "✅ Chart-Endpoints hinzugefügt"
echo ""

# Prüfe ob Endpoints jetzt vorhanden sind
if grep -q "/chart/calculate" "$SERVER_FILE"; then
    echo "✅ Endpoints erfolgreich hinzugefügt"
    echo "   📄 Gefundene Endpoints:"
    grep -E "(/chart/calculate|/chart/stats|/chart/cache)" "$SERVER_FILE" | head -3
else
    echo "❌ Fehler beim Hinzufügen der Endpoints"
    exit 1
fi
echo ""

# MCP Server neu starten
echo "🔄 Starte MCP Server neu..."
systemctl restart mcp
sleep 3

if systemctl is-active --quiet mcp; then
    echo "   ✅ MCP Server läuft"
else
    echo "   ❌ MCP Server Fehler - prüfe Logs: journalctl -u mcp -n 50"
    exit 1
fi
echo ""

# Test
echo "🧪 Teste Chart-Berechnung..."
sleep 2

TEST_RESPONSE=$(curl -s -X POST http://localhost:7000/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin, Germany"}' 2>&1)

if echo "$TEST_RESPONSE" | grep -q "success\|chartData"; then
    echo "   ✅ Chart-Berechnung funktioniert!"
    echo "   📄 Antwort (erste Zeile):"
    echo "$TEST_RESPONSE" | head -1
else
    echo "   ⚠️  Chart-Berechnung Test:"
    echo "$TEST_RESPONSE" | head -5
fi
echo ""

echo "=========================================="
echo "✅ Chart-Endpoints hinzugefügt!"
echo "=========================================="
echo ""

