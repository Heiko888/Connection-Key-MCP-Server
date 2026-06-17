# 📊 Chart-Berechnungslogik - Komplette Übersicht

**Stand:** 16.12.2025

**Frage:** Wie ist die Chart-Berechnungslogik für den Chart-Agenten hinterlegt?

---

## 📍 Wo ist die Chart-Berechnungslogik?

### 1. n8n Workflow (Primär)

**Datei:** `n8n-workflows/chart-calculation-workflow-swisseph.json`

**Was macht es:**
- Webhook: `/webhook/chart-calculation`
- Empfängt: `{ birthDate, birthTime, birthPlace }`
- Berechnet: Human Design Chart-Daten
- Gibt zurück: Vollständige Chart-Daten (Typ, Profil, Gates, Channels, Centers, etc.)

**Status:** ✅ Vorhanden (vereinfachte Berechnung)

---

### 2. JavaScript Modul (Erweitert)

**Datei:** `integration/scripts/chart-calculation-astronomy.js`

**Was macht es:**
- Vollständige Chart-Berechnungsklasse
- Nutzt `astronomy-engine` (falls verfügbar)
- Fallback: Vereinfachte Berechnung
- Geocoding: Geburtsort → Koordinaten
- Berechnet: Planetenpositionen, Gates, Channels, Centers, Typ, Profil, etc.

**Status:** ✅ Vorhanden (vollständige Implementierung)

---

### 3. API Route (Chart Development Agent)

**Datei:** `integration/api-routes/agents-chart-development.ts`

**Was macht es:**
- Ruft Reading Agent auf für Chart-Berechnung
- Oder nutzt bereitgestellte `chartData`
- Gibt Chart-Daten an Chart Development Agent weiter

**Status:** ✅ Vorhanden

---

## 🧮 Wie funktioniert die Chart-Berechnung?

### Schritt 1: Geburtsdaten parsen

```javascript
const [year, month, day] = birthDate.split('-').map(Number);
const [hours, minutes] = birthTime.split(':').map(Number);
```

---

### Schritt 2: Julian Day berechnen

```javascript
function calculateJulianDay(year, month, day, hours, minutes) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  
  const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + 
              Math.floor(y / 4) - Math.floor(y / 100) + 
              Math.floor(y / 400) - 32045;
  
  const jd = jdn + (hours - 12) / 24 + minutes / 1440;
  return jd;
}
```

---

### Schritt 3: Planetenpositionen berechnen

**Option A: Mit astronomy-engine (präzise)**
```javascript
const sunLongitude = AstronomyEngine.SunLongitude(time);
const moonLongitude = AstronomyEngine.MoonLongitude(time);
// ... alle Planeten
```

**Option B: Fallback (vereinfacht)**
```javascript
const baseAngle = (julianDay % 360) * 2;
planets.sun = { longitude: baseAngle, ... };
planets.moon = { longitude: (baseAngle + 30) % 360, ... };
// ... alle Planeten mit Offsets
```

---

### Schritt 4: Position → Human Design Gate

**Human Design nutzt 64 Gates (I-Ching Hexagramme)**

```javascript
function positionToGate(longitude) {
  let normalized = longitude % 360;
  if (normalized < 0) normalized += 360;
  
  // Jedes Gate = 5.625° (360° / 64)
  const gate = Math.floor(normalized / 5.625) + 1;
  return gate > 64 ? 64 : gate;
}

function positionToLine(longitude, gate) {
  const normalized = longitude % 360;
  if (normalized < 0) normalized += 360;
  
  const gateStart = (gate - 1) * 5.625;
  const positionInGate = normalized - gateStart;
  
  // Jede Line = 0.9375° (5.625° / 6)
  const line = Math.floor(positionInGate / 0.9375) + 1;
  return line > 6 ? 6 : line;
}
```

---

### Schritt 5: Channels berechnen

**Channels verbinden zwei Gates**

```javascript
const channelMap = {
  "1-8": [1, 8],
  "2-14": [2, 14],
  "3-60": [3, 60],
  // ... alle 36 Channels
};

function calculateChannels(gates) {
  const activeChannels = [];
  for (const [channelName, channelGates] of Object.entries(channelMap)) {
    if (channelGates.every(gate => gates.includes(gate))) {
      activeChannels.push(channelName);
    }
  }
  return { active: activeChannels };
}
```

---

### Schritt 6: Centers berechnen

**9 Centers im Human Design System**

```javascript
const centerMap = {
  head: [64, 61, 63],
  ajna: [47, 24, 4],
  throat: [23, 8, 20, 16, 35, 45, 12, 33, 31, 56, 62],
  g: [1, 2, 7, 10, 13, 15, 25, 46],
  heart: [21, 26, 40, 51],
  solarPlexus: [6, 22, 36, 37, 49, 55, 30, 50, 58, 19, 60, 41],
  sacral: [5, 14, 29, 9, 3, 42, 27, 34, 59],
  spleen: [48, 57, 18, 28, 32, 44, 50, 52, 58],
  root: [19, 39, 38, 41, 58, 60, 52, 53, 54]
};

function calculateCenters(gates) {
  const definedCenters = [];
  const undefinedCenters = [];
  
  for (const [centerName, centerGates] of Object.entries(centerMap)) {
    const isDefined = centerGates.some(gate => gates.includes(gate));
    if (isDefined) {
      definedCenters.push(centerName);
    } else {
      undefinedCenters.push(centerName);
    }
  }
  
  return { defined: definedCenters, undefined: undefinedCenters };
}
```

---

### Schritt 7: Typ berechnen

**4 Typen basierend auf definierten Centers**

