# 🚀 Jetzt einrichten - Schritt für Schritt

Komplette Anleitung zum Erstellen der .env Datei und Starten der Services auf dem Hetzner Server.

## 📋 Schritt 1: Auf Hetzner Server verbinden

```bash
ssh root@IHR-SERVER-IP
cd /opt/mcp-connection-key
```

## 🔐 Schritt 2: .env Datei erstellen

### Option A: Mit automatisch generierten Passwörtern (Empfohlen)

```bash
cd /opt/mcp-connection-key

# Generiere sichere Passwörter
N8N_PASS=$(openssl rand -hex 16)
API_KEY=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)

# Frage nach OpenAI API Key
read -p "Bitte geben Sie Ihren OpenAI API Key ein: " OPENAI_KEY

# Erstelle .env Datei
cat > .env << EOF
# ERFORDERLICH
OPENAI_API_KEY=$OPENAI_KEY
N8N_PASSWORD=$N8N_PASS
API_KEY=$API_KEY

# URLs (Docker interne Namen)
N8N_BASE_URL=http://n8n:5678
MCP_SERVER_URL=http://mcp-server:7777
CHATGPT_AGENT_URL=http://chatgpt-agent:4000
CONNECTION_KEY_URL=http://connection-key:3000

# Server Ports
PORT=3000

# Authentication
AUTH_ENABLED=true
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGINS=*

# Environment
NODE_ENV=production
LOG_LEVEL=info
LOG_FORMAT=json

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
EOF

# Berechtigungen setzen
chmod 600 .env

# Zeige generierte Werte
echo ""
echo "=========================================="
echo "✅ .env Datei erstellt!"
echo "=========================================="
echo ""
echo "⚠️  WICHTIG: Notieren Sie sich diese Werte:"
echo "   n8n Passwort: $N8N_PASS"
echo "   API Key:      $API_KEY"
echo "=========================================="
```

### Option B: Manuell mit nano

```bash
cd /opt/mcp-connection-key

# Erstelle .env mit Platzhaltern
cat > .env << 'EOF'
OPENAI_API_KEY=sk-your-openai-api-key-here
N8N_PASSWORD=secure-password-change-me
API_KEY=your-secure-api-key-change-me
N8N_BASE_URL=http://n8n:5678
MCP_SERVER_URL=http://mcp-server:7777
CHATGPT_AGENT_URL=http://chatgpt-agent:4000
CONNECTION_KEY_URL=http://connection-key:3000
PORT=3000
AUTH_ENABLED=true
JWT_SECRET=your-super-secret-jwt-key-change-me
JWT_EXPIRES_IN=24h
CORS_ORIGINS=*
NODE_ENV=production
LOG_LEVEL=info
LOG_FORMAT=json
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
EOF

chmod 600 .env

# Bearbeiten Sie die Werte
nano .env
```

## ✅ Schritt 3: .env Datei prüfen

```bash
# Prüfe ob Datei existiert
ls -la .env

# Zeige Werte (ohne sensible Daten)
grep -E "^(OPENAI_API_KEY|N8N_PASSWORD|API_KEY)=" .env

# Prüfe ob alle wichtigen Werte gesetzt sind
if grep -q "OPENAI_API_KEY=sk-your" .env; then
    echo "⚠️  OPENAI_API_KEY muss noch angepasst werden!"
fi
```

## 🐳 Schritt 4: Docker prüfen

```bash
# Prüfe Docker
docker --version
docker-compose --version

# Prüfe ob Docker läuft
systemctl status docker

# Falls Docker nicht läuft:
systemctl start docker
```

## 🧹 Schritt 5: Alte Container aufräumen (optional)

```bash
cd /opt/mcp-connection-key

# Stoppe alte Container
docker-compose down 2>/dev/null || true

# Prüfe ob noch Container laufen
docker ps -a | grep -E "(mcp|agent|connection|n8n)"
```

## 🔨 Schritt 6: Docker Images bauen

```bash
cd /opt/mcp-connection-key

echo "🔨 Baue Docker Images..."
docker-compose build

# Das kann einige Minuten dauern
```

## 🚀 Schritt 7: Services starten

```bash
cd /opt/mcp-connection-key

echo "🚀 Starte Services..."
docker-compose up -d

# Warte bis Services hochgefahren sind
echo "⏳ Warte 15 Sekunden..."
sleep 15
```

