#!/bin/bash

# Deployment-Script für Relationship Analysis Agent
# Deployt Agent + Frontend + API-Route komplett

set -e

# Farben
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🚀 Relationship Analysis Agent - Komplettes Deployment${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verzeichnisse
FRONTEND_DIR="/opt/hd-app/The-Connection-Key/frontend"
INTEGRATION_DIR="/opt/hd-app/The-Connection-Key/integration"
AGENTS_DIR="/opt/ck-agent/agents"
PROMPTS_DIR="/opt/ck-agent/prompts"
SCRIPT_DIR="/opt/hd-app/The-Connection-Key"

# Prüfe Verzeichnisse
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Frontend-Verzeichnis nicht gefunden: $FRONTEND_DIR${NC}"
    exit 1
fi

if [ ! -d "$INTEGRATION_DIR" ]; then
    echo -e "${YELLOW}⚠️  Integration-Verzeichnis nicht gefunden: $INTEGRATION_DIR${NC}"
    echo "   Stelle sicher, dass die Dateien vorhanden sind"
fi

echo -e "${BLUE}📍 Verzeichnisse:${NC}"
echo "   Frontend: $FRONTEND_DIR"
echo "   Integration: $INTEGRATION_DIR"
echo ""

# ============================================
# SCHRITT 1: Agent erstellen
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📋 Schritt 1: Relationship Analysis Agent erstellen${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Prüfe ob Script vorhanden
if [ -f "$SCRIPT_DIR/create-relationship-analysis-agent.sh" ]; then
    echo "🔄 Führe create-relationship-analysis-agent.sh aus..."
    chmod +x "$SCRIPT_DIR/create-relationship-analysis-agent.sh"
    "$SCRIPT_DIR/create-relationship-analysis-agent.sh"
    echo -e "${GREEN}✅ Agent erstellt${NC}"
else
    echo -e "${YELLOW}⚠️  create-relationship-analysis-agent.sh nicht gefunden${NC}"
    echo "   Erstelle Agent manuell..."
    
    # Agent-Config erstellen
    mkdir -p "$AGENTS_DIR"
    cat > "$AGENTS_DIR/relationship-analysis-agent.json" << 'EOF'
{
  "id": "relationship-analysis-agent",
  "name": "Relationship Analysis Agent",
  "description": "Hochspezialisierter Agent für tiefe Beziehungsanalysen im Human Design.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/relationship-analysis-agent.txt",
  "model": "gpt-4",
  "temperature": 0.6,
  "maxTokens": 10000
}
EOF
    echo -e "${GREEN}✅ Agent-Config erstellt${NC}"
    
    # Prompt erstellen (vereinfacht - vollständiger Prompt sollte aus Script kommen)
    mkdir -p "$PROMPTS_DIR"
    if [ ! -f "$PROMPTS_DIR/relationship-analysis-agent.txt" ]; then
        echo -e "${YELLOW}⚠️  Prompt-Datei fehlt. Bitte manuell erstellen oder Script ausführen.${NC}"
    fi
fi

echo ""

# ============================================
# SCHRITT 2: Frontend-Komponente kopieren
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📋 Schritt 2: Frontend-Komponente kopieren${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

COMPONENT_SOURCE="$INTEGRATION_DIR/frontend/components/RelationshipAnalysisGenerator.tsx"
COMPONENT_TARGET="$FRONTEND_DIR/components/RelationshipAnalysisGenerator.tsx"

if [ -f "$COMPONENT_SOURCE" ]; then
    mkdir -p "$FRONTEND_DIR/components"
    cp "$COMPONENT_SOURCE" "$COMPONENT_TARGET"
    echo -e "${GREEN}✅ Komponente kopiert: $COMPONENT_TARGET${NC}"
else
    echo -e "${YELLOW}⚠️  Komponente nicht gefunden: $COMPONENT_SOURCE${NC}"
    echo "   Stelle sicher, dass die Datei existiert"
fi

echo ""

# ============================================
# SCHRITT 3: API-Route kopieren
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📋 Schritt 3: API-Route kopieren${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

API_ROUTE_SOURCE="$INTEGRATION_DIR/api-routes/app-router/relationship-analysis/generate/route.ts"
API_ROUTE_TARGET="$FRONTEND_DIR/app/api/relationship-analysis/generate/route.ts"

if [ -f "$API_ROUTE_SOURCE" ]; then
    mkdir -p "$FRONTEND_DIR/app/api/relationship-analysis/generate"
    cp "$API_ROUTE_SOURCE" "$API_ROUTE_TARGET"
    echo -e "${GREEN}✅ API-Route kopiert: $API_ROUTE_TARGET${NC}"
else
    echo -e "${YELLOW}⚠️  API-Route nicht gefunden: $API_ROUTE_SOURCE${NC}"
    echo "   Stelle sicher, dass die Datei existiert"
fi

echo ""

# ============================================
# SCHRITT 4: Frontend-Seite kopieren
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📋 Schritt 4: Frontend-Seite kopieren${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PAGE_SOURCE="$INTEGRATION_DIR/frontend/app/coach/readings/create/page.tsx"
PAGE_TARGET="$FRONTEND_DIR/app/coach/readings/create/page.tsx"

if [ -f "$PAGE_SOURCE" ]; then
    mkdir -p "$FRONTEND_DIR/app/coach/readings/create"
    cp "$PAGE_SOURCE" "$PAGE_TARGET"
    echo -e "${GREEN}✅ Frontend-Seite kopiert: $PAGE_TARGET${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend-Seite nicht gefunden: $PAGE_SOURCE${NC}"
    echo "   Stelle sicher, dass die Datei existiert"
fi

echo ""

# ============================================
# SCHRITT 5: Environment Variable prüfen
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📋 Schritt 5: Environment Variable prüfen${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ENV_FILE="$FRONTEND_DIR/.env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  .env.local nicht gefunden, erstelle neue Datei${NC}"
    touch "$ENV_FILE"
fi

if grep -q "MCP_SERVER_URL" "$ENV_FILE"; then
    echo -e "${GREEN}✅ MCP_SERVER_URL bereits gesetzt${NC}"
    grep "MCP_SERVER_URL" "$ENV_FILE"
else
    echo -e "${YELLOW}⚠️  MCP_SERVER_URL nicht gefunden, füge hinzu${NC}"
    echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> "$ENV_FILE"
    echo -e "${GREEN}✅ MCP_SERVER_URL hinzugefügt${NC}"
fi

echo ""

# ============================================
# SCHRITT 6: MCP Server neu starten
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📋 Schritt 6: MCP Server neu starten${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if systemctl is-active --quiet mcp; then
    echo "🔄 Starte MCP Server neu..."
    systemctl restart mcp
    sleep 2
    
    if systemctl is-active --quiet mcp; then
        echo -e "${GREEN}✅ MCP Server erfolgreich neu gestartet${NC}"
    else
        echo -e "${YELLOW}⚠️  MCP Server Status unklar. Prüfe manuell: systemctl status mcp${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  MCP Server läuft nicht. Starte manuell: systemctl start mcp${NC}"
fi

echo ""

# ============================================
# SCHRITT 7: Frontend neu starten
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📋 Schritt 7: Frontend neu starten${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "$FRONTEND_DIR/../docker-compose.yml" ]; then
    echo "🐳 Docker-Compose erkannt"
    cd "$FRONTEND_DIR/.."
    
    echo "🔄 Starte Frontend-Container neu..."
    docker-compose restart frontend || docker-compose up -d --build frontend
    
    echo -e "${GREEN}✅ Frontend-Container neu gestartet${NC}"
else
    echo -e "${YELLOW}⚠️  Docker-Compose nicht gefunden${NC}"
    echo "💡 Bitte starte das Frontend manuell neu:"
    echo "   cd $FRONTEND_DIR"
    echo "   pm2 restart frontend"
    echo "   # ODER"
    echo "   npm run dev -p 3005"
fi

echo ""

# ============================================
# SCHRITT 8: Verifikation
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📋 Schritt 8: Verifikation${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "⏳ Warte 5 Sekunden, damit Services starten..."
sleep 5

# Test MCP Server
echo "🧪 Teste MCP Server..."
if curl -s -f -X GET http://localhost:7000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MCP Server erreichbar${NC}"
    
    # Test Agent
    if curl -s http://localhost:7000/agents | grep -q "relationship-analysis-agent"; then
        echo -e "${GREEN}✅ Relationship Analysis Agent gefunden${NC}"
    else
        echo -e "${YELLOW}⚠️  Relationship Analysis Agent nicht in Agent-Liste${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  MCP Server nicht erreichbar${NC}"
fi

echo ""

# Test Frontend API
echo "🧪 Teste Frontend API..."
if curl -s -f -X GET http://localhost:3005/api/relationship-analysis/generate > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend API-Route erreichbar${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend API-Route nicht erreichbar (Frontend läuft möglicherweise noch nicht)${NC}"
    echo "💡 Prüfe Frontend-Status:"
    echo "   docker ps | grep frontend"
    echo "   # ODER"
    echo "   pm2 status"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Deployment abgeschlossen!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Nächste Schritte:"
echo "   1. Teste Agent: curl -X POST http://localhost:7000/agent/relationship-analysis-agent"
echo "   2. Teste API: curl -X GET http://localhost:3005/api/relationship-analysis/generate"
echo "   3. Teste Frontend: Öffne http://167.235.224.149:3005/coach/readings/create"
echo ""
