#!/bin/bash
# Fügt GET-Support für Agent-Info zum MCP Server hinzu
# Führt auf Hetzner Server aus: /opt/mcp

set -e

MCP_DIR="/opt/mcp"
SERVER_FILE="$MCP_DIR/server.js"

echo "🔧 Füge GET-Support für Agent-Info hinzu"
echo "========================================"
echo ""

# Backup erstellen
if [ -f "$SERVER_FILE" ]; then
    cp "$SERVER_FILE" "$SERVER_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Backup erstellt"
fi

# Prüfe ob GET-Handler bereits existiert
if grep -q "app.get('/agent/:agentId'" "$SERVER_FILE"; then
    echo "⚠️  GET-Handler für /agent/:agentId existiert bereits"
    exit 0
fi

# Finde die Stelle nach app.post('/agent/:agentId')
# Füge GET-Handler hinzu
echo "📝 Füge GET-Handler hinzu..."

# Erstelle temporäre Datei mit GET-Handler
cat > /tmp/mcp_get_handler.js << 'GET_HANDLER'
// GET-Request für Agent-Info (ohne Ausführung)
app.get('/agent/:agentId', (req, res) => {
  const { agentId } = req.params;
  const agentConfig = loadAgentConfig(agentId);
  
  if (!agentConfig) {
    return res.status(404).json({ 
      error: `Agent ${agentId} not found`,
      availableAgents: ['marketing', 'automation', 'sales', 'social-youtube', 'chart-development'],
      note: 'Use POST /agent/:agentId to execute the agent'
    });
  }
  
  res.json({
    agent: agentConfig.id,
    name: agentConfig.name,
    description: agentConfig.description,
    model: agentConfig.model || 'gpt-4',
    temperature: agentConfig.temperature || 0.7,
    maxTokens: agentConfig.maxTokens || 2000,
    note: 'Use POST /agent/:agentId to execute the agent',
    example: {
      method: 'POST',
      url: `/agent/${agentId}`,
      body: { message: 'Your message here' }
    }
  });
});
GET_HANDLER

# Füge GET-Handler nach POST-Handler ein
# Finde die Zeile mit "app.post('/agent/:agentId'" und füge GET-Handler danach ein
sed -i "/app.post('\/agent\/:agentId'/r /tmp/mcp_get_handler.js" "$SERVER_FILE"

# Cleanup
rm /tmp/mcp_get_handler.js

echo "✅ GET-Handler hinzugefügt"
echo ""

# MCP Server neu starten
echo "🔄 Starte MCP Server neu..."
systemctl restart mcp
sleep 3

# Status prüfen
if systemctl is-active --quiet mcp; then
    echo "✅ MCP Server läuft"
else
    echo "❌ MCP Server Fehler - prüfe Logs: journalctl -u mcp -n 50"
    echo "⚠️  Falls Fehler, wiederherstelle Backup:"
    echo "   cp $SERVER_FILE.backup.* $SERVER_FILE"
    exit 1
fi

echo ""
echo "✅ GET-Support hinzugefügt!"
echo ""
echo "🧪 Testen:"
echo "   curl http://138.199.237.34:7000/agent/marketing"
echo "   (Sollte jetzt Agent-Info zurückgeben statt Fehler)"
echo ""

