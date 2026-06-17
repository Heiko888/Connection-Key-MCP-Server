#!/bin/bash

# Komplettes Setup: Token generieren + zu docker-compose hinzufügen
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🔐 System Token - Komplettes Setup"
echo "==================================="
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
    echo "   ❌ Keine Methode gefunden"
    echo "   📝 Generiere manuell: openssl rand -hex 32"
    exit 1
fi

echo ""
echo "   Token: $TOKEN"
echo ""

# 2. Prüfe docker-compose Datei
echo "2. Prüfe docker-compose Datei..."
echo "-------------------------------"

DOCKER_COMPOSE_FILE="docker-compose-redis-fixed.yml"

if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
    echo "   ❌ $DOCKER_COMPOSE_FILE nicht gefunden!"
    exit 1
fi

echo "   ✅ $DOCKER_COMPOSE_FILE gefunden"
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
    sed -i "s/AGENT_SYSTEM_TOKEN:.*/AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN:-$TOKEN}/" "$DOCKER_COMPOSE_FILE"
    echo "   ✅ Token aktualisiert"
else
    # Füge Token hinzu (nach NEXT_PUBLIC_READING_AGENT_URL)
    if grep -q "NEXT_PUBLIC_READING_AGENT_URL" "$DOCKER_COMPOSE_FILE"; then
        sed -i "/NEXT_PUBLIC_READING_AGENT_URL:/a\\
      # System Auth Token (für /api/system/** Routen)\\
      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN:-$TOKEN}" "$DOCKER_COMPOSE_FILE"
        echo "   ✅ Token hinzugefügt (nach NEXT_PUBLIC_READING_AGENT_URL)"
    else
        echo "   ⚠️  NEXT_PUBLIC_READING_AGENT_URL nicht gefunden"
        echo "   📝 Füge manuell hinzu nach environment:"
        echo "      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN:-$TOKEN}"
    fi
fi

echo ""

# 4. Prüfe Ergebnis
echo "4. Prüfe Ergebnis..."
echo "-------------------"
if grep -q "AGENT_SYSTEM_TOKEN" "$DOCKER_COMPOSE_FILE"; then
    echo "   ✅ Token in $DOCKER_COMPOSE_FILE gefunden:"
    grep "AGENT_SYSTEM_TOKEN" "$DOCKER_COMPOSE_FILE" | head -1
else
    echo "   ⚠️  Token nicht gefunden - bitte manuell hinzufügen"
fi
echo ""

# 5. Optional: In .env speichern
if [ -f ".env" ]; then
    echo "5. Prüfe .env Datei..."
    echo "---------------------"
    
    if grep -q "AGENT_SYSTEM_TOKEN" .env; then
        echo "   ⚠️  AGENT_SYSTEM_TOKEN existiert bereits in .env"
        read -p "   Überschreiben? (j/n): " OVERWRITE_ENV
        if [ "$OVERWRITE_ENV" = "j" ] || [ "$OVERWRITE_ENV" = "J" ] || [ "$OVERWRITE_ENV" = "y" ] || [ "$OVERWRITE_ENV" = "Y" ]; then
            sed -i "s/AGENT_SYSTEM_TOKEN=.*/AGENT_SYSTEM_TOKEN=$TOKEN/" .env
            echo "   ✅ Token in .env aktualisiert"
        fi
    else
        echo "AGENT_SYSTEM_TOKEN=$TOKEN" >> .env
        echo "   ✅ Token zu .env hinzugefügt"
    fi
    echo ""
fi

# 6. Zusammenfassung
echo "6. Zusammenfassung:"
echo "------------------"
echo ""
echo "✅ Token Setup abgeschlossen!"
echo ""
echo "📋 Token: $TOKEN"
echo ""
echo "📝 Nächste Schritte:"
echo "   1. Container neu starten:"
echo "      docker compose -f $DOCKER_COMPOSE_FILE up -d frontend"
echo ""
echo "   2. Token testen:"
echo "      ./test-system-auth.sh"
echo ""
echo "🔒 Sicherheitshinweise:"
echo "   - Token niemals in Git committen"
echo "   - Token nur in docker-compose.yml oder .env"
echo "   - Token regelmäßig rotieren (alle 90 Tage)"
echo ""
