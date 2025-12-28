# ✅ Deployment Checkliste - Reading Jobs Fix

**Datum:** 26.12.2025  
**Status:** Bereit für Deployment

---

## 🎯 WAS WURDE IMPLEMENTIERT

### ✅ Frontend API Route
- Erstellt `reading_jobs` Eintrag mit `status='pending'`
- Sendet `readingId` im Payload an MCP Gateway
- Logging hinzugefügt

### ✅ MCP Core
- `readingId` als Pflichtfeld im `inputSchema`
- `readingId` wird an n8n weitergegeben
- Logging hinzugefügt

### ✅ n8n Workflow
- Webhook-Pfad: `webhook/reading` (korrigiert)
- UPDATE `reading_jobs` statt INSERT
- Error-Handling für fehlende `readingId`
- Logging in jedem Schritt

---

## 📋 VOR DEPLOYMENT PRÜFEN

### 1. Supabase Schema
```sql
-- Prüfe ob reading_jobs Tabelle existiert:
SELECT * FROM information_schema.tables 
WHERE table_name = 'reading_jobs';

-- Falls nicht vorhanden, erstellen:
CREATE TABLE IF NOT EXISTS reading_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reading_type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  result JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Index für Performance:
CREATE INDEX IF NOT EXISTS idx_reading_jobs_status ON reading_jobs(status);
CREATE INDEX IF NOT EXISTS idx_reading_jobs_user_id ON reading_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_jobs_created_at ON reading_jobs(created_at DESC);
```

### 2. Environment Variables
**Frontend (CK-App Server):**
- `MCP_SERVER_URL` = `http://138.199.237.34:7000`
- `MCP_API_KEY` = (muss gesetzt sein)

**MCP Gateway (Hetzner Server):**
- `MCP_API_KEY` = (muss gesetzt sein)
- `N8N_BASE_URL` = `http://n8n:5678`

**n8n:**
- `CK_AGENT_URL` = `http://ck-agent:4000` (optional, Fallback)

---

## 🚀 DEPLOYMENT SCHRITTE

### Schritt 1: Frontend (CK-App Server)

```bash
# SSH auf CK-App Server
ssh root@167.235.224.149

# Navigiere zum Frontend-Verzeichnis
cd /opt/hd-app/The-Connection-Key/frontend

# Kopiere geänderte Datei
cp integration/api-routes/app-router/reading/generate/route.ts \
   app/api/reading/generate/route.ts

# ODER: Git Pull (wenn Code bereits gepusht)
git pull origin feature/reading-agent-option-a-complete

# Container neu bauen
docker compose -f docker-compose-redis-fixed.yml build frontend

# Container neu starten
docker compose -f docker-compose-redis-fixed.yml up -d frontend

# Logs prüfen
docker logs the-connection-key-frontend-1 --tail 50 -f | grep "Reading Generate API"
```

**Erwartete Logs:**
```
[Reading Generate API] Erstelle reading_jobs Eintrag für readingType: detailed
[Reading Generate API] reading_jobs erstellt mit ID: <uuid>
[Reading Generate API] Rufe MCP Gateway auf mit readingId: <uuid>
```

---

### Schritt 2: MCP Core (Hetzner Server)

```bash
# SSH auf Hetzner Server
ssh root@138.199.237.34

# Navigiere zum MCP-Verzeichnis
cd /opt/mcp-connection-key

# Kopiere geänderte Dateien
cp index.js production/
cp config.js production/

# ODER: Git Pull (wenn Code bereits gepusht)
git pull origin feature/reading-agent-option-a-complete

# MCP Gateway Container neu bauen
docker compose build mcp-gateway

# MCP Gateway Container neu starten
docker compose up -d mcp-gateway

# Logs prüfen
docker logs mcp-gateway --tail 50 -f | grep "MCP Core"
```

**Erwartete Logs:**
```
[MCP Core] generateReading aufgerufen für readingId: <uuid>, readingType: basic
[MCP Core] Rufe n8n Webhook auf für readingId: <uuid>
[MCP Core] n8n Webhook URL: http://n8n:5678/webhook/reading
[MCP Core] n8n Webhook erfolgreich für readingId: <uuid>
```

---

### Schritt 3: n8n Workflow (Hetzner Server)

```bash
# SSH auf Hetzner Server
ssh root@138.199.237.34

# Navigiere zum Projekt-Verzeichnis
cd /opt/mcp-connection-key

# Kopiere Workflow-Datei
cp n8n-workflows/reading-generation-workflow.json /tmp/

# ODER: Git Pull (wenn Code bereits gepusht)
git pull origin feature/reading-agent-option-a-complete
```

