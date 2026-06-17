#!/bin/bash

# Prüft MCP Server Status und alle Agenten
# Führt auf Hetzner Server aus (138.199.237.34)

set -e

MCP_SERVER_URL="http://138.199.237.34:7000"

echo "🔍 MCP Server Status-Prüfung"
echo "============================"
echo ""

# 1. Health Check
echo "1. Health Check:"
echo "----------------"
curl -s "$MCP_SERVER_URL/health" | jq . || echo "❌ Server nicht erreichbar"
echo ""

# 2. Liste aller Agenten
echo "2. Verfügbare Agenten:"
echo "---------------------"
curl -s "$MCP_SERVER_URL/agents" | jq '.agents[] | {id: .id, name: .name}' || echo "❌ Konnte Agenten nicht abrufen"
echo ""

# 3. Test Agent
echo "3. Test Agent (Marketing):"
echo "-------------------------"
curl -s -X POST "$MCP_SERVER_URL/agent/marketing" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}' | jq '.success, .agentId' || echo "❌ Agent antwortet nicht"
echo ""

# 4. Systemd Status
echo "4. Systemd Service Status:"
echo "-------------------------"
if ssh root@138.199.237.34 "systemctl is-active --quiet mcp-server" 2>/dev/null; then
    echo "   ✅ MCP Server läuft (systemd)"
else
    echo "   ❌ MCP Server läuft nicht"
fi
echo ""

# 5. Agent-Konfigurationen prüfen
echo "5. Agent-Konfigurationen:"
echo "------------------------"
ssh root@138.199.237.34 "ls -la /opt/ck-agent/agents/*.json 2>/dev/null | wc -l" | xargs echo "   Anzahl Agent-Konfigurationen:"
echo ""

echo "✅ Prüfung abgeschlossen!"
