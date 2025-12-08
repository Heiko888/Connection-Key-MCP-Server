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

