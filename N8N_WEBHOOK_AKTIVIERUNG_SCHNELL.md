# ⚡ n8n Webhook - Schnell-Aktivierung

**Problem:** `404 - This webhook is not registered for POST requests`

**Lösung:** Workflow muss aktiv sein!

---

## 🚀 3-Schritte-Fix

### Schritt 1: n8n öffnen

```
https://n8n.werdemeisterdeinergedankenagent.de
```

---

### Schritt 2: Workflow finden oder importieren

**Falls Workflow existiert:**
1. **Workflows** → **"Agent → Mattermost Notification"** öffnen

**Falls Workflow NICHT existiert:**
1. **Workflows** → **"+"** → **"Import from File"**
2. **Datei auswählen:** `n8n-workflows/mattermost-agent-notification.json`
3. **Import** klicken
4. **Workflow öffnen**

---

### Schritt 3: Workflow aktivieren

1. **"Active" Toggle** oben rechts klicken
2. **Status sollte:** `Active` (grün) werden
3. **WICHTIG:** Webhooks funktionieren NUR wenn Workflow aktiv ist!

---

## ✅ Test nach Aktivierung

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{"agentId":"marketing","message":"Test"}'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Response: `{"success": true, "message": "Agent response sent to Mattermost"}`

---

## 🔍 Webhook-URL prüfen (falls weiterhin 404)

1. **"Webhook Trigger" Node** öffnen
2. **"Webhook URL" kopieren** (sollte angezeigt werden)
3. Diese URL in curl verwenden

**Beispiel:**
```bash
# Falls URL anders ist, z.B.:
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/ANDERER_PFAD \
  -H "Content-Type: application/json" \
  -d '{"agentId":"marketing","message":"Test"}'
```

---

## 🚨 Häufige Fehler

### Fehler 1: Workflow ist nicht aktiv

**Symptom:** 404 Fehler

**Lösung:** "Active" Toggle aktivieren!

---

### Fehler 2: Workflow existiert nicht

**Symptom:** Workflow nicht in Liste

**Lösung:** Workflow importieren!

---

### Fehler 3: Falscher Webhook-Pfad

**Symptom:** 404 Fehler trotz aktivem Workflow

**Lösung:** Webhook-URL aus n8n kopieren!

---

**Status:** ⚡ **Schnell-Fix Anleitung erstellt!**
