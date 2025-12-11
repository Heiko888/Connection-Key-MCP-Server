# ✅ n8n Workflows Aktivierung - Checkliste

**Geschätzter Aufwand:** 30 Minuten

---

## 📋 Vorbereitung

- [ ] n8n Zugriff verfügbar
  - URL: `https://n8n.werdemeisterdeinergedankenagent.de`
  - Oder: `http://138.199.237.34:5678`
- [ ] Login-Credentials vorhanden
- [ ] Workflow-Dateien lokal verfügbar

---

## 🔄 Schritt 1: n8n öffnen

- [ ] n8n im Browser öffnen
- [ ] Einloggen
- [ ] Dashboard öffnen

---

## 📥 Schritt 2: Workflows importieren

### Workflow 1: Chart Calculation
- [ ] **Workflows** → **Import** klicken
- [ ] Datei auswählen: `integration/n8n-workflows/chart-calculation-workflow.json`
- [ ] **Import** klicken
- [ ] Workflow erscheint in Liste
- [ ] Workflow öffnen und prüfen

### Workflow 2: Agent Automation
- [ ] **Workflows** → **Import** klicken
- [ ] Datei auswählen: `integration/n8n-workflows/agent-automation-workflows.json`
- [ ] **Import** klicken
- [ ] Workflow erscheint in Liste
- [ ] Workflow öffnen und prüfen

### Workflow 3: Mattermost Agent Notification
- [ ] **Workflows** → **Import** klicken
- [ ] Datei auswählen: `n8n-workflows/mattermost-agent-notification.json`
- [ ] **Import** klicken
- [ ] Workflow erscheint in Liste
- [ ] Workflow öffnen und prüfen

### Workflow 4: Mattermost Scheduled Reports
- [ ] **Workflows** → **Import** klicken
- [ ] Datei auswählen: `n8n-workflows/mattermost-scheduled-reports.json`
- [ ] **Import** klicken
- [ ] Workflow erscheint in Liste
- [ ] Workflow öffnen und prüfen

### Workflow 5: Mattermost Reading Notification
- [ ] **Workflows** → **Import** klicken
- [ ] Datei auswählen: `n8n-workflows/mattermost-reading-notification.json`
- [ ] **Import** klicken
- [ ] Workflow erscheint in Liste
- [ ] Workflow öffnen und prüfen

### Workflow 6: Mailchimp Subscriber (Optional)
- [ ] **Workflows** → **Import** klicken
- [ ] Datei auswählen: `n8n-workflows/mailchimp-subscriber.json` (falls vorhanden)
- [ ] **Import** klicken
- [ ] Workflow erscheint in Liste

---

## ⚙️ Schritt 3: Environment Variables setzen

- [ ] **Settings** → **Environment Variables** öffnen
- [ ] Neue Variable hinzufügen:
  - [ ] Name: `MATTERMOST_WEBHOOK_URL`
  - [ ] Wert: `https://mattermost.ihre-domain.de/hooks/xxxxx`
  - [ ] **Save** klicken
- [ ] Neue Variable hinzufügen:
  - [ ] Name: `MATTERMOST_CHANNEL`
  - [ ] Wert: `#general` (oder `#marketing`, `#readings`)
  - [ ] **Save** klicken
- [ ] Prüfen ob Variablen gespeichert sind

---

## 🔧 Schritt 4: Workflows konfigurieren

### Chart Calculation Workflow
- [ ] Workflow öffnen
- [ ] Nodes prüfen:
  - [ ] URLs korrekt? (`MCP_SERVER_URL`, `READING_AGENT_URL`)
  - [ ] Webhook-Path korrekt?
- [ ] **Save** klicken

### Agent Automation Workflows
- [ ] Workflow öffnen
- [ ] Nodes prüfen:
  - [ ] MCP Server URL: `http://138.199.237.34:7000`
  - [ ] Agent-IDs korrekt?
- [ ] **Save** klicken

