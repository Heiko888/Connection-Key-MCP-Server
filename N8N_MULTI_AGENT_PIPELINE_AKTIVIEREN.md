# 🚀 Multi-Agent Pipeline Workflow aktivieren

**Problem:** `"This webhook is not registered for POST requests"`

**Ursache:** Workflow ist nicht importiert ODER nicht aktiviert ODER HTTP Method ist GET!

---

## ✅ Lösung in 3 Schritten

### Schritt 1: Workflow importieren

1. **n8n öffnen:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Links:** Klicke auf **"Workflows"**
3. **Oben rechts:** Klicke auf **"+"** Button
4. **Dropdown:** Wähle **"Import from File"**
5. **Datei auswählen:** `n8n-workflows/multi-agent-pipeline.json`
6. **"Import"** klicken

**Erwartung:**
- ✅ Workflow erscheint in der Liste
- ✅ Name: "Multi-Agent Content Pipeline"

---

### Schritt 2: HTTP Method auf POST prüfen/ändern ⭐

**WICHTIG:** Der Webhook Trigger muss POST akzeptieren!

1. **Workflow öffnen:** "Multi-Agent Content Pipeline"
2. **"Webhook Trigger" Node öffnen** (doppelklicken)
3. **"HTTP Method" Feld prüfen:**
   - Aktuell: `GET` (oder nicht gesetzt = Standard = GET)
   - **Ändern zu:** `POST` (aus Dropdown wählen)
4. **"Save"** klicken
5. **Workflow speichern**

**Erwartung:**
- ✅ Webhook Trigger zeigt jetzt "-POST-" statt "-GET-"
- ✅ POST Requests funktionieren jetzt!

---

### Schritt 3: Workflow aktivieren ⭐ KRITISCH!

**WICHTIG:** Ohne Aktivierung funktioniert der Webhook nicht!

1. **Oben rechts im Workflow-Editor:** Finde den **"Active" Toggle**
2. **Klicke auf "Active"** (oder den Toggle-Switch)
3. **Status sollte:** `Active` (GRÜN) werden

**Prüfen:**
- ✅ Toggle ist GRÜN
- ✅ Status zeigt "Active"
- ✅ Workflow-Liste zeigt "Active" Badge

**WICHTIG:** Ohne Aktivierung = 404 Fehler!

---

## 🧪 Testen

**Nach Aktivierung testen:**

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/content-pipeline \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle 5 Posts über Manifestation",
    "userId": "test-user"
  }'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Response: JSON mit `success: true` und Pipeline-Ergebnissen
- ✅ Alle 3 Agenten werden nacheinander aufgerufen:
  - Marketing Agent
  - Social-YouTube Agent
  - Automation Agent

---

## 📋 Checkliste

- [ ] n8n geöffnet
- [ ] Workflow importiert (`multi-agent-pipeline.json`)
- [ ] Workflow geöffnet
- [ ] **HTTP Method auf POST geändert** ⭐
- [ ] **"Active" Toggle aktiviert (GRÜN)** ⭐
- [ ] Test erfolgreich

---

## 🎯 Wichtigste Punkte

1. **Workflow muss importiert sein** ✅
2. **HTTP Method muss POST sein** ⭐
3. **Workflow muss aktiviert sein** ⭐ (Active = GRÜN)
4. **Webhook-Pfad ist "content-pipeline"** ✅

**Ohne POST oder Aktivierung = 404 Fehler!**

---

## 🚀 Quick Fix

**Minimaler Aufwand:**

1. n8n öffnen
2. Workflows → "+" → Import from File
3. `multi-agent-pipeline.json` auswählen
4. Import klicken
5. Workflow öffnen
6. **"Webhook Trigger" Node öffnen**
7. **HTTP Method: POST** wählen ⭐
8. **"Active" Toggle aktivieren** ⭐
9. Testen

**Das war's!** 🎉

---

## ✅ Workflow wurde bereits aktualisiert

**Datei:** `n8n-workflows/multi-agent-pipeline.json`

**Änderung:**
- `"httpMethod": "POST"` wurde hinzugefügt

**Nächste Schritte:**
1. Workflow in n8n importieren
2. HTTP Method prüfen (sollte bereits POST sein)
3. Workflow aktivieren
4. Testen
