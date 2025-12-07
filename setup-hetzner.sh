#!/bin/bash

# ============================================
# Hetzner Server Setup Script
# ============================================
# Dieses Script richtet das komplette System auf einem Hetzner Server ein
# 
# Verwendung:
#   chmod +x setup-hetzner.sh
#   sudo ./setup-hetzner.sh
# ============================================

set -e  # Exit on error

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Projekt-Verzeichnis
PROJECT_DIR="/opt/mcp-connection-key"
GIT_REPO="https://github.com/Heiko888/Connection-Key-MCP-Server.git"

# ============================================
# Hilfsfunktionen
# ============================================

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ============================================
# Prüfungen
# ============================================

print_header "Hetzner Server Setup - MCP Connection-Key"

# Prüfen ob als root ausgeführt
if [ "$EUID" -ne 0 ]; then 
    print_error "Bitte als root ausführen (sudo ./setup-hetzner.sh)"
    exit 1
fi

print_success "Root-Rechte bestätigt"

# ============================================
# Schritt 1: System aktualisieren
# ============================================

print_header "Schritt 1: System aktualisieren"

apt update && apt upgrade -y
apt install -y curl wget git vim ufw openssl

print_success "System aktualisiert"

# ============================================
# Schritt 2: Docker installieren
# ============================================

print_header "Schritt 2: Docker installieren"

if ! command -v docker &> /dev/null; then
    print_info "Docker wird installiert..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
    print_success "Docker installiert"
else
    print_success "Docker bereits installiert"
fi

# Docker Compose installieren
if ! command -v docker-compose &> /dev/null; then
    print_info "Docker Compose wird installiert..."
    apt install -y docker-compose
    print_success "Docker Compose installiert"
else
    print_success "Docker Compose bereits installiert"
fi

# Docker Version anzeigen
docker --version
docker-compose --version

# ============================================
# Schritt 3: Projekt-Verzeichnis vorbereiten
# ============================================

print_header "Schritt 3: Projekt-Verzeichnis vorbereiten"

mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Prüfen ob bereits Code vorhanden ist
if [ -d ".git" ]; then
    print_info "Git Repository bereits vorhanden, aktualisiere..."
    git pull || print_warning "Git pull fehlgeschlagen, fahre fort..."
else
    print_info "Code wird von GitHub geklont..."
    if [ -n "$GIT_REPO" ]; then
        git clone "$GIT_REPO" . || {
            print_error "Git Clone fehlgeschlagen!"
            print_info "Bitte manuell klonen: git clone $GIT_REPO $PROJECT_DIR"
            exit 1
        }
        print_success "Code geklont"
    else
        print_warning "Kein Git Repository angegeben, bitte Code manuell hochladen"
    fi
fi

# ============================================
# Schritt 4: .env Datei erstellen
# ============================================

print_header "Schritt 4: Umgebungsvariablen konfigurieren"

if [ -f ".env" ]; then
    print_warning ".env Datei bereits vorhanden"
    read -p "Möchten Sie die .env Datei überschreiben? (j/N): " overwrite
    if [[ ! "$overwrite" =~ ^[Jj]$ ]]; then
        print_info "Behalte vorhandene .env Datei"
    else
        rm .env
    fi
fi

if [ ! -f ".env" ]; then
    print_info "Erstelle .env Datei..."
    
    # OpenAI API Key abfragen
    echo ""
    read -p "Bitte geben Sie Ihren OpenAI API Key ein: " openai_key
    if [ -z "$openai_key" ]; then
        print_error "OpenAI API Key ist erforderlich!"
        exit 1
    fi
    
    # n8n Passwort generieren oder abfragen
    echo ""
    read -p "Möchten Sie ein n8n Passwort automatisch generieren? (J/n): " gen_n8n_pass
    if [[ "$gen_n8n_pass" =~ ^[Nn]$ ]]; then
        read -sp "Bitte geben Sie ein n8n Passwort ein: " n8n_pass
        echo ""
    else
        n8n_pass=$(openssl rand -hex 16)
        print_info "n8n Passwort wurde generiert: $n8n_pass"
    fi
    
    # API Key generieren
    api_key=$(openssl rand -hex 32)
    print_info "API Key wurde generiert"
    
    # JWT Secret generieren
    jwt_secret=$(openssl rand -hex 32)
    
    # .env Datei erstellen
    cat > .env << EOF
# ============================================
# ERFORDERLICH
# ============================================
OPENAI_API_KEY=$openai_key
N8N_PASSWORD=$n8n_pass
API_KEY=$api_key

# ============================================
# URLs (Docker interne Namen)
# ============================================
N8N_BASE_URL=http://n8n:5678
MCP_SERVER_URL=http://mcp-server:7777
CHATGPT_AGENT_URL=http://chatgpt-agent:4000
CONNECTION_KEY_URL=http://connection-key:3000

# ============================================
# Server Ports
# ============================================
PORT=3000

# ============================================
# Authentication
# ============================================
AUTH_ENABLED=true
JWT_SECRET=$jwt_secret
JWT_EXPIRES_IN=24h

