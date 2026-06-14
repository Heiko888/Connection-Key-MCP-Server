# CLAUDE.md — The Connection Key — Komplette Systemdokumentation
**Stand:** 2026-06-14 | **Quellen:** Live-Analyse Server .138 + .167

> **Changelog 2026-06-14 (.138 — W7 Evolution-Engine, ersetzt oberflächliches V6-Evolution):**
> Das V6-Feature `/v6/evolution` lief bisher als **ein einziger** Claude-Call auf ck-agent
> (.167) → flach, und in der Praxis kaputt (Live-DB: `evolution_analyses` hatte 3 Zeilen/1 User,
> jüngste `status=pending`, `growth_score=0`, alle Arrays leer). **Neu:** eine wissensgeerdete,
> mehrdimensionale **Evolution-Engine auf .138** (Golden Rule: alle KI/Berechnung auf .138),
> als BullMQ-Worker analog zum Psychology-Worker. Dateien: `reading-worker/workers/evolution-worker.js`
> (Queue `reading-queue-v4-evolution`, 2 Claude-Calls: strukturiertes JSON + Narrativ),
> Wissensbasis `reading-worker/knowledge/evolution/evolution-knowledge.md` (Dekonditionierung,
> Not-Self↔Signatur, offene Zentren, Autoritäts-Ausrichtung, Score-Rahmen). Endpunkte in
> `reading-worker/server.js`: `POST /api/readings/evolution/start`, `GET /api/readings/evolution/:id`,
> `GET /api/readings/evolution/user/:userId`. DB: Migration `supabase/migrations/2026061401_evolution_engine.sql`
> erweitert `public.evolution_analyses` um `center_evolution, authority_alignment, not_self_tracking,
> timeline, coaching_links, narrative, error_message, model` (+Index user_id,created_at) — **angewandt**
> auf Projekt `wdiadklhvhlndnjojrfu`. Kern: das **natale Chart ist konstant** → „Evolution" =
> Dekonditionierung/Stimmigkeit über die Abfolge der Readings (+ Coaching-Sessions, Lernpfade als
> Signale), als deterministischer Fakten-Block geerdet. **Vier neue Dimensionen:** Zentren-/Autoritäts-
> Verlauf, Not-Self-Tracking, Zeitleiste/Trends, Coaching/Lernpfad-Verknüpfung. Deploy = reading-worker
> **Rebuild**. ⏳ **Offen (im .167-Repo, hier nicht zugänglich):** den `/api/v6/evolution`-Proxy auf die
> neuen .138-Endpunkte umstellen + Evolution-UI um die neuen Felder erweitern. Branch
> `claude/evolution-feature-expansion-lsfnnl`. Siehe Abschnitt 7 + 8.
>
> **Changelog 2026-06-13 (.138 Chart — `not_self_theme` ergänzt):** Das Chart-Objekt führte
> kein `not_self_theme` → Consumer (z. B. Psychology-Reading) fielen auf „—" zurück. Das
> Not-Self-Theme ist pro HD-Typ eindeutig und wird jetzt an **drei** Stellen sichergestellt:
> (1) **Engine** `connection-key/lib/astro/chartCalculation.js` (`notSelfThemeMap` + Feld im
> Rückgabeobjekt → neue Charts + persistiertes `chart_data` führen es); (2) **API**
> `connection-key/routes/chart.js` (Feld in die `/api/chart/calculate`-Response aufgenommen —
> die Response **pickt Felder einzeln** und hätte es sonst gestrippt); (3) **Read-Time-Fallback**
> im reading-worker (`psychology-worker.js`, `NOT_SELF_BY_TYPE` aus `chart.type`) → deckt **alle
> bestehenden** Readings ab, ohne Prod-Daten zu mutieren. Mapping: Generator=Frustration,
> MG=Frustration und Wut, Manifestor=Wut, Projector=Verbitterung, Reflector=Enttäuschung.
> ⚠️ **Deploy-Gotcha:** `connection-key` hat **keinen** Source-Bind-Mount → Deploy per
> `docker cp <datei> connection-key:/app/connection-key/… && docker restart connection-key`
> (2 GB-Rebuild vermeiden; Pfad im Container ist `/app/connection-key/…`). Quelle ist
> trotzdem ins Repo committet, damit ein späterer Rebuild denselben Stand backt. Commit
> `a900d9f` auf `main`.
>
> **Changelog 2026-06-13 (.138 Psychology-Worker — Connection-Linsen repariert, Paket 6):**
> Im **Connection-Mode** waren alle strukturierten Linsen (`polyvagal/attachment/jungian/
> bigfive/ifs`) **leer `{}`**: Person Bs Chart floss in den kombinierten Linsen-Call, das
> Modell verdoppelte den Output, riss `max_tokens` (6000, `stop_reason=max_tokens`) und lieferte
> abgeschnittenes JSON → `claudeJSON`-Fallback `{raw}` → alle Linsen leer. Da Connection die
> Validierungs-Pipeline überspringt, fiel es nicht auf; die Synthese lief ungeerdet.
> **Fix (`reading-worker/workers/psychology-worker.js`):** (1) `claudeJSON` gehärtet
> (`parseJSONLoose`: Fences entfernen + äußerstes `{…}` extrahieren; Warnung bei `max_tokens`;
> Linsen-Call `max_tokens` 6000→**8000**; Sicherheitsnetz: alle Linsen leer → Job `failed` statt
> leeres Reading). (2) Toten/kaputten `fetchConnectionData` entfernt (selektierte die nicht
> existierende Spalte `connection_readings.composite_data`, Ergebnis nie verwendet). (3) **Linsen-Call
> analysiert nur Person A** → keine Truncation; die **Synthese** erhält jetzt Person Bs Chart-Fakten
> für geerdete Beziehungsabschnitte (vorher bekam sie gar keine B-Fakten). Verifiziert: Single +
> Connection liefern voll befüllte Linsen (4/4/4/6/4), IFS mit Protectors/Exiles, je 1 Zeile →
> `completed`. Deploy: reading-worker **Rebuild**. Commit `4efdb63` auf `main`. Siehe Abschnitt 7.
>
> **Changelog 2026-06-13 (.138 Psychology-Worker — Doppel-Insert-Bug behoben, Paket 5):**
> Der Endpoint `POST /api/readings/psychology/start` (`reading-worker/server.js`) legte
> eine `psychology_readings`-Zeile (`status=pending`) an und gab deren id zurück, der
> Worker (`reading-worker/workers/psychology-worker.js`) legte via `createPsychologyRecord`
> aber eine **zweite** Zeile an und schloss nur diese ab → die an den Aufrufer zurückgegebene
> id blieb **ewig `pending`**, das fertige Reading lag unter einer nie gepollten id, und jede
> Anfrage hinterließ eine Karteileiche. **Fix (Variante 1):** Endpoint reicht die Zeilen-id
> als `job.data.psychology_reading_id` mit; der Worker schreibt **genau diese** Zeile fort
> (`status→processing`), Neuanlage nur noch im Fallback ohne id. Zusätzlich wird der
> DB-Eintrag **vor** dem Chart-Laden aufgelöst und Laden + Faktenblock in den `try`-Block
> gezogen, damit der `catch` auch Lade-Fehler als `status=failed` festhält (statt `pending`).
> End-to-End verifiziert (genau 1 Zeile, zurückgegebene id wird `completed`). Deploy:
> reading-worker per **Rebuild** (`docker compose build reading-worker && up -d`). Commit
> `7d959d4` auf `main`. Vorausgegangen: Paket 4 (IFS als 5. Linse) verifiziert erledigt.
> Siehe Abschnitt 7 + 8.
>
> **Changelog 2026-06-10 (.167 Mattermost-Workshop-Benachrichtigungen):** Neue ENV
> `MATTERMOST_WEBHOOK_WORKSHOPS` (Incoming-Webhook, Secret) für `frontend` auf .167.
> Bei bestätigter Workshop-Anmeldung (`/api/workshops/confirm` → `lib/mattermost.ts`,
> `notifyWorkshopRegistration`) wird fire-and-forget an den Mattermost-Channel gepostet.
> ⚠️ **ENV-Gotcha:** Die Var gehört ins **Root-`.env`** (`/opt/hd-app/The-Connection-Key/.env`),
> das per `env_file: - .env` von der `frontend`-Compose gelesen wird — **nicht** in
> `frontend/.env`. Server-ENV wirkt erst nach `docker compose up -d frontend` (recreate).
> Siehe Abschnitt 13 + 17.
>
> **Changelog 2026-06-08 (.167 Deploys + Verifikation):** (1) **P1 #5 (Agent-502)
> verifiziert erledigt** — Host-Nginx `sites-enabled/agent` leitet jetzt auf
> `127.0.0.1:4000` (ck-agent) statt des toten Ports 3005; `agent.the-connection-key.de`
> liefert extern **HTTP 200** (war 502). Doku in beiden Repos auf `main`.
> (2) **Workshop-Verwaltung (Phase 1) live** auf `frontend-coach` (Commit `84b229b88`):
> neue Routen `/api/workshops`, `/api/workshops/[id]`, `/api/workshops/upload`,
> Seite `/workshops` + `WorkshopFormDialog`/`WorkshopLandingEditor`. Upload schreibt
> via Service-Role in den Supabase-Storage-Bucket **`workshop-images`** (public,
> angelegt 2026-06-08, Projekt `wdiadklhvhlndnjojrfu`) → Bucket verifiziert vorhanden.
> (3) Blueprint-Fixes (Commit `a0f4c2bcb`) auf `frontend` + `frontend-coach` deployt.
> Beide Frontends nach Rebuild HTTP 200 (lokal + extern).
>
> **Changelog 2026-05-27 (Code-Abgleich .138):** Doku gegen den tatsächlichen
> Repo-Stand abgeglichen. Korrekturen: (1) **Auth ist implementiert** —
> `connection-key/middleware/auth.js` prüft `x-api-key` **und** Supabase-JWT (Bearer)
> für **alle** `/api`-Routen (Ausnahmen: `/health`, `/`, `/api/stripe/webhook`,
> `/api/telegram/webhook`); `AUTH_ENABLED` ist im `docker-compose.yml` per Default `true`.
> Die früheren P0-Punkte „Auth deaktiviert" / „JWT fehlt" sind damit erledigt.
> (2) **`sync-reading-service` ist jetzt in `docker-compose.yml`** (Port 7001).
> (3) **MCP-Gateway-Agenten-Liste korrigiert** — die real existierenden `/agent/*`-Routen
> weichen von der alten Liste ab (`chart`, `yearly`, `automation`, `depth-analysis`,
> `tasks` haben **keine** dedizierte Gateway-Route → laufen über `/agents/run` gegen
> die MCP-Core-Tools in `index.js`; das erklärt die 404er aus `AGENTEN_404_FEHLER_ANALYSE.md`).
> (4) Git-Stand aktualisiert (Working Tree sauber, letzter Commit `1a3b316`).

