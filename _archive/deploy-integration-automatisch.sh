#!/bin/bash

# 🚀 Automatische Integration-Deployment
# Prüft automatisch, wie das Frontend läuft und führt die Integration durch

set -e

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🚀 Automatische Integration-Deployment${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Projekt-Verzeichnis
PROJECT_DIR="/opt/hd-app/The-Connection-Key"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Prüfe ob Verzeichnis existiert
if [ ! -d "$FRONTEND_DIR" ]; then
  echo -e "${RED}❌ Frontend-Verzeichnis nicht gefunden: $FRONTEND_DIR${NC}"
  exit 1
fi

cd "$FRONTEND_DIR"

echo -e "${BLUE}📁 Frontend-Verzeichnis: $FRONTEND_DIR${NC}"
echo ""

# Schritt 1: Prüfe wie Frontend läuft
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🔍 Schritt 1: Prüfe wie Frontend läuft${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

FRONTEND_IN_DOCKER=false
FRONTEND_DIRECT=false

# Prüfe Docker
if docker ps | grep -q frontend; then
  FRONTEND_IN_DOCKER=true
  echo -e "${GREEN}✅ Frontend läuft in Docker${NC}"
  docker ps | grep frontend
elif docker compose ps 2>/dev/null | grep -q frontend; then
  FRONTEND_IN_DOCKER=true
  echo -e "${GREEN}✅ Frontend läuft in Docker Compose${NC}"
  docker compose ps | grep frontend
else
  echo -e "${YELLOW}⚠️ Frontend läuft nicht in Docker${NC}"
fi

# Prüfe direkten Prozess
if lsof -i :3000 2>/dev/null | grep -q LISTEN || lsof -i :3005 2>/dev/null | grep -q LISTEN; then
  FRONTEND_DIRECT=true
  echo -e "${GREEN}✅ Frontend läuft direkt (Port 3000 oder 3005)${NC}"
  lsof -i :3000 2>/dev/null || lsof -i :3005 2>/dev/null
fi

echo ""

# Schritt 2: Prüfe Integration-Dateien
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📦 Schritt 2: Prüfe Integration-Dateien${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ! -d "integration" ]; then
  echo -e "${RED}❌ integration/ Verzeichnis nicht gefunden!${NC}"
  echo ""
  echo "Mögliche Lösungen:"
  echo "1. Git Pull durchführen: git pull origin main"
  echo "2. Integration-Dateien per SCP kopieren"
  exit 1
fi

echo -e "${GREEN}✅ Integration-Verzeichnis gefunden${NC}"
echo ""

# Schritt 3: Prüfe Router-Typ
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🔍 Schritt 3: Prüfe Router-Typ${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ROUTER_TYPE=""
if [ -d "pages" ]; then
  ROUTER_TYPE="pages"
  echo -e "${GREEN}✅ Pages Router erkannt${NC}"
elif [ -d "app" ]; then
  ROUTER_TYPE="app"
  echo -e "${GREEN}✅ App Router erkannt${NC}"
else
  echo -e "${RED}❌ Weder pages/ noch app/ Verzeichnis gefunden!${NC}"
  exit 1
fi

echo ""

# Schritt 4: Kopiere API-Routes
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📝 Schritt 4: Kopiere API-Routes${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$ROUTER_TYPE" = "pages" ]; then
  mkdir -p pages/api/agents
  mkdir -p pages/api/reading
  
  # Kopiere Agent-Routes
  for file in integration/api-routes/agents-*.ts; do
    if [ -f "$file" ]; then
      filename=$(basename "$file")
      cp "$file" "pages/api/agents/$filename"
      echo -e "${GREEN}✅ Kopiert: $filename${NC}"
    fi
  done
  
  # Kopiere Reading-Route
  if [ -f "integration/api-routes/app-router/reading/generate/route.ts" ]; then
    mkdir -p pages/api/reading
    cp "integration/api-routes/app-router/reading/generate/route.ts" "pages/api/reading/generate.ts"
    echo -e "${GREEN}✅ Kopiert: reading/generate.ts${NC}"
  fi
fi

if [ "$ROUTER_TYPE" = "app" ]; then
  mkdir -p app/api/reading/generate
  
  # Kopiere Reading-Route
  if [ -f "integration/api-routes/app-router/reading/generate/route.ts" ]; then
    cp "integration/api-routes/app-router/reading/generate/route.ts" "app/api/reading/generate/route.ts"
    echo -e "${GREEN}✅ Kopiert: app/api/reading/generate/route.ts${NC}"
  fi
  
  echo -e "${YELLOW}⚠️ App Router: Agent-Routes müssen manuell angepasst werden${NC}"
fi

echo ""

# Schritt 5: Kopiere Komponenten
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🧩 Schritt 5: Kopiere Komponenten${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

mkdir -p components/agents
mkdir -p lib/components

# Kopiere Komponenten
for file in integration/frontend/components/*.tsx; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    cp "$file" "components/agents/$filename"
    cp "$file" "lib/components/$filename"
    echo -e "${GREEN}✅ Kopiert: $filename${NC}"
  fi
done

echo ""

# Schritt 6: Prüfe Environment Variables
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🔑 Schritt 6: Prüfe Environment Variables${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ! -f ".env.local" ]; then
  echo -e "${YELLOW}⚠️ .env.local nicht gefunden - erstelle Datei...${NC}"
  touch .env.local
fi

# Prüfe wichtige Variablen
MISSING_VARS=0

if ! grep -q "MCP_SERVER_URL" .env.local; then
  echo -e "${YELLOW}⚠️ MCP_SERVER_URL fehlt${NC}"
  MISSING_VARS=1
fi

if ! grep -q "READING_AGENT_URL" .env.local; then
  echo -e "${YELLOW}⚠️ READING_AGENT_URL fehlt${NC}"
  MISSING_VARS=1
fi

if [ $MISSING_VARS -eq 1 ]; then
  echo ""
  echo -e "${YELLOW}⚠️ Bitte fehlende Environment Variables in .env.local eintragen!${NC}"
  echo ""
else
  echo -e "${GREEN}✅ Environment Variables vorhanden${NC}"
fi

echo ""

# Schritt 7: Container neu bauen (falls Docker)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🐳 Schritt 7: Container neu bauen${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$FRONTEND_IN_DOCKER" = true ]; then
  echo -e "${BLUE}🐳 Frontend läuft in Docker - baue Container neu...${NC}"
  echo ""
  
  cd "$PROJECT_DIR"
  
  # Stoppe Frontend
  echo "Stoppe Frontend-Container..."
  docker compose stop frontend 2>/dev/null || docker stop $(docker ps | grep frontend | awk '{print $1}') 2>/dev/null || true
  
  # Baue neu
  echo "Baue Frontend-Container neu..."
  docker compose build frontend
  
  # Starte neu
  echo "Starte Frontend-Container neu..."
  docker compose up -d frontend
  
  # Warte
  echo "Warte 10 Sekunden..."
  sleep 10
  
  # Prüfe Logs
  echo ""
  echo "Container-Logs:"
  docker logs $(docker ps | grep frontend | awk '{print $1}' | head -1) --tail 20 2>/dev/null || true
  
  echo ""
  echo -e "${GREEN}✅ Container neu gebaut und gestartet${NC}"
else
  echo -e "${YELLOW}⚠️ Frontend läuft nicht in Docker${NC}"
  echo ""
  echo "Bitte Frontend manuell neu starten:"
  echo "  - PM2: pm2 restart next-app"
  echo "  - Direkt: npm run dev (oder npm run build && npm start)"
fi

echo ""

# Zusammenfassung
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 Zusammenfassung${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${GREEN}✅ Integration abgeschlossen!${NC}"
echo ""
echo "Nächste Schritte:"
echo "1. Prüfe Environment Variables (.env.local)"
echo "2. Teste API-Routes:"
echo "   curl -X POST http://localhost:3000/api/agents/marketing \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\":\"Test\",\"userId\":\"test\"}'"
echo "3. Prüfe Frontend im Browser"

echo ""
