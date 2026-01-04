# 🛡️ Reading-Flow Failure-Handling: Vollständiges Konzept

**Datum:** 03.01.2025  
**Status:** Produktionsreifes Konzept  
**Ziel:** Kein Reading bleibt jemals hängen

---

## 📊 1. Statusmodell

### **1.1 Gültige Statuswerte**

```typescript
type ReadingStatus = 
  | 'pending'      // Initial: Job erstellt, wartet auf Start
  | 'generating'   // In Bearbeitung: Reading wird generiert
  | 'done'         // Erfolgreich: Reading abgeschlossen
  | 'failed'       // Fehler: Nicht retry-fähig oder max retries erreicht
  | 'timeout'     // Timeout: Generierung dauerte zu lange
  | 'cancelled';   // Abgebrochen: User hat abgebrochen
```

### **1.2 Status-Übergänge (State Machine)**

```
┌─────────┐
│ pending │ ──► [Job erstellt, wartet auf Start]
└────┬────┘
     │
     ▼
┌─────────────┐
│ generating  │ ──► [Reading wird generiert]
└─────┬───────┘
      │
      ├──► ┌──────┐  (Erfolg)
      │    │ done │
      │    └──────┘
      │
      ├──► ┌─────────┐  (Fehler, retry-fähig)
      │    │ failed  │ ──► [retry_count < max_retries] ──► pending
      │    └─────────┘
      │
      ├──► ┌─────────┐  (Timeout)
      │    │ timeout │ ──► [retry_count < max_retries] ──► pending
      │    └─────────┘
      │
      └──► ┌──────────┐  (User-Abbruch)
           │ cancelled│
           └──────────┘
```

### **1.3 Wann wird welcher Status gesetzt?**

| Status | Wann | Wer | Beispiel |
|--------|------|-----|----------|
| `pending` | Job erstellt | API Route | `POST /api/reading/generate` |
| `generating` | Generierung gestartet | API Route / n8n | Nach erfolgreichem Agent-Aufruf |
| `done` | Reading erfolgreich | n8n / API Route | Nach erfolgreicher Generierung |
| `failed` | Fehler (final) | Timeout-Job / API Route | `retry_count >= max_retries` |
| `timeout` | Timeout erkannt | Timeout-Job / Status-Check | `generating` > 120 Sekunden |
| `cancelled` | User-Abbruch | API Route | `DELETE /api/readings/[id]` |

---

## ⏱️ 2. Timeout-Strategie

### **2.1 Maximale Generierungsdauer**

**Empfohlener Wert:** `120 Sekunden (2 Minuten)`

**Begründung:**
- Durchschnittliche Reading-Generierung: 30-60 Sekunden
- 120 Sekunden = 2x Puffer für langsame Requests
- Verhindert hängende Jobs ohne zu aggressiv zu sein

**Konfigurierbar via Environment Variable:**
```typescript
const READING_GENERATION_TIMEOUT_MS = parseInt(
  process.env.READING_GENERATION_TIMEOUT_MS || '120000',
  10
);
```

### **2.2 Variante 1: Serverseitig (Cron / Background Job)**

**Implementierung:** PostgreSQL RPC + pg_cron (oder Supabase Edge Function)

**Vorteile:**
- ✅ Automatisch, keine Abhängigkeit von Frontend
- ✅ Funktioniert auch bei inaktiven Usern
- ✅ Skalierbar (läuft unabhängig von API-Requests)

