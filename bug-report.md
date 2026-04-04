# Bug Report — chartCalculation.js
**Datum:** 2026-04-04  
**Datei:** `/opt/mcp-connection-key/connection-key/lib/astro/chartCalculation.js`  
**Tests:** `/tmp/test-bug1.js`, `/tmp/test-bug2.js`, `/tmp/test-bug3.js`

---

## Zusammenfassung

| # | Bug | Schwere | Einfluss auf Reading-Inhalt |
|---|-----|---------|----------------------------|
| 1 | `toObjectMap` konvertiert `north-node` → `north_node` | MEDIUM | Ja, wenn Frontend Objekt-Format nutzt |
| 1b | `toObjectMap` dropped `silent: true` für Chiron/Lilith | LOW | Ja — Frontend kann stille Planeten nicht unterscheiden |
| 2 | `CHANNEL_NAMES["6-59"]` Duplikat — falscher Kanalname | LOW | Kosmetisch (falscher Name im AI-Prompt) |
| 3 | Gate 25 Wrap-Around | KEIN BUG | — |
| 4 | Typ-Berechnung: MG-Logik vereinfacht | HIGH | Ja — falsche Typ-Zuweisung möglich |
| 5 | `definition` Berechnung fehlerhaft | MEDIUM | Ja — falsche Definition im AI-Prompt |
| 6 | Stale Chart-Daten in Supabase (alter Chiron/Lilith-Bug) | HIGH | Ja — alte Readings mit falschen Zentren |

---

## BUG 1 — `toObjectMap`: Key-Konvertierung (BESTÄTIGT)

**Testskript:** `test-bug1.js` → alle 4 Tests PASS  
**Fundort:** `chartCalculation.js` Zeile 558–560

```js
const toObjectMap = (arr) => Object.fromEntries(
  arr.map(({ planet, gate, line }) => [planet.replace(/-/g, '_'), { gate, line }])
);
```

### Problem A: Key-Format-Inkonsistenz
Das **Array-Format** (`personalityPlanets`) nutzt `north-node` / `south-node` (mit Bindestrich).  
Das **Objekt-Format** (`personality.planets`) nutzt `north_node` / `south_node` (mit Underscore).

```
personality.planets['north-node']  →  undefined ❌
personality.planets['north_node']  →  { gate: X, line: Y } ✅
```

**Tatsächliche Auswirkung:**  
- `transits.js` Zeile 101–109 nutzt `planetMap(chart.personalityPlanets)` (Array-Format) → korrekt, kein Bug
- Das Objekt-Format (`personality.planets`) wird aktuell nur an das Frontend übergeben  
- Falls Frontend-Code `personality.planets['north-node']` liest → silent fail, Gate = undefined

**Status:** Latenter Bug. Keine aktive Fehlfunktion aktuell gefunden, aber inkonsistentes Interface.

### Problem B: `silent: true` wird gedropt (BONUS-BUG)
```
toObjectMap([{ planet: 'chiron', gate: 55, line: 2, silent: true }])
→ { chiron: { gate: 55, line: 2 } }   ← silent fehlt!
```

Das Objekt-Format enthält für Chiron/Lilith **kein `silent: true`**. Das Frontend kann stille  
Planeten im Objekt-Format nicht von normalen Planeten unterscheiden und könnte sie fälschlicherweise  
zur Darstellung oder Berechnung verwenden.

---

## BUG 2 — `CHANNEL_NAMES` Duplikat-Key (BESTÄTIGT)

**Testskript:** `test-bug2.js` → 1 Duplikat gefunden  
**Fundort:** `chartCalculation.js` Zeilen 112 und 119

```js
"6-59": "Mating",     // ← Zeile 112 — VERLOREN
...
"6-59": "Intimacy",   // ← Zeile 119 — AKTIV (überschreibt)
```

### Auswirkung
- Kanal 6-59 heißt im HD-Standard **"Mating"** (Jovian Archive)  
- Im AI-Prompt steht stattdessen **"Intimacy"** (das ist der Name von Gate 59, nicht des Kanals)  
- Kein Einfluss auf Gate-Nummern, Zentren oder Typ — nur falscher Kanalname in der Reading-Ausgabe

### Nebeneffekt: CHANNELS-Array hat Duplikat
```js
{ gates: [6, 59],  centers: ["solar-plexus", "sacral"] },  // Zeile 49
...
{ gates: [59, 6],  centers: ["sacral", "solar-plexus"] },  // Zeile 79
```
Beide Einträge für denselben Kanal, Reihenfolge der Zentren unterschiedlich.  
Dedupliziert durch `seenChannels` Set (Zeile 479) — kein Rechenfehler, aber redundanter Code.

---

## BUG 3 — Gate 25 Wrap-Around (KEIN BUG)

**Testskript:** `test-bug3.js` → alle 9 Tests PASS, 0 Lücken, 0 Überlappungen

```
Gate 25: start=358.25°, end=3.875° (überschreitet 0°/360°-Grenze)

359.0° → Gate 25 ✅
  1.0° → Gate 25 ✅
  2.5° → Gate 25 ✅
  3.5° → Gate 25 ✅
358.3° → Gate 25 ✅
  0.0° → Gate 25 ✅
3.875° → Gate 17 ✅ (korrekte Grenze)
  4.5° → Gate 17 ✅
357.0° → Gate 36 ✅
```

