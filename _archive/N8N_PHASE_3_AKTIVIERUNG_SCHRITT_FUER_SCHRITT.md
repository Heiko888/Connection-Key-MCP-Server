# 🚀 Phase 3: Reading Workflows aktivieren - Schritt für Schritt

**Status:** Phase 1 & 2 abgeschlossen ✅

**Ziel:** 3 Reading Workflows aktivieren

**Zeit:** 15 Minuten

---

## 📋 Übersicht: Phase 3 Workflows

1. **User Registration → Reading** (Webhook)
2. **Scheduled Reading Generation** (Schedule)
3. **Reading Generation Workflow** (Webhook)

---

## 🚀 Workflow 1: User Registration → Reading

### Schritt 1: Workflow importieren

1. **n8n öffnen:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Links:** Klicke auf **"Workflows"**
3. **Oben rechts:** Klicke auf **"+"** Button
4. **Dropdown:** Wähle **"Import from File"**
5. **Datei auswählen:** `n8n-workflows/user-registration-reading.json`
6. **"Import"** klicken

**Erwartung:**
- ✅ Workflow erscheint in der Liste
- ✅ Name: "User Registration → Reading"

---

### Schritt 2: HTTP Method prüfen

1. **Workflow öffnen:** "User Registration → Reading"
2. **"Webhook Trigger" Node öffnen** (doppelklicken)
3. **"HTTP Method" Feld prüfen:**
   - Sollte sein: `POST` (bereits aktualisiert)
   - Falls GET → auf POST ändern
4. **"Save"** klicken

---

### Schritt 3: Workflow aktivieren

1. **Oben rechts:** Finde den **"Active" Toggle"
2. **Klicke auf "Active"** (GRÜN werden)
3. **Workflow speichern**

---

### Schritt 4: Testen

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","birthDate":"1990-01-01","birthTime":"12:00","birthPlace":"Berlin, Germany"}'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Response: `{"success":true,"message":"Welcome reading generated",...}`

---

## 🚀 Workflow 2: Scheduled Reading Generation

### Schritt 1: Workflow importieren

1. **Workflows** → **"+"** → **"Import from File"**
2. **Datei auswählen:** `n8n-workflows/scheduled-reading-generation.json`
3. **"Import"** klicken

**Erwartung:**
- ✅ Workflow erscheint in der Liste
- ✅ Name: "Scheduled Reading Generation"

---

### Schritt 2: Workflow aktivieren

1. **Workflow öffnen:** "Scheduled Reading Generation"
2. **Oben rechts:** **"Active" Toggle aktivieren** (GRÜN)
3. **Workflow speichern**

**Hinweis:** Kein Webhook Trigger → kein HTTP Method nötig

---

### Schritt 3: Testen (optional)

**Manuell testen:**
- In n8n: Workflow öffnen → **"Execute Workflow"** Button klicken

**Automatisch:**
- Läuft täglich um 9:00 Uhr (Cron: `0 9 * * *`)

---

## 🚀 Workflow 3: Reading Generation Workflow

### Schritt 1: Workflow importieren

1. **Workflows** → **"+"** → **"Import from File"**
2. **Datei auswählen:** `n8n-workflows/reading-generation-workflow.json`
3. **"Import"** klicken

**Erwartung:**
- ✅ Workflow erscheint in der Liste
- ✅ Name: "Reading Generation Workflow"

---

### Schritt 2: HTTP Method prüfen

1. **Workflow öffnen:** "Reading Generation Workflow"
2. **"Webhook Trigger" Node öffnen** (doppelklicken)
3. **"HTTP Method" Feld prüfen:**
   - Sollte sein: `POST` (bereits aktualisiert)
   - Falls GET → auf POST ändern
4. **"Save"** klicken

---

### Schritt 3: Workflow aktivieren

1. **Oben rechts:** **"Active" Toggle aktivieren** (GRÜN)
2. **Workflow speichern**

---

### Schritt 4: Testen

**Test 1: Basic Reading**

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-01-01","birthTime":"12:00","birthPlace":"Berlin, Germany","readingType":"basic","userId":"test-user"}'
```

**Test 2: Detailed Reading**

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-01-01","birthTime":"12:00","birthPlace":"Berlin, Germany","readingType":"detailed","userId":"test-user"}'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Reading Type wird geprüft
- ✅ Entsprechender Reading Agent wird aufgerufen

---

## 📋 Checkliste: Phase 3

- [ ] User Registration → Reading importiert
- [ ] User Registration → Reading: HTTP Method = POST
- [ ] User Registration → Reading aktiviert
- [ ] User Registration → Reading getestet
- [ ] Scheduled Reading Generation importiert
- [ ] Scheduled Reading Generation aktiviert
- [ ] Reading Generation Workflow importiert
- [ ] Reading Generation Workflow: HTTP Method = POST
- [ ] Reading Generation Workflow aktiviert
- [ ] Reading Generation Workflow getestet

---

## 📊 Fortschritt

**Nach Phase 3:**
- ✅ 9 von 14 Workflows aktiviert (64%)
  - Phase 1 (Core): ✅ Abgeschlossen
  - Phase 2 (Mattermost): ✅ Abgeschlossen
  - Phase 3 (Reading): ✅ Abgeschlossen

---

## 🎯 Nächste Schritte

**Nach Phase 3:**

### Phase 4: Marketing & Weitere (2 Workflows)

1. **Daily Marketing Content**
   - Datei: `n8n-workflows/daily-marketing-content.json`
   - Trigger: Schedule

2. **Mailchimp Subscriber**
   - Datei: `n8n-workflows/mailchimp-subscriber.json`
   - Webhook: `/webhook/mailchimp-subscriber`

---

## ✅ Zusammenfassung

**Phase 3 Workflows:**
1. ✅ User Registration → Reading (Webhook: `/webhook/user-registered`)
2. ✅ Scheduled Reading Generation (Schedule: täglich 9:00)
3. ✅ Reading Generation Workflow (Webhook: `/webhook/reading`)

**Alle vorbereitet:**
- ✅ HTTP Methods auf POST gesetzt
- ✅ Workflows bereit zum Import

**🎯 Starte jetzt mit Workflow 1!**
