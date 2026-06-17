# 🔧 Frontend .env.local erstellen

**Datum:** 17.12.2025

**Status:** Automatisches Erstellen der Frontend Environment Variables

---

## 🚀 Schnellstart

**Auf dem Server ausführen:**

```bash
cd /opt/mcp-connection-key
chmod +x create-frontend-env.sh
./create-frontend-env.sh
```

**Das Skript:**
- ✅ Liest Environment Variables aus Server `.env`
- ✅ Erstellt `integration/frontend/.env.local`
- ✅ Kopiert alle notwendigen Variablen
- ✅ Prüft ob alle Variablen gesetzt sind

---

## 📋 Was wird erstellt?

**Frontend `.env.local` enthält:**

```bash
# MCP Server (für Agent API Routes)
MCP_SERVER_URL=http://138.199.237.34:7000

# Reading Agent (für Reading API Route)
READING_AGENT_URL=http://138.199.237.34:4001

# Supabase (für API Routes)
NEXT_PUBLIC_SUPABASE_URL=https://njjcywgskzepikyzhihy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# N8N API Key (für /api/new-subscriber)
N8N_API_KEY=b6b3c7f6e333769dba39...
```

---

## ⚠️ Wichtig: Next.js neu starten!

**Nach dem Erstellen der `.env.local`:**

```bash
# Falls Next.js mit PM2 läuft
pm2 restart nextjs-frontend

# ODER falls Next.js direkt läuft
# Prozess beenden und neu starten:
cd /opt/mcp-connection-key/integration/frontend
npm run dev
```

**Warum?** Next.js lädt Environment Variables nur beim Start!

---

## 🧪 Testen

**Nach dem Neustart:**

```bash
cd /opt/mcp-connection-key
./check-frontend-integration.sh
```

**Erwartung:**
- ✅ Frontend .env.local gefunden
- ✅ Alle Environment Variables gesetzt
- ✅ Agent API funktioniert (HTTP 200)
- ✅ Reading API funktioniert (HTTP 200)

---

## 🔍 Manuelle Prüfung

**Falls das Skript nicht funktioniert:**

```bash
cd /opt/mcp-connection-key/integration/frontend

# Erstelle .env.local manuell
cat > .env.local << EOF
# MCP Server
MCP_SERVER_URL=http://138.199.237.34:7000

# Reading Agent
READING_AGENT_URL=http://138.199.237.34:4001

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://njjcywgskzepikyzhihy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" ../../.env | cut -d= -f2)

# N8N API Key
N8N_API_KEY=$(grep "^N8N_API_KEY=" ../../.env | cut -d= -f2 | head -1)
EOF
```

---

## ✅ Checkliste

- [ ] `create-frontend-env.sh` ausgeführt?
- [ ] Frontend `.env.local` erstellt?
- [ ] Alle Variablen gesetzt? (MCP_SERVER_URL, READING_AGENT_URL, SUPABASE_*)
- [ ] Next.js neu gestartet?
- [ ] API Routes funktionieren? (HTTP 200 statt 401)

---

**🔧 Führe das Skript aus und starte Next.js neu!** 🚀
