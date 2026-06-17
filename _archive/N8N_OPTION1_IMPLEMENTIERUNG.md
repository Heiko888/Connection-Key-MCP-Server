# 🚀 n8n Option 1: Neue Reading-Agent Workflows aktivieren

**Schritt-für-Schritt-Anleitung - JETZT UMSETZEN**

---

## 📋 Übersicht

**3 Workflows werden aktiviert:**
1. `reading-generation-workflow.json` - Reading-Generierung via Webhook
2. `scheduled-reading-generation.json` - Geplante Reading-Generierung
3. `user-registration-reading.json` - Reading bei User-Registrierung

**Geschätzter Aufwand:** 15-20 Minuten

---

## ✅ Schritt 1: n8n öffnen und vorbereiten

1. **Öffne n8n:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Logge dich ein**
3. **Gehe zu:** Workflows (linke Sidebar)

---

## 📥 Schritt 2: Workflow 1 - Reading Generation importieren

### 2.1 Importieren

1. Klicke **"+"** (oben rechts) → **"Import from File"**
2. Wähle: `n8n-workflows/reading-generation-workflow.json`
3. Klicke **"Import"**
4. Workflow wird geöffnet

### 2.2 Prüfen und konfigurieren

**Prüfe folgende Nodes:**

1. **Reading Webhook Node:**
   - Path: `reading`
   - HTTP Method: `POST`
   - Response Mode: `responseNode`
   - ✅ **Webhook-URL notieren:** `https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading`

2. **HTTP Request Node (Reading Agent):**
   - URL: `={{ $env.READING_AGENT_URL || 'http://138.199.237.34:4001' }}/reading/generate`
   - Method: `POST`
   - ✅ **Prüfe:** Environment Variable `READING_AGENT_URL` ist gesetzt

3. **Supabase Node:**
   - ✅ **Prüfe:** Credentials sind konfiguriert
   - ✅ **Prüfe:** Tabelle: `readings`
   - ✅ **Prüfe:** Operation: `Insert` oder `Update`

4. **HTTP Request Node (Frontend Notification):**
   - URL: `={{ $env.FRONTEND_URL || 'https://agent.the-connection-key.de' }}/api/notifications/reading`
   - Method: `POST`
   - ✅ **Prüfe:** Environment Variable `FRONTEND_URL` ist gesetzt

### 2.3 Aktivieren

1. Klicke **"Activate"** (oben rechts, Toggle)
2. Status sollte **"Active"** werden (grün)
3. ✅ **Webhook-URL wird angezeigt**

---

## 📥 Schritt 3: Workflow 2 - Scheduled Reading Generation importieren

### 3.1 Importieren

1. Klicke **"+"** → **"Import from File"**
2. Wähle: `n8n-workflows/scheduled-reading-generation.json`
3. Klicke **"Import"**

### 3.2 Prüfen und konfigurieren

**Prüfe folgende Nodes:**

1. **Schedule Trigger Node:**
   - ✅ **Cron-Expression:** z.B. `0 9 * * *` (täglich 9:00 Uhr)
   - ✅ **Timezone:** Deine Zeitzone

2. **Supabase Node (Get New Subscribers):**
   - ✅ **Prüfe:** Credentials sind konfiguriert
   - ✅ **Prüfe:** Query: Neue Subscriber abrufen

3. **HTTP Request Node (Reading Agent):**
   - URL: `={{ $env.READING_AGENT_URL || 'http://138.199.237.34:4001' }}/reading/generate`
   - ✅ **Prüfe:** Environment Variable `READING_AGENT_URL` ist gesetzt

### 3.3 Aktivieren

1. Klicke **"Activate"**
2. Status sollte **"Active"** werden
3. ✅ **Schedule Trigger ist aktiv**

---

## 📥 Schritt 4: Workflow 3 - User Registration Reading importieren

### 4.1 Importieren

1. Klicke **"+"** → **"Import from File"**
2. Wähle: `n8n-workflows/user-registration-reading.json`
3. Klicke **"Import"**

### 4.2 Prüfen und konfigurieren

**Prüfe folgende Nodes:**

1. **User Registration Webhook Node:**
   - Path: `user-registered`
   - HTTP Method: `POST`
   - ✅ **Webhook-URL notieren:** `https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered`

2. **IF Node (Check Birth Data):**
   - ✅ **Prüfe:** Bedingung prüft ob Geburtsdaten vorhanden sind

3. **HTTP Request Node (Reading Agent):**
   - URL: `={{ $env.READING_AGENT_URL || 'http://138.199.237.34:4001' }}/reading/generate`
   - ✅ **Prüfe:** Environment Variable `READING_AGENT_URL` ist gesetzt

### 4.3 Aktivieren

