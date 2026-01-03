# 🔧 Reading-Failure-Handling: 6 Korrekturen

**Datum:** 03.01.2025  
**Status:** Produktionsreife Korrekturen  
**Ziel:** 6 gezielte Anpassungen am bestehenden Konzept

---

## ✅ Angewandte Korrekturen

### **1. Endpoint Namespace Consistency**
- ✅ Nur `/api/coach/readings-v2/*` für neue Features
- ✅ Legacy `/api/readings/*` bleibt 410 Gone (keine Erweiterung)

### **2. Deterministic Timeout Detection**
- ✅ `started_at` Spalte hinzugefügt
- ✅ Timeout-Logik: `status = 'generating' AND now() - started_at > timeout_threshold`
- ✅ Keine Verwendung von `updated_at` oder `created_at` für Timeout

### **3. Explicit Error Codes**
- ✅ `error_code VARCHAR(50)` Spalte hinzugefügt
- ✅ `error_meta JSONB` für zusätzliche Metadaten
- ✅ Retry-Logik basiert auf `error_code`, nicht String-Parsing

### **4. Cancelled Status Scope**
- ✅ `cancelled` aus Phase 1 entfernt (nur Phase 2)
- ✅ Status-Constraint: `('pending', 'processing', 'generating', 'completed', 'done', 'failed', 'timeout')`

### **5. Cron Strategy Compatibility**
- ✅ Keine pg_cron-Abhängigkeit
- ✅ Empfohlen: Supabase Edge Function (scheduled)
- ✅ Alternative: External Cron → RPC
- ✅ Request-basierter Timeout-Check als Fallback

### **6. Minimal & Non-Breaking Changes**
- ✅ Nur additive Schema-Änderungen
- ✅ Keine Breaking Changes für bestehende Readings
- ✅ Lokalisierte Änderungen

---

## 📊 1. Schema-Änderungen (SQL Migrations)

### **Migration 014 (korrigiert):**

```sql
-- Spalten hinzufügen (additiv, keine Breaking Changes)
ALTER TABLE reading_jobs
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_retries INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS retry_reason TEXT,
  ADD COLUMN IF NOT EXISTS error_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS error_meta JSONB;

-- Status-Constraint (cancelled entfernt für Phase 1)
ALTER TABLE reading_jobs
  DROP CONSTRAINT IF EXISTS reading_jobs_status_check;

ALTER TABLE reading_jobs
  ADD CONSTRAINT reading_jobs_status_check 
  CHECK (status IN ('pending', 'processing', 'generating', 'completed', 'done', 'failed', 'timeout'));

-- Indizes
CREATE INDEX IF NOT EXISTS idx_reading_jobs_started_at 
  ON reading_jobs(started_at) 
  WHERE status = 'generating';

CREATE INDEX IF NOT EXISTS idx_reading_jobs_error_code 
  ON reading_jobs(error_code) 
  WHERE error_code IS NOT NULL;
```

**Datei:** `integration/supabase/migrations/014_add_retry_fields_to_reading_jobs.sql` ✅ Aktualisiert

---

### **Migration 013 (korrigiert):**

```sql
-- Timeout-Handler mit started_at
CREATE OR REPLACE FUNCTION check_reading_timeouts()
RETURNS TABLE (updated_count INTEGER, updated_jobs UUID[])
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  timeout_threshold INTERVAL := INTERVAL '120 seconds';
  updated_jobs_array UUID[] := ARRAY[]::UUID[];
  job_record RECORD;
BEGIN
  -- CORRECTION: Uses started_at for deterministic timeout detection
  FOR job_record IN
    SELECT id, started_at, retry_count, max_retries
    FROM reading_jobs
    WHERE status = 'generating'
      AND started_at IS NOT NULL
      AND started_at < timezone('utc', now()) - timeout_threshold
  LOOP
    IF job_record.retry_count < job_record.max_retries THEN
      UPDATE reading_jobs
      SET 
        status = 'timeout',
        error = 'Reading generation timeout after 120 seconds',
        error_code = 'TIMEOUT',  -- CORRECTION: Explicit error_code
        error_meta = jsonb_build_object(
          'timeout_after_seconds', 120,
          'started_at', job_record.started_at,
          'detected_at', timezone('utc', now())
        ),
        updated_at = timezone('utc', now())
      WHERE id = job_record.id;
    ELSE
      UPDATE reading_jobs
      SET 
        status = 'failed',
        error = 'Reading generation timeout after 120 seconds (max retries exceeded)',
        error_code = 'TIMEOUT_MAX_RETRIES',  -- CORRECTION: Explicit error_code
        error_meta = jsonb_build_object(
          'timeout_after_seconds', 120,
          'started_at', job_record.started_at,
          'retry_count', job_record.retry_count,
          'max_retries', job_record.max_retries,
          'detected_at', timezone('utc', now())
        ),
        updated_at = timezone('utc', now())
      WHERE id = job_record.id;
    END IF;
    
    updated_jobs_array := array_append(updated_jobs_array, job_record.id);
  END LOOP;
  
  RETURN QUERY SELECT 
    COALESCE(array_length(updated_jobs_array, 1), 0)::INTEGER AS updated_count,
    updated_jobs_array AS updated_jobs;
END;
$$;
```

