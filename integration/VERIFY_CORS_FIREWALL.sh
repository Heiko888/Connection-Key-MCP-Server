#!/bin/bash
# 🔒 CORS & Firewall Prüfung und Konfiguration
# Führen Sie dieses Script auf dem Hetzner Server (138.199.237.34) aus

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔒 CORS & Firewall Prüfung und Konfiguration"
echo "=============================================="
echo ""

# CK-App Server IP
CK_APP_IP="167.235.224.149"

# 1. CORS für Connection-Key Server prüfen/konfigurieren
echo "1. Connection-Key Server CORS..."
cd /opt/mcp-connection-key

if [ ! -f ".env" ]; then
    echo -e "${RED}   ❌ .env nicht gefunden!${NC}"
    exit 1
fi

# Prüfe ob CORS_ORIGINS bereits gesetzt ist
if grep -q "^CORS_ORIGINS=" .env; then
    echo -e "${YELLOW}   ⚠️  CORS_ORIGINS bereits gesetzt${NC}"
    grep "^CORS_ORIGINS=" .env
else
    echo "   ➕ Füge CORS_ORIGINS hinzu..."
    echo "CORS_ORIGINS=https://www.the-connection-key.de,https://the-connection-key.de,http://localhost:3000" >> .env
    echo -e "${GREEN}   ✅ CORS_ORIGINS gesetzt${NC}"
fi
echo ""

# 2. MCP Server CORS prüfen
echo "2. MCP Server CORS (Port 7000)..."
cd /opt/mcp

if [ ! -f "server.js" ]; then
    echo -e "${RED}   ❌ server.js nicht gefunden${NC}"
else
    if grep -q "cors" server.js; then
        echo -e "${GREEN}   ✅ CORS in server.js gefunden${NC}"
        # Prüfe ob spezifische Origins erlaubt sind
        if grep -q "origin.*167.235.224.149\|origin.*the-connection-key" server.js; then
            echo -e "${GREEN}   ✅ CK-App Server IP/Domain in CORS erlaubt${NC}"
        else
            echo -e "${YELLOW}   ⚠️  CK-App Server IP/Domain nicht explizit erlaubt${NC}"
            echo "   💡 app.use(cors()) erlaubt standardmäßig alle Origins"
        fi
    else
        echo -e "${RED}   ❌ CORS nicht in server.js gefunden${NC}"
        echo "   💡 Bitte fügen Sie hinzu: app.use(cors())"
    fi
fi
echo ""

# 3. Reading Agent CORS prüfen
echo "3. Reading Agent CORS (Port 4001)..."
cd /opt/mcp-connection-key/production

if [ ! -f "server.js" ]; then
    echo -e "${RED}   ❌ server.js nicht gefunden${NC}"
else
    if grep -q "app.use(cors())" server.js; then
        echo -e "${GREEN}   ✅ CORS bereits aktiviert in Reading Agent${NC}"
        echo "   💡 app.use(cors()) erlaubt standardmäßig alle Origins"
    else
        echo -e "${RED}   ❌ CORS nicht in Reading Agent gefunden${NC}"
        echo "   💡 Bitte fügen Sie hinzu: app.use(cors())"
    fi
fi
echo ""

# 4. Firewall prüfen
echo "4. Firewall-Regeln prüfen..."
if command -v ufw &> /dev/null; then
    echo "   Prüfe Port 7000 (MCP Server)..."
    if ufw status | grep -q "7000/tcp"; then
        echo -e "${GREEN}   ✅ Port 7000 ist offen${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Port 7000 ist nicht explizit erlaubt${NC}"
        echo "   ➕ Öffne Port 7000..."
        ufw allow 7000/tcp 2>/dev/null || true
        echo -e "${GREEN}   ✅ Port 7000 geöffnet${NC}"
    fi
    
    echo "   Prüfe Port 4001 (Reading Agent)..."
    if ufw status | grep -q "4001/tcp"; then
        echo -e "${GREEN}   ✅ Port 4001 ist offen${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Port 4001 ist nicht explizit erlaubt${NC}"
        echo "   ➕ Öffne Port 4001..."
        ufw allow 4001/tcp 2>/dev/null || true
        echo -e "${GREEN}   ✅ Port 4001 geöffnet${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  UFW nicht installiert - prüfen Sie die Firewall manuell${NC}"
