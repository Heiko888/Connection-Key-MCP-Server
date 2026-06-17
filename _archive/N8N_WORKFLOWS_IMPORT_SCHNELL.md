# ⚡ n8n Workflows - Schnell-Import

**Situation:** Keine Workflows in n8n vorhanden

**Lösung:** Alle Workflows importieren und aktivieren

---

## 🚀 Schnell-Anleitung (5 Minuten)

### Schritt 1: n8n öffnen

```
https://n8n.werdemeisterdeinergedankenagent.de
```

---

### Schritt 2: Workflows importieren

**Für jeden Workflow:**

1. **Workflows** → **"+"** → **"Import from File"**
2. **Datei auswählen** (siehe Liste unten)
3. **"Import"** klicken
4. **Workflow öffnen**
5. **"Active" Toggle** aktivieren (muss GRÜN sein!)

---

## 📋 Import-Liste (in dieser Reihenfolge)

### Priorität 1: Mattermost Workflows

1. ✅ `mattermost-agent-notification.json`
   - Webhook: `/webhook/agent-mattermost`
   - Channel: `#tech`

2. ✅ `mattermost-reading-notification.json`
   - Webhook: `/webhook/reading-mattermost`
   - Channel: `#readings`

3. ✅ `mattermost-scheduled-reports.json`
   - Trigger: Schedule (täglich 9:00)
   - Channel: `#marketing`

---

### Priorität 2: Logger & Multi-Agent

4. ✅ `logger-mattermost.json`
   - Webhook: `/webhook/log`
   - Channel: `#tech`

5. ✅ `multi-agent-pipeline.json`
   - Webhook: `/webhook/content-pipeline`

---

### Priorität 3: Reading & User Registration

6. ✅ `user-registration-reading.json`
   - Webhook: `/webhook/user-registered`

7. ✅ `scheduled-reading-generation.json`
   - Trigger: Schedule (täglich 9:00)

8. ✅ `reading-generation-workflow.json`
   - Webhook: `/webhook/reading`

---

### Priorität 4: Weitere

9. ✅ `chart-calculation-workflow-swisseph.json`
   - Webhook: `/webhook/chart-calculation`

10. ✅ `agent-notification-simple.json`
    - Webhook: `/webhook/agent-notification`

11. ✅ `reading-notification-simple.json`
    - Webhook: `/webhook/reading-generation`

12. ✅ `mailchimp-subscriber.json`
    - Webhook: `/webhook/mailchimp-confirmed`

---

## ✅ Nach dem Import

### 1. Alle Workflows aktivieren

**Für jeden Workflow:**
- Workflow öffnen
- **"Active" Toggle** aktivieren (GRÜN!)

---

### 2. Testen

**Test 1: Agent → Mattermost**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{"agentId":"marketing","message":"Test"}'
```

**Erwartung:** ✅ HTTP 200 OK, Mattermost bekommt Nachricht

---

## 🚨 Wichtig

**Webhooks funktionieren nur, wenn:**
- ✅ Workflow existiert
- ✅ Workflow ist aktiv (grüner Toggle)
- ✅ Webhook-Pfad ist korrekt

---

**Status:** ⚡ **Schnell-Import Anleitung erstellt!**
