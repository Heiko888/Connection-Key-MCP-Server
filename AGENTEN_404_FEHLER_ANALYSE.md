# 🔧 Agenten-404-Fehler: Systematische Analyse & Behebung

**Datum:** 03.01.2025  
**Fehler:** `Cannot POST /agent/marketing` (404)  
**Status:** TaskAgent funktioniert, andere Agenten nicht

---

## 🔍 1. Fehleranalyse

### **1.1 Fehlermeldung interpretieren**

```
Cannot POST /agent/marketing
```

**Bedeutung:**
- ❌ Der Request geht an `/agent/marketing` (ohne `/api/`)
- ❌ Das ist der **MCP-Server-Endpoint**, nicht der Next.js API-Endpoint
- ❌ Next.js findet keine Route für `/agent/marketing`

**Korrekte Struktur:**
```
Frontend → POST /api/agents/marketing → Next.js API Route → POST /agent/marketing → MCP Server
```

---

### **1.2 Routing-Struktur-Änderung**

**Erwartete Struktur (App Router):**
```
app/api/agents/
  ├── marketing/route.ts      → /api/agents/marketing
  ├── sales/route.ts           → /api/agents/sales
  ├── automation/route.ts     → /api/agents/automation
  ├── social-youtube/route.ts  → /api/agents/social-youtube
  ├── chart-development/route.ts → /api/agents/chart-development
  ├── website-ux-agent/route.ts → /api/agents/website-ux-agent
  └── tasks/route.ts          → /api/agents/tasks ✅ (funktioniert)
```

**Problem:**
- Frontend ruft möglicherweise direkt `/agent/marketing` auf (ohne `/api/`)
- Oder API-Routes sind nicht korrekt deployed
- Oder Legacy-Code verwendet alte Endpunkte

---

## 🔎 2. Legacy-Endpunkte identifizieren

### **2.1 Frontend-Code prüfen**

**Zu prüfende Dateien:**

1. **`integration/frontend/components/AgentChat.tsx`**
   - ✅ Sollte `/api/agents/${agentId}` aufrufen
   - ❌ Falls `/agent/${agentId}` → Legacy-Code

2. **Frontend-Komponenten auf Server:**
   - `app/components/AgentChat.tsx`
   - `components/agents/AgentChat.tsx`
   - `components/AgentChat.tsx`

3. **Frontend-Seiten:**
   - `app/coach/agents/marketing/page.tsx`
   - `app/coach/agents/sales/page.tsx`
   - `app/coach/agents/automation/page.tsx`

**Mögliche Legacy-Patterns:**
```typescript
// ❌ FALSCH (Legacy):
fetch('http://138.199.237.34:7000/agent/marketing', ...)
fetch('/agent/marketing', ...)

// ✅ RICHTIG:
fetch('/api/agents/marketing', ...)
```

---

### **2.2 Backend-API-Routes prüfen**

**Auf Server prüfen:**

```bash
# Prüfe ob API-Routes existieren
ls -la /opt/hd-app/The-Connection-Key/frontend/app/api/agents/marketing/route.ts
ls -la /opt/hd-app/The-Connection-Key/frontend/app/api/agents/sales/route.ts
ls -la /opt/hd-app/The-Connection-Key/frontend/app/api/agents/automation/route.ts

# Prüfe ob Routes korrekt sind
head -20 /opt/hd-app/The-Connection-Key/frontend/app/api/agents/marketing/route.ts
```

**Erwartete Route-Struktur:**
```typescript
// app/api/agents/marketing/route.ts
export async function POST(req: NextRequest) {
  // ... ruft MCP Server auf: /agent/marketing
  const response = await fetch(`${MCP_SERVER_URL}/agent/${AGENT_ID}`, ...);
}
```

---

## 📋 3. Konkrete Checkliste

### **Schritt 1: API-Routes prüfen**

**Auf Frontend-Server ausführen:**

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe alle Agent-Routes
find app/api/agents -name "route.ts" -type f

