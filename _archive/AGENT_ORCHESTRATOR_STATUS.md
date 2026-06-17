# 🤖 AGENT ORCHESTRATOR - STATUS & IMPLEMENTIERUNG

**Datum:** 8. Januar 2026  
**Status:** ⚠️ Registry vorhanden, Integration fehlt  
**Priorität:** HOCH

---

## 📊 ÜBERSICHT

Der **Agent Orchestrator** ist das Herzstück des C2-Multi-Agent-Systems. Die **Registry** ist bereits vollständig implementiert, aber **nicht integriert** in das Backend-System.

---

## 🔍 IST-ZUSTAND

### **✅ WAS EXISTIERT:**

#### **1. Agent Registry (Vollständig)**

**Pfad:** `/opt/mcp-connection-key/production/agents/registry.ts` (8 KB)

**Definierte Agents:**

| Agent-ID | Name | Kontext | Default Style |
|----------|------|---------|---------------|
| `business` | Business Reading Agent | Entscheidungen, Energieeinsatz, Zusammenarbeit | klar |
| `relationship` | Relationship Reading Agent | Nähe/Distanz, Bindung, Kommunikation | empathisch |
| `crisis` | Crisis Reading Agent | Regulation, Stabilisierung, Orientierung | ruhig |
| `personality` | Personality Reading Agent | Selbstbild, Muster, Entwicklung | ruhig |

**Funktionen:**
- `getAgent(agentId)` - Gibt Agent-Konfiguration zurück
- `isValidAgent(agentId)` - Validiert Agent-ID
- `getSupportedAgents()` - Liste aller verfügbaren Agents

**System-Prompts:**
- ✅ BASE_SYSTEM_PROMPT (B1/B2 Regeln) - Anti-Hallucination
- ✅ Kontext-spezifische Focus-Prompts pro Agent
- ✅ Depth-Support: basic, advanced, professional
- ✅ Style-Support: klar, direkt, ruhig, empathisch

#### **2. Reading Agent (PM2 - AKTIV)**

**Server:** 138.199.237.34  
**Process:** `reading-agent`  
**Script:** `/opt/mcp-connection-key/production/server.js`  
**Status:** ✅ Online (3 Tage Uptime)  
**PID:** 336347  
**Memory:** 88.3 MB  
**Restarts:** 8

**Logs:**
- Error: `/root/.pm2/logs/reading-agent-error.log`
- Out: `/root/.pm2/logs/reading-agent-out.log`

#### **3. Backend Reading Route**

**Pfad:** `/opt/mcp-connection-key/connection-key/routes/reading.js`

**Endpoints:**
- `POST /api/reading/generate` - Generiert Reading via Reading Agent
- `GET /api/reading/:readingId` - Lädt Reading aus Supabase

**Integration:**
```javascript
// Macht Axios Call zum Reading Agent
const response = await axios.post(
  `${READING_AGENT_URL}/reading/generate`,
  { userId, birthDate, birthTime, birthPlace, readingType }
);
```

---

## ❌ WAS FEHLT

### **1. Orchestrator-Service**

**Problem:** Die Registry wird **nicht genutzt**

**Fehlende Komponenten:**
- ❌ Orchestrator Route (`/api/orchestrator/*`)
- ❌ Agent-Selection-Logik (wählt passenden Agent basierend auf Kontext)
- ❌ Task-Queue Management (BullMQ/Redis Integration)
- ❌ Load-Balancing zwischen Agents
- ❌ Agent-Health-Monitoring
- ❌ Fallback-Strategie bei Agent-Failure

**Aktuell:**
```javascript
// ❌ Keine dynamische Agent-Auswahl
const response = await axios.post(`${READING_AGENT_URL}/reading/generate`);
```

**Gewünscht:**
```javascript
// ✅ Orchestrator entscheidet basierend auf Kontext
const response = await axios.post(`${ORCHESTRATOR_URL}/orchestrate`, {
  agentId: 'business', // oder auto-detect
  context: 'business',
  depth: 'advanced',
  style: 'klar',
  chart: chartData
});
```

### **2. Agent-Routes fehlen**

