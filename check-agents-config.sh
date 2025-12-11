#!/bin/bash

# Prüft Agent-Konfiguration in Routen
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🔍 Agent-Konfiguration Prüfung"
echo "==============================="
echo ""

# Prüfe Agent-Routen
echo "1. Agent-Routen Konfiguration:"
echo "------------------------------"

AGENTS=("marketing" "automation" "sales" "social-youtube" "chart-development")

for agent in "${AGENTS[@]}"; do
    echo ""
    echo "   Agent: $agent"
    
    # Prüfe App Router Route
    if [ -f "frontend/app/api/agents/${agent}/route.ts" ]; then
        echo "   ✅ Route vorhanden: frontend/app/api/agents/${agent}/route.ts"
        
        # Prüfe AGENT_ID
        AGENT_ID=$(grep -E "const AGENT_ID|AGENT_ID =" "frontend/app/api/agents/${agent}/route.ts" | head -1 | sed 's/.*=.*\(["'\'']\)\(.*\)\1.*/\2/' | tr -d "'\"")
        if [ -n "$AGENT_ID" ]; then
            echo "      AGENT_ID: $AGENT_ID"
        else
            echo "      ⚠️  AGENT_ID nicht gefunden"
        fi
        
        # Prüfe MCP Server URL
        MCP_URL=$(grep -E "MCP_SERVER_URL|/agent/" "frontend/app/api/agents/${agent}/route.ts" | head -1)
        if [ -n "$MCP_URL" ]; then
            echo "      MCP URL: $MCP_URL"
        else
            echo "      ⚠️  MCP URL nicht gefunden"
        fi
    elif [ -f "integration/api-routes/app-router/agents/${agent}/route.ts" ]; then
        echo "   ⚠️  Route nur in integration/: integration/api-routes/app-router/agents/${agent}/route.ts"
        echo "      → Muss nach frontend/app/api/agents/${agent}/route.ts kopiert werden"
    else
        echo "   ❌ Route fehlt komplett"
    fi
done

echo ""

# Prüfe MCP Server Endpoints
echo "2. MCP Server Endpoints:"
echo "-----------------------"
echo "   MCP Server URL: http://138.199.237.34:7000"
echo ""
echo "   Verfügbare Agent-Endpoints:"
for agent in "${AGENTS[@]}"; do
    echo "   - POST http://138.199.237.34:7000/agent/${agent}"
done
echo ""

# Prüfe Frontend API Endpoints
echo "3. Frontend API Endpoints:"
echo "--------------------------"
echo "   Frontend URL: http://167.235.224.149:3000"
echo ""
echo "   Verfügbare API-Endpoints:"
for agent in "${AGENTS[@]}"; do
    if [ -f "frontend/app/api/agents/${agent}/route.ts" ]; then
        echo "   ✅ POST http://167.235.224.149:3000/api/agents/${agent}"
    else
        echo "   ❌ POST http://167.235.224.149:3000/api/agents/${agent} (Route fehlt)"
    fi
done
echo ""

# Prüfe Frontend-Seiten
echo "4. Frontend-Seiten:"
echo "------------------"
PAGES=("tasks" "marketing" "automation" "sales" "social-youtube" "chart")

for page in "${PAGES[@]}"; do
    if [ -f "frontend/app/coach/agents/${page}/page.tsx" ]; then
        echo "   ✅ /coach/agents/${page} (Seite vorhanden)"
        
        # Prüfe agentId in Seite
        AGENT_ID_IN_PAGE=$(grep -E "agentId=|agentId:" "frontend/app/coach/agents/${page}/page.tsx" | head -1)
        if [ -n "$AGENT_ID_IN_PAGE" ]; then
            echo "      $AGENT_ID_IN_PAGE"
        fi
    elif [ -f "integration/frontend/app/coach/agents/${page}/page.tsx" ]; then
        echo "   ⚠️  /coach/agents/${page} (nur in integration/)"
    else
        echo "   ❌ /coach/agents/${page} (Seite fehlt)"
    fi
done
echo ""

# Zusammenfassung
echo "5. Zusammenfassung:"
echo "------------------"
echo ""
echo "📋 Was muss gemacht werden:"
echo ""

# Prüfe was fehlt
MISSING=0

for agent in "${AGENTS[@]}"; do
    if [ ! -f "frontend/app/api/agents/${agent}/route.ts" ]; then
        echo "   ❌ Route kopieren: integration/api-routes/app-router/agents/${agent}/route.ts → frontend/app/api/agents/${agent}/route.ts"
        MISSING=$((MISSING + 1))
    fi
done

if [ ! -f "frontend/components/AgentChat.tsx" ]; then
    echo "   ❌ Komponente kopieren: integration/frontend/components/AgentChat.tsx → frontend/components/AgentChat.tsx"
    MISSING=$((MISSING + 1))
fi

if [ ! -f "frontend/components/AgentTasksDashboard.tsx" ]; then
    echo "   ❌ Komponente kopieren: integration/frontend/components/AgentTasksDashboard.tsx → frontend/components/AgentTasksDashboard.tsx"
    MISSING=$((MISSING + 1))
fi

for page in "${PAGES[@]}"; do
    if [ ! -f "frontend/app/coach/agents/${page}/page.tsx" ]; then
        echo "   ❌ Seite kopieren: integration/frontend/app/coach/agents/${page}/page.tsx → frontend/app/coach/agents/${page}/page.tsx"
        MISSING=$((MISSING + 1))
    fi
done

echo ""
if [ $MISSING -eq 0 ]; then
    echo "✅ Alle Dateien sind vorhanden!"
else
    echo "⚠️  Es fehlen $MISSING Dateien"
    echo ""
    echo "🚀 Nächster Schritt: Dateien kopieren und Container neu bauen"
fi
echo ""
