# 🔧 Alle Server-Konfigurationen - Vollständige Übersicht

## 📍 Server-Übersicht

### Hetzner Server (138.199.237.34)
- **MCP Server:** Port 7000
- **Reading Agent:** Port 4001
- **n8n:** Port 5678
- **Verzeichnis:** `/opt/mcp-connection-key`

### CK-App Server (167.235.224.149)
- **Frontend:** Next.js App
- **Verzeichnis:** `/opt/hd-app/The-Connection-Key/frontend`
- **Router:** App Router (`app/` Verzeichnis)

---

## 🔍 Problem-Analyse: Deploy funktioniert nicht

### Mögliche Ursachen:

1. **Router-Typ Mismatch:**
   - Lokale Dateien: Pages Router (`pages/api/...`)
   - App Server: App Router (`app/api/...`)
   - **Problem:** Dateien passen nicht zum Router-Typ

2. **API-Route Format-Unterschied:**
   - Pages Router: `export default async function handler(req, res)`
   - App Router: `export async function POST(request: Request)`

3. **Environment Variables:**
   - Unterschiedliche Variablennamen
   - Fehlende Variablen auf Server

4. **Pfad-Unterschiede:**
   - Lokal: `integration/api-routes/agents-automation.ts`
   - Server: `app/api/agents/automation/route.ts` (App Router)
   - Server: `pages/api/agents/automation.ts` (Pages Router)

---

## 📋 Alle API-Route Konfigurationen

### 1. Automation Agent

**Lokale Datei:** `integration/api-routes/agents-automation.ts`

```typescript
// Pages Router Format
import type { NextApiRequest, NextApiResponse } from 'next';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const AGENT_ID = 'automation';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // POST /api/agents/automation
  const response = await fetch(`${MCP_SERVER_URL}/agent/${AGENT_ID}`, {
    method: 'POST',
    body: JSON.stringify({ message, userId })
  });
}
```

**App Router Format (benötigt auf Server):**

```typescript
// app/api/agents/automation/route.ts
import { NextRequest, NextResponse } from 'next/server';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const AGENT_ID = 'automation';

export async function POST(request: NextRequest) {
  const { message, userId } = await request.json();
  
  const response = await fetch(`${MCP_SERVER_URL}/agent/${AGENT_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, userId })
  });
  
  return NextResponse.json(await response.json());
}
```

**Server-Pfad (App Router):**
- `frontend/app/api/agents/automation/route.ts`

**Server-Pfad (Pages Router):**
- `frontend/pages/api/agents/automation.ts`

---

### 2. Marketing Agent

**Lokale Datei:** `integration/api-routes/agents-marketing.ts`

```typescript
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const AGENT_ID = 'marketing';
```

**Server-Pfad (App Router):**
- `frontend/app/api/agents/marketing/route.ts`

**Server-Pfad (Pages Router):**
- `frontend/pages/api/agents/marketing.ts`

---

### 3. Sales Agent

**Lokale Datei:** `integration/api-routes/agents-sales.ts`

```typescript
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const AGENT_ID = 'sales';
```

**Server-Pfad (App Router):**
- `frontend/app/api/agents/sales/route.ts`

**Server-Pfad (Pages Router):**
- `frontend/pages/api/agents/sales.ts`

---

### 4. Social-YouTube Agent

**Lokale Datei:** `integration/api-routes/agents-social-youtube.ts`

```typescript
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const AGENT_ID = 'social-youtube';
```

**Server-Pfad (App Router):**
- `frontend/app/api/agents/social-youtube/route.ts`

**Server-Pfad (Pages Router):**
- `frontend/pages/api/agents/social-youtube.ts`

---

### 5. Chart Agent

**Lokale Datei:** `integration/api-routes/agents-chart-development.ts`

```typescript
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const AGENT_ID = 'chart-development';
```

**Server-Pfad (App Router):**
- `frontend/app/api/agents/chart/route.ts`

**Server-Pfad (Pages Router):**
- `frontend/pages/api/agents/chart.ts`

---

### 6. Reading Generate

**Lokale Datei:** `integration/api-routes/readings-generate.ts`

```typescript
// Pages Router Format
const READING_AGENT_URL = process.env.READING_AGENT_URL || 'http://138.199.237.34:4001';

export default async function handler(req, res) {
  // POST /api/readings/generate
  const response = await fetch(`${READING_AGENT_URL}/reading/generate`, {
    method: 'POST',
    body: JSON.stringify({ birthDate, birthTime, birthPlace, readingType })
  });
}
```

**App Router Format (benötigt auf Server):**

```typescript
// app/api/reading/generate/route.ts (singular!)
// ODER app/api/readings/generate/route.ts (plural)
import { NextRequest, NextResponse } from 'next/server';

