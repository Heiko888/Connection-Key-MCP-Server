# 📋 Reading-Failure-Handling: Implementierungs-Checkliste

**Datum:** 03.01.2025  
**Status:** 6 Korrekturen angewendet, bereit für Implementierung

---

## ✅ Angewandte Korrekturen

1. ✅ **Endpoint Namespace:** Nur `/api/coach/readings-v2/*`
2. ✅ **Deterministic Timeout:** `started_at` statt `updated_at`/`created_at`
3. ✅ **Explicit Error Codes:** `error_code` + `error_meta` Spalten
4. ✅ **Cancelled Status:** Aus Phase 1 entfernt
5. ✅ **Cron Strategy:** Supabase Edge Function statt pg_cron
6. ✅ **Minimal Changes:** Nur additive Schema-Änderungen

---

## 🗄️ Schema-Änderungen (SQL Migrations)

### **Migration 013: Timeout Handler RPC**
**Datei:** `integration/supabase/migrations/013_create_timeout_handler_rpc.sql`

**Änderungen:**
- ✅ Verwendet `started_at` für Timeout-Erkennung
- ✅ Setzt `error_code` explizit (`TIMEOUT`, `TIMEOUT_MAX_RETRIES`)
- ✅ Setzt `error_meta` mit Metadaten

**Ausführen:**
```sql
-- In Supabase SQL Editor ausführen
\i integration/supabase/migrations/013_create_timeout_handler_rpc.sql
```

---

### **Migration 014: Retry Fields + Error Codes**
**Datei:** `integration/supabase/migrations/014_add_retry_fields_to_reading_jobs.sql`

**Änderungen:**
- ✅ `started_at TIMESTAMP WITH TIME ZONE` hinzugefügt
- ✅ `error_code VARCHAR(50)` hinzugefügt
- ✅ `error_meta JSONB` hinzugefügt
- ✅ `retry_count`, `max_retries`, `last_retry_at`, `retry_reason` hinzugefügt
- ✅ Status-Constraint: `cancelled` entfernt (nur Phase 2)
- ✅ Indizes für `started_at` und `error_code`

**Ausführen:**
```sql
-- In Supabase SQL Editor ausführen
\i integration/supabase/migrations/014_add_retry_fields_to_reading_jobs.sql
```

---

## 🔧 API-Routen (Neue Dateien)

### **1. Status-Endpoint**
**Datei:** `integration/api-routes/app-router/coach/readings-v2/[id]/status/route.ts`

**Route:** `GET /api/coach/readings-v2/[id]/status`

**Features:**
- ✅ Request-basierter Timeout-Check (Fallback)
- ✅ Verwendet `started_at` für deterministische Timeout-Erkennung
- ✅ Retry-Availability basiert auf `error_code`
- ✅ Response enthält `errorCode`, `errorMeta`, `startedAt`

**Deployment:**
```bash
# Auf Frontend-Server kopieren
scp integration/api-routes/app-router/coach/readings-v2/[id]/status/route.ts \
  root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/coach/readings-v2/[id]/status/route.ts
```

---

### **2. Retry-Endpoint**
**Datei:** `integration/api-routes/app-router/coach/readings-v2/[id]/retry/route.ts`

**Route:** `POST /api/coach/readings-v2/[id]/retry`

**Features:**
- ✅ Retry-Eligibility basiert auf `error_code`
- ✅ Setzt `started_at` auf `null` (wird beim nächsten Start gesetzt)
- ✅ Reset von `error_code` und `error_meta`
- ✅ Incrementiert `retry_count`

**Deployment:**
```bash
# Auf Frontend-Server kopieren
scp integration/api-routes/app-router/coach/readings-v2/[id]/retry/route.ts \
  root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/coach/readings-v2/[id]/retry/route.ts
```

---

## ⏱️ Timeout-Strategie

### **Serverseitig: Supabase Edge Function**

**Datei:** `supabase/functions/check-reading-timeouts/index.ts`

