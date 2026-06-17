#!/bin/bash
# Prüft HTTPS Status für n8n

DOMAIN="n8n.werdemeisterdeinergedankenagent.de"
SERVER_IP="138.199.237.34"

echo "🔍 HTTPS Status prüfen"
echo "======================"
echo ""

# 1. DNS prüfen
echo "📡 DNS prüfen..."
DNS_IP=$(dig +short $DOMAIN | tail -1)
echo "Domain: $DOMAIN"
echo "DNS zeigt: $DNS_IP"
echo "Erwartet: $SERVER_IP"

if [ "$DNS_IP" = "$SERVER_IP" ]; then
    echo "✅ DNS korrekt"
else
    echo "❌ DNS zeigt auf falsche IP!"
    echo "   Bitte prüfen Sie den DNS-Eintrag in All-Inkl"
fi
echo ""

# 2. HTTP erreichbar?
echo "🌐 HTTP erreichbar?"
if curl -f -s -o /dev/null -w "%{http_code}" http://$DOMAIN | grep -q "200\|301\|302"; then
    echo "✅ HTTP erreichbar"
else
    echo "❌ HTTP nicht erreichbar"
fi
echo ""

# 3. HTTPS erreichbar?
echo "🔒 HTTPS erreichbar?"
if curl -f -s -o /dev/null -w "%{http_code}" https://$DOMAIN 2>/dev/null | grep -q "200\|301\|302"; then
    echo "✅ HTTPS erreichbar"
    SSL_INFO=$(echo | openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
    if [ ! -z "$SSL_INFO" ]; then
        echo "   SSL-Zertifikat gefunden"
    fi
else
    echo "❌ HTTPS nicht erreichbar"
    echo "   SSL-Zertifikat fehlt oder nicht konfiguriert"
fi
echo ""

# 4. Nginx Status
echo "🌐 Nginx Status..."
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx läuft"
    
    # Prüfe ob n8n Konfiguration existiert
    if [ -f "/etc/nginx/sites-available/n8n" ] || [ -f "/etc/nginx/sites-enabled/n8n" ]; then
        echo "✅ n8n Nginx-Konfiguration gefunden"
    else
        echo "⚠️  n8n Nginx-Konfiguration nicht gefunden"
    fi
else
    echo "❌ Nginx läuft nicht"
fi
echo ""

# 5. Certbot Status
echo "🔒 SSL-Zertifikat Status..."
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "✅ SSL-Zertifikat vorhanden"
    CERT_EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/$DOMAIN/cert.pem 2>/dev/null | cut -d= -f2)
    echo "   Ablaufdatum: $CERT_EXPIRY"
else
    echo "❌ SSL-Zertifikat nicht gefunden"
fi
echo ""

# 6. n8n Container
echo "🐳 n8n Container Status..."
cd /opt/mcp-connection-key 2>/dev/null || cd /root
if docker-compose ps 2>/dev/null | grep -q "n8n.*Up"; then
    echo "✅ n8n Container läuft"
else
    echo "⚠️  n8n Container Status unklar"
fi
echo ""

# 7. Zusammenfassung
echo "======================"
echo "📋 Zusammenfassung:"
echo ""
echo "Korrekte URLs:"
echo "  - HTTP:  http://$DOMAIN"
echo "  - HTTPS: https://$DOMAIN"
echo "  - Setup: https://$DOMAIN/setup"
echo ""
echo "Falls HTTPS nicht funktioniert:"
echo "  1. DNS prüfen (sollte $SERVER_IP zeigen)"
echo "  2. HTTPS Setup ausführen: ./https-setup-final.sh"
echo ""