> **Changelog 2026-05-24:** Inkarnationskreuz-Bug behoben — Profil **4/6** wurde
> fälschlich als Left Angle statt Right Angle klassifiziert (Winkel wurde nur aus
> der ersten Profillinie abgeleitet). Fix in `connection-key/lib/astro/chartCalculation.js`
> (vollständige `PROFILE_ANGLE`-Map) + Prompt-Korrektur in `reading-worker/server.js:1517`.
> Betraf 9 bestehende 4/6-Readings (siehe `KREUZ_4-6_BETROFFENE_READINGS.md`).
> Der reading-worker holt den Chart per HTTP von `connection-key:3000/api/chart/calculate`
> (`CHART_SERVICE_URL`) — Single Source für die Chart-Berechnung ist also diese Engine.

---

## 1. SYSTEMÜBERSICHT

The Connection Key ist eine Human-Design-Plattform mit KI-gestützten Readings, Chart-Berechnungen (Swiss Ephemeris), 15+ spezialisierten AI-Agenten und Coach-Funktionen. Das System läuft auf **zwei Hetzner-Servern**.

### Serverrollen

| Server | IP | Hostname | Rolle | Projektpfad | Repo |
|--------|-----|----------|-------|-------------|------|
| **.138** | `138.199.237.34` | Hetzner | Backend, Berechnungen, Worker, APIs, Queue, AI-Engine | `/opt/mcp-connection-key` | `github.com/Heiko888/Connection-Key-MCP-Server` (main) |
| **.167** | `167.235.224.149` | Hetzner | Frontend, Coach-Portal, Agent-UI, Monitoring | `/opt/hd-app/The-Connection-Key` | `github.com/Heiko888/The-Connection-Key` (main) |

### Goldene Regeln
```
✅ ALLE Berechnungen, Worker, Datenverarbeitung, AI-Engine  → Server .138
✅ Frontend, UI, Darstellung, Coach-Portal                   → Server .167
✅ Vor jeder Änderung: Prüfe auf welchem Server du bist
✅ Vor jeder Änderung: Prüfe welche Ports/Container betroffen sind
✅ Nach jeder Änderung: Docker-Container neu starten falls betroffen
❌ NIE Worker oder Berechnungslogik auf .167 anlegen
❌ NIE Frontend-Serving auf .138 anlegen
❌ NIE IPs hardcoden — immer ENV-Variablen nutzen
```

---

## 2. ARCHITEKTUR-DIAGRAMM

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                 INTERNET / BENUTZER                                   │
└────────────────┬─────────────────────────────────────────┬───────────────────────────┘
                 │                                         │
                 ▼                                         ▼
┌────────────────────────────────────────┐  ┌──────────────────────────────────────────┐
│     SERVER .167 (Frontend/UI)          │  │     SERVER .138 (Backend/Engine)          │
│     167.235.224.149                    │  │     138.199.237.34                        │
│     /opt/hd-app/The-Connection-Key     │  │     /opt/mcp-connection-key               │
│                                        │  │                                          │
│  ┌──────────────────────────────────┐  │  │  ┌──────────────────────────────────┐    │
│  │ Host-Nginx (80/443) ⚠️ DUAL     │  │  │  │ Host-Nginx (80/443)              │    │
│  │ the-connection-key.de    →:3000  │  │  │  │ werdemeisterdeiner...de  →:3000  │    │
│  │ coach.the-c...-key.de   →:3002  │  │  │  └────┬─────────┬──────────┬───────┘    │
│  │ agent.the-c...-key.de   →:4000✅│  │  │       │         │          │            │
│  └────┬─────────┬────────────────┘  │  │       ▼         ▼          ▼            │
│       │         │                    │  │  ┌─────────┐┌────────┐┌─────────┐       │
│       ▼         ▼                    │  │  │conn-key ││reading ││  mcp-   │       │
│  ┌──────────────────────────────┐    │  │  │  :3000  ││worker  ││gateway  │       │
│  │ Docker-Nginx (80/443) ⚠️DUAL│    │  │  │  (API)  ││ :4000  ││ :7000   │       │
│  │ Rate Limiting: 10r/s API    │    │  │  │ Express ││ BullMQ ││ Agents  │       │
│  │ Timeout: 300s Agents        │    │  │  └────┬────┘└───┬────┘└────┬────┘       │
│  └────┬─────────┬──────┬───────┘    │  │       │         │          │            │
│       │         │      │            │  │       ▼         ▼          ▼            │
│       ▼         ▼      ▼            │  │  ┌─────────────────────────────┐         │
│  ┌─────────┐┌────────┐┌────────┐   │  │  │  Redis (BullMQ) :6379 int  │         │
│  │frontend ││frontend││ck-agent│   │  │  │  51 Keys, 8 Queue-Namespaces│         │
│  │ :3000   ││-coach  ││ :4000  │   │  │  └─────────────────────────────┘         │
│  │Next.js  ││ :3002  ││Express │   │  │                                          │
│  │ (v3 UI) ││Next.js ││        │───────┼──► .138:7000 (MCP Gateway)              │
│  │         ││(v4 UI) ││        │───────┼──► .138:3000 (V4 Backend API)           │
│  └─────────┘└────────┘└────────┘   │  │  ┌─────────────────────────────┐         │
│                                      │  │  │ sync-reading :7001         │         │
│  ┌─────────┐ ┌───────────┐          │  │  │ (in docker-compose.yml)    │         │
│  │Grafana  │ │Prometheus │          │  │  └─────────────────────────────┘         │
│  │ :3001   │ │ :9090     │          │  │                                          │
│  └─────────┘ └───────────┘          │  │  ┌─────────────────────────────┐         │
│  ┌─────────┐ ┌───────────┐          │  │  │    n8n :5678               │         │
│  │Alert-   │ │Node-      │          │  │  └─────────────────────────────┘         │
│  │manager  │ │Exporter   │          │  │                                          │
│  │ :9093   │ │ :9100     │          │  │  Extern: Supabase (Postgres)             │
│  └─────────┘ └───────────┘          │  │  AI: Claude Sonnet 4.6 (Anthropic)      │
│  ┌─────────┐ ┌───────────┐          │  │  AI Fallback: OpenAI gpt-4o             │
│  │Redis    │ │Redis-     │          │  │  Payments: Stripe (LIVE!)                │
│  │(intern) │ │Exporter   │          │  │                                          │
│  └─────────┘ │ :9121     │          │  │  Docker-Netz: 172.18.0.0/16             │
│              └───────────┘          │  │  (mcp-connection-key_app-network)        │
│                                      │  │                                          │
│  n8n :5678 (intern)                  │  │  ⚠️ System-Redis 127.0.0.1:6379        │
│  Docker-Netz: app-network            │  │     (parallel zu Docker-Redis)          │
└────────────────────────────────────────┘  └──────────────────────────────────────────┘

