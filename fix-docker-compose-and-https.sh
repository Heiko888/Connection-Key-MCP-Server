#!/bin/bash
# Behebt docker-compose.yml und führt HTTPS Setup aus

set -e

echo "🔧 Fix docker-compose.yml und HTTPS Setup"
echo "=========================================="
echo ""

# 1. docker-compose.yml prüfen und korrigieren
echo "📝 Prüfe docker-compose.yml..."
cd /opt/mcp-connection-key

if grep -q "depends_on:" docker-compose.yml && grep -q "mcp-server" docker-compose.yml; then
    echo "⚠️  docker-compose.yml hat noch mcp-server Abhängigkeiten"
    echo "   Korrigiere..."
    
    # Backup erstellen
    cp docker-compose.yml docker-compose.yml.backup
    
    # Neue docker-compose.yml erstellen
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # n8n - Workflow Engine
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD:-change-me}
      - N8N_HOST=${N8N_HOST:-localhost}
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
    volumes:
      - n8n_data:/home/node/.n8n
    restart: unless-stopped
    networks:
      - app-network

  # ChatGPT-Agent - KI-Gehirn
  chatgpt-agent:
    build:
      context: .
      dockerfile: Dockerfile.agent
    container_name: chatgpt-agent
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - N8N_BASE_URL=http://n8n:5678
      - PORT=4000
    depends_on:
      - n8n
    restart: unless-stopped
    networks:
      - app-network

  # Connection-Key Server - Zentrale API
  connection-key:
    build:
      context: .
      dockerfile: Dockerfile.connection-key
    container_name: connection-key
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - CHATGPT_AGENT_URL=http://chatgpt-agent:4000
      - N8N_BASE_URL=http://n8n:5678
      - AUTH_ENABLED=${AUTH_ENABLED:-true}
      - API_KEY=${API_KEY:-}
      - CORS_ORIGINS=${CORS_ORIGINS:-*}
    depends_on:
      - chatgpt-agent
      - n8n
    restart: unless-stopped
    networks:
      - app-network

volumes:
  n8n_data:

networks:
  app-network:
    driver: bridge
EOF
    
    echo "✅ docker-compose.yml korrigiert"
else
    echo "✅ docker-compose.yml ist bereits korrekt"
fi
echo ""

# 2. HTTPS Setup
DOMAIN="n8n.werdemeisterdeinergedankenagent.de"
SERVER_IP="138.199.237.34"

echo "🔒 HTTPS Setup für n8n"
echo "======================"
echo ""

# DNS prüfen
echo "📡 Prüfe DNS..."
DNS_IP=$(dig +short @8.8.8.8 $DOMAIN | tail -1)
echo "DNS zeigt (Google DNS): $DNS_IP"
echo "Erwartet: $SERVER_IP"

if [ "$DNS_IP" != "$SERVER_IP" ]; then
    echo ""
    echo "❌ DNS zeigt auf falsche IP!"
    exit 1
fi

echo "✅ DNS korrekt (propagiert)"
echo ""

# Nginx installieren (falls nicht vorhanden)
if ! command -v nginx &> /dev/null; then
    echo "📦 Installiere Nginx..."
    apt update
    apt install -y nginx certbot python3-certbot-nginx
fi

# Nginx konfigurieren
echo "🌐 Konfiguriere Nginx..."
cat > /etc/nginx/sites-available/n8n << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # ACME Challenge für Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files \$uri =404;
    }

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

# ACME-Verzeichnis
mkdir -p /var/www/html/.well-known/acme-challenge
chown -R www-data:www-data /var/www/html

# Nginx testen und starten
nginx -t
systemctl start nginx
systemctl enable nginx
systemctl reload nginx
echo "✅ Nginx konfiguriert"
echo ""

# Firewall
echo "🔥 Konfiguriere Firewall..."
ufw allow 80/tcp
ufw allow 443/tcp
echo "✅ Firewall konfiguriert"
echo ""

# SSL-Zertifikat
echo "🔒 Erstelle SSL-Zertifikat..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@werdemeisterdeinergedankenagent.de --redirect

if [ $? -eq 0 ]; then
    echo "✅ SSL-Zertifikat erstellt"
else
    echo "❌ Certbot fehlgeschlagen!"
    echo "   Versuchen Sie manuell: certbot --nginx -d $DOMAIN"
    exit 1
fi
echo ""

# n8n Environment anpassen
echo "⚙️  Passe n8n Environment an..."
cd /opt/mcp-connection-key

# Alte Einträge entfernen
sed -i '/^N8N_HOST=/d' .env 2>/dev/null || true
sed -i '/^N8N_PROTOCOL=/d' .env 2>/dev/null || true
sed -i '/^WEBHOOK_URL=/d' .env 2>/dev/null || true
sed -i '/^N8N_SECURE_COOKIE=/d' .env 2>/dev/null || true

# Neue Einträge hinzufügen
echo "" >> .env
echo "# n8n HTTPS Konfiguration" >> .env
echo "N8N_HOST=$DOMAIN" >> .env
echo "N8N_PROTOCOL=https" >> .env
echo "WEBHOOK_URL=https://$DOMAIN/" >> .env
echo "N8N_SECURE_COOKIE=true" >> .env

echo "✅ Environment angepasst"
echo ""

# n8n neu starten
echo "🔄 Starte n8n neu..."
docker-compose restart n8n
sleep 10

# Status prüfen
if docker-compose ps | grep -q "n8n.*Up"; then
    echo "✅ n8n läuft"
else
    echo "⚠️  n8n Status unklar"
fi
echo ""

# Zusammenfassung
echo "================================"
echo "✅ Setup abgeschlossen!"
echo ""
echo "🌐 Ihre URLs:"
echo "  - n8n Interface:  https://$DOMAIN"
echo "  - Webhook URL:    https://$DOMAIN/webhook/mailchimp-confirmed"
echo ""
echo "🔐 Login:"
echo "  - Öffnen Sie: https://$DOMAIN"
echo "  - Verwenden Sie Ihre n8n Zugangsdaten"
echo ""
echo "🎉 Fertig!"
echo ""

