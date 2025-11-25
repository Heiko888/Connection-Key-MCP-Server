#!/bin/bash

# Cleanup-Script für Hetzner Server
# Löscht alte Verzeichnisse und Container vor dem neuen Deployment

set -e  # Exit on error

echo "🧹 Hetzner Server Cleanup Script"
echo "================================="

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Prüfen ob als root ausgeführt
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Bitte als root ausführen (sudo ./cleanup-hetzner.sh)${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNUNG: Dieses Script löscht alle Container und Verzeichnisse!${NC}"
echo -e "${YELLOW}⚠️  Stellen Sie sicher, dass Sie Backups haben!${NC}"
echo ""
read -p "Möchten Sie fortfahren? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}❌ Abgebrochen${NC}"
    exit 1
fi

# Schritt 1: Docker Container stoppen und entfernen
echo -e "\n${YELLOW}🐳 Schritt 1: Docker Container stoppen und entfernen...${NC}"

# Prüfen ob docker-compose.yml existiert
if [ -f /opt/mcp-connection-key/docker-compose.yml ]; then
    cd /opt/mcp-connection-key
    echo "  - Container stoppen..."
    docker-compose down -v 2>/dev/null || true
    echo -e "${GREEN}  ✅ Container gestoppt${NC}"
else
    echo -e "${YELLOW}  ⚠️  docker-compose.yml nicht gefunden, überspringe${NC}"
fi

# Alle Container mit unseren Namen entfernen
echo "  - Container mit unseren Namen entfernen..."
docker ps -a | grep -E "(mcp-server|chatgpt-agent|connection-key|n8n)" | awk '{print $1}' | xargs -r docker rm -f 2>/dev/null || true
echo -e "${GREEN}  ✅ Container entfernt${NC}"

# Schritt 2: Docker Images entfernen
echo -e "\n${YELLOW}🗑️  Schritt 2: Docker Images entfernen...${NC}"
docker images | grep -E "(mcp-connection-key|mcp-server|chatgpt-agent|connection-key)" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
echo -e "${GREEN}  ✅ Images entfernt${NC}"

# Schritt 3: Alte Verzeichnisse löschen
echo -e "\n${YELLOW}📁 Schritt 3: Alte Verzeichnisse löschen...${NC}"

# Projekt-Verzeichnis
if [ -d "/opt/mcp-connection-key" ]; then
    echo "  - /opt/mcp-connection-key löschen..."
    rm -rf /opt/mcp-connection-key
    echo -e "${GREEN}  ✅ /opt/mcp-connection-key gelöscht${NC}"
else
    echo -e "${YELLOW}  ⚠️  /opt/mcp-connection-key existiert nicht${NC}"
fi

# Weitere mögliche Verzeichnisse
for dir in "/opt/mcp-server" "/opt/chatgpt-agent" "/opt/connection-key"; do
    if [ -d "$dir" ]; then
        echo "  - $dir löschen..."
        rm -rf "$dir"
        echo -e "${GREEN}  ✅ $dir gelöscht${NC}"
    fi
done

# Schritt 4: n8n Daten (optional - kommentiert aus)
echo -e "\n${YELLOW}💾 Schritt 4: n8n Daten (optional)...${NC}"
read -p "Möchten Sie auch n8n Daten löschen? (yes/no): " delete_n8n

if [ "$delete_n8n" = "yes" ]; then
    if [ -d "/root/.n8n" ]; then
        echo "  - /root/.n8n löschen..."
        rm -rf /root/.n8n
        echo -e "${GREEN}  ✅ n8n Daten gelöscht${NC}"
    fi
    if [ -d "/home/node/.n8n" ]; then
        echo "  - /home/node/.n8n löschen..."
        rm -rf /home/node/.n8n
        echo -e "${GREEN}  ✅ n8n Daten gelöscht${NC}"
    fi
    # Docker Volume
    docker volume rm n8n_data 2>/dev/null || true
    echo -e "${GREEN}  ✅ n8n Volumes entfernt${NC}"
else
    echo -e "${YELLOW}  ⚠️  n8n Daten werden beibehalten${NC}"
fi

# Schritt 5: Docker Volumes aufräumen (optional)
echo -e "\n${YELLOW}🧹 Schritt 5: Docker Volumes aufräumen...${NC}"
read -p "Möchten Sie ungenutzte Docker Volumes löschen? (yes/no): " cleanup_volumes

if [ "$cleanup_volumes" = "yes" ]; then
    docker volume prune -f
    echo -e "${GREEN}  ✅ Ungenutzte Volumes entfernt${NC}"
else
    echo -e "${YELLOW}  ⚠️  Volumes werden beibehalten${NC}"
fi

# Schritt 6: Docker System aufräumen (optional)
echo -e "\n${YELLOW}🧹 Schritt 6: Docker System aufräumen...${NC}"
read -p "Möchten Sie Docker System aufräumen (unused images, containers, networks)? (yes/no): " cleanup_system

if [ "$cleanup_system" = "yes" ]; then
    docker system prune -f
    echo -e "${GREEN}  ✅ Docker System aufgeräumt${NC}"
else
    echo -e "${YELLOW}  ⚠️  Docker System wird nicht aufgeräumt${NC}"
fi

# Zusammenfassung
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Cleanup abgeschlossen!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Nächste Schritte:"
echo "  1. Code von GitHub klonen:"
echo "     git clone https://github.com/Heiko888/Connection-Key-MCP-Server.git /opt/mcp-connection-key"
echo ""
echo "  2. .env Datei erstellen"
echo ""
echo "  3. Deployment starten:"
echo "     cd /opt/mcp-connection-key"
echo "     ./deploy.sh"
echo ""

