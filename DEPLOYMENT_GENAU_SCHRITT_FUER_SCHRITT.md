# 🚀 Deployment - Schritt für Schritt (Genau)

**Datum:** 28.12.2025  
**Branch:** `feature/reading-agent-option-a-complete`

---

## 📋 VORBEREITUNG

### Prüfe lokale Änderungen

```bash
# Auf deinem lokalen Rechner
cd c:\AppProgrammierung\Projekte\MCP_Connection_Key

# Prüfe Status
git status

# Prüfe ob alles committed ist
git log --oneline -3
```

**Erwartet:**
- `630bf04` - security: remove N8N_API_KEY from mailchimp workflow
- `3178e39` - docs: finalize deployment + supabase migration
- `ee35745` - Fix Log Start node + add error paths

---

## 1️⃣ SUPABASE MIGRATION (Zuerst!)

### Schritt 1.1: Supabase Dashboard öffnen

1. Gehe zu: **https://supabase.com/dashboard**
2. Wähle dein Projekt aus
3. Klicke auf: **SQL Editor** (linke Sidebar)

### Schritt 1.2: Migration ausführen

1. **Klicke auf:** "New query" (oben rechts)
2. **Öffne Datei:** `integration/supabase/migrations/009_create_reading_jobs_table.sql`
3. **Kopiere den kompletten Inhalt** (Zeilen 1-79)
4. **Füge in SQL Editor ein**
5. **Klicke auf:** "Run" (oder `Ctrl+Enter`)

### Schritt 1.3: Prüfung

**Führe diese Query aus:**

```sql
-- Prüfe ob Tabelle existiert
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'reading_jobs';
```

**✅ Erwartet:** Eine Zeile mit `reading_jobs`

**Prüfe Schema:**

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'reading_jobs'
ORDER BY ordinal_position;
```

**✅ Erwartet:** 8 Spalten (id, user_id, reading_type, status, result, error, created_at, updated_at)

---

## 2️⃣ SERVER 138 (Hetzner) - MCP Core + n8n

### Schritt 2.1: SSH zum Hetzner Server

```bash
ssh root@138.199.237.34
```

### Schritt 2.2: Ins Projekt-Verzeichnis wechseln

```bash
cd /opt/mcp-connection-key
pwd
# Sollte zeigen: /opt/mcp-connection-key
```

### Schritt 2.3: Prüfe aktuellen Branch

```bash
git branch
# Sollte zeigen: * feature/reading-agent-option-a-complete
# ODER: * main

# Falls main, wechsle Branch:
git checkout feature/reading-agent-option-a-complete
```

### Schritt 2.4: Git Pull

```bash
# Prüfe ob Remote konfiguriert ist
git remote -v

# Pull durchführen
git pull origin feature/reading-agent-option-a-complete

# Prüfe ob Dateien aktualisiert wurden
ls -la index.js
ls -la n8n-workflows/reading-generation-workflow.json
```

**Erwartete Ausgabe:**
```
Updating <old-commit>..<new-commit>
 index.js                                    |  XX +++++++++
 n8n-workflows/reading-generation-workflow.json |  XX +++++++++
```

### Schritt 2.5: Prüfe wie MCP Server läuft

```bash
# Option A: Systemd Service
systemctl status mcp

# Option B: PM2
pm2 list | grep mcp

# Option C: Docker
docker ps | grep mcp

# Option D: Direkter Prozess
ps aux | grep "mcp-gateway\|server.js" | grep -v grep
```

### Schritt 2.6: MCP Core neu starten

**Falls Systemd:**
```bash
# Service neu starten
systemctl restart mcp

# Status prüfen
systemctl status mcp

# Logs prüfen
journalctl -u mcp -n 50 --no-pager | grep "MCP Core"
```

**Falls PM2:**
```bash
# PM2 Prozess finden
pm2 list

# MCP Prozess neu starten (Name kann variieren)
pm2 restart mcp
# ODER
pm2 restart all

