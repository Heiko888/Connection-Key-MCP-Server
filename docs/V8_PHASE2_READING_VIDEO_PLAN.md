# v8 Phase 2 — Reading → Video (Implementierungsplan)

**Stand:** 2026-06-17 | **Status:** Plan (noch nicht gebaut)
**Vorgänger:** v8 Phase 1 (Voice-Reading, ElevenLabs/OpenAI → MP3) ist gebaut.
**Roadmap:** `docs/READING_EVOLUTION_ROADMAP.md` (v8).

## Entscheidungen (mit Heiko abgestimmt)

1. **Render-Ansatz: ffmpeg-Slideshow** auf .138 (kein Remotion/Chromium, kein Runway-Hybrid).
   Begründung: leicht, robust, günstig, läuft im RAM-Budget (.138 = 3.7 GB), keine neue
   Schwergewichts-Infra. Runway/Seedance löst „mehrminütiger narrierter Reading-Film" **nicht**
   (generative Clips sind kurz & prompt-getrieben).
2. **Bodygraph: chart-spezifisch sofort** — serverseitig gerendertes SVG→PNG mit den **echten
   Toren/Kanälen/Zentren der Person** (nicht das generische Asset).

## Grundidee

```
reading_id
   │
   ├─(1) Voiceover  → bestehende v8-Phase-1-Audio-Pipeline (audio_jobs, MP3 + Dauer)
   │
   ├─(2) Visuals
   │      ├─ Bodygraph  (chart_data → SVG → PNG, chart-spezifisch)
   │      ├─ Titelkarte (Name, Reading-Typ, Datum, Branding)
   │      └─ Abschnitts-Slides (reading_data.text → paginierte Text-Slides als SVG→PNG)
   │
   ├─(3) Timing      → Audiodauer proportional zur Textlänge auf die Slides verteilen
   │
   └─(4) ffmpeg      → Slides (Ken-Burns/zoompan + xfade) + Audiospur → MP4 (H.264/AAC)
                       → permanent in Storage-Bucket, Status in reading_video_jobs
```

Der **Voiceover ist bewusst der Phase-1-Baustein** — Phase 2 erzeugt keine eigene TTS, sondern
nutzt/erzeugt einen `audio_jobs`-Eintrag und legt das fertige MP3 als Tonspur unter die Slides.

## Architektur-Bausteine

### Backend (.138, `reading-worker`)

| Baustein | Datei | Zweck |
|----------|-------|-------|
| Docker-Image | `reading-worker/Dockerfile` | `apk add --no-cache ffmpeg ttf-dejavu` (Fonts für Render); Image wird größer |
| Dependency | `package.json` | `@resvg/resvg-js` (SVG→PNG, musl/alpine-Prebuilts, zuverlässiger als sharp-SVG). ffmpeg via `child_process.spawn` (kein fluent-ffmpeg nötig) |
| Bodygraph-Renderer | `reading-worker/lib/bodygraph-svg.js` | **Port** von `.167 frontend/lib/hd-bodygraph/data.ts` (CENTERS/CHANNELS/GATES-Geometrie) → baut SVG-String aus `chart_data` (aktive Tore/Kanäle/definierte Zentren), `@resvg/resvg-js` → PNG |
| Slide-Renderer | `reading-worker/lib/slides.js` | Titelkarte + Abschnitts-Text-Slides als SVG→PNG (saubere Typo/Umbruch via SVG statt ffmpeg `drawtext`) |
| Composer | `reading-worker/lib/video-compose.js` | ffmpeg-Orchestrierung: concat-Demuxer mit Per-Slide-Dauer + `zoompan` (Ken-Burns) + `xfade` (Crossfade) + Audio-Mux → MP4 (1080p/H.264, `-preset veryfast`, begrenzte Threads) |
| Worker | `reading-worker/workers/reading-video-worker.js` | BullMQ-Queue `reading-video-queue`; persistenter Row-Pattern (wie audio/video/psychology). Flow: Audio-Job sicherstellen → auf `completed` warten → Bodygraph+Slides rendern → Timing → compose → upload → `reading_video_jobs` fortschreiben |
| Endpunkte | `reading-worker/server.js` | `POST /api/reading-video/generate` (`{reading_id, voiceId?, ratio?, options?, userId}`, Fast-Fail wenn weder OpenAI- noch ElevenLabs-TTS verfügbar) + `GET /api/reading-video/:id`; `startReadingVideoWorker()` verdrahten; Health-Feld `reading_video` |
| Migration | `supabase/migrations/2026XXXX_reading_video_jobs.sql` | Tabelle `public.reading_video_jobs` (analog `video_jobs` + `reading_id`, `audio_job_id`, `slides` JSONB, `duration`), RLS service_role + `auth.uid()=user_id`; Bucket `generated-reading-videos` (oder bestehenden `generated-videos` mitnutzen) |

