# 📧 Mailchimp → n8n → Connection-Key.de Integration

Komplette Anleitung für Double-Opt-In Integration zwischen Mailchimp, n8n (auf Hetzner) und deiner Next.js App auf the-connection-key.de.

## 🏗️ Architektur

```
User auf the-connection-key.de
    ↓
Formular → Mailchimp
    ↓
Double-Opt-In (Mailchimp)
    ↓
Bestätigung → Mailchimp Webhook
    ↓
n8n auf Hetzner Server
    ↓
Next.js API (the-connection-key.de)
    ↓
Supabase Datenbank
```

## ✅ 1. Supabase Tabelle erstellen

In Supabase → SQL Editor ausführen:

```sql
-- Subscribers Tabelle
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  firstname TEXT,
  lastname TEXT,
  source TEXT DEFAULT 'mailchimp',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index für Performance
CREATE INDEX subscribers_email_idx ON subscribers (email);
CREATE INDEX subscribers_created_at_idx ON subscribers (created_at);

-- Optional: RLS (Row Level Security) aktivieren
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Nur Service Role kann schreiben
CREATE POLICY "Service role can insert" ON subscribers
  FOR INSERT
  TO service_role
  WITH CHECK (true);
```

## ✅ 2. Next.js API Route

Erstelle: `/pages/api/new-subscriber.ts` oder `/app/api/new-subscriber/route.ts`

### Für Pages Router (`/pages/api/new-subscriber.ts`):

```typescript
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Sicherheitscheck: API Key
  const auth = req.headers.authorization;
  const expected = `Bearer ${process.env.N8N_API_KEY}`;
  
  if (auth !== expected) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { email, firstname, lastname, source } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Missing email" });
  }

  // In Supabase speichern
  const { data, error } = await supabase
    .from("subscribers")
    .insert([
      {
        email: email.toLowerCase().trim(),
        firstname: firstname || null,
        lastname: lastname || null,
        source: source || "mailchimp",
      },
    ])
    .select()
    .single();

  if (error) {
    // Duplicate check
    if (error.code === "23505") {
      return res.status(200).json({ 
        status: "already_exists",
        message: "Subscriber already exists" 
      });
    }
    
    console.error("Supabase insert error:", error);
    return res.status(500).json({ 
      message: "Supabase insert failed", 
      error: error.message 
    });
  }

  return res.status(200).json({ 
    status: "saved",
    data 
  });
}
```

### Für App Router (`/app/api/new-subscriber/route.ts`):

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  // Sicherheitscheck
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${process.env.N8N_API_KEY}`;
  
  if (auth !== expected) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { email, firstname, lastname, source } = body;

  if (!email) {
    return NextResponse.json(
      { message: "Missing email" },
      { status: 400 }
    );
  }

  // In Supabase speichern
  const { data, error } = await supabase
    .from("subscribers")
    .insert([
      {
        email: email.toLowerCase().trim(),
        firstname: firstname || null,
        lastname: lastname || null,
        source: source || "mailchimp",
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { status: "already_exists", message: "Subscriber already exists" },
        { status: 200 }
      );
    }
    
    console.error("Supabase insert error:", error);
    return NextResponse.json(
      { message: "Supabase insert failed", error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { status: "saved", data },
    { status: 200 }
  );
}
```

## ✅ 3. Environment Variables in Next.js

In `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# n8n API Key (für Authentifizierung)
N8N_API_KEY=deinGeheimerSchlüssel123
```

**Wichtig:**
- `SUPABASE_SERVICE_ROLE_KEY` niemals clientseitig verwenden!
- `N8N_API_KEY` sollte stark und geheim sein

## ✅ 4. n8n Workflow auf Hetzner Server

### Workflow JSON (Importierbar)

Erstelle auf dem Hetzner Server: `/opt/mcp-connection-key/n8n-workflows/mailchimp-subscriber.json`

