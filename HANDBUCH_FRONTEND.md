# Handbuch — Frontend (The Connection Key)

**Stand:** 2026-06-04 · **Quelle:** Live-Code-Analyse des Repos `Connection-Key-MCP-Server`

> **Wichtiger Geltungsbereich.** Dieses Handbuch dokumentiert den **Frontend-Code, der in diesem Repo (`Connection-Key-MCP-Server`, Server .138) tatsächlich vorhanden ist**:
> 1. `frontend/` — die lauffähige Next.js-App **`connection-key-frontend`** (das v3-Hauptfrontend).
> 2. `integration/` — Integrationsmaterial (Route-Handler, Lib, Services, Coach-Portal-Komponenten) das für das **Coach-Portal auf Server .167** bestimmt ist.
>
> Der **eigenständige `frontend-coach`-App-Quellcode** (das aktive Coach-Portal `coach.the-connection-key.de`) liegt im **separaten Repository `Heiko888/The-Connection-Key` (Server .167)** und ist in dieser Session **nicht zugänglich**. Wo immer hier von „Coach" die Rede ist, handelt es sich um die Coach-Routen/-Komponenten, die in *diesem* Repo liegen (`frontend/app/coach*`, `integration/frontend/...`). Für die vollständige Doku des `frontend-coach`-Repos muss dieses Repo der Session hinzugefügt werden.

---

## Inhaltsverzeichnis

