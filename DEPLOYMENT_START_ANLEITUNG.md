# 🚀 Deployment Start - Schritt für Schritt

**Datum:** 28.12.2025  
**Status:** ⏳ Deployment in Progress

---

## 📋 VORBEREITUNG

✅ Migration 010 ausgeführt  
✅ Tabellenstruktur korrigiert  
✅ Hängende Jobs bereinigt  

---

## 1️⃣ SERVER 138 (Hetzner) - MCP Core + n8n

### Schritt 1.1: SSH zum Server

```bash
ssh root@138.199.237.34
```

### Schritt 1.2: Ins Projekt-Verzeichnis wechseln

```bash
cd /opt/mcp-connection-key
pwd
# Sollte zeigen: /opt/mcp-connection-key
```

### Schritt 1.3: Branch prüfen und wechseln

```bash
git branch
# Falls nicht auf feature/reading-agent-option-a-complete:
git checkout feature/reading-agent-option-a-complete
```

### Schritt 1.4: Git Pull

```bash
git pull origin feature/reading-agent-option-a-complete
```

**Erwartet:** Dateien werden aktualisiert (index.js, n8n-workflows/reading-generation-workflow.json)

### Schritt 1.5: Prüfe wie MCP Server läuft

```bash
# Option A: Systemd
systemctl status mcp

# Option B: PM2
pm2 list | grep mcp

# Option C: Docker
docker ps | grep mcp

# Option D: Prozess
ps aux | grep "mcp-gateway\|server.js" | grep -v grep
```

### Schritt 1.6: MCP Core neu starten

**Falls Systemd:**
```bash
systemctl restart mcp
systemctl status mcp
journalctl -u mcp -n 50 --no-pager | grep "MCP Core"
```

**Falls PM2:**
```bash
pm2 restart mcp
# ODER
pm2 restart all
pm2 logs mcp --lines 50 --nostream | grep "MCP Core"
```

**Falls Docker:**
```bash
docker ps | grep mcp
docker restart <container-name>
docker logs <container-name> --tail 50 | grep "MCP Core"
```

### Schritt 1.7: n8n Workflow importieren

**Via n8n UI (Empfohlen):**

1. Öffne: **https://n8n.werdemeisterdeinergedankenagent.de**
2. Login (Admin-Credentials)
3. Gehe zu: **Workflows** (linke Sidebar)
4. Klicke auf: **"+"** (oben rechts) → **"Import from File"**
5. Wähle Datei: `/opt/mcp-connection-key/n8n-workflows/reading-generation-workflow.json`
6. Klicke: **"Import"**
7. Prüfe Workflow:
   - Webhook-Pfad: `/webhook/reading` ✅
   - Node "Validate Payload" vorhanden ✅
   - Node "Save Reading" (INSERT readings) vorhanden ✅
   - Node "Update Reading Job" (UPDATE reading_jobs) vorhanden ✅
8. Aktiviere Workflow: Toggle oben rechts auf **GRÜN**
9. Test: Klicke auf "Execute Workflow" → Prüfe Output

---

## 2️⃣ SERVER 167 (CK-App) - Frontend

### Schritt 2.1: SSH zum Server

```bash
ssh root@167.235.224.149
```

### Schritt 2.2: Ins Frontend-Verzeichnis wechseln

```bash
cd /opt/hd-app/The-Connection-Key/frontend
pwd
# Sollte zeigen: /opt/hd-app/The-Connection-Key/frontend
```

### Schritt 2.3: Branch prüfen und wechseln

```bash
git branch
# Falls nicht auf feature/reading-agent-option-a-complete:
git checkout feature/reading-agent-option-a-complete
```

### Schritt 2.4: Git Pull

```bash
git pull origin feature/reading-agent-option-a-complete
```

**Erwartet:** Dateien werden aktualisiert (integration/api-routes/app-router/reading/generate/route.ts, integration/api-routes/reading-validation.ts)

### Schritt 2.5: Prüfe Environment Variables

```bash
cat .env.local | grep -E "(MCP_SERVER_URL|MCP_API_KEY)"
```

**Sollte zeigen:**
```
MCP_SERVER_URL=http://138.199.237.34:7000
MCP_API_KEY=your-secret-key-here
```

**Falls fehlt:**
```bash
echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local
echo "MCP_API_KEY=your-secret-key-here" >> .env.local
```

### Schritt 2.6: Frontend Container neu bauen

```bash
cd /opt/hd-app/The-Connection-Key

# Prüfe welche docker-compose Datei verwendet wird
ls -la docker-compose*.yml

# Option A: Standard docker-compose.yml
docker compose build frontend

# Option B: docker-compose-redis-fixed.yml
docker compose -f docker-compose-redis-fixed.yml build frontend
```

### Schritt 2.7: Frontend Container neu starten

```bash
# Option A: Standard
docker compose restart frontend

# Option B: Mit redis-fixed
docker compose -f docker-compose-redis-fixed.yml restart frontend

# ODER: Komplett neu starten (lädt .env.local neu)
docker compose stop frontend
docker compose up -d frontend
```

### Schritt 2.8: Container Status prüfen

```bash
docker ps | grep frontend
# Sollte zeigen: STATUS = Up (healthy) oder Up X minutes

# Falls nicht healthy:
docker logs the-connection-key-frontend-1 --tail 100
```

---

## 3️⃣ END-TO-END TEST

### Schritt 3.1: Test Reading Generation

```bash
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

### Schritt 3.2: Prüfe reading_jobs in Supabase

```sql
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
- `reading_type` = `'basic'` (oder anderer Wert)
- `status` = `'pending'` (wenn noch in Bearbeitung)
- `status` = `'completed'` (wenn fertig)

### Schritt 3.3: Prüfe readings Tabelle

```sql
SELECT 
  id,
  reading_type,
  reading_text,
  status,
  created_at
FROM readings
WHERE id = '<readingId-aus-Schritt-3.1>'
LIMIT 1;
```

**✅ Erwartet:**
- Eintrag vorhanden
- `reading_text` = Vollständiger Reading-Text
- `status` = `'completed'`

---

## ✅ DEPLOYMENT-CHECKLISTE

### Server 138 (Hetzner)
- [ ] Git Pull durchgeführt
- [ ] MCP Core neu gestartet
- [ ] MCP Core Logs zeigen: `[MCP Core] generateReading aufgerufen`
- [ ] n8n Workflow importiert
- [ ] n8n Workflow aktiviert (Toggle GRÜN)

### Server 167 (CK-App)
- [ ] Git Pull durchgeführt
- [ ] `.env.local` enthält `MCP_SERVER_URL` und `MCP_API_KEY`
- [ ] Frontend Container neu gebaut
- [ ] Frontend Container neu gestartet
- [ ] Frontend Logs zeigen: `[Reading Generate API]`

### End-to-End Test
- [ ] Test-Request erfolgreich (Status 200)
- [ ] `reading_jobs` Eintrag erstellt (status='pending', reading_type gesetzt)
- [ ] `readings` Eintrag erstellt (nach n8n Verarbeitung)
- [ ] `reading_jobs.status` = 'completed' (nach n8n Update)

---

**Status:** ⏳ **Bereit für Deployment - Befolge Schritte oben**
