# D1 – Chart-Visualisierung: Architektur & Implementierung

**Rolle:** Senior Frontend & Platform Architect  
**Status:** Architektur-Definition  
**Datum:** 2026-01-04

---

## 🎯 Kernprinzipien (NICHT VERHANDELBAR)

1. **Visualisierung basiert ausschließlich auf `chart_id`**
2. **Chart-Daten werden read-only geladen**
3. **KEINE Berechnung, KEINE Ableitung, KEINE Defaults**
4. **Chart-Version wird respektiert (`chart_version`)**
5. **Fehler sind sichtbar (kein Fallback, kein Stille)**

---

## 1️⃣ Architekturübersicht

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │ ReadingPage  │─────▶│ ChartLoader  │                     │
│  │              │      │              │                     │
│  │ reading_id   │      │ chart_id     │                     │
│  └──────────────┘      └──────┬───────┘                     │
│                               │                              │
│                               ▼                              │
│                      ┌─────────────────┐                    │
│                      │ GET /api/chart/ │                    │
│                      │    {chart_id}   │                    │
│                      └────────┬────────┘                    │
│                               │                              │
└───────────────────────────────┼──────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND API (Next.js App Router)                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────┐           │
│  │  GET /api/chart/{chart_id}                   │           │
│  │  ─────────────────────────────────────────── │           │
│  │  • Lädt Chart aus public_core.charts         │           │
│  │  • Validiert chart_version                    │           │
│  │  • Gibt chart_data zurück                     │           │
│  │  • Fehler: 404, 400, 403                      │           │
│  └──────────────────┬───────────────────────────┘           │
│                     │                                          │
└─────────────────────┼────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE (public_core.charts)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────┐           │
│  │  SELECT id, chart_version, input_hash,       │           │
│  │         chart, created_at                    │           │
│  │  FROM public_core.charts                     │           │
│  │  WHERE id = {chart_id}                       │           │
│  └──────────────────────────────────────────────┘           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Rendering)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────┐           │
│  │  <BodygraphRenderer chart={chart_data} />    │           │
│  │  ─────────────────────────────────────────── │           │
│  │  • Rendert Centers                           │           │
│  │  • Rendert Channels                          │           │
│  │  • Rendert Gates                             │           │
│  │  • Keine Logik, nur Darstellung              │           │
│  └──────────────────────────────────────────────┘           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ API-Contract

### Endpoint: `GET /api/chart/{chart_id}`

**Pfad:** `/app/api/chart/[chart_id]/route.ts`

**Request:**
```typescript
GET /api/chart/{chart_id}
```

**Response (Success - 200):**
```typescript
{
  chart_id: string;           // UUID
  chart_version: string;      // z.B. "1.0.0"
  chart_input_hash: string;   // SHA256
  chart_data: {
    core: {
      type: string;
      authority: string;
      strategy: string;
      profile: string;
      definition: string;
    };
    centers: {
      head: "defined" | "undefined";
      ajna: "defined" | "undefined";
      throat: "defined" | "undefined";
      g: "defined" | "undefined";
      heart: "defined" | "undefined";
      spleen: "defined" | "undefined";
      solar_plexus: "defined" | "undefined";
      sacral: "defined" | "undefined";
      root: "defined" | "undefined";
    };
    channels: Array<{
      number: number;
      gate1: number;
      gate2: number;
      name: string;
      defined: boolean;
    }>;
    gates: {
      [gateNumber: string]: {
        line: number;
        planet: string;
      };
    };
  };
  created_at: string;         // ISO 8601
}
```

**Response (Error - 404):**
```typescript
{
  error: "CHART_NOT_FOUND";
  message: "Chart with ID {chart_id} not found";
  chart_id: string;
}
```

**Response (Error - 400):**
```typescript
{
  error: "UNSUPPORTED_VERSION";
  message: "Chart version {chart_version} is not supported";
  chart_id: string;
  chart_version: string;
  supported_versions: string[];  // z.B. ["1.0.0"]
}
```

**Response (Error - 403):**
```typescript
{
  error: "ACCESS_DENIED";
  message: "Access to chart {chart_id} denied";
  chart_id: string;
}
```

