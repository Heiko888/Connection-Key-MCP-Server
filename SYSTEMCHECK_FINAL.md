# 🔍 Systemübergreifender Systemcheck - FINAL

**Datum:** $(date +"%d.%m.%Y")  
**Status:** Vollständige Live-Systemprüfung (Live-Daten vom Server)

---

## 📊 Executive Summary

**Gesamt-Status:**
- ✅ **Frontend Container:** Läuft (Port 3000, healthy, Up 8 hours)
- ✅ **MCP Server:** Läuft (Port 7000, active/running, 3 days uptime)
- ✅ **Reading Agent:** Läuft (Port 4001, PM2 online, 41h uptime)
- ✅ **n8n:** Läuft (Port 5678, Docker, Up 7 days)
- ✅ **Login-Seite:** EXISTIERT und erreichbar (`/login`)
- ✅ **Admin-Seite:** EXISTIERT (`/admin`, leitet zu `/login` wenn nicht eingeloggt)
- ❌ **Registrierung:** FEHLT (`/register`)
- ⚠️ **Coach-Login:** Unklar (verwendet `/login`?)
- ⚠️ **n8n Workflows:** Status unklar (welche aktiv?)

---

## 🖥️ Server-Status (Live)

### Server 1: CK-App Server (167.235.224.149)

**Container:**
- ✅ `the-connection-key-frontend-1` - Up 8 hours (healthy)
- ✅ `ck-agent` - Up 34 hours
- ✅ `the-connection-key-nginx-1` - Up 11 hours
- ✅ `the-connection-key-redis-1` - Up 34 hours
- ✅ Monitoring: prometheus, grafana, alertmanager

**Frontend-Logs (letzte Stunde):**
- ⚠️ **Sicherheitswarnung:** `getSession()` sollte durch `getUser()` ersetzt werden (mehrfach)
- ⚠️ **Fehler:** `TypeError: Cannot read properties of null (reading 'digest')`
- ⚠️ **Fehler:** Bild nicht gefunden `/images/Design%20ohne%20Titel(15).png`

**Letzte Änderungen:**
- Login-Seite: 29.11.2025 03:01
- Admin-Seite: 20.12.2025 15:19
- MCP Server: Gestartet 18.12.2025 10:48 (3 Tage uptime)

### Server 2: Hetzner Server (138.199.237.34)

**Services:**
- ✅ `mcp.service` - active/running (3 days uptime, PID 605921)
- ✅ `reading-agent` (PM2) - online (41h uptime, 18 restarts)
- ✅ `n8n` (Docker) - Up 7 days

**Health Checks:**
- ✅ MCP Server: `{"status":"ok","port":7000,"service":"mcp-server"}`
- ✅ Reading Agent: `{"status":"ok","service":"reading-agent","port":"4001","knowledge":15,"templates":11}`
- ✅ n8n: `{"status":"ok"}`

---

## 🔗 Frontend ↔ MCP Integration

### Status: ✅ Funktioniert

**Flow:**
```
Frontend (167.235.224.149:3000)
    ↓ POST /api/agents/{agentId}
Next.js API Route
    ↓ POST http://138.199.237.34:7000/agent/{agentId}
MCP Server (138.199.237.34:7000)
    ↓
OpenAI API
```

**Verfügbare Agenten (von MCP Server):**
- ✅ `automation` - Automation Agent
- ✅ `chart-architect-agent` - Human Design Chart Architect
- ✅ `chart-development` - Chart Development Agent
- ✅ `marketing` - Marketing Agent
- ✅ `reading` - Reading Agent
- ✅ `relationship-analysis-agent` - Relationship Analysis Agent
- ✅ `sales` - Sales Agent
- ✅ `social-youtube` - Social-YouTube Agent
- ✅ `tasks` - Tasks & Struktur Agent
- ✅ `video-creation-agent` - Video Creation Agent
- ✅ `website-ux-agent` - Website / UX Agent

