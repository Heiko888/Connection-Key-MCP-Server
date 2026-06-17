# 🚀 Deployment Schritt für Schritt - Reading Jobs Fix

**Datum:** 26.12.2025  
**Status:** Bereit für Deployment mit Unterstützung

---

## 📋 SCHRITT 1: Supabase Migration ausführen

**Zuerst muss die `reading_jobs` Tabelle erstellt werden.**

### Option A: Via Supabase Dashboard (Empfohlen)

1. Öffne: Supabase Dashboard → SQL Editor
2. Kopiere den Inhalt von: `integration/supabase/migrations/009_create_reading_jobs_table.sql`
3. Führe die Migration aus
4. Prüfe: Tabelle `reading_jobs` wurde erstellt

### Option B: Via Supabase CLI

```bash
# Falls Supabase CLI installiert ist
cd integration/supabase
supabase db push
```

### Prüfung:

```sql
-- Prüfe ob Tabelle existiert
SELECT * FROM information_schema.tables 
WHERE table_name = 'reading_jobs';

-- Prüfe Schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reading_jobs';
```

**✅ Erwartet:** Tabelle `reading_jobs` mit Spalten: `id`, `user_id`, `reading_type`, `status`, `result`, `error`, `created_at`, `updated_at`

---

## 📋 SCHRITT 2: Frontend deployen (CK-App Server)

### 2.1 Code auf Server bringen

```bash
# SSH auf CK-App Server
ssh root@167.235.224.149

# Navigiere zum Frontend-Verzeichnis
cd /opt/hd-app/The-Connection-Key/frontend

# Git Pull (wenn Code bereits gepusht)
git pull origin feature/reading-agent-option-a-complete

# ODER: Dateien manuell kopieren
# (Falls Git nicht verfügbar)
```

### 2.2 Container neu bauen

```bash
# Container neu bauen
docker compose -f docker-compose-redis-fixed.yml build frontend

# Container neu starten
docker compose -f docker-compose-redis-fixed.yml up -d frontend

# Status prüfen
docker ps | grep frontend
```

### 2.3 Logs prüfen

```bash
# Logs live ansehen
docker logs the-connection-key-frontend-1 --tail 50 -f | grep "Reading Generate API"
```

**✅ Erwartete Logs:**
```
[Reading Generate API] Erstelle reading_jobs Eintrag für readingType: detailed
[Reading Generate API] reading_jobs erstellt mit ID: <uuid>
[Reading Generate API] Rufe MCP Gateway auf mit readingId: <uuid>
```

---

## 📋 SCHRITT 3: MCP Core deployen (Hetzner Server)

### 3.1 Code auf Server bringen

```bash
# SSH auf Hetzner Server
ssh root@138.199.237.34

# Navigiere zum MCP-Verzeichnis
cd /opt/mcp-connection-key

# Git Pull (wenn Code bereits gepusht)
git pull origin feature/reading-agent-option-a-complete

# ODER: Dateien manuell kopieren
cp index.js production/
cp config.js production/
```

### 3.2 Container neu bauen

```bash
# MCP Gateway Container neu bauen
docker compose build mcp-gateway

# Container neu starten
docker compose up -d mcp-gateway

# Status prüfen
docker ps | grep mcp-gateway
```

### 3.3 Logs prüfen

```bash
# Logs live ansehen
docker logs mcp-gateway --tail 50 -f | grep "MCP Core"
```

**✅ Erwartete Logs:**
```
[MCP Core] generateReading aufgerufen für readingId: <uuid>, readingType: basic
[MCP Core] Rufe n8n Webhook auf für readingId: <uuid>
[MCP Core] n8n Webhook URL: http://n8n:5678/webhook/reading
[MCP Core] n8n Webhook erfolgreich für readingId: <uuid>
```

---

## 📋 SCHRITT 4: n8n Workflow importieren

### 4.1 Workflow-Datei auf Server bringen

```bash
# SSH auf Hetzner Server (falls noch nicht verbunden)
ssh root@138.199.237.34

# Navigiere zum Projekt-Verzeichnis
cd /opt/mcp-connection-key

# Git Pull (wenn Code bereits gepusht)
git pull origin feature/reading-agent-option-a-complete

# Workflow-Datei prüfen
cat n8n-workflows/reading-generation-workflow.json | jq '.nodes[] | select(.name == "Reading Webhook") | .settings'
```

**✅ Erwartet:** `"path": "webhook/reading"`

### 4.2 Workflow in n8n importieren

1. **Öffne n8n UI:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Gehe zu:** Workflows → **Import from File**
3. **Wähle:** `n8n-workflows/reading-generation-workflow.json`
4. **WICHTIG - Prüfe folgende Nodes:**

   **a) Reading Webhook:**
   - Path: `/webhook/reading` ✅
   - HTTP Method: `POST` ✅

   **b) Check Reading ID (IF Node):**
   - Condition: `readingId` is not empty ✅

   **c) Update Reading Job (Supabase Node):**
   - Operation: `update` ✅
   - Table: `reading_jobs` ✅
   - Update Key: `id` ✅
   - Update Key Value: `={{ $json.readingId }}` ✅
   - Columns:
     - `status`: `completed` ✅
     - `result`: `={{ $json.resultJson }}` ✅
     - `updated_at`: `={{ $now.toISO() }}` ✅

