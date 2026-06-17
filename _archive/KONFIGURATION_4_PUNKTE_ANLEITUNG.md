# 🔧 Konfiguration: 4 Punkte abarbeiten

**Status:** Systematische Aktivierung aller Automatisierungen

---

## 📋 Übersicht

1. ✅ **Scheduled Automatisierungen aktivieren** (5 Min)
2. ✅ **Event-basierte Automatisierung aktivieren** (10 Min)
3. ✅ **Environment Variables prüfen** (5 Min)
4. ✅ **Supabase Konfiguration** (10 Min)

**Gesamtzeit:** ~30 Minuten

---

## 1️⃣ Scheduled Automatisierungen aktivieren

### Ziel
Marketing Agent soll täglich um 9:00 automatisch Content generieren.

### Schritt 1: n8n öffnen

```
https://n8n.werdemeisterdeinergedankenagent.de
```

### Schritt 2: Workflow importieren

1. **Workflows** → **"+"** → **"Import from File"**
2. **Datei auswählen:** `n8n-workflows/mattermost-scheduled-reports.json`
3. **"Import"** klicken

### Schritt 3: Schedule-Trigger konfigurieren

1. **Workflow öffnen:** "Scheduled Agent Reports → Mattermost"
2. **"Schedule Trigger" Node öffnen** (doppelklicken)
3. **"Rule" Tab öffnen**
4. **"Cron Expression" wählen**
5. **Cron setzen:** `0 9 * * *` (täglich 9:00)
   - **Alternative Zeiten:**
     - `0 8 * * *` = täglich 8:00
     - `0 9 * * 1` = montags 9:00
     - `0 */6 * * *` = alle 6 Stunden
6. **Timezone:** `Europe/Berlin` (oder deine Zeitzone)
7. **Speichern**

### Schritt 4: Workflow aktivieren

1. **"Active" Toggle aktivieren** (oben rechts: GRÜN)
2. **Status prüfen:** Sollte "Active" sein

### Schritt 5: Test (Optional)

**Manueller Test:**
```bash
# Workflow manuell ausführen (in n8n: "Execute Workflow")
# Oder warten bis 9:00 Uhr
```

**Erwartung:**
- ✅ Workflow startet täglich um 9:00
- ✅ Marketing Agent wird aufgerufen
- ✅ Mattermost erhält Nachricht in `#marketing` Channel

---

## 2️⃣ Event-basierte Automatisierung aktivieren

### A) User-Registrierung → Reading

#### Schritt 1: n8n Workflow aktivieren

1. **n8n öffnen**
2. **Workflow importieren:** `n8n-workflows/user-registration-reading.json`
3. **Workflow öffnen**
4. **"Webhook Trigger" Node prüfen:**
   - Path: `user-registered`
   - HTTP Method: `POST`
5. **Workflow aktivieren** (Active = GRÜN)

#### Schritt 2: Supabase Migration ausführen

**Option A: Via Supabase Dashboard (Empfohlen)**

1. **Supabase Dashboard öffnen**
2. **SQL Editor** öffnen
3. **Datei öffnen:** `integration/supabase/migrations/008_user_registration_trigger.sql`
4. **SQL kopieren und ausführen**

**Option B: Via Supabase CLI**

```bash
cd /opt/mcp-connection-key/integration/supabase
supabase db push
```

**SQL-Inhalt prüfen:**
- Trigger: `user_registration_reading_trigger`
- Funktion: `trigger_user_registration_reading()`
- Webhook-URL: `https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered`

#### Schritt 3: Test (Optional)

**Manueller Test:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "birthDate": "1990-01-01",
    "birthTime": "12:00",
    "birthPlace": "Berlin, Germany"
  }'
```

**Erwartung:**
- ✅ Webhook wird empfangen
- ✅ Reading Agent wird aufgerufen
- ✅ Welcome Reading wird generiert

---

### B) Mailchimp → Agent

#### Schritt 1: n8n Workflow aktivieren

1. **n8n öffnen**
2. **Workflow importieren:** `n8n-workflows/mailchimp-subscriber.json`
3. **Workflow öffnen**
4. **"Webhook Trigger" Node prüfen:**
   - Path: `mailchimp-confirmed`
   - HTTP Method: `POST`
5. **"Send to ConnectionKey API" Node prüfen:**
   - URL: `https://www.the-connection-key.de/api/new-subscriber`
   - Authorization: `Bearer {{ $env.N8N_API_KEY }}`