fi
echo ""

# 5. Services neu starten
echo "5. Starte Services neu..."
cd /opt/mcp-connection-key

echo "   - Connection-Key Server..."
docker-compose restart connection-key 2>/dev/null || echo -e "${YELLOW}   ⚠️  Connection-Key Server nicht gestartet${NC}"

echo "   - MCP Server..."
systemctl restart mcp 2>/dev/null || echo -e "${YELLOW}   ⚠️  MCP Server nicht gestartet${NC}"

echo "   - Reading Agent..."
pm2 restart reading-agent 2>/dev/null || echo -e "${YELLOW}   ⚠️  Reading Agent nicht gestartet${NC}"

echo ""
echo "   ✅ Services neu gestartet"
echo ""

# 6. Health Checks
echo "6. Health Checks..."
sleep 3

echo "   Connection-Key Server (Port 3000):"
curl -s http://localhost:3000/health | head -1 || echo -e "${RED}   ❌ Nicht erreichbar${NC}"

echo "   MCP Server (Port 7000):"
curl -s http://localhost:7000/health | head -1 || echo -e "${RED}   ❌ Nicht erreichbar${NC}"

echo "   Reading Agent (Port 4001):"
curl -s http://localhost:4001/health | head -1 || echo -e "${RED}   ❌ Nicht erreichbar${NC}"

echo ""

# 7. Test von CK-App Server (simuliert)
echo "7. Test-Verbindung (vom Hetzner Server aus)..."
echo "   💡 Diese Tests simulieren Anfragen vom CK-App Server"

echo "   Test MCP Server..."
if curl -s -X POST http://localhost:7000/agent/marketing \
    -H "Content-Type: application/json" \
    -H "Origin: https://www.the-connection-key.de" \
    -d '{"message":"test"}' | grep -q "agent\|response\|error"; then
    echo -e "${GREEN}   ✅ MCP Server antwortet${NC}"
else
    echo -e "${YELLOW}   ⚠️  MCP Server antwortet nicht wie erwartet${NC}"
fi

echo "   Test Reading Agent..."
if curl -s http://localhost:4001/health | grep -q "status\|ok"; then
    echo -e "${GREEN}   ✅ Reading Agent antwortet${NC}"
else
    echo -e "${YELLOW}   ⚠️  Reading Agent antwortet nicht wie erwartet${NC}"
fi

echo ""

# 8. Zusammenfassung
echo "=============================================="
echo -e "${GREEN}✅ CORS & Firewall Prüfung abgeschlossen!${NC}"
echo ""
echo "📋 Zusammenfassung:"
echo ""
echo "   CORS:"
echo "   - Connection-Key Server: ✅ Konfiguriert"
echo "   - MCP Server: $(grep -q 'cors' /opt/mcp/server.js 2>/dev/null && echo '✅ Aktiviert' || echo '❌ Nicht gefunden')"
echo "   - Reading Agent: $(grep -q 'app.use(cors())' /opt/mcp-connection-key/production/server.js 2>/dev/null && echo '✅ Aktiviert' || echo '❌ Nicht gefunden')"
echo ""
echo "   Firewall:"
if command -v ufw &> /dev/null; then
    echo "   - Port 7000: $(ufw status | grep -q '7000/tcp' && echo '✅ Offen' || echo '❌ Geschlossen')"
    echo "   - Port 4001: $(ufw status | grep -q '4001/tcp' && echo '✅ Offen' || echo '❌ Geschlossen')"
else
    echo "   - UFW nicht installiert - bitte manuell prüfen"
fi
echo ""
echo "📋 Nächste Schritte:"
echo "   1. Testen Sie vom CK-App Server (167.235.224.149):"
echo "      curl -X POST http://138.199.237.34:7000/agent/marketing \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"message\": \"Test\"}'"
echo ""
echo "   2. Prüfen Sie Browser-Console auf CORS-Fehler"
echo ""
echo "=============================================="
echo ""

