#!/bin/bash
# DNS-Check für n8n Subdomain

DOMAIN="n8n.werdemeisterdeinergedankenagent.de"
EXPECTED_IP="138.199.237.34"
ALL_INKL_IP="85.13.143.66"

echo "🔍 DNS-Check für n8n"
echo "===================="
echo ""

# Verschiedene DNS-Server testen
echo "📡 Prüfe DNS-Propagierung..."
echo ""

# 1. Google DNS
echo "1. Google DNS (8.8.8.8):"
GOOGLE_IP=$(dig +short @8.8.8.8 $DOMAIN | tail -1)
echo "   → $GOOGLE_IP"
if [ "$GOOGLE_IP" = "$EXPECTED_IP" ]; then
    echo "   ✅ Korrekt"
elif [ "$GOOGLE_IP" = "$ALL_INKL_IP" ]; then
    echo "   ❌ Zeigt noch auf All-Inkl ($ALL_INKL_IP)"
else
    echo "   ⚠️  Unerwartete IP: $GOOGLE_IP"
fi
echo ""

# 2. Cloudflare DNS
echo "2. Cloudflare DNS (1.1.1.1):"
CF_IP=$(dig +short @1.1.1.1 $DOMAIN | tail -1)
echo "   → $CF_IP"
if [ "$CF_IP" = "$EXPECTED_IP" ]; then
    echo "   ✅ Korrekt"
elif [ "$CF_IP" = "$ALL_INKL_IP" ]; then
    echo "   ❌ Zeigt noch auf All-Inkl ($ALL_INKL_IP)"
else
    echo "   ⚠️  Unerwartete IP: $CF_IP"
fi
echo ""

# 3. Lokaler DNS
echo "3. Lokaler DNS:"
LOCAL_IP=$(dig +short $DOMAIN | tail -1)
echo "   → $LOCAL_IP"
if [ "$LOCAL_IP" = "$EXPECTED_IP" ]; then
    echo "   ✅ Korrekt"
elif [ "$LOCAL_IP" = "$ALL_INKL_IP" ]; then
    echo "   ❌ Zeigt noch auf All-Inkl ($ALL_INKL_IP)"
else
    echo "   ⚠️  Unerwartete IP: $LOCAL_IP"
fi
echo ""

# 4. HTTP Test
echo "4. HTTP-Erreichbarkeit:"
if curl -f -s -o /dev/null -w "%{http_code}" --max-time 5 http://$DOMAIN 2>/dev/null | grep -q "200\|301\|302"; then
    echo "   ✅ HTTP erreichbar"
elif curl -f -s -o /dev/null -w "%{http_code}" --max-time 5 http://$EXPECTED_IP:5678 2>/dev/null | grep -q "200\|301\|302"; then
    echo "   ✅ n8n läuft direkt auf IP:5678"
    echo "   ⚠️  Aber Domain zeigt noch nicht auf Server"
else
    echo "   ❌ Nicht erreichbar"
fi
echo ""

# Zusammenfassung
echo "===================="
echo "📋 Zusammenfassung:"
echo ""

if [ "$GOOGLE_IP" = "$EXPECTED_IP" ] || [ "$CF_IP" = "$EXPECTED_IP" ] || [ "$LOCAL_IP" = "$EXPECTED_IP" ]; then
    echo "✅ DNS propagiert! HTTPS kann eingerichtet werden."
    echo ""
    echo "Nächster Schritt:"
    echo "  ./https-setup-final.sh"
else
    echo "❌ DNS zeigt noch nicht auf Hetzner Server"
    echo ""
    echo "Mögliche Ursachen:"
    echo "  1. DNS-Eintrag in All-Inkl noch nicht erstellt"
    echo "  2. DNS-Propagierung dauert noch (kann bis zu 24h dauern)"
    echo "  3. Falscher DNS-Eintrag (zeigt auf $ALL_INKL_IP statt $EXPECTED_IP)"
    echo ""
    echo "Temporäre Lösung:"
    echo "  n8n direkt über IP verwenden: http://$EXPECTED_IP:5678"
    echo ""
    echo "Prüfen Sie in All-Inkl:"
    echo "  - Existiert A-Record 'n8n'?"
    echo "  - Zeigt er auf $EXPECTED_IP?"
fi
echo ""

