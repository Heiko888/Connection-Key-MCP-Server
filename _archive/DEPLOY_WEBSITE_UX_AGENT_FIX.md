# 🔧 Website-UX-Agent Route Deployment - Fix

**Problem:** 404-Fehler beim Aufruf von `/api/agents/website-ux-agent`

**Ursache:** Route-Datei fehlt im Frontend-Container

---

## ✅ Lösung

### Option 1: PowerShell-Script (Windows)

```powershell
.\deploy-website-ux-agent-route.ps1
```

### Option 2: Bash-Script (Linux/Mac)

```bash
bash deploy-website-ux-agent-route.sh
```

### Option 3: Manuell

```bash
# 1. SSH zum Server
ssh root@167.235.224.149

# 2. Verzeichnis erstellen
mkdir -p /opt/hd-app/The-Connection-Key/frontend/app/api/agents/website-ux-agent

# 3. Datei kopieren (von lokal, Windows PowerShell)
scp integration/api-routes/app-router/agents/website-ux-agent/route.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/agents/website-ux-agent/route.ts

# 4. Container neu bauen
cd /opt/hd-app/The-Connection-Key
docker compose build --no-cache frontend

# 5. Container neu starten
docker compose up -d frontend

# 6. Warte 15 Sekunden
sleep 15

# 7. Teste
curl -X POST http://localhost:3000/api/agents/website-ux-agent \
  -H "Content-Type: application/json" \
  -d '{"message": "Test", "userId": "test"}'
```

---

## 🔍 Prüfung

### 1. Prüfe ob Datei auf Server existiert

```bash
ssh root@167.235.224.149
ls -la /opt/hd-app/The-Connection-Key/frontend/app/api/agents/website-ux-agent/route.ts
```

### 2. Prüfe Container-Logs

```bash
docker compose logs frontend | tail -50
```

### 3. Prüfe ob Route im Container ist

```bash
docker exec the-connection-key-frontend-1 ls -la /app/app/api/agents/website-ux-agent/
```

---

## ⚠️ Wichtig

**Die Route-Datei muss im Container unter:**
```
/app/app/api/agents/website-ux-agent/route.ts
```

**Nicht unter:**
```
/app/pages/api/agents/website-ux-agent.ts  ❌ (Pages Router)
```

**Next.js App Router Struktur:**
- ✅ `app/api/agents/website-ux-agent/route.ts`
- ❌ `pages/api/agents/website-ux-agent.ts`

---

## 🎯 Nach erfolgreichem Deployment

Die Route sollte dann funktionieren:

```bash
curl -X POST http://localhost:3000/api/agents/website-ux-agent \
  -H "Content-Type: application/json" \
  -d '{"message": "Analysiere https://www.example.com", "userId": "test"}'
```

**Erwartete Response:**
```json
{
  "success": true,
  "response": "...",
  "agentId": "website-ux-agent",
  "tokens": 1500,
  "model": "gpt-4",
  "taskId": "uuid-der-task",
  "duration_ms": 3500
}
```

---

## 📋 Checkliste

- [ ] Route-Datei existiert lokal: `integration/api-routes/app-router/agents/website-ux-agent/route.ts`
- [ ] Route-Datei auf Server kopiert: `/opt/hd-app/The-Connection-Key/frontend/app/api/agents/website-ux-agent/route.ts`
- [ ] Container neu gebaut: `docker compose build --no-cache frontend`
- [ ] Container neu gestartet: `docker compose up -d frontend`
- [ ] Route funktioniert: `curl -X POST http://localhost:3000/api/agents/website-ux-agent ...`

---

**🚀 Führe das Deployment-Script aus, um die Route zu aktivieren!**
