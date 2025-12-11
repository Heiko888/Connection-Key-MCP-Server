# 🔧 Chart-Berechnung manuell einrichten

## ✅ Was bereits erledigt ist

- ✅ Backup erstellt: `/opt/mcp/server.js.backup.20251209_013722`
- ✅ Chart-Berechnungs-Modul erstellt: `/opt/mcp/chart-calculation.js`

## ❌ Was noch fehlt

- ❌ MCP Server erweitern (sed-Fehler)
- ❌ Environment Variables prüfen
- ❌ MCP Server neu starten

---

## 🛠️ Manuelle Einrichtung

### Schritt 1: Prüfen Sie das Modul

```bash
# Auf Hetzner Server
ls -la /opt/mcp/chart-calculation.js
cat /opt/mcp/chart-calculation.js | head -20
```

**Sollte zeigen:** Das Chart-Berechnungs-Modul wurde erstellt.

### Schritt 2: MCP Server erweitern

```bash
cd /opt/mcp

# Öffnen Sie server.js
nano server.js
# ODER
vim server.js
```

**Fügen Sie hinzu:**

**A) Nach `require('dotenv')` (oder nach anderen require-Statements):**
```javascript
const chartCalculationService = require('./chart-calculation');
```

**B) Vor `app.listen(PORT, ...)` (am Ende der Datei, vor dem letzten Block):**
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

### Schritt 3: Environment Variables prüfen

```bash
cd /opt/mcp-connection-key

# Prüfe .env
grep -E "^(READING_AGENT_URL|N8N_BASE_URL)=" .env

# Falls nicht vorhanden, füge hinzu:
echo "READING_AGENT_URL=http://localhost:4001" >> .env
echo "N8N_BASE_URL=http://localhost:5678" >> .env
```

### Schritt 4: MCP Server neu starten

```bash
systemctl restart mcp
sleep 3

# Status prüfen
systemctl status mcp

# Logs prüfen
journalctl -u mcp -n 20
```

### Schritt 5: Test

```bash
# Test Chart-Berechnung
curl -X POST http://localhost:7000/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin, Germany"}'

# Test Cache-Statistiken
curl http://localhost:7000/chart/stats
```

---

## ✅ Alternative: Korrigiertes Script verwenden

Falls Sie das korrigierte Script verwenden möchten:

```bash
cd /opt/mcp-connection-key
chmod +x integration/scripts/setup-chart-calculation-clean-fixed.sh
./integration/scripts/setup-chart-calculation-clean-fixed.sh
```

**Das korrigierte Script:**
- ✅ Verwendet `mktemp` für temporäre Datei
- ✅ Fügt Code am Ende hinzu (statt mit sed)
- ✅ Robusteres Einfügen

---

## 📋 Zusammenfassung

**Status:**
- ✅ Chart-Berechnungs-Modul erstellt
- ❌ MCP Server noch nicht erweitert

**Nächste Schritte:**
1. Erweitern Sie `server.js` manuell (siehe oben)
2. Oder verwenden Sie das korrigierte Script
3. Starten Sie MCP Server neu
4. Testen Sie die Endpoints

