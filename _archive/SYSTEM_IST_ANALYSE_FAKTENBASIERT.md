# 🔍 System-IST-Analyse - Faktenbasiert

**Datum:** 26.12.2025  
**Analysiert von:** Senior DevOps / Backend Architect  
**Methode:** Code-Review, Konfigurationsprüfung, Dokumentationsanalyse

---

## 📊 EXECUTIVE SUMMARY

**Kritische Erkenntnisse:**
1. **Port 4001:** Code zeigt darauf, existiert aber nicht mehr (PM2 Service gestoppt)
2. **Port 7000:** Läuft als systemd Service (`mcp.service`), aber Code zeigt nicht darauf
3. **Port 4000:** Läuft als Docker Container (`chatgpt-agent`), aber Code verwendet nicht den richtigen Endpoint
4. **Docker vs. PM2:** Gemischtes Setup - Docker für n8n/CK-Agent, systemd für MCP, PM2 war für Reading Agent (gestoppt)
5. **ENV-Handling:** Inkonsistent - Docker verwendet `.env`, Frontend verwendet `.env.local`, PM2 lädt manuell

---

## 1️⃣ LAUFZEIT & PROZESSMANAGEMENT

### ✅ Services über Docker (Hetzner Server)

**Datei:** `docker-compose.yml`

| Service | Container Name | Port | Status (laut Code) | ENV-Quelle |
|---------|---------------|------|-------------------|------------|
| **n8n** | `n8n` | 5678 | ✅ Definiert | `.env` (N8N_PASSWORD, N8N_HOST, etc.) |
| **chatgpt-agent** | `chatgpt-agent` | 4000 | ✅ Definiert | `.env` (OPENAI_API_KEY) |
| **connection-key** | `connection-key` | 3000 | ✅ Definiert | `.env` (API_KEY, CORS_ORIGINS) |

**ENV-Variablen aus `.env`:**
- `OPENAI_API_KEY` (für chatgpt-agent)
- `N8N_PASSWORD`, `N8N_HOST`, `N8N_PROTOCOL`, `WEBHOOK_URL` (für n8n)
- `API_KEY`, `AUTH_ENABLED`, `CORS_ORIGINS` (für connection-key)

**Verzeichnis:** `/opt/mcp-connection-key/`

---

### ✅ Services über systemd (Hetzner Server)

**Service:** `mcp.service` (oder `mcp-server.service`)

| Service | Port | ExecStart | WorkingDirectory | ENV-Quelle |
|---------|------|-----------|------------------|------------|
| **MCP Server** | 7000 | `/usr/bin/node /opt/mcp-connection-key/server.js` | `/opt/mcp-connection-key` | `/opt/mcp-connection-key/.env` |

**Service-Datei:** `/etc/systemd/system/mcp.service`

**ENV-Variablen:**
- Lädt: `/opt/mcp-connection-key/.env` (via `dotenv.config()` im Code)
- Benötigt: `OPENAI_API_KEY`

**Status:** ✅ Läuft (laut Dokumentation)

---

### ❌ Services über PM2 (Hetzner Server)

**Service:** `reading-agent` (PM2)

| Service | Port | Status | Verzeichnis | ENV-Quelle |
|---------|------|--------|-------------|------------|
| **Reading Agent** | 4001 | ❌ **GESTOPPT** | `/opt/mcp-connection-key/production` | `production/.env` |

**Start-Script:** `production/start.sh`
- Verwendet PM2: `pm2 start server.js --name reading-agent`
- ENV-Loading: `export $(cat .env | grep -v '^#' | xargs)`

**Status:** ❌ **NICHT MEHR AKTIV** (laut Dokumentation: "wurde entfernt wegen Problemen")

**Problem:** Code zeigt noch überall auf Port 4001!

---

### ✅ Services über Docker (CK-App Server)

**Datei:** `docker-compose-redis-fixed.yml`

| Service | Container Name | Port | Status | ENV-Quelle |
|---------|---------------|------|--------|------------|
| **frontend** | `the-connection-key-frontend-1` | 3000 | ✅ Läuft | `.env` (env_file) + environment: |
| **nginx** | - | 80/443 | ✅ Definiert | - |
| **ck-agent** | `ck-agent` | 4000 | ✅ Definiert | `.env` (env_file) |
| **redis** | - | 6379 (intern) | ✅ Definiert | `.env` (REDIS_PASSWORD) |
| **grafana** | - | 3001 | ✅ Definiert | `.env` (GRAFANA_PASSWORD) |
| **prometheus** | - | 9090 | ✅ Definiert | - |

