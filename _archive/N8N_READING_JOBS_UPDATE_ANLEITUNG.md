# 📋 n8n: Reading Jobs Update - Schritt-für-Schritt Anleitung

**Datum:** 26.12.2025  
**Ziel:** `reading_jobs` Tabelle nach Reading-Generierung updaten

---

## 🎯 VORAUSSETZUNGEN

- Workflow hat ein Feld `reading_id` im JSON (vom Webhook oder vorherigen Nodes)
- OpenAI/Agent Node liefert `reading` + `summary` ODER nur `text`
- Postgres/Supabase Node ist konfiguriert (Host, DB, User, Password)

---

## 📝 SCHRITT 1: Set-Node nach HTTP Request/Agent-Node einfügen

### 1.1 Node hinzufügen

1. **Klicke auf deinen HTTP Request Node** (z.B. "Call Reading Agent" oder "Call Reading Agent (Compatibility)")
2. **Klicke auf das "+" Symbol** rechts neben dem Node (oder auf den grünen Output-Punkt)
3. **Suche nach "Set"** in der Node-Liste (tippe "Set" in die Suche)
4. **Klicke auf "Set"** Node (erscheint in der Liste)

### 1.2 Node konfigurieren

1. **Klicke auf den neuen Set-Node** (wird "Set" heißen)
2. **Benenne ihn um:** Doppelklick auf "Set" → Tippe: `Prepare Result JSON`
3. **Klicke auf "Add Value"** (oder "Values to Set")

### 1.3 Feld `result_json` erstellen

**Option A: Wenn OpenAI/Agent `reading` + `summary` liefert:**

1. **Name:** `result_json`
2. **Type:** Toggle auf **"Expression"** (nicht "String"!)
3. **Value:** Kopiere diese Expression:

```javascript
={{ {
  "reading": $json.reading || $json.text || "",
  "summary": $json.summary || $json.reading || "",
  "readingId": $json.readingId || $json.id || "",
  "tokens": $json.tokens || 0,
  "model": $json.model || "gpt-4",
  "timestamp": $json.timestamp || $now.toISO()
} }}
```

**Option B: Wenn Response nur `text` enthält:**

1. **Name:** `result_json`
2. **Type:** Klicke auf **"Expression"** Toggle
3. **Value:** Kopiere diese Expression:

```javascript
={{ {
  "reading": $json.text || $json.reading || "",
  "readingId": $json.readingId || $json.id || "",
  "tokens": $json.tokens || 0,
  "model": $json.model || "gpt-4",
  "timestamp": $json.timestamp || $now.toISO()
} }}
```

**Option C: Wenn Response `data.reading` enthält (MCP Gateway Response):**

1. **Name:** `result_json`
2. **Type:** Klicke auf **"Expression"** Toggle
3. **Value:** Kopiere diese Expression:

```javascript
={{ {
  "reading": $json.data?.reading || $json.reading || $json.text || "",
  "readingId": $json.data?.readingId || $json.readingId || $json.id || "",
  "chartData": $json.data?.chartData || $json.chartData || {},
  "tokens": $json.data?.tokens || $json.tokens || 0,
  "model": $json.model || "gpt-4",
  "timestamp": $json.timestamp || $now.toISO()
} }}
```

**Wichtig:** 
- **Prüfe zuerst:** Klicke auf HTTP Request Node → "Execute Node" → Prüfe Output
- Wenn `$json.data.reading` vorhanden → Option C (MCP Gateway)
- Wenn `$json.reading` vorhanden → Option A
- Wenn nur `$json.text` vorhanden → Option B

### 1.4 Node speichern

1. **Klicke auf "Execute Node"** (Test)
2. **Prüfe Output:** Du solltest `result_json` als JSON-Objekt sehen
3. **Klicke auf "Save"** (oben rechts)

---

## 📝 SCHRITT 2: Postgres/Supabase-Node für Success-Update einfügen

### 2.1 Node hinzufügen

