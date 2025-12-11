# 🔗 n8n Workflows für Agent-Integration

## Verfügbare Workflows

### 1. Reading Auto-Save Workflow

**Zweck:** Reading generieren → Speichern → Benachrichtigen

**Workflow:**
```
Webhook → Reading Agent → Supabase → E-Mail → Slack
```

**n8n Nodes:**
1. Webhook (Trigger)
2. HTTP Request (Reading Agent)
3. Supabase (Save)
4. E-Mail (Send)
5. Slack (Notify)

### 2. Agent Response Notification

**Zweck:** Agent-Antworten automatisch benachrichtigen

**Workflow:**
```
Webhook → MCP Agent → Transform → Notification
```

### 3. Multi-Agent Pipeline

**Zweck:** Mehrere Agenten in Sequenz

**Workflow:**
```
Webhook → Marketing → Social-YouTube → Automation → Save
```

### 4. Reading → Chart Development

**Zweck:** Reading generieren → Chart entwickeln

**Workflow:**
```
Webhook → Reading Agent → Chart Development Agent → Save
```

---

## Workflow-Erstellung

### Schritt 1: n8n öffnen
```
https://n8n.werdemeisterdeinergedankenagent.de
```

### Schritt 2: Workflow erstellen
- Neue Workflow erstellen
- Nodes hinzufügen
- Verbindungen konfigurieren

### Schritt 3: Webhook konfigurieren
- Webhook-URL generieren
- In Frontend/API verwenden

---

## Integration mit Frontend

### API-Route für n8n Webhook
```typescript
// pages/api/n8n/trigger-reading.ts
export default async function handler(req, res) {
  const n8nWebhook = process.env.N8N_READING_WEBHOOK;
  await fetch(n8nWebhook, {
    method: 'POST',
    body: JSON.stringify(req.body)
  });
}
```

