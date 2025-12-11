#!/bin/bash

# Füge AGENT_SYSTEM_TOKEN zur richtigen docker-compose Datei hinzu
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🔐 Füge AGENT_SYSTEM_TOKEN hinzu"
echo "================================="
echo ""

# 1. Finde die richtige docker-compose Datei
echo "1. Finde docker-compose Datei mit Frontend..."
echo "---------------------------------------------"

DOCKER_COMPOSE_FILE=""

# Prüfe docker-compose.yml
if [ -f "docker-compose.yml" ] && grep -q "frontend:" "docker-compose.yml"; then
    DOCKER_COMPOSE_FILE="docker-compose.yml"
    echo "   ✅ docker-compose.yml enthält Frontend"
# Prüfe docker-compose-redis-fixed.yml
elif [ -f "docker-compose-redis-fixed.yml" ]; then
    DOCKER_COMPOSE_FILE="docker-compose-redis-fixed.yml"
    echo "   ✅ docker-compose-redis-fixed.yml gefunden"
else
    echo "   ❌ Keine docker-compose Datei mit Frontend gefunden!"
    echo ""
    echo "   Verfügbare Dateien:"
    ls -la docker-compose* 2>/dev/null || echo "   Keine gefunden"
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
elif command -v node &> /dev/null; then
    TOKEN=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    echo "   ✅ Token generiert (Node.js)"
elif command -v python3 &> /dev/null; then
    TOKEN=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    echo "   ✅ Token generiert (Python)"
else
    echo "   ❌ Keine Methode gefunden"
    echo "   📝 Generiere manuell: openssl rand -hex 32"
    exit 1
fi

echo ""
echo "   Token: $TOKEN"
echo ""

# 3. Prüfe ob Token bereits in docker-compose existiert
echo "3. Prüfe docker-compose Datei..."
echo "-------------------------------"

if grep -q "AGENT_SYSTEM_TOKEN" "$DOCKER_COMPOSE_FILE"; then
    echo "   ✅ AGENT_SYSTEM_TOKEN bereits vorhanden"
    echo "   Aktueller Wert:"
    grep "AGENT_SYSTEM_TOKEN" "$DOCKER_COMPOSE_FILE" | head -1
else
    echo "   ⚠️  AGENT_SYSTEM_TOKEN fehlt - füge hinzu..."
    
    # Finde die richtige Stelle (nach NEXT_PUBLIC_READING_AGENT_URL oder MCP_SERVER_URL)
    if grep -q "NEXT_PUBLIC_READING_AGENT_URL" "$DOCKER_COMPOSE_FILE"; then
        sed -i "/NEXT_PUBLIC_READING_AGENT_URL:/a\\
      # System Auth Token (für /api/system/** Routen)\\
      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN:-$TOKEN}" "$DOCKER_COMPOSE_FILE"
        echo "   ✅ Token hinzugefügt (nach NEXT_PUBLIC_READING_AGENT_URL)"
    elif grep -q "NEXT_PUBLIC_MCP_SERVER_URL" "$DOCKER_COMPOSE_FILE"; then
        sed -i "/NEXT_PUBLIC_MCP_SERVER_URL:/a\\
      # System Auth Token (für /api/system/** Routen)\\
      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN:-$TOKEN}" "$DOCKER_COMPOSE_FILE"
        echo "   ✅ Token hinzugefügt (nach NEXT_PUBLIC_MCP_SERVER_URL)"
    else
        # Füge nach environment: hinzu
        sed -i "/environment:/a\\
      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN:-$TOKEN}" "$DOCKER_COMPOSE_FILE"
        echo "   ✅ Token hinzugefügt (nach environment:)"
    fi
fi

echo ""

# 4. Füge Token zu .env hinzu
echo "4. Füge Token zu .env hinzu..."
echo "-----------------------------"

if [ -f ".env" ]; then
    if grep -q "AGENT_SYSTEM_TOKEN" .env; then
        echo "   ⚠️  AGENT_SYSTEM_TOKEN existiert bereits in .env"
        read -p "   Überschreiben? (j/n): " OVERWRITE
        if [ "$OVERWRITE" = "j" ] || [ "$OVERWRITE" = "J" ] || [ "$OVERWRITE" = "y" ] || [ "$OVERWRITE" = "Y" ]; then
            sed -i "s/AGENT_SYSTEM_TOKEN=.*/AGENT_SYSTEM_TOKEN=$TOKEN/" .env
            echo "   ✅ Token in .env aktualisiert"
        else
            echo "   ⏭️  Token nicht überschrieben"
        fi
    else
        echo "AGENT_SYSTEM_TOKEN=$TOKEN" >> .env
        echo "   ✅ Token zu .env hinzugefügt"
    fi
else
    echo "   ⚠️  .env Datei nicht gefunden - erstelle sie..."
    echo "AGENT_SYSTEM_TOKEN=$TOKEN" > .env
    echo "   ✅ .env erstellt mit Token"
fi

echo ""

# 5. Zusammenfassung
echo "5. Zusammenfassung:"
echo "------------------"
echo ""
echo "✅ Token Setup abgeschlossen!"
echo ""
echo "📋 Token: $TOKEN"
echo "📁 Datei: $DOCKER_COMPOSE_FILE"
echo ""
echo "📝 Nächste Schritte:"
echo "   1. Container neu starten:"
echo "      docker compose -f $DOCKER_COMPOSE_FILE up -d frontend"
echo ""
echo "   2. Token testen:"
echo "      ./test-system-auth.sh"
echo ""
