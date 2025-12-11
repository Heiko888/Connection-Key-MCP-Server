# 🔗 Workflow-URL finden

## 📋 Was ist die Workflow-URL?

Die **Workflow-URL** ist die **Webhook-URL**, die n8n für Ihren Workflow generiert. Diese URL können Sie verwenden, um den Workflow von außen aufzurufen.

---

## 🚀 So finden Sie die Workflow-URL

### Schritt 1: Workflow in n8n öffnen

1. Öffnen Sie n8n: `https://werdemeisterdeinergedankenagent.de`
2. Klicken Sie auf **"Workflows"** (links)
3. Klicken Sie auf den Workflow **"Chart Calculation - Human Design"**

### Schritt 2: Webhook Node öffnen

1. Klicken Sie auf den **"Webhook - Chart Calculation"** Node (erster Node)
2. Die Webhook-URL wird angezeigt

### Schritt 3: URL kopieren

Die URL sieht so aus:

```
https://werdemeisterdeinergedankenagent.de/webhook/chart-calculation
```

oder

```
http://138.199.237.34:5678/webhook/chart-calculation
```

---

## 📋 Webhook-URL Details

### URL-Struktur

```
[PROTOCOL]://[DOMAIN]/webhook/[PATH]
```

**Beispiele:**
- `https://werdemeisterdeinergedankenagent.de/webhook/chart-calculation`
- `http://138.199.237.34:5678/webhook/chart-calculation`

### Path

Der **Path** ist im Webhook Node definiert:
- **Path:** `chart-calculation`

---

## 🧪 Test der Webhook-URL

### Test-Request

```bash
curl -X POST https://werdemeisterdeinergedankenagent.de/webhook/chart-calculation \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany"
  }'
```

oder

```bash
curl -X POST http://138.199.237.34:5678/webhook/chart-calculation \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany"
  }'
```

---

## 🔍 Wo wird die URL verwendet?

### 1. Reading Agent

**In `production/server.js`:**

```javascript
const n8nUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
const chartResponse = await fetch(`${n8nUrl}/webhook/chart-calculation`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ birthDate, birthTime, birthPlace })
});
```

### 2. Chart-Berechnungs-Modul

**In `/opt/mcp/chart-calculation.js`:**

```javascript
const n8nUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
const webhookPath = process.env.N8N_CHART_WEBHOOK || '/webhook/chart-calculation';

const response = await fetch(`${n8nUrl}${webhookPath}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ birthDate, birthTime, birthPlace })
});
```

---

## ⚙️ Environment Variables

### N8N_BASE_URL

**In `production/.env`:**

```bash
N8N_BASE_URL=http://localhost:5678
# oder
N8N_BASE_URL=https://werdemeisterdeinergedankenagent.de
```

### N8N_CHART_WEBHOOK

**In `/opt/mcp-connection-key/.env`:**

```bash
N8N_CHART_WEBHOOK=/webhook/chart-calculation
```

---

## 🔍 Troubleshooting

### Webhook antwortet nicht

1. **Prüfen Sie, ob Workflow aktiviert ist**
   - Toggle "Active" muss ON sein

2. **Prüfen Sie die Webhook-URL**
   - URL muss korrekt sein
   - Path muss mit Webhook Node übereinstimmen

3. **Prüfen Sie n8n Logs**
   ```bash
   docker logs the-connection-key-n8n-1
   ```

### 404 Not Found

- Workflow ist nicht aktiviert
- Webhook Path ist falsch
- n8n läuft nicht

### 405 Method Not Allowed

- Falsche HTTP-Methode (muss POST sein)
- Webhook Node ist nicht korrekt konfiguriert

---

## ✅ Zusammenfassung

**Workflow-URL = Webhook-URL**

1. Öffnen Sie Workflow in n8n
2. Klicken Sie auf Webhook Node
3. Kopieren Sie die angezeigte URL
4. Verwenden Sie diese URL für API-Calls

**Standard-URL:**
```
https://werdemeisterdeinergedankenagent.de/webhook/chart-calculation
```