Span-Summe: 360° ✅ — Keine Lücken ✅ — Keine Überlappungen ✅  
**Der Wrap-Around-Code ist korrekt implementiert.**

---

## BUG 4 — Typ-Berechnung: Manifesting Generator (KRITISCH)

**Fundort:** `chartCalculation.js` Zeilen 501–510

```js
} else if (sacral) {
  type = throat ? "Manifesting Generator" : "Generator";
```

### Problem
Die HD-Regel ist: **Sacral muss über Kanäle direkt oder indirekt mit der Kehle verbunden sein** — dann ist die Person ein Manifesting Generator.  

Die aktuelle Implementierung prüft nur: "Ist Sacral-Zentrum definiert UND Throat-Zentrum definiert?"  
Das ist **zu simpel** — zwei definierte Zentren können isoliert sein (keine verbindenden Kanäle).

### Beispiel
Person hat Kanal 21-45 (Heart→Throat definiert) und Kanal 3-60 (Sacral→Root definiert).  
→ Sacral=true, Throat=true  
→ Code sagt: **Manifesting Generator** ❌  
→ Korrekt wäre: **Generator** (kein Channel verbindet Sacral mit Throat)

### Auswirkung
Menschen könnten den falschen HD-Typ im Reading erhalten. Typ ist die wichtigste Aussage im Human Design.

---

## BUG 5 — `definition` Berechnung vereinfacht (MEDIUM)

**Fundort:** `chartCalculation.js` Zeilen 521–525

```js
if (definedCount === 0) definition = "None";
else if (activeChannels.length <= 1) definition = "Single";
else definition = "Split Definition";
```

### Problem
"Split Definition" bedeutet: die definierten Zentren bilden **zwei oder mehr getrennte Gruppen**,  
die nicht durch Kanäle verbunden sind.  
Die aktuelle Logik setzt Split Definition wenn `channels > 1` — das ist falsch:  
- 2 verbundene Kanäle (z.B. 1-8 + 8-1... oder 3-60 + 42-53 teilen Sacral) = **Single Definition** ✅ korrekt  
- 2 nicht verbundene Kanäle = **Split Definition** ✅ korrekt  
- 3 Kanäle, alle verbunden = **Single Definition** ← Code gibt "Split" ❌

---

## BUG 6 — Stale Daten in Supabase (WAHRSCHEINLICHSTE Ursache der gemeldeten Fehler)

### Hintergrund
Commit `86c99b0` ("fix: Chiron & Lilith als stille Flüsterer — kein Einfluss auf activeGates")  
wurde **nach dem Erstellen vieler Readings** deployed.

### Problem
Alle Readings, die **vor** diesem Commit berechnet wurden, haben `chart_data` in Supabase  
mit falschen Zentren/Kanälen/Typ — denn Chiron und Lilith haben damals fälschlicherweise  
Kanäle aktiviert, die eigentlich nicht definiert sein sollten.

Diese alten `chart_data`-Werte werden unverändert an den Reading-Worker übergeben  
(Zeile 146: `if (data?.chart_data && data.chart_data.type) return { chart: data.chart_data }`).

### Symptom
→ Reading zeigt Zentren/Tore/Kanäle, die im echten HD-Chart nicht existieren  
→ Typ könnte falsch sein (z.B. Projector → Manifestor durch falschen Chiron-Kanal)

### Lösung
Charts für betroffene Readings neu berechnen und `chart_data` in Supabase updaten.  
SQL zur Identifikation: Readings, bei denen `chart_data->>'type'` nicht zum recalculated type passt.

---

## Empfohlene Fixes (nach Priorität)

### P0 — Sofort (Daten-Korrektheit)
1. **Bug 6**: Alle betroffenen `chart_data`-Einträge in Supabase neu berechnen  
   → Migration-Script: Alle `readings` mit `updated_at` vor Commit `86c99b0` (2026-02-XX) re-kalkulieren

2. **Bug 4**: Typ-Berechnung für Manifesting Generator korrigieren  
   → Prüfen ob Sacral-Zentrum über Kanalpfad mit Throat verbunden ist (Graph-Traversal)

### P1 — Dringend
3. **Bug 5**: `definition`-Berechnung korrigieren  
   → Graph-Traversal über `activeChannels` um Connected Components zu zählen

4. **Bug 2**: Duplikat in `CHANNEL_NAMES` entfernen  
   → `"6-59": "Mating"` ist korrekt per HD-Standard; zweite Zeile `"6-59": "Intimacy"` löschen  
   → Duplikat in `CHANNELS`-Array (Zeilen 49 + 79) bereinigen

### P2 — Mittel
5. **Bug 1b**: `toObjectMap` um `silent` erweitern  
   → `arr.map(({ planet, gate, line, silent }) => [planet.replace(/-/g, '_'), silent ? { gate, line, silent } : { gate, line }])`

---

## Test-Dateien
- `/tmp/test-bug1.js` — toObjectMap Key-Konvertierung
- `/tmp/test-bug2.js` — CHANNEL_NAMES Duplikate
- `/tmp/test-bug3.js` — Gate 25 Wrap-Around
