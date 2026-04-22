# Reading-System — Vollständige Dokumentation

**Stand:** 2026-04-22
**Quelle:** Live-Analyse `.138:/opt/mcp-connection-key/` (Commits bis `65ab2ed`)
**Zielgruppe:** Entwickler, die verstehen müssen wie ein Human-Design-Reading von API-Call bis Final-Text entsteht — inklusive aller Prompts und Inhalte.

Diese Doku ergänzt `CLAUDE.md` (Systemübersicht) und `CHANGELOG.md` (Änderungshistorie) um die **inneren Mechanismen** des Reading-Systems.

---

## Inhaltsverzeichnis

1. [Übersicht & Datenfluss](#1-übersicht--datenfluss)
2. [Container & Verantwortlichkeiten](#2-container--verantwortlichkeiten)
3. [HTTP-Endpunkte (reading-worker)](#3-http-endpunkte-reading-worker)
4. [BullMQ-Queues & Worker](#4-bullmq-queues--worker)
5. [Modell-Konfiguration & Fallbacks](#5-modell-konfiguration--fallbacks)
6. [Prompt-Aufbau: `buildChartInfo`, `buildKnowledgeText`, `generateReading`](#6-prompt-aufbau)
7. [Two-Pass-Generierung (Detailed)](#7-two-pass-generierung)
8. [Pipeline: Validator & Corrector](#8-pipeline-validator--corrector)
9. [Chart-Engine (connection-key)](#9-chart-engine-connection-key)
10. [Composite-Klassifikation](#10-composite-klassifikation)
11. [Templates — 35 Dateien](#11-templates)
12. [Knowledge-Base — 27+ Dateien](#12-knowledge-base)
13. [Section-Parser & Section-Writer](#13-section-parser--section-writer)
14. [Psychology-Worker (5-Lens-Synthese)](#14-psychology-worker)
15. [V4-Job-Flow (processV4Job)](#15-v4-job-flow)
16. [Frontend-Integration](#16-frontend-integration)
17. [Supabase-Schema](#17-supabase-schema)
18. [Offene Punkte & Baustellen](#18-offene-punkte)

---

## 1. Übersicht & Datenfluss

```
Client (Frontend / Frontend-Coach)
  │
  │  POST /api/readings/:type/start
  ▼
reading-worker (.138:4000)
  │  1. Enqueue BullMQ-Job (Redis)
  │  2. Worker zieht Job
  │  3. Chart laden (aus DB) oder neu berechnen
  │      → POST connection-key:3000/api/chart/calculate
  │  4. generateReading({ agentId, template, userData, chartData })
  │      a. buildChartInfo(chartData)   → deutscher Chart-Block
  │      b. buildKnowledgeText()        → relevante Knowledge-Ausschnitte
  │      c. Transits + vorherige Readings parallel laden
  │      d. Template + Knowledge + Chart-Block + Tuning → Prompt
  │      e. Claude-Call (evtl. 2-Pass)
  │  5. runReadingPipeline(rawText, chartData)
  │      a. validateReading() → JSON-Fehlerbericht
  │      b. correctReading()   nur bei Fehlern
  │  6. writeSectionsForReading()  → sections versioniert in Supabase
  │  7. Update public.readings / v4.reading_results
  ▼
Client poll't GET /api/readings/:type/status/:jobId
```

**Leitprinzip aktuell:** Chart-Engine ist deterministisch korrekt. Das LLM soll nur noch einbetten und erklären. Die Validator-Pipeline fängt Halluzinationen, der Corrector repariert sie textmin­imal.

---

## 2. Container & Verantwortlichkeiten

| Container | Server | Port | Rolle | Haupt-Dateien |
|---|---|---|---|---|
| `connection-key` | .138 | 3000 | Chart-Berechnung (Swiss Ephemeris), REST-API-Fassade | `lib/astro/chartCalculation.js`, `lib/astro/composite.js`, `routes/chart.js` |
| `reading-worker` | .138 | 4000 | Job-Processing, Prompt-Assembly, Claude-Call, Pipeline | `server.js`, `reading-pipeline.js`, `lib/*`, `workers/*`, `templates/*`, `knowledge/*` |
| `mcp-gateway` | .138 | 7000 | Stateless Agent-Gateway (nicht Teil des Reading-Pfads) | — |
| `sync-reading-service` | .138 | 7001 | Sync-Readings (kleine Typen) | — |
| `frontend` (v3) | .167 | 3000 | Legacy UI, `InstantResonanceAnalysis` | `frontend/components/*` |
| `frontend-coach` (v4) | .167 | 3002 | Coach-Portal, V4-Readings-UI | `frontend-coach/` (separates Repo) |

Der gesamte Reading-Text wird auf **.138** erzeugt; **.167** konsumiert nur.

---

## 3. HTTP-Endpunkte (reading-worker)

### Job-basiert (asynchron, BullMQ-gestützt)

```
POST   /api/readings/psychology/start           → Zeile 3884
GET    /api/readings/psychology/:id             → Zeile 3913
POST   /api/readings/:type/start                → Zeile 4280  (generisch: transit, jahres, tagesimpuls, shadow-work, …)
GET    /api/readings/:type/status/:job_id       → Zeile 4306
POST   /api/readings/:readingId/chat            → Zeile 4327  (Chat über bestehenden Reading-Kontext)
POST   /api/readings/stream                     → Zeile 4380  (Server-Sent Events / SSE)
GET    /health                                  → Zeile 4486
```

### Proxy / Direkt

```
POST   /api/chart/calculate                     → Zeile 183   (proxied an connection-key:3000)
```

Alle Zeilennummern im `reading-worker/server.js` (224 KB, 5269 Zeilen).

### Request/Response-Shape `/api/readings/:type/start`

```json
{
  "reading_type": "detailed | basic | connection | penta | transit | jahres | tagesimpuls | ...",
  "client_name": "...",
  "birth_date": "YYYY-MM-DD",
  "birth_time": "HH:MM",
  "birth_location": "...",
  "chart_data": { /* optional — sonst wird neu berechnet */ },
  "reading_options": { "tone": "...", "length": "...", "audience": "..." },
  "ai_model": "claude-sonnet | claude-opus | claude-haiku"
}
```

Response:
```json
{ "job_id": "...", "reading_id": "uuid", "status": "pending" }
```

---

## 4. BullMQ-Queues & Worker

| Queue | Worker-Zeile (server.js) | Zweck |
|---|---|---|
| `reading-queue-v3` | 1573 | Legacy V3 HD-Readings |
| `reading-queue-v4` | 1608 | Standard V4 HD, inkl. Two-Pass-Detailed |
| `reading-queue-v4-connection` | 1755 | 2-Personen-Readings |
| `reading-queue-v4-penta` | 1922 | 3–5-Personen-Readings |
| `reading-queue-v4-multi-agent` | 2067 | Multi-Agent-Synthese (Chart-Agent + Transit-Agent + …) |
| `reading-queue-v4-psychology` | `workers/psychology-worker.js` | 5-Lens-Psychologie-Reading |

**Redis:** Container `redis-queue-secure` (172.18.0.5), 51 Keys aktiv.

**Concurrency:** Standard pro Worker = 1–2, psychology-worker explizit 2 (Zeile 276). **Lock-Duration** ist nicht explizit gesetzt — bei Two-Pass-Generierung (> 120 s) sollte `lockDuration > CLAUDE_TIMEOUT_MS` gesetzt werden, sonst beanspruchen andere Worker den Job.

**Job-Retry:** `processV4Job.js` hat `max_attempts >= 3` (Zeile 18–28), danach `failed`. Non-retriable-Codes: `PROMPT_TOO_LARGE`, `TPM`, `429`.

---

## 5. Modell-Konfiguration & Fallbacks

`reading-worker/server.js:342-358`:

```javascript
const MODEL_CONFIG = {
  "claude-sonnet": {
    provider: "claude",
    models: ["claude-sonnet-4-6", "claude-sonnet-4-5-20250929", "claude-sonnet-4-20250514"],
    maxTokens: 16000,
  },
  "claude-opus": {
    provider: "claude",
    models: ["claude-opus-4-6", "claude-sonnet-4-6", "claude-opus-4-5-20251101"],
    maxTokens: 16000,
  },
  "claude-haiku": {
    provider: "claude",
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6"],
    maxTokens: 8000,
  },
};
const DEFAULT_MODEL = "claude-sonnet";
const CLAUDE_TIMEOUT_MS = parseInt(process.env.CLAUDE_TIMEOUT_MS || "120000", 10);
```

**Modell-Auswahl-Logik** (Zeile 1302–1308): User-Input → Exact-Match → Startsmith-Fallback → `DEFAULT_MODEL`.

**Fallback-Kaskade (provider-intern):** Jedes Top-Level-Modell hat eine geordnete Liste; wenn das erste 5xx/429 wirft, wird das nächste probiert. Pipeline-Modell: **hart verdrahtet `claude-sonnet-4-6`** in `reading-pipeline.js:17`.

**Continuation-Handling:** Bei `max_tokens`-Stop wird mit `continue`-Flag weiter-prompted, bis `end_turn`. Siehe `generateWithClaude()` ab Zeile 382.

**Default Temperatur:** 0.8 für Generierung, 0.3 für Korrektur (`reading-pipeline.js:243`).

---

## 6. Prompt-Aufbau

### 6.1 `buildChartInfo(chartData)` — `server.js:491-539`

Der zentrale deutsche Chart-Block im Prompt. Struktur:

```
BERECHNETE CHART-DATEN (Präzise für diese Person — via Swiss Ephemeris):
TYP: Generator
PROFIL: 6/2
AUTORITÄT: Sacral
STRATEGIE: Warte auf Response
DEFINITION: Split Definition (2 Splits)
INKARNATIONSKREUZ: Right Angle Cross of Planning
  Personalitätssonne: Tor 37
  Personalitätserde: Tor 40
  Design-Sonne:      Tor 5
  Design-Erde:       Tor 35

ZENTREN (definiert = konstante Energie; offen = Konditionierungsfeld):
  Kopf: OFFEN
  Ajna: OFFEN
  Kehle: DEFINIERT
  ...

KANÄLE (alle definierten Lebensthemen):
  Kanal 34-57 (Power): Sakral ↔ Milz
  ...

TORE mit Linie und Quelle (Persönlichkeit = bewusst; Design = unbewusst/körperlich):
  Tor 34.5 (Persönlichkeit) — Macht
  Tor 57.1 (Design) — Intuition
  ...

PLANETEN-AKTIVIERUNGEN (Gate.Linie für jeden Planeten):
  - Sonne:   Persönlichkeit: Tor 37.4 | Design: Tor 5.2
  - Mond:    Persönlichkeit: Tor 12.6 | Design: Tor 33.1
  ...

VARIABLE / PHS (Pfeile):
  - Ernährung/Verdauung: left
  - Umgebung: right
  ...

PFLICHT: Beschreibe JEDES definierte Zentrum, JEDEN Kanal und JEDE offene
Zentrum-Konditionierung konkret für diese Person. Keine generischen Erklärungen.
```

**Besonderheit:** Inkarnationskreuz-Fallback-Lookups in `server.js:495-507` — liest aus `chartData.incarnationCross.gates` bevorzugt, fällt zurück auf `personality.planets.sun/earth`, sekundär auf `personalitySun`/`designSun`-Top-Level-Felder. Diese Robustheit fängt ältere Chart-Formate ab.

### 6.2 `buildKnowledgeText(maxEntries=8, maxCharsPerEntry=1000)` — `server.js:541-546`

```javascript
function buildKnowledgeText(maxEntries = 8, maxCharsPerEntry = 1000) {
  return Object.entries(knowledge)
    .slice(0, maxEntries)
    .map(([key, val]) => `\n### ${key}\n${val.substring(0, maxCharsPerEntry)}`)
    .join('\n');
}
```

⚠️ **Kappung 1000 Zeichen / 8 Einträge** — große Knowledge-Dateien (`connection-knowledge.txt` = 1052 Zeilen, `penta-communication-dynamics.md` = 661 Zeilen) werden abgeschnitten. Für spezialisierte Reading-Typen gibt es `buildReadingKnowledge(type)` das gezielt einzelne Dateien vollständig lädt. Siehe `buildTagesimpulsKnowledge()` (Zeile 752).

### 6.3 `generateReading()` — `server.js:1302`

```javascript
async function generateReading({ agentId, template, userData, chartData }) {
  const rawModelId = userData?.ai_model || DEFAULT_MODEL;
  const selectedModelId = /* Normalize */;
  const modelConfig = MODEL_CONFIG[selectedModelId] || MODEL_CONFIG[DEFAULT_MODEL];
  const maxTokens = userData?.ai_config?.max_tokens || modelConfig.maxTokens;

  // Tuning aus userData
  const tone     = userData?.tone     || userData?.ai_config?.tone;
  const length   = userData?.length   || userData?.ai_config?.length;
  const audience = userData?.audience || userData?.ai_config?.audience;
  const language = userData?.language || 'de';
  const tuningInstructions = buildTuningInstructions({ tone, length, audience });

  const TEMPLATE_MAP = {
    'detailed': 'detailed',
    'depth-analysis': 'depth-analysis',
    'channel-analysis': 'channel-analysis',
    'shadow-work': 'shadow-work',
    'transit': 'transit',
    'jahres': 'jahres-reading',
  };
  if (TEMPLATE_MAP[template]) template = TEMPLATE_MAP[template];

  // Spezial-Routing
  if (template === 'detailed')       return generateDetailedReadingTwoParts(...);
  if (['business','career','life-purpose'].includes(template))
                                      return generateBusinessReadingTwoParts(...);
  if (template === 'shadow-work')    return generateShadowWork(...);
  // ... weitere ca. 15 Zweige

  // Default: Single-Pass
  const prompt = `${systemIntro}${knowledgeText}${chartInfo}${transitOverlay}${deltaContext}${templateBody}${tuningInstructions}`;
  return generateWithClaude(prompt, { model, maxTokens, temperature: 0.8 });
}
```

**Tuning-Parameter** bauen Nachsätze wie „Schreibe kurz und prägnant (1500–2500 Wörter)" oder „Ton: warm und zugänglich, für Coaching-Einsteiger".

---

## 7. Two-Pass-Generierung

### 7.1 `generateDetailedReadingTwoParts()` — `server.js:756-870`

**Reading-Typen im 2-Pass:** `detailed`, `business`, `career`, `life-purpose`.

**Flow:**

```
1. chartInfo = buildChartInfo(chartData)
2. knowledgeText = buildReadingKnowledge('detailed')
3. [transitData, previousReadings] = await Promise.all([
     fetchCurrentTransits(),
     fetchPreviousReadings(birthDate, clientName, readingId, 2)
   ])
4. personContext = `Name, Geburtsdaten, ${chartInfo}, ${transitOverlay}, ${deltaContext}`

5. part1Prompt = [
     Systemrolle,
     knowledgeText,
     "Beginne direkt ohne Disclaimer",
     personContext,
     "Erstelle TEIL 1:",
     "## 1. Dein Typ",
     "## 2. Deine Autorität",
     "## 3. Deine Zentren",
     "mind. 2500 Wörter"
   ]

6. part2Prompt = [
     Systemrolle,
     knowledgeText,
     personContext,
     "Erstelle TEIL 2:",
     "## 4. Channels & Gates",
     "## 5. Das Profil",
     "## 6. Das Inkarnationskreuz",
     "## 7. Variable / PHS",
     "## 8. Lebensphasen"
   ]

7. [part1, part2] = Promise.all([claude(part1), claude(part2)])   // ← PARALLEL
8. combined = part1 + "\n\n---\n\n" + part2
9. return runReadingPipeline(combined, chartData)
```

⚠️ **Teil 1 und Teil 2 wissen aktuell nichts voneinander** — daraus entstehen Widersprüche (Kanal bei A komplett vs. elektromagnetisch). **Baustein 7 der v2.0-Anweisung will dies auf sequentiell umstellen.**

### 7.2 Wörtlicher Auszug Part-1-Prompt

```
Du bist ein erfahrener Human Design Coach. Verwende folgendes Hintergrundwissen:
{{knowledgeText}}

WICHTIGE ANWEISUNG: Die Chart-Daten wurden präzise via Swiss Ephemeris
berechnet und sind vollständig im Prompt enthalten. Füge KEINEN Disclaimer
ein, dass du kein Berechnungstool hast. Beginne das Reading direkt ohne
Vorbemerkungen.

Erstelle TEIL 1 eines tiefgründigen, persönlichen Human Design Readings für:
{{personContext}}

Schreibe direkt an die Person gerichtet (Du-Form), mit vollem Einsatz – wie
eine 90-Minuten-Coaching-Session.
Keine Plattitüden. Keine generischen Erklärungen. Spiegel dieser einen Person.

---

## 1. Dein Typ: Wer du wirklich bist
Der Typ ${chartData.type} ist nicht das, was du bist – er ist, wie deine Energie
in der Welt funktioniert. Erkläre:
- Die Essenz dieses Typs...
- Wie die Energie dieser Person auf andere wirkt...
- Die Strategie im Detail (${chartData.strategy})...
- Die Not-Self-Emotion als Navigationssystem...
- Die Signatur des Typs als Zielzustand...

## 2. Deine Autorität: Der ehrlichste Entscheidungskompass
Die Autorität ${chartData.authority} ist wichtiger als jeder rationale Verstand:
- Wie genau diese Autorität funktioniert...
- Woran die Person erkennt, dass sie aus der Autorität heraus entscheidet...
- Die häufigsten Fallen...
- Konkrete Übungen und Praktiken...

## 3. Deine Zentren: Die Energiearchitektur
Für jedes DEFINIERTE Zentrum:
- Die spezifische Energie, die konstant ausgestrahlt wird
- Das Geschenk und wie andere diese Energie erleben
- Wie dieses Zentrum bewusst eingesetzt werden kann
- Die Schattenseite oder Überwältigungsgefahr

Für jedes OFFENE Zentrum:
- Welche Konditionierungen typischerweise dort entstehen...
- Die Weisheit, die durch das Nicht-Fixiert-Sein entsteht
- Die Befreiungsfrage: "Ist das meine Energie oder habe ich sie aufgenommen?"
- Was das undefinierte Zentrum als Lernfeld bedeutet

Schreibe mindestens 2500 Wörter für diesen Teil. Sprache: Deutsch, Du-Form,
tiefgründig, persönlich – kein Human-Design-Lehrbuch.
```

Part 2 analog mit Abschnitten 4–8 (Channels/Gates, Profil, Inkarnationskreuz, Variable/PHS, Lebensphasen).

---

## 8. Pipeline: Validator & Corrector

**Datei:** `reading-worker/reading-pipeline.js` (334 Zeilen)
**Exports:** `validateReading()`, `correctReading()`, `runReadingPipeline()`

### 8.1 Ablauf `runReadingPipeline(rawText, chartData)`

```
1. Wenn !rawText || !chartData || !anthropic:
     → { text: rawText, validated: false, corrected: false }

2. validationResult = await validateReading(rawText, chartData)
     → { valid, errorCount, errors: [{check, severity, description, expected, found, location}] }

3. Wenn valid === true || errorCount === 0:
     → { text: rawText, validated: true, corrected: false, errorCount: 0 }

4. correctedText = await correctReading(rawText, chartData, validationResult)

5. Safety-Check: correctedText.length >= rawText.length * 0.5 (MIN_CORRECTION_RATIO)
     Wenn unter der Schwelle: Fallback auf rawText (Log-Warnung)

6. return {
     text: correctedText,
     validated: true,
     corrected: true/false,
     errorCount: N,
     errors: [...]
   }
```

**Niemals undefined/null zurück** — bei jedem Fehler Fallback auf Original.

### 8.2 Validator-Prompt (`templates/validate-reading.txt`)

**Rolle:** „Du bist ein präziser Human Design Daten-Validator."

**Eingabe:** `{{chartData}}` (Quelle der Wahrheit) + `{{readingText}}` (zu prüfen).

**Aktive Checks:**

| Check | Zweck | Severity |
|---|---|---|
| CHECK 1 | Zentren-Vollständigkeit: alle definierten/offenen Zentren müssen im Text erwähnt sein | — |
| CHECK 2 | Zentren-Anzahl: „X von neun Zentren" muss stimmen | — |
| CHECK 3 | Tor-Mapping: Kanäle mit korrekten Torenpaaren und Zentren-Zuordnungen | — |
| CHECK 4 | Inkarnationskreuz: 4 Solar-/Erd-Gates exakt, Design ≠ Persönlichkeit nicht vertauscht | kritisch |
| CHECK 5 | Tor-Vollständigkeit: alle aktivierten Tore aufgelistet (sofern Sektion existiert) | — |
| CHECK 6 | Pronomen: Konsistenz er/sie | — |
| CHECK 7 | Verbindungstypen (Connection/Penta/…): Label stimmt mit `chartData.composite.connections` überein | kritisch |
| CHECK 8 | Halluzinierte Planeten-Positionen blocken (Mond/Chiron/Lilith/Nordknoten etc.) | kritisch |
| CHECK 9 | Begriffs-Widerspruch: derselbe Kanal darf nicht zwei Kategorien bekommen | kritisch |

**Ausgabe-Format** (JSON, ohne Markdown-Backticks):

```json
{
  "valid": true,
  "errorCount": 0,
  "errors": [
    {
      "check": "CHECK 7",
      "severity": "critical",
      "description": "Was ist falsch",
      "expected": "Was laut chartData korrekt wäre",
      "found": "Was im Reading steht",
      "location": "Zitat oder Abschnittsangabe"
    }
  ],
  "summary": "Einzeiliger Gesamtstatus"
}
```

**Wörtliches Beispiel CHECK 7** (aus `validate-reading.txt`):

```
Beispiel-Eingabe (Reading-Text):
    "Zwischen euch aktiviert sich der Kanal 59-6 elektromagnetisch..."
chartData.composite.connections.compromise:
    [{ "channel": "6-59", "completePerson": 0, "partialPersons": [1],
       "partialDetails": [{"gate": 6}] }]
Erwarteter Fehler:
    check: CHECK 7, severity: critical,
    description: "Kanal 59-6 im Text als elektromagnetisch bezeichnet,
                  laut chartData ist es Kompromiss",
    expected: "Kompromiss (Person 0 hat Kanal vollständig,
                           Person 1 nur Gate 6)",
    found: "elektromagnetisch",
    location: "Abschnitt mit 'Zwischen euch aktiviert sich der Kanal 59-6'"
```

### 8.3 Corrector-Prompt (`templates/correct-reading.txt`)

**Rolle:** „Du bist ein präziser Human Design Reading-Korrektor."

**Eingabe:** `{{chartData}}` + `{{readingText}}` + `{{validationResult}}`.

**Aktive Regeln:**

| Regel | Aktion |
|---|---|
| REGEL 0 | Originaltextlänge MUSS beibehalten werden (keine Kürzungen) |
| REGEL 1 | NUR Fehler aus dem Bericht korrigieren, Rest unverändert |
| REGEL 2 | Fehlende Zentren an logischer Stelle einfügen (Kopf→Ajna→Kehle→G→…) |
| REGEL 3 | Falsche Zahlen ersetzen (nicht ganzen Satz umschreiben) |
| REGEL 4 | Falsche Tore/Kanäle durch korrekte Werte aus chartData ersetzen |
| REGEL 5 | Inkarnationskreuz-Abschnitt komplett neu schreiben (bei Fehler) |
| REGEL 6 | Pronomen global ändern (er/ihm ↔ sie/ihr) |
| REGEL 7 | Falsche Verbindungstyp-Labels korrigieren (elektromagnetisch ↔ Kompromiss ↔ Companionship ↔ parallel) |
| REGEL 8 | Halluzinierte Planeten-Aussagen LÖSCHEN (kein Ersatz, lieber kürzer) |
| REGEL 9 | Begriffs-Widersprüche vereinheitlichen; nicht-existente Kanäle entfernen |

**Ausgabe:** Nur der korrigierte Reading-Text — kein JSON, kein Kommentar, keine Backticks.

**Safety-Constraints:**
- Korrigierter Text ≥ 50% des Originals (`MIN_CORRECTION_RATIO = 0.5`). Darunter → Fallback auf Original.
- Temperatur 0.3 (vs. 0.8 bei Generierung).
- Timeout 120 s.

---

## 9. Chart-Engine (connection-key)

**Datei:** `connection-key/lib/astro/chartCalculation.js` (1036 Zeilen)

### 9.1 Exports & Hauptfunktion

```javascript
calculateHumanDesignChart({ birthDate, birthTime, birthPlace })
  → {
      type, profile, authority, strategy, definition,
      incarnationCross, gates, channels, centers,
      personality, design,          // Objekt-Form
      personalityPlanets, designPlanets  // Array-Form (Backward-Compat)
    }
```

### 9.2 Kern-Konstanten & Tabellen

| Konstante | Zeilen | Inhalt |
|---|---|---|
| `GATE_SPANS` | 18–41 | 64 Gates à 5.625° Longitude-Span |
| `CHANNELS` | 43–80 | 36 Kanäle mit `{ gates, centers }` |
| `CENTER_KEYS` | 107 | 9 Zentren: head, ajna, throat, g, heart, sacral, solar-plexus, spleen, root |
| `CHANNEL_NAMES` | 109–120 | Englische Kanal-Namen |
| `CHANNEL_NAMES_DE` | 126–163 | **Deutsche Kanal-Namen** — Wahrheitsquelle (eingeführt in Block 1) |
| `CROSS_THEMATIC_DE` | 169–254 | Deutsche Inkarnationskreuz-Themen (z. B. „Community" → „Gemeinschaft") |
| `RAX_LAX_MAP` | 313–553 | 768 Kreuz-Varianten: 448 RAX + 256 LAX + 64 Juxtaposition |
| `PLANET_NAMES` | (obere Konstanten) | Deutsche Planeten-Namen für Prompts |

Stichprobe `CHANNEL_NAMES_DE`:
```
"10-20": "Erwachung"
"5-15":  "Rhythmus"
"6-59":  "Intimität"
"13-33": "Der verlorene Sohn / Der Zeuge"   ← Block-1-Fix (war „Das Vergessen")
```

### 9.3 Kern-Algorithmen

**Design-JD-Berechnung** (Zeile 710–722): Binärsuche auf exakt 88° Sonnenbogen vor Geburt (~88 Tage vor Geburt).

**Gate aus Longitude** (629–640):
```javascript
function gateForLongitude(lon) {
  const idx = Math.floor(lon / 5.625);
  return GATE_SPANS[idx].gate;
}
```

**Line aus Longitude** (642–650): Position innerhalb 5.625° aufgeteilt in 6 Lines à 0.9375°.

**Typ-Bestimmung** (878–935):
```
Keine def. Zentren  → Reflector
Sacral def.         → Generator oder MG (je nach Motor→Throat-Verbindung)
Kein Sacral         → Manifestor (Motor→Throat) oder Projector
```

**Autorität-Hierarchie** (928–935): Reflector → Lunar; Solar Plexus → Emotional; Sacral → Sacral; Spleen → Splenic; Heart → Ego; G&Throat → Self-Projected; sonst → Mental.

**Definition-Berechnung** (937–966): Union-Find über aktivierte Kanäle → Anzahl connected components. 1 = Single, 2 = Split, 3 = Triple-Split, 4+ = Quadruple-Split.

**Inkarnationskreuz-Lookup** (561–622): Key = `"min(pSun)-max(pSun)-min(dSun)-max(dSun)"` → `RAX_LAX_MAP[key]` → Typ (RAX/LAX/JUX) bestimmt durch Profile (4/1 → JUX, Lines 1-3 in beiden → RAX, sonst LAX). **Fallback** für unbekannte Kreuze: `"LAX (Tore: X/Y/Z/W)"` — nie erfundener Name.

### 9.4 Response-Shape `/api/chart/calculate`

```json
{
  "success": true,
  "chartId": "uuid | null",
  "chart": {
    "id": "...",
    "type": "Generator",
    "profile": "6/2",
    "authority": "Sacral",
    "strategy": "Warte auf Response",
    "definition": "Single",
    "incarnationCross": {
      "type": "RAX",
      "name": "Right Angle Cross of Planning",
      "name_de": "Rechtswinkliges Kreuz der Planung",
      "thematicName_de": "Planung",
      "fullName_de": "Rechtswinkliges Kreuz der Planung",
      "gates": { "personalitySun": 37, "personalityEarth": 40,
                 "designSun": 5, "designEarth": 35 }
    },
    "gates": [{ "number": 34, "name": "Power" }, ...],
    "channels": [{ "gates": [34,57], "name": "Power", "name_de": "Macht" }, ...],
    "centers": { "head": false, "ajna": false, "throat": true, ... },
    "personality": { "planets": { "sun": {gate, line}, "moon": {...}, ... } },
    "design":      { "planets": { "sun": {gate, line}, ... } },
    "personalityPlanets": [{planet, gate, line}, ...],
    "designPlanets":      [{planet, gate, line}, ...],
    "createdAt": "2026-04-22T..."
  },
  "source": "swiss-ephemeris",
  "version": "2.0.0"
}
```

---

## 10. Composite-Klassifikation

**Datei:** `connection-key/lib/astro/composite.js` (131 Zeilen, komplett neu in Block 2).

### 10.1 Funktion

```javascript
classifyCompositeConnections(channels, gatesByPerson)
  // channels: [[g1,g2], ...]   36 HD-Kanäle
  // gatesByPerson: number[][]  pro Person aktivierte Gates
  →
  {
    channels: string[],
    connections: {
      electromagnetic: [{ channel, gates, gateHolders, personsByGate }],
      compromise:      [{ channel, completePerson, partialPersons,
                          partialGate, partialDetails }],
      companionship:   [{ channel, completePerson }],
      parallel:        [{ channel, completePersons }],
      dominance:       [...]   // Alias für compromise bei 2 Personen (deprecated)
    }
  }
```

### 10.2 Kategorien (gegenseitig ausschließend, in dieser Prüfreihenfolge)

Pro Kanal:
```
count[i]   = Anzahl Gates (g1, g2) die Person i hat (0, 1, 2)
n_complete = Personen mit count=2
n_partial  = Personen mit count=1
```

| Kategorie | Bedingung | Bedeutung |
|---|---|---|
| `parallel` | `n_complete >= 2` | Zwei+ Personen haben Kanal unabhängig komplett |
| `companionship` | `n_complete === 1 && n_partial === 0` | Eine Person komplett, niemand sonst |
| `compromise` | `n_complete === 1 && n_partial >= 1` | Eine komplett, andere mit nur einem Gate (Reibung) |
| `electromagnetic` | `n_complete === 0 && ∃ i,j: partial[i], partial[j] decken beide Gates ab` | Nur gemeinsam wird Kanal gebildet |
| (keine) | sonst | z. B. nur 1 Person hat 1 Gate |

**Regel:** Jeder Kanal genau eine Kategorie. Kein Kanal in zwei gleichzeitig.

### 10.3 Endpunkt `/api/chart/composite`

```
POST /api/chart/composite
Body: { "persons": [ { date, time, coords }, ... ] }

Response:
{
  "success": true,
  "persons": [...einzelne Charts],
  "composite": {
    "gates": [{number, name}],      // Union aller Gates
    "channels": string[],            // Union
    "centers": { ... },              // Union
    "connections": {
      electromagnetic: [...],
      compromise: [...],
      companionship: [...],
      parallel: [...],
      dominance: [...]               // nur bei n=2
    }
  }
}
```

### 10.4 Tests

`connection-key/test/composite-classification.test.js` — 15 Testfälle + Cross-Category-Exclusivity-Test (Block 2 eingeführt, alle grün).

---

## 11. Templates

**Ort:** `reading-worker/templates/` — 35 Dateien.

**Struktur:** Plaintext mit `{{placeholder}}`-Variablen, werden von `loadTemplate()` / `buildReadingKnowledge()` geladen und in Prompts eingesetzt.

### 11.1 Reading-Templates

| Datei | Zeilen | Kategorie | Zweck |
|---|---|---|---|
| `basic.txt` | 31 | Standard | Kompaktes HD-Einstiegs-Reading (Typ, Strategie, Autorität, Zentren) |
| `default.txt` | 18 | Fallback | System-Default-Prompt |
| `detailed.txt` | 244 | Standard | **Zweiteiliges 90-Min-Session-Reading**, via `generateDetailedReadingTwoParts` |
| `depth-analysis.txt` | 214 | Standard | Mittlere Tiefe: Zentren + erste Schicht Gates/Kanäle |
| `channel-analysis.txt` | 153 | Standard | Detaillierte Kanal- & Tor-Analyse |
| `channel-hd-wissen.txt` | 46 | Bildung | Lernmodul zu einzelnen Kanälen |
| `channel-tagesimpuls.txt` | 46 | Tagesimpuls | Tagesenergie mit Kanal-Fokus |
| `business.txt` | 186 | Spezialisiert | Business-Strategie, **2-Pass** |
| `career.txt` | 41 | Spezialisiert | Beruf & Berufung, **2-Pass** |
| `life-purpose.txt` | 41 | Spezialisiert | Inkarnationskreuz & Lebensaufgabe, **2-Pass** |
| `health.txt` | 41 | Spezialisiert | Gesundheit & Körperintelligenz |
| `spiritual.txt` | 41 | Spezialisiert | Spirituelle Tiefe & Bewusstseinsentwicklung |
| `kinder.txt` | 58 | Spezialisiert | Kinder-Reading mit Entwicklungs-Insights |
| `parenting.txt` | 41 | Spezialisiert | Elternschaft mit Kind-Design-Analyse |
| `trauma.txt` | 61 | Spezialisiert | Trauma & Konditionierungs-Arbeit |
| `geld-ueberfluss.txt` | 53 | Spezialisiert | Geld, Überfluss, Wohlstandsbewusstsein |
| `sexuality.txt` | 108 | Spezialisiert | Sexualität, Vergnügen, körperliche Resonanz |
| `emotions.txt` | 124 | Standard | Solarplexus-Zentrum & emotionale Intelligenz |
| `shadow-work.txt` | 132 | Psychologie | Shadow-Integration & Konditionierungsmuster |
| `reflection.txt` | 117 | Coaching | Reflexionsfragen zur Selbsterkenntnis |
| `reflection-profiles.txt` | 294 | Coaching | Profil-spezifische Reflexionsfragen (12 Profile) |
| `connection-basic.txt` | 32 | Beziehung | Vereinfachtes 2-Personen-Reading |
| `connection.txt` | 145 | Beziehung | Tiefes 2-Personen-Connection-Reading |
| `compatibility.txt` | 41 | Beziehung | Oberflächliche Kompatibilität |
| `relationship.txt` | 138 | Beziehung | Romantische Partnerschafts-Analyse |
| `penta-basic.txt` | 27 | Gruppe | Penta-Grundanalyse (3–5 Personen) |
| `penta.txt` | 120 | Gruppe | Vollständiges Penta-Reading |
| `penta-communication.txt` | 168 | Gruppe | Kommunikationsdynamiken in Penta-Gruppen |
| `transit.txt` | 92 | Astrologie | Transit-Interpretationen & zeitliche Zyklen |
| `jahres-reading.txt` | 104 | Zyklisch | Jahres-Reading mit Jahresherrscher |
| `tagesimpuls.txt` | 78 | Täglich | Persönlicher Tagesimpuls (Transit + Chart) |
| `tagesimpuls-reel.txt` | 54 | Media | Reel-Script für IG/TikTok (45–60 s) |
| `variable-phs.txt` | 64 | Meta | Dynamische Variablen für Platzhalter-System |

### 11.2 Pipeline-Templates (keine Readings, sondern Qualitätssicherung)

| Datei | Zeilen | Zweck |
|---|---|---|
| `validate-reading.txt` | 125 | 9 Checks gegen Chart-Daten → JSON-Fehlerbericht |
| `correct-reading.txt` | 101 | 9 Regeln zur textminimal-Korrektur |

Vollständiger Inhalt von `validate-reading.txt` und `correct-reading.txt` ist in **Abschnitt 8.2 und 8.3** wiedergegeben.

---

## 12. Knowledge-Base

**Ort:** `reading-worker/knowledge/` — 27 Dateien + `brandbook/` Unterordner.

**Lade-Mechanik:** `loadKnowledge(dir)` in `reading-worker/lib/loadKnowledge.js` (rekursiv `.txt` und `.md` aus Pfad, Schlüssel = Dateiname ohne Extension). `buildKnowledgeText()` fügt bis zu 8 Einträge à 1000 Zeichen in den Prompt ein. `buildReadingKnowledge(type)` lädt typ-spezifisch vollständige Dateien.

### 12.1 Kern-Knowledge

| Datei | Zeilen | Inhalt |
|---|---|---|
| `human-design-basics.txt` | 231 | HD-Fundamentals: 5 Typen, Strategien, Signaturen, Not-Self-Emotionen, Autoritäten |
| `types-detailed.txt` | 306 | Alle 5 Typen detailliert: Generator, MG, Projektor, Manifestor, Reflektor |
| `centers-detailed.txt` | 515 | Alle 9 Zentren definiert + offen, Konditionierung, Lesehilfen |
| `channels-gates.txt` | 434 | Alle 36 Kanäle + 64 Tore mit Themen, Schaltkreise (Individual/Kollektiv/Stamm) |
| `profiles-detailed.txt` | 319 | Alle 12 Profile (6 Linien × 2 Linienkombinationen) |
| `authority-detailed.txt` | 316 | 7 Autoritäten: Sakral, Emotional, Milz, Ego, Self-Projected, Mental, Mond |
| `arrows-detailed.txt` | 264 | Variablen/Pfeile als energetische Anpassungsmechanismen |
| `incarnation-cross.txt` | 439 | Alle 112 Inkarnationskreuze (RAX/LAX/JUX) |
| `splits-detailed.txt` | 228 | Definition-Typen: Single, Split, Triple-Split, Quadruple-Split |
| `strategy-authority.txt` | 162 | Strategie + Autorität im Zusammenspiel |

### 12.2 Themen-Knowledge

| Datei | Zeilen | Inhalt |
|---|---|---|
| `business-knowledge.txt` | 197 | Business pro Typ (Manifestor-Initiation, Generator-Response, …) |
| `career-knowledge.txt` | 199 | Berufung pro Typ/Profil |
| `kinder-knowledge.txt` | 215 | Kinder-Entwicklung, altersgerechte HD-Auslegung |
| `parenting-knowledge.txt` | 232 | Elternschaft mit Kind-HD-Berücksichtigung |
| `emotions-knowledge.txt` | 171 | Solarplexus-Zentrum + emotionale Welle |
| `spiritual-knowledge.txt` | 148 | Spirituelle Pfade, Meditation im HD-Kontext |
| `connection-knowledge.txt` | 1052 | **Umfangreich:** Elektromagnetismus, Gate-Polaritäten, Kanal-Typen |
| `penta-knowledge.txt` | 534 | Penta-Gruppen: 5 funktionale Positionen, Gate-Zuordnungen |
| `reading-types.txt` | 386 | Alle 32 Reading-Templates klassifiziert |
| `transit-impulse-instructions.txt` | 59 | Transit-Regeln für Tagesimpulse |

### 12.3 Impuls-Regeln & Penta-Dynamics (Markdown)

| Datei | Zeilen | Inhalt |
|---|---|---|
| `authority-specific-impulse-rules.md` | 43 | 7 Autoritäts-Regeln (EA: warten, Sakral: Ja/Nein, Milz: Erster Impuls, …) |
| `type-specific-impulse-rules.md` | 85 | 4 Typ-Regeln (Generator: Response, Projektor: Einladung, …) |
| `profile-specific-impulse-rules.md` | 42 | Profil-Perspektiven (Linie 1: Tiefe, Linie 2: Raum, Linie 3: Experiment, …) |
| `penta-strategy-impulses.md` | 346 | Penta-Strategie pro Typ |
| `penta-communication-dynamics.md` | 661 | **Umfangreich:** alle kommunikativen Gates im Penta-Kontext |
| `reel-script-instructions.md` | 53 | Video-Skript-Format (Hook, Body, CTA) |

### 12.4 Brand-Book

`knowledge/brandbook/`:
- `README.md` (44) — Verweis auf konvertierte Master-Brand-Book-Kapitel
- `brandbook-complete.md` (65) — Kompletter Brand-Styleguide
- `brandbook-signature-bodygraph.md` (222) — Body-Graph-Design-Standards

**Gesamt Knowledge:** ~7281 Zeilen + 331 Zeilen Brand-Book = **7612 Zeilen Referenzmaterial**.

---

## 13. Section-Parser & Section-Writer

### 13.1 `lib/sectionParser.js` (81 Zeilen)

**Zweck:** Zerlegt den finalen Reading-Markdown in benannte Sektionen nach Heading-Regex.

**Kern:** `AREA_PATTERNS` (Zeile 5–29) — 22 Regex-Muster für deutsche + englische Headings:
```
incarnation_cross, profile, type, authority, strategy,
centers, channels, gates, definition, variables,
relationship, business, sleep, shadow_patterns,
development, purpose, health, money, parenting,
sexuality, trauma, life_phases, summary
```

**Exports:**
```javascript
parseSections(rawText) → [{ area, content }, ...]
extractText(textField) → String (robustes Objekt-Handling)
```

**Fallback:** Wenn keine Headings erkannt werden → `[{ area: 'other', content: fullText }]`.

### 13.2 `lib/sectionsWriter.js` (120 Zeilen)

**Zweck:** Persistiert Sections in `public.reading_sections` mit Versionierung.

**Haupt-Export:** `writeSectionsForReading(supabasePublic, readingId)`.

**Flow:**
```
1. Reading laden, reading_data.text extrahieren
2. client_profiles.id finden oder anlegen (via name+birth)
3. parseSections(text) → Array
4. Pro (client_id, area):
     latestVersion = max(version) existing
     newVersion = latestVersion + 1
5. INSERT reading_sections { client_id, area, version, content, reading_id }
6. UPDATE alte Version: superseded_by = newId
7. return { created: N, clientId }
```

**Folge:** Jeder Abschnitt wird pro Client versioniert, alte Versionen bleiben lesbar (audit trail), neue referenzieren die vorherige via `superseded_by`.

---

## 14. Psychology-Worker (5-Lens-Synthese)

**Datei:** `reading-worker/workers/psychology-worker.js` (287 Zeilen).
**Queue:** `reading-queue-v4-psychology`.
**Modell:** `claude-sonnet-4-6` (hart verdrahtet, Zeile 15).

**Flow:** 5 sequentielle Claude-Calls + eine Synthese:

| Call | Zeile | Zweck | Output |
|---|---|---|---|
| 1 — Polyvagal | 156–162 | Nervensystem-Analyse | JSON `{summary, patterns, regulation_approach, connection_dynamics}` |
| 2 — Attachment | 166–179 | Bindungsmuster aus undefinierten Zentren | JSON `{attachment_type, triggers, dynamics, connection_patterns}` |
| 3 — Jung | 182–194 | Schatten + Archetypen | JSON `{shadow_theme, archetype, individuation_path, shadow_projections}` |
| 4 — Big Five | 198–206 | Persönlichkeit (OCEAN) | JSON `{openness, conscientiousness, extraversion, agreeableness, neuroticism, scientific_framing}` |
| 5 — Synthese | 210–233 | Text-Integration (1500–2500 Wörter, warmer Coach-Ton) | Freitext |

**Persistenz:** `psychology_readings`-Tabelle mit allen 5 JSON-Feldern + synthesized_text. Status `completed` oder `failed` mit `error_message`.

**Concurrency:** 2 (Zeile 276).

---

## 15. V4-Job-Flow (processV4Job)

**Datei:** `reading-worker/processV4Job.js` (146 Zeilen).
**Export:** `processV4Job(job, supabaseClient)`.

**Flow:**

```
1. Attempt-Tracking: wenn attempts >= 3 → failed
2. v4.reading_jobs.status → processing
3. template aus payload.reading_type
4. generateReading({ template, userData: payload })    // nutzt ReadingWorker-Logik
5. INSERT v4.reading_results
6. status → completed
7. syncPublicReading()  // Triple-Lookup in public.readings:
     a) by reading_id
     b) by (client_name, reading_type, status in [pending|processing])
     c) by (client_name, reading_type, latest)
```

**Error-Handling:**
- Non-retriable (`PROMPT_TOO_LARGE`, `TPM`, `429`) → `failed` direkt
- Retriable → `pending` + attempts++

---

## 16. Frontend-Integration

Das Coach-Portal (Repo `The-Connection-Key`) und das Legacy-Frontend (`frontend/`) konsumieren die Reading-API rein lesend / triggernd.

### 16.1 Legacy Frontend (`.138:frontend/`, Repo auf .167)

82 App-Routes, darunter:
- `/resonanzanalyse/` (6 Seiten: sofort, tiefere-ebenen, bereiche, next-steps, history)
- `/readings/[id]` — Reading-Anzeige
- `/connection-key/` — Chart-Anzeige & Exploration
- `/planets/*` — 14 Planet-Routes
- `/coaching/*` — 5 Coaching-Routes

**Zentrale Components** (in `frontend/components/`):
- `InstantResonanceAnalysis.tsx` (482 Zeilen, ⚠️ aktuell modified in git status) — 4-Step-Flow (Eingabe → Analyse → Ergebnis → Tiefere Ebenen), Modes `single` / `connection`.
- `HDChart.tsx` (~800 Zeilen) — SVG Body-Graph (9 Centers + 64 Gates + 36 Channels).
- 12 weitere Chart-Komponenten (Comparison, Partnership, Editor, 3D, PDF-Export, …).

### 16.2 Coach-Portal (.167, Next.js, MUI)

Siehe `CLAUDE.md §8` — die wichtigsten Routen:
- `POST /api/v4/readings` (create + enqueue)
- `GET /api/v4/readings/[id]` (detail)
- `POST /api/v4/readings/[id]/regenerate`
- `GET /api/v4/readings/[id]/generate-stream` (SSE)

Agent-Routen `/api/agents/*` proxy via `.138:7000` (MCP-Gateway) — **nicht Teil des Reading-Kern-Flows**, aber im selben Repo.

### 16.3 Ausstehende Frontend-Arbeit (Block 2 Follow-up)

In `frontend-coach/` (nicht dieser Server):
- `parallel`-Kategorie in Dating-Match / Resonanzanalyse / Penta-Harmonie rendern.
- Begriff „Goldader" aus UI-Strings entfernen.
- Penta-3er-Kanäle (n_involved=3) vor 2er priorisieren.
- Referenzen auf `dominance` auf `compromise` umstellen.

---

## 17. Supabase-Schema

**Externes Postgres** (`wdiadklhvhlndnjojrfu.supabase.co`), zwei Schemas:

### `public`-Schema

| Tabelle | Zweck | Wichtige Felder |
|---|---|---|
| `readings` | Haupt-Reading-Tabelle | `id`, `chart_data`, `reading_data` (enthält `text`, `reflexionsfragen`, `_pipeline`), `birth_data`, `status`, `progress` |
| `coach_readings` | Coach-Readings | `status` (pending/completed) |
| `reading_history` | Version-History | `reading_id`, `version_num`, `previous_data` |
| `reading_sections` | Section-versionierte Reading-Inhalte | `client_id`, `area`, `version`, `content`, `superseded_by` |
| `client_profiles` | Client-Grundlage für Sections | `name`, `birth_date`, `birth_time` |
| `charts` | Cached Charts | Chart-ID → chart_data |

### `v4`-Schema

| Tabelle | Zweck | Wichtige Felder |
|---|---|---|
| `reading_jobs` | Async Job-Queue-Spiegel | `id`, `reading_type`, `payload`, `status`, `attempts`, `max_attempts` |
| `reading_results` | Job-Ergebnisse | `job_id`, `result_text`, `metadata` |
| `evolution_analyses` | Evolution-Analyse | — |
| `mcp_usage` | MCP Server Usage | Agent-Telemetrie |
| `psychology_readings` | 5-Lens-Output (Polyvagal / Attachment / Jung / Big Five / Synthese) | alle 5 JSON-Felder + synthesized_text |

### Edge Function

`check-reading-timeouts` — prüft periodisch Jobs die länger als X Minuten `processing` sind und setzt sie auf `failed`.

---

## 18. Offene Punkte

### 18.1 Aktueller git status (bei Schreiben dieser Doku)

```
M  frontend/components/InstantResonanceAnalysis.tsx   (.138-Spiegel, Repo-Duplikat)
M  reading-worker/knowledge/penta-knowledge.txt
D  reading-worker/lib/generateReading.js.backup
?? reading-worker/knowledge/business-knowledge.txt
?? reading-worker/knowledge/career-knowledge.txt
?? reading-worker/knowledge/emotions-knowledge.txt
?? reading-worker/knowledge/kinder-knowledge.txt
?? reading-worker/knowledge/parenting-knowledge.txt
?? reading-worker/knowledge/penta-communication-dynamics.md
?? reading-worker/knowledge/penta-strategy-impulses.md
?? reading-worker/knowledge/spiritual-knowledge.txt
?? reading-worker/lib/sectionParser.js
?? reading-worker/lib/sectionsWriter.js
?? reading-worker/scripts/
?? reading-worker/templates/penta-communication.txt
?? reading-worker/tests/
?? supabase/migrations/2026041601_dynamic_blueprint_schema.sql
?? supabase/migrations/2026041601_dynamic_blueprint_schema.down.sql
?? supabase/migrations/2026041702_profiles_active_gates.sql
```

**Noch nicht committet:** 8 Knowledge-Dateien, 2 lib-Files (sectionParser/Writer), 1 neues Template, 3 DB-Migrations.

### 18.2 Laut Plan v2.0 offen

| Baustein | Status | Notiz |
|---|---|---|
| 1 — Chart-Engine-Stammdaten | ✅ gemergt (913deef) | |
| 2 — Composite-Klassifikation | ✅ gemergt (4558b87) | UI-Rendering auf .167 ausstehend |
| 3 — Validator-Erweiterung | 🟡 teilweise | CHECK 7–9 / REGEL 7–9 drin. Plan v2.0 will CHECK 10–14 ergänzen (Goldader-String, HD-Regel-Konformität, numerische Behauptungen, Cross-Pass-Widersprüche) |
| 4 — Fakten-Block | ❌ offen | Plan-Hinweis: `buildChartInfo` existiert bereits — nur verschärfen (Whitelist-Sektion + Verbote) |
| 5 — Fakten-Whitelist im Prompt | ❌ offen | Addendum an alle fachlichen Templates |
| 6 — HD-Regel-Whitelist | ❌ offen | Neue Datei `knowledge/hd-regeln-strikt.txt`; Knowledge-Loading-Cap (1000 Zeichen) vorher fixen |
| 7 — Sequenzielle Generierung | ❌ offen | Part 2 mit Part 1 als Kontext; CLAUDE_TIMEOUT_MS auf 180 000 |
| Monitoring | ❌ offen | Tabelle `v4.reading_validation_log` + Dashboard `/admin/reading-health` |
| Frontend-UI (parallel rendern) | ❌ offen | Anderes Repo (.167) |

### 18.3 Bekannte technische Schulden

| Stelle | Problem |
|---|---|
| `buildKnowledgeText(8, 1000)` | Schneidet große Knowledge-Dateien ab. Vor Baustein 6 beheben, sonst verpufft die HD-Regel-Whitelist. |
| `generateDetailedReadingTwoParts` | Parallel statt sequenziell → Widersprüche zwischen Teil 1 und Teil 2. Baustein 7. |
| BullMQ-`lockDuration` | Nicht explizit gesetzt. Bei 2-Pass-Reading > 120 s kann ein anderer Worker den Job übernehmen. Sollte auf min. 240 000 ms. |
| `reading-pipeline.js:17` | `PIPELINE_MODEL` hart verdrahtet auf `claude-sonnet-4-6` — nicht über ENV konfigurierbar. |
| `processV4Job.js:51-52` | Token-Usage als `null` hardcoded, keine Telemetrie. |
| `lib/generateReading.js` (Legacy, 34 Zeilen) | Parallel-Stub zum echten `generateReading()` in `server.js:1302`. Verwirrt neue Entwickler. |
| Feature-Flag `READING_STRICT_MODE` | Laut Plan v2.0 vorgesehen — aktuell **nicht implementiert**. |

### 18.4 Getestete Konstellationen

- Composite-Klassifikation: 15 synthetische Tests + Cross-Category-Exclusivity-Test (alle grün).
- Chart-Engine-Stammdaten: keine Unit-Tests im Repo gefunden; Tests laut Plan in `test/chart-stammdaten.test.js` vorgesehen, **noch nicht angelegt**.
- Pipeline-Checks: `reading-worker/tests/` ist untracked — Inhalt prüfen.
- **Kein End-to-End-Smoketest gegen ein reales Chart durchgeführt** (laut CHANGELOG 2026-04-21).

---

## Anhang A — Wörtlicher Validator-Prompt

Kompletter Inhalt `reading-worker/templates/validate-reading.txt` (125 Zeilen). Wird in `reading-pipeline.js:280` via `validateReading()` aufgerufen.

```
Du bist ein präziser Human Design Daten-Validator.

Du erhältst:
1. Die originalen Chart-Daten (QUELLE DER WAHRHEIT)
2. Einen generierten Reading-Text

Deine Aufgabe: Prüfe den Reading-Text gegen die Chart-Daten und gib einen
strukturierten Fehlerbericht zurück.

---

CHART-DATEN (Quelle der Wahrheit):
{{chartData}}

READING-TEXT (zu prüfen):
{{readingText}}

---

PRÜFREGELN – führe JEDEN Check einzeln durch:

CHECK 1 – ZENTREN VOLLSTÄNDIGKEIT
Die 9 Zentren sind: Kopf, Ajna, Kehle, G-Zentrum, Herz/Ego, Solarplexus, Sakral,
Milz, Wurzel.
- Extrahiere aus chartData: welche Zentren sind DEFINIERT, welche OFFEN?
- Zähle im Reading-Text: Welche definierten Zentren werden genannt? Welche offenen?
- Fehler: Jedes Zentrum das in chartData vorkommt, aber im Reading fehlt.
- WICHTIG: Prüfe explizit ob "Solarplexus" (auch "Solar-Plexus", "emotionales
  Zentrum") erwähnt wird, wenn es in chartData definiert oder offen ist.

CHECK 2 – ZENTREN ANZAHL IM TEXT
- Suche im Reading nach Formulierungen wie "X von neun Zentren".
- Vergleiche X mit der tatsächlichen Anzahl definierter Zentren aus chartData.
- Fehler: Wenn X nicht übereinstimmt.

CHECK 3 – TOR-MAPPING (Kanäle)
- Extrahiere alle Kanäle aus chartData (z.B. Kanal 34-57, Kanal 10-34).
- Prüfe jeden Kanal im Reading: Werden beide Tore korrekt genannt?
- Prüfe die Zentren-Zuordnung jedes Tores (z.B. Tor 18 gehört zur Milz, sucht
  Tor 58 an der Wurzel – NICHT Tor 17 am Ajna).
- Fehler: Falsch genannte Gegentore oder falsche Zentren-Zuordnungen.

CHECK 4 – INKARNATIONSKREUZ
- Die korrekten Gate-Werte stehen im chartData-Block unter
  "SOLAR- UND ERD-GATES".
  Lies die 4 Werte von dort: Persönlichkeitssonne, Persönlichkeitserde,
  Design-Sonne, Design-Erde.
- Prüfe im Reading: Wird das korrekte Kreuz beschrieben? Werden die richtigen
  4 Tore genannt?
- Fehler: Wenn das Reading ein anderes Kreuz oder andere Tore beschreibt.
- KRITISCH: Prüfe ob Design-Sonne und Design-Erde NICHT vertauscht wurden.
  Design-Sonne ≠ Persönlichkeitssonne. Design-Erde ≠ Persönlichkeitserde.
  Häufiger Fehler: Das Reading nennt Tor X als "Design-Sonne", aber laut
  chartData ist Tor X die "Persönlichkeitssonne". Prüfe jeden der 4 Gate-Werte
  einzeln.
  Fehler melden wenn ein Gate-Wert im Reading nicht exakt dem entsprechenden
  Feld in chartData entspricht.

CHECK 5 – TOR-VOLLSTÄNDIGKEIT
- Extrahiere alle aktivierten Tore aus chartData.
- Prüfe im Reading: Werden alle aufgelistet? (Relevant bei Readings mit
  expliziter Tor-Sektion)
- Fehler: Fehlende Tore.

CHECK 6 – GESCHLECHT / PRONOMEN
- Extrahiere aus chartData: person.gender (oder name als Hinweis).
- Prüfe im Reading: Werden konsistent die richtigen Pronomen verwendet?
- Fehler: Falsche Pronomen (z.B. er/ihm für eine weibliche Person).

CHECK 7 – VERBINDUNGSTYPEN (nur bei Connection / Relationship / Penta /
  Sexuality / Dating / Resonanz)
- Nur anwendbar wenn chartData.composite.connections existiert.
- Für JEDEN im Reading-Text erwähnten Kanal, der im Kontext "elektromagnetisch",
  "Kompromiss", "Parallel", "Companionship", "Goldader" oder "Ergänzung" benannt
  wird: Finde den Kanal-Key (z.B. "59-6" oder "6-59") in
  chartData.composite.connections und prüfe, in welcher Kategorie er
  tatsächlich steht.
- Fehler (severity: critical) wenn:
  a) Kanal im Text als "elektromagnetisch" bezeichnet, liegt aber laut chartData
     unter "compromise", "companionship" oder "parallel".
  b) Kanal als "Goldader", "Ergänzung" oder "Anziehung" beschrieben, obwohl er
     bei EINER Person vollständig definiert ist (= Kompromiss oder Companionship).
  c) Kanal als "parallel" bezeichnet, obwohl nicht ≥ 2 Personen ihn je vollständig
     haben.
  d) Kanal als "Kompromiss" bezeichnet, obwohl niemand ihn vollständig hat.
- Beispiel-Eingabe (Reading-Text):
    "Zwischen euch aktiviert sich der Kanal 59-6 elektromagnetisch..."
  chartData.composite.connections.compromise:
    [{ "channel": "6-59", "completePerson": 0, "partialPersons": [1],
       "partialDetails": [{"gate": 6}] }]
  Erwarteter Fehler:
    check: CHECK 7, severity: critical,
    description: "Kanal 59-6 im Text als elektromagnetisch bezeichnet,
                  laut chartData ist es Kompromiss",
    expected: "Kompromiss (Person 0 hat Kanal vollständig,
                           Person 1 nur Gate 6)",
    found: "elektromagnetisch",
    location: "Abschnitt mit 'Zwischen euch aktiviert sich der Kanal 59-6'"

CHECK 8 – HALLUZINIERTE PLANETEN / ACHSEN (strikt)
- Jede Aussage der Form "Mond in Gate X", "Chiron in Gate X", "Lilith in Gate X",
  "Knotenachse X/Y", "Nordknoten Gate X", "Südknoten Gate X", "Merkur in Gate X",
  "Venus in Gate X", "Mars in Gate X", "Jupiter in Gate X", "Saturn in Gate X",
  "Uranus in Gate X", "Neptun in Gate X", "Pluto in Gate X".
- Vergleiche mit chartData.personality.{planet} und chartData.design.{planet}.
- Fehler (severity: critical) wenn die Aussage im Text steht, aber der Planet
  laut chartData in einem anderen Gate steht ODER die Planeten-Position nicht
  im chartData vorhanden ist (z.B. Chiron/Lilith bei Light-Charts).
- STRIKT: Keine Ausgabe einer Planeten-Position, die nicht aus chartData kommt.
  Lieber den Satz löschen als eine ungestützte Position stehen lassen.

CHECK 9 – BEGRIFFS-WIDERSPRUCH
- Fehler (severity: critical) wenn derselbe Kanal im Text mit zwei
  widersprüchlichen Kategorien belegt wird (z.B. "elektromagnetisch" UND
  "Kompromiss" für denselben Kanal), oder wenn derselbe Kanal erst als aktiv
  und dann als inaktiv bezeichnet wird.
- Auch erfasst: ein Kanal, der laut chartData NICHT im aktivierten Set steht,
  aber im Reading dennoch als "euer Kanal" beschrieben wird (Tore die kein
  vollständiger Kanal sind, dürfen nicht als Kanäle dargestellt werden).

---

AUSGABE – antworte NUR mit diesem JSON, ohne Erklärungen davor oder danach:

{
  "valid": true,
  "errorCount": 0,
  "errors": [
    {
      "check": "CHECK 1-9",
      "severity": "critical",
      "description": "Was ist falsch",
      "expected": "Was laut chartData korrekt wäre",
      "found": "Was im Reading steht",
      "location": "Zitat oder Abschnittsangabe aus dem Reading"
    }
  ],
  "summary": "Einzeiliger Gesamtstatus"
}

Wenn keine Fehler: errors = [], valid = true.
Antworte AUSSCHLIESSLICH mit dem JSON-Objekt. Kein Text davor oder danach.
Keine Markdown-Backticks.
```

---

## Anhang B — Wörtlicher Corrector-Prompt

Kompletter Inhalt `reading-worker/templates/correct-reading.txt` (101 Zeilen). Wird in `reading-pipeline.js:243` via `correctReading()` aufgerufen (nur wenn CHECK-Fehler gefunden).

```
Du bist ein präziser Human Design Reading-Korrektor.

Du erhältst:
1. Die originalen Chart-Daten (QUELLE DER WAHRHEIT)
2. Den fehlerhaften Reading-Text
3. Einen Fehlerbericht (JSON) aus der Validierung

Deine Aufgabe: Korrigiere den Reading-Text. Ändere NUR die Stellen, die im
Fehlerbericht markiert sind. Der Rest des Textes bleibt UNVERÄNDERT – Stil,
Länge, Struktur, Formulierungen bleiben identisch.

---

CHART-DATEN (Quelle der Wahrheit):
{{chartData}}

FEHLERHAFTER READING-TEXT:
{{readingText}}

FEHLERBERICHT:
{{validationResult}}

---

KORREKTURREGELN:

REGEL 0 – LÄNGE UNBEDINGT BEIBEHALTEN
Der korrigierte Text MUSS mindestens genauso lang sein wie der Originaltext.
Kürze KEINE Abschnitte, streiche KEINE Sätze, fasse NICHTS zusammen.
Ersetze nur die fehlerhaften Stellen — alles andere bleibt Wort für Wort
identisch.

REGEL 1 – NUR FEHLER AUS DEM BERICHT KORRIGIEREN
Korrigiere ausschließlich die Stellen, die im Fehlerbericht unter "location"
und "found" angegeben sind.
Verändere keine anderen Sätze, keine anderen Absätze, keine Reihenfolge.

REGEL 2 – FEHLENDE ZENTREN ERGÄNZEN
Wenn offene Zentren fehlen: Füge sie im passenden Abschnitt (Konditionierung /
offene Zentren) ein.
Verwende denselben Schreibstil wie die bereits vorhandenen Zentren-Beschreibungen.
Positioniere das fehlende Zentrum in der logischen Reihenfolge (Kopf → Ajna →
Kehle → G → Herz → Solarplexus → Sakral → Milz → Wurzel).

REGEL 3 – FALSCHE ZAHLEN ERSETZEN
Wenn "X von neun Zentren" falsch ist: Ersetze nur die Zahl, nicht den Satz.

REGEL 4 – FALSCHE TORE/KANÄLE KORRIGIEREN
Ersetze falsch genannte Tore oder Zentren-Zuordnungen durch die korrekten Werte
aus chartData.
Passe nur die konkreten Tor-Nummern und Zentren-Namen an, nicht den
Beschreibungstext drumherum.

REGEL 5 – INKARNATIONSKREUZ KORRIGIEREN
Wenn das falsche Kreuz oder falsche Tore beschrieben werden: Ersetze den
gesamten Inkarnationskreuz-Abschnitt.
Die korrekten Werte stehen im chartData-Block unter "SOLAR- UND ERD-GATES":
  Persönlichkeitssonne = Tor X  ← dieser Wert gehört zur Persönlichkeitssonne,
                                   NICHT zur Design-Sonne
  Persönlichkeitserde  = Tor X  ← dieser Wert gehört zur Persönlichkeitserde
  Design-Sonne         = Tor X  ← dieser Wert gehört zur Design-Sonne,
                                   NICHT zur Persönlichkeitssonne
  Design-Erde          = Tor X  ← dieser Wert gehört zur Design-Erde
KRITISCH: Design-Sonne und Persönlichkeitssonne sind VERSCHIEDENE Tore —
verwechsle sie nicht.
Behalte Länge und Tiefe des ursprünglichen Abschnitts bei.

REGEL 6 – PRONOMEN KORRIGIEREN
Wenn das Geschlecht falsch ist: Ersetze alle falschen Pronomen im gesamten Text.
Weiblich → sie/ihr/ihre, Männlich → er/ihm/seine.

REGEL 7 – FALSCHE VERBINDUNGSTYP-LABELS KORRIGIEREN
  (Connection/Penta/Dating/Resonanz)
Wenn im Fehlerbericht ein CHECK 7-Fehler gemeldet wird:
  Ersetze das falsche Label im Text durch den korrekten Typ laut
  chartData.composite.connections.
  - Falsch "elektromagnetisch" bei einseitig vollständigem Kanal
      → durch "Kompromiss" oder "Companionship" ersetzen, je nach
        chartData-Befund.
  - Falsch "Goldader" / "Ergänzung" / "Anziehung" bei einseitig vollständigem
    Kanal
      → durch "Kompromiss" oder "Companionship" ersetzen.
  - Falsch "parallel" ohne ≥ 2 vollständige Personen
      → auf die tatsächliche Kategorie ummappen
        (z.B. "elektromagnetisch" oder "Kompromiss").
  - Falsch "Kompromiss" ohne vollständige Person
      → auf "elektromagnetisch" korrigieren.
Wichtig: Ändere NUR das Label-Wort und das direkt beschreibende Satzfragment,
nicht die umliegende Beschreibung des Kanals selbst.
Die Kanal-Nummer und die deutschen Kanal-Namen (aus chartData.channels[i].name_de)
bleiben unverändert.

REGEL 8 – HALLUZINIERTE PLANETEN-POSITIONEN LÖSCHEN (strikt, kein Ersatz)
Wenn im Fehlerbericht ein CHECK 8-Fehler gemeldet wird:
  Lösche die betroffene Aussage KOMPLETT. Kein Ersatz. Wenn der Satz dadurch
  leer wird, lösche den ganzen Satz. Wenn ein Absatz nur aus der halluzinierten
  Aussage besteht, lösche den Absatz.
  Kürzer ist besser als falsch.
  Nicht durch "vielleicht" oder "möglicherweise" ersetzen — weg damit.
  Einzige Ausnahme: Die Position steht tatsächlich in chartData.personality oder
  chartData.design — dann ist sie korrekt und bleibt stehen.

REGEL 9 – BEGRIFFS-WIDERSPRUCH VEREINHEITLICHEN
Wenn im Fehlerbericht ein CHECK 9-Fehler gemeldet wird:
  Ersetze den gesamten widersprüchlichen Block durch eine einzige, an chartData
  ausgerichtete Formulierung. Wenn z.B. 16-48 erst als EM, dann als kein EM
  bezeichnet wird und chartData sagt "compromise", dann komplette Passage
  auf "Kompromiss" umschreiben.
Wenn ein "Kanal" erwähnt wird, der laut chartData.channels nicht existiert:
  Die Erwähnung des Kanal-Konstrukts entfernen. Die beteiligten einzelnen Tore
  dürfen erwähnt bleiben, aber nicht als Kanal.

---

AUSGABE:
Gib ausschließlich den korrigierten Reading-Text zurück.
Kein Kommentar, keine Erklärung, kein JSON davor oder danach.
Nur der vollständige, korrigierte Text – bereit zur Ausgabe.
```

---

## Anhang C — Part-1-Prompt (Two-Pass detailed.txt)

Wörtlicher Prompt aus `server.js:775-822`. Part 2 folgt derselben Struktur mit Abschnitten 4–8.

```
Du bist ein erfahrener Human Design Coach. Verwende folgendes Hintergrundwissen:
{{knowledgeText}}

WICHTIGE ANWEISUNG: Die Chart-Daten wurden präzise via Swiss Ephemeris berechnet
und sind vollständig im Prompt enthalten. Füge KEINEN Disclaimer ein, dass du
kein Berechnungstool hast. Beginne das Reading direkt ohne Vorbemerkungen.

Erstelle TEIL 1 eines tiefgründigen, persönlichen Human Design Readings für:
Name: {{client_name}}
Geburtsdatum: {{birth_date}}
Geburtszeit: {{birth_time}}
Geburtsort: {{birth_location}}
{{chartInfo}}             ← deutscher Chart-Block aus buildChartInfo()
{{transitOverlay}}        ← aktuelle Transits für Tagesbezug
{{deltaContext}}          ← Bezug auf die letzten 2 Readings (Kontinuität)

Schreibe direkt an die Person gerichtet (Du-Form), mit vollem Einsatz – wie eine
90-Minuten-Coaching-Session.
Keine Plattitüden. Keine generischen Erklärungen. Spiegel dieser einen Person.

---

## 1. Dein Typ: Wer du wirklich bist
Der Typ {{type}} ist nicht das, was du bist – er ist, wie deine Energie in der
Welt funktioniert. Erkläre:
- Die Essenz dieses Typs und was er im Kern über diese Person aussagt
- Wie die Energie dieser Person auf andere wirkt – was Menschen spüren, wenn
  sie mit ihr zusammen sind
- Die Strategie im Detail ({{strategy}}): konkrete Alltagssituationen wo sie
  anzuwenden ist (Entscheidungen, Beziehungen, Arbeit, Spontanität), und was
  passiert wenn dagegen gehandelt wird
- Die Not-Self-Emotion als Navigationssystem: was sie signalisiert und wie sie
  als Frühwarnsystem genutzt werden kann
- Die Signatur des Typs als Zielzustand: wann diese Person weiß, dass sie im
  Flow ist, wie sich das anfühlt

## 2. Deine Autorität: Der ehrlichste Entscheidungskompass
Die Autorität {{authority}} ist wichtiger als jeder rationale Verstand:
- Wie genau diese Autorität funktioniert – die Mechanik dahinter
- Woran die Person erkennt, dass sie aus der Autorität heraus entscheidet
  (vs. aus Angst, Druck, Konditionierung)
- Die häufigsten Fallen: wie der Verstand die Autorität überschreibt und welche
  Lebenssituationen dadurch entstehen
- Konkrete Übungen und Praktiken, um dieser Autorität täglich zu vertrauen
- Wie diese Autorität bei großen Entscheidungen (Beziehungen, Karriere,
  Wohnort) UND bei Alltagsentscheidungen angewendet wird

## 3. Deine Zentren: Die Energiearchitektur
Für jedes DEFINIERTE Zentrum:
- Die spezifische Energie, die konstant ausgestrahlt wird
- Das Geschenk und wie andere diese Energie erleben
- Wie dieses Zentrum bewusst eingesetzt werden kann
- Die Schattenseite oder Überwältigungsgefahr

Für jedes OFFENE Zentrum:
- Welche Konditionierungen typischerweise dort entstehen – und welche konkreten
  Verhaltensmuster dadurch entstehen
- Die Weisheit, die durch das Nicht-Fixiert-Sein entsteht
- Die Befreiungsfrage: "Ist das meine Energie oder habe ich sie aufgenommen?"
- Was das undefinierte Zentrum als Lernfeld bedeutet

Schreibe mindestens 2500 Wörter für diesen Teil. Sprache: Deutsch, Du-Form,
tiefgründig, persönlich – kein Human-Design-Lehrbuch.
```

---

*Ende der Dokumentation. Änderungen an dieser Datei bitte über `CHANGELOG.md` referenzieren. Nicht editieren ohne gleichzeitige Prüfung der zitierten Dateien — die Zeilennummern sind stichtagsgebunden (`65ab2ed`, 2026-04-22).*