**SQL RPC Function:**
```sql
-- Migration: 013_create_timeout_handler_rpc.sql

CREATE OR REPLACE FUNCTION check_reading_timeouts()
RETURNS TABLE (
  updated_count INTEGER,
  updated_jobs UUID[]
) 
LANGUAGE plpgsql
SECURITY DEFINER  -- ← Läuft als postgres (Service Role)
AS $$
DECLARE
  timeout_threshold INTERVAL := INTERVAL '120 seconds';
  updated_jobs_array UUID[] := ARRAY[]::UUID[];
  job_record RECORD;
BEGIN
  -- Finde alle Jobs, die länger als 120 Sekunden in 'generating' sind
  FOR job_record IN
    SELECT id, created_at, updated_at
    FROM reading_jobs
    WHERE status = 'generating'
      AND (
        updated_at < timezone('utc', now()) - timeout_threshold
        OR created_at < timezone('utc', now()) - timeout_threshold
      )
  LOOP
    -- Update Job auf 'timeout'
    UPDATE reading_jobs
    SET 
      status = 'timeout',
      error = 'Reading generation timeout after 120 seconds',
      updated_at = timezone('utc', now())
    WHERE id = job_record.id;
    
    -- Füge zur Liste hinzu
    updated_jobs_array := array_append(updated_jobs_array, job_record.id);
  END LOOP;
  
  RETURN QUERY SELECT 
    array_length(updated_jobs_array, 1)::INTEGER AS updated_count,
    updated_jobs_array AS updated_jobs;
END;
$$;

COMMENT ON FUNCTION check_reading_timeouts IS 
  'Prüft und markiert hängende Reading-Jobs als timeout';
```

**Cron-Job (pg_cron):**
```sql
-- Alle 30 Sekunden ausführen
SELECT cron.schedule(
  'check-reading-timeouts',
  '*/30 * * * * *',  -- Jede 30 Sekunden
  $$SELECT check_reading_timeouts();$$
);
```

**Alternative: Supabase Edge Function (falls pg_cron nicht verfügbar):**
```typescript
// supabase/functions/check-reading-timeouts/index.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data, error } = await supabase.rpc('check_reading_timeouts');
  
  return new Response(JSON.stringify({ success: true, data }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**Cron-Trigger (Supabase Dashboard):**
- URL: `https://[project].supabase.co/functions/v1/check-reading-timeouts`
- Schedule: `*/30 * * * * *` (alle 30 Sekunden)
- Headers: `Authorization: Bearer [SERVICE_ROLE_KEY]`

---

### **2.3 Variante 2: Request-basiert (beim Status-Check)**

**Implementierung:** In API Route `/api/readings/[id]/status`

**Vorteile:**
- ✅ Einfach zu implementieren
- ✅ Keine zusätzliche Infrastruktur nötig
- ✅ Sofortige Reaktion bei aktiven Usern

**Nachteile:**
- ⚠️ Funktioniert nur, wenn User Status prüft
- ⚠️ Hängende Jobs bei inaktiven Usern bleiben unentdeckt

**Code-Beispiel:**
```typescript
// integration/api-routes/app-router/readings/[id]/status/route.ts

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const readingId = params.id;
  const supabase = getUserSupabaseClient(userJwt);

  // Status abrufen
  const { data: job, error } = await supabase
    .from('v_reading_jobs')
    .select('id, status, created_at, updated_at, retry_count, max_retries')
    .eq('id', readingId)
    .single();

  if (error || !job) {
    return NextResponse.json(
      { success: false, error: 'Reading not found' },
      { status: 404 }
    );
  }

  // Timeout-Check: Wenn 'generating' > 120 Sekunden
  if (job.status === 'generating') {
    const now = new Date();
    const updatedAt = new Date(job.updated_at);
    const elapsedMs = now.getTime() - updatedAt.getTime();
    const timeoutMs = 120000; // 120 Sekunden

    if (elapsedMs > timeoutMs) {
      // Timeout erkannt → Update Job
      const { error: updateError } = await supabase
        .from('v_reading_jobs')
        .update({
          status: 'timeout',
          error: `Reading generation timeout after ${Math.round(elapsedMs / 1000)} seconds`,
          updated_at: new Date().toISOString()
        })
        .eq('id', readingId);

      if (!updateError) {
        // Status aktualisieren für Response
        job.status = 'timeout';
        job.error = `Reading generation timeout after ${Math.round(elapsedMs / 1000)} seconds`;
      }
    }
  }

  // Response mit aktualisiertem Status
  return NextResponse.json({
    success: true,
    status: {
      readingId: job.id,
      status: job.status,
      retryAvailable: job.status === 'timeout' && job.retry_count < job.max_retries,
      retryCount: job.retry_count,
      maxRetries: job.max_retries,
      error: job.error || null,
      createdAt: job.created_at,
      updatedAt: job.updated_at
    }
  });
}
```