1. **Klicke auf "Prepare Result JSON" Node**
2. **Klicke auf das "+" Symbol** rechts
3. **Suche nach "Postgres"** ODER **"Supabase"**
4. **Klicke auf den Node** (je nachdem, was du verwendest)

### 2.2 Node konfigurieren (Postgres)

**Wenn du Postgres Node verwendest:**

1. **Benenne Node:** Doppelklick auf "Postgres" → Tippe: `Update Reading Job (Success)`
2. **Operation:** Dropdown → Wähle **"Execute Query"** (nicht "Update"!)
3. **Query:** Klicke ins Query-Feld → Kopiere diesen SQL:

```sql
UPDATE reading_jobs
SET 
  status = 'done',
  result = $1::jsonb,
  updated_at = NOW()
WHERE reading_id = $2::uuid
RETURNING id, reading_id, status, updated_at;
```

4. **Query Parameters hinzufügen:**
   - **Klicke auf "Add Parameter"** (falls vorhanden)
   - **Parameter 1:**
     - **Type:** Expression
     - **Value:** `={{ JSON.stringify($json.result_json) }}`
   - **Parameter 2:**
     - **Type:** Expression
     - **Value:** `={{ $json.reading_id || $json.body.reading_id || $json.readingId || $json.body.readingId }}`

**Wichtig:** 
- **Prüfe zuerst:** Klicke auf Webhook-Node → "Execute Node" → Suche nach `reading_id` oder `readingId`
- Wenn `reading_id` im Webhook-Body liegt → `$json.body.reading_id`
- Wenn `reading_id` vom vorherigen Node kommt → `$json.reading_id`
- Wenn `readingId` (camelCase) → `$json.readingId` oder `$json.body.readingId`
- **JSON.stringify** ist nötig, damit Postgres den JSONB-Cast akzeptiert
- **Test:** Klicke auf "Execute Node" → Prüfe, ob Parameter korrekt gesetzt sind

### 2.3 Node konfigurieren (Supabase)

**Wenn du Supabase Node verwendest:**

1. **Benenne Node:** Doppelklick auf "Supabase" → Tippe: `Update Reading Job (Success)`
2. **Operation:** Dropdown → Wähle **"Update"**
3. **Table:** Dropdown → Wähle `reading_jobs` (oder tippe ein)
4. **Update Key:** Dropdown → Wähle `reading_id`
5. **Update Key Value:** 
   - **Type:** Toggle auf **"Expression"**
   - **Value:** `={{ $json.reading_id || $json.body.reading_id || $json.readingId || $json.body.readingId }}`
6. **Columns to Update:**
   - **Klicke auf "Add Column"** (oder "+" Symbol)
   - **Column 1:**
     - **Name:** `status`
     - **Type:** Toggle auf **"String"** (nicht Expression!)
     - **Value:** `done`
   - **Column 2:**
     - **Klicke auf "Add Column"**
     - **Name:** `result`
     - **Type:** Toggle auf **"Expression"** (wichtig!)
     - **Value:** `={{ $json.result_json }}`
   - **Column 3:**
     - **Klicke auf "Add Column"**
     - **Name:** `updated_at`
     - **Type:** Toggle auf **"Expression"**
     - **Value:** `={{ $now.toISO() }}`

**Wichtig:** 
- `result` **MUSS** als Expression sein (nicht String!), sonst wird es als Text gespeichert
- `updated_at` kann auch `NOW()` sein, wenn Supabase das unterstützt (testen!)

### 2.4 Node speichern

1. **Klicke auf "Execute Node"** (Test)
2. **Prüfe Output:** Du solltest die aktualisierte Zeile sehen
3. **Klicke auf "Save"**

---

## 📝 SCHRITT 3: Error-Pfad (Failure) einbauen

### 3.1 Error-Output prüfen

1. **Klicke auf deinen HTTP Request Node** (z.B. "Call Reading Agent")
2. **Prüfe:** Hat der Node einen **"Error"** Output? (roter Punkt unten am Node)
3. **HTTP Request Nodes haben standardmäßig Error-Output** → Verwende Schritt 3.2

