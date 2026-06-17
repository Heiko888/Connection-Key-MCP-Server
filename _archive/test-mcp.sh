#!/bin/bash
# Testet MCP Server und alle Agenten

SERVER_IP="138.199.237.34"

echo "🧪 MCP Server Test"
echo "=================="
echo ""

# 1. Health Check
echo "1. Health Check..."
HEALTH=$(curl -s http://$SERVER_IP:7000/health)
echo "   $HEALTH"
if echo "$HEALTH" | grep -q "ok"; then
    echo "   ✅ Server läuft"
else
    echo "   ❌ Server antwortet nicht"
    exit 1
fi
echo ""

# 2. Agenten auflisten
echo "2. Verfügbare Agenten..."
AGENTS=$(curl -s http://$SERVER_IP:7000/agents)
echo "   $AGENTS"
echo ""

# 3. Test-Request an Marketing-Agent
echo "3. Test Marketing-Agent..."
RESPONSE=$(curl -s -X POST http://$SERVER_IP:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message":"Gib mir 3 Hooks für ein Reel über Manifestation"}')
echo "   Antwort:"
echo "$RESPONSE" | head -5
echo ""

# 4. Test-Request an Automation-Agent
echo "4. Test Automation-Agent..."
RESPONSE=$(curl -s -X POST http://$SERVER_IP:7000/agent/automation \
  -H "Content-Type: application/json" \
  -d '{"message":"Erkläre mir einen n8n Workflow"}')
echo "   Antwort:"
echo "$RESPONSE" | head -5
echo ""

# 5. Systemdienst Status
echo "5. Systemdienst Status..."
if systemctl is-active --quiet mcp; then
    echo "   ✅ MCP Service läuft"
else
    echo "   ❌ MCP Service läuft nicht"
fi
echo ""

echo "=================="
echo "✅ Tests abgeschlossen!"
echo ""
echo "🌐 MCP Server:"
echo "   - Health: http://$SERVER_IP:7000/health"
echo "   - Agents: http://$SERVER_IP:7000/agents"
echo "   - API: POST http://$SERVER_IP:7000/agent/{agentId}"
echo ""

