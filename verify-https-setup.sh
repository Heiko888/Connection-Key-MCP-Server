#!/bin/bash
# Prüft ob HTTPS für n8n funktioniert

DOMAIN="n8n.werdemeisterdeinergedankenagent.de"

echo "🔍 HTTPS Setup prüfen"
echo "====================="
echo ""

# 1. HTTP Test
echo "1. HTTP erreichbar?"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "   ✅ HTTP funktioniert ($HTTP_CODE)"
else
    echo "   ⚠️  HTTP Code: $HTTP_CODE"
fi
echo ""

# 2. HTTPS Test
echo "2. HTTPS erreichbar?"
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN 2>/dev/null || echo "000")
if [ "$HTTPS_CODE" = "200" ] || [ "$HTTPS_CODE" = "301" ] || [ "$HTTPS_CODE" = "302" ]; then
    echo "   ✅ HTTPS funktioniert ($HTTPS_CODE)"
else
    echo "   ❌ HTTPS Code: $HTTPS_CODE"
fi
echo ""

# 3. SSL-Zertifikat
echo "3. SSL-Zertifikat?"
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "   ✅ SSL-Zertifikat vorhanden"
    CERT_EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/$DOMAIN/cert.pem 2>/dev/null | cut -d= -f2)
    echo "   Ablaufdatum: $CERT_EXPIRY"
else
    echo "   ❌ SSL-Zertifikat nicht gefunden"
fi
echo ""

# 4. n8n Container
echo "4. n8n Container?"
cd /opt/mcp-connection-key
if docker-compose ps | grep -q "n8n.*Up"; then
    echo "   ✅ n8n Container läuft"
else
    echo "   ❌ n8n Container läuft nicht"
fi
echo ""

# 5. n8n Environment
echo "5. n8n Environment?"
if grep -q "N8N_PROTOCOL=https" .env 2>/dev/null; then
    echo "   ✅ HTTPS in .env konfiguriert"
    echo "   N8N_HOST=$(grep N8N_HOST .env | cut -d= -f2)"
    echo "   N8N_PROTOCOL=$(grep N8N_PROTOCOL .env | cut -d= -f2)"
else
    echo "   ⚠️  HTTPS nicht in .env konfiguriert"
fi
echo ""

# Zusammenfassung
echo "====================="
echo "📋 Zusammenfassung:"
echo ""
if [ "$HTTPS_CODE" = "200" ] || [ "$HTTPS_CODE" = "301" ] || [ "$HTTPS_CODE" = "302" ]; then
    echo "✅ HTTPS ist eingerichtet!"
    echo ""
    echo "🌐 Ihre URLs:"
    echo "   - n8n: https://$DOMAIN"
    echo "   - Webhook: https://$DOMAIN/webhook/mailchimp-confirmed"
    echo ""
    echo "🎉 Alles funktioniert!"
else
    echo "⚠️  HTTPS Setup noch nicht vollständig"
    echo ""
    echo "Prüfen Sie:"
    echo "   1. SSL-Zertifikat erstellt?"
    echo "   2. Nginx konfiguriert?"
    echo "   3. n8n Environment angepasst?"
fi
echo ""

