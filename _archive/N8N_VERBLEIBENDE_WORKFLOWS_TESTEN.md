# 🧪 Verbleibende n8n Workflows testen

**Status:** 5 von 8 Workflows getestet ✅

**Noch zu testen:** 3 Workflows

---

## 📋 Verbleibende Tests

### 1. Agent → Mattermost

**Test:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{"agentId":"marketing","message":"Test-Nachricht","userId":"test-user"}'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Response: `{"success":true,"message":"Agent response sent to Mattermost",...}`
- ✅ Mattermost Channel `#tech` bekommt Nachricht

**Was passiert:**
1. Webhook Trigger empfängt Request
2. Call Agent → Ruft Marketing Agent auf
3. Send to Mattermost → Sendet Nachricht an Mattermost
4. Respond to Webhook → Gibt Response zurück

---

### 2. Reading → Mattermost

**Test:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading-mattermost \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-01-01","birthTime":"12:00","birthPlace":"Berlin, Germany","userId":"test-user"}'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Response: `{"success":true,"message":"Reading sent to Mattermost",...}`
- ✅ Reading Agent wird aufgerufen
- ✅ Mattermost Channel `#readings` bekommt Nachricht

**Was passiert:**
1. Webhook Trigger empfängt Request
2. Call Reading Agent → Ruft Reading Agent auf (Port 4001)
3. Send to Mattermost → Sendet Reading an Mattermost
4. Respond to Webhook → Gibt Response zurück

---

### 3. Mailchimp Subscriber

**Test:**
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
- ✅ Response: `{"success":true,"message":"Subscriber processed",...}`
- ✅ ConnectionKey API bekommt Subscriber-Daten

**Was passiert:**
1. Webhook Trigger empfängt Mailchimp Webhook
2. Check Status = subscribed → Prüft ob `type: "subscribe"`
3. Prepare Payload → Extrahiert Email, Firstname, Lastname
4. Send to ConnectionKey API → Sendet an `/api/new-subscriber`
5. Respond to Webhook → Gibt Response zurück

---

## 📋 Checkliste

- [ ] Agent → Mattermost getestet
- [ ] Reading → Mattermost getestet
- [ ] Mailchimp Subscriber getestet
- [ ] Alle Responses geprüft
- [ ] Mattermost Nachrichten geprüft

---

## 🎯 Nächster Schritt

**Starte mit Agent → Mattermost Test:**

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{"agentId":"marketing","message":"Test","userId":"test-user"}'
```

**Aufwand:** 5 Minuten pro Workflow

---

**🎯 Teste jetzt die verbleibenden Workflows!**
