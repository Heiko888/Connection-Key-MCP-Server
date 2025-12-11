# 🔧 Production Reading Agent auf Server einrichten

## Schritt 1: Prüfe ob production/.env existiert

```bash
cd /opt/mcp-connection-key

# Prüfe ob production/.env existiert
if [ ! -f "production/.env" ]; then
    echo "📋 Erstelle production/.env..."
    cp production/env.example production/.env
    chmod 600 production/.env
fi
```

## Schritt 2: Setze OPENAI_API_KEY in production/.env

```bash
# Entferne alte Einträge und füge neuen hinzu
sed -i '/^OPENAI_API_KEY=/d' production/.env
echo "OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE" >> production/.env
```

## Schritt 3: Setze AGENT_SECRET (falls nicht vorhanden)

```bash
# Prüfe ob AGENT_SECRET gesetzt ist
if ! grep -q "^AGENT_SECRET=" production/.env || grep -q "^AGENT_SECRET=$" production/.env || grep -q "^AGENT_SECRET=your-agent-secret" production/.env; then
    echo "🔐 Generiere neuen AGENT_SECRET..."
    NEW_SECRET=$(openssl rand -hex 32)
    sed -i '/^AGENT_SECRET=/d' production/.env
    echo "AGENT_SECRET=$NEW_SECRET" >> production/.env
    echo "✅ AGENT_SECRET gesetzt: $NEW_SECRET"
fi
```

## Schritt 4: Prüfe andere wichtige Einstellungen

```bash
# Prüfe MCP_PORT
if ! grep -q "^MCP_PORT=" production/.env; then
    echo "MCP_PORT=4000" >> production/.env
fi

# Prüfe Pfade
if ! grep -q "^KNOWLEDGE_PATH=" production/.env; then
    echo "KNOWLEDGE_PATH=./production/knowledge" >> production/.env
fi

if ! grep -q "^TEMPLATE_PATH=" production/.env; then
    echo "TEMPLATE_PATH=./production/templates" >> production/.env
fi

if ! grep -q "^LOGS_PATH=" production/.env; then
    echo "LOGS_PATH=./production/logs" >> production/.env
fi
```

## Schritt 5: Installiere Dependencies (falls noch nicht geschehen)

```bash
cd production
npm install
cd ..
```

## Schritt 6: Prüfe Konfiguration

```bash
echo "📋 Aktuelle production/.env Konfiguration:"
grep -E "^(OPENAI_API_KEY|AGENT_SECRET|MCP_PORT|KNOWLEDGE_PATH|TEMPLATE_PATH|LOGS_PATH)=" production/.env
```

## Schritt 7: Starte Reading Agent

```bash
cd production
chmod +x start.sh
./start.sh
```

## Schritt 8: Prüfe Status

```bash
# PM2 Status
pm2 status reading-agent

# Logs anzeigen
pm2 logs reading-agent --lines 50

# Health Check
curl http://localhost:4000/health
```

## ✅ Fertig!

Der Reading Agent sollte jetzt laufen und über `https://agent.the-connection-key.de` erreichbar sein (falls Nginx konfiguriert ist).

