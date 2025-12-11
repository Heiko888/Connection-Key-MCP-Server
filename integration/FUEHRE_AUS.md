# 🚀 Chart-Endpoints hinzufügen - Jetzt ausführen

## 📋 Befehle für Hetzner Server

Führen Sie diese Befehle **auf dem Hetzner Server** aus:

```bash
cd /opt/mcp
chmod +x /opt/mcp-connection-key/integration/scripts/add-endpoints-simple.sh
/opt/mcp-connection-key/integration/scripts/add-endpoints-simple.sh
```

---

## ✅ Was das Script macht

1. ✅ Erstellt Backup von server.js
2. ✅ Fügt Chart-Endpoints vor `app.listen` hinzu
3. ✅ Startet MCP Server neu
4. ✅ Führt Test durch

---

## 🧪 Nach der Ausführung testen

```bash
# Test Chart-Berechnung
curl -X POST http://localhost:7000/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin, Germany"}'

# Test Cache-Statistiken
curl http://localhost:7000/chart/stats
```

---

## ✅ Erwartete Antwort

```json
{
  "success": true,
  "chartData": {...},
  "method": "reading",
  "cached": false,
  "timestamp": "..."
}
```

