# 🔑 Keys & Secrets - Infrastruktur-Übersicht

**Datum:** 26.12.2025  
**Zweck:** Vollständige Übersicht aller Keys/Secrets für alle Server in der Infrastruktur

---

## 📊 Server-Übersicht

### Server 1: Hetzner Server (138.199.237.34)
- **MCP Server** (Port 7000)
- **CK-Agent** (Port 4000, Docker)
- **n8n** (Port 5678, Docker)

### Server 2: CK-App Server (167.235.224.149)
- **Frontend** (Next.js, Docker)
- **API Routes** (Next.js)

---

## 🔐 Server 1: Hetzner Server (138.199.237.34)

### 📁 Datei: `/opt/mcp-connection-key/.env`

**Erforderliche Keys:**

```bash
# ============================================
# OpenAI API Key
# ============================================
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx

# ============================================
# n8n Konfiguration
# ============================================
N8N_PASSWORD=secure-password-here
N8N_HOST=n8n.werdemeisterdeinergedankenagent.de
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n.werdemeisterdeinergedankenagent.de/
N8N_SECURE_COOKIE=true
N8N_API_KEY=0139efdef24110614ca2489077d2e786fd1d5e1cac1e22538d6adb68e6899d5c

# ============================================
# Connection-Key Server
# ============================================
CORS_ORIGINS=https://www.the-connection-key.de,https://the-connection-key.de,http://localhost:3000
AUTH_ENABLED=true
API_KEY=your-api-key-here

# ============================================
# n8n Enterprise (deaktiviert)
# ============================================
N8N_DISABLE_UI_FEATURES=enterprise
N8N_ENFORCE_SETTINGS_FILE=false
N8N_LICENSE_AUTO_ACCEPT=false
```

**Verwendet in:**
- Docker Compose (`docker-compose.yml`)
- MCP Server
- n8n Container
- CK-Agent Container

---

### 📁 Datei: `/opt/mcp-connection-key/production/.env`

**Erforderliche Keys:**

```bash
# ============================================
# OpenAI API Key
# ============================================
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx

# ============================================
# Agent Secret
# ============================================
AGENT_SECRET=generated-secret-here

# ============================================
# Port & Pfade
# ============================================
MCP_PORT=7000
KNOWLEDGE_PATH=/opt/mcp-connection-key/production/knowledge
TEMPLATE_PATH=/opt/mcp-connection-key/production/templates
LOGS_PATH=/opt/mcp-connection-key/production/logs
LOG_LEVEL=info
NODE_ENV=production
```

**Verwendet in:**
- Reading Agent (MCP Server auf Port 7000)
- Production Server (`production/server.js`)

---

## 🔐 Server 2: CK-App Server (167.235.224.149)

### 📁 Datei: `/opt/hd-app/The-Connection-Key/frontend/.env.local`

**Erforderliche Keys:**

```bash
# ============================================
# Supabase (2 Keys!)
# ============================================
# Public Key (Client-Side) - OK für Frontend
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Optional

# Service Role Key (Server-Side ONLY!) - Secret!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0NTk2ODAwMCwiZXhwIjoxOTYxNTQ0MDAwfQ.xxxxx

# ============================================
# n8n API Key
# ============================================
N8N_API_KEY=0139efdef24110614ca2489077d2e786fd1d5e1cac1e22538d6adb68e6899d5c

# ============================================
# MCP Server & Reading Agent URLs
# ============================================
MCP_SERVER_URL=http://138.199.237.34:7000
NEXT_PUBLIC_MCP_SERVER_URL=http://138.199.237.34:7000

READING_AGENT_URL=http://138.199.237.34:7000
NEXT_PUBLIC_READING_AGENT_URL=http://138.199.237.34:7000

# ============================================
# CK Agent
# ============================================
CK_AGENT_URL=http://138.199.237.34:4000
CK_AGENT_SECRET=your-ck-agent-secret-here

# ============================================
# Admin Upload (Optional)
# ============================================
ADMIN_API_KEY=your-admin-key-here
# ODER
API_KEY=your-api-key-here
```

**Verwendet in:**
- Next.js API Routes (`integration/api-routes/`)
- Frontend Components
- Docker Compose für Frontend Container

---

## 📋 Vollständige Key-Liste nach Kategorie

### 1. OpenAI API Key

