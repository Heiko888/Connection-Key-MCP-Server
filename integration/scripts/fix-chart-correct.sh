#!/bin/bash
# Korrekte Lösung: Chart-Daten-Extraktion hinzufügen

set -e

MCP_DIR="/opt/mcp"
CHART_MODULE="$MCP_DIR/chart-calculation.js"
BACKUP_FILE="$CHART_MODULE.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔧 Fix: Chart-Daten-Extraktion (korrekt)"
echo "========================================="
echo ""

# Backup
cp "$CHART_MODULE" "$BACKUP_FILE"
echo "✅ Backup: $BACKUP_FILE"
echo ""

# Prüfe ob bereits vorhanden
if grep -q "extractChartDataFromReading" "$CHART_MODULE"; then
    echo "⚠️  extractChartDataFromReading bereits vorhanden"
    echo "   Überspringe..."
    exit 0
fi

echo "📝 Füge Chart-Daten-Extraktion hinzu..."
echo ""

# Erstelle temporäre Datei
TEMP_FILE=$(mktemp)

# Verwende Python für robuste Text-Manipulation
python3 << 'PYTHON_END' > "$TEMP_FILE"
import re
import sys

# Lese Datei
with open('/opt/mcp/chart-calculation.js', 'r') as f:
    content = f.read()

# Prüfe ob bereits vorhanden
if 'extractChartDataFromReading' in content:
    print(content)
    sys.exit(0)

# Finde die letzte Methode vor dem letzten } der Klasse
# Suche nach dem letzten } nach der normalizeChartData Methode
# oder nach dem letzten } der Klasse

# Finde normalizeChartData Methode
normalize_match = re.search(r'normalizeChartData\([^)]+\)\s*\{[^}]*\}', content, re.DOTALL)
if normalize_match:
    # Füge extractChartDataFromReading nach normalizeChartData hinzu
    insert_pos = normalize_match.end()
    
    # Suche das nächste } (Ende der Klasse)
    class_end = content.find('}', insert_pos)
    
    # Extrahiere Methode-Code
    extract_method = '''
  extractChartDataFromReading(readingText) {
    if (!readingText) return {};
    
    // Extrahiere Typ
    let type = null;
    const typePatterns = [
      /Typ ist der (\\w+)/i,
      /Typ: (\\w+)/i,
      /Sie sind ein (\\w+)/i,
      /(\\w+) Typ/i
    ];
    for (const pattern of typePatterns) {
      const match = readingText.match(pattern);
      if (match) {
        type = match[1];
        break;
      }
    }
    
    // Extrahiere Profil
    let profile = null;
    const profileMatch = readingText.match(/Profil ist (\\d+\\/\\d+)/i) ||
                         readingText.match(/Profil: (\\d+\\/\\d+)/i) ||
                         readingText.match(/(\\d+\\/\\d+)/);
    if (profileMatch) {
      profile = profileMatch[1];
    }
    
    // Extrahiere Autorität
    let authority = null;
    const authorityMatch = readingText.match(/Autorität.*?ist ([\\w\\s]+?)(?:\\.|,|$)/i) ||
                         readingText.match(/Ihre Autorität ist ([\\w\\s]+?)(?:\\.|,|$)/i);
    if (authorityMatch) {
      authority = authorityMatch[1].trim();
    }
    
    // Extrahiere Strategie
    let strategy = null;
    const strategyMatch = readingText.match(/Strategie.*?ist ([\\w\\s]+?)(?:\\.|,|$)/i) ||
                        readingText.match(/Ihre Strategie ist ([\\w\\s]+?)(?:\\.|,|$)/i);
    if (strategyMatch) {
      strategy = strategyMatch[1].trim();
    }
    
    return {
      type,
      profile,
      authority,
      strategy,
      centers: {},
      gates: {},
      channels: {},
      incarnationCross: null
    };
  }
'''
    
    # Füge Methode vor dem letzten } der Klasse ein
    new_content = content[:class_end] + extract_method + '\n' + content[class_end:]
    print(new_content)
