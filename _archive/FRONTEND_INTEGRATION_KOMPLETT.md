# 🔍 Frontend Integration - Komplette Prüfung

**Datum:** 17.12.2025

**Status:** Prüfung ob Frontend mit Backend verbunden ist

---

## 📋 Was das Frontend braucht

### 1. Next.js läuft
- ✅ Next.js Server muss laufen
- ✅ Port 3000 muss erreichbar sein

### 2. API Routes funktionieren
- ✅ `/api/agents/${agentId}` → MCP Server (Port 7000)
- ✅ `/api/reading/generate` → Reading Agent (Port 4001)

### 3. Environment Variables im Frontend
- ✅ `MCP_SERVER_URL` (für API Routes, die MCP Server aufrufen)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` (für Supabase Client)
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` (für Supabase Client)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (für API Routes, die Supabase verwenden)
- ✅ `READING_AGENT_URL` (für Reading API Route)

---

## 🚀 Schnellprüfung auf dem Server

**Auf dem Server ausführen:**

```bash
cd /opt/mcp-connection-key
chmod +x check-frontend-integration.sh
./check-frontend-integration.sh
```

**Das Skript prüft:**
- ✅ Läuft Next.js?
- ✅ Sind Frontend Environment Variables gesetzt?
- ✅ Funktionieren API Routes?

---

## 📋 Manuelle Prüfung

### 1. Next.js läuft?

**Auf dem Server:**

```bash
# Prüfe PM2
pm2 list | grep -i next

# Prüfe Port 3000
curl -I http://localhost:3000

# ODER prüfe Prozess
ps aux | grep -i "next\|node.*3000"
```

**Falls Next.js nicht läuft:**

```bash
cd /opt/mcp-connection-key/integration/frontend
npm run dev
# ODER mit PM2
pm2 start npm --name "nextjs-frontend" -- run dev
```

---

### 2. Frontend Environment Variables prüfen

**Auf dem Server:**

```bash
cd /opt/mcp-connection-key/integration/frontend

# Prüfe .env.local
if [ -f ".env.local" ]; then
  echo "=== FRONTEND .env.local ==="
  cat .env.local | grep -E "(MCP_SERVER_URL|SUPABASE|READING_AGENT)" || echo "⚠️  Fehlende Variablen"
else
  echo "⚠️  .env.local nicht gefunden"
fi
```

---

### 3. Environment Variables setzen (falls fehlend)

**Frontend .env.local erstellen:**

```bash
cd /opt/mcp-connection-key/integration/frontend
cat > .env.local << EOF
# MCP Server (für API Routes)
MCP_SERVER_URL=http://138.199.237.34:7000

# Reading Agent (für Reading API Route)
READING_AGENT_URL=http://138.199.237.34:4001

# Supabase (für Supabase Client und API Routes)
NEXT_PUBLIC_SUPABASE_URL=https://njjcywgskzepikyzhihy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EOF
```

**Wichtig:**
- `MCP_SERVER_URL` = Öffentliche IP/URL (nicht `mcp-server:7777`)
- `READING_AGENT_URL` = Öffentliche IP/URL (nicht `localhost:4001`)
- `SUPABASE_SERVICE_ROLE_KEY` = Aus Server `.env` kopieren
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key (nicht service_role!)

---

### 4. API Routes testen

**Falls Next.js läuft:**

```bash
# Test Agent API
curl -X POST http://localhost:3000/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message":"Test","userId":"test-frontend"}'

# Test Reading API
curl -X POST http://localhost:3000/api/reading/generate \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-01-01","birthTime":"12:00","birthPlace":"Berlin","readingType":"basic","userId":"test-frontend"}'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ JSON Response

---

## ✅ Checkliste: Frontend Integration

- [ ] Next.js läuft? (Port 3000)
- [ ] Frontend `.env.local` existiert?
- [ ] `MCP_SERVER_URL` in Frontend `.env.local`?
- [ ] `READING_AGENT_URL` in Frontend `.env.local`?
- [ ] `NEXT_PUBLIC_SUPABASE_URL` in Frontend `.env.local`?
- [ ] `SUPABASE_SERVICE_ROLE_KEY` in Frontend `.env.local`?
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Frontend `.env.local`? (optional)
- [ ] Agent API funktioniert? (`/api/agents/marketing`)
- [ ] Reading API funktioniert? (`/api/reading/generate`)

---

## 🎯 Zusammenfassung

**Was bereits funktioniert:**
- ✅ Backend Services laufen (MCP Server, Reading Agent)
- ✅ n8n Workflows aktiviert
- ✅ Supabase Migration ausgeführt
- ✅ Environment Variables auf Server gesetzt

**Was noch zu prüfen/konfigurieren ist:**
- ⚠️ Next.js läuft?
- ⚠️ Frontend `.env.local` konfiguriert?
- ⚠️ API Routes funktionieren?

---

**🔍 Führe die Prüfung aus!** 🚀