# Logs prüfen
pm2 logs mcp --lines 50 --nostream | grep "MCP Core"
```

**Falls Docker:**
```bash
# Container Name prüfen
docker ps | grep mcp

# Container neu starten
docker restart <container-name>
# Beispiel: docker restart mcp-gateway

# Logs prüfen
docker logs <container-name> --tail 50 | grep "MCP Core"
```

### Schritt 2.7: Prüfe MCP Core Logs

```bash
# Systemd
journalctl -u mcp -f | grep "MCP Core"

# PM2
pm2 logs mcp --lines 20

# Docker
docker logs <container-name> -f | grep "MCP Core"
```

**Erwartete Logs (nach Test-Request):**
```
[MCP Core] generateReading aufgerufen für readingId: <uuid>, readingType: basic
[MCP Core] Payload validiert und normalisiert für readingId: <uuid>
[MCP Core] Rufe n8n Webhook auf für readingId: <uuid>
```

### Schritt 2.8: n8n Workflow importieren

**Option A: Via n8n UI (Empfohlen)**

1. **Öffne n8n:** https://n8n.werdemeisterdeinergedankenagent.de
2. **Login** (Admin-Credentials)
3. **Gehe zu:** Workflows (linke Sidebar)
4. **Klicke auf:** "+" (oben rechts) → **"Import from File"**
5. **Wähle Datei:** `/opt/mcp-connection-key/n8n-workflows/reading-generation-workflow.json`
6. **Klicke:** "Import"
7. **Prüfe Workflow:**
   - Webhook-Pfad: `/webhook/reading` ✅
   - Node "Validate Payload" vorhanden ✅
   - Node "Save Reading" (INSERT readings) vorhanden ✅
   - Node "Update Reading Job" (UPDATE reading_jobs) vorhanden ✅
8. **Aktiviere Workflow:** Toggle oben rechts auf **GRÜN**
9. **Test:** Klicke auf "Execute Workflow" → Prüfe Output

**Option B: Via n8n API**

```bash
# n8n API Key holen (aus n8n UI: Settings → API)
N8N_API_KEY="your-api-key-here"

# Workflow importieren
curl -X POST http://localhost:5678/api/v1/workflows \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  -d @n8n-workflows/reading-generation-workflow.json
```

### Schritt 2.9: Prüfe n8n Workflow Status

```bash
# Prüfe ob Workflow aktiv ist
curl -X GET http://localhost:5678/api/v1/workflows \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" | \
  jq '.[] | select(.name == "Reading Generation Workflow") | {id, active, nodes: .nodes | length}'
```

**✅ Erwartet:** `"active": true`

---

## 3️⃣ SERVER 167 (CK-App) - Frontend

### Schritt 3.1: SSH zum CK-App Server

```bash
ssh root@167.235.224.149
```

### Schritt 3.2: Ins Frontend-Verzeichnis wechseln

```bash
cd /opt/hd-app/The-Connection-Key/frontend
pwd
# Sollte zeigen: /opt/hd-app/The-Connection-Key/frontend
```

### Schritt 3.3: Prüfe aktuellen Branch

```bash
git branch
# Sollte zeigen: * feature/reading-agent-option-a-complete
# ODER: * main

# Falls main, wechsle Branch:
git checkout feature/reading-agent-option-a-complete
```

### Schritt 3.4: Git Pull

```bash
# Prüfe Remote
git remote -v

# Pull durchführen
git pull origin feature/reading-agent-option-a-complete

# Prüfe ob Dateien aktualisiert wurden
ls -la integration/api-routes/app-router/reading/generate/route.ts
ls -la integration/api-routes/reading-validation.ts
```

**Erwartete Ausgabe:**
```
Updating <old-commit>..<new-commit>
 integration/api-routes/app-router/reading/generate/route.ts |  XX +++++++++
 integration/api-routes/reading-validation.ts                |  XX +++++++++
