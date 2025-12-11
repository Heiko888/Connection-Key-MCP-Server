# 🔧 Fix: "Keine verfügbare Methode" - Chart-Berechnung

## ❌ Problem

**Fehler:**
```json
{
  "error": "Chart calculation failed",
  "message": "Chart-Berechnung fehlgeschlagen: Keine verfügbare Methode"
}
```

**Ursache:** Das Chart-Berechnungs-Modul findet keine funktionierende Berechnungs-Methode.

---

## ✅ Lösung

### Schritt 1: Prüfen Sie Environment Variables

```bash
# Auf Hetzner Server
cd /opt/mcp-connection-key

# Prüfe .env
grep -E "^(READING_AGENT_URL|N8N_BASE_URL)=" .env
```

**Sollte zeigen:**
```
READING_AGENT_URL=http://localhost:4001
N8N_BASE_URL=http://localhost:5678
```

**Falls nicht vorhanden, fügen Sie hinzu:**
```bash
echo "READING_AGENT_URL=http://localhost:4001" >> .env
echo "N8N_BASE_URL=http://localhost:5678" >> .env
```

### Schritt 2: Prüfen Sie Reading Agent

```bash
# Prüfe ob Reading Agent läuft
curl http://localhost:4001/health

# Teste Reading Agent direkt
curl -X POST http://localhost:4001/reading/generate \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin, Germany", "readingType": "detailed"}'
```

**Falls Reading Agent nicht läuft:**
```bash
pm2 status reading-agent
pm2 start reading-agent
```

### Schritt 3: Prüfen Sie Chart-Berechnungs-Modul

```bash
# Prüfe ob Modul korrekt ist
cat /opt/mcp/chart-calculation.js | grep -A 5 "READING_AGENT_URL"
```

**Sollte zeigen:**
```javascript
const readingAgentUrl = process.env.READING_AGENT_URL || 'http://localhost:4001';
```

### Schritt 4: MCP Server neu starten (damit ENV geladen wird)

```bash
systemctl restart mcp
sleep 3

# Prüfe Logs
journalctl -u mcp -n 20
```

### Schritt 5: Test erneut

```bash
curl -X POST http://localhost:7000/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin, Germany"}'
```

---

## 🔍 Debugging

### Prüfen Sie welche Methoden verfügbar sind:

```bash
# Prüfe Chart-Berechnungs-Modul
node -e "
require('dotenv').config({ path: '/opt/mcp-connection-key/.env' });
console.log('READING_AGENT_URL:', process.env.READING_AGENT_URL);
console.log('N8N_BASE_URL:', process.env.N8N_BASE_URL);
"
```

### Prüfen Sie Reading Agent Response:

```bash
# Teste Reading Agent
curl -X POST http://localhost:4001/reading/generate \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin", "readingType": "detailed"}' | jq '.chartData'
```

**Falls `chartData` nicht vorhanden:**
- Reading Agent gibt möglicherweise keine `chartData` zurück
- Chart-Berechnungs-Modul muss angepasst werden

---

## 🛠️ Quick Fix Script

```bash
#!/bin/bash
# Quick Fix für Chart-Berechnung

cd /opt/mcp-connection-key

# 1. Setze Environment Variables
if ! grep -q "^READING_AGENT_URL=" .env; then
    echo "READING_AGENT_URL=http://localhost:4001" >> .env
fi

if ! grep -q "^N8N_BASE_URL=" .env; then
    echo "N8N_BASE_URL=http://localhost:5678" >> .env
fi

# 2. Prüfe Reading Agent
if ! curl -s http://localhost:4001/health > /dev/null; then
    echo "⚠️  Reading Agent läuft nicht!"
    echo "📋 Starte Reading Agent..."
    pm2 start reading-agent || echo "⚠️  PM2 Fehler"
fi

# 3. MCP Server neu starten
systemctl restart mcp
sleep 3

# 4. Test
echo "🧪 Test..."
curl -X POST http://localhost:7000/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin"}'
```

---

## 📋 Zusammenfassung

**Problem:** "Keine verfügbare Methode"

**Lösung:**
1. ✅ Setze `READING_AGENT_URL` in `.env`
2. ✅ Prüfe ob Reading Agent läuft
3. ✅ Starte MCP Server neu (damit ENV geladen wird)
4. ✅ Teste erneut

