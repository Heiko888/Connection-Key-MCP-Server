#!/bin/bash
# Aktualisiert Chart-Berechnungs-Modul - Extrahiert Chart-Daten aus Reading

set -e

MCP_DIR="/opt/mcp"
CHART_MODULE="$MCP_DIR/chart-calculation.js"
BACKUP_FILE="$CHART_MODULE.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔧 Aktualisiere Chart-Berechnungs-Modul"
echo "========================================"
echo ""

# Backup
cp "$CHART_MODULE" "$BACKUP_FILE"
echo "✅ Backup: $BACKUP_FILE"
echo ""

# Prüfe ob extractChartDataFromReading bereits existiert
if grep -q "extractChartDataFromReading" "$CHART_MODULE"; then
    echo "⚠️  extractChartDataFromReading bereits vorhanden"
    exit 0
fi

echo "📝 Füge Chart-Daten-Extraktion hinzu..."
echo ""

# Erstelle temporäre Datei mit erweitertem Code
TEMP_FILE=$(mktemp)

# Kopiere alles bis calculateViaReadingAgent
awk '/calculateViaReadingAgent\(birthDate, birthTime, birthPlace\)/,/^  }/ {
    if (/^  }/ && !done) {
        print;
        print "";
        print "  extractChartDataFromReading(readingText) {";
        print "    if (!readingText) return {};";
        print "    ";
        print "    // Extrahiere Typ";
        print "    let type = null;";
        print "    const typePatterns = [";
        print "      /Typ ist der (\\w+)/i,";
        print "      /Typ: (\\w+)/i,";
        print "      /Sie sind ein (\\w+)/i,";
        print "      /(\\w+) Typ/i";
        print "    ];";
        print "    for (const pattern of typePatterns) {";
        print "      const match = readingText.match(pattern);";
        print "      if (match) {";
        print "        type = match[1];";
        print "        break;";
        print "      }";
        print "    }";
        print "    ";
        print "    // Extrahiere Profil";
        print "    let profile = null;";
        print "    const profileMatch = readingText.match(/Profil ist (\\d+\\/\\d+)/i) ||";
        print "                         readingText.match(/Profil: (\\d+\\/\\d+)/i) ||";
        print "                         readingText.match(/(\\d+\\/\\d+)/);";
        print "    if (profileMatch) {";
        print "      profile = profileMatch[1];";
        print "    }";
        print "    ";
        print "    // Extrahiere Autorität";
        print "    let authority = null;";
        print "    const authorityMatch = readingText.match(/Autorität.*?ist ([\\w\\s]+?)(?:\\.|,|$)/i) ||";
        print "                         readingText.match(/Ihre Autorität ist ([\\w\\s]+?)(?:\\.|,|$)/i);";
        print "    if (authorityMatch) {";
        print "      authority = authorityMatch[1].trim();";
        print "    }";
        print "    ";
        print "    // Extrahiere Strategie";
        print "    let strategy = null;";
        print "    const strategyMatch = readingText.match(/Strategie.*?ist ([\\w\\s]+?)(?:\\.|,|$)/i) ||";
        print "                        readingText.match(/Ihre Strategie ist ([\\w\\s]+?)(?:\\.|,|$)/i);";
        print "    if (strategyMatch) {";
        print "      strategy = strategyMatch[1].trim();";
        print "    }";
        print "    ";
        print "    return {";
        print "      type,";
        print "      profile,";
        print "      authority,";
        print "      strategy,";
        print "      centers: {},";
        print "      gates: {},";
        print "      channels: {},";
        print "      incarnationCross: null";
        print "    };";
        print "  }";
        done = 1;
        next;
    }
    print;
}' "$CHART_MODULE" > "$TEMP_FILE"

# Aktualisiere calculateViaReadingAgent um extractChartDataFromReading zu nutzen
sed -i 's/return this.normalizeChartData(data.chartData || {});/const chartData = this.extractChartDataFromReading(data.reading || "");\n    return this.normalizeChartData(chartData);/' "$TEMP_FILE"

# Ersetze
mv "$TEMP_FILE" "$CHART_MODULE"

echo "✅ Chart-Daten-Extraktion hinzugefügt"
echo ""

# MCP Server neu starten
echo "🔄 Starte MCP Server neu..."
systemctl restart mcp
sleep 3

if systemctl is-active --quiet mcp; then
    echo "✅ MCP Server läuft"
else
    echo "❌ Fehler"
    journalctl -u mcp -n 10 --no-pager
    exit 1
fi
echo ""

# Test
echo "🧪 Test..."
sleep 2
curl -s -X POST http://localhost:7000/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin"}' | head -5

echo ""
echo "✅ Fertig!"
echo ""