# ============================================
# CORS (anpassen wenn Domain vorhanden)
# ============================================
CORS_ORIGINS=*

# ============================================
# Environment
# ============================================
NODE_ENV=production
LOG_LEVEL=info
LOG_FORMAT=json

# ============================================
# Rate Limiting
# ============================================
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
EOF

    # Berechtigungen setzen
    chmod 600 .env
    print_success ".env Datei erstellt"
    
    # Wichtige Informationen anzeigen
    echo ""
    print_info "WICHTIG: Bitte notieren Sie sich folgende Werte:"
    echo "  - n8n Passwort: $n8n_pass"
    echo "  - API Key: $api_key"
    echo ""
    read -p "Drücken Sie Enter um fortzufahren..."
else
    print_success ".env Datei vorhanden"
fi

# ============================================
# Schritt 5: Firewall konfigurieren
# ============================================

print_header "Schritt 5: Firewall konfigurieren"

ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

print_success "Firewall konfiguriert"

# ============================================
# Schritt 6: Services starten
# ============================================

print_header "Schritt 6: Docker Services starten"

if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml nicht gefunden!"
    exit 1
fi

print_info "Services werden gebaut und gestartet..."
docker-compose down 2>/dev/null || true
docker-compose build
docker-compose up -d

print_success "Services gestartet"

# ============================================
# Schritt 7: Health Checks
# ============================================

print_header "Schritt 7: Health Checks"

print_info "Warte 10 Sekunden bis Services gestartet sind..."
sleep 10

# Connection-Key Server
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_success "Connection-Key Server: OK"
else
    print_error "Connection-Key Server: FEHLER"
fi

# ChatGPT-Agent
if curl -f http://localhost:4000/health > /dev/null 2>&1; then
    print_success "ChatGPT-Agent: OK"
else
    print_error "ChatGPT-Agent: FEHLER"
fi

# n8n
if curl -f http://localhost:5678/healthz > /dev/null 2>&1; then
    print_success "n8n: OK"
else
    print_warning "n8n: Nicht erreichbar (kann normal sein beim ersten Start)"
fi

# ============================================
# Schritt 8: Nginx Setup (Optional)
# ============================================

print_header "Schritt 8: Nginx Setup (Optional)"

read -p "Möchten Sie Nginx für Domain-Setup konfigurieren? (j/N): " setup_nginx

if [[ "$setup_nginx" =~ ^[Jj]$ ]]; then
    # Nginx installieren
    if ! command -v nginx &> /dev/null; then
        apt install -y nginx
        print_success "Nginx installiert"
    else
        print_success "Nginx bereits installiert"
    fi
    
    # Domain abfragen
    echo ""
    read -p "Bitte geben Sie Ihre Domain ein (z.B. yourdomain.com): " domain
    
    if [ -n "$domain" ]; then
        # Nginx Konfiguration erstellen
        cat > /etc/nginx/sites-available/mcp-system << EOF
# Connection-Key Server (API)
server {
    listen 80;
    server_name api.$domain;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# ChatGPT-Agent
server {
    listen 80;
    server_name agent.$domain;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# n8n
server {
    listen 80;
    server_name n8n.$domain;

    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

        # Symlink erstellen
        ln -sf /etc/nginx/sites-available/mcp-system /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        
        # Nginx testen
        if nginx -t; then
            systemctl restart nginx
            systemctl enable nginx
            print_success "Nginx konfiguriert"
            
            # SSL Setup anbieten
            echo ""
            read -p "Möchten Sie SSL-Zertifikate mit Let's Encrypt einrichten? (j/N): " setup_ssl
            
            if [[ "$setup_ssl" =~ ^[Jj]$ ]]; then
                apt install -y certbot python3-certbot-nginx
                certbot --nginx -d api.$domain
                certbot --nginx -d agent.$domain
                certbot --nginx -d n8n.$domain
                print_success "SSL-Zertifikate installiert"
            fi
        else
            print_error "Nginx Konfiguration fehlerhaft"
        fi
    else
        print_warning "Keine Domain angegeben, Nginx Setup übersprungen"
    fi
else
    print_info "Nginx Setup übersprungen"
fi

# ============================================
# Zusammenfassung
# ============================================

print_header "Setup abgeschlossen!"

echo -e "${GREEN}✅ Alle Services sind eingerichtet!${NC}"
echo ""
echo "Services:"
echo "  - Connection-Key: http://localhost:3000"
echo "  - ChatGPT-Agent:  http://localhost:4000"
echo "  - n8n:            http://localhost:5678"
echo ""
echo "Nützliche Befehle:"
echo "  - Logs anzeigen:  cd $PROJECT_DIR && docker-compose logs -f"
echo "  - Status:         cd $PROJECT_DIR && docker-compose ps"
echo "  - Neustart:       cd $PROJECT_DIR && docker-compose restart"
echo "  - Stoppen:        cd $PROJECT_DIR && docker-compose down"
echo ""
print_warning "WICHTIG: Notieren Sie sich Ihre Passwörter und API Keys!"
echo "  Diese finden Sie in: $PROJECT_DIR/.env"
echo ""

