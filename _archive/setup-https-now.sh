#!/bin/bash

# ============================================
# HTTPS Setup für n8n - Sofort ausführen
# ============================================
# Domain: n8n.werdemeisterdeinergedankenagent.de
# Server-IP: 138.199.237.34
# ============================================

set -e

DOMAIN="n8n.werdemeisterdeinergedankenagent.de"
SERVER_IP="138.199.237.34"

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Prüfen ob als root
if [ "$EUID" -ne 0 ]; then 
    print_error "Bitte als root ausführen (sudo ./setup-https-now.sh)"
    exit 1
fi

print_header "HTTPS Setup für n8n"
print_info "Domain: $DOMAIN"
print_info "Server-IP: $SERVER_IP"
echo ""

# Schritt 1: DNS prüfen
print_header "Schritt 1: DNS prüfen"

DNS_IP=$(dig +short $DOMAIN | tail -1)
print_info "DNS zeigt: $DNS_IP"

if [ "$DNS_IP" != "$SERVER_IP" ]; then
    print_warning "DNS zeigt nicht die Server-IP!"
    print_info "Erwartet: $SERVER_IP"
    print_info "Gefunden: $DNS_IP"
    echo ""
    read -p "Möchten Sie trotzdem fortfahren? (j/N): " continue_dns
    if [[ ! "$continue_dns" =~ ^[Jj]$ ]]; then
        print_error "Bitte warten Sie bis DNS propagiert ist"
        exit 1
    fi
else
    print_success "DNS korrekt: $DOMAIN → $DNS_IP"
fi

# Schritt 2: Nginx installieren
print_header "Schritt 2: Nginx installieren"

if command -v nginx &> /dev/null; then
    print_success "Nginx bereits installiert"
else
    print_info "Nginx wird installiert..."
    apt update
    apt install -y nginx
    print_success "Nginx installiert"
fi

# Certbot installieren
if command -v certbot &> /dev/null; then
    print_success "Certbot bereits installiert"
else
    print_info "Certbot wird installiert..."
    apt install -y certbot python3-certbot-nginx
    print_success "Certbot installiert"
fi

# Nginx starten
systemctl start nginx
systemctl enable nginx
print_success "Nginx gestartet"

# Schritt 3: Nginx Konfiguration
print_header "Schritt 3: Nginx Konfiguration erstellen"

cat > /etc/nginx/sites-available/n8n << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# Symlink erstellen
ln -sf /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Nginx testen
if nginx -t; then
    print_success "Nginx Konfiguration OK"
    systemctl reload nginx
else
    print_error "Nginx Konfiguration fehlerhaft!"
    exit 1
fi

# Schritt 4: SSL-Zertifikat
print_header "Schritt 4: SSL-Zertifikat erstellen"

print_info "Certbot wird jetzt ausgeführt..."
print_warning "Sie werden nach E-Mail-Adresse gefragt (optional)"

# Certbot mit automatischer E-Mail (kann angepasst werden)
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@werdemeisterdeinergedankenagent.de --redirect || {
    print_error "Certbot fehlgeschlagen!"
    print_info "Versuchen Sie es manuell: certbot --nginx -d $DOMAIN"
    exit 1
}

print_success "SSL-Zertifikat erstellt"

# Schritt 5: n8n Environment anpassen
print_header "Schritt 5: n8n Environment anpassen"

cd /opt/mcp-connection-key

if [ ! -f .env ]; then
    print_error ".env Datei nicht gefunden!"
    exit 1
fi

# Alte HTTP-Einstellungen entfernen
sed -i '/^N8N_HOST=/d' .env
sed -i '/^N8N_PROTOCOL=/d' .env
sed -i '/^WEBHOOK_URL=/d' .env
sed -i '/^N8N_SECURE_COOKIE=/d' .env

# Neue HTTPS-Einstellungen hinzufügen
echo "" >> .env
echo "# n8n HTTPS Konfiguration" >> .env
echo "N8N_HOST=$DOMAIN" >> .env
echo "N8N_PROTOCOL=https" >> .env
echo "WEBHOOK_URL=https://$DOMAIN/" >> .env
echo "N8N_SECURE_COOKIE=true" >> .env

print_success "n8n Environment angepasst"

# Schritt 6: n8n neu starten
print_header "Schritt 6: n8n neu starten"

docker-compose restart n8n

print_info "Warte 10 Sekunden..."
sleep 10

# Status prüfen
if docker-compose ps | grep -q "n8n.*Up"; then
    print_success "n8n läuft"
else
    print_warning "n8n Status unklar, prüfen Sie: docker-compose ps"
fi

# Schritt 7: Auto-Renewal prüfen
print_header "Schritt 7: SSL Auto-Renewal prüfen"

if certbot renew --dry-run > /dev/null 2>&1; then
    print_success "Auto-Renewal funktioniert"
else
    print_warning "Auto-Renewal Test fehlgeschlagen (kann normal sein)"
fi

# Zusammenfassung
print_header "✅ Setup abgeschlossen!"

echo ""
print_success "HTTPS ist jetzt eingerichtet!"
echo ""
echo "Ihre URLs:"
echo "  - n8n Interface:  https://$DOMAIN"
echo "  - Webhook URL:    https://$DOMAIN/webhook/mailchimp-confirmed"
echo ""
echo "Nächste Schritte:"
echo "  1. Öffnen Sie: https://$DOMAIN"
echo "  2. Login mit Ihren n8n Zugangsdaten"
echo "  3. Mailchimp Webhook URL aktualisieren auf:"
echo "     https://$DOMAIN/webhook/mailchimp-confirmed"
echo ""
print_success "Fertig! 🎉"
echo ""

