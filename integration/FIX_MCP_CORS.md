# 🔧 MCP Server CORS hinzufügen

## Problem

```
❌ CORS nicht in server.js gefunden
💡 Bitte fügen Sie hinzu: app.use(cors())
```

## Lösung

### Auf Hetzner Server ausführen:

```bash
cd /opt/mcp

# Prüfe ob server.js existiert
ls -la server.js

# Prüfe ob cors bereits installiert ist
grep -q "cors" package.json || npm install cors

# Füge CORS zu server.js hinzu
# Öffne server.js und füge nach den require-Statements hinzu:
```

**In `/opt/mcp/server.js` hinzufügen:**

```javascript
const cors = require('cors');

// Nach app = express() hinzufügen:
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

### Automatisches Script:

```bash
cd /opt/mcp

# Installiere cors (falls nicht vorhanden)
npm install cors

# Prüfe ob CORS bereits in server.js ist
if ! grep -q "cors" server.js; then
    # Füge CORS nach express() hinzu
    sed -i '/const app = express();/a\
const cors = require("cors");\
app.use(cors({\
  origin: [\
    "https://www.the-connection-key.de",\
    "https://the-connection-key.de",\
    "http://localhost:3000",\
    "http://167.235.224.149:3000"\
  ],\
  credentials: true\
}));' server.js
    
    echo "✅ CORS zu server.js hinzugefügt"
else
    echo "✅ CORS bereits vorhanden"
fi

# MCP Server neu starten
systemctl restart mcp

# Prüfen
sleep 2
curl http://localhost:7000/health
```

### Manuell bearbeiten:

```bash
cd /opt/mcp
nano server.js

# Fügen Sie nach "const app = express();" hinzu:
# const cors = require('cors');
# app.use(cors({...}));

# Speichern und beenden (Ctrl+X, Y, Enter)

# MCP Server neu starten
systemctl restart mcp
```

---

## Prüfen

```bash
# Prüfe ob CORS jetzt vorhanden ist
grep -A 5 "cors" /opt/mcp/server.js

# Teste MCP Server
curl http://localhost:7000/health

# Teste vom CK-App Server (167.235.224.149)
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -H "Origin: https://www.the-connection-key.de" \
  -d '{"message": "Test"}'
```

---

## Hinweis zur Firewall

Das Script zeigt "Port 7000: ❌ Geschlossen", aber die Ausgabe zeigt:
```
Skipping adding existing rule
```

Das bedeutet, die Ports sind bereits offen! Das ist nur ein Anzeigefehler im Script. Die Firewall ist korrekt konfiguriert.

