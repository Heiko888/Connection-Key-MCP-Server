# 🔍 Reading-Job "pending" Root Cause Analyse

**Datum:** 26.12.2025  
**Problem:** Reading-Jobs bleiben im Status "pending", Frontend zeigt kein Ergebnis

---

## 🎯 EXECUTIVE SUMMARY

**Root Cause:** Es gibt **KEINE** `reading_jobs` Tabelle im System. Das System verwendet die `readings` Tabelle. Der Status bleibt "pending", weil:

1. **Frontend API Route** erstellt Eintrag in `readings` mit `status='pending'`
2. **n8n Workflow** wird **NICHT** mehr aufgerufen (neuer Flow über MCP Gateway)
3. **ODER** n8n erstellt einen **NEUEN** Eintrag statt den bestehenden zu updaten
4. **ODER** n8n updated den Status **NICHT** explizit

**Konkrete Stelle:** `n8n-workflows/reading-generation-workflow.json` - Node "Save to Supabase" macht INSERT statt UPDATE

---

## 📋 SCHRITT-FÜR-SCHRITT ANALYSE

### ✅ SCHRITT 1: Wird nach Job-Start ein Eintrag korrekt angelegt?

**Datei:** `integration/api-routes/app-router/reading/generate/route.ts`

**Code (Zeilen 53-72):**
```typescript
const { data: pendingReading, error: createError } = await supabase
  .from('readings')  // ← NICHT reading_jobs!
  .insert([{
    user_id: data?.userId || null,
    reading_type: readingType,
    birth_date: data?.birthDate,
    birth_time: data?.birthTime,
    birth_place: data?.birthPlace,
    reading_text: '', // Wird später gefüllt
    status: 'pending' // Start-Status ✅
  }])
  .select()
  .single();
```

**Ergebnis:** ✅ **JA**
- Eintrag wird in `readings` Tabelle erstellt (nicht `reading_jobs`)
- `status = 'pending'` wird korrekt gesetzt
- `reading_id` = `pendingReading.id` (UUID von Supabase)

**⚠️ WICHTIG:** Es gibt **KEINE** `reading_jobs` Tabelle im Schema!

---

### ✅ SCHRITT 2: Wird der n8n Workflow vollständig durchlaufen?

**Datei:** `n8n-workflows/reading-generation-workflow.json`

**Problem 1: Workflow wird NICHT mehr aufgerufen!**

**Frontend API Route (Zeilen 107-125):**
```typescript
const mcpResponse = await fetch(`${MCP_SERVER_URL}/agents/run`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${MCP_API_KEY}`
  },
  body: JSON.stringify({
    domain: 'reading',
    task: 'generate',
    payload: { ... }
  })
});
```

**Ergebnis:** ❌ **NEIN**
- Frontend ruft **MCP Gateway** auf (Port 7000)
- MCP Gateway ruft **MCP Core** auf (stdio)
- MCP Core ruft **n8n Webhook** auf (`/webhook/reading`)
- **ABER:** Der n8n Workflow `reading-generation-workflow.json` hat Webhook-Pfad `/reading`
- **Problem:** Workflow wird möglicherweise nicht getriggert oder verwendet alten Port 4001

**Problem 2: Webhook-Pfad stimmt nicht überein**

**MCP Core (`index.js`, Zeile 452-460):**
```javascript
const webhookPath = config.n8n.webhooks.reading;  // = "/webhook/reading"
const url = `${config.n8n.baseUrl}${webhookPath}`; // = "http://n8n:5678/webhook/reading"

