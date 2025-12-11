#!/bin/bash

# Diagnose Frontend-Struktur und Agent-Routen
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🔍 Frontend-Struktur Diagnose"
echo "=============================="
echo ""

# 1. Prüfe Frontend-Verzeichnisse
echo "1. Frontend-Verzeichnisse:"
echo "-------------------------"
if [ -d "frontend" ]; then
    echo "   ✅ frontend/ existiert"
    echo "   Verzeichnis-Inhalt:"
    ls -la frontend/ | head -10
else
    echo "   ❌ frontend/ existiert NICHT"
fi
echo ""

if [ -d "integration/frontend" ]; then
    echo "   ✅ integration/frontend/ existiert"
    echo "   Verzeichnis-Inhalt:"
    ls -la integration/frontend/ | head -10
else
    echo "   ❌ integration/frontend/ existiert NICHT"
fi
echo ""

# 2. Prüfe Docker Build Context
echo "2. Docker Build Context:"
echo "-----------------------"
if [ -f "docker-compose-redis-fixed.yml" ]; then
    BUILD_CONTEXT=$(grep -A 5 "frontend:" docker-compose-redis-fixed.yml | grep "context:" | awk '{print $2}' | tr -d '"')
    echo "   Build Context: $BUILD_CONTEXT"
    if [ -d "$BUILD_CONTEXT" ]; then
        echo "   ✅ Build Context Verzeichnis existiert"
    else
        echo "   ❌ Build Context Verzeichnis existiert NICHT"
    fi
else
    echo "   ⚠️  docker-compose-redis-fixed.yml nicht gefunden"
fi
echo ""

# 3. Prüfe Agent-Routen (App Router)
echo "3. Agent-Routen (App Router):"
echo "----------------------------"
AGENTS=("marketing" "automation" "sales" "social-youtube" "chart-development")

for agent in "${AGENTS[@]}"; do
    # Prüfe in integration/
    if [ -f "integration/api-routes/app-router/agents/${agent}/route.ts" ]; then
        echo "   ✅ integration/api-routes/app-router/agents/${agent}/route.ts vorhanden"
    else
        echo "   ❌ integration/api-routes/app-router/agents/${agent}/route.ts fehlt"
    fi
    
    # Prüfe in frontend/
    if [ -f "frontend/app/api/agents/${agent}/route.ts" ]; then
        echo "   ✅ frontend/app/api/agents/${agent}/route.ts vorhanden"
    else
        echo "   ❌ frontend/app/api/agents/${agent}/route.ts fehlt"
    fi
    echo ""
done

# 4. Prüfe Frontend-Komponenten
echo "4. Frontend-Komponenten:"
echo "----------------------"
if [ -f "integration/frontend/components/AgentChat.tsx" ]; then
    echo "   ✅ integration/frontend/components/AgentChat.tsx vorhanden"
else
    echo "   ❌ integration/frontend/components/AgentChat.tsx fehlt"
fi

if [ -f "frontend/components/AgentChat.tsx" ]; then
    echo "   ✅ frontend/components/AgentChat.tsx vorhanden"
else
    echo "   ❌ frontend/components/AgentChat.tsx fehlt"
fi

if [ -f "integration/frontend/components/AgentTasksDashboard.tsx" ]; then
    echo "   ✅ integration/frontend/components/AgentTasksDashboard.tsx vorhanden"
else
    echo "   ❌ integration/frontend/components/AgentTasksDashboard.tsx fehlt"
fi

if [ -f "frontend/components/AgentTasksDashboard.tsx" ]; then
    echo "   ✅ frontend/components/AgentTasksDashboard.tsx vorhanden"
else
    echo "   ❌ frontend/components/AgentTasksDashboard.tsx fehlt"
fi
echo ""

# 5. Prüfe Frontend-Seiten
echo "5. Frontend-Seiten:"
echo "-----------------"
PAGES=("tasks" "marketing" "automation" "sales" "social-youtube" "chart")

for page in "${PAGES[@]}"; do
    # Prüfe in integration/
    if [ -f "integration/frontend/app/coach/agents/${page}/page.tsx" ]; then
        echo "   ✅ integration/frontend/app/coach/agents/${page}/page.tsx vorhanden"
    else
        echo "   ❌ integration/frontend/app/coach/agents/${page}/page.tsx fehlt"
    fi
    
    # Prüfe in frontend/
    if [ -f "frontend/app/coach/agents/${page}/page.tsx" ]; then
        echo "   ✅ frontend/app/coach/agents/${page}/page.tsx vorhanden"
    else
        echo "   ❌ frontend/app/coach/agents/${page}/page.tsx fehlt"
    fi
    echo ""
done

# 6. Prüfe Pages Router Routen (alt)
echo "6. Pages Router Routen (alt):"
echo "----------------------------"
for agent in "${AGENTS[@]}"; do
    if [ -f "integration/api-routes/agents-${agent}.ts" ]; then
        echo "   ⚠️  integration/api-routes/agents-${agent}.ts vorhanden (Pages Router - veraltet)"
    fi
done
echo ""

# 7. Zusammenfassung
echo "7. Zusammenfassung:"
echo "------------------"
echo ""
echo "📋 Was fehlt:"
echo ""

# Prüfe was fehlt
MISSING_ROUTES=0
MISSING_COMPONENTS=0
MISSING_PAGES=0

for agent in "${AGENTS[@]}"; do
    if [ ! -f "frontend/app/api/agents/${agent}/route.ts" ]; then
        echo "   ❌ Route fehlt: frontend/app/api/agents/${agent}/route.ts"
        MISSING_ROUTES=$((MISSING_ROUTES + 1))
    fi
done

if [ ! -f "frontend/components/AgentChat.tsx" ]; then
    echo "   ❌ Komponente fehlt: frontend/components/AgentChat.tsx"
    MISSING_COMPONENTS=$((MISSING_COMPONENTS + 1))
fi

if [ ! -f "frontend/components/AgentTasksDashboard.tsx" ]; then
    echo "   ❌ Komponente fehlt: frontend/components/AgentTasksDashboard.tsx"
    MISSING_COMPONENTS=$((MISSING_COMPONENTS + 1))
fi

for page in "${PAGES[@]}"; do
    if [ ! -f "frontend/app/coach/agents/${page}/page.tsx" ]; then
        echo "   ❌ Seite fehlt: frontend/app/coach/agents/${page}/page.tsx"
        MISSING_PAGES=$((MISSING_PAGES + 1))
    fi
done

echo ""
echo "📊 Statistik:"
echo "   Fehlende Routen: $MISSING_ROUTES / ${#AGENTS[@]}"
echo "   Fehlende Komponenten: $MISSING_COMPONENTS / 2"
echo "   Fehlende Seiten: $MISSING_PAGES / ${#PAGES[@]}"
echo ""

if [ $MISSING_ROUTES -eq 0 ] && [ $MISSING_COMPONENTS -eq 0 ] && [ $MISSING_PAGES -eq 0 ]; then
    echo "✅ Alle Dateien sind vorhanden!"
else
    echo "⚠️  Es fehlen noch Dateien - kopiere von integration/ nach frontend/"
fi
echo ""