# Erwartete Ausgabe:
# app/api/agents/marketing/route.ts
# app/api/agents/sales/route.ts
# app/api/agents/automation/route.ts
# app/api/agents/social-youtube/route.ts
# app/api/agents/chart-development/route.ts
# app/api/agents/website-ux-agent/route.ts
# app/api/agents/tasks/route.ts ✅
```

**Falls Routes fehlen:**
- Dateien von `integration/api-routes/app-router/agents/*/route.ts` kopieren

---

### **Schritt 2: Frontend-Komponenten prüfen**

**Auf Frontend-Server ausführen:**

```bash
# Prüfe AgentChat Komponente
grep -r "/agent/" app/components/ components/ --include="*.tsx" --include="*.ts"

# Erwartete Ausgabe:
# Sollte NUR /api/agents/ enthalten, NICHT /agent/
```

**Falls Legacy-Code gefunden:**
- Alle `/agent/` Aufrufe durch `/api/agents/` ersetzen

---

### **Schritt 3: Frontend-Seiten prüfen**

**Auf Frontend-Server ausführen:**

```bash
# Prüfe Agent-Seiten
grep -r "fetch.*agent" app/coach/agents/ --include="*.tsx"

# Erwartete Ausgabe:
# Sollte /api/agents/ enthalten
```

---

### **Schritt 4: Container-Logs prüfen**

**Auf Frontend-Server ausführen:**

```bash
# Prüfe Logs für 404-Fehler
docker compose logs frontend | grep -i "404\|/agent/"

# Erwartete Ausgabe:
# Zeigt, welche Requests 404-Fehler verursachen
```

---

## 🎯 4. Sauberes Agent-Routing-Schema

### **4.1 Ziel-Architektur**

```
┌─────────────────────────────────────────────────────────┐
│ Frontend (Browser)                                       │
│   POST /api/agents/{agentId}                            │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ Next.js API Route (App Router)                         │
│   app/api/agents/{agentId}/route.ts                     │
│   - Validierung                                          │
│   - Task-Management (Supabase)                           │
│   - MCP Server-Aufruf                                    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ MCP Gateway (Port 7000)                                  │
│   POST /agent/{agentId}                                  │
│   - Authentifizierung                                    │
│   - Request-Queuing                                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ MCP Core (index.js)                                      │
│   - Agent-Logik                                          │
│   - OpenAI API                                           │
└─────────────────────────────────────────────────────────┘
```

---

### **4.2 Route-Naming-Konvention**

**Frontend → Next.js:**
```
/api/agents/{agentId}
```

**Next.js → MCP:**
```
/agent/{agentId}
```

**Beispiele:**
- Frontend: `/api/agents/marketing` → Next.js: `/api/agents/marketing` → MCP: `/agent/marketing`
- Frontend: `/api/agents/tasks` → Next.js: `/api/agents/tasks` → (kein MCP-Aufruf)

---

### **4.3 Empfohlene Route-Struktur**

**Für Coach/User-Routen (optional):**
```
/api/coach/agents/{agentId}
```

**Für System-Routen:**
```
/api/system/agents/{agentId}
```

**Aktuell (empfohlen):**
```
/api/agents/{agentId}  ← Einfach, klar, konsistent
```

---

## 🔧 5. Konkrete Behebungs-Schritte

### **Schritt 1: API-Routes verifizieren**

**Auf Frontend-Server:**

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Liste aller Agent-Routes
ls -la app/api/agents/*/route.ts

# Prüfe eine Route (z.B. marketing)
head -30 app/api/agents/marketing/route.ts
```

**Erwartet:**
- Route existiert
- Route exportiert `export async function POST`
- Route ruft MCP Server auf: `${MCP_SERVER_URL}/agent/${AGENT_ID}`

---

### **Schritt 2: Frontend-Komponenten prüfen**

**Auf Frontend-Server:**

```bash
# Finde alle Agent-Aufrufe
grep -r "fetch.*agent" app/ components/ --include="*.tsx" --include="*.ts" -n

# Prüfe AgentChat
cat app/components/AgentChat.tsx | grep -A 5 "fetch"
# Oder
cat components/agents/AgentChat.tsx | grep -A 5 "fetch"
```

**Erwartet:**
```typescript
// ✅ RICHTIG:
fetch(`/api/agents/${agentId}`, ...)

// ❌ FALSCH (Legacy):
fetch(`/agent/${agentId}`, ...)
fetch(`http://138.199.237.34:7000/agent/${agentId}`, ...)
```

---

### **Schritt 3: Legacy-Code korrigieren**

**Falls Legacy-Code gefunden:**

```typescript
// ❌ VORHER (Legacy):
const res = await fetch(`/agent/${agentId}`, {
  method: 'POST',
  // ...
});