**API-Routen auf Server:**
- ✅ `/api/agents/marketing/route.ts`
- ✅ `/api/agents/automation/route.ts`
- ✅ `/api/agents/sales/route.ts`
- ✅ `/api/agents/social-youtube/route.ts`
- ✅ `/api/agents/chart-development/route.ts`
- ✅ `/api/agents/chart/route.ts`
- ✅ `/api/agents/ui-ux/route.ts`
- ✅ `/api/agents/website-ux-agent/route.ts`
- ✅ `/api/agents/tasks/route.ts`

---

## 🔐 Authentifizierung

### Login-Seiten

**Gefunden:**
- ✅ `/login` - EXISTIERT und erreichbar (gibt HTML zurück)
- ✅ `/admin` - EXISTIERT (leitet zu `/login` wenn nicht eingeloggt)
- ❌ `/register` - FEHLT
- ⚠️ `/coach/login` - Nicht gefunden (verwendet `/login`?)

**Login-Implementierung:**
- ✅ `/login` verwendet `useAuth` Hook und Supabase Auth
- ✅ `/admin` prüft Session und Admin-Rolle
- ✅ Admin-Rolle wird erkannt über:
  - `subscriptions.package_id === 'admin'` (in `subscriptions` Tabelle)
  - ODER `user.user_metadata?.role === 'admin'` (in Supabase Auth Metadata)

**Rollen-System:**
- ✅ **Admin:** `subscriptions.package_id === 'admin'` ODER `user_metadata.role === 'admin'`
- ⚠️ **Coach:** Unklar (möglicherweise `subscriptions.package_id === 'coach'`?)
- ⚠️ **User:** Standard (keine spezielle Rolle?)

**Problem:**
- ❌ Registrierungs-Seite fehlt (`/register`)
- ⚠️ Coach-Rolle: Wie wird sie erkannt?
- ⚠️ `subscriptions` Tabelle: Vollständige Struktur unklar

---

## 📋 Tasks-System

### Status: ✅ Implementiert

**Komponenten:**
- ✅ Dashboard: `/coach/agents/tasks`
- ✅ Komponente: `AgentTasksDashboard.tsx`
- ✅ API: `/api/agents/tasks` (GET, POST)
- ✅ Supabase Tabelle: `agent_tasks`

**Flow:**
1. User sendet Nachricht → Task erstellt (pending)
2. MCP Server aufgerufen → Task (processing)
3. Antwort erhalten → Task (completed/failed)

**API-Test:**
- ⚠️ `/api/agents/tasks` gibt "Unauthorized" zurück (erwartet Authentifizierung)

---

## 📊 Chart-Berechnung

### Status: ⚠️ Unklar

**Aktueller Flow:**
```
Frontend
    ↓ POST /api/agents/chart-development
Next.js API Route
    ↓ POST http://138.199.237.34:7000/agent/chart-development
MCP Server
    ↓ (intern)
Chart-Berechnung (unbekannt wo)
```

**Fragen:**
- ❓ Läuft Chart-Berechnung direkt im MCP Server?
- ❓ Oder ruft MCP Server Reading Agent auf?
- ❓ Gibt es direkte `/chart/calculate` API?

---

## 🔄 n8n Integration

### Status: ⚠️ Unklar

**n8n läuft:** ✅ (Port 5678, Up 7 days, Health: ok)

**Mögliche Workflows:**
1. Reading Generation Workflow (`/webhook/reading`)
2. Agent → Mattermost Notification (`/webhook/agent-mattermost`)
3. Scheduled Agent Reports (täglich 9:00 Uhr)
4. User Registration Reading (`/webhook/user-registered`)

**Problem:**
- ❓ Welche Workflows sind aktiv?
- ❓ Welche Webhooks werden verwendet?
- ❓ Sind Frontend-Prozesse mit n8n verbunden?

---

## 🌐 API-Übersicht (Vollständig)

