#!/bin/bash
# Fix: Syntax-Fehler im Chart-Berechnungs-Modul

set -e

MCP_DIR="/opt/mcp"
CHART_MODULE="$MCP_DIR/chart-calculation.js"

echo "🔧 Fix: Syntax-Fehler im Chart-Modul"
echo "======================================"
echo ""

# 1. Wiederherstellen des letzten Backups
echo "1. Suche letztes Backup..."
BACKUP=$(ls -t "$CHART_MODULE".backup.* 2>/dev/null | head -1)

if [ -z "$BACKUP" ]; then
    echo "   ❌ Kein Backup gefunden!"
    echo "   📋 Prüfe manuell: ls -la $CHART_MODULE.backup.*"
    exit 1
fi

echo "   ✅ Backup gefunden: $BACKUP"
echo "   📝 Stelle wieder her..."
cp "$BACKUP" "$CHART_MODULE"
echo "   ✅ Wiederhergestellt"
echo ""

# 2. Prüfe Syntax
echo "2. Prüfe JavaScript-Syntax..."
if node -c "$CHART_MODULE" 2>/dev/null; then
    echo "   ✅ Syntax OK"
else
    echo "   ❌ Syntax-Fehler!"
    node -c "$CHART_MODULE" 2>&1 | head -5
    exit 1
fi
echo ""

# 3. Füge extractChartDataFromReading korrekt hinzu
echo "3. Füge extractChartDataFromReading korrekt hinzu..."

# Finde die letzte Methode vor dem letzten }
# Füge extractChartDataFromReading VOR dem letzten } der Klasse hinzu

# Erstelle temporäre Datei
TEMP_FILE=$(mktemp)

# Kopiere alles bis zum letzten } der Klasse
awk '
BEGIN { inClass = 0; braceCount = 0; lastMethodEnd = 0 }
/^class ChartCalculationService/ { 
    inClass = 1
    braceCount = 0
}
inClass {
    # Zähle geschweifte Klammern
    braceCount += gsub(/{/, "")
    braceCount -= gsub(/}/, "")
    
    # Wenn wir am Ende der Klasse sind (braceCount == 0 und wir haben eine schließende Klammer)
    if (braceCount == 0 && /^}/ && inClass) {
        # Füge extractChartDataFromReading vor dem letzten } hinzu
        print ""
        print "  extractChartDataFromReading(readingText) {"
        print "    if (!readingText) return {};"
        print "    "
        print "    // Extrahiere Typ"
        print "    let type = null;"
        print "    const typePatterns = ["
        print "      /Typ ist der (\\w+)/i,"
        print "      /Typ: (\\w+)/i,"
        print "      /Sie sind ein (\\w+)/i,"
        print "      /(\\w+) Typ/i"
        print "    ];"
        print "    for (const pattern of typePatterns) {"
        print "      const match = readingText.match(pattern);"
        print "      if (match) {"
        print "        type = match[1];"
        print "        break;"
        print "      }"
        print "    }"
        print "    "
        print "    // Extrahiere Profil"
        print "    let profile = null;"
        print "    const profileMatch = readingText.match(/Profil ist (\\d+\\/\\d+)/i) ||"
        print "                         readingText.match(/Profil: (\\d+\\/\\d+)/i) ||"
        print "                         readingText.match(/(\\d+\\/\\d+)/);"
        print "    if (profileMatch) {"
        print "      profile = profileMatch[1];"
        print "    }"
        print "    "
        print "    // Extrahiere Autorität"
        print "    let authority = null;"
        print "    const authorityMatch = readingText.match(/Autorität.*?ist ([\\w\\s]+?)(?:\\.|,|$)/i) ||"
        print "                         readingText.match(/Ihre Autorität ist ([\\w\\s]+?)(?:\\.|,|$)/i);"
        print "    if (authorityMatch) {"
        print "      authority = authorityMatch[1].trim();"
        print "    }"
        print "    "
        print "    // Extrahiere Strategie"
        print "    let strategy = null;"
        print "    const strategyMatch = readingText.match(/Strategie.*?ist ([\\w\\s]+?)(?:\\.|,|$)/i) ||"
        print "                        readingText.match(/Ihre Strategie ist ([\\w\\s]+?)(?:\\.|,|$)/i);"
        print "    if (strategyMatch) {"
        print "      strategy = strategyMatch[1].trim();"
        print "    }"
        print "    "
        print "    return {"
        print "      type,"
        print "      profile,"
        print "      authority,"
        print "      strategy,"
        print "      centers: {},"
        print "      gates: {},"
        print "      channels: {},"
        print "      incarnationCross: null"
        print "    };"
        print "  }"
        inClass = 0
    }
    print
}
!inClass { print }
' "$CHART_MODULE" > "$TEMP_FILE"

