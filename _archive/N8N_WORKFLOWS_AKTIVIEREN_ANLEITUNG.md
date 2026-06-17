# 🚀 n8n Reading-Agent Workflows aktivieren

**Schritt-für-Schritt-Anleitung**

---

## 📋 Übersicht

**3 Workflows werden aktiviert:**
1. `reading-generation-workflow.json` - Reading-Generierung via Webhook
2. `scheduled-reading-generation.json` - Geplante Reading-Generierung
3. `user-registration-reading.json` - Reading bei User-Registrierung

---

## 🔧 Schritt 1: n8n öffnen

1. Öffne: `https://n8n.werdemeisterdeinergedankenagent.de`
2. Logge dich ein
3. Gehe zu **Workflows**

---

## 📥 Schritt 2: Workflows importieren

### 2.1 Reading Generation Workflow

1. Klicke **Import from File** (oder **+** → **Import from File**)
2. Wähle: `n8n-workflows/reading-generation-workflow.json`
3. Klicke **Import**
4. Workflow wird geöffnet

**Prüfe:**
- ✅ Webhook-Node: `/webhook/reading`
- ✅ HTTP Request: Reading Agent URL
- ✅ Supabase Node: Readings speichern
- ✅ HTTP Request: Frontend benachrichtigen

### 2.2 Scheduled Reading Generation

1. Klicke **Import from File**
2. Wähle: `n8n-workflows/scheduled-reading-generation.json`
3. Klicke **Import**

**Prüfe:**
- ✅ Schedule Trigger: Cron-Expression (z.B. `0 9 * * *` = täglich 9:00)
- ✅ Supabase Node: Neue Subscriber abrufen
- ✅ HTTP Request: Reading Agent aufrufen

### 2.3 User Registration Reading

1. Klicke **Import from File**
2. Wähle: `n8n-workflows/user-registration-reading.json`
3. Klicke **Import**

**Prüfe:**
- ✅ Webhook-Node: `/webhook/user-registered`
- ✅ IF Node: Geburtsdaten prüfen
- ✅ HTTP Request: Reading Agent aufrufen

---

## ⚙️ Schritt 3: Environment Variables prüfen

**In n8n → Settings → Environment Variables:**

```bash
READING_AGENT_URL=http://138.199.237.34:4001
FRONTEND_URL=https://agent.the-connection-key.de
N8N_API_KEY=dein-api-key-hier
```

**Prüfe ob gesetzt:**
- ✅ `READING_AGENT_URL` - Reading Agent URL
- ✅ `FRONTEND_URL` - Frontend URL für Notifications
- ⚠️ `N8N_API_KEY` - Optional, für API-Key Authentifizierung

---

## 🔐 Schritt 4: Supabase Credentials konfigurieren

**Falls noch nicht konfiguriert:**

1. In n8n → **Credentials** → **New Credential**
2. Wähle **Supabase API**
3. Fülle aus:
   - **Name:** `Supabase Readings` (oder ähnlich)
   - **URL:** `https://njjcywgskzepikyzhihy.supabase.co` (deine Supabase URL)
   - **Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (dein Service Role Key)
4. Klicke **Save**

**In jedem Workflow:**
- Öffne Supabase Nodes
- Wähle die erstellten Credentials
- Prüfe Tabellen-Name: `readings`

---

## 🔗 Schritt 5: Webhook-URLs prüfen

### 5.1 Reading Generation Workflow

**Webhook-URL:**
```
https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading
```

**Prüfe:**
1. Öffne Workflow
2. Klicke auf Webhook-Node
3. Prüfe **Path:** `reading`
4. Prüfe **HTTP Method:** `POST`
5. Kopiere **Production URL** (sollte oben angezeigt werden)

### 5.2 User Registration Reading Workflow

**Webhook-URL:**
```
https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered
```

**Prüfe:**
1. Öffne Workflow
2. Klicke auf Webhook-Node
3. Prüfe **Path:** `user-registered`
4. Prüfe **HTTP Method:** `POST`

---

## 🎯 Schritt 6: Workflows aktivieren

### 6.1 Reading Generation Workflow

1. Öffne Workflow
2. Klicke **Activate** (oben rechts, Toggle)
3. Status sollte **Active** werden (grün)
4. Prüfe Webhook-URL wird angezeigt

