# 🚀 Mattermost + n8n Integration - Umsetzung

**Schritt-für-Schritt Anleitung zur Umsetzung**

---

## 📋 Voraussetzungen

- ✅ Selbst gehostetes Mattermost läuft
- ✅ n8n läuft (auf Hetzner Server)
- ✅ Mattermost Webhook-URL verfügbar

---

## 🔧 Schritt 1: Mattermost Webhook erstellen

### 1.1 Mattermost öffnen

- Öffnen Sie Ihre Mattermost-URL
- Beispiel: `https://mattermost.ihre-domain.de`
- Oder: `http://192.168.1.100:8065`

### 1.2 Webhook erstellen

1. **Integrations** → **Incoming Webhooks**
2. **Add Incoming Webhook** klicken
3. Konfigurieren:
   - **Display Name:** z.B. "n8n Bot"
   - **Description:** z.B. "n8n Automatisierungen"
   - **Channel:** Channel auswählen (z.B. `#general`, `#notifications`, `#marketing`)
4. **Create** klicken

### 1.3 Webhook-URL kopieren

- Format: `https://mattermost.ihre-domain.de/hooks/xxxxxxxxxxxxx`
- Oder: `http://IP:PORT/hooks/xxxxxxxxxxxxx`
- **WICHTIG:** Diese URL sicher aufbewahren!

---

## 📥 Schritt 2: n8n Workflows importieren

### 2.1 n8n öffnen

- URL: `https://n8n.werdemeisterdeinergedankenagent.de`
- Oder: `http://138.199.237.34:5678`

### 2.2 Workflows importieren

1. **Workflows** → **Import**
2. Workflow-Dateien auswählen:
   - `n8n-workflows/mattermost-agent-notification.json`
   - `n8n-workflows/mattermost-scheduled-reports.json`
   - `n8n-workflows/mattermost-reading-notification.json`

### 2.3 Workflows prüfen

- Jeder Workflow sollte erscheinen
- Workflows öffnen und prüfen

---

## ⚙️ Schritt 3: Environment Variables setzen

### 3.1 n8n Environment Variables

1. **Settings** → **Environment Variables**
2. Neue Variablen hinzufügen:

**MATTERMOST_WEBHOOK_URL:**
```
https://mattermost.ihre-domain.de/hooks/xxxxxxxxxxxxx
```

**MATTERMOST_CHANNEL:**
```
#general
```
(Oder: `#marketing`, `#readings`, `#notifications`)

### 3.2 Variablen prüfen

- Variablen sollten in Workflows verfügbar sein
- Format: `={{ $env.MATTERMOST_WEBHOOK_URL }}`

---

## 🔄 Schritt 4: Workflows konfigurieren

### 4.1 Agent → Mattermost Workflow

**Workflow:** `mattermost-agent-notification.json`

1. Workflow öffnen
2. **Send to Mattermost** Node öffnen
3. Prüfen:
   - URL: `={{ $env.MATTERMOST_WEBHOOK_URL }}`
   - Channel: `={{ $env.MATTERMOST_CHANNEL || '#general' }}`
4. **Save** klicken

**Webhook-URL notieren:**
- Webhook Trigger → Webhook-URL kopieren
- Format: `https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost`

### 4.2 Scheduled Reports Workflow

**Workflow:** `mattermost-scheduled-reports.json`

1. Workflow öffnen
2. **Schedule Trigger** konfigurieren:
   - Cron: `0 9 * * *` (täglich 9:00)
   - Oder anpassen nach Bedarf
3. **Send to Mattermost** Node prüfen
4. **Save** klicken

### 4.3 Reading → Mattermost Workflow

**Workflow:** `mattermost-reading-notification.json`

1. Workflow öffnen
2. **Send to Mattermost** Node prüfen
3. **Save** klicken

**Webhook-URL notieren:**
- Format: `https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading-mattermost`

---

## ✅ Schritt 5: Workflows aktivieren

### 5.1 Workflows aktivieren

1. Jeden Workflow öffnen
2. **Active** Toggle (oben rechts) aktivieren
3. Workflow sollte jetzt grün sein

### 5.2 Status prüfen

- Alle Workflows sollten "Active" sein
- Webhook-URLs sollten verfügbar sein

---