// ✅ NACHHER (Korrekt):
const res = await fetch(`/api/agents/${agentId}`, {
  method: 'POST',
  // ...
});
```

---

### **Schritt 4: Container neu bauen**

**Nach Code-Änderungen:**

```bash
cd /opt/hd-app/The-Connection-Key
docker compose stop frontend
docker compose build --no-cache frontend
docker compose up -d frontend
docker compose logs -f frontend
```

---

## 🛡️ 6. Prävention für zukünftige Deploys

### **6.1 Zentrale Route-Config**

**Erstelle:** `lib/config/agent-routes.ts`

```typescript
export const AGENT_ROUTES = {
  marketing: '/api/agents/marketing',
  sales: '/api/agents/sales',
  automation: '/api/agents/automation',
  'social-youtube': '/api/agents/social-youtube',
  'chart-development': '/api/agents/chart-development',
  'website-ux-agent': '/api/agents/website-ux-agent',
  tasks: '/api/agents/tasks',
} as const;

export type AgentId = keyof typeof AGENT_ROUTES;

export function getAgentRoute(agentId: AgentId): string {
  return AGENT_ROUTES[agentId];
}
```

**Verwendung:**
```typescript
import { getAgentRoute } from '@/lib/config/agent-routes';

const res = await fetch(getAgentRoute('marketing'), {
  method: 'POST',
  // ...
});
```

---

### **6.2 TypeScript-Typisierung**

**Erstelle:** `types/agents.ts`

```typescript
export type AgentId = 
  | 'marketing'
  | 'sales'
  | 'automation'
  | 'social-youtube'
  | 'chart-development'
  | 'website-ux-agent'
  | 'tasks';

export interface AgentRoute {
  id: AgentId;
  path: `/api/agents/${AgentId}`;
  mcpEndpoint: `/agent/${AgentId}`;
}
```

---

### **6.3 Automatisierte Tests**

**Erstelle:** `__tests__/agent-routes.test.ts`

```typescript
import { AGENT_ROUTES } from '@/lib/config/agent-routes';