### Agent APIs (`/api/agents/*`)

| Route | Status | MCP Endpoint |
|-------|--------|--------------|
| `/api/agents/marketing` | ✅ | `/agent/marketing` |
| `/api/agents/automation` | ✅ | `/agent/automation` |
| `/api/agents/sales` | ✅ | `/agent/sales` |
| `/api/agents/social-youtube` | ✅ | `/agent/social-youtube` |
| `/api/agents/chart-development` | ✅ | `/agent/chart-development` |
| `/api/agents/chart` | ✅ | `/agent/chart`? |
| `/api/agents/ui-ux` | ✅ | `/agent/ui-ux`? |
| `/api/agents/website-ux-agent` | ✅ | `/agent/website-ux-agent` |
| `/api/agents/tasks` | ✅ | `/agent/tasks` |

### Reading APIs (`/api/reading/*`)

| Route | Status | Backend |
|-------|--------|---------|
| `/api/reading/generate` | ✅ | Reading Agent (4001) |
| `/api/readings/[id]` | ✅ | Supabase |
| `/api/readings/history` | ✅ | Supabase |

### Coach APIs (`/api/coach/*`)

| Route | Status | Auth |
|-------|--------|------|
| `/api/coach/readings` | ✅ | Session |
| `/api/coach/readings/[id]` | ✅ | Session |
| `/api/coach/readings/[id]/regenerate` | ✅ | Session |
| `/api/coach/readings/migrate` | ✅ | Session |

### Coaching APIs (`/api/coaching/*`)

| Route | Status | Auth |
|-------|--------|------|
| `/api/coaching/bookings/[userId]` | ✅ | Session |

### Admin APIs (`/api/admin/*`)

| Route | Status | Auth |
|-------|--------|------|
| `/api/admin/audit-logs` | ✅ | Session? |
| `/api/admin/users/search` | ✅ | Session? |
| `/api/admin/users/package` | ✅ | Session? |
| `/api/admin/users/coach` | ✅ | Session? |

### System APIs (`/api/system/*`)

| Route | Status | Auth |
|-------|--------|------|
| `/api/system/agents/tasks` | ✅ | Token |

---

## 🗄️ Datenbank (Supabase)

### Tabellen

**1. `agent_tasks`**
- ✅ Vollständig implementiert
- ✅ Status-Tracking (pending, processing, completed, failed, cancelled)
- ✅ User-Zuordnung

**2. `readings`**
- ✅ Vollständig implementiert
- ✅ Status-Tracking
- ✅ User-Zuordnung

**3. `auth.users`** (Supabase Standard)
- ✅ `id` (UUID)
- ✅ `email` (String)
- ✅ `user_metadata` (JSONB) - kann `role: 'admin'` enthalten
- ✅ `raw_user_meta_data` (JSONB)

**4. `subscriptions`** (Gefunden in Admin-Code)
- ✅ `user_id` (UUID)
- ✅ `package_id` (String) - kann `'admin'` sein
- ⚠️ Vollständige Struktur unklar

**Rollen-System:**
- ✅ Admin: `subscriptions.package_id === 'admin'` ODER `user_metadata.role === 'admin'`
- ⚠️ Coach: Unklar (möglicherweise `subscriptions.package_id === 'coach'`?)
- ⚠️ User: Standard (keine spezielle Rolle?)

---

## ❌ Kritische Probleme

### 1. Registrierung ❌
- ❌ `/register` Seite fehlt komplett
- ⚠️ Wie können sich neue User registrieren?

### 2. Coach-Rolle ⚠️
- ⚠️ Wie wird Coach-Rolle erkannt?
- ⚠️ Gibt es `subscriptions.package_id === 'coach'`?
- ⚠️ Oder wird Coach über `user_metadata.role === 'coach'` erkannt?

