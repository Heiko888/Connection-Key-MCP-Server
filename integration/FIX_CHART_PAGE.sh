#!/bin/bash
# Fix für Chart-Seite - Prüft und korrigiert die Chart-Seite
# Führen Sie auf CK-App Server aus: /opt/hd-app/The-Connection-Key/frontend

set -e

FRONTEND_DIR="/opt/hd-app/The-Connection-Key/frontend"
CHART_PAGE="$FRONTEND_DIR/app/agents/chart/page.tsx"

echo "🔧 Fix für Chart-Seite"
echo "======================"
echo ""

cd "$FRONTEND_DIR"

# 1. Prüfe ob Chart-Seite existiert
echo "1. Prüfe Chart-Seite..."
if [ -f "$CHART_PAGE" ]; then
    echo "   ✅ Chart-Seite gefunden: $CHART_PAGE"
else
    echo "   ❌ Chart-Seite nicht gefunden!"
    exit 1
fi
echo ""

# 2. Zeige aktuellen Inhalt
echo "2. Aktueller Inhalt der Chart-Seite:"
echo "-----------------------------------"
cat "$CHART_PAGE"
echo ""
echo "-----------------------------------"
echo ""

# 3. Prüfe ob ChartDevelopment importiert wird
echo "3. Prüfe ChartDevelopment-Import..."
if grep -q "ChartDevelopment" "$CHART_PAGE"; then
    echo "   ✅ ChartDevelopment wird importiert"
    echo "   📄 Import-Zeile:"
    grep "ChartDevelopment" "$CHART_PAGE" | head -1
else
    echo "   ❌ ChartDevelopment wird NICHT importiert!"
    echo "   📋 Füge Import hinzu..."
    
    # Füge Import hinzu
    if grep -q "'use client'" "$CHART_PAGE"; then
        # Füge nach 'use client' hinzu
        sed -i "/'use client'/a\\
import { ChartDevelopment } from '../../../components/agents/ChartDevelopment';" "$CHART_PAGE"
    else
        # Füge am Anfang hinzu
        sed -i "1i\\
import { ChartDevelopment } from '../../../components/agents/ChartDevelopment';" "$CHART_PAGE"
    fi
    
    echo "   ✅ Import hinzugefügt"
fi
echo ""

# 4. Prüfe ob ChartDevelopment verwendet wird
echo "4. Prüfe ob ChartDevelopment verwendet wird..."
if grep -q "<ChartDevelopment" "$CHART_PAGE"; then
    echo "   ✅ ChartDevelopment wird verwendet"
    echo "   📄 Verwendungs-Zeile:"
    grep "<ChartDevelopment" "$CHART_PAGE" | head -1
else
    echo "   ❌ ChartDevelopment wird NICHT verwendet!"
    echo "   📋 Füge Komponente hinzu..."
    
    # Erstelle Backup
    cp "$CHART_PAGE" "$CHART_PAGE.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Erstelle neue Version mit ChartDevelopment
    cat > "$CHART_PAGE" << 'EOF'
'use client';

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
    
    echo "   ✅ ChartDevelopment-Komponente hinzugefügt"
    echo "   📋 Backup erstellt: $CHART_PAGE.backup.*"
fi
echo ""

# 5. Zeige finalen Inhalt
echo "5. Finaler Inhalt der Chart-Seite:"
echo "-----------------------------------"
cat "$CHART_PAGE"
echo ""
echo "-----------------------------------"
echo ""

echo "======================"
echo "✅ Fix abgeschlossen!"
echo "======================"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Prüfen Sie ob Next.js läuft"
echo "2. Starten Sie Next.js neu (falls nötig):"
echo "   docker restart the-connection-key-frontend-1"
echo "   ODER"
echo "   docker compose restart frontend"
echo "3. Testen Sie: https://www.the-connection-key.de/agents/chart"
echo ""

