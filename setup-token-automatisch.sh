#!/bin/bash

# Automatisches Token Setup - Findet richtige docker-compose Datei
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🔐 Automatisches Token Setup"
echo "============================"
echo ""

# 1. Finde docker-compose Datei mit Frontend
echo "1. Finde docker-compose Datei..."
echo "--------------------------------"

DOCKER_COMPOSE_FILE=""

# Prüfe verschiedene Möglichkeiten
if [ -f "docker-compose.yml" ] && grep -q "frontend:" "docker-compose.yml"; then
    DOCKER_COMPOSE_FILE="docker-compose.yml"
    echo "   ✅ docker-compose.yml enthält Frontend"
elif [ -f "docker-compose-redis-fixed.yml" ]; then
    DOCKER_COMPOSE_FILE="docker-compose-redis-fixed.yml"
    echo "   ✅ docker-compose-redis-fixed.yml gefunden"
else
    echo "   ❌ Keine docker-compose Datei mit Frontend gefunden!"
    echo ""
    echo "   Verfügbare Dateien:"
    ls -la docker-compose* 2>/dev/null || echo "   Keine gefunden"
    echo ""
    echo "   📝 Bitte manuell prüfen:"
    echo "   ls -la docker-compose*"
    exit 1
fi

echo "   Verwende: $DOCKER_COMPOSE_FILE"
echo ""

# 2. Generiere Token
echo "2. Generiere Token..."
echo "-------------------"

if command -v openssl &> /dev/null; then
    TOKEN=$(openssl rand -hex 32)
    echo "   ✅ Token generiert (OpenSSL)"
else
    echo "   ❌ OpenSSL nicht gefunden"
    echo "   📝 Installiere: apt-get install openssl"
    echo "   Oder generiere manuell: openssl rand -hex 32"
    exit 1
fi

echo ""
echo "   Token: $TOKEN"
echo ""

# 3. Füge Token zu .env hinzu
echo "3. Speichere Token in .env..."
echo "----------------------------"

if [ -f ".env" ]; then
    if grep -q "AGENT_SYSTEM_TOKEN" .env; then
        echo "   ⚠️  AGENT_SYSTEM_TOKEN existiert bereits"
        sed -i "s/AGENT_SYSTEM_TOKEN=.*/AGENT_SYSTEM_TOKEN=$TOKEN/" .env
        echo "   ✅ Token aktualisiert"
    else
        echo "AGENT_SYSTEM_TOKEN=$TOKEN" >> .env
        echo "   ✅ Token hinzugefügt"
    fi
else
    echo "AGENT_SYSTEM_TOKEN=$TOKEN" > .env
    echo "   ✅ .env erstellt"
fi

echo ""

# 4. Prüfe ob Token in docker-compose Datei benötigt wird
echo "4. Prüfe docker-compose Datei..."
echo "-------------------------------"

if grep -q "AGENT_SYSTEM_TOKEN" "$DOCKER_COMPOSE_FILE"; then
    echo "   ✅ AGENT_SYSTEM_TOKEN bereits in $DOCKER_COMPOSE_FILE"
    echo "   Aktueller Wert:"
    grep "AGENT_SYSTEM_TOKEN" "$DOCKER_COMPOSE_FILE" | head -1
else
    echo "   ⚠️  AGENT_SYSTEM_TOKEN fehlt in $DOCKER_COMPOSE_FILE"
    echo "   📝 Füge manuell hinzu nach environment:"
    echo "      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN}"
    echo ""
    echo "   Oder führe aus:"
    echo "   ./add-token-to-correct-docker-compose.sh"
fi

echo ""

# 5. Zusammenfassung
echo "5. Zusammenfassung:"
echo "------------------"
echo ""
echo "✅ Token in .env gespeichert!"
echo ""
echo "📋 Token: $TOKEN"
echo "📁 docker-compose Datei: $DOCKER_COMPOSE_FILE"
echo ""
echo "📝 Nächste Schritte:"
echo "   1. Container neu starten:"
echo "      docker compose -f $DOCKER_COMPOSE_FILE up -d frontend"
echo ""
echo "   2. Token testen:"
echo "      TOKEN=\$(docker exec \$(docker ps -q -f name=frontend) env | grep AGENT_SYSTEM_TOKEN | cut -d'=' -f2)"
echo "      curl -X GET http://localhost:3000/api/system/agents/tasks -H \"x-agent-token: \$TOKEN\""
echo ""
