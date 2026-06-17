# 🚀 MIGRATION: CHART + READING AUF HETZNER MCP

**Datum:** 8. Januar 2026  
**Ziel:** Chart-Berechnung + Reading-Generierung BEIDE auf Hetzner MCP (138) auslagern  
**Zeitaufwand:** 6-8 Stunden

---

## 🎯 WARUM BEIDE ZUSAMMEN?

### **AKTUELL (IST):**

```
User → Frontend (167)
         ↓
    1. Chart berechnen (astronomy-engine) ⏱️ 2-5 Sek
         ↓
    2. Reading generieren (OpenAI) ⏱️ 30-60 Sek
         ↓
    Frontend ist 35-65 Sekunden blockiert! ❌
```

**PROBLEME:**
- ❌ Frontend-Server (167) macht BEIDE rechenintensiven Aufgaben
- ❌ Astronomy-Engine Berechnung (2-5 Sek)
- ❌ OpenAI Reading-Generierung (30-60 Sek)
- ❌ Server 167 ist 35-65 Sekunden pro Request blockiert
- ❌ Nicht skalierbar

---

### **OPTIMIERT (SOLL):**

```
User → Frontend (167)
         ↓
    Sendet nur: { birthDate, birthTime, birthPlace }
         ↓ (Job in Queue = 50ms)
    Frontend gibt sofort Response: "Job queued" ✅
         ↓

[HETZNER MCP 138]
         ↓
    Job-Worker holt Job
         ↓
    1. Chart berechnen (astronomy-engine) ⏱️ 2-5 Sek
         ↓
    2. Reading generieren (OpenAI) ⏱️ 30-60 Sek
         ↓
    Alles auf Hetzner! Frontend entlastet! ✅
         ↓
    Ergebnis in Supabase speichern
         ↓
    Frontend pollt Status: "completed"
```

**VORTEILE:**
- ✅ Frontend-Server (167) **KOMPLETT entlastet**
- ✅ User bekommt **sofort** Feedback (50ms statt 65 Sekunden!)
- ✅ Hetzner MCP hat mehr Rechenleistung
- ✅ Reading Agent läuft schon auf Hetzner (PM2)
- ✅ **Skalierbar**: Mehrere Jobs parallel
- ✅ **Ein** Worker macht beides (Chart + Reading)

---

## 📋 IMPLEMENTIERUNGSPLAN

### **PHASE 1: INFRASTRUKTUR (1-2 Std)**

#### **1.1 Redis + BullMQ installieren**

```bash
# Auf Hetzner Server 138
cd /opt/mcp-connection-key

# docker-compose.yml erweitern:
```

```yaml
services:
  redis:
    image: redis:7-alpine
    container_name: redis
    ports:
      - "6379:6379"
    volumes:
      - ./redis-data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped
```

```bash
# Container starten
docker-compose up -d redis

# Testen
docker exec -it redis redis-cli ping
# → PONG ✅
```

#### **1.2 BullMQ + Dependencies installieren**

```bash
cd /opt/mcp-connection-key/connection-key

# Package installieren
npm install bullmq ioredis
npm install @supabase/supabase-js  # Falls noch nicht installiert

# Astronomy-Engine installieren
npm install astronomy-engine
```

---

### **PHASE 2: CHART-CALCULATION AUF HETZNER (2-3 Std)**

#### **2.1 Chart Library von Server 167 kopieren**

```bash
# Von Server 167 Chart-Calculation Library holen
scp -r root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/lib/astro \
       /opt/mcp-connection-key/connection-key/lib/

# Struktur prüfen
ls -la /opt/mcp-connection-key/connection-key/lib/astro/
# → chartCalculation.ts (oder .js)
# → weitere Astro-Dateien
```

#### **2.2 Chart-Route auf Hetzner erstellen**

**Datei:** `/opt/mcp-connection-key/connection-key/routes/chart.js`

```javascript
import express from 'express';
import { calculateHumanDesignChart } from '../lib/astro/chartCalculation.js';

const router = express.Router();

/**
 * POST /api/chart/calculate
 * Berechnet Human Design Chart mit astronomy-engine
 */
router.post('/calculate', async (req, res, next) => {
  try {
    const { birthDate, birthTime, birthPlace } = req.body;

    // Validation
    if (!birthDate || !birthTime) {
      return res.status(400).json({
        error: 'Birth date and time are required'
      });
    }

    // Chart berechnen
    const chart = await calculateHumanDesignChart({
      birthDate,
      birthTime,
      birthPlace
    });

    res.json({
      success: true,
      chart: {
        id: `chart-${Date.now()}`,
        ...chart,
        createdAt: new Date().toISOString()
      },
      source: 'astronomy-engine'
    });

  } catch (error) {
    next(error);
  }
});

export default router;
```

