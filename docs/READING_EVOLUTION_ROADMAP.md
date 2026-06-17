# 🚀 Readings API — Evolution v1 bis v10

**Ursprünglich erstellt:** 2026-01-10 (als Vision-Roadmap, Quelle: `Reading_Evolution.pdf`)
**Stand-Abgleich gegen echten Code:** 2026-06-17

> **Was ist dieses Dokument?**
> Die ursprüngliche `Reading_Evolution.pdf` war eine **Vision-Roadmap** (v3 live, v4–v10 geplant).
> Diese Markdown-Fassung gleicht jede Version gegen den **tatsächlichen Code-Stand** in beiden
> Repos ab (`Connection-Key-MCP-Server` = .138 Backend, `The-Connection-Key` = .167 Frontend).
> Sie ersetzt die PDF als lebende Roadmap.

## 📊 Status-Legende

| Symbol | Bedeutung |
|--------|-----------|
| ✅ | Vollständig umgesetzt |
| 🟡 | Teilweise umgesetzt (Lücke dokumentiert) |
| ❌ | Nicht gebaut |
| ✨ | Übertrifft die ursprüngliche Spec |
| 🔀 | Umgesetzt, aber mit abweichender API/Architektur |

## 📋 Überblick: Soll/Ist

| Version | Roadmap-Status (2026-01) | **Realer Stand (2026-06)** | Bewertung |
|---------|--------------------------|----------------------------|-----------|
| v1 Legacy | ✅ Live | `/api/reading/generate` aktiv (.138:3000) | ✅ |
| v2 Worker-Queue | ✅ Live | BullMQ + `/api/agents/run` aktiv | ✅ |
| v3 Orchestrator | ✅ Live (aktuell) | `readings-v3`-Routen, 4 Agents aktiv | ✅ |
| v4 Multi-Agent + Connection + Penta | 💡 Geplant | **Voll gebaut** — andere API als skizziert | ✅ 🔀 |
| v5 Streaming + Real-Time | 💭 Konzept | Streaming + geführte Sessions ja; Multi-User-Collab nein | 🟡 |
| v6 Coaching + Learning + Evolution | 💭 Konzept | **Voll live & abo-gekoppelt** | ✅ ✨ |
| v7 Marketplace + Custom Agents | 💭 Konzept | Nicht gebaut | ❌ |
| v8 Voice + Video + AR/VR | 💭 Vision | Nur generische Video-Generierung (≠ Reading→Video) | 🟡 |
| v9 Global + Enterprise | 💭 Vision | Nicht gebaut | ❌ |
| v10 AI-Evolution + Autonomy | 💭 Vision | Nicht gebaut | ❌ |

---

## ✅ v1 — Legacy (2024–2025)

**Status: ✅ Live.** Ein generischer Agent, Sync-Processing.
`POST /api/reading/generate` existiert weiterhin auf der Connection-Key-API (.138:3000).

---

## ✅ v2 — Worker-Queue (2025)

**Status: ✅ Live.** Async via BullMQ-Worker-Queue (Redis auf .138), Agent pro Route,
Supabase-Persistierung. Dispatcher `/api/agents/run` (MCP-Gateway, .138:7000) aktiv.

---

## ✅ v3 — Orchestrator (aktuell seit 2026-01)

**Status: ✅ Live.** 4 spezialisierte Agents, zentrale API auf dem MCP-Server,
async, auth-geschützt. `POST /api/readings-v3/create` + Status-/Abruf-Routen aktiv.

---

## ✅ v4 — Multi-Agent, Connection & Penta — **UMGESETZT** 🔀

**Status: ✅ Vollständig gebaut** — allerdings mit **anderer API als in der PDF skizziert.**

Die PDF skizzierte `/api/readings-v4/create-multi`, `…/create-connection`, `…/create-penta`.
**Real umgesetzt** über einen einheitlichen Endpunkt + dedizierte Worker/Queues:

