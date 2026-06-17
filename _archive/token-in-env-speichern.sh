#!/bin/bash

# Token in .env speichern - Einfachste Methode
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🔐 Token in .env speichern"
echo "=========================="
echo ""

# 1. Generiere Token
TOKEN=$(openssl rand -hex 32)

echo "Token generiert: $TOKEN"
echo ""

# 2. Speichere in .env
if [ -f ".env" ]; then
    if grep -q "AGENT_SYSTEM_TOKEN" .env; then
        sed -i "s/AGENT_SYSTEM_TOKEN=.*/AGENT_SYSTEM_TOKEN=$TOKEN/" .env
        echo "✅ Token in .env aktualisiert"
    else
        echo "AGENT_SYSTEM_TOKEN=$TOKEN" >> .env
        echo "✅ Token zu .env hinzugefügt"
    fi
else
    echo "AGENT_SYSTEM_TOKEN=$TOKEN" > .env
    echo "✅ .env erstellt"
fi

echo ""
echo "✅ Fertig! Token ist in .env gespeichert."
echo ""
echo "📝 Container neu starten:"
echo "   docker compose -f docker-compose.yml up -d frontend"
echo ""
