# 🚀 Schnellstart - Mailchimp Integration

Server-IP: **138.199.237.34**

## ✅ Schritt 1: Hetzner Server - N8N_API_KEY setzen

**Auf Hetzner Server ausführen:**

```bash
ssh root@138.199.237.34
cd /opt/mcp-connection-key

# N8N_API_KEY generieren
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

# Prüfen
docker-compose ps | grep n8n
```

**⚠️ WICHTIG:** Notieren Sie sich den `N8N_API_KEY` - Sie brauchen ihn für Schritt 4!

---

## ✅ Schritt 2: n8n Workflow importieren

### 2.1 n8n öffnen
- Browser: `http://138.199.237.34:5678`
- Login: `admin` / Ihr n8n Passwort (aus .env)

### 2.2 Workflow-Datei auf Server hochladen (falls noch nicht vorhanden)

**Von lokal:**
```bash
# Auf Ihrem lokalen Rechner
scp n8n-workflows/mailchimp-subscriber.json root@138.199.237.34:/opt/mcp-connection-key/
```

**Oder direkt auf Server erstellen:**
```bash
# Auf Hetzner Server
cd /opt/mcp-connection-key
mkdir -p n8n-workflows
# Dann die JSON-Datei hochladen oder erstellen
```

### 2.3 Workflow importieren
1. In n8n: **Workflows** (oben) → **Import from File**
2. Datei auswählen: `n8n-workflows/mailchimp-subscriber.json`
3. **Import**
4. Workflow **aktivieren** (Toggle oben rechts)

### 2.4 Webhook-URL notieren
Nach dem Import sehen Sie die Webhook-URL:
```
http://138.199.237.34:5678/webhook/mailchimp-confirmed
```

---

## ✅ Schritt 3: Supabase Tabelle erstellen

1. **Supabase Dashboard** öffnen
2. **SQL Editor** → **New Query**
3. SQL ausführen:

```sql
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  firstname TEXT,
  lastname TEXT,
  source TEXT DEFAULT 'mailchimp',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE INDEX subscribers_email_idx ON subscribers (email);
CREATE INDEX subscribers_created_at_idx ON subscribers (created_at);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert" ON subscribers
  FOR INSERT
  TO service_role
  WITH CHECK (true);
```

4. **Run** (oder F5)

---

## ✅ Schritt 4: Next.js API Route erstellen

### 4.1 API Route erstellen

**Für Pages Router:** `/pages/api/new-subscriber.ts`

**Für App Router:** `/app/api/new-subscriber/route.ts`

**Code:** Siehe `MAILCHIMP_INTEGRATION.md` Abschnitt 2

### 4.2 Environment Variables

In `.env.local` (Next.js Projekt):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# n8n API Key (MUSS mit Hetzner Server übereinstimmen!)
N8N_API_KEY=der-key-aus-schritt-1
```

**⚠️ WICHTIG:** `N8N_API_KEY` muss **genau derselbe** sein wie in Schritt 1!

### 4.3 Supabase Package installieren
```bash
npm install @supabase/supabase-js
```

---

## ✅ Schritt 5: Mailchimp Webhook einrichten

1. **Mailchimp → Audience → Settings → Webhooks**
2. **Add Webhook**
3. **URL:**
   ```
   http://138.199.237.34:5678/webhook/mailchimp-confirmed
   ```
4. **Events:**
   - ✅ **Subscriber added**
   - Optional: Profile updated
5. **Save Webhook**

### Double-Opt-In aktivieren
1. **Mailchimp → Audience → Settings → Audience name & defaults**
2. ✅ **Enable double opt-in**

---

## ✅ Schritt 6: Testen

### 6.1 Test-Ablauf
1. **Formular auf the-connection-key.de testen**
2. **DOI-Mail von Mailchimp prüfen**
3. **"Confirm" klicken**
4. **n8n prüfen:**
   - `http://138.199.237.34:5678`
   - Workflow öffnen
   - "Executions" prüfen (sollte grün sein)
5. **Supabase prüfen:**
   - Table Editor → `subscribers`
   - Neuer Eintrag sollte erscheinen

### 6.2 API direkt testen
```bash
# Ersetzen Sie IHR-N8N-API-KEY mit dem Key aus Schritt 1
curl -X POST https://www.the-connection-key.de/api/new-subscriber \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer IHR-N8N-API-KEY" \
  -d '{
    "email": "test@example.com",
    "firstname": "Test",
    "lastname": "User",
    "source": "mailchimp"
  }'
```

---

## 📋 Checkliste

- [ ] **Schritt 1:** N8N_API_KEY auf Hetzner gesetzt und notiert
- [ ] **Schritt 2:** n8n Workflow importiert und aktiviert
- [ ] **Schritt 3:** Supabase Tabelle erstellt
- [ ] **Schritt 4:** Next.js API Route erstellt
- [ ] **Schritt 4:** Environment Variables in Next.js gesetzt (mit gleichem N8N_API_KEY!)
- [ ] **Schritt 5:** Mailchimp Webhook konfiguriert
- [ ] **Schritt 5:** Double-Opt-In aktiviert
- [ ] **Schritt 6:** Test durchgeführt

---

## 🆘 Troubleshooting

### n8n Workflow läuft nicht
```bash
# Auf Hetzner Server
cd /opt/mcp-connection-key
docker-compose logs -f n8n
```

### API gibt 401 Unauthorized
- Prüfe ob `N8N_API_KEY` in Next.js `.env.local` gesetzt ist
- Prüfe ob **derselbe** Key wie auf Hetzner verwendet wird
- Prüfe Header: `Authorization: Bearer IHR-KEY`

### Supabase Fehler
- Prüfe ob `SUPABASE_SERVICE_ROLE_KEY` gesetzt ist (nicht anon key!)
- Prüfe ob Tabelle existiert
- Prüfe RLS Policies

---

## 🎯 Zusammenfassung

**Flow:**
```
User → Formular → Mailchimp → DOI → Webhook → n8n (138.199.237.34:5678) → Next.js API → Supabase
```

**Wichtige URLs:**
- n8n: `http://138.199.237.34:5678`
- Webhook: `http://138.199.237.34:5678/webhook/mailchimp-confirmed`
- Next.js API: `https://www.the-connection-key.de/api/new-subscriber`

**Wichtige Keys:**
- `N8N_API_KEY` muss auf Hetzner UND in Next.js identisch sein!

