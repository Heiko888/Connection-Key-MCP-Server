# Video-Generierung mit Runway / Seedance 2.0 — Setup

Echte Video-Generierung (nicht nur Skripte) für The Connection Key. Alle Wege nutzen
denselben Modell-Identifier **`seedance2`** über die Runway-API.

| Weg | Wo | Persistenz | Einsatz |
|-----|----|-----------|---------|
| **A) Standalone Claude-Skill** | `.claude/skills/runway-seedance-video/` | lokal als `.mp4` | ad-hoc aus Claude Code |
| **B) Gateway-MVP** | `mcp-gateway` (.138:7000) | ❌ Runway-URL läuft ab | einfacher Direkt-Aufruf |
| **C) Worker (persistent)** ⭐ | `reading-worker` (.138:4000) + `video-queue` | ✅ Supabase Storage + `video_jobs` | Coach-Portal, Produktion |

> Der bestehende `production/agent-video.js` (`/agent/video`) bleibt unverändert — er
> erzeugt weiterhin nur **Text** (Skripte/Storyboards).

---

## 1. API-Key (Runway)

Key im [Runway Developer Portal](https://dev.runwayml.com) erzeugen, Credits aufladen.
**Server .138** — in `/opt/mcp-connection-key/.env`:
```bash
RUNWAYML_API_SECRET=key_xxx
RUNWAY_VIDEO_MODEL=seedance2   # optional, Default
```
`docker-compose.yml` reicht die Variablen sowohl an `mcp-gateway` als auch an
`reading-worker` weiter (bereits ergänzt).

---

## 2. Datenbank (Supabase, bereits angelegt)

In Projekt `connection-key-v3` (`wdiadklhvhlndnjojrfu`) wurde per Migration angelegt:
- Tabelle **`public.video_jobs`** (Job-Tracking: status, progress, video_url, error, retry …)
- Storage-Bucket **`generated-videos`** (public) für die fertigen `.mp4`-Dateien

RLS: Service-Role (Backend/Worker) voller Zugriff; eingeloggte User dürfen ihre eigenen Jobs lesen.

---

## 3. Weg C — Persistenter Worker-Pfad ⭐ (empfohlen)

**Ablauf:** `POST /api/videos/generate` (reading-worker) → legt `video_jobs`-Row an +
enqueued in BullMQ-Queue **`video-queue`** → `video-worker` ruft Runway auf, pollt,
**lädt das Video herunter und speichert es permanent** im Bucket `generated-videos`,
schreibt `status`/`video_url` zurück. Client pollt `GET /api/videos/:id`.

Neu in diesem Repo:
- `reading-worker/workers/video-worker.js` — BullMQ-Worker (Runway SDK + Storage-Upload)
- `reading-worker/server.js` — `startVideoWorker()` + Routen `/api/videos/generate`, `/api/videos/:id`
- `reading-worker/package.json` — Dependency `@runwayml/sdk`
- `docker-compose.yml` — `RUNWAYML_API_SECRET`, `RUNWAY_VIDEO_MODEL`, `VIDEO_TIMEOUT_MS` für `reading-worker`

**Endpunkte (Port 4000):**

| Methode | Pfad | Zweck |
|--------|------|------|
| POST | `/api/videos/generate` | Job anlegen + enqueuen → `202 { jobId }` |
| GET | `/api/videos/:id` | Status → bei `completed`: `{ video_url }` (permanent) |

**Request-Body `/api/videos/generate`:**
```jsonc
{
  "mode": "text",                       // text | image | reference
  "prompt": "Sonnenaufgang, Kamerafahrt",
  "shots": ["Szene 1 …", "Szene 2 …"], // Multi-Shot (optional; ersetzt prompt, Dauer skaliert)
  "images": ["https://…/a.jpg"],        // bei image/reference (HTTPS-URLs oder base64)
  "ratio": "1280:720",                  // optional
  "duration": 5,                         // optional (ohne shots)
  "userId": "…", "coachId": "…"         // optional
}
```

**Multi-Shot (Seedance 2.0 Langform):** `shots[]` wird zu einem strukturierten Prompt
("Shot 1: … / Shot 2: …") zusammengesetzt, die Gesamtdauer skaliert (≈5s je Shot, max 30s).

**Deploy auf .138:**
```bash
cd /opt/mcp-connection-key
git checkout main && git pull
docker compose up -d --build reading-worker
curl -s http://localhost:4000/health || true
# Smoke-Test:
curl -s -X POST http://localhost:4000/api/videos/generate \
  -H 'Content-Type: application/json' \
  -d '{"mode":"text","prompt":"Sonnenaufgang über den Bergen"}'   # → { jobId }
curl -s http://localhost:4000/api/videos/<jobId>                   # status pollen
```

---

## 4. Weg B — Gateway-MVP (.138:7000, ohne Persistenz)

`POST /agent/video/generate` → `{ taskId }`, `GET /agent/video/status/:taskId` →
bei `SUCCEEDED` `{ output: [runway-url] }` (URL läuft ab!). Gut für schnelle Tests.
Deploy: `docker compose up -d --build mcp-gateway`.

> ⚠️ **Sicherheit:** `/agent/*` ist ohne eigene Auth. Da hier echte Credits verbraucht
> werden: Port 7000 intern halten / hinter Proxy + Auth. Der Worker-Pfad (Weg C) ist
> über `:4000` ebenfalls intern zu halten und nur über die .167-Proxy-Route erreichbar.

---

## 5. Frontend / Coach-Portal (.167, Repo `Heiko888/The-Connection-Key`)

Staging unter `integration/...` → kopieren nach `frontend-coach/`:

| Staging-Datei (`integration/...`) | Ziel in `frontend-coach/` |
|------|------|
| `api-routes/app-router/agents/video-generation/route.ts` | `app/api/agents/video-generation/route.ts` (`POST`) |
| `api-routes/app-router/agents/video-generation/status/[jobId]/route.ts` | `app/api/agents/video-generation/status/[jobId]/route.ts` (`GET`) |
| `frontend/components/VideoGenerationPanel.tsx` | `components/VideoGenerationPanel.tsx` (MUI: Formular + Multi-Shot + Polling + Player) |
| `frontend/app/coach/agents/video-generation/page.tsx` | `app/coach/agents/video-generation/page.tsx` (`/coach/agents/video-generation`) |

Proxy nutzt `READING_AGENT_URL` (→ `:4000`, bereits in .167-ENV). Nach dem Kopieren
`frontend-coach` neu bauen (Skill `deploy-167`).

---

## 6. Weg A — Standalone-Skill (ohne Backend)

Siehe `.claude/skills/runway-seedance-video/SKILL.md`. Auf .138:
```bash
cd /opt/mcp-connection-key/.claude/skills/runway-seedance-video && npm install
node --env-file=/opt/mcp-connection-key/.env generate.mjs --mode text --prompt "…" --dry-run
```

---

## Verifikation (Weg C)
- `docker compose up -d --build reading-worker` → Log zeigt `🟢 Video Worker aktiv (Queue: video-queue …)`
- `POST /api/videos/generate` → `{ jobId }`; Row in `video_jobs` (status `pending`→`generating`→`completed`)
- `GET /api/videos/:id` liefert am Ende `video_url` (Datei liegt im Bucket `generated-videos`)
- Coach-Portal `/coach/agents/video-generation`: Prompt/Shots eingeben → Video erscheint und ist dauerhaft abrufbar
