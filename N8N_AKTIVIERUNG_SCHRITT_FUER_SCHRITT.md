# 🚀 n8n Workflows Aktivierung - Schritt für Schritt

**Los geht's!** Folgen Sie dieser Anleitung Schritt für Schritt.

---

## 📍 Schritt 1: n8n öffnen

1. Öffnen Sie n8n im Browser:
   - **URL:** `https://n8n.werdemeisterdeinergedankenagent.de`
   - Oder: `http://138.199.237.34:5678`

2. **Einloggen** mit Ihren Credentials

3. **Dashboard** sollte sichtbar sein

✅ **Check:** Sie sehen das n8n Dashboard mit "Workflows" Menü

---

## 📥 Schritt 2: Ersten Workflow importieren

### Workflow 1: Chart Calculation

1. **Klicken Sie auf "Workflows"** (links im Menü)

2. **Klicken Sie auf "Import"** (oben rechts)

3. **Datei auswählen:**
   - Navigieren Sie zu: `integration/n8n-workflows/chart-calculation-workflow.json`
   - Oder ziehen Sie die Datei per Drag & Drop

4. **Klicken Sie auf "Import"**

5. **Workflow erscheint in der Liste**

6. **Klicken Sie auf den Workflow** um ihn zu öffnen

7. **Prüfen Sie:**
   - Webhook Node vorhanden?
   - Chart Calculation Node vorhanden?
   - Respond Node vorhanden?

✅ **Check:** Workflow "Chart Calculation" ist importiert und sichtbar

---

## 📥 Schritt 3: Zweiten Workflow importieren

### Workflow 2: Agent Automation

1. **Zurück zur Workflow-Liste** (Workflows Menü)

2. **Klicken Sie auf "Import"**

3. **Datei auswählen:**
   - `integration/n8n-workflows/agent-automation-workflows.json`

4. **Klicken Sie auf "Import"**

5. **Workflow öffnen und prüfen**

✅ **Check:** Workflow "Agent Automation" ist importiert

---

## 📥 Schritt 4: Mattermost Workflows importieren

### Workflow 3: Mattermost Agent Notification

1. **Import** → Datei: `n8n-workflows/mattermost-agent-notification.json`
2. **Import** klicken
3. **Workflow öffnen und prüfen**

✅ **Check:** Workflow importiert

### Workflow 4: Mattermost Scheduled Reports

1. **Import** → Datei: `n8n-workflows/mattermost-scheduled-reports.json`
2. **Import** klicken
3. **Workflow öffnen und prüfen**

✅ **Check:** Workflow importiert

### Workflow 5: Mattermost Reading Notification

1. **Import** → Datei: `n8n-workflows/mattermost-reading-notification.json`
2. **Import** klicken
3. **Workflow öffnen und prüfen**

✅ **Check:** Workflow importiert

---

## ⚙️ Schritt 5: Environment Variables setzen

1. **Klicken Sie auf "Settings"** (unten links, Zahnrad-Icon)

2. **Klicken Sie auf "Environment Variables"**

3. **Klicken Sie auf "Add Variable"**

4. **Variable 1 hinzufügen:**
   - **Name:** `MATTERMOST_WEBHOOK_URL`
   - **Value:** `https://mattermost.ihre-domain.de/hooks/xxxxx`
     - ⚠️ **Hinweis:** Falls Mattermost noch nicht eingerichtet ist, können Sie später zurückkommen
   - **Klicken Sie auf "Save"**

5. **Variable 2 hinzufügen:**
   - **Name:** `MATTERMOST_CHANNEL`
   - **Value:** `#general` (oder `#marketing`, `#readings`)
   - **Klicken Sie auf "Save"**

✅ **Check:** Beide Environment Variables sind gesetzt

---

## 🔧 Schritt 6: Workflows konfigurieren

### Chart Calculation Workflow

1. **Workflow öffnen**

2. **Prüfen Sie die Nodes:**
   - Webhook Node: Path sollte `/webhook/chart-calculation` sein
   - Chart Calculation Node: URLs korrekt?
   - Respond Node vorhanden?

3. **Klicken Sie auf "Save"** (oben rechts)

