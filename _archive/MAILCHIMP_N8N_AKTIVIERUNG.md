# 📧 Mailchimp n8n Workflow aktivieren

**Status:** Workflow angepasst und bereit für Deployment

---

## ⚠️ Wichtig: API-Key manuell eintragen

Der Mailchimp Workflow benötigt einen API-Key für die Authentifizierung bei der Next.js API. Da n8n Community Edition keine Environment Variables unterstützt, muss der API-Key **manuell im Workflow eingetragen** werden.

---

## 🚀 Schritt 1: Workflow zum Server kopieren

**Automatisch:**
```powershell
.\deploy-n8n-workflows-to-server.ps1
```

**Manuell:**
```bash
scp n8n-workflows/mailchimp-subscriber.json root@138.199.237.34:/opt/mcp-connection-key/n8n-workflows/
```

---

## 🔑 Schritt 2: N8N_API_KEY erstellen (falls noch nicht vorhanden)

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
```

**⚠️ WICHTIG:** Notieren Sie sich den `N8N_API_KEY` - Sie brauchen ihn für:
1. n8n Workflow (manuell eintragen)
2. Next.js `.env.local` (für API-Authentifizierung)

---

## 📥 Schritt 3: Workflow in n8n importieren

1. **n8n öffnen:**
   ```
   https://n8n.werdemeisterdeinergedankenagent.de
   ```

2. **Workflow importieren:**
   - Klicken Sie auf **"Workflows"** (oben links)
   - Klicken Sie auf **"Import from File"**
   - Wählen Sie `/opt/mcp-connection-key/n8n-workflows/mailchimp-subscriber.json`
   - Oder kopieren Sie den JSON-Inhalt

3. **Workflow öffnen:**
   - Der Workflow sollte jetzt in Ihrer Liste erscheinen
   - Klicken Sie darauf, um ihn zu öffnen

---

## 🔧 Schritt 4: API-Key im Workflow eintragen

1. **Im Workflow:**
   - Klicken Sie auf den **"Send to ConnectionKey API"** Node

2. **Authorization Header anpassen:**
   - Suchen Sie das Feld **"Authorization"** in den Headers
   - Aktueller Wert: `Bearer YOUR_N8N_API_KEY_HERE`
   - Ersetzen Sie `YOUR_N8N_API_KEY_HERE` mit Ihrem tatsächlichen `N8N_API_KEY` (aus Schritt 2)
   - Beispiel: `Bearer abc123def456...`

3. **Speichern:**
   - Klicken Sie auf **"Save"** (oben rechts)

---

## ✅ Schritt 5: N8N_API_KEY in Next.js setzen

**Auf CK-App Server (`www.the-connection-key.de`):**

1. **`.env.local` öffnen:**
   ```bash
   ssh root@167.235.224.149
   cd /opt/hd-app/The-Connection-Key/frontend
   nano .env.local
   ```

2. **N8N_API_KEY hinzufügen:**
   ```bash
   # Fügen Sie hinzu:
   N8N_API_KEY=ihr-n8n-api-key-von-schritt-2
   ```

3. **Frontend neu starten:**
   ```bash
   pm2 restart the-connection-key
   ```

---

## 🔗 Schritt 6: API Route deployen

**Die API Route wurde bereits erstellt:**

**Lokale Datei:** `integration/api-routes/new-subscriber/route.ts`

**Zum Server kopieren:**
```bash
scp integration/api-routes/new-subscriber/route.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/new-subscriber/route.ts
```

**Oder mit dem Upload-Endpoint:**
```bash
curl -X POST https://www.the-connection-key.de/api/admin/upload \
  -H "x-api-key: YOUR_API_KEY" \
  -F "file=@integration/api-routes/new-subscriber/route.ts" \
  -F "type=file" \
  -F "subfolder=api/new-subscriber"
