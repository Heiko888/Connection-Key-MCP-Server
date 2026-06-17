# 🚀 Phase 3: Reading Workflows aktivieren

**Status:** Phase 1 & 2 abgeschlossen ✅

**Nächste Priorität:** Reading Workflows (3 Workflows)

---

## 📊 Phase 3: Reading Workflows

### 1. User Registration → Reading

**Datei:** `n8n-workflows/user-registration-reading.json`

**Zweck:**
- Generiert automatisch ein Welcome Reading bei User-Registrierung
- Wird vom Frontend aufgerufen
- Reading Type: `basic`

**Schritte:**
1. n8n öffnen: `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Workflows** → **"+"** → **"Import from File"**
3. Datei: `n8n-workflows/user-registration-reading.json`
4. **Import** klicken
5. **"Webhook Trigger" Node öffnen**
6. **HTTP Method auf POST prüfen/ändern** ⭐
7. **"Active" Toggle aktivieren** (GRÜN)

**Webhook:** `/webhook/user-registered`

**Test:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","birthDate":"1990-01-01","birthTime":"12:00","birthPlace":"Berlin, Germany"}'
```

---

### 2. Scheduled Reading Generation

**Datei:** `n8n-workflows/scheduled-reading-generation.json`

**Zweck:**
- Generiert Readings nach Zeitplan
- Automatischer Schedule Trigger (täglich 9:00)
- Reading Type: `detailed`

**Schritte:**
1. **Workflows** → **"+"** → **"Import from File"**
2. Datei: `n8n-workflows/scheduled-reading-generation.json`
3. **Import** klicken
4. **"Active" Toggle aktivieren** (GRÜN)

**Trigger:** Schedule (täglich 9:00) - automatisch!

**Hinweis:** Kein Webhook Trigger → kein HTTP Method nötig

---

### 3. Reading Generation Workflow

**Datei:** `n8n-workflows/reading-generation-workflow.json`

**Zweck:**
- Bedingte Reading-Generierung
- Prüft `readingType` (basic/detailed)
- Wird von anderen Workflows aufgerufen

**Schritte:**
1. **Workflows** → **"+"** → **"Import from File"**
2. Datei: `n8n-workflows/reading-generation-workflow.json`
3. **Import** klicken
4. **"Webhook Trigger" Node öffnen**
5. **HTTP Method auf POST prüfen/ändern** ⭐
6. **"Active" Toggle aktivieren** (GRÜN)

**Webhook:** `/webhook/reading`

**Test:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-01-01","birthTime":"12:00","birthPlace":"Berlin, Germany","readingType":"basic","userId":"test-user"}'
```

---

## 📋 Checkliste: Phase 3

- [ ] User Registration → Reading importieren & aktivieren
- [ ] Scheduled Reading Generation importieren & aktivieren
- [ ] Reading Generation Workflow importieren & aktivieren
- [ ] HTTP Methods auf POST prüfen (bei Webhook Triggers)
- [ ] Alle Workflows testen

---

## 🧪 Tests

### 1. User Registration → Reading

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","birthDate":"1990-01-01","birthTime":"12:00","birthPlace":"Berlin, Germany"}'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Reading Agent wird aufgerufen
- ✅ Welcome Reading wird generiert

---

### 2. Reading Generation Workflow

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-01-01","birthTime":"12:00","birthPlace":"Berlin, Germany","readingType":"basic","userId":"test-user"}'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Reading Type wird geprüft (basic/detailed)
- ✅ Entsprechender Reading Agent wird aufgerufen

---

### 3. Scheduled Reading Generation

**Automatisch:** Läuft täglich um 9:00 Uhr

**Manuell testen:**
- In n8n: Workflow öffnen → "Execute Workflow" Button klicken

**Erwartung:**
- ✅ Reading Agent wird aufgerufen
- ✅ Detailed Reading wird generiert

---

## 📊 Fortschritt

**Aktuell:**
- ✅ 6 von 14 Workflows aktiviert (43%)
  - Phase 1 (Core): ✅ Abgeschlossen
  - Phase 2 (Mattermost): ✅ Abgeschlossen

**Nach Phase 3:**
- ✅ 9 von 14 Workflows aktiviert (64%)
  - Phase 3 (Reading): ✅ Abgeschlossen

---

## ✅ Was wurde aktualisiert

**Reading Workflows wurden aktualisiert:**
- `user-registration-reading.json` → `httpMethod: "POST"` hinzugefügt
- `reading-generation-workflow.json` → `httpMethod: "POST"` hinzugefügt
- `scheduled-reading-generation.json` → Kein Webhook Trigger (Schedule Trigger)

---

## 🎯 Nächste Schritte

**Nach Phase 3:**

### Phase 4: Marketing & Weitere

1. **Daily Marketing Content**
   - Datei: `n8n-workflows/daily-marketing-content.json`
   - Trigger: Schedule

2. **Mailchimp Subscriber**
   - Datei: `n8n-workflows/mailchimp-subscriber.json`
   - Webhook: `/webhook/mailchimp-subscriber`

**Hinweis:** Mailchimp API Sync läuft bereits (`mailchimp-api-sync-with-keys.json`)

---

## 🚀 Quick Start

**Empfehlung: Starte mit User Registration → Reading**

1. n8n öffnen
2. **Workflows** → **"+"** → **"Import from File"**
3. Datei: `n8n-workflows/user-registration-reading.json`
4. **Import** klicken
5. **"Webhook Trigger" Node öffnen**
6. **HTTP Method: POST** prüfen (sollte bereits POST sein)
7. **"Active" Toggle aktivieren** (GRÜN)
8. Testen

**Zeit:** 5 Minuten pro Workflow

---

**🎯 Starte jetzt mit Phase 3!**
