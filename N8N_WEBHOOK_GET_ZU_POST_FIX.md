# 🔧 n8n Webhook: GET → POST Fix

**Problem:** `"This webhook is not registered for POST requests"`

**Ursache:** Webhook Trigger ist auf **GET** konfiguriert, aber du sendest **POST** Requests!

---

## ✅ Lösung: HTTP Method auf POST ändern

### In n8n (manuell):

1. **Workflow öffnen:** "LOGGER → Mattermost"
2. **"Webhook Trigger" Node öffnen** (doppelklicken)
3. **"HTTP Method" Feld finden:**
   - Aktuell: `GET` (oder nicht gesetzt = Standard = GET)
   - **Ändern zu:** `POST` (aus Dropdown wählen)
4. **"Save"** klicken
5. **Workflow speichern**

**Erwartung:**
- ✅ Webhook Trigger zeigt jetzt "-POST-" statt "-GET-"
- ✅ Webhook-URL bleibt gleich: `https://n8n.werdemeisterdeinergedankenagent.de/webhook/log`
- ✅ POST Requests funktionieren jetzt!

---

## ✅ Workflow wurde bereits aktualisiert

**Datei:** `n8n-workflows/logger-mattermost.json`

**Änderung:**
- `"httpMethod": "POST"` wurde hinzugefügt

**Nächste Schritte:**
1. Workflow in n8n neu importieren (überschreibt alte Version)
2. Oder: HTTP Method manuell in n8n auf POST ändern

---

## 🧪 Testen

**Nach Änderung testen:**

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

## 📋 Checkliste

- [ ] Workflow geöffnet
- [ ] "Webhook Trigger" Node geöffnet
- [ ] **HTTP Method auf POST geändert** ⭐
- [ ] Workflow gespeichert
- [ ] Test erfolgreich

---

## 🎯 Wichtigste Punkte

1. **Webhook Trigger muss POST akzeptieren** ⭐
2. **Standard ist GET** → muss explizit auf POST geändert werden
3. **Workflow muss aktiviert sein** (Active = GRÜN)

**Ohne POST = 404 Fehler!**

---

## 🚀 Quick Fix

**Minimaler Aufwand:**

1. n8n öffnen
2. Workflow öffnen: "LOGGER → Mattermost"
3. "Webhook Trigger" Node öffnen
4. **HTTP Method: POST** wählen ⭐
5. Speichern
6. Testen

**Das war's!** 🎉
