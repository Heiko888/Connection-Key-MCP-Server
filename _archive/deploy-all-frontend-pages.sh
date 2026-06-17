#!/bin/bash

# Deploys ALL Frontend Pages to Server
# Führt auf Server aus (167.235.224.149)

set -e

cd /opt/hd-app/The-Connection-Key

echo "🚀 Deploy ALL Frontend Pages"
echo "============================"
echo ""

# 1. Erstelle Verzeichnisse
echo "1. Erstelle Verzeichnisse..."
mkdir -p frontend/components
mkdir -p frontend/app/coach/agents/tasks
mkdir -p frontend/app/coach/agents/marketing
mkdir -p frontend/app/coach/agents/automation
mkdir -p frontend/app/coach/agents/sales
mkdir -p frontend/app/coach/agents/social-youtube
mkdir -p frontend/app/coach/agents/chart
echo "   ✅ Verzeichnisse erstellt"
echo ""

# 2. Erstelle AgentTasksDashboard Komponente
echo "2. Erstelle AgentTasksDashboard Komponente..."
# (Komponente wird vom deploy-dashboard-to-server.sh Script erstellt)
# Falls nicht vorhanden, wird sie hier erstellt
if [ ! -f "frontend/components/AgentTasksDashboard.tsx" ]; then
    echo "   ⚠️  Komponente fehlt - wird vom Dashboard-Script erstellt"
    echo "   Führe zuerst: ./deploy-dashboard-to-server.sh"
fi
echo ""

# 3. Erstelle Tasks Seite
echo "3. Erstelle Tasks Seite..."
cat > frontend/app/coach/agents/tasks/page.tsx << 'TASKS_PAGE_EOF'
/**
 * Agent Tasks Dashboard Page
 * Seite für das Agent Tasks Dashboard
 */

import { AgentTasksDashboard } from '../../../../components/AgentTasksDashboard';

export default function AgentTasksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AgentTasksDashboard />
    </div>
  );
}
TASKS_PAGE_EOF
echo "   ✅ Tasks Seite erstellt"
echo ""

# 4. Prüfe/Erstelle Agent-Seiten (falls nicht vorhanden)
echo "4. Prüfe Agent-Seiten..."
echo "------------------------"

# Marketing Agent Seite
if [ ! -f "frontend/app/coach/agents/marketing/page.tsx" ]; then
    echo "   Erstelle Marketing Agent Seite..."
    cat > frontend/app/coach/agents/marketing/page.tsx << 'MARKETING_PAGE_EOF'
/**
 * Marketing Agent Page (App Router)
 * Route: /coach/agents/marketing
 */

import { AgentChat } from '../../../../components/AgentChat';

export default function MarketingAgentPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🎯 Marketing Agent</h1>
        <p className="text-gray-600">
          Marketingstrategien, Reels, Newsletter, Funnels, Social Media Content
        </p>
      </div>
      <AgentChat agentId="marketing" agentName="Marketing" />
    </div>
  );
}
MARKETING_PAGE_EOF
    echo "   ✅ Marketing Seite erstellt"
else
    echo "   ✅ Marketing Seite existiert bereits"
fi

# Automation Agent Seite
if [ ! -f "frontend/app/coach/agents/automation/page.tsx" ]; then
    echo "   Erstelle Automation Agent Seite..."
    cat > frontend/app/coach/agents/automation/page.tsx << 'AUTOMATION_PAGE_EOF'
/**
 * Automation Agent Page (App Router)
 * Route: /coach/agents/automation
 */

import { AgentChat } from '../../../../components/AgentChat';

export default function AutomationAgentPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">⚙️ Automation Agent</h1>
        <p className="text-gray-600">
          n8n Workflows, APIs, Webhooks, Serverkonfiguration, CI/CD
        </p>
      </div>
      <AgentChat agentId="automation" agentName="Automation" />
    </div>
  );
}
AUTOMATION_PAGE_EOF
    echo "   ✅ Automation Seite erstellt"
else
    echo "   ✅ Automation Seite existiert bereits"
fi

# Sales Agent Seite
if [ ! -f "frontend/app/coach/agents/sales/page.tsx" ]; then
    echo "   Erstelle Sales Agent Seite..."
    cat > frontend/app/coach/agents/sales/page.tsx << 'SALES_PAGE_EOF'
/**
 * Sales Agent Page (App Router)
 * Route: /coach/agents/sales
 */