**Setup:**
1. Edge Function in Supabase Dashboard erstellen
2. Code aus `supabase/functions/check-reading-timeouts/index.ts` kopieren
3. Cron-Trigger einrichten:
   - Schedule: `*/30 * * * * *` (alle 30 Sekunden)
   - URL: `https://[project].supabase.co/functions/v1/check-reading-timeouts`
   - Headers: `Authorization: Bearer [SERVICE_ROLE_KEY]`

**Alternative: External Cron**
```bash
# GitHub Actions, external service, etc.
curl -X POST https://[project].supabase.co/functions/v1/check-reading-timeouts \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]"
```

---

### **Request-basiert: Fallback**

**Implementiert in:** `GET /api/coach/readings-v2/[id]/status`

- ✅ Prüft Timeout bei jedem Status-Check
- ✅ Verwendet `started_at` für deterministische Erkennung
- ✅ Setzt Status automatisch auf `timeout` oder `failed`

---

## 🔄 Retry-Logik

### **Retry-fähige Error-Codes:**
- ✅ `TIMEOUT`
- ✅ `NETWORK_ERROR`
- ✅ `AGENT_TIMEOUT`
- ✅ `RATE_LIMIT`

### **NICHT retry-fähige Error-Codes:**
- ❌ `VALIDATION_ERROR`
- ❌ `AUTH_ERROR`
- ❌ `QUOTA_EXCEEDED`
- ❌ `TIMEOUT_MAX_RETRIES`

### **Retry-Flow:**
```
1. Job hat Status 'timeout' oder 'failed'
2. retry_count < max_retries
3. error_code ist retry-fähig
4. POST /api/coach/readings-v2/[id]/retry
5. Status → 'pending'
6. retry_count += 1
7. started_at = null (wird beim nächsten Start gesetzt)
8. error_code = null (reset)
```

---

## 📝 Implementierungsnotizen

### **Wo wird `started_at` gesetzt?**

**Beim Übergang `pending` → `generating`:**

**Option A: In API Route (create)**
```typescript
// integration/api-routes/app-router/coach/readings-v2/create/route.ts
// Nach erfolgreichem Agent-Aufruf

await supabase
  .from('v_reading_jobs')
  .update({
    status: 'generating',
    started_at: new Date().toISOString(),  // ← HIER
    updated_at: new Date().toISOString()
  })
  .eq('id', readingId);
```

**Option B: In n8n Workflow**
```javascript
// n8n Workflow: Nach "Call Agent" Node
// Code Node:
const startedAt = new Date().toISOString();
await $supabase
  .from('reading_jobs')
  .update({
    status: 'generating',
    started_at: startedAt  // ← HIER
  })
  .eq('id', $json.readingId);
```

**Wichtig:** `started_at` wird NUR beim Übergang zu `generating` gesetzt, nicht bei jedem Update.

---

### **Wo werden Error-Codes gesetzt?**

**Bei Timeout:**
```typescript
error_code: 'TIMEOUT'  // oder 'TIMEOUT_MAX_RETRIES'
error_meta: {
  timeout_after_seconds: 120,
  started_at: job.started_at,
  detected_at: new Date().toISOString()
}
```

**Bei Agent-Fehler:**
```typescript
error_code: 'AGENT_TIMEOUT'  // oder 'NETWORK_ERROR'
error_meta: {
  agent_response: response.status,
  agent_error: errorText
}
```

**Bei Validierungsfehler:**
```typescript
error_code: 'VALIDATION_ERROR'  // nicht retry-fähig
error_meta: {
  validation_errors: [...]
}
```

---

### **Wo wird Retry-State zurückgesetzt?**

**In `POST /api/coach/readings-v2/[id]/retry`:**
```typescript
.update({
  status: 'pending',
  retry_count: job.retry_count + 1,
  last_retry_at: new Date().toISOString(),
  retry_reason: reason || 'User requested retry',
  error: null,
  error_code: null,      // ← Reset
  error_meta: null,      // ← Reset
  started_at: null,      // ← Reset (wird beim nächsten Start gesetzt)
  updated_at: new Date().toISOString()
})
```

---

