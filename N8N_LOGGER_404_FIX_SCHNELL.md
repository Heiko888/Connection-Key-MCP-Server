# 🔧 n8n Logger 404 Fehler - Schnell-Fix

**Fehler:** `"This webhook is not registered for POST requests"`

**Ursache:** Workflow ist nicht importiert ODER nicht aktiviert!

---

## ✅ Lösung in 3 Schritten

### Schritt 1: Workflow importieren

1. **n8n öffnen:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Links:** Klicke auf **"Workflows"**
3. **Oben rechts:** Klicke auf **"+"** Button
4. **Dropdown:** Wähle **"Import from File"**
5. **Datei auswählen:** `n8n-workflows/logger-mattermost.json`
   - Falls auf Server: Datei hochladen
   - Falls lokal: Datei auswählen
6. **"Import"** klicken

**Erwartung:**
- ✅ Workflow erscheint in der Liste
- ✅ Name: "LOGGER → Mattermost"

---

### Schritt 2: Workflow aktivieren ⭐ KRITISCH!

**WICHTIG:** Ohne Aktivierung funktioniert der Webhook nicht!

1. **Klicke auf den Workflow:** "LOGGER → Mattermost"
2. **Workflow öffnet sich im Editor**
3. **Oben rechts:** Finde den **"Active" Toggle**
   - Oft ein Schalter oder Button
   - Status: "Inactive" (grau) oder "Active" (grün)
4. **Klicke auf "Active"** (oder den Toggle-Switch)
5. **Status sollte:** `Active` (GRÜN) werden

**Prüfen:**
- ✅ Toggle ist GRÜN
- ✅ Status zeigt "Active"
- ✅ Workflow-Liste zeigt "Active" Badge

**WICHTIG:** Ohne Aktivierung = 404 Fehler!

---

### Schritt 3: Testen

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
- ✅ Mattermost Channel `#tech` bekommt Nachricht

---

## ❌ Häufige Fehler

### Fehler 1: Workflow nicht importiert

**Symptom:**
- Workflow erscheint nicht in der Liste
- 404 Fehler beim Testen

**Lösung:**
- Workflow importieren (Schritt 1)

---

### Fehler 2: Workflow nicht aktiviert

**Symptom:**
- Workflow ist in der Liste, aber "Inactive" (grau)
- 404 Fehler beim Testen

**Lösung:**
- "Active" Toggle aktivieren (Schritt 2)

---

### Fehler 3: Falscher Webhook-Pfad

**Symptom:**
- Workflow aktiviert, aber 404 Fehler

**Lösung:**
- Prüfe Webhook Trigger Node:
  - Path sollte sein: `log`
  - Method: `POST`
- Webhook-URL sollte sein: `https://n8n.werdemeisterdeinergedankenagent.de/webhook/log`

---

## 📋 Checkliste

- [ ] n8n geöffnet
- [ ] Workflow importiert (`logger-mattermost.json`)
- [ ] Workflow geöffnet
- [ ] **"Active" Toggle aktiviert (GRÜN)** ⭐
- [ ] Test erfolgreich

---

## 🎯 Wichtigste Punkte

1. **Workflow muss importiert sein** ✅
2. **Workflow muss aktiviert sein** ⭐ (Active = GRÜN)
3. **Webhook-Pfad ist "log"** ✅

**Ohne Aktivierung = 404 Fehler!**

---

## 🚀 Quick Fix

**Minimaler Aufwand:**

1. n8n öffnen
2. Workflows → "+" → Import from File
3. `logger-mattermost.json` auswählen
4. Import klicken
5. Workflow öffnen
6. **"Active" Toggle aktivieren** ⭐
7. Testen

**Das war's!** 🎉
