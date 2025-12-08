# 🔒 CORS-Konfiguration für Agenten-Integration

## 📍 Auf Hetzner Server (138.199.237.34)

### Schritt 1: CORS für Connection-Key Server

**Datei:** `/opt/mcp-connection-key/.env`

```bash
# CORS Origins für CK-App Server erlauben
CORS_ORIGINS=https://www.the-connection-key.de,https://the-connection-key.de,http://localhost:3000
```

**Oder direkt setzen:**

```bash
cd /opt/mcp-connection-key

# Füge CORS Origins hinzu
echo "CORS_ORIGINS=https://www.the-connection-key.de,https://the-connection-key.de,http://localhost:3000" >> .env

# Connection-Key Server neu starten
docker-compose restart connection-key
```

---

### Schritt 2: CORS für MCP Server (Port 7000)

**Datei:** `/opt/mcp/server.js`

Prüfen Sie, ob CORS bereits aktiviert ist. Falls nicht, fügen Sie hinzu:

```javascript
const cors = require('cors');

// CORS konfigurieren
app.use(cors({
  origin: [
    'https://www.the-connection-key.de',
    'https://the-connection-key.de',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

**Auf Server ausführen:**

```bash
cd /opt/mcp

# Prüfe ob CORS bereits in server.js ist
grep -q "cors" server.js || npm install cors

# MCP Server neu starten
systemctl restart mcp
```

---

### Schritt 3: CORS für Reading Agent (Port 4001)

**Datei:** `/opt/mcp-connection-key/production/server.js`

Der Reading Agent hat bereits CORS aktiviert, aber prüfen Sie die Konfiguration:

```javascript
// In production/server.js sollte bereits stehen:
app.use(cors());
```

**Falls Sie spezifische Origins erlauben möchten:**

```javascript
app.use(cors({
  origin: [
    'https://www.the-connection-key.de',
    'https://the-connection-key.de',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

**Reading Agent neu starten:**

```bash
cd /opt/mcp-connection-key/production
pm2 restart reading-agent
```

---

## 🔧 Automatisches Setup-Script

Erstellen Sie auf dem Hetzner Server:

```bash
#!/bin/bash
# CORS Setup für Agenten-Integration

set -e

echo "🔒 Konfiguriere CORS für Agenten-Integration..."
echo "=============================================="
echo ""

# 1. Connection-Key Server CORS
echo "1. Connection-Key Server CORS..."
cd /opt/mcp-connection-key

# Entferne alte CORS_ORIGINS Einträge
sed -i '/^CORS_ORIGINS=/d' .env

# Füge neue CORS Origins hinzu
echo "CORS_ORIGINS=https://www.the-connection-key.de,https://the-connection-key.de,http://localhost:3000" >> .env

echo "✅ CORS_ORIGINS in .env gesetzt"
echo ""

# 2. MCP Server CORS prüfen
echo "2. MCP Server CORS..."
cd /opt/mcp

if ! grep -q "cors" server.js; then
    echo "⚠️  CORS nicht in server.js gefunden"
    echo "   Bitte manuell prüfen und hinzufügen"
else
    echo "✅ CORS bereits in server.js"
fi
echo ""

# 3. Reading Agent CORS prüfen
echo "3. Reading Agent CORS..."
cd /opt/mcp-connection-key/production

if grep -q "app.use(cors())" server.js; then
    echo "✅ CORS bereits aktiviert in Reading Agent"
else
    echo "⚠️  CORS nicht gefunden in Reading Agent"
    echo "   Bitte manuell prüfen"
fi
echo ""

# 4. Services neu starten
echo "4. Starte Services neu..."
cd /opt/mcp-connection-key

echo "   - Connection-Key Server..."
docker-compose restart connection-key

echo "   - MCP Server..."
systemctl restart mcp

echo "   - Reading Agent..."
pm2 restart reading-agent

echo ""
echo "✅ CORS-Konfiguration abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "   1. Testen Sie die API-Aufrufe vom CK-App Server"
echo "   2. Prüfen Sie Browser-Console auf CORS-Fehler"
echo ""
```

**Speichern als:** `/opt/mcp-connection-key/setup-cors.sh`

**Ausführen:**

```bash
chmod +x /opt/mcp-connection-key/setup-cors.sh
/opt/mcp-connection-key/setup-cors.sh
```

---

## 🧪 CORS testen

### Vom CK-App Server testen:

```bash
# Test MCP Server (Port 7000)
curl -H "Origin: https://www.the-connection-key.de" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://138.199.237.34:7000/agent/marketing

# Test Reading Agent (Port 4001)
curl -H "Origin: https://www.the-connection-key.de" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://138.199.237.34:4001/reading/generate
```

**Erwartete Antwort:**
- `Access-Control-Allow-Origin: https://www.the-connection-key.de`
- `Access-Control-Allow-Methods: POST, GET, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

---

## ✅ Schritt 3 abgeschlossen!

Die CORS-Konfiguration ist vorbereitet. Führen Sie das Setup-Script auf dem Hetzner Server aus.

