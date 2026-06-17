#!/bin/bash

# Deployment-Script für Coach Readings API Route
# Kopiert die Route auf den CK-App Server und baut den Container neu

set -e

# Farben
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🚀 Coach Readings API Route Deployment${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Server-Informationen
CK_APP_SERVER="root@167.235.224.149"
FRONTEND_DIR="/opt/hd-app/The-Connection-Key/frontend"
ROUTE_FILE="integration/api-routes/app-router/coach/readings/route.ts"
TARGET_DIR="$FRONTEND_DIR/app/api/coach/readings"

echo -e "${BLUE}📋 Schritt 1: Datei auf Server kopieren${NC}"
echo "----------------------------------------"

# Prüfe ob Datei lokal existiert
if [ ! -f "$ROUTE_FILE" ]; then
    echo -e "${RED}❌ Datei nicht gefunden: $ROUTE_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Datei gefunden: $ROUTE_FILE${NC}"

# Erstelle Verzeichnis auf Server und kopiere Datei
echo -e "${YELLOW}📤 Kopiere Datei auf Server...${NC}"
ssh $CK_APP_SERVER "mkdir -p $TARGET_DIR"
scp "$ROUTE_FILE" "$CK_APP_SERVER:$TARGET_DIR/route.ts"

echo -e "${GREEN}✅ Datei kopiert: $TARGET_DIR/route.ts${NC}"

echo ""
echo -e "${BLUE}📋 Schritt 2: Container neu bauen${NC}"
echo "----------------------------------------"

# Container neu bauen (ohne Cache)
echo -e "${YELLOW}🔨 Baue Frontend-Container neu (ohne Cache)...${NC}"
ssh $CK_APP_SERVER "cd /opt/hd-app/The-Connection-Key && docker compose build --no-cache frontend"

echo -e "${GREEN}✅ Container neu gebaut${NC}"

echo ""
echo -e "${BLUE}📋 Schritt 3: Container neu starten${NC}"
echo "----------------------------------------"

# Container neu starten
echo -e "${YELLOW}🔄 Starte Frontend-Container neu...${NC}"
ssh $CK_APP_SERVER "cd /opt/hd-app/The-Connection-Key && docker compose up -d frontend"

echo -e "${GREEN}✅ Container neu gestartet${NC}"

echo ""
echo -e "${BLUE}📋 Schritt 4: Warte auf Container-Start${NC}"
echo "----------------------------------------"

# Warte 5 Sekunden
sleep 5

# Prüfe Container-Status
echo -e "${YELLOW}🔍 Prüfe Container-Status...${NC}"
ssh $CK_APP_SERVER "cd /opt/hd-app/The-Connection-Key && docker compose ps frontend"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Deployment abgeschlossen!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}🧪 Teste die API:${NC}"
echo ""
echo "  # GET: API Info"
echo "  curl -X GET http://167.235.224.149:3000/api/coach/readings"
echo ""
echo "  # POST: Connection Reading"
echo "  curl -X POST http://167.235.224.149:3000/api/coach/readings \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{"
echo "      \"reading_type\": \"connection\","
echo "      \"client_name\": \"Test\","
echo "      \"reading_data\": {"
echo "        \"personA\": {"
echo "          \"name\": \"Heiko\","
echo "          \"geburtsdatum\": \"1980-12-08\","
echo "          \"geburtszeit\": \"22:10\","
echo "          \"geburtsort\": \"Miltenberg, Germany\""
echo "        },"
echo "        \"personB\": {"
echo "          \"name\": \"Jani\","
echo "          \"geburtsdatum\": \"1977-06-03\","
echo "          \"geburtszeit\": \"19:49\","
echo "          \"geburtsort\": \"Wolfenbüttel, Germany\""
echo "        }"
echo "      }"
echo "    }'"
echo ""



