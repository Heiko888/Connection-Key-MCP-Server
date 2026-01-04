# Chart Truth Service

Single Source of Truth für alle Chart-Berechnungen.

## Zweck

Dieser Service ist die **einzige erlaubte Schnittstelle** zur Chart-Berechnung. Er stellt einen stabilen, versionierten Contract bereit und kapselt die bestehende Berechnungslogik (`integration/scripts/chart-calculation-astronomy.js`).

## Verwendung

```typescript
import { getChartTruth, ChartTruthInput } from './services/chart-truth/chartTruthService';

const input: ChartTruthInput = {
  birth_date: '1990-01-15',    // YYYY-MM-DD
  birth_time: '14:30',         // HH:MM
  latitude: 52.52,
  longitude: 13.405,
  timezone: 'Europe/Berlin'    // IANA timezone
};

const chart = await getChartTruth(input);
```

## Input-Format (verbindlich)

- `birth_date`: `string` (YYYY-MM-DD)
- `birth_time`: `string` (HH:MM)
- `latitude`: `number`
- `longitude`: `number`
- `timezone`: `string` (IANA, z.B. `Europe/Berlin`)

**Kein Geocoding, keine Interpretation, keine Default-Werte.**

## Output-Format (Truth Contract)

```typescript
{
  chart_version: "1.0.0",
  calculated_at: "ISO-8601",
  input_hash: "sha256",
  input: { ... },
  core: {
    type: string | null,
    authority: string | null,
    strategy: string | null,
    profile: string | null,
    definition: string | null
  },
  centers: {
    head: "defined" | "undefined",
    ajna: "...",
    throat: "...",
    g: "...",
    heart: "...",
    spleen: "...",
    solar_plexus: "...",
    sacral: "...",
    root: "..."
  },
  channels: ["34-20", "3-60"],
  gates: {
    personality: { ... },
    design: { ... }
  }
}
```

## Architektur-Regeln

- ❌ `calculateChart()` darf außerhalb dieses Wrappers nicht mehr aufgerufen werden
- ❌ Keine Gate-/Channel-/Center-Logik im Wrapper
- ❌ Kein Business- oder Reading-Kontext
- ✅ Nur: kapseln, versionieren, bereitstellen

## Deterministik

Gleicher Input → gleicher `input_hash` → identischer Chart-Output (abgesehen von `calculated_at`).

Siehe `chartTruthService.test.ts` für Verifikation.