**Empfehlung:** Kombination beider Varianten
- Variante 1 (Cron) für automatische Bereinigung
- Variante 2 (Request-basiert) für sofortige Reaktion

---

## 🔄 3. Retry-Logik

### **3.1 Schema-Erweiterung**

**Migration:**
```sql
-- Migration: 014_add_retry_fields_to_reading_jobs.sql

ALTER TABLE reading_jobs
  ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_retries INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS retry_reason TEXT;

-- Constraint: retry_count >= 0
ALTER TABLE reading_jobs
  ADD CONSTRAINT reading_jobs_retry_count_check 
  CHECK (retry_count >= 0);

-- Constraint: max_retries >= 0
ALTER TABLE reading_jobs
  ADD CONSTRAINT reading_jobs_max_retries_check 
  CHECK (max_retries >= 0);

-- Index für Retry-Queries
CREATE INDEX IF NOT EXISTS idx_reading_jobs_retry_count 
  ON reading_jobs(retry_count) 
  WHERE status IN ('failed', 'timeout');
```

### **3.2 Retry-Strategie**

**Retry-fähige Fehler:**
- ✅ `timeout` → Netzwerk-Timeout, Agent nicht erreichbar
- ✅ `failed` mit `error_code: 'AGENT_TIMEOUT'` → Agent-Timeout
- ✅ `failed` mit `error_code: 'NETWORK_ERROR'` → Netzwerk-Fehler
- ✅ `failed` mit `error_code: 'RATE_LIMIT'` → Rate Limit (mit Backoff)

**NICHT retry-fähige Fehler:**
- ❌ `failed` mit `error_code: 'VALIDATION_ERROR'` → Ungültige Eingabe
- ❌ `failed` mit `error_code: 'AUTH_ERROR'` → Authentifizierungsfehler
- ❌ `failed` mit `error_code: 'QUOTA_EXCEEDED'` → Quota überschritten
- ❌ `cancelled` → User hat abgebrochen

### **3.3 Retry-Mechanismus**

**Option A: Derselbe Reading-Datensatz (empfohlen)**

**Vorteile:**
- ✅ Einfach zu implementieren
- ✅ Keine Duplikate
- ✅ Status-History bleibt erhalten

**Flow:**
```
1. Job hat Status 'timeout' oder 'failed' (retry-fähig)
2. retry_count < max_retries
3. API Route setzt Status zurück auf 'pending'
4. retry_count += 1
5. last_retry_at = NOW()
6. retry_reason = 'User requested retry' oder 'Automatic retry'
7. Job wird erneut verarbeitet
```

**Code-Beispiel:**
```typescript
// integration/api-routes/app-router/readings/[id]/retry/route.ts

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const readingId = params.id;
  const supabase = getUserSupabaseClient(userJwt);

  // Job abrufen
  const { data: job, error: fetchError } = await supabase
    .from('v_reading_jobs')
    .select('id, status, retry_count, max_retries, error')
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

  // Prüfe ob Fehler retry-fähig ist
  const errorCode = job.error?.match(/error_code:\s*'(\w+)'/)?.[1];
  const nonRetryableErrors = ['VALIDATION_ERROR', 'AUTH_ERROR', 'QUOTA_EXCEEDED'];
  
  if (errorCode && nonRetryableErrors.includes(errorCode)) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'This error cannot be retried',
        errorCode
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
      error: null, // Fehler zurücksetzen
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

  // Job erneut verarbeiten (Trigger n8n Workflow)
  // ... (siehe nächster Abschnitt)

  return NextResponse.json({
    success: true,
    message: 'Reading retry initiated',
    readingId: updatedJob.id,
    status: updatedJob.status,
    retryCount: updatedJob.retry_count,
    maxRetries: updatedJob.max_retries
  });
}
```

**Option B: Neue Version (für readings-v2 mit Versionssystem)**

**Vorteile:**
- ✅ Vollständige Historie
- ✅ Alte Version bleibt erhalten

**Nachteile:**
- ⚠️ Komplexer (benötigt Versionssystem)
- ⚠️ Mehr Datenbank-Einträge

**Empfehlung:** Option A für `reading_jobs`, Option B für `readings-v2` (falls Versionssystem vorhanden)

