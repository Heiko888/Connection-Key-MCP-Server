# 📋 Nächste Schritte - Detaillierte Planung

**Stand:** Aktuell  
**Priorität:** Nach erfolgreicher Tasks-Route

---

## 1. Frontend-Komponente für Agent-Tasks-Dashboard erstellen

### 📍 Ziel
Ein Dashboard erstellen, das alle Agent-Tasks anzeigt, filtert und Statistiken zeigt.

### 📁 Dateien zu erstellen

#### 1.1 Komponente: `AgentTasksDashboard.tsx`
**Pfad:** `integration/frontend/components/AgentTasksDashboard.tsx`

**Features:**
- ✅ Liste aller Tasks mit Pagination
- ✅ Filter nach Agent, Status, User
- ✅ Statistiken anzeigen (total, pending, completed, failed)
- ✅ Task-Details Modal
- ✅ Real-time Updates (optional mit Polling)
- ✅ Export-Funktion (optional)

**API-Integration:**
- `GET /api/agents/tasks` - Tasks abrufen
- `POST /api/agents/tasks` - Statistiken abrufen

**Design:**
- Material-UI oder Tailwind CSS (wie bestehende Komponenten)
- Responsive Design
- Loading States
- Error Handling

**Geschätzter Aufwand:** 4-6 Stunden

---

#### 1.2 Seite: `tasks/page.tsx`
**Pfad:** `integration/frontend/app/coach/agents/tasks/page.tsx`

**Route:** `/coach/agents/tasks`

**Inhalt:**
```typescript
import { AgentTasksDashboard } from '@/components/AgentTasksDashboard';

export default function AgentTasksPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">📊 Agent Tasks Dashboard</h1>
      <AgentTasksDashboard />
    </div>
  );
}
```

**Geschätzter Aufwand:** 30 Minuten

---

#### 1.3 Navigation hinzufügen
**Pfad:** `integration/frontend/components/Navigation.tsx` (oder ähnlich)

**Hinzufügen:**
- Link zu `/coach/agents/tasks` im Menü

**Geschätzter Aufwand:** 15 Minuten

---

## 2. Weitere Agent-Routen migrieren (Marketing, Automation, Sales)

### 📍 Ziel
Alle bestehenden Agent-Routen vom Pages Router zum App Router migrieren und mit Task-Management erweitern.

### 📁 Aktuelle Situation

| Agent | Pages Router | App Router | Task-Management |
|-------|--------------|------------|-----------------|
| Marketing | ✅ `pages/api/agents/marketing.ts` | ❌ Fehlt | ❌ Fehlt |
| Automation | ✅ `pages/api/agents/automation.ts` | ❌ Fehlt | ❌ Fehlt |
| Sales | ✅ `pages/api/agents/sales.ts` | ❌ Fehlt | ❌ Fehlt |
| Social-YouTube | ✅ `pages/api/agents/social-youtube.ts` | ❌ Fehlt | ❌ Fehlt |
| Chart Development | ✅ `pages/api/agents/chart-development.ts` | ❌ Fehlt | ❌ Fehlt |
| Website/UX | ❌ Fehlt | ✅ `app/api/agents/website-ux-agent/route.ts` | ✅ Implementiert |

---

### 📝 Schritt-für-Schritt Migration

#### 2.1 Marketing Agent Route

**Datei erstellen:** `integration/api-routes/app-router/agents/marketing/route.ts`

**Basis:** `integration/api-routes/app-router/agents/website-ux-agent/route.ts` kopieren und anpassen

**Anpassungen:**
- `agentId`: `"marketing"`
- `agentName`: `"Marketing Agent"`
- MCP Server URL: `http://138.199.237.34:7000/agent/marketing`

**Pattern:**
```typescript
// 1. Task erstellen (pending)
const { data: task } = await supabase
  .from('agent_tasks')
  .insert({ ... })
  .select()
  .single();

// 2. Status auf processing
await supabase
  .from('agent_tasks')
  .update({ status: 'processing', started_at: new Date().toISOString() })
  .eq('id', task.id);

// 3. Agent aufrufen
const response = await fetch(`${MCP_SERVER_URL}/agent/marketing`, { ... });

// 4. Ergebnis speichern
await supabase
  .from('agent_tasks')
  .update({ 
    status: 'completed',
    response: response.text,
    completed_at: new Date().toISOString()
  })
  .eq('id', task.id);

// 5. agent_responses Eintrag
await supabase
  .from('agent_responses')
  .insert({ ... });
```

