# 🚀 n8n Workflows aktivieren - JETZT!

**Los geht's - Schritt für Schritt!**

---

## 📍 Schritt 1: n8n öffnen

1. Öffnen Sie: `https://n8n.werdemeisterdeinergedankenagent.de`
2. Einloggen

✅ **Check:** Sie sehen das n8n Dashboard

---

## 📥 Schritt 2: Workflows importieren

### Workflow 1: Chart Calculation

1. **Klicken Sie auf "Workflows"** (links)
2. **Klicken Sie auf "Import"** (oben rechts)
3. **Datei auswählen:**
   - `n8n-workflows/chart-calculation-workflow.json`
4. **Import** klicken
5. ✅ Workflow erscheint in der Liste

### Workflow 2: Agent Automation

1. **Import** → Datei: `n8n-workflows/agent-automation-workflows.json`
2. **Import** klicken
3. ✅ Workflow erscheint (enthält 2 Workflows!)

### Workflow 3: Mattermost Agent Notification

1. **Import** → Datei: `n8n-workflows/mattermost-agent-notification.json`
2. **Import** klicken
3. ✅ Workflow erscheint

### Workflow 4: Mattermost Scheduled Reports

1. **Import** → Datei: `n8n-workflows/mattermost-scheduled-reports.json`
2. **Import** klicken
3. ✅ Workflow erscheint

### Workflow 5: Mattermost Reading Notification

1. **Import** → Datei: `n8n-workflows/mattermost-reading-notification.json`
2. **Import** klicken
3. ✅ Workflow erscheint

---

## 🔧 Schritt 3: Mattermost Workflows konfigurieren

**⚠️ WICHTIG:** Nur wenn Mattermost bereits eingerichtet ist!

### Für jeden Mattermost Workflow:

1. **Workflow öffnen**
2. **"Send to Mattermost" Node öffnen** (doppelklicken)
3. **URL-Feld:**
   - Ersetzen Sie: `https://mattermost.ihre-domain.de/hooks/xxxxx`
   - Mit Ihrer echten Mattermost Webhook-URL
4. **Channel prüfen:**
   - Sollte bereits korrekt sein
5. **Save** klicken

**Falls Mattermost noch nicht eingerichtet:** Überspringen Sie diesen Schritt, Workflows funktionieren auch ohne Mattermost!

---

## ✅ Schritt 4: Workflows aktivieren

### Für jeden Workflow:

1. **Workflow öffnen**
2. **"Active" Toggle** (oben rechts) aktivieren
3. ✅ Workflow wird **GRÜN**
4. **Save** klicken

**Zu aktivierende Workflows:**
- ✅ Chart Calculation
- ✅ Agent Automation (2 Workflows)
- ✅ Mattermost Agent Notification (optional, falls Mattermost eingerichtet)
- ✅ Mattermost Scheduled Reports (optional)
- ✅ Mattermost Reading Notification (optional)

---

## 🧪 Schritt 5: Ersten Test

### Test: Chart Calculation

1. **Workflow öffnen**
2. **Webhook Node** → **Webhook-URL kopieren**
3. **Terminal öffnen:**

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/chart-calculation \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin"}'
```

4. **In n8n prüfen:**
   - Workflow öffnen
   - **"Executions" Tab** (unten)
   - Sollte eine Ausführung zeigen

✅ **Check:** Workflow wurde ausgeführt!

---

## ✅ Checkliste

- [ ] n8n geöffnet
- [ ] 5 Workflow-Dateien importiert
- [ ] Mattermost Workflows konfiguriert (falls Mattermost eingerichtet)
- [ ] Alle Workflows aktiviert (grün)
- [ ] Chart Calculation getestet
- [ ] Webhook-URLs notiert

---

## 🎉 Fertig!

**n8n Workflows sind jetzt aktiviert!**

**Nächster Schritt:** Mattermost Integration (falls noch nicht eingerichtet)

---

**Status:** ✅ Bereit für Aktivierung!

