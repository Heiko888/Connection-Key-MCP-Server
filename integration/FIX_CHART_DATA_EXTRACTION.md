# 🔧 Fix: Chart-Daten aus Reading extrahieren

## ✅ Status

- ✅ Chart-Berechnung funktioniert
- ✅ Method "reading" wird verwendet
- ⚠️ **Problem:** `chartData` ist leer (nur null-Werte)

**Aktuelle Response:**
```json
{
  "success": true,
  "chartData": {
    "type": null,
    "profile": null,
    "authority": null,
    ...
  },
  "method": "reading"
}
```

---

## ❌ Problem

Der Reading Agent gibt **keine strukturierten Chart-Daten** zurück, sondern nur:
- `reading` (Text)
- `readingType`
- `birthDate`, `birthTime`, `birthPlace`
- `tokens`

**Kein `chartData` Objekt!**

---

## ✅ Lösung

### Option 1: Chart-Daten aus Reading-Text extrahieren

Das Chart-Berechnungs-Modul muss den Reading-Text analysieren und Chart-Daten extrahieren:

```javascript
// In chart-calculation.js - calculateViaReadingAgent()
async calculateViaReadingAgent(birthDate, birthTime, birthPlace) {
  const readingAgentUrl = process.env.READING_AGENT_URL || 'http://localhost:4001';
  
  const response = await fetch(`${readingAgentUrl}/reading/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      birthDate,
      birthTime,
      birthPlace,
      readingType: 'detailed'
    })
  });

  if (!response.ok) {
    throw new Error(`Reading Agent failed: ${response.status}`);
  }

  const data = await response.json();
  
  // Extrahiere Chart-Daten aus Reading-Text
  const chartData = this.extractChartDataFromReading(data.reading);
  
  return chartData;
}

extractChartDataFromReading(readingText) {
  // Extrahiere Typ (z.B. "Projector", "Generator")
  const typeMatch = readingText.match(/Typ ist der (\w+)/i) || 
                    readingText.match(/Typ: (\w+)/i) ||
                    readingText.match(/Sie sind ein (\w+)/i);
  const type = typeMatch ? typeMatch[1] : null;
  
  // Extrahiere Profil (z.B. "4/6", "1/3")
  const profileMatch = readingText.match(/Profil ist (\d+\/\d+)/i) ||
                       readingText.match(/Profil: (\d+\/\d+)/i);
  const profile = profileMatch ? profileMatch[1] : null;
  
  // Extrahiere Autorität
  const authorityMatch = readingText.match(/Autorität.*?ist ([\w\s]+)/i) ||
                         readingText.match(/Ihre Autorität ist ([\w\s]+)/i);
  const authority = authorityMatch ? authorityMatch[1].trim() : null;
  
  // Extrahiere Strategie
  const strategyMatch = readingText.match(/Strategie.*?ist ([\w\s]+)/i) ||
                         readingText.match(/Ihre Strategie ist ([\w\s]+)/i);
  const strategy = strategyMatch ? strategyMatch[1].trim() : null;
  
  return {
    type,
    profile,
    authority,
    strategy,
    // Weitere Felder können hier extrahiert werden
  };
}
```

### Option 2: n8n Webhook für Chart-Berechnung

Erstellen Sie einen n8n Workflow, der Chart-Daten berechnet:

**n8n Webhook:** `/webhook/chart-calculation`

**Workflow:**
1. Webhook empfängt: `{birthDate, birthTime, birthPlace}`
2. Chart-Berechnung (externe API oder Bibliothek)
3. Gibt strukturierte Chart-Daten zurück

### Option 3: Reading Agent erweitern

Erweitern Sie den Reading Agent, um `chartData` zurückzugeben:

```javascript
// In production/server.js - /reading/generate Endpoint
res.json({
  success: true,
  readingId,
  reading,
  readingType,
  birthDate,
  birthTime,
  birthPlace,
  chartData: {
    type: extractedType,
    profile: extractedProfile,
    authority: extractedAuthority,
    // ...
  },
  tokens: completion.usage.total_tokens,
  timestamp: new Date().toISOString()
});
```

---

## 🛠️ Quick Fix: Chart-Daten extrahieren

**Anpassen Sie `/opt/mcp/chart-calculation.js`:**

```javascript
async calculateViaReadingAgent(birthDate, birthTime, birthPlace) {
  const readingAgentUrl = process.env.READING_AGENT_URL || 'http://localhost:4001';
  
  const response = await fetch(`${readingAgentUrl}/reading/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      birthDate,
      birthTime,
      birthPlace,
      readingType: 'detailed'
    })
  });

  if (!response.ok) {
    throw new Error(`Reading Agent failed: ${response.status}`);
  }

  const data = await response.json();
  
  // Extrahiere Chart-Daten aus Reading-Text
  return this.extractChartDataFromReading(data.reading || '');
}

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

---

## 📋 Zusammenfassung

**Status:**
- ✅ Chart-Berechnung funktioniert
- ✅ Endpoints vorhanden
- ⚠️ Chart-Daten sind leer (müssen extrahiert werden)

**Lösung:**
1. ✅ Chart-Daten aus Reading-Text extrahieren (empfohlen)
2. ✅ Oder n8n Webhook für Chart-Berechnung erstellen
3. ✅ Oder Reading Agent erweitern

**Nächste Schritte:**
- Chart-Berechnungs-Modul anpassen (extractChartDataFromReading)
- Oder n8n Workflow für Chart-Berechnung erstellen

