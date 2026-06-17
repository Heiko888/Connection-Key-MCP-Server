#!/bin/bash
# Testet DNS-Propagierung sofort

DOMAIN="n8n.werdemeisterdeinergedankenagent.de"
EXPECTED_IP="138.199.237.34"

echo "🔍 DNS-Propagierung prüfen"
echo "=========================="
echo ""

echo "Prüfe verschiedene DNS-Server..."
echo ""

# Google DNS
echo "1. Google DNS (8.8.8.8):"
GOOGLE=$(dig +short @8.8.8.8 $DOMAIN | tail -1)
if [ "$GOOGLE" = "$EXPECTED_IP" ]; then
    echo "   ✅ $GOOGLE - KORREKT!"
else
    echo "   ⏳ $GOOGLE - Noch nicht propagiert"
fi
echo ""

# Cloudflare DNS
echo "2. Cloudflare DNS (1.1.1.1):"
CF=$(dig +short @1.1.1.1 $DOMAIN | tail -1)
if [ "$CF" = "$EXPECTED_IP" ]; then
    echo "   ✅ $CF - KORREKT!"
else
    echo "   ⏳ $CF - Noch nicht propagiert"
fi
echo ""

# Lokaler DNS
echo "3. Lokaler DNS:"
LOCAL=$(dig +short $DOMAIN | tail -1)
if [ "$LOCAL" = "$EXPECTED_IP" ]; then
    echo "   ✅ $LOCAL - KORREKT!"
else
    echo "   ⏳ $LOCAL - Noch nicht propagiert"
fi
echo ""

# Zusammenfassung
echo "=========================="
if [ "$GOOGLE" = "$EXPECTED_IP" ] || [ "$CF" = "$EXPECTED_IP" ] || [ "$LOCAL" = "$EXPECTED_IP" ]; then
    echo "✅ DNS propagiert! HTTPS kann eingerichtet werden."
    echo ""
    echo "Nächster Schritt auf Hetzner Server:"
    echo "  cd /opt/mcp-connection-key"
    echo "  ./https-setup-final.sh"
else
    echo "⏳ DNS propagiert noch nicht"
    echo ""
    echo "Warten Sie 5-15 Minuten und prüfen Sie erneut:"
    echo "  dig +short n8n.werdemeisterdeinergedankenagent.de"
    echo ""
    echo "Oder verwenden Sie n8n direkt über IP:"
    echo "  http://138.199.237.34:5678"
fi
echo ""