## 📡 Finale API-Routen-Liste

### **Aktive Routen (readings-v2):**

| Route | Methode | Status | Datei |
|-------|---------|--------|-------|
| `/api/coach/readings-v2/create` | POST | ✅ | `coach/readings-v2/create/route.ts` |
| `/api/coach/readings-v2/[id]` | GET | ✅ | `coach/readings-v2/[id]/route.ts` |
| `/api/coach/readings-v2/[id]/status` | GET | ✅ | `coach/readings-v2/[id]/status/route.ts` (NEU) |
| `/api/coach/readings-v2/[id]/retry` | POST | ✅ | `coach/readings-v2/[id]/retry/route.ts` (NEU) |
| `/api/coach/readings-v2/[id]/regenerate` | POST | ✅ | `coach/readings-v2/[id]/regenerate/route.ts` |

### **Deprecated Routen (Legacy - 410 Gone):**

| Route | Methode | Status | Aktion |
|-------|---------|--------|--------|
| `/api/readings/[id]` | GET | 🔴 410 | Nicht erweitern |
| `/api/readings/[id]/status` | GET | 🔴 410 | Nicht erweitern |
| `/api/readings/history` | GET | 🔴 410 | Nicht erweitern |
| `/api/reading/generate` | POST | 🔴 410 | Nicht erweitern |

**Legacy-Route Response:**
```typescript
return NextResponse.json(
  {
    success: false,
    error: 'This endpoint is deprecated. Please use /api/coach/readings-v2/*',
    deprecated: true,
    alternative: '/api/coach/readings-v2/*'
  },
  { status: 410 }
);
```

---

## ✅ Implementierungs-Checkliste

### **Phase 1: Schema (kritisch)**
- [ ] Migration 013 ausführen (`check_reading_timeouts` RPC)
- [ ] Migration 014 ausführen (Retry-Felder, Error-Codes, `started_at`)
- [ ] RPC testen: `SELECT check_reading_timeouts();`

### **Phase 2: Timeout-Handler (kritisch)**
- [ ] Supabase Edge Function erstellen (`check-reading-timeouts`)
- [ ] Cron-Trigger einrichten (alle 30 Sekunden)
- [ ] Edge Function testen

### **Phase 3: API-Routen (wichtig)**
- [ ] Status-Endpoint deployen (`/api/coach/readings-v2/[id]/status`)
- [ ] Retry-Endpoint deployen (`/api/coach/readings-v2/[id]/retry`)
- [ ] Legacy-Routen auf 410 Gone setzen

### **Phase 4: `started_at` setzen (wichtig)**
- [ ] In create-Route: `started_at` beim Übergang zu `generating` setzen
- [ ] ODER in n8n Workflow: `started_at` setzen
- [ ] Testen: `started_at` wird korrekt gesetzt

### **Phase 5: Error-Codes setzen (wichtig)**
- [ ] Bei Timeout: `error_code = 'TIMEOUT'`
- [ ] Bei Agent-Fehler: `error_code = 'AGENT_TIMEOUT'` oder `'NETWORK_ERROR'`
- [ ] Bei Validierungsfehler: `error_code = 'VALIDATION_ERROR'`
- [ ] Testen: Error-Codes werden korrekt gesetzt

### **Phase 6: Testing (wichtig)**
- [ ] Timeout-Szenario testen (120 Sekunden warten)
- [ ] Retry-Szenario testen (3 Retries)
- [ ] Max-Retries-Szenario testen
- [ ] Error-Code-basierte Retry-Logik testen

---

## 🎯 Zusammenfassung

**6 Korrekturen angewendet:**
1. ✅ Endpoint Namespace: `/api/coach/readings-v2/*`
2. ✅ Deterministic Timeout: `started_at`
3. ✅ Explicit Error Codes: `error_code` + `error_meta`
4. ✅ Cancelled Status: Phase 2 only
5. ✅ Cron Strategy: Supabase Edge Function
6. ✅ Minimal Changes: Nur additive Änderungen

**Bereit für Implementierung:** ✅
