# Chart-Persistenz & Versionierung - Implementierung

## ✅ Umsetzung abgeschlossen

### 1. Supabase Schema: `public_core.charts`

**Migration:** `017_create_charts_table.sql`

**Tabelle:**
- `id` UUID (Primary Key)
- `chart_version` TEXT NOT NULL
- `input_hash` TEXT NOT NULL (SHA256 für Dedupe)
- `input` JSONB NOT NULL (Original Input)
- `chart` JSONB NOT NULL (core, centers, channels, gates - ohne calculated_at)
- `calculated_at` TIMESTAMPTZ NOT NULL
- `created_at` TIMESTAMPTZ NOT NULL

**Constraints:**
- Unique Index: `(input_hash, chart_version)` → Dedupe
- Index: `created_at DESC`
- Index: `chart_version`

**RLS:**
- Service Role: Alles
- Authenticated: Read
- Anon: Read

### 2. Readings Tabelle erweitert

**Migration:** `018_add_chart_references_to_readings.sql`

**Neue Spalten:**
- `chart_id` UUID (Foreign Key zu `public_core.charts.id`)
- `chart_version` TEXT
- `chart_input_hash` TEXT

**Foreign Key:**
- `chart_id → public_core.charts.id` (ON DELETE SET NULL)

**Indizes:**
- `chart_id` (WHERE chart_id IS NOT NULL)
- `chart_version` (WHERE chart_version IS NOT NULL)
- `chart_input_hash` (WHERE chart_input_hash IS NOT NULL)

**Backward Compatibility:**
- Bestehende Readings: `chart_id = NULL`
- `chart_data` JSONB bleibt erhalten (legacy)

### 3. API Route erweitert: `/api/chart/truth`

**Datei:** `integration/api-routes/app-router/chart/truth/route.ts`

**Änderungen:**
- Ruft `getChartTruth(input)` auf
- Persistiert Chart in `public_core.charts` (Upsert mit Dedupe)
- Gibt `chart_id` zurück

**Output-Format (neu):**
```json
{
  "chart_id": "uuid",
  "persisted": true,
  "chart_version": "1.0.0",
  "calculated_at": "...",
  "input_hash": "...",
  "input": {...},
  "core": {...},
  "centers": {...},
  "channels": [...],
  "gates": {...}
}
```

**Upsert-Logik:**
- Dedupe über `(input_hash, chart_version)`
- Gleicher Input + Version → gleiche `chart_id`
- Chart ist immutable (kein Update des chart-JSON)

### 4. n8n Reading-Workflow angepasst

**Datei:** `n8n-workflows/reading-generation-workflow.json`

**Änderungen:**

**"Combine Chart Data" Node:**
- Extrahiert `chart_id`, `chart_version`, `chart_input_hash` aus Chart-Truth-Response
- Chart-JSON nur für Reading Agent (runtime only)

**"Prepare Result" Node:**
- Verwendet `chart_id` statt `chartData` für Persistenz
- Chart-JSON bleibt für Reading Agent verfügbar

**"Save Reading" Node:**
- Speichert `chart_id`, `chart_version`, `chart_input_hash`
- `chart_data` wird auf `null` gesetzt (kein Chart-JSON mehr)

## 📊 Betroffene Tabellen/Felder

### `public_core.charts` (neu)
- Immutable Chart-Entities
- Dedupe über `(input_hash, chart_version)`

### `readings` (erweitert)
- `chart_id` UUID (Foreign Key)
- `chart_version` TEXT
- `chart_input_hash` TEXT
- `chart_data` JSONB (legacy, wird auf `null` gesetzt)

## 🧪 Abnahmekriterien

### Test A – Persistenz & Dedupe
- ✅ Zweimal POST `/api/chart/truth` mit gleichem Input
- ✅ Gleicher `input_hash`
- ✅ Gleiche `chart_version`
- ✅ Gleiche `chart_id` (dedupe)
- ✅ DB enthält genau 1 Datensatz für `(input_hash, chart_version)`

### Test B – Immutability
- ✅ Kein Update existierender Charts (nur insert/upsert)
- ✅ Neue Version (`chart_version 1.0.1`) erzeugt neue `chart_id` bei gleichem Input

### Test C – Reading referenziert chart_id
- ✅ Neues Reading speichert `chart_id` in Supabase
- ✅ Reading Agent bekommt Chart JSON weiterhin in Prompt/Input (runtime only)

## 🚫 Verbote (eingehalten)

- ✅ Keine Chart-Berechnung in n8n
- ✅ Keine Chart-Interpretation in API
- ✅ Kein Überschreiben von bestehenden Chart-Datensätzen
- ✅ Keine stillen Fallbacks
