#!/bin/bash

# Finales Token Setup - für docker-compose.yml
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🔐 Finales Token Setup"
echo "====================="
echo ""

# 1. Generiere Token
echo "1. Generiere Token..."
echo "-------------------"

if command -v openssl &> /dev/null; then
    TOKEN=$(openssl rand -hex 32)
    echo "   ✅ Token generiert"
else
    echo "   ❌ OpenSSL nicht gefunden"
    echo "   📝 Installiere: apt-get install openssl"
    exit 1
fi

echo ""
echo "   Token: $TOKEN"
echo ""

# 2. Speichere Token in .env
echo "2. Speichere Token in .env..."
echo "----------------------------"

if [ -f ".env" ]; then
    if grep -q "AGENT_SYSTEM_TOKEN" .env; then
        sed -i "s/AGENT_SYSTEM_TOKEN=.*/AGENT_SYSTEM_TOKEN=$TOKEN/" .env
        echo "   ✅ Token in .env aktualisiert"
    else
        echo "AGENT_SYSTEM_TOKEN=$TOKEN" >> .env
        echo "   ✅ Token zu .env hinzugefügt"
    fi
else
    echo "AGENT_SYSTEM_TOKEN=$TOKEN" > .env
    echo "   ✅ .env erstellt"
fi

echo ""

# 3. Prüfe docker-compose.yml
echo "3. Prüfe docker-compose.yml..."
echo "-----------------------------"

if [ ! -f "docker-compose.yml" ]; then
    echo "   ❌ docker-compose.yml nicht gefunden!"
    exit 1
fi

# Prüfe ob Frontend vorhanden ist
if grep -q "frontend:" "docker-compose.yml"; then
    echo "   ✅ Frontend-Service gefunden"
    
    # Prüfe ob Token bereits vorhanden
    if grep -q "AGENT_SYSTEM_TOKEN" "docker-compose.yml"; then
        echo "   ✅ AGENT_SYSTEM_TOKEN bereits vorhanden"
    else
        echo "   ⚠️  AGENT_SYSTEM_TOKEN fehlt - füge hinzu..."
        
        # Finde Frontend-Service und füge Token hinzu
        # Suche nach environment: im Frontend-Service
        if grep -q "NEXT_PUBLIC_READING_AGENT_URL\|NEXT_PUBLIC_MCP_SERVER_URL\|MCP_SERVER_URL" "docker-compose.yml"; then
            # Füge nach einer dieser Variablen hinzu
            sed -i "/NEXT_PUBLIC_READING_AGENT_URL\|NEXT_PUBLIC_MCP_SERVER_URL\|MCP_SERVER_URL/{a\\
      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN}
}" "docker-compose.yml" 2>/dev/null || \
            sed -i "/MCP_SERVER_URL:/a\\
      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN}" "docker-compose.yml"
            echo "   ✅ Token hinzugefügt"
        else
            # Füge nach environment: hinzu (im Frontend-Service)
            sed -i "/frontend:/,/^  [a-z-]*:/{/environment:/a\\
      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN}
}" "docker-compose.yml" 2>/dev/null || \
            echo "   ⚠️  Konnte automatisch nicht hinzufügen"
            echo "   📝 Füge manuell hinzu nach environment: im Frontend-Service"
        fi
    fi
else
    echo "   ⚠️  Frontend-Service nicht in docker-compose.yml gefunden"
    echo "   ✅ Token ist in .env gespeichert"
    echo "   📝 Wenn Frontend später hinzugefügt wird, füge hinzu:"
    echo "      AGENT_SYSTEM_TOKEN: \${AGENT_SYSTEM_TOKEN}"
fi

echo ""

# 4. Zusammenfassung
echo "4. Zusammenfassung:"
echo "------------------"
echo ""
echo "✅ Token Setup abgeschlossen!"
echo ""
echo "📋 Token: $TOKEN"
echo "📁 Token gespeichert in: .env"
echo ""
echo "📝 Nächste Schritte:"
echo "   1. Container neu starten:"
echo "      docker compose -f docker-compose.yml up -d frontend"
echo ""
echo "   2. Token testen:"
echo "      TOKEN=\$(grep AGENT_SYSTEM_TOKEN .env | cut -d'=' -f2)"
echo "      curl -X GET http://localhost:3000/api/system/agents/tasks -H \"x-agent-token: \$TOKEN\""
echo ""
