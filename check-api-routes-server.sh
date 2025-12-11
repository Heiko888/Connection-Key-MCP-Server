#!/bin/bash

# Prüfe API-Routes Konfiguration auf CK-App Server
# Wird direkt auf dem Server ausgeführt

FRONTEND_PATH="/opt/hd-app/The-Connection-Key/frontend"
MCP_SERVER_URL="http://138.199.237.34:7000"
READING_AGENT_URL="http://138.199.237.34:4001"

echo "========================================"
echo "API-Routes Konfiguration prüfen"
echo "========================================"
echo ""

# Schritt 1: Environment Variables prüfen
echo "1. Environment Variables prüfen..."
echo ""

if [ -f "$FRONTEND_PATH/.env.local" ]; then
    echo "  ✅ .env.local existiert"
    echo ""
    
    MCP_VAR=$(grep -E "^MCP_SERVER_URL=" "$FRONTEND_PATH/.env.local" 2>/dev/null)
    READING_VAR=$(grep -E "^READING_AGENT_URL=" "$FRONTEND_PATH/.env.local" 2>/dev/null)
    
    if [ -n "$MCP_VAR" ]; then
        echo "  ✅ MCP_SERVER_URL gefunden:"
        echo "    $MCP_VAR"
    else
        echo "  ❌ MCP_SERVER_URL fehlt"
        echo "    Hinzufügen: MCP_SERVER_URL=$MCP_SERVER_URL"
    fi
    
    echo ""
    
    if [ -n "$READING_VAR" ]; then
        echo "  ✅ READING_AGENT_URL gefunden:"
        echo "    $READING_VAR"
    else
        echo "  ❌ READING_AGENT_URL fehlt"
        echo "    Hinzufügen: READING_AGENT_URL=$READING_AGENT_URL"
    fi
else
    echo "  ❌ .env.local nicht gefunden"
    echo "  Erstelle .env.local..."
    echo ""
    cat > "$FRONTEND_PATH/.env.local" << EOF
# MCP Server (für Agenten 1-4)
MCP_SERVER_URL=$MCP_SERVER_URL
NEXT_PUBLIC_MCP_SERVER_URL=$MCP_SERVER_URL

# Reading Agent (für Agent 5)
READING_AGENT_URL=$READING_AGENT_URL
NEXT_PUBLIC_READING_AGENT_URL=$READING_AGENT_URL
EOF
    echo "  ✅ .env.local erstellt"
fi

echo ""
echo ""

# Schritt 2: API-Routes prüfen
echo "2. API-Routes prüfen..."
echo ""

routes=(
    "app/api/agents/marketing/route.ts"
    "app/api/agents/automation/route.ts"
    "app/api/agents/sales/route.ts"
    "app/api/agents/social-youtube/route.ts"
    "app/api/reading/generate/route.ts"
)

all_ok=true

for route in "${routes[@]}"; do
    route_path="$FRONTEND_PATH/$route"
    route_name=$(basename "$route")
    
    if [ -f "$route_path" ]; then
        # Prüfe ob URL korrekt ist
        if grep -q "MCP_SERVER_URL\|READING_AGENT_URL\|138.199.237.34" "$route_path" 2>/dev/null; then
            echo "  ✅ $route_name: OK"
        else
            echo "  ⚠️  $route_name: URL-Konfiguration unklar"
            all_ok=false
        fi
    else
        echo "  ❌ $route_name: Datei nicht gefunden"
        all_ok=false
    fi
done

echo ""
echo ""

# Zusammenfassung
echo "========================================"
echo "Zusammenfassung"
echo "========================================"
echo ""

if [ "$all_ok" = true ]; then
    echo "✅ Alle API-Routes vorhanden und konfiguriert"
else
    echo "⚠️  Einige API-Routes fehlen oder sind unklar"
fi

echo ""
echo "Nächste Schritte:"
echo "  1. Falls .env.local geändert wurde:"
echo "     pm2 restart the-connection-key"
echo ""
echo "  2. API-Routes testen:"
echo "     curl -X POST https://www.the-connection-key.de/api/agents/marketing \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"message\": \"Test\"}'"
echo ""