const response = await fetch(url, {
  method: "POST",
  body: JSON.stringify(chartData)  // ← Keine reading_id!
});
```

**n8n Workflow (`reading-generation-workflow.json`, Zeile 14):**
```json
"path": "reading"  // ← Pfad ist "/reading", nicht "/webhook/reading"!
```

**Ergebnis:** ❌ **WEBHOOK-PFAD STIMMT NICHT ÜBEREIN**
- MCP Core ruft: `/webhook/reading`
- n8n Workflow erwartet: `/reading`
- **Workflow wird möglicherweise nicht getriggert!**

**Problem 3: reading_id wird nicht übergeben**

**MCP Core sendet (Zeilen 442-460):**
```javascript
const chartData = {
  birthDate,
  birthTime,
  birthPlace,
  userId: userId || 'anonymous',
  readingType: readingType || 'detailed',
  timestamp: new Date().toISOString()
  // ← KEINE reading_id!
};
```

**Ergebnis:** ❌ **reading_id FEHLT**
- Frontend erstellt Eintrag mit UUID `abc-123`
- MCP Core sendet diese ID **NICHT** an n8n
- n8n kann nicht wissen, welcher Eintrag updated werden soll

---

### ❌ SCHRITT 3: Wird im n8n Workflow explizit ein Update auf `reading_jobs.status = completed` ausgeführt?

**Datei:** `n8n-workflows/reading-generation-workflow.json`

**Node "Save to Supabase" (Zeilen 139-175):**
```json
{
  "parameters": {
    "operation": "insert",  // ← INSERT, nicht UPDATE!
    "table": "readings",    // ← readings, nicht reading_jobs!
    "columns": {
      "value": {
        "id": "={{ $json.readingId }}",  // ← Erstellt NEUEN Eintrag!
        "status": "completed"            // ← Neuer Eintrag mit completed
      }
    }
  }
}
```

**Ergebnis:** ❌ **NEIN - DAS IST DIE ROOT CAUSE!**

**Probleme:**
1. **Operation ist `insert`** → Erstellt **NEUEN** Eintrag statt bestehenden zu updaten
2. **Tabelle ist `readings`** → Nicht `reading_jobs` (existiert nicht)
3. **Kein WHERE-Clause** → Kann nicht bestehenden Eintrag finden
4. **`id` wird überschrieben** → Wenn `$json.readingId` vorhanden, wird neuer Eintrag mit dieser ID erstellt
5. **Kein explizites Status-Update** → Der ursprüngliche Eintrag bleibt bei `status='pending'`

**Was passiert:**
- Frontend erstellt Eintrag: `readings.id = 'abc-123'`, `status = 'pending'`
- n8n erstellt NEUEN Eintrag: `readings.id = 'abc-123'` (gleiche ID!), `status = 'completed'`
- **ODER** n8n erstellt Eintrag mit anderer ID: `readings.id = 'xyz-789'`, `status = 'completed'`
- Der ursprüngliche Eintrag bleibt bei `status='pending'` → Frontend sieht "pending"

---

### ❌ SCHRITT 4: Wird das Reading-Ergebnis in der Tabelle `readings` gespeichert?

**Datei:** `n8n-workflows/reading-generation-workflow.json`

**Node "Save to Supabase" (Zeilen 155-159):**
```json
"reading_text": "={{ $json.reading || $json.reading.text }}",
"reading_sections": "={{ $json.reading.sections || null }}",
"chart_data": "={{ $json.chartData || null }}",
"metadata": "={{ { tokens: $json.tokens || 0, model: $json.model || 'gpt-4', timestamp: $json.timestamp || $now } }}",
"status": "completed"
```

**Ergebnis:** ⚠️ **TEILWEISE**
- Reading-Text wird gespeichert
- **ABER:** In einem **NEUEN** Eintrag (INSERT)
- Der ursprüngliche Eintrag (mit `status='pending'`) wird **NICHT** updated

**Problem:** `reading_id` Match funktioniert nicht, weil:
- Frontend erstellt Eintrag mit UUID `abc-123`
- n8n bekommt möglicherweise andere ID oder erstellt neuen Eintrag
- Keine Verbindung zwischen beiden Einträgen

---

### ✅ SCHRITT 5: Stimmen die API-Endpunkte für das Polling?

**Datei:** `integration/api-routes/app-router/readings/[id]/status/route.ts`

**Code (Zeilen 39-43):**
```typescript
let query = supabase
  .from('readings')  // ← Liest aus readings, nicht reading_jobs
  .select('id, status, created_at, updated_at')
  .eq('id', readingId)
  .single();