**Geschätzter Aufwand:** 1-2 Stunden pro Agent

---

#### 2.2 Automation Agent Route

**Datei erstellen:** `integration/api-routes/app-router/agents/automation/route.ts`

**Anpassungen:**
- `agentId`: `"automation"`
- `agentName`: `"Automation Agent"`
- MCP Server URL: `http://138.199.237.34:7000/agent/automation`

**Geschätzter Aufwand:** 1-2 Stunden

---

#### 2.3 Sales Agent Route

**Datei erstellen:** `integration/api-routes/app-router/agents/sales/route.ts`

**Anpassungen:**
- `agentId`: `"sales"`
- `agentName`: `"Sales Agent"`
- MCP Server URL: `http://138.199.237.34:7000/agent/sales`

**Geschätzter Aufwand:** 1-2 Stunden

---

#### 2.4 Social-YouTube Agent Route

**Datei erstellen:** `integration/api-routes/app-router/agents/social-youtube/route.ts`

**Anpassungen:**
- `agentId`: `"social-youtube"`
- `agentName`: `"Social-YouTube Agent"`
- MCP Server URL: `http://138.199.237.34:7000/agent/social-youtube`

**Geschätzter Aufwand:** 1-2 Stunden

---

#### 2.5 Chart Development Agent Route

**Datei erstellen:** `integration/api-routes/app-router/agents/chart-development/route.ts`

**Anpassungen:**
- `agentId`: `"chart-development"`
- `agentName`: `"Chart Development Agent"`
- MCP Server URL: `http://138.199.237.34:7000/agent/chart-development`

**Geschätzter Aufwand:** 1-2 Stunden

---

#### 2.6 Deployment

**Nach jeder Route:**
```bash
# 1. Datei auf Server kopieren
scp integration/api-routes/app-router/agents/{agent}/route.ts \
  root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/agents/{agent}/route.ts

# 2. Container neu bauen
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
docker compose build --no-cache frontend
docker compose up -d frontend

# 3. Testen
curl -X POST http://localhost:3000/api/agents/{agent} \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

**Geschätzter Aufwand:** 15 Minuten pro Route

---

## 3. Alle Agent-Routen mit Task-Management-System erweitern

### 📍 Ziel
Sicherstellen, dass alle Agent-Routen das Task-Management-System nutzen.

### ✅ Bereits implementiert
- ✅ `website-ux-agent` - Vollständig mit Task-Management

### ⏳ Noch zu implementieren
- ⏳ `marketing` - Nach Migration
- ⏳ `automation` - Nach Migration
- ⏳ `sales` - Nach Migration
- ⏳ `social-youtube` - Nach Migration
- ⏳ `chart-development` - Nach Migration

### 📋 Checkliste pro Route

- [ ] Supabase Client importiert
- [ ] Task erstellen (pending) vor Agent-Aufruf
- [ ] Status auf processing setzen
- [ ] Agent aufrufen (MCP Server)
- [ ] Ergebnis speichern (completed/failed)
- [ ] `agent_responses` Eintrag erstellen
- [ ] Error Handling implementiert
- [ ] Mattermost Notification (optional)
- [ ] Getestet

**Geschätzter Aufwand:** Bereits in Schritt 2 enthalten

---

## 4. n8n-Workflows anpassen, um `agent_responses` Tabelle zu nutzen

### 📍 Ziel
n8n-Workflows so anpassen, dass sie die `agent_responses` Tabelle nutzen statt direkt Agenten aufzurufen.

### 🔍 Aktuelle Workflows

#### 4.1 "Agent → Mattermost Notification"
**Aktuell:**
- Ruft Agent direkt auf: `http://138.199.237.34:7000/agent/{{ $json.agentId }}`
- Sendet Ergebnis an Mattermost

