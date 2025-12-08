#!/bin/bash
# 🚀 Deployment-Script für CK-App Server
# Führen Sie dieses Script auf dem CK-App Server aus

set -e

echo "🚀 Deployment der Agenten-Integration auf CK-App Server"
echo "========================================================"
echo ""

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Prüfe ob wir im Next.js Projekt-Verzeichnis sind
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Fehler: package.json nicht gefunden!${NC}"
    echo "   Bitte führen Sie dieses Script im Next.js Projekt-Verzeichnis aus"
    echo ""
    echo "   Tipp: Finden Sie das Projekt mit:"
    echo "   find / -name 'package.json' -type f 2>/dev/null | xargs grep -l '\"next\"' 2>/dev/null"
    exit 1
fi

echo -e "${GREEN}✅ Next.js Projekt gefunden${NC}"
echo ""

# 2. Prüfe ob Git-Repository
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Kein Git-Repository gefunden${NC}"
    echo "   Bitte führen Sie 'git pull' manuell durch oder kopieren Sie die Dateien per SCP"
    exit 1
fi

echo -e "${GREEN}✅ Git-Repository gefunden${NC}"
echo ""

# 3. Git Pull
echo "📥 Führe Git Pull durch..."
if git pull origin main; then
    echo -e "${GREEN}✅ Git Pull erfolgreich${NC}"
else
    echo -e "${RED}❌ Git Pull fehlgeschlagen${NC}"
    echo "   Bitte prüfen Sie die Git-Konfiguration"
    exit 1
fi
echo ""

# 4. Prüfe ob integration/ vorhanden
if [ ! -d "integration" ]; then
    echo -e "${RED}❌ integration/ Verzeichnis nicht gefunden${NC}"
    echo "   Bitte stellen Sie sicher, dass der Git Pull erfolgreich war"
    exit 1
fi

echo -e "${GREEN}✅ integration/ Verzeichnis vorhanden${NC}"
echo ""

# 5. Environment Variables setzen
echo "🔧 Setze Environment Variables..."
ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
    echo "   📝 Erstelle $ENV_FILE..."
    touch "$ENV_FILE"
fi

# Prüfe und setze MCP_SERVER_URL
if ! grep -q "MCP_SERVER_URL" "$ENV_FILE"; then
    echo "   ➕ Füge MCP_SERVER_URL hinzu..."
    echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> "$ENV_FILE"
    echo -e "${GREEN}   ✅ MCP_SERVER_URL gesetzt${NC}"
else
    echo -e "${YELLOW}   ⚠️  MCP_SERVER_URL bereits vorhanden${NC}"
fi

# Prüfe und setze READING_AGENT_URL
if ! grep -q "READING_AGENT_URL" "$ENV_FILE"; then
    echo "   ➕ Füge READING_AGENT_URL hinzu..."
    echo "READING_AGENT_URL=http://138.199.237.34:4001" >> "$ENV_FILE"
    echo -e "${GREEN}   ✅ READING_AGENT_URL gesetzt${NC}"
else
    echo -e "${YELLOW}   ⚠️  READING_AGENT_URL bereits vorhanden${NC}"
fi

echo ""

# 6. Installations-Script ausführen
if [ -f "integration/install-ck-app-server.sh" ]; then
    echo "🔧 Führe Installations-Script aus..."
    chmod +x integration/install-ck-app-server.sh
    if ./integration/install-ck-app-server.sh; then
        echo -e "${GREEN}✅ Installation erfolgreich${NC}"
    else
        echo -e "${RED}❌ Installation fehlgeschlagen${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ integration/install-ck-app-server.sh nicht gefunden${NC}"
    exit 1
fi

echo ""

# 7. Zusammenfassung
echo "========================================================"
echo -e "${GREEN}✅ Deployment abgeschlossen!${NC}"
echo ""
echo "📋 Nächste Schritte:"
echo ""
echo "1. CSS importieren (in _app.tsx oder layout.tsx):"
echo "   import '../styles/agents.css'"
echo ""
echo "2. Next.js App neu starten:"
echo "   npm run dev"
echo "   # Oder"
echo "   npm run build && npm start"
echo ""
echo "3. Testen Sie die API-Routes:"
echo "   curl -X POST http://localhost:3000/api/agents/marketing \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\": \"Test\", \"userId\": \"test\"}'"
echo ""
echo "4. Im Browser öffnen:"
echo "   http://localhost:3000/agents-dashboard"
echo ""
echo "5. Server-zu-Server Verbindung testen:"
echo "   curl -X POST http://138.199.237.34:7000/agent/marketing \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\": \"Test\"}'"
echo ""
echo "========================================================"
echo ""