### 3.2 Error-Node hinzufügen (wenn Error-Output vorhanden)

1. **Klicke auf den roten "Error" Output** des OpenAI/Agent-Nodes
2. **Suche nach "Set"** Node
3. **Klicke auf "Set"** Node

**Konfiguration:**
1. **Benenne:** `Prepare Error Data`
2. **Add Value:**
   - **Name:** `error_message`
   - **Type:** Expression
   - **Value:** `={{ $json.error?.message || $json.message || "Unknown error" }}`

### 3.3 Error-Update-Node hinzufügen

1. **Klicke auf "Prepare Error Data"** (oder direkt auf Error-Output, wenn kein Set-Node)
2. **Klicke auf "+"**
3. **Suche nach "Postgres"** oder **"Supabase"**
4. **Klicke auf den Node**

**Konfiguration (Postgres):**

1. **Benenne:** Doppelklick → Tippe: `Update Reading Job (Error)`
2. **Operation:** Dropdown → Wähle `Execute Query`
3. **Query:** Klicke ins Query-Feld → Kopiere:

```sql
UPDATE reading_jobs
SET 
  status = 'error',
  error = $1::text,
  updated_at = NOW()
WHERE reading_id = $2::uuid
RETURNING id, reading_id, status, error, updated_at;
```

4. **Query Parameters:**
   - **Parameter 1:**
     - **Type:** Expression
     - **Value:** `={{ $json.error_message || $json.error?.message || $json.message || $json.error || "Unknown error" }}`
   - **Parameter 2:**
     - **Type:** Expression
     - **Value:** `={{ $json.reading_id || $json.body.reading_id || $json.readingId || $json.body.readingId }}`

**Konfiguration (Supabase):**

1. **Benenne:** `Update Reading Job (Error)`
2. **Operation:** `Update`
3. **Table:** `reading_jobs`
4. **Update Key:** `reading_id`
5. **Update Key Value:** `={{ $json.reading_id || $json.body.reading_id || $json.readingId }}`
6. **Columns to Update:**
   - **Name:** `status` → **Value:** `error`
   - **Name:** `error` → **Type:** Expression → **Value:** `={{ $json.error_message || $json.error?.message || $json.message || "Unknown error" }}`
   - **Name:** `updated_at` → **Type:** Expression → **Value:** `={{ $now.toISO() }}`

### 3.4 Alternative: IF-Node für Error-Handling (wenn kein Error-Output)

**Wenn der HTTP Request Node keinen Error-Output hat:**

1. **Klicke auf deinen HTTP Request Node** (z.B. "Call Reading Agent")
2. **Klicke auf "+"** Symbol
3. **Suche nach "IF"** Node
4. **Klicke auf "IF"** Node

**Konfiguration:**
1. **Benenne:** `Check for Error`
2. **Condition 1:**
   - **Left Value:** `={{ $json.error || $json.success === false || $json.statusCode >= 400 }}`
   - **Operator:** `exists` (oder `is true`)
3. **True-Pfad:** Verbinde mit "Update Reading Job (Error)" Node
4. **False-Pfad:** Verbinde mit "Prepare Result JSON" Node (Success-Pfad)

**ODER einfacher (HTTP Status Code prüfen):**

1. **IF-Node Condition:**
   - **Left Value:** `={{ $json.statusCode }}`
   - **Operator:** `>=`
   - **Right Value:** `400`
2. **True (Error):** → "Update Reading Job (Error)"
3. **False (Success):** → "Prepare Result JSON"

---

## 📝 SCHRITT 4: Connections prüfen

### 4.1 Success-Pfad

1. **Prüfe:** "Prepare Result JSON" → "Update Reading Job (Success)"
2. **Falls nicht verbunden:** Ziehe Verbindungslinie von Output zu Input

### 4.2 Error-Pfad

