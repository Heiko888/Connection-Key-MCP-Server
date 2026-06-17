#!/bin/bash

# ============================================
# Hetzner Server - Fix & Start Script
# ============================================
# Prüft den Status, behebt Probleme und startet Services
# 
# Verwendung:
#   chmod +x fix-and-start-hetzner.sh
#   sudo ./fix-and-start-hetzner.sh
# ============================================

set -e  # Exit on error

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PROJECT_DIR="/opt/mcp-connection-key"
ISSUES_FOUND=0
FIXES_APPLIED=0

print_header() {
    echo -e "\n${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}\n"
}

print_section() {
    echo -e "\n${BLUE}▶ $1${NC}"
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

print_info() {
    echo -e "  ${BLUE}ℹ️  $1${NC}"
}

# ============================================
# Prüfungen
# ============================================

print_header "Hetzner Server - Fix & Start"

# Prüfen ob als root ausgeführt
if [ "$EUID" -ne 0 ]; then 
    print_error "Bitte als root ausführen (sudo ./fix-and-start-hetzner.sh)"
    exit 1
fi

print_success "Root-Rechte bestätigt"

# ============================================
# Schritt 1: Projekt-Verzeichnis prüfen
# ============================================

print_section "Schritt 1: Projekt-Verzeichnis prüfen"

if [ ! -d "$PROJECT_DIR" ]; then
    print_warning "Projekt-Verzeichnis existiert nicht"
    read -p "Möchten Sie das Verzeichnis erstellen und Code von GitHub klonen? (j/N): " create_dir
    
    if [[ "$create_dir" =~ ^[Jj]$ ]]; then
        mkdir -p "$PROJECT_DIR"
        print_info "Klonen von GitHub..."
        git clone https://github.com/Heiko888/Connection-Key-MCP-Server.git "$PROJECT_DIR" || {
            print_error "Git Clone fehlgeschlagen!"
            exit 1
        }
        print_success "Code geklont"
        FIXES_APPLIED=$((FIXES_APPLIED + 1))
    else
        print_error "Kann ohne Projekt-Verzeichnis nicht fortfahren"
        exit 1
    fi
else
    print_success "Projekt-Verzeichnis vorhanden: $PROJECT_DIR"
fi

cd "$PROJECT_DIR"

# ============================================
# Schritt 2: Docker prüfen
# ============================================

print_section "Schritt 2: Docker prüfen"

if ! command -v docker &> /dev/null; then
    print_error "Docker ist NICHT installiert"
    read -p "Möchten Sie Docker jetzt installieren? (j/N): " install_docker
    
    if [[ "$install_docker" =~ ^[Jj]$ ]]; then
        print_info "Docker wird installiert..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        systemctl start docker
        systemctl enable docker
        print_success "Docker installiert"
        FIXES_APPLIED=$((FIXES_APPLIED + 1))
    else
        print_error "Docker ist erforderlich. Bitte installieren Sie Docker manuell."
        exit 1
    fi
else
    print_success "Docker ist installiert: $(docker --version)"
    
    if ! systemctl is-active --quiet docker; then
        print_warning "Docker Service läuft nicht, starte..."
        systemctl start docker
        print_success "Docker Service gestartet"
        FIXES_APPLIED=$((FIXES_APPLIED + 1))
    else
        print_success "Docker Service läuft"
    fi
fi

if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose fehlt, installiere..."
    apt install -y docker-compose
    print_success "Docker Compose installiert"
    FIXES_APPLIED=$((FIXES_APPLIED + 1))
else
    print_success "Docker Compose ist installiert"
fi

# ============================================
# Schritt 3: docker-compose.yml prüfen
# ============================================

print_section "Schritt 3: docker-compose.yml prüfen"

if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml fehlt!"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
    
    if [ -d ".git" ]; then
        print_info "Git Repository vorhanden, versuche git pull..."
        git pull || print_warning "Git pull fehlgeschlagen"
    fi
    
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml konnte nicht gefunden werden. Bitte Code aktualisieren."
        exit 1
    fi
