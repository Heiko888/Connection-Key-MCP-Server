# 🔧 Reading Agent erweitern - n8n Chart-Berechnung

## 📋 Übersicht

Erweitern Sie den Reading Agent, um vollständige Chart-Daten via n8n Webhook zu berechnen.

---

## 🚀 Implementierung

### Schritt 1: Environment Variable setzen

**In `production/.env`:**

```bash
N8N_BASE_URL=http://localhost:5678
# oder
N8N_BASE_URL=https://werdemeisterdeinergedankenagent.de
```

### Schritt 2: Reading Agent erweitern

**In `production/server.js` - `/reading/generate` Endpoint:**

**Finden Sie diese Stelle (ca. Zeile 250):**

```javascript
res.json({
  success: true,
  readingId,
  reading,
  readingType,
  birthDate,
  birthTime,
  birthPlace,
  tokens: completion.usage.total_tokens,
  timestamp: new Date().toISOString()
});
```

**Ersetzen Sie durch:**

```javascript
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
    log("info", "Chart-Daten via n8n berechnet", {
      birthDate,
      type: chartData.type,
      profile: chartData.profile
    });
  } else {
    log("warn", "Chart-Berechnung via n8n fehlgeschlagen", {
      status: chartResponse.status,
      birthDate
    });
    // Fallback: Basis-Daten aus Reading-Text extrahieren
    chartData = extractBasicChartData(reading);
  }
} catch (error) {
  log("error", "Chart-Berechnung Fehler", {
    error: error.message,
    birthDate
  });
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

### Schritt 3: Fallback-Funktion hinzufügen

**Fügen Sie diese Funktion VOR dem `/reading/generate` Endpoint hinzu:**

```javascript
/**
 * Extrahiert Basis-Chart-Daten aus Reading-Text (Fallback)
 */
function extractBasicChartData(readingText) {
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

## 🧪 Test

### 1. Test n8n Webhook direkt

```bash
curl -X POST http://138.199.237.34:5678/webhook/chart-calculation \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany"
  }'
```

### 2. Test Reading Agent

```bash
curl -X POST http://localhost:4001/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany",
    "readingType": "detailed"
  }' | jq '.chartData'
```

**Erwartete Response sollte `chartData` enthalten!**

---

## 📋 Zusammenfassung

1. ✅ **Environment Variable setzen** - `N8N_BASE_URL` in `production/.env`
2. ✅ **Reading Agent erweitern** - n8n Webhook in `/reading/generate` integrieren
3. ✅ **Fallback-Funktion hinzufügen** - `extractBasicChartData` für Fehlerfälle
4. ✅ **Testen** - Chart-Berechnung testen

---

## 🔍 Troubleshooting

### n8n Webhook antwortet nicht

- Prüfen Sie, ob der Workflow aktiviert ist
- Prüfen Sie die Webhook-URL
- Prüfen Sie n8n Logs: `docker logs the-connection-key-n8n-1`

### Chart-Daten sind leer

- Prüfen Sie, ob n8n Workflow korrekt implementiert ist
- Prüfen Sie Fallback-Funktion
- Prüfen Sie Reading Agent Logs: `pm2 logs reading-agent`

### Reading Agent kann n8n nicht erreichen

- Prüfen Sie `N8N_BASE_URL` in `production/.env`
- Prüfen Sie Firewall-Regeln
- Prüfen Sie, ob n8n läuft: `docker ps | grep n8n`

