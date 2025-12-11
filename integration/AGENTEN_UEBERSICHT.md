# 🤖 Agenten-Übersicht - Alle 5 Agenten

## 📊 Übersicht

| # | Agent | Port | Server | API-Route | Status |
|---|-------|------|--------|-----------|--------|
| 1 | **Marketing Agent** | 7000 | Hetzner (MCP) | `/api/agents/marketing` | ✅ |
| 2 | **Automation Agent** | 7000 | Hetzner (MCP) | `/api/agents/automation` | ✅ |
| 3 | **Sales Agent** | 7000 | Hetzner (MCP) | `/api/agents/sales` | ✅ |
| 4 | **Social-YouTube Agent** | 7000 | Hetzner (MCP) | `/api/agents/social-youtube` | ✅ |
| 5 | **Reading Agent** | 4001 | Hetzner (PM2) | `/api/readings/generate` | ✅ |

---

## 🤖 Agent 1: Marketing Agent

**Server:** Hetzner (138.199.237.34:7000)  
**API-Route:** `/api/agents/marketing`  
**Frontend:** `AgentChat` Komponente

**Aufgaben:**
- Marketingstrategien entwickeln
- Reels-Hooks erstellen
- Newsletter-Content generieren
- Funnel-Optimierung
- Salescopy schreiben

**Beispiel-Anfrage:**
```bash
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Gib mir 3 Hooks für ein Reel über Manifestation"}'
```

**Status:** ✅ Läuft auf Hetzner Server

---

## ⚙️ Agent 2: Automation Agent

**Server:** Hetzner (138.199.237.34:7000)  
**API-Route:** `/api/agents/automation`  
**Frontend:** `AgentChat` Komponente

**Aufgaben:**
- n8n Workflows erklären
- API-Integrationen planen
- Webhook-Konfigurationen
- Serverkonfiguration
- Automatisierungsstrategien

**Beispiel-Anfrage:**
```bash
curl -X POST http://138.199.237.34:7000/agent/automation \
  -H "Content-Type: application/json" \
  -d '{"message": "Erkläre mir einen n8n Workflow für Mailchimp"}'
```

**Status:** ✅ Läuft auf Hetzner Server

---

## 💰 Agent 3: Sales Agent

**Server:** Hetzner (138.199.237.34:7000)  
**API-Route:** `/api/agents/sales`  
**Frontend:** `AgentChat` Komponente

**Aufgaben:**
- Verkaufstexte schreiben
- Funnel-Strategien entwickeln
- Closing-Techniken
- Preisgestaltung
- Angebotsformulierungen

**Beispiel-Anfrage:**
```bash
curl -X POST http://138.199.237.34:7000/agent/sales \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle einen Verkaufstext für einen Online-Kurs"}'
```

**Status:** ✅ Läuft auf Hetzner Server

---

## 🎬 Agent 4: Social-YouTube Agent

**Server:** Hetzner (138.199.237.34:7000)  
**API-Route:** `/api/agents/social-youtube`  
**Frontend:** `AgentChat` Komponente

**Aufgaben:**
- YouTube-Video-Skripte erstellen
- Social-Media-Posts schreiben
- Thumbnail-Ideen generieren
- SEO-Optimierung
- Content-Strategien

**Beispiel-Anfrage:**
```bash
curl -X POST http://138.199.237.34:7000/agent/social-youtube \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle ein YouTube-Video-Skript über Manifestationsblockaden"}'
```

**Status:** ✅ Läuft auf Hetzner Server

---

## 🔮 Agent 5: Reading Agent

**Server:** Hetzner (138.199.237.34:4001)  
**API-Route:** `/api/readings/generate`  
**Frontend:** `ReadingGenerator` Komponente

**Aufgaben:**
- Human Design Readings generieren
- Chart-Analysen erstellen
- Persönlichkeitsanalysen
- 10 verschiedene Reading-Typen:
  - Basic Reading
  - Detailed Reading
  - Business Reading
  - Relationship Reading
  - Career Reading
  - Health & Wellness Reading
  - Parenting & Family Reading
  - Spiritual Growth Reading
  - Compatibility Reading
  - Life Purpose Reading

**Beispiel-Anfrage:**
```bash
curl -X POST http://138.199.237.34:4001/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany",
    "readingType": "detailed"
  }'
```

**Status:** ✅ Läuft auf Hetzner Server (PM2)
- 5 Knowledge-Dateien geladen
- 11 Templates geladen
- OpenAI integriert

---

## 🔗 Kommunikations-Flow

### Agenten 1-4 (über MCP Server)

```
Frontend (CK-App Server)
    │
    │ POST /api/agents/{agentId}
    ▼
Next.js API Route
    │
    │ HTTP → MCP_SERVER_URL
    ▼
MCP Server (Hetzner: 7000)
    │
    │ /agent/{agentId}
    ▼
OpenAI API (GPT-4)
    │
    │ Response
    ▼
Frontend zeigt Antwort
```

### Agent 5 (Reading Agent - eigenständig)

```
Frontend (CK-App Server)
    │
    │ POST /api/readings/generate
    ▼
Next.js API Route
    │
    │ HTTP → READING_AGENT_URL
    ▼
Reading Agent (Hetzner: 4001)
    │
    │ /reading/generate
    ▼
OpenAI API (GPT-4)
    │
    │ Response (Human Design Reading)
    ▼
Frontend zeigt Reading
```

---

## 📁 Dateien für alle Agenten

### API-Routes (5 Dateien)
- `integration/api-routes/agents-marketing.ts`
- `integration/api-routes/agents-automation.ts`
- `integration/api-routes/agents-sales.ts`
- `integration/api-routes/agents-social-youtube.ts`
- `integration/api-routes/readings-generate.ts`

### Frontend-Komponenten (2 Komponenten)
- `integration/frontend/components/AgentChat.tsx` (für Agenten 1-4)
- `integration/frontend/components/ReadingGenerator.tsx` (für Agent 5)

### Dashboard
- `integration/frontend/pages/agents-dashboard.tsx` (zeigt alle 5 Agenten)

---

## ✅ Status aller Agenten

### Hetzner Server (138.199.237.34)

**MCP Server (Port 7000):**
- ✅ Marketing Agent
- ✅ Automation Agent
- ✅ Sales Agent
- ✅ Social-YouTube Agent
- ✅ CORS aktiviert
- ✅ OpenAI integriert

**Reading Agent (Port 4001):**
- ✅ Läuft über PM2
- ✅ 5 Knowledge-Dateien
- ✅ 11 Templates
- ✅ CORS aktiviert
- ✅ OpenAI integriert

### CK-App Server (167.235.224.149)

- ❌ API-Routes noch nicht installiert
- ❌ Frontend-Komponenten noch nicht installiert
- ❌ Environment Variables noch nicht gesetzt

---

## 🎯 Zusammenfassung

**Alle 5 Agenten:**
- ✅ Auf Hetzner Server laufend
- ✅ CORS konfiguriert
- ✅ Firewall offen
- ✅ Bereit für Anfragen

**Was noch fehlt:**
- Integration-Dateien auf CK-App Server kopieren
- API-Routes installieren
- Frontend-Komponenten installieren
- Environment Variables setzen

**Die Agenten sind bereit - es fehlen nur noch die Frontend-Integration-Dateien!** 🚀

