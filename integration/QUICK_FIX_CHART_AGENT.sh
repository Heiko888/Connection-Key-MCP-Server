#!/bin/bash
# Quick Fix für Chart Agent
# Führen Sie auf CK-App Server aus: /opt/hd-app/The-Connection-Key/frontend

set -e

FRONTEND_DIR="/opt/hd-app/The-Connection-Key/frontend"
API_ROUTE="$FRONTEND_DIR/pages/api/agents/chart-development.ts"
COMPONENT="$FRONTEND_DIR/components/agents/ChartDevelopment.tsx"

echo "🔧 Quick Fix für Chart Agent"
echo "============================"
echo ""

# 1. Prüfe API-Route
echo "1. Prüfe API-Route..."
if [ ! -f "$API_ROUTE" ]; then
    echo "   ❌ API-Route fehlt: $API_ROUTE"
    echo "   📋 Erstelle API-Route..."
    
    mkdir -p "$(dirname "$API_ROUTE")"
    
    # Kopiere aus integration/ falls vorhanden
    if [ -f "integration/api-routes/agents-chart-development.ts" ]; then
        cp integration/api-routes/agents-chart-development.ts "$API_ROUTE"
        echo "   ✅ API-Route erstellt"
    else
        echo "   ⚠️  integration/api-routes/agents-chart-development.ts nicht gefunden"
        echo "   📋 Bitte manuell erstellen oder CREATE_FILES_ON_CK_APP.sh ausführen"
    fi
else
    echo "   ✅ API-Route vorhanden: $API_ROUTE"
fi
echo ""

# 2. Prüfe Frontend-Komponente
echo "2. Prüfe Frontend-Komponente..."
if [ ! -f "$COMPONENT" ]; then
    echo "   ❌ Frontend-Komponente fehlt: $COMPONENT"
    echo "   📋 Erstelle Frontend-Komponente..."
    
    mkdir -p "$(dirname "$COMPONENT")"
    
    # Kopiere aus integration/ falls vorhanden
    if [ -f "integration/frontend/components/ChartDevelopment.tsx" ]; then
        cp integration/frontend/components/ChartDevelopment.tsx "$COMPONENT"
        echo "   ✅ Frontend-Komponente erstellt"
    else
        echo "   ⚠️  integration/frontend/components/ChartDevelopment.tsx nicht gefunden"
        echo "   📋 Bitte manuell erstellen oder CREATE_FILES_ON_CK_APP.sh ausführen"
    fi
else
    echo "   ✅ Frontend-Komponente vorhanden: $COMPONENT"
fi
echo ""

# 3. Prüfe Environment Variables
echo "3. Prüfe Environment Variables..."
ENV_FILE="$FRONTEND_DIR/.env.local"
if [ -f "$ENV_FILE" ]; then
    if grep -q "MCP_SERVER_URL" "$ENV_FILE"; then
        echo "   ✅ MCP_SERVER_URL gesetzt"
    else
        echo "   ⚠️  MCP_SERVER_URL fehlt - füge hinzu..."
        echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> "$ENV_FILE"
        echo "   ✅ MCP_SERVER_URL hinzugefügt"
    fi
    
    if grep -q "READING_AGENT_URL" "$ENV_FILE"; then
        echo "   ✅ READING_AGENT_URL gesetzt"
    else
        echo "   ⚠️  READING_AGENT_URL fehlt - füge hinzu..."
        echo "READING_AGENT_URL=http://138.199.237.34:4001" >> "$ENV_FILE"
        echo "   ✅ READING_AGENT_URL hinzugefügt"
    fi
else
    echo "   ⚠️  .env.local nicht gefunden - erstelle..."
    touch "$ENV_FILE"
    echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> "$ENV_FILE"
    echo "READING_AGENT_URL=http://138.199.237.34:4001" >> "$ENV_FILE"
    echo "   ✅ .env.local erstellt"
fi
echo ""

# 4. Teste API-Route (falls Next.js läuft)
echo "4. Teste API-Route..."
if curl -s http://localhost:3000/api/agents/chart-development > /dev/null 2>&1; then
    echo "   ✅ API-Route erreichbar"
else
    echo "   ⚠️  API-Route nicht erreichbar (Next.js läuft möglicherweise nicht)"
    echo "   📋 Starten Sie Next.js: npm run dev"
fi
echo ""

# 5. Prüfe MCP Server (Hetzner)
echo "5. Prüfe MCP Server (Hetzner)..."
if curl -s http://138.199.237.34:7000/agents | grep -q "chart-development"; then
    echo "   ✅ Chart Agent im MCP Server konfiguriert"
else
    echo "   ❌ Chart Agent NICHT im MCP Server konfiguriert"
    echo "   📋 Führen Sie auf Hetzner Server aus: integration/install-chart-agent.sh"
fi
echo ""

echo "============================"
echo "✅ Quick Fix abgeschlossen!"
echo "============================"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Prüfen Sie ob alle Dateien vorhanden sind"
echo "2. Starten Sie Next.js neu (falls nötig)"
echo "3. Testen Sie: https://www.the-connection-key.de/agents/chart"
echo ""

