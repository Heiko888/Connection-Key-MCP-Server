# 🔍 Quick Check - Chart-Berechnung

## 📋 Prüfen Sie auf Hetzner Server

```bash
# 1. Prüfe ob Modul existiert
ls -la /opt/mcp/chart-calculation.js

# 2. Prüfe ob server.js erweitert wurde
grep -n "chart-calculation" /opt/mcp/server.js

# 3. Prüfe ob Endpoints vorhanden sind
grep -n "/chart/calculate" /opt/mcp/server.js

# 4. Teste Endpoint
curl -X POST http://localhost:7000/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin, Germany"}'
```

## ✅ Erwartete Ergebnisse

### 1. Modul sollte existieren:
```
-rw-r--r-- 1 root root 5000 ... /opt/mcp/chart-calculation.js
```

### 2. server.js sollte enthalten:
```
const chartCalculationService = require('./chart-calculation');
```

### 3. Endpoints sollten vorhanden sein:
```
app.post('/chart/calculate', ...
app.get('/chart/stats', ...
app.post('/chart/cache/clear', ...
```

### 4. Test sollte funktionieren:
```json
{
  "success": true,
  "chartData": {...},
  "method": "reading",
  "cached": false
}
```

## ❌ Falls nicht implementiert

Führen Sie aus:
```bash
cd /opt/mcp-connection-key
chmod +x integration/scripts/manual-chart-setup.sh
./integration/scripts/manual-chart-setup.sh
```

