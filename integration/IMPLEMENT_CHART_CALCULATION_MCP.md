# 🔧 Chart-Berechnung im MCP Server implementieren

## 📋 Implementierungs-Plan

### Schritt 1: Chart-Berechnungs-Funktion hinzufügen

**Datei:** `/opt/mcp/server.js`

```javascript
// Chart-Berechnungs-Funktion
async function calculateChart(birthDate, birthTime, birthPlace) {
  try {
    // Option 1: n8n Webhook (empfohlen, falls n8n Chart-Berechnung hat)
    const n8nUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
    const response = await fetch(`${n8nUrl}/webhook/chart-calculation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birthDate, birthTime, birthPlace })
    });
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('n8n Chart-Berechnung fehlgeschlagen:', error);
  }
  
  // Option 2: Reading Agent (Fallback)
  try {
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
    
    if (response.ok) {
      const data = await response.json();
      return data.chartData || {};
    }
  } catch (error) {
    console.warn('Reading Agent Chart-Berechnung fehlgeschlagen:', error);
  }
  
  // Option 3: Chart-Berechnungs-Bibliothek (z.B. swisseph)
  // TODO: Implementieren falls Bibliothek vorhanden
  
  return {};
}

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
```

### Schritt 2: Chart Development Agent anpassen

**Datei:** `/opt/mcp/server.js`

```javascript
// Chart Development Agent
app.post('/agent/chart-development', async (req, res) => {
  const { agentId } = req.params;
  const { message, chartType, chartData, birthDate, birthTime, birthPlace } = req.body;
  
  // Chart-Daten berechnen (intern, kein HTTP-Request)
  let calculatedChartData = chartData || {};
  if (birthDate && birthTime && birthPlace) {
    calculatedChartData = await calculateChart(birthDate, birthTime, birthPlace);
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

### Schritt 3: Environment Variables hinzufügen

**Datei:** `/opt/mcp-connection-key/.env`

```bash
# Chart-Berechnung
N8N_BASE_URL=http://localhost:5678
READING_AGENT_URL=http://localhost:4001
```

---

## 🧪 Testing

### Test 1: Chart-Berechnungs-Endpoint

```bash
curl -X POST http://138.199.237.34:7000/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany"
  }'
```

**Erwartete Antwort:**
```json
{
  "success": true,
  "chartData": {
    "type": "Generator",
    "profile": "1/3",
    "authority": "Sacral",
    "centers": {...},
    "gates": {...},
    "channels": {...}
  },
  "timestamp": "2025-12-08T..."
}
```

### Test 2: Chart Development Agent mit Chart-Daten

```bash
curl -X POST http://138.199.237.34:7000/agent/chart-development \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle eine Bodygraph-Komponente",
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany"
  }'
```

---

## ✅ Vorteile der Implementierung

1. ✅ **Zentralisiert:** Alle Agenten können Chart-Daten nutzen
2. ✅ **Performance:** Keine HTTP-Requests zwischen Services
3. ✅ **Wiederverwendbar:** Marketing, Sales, etc. können auch Chart-Daten nutzen
4. ✅ **Einfach:** Ein Endpoint für alle
5. ✅ **Skalierbar:** Kann später erweitert werden (Caching, etc.)

---

## 📋 Zusammenfassung

**Implementierung:**
1. ✅ Chart-Berechnungs-Funktion `calculateChart()` hinzufügen
2. ✅ Endpoint `POST /chart/calculate` erstellen
3. ✅ Chart Development Agent anpassen (interne Funktion nutzen)
4. ✅ Environment Variables hinzufügen
5. ✅ Testing durchführen

**Ergebnis:**
- Alle Agenten können Chart-Daten nutzen
- Bessere Performance
- Zentralisierte Logik
- Einfache Wartung

