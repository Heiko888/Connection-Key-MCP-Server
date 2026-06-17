# 🔧 Server-IP Konfiguration

Ihre Hetzner Server-IP: **138.199.237.34**

## 🌐 URLs für Ihre Services

### n8n
- **Web Interface:** `http://138.199.237.34:5678`
- **Webhook URL:** `http://138.199.237.34:5678/webhook/mailchimp-confirmed`
- **Health Check:** `http://138.199.237.34:5678/healthz`

### Connection-Key API
- **API Base:** `http://138.199.237.34:3000`
- **Health Check:** `http://138.199.237.34:3000/health`
- **API Endpoint:** `http://138.199.237.34:3000/api/chat`

### ChatGPT-Agent
- **API Base:** `http://138.199.237.34:4000`
- **Health Check:** `http://138.199.237.34:4000/health`

## 📧 Mailchimp Webhook Konfiguration

### In Mailchimp einrichten:

1. **Mailchimp → Audience → Settings → Webhooks**
2. **Add Webhook**
3. **URL eingeben:**
   ```
   http://138.199.237.34:5678/webhook/mailchimp-confirmed
   ```
4. **Events:**
   - ✅ Subscriber added
   - Optional: Profile updated
5. **Save**

## 🔐 n8n Login

- **URL:** `http://138.199.237.34:5678`
- **Benutzername:** `admin`
- **Passwort:** Aus Ihrer `.env` Datei (N8N_PASSWORD)

## ✅ Quick Test

### Health Checks testen:
```bash
# Connection-Key
curl http://138.199.237.34:3000/health

# ChatGPT-Agent
curl http://138.199.237.34:4000/health

# n8n
curl http://138.199.237.34:5678/healthz
```

### n8n Webhook testen:
```bash
curl -X POST http://138.199.237.34:5678/webhook/mailchimp-confirmed \
  -H "Content-Type: application/json" \
  -d '{
    "type": "subscribe",
    "data": {
      "email": "test@example.com",
      "status": "subscribed",
      "merge_fields": {
        "FNAME": "Test",
        "LNAME": "User"
      }
    }
  }'
```

## 🔒 Wichtig: Firewall

Stellen Sie sicher, dass die Ports erreichbar sind:

```bash
# Auf Hetzner Server prüfen
ufw status

# Falls nicht erlaubt:
ufw allow 3000/tcp
ufw allow 4000/tcp
ufw allow 5678/tcp
```

## 🌍 Optional: Domain Setup

Falls Sie später eine Domain verwenden möchten:

### DNS-Einträge:
```
api.yourdomain.com     → 138.199.237.34
agent.yourdomain.com   → 138.199.237.34
n8n.yourdomain.com     → 138.199.237.34
```

Dann können Sie verwenden:
- `https://n8n.yourdomain.com/webhook/mailchimp-confirmed`
- `https://api.yourdomain.com`

## 📋 Für die Mailchimp Integration

### n8n Workflow Webhook URL:
```
http://138.199.237.34:5678/webhook/mailchimp-confirmed
```

### Next.js API (in n8n Workflow):
```
https://www.the-connection-key.de/api/new-subscriber
```

Die Next.js App läuft auf einer anderen Domain, daher bleibt die URL `https://www.the-connection-key.de/api/new-subscriber`.

