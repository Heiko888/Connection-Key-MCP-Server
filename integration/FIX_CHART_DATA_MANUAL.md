# 🔧 Fix: Chart-Daten aus Reading extrahieren (Manuell)

## ✅ Status

- ✅ Chart-Berechnung funktioniert
- ✅ Method "reading" wird verwendet
- ⚠️ **Problem:** `chartData` ist leer (nur null-Werte)

**Ursache:** Der Reading Agent gibt keine strukturierten Chart-Daten zurück, sondern nur den Reading-Text.

---

## 🛠️ Lösung: Chart-Daten aus Reading-Text extrahieren

### Schritt 1: Öffnen Sie das Chart-Berechnungs-Modul

```bash
nano /opt/mcp/chart-calculation.js
```

### Schritt 2: Finden Sie die `calculateViaReadingAgent` Methode

Suchen Sie nach:
```javascript
async calculateViaReadingAgent(birthDate, birthTime, birthPlace) {
```

### Schritt 3: Ersetzen Sie die Return-Zeile

**Finden Sie diese Zeile:**
```javascript
return this.normalizeChartData(data.chartData || {});
```

**Ersetzen Sie sie durch:**
```javascript
// Extrahiere Chart-Daten aus Reading-Text
const chartData = this.extractChartDataFromReading(data.reading || '');
return this.normalizeChartData(chartData);
```

### Schritt 4: Fügen Sie die `extractChartDataFromReading` Methode hinzu

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

### Schritt 5: Speichern und MCP Server neu starten

```bash
# Speichern (in nano: Ctrl+O, Enter, Ctrl+X)

# MCP Server neu starten
systemctl restart mcp
sleep 3

# Test
curl -X POST http://localhost:7000/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin, Germany"}'
```

---

## 🚀 Oder: Automatisches Script

```bash
cd /opt/mcp-connection-key
chmod +x integration/scripts/fix-chart-data-simple.sh
./integration/scripts/fix-chart-data-simple.sh
```

---

## 📋 Erwartetes Ergebnis

**Vorher:**
```json
{
  "chartData": {
    "type": null,
    "profile": null,
    ...
  }
}
```

**Nachher:**
```json
{
  "chartData": {
    "type": "Projector",
    "profile": "4/6",
    "authority": "emotional",
    "strategy": "Warten auf Einladung",
    ...
  }
}
```

---

## ✅ Zusammenfassung

1. ✅ Öffnen Sie `/opt/mcp/chart-calculation.js`
2. ✅ Ersetzen Sie `return this.normalizeChartData(data.chartData || {});`
3. ✅ Fügen Sie `extractChartDataFromReading` Methode hinzu
4. ✅ Starten Sie MCP Server neu
5. ✅ Testen Sie

