# 🔧 start.sh auf Server korrigieren

Führen Sie diese Befehle auf dem Server aus:

```bash
cd /opt/mcp-connection-key/production

# Korrigiere start.sh
cat > start.sh << 'EOF'
#!/bin/bash
# Startet den Reading Agent über PM2

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starte Reading Agent..."
echo ""

# Prüfe ob .env existiert
if [ ! -f ".env" ]; then
    echo "⚠️  .env Datei nicht gefunden!"
    echo "   Kopieren Sie env.example zu .env und füllen Sie die Werte aus"
    exit 1
fi

# Lade Umgebungsvariablen
export $(cat .env | grep -v '^#' | xargs)

# Prüfe erforderliche Variablen
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY nicht gesetzt!"
    exit 1
fi

# Prüfe ob PM2 installiert ist
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2 wird installiert..."
    npm install -g pm2
fi

# Erstelle Logs-Verzeichnis
mkdir -p logs
mkdir -p knowledge
mkdir -p templates

# Prüfe ob Agent bereits läuft
if pm2 list | grep -q "reading-agent"; then
    echo "🔄 Agent läuft bereits, starte neu..."
    pm2 restart reading-agent
else
    echo "🆕 Starte Agent neu..."
    pm2 start server.js \
        --name reading-agent \
        -o logs/reading-agent-out.log \
        -e logs/reading-agent-error.log \
        --merge-logs \
        --time
fi

# PM2 beim Boot starten
pm2 save
pm2 startup

echo ""
echo "✅ Reading Agent gestartet!"
echo ""
echo "📊 Status:"
pm2 status reading-agent
echo ""
echo "📋 Logs anzeigen:"
echo "   pm2 logs reading-agent"
echo ""
echo "🔄 Neustarten:"
echo "   pm2 restart reading-agent"
echo ""
EOF

chmod +x start.sh

# Jetzt starten
./start.sh
```