| Roadmap-Idee | Reale Umsetzung |
|--------------|-----------------|
| `create-connection` (2 Personen) | `reading_type: 'connection'` → Queue `reading-queue-v4-connection`, `connectionWorker` (echte Charts beider Personen, Composite-Klassifikation) |
| `create-penta` (3–7 Personen) | `reading_type: 'penta' \| 'penta-communication'` (≥3 Personen) → Queue `reading-queue-v4-penta`, `pentaWorker`, Penta-Composite-Chart |
| `create-multi` (Multi-Agent + Synthese) | Queue `reading-queue-v4-multi-agent`, `multiAgentWorker` + Frontend-Route `/api/agents/multi-agent` |
| Einheitlicher Einstieg | `POST /api/v4/readings` (Frontend .167) mit `reading_type` → legt `v4.reading_jobs`-Zeile an |

**Technische Features v4 (Soll → Ist):**
- ✅ Zentrale Chart-Berechnung — via `connection-key:3000/api/chart/calculate` (`CHART_SERVICE_URL`).
  Der separate „Chart-Truth-Service" wurde **nicht** als eigener Dienst gebaut (der tote
  `services/chart-truth/`-Baum wurde 2026-06-17 entfernt); die Funktion liefert die Engine direkt.
- ✅ Beziehungsdynamik-Algorithmus — `lib/composite-classification.js` (`classifyTwoPersonChannels`,
  `classifyCompositeConnections`).
- ✅ Penta-Composite-Chart-Generator.
- 🟡 Redis-Caching für Charts — Redis ist vorhanden (BullMQ), ein dediziertes Chart-Cache-Layer
  ist nicht explizit umgesetzt.

---

## 🟡 v5 — Streaming & Real-Time — **TEILWEISE**

| Roadmap-Feature | Realer Stand |
|-----------------|--------------|
| Live-Streaming Readings | 🟡 **SSE statt WebSocket.** `POST /api/readings/stream` (.138), `/api/v4/readings/[id]/generate-stream` + `save-stream` (.167). Chunked Streaming funktioniert, aber nicht über `ws://`. |
| Interaktive Reading-Sessions (Reading + Chat) | ✅ `POST /api/readings/:readingId/chat` (.138) + **Live-Reading-Funnel** im Coach-Portal (`/live-reading/[sessionId]`, schrittweise geführte Session). |
| Real-Time Collaboration (mehrere User, Live-Annotation) | ❌ **Nicht gebaut.** Kein Multi-User-Collaboration-Layer. |

**Offene Lücke:** echte Mehrnutzer-Echtzeit-Kollaboration (gemeinsame Notizen/Highlights live).

---

## ✅ v6 — AI Coaching & Learning — **UMGESETZT & ÜBERTRIFFT SPEC** ✨

**Status: ✅ Voll live & an Abo-Stufen gekoppelt** (`lib/access/requirePackage.ts`:
coaching=VIP, learning/evolution=Premium).

| Roadmap-Feature | Realer Stand |
|-----------------|--------------|
| AI-Coaching-Sessions | ✅ `coaching_sessions`, Frontend `/v6/coaching` + Coach-Routen `/api/v6/coach/*` |
| Learning-Pfade | ✅ `learning_paths`, Frontend `/v6/learning` |
| Reading-Evolution-Tracker | ✅ ✨ **`evolution_analyses` + eigene Engine auf .138** (`evolution-worker.js`, Queue `reading-queue-v4-evolution`, Endpunkte `/api/readings/evolution/{start,:id,user/:userId}`) |

**✨ Übertrifft die PDF:** Die Roadmap sah Evolution als simplen Vergleich **zweier** Readings
(`compareReadings: [id1, id2]`). Real analysiert die Engine die **gesamte chronologische
Reading-Historie** + Coaching-Sessions + Lernpfade als Verlaufssignale, erdet das konstante
natale Chart als Faktenblock und fährt 2 Claude-Calls (strukturierte Analyse + Narrativ).
Dimensionen: Score, Not-Self→Signatur-Tracking, Autoritäts-Ausrichtung, Zentren-Evolution,
Zeitleiste, Coaching-Verknüpfungen.