```

### Schritt 3.5: Prüfe Docker Container

```bash
# Ins Root-Verzeichnis wechseln
cd /opt/hd-app/The-Connection-Key

# Prüfe Container
docker ps | grep frontend

# Prüfe docker-compose Datei
ls -la docker-compose*.yml
```

**Erwartete Container:**
- `the-connection-key-frontend-1` (oder ähnlich)

### Schritt 3.6: Prüfe Environment Variables

```bash
# Prüfe .env.local
cd /opt/hd-app/The-Connection-Key/frontend
cat .env.local | grep -E "(MCP_SERVER_URL|MCP_API_KEY)"

# Sollte zeigen:
# MCP_SERVER_URL=http://138.199.237.34:7000
# MCP_API_KEY=your-secret-key-here
```

**Falls fehlt:**
```bash
# Füge hinzu
echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local
echo "MCP_API_KEY=your-secret-key-here" >> .env.local
```

### Schritt 3.7: Frontend Container neu bauen

```bash
cd /opt/hd-app/The-Connection-Key

# Prüfe welche docker-compose Datei verwendet wird
ls -la docker-compose*.yml

# Option A: Standard docker-compose.yml
docker compose build frontend

# Option B: docker-compose-redis-fixed.yml
docker compose -f docker-compose-redis-fixed.yml build frontend
```

**Erwartete Ausgabe:**
```
[+] Building XX.Xs (XX/XX) FINISHED
 => [internal] load build definition
 => => transferring context
 => [1/XX] FROM docker.io/library/node:20-alpine
 ...
 => => exporting layers
 => => writing image
```

### Schritt 3.8: Frontend Container neu starten

```bash
# Option A: Standard
docker compose restart frontend

# Option B: Mit redis-fixed
docker compose -f docker-compose-redis-fixed.yml restart frontend

# ODER: Komplett neu starten (lädt .env.local neu)
docker compose stop frontend
docker compose up -d frontend
```

### Schritt 3.9: Prüfe Container Status

```bash
# Container Status
docker ps | grep frontend

# Sollte zeigen: STATUS = Up (healthy) oder Up X minutes

# Falls nicht healthy:
docker logs the-connection-key-frontend-1 --tail 100
```

### Schritt 3.10: Prüfe Frontend Logs

```bash
# Logs live anzeigen
docker logs the-connection-key-frontend-1 -f | grep "Reading Generate API"

# ODER: Letzte 50 Zeilen
docker logs the-connection-key-frontend-1 --tail 50 | grep "Reading Generate API"
```

**Erwartete Logs (nach Test-Request):**
```
[Reading Generate API] Erstelle reading_jobs Eintrag für readingType: basic
[Reading Generate API] reading_jobs erstellt mit ID: <uuid>
[Reading Generate API] Rufe MCP Gateway auf mit readingId: <uuid>
```

---

## 4️⃣ END-TO-END TEST

### Schritt 4.1: Test Reading Generation

```bash
# Vom lokalen Rechner oder Server 167
curl -X POST https://www.the-connection-key.de/api/reading/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test User",
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "basic",
    "focus": "Karriere und Lebenszweck"
  }' | jq '.'
```

**Erwartete Response:**
```json
{
  "success": true,
  "readingId": "abc-123-def-456",
  "message": "Reading generation started",
  "status": "processing"
}
```

### Schritt 4.2: Prüfe reading_jobs in Supabase

```sql
-- Im Supabase SQL Editor
SELECT 
  id,
  reading_type,
  status,
  created_at,
  updated_at
FROM reading_jobs
ORDER BY created_at DESC
LIMIT 1;
```

**✅ Erwartet:**
- `status` = `'pending'` (wenn noch in Bearbeitung)
- `status` = `'completed'` (wenn fertig)
- `result` = JSONB mit Reading-Daten (wenn completed)

### Schritt 4.3: Prüfe readings Tabelle

```sql
-- Im Supabase SQL Editor
SELECT 
  id,
  reading_type,
  reading_text,
  status,
  created_at