**Problem:** Endpoints aus Registry existieren nicht

**Registry definiert:**
```typescript
endpoint: '/api/coach/agents/reading-business'
endpoint: '/api/coach/agents/reading-relationship'
endpoint: '/api/coach/agents/reading-crisis'
endpoint: '/api/coach/agents/reading-personality'
```

**Diese Routes sind NICHT implementiert!**

### **3. Task-Queue-System fehlt**

**Problem:** Keine asynchrone Job-Verarbeitung

**Benötigt:**
- BullMQ Job-Queue
- Redis als Queue-Backend (✅ bereits installiert!)
- Worker für jeden Agent-Typ
- Job-Status-Tracking
- Retry-Logik bei Fehlern

### **4. Production Server läuft isoliert**

**Problem:** `/opt/mcp-connection-key/production/server.js` ist separate Instanz

**Aktuell:**
- PM2 Process läuft eigenständig
- Keine Integration mit `connection-key` Container
- Nutzt eigenes Node.js Environment
- Kein Zugriff auf Docker-Services (Redis, N8N)

**Ideal:**
- Orchestrator als Teil des `connection-key` Containers
- Oder: Eigener `orchestrator` Container in docker-compose.yml

---

## 🏗️ ARCHITEKTUR (IST)

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (Server 167)                  │
│  /app/api/coach/readings/route.ts                       │
│  ❌ Nutzt LOKALE Chart-Calculation                      │
│  ❌ Generiert Readings SELBST                           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              CONNECTION-KEY BACKEND (Server 138)         │
│  /connection-key/routes/reading.js                      │
│  ✅ POST /api/reading/generate                          │
│  → axios.post(READING_AGENT_URL/reading/generate)       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│           READING AGENT (PM2 - Server 138)              │
│  /production/server.js                                  │
│  ✅ Läuft seit 3 Tagen                                  │
│  ❌ Nutzt NICHT die Agent Registry                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   AGENT REGISTRY                         │
│  /production/agents/registry.ts                         │
│  ✅ 4 Agents definiert                                  │
│  ✅ System-Prompts vorhanden                            │
│  ❌ WIRD NICHT GENUTZT                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 ARCHITEKTUR (SOLL)

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (Server 167)                  │
│  /app/api/coach/readings/route.ts                       │
│  ✅ Macht API-Call zu Backend Orchestrator              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│       AGENT ORCHESTRATOR (connection-key Container)      │
│  /connection-key/routes/orchestrator.js                 │
│                                                          │
│  ✅ POST /api/orchestrator/execute                      │
│  ✅ Lädt Agent aus Registry                             │
│  ✅ Erstellt BullMQ Job                                 │
│  ✅ Returned Job-ID                                     │
│                                                          │
│  ✅ GET /api/orchestrator/status/:jobId                 │
│  ✅ Tracked Job-Status                                  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   REDIS QUEUE (Docker)                   │
│  ✅ Container läuft                                     │
│  ✅ Port 6379                                           │
│  → BullMQ Jobs                                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              AGENT WORKERS (PM2 / Docker)                │
│                                                          │
│  Worker 1: Business Agent    ┌──────────────────┐      │
│  Worker 2: Relationship      │  Agent Registry  │      │
│  Worker 3: Crisis            │  registry.ts     │      │
│  Worker 4: Personality       └──────────────────┘      │
│                                                          │
│  ✅ Holen Jobs aus Queue                                │
│  ✅ Nutzen System-Prompts aus Registry                  │
│  ✅ Speichern Result in Supabase                        │
│  ✅ Updaten Job-Status                                  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     SUPABASE                             │
│  ✅ coach_readings Tabelle                              │
│  ✅ Job-Status-Tracking                                 │
│  ✅ Result-Storage                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 IMPLEMENTIERUNGS-PLAN

### **Phase 1: Orchestrator-Route (2-3h)**

**Ziel:** Basis-Orchestrator implementieren

