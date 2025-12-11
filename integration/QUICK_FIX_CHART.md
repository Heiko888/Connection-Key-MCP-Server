# 🚀 Quick Fix: Chart-Daten-Extraktion

## ❌ Problem

Syntax-Fehler im Chart-Modul nach automatischer Einfügung.

---

## ✅ Lösung: Manuell (5 Minuten)

### Schritt 1: Öffnen Sie das Modul

```bash
nano /opt/mcp/chart-calculation.js
```

### Schritt 2: Finden Sie diese Zeile (ca. Zeile 163)

```javascript
    return this.normalizeChartData(data.chartData || {});
  }
```

### Schritt 3: Ersetzen Sie diese Zeile durch:

```javascript
    // Extrahiere Chart-Daten aus Reading-Text
    const chartData = this.extractChartDataFromReading(data.reading || '');
    return this.normalizeChartData(chartData);
  }
```

### Schritt 4: Finden Sie diese Zeile (ca. Zeile 190)

```javascript
  }
}

const chartCalculationService = new ChartCalculationService();
```

### Schritt 5: Fügen Sie VOR dem letzten `}` der Klasse ein:

```javascript
  extractChartDataFromReading(readingText) {
    if (!readingText) return {};
    
    // Extrahiere Typ
    let type = null;
    const typePatterns = [
      /Typ ist der (\w+)/i,
      /Typ: (\w+)/i,
      /Sie sind ein (\w+)/i,
      /(\w+) Typ/i
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
    const profileMatch = readingText.match(/Profil ist (\d+\/\d+)/i) ||
                         readingText.match(/Profil: (\d+\/\d+)/i) ||
                         readingText.match(/(\d+\/\d+)/);
    if (profileMatch) {
      profile = profileMatch[1];
    }
    
    // Extrahiere Autorität
    let authority = null;
    const authorityMatch = readingText.match(/Autorität.*?ist ([\w\s]+?)(?:\.|,|$)/i) ||
                         readingText.match(/Ihre Autorität ist ([\w\s]+?)(?:\.|,|$)/i);
    if (authorityMatch) {
      authority = authorityMatch[1].trim();
    }
    
    // Extrahiere Strategie
    let strategy = null;
    const strategyMatch = readingText.match(/Strategie.*?ist ([\w\s]+?)(?:\.|,|$)/i) ||
                        readingText.match(/Ihre Strategie ist ([\w\s]+?)(?:\.|,|$)/i);
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
```

### Schritt 6: Speichern und testen

```bash
# In nano: Ctrl+O, Enter, Ctrl+X

# Syntax prüfen
node -c /opt/mcp/chart-calculation.js

# MCP Server neu starten
systemctl restart mcp
sleep 3

# Test
curl -X POST http://localhost:7000/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin, Germany"}'
```

---

## 🎯 Erwartetes Ergebnis

**Response sollte enthalten:**
```json
{
  "chartData": {
    "type": "Projector",
    "profile": "4/6",
    "authority": "emotional",
    "strategy": "Warten auf Einladung"
  }
}
```

---

## ✅ Zusammenfassung

1. ✅ Öffne `/opt/mcp/chart-calculation.js`
2. ✅ Ersetze `return this.normalizeChartData(data.chartData || {});` in `calculateViaReadingAgent`
3. ✅ Füge `extractChartDataFromReading` vor dem letzten `}` der Klasse hinzu
4. ✅ Speichere und teste

