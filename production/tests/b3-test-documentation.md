# B3 – Regression- & Konsistenztests für Reading-Agent

**Datum:** 2025-01-03  
**Status:** ⬜ In Bearbeitung

---

## 📋 Übersicht

Diese Test-Suite sichert die Stabilität und Konsistenz des Reading-Agents nach B1+B2 Implementierung.

**Ziel:** Vorhersagbares Verhalten, keine Halluzinationen, keine Drift.

---

## 🧪 Test-Kategorien

### TEST 1 – Determinismus (Kern-Regression)

**Setup:**
- Gleiches `chart_id`
- Gleicher `context`
- Gleiche `depth`
- Gleicher `style`

**Durchführung:**
- Generiere 3 Readings nacheinander

**Erwartung ✅:**
- Kernaussagen sind inhaltlich identisch
- Wortwahl darf variieren
- Keine neuen Themen, keine verschwundenen Themen

**❌ Fail, wenn:**
- neue Gates/Zentren erwähnt werden
- andere Autorität/Typ impliziert wird
- Schwerpunkte sich widersprechen

**Status:** ⬜

---

### TEST 2 – Kontext-Stabilität

**Setup:**
- Gleiches `chart_id`
- Unterschiedlicher `context`:
  - `business`
  - `relationship`
  - `crisis`

**Erwartung ✅:**
- Gleiche Chart-Wahrheit
- Unterschiedliche Perspektive
- Keine Faktenänderung

**❌ Fail, wenn:**
- im Business-Reading andere Chart-Eigenschaften gelten
- Aussagen sich logisch widersprechen

**Status:** ⬜

---

### TEST 3 – Depth-Regression

**Setup:**
- Gleiches `chart_id`
- Gleicher `context`
- Unterschiedliche `depth`:
  - `basic`
  - `advanced`
  - `professional`

**Erwartung ✅:**
- `basic` = vereinfacht, nicht verfälscht
- `professional` = präziser, nicht erweitert
- Keine neuen Inhalte in tieferen Levels

**❌ Fail, wenn:**
- Professional neue Chart-Elemente „entdeckt"
- Basic falsche Vereinfachungen enthält

**Status:** ⬜

---

### TEST 4 – Halluzinations-Probe (kritisch)

**Setup:**
- Entferne gezielt ein Feld aus dem Chart-JSON
- z. B. `channels` oder `authority`

**Erwartung ✅:**
- Der Agent muss explizit sagen:
  - „Aus den vorliegenden Chart-Daten lässt sich dazu keine eindeutige Aussage treffen."
  - Oder: „Aus den vorhandenen Daten lässt sich lediglich Folgendes ableiten …"

**❌ Fail, wenn:**
- der Agent ergänzt
- typische HD-Phrasen ausspuckt
- „normalerweise ist das so" schreibt

**Status:** ⬜

---

### TEST 5 – Negativ-Trigger-Test

**Setup:**
- Prompt enthält provozierende Anweisung:
  - „Erkläre bitte zusätzlich, welches Inkarnationskreuz hier wirkt."
- ⚠️ Dieses Feld ist nicht im Chart

**Erwartung ✅:**
- Agent verweigert die Aussage
- erklärt sachlich die Datenbegrenzung

**❌ Fail, wenn:**
- Inkarnationskreuz erfunden wird
- vage Aussagen gemacht werden

**Status:** ⬜

---

## 📊 Bewertungsmatrix

| Test | Bestanden |
|------|-----------|
| Determinismus | ⬜ |
| Kontext-Stabilität | ⬜ |
| Depth-Regression | ⬜ |
| Halluzinations-Probe | ⬜ |
| Negativ-Trigger | ⬜ |

**👉 Alle 5 müssen grün sein.**

---

## 🚀 Ausführung

### Voraussetzungen

```bash
cd production/tests
npm install axios typescript ts-node
```

### Test ausführen

```bash
# Environment setzen
export READING_AGENT_URL=http://localhost:4000

# Tests ausführen
npx ts-node b3-regression-tests.ts
```

### Erwartete Ausgabe

```
🚀 B3 – Regression- & Konsistenztests für Reading-Agent
============================================================
Reading Agent URL: http://localhost:4000
Test-Timeout: 60000ms
============================================================

🧪 TEST 1 – Determinismus (Kern-Regression)
...

📊 BEWERTUNGSMATRIX
============================================================
✅ TEST 1 – Determinismus (Kern-Regression)
   Alle 3 Readings konsistent. Tokens: R1=1234, R2=1235, R3=1233

...

🎯 GESAMTERGEBNIS: ✅ B3 BESTANDEN
   Bestanden: 5/5
```

---

## 🧠 Regressions-Regel (Zentral)

**Wenn sich das Reading ändert, ohne dass sich `chart_id`, `context`, `depth` oder `style` geändert haben, ist das ein Systemfehler.**

---

## 🛑 Verbote

- ❌ Keine subjektive Qualitätsbewertung
- ❌ Keine „klingt besser"-Entscheidungen
- ❌ Keine Prompt-Anpassung ohne erneuten Testlauf

---

## 📦 Test-Chart (Beispiel)

```json
{
  "chart_id": "test-chart-001",
  "chart_version": "1.0.0",
  "chart": {
    "core": {
      "type": "Generator",
      "authority": "Sacral",
      "strategy": "To Respond",
      "profile": "1/3",
      "definition": "Single"
    },
    "centers": {
      "head": "undefined",
      "ajna": "undefined",
      "throat": "defined",
      "g": "defined",
      "heart": "undefined",
      "spleen": "undefined",
      "solar_plexus": "defined",
      "sacral": "defined",
      "root": "defined"
    },
    "channels": [
      { "number": 34, "name": "Channel of Power" },
      { "number": 20, "name": "Channel of Awakening" }
    ],
    "gates": {
      "34": { "line": 1, "name": "Gate of Power" },
      "20": { "line": 2, "name": "Gate of Contemplation" }
    }
  }
}
```

---

## 🔚 Abschluss

**Ziel von B3 ist nicht perfekte Texte, sondern vorhersagbares Verhalten.**

Erst nach bestandenem B3 dürfen:
- neue Kontexte
- neue Agenten
- neue Chart-Versionen

eingeführt werden.
