# 🤖 Agenten-Status - Komplettübersicht

**Stand:** 13.12.2025

---

## ✅ Agenten die Laufen

### 1. Marketing Agent
- ✅ **Status:** Läuft
- ✅ **Server:** Hetzner (138.199.237.34)
- ✅ **Port:** 7000 (MCP Server)
- ✅ **Endpoint:** `POST http://138.199.237.34:7000/agent/marketing`
- ✅ **API-Route:** `/api/agents/marketing` (Frontend)
- ✅ **Frontend:** ❌ Fehlt (keine Frontend-Seite)
- ✅ **Brand Book:** ❌ Fehlt

### 2. Automation Agent
- ✅ **Status:** Läuft
- ✅ **Server:** Hetzner (138.199.237.34)
- ✅ **Port:** 7000 (MCP Server)
- ✅ **Endpoint:** `POST http://138.199.237.34:7000/agent/automation`
- ✅ **API-Route:** `/api/agents/automation` (Frontend)
- ✅ **Frontend:** ❌ Fehlt (keine Frontend-Seite)
- ✅ **Brand Book:** ❌ Fehlt

### 3. Sales Agent
- ✅ **Status:** Läuft
- ✅ **Server:** Hetzner (138.199.237.34)
- ✅ **Port:** 7000 (MCP Server)
- ✅ **Endpoint:** `POST http://138.199.237.34:7000/agent/sales`
- ✅ **API-Route:** `/api/agents/sales` (Frontend)
- ✅ **Frontend:** ❌ Fehlt (keine Frontend-Seite)
- ✅ **Brand Book:** ❌ Fehlt

### 4. Social-YouTube Agent
- ✅ **Status:** Läuft
- ✅ **Server:** Hetzner (138.199.237.34)
- ✅ **Port:** 7000 (MCP Server)
- ✅ **Endpoint:** `POST http://138.199.237.34:7000/agent/social-youtube`
- ✅ **API-Route:** `/api/agents/social-youtube` (Frontend)
- ✅ **Frontend:** ❌ Fehlt (keine Frontend-Seite)
- ✅ **Brand Book:** ❌ Fehlt

### 5. Chart Agent
- ✅ **Status:** Läuft
- ✅ **Server:** Hetzner (138.199.237.34)
- ✅ **Port:** 7000 (MCP Server)
- ✅ **Endpoint:** `POST http://138.199.237.34:7000/agent/chart` oder `/agent/chart-development`
- ✅ **API-Route:** `/api/agents/chart` (Frontend)
- ✅ **Frontend:** ❌ Fehlt (keine Frontend-Seite)
- ✅ **Brand Book:** ❌ Fehlt

### 6. Reading Agent
- ✅ **Status:** Läuft
- ✅ **Server:** Hetzner (138.199.237.34)
- ✅ **Port:** 4001 (PM2)
- ✅ **Endpoint:** `POST http://138.199.237.34:4001/reading/generate`
- ✅ **API-Route:** `/api/reading/generate` (Frontend)
- ✅ **Frontend:** ✅ Vorhanden (`ReadingGenerator.tsx`)
- ✅ **Brand Book:** ✅ Integriert

---

## 📊 Status-Übersicht

| Agent | Backend | API-Route | Frontend | Brand Book | Status |
|-------|---------|-----------|----------|------------|--------|
| Marketing | ✅ | ✅ | ❌ | ❌ | Läuft, Frontend fehlt |
| Automation | ✅ | ✅ | ❌ | ❌ | Läuft, Frontend fehlt |
| Sales | ✅ | ✅ | ❌ | ❌ | Läuft, Frontend fehlt |
| Social-YouTube | ✅ | ✅ | ❌ | ❌ | Läuft, Frontend fehlt |
| Chart | ✅ | ✅ | ❌ | ❌ | Läuft, Frontend fehlt |
| Reading | ✅ | ✅ | ✅ | ✅ | ✅ Vollständig |

---

## ❌ Was fehlt noch?

### 1. Frontend-Seiten für 5 Agenten (KRITISCH)

**Status:** API-Routes existieren, aber keine Frontend-Seiten

**Was fehlt:**
- ❌ `/coach/agents/marketing` - Marketing Agent Frontend
- ❌ `/coach/agents/automation` - Automation Agent Frontend
- ❌ `/coach/agents/sales` - Sales Agent Frontend
- ❌ `/coach/agents/social-youtube` - Social-YouTube Agent Frontend
- ❌ `/coach/agents/chart` - Chart Agent Frontend

