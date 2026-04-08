# V6 — Vollständige Systemdokumentation
**Stand:** 2026-04-08 | **Autor:** Heiko / Claude Code

---

## 1. ÜBERSICHT

V6 ist das KI-Coaching-System von The Connection Key. Es besteht aus drei Modulen:

| Modul | Beschreibung | Status |
|-------|-------------|--------|
| **Coaching Sessions** | KI-Coach-Gespräche auf Basis von Human Design | ✅ Live |
| **Lernpfade** | Persönliche Entwicklungspfade mit Übungen | ✅ Live |
| **Evolution Tracker** | Analyse der Entwicklung über mehrere Readings | ✅ Live |

---

## 2. ARCHITEKTUR — WAS PASSIERT AUF WELCHEM SERVER

```
┌─────────────────────────────────────────────────────────────────────┐
│  USER (Browser)                                                      │
│  the-connection-key.de/v6/*    → V6 User-Frontend (.167:3000)       │
│  coach.the-connection-key.de/v6-sessions → Coach-Portal (.167:3002) │
└───────────────────┬────────────────────────┬────────────────────────┘
                    │                        │
                    ▼                        ▼
┌──────────────────────────┐  ┌──────────────────────────────────────┐
│  SERVER .167 (Frontend)  │  │  SERVER .167 (Coach-Portal)          │
│  frontend (Next.js :3000)│  │  frontend-coach (Next.js :3002)      │
│                          │  │                                      │
│  /v6/coaching            │  │  /v6-sessions (Coach-Ansicht)        │
│  /v6/learning            │  │  /api/v6/coach/sessions (Proxy)      │
│  /v6/evolution           │  │  /api/v6/coach/summarize (Proxy)     │
│  /api/v6/coaching        │  │  /api/v6/coach/new-session (Proxy)   │
│  /api/v6/learning        │  │  /api/v6/coach/send-note (Resend)    │
│  /api/v6/evolution       │  │                                      │
└──────────┬───────────────┘  └────────────┬─────────────────────────┘
           │  HTTP                          │  HTTP
           ▼                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  SERVER .167 — ck-agent (Express :4000)                              │
│                                                                      │
│  Alle V6-Endpunkte laufen hier. Verbindet sich mit:                  │
│  - Supabase (PostgreSQL)                                             │
│  - Anthropic Claude (claude-opus-4-6 / claude-haiku-4-5)            │
└──────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Supabase (extern)           │
│  3 Tabellen für V6           │
│  coaching_sessions           │
│  learning_paths              │
│  evolution_analyses /        │
│  v6_recent_evolution_analyses│
└──────────────────────────────┘
```

**Wichtig:** V6 läuft komplett auf Server **.167** (Frontend + ck-agent). Server **.138** ist für V6 **nicht beteiligt**.

---

## 3. DATENBANK

Alle V6-Tabellen liegen im **`public` Schema** von Supabase.

### 3a. `coaching_sessions`

Speichert jede KI-Coaching-Session mit vollem Gesprächsverlauf.

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | uuid | Primary Key |
| `user_id` | uuid | FK → auth.users |
| `reading_id` | uuid | Optional: verknüpftes Reading |
| `session_type` | text | `general` / `authority` / `strategy` / `centers` / `gates` / `profile` |
| `goal` | text | Ziel des Users für diese Session |
| `duration` | int | Geplante Dauer in Minuten |
| `status` | text | `scheduled` / `in_progress` / `completed` |
| `transcript` | jsonb | Array: `[{role, content, timestamp}]` |
| `insights` | jsonb | KI-Insights: `{key_insights[], homework[], coach_summary}` |
| `coach_notes` | jsonb | Array: `[{id, coach_id, type, text, created_at}]` |
| `started_at` | timestamptz | Session-Start |
| `completed_at` | timestamptz | Session-Abschluss |
| `created_at` | timestamptz | Erstellungsdatum |
| `updated_at` | timestamptz | Letzte Änderung |

