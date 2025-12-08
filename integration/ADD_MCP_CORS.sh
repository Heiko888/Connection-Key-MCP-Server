#!/bin/bash
# 🔧 CORS zum MCP Server hinzufügen
# Führen Sie dieses Script auf dem Hetzner Server aus

set -e

MCP_DIR="/opt/mcp"
SERVER_FILE="$MCP_DIR/server.js"

echo "🔧 Füge CORS zum MCP Server hinzu..."
echo "======================================"
echo ""

# Prüfe ob server.js existiert
if [ ! -f "$SERVER_FILE" ]; then
    echo "❌ $SERVER_FILE nicht gefunden!"
    exit 1
fi

echo "✅ server.js gefunden"
echo ""

# Prüfe ob cors bereits installiert ist
cd "$MCP_DIR"
if ! grep -q '"cors"' package.json 2>/dev/null; then
    echo "📦 Installiere cors..."
    npm install cors
    echo "✅ cors installiert"
else
    echo "✅ cors bereits installiert"
fi
echo ""

# Prüfe ob CORS bereits in server.js ist
if grep -q "app.use(cors" "$SERVER_FILE"; then
    echo "✅ CORS bereits in server.js vorhanden"
    echo ""
    echo "Aktuelle CORS-Konfiguration:"
    grep -A 10 "app.use(cors" "$SERVER_FILE" | head -15
    exit 0
fi

echo "➕ Füge CORS zu server.js hinzu..."
echo ""

# Erstelle Backup
cp "$SERVER_FILE" "${SERVER_FILE}.backup"
echo "✅ Backup erstellt: ${SERVER_FILE}.backup"

# Füge cors require nach express hinzu
if ! grep -q "require('cors')" "$SERVER_FILE"; then
    # Finde die Zeile mit express und füge cors danach hinzu
    sed -i "/const express = require('express');/a\\
const cors = require('cors');" "$SERVER_FILE"
    echo "✅ cors require hinzugefügt"
fi

# Füge CORS-Middleware nach app.use(express.json()) hinzu
if ! grep -q "app.use(cors" "$SERVER_FILE"; then
    # Finde app.use(express.json()) und füge CORS danach hinzu
    sed -i "/app.use(express.json());/a\\
\\
// CORS konfigurieren\\
app.use(cors({\\
  origin: [\\
    'https://www.the-connection-key.de',\\
    'https://the-connection-key.de',\\
    'http://localhost:3000',\\
    'http://167.235.224.149:3000'\\
  ],\\
  credentials: true\\
}));" "$SERVER_FILE"
    echo "✅ CORS-Middleware hinzugefügt"
fi

echo ""
echo "📝 Aktualisierte server.js:"
echo ""
grep -A 12 "app.use(cors" "$SERVER_FILE" | head -15
echo ""

# MCP Server neu starten
echo "🔄 Starte MCP Server neu..."
systemctl restart mcp
sleep 3

# Prüfe Status
if systemctl is-active --quiet mcp; then
    echo "✅ MCP Server läuft"
else
    echo "❌ MCP Server läuft nicht - prüfe: systemctl status mcp"
    echo "💡 Falls Fehler, wiederherstellen: cp ${SERVER_FILE}.backup $SERVER_FILE"
    exit 1
fi

echo ""
echo "🧪 Teste MCP Server..."
sleep 2

if curl -s http://localhost:7000/health | grep -q "ok"; then
    echo "✅ MCP Server antwortet"
else
    echo "❌ MCP Server antwortet nicht"
fi

echo ""
echo "======================================"
echo "✅ CORS zum MCP Server hinzugefügt!"
echo ""
echo "📋 Nächste Schritte:"
echo "   1. Testen Sie vom CK-App Server:"
echo "      curl -X POST http://138.199.237.34:7000/agent/marketing \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -H 'Origin: https://www.the-connection-key.de' \\"
echo "        -d '{\"message\": \"Test\"}'"
echo ""
echo "   2. Prüfen Sie Browser-Console auf CORS-Fehler"
echo ""
echo "======================================"
echo ""