#### **2.3 Chart-Route in Server registrieren**

**Datei:** `/opt/mcp-connection-key/connection-key/server.js`

```javascript
import chartRoutes from './routes/chart.js';

// Routes registrieren
app.use('/api/chart', chartRoutes);
```

---

### **PHASE 3: JOB-WORKER IMPLEMENTIEREN (2-3 Std)**

#### **3.1 Job-Worker erstellen**

**Datei:** `/opt/mcp-connection-key/connection-key/workers/reading-worker.js`

```javascript
import { Queue, Worker } from 'bullmq';
import { supabase } from '../config.js';
import { calculateHumanDesignChart } from '../lib/astro/chartCalculation.js';
import axios from 'axios';

// Queue definieren
export const readingQueue = new Queue('reading-jobs', {
  connection: {
    host: 'localhost',
    port: 6379
  }
});

// Worker: Chart + Reading BEIDE verarbeiten
export const readingWorker = new Worker('reading-jobs', async (job) => {
  const { readingId, userId, birthDate, birthTime, birthPlace, readingType } = job.data;

  console.log(`📋 Processing Job ${readingId}: Chart + Reading`);

  try {
    // ═══════════════════════════════════════════════════════════
    // SCHRITT 1: STATUS AUF "PROCESSING"
    // ═══════════════════════════════════════════════════════════
    await supabase
      .from('reading_jobs')
      .update({ 
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .eq('id', readingId);

    // ═══════════════════════════════════════════════════════════
    // SCHRITT 2: CHART BERECHNEN (2-5 Sekunden)
    // ═══════════════════════════════════════════════════════════
    console.log(`📊 Calculating chart for ${readingId}...`);
    
    const chart = await calculateHumanDesignChart({
      birthDate,
      birthTime,
      birthPlace
    });

    console.log(`✅ Chart calculated: Type ${chart.type}, Profile ${chart.profile}`);

    // Chart in Supabase speichern (optional)
    const { data: chartData } = await supabase
      .from('charts')
      .insert({
        user_id: userId,
        birth_date: birthDate,
        birth_time: birthTime,
        birth_place: birthPlace,
        chart_data: chart
      })
      .select()
      .single();

    // ═══════════════════════════════════════════════════════════
    // SCHRITT 3: READING GENERIEREN (30-60 Sekunden)
    // ═══════════════════════════════════════════════════════════
    console.log(`📝 Generating reading for ${readingId}...`);

    const response = await axios.post('http://localhost:4000/generate', {
      readingId,
      userId,
      chartData: chart,
      readingType: readingType || 'personality'
    }, {
      timeout: 120000 // 2 Minuten Timeout
    });

    const readingContent = response.data.reading;

    console.log(`✅ Reading generated: ${readingContent.length} chars`);

    // ═══════════════════════════════════════════════════════════
    // SCHRITT 4: READING IN SUPABASE SPEICHERN
    // ═══════════════════════════════════════════════════════════
    await supabase
      .from('coach_readings')
      .update({
        content: readingContent,
        chart_id: chartData?.id,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', readingId);

    // ═══════════════════════════════════════════════════════════
    // SCHRITT 5: JOB ALS "COMPLETED" MARKIEREN
    // ═══════════════════════════════════════════════════════════
    await supabase
      .from('reading_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        result: {
          chartId: chartData?.id,
          readingLength: readingContent.length
        }
      })
      .eq('id', readingId);

    console.log(`🎉 Job ${readingId} COMPLETED!`);

  } catch (error) {
    console.error(`❌ Job ${readingId} FAILED:`, error);

    // Fehler in Supabase speichern
    await supabase
      .from('reading_jobs')
      .update({
        status: 'failed',
        error: error.message,
        failed_at: new Date().toISOString()
      })
      .eq('id', readingId);

    throw error;
  }
}, {
  connection: {
    host: 'localhost',
    port: 6379
  },
  concurrency: 3, // Bis zu 3 Jobs parallel
  limiter: {
    max: 10, // Max 10 Jobs
    duration: 60000 // pro Minute
  }
});

// Error Handler
readingWorker.on('failed', (job, err) => {
  console.error(`❌ Worker failed job ${job.id}:`, err.message);
});

readingWorker.on('completed', (job) => {
  console.log(`✅ Worker completed job ${job.id}`);
});

console.log('🚀 Reading Worker started (Chart + Reading)');
```

#### **3.2 Worker Starter Script**

**Datei:** `/opt/mcp-connection-key/connection-key/start-worker.js`

```javascript
import { readingWorker } from './workers/reading-worker.js';

console.log('🚀 Starting Reading Worker...');

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('⏹️ Shutting down worker...');
  await readingWorker.close();
  process.exit(0);
});
```

#### **3.3 PM2 Konfiguration für Worker**