describe('Agent Routes', () => {
  it('should have correct route format', () => {
    Object.entries(AGENT_ROUTES).forEach(([agentId, route]) => {
      expect(route).toMatch(/^\/api\/agents\//);
    });
  });

  it('should have route for each agent', () => {
    const agents = ['marketing', 'sales', 'automation', 'social-youtube'];
    agents.forEach(agent => {
      expect(AGENT_ROUTES[agent]).toBeDefined();
    });
  });
});
```

---

### **6.4 Pre-Deploy-Checklist**

**Erstelle:** `.github/workflows/pre-deploy-check.yml`

```yaml
name: Pre-Deploy Check
on: [push]

jobs:
  check-routes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Check Agent Routes
        run: |
          # Prüfe ob alle Agent-Routes existieren
          for agent in marketing sales automation social-youtube chart-development website-ux-agent; do
            if [ ! -f "integration/api-routes/app-router/agents/$agent/route.ts" ]; then
              echo "❌ Route fehlt: $agent"
              exit 1
            fi
          done
          echo "✅ Alle Agent-Routes vorhanden"
```

---

## 📊 7. Vergleich: TaskAgent vs. andere Agenten

### **7.1 Warum funktioniert TaskAgent?**

**TaskAgent Route:**
- ✅ Route existiert: `app/api/agents/tasks/route.ts`
- ✅ Route ist deployed
- ✅ Frontend ruft korrekt auf: `/api/agents/tasks`

**Vermutung:**
- TaskAgent wurde bereits auf neue Struktur migriert
- Andere Agenten verwenden noch Legacy-Code oder sind nicht deployed

---

### **7.2 Warum funktionieren andere Agenten nicht?**

**Mögliche Ursachen:**

1. **API-Routes nicht deployed:**
   - Dateien fehlen auf Server
   - Dateien in falschem Verzeichnis

2. **Frontend ruft falschen Endpoint auf:**
   - Legacy-Code: `/agent/marketing` statt `/api/agents/marketing`
   - Direkter MCP-Aufruf statt Next.js API

3. **Container nicht neu gebaut:**
   - Alte Version läuft noch
   - Neue Routes nicht geladen

---

## ✅ 8. Sofort-Maßnahmen

### **Maßnahme 1: API-Routes verifizieren**

```bash
# Auf Frontend-Server
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe alle Routes
for agent in marketing sales automation social-youtube chart-development website-ux-agent; do
  echo "Checking $agent..."
  if [ -f "app/api/agents/$agent/route.ts" ]; then
    echo "  ✅ Route vorhanden"
  else
    echo "  ❌ Route fehlt!"
  fi
done
```

---

### **Maßnahme 2: Frontend-Code prüfen**

```bash
# Finde alle Agent-Aufrufe
grep -r "fetch.*['\"]/agent/" app/ components/ --include="*.tsx" --include="*.ts"

# Falls gefunden → korrigieren zu /api/agents/
```

---

### **Maßnahme 3: Container-Logs analysieren**

```bash
# Prüfe Logs für 404-Fehler
docker compose logs frontend | grep -i "404\|Cannot POST"

# Zeigt genau, welche Requests fehlschlagen
```

---

## 🎯 9. Empfohlene Ziel-Architektur

### **9.1 Route-Hierarchie**

```
/api/agents/{agentId}          ← Standard (aktuell)
/api/coach/agents/{agentId}    ← Optional (für Coach-spezifische Features)
/api/system/agents/{agentId}   ← System-Routen (bereits vorhanden)
```

---

### **9.2 Code-Organisation**

```
lib/
  ├── config/
  │   └── agent-routes.ts      ← Zentrale Route-Config
  ├── agents/
  │   ├── types.ts             ← TypeScript-Typen
  │   └── client.ts            ← Agent-Client (fetch wrapper)
  └── supabase-clients.ts      ← Supabase Clients

app/api/agents/
  ├── [agentId]/
  │   └── route.ts             ← Dynamische Route (optional)
  ├── marketing/route.ts       ← Spezifische Route (aktuell)
  ├── sales/route.ts
  └── ...
```

---

### **9.3 Dynamische Route (Optional, zukünftig)**

**Erstelle:** `app/api/agents/[agentId]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { AGENT_ROUTES } from '@/lib/config/agent-routes';

export async function POST(
  req: NextRequest,
  { params }: { params: { agentId: string } }
) {
  const { agentId } = params;
  
  // Validiere Agent-ID
  if (!AGENT_ROUTES[agentId as keyof typeof AGENT_ROUTES]) {
    return NextResponse.json(
      { error: 'Invalid agent ID' },
      { status: 400 }
    );
  }
  
  // Weiterleitung an spezifische Route
  // Oder gemeinsame Logik hier
}
```

**Vorteil:**
- ✅ Eine Route für alle Agenten
- ✅ Konsistente Logik
- ✅ Einfacher zu warten

**Nachteil:**
- ⚠️ Weniger explizit
- ⚠️ Schwerer zu debuggen

---

## 📝 10. Zusammenfassung

### **Problem:**
- ❌ `Cannot POST /agent/marketing` (404)
- ✅ TaskAgent funktioniert

### **Ursache:**
1. Frontend ruft `/agent/marketing` auf (Legacy) statt `/api/agents/marketing`
2. Oder API-Routes sind nicht deployed
3. Oder Container nicht neu gebaut

### **Lösung:**
1. ✅ API-Routes verifizieren (existieren sie?)
2. ✅ Frontend-Code prüfen (Legacy-Aufrufe?)
3. ✅ Legacy-Code korrigieren (`/agent/` → `/api/agents/`)
4. ✅ Container neu bauen

### **Prävention:**
1. ✅ Zentrale Route-Config
2. ✅ TypeScript-Typisierung
3. ✅ Automatisierte Tests
4. ✅ Pre-Deploy-Checks

---

## 🚀 Nächste Schritte

1. **Sofort:** API-Routes auf Server verifizieren
2. **Sofort:** Frontend-Code auf Legacy-Aufrufe prüfen
3. **Kurzfristig:** Legacy-Code korrigieren
4. **Mittelfristig:** Zentrale Route-Config einführen
5. **Langfristig:** Dynamische Route implementieren
