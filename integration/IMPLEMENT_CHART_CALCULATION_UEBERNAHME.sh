#!/bin/bash
# Implementiert Chart-Berechnung im MCP Server
# Übernimmt Code aus Next.js API-Route und erweitert MCP Server

set -e

MCP_DIR="/opt/mcp"
SERVER_FILE="$MCP_DIR/server.js"
BACKUP_FILE="$SERVER_FILE.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔧 Implementiere Chart-Berechnung im MCP Server"
echo "================================================"
echo ""

# Backup erstellen
if [ -f "$SERVER_FILE" ]; then
    cp "$SERVER_FILE" "$BACKUP_FILE"
    echo "✅ Backup erstellt: $BACKUP_FILE"
fi

# Prüfe ob Chart-Berechnung bereits existiert
if grep -q "calculateChart" "$SERVER_FILE"; then
    echo "⚠️  Chart-Berechnung existiert bereits!"
    echo "📋 Überspringe Implementierung"
    exit 0
fi

echo "📝 Füge Chart-Berechnungs-Funktion hinzu..."
echo ""

# Finde die Stelle nach loadPrompt-Funktion
# Füge calculateChart-Funktion hinzu
cat > /tmp/chart_calculation_function.js << 'CHART_FUNC'
/**
 * Chart-Berechnungs-Funktion
 * Übernommen aus: integration/api-routes/agents-chart-development.ts
 */
async function calculateChart(birthDate, birthTime, birthPlace) {
  let calculatedChartData = {};
  
  if (!birthDate || !birthTime || !birthPlace) {
    return calculatedChartData;
  }
  
  try {
    // Option 1: Reading Agent (Fallback)
    const readingAgentUrl = process.env.READING_AGENT_URL || 'http://localhost:4001';
    const response = await fetch(`${readingAgentUrl}/reading/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        birthDate,
        birthTime,
        birthPlace,
        readingType: 'detailed'
      }),
    });

    if (response.ok) {
      const data = await response.json();
      calculatedChartData = data.chartData || {};
    }
  } catch (error) {
    console.warn('Chart-Berechnung fehlgeschlagen:', error);
  }
  
  // Option 2: n8n Webhook (falls vorhanden)
  // TODO: Implementieren falls n8n Chart-Berechnung vorhanden
  
  return calculatedChartData;
}
CHART_FUNC

# Füge Funktion nach loadPrompt ein
sed -i '/function loadPrompt/,/^}/ {
    /^}/a\
\
'"$(cat /tmp/chart_calculation_function.js)"'
}' "$SERVER_FILE"

echo "✅ Chart-Berechnungs-Funktion hinzugefügt"
echo ""

# Füge Chart-Berechnungs-Endpoint hinzu
echo "📝 Füge Chart-Berechnungs-Endpoint hinzu..."

cat > /tmp/chart_endpoint.js << 'CHART_ENDPOINT'
// Chart-Berechnungs-Endpoint
app.post('/chart/calculate', async (req, res) => {
  const { birthDate, birthTime, birthPlace } = req.body;
  
  if (!birthDate || !birthTime || !birthPlace) {
    return res.status(400).json({ 
      error: 'birthDate, birthTime, birthPlace are required' 
    });
  }
  
  try {
    const chartData = await calculateChart(birthDate, birthTime, birthPlace);
    res.json({ 
      success: true, 
      chartData,
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
CHART_ENDPOINT

# Füge Endpoint nach /agent/:agentId ein
sed -i '/app.post('"'"'\/agent\/:agentId'"'"'/,/^});$/ {
    /^});$/a\
\
'"$(cat /tmp/chart_endpoint.js)"'
}' "$SERVER_FILE"

echo "✅ Chart-Berechnungs-Endpoint hinzugefügt"
echo ""

# Erweitere Chart Development Agent
echo "📝 Erweitere Chart Development Agent..."

# Prüfe ob Chart Development Agent bereits erweitert wurde
if grep -q "calculateChart" "$SERVER_FILE" | grep -q "chart-development"; then
    echo "⚠️  Chart Development Agent bereits erweitert"
else
    # Erstelle erweiterte Version
    # TODO: Erweitere /agent/chart-development Handler
    echo "   📋 Chart Development Agent muss manuell erweitert werden"
    echo "   📄 Siehe: integration/IMPLEMENT_CHART_CALCULATION_MCP.md"
fi

echo ""

# Cleanup
rm -f /tmp/chart_calculation_function.js /tmp/chart_endpoint.js

# MCP Server neu starten
echo "🔄 Starte MCP Server neu..."
systemctl restart mcp
sleep 3

# Status prüfen
if systemctl is-active --quiet mcp; then
    echo "✅ MCP Server läuft"
else
    echo "❌ MCP Server Fehler - prüfe Logs: journalctl -u mcp -n 50"
    echo "⚠️  Falls Fehler, wiederherstelle Backup:"
    echo "   cp $BACKUP_FILE $SERVER_FILE"
    exit 1
fi

echo ""
echo "✅ Chart-Berechnung implementiert!"
echo ""
echo "🧪 Test:"
echo "   curl -X POST http://localhost:7000/chart/calculate \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"birthDate\": \"1990-05-15\", \"birthTime\": \"14:30\", \"birthPlace\": \"Berlin, Germany\"}'"
echo ""