### 6.2 Scheduled Reading Generation

1. Öffne Workflow
2. Klicke **Activate**
3. Status sollte **Active** werden
4. Prüfe Schedule Trigger ist aktiv

### 6.3 User Registration Reading

1. Öffne Workflow
2. Klicke **Activate**
3. Status sollte **Active** werden
4. Prüfe Webhook-URL wird angezeigt

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
2. Klicke **Execute Workflow** (oben rechts)
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

## ⚠️ Schritt 8: Fehlerbehebung

### Problem: Webhook nicht erreichbar

**Lösung:**
- Prüfe ob Workflow aktiviert ist
- Prüfe Webhook-URL (sollte `https://n8n.werdemeisterdeinergedankenagent.de/webhook/...` sein)
- Prüfe n8n Logs: `docker logs n8n --tail 50`

### Problem: Reading Agent nicht erreichbar

**Lösung:**
- Prüfe `READING_AGENT_URL` Environment Variable
- Prüfe ob Reading Agent läuft: `curl http://138.199.237.34:4001/health`
- Prüfe Firewall/Netzwerk

### Problem: Supabase Fehler

**Lösung:**
- Prüfe Supabase Credentials
- Prüfe Tabellen-Name: `readings`
- Prüfe RLS Policies (falls aktiviert)
- Prüfe Supabase Logs

### Problem: Frontend Notification fehlschlägt

**Lösung:**
- Prüfe `FRONTEND_URL` Environment Variable
- Prüfe ob `/api/notifications/reading` Route existiert
- Prüfe API-Key (falls verwendet)

---

## ✅ Checkliste

### Vor der Aktivierung
- [ ] n8n läuft und ist erreichbar
- [ ] Environment Variables gesetzt
- [ ] Supabase Credentials konfiguriert
- [ ] Reading Agent läuft und ist erreichbar
- [ ] Frontend `/api/notifications/reading` Route existiert

### Nach der Aktivierung
- [ ] Alle 3 Workflows importiert
- [ ] Alle 3 Workflows aktiviert
- [ ] Webhook-URLs notiert
- [ ] Test-Requests erfolgreich
- [ ] Readings werden in Supabase gespeichert
- [ ] Frontend Notifications funktionieren

---

## 📊 Workflow-Übersicht

### 1. Reading Generation Workflow

**Webhook:** `POST /webhook/reading`

**Input:**
```json
{
  "userId": "user-uuid",
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "birthPlace": "Berlin, Germany",
  "readingType": "detailed",
  "birthDate2": "1992-08-20",  // Optional: für Compatibility
  "birthTime2": "10:15",       // Optional: für Compatibility
  "birthPlace2": "München"      // Optional: für Compatibility
}
```

**Flow:**
```
Webhook → Check Compatibility? → Reading Agent → Supabase → Frontend Notification → Response
```

### 2. Scheduled Reading Generation

**Trigger:** Cron (täglich 9:00 Uhr)

**Flow:**
```
Schedule → Get New Subscribers → Split → Generate Reading → Save → Notify
```

### 3. User Registration Reading

**Webhook:** `POST /webhook/user-registered`

**Input:**
```json
{
  "userId": "user-uuid",
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "birthPlace": "Berlin, Germany"
}
```

**Flow:**
```
Webhook → Check Birth Data? → Generate Welcome Reading → Save → Notify User → Response
```

---

## 🎯 Nächste Schritte

Nach erfolgreicher Aktivierung:

1. **Status-basierte Integration implementieren**
   - Workflows für Status-Polling anpassen
   - Reaktion auf Status-Änderungen

2. **Event-Trigger einrichten**
   - User-Registrierung → Webhook in Next.js App
   - Neuer Abonnent → Mailchimp

3. **Monitoring einrichten**
   - Workflow-Execution-Logs überwachen
   - Fehler-Alerts konfigurieren

---

## 📝 Notizen

**Webhook-URLs:**
- Reading Generation: `https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading`
- User Registration: `https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered`

**Environment Variables:**
- `READING_AGENT_URL=http://138.199.237.34:4001`
- `FRONTEND_URL=https://agent.the-connection-key.de`

**Supabase:**
- URL: `https://njjcywgskzepikyzhihy.supabase.co`
- Tabelle: `readings`

