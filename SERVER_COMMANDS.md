# 🚀 Befehle für den Server

Führen Sie diese Befehle **direkt auf dem Server** aus:

## Schritt 1: Erstelle production/.env (falls nicht vorhanden)

```bash
cd /opt/mcp-connection-key

if [ ! -f "production/.env" ]; then
    cp production/env.example production/.env
    chmod 600 production/.env
    echo "✅ production/.env erstellt"
fi
```

## Schritt 2: Setze OPENAI_API_KEY

```bash
# Entferne alte Einträge und füge neuen hinzu
sed -i '/^OPENAI_API_KEY=/d' production/.env
echo "OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE" >> production/.env
echo "✅ OPENAI_API_KEY gesetzt"
```

## Schritt 3: Setze AGENT_SECRET (optional, aber empfohlen)

```bash
# Generiere neuen Secret
NEW_SECRET=$(openssl rand -hex 32)
sed -i '/^AGENT_SECRET=/d' production/.env
echo "AGENT_SECRET=$NEW_SECRET" >> production/.env
echo "✅ AGENT_SECRET gesetzt: $NEW_SECRET"
```

## Schritt 4: Prüfe andere Einstellungen

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

## Schritt 5: Installiere Dependencies

```bash
cd production
npm install
cd ..
```

## Schritt 6: Starte Reading Agent

```bash
cd production
chmod +x start.sh
./start.sh
```

## Schritt 7: Prüfe Status

```bash
# PM2 Status
pm2 status reading-agent

# Logs anzeigen
pm2 logs reading-agent --lines 50

# Health Check
curl http://localhost:4000/health
```

## ✅ Fertig!

Der Reading Agent sollte jetzt laufen.

