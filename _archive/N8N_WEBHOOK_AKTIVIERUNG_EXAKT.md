# ✅ n8n Webhook Aktivierung - Exakte Schritte

**Problem:** `404 - This webhook is not registered for POST requests`

**Ursache:** Workflow ist nicht aktiv oder existiert nicht

---

## 🎯 Exakte Schritte in n8n

### Schritt 1: n8n öffnen

1. Browser öffnen
2. Gehe zu: `https://n8n.werdemeisterdeinergedankenagent.de`
3. Einloggen (falls nötig)

---

### Schritt 2: Workflows öffnen

1. **Links in der Sidebar:** Klicke auf **"Workflows"**
2. Du siehst jetzt eine Liste aller Workflows

---

### Schritt 3: Workflow suchen

**Suche nach:** `Agent → Mattermost Notification`

**Falls gefunden:**
- Klicke auf den Workflow-Namen
- Gehe zu **Schritt 4**

**Falls NICHT gefunden:**
- Gehe zu **Schritt 3a (Import)**

---

### Schritt 3a: Workflow importieren (falls nicht gefunden)

1. **Oben rechts:** Klicke auf **"+"** Button
2. **Dropdown öffnen:** Wähle **"Import from File"**
3. **Datei auswählen:**
   - Navigiere zu: `n8n-workflows/mattermost-agent-notification.json`
   - Oder: Lade die Datei hoch
4. **"Import"** klicken
5. **Workflow öffnen:** Klicke auf den importierten Workflow

---

### Schritt 4: Workflow aktivieren

1. **Oben rechts im Workflow:** Siehst du einen **"Active" Toggle** (Schalter)
2. **Toggle klicken:** Schalter sollte **GRÜN** werden
3. **Status prüfen:** Oben sollte stehen **"Active"** (grün)

**WICHTIG:** 
- Der Toggle muss **EIN** (grün) sein
- Nur dann funktioniert der Webhook!

---

### Schritt 5: Webhook-URL prüfen

1. **"Webhook Trigger" Node** doppelklicken (erste Node im Workflow)
2. **"Path" Feld** prüfen:
   - Sollte sein: `agent-mattermost`
3. **"Webhook URL" kopieren** (falls angezeigt):
   - Diese URL verwenden für curl

---

### Schritt 6: Test erneut

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

## 🚨 Falls weiterhin 404

### Option A: Webhook-URL aus n8n kopieren

1. **"Webhook Trigger" Node** öffnen
2. **"Webhook URL" kopieren** (vollständige URL)
3. Diese URL in curl verwenden:

```bash
# Beispiel (URL aus n8n):
curl -X POST [WEBHOOK_URL_AUS_N8N] \
  -H "Content-Type: application/json" \
  -d '{"agentId":"marketing","message":"Test"}'
```

---

### Option B: Workflow-Status prüfen

1. **Workflow öffnen**
2. **"Executions" Tab** öffnen
3. **Prüfe:** Gibt es bereits Executions?
   - Falls ja: Workflow ist aktiv
   - Falls nein: Workflow ist nicht aktiv

---

### Option C: Workflow neu erstellen

**Falls nichts funktioniert:**

1. **Workflow löschen** (falls vorhanden)
2. **Neu importieren:** `n8n-workflows/mattermost-agent-notification.json`
3. **Aktivieren**
4. **Testen**

---

## ✅ Checkliste

**Vor dem Test:**
- [ ] n8n geöffnet ✅
- [ ] Workflows geöffnet ✅
- [ ] "Agent → Mattermost Notification" gefunden oder importiert ✅
- [ ] Workflow geöffnet ✅
- [ ] "Active" Toggle ist **GRÜN** ✅
- [ ] Status zeigt "Active" ✅

**Nach dem Test:**
- [ ] HTTP 200 OK ✅
- [ ] Response enthält `{"success": true}` ✅
- [ ] Mattermost bekommt Nachricht ✅

---

## 📸 Visuelle Hilfe

**"Active" Toggle sollte so aussehen:**

```
[  ] Inactive  ← Workflow ist NICHT aktiv (Webhook funktioniert NICHT)
[✓] Active     ← Workflow ist aktiv (Webhook funktioniert)
```

**Der Toggle muss GRÜN sein!**

---

## 🔍 Debug: Workflow-Status prüfen

**In n8n:**

1. **Workflow öffnen**
2. **Oben rechts:** Status sollte sein:
   - ✅ **"Active"** (grün) = Webhook funktioniert
   - ❌ **"Inactive"** (grau) = Webhook funktioniert NICHT

---

**Status:** ✅ **Exakte Schritt-für-Schritt-Anleitung erstellt!**
