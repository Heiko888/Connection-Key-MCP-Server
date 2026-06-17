#!/bin/bash

# 🔑 N8N_API_KEY setzen
# Generiert einen neuen N8N_API_KEY und trägt ihn in .env ein

set -e

echo "🔑 N8N_API_KEY setzen"
echo "=========================================="
echo ""

cd /opt/mcp-connection-key

# Prüfe ob .env existiert
if [ ! -f ".env" ]; then
  echo "❌ .env Datei nicht gefunden!"
  echo "   Erstelle .env Datei..."
  touch .env
fi

# Prüfe ob N8N_API_KEY bereits existiert
if grep -q "^N8N_API_KEY=" .env 2>/dev/null; then
  EXISTING_KEY=$(grep "^N8N_API_KEY=" .env | cut -d= -f2 | sed 's/^"//;s/"$//')
  if [ ! -z "$EXISTING_KEY" ] && [ "$EXISTING_KEY" != "" ]; then
    echo "⚠️  N8N_API_KEY existiert bereits!"
    echo ""
    echo "Aktueller Key: ${EXISTING_KEY:0:20}..."
    echo ""
    read -p "Möchten Sie einen neuen Key generieren? (j/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[JjYy]$ ]]; then
      echo "✅ Behalte bestehenden Key"
      echo ""
      echo "=========================================="
      echo "📋 N8N_API_KEY (für n8n Environment Variables):"
      echo "=========================================="
      echo "$EXISTING_KEY"
      echo "=========================================="
      echo ""
      echo "📋 Nächste Schritte:"
      echo "1. n8n öffnen: https://n8n.werdemeisterdeinergedankenagent.de"
      echo "2. Settings → Environment Variables"
      echo "3. Variable hinzufügen:"
      echo "   Name: N8N_API_KEY"
      echo "   Value: $EXISTING_KEY"
      echo "4. Save"
      exit 0
    fi
    echo "🔄 Generiere neuen Key..."
  fi
else
  echo "📝 N8N_API_KEY nicht gefunden, erstelle neuen..."
fi

# Generiere neuen Key
N8N_KEY=$(openssl rand -hex 32)

# Entferne alte N8N_API_KEY Zeile (falls vorhanden)
sed -i '/^N8N_API_KEY=/d' .env

# Füge neuen Key hinzu
echo "" >> .env
echo "# n8n API Key für externe API-Calls (z.B. Mailchimp Workflow)" >> .env
echo "N8N_API_KEY=$N8N_KEY" >> .env

echo "✅ N8N_API_KEY erfolgreich generiert und in .env eingetragen!"
echo ""

# Zeige Key
echo "=========================================="
echo "⚠️  WICHTIG: Notieren Sie sich diesen Key!"
echo "=========================================="
echo "N8N_API_KEY=$N8N_KEY"
echo "=========================================="
echo ""

# Nächste Schritte
echo "📋 Nächste Schritte:"
echo ""
echo "1. ✅ Key ist in .env eingetragen"
echo ""
echo "2. 🔧 In n8n Environment Variables eintragen:"
echo "   a) n8n öffnen: https://n8n.werdemeisterdeinergedankenagent.de"
echo "   b) Settings → Environment Variables"
echo "   c) 'Add Variable' klicken"
echo "   d) Name: N8N_API_KEY"
echo "   e) Value: $N8N_KEY"
echo "   f) Save"
echo ""
echo "3. ✅ Workflow aktivieren (falls noch nicht geschehen)"
echo "   - Mailchimp Subscriber → ConnectionKey"
echo "   - Active Toggle = GRÜN"
echo ""

# Optional: Prüfe ob Next.js .env.local existiert
if [ -f "integration/frontend/.env.local" ]; then
  echo "4. 📝 Optional: In Next.js .env.local eintragen:"
  echo "   cd integration/frontend"
  echo "   echo 'N8N_API_KEY=$N8N_KEY' >> .env.local"
  echo ""
fi

echo "✅ Fertig!"
echo ""