| Key | Server | Datei | Verwendung |
|-----|--------|-------|------------|
| `OPENAI_API_KEY` | Hetzner | `/opt/mcp-connection-key/.env` | MCP Server, CK-Agent |
| `OPENAI_API_KEY` | Hetzner | `/opt/mcp-connection-key/production/.env` | Reading Agent (Port 7000) |

---

### 2. Supabase Keys

| Key | Server | Datei | Verwendung |
|-----|--------|-------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | CK-App | `.env.local` | Frontend, API Routes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | CK-App | `.env.local` | Frontend (optional) |
| `SUPABASE_SERVICE_ROLE_KEY` | CK-App | `.env.local` | API Routes (Server-Side) |

**Wichtig:**
- `NEXT_PUBLIC_*` = Public, kann im Browser gesehen werden
- `SUPABASE_SERVICE_ROLE_KEY` = Secret, NUR Server-Side!

---

### 3. n8n Keys

| Key | Server | Datei | Verwendung |
|-----|--------|-------|------------|
| `N8N_PASSWORD` | Hetzner | `/opt/mcp-connection-key/.env` | n8n Web-Interface Login |
| `N8N_API_KEY` | Hetzner | `/opt/mcp-connection-key/.env` | n8n API Authentifizierung |
| `N8N_API_KEY` | CK-App | `.env.local` | Authentifizierung von n8n → Next.js |
| `N8N_HOST` | Hetzner | `/opt/mcp-connection-key/.env` | n8n Domain |
| `N8N_PROTOCOL` | Hetzner | `/opt/mcp-connection-key/.env` | https |
| `WEBHOOK_URL` | Hetzner | `/opt/mcp-connection-key/.env` | n8n Webhook Base URL |

**Aktueller Wert:**
- `N8N_API_KEY=0139efdef24110614ca2489077d2e786fd1d5e1cac1e22538d6adb68e6899d5c`

---

### 4. Agent Secrets

| Key | Server | Datei | Verwendung |
|-----|--------|-------|------------|
| `AGENT_SECRET` | Hetzner | `/opt/mcp-connection-key/production/.env` | Reading Agent Authentifizierung |
| `CK_AGENT_SECRET` | CK-App | `.env.local` | CK-Agent Authentifizierung (Port 4000) |
| `API_KEY` | Hetzner | `/opt/mcp-connection-key/.env` | Connection-Key Server Auth |
| `ADMIN_API_KEY` | CK-App | `.env.local` | Admin Upload Endpoints (optional) |

---

### 5. URLs & Endpoints

| Key | Server | Datei | Wert |
|-----|--------|-------|------|
| `MCP_SERVER_URL` | CK-App | `.env.local` | `http://138.199.237.34:7000` |
| `NEXT_PUBLIC_MCP_SERVER_URL` | CK-App | `.env.local` | `http://138.199.237.34:7000` |
| `READING_AGENT_URL` | CK-App | `.env.local` | `http://138.199.237.34:7000` |
| `NEXT_PUBLIC_READING_AGENT_URL` | CK-App | `.env.local` | `http://138.199.237.34:7000` |
| `CK_AGENT_URL` | CK-App | `.env.local` | `http://138.199.237.34:4000` |

---

## 📁 Dateien mit Key-Konfigurationen

### Hetzner Server (138.199.237.34)

1. **`/opt/mcp-connection-key/.env`**
   - Haupt-Konfiguration
   - OpenAI, n8n, API Keys

2. **`/opt/mcp-connection-key/production/.env`**
   - Reading Agent Konfiguration
   - OpenAI, AGENT_SECRET

3. **`/opt/mcp-connection-key/docker-compose.yml`**
   - Docker Container Environment Variables
   - Verwendet Werte aus `.env`

---

### CK-App Server (167.235.224.149)

1. **`/opt/hd-app/The-Connection-Key/frontend/.env.local`**
   - Next.js Environment Variables
   - Supabase, n8n, URLs

2. **`/opt/hd-app/The-Connection-Key/frontend/docker-compose.yml`**
   - Frontend Container Environment Variables
   - Verwendet Werte aus `.env.local`

---

## 🔍 Wo werden Keys verwendet? (Code-Referenzen)

### Hetzner Server

**Dateien:**
- `production/server.js` - Verwendet `OPENAI_API_KEY`, `AGENT_SECRET`
- `chatgpt-agent/server.js` - Verwendet `OPENAI_API_KEY`, `x-agent-key`
- `docker-compose.yml` - Definiert Environment Variables

---

### CK-App Server