1. **Prüfe:** HTTP Request Node (roter Error-Output) → "Prepare Error Data" → "Update Reading Job (Error)"
2. **Falls nicht verbunden:** 
   - Ziehe Verbindungslinie vom roten Error-Output zu "Prepare Error Data"
   - Ziehe Verbindungslinie von "Prepare Error Data" zu "Update Reading Job (Error)"

---

## 🧪 SCHRITT 5: Testen

### 5.1 Workflow testen

1. **Klicke auf "Execute Workflow"** (oben rechts)
2. **Prüfe:** Alle Nodes sollten grün werden
3. **Falls Fehler:** Prüfe Node-Outputs (klicke auf Node → "Output")

### 5.2 Supabase prüfen

**SQL Query in Supabase SQL Editor:**

```sql
SELECT 
  id,
  reading_id,
  status,
  result,
  error,
  updated_at,
  created_at
FROM reading_jobs
ORDER BY updated_at DESC
LIMIT 5;
```

**Erwartete Ausgabe:**
- `status` sollte `'done'` oder `'error'` sein (nicht mehr `'pending'`)
- `result` sollte JSON-Objekt enthalten (bei Success)
- `error` sollte Text enthalten (bei Error)
- `updated_at` sollte aktueller Timestamp sein

### 5.3 n8n Execution prüfen

1. **Klicke auf "Executions"** (oben in n8n, neben "Workflows")
2. **Klicke auf die letzte Execution** (neueste oben)
3. **Prüfe Node-Outputs:**
   - **Klicke auf "Prepare Result JSON" Node:**
     - **Output sollte zeigen:** `{ "result_json": { "reading": "...", "readingId": "...", ... } }`
   - **Klicke auf "Update Reading Job (Success)" Node:**
     - **Output sollte zeigen:** `{ "id": "...", "reading_id": "...", "status": "done", "result": {...}, "updated_at": "2025-12-26T..." }`
   - **Klicke auf "Update Reading Job (Error)" Node:**
     - **Sollte nur bei Fehlern ausgeführt werden** (roter Status)
     - **Output:** `{ "id": "...", "reading_id": "...", "status": "error", "error": "Fehlermeldung", "updated_at": "2025-12-26T..." }`

**Was du sehen solltest:**
- **Success-Pfad:** Alle Nodes grün, "Update Reading Job (Success)" zeigt RETURNING-Result
- **Error-Pfad:** HTTP Request Node rot, "Update Reading Job (Error)" zeigt RETURNING-Result

**Wenn Node fehlschlägt:**
- **Klicke auf den fehlgeschlagenen Node** (roter Status)
- **Prüfe "Error" Tab:** Zeigt Fehlermeldung (z.B. "column does not exist", "invalid jsonb")
- **Korrigiere:** Siehe "Wichtige Hinweise" unten

---

## ⚠️ WICHTIGE HINWEISE

### reading_id finden

**Prüfe, wo `reading_id` herkommt:**

1. **Klicke auf deinen Webhook-Node**
2. **Klicke auf "Execute Node"**
3. **Prüfe Output:** Suche nach `reading_id` oder `readingId`

**Mögliche Pfade:**
- `$json.body.reading_id` (vom Webhook-Body)
- `$json.reading_id` (vom vorherigen Node)
- `$json.readingId` (camelCase)

**Wenn unklar:**
- Füge einen **"Set"** Node direkt nach Webhook hinzu
- Erstelle Feld: `reading_id` = `={{ $json.body.reading_id || $json.reading_id || $json.readingId }}`
- Verwende dann `$json.reading_id` in allen nachfolgenden Nodes

### JSONB in Postgres

**Wichtig:** 
- Postgres erwartet JSON-String für `::jsonb` Cast
- n8n Expressions geben bereits JSON-Objekte zurück
- **Lösung:** Verwende `JSON.stringify($json.result_json)` in Query Parameter

**Falls Fehler "invalid input syntax for type jsonb":**
- **Ändere Query Parameter 1 zu:** `={{ JSON.stringify($json.result_json) }}`
- **ODER ändere Query zu:** `result = $1::text::jsonb` (zuerst zu Text, dann zu jsonb)