```json
{
  "name": "Double Opt In Mailchimp / ConnectionKey.de",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "mailchimp-confirmed",
        "responseMode": "onReceived",
        "options": {}
      },
      "id": "webhook-mailchimp",
      "name": "Mailchimp Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "webhookId": "mailchimp-confirmed"
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.type}}",
              "value2": "subscribe"
            },
            {
              "value1": "={{$json.data.status}}",
              "value2": "subscribed"
            }
          ]
        }
      },
      "id": "if-subscribed",
      "name": "Check Status = subscribed",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "jsCode": "const email = $input.item.json.data?.email || $input.item.json.email || '';\nconst mergeFields = $input.item.json.data?.merge_fields || $input.item.json.merge_fields || {};\n\nreturn [{\n  email: email.toLowerCase().trim(),\n  firstname: mergeFields.FNAME || mergeFields.fname || '',\n  lastname: mergeFields.LNAME || mergeFields.lname || '',\n  source: 'mailchimp'\n}];"
      },
      "id": "prepare-data",
      "name": "Prepare Payload",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [650, 300]
    },
    {
      "parameters": {
        "url": "https://www.the-connection-key.de/api/new-subscriber",
        "method": "POST",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            },
            {
              "name": "Authorization",
              "value": "=Bearer {{ $env.N8N_API_KEY }}"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "email",
              "value": "={{ $json.email }}"
            },
            {
              "name": "firstname",
              "value": "={{ $json.firstname }}"
            },
            {
              "name": "lastname",
              "value": "={{ $json.lastname }}"
            },
            {
              "name": "source",
              "value": "={{ $json.source }}"
            }
          ]
        },
        "options": {}
      },
      "id": "send-to-api",
      "name": "Send to ConnectionKey API",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [850, 300]
    }
  ],
  "connections": {
    "Mailchimp Webhook": {
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
  "pinData": {},
  "settings": {
    "executionOrder": "v1"
  },
  "staticData": null,
  "tags": [],
  "triggerCount": 0,
  "updatedAt": "2025-11-27T00:00:00.000Z",
  "versionId": "1"
}
```

## ✅ 5. n8n Environment Variable setzen

Auf dem Hetzner Server in `.env`:

```bash
# Füge hinzu:
N8N_API_KEY=deinGeheimerSchlüssel123
```

Dann n8n neu starten:

```bash
cd /opt/mcp-connection-key
docker-compose restart n8n
```

## ✅ 6. Mailchimp Webhook einrichten

1. Gehe zu **Mailchimp → Audience → Settings → Webhooks**
2. Klicke **Add Webhook**
3. URL: `https://IHR-HETZNER-SERVER-IP:5678/webhook/mailchimp-confirmed`
   - Oder mit Domain: `https://n8n.yourdomain.com/webhook/mailchimp-confirmed`
4. Events auswählen:
   - ✅ **Subscriber added** (wichtig!)
   - Optional: **Profile updated**
5. **Save Webhook**

## ✅ 7. Test-Ablauf

1. **Formular auf the-connection-key.de testen**
2. **Mailchimp sendet DOI-Mail**
3. **User bestätigt**
4. **Mailchimp → n8n Webhook**
5. **n8n → Next.js API**
6. **Supabase speichert**

## 🔍 Debugging

### n8n Logs prüfen:
```bash
cd /opt/mcp-connection-key
docker-compose logs -f n8n
```

### Next.js API testen:
```bash
curl -X POST https://www.the-connection-key.de/api/new-subscriber \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer deinGeheimerSchlüssel123" \
  -d '{
    "email": "test@example.com",
    "firstname": "Test",
    "lastname": "User",
    "source": "mailchimp"
  }'
```

## 📋 Checkliste

- [ ] Supabase Tabelle erstellt
- [ ] Next.js API Route erstellt
- [ ] Environment Variables gesetzt
- [ ] n8n Workflow importiert
- [ ] n8n Environment Variable gesetzt
- [ ] Mailchimp Webhook konfiguriert
- [ ] Test durchgeführt

## 🎉 Fertig!

Die Integration ist jetzt komplett eingerichtet. Bestätigte Mailchimp-Subscriber werden automatisch in deine Supabase Datenbank geschrieben.

