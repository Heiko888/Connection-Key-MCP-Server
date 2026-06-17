#!/bin/bash

# Füge AGENT_SYSTEM_TOKEN zu docker-compose.yml hinzu
# Führt lokal oder auf Server aus

echo "🔐 Füge AGENT_SYSTEM_TOKEN zu docker-compose.yml hinzu"
echo "======================================================"
echo ""

# 1. Generiere Token
echo "1. Generiere Token..."
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
    echo "   ❌ Keine Methode gefunden - generiere manuell:"
    echo "      openssl rand -hex 32"
    exit 1
fi

echo ""
echo "   Token: $TOKEN"
echo ""

# 2. Prüfe welche docker-compose Datei verwendet wird
echo "2. Prüfe docker-compose Dateien..."
echo "----------------------------------"

DOCKER_COMPOSE_FILE=""

if [ -f "docker-compose-redis-fixed.yml" ]; then
    DOCKER_COMPOSE_FILE="docker-compose-redis-fixed.yml"
    echo "   ✅ docker-compose-redis-fixed.yml gefunden"
elif [ -f "docker-compose.yml" ]; then
    DOCKER_COMPOSE_FILE="docker-compose.yml"
    echo "   ✅ docker-compose.yml gefunden"
else
    echo "   ❌ Keine docker-compose Datei gefunden!"
    exit 1
fi

echo ""

# 3. Prüfe ob Token bereits existiert
echo "3. Prüfe ob Token bereits existiert..."
echo "--------------------------------------"

if grep -q "AGENT_SYSTEM_TOKEN" "$DOCKER_COMPOSE_FILE"; then
    echo "   ⚠️  AGENT_SYSTEM_TOKEN existiert bereits"
    echo ""
    echo "   Aktueller Wert:"
    grep "AGENT_SYSTEM_TOKEN" "$DOCKER_COMPOSE_FILE" | head -1
    echo ""
    read -p "   Überschreiben? (j/n): " OVERWRITE
    if [ "$OVERWRITE" != "j" ] && [ "$OVERWRITE" != "J" ] && [ "$OVERWRITE" != "y" ] && [ "$OVERWRITE" != "Y" ]; then
        echo "   ❌ Abgebrochen"
        exit 0
    fi
    
    # Überschreibe existierenden Token
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/AGENT_SYSTEM_TOKEN:.*/AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN:-$TOKEN}/" "$DOCKER_COMPOSE_FILE"
    else
        # Linux
        sed -i "s/AGENT_SYSTEM_TOKEN:.*/AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN:-$TOKEN}/" "$DOCKER_COMPOSE_FILE"
    fi
    echo "   ✅ Token aktualisiert"
else
    # Füge Token hinzu
    echo "   ✅ Token wird hinzugefügt"
    
    # Finde Frontend-Service und füge Token hinzu
    if grep -q "frontend:" "$DOCKER_COMPOSE_FILE"; then
        # Füge nach READING_AGENT_URL oder MCP_SERVER_URL hinzu
        if grep -q "READING_AGENT_URL" "$DOCKER_COMPOSE_FILE"; then
            # Füge nach READING_AGENT_URL hinzu
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "/NEXT_PUBLIC_READING_AGENT_URL:/a\\
      # System Auth Token (für /api/system/** Routen)\\
      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN:-$TOKEN}
" "$DOCKER_COMPOSE_FILE"
            else
                # Linux
                sed -i "/NEXT_PUBLIC_READING_AGENT_URL:/a\\
      # System Auth Token (für /api/system/** Routen)\\
      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN:-$TOKEN}" "$DOCKER_COMPOSE_FILE"
            fi
            echo "   ✅ Token zu Frontend-Service hinzugefügt (nach READING_AGENT_URL)"
        elif grep -q "MCP_SERVER_URL" "$DOCKER_COMPOSE_FILE"; then
            # Füge nach MCP_SERVER_URL hinzu
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "/NEXT_PUBLIC_MCP_SERVER_URL:/a\\
      # System Auth Token (für /api/system/** Routen)\\
      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN:-$TOKEN}