---

## ❌ v7 — Marketplace & Custom Agents — **NICHT GEBAUT**

Kein Custom-Agent-Creator, kein Marketplace, kein Rating/Revenue-Sharing.
Keine `readings-v7`-Routen im Code.

---

## 🟡 v8 — Voice & Multimedia — **TEILWEISE / ANGRENZEND**

| Roadmap-Feature | Realer Stand |
|-----------------|--------------|
| Video-Readings (animierter Bodygraph + Voiceover des Readings) | 🟡 **Angrenzend:** Es gibt eine **generische, prompt-basierte Video-Generierung** (Runway/Seedance: `video-worker.js`, Queue `video-queue`, `POST /api/videos/generate`, Tabelle `video_jobs`, Bucket `generated-videos`, UI `VideoGenerationPanel`). Das ist **nicht** die geplante „Reading → animiertes Video"-Funktion. |
| Voice-Readings (TTS → MP3) | ❌ Nicht gebaut |
| AR/VR-Integration | ❌ Nicht gebaut |

---

## ❌ v9 — Global & Enterprise — **NICHT GEBAUT**

Multi-Language-Übersetzung, Team-/Enterprise-Analyse, White-Label, API-Gateway mit
Rate-Limiting/SLA: alles **nicht** umgesetzt. (Penta/Business-HD sind nur entfernt verwandt.)

---

## ❌ v10 — AI-Evolution & Autonomy — **NICHT GEBAUT**

Self-Learning Agents, Predictive Readings, autonome Agent-Orchestrierung: **nicht** umgesetzt.

---

## 🔧 Realität jenseits der Roadmap — gebaut, aber nicht in der PDF

Die echte Entwicklung folgte **nicht** dem v7→v10-Pfad, sondern wuchs in die **Breite**
(mehr Reading-Typen) und in **Content-Automation**. Diese Features existieren live, kommen
in der ursprünglichen Roadmap aber **gar nicht** vor:

**Zusätzliche Reading-Typen (.138 reading-worker):**
- Psychology-Readings (5 Linsen: Polyvagal, Attachment, Jung, Big Five, IFS) — `/api/readings/psychology/*`
- Shadow-Work — `/api/readings/shadow-work/*`
- Transit-Readings — `/api/readings/transit/*`
- Jahres-Readings — `/api/readings/jahres/*`
- Phasen-Readings — `/api/readings/phasen-reading/*`
- Tagesimpuls (+ Subscriber-Dispatch) — `/api/readings/tagesimpuls/*`

**Content-/Marketing-Automation (.138, nicht in der Roadmap):**
- Telegram-Channel-Content-Pipeline (`/api/channel/post-*`: Tagesimpuls, HD-Wissen,
  Inkarnationskreuze, Connection-Key, Transit-Ausblick, Business-Tipp, Social-Content u. v. m.)
- Newsletter-Draft-Generierung (`/api/newsletter/generate-draft`)
- Telegram-Bild-Verwaltung (`/api/admin/telegram-images/*`)

---

## 🎯 Empfohlene nächste Schritte (offene Roadmap-Lücken)

Priorisiert nach Nähe zum bereits Gebauten:

1. **v8 „Reading → Video/Voice"** — die Video-Pipeline existiert bereits; sie müsste „nur"
   mit Reading-Text (TTS/Voiceover) + Bodygraph-Animation gefüttert werden statt mit freiem Prompt.
2. **v5 Multi-User-Real-Time-Collaboration** — der größte Bruch in v5; Live-Reading-Sessions
   existieren bereits als Single-Coach-Funnel und wären die Basis.
3. **v7 / v9 / v10** — strategische Großprojekte ohne aktuelle Codebasis; bewusst entscheiden,
   ob sie noch verfolgt werden oder aus der Vision gestrichen werden.

---

*Dieses Dokument ersetzt `Reading_Evolution.pdf` als lebende Roadmap.*
*Abgleich-Methode: Grep/Read über beide Repos (Endpunkte, BullMQ-Queues, Worker, Frontend-Routen).*