const READING_AGENT_URL = process.env.READING_AGENT_URL || 'http://138.199.237.34:4001';

export async function POST(request: NextRequest) {
  const { birthDate, birthTime, birthPlace, readingType } = await request.json();
  
  const response = await fetch(`${READING_AGENT_URL}/reading/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ birthDate, birthTime, birthPlace, readingType })
  });
  
  return NextResponse.json(await response.json());
}
```

**Server-Pfad (App Router):**
- `frontend/app/api/reading/generate/route.ts` (singular - bereits vorhanden!)
- `frontend/app/api/readings/generate/route.ts` (plural - möglicherweise benötigt)

**Server-Pfad (Pages Router):**
- `frontend/pages/api/readings/generate.ts`

---

## 🔧 Environment Variables

### Auf CK-App Server benötigt:

**Datei:** `frontend/.env.local`

```bash
# MCP Server (Hetzner)
MCP_SERVER_URL=http://138.199.237.34:7000
NEXT_PUBLIC_MCP_SERVER_URL=http://138.199.237.34:7000

# Reading Agent (Hetzner)
READING_AGENT_URL=http://138.199.237.34:4001
NEXT_PUBLIC_READING_AGENT_URL=http://138.199.237.34:4001

# CK Agent (Fallback)
CK_AGENT_URL=http://localhost:3000/api/ck-agent
NEXT_PUBLIC_CK_AGENT_URL=http://localhost:3000/api/ck-agent

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 🚨 Hauptproblem: Router-Typ Mismatch

### Problem:

**Lokale Dateien:** Pages Router Format
```typescript
// integration/api-routes/agents-automation.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) { ... }
```

**App Server:** App Router (laut Prüfung)
```
frontend/app/api/agents/automation/route.ts
```

**Benötigtes Format für App Router:**
```typescript
// app/api/agents/automation/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ ... });
}
```

---

## ✅ Lösung: Konvertierung Script erstellen

### Option 1: App Router Versionen erstellen

Erstelle konvertierte Versionen für App Router:

**Dateien erstellen:**
- `integration/api-routes/app-router/agents-automation/route.ts`
- `integration/api-routes/app-router/agents-marketing/route.ts`
- `integration/api-routes/app-router/agents-sales/route.ts`
- `integration/api-routes/app-router/agents-social-youtube/route.ts`
- `integration/api-routes/app-router/agents-chart/route.ts`
- `integration/api-routes/app-router/reading/generate/route.ts`

### Option 2: Installations-Script anpassen

Das Script muss:
1. Router-Typ erkennen (App vs Pages)
2. Dateien entsprechend konvertieren
3. Richtige Pfade verwenden

---

## 📊 Vergleich: Was ist auf dem Server?

### Laut Prüfung vorhanden:

**App Router (bestätigt):**
- ✅ `frontend/app/api/agents/automation/route.ts`
- ✅ `frontend/app/api/agents/marketing/route.ts`
- ✅ `frontend/app/api/agents/sales/route.ts`
- ✅ `frontend/app/api/agents/social-youtube/route.ts`
- ✅ `frontend/app/api/agents/chart/route.ts`
- ✅ `frontend/app/api/reading/generate/route.ts` (singular!)

**Komponenten:**
- ✅ `frontend/components/agents/ReadingGenerator.tsx`

**Konfiguration:**
- ✅ `frontend/lib/agent/ck-agent.ts`
- ✅ `frontend/app/api/coach/readings/route.ts`

---

## 🔍 Was muss geprüft werden?

### 1. Router-Typ prüfen

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend

# App Router?
ls -d app/ 2>/dev/null && echo "App Router"

# Pages Router?
ls -d pages/ 2>/dev/null && echo "Pages Router"
```

### 2. API-Routes prüfen

```bash
# Prüfe welche Routes existieren
ls -la app/api/agents/*/route.ts
ls -la app/api/reading/generate/route.ts
ls -la app/api/readings/generate/route.ts
```

### 3. Environment Variables prüfen

```bash
# Prüfe .env.local
grep -E "MCP_SERVER_URL|READING_AGENT_URL|CK_AGENT_URL" .env.local
```

### 4. Route-Format prüfen

```bash
# Prüfe ob App Router Format
head -20 app/api/agents/automation/route.ts | grep -E "NextRequest|NextResponse|export async function POST"
```

---

## 🛠️ Fix: App Router Versionen erstellen

### Problem identifiziert:

**Lokale Dateien:** Pages Router Format (`NextApiRequest`, `NextApiResponse`)  
**App Server:** App Router Format benötigt (`NextRequest`, `NextResponse`)

### Lösung: Konvertierungs-Script erstellen

Das Script muss:
1. Router-Typ erkennen (App vs Pages)
2. Dateien entsprechend konvertieren
3. Richtige Pfade verwenden (`app/api/.../route.ts`)

---

## 📊 Vollständige Konfiguration-Übersicht

### Environment Variables (benötigt auf CK-App Server)

**Datei:** `/opt/hd-app/The-Connection-Key/frontend/.env.local`

```bash
# MCP Server (Hetzner 138.199.237.34)
MCP_SERVER_URL=http://138.199.237.34:7000
NEXT_PUBLIC_MCP_SERVER_URL=http://138.199.237.34:7000

# Reading Agent (Hetzner 138.199.237.34)
READING_AGENT_URL=http://138.199.237.34:4001
NEXT_PUBLIC_READING_AGENT_URL=http://138.199.237.34:4001

# CK Agent (Fallback, lokal)
CK_AGENT_URL=http://localhost:3000/api/ck-agent
NEXT_PUBLIC_CK_AGENT_URL=http://localhost:3000/api/ck-agent

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### API-Route Endpoints (MCP Server)

**Hetzner Server:** `http://138.199.237.34:7000`

```bash
# Agent Endpoints
POST /agent/marketing
POST /agent/automation
POST /agent/sales
POST /agent/social-youtube
POST /agent/chart-development

# MCP Functions
POST /run
  Body: {
    "function": "generateReading",
    "arguments": { ... }
  }
```

### Reading Agent Endpoints

**Hetzner Server:** `http://138.199.237.34:4001`

```bash
# Health Check
GET /health

# Reading Generieren
POST /reading/generate
  Body: {
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "detailed"
  }
```

---

## 🔍 Prüf-Befehle für App Server

### 1. Router-Typ prüfen

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# App Router?
ls -d app/ 2>/dev/null && echo "✅ App Router"

# Pages Router?
ls -d pages/ 2>/dev/null && echo "✅ Pages Router"
```

### 2. API-Routes prüfen

```bash
# App Router Routes
ls -la app/api/agents/*/route.ts 2>/dev/null
ls -la app/api/reading/generate/route.ts 2>/dev/null
ls -la app/api/readings/generate/route.ts 2>/dev/null

# Pages Router Routes
ls -la pages/api/agents/*.ts 2>/dev/null
ls -la pages/api/readings/generate.ts 2>/dev/null
```

### 3. Route-Format prüfen

```bash
# Prüfe ob App Router Format
head -20 app/api/agents/automation/route.ts | grep -E "NextRequest|NextResponse|export async function POST"

# Prüfe ob Pages Router Format
head -20 pages/api/agents/automation.ts | grep -E "NextApiRequest|NextApiResponse|export default async function handler"
```

### 4. Environment Variables prüfen

```bash
# Prüfe .env.local
grep -E "MCP_SERVER_URL|READING_AGENT_URL|CK_AGENT_URL" .env.local

# Prüfe ob alle Variablen vorhanden
cat .env.local | grep -E "^MCP_SERVER_URL|^READING_AGENT_URL|^NEXT_PUBLIC"
```

### 5. MCP Server Erreichbarkeit prüfen

```bash
# Test MCP Server
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'

# Test Reading Agent
curl http://138.199.237.34:4001/health
```

---

## 🚨 Hauptproblem: Router-Typ Mismatch

### Problem-Details:

1. **Lokale Dateien verwenden Pages Router Format:**
   ```typescript
   import type { NextApiRequest, NextApiResponse } from 'next';
   export default async function handler(req: NextApiRequest, res: NextApiResponse) { ... }
   ```

2. **App Server verwendet App Router:**
   - Verzeichnis: `app/api/agents/automation/route.ts`
   - Benötigt App Router Format:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server';
   export async function POST(request: NextRequest) { ... }
   ```

3. **Installations-Script verwendet Pages Router:**
   - Script: `integration/install-ck-app-server.sh`
   - Erstellt: `pages/api/agents/...`
   - Sollte erstellen: `app/api/agents/.../route.ts`

---

## ✅ Lösung: App Router Versionen erstellen

Ich erstelle jetzt konvertierte Versionen für App Router...

