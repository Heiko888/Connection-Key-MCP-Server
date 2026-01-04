# 🚀 A4 – Deployment-Anleitung

**Datum:** 2025-01-03  
**Status:** ⚠️ **DEPLOYMENT ERFORDERLICH**

---

## 📋 Übersicht: Was muss deployed werden?

### Hetzner Server (138.199.237.34)
- ✅ `docker-compose.yml` - chatgpt-agent entfernt
- ✅ `connection-key/config.js` - READING_AGENT_URL
- ✅ `connection-key/routes/reading.js` - READING_AGENT_URL
- ✅ `start-services.sh` - READING_AGENT_URL
- ✅ `setup-hetzner.sh` - READING_AGENT_URL

### CK-App Server (167.235.224.149)
- ✅ `integration/api-routes/readings-generate.ts` - Port 4001 → 4000
- ✅ `integration/api-routes/app-router/coach/readings-v2/generate/route.ts` - Bereits korrekt

---

## 🚀 DEPLOYMENT-SCHRITTE

### SCHRITT 1: Hetzner Server (138.199.237.34)

#### 1.1 Git Pull
```bash
ssh root@138.199.237.34
cd /opt/mcp-connection-key
git pull origin feature/reading-agent-option-a-complete
```

#### 1.2 chatgpt-agent Container stoppen & entfernen
```bash
# Container stoppen
docker stop chatgpt-agent || true

# Container entfernen
docker rm chatgpt-agent || true

# Prüfen
docker ps -a | grep chatgpt-agent
# Erwartung: Keine Ausgabe
```

#### 1.3 Docker Compose neu laden
```bash
cd /opt/mcp-connection-key
docker compose up -d --remove-orphans

# Prüfen
docker compose ps
# Erwartung: KEIN chatgpt-agent mehr sichtbar
```

#### 1.4 PM2 Reading-Agent starten/restarten
```bash
cd /opt/mcp-connection-key/production

# Prüfen ob .env existiert
ls -la .env

# PM2 Reading-Agent starten/restarten
pm2 restart reading-agent --update-env || pm2 start server.js --name reading-agent

# Status prüfen
pm2 status

# Logs prüfen
pm2 logs reading-agent --lines 20
```

#### 1.5 Port verifizieren
```bash
# Prüfen, was auf Port 4000 läuft
lsof -i :4000
# ODER
netstat -tuln | grep 4000
# ODER
ss -tuln | grep 4000

# Erwartung: Node/PM2 Prozess, KEIN Docker
```

#### 1.6 Health Check
```bash
curl http://localhost:4000/health
# Erwartung: {"status":"ok","service":"reading-agent",...}
```

---

### SCHRITT 2: CK-App Server (167.235.224.149)

#### 2.1 Git Pull (falls Git-Repository vorhanden)
```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfen ob Git-Repository vorhanden
git status

# Falls Git-Repository vorhanden:
git pull origin feature/reading-agent-option-a-complete
```

#### 2.2 ODER: Dateien manuell kopieren (falls kein Git)
```bash
# Auf lokalem Rechner (PowerShell):
scp integration/api-routes/readings-generate.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/readings/generate.ts

# ODER falls Verzeichnisstruktur anders:
# Prüfe zuerst die Struktur auf dem Server
ssh root@167.235.224.149 "find /opt/hd-app/The-Connection-Key/frontend -name 'readings-generate.ts' -o -name 'generate.ts'"
```

#### 2.3 Frontend Container neu bauen
```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key

# Container stoppen
docker compose stop frontend

# Container neu bauen
docker compose build --no-cache frontend

# Container starten
docker compose up -d frontend

# Logs prüfen
docker compose logs frontend --tail 50
```

---

### SCHRITT 3: Supabase Migration (falls noch nicht ausgeführt)

#### 3.1 Migration ausführen
```sql
-- Im Supabase Dashboard: SQL Editor
-- Datei: integration/supabase/migrations/019_add_agent_metadata_to_readings.sql
```

**Wichtig:** Migration muss ausgeführt werden, damit `agent_id`, `agent_version`, `prompt_hash` Spalten existieren.

---

## ✅ VERIFIZIERUNG

### Hetzner Server
```bash
# 1. Docker Status
docker compose ps
# Erwartung: KEIN chatgpt-agent

# 2. PM2 Status
pm2 status
# Erwartung: reading-agent läuft

# 3. Port 4000
lsof -i :4000
# Erwartung: Node/PM2 Prozess

# 4. Health Check
curl http://localhost:4000/health
# Erwartung: {"status":"ok"}
```

### CK-App Server
```bash
# 1. Container Status
docker compose ps frontend
# Erwartung: frontend läuft

# 2. Logs prüfen
docker compose logs frontend --tail 50
# Erwartung: Keine Build-Fehler
```

---

## 🟢 ABNAHMEKRITERIUM

**Status:** ✅ **BESTANDEN**, wenn:

1. ✅ `docker compose ps` zeigt KEINEN `chatgpt-agent`
2. ✅ `pm2 status` zeigt `reading-agent` läuft
3. ✅ `lsof -i :4000` zeigt Node/PM2 Prozess (KEIN Docker)
4. ✅ `curl http://localhost:4000/health` gibt `{"status":"ok"}`
5. ✅ Frontend Container läuft ohne Fehler

---

## 📋 Zusammenfassung

**Hetzner Server:**
- ✅ Git Pull
- ✅ chatgpt-agent Container stoppen/entfernen
- ✅ Docker Compose neu laden
- ✅ PM2 Reading-Agent starten/restarten
- ✅ Port und Health Check verifizieren

**CK-App Server:**
- ✅ Git Pull ODER Dateien manuell kopieren
- ✅ Frontend Container neu bauen

**Supabase:**
- ✅ Migration 019 ausführen (falls noch nicht geschehen)

---

## ⚠️ WICHTIG

**Nach dem Deployment:**
1. Prüfe, dass Port 4000 nur von PM2 verwendet wird
2. Prüfe, dass kein Docker-Container Port 4000 exponiert
3. Teste Reading-Generierung über Frontend API
4. Prüfe n8n Workflow (falls verwendet)
