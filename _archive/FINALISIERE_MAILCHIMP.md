# 📧 Mailchimp Integration finalisieren

## ✅ Schritt 1: N8N_API_KEY prüfen/setzen

**Auf Hetzner Server:**

```bash
ssh root@138.199.237.34
cd /opt/mcp-connection-key

# Prüfe ob N8N_API_KEY existiert
grep N8N_API_KEY .env

# Falls nicht vorhanden, erstellen:
N8N_KEY=$(openssl rand -hex 32)
echo "" >> .env
echo "# n8n API Key für externe API-Calls" >> .env
echo "N8N_API_KEY=$N8N_KEY" >> .env

# Key anzeigen (WICHTIG: Notieren!)
echo "=========================================="
echo "⚠️  WICHTIG: Notieren Sie sich diesen Key!"
echo "=========================================="
echo "N8N_API_KEY=$N8N_KEY"
echo "=========================================="
echo ""
echo "Dieser Key wird auch in Next.js .env.local benötigt!"

# n8n neu starten
docker-compose restart n8n
```

**⚠️ WICHTIG:** Notieren Sie sich den `N8N_API_KEY` - Sie brauchen ihn für Next.js!

---

## ✅ Schritt 2: n8n öffnen

1. **Browser öffnen:**
   ```
   https://n8n.werdemeisterdeinergedankenagent.de
   ```

2. **Login:**
   - Username: `admin`
   - Passwort: Aus Ihrer `.env` Datei (`N8N_PASSWORD`)

---

## ✅ Schritt 3: Mailchimp Workflow importieren

### 3.1 Workflow-Datei auf Server hochladen

**Von lokal (wenn Sie die Datei lokal haben):**
```bash
scp n8n-workflows/mailchimp-subscriber.json root@138.199.237.34:/tmp/
```

**Oder direkt auf Server erstellen:**
```bash
# Auf Hetzner Server
cat > /tmp/mailchimp-subscriber.json << 'EOF'
{
  "name": "Double Opt In Mailchimp / ConnectionKey.de",
  "nodes": [
    {
      "id": "WebhookMailchimp",
      "name": "Mailchimp Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [300, 300],
      "parameters": {
        "httpMethod": "POST",
        "path": "mailchimp-confirmed",
        "responseMode": "onReceived",
        "options": {}
      },
      "webhookId": "mailchimp-confirmed"
    },
    {
      "id": "IfSubscribed",
      "name": "Check Status = subscribed",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [550, 300],
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.status}}",
              "value2": "subscribed"
            }
          ]
        }
      }
    },
    {
      "id": "PrepareData",
      "name": "Prepare Payload",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [800, 300],
      "parameters": {
        "functionCode": "return [{\n  email: $json.email,\n  firstname: $json.merge_fields?.FNAME || '',\n  lastname: $json.merge_fields?.LNAME || '',\n  source: \"mailchimp\"\n}];"
      }
    },
    {
      "id": "SendToNextJs",
      "name": "Send to ConnectionKey API",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [1050, 300],
      "parameters": {
        "url": "https://www.the-connection-key.de/api/new-subscriber",
        "method": "POST",
        "authentication": "headerAuth",
        "options": {},
        "jsonParameters": true,
        "headerParametersJson": "={\"Authorization\": \"Bearer {{ $env.N8N_API_KEY }}\", \"Content-Type\": \"application/json\"}",
        "bodyParametersJson": "={{ $json }}"
      }
    }
  ],
  "connections": {
    "WebhookMailchimp": {
      "main": [
        [
          {
            "node": "Check Status = subscribed",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Check Status = subscribed": {
      "main": [
        [
          {
            "node": "Prepare Payload",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Prepare Payload": {
      "main": [
        [
          {
            "node": "Send to ConnectionKey API",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {
    "executionOrder": "v1"
  }
}
EOF
```

### 3.2 Workflow in n8n importieren

1. **In n8n:**
   - Klicken Sie auf **"Workflows"** (oben links)
   - Klicken Sie auf **"Import from File"** oder **"Import from URL"**
   - Wählen Sie die Datei `/tmp/mailchimp-subscriber.json` oder kopieren Sie den JSON-Inhalt

