#!/bin/bash

# Füge AGENT_SYSTEM_TOKEN zu docker-compose.yml hinzu
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🔐 Token Setup für docker-compose.yml"
echo "====================================="
echo ""

# 1. Prüfe docker-compose.yml
echo "1. Prüfe docker-compose.yml..."
echo "-----------------------------"

if [ ! -f "docker-compose.yml" ]; then
    echo "   ❌ docker-compose.yml nicht gefunden!"
    exit 1
fi

if grep -q "frontend:" "docker-compose.yml"; then
    echo "   ✅ docker-compose.yml enthält Frontend"
else
    echo "   ⚠️  docker-compose.yml enthält KEIN Frontend"
    echo "   Verfügbare Services:"
    grep -E "^  [a-z-]+:" docker-compose.yml | head -10
    echo ""
    read -p "   Trotzdem fortfahren? (j/n): " CONTINUE
    if [ "$CONTINUE" != "j" ] && [ "$CONTINUE" != "J" ] && [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
        exit 0
    fi
fi

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

# 4. Prüfe ob Token in docker-compose.yml benötigt wird
echo "4. Prüfe docker-compose.yml..."
echo "-----------------------------"

# Finde Frontend-Service
if grep -q "frontend:" "docker-compose.yml"; then
    echo "   ✅ Frontend-Service gefunden"
    
    if grep -q "AGENT_SYSTEM_TOKEN" "docker-compose.yml"; then
        echo "   ✅ AGENT_SYSTEM_TOKEN bereits vorhanden"
        echo "   Aktueller Wert:"
        grep "AGENT_SYSTEM_TOKEN" "docker-compose.yml" | head -1
    else
        echo "   ⚠️  AGENT_SYSTEM_TOKEN fehlt - füge hinzu..."
        
        # Finde Frontend-Service und environment Sektion
        # Füge nach MCP_SERVER_URL oder READING_AGENT_URL hinzu
        if grep -q "NEXT_PUBLIC_READING_AGENT_URL" "docker-compose.yml"; then
            sed -i "/NEXT_PUBLIC_READING_AGENT_URL:/a\\
      # System Auth Token (für /api/system/** Routen)\\
      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN:-$TOKEN}" "docker-compose.yml"
            echo "   ✅ Token hinzugefügt (nach NEXT_PUBLIC_READING_AGENT_URL)"
        elif grep -q "NEXT_PUBLIC_MCP_SERVER_URL" "docker-compose.yml"; then
            sed -i "/NEXT_PUBLIC_MCP_SERVER_URL:/a\\
      # System Auth Token (für /api/system/** Routen)\\
      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN:-$TOKEN}" "docker-compose.yml"
            echo "   ✅ Token hinzugefügt (nach NEXT_PUBLIC_MCP_SERVER_URL)"
        elif grep -q "MCP_SERVER_URL" "docker-compose.yml"; then
            sed -i "/MCP_SERVER_URL:/a\\
      # System Auth Token (für /api/system/** Routen)\\
      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN:-$TOKEN}" "docker-compose.yml"
            echo "   ✅ Token hinzugefügt (nach MCP_SERVER_URL)"
        else
            # Füge nach environment: hinzu (im Frontend-Service)
            FRONTEND_LINE=$(grep -n "frontend:" docker-compose.yml | head -1 | cut -d: -f1)
            ENV_LINE=$(sed -n "${FRONTEND_LINE},/^  [a-z-]*:/p" docker-compose.yml | grep -n "environment:" | head -1 | cut -d: -f1)
            if [ -n "$ENV_LINE" ]; then
                ACTUAL_LINE=$((FRONTEND_LINE + ENV_LINE - 1))
                sed -i "${ACTUAL_LINE}a\\
      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN:-$TOKEN}" "docker-compose.yml"
                echo "   ✅ Token hinzugefügt (nach environment:)"
            else
                echo "   ⚠️  Konnte environment: nicht finden"
                echo "   📝 Füge manuell hinzu:"
                echo "      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN:-$TOKEN}"
            fi
        fi
    fi
else
    echo "   ⚠️  Frontend-Service nicht gefunden"
    echo "   📝 Token ist in .env gespeichert"
    echo "   📝 Füge manuell zu docker-compose.yml hinzu (falls Frontend später hinzugefügt wird):"
    echo "      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN:-$TOKEN}"
fi

echo ""

# 5. Zusammenfassung
echo "5. Zusammenfassung:"
echo "------------------"
echo ""
echo "✅ Token Setup abgeschlossen!"
echo ""
echo "📋 Token: $TOKEN"
echo "📁 Datei: docker-compose.yml"
echo ""
echo "📝 Nächste Schritte:"
echo "   1. Container neu starten:"
echo "      docker compose -f docker-compose.yml up -d frontend"
echo ""
echo "   2. Token testen:"
echo "      TOKEN=\$(docker exec \$(docker ps -q -f name=frontend) env | grep AGENT_SYSTEM_TOKEN | cut -d'=' -f2)"
echo "      curl -X GET http://localhost:3000/api/system/agents/tasks -H \"x-agent-token: \$TOKEN\""
echo ""