---

## 📡 4. API-Verhalten

### **4.1 Status-Responses**

#### **Status: `pending`**
```json
{
  "success": true,
  "status": {
    "readingId": "uuid",
    "status": "pending",
    "message": "Reading is queued and waiting to start",
    "createdAt": "2025-01-03T10:00:00Z",
    "updatedAt": "2025-01-03T10:00:00Z",
    "retryCount": 0,
    "maxRetries": 3
  }
}
```
**HTTP Status:** `200 OK`

---

#### **Status: `generating`**
```json
{
  "success": true,
  "status": {
    "readingId": "uuid",
    "status": "generating",
    "message": "Reading is being generated",
    "progress": 45,
    "estimatedTimeRemaining": 60,
    "createdAt": "2025-01-03T10:00:00Z",
    "updatedAt": "2025-01-03T10:00:15Z",
    "retryCount": 0,
    "maxRetries": 3
  }
}
```
**HTTP Status:** `200 OK`

---

#### **Status: `done`**
```json
{
  "success": true,
  "status": {
    "readingId": "uuid",
    "status": "done",
    "message": "Reading generated successfully",
    "createdAt": "2025-01-03T10:00:00Z",
    "updatedAt": "2025-01-03T10:01:30Z",
    "completedAt": "2025-01-03T10:01:30Z",
    "retryCount": 0
  }
}
```
**HTTP Status:** `200 OK`

---

#### **Status: `failed` (final)**
```json
{
  "success": true,
  "status": {
    "readingId": "uuid",
    "status": "failed",
    "message": "Reading generation failed",
    "error": "Agent returned error: Invalid input data",
    "errorCode": "VALIDATION_ERROR",
    "retryAvailable": false,
    "retryCount": 3,
    "maxRetries": 3,
    "createdAt": "2025-01-03T10:00:00Z",
    "updatedAt": "2025-01-03T10:02:00Z"
  }
}
```
**HTTP Status:** `200 OK` (Status ist valide, kein Server-Fehler)

---

#### **Status: `timeout`**
```json
{
  "success": true,
  "status": {
    "readingId": "uuid",
    "status": "timeout",
    "message": "Reading generation timed out after 120 seconds",
    "error": "Reading generation timeout after 120 seconds",
    "errorCode": "TIMEOUT",
    "retryAvailable": true,
    "retryCount": 1,
    "maxRetries": 3,
    "createdAt": "2025-01-03T10:00:00Z",
    "updatedAt": "2025-01-03T10:02:00Z",
    "timeoutAfter": 120
  }
}
```
**HTTP Status:** `200 OK`

---

#### **Status: `timeout` (max retries erreicht)**
```json
{
  "success": true,
  "status": {
    "readingId": "uuid",
    "status": "failed",
    "message": "Reading generation failed after 3 retries",
    "error": "Reading generation timeout after 120 seconds (retry 3/3)",
    "errorCode": "TIMEOUT_MAX_RETRIES",
    "retryAvailable": false,
    "retryCount": 3,
    "maxRetries": 3,
    "createdAt": "2025-01-03T10:00:00Z",
    "updatedAt": "2025-01-03T10:06:00Z"
  }
}
```
**HTTP Status:** `200 OK`

---

#### **Status: `cancelled`**
```json
{
  "success": true,
  "status": {
    "readingId": "uuid",
    "status": "cancelled",
    "message": "Reading generation was cancelled by user",
    "createdAt": "2025-01-03T10:00:00Z",
    "updatedAt": "2025-01-03T10:01:00Z",
    "cancelledAt": "2025-01-03T10:01:00Z"
  }
}
```
**HTTP Status:** `200 OK`

---

### **4.2 Retry-Endpoint**

**Route:** `POST /api/readings/[id]/retry`

**Request:**
```json
{
  "reason": "User requested retry" // Optional
}
```

**Response (Erfolg):**
```json
{
  "success": true,
  "message": "Reading retry initiated",
  "readingId": "uuid",
  "status": "pending",
  "retryCount": 1,
  "maxRetries": 3
}
```
**HTTP Status:** `200 OK`