**Datei:** `integration/supabase/migrations/013_create_timeout_handler_rpc.sql` ✅ Aktualisiert

---

## ⏱️ 2. Korrigierte Timeout-Strategie

### **2.1 Serverseitig: Supabase Edge Function (empfohlen)**

**Datei:** `supabase/functions/check-reading-timeouts/index.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data, error } = await supabase.rpc('check_reading_timeouts');
  
  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      updatedCount: data?.[0]?.updated_count || 0,
      updatedJobs: data?.[0]?.updated_jobs || []
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

**Cron-Trigger (Supabase Dashboard):**
- URL: `https://[project].supabase.co/functions/v1/check-reading-timeouts`
- Schedule: `*/30 * * * * *` (alle 30 Sekunden)
- Headers: `Authorization: Bearer [SERVICE_ROLE_KEY]`

---

### **2.2 Request-basiert: Fallback in Status-API**

**Datei:** `integration/api-routes/app-router/coach/readings-v2/[id]/status/route.ts`

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const readingId = params.id;
  const supabase = getUserSupabaseClient(userJwt);

  // Status abrufen
  const { data: job, error } = await supabase
    .from('v_reading_jobs')
    .select('id, status, started_at, retry_count, max_retries, error_code')
    .eq('id', readingId)
    .single();

  if (error || !job) {
    return NextResponse.json(
      { success: false, error: 'Reading not found' },
      { status: 404 }
    );
  }

  // CORRECTION: Timeout-Check mit started_at (deterministic)
  if (job.status === 'generating' && job.started_at) {
    const now = new Date();
    const startedAt = new Date(job.started_at);
    const elapsedMs = now.getTime() - startedAt.getTime();
    const timeoutMs = 120000; // 120 Sekunden

    if (elapsedMs > timeoutMs) {
      // Timeout erkannt → Update Job
      const { error: updateError } = await supabase
        .from('v_reading_jobs')
        .update({
          status: job.retry_count < job.max_retries ? 'timeout' : 'failed',
          error: `Reading generation timeout after ${Math.round(elapsedMs / 1000)} seconds`,
          error_code: job.retry_count < job.max_retries ? 'TIMEOUT' : 'TIMEOUT_MAX_RETRIES',
          error_meta: {
            timeout_after_seconds: 120,
            started_at: job.started_at,
            detected_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', readingId);

      if (!updateError) {
        // Status aktualisieren für Response
        job.status = job.retry_count < job.max_retries ? 'timeout' : 'failed';
        job.error_code = job.retry_count < job.max_retries ? 'TIMEOUT' : 'TIMEOUT_MAX_RETRIES';
      }
    }
  }

  // Response
  return NextResponse.json({
    success: true,
    status: {
      readingId: job.id,
      status: job.status,
      retryAvailable: (job.status === 'timeout' || job.status === 'failed') 
        && job.retry_count < job.max_retries
        && isRetryableErrorCode(job.error_code),
      retryCount: job.retry_count,
      maxRetries: job.max_retries,
      errorCode: job.error_code || null,
      createdAt: job.created_at,
      updatedAt: job.updated_at
    }
  });
}

// CORRECTION: Retry-Eligibility basiert auf error_code
function isRetryableErrorCode(errorCode: string | null): boolean {
  if (!errorCode) return false;
  
  const retryableCodes = ['TIMEOUT', 'NETWORK_ERROR', 'AGENT_TIMEOUT', 'RATE_LIMIT'];
  const nonRetryableCodes = ['VALIDATION_ERROR', 'AUTH_ERROR', 'QUOTA_EXCEEDED'];
  
  if (nonRetryableCodes.includes(errorCode)) return false;
  return retryableCodes.includes(errorCode);
}
```

---

## 🔄 3. Korrigierte Retry-Logik

### **3.1 Retry-Eligibility (basierend auf error_code)**

**Retry-fähige Error-Codes:**
- ✅ `TIMEOUT` → Timeout erkannt
- ✅ `NETWORK_ERROR` → Netzwerk-Fehler
- ✅ `AGENT_TIMEOUT` → Agent-Timeout
- ✅ `RATE_LIMIT` → Rate Limit (mit Backoff)

**NICHT retry-fähige Error-Codes:**
- ❌ `VALIDATION_ERROR` → Ungültige Eingabe
- ❌ `AUTH_ERROR` → Authentifizierungsfehler
- ❌ `QUOTA_EXCEEDED` → Quota überschritten
- ❌ `TIMEOUT_MAX_RETRIES` → Max Retries erreicht

**Code:**
```typescript
function isRetryableErrorCode(errorCode: string | null): boolean {
  if (!errorCode) return false;
  
  const retryableCodes = ['TIMEOUT', 'NETWORK_ERROR', 'AGENT_TIMEOUT', 'RATE_LIMIT'];
  const nonRetryableCodes = ['VALIDATION_ERROR', 'AUTH_ERROR', 'QUOTA_EXCEEDED', 'TIMEOUT_MAX_RETRIES'];
  
  if (nonRetryableCodes.includes(errorCode)) return false;
  return retryableCodes.includes(errorCode);
}
```

---

### **3.2 Retry-Endpoint**

**Route:** `POST /api/coach/readings-v2/[id]/retry`

**Datei:** `integration/api-routes/app-router/coach/readings-v2/[id]/retry/route.ts`

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const readingId = params.id;
  const supabase = getUserSupabaseClient(userJwt);

  // Job abrufen
  const { data: job, error: fetchError } = await supabase
    .from('v_reading_jobs')
    .select('id, status, retry_count, max_retries, error_code')
    .eq('id', readingId)
    .single();

  if (fetchError || !job) {
    return NextResponse.json(
      { success: false, error: 'Reading not found' },
      { status: 404 }
    );
  }

  // Prüfe ob Retry möglich
  if (job.status !== 'timeout' && job.status !== 'failed') {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Retry not available for this status',
        currentStatus: job.status
      },
      { status: 400 }
    );
  }

  if (job.retry_count >= job.max_retries) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Maximum retries exceeded',
        retryCount: job.retry_count,
        maxRetries: job.max_retries
      },
      { status: 400 }
    );
  }

  // CORRECTION: Retry-Eligibility basiert auf error_code
  if (!isRetryableErrorCode(job.error_code)) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'This error cannot be retried',
        errorCode: job.error_code
      },
      { status: 400 }
    );
  }

  // Retry durchführen
  const { data: updatedJob, error: updateError } = await supabase
    .from('v_reading_jobs')
    .update({
      status: 'pending',
      retry_count: job.retry_count + 1,
      last_retry_at: new Date().toISOString(),
      retry_reason: 'User requested retry',
      error: null,
      error_code: null,  // Reset error_code
      error_meta: null,  // Reset error_meta
      started_at: null,  // Reset started_at (wird beim nächsten Start gesetzt)
      updated_at: new Date().toISOString()
    })
    .eq('id', readingId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { success: false, error: 'Failed to retry reading' },
      { status: 500 }
    );
  }

  // Job erneut verarbeiten (Trigger n8n Workflow oder API Route)
  // ... (siehe Implementierungsnotizen)

  return NextResponse.json({
    success: true,
    message: 'Reading retry initiated',
    readingId: updatedJob.id,
    status: updatedJob.status,
    retryCount: updatedJob.retry_count,
    maxRetries: updatedJob.max_retries
  });
}

function isRetryableErrorCode(errorCode: string | null): boolean {
  if (!errorCode) return false;
  const retryableCodes = ['TIMEOUT', 'NETWORK_ERROR', 'AGENT_TIMEOUT', 'RATE_LIMIT'];
  return retryableCodes.includes(errorCode);
}
```

---

## 📡 4. Finale API-Routen-Liste

### **Aktive Routen (readings-v2):**

| Route | Methode | Status | Beschreibung |
|-------|---------|--------|--------------|
| `/api/coach/readings-v2/create` | POST | ✅ | Reading erstellen |
| `/api/coach/readings-v2/[id]` | GET | ✅ | Reading abrufen |
| `/api/coach/readings-v2/[id]/status` | GET | ✅ | Status abrufen (mit Timeout-Check) |
| `/api/coach/readings-v2/[id]/retry` | POST | ✅ | Retry durchführen |
| `/api/coach/readings-v2/[id]/regenerate` | POST | ✅ | Reading regenerieren |

### **Deprecated Routen (Legacy):**

| Route | Methode | Status | Beschreibung |
|-------|---------|--------|--------------|
| `/api/readings/[id]` | GET | 🔴 410 Gone | Legacy - Nicht erweitern |
| `/api/readings/[id]/status` | GET | 🔴 410 Gone | Legacy - Nicht erweitern |
| `/api/readings/history` | GET | 🔴 410 Gone | Legacy - Nicht erweitern |
| `/api/reading/generate` | POST | 🔴 410 Gone | Legacy - Nicht erweitern |

**Response für Legacy-Routen:**
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

## 📝 5. Implementierungsnotizen

### **5.1 Wo wird `started_at` gesetzt?**

**Beim Übergang `pending` → `generating`:**

```typescript
// integration/api-routes/app-router/coach/readings-v2/create/route.ts
// ODER in n8n Workflow nach erfolgreichem Agent-Aufruf

// Status auf 'generating' setzen + started_at setzen
const { error: updateError } = await supabase
  .from('v_reading_jobs')
  .update({
    status: 'generating',
    started_at: new Date().toISOString(),  // ← HIER
    updated_at: new Date().toISOString()
  })
  .eq('id', readingId);
```

**Wichtig:** `started_at` wird NUR beim Übergang zu `generating` gesetzt, nicht bei jedem Update.

---

### **5.2 Wo passieren Timeout-Übergänge?**

**1. Serverseitig (Cron / Edge Function):**
- RPC `check_reading_timeouts()` wird alle 30 Sekunden aufgerufen
- Prüft: `status = 'generating' AND started_at < now() - 120 seconds`
- Setzt: `status = 'timeout'` (oder `'failed'` bei max retries)

**2. Request-basiert (Fallback):**
- In `GET /api/coach/readings-v2/[id]/status`
- Prüft: `status = 'generating' AND started_at < now() - 120 seconds`
- Setzt: `status = 'timeout'` (oder `'failed'` bei max retries)

---

### **5.3 Wo wird Retry-State zurückgesetzt?**

**In `POST /api/coach/readings-v2/[id]/retry`:**

```typescript
.update({
  status: 'pending',           // ← Zurück auf pending
  retry_count: job.retry_count + 1,  // ← Increment
  last_retry_at: new Date().toISOString(),
  retry_reason: 'User requested retry',
  error: null,                // ← Reset
  error_code: null,           // ← Reset
  error_meta: null,          // ← Reset
  started_at: null,          // ← Reset (wird beim nächsten Start gesetzt)
  updated_at: new Date().toISOString()
})
```

**Wichtig:** `started_at` wird auf `null` gesetzt und erst beim nächsten Übergang zu `generating` wieder gesetzt.

---

### **5.4 Error-Code-Setzung**

**Bei Timeout:**
```typescript
error_code: 'TIMEOUT'  // oder 'TIMEOUT_MAX_RETRIES'
```

**Bei Agent-Fehler:**
```typescript
error_code: 'AGENT_TIMEOUT'  // oder 'NETWORK_ERROR'
```

**Bei Validierungsfehler:**
```typescript
error_code: 'VALIDATION_ERROR'  // nicht retry-fähig
```

**Bei Auth-Fehler:**
```typescript
error_code: 'AUTH_ERROR'  // nicht retry-fähig
```

---

## ✅ Zusammenfassung der Korrekturen

| # | Korrektur | Status | Datei |
|---|-----------|--------|-------|
| 1 | Endpoint Namespace | ✅ | API-Routen-Liste aktualisiert |
| 2 | Deterministic Timeout | ✅ | `started_at` hinzugefügt, RPC korrigiert |
| 3 | Explicit Error Codes | ✅ | `error_code` + `error_meta` hinzugefügt |
| 4 | Cancelled Status | ✅ | Aus Phase 1 entfernt |
| 5 | Cron Strategy | ✅ | Edge Function statt pg_cron |
| 6 | Minimal Changes | ✅ | Nur additive Schema-Änderungen |

---

**Status:** ✅ Alle 6 Korrekturen angewendet, bereit für Implementierung
