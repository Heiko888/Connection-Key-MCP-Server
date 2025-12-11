# 🔧 CORS manuell zum MCP Server hinzufügen

## Schnell-Lösung (ohne Script)

Führen Sie diese Befehle **direkt auf dem Hetzner Server** aus:

```bash
cd /opt/mcp

# 1. Installiere cors
npm install cors

# 2. Bearbeite server.js
nano server.js
```

**In nano:**
1. Finden Sie die Zeile: `const app = express();`
2. Fügen Sie **danach** hinzu:
   ```javascript
   const cors = require('cors');
   ```
3. Finden Sie die Zeile: `app.use(express.json());`
4. Fügen Sie **danach** hinzu:
   ```javascript
   
   // CORS konfigurieren
   app.use(cors({
     origin: [
       'https://www.the-connection-key.de',
       'https://the-connection-key.de',
       'http://localhost:3000',
       'http://167.235.224.149:3000'
     ],
     credentials: true
   }));
   ```
5. Speichern: `Ctrl+X`, dann `Y`, dann `Enter`

**Dann:**

```bash
# MCP Server neu starten
systemctl restart mcp

# Prüfen
sleep 2
curl http://localhost:7000/health
```

---

## Oder mit sed (automatisch)

```bash
cd /opt/mcp

# Installiere cors
npm install cors

# Füge cors require hinzu
sed -i "/const express = require('express');/a\\
const cors = require('cors');" server.js

# Füge CORS-Middleware hinzu
sed -i "/app.use(express.json());/a\\
\\
// CORS konfigurieren\\
app.use(cors({\\
  origin: [\\
    'https://www.the-connection-key.de',\\
    'https://the-connection-key.de',\\
    'http://localhost:3000',\\
    'http://167.235.224.149:3000'\\
  ],\\
  credentials: true\\
}));" server.js

# MCP Server neu starten
systemctl restart mcp

# Prüfen
sleep 2
curl http://localhost:7000/health
```

---

## Prüfen ob es funktioniert

```bash
# Prüfe ob CORS jetzt vorhanden ist
grep -A 10 "app.use(cors" /opt/mcp/server.js

# Teste MCP Server
curl http://localhost:7000/health

# Teste mit Origin-Header
curl -X POST http://localhost:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -H "Origin: https://www.the-connection-key.de" \
  -d '{"message": "Test"}'
```

---

## Nach Git Pull

Falls Sie das Script später verwenden möchten:

```bash
cd /opt/mcp-connection-key
git pull origin main
chmod +x integration/ADD_MCP_CORS.sh
./integration/ADD_MCP_CORS.sh
```

