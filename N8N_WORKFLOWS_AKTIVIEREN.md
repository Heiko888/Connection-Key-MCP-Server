# 🔄 n8n Workflows aktivieren - Schritt-für-Schritt

**Geschätzter Aufwand:** 30 Minuten

---

## 📋 Verfügbare Workflows

### 1. Mailchimp Subscriber Workflow
- **Datei:** `n8n-workflows/mailchimp-subscriber.json` (falls vorhanden)
- **Funktion:** Mailchimp-Abonnenten automatisch verwalten

### 2. Chart Calculation Workflow
- **Datei:** `integration/n8n-workflows/chart-calculation-workflow.json`
- **Funktion:** Human Design Chart-Berechnung via Swiss Ephemeris

### 3. Agent Automation Workflows
- **Datei:** `integration/n8n-workflows/agent-automation-workflows.json`
- **Funktion:** Multi-Agent-Pipelines, Scheduled Tasks

### 4. Mattermost Agent Notification
- **Datei:** `n8n-workflows/mattermost-agent-notification.json`
- **Funktion:** Agent-Antworten → Mattermost

### 5. Mattermost Scheduled Reports
- **Datei:** `n8n-workflows/mattermost-scheduled-reports.json`
- **Funktion:** Tägliche Reports → Mattermost

### 6. Mattermost Reading Notification
- **Datei:** `n8n-workflows/mattermost-reading-notification.json`
- **Funktion:** Reading-Generierung → Mattermost

---

## 🚀 Schritt-für-Schritt Anleitung

### Schritt 1: n8n öffnen

1. Öffnen Sie n8n: `https://n8n.werdemeisterdeinergedankenagent.de`
   - Oder: `http://138.199.237.34:5678`
2. Einloggen mit Ihren Credentials

---

### Schritt 2: Workflows importieren

**Für jeden Workflow:**

1. **Workflows** → **Import**
2. **Datei auswählen** (JSON-Datei)
3. **Import** klicken
4. Workflow erscheint in der Liste

**Zu importierende Workflows:**
- `integration/n8n-workflows/chart-calculation-workflow.json`
- `integration/n8n-workflows/agent-automation-workflows.json`
- `n8n-workflows/mattermost-agent-notification.json`
- `n8n-workflows/mattermost-scheduled-reports.json`
- `n8n-workflows/mattermost-reading-notification.json`

---

### Schritt 3: Environment Variables setzen

**Settings** → **Environment Variables**

**Hinzufügen:**
- `MATTERMOST_WEBHOOK_URL` = `https://mattermost.ihre-domain.de/hooks/xxxxx`
- `MATTERMOST_CHANNEL` = `#general` (oder `#marketing`, `#readings`)

---

### Schritt 4: Workflows konfigurieren

**Für jeden Workflow:**

1. Workflow öffnen
2. **Nodes prüfen:**
   - URLs korrekt? (`MCP_SERVER_URL`, `READING_AGENT_URL`)
   - Environment Variables verwendet? (`={{ $env.MATTERMOST_WEBHOOK_URL }}`)
3. **Save** klicken

---

### Schritt 5: Workflows aktivieren

**Für jeden Workflow:**

1. Workflow öffnen
2. **Active Toggle** (oben rechts) aktivieren
3. Workflow sollte jetzt grün sein

---

### Schritt 6: Webhook-URLs notieren

**Für Webhook-Trigger:**

1. Webhook Node öffnen
2. **Webhook-URL** kopieren
3. Notieren für spätere Verwendung

**Beispiel-URLs:**
- Agent → Mattermost: `https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost`
- Reading → Mattermost: `https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading-mattermost`

---

## 🧪 Schritt 7: Workflows testen

### Test 1: Chart Calculation Workflow

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/chart-calculation \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin"
  }'
```

### Test 2: Agent → Mattermost (nach Mattermost Setup)

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "marketing",
    "message": "Test"
  }'
```

---

## ✅ Checkliste

- [ ] n8n geöffnet
- [ ] Alle Workflows importiert (5-6 Workflows)
- [ ] Environment Variables gesetzt
- [ ] Workflows konfiguriert
- [ ] Workflows aktiviert
- [ ] Webhook-URLs notiert
- [ ] Tests durchgeführt

---

**Status:** 📋 Bereit für Aktivierung!