```

**Ergebnis:** ✅ **JA**
- Status-Endpoint liest aus `readings` Tabelle (korrekt)
- Result-Endpoint würde auch aus `readings` lesen (nicht `reading_jobs`)

**⚠️ WICHTIG:** Es gibt **KEINE** `reading_jobs` Tabelle. Das System verwendet nur `readings`.

---

### ❌ SCHRITT 6: Gibt es einen Zustand, in dem n8n erfolgreich ist, aber kein Status-Update erfolgt?

**Ergebnis:** ✅ **JA - DAS IST DER AKTUELLE ZUSTAND!**

**Szenario A: n8n erstellt neuen Eintrag (gleiche ID)**
1. Frontend erstellt: `readings.id = 'abc-123'`, `status = 'pending'`
2. n8n macht INSERT: `readings.id = 'abc-123'`, `status = 'completed'`
3. **Problem:** Supabase erlaubt möglicherweise kein INSERT mit existierender ID → Fehler
4. **ODER:** Supabase überschreibt → Aber dann ist der Eintrag "completed", nicht "pending"

**Szenario B: n8n erstellt neuen Eintrag (andere ID)**
1. Frontend erstellt: `readings.id = 'abc-123'`, `status = 'pending'`
2. n8n macht INSERT: `readings.id = 'xyz-789'` (neue UUID), `status = 'completed'`
3. **Problem:** Zwei verschiedene Einträge!
4. Frontend pollt `abc-123` → Sieht immer noch `status = 'pending'`
5. Neuer Eintrag `xyz-789` hat `status = 'completed'`, aber Frontend kennt diese ID nicht

**Szenario C: n8n wird nicht aufgerufen**
1. Frontend erstellt: `readings.id = 'abc-123'`, `status = 'pending'`
2. Frontend ruft MCP Gateway auf (Port 7000)
3. MCP Gateway ruft n8n Webhook auf
4. **Problem:** n8n Workflow wird nicht getriggert (falscher Webhook-Pfad oder Workflow nicht aktiv)
5. Status bleibt `'pending'`

---

## 🔴 ROOT CAUSE - KONKRETE STELLE

### **Datei:** `n8n-workflows/reading-generation-workflow.json`
### **Node:** "Save to Supabase" (Zeilen 139-175)
### **Problem:** Operation ist `insert` statt `update`

**Aktueller Code:**
```json
{
  "operation": "insert",  // ← FALSCH!
  "table": "readings",
  "columns": {
    "value": {
      "id": "={{ $json.readingId }}",
      "status": "completed"
    }
  }
}
```

**Was fehlt:**
1. **Kein WHERE-Clause** → Kann nicht bestehenden Eintrag finden
2. **Keine `reading_id` Übergabe** → n8n weiß nicht, welcher Eintrag updated werden soll
3. **Operation sollte `update` sein** → Nicht `insert`

---

## ✅ KONKRETE FIX-EMPFEHLUNG

### **Fix 1: n8n Workflow anpassen (UPDATE statt INSERT)**

**Änderung in `n8n-workflows/reading-generation-workflow.json`:**

**Vorher (Zeilen 139-175):**
```json
{
  "operation": "insert",
  "table": "readings",
  "columns": {
    "value": {
      "id": "={{ $json.readingId }}",
      "status": "completed"
    }
  }
}
```

**Nachher:**
```json
{
  "operation": "update",  // ← ÄNDERN!
  "table": "readings",
  "updateKey": "id",       // ← HINZUFÜGEN!
  "updateKeyValue": "={{ $json.body.reading_id || $json.reading_id || $json.readingId }}",  // ← HINZUFÜGEN!
  "columns": {
    "value": {
      "reading_text": "={{ $json.reading || $json.reading.text }}",
      "reading_sections": "={{ $json.reading.sections || null }}",
      "chart_data": "={{ $json.chartData || null }}",
      "metadata": "={{ { tokens: $json.tokens || 0, model: $json.model || 'gpt-4', timestamp: $json.timestamp || $now } }}",
      "status": "completed"  // ← Status explizit setzen
    }
  }
}
```

**Wichtig:**
- `reading_id` muss vom Webhook-Body kommen (`$json.body.reading_id`)
- ODER vom MCP Gateway Response (`$json.reading_id`)
- Prüfe, welche ID tatsächlich ankommt!

---

### **Fix 2: Webhook-Pfad prüfen**

**Problem:** MCP Core ruft n8n Webhook auf, aber Workflow hat möglicherweise falschen Pfad.

**Prüfen:**
1. MCP Core ruft: `http://n8n:5678/webhook/reading`
2. n8n Workflow Webhook-Pfad: `/reading` (Zeile 14)
3. **Sollte passen**, aber prüfe ob Workflow aktiv ist!

---

### **Fix 3: Port 4001 → 7000 korrigieren**

**Problem:** Workflow verwendet noch Port 4001 (veraltet).

**Änderung (Zeile 49):**
```json
"url": "={{ $env.READING_AGENT_URL || 'http://138.199.237.34:7000' }}/reading/generate"
```

**ABER:** Im neuen Flow wird n8n direkt vom MCP Core aufgerufen, nicht vom Workflow selbst!

---

### **Fix 4: reading_id vom Frontend an n8n übergeben**

**Problem:** Frontend erstellt Eintrag mit UUID, aber n8n bekommt diese ID nicht.

**Lösung 1: Frontend → MCP Gateway → MCP Core → n8n**

**Frontend API Route (Zeilen 113-124):**
```typescript
body: JSON.stringify({
  domain: 'reading',
  task: 'generate',
  payload: {
    birthDate: data?.birthDate,
    birthTime: data?.birthTime,
    birthPlace: data?.birthPlace,
    userId: data?.userId || null,
    readingType: readingType,
    readingId: readingId  // ← HINZUFÜGEN!
  },
  requestId
})
```

**MCP Core (`index.js`, Zeilen 423-460):**

