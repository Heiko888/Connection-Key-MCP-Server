#!/bin/bash

# Deployment-Script für Hetzner Server
# Führt alle notwendigen Schritte automatisch aus

set -e  # Exit on error

echo "🚀 MCP Connection-Key Deployment Script"
echo "========================================"

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Prüfen ob als root ausgeführt
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Bitte als root ausführen (sudo ./deploy.sh)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Root-Rechte bestätigt${NC}"

# Schritt 1: System aktualisieren
echo -e "\n${YELLOW}📦 Schritt 1: System aktualisieren...${NC}"
apt update && apt upgrade -y
apt install -y curl wget git vim ufw

# Schritt 2: Docker installieren
echo -e "\n${YELLOW}🐳 Schritt 2: Docker installieren...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
    echo -e "${GREEN}✅ Docker installiert${NC}"
else
    echo -e "${GREEN}✅ Docker bereits installiert${NC}"
fi

# Schritt 3: Docker Compose installieren
if ! command -v docker-compose &> /dev/null; then
    apt install -y docker-compose
    echo -e "${GREEN}✅ Docker Compose installiert${NC}"
else
    echo -e "${GREEN}✅ Docker Compose bereits installiert${NC}"
fi

# Schritt 4: Projekt-Verzeichnis erstellen
echo -e "\n${YELLOW}📁 Schritt 3: Projekt-Verzeichnis vorbereiten...${NC}"
mkdir -p /opt/mcp-connection-key
cd /opt/mcp-connection-key

# Schritt 5: .env Datei prüfen
echo -e "\n${YELLOW}🔐 Schritt 4: Umgebungsvariablen prüfen...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env Datei nicht gefunden!${NC}"
    echo "Bitte erstellen Sie eine .env Datei mit folgenden Variablen:"
    echo "  - OPENAI_API_KEY"
    echo "  - N8N_PASSWORD"
    echo "  - API_KEY"
    echo ""
    echo "Siehe .env.example für ein Beispiel."
    exit 1
fi

echo -e "${GREEN}✅ .env Datei gefunden${NC}"

# Schritt 6: Services starten
echo -e "\n${YELLOW}🚀 Schritt 5: Services starten...${NC}"
if [ -f docker-compose.yml ]; then
    docker-compose down 2>/dev/null || true
    docker-compose build
    docker-compose up -d
    echo -e "${GREEN}✅ Services gestartet${NC}"
else
    echo -e "${RED}❌ docker-compose.yml nicht gefunden!${NC}"
    exit 1
fi

# Schritt 7: Health Checks
echo -e "\n${YELLOW}🏥 Schritt 6: Health Checks...${NC}"
sleep 5  # Warten bis Services gestartet sind

# Connection-Key Server
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connection-Key Server: OK${NC}"
else
    echo -e "${RED}❌ Connection-Key Server: FEHLER${NC}"
fi

# ChatGPT-Agent
if curl -f http://localhost:4000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ChatGPT-Agent: OK${NC}"
else
    echo -e "${RED}❌ ChatGPT-Agent: FEHLER${NC}"
fi

# n8n
if curl -f http://localhost:5678/healthz > /dev/null 2>&1; then
    echo -e "${GREEN}✅ n8n: OK${NC}"
else
    echo -e "${YELLOW}⚠️  n8n: Nicht erreichbar (kann normal sein beim ersten Start)${NC}"
fi

# Schritt 8: Firewall konfigurieren
echo -e "\n${YELLOW}🔥 Schritt 7: Firewall konfigurieren...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo -e "${GREEN}✅ Firewall konfiguriert${NC}"

# Zusammenfassung
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment abgeschlossen!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Services:"
echo "  - Connection-Key: http://localhost:3000"
echo "  - ChatGPT-Agent:  http://localhost:4000"
echo "  - n8n:            http://localhost:5678"
echo ""
echo "Nützliche Befehle:"
echo "  - Logs anzeigen:  docker-compose logs -f"
echo "  - Status:         docker-compose ps"
echo "  - Neustart:       docker-compose restart"
echo "  - Stoppen:        docker-compose down"
echo ""

