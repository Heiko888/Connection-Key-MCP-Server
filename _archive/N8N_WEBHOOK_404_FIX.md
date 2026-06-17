# 🔧 n8n Webhook 404 Fix - "This webhook is not registered"

**Fehler:** `{"code":404,"message":"This webhook is not registered for POST requests. Did you mean to make a GET request?"}`

**Ursache:** Workflow ist nicht aktiv oder Webhook-Pfad ist falsch

---

## ✅ Lösung Schritt-für-Schritt

### Schritt 1: Workflow in n8n öffnen

1. **n8n öffnen:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Workflows** öffnen
3. **"Agent → Mattermost Notification"** suchen und öffnen

---

### Schritt 2: Workflow aktivieren

1. **"Active" Toggle** oben rechts aktivieren
2. **Status sollte:** `Active` (grün) werden

**WICHTIG:** Webhooks funktionieren nur, wenn der Workflow aktiv ist!

---

### Schritt 3: Webhook-Pfad prüfen

1. **"Webhook Trigger" Node** doppelklicken
2. **"Path" Feld** prüfen:
   - Sollte sein: `agent-mattermost`
   - Vollständiger Webhook-URL: `https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost`

**Falls Path anders ist:**
- Notiere den tatsächlichen Path
- Verwende diesen in deinem curl-Befehl

---

### Schritt 4: Webhook-URL testen

**Option A: Webhook-URL aus n8n kopieren**

1. **"Webhook Trigger" Node** öffnen
2. **"Webhook URL" kopieren** (sollte angezeigt werden)
3. Diese URL in curl verwenden

**Option B: Manuell testen**

```bash
# Prüfe ob Workflow aktiv ist
curl -X GET https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost

# Falls GET funktioniert, aber POST nicht:
# → Workflow ist aktiv, aber Webhook-Pfad ist falsch
```

---

### Schritt 5: Workflow neu importieren (falls nötig)

**Falls der Workflow nicht existiert oder nicht aktiviert werden kann:**

1. **Workflows** → **Import from File**
2. **Datei auswählen:** `n8n-workflows/mattermost-agent-notification.json`
3. **Import** klicken
4. **Workflow öffnen**
5. **"Active" Toggle** aktivieren
6. **Webhook-Pfad prüfen** (sollte `agent-mattermost` sein)

---

### Schritt 6: Test mit korrigierter URL

**Nach Aktivierung:**

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{"agentId":"marketing","message":"Test"}'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Response: `{"success": true, "message": "Agent response sent to Mattermost"}`

---

## 🚨 Häufige Probleme

### Problem 1: Workflow ist nicht aktiv

**Symptom:**
- 404 Fehler
- "This webhook is not registered"

**Lösung:**
- Workflow öffnen
- "Active" Toggle aktivieren
- Status sollte "Active" (grün) sein

---

### Problem 2: Falscher Webhook-Pfad

**Symptom:**
- 404 Fehler
- Workflow ist aktiv

**Lösung:**
1. "Webhook Trigger" Node öffnen
2. "Path" Feld prüfen
3. Korrekten Path in curl verwenden

---

### Problem 3: Workflow existiert nicht

**Symptom:**
- Workflow nicht in Liste
- 404 Fehler

**Lösung:**
1. Workflow importieren: `n8n-workflows/mattermost-agent-notification.json`
2. Aktivieren
3. Testen

---

## ✅ Checkliste

**Vor dem Test:**
- [ ] Workflow existiert in n8n ✅
- [ ] Workflow ist aktiv (grüner Toggle) ✅
- [ ] Webhook-Pfad ist `agent-mattermost` ✅
- [ ] "Webhook Trigger" Node ist konfiguriert ✅

**Nach dem Test:**
- [ ] HTTP 200 OK ✅
- [ ] Response enthält `{"success": true}` ✅
- [ ] Mattermost bekommt Nachricht ✅

---

## 🔍 Debug-Befehle

### Prüfe ob Workflow aktiv ist

```bash
# GET Request (sollte 404 geben, wenn Workflow aktiv ist)
curl -X GET https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost

# POST Request (sollte 200 geben, wenn Workflow aktiv ist)
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{"agentId":"marketing","message":"Test"}'
```

---

## 📋 Nächste Schritte

**Nach erfolgreichem Fix:**
1. ✅ Test 1: Agent → Mattermost (sollte jetzt funktionieren)
2. ✅ Test 2: Reading → Mattermost
3. ✅ Test 3: Scheduled Reports → Mattermost

---

**Status:** 🔧 **Webhook 404 Fix-Anleitung erstellt!**
