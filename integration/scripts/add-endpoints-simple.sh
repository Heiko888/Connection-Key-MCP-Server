#!/bin/bash
# Fügt Chart-Endpoints einfach und zuverlässig hinzu

set -e

MCP_DIR="/opt/mcp"
SERVER_FILE="$MCP_DIR/server.js"
BACKUP_FILE="$SERVER_FILE.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔧 Füge Chart-Endpoints hinzu"
echo "=============================="
echo ""

# Backup
cp "$SERVER_FILE" "$BACKUP_FILE"
echo "✅ Backup: $BACKUP_FILE"
echo ""

# Prüfe ob bereits vorhanden
if grep -q "/chart/calculate" "$SERVER_FILE"; then
    echo "⚠️  Endpoints bereits vorhanden!"
    exit 0
fi

echo "📝 Füge Endpoints hinzu..."
echo ""

# Erstelle neue server.js mit Endpoints
# Kopiere alles bis app.listen
awk '/app\.listen\(PORT/ { exit }1' "$SERVER_FILE" > "${SERVER_FILE}.new"

# Füge Endpoints hinzu
cat >> "${SERVER_FILE}.new" << 'ENDPOINTS'
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

ENDPOINTS

# Füge app.listen und Rest hinzu
awk '/app\.listen\(PORT/,0' "$SERVER_FILE" >> "${SERVER_FILE}.new"

# Ersetze
mv "${SERVER_FILE}.new" "$SERVER_FILE"

echo "✅ Endpoints hinzugefügt"
echo ""

# Prüfe
if grep -q "/chart/calculate" "$SERVER_FILE"; then
    echo "✅ Endpoints erfolgreich hinzugefügt"
else
    echo "❌ Fehler!"
    exit 1
fi
echo ""

# Restart
echo "🔄 Starte MCP Server neu..."
systemctl restart mcp
sleep 3

if systemctl is-active --quiet mcp; then
    echo "✅ MCP Server läuft"
else
    echo "❌ Fehler - Logs:"
    journalctl -u mcp -n 10 --no-pager
    exit 1
fi
echo ""

# Test
echo "🧪 Test..."
sleep 2
curl -s -X POST http://localhost:7000/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin"}' | head -3

echo ""
echo "✅ Fertig!"
echo ""