**n8n UI Import:**
1. Öffne: `https://n8n.werdemeisterdeinergedankenagent.de`
2. Gehe zu: **Workflows** → **Import from File**
3. Wähle: `n8n-workflows/reading-generation-workflow.json`
4. **WICHTIG:** Prüfe Webhook-Pfad: `/webhook/reading`
5. **WICHTIG:** Prüfe Supabase Node "Update Reading Job":
   - Operation: `update`
   - Table: `reading_jobs`
   - Update Key: `id`
   - Update Key Value: `={{ $json.readingId }}`
6. **Workflow aktivieren** (Toggle oben rechts)
7. **Test:** Klicke auf "Execute Workflow" → Prüfe Output

**ODER via n8n API:**
```bash
# n8n API Key holen (aus n8n UI Settings)
N8N_API_KEY="your-api-key"

# Workflow importieren
curl -X POST http://localhost:5678/api/v1/workflows \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  -d @n8n-workflows/reading-generation-workflow.json
```

**Erwartete n8n Logs:**
```
[n8n Workflow] Reading Generation gestartet für readingId: <uuid>
[n8n Workflow] Reading generiert für readingId: <uuid>
[n8n Workflow] Update reading_jobs für readingId: <uuid>
[n8n Workflow] reading_jobs updated für readingId: <uuid>
```

---

## 🧪 TESTEN NACH DEPLOYMENT

### Test 1: Frontend API Route
```bash
curl -X POST http://167.235.224.149:3000/api/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "basic"
  }' | jq '.'
```

**Erwartete Response:**
```json
{
  "success": true,
  "readingId": "<uuid>",
  "message": "Reading generation started",
  "status": "processing"
}
```

### Test 2: Supabase prüfen
```sql
-- Prüfe ob reading_jobs Eintrag erstellt wurde
SELECT id, status, created_at 
FROM reading_jobs 
ORDER BY created_at DESC 
LIMIT 1;

-- Erwartet: status = 'pending'
```

### Test 3: Polling Status
```bash
# Warte 30-60 Sekunden, dann:
READING_ID="<uuid-vom-test-1>"

curl http://167.235.224.149:3000/api/readings/${READING_ID}/status | jq '.'
```

**Erwartete Response:**
```json
{
  "id": "<uuid>",
  "status": "completed",
  "created_at": "...",
  "updated_at": "..."
}
```

### Test 4: Supabase prüfen (nach n8n Update)
```sql
-- Prüfe ob reading_jobs updated wurde
SELECT id, status, result, updated_at 
FROM reading_jobs 
WHERE id = '<uuid-vom-test-1>';

-- Erwartet: 
-- status = 'completed'
-- result IS NOT NULL (JSONB mit reading, chartData, etc.)
-- updated_at > created_at
```

---

## ⚠️ TROUBLESHOOTING

### Problem: reading_jobs Tabelle existiert nicht
**Lösung:** Siehe "Vor Deployment Prüfen" → Supabase Schema

### Problem: Frontend erstellt reading_jobs, aber Status bleibt "pending"
**Prüfen:**
1. n8n Workflow ist aktiv?
2. Webhook-Pfad ist `/webhook/reading`?
3. MCP Core ruft n8n auf? (Logs prüfen)
4. n8n bekommt `readingId`? (n8n Execution Output prüfen)

### Problem: n8n Workflow fehlgeschlagen
**Prüfen:**
1. n8n Execution Logs (n8n UI → Executions)
2. Supabase Node Credentials korrekt?
3. `readingId` kommt im Webhook-Body an?
4. UPDATE Operation funktioniert? (Supabase Node Output prüfen)

### Problem: MCP Gateway Fehler
**Prüfen:**
1. `MCP_API_KEY` ist gesetzt?
2. MCP Core (`index.js`) läuft?
3. n8n ist erreichbar? (`http://n8n:5678/webhook/reading`)

---

## ✅ ERFOLGSKRITERIEN

- [ ] Frontend erstellt `reading_jobs` mit `status='pending'`
- [ ] MCP Gateway bekommt `readingId` im Payload
- [ ] MCP Core validiert `readingId` (Pflichtfeld)
- [ ] n8n Workflow bekommt `readingId` im Webhook-Body
- [ ] n8n updated `reading_jobs` mit `status='completed'` und `result` JSONB
- [ ] Frontend Polling sieht `status='completed'`
- [ ] Logs zeigen `readingId` in jedem Schritt
- [ ] Kein zweiter Datensatz wird erzeugt (UPDATE statt INSERT)

---

**Status:** ✅ **Bereit für Deployment**
