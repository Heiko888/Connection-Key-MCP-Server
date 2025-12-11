#!/bin/bash
# Fix: Fügt fehlenden Import für ChartCalculationAstronomy hinzu

set -e

CHART_MODULE="/opt/mcp/chart-calculation.js"

echo "🔧 Fix: Füge Import für ChartCalculationAstronomy hinzu"
echo "======================================================"
echo ""

# Prüfe ob Import bereits vorhanden
if grep -q "require.*chart-calculation-astronomy" "$CHART_MODULE"; then
    echo "✅ Import bereits vorhanden"
    exit 0
fi

# Füge Import nach dem Kommentar-Block hinzu
awk '
/^const CHART_CALCULATION_METHODS/ {
    print "const ChartCalculationAstronomy = require(\"./chart-calculation-astronomy\");"
    print ""
    print
    next
}
{
    print
}
' "$CHART_MODULE" > "$CHART_MODULE.tmp" && mv "$CHART_MODULE.tmp" "$CHART_MODULE"

echo "✅ Import hinzugefügt"

# Prüfe Syntax
if node -c "$CHART_MODULE" 2>/dev/null; then
    echo "✅ Syntax OK"
else
    echo "❌ Syntax-Fehler!"
    exit 1
fi

echo ""
echo "✅ Fix abgeschlossen!"