# Ersetze
mv "$TEMP_FILE" "$CHART_MODULE"

echo "   ✅ Methode hinzugefügt"
echo ""

# 4. Prüfe Syntax erneut
echo "4. Prüfe Syntax erneut..."
if node -c "$CHART_MODULE" 2>/dev/null; then
    echo "   ✅ Syntax OK"
else
    echo "   ❌ Syntax-Fehler!"
    node -c "$CHART_MODULE" 2>&1 | head -10
    echo ""
    echo "   📋 Stelle Backup wieder her..."
    cp "$BACKUP" "$CHART_MODULE"
    exit 1
fi
echo ""

# 5. Aktualisiere calculateViaReadingAgent
echo "5. Aktualisiere calculateViaReadingAgent..."

# Erstelle temporäre Datei
TEMP_FILE=$(mktemp)

# Ersetze die Return-Zeile in calculateViaReadingAgent
sed 's/return this.normalizeChartData(data.chartData || {});/const chartData = this.extractChartDataFromReading(data.reading || "");\n    return this.normalizeChartData(chartData);/' "$CHART_MODULE" > "$TEMP_FILE"

# Prüfe ob Ersetzung erfolgreich war
if grep -q "extractChartDataFromReading" "$TEMP_FILE"; then
    mv "$TEMP_FILE" "$CHART_MODULE"
    echo "   ✅ calculateViaReadingAgent aktualisiert"
else
    echo "   ⚠️  Ersetzung fehlgeschlagen, verwende manuellen Ansatz..."
    rm "$TEMP_FILE"
    
    # Manuell: Finde die Zeile und ersetze sie
    sed -i 's|return this.normalizeChartData(data.chartData || {});|const chartData = this.extractChartDataFromReading(data.reading || "");\n    return this.normalizeChartData(chartData);|' "$CHART_MODULE"
    echo "   ✅ Manuell aktualisiert"
fi
echo ""

# 6. Prüfe Syntax final
echo "6. Finale Syntax-Prüfung..."
if node -c "$CHART_MODULE" 2>/dev/null; then
    echo "   ✅ Syntax OK"
else
    echo "   ❌ Syntax-Fehler!"
    node -c "$CHART_MODULE" 2>&1 | head -10
    echo ""
    echo "   📋 Stelle Backup wieder her..."
    cp "$BACKUP" "$CHART_MODULE"
    exit 1
fi
echo ""

# 7. MCP Server neu starten
echo "7. Starte MCP Server neu..."
systemctl restart mcp
sleep 5

if systemctl is-active --quiet mcp; then
    echo "   ✅ MCP Server läuft"
    
    # Prüfe Logs
    echo "   📄 Logs (letzte 3 Zeilen):"
    journalctl -u mcp -n 3 --no-pager | tail -3
else
    echo "   ❌ MCP Server Fehler"
    journalctl -u mcp -n 10 --no-pager
    exit 1
fi
echo ""

# 8. Test
echo "8. Teste Chart-Berechnung..."
sleep 2
TEST_RESULT=$(curl -s -X POST http://localhost:7000/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin, Germany"}')

if echo "$TEST_RESULT" | grep -q '"type":'; then
    echo "   ✅ Chart-Daten extrahiert!"
    echo "   📄 Typ:"
    echo "$TEST_RESULT" | grep -o '"type":"[^"]*"' | head -1
    echo "   📄 Profil:"
    echo "$TEST_RESULT" | grep -o '"profile":"[^"]*"' | head -1
else
    echo "   ⚠️  Chart-Daten noch leer oder Fehler"
    echo "   📄 Response (erste Zeile):"
    echo "$TEST_RESULT" | head -1
fi
echo ""

echo "======================================"
echo "✅ Fix abgeschlossen!"
echo "======================================"
echo ""

