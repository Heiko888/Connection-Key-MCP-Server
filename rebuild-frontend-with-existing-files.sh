#!/bin/bash

# Rebuild Frontend mit vorhandenen Dateien
# Führt auf Server aus (167.235.224.149)

set -e

cd /opt/hd-app/The-Connection-Key

echo "🔨 Rebuild Frontend (Dateien sind bereits vorhanden)"
echo "===================================================="
echo ""

# 1. Prüfe welche docker-compose Datei verwendet wird
echo "1. Prüfe Docker-Compose Dateien..."
echo "----------------------------------"

if [ -f "docker-compose-redis-fixed.yml" ]; then
    COMPOSE_FILE="docker-compose-redis-fixed.yml"
    echo "   ✅ Verwende: docker-compose-redis-fixed.yml"
elif [ -f "docker-compose.yml" ]; then
    COMPOSE_FILE="docker-compose.yml"
    echo "   ✅ Verwende: docker-compose.yml"
else
    echo "   ❌ Keine docker-compose Datei gefunden!"
    exit 1
fi

# Prüfe ob frontend Service existiert
if grep -q "frontend:" "$COMPOSE_FILE"; then
    echo "   ✅ Frontend Service gefunden"
else
    echo "   ❌ Frontend Service nicht gefunden in $COMPOSE_FILE"
    exit 1
fi
echo ""

# 2. Prüfe ob Dateien vorhanden sind
echo "2. Prüfe vorhandene Dateien..."
echo "------------------------------"

AGENTS=("marketing" "automation" "sales" "social-youtube" "chart-development")
PAGES=("tasks" "marketing" "automation" "sales" "social-youtube" "chart")

MISSING=0

# Prüfe Routen
for agent in "${AGENTS[@]}"; do
    if [ ! -f "frontend/app/api/agents/${agent}/route.ts" ]; then
        echo "   ❌ Route fehlt: frontend/app/api/agents/${agent}/route.ts"
        MISSING=$((MISSING + 1))
    fi
done

# Prüfe Komponenten
if [ ! -f "frontend/components/AgentChat.tsx" ]; then
    echo "   ❌ Komponente fehlt: frontend/components/AgentChat.tsx"
    MISSING=$((MISSING + 1))
fi

if [ ! -f "frontend/components/AgentTasksDashboard.tsx" ]; then
    echo "   ❌ Komponente fehlt: frontend/components/AgentTasksDashboard.tsx"
    MISSING=$((MISSING + 1))
fi

# Prüfe Seiten
for page in "${PAGES[@]}"; do
    if [ ! -f "frontend/app/coach/agents/${page}/page.tsx" ]; then
        echo "   ❌ Seite fehlt: frontend/app/coach/agents/${page}/page.tsx"
        MISSING=$((MISSING + 1))
    fi
done

if [ $MISSING -eq 0 ]; then
    echo "   ✅ Alle Dateien vorhanden!"
else
    echo "   ⚠️  $MISSING Dateien fehlen"
    echo "   Führe zuerst: ./fix-frontend-complete.sh"
    exit 1
fi
echo ""

# 3. Container stoppen
echo "3. Stoppe Container..."
echo "---------------------"
docker compose -f "$COMPOSE_FILE" stop frontend 2>/dev/null || echo "   Container läuft nicht"
echo ""

# 4. Container entfernen
echo "4. Entferne Container..."
echo "----------------------"
docker compose -f "$COMPOSE_FILE" rm -f frontend 2>/dev/null || echo "   Container existiert nicht"
echo ""

# 5. Container neu bauen (OHNE Cache)
echo "5. Baue Container neu (ohne Cache)..."
echo "-----------------------------------"
docker compose -f "$COMPOSE_FILE" build --no-cache frontend
echo ""

# 6. Container starten
echo "6. Starte Container..."
echo "-------------------"
docker compose -f "$COMPOSE_FILE" up -d frontend
echo ""

# 7. Warte auf Start
echo "7. Warte 30 Sekunden auf Container-Start..."
sleep 30
echo ""

# 8. Prüfe Container-Status
echo "8. Prüfe Container-Status..."
echo "---------------------------"
if docker ps | grep -q "frontend"; then
    echo "   ✅ Container läuft"
else
    echo "   ❌ Container läuft nicht!"
    echo "   Prüfe Logs: docker compose -f $COMPOSE_FILE logs frontend | tail -50"
    exit 1
fi
echo ""

# 9. Teste Endpoints
echo "9. Teste Endpoints..."
echo "-------------------"

SUCCESS=0
FAIL=0

# Teste API-Routen
echo ""
echo "   API-Routen:"
for agent in "${AGENTS[@]}"; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:3000/api/agents/${agent}" \
        -H "Content-Type: application/json" \
        -d '{"message": "Test"}' 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "400" ]; then
        echo "   ✅ /api/agents/${agent} (HTTP $HTTP_CODE)"
        SUCCESS=$((SUCCESS + 1))
    else
        echo "   ⚠️  /api/agents/${agent} (HTTP $HTTP_CODE)"
        FAIL=$((FAIL + 1))
    fi
done

# Teste Frontend-Seiten
echo ""
echo "   Frontend-Seiten:"
for page in "${PAGES[@]}"; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/coach/agents/${page}" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   ✅ /coach/agents/${page} (HTTP $HTTP_CODE)"
        SUCCESS=$((SUCCESS + 1))
    else
        echo "   ⚠️  /coach/agents/${page} (HTTP $HTTP_CODE)"
        FAIL=$((FAIL + 1))
    fi
done

echo ""

# 10. Zusammenfassung
echo "10. Zusammenfassung:"
echo "-------------------"
echo "   Erfolgreich: $SUCCESS"
echo "   Fehler: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "✅ ALLES funktioniert!"
    echo ""
    echo "📋 Verfügbare URLs:"
    echo "   Dashboard: http://167.235.224.149:3000/coach/agents/tasks"
    for page in "${PAGES[@]}"; do
        if [ "$page" != "tasks" ]; then
            echo "   ${page^}: http://167.235.224.149:3000/coach/agents/${page}"
        fi
    done
else
    echo "⚠️  Einige Endpoints haben noch Probleme"
    echo ""
    echo "🔍 Debugging:"
    echo "1. Prüfe Container-Logs:"
    echo "   docker compose -f $COMPOSE_FILE logs frontend | tail -50"
    echo ""
    echo "2. Prüfe ob Dateien im Container sind:"
    echo "   docker exec \$(docker ps -q -f name=frontend) ls -la /app/app/api/agents/"
    echo ""
    echo "3. Prüfe Build-Output:"
    echo "   docker compose -f $COMPOSE_FILE logs frontend | grep -i error"
fi
echo ""
