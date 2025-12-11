#!/bin/bash
# Prüft ob die Chart-Seite existiert und korrekt konfiguriert ist
# Führen Sie auf CK-App Server aus: /opt/hd-app/The-Connection-Key/frontend

set -e

FRONTEND_DIR="/opt/hd-app/The-Connection-Key/frontend"

echo "🔍 Prüfe Chart-Seite"
echo "===================="
echo ""

cd "$FRONTEND_DIR"

# 1. Prüfe ob Chart-Seite existiert
echo "1. Prüfe ob Chart-Seite existiert..."
CHART_PAGE_PAGES=""
CHART_PAGE_APP=""

if [ -f "pages/agents/chart.tsx" ]; then
    CHART_PAGE_PAGES="pages/agents/chart.tsx"
    echo "   ✅ Pages Router: pages/agents/chart.tsx gefunden"
elif [ -f "pages/agents/chart.ts" ]; then
    CHART_PAGE_PAGES="pages/agents/chart.ts"
    echo "   ✅ Pages Router: pages/agents/chart.ts gefunden"
fi

if [ -f "app/agents/chart/page.tsx" ]; then
    CHART_PAGE_APP="app/agents/chart/page.tsx"
    echo "   ✅ App Router: app/agents/chart/page.tsx gefunden"
elif [ -f "app/agents/chart/page.ts" ]; then
    CHART_PAGE_APP="app/agents/chart/page.ts"
    echo "   ✅ App Router: app/agents/chart/page.ts gefunden"
fi

if [ -z "$CHART_PAGE_PAGES" ] && [ -z "$CHART_PAGE_APP" ]; then
    echo "   ❌ Chart-Seite nicht gefunden!"
    echo "   📋 Erstelle Chart-Seite..."
    
    # Prüfe ob Pages Router oder App Router
    if [ -d "pages" ]; then
        echo "   📁 Pages Router erkannt"
        mkdir -p pages/agents
        cat > pages/agents/chart.tsx << 'EOF'
import { ChartDevelopment } from '../../components/agents/ChartDevelopment';

export default function ChartAgentPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>📊 Chart Agent</h1>
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
        Analysiere Human Design Charts, erstelle detaillierte Auswertungen und Interpretationen
      </p>
      <ChartDevelopment />
    </div>
  );
}
EOF
        echo "   ✅ pages/agents/chart.tsx erstellt"
        CHART_PAGE_PAGES="pages/agents/chart.tsx"
    elif [ -d "app" ]; then
        echo "   📁 App Router erkannt"
        mkdir -p app/agents/chart
        cat > app/agents/chart/page.tsx << 'EOF'
import { ChartDevelopment } from '../../../components/agents/ChartDevelopment';

export default function ChartAgentPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>📊 Chart Agent</h1>
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
        Analysiere Human Design Charts, erstelle detaillierte Auswertungen und Interpretationen
      </p>
      <ChartDevelopment />
    </div>
  );
}
EOF
        echo "   ✅ app/agents/chart/page.tsx erstellt"
        CHART_PAGE_APP="app/agents/chart/page.tsx"
    else
        echo "   ❌ Weder pages/ noch app/ Verzeichnis gefunden"
        exit 1
    fi
fi
echo ""

# 2. Prüfe ob ChartDevelopment importiert wird
echo "2. Prüfe ChartDevelopment-Import..."
CHART_PAGE="$CHART_PAGE_PAGES"
if [ -z "$CHART_PAGE" ]; then
    CHART_PAGE="$CHART_PAGE_APP"
fi

if [ -n "$CHART_PAGE" ]; then
    if grep -q "ChartDevelopment" "$CHART_PAGE"; then
        echo "   ✅ ChartDevelopment wird importiert"
        echo "   📄 Import-Zeile:"
        grep "ChartDevelopment" "$CHART_PAGE" | head -1
    else
        echo "   ❌ ChartDevelopment wird NICHT importiert!"
        echo "   📋 Füge Import hinzu..."
        
        # Füge Import hinzu
        if [[ "$CHART_PAGE" == pages/* ]]; then
            IMPORT_LINE="import { ChartDevelopment } from '../../components/agents/ChartDevelopment';"
        else
            IMPORT_LINE="import { ChartDevelopment } from '../../../components/agents/ChartDevelopment';"
        fi
        
        # Füge Import am Anfang der Datei hinzu (nach 'use client' falls vorhanden)
        if grep -q "'use client'" "$CHART_PAGE"; then
            sed -i "/'use client'/a\\$IMPORT_LINE" "$CHART_PAGE"
        else
            sed -i "1i\\$IMPORT_LINE" "$CHART_PAGE"
        fi
        
        echo "   ✅ Import hinzugefügt"
    fi
fi
echo ""

# 3. Prüfe ob ChartDevelopment verwendet wird
echo "3. Prüfe ob ChartDevelopment verwendet wird..."
if [ -n "$CHART_PAGE" ]; then
    if grep -q "<ChartDevelopment" "$CHART_PAGE"; then
        echo "   ✅ ChartDevelopment wird verwendet"
    else
        echo "   ❌ ChartDevelopment wird NICHT verwendet!"
        echo "   📋 Füge Komponente hinzu..."
        
        # Füge ChartDevelopment-Komponente hinzu
        if grep -q "return" "$CHART_PAGE"; then
            # Füge nach return hinzu
            sed -i '/return (/,/<\/div>/ {
                /<\/div>/i\
      <ChartDevelopment />
            }' "$CHART_PAGE"
        else
            echo "   ⚠️  Kann Komponente nicht automatisch hinzufügen"
            echo "   📋 Bitte manuell hinzufügen: <ChartDevelopment />"
        fi
    fi
fi
echo ""

# 4. Prüfe API-Endpoint in ChartDevelopment-Komponente
echo "4. Prüfe API-Endpoint in ChartDevelopment-Komponente..."
if [ -f "components/agents/ChartDevelopment.tsx" ]; then
    if grep -q "chart-development" "components/agents/ChartDevelopment.tsx"; then
        echo "   ✅ API-Endpoint korrekt: /api/agents/chart-development"
        echo "   📄 Endpoint-Zeile:"
        grep -A 1 "chart-development" "components/agents/ChartDevelopment.tsx" | head -2
    else
        echo "   ⚠️  API-Endpoint nicht gefunden in Komponente"
    fi
else
    echo "   ❌ ChartDevelopment-Komponente nicht gefunden!"
fi
echo ""

echo "===================="
echo "✅ Prüfung abgeschlossen!"
echo "===================="
echo ""
echo "📋 Nächste Schritte:"
echo "1. Prüfen Sie ob Next.js läuft"
echo "2. Starten Sie Next.js neu (falls nötig)"
echo "3. Testen Sie: https://www.the-connection-key.de/agents/chart"
echo ""