Kommunikation .167 → .138:
  ck-agent        ──► 138.199.237.34:7000  (MCP Gateway — HARDCODED in 50+ Dateien ⚠️)
  frontend-coach  ──► 138.199.237.34:3000  (V4 Backend API)
  frontend-coach  ──► 138.199.237.34:4000  (Reading Agent)
  frontend-coach  ──► 138.199.237.34:7000  (MCP Gateway für Agents)
```

---

## 3. GIT REPOSITORIES

| Server | Repo | Pfad | Branch | Letzter Commit | Uncommitted |
|--------|------|------|--------|----------------|-------------|
| .138 | `Heiko888/Connection-Key-MCP-Server` | `/opt/mcp-connection-key` | main | `1a3b316` Merge: MG-Typ-Erkennung (Motor→Throat) | ✅ Sauber |
| .138 | (Zweites Repo) | `/opt/the-connection-key` | main | — | Frontend-lastig, separates Repo |
| .167 | `Heiko888/The-Connection-Key` | `/opt/hd-app/The-Connection-Key` | main | `35a75bd76` Refactor: MUI | ✅ Sauber |

**Zwei separate Repos.** .138 = Backend-Monorepo, .167 = Frontend-Repo.
**CI/CD:** GitHub Actions (.167 hat `.github/workflows/`)

---

## 4. DOCKER-ÜBERSICHT

### Server .138 — Docker Services

| Service | Image | Ports | Status | Container-IP | In docker-compose? |
|---------|-------|-------|--------|-------------|-------------------|
| `connection-key` | `mcp-connection-key-connection-key` (2.03 GB!) | 0.0.0.0:3000→3000 | ✅ Up 43h | 172.18.0.4 | ✅ |
| `reading-worker` | `mcp-connection-key-reading-worker` (268 MB) | 0.0.0.0:4000→4000 | ✅ Up 5h | 172.18.0.7 | ✅ |
| `mcp-gateway` | `mcp-connection-key-mcp-gateway` (574 MB) | 0.0.0.0:7000→7000 | ✅ Up 5d | 172.18.0.3 | ✅ |
| `sync-reading-service` | (234 MB) | 0.0.0.0:7001→7001 | ✅ Up 2w | 172.18.0.2 | ✅ (nur `ANTHROPIC_API_KEY` als ENV) |
| `redis-queue-secure` | `redis:7-alpine` | intern 6379 | ✅ Healthy | 172.18.0.5 | ✅ |
| `n8n` | `n8nio/n8n:latest` (1.64 GB) | 0.0.0.0:5678→5678 | ✅ Up 2w | 172.18.0.6 | ✅ |
| Frontend | auskommentiert | — | ❌ | — | Auskommentiert |
| chatgpt-agent | Image vorhanden (2×287 MB) | — | ❌ | — | Nicht aktiv |

**Netzwerk:** `mcp-connection-key_app-network` (172.18.0.0/16)

### Server .167 — Docker Services

| Service | Image | Ports | Status | Netzwerk | In docker-compose? |
|---------|-------|-------|--------|----------|-------------------|
| `frontend` | build (Next.js) | 3000→3000 | ✅ Healthy | app-network | ✅ |
| `frontend-coach` | build (Next.js) | 3002→3000 | ✅ Up | app-network | ✅ |
| `ck-agent` | build (Express.js) | 4000→4000 | ✅ Up | app-network | ✅ |
| `nginx` | `nginx:alpine` | 80, 443 | ✅ Up | app-network | ✅ |
| `redis` | `redis:alpine` | 6379 intern | ✅ Up | app-network | ✅ |
| `grafana` | `grafana/grafana` | 3001→3000 | ✅ Up | app-network | ✅ |
| `prometheus` | `prom/prometheus` | 9090→9090 | ✅ Up | app-network | ✅ |
| `node-exporter` | `prom/node-exporter` | 9100→9100 | ✅ Up | app-network | ✅ |
| `alertmanager` | `prom/alertmanager` | 9093→9093 | ✅ Up | app-network | ✅ |
| `redis-exporter` | `oliver006/redis_exporter` | 9121→9121 | ✅ Up | app-network | ✅ |
| `n8n` | `n8nio/n8n` | 5678 intern | ✅ Up | — | ✅ |

### Docker Volumes

**.138:**
- `mcp-connection-key_n8n_data` — n8n Workflows
- `mcp-connection-key_redis_data` — Redis Persistenz
- `n8n_data` — ⚠️ Duplikat-Volume
- 4× anonyme Volumes — Container-Reste

**.167:**
- `grafana-storage` — Grafana
- `prometheus-storage` — Prometheus TSDB (200h retention)
- `alertmanager-storage` — AlertManager
- `redis-storage` — Redis RDB

### Dockerfiles (.138)

| Datei | Base | Port | Dienst | Status |
|-------|------|------|--------|--------|
| `Dockerfile.connection-key` | node:20-alpine + python3/make/g++ (swisseph) | 3000 | Connection-Key API | ✅ Aktiv |
| `reading-worker/Dockerfile` | node:20-alpine | 4000 | Reading Worker | ✅ Aktiv |
| `Dockerfile.mcp-gateway` | node:20-alpine | 7000 | MCP Gateway | ✅ Aktiv |
| `Dockerfile.agent` | node:20-alpine | 4000 | ChatGPT Agent | ❌ Inaktiv |
| `Dockerfile.mcp` | node:20-alpine | 7777 | MCP Core | ❌ Inaktiv |
| `reading-worker-backup/Dockerfile` | node:**18**-alpine ⚠️ | 4000 | Backup Worker | 🗑️ Veraltet |

---

## 5. KOMPLETTE PORT-MAP

### Server .138

| Port | Service/Container | Binding | Sicherheit | Zweck | Status |
|------|-------------------|---------|-----------|-------|--------|
| 22 | sshd | 0.0.0.0 | ✅ | Admin SSH | ✅ |
| 80 | nginx (systemd) | 0.0.0.0 | ✅ | HTTP→HTTPS | ✅ |
| 443 | nginx (systemd) | 0.0.0.0 | ✅ | HTTPS | ✅ |
| 3000 | connection-key (Docker) | 0.0.0.0 | ⚠️ Extern, HTTP | REST-API | ⚠️ |
| 4000 | reading-worker (Docker) | 0.0.0.0 | ⚠️ Extern, HTTP | Worker-API | ⚠️ |
| 5678 | n8n (Docker) | 0.0.0.0 | ⚠️ Basic Auth | Workflows | ⚠️ |
| 6379 | redis (Docker intern) | Docker-Netz | ✅ Intern | BullMQ | ✅ |
| 6379 | redis-server (systemd) | 127.0.0.1 | ✅ Lokal | ⚠️ Unklar | ⚠️ |
| 7000 | mcp-gateway (Docker) | 0.0.0.0 | ⚠️ Bearer Auth | Agent Gateway | ⚠️ |
| 7001 | sync-reading (Docker) | 0.0.0.0 | ⚠️ Extern, HTTP | Sync Readings | ⚠️ |

**UFW offen aber ungenutzt:** 3005, 3456, 4001 → 🗑️ Schließen

### Server .167

| Port | Service/Container | Sicherheit | Zweck | Status |
|------|-------------------|-----------|-------|--------|
| 22 | sshd | ✅ | Admin SSH | ✅ |
| 80 | nginx (Docker) | ✅ | HTTP→HTTPS | ✅ |
| 443 | nginx (Docker) | ✅ | HTTPS (alle Domains) | ✅ |
| 3000 | frontend (Docker) | via Nginx/SSL | the-connection-key.de | ✅ |
| 3001 | grafana (Docker) | ⚠️ Intern | Monitoring | ⚠️ |
| 3002 | frontend-coach (Docker) | via Nginx/SSL | coach.the-connection-key.de | ✅ |
| 3005 | **NICHTS** | — | ⚠️ veralteter Port (UFW schließen); agent.the-connection-key.de läuft jetzt über 4000 | 🗑️ |
| 4000 | ck-agent (Docker) | Intern | Agent Express Server | ✅ |
| 5678 | n8n (Docker) | Intern | Workflows | ✅ |
| 6379 | redis (Docker) | Intern | Cache | ✅ |
| 9090 | prometheus | ⚠️ Intern | Metriken | ✅ |
| 9093 | alertmanager | ⚠️ Intern | Alerts | ✅ |
| 9100 | node-exporter | ⚠️ Intern | System-Metriken | ✅ |
| 9121 | redis-exporter | ⚠️ Intern | Redis-Metriken | ✅ |

---

## 6. NGINX-KONFIGURATION

### Server .138 — Host-Nginx (systemd)
```
werdemeisterdeinergedankenagent.de → localhost:3000 (HTTPS, Let's Encrypt)
```
⚠️ `/opt/mcp-connection-key/nginx/conf.d/` ist LEER

### Server .167 — DUAL-NGINX PROBLEM ⚠️

**Host-Nginx (sites-enabled/):**
```
the-connection-key.de           → localhost:3000  ✅
coach.the-connection-key.de     → localhost:3002  ✅
agent.the-connection-key.de     → localhost:4000  ✅ (gefixt 2026-06-07, war 3005)
n8n                             → n8n Server
```

**Docker-Nginx (nginx/nginx.conf):**
```
Upstreams:
  frontend        → frontend:3000
  frontend-coach  → frontend-coach:3000
  ck-agent        → ck-agent:4000

Domains (HTTPS):
  the-connection-key.de         → frontend        ✅
  coach.the-connection-key.de   → frontend-coach   ✅
  agent.the-connection-key.de   → ck-agent:4000    ✅

Security: X-Frame-Options, HSTS (2 Jahre), XSS-Protection
Rate Limiting: API 10r/s, Login 5r/m
Agent Timeout: 300s
```

**Problem:** Host-Nginx und Docker-Nginx laufen parallel. ✅ **Teil-Fix (2026-06-07):** Host-Nginx (`sites-enabled/agent`) leitet `agent.the-connection-key.de` jetzt korrekt auf Port 4000 (ck-agent) → 200 statt 502. Offen bleibt die generelle Dual-Nginx-Auflösung (Host + Docker parallel).

---

## 7. WORKER & BACKGROUND-PROZESSE

### Aktive Worker

| Worker | Server | Container | Port | Queue/Broker | Zweck | Status |
|--------|--------|-----------|------|-------------|-------|--------|
| `reading-worker/server.js` | .138 | reading-worker | 4000 | BullMQ (Redis) | HD-Readings via Claude | ✅ Aktiv |
| `workers/psychology-worker.js` | .138 | reading-worker | — | `reading-queue-v4-psychology` | Psychologie-Readings | ✅ Integriert |
| `workers/evolution-worker.js` | .138 | reading-worker | — | `reading-queue-v4-evolution` | Evolution-/Dekonditionierungs-Analyse (V6) | ✅ Integriert (2026-06-14) |
| `lib/live-reading/routes.js` | .138 | reading-worker | — | HTTP (SSE/WS) | Live-Readings | ✅ Integriert |
| `sync-reading-service` | .138 | sync-reading | 7001 | HTTP | Sync-Readings (basic, business, etc.) | ✅ Aktiv |
| `mcp-gateway` | .138 | mcp-gateway | 7000 | HTTP | 15+ Agent Gateway | ✅ Aktiv |
| `ck-agent/server.js` | .167 | ck-agent | 4000 | Express | Agent-UI Proxy → .138 | ✅ Aktiv |

**Psychology-Worker — Flow (Stand 2026-06-13):** `POST /api/readings/psychology/start`
(reading-worker, Port 4000) legt **eine** `public.psychology_readings`-Zeile (`status=pending`)
an, gibt deren id als `psychology_reading_id` zurück **und reicht dieselbe id im BullMQ-Job**
(`job.data.psychology_reading_id`) weiter. Der Worker schreibt **genau diese Zeile** fort
(`processing` → `completed`/`failed`), legt nur im Fallback (Job ohne id) eine neue an.
5 Linsen (Polyvagal, Attachment, Jung, Big Five, **IFS**) in **2 Claude-Calls** + Synthese,
im Single-Mode zusätzlich abgesichert durch die Validierungs-Pipeline. **Connection-Mode:** der
Linsen-Call (Call 1) analysiert ausschließlich **Person A** (sonst Output-Verdopplung →
`max_tokens`-Truncation → leere Linsen, siehe Changelog Paket 6); die **Beziehungsdynamik** kommt
erst in der Synthese (Call 2) dazu, die dafür Person Bs Chart-Fakten erhält. Ergebnis-Spalten:
`polyvagal, attachment, jungian, bigfive, ifs, synthesis`. Abfrage: `GET /api/readings/psychology/:id`.
Deploy = **Rebuild** (`docker compose build reading-worker && docker compose up -d reading-worker`).

**Evolution-Worker — Flow (Stand 2026-06-14):** `POST /api/readings/evolution/start`
(reading-worker, Port 4000; Body `{user_id, reading_ids?, focus_area?, type?}`) legt **eine**
`public.evolution_analyses`-Zeile (`status=pending`) an, gibt deren id als
`evolution_analysis_id` zurück **und reicht dieselbe id im BullMQ-Job** weiter (Queue
`reading-queue-v4-evolution`). Der Worker schreibt **genau diese Zeile** fort
(`processing` → `completed`/`failed`), legt nur im Fallback (Job ohne id) eine neue an
(gleiches Muster wie Psychology, vermeidet Doppel-Insert/ewig-pending). Er lädt die
**chronologische Reading-Historie** des Users (+ best-effort `coaching_sessions` &
`learning_paths` als Verlaufs-Signale), erdet das **konstante natale Chart** als
deterministischen Fakten-Block (`buildFactsBlock`) und fährt **2 Claude-Calls**: (1)
strukturierte mehrdimensionale Analyse (JSON, 8000 Tokens), (2) warmes Narrativ (Markdown).
Ergebnis-Spalten: `overall_growth_score, not_self_tracking, authority_alignment,
center_evolution, timeline, key_changes, growth_areas, recommendations, coaching_links,
insights, comparison_data, narrative`. Abfrage: `GET /api/readings/evolution/:id`,
Liste: `GET /api/readings/evolution/user/:userId`. Bei nur **einem** Reading: Baseline-Modus
(konservativer Score). Deploy = **Rebuild**. Frontend-Anbindung (`/api/v6/evolution`-Proxy
umstellen) liegt im .167-Repo.

### Inaktive / Problematische Worker

| Worker | Server | Problem | Soll auf | Aktion |
|--------|--------|---------|----------|--------|
| `v4-worker/processV4Job.js` | .167 (definiert) | ❌ `generateReading.js` ist nur ein STUB! | **.138** 🔄 | Engine-Code von .138 kopieren oder Worker auf .138 deployen |
| `v3-api-server/` | .167 (definiert) | ❌ Nie gestartet, Legacy | **.138** 🔄 | Prüfen ob noch benötigt |
| `chatgpt-agent` | .138 (Image) | ❌ Container nicht gestartet | Prüfen | 🗑️ Wahrscheinlich obsolet |

### BullMQ Queues (Redis auf .138, 51 Keys)

| Queue | Version | Zweck |
|-------|---------|-------|
| `bull:reading-queue` | V3 | Haupt-Reading-Queue |
| `bull:readings` | V3 | Reading-Job-Status |
| `bull:reading-queue-v4` | V4 | Standard V4 Readings |
| `bull:reading-queue-v4-penta` | V4 | Penta-Readings (3-5 Personen) |
| `bull:reading-queue-v4-psychology` | V4 | Psychologie-Readings |
| `bull:reading-queue-v4-evolution` | V4 | Evolution-/Dekonditionierungs-Analyse (V6) |
| `bull:reading-queue-v4-multi-agent` | V4 | Multi-Agent-Readings |
| `bull:reading-queue-v4-connection` | V4 | Connection-Readings |
| `bull:reading-v4-queue` | V4 | ⚠️ Alternatives Namespace (Duplikat?) |

### V4 Job-Architektur

```
frontend-coach POST /api/v4/readings
       │
       ▼
Supabase v4.reading_jobs (status: pending)
       │
       ▼ (Polling)
v4-worker/processV4Job.js
       │
       ▼
generateReading.js  ← ⚠️ STUB! Nur 11 Zeilen, wirft Fehler
                       Engine-Code muss von .138 kommen
       │
       ▼
Supabase v4.reading_results + public.readings
```

---

## 8. API-ENDPUNKTE

### Server .138 — Connection-Key API (Port 3000)

**Basis:** `http://138.199.237.34:3000/api`
**Auth:** ✅ Aktiv für **alle** `/api`-Routen via `authMiddleware` (`connection-key/middleware/auth.js`). Akzeptiert zwei Methoden: **(1)** `x-api-key`-Header gegen ENV `API_KEY` (interne Services: .167, n8n, reading-worker) und **(2)** `Authorization: Bearer <token>` als **Supabase-JWT** (Frontend-User-Sessions, via `supabase.auth.getUser()`). Zusätzlich Legacy-Support für `?apiKey=`. **Public (ohne Auth):** `/health`, `/` (Service-Info), `/api/stripe/webhook` (Stripe-Signatur prüft selbst), `/api/telegram/webhook` (Bot-API sendet keine Header). `AUTH_ENABLED` Default `true` (`docker-compose.yml`). Der reading-worker ruft die Chart-API intern mit `x-api-key: $API_KEY` auf (`reading-worker/server.js:286`).

| Methode | Pfad | Beschreibung | Status |
|---------|------|-------------|--------|
| GET | `/` | Service-Info & Endpoint-Liste | ✅ |
| GET | `/health` | Health-Check | ✅ |
| POST | `/api/chat` | Chat mit Agent | ✅ |
| GET/DELETE | `/api/chat/session/:userId` | Chat-Session | ✅ |
| POST | `/api/reading/generate` | Reading generieren (async) | ✅ |
| GET | `/api/reading/:readingId` | Reading abrufen | ✅ |
| PATCH | `/api/reading/:readingId` | Reading aktualisieren | ✅ |
| POST/GET | `/api/reading/:readingId/answers` | Antworten | ✅ |
| POST | `/api/readings-v3/create` | V3 Reading | ✅ |
| GET | `/api/readings-v3/status/:readingId` | V3 Status | ✅ |
| GET | `/api/readings-v3/reading/:readingId` | V3 Reading abrufen | ✅ |
| GET | `/api/readings-v3/agents` | V3 Agenten-Liste | ✅ |
| POST | `/api/chart/calculate` | Chart berechnen (Swiss Ephemeris) | ✅ |
| GET | `/api/chart/:chartId` | Chart abrufen | ✅ |
| POST | `/api/chart/composite` | Composite-Chart | ✅ |
| ALL | `/api/live-reading/*` | Live-Reading (Proxy) | ✅ |
| ALL | `/api/readings/shadow-work/*` | Shadow-Work | ✅ |
| ALL | `/api/readings/transit/*` | Transit-Readings | ✅ |
| ALL | `/api/readings/jahres/*` | Jahres-Readings | ✅ |
| GET | `/api/transits/current` | Aktuelle Transite | ✅ |
| POST | `/api/matching` | Matching starten | ✅ |
| GET | `/api/matching/:matchId` | Matching-Ergebnis | ✅ |
| GET/PUT | `/api/user/:userId` | User-Daten | ✅ |
| POST | `/api/stripe/create-checkout-session` | Stripe Checkout | ✅ |
| POST | `/api/stripe/webhook` | Stripe Webhook (Signatur-Auth) | ✅ |

### Server .138 — MCP Gateway (Port 7000, `mcp-gateway.js`)

**Auth:** `/agents/run` per Bearer Token (`MCP_API_KEY` / `CK_AGENT_SECRET`). Die dedizierten `/agent/*`-Routen sind aktuell **ohne** eigenen Auth-Check.

| Methode | Pfad | Funktion |
|---------|------|----------|
| POST | `/agents/run` | Generischer Dispatcher (`domain`/`task`/`payload`) → spawnt MCP-Core (`index.js`) per stdio; max. 1 Request gleichzeitig |
| GET | `/health` | Health-Check |

**Dedizierte Agent-Endpunkte (real in `mcp-gateway.js`, 16 Stück):**
```
/agent/marketing         /agent/sales           /agent/social-youtube
/agent/video             /agent/video-creation  /agent/ui-ux
/agent/chart-architect   /agent/reading         /agent/reflection
/agent/shadow-work       /agent/relationship    /agent/transit
/agent/business-hd       /agent/emotions        /agent/health
/agent/abundance
```
⚠️ **Kein** dedizierter Endpunkt für `chart`, `yearly`, `automation`, `depth-analysis`, `tasks` — diese müssten über `/agents/run` gegen die MCP-Core-Tools laufen. `index.js` registriert nur: `ping`, `echo`, `getDateTime`, `calculate`, `generateUUID`, `callN8N`, `createN8NWorkflow`, `triggerN8NWebhook`, `generateReading`, `analyzeChart`, `matchPartner`, `saveUserData`. Das erklärt die 404er aus `AGENTEN_404_FEHLER_ANALYSE.md`.
⚠️ `/agent/reading` fällt ohne `ANTHROPIC_API_KEY` auf Placeholder-Text zurück (`mcp-gateway.js:246`); `/agents/reading` (mit s) ist ein reiner Platzhalter (`:302`, TODO `:312`).

### Server .138 — Sync Reading Service (Port 7001)

| Methode | Pfad | Types |
|---------|------|-------|
| POST | `/reading/generate` | business, basic, relationship, detailed |
| GET | `/health` | Health-Check |

### Server .167 — Frontend-Coach API Routes (Next.js App Router)

**V4 Readings API:**

| Methode | Pfad | Beschreibung | Status |
|---------|------|-------------|--------|
| POST | `/api/v4/readings` | Create Reading + Job | ✅ |
| GET | `/api/v4/readings` | List Readings | ✅ |
| GET | `/api/v4/readings/[id]` | Reading Detail | ✅ |
| POST | `/api/v4/readings/[id]/regenerate` | Regenerate | ✅ |
| GET | `/api/v4/readings/[id]/history` | Versionen | ✅ |
| POST | `/api/v4/readings/[id]/share` | Teilen | ✅ |
| POST | `/api/v4/readings/[id]/email` | E-Mail versenden | ⚠️ RESEND_API_KEY fehlt! |
| GET | `/api/v4/readings/[id]/pdf` | PDF Export | ❌ TODO |
| GET | `/api/v4/readings/[id]/generate-stream` | Streaming | ✅ |
| POST | `/api/v4/readings/specialized` | Spezial-Readings | ✅ |

**Proxy-Routes (→ .138):**

| Methode | Pfad | Ziel auf .138 |
|---------|------|--------------|
| POST | `/api/proxy/readings/transit` | :3000 Transit-Job |
| GET | `/api/proxy/readings/transit/status/[jobId]` | :3000 Status |
| GET | `/api/proxy/transits` | :3000 Aktuelle Transite |
| POST | `/api/proxy/readings/psychology` | :4000 Psychology |
| GET | `/api/proxy/readings/psychology/[id]` | :4000 Status |
| POST | `/api/proxy/readings/shadow-work` | :3000 Shadow Work |
| POST | `/api/proxy/readings/jahres` | :3000 Jahres Reading |

**Agent Routes (.167 → .138:7000):**

| Methode | Pfad | Agent |
|---------|------|-------|
| POST | `/api/agents/chart` | Chart Analysis |
| POST | `/api/agents/yearly` | Yearly Analysis |
| POST | `/api/agents/automation` | Automation Strategy |
| POST | `/api/agents/ui-ux` | UI/UX Strategy |
| POST | `/api/agents/sales` | Sales Strategy |
| POST | `/api/agents/business-hd` | Business HD |
| POST | `/api/agents/video-creation` | Video Generation |
| POST | `/api/agents/transit` | Transit Insights |
| POST | `/api/agents/depth-analysis` | Depth Analysis |
| POST | `/api/agents/tasks` | Task Planning ❌ TODO: MCP Endpoint fehlt |
| POST | `/api/agents/shadow-work` | Shadow Work |
| POST | `/api/agents/social-youtube` | Social Media |
| POST | `/api/agents/relationship` | Relationship |
| POST | `/api/agents/emotions` | Emotional Intelligence |
| POST | `/api/agents/marketing` | Marketing Strategy |
| POST | `/api/agents/reflection` | Reflection Coaching |
| POST | `/api/agents/chart-architect` | Chart Architecture |

**Admin Routes (.167):**

| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| GET | `/api/admin/logs` | Logs |
| GET | `/api/admin/logs/recent` | Recent Logs |
| GET | `/api/admin/dashboard/stats` | Statistiken |
| GET | `/api/admin/users/list` | User-Liste |
| POST | `/api/admin/textbausteine` | Template-Verwaltung |
| GET | `/api/admin/audit` | Audit Log |

**Live-Reading Sessions (.167):**

| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| POST | `/api/live-reading/session` | Session erstellen |
| GET | `/api/live-reading/session/[id]` | Session laden |
| POST | `/api/live-reading/session/[id]/step/[stepId]/generate` | Step generieren |
| GET | `/api/live-reading/session/[id]/step/[stepId]/notes` | Notizen laden |
| POST | `/api/live-reading/session/[id]/complete` | Session abschließen |

---

## 9. KI-AGENTEN & MODELLE

### Modell-Konfiguration (.138 reading-worker)

```javascript
DEFAULT_MODEL: "claude-sonnet"
claude-sonnet:  claude-sonnet-4-6 → claude-sonnet-4-5 → claude-sonnet-4
claude-opus:    claude-opus-4-6 → claude-sonnet-4-6 → claude-opus-4-5
claude-haiku:   claude-haiku-4-5 → claude-sonnet-4-6
Fallback:       OpenAI gpt-4o
Timeout:        300s
Max Tokens:     8000 (config) / 16000 (actual)
```

### Agent-Übersicht (Stand: `mcp-gateway.js` abgeglichen 2026-05-27)

**Dedizierte `/agent/*`-Routen (existieren real, 16):**

| # | Agent | Server | Endpunkt | Modell | Status |
|---|-------|--------|----------|--------|--------|
| 1 | Marketing | .138 | :7000/agent/marketing | Claude | ✅ |
| 2 | Sales Strategy | .138 | :7000/agent/sales | Claude | ✅ |
| 3 | Social/YouTube | .138 | :7000/agent/social-youtube | Claude | ✅ |
| 4 | Video Creation | .138 | :7000/agent/video, /agent/video-creation | Claude | ✅ |
| 5 | UI/UX Strategy | .138 | :7000/agent/ui-ux | Claude | ✅ |
| 6 | Chart Architect | .138 | :7000/agent/chart-architect | Claude | ✅ |
| 7 | Reading | .138 | :7000/agent/reading | Claude | ⚠️ Placeholder ohne API-Key |
| 8 | Reflection | .138 | :7000/agent/reflection | Claude | ✅ |
| 9 | Shadow Work | .138 | :7000/agent/shadow-work | Claude | ✅ |
| 10 | Relationship | .138 | :7000/agent/relationship | Claude | ✅ |
| 11 | Transit Insights | .138 | :7000/agent/transit | Claude | ✅ |
| 12 | Business HD | .138 | :7000/agent/business-hd | Claude | ✅ |
| 13 | Emotions | .138 | :7000/agent/emotions | Claude | ✅ |
| 14 | Health & Wellness | .138 | :7000/agent/health | Claude | ✅ |
| 15 | Geld & Überfluss | .138 | :7000/agent/abundance | Claude | ✅ |
| 16 | HD Relationship | .167 | UI-only | — | ✅ UI |

**Vom Frontend (.167 `/api/agents/*`) erwartet, aber OHNE dedizierte Gateway-Route (→ 404, siehe `AGENTEN_404_FEHLER_ANALYSE.md`):**

| Agent | Frontend-Route (.167) | Gateway-Route (.138) | Status |
|-------|----------------------|----------------------|--------|
| Chart Analysis | `/api/agents/chart` | ❌ `/agent/chart` fehlt | ❌ |
| Yearly Analysis | `/api/agents/yearly` | ❌ `/agent/yearly` fehlt | ❌ |
| Automation Strategy | `/api/agents/automation` | ❌ `/agent/automation` fehlt | ❌ |
| Depth Analysis | `/api/agents/depth-analysis` | ❌ `/agent/depth-analysis` fehlt | ❌ |
| Task Planning | `/api/agents/tasks` | ❌ `/agent/tasks` fehlt | ❌ TODO |

> Hinweis: `chart`, `automation`, `chart`(Analyse) etc. haben zwar System-Prompts in
> `AGENT_SYSTEM_PROMPTS`, aber keine registrierte HTTP-Route. Sie müssten entweder als
> dedizierte `/agent/*`-Route ergänzt oder über `/agents/run` (MCP-Core) bedient werden.

### Reading-Templates (22 Stück auf .138)

```
basic, business, career, compatibility, connection, default,
depth-analysis (NEU/untracked), detailed, emotions, health,
jahres-reading, life-purpose, parenting, penta, reflection-profiles,
reflection, relationship, sexuality, shadow-work, spiritual
```

---

## 10. DATENBANK

### Supabase (Extern — Postgres-as-a-Service)

| Property | Wert |
|----------|------|
| URL | `https://wdiadklhvhlndnjojrfu.supabase.co` |
| Schemas | `public` (V3), `v4` (V4) |
| Edge Functions | `check-reading-timeouts` |

### Tabellen — public Schema

| Tabelle | Beschreibung |
|---------|-------------|
| `readings` | Alle Readings (chart_data, reading_data, birth_data, status, progress) |
| `coach_readings` | Coach-Readings (pending/completed) |
| `reading_history` | Version-History (reading_id, version_num, previous_data) |
| `charts` | Chart-Daten |
| `readings_shares` | Geteilte Readings |
| `coaches` | Coach-Profile |
| `chats` | Chat-Conversations |
| `messages` | Chat Messages |
| `journal_entries` | Journal Entries |

### Tabellen — v4 Schema

| Tabelle | Beschreibung |
|---------|-------------|
| `reading_jobs` | Async Job Queue (pending/processing/completed/failed) |
| `reading_results` | Job Results (result_text, metadata) |
| `evolution_analyses` | Evolution Analysis |
| `mcp_usage` | MCP Server Usage Tracking |

### Redis

| Instanz | Server | Port | Container | Zweck | Status |
|---------|--------|------|-----------|-------|--------|
| Docker-Redis | .138 | 6379 intern | redis-queue-secure | BullMQ (51 Keys) | ✅ |
| System-Redis | .138 | 127.0.0.1:6379 | systemd | ⚠️ Unklar — prüfen | ⚠️ |
| Docker-Redis | .167 | 6379 intern | redis | Cache | ✅ |

---

## 11. DESIGN-SYSTEM (.167)

### Status: **MUI — vollständig** (Tailwind entfernt in Commit `35a75bd76`)

### Theme (frontend-coach/styles/theme.ts)

```
Primary:     #F29F05  (Orange/Flame)
Secondary:   #8C1D04  (Dark Red)
Background:  #030200  (Almost Black)
Font:        Inter, system-ui

MuiButton contained:  linear-gradient(135deg, #F29F05, #8C1D04)
MuiPaper:             Glassmorphism (rgba borders, backdrop-filter)
MuiCard:              Glass + Gold border
```

### UI-Stack

| Kategorie | Technologie |
|-----------|------------|
| Component Library | MUI (`@mui/material` + `@emotion`) |
| Animationen | `framer-motion` |
| 3D | `three.js` (Bodygraph) |
| PDF Export | `html2canvas` + `jspdf` |
| QR Codes | `qrcode` |
| Icons | MUI Icons |

### Frontend-Seiten

**Coach Portal (frontend-coach, aktiv):**
```
/dashboard               Coach Dashboard
/login                   Login
/tagesimpuls             Tagesimpuls-Generator
/agents/**               18 Agent-Seiten
/readings-v4             V4 Readings Browser
/readings-v4/[id]        Reading Detail
/readings-v4/[id]/edit   Reading Editor
/readings-v4/[id]/chart  Chart Visualization
/readings/transit        Transit Reading
/readings/jahres         Jahres Reading
/live-reading            Live Session List
/live-reading/[id]       Active Session
/admin                   Admin Panel
```

**Hauptfrontend (frontend, v3 — Legacy):**
```
/login, /register, /logout
/profil, /profil/edit, /profil-einrichten
/bodygraph, /gates, /channels, /centers, /lines, /planets/*
/readings, /readings/[id]
/connection-key/*, /connection-code/*
/coach, /coach/dashboard
/agents/* (5 Agenten)
/community, /community/friends, /community/profile/[username]
/dating, /dating/chat/[id], /moon-dating
/mondkalender, /mondphasen-verstehen
/preise, /preise-penta, /pricing, /pricing-hd
/resonanzanalyse/*
/buchung/dankeseiten/* (9 Varianten)
```

### Komponenten (frontend-coach/components/)

```
ProtectedRoute.tsx          Auth Guard
CoachNavigation.tsx         Navigation
ReadingContextSelector.tsx  Context Selection
LogoWithFlames.tsx          Logo
AgentChat.tsx               Chat Interface
AgentTasksDashboard.tsx     Task Management
MultiPersonForm.tsx         Multi-Person Input
ReadingPDFContent.tsx       PDF Generator
PsychologyReadingPanel.tsx  Psychology
TransitReadingPanel.tsx     Transit
JahresReadingPanel.tsx      Yearly
ShadowWorkPanel.tsx         Shadow Work
SalesWorkflow.tsx           Sales
AutomationWorkflow.tsx      Automation
UIUXWorkflow.tsx            UI/UX
VideoWorkflow.tsx           Video
SocialWorkflow.tsx          Social Media
MarketingWorkflow.tsx       Marketing
```

---

## 12. VERSIONIERUNG (V3 / V4)

| Version | Status | Server | Schema | Beschreibung |
|---------|--------|--------|--------|-------------|
| V3 | ✅ Aktiv | .138 | `public` | Orchestrator, 4 Agenten, `readings-v3` Routes |
| V4 | ✅ Aktiv | .138 + .167 | `v4` | BullMQ Queues, spezialisierte Workers, Coach-Portal |
| V3 alt (production/) | ⚠️ Inaktiv | .138 | — | Standalone, nicht im Docker |
| V3 API Server | ⚠️ Inaktiv | .167 | — | Legacy, nie gestartet |
| V4 worker (v4-reading-worker/) | 🗑️ Leer | .138 | — | Leeres Verzeichnis |

**ENV-Steuerung:** `SUPABASE_V4_SCHEMA=v4`

---

## 13. EXTERNE SERVICES & API-KEYS

| Service | Zweck | Keys in .env | Server | Status |
|---------|-------|-------------|--------|--------|
| Anthropic | Claude Sonnet 4.6 | `sk-ant-api***` | .138 | ✅ |
| OpenAI | Fallback gpt-4o | `sk-proj-YV***` | .138 | ✅ |
| Stripe | Zahlungen (LIVE!) | `sk_live_51***`, `pk_live_51***`, Webhook | .138 + .167 | ✅ ⚠️ |
| Supabase | Postgres DB + Auth | URL + Keys | .138 + .167 | ✅ |
| n8n | Workflows | JWT Token | .138 + .167 | ✅ |
| Resend | E-Mail-Versand | `RESEND_API_KEY` | .167 | ❌ FEHLT! |
| Mattermost | Workshop-Anmelde-Benachrichtigungen (Incoming-Webhook) | `MATTERMOST_WEBHOOK_WORKSHOPS` | .167 | ✅ |
| Let's Encrypt | SSL | certbot | .138 + .167 | ✅ |

**13 Stripe Price IDs** konfiguriert (Basic, Premium, VIP, Connection-Key 1/3/5er, Penta, HD-Readings).

### Domains

| Domain | Server | Port | Zweck | Status |
|--------|--------|------|-------|--------|
| `the-connection-key.de` | .167 | 3000 | Hauptseite | ✅ |
| `coach.the-connection-key.de` | .167 | 3002 | Coach-Portal | ✅ |
| `agent.the-connection-key.de` | .167 | 4000 | Agent-UI | ✅ (gefixt 2026-06-07) |
| `werdemeisterdeinergedankenagent.de` | .138 | 3000 | API-Domain | ✅ |
| `n8n.werdemeisterdeinergedankenagent.de` | .138 | 5678 | n8n | ⚠️ kein SSL |

---

## 14. SYSTEM-RESSOURCEN (.138)

| Resource | Wert | Bewertung |
|----------|------|-----------|
| CPU | 3 Kerne | OK |
| RAM | 3.7 GiB (1.5 GiB genutzt, 2.2 GiB Cache) | ⚠️ |
| Swap | 4 GB Swapfile (`/swapfile`, fstab, `vm.swappiness=10`) | ✅ (eingerichtet 2026-06-02) |
| Disk | 75 GB (41 GB, 57%) | OK |
| OS | Ubuntu 24.04, Kernel 6.8 | ✅ |

---

## 15. KRITISCHE PROBLEME

### 🔴 P0 — Sofort

| # | Problem | Server |
|---|---------|--------|
| 1 | ✅ **ERLEDIGT (2026-05-27):** Auth aktiv für alle `/api`-Routen (`x-api-key` + Supabase-JWT), `AUTH_ENABLED` Default `true` | .138 |
| 2 | ✅ **ERLEDIGT:** Token-Verifikation via Supabase-JWT implementiert (`auth.js`). Offen nur: eigener JWT-Secret-Flow (`JWT_SECRET` in config.js, aktuell ungenutzt für Verifikation) | .138 |
| 3 | Stripe LIVE-Modus aktiv — durch aktivierte Auth jetzt geschützt, aber LIVE-Keys + Webhook-Signatur prüfen/rotieren | .138 |

### 🟠 P1 — Dringend

| # | Problem | Server |
|---|---------|--------|
| 4 | Ports 3000, 4000, 7001 öffentlich ohne HTTPS | .138 |
| 5 | ✅ **ERLEDIGT (2026-06-07):** `agent.the-connection-key.de` → 200; Host-Nginx (`sites-enabled/agent`) leitet jetzt korrekt auf `127.0.0.1:4000` (ck-agent) | .167 |
| 6 | `138.199.237.34` hardcoded in **50+ Dateien** auf .167 | .167 |
| 7 | `generateReading.js` auf .167 ist ein **STUB** (11 Zeilen, wirft Fehler) | .167 |
| 8 | ✅ **ERLEDIGT:** Working Tree sauber, alle Änderungen committet | .138 |
| 9 | CORS nicht auf Produktionsdomain: Code-Default = localhost-Liste (`config.js`), `docker-compose.yml` überschreibt mit `CORS_ORIGINS:-*` (zu offen) → auf `the-connection-key.de` setzen | .138 |
| 10 | `RESEND_API_KEY` fehlt — E-Mail-Versand kaputt | .167 |
| 11 | TypeScript Fehler ignoriert (`ignoreBuildErrors=true`) | .167 |

### 🟡 P2 — Wichtig

| # | Problem | Server |
|---|---------|--------|
| 12 | System-Redis parallel zu Docker-Redis | .138 |
| 13 | ✅ **ERLEDIGT (2026-06-02):** 4 GB Swap + `vm.swappiness=10` auf .138 (und .167) eingerichtet | .138 |
| 14 | v4-worker auf .167 definiert aber gehört auf .138 | .167 |
| 15 | ✅ **ERLEDIGT:** `sync-reading-service` ist in `docker-compose.yml` (braucht ggf. noch Supabase-ENV) | .138 |
| 16 | n8n ohne SSL | .138 |
| 17 | TODOs/Platzhalter in kritischen Pfaden: `mcp-gateway.js:312` (`/agents/reading` Platzhalter), `services/chart-truth/chartTruthService.ts` (Swiss-Ephemeris-STUB) | .138 |
| 18 | ✅ **ERLEDIGT:** `depth-analysis.txt`/Reading-Templates committet | .138 |
| 19 | Dual-Nginx auf .167 (Host + Docker parallel) | .167 |
| 20 | `bull:reading-v4-queue` Duplikat-Namespace | .138 |

---

## 16. AUFRÄUM-LISTE

### 🔴 HIGH PRIORITY

| Was | Server | Aktion |
|-----|--------|--------|
| ✅ ~~AUTH_ENABLED auf true + JWT implementieren~~ | .138 | **Erledigt** — Auth (API-Key + Supabase-JWT) aktiv |
| CORS auf `the-connection-key.de` setzen | .138 | `CORS_ORIGINS` env auf Produktionsdomain (statt `*`) |
| `/agent/chart`, `/agent/yearly`, `/agent/automation`, `/agent/depth-analysis`, `/agent/tasks` ergänzen | .138 | Fehlende Gateway-Routen → behebt 404er (`AGENTEN_404_FEHLER_ANALYSE.md`) |
| `/agents/reading`-Platzhalter durch echte Generierung ersetzen | .138 | `mcp-gateway.js:302-316` |
| ✅ ~~Host-Nginx agent Config fixen (3005→4000)~~ | .167 | **Erledigt (2026-06-07)** — `sites-enabled/agent` → 4000, 200 |
| IP-Hardcoding durch ENV-Variablen ersetzen (50+ Dateien) | .167 | `V4_BACKEND_URL`, `READING_AGENT_URL`, `MCP_SERVER_URL` |
| `generateReading.js` STUB durch echte Engine ersetzen | .167 | Von .138 kopieren ODER v4-worker auf .138 deployen |
| ✅ ~~`sync-reading-service` in docker-compose.yml aufnehmen~~ | .138 | **Erledigt** (Supabase-ENV ggf. ergänzen) |
| `RESEND_API_KEY` setzen | .167 | API-Key beschaffen und in .env |
| ✅ ~~Uncommitted Changes committen~~ | .138 | **Erledigt** — Working Tree sauber |

### 🟡 MEDIUM PRIORITY

| Was | Server | Aktion |
|-----|--------|--------|
| System-Redis deaktivieren | .138 | `systemctl disable redis-server` |
| Ungenutzte UFW-Ports schließen (3005, 3456, 4001) | .138 | `ufw delete allow` |
| ✅ ~~Swap-Space einrichten (2-4 GB)~~ | .138 | **Erledigt** — 4 GB `/swapfile`, swappiness 10 (.138 + .167) |
| n8n hinter HTTPS | .138 | Nginx-Proxy Config |
| Dual-Nginx auflösen | .167 | Host-Nginx direkt auf Docker-Container |
| Dangling Docker Images | .167 | `docker image prune` (~13.7 GB) |
| Veraltete Docker Images | .138 | ~10 Images, ~3-4 GB |
| TypeScript `ignoreBuildErrors` entfernen | .167 | Fehler fixen |
| Duplikat-Queue `bull:reading-v4-queue` prüfen | .138 | Konsolidieren |
| Committete Build-Artefakte entfernen | .138 | `frontend/.next/` ist eingecheckt (`.next` fehlt in `.gitignore`) → `.gitignore` ergänzen + `git rm -r --cached frontend/.next` |

### 🟢 LOW PRIORITY

| Was | Server | Dateien |
|-----|--------|---------|
| Backup-Dateien löschen | .167 | `ck-agent/server.js.backup*` (15+), `api-backup/` (16), `server-v6.js` + Parts |
| Archive löschen | .167 | `archive/`, `_archive_docs/`, `_temp/` |
| Altlast-Verzeichnisse | .138 | `_ARCHIVE_OLD_SCRIPTS/`, `reading-worker-backup-old/`, `v4-reading-worker/` (leer), `gateway/`, `mcp-gateway/` (nur node_modules) |
| Backup-Dateien | .138 | `mcp-gateway.js.OLD`, `chartCalculation.js.backup` |
| ⚠️ Concern-Vermischung im Backend-Repo (**unter Vorbehalt — vor Löschen verifizieren**) | .138 | `frontend/` (Next.js `connection-key-frontend`, 436 Dateien, Docker-Service auskommentiert) + `integration/` (~275 Dateien, fast nur MD-Anleitungen/Deploy-Skripte: `FIX_*`, `QUICK_*`, `INSTALL_*`, `DEPLOY_*`) liegen im .138-Backend-Repo, gehören laut Goldener Regel auf .167 bzw. sind einmalige Migrations-Notizen. **Nicht blind löschen:** prüfen, ob `frontend/` noch als Quelle/Referenz dient und ob `integration/api-routes`+`lib`+`services` schon nach .167 übernommen wurden. |
| Legacy prüfen | .167 | `frontend/` (v3) + `v3-api-server/` — Migrationsplan |
| Docker-Images | .138 | `chatgpt-agent` (2×287 MB), `v3-api-server`, `reading-worker-v4`, `connection-key-img` |
| Docker-Volumes | .138 | `n8n_data` Duplikat, 4× anonyme Volumes |
| Dockerfile cleanup | .167 | `Dockerfile.backup-legacypeer`, `Dockerfile.utf8` |

---

## 17. ENVIRONMENT-VARIABLEN (.167)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL          # Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Supabase Anon Key
SUPABASE_SERVICE_ROLE_KEY         # Supabase Service Role
V3_SUPABASE_SERVICE_KEY           # V3 Compat Key

# Auth
JWT_SECRET                        # JWT Signing
AGENT_SECRET                      # Agent Auth
AGENT_SYSTEM_TOKEN                # System Token

# APIs
OPENAI_API_KEY                    # OpenAI
ANTHROPIC_API_KEY                 # Anthropic/Claude
CONNECTION_KEY_API_KEY            # Connection Key
MCP_API_KEY                       # MCP Gateway Auth
V4_MCP_API_KEY                    # V4 MCP Auth

# URLs (→ .138)
V4_BACKEND_URL=http://138.199.237.34:3000     # ⚠️ Hardcoded!
READING_AGENT_URL=http://138.199.237.34:4000   # ⚠️ Hardcoded!
MCP_SERVER_URL=http://138.199.237.34:7000      # ⚠️ Hardcoded!
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_CK_AGENT_URL
NEXT_PUBLIC_MCP_API_URL
CK_AGENT_URL

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_BASIC_PRICE_ID / PREMIUM / VIP

# Email
RESEND_API_KEY                    # ❌ FEHLT — E-Mail kaputt!
RESEND_FROM_DOMAIN
RESEND_FROM_NAME

# Mattermost (Workshop-Anmelde-Benachrichtigungen)
MATTERMOST_WEBHOOK_WORKSHOPS      # Incoming-Webhook-URL (Secret) — bei bestätigter Workshop-Anmeldung
                                  # ⚠️ Gehört ins ROOT-.env (env_file der frontend-Compose), NICHT frontend/.env!
                                  # Nach Änderung: docker compose up -d frontend (recreate, kein Rebuild für Server-ENV)

# Redis / Monitoring / Node
REDIS_HOST / PORT / PASSWORD
GRAFANA_PASSWORD
PROMETHEUS_RETENTION
NODE_ENV / NODE_OPTIONS / TSC_COMPILE_ON_ERROR
```

---

## 18. TECHNOLOGIE-STACK

### Server .138

| Kategorie | Technologie |
|-----------|------------|
| Runtime | Node.js 20 (Alpine) |
| API | Express.js |
| Queue | BullMQ + ioredis |
| AI SDK | `@anthropic-ai/sdk@0.78`, `openai@4.28` |
| Astro-Engine | `swisseph` (C-Addon, Swiss Ephemeris), `astronomy-engine` |
| DB | `@supabase/supabase-js` |
| Payments | `stripe` (LIVE!) |
| Automation | n8n |
| Container | Docker Compose |
| Reverse Proxy | Nginx (systemd, Host-Level) |
| SSL | Let's Encrypt (certbot, auto-renewal) |

### Server .167

| Kategorie | Technologie |
|-----------|------------|
| Runtime | Node.js (Alpine) |
| Framework | Next.js 14 (App Router) |
| UI | MUI (`@mui/material` + `@emotion`) — Tailwind komplett entfernt |
| Animationen | `framer-motion` |
| 3D | `three.js` |
| DB Client | `@supabase/ssr`, `@supabase/supabase-js` |
| Payments | `stripe`, `@stripe/stripe-js` |
| PDF | `html2canvas` + `jspdf` |
| QR | `qrcode` |
| E-Mail | Resend (API-Key fehlt!) |
| Shared Code | `@ck/shared` (packages/shared/) |
| Monitoring | Grafana + Prometheus + Node Exporter + AlertManager + Redis Exporter |
| Container | Docker Compose (10 Services) |
| Reverse Proxy | Nginx (Docker) + Host-Nginx (⚠️ Dual) |
| SSL | Let's Encrypt |
| CI/CD | GitHub Actions |

---

*Letzte Aktualisierung: 2026-05-27 (Code-Abgleich .138 gegen tatsächlichen Repo-Stand)*
*Quellen: SERVER_138_SYSTEMANALYSE_2026-03-27.md + SYSTEM_ANALYSE.md (.167) + Live-Code-Analyse .138*

