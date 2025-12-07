#!/bin/bash
# Behebt Certbot-Verifizierungsfehler

DOMAIN="n8n.werdemeisterdeinergedankenagent.de"
SERVER_IP="138.199.237.34"

echo "🔍 Problem analysieren..."
echo ""

# 1. DNS prüfen
echo "📡 DNS prüfen..."
DNS_IP=$(dig +short $DOMAIN | tail -1)
echo "DNS zeigt: $DNS_IP"
echo "Erwartet: $SERVER_IP"
echo ""

if [ "$DNS_IP" != "$SERVER_IP" ]; then
    echo "❌ DNS zeigt auf falsche IP!"
    echo "   Bitte prüfen Sie den DNS-Eintrag in All-Inkl:"
    echo "   n8n.werdemeisterdeinergedankenagent.de → $SERVER_IP"
    echo ""
    echo "   Aktuell zeigt DNS auf: $DNS_IP"
    exit 1
fi

# 2. Nginx prüfen
echo "🌐 Nginx Status..."
systemctl status nginx --no-pager | head -5
echo ""

# 3. Port 80 prüfen
echo "🔌 Port 80 prüfen..."
if netstat -tuln | grep -q ":80 "; then
    echo "✅ Port 80 ist offen"
else
    echo "❌ Port 80 ist nicht offen!"
    echo "   Prüfe Firewall..."
    ufw status | grep 80 || echo "   Port 80 nicht in Firewall erlaubt"
fi
echo ""

# 4. Nginx Konfiguration für ACME anpassen
echo "🔧 Nginx Konfiguration für ACME anpassen..."

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

# ACME-Verzeichnis erstellen
mkdir -p /var/www/html/.well-known/acme-challenge
chown -R www-data:www-data /var/www/html

# Nginx testen und neu laden
nginx -t && systemctl reload nginx
echo "✅ Nginx Konfiguration angepasst"
echo ""

# 5. Firewall prüfen
echo "🔥 Firewall prüfen..."
ufw allow 80/tcp
ufw allow 443/tcp
echo "✅ Firewall konfiguriert"
echo ""

# 6. Test von außen
echo "🌍 Test von außen..."
echo "Prüfe ob Domain erreichbar ist..."
curl -I http://$DOMAIN 2>&1 | head -5
echo ""

echo "✅ Vorbereitung abgeschlossen!"
echo ""
echo "Versuchen Sie jetzt erneut:"
echo "  certbot --nginx -d $DOMAIN"