## 📊 Schritt 8: Status prüfen

```bash
cd /opt/mcp-connection-key

# Container Status
echo "📊 Container Status:"
docker-compose ps

# Logs anzeigen (letzte 50 Zeilen)
echo ""
echo "📋 Logs (letzte 50 Zeilen):"
docker-compose logs --tail=50
```

## 🏥 Schritt 9: Health Checks

```bash
echo "🏥 Health Checks:"
echo ""

# Connection-Key Server
echo -n "Connection-Key (3000): "
if curl -f -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ OK"
    curl -s http://localhost:3000/health | head -3
else
    echo "❌ Nicht erreichbar"
fi

echo ""

# ChatGPT-Agent
echo -n "ChatGPT-Agent (4000): "
if curl -f -s http://localhost:4000/health > /dev/null 2>&1; then
    echo "✅ OK"
    curl -s http://localhost:4000/health | head -3
else
    echo "❌ Nicht erreichbar"
fi

echo ""

# n8n
echo -n "n8n (5678): "
if curl -f -s http://localhost:5678/healthz > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ Nicht erreichbar (kann beim ersten Start normal sein)"
fi
```

## 🎉 Schritt 10: Fertig!

Wenn alles funktioniert, sollten Sie folgende Services haben:

- **Connection-Key API:** `http://IHR-SERVER-IP:3000`
- **ChatGPT-Agent:** `http://IHR-SERVER-IP:4000`
- **n8n:** `http://IHR-SERVER-IP:5678`

### n8n Login

- **URL:** `http://IHR-SERVER-IP:5678`
- **Benutzername:** `admin`
- **Passwort:** Das Passwort aus Ihrer `.env` Datei (N8N_PASSWORD)

## 🔧 Nützliche Befehle

```bash
cd /opt/mcp-connection-key

# Logs anzeigen (Live)
docker-compose logs -f

# Einzelner Service
docker-compose logs -f connection-key
docker-compose logs -f chatgpt-agent
docker-compose logs -f n8n

# Services neu starten
docker-compose restart

# Services stoppen
docker-compose down

# Services starten
docker-compose up -d

# Status
docker-compose ps
```

## 🐛 Troubleshooting

### Services starten nicht

```bash
# Prüfe Logs
docker-compose logs

# Prüfe .env
cat .env | grep -v "KEY\|PASSWORD\|SECRET"

# Prüfe Docker
docker ps -a
docker images
```

### Port bereits belegt

```bash
# Prüfe welche Prozesse die Ports verwenden
netstat -tuln | grep -E "(3000|4000|5678|7777)"
# oder
ss -tuln | grep -E "(3000|4000|5678|7777)"
```

### .env Werte prüfen

```bash
# Zeige alle Variablen (ohne Werte)
grep -E "^[A-Z_]+=" .env | cut -d'=' -f1

# Prüfe ob wichtige Werte gesetzt sind
grep -E "^(OPENAI_API_KEY|N8N_PASSWORD|API_KEY)=" .env
```

## 📝 Zusammenfassung - Alles in einem

```bash
# Komplettes Setup in einem Durchlauf
cd /opt/mcp-connection-key

# 1. .env erstellen (mit automatisch generierten Passwörtern)
N8N_PASS=$(openssl rand -hex 16)
API_KEY=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)
read -p "OpenAI API Key: " OPENAI_KEY

cat > .env << EOF
OPENAI_API_KEY=$OPENAI_KEY
N8N_PASSWORD=$N8N_PASS
API_KEY=$API_KEY
N8N_BASE_URL=http://n8n:5678
MCP_SERVER_URL=http://mcp-server:7777
CHATGPT_AGENT_URL=http://chatgpt-agent:4000
CONNECTION_KEY_URL=http://connection-key:3000
PORT=3000
AUTH_ENABLED=true
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
CORS_ORIGINS=*
NODE_ENV=production
LOG_LEVEL=info
LOG_FORMAT=json
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
EOF

chmod 600 .env
echo "n8n Passwort: $N8N_PASS"
echo "API Key: $API_KEY"

# 2. Services starten
docker-compose down 2>/dev/null || true
docker-compose build
docker-compose up -d

# 3. Warten und prüfen
sleep 15
docker-compose ps
docker-compose logs --tail=30
```

