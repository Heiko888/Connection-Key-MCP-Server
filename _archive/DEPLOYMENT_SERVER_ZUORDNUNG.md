# 🚀 Deployment - Server-Zuordnung

**Datum:** 28.12.2025

---

## 📍 SERVER-ÜBERSICHT

### Server 138.199.237.34 (Hetzner)
- **MCP Core** (`index.js`) → **HIER DEPLOYEN**
- **n8n Workflow** (`n8n-workflows/reading-generation-workflow.json`) → **HIER DEPLOYEN**
- **Verzeichnis:** `/opt/mcp-connection-key`
- **Services:** MCP Server (Port 7000), n8n (Port 5678)

### Server 167.235.224.149 (CK-App Server)
- **Frontend API Route** (`integration/api-routes/app-router/reading/generate/route.ts`) → **HIER DEPLOYEN**
- **Verzeichnis:** `/opt/hd-app/The-Connection-Key/frontend`
- **Service:** Next.js Frontend

### Supabase (Cloud)
- **Migration** (`009_create_reading_jobs_table.sql`) → **HIER AUSFÜHREN**
- **Dashboard:** https://supabase.com/dashboard

---

## 🚀 DEPLOYMENT-REIHENFOLGE

### 1️⃣ Supabase Migration (Zuerst!)

**Im Supabase Dashboard:**
1. SQL Editor öffnen
2. `009_create_reading_jobs_table.sql` ausführen
3. Tabelle prüfen: `SELECT * FROM reading_jobs LIMIT 1;`

---

### 2️⃣ Server 138 (Hetzner) - MCP Core + n8n

```bash
# SSH zum Hetzner Server
ssh root@138.199.237.34

# Ins Projekt-Verzeichnis
cd /opt/mcp-connection-key

# Git Pull
git pull origin feature/reading-agent-option-a-complete

# MCP Core neu starten (falls als Service)
systemctl restart mcp
# ODER
pm2 restart mcp
# ODER (falls Docker)
docker compose restart mcp

# n8n Workflow importieren:
# 1. n8n öffnen: https://n8n.werdemeisterdeinergedankenagent.de
# 2. Workflows → Import from File
# 3. Datei: n8n-workflows/reading-generation-workflow.json
# 4. Workflow aktivieren

# Logs prüfen
tail -f /var/log/mcp.log | grep "MCP Core"
```

**Geänderte Dateien auf Server 138:**
- ✅ `index.js` (MCP Core - generateReading Tool)
- ✅ `n8n-workflows/reading-generation-workflow.json` (muss in n8n importiert werden)

---

### 3️⃣ Server 167 (CK-App) - Frontend

```bash
# SSH zum CK-App Server
ssh root@167.235.224.149

# Ins Frontend-Verzeichnis
cd /opt/hd-app/The-Connection-Key/frontend

# Git Pull
git pull origin feature/reading-agent-option-a-complete

# Frontend Container neu bauen
docker compose build frontend

# Frontend Container neu starten
docker compose restart frontend

# ODER (falls PM2)
pm2 restart frontend

# Logs prüfen
docker logs the-connection-key-frontend-1 --tail 50 -f | grep "Reading Generate API"
```

**Geänderte Dateien auf Server 167:**
- ✅ `integration/api-routes/app-router/reading/generate/route.ts`
- ✅ `integration/api-routes/reading-validation.ts`

---

## ✅ DEPLOYMENT-CHECKLISTE

### Supabase
- [ ] Migration `009_create_reading_jobs_table.sql` ausgeführt
- [ ] Tabelle `reading_jobs` existiert
- [ ] Indizes erstellt
- [ ] RLS Policies aktiv

### Server 138 (Hetzner)
- [ ] Git Pull durchgeführt
- [ ] MCP Core neu gestartet
- [ ] n8n Workflow importiert
- [ ] n8n Workflow aktiviert
- [ ] Logs geprüft

### Server 167 (CK-App)
- [ ] Git Pull durchgeführt
- [ ] Frontend Container neu gebaut
- [ ] Frontend Container neu gestartet
- [ ] Logs geprüft

---

## 🧪 TEST NACH DEPLOYMENT

```bash
# Test 1: Frontend API Route
curl -X POST https://www.the-connection-key.de/api/reading/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test User",
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "basic",
    "focus": "Karriere"
  }'

# Erwartet: { "success": true, "readingId": "...", "status": "processing" }

# Test 2: Status prüfen
curl -X GET https://www.the-connection-key.de/api/readings/{readingId}/status

# Erwartet: { "status": "completed" oder "pending" }
```

---

**Status:** ✅ **Bereit für Deployment auf beide Server**