**Was zu tun ist:**
1. Frontend-Komponenten erstellen (ähnlich wie `ReadingGenerator.tsx`)
2. Seiten erstellen (`app/coach/agents/[agent]/page.tsx`)
3. Navigation hinzufügen
4. Brand Book Integration

**Geschätzter Aufwand:** 2-3 Stunden

---

### 2. Brand Book Integration für 5 Agenten

**Status:** Reading Agent hat Brand Book, andere nicht

**Was fehlt:**
- ❌ Marketing Agent → Brand Book Integration
- ❌ Automation Agent → Brand Book Integration
- ❌ Sales Agent → Brand Book Integration
- ❌ Social-YouTube Agent → Brand Book Integration
- ❌ Chart Agent → Brand Book Integration

**Was zu tun ist:**
1. Brand Book in Agent-Prompts integrieren
2. Brand Book-Dateien in Agent-Konfigurationen referenzieren
3. Agent-Prompts aktualisieren

**Geschätzter Aufwand:** 1-2 Stunden

---

### 3. n8n Workflows aktivieren

**Status:** 3 Workflows aktiviert, 12 Workflows nicht aktiviert

**Aktiviert:**
- ✅ "Reading Generation (ohne Mattermost)"
- ✅ "Chart Calculation - Human Design"
- ✅ "Tägliche Marketing-Content-Generierung"

**Nicht aktiviert:**
- ❌ `reading-generation-workflow.json` (neu, Phase 3)
- ❌ `scheduled-reading-generation.json` (neu, Phase 3)
- ❌ `user-registration-reading.json` (neu, Phase 3)
- ❌ `agent-automation-workflows.json`
- ❌ `multi-agent-pipeline.json`
- ❌ `mailchimp-subscriber.json`
- ❌ Mattermost-Notifications (6 Workflows)

**Was zu tun ist:**
1. Workflows in n8n importieren
2. Workflows aktivieren
3. Webhooks konfigurieren
4. Environment Variables prüfen

**Geschätzter Aufwand:** 30-45 Minuten

---

### 4. Status-basierte n8n Integration

**Status:** Reading-API verwendet Status-Modell, n8n Workflows reagieren noch nicht darauf

**Was fehlt:**
- ❌ Status-Polling in n8n Workflows
- ❌ Reaktion auf Status-Änderungen (`pending` → `processing` → `completed`/`failed`)
- ❌ Benachrichtigungen bei Status-Änderungen

**Was zu tun ist:**
1. `reading-generation-workflow.json` anpassen:
   - Status-Polling hinzufügen
   - Reaktion auf Status-Änderungen
2. Workflow aktivieren

**Geschätzter Aufwand:** 30-45 Minuten

---

### 5. Event-Trigger einrichten

**Status:** Keine Event-Trigger aktiv

**Was fehlt:**
- ❌ User-Registrierung → Reading generieren
- ❌ Neuer Abonnent → Mailchimp
- ❌ Chart-Berechnung → n8n Webhook

**Was zu tun ist:**
1. Webhooks in Next.js App erstellen (falls nicht vorhanden)
2. n8n Workflows aktivieren
3. Webhooks konfigurieren

**Geschätzter Aufwand:** 1-2 Stunden

---

### 6. Supabase Migration ausführen

**Status:** Migration erstellt, aber noch nicht ausgeführt

**Was fehlt:**
- ❌ `003_add_processing_status.sql` Migration ausführen
- ❌ `reading_status_history` Tabelle erstellen
- ❌ `get_reading_status` Funktion erstellen

**Was zu tun ist:**
1. Supabase Dashboard öffnen
2. SQL Editor → Migration ausführen
3. Tabellen prüfen

**Geschätzter Aufwand:** 5-10 Minuten

---

## 🎯 Prioritäten

### 🔴 Priorität 1 (Kritisch - sofort)

1. **Frontend-Seiten für 5 Agenten erstellen**
   - Marketing, Automation, Sales, Social-YouTube, Chart
   - **Aufwand:** 2-3 Stunden
   - **Status:** ❌ Nicht vorhanden

2. **Supabase Migration ausführen**
   - `003_add_processing_status.sql`
   - **Aufwand:** 5-10 Minuten
   - **Status:** ❌ Nicht ausgeführt

### 🟡 Priorität 2 (Wichtig - diese Woche)

3. **Brand Book Integration für 5 Agenten**
   - Agent-Prompts aktualisieren
   - **Aufwand:** 1-2 Stunden
   - **Status:** ❌ Nicht integriert