**Transcript-Format:**
```json
[
  { "role": "coach", "content": "Willkommen...", "timestamp": "2026-04-08T..." },
  { "role": "user",  "content": "Ich frage mich...", "timestamp": "2026-04-08T..." }
]
```

**Insights-Format:**
```json
{
  "key_insights": ["Erkenntnis 1", "Erkenntnis 2"],
  "homework": ["Aufgabe 1", "Aufgabe 2"],
  "coach_summary": "Markdown-Text der KI-Zusammenfassung"
}
```

**Coach Notes-Format:**
```json
[
  { "id": "uuid", "coach_id": "uuid", "type": "note|impulse|task", "text": "...", "created_at": "..." }
]
```

---

### 3b. `learning_paths`

Speichert personalisierte Lernpfade mit Übungsfortschritt.

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | uuid | Primary Key |
| `user_id` | uuid | FK → auth.users |
| `title` | text | Titel des Lernpfads |
| `topic` | text | Thema (relationships, authority, strategy, centers) |
| `description` | text | Beschreibung |
| `duration_weeks` | int | Geplante Dauer in Wochen |
| `current_module` | int | Aktuelles Modul |
| `status` | text | `active` / `paused` / `completed` |
| `exercises` | jsonb | Array aller Übungen (generiert) |
| `completed_exercises` | jsonb | Array erledigter Übungs-IDs |
| `total_exercises` | int | Gesamtzahl Übungen |
| `completed_exercises_count` | int | Erledigte Übungen |
| `progress_percentage` | int | Fortschritt 0–100 |
| `created_at` | timestamptz | Erstellungsdatum |
| `updated_at` | timestamptz | Letzte Änderung |

**Exercises-Format (generiert von Claude):**
```json
[
  {
    "id": "ex-1",
    "title": "Übungsname",
    "description": "Was tun",
    "duration_minutes": 15,
    "module": 1,
    "type": "reflection|practice|journal",
    "reflection_prompt": "Frage zur Reflexion"
  }
]
```

---

### 3c. `evolution_analyses` / `v6_recent_evolution_analyses`

Speichert Entwicklungsanalysen basierend auf mehreren Readings.

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | uuid | Primary Key |
| `user_id` | uuid | FK → auth.users |
| `reading_ids` | uuid[] | Array analysierter Reading-IDs |
| `primary_reading_id` | uuid | Haupt-Reading |
| `overall_growth_score` | int | Wachstums-Score 0–100 |
| `key_changes` | jsonb | `[{area, change, direction}]` |
| `growth_areas` | jsonb | `[{title, description, progress}]` |
| `insights` | jsonb | `{summary, patterns, strengths}` |
| `recommendations` | jsonb | `[{title, description, priority}]` |
| `comparison_data` | jsonb | `{focus_area, readings_count}` |
| `readings_count` | int | Anzahl analysierter Readings |
| `created_at` | timestamptz | Erstellungsdatum |

> **Hinweis:** `v6_recent_evolution_analyses` ist wahrscheinlich ein View oder eine Tabelle. Der Code schreibt in `v6_recent_evolution_analyses` und liest aus `evolution_analyses`. Prüfen ob ein View existiert.

---

## 4. API-ROUTEN

### 4a. User-seitige Routen (frontend, `.167:3000`)

| Methode | Route | Beschreibung | Auth |
|---------|-------|-------------|------|
| GET | `/v6` | V6 Übersicht-Seite | User |
| GET | `/v6/coaching` | Coaching Session UI | User |
| GET | `/v6/learning` | Lernpfade UI | User |
| GET | `/v6/evolution` | Evolution Tracker UI | User |

**Next.js API Routes (Proxy → ck-agent:4000):**

