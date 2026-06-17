#!/bin/bash

# ============================================
# Hetzner Server Status Check
# ============================================
# Prüft den aktuellen Status des Servers
# 
# Verwendung:
#   chmod +x check-hetzner-status.sh
#   ./check-hetzner-status.sh
# ============================================

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}\n"
}

print_section() {
    echo -e "\n${BLUE}▶ $1${NC}"
}

print_info() {
    echo -e "  ${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "  ${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "  ${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "  ${RED}❌ $1${NC}"
}

# ============================================
# System Info
# ============================================

print_header "Hetzner Server Status Check"

print_section "System Information"
echo "  Hostname: $(hostname)"
echo "  OS: $(lsb_release -d 2>/dev/null | cut -f2 || uname -a)"
echo "  Uptime: $(uptime -p 2>/dev/null || uptime)"
echo "  Date: $(date)"

# ============================================
# Docker Status
# ============================================

print_section "Docker Status"

if command -v docker &> /dev/null; then
    print_success "Docker ist installiert"
    echo "  Version: $(docker --version)"
    
    if systemctl is-active --quiet docker; then
        print_success "Docker Service läuft"
    else
        print_error "Docker Service läuft NICHT"
    fi
else
    print_error "Docker ist NICHT installiert"
fi

if command -v docker-compose &> /dev/null; then
    print_success "Docker Compose ist installiert"
    echo "  Version: $(docker-compose --version)"
else
    print_warning "Docker Compose ist NICHT installiert"
fi

# ============================================
# Docker Container
# ============================================

print_section "Docker Container Status"

if command -v docker &> /dev/null; then
    echo ""
    echo "  Laufende Container:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null | grep -E "(NAMES|mcp|agent|connection|n8n)" || echo "    Keine relevanten Container gefunden"
    
    echo ""
    echo "  Alle Container (inkl. gestoppte):"
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null | grep -E "(NAMES|mcp|agent|connection|n8n)" || echo "    Keine relevanten Container gefunden"
    
    echo ""
    echo "  Docker Images:"
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" 2>/dev/null | grep -E "(REPOSITORY|mcp|agent|connection|n8n)" || echo "    Keine relevanten Images gefunden"
else
    print_warning "Docker nicht verfügbar, Container-Status kann nicht geprüft werden"
fi

# ============================================
# Verzeichnisse
# ============================================

print_section "Projekt-Verzeichnisse"

PROJECT_DIRS=(
    "/opt/mcp-connection-key"
    "/opt/mcp-server"
    "/opt/chatgpt-agent"
    "/opt/connection-key"
)

for dir in "${PROJECT_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        print_success "$dir existiert"
        echo "    Größe: $(du -sh "$dir" 2>/dev/null | cut -f1)"
        echo "    Inhalt: $(ls -1 "$dir" 2>/dev/null | wc -l) Einträge"
        
        # Prüfe ob .env existiert
        if [ -f "$dir/.env" ]; then
            print_success "  .env Datei vorhanden"
            echo "    Berechtigungen: $(ls -l "$dir/.env" 2>/dev/null | awk '{print $1}')"
        else
            print_warning "  .env Datei NICHT vorhanden"
        fi
        
        # Prüfe ob docker-compose.yml existiert
        if [ -f "$dir/docker-compose.yml" ]; then
            print_success "  docker-compose.yml vorhanden"
        fi
        
        # Prüfe ob Git Repository
        if [ -d "$dir/.git" ]; then
            print_success "  Git Repository vorhanden"
            echo "    Branch: $(cd "$dir" && git branch --show-current 2>/dev/null || echo "unbekannt")"
            echo "    Remote: $(cd "$dir" && git remote get-url origin 2>/dev/null || echo "kein Remote")"
        fi
    else
        print_info "$dir existiert NICHT"
    fi
done

# ============================================
# Services / Ports
# ============================================

print_section "Laufende Services (Ports)"

PORTS=(3000 4000 5678 7777)

for port in "${PORTS[@]}"; do
    if command -v netstat &> /dev/null; then
        if netstat -tuln 2>/dev/null | grep -q ":$port "; then
            SERVICE=$(netstat -tuln 2>/dev/null | grep ":$port " | awk '{print $7}' | head -1)
            print_success "Port $port ist belegt"
            echo "    Service: $SERVICE"
        else
            print_info "Port $port ist NICHT belegt"
        fi
    elif command -v ss &> /dev/null; then
        if ss -tuln 2>/dev/null | grep -q ":$port "; then
            SERVICE=$(ss -tuln 2>/dev/null | grep ":$port " | awk '{print $6}' | head -1)
            print_success "Port $port ist belegt"
            echo "    Service: $SERVICE"
        else
            print_info "Port $port ist NICHT belegt"
        fi
    else
        print_warning "Kann Ports nicht prüfen (netstat/ss nicht verfügbar)"
        break
    fi
done

# ============================================
# Health Checks
# ============================================

print_section "Health Checks"

if command -v curl &> /dev/null; then
    SERVICES=(
        "http://localhost:3000/health:Connection-Key Server"
        "http://localhost:4000/health:ChatGPT-Agent"
        "http://localhost:5678/healthz:n8n"
    )
    
    for service in "${SERVICES[@]}"; do
        URL=$(echo "$service" | cut -d: -f1-3)
        NAME=$(echo "$service" | cut -d: -f4)
        
        if curl -f -s "$URL" > /dev/null 2>&1; then
            print_success "$NAME: Erreichbar"
            RESPONSE=$(curl -s "$URL" 2>/dev/null | head -c 100)
            echo "    Antwort: ${RESPONSE}..."
        else
            print_warning "$NAME: NICHT erreichbar"
        fi
    done
else
    print_warning "curl nicht verfügbar, Health Checks können nicht durchgeführt werden"
fi

# ============================================
# Nginx Status
# ============================================

print_section "Nginx Status"

if command -v nginx &> /dev/null; then
    print_success "Nginx ist installiert"
    echo "  Version: $(nginx -v 2>&1)"
    
    if systemctl is-active --quiet nginx; then
        print_success "Nginx Service läuft"
        
        # Prüfe Konfiguration
        if [ -f "/etc/nginx/sites-available/mcp-system" ] || [ -f "/etc/nginx/sites-enabled/mcp-system" ]; then
            print_success "MCP System Konfiguration vorhanden"
        else
            print_info "MCP System Konfiguration NICHT vorhanden"
        fi
    else
        print_warning "Nginx Service läuft NICHT"
    fi
else
    print_info "Nginx ist NICHT installiert"
fi

# ============================================
# Firewall Status
# ============================================

print_section "Firewall Status"

if command -v ufw &> /dev/null; then
    if ufw status | grep -q "Status: active"; then
        print_success "UFW Firewall ist aktiv"
        echo ""
        echo "  Firewall Regeln:"
        ufw status numbered 2>/dev/null | head -20
    else
        print_warning "UFW Firewall ist NICHT aktiv"
    fi
else
    print_info "UFW Firewall ist NICHT installiert"
fi

# ============================================
# Disk Space
# ============================================

print_section "Disk Space"

df -h / | tail -1 | awk '{print "  Gesamt: " $2 " | Verwendet: " $3 " (" $5 ") | Verfügbar: " $4}'

# Docker Disk Usage
if command -v docker &> /dev/null; then
    echo ""
    echo "  Docker Disk Usage:"
    docker system df 2>/dev/null | head -10
fi

# ============================================
# Zusammenfassung
# ============================================

print_header "Zusammenfassung"

echo "Um detaillierte Logs zu sehen:"
echo "  docker-compose logs -f    (wenn in /opt/mcp-connection-key)"
echo ""
echo "Um Container neu zu starten:"
echo "  cd /opt/mcp-connection-key && docker-compose restart"
echo ""
echo "Um Status zu prüfen:"
echo "  docker-compose ps          (wenn in /opt/mcp-connection-key)"