### 3. n8n Workflows ⚠️
- ⚠️ Welche Workflows sind aktiv?
- ⚠️ Welche Webhooks werden verwendet?
- ⚠️ Sind Frontend-Prozesse mit n8n verbunden?

### 4. Chart-Berechnung ⚠️
- ⚠️ Wo läuft Chart-Berechnung? (MCP Server oder Reading Agent?)
- ⚠️ Gibt es direkte `/chart/calculate` API?

### 5. Frontend-Logs ⚠️
- ⚠️ Warnung: `TypeError: Cannot read properties of null (reading 'digest')`
- ⚠️ Zu prüfen ob kritisch

---

## ✅ Was funktioniert

1. ✅ Frontend Container läuft (healthy)
2. ✅ MCP Server läuft (3 days uptime)
3. ✅ Reading Agent läuft (41h uptime)
4. ✅ n8n läuft (7 days uptime)
5. ✅ Frontend ↔ MCP Integration funktioniert
6. ✅ Frontend ↔ Reading Agent Integration funktioniert
7. ✅ Tasks-System implementiert
8. ✅ Login-Seite existiert und ist erreichbar
9. ✅ Admin-Seite existiert
10. ✅ Alle Agent APIs existieren
11. ✅ Reading APIs existieren
12. ✅ Coach APIs existieren
13. ✅ Admin APIs existieren

---

## 🎯 Prioritäten

### Priorität 1: Registrierung implementieren ❌
1. ❌ `/register` Seite implementieren
2. ⚠️ Rollen-System prüfen (Coach-Rolle)
3. ⚠️ `subscriptions` Tabelle: Vollständige Struktur prüfen

### Priorität 2: Login-Funktionalität testen ⚠️
1. ⚠️ Login-Funktionalität testen (existiert, aber funktioniert es vollständig?)
2. ⚠️ Admin-Login testen
3. ⚠️ Coach-Login testen (verwendet `/login`?)

### Priorität 3: n8n Status klären ⚠️
1. ⚠️ n8n Workflows prüfen (welche aktiv?)
2. ⚠️ Webhook-Verbindungen prüfen
3. ⚠️ Frontend → n8n Integration prüfen

### Priorität 4: Chart-Berechnung klären ⚠️
1. ⚠️ Prüfen wo Chart-Berechnung läuft
2. ⚠️ Zentrale Chart-API implementieren (falls nötig)

### Priorität 5: Frontend-Logs prüfen ⚠️
1. ⚠️ `TypeError: Cannot read properties of null (reading 'digest')` prüfen
2. ⚠️ Zu prüfen ob kritisch

---

## 📝 Zusammenfassung

**System-Status:**
- ✅ Infrastruktur läuft (Frontend, MCP, Reading Agent, n8n)
- ✅ Integrationen funktionieren (Frontend ↔ MCP, Frontend ↔ Reading Agent)
- ✅ Login-Seite existiert und ist erreichbar
- ✅ Admin-Seite existiert
- ❌ Registrierung fehlt (`/register`)
- ⚠️ Coach-Rolle unklar
- ⚠️ n8n Workflows unklar
- ⚠️ Chart-Berechnung unklar
- ⚠️ Frontend-Logs: 
  - Sicherheitswarnung: `getSession()` sollte durch `getUser()` ersetzt werden
  - Fehler: `TypeError: Cannot read properties of null (reading 'digest')`
  - Fehler: Bild nicht gefunden

**Nächste Schritte:**
1. ❌ Registrierungs-Seite implementieren (`/register`)
2. ⚠️ Login-Funktionalität testen
3. ⚠️ Coach-Rolle klären
4. ⚠️ n8n Workflows prüfen
5. ⚠️ Chart-Berechnung klären
6. ⚠️ Frontend-Logs prüfen:
   - `getSession()` durch `getUser()` ersetzen (Sicherheitswarnung)
   - `TypeError: Cannot read properties of null (reading 'digest')` beheben
   - Fehlendes Bild prüfen