**Tasks:**
1. ✅ Neue Datei: `/opt/mcp-connection-key/connection-key/routes/orchestrator.js`
2. ✅ Import Agent Registry: `import { getAgent, isValidAgent } from '../../production/agents/registry.ts'`
3. ✅ Endpoint: `POST /api/orchestrator/execute`
   - Validiert `agentId`, `context`, `depth`, `style`
   - Lädt Agent-Config aus Registry
   - Erstellt Job in BullMQ Queue
   - Returns Job-ID
4. ✅ Endpoint: `GET /api/orchestrator/status/:jobId`
   - Prüft Job-Status in Queue
   - Returns: pending, processing, completed, failed
5. ✅ Endpoint: `GET /api/orchestrator/result/:jobId`
   - Holt Ergebnis aus Supabase
   - Returns Reading-Content
6. ✅ Registrierung in `server.js`:
   ```javascript
   import { orchestratorRouter } from "./routes/orchestrator.js";
   apiRouter.use("/orchestrator", orchestratorRouter);
   ```

**Dateien:**
- `/connection-key/routes/orchestrator.js` (neu)
- `/connection-key/server.js` (update)

---

### **Phase 2: BullMQ Integration (2-3h)**

**Ziel:** Job-Queue für asynchrone Verarbeitung

**Tasks:**
1. ✅ NPM Packages installieren:
   ```bash
   npm install bullmq ioredis
   ```
2. ✅ Queue-Config: `/connection-key/queue/config.js`
   ```javascript
   import { Queue } from 'bullmq';
   export const readingQueue = new Queue('readings', {
     connection: { host: 'redis-queue', port: 6379 }
   });
   ```
3. ✅ Job-Creator in Orchestrator:
   ```javascript
   const job = await readingQueue.add('generate-reading', {
     agentId, context, depth, style, chart, userId
   });
   ```
4. ✅ Job-Status-Tracking:
   ```javascript
   const job = await readingQueue.getJob(jobId);
   const state = await job.getState();
   ```

**Dateien:**
- `/connection-key/queue/config.js` (neu)
- `/connection-key/queue/workers.js` (neu)
- `package.json` (update)

---

### **Phase 3: Agent Workers (2-3h)**

**Ziel:** Worker-Prozesse für jeden Agent-Typ

**Tasks:**
1. ✅ Worker-Implementierung: `/connection-key/queue/workers.js`
   ```javascript
   import { Worker } from 'bullmq';
   import { getAgent } from '../../production/agents/registry.ts';
   
   const readingWorker = new Worker('readings', async (job) => {
     const { agentId, chart, context, depth, style } = job.data;
     const agent = getAgent(agentId);
     
     // OpenAI Call mit agent.systemPrompt
     const reading = await generateReading(agent, chart, context);
     
     // Speichern in Supabase
     await saveReading(reading);
     
     return { success: true, readingId: reading.id };
   });
   ```
2. ✅ PM2 Ecosystem-File: `/opt/mcp-connection-key/ecosystem.config.js`
   ```javascript
   module.exports = {
     apps: [
       {
         name: 'reading-worker',
         script: './connection-key/queue/workers.js',
         instances: 4, // 1 pro Agent-Typ
         exec_mode: 'cluster'
       }
     ]
   };
   ```
3. ✅ Worker-Start:
   ```bash
   pm2 start ecosystem.config.js
   ```

**Dateien:**
- `/connection-key/queue/workers.js` (neu)
- `/opt/mcp-connection-key/ecosystem.config.js` (neu)

---

### **Phase 4: Frontend-Integration (1-2h)**

**Ziel:** Frontend nutzt Orchestrator statt lokale Calculation

**Tasks:**
1. ✅ Update: `/opt/hd-app/The-Connection-Key/frontend/app/api/coach/readings/route.ts`
   ```typescript
   // ALT:
   const chart = await calculateHumanDesignChart(input);
   const reading = await generateReading(chart);
   
   // NEU:
   const response = await fetch('https://mcp.the-connection-key.de/api/orchestrator/execute', {
     method: 'POST',
     body: JSON.stringify({
       agentId: 'business',
       context: 'business',
       depth: 'advanced',
       style: 'klar',
       userId, birthDate, birthTime, birthPlace
     })
   });
   const { jobId } = await response.json();
   
   // Poll Status
   const statusResponse = await fetch(`/api/orchestrator/status/${jobId}`);
   ```
