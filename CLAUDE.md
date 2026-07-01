# CLAUDE.md — The Connection Key — Komplette Systemdokumentation
**Stand:** 2026-07-01 | **Quellen:** Live-Analyse Server .138 + .167; Repo-Bestandsaufnahme 2026-06-19

> **Changelog 2026-07-01 (.138 — W10–W13 by-reading-Reuse + depth-analysis TPM-Fix):**
> - **by-reading-Endpoints für W10–W13** (PRs #28/#29, `2ab0ee9`/`17d5ff3`): neue
>   `GET /api/readings/{nervous-system,womens-design,productivity,gene-keys}/by-reading/:readingId`
>   (`reading-worker/server.js`) liefern das **neueste** Reading-Ergebnis zu einem Quell-Reading
>   (`created_at desc, limit 1`, **beliebiger Status** — nicht mehr hart `completed`): `completed` →
>   anzeigen, `pending`/`processing` → Polling fortsetzen, `failed` → Neustart anbieten. Ermöglicht der
>   .167-UI, ein bereits generiertes (oder noch laufendes) Reading beim Öffnen wieder aufzunehmen (Reuse
>   statt Re-Generieren) — analog Reading-Video by-reading.
> - **depth-analysis in 2 Pässe splitten (TPM-Fix)** (PR #30, `e1fb537`): depth-analysis lief über den
>   generischen Einzel-Call-Pfad mit 16k Output; zusammen mit den 7 Wissensdateien ~34k Tokens/Request →
>   sprengte das OpenAI-TPM-Limit (30k → 429 „Request too large"), bei Overload brannte zudem die ganze
>   Claude-Modell-Liste durch → abgebrochene Readings „Alle Claude-Modelle fehlgeschlagen". Fix
>   (`reading-worker/server.js`): Fallback-Kette (Claude↔OpenAI) in Helper `generateWithModelFallback()`
>   extrahiert; neuer 2-Pass-Zweig für `GENERIC_TWO_PASS_TEMPLATES` (depth-analysis): Sektionen 1–4 / 5–7
>   in getrennten Calls à 8k Output.
> ⚠️ **Deploy:** reading-worker **Rebuild**. Nicht E2E-verifiziert. Die .167-Anbindung (W10–W13 als volle
> Reading-Typen, Reuse-Panels, Chart-Guard) ist im `The-Connection-Key`-Repo dokumentiert (Changelog
> 2026-07-01). Branch `claude/readings-v4-save-category-sgp9vy`.
>
> **Changelog 2026-06-30 (.167 — Welle 3 Self-Tracking: Zyklus-Tagebuch + HRV, nur Frontend):**
> Zwei interaktive Tracking-Features in der User-App (`frontend`), die auf die Readings W10/W11
> aufsetzen — **kein .138-Anteil**: persönliche Daten in Supabase mit RLS (`auth.uid()=user_id`),
> CRUD client-seitig, Berechnung deterministisch im Client (Golden Rule eingehalten). **🌙 Zyklus-
> Tagebuch** (`frontend/app/zyklus`, Tabelle `public.cycle_entries`, Migration `024_cycle_tracking.sql`)
> berechnet die innere Jahreszeit/Phase aus den Period-Starts (`frontend/lib/cycle/phase.ts`). **📈 HRV
> & Nervensystem** (`frontend/app/hrv`, Tabelle `public.hrv_entries`, Migration `025_hrv_tracking.sql`):
> manuelle HRV-Eingabe + Ø/Trend/Baseline. Nav-Sektion „Wohlbefinden" in `AppShell.tsx`. Selbstfürsorge,
> keine medizinische Beratung. ⚠️ Migrationen `024`/`025` vor Betrieb anwenden; `frontend` Rebuild auf
> .167. PR #136. Details: CLAUDE.md im `The-Connection-Key`-Repo.
>
> **Changelog 2026-06-29 (.138/.167 — Vier neue HD-Readings W10–W13: Nervensystem, Weibliches
> Design, Produktivität, Gene Keys):** Themen-Erweiterung „Human Design im Einklang mit …" als
> eigenständige Readings im etablierten Einzel-Chart-Muster (analog Psychology/Evolution: eine vom
> Endpoint angelegte Zeile fortschreiben, **2 Claude-Calls** strukturiertes JSON + Markdown-Narrativ,
> `parseJSONLoose` + Sicherheitsnetz, `buildFactsBlock`-Grounding, `concurrency 2`). Jeweils
> Worker + Wissensbasis + Migration + Endpoints auf **.138** und Proxy + Client-Lib + Panel auf
> **.167** (Panels in der Reading-Detailseite `readings-v4/[id]`, nur `status=completed`, kein Penta).
>
> - **W10 Nervensystem/Regulation** — `workers/nervous-system-worker.js` (Queue
>   `reading-queue-v4-nervous-system`), Wissen `knowledge/nervous-system/nervous-system-knowledge.md`
>   (Polyvagal). Endpoints `POST /api/readings/nervous-system/start`, `GET …/:id`. Tabelle
>   `public.nervous_system_readings` (Migration `2026062801`). Dimensionen: regulation_score,
>   state_map (ventral/sympathisch/dorsal), center_sensitivities (offene Zentren), authority_regulation,
>   triggers, daily_practices, narrative. PRs #23/#131.
> - **W11 Weibliches Design/Hormonzyklus** — `workers/womens-design-worker.js` (Queue
>   `reading-queue-v4-womens-design`), Wissen `knowledge/womens-design/…` (4 innere Jahreszeiten;
>   **Selbstfürsorge, KEINE medizinische Beratung**). Endpoints `…/womens-design/…`. Tabelle
>   `public.womens_design_readings` (Migration `2026062802`). Dimensionen: cycle_alignment_score,
>   cycle_phases (4), type_rhythm, authority_in_cycle, center_amplification, not_self_amplified,
>   selfcare_practices, narrative. PRs #24/#132.
> - **W12 Produktivität ohne Burnout** — `workers/productivity-worker.js` (Queue
>   `reading-queue-v4-productivity`), Wissen `knowledge/productivity/…`. Endpoints
>   `…/productivity/…`. Tabelle `public.productivity_readings` (Migration `2026062803`). Dimensionen:
>   productivity_score, work_rhythm, energy_management (definiert=Output/offen=Leck), decision_load,
>   burnout_signals (Not-Self als Frühwarnung), focus_practices, boundaries, narrative. PRs #25/#133.
> - **W13 Gene Keys** — `workers/gene-keys-worker.js` (Queue `reading-queue-v4-gene-keys`), Wissen
>   `knowledge/gene-keys/…` mit **kanonischer 64-Triaden-Referenz** (Gene Key N = Tor N;
>   Schatten→Geschenk→Siddhi) als Grounding. Endpoints `…/gene-keys/…`. Tabelle
>   `public.gene_keys_readings` (Migration `2026062804`). Aktivierungssequenz (Life's Work/Evolution/
>   Radiance/Purpose) aus Sonne/Erde (Persönlichkeit & Design); kontemplativer Ton, **kein Score**.
>   PRs #25/#133.
>
> ✅ **Deploy verifiziert (2026-06-29):** Migrationen `2026062801`–`2026062804` auf Projekt
> `wdiadklhvhlndnjojrfu` **angewandt** (alle 4 Tabellen `nervous_system_readings`/`womens_design_readings`/
> `productivity_readings`/`gene_keys_readings` via `list_tables` bestätigt, RLS aktiv); **reading-worker
> auf .138 neu gebaut** (Container `Up` :4000, Logs `[W10]`–`[W13]` aktiv: Queues `…-nervous-system`/
> `…-womens-design`/`…-productivity`/`…-gene-keys`, alle 4 Knowledge-Files geladen); **frontend-coach
> auf .167 neu gebaut** (Container `Up`, HTTP 200 :3002). Worker-Start-Reihenfolge in `server.js`:
> …`[W9]` Reading-Video, `[W10]` Nervous-System, `[W11]` Women's-Design, `[W12]` Productivity,
> `[W13]` Gene-Keys. ⚠️ Boot + Queue-Registrierung verifiziert, aber **noch nicht E2E-render-verifiziert**
> (kein echter Reading-Lauf durchgespielt). Welle 1 (Themen als Content) waren 4 Blogartikel im
> `frontend` (`app/blogartikel`). Branch `claude/human-design-nervous-system-75m9ts`. Siehe §7 + §8 + §10.
>
> **Changelog 2026-06-27 (.167 Workshop-DOI-Mail — Zustellstatus + Zustellbarkeit, PRs #125/#126):**
> Zwei zusammengehörige Pakete im **.167-Repo** (`The-Connection-Key`) rund um die Workshop-Double-
> Opt-In-Mail. **(A) Zustellstatus nachverfolgbar (PR #125, `b6ae190f1`):** Bisher zeigte eine
> Anmeldung nach dem Absenden nur `status=pending` — das sagt nur „Bestätigungslink nie geklickt",
> **nicht** ob die DOI-Mail überhaupt zugestellt wurde. Migration
> `supabase-migrations/023_workshop_mail_delivery_status.sql` erweitert `public.event_registrations`
> um vier Spalten — `doi_mail_id` (Resend-Message-ID als Webhook-Match-Key), `mail_status`
> (sent/delivered/delayed/bounced/complained/send_failed), `mail_status_at`, `mail_status_detail`
> (z. B. Bounce-Grund) — + Index `event_registrations_doi_mail_id_idx`. Befüllt durch (1)
> `frontend/app/api/workshops/register/route.ts` (setzt beim Versand `sent`/`send_failed` + merkt
> die Message-ID) und (2) **neue** `frontend/app/api/workshops/resend-webhook/route.ts` (empfängt
> Resend-Events `email.delivered`/`email.bounced`/… und schreibt den Status per `doi_mail_id` fort).
> Coach-Workshops-Seite (`frontend-coach/app/(coach)/workshops/page.tsx` +
> `…/[id]/registrations/route.ts`) zeigt den Mail-Status je Anmeldung. **(B) Zustellbarkeit (PR #126,
> `3061f0f76`):** DOI-Mail (register) + Welcome-Mail (confirm) bekommen einen zusätzlichen
> **text/plain-Teil** (vorher HTML-only → schlechterer Spam-Score, landete bei Yahoo/GMX/web.de trotz
> „Delivered" im Spam) sowie einen optionalen **List-Unsubscribe-Header**; `frontend/lib/resend.ts`
> `sendMail` unterstützt jetzt Custom-Header + Helper `listUnsubscribeHeaders()`. ✅ **Deploy
> verifiziert (2026-06-27):** Migration 023 auf Projekt `wdiadklhvhlndnjojrfu` **angewandt** (alle 4
> Spalten via `information_schema` bestätigt); `frontend` (#125+#126) **und** `frontend-coach` (#125)
> auf .167 seriell **neu gebaut** (beide HTTP 200, Container frisch). ⚠️ **Neue ENV (alle .167
> Root-`.env`, via `env_file` der frontend-Compose — NICHT `frontend/.env`; nach Setzen
> `docker compose up -d frontend`, Recreate ohne Rebuild):** `RESEND_WEBHOOK_SECRET` (`whsec_…` aus
> Resend → Webhooks; **fehlt aktuell** → Webhook verarbeitet Events **ohne** Signaturprüfung, nur
> Log-Warnung), `RESEND_UNSUBSCRIBE_MAILTO`/`RESEND_UNSUBSCRIBE_URL` (optional, Default „aus" → kein
> Header, zeigt nie auf toten Endpoint). ⚠️ **Betriebsvoraussetzung:** In Resend muss ein **Webhook**
> auf `…/api/workshops/resend-webhook` konfiguriert sein, sonst kommen nach `sent` keine
> Delivery-Events. Deploy = `frontend` (+ `frontend-coach` für #125) **Rebuild** + Migration. Siehe
> Abschnitt 10 + 13. Verwandt: Mattermost-Workshop-Benachrichtigung (Changelog 2026-06-10).
>
> **Changelog 2026-06-19 (v8 Reading-Video — Fixes: Single-Pass-Voiceover, Bodygraph, A/V-Sync,
> Reuse-Endpoint):** Vier Folge-Commits auf Phase 2a (`8a30225`, `34c8f26`, `338aa44`, Merges
> `d0531b1`/`70258c9`). (1) **Voiceover in EINEM Durchlauf** (`reading-video-worker.js`): die
> Sprecher-Texte aller Slides (Titel + Bodygraph + Content) werden zu **einer** Erzählung
> konkateniert und mit **einem** `synthesizeLongText()`-Aufruf synthetisiert (intern an TTS-Limits
> gechunkt) statt pro Slide — vermeidet ElevenLabs-Rate-Limits, schneller/günstiger. (2) **A/V-Sync:**
> Slide-Dauern werden **proportional zur Zeichenzahl** des jeweiligen Sprechtexts auf die per ffprobe
> gemessene Gesamt-Audiolänge verteilt → Slide-Wechsel matchen das Audio. (3) **Bodygraph-Mapping
> repariert** (`lib/bodygraph-svg.js` `buildDefinedState`: tolerantes Parsen von `definedCenters`/
> `centers`/`defined_centers`, DE/EN-Aliasse) + **Markdown-Formatierung** in den Content-Slides
> (`lib/slides.js`: `speakText` == sichtbarer Text → keine Audio/Bild-Drift). (4) **Neuer Endpunkt**
> `GET /api/reading-video/by-reading/:readingId` (`server.js`) — liefert das **zuletzt fertige** Video
> zu einem Reading (`status=completed`, neuestes `created_at`); die .167-UI (`ReadingVideoButton`)
> lädt damit ein vorhandenes Video, statt immer neu zu rendern (Commit `38c0ad6` auf .167). Worker-
> Start-Reihenfolge in `server.js`: `[W6]` Psychology, `[W7]` Evolution, `[W8]` Audio, **`[W9]`
> Reading-Video** (+ Video/Runway-Worker ohne eigenes Log-Tag). Migrationen `2026061701_audio_jobs.sql`
> + `2026061702_reading_video_jobs.sql` liegen vor (Tabellen `audio_jobs`/`reading_video_jobs` + Buckets
> `generated-audio`/`generated-reading-videos` + RLS) — **vor Betrieb anwenden**. Deploy = reading-worker
> **Rebuild**. Branch `claude/claude-md-docs-q045q6`. Siehe §7 + §8.
>
> **Changelog 2026-06-17 (v8 Phase 2a — Reading→Video, ffmpeg-Slideshow gebaut):** Aufbauend auf
> Phase 1. **.138:** neuer Worker `reading-worker/workers/reading-video-worker.js` (Queue
> `reading-video-queue`, `startReadingVideoWorker()`, `[W9]`, `concurrency=1` — CPU-schwer);
> Endpunkte `POST /api/reading-video/generate` (202 +jobId, Fast-Fail `503 NO_API_KEY` wenn TTS-Provider
> ohne Key) + `GET /api/reading-video/:id`; Migration `2026061702_reading_video_jobs.sql`
> (Tabelle `reading_video_jobs` + RLS + Bucket `generated-reading-videos`, **noch anzuwenden**).
> Pipeline: Voiceover (`lib/tts.js` `synthesizeLongText`, Default **OpenAI** → kein ElevenLabs-Key nötig)
> → **chart-spezifischer Bodygraph** (`lib/bodygraph-svg.js`, Geometrie 1:1 portiert aus
> `.167 lib/hd-bodygraph/data.ts`, SVG→PNG via **`@resvg/resvg-js`**) + Titel-/Text-Slides
> (`lib/slides.js`, Text paginiert) → **ffmpeg-Slideshow** (`lib/video-compose.js`, concat-Demuxer
> mit Per-Slide-Dauer aus Audiolänge via ffprobe) → MP4 (Default **720p**) permanent im Bucket.
> Dockerfile (reading-worker): `apk add ffmpeg font-dejavu fontconfig`; neue Dep `@resvg/resvg-js`;
> docker-compose: `READING_VIDEO_RESOLUTION/READING_VIDEO_TIMEOUT_MS/FFMPEG_THREADS`. Health meldet
> `reading_video.tts`. **.167:** Proxy `/api/agents/reading-video` (+`/status/[jobId]`), Komponente
> `components/ReadingVideoButton.tsx` (IconButton + Dialog: POST→Poll→`<video>`) auf der
> Reading-Detailseite (`readings-v4/[id]`). ⚠️ **Phase 2b offen:** Ken-Burns/Crossfades, Branding,
> Untertitel. ⚠️ **Single-Source-Risiko:** Bodygraph-Geometrie dupliziert .167↔.138 (mittelfristig
> nach `@ck/shared`). ⚠️ **Verifikation:** Kette verdrahtet + syntaxgeprüft, aber **nicht E2E
> render-verifiziert** (ffmpeg/resvg/Storage nicht in dieser Umgebung). Deploy = reading-worker
> **Rebuild** (größeres Image) + frontend-coach **Rebuild** + Migration. Plan-Doc:
> `docs/V8_PHASE2_READING_VIDEO_PLAN.md`. Branch `claude/dazzling-knuth-5k0m70`. Siehe §7 + §8 + §10.
>
> **Changelog 2026-06-17 (v8 Phase 1 — Voice-Reading via ElevenLabs gebaut):** Erster Baustein
> der v8-Vision aus der Reading-Evolution-Roadmap (`docs/READING_EVOLUTION_ROADMAP.md`). **.138:**
> neuer BullMQ-Worker `reading-worker/workers/audio-worker.js` (Queue `audio-queue`,
> `startAudioWorker()` in `server.js` verdrahtet, `[W8]`), Endpunkte `POST /api/audio/generate`
> (202 +jobId, Fast-Fail `503 NO_API_KEY` ohne Schlüssel — analog Video) und `GET /api/audio/:id`;
> Migration `supabase/migrations/2026061701_audio_jobs.sql` (Tabelle `public.audio_jobs` + RLS +
> Bucket `generated-audio`, **noch anzuwenden**). Der Worker löst den Text direkt **oder** aus
> `public.readings.reading_data.text` auf, chunkt lange Readings (≤`ELEVENLABS_MAX_CHARS`, Default
> 4500) an Absatz-/Satzgrenzen, ruft ElevenLabs TTS (REST, **kein neues SDK**, Modell
> `eleven_multilingual_v2`), konkateniert die MP3-Teile und speichert permanent im Bucket. Persistenter
> Row-Pattern wie Psychology/Video (pending→processing→generating→completed/failed). Health meldet
> `audio.elevenlabs: ready|missing_key`. **.167:** Proxy `/api/agents/audio-generation` (+`/status/[jobId]`),
> UI `components/AudioGenerationPanel.tsx` + Seite `/agents/audio-generation` (Text- oder Reading-ID-Quelle,
> pollt 5 s, `<audio>`-Player + Download), in der Agenten-Übersicht (Reading-Gruppe) verlinkt.
> ⚠️ **Betriebsvoraussetzung:** `ELEVENLABS_API_KEY` auf .138 setzen (docker-compose Default leer;
> Var ist durchgereicht). Deploy = reading-worker **Rebuild** + frontend-coach **Rebuild**. Das
> Voice-MP3 ist bewusst eigenständig, damit v8 Phase 2 (Reading→Video) es als Tonspur wiederverwenden
> kann. Branch `claude/dazzling-knuth-5k0m70`. Siehe Abschnitt 7 + 8 + 10.
>
> **Changelog 2026-06-17 (TTS konsolidiert auf .138 — ein TTS-Quell-Ort):** Das bestehende
> `.167 /api/tts` (Chat-Vorlesen, synchron Text→MP3, OpenAI/ElevenLabs, Disk-Cache) rief die
> TTS-Provider **direkt auf dem Frontend-Server** (Goldene-Regel-Verstoß + Key-Duplikat). **Neu:**
> die Synthese läuft jetzt zentral auf .138. (1) Neues Util `reading-worker/lib/tts.js`
> (`synthesizeSpeech` Provider-Switch, `elevenLabsTTS`/`openAiTTS` Low-Level, `ttsVoiceSignature`)
> — **einziger** Provider-Aufrufer; der v8 `audio-worker.js` nutzt jetzt `elevenLabsTTS` daraus
> (kein eigener Fetch mehr). (2) Endpunkte am reading-worker: `POST /api/tts/speak` (synchron →
> MP3-Bytes; Provider/Keys nur auf .138; Default-Provider **OpenAI**, OPENAI_API_KEY ist dort
> bereits gesetzt → funktioniert sofort) und `GET /api/tts/config` (liefert `voice_sig` fürs
> Cache-Busting). (3) **.167** `frontend/lib/tts.ts` + `frontend-coach/lib/tts.ts` rufen statt der
> Provider jetzt `BACKEND_4000/api/tts/speak`; der **Disk-Cache bleibt** auf .167 davor (Cache-Key
> = `voice_sig|text`, `voice_sig` von `/api/tts/config` mit 5-min-Memo). `/api/tts/route.ts`
> unverändert. docker-compose: `TTS_PROVIDER`/`TTS_SPEED`/`TTS_OPENAI_MODEL`/`TTS_OPENAI_VOICE` an
> reading-worker. Ergebnis: ElevenLabs/OpenAI-Keys leben **nur** noch auf .138; Chat-Vorlesen
> bleibt synchron + gecached. Deploy = reading-worker **Rebuild** + frontend/frontend-coach
> **Rebuild**. Branch `claude/dazzling-knuth-5k0m70`.
>
> **Changelog 2026-06-17 (Video-Pipeline E2E verifiziert + dokumentiert):** Prüfung ergab,
> dass die Runway/Seedance-Video-Pipeline **bereits vollständig E2E gebaut** ist (CLAUDE.md
> beschrieb sie bisher gar nicht). **.138:** Migration `2026060301_video_jobs.sql` (angewandt
> 2026-06-03) + Bucket `generated-videos`; `workers/video-worker.js` (Queue `video-queue`,
> `startVideoWorker()` aktiv); Endpunkte `POST /api/videos/generate` (202 +jobId) und
> `GET /api/videos/:id`. **.167:** Proxy `/api/agents/video-generation` (+Status-Poll-Route),
> UI `VideoGenerationPanel` + Seite `/agents/video-generation` (sendet → pollt 5 s → rendert
> `<video>` + Download), in Navigation/Marketing-Hub/Admin verlinkt. Kette korrekt verdrahtet,
> keine Code-Änderung nötig — nur dokumentiert (§7 Worker+Queue, §10 `video_jobs`+Bucket).
> ⚠️ Betriebsvoraussetzung: `RUNWAYML_API_SECRET` muss auf .138 gesetzt sein (Default leer),
> sonst Jobs `failed`/`NO_API_KEY`. `/agents/video-creation` (Text-Agent) ist ein separates
> Feature, kein Duplikat. Siehe Abschnitt 7.
>
> **Changelog 2026-06-17 (.138 Systemprüfung — Härtung + Doku-Abgleich):** (1) **CORS-Wildcard
> geschlossen** — `docker-compose.yml` (connection-key:3000) hatte `CORS_ORIGINS:-*` als Fallback;
> ersetzt durch explizite Produktionsdomains (the-connection-key.de, coach./agent. +
> werdemeisterdeinergedankenagent.de). Override via gesetztes `CORS_ORIGINS` bleibt; Server→Server-
> Calls (kein Origin-Header) unberührt. Deploy: `docker compose up -d connection-key`.
> (2) **Auth-Gate auf alle `/agent/*`-Routen** (`mcp-gateway.js`, `agentAuthGate`) — vorher offen
> (jeder konnte Claude-Calls auslösen). Akzeptiert Bearer **oder** `x-api-key` gegen
> `VALID_AGENT_KEYS`; **Grace-Mode** per Default (`AGENT_AUTH_ENFORCE=false`, loggt nur), scharf
> via `AGENT_AUTH_ENFORCE=true`. Greift NICHT auf `/agents/run` (hat eigene `authMiddleware`).
> docker-compose: Gateway bekommt `CK_AGENT_SECRET`/`CONNECTION_KEY_API_KEY`/`GATEWAY_ALLOWED_KEYS`/
> `AGENT_AUTH_ENFORCE`. Deploy: `docker compose build mcp-gateway && up -d mcp-gateway`, dann Logs
> (`grep agent-auth`) prüfen, bevor enforced wird. (3) **Doku-Korrekturen verifiziert:** die früher
> als „fehlend/404" gelisteten Gateway-Routen (`chart`/`yearly`/`automation`/`depth-analysis`/`tasks`)
> **existieren** (via `makeSimpleAgent`); `/agents/reading` ist **kein Platzhalter** mehr (echter
> Claude-Call); Duplikat-Queue `reading-v4-queue` ist **totes Legacy** (Produzent `.167/scripts/v4.js`
> nirgends gemountet, kein Worker konsumiert sie) → kein Live-Bug. Branch
> `claude/system-check-138-extensions-6qjf8b`. Siehe Abschnitt 8 + 15.
>
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
> **Rebuild**. ✅ **Deploy verifiziert (2026-06-14):** reading-worker per `docker compose build
> reading-worker && up -d` neu gebaut → Container `Up` auf Port 4000, Log `🟢 Evolution Worker
> aktiv` / `[W7] Evolution Worker gestartet`; Migration `2026061401` auf `wdiadklhvhlndnjojrfu`
> **angewandt** (alle 8 Spalten + Index via `information_schema` bestätigt). ✅ **Frontend (.167)
> umgestellt + deployt (2026-06-14, Commit `952c93723` auf `The-Connection-Key`@main):** Der
> Proxy `frontend/app/api/v6/evolution/route.ts` ruft im `POST` jetzt die neue .138-Engine
> (`READING_AGENT_URL`/`BACKEND_4000` → `/api/readings/evolution/start`, async, liefert
> `analysis_id`) statt der alten **JS-Formel im Route-Handler**; neuer `GET ?action=get&id=`
> pollt die `evolution_analyses`-Zeile (RLS `auth.uid()=user_id`), `GET ?action=list`
> unverändert. UI `frontend/app/v6/evolution/page.tsx`: `createAnalysis` pollt bis
> `completed`/`failed` (5-min-Cap), Feld-Shapes an das neue JSON angepasst
> (`key_changes.change`, `growth_areas.title`/`progress`, `recommendations.title`/`description`)
> + neuer **Narrativ-Bericht** gerendert. Deploy = `frontend` **Rebuild** auf .167 (Next 14,
> seriell). **E2E verifiziert** über den echten Browser-Pfad (gefälschtes `@supabase/ssr`-Cookie
> aus Admin-Magic-Link): Auth-Gate 401 ohne Session, `POST`→202→Poll→`completed`, Ergebnis
> voll befüllt (Score, alle Dimensionen, Narrativ), UI-Feld-Shapes passend. Branch
> `claude/evolution-feature-expansion-lsfnnl`. Siehe Abschnitt 7 + 8.
>
> ⚠️ **Deploy-Gotcha (.167-Proxy):** `BACKEND_4000` zeigt auf den **reading-worker** (Port 4000),
> NICHT auf die connection-key-API (3000) — Evolution-Endpunkte leben im reading-worker. Der
> Evolution-Start-Endpunkt prüft (Stand 2026-06-14) **keinen** `x-api-key` (Schutz = Netzwerk-
> Firewall .167→.138); der Proxy sendet ihn dennoch konsistent mit.
>
> 🐛 **Fix 2026-06-14 (Eigentümerschaft `profile_id`):** Live-Fehler „Keine Readings für diesen
> User gefunden" trotz vorhandener Auswahl. Ursache: `fetchUserReadings` im evolution-worker
> filterte nur `user_id`, die v3-Liste (`.167 /api/readings`) zeigt Readings aber per
> `user_id` **ODER** `profile_id` (`.or(user_id.eq.X,profile_id.eq.X)`). Readings dieser User
> sind `profile_id`-verknüpft (7 von 91 in Prod) → Auswahl sichtbar, Worker fand nichts. **Fix:**
> `evolution-worker.js` nutzt jetzt dieselbe `.or(user_id.eq,profile_id.eq)`-Logik. Verifiziert
> mit `profile_id`-User (7 Readings) → `completed`. Deploy = reading-worker **Rebuild**.
>
> ✨ **UI-Ausbau 2026-06-14 (.167, Commit `853c18dc4`):** Die Evolution-Seite
> (`frontend/app/v6/evolution/page.tsx`) rendert jetzt **alle** Engine-Dimensionen statt nur
> Score/key_changes/growth_areas/recommendations: **Phase**-Badge (⚠️ aus `comparison_data.phase`,
> KEINE eigene Spalte), **Not-Self→Signatur**-Achse (+movement/evidence), **Autoritäts-Ausrichtung**
> (alignment/observations/next_step), **`center_evolution`** (Druck→Weisheit je offenem Zentrum),
> **Zeitleiste** (`timeline`) und **`coaching_links`**-CTAs (session_topics + learning_exercises).
> Das **`narrative`** wird über die bestehende `@/components/MarkdownLite`-Komponente als Markdown
> gerendert (vorher `whitespace-pre-wrap`). Feldnamen autoritativ aus dem Worker-Kontrakt
> (`evolution-worker.js`, JSON-Schema im Call-1-Prompt) — es gibt **keine** Frontend-Vorlagen im
> .138-Repo. Deploy = `frontend` **Rebuild**. **E2E verifiziert** (Browser-Pfad, realer
> `profile_id`-User): alle Dimensionen befüllt (Phase=Experimentieren, Not-Self→Signatur,
> 3× center_evolution/timeline/coaching, Markdown-Narrativ).
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
| `workers/video-worker.js` | .138 | reading-worker | — | `video-queue` | Echte Video-Generierung (Runway/Seedance 2.0) | ✅ Integriert (E2E verifiziert 2026-06-17) |
| `workers/audio-worker.js` | .138 | reading-worker | — | `audio-queue` | Voice-Reading (TTS→MP3, ElevenLabs/OpenAI) `[W8]`, concurrency 2 | ✅ Integriert (v8 Phase 1, 2026-06-17) |
| `workers/reading-video-worker.js` | .138 | reading-worker | — | `reading-video-queue` | Reading→Video (Voiceover + Bodygraph + Slides → ffmpeg-MP4) `[W9]`, concurrency 1 | ✅ Integriert (v8 Phase 2a, Fixes 2026-06-19) |
| `workers/nervous-system-worker.js` | .138 | reading-worker | — | `reading-queue-v4-nervous-system` | Nervensystem-/Regulations-Reading (Polyvagal, offene Zentren) `[W10]`, concurrency 2 | ✅ Integriert (2026-06-29) |
| `workers/womens-design-worker.js` | .138 | reading-worker | — | `reading-queue-v4-womens-design` | Weibliches Design / Hormonzyklus (4 innere Jahreszeiten) `[W11]`, concurrency 2 | ✅ Integriert (2026-06-29) |
| `workers/productivity-worker.js` | .138 | reading-worker | — | `reading-queue-v4-productivity` | Produktivität ohne Burnout (Typ-Rhythmus, Energie-Lecks, Not-Self-Frühwarnung) `[W12]`, concurrency 2 | ✅ Integriert (2026-06-29) |
| `workers/gene-keys-worker.js` | .138 | reading-worker | — | `reading-queue-v4-gene-keys` | Gene Keys (Schatten→Geschenk→Siddhi, Aktivierungssequenz) `[W13]`, concurrency 2 | ✅ Integriert (2026-06-29) |
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

**Video-Worker — Flow (E2E verifiziert 2026-06-17):** Vollständige Kette über beide Server.
**.138** (`reading-worker`, Port 4000): `POST /api/videos/generate` (Body `{mode:text|image|reference,
prompt, shots?, images?, ratio?, duration?, userId}`) legt eine `public.video_jobs`-Zeile
(`status=pending`) an und enqueued `{ jobId }` in die BullMQ-Queue `video-queue`; gibt `202 {jobId}`
zurück. `workers/video-worker.js` ruft Runway/Seedance (`@runwayml/sdk`, `RUNWAYML_API_SECRET`,
Modell `RUNWAY_VIDEO_MODEL` Default `seedance2`), pollt bis fertig (`VIDEO_TIMEOUT_MS`, Default
15 min), lädt das MP4 herunter und speichert es **permanent** im Storage-Bucket `generated-videos`,
schreibt `status/progress/video_url` in `video_jobs` fort. Status-Abruf: `GET /api/videos/:id`.
Multi-Shot via `shots[]` (Seedance), `text|image|reference`-Modi. **.167** (`frontend-coach`):
Proxy `POST /api/agents/video-generation` → `workerFetch /api/videos/generate` (+`userId`);
`GET /api/agents/video-generation/status/[jobId]` pollt; UI `components/VideoGenerationPanel.tsx`
(Seite `/agents/video-generation`) sendet, pollt alle 5 s, rendert `<video>` + Download. Beide
Seiten in Navigation/Marketing-Hub/Admin verlinkt. ⚠️ **Abgrenzung:** `/agents/video-creation`
(Text-Agent: Skript/Shot-List/Produktionsanleitung) ist ein **anderes** Feature als
`/agents/video-generation` (echte Video-Erzeugung) — kein Duplikat. ⚠️ **Betriebsvoraussetzung:**
`RUNWAYML_API_SECRET` muss auf .138 gesetzt sein (docker-compose Default leer). **Absicherung
(2026-06-17):** `POST /api/videos/generate` macht jetzt **Fast-Fail** — ohne Key sofort `503`
`NO_API_KEY` (kein doomed Job mehr; die .167-UI zeigt die Meldung direkt). Der Health-Endpunkt
(`GET /health` am reading-worker) meldet `video.runway: "ready" | "missing_key"`. Deploy =
reading-worker **Rebuild**.

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
| `bull:video-queue` | — | Video-Generierung (Runway/Seedance, `video-worker`) |
| `bull:audio-queue` | — | Voice-Reading (TTS→MP3, `audio-worker`, v8 Phase 1) |
| `bull:reading-video-queue` | — | Reading→Video (ffmpeg-Slideshow, `reading-video-worker`, v8 Phase 2a) |
| `bull:reading-queue-v4-nervous-system` | V4 | Nervensystem-/Regulations-Reading (`nervous-system-worker`, W10) |
| `bull:reading-queue-v4-womens-design` | V4 | Weibliches Design / Hormonzyklus (`womens-design-worker`, W11) |
| `bull:reading-queue-v4-productivity` | V4 | Produktivität ohne Burnout (`productivity-worker`, W12) |
| `bull:reading-queue-v4-gene-keys` | V4 | Gene Keys (`gene-keys-worker`, W13) |
| `bull:reading-v4-queue` | V4 | ⚠️ Totes Legacy — Produzent `.167/scripts/v4.js` nirgends gemountet, kein Worker konsumiert (verifiziert 2026-06-17) |

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

**Auth:** `/agents/run` per Bearer Token (`MCP_API_KEY` / `CK_AGENT_SECRET`). Die dedizierten `/agent/*`-Routen haben **seit 2026-06-17 ein Auth-Gate** (`agentAuthGate`, akzeptiert `Authorization: Bearer` **oder** `x-api-key` gegen `VALID_AGENT_KEYS` = `MCP_API_KEY`/`CK_AGENT_SECRET`/`CONNECTION_KEY_API_KEY`/`GATEWAY_ALLOWED_KEYS`). Default ist **Grace-Mode** (`AGENT_AUTH_ENFORCE=false`): unautorisierte Calls werden nur geloggt; mit `AGENT_AUTH_ENFORCE=true` → echtes 401. Hintergrund: die internen .167-Aufrufer (frontend-coach, Muster A) senden `x-api-key`, **nicht** Bearer.

| Methode | Pfad | Funktion |
|---------|------|----------|
| POST | `/agents/run` | Generischer Dispatcher (`domain`/`task`/`payload`) → spawnt MCP-Core (`index.js`) per stdio; max. 1 Request gleichzeitig |
| GET | `/health` | Health-Check |

**Dedizierte Agent-Endpunkte (real in `mcp-gateway.js`):**
```
/agent/marketing         /agent/sales           /agent/social-youtube
/agent/video             /agent/video-creation  /agent/ui-ux
/agent/chart-architect   /agent/reading         /agent/reflection
/agent/shadow-work       /agent/relationship    /agent/transit
/agent/business-hd       /agent/emotions        /agent/health
/agent/abundance         /agent/knowledge
/agent/chart             /agent/yearly          /agent/automation
/agent/depth-analysis    /agent/tasks
/agent/video/generate (POST) · /agent/video/status/:taskId (GET)
```
✅ **Korrektur 2026-06-17:** Die früher fehlenden Routen `chart`, `yearly`, `automation`, `depth-analysis`, `tasks` **existieren jetzt** (via `makeSimpleAgent`, System-Prompt aus `AGENT_SYSTEM_PROMPTS`) → die alten 404er aus `AGENTEN_404_FEHLER_ANALYSE.md` sind behoben. Ebenfalls neu: `/agent/knowledge` und die echte Video-Generierung (`/agent/video/generate` + `/agent/video/status`, Runway/Seedance).
⚠️ `/agent/reading` fällt ohne `ANTHROPIC_API_KEY` auf Placeholder-Text zurück. `/agents/reading` (mit s, `mcp-gateway.js:426`) ist **kein** Platzhalter mehr — es macht einen echten Claude-Call (503 ohne API-Key). Einziger Aufrufer ist das **auskommentierte** Legacy-Frontend (`docker-compose.yml` `#frontend:`).

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
| POST | `/api/v4/readings/[id]/email` | E-Mail versenden | ✅ (`RESEND_API_KEY` auf .167 gesetzt) |
| GET | `/api/v4/readings/[id]/pdf` | PDF Export (`generateReadingPDFBuffer` aus `@/lib/pdf-server`, mit Auth) | ✅ |
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

### Tabellen — public Schema (Video / Audio / Reading-Video)

| Tabelle | Beschreibung |
|---------|-------------|
| `video_jobs` | Video-Generierungs-Jobs (mode/prompt/shots/images, status, runway_task_id, video_url/video_path, RLS: service_role + `auth.uid()=user_id`). Migration `2026060301_video_jobs.sql` (angewandt 2026-06-03). |
| `audio_jobs` | Voice-Reading-Jobs (source, reading_id, text/title, voice_id/model_id, status, progress, audio_url/audio_path, RLS: service_role + `auth.uid()=user_id`). Migration `2026061701_audio_jobs.sql` (**vor Betrieb anwenden**). |
| `reading_video_jobs` | Reading→Video-Jobs (reading_id, voice_id, status, progress, video_url/video_path, duration, RLS: service_role + `auth.uid()=user_id`). Migration `2026061702_reading_video_jobs.sql` (**vor Betrieb anwenden**). |
| `nervous_system_readings` | Nervensystem-/Regulations-Reading (W10): regulation_score, state_map, center_sensitivities, authority_regulation, triggers, daily_practices, narrative. RLS service_role + `auth.uid()=user_id`. Migration `2026062801` (**vor Betrieb anwenden**). |
| `womens_design_readings` | Weibliches Design / Hormonzyklus (W11): cycle_alignment_score, cycle_phases, type_rhythm, authority_in_cycle, center_amplification, not_self_amplified, selfcare_practices, narrative. Migration `2026062802` (**vor Betrieb anwenden**). |
| `productivity_readings` | Produktivität ohne Burnout (W12): productivity_score, work_rhythm, energy_management, decision_load, burnout_signals, focus_practices, boundaries, narrative. Migration `2026062803` (**vor Betrieb anwenden**). |
| `gene_keys_readings` | Gene Keys (W13): core_theme, activation_sequence, spheres, shadow_work, contemplation, narrative (kein Score). Migration `2026062804` (**vor Betrieb anwenden**). |

**Storage-Buckets (alle public, permanente URLs):** `generated-videos` (Runway-MP4s) · `generated-audio` (Voice-Reading-MP3s) · `generated-reading-videos` (Reading→Video-MP4s).

### Redis

| Instanz | Server | Port | Container | Zweck | Status |
|---------|--------|------|-----------|-------|--------|
| Docker-Redis | .138 | 6379 intern | redis-queue-secure | BullMQ (51 Keys) | ✅ |
| System-Redis | .138 | 127.0.0.1:6379 | systemd | ⚠️ Unklar — prüfen | ⚠️ |
| Docker-Redis | .167 | 6379 intern | redis | Cache | ✅ |

---

## 11. DESIGN-SYSTEM (.167)

### Status: **MUI — vollständig** (Tailwind entfernt in Commit `35a75bd76`)

### Theme (`frontend/styles/theme.ts` + `frontend-coach/styles/theme.ts` — vereinheitlicht)

```
Primary:     #F5A623  (Brandbook Gold / Flame)   ⚠️ war #F29F05
Secondary:   #3A7AE1  (Auric Blue / Pulse)       ⚠️ war #8C1D04
Background:  #0B0F19  (Brandbook Dark)           ⚠️ war #030200
Font:        Inter / system-ui · Headings: Space Grotesk

MuiButton contained:  linear-gradient(135deg, #F5A623, #D98905)
MuiPaper:             Glassmorphism (rgba borders, backdrop-filter)
MuiCard:              Glass + Gold border
```

### UI-Stack

| Kategorie | Technologie |
|-----------|------------|
| Component Library | MUI (`@mui/material` + `@emotion`) — Tailwind entfernt |
| Animationen | `framer-motion` |
| PDF Export | `html2canvas` + `jspdf` (Server-PDF via `@/lib/pdf-server`) |
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

## 12. VERSIONIERUNG (V3 / V4 / V6)

| Version | Status | Server | Schema | Beschreibung |
|---------|--------|--------|--------|-------------|
| V3 | ✅ Aktiv | .138 | `public` | Orchestrator, 4 Agenten, `readings-v3` Routes |
| V4 | ✅ Aktiv | .138 + .167 | `v4` | BullMQ Queues, spezialisierte Workers, Coach-Portal |
| V6 | ✅ Aktiv & live genutzt | .167 (+ .138 Evolution-Worker) | `public` | Coaching-Layer, 3 Säulen: Coaching-Sessions (`coaching_sessions`), Lernpfade (`learning_paths`), Evolution (`evolution_analyses`, Engine auf .138 via `reading-queue-v4-evolution`). Frontend `/v6/{coaching,learning,evolution}`. **Seit 2026-06-16 (.167) an Abo-Stufen gekoppelt** (`lib/access/requirePackage.ts`): coaching=VIP, learning/evolution=Premium, server- + seitenseitig. Geplante eigene `v6_payments`-Monetarisierung entfällt durch Abo-Kopplung. |
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
| Resend | E-Mail-Versand | `RESEND_API_KEY` | .167 | ✅ gesetzt (Root-.env → frontend, frontend-coach, ck-agent) |
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
| 10 | ✅ **ERLEDIGT:** `RESEND_API_KEY` ist auf .167 gesetzt (Root-.env, durchgereicht an frontend/frontend-coach/ck-agent) — E-Mail-Versand funktional | .167 |
| 11 | TypeScript Fehler ignoriert (`ignoreBuildErrors=true`) — **nur noch im Legacy-`frontend`** (v3, `next.config.js:327`); `frontend-coach` hat den Flag **nicht** (verifiziert 2026-07-01) | .167 |

### 🟡 P2 — Wichtig

| # | Problem | Server |
|---|---------|--------|
| 12 | System-Redis parallel zu Docker-Redis | .138 |
| 13 | ✅ **ERLEDIGT (2026-06-02):** 4 GB Swap + `vm.swappiness=10` auf .138 (und .167) eingerichtet | .138 |
| 14 | v4-worker auf .167 definiert aber gehört auf .138 | .167 |
| 15 | ✅ **ERLEDIGT:** `sync-reading-service` ist in `docker-compose.yml` (braucht ggf. noch Supabase-ENV) | .138 |
| 16 | n8n ohne SSL | .138 |
| 17 | ✅ **ERLEDIGT (2026-06-17):** `/agents/reading` ist kein Platzhalter mehr (echter Claude-Call); der tote `services/chart-truth/`-Baum (nicht lauffähig — Abhängigkeit `chart-calculation-astronomy.js` fehlte, nirgends gemountet, duplizierte die echte Engine) wurde **entfernt** (inkl. `integration/.../chart/truth/route.ts`). ⚠️ Rest: n8n-Templates (`n8n-workflows/*chart-truth*`) rufen noch `/api/chart/truth` auf — diesen Endpunkt serviert die connection-key-API **nicht** (sie hat `/api/chart/calculate`); Templates sind nicht live, aber vor n8n-Import anpassen | .138 |
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
| ✅ ~~`RESEND_API_KEY` setzen~~ | .167 | **Erledigt** — Key in Root-.env, an 3 Container durchgereicht |
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
RESEND_API_KEY                    # ✅ gesetzt (Root-.env, an frontend/frontend-coach/ck-agent)
RESEND_FROM_DOMAIN
RESEND_FROM_NAME
RESEND_WEBHOOK_SECRET             # whsec_… aus Resend → Webhooks; signiert /api/workshops/resend-webhook
                                  # ⚠️ aktuell NICHT gesetzt → Webhook verarbeitet Events ohne Signaturprüfung (nur Log-Warnung)
                                  # ⚠️ Root-.env (env_file der frontend-Compose), NICHT frontend/.env! Danach: docker compose up -d frontend
RESEND_UNSUBSCRIBE_MAILTO         # optional: List-Unsubscribe mailto: (Zustellbarkeit Yahoo/Gmail); Default aus = kein Header
RESEND_UNSUBSCRIBE_URL            # optional: https One-Click-Abmelde-Endpoint (RFC 8058); nur setzen wenn überwacht

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
| Framework | `frontend`: Next.js 14.2 / React 18.3 · `frontend-coach`: **Next.js 16 / React 19** (App Router) ⚠️ Versions-Drift |
| UI | MUI (`@mui/material` + `@emotion`) — Tailwind komplett entfernt |
| Animationen | `framer-motion` |
| Voice | TTS (proxyt nach .138) + STT (`useSpeechToText`, Web Speech API) |
| DB Client | `@supabase/ssr`, `@supabase/supabase-js` |
| Payments | `stripe`, `@stripe/stripe-js` |
| PDF | `html2canvas` + `jspdf` |
| QR | `qrcode` |
| E-Mail | Resend (`RESEND_API_KEY` gesetzt) |
| Shared Code | `@ck/shared` (packages/shared/) |
| Monitoring | Grafana + Prometheus + Node Exporter + AlertManager + Redis Exporter |
| Container | Docker Compose (10 Services) |
| Reverse Proxy | Nginx (Docker) + Host-Nginx (⚠️ Dual) |
| SSL | Let's Encrypt |
| CI/CD | GitHub Actions |

---

*Letzte Aktualisierung: 2026-07-01 (Doku-Abgleich gegen Repo-Stand — W10–W13 by-reading-Reuse-Endpoints + depth-analysis 2-Pass-TPM-Fix nachgezogen; PDF-Export als erledigt korrigiert; `ignoreBuildErrors` als nur-`frontend` präzisiert)*
*Quellen: SERVER_138_SYSTEMANALYSE_2026-03-27.md + SYSTEM_ANALYSE.md (.167) + Live-Code-Analyse .138*

