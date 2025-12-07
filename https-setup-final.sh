#!/bin/bash
# Finales HTTPS Setup für n8n - Nach DNS-Eintrag

set -e

DOMAIN="n8n.werdemeisterdeinergedankenagent.de"
SERVER_IP="138.199.237.34"

echo "🔒 HTTPS Setup für n8n - Final"
echo "================================"
echo ""

# 1. DNS prüfen (mit Google DNS, da lokaler DNS-Cache veraltet sein kann)
echo "📡 Prüfe DNS..."
DNS_IP=$(dig +short @8.8.8.8 $DOMAIN | tail -1)
echo "DNS zeigt (Google DNS): $DNS_IP"
echo "Erwartet: $SERVER_IP"

if [ "$DNS_IP" != "$SERVER_IP" ]; then
    echo ""
    echo "❌ DNS zeigt auf falsche IP!"
    echo "   Bitte warten Sie bis DNS propagiert ist (5-15 Min)"
    echo "   Oder prüfen Sie den DNS-Eintrag in All-Inkl"
    exit 1
fi

echo "✅ DNS korrekt (propagiert)"
echo ""

# 2. Nginx für ACME konfigurieren
echo "🌐 Konfiguriere Nginx für ACME-Challenge..."
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

# ACME-Verzeichnis
mkdir -p /var/www/html/.well-known/acme-challenge
chown -R www-data:www-data /var/www/html

# Nginx testen und neu laden
nginx -t
systemctl reload nginx
echo "✅ Nginx konfiguriert"
echo ""

# 3. Firewall
echo "🔥 Konfiguriere Firewall..."
ufw allow 80/tcp
ufw allow 443/tcp
echo "✅ Firewall konfiguriert"
echo ""

# 4. SSL-Zertifikat
echo "🔒 Erstelle SSL-Zertifikat..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@werdemeisterdeinergedankenagent.de --redirect

if [ $? -eq 0 ]; then
    echo "✅ SSL-Zertifikat erstellt"
else
    echo "❌ Certbot fehlgeschlagen!"
    echo "   Versuchen Sie: certbot --nginx -d $DOMAIN"
    exit 1
fi
echo ""

# 5. n8n Environment anpassen
echo "⚙️  Passe n8n Environment an..."
cd /opt/mcp-connection-key

# Alte Einträge entfernen
sed -i '/^N8N_HOST=/d' .env
sed -i '/^N8N_PROTOCOL=/d' .env
sed -i '/^WEBHOOK_URL=/d' .env
sed -i '/^N8N_SECURE_COOKIE=/d' .env

# Neue Einträge hinzufügen
echo "" >> .env
echo "# n8n HTTPS Konfiguration" >> .env
echo "N8N_HOST=$DOMAIN" >> .env
echo "N8N_PROTOCOL=https" >> .env
echo "WEBHOOK_URL=https://$DOMAIN/" >> .env
echo "N8N_SECURE_COOKIE=true" >> .env

echo "✅ Environment angepasst"
echo ""

# 6. n8n neu starten
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

# 7. Auto-Renewal testen
echo "🔄 Teste SSL Auto-Renewal..."
certbot renew --dry-run > /dev/null 2>&1 && echo "✅ Auto-Renewal OK" || echo "⚠️  Auto-Renewal Test fehlgeschlagen (kann normal sein)"
echo ""

# Zusammenfassung
echo "================================"
echo "✅ HTTPS Setup abgeschlossen!"
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