**Response (Error - 500):**
```typescript
{
  error: "INTERNAL_ERROR";
  message: "Internal server error";
  chart_id: string;
}
```

---

## 3️⃣ Frontend-Datenfluss (VERBINDLICH)

### Exakter Datenfluss (kein alternativer Pfad):

```
1. User öffnet Reading-Seite
   ↓
2. ReadingPage lädt Reading via reading_id
   ↓
3. Reading enthält chart_id
   ↓
4. ChartLoader lädt Chart via chart_id
   ↓
5. GET /api/chart/{chart_id}
   ↓
6. API lädt Chart aus public_core.charts
   ↓
7. ChartLoader erhält chart_data
   ↓
8. BodygraphRenderer rendert chart_data
```

### Code-Beispiel:

```typescript
// app/readings/[reading_id]/page.tsx
export default async function ReadingPage({ params }: { params: { reading_id: string } }) {
  // 1. Lade Reading
  const reading = await loadReading(params.reading_id);
  
  // 2. Prüfe chart_id
  if (!reading.chart_id) {
    return <ChartNotFoundError message="Reading hat keine Chart-Referenz" />;
  }
  
  // 3. Lade Chart
  return (
    <div>
      <ReadingDisplay reading={reading} />
      <ChartLoader chartId={reading.chart_id} />
    </div>
  );
}

// components/chart/ChartLoader.tsx
export function ChartLoader({ chartId }: { chartId: string }) {
  const { data: chart, error, isLoading } = useChart(chartId);
  
  if (isLoading) return <ChartLoadingSkeleton />;
  if (error) return <ChartError error={error} chartId={chartId} />;
  if (!chart) return <ChartNotFoundError chartId={chartId} />;
  
  return <BodygraphRenderer chart={chart.chart_data} />;
}
```

---

## 4️⃣ Frontend-Komponentenstruktur

### Komponenten-Hierarchie:

```
<ChartLoader chartId={string} />
  ├─ <ChartLoadingSkeleton />
  ├─ <ChartError error={Error} chartId={string} />
  ├─ <ChartNotFoundError chartId={string} />
  └─ <BodygraphRenderer chart={ChartData} />
      ├─ <BodygraphSVG>
      │   ├─ <Center id="head" state={defined|undefined} />
      │   ├─ <Center id="ajna" state={defined|undefined} />
      │   ├─ <Center id="throat" state={defined|undefined} />
      │   ├─ <Center id="g" state={defined|undefined} />
      │   ├─ <Center id="heart" state={defined|undefined} />
      │   ├─ <Center id="spleen" state={defined|undefined} />
      │   ├─ <Center id="solar_plexus" state={defined|undefined} />
      │   ├─ <Center id="sacral" state={defined|undefined} />
      │   └─ <Center id="root" state={defined|undefined} />
      ├─ <ChannelsList>
      │   └─ channels.map(channel => (
      │       <Channel
      │         key={channel.number}
      │         number={channel.number}
      │         gate1={channel.gate1}
      │         gate2={channel.gate2}
      │         name={channel.name}
      │         defined={channel.defined}
      │       />
      │     ))
      └─ <GatesList>
          └─ Object.entries(gates).map(([gateNumber, gateData]) => (
              <Gate
                key={gateNumber}
                number={gateNumber}
                line={gateData.line}
                planet={gateData.planet}
              />
            ))
```

### Komponenten-Definitionen:

#### `<ChartLoader chartId />`
- **Props:** `chartId: string`
- **Zuständigkeit:** Lädt Chart via API, zeigt Loading/Error States
- **Keine Logik:** Nur Datenfluss

#### `<BodygraphRenderer chart />`
- **Props:** `chart: ChartData` (aus API Response)
- **Zuständigkeit:** Rendert Bodygraph-Struktur
- **Keine Logik:** Nur Darstellung

#### `<Center id state />`
- **Props:** `id: string`, `state: "defined" | "undefined"`
- **Zuständigkeit:** Rendert ein einzelnes Center
- **Styling:** `state === "defined"` → gefüllt, `state === "undefined"` → leer
- **Keine Logik:** Nur visuelle Darstellung