**Response (Fehler - Retry nicht möglich):**
```json
{
  "success": false,
  "error": "Retry not available",
  "reason": "Maximum retries exceeded",
  "retryCount": 3,
  "maxRetries": 3
}
```
**HTTP Status:** `400 Bad Request`

---

## 🎨 5. Frontend-UX-Empfehlungen

### **5.1 Status-spezifische UI-Reaktionen**

#### **Status: `pending`**
**UI:**
- ⏳ Spinner mit Text: "Reading wird vorbereitet..."
- Kein "Abbrechen"-Button (noch nicht gestartet)

**Text:**
```typescript
"Reading wird vorbereitet..."
```

---

#### **Status: `generating`**
**UI:**
- ⚙️ Spinner mit Progress-Bar (falls verfügbar)
- "Abbrechen"-Button sichtbar
- Auto-Refresh alle 3 Sekunden

**Text:**
```typescript
"Reading wird generiert... (ca. 30-60 Sekunden)"
```

**Progress-Anzeige (falls verfügbar):**
```typescript
"Fortschritt: 45%"
```

---

#### **Status: `done`**
**UI:**
- ✅ Erfolgs-Icon
- Reading anzeigen
- "Teilen"-Button
- "PDF exportieren"-Button

**Text:**
```typescript
"Reading erfolgreich generiert!"
```

---

#### **Status: `failed` (final)**
**UI:**
- ❌ Fehler-Icon
- Fehlermeldung anzeigen
- **KEIN** "Erneut versuchen"-Button (max retries erreicht)
- "Support kontaktieren"-Link

**Text:**
```typescript
"Reading konnte nicht generiert werden"
```

**Fehler-Details (erweitert):**
```typescript
"Fehler: {error}"
"Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support."
```

---

#### **Status: `timeout` (retry verfügbar)**
**UI:**
- ⏱️ Timeout-Icon
- Fehlermeldung anzeigen
- **"Erneut versuchen"-Button** prominent
- Retry-Count anzeigen: "Versuch 1 von 3"

**Text:**
```typescript
"Reading-Generierung hat zu lange gedauert"
```

**Button-Text:**
```typescript
"Erneut versuchen (1/3)"
```

**Nach Klick:**
- Button deaktivieren
- Spinner anzeigen
- Status zurück auf `pending` → `generating`

---

#### **Status: `timeout` (max retries erreicht)**
**UI:**
- ❌ Fehler-Icon
- Fehlermeldung anzeigen
- **KEIN** "Erneut versuchen"-Button
- "Support kontaktieren"-Link

**Text:**
```typescript
"Reading konnte nach mehreren Versuchen nicht generiert werden"
```

**Details:**
```typescript
"Wir haben 3 Versuche unternommen, das Reading zu generieren, aber es ist jedes Mal ein Timeout aufgetreten. Bitte kontaktieren Sie den Support."
```

---

#### **Status: `cancelled`**
**UI:**
- 🚫 Abgebrochen-Icon
- Info-Text
- "Neues Reading erstellen"-Button

**Text:**
```typescript
"Reading-Generierung wurde abgebrochen"
```

---

### **5.2 "Erneut versuchen"-Button**

**Sichtbarkeit:**
- ✅ `timeout` + `retry_count < max_retries`
- ✅ `failed` + `retry_count < max_retries` + `errorCode` retry-fähig
- ❌ `done` → Nicht sichtbar
- ❌ `cancelled` → Nicht sichtbar
- ❌ `retry_count >= max_retries` → Nicht sichtbar

**Button-Text:**
```typescript
const getRetryButtonText = (retryCount: number, maxRetries: number) => {
  return `Erneut versuchen (${retryCount + 1}/${maxRetries})`;
};
```

**Button-Action:**
```typescript
const handleRetry = async () => {
  setLoading(true);
  try {
    const response = await fetch(`/api/readings/${readingId}/retry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'User requested retry' })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Status zurücksetzen, Polling neu starten
      setStatus('pending');
      startPolling();
    } else {
      showError(data.error);
    }
  } catch (error) {
    showError('Retry fehlgeschlagen');
  } finally {
    setLoading(false);
  }
};
```

---

### **5.3 Auto-Refresh / Polling**

**Empfehlung:**
- Polling-Intervall: **3 Sekunden** (bei `pending` / `generating`)
- Polling stoppen: Bei `done`, `failed` (final), `cancelled`
- Max Polling-Dauer: **5 Minuten** (dann Timeout anzeigen)

**Code-Beispiel:**
```typescript
const POLLING_INTERVAL_MS = 3000; // 3 Sekunden
const MAX_POLLING_DURATION_MS = 300000; // 5 Minuten