```bash
# Worker mit PM2 starten
pm2 start /opt/mcp-connection-key/connection-key/start-worker.js --name reading-worker

# Auto-Start aktivieren
pm2 save
```

---

### **PHASE 4: API-ROUTE FÜR JOB-ERSTELLUNG (1 Std)**

#### **4.1 Job-Erstellung Route auf Hetzner**

**Datei:** `/opt/mcp-connection-key/connection-key/routes/reading.js`

Erweitern um:

```javascript
import { readingQueue } from '../workers/reading-worker.js';

/**
 * POST /api/reading/generate
 * Erstellt Job für Chart-Berechnung + Reading-Generierung
 */
router.post('/generate', async (req, res, next) => {
  try {
    const { userId, birthDate, birthTime, birthPlace, readingType } = req.body;

    // Validation
    if (!userId || !birthDate || !birthTime) {
      return res.status(400).json({
        error: 'userId, birthDate, and birthTime are required'
      });
    }

    // Reading-Job in Supabase anlegen
    const { data: reading, error } = await supabase
      .from('coach_readings')
      .insert({
        user_id: userId,
        reading_type: readingType || 'personality',
        status: 'queued'
      })
      .select()
      .single();

    if (error) throw error;

    // Reading-Job eintragen
    const { data: job } = await supabase
      .from('reading_jobs')
      .insert({
        reading_id: reading.id,
        user_id: userId,
        status: 'queued',
        queued_at: new Date().toISOString()
      })
      .select()
      .single();

    // Job in Redis Queue legen
    await readingQueue.add('generate-reading', {
      readingId: reading.id,
      userId,
      birthDate,
      birthTime,
      birthPlace,
      readingType
    });

    console.log(`📋 Job queued: ${reading.id}`);

    // Sofortige Response (50ms!)
    res.json({
      success: true,
      readingId: reading.id,
      jobId: job.id,
      status: 'queued',
      message: 'Chart-Berechnung und Reading-Generierung gestartet',
      estimatedTime: '30-60 Sekunden'
    });

  } catch (error) {
    next(error);
  }
});
```

---

### **PHASE 5: FRONTEND ANPASSEN (1-2 Std)**

#### **5.1 Frontend API-Route ändern**

**Server 167:** `/opt/hd-app/The-Connection-Key/frontend/app/api/coach/readings-v2/create/route.ts`

**VORHER:**
```typescript
// Chart lokal berechnen
const chart = await calculateHumanDesignChart({ birthDate, birthTime, birthPlace });

// Reading lokal generieren
const reading = await generateReading(chart);
```

**NACHHER:**
```typescript
export async function POST(request: NextRequest) {
  const { userId, birthDate, birthTime, birthPlace, readingType } = await request.json();

  // Job an Hetzner MCP senden (50ms!)
  const response = await fetch('https://mcp.the-connection-key.de/api/reading/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.MCP_API_KEY || ''
    },
    body: JSON.stringify({
      userId,
      birthDate,
      birthTime,
      birthPlace,
      readingType
    })
  });

  const { readingId, jobId, status } = await response.json();

  // Sofort zurück zum User!
  return NextResponse.json({
    success: true,
    readingId,
    jobId,
    status: 'queued',
    message: 'Dein Reading wird generiert...',
    pollUrl: `/api/coach/readings-v2/${readingId}/status`
  });
}
```

#### **5.2 Status-Polling Endpoint**

**Datei:** `/opt/hd-app/The-Connection-Key/frontend/app/api/coach/readings-v2/[id]/status/route.ts`

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const readingId = params.id;

  // Status von Supabase holen
  const { data: reading } = await supabase
    .from('coach_readings')
    .select('id, status, completed_at')
    .eq('id', readingId)
    .single();

  return NextResponse.json({
    readingId,
    status: reading?.status || 'unknown',
    completed: reading?.status === 'completed',
    completedAt: reading?.completed_at
  });
}
```

#### **5.3 Frontend React Component mit Polling**

```typescript
'use client';

import { useEffect, useState } from 'react';