1. Klicke **"Activate"**
2. Status sollte **"Active"** werden
3. ✅ **Webhook-URL wird angezeigt**

---

## ⚙️ Schritt 5: Environment Variables prüfen

**In n8n → Settings → Environment Variables:**

```bash
READING_AGENT_URL=http://138.199.237.34:4001
FRONTEND_URL=https://agent.the-connection-key.de
N8N_API_KEY=dein-api-key-hier  # Optional
```

**Prüfe:**
- ✅ `READING_AGENT_URL` ist gesetzt
- ✅ `FRONTEND_URL` ist gesetzt
- ⚠️ `N8N_API_KEY` (optional, für API-Key Authentifizierung)

**Falls nicht gesetzt:**
1. Gehe zu **Settings** → **Environment Variables**
2. Füge hinzu:
   - `READING_AGENT_URL` = `http://138.199.237.34:4001`
   - `FRONTEND_URL` = `https://agent.the-connection-key.de`
3. Klicke **"Save"**

---

## 🔐 Schritt 6: Supabase Credentials prüfen

**Falls noch nicht konfiguriert:**

1. Gehe zu **Credentials** → **New Credential**
2. Wähle **Supabase API**
3. Fülle aus:
   - **Name:** `Supabase Readings`
   - **URL:** `https://njjcywgskzepikyzhihy.supabase.co`
   - **Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (dein Service Role Key)
4. Klicke **"Save"**

**In jedem Workflow:**
- Öffne Supabase Nodes
- Wähle die erstellten Credentials
- Prüfe Tabellen-Name: `readings`

---

## 🧪 Schritt 7: Workflows testen

### 7.1 Reading Generation Workflow testen

**Test-Request:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany",
    "readingType": "detailed"
  }'
```

**Erwartete Response:**
```json
{
  "success": true,
  "readingId": "reading-uuid-here",
  "message": "Reading erfolgreich generiert und gespeichert"
}
```

**Prüfe in n8n:**
- Öffne Workflow → **Executions**
- Prüfe ob Execution erfolgreich war
- Prüfe ob Reading in Supabase gespeichert wurde

### 7.2 Scheduled Reading Generation testen

**Manuell auslösen:**
1. Öffne Workflow
2. Klicke **"Execute Workflow"** (oben rechts)
3. Prüfe Execution-Log
4. Prüfe ob Readings generiert wurden

### 7.3 User Registration Reading testen

**Test-Request:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "new-user-456",
    "birthDate": "1992-08-20",
    "birthTime": "10:15",
    "birthPlace": "München, Germany"
  }'
```

**Erwartete Response:**
```json
{
  "success": true,
  "readingId": "reading-uuid-here",
  "message": "Welcome Reading erfolgreich generiert"
}
```

---

## ✅ Checkliste

### Vor der Aktivierung
- [ ] n8n läuft und ist erreichbar
- [ ] Environment Variables gesetzt (`READING_AGENT_URL`, `FRONTEND_URL`)
- [ ] Supabase Credentials konfiguriert
- [ ] Reading Agent läuft und ist erreichbar
- [ ] Frontend `/api/notifications/reading` Route existiert

### Nach der Aktivierung
- [ ] Alle 3 Workflows importiert
- [ ] Alle 3 Workflows aktiviert
- [ ] Webhook-URLs notiert:
  - Reading Generation: `https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading`
  - User Registration: `https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered`
- [ ] Test-Requests erfolgreich
- [ ] Readings werden in Supabase gespeichert
- [ ] Frontend Notifications funktionieren

---

## 📊 Webhook-URLs (notieren!)

**Reading Generation:**
```
https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading
```

**User Registration:**
```
https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered
```

**Diese URLs werden später in der Next.js App verwendet!**

---

## 🎯 Nächster Schritt

Nach erfolgreicher Aktivierung:
- ✅ **Option 1 abgeschlossen**
- ➡️ **Weiter mit Option 2:** Status-basierte Integration

---

## ⚠️ Fehlerbehebung

### Problem: Webhook nicht erreichbar
- Prüfe ob Workflow aktiviert ist
- Prüfe Webhook-URL (sollte `https://n8n.werdemeisterdeinergedankenagent.de/webhook/...` sein)
- Prüfe n8n Logs: `docker logs n8n --tail 50`

### Problem: Reading Agent nicht erreichbar
- Prüfe `READING_AGENT_URL` Environment Variable
- Prüfe ob Reading Agent läuft: `curl http://138.199.237.34:4001/health`
- Prüfe Firewall/Netzwerk

### Problem: Supabase Fehler
- Prüfe Supabase Credentials
- Prüfe Tabellen-Name: `readings`
- Prüfe RLS Policies (falls aktiviert)

---

**Los geht's! Führe die Schritte aus und gib Bescheid, wenn du fertig bist oder Fragen hast!**

