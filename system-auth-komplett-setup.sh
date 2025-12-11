#!/bin/bash

# Komplettes System-Auth Setup: Prüfen + Deployen + Testen
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🔐 System-Auth Komplett-Setup"
echo "=============================="
echo ""

# 1. Prüfe ob Dateien bereits existieren
echo "1. Prüfe vorhandene Dateien..."
echo "-------------------------------"

FRONTEND_DIR="integration/frontend"
SYSTEM_AUTH_FILE="$FRONTEND_DIR/lib/system-auth.ts"
SYSTEM_ROUTE_FILE="$FRONTEND_DIR/app/api/system/agents/tasks/route.ts"

if [ -f "$SYSTEM_AUTH_FILE" ] && [ -f "$SYSTEM_ROUTE_FILE" ]; then
    echo "   ✅ System-Auth Dateien bereits vorhanden"
    echo "      - $SYSTEM_AUTH_FILE"
    echo "      - $SYSTEM_ROUTE_FILE"
    SKIP_DEPLOY=true
else
    echo "   ⚠️  System-Auth Dateien fehlen"
    SKIP_DEPLOY=false
fi

echo ""

# 2. Deploy System-Auth (falls nötig)
if [ "$SKIP_DEPLOY" = false ]; then
    echo "2. Deploy System-Auth..."
    echo "----------------------"
    
    # Führe deploy-system-auth-auf-server.sh aus
    if [ -f "deploy-system-auth-auf-server.sh" ]; then
        chmod +x deploy-system-auth-auf-server.sh
        ./deploy-system-auth-auf-server.sh
    else
        echo "   ❌ deploy-system-auth-auf-server.sh nicht gefunden!"
        echo "   📝 Führe manuell aus oder kopiere Dateien"
        exit 1
    fi
else
    echo "2. Deploy übersprungen (Dateien vorhanden)"
    echo ""
fi

# 3. Prüfe Token
echo "3. Prüfe Token..."
echo "----------------"

if [ ! -f ".env" ]; then
    echo "   ❌ .env Datei nicht gefunden!"
    echo "   📝 Führe aus: ./token-in-env-speichern.sh"
    exit 1
fi

TOKEN=$(grep "AGENT_SYSTEM_TOKEN" .env | cut -d'=' -f2 | tr -d ' ')

if [ -z "$TOKEN" ]; then
    echo "   ❌ AGENT_SYSTEM_TOKEN nicht in .env gefunden!"
    echo "   📝 Führe aus: ./token-in-env-speichern.sh"
    exit 1
fi

echo "   ✅ Token vorhanden"
echo ""

# 4. Prüfe Container
echo "4. Prüfe Container..."
echo "-------------------"

FRONTEND_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i frontend | head -1)

if [ -z "$FRONTEND_CONTAINER" ]; then
    echo "   ⚠️  Frontend-Container nicht gefunden"
    echo "   📝 Starte Container:"
    echo "      docker compose -f docker-compose.yml up -d frontend"
    NEED_REBUILD=true
else
    echo "   ✅ Frontend-Container: $FRONTEND_CONTAINER"
    
    # Prüfe ob Token im Container verfügbar ist
    CONTAINER_TOKEN=$(docker exec $FRONTEND_CONTAINER env | grep AGENT_SYSTEM_TOKEN | cut -d'=' -f2)
    
    if [ -z "$CONTAINER_TOKEN" ] || [ "$CONTAINER_TOKEN" != "$TOKEN" ]; then
        echo "   ⚠️  Token im Container fehlt oder stimmt nicht überein"
        NEED_REBUILD=true
    else
        echo "   ✅ Token im Container vorhanden und korrekt"
        NEED_REBUILD=false
    fi
fi

echo ""

# 5. Container neu bauen (falls nötig)
if [ "$NEED_REBUILD" = true ]; then
    echo "5. Container neu bauen..."
    echo "------------------------"
    
    echo "   Baue Frontend..."
    docker compose -f docker-compose.yml build frontend
    
    echo ""
    echo "   Starte Frontend..."
    docker compose -f docker-compose.yml up -d frontend
    
    echo ""
    echo "   ⏳ Warte 10 Sekunden auf Container-Start..."
    sleep 10
else
    echo "5. Container-Neubau übersprungen (nicht nötig)"
    echo ""
fi

# 6. Teste System-Auth
echo "6. Teste System-Auth..."
echo "----------------------"

if [ -f "test-system-auth-final.sh" ]; then
    chmod +x test-system-auth-final.sh
    ./test-system-auth-final.sh
else
    echo "   ⚠️  test-system-auth-final.sh nicht gefunden"
    echo ""
    echo "   📝 Manueller Test:"
    echo "      TOKEN=\$(grep AGENT_SYSTEM_TOKEN .env | cut -d'=' -f2)"
    echo "      curl -X GET http://localhost:3000/api/system/agents/tasks -H \"x-agent-token: \$TOKEN\""
fi

echo ""
echo "✅ Setup abgeschlossen!"
