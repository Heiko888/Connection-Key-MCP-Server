#!/bin/bash
# 🚀 Quick Deployment für CK-App Server
# Spezifisch für: /opt/hd-app/The-Connection-Key/frontend

set -e

PROJECT_DIR="/opt/hd-app/The-Connection-Key/frontend"

echo "🚀 Quick Deployment für CK-App Server"
echo "======================================"
echo ""
echo "Projekt-Pfad: $PROJECT_DIR"
echo ""

# Prüfe ob Verzeichnis existiert
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Projekt-Verzeichnis nicht gefunden: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

# 1. Git Pull
echo "1. Git Pull..."
if [ -d ".git" ]; then
    git pull origin main || echo "⚠️  Git Pull fehlgeschlagen - fahre fort..."
else
    echo "⚠️  Kein Git-Repository gefunden"
fi
echo ""

# 2. Prüfe ob integration/ vorhanden
if [ ! -d "integration" ]; then
    echo "❌ integration/ Verzeichnis nicht gefunden!"
    echo "   Bitte führen Sie 'git pull origin main' aus"
    exit 1
fi

echo "✅ integration/ Verzeichnis gefunden"
echo ""

# 3. Environment Variables
echo "2. Environment Variables..."
ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
    touch "$ENV_FILE"
fi

if ! grep -q "MCP_SERVER_URL" "$ENV_FILE"; then
    echo "   ➕ Füge MCP_SERVER_URL hinzu..."
    echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> "$ENV_FILE"
fi

if ! grep -q "READING_AGENT_URL" "$ENV_FILE"; then
    echo "   ➕ Füge READING_AGENT_URL hinzu..."
    echo "READING_AGENT_URL=http://138.199.237.34:4001" >> "$ENV_FILE"
fi

echo "   ✅ Environment Variables gesetzt"
echo ""

# 4. Installation ausführen
echo "3. Installation ausführen..."
if [ -f "integration/install-ck-app-server.sh" ]; then
    chmod +x integration/install-ck-app-server.sh
    ./integration/install-ck-app-server.sh
else
    echo "   ⚠️  Installations-Script nicht gefunden"
    echo "   Bitte führen Sie die manuelle Installation durch"
fi
echo ""

# 5. Zusammenfassung
echo "======================================"
echo "✅ Deployment abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo ""
echo "1. CSS importieren (in _app.tsx oder layout.tsx):"
echo "   import '../styles/agents.css'"
echo ""
echo "2. App neu starten:"
echo "   npm run dev"
echo "   # Oder"
echo "   pm2 restart the-connection-key"
echo ""
echo "3. Testen:"
echo "   curl -X POST http://localhost:3000/api/agents/marketing \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\": \"Test\"}'"
echo ""
echo "4. Im Browser öffnen:"
echo "   http://localhost:3000/agents-dashboard"
echo ""
echo "======================================"
echo ""