4. **n8n Workflows aktivieren**
   - Neue Reading-Agent Workflows
   - **Aufwand:** 30-45 Minuten
   - **Status:** ❌ Nicht aktiviert

5. **Status-basierte n8n Integration**
   - Workflows anpassen
   - **Aufwand:** 30-45 Minuten
   - **Status:** ❌ Nicht implementiert

### 🟢 Priorität 3 (Optional - später)

6. **Event-Trigger einrichten**
   - User-Registrierung, Mailchimp
   - **Aufwand:** 1-2 Stunden
   - **Status:** ❌ Nicht aktiv

---

## 📋 Checkliste: Was funktioniert vs. Was fehlt

### ✅ Was funktioniert

- ✅ Alle 6 Agenten laufen (Backend)
- ✅ Alle 6 Agenten haben API-Routes (Frontend)
- ✅ Reading Agent hat vollständige Frontend-Integration
- ✅ Reading Agent hat Brand Book Integration
- ✅ n8n läuft und ist erreichbar
- ✅ 3 n8n Workflows aktiviert
- ✅ MCP Server läuft (Port 7000)
- ✅ Reading Agent läuft (Port 4001)

### ❌ Was fehlt

- ❌ Frontend-Seiten für 5 Agenten (Marketing, Automation, Sales, Social-YouTube, Chart)
- ❌ Brand Book Integration für 5 Agenten
- ❌ 12 n8n Workflows aktivieren
- ❌ Status-basierte n8n Integration
- ❌ Event-Trigger einrichten
- ❌ Supabase Migration ausführen

---

## 🚀 Quick Start: Nächste Schritte

### Schritt 1: Supabase Migration (5-10 Min)

1. Supabase Dashboard öffnen
2. SQL Editor → `integration/supabase/migrations/003_add_processing_status.sql` ausführen
3. Tabellen prüfen

### Schritt 2: Frontend-Seiten erstellen (2-3 Stunden)

**Für jeden Agent:**
1. Komponente erstellen (`components/agents/[Agent]Generator.tsx`)
2. Seite erstellen (`app/coach/agents/[agent]/page.tsx`)
3. Navigation hinzufügen

**Beispiel-Struktur:**
```
components/agents/
├── ReadingGenerator.tsx (✅ vorhanden)
├── MarketingGenerator.tsx (❌ fehlt)
├── AutomationGenerator.tsx (❌ fehlt)
├── SalesGenerator.tsx (❌ fehlt)
├── SocialYouTubeGenerator.tsx (❌ fehlt)
└── ChartGenerator.tsx (❌ fehlt)

app/coach/agents/
├── reading/
│   └── page.tsx (✅ vorhanden)
├── marketing/
│   └── page.tsx (❌ fehlt)
├── automation/
│   └── page.tsx (❌ fehlt)
├── sales/
│   └── page.tsx (❌ fehlt)
├── social-youtube/
│   └── page.tsx (❌ fehlt)
└── chart/
    └── page.tsx (❌ fehlt)
```

### Schritt 3: Brand Book Integration (1-2 Stunden)

**Für jeden Agent:**
1. Brand Book-Datei in Prompt referenzieren
2. Prompt aktualisieren
3. Agent-Konfiguration prüfen

### Schritt 4: n8n Workflows aktivieren (30-45 Min)

1. n8n öffnen
2. Workflows importieren
3. Workflows aktivieren
4. Webhooks konfigurieren

---

## 📊 Zusammenfassung

**Läuft (✅):**
- ✅ 6 Agenten (Backend)
- ✅ 6 API-Routes (Frontend)
- ✅ 1 Frontend-Seite (Reading)
- ✅ 1 Brand Book Integration (Reading)
- ✅ 3 n8n Workflows aktiviert

**Fehlt (❌):**
- ❌ 5 Frontend-Seiten
- ❌ 5 Brand Book Integrationen
- ❌ 12 n8n Workflows aktivieren
- ❌ Status-basierte Integration
- ❌ Event-Trigger
- ❌ Supabase Migration

**Gesamtaufwand:** ~5-7 Stunden für vollständige Integration

---

## 🎯 Empfohlene Reihenfolge

1. **Supabase Migration** (5-10 Min) ← **SOFORT**
2. **Frontend-Seiten** (2-3 Stunden) ← **NÄCHSTER SCHRITT**
3. **Brand Book Integration** (1-2 Stunden)
4. **n8n Workflows aktivieren** (30-45 Min)
5. **Status-basierte Integration** (30-45 Min)
6. **Event-Trigger** (1-2 Stunden)