**ENV-Variablen für Frontend:**
- `env_file: .env` (lädt alle Variablen aus `.env`)
- `environment:` (explizite Variablen, inkl. Build-Args)
- Kritisch: `READING_AGENT_URL` (Fallback: Port 4001 ❌)
- Kritisch: `MCP_SERVER_URL` (Fallback: Port 7000 ✅)

**Verzeichnis:** `/opt/hd-app/The-Connection-Key/`

---

## 2️⃣ DOCKER-SETUP

### Docker Compose Dateien

#### 1. `docker-compose.yml` (Hetzner Server)

**Verzeichnis:** `/opt/mcp-connection-key/`

**Services:**
- `n8n` (Port 5678)
- `chatgpt-agent` (Port 4000)
- `connection-key` (Port 3000)

**ENV-Handling:**
- Kein `env_file:` - verwendet direkte `environment:` Einträge
- Variablen aus Host-`.env` via `${VARIABLE}` Syntax
- Beispiel: `OPENAI_API_KEY=${OPENAI_API_KEY}`

**Status:** ✅ Aktiv (für n8n, chatgpt-agent, connection-key)

---

#### 2. `docker-compose-redis-fixed.yml` (CK-App Server)

**Verzeichnis:** `/opt/hd-app/The-Connection-Key/`

**Services:**
- `frontend` (Port 3000) - Next.js
- `nginx` (Port 80/443)
- `ck-agent` (Port 4000)
- `redis` (Port 6379, intern)
- `grafana`, `prometheus`, etc.

**ENV-Handling:**
- `env_file: .env` (Zeile 34, 102)
- Zusätzlich: `environment:` mit expliziten Variablen
- Build-Args für `NEXT_PUBLIC_*` Variablen

**Kritische Variablen:**
```yaml
READING_AGENT_URL: ${READING_AGENT_URL:-http://138.199.237.34:4001}  # ❌ FALSCH!
MCP_SERVER_URL: ${MCP_SERVER_URL:-http://138.199.237.34:7000}  # ✅ RICHTIG
```

**Status:** ✅ Aktiv (für Frontend)

---

### Dockerfiles

#### `Dockerfile.agent` (chatgpt-agent)
- Port: 4000
- CMD: `node chatgpt-agent/server.js`
- ENV: Keine explizite `.env`-Ladung (verwendet Host-ENV)

#### `Dockerfile.connection-key`
- Port: 3000
- CMD: `node connection-key/server.js`
- ENV: Keine explizite `.env`-Ladung

#### `Dockerfile.mcp`
- Port: 7777 (⚠️ NICHT 7000!)
- CMD: `node index.js`
- **Status:** ⚠️ **NICHT VERWENDET** (MCP läuft über systemd, nicht Docker)

---

## 3️⃣ PM2-SETUP

### PM2-Prozesse

#### Reading Agent (PM2)

**Status:** ❌ **GESTOPPT** (laut Dokumentation)

**Konfiguration:**
- Name: `reading-agent`
- Script: `production/server.js`
- Port: 4001 (via `MCP_PORT` in `.env`)
- Start: `production/start.sh`

**ENV-Handling:**
```bash
# production/start.sh (Zeile 20)
export $(cat .env | grep -v '^#' | xargs)
```

**Problem:** PM2 lädt ENV nicht automatisch neu nach `.env`-Änderung!

**Lösung (laut Dokumentation):**
```bash
pm2 delete reading-agent
export $(cat .env | grep -v '^#' | xargs)
pm2 start server.js --name reading-agent --update-env
```

**ecosystem.config.js:** ❌ **NICHT VORHANDEN**

---

### PM2 Auto-Start

**Konfiguration:**
- `pm2 save` (speichert Prozess-Liste)
- `pm2 startup` (erstellt systemd Service für PM2 selbst)

**Status:** ⚠️ Unklar (muss auf Server geprüft werden)

---

## 4️⃣ ENV-WAHRHEIT

### ENV-Dateien (Hetzner Server)

#### 1. `/opt/mcp-connection-key/.env`

**Verwendet von:**
- Docker Compose (`docker-compose.yml`)
- MCP Server (systemd) - via `dotenv.config()` im Code
- n8n Container
- chatgpt-agent Container

**Kritische Variablen:**
```bash
OPENAI_API_KEY=sk-proj-...
N8N_PASSWORD=...
N8N_API_KEY=0139efdef24110614ca2489077d2e786fd1d5e1cac1e22538d6adb68e6899d5c
N8N_HOST=n8n.werdemeisterdeinergedankenagent.de
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n.werdemeisterdeinergedankenagent.de/
API_KEY=...
CORS_ORIGINS=...
```

