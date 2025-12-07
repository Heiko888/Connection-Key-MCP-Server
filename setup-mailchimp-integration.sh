#!/bin/bash
# Setup Script für Mailchimp Integration

cd /opt/mcp-connection-key

echo "📧 Mailchimp Integration Setup"
echo "================================"
echo ""

# 1. Prüfe ob .env existiert
if [ ! -f .env ]; then
    echo "❌ .env Datei nicht gefunden!"
    exit 1
fi

# 2. Prüfe ob N8N_API_KEY bereits gesetzt ist
if grep -q "^N8N_API_KEY=" .env; then
    echo "✅ N8N_API_KEY bereits in .env vorhanden"
    echo "   Aktueller Wert: $(grep N8N_API_KEY .env | cut -d'=' -f2 | head -c 20)..."
else
    echo "⚠️  N8N_API_KEY fehlt in .env"
    read -p "Möchten Sie einen neuen API Key generieren? (j/N): " gen_key
    
    if [[ "$gen_key" =~ ^[Jj]$ ]]; then
        NEW_KEY=$(openssl rand -hex 32)
        echo "" >> .env
        echo "# n8n API Key für externe API-Calls" >> .env
        echo "N8N_API_KEY=$NEW_KEY" >> .env
        echo "✅ N8N_API_KEY generiert und zu .env hinzugefügt"
        echo "   API Key: $NEW_KEY"
        echo "   ⚠️  WICHTIG: Notieren Sie sich diesen Key!"
        echo "   Er wird für die Authentifizierung zwischen n8n und Ihrer Next.js App benötigt!"
    else
        echo "Bitte fügen Sie N8N_API_KEY manuell zu .env hinzu:"
        echo "  N8N_API_KEY=ihr-api-key-hier"
        exit 1
    fi
fi

echo ""
echo "📋 Nächste Schritte:"
echo ""
echo "1. ✅ n8n Environment Variable ist gesetzt"
echo ""
echo "2. 📥 n8n Workflow importieren:"
echo "   - Öffnen Sie n8n: http://IHR-SERVER-IP:5678"
echo "   - Gehen Sie zu Workflows → Import"
echo "   - Laden Sie die Datei: n8n-workflows/mailchimp-subscriber.json"
echo ""
echo "3. 🔗 Mailchimp Webhook einrichten:"
echo "   - Gehen Sie zu Mailchimp → Audience → Settings → Webhooks"
echo "   - URL: http://IHR-SERVER-IP:5678/webhook/mailchimp-confirmed"
echo "   - Events: 'Subscriber added'"
echo ""
echo "4. 🚀 Next.js API Route erstellen:"
echo "   - Siehe: MAILCHIMP_INTEGRATION.md"
echo "   - Route: /api/new-subscriber"
echo ""
echo "5. 🗃️  Supabase Tabelle erstellen:"
echo "   - Siehe: MAILCHIMP_INTEGRATION.md"
echo "   - SQL Script ausführen"
echo ""

# 3. n8n neu starten (damit ENV Variable geladen wird)
echo "🔄 Starte n8n neu, damit Environment Variable geladen wird..."
docker-compose restart n8n

echo ""
echo "✅ Setup abgeschlossen!"
echo ""
echo "📚 Vollständige Anleitung: MAILCHIMP_INTEGRATION.md"

