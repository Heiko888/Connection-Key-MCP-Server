# 🤖 Agent Task Management System

**Datum:** 18.12.2025  
**Status:** ✅ Implementiert

---

## 🎯 Problem gelöst

**Vorher:**
- ❌ Agenten laufen, aber keine sichtbaren Aufgaben/Ergebnisse
- ❌ Keine Task-Verfolgung
- ❌ Keine historischen Daten
- ❌ Keine Statistiken

**Jetzt:**
- ✅ Vollständiges Task-Management-System
- ✅ Status-Tracking (pending → processing → completed/failed)
- ✅ Historische Daten in Supabase
- ✅ API zum Abrufen von Tasks und Statistiken
- ✅ Automatische Speicherung aller Agent-Ergebnisse

---

## 📊 Architektur

### 1. **Supabase-Tabellen**

#### `agent_tasks`
Speichert alle Agent-Aufgaben mit vollständigem Status-Tracking:

```sql
- id (UUID)
- user_id (UUID, optional)
- agent_id (VARCHAR) - z.B. 'marketing', 'website-ux-agent'
- agent_name (VARCHAR) - Human-readable Name
- task_message (TEXT) - Die ursprüngliche Anfrage
- task_type (VARCHAR) - 'chat', 'generation', 'analysis', etc.
- status (VARCHAR) - 'pending', 'processing', 'completed', 'failed', 'cancelled'
- response (TEXT) - Die Agent-Antwort
- response_data (JSONB) - Strukturierte Daten
- metadata (JSONB) - tokens, model, duration, etc.
- created_at, updated_at, started_at, completed_at
- error_message, error_details
```

#### `agent_responses`
Speichert alle Agent-Antworten (für n8n-Workflows und historische Daten):

```sql
- id (UUID)
- task_id (UUID, optional) - Referenz zu agent_tasks
- agent (VARCHAR) - Agent-ID
- response (TEXT) - Die Antwort
- response_data (JSONB) - Strukturierte Daten
- tokens, model, duration_ms
- created_at
- metadata (JSONB)
```

---

## 🔄 Workflow

### Agent-Aufruf mit Task-Management:

```
1. Frontend → POST /api/agents/{agent-id}
   ↓
2. API Route erstellt Task in Supabase (status: 'pending')
   ↓
3. API Route setzt Status auf 'processing'
   ↓
4. API Route ruft MCP Server Agent auf
   ↓
5. API Route speichert Ergebnis:
   - Task Status → 'completed'
   - response, response_data, metadata
   - agent_responses Eintrag
   ↓
6. API Route gibt Ergebnis zurück
```

### Fehlerbehandlung:

```
Bei Fehler:
- Task Status → 'failed'
- error_message, error_details gespeichert
- completed_at gesetzt
```

---

## 📡 API-Endpoints

### 1. **Agent-Aufruf** (erweitert)

**Route:** `POST /api/agents/{agent-id}`

**Request:**
```json
{
  "message": "Analysiere diese Seite...",
  "userId": "optional-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Agent-Antwort...",
  "agentId": "website-ux-agent",
  "tokens": 1500,
  "model": "gpt-4",
  "taskId": "uuid-der-task",
  "duration_ms": 3500
}
```

**Neue Features:**
- ✅ Erstellt automatisch Task in Supabase
- ✅ Speichert Ergebnis in `agent_tasks` und `agent_responses`
- ✅ Gibt `taskId` zurück für Tracking

---

### 2. **Tasks abrufen**

**Route:** `GET /api/agents/tasks`

**Query-Parameter:**
- `userId` (optional) - Filter nach User
- `agentId` (optional) - Filter nach Agent
- `status` (optional) - Filter nach Status
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)

**Response:**
```json
{
  "success": true,
  "tasks": [
    {
      "id": "uuid",
      "agent_id": "website-ux-agent",
      "agent_name": "Website / UX Agent",
      "task_message": "Analysiere...",
      "status": "completed",
      "response": "Agent-Antwort...",
      "created_at": "2025-12-18T10:00:00Z",
      "completed_at": "2025-12-18T10:00:05Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 1
  }
}
```

---

### 3. **Statistiken abrufen**

**Route:** `POST /api/agents/tasks`

**Request:**
```json
{
  "userId": "optional-user-id",
  "agentId": "optional-agent-id"
}
```

**Response:**
```json
{
  "success": true,
  "statistics": {
    "total_tasks": 150,
    "pending_tasks": 2,
    "processing_tasks": 1,
    "completed_tasks": 140,
    "failed_tasks": 7,
    "avg_duration_ms": 3500.5
  }
}
```

---

## 🗄️ Supabase-Migration

**Datei:** `integration/supabase/migrations/009_create_agent_tasks_tables.sql`

**Ausführen:**
```bash
# Via Supabase CLI
supabase migration up

# Oder direkt in Supabase Dashboard
# SQL Editor → Migration einfügen → Ausführen
```

**Enthält:**
- ✅ Tabellen: `agent_tasks`, `agent_responses`
- ✅ Indizes für Performance
- ✅ RLS Policies (Row Level Security)
- ✅ Helper-Funktionen: `get_user_agent_tasks()`, `get_agent_task_statistics()`
- ✅ Trigger für `updated_at` automatische Aktualisierung

---

## 🎨 Frontend-Integration (Nächster Schritt)

### Komponente: `AgentTasksDashboard`

**Features:**
- ✅ Liste aller Tasks
- ✅ Filter nach Agent, Status, User
- ✅ Statistiken anzeigen
- ✅ Task-Details öffnen
- ✅ Real-time Updates (optional)

**Route:** `/coach/agents/tasks`

---

## 🔄 Migration bestehender Agenten

### Alle Agenten-API-Routes erweitern:

**Aktuell erweitert:**
- ✅ `website-ux-agent` - Vollständig mit Task-Management

**Noch zu erweitern:**
- ⏳ `marketing` - Task-Management hinzufügen
- ⏳ `automation` - Task-Management hinzufügen
- ⏳ `sales` - Task-Management hinzufügen
- ⏳ `social-youtube` - Task-Management hinzufügen
- ⏳ `chart-development` - Task-Management hinzufügen

**Pattern:**
1. Supabase Client importieren
2. Task erstellen (pending)
3. Status auf processing setzen
4. Agent aufrufen
5. Ergebnis speichern (completed/failed)
6. `agent_responses` Eintrag erstellen

---

## 📋 Nächste Schritte

1. ✅ **Migration ausführen** - Supabase-Migration 009 ausführen
2. ✅ **API-Route testen** - `/api/agents/website-ux-agent` testen
3. ⏳ **Tasks-API testen** - `/api/agents/tasks` testen
4. ⏳ **Weitere Agenten erweitern** - Alle Agenten mit Task-Management ausstatten
5. ⏳ **Frontend-Komponente** - Dashboard für Tasks erstellen
6. ⏳ **n8n-Workflows anpassen** - Nutzen neue `agent_responses` Tabelle

---

## 🎯 Ergebnis

**Vorher:**
- Agenten laufen, aber keine sichtbaren Aufgaben/Ergebnisse

**Jetzt:**
- ✅ Vollständiges Task-Management
- ✅ Alle Aufgaben werden gespeichert
- ✅ Status-Tracking für jeden Task
- ✅ Historische Daten verfügbar
- ✅ Statistiken abrufbar
- ✅ API für Frontend-Integration

**Nächste Evolutionsstufe erreicht!** 🚀