import { AgentChat } from '../../../../components/AgentChat';

export default function SalesAgentPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">💰 Sales Agent</h1>
        <p className="text-gray-600">
          Verkaufstexte, Funnels, Buyer Journey, Closing, Verkaufspsychologie
        </p>
      </div>
      <AgentChat agentId="sales" agentName="Sales" />
    </div>
  );
}
SALES_PAGE_EOF
    echo "   ✅ Sales Seite erstellt"
else
    echo "   ✅ Sales Seite existiert bereits"
fi

# Social-YouTube Agent Seite
if [ ! -f "frontend/app/coach/agents/social-youtube/page.tsx" ]; then
    echo "   Erstelle Social-YouTube Agent Seite..."
    cat > frontend/app/coach/agents/social-youtube/page.tsx << 'SOCIAL_PAGE_EOF'
/**
 * Social-YouTube Agent Page (App Router)
 * Route: /coach/agents/social-youtube
 */

import { AgentChat } from '../../../../components/AgentChat';

export default function SocialYouTubeAgentPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">📱 Social-YouTube Agent</h1>
        <p className="text-gray-600">
          YouTube-Video-Skripte, Reels, Posts, Captions, Thumbnail-Ideen, Social-Media-Content
        </p>
      </div>
      <AgentChat agentId="social-youtube" agentName="Social-YouTube" />
    </div>
  );
}
SOCIAL_PAGE_EOF
    echo "   ✅ Social-YouTube Seite erstellt"
else
    echo "   ✅ Social-YouTube Seite existiert bereits"
fi

# Chart Agent Seite
if [ ! -f "frontend/app/coach/agents/chart/page.tsx" ]; then
    echo "   Erstelle Chart Agent Seite..."
    cat > frontend/app/coach/agents/chart/page.tsx << 'CHART_PAGE_EOF'
/**
 * Chart Agent Page (App Router)
 * Route: /coach/agents/chart
 */

import { AgentChat } from '../../../../components/AgentChat';

export default function ChartAgentPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">📊 Chart Development Agent</h1>
        <p className="text-gray-600">
          Chart-Analysen, Human Design Interpretationen, Chart-Berechnungen
        </p>
      </div>
      <AgentChat agentId="chart" agentName="Chart Development" />
    </div>
  );
}
CHART_PAGE_EOF
    echo "   ✅ Chart Seite erstellt"
else
    echo "   ✅ Chart Seite existiert bereits"
fi

echo ""

# 5. Container neu bauen
echo "5. Baue Container neu..."
echo "----------------------"
docker compose stop frontend 2>/dev/null || echo "   Container läuft nicht"
docker compose rm -f frontend 2>/dev/null || echo "   Container existiert nicht"
docker compose build --no-cache frontend
echo ""

# 6. Container starten
echo "6. Starte Container..."
echo "-------------------"
docker compose up -d frontend
echo ""

# 7. Warte auf Start
echo "7. Warte 20 Sekunden auf Container-Start..."
sleep 20
echo ""

# 8. Teste Seiten
echo "8. Teste Frontend-Seiten..."
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
    echo "   ⚠️  $page gibt 404 zurück (möglicherweise Build noch nicht fertig)"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  else
    echo "   ⚠️  $page antwortet mit HTTP $HTTP_CODE"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
done

echo ""

# 9. Zusammenfassung
echo "9. Zusammenfassung:"
echo "------------------"
echo "   Erfolgreich: $SUCCESS_COUNT / ${#PAGES[@]}"
echo "   Fehler: $FAIL_COUNT / ${#PAGES[@]}"
echo ""

if [ $SUCCESS_COUNT -eq ${#PAGES[@]} ]; then
  echo "✅ ALLE Frontend-Seiten erfolgreich deployt!"
else
  echo "⚠️  Einige Seiten haben noch Probleme"
  echo "   Prüfe Container-Logs: docker compose logs frontend | tail -50"
fi
echo ""

echo "📋 Nächste Schritte:"
echo "1. Öffne Dashboard: http://167.235.224.149:3000/coach/agents/tasks"
echo "2. Teste Agent-Seiten:"
for page in "${PAGES[@]}"; do
  echo "   http://167.235.224.149:3000${page}"
done
echo ""
echo "3. Prüfe Container-Logs: docker compose logs frontend | tail -50"
echo ""