#### `<Channel number gate1 gate2 name defined />`
- **Props:** `number: number`, `gate1: number`, `gate2: number`, `name: string`, `defined: boolean`
- **Zuständigkeit:** Rendert einen Channel
- **Styling:** `defined === true` → farbig, `defined === false` → grau/gestrichelt
- **Keine Logik:** Nur visuelle Darstellung

#### `<Gate number line planet />`
- **Props:** `number: string`, `line: number`, `planet: string`
- **Zuständigkeit:** Rendert ein Gate
- **Keine Logik:** Nur visuelle Darstellung

---

## 5️⃣ Datenformate

### Chart-Data-Struktur (aus API):

```typescript
interface ChartData {
  core: {
    type: string;              // z.B. "Manifestierender Generator"
    authority: string;          // z.B. "Sakral"
    strategy: string;          // z.B. "Warten um zu reagieren"
    profile: string;           // z.B. "5/1"
    definition: string;        // z.B. "Split"
  };
  centers: {
    head: "defined" | "undefined";
    ajna: "defined" | "undefined";
    throat: "defined" | "undefined";
    g: "defined" | "undefined";
    heart: "defined" | "undefined";
    spleen: "defined" | "undefined";
    solar_plexus: "defined" | "undefined";
    sacral: "defined" | "undefined";
    root: "defined" | "undefined";
  };
  channels: Array<{
    number: number;            // z.B. 20
    gate1: number;             // z.B. 20
    gate2: number;             // z.B. 57
    name: string;              // z.B. "20-57: Der Kanal des Hirnstamms"
    defined: boolean;          // true = aktiviert, false = nicht aktiviert
  }>;
  gates: {
    [gateNumber: string]: {    // z.B. "20"
      line: number;            // z.B. 2
      planet: string;          // z.B. "Sun"
    };
  };
}
```

### Mapping: chart_data → visuelle Elemente

#### Centers:
- `centers[id] === "defined"` → Center ist gefüllt (aktiv)
- `centers[id] === "undefined"` → Center ist leer (inaktiv)

#### Channels:
- `channel.defined === true` → Channel ist aktiv (farbig, durchgezogen)
- `channel.defined === false` → Channel ist inaktiv (grau, gestrichelt)

#### Gates:
- `gates[gateNumber]` existiert → Gate ist aktiviert
- `gates[gateNumber]` existiert nicht → Gate ist nicht aktiviert

**WICHTIG:** Renderer darf NICHT wissen, wie Gates berechnet werden. Renderer kennt nur „ist aktiv“ / „ist nicht aktiv“.

---

## 6️⃣ Versionierung & Zukunftssicherheit

### chart_version im Frontend:

```typescript
// lib/chart/versioning.ts
const SUPPORTED_VERSIONS = ["1.0.0"] as const;

export function isVersionSupported(version: string): boolean {
  return SUPPORTED_VERSIONS.includes(version as any);
}

export function getVersionRenderer(version: string): "v1" | "v2" | "unknown" {
  if (version.startsWith("1.")) return "v1";
  if (version.startsWith("2.")) return "v2";
  return "unknown";
}
```

### Neue Chart-Formate ergänzen:

1. **Neue Version in `SUPPORTED_VERSIONS` hinzufügen**
2. **Neuen Renderer erstellen:** `<BodygraphRendererV2 chart />`
3. **Version-Routing:** `getVersionRenderer(version)` → Renderer auswählen
4. **Alte Charts weiterhin darstellen:** V1-Renderer bleibt erhalten

### Beispiel für Version-Routing:

```typescript
// components/chart/BodygraphRenderer.tsx
export function BodygraphRenderer({ chart, version }: { chart: ChartData; version: string }) {
  const renderer = getVersionRenderer(version);
  
  switch (renderer) {
    case "v1":
      return <BodygraphRendererV1 chart={chart} />;
    case "v2":
      return <BodygraphRendererV2 chart={chart} />;
    default:
      return <UnsupportedVersionError version={version} />;
  }
}
```

---

## 7️⃣ Abnahmekriterien (HART)

D1 gilt als **BESTANDEN**, wenn:

### ✅ Checkliste:

- [ ] **Chart wird ausschließlich über `chart_id` geladen**
  - Keine Chart-Berechnung im Frontend
  - Keine Geburtsdaten im Frontend
  - Nur API-Call: `GET /api/chart/{chart_id}`