## 🧪 Schritt 6: Testen

### 6.1 Agent → Mattermost testen

**Test-Command:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "marketing",
    "message": "Erstelle 3 Social Media Posts"
  }'
```

**Erwartetes Ergebnis:**
- ✅ Workflow wird ausgeführt
- ✅ Agent-Antwort kommt
- ✅ Nachricht erscheint in Mattermost

### 6.2 Reading → Mattermost testen

**Test-Command:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading-mattermost \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "detailed",
    "userId": "test-user"
  }'
```

**Erwartetes Ergebnis:**
- ✅ Reading wird generiert
- ✅ Nachricht erscheint in Mattermost

### 6.3 Scheduled Reports testen

**Manuell testen:**
1. Workflow öffnen
2. **Execute Workflow** klicken
3. Prüfen ob Nachricht in Mattermost ankommt

---

## 🔗 Schritt 7: Integration mit Frontend/API

### 7.1 API-Route erstellen (Optional)

**Für Next.js Frontend:**

```typescript
// pages/api/agents/marketing-mattermost.ts
export default async function handler(req, res) {
  const { message } = req.body;
  
  // Agent aufrufen
  const agentResponse = await fetch('http://138.199.237.34:7000/agent/marketing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  
  const agentData = await agentResponse.json();
  
  // n8n Webhook aufrufen (sendet automatisch an Mattermost)
  await fetch('https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agentId: 'marketing',
      message: message,
      response: agentData.response
    })
  });
  
  return res.json({ success: true, response: agentData.response });
}
```

### 7.2 Frontend-Integration (Optional)

```typescript
// components/AgentChatWithMattermost.tsx
const handleSubmit = async () => {
  const res = await fetch('/api/agents/marketing-mattermost', {
    method: 'POST',
    body: JSON.stringify({ message })
  });
  // Antwort wird automatisch an Mattermost gesendet
};
```

---

## 📊 Workflow-Übersicht

| Workflow | Trigger | Funktion | Webhook-URL |
|----------|---------|----------|-------------|
| **Agent → Mattermost** | Webhook | Agent-Antworten an Mattermost senden | `/webhook/agent-mattermost` |
| **Scheduled Reports** | Schedule (täglich 9:00) | Tägliche Marketing-Reports | - |
| **Reading → Mattermost** | Webhook | Reading-Generierung benachrichtigen | `/webhook/reading-mattermost` |

---

## ✅ Checkliste

- [ ] Mattermost Webhook erstellt
- [ ] Webhook-URL kopiert
- [ ] n8n Workflows importiert
- [ ] Environment Variables gesetzt
- [ ] Workflows konfiguriert
- [ ] Workflows aktiviert
- [ ] Tests durchgeführt
- [ ] Nachrichten kommen in Mattermost an

---

## 🆘 Troubleshooting

### Problem: Webhook funktioniert nicht

**Lösung:**
1. Prüfen Sie Webhook-URL (korrekt kopiert?)
2. Prüfen Sie Mattermost erreichbar ist
3. Prüfen Sie n8n Logs
4. Prüfen Sie Environment Variables

### Problem: Nachricht kommt nicht an

**Lösung:**
1. Prüfen Sie Channel-Name (korrekt geschrieben?)
2. Prüfen Sie ob Bot Zugriff auf Channel hat
3. Prüfen Sie JSON-Format
4. Prüfen Sie Mattermost Logs

### Problem: Environment Variables funktionieren nicht

**Lösung:**
1. Prüfen Sie Variablen in n8n Settings
2. Prüfen Sie Syntax: `={{ $env.VARIABLE_NAME }}`
3. Workflow neu speichern
4. n8n neu starten (falls nötig)

---

## 🎯 Nächste Schritte

1. **Weitere Workflows erstellen:**
   - Multi-Agent-Pipelines → Mattermost
   - Error-Notifications → Mattermost
   - Custom Reports → Mattermost

2. **Formatierung erweitern:**
   - Attachments hinzufügen
   - Emojis verwenden
   - Markdown-Formatierung

3. **Integration erweitern:**
   - Frontend-Integration
   - API-Routes
   - Automatische Benachrichtigungen

---

**Status:** ✅ Mattermost + n8n Integration ist jetzt umsetzbar!

