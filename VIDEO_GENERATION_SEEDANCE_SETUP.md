# Video-Generierung mit Runway / Seedance 2.0 — Setup

Echte Video-Generierung (nicht nur Skripte) für The Connection Key. Zwei Wege nutzen
denselben Modell-Identifier **`seedance2`** über die Runway-API:

1. **Standalone Claude-Skill** — `.claude/skills/runway-seedance-video/` (ad-hoc aus Claude Code)
2. **Backend-Integration** — `mcp-gateway` (.138) + Coach-Portal-Proxy (.167)

> Bestehender `production/agent-video.js` (`/agent/video`) bleibt unverändert — er
> erzeugt weiterhin nur **Text** (Skripte, Storyboards). Neu ist `agent-video-generation.js`
> für fertige **Videodateien**.

---

## 1. API-Key (Runway)

Key im [Runway Developer Portal](https://dev.runwayml.com) erzeugen, Credits aufladen.

**Server .138** — in `/opt/mcp-connection-key/.env`:
```bash
RUNWAYML_API_SECRET=key_xxx
RUNWAY_VIDEO_MODEL=seedance2   # optional, Default
```
`docker-compose.yml` reicht beide an den `mcp-gateway`-Container weiter (bereits ergänzt).

---

## 2. Backend (.138)

Neu/geändert in diesem Repo:
- `production/agent-video-generation.js` — Handler (Runway SDK, Modell `seedance2`)
- `mcp-gateway.js` — Routen registriert
- `Dockerfile.mcp-gateway` — kopiert den Handler als `.cjs`
- `package.json` / `package-lock.json` — Dependency `@runwayml/sdk`
- `docker-compose.yml` — `RUNWAYML_API_SECRET`, `RUNWAY_VIDEO_MODEL`

**Endpunkte (Port 7000):**

| Methode | Pfad | Zweck |
|--------|------|------|
| POST | `/agent/video/generate` | Startet Generierung → `{ taskId, status }` (wartet NICHT auf Fertigstellung) |
| GET | `/agent/video/status/:taskId` | Pollt Status → bei `SUCCEEDED`: `{ output: [url] }` |

**Request-Body `/agent/video/generate`:**
```jsonc
{
  "mode": "text",                 // text | image | reference
  "prompt": "Sonnenaufgang über den Bergen, langsame Kamerafahrt",
  "images": ["https://…/a.jpg"],  // bei image/reference: HTTPS-URLs oder base64 data URIs
  "ratio": "1280:720",            // optional
  "duration": 5                    // optional (Sekunden)
}
```

**Deploy auf .138:**
```bash
cd /opt/mcp-connection-key
git fetch origin && git checkout <branch-oder-main-nach-merge> && git pull
docker compose up -d --build mcp-gateway
# Smoke-Test:
curl -s http://localhost:7000/health
```

> ⚠️ **Sicherheit:** Die `/agent/*`-Routen sind aktuell **ohne** eigene Auth (bestehendes
> Muster, in CLAUDE.md als P1 vermerkt). Da `/agent/video/generate` **echte Credits**
> verbraucht, sollte der Port 7000 nicht öffentlich erreichbar sein bzw. die Route hinter
> Auth gelegt werden. Empfehlung: über die .167-Proxy-Route + Nginx kapseln, 7000 per
> Firewall nur intern.

---

## 3. Frontend / Coach-Portal (.167, Repo `Heiko888/The-Connection-Key`)

Proxy-Routen liegen als Staging in
`integration/api-routes/app-router/agents/video-generation/` und gehören nach
`frontend-coach/app/api/agents/video-generation/`:

| Staging-Datei (`integration/...`) | Ziel in `frontend-coach/` |
|------|------|
| `api-routes/app-router/agents/video-generation/route.ts` | `app/api/agents/video-generation/route.ts` (`POST`) |
| `api-routes/app-router/agents/video-generation/status/[taskId]/route.ts` | `app/api/agents/video-generation/status/[taskId]/route.ts` (`GET`) |
| `frontend/components/VideoGenerationPanel.tsx` | `components/VideoGenerationPanel.tsx` (MUI-UI: Formular + Polling + Player) |
| `frontend/app/coach/agents/video-generation/page.tsx` | `app/coach/agents/video-generation/page.tsx` (Seite `/coach/agents/video-generation`) |

Benötigt `MCP_SERVER_URL` (bereits in .167-ENV vorhanden, → `:7000`). Nach dem Kopieren
`frontend-coach` neu bauen (siehe Skill `deploy-167`).

**UI-Flow (Polling) — Minimalbeispiel:**
```ts
// 1) Generierung starten
const start = await fetch('/api/agents/video-generation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mode: 'text', prompt, ratio: '1280:720', duration: 5 }),
}).then(r => r.json());

// 2) Status pollen, bis fertig
async function poll(taskId: string): Promise<string> {
  for (;;) {
    const s = await fetch(`/api/agents/video-generation/status/${taskId}`).then(r => r.json());
    if (s.status === 'SUCCEEDED') return s.output[0];      // Video-URL
    if (s.status === 'FAILED') throw new Error(s.error);
    await new Promise(r => setTimeout(r, 5000));
  }
}
const videoUrl = await poll(start.taskId);
```

> Die Runway-Output-URL läuft nach einiger Zeit ab → für dauerhafte Nutzung in
> Supabase Storage (oder lokal) sichern.

---

## 4. Standalone-Skill (Alternative, ohne Backend)

Siehe `.claude/skills/runway-seedance-video/SKILL.md`. Auf .138:
```bash
cd /opt/mcp-connection-key/.claude/skills/runway-seedance-video && npm install
node --env-file=/opt/mcp-connection-key/.env generate.mjs --mode text --prompt "…" --dry-run
```

---

## Verifikation
- `curl http://localhost:7000/health` → `{ status: "ok" }`
- `POST /agent/video/generate` (mode text) → `taskId` zurück
- `GET /agent/video/status/:taskId` mehrfach → `RUNNING` → `SUCCEEDED` mit `output`
- Coach-Portal: Prompt eingeben → nach ~1–3 min spielt das Video
