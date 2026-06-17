#!/bin/bash
# Finalisiert Mailchimp Integration

set -e

echo "📧 Mailchimp Integration finalisieren"
echo "========================================="
echo ""

cd /opt/mcp-connection-key

# 1. N8N_API_KEY prüfen/setzen
echo "🔐 Schritt 1: N8N_API_KEY prüfen..."
if grep -q "N8N_API_KEY=" .env 2>/dev/null; then
    N8N_KEY=$(grep "N8N_API_KEY=" .env | cut -d= -f2)
    if [ ! -z "$N8N_KEY" ] && [ "$N8N_KEY" != "" ]; then
        echo "✅ N8N_API_KEY bereits gesetzt"
        echo "   Key: ${N8N_KEY:0:20}..."
    else
        echo "⚠️  N8N_API_KEY ist leer, erstelle neuen..."
        N8N_KEY=$(openssl rand -hex 32)
        sed -i '/^N8N_API_KEY=/d' .env
        echo "" >> .env
        echo "# n8n API Key für externe API-Calls" >> .env
        echo "N8N_API_KEY=$N8N_KEY" >> .env
        echo "✅ Neuer N8N_API_KEY erstellt"
    fi
else
    echo "⚠️  N8N_API_KEY nicht gefunden, erstelle..."
    N8N_KEY=$(openssl rand -hex 32)
    echo "" >> .env
    echo "# n8n API Key für externe API-Calls" >> .env
    echo "N8N_API_KEY=$N8N_KEY" >> .env
    echo "✅ N8N_API_KEY erstellt"
fi

# Key anzeigen
echo ""
echo "=========================================="
echo "⚠️  WICHTIG: Notieren Sie sich diesen Key!"
echo "=========================================="
echo "N8N_API_KEY=$N8N_KEY"
echo "=========================================="
echo ""
echo "Dieser Key wird auch in Next.js .env.local benötigt!"
echo ""

# 2. n8n neu starten
echo "🔄 Starte n8n neu..."
docker-compose restart n8n
sleep 5

# Status prüfen
if docker-compose ps | grep -q "n8n.*Up"; then
    echo "✅ n8n läuft"
else
    echo "⚠️  n8n Status unklar"
fi
echo ""

# 3. Webhook-URL anzeigen
DOMAIN="n8n.werdemeisterdeinergedankenagent.de"
WEBHOOK_URL="https://$DOMAIN/webhook/mailchimp-confirmed"

echo "=========================================="
echo "📋 Nächste Schritte:"
echo "=========================================="
echo ""
echo "1. n8n öffnen:"
echo "   https://$DOMAIN"
echo ""
echo "2. Workflow importieren:"
echo "   - Workflows → Import from File"
echo "   - Datei: n8n-workflows/mailchimp-subscriber.json"
echo ""
echo "3. Webhook-URL für Mailchimp:"
echo "   $WEBHOOK_URL"
echo ""
echo "4. In Mailchimp konfigurieren:"
echo "   - Audience → Settings → Webhooks"
echo "   - Create A Webhook"
echo "   - URL: $WEBHOOK_URL"
echo "   - Events: subscribe"
echo ""
echo "5. N8N_API_KEY in Next.js .env.local setzen:"
echo "   N8N_API_KEY=$N8N_KEY"
echo ""
echo "6. Workflow in n8n aktivieren (Toggle oben rechts)"
echo ""
echo "=========================================="
echo "✅ Setup abgeschlossen!"
echo ""

