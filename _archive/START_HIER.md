# 🚀 Start-Anleitung - Mailchimp Integration

Hier ist die **exakte Reihenfolge**, wie du vorgehen sollst.

## 📋 Schritt 1: Hetzner Server vorbereiten

### 1.1 Auf Server verbinden
```bash
ssh root@IHR-SERVER-IP
cd /opt/mcp-connection-key
```

### 1.2 N8N_API_KEY in .env setzen
```bash
# Prüfe ob bereits vorhanden
grep N8N_API_KEY .env

# Falls nicht vorhanden, generiere einen
N8N_KEY=$(openssl rand -hex 32)
echo "" >> .env
echo "# n8n API Key für externe API-Calls" >> .env
echo "N8N_API_KEY=$N8N_KEY" >> .env

# Zeige den Key (WICHTIG: Notieren!)
echo "=========================================="
echo "⚠️  WICHTIG: Notieren Sie sich diesen Key!"
echo "=========================================="
echo "N8N_API_KEY=$N8N_KEY"
echo "=========================================="
echo ""
echo "Dieser Key wird auch in Ihrer Next.js .env.local benötigt!"

# n8n neu starten
docker-compose restart n8n
```

**⚠️ WICHTIG:** Notieren Sie sich den `N8N_API_KEY` - Sie brauchen ihn später für Next.js!

---

## 📋 Schritt 2: n8n Workflow importieren

### 2.1 n8n öffnen
- Browser: `http://IHR-SERVER-IP:5678`
- Login: `admin` / Ihr n8n Passwort (aus .env)

### 2.2 Workflow importieren
1. Klicke auf **"Workflows"** (oben)
2. Klicke auf **"Import from File"** oder **"+" → "Import from File"**
3. Lade die Datei hoch: `n8n-workflows/mailchimp-subscriber.json`
   - Falls die Datei noch nicht auf dem Server ist, lade sie hoch:
   ```bash
   # Von lokal auf Server hochladen
   scp n8n-workflows/mailchimp-subscriber.json root@IHR-SERVER-IP:/opt/mcp-connection-key/
   ```

### 2.3 Workflow aktivieren
- Nach dem Import: **Workflow aktivieren** (Toggle oben rechts)
- Webhook-URL notieren: `http://IHR-SERVER-IP:5678/webhook/mailchimp-confirmed`

---

## 📋 Schritt 3: Supabase Tabelle erstellen

### 3.1 In Supabase Dashboard
1. Gehe zu **Supabase Dashboard** → Dein Projekt
2. Klicke auf **SQL Editor**
3. Führe dieses SQL aus:

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

4. Klicke **Run** (oder F5)

---

## 📋 Schritt 4: Next.js API Route erstellen

### 4.1 API Route erstellen

**Für Pages Router:** Erstelle `/pages/api/new-subscriber.ts`

**Für App Router:** Erstelle `/app/api/new-subscriber/route.ts`

**Code:** Siehe `MAILCHIMP_INTEGRATION.md` (Abschnitt 2)

### 4.2 Environment Variables in Next.js

In `.env.local` (in deinem Next.js Projekt):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# n8n API Key (MUSS mit Hetzner Server übereinstimmen!)
N8N_API_KEY=der-selbe-key-wie-auf-hetzner
```

**⚠️ WICHTIG:** Der `N8N_API_KEY` muss **genau derselbe** sein wie auf dem Hetzner Server!

### 4.3 Supabase Package installieren (falls noch nicht)
```bash
npm install @supabase/supabase-js
```

---

## 📋 Schritt 5: Mailchimp Webhook einrichten

### 5.1 In Mailchimp Dashboard
1. Gehe zu **Mailchimp → Audience → Settings → Webhooks**
2. Klicke **Add Webhook**
3. **URL:** `http://IHR-SERVER-IP:5678/webhook/mailchimp-confirmed`
   - Oder mit Domain: `https://n8n.yourdomain.com/webhook/mailchimp-confirmed`
4. **Events auswählen:**
   - ✅ **Subscriber added** (wichtig!)
   - Optional: **Profile updated**
5. **Save Webhook**

### 5.2 Double-Opt-In aktivieren
1. **Mailchimp → Audience → Settings → Audience name & defaults**
2. ✅ **Enable double opt-in** aktivieren

---

## 📋 Schritt 6: Testen

### 6.1 Test-Ablauf
1. **Formular auf the-connection-key.de testen**
   - E-Mail eingeben
   - Absenden
2. **Mailchimp DOI-Mail prüfen**
   - E-Mail öffnen
   - "Confirm" klicken
3. **n8n Workflow prüfen**
   - n8n öffnen: `http://IHR-SERVER-IP:5678`
   - Workflow öffnen
   - "Executions" prüfen (sollte grün sein)
4. **Supabase prüfen**
   - Supabase Dashboard → Table Editor → `subscribers`
   - Neuer Eintrag sollte erscheinen

### 6.2 API direkt testen
```bash
# Von lokal aus
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

## ✅ Checkliste

- [ ] **Schritt 1:** N8N_API_KEY auf Hetzner Server gesetzt
- [ ] **Schritt 2:** n8n Workflow importiert und aktiviert
- [ ] **Schritt 3:** Supabase Tabelle erstellt
- [ ] **Schritt 4:** Next.js API Route erstellt
- [ ] **Schritt 4:** Environment Variables in Next.js gesetzt
- [ ] **Schritt 5:** Mailchimp Webhook konfiguriert
- [ ] **Schritt 5:** Double-Opt-In aktiviert
- [ ] **Schritt 6:** Test durchgeführt

---

## 🆘 Troubleshooting

### n8n Workflow läuft nicht
```bash
# Logs prüfen
cd /opt/mcp-connection-key
docker-compose logs -f n8n
```

### API gibt 401 Unauthorized
- Prüfe ob `N8N_API_KEY` in Next.js `.env.local` gesetzt ist
- Prüfe ob derselbe Key auf Hetzner Server verwendet wird
- Prüfe Header: `Authorization: Bearer IHR-KEY`

### Supabase Fehler
- Prüfe ob `SUPABASE_SERVICE_ROLE_KEY` gesetzt ist (nicht der anon key!)
- Prüfe ob Tabelle existiert
- Prüfe RLS Policies

---

## 🎯 Empfohlene Reihenfolge

1. ✅ **Zuerst:** Hetzner Server (N8N_API_KEY setzen)
2. ✅ **Dann:** Supabase Tabelle erstellen
3. ✅ **Dann:** Next.js API Route erstellen
4. ✅ **Dann:** n8n Workflow importieren
5. ✅ **Dann:** Mailchimp Webhook einrichten
6. ✅ **Zum Schluss:** Testen

---

## 📞 Nächste Schritte nach Setup

- [ ] Formular auf the-connection-key.de einbinden
- [ ] Automatische Welcome-Email einrichten
- [ ] Dashboard für Subscriber-Übersicht bauen
- [ ] Analytics/Reporting einrichten