- [Teil A — `frontend/` (connection-key-frontend)](#teil-a--frontend-connection-key-frontend)
  - [A.1 Technologie-Stack & Konfiguration](#a1-technologie-stack--konfiguration)
  - [A.2 Design-System (`styles/theme.ts`)](#a2-design-system-stylestheme-ts)
  - [A.3 Layout & Provider](#a3-layout--provider)
  - [A.4 Alle Seiten-Routen](#a4-alle-seiten-routen)
  - [A.5 Komponentenbibliothek](#a5-komponentenbibliothek)
  - [A.6 Hooks](#a6-hooks)
  - [A.7 `lib/` — Module & Funktionen](#a7-lib--module--funktionen)
- [Teil B — `integration/` (Coach-Portal-Material → .167)](#teil-b--integration-coach-portal-material--167)
- [Teil C — Bekannte Schwachstellen](#teil-c--bekannte-schwachstellen-frontend)

---

# Teil A — `frontend/` (connection-key-frontend)

Next.js-App-Router-Anwendung. Reine **Client-Seiten** (`'use client'`) **ohne eigene API-Routen** (`app/api` existiert nicht). Datenfluss: Supabase-Client (Browser) + direkte Aufrufe der .138-Backend-APIs.

## A.1 Technologie-Stack & Konfiguration

**`package.json`** (`frontend/package.json`)

| Eigenschaft | Wert |
|---|---|
| Name / Version | `connection-key-frontend` / `1.0.0` (private) |
| Framework | **Next.js `^14.0.0`** (App Router), React 18.2 |
| Scripts | `dev` → `next dev -p 3005`, `build` → `next build`, `start` → `next start`, `lint` → `next lint` |
| UI | **MUI** (`@mui/material ^5.15`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`) — **kein Tailwind** |
| Icons (zusätzl.) | `lucide-react`, `react-icons` |
| Animationen | `framer-motion ^12.29` |
| 3D | `three ^0.160` |
| PDF / QR | `html2canvas` + `jspdf` / `qrcode` |
| Daten/Backend | `@supabase/ssr ^0.8`, `@supabase/supabase-js ^2.39`, `axios` |
| Payments | `stripe ^14`, `@stripe/stripe-js ^2.4` |

> **Hinweis:** Dev-Port ist **3005** — das passt zur Domain `agent.the-connection-key.de` (Port 3005), die in der System-Doku erwähnt wird.

**`next.config.js`**: `reactStrictMode: true`, `swcMinify: true`, **`typescript.ignoreBuildErrors: true`**, **`eslint.ignoreDuringBuilds: true`** (beide sind bekannte technische Schulden).

**`tsconfig.json`**: Target ES2020, `strict: false`, `noEmit`, `jsx: preserve`, `moduleResolution: bundler`, Path-Alias `@/* → ./*`.

**`app/globals.css`**: Inter-Font (Google Fonts), globaler Reset, dunkler Hintergrund (`#0b0a0f`), `overflow-x: hidden`. Kommentar bestätigt: „Tailwind CSS entfernt".

## A.2 Design-System (`styles/theme.ts`)

MUI Dark-Theme:

| Token | Wert |
|---|---|
| `palette.mode` | `dark` |
| Primary | **`#F29F05`** (Orange/Flamme) |
| Secondary | **`#8C1D04`** (Dunkelrot) |
| Background default / Paper | `#0b0a0f` / `rgba(255,255,255,0.06)` |
| error/warning/success/info | Brand-Rottöne (`#8C1D04`, `#F29F05`, `#590A03`, `#260A0A`) |
| `shape.borderRadius` | `12` |
| Font | **Inter** |

**Komponenten-Overrides:**
- **Body:** radialer Gold/Rot-Glow-Gradient + `::before`-Overlay.
- **MuiPaper / MuiCard:** Glassmorphism (`backdrop-filter: blur`, Gold-Border `rgba(242,159,5,0.15)`).
- **MuiButton (contained):** Gradient `linear-gradient(135deg,#F29F05,#8C1D04)` mit Hover-Lift.
- Typografie h1–h6 mit responsiven Font-Sizes (Media-Queries mobile/tablet), Buttons `textTransform: none`.
- Inputs/TextField/Select/Chip/Alert/Dialog auf Gold-Theme angepasst.

## A.3 Layout & Provider

- **`app/layout.tsx`** (RootLayout): `lang="de"`, Inter-Font, Metadata (Titel „The Connection Key"), Icons. Wrappt Kinder in `ClientProviders` → `ClientLayoutFrame`.
- **`app/agents/layout.tsx`**: Reiner Redirect **→ `/coach/agents`** (die v3-Agent-Seiten sind zugunsten der Coach-Portal-Variante umgeleitet).

**`app/components/` (Layout-/Chrome-Bausteine):**

| Datei | Zweck |
|---|---|
| `ClientProviders.tsx` | MUI ThemeProvider / Emotion-Cache-Wrapper |
| `ClientLayoutFrame.tsx` | Client-seitiger Layout-Rahmen (Header/Footer/Navigation) |
| `ClientErrorBoundary.tsx` | Error Boundary |
| `AppHeader.tsx`, `PublicHeader.tsx`, `AppFooter.tsx` | Header/Footer-Varianten |
| `GlobalNavigation.tsx`, `DashboardBurgerMenu.tsx`, `navigation/` | Navigation |
| `Logo.tsx`, `ThemeToggleButton.tsx`, `PageLayout.tsx`, `AppFunctionsSection.tsx`, `LoadingState.tsx`, `ErrorState.tsx` | Diverse UI-Bausteine |

## A.4 Alle Seiten-Routen

Alle unter `app/**/page.tsx`. Logisch gruppiert:

### Start / Allgemein / Legal
| Route | Beschreibung |
|---|---|
| `/` | Landing/Homepage (force-dynamic, nodejs runtime), Hero + Feature-Cards |
| `/landing` | Alternative Landingpage |
| `/seitenliste` | Seitenübersicht/Sitemap |
| `/roadmap` | Produkt-Roadmap |
| `/ueber-uns`, `/impressum`, `/datenschutz` | Über/Legal |
| `/support`, `/priority-support` | Support |
| `/features`, `/advanced-features` | Feature-Übersichten |

### Auth / Account
| Route | Beschreibung |
|---|---|
| `/login`, `/register`, `/logout` | Authentifizierung (Supabase Auth) |
| `/settings` | Einstellungen |
| `/profil`, `/profil/edit`, `/profil-einrichten`, `/profiles` | Profilverwaltung/Onboarding |
| `/meine-buchungen` | Buchungsübersicht |
| `/memberships`, `/upgrade` | Mitgliedschaft/Upgrade |

### Human-Design Wissen / Bodygraph
| Route | Beschreibung |
|---|---|
| `/bodygraph` | Bodygraph-Visualisierung (`Bodygraph`/`HDChart3D`) |
| `/gates`, `/channels`, `/centers`, `/lines` | HD-Tore/Kanäle/Zentren/Linien |
| `/authority` | Autoritäten |
| `/grundlagen-hd`, `/human-design-info` | Grundlagen/Info |
| `/energetische-signatur`, `/deine-energetische-signatur` | Energetische Signatur |

### Planeten
- `/planets` (Übersicht) + Detailseiten: `/planets/sun`, `/moon`, `/mercury`, `/venus`, `/mars`, `/jupiter`, `/saturn`, `/uranus`, `/neptune`, `/pluto`, `/chiron`, `/incarnation-cross`.
- `/lilith`, `/blackmoonlilith`.

### Readings / Analysen
| Route | Beschreibung |
|---|---|
| `/readings/[id]` | Reading-Detailansicht (Status/Inhalt) |
| `/custom-readings`, `/extended-analysis`, `/realtime-analysis` | Erweiterte/Custom-Analysen |
| `/resonanzanalyse` + `/sofort`, `/bereiche`, `/tiefere-ebenen`, `/next-steps` | Resonanz-Analyse-Funnel |
| `/transits` | Transit-Ansicht |
| `/share/[id]`, `/share/reading/[token]` | Öffentlich geteilte Readings (Token-basiert) |

### Connection Key / Penta / Beziehungen
- `/connection-key`, `/connection-key/penta`, `/connection-key/results`, `/connection-key/beispiele-readings`, `/connection-key/booking`, `/connection-key/success`.
- `/connection-code/success`.
- `/relationships`.

### Coach / Coaching
- `/coach`, `/coach/dashboard`.
- `/coaching` + Coach-Profile `/coaching/heiko`, `/coaching/janine`, `/coaching/elisabeth`.

### Community / Dating
- `/community`, `/community/friends`, `/community/onboarding`, `/community/profile/[username]`, `/community-info`, `/friends`.
- `/dating`, `/dating/chat/[id]`, `/dating/match-tips`, `/dating-impulse`, `/swipe`, `/moon-dating`.
- `/vip-community`, `/exclusive-events`, `/live-events`.

### Mond / Spirituell / Wellness
- `/mondkalender`, `/mondkalender-info`, `/mondphasen-verstehen`, `/ai-moon-insights`.
- `/wellness`, `/journal`, `/journal-info`, `/gamification`.

### Agenten / KI
- `/agents` (→ Redirect auf `/coach/agents`) + `/agents/chart`, `/marketing`, `/sales`, `/social-youtube`, `/automation`.
- `/sales`, `/business-career` (Standalone).
- `/ai-chat`, `/knowledge`, `/knowledge-ai`.

### Preise / Buchung / Pakete
- `/preise`, `/preise-penta`, `/pricing`, `/pricing-hd`.
- `/penta-booking`, `/package-overview`, `/packages/[id]`.
- **`/buchung/dankeseiten/*` — 13 Dankeseiten:** `basic`, `premium`, `vip`, `connection-key-einzelsession`, `connection-key-3er-paket`, `connection-key-5er-paket`, `penta-einzelanalyse`, `erweiterte-pentaanalyse`, `premium-penta-paket`, `human-design-basic`, `human-design-extended`, `human-design-premium`, `human-design-planets`.

### Blog
- `/blogartikel`, `/blogartikel/[slug]`.

## A.5 Komponentenbibliothek

`components/` (alle MUI-basiert). Gruppiert:

### Bodygraph / Chart / 3D
| Komponente | Zweck |
|---|---|
| `Bodygraph.tsx` | SVG-Bodygraph (9 Zentren, Kanäle, Gates) aus `lib/hd-bodygraph/data`, Tooltip/Hover |
| `CSSBodygraph.tsx` | CSS-basierte Bodygraph-Variante |
| `AnimatedBodygraph.tsx`, `EnhancedBodygraph.tsx`, `PremiumBodygraphSection.tsx` | Animierte/erweiterte Darstellungen |
| `HDChart.tsx` / **`HDChart3D.tsx`** | HD-Chart / **Three.js-3D-Chart** (dyn. THREE-Import gegen SSR) |
| `EnhancedChartVisuals.tsx`, `ChartCalculationWidget.tsx` | Visuals / Berechnungs-Widget |
| `ChartEditor.tsx`, `ChartPDFExport.tsx`, `ChartComparisonModal.tsx`, `ChartSharingModal.tsx` | Editor/PDF/Vergleich/Teilen |
| `BodygraphComparison.tsx`, `PartnershipChart.tsx`, `MatchDiagram.tsx`, `ProfileComparison.tsx` | Vergleichs-/Partnerschafts-Charts |
| `GateDetails.tsx`, `GateDetailsModal.tsx` | Gate-Details |
| `PlanetPageTemplate.tsx`, `PlanetTransitModal.tsx`, `RotatingPlanetSymbol.tsx` | Planeten-Darstellung |

### Connection Key / Reading
| Komponente | Zweck |
|---|---|
| `ConnectionKeyAnalyzer.tsx` | Connection-Key-Analyse-UI (Accordion, Chips, Score) |
| `ReadingBuilder.tsx`, `agents/ReadingGenerator.tsx` | Reading-Erstellung |
| `ReadingQualityRating.tsx`, `ShareReadingDialog.tsx`, `SocialShare.tsx` | Bewertung/Teilen |
| `InstantResonanceAnalysis.tsx`, `RealtimeAnalysisModal.tsx` | Resonanz/Realtime-Analyse |

### Chat / Agenten
- `ChatInterface.tsx`, `AIChatInterface.tsx`, `ChatWithChart.tsx`, `AgentChat.tsx`, `AgentChatInterface.tsx` — Chat-UIs.
- `AgentTasksDashboard.tsx` — Agent-Task-Verwaltung.
- Agent-Interfaces: `ChartAgentInterface.tsx`, `MarketingAgentInterface.tsx`, `SalesAgentInterface.tsx`, `SocialYouTubeAgentInterface.tsx`, `AutomationAgentInterface.tsx`.

### Navigation / Layout
- `AppNavigation.tsx`, `AppHeader.tsx`, `HomePageHeader.tsx`, `SimpleMoonlightHeader.tsx`.
- `MobileNavigation.tsx`, `MobileLayout.tsx`, `MobileOptimizedLayout.tsx`, `UnifiedPageLayout.tsx`, `ConditionalLayout.tsx`.
- `SectionHeader.tsx`, `BuildInfo.tsx`, `OpenGraphMeta.tsx`, `PageFallback.tsx`, `LoadingSpinner.tsx`.

### Auth / Access Control
| Komponente | Zweck |
|---|---|
| `ProtectedRoute.tsx` | Auth-Guard mit Rollen-Hierarchie (`basic` < `premium` < `vip` < `admin`), nutzt `useAuth` |
| `AccessControl.tsx`, `ImprovedAccessControl.tsx` | Feature-/Paket-Gating mit Upgrade-Prompt |
| `CoachAuth.tsx`, `CoachNavigation.tsx` | Coach-Auth/Navigation |

### Mond / Dating / Community / Gamification
- Mond: `AnimatedMoon.tsx`, `LightweightMoon.tsx`, `MoonCalendarWidget.tsx`, `MoonCalendarTabs.tsx`, `MoonDatingGuide.tsx`.
- Dating: `DatingInterface.tsx`, `DatingImpulse.tsx`, `ModernSwipeCard.tsx`, `ModernSwipeContainer.tsx`, `ProfileImageCarousel.tsx`, `MultiImageUpload.tsx`.
- Community/Gamification: `CommunityHub.tsx`, `LiveEventsSystem.tsx`, `CalendarSyncSystem.tsx`, `GamificationSystem.tsx`, `MiniCoursesSystem.tsx`, `PersonalRoadmap.tsx`, `DailyImpulse.tsx`.

### Infrastruktur / Sonstige
- `AnimatedStars.tsx`, `SSRSafeStars.tsx`, `SSRSafe.tsx` — Sternen-Hintergrund/SSR-Safe-Wrapper.
- `ThemeProvider.tsx`, `ThemeRegistry.tsx`, `ThemeSelector.tsx`, `ThemeToggle.tsx`.
- `ErrorBoundary.tsx`, `NotificationService.tsx`, `LanguageSystem.tsx`, `AudioControls.tsx`.
- `PackageSelector.tsx`, `CoachingBooking.tsx`, `ReferralWidget.tsx`, `SeitenuebersichtWidget.tsx`, `SeitenuebersichtCompact.tsx`.
- `profile/ProfileCard.tsx`, `profile/UserProfile.tsx`, `profile/ProfileOnboarding.tsx`.
- `ui.tsx`, `ui/button.tsx`, `ui/card.tsx`, `ui/input.tsx` — generische UI-Primitiven.
- `AUTHENTICATION.md` — Doku zum Auth-System.

## A.6 Hooks

`hooks/`:
- **`useChat.ts`** — Chat-Hook über `lib/chat/chatService`: `messages`, `isConnected`, `isTyping`/`typingUsers`, `sendMessage`, `sendTypingIndicator`, `joinChat`/`leaveChat`, `clearMessages`, Error-State; Auto-Connect via `chatId`, liest `userId` aus localStorage.
- **`useHydrationSafe.ts`** — SSR-sicherer Zugriff auf `localStorage`/`window` (gegen Hydration-Mismatch); liefert `isClient`, safe localStorage/window.
- **`usePlanetData.ts`** (~88 KB) — großer Hook mit umfangreichen **Fallback-Stammdaten für alle Planeten** (Sonne…Pluto, Chiron) inkl. Symbol, Umlaufzeit, Mythologie, Farbe, Beschreibung; mappt EN→DE-Keys.

(Weitere Hooks unter `lib/hooks/`: `useAuth.ts`, `useSSRSafe.ts` — siehe A.7.)

## A.7 `lib/` — Module & Funktionen

### Supabase
- `supabase/client.ts` — Browser-Client (`createBrowserClient`), Singleton `getSupabaseClient`, `supabase`-Proxy; Storage-Helper `safeJsonParse`, `getStorageItem`/`setStorageItem`/`removeStorageItem`.
- `supabase/server.ts` — Server-Client (`createServerClient`) mit Cookie-Handling (nutzt `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, mit **hardcodiertem Fallback-Key** — siehe Schwachstellen).
- `supabase/services.ts` — Supabase-Service-Funktionen.

### Auth
- `hooks/useAuth.ts` — `user`/`loading`, `signIn`, `signUp`, `signOut`, `onAuthStateChange`-Subscription.
- `hooks/useSSRSafe.ts` — SSR-sicherer Hook.
- `coach-auth.ts` — `isCoach(userId)` (Coach/Admin-Prüfung gegen Supabase).
- `system-auth.ts` — `AGENT_SYSTEM_TOKEN`-Handling für System-Calls.

### Human-Design-Engine (`lib/human-design/`)
- `index.ts` — zentraler Re-Export: `GATE_SPANS`, `gateForLongitude`, `lineForLongitude`, `getGateAndLine`, `getGateInfo`, Ephemeriden-Funktionen (`calculatePrecisePlanetaryPositions`, `calculateCompleteChart`, `parseBirthDateTime`, `getZodiacSign`…), `CHANNELS`, `findActivatedChannels`.
- `type-authority.ts` — Typ-/Autoritätsberechnung; Typen `HDType`, `HDAuthority`, `Strategy`, `NotSelfTheme`, `Signature`.
- `connection-key-engine.ts` — „Connection Key Engine Ultra": Electromagnetic/Compromise/Dominance/Companionship-Analyse, Scoring + Text-Generator, API-JSON-Format.
- `connection-key.ts`, `centers.ts`, `channels.ts`, `circuits.ts`, `gate-calculator.ts`, `gate-descriptions.ts`, `incarnation-cross.ts`, `profile.ts`, `variables.ts` — HD-Stammdaten/Logik.
- `precise-ephemeris.ts`, `simplified-ephemeris.ts` — Ephemeriden (präzise vs. vereinfacht).

### Bodygraph-Daten (`lib/hd-bodygraph/`)
- `data.ts` — `CENTERS` (9 Zentren mit SVG-Koordinaten + Gates), `CHANNELS`, `GATES`.
- `types.ts` — `CenterId`, `GateId`, `CenterDef`, `ChannelDef`, `GateDef`, `DefinedState`, `BodygraphProps`.
- `themes.ts` — Chart-Themes (`ChartTheme`, `getDefaultTheme`).
- `chartService.ts`, `exportService.ts` — Chart-Laden/-Export.

### Astro (`lib/astro/`)
- `chartCalculation.ts`, `chartCalculationV2.ts`, `ephemeris.ts`; Tests in `__tests__/chartCalculation.test.ts`.

**Weitere HD-Datendateien (Top-Level):** `gatesData.ts`, `humanDesignGates.ts`, `planetsData.ts`.

### Agenten / MCP / AI
- `agent/ck-agent.ts` — Agent-Client → Reading-Agent (Port 4000, `/reading/generate`).
- `agent/task-manager.ts` — `AgentTask`-Verwaltung.
- `agents/allowedAgents.ts` — Whitelist erlaubter Agenten.
- `mcp/mcpClient.ts` — MCP-Call-Wrapper (Request, Timing, Response-Validierung, Usage-Logging in `mcp_usage`); + `mcpErrorTypes.ts`, `modelPricing.ts`, `normalizeMcpOutput.ts`, `promptTemplates.ts`, `readingPayloadBuilder.ts`.
- `mcp-prompts/` — versionierte Prompt-Templates: `basic.v1.ts`, `business.v1.ts`, `connection.v1.ts`, `penta.v1.ts`, `index.ts`, `types.ts`.
- `ai/aiEngineService.ts`, `ai/personalizationService.ts`, `ai/readingQualityReviewer.ts`.
- `prompts/promptRegistry.ts`.

### Readings / DB (`lib/db/`)
- `coach-readings.ts` (+Test), `reading-jobs.ts`, `reading-quality.ts`, `reading-share.ts`, `reading-versions.ts`, `mcp-usage.ts`, `readings-v2.ts`, `readings-v2-json.ts`.
- `readings/createReadingVersion.ts`, `readings/getReadingVersions.ts`.
- Top-Level: `readingSchemas.ts`, `readingTemplates.ts`, `readingTypes.ts`.
- `jobs/readingWorker.ts`.

### Coaching / Knowledge / Chat
- `coaching/coachingService.ts` — `Coach`-Interface (Profile, Ratings, Sessions, Verfügbarkeit), Buchungslogik.
- `knowledge/knowledgeService.ts` — Wissens-/Knowledge-Base-Service.
- `chat/chatService.ts` — Chat-Service (Basis für `useChat`).

### Payments / PDF / Email / Sonstige
- `stripe/client.ts` + `stripe.ts` — `getStripe()` (loadStripe), Checkout-Helfer.
- `pdf/pdfGenerator.ts` — Reading-PDF (jsPDF).
- `email/emailService.ts` — E-Mail-Versand.
- `referral/ReferralSystem.ts` — Referral-Codes.
- `vip/vipService.ts` — VIP-Logik.
- `services/userDataService.ts` — zentrale `UserData`-Verwaltung in localStorage (Merge-Mechanismus gegen Datenverlust).
- `cache/cacheService.ts`, `performance/cache.ts`, `performance/monitoring.ts`.
- `features.ts` — Feature-/Paket-Konfiguration (`SubscriptionLevel = basic|premium|vip|admin`).
- `themeService.ts`, `audioService.ts`, `sharingService.ts`.
- `utils/` — `chartToImage.ts`, `geocoding.ts`, `legacyReadingMapper.ts`, `logger.ts`, `navigation.ts`, `productionSSR.ts`, `refactorErrorTextPattern.ts`, `safeJson.ts`, `safeJsonParse.ts`, `subscriptionSync.ts`, `textDiff.ts`.
- `openai.ts` — OpenAI-Client (Fallback-Modell).

---

# Teil B — `integration/` (Coach-Portal-Material → .167)

`integration/` besteht zu ~90 % aus **Dokumentations-/Deploy-Material** (~119 Markdown-Anleitungen `FIX_*`, `DEPLOY_*`, `CHECK_*`, `CHART_*`, `AGENTEN_*` + Shell/PowerShell-Skripte). Der echte Frontend-Code ist auf `api-routes/`, `lib/`, `services/` und `frontend/` (30 Dateien) konzentriert und ist **für die Übernahme ins Coach-Portal auf .167** gedacht.

## B.1 `integration/api-routes/` — Next.js Route Handler

**App-Router-Endpunkte** (`api-routes/app-router/**/route.ts`):

### Agents (`app-router/agents/*`)
`automation`, `chart-development`, `knowledge`, `marketing`, `sales`, `social-youtube`, `tasks` (GET — liest `v_agent_tasks` aus Supabase), `video-generation` + `video-generation/status/[jobId]`, `website-ux-agent`.

### Coach Readings v2 (`app-router/coach/*`)
- `coach/readings` (Liste).
- `coach/readings-v2/generate` (POST) — **Multi-Agent Reading Orchestrator C2**, ruft `READING_AGENT_URL` (Port 4000), Chart-Loading + Agent-Auswahl + Persistenz, nutzt `production/agents/registry`.
- `coach/readings-v2/[id]/status`, `coach/readings-v2/[id]/retry`.

### Readings (`app-router/readings/*`)
- `reading/generate` (POST) — Validierung via `reading-validation`, ruft `MCP_SERVER_URL` (Port 7000) mit `MCP_API_KEY`, erstellt `reading_jobs`.
- `readings/[id]`, `readings/[id]/status`, `readings/[id]/public`, `readings/history`, `relationship-analysis/generate`, `notifications/reading`.

### Chart (`app-router/chart/*`)
- `chart/[chart_id]` (GET Chart).
- `chart/truth` (POST) — **Single Source of Truth**, ruft `getChartTruth()` aus `services/chart-truth/chartTruthService` (reine Wahrheit, keine Interpretation).

### System / Workbook / Debug / Admin
- `system/agents/tasks`, `workbook/chart-data`, `debug`.
- Admin (Pages-Router-Stil): `admin-upload/route.ts`, `admin-upload-knowledge/route.ts`, `admin-upload-workflow/route.ts`, `new-subscriber/route.ts`.

### Agent-Handler im alten Stil (Top-Level `.ts`)
`agents-automation.ts`, `agents-chart-architect-agent.ts`, `agents-chart-development.ts`, `agents-marketing.ts`, `agents-sales.ts`, `agents-social-youtube.ts`, `agents-video-creation-agent.ts`, `agents-website-ux-agent.ts`, `readings-generate.ts`.

### Shared Utilities
- `reading-validation.ts` (`validateReadingRequest`, `formatValidationErrors`).
- `reading-response-types.ts` (`createReadingResponse`, `createErrorResponse`, `ReadingResponse`).

## B.2 `integration/lib/`
- `supabase-clients.ts` — `getSystemSupabaseClient()` (Service-Role-Client, umgeht RLS bewusst für System-Operationen), zentral von fast allen Routen importiert.

## B.3 `integration/services/`
- `workbook-service.ts` — Workbook/Arbeitsbuch-Service.
- (Referenziert außerhalb: `services/chart-truth/chartTruthService.ts` — laut System-Doku aktuell Swiss-Ephemeris-STUB.)

## B.4 `integration/frontend/` (Coach-Portal-Frontend-Material, 30 Dateien)
- **Pages** (`frontend/app/coach/agents/*`): `automation`, `chart`, `marketing`, `sales`, `social-youtube`, `tasks`, `video-generation`; `frontend/app/coach/readings/create`; `frontend/app/readings/[reading_id]`. Plus `frontend/pages/agents-dashboard.tsx`.
- **Components** (`frontend/components/`): `AgentChat.tsx`, `AgentTasksDashboard.tsx`, `ReadingGenerator.tsx`, `ReadingDisplay.tsx`, `ReadingHistory.tsx`, `RelationshipAnalysisGenerator.tsx`, `VideoGenerationPanel.tsx`, `ChartDevelopment.tsx`; `reading/` (`ReadingContent`, `ReadingHeader`, `ReadingLayout`, `ReadingMetadata`); `chart/` (`BodygraphRenderer`, `ChartLoader`, `ChartLoadingSkeleton`, `ChartError`).
- **Lib/Services**: `frontend/lib/hooks/useChart.ts`, `frontend/lib/db/readings-v2.ts`, `frontend/services/readingService.ts`.

## B.5 Weiteres Deploy-/Setup-Material
- `supabase/migrations/*.sql` — DB-Migrationen (z. B. `017_create_charts_table.sql`, `009_create_reading_jobs_table.sql`, `015_create_coach_readings_view.sql`).
- `n8n-workflows/*.json` — n8n-Workflows.
- `scripts/*.sh|*.ps1` — Setup-/Fix-Skripte (CORS, Chart-Calculation, Endpoint-Verify).

---

# Teil C — Bekannte Schwachstellen (Frontend)

| # | Befund | Ort |
|---|---|---|
| 1 | TypeScript- **und** ESLint-Fehler werden beim Build ignoriert | `frontend/next.config.js` |
| 2 | Hardcodierter Supabase-Publishable-Key-Fallback | `frontend/lib/supabase/server.ts` |
| 3 | `chart/truth`-Route hängt am `chartTruthService`-STUB (Swiss Ephemeris) | `integration/api-routes/.../chart/truth` |
| 4 | IP-Hardcoding: `MCP_SERVER_URL=http://138.199.237.34:7000` als Fallback, `READING_AGENT_URL` (Port 4000) | `integration/api-routes/.../reading/generate` |
| 5 | `integration/` vermischt Code mit ~119 MD-Anleitungen/Skripten — gehört bereinigt/migriert nach .167 | `integration/` |

---

*Erstellt durch Live-Code-Analyse. Für den vollständigen `frontend-coach`-App-Code (Server .167) ist das Repo `Heiko888/The-Connection-Key` nötig, das in dieser Session nicht zugänglich war.*