useEffect(() => {
  if (!['pending', 'generating'].includes(status)) {
    return; // Polling stoppen
  }

  const startTime = Date.now();
  const interval = setInterval(async () => {
    // Max Polling-Dauer prüfen
    if (Date.now() - startTime > MAX_POLLING_DURATION_MS) {
      clearInterval(interval);
      setStatus('timeout');
      return;
    }

    // Status abrufen
    const response = await fetch(`/api/readings/${readingId}/status`);
    const data = await response.json();
    
    if (data.success) {
      setStatus(data.status.status);
      
      // Polling stoppen bei finalen Status
      if (!['pending', 'generating'].includes(data.status.status)) {
        clearInterval(interval);
      }
    }
  }, POLLING_INTERVAL_MS);

  return () => clearInterval(interval);
}, [status, readingId]);
```

---

## 🔧 6. Implementierungs-Checkliste

### **Phase 1: Schema-Erweiterung (kritisch)**
- [ ] Migration `014_add_retry_fields_to_reading_jobs.sql` ausführen
- [ ] Migration `013_create_timeout_handler_rpc.sql` ausführen
- [ ] Status-Constraint erweitern: `'timeout'` hinzufügen

### **Phase 2: Timeout-Handler (kritisch)**
- [ ] RPC `check_reading_timeouts()` testen
- [ ] Cron-Job einrichten (pg_cron oder Supabase Edge Function)
- [ ] Request-basierter Timeout-Check in Status-API implementieren

### **Phase 3: Retry-Logik (wichtig)**
- [ ] Retry-Endpoint `POST /api/readings/[id]/retry` implementieren
- [ ] Retry-Validierung (retry-fähige Fehler prüfen)
- [ ] Retry-Count-Incrementierung

### **Phase 4: API-Anpassungen (wichtig)**
- [ ] Status-API erweitern (Timeout-Check, Retry-Info)
- [ ] Error-Codes standardisieren
- [ ] Response-Format vereinheitlichen

### **Phase 5: Frontend-Integration (wichtig)**
- [ ] Status-spezifische UI-Komponenten
- [ ] "Erneut versuchen"-Button
- [ ] Auto-Refresh / Polling
- [ ] Fehler-Meldungen

### **Phase 6: Testing (wichtig)**
- [ ] Timeout-Szenario testen (120 Sekunden warten)
- [ ] Retry-Szenario testen (3 Retries)
- [ ] Max-Retries-Szenario testen
- [ ] Frontend-Polling testen

---

## 📋 7. Zusammenfassung

### **Kernprinzipien:**
1. ✅ **Kein Reading bleibt hängen** → Timeout-Handler (Cron + Request-basiert)
2. ✅ **Jeder Status ist eindeutig** → Klare State Machine
3. ✅ **Retry ist möglich** → Bei retry-fähigen Fehlern
4. ✅ **User sieht immer Feedback** → Status-Updates, Fehlermeldungen
5. ✅ **Keine Breaking Changes** → Kompatibel mit bestehenden Readings

### **Technische Umsetzung:**
- **Timeout:** PostgreSQL RPC + Cron (serverseitig) + Request-Check (clientseitig)
- **Retry:** Derselbe Job-Datensatz, `retry_count` Tracking
- **Status:** Erweitertes Statusmodell mit `timeout`
- **API:** Standardisierte Responses mit `retryAvailable` Flag
- **Frontend:** Status-spezifische UI, Auto-Refresh, Retry-Button

### **Nächste Schritte:**
1. Migrationen ausführen
2. Timeout-Handler implementieren
3. Retry-Endpoint erstellen
4. Frontend anpassen
5. Testing durchführen

---

**Status:** ✅ Konzept vollständig, bereit für Implementierung
