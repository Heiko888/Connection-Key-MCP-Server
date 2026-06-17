# Server 138 — Vollständige Systemanalyse
**Datum:** 2026-03-27
**Server:** 138.199.237.34 (Hetzner)
**Analyseart:** Nicht-destruktiv, read-only
**Analyst:** Claude Sonnet 4.6 (MCP Agent)

---

## Inhaltsverzeichnis
1. [Projektstruktur](#1-projektstruktur)
2. [Git-Status](#2-git-status)
3. [Docker-Infrastruktur](#3-docker-infrastruktur)
4. [Ports & Netzwerk](#4-ports--netzwerk)
5. [Worker & Prozesse](#5-worker--prozesse)
6. [API-Routen](#6-api-routen)
7. [Datenbank & Queue](#7-datenbank--queue)
8. [Externe Verbindungen & API-Keys](#8-externe-verbindungen--api-keys)
9. [Berechnungs- & KI-Engine](#9-berechnungs---ki-engine)
10. [Frontend](#10-frontend)
11. [Versionierung](#11-versionierung)
12. [Altlasten & Technische Schulden](#12-altlasten--technische-schulden)
13. [System-Ressourcen](#13-system-ressourcen)
14. [Zusammenfassung & Bewertung](#14-zusammenfassung--bewertung)

---

## 1. Projektstruktur

**Hauptverzeichnis:** `/opt/mcp-connection-key`
**Zweites Repo:** `/opt/the-connection-key` (Frontend-Fokus)

### Top-Level Module
```
/opt/mcp-connection-key/
├── connection-key/          ✅ Zentrale REST-API (Express, Port 3000)
├── reading-worker/          ✅ AI Reading Worker (BullMQ + Claude, Port 4000)
├── reading-worker-backup/   ⚠️  Backup mit mehreren .js-Varianten
├── reading-worker-backup-old/ 🗑️  Alt-Backup (Node 18)
├── mcp-gateway.js           ✅ MCP HTTP Gateway (Port 7000)
├── chatgpt-agent/           ⚠️  ChatGPT-Agent (Unbekannte Nutzung im Docker)
├── frontend/                ✅ Next.js 14 App (nicht als Container aktiv)
├── production/              ⚠️  Standalone Agent-Server (Alt, nicht im Haupt-Docker)
├── v4-reading-worker/       🗑️  Leer / nicht mehr verwendet
├── gateway/                 🗑️  Nur node_modules, kein Code
├── mcp-gateway/             🗑️  Nur node_modules, kein Code
├── services/chart-truth/    ⚠️  TypeScript-Dienst (TODO-Stand)
├── integration/             ⚠️  Staging-Code für Frontend-Integration
├── _ARCHIVE_OLD_SCRIPTS/    🗑️  Deaktivierte Production-Umgebung (logs bis Jan 2026)
├── supabase/                ✅ Edge Function: check-reading-timeouts
├── migrations/              ✅ SQL-Migrationen
├── n8n-workflows/           ✅ n8n JSON-Workflows
├── knowledge/               ✅ Knowledge-Base (Brandbook etc.)
└── nginx/conf.d/            ⚠️  Leer (keine aktiven Nginx-Configs im Repo)
```

### package.json Übersicht

| Paket | Beschreibung | Node | Hauptabhängigkeiten |
|-------|-------------|------|---------------------|
| `mcp-connection-key` (root) | Monorepo-Root | >=18 | `@anthropic-ai/sdk`, `openai`, `stripe`, `astronomy-engine`, `@supabase/supabase-js` |
| `connection-key-frontend` | Next.js Frontend | — | `next@14`, `@supabase/ssr`, `stripe`, `@mui/material`, `framer-motion` |
| `reading-worker` | BullMQ Worker | — | `@anthropic-ai/sdk@0.78`, `bullmq`, `ioredis`, `openai@4.28`, `@supabase/supabase-js` |
| `reading-agent-production` | Alt Production Server | >=18 | `@anthropic-ai/sdk@0.39`, `express` |

---

## 2. Git-Status

### Repository
```
Remote:  git@github.com:Heiko888/Connection-Key-MCP-Server.git
Branch:  main
Status:  Up to date mit origin/main
```

### Lokale Änderungen (nicht committed)
| Datei | Status |
|-------|--------|
| `reading-worker/server.js` | ⚠️ modified (nicht staged) |
| `reading-worker/templates/depth-analysis.txt` | ⚠️ untracked (neue Datei) |

### Letzte Commits
```
0636dc8  feat: automatische Transit-Berechnung via Swiss Ephemeris
1541b1b  fix: W3 Connection Worker — echte Chart-Daten aus Supabase statt Placeholder
a7960f6  feat: transit/jahres reading endpoints + error monitoring + supabase migration
8851a98  feat: shadow-work reading endpoints
10d6932  feat: add W6 psychology worker and endpoints
c1411f8  checkpoint vor W6 psychology-worker
a4f353c  Feat: Penta-Reading vollständig implementiert (3-5 Personen)
f92841f  Feat: Reading-Worker komplett überarbeitet – tiefere Templates, Zwei-Personen-Readings
5c995dd  Feat: Agent-Handler in mcp-gateway integriert (Marketing, Sales, Social, Video, Design)
ee93064  Fix: Composite-Endpunkt Gate-Objekte korrekt verarbeiten
```

### Git-Repos auf dem Server
| Pfad | Status |
|------|--------|
| `/opt/mcp-connection-key` | ✅ main, up-to-date |
| `/opt/the-connection-key` | ✅ Eigenes Repo (Frontend-lastig) |

### .gitignore (relevante Einträge)
- `node_modules`, `.env`, `*.log`, `deploy.tar.gz`, `REDIS_PASSWORD.txt`
- `reading-engine-138-*.txt` (explizit ausgeschlossen — Sicherheit)

---

## 3. Docker-Infrastruktur

### Laufende Container

| Name | Image | Status | Ports |
|------|-------|--------|-------|
| `reading-worker` | `mcp-connection-key-reading-worker` | ✅ Up 5h | `0.0.0.0:4000->4000` |
| `connection-key` | `mcp-connection-key-connection-key` | ✅ Up 43h | `0.0.0.0:3000->3000` |
| `mcp-gateway` | `mcp-connection-key-mcp-gateway` | ✅ Up 5 Tage | `0.0.0.0:7000->7000` |
| `1e8bcf63357e_redis-queue-secure` | `redis:7-alpine` | ✅ Up 6 Tage (healthy) | intern (6379 kein extern) |
| `n8n` | `n8nio/n8n:latest` | ✅ Up 2 Wochen | `0.0.0.0:5678->5678` |
| `sync-reading-service` | `mcp-connection-key-sync-reading-service` | ✅ Up 2 Wochen (healthy) | `0.0.0.0:7001->7001` |

**Hinweis:** Frontend-Container ist im `docker-compose.yml` **auskommentiert** (läuft nicht als Container).

### Docker Images (alle)

| Repository | Tag | Größe | Alter |
|-----------|-----|-------|-------|
| `mcp-connection-key-reading-worker` | latest | 268MB | 5h |
| `mcp-connection-key-connection-key` | latest | 2.03GB | 43h |
| `mcp-connection-key-mcp-gateway` | latest | 574MB | 5 Tage |
| `mcp-connection-key_reading-worker` | latest | 268MB | 6 Tage |
| `mcp-connection-key-sync-reading-service` | latest | 234MB | 2 Wochen |
| `reading-worker-v4` | latest | 257MB | 4 Wochen |
| `mcp-connection-key_sync-reading-service` | latest | 250MB | 5 Wochen |
| `mcp-connection-key_mcp-gateway` | latest | 301MB | 5 Wochen |
| `v3-api-server` | latest | 270MB | 7 Wochen |
| `mcp-connection-key_connection-key` | latest | 349MB | 7 Wochen |
| `connection-key-img` | latest | 300MB | 2 Monate |
| `n8nio/n8n` | latest | 1.64GB | 2 Monate |
| `redis` | 7 | 173MB | 2 Monate |
| `mcp-connection-key_chatgpt-agent` | latest | 287MB | 2 Monate |
| `mcp-connection-key-chatgpt-agent` | latest | 287MB | 2 Monate |
| `nginx` | alpine | 81.1MB | 3 Monate |
| `node` | 20-alpine | 192MB | 3 Monate |
| `alpine` | latest | 13MB | 3 Monate |
| `mcp-connection-key_mcp-server` | latest | 271MB | 4 Monate |
| `redis` | 7-alpine | 60.7MB | 4 Monate |

⚠️ **Dangling Images:** keine (sauber)
⚠️ **Veraltete Images:** `reading-worker-v4`, `v3-api-server`, `mcp-connection-key_connection-key` (7W), `connection-key-img` (2M) und mehrere `_chatgpt-agent`-Varianten belegen zusammen mehrere GB.

### Docker Volumes

| Volume | Verwendung |
|--------|-----------|
| `mcp-connection-key_n8n_data` | n8n Workflow-Daten |
| `mcp-connection-key_redis_data` | Redis Persistenz |
| `n8n_data` | Alt-Volume (Duplikat?) |
| 4× anonyme Volumes | Diverse Container-Reste |

### Docker Netzwerk: `mcp-connection-key_app-network`

```
Subnet:  172.18.0.0/16
Gateway: 172.18.0.1

Container IPs:
  sync-reading-service  172.18.0.2
  mcp-gateway           172.18.0.3
  connection-key        172.18.0.4
  redis-queue-secure    172.18.0.5
  n8n                   172.18.0.6
  reading-worker        172.18.0.7
```

### Dockerfiles

| Datei | Base Image | Port | Dienst |
|-------|-----------|------|--------|
| `Dockerfile.connection-key` | node:20-alpine + python3/make/g++ | 3000 | Connection-Key API (inkl. `swisseph` C-Addon) |
| `Dockerfile.mcp-gateway` | node:20-alpine | 7000 | MCP HTTP Gateway |
| `reading-worker/Dockerfile` | node:20-alpine | 4000 | Reading Worker |
| `Dockerfile.agent` | node:20-alpine | 4000 | ChatGPT Agent (inaktiv) |
| `Dockerfile.mcp` | node:20-alpine | 7777 | MCP Core (inaktiv) |
| `reading-worker-backup/Dockerfile` | **node:18-alpine** | 4000 | Backup (veraltete Node-Version) |

### docker-compose.yml (aktiver Stack)

Eingebundene Services: `n8n`, `mcp-gateway`, `connection-key`, `reading-worker`, `redis`
Frontend-Container: **auskommentiert**
Redis-Port: **nicht extern exponiert** (nur intern im Docker-Netz) ✅
`sync-reading-service`: Im `docker-compose.yml` nicht definiert → läuft über separates Compose oder manuell gestartet.

---

## 4. Ports & Netzwerk

### Offene TCP-Ports (Host-Level)

| Port | Prozess | Binding | Sicherheit |
|------|---------|---------|-----------|
| 22 | sshd | 0.0.0.0 | ✅ Standard |
| 80 | nginx | 0.0.0.0 | ✅ HTTP→HTTPS Redirect |
| 443 | nginx | 0.0.0.0 | ✅ HTTPS |
| 3000 | docker-proxy → connection-key | 0.0.0.0 | ⚠️ Öffentlich, kein HTTPS |
| 4000 | docker-proxy → reading-worker | 0.0.0.0 | ⚠️ Öffentlich, kein HTTPS |
| 5678 | docker-proxy → n8n | 0.0.0.0 | ⚠️ Öffentlich (Basic Auth) |
| 6379 | redis-server | **127.0.0.1** | ✅ Nur lokal (Host-Redis, nicht Docker-Redis) |
| 7000 | docker-proxy → mcp-gateway | 0.0.0.0 | ⚠️ Öffentlich, Bearer-Auth |
| 7001 | docker-proxy → sync-reading | 0.0.0.0 | ⚠️ Öffentlich, kein HTTPS |
| 53 | systemd-resolved | 127.0.0.53 | ✅ Intern |

**Wichtig:** Auf `127.0.0.1:6379` läuft eine **zweite Redis-Instanz** (System-Redis über systemd, nicht Docker). Diese ist von außen geblockt (UFW DENY 6379).

### UFW Firewall-Regeln

| Port | Regel |
|------|-------|
| 80/tcp | ✅ ALLOW |
| 443/tcp | ✅ ALLOW |
| 22/tcp | ✅ ALLOW |
| 3000/tcp | ⚠️ ALLOW |
| 4000/tcp | ⚠️ ALLOW |
| 4001/tcp | ⚠️ ALLOW (kein Prozess aktiv) |
| 5678/tcp | ⚠️ ALLOW (n8n, Basic Auth) |
| 7000/tcp | ⚠️ ALLOW (MCP Gateway) |
| 3005/tcp | ⚠️ ALLOW (Frontend Dev, kein Prozess aktiv) |
| 3456/tcp | ⚠️ ALLOW (kein Prozess aktiv) |
| 6379/tcp | ✅ DENY |

### Nginx-Konfiguration

**Host-Nginx** (systemd, nicht Docker):
- `werdemeisterdeinergedankenagent.de` → Proxy auf `localhost:3000` (HTTPS via Let's Encrypt)
- Redirect HTTP → HTTPS

**Aktive Domains:**
- `werdemeisterdeinergedankenagent.de` → Port 3000 (connection-key) ✅
- `agent.the-connection-key.de` → Port 4000 (deployment/nginx-reading-agent.conf, ob aktiv unklar)

⚠️ `/opt/mcp-connection-key/nginx/conf.d/` ist **leer** — keine eigenen Nginx-Configs im Repo aktiv.

---

## 5. Worker & Prozesse

### PM2
**PM2 ist installiert**, aber keine aktiven Prozesse. Die PM2-Liste ist leer — alle Dienste laufen über Docker.

### Systemd-Dienste (aktiv, relevant)
| Dienst | Status |
|--------|--------|
| `docker.service` | ✅ running |
| `nginx.service` | ✅ running |
| `redis-server.service` | ✅ running (Host-Redis auf 127.0.0.1:6379) |
| `ssh.service` | ✅ running |
| `certbot` (cron.d) | ✅ Let's Encrypt Auto-Renewal |

### Cron-Jobs
- Kein benutzerdefinierter `crontab -l` Eintrag
- `/etc/cron.d/certbot` (Auto-Renewal SSL)
- `/etc/cron.d/e2scrub_all` (Filesystem-Check)
- `/etc/cron.d/sysstat` (System Stats)

### Container-Logs (letzter Stand)

**reading-worker:**
```
✅ [Chart] Typ=Generator, Profil=6/3, Autorität=Emotional
[Claude] Start claude-sonnet-4-6, max_tokens=16000, timeout=300s
✅ Claude (claude-sonnet-4-6) erfolgreich
✅ [Human Design] Reading 2e9e32b4-... aktualisiert (16970 Zeichen)
✅ [Human Design] Job fc64fcec-... abgeschlossen
```

**sync-reading-service:**
```
🚀 Sync Reading Service läuft auf Port 7001
   Endpoint: POST /reading/generate
   Verfügbare Reading-Types: business, basic, relationship, detailed
```

**mcp-gateway:**
```
✅ MCP HTTP Gateway läuft auf Port 7000
🔐 Auth: Bearer 06f7fa6a...
🤖 Claude: ✅ Connected
```

**connection-key:**
```
Normale GET-Anfragen von Censys-Scanner (externe IP)
HTTP 200 auf /health, HTTP 404 auf /login
```

---

## 6. API-Routen

### Connection-Key Server (Port 3000)

Basis-URL: `http://connection-key:3000/api` (intern) / `http://138.199.237.34:3000/api` (extern)

#### Öffentliche Endpunkte (ohne Auth)
| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| GET | `/` | Service-Info & Endpoint-Liste |
| GET | `/health` | Health-Check |
| POST | `/api/stripe/webhook` | Stripe Webhook (Stripe-Signatur-Auth) |

#### Auth-geschützte Endpunkte
| Methode | Pfad | Route-Datei |
|---------|------|-------------|
| POST | `/api/chat` | chat.js |
| GET | `/api/chat/session/:userId` | chat.js |
| DELETE | `/api/chat/session/:userId` | chat.js |
| POST | `/api/reading/generate` | reading.js |
| GET | `/api/reading/:readingId` | reading.js |
| PATCH | `/api/reading/:readingId` | reading.js |
| POST | `/api/reading/:readingId/answers` | reading.js |
| GET | `/api/reading/:readingId/answers` | reading.js |
| POST | `/api/readings-v3/create` | readings-v3.js |
| GET | `/api/readings-v3/status/:readingId` | readings-v3.js |
| GET | `/api/readings-v3/reading/:readingId` | readings-v3.js |
| GET | `/api/readings-v3/agents` | readings-v3.js |
| POST | `/api/chart/calculate` | chart.js |
| GET | `/api/chart/:chartId` | chart.js |
| POST | `/api/chart/composite` | chart.js |
| ALL | `/api/live-reading/*` | live-reading.js (Proxy) |
| ALL | `/api/readings/shadow-work/*` | shadow-work.js (Proxy) |
| ALL | `/api/readings/transit/*` | transit.js (Proxy) |
| ALL | `/api/readings/jahres/*` | jahres-reading.js (Proxy) |
| GET | `/api/transits/current` | transits.js |
| POST | `/api/matching` | matching.js |
| GET | `/api/matching/:matchId` | matching.js |
| GET | `/api/user/:userId` | user.js |
| PUT | `/api/user/:userId` | user.js |
| POST | `/api/stripe/create-checkout-session` | stripe.js |

**Hinweis:** `AUTH_ENABLED=false` im `.env` — Auth-Middleware ist aktuell **deaktiviert**!

### MCP Gateway (Port 7000)
- `POST /agents/run` — Agent-Ausführung (Bearer-Auth mit `MCP_API_KEY`)
- `GET /health` — Health-Check
- Agenten: Marketing, Sales, Social, Video, Design (aus `production/` CJS-Dateien)

### Sync Reading Service (Port 7001)
- `POST /reading/generate` — Reading-Generierung (synchron)
- `GET /health` — Health-Check
- Reading-Types: `business`, `basic`, `relationship`, `detailed`

### Reading Worker (Port 4000)
- BullMQ-basierter Worker (asynchron via Redis Queue)
- Queues: `reading-queue`, `reading-queue-v4-*`, `readings`
- Live-Reading: Separates Router-Modul (`lib/live-reading/routes.js`)
- Psychology Worker: `workers/psychology-worker.js`

---

## 7. Datenbank & Queue

### Supabase (Postgres-as-a-Service)

| Variable | Wert |
|----------|------|
| `SUPABASE_URL` | `https://wdiadklhvhlndnjojrfu.supabase.co` |
| `SUPABASE_V4_SCHEMA` | `v4` |
| Schema-Trennung | `public` (V3) + `v4` (V4) |

**Relevante Tabellen:**
- `readings` (public) — Benutzer-Readings mit `chart_data`, `reading_data`, `birth_data`
- `coach_readings` (public) — Coach-generierte Readings (Status: pending/completed)
- `reading_jobs` — Job-Queue-Referenzen

**Supabase Edge Functions:**
- `check-reading-timeouts` — Automatische Timeout-Überwachung für hängende Jobs

### Redis (BullMQ Queue)

| Property | Wert |
|----------|------|
| Docker-Container | `1e8bcf63357e_redis-queue-secure` (redis:7-alpine) |
| Binding | Intern Docker-Netz (kein externer Port) |
| Authentifizierung | Passwort-geschützt |
| Host-Redis | `127.0.0.1:6379` (systemd, separater Dienst) |
| Keys gesamt | 51 |
| Keys mit TTL | 6 |

**Aktive Queue-Namespaces (Redis):**
```
bull:reading-queue          (V3 Haupt-Queue)
bull:readings               (Reading-Job-Status)
bull:reading-queue-v4       (V4 Standard)
bull:reading-queue-v4-penta (V4 Penta)
bull:reading-queue-v4-psychology (V4 Psychologie)
bull:reading-queue-v4-multi-agent (V4 Multi-Agent)
bull:reading-queue-v4-connection  (V4 Connection)
bull:reading-v4-queue       (Alternatives V4-Namespace)
```

⚠️ **Zwei Redis-Instanzen parallel:**
1. Docker-Redis (für BullMQ, korrekt konfiguriert)
2. System-Redis (`redis-server.service` auf 127.0.0.1) — Verwendungszweck unklar

---

## 8. Externe Verbindungen & API-Keys

### API-Keys (vorhanden, nach Typ)

| Service | Key-Präfix | Status |
|---------|-----------|--------|
| Anthropic (Claude) | `sk-ant-api***` | ✅ Gesetzt, Claude aktiv |
| OpenAI | `sk-proj-YV***` | ✅ Gesetzt (Fallback) |
| Stripe Live | `sk_live_51***` | ✅ Live-Modus |
| Stripe Publishable | `pk_live_51***` | ✅ Live-Modus |
| Stripe Webhook | `whsec_AfQI***` | ✅ Gesetzt |
| n8n API | `eyJhbGci***` (JWT) | ✅ Gesetzt |

**13 Stripe Price IDs** konfiguriert (Basic, Premium, VIP, Connection-Key Pakete 1/3/5er, Penta, HD-Readings).

### Externe Services

| Service | URL | Verwendung |
|---------|-----|-----------|
| Supabase | `wdiadklhvhlndnjojrfu.supabase.co` | Primäre Datenbank |
| Anthropic API | `api.anthropic.com` | Claude Sonnet 4.6 (Reading-Generierung) |
| OpenAI API | `api.openai.com` | Fallback-Modell |
| Stripe | `api.stripe.com` | Zahlungsabwicklung (Live!) |
| n8n | `n8n.werdemeisterdeinergedankenagent.de` | Workflow-Automation |

### IP-Referenzen im Code

| IP | Kontext | Status |
|----|---------|--------|
| `138.199.237.34` | Dieser Server (in alten Scripts referenziert) | ⚠️ Hardcoded in `_ARCHIVE_OLD_SCRIPTS/.env` und `PATCH-GATEWAY-KOMPLETT.js` |
| `167.235.224.149` | Server 167 (in `docker-compose-redis-fixed.yml`) | ⚠️ Hardcoded in altem Compose-File |
| `172.17.0.1` | Docker Host-Bridge | Verwendet in altem Compose als `CK_AGENT_URL` |

**Keine kritischen Hardcoded-IPs im aktiven Code** (nur in Archiv/Backup-Dateien).

### CORS
- `CORS_ORIGINS=http://l***` (localhost-Wert im `.env`) — ⚠️ Sollte für Produktion auf tatsächliche Domains gesetzt werden.

---

## 9. Berechnungs- & KI-Engine

### Chart-Berechnung (Human Design)

| Komponente | Datei | Technologie |
|-----------|-------|------------|
| Primäre Berechnung | `connection-key/lib/astro/chartCalculation.js` | `swisseph` (Swiss Ephemeris C-Addon) |
| Transit-Rechner | `connection-key/utils/transit-calculator.js` | `astronomy-engine` |
| Gate-Mapping | `connection-key/utils/gate-mapping.js` | Statische Mapping-Tabelle |
| Chart-Endpoint | `connection-key/routes/chart.js` | `POST /api/chart/calculate` |
| Composite Chart | `connection-key/routes/chart.js` | `POST /api/chart/composite` |

`swisseph` wird im `Dockerfile.connection-key` explizit nachinstalliert (`npm install swisseph`).
`.backup`-Datei: `connection-key/lib/astro/chartCalculation.js.backup` ⚠️

### KI-Modell-Konfiguration (reading-worker/server.js)

```javascript
const MODEL_CONFIG = {
  "claude-sonnet": {
    provider: "claude",
    models: ["claude-sonnet-4-6", "claude-sonnet-4-5-20250929", "claude-sonnet-4-20250514"],
  },
  "claude-opus": {
    provider: "claude",
    models: ["claude-opus-4-6", "claude-sonnet-4-6", "claude-opus-4-5-20251101"],
  },
  "claude-haiku": {
    provider: "claude",
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6"],
  },
};
const DEFAULT_MODEL = "claude-sonnet";
```

**Aktiv genutztes Modell:** `claude-sonnet-4-6` (bestätigt durch Logs)
**Timeout:** 300 Sekunden (`CLAUDE_TIMEOUT_MS=300000`)
**Max Tokens:** 8000 (Konfiguration) / 16000 (tatsächlicher API-Aufruf in Logs)
**Fallback:** OpenAI `gpt-4o` (konfiguriert, aber Claude bevorzugt)

### Reading-Templates

`/opt/mcp-connection-key/reading-worker/templates/`:
```
basic, business, career, compatibility, connection, default,
depth-analysis (NEU, untracked), detailed, emotions, health,
jahres-reading, life-purpose, parenting, penta, reflection-profiles,
reflection, relationship, sexuality, shadow-work, spiritual
```

**22 Templates gesamt**, inkl. 1 neue ungetrackte Datei (`depth-analysis.txt`).

### Workers

| Worker | Datei | Queue |
|--------|-------|-------|
| Haupt-Worker | `reading-worker/server.js` | `reading-queue`, `readings` |
| V4-Worker | integriert in server.js | `reading-queue-v4-*` |
| Psychology-Worker | `workers/psychology-worker.js` | `reading-queue-v4-psychology` |
| Live-Reading | `lib/live-reading/routes.js` | HTTP-basiert (SSE/WebSocket) |

### Prompt-Limitierung (Antidrossel-Konfiguration)
```
KNOWLEDGE_ALLOWLIST=human-de***
MAX_KNOWLEDGE_FILE_CHARS=4000
MAX_KNOWLEDGE_TOTAL_CHARS=12000
MAX_TEMPLATE_CHARS=8000
MAX_PROMPT_CHARS=40000
OPENAI_MAX_TOKENS=1500
```

---

## 10. Frontend

**Framework:** Next.js 14
**Pfad:** `/opt/mcp-connection-key/frontend/`
**Status:** ⚠️ Läuft NICHT als Docker-Container (auskommentiert in docker-compose.yml)

**Build-Cache vorhanden:** `/opt/mcp-connection-key/frontend/.next/` (Development-Build)

### Frontend App-Router Seiten (Auswahl)

| Bereich | Pfade |
|---------|-------|
| Auth | `/login`, `/register`, `/logout` |
| Profil | `/profil`, `/profil/edit`, `/profil-einrichten` |
| Human Design | `/bodygraph`, `/gates`, `/channels`, `/centers`, `/lines`, `/planets/*` |
| Readings | `/readings`, `/readings/[id]` |
| Connection Key | `/connection-key/*`, `/connection-code/*` |
| Coach-Dashboard | `/coach`, `/coach/dashboard` |
| Agenten | `/agents/automation`, `/agents/chart`, `/agents/marketing`, `/agents/sales`, `/agents/social-youtube` |
| Community | `/community`, `/community/friends`, `/community/profile/[username]` |
| Dating | `/dating`, `/dating/chat/[id]`, `/moon-dating` |
| Buchung | `/buchung/dankeseiten/*` (9 Varianten) |
| Mondkalender | `/mondkalender`, `/mondphasen-verstehen` |
| Preise | `/preise`, `/preise-penta`, `/pricing`, `/pricing-hd` |
| Resonanzanalyse | `/resonanzanalyse/*` (4 Unterseiten) |

### Frontend-Abhängigkeiten (package.json)
- `@supabase/ssr`, `@supabase/supabase-js` — Auth & Datenbank
- `@mui/material` + `@emotion` — UI-Komponenten
- `stripe` + `@stripe/stripe-js` — Zahlungen (Live!)
- `framer-motion` — Animationen
- `three` — 3D-Grafik (Bodygraph?)
- `html2canvas` + `jspdf` — PDF-Export
- `qrcode` — QR-Code-Generierung

### Frontend React-Komponenten (Integration)

TypeScript-Komponenten in `integration/frontend/components/`:
- `AgentChat.tsx`, `AgentTasksDashboard.tsx`
- `ReadingDisplay.tsx`, `ReadingGenerator.tsx`, `ReadingHistory.tsx`
- `RelationshipAnalysisGenerator.tsx`
- `chart/BodygraphRenderer.tsx`, `ChartLoader.tsx`, `ChartLoadingSkeleton.tsx`

---

## 11. Versionierung

### API-Versionen

| Version | Status | Beschreibung |
|---------|--------|-------------|
| V3 (readings-v3) | ✅ Aktiv | Orchestrator-basiert, 4 Agenten |
| V4 (reading-queue-v4) | ✅ Aktiv | BullMQ-Queue mit spezialisierte Workers |
| V3 alt (production/) | ⚠️ Inaktiv | Standalone-Server, nicht im Docker-Stack |
| V4 worker (v4-reading-worker/) | 🗑️ Leer | Verzeichnis existiert, kein Code |

### Supabase-Schema

| Schema | Zweck |
|--------|-------|
| `public` | Standard V3 Readings, User-Daten |
| `v4` | V4 Reading-Jobs, erweiterte Daten |

### ENV-Versionierungsvariablen
- `SUPABASE_V4_SCHEMA=v4`
- `USE_CLAUDE=true`, `CLAUDE_MODEL=claude-s***`
- Beide Aliase `SUPABASE_URL` + `V4_SUPABASE_URL` zeigen auf dieselbe Supabase-Instanz

---

## 12. Altlasten & Technische Schulden

### Backup-Verzeichnisse / Archive

| Pfad | Typ | Empfehlung |
|------|-----|-----------|
| `_ARCHIVE_OLD_SCRIPTS/production__DISABLED/` | Alt-Production inkl. Logs (Dez 2025 – Jan 2026) | 🗑️ Löschbar |
| `reading-worker-backup/` | Backup mit `server.js.v3-working`, `server.js.backup-v3`, `server-production-original.js`, `server-v4-enhanced.js` | ⚠️ Aufräumen |
| `reading-worker-backup-old/` | Älteres Backup (node_modules ohne Code sichtbar) | 🗑️ Löschbar |
| `v4-reading-worker/` | Leeres Verzeichnis | 🗑️ Löschbar |
| `mcp-gateway.js.OLD` | Alte Version der Gateway-Datei | 🗑️ Löschbar |
| `gateway/` | Nur node_modules, kein Code | 🗑️ Löschbar |
| `mcp-gateway/` | Nur node_modules, kein Code | 🗑️ Löschbar |
| `connection-key/lib/astro/chartCalculation.js.backup` | Backup-Datei | ⚠️ Git verwalten |

### Backup-Images (Docker)
| Image | Alter | Empfehlung |
|-------|-------|-----------|
| `reading-worker-v4:latest` | 4 Wochen | 🗑️ Prüfen ob benötigt |
| `mcp-connection-key_sync-reading-service:latest` | 5 Wochen | 🗑️ Sofern alt |
| `mcp-connection-key_mcp-gateway:latest` | 5 Wochen | 🗑️ Sofern alt |
| `v3-api-server:latest` | 7 Wochen | 🗑️ Löschbar |
| `mcp-connection-key_connection-key:latest` | 7 Wochen | 🗑️ Löschbar |
| `connection-key-img:latest` | 2 Monate | 🗑️ Löschbar |
| `mcp-connection-key_chatgpt-agent:latest` | 2 Monate | 🗑️ Prüfen |
| `mcp-connection-key-chatgpt-agent:latest` | 2 Monate | 🗑️ Prüfen |
| `mcp-connection-key_mcp-server:latest` | 4 Monate | 🗑️ Löschbar |

**Geschätztes Einsparpotential:** ~3-4 GB Docker-Images

### TODO / FIXME im Code

| Datei | Zeile | Inhalt |
|-------|-------|--------|
| `integration/api-routes/app-router/coach/readings/route.ts` | 245 | `TODO: Implementiere Single und Penta Reading-Generierung` |
| `integration/api-routes/app-router/coach/readings-v2/generate/route.ts` | 272 | `TODO: Implementiere reading_jobs Update bei Fehler` |
| `services/chart-truth/chartTruthService.ts` | 177 | `TODO: Implementiere Swiss Ephemeris Integration` |
| `frontend/lib/human-design/index.ts` | 186 | `TODO: Integrate with ephemeris to get Sun's ecliptic longitude` |
| `frontend/lib/ai/readingQualityReviewer.ts` | 60 | `TODO: AI-Service aufrufen` |
| `mcp-gateway.js` | 311 | `TODO: Hier Reading-Generierung implementieren` |
| `connection-key/routes/stripe.js` | 130 | `TODO: Update Supabase Subscription` |
| `connection-key/middleware/auth.js` | 32 | `TODO: JWT Implementation hinzufügen` |

### Sicherheitsrisiken

| Problem | Schwere | Beschreibung |
|---------|---------|-------------|
| `AUTH_ENABLED=false` | 🔴 Kritisch | API-Auth global deaktiviert |
| `JWT` nicht implementiert | 🔴 Kritisch | `TODO` in auth.js |
| Port 3000, 4000, 7001 öffentlich ohne HTTPS | 🟠 Hoch | Klartext-HTTP für Produktions-APIs |
| `CORS_ORIGINS` → `localhost`-Wert | 🟠 Hoch | Muss Produktionsdomain enthalten |
| Port 3456 in UFW ALLOW, kein Prozess | 🟡 Mittel | Unnötige Firewall-Öffnung |
| Port 4001 in UFW ALLOW, kein Prozess | 🟡 Mittel | Unnötige Firewall-Öffnung |
| Stripe im Live-Modus | 🟡 Mittel | Echte Transaktionen laufen |
| `.env` nicht committiert | ✅ Gut | Korrekt in .gitignore |
| 2× Redis-Instanzen | 🟡 Mittel | System-Redis Verwendungszweck unklar |

---

## 13. System-Ressourcen

### Hardware

| Resource | Wert |
|----------|------|
| CPU Kerne | 3 |
| RAM gesamt | 3.7 GiB |
| RAM verwendet | 1.5 GiB |
| RAM frei | 301 MiB |
| RAM Cache/Buffer | 2.2 GiB |
| Swap | 0 (kein Swap!) |
| Disk gesamt | 75 GB |
| Disk verwendet | 41 GB (57%) |
| Disk verfügbar | 31 GB |
| Kernel | 6.8.0-101-generic |
| OS | Ubuntu (Linux) |

### Ressourcenbewertung
- ✅ Disk-Auslastung: 57% — noch ausreichend Puffer
- ⚠️ RAM: Nur 301 MiB direkt frei (aber 2.2 GiB Cache → OS gibt bei Bedarf frei)
- ⚠️ Kein Swap — Bei RAM-Engpass kein Fallback (OOM-Killer-Risiko)
- ⚠️ connection-key Image: 2.03 GB (sehr groß für einen Node-API-Server)

---

## 14. Zusammenfassung & Bewertung

### Dienst-Status-Übersicht

| Dienst | Status | Uptime | Bewertung |
|--------|--------|--------|-----------|
| `reading-worker` | ✅ Läuft | 5h | Aktiv, verarbeitet Jobs |
| `connection-key` | ✅ Läuft | 43h | Stabil |
| `mcp-gateway` | ✅ Läuft | 5 Tage | Stabil, Claude verbunden |
| `sync-reading-service` | ✅ Läuft | 2 Wochen | Stabil |
| `n8n` | ✅ Läuft | 2 Wochen | Stabil |
| `redis-queue-secure` | ✅ Läuft | 6 Tage (healthy) | Stabil |
| Frontend | ⚠️ Nicht im Docker | — | Läuft nicht als Container |
| `chatgpt-agent` | ❌ Nicht aktiv | — | Image vorhanden, kein Container |

### Kritische Befunde

| # | Befund | Priorität |
|---|--------|-----------|
| 1 | `AUTH_ENABLED=false` — alle API-Endpunkte ohne Authentifizierung erreichbar | 🔴 P0 |
| 2 | JWT-Implementation fehlt komplett (TODO in auth.js) | 🔴 P0 |
| 3 | Ports 3000, 4000, 7001 öffentlich über HTTP (kein TLS) | 🟠 P1 |
| 4 | `reading-worker/server.js` hat lokale Änderungen (nicht committed) | 🟠 P1 |
| 5 | `reading-worker/templates/depth-analysis.txt` ungetrackt | 🟡 P2 |
| 6 | Stripe im Live-Modus, aber Auth deaktiviert | 🟠 P1 |
| 7 | System-Redis parallel zu Docker-Redis (Konfusions-Potenzial) | 🟡 P2 |
| 8 | Kein Swap-Space konfiguriert | 🟡 P2 |
| 9 | 8+ unimplementierte TODOs in kritischen Pfaden | 🟡 P2 |
| 10 | ~10 veraltete Docker-Images belegen 3-4 GB | 🟢 P3 |

### Architektur-Bewertung

| Aspekt | Bewertung | Kommentar |
|--------|-----------|-----------|
| Service-Trennung | ✅ Gut | Klare Aufteilung: Gateway / API / Worker / Queue |
| Queue-System | ✅ Gut | BullMQ mit Redis, mehrere spezialisierte Queues |
| AI-Integration | ✅ Gut | Claude Sonnet 4.6 aktiv, Fallback zu OpenAI |
| Chart-Berechnung | ✅ Gut | Swiss Ephemeris als C-Addon integriert |
| Reading-Templates | ✅ Gut | 22 spez. Templates für verschiedene Reading-Typen |
| Auth & Security | ❌ Kritisch | Deaktiviert, JWT fehlt |
| HTTPS | ⚠️ Teilweise | Nur über Nginx-Proxy (nicht alle Ports) |
| Frontend-Deployment | ⚠️ Unklar | Next.js nicht containerisiert, Build-Stand unklar |
| Code-Hygiene | ⚠️ Mittel | Mehrere Backups, TODOs, untracked files |
| Monitoring | ⚠️ Keine aktive Überwachung | Kein Prometheus/Grafana aktiv (nur in altem Compose) |

---

*Erstellt: 2026-03-27 | Server: 138.199.237.34 | Analyse: nicht-destruktiv, read-only*
