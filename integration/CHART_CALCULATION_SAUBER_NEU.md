# 🏗️ Chart-Berechnung - Sauber neu aufsetzen

## 📋 Ziel

Eine **saubere, zentrale Chart-Berechnungs-Implementierung** im MCP Server, die:
- ✅ Alle Agenten nutzen können
- ✅ Wartbar und erweiterbar ist
- ✅ Klare Trennung von Logik und API
- ✅ Mehrere Berechnungs-Methoden unterstützt

---

## 🏗️ Architektur

### Struktur:

```
MCP Server (Port 7000)
├── /chart/calculate          ← Chart-Berechnungs-Endpoint
├── /chart/calculate/direct   ← Direkte Berechnung (n8n/API)
├── /chart/calculate/cached  ← Gecachte Berechnung
└── /agent/chart-development ← Nutzt Chart-Berechnung intern
```

### Berechnungs-Methoden (Priorität):

1. **n8n Webhook** (Primär) - Falls n8n Chart-Berechnung vorhanden
2. **Externe API** (Sekundär) - Human Design API oder ähnlich
3. **Reading Agent** (Fallback) - Als letzte Option

---

## 📝 Implementierung

### 1. Chart-Berechnungs-Modul

**Datei:** `/opt/mcp/chart-calculation.js` (NEU)

```javascript
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
    this.cache = new Map(); // Einfaches In-Memory-Cache
    this.methods = [];
    this.setupMethods();
  }

  /**
   * Setup Berechnungs-Methoden (Priorität)
   */
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

    // Sortiere nach Priorität
    this.methods.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Haupt-Berechnungs-Funktion
   */
  async calculate(birthDate, birthTime, birthPlace, options = {}) {
    // Cache-Key generieren
    const cacheKey = `${birthDate}-${birthTime}-${birthPlace}`;
    
    // Prüfe Cache (falls nicht disabled)
    if (!options.skipCache && this.cache.has(cacheKey)) {
      return {
        ...this.cache.get(cacheKey),
        cached: true,
        method: 'cache'
      };
    }

    // Versuche jede Methode (nach Priorität)
    for (const method of this.methods) {
      try {
        const result = await method.calculate(birthDate, birthTime, birthPlace);
        
        if (result && Object.keys(result).length > 0) {
          // In Cache speichern
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
        // Weiter zur nächsten Methode
        continue;
      }
    }

    // Alle Methoden fehlgeschlagen
    throw new Error('Chart-Berechnung fehlgeschlagen: Keine verfügbare Methode');
  }

  /**
   * Methode 1: n8n Webhook
   */
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

  /**
   * Methode 2: Externe API
   */
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

  /**
   * Methode 3: Reading Agent (Fallback)
   */
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

  /**
   * Normalisiere Chart-Daten (einheitliches Format)
   */
  normalizeChartData(data) {
    // Stelle sicher, dass alle wichtigen Felder vorhanden sind
    return {
      type: data.type || null,
      profile: data.profile || null,
      authority: data.authority || null,
      strategy: data.strategy || null,
      centers: data.centers || {},
      gates: data.gates || {},
      channels: data.channels || {},
      incarnationCross: data.incarnationCross || null,
      ...data // Behalte alle zusätzlichen Felder
    };
  }

  /**
   * Cache leeren
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Cache-Statistiken
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      methods: this.methods.map(m => m.name)
    };
  }
}

// Singleton-Instanz
const chartCalculationService = new ChartCalculationService();

module.exports = chartCalculationService;
```

### 2. MCP Server Integration

**Datei:** `/opt/mcp/server.js` (ERWEITERN)

```javascript
// Chart-Berechnungs-Service importieren
const chartCalculationService = require('./chart-calculation');

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
```

### 3. Chart Development Agent erweitern

**Datei:** `/opt/mcp/server.js` (ERWEITERN)

```javascript
// Chart Development Agent
app.post('/agent/chart-development', async (req, res) => {
  const { agentId } = req.params;
  const { message, chartType, chartData, birthDate, birthTime, birthPlace } = req.body;
  
  // Chart-Daten berechnen (sauber, zentral)
  let calculatedChartData = chartData || {};
  if (birthDate && birthTime && birthPlace) {
    try {
      calculatedChartData = await chartCalculationService.calculate(
        birthDate, 
        birthTime, 
        birthPlace
      );
    } catch (error) {
      console.warn('Chart-Berechnung fehlgeschlagen:', error);
      // Weiter mit leeren Chart-Daten
    }
  }
  
  // Rest der Agent-Logik...
  const agentConfig = loadAgentConfig('chart-development');
  const systemPrompt = loadPrompt(agentConfig.promptFile);
  
  // System Prompt mit Chart-Daten erweitern
  const enhancedPrompt = `${systemPrompt}\n\nBerechnete Chart-Daten:\n${JSON.stringify(calculatedChartData, null, 2)}`;
  
  // OpenAI API aufrufen
  const completion = await openai.chat.completions.create({
    model: agentConfig.model || 'gpt-4',
    messages: [
      { role: 'system', content: enhancedPrompt },
      { role: 'user', content: message }
    ],
    temperature: agentConfig.temperature || 0.3,
    max_tokens: agentConfig.maxTokens || 6000
  });
  
  res.json({
    agent: 'chart-development',
    message,
    response: completion.choices[0].message.content,
    chartData: calculatedChartData,
    tokens: completion.usage.total_tokens,
    model: agentConfig.model || 'gpt-4'
  });
});
```

---

## 🔧 Environment Variables

**Datei:** `/opt/mcp-connection-key/.env` (ERWEITERN)

```bash
# Chart-Berechnung
N8N_BASE_URL=http://localhost:5678
N8N_CHART_WEBHOOK=/webhook/chart-calculation
CHART_API_URL=  # Optional: Externe Chart-API
READING_AGENT_URL=http://localhost:4001
```

---

## ✅ Vorteile der sauberen Implementierung

1. ✅ **Modular:** Separates Modul für Chart-Berechnung
2. ✅ **Erweiterbar:** Neue Methoden einfach hinzufügbar
3. ✅ **Wartbar:** Klare Trennung von Logik und API
4. ✅ **Caching:** In-Memory-Cache für Performance
5. ✅ **Fallback:** Mehrere Methoden mit Priorität
6. ✅ **Normalisiert:** Einheitliches Datenformat

---

## 📋 Implementierungs-Schritte

1. ✅ Chart-Berechnungs-Modul erstellen (`chart-calculation.js`)
2. ✅ MCP Server erweitern (Endpoints hinzufügen)
3. ✅ Chart Development Agent anpassen
4. ✅ Environment Variables setzen
5. ✅ Testing durchführen

---

## 🧪 Testing

```bash
# Test 1: Chart-Berechnung
curl -X POST http://localhost:7000/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany"
  }'

# Test 2: Cache-Statistiken
curl http://localhost:7000/chart/stats

# Test 3: Cache leeren
curl -X POST http://localhost:7000/chart/cache/clear
```

---

## 📋 Zusammenfassung

**Saubere, neue Implementierung:**
- ✅ Separates Modul (`chart-calculation.js`)
- ✅ Klare Architektur
- ✅ Mehrere Berechnungs-Methoden
- ✅ Caching-Support
- ✅ Einfach erweiterbar

**Nächste Schritte:**
1. Chart-Berechnungs-Modul erstellen
2. MCP Server erweitern
3. Testing durchführen

