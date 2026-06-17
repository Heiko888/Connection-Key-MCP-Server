# 🔧 User Registration Workflow - MANUELL in n8n erstellen

**Problem:** Import funktioniert nicht
**Lösung:** Workflow manuell in n8n erstellen (15 Min)

---

## 🚀 Schritt 1: Neuen Workflow erstellen

1. **n8n öffnen:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Workflows** → **"+"** → **"Blank Workflow"**
3. **Name:** `User Registration → Reading`

---

## 🚀 Schritt 2: Webhook Node hinzufügen


1. **Klicke:** **"+"** (links) → **"Webhook"**
2. **Konfiguration:**
   - **HTTP Method:** `POST`
   - **Path:** `user-registered`
   - **Response Mode:** `responseNode`
3. **Save**
4. **Webhook-URL notieren:** Wird oben angezeigt
   - `https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered`

---

## 🚀 Schritt 3: IF Node hinzufügen (Geburtsdaten prüfen)

1. **Klicke:** **"+"** → **"IF"**
2. **Verbinde:** Webhook → IF
3. **Konfiguration:**
   - **Condition 1:**
     - **Value 1:** `{{ $json.body.birthDate }}`
     - **Operation:** `is not empty`
   - **Condition 2:**
     - **Value 1:** `{{ $json.body.birthTime }}`
     - **Operation:** `is not empty`
   - **Condition 3:**
     - **Value 1:** `{{ $json.body.birthPlace }}`
     - **Operation:** `is not empty`
   - **Combine:** `AND`
4. **Save**

---

## 🚀 Schritt 4: HTTP Request Node hinzufügen (Reading Agent)

1. **Klicke:** **"+"** → **"HTTP Request"**
2. **Verbinde:** IF (TRUE) → HTTP Request
3. **Konfiguration:**
   - **Method:** `POST`
   - **URL:** `http://138.199.237.34:4001/reading/generate`
   - **Body Content Type:** `JSON`
   - **JSON Body:**
```json
{
  "userId": "{{ $json.body.userId }}",
  "birthDate": "{{ $json.body.birthDate }}",
  "birthTime": "{{ $json.body.birthTime || '12:00' }}",
  "birthPlace": "{{ $json.body.birthPlace || 'Unknown' }}",
  "readingType": "basic"
}
```
4. **Save**

---

## 🚀 Schritt 5: Supabase Node hinzufügen (Save Reading)

1. **Klicke:** **"+"** → **"Supabase"**
2. **Verbinde:** HTTP Request → Supabase
3. **Konfiguration:**
   - **Credentials:** "Supabase account" (wähle aus)
   - **Resource:** `Row`
   - **Operation:** `Insert`
   - **Table:** `readings`
   - **Columns:**
     - **Mapping Mode:** `Define below`
     - **Add Column:**
       - `id`: `{{ $json.readingId }}`
       - `user_id`: `{{ $json.body.userId }}`
       - `reading_type`: `basic`
       - `birth_date`: `{{ $json.body.birthDate }}`
       - `birth_time`: `{{ $json.body.birthTime || '12:00' }}`
       - `birth_place`: `{{ $json.body.birthPlace || 'Unknown' }}`
       - `reading_text`: `{{ $json.reading || $json.reading.text }}`
       - `status`: `completed`
4. **Save**

---

## 🚀 Schritt 6: HTTP Request Node hinzufügen (Notify User - Optional)

1. **Klicke:** **"+"** → **"HTTP Request"**
2. **Verbinde:** Supabase → HTTP Request
3. **Konfiguration:**
   - **Method:** `POST`
   - **URL:** `https://agent.the-connection-key.de/api/notifications/reading`
   - **Body Content Type:** `JSON`
   - **JSON Body:**
```json
{
  "readingId": "{{ $json.readingId }}",
  "userId": "{{ $json.body.userId }}",
  "readingType": "basic",
  "status": "completed",
  "timestamp": "{{ $now }}"
}
```
4. **Save**

---

## 🚀 Schritt 7: Respond to Webhook Node hinzufügen

1. **Klicke:** **"+"** → **"Respond to Webhook"**
2. **Verbinde:** HTTP Request (Notify) → Respond to Webhook
3. **Konfiguration:**
   - **Respond With:** `JSON`
   - **Response Body:**
```json
{
  "success": true,
  "readingId": "{{ $json.readingId }}",
  "message": "Welcome Reading erfolgreich generiert"
}
```
4. **Save**

---

## 🚀 Schritt 8: IF (FALSE) → Respond to Webhook (Skip)

1. **Klicke:** **"+"** → **"Respond to Webhook"**
2. **Verbinde:** IF (FALSE) → Respond to Webhook
3. **Konfiguration:**
   - **Respond With:** `JSON`
   - **Response Body:**
```json
{
  "success": false,
  "message": "Geburtsdaten fehlen - Reading übersprungen"
}
```
4. **Save**

---

## ✅ Schritt 9: Workflow speichern und aktivieren

1. **Oben rechts:** **"Saved"** klicken
2. **Activate** Toggle aktivieren
3. **FERTIG!**

---

## 🧪 Schritt 10: Testen

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany"
  }'
```

**Erwartung:** Reading wird generiert und gespeichert

---

## ✅ Checkliste

- [ ] Workflow erstellt
- [ ] Webhook Node konfiguriert
- [ ] IF Node konfiguriert (Geburtsdaten prüfen)
- [ ] HTTP Request Node (Reading Agent) konfiguriert
- [ ] Supabase Node konfiguriert (Save Reading)
- [ ] HTTP Request Node (Notify) konfiguriert (optional)
- [ ] Respond to Webhook Nodes konfiguriert
- [ ] Workflow gespeichert
- [ ] Workflow aktiviert
- [ ] Getestet

---

## 🎯 FERTIG!

**Workflow ist jetzt manuell erstellt und sollte funktionieren!**

**Dann können wir weitermachen!**