| Methode | Route | Action | Ziel |
|---------|-------|--------|------|
| GET | `/api/v6/coaching` | `action=list` → Sessionen laden | `GET /api/v6/coaching/sessions/:user_id` |
| POST | `/api/v6/coaching` | `action=create` → Session starten | `POST /api/v6/coaching/session` |
| POST | `/api/v6/coaching` | `action=respond` → Nachricht senden | `POST /api/v6/coaching/session/:id/respond` |
| POST | `/api/v6/coaching` | `action=complete` → Session beenden | `POST /api/v6/coaching/session/:id/complete` |
| GET | `/api/v6/learning` | Lernpfade laden | `GET /api/v6/learning/paths/:user_id` |
| POST | `/api/v6/learning` | `action=create` → Lernpfad erstellen | `POST /api/v6/learning/path` |
| POST | `/api/v6/learning` | `action=update_progress` → Fortschritt | `POST /api/v6/learning/path/:id/progress` |
| GET | `/api/v6/evolution` | Analysen laden | `GET /api/v6/evolution/analyses/:user_id` |
| POST | `/api/v6/evolution` | Neue Analyse erstellen | `POST /api/v6/evolution/analyze` |

---

### 4b. Coach-seitige Routen (frontend-coach, `.167:3002`)

| Methode | Route | Beschreibung | Auth |
|---------|-------|-------------|------|
| GET | `/v6-sessions` | Coach-Portal: alle Sessions | Coach |
| GET | `/api/v6/coach/sessions` | Alle Sessions laden (mit Transcript) | Coach |
| POST | `/api/v6/coach/sessions` | Coach-Notiz zu Session hinzufügen | Coach |
| PATCH | `/api/v6/coach/sessions` | Session-Status ändern | Coach |
| POST | `/api/v6/coach/new-session` | Neue Session für Klienten starten | Coach |
| POST | `/api/v6/coach/summarize` | KI-Zusammenfassung generieren | Coach |
| POST | `/api/v6/coach/send-note` | Notiz per E-Mail senden (Resend) | Coach |

---

### 4c. ck-agent Endpunkte (direkt, `.167:4000`)

**Coaching:**

| Methode | Endpunkt | Body | Beschreibung |
|---------|---------|------|-------------|
| POST | `/api/v6/coaching/session` | `{user_id, session_type, goal, duration?}` | Session erstellen + KI-Begrüßung |
| POST | `/api/v6/coaching/session/:id/respond` | `{message, user_id}` | Nachricht senden, KI antwortet |
| GET | `/api/v6/coaching/sessions/:user_id` | — | Alle Sessions eines Users |
| POST | `/api/v6/coaching/session/:id/complete` | `{user_id}` | Session abschließen + Insights generieren |

**Lernpfade:**

| Methode | Endpunkt | Body | Beschreibung |
|---------|---------|------|-------------|
| POST | `/api/v6/learning/path` | `{user_id, topic, title?, description?}` | Lernpfad erstellen (KI generiert Übungen) |
| POST | `/api/v6/learning/path/:id/progress` | `{user_id, exercise_id, completed, reflection?}` | Übung abhaken |
| GET | `/api/v6/learning/paths/:user_id` | — | Alle Lernpfade eines Users |

**Evolution:**

| Methode | Endpunkt | Body | Beschreibung |
|---------|---------|------|-------------|
| POST | `/api/v6/evolution/analyze` | `{user_id, reading_ids[]?, focus_area?}` | Entwicklungsanalyse erstellen |
| GET | `/api/v6/evolution/analyses/:user_id` | — | Analysen eines Users laden |

**Coach (nur für Coach-Portal):**

| Methode | Endpunkt | Body | Beschreibung |
|---------|---------|------|-------------|
| GET | `/api/v6/coach/sessions` | `?search=&limit=50&offset=0` | Alle Sessions (alle User) mit Profil-Daten |
| POST | `/api/v6/coach/session/:id/note` | `{note, type, coach_id?}` | Coach-Notiz hinzufügen |
| POST | `/api/v6/coach/session/:id/summarize` | — | KI-Zusammenfassung via Claude Haiku |
| PATCH | `/api/v6/coach/session/:id/status` | `{status}` | Status ändern |

---

## 5. KI-MODELLE IN V6