6. **Workflow aktivieren** (Active = GRÜN)

#### Schritt 2: Mailchimp Webhook konfigurieren

1. **Mailchimp Dashboard öffnen**
2. **Audience** → **Settings** → **Webhooks**
3. **"Create A Webhook"** klicken
4. **URL eingeben:**
   ```
   https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed
   ```
5. **Events auswählen:**
   - ✅ `subscribe` (wenn jemand abonniert)
   - ✅ `unsubscribe` (optional)
6. **"Save"** klicken

#### Schritt 3: Test (Optional)

**Manueller Test:**
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
- ✅ Webhook wird empfangen
- ✅ ConnectionKey API wird aufgerufen
- ✅ Subscriber wird verarbeitet

---

## 3️⃣ Environment Variables prüfen

### Schritt 1: Auf Server verbinden

```bash
ssh root@138.199.237.34
cd /opt/mcp-connection-key
```

### Schritt 2: .env Datei prüfen

```bash
# Prüfe ob .env existiert
ls -la .env

# Zeige wichtige Variablen
cat .env | grep -E "(OPENAI_API_KEY|MCP_SERVER_URL|N8N_API_KEY|SUPABASE|N8N_PASSWORD)"
```

### Schritt 3: Fehlende Variablen hinzufügen

**Falls Variablen fehlen:**

```bash
# Öffne .env Datei
nano .env

# Füge fehlende Variablen hinzu:
```

**Erforderliche Variablen:**

```bash
# ERFORDERLICH
OPENAI_API_KEY=sk-...                    # OpenAI API Key
N8N_PASSWORD=...                         # n8n Basic Auth Passwort
API_KEY=...                              # ConnectionKey API Key

# WICHTIG
MCP_SERVER_URL=http://138.199.237.34:7000  # MCP Server URL
N8N_API_KEY=...                          # n8n API Key (für n8n → API Calls)

# OPTIONAL (für Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### Schritt 4: n8n Environment Variables prüfen

**In n8n:**

1. **n8n öffnen**
2. **Settings** → **Environment Variables**
3. **Prüfe:**
   - `N8N_API_KEY` (falls verwendet)
   - Weitere Variablen nach Bedarf

**Falls `N8N_API_KEY` fehlt:**

1. **Generiere neuen Key:**
   ```bash
   openssl rand -hex 32
   ```

2. **In n8n eintragen:**
   - Settings → Environment Variables
   - `N8N_API_KEY` = generierter Key

3. **In .env eintragen:**
   ```bash
   echo "N8N_API_KEY=generierter-key" >> .env
   ```

### Schritt 5: Services neu starten (falls nötig)

**Falls .env geändert wurde:**

```bash
# Docker Services neu starten
cd /opt/mcp-connection-key
docker-compose down
docker-compose up -d

# Oder nur n8n neu starten
docker-compose restart n8n
```

---

## 4️⃣ Supabase Konfiguration

### Schritt 1: Supabase Migrationen prüfen

```bash
cd /opt/mcp-connection-key/integration/supabase/migrations
ls -la
```

**Erwartete Migrationen:**
- `001_initial_schema.sql` (oder ähnlich)
- `008_user_registration_trigger.sql`

### Schritt 2: Migrationen ausführen

**Option A: Via Supabase Dashboard (Empfohlen)**

1. **Supabase Dashboard öffnen**
2. **SQL Editor** öffnen
3. **Für jede Migration:**
   - Datei öffnen
   - SQL kopieren
   - In SQL Editor einfügen
   - **"Run"** klicken

**Option B: Via Supabase CLI**

```bash
cd /opt/mcp-connection-key/integration/supabase
supabase db push
```

### Schritt 3: Environment Variables setzen

**Auf Server:**

```bash
cd /opt/mcp-connection-key
nano .env
```

**Hinzufügen:**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
```