```

**Falls die Route noch nicht existiert, Code:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  // API-Key prüfen
  const authHeader = request.headers.get('authorization');
  const apiKey = authHeader?.replace('Bearer ', '');
  
  if (apiKey !== process.env.N8N_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { email, firstname, lastname, source } = body;

  if (!email) {
    return NextResponse.json(
      { error: 'Missing email' },
      { status: 400 }
    );
  }

  // In Supabase speichern
  const { data, error } = await supabase
    .from('subscribers')
    .insert([{
      email: email.toLowerCase().trim(),
      firstname: firstname || null,
      lastname: lastname || null,
      source: source || 'mailchimp',
    }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { status: 'already_exists', message: 'Subscriber already exists' },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { status: 'saved', data },
    { status: 200 }
  );
}
```

---

## 🌐 Schritt 7: Webhook-URL in Mailchimp eintragen

1. **Mailchimp öffnen:**
   - Gehen Sie zu: https://mailchimp.com
   - Login

2. **Webhook konfigurieren:**
   - Gehen Sie zu: **Audience** → **Settings** → **Webhooks**
   - Klicken Sie auf **"Create A Webhook"**
   - **Webhook URL:** 
     ```
     https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed
     ```
   - **Events:** Wählen Sie **"subscribe"** (wenn User Double-Opt-In bestätigt)
   - **Save**

---

## ✅ Schritt 8: Workflow aktivieren

1. **In n8n:**
   - Klicken Sie auf **"Active"** Toggle (oben rechts im Workflow)
   - Workflow sollte jetzt **grün** sein

2. **Webhook-URL notieren:**
   - Klicken Sie auf den **"Mailchimp Webhook"** Node
   - Die Webhook-URL sollte angezeigt werden:
     ```
     https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed
     ```

---

## 🧪 Schritt 9: Test durchführen

### Test 1: Webhook-URL testen

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed \
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

### Test 2: Echter Mailchimp Test

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

## 🔍 Troubleshooting

### Workflow läuft nicht
- ✅ Prüfen Sie: Ist der Workflow aktiviert? (Toggle oben rechts)
- ✅ Prüfen Sie: n8n Logs: `docker-compose logs n8n`

### Webhook kommt nicht an
- ✅ Prüfen Sie: Webhook-URL in Mailchimp korrekt?
- ✅ Prüfen Sie: HTTPS funktioniert? 
  ```bash
  curl https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed
  ```
- ✅ Prüfen Sie: Firewall erlaubt Port 443?

### API-Fehler in Next.js
- ✅ Prüfen Sie: `N8N_API_KEY` in `.env.local` gesetzt?
- ✅ Prüfen Sie: API-Key im n8n Workflow korrekt eingetragen?
- ✅ Prüfen Sie: Supabase Keys korrekt?
- ✅ Prüfen Sie: API Route existiert? (`/api/new-subscriber`)

### Authorization Error
- ✅ Prüfen Sie: API-Key im n8n Workflow identisch mit `.env.local`?
- ✅ Prüfen Sie: Header-Format korrekt? `Bearer YOUR_KEY` (mit Leerzeichen!)

---

## 🎉 Fertig!

Ihre Mailchimp Integration ist jetzt vollständig eingerichtet:

- ✅ Mailchimp → n8n Webhook
- ✅ n8n → Next.js API (mit API-Key)
- ✅ Next.js → Supabase
- ✅ Double-Opt-In funktioniert

**Webhook-URL für Mailchimp:**
```
https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed
```

---

## 📋 Checkliste

- [ ] Workflow zum Server kopiert
- [ ] N8N_API_KEY erstellt und notiert
- [ ] Workflow in n8n importiert
- [ ] API-Key im Workflow eingetragen
- [ ] N8N_API_KEY in Next.js `.env.local` gesetzt
- [ ] API Route `/api/new-subscriber` existiert
- [ ] Webhook-URL in Mailchimp eingetragen
- [ ] Workflow aktiviert
- [ ] Test durchgeführt

