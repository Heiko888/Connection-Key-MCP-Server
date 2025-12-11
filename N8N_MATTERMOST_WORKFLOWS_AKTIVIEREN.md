# 🔧 Mattermost Workflows aktivieren & testen

**Problem:** 404 Fehler bei `Agent → Mattermost` und `Reading → Mattermost`

**Status:** Workflow-Dateien sind korrekt konfiguriert, müssen nur in n8n aktiviert werden

---

## ✅ Prüfung: Workflow-Dateien

### Agent → Mattermost (`mattermost-agent-notification.json`)
- ✅ HTTP Method: `POST` (korrekt)
- ✅ Mattermost URL: `jt7w46gsxtr3pkqr75dkor9j3e` (korrigiert)
- ✅ Webhook Path: `agent-mattermost`

### Reading → Mattermost (`mattermost-reading-notification.json`)
- ✅ HTTP Method: `POST` (korrekt)
- ✅ Mattermost URL: `jt7w46gsxtr3pkqr75dkor9j3e` (korrekt)
- ✅ Webhook Path: `reading-mattermost`

---

## 🚀 Aktivierung in n8n (für beide Workflows)

### Schritt 1: n8n öffnen

```
https://n8n.werdemeisterdeinergedankenagent.de
```

---

### Schritt 2: Agent → Mattermost aktivieren

1. **Workflows** → Suche nach **"Agent → Mattermost Notification"**
2. **Workflow öffnen** (klicken)
3. **"Webhook Trigger" Node öffnen** (doppelklicken)
4. **Prüfe:**
   - ✅ **HTTP Method:** `POST` (sollte bereits gesetzt sein)
   - ✅ **Path:** `agent-mattermost`
5. **"Send to Mattermost" Node öffnen**
6. **Prüfe:**
   - ✅ **URL:** `https://chat.werdemeisterdeinergedanken.de/hooks/jt7w46gsxtr3pkqr75dkor9j3e`
7. **Workflow speichern** (oben rechts: "Save")
8. **"Active" Toggle aktivieren** (oben rechts: Toggle auf GRÜN)
9. **Status prüfen:** Sollte "Active" (grün) sein

---

### Schritt 3: Reading → Mattermost aktivieren

1. **Workflows** → Suche nach **"Reading Generation → Mattermost"**
2. **Workflow öffnen** (klicken)
3. **"Webhook Trigger" Node öffnen** (doppelklicken)
4. **Prüfe:**
   - ✅ **HTTP Method:** `POST` (sollte bereits gesetzt sein)
   - ✅ **Path:** `reading-mattermost`
5. **"Send to Mattermost" Node öffnen**
6. **Prüfe:**
   - ✅ **URL:** `https://chat.werdemeisterdeinergedanken.de/hooks/jt7w46gsxtr3pkqr75dkor9j3e`
7. **Workflow speichern** (oben rechts: "Save")
8. **"Active" Toggle aktivieren** (oben rechts: Toggle auf GRÜN)
9. **Status prüfen:** Sollte "Active" (grün) sein

---

## 🧪 Testen

### Test 1: Agent → Mattermost

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "marketing",
    "message": "Test-Nachricht",
    "userId": "test-user"
  }'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Response: `{"success": true, "message": "Agent response sent to Mattermost", ...}`
- ✅ Mattermost erhält Nachricht in `#tech` Channel

---

### Test 2: Reading → Mattermost

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading-mattermost \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-01-01",
    "birthTime": "12:00",
    "birthPlace": "Berlin, Germany",
    "userId": "test-user"
  }'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Response: `{"success": true, "message": "Reading sent to Mattermost", ...}`
- ✅ Mattermost erhält Nachricht in `#readings` Channel

---

## ❌ Falls weiterhin 404 Fehler

### Prüfe 1: Workflow existiert?

1. In n8n → **Workflows**
2. Suche nach dem Workflow-Namen
3. Falls nicht vorhanden → **Importieren:**
   - **"+"** → **"Import from File"**
   - Datei auswählen: `n8n-workflows/mattermost-agent-notification.json` oder `mattermost-reading-notification.json`
   - **"Import"** klicken

---

### Prüfe 2: Workflow ist aktiviert?

1. Workflow öffnen
2. **"Active" Toggle** oben rechts prüfen
3. **Muss GRÜN sein!** (nicht grau/aus)

**WICHTIG:** Ohne Aktivierung = 404 Fehler!

---

### Prüfe 3: HTTP Method ist POST?

1. Workflow öffnen
2. **"Webhook Trigger" Node öffnen**
3. **"HTTP Method" Feld prüfen:**
   - Sollte `POST` sein (nicht `GET`!)
4. Falls `GET` → Ändern zu `POST` → Speichern

---

### Prüfe 4: Mattermost URL korrekt?

1. **"Send to Mattermost" Node öffnen**
2. **URL prüfen:**
   - Sollte sein: `https://chat.werdemeisterdeinergedanken.de/hooks/jt7w46gsxtr3pkqr75dkor9j3e`
3. Falls Platzhalter → Ersetzen → Speichern

---

## 📋 Checkliste

### Agent → Mattermost
- [ ] Workflow importiert
- [ ] Workflow geöffnet
- [ ] HTTP Method = POST (Webhook Trigger)
- [ ] Mattermost URL korrekt (`jt7w46gsxtr3pkqr75dkor9j3e`)
- [ ] Workflow gespeichert
- [ ] **"Active" Toggle = GRÜN** ⭐
- [ ] Test erfolgreich

### Reading → Mattermost
- [ ] Workflow importiert
- [ ] Workflow geöffnet
- [ ] HTTP Method = POST (Webhook Trigger)
- [ ] Mattermost URL korrekt (`jt7w46gsxtr3pkqr75dkor9j3e`)
- [ ] Workflow gespeichert
- [ ] **"Active" Toggle = GRÜN** ⭐
- [ ] Test erfolgreich

---

## 🎯 Wichtigste Punkte

1. **Workflow muss importiert sein** ✅
2. **HTTP Method muss POST sein** ✅ (bereits in Dateien gesetzt)
3. **Mattermost URL muss korrekt sein** ✅ (beide Dateien aktualisiert)
4. **Workflow muss aktiviert sein** ⭐ (Active = GRÜN) ← **Das ist meistens das Problem!**

**Ohne Aktivierung = 404 Fehler!**

---

## ✅ Zusammenfassung

**Was wurde korrigiert:**
- ✅ `mattermost-agent-notification.json`: Mattermost URL aktualisiert (`PLATZHALTER_WEBHOOK_ID` → `jt7w46gsxtr3pkqr75dkor9j3e`)
- ✅ Beide Workflows haben `httpMethod: "POST"` korrekt gesetzt

**Was du jetzt machen musst:**
1. Beide Workflows in n8n öffnen
2. **"Active" Toggle aktivieren** (GRÜN) ⭐
3. Testen

**Das war's!** 🎉
