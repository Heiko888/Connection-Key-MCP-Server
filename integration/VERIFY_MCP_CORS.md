# ✅ MCP Server CORS Prüfung

## Prüfen ob CORS aktiviert ist

```bash
# Prüfe ob CORS in server.js vorhanden ist
grep -A 10 "app.use(cors" /opt/mcp/server.js

# Oder die ganze CORS-Sektion anzeigen
grep -B 2 -A 12 "cors" /opt/mcp/server.js
```

## Test mit Origin-Header

```bash
# Test mit Origin-Header (simuliert Browser-Anfrage)
curl -X POST http://localhost:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -H "Origin: https://www.the-connection-key.de" \
  -d '{"message": "Test"}'

# Prüfe ob CORS-Header in der Antwort sind
curl -v -X POST http://localhost:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -H "Origin: https://www.the-connection-key.de" \
  -d '{"message": "Test"}' 2>&1 | grep -i "access-control"
```

## Test vom CK-App Server

Vom CK-App Server (167.235.224.149) aus:

```bash
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -H "Origin: https://www.the-connection-key.de" \
  -d '{"message": "Test"}'
```

**Wenn das funktioniert:**
- ✅ CORS ist korrekt konfiguriert
- ✅ Firewall ist offen
- ✅ Server-zu-Server Verbindung funktioniert

## Finale Prüfung

```bash
# Alle Services prüfen
echo "=== Connection-Key Server ==="
curl -s http://localhost:3000/health | head -1

echo "=== MCP Server ==="
curl -s http://localhost:7000/health | head -1

echo "=== Reading Agent ==="
curl -s http://localhost:4001/health | head -1

echo ""
echo "=== CORS Prüfung ==="
grep -q "app.use(cors" /opt/mcp/server.js && echo "✅ MCP Server CORS aktiviert" || echo "❌ MCP Server CORS fehlt"
grep -q "app.use(cors())" /opt/mcp-connection-key/production/server.js && echo "✅ Reading Agent CORS aktiviert" || echo "❌ Reading Agent CORS fehlt"
grep -q "CORS_ORIGINS" /opt/mcp-connection-key/.env && echo "✅ Connection-Key Server CORS konfiguriert" || echo "❌ Connection-Key Server CORS fehlt"
```