else:
    # Fallback: Füge am Ende der Klasse hinzu (vor dem letzten })
    # Finde letztes } nach "class ChartCalculationService"
    class_start = content.find('class ChartCalculationService')
    if class_start != -1:
        # Finde alle } nach class_start
        brace_positions = []
        brace_count = 0
        for i in range(class_start, len(content)):
            if content[i] == '{':
                brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    brace_positions.append(i)
        
        if brace_positions:
            # Letztes } ist das Ende der Klasse
            class_end = brace_positions[-1]
            
            extract_method = '''
  extractChartDataFromReading(readingText) {
    if (!readingText) return {};
    
    // Extrahiere Typ
    let type = null;
    const typePatterns = [
      /Typ ist der (\\w+)/i,
      /Typ: (\\w+)/i,
      /Sie sind ein (\\w+)/i,
      /(\\w+) Typ/i
    ];
    for (const pattern of typePatterns) {
      const match = readingText.match(pattern);
      if (match) {
        type = match[1];
        break;
      }
    }
    
    // Extrahiere Profil
    let profile = null;
    const profileMatch = readingText.match(/Profil ist (\\d+\\/\\d+)/i) ||
                         readingText.match(/Profil: (\\d+\\/\\d+)/i) ||
                         readingText.match(/(\\d+\\/\\d+)/);
    if (profileMatch) {
      profile = profileMatch[1];
    }
    
    // Extrahiere Autorität
    let authority = null;
    const authorityMatch = readingText.match(/Autorität.*?ist ([\\w\\s]+?)(?:\\.|,|$)/i) ||
                         readingText.match(/Ihre Autorität ist ([\\w\\s]+?)(?:\\.|,|$)/i);
    if (authorityMatch) {
      authority = authorityMatch[1].trim();
    }
    
    // Extrahiere Strategie
    let strategy = null;
    const strategyMatch = readingText.match(/Strategie.*?ist ([\\w\\s]+?)(?:\\.|,|$)/i) ||
                        readingText.match(/Ihre Strategie ist ([\\w\\s]+?)(?:\\.|,|$)/i);
    if (strategyMatch) {
      strategy = strategyMatch[1].trim();
    }
    
    return {
      type,
      profile,
      authority,
      strategy,
      centers: {},
      gates: {},
      channels: {},
      incarnationCross: null
    };
  }
'''
            new_content = content[:class_end] + extract_method + '\n' + content[class_end:]
            print(new_content)
        else:
            print(content)
    else:
        print(content)
PYTHON_END

# Ersetze
mv "$TEMP_FILE" "$CHART_MODULE"

echo "   ✅ Methode hinzugefügt"
echo ""

# Aktualisiere calculateViaReadingAgent
echo "4. Aktualisiere calculateViaReadingAgent..."

# Erstelle temporäre Datei
TEMP_FILE=$(mktemp)

# Ersetze die Return-Zeile
sed 's|return this.normalizeChartData(data.chartData || {});|const chartData = this.extractChartDataFromReading(data.reading || "");\n    return this.normalizeChartData(chartData);|' "$CHART_MODULE" > "$TEMP_FILE"

# Prüfe ob Ersetzung erfolgreich war
if grep -q "extractChartDataFromReading" "$TEMP_FILE"; then
    mv "$TEMP_FILE" "$CHART_MODULE"
    echo "   ✅ calculateViaReadingAgent aktualisiert"
else
    echo "   ⚠️  Ersetzung fehlgeschlagen"
    rm "$TEMP_FILE"
    exit 1
fi
echo ""

# Prüfe Syntax
echo "5. Prüfe Syntax..."
if node -c "$CHART_MODULE" 2>/dev/null; then
    echo "   ✅ Syntax OK"
else
    echo "   ❌ Syntax-Fehler!"
    node -c "$CHART_MODULE" 2>&1 | head -10
    echo ""
    echo "   📋 Stelle Backup wieder her..."
    cp "$BACKUP_FILE" "$CHART_MODULE"
    exit 1
fi
echo ""

# MCP Server neu starten
echo "6. Starte MCP Server neu..."
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

# Test
echo "7. Teste Chart-Berechnung..."
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

echo "========================================="
echo "✅ Fix abgeschlossen!"
echo "========================================="
echo ""