### Frontend (.167, `frontend-coach`)

| Baustein | Datei | Zweck |
|----------|-------|-------|
| Proxy | `app/api/agents/reading-video/route.ts` (+ `status/[jobId]`) | wie audio/video-generation: `workerFetch` → `/api/reading-video/*`, `requireUser` |
| UI | Button **„Als Video"** auf der Reading-Detailseite `app/(coach)/readings-v4/[id]/page.tsx` + Panel/Modal (pollt, rendert `<video>` + Download) | Einstieg direkt am Reading |
| Tier-Gating | `lib/access/requirePackage.ts` | Premium/VIP — konsistent mit V6 |

## Knackpunkte & Risiken

- **Bodygraph-Port = Single-Source-Risiko:** Geometrie kommt heute aus `.167 lib/hd-bodygraph/data.ts`.
  Beim Kopieren nach .138 entsteht ein Duplikat → Drift-Gefahr. Mitigation: 1:1 portieren + Kommentar/
  Quelle vermerken; mittelfristig in `@ck/shared` auslagern.
- **CPU/RAM:** H.264-Encoding eines mehrminütigen 1080p-Videos ist CPU-schwer auf 3 Kernen.
  Mitigation: `concurrency=1`, Default **720p**, `-preset veryfast`, Thread-Limit, Zeit-Cap
  (z. B. `READING_VIDEO_TIMEOUT_MS`), Slide-Anzahl deckeln.
- **Voiceover-Abhängigkeit:** Phase 2 braucht ein fertiges MP3. Sauberer Default: Narration über die
  **konsolidierte TTS-Pipeline** mit **OpenAI** (kein ElevenLabs-Key nötig) — ElevenLabs optional für
  Premium-Stimme. Der Worker wartet auf den Audio-Job (Polling/Job-Verkettung).
- **Text→Slides:** `reading_data.text` ist ein langer Fließtext. Paginierung nach Zeichen/Absätzen,
  Lesbarkeit (Schriftgröße, max. Zeilen/Slide), Timing proportional zur Audio-Verteilung.
- **Fonts/Sprache:** deutsche Sonderzeichen → passende TTF im Image (DejaVu/Inter).

## Phasierung innerhalb Phase 2

- **2a (MVP):** Voiceover + Titelkarte + chart-spezifischer Bodygraph + Text-Slides → MP4
  (statische Slides, einfache Schnitte, Audio-Mux). End-to-End lauffähig.
- **2b (Politur):** Ken-Burns (`zoompan`), Crossfades (`xfade`), Abschnitts-Pacing.
- **2c (Branding/Extras):** Intro/Outro, optional Untertitel (aus dem Text), Format-Varianten (16:9 / 9:16).

## Betrieb / Deploy

- reading-worker **Rebuild** (neues Image mit ffmpeg + Fonts + `@resvg/resvg-js`).
- Migration anwenden (`reading_video_jobs` + Bucket).
- ENV: `READING_VIDEO_TIMEOUT_MS`, `READING_VIDEO_RESOLUTION` (Default 720p), TTS-ENV (Phase 1).
- frontend-coach **Rebuild** (Proxy + UI).

## Offen / vor dem Bau zu bestätigen

- Bucket: neuer `generated-reading-videos` vs. bestehender `generated-videos` (Empfehlung: eigener Bucket).
- Default-Auflösung 720p vs. 1080p (RAM/CPU vs. Qualität).
- Stimme: OpenAI-Default (kein ElevenLabs-Key) als MVP, ElevenLabs als Premium-Option.

---
*Dieser Plan setzt v8 Phase 1 (Voice-Reading) und die TTS-Konsolidierung auf .138 voraus —*
*beides bereits umgesetzt (Branch `claude/dazzling-knuth-5k0m70`).*
