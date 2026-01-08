# 🏗️ CONNECTION-KEY MULTI-AGENT SYSTEM - ÜBERSICHT

**Datum:** 8. Januar 2026  
**Status:** ⚠️ **Teilweise implementiert, nicht deployed**

---

## 🎯 GESAMTARCHITEKTUR

```
┌─────────────────────────────────────────────────────────────────┐
│  USER (Browser)                                                  │
│  the-connection-key.de                                           │
└────────────┬─────────────────────────────────────────────────────┘
             │
             │ 1. Geburtsdaten eingeben
             ▼
┌─────────────────────────────────────────────────────────────────┐
│  CK-APP FRONTEND (Server 167)                                    │
│  Next.js Application                                             │
│                                                                   │
│  - User Interface                                                │
│  - Formular für Geburtsdaten                                     │
│  - Reading-Anzeige                                               │
└────────────┬─────────────────────────────────────────────────────┘
             │
             │ 2. POST zu MCP Server
             ▼
┌─────────────────────────────────────────────────────────────────┐
│  MCP SERVER (138.199.237.34)                                     │
│  mcp.the-connection-key.de                                       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CHART-TRUTH-SERVICE (Zentrale Chart-Berechnung)         │   │
│  │  Status: ⚠️ NICHT FERTIG (nutzt Demo-Daten!)            │   │
│  │                                                           │   │
│  │  - /api/chart/calculate                                  │   │
│  │  - Bodygraph Engine                                      │   │
│  │  - Astronomy Engine                                      │   │
│  │  - Persistierung in Supabase                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│             │                                                     │
│             │ Chart-Daten                                         │
│             ▼                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  AGENT ORCHESTRATOR                                      │   │
│  │  Registry: production/agents/registry.ts                 │   │
│  │                                                           │   │
│  │  ✅ Implementiert, ❌ nicht deployed                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│             │                                                     │
│             │ Verteilt an spezialisierte Agents                  │
│             ▼                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  READING-AGENTS (Human Design Interpretationen)          │   │
│  │                                                           │   │
│  │  ✅ reading-agent (PM2, Port 4000) - AKTIV!             │   │
│  │                                                           │   │
│  │  4 Spezialisierte Agents (registry.ts):                  │   │
│  │  ❌ business         (Entscheidungen, Energie)          │   │
│  │  ❌ relationship     (Nähe, Kommunikation)              │   │
│  │  ❌ crisis           (Regulation, Stabilität)           │   │
│  │  ❌ personality      (Selbstbild, Entwicklung)          │   │
│  └──────────────────────────────────────────────────────────┘   │
│             │                                                     │
│             │ OpenAI API Calls                                    │
│             ▼                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  DEVELOPMENT-AGENTS (Code/Content Generierung)            │   │
│  │                                                           │   │
│  │  8 Tool-Agents (integration/api-routes/):                │   │
│  │  ❌ agents-automation.ts          (Workflow-Automation)  │   │
│  │  ❌ agents-chart-architect.ts     (Chart-Architektur)    │   │
│  │  ❌ agents-chart-development.ts   (Chart-Code)          │   │
│  │  ❌ agents-marketing.ts           (Marketing-Content)    │   │
│  │  ❌ agents-sales.ts               (Sales-Content)        │   │
│  │  ❌ agents-social-youtube.ts      (Social Media)        │   │
│  │  ❌ agents-video-creation.ts      (Video-Content)       │   │
│  │  ❌ agents-website-ux.ts          (UX-Optimierung)      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 📊 STATUS-ÜBERSICHT

### ✅ **WAS FUNKTIONIERT (DEPLOYED)**

| Komponente | Status | Details |
|------------|--------|---------|
| CK-App Frontend (167) | ✅ Online | Next.js, Port 3000, SSL |
| MCP Connection-Key Server (138) | ✅ Online | Express, Port 3000 |
| Reading Agent (PM2) | ✅ Aktiv | Port 4000, 3 Tage Uptime |
| n8n Workflows | ✅ Aktiv | 5 Workflows, Port 5678 |
| Supabase Integration | ✅ Fertig | Client + 4 Tabellen |
| Stripe Webhook | ✅ Fertig | Empfang + Persistenz |
| Redis Queue | ✅ Läuft | Container, Port 6379 |

---

### ⚠️ **WAS TEILWEISE FUNKTIONIERT**

| Komponente | Status | Problem |
|------------|--------|---------|
| Chart-Truth-Service | ⚠️ 30% | Nutzt Demo-Daten statt echte Berechnung |
| Bodygraph Engine | ⚠️ 50% | Code existiert, aber nicht integriert |
| Agent Orchestrator | ⚠️ 80% | Implementiert, aber nicht deployed |
| Chart-Calculation | ⚠️ Duplikat | 2 Versionen (167 aktuell, 138 veraltet) |

---

### ❌ **WAS FEHLT / NICHT DEPLOYED**

| Komponente | Status | Aufwand |
|------------|--------|---------|
| **Chart-Truth-Service** | ❌ | 4-6 Std |
| 4 Reading-Agents (Business/Relationship/Crisis/Personality) | ❌ | 2-3 Std |
| 8 Development-Agents | ❌ | 4-6 Std |
| Job-Worker System | ❌ | 2-3 Std |
| Bodygraph Branch mergen | ❌ | 1-2 Std |

---

## 🎯 DIE 11+ TASKS/AGENTS

### **GRUPPE A: READING-AGENTS (Human Design)** 🧘

1. ✅ **reading-agent** (PM2, Port 4000) - AKTIV!
   - Generiert HD Readings
   - OpenAI Integration
   - 16 Knowledge-Dateien
   - 11 Templates

2. ❌ **business-agent**
   - Kontext: Entscheidungen, Energieeinsatz, Execution
   - Fokus: Zusammenarbeit, Kommunikation, Positionierung

3. ❌ **relationship-agent**
   - Kontext: Nähe/Distanz, Bindung, Kommunikation
   - Fokus: Interpersonelle Dynamiken

4. ❌ **crisis-agent**
   - Kontext: Regulation, Stabilisierung, Orientierung
   - Fokus: Krisenbewältigung

5. ❌ **personality-agent**
   - Kontext: Selbstbild, Muster, Entwicklung
   - Fokus: Persönlichkeitsentwicklung

---

### **GRUPPE B: DEVELOPMENT-AGENTS (Tools)** 🛠️

6. ❌ **automation-agent**
   - Workflow-Automation
   - N8N Integration

7. ❌ **chart-architect-agent**
   - Chart-Architektur Design
   - System-Design

8. ❌ **chart-development-agent**
   - Chart-Code Generierung
   - Component Development

9. ❌ **marketing-agent**
   - Marketing-Content Erstellung
   - Kampagnen-Planung

10. ❌ **sales-agent**
    - Sales-Content
    - Conversion-Optimierung

11. ❌ **social-youtube-agent**
    - Social Media Content
    - YouTube-Optimierung

12. ❌ **video-creation-agent**
    - Video-Content Generierung
    - Script-Erstellung

13. ❌ **website-ux-agent**
    - UX-Optimierung
    - User Journey Design

---

## 🚀 PRIORISIERUNG

### **OPTION 1: CHART-TRUTH-SERVICE FERTIGSTELLEN** ⭐⭐⭐ KRITISCH

**Ziel:** Zentrale, echte Chart-Berechnung auf MCP Server

**Was zu tun:**
1. Aktuelle Chart-Calculation von Server 167 → 138 synchronisieren
2. Bodygraph Engine integrieren
3. API-Endpoint `/api/chart/calculate` fertigstellen
4. Persistierung in Supabase
5. Demo-Daten ersetzen durch echte Berechnung

**Zeitaufwand:** 4-6 Stunden

**Ergebnis:**
- ✅ Zentrale Chart-Wahrheit
- ✅ Basis für alle Agents
- ✅ Keine Duplikate mehr

---

### **OPTION 2: READING-AGENTS AKTIVIEREN** ⭐⭐ WICHTIG

**Ziel:** 4 spezialisierte Reading-Agents deployen

**Was zu tun:**
1. Agent Registry deployen
2. Orchestrator aktivieren
3. 4 Agents als PM2 Prozesse starten
4. API-Routes aktivieren

**Zeitaufwand:** 2-3 Stunden

**Ergebnis:**
- ✅ Business Readings
- ✅ Relationship Readings
- ✅ Crisis Readings
- ✅ Personality Readings

---

### **OPTION 3: JOB-WORKER SYSTEM** ⭐ OPTIONAL

**Ziel:** Reading-Generierung mit Queue-System

**Was zu tun:**
1. Job-Worker implementieren (bereits angefangen)
2. Frontend API anpassen
3. Status-Polling

**Zeitaufwand:** 2-3 Stunden

**Ergebnis:**
- ✅ Asynchrone Verarbeitung
- ✅ Frontend entlastet

---

### **OPTION 4: DEVELOPMENT-AGENTS** ⭐ NICE-TO-HAVE

**Ziel:** 8 Tool-Agents aktivieren

**Zeitaufwand:** 4-6 Stunden

**Ergebnis:**
- ✅ Code-Generierung
- ✅ Content-Erstellung
- ✅ Automatisierung

---

## 💡 EMPFOHLENER PLAN

### **PHASE 1: FUNDAMENT** (4-6 Std) 🔴 KRITISCH

1. ✅ Redis installiert
2. ⏳ Chart-Truth-Service fertigstellen
3. ⏳ Bodygraph Engine integrieren
4. ⏳ Demo-Daten ersetzen

**Nach Phase 1:**
- ✅ Zentrale Chart-Berechnung läuft
- ✅ Alle Agents können darauf zugreifen

---

### **PHASE 2: READING-AGENTS** (2-3 Std) 🟡 WICHTIG

1. Agent Registry deployen
2. 4 Reading-Agents aktivieren
3. Orchestrator starten
4. API-Routes aktivieren

**Nach Phase 2:**
- ✅ 4 spezialisierte Reading-Kontexte
- ✅ Multi-Agent-System läuft

---

### **PHASE 3: JOB-WORKER** (2-3 Std) 🟢 OPTIONAL

1. Job-Worker implementieren
2. Frontend anpassen
3. Queue-System nutzen

**Nach Phase 3:**
- ✅ Asynchrone Verarbeitung
- ✅ Skalierbar

---

### **PHASE 4: DEVELOPMENT-AGENTS** (4-6 Std) 🔵 NICE-TO-HAVE

1. 8 Tool-Agents deployen
2. Content-Generierung
3. Automatisierung

---

## 🤔 ENTSCHEIDUNG

**Was möchtest du JETZT priorisieren?**

**A) CHART-TRUTH-SERVICE FERTIGSTELLEN** (4-6 Std) ⭐⭐⭐
   → Fundament für ALLES, kritisch!

**B) NUR READING-JOBS AUSLAGERN** (2-3 Std) ⭐⭐
   → Schnelle Verbesserung, pragmatisch

**C) COMPLETE SYSTEM** (12-18 Std) ⭐⭐⭐⭐⭐
   → Alles fertigstellen, perfekt!

**D) PAUSE & ANALYSE** 
   → System dokumentieren, dann entscheiden

---

**MEINE EMPFEHLUNG:** **A) Chart-Truth-Service zuerst!**

**Warum?**
- ✅ Ist das **Fundament** für ALLES
- ✅ Ohne das funktionieren die Agents nicht richtig
- ✅ Eliminiert Duplikate (2 Chart-Calculation Versionen)
- ✅ Bodygraph Branch kann gemerged werden
- ✅ Nach 4-6 Stunden ist die BASIS da

**Dann kann man Phase 2-4 nach Bedarf machen!**
