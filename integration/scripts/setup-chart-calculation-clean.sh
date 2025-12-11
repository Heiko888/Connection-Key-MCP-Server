#!/bin/bash
# Saubere Chart-Berechnungs-Implementierung
# Erstellt neues Modul und erweitert MCP Server

set -e

MCP_DIR="/opt/mcp"
SERVER_FILE="$MCP_DIR/server.js"
CHART_MODULE="$MCP_DIR/chart-calculation.js"
BACKUP_FILE="$SERVER_FILE.backup.$(date +%Y%m%d_%H%M%S)"

echo "🏗️  Saubere Chart-Berechnungs-Implementierung"
echo "=============================================="
echo ""

# Backup erstellen
if [ -f "$SERVER_FILE" ]; then
    cp "$SERVER_FILE" "$BACKUP_FILE"
    echo "✅ Backup erstellt: $BACKUP_FILE"
fi

# 1. Chart-Berechnungs-Modul erstellen
echo "1. Erstelle Chart-Berechnungs-Modul..."
cat > "$CHART_MODULE" << 'CHART_MODULE_END'
/**
 * Chart-Berechnungs-Modul
 * Saubere, zentrale Implementierung für Human Design Chart-Berechnungen
 */

const CHART_CALCULATION_METHODS = {
  N8N_WEBHOOK: 'n8n',
  EXTERNAL_API: 'external',
  READING_AGENT: 'reading'
};

class ChartCalculationService {
  constructor() {
    this.cache = new Map();
    this.methods = [];
    this.setupMethods();
  }

  setupMethods() {
    // Methode 1: n8n Webhook
    if (process.env.N8N_BASE_URL) {
      this.methods.push({
        name: CHART_CALCULATION_METHODS.N8N_WEBHOOK,
        priority: 1,
        calculate: this.calculateViaN8N.bind(this)
      });
    }

    // Methode 2: Externe API
    if (process.env.CHART_API_URL) {
      this.methods.push({
        name: CHART_CALCULATION_METHODS.EXTERNAL_API,
        priority: 2,
        calculate: this.calculateViaExternalAPI.bind(this)
      });
    }

    // Methode 3: Reading Agent (Fallback)
    if (process.env.READING_AGENT_URL) {
      this.methods.push({
        name: CHART_CALCULATION_METHODS.READING_AGENT,
        priority: 3,
        calculate: this.calculateViaReadingAgent.bind(this)
      });
    }

    this.methods.sort((a, b) => a.priority - b.priority);
  }

  async calculate(birthDate, birthTime, birthPlace, options = {}) {
    const cacheKey = `${birthDate}-${birthTime}-${birthPlace}`;
    
    if (!options.skipCache && this.cache.has(cacheKey)) {
      return {
        ...this.cache.get(cacheKey),
        cached: true,
        method: 'cache'
      };
    }

    for (const method of this.methods) {
      try {
        const result = await method.calculate(birthDate, birthTime, birthPlace);
        
        if (result && Object.keys(result).length > 0) {
          if (!options.skipCache) {
            this.cache.set(cacheKey, result);
          }
          
          return {
            ...result,
            cached: false,
            method: method.name
          };
        }
      } catch (error) {
        console.warn(`Chart-Berechnung via ${method.name} fehlgeschlagen:`, error.message);
        continue;
      }
    }

    throw new Error('Chart-Berechnung fehlgeschlagen: Keine verfügbare Methode');
  }