export function ReadingGenerator() {
  const [readingId, setReadingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const [reading, setReading] = useState<any>(null);

  // Polling alle 2 Sekunden
  useEffect(() => {
    if (!readingId || status === 'completed') return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/coach/readings-v2/${readingId}/status`);
      const data = await res.json();

      setStatus(data.status);

      if (data.completed) {
        clearInterval(interval);
        // Reading laden
        loadReading(readingId);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [readingId, status]);

  const createReading = async () => {
    const res = await fetch('/api/coach/readings-v2/create', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'user-123',
        birthDate: '1990-01-01',
        birthTime: '12:00',
        birthPlace: { name: 'Berlin', latitude: 52.52, longitude: 13.40 }
      })
    });

    const data = await res.json();
    setReadingId(data.readingId);
    setStatus('queued');
  };

  return (
    <div>
      <button onClick={createReading}>Reading erstellen</button>
      
      {status === 'queued' && <p>⏳ In Warteschlange...</p>}
      {status === 'processing' && <p>⚙️ Wird generiert...</p>}
      {status === 'completed' && <p>✅ Fertig!</p>}
      
      {reading && <div>{reading.content}</div>}
    </div>
  );
}
```

---

## 📊 ARCHITEKTUR ÜBERSICHT

```
┌─────────────────────────────────────────────────────────────┐
│  USER (Browser)                                             │
│  Geburtsdaten eingeben                                      │
└────────────┬────────────────────────────────────────────────┘
             │
             │ 1. POST /api/coach/readings-v2/create
             │    Body: { birthDate, birthTime, birthPlace }
             ▼
┌────────────────────────────────────────────────────────────┐
│  CK-APP FRONTEND (Server 167)                              │
│  Next.js API Route                                         │
│                                                             │
│  ✅ Empfängt Geburtsdaten                                  │
│  ✅ Sendet an Hetzner MCP                                  │
│  ✅ Response in 50ms: "Job queued" (SOFORT FERTIG!)        │
└────────────┬────────────────────────────────────────────────┘
             │
             │ 2. POST https://mcp.the-connection-key.de/api/reading/generate
             │    Body: { birthDate, birthTime, birthPlace }
             ▼
┌────────────────────────────────────────────────────────────┐
│  HETZNER MCP (Server 138)                                  │
│  Connection-Key Server                                     │
│                                                             │
│  ✅ Empfängt Geburtsdaten                                  │
│  ✅ Legt Job in Redis Queue                                │
│  ✅ Response: { readingId, jobId, status: "queued" }       │
└────────────┬────────────────────────────────────────────────┘
             │
             │ 3. Worker holt Job aus Queue
             ▼
┌────────────────────────────────────────────────────────────┐
│  JOB WORKER (Hetzner 138) - PM2                            │
│  BullMQ Worker (Node.js)                                   │
│                                                             │
│  SCHRITT 1: Chart berechnen (astronomy-engine)             │
│              ⏱️ 2-5 Sekunden                               │
│              ✅ Chart-Daten erstellt                       │
│                                                             │
│  SCHRITT 2: Reading generieren (OpenAI)                    │
│              ⏱️ 30-60 Sekunden                             │
│              ✅ Reading-Text erstellt                      │
│                                                             │
│  SCHRITT 3: In Supabase speichern                          │
│              ✅ Status: "completed"                        │
└────────────┬────────────────────────────────────────────────┘
             │
             │ 4. Frontend pollt Status (alle 2 Sek)
             ▼
┌────────────────────────────────────────────────────────────┐
│  USER (Browser)                                             │
│  React Component                                            │
│                                                             │
│  ⏳ "In Warteschlange..." (status: queued)                 │
│  ⚙️ "Wird generiert..." (status: processing)               │
│  ✅ "Fertig!" (status: completed)                          │
│  📄 Reading anzeigen                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## ⏱️ ZEITAUFWAND

| Phase | Aufgabe | Zeit |
|-------|---------|------|
| 1 | Redis + BullMQ Installation | 1 Std |
| 2 | Chart-Calculation auf Hetzner | 2-3 Std |
| 3 | Job-Worker implementieren | 2-3 Std |
| 4 | API-Route für Jobs | 1 Std |
| 5 | Frontend anpassen | 1-2 Std |
| 6 | Testing | 1 Std |
| **GESAMT** | | **6-8 Std** |

---

## 🎯 VORTEILE DIESER LÖSUNG

| Vorteil | Beschreibung |
|---------|--------------|
| ✅ **Frontend entlastet** | Server 167 macht nur noch API-Weiterleitung (50ms) |
| ✅ **User Experience** | User bekommt sofort Feedback, kein 65-Sekunden-Freeze |
| ✅ **Skalierbar** | Worker können parallel arbeiten (Concurrency: 3) |
| ✅ **Wartbar** | Ein Worker macht Chart + Reading (kein Splitting) |
| ✅ **Monitoring** | Job-Status in Supabase verfolgbar |
| ✅ **Fehlerbehandlung** | Failed Jobs werden markiert und können retry |
| ✅ **Ressourcen** | Hetzner MCP hat mehr Power als Frontend-Server |

---

## 🚀 NÄCHSTER SCHRITT

**Soll ich jetzt mit der Implementierung beginnen?**

1. ✅ Redis + BullMQ auf Hetzner installieren
2. ✅ Chart-Calculation Library kopieren
3. ✅ Job-Worker implementieren
4. ✅ Frontend API anpassen

**Bereit? Los geht's!** 🎯