**Status:** ✅ **WIRD VERWENDET**

---

#### 2. `/opt/mcp-connection-key/production/.env`

**Verwendet von:**
- Reading Agent (PM2) - via `dotenv.config({ path: path.join(__dirname, ".env") })`
- **ABER:** PM2 Service ist gestoppt!

**Kritische Variablen:**
```bash
OPENAI_API_KEY=sk-proj-...
AGENT_SECRET=...
MCP_PORT=7000  # ⚠️ WICHTIG: Port wird hier gesetzt!
KNOWLEDGE_PATH=./production/knowledge
TEMPLATE_PATH=./production/templates
LOGS_PATH=./production/logs
```

**Status:** ⚠️ **NICHT MEHR AKTIV** (PM2 gestoppt)

**Problem:** Code in `production/server.js` lädt diese `.env`, aber Service läuft nicht!

---

### ENV-Dateien (CK-App Server)

#### 1. `/opt/hd-app/The-Connection-Key/frontend/.env.local`

**Verwendet von:**
- Next.js Frontend (Docker Container)
- Via `env_file: .env` in `docker-compose-redis-fixed.yml`

**Kritische Variablen:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
N8N_API_KEY=0139efdef24110614ca2489077d2e786fd1d5e1cac1e22538d6adb68e6899d5c
MCP_SERVER_URL=http://138.199.237.34:7000
NEXT_PUBLIC_MCP_SERVER_URL=http://138.199.237.34:7000
READING_AGENT_URL=http://138.199.237.34:4001  # ❌ FALSCH!
NEXT_PUBLIC_READING_AGENT_URL=http://138.199.237.34:4001  # ❌ FALSCH!
CK_AGENT_SECRET=...
```

**Status:** ✅ **WIRD VERWENDET** (aber mit falschen Fallbacks)

---

### ENV-Variablen: Verwendung im Code

#### ✅ Tatsächlich verwendet:

**Hetzner Server:**
- `OPENAI_API_KEY` - ✅ Verwendet in `production/server.js`, `chatgpt-agent/server.js`
- `AGENT_SECRET` - ✅ Verwendet in `production/server.js` (optional)
- `N8N_PASSWORD` - ✅ Verwendet in Docker Compose für n8n
- `N8N_API_KEY` - ✅ Verwendet in n8n (laut Dokumentation)

**CK-App Server:**
- `NEXT_PUBLIC_SUPABASE_URL` - ✅ Verwendet in API Routes
- `SUPABASE_SERVICE_ROLE_KEY` - ✅ Verwendet in API Routes
- `N8N_API_KEY` - ✅ Verwendet in `integration/api-routes/new-subscriber/route.ts`
- `MCP_SERVER_URL` - ✅ Verwendet in `integration/api-routes/app-router/agents/tasks/route.ts`
- `READING_AGENT_URL` - ✅ Verwendet in `integration/api-routes/app-router/reading/generate/route.ts` (aber falscher Fallback!)

---

#### ❌ Nicht verwendet / Überflüssig:

**Potentiell überflüssig:**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Optional (laut Code)
- `ADMIN_API_KEY` - Fallback zu `API_KEY` (optional)
- `CK_AGENT_SECRET` - Wird in Code referenziert, aber nicht klar wo verwendet

**Müssen geprüft werden:**
- Welche Variablen in `docker-compose-redis-fixed.yml` werden tatsächlich verwendet?
- Welche Build-Args werden wirklich benötigt?

---

## 5️⃣ ARCHITEKTUR-REALITÄT

### Service-Kommunikation

#### Hetzner Server (138.199.237.34)

**Port 4000: CK-Agent (Docker)**
- Endpoint: `POST /run` (laut `chatgpt-agent/server.js`)
- Endpoint: `POST /reading/generate` (laut `chatgpt-agent/server.js`)
- Auth: `x-agent-key` Header erforderlich
- Format: `{ message, userId }` oder `{ birthDate, birthTime, birthPlace, readingType }`

**Port 7000: MCP-Server (systemd)**
- Endpoint: `POST /agents/reading` (laut Dokumentation)
- Endpoint: `POST /agents/run` (laut Dokumentation)
- Endpoint: `POST /agent/:agentId` (laut Dokumentation)
- Auth: `Authorization: Bearer <token>` erforderlich
- Format: `{ chart, readingType }` (für `/agents/reading`)

**Port 5678: n8n (Docker)**
- Webhook: `/webhook/*`
- Intern: `http://n8n:5678` (Docker Network)

---

#### CK-App Server (167.235.224.149)

**Port 3000: Frontend (Docker)**
- API Routes: `/api/*`
- Next.js Standalone-Modus

**Kommunikation zu Hetzner:**
- `MCP_SERVER_URL` → `http://138.199.237.34:7000`
- `READING_AGENT_URL` → `http://138.199.237.34:4001` ❌ (falsch!)

---

### URLs: Aktiv vs. Historisch

#### ✅ Aktiv:

- `http://138.199.237.34:4000` - CK-Agent (Docker)
- `http://138.199.237.34:7000` - MCP-Server (systemd)
- `http://138.199.237.34:5678` - n8n (Docker)
- `https://n8n.werdemeisterdeinergedankenagent.de` - n8n (Domain)

#### ❌ Historisch / Nicht mehr existent:

- `http://138.199.237.34:4001` - Reading Agent (PM2) - **GESTOPPT**
- `http://localhost:4001` - Reading Agent (PM2) - **GESTOPPT**

**Problem:** Code zeigt noch überall auf Port 4001!

---

## 6️⃣ SICHERHEITS- & BETRIEBSBEWERTUNG

### Server-Secrets: Wo liegen sie?

#### Hetzner Server:

1. **`/opt/mcp-connection-key/.env`**
   - Enthält: `OPENAI_API_KEY`, `N8N_PASSWORD`, `N8N_API_KEY`, `API_KEY`
   - Zugriff: Root, Docker Container
   - Risiko: ⚠️ **MITTEL** (Datei sollte `chmod 600` sein)

2. **`/opt/mcp-connection-key/production/.env`**
   - Enthält: `OPENAI_API_KEY`, `AGENT_SECRET`
   - Zugriff: Root, PM2 (aber Service gestoppt)
   - Risiko: ⚠️ **NIEDRIG** (Service nicht aktiv)

---

#### CK-App Server:

1. **`/opt/hd-app/The-Connection-Key/frontend/.env.local`**
   - Enthält: `SUPABASE_SERVICE_ROLE_KEY`, `N8N_API_KEY`, `CK_AGENT_SECRET`
   - Zugriff: Root, Docker Container
   - Risiko: ⚠️ **MITTEL** (Datei sollte `chmod 600` sein)

---

### Secrets-Exposition: Risiken

#### ✅ Sicher:

- `NEXT_PUBLIC_*` Variablen sind absichtlich public (OK)
- `SUPABASE_SERVICE_ROLE_KEY` ist nur Server-Side (OK)
- Docker Container haben isolierte ENV

#### ⚠️ Potentiell riskant:

- `.env` Dateien könnten falsche Berechtigungen haben
- PM2 lädt ENV manuell (kann zu Cache-Problemen führen)
- Docker `env_file` könnte falsche Datei laden

---

### Reproduzierbarkeit

#### ✅ Reproduzierbar:

- Docker Compose Dateien sind versioniert
- ENV-Beispiele existieren (`env.example`, `production/env.example`)
- Start-Scripts existieren

#### ❌ Nicht reproduzierbar:

- Systemd Service-Datei (`/etc/systemd/system/mcp.service`) - muss manuell erstellt werden
- PM2 Konfiguration - kein `ecosystem.config.js`
- ENV-Werte müssen manuell eingetragen werden

---

## 7️⃣ ERGEBNIS: IST-ANALYSE

### ✅ Was ist notwendig:

1. **Docker Services (Hetzner):**
   - `n8n` (Port 5678) - ✅ Notwendig
   - `chatgpt-agent` (Port 4000) - ✅ Notwendig
   - `connection-key` (Port 3000) - ⚠️ Unklar (wird verwendet?)

2. **systemd Service (Hetzner):**
   - `mcp.service` (Port 7000) - ✅ Notwendig (MCP-Server)

3. **Docker Services (CK-App):**
   - `frontend` (Port 3000) - ✅ Notwendig
   - `nginx` (Port 80/443) - ✅ Notwendig
   - `redis` (Port 6379, intern) - ✅ Notwendig

---

### ❌ Was ist überflüssig:

1. **PM2 Reading Agent (Port 4001):**
   - ❌ **ÜBERFLÜSSIG** - Service gestoppt, Code zeigt darauf (falsch!)

2. **Dockerfile.mcp:**
   - ❌ **ÜBERFLÜSSIG** - MCP läuft über systemd, nicht Docker

3. **docker-compose.yml (connection-key Service):**
   - ⚠️ **UNKLAR** - Muss geprüft werden, ob verwendet

---

### 🚨 Was ist riskant:

1. **Port 4001 in Code:**
   - ❌ **KRITISCH** - Code zeigt auf nicht-existierenden Port
   - Betroffen: `integration/api-routes/app-router/reading/generate/route.ts` (Zeile 15)
   - Betroffen: `docker-compose-redis-fixed.yml` (Zeile 57-58)

2. **ENV-Fallbacks:**
   - ⚠️ **RISKANT** - Fallbacks zeigen auf falsche Ports
   - Beispiel: `READING_AGENT_URL || 'http://138.199.237.34:4001'`

3. **PM2 ENV-Caching:**
   - ⚠️ **RISKANT** - PM2 lädt ENV nicht automatisch neu
   - Lösung: `pm2 delete` + `pm2 start --update-env`

4. **Gemischtes Setup:**
   - ⚠️ **RISKANT** - Docker + systemd + PM2 (historisch) = Komplexität
   - Empfehlung: Konsolidierung auf Docker oder systemd

---

## 8️⃣ EMPFOHLENE ZIELARCHITEKTUR

### Option A: Docker-First (Empfohlen)

**Hetzner Server:**
- ✅ n8n (Docker) - Port 5678
- ✅ chatgpt-agent (Docker) - Port 4000
- ✅ MCP-Server (Docker) - Port 7000 (statt systemd)
- ❌ PM2 entfernen

**CK-App Server:**
- ✅ Frontend (Docker) - Port 3000
- ✅ nginx (Docker) - Port 80/443
- ✅ Redis (Docker) - Port 6379 (intern)

**Vorteile:**
- Einheitliches Management
- Bessere Isolation
- Einfacheres Deployment

---

### Option B: systemd-First

**Hetzner Server:**
- ✅ n8n (Docker) - bleibt
- ✅ chatgpt-agent (systemd) - statt Docker
- ✅ MCP-Server (systemd) - bleibt
- ❌ PM2 entfernen

**Vorteile:**
- Direkter Zugriff auf Host-ENV
- Keine Docker-Overhead

**Nachteile:**
- Gemischtes Setup (n8n bleibt Docker)

---

### Option C: Hybrid (Aktuell, aber bereinigt)

**Hetzner Server:**
- ✅ n8n (Docker) - bleibt
- ✅ chatgpt-agent (Docker) - bleibt
- ✅ MCP-Server (systemd) - bleibt
- ❌ PM2 Reading Agent - **ENTFERNEN**

**Änderungen:**
- Port 4001 komplett entfernen
- Code auf Port 4000 oder 7000 umstellen
- ENV-Fallbacks korrigieren

---

## 📋 OFFENE FRAGEN (Max. 5)

1. **Welche Server-Datei läuft tatsächlich auf Port 7000?**
   - Ist es `/opt/mcp-connection-key/server.js` (systemd)?
   - Oder `/opt/mcp-connection-key/production/server.js` (PM2, gestoppt)?
   - Muss auf Server geprüft werden: `ps aux | grep 7000`

2. **Wird `connection-key` Service (Port 3000, Docker) tatsächlich verwendet?**
   - Code-Referenzen prüfen
   - Oder ist es historisch?

3. **Welche Endpoints bietet Port 4000 (chatgpt-agent) tatsächlich?**
   - Code zeigt `/run` und `/reading/generate`
   - Muss getestet werden

4. **Welche Endpoints bietet Port 7000 (MCP-Server) tatsächlich?**
   - Dokumentation zeigt `/agents/reading`, `/agents/run`, `/agent/:agentId`
   - Muss getestet werden

5. **Wo liegt die tatsächliche Server-Datei für Port 7000?**
   - `/opt/mcp-connection-key/server.js`?
   - `/opt/mcp/server.js`?
   - Muss auf Server geprüft werden

---

## ✅ ZUSAMMENFASSUNG

### Notwendig:
- Docker: n8n, chatgpt-agent, frontend, nginx, redis
- systemd: mcp.service (Port 7000)

### Überflüssig:
- PM2 Reading Agent (Port 4001) - gestoppt
- Dockerfile.mcp - nicht verwendet
- Port 4001 in Code - muss entfernt werden

### Riskant:
- Port 4001 Fallbacks in Code
- Gemischtes Setup (Docker + systemd)
- PM2 ENV-Caching-Probleme

### Empfohlene Zielarchitektur:
- **Option C (Hybrid, bereinigt):** Docker für n8n/chatgpt-agent, systemd für MCP, PM2 entfernen
- Port 4001 komplett entfernen
- Code auf Port 4000 oder 7000 konsolidieren

---

**Status:** ✅ **Faktenbasierte Analyse abgeschlossen**
