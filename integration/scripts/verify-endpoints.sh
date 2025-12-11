#!/bin/bash
# Endpoint-Verification Script
# Prüft alle Endpoints serverübergreifend

set -e

MCP_SERVER="http://138.199.237.34:7000"
FRONTEND_DIR="/opt/hd-app/The-Connection-Key/frontend"

echo "🔍 Endpoint-Verification - Serverübergreifend"
echo "=============================================="
echo ""

# 1. MCP Server prüfen
echo "1. MCP Server (Hetzner: 138.199.237.34:7000)"
echo "--------------------------------------------"

# Health Check
echo "   📡 Health Check:"
if curl -s --max-time 5 "$MCP_SERVER/health" > /dev/null 2>&1; then
    HEALTH=$(curl -s "$MCP_SERVER/health" | jq -r '.status // "ok"' 2>/dev/null || echo "ok")
    echo "      ✅ Online - Status: $HEALTH"
else
    echo "      ❌ Offline"
    echo "      ⚠️  MCP Server nicht erreichbar!"
fi
echo ""

# Agent-Liste (mit 's')
echo "   📋 Agent-Liste (GET /agents - mit 's'):"
AGENTS_RESPONSE=$(curl -s --max-time 5 "$MCP_SERVER/agents" 2>&1)
if [ $? -eq 0 ] && [ ! -z "$AGENTS_RESPONSE" ]; then
    # Versuche mit jq
    AGENTS=$(echo "$AGENTS_RESPONSE" | jq -r '.agents[].id' 2>/dev/null | tr '\n' ', ' | sed 's/,$//')
    if [ ! -z "$AGENTS" ] && [ "$AGENTS" != "null" ]; then
        echo "      ✅ Verfügbar - Agenten: $AGENTS"
    else
        # Fallback: Grep nach Agent-IDs
        AGENTS=$(echo "$AGENTS_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | tr '\n' ', ' | sed 's/,$//')
        if [ ! -z "$AGENTS" ]; then
            echo "      ✅ Verfügbar - Agenten: $AGENTS"
        else
            echo "      ⚠️  Keine Agenten gefunden"
            echo "      Response: $(echo "$AGENTS_RESPONSE" | head -c 200)"
        fi
    fi
else
    echo "      ❌ Nicht erreichbar"
fi
echo ""

# Agent-Aufruf (ohne 's')
echo "   🤖 Agent-Aufruf (POST /agent/marketing - ohne 's'):"
RESPONSE=$(curl -s --max-time 10 -X POST "$MCP_SERVER/agent/marketing" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}' 2>&1)

# Prüfe ob Response JSON ist und agent-Feld enthält
if echo "$RESPONSE" | grep -q '"agent"' 2>/dev/null; then
    AGENT_ID=$(echo "$RESPONSE" | grep -o '"agent":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "marketing")
    echo "      ✅ Funktioniert - Agent: $AGENT_ID"
    echo "      📝 Response-Länge: ${#RESPONSE} Zeichen"
elif echo "$RESPONSE" | grep -q "error\|Error\|ERROR" 2>/dev/null; then
    echo "      ❌ Fehler in Response"
    echo "      Response: $(echo "$RESPONSE" | head -c 200)"
else
    echo "      ⚠️  Unerwartete Response"
    echo "      Response: $(echo "$RESPONSE" | head -c 200)"
fi
echo ""

# 2. Next.js API-Routes prüfen (falls auf diesem Server)
echo "2. Next.js API-Routes (CK-App Server)"
echo "--------------------------------------"

if [ -d "$FRONTEND_DIR/pages/api/agents" ]; then
    echo "   📁 Verzeichnis gefunden: $FRONTEND_DIR/pages/api/agents"
    echo ""
    
    for file in "$FRONTEND_DIR/pages/api/agents"/*.ts; do
        if [ -f "$file" ]; then
            FILENAME=$(basename "$file")
            echo "   📄 $FILENAME:"
            
            # Prüfe ob Route korrekt ist
            if grep -q "/agent/\${AGENT_ID}" "$file" || grep -q "/agent/\`" "$file" || grep -q "/agent/\"" "$file"; then
                echo "      ✅ Endpoint korrekt: /agent/... (ohne 's')"
            elif grep -q "/agents/\${AGENT_ID}" "$file" || grep -q "/agents/\`" "$file" || grep -q "/agents/\"" "$file"; then
                echo "      ❌ FALSCH: /agents/... (mit 's') - muss /agent/... sein!"
            else
                echo "      ⚠️  Endpoint nicht gefunden in Datei"
            fi
            
            # Prüfe MCP_SERVER_URL
            if grep -q "MCP_SERVER_URL" "$file"; then
                MCP_URL=$(grep "MCP_SERVER_URL" "$file" | head -1 | sed 's/.*=//' | tr -d ' ;' | sed "s/'//g" | sed 's/"//g')
                echo "      📡 MCP Server URL: $MCP_URL"
            fi
            echo ""
        fi
    done
else
    echo "   ⚠️  Verzeichnis nicht gefunden: $FRONTEND_DIR/pages/api/agents"
    echo "      API-Routes sind möglicherweise nicht installiert"
    echo ""
fi

# 3. Frontend-Komponente prüfen (falls vorhanden)
echo "3. Frontend-Komponente"
echo "----------------------"

if [ -f "$FRONTEND_DIR/components/agents/AgentChat.tsx" ] || [ -f "$FRONTEND_DIR/components/AgentChat.tsx" ]; then
    COMPONENT_FILE=$(find "$FRONTEND_DIR/components" -name "AgentChat.tsx" 2>/dev/null | head -1)
    if [ ! -z "$COMPONENT_FILE" ]; then
        echo "   📄 AgentChat.tsx gefunden: $COMPONENT_FILE"
        
        if grep -q "/api/agents/\${agentId}" "$COMPONENT_FILE" || grep -q "/api/agents/\`" "$COMPONENT_FILE"; then
            echo "      ✅ Endpoint korrekt: /api/agents/... (mit 's')"
        else
            echo "      ⚠️  Endpoint nicht gefunden oder anders formatiert"
        fi
    fi
else
    echo "   ⚠️  AgentChat.tsx nicht gefunden"
fi
echo ""

# 4. Zusammenfassung
echo "=============================================="
echo "📊 Zusammenfassung"
echo "=============================================="
echo ""
echo "✅ Korrekte Endpoint-Struktur:"
echo "   Frontend → Next.js: /api/agents/... (mit 's')"
echo "   Next.js → MCP:      /agent/... (ohne 's')"
echo "   MCP Server:         POST /agent/:agentId (ohne 's')"
echo ""
echo "❌ Häufige Fehler:"
echo "   - Next.js API ruft /agents/... auf (mit 's') → muss /agent/... sein"
echo "   - MCP Server hat /agents/:agentId → muss /agent/:agentId sein"
echo ""

