# Chart-Versionierungsstrategie (C1)

**Datum:** 2025-01-03  
**Status:** ✅ Implementiert

---

## 🧱 Grundregel (Nicht verhandelbar)

**Ein Chart ist für immer gültig in der Version, in der es berechnet wurde.**

- Neue Engine = neue `chart_version`
- Nie überschreiben. Nie migrieren. Nie „korrigieren".

---

## 📦 Versionstabelle

| Version | Engine | Status | Beschreibung |
|---------|--------|--------|--------------|
| 1.0.0 | Astronomy-Engine / Fallback | stable | Aktuelle Implementierung |
| 1.1.0 | Swiss Ephemeris | experimental | Neue Berechnungsmethode (Stub) |
| 1.1.1 | Swiss Ephemeris | stable | Swiss Ephemeris (Bugfix) |

### Versionsregeln

- **MAJOR:** Breaking Changes (selten)
- **MINOR:** Neue Berechnungsmethode
- **PATCH:** Bugfix ohne Logikänderung

---

## 🔧 Engine-Routing

```typescript
switch (chart_version) {
  case "1.0.0":
    return calculateChartV1(input); // Astronomy-Engine
  case "1.1.0":
  case "1.1.1":
    return calculateChartSwiss(input); // Swiss Ephemeris
  default:
    throw new Error(`Unsupported chart_version: ${chart_version}`);
}
```

**Wichtig:**
- Jede Engine lebt isoliert
- Kein Shared State
- Kein Fallback auf andere Versionen

---

## 📡 API-Verhalten

### POST /api/chart/truth

**Input (erweitert):**
```json
{
  "birth_date": "1990-01-15",
  "birth_time": "14:30",
  "latitude": 52.52,
  "longitude": 13.405,
  "timezone": "Europe/Berlin",
  "chart_version": "1.1.0"  // Optional, Default: 1.0.0
}
```

**Output (erweitert):**
```json
{
  "chart_id": "uuid",
  "chart_version": "1.1.0",
  "engine": "swiss-ephemeris",
  "version_status": "experimental",
  "persisted": true,
  "calculated_at": "2025-01-03T12:00:00Z",
  "input_hash": "sha256...",
  "input": {...},
  "core": {...},
  "centers": {...},
  "channels": [...],
  "gates": {...}
}
```

**Regeln:**
- Kein Default-Upgrade
- Kein Silent Switch
- Explizite Version erforderlich für neue Engines

---

## 💾 Persistenz-Logik

**Dedupe:** `(input_hash, chart_version)`

- `input_hash` wird nur aus Geburtsdaten gebildet (ohne `chart_version`)
- Dedupe greift pro Version
- Gleiches Input + neue Version → neue `chart_id` (gewollt)

**Beispiel:**
- Input A + Version 1.0.0 → `chart_id_1`
- Input A + Version 1.1.0 → `chart_id_2` (unterschiedliche `chart_id`!)

---

## 📖 Reading-Strategie

**Regel:**
- Ein Reading referenziert immer exakt eine `chart_id`
- Agent bekommt: `chart_version` + Chart-JSON
- Agent macht keine Versionslogik

**Optional (später):**
- Vergleichs-Readings („Unterschiede zwischen 1.0.0 und 1.1.0")

---

## 🧪 Tests

### Test A – Versionsisolierung

**Setup:**
- Gleiches Input
- Version 1.0.0 → Chart A
- Version 1.1.0 → Chart B

**Erwartung:**
- Unterschiedliche `chart_id`
- Gleicher `input_hash`
- Unterschiede nur dort, wo Engine abweicht

### Test B – Legacy-Sicherheit

**Setup:**
- Alte Readings bleiben unverändert
- Neue Version erzeugt keine Änderungen an alten Daten

**Erwartung:**
- Bestehende Readings funktionieren weiter
- Neue Version erzeugt neue Charts, ändert keine alten

---

## 🚫 Verbote

- ❌ Keine automatische Migration alter Charts
- ❌ Kein Update bestehender Rows
- ❌ Kein Überschreiben von `chart_version`
- ❌ Kein „besseres Chart" Marketing

---

## 🔚 Ergebnis von C1

Nach C1 kannst du:

- ✅ neue Berechnungslogik einführen
- ✅ alte Readings unangetastet lassen
- ✅ Charts vergleichen
- ✅ Vertrauen behalten

**Du entkoppelst Wahrheit von Fortschritt.**