| Feature | Modell | Warum |
|---------|--------|-------|
| Session starten (Begrüßung) | `claude-opus-4-6` | Hochwertig, erste Impression |
| Session antworten | `claude-opus-4-6` | Qualitatives Coaching |
| Session abschließen (Insights) | `claude-opus-4-6` | Strukturierte Zusammenfassung |
| Lernpfad erstellen | `claude-opus-4-6` | Vollständige Übungsplanung |
| Evolution Analyse | `claude-opus-4-6` | Tiefe Musteranalyse |
| Coach-Zusammenfassung | `claude-haiku-4-5-20251001` | Schnell, reicht für Coach-Notizen |

---

## 6. DATENFLÜSSE

### 6a. User startet eine Coaching Session

```
1. User öffnet /v6/coaching
2. Frontend POST /api/v6/coaching {action: "create", session_type, goal}
3. Next.js Proxy → ck-agent POST /api/v6/coaching/session
4. ck-agent:
   a. Lädt HD-Chart des Users aus Supabase (profiles + charts)
   b. Erstellt initialen KI-Prompt mit chartContext
   c. Claude claude-opus-4-6 generiert Begrüßung (~2000 tokens)
   d. INSERT coaching_sessions mit status=in_progress, transcript=[{role:coach,...}]
5. Frontend zeigt initiale Antwort
6. User tippt → POST /api/v6/coaching {action: "respond", message}
7. ck-agent:
   a. Lädt session.transcript aus DB
   b. Baut Messages-Array für Claude
   c. Claude antwortet
   d. Hängt {role:user} + {role:coach} an transcript an
   e. UPDATE coaching_sessions SET transcript=..., updated_at=now()
8. User klickt "Session beenden" → POST action=complete
9. ck-agent:
   a. Analysiert Transcript mit Claude
   b. Generiert {key_insights, homework}
   c. UPDATE coaching_sessions SET status=completed, insights=..., completed_at=now()
```

### 6b. Coach sieht Session im Coach-Portal

```
1. Coach öffnet coach.the-connection-key.de/v6-sessions
2. GET /api/v6/coach/sessions?limit=50
3. Next.js Proxy → ck-agent GET /api/v6/coach/sessions
4. ck-agent:
   a. SELECT * FROM coaching_sessions ORDER BY created_at DESC
   b. Lädt profiles für alle user_ids (first_name, last_name, email)
   c. Berechnet message_count = transcript.length
   d. Gibt enriched sessions zurück (inkl. vollständigem transcript)
5. Coach klickt auf Session → Transcript wird client-seitig expandiert
6. Coach klickt "KI-Zusammenfassung" → POST /api/v6/coach/summarize
7. ck-agent: Claude Haiku analysiert Transcript, speichert in insights.coach_summary
8. Coach schreibt Notiz + klickt "Senden" → POST /api/v6/coach/sessions
9. ck-agent: Hängt Note an coach_notes Array an, UPDATE DB
10. Coach klickt "E-Mail" → POST /api/v6/coach/send-note
11. Next.js: Resend API sendet dark-themed HTML-E-Mail an user_email
```

### 6c. Lernpfad erstellen

```
1. User POST /api/v6/learning {action: "create", topic, title}
2. ck-agent:
   a. Lädt HD-Chart des Users
   b. Claude generiert 8-12 personalisierte Übungen (JSON)
   c. INSERT learning_paths mit exercises=[], total_exercises=n
3. User macht Übung → POST action=update_progress {exercise_id, completed, reflection}
4. ck-agent:
   a. Fügt exercise_id zu completed_exercises hinzu
   b. Aktualisiert completed_exercises_count, progress_percentage
   c. UPDATE learning_paths
```

### 6d. Evolution Analyse

```
1. User POST /api/v6/evolution (oder Frontend-Button)
2. ck-agent:
   a. Lädt letzte 5 abgeschlossene Readings des Users aus public.readings
   b. Extrahiert chart_data, reading_data aus jedem Reading
   c. Claude claude-opus-4-6 analysiert Entwicklung (JSON-Antwort)
   d. INSERT v6_recent_evolution_analyses
3. Frontend zeigt growth_score, key_changes, growth_areas, recommendations
```

---

## 7. FRONTEND-SEITEN (User)

