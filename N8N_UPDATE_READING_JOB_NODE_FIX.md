# 🔧 "Update Reading Job" Node konfigurieren

**Problem:** Node zeigt rote Warnung bei "Table Name or ID" und fehlende Select Conditions / Fields

**Ursache:** Node wurde nicht vollständig konfiguriert nach dem Import

---

## ✅ Schritt-für-Schritt Konfiguration

### 1. Node öffnen

1. Öffne den Workflow **"Reading Generation Workflow"**
2. Klicke auf den **"Update Reading Job"** Node (Supabase Node)

---

### 2. Credential zuweisen

1. **"Credential to connect with":**
   - Wähle: **"Supabase account"** (oder dein erstelltes Supabase Credential)
   - Falls nicht vorhanden: Siehe `N8N_WORKFLOW_CREDENTIALS_FIX.md`

---

### 3. Resource & Operation prüfen

**Sollte bereits korrekt sein:**
- **Resource:** `Row`
- **Operation:** `Update`

**Falls nicht:**
- Wähle **Resource:** `Row`
- Wähle **Operation:** `Update`

---

### 4. Table Name konfigurieren

**WICHTIG - Das ist das rote Feld!**

1. **"Table Name or ID":**
   - Klicke auf das Dropdown
   - Tippe: `reading_jobs`
   - Oder wähle aus der Liste: `reading_jobs`
   - ✅ Rotes Warnsymbol sollte verschwinden

---

### 5. Select Conditions konfigurieren (WHERE-Klausel)

**Ziel:** Welche Zeile soll aktualisiert werden?

1. **"Select Type":**
   - Wähle: `Build Manually` (sollte bereits so sein)

2. **"Must Match":**
   - Wähle: `Any Select Condition` (sollte bereits so sein)

3. **"Select Conditions":**
   - Klicke **"Add Condition"**
   - **Column:** Wähle `id` (oder tippe `id`)
   - **Operator:** Wähle `Equal`
   - **Value:** `={{ $json.id || $json.readingId }}`
   - ✅ Bedingung sollte jetzt angezeigt werden

**Ergebnis:**
```
WHERE id = {{ $json.id || $json.readingId }}
```

---

### 6. Fields to Send konfigurieren (UPDATE-Felder)

**Ziel:** Welche Felder sollen aktualisiert werden?

1. **"Data to Send":**
   - Wähle: `Define Below for Each Column` (sollte bereits so sein)

2. **"Fields to Send":**
   - Klicke **"Add Field"**

   **Feld 1: status**
   - **Column:** `status`
   - **Value:** `completed`
   - Klicke **"Add Field"** (oder Enter)

   **Feld 2: result**
   - **Column:** `result`
   - **Value:** `={{ $json.resultJson || { reading: $json.reading_text, readingType: $json.reading_type, timestamp: $now.toISO() } }}`
   - Klicke **"Add Field"** (oder Enter)

   **Feld 3: updated_at**
   - **Column:** `updated_at`
   - **Value:** `={{ $now.toISO() }}`
   - Klicke **"Add Field"** (oder Enter)

**Ergebnis:**
```
UPDATE reading_jobs SET
  status = 'completed',
  result = {{ $json.resultJson }},
  updated_at = {{ $now.toISO() }}
WHERE id = {{ $json.readingId }}
```

---

### 7. Node speichern

1. Klicke **"Save"** (unten im Node-Panel)
2. ✅ Rote Warnung sollte verschwunden sein

---

## ✅ Prüfung

**Nach der Konfiguration sollte der Node zeigen:**

- ✅ **Credential:** "Supabase account" (oder dein Credential)
- ✅ **Resource:** Row
- ✅ **Operation:** Update
- ✅ **Table Name or ID:** `reading_jobs` (kein rotes Warnsymbol)
- ✅ **Select Conditions:** 1 Bedingung (`id = ...`)
- ✅ **Fields to Send:** 3 Felder (`status`, `result`, `updated_at`)
- ✅ **Keine roten Warnungen**

---

## 🔄 Wiederhole für "Update Job Failed" Node

**Der "Update Job Failed" Node benötigt ähnliche Konfiguration:**

1. **Table Name or ID:** `reading_jobs`
2. **Select Conditions:**
   - Column: `id`
   - Operator: `Equal`
   - Value: `={{ $json.readingId }}`
3. **Fields to Send:**
   - `status` = `failed`
   - `error` = `={{ $json.error || $json.message }}`
   - `updated_at` = `={{ $now.toISO() }}`

---

## 🔄 Wiederhole für "Save Reading" Node

**Der "Save Reading" Node benötigt:**

1. **Resource:** `Row`
2. **Operation:** `Insert`
3. **Table Name or ID:** `readings`
4. **Fields to Send:**
   - `id` = `={{ $json.readingId }}`
   - `user_id` = `={{ $json.readingsData.userId || null }}`
   - `reading_type` = `={{ $json.readingsData.readingType }}`
   - `birth_date` = `={{ $json.readingsData.birthDate }}`
   - `birth_time` = `={{ $json.readingsData.birthTime }}`
   - `birth_place` = `={{ $json.readingsData.birthPlace }}`
   - `reading_text` = `={{ $json.reading }}`
   - `chart_data` = `={{ $json.readingsData.chartData || null }}`
   - `metadata` = `={{ { name: $json.readingsData.name, focus: $json.readingsData.focus, tokens: $json.readingsData.tokens || 0, model: 'gpt-4', timestamp: $now.toISO() } }}`
   - `status` = `completed`

---

## 🎯 Nächste Schritte

Nach Konfiguration aller Supabase Nodes:

1. **Workflow speichern:** Klicke "Save" (oben rechts)
2. **Prüfe alle Nodes:** Keine roten Warnungen mehr
3. **Workflow aktivieren:** Toggle auf "Active"

---

## 🔍 Troubleshooting

### Problem: "Table Name or ID" zeigt keine Tabelle

**Lösung:**
1. Prüfe Supabase Credential ist korrekt
2. Prüfe Verbindung zu Supabase funktioniert
3. Tippe Tabellenname manuell: `reading_jobs`

### Problem: "Select Conditions" funktioniert nicht

**Lösung:**
1. Prüfe Spaltenname ist korrekt: `id` (nicht `readingId`)
2. Prüfe Expression-Syntax: `={{ $json.id || $json.readingId }}`
3. Prüfe Operator ist `Equal` (nicht `Contains`)

### Problem: "Fields to Send" funktioniert nicht

**Lösung:**
1. Prüfe Spaltennamen sind korrekt (snake_case: `reading_type`, nicht `readingType`)
2. Prüfe Expression-Syntax für `result` (JSON-Objekt)
3. Prüfe `updated_at` verwendet `$now.toISO()`

---

**Nach dieser Konfiguration sollte der Workflow aktivierbar sein!** ✅
