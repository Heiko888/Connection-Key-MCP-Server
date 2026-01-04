# C2 – Multi-Agent-Strategie

**Datum:** 2025-01-03  
**Status:** ✅ Implementiert

---

## 🎯 Ziel

Multi-Agent-System, das:
- ✅ eine Chart-Wahrheit (chart_id, chart_version, Chart-JSON) nutzt
- ✅ mehrere spezialisierte Reading-Agents orchestriert
- ✅ konsistente Outputs liefert, ohne Chart-Daten neu zu berechnen
- ✅ B1/B2-Struktur wiederverwendet
- ✅ B3 Regression Tests agent-spezifisch ausführbar macht

---

## 📦 Agent-Registry

**Datei:** `production/agents/registry.ts`

**Unterstützte Agents:**
- `business` - Fokus auf Entscheidungen, Energieeinsatz, Zusammenarbeit
- `relationship` - Fokus auf Nähe/Distanz, Bindung, Kommunikation
- `crisis` - Fokus auf Regulation, Stabilisierung, Orientierung
- `personality` - Fokus auf Selbstbild, Muster, Entwicklung

**Jeder Agent:**
- Basis-System-Prompt (B1/B2 Regeln)
- Kontext-spezifischer Fokus
- Unterstützte Depth-Levels
- Default-Style

---

## 🚀 Orchestrator

**Route:** `POST /api/coach/readings-v2/generate`

**Input:**
```json
{
  "chart_id": "uuid",
  "context": "business|relationship|crisis|personality",
  "depth": "basic|advanced|professional",
  "style": "klar|direkt|ruhig|empathisch",
  "locale": "de",
  "userId": "uuid"
}
```

**Flow:**
1. Validiere `context` → Agent auswählen
2. Lade Chart via `chart_id` aus `public_core.charts`
3. Baue Agent-Request (Chart-JSON + context/depth/style)
4. Rufe Reading-Agent auf
5. Persistiere Ergebnis mit Agent-Metadaten

**Output:**
```json
{
  "success": true,
  "readingId": "uuid",
  "reading": "...",
  "essence": "...",
  "chart_id": "uuid",
  "chart_version": "1.0.0",
  "context": "business",
  "depth": "advanced",
  "style": "klar",
  "agent_id": "business",
  "tokens": 1234,
  "duration": 2345,
  "timestamp": "2025-01-03T12:00:00Z"
}
```

---

## 💾 Persistenz

**Erweiterte Metadaten:**
- `agent_id` - Welcher Agent hat das Reading erzeugt
- `agent_version` - Agent-Version (für Reproduzierbarkeit)
- `prompt_hash` - Hash des System-Prompts (für Reproduzierbarkeit)
- `chart_id` - Foreign Key zu `public_core.charts`
- `chart_version` - Chart-Version

**Vollständige Reproduzierbarkeit:**
- Gleiches Chart + gleicher Agent + gleiche Parameter = identisches Reading

---

## 🧪 Tests

### B3 Multi-Agent Tests

**Datei:** `production/tests/b3-multi-agent-tests.ts`

**Tests:**
- TEST 1: Determinismus (pro Agent)
- TEST 4: Halluzinations-Probe (pro Agent)
- TEST E: Multi-Agent-Konsistenz

**Ausführung:**
```bash
cd production/tests
npm install
export ORCHESTRATOR_URL=http://localhost:3000/api/coach/readings-v2/generate
export CHART_TRUTH_API_URL=http://localhost:3000/api/chart/truth
npx ts-node b3-multi-agent-tests.ts
```

---

## 📋 Abnahmekriterien

- ✅ Ein `chart_id` kann Readings in 4 Kontexten erzeugen
- ✅ Kein Agent verändert Chart-Fakten
- ✅ Determinismus pro Kontext (Test 1)
- ✅ Halluzinationsprobe (Test 4) pro Kontext
- ✅ Readings sind persistent mit agent/meta Daten
- ✅ Router ist einziger Entry Point

---

## 🛑 Verbote (Eingehalten)

- ❌ Keine Chart-Berechnung außerhalb Chart-Truth-Service
- ❌ Keine „Fallback" Interpretation bei fehlenden Daten
- ❌ Keine Hardcodierung von Chart-Wissen in Orchestrator
- ❌ Keine Duplikation von Prompts ohne Registry

---

## 🔚 Ergebnis von C2

Nach C2 kannst du:

- ✅ Spezialisierte Reading-Agents orchestrieren
- ✅ Gleiche Chart-Wahrheit in verschiedenen Kontexten nutzen
- ✅ Konsistente Outputs ohne Halluzinationen
- ✅ Vollständige Reproduzierbarkeit

**Du entkoppelst Kontext von Wahrheit.**
