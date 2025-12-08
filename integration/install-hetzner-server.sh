#!/bin/bash
# Installation auf Hetzner Server (138.199.237.34)
# Führen Sie dieses Script auf dem Hetzner Server aus

set -e

echo "🔒 CORS-Konfiguration auf Hetzner Server"
echo "========================================="
echo ""

# 1. Connection-Key Server CORS
echo "1. Connection-Key Server CORS..."
cd /opt/mcp-connection-key

# Prüfe ob .env existiert
if [ ! -f ".env" ]; then
    echo "   ❌ .env nicht gefunden!"
    exit 1
fi

# Entferne alte CORS_ORIGINS Einträge
sed -i '/^CORS_ORIGINS=/d' .env

# Füge neue CORS Origins hinzu
echo "CORS_ORIGINS=https://www.the-connection-key.de,https://the-connection-key.de,http://localhost:3000" >> .env

echo "   ✅ CORS_ORIGINS in .env gesetzt"
echo ""

# 2. MCP Server CORS prüfen
echo "2. MCP Server CORS..."
cd /opt/mcp

if [ ! -f "server.js" ]; then
    echo "   ⚠️  server.js nicht gefunden"
else
    if grep -q "cors" server.js; then
        echo "   ✅ CORS bereits in server.js aktiviert"
    else
        echo "   ⚠️  CORS nicht in server.js gefunden"
        echo "   Bitte manuell prüfen und hinzufügen"
    fi
fi
echo ""

# 3. Reading Agent CORS prüfen
echo "3. Reading Agent CORS..."
cd /opt/mcp-connection-key/production

if [ ! -f "server.js" ]; then
    echo "   ⚠️  server.js nicht gefunden"
else
    if grep -q "app.use(cors())" server.js; then
        echo "   ✅ CORS bereits aktiviert in Reading Agent"
    else
        echo "   ⚠️  CORS nicht gefunden in Reading Agent"
        echo "   Bitte manuell prüfen"
    fi
fi
echo ""

# 4. Firewall prüfen
echo "4. Firewall prüfen..."
if command -v ufw &> /dev/null; then
    if ufw status | grep -q "4001/tcp"; then
        echo "   ✅ Port 4001 bereits offen"
    else
        echo "   🔓 Öffne Port 4001..."
        ufw allow 4001/tcp
        echo "   ✅ Port 4001 geöffnet"
    fi
    
    if ufw status | grep -q "7000/tcp"; then
        echo "   ✅ Port 7000 bereits offen"
    else
        echo "   🔓 Öffne Port 7000..."
        ufw allow 7000/tcp
        echo "   ✅ Port 7000 geöffnet"
    fi
else
    echo "   ⚠️  UFW nicht installiert, prüfen Sie die Firewall manuell"
fi
echo ""

# 5. Services neu starten
echo "5. Starte Services neu..."
cd /opt/mcp-connection-key

echo "   - Connection-Key Server..."
if docker-compose ps | grep -q "connection-key"; then
    docker-compose restart connection-key
    echo "   ✅ Connection-Key Server neu gestartet"
else
    echo "   ⚠️  Connection-Key Server läuft nicht"
fi

echo "   - MCP Server..."
if systemctl is-active --quiet mcp; then
    systemctl restart mcp
    echo "   ✅ MCP Server neu gestartet"
else
    echo "   ⚠️  MCP Server läuft nicht"
fi

echo "   - Reading Agent..."
if pm2 list | grep -q "reading-agent"; then
    pm2 restart reading-agent
    echo "   ✅ Reading Agent neu gestartet"
else
    echo "   ⚠️  Reading Agent läuft nicht"
fi

echo ""

# 6. Health Checks
echo "6. Prüfe Health Checks..."
echo ""

sleep 2

# Connection-Key Server
echo "   - Connection-Key Server (Port 3000):"
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "      ✅ Erreichbar"
else
    echo "      ❌ Nicht erreichbar"
fi

# MCP Server
echo "   - MCP Server (Port 7000):"
if curl -s http://localhost:7000/health > /dev/null 2>&1; then
    echo "      ✅ Erreichbar"
else
    echo "      ❌ Nicht erreichbar"
fi

# Reading Agent
echo "   - Reading Agent (Port 4001):"
if curl -s http://localhost:4001/health > /dev/null 2>&1; then
    echo "      ✅ Erreichbar"
else
    echo "      ❌ Nicht erreichbar"
fi

echo ""

# 7. Zusammenfassung
echo "========================================="
echo "✅ CORS-Konfiguration abgeschlossen!"
echo ""
echo "📋 Zusammenfassung:"
echo ""
echo "✅ CORS_ORIGINS in .env gesetzt"
echo "✅ Firewall-Regeln geprüft"
echo "✅ Services neu gestartet"
echo ""
echo "🧪 Testen Sie jetzt vom CK-App Server:"
echo ""
echo "curl -X POST http://138.199.237.34:7000/agent/marketing \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"message\": \"Test\"}'"
echo ""
echo "curl -X POST http://138.199.237.34:4001/reading/generate \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"birthDate\": \"1990-05-15\", \"birthTime\": \"14:30\", \"birthPlace\": \"Berlin\"}'"
echo ""
echo "========================================="
echo ""