✅ **Check:** Workflow gespeichert

### Mattermost Workflows (3x)

**Für jeden Mattermost Workflow:**

1. **Workflow öffnen**

2. **"Send to Mattermost" Node öffnen** (doppelklicken)

3. **Prüfen Sie:**
   - **URL:** Sollte `={{ $env.MATTERMOST_WEBHOOK_URL }}` sein
   - **Channel:** Sollte `={{ $env.MATTERMOST_CHANNEL || '#general' }}` sein

4. **Klicken Sie auf "Save"** (im Node)

5. **Klicken Sie auf "Save"** (Workflow speichern)

✅ **Check:** Alle Mattermost Workflows konfiguriert

---

## ✅ Schritt 7: Workflows aktivieren

### Workflow 1: Chart Calculation

1. **Workflow öffnen**

2. **Suchen Sie den "Active" Toggle** (oben rechts, neben dem Workflow-Namen)

3. **Klicken Sie auf den Toggle** → Er wird **GRÜN**

4. **Webhook-URL notieren:**
   - Klicken Sie auf den **Webhook Node**
   - **Webhook-URL** kopieren
   - Beispiel: `https://n8n.werdemeisterdeinergedankenagent.de/webhook/chart-calculation`

✅ **Check:** Workflow ist aktiv (grün) und Webhook-URL notiert

### Workflow 2: Agent Automation

1. **Workflow öffnen**
2. **Active Toggle aktivieren** → GRÜN
3. **Save** klicken

✅ **Check:** Workflow ist aktiv

### Workflow 3: Mattermost Agent Notification

1. **Workflow öffnen**
2. **Active Toggle aktivieren** → GRÜN
3. **Webhook-URL notieren:**
   - Webhook Node → URL kopieren
   - Beispiel: `https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost`
4. **Save** klicken

✅ **Check:** Workflow ist aktiv und Webhook-URL notiert

### Workflow 4: Mattermost Scheduled Reports

1. **Workflow öffnen**
2. **Active Toggle aktivieren** → GRÜN
3. **Schedule prüfen:**
   - Schedule Trigger Node öffnen
   - Cron: `0 9 * * *` (täglich 9:00) - kann angepasst werden
4. **Save** klicken

✅ **Check:** Workflow ist aktiv

### Workflow 5: Mattermost Reading Notification

1. **Workflow öffnen**
2. **Active Toggle aktivieren** → GRÜN
3. **Webhook-URL notieren:**
   - Webhook Node → URL kopieren
   - Beispiel: `https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading-mattermost`
4. **Save** klicken

✅ **Check:** Workflow ist aktiv und Webhook-URL notiert

---

## 🧪 Schritt 8: Ersten Test durchführen

### Test: Chart Calculation Workflow

1. **Webhook-URL kopieren** (aus Schritt 7)

2. **Terminal öffnen** und testen:

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/chart-calculation \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin"
  }'
```

3. **In n8n prüfen:**
   - Workflow öffnen
   - **"Executions" Tab** öffnen (unten)
   - Sollte eine Ausführung zeigen

✅ **Check:** Workflow wurde ausgeführt (Execution sichtbar)

---

## 📝 Schritt 9: Webhook-URLs dokumentieren

**Notieren Sie die Webhook-URLs:**

- Chart Calculation: `_________________________________`
- Agent → Mattermost: `_________________________________`
- Reading → Mattermost: `_________________________________`

**Diese URLs werden später benötigt!**

---

## ✅ Finale Prüfung

- [ ] Alle 5 Workflows importiert
- [ ] Alle Workflows aktiviert (grün)
- [ ] Environment Variables gesetzt
- [ ] Workflows konfiguriert
- [ ] Webhook-URLs notiert
- [ ] Mindestens 1 Workflow getestet
- [ ] Keine Fehler in n8n

---

## 🎉 Fertig!

**n8n Workflows sind jetzt aktiviert!**

**Nächster Schritt:** Mattermost Integration (15 Min)
- Mattermost Webhook erstellen
- Environment Variables aktualisieren
- Workflows testen

---

**Status:** ✅ Aktivierung abgeschlossen!