**Dateien:**
- `integration/api-routes/new-subscriber/route.ts` - `N8N_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `integration/api-routes/app-router/reading/generate/route.ts` - `READING_AGENT_URL`
- `integration/api-routes/app-router/agents/tasks/route.ts` - `MCP_SERVER_URL`
- `integration/frontend/lib/agent/ck-agent.ts` - `CK_AGENT_SECRET`

---

## ✅ Checkliste: Keys richtig eintragen

### Hetzner Server (138.199.237.34)

**Datei: `/opt/mcp-connection-key/.env`**
- [ ] `OPENAI_API_KEY` gesetzt
- [ ] `N8N_PASSWORD` gesetzt
- [ ] `N8N_API_KEY` gesetzt (`0139efdef24110614ca2489077d2e786fd1d5e1cac1e22538d6adb68e6899d5c`)
- [ ] `N8N_HOST` gesetzt (`n8n.werdemeisterdeinergedankenagent.de`)
- [ ] `N8N_PROTOCOL` gesetzt (`https`)
- [ ] `WEBHOOK_URL` gesetzt
- [ ] `API_KEY` gesetzt

**Datei: `/opt/mcp-connection-key/production/.env`**
- [ ] `OPENAI_API_KEY` gesetzt
- [ ] `AGENT_SECRET` generiert und gesetzt
- [ ] `MCP_PORT` gesetzt (`7000`)

---

### CK-App Server (167.235.224.149)

**Datei: `/opt/hd-app/The-Connection-Key/frontend/.env.local`**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` gesetzt
- [ ] `SUPABASE_SERVICE_ROLE_KEY` gesetzt (Secret!)
- [ ] `N8N_API_KEY` gesetzt (`0139efdef24110614ca2489077d2e786fd1d5e1cac1e22538d6adb68e6899d5c`)
- [ ] `MCP_SERVER_URL` gesetzt (`http://138.199.237.34:7000`)
- [ ] `NEXT_PUBLIC_MCP_SERVER_URL` gesetzt (`http://138.199.237.34:7000`)
- [ ] `READING_AGENT_URL` gesetzt (`http://138.199.237.34:7000`)
- [ ] `NEXT_PUBLIC_READING_AGENT_URL` gesetzt (`http://138.199.237.34:7000`)
- [ ] `CK_AGENT_SECRET` gesetzt (falls verwendet)

---

## 🚨 Wichtige Hinweise

### 1. NEXT_PUBLIC_ Prefix

**Regel:**
- `NEXT_PUBLIC_*` = Wird ins Frontend gebundelt (öffentlich sichtbar!)
- **KEIN** `NEXT_PUBLIC_` = Nur Server-Side (geheim)

**Beispiel:**
```bash
# ✅ RICHTIG
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co  # OK, Public
SUPABASE_SERVICE_ROLE_KEY=eyJ...                    # OK, Secret

# ❌ FALSCH
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJ...        # NIEMALS!
```

---

### 2. Port 7000 vs 4000

**Aktuell:**
- **Port 7000:** MCP Server / Reading Agent (Hetzner)
- **Port 4000:** CK-Agent (Hetzner, Docker)
- **Port 4001:** ❌ ENTFERNT (nicht mehr verwendet!)

**URLs:**
- `READING_AGENT_URL=http://138.199.237.34:7000`
- `CK_AGENT_URL=http://138.199.237.34:4000`

---

### 3. N8N_API_KEY

**Wert:** `0139efdef24110614ca2489077d2e786fd1d5e1cac1e22538d6adb68e6899d5c`

**Verwendet auf:**
- Hetzner Server: `/opt/mcp-connection-key/.env`
- CK-App Server: `/opt/hd-app/The-Connection-Key/frontend/.env.local`

**Zweck:**
- Authentifizierung zwischen n8n und Next.js API Routes

---

## 📝 Zusammenfassung

### Erforderliche Keys pro Server:

**Hetzner Server:**
1. `OPENAI_API_KEY` (2x: `.env` + `production/.env`)
2. `N8N_PASSWORD`
3. `N8N_API_KEY`
4. `AGENT_SECRET` (production/.env)
5. `API_KEY`

**CK-App Server:**
1. `NEXT_PUBLIC_SUPABASE_URL`
2. `SUPABASE_SERVICE_ROLE_KEY`
3. `N8N_API_KEY`
4. `MCP_SERVER_URL` / `READING_AGENT_URL`
5. `CK_AGENT_SECRET` (optional)

---

**Status:** ✅ Übersicht erstellt - Alle Keys dokumentiert
