# 🔧 Punkt 2B: Mailchimp → Agent aktivieren

**Status:** Nächster Schritt nach erfolgreichem Punkt 2A

---

## 📋 Übersicht

**Ziel:** Mailchimp-Abonnenten automatisch an ConnectionKey API senden

**Flow:**
```
Mailchimp → n8n Webhook → ConnectionKey API
```

---

## Schritt 1: n8n Workflow aktivieren

### 1.1 n8n öffnen

```
https://n8n.werdemeisterdeinergedankenagent.de
```

### 1.2 Workflow importieren

1. **Workflows** → **"+"** → **"Import from File"**
2. **Datei auswählen:** `n8n-workflows/mailchimp-subscriber.json`
3. **"Import"** klicken

### 1.3 Workflow prüfen

**Workflow öffnen:** "Mailchimp Subscriber → ConnectionKey"

**Prüfe folgende Nodes:**

1. **"Webhook Trigger" Node:**
   - **Path:** `mailchimp-confirmed`
   - **HTTP Method:** `POST` (sollte bereits gesetzt sein)
   - **Webhook URL:** `https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed`

2. **"Check Status = subscribed" Node:**
   - Prüft ob `type === "subscribe"`

3. **"Prepare Payload" Node:**
   - Extrahiert E-Mail und Name aus Mailchimp Webhook

4. **"Send to ConnectionKey API" Node:**
   - **URL:** `https://www.the-connection-key.de/api/new-subscriber`
   - **Authorization:** `Bearer {{ $env.N8N_API_KEY }}`
   - **Body:** E-Mail, firstname, lastname, source

### 1.4 Environment Variable prüfen

**Wichtig:** Der Workflow verwendet `{{ $env.N8N_API_KEY }}`

**Prüfen:**
1. **n8n** → **Settings** → **Environment Variables**
2. **Prüfe:** `N8N_API_KEY` ist gesetzt?
3. **Falls nicht:**
   - Generiere Key: `openssl rand -hex 32`
   - In n8n eintragen
   - In `.env` eintragen: `echo "N8N_API_KEY=..." >> .env`

### 1.5 Workflow aktivieren

1. **Workflow speichern** (oben rechts: "Save")
2. **Workflow aktivieren** (oben rechts: "Active" Toggle = GRÜN)

**✅ Workflow ist jetzt aktiv!**

---

## Schritt 2: Mailchimp Webhook konfigurieren

### 2.1 Mailchimp Dashboard öffnen

```
https://mailchimp.com
```

### 2.2 Audience auswählen

1. **Audience** → Deine Audience auswählen
2. **Settings** → **Webhooks**

### 2.3 Webhook erstellen

1. **"Create A Webhook"** klicken
2. **URL eingeben:**
   ```
   https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed
   ```
3. **Events auswählen:**
   - ✅ `subscribe` (wenn jemand abonniert) - **WICHTIG!**
   - ✅ `unsubscribe` (optional)
   - ✅ `profile` (optional)
4. **"Save"** klicken

**✅ Mailchimp Webhook ist jetzt konfiguriert!**

---

## Schritt 3: Test

### 3.1 Manueller Test

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

### 3.2 Echter Test (Optional)

**In Mailchimp:**
1. Test-Abonnent hinzufügen
2. Prüfe ob Webhook ausgelöst wird
3. Prüfe ConnectionKey API Logs

---

## ✅ Checkliste: Punkt 2B

- [ ] n8n geöffnet
- [ ] Workflow `mailchimp-subscriber.json` importiert
- [ ] Webhook Trigger geprüft (Path: `mailchimp-confirmed`, Method: POST)
- [ ] "Send to ConnectionKey API" Node geprüft (URL, Authorization)
- [ ] `N8N_API_KEY` in n8n Environment Variables gesetzt
- [ ] Workflow aktiviert (Active = GRÜN)
- [ ] Mailchimp Dashboard geöffnet
- [ ] Mailchimp Webhook erstellt (URL, Events)
- [ ] Test erfolgreich

---

## 🎯 Zusammenfassung

**Was aktiviert wurde:**
- ✅ Mailchimp → Agent (n8n Workflow + Mailchimp Webhook)

**Nächste Schritte:**
- ✅ Mailchimp-Abonnenten werden automatisch verarbeitet
- ✅ ConnectionKey API wird bei neuem Abonnent aufgerufen

---

**🎉 Punkt 2B abgeschlossen!** 🚀