**Test:**
1. **Klicke auf "Update Reading Job (Success)" Node**
2. **Klicke auf "Execute Node"**
3. **Prüfe Output:** Sollte keine Fehlermeldung zeigen
4. **Falls Fehler:** Ändere Parameter 1 zu `JSON.stringify(...)`

### Supabase Node vs. Postgres Node

**Supabase Node:**
- Einfacher (kein SQL)
- Automatische JSONB-Konvertierung
- **Empfohlen** wenn verfügbar

**Postgres Node:**
- Mehr Kontrolle (SQL)
- Manuelles JSONB-Casting nötig
- **Verwende** wenn Supabase Node nicht verfügbar

---

## ✅ CHECKLISTE

### Vor Test:
- [ ] Set-Node erstellt (`result_json` Feld)
- [ ] Success-Update-Node erstellt (Postgres oder Supabase)
- [ ] Error-Update-Node erstellt (Postgres oder Supabase)
- [ ] `reading_id` Expression korrekt (getestet mit "Execute Node")
- [ ] Connections korrekt (Success-Pfad + Error-Pfad)

### Nach Test:
- [ ] Workflow läuft ohne Fehler (alle Nodes grün)
- [ ] Supabase Query zeigt `status='done'` oder `status='error'` (nicht mehr `'pending'`)
- [ ] `result` Feld enthält JSON-Objekt (bei Success), z.B. `{"reading": "...", "tokens": 1234}`
- [ ] `error` Feld enthält Text (bei Error), z.B. `"HTTP 500: Internal server error"`
- [ ] `updated_at` ist aktuell (Timestamp von heute)

### Troubleshooting:
- [ ] Falls `status` noch `'pending'`: Prüfe `reading_id` Expression
- [ ] Falls "invalid jsonb": Verwende `JSON.stringify($json.result_json)`
- [ ] Falls "column does not exist": Prüfe Tabellennamen (`reading_jobs` vs. `readings`)
- [ ] Falls Node nicht ausgeführt: Prüfe Connections (Verbindungslinien)

---

## 📋 ZUSÄTZLICHE CHECKS

### Check A: SQL SELECT in Supabase

**Führe diese Query aus:**

```sql
SELECT 
  id,
  reading_id,
  status,
  result,
  error,
  updated_at,
  created_at,
  EXTRACT(EPOCH FROM (updated_at - created_at)) as duration_seconds
FROM reading_jobs
WHERE status IN ('done', 'error')
ORDER BY updated_at DESC
LIMIT 10;
```

**Erwartete Ausgabe:**
- Zeilen mit `status='done'` oder `status='error'`
- `result` ist JSON-Objekt (bei `done`)
- `error` ist Text (bei `error`)
- `duration_seconds` zeigt, wie lange der Job gedauert hat

### Check B: n8n Execution-Ausgabe

**Was du in n8n Execution sehen musst:**

1. **Öffne Execution** (Klicke auf neueste Execution)
2. **Klicke auf "Update Reading Job (Success)" Node**
3. **Output Tab:**
   - **Sollte zeigen:** `[{ "id": "...", "reading_id": "...", "status": "done", "result": {...}, "updated_at": "..." }]`
   - **Falls leer:** Node wurde nicht ausgeführt → Prüfe Connections
4. **Klicke auf "Update Reading Job (Error)" Node**
   - **Sollte nur bei Fehlern ausgeführt werden** (roter Status)
   - **Output:** `[{ "id": "...", "reading_id": "...", "status": "error", "error": "...", "updated_at": "..." }]`

**Wenn Node fehlschlägt:**
- **Klicke auf "Error" Tab** im Node
- **Fehlermeldung zeigt:** z.B. "column reading_jobs.reading_id does not exist"
- **Lösung:** Prüfe Tabellenschema in Supabase

---

**Status:** ✅ **Anleitung abgeschlossen - Bereit für n8n UI**