  async calculateViaN8N(birthDate, birthTime, birthPlace) {
    const n8nUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
    const webhookPath = process.env.N8N_CHART_WEBHOOK || '/webhook/chart-calculation';
    
    const response = await fetch(`${n8nUrl}${webhookPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birthDate, birthTime, birthPlace })
    });

    if (!response.ok) {
      throw new Error(`n8n Webhook failed: ${response.status}`);
    }

    const data = await response.json();
    return this.normalizeChartData(data);
  }

  async calculateViaExternalAPI(birthDate, birthTime, birthPlace) {
    const apiUrl = process.env.CHART_API_URL;
    
    const response = await fetch(`${apiUrl}/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birthDate, birthTime, birthPlace })
    });

    if (!response.ok) {
      throw new Error(`External API failed: ${response.status}`);
    }

    const data = await response.json();
    return this.normalizeChartData(data);
  }

  async calculateViaReadingAgent(birthDate, birthTime, birthPlace) {
    const readingAgentUrl = process.env.READING_AGENT_URL || 'http://localhost:4001';
    
    const response = await fetch(`${readingAgentUrl}/reading/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        birthDate,
        birthTime,
        birthPlace,
        readingType: 'detailed'
      })
    });

    if (!response.ok) {
      throw new Error(`Reading Agent failed: ${response.status}`);
    }

    const data = await response.json();
    return this.normalizeChartData(data.chartData || {});
  }

  normalizeChartData(data) {
    return {
      type: data.type || null,
      profile: data.profile || null,
      authority: data.authority || null,
      strategy: data.strategy || null,
      centers: data.centers || {},
      gates: data.gates || {},
      channels: data.channels || {},
      incarnationCross: data.incarnationCross || null,
      ...data
    };
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      methods: this.methods.map(m => m.name)
    };
  }
}

const chartCalculationService = new ChartCalculationService();

module.exports = chartCalculationService;
CHART_MODULE_END

echo "   ✅ Chart-Berechnungs-Modul erstellt: $CHART_MODULE"
echo ""

# 2. MCP Server erweitern
echo "2. Erweitere MCP Server..."

# Prüfe ob Chart-Berechnung bereits existiert
if grep -q "chart-calculation" "$SERVER_FILE"; then
    echo "   ⚠️  Chart-Berechnung existiert bereits!"
    echo "   📋 Überspringe Server-Erweiterung"
else
    # Füge Chart-Berechnungs-Service Import hinzu (nach require('dotenv'))
    sed -i "/require('dotenv')/a\\
const chartCalculationService = require('./chart-calculation');" "$SERVER_FILE"
    
    # Füge Chart-Berechnungs-Endpoints hinzu (vor app.listen)
    cat > /tmp/chart_endpoints.js << 'ENDPOINTS_END'
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
    
    # Füge Endpoints vor app.listen ein
    sed -i '/app.listen(PORT/ {
        i\
'"$(cat /tmp/chart_endpoints.js)"'
    }' "$SERVER_FILE"
    
    rm -f /tmp/chart_endpoints.js
    
    echo "   ✅ MCP Server erweitert"
fi
echo ""

# 3. Environment Variables prüfen/setzen
echo "3. Prüfe Environment Variables..."
ENV_FILE="/opt/mcp-connection-key/.env"

if [ -f "$ENV_FILE" ]; then
    # Prüfe ob READING_AGENT_URL gesetzt ist
    if ! grep -q "^READING_AGENT_URL=" "$ENV_FILE"; then
        echo "   📝 Füge READING_AGENT_URL hinzu..."
        echo "READING_AGENT_URL=http://localhost:4001" >> "$ENV_FILE"
    fi
    
    # Prüfe ob N8N_BASE_URL gesetzt ist
    if ! grep -q "^N8N_BASE_URL=" "$ENV_FILE"; then
        echo "   📝 Füge N8N_BASE_URL hinzu..."
        echo "N8N_BASE_URL=http://localhost:5678" >> "$ENV_FILE"
    fi
    
    echo "   ✅ Environment Variables geprüft"
else
    echo "   ⚠️  .env Datei nicht gefunden: $ENV_FILE"
fi
echo ""

# 4. MCP Server neu starten
echo "4. Starte MCP Server neu..."
systemctl restart mcp
sleep 3

# Status prüfen
if systemctl is-active --quiet mcp; then
    echo "   ✅ MCP Server läuft"
else
    echo "   ❌ MCP Server Fehler - prüfe Logs: journalctl -u mcp -n 50"
    echo "   ⚠️  Falls Fehler, wiederherstelle Backup:"
    echo "      cp $BACKUP_FILE $SERVER_FILE"
    exit 1
fi
echo ""

# 5. Test
echo "5. Teste Chart-Berechnung..."
sleep 2

TEST_RESPONSE=$(curl -s -X POST http://localhost:7000/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin, Germany"}' 2>&1)

if echo "$TEST_RESPONSE" | grep -q "success\|chartData"; then
    echo "   ✅ Chart-Berechnung funktioniert!"
    echo "   📄 Antwort (erste Zeile):"
    echo "$TEST_RESPONSE" | head -1
else
    echo "   ⚠️  Chart-Berechnung Test fehlgeschlagen"
    echo "   📄 Antwort:"
    echo "$TEST_RESPONSE"
fi
echo ""

echo "=============================================="
echo "✅ Saubere Chart-Berechnungs-Implementierung abgeschlossen!"
echo "=============================================="
echo ""
echo "📋 Verfügbare Endpoints:"
echo "   POST /chart/calculate - Chart berechnen"
echo "   GET  /chart/stats     - Cache-Statistiken"
echo "   POST /chart/cache/clear - Cache leeren"
echo ""
echo "🧪 Test:"
echo "   curl -X POST http://localhost:7000/chart/calculate \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"birthDate\": \"1990-05-15\", \"birthTime\": \"14:30\", \"birthPlace\": \"Berlin, Germany\"}'"
echo ""