- [ ] **Keine Chart-Berechnung im Frontend**
  - Keine `calculateChart()` Funktionen
  - Keine `astronomy-engine` Imports
  - Keine Gate/Channel-Berechnungen

- [ ] **Löschen eines Charts bricht Visualisierung sichtbar**
  - Chart gelöscht → 404 Error sichtbar
  - Kein Fallback, kein "Chart nicht verfügbar" ohne Fehler
  - Error-Komponente zeigt: "Chart {chart_id} nicht gefunden"

- [ ] **Gleicher `chart_id` → identische Darstellung**
  - 2x gleicher `chart_id` → identisches Rendering
  - Keine Variation, keine Zufälligkeit

- [ ] **Unterschiedliche `chart_version` → bewusst unterscheidbar**
  - Version 1.0.0 → V1-Renderer
  - Version 2.0.0 → V2-Renderer (falls implementiert)
  - Unsupported Version → Error sichtbar

### ❌ Was NICHT erlaubt ist:

- ❌ Chart-Berechnung im Frontend
- ❌ Fallback auf Default-Chart
- ❌ Stille Fehler (keine Error-Komponente)
- ❌ Geburtsdaten im Frontend
- ❌ Gate/Channel-Berechnungen im Renderer

---

## 8️⃣ Implementierungsreihenfolge

### Phase 1: API-Route
1. Erstelle `app/api/chart/[chart_id]/route.ts`
2. Implementiere `GET /api/chart/{chart_id}`
3. Teste mit verschiedenen `chart_id`s
4. Teste Fehlerfälle (404, 400, 403)

### Phase 2: Frontend-Hook
1. Erstelle `lib/hooks/useChart.ts`
2. Implementiere `useChart(chartId)`
3. Teste Loading/Error States

### Phase 3: Komponenten
1. Erstelle `<ChartLoader chartId />`
2. Erstelle `<BodygraphRenderer chart />`
3. Erstelle `<Center />`, `<Channel />`, `<Gate />`
4. Teste Rendering mit echten Chart-Daten

### Phase 4: Integration
1. Integriere `<ChartLoader />` in ReadingPage
2. Teste vollständigen Datenfluss
3. Teste Fehlerfälle

### Phase 5: Abnahme
1. Prüfe alle Abnahmekriterien
2. Teste mit verschiedenen `chart_id`s
3. Teste mit verschiedenen `chart_version`s
4. Dokumentiere Abnahme

---

## 9️⃣ Dateistruktur

```
frontend/
├── app/
│   ├── api/
│   │   └── chart/
│   │       └── [chart_id]/
│   │           └── route.ts          # GET /api/chart/{chart_id}
│   └── readings/
│       └── [reading_id]/
│           └── page.tsx              # ReadingPage mit ChartLoader
├── components/
│   └── chart/
│       ├── ChartLoader.tsx           # Lädt Chart via API
│       ├── ChartError.tsx            # Error-Komponente
│       ├── ChartLoadingSkeleton.tsx  # Loading-State
│       ├── BodygraphRenderer.tsx     # Haupt-Renderer
│       ├── BodygraphSVG.tsx          # SVG-Container
│       ├── Center.tsx                # Center-Komponente
│       ├── Channel.tsx               # Channel-Komponente
│       └── Gate.tsx                  # Gate-Komponente
├── lib/
│   ├── hooks/
│   │   └── useChart.ts               # useChart Hook
│   └── chart/
│       ├── types.ts                  # ChartData Types
│       └── versioning.ts             # Version-Handling
└── types/
    └── chart.ts                       # Chart TypeScript Types
```

---

## 🔟 Merksatz für D1

> **Wenn der Chart falsch ist, soll man es sehen.**  
> **Wenn der Chart fehlt, soll es brechen.**

---

## 📋 Nächste Schritte

1. ✅ Architektur definiert
2. ⏳ API-Route implementieren
3. ⏳ Frontend-Hook implementieren
4. ⏳ Komponenten implementieren
5. ⏳ Integration testen
6. ⏳ Abnahme durchführen

---

**Status:** Architektur-Definition abgeschlossen  
**Nächster Schritt:** Implementierung Phase 1 (API-Route)