**Anpassung:**
- Option A: Workflow bleibt gleich (Agent wird direkt aufgerufen)
- Option B: Workflow ruft Frontend-API auf: `http://167.235.224.149:3000/api/agents/{{ $json.agentId }}`
  - Vorteil: Task wird automatisch gespeichert
  - Nachteil: Zusätzlicher Hop

**Empfehlung:** Option B (Frontend-API nutzen)

**Geschätzter Aufwand:** 30 Minuten

---

#### 4.2 "Scheduled Agent Reports → Mattermost"
**Aktuell:**
- Ruft Marketing Agent direkt auf
- Sendet täglich um 9:00 Uhr

**Anpassung:**
- Frontend-API nutzen: `http://167.235.224.149:3000/api/agents/marketing`
- Task wird automatisch gespeichert
- Historische Daten verfügbar

**Geschätzter Aufwand:** 30 Minuten

---

#### 4.3 "Multi-Agent Content Pipeline"
**Aktuell:**
- Sequenz: Marketing → Social-YouTube → Automation

**Anpassung:**
- Alle Agenten über Frontend-API aufrufen
- Tasks werden verknüpft (optional: `parent_task_id` Feld)

**Geschätzter Aufwand:** 1 Stunde

---

#### 4.4 "Agent Automation Workflows"
**Aktuell:**
- Verschiedene Workflows die Agenten aufrufen

**Anpassung:**
- Alle auf Frontend-API umstellen
- Tasks werden automatisch gespeichert

**Geschätzter Aufwand:** 2-3 Stunden (je nach Anzahl)

---

### 📋 Neue Workflow-Features (Optional)

#### 4.5 "Get Agent Tasks from Supabase"
**Neuer Workflow:**
- Liest Tasks aus `agent_responses` Tabelle
- Filtert nach Agent, Datum, Status
- Sendet an Mattermost oder andere Ziele

**Geschätzter Aufwand:** 1 Stunde

---

#### 4.6 "Agent Task Statistics"
**Neuer Workflow:**
- Ruft `/api/agents/tasks` POST auf (Statistiken)
- Erstellt Report
- Sendet täglich/wöchentlich

**Geschätzter Aufwand:** 1 Stunde

---

## 📊 Gesamtaufwand

| Aufgabe | Geschätzter Aufwand |
|---------|---------------------|
| 1. Frontend-Komponente Dashboard | 4-6 Stunden |
| 2. Agent-Routen migrieren (5 Routen) | 5-10 Stunden |
| 3. Task-Management erweitern | In Schritt 2 enthalten |
| 4. n8n-Workflows anpassen | 3-5 Stunden |
| **Gesamt** | **12-21 Stunden** |

---

## 🎯 Priorisierung

### PRIORITÄT 1: Frontend-Dashboard
- ✅ Sofortiger Nutzen für User
- ✅ Visualisierung der Tasks
- ✅ Einfach zu testen

### PRIORITÄT 2: Marketing Agent Migration
- ✅ Wird häufig verwendet
- ✅ Wichtig für Workflows

### PRIORITÄT 3: Weitere Agent-Migrationen
- ✅ Automation, Sales, Social-YouTube, Chart
- ✅ Gleichmäßige Implementierung

### PRIORITÄT 4: n8n-Workflows
- ✅ Verbessert Datenqualität
- ✅ Historische Daten verfügbar

---

## 🚀 Quick Start

**Für schnellen Start:**

1. **Dashboard erstellen** (4-6 Stunden)
   ```bash
   # Komponente erstellen
   touch integration/frontend/components/AgentTasksDashboard.tsx
   # Seite erstellen
   touch integration/frontend/app/coach/agents/tasks/page.tsx
   ```

2. **Marketing Agent migrieren** (1-2 Stunden)
   ```bash
   # Route erstellen
   cp integration/api-routes/app-router/agents/website-ux-agent/route.ts \
      integration/api-routes/app-router/agents/marketing/route.ts
   # Anpassen: agentId, agentName, MCP URL
   ```

3. **Testen**
   ```bash
   # Dashboard testen
   curl -X GET http://localhost:3000/api/agents/tasks
   # Marketing Agent testen
   curl -X POST http://localhost:3000/api/agents/marketing \
     -H "Content-Type: application/json" \
     -d '{"message": "Test"}'
   ```

---

**✅ Bereit für die nächste Evolutionsstufe!**