else
    print_success "docker-compose.yml vorhanden"
fi

# ============================================
# Schritt 4: .env Datei prüfen und erstellen
# ============================================

print_section "Schritt 4: .env Datei prüfen"

if [ ! -f ".env" ]; then
    print_warning ".env Datei fehlt!"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
    
    if [ -f ".env.example" ]; then
        print_info ".env.example gefunden"
        read -p "Möchten Sie .env von .env.example erstellen? (j/N): " create_env
        
        if [[ "$create_env" =~ ^[Jj]$ ]]; then
            cp .env.example .env
            chmod 600 .env
            print_success ".env Datei erstellt"
            print_warning "⚠️  WICHTIG: Bitte passen Sie die .env Datei an!"
            print_info "Öffnen Sie die Datei mit: nano .env"
            print_info "Mindestens diese Werte müssen gesetzt werden:"
            echo "    - OPENAI_API_KEY"
            echo "    - N8N_PASSWORD"
            echo "    - API_KEY"
            echo ""
            read -p "Drücken Sie Enter nachdem Sie .env bearbeitet haben..." wait_env
            FIXES_APPLIED=$((FIXES_APPLIED + 1))
        else
            print_error ".env Datei ist erforderlich. Bitte erstellen Sie sie manuell."
            exit 1
        fi
    else
        print_error ".env.example nicht gefunden. Erstelle minimale .env..."
        
        # OpenAI API Key abfragen
        read -p "Bitte geben Sie Ihren OpenAI API Key ein: " openai_key
        if [ -z "$openai_key" ]; then
            print_error "OpenAI API Key ist erforderlich!"
            exit 1
        fi
        
        # n8n Passwort generieren
        n8n_pass=$(openssl rand -hex 16)
        api_key=$(openssl rand -hex 32)
        jwt_secret=$(openssl rand -hex 32)
        
        cat > .env << EOF
# ERFORDERLICH
OPENAI_API_KEY=$openai_key
N8N_PASSWORD=$n8n_pass
API_KEY=$api_key

# URLs (Docker interne Namen)
N8N_BASE_URL=http://n8n:5678
MCP_SERVER_URL=http://mcp-server:7777
CHATGPT_AGENT_URL=http://chatgpt-agent:4000
CONNECTION_KEY_URL=http://connection-key:3000

# Server Ports
PORT=3000

# Authentication
AUTH_ENABLED=true
JWT_SECRET=$jwt_secret
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGINS=*

# Environment
NODE_ENV=production
LOG_LEVEL=info
LOG_FORMAT=json

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
EOF
        
        chmod 600 .env
        print_success ".env Datei erstellt"
        print_info "n8n Passwort: $n8n_pass"
        print_info "API Key: $api_key"
        FIXES_APPLIED=$((FIXES_APPLIED + 1))
    fi
else
    print_success ".env Datei vorhanden"
    
    # Prüfe wichtige Variablen
    if ! grep -q "OPENAI_API_KEY=" .env || grep -q "OPENAI_API_KEY=your-" .env; then
        print_warning "OPENAI_API_KEY scheint nicht gesetzt zu sein"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
    
    if ! grep -q "N8N_PASSWORD=" .env || grep -q "N8N_PASSWORD=change-me" .env; then
        print_warning "N8N_PASSWORD scheint nicht gesetzt zu sein"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
fi

# ============================================
# Schritt 5: Code aktualisieren (optional)
# ============================================

print_section "Schritt 5: Code aktualisieren"

if [ -d ".git" ]; then
    print_info "Git Repository gefunden"
    read -p "Möchten Sie den Code von GitHub aktualisieren? (j/N): " update_code
    
    if [[ "$update_code" =~ ^[Jj]$ ]]; then
        print_info "Code wird aktualisiert..."
        git pull || print_warning "Git pull fehlgeschlagen (kann normal sein)"
        print_success "Code aktualisiert"
    fi
