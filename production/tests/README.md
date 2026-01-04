# B3 – Regression- & Konsistenztests für Reading-Agent

## 🎯 Ziel

Sicherstellen, dass der Reading-Agent:
- ✅ konsistent auf identische Chart-Wahrheit reagiert
- ✅ nicht halluziniert
- ✅ nicht driftet bei Wiederholungen
- ✅ kontextsensitiv, aber faktenstabil bleibt

---

## 🚀 Schnellstart

### 1. Dependencies installieren

```bash
cd production/tests
npm install
```

### 2. Environment setzen

```bash
export READING_AGENT_URL=http://localhost:4000
# Oder auf Server:
export READING_AGENT_URL=http://138.199.237.34:4000
```

### 3. Tests ausführen

```bash
npm test
```

---

## 📋 Test-Übersicht

| Test | Beschreibung | Status |
|------|--------------|--------|
| **TEST 1** | Determinismus (3x gleiche Inputs) | ⬜ |
| **TEST 2** | Kontext-Stabilität (business/relationship/crisis) | ⬜ |
| **TEST 3** | Depth-Regression (basic/advanced/professional) | ⬜ |
| **TEST 4** | Halluzinations-Probe (fehlende channels) | ⬜ |
| **TEST 5** | Negativ-Trigger (Inkarnationskreuz nicht vorhanden) | ⬜ |

**Alle 5 Tests müssen bestanden werden!**

---

## 🧪 Manuelle Tests

### Test 1: Determinismus

```bash
# 3x gleiches Reading generieren
curl -X POST http://localhost:4000/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "chart_id": "test-001",
    "chart_version": "1.0.0",
    "chart": {
      "core": {"type": "Generator", "authority": "Sacral"},
      "centers": {"sacral": "defined"},
      "channels": [],
      "gates": {}
    },
    "context": "personality",
    "depth": "advanced",
    "style": "ruhig"
  }'
```

**Erwartung:** Alle 3 Readings sollten ähnliche Kernaussagen haben.

---

### Test 4: Halluzinations-Probe

```bash
# Chart OHNE channels
curl -X POST http://localhost:4000/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "chart_id": "test-002",
    "chart_version": "1.0.0",
    "chart": {
      "core": {"type": "Generator", "authority": "Sacral"},
      "centers": {"sacral": "defined"},
      "channels": [],
      "gates": {}
    },
    "context": "personality",
    "depth": "advanced",
    "style": "ruhig"
  }'
```

**Erwartung:** Agent muss explizit sagen, dass channels fehlen.

---

## 📊 Erwartete Ausgabe

```
🚀 B3 – Regression- & Konsistenztests für Reading-Agent
============================================================
Reading Agent URL: http://localhost:4000
Test-Timeout: 60000ms
============================================================

🧪 TEST 1 – Determinismus (Kern-Regression)
Setup: Gleiches chart_id, context, depth, style
✅ TEST 1 – Determinismus (Kern-Regression)
   Alle 3 Readings konsistent. Tokens: R1=1234, R2=1235, R3=1233

🧪 TEST 2 – Kontext-Stabilität
...

📊 BEWERTUNGSMATRIX
============================================================
✅ TEST 1 – Determinismus (Kern-Regression)
   Alle 3 Readings konsistent. Tokens: R1=1234, R2=1235, R3=1233

✅ TEST 2 – Kontext-Stabilität
   Gleiche Chart-Wahrheit, unterschiedliche Perspektive bestätigt

✅ TEST 3 – Depth-Regression
   Gleiche Inhalte, unterschiedliche Tiefe bestätigt

✅ TEST 4 – Halluzinations-Probe (kritisch)
   Agent benennt fehlende Daten explizit, keine Halluzination

✅ TEST 5 – Negativ-Trigger-Test
   Agent verweigert Erfindung, erklärt Datenbegrenzung

============================================================

🎯 GESAMTERGEBNIS: ✅ B3 BESTANDEN
   Bestanden: 5/5
```

---

## 🛑 Wichtige Regeln

### Regressions-Regel (Zentral)

**Wenn sich das Reading ändert, ohne dass sich `chart_id`, `context`, `depth` oder `style` geändert haben, ist das ein Systemfehler.**

### Verbote

- ❌ Keine subjektive Qualitätsbewertung
- ❌ Keine „klingt besser"-Entscheidungen
- ❌ Keine Prompt-Anpassung ohne erneuten Testlauf

---

## 🔧 Troubleshooting

### Test schlägt fehl: "API-Fehler"

```bash
# Prüfe ob Reading Agent läuft
curl http://localhost:4000/health

# Prüfe Environment
echo $READING_AGENT_URL
```

### Test schlägt fehl: "Timeout"

```bash
# Erhöhe Timeout in b3-regression-tests.ts
const TEST_TIMEOUT = 120000; // 120 Sekunden
```

### Test schlägt fehl: "Halluzination erkannt"

- Prüfe System-Prompt im Reading Agent
- Stelle sicher, dass B1+B2 Regeln korrekt implementiert sind
- Prüfe ob Knowledge-Dateien korrekt geladen werden

---

## 📝 Test-Ergebnisse dokumentieren

Nach jedem Testlauf:

1. Status in `b3-test-documentation.md` aktualisieren
2. Bei Fehlern: Logs speichern
3. Bei Pass: Commit mit Test-Ergebnissen

---

## 🔚 Nächste Schritte

Nach bestandenem B3:

- ✅ Neue Kontexte einführen
- ✅ Neue Agenten entwickeln
- ✅ Neue Chart-Versionen testen

**B3 ist die Voraussetzung für alle weiteren Entwicklungen!**
