#!/bin/bash

# Fix Frontend: Kopiert alle Dateien von integration/ nach frontend/
# Führt auf Server aus (167.235.224.149)

set -e

cd /opt/hd-app/The-Connection-Key

echo "🔧 Fix Frontend - Komplett"
echo "=========================="
echo ""

# 1. Prüfe ob integration/ vorhanden ist
if [ ! -d "integration" ]; then
    echo "❌ integration/ Verzeichnis nicht gefunden!"
    echo "   Führe zuerst: git pull origin main"
    exit 1
fi

# 2. Kopiere Agent-Routen (App Router)
echo "1. Kopiere Agent-Routen..."
echo "-------------------------"
mkdir -p frontend/app/api/agents

AGENTS=("marketing" "automation" "sales" "social-youtube" "chart-development")

for agent in "${AGENTS[@]}"; do
    if [ -f "integration/api-routes/app-router/agents/${agent}/route.ts" ]; then
        mkdir -p "frontend/app/api/agents/${agent}"
        cp -v "integration/api-routes/app-router/agents/${agent}/route.ts" "frontend/app/api/agents/${agent}/route.ts"
        echo "   ✅ ${agent} Route kopiert"
    else
        echo "   ⚠️  ${agent} Route nicht gefunden in integration/"
    fi
done

# Tasks Route
if [ -f "integration/api-routes/app-router/agents/tasks/route.ts" ]; then
    mkdir -p "frontend/app/api/agents/tasks"
    cp -v "integration/api-routes/app-router/agents/tasks/route.ts" "frontend/app/api/agents/tasks/route.ts"
    echo "   ✅ tasks Route kopiert"
fi

echo ""

# 3. Kopiere Komponenten
echo "2. Kopiere Komponenten..."
echo "------------------------"
mkdir -p frontend/components

if [ -f "integration/frontend/components/AgentChat.tsx" ]; then
    cp -v "integration/frontend/components/AgentChat.tsx" "frontend/components/AgentChat.tsx"
    echo "   ✅ AgentChat.tsx kopiert"
else
    echo "   ⚠️  AgentChat.tsx nicht gefunden"
fi

if [ -f "integration/frontend/components/AgentTasksDashboard.tsx" ]; then
    cp -v "integration/frontend/components/AgentTasksDashboard.tsx" "frontend/components/AgentTasksDashboard.tsx"
    echo "   ✅ AgentTasksDashboard.tsx kopiert"
else
    echo "   ⚠️  AgentTasksDashboard.tsx nicht gefunden"
fi

echo ""

# 4. Kopiere Seiten
echo "3. Kopiere Seiten..."
echo "-------------------"
mkdir -p frontend/app/coach/agents

PAGES=("tasks" "marketing" "automation" "sales" "social-youtube" "chart")

for page in "${PAGES[@]}"; do
    if [ -f "integration/frontend/app/coach/agents/${page}/page.tsx" ]; then
        mkdir -p "frontend/app/coach/agents/${page}"
        cp -v "integration/frontend/app/coach/agents/${page}/page.tsx" "frontend/app/coach/agents/${page}/page.tsx"
        echo "   ✅ ${page} Seite kopiert"
    else
        echo "   ⚠️  ${page} Seite nicht gefunden"
    fi
done

echo ""

# 5. Prüfe kopierte Dateien
echo "4. Prüfe kopierte Dateien..."
echo "----------------------------"

MISSING=0

for agent in "${AGENTS[@]}"; do
    if [ ! -f "frontend/app/api/agents/${agent}/route.ts" ]; then
        echo "   ❌ Route fehlt: frontend/app/api/agents/${agent}/route.ts"
        MISSING=$((MISSING + 1))
    fi
done

if [ ! -f "frontend/components/AgentChat.tsx" ]; then
    echo "   ❌ Komponente fehlt: frontend/components/AgentChat.tsx"
    MISSING=$((MISSING + 1))
fi

if [ ! -f "frontend/components/AgentTasksDashboard.tsx" ]; then
    echo "   ❌ Komponente fehlt: frontend/components/AgentTasksDashboard.tsx"
    MISSING=$((MISSING + 1))
fi

for page in "${PAGES[@]}"; do
    if [ ! -f "frontend/app/coach/agents/${page}/page.tsx" ]; then
        echo "   ❌ Seite fehlt: frontend/app/coach/agents/${page}/page.tsx"
        MISSING=$((MISSING + 1))
    fi
done

if [ $MISSING -eq 0 ]; then
    echo "   ✅ Alle Dateien vorhanden!"
else
    echo "   ⚠️  $MISSING Dateien fehlen noch"
fi

echo ""

# 6. Container neu bauen
echo "5. Baue Container neu..."
echo "----------------------"
docker compose -f docker-compose-redis-fixed.yml stop frontend 2>/dev/null || echo "   Container läuft nicht"
docker compose -f docker-compose-redis-fixed.yml rm -f frontend 2>/dev/null || echo "   Container existiert nicht"
docker compose -f docker-compose-redis-fixed.yml build --no-cache frontend
echo ""

# 7. Container starten
echo "6. Starte Container..."
echo "-------------------"
docker compose -f docker-compose-redis-fixed.yml up -d frontend
echo ""

# 8. Warte auf Start
echo "7. Warte 20 Sekunden auf Container-Start..."
sleep 20
echo ""

# 9. Teste
echo "8. Teste Endpoints..."
echo "-------------------"

SUCCESS=0
FAIL=0

# Teste API-Routen
for agent in "${AGENTS[@]}"; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:3000/api/agents/${agent}" \
        -H "Content-Type: application/json" \
        -d '{"message": "Test"}' || echo "000")
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "400" ]; then
        echo "   ✅ /api/agents/${agent} (HTTP $HTTP_CODE)"
        SUCCESS=$((SUCCESS + 1))
    else
        echo "   ⚠️  /api/agents/${agent} (HTTP $HTTP_CODE)"
        FAIL=$((FAIL + 1))
    fi
done

# Teste Frontend-Seiten
for page in "${PAGES[@]}"; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/coach/agents/${page}" || echo "000")
    
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
echo "9. Zusammenfassung:"
echo "------------------"
echo "   Erfolgreich: $SUCCESS"
echo "   Fehler: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "✅ ALLES funktioniert!"
else
    echo "⚠️  Einige Endpoints haben noch Probleme"
    echo "   Prüfe Logs: docker compose -f docker-compose-redis-fixed.yml logs frontend | tail -50"
fi
echo ""