" "$DOCKER_COMPOSE_FILE"
            else
                # Linux
                sed -i "/NEXT_PUBLIC_MCP_SERVER_URL:/a\\
      # System Auth Token (für /api/system/** Routen)\\
      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN:-$TOKEN}" "$DOCKER_COMPOSE_FILE"
            fi
            echo "   ✅ Token zu Frontend-Service hinzugefügt (nach MCP_SERVER_URL)"
        else
            # Füge in environment Sektion hinzu (nach OPENAI_API_KEY)
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "/OPENAI_API_KEY:/a\\
      # System Auth Token (für /api/system/** Routen)\\
      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN:-$TOKEN}
" "$DOCKER_COMPOSE_FILE"
            else
                sed -i "/OPENAI_API_KEY:/a\\
      # System Auth Token (für /api/system/** Routen)\\
      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN:-$TOKEN}" "$DOCKER_COMPOSE_FILE"
            fi
            echo "   ✅ Token zu environment hinzugefügt (nach OPENAI_API_KEY)"
        fi
    else
        echo "   ⚠️  Frontend-Service nicht gefunden"
        echo "   📝 Füge manuell hinzu:"
        echo "      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN:-$TOKEN}"
    fi
fi

echo ""

# 4. Zeige Ergebnis
echo "4. Prüfe Ergebnis..."
echo "-------------------"
if grep -q "AGENT_SYSTEM_TOKEN" "$DOCKER_COMPOSE_FILE"; then
    echo "   ✅ Token in $DOCKER_COMPOSE_FILE gefunden:"
    grep "AGENT_SYSTEM_TOKEN" "$DOCKER_COMPOSE_FILE" | head -1
else
    echo "   ⚠️  Token nicht gefunden - bitte manuell hinzufügen"
fi
echo ""

# 5. Optional: In .env Datei speichern
if [ -f ".env" ]; then
    echo "5. Prüfe .env Datei..."
    echo "---------------------"
    
    if grep -q "AGENT_SYSTEM_TOKEN" .env; then
        echo "   ⚠️  AGENT_SYSTEM_TOKEN existiert bereits in .env"
        read -p "   Überschreiben? (j/n): " OVERWRITE_ENV
        if [ "$OVERWRITE_ENV" = "j" ] || [ "$OVERWRITE_ENV" = "J" ] || [ "$OVERWRITE_ENV" = "y" ] || [ "$OVERWRITE_ENV" = "Y" ]; then
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s/AGENT_SYSTEM_TOKEN=.*/AGENT_SYSTEM_TOKEN=$TOKEN/" .env
            else
                sed -i "s/AGENT_SYSTEM_TOKEN=.*/AGENT_SYSTEM_TOKEN=$TOKEN/" .env
            fi
            echo "   ✅ Token in .env aktualisiert"
        fi
    else
        echo "   AGENT_SYSTEM_TOKEN=$TOKEN" >> .env
        echo "   ✅ Token zu .env hinzugefügt"
    fi
    echo ""
fi

# 6. Zusammenfassung
echo "6. Zusammenfassung:"
echo "------------------"
echo ""
echo "✅ Token generiert und hinzugefügt!"
echo ""
echo "📋 Token: $TOKEN"
echo ""
echo "📝 Nächste Schritte:"
echo "   1. Container neu starten:"
echo "      docker compose -f $DOCKER_COMPOSE_FILE up -d frontend"
echo ""
echo "   2. Token testen:"
echo "      curl -X GET http://localhost:3000/api/system/agents/tasks \\"
echo "        -H \"x-agent-token: $TOKEN\""
echo ""
echo "🔒 Sicherheitshinweise:"
echo "   - Token niemals in Git committen"
echo "   - Token nur in docker-compose.yml oder .env"
echo "   - Token regelmäßig rotieren (alle 90 Tage)"
echo ""