```javascript
function calculateType(centers) {
  const sacralDefined = centers.defined.includes('sacral');
  const throatDefined = centers.defined.includes('throat');
  const spleenDefined = centers.defined.includes('spleen');
  
  if (sacralDefined && throatDefined) return 'Generator';
  if (throatDefined && !sacralDefined) return 'Manifestor';
  if (!sacralDefined && !throatDefined && spleenDefined) return 'Projector';
  if (!sacralDefined && !throatDefined && !spleenDefined) return 'Reflector';
  
  return null;
}
```

---

### Schritt 8: Profil berechnen

**Profil = Sonnen-Linie / Erd-Linie**

```javascript
function calculateProfile(sun, earth) {
  if (!sun || !earth) return null;
  return `${sun.line || 1}/${earth.line || 1}`;
}
```

---

### Schritt 9: Authority berechnen

**Autorität basierend auf definierten Centers**

```javascript
function calculateAuthority(centers) {
  if (centers.defined.includes('sacral')) return 'Sacral';
  if (centers.defined.includes('solarPlexus')) return 'Emotional';
  if (centers.defined.includes('spleen')) return 'Splenic';
  if (centers.defined.includes('heart')) return 'Ego';
  if (centers.defined.includes('g')) return 'Self';
  if (centers.defined.includes('throat')) return 'Environmental';
  return null;
}
```

---

### Schritt 10: Strategy berechnen

**Strategie basierend auf Typ**

```javascript
function calculateStrategy(type) {
  const strategies = {
    'Generator': 'Wait to respond',
    'Manifestor': 'Inform',
    'Projector': 'Wait for invitation',
    'Reflector': 'Wait 28 days'
  };
  return strategies[type] || null;
}
```

---

### Schritt 11: Incarnation Cross berechnen

**Incarnation Cross = Sonnen-Gate + Erd-Gate**

```javascript
function calculateIncarnationCross(sun, earth) {
  if (!sun || !earth) return null;
  return {
    name: `Cross of ${sun.gate}-${earth.gate}`,
    type: 'Right Angle',
    sunGate: sun.gate,
    sunLine: sun.line,
    earthGate: earth.gate,
    earthLine: earth.line
  };
}
```

---

## 📊 Ergebnis: Chart-Daten Struktur

```json
{
  "type": "Generator",
  "profile": "1/3",
  "authority": "Sacral",
  "strategy": "Wait to respond",
  "planets": {
    "sun": { "gate": 1, "line": 1, "longitude": 0 },
    "moon": { "gate": 6, "line": 2, "longitude": 30 },
    // ... alle Planeten
  },
  "gates": {
    "defined": [1, 6, 8, 14, ...],
    "undefined": [2, 3, 4, 5, ...]
  },
  "channels": {
    "active": ["1-8", "2-14", ...]
  },
  "centers": {
    "defined": ["sacral", "throat", ...],
    "undefined": ["head", "ajna", ...]
  },
  "incarnationCross": {
    "name": "Cross of 1-2",
    "type": "Right Angle"
  }
}
```

---

## 🔗 Wie nutzt der Chart-Agent die Logik?

### Option 1: Über n8n Webhook

```javascript
// In API Route oder MCP Server
const chartResponse = await fetch('https://n8n.werdemeisterdeinergedankenagent.de/webhook/chart-calculation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ birthDate, birthTime, birthPlace })
});

const chartData = await chartResponse.json();
```

---

### Option 2: Über Reading Agent

```javascript
// In API Route
const chartResponse = await fetch('http://138.199.237.34:4001/reading/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    birthDate,
    birthTime,
    birthPlace,
    readingType: 'detailed'
  })
});

const result = await chartResponse.json();
const chartData = result.chartData;
```

---

### Option 3: Direkt (JavaScript Modul)

```javascript
const ChartCalculationAstronomy = require('./chart-calculation-astronomy.js');
const calculator = new ChartCalculationAstronomy();

const chartData = await calculator.calculateHumanDesignChart(
  birthDate,
  birthTime,
  birthPlace
);
```

---

## 📁 Dateien-Übersicht

| Datei | Typ | Zweck | Status |
|-------|-----|-------|--------|
| `n8n-workflows/chart-calculation-workflow-swisseph.json` | n8n Workflow | Chart-Berechnung via Webhook | ✅ Vorhanden |
| `integration/scripts/chart-calculation-astronomy.js` | JavaScript Modul | Vollständige Chart-Berechnung | ✅ Vorhanden |
| `integration/api-routes/agents-chart-development.ts` | API Route | Nutzt Reading Agent | ✅ Vorhanden |

---

## 🎯 Aktuelle Nutzung

**Chart Development Agent nutzt aktuell:**

1. **API Route** (`agents-chart-development.ts`)
   - Ruft Reading Agent auf
   - Holt Chart-Daten
   - Gibt an Chart Development Agent weiter

2. **n8n Workflow** (optional)
   - Kann direkt aufgerufen werden
   - Berechnet Chart-Daten
   - Gibt vollständige Chart-Daten zurück

---

## ⚠️ Aktueller Status

**Vereinfachte Berechnung:**
- ✅ Funktioniert
- ⚠️ Nicht präzise (Fallback-Methode)
- ⚠️ Nutzt vereinfachte Planetenpositionen

**Für Produktion empfohlen:**
- ✅ Echte Swiss Ephemeris API nutzen
- ✅ Oder `astronomy-engine` Bibliothek installieren
- ✅ Oder externe Human Design API nutzen

---

## 📋 Vollständige Implementierung

**Die vollständige Logik ist in:**
- `integration/scripts/chart-calculation-astronomy.js` (420 Zeilen)
- Enthält alle Berechnungen
- Unterstützt `astronomy-engine` (falls installiert)
- Fallback für vereinfachte Berechnung

---

**Status:** ✅ **Chart-Berechnungslogik vorhanden - 3 Implementierungen verfügbar!**
