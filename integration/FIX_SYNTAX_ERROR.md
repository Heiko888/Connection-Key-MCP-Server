# 🔧 Fix: Syntax-Fehler im Chart-Modul

## ❌ Problem

**Fehler:**
```
SyntaxError: Unexpected token
at Object.<anonymous> (/opt/mcp/server.js:6:33)
```

**Ursache:** Das Script hat ungültigen JavaScript-Code in `chart-calculation.js` eingefügt.

---

## ✅ Lösung

### Schritt 1: Backup wiederherstellen

```bash
# Finde letztes Backup
ls -t /opt/mcp/chart-calculation.js.backup.* | head -1

# Stelle wieder her
cp /opt/mcp/chart-calculation.js.backup.20251209_015618 /opt/mcp/chart-calculation.js
```

### Schritt 2: Syntax prüfen

```bash
node -c /opt/mcp/chart-calculation.js
```

**Sollte keine Fehler ausgeben.**

### Schritt 3: Automatisches Fix-Script ausführen

```bash
cd /opt/mcp-connection-key
chmod +x integration/scripts/fix-chart-syntax-error.sh
./integration/scripts/fix-chart-syntax-error.sh
```

---

## 🛠️ Oder: Manuell fixen

### 1. Öffnen Sie das Modul

```bash
nano /opt/mcp/chart-calculation.js
```

### 2. Finden Sie `calculateViaReadingAgent`

Suchen Sie nach:
```javascript
async calculateViaReadingAgent(birthDate, birthTime, birthPlace) {
  // ... Code ...
  return this.normalizeChartData(data.chartData || {});
}
```

### 3. Ersetzen Sie die Return-Zeile

**Finden Sie:**
```javascript
return this.normalizeChartData(data.chartData || {});
```

**Ersetzen Sie durch:**
```javascript
// Extrahiere Chart-Daten aus Reading-Text
const chartData = this.extractChartDataFromReading(data.reading || '');
return this.normalizeChartData(chartData);
```

### 4. Fügen Sie `extractChartDataFromReading` hinzu

**Fügen Sie diese Methode VOR dem letzten `}` der Klasse hinzu:**

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

### 5. Speichern und testen

```bash
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

## 📋 Zusammenfassung

1. ✅ Stelle Backup wieder her
2. ✅ Prüfe Syntax
3. ✅ Füge `extractChartDataFromReading` hinzu
4. ✅ Aktualisiere `calculateViaReadingAgent`
5. ✅ Teste

