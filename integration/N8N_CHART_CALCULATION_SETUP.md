# 🔧 n8n Chart-Berechnungs-Workflow Setup

## 📋 Übersicht

Dieser Workflow berechnet vollständige Human Design Chart-Daten basierend auf Geburtsdaten.

---

## 🚀 Setup-Schritte

### Schritt 1: Workflow in n8n importieren

1. Öffnen Sie n8n: `https://werdemeisterdeinergedankenagent.de` (oder `http://138.199.237.34:5678`)
2. Klicken Sie auf **"Workflows"** → **"Import from File"**
3. Wählen Sie `integration/n8n-workflows/chart-calculation-workflow.json`
4. Klicken Sie auf **"Import"**

### Schritt 2: Workflow aktivieren

1. Klicken Sie auf **"Active"** Toggle (oben rechts)
2. Der Workflow ist jetzt aktiv und wartet auf Webhook-Requests

### Schritt 3: Webhook-URL notieren

Die Webhook-URL ist:
```
https://werdemeisterdeinergedankenagent.de/webhook/chart-calculation
```
oder
```
http://138.199.237.34:5678/webhook/chart-calculation
```

---

## 🔧 Workflow-Konfiguration

### Webhook Node

- **Path:** `chart-calculation`
- **Method:** POST
- **Response Mode:** Last Node

### Calculate Chart Data Node

**Aktuell:** Placeholder-Code (muss implementiert werden)

**Optionen für Implementierung:**

#### Option A: Externe API nutzen

```javascript
// Beispiel: human-design-api
const response = await fetch('https://api.human-design.com/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ birthDate, birthTime, birthPlace })
});

const chartData = await response.json();
return { json: chartData };
```

#### Option B: Swiss Ephemeris nutzen

```javascript
// Nutze Swiss Ephemeris Node.js Bibliothek
const swisseph = require('swisseph');

// Berechne Planetenpositionen
const julianDay = swisseph.swe_julday(year, month, day, swisseph.SE_GREG_CAL);
const planets = swisseph.swe_calc_ut(julianDay, swisseph.SE_SUN, swisseph.SEFLG_SWIEPH);

// Konvertiere zu Human Design Gates
const gates = calculateGates(planets);
```

#### Option C: OpenAI für Berechnung nutzen

```javascript
// Nutze OpenAI für Chart-Berechnung
const openai = require('openai');
const client = new openai.OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const completion = await client.chat.completions.create({
  model: "gpt-4",
  messages: [{
    role: "system",
    content: "Du bist ein Human Design Chart-Berechnungs-Experte. Berechne vollständige Chart-Daten basierend auf Geburtsdaten."
  }, {
    role: "user",
    content: `Berechne Human Design Chart für:\nGeburtsdatum: ${birthDate}\nGeburtszeit: ${birthTime}\nGeburtsort: ${birthPlace}\n\nGib die Daten als JSON zurück.`
  }]
});

const chartData = JSON.parse(completion.choices[0].message.content);
return { json: chartData };
```

---

## 🔗 Integration mit Reading Agent

### Reading Agent erweitern

**In `production/server.js` - `/reading/generate` Endpoint:**

```javascript
// Nach OpenAI API Call
const reading = completion.choices[0].message.content;

// NEU: Berechne vollständige Chart-Daten via n8n
let chartData = {};
try {
  const n8nUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
  const chartResponse = await fetch(`${n8nUrl}/webhook/chart-calculation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ birthDate, birthTime, birthPlace })
  });
  
  if (chartResponse.ok) {
    chartData = await chartResponse.json();
  }
} catch (error) {
  console.warn('Chart-Berechnung via n8n fehlgeschlagen:', error.message);
  // Fallback: Basis-Daten aus Reading-Text extrahieren
  chartData = extractBasicChartData(reading);
}

res.json({
  success: true,
  readingId,
  reading,
  chartData, // ← Vollständige Chart-Daten!
  readingType,
  birthDate,
  birthTime,
  birthPlace,
  tokens: completion.usage.total_tokens,
  timestamp: new Date().toISOString()
});
```

---

## 🧪 Test

### Test-Request

```bash
curl -X POST http://138.199.237.34:5678/webhook/chart-calculation \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany"
  }'
```

### Erwartete Response

```json
{
  "type": "Generator",
  "profile": "1/3",
  "authority": "Sacral",
  "strategy": "Wait to respond",
  "planets": {
    "sun": { "gate": 43, "line": 2 },
    "moon": { "gate": 23, "line": 4 },
    ...
  },
  "gates": {
    "defined": [1, 2, 7, 10, 13, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
    "undefined": [...],
    "emphasis": [1, 2, 7, 10, 13, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]
  },
  "channels": {
    "active": ["1-8", "2-14", "3-60", "7-31", "10-20", "13-33"],
    "details": {}
  },
  "centers": {
    "defined": ["Sacral", "Root", "Solar Plexus"],
    "undefined": ["Head", "Ajna", "Throat", "G", "Heart", "Spleen"],
    "details": {}
  },
  "incarnationCross": {
    "name": "Right Angle Cross of Rulership",
    "type": "Right Angle",
    "sunGate": 43,
    "sunLine": 2,
    "earthGate": 23,
    "earthLine": 4
  },
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "birthPlace": "Berlin, Germany",
  "calculatedAt": "2025-12-09T01:00:00.000Z"
}
```

---

## 📋 Nächste Schritte

1. ✅ **Workflow importieren** - Chart-Berechnungs-Workflow in n8n importieren
2. ✅ **Berechnungs-Logik implementieren** - Code Node mit Chart-Berechnung füllen
3. ✅ **Reading Agent erweitern** - n8n Webhook in Reading Agent integrieren
4. ✅ **Testen** - Chart-Berechnung testen

---

## 🔍 Troubleshooting

### Webhook antwortet nicht

- Prüfen Sie, ob der Workflow aktiviert ist
- Prüfen Sie die Webhook-URL
- Prüfen Sie n8n Logs: `docker logs the-connection-key-n8n-1`

### Chart-Daten sind leer

- Prüfen Sie die Berechnungs-Logik im Code Node
- Prüfen Sie, ob externe APIs erreichbar sind
- Prüfen Sie n8n Execution Logs

### Reading Agent kann n8n nicht erreichen

- Prüfen Sie `N8N_BASE_URL` in `production/.env`
- Prüfen Sie Firewall-Regeln
- Prüfen Sie, ob n8n läuft: `docker ps | grep n8n`

