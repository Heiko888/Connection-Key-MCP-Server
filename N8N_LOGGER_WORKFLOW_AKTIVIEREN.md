# 🔧 Logger Workflow aktivieren - Schritt für Schritt

**Problem:** `404 - This webhook is not registered for POST requests`

**Ursache:** Workflow ist nicht importiert oder nicht aktiviert

---

## ✅ Lösung: Workflow importieren und aktivieren

### Schritt 1: n8n öffnen

1. Browser öffnen
2. Gehe zu: `https://n8n.werdemeisterdeinergedankenagent.de`
3. Einloggen

---

### Schritt 2: Workflow importieren

1. **Links in der Sidebar:** Klicke auf **"Workflows"**
2. **Oben rechts:** Klicke auf **"+"** Button
3. **Dropdown öffnen:** Wähle **"Import from File"**
4. **Datei auswählen:**
   - Navigiere zu: `n8n-workflows/logger-mattermost.json`
   - Oder: Lade die Datei hoch
5. **"Import"** klicken

**Erwartung:**
- ✅ Workflow erscheint in der Liste
- ✅ Name: "LOGGER → Mattermost"

---

### Schritt 3: Workflow öffnen

1. **Klicke auf den Workflow:** "LOGGER → Mattermost"
2. Workflow öffnet sich im Editor

---

### Schritt 4: Mattermost Webhook URL konfigurieren

**WICHTIG:** Der Workflow hat einen Platzhalter für die Mattermost URL!

1. **Finde den Node:** "Send to Mattermost" (HTTP Request Node)
2. **Klicke auf den Node** um ihn zu öffnen
3. **Prüfe die URL:**
   - Aktuell: `https://chat.werdemeisterdeinergedanken.de/hooks/PLATZHALTER_WEBHOOK_ID`
4. **Ersetze `PLATZHALTER_WEBHOOK_ID`** durch deine echte Mattermost Webhook URL

**Mattermost Webhook URL finden:**
1. Mattermost öffnen
2. Channel → Integrations → Incoming Webhooks
3. Webhook erstellen oder vorhandenen kopieren
4. URL kopieren (Format: `https://chat.werdemeisterdeinergedanken.de/hooks/xxxxx`)

**Oder:** Falls du die URL nicht hast, kannst du sie später setzen. Der Workflow funktioniert auch ohne Mattermost (nur der HTTP Request schlägt dann fehl).

---

### Schritt 5: Workflow aktivieren ⭐ KRITISCH!

**WICHTIG:** Webhooks funktionieren NUR wenn der Workflow aktiviert ist!

1. **Oben rechts im Workflow-Editor:** Finde den **"Active" Toggle**
2. **Klicke auf "Active"** (oder den Toggle-Switch)
3. **Status sollte:** `Active` (grün) werden

**Prüfen:**
- ✅ Toggle ist GRÜN
- ✅ Status zeigt "Active"
- ✅ Workflow-Liste zeigt "Active" Badge

---

### Schritt 6: Webhook-URL notieren

**Nach Aktivierung:**
- Webhook-URL: `https://n8n.werdemeisterdeinergedankenagent.de/webhook/log`
- Oder: `http://138.199.237.34:5678/webhook/log`

**Diese URL wird im Webhook Trigger Node angezeigt:**
1. Klicke auf "Webhook Trigger" Node
2. Unten siehst du die Webhook-URL
3. Kopiere diese URL

---

### Schritt 7: Testen

**Nach Aktivierung testen:**

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/log \
  -H "Content-Type: application/json" \
  -d '{
    "traceId": "test-1",
    "source": "test",
    "status": "ok",
    "channel": "#tech",
    "message": "Logger Test - Agenten startklar!"
  }'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Response: `{"success":true,"logged":true,"traceId":"test-1"}`
- ✅ Mattermost Channel `#tech` bekommt Nachricht (falls Webhook URL konfiguriert)

---

## ❌ Häufige Fehler

### Fehler 1: "404 - This webhook is not registered"

**Ursache:** Workflow ist nicht aktiviert

**Lösung:**
1. Workflow öffnen
2. "Active" Toggle aktivieren (muss GRÜN sein!)
3. Nochmal testen

---

### Fehler 2: "Webhook URL nicht gefunden"

**Ursache:** Falscher Pfad oder Workflow nicht importiert

**Lösung:**
1. Prüfe ob Workflow importiert wurde
2. Prüfe ob Webhook-Pfad "log" ist (im Webhook Trigger Node)
3. Prüfe ob Workflow aktiviert ist

---

### Fehler 3: "Mattermost Request failed"

**Ursache:** Mattermost Webhook URL ist nicht konfiguriert oder falsch

**Lösung:**
1. "Send to Mattermost" Node öffnen
2. URL prüfen
3. `PLATZHALTER_WEBHOOK_ID` durch echte URL ersetzen

**Oder:** Falls Mattermost nicht benötigt wird, kann der Node vorübergehend deaktiviert werden.

---

## 🔍 Workflow prüfen

### Checkliste:

- [ ] Workflow ist importiert
- [ ] Workflow ist geöffnet
- [ ] "Active" Toggle ist GRÜN
- [ ] Webhook Trigger Node hat Pfad "log"
- [ ] Mattermost Webhook URL ist konfiguriert (oder vorübergehend deaktiviert)
- [ ] Test erfolgreich

---

## 📋 Nächste Schritte

**Nach erfolgreicher Aktivierung:**

1. ✅ Logger Workflow funktioniert
2. → Weiter mit: Multi-Agent Pipeline
3. → Weiter mit: Chart Calculation
4. → Weiter mit: Mattermost Notifications

---

## 🚀 Quick Fix

**Wenn du schnell testen willst:**

1. n8n öffnen
2. Workflows → Import → `logger-mattermost.json`
3. Workflow öffnen
4. **"Active" Toggle aktivieren** ⭐
5. Testen

**Das war's!** 🎉