5. **Workflow aktivieren** (Toggle oben rechts)
6. **Test:** Klicke auf "Execute Workflow" → Prüfe Output

### 4.3 n8n Logs prüfen

In n8n UI:
- Gehe zu: **Executions**
- Öffne letzte Execution
- Prüfe Output jedes Nodes

**✅ Erwartete Logs (in Code Nodes):**
```
[n8n Workflow] Reading Generation gestartet für readingId: <uuid>
[n8n Workflow] Reading generiert für readingId: <uuid>
[n8n Workflow] Update reading_jobs für readingId: <uuid>
[n8n Workflow] reading_jobs updated für readingId: <uuid>
```

---

## 🧪 SCHRITT 5: End-to-End Test

### Test 1: Frontend API Route

```bash
# Test-Request
curl -X POST http://167.235.224.149:3000/api/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "basic"
  }' | jq '.'
```

**✅ Erwartete Response:**
```json
{
  "success": true,
  "readingId": "<uuid>",
  "message": "Reading generation started",
  "status": "processing"
}
```

**📝 Notiere die `readingId` für Test 2!**

### Test 2: Supabase prüfen (sofort nach Test 1)

```sql
-- Prüfe ob reading_jobs Eintrag erstellt wurde
SELECT id, status, created_at 
FROM reading_jobs 
ORDER BY created_at DESC 
LIMIT 1;
```

**✅ Erwartet:** 
- `status = 'pending'`
- `id` = UUID vom Test 1

### Test 3: Polling Status (nach 30-60 Sekunden)

```bash
# Ersetze <uuid> mit readingId aus Test 1
READING_ID="<uuid-vom-test-1>"

curl http://167.235.224.149:3000/api/readings/${READING_ID}/status | jq '.'
```

**✅ Erwartete Response:**
```json
{
  "success": true,
  "status": {
    "readingId": "<uuid>",
    "status": "completed",
    "result": {
      "reading": "...",
      "readingType": "basic",
      "chartData": {...},
      "tokens": 1234,
      "model": "gpt-4",
      "timestamp": "..."
    },
    "error": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Test 4: Supabase prüfen (nach n8n Update)

```sql
-- Prüfe ob reading_jobs updated wurde
SELECT id, status, result, updated_at 
FROM reading_jobs 
WHERE id = '<uuid-vom-test-1>';
```

**✅ Erwartet:**
- `status = 'completed'`
- `result IS NOT NULL` (JSONB mit reading, chartData, etc.)
- `updated_at > created_at`

---

## ⚠️ TROUBLESHOOTING

### Problem: reading_jobs Tabelle existiert nicht
**Lösung:** Siehe Schritt 1 - Migration ausführen

### Problem: Frontend erstellt reading_jobs, aber Status bleibt "pending"
**Prüfen:**
1. n8n Workflow ist aktiv? (Toggle oben rechts)
2. Webhook-Pfad ist `/webhook/reading`? (n8n UI → Reading Webhook Node)
3. MCP Core ruft n8n auf? (Docker Logs: `docker logs mcp-gateway | grep "n8n Webhook"`)
4. n8n bekommt `readingId`? (n8n UI → Executions → Log Start Node Output)

### Problem: n8n Workflow fehlgeschlagen
**Prüfen:**
1. n8n Execution Logs (n8n UI → Executions → Fehlgeschlagene Execution)
2. Supabase Node Credentials korrekt? (n8n UI → Update Reading Job Node → Credentials)
3. `readingId` kommt im Webhook-Body an? (n8n UI → Reading Webhook Node Output)
4. UPDATE Operation funktioniert? (n8n UI → Update Reading Job Node Output)

### Problem: MCP Gateway Fehler
**Prüfen:**
1. `MCP_API_KEY` ist gesetzt? (`docker exec mcp-gateway env | grep MCP_API_KEY`)
2. MCP Core (`index.js`) läuft? (`docker logs mcp-gateway | grep "MCP Core"`)
3. n8n ist erreichbar? (`docker exec mcp-gateway wget -O- http://n8n:5678/webhook/reading`)

---

## ✅ ERFOLGSKRITERIEN CHECKLISTE

- [ ] Supabase: `reading_jobs` Tabelle existiert
- [ ] Frontend: Container läuft, Logs zeigen `[Reading Generate API]`
- [ ] MCP Gateway: Container läuft, Logs zeigen `[MCP Core]`
- [ ] n8n: Workflow ist aktiv, Webhook-Pfad ist `/webhook/reading`
- [ ] Test 1: Frontend erstellt `reading_jobs` mit `status='pending'`
- [ ] Test 2: Supabase zeigt Eintrag mit `status='pending'`
- [ ] Test 3: Polling zeigt `status='completed'` nach 30-60 Sekunden
- [ ] Test 4: Supabase zeigt `status='completed'` und `result IS NOT NULL`
- [ ] Logs zeigen `readingId` in jedem Schritt (Frontend, MCP Core, n8n)
- [ ] Kein zweiter Datensatz wird erzeugt (UPDATE statt INSERT)

---

**Status:** ✅ **Bereit für Deployment - Schritt für Schritt**