**Problem 1: inputSchema hat kein readingId (Zeile 423-429):**
```javascript
inputSchema: z.object({
  birthDate: z.string().describe("Geburtsdatum im Format YYYY-MM-DD"),
  birthTime: z.string().describe("Geburtszeit im Format HH:MM"),
  birthPlace: z.string().describe("Geburtsort"),
  userId: z.string().optional().describe("User-ID (optional)"),
  readingType: z.enum([...]).optional().default("basic").describe("Art des Readings")
  // ← KEIN readingId!
})
```

**Problem 2: Tool Handler bekommt kein readingId (Zeile 437):**
```javascript
async ({ birthDate, birthTime, birthPlace, userId, readingType = "detailed" }) => {
  // ← readingId fehlt im Parameter!
```

**Problem 3: chartData hat kein readingId (Zeilen 442-449):**
```javascript
const chartData = {
  birthDate,
  birthTime,
  birthPlace,
  userId: userId || 'anonymous',
  readingType: readingType || 'detailed',
  timestamp: new Date().toISOString()
  // ← KEIN readingId!
};
```

**Fix:**
1. `inputSchema` erweitern: `readingId: z.string().optional()`
2. Tool Handler Parameter erweitern: `async ({ ..., readingId }) => {`
3. `chartData` erweitern: `readingId: readingId || null`

**n8n Workflow dann verwenden:**
```json
"updateKeyValue": "={{ $json.body.readingId || $json.readingId }}"
```

### **Fix 5: Webhook-Pfad korrigieren**

**Problem:** MCP Core ruft `/webhook/reading`, aber n8n Workflow hat `/reading`.

**Lösung A: n8n Workflow Webhook-Pfad ändern**

**n8n Workflow (`reading-generation-workflow.json`, Zeile 14):**
```json
"path": "webhook/reading"  // ← ÄNDERN von "reading" zu "webhook/reading"
```

**Lösung B: MCP Core Webhook-Pfad ändern**

**config.js (Zeile 13):**
```javascript
webhooks: {
  reading: "/reading",  // ← ÄNDERN von "/webhook/reading" zu "/reading"
}
```

**Empfehlung:** Lösung A (n8n Workflow anpassen), da `/webhook/` der Standard-Pfad für n8n Webhooks ist.

---

## 📋 CHECKLISTE FÜR FIX

### Sofort:
- [ ] **Frontend API Route:** `readingId` im `payload` hinzufügen (Zeile 116-122)
- [ ] **MCP Core:** `inputSchema` erweitern um `readingId: z.string().optional()` (Zeile 423-429)
- [ ] **MCP Core:** Tool Handler Parameter erweitern um `readingId` (Zeile 437)
- [ ] **MCP Core:** `chartData` erweitern um `readingId` (Zeile 442-449)
- [ ] **n8n Workflow:** Node "Save to Supabase" ändern: `insert` → `update` (Zeile 141)
- [ ] **n8n Workflow:** `updateKey` und `updateKeyValue` hinzufügen (Zeile 141-161)
- [ ] **n8n Workflow:** `reading_id` aus Webhook-Body lesen: `$json.body.readingId`
- [ ] **Webhook-Pfad:** n8n Workflow `/reading` → `/webhook/reading` (Zeile 14) ODER MCP Core `/webhook/reading` → `/reading` (config.js Zeile 13)

### Prüfen:
- [ ] n8n Workflow ist aktiv
- [ ] Webhook-Pfad `/reading` ist korrekt
- [ ] MCP Core ruft n8n Webhook auf
- [ ] `reading_id` kommt im n8n Webhook-Body an

### Testen:
- [ ] Frontend erstellt Eintrag mit `status='pending'`
- [ ] n8n updated bestehenden Eintrag (nicht INSERT!)
- [ ] Status wird auf `'completed'` gesetzt
- [ ] Frontend Polling sieht `status='completed'`

---

## 🎯 ZUSAMMENFASSUNG

**Root Cause:**
- n8n Workflow macht **INSERT** statt **UPDATE**
- Kein `reading_id` Match zwischen Frontend und n8n
- Der ursprüngliche Eintrag bleibt bei `status='pending'`

**Konkrete Stelle:**
- `n8n-workflows/reading-generation-workflow.json` - Node "Save to Supabase"
- Operation muss von `insert` auf `update` geändert werden
- `updateKey` und `updateKeyValue` müssen hinzugefügt werden

**Fix:**
- Siehe "Fix 1" oben
- `reading_id` muss vom Frontend an n8n übergeben werden
- n8n muss bestehenden Eintrag updaten, nicht neuen erstellen

---

**Status:** ✅ **Root Cause identifiziert - Fix-Empfehlung bereit**
