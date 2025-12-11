#!/bin/bash

# Deploys Frontend-Dateien von integration/ nach frontend/
# Führt auf Server aus (167.235.224.149)

set -e

cd /opt/hd-app/The-Connection-Key

echo "🚀 Deploy Frontend von integration/"
echo "==================================="
echo ""

# Prüfe ob integration/ Verzeichnis existiert
if [ ! -d "integration/frontend" ]; then
    echo "❌ integration/frontend Verzeichnis nicht gefunden!"
    echo "   Stelle sicher, dass das Repository vollständig ist."
    exit 1
fi

# 1. Komponenten kopieren
echo "1. Kopiere Komponenten..."
echo "------------------------"
if [ -d "integration/frontend/components" ]; then
    mkdir -p frontend/components
    cp -v integration/frontend/components/AgentChat.tsx frontend/components/ 2>/dev/null || echo "   ⚠️  AgentChat.tsx nicht gefunden"
    cp -v integration/frontend/components/AgentTasksDashboard.tsx frontend/components/ 2>/dev/null || echo "   ⚠️  AgentTasksDashboard.tsx nicht gefunden"
    echo "   ✅ Komponenten kopiert"
else
    echo "   ⚠️  integration/frontend/components nicht gefunden"
fi
echo ""

# 2. Seiten kopieren
echo "2. Kopiere Seiten..."
echo "-------------------"
if [ -d "integration/frontend/app/coach/agents" ]; then
    mkdir -p frontend/app/coach/agents
    cp -rv integration/frontend/app/coach/agents/* frontend/app/coach/agents/ 2>/dev/null || echo "   ⚠️  Seiten nicht gefunden"
    echo "   ✅ Seiten kopiert"
else
    echo "   ⚠️  integration/frontend/app/coach/agents nicht gefunden"
fi
echo ""

# 3. Prüfe ob Dateien jetzt vorhanden sind
echo "3. Prüfe kopierte Dateien..."
echo "----------------------------"
if [ -f "frontend/components/AgentChat.tsx" ]; then
    echo "   ✅ AgentChat.tsx vorhanden"
else
    echo "   ❌ AgentChat.tsx fehlt!"
fi

if [ -f "frontend/components/AgentTasksDashboard.tsx" ]; then
    echo "   ✅ AgentTasksDashboard.tsx vorhanden"
else
    echo "   ❌ AgentTasksDashboard.tsx fehlt!"
fi

if [ -f "frontend/app/coach/agents/tasks/page.tsx" ]; then
    echo "   ✅ tasks/page.tsx vorhanden"
else
    echo "   ❌ tasks/page.tsx fehlt!"
fi

if [ -f "frontend/app/coach/agents/marketing/page.tsx" ]; then
    echo "   ✅ marketing/page.tsx vorhanden"
else
    echo "   ❌ marketing/page.tsx fehlt!"
fi
echo ""

# 4. Container neu bauen
echo "4. Baue Container neu..."
echo "----------------------"
docker compose stop frontend 2>/dev/null || echo "   Container läuft nicht"
docker compose rm -f frontend 2>/dev/null || echo "   Container existiert nicht"
docker compose build --no-cache frontend
echo ""

# 5. Container starten
echo "5. Starte Container..."
echo "-------------------"
docker compose up -d frontend
echo ""

# 6. Warte auf Start
echo "6. Warte 20 Sekunden auf Container-Start..."
sleep 20
echo ""

# 7. Teste Seiten
echo "7. Teste Frontend-Seiten..."
echo "--------------------------"

PAGES=(
  "/coach/agents/tasks"
  "/coach/agents/marketing"
  "/coach/agents/automation"
  "/coach/agents/sales"
  "/coach/agents/social-youtube"
  "/coach/agents/chart"
)

SUCCESS_COUNT=0
FAIL_COUNT=0

for page in "${PAGES[@]}"; do
  echo ""
  echo "   Teste $page..."
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000${page}" || echo "000")
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ $page funktioniert! (HTTP $HTTP_CODE)"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  elif [ "$HTTP_CODE" = "404" ]; then
    echo "   ⚠️  $page gibt 404 zurück"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  else
    echo "   ⚠️  $page antwortet mit HTTP $HTTP_CODE"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
done

echo ""

# 8. Zusammenfassung
echo "8. Zusammenfassung:"
echo "------------------"
echo "   Erfolgreich: $SUCCESS_COUNT / ${#PAGES[@]}"
echo "   Fehler: $FAIL_COUNT / ${#PAGES[@]}"
echo ""

if [ $SUCCESS_COUNT -eq ${#PAGES[@]} ]; then
  echo "✅ ALLE Frontend-Seiten erfolgreich deployt!"
else
  echo "⚠️  Einige Seiten haben noch Probleme"
  echo ""
  echo "🔍 Debugging:"
  echo "1. Prüfe ob Dateien kopiert wurden:"
  echo "   ls -la frontend/components/AgentChat.tsx"
  echo "   ls -la frontend/app/coach/agents/tasks/page.tsx"
  echo ""
  echo "2. Prüfe Container-Logs:"
  echo "   docker compose logs frontend | tail -50"
  echo ""
  echo "3. Prüfe ob integration/ Verzeichnis vorhanden ist:"
  echo "   ls -la integration/frontend/"
fi
echo ""

echo "📋 Nächste Schritte:"
echo "1. Öffne Dashboard: http://167.235.224.149:3000/coach/agents/tasks"
echo "2. Teste Agent-Seiten:"
for page in "${PAGES[@]}"; do
  echo "   http://167.235.224.149:3000${page}"
done
echo ""