FROM readings
WHERE id = '<readingId-aus-Schritt-4.1>'
LIMIT 1;
```

**✅ Erwartet:**
- Eintrag vorhanden
- `reading_text` = Vollständiger Reading-Text
- `status` = `'completed'`

### Schritt 4.4: Status-Endpoint testen

```bash
# Ersetze <readingId> mit ID aus Schritt 4.1
curl -X GET https://www.the-connection-key.de/api/readings/<readingId>/status \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.'
```

**Erwartete Response:**
```json
{
  "success": true,
  "readingId": "abc-123-def-456",
  "status": "completed",
  "result": {
    "reading": "...",
    "readingType": "basic",
    "focus": "Karriere und Lebenszweck",
    ...
  }
}
```

---

## ✅ DEPLOYMENT-CHECKLISTE

### Supabase
- [ ] Migration `009_create_reading_jobs_table.sql` ausgeführt
- [ ] Tabelle `reading_jobs` existiert (8 Spalten)
- [ ] Indizes erstellt (5 Indizes)
- [ ] RLS Policies aktiv (2 Policies)

### Server 138 (Hetzner)
- [ ] Git Pull durchgeführt
- [ ] `index.js` aktualisiert (Zeile 423-460)
- [ ] MCP Core neu gestartet
- [ ] MCP Core Logs zeigen: `[MCP Core] generateReading aufgerufen`
- [ ] n8n Workflow importiert
- [ ] n8n Workflow aktiviert (Toggle GRÜN)
- [ ] n8n Workflow zeigt: Node "Save Reading" (INSERT readings)

### Server 167 (CK-App)
- [ ] Git Pull durchgeführt
- [ ] `integration/api-routes/app-router/reading/generate/route.ts` aktualisiert
- [ ] `integration/api-routes/reading-validation.ts` aktualisiert
- [ ] `.env.local` enthält `MCP_SERVER_URL` und `MCP_API_KEY`
- [ ] Frontend Container neu gebaut
- [ ] Frontend Container neu gestartet
- [ ] Frontend Logs zeigen: `[Reading Generate API]`

### End-to-End Test
- [ ] Test-Request erfolgreich (Status 200)
- [ ] `reading_jobs` Eintrag erstellt (status='pending')
- [ ] `readings` Eintrag erstellt (nach n8n Verarbeitung)
- [ ] `reading_jobs.status` = 'completed' (nach n8n Update)
- [ ] Status-Endpoint liefert korrektes Ergebnis

---

## 🐛 TROUBLESHOOTING

### Problem: Git Pull zeigt "Already up to date"

**Lösung:**
```bash
# Prüfe ob Branch korrekt ist
git branch

# Prüfe Remote
git remote -v

# Force Pull (falls nötig)
git fetch origin
git reset --hard origin/feature/reading-agent-option-a-complete
```

### Problem: MCP Core startet nicht

**Lösung:**
```bash
# Prüfe Logs
journalctl -u mcp -n 100

# Prüfe ob Port 7000 belegt ist
lsof -i :7000

# Beende alten Prozess
kill $(lsof -t -i:7000)

# Starte neu
systemctl restart mcp
```

### Problem: Frontend Container baut nicht

**Lösung:**
```bash
# Prüfe Docker Logs
docker compose logs frontend --tail 100

# Prüfe ob .env.local existiert
ls -la /opt/hd-app/The-Connection-Key/frontend/.env.local

# Baue ohne Cache
docker compose build --no-cache frontend
```

### Problem: n8n Workflow importiert nicht

**Lösung:**
1. Prüfe JSON-Syntax: `cat n8n-workflows/reading-generation-workflow.json | jq .`
2. Importiere manuell via UI (Schritt 2.8)
3. Prüfe n8n Logs: `docker logs n8n --tail 100`

---

**Status:** ✅ **Bereit für Deployment - Schritt für Schritt**
