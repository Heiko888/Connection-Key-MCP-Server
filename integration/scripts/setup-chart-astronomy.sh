#!/bin/bash
# Setup Chart-Berechnung mit astronomy-engine
# Erweitert bestehendes chart-calculation.js mit astronomy-engine Methode

set -e

MCP_DIR="/opt/mcp"
CHART_MODULE="$MCP_DIR/chart-calculation.js"
ASTRONOMY_MODULE="$MCP_DIR/chart-calculation-astronomy.js"
BACKUP_FILE="$CHART_MODULE.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔭 Setup Chart-Berechnung mit astronomy-engine"
echo "=============================================="
echo ""

# Backup erstellen
if [ -f "$CHART_MODULE" ]; then
    cp "$CHART_MODULE" "$BACKUP_FILE"
    echo "✅ Backup erstellt: $BACKUP_FILE"
fi

# 1. Prüfe ob astronomy-engine Modul bereits existiert
if [ -f "$ASTRONOMY_MODULE" ]; then
    echo "⚠️  astronomy-engine Modul existiert bereits"
    read -p "Überschreiben? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Abgebrochen"
        exit 1
    fi
fi

# 2. Kopiere astronomy-engine Modul
echo "1. Kopiere astronomy-engine Modul..."
cp "$(dirname "$0")/chart-calculation-astronomy.js" "$ASTRONOMY_MODULE"
echo "   ✅ Modul kopiert: $ASTRONOMY_MODULE"

# 3. Installiere Dependencies
echo ""
echo "2. Installiere Dependencies..."
cd "$MCP_DIR"

# Prüfe ob package.json existiert
if [ ! -f "package.json" ]; then
    echo "   📝 Erstelle package.json..."
    cat > package.json << 'PKG_END'
{
  "name": "mcp-server",
  "version": "1.0.0",
  "description": "MCP Multi-Agent Server",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.0.3",
    "node-geocoder": "^4.2.0"
  },
  "optionalDependencies": {
    "astronomy-engine": "^2.0.0"
  }
}
PKG_END
    echo "   ✅ package.json erstellt"
fi

# Installiere node-geocoder (erforderlich)
echo "   📦 Installiere node-geocoder..."
npm install node-geocoder --save 2>&1 | grep -v "npm WARN" || true

# Installiere astronomy-engine (optional, kann fehlschlagen)
echo "   📦 Installiere astronomy-engine (optional)..."
npm install astronomy-engine --save-optional 2>&1 | grep -v "npm WARN" || echo "   ⚠️  astronomy-engine konnte nicht installiert werden (nutze Fallback)"

echo "   ✅ Dependencies installiert"

# 4. Erweitere chart-calculation.js
echo ""
echo "3. Erweitere chart-calculation.js..."

# Prüfe ob astronomy-engine bereits importiert ist
if grep -q "chart-calculation-astronomy" "$CHART_MODULE"; then
    echo "   ⚠️  astronomy-engine bereits importiert"
else
    # Füge Import hinzu (nach anderen requires)
    awk '
    /^const.*require/ {
        print
        if (!astronomy_imported) {
            print "const ChartCalculationAstronomy = require(\"./chart-calculation-astronomy\");"
            astronomy_imported = 1
        }
        next
    }
    {
        print
    }
    ' "$CHART_MODULE" > "$CHART_MODULE.tmp" && mv "$CHART_MODULE.tmp" "$CHART_MODULE"
    
    echo "   ✅ Import hinzugefügt"
fi

# Füge astronomy-engine Methode zu setupMethods hinzu
if grep -q "ASTRONOMY_ENGINE" "$CHART_MODULE"; then
    echo "   ⚠️  astronomy-engine Methode bereits vorhanden"
else
    # Füge ASTRONOMY_ENGINE zu CHART_CALCULATION_METHODS hinzu
    sed -i 's/const CHART_CALCULATION_METHODS = {/const CHART_CALCULATION_METHODS = {\n  ASTRONOMY_ENGINE: '\''astronomy'\'',/' "$CHART_MODULE"
    
    # Füge astronomy-engine Methode zu setupMethods hinzu (als Priorität 0 - höchste)
    awk '
    /setupMethods\(\) \{/ {
        print
        getline
        print "    // Methode 0: astronomy-engine (höchste Priorität)"
        print "    try {"
        print "      const astronomyService = new ChartCalculationAstronomy();"
        print "      this.astronomyService = astronomyService;"
        print "      this.methods.push({"
        print "        name: CHART_CALCULATION_METHODS.ASTRONOMY_ENGINE,"
        print "        priority: 0,"
        print "        calculate: this.calculateViaAstronomy.bind(this)"
        print "      });"
        print "    } catch (error) {"
        print "      console.warn(\"astronomy-engine nicht verfügbar, überspringe:\", error.message);"
        print "    }"
        print ""
        next
    }
    {
        print
    }
    ' "$CHART_MODULE" > "$CHART_MODULE.tmp" && mv "$CHART_MODULE.tmp" "$CHART_MODULE"
    
    # Füge calculateViaAstronomy Methode hinzu (vor calculateViaN8N)
    awk '
    /async calculateViaN8N\(/ {
        print "  async calculateViaAstronomy(birthDate, birthTime, birthPlace) {"
        print "    if (!this.astronomyService) {"
        print "      throw new Error(\"astronomy-engine service nicht verfügbar\");"
        print "    }"
        print "    const chartData = await this.astronomyService.calculateHumanDesignChart("
        print "      birthDate, birthTime, birthPlace"
        print "    );"
        print "    return this.normalizeChartData(chartData);"
        print "  }"
        print ""
        print
        next
    }
    {
        print
    }
    ' "$CHART_MODULE" > "$CHART_MODULE.tmp" && mv "$CHART_MODULE.tmp" "$CHART_MODULE"
    
    echo "   ✅ astronomy-engine Methode hinzugefügt"
fi

# 5. Prüfe JavaScript-Syntax
echo ""
echo "4. Prüfe JavaScript-Syntax..."
if node -c "$CHART_MODULE" 2>/dev/null; then
    echo "   ✅ Syntax OK"
else
    echo "   ❌ Syntax-Fehler gefunden!"
    echo "   📋 Stelle Backup wieder her..."
    cp "$BACKUP_FILE" "$CHART_MODULE"
    echo "   ✅ Backup wiederhergestellt"
    exit 1
fi

# 6. Prüfe astronomy-engine Modul
if node -c "$ASTRONOMY_MODULE" 2>/dev/null; then
    echo "   ✅ astronomy-engine Modul Syntax OK"
else
    echo "   ❌ astronomy-engine Modul Syntax-Fehler!"
    exit 1
fi

echo ""
echo "✅ Setup abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Starte MCP Server neu:"
echo "   systemctl restart mcp"
echo ""
echo "2. Teste Chart-Berechnung:"
echo "   curl -X POST http://localhost:7000/chart/calculate \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"birthDate\": \"1990-05-15\", \"birthTime\": \"14:30\", \"birthPlace\": \"Berlin, Germany\"}'"
echo ""