**Woher bekommen:**
- **Supabase Dashboard** → **Settings** → **API**
- **Project URL** = `NEXT_PUBLIC_SUPABASE_URL`
- **service_role key** = `SUPABASE_SERVICE_ROLE_KEY`

### Schritt 4: Frontend .env.local prüfen

**Falls Frontend separate .env.local hat:**

```bash
cd /opt/mcp-connection-key/integration/frontend
nano .env.local
```

**Hinzufügen:**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### Schritt 5: Test (Optional)

**Supabase Verbindung testen:**

```bash
# Via curl (falls Supabase REST API verfügbar)
curl -X GET "https://xxx.supabase.co/rest/v1/readings?select=*" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
```

---

## ✅ Checkliste: Alle 4 Punkte

### Punkt 1: Scheduled Automatisierungen
- [ ] n8n geöffnet
- [ ] Workflow `mattermost-scheduled-reports.json` importiert
- [ ] Schedule-Trigger konfiguriert (`0 9 * * *`)
- [ ] Workflow aktiviert (Active = GRÜN)
- [ ] Test erfolgreich (optional)

### Punkt 2: Event-basierte Automatisierung
- [ ] **User-Registrierung:**
  - [ ] n8n Workflow `user-registration-reading.json` aktiviert
  - [ ] Supabase Migration `008_user_registration_trigger.sql` ausgeführt
  - [ ] Test erfolgreich (optional)
- [ ] **Mailchimp:**
  - [ ] n8n Workflow `mailchimp-subscriber.json` aktiviert
  - [ ] Mailchimp Webhook konfiguriert
  - [ ] Test erfolgreich (optional)

### Punkt 3: Environment Variables
- [ ] `.env` Datei geprüft
- [ ] `OPENAI_API_KEY` gesetzt
- [ ] `MCP_SERVER_URL` gesetzt
- [ ] `N8N_API_KEY` gesetzt (falls verwendet)
- [ ] `N8N_PASSWORD` gesetzt
- [ ] Services neu gestartet (falls nötig)

### Punkt 4: Supabase Konfiguration
- [ ] Migrationen ausgeführt
- [ ] `NEXT_PUBLIC_SUPABASE_URL` gesetzt
- [ ] `SUPABASE_SERVICE_ROLE_KEY` gesetzt
- [ ] Frontend `.env.local` geprüft (falls nötig)
- [ ] Test erfolgreich (optional)

---

## 🧪 Test-Skript: Alle Konfigurationen prüfen

**Erstelle Test-Skript:**

```bash
# test-configuration.sh
#!/bin/bash

echo "🧪 Teste Konfigurationen..."
echo ""

# Test 1: Scheduled Workflow
echo "1. Scheduled Workflow..."
curl -s https://n8n.werdemeisterdeinergedankenagent.de/webhook/... | grep -q "..." && echo "✅ OK" || echo "❌ FEHLER"

# Test 2: User-Registrierung Webhook
echo "2. User-Registrierung Webhook..."
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","birthDate":"1990-01-01","birthTime":"12:00","birthPlace":"Berlin"}' | grep -q "success" && echo "✅ OK" || echo "❌ FEHLER"

# Test 3: Mailchimp Webhook
echo "3. Mailchimp Webhook..."
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed \
  -H "Content-Type: application/json" \
  -d '{"type":"subscribe","data":{"email":"test@example.com"}}' | grep -q "success" && echo "✅ OK" || echo "❌ FEHLER"

echo ""
echo "✅ Tests abgeschlossen!"
```

---

## 🎯 Zusammenfassung

**Was aktiviert wurde:**
- ✅ Scheduled Automatisierung (täglich 9:00)
- ✅ User-Registrierung → Reading
- ✅ Mailchimp → Agent
- ✅ Environment Variables geprüft
- ✅ Supabase konfiguriert

**Nächste Schritte:**
- ✅ System läuft vollautomatisch
- ✅ Agenten arbeiten zu festgelegten Zeiten
- ✅ Events lösen automatisch Aktionen aus

---

**🎉 Alle 4 Punkte abgeschlossen!** 🚀
