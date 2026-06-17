#!/bin/bash

# ============================================
# Agent-Verbindung prüfen
# ============================================
# Prüft die Verbindung zwischen Frontend und Agenten
# ============================================

echo "========================================"
echo "Agent-Verbindung prüfen"
echo "========================================"
echo ""

# Server-Informationen
CK_APP_SERVER="167.235.224.149"
HETZNER_SERVER="138.199.237.34"
MCP_SERVER_PORT="7000"
READING_AGENT_PORT="4001"

echo "[*] Prüfe MCP Server (Hetzner)..."
echo ""

# MCP Server Health Check
echo "  Test 1: MCP Server Health Check"
MCP_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://${HETZNER_SERVER}:${MCP_SERVER_PORT}/health 2>&1)
if [ "$MCP_HEALTH" = "200" ]; then
    echo "  ✅ MCP Server erreichbar (HTTP $MCP_HEALTH)"
else
    echo "  ❌ MCP Server nicht erreichbar (HTTP $MCP_HEALTH)"
fi

# MCP Server Agents Liste
echo "  Test 2: MCP Server Agents Liste"
MCP_AGENTS=$(curl -s http://${HETZNER_SERVER}:${MCP_SERVER_PORT}/agents 2>&1)
if echo "$MCP_AGENTS" | grep -q "marketing"; then
    echo "  ✅ MCP Server Agents verfügbar"
    echo "  Agents: $MCP_AGENTS"
else
    echo "  ⚠️  MCP Server Agents-Liste: $MCP_AGENTS"
fi

echo ""

echo "[*] Prüfe Reading Agent (Hetzner)..."
echo ""

# Reading Agent Health Check
echo "  Test 3: Reading Agent Health Check"
READING_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://${HETZNER_SERVER}:${READING_AGENT_PORT}/health 2>&1)
if [ "$READING_HEALTH" = "200" ]; then
    echo "  ✅ Reading Agent erreichbar (HTTP $READING_HEALTH)"
else
    echo "  ❌ Reading Agent nicht erreichbar (HTTP $READING_HEALTH)"
fi

echo ""

echo "[*] Prüfe Frontend API-Routes (CK-App Server)..."
echo ""

# Prüfe ob API-Route existiert (auf Server)
echo "  Test 4: API-Route /api/readings/generate"
echo "  (Bitte auf CK-App Server prüfen:)"
echo "    ls -la /opt/hd-app/The-Connection-Key/frontend/pages/api/readings/generate.ts"
echo "    oder"
echo "    ls -la /opt/hd-app/The-Connection-Key/frontend/app/api/readings/generate/route.ts"
echo ""

# Prüfe Environment Variables
echo "[*] Prüfe Environment Variables..."
echo ""
echo "  Auf CK-App Server prüfen:"
echo "    grep -E '^(MCP_SERVER_URL|READING_AGENT_URL)=' /opt/hd-app/The-Connection-Key/.env"
echo "    oder"
echo "    grep -E '^(MCP_SERVER_URL|READING_AGENT_URL)=' /opt/hd-app/The-Connection-Key/frontend/.env.local"
echo ""

echo "[*] Prüfe Frontend-Seite..."
echo ""
echo "  Test 5: Frontend-Seite /coach/readings/create"
echo "  (Bitte auf CK-App Server prüfen:)"
echo "    ls -la /opt/hd-app/The-Connection-Key/frontend/pages/coach/readings/create.tsx"
echo "    oder"
echo "    ls -la /opt/hd-app/The-Connection-Key/frontend/app/coach/readings/create/page.tsx"
echo ""

echo "========================================"
echo "Zusammenfassung"
echo "========================================"
echo ""
echo "Zu prüfen:"
echo "1. ✅ MCP Server erreichbar? (http://${HETZNER_SERVER}:${MCP_SERVER_PORT})"
echo "2. ✅ Reading Agent erreichbar? (http://${HETZNER_SERVER}:${READING_AGENT_PORT})"
echo "3. ⚠️  API-Route existiert? (/api/readings/generate)"
echo "4. ⚠️  Frontend-Seite existiert? (/coach/readings/create)"
echo "5. ⚠️  Environment Variables gesetzt? (MCP_SERVER_URL, READING_AGENT_URL)"
echo ""