### Mattermost Workflows (3x)
- [ ] Jeden Mattermost Workflow öffnen
- [ ] **Send to Mattermost** Node prüfen:
  - [ ] URL: `={{ $env.MATTERMOST_WEBHOOK_URL }}`
  - [ ] Channel: `={{ $env.MATTERMOST_CHANNEL || '#general' }}`
- [ ] **Save** klicken

---

## ✅ Schritt 5: Workflows aktivieren

### Workflow 1: Chart Calculation
- [ ] Workflow öffnen
- [ ] **Active Toggle** (oben rechts) aktivieren
- [ ] Workflow wird grün
- [ ] Webhook-URL notieren: `___________________________`

### Workflow 2: Agent Automation
- [ ] Workflow öffnen
- [ ] **Active Toggle** aktivieren
- [ ] Workflow wird grün

### Workflow 3: Mattermost Agent Notification
- [ ] Workflow öffnen
- [ ] **Active Toggle** aktivieren
- [ ] Workflow wird grün
- [ ] Webhook-URL notieren: `___________________________`

### Workflow 4: Mattermost Scheduled Reports
- [ ] Workflow öffnen
- [ ] **Active Toggle** aktivieren
- [ ] Workflow wird grün
- [ ] Schedule prüfen (täglich 9:00?)

### Workflow 5: Mattermost Reading Notification
- [ ] Workflow öffnen
- [ ] **Active Toggle** aktivieren
- [ ] Workflow wird grün
- [ ] Webhook-URL notieren: `___________________________`

### Workflow 6: Mailchimp Subscriber (Optional)
- [ ] Workflow öffnen
- [ ] **Active Toggle** aktivieren
- [ ] Workflow wird grün

---

## 🧪 Schritt 6: Workflows testen

### Test 1: Chart Calculation
- [ ] Webhook-URL kopieren
- [ ] Test-Request senden:
  ```bash
  curl -X POST [WEBHOOK-URL] \
    -H "Content-Type: application/json" \
    -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin"}'
  ```
- [ ] Prüfen ob Workflow ausgeführt wurde
- [ ] Ergebnis prüfen

### Test 2: Agent → Mattermost (nach Mattermost Setup)
- [ ] Mattermost Webhook erstellt? (siehe Mattermost Integration)
- [ ] Webhook-URL in n8n Environment Variables gesetzt?
- [ ] Test-Request senden:
  ```bash
  curl -X POST [WEBHOOK-URL] \
    -H "Content-Type: application/json" \
    -d '{"agentId": "marketing", "message": "Test"}'
  ```
- [ ] Prüfen ob Nachricht in Mattermost ankommt

### Test 3: Scheduled Reports
- [ ] Workflow öffnen
- [ ] **Execute Workflow** (manuell) klicken
- [ ] Prüfen ob Workflow ausgeführt wurde
- [ ] Prüfen ob Nachricht in Mattermost ankommt (falls konfiguriert)

---

## 📝 Schritt 7: Webhook-URLs dokumentieren

- [ ] Chart Calculation Webhook: `___________________________`
- [ ] Agent → Mattermost Webhook: `___________________________`
- [ ] Reading → Mattermost Webhook: `___________________________`

**Speichern für spätere Verwendung!**

---

## ✅ Finale Prüfung

- [ ] Alle 5-6 Workflows importiert
- [ ] Alle Workflows aktiviert (grün)
- [ ] Environment Variables gesetzt
- [ ] Workflows konfiguriert
- [ ] Webhook-URLs notiert
- [ ] Mindestens 1 Workflow getestet
- [ ] Keine Fehler in n8n Logs

---

## 🎯 Nächste Schritte

Nach erfolgreicher Aktivierung:

1. **Mattermost Integration** (15 Min)
   - Mattermost Webhook erstellen
   - Environment Variables aktualisieren
   - Workflows testen

2. **Frontend-Integration** (4-6 Stunden)
   - API-Routes deployen
   - Frontend-Komponenten deployen
   - CORS konfigurieren

---

**Status:** 📋 Checkliste bereit - Schritt für Schritt durchführen!

