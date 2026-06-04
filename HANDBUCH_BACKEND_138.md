# Handbuch — Backend Server .138 (Connection-Key-MCP-Server)

**Stand:** 2026-06-04 · **Quelle:** Live-Code-Analyse des Repos `Connection-Key-MCP-Server`

Dieses Handbuch dokumentiert **vollständig** den Backend-Code von Server **.138** (`138.199.237.34`, Pfad `/opt/mcp-connection-key`): alle Services, Worker, Routen, Funktionen, Konfiguration und Datenflüsse, basierend auf dem tatsächlichen Repo-Stand.

---

## Inhaltsverzeichnis

1. [Service-Landschaft & Datenfluss](#1-service-landschaft--datenfluss)
2. [Connection-Key API (Port 3000)](#2-connection-key-api-port-3000)
3. [Chart-Engine (Swiss Ephemeris)](#3-chart-engine-swiss-ephemeris)
4. [MCP Core (`index.js`)](#4-mcp-core-indexjs)
5. [MCP Gateway (Port 7000)](#5-mcp-gateway-port-7000)
6. [Reading-Worker (Port 4000, BullMQ)](#6-reading-worker-port-4000-bullmq)
7. [Sync-Reading-Service (Port 7001)](#7-sync-reading-service-port-7001)
8. [Chart-Truth-Service (`services/`)](#8-chart-truth-service-services)
9. [production/ & chatgpt-agent/ (Legacy)](#9-production--chatgpt-agent-legacy)
10. [Reading-Templates](#10-reading-templates)
11. [Konfiguration, Docker & ENV](#11-konfiguration-docker--env)
12. [Bekannte Auffälligkeiten](#12-bekannte-auffälligkeiten--bugs)

---

## 1. Service-Landschaft & Datenfluss

```
                          ┌──────────────────────────────┐
   Frontend / n8n ───────▶│ connection-key  :3000        │  Express-API + Chart-Engine
   (x-api-key / JWT)      │  (server.js)                 │  (Swiss Ephemeris)
                          └───────┬──────────────────────┘
                                  │ x-api-key (CHART_SERVICE_URL)
                                  ▼
   BullMQ (Redis) ◀──────  reading-worker :4000  ──────▶ Anthropic / OpenAI
   v4.reading_jobs         (server.js, 7732 Z.)          (claude-sonnet-4-6 + Fallback)
                                  │
                                  ▼ Supabase (public + v4)

   ck-agent (.167) ──Bearer──▶  mcp-gateway :7000  ──spawn(stdio)──▶ index.js (MCP Core)
                               (16+ /agent/* Routen)                 (n8n-Webhook-Tools)
                               + production/agent-*.cjs (Claude/Canva/Figma/Runway)

   sync-reading-service :7001   (synchroner Claude-Wrapper, nur ANTHROPIC_API_KEY)
   redis-queue-secure :6379     (BullMQ-Broker, passwortgeschützt)
   n8n :5678                    (Workflows)
```

**Runtime:** Node.js 20 (Alpine), ESM (`"type": "module"`). Reverse-Proxy: Host-Nginx (systemd) für `werdemeisterdeinergedankenagent.de` → `:3000`.

---

## 2. Connection-Key API (Port 3000)

Verzeichnis `connection-key/`. Zentrale REST-API. Klasse `ConnectionKeyServer` in `server.js`.

### 2.1 Einstiegspunkt `server.js`

**Konstruktor:** baut `this.config` aus `options`, `config.js` und ENV. `enableAuth = options.enableAuth !== false` → **Default `true`**.

**Middleware-Reihenfolge (`setupMiddleware`):**
1. **CORS** — `origin: config.cors.allowedOrigins || "*"`, `credentials: true`.
2. **Stripe-Raw-Body** für `/api/stripe/webhook` (`express.raw`) — **vor** `express.json()`, damit die Signaturprüfung den unveränderten Body sieht.
3. **Body-Parser** — `express.json()` + `express.urlencoded({extended:true})`.
4. **Request-Logging** — `requestLogger`.
5. **`GET /health`** — registriert **vor** der Auth → `{status:"ok", service:"connection-key-server", timestamp, version:"1.0.0"}`.

**Routen-Mounting (`setupRoutes`):**
- Public (ohne Auth): `GET /` (Service-Info), `app.use("/api/stripe", stripeRouter)` (vor dem Auth-Router gemountet → Webhook + Checkout liegen außerhalb der zentralen Auth; Webhook prüft Signatur selbst).
- `apiRouter` mit `apiRouter.use(authMiddleware)` davor (wenn `enableAuth`). Gemountete Sub-Router:

| Mount | Datei | Charakter |
|---|---|---|
| `/chat` | `chat.js` | Proxy → reading-worker |
| `/reading` | `reading.js` | Proxy + Supabase |
| `/chart` **+** `/charts` | `chart.js` | Lokale Chart-Engine |
| `/matching` | `matching.js` | Proxy |
| `/live-reading` | `live-reading.js` | Proxy (300 s Timeout) |
| `/readings/shadow-work` | `shadow-work.js` | Proxy |
| `/readings/transit` | `transit.js` | Proxy |
| `/readings/jahres` | `jahres-reading.js` | Proxy |
| `/readings/relationship` | `relationship.js` | Proxy |
| `/readings/career` | `career.js` | Proxy |
| `/readings/health` | `health-reading.js` | Proxy |
| `/readings/emotions` | `emotions.js` | Proxy |
| `/readings/tagesimpuls` | `tagesimpuls.js` | Proxy |
| `/telegram` | `telegram.js` | Bot + Codes |
| `/impulse` | `impulse-image.js` **&** `impulse-dispatch.js` | beide auf `/impulse` |
| `/readings` | `readings-generic.js` | Catch-all-Proxy (zuletzt gemountet) |
| `/transits` | `transits.js` | Lokale Transit-Berechnung |
| `/user` | `user.js` | Supabase-Profil |

- **Inline-Route (mit Auth):** `POST /api/new-subscriber` — Upsert in `profiles` (`onConflict:'email'`), triggert bei vorhandenen Geburtsdaten ein `basic`-Welcome-Reading via `READING_AGENT_URL/api/readings/generic` (fire-and-forget), optionale Mattermost-Benachrichtigung.

**Error-Handling (`setupErrorHandling`):** 404-Catch-all `{success:false, error:"Endpoint nicht gefunden", path}` + globaler `errorHandler` als letztes Middleware.

### 2.2 Middleware

**`middleware/auth.js` — `authMiddleware` (async).** Drei Auth-Wege, greift nur wenn `config.auth.enabled`:
1. `!enabled` → durchlassen.
2. `PUBLIC_API_PATHS` (Set, enthält **nur** `/api/telegram/webhook`) → durchlassen.
3. **API-Key** (`x-api-key === config.auth.apiKey`) → `req.userId = x-user-id || "internal"`, `authMethod="api-key"`. Sonst 401.
4. **Supabase-JWT** (`Authorization: Bearer`) → lazy `getSupabase()`, `supabase.auth.getUser(token)`; gültig → `req.userId=user.id`, `req.userEmail`, `authMethod="supabase-jwt"`. Sonst 401.
5. **Legacy-Query-Key** (`?apiKey=`) → `req.userId="anonymous"`, `authMethod="query-key"`.
6. Sonst 401.

> `config.auth.jwtSecret` wird gesetzt, aber **nicht** zur Verifikation genutzt — Bearer-Tokens werden ausschließlich über Supabase verifiziert.

**`middleware/error-handler.js` — `errorHandler`:** loggt message/stack/path/method; `statusCode = err.statusCode||err.status||500`; Antwort `{success:false, error}`, im `development` zusätzlich `stack`+`details`.

**`middleware/logger.js` — `requestLogger`:** patcht `res.end`, misst Dauer, loggt `{method, path, statusCode, duration, ip, userAgent}`.

**`middleware/validation.js`:**
| Funktion | Prüft | Eingesetzt in |
|---|---|---|
| `validateChatRequest` | `userId`, `message` (≤5000 Zeichen) | `chat.js` |
| `validateReadingRequest` | `birthDate` (YYYY-MM-DD), `birthTime` (HH:MM), `birthPlace` | `reading.js` |
| `validateMatchingRequest` | `user1Chart`, `user2Chart` (Objekte) | `matching.js` |

### 2.3 Routen — vollständige Endpoint-Liste

**Reine Proxy-Router** (identisches Muster: `router.all("*")` → `axios` an `${READING_AGENT_URL}${präfix}${req.path}`, Original-Status zurück, bei Netzwerkfehler `502`):

| Datei | Mount → Ziel am reading-worker |
|---|---|
| `career.js` | `/api/readings/career` |
| `emotions.js` | `/api/readings/emotions` |
| `health-reading.js` | `/api/readings/health` |
| `jahres-reading.js` | `/api/readings/jahres` |
| `relationship.js` | `/api/readings/relationship` |
| `shadow-work.js` | `/api/readings/shadow-work` |
| `transit.js` | `/api/readings/transit` |
| `tagesimpuls.js` | `/api/readings/tagesimpuls` |
| `live-reading.js` | `/api/live-reading` (300 s Timeout) |
| `readings-generic.js` | `/api/readings` (Catch-all) |

**`chat.js` (`chatRouter`):**
| Methode | Pfad | Verhalten |
|---|---|---|
| POST | `/api/chat` | `POST READING_AGENT_URL/chat` (validiert). Fehlerdiff.: response→Status durchreichen, request→503, sonst `next(error)` |
| GET | `/api/chat/session/:userId` | `GET …/session/:userId` |
| DELETE | `/api/chat/session/:userId` | `DELETE …/session/:userId` |

**`reading.js` (`readingRouter`, Supabase lazy):**
| Methode | Pfad | Verhalten |
|---|---|---|
| POST | `/api/reading/generate` | `POST READING_AGENT_URL/reading/generate` (default `readingType:"detailed"`) |
| GET | `/api/reading/:readingId` | Supabase `coach_readings_v3` join `coach_readings_v3_edits`; 404 wenn fehlt |
| PATCH | `/api/reading/:readingId` | Upsert in `coach_readings_v3_edits` (`onConflict:"reading_id"`) |
| POST | `/api/reading/:readingId/answers` | Insert in `reflection_answers` |
| GET | `/api/reading/:readingId/answers` | Liest `reflection_answers` sortiert |

**`chart.js` (gemountet auf `/chart` + `/charts`):** lokale Konstanten `HD_CHANNELS` (36 Kanäle), `GATE_CENTER`.
| Methode | Pfad | Verhalten / Rückgabe |
|---|---|---|
| POST | `/api/chart/calculate` | `calculateHumanDesignChart()`. Persistiert bei `userId&&supabase` in `charts`. Rückgabe `{success, chartId, chart:{type,profile,authority,strategy,definition,incarnationCross,gates,channels,centers,personality,design,…}, source:"swiss-ephemeris", version:"2.0.0"}` |
| GET | `/api/chart/:chartId` | Supabase `charts` lesen; 503 ohne Supabase, 404 wenn fehlt |
| POST | `/api/chart/composite` | ≥2 Personen; Charts parallel; `classifyCompositeConnections(HD_CHANNELS, gatesByPerson)`; Rückgabe `{persons:[charts], composite:{gates,channels,centers,connections}}` |

**`matching.js` (`matchingRouter`):**
| Methode | Pfad | Verhalten |
|---|---|---|
| POST | `/api/matching` | `?method=agent` (default): Prompt → `POST READING_AGENT_URL/chat`; sonst `POST …/matching` |
| GET | `/api/matching/:matchId` | **Stub** (keine DB-Anbindung) |

**`user.js` (`userRouter`):** `PUBLIC_FIELDS` (lesbar, inkl. `hd_*`), `UPDATABLE_FIELDS` (Whitelist ohne `id/email/role/subscription_tier/hd_*`).
| Methode | Pfad | Verhalten |
|---|---|---|
| GET | `/api/user/:userId` | `profiles.select(PUBLIC_FIELDS).maybeSingle()`; 503/404 |
| PUT | `/api/user/:userId` | Update gefiltert auf Whitelist; 400 wenn keine erlaubten Felder |

**`transits.js` (gemountet `/transits`):** Helfer `getMoonPhase` (8 Phasen), In-Memory `todayCache` (1 h).
| Methode | Pfad | Verhalten |
|---|---|---|
| GET | `/api/transits/current` | `getCurrentTransits()` (1 h Cache) |
| GET | `/api/transits/year/:year` | 400 außerhalb 1900–2100; 12 Monats-Snapshots |
| GET | `/api/transits/today` | `?date=` optional; vollständiges Chart + activeChannels/definedCenters/cross/moonPhase; Upsert `daily_transits` |
| GET | `/api/transits/month/:year/:month` | tägliche Snapshots (Jahr/Monat validiert) |

**`impulse-image.js` (Puppeteer, `/impulse`):**
| Methode | Pfad | Verhalten |
|---|---|---|
| POST | `/api/impulse/generate-image` | `store=true`→Storage-Upload `{url}`, `store=false`→PNG-Buffer inline. Formate `story` (1080×1920) / `feed` (1080×1350) |
| POST | `/api/impulse/store-image` | erzwingt Storage-Upload |

**`impulse-dispatch.js` (Multi-Channel, `/impulse`):**
| Methode | Pfad | Verhalten |
|---|---|---|
| POST | `/api/impulse/dispatch` | Quelle: Text / `impulseData` / DB-Lookup. Kanäle parallel (`Promise.allSettled`): `telegram`, `canva-story`, `canva-feed`. 200 wenn alle ok, sonst 207 |

**`telegram.js` (`/telegram`, Supabase lazy):**
| Methode | Pfad | Verhalten |
|---|---|---|
| POST | `/api/telegram/send-impulse` | formatiert via `formatImpulseForTelegram`, sendet via n8n-Webhook oder Telegram-API |
| POST | `/api/telegram/send-reel` | `formatReelForTelegram` |
| POST | `/api/telegram/send-raw` | Direktversand ohne Formatierung; 503 ohne Token |
| POST | `/api/telegram/webhook` | **Public.** Reagiert auf `/start <code>`: `telegram_codes` nachschlagen, `telegram_chat_id` in `profiles` speichern, Code als benutzt markieren |
| GET | `/api/telegram/status/:userId` | liefert `connected`/`pendingCode`/`link`/`expiresAt` |
| POST | `/api/telegram/generate-code` | erzeugt/wiederverwendet Code (`crypto.randomBytes(4).base64url`, 8 Zeichen, 7 Tage) |

**`stripe.js` (`stripeRouter`, vor Auth gemountet):** `priceIdMap` mappt 13 Pakete auf ENV-Price-IDs; Helfer `notifyMattermost`, `triggerWelcomeReading`, `getStripeClient` (`apiVersion:'2024-11-20.acacia'`).
| Methode | Pfad | Verhalten |
|---|---|---|
| POST | `/api/stripe/create-checkout-session` | Subscription bei `basic/premium/vip`, sonst `payment`. Rückgabe `{success, data:{sessionId, url}}` |
| POST | `/api/stripe/webhook` | **Public, Signaturprüfung** (`constructEvent`). Behandelt `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`. Welcome-Reading-Trigger + Mattermost |

---

## 3. Chart-Engine (Swiss Ephemeris)

`connection-key/lib/astro/chartCalculation.js` (1192 Z.) — **die produktive, einzige Wahrheitsquelle** für Chart-Berechnung zur Laufzeit. Importiert `swisseph` (C-Addon), `geo-tz`, `luxon`. Setzt beim Laden `swe_set_ephe_path(.../ephe)` (für Chiron/Asteroiden, z. B. `seas_18.se1`).

**Datenkonstanten:** `GATE_SPANS` (64 Gates, je 5.625°, Start Gate 25 @ 358.25°), `CHANNELS` (36), `GATES` (64 Namen), `CENTER_KEYS` (9 Zentren), `CHANNEL_NAMES`/`CHANNEL_NAMES_DE` (DE = Source-of-Truth fürs LLM), `CROSS_THEMATIC_DE`, `JUXTAPOSITION_NAMES(_DE)`, `OPPOSITE_GATES`, `RAX_LAX_MAP`, Swiss-Ephemeris-IDs.

**Datenquellen-Lader (Modul-Cache):**
- `loadCrosses192()` — `crosses/incarnation_crosses_192.json` (Primär, 192 Kreuze, Lookup `(pSunGate)-(AngleType)`, Quelle SharpAstrology).
- `loadCrossesMaster()` — `crosses/incarnation_crosses_master.json` (Fallback, 4-Gate-Keys, Q2/Q3-Themen).

**Hilfsfunktionen:** `norm360`, `gateForLongitude`, `lineForLongitude`, `geocodePlace` (Nominatim/OSM), `parseDate`/`parseTime` (robust), `dateToJD`, `getSwissLongitude` (`swe_calc_ut`), `calcDesignJD` (**Design-Zeitpunkt per Binärsuche: Sonne exakt 88° vor Geburtssonne**, 50 Iterationen), `getCrossKey`, `getIncarnationCross` (Cross-Type aus **vollem Profil** über `PROFILE_ANGLE`-Map — behebt den 4/6-Bug; 192er-Lookup primär, Master-Fallback).

**Haupt-Export `async calculateHumanDesignChart({birthDate, birthTime, birthPlace})`:**
- Ablauf: Geocoding → Zeitzone → UTC (luxon) → JD Personality (`jdP`) + Design (`jdD` via 88°-Binärsuche).
- 11 Planeten (Sonne…Pluto, True Node) + abgeleitete Punkte: **Earth** = Sonne+180°, **South-Node** = True Node+180° (P & D).
- **Stille Flüsterer** (`silentPlanets`): Chiron + Lilith (Mean Apogee) — angezeigt mit `silent:true`, beeinflussen aber **nicht** Gates/Kanäle/Zentren/Typ/Autorität.
- **Kanäle:** aktiv wenn beide Gates aktiv → zugehörige Zentren `true`.
- **Typ** (Graph-Traversal `isCenterConnectedToThroat`/`isAnyMotorConnectedToThroat`; Motoren = Sacral/Solar-Plexus/Heart/Root): alle offen→`Reflector`; Sacral→`Manifesting Generator` (Motor↔Throat) sonst `Generator`; Throat ohne Sacral→`Manifestor` (Motor↔Throat) sonst `Projector`; sonst `Projector`.
- **Autorität:** Reflector→Lunar; SolarPlexus→Emotional; Sacral→Sacral; Spleen→Splenic; Heart→Ego; G+Throat→Self-Projected; sonst Mental.
- **Definition** (`countConnectedComponents`): 0=None, 1=Single, 2=Split, 3=Triple Split, ≥4=Quadruple Split.
- **Strategie** (`strategyMap`, deutsch), **Inkarnationskreuz** via `getIncarnationCross`.
- **Rückgabe:** `type, profile, authority, strategy, definition, incarnationCross, centers, channels (name/name_de), gates (number+name), personality:{planets}, design:{planets}` + `personalityPlanets`/`designPlanets` (sortierte Arrays).

**`composite.js` — `classifyCompositeConnections(channels, gatesByPerson)`:** klassifiziert pro Kanal **genau eine** Kategorie: `parallel`, `companionship`, `compromise` (+ `dominance`-Alias bei genau 2 Personen), `electromagnetic`. Abgesichert durch `test/composite-classification.test.js` (14 `node:test`-Tests).

**`utils/transit-calculator.js`:** `getCurrentTransits()` (1 h Cache), `getTransitsForYear(year)` (12 Monats-Snapshots, Cache/Jahr), `getTransitsForMonth(year,month)` (tägliche Snapshots + Mondphase mit Emoji). Nutzt zweite `GATE_SPANS`-Kopie aus `utils/gate-mapping.js`.

**`lib/impulseImage.js`:** `buildImpulseHtml(...)` (gebrandetes HTML), `renderHtmlToPng(...)` (Puppeteer headless), `generateAndStoreImpulseImage(...)` (Storage-Bucket `impulse-images`). **`lib/telegramFormatter.js`:** `escapeMarkdownV2`, `formatImpulseForTelegram`, `formatReelForTelegram`.

---

## 4. MCP Core (`index.js`)

MCP-Server (`@modelcontextprotocol/sdk`, `McpServer` + `StdioServerTransport`). **Kein eigener Container** — wird vom MCP-Gateway per `spawn('node', ['index.js'])` über stdio gestartet.

| Tool | Beschreibung |
|---|---|
| `ping` | Antwortet `pong` |
| `echo` | Gibt `text` zurück |
| `getDateTime` | Datum/Zeit, optional `timezone`, `toLocaleString("de-DE")` |
| `calculate` | Mathe-Ausdruck (Filter `[^0-9+\-*/().\s]` + `Function`, `isFinite`-Check) |
| `generateUUID` | UUID v4 (Default) / v1 |
| `callN8N` | Generischer n8n-REST-Aufruf (`X-N8N-API-KEY`) |
| `createN8NWorkflow` | `POST /api/v1/workflows` |
| `triggerN8NWebhook` | n8n-Webhook auslösen (`/webhook/<path>`) |
| `generateReading` | HD-Reading via n8n-Webhook `/webhook/reading` (harte Feldvalidierung) |
| `analyzeChart` | Chart-Analyse via `/webhook/chart-analysis` |
| `matchPartner` | Matching via `/webhook/matching` |
| `saveUserData` | User-Daten via `/webhook/user-data` |

> Alle HD-/Matching-/User-Tools sind reine **n8n-Webhook-Proxies** (keine eigene Berechnung). **Bug:** `generateReading` referenziert undefinierte Variable `chartData` in der Response (`index.js:527/547`).

---

## 5. MCP Gateway (Port 7000)

`mcp-gateway.js` — Express. Lädt 7 CommonJS-Agent-Handler aus `production/*.cjs`. Anthropic-Client via `ANTHROPIC_API_KEY`. **Beendet sich, wenn `MCP_API_KEY` fehlt.**

**Auth (`authMiddleware`):** **nur** auf `/agents/run`. Erwartet `Authorization: Bearer <token>` exakt = `MCP_API_KEY` (in docker-compose aus `CK_AGENT_SECRET`). Die dedizierten `/agent/*`-Routen haben **keinen** Auth-Check.

**Concurrency:** globales `isProcessing` → `/agents/run` max. 1 Request gleichzeitig (sonst 429 `BUSY`).

**`AGENT_SYSTEM_PROMPTS`:** deutsche System-Prompts für `marketing`, `automation`, `sales`, `social-youtube`, `chart`, `ui-ux`, `yearly`, `depth-analysis`, `tasks`.

**Routen:**
| Pfad | Handler | Modell |
|---|---|---|
| `GET /health` | inline | Status + `claude: !!ANTHROPIC_API_KEY` |
| `POST /agent/marketing` | `handleMarketingAgent` | Claude + Canva-MCP |
| `POST /agent/sales` | `handleSalesAgent` | Claude + Canva-MCP |
| `POST /agent/social-youtube` | `handleSocialAgent` | Claude + Canva + Content-Topics |
| `POST /agent/video` + `/agent/video-creation` | `handleVideoAgent` | Claude (Text/Skripte) |
| `POST /agent/video/generate` | `handleVideoGenerate` | Runway/Seedance, async |
| `GET /agent/video/status/:taskId` | `handleVideoStatus` | Runway-Polling |
| `POST /agent/ui-ux` | `handleDesignAgent` | Claude + Canva **+ Figma** MCP |
| `POST /agent/knowledge` | `handleKnowledgeAgent` | actions: list/get/search/ask |
| `POST /agent/chart` | `makeSimpleAgent('chart')` | claude-sonnet-4-5, 2000 tok |
| `POST /agent/automation` | `makeSimpleAgent('automation')` | dito |
| `POST /agent/yearly` | `makeSimpleAgent('yearly')` | dito |
| `POST /agent/depth-analysis` | `makeSimpleAgent('depth-analysis')` | dito |
| `POST /agent/tasks` | `makeSimpleAgent('tasks')` | dito |
| `POST /agent/chart-architect` | inline | claude-sonnet-4-5, eigener Bodygraph-Prompt |
| `POST /agent/reading` | inline | 4 Typen (business/relationship/crisis/personality); Placeholder ohne Key |
| `POST /agents/reading` | inline (Legacy) | `{ok,result}`; 503 ohne Key |
| `POST /agents/run` | inline, **mit Auth** | Generischer Dispatcher |
| `POST /agent/reflection` | `runAgent` | claude-sonnet-4-5, 300 tok |
| `POST /agent/shadow-work` | `runAgent` | 500 tok |
| `POST /agent/relationship` | `runAgent` | 600 tok (chartA+chartB) |
| `POST /agent/transit` | `runAgent` | 500 tok (chart+currentTransits) |
| `POST /agent/business-hd` | `runAgent` | 600 tok |
| `POST /agent/emotions` | `runAgent` | 400 tok |
| `POST /agent/health` | `runAgent` | 500 tok |
| `POST /agent/abundance` | `runAgent` | 500 tok |

- **`makeSimpleAgent(name)`:** Factory; Body `{message, userId, chartData, context}`; baut `contextBlock`; ohne Key → Placeholder; sonst `anthropic.messages.create({model:'claude-sonnet-4-5', system: AGENT_SYSTEM_PROMPTS[name], max_tokens:2000})`.
- **`runAgent(...)`:** gemeinsame Hilfe für reflection/shadow-work/relationship/transit/business-hd/emotions/health/abundance, Modell fix `claude-sonnet-4-5`.
- **`/agents/run`-Dispatcher:** validiert `domain`/`task`/`payload`; Spezial-Validierung für `reading/generate`; spawnt MCP-Core, JSON-RPC `tools/call` (`name = reading+generate ? 'generateReading' : <domain>_<task>`), parst letzte JSON-Zeile, normalisiert auf `{success, requestId, data:{readingId,reading,chartData,tokens}, error, runtimeMs}`.

> **Modellhinweis:** Gateway + alle `production/`-Agenten nutzen hart `claude-sonnet-4-5` (kein Fallback). Nur der reading-worker nutzt `claude-sonnet-4-6` mit Fallback-Kette.

**`production/`-Agent-Handler (vom Gateway eingebunden):** alle `claude-sonnet-4-5`, brand-spezifische Prompts, optionaler `chartContext`-Inject:
- `agent-marketing.js` (`handleMarketingAgent`) — Canva-MCP, Tool-Use-Schleife, max_tokens 4096.
- `agent-sales.js` (`handleSalesAgent`).
- `agent-social.js` (`handleSocialAgent`) — Canva + Content-Topics (`loadContentTopics()`), Usage-Tracking in `content_topic_usage`.
- `agent-video.js` (`handleVideoAgent`) — nur Text/Skripte/Storyboards.
- `agent-video-generation.js` (`handleVideoGenerate`/`handleVideoStatus`) — **echte Videos via Runway SDK** (`seedance2`); Modi text/image/reference; async; 503 ohne `RUNWAYML_API_SECRET`.
- `agent-design.js` (`handleDesignAgent`) — **einziger mit Canva UND Figma MCP**.
- `agent-knowledge.cjs` (`handleKnowledgeAgent`) — actions list/get/search/ask; auch CLI-fähig.

> **`.cjs`-Mapping:** Gateway `require('./production/agent-*.cjs')` funktioniert nur, weil `Dockerfile.mcp-gateway` die `.js`-Dateien beim Build nach `.cjs` umkopiert.

---

## 6. Reading-Worker (Port 4000, BullMQ)

`reading-worker/server.js` (7732 Z.) — zentraler, aktiver Worker. ESM, Express (`express.json({limit:'15mb'})`).

### 6.1 Infrastruktur
- **Chart-Service:** `CHART_SERVICE_URL` (Default `http://connection-key:3000/api/chart/calculate`). `fetchChartData()` ruft die Chart-API mit `x-api-key: process.env.API_KEY` (Timeout 15 s) → **Single Source** ist die connection-key-Engine. `fetchChartFromReading(personId)` lädt Chart aus `public.readings`.
- **Supabase:** zwei Clients — `supabase` (Schema `v4`) + `supabasePublic` (Schema `public`).
- **Redis/BullMQ:** `IORedis` (`REDIS_HOST`, Port 6379, Passwort, `maxRetriesPerRequest:null`).
- **`MODEL_CONFIG`:** `claude-sonnet` (Kette `claude-sonnet-4-6` → `claude-sonnet-4-5-20250929` → `claude-sonnet-4-20250514`, 16000 tok), `claude-opus`, `claude-haiku`, `gpt-4o`, `gpt-4o-mini`. **`DEFAULT_MODEL = "claude-sonnet"`**.
- **Clients:** `anthropicClient` (maxRetries 4), `openaiClient`. Timeouts: `CLAUDE_TIMEOUT_MS` (Default 120000), `WORKER_LOCK_DURATION_MS` (Default 480000).
- **`READING_STRICT_MODE`** (Default true) → `STRICT_FIDELITY_SYSTEM_RULE` (Chart-Treue), ersetzt `buildChartInfo()` durch `buildFactsBlock()`.

### 6.2 KI-Kernfunktionen
- **`generateWithClaude(prompt, options)`** — Default `claude-sonnet-4-6`, 8000 tok, temp 0.8; **Continuation-Schleife** (max 3) bei `stop_reason==='max_tokens'`; Timeout via `Promise.race`.
- **`generateWithOpenAI(prompt, options)`** — analog mit `gpt-4o`.
- **`generateReading({agentId, template, userData, chartData})`** — zentraler Dispatcher. Modell-Normalisierung + Provider-Fallback. `TEMPLATE_MAP`. Routet zu 2-Pass-Spezialfunktionen: `detailed`→`generateDetailedReadingTwoParts`, `business/career/life-purpose`→`generateBusinessReadingTwoParts`, `shadow-work`→`generateShadowWorkTwoParts`. Sonst: Template laden → Placeholder ersetzen → `buildReadingKnowledge` → Transit-Overlay → Delta-Kontext → System-Prompt mit Strict-Fidelity.

**Weitere Generierungsfunktionen:** `generateTwoParts`, `generateConnectionReadingTwoParts`, `generateLifePurposeTwoParts`, `generateCareerTwoParts`, `generatePhasenReadingTwoParts`, `generateReflexionsfragen`, `generateConnectionReflexionsfragen`, `generatePhasenReflexionsfragen`, `generateMultiAgentSynthesis`. **Prompt-Bau:** `formatChartCenters/Channels/Gates`, `formatPlanetActivations`, `buildChartInfo`, `buildKnowledgeText`, `formatVariablePHS`, `buildTransitOverlay`, `buildDeltaContext`, `buildReadingKnowledge`, `buildChartPlaceholders`/`applyPlaceholders`, `buildTuningInstructions`, `buildTwoPersonCompositeBlock`. **Analyse:** `analyzePentaDynamics`, `calculatePentaChart`, `analyzeConnectionDynamics`, `areConnectedGates`, `getTypeInteractionNote`, `calculatePhase`, `calcTransitCrossReference`.

### 6.3 BullMQ-Worker (konsumierte Queues)
| Worker | Queue |
|---|---|
| `workerV3` | `reading-queue` |
| `workerV4` | `reading-queue-v4` |
| `connectionWorker` | `reading-queue-v4-connection` |
| `pentaWorker` | `reading-queue-v4-penta` |
| `multiAgentWorker` | `reading-queue-v4-multi-agent` |
| Psychology-Worker | `reading-queue-v4-psychology` |
| Video-Worker | `video-queue` |

**Job-Flow (V4):** Job `{readingId}` → Reading aus `public.readings` laden → `reading_jobs.status=processing, progress=10` (v4) → Chart laden/neu berechnen → progress 30 → `userData` bauen → `generateReading()` → Ergebnis + `status=completed`. Fehlerpfade → `status=failed`.

**`pollForJobs()`** — Polling-Fallback gegen `v4.reading_jobs` (pending). **`recoverStaleJobs()`** — übernimmt hängende Jobs.

**Process-Funktionen:** `processHumanDesignJob`, `processConnectionJob`, `processPentaJob`, `processMultiAgentJob` (ruft `runAgent` pro Agent + Synthese), `processTagesimpulsJob`, `processPhasenReadingJob`, `processChannelAnalysisJob`, `processSexualityJob`.

### 6.4 HTTP-Routen (Auswahl)
- `POST /api/chart/calculate` — Chart-Proxy zu connection-key.
- Psychology: `POST /api/readings/psychology/start`, `GET /api/readings/psychology/:id`.
- Video: `POST /api/videos/generate`, `GET /api/videos/:id`.
- Shadow-Work / Phasen / Transit / Jahres / Tagesimpuls: jeweils `.../start` + `.../status/:job_id`.
- Generisch: `POST /api/readings/:type/start`, `GET /api/readings/:type/status/:job_id`.
- Chat/Stream: `POST /api/readings/:readingId/chat`, `POST /api/readings/stream` (SSE).
- Live-Reading: `app.use("/api/live-reading", createLiveReadingRouter(supabase))`.
- Admin (Basic-Auth via `requireAdminAuth`): `GET /admin/reading-health`, `.../recent`, `GET /admin/posts`.
- `GET /health` (meldet `chartService`-URL).
- **Telegram-Channel-Content:** zahlreiche `POST /api/channel/post-*` (Tagesimpuls/Marketing/HD-Wissen/Inkarnationskreuze/Connection-Key/Abend-Reflexion/Beziehung/Transit/Business/Video/Social/Custom), `GET/PATCH/DELETE /api/channel/content[/:id]`.
- Newsletter (Mailchimp): `POST /api/newsletter/generate-draft`.
- Telegram-Bild-Verwaltung (API-Key via `requireApiKey`): `GET/POST/DELETE/PATCH /api/admin/telegram-images/...`.
- `app.listen(4000)`.

### 6.5 `reading-worker/workers/`
- **`psychology-worker.js`** — Queue `reading-queue-v4-psychology`, `claude-sonnet-4-6`. `processJob` generiert 4 JSON-Analysen (Polyvagal, Attachment, Jungian, BigFive) via `claudeJSON()` + Synthese via `claudeText()`.
- **`video-worker.js`** — Queue `video-queue`, Runway/Seedance; `processJob` ruft Runway, pollt, lädt Video, aktualisiert Supabase. 503 ohne `RUNWAYML_API_SECRET`.

### 6.6 `reading-worker/lib/`
- **`live-reading/routes.js`** — `createLiveReadingRouter(supabase)`: `POST /session`, `GET /session/:id`, `POST /session/:id/step/:stepId/generate`, `PUT /session/:id/step/:stepId/notes`, `POST /session/:id/complete`. + `generator.js`, `prompts.js`, `session.js`, `templates.js`.
- **`facts-builder.js`** — `buildFactsBlock`, `formatCompositeBlock`, `formatConditioningMatrix` (Strict-Mode-Faktenblock).
- **`composite-classification.js`** — `HD_CHANNELS`, `classifyCompositeConnections`, `classifyTwoPersonChannels`.
- **`incarnation-cross-helper.js`** — `loadCrossesData`, `getCrossName(De)`, `buildCrossPromptFragment`.
- **`transitCrossReference.js`** — `calculateCrossReference(transitData, clientChart)`.
- **`sectionParser.js`** / **`sectionsWriter.js`** — Reading-Abschnitte parsen/in Supabase schreiben.
- **`reading-pipeline.js`** — Qualitäts-Pipeline: `setPipelineSupabase`, `validateReading`, `correctReading`, `runReadingPipeline` (Validator→Corrector→Sections-Persistenz).
- `context-builder.js`, `loadKnowledge.js`, `openai.js`, `agent-map.js`, `generateReading.js` (eigenständige Mini-Variante, **nicht** der Haupt-Pfad).

### 6.7 Weitere Dateien
`processV4Job.js`, Alt-/Backup-Versionen (`server-v4-enhanced.js`, `server-production-original.js`, `server.js.v3-working`), `scripts/` (`backfillSections.js`, `rls-smoke.sql`), `tests/`, `knowledge/` (HD-Wissen + `brandbook/`), `images/` (Telegram-Post-Bilder), `data/` (Inkarnationskreuz-JSON).

---

## 7. Sync-Reading-Service (Port 7001)

`sync-reading-service/server.js` (189 Z.). Modell aus `SYNC_READING_MODEL` (Default `claude-sonnet-4-5`), `MAX_TOKENS` Default 2200. Nur `ANTHROPIC_API_KEY` nötig (keine Supabase-Anbindung) — rein **synchroner Claude-Wrapper**.

- `GET /health` — Status + Modell.
- `POST /reading/generate` — synchroner Reading-Aufruf.

**`TYPE_ALIASES`:** `basic`/`personality`→`basic`, `relationship`/`resonance`→`relationship`, `business`→`business`, `detailed`→`detailed`.

**`buildPrompts(readingType, body)`:**
- `relationship`: `{person1, chart1, person2, chart2}` → `buildRelationshipUserPrompt` (Fakten deterministisch); Fallback `message`.
- `basic`: `{person, chart}` → `buildPersonalityUserPrompt`; Fallback `message`.
- `business`/`detailed`: nur `message` (legacy).

**`stripHedging(text)`:** entfernt Konjunktiv-/Vagheitsphrasen aus der Claude-Antwort. Liefert `{ok, result, metadata{readingType, promptMode, tokens, model, runtimeMs}}`.

`lib/`: `prompt-builder.js`, `channels.js`, `relationship-facts.js`.

---

## 8. Chart-Truth-Service (`services/`)

`services/chart-truth/chartTruthService.ts` (353 Z.) — versionierte „Single Source of Truth"-Variante (separate TS-Implementierung). Lädt `chart-calculation-astronomy.js` zur Laufzeit.

- **`getChartTruth(input): ChartTruthOutput`** — Hauptfunktion. `input_hash` (createHash), Dedupe pro `(input_hash, chart_version)`, Versionsvalidierung.
- **`getSupportedVersions()`** — gibt `CHART_VERSIONS` zurück.
- Intern: `calculateChartByVersion` (Switch), `calculateChartV1` (Astronomy-Engine 1.0.0), **`calculateChartSwiss` — STUB** für Swiss Ephemeris (1.1.x experimental).
- Typen: `ChartTruthInput`/`ChartTruthOutput`. `DEFAULT_CHART_VERSION='1.0.0'`.
- Grundregel (`chartVersioning.md`): „Ein Chart ist für immer in seiner Berechnungsversion gültig — nie überschreiben/migrieren."
- Tests: `chartTruthService.test.ts` (Determinismus), `tests/c1-versioning-tests.ts`.

> **Wichtig:** Der **produktive** Chart-Pfad ist `connection-key/lib/astro/chartCalculation.js` (echtes `swisseph`). Dieser TS-Service ist eine parallele, versionierte Variante mit Swiss-Ephemeris-**Stub**.

---

## 9. production/ & chatgpt-agent/ (Legacy)

**`production/`** — die `agent-*.js`-Handler sind **aktiv** (vom Gateway eingebunden, siehe §5). Der **Standalone-Server `production/server.js`** (Port 4000, eigenes `package.json` „reading-agent-production", `@anthropic-ai/sdk@0.39`) ist die **Legacy-Vorläufer-Variante** des reading-workers:
- `GET /health`, `POST /reading/generate`, `POST /admin/reload-knowledge`, `POST /admin/reload-templates`, `app.listen(PORT,'0.0.0.0')`.
- 11 Templates + 5 Knowledge-Dateien. **Nicht im docker-compose** → läuft nicht als Container.
- Enthält `agents/registry.ts`, `tests/`, `start.sh`, `env.example`.

**`chatgpt-agent/`** — OpenAI-basierter Agent (GPT-4o). **Legacy/inaktiv** (kein laufender Container, Build via `Dockerfile.agent`):
- `server.js`: `GET /health`, `POST /chat`, `GET/DELETE /session/:userId`, `POST /reading/generate`, `POST /matching`.
- `agent.js` (`ChatGPTAgent`-Klasse): OpenAI + MCP-Client + Memory + Tool-Registry. `mcp-client.js`, `memory.js`.
- `tools/`: `index.js` (`ToolRegistry`), `human-design.js`, `n8n.js`, `user.js`.

---

## 10. Reading-Templates

`reading-worker/templates/` (42 Dateien):

- **Single/Detail:** `basic.txt`, `single.txt`, `detailed.txt`, `depth-analysis.txt`, `correct-reading.txt`, `validate-reading.txt`, `default.txt`.
- **Themen:** `business.txt`, `career.txt`, `life-purpose.txt`, `emotions.txt`, `health.txt`, `geld-ueberfluss.txt`, `sexuality.txt`, `shadow-work.txt`, `trauma.txt`, `spiritual.txt`, `kinder.txt`, `parenting.txt`, `reflection.txt`, `reflection-profiles.txt`, `variable-phs.txt`, `channel-analysis.txt`.
- **Beziehung/Mehrpersonen:** `relationship.txt`, `compatibility.txt`, `connection.txt`, `connection-basic.txt`, `penta.txt`, `penta-basic.txt`, `penta-communication.txt`.
- **Zeit/Phasen:** `transit.txt`, `jahres-reading.txt`, `phasen-reading.txt`.
- **Telegram-Channel:** `tagesimpuls.txt`, `tagesimpuls-reel.txt`, `channel-tagesimpuls.txt`, `channel-abend-reflexion.txt`, `channel-beziehungs-geschichten.txt`, `channel-connection-key.txt`, `channel-gelebtes-design.txt`, `channel-hd-wissen.txt`, `channel-inkarnationskreuze.txt`, `channel-marketing.txt`.

(`production/templates/` enthält separat eine kleinere Legacy-Menge von 11 Templates.)

---

## 11. Konfiguration, Docker & ENV

### 11.1 `connection-key/config.js`
| Pfad | ENV | Default |
|---|---|---|
| `port` | `PORT` | `3000` |
| `readingAgent.url` / `.timeout` | `READING_AGENT_URL` / `READING_AGENT_TIMEOUT` | `http://localhost:4000` / `30000` |
| `mcpServer.url` / `.timeout` | `MCP_SERVER_URL` / `MCP_SERVER_TIMEOUT` | `http://localhost:7777` / `30000` |
| `n8n.baseUrl` / `.apiKey` | `N8N_BASE_URL` / `N8N_API_KEY` | `http://localhost:5678` / `""` |
| `auth.enabled` | `AUTH_ENABLED` | `true` (nur `"false"` deaktiviert) |
| `auth.apiKey` | `API_KEY` ‖ `CONNECTION_KEY_API_KEY` | `""` |
| `auth.jwtSecret` | `JWT_SECRET` | `"change-me-in-production"` (ungenutzt für Verifikation) |
| `cors.allowedOrigins` | `CORS_ORIGINS` (kommagetrennt) | localhost-Liste |
| `rateLimit.*` | `RATE_LIMIT_*` | gesetzt, **aber im Code nirgends angewendet** |
| `logging.*` | `LOG_LEVEL`/`LOG_FORMAT` | deklarativ |

`config-with-supabase.js` exportiert `supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)` und **wirft beim Import**, wenn ENV fehlen (daher in Routen `try/await import(...)` gekapselt).

### 11.2 `docker-compose.yml` (6 Services, Netz `app-network`)
- **n8n** (`:5678`) — Basic-Auth.
- **mcp-gateway** (`:7000`) — `MCP_API_KEY=${CK_AGENT_SECRET}`, Anthropic/OpenAI/Supabase/Canva/Runway, Volume `content-topics:ro`.
- **connection-key** (`:3000`) — `AUTH_ENABLED=${AUTH_ENABLED:-true}`, `CORS_ORIGINS=${CORS_ORIGINS:-*}`, Redis, Supabase, Telegram, **13 Stripe-Price-IDs**. `depends_on: n8n, redis`.
- **reading-worker** (`:4000`) — OpenAI/Anthropic, Supabase, Redis, Runway, `AGENT_SECRET`, `CLAUDE_TIMEOUT_MS:-300000`, Telegram (inkl. VIP-Threads), `CRON_SECRET`, Mattermost, Mailchimp. Volumes: `knowledge`, `templates`, `content-topics:ro`, `images:rw`.
- **sync-reading-service** (`:7001`) — nur `ANTHROPIC_API_KEY`.
- **redis** (`redis:7-alpine`, `redis-queue-secure`) — passwortgeschützt, appendonly, Healthcheck.

Frontend-Service auskommentiert, v4-reading-worker deaktiviert. Volumes: `n8n_data`, `redis_data`.

### 11.3 `package.json` (Root, ESM)
Scripts: `start` (index.js), `start:agent` (chatgpt-agent), `start:connection-key`, `start:all` (concurrently), `build` (`tsc --noEmit`). Deps: `@anthropic-ai/sdk@^0.78`, `@modelcontextprotocol/sdk@^1`, `@runwayml/sdk@^3.21`, `@supabase/supabase-js`, `astronomy-engine`, `axios`, `cors`, `express`, `geo-tz`, `luxon`, `openai@^4.104`, `puppeteer-core`, `stripe@^20.1`. (`swisseph`, `bullmq`, `ioredis` werden in den jeweiligen Dockerfiles/Workern installiert.)

### 11.4 Dockerfiles
- **`Dockerfile.connection-key`** — node:20-alpine + python3/make/g++/swisseph + **Chromium** (Puppeteer); `npm ci --only=production && npm install swisseph`; Port 3000.
- **`Dockerfile.mcp-gateway`** — node:20-alpine; **mappt `production/agent-*.js` → `.cjs`** beim Build; kopiert `knowledge`+`templates`; Port 7000.
- **`Dockerfile.agent`** — chatgpt-agent, Port 4000 (**inaktiv**).
- **`Dockerfile.mcp`** — index.js, Port 7777 (**inaktiv**, Core läuft nur via Gateway-Spawn).

### 11.5 ENV (`.env.example` + in Routen direkt gelesen)
OpenAI (`OPENAI_API_KEY`, `OPENAI_MODEL=gpt-4o`), n8n, Auth (`AUTH_ENABLED`, `API_KEY`, `CONNECTION_KEY_API_KEY`, `JWT_SECRET`), CORS, Runway (`RUNWAYML_API_SECRET`, `RUNWAY_VIDEO_MODEL=seedance2`). Zusätzlich direkt gelesen: Supabase (`SUPABASE_URL`/`SUPABASE_SERVICE_KEY` bzw. `NEXT_PUBLIC_*`/`SERVICE_ROLE_KEY`), Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `APP_URL`, 13 Price-IDs), Telegram (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`), Mattermost-Webhooks, Puppeteer (`PUPPETEER_EXECUTABLE_PATH`, Default `/usr/bin/chromium-browser`), `NODE_ENV`.

---

## 12. Bekannte Auffälligkeiten / Bugs

| # | Befund | Ort |
|---|---|---|
| 1 | `generateReading`-Tool referenziert undefinierte Variable `chartData` → ReferenceError | `index.js:527/547` |
| 2 | Auth-Lücke im Gateway: nur `/agents/run` ist Bearer-geschützt, alle `/agent/*`-Routen sind ungeschützt | `mcp-gateway.js` |
| 3 | Modellversionen divergieren: Gateway + production-Agenten = `claude-sonnet-4-5` (kein Fallback); reading-worker = `claude-sonnet-4-6` + Fallback-Kette | `mcp-gateway.js`, `production/*`, `reading-worker/server.js` |
| 4 | `config.rateLimit` & `config.logging.level` gesetzt, aber **nirgends angewendet** | `connection-key/` |
| 5 | `config.auth.jwtSecret` ungenutzt (Verifikation nur via Supabase) | `middleware/auth.js` |
| 6 | `/api/stripe/create-checkout-session` liegt außerhalb der zentralen Auth (stripeRouter vor Auth gemountet) | `server.js` |
| 7 | Zwei Kopien von `GATE_SPANS` (Engine + `utils/gate-mapping.js`) — bei Änderungen beide pflegen | `lib/astro/`, `utils/` |
| 8 | `chart.js` persistiert `calculation_engine:"astronomy-engine"`, obwohl real Swiss Ephemeris läuft | `chart.js` |
| 9 | `GET /api/matching/:matchId` ist ein Stub ohne DB | `matching.js` |
| 10 | `services/chart-truth` `calculateChartSwiss` ist ein Stub (1.1.x) | `services/chart-truth/chartTruthService.ts` |
| 11 | `.cjs`-Mapping nur im Docker-Build — lokal ohne Build schlägt `require('./production/agent-*.cjs')` fehl | `Dockerfile.mcp-gateway` |

---

*Erstellt durch Live-Code-Analyse des Repos `Connection-Key-MCP-Server` (Server .138).*