2. **Workflow öffnen:**
   - Der Workflow sollte jetzt in Ihrer Liste erscheinen
   - Klicken Sie darauf, um ihn zu öffnen

---

## ✅ Schritt 4: Webhook-URL aktualisieren

### 4.1 Webhook-URL in n8n prüfen

1. **Im Workflow:**
   - Klicken Sie auf den **"Mailchimp Webhook"** Node
   - Die Webhook-URL sollte angezeigt werden

2. **Webhook-URL sollte sein:**
   ```
   https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed
   ```

3. **Falls HTTP statt HTTPS:**
   - Kopieren Sie die Webhook-URL
   - Ersetzen Sie `http://` durch `https://`
   - Ersetzen Sie die IP durch die Domain: `n8n.werdemeisterdeinergedankenagent.de`

### 4.2 Webhook-URL in Mailchimp eintragen

1. **Mailchimp öffnen:**
   - Gehen Sie zu: https://mailchimp.com
   - Login

2. **Webhook konfigurieren:**
   - Gehen Sie zu: **Audience** → **Settings** → **Webhooks**
   - Klicken Sie auf **"Create A Webhook"**
   - **Webhook URL:** `https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed`
   - **Events:** Wählen Sie **"subscribe"** (wenn User Double-Opt-In bestätigt)
   - **Save**

---

## ✅ Schritt 5: N8N_API_KEY in Next.js setzen

**In Ihrer Next.js App (`www.the-connection-key.de`):**

1. **`.env.local` öffnen:**
   ```bash
   # Fügen Sie hinzu:
   N8N_API_KEY=ihr-n8n-api-key-von-schritt-1
   ```

2. **API Route prüfen:**
   - Stellen Sie sicher, dass `/api/new-subscriber.ts` existiert
   - Siehe: `MAILCHIMP_INTEGRATION.md` für den Code

3. **Supabase prüfen:**
   - Stellen Sie sicher, dass die `subscribers` Tabelle existiert
   - Siehe: `MAILCHIMP_INTEGRATION.md` für SQL

---

## ✅ Schritt 6: Workflow aktivieren

1. **In n8n:**
   - Klicken Sie auf **"Active"** Toggle (oben rechts im Workflow)
   - Workflow sollte jetzt **grün** sein

2. **Test:**
   - Der Workflow wartet jetzt auf Webhooks von Mailchimp

---

## ✅ Schritt 7: Test durchführen

### 7.1 Test-Subscriber in Mailchimp

1. **Mailchimp:**
   - Gehen Sie zu: **Audience** → **Add Contacts**
   - Fügen Sie eine Test-E-Mail hinzu
   - Warten Sie auf Double-Opt-In E-Mail
   - Klicken Sie auf Bestätigungslink

2. **n8n prüfen:**
   - Gehen Sie zu: **Executions** (oben in n8n)
   - Sie sollten eine neue Execution sehen
   - Klicken Sie darauf, um Details zu sehen

3. **Supabase prüfen:**
   - Gehen Sie zu: Supabase → Table Editor → `subscribers`
   - Der neue Subscriber sollte erscheinen

---

## ✅ Schritt 8: Troubleshooting

### Workflow läuft nicht
- Prüfen Sie: Ist der Workflow aktiviert? (Toggle oben rechts)
- Prüfen Sie: n8n Logs: `docker-compose logs n8n`

### Webhook kommt nicht an
- Prüfen Sie: Webhook-URL in Mailchimp korrekt?
- Prüfen Sie: HTTPS funktioniert? `curl https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed`
- Prüfen Sie: Firewall erlaubt Port 443?

### API-Fehler in Next.js
- Prüfen Sie: `N8N_API_KEY` in `.env.local` gesetzt?
- Prüfen Sie: Supabase Keys korrekt?
- Prüfen Sie: API Route existiert?

---

## 🎉 Fertig!

Ihre Mailchimp Integration ist jetzt vollständig eingerichtet:

- ✅ Mailchimp → n8n Webhook
- ✅ n8n → Next.js API
- ✅ Next.js → Supabase
- ✅ Double-Opt-In funktioniert

**Webhook-URL für Mailchimp:**
```
https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed
```

