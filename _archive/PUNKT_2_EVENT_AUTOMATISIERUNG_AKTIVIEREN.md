# 🔧 Punkt 2: Event-basierte Automatisierung aktivieren

**Status:** Schritt-für-Schritt Aktivierung

---

## 📋 Übersicht

**Zwei Automatisierungen:**
1. **User-Registrierung → Reading** (Welcome Reading bei Registrierung)
2. **Mailchimp → Agent** (Neuer Abonnent → ConnectionKey API)

---

## A) User-Registrierung → Reading

### Schritt 1: n8n Workflow aktivieren

1. **n8n öffnen:**
   ```
   https://n8n.werdemeisterdeinergedankenagent.de
   ```

2. **Workflow importieren:**
   - **Workflows** → **"+"** → **"Import from File"**
   - **Datei:** `n8n-workflows/user-registration-reading.json`
   - **"Import"** klicken

3. **Workflow öffnen:** "User Registration → Reading"

4. **"Webhook Trigger" Node prüfen:**
   - **Path:** `user-registered`
   - **HTTP Method:** `POST` (sollte bereits gesetzt sein)
   - **Webhook URL:** `https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered`

5. **"Generate Welcome Reading" Node prüfen:**
   - **URL:** `http://138.199.237.34:4001/reading/generate`
   - **Body:** Sollte Geburtsdaten enthalten

6. **Workflow speichern** (oben rechts: "Save")

7. **Workflow aktivieren** (oben rechts: "Active" Toggle = GRÜN)

**✅ Workflow ist jetzt aktiv!**

---

### Schritt 2: Supabase Migration ausführen

**Option A: Via Supabase Dashboard (Empfohlen)**

1. **Supabase Dashboard öffnen**
2. **SQL Editor** öffnen
3. **Datei öffnen:** `integration/supabase/migrations/008_user_registration_trigger.sql`
4. **SQL kopieren:**
   ```sql
   -- Siehe Datei: integration/supabase/migrations/008_user_registration_trigger.sql
   ```
5. **In SQL Editor einfügen**
6. **"Run"** klicken

**Erwartung:**
- ✅ Funktion `trigger_user_registration_reading()` erstellt
- ✅ Trigger `user_registration_reading_trigger` erstellt

**Option B: Via Supabase CLI**

```bash
cd /opt/mcp-connection-key/integration/supabase
supabase db push
```

---

### Schritt 3: Test

**Manueller Test:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "birthDate": "1990-01-01",
    "birthTime": "12:00",
    "birthPlace": "Berlin, Germany"
  }'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Response: `{"success": true, "message": "Welcome reading generated", ...}`
- ✅ Reading Agent wird aufgerufen
- ✅ Welcome Reading wird generiert

---

## B) Mailchimp → Agent

### Schritt 1: n8n Workflow aktivieren

1. **n8n öffnen**

2. **Workflow importieren:**
   - **Workflows** → **"+"** → **"Import from File"**
   - **Datei:** `n8n-workflows/mailchimp-subscriber.json`
   - **"Import"** klicken

3. **Workflow öffnen:** "Mailchimp Subscriber → ConnectionKey"

4. **"Webhook Trigger" Node prüfen:**
   - **Path:** `mailchimp-confirmed`
   - **HTTP Method:** `POST` (sollte bereits gesetzt sein)
   - **Webhook URL:** `https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed`

5. **"Send to ConnectionKey API" Node prüfen:**
   - **URL:** `https://www.the-connection-key.de/api/new-subscriber`
   - **Authorization:** `Bearer {{ $env.N8N_API_KEY }}`
   - **Body:** Sollte E-Mail und Name enthalten

6. **Workflow speichern** (oben rechts: "Save")

7. **Workflow aktivieren** (oben rechts: "Active" Toggle = GRÜN)

**✅ Workflow ist jetzt aktiv!**

---

### Schritt 2: Mailchimp Webhook konfigurieren

1. **Mailchimp Dashboard öffnen:**
   ```
   https://mailchimp.com
   ```

2. **Audience auswählen:**
   - **Audience** → Deine Audience auswählen

3. **Webhooks öffnen:**
   - **Settings** → **Webhooks**

4. **Webhook erstellen:**
   - **"Create A Webhook"** klicken
   - **URL eingeben:**
     ```
     https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed
     ```
   - **Events auswählen:**
     - ✅ `subscribe` (wenn jemand abonniert) - **WICHTIG!**
     - ✅ `unsubscribe` (optional)
     - ✅ `profile` (optional)
   - **"Save"** klicken

**✅ Mailchimp Webhook ist jetzt konfiguriert!**

---

### Schritt 3: Test

**Manueller Test:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed \
  -H "Content-Type: application/json" \
  -d '{
    "type": "subscribe",
    "data": {
      "email": "test@example.com",
      "merge_fields": {
        "FNAME": "Test",
        "LNAME": "User"
      }
    }
  }'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Response: `{"success": true, "message": "Subscriber processed", ...}`
- ✅ ConnectionKey API wird aufgerufen
- ✅ Subscriber wird verarbeitet

---

## ✅ Checkliste: Punkt 2

### User-Registrierung → Reading
- [ ] n8n geöffnet
- [ ] Workflow `user-registration-reading.json` importiert
- [ ] Webhook Trigger geprüft (Path: `user-registered`, Method: POST)
- [ ] Workflow aktiviert (Active = GRÜN)
- [ ] Supabase Migration `008_user_registration_trigger.sql` ausgeführt
- [ ] Test erfolgreich

### Mailchimp → Agent
- [ ] n8n geöffnet
- [ ] Workflow `mailchimp-subscriber.json` importiert
- [ ] Webhook Trigger geprüft (Path: `mailchimp-confirmed`, Method: POST)
- [ ] "Send to ConnectionKey API" Node geprüft (URL, Authorization)
- [ ] Workflow aktiviert (Active = GRÜN)
- [ ] Mailchimp Webhook konfiguriert (URL, Events)
- [ ] Test erfolgreich

---

## 🧪 Test-Skript

**Erstelle Test-Skript:**

```bash
# test-event-automation.sh
#!/bin/bash

echo "🧪 Teste Event-basierte Automatisierung..."
echo ""

# Test 1: User-Registrierung
echo "1. User-Registrierung → Reading..."
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "birthDate": "1990-01-01",
    "birthTime": "12:00",
    "birthPlace": "Berlin, Germany"
  }'

echo ""
echo ""

# Test 2: Mailchimp
echo "2. Mailchimp → Agent..."
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed \
  -H "Content-Type: application/json" \
  -d '{
    "type": "subscribe",
    "data": {
      "email": "test@example.com",
      "merge_fields": {
        "FNAME": "Test",
        "LNAME": "User"
      }
    }
  }'

echo ""
echo ""
echo "✅ Tests abgeschlossen!"
```

---

## 🎯 Zusammenfassung

**Was aktiviert wurde:**
- ✅ User-Registrierung → Reading (n8n Workflow + Supabase Trigger)
- ✅ Mailchimp → Agent (n8n Workflow + Mailchimp Webhook)

**Nächste Schritte:**
- ✅ Events lösen automatisch Aktionen aus
- ✅ User-Registrierung generiert Welcome Reading
- ✅ Mailchimp-Abonnenten werden automatisch verarbeitet

---

**🎉 Punkt 2 abgeschlossen!** 🚀