| Seite | Route | Features |
|-------|-------|---------|
| V6 Übersicht | `/v6` | Dashboard aller V6-Module |
| KI-Coach | `/v6/coaching` | Chat-Interface, Session starten/fortführen |
| Lernpfade | `/v6/learning` | Pfade anzeigen, Übungen abhaken |
| Evolution | `/v6/evolution` | Analysen, Wachstums-Score, Empfehlungen |

---

## 8. FRONTEND-SEITEN (Coach-Portal)

| Seite | Route | Features |
|-------|-------|---------|
| Sessions-Übersicht | `/v6-sessions` | Alle Klienten-Sessions |
| ↳ Stats | — | Gesamt / Aktiv / Fertig / Nachrichten |
| ↳ Suche | — | Nach Name/E-Mail filtern |
| ↳ Typ-Filter | — | general/authority/strategy/centers/gates/profile |
| ↳ Datum-Filter | — | 7/30/90 Tage |
| ↳ Session-Detail | — | Klik auf Session öffnet Detail-Panel |
| ↳ Chat-Verlauf | — | Vollständiger Transcript mit Bubble-Design |
| ↳ Transcript-Suche | — | Stichwort im Chat suchen, Highlighting |
| ↳ KI-Zusammenfassung | — | Claude Haiku generiert Supervisor-Bericht |
| ↳ Status ändern | — | Geplant / Aktiv / Abgeschlossen |
| ↳ Coach-Notizen | — | Notiz / Impuls / Aufgabe hinzufügen |
| ↳ E-Mail senden | — | Notiz per Resend an Klienten mailen |
| ↳ PDF Export | — | Session als dunkles PDF exportieren |
| ↳ Neue Session | — | Modal: Session für Klienten starten |

---

## 9. ENVIRONMENT VARIABLEN (V6-relevant)

### Server .167 — ck-agent

```bash
ANTHROPIC_API_KEY         # Claude API (claude-opus-4-6, claude-haiku-4-5)
NEXT_PUBLIC_SUPABASE_URL  # Supabase URL
SUPABASE_SERVICE_ROLE_KEY # Service Role für Schreibzugriff
```

### Server .167 — frontend-coach

```bash
CK_AGENT_URL=http://ck-agent:4000  # Docker-intern (nicht localhost!)
RESEND_API_KEY                      # Für E-Mail-Versand (gesetzt ✅)
RESEND_FROM_DOMAIN                  # Absender-Domain
RESEND_FROM_NAME                    # Absender-Name
```

### Server .167 — frontend

```bash
CK_AGENT_URL=http://ck-agent:4000  # Proxy zu ck-agent (Docker-intern)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

---

## 10. BEKANNTE EINSCHRÄNKUNGEN / TODOs

| # | Problem | Priorität |
|---|---------|-----------|
| 1 | `v6_recent_evolution_analyses` vs `evolution_analyses` — unklar ob View oder zwei Tabellen | Prüfen |
| 2 | Keine RLS (Row Level Security) auf V6-Tabellen explizit konfiguriert | Sicherheit |
| 3 | ck-agent läuft ohne Auth-Token-Prüfung auf den /api/v6/coach/* Endpunkten | Sicherheit |
| 4 | PDF Export: Transcript wird auf max 40 Nachrichten gekürzt | UX |
| 5 | Neue Session: User-ID muss als UUID eingegeben werden — kein User-Suche via E-Mail | UX |
| 6 | Lernpfad-Seiten (`/v6/learning`) nicht mit Coach-Portal verknüpft | Feature |
| 7 | Evolution Analyse: Mindestens 1 Reading nötig — User ohne Readings können nicht starten | UX |

---

## 11. TESTDATEN (Aktuell in DB)

- **10 coaching_sessions** (Stand 2026-04-08): 4 scheduled, 5 completed, 1 in_progress
- **Lernpfade**: unbekannte Anzahl
- **Evolution Analysen**: vorhanden in `evolution_analyses` (Supabase)

---

*Letzte Aktualisierung: 2026-04-08*
