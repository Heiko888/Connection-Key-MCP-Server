# 🚀 Chart-Endpoints jetzt hinzufügen

## ✅ Status

- ✅ Chart-Berechnungs-Modul vorhanden
- ✅ chart-calculation wird importiert
- ❌ Chart-Endpoints fehlen noch

## 🔧 Lösung

Führen Sie auf dem Hetzner Server aus:

```bash
cd /opt/mcp
chmod +x /opt/mcp-connection-key/integration/scripts/add-chart-endpoints.sh
/opt/mcp-connection-key/integration/scripts/add-chart-endpoints.sh
```

**Das Script:**
1. ✅ Erstellt Backup von server.js
2. ✅ Fügt Chart-Endpoints vor `app.listen` hinzu
3. ✅ Startet MCP Server neu
4. ✅ Führt Test durch

---

## 📋 Alternative: Manuell

Falls das Script nicht funktioniert, fügen Sie manuell hinzu:

```bash
cd /opt/mcp
nano server.js
```

**Fügen Sie vor `app.listen(PORT, ...)` hinzu:**

```javascript
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

**Dann:**
```bash
systemctl restart mcp
```

---

## ✅ Nach der Implementierung

**Test:**
```bash
curl -X POST http://localhost:7000/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin, Germany"}'
```

**Erwartete Antwort:**
```json
{
  "success": true,
  "chartData": {...},
  "method": "reading",
  "cached": false,
  "timestamp": "..."
}
```