2. ✅ Entfernen lokaler Imports:
   - ❌ `import { calculateHumanDesignChart } from '@/lib/astro/chartCalculation'`
   - ❌ `import { analyzeConnectionKeys } from '@/lib/human-design/connection-key-engine'`
3. ✅ Tests durchführen

**Dateien:**
- `/opt/hd-app/The-Connection-Key/frontend/app/api/coach/readings/route.ts` (update)

---

### **Phase 5: Testing & Monitoring (1h)**

**Tasks:**
1. ✅ Test-Script: `/opt/mcp-connection-key/test_orchestrator.py`
2. ✅ Queue-Monitoring:
   ```bash
   # BullMQ Dashboard (optional)
   npm install -g bull-board
   bull-board --redis redis://localhost:6379
   ```
3. ✅ PM2 Monitoring:
   ```bash
   pm2 monit
   pm2 logs reading-worker
   ```
4. ✅ Supabase Job-Logs prüfen

---

## 📊 ZEITPLAN

| Phase | Beschreibung | Zeit | Status |
|-------|--------------|------|--------|
| 1 | Orchestrator-Route | 2-3h | ⏳ Pending |
| 2 | BullMQ Integration | 2-3h | ⏳ Pending |
| 3 | Agent Workers | 2-3h | ⏳ Pending |
| 4 | Frontend-Integration | 1-2h | ⏳ Pending |
| 5 | Testing & Monitoring | 1h | ⏳ Pending |

**Gesamt:** 8-12 Stunden

---

## 🔗 ABHÄNGIGKEITEN

**Benötigt:**
- ✅ Redis Queue (läuft bereits)
- ✅ Agent Registry (existiert)
- ✅ Supabase coach_readings Tabelle (vorhanden)
- ✅ Chart-Truth-Service (produktiv)
- ⏳ TypeScript-Support in connection-key Container (bereits vorhanden via tsx)

**Optional:**
- BullMQ Dashboard (für Monitoring)
- Prometheus/Grafana (für Metriken)
- Sentry (für Error-Tracking)

---

## ⚠️ KRITISCHE PUNKTE

### **1. Production Server Migration**

**Problem:** Reading Agent läuft als PM2 außerhalb von Docker

**Optionen:**
- **A:** PM2 weiter nutzen (Workers als PM2 Processes)
- **B:** Alles in Docker (orchestrator + workers als Container)
- **C:** Hybrid (Orchestrator in Docker, Workers als PM2)

**Empfehlung:** Option C (am wenigsten disruptiv)

### **2. TypeScript-Imports**

**Problem:** Registry ist `.ts`, Container nutzt `tsx`

**Lösung:** Bereits gelöst - `tsx` kann `.ts` direkt importieren

### **3. Redis Connection**

**Problem:** Docker Container vs. Host-Network

**Lösung:**
- Docker: `redis://redis-queue:6379`
- PM2: `redis://localhost:6379` (via Docker Port-Mapping)

---

## 📈 ERFOLGS-METRIKEN

**Nach Implementierung:**
- ✅ Frontend nutzt Orchestrator-API (nicht lokale Calculation)
- ✅ 4 Agent-Types verfügbar (business, relationship, crisis, personality)
- ✅ Job-Queue funktioniert (Redis + BullMQ)
- ✅ Worker generieren Readings basierend auf Registry-Prompts
- ✅ Readings werden in Supabase gespeichert
- ✅ Monitoring zeigt Queue-Status

---

## 📚 SIEHE AUCH

- `STATUS_AKTUELL_2026-01-08.md` - Vollständiger System-Status
- `CHART_TRUTH_SERVICE_DEPLOYED.md` - Chart-Service (Abhängigkeit)
- `/opt/mcp-connection-key/production/agents/registry.ts` - Agent-Definitionen
- `/opt/mcp-connection-key/production/agents/README.md` - C2-Strategie Dokumentation

---

**Status:** ⏳ Bereit für Implementierung  
**Priorität:** HOCH  
**Nächster Schritt:** Phase 1 - Orchestrator-Route  
**Letztes Update:** 8. Januar 2026