else
    print_info "Kein Git Repository gefunden (kann normal sein)"
fi

# ============================================
# Schritt 6: Alte Container aufräumen
# ============================================

print_section "Schritt 6: Alte Container aufräumen"

if docker ps -a | grep -qE "(mcp-server|chatgpt-agent|connection-key|n8n)"; then
    print_warning "Alte Container gefunden"
    read -p "Möchten Sie alte Container stoppen und entfernen? (j/N): " cleanup
    
    if [[ "$cleanup" =~ ^[Jj]$ ]]; then
        print_info "Container werden gestoppt..."
        docker-compose down 2>/dev/null || true
        print_success "Alte Container entfernt"
        FIXES_APPLIED=$((FIXES_APPLIED + 1))
    fi
else
    print_success "Keine alten Container gefunden"
fi

# ============================================
# Schritt 7: Services bauen und starten
# ============================================

print_section "Schritt 7: Services bauen und starten"

print_info "Services werden gebaut..."
docker-compose build

print_info "Services werden gestartet..."
docker-compose up -d

print_success "Services gestartet"

# Warten bis Services hochgefahren sind
print_info "Warte 10 Sekunden bis Services hochgefahren sind..."
sleep 10

# ============================================
# Schritt 8: Status prüfen
# ============================================

print_section "Schritt 8: Status prüfen"

echo ""
echo "Container Status:"
docker-compose ps

echo ""
print_info "Health Checks..."

# Connection-Key Server
if curl -f -s http://localhost:3000/health > /dev/null 2>&1; then
    print_success "Connection-Key Server: OK"
else
    print_warning "Connection-Key Server: Nicht erreichbar (kann beim Start normal sein)"
fi

# ChatGPT-Agent
if curl -f -s http://localhost:4000/health > /dev/null 2>&1; then
    print_success "ChatGPT-Agent: OK"
else
    print_warning "ChatGPT-Agent: Nicht erreichbar (kann beim Start normal sein)"
fi

# n8n
if curl -f -s http://localhost:5678/healthz > /dev/null 2>&1; then
    print_success "n8n: OK"
else
    print_warning "n8n: Nicht erreichbar (kann beim Start normal sein)"
fi

# ============================================
# Schritt 9: Logs anzeigen (optional)
# ============================================

print_section "Schritt 9: Logs"

read -p "Möchten Sie die Logs anzeigen? (j/N): " show_logs

if [[ "$show_logs" =~ ^[Jj]$ ]]; then
    echo ""
    print_info "Logs (letzte 50 Zeilen):"
    docker-compose logs --tail=50
    echo ""
    print_info "Für Live-Logs: docker-compose logs -f"
fi

# ============================================
# Zusammenfassung
# ============================================

print_header "Zusammenfassung"

echo "Gefundene Probleme: $ISSUES_FOUND"
echo "Angewendete Fixes: $FIXES_APPLIED"
echo ""

if [ $ISSUES_FOUND -eq 0 ] && [ $FIXES_APPLIED -eq 0 ]; then
    print_success "Alles sieht gut aus! Services sollten laufen."
else
    if [ $FIXES_APPLIED -gt 0 ]; then
        print_success "Fixes wurden angewendet. Services sollten jetzt laufen."
    fi
fi

echo ""
echo "Nützliche Befehle:"
echo "  - Logs anzeigen:  cd $PROJECT_DIR && docker-compose logs -f"
echo "  - Status:         cd $PROJECT_DIR && docker-compose ps"
echo "  - Neustart:       cd $PROJECT_DIR && docker-compose restart"
echo "  - Stoppen:        cd $PROJECT_DIR && docker-compose down"
echo ""
echo "Services:"
echo "  - Connection-Key: http://localhost:3000"
echo "  - ChatGPT-Agent:  http://localhost:4000"
echo "  - n8n:            http://localhost:5678"
echo ""

