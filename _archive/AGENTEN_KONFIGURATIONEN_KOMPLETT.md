# 🤖 Agenten-Konfigurationen & Prompts - Komplett

**Stand:** 13.12.2025

---

## 📍 Server-IP-Adressen

### Hetzner Server (MCP Server, Reading Agent, n8n)
- **IP:** `138.199.237.34`
- **MCP Server:** Port `7000` → `http://138.199.237.34:7000`
- **Reading Agent:** Port `4001` → `http://138.199.237.34:4001`
- **n8n:** Port `5678` → `https://n8n.werdemeisterdeinergedankenagent.de`
- **Domain:** `agent.the-connection-key.de`

### CK-App Server (Frontend)
- **IP:** `167.235.224.149`
- **Frontend:** Port `3000` → `http://167.235.224.149:3000`
- **Domain:** `https://agent.the-connection-key.de`

---

## 🤖 Agent 1: Marketing Agent

### Konfiguration (`/opt/ck-agent/agents/marketing.json`)
```json
{
  "id": "marketing",
  "name": "Marketing & Growth Agent",
  "description": "Erstellt Marketingstrategien, Reels, Newsletter, Funnels und Salescopy.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/marketing.txt",
  "model": "gpt-4",
  "temperature": 0.7,
  "maxTokens": 5000
}
```

### Prompt (`/opt/ck-agent/prompts/marketing.txt`)
```
Du bist der Marketing & Growth Agent.

Deine Spezialgebiete:
- Marketingstrategien
- Reels & Social Media Content
- Newsletter & E-Mail-Marketing
- Funnels & Sales-Funnels
- Salescopy & Werbetexte
- Content-Marketing
- Growth-Hacking
- Brand-Entwicklung

Deine Arbeitsweise:
1. ANALYSE: Zielgruppe, Markt, Wettbewerb
2. STRATEGIE: Klare Marketing-Strategie entwickeln
3. KREATION: Vollständigen Content erstellen
4. OPTIMIERUNG: Conversion & Engagement optimieren

Stil:
- Authentisch
- Wertvoll
- Klar & direkt
- Ergebnisfokussiert

Sprache: Deutsch
```

### API-Endpoint
```
POST http://138.199.237.34:7000/agent/marketing
```

---

## ⚙️ Agent 2: Automation Agent

### Konfiguration (`/opt/ck-agent/agents/automation.json`)
```json
{
  "id": "automation",
  "name": "Automation Agent",
  "description": "Erstellt n8n-Flows, API-Strukturen, Webhooks, Integrationen und technische Prozesse.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/automation.txt",
  "model": "gpt-4",
  "temperature": 0.2,
  "maxTokens": 6000
}
```

### Prompt (`/opt/ck-agent/prompts/automation.txt`)
```
Du bist der Automation & Tech Agent.

Du bist spezialisiert auf:
- n8n Workflows
- Zapier & Make
- Mailchimp Integrationen
- Webhooks & APIs
- JSON-Transformationen
- Serverkonfiguration
- Supabase
- Next.js Backend-Flows
- Docker & Deployment

Deine Aufgaben:
- Optimierung von Prozessen
- Erstellung von n8n-Flows
- Erstellung von API-Routen
- Debugging & Fehlerbehebung
- Konzeption technischer Systeme
- Planung von Automatisierungen

Sprache:
- Deutsch
- Technisch, präzise, lösungsorientiert
- Konkrete Schritte, keine Theorie
- Code-Beispiele wenn nötig
```

### API-Endpoint
```
POST http://138.199.237.34:7000/agent/automation
```

---

## 💰 Agent 3: Sales Agent

### Konfiguration (`/opt/ck-agent/agents/sales.json`)
```json
{
  "id": "sales",
  "name": "Sales Agent",
  "description": "Experte für Verkaufstexte, Funnels, Buyer Journey, Closing und Verkaufspsychologie.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/sales.txt",
  "model": "gpt-4",
  "temperature": 0.6,
  "maxTokens": 6000
}
```

### Prompt (`/opt/ck-agent/prompts/sales.txt`)
```
Du bist der Sales & Conversion Agent.

Schwerpunkte:
- Verkaufspsychologie
- Buyer Journey
- Storyselling
- Closing-Techniken
- Funnel-Analyse
- Conversion-Optimierung
- Argumentation
- NLP & Energetik im Verkauf
- Human Design in Verkaufsprozessen

Stil:
- direkt
- kraftvoll
- klar
- 100% ergebnisorientiert
- emotional intelligent
- kein Druck, aber Klarheit

Aufgaben:
- Optimiert Funnels
- Schreibt Salespages
- Erzeugt CTAs
- Baut Einwandbehandlung ein
- Strukturiert Verkaufs-E-Mails
- Definiert Verkaufs-Frameworks

Sprache: Deutsch
```

### API-Endpoint
```
POST http://138.199.237.34:7000/agent/sales
```

---

## 🎬 Agent 4: Social-YouTube Agent

### Konfiguration (`/opt/ck-agent/agents/social-youtube.json`)
```json
{
  "id": "social-youtube",
  "name": "Social Media & YouTube Agent",
  "description": "Erstellt YouTube-Video-Skripte, Reels, Posts, Captions, Thumbnail-Ideen und Social-Media-Content.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/social-youtube.txt",
  "model": "gpt-4",
  "temperature": 0.7,
  "maxTokens": 6000
}
```

### Prompt (`/opt/ck-agent/prompts/social-youtube.txt`)
```
Du bist der Social Media & YouTube Content Agent.

Deine Spezialgebiete:

🎬 YouTube:
- Video-Skripte (Hook, Problem, Story, Lösung, CTA)
- Thumbnail-Ideen mit hoher Klickrate
- SEO-optimierte Titel & Beschreibungen
- Tags & Keywords für maximale Reichweite
- Video-Ideen basierend auf Trends
- Struktur für verschiedene Video-Formate (Tutorials, Storytelling, Educational)

📱 Social Media (Instagram, TikTok, LinkedIn):
- Reels-Skripte (Hook, Content, CTA)
- Instagram-Posts & Captions
- Carousel-Posts mit klarer Struktur
- Story-Ideen
- Hashtag-Strategien
- Engagement-optimierte Captions

🎯 Deine Arbeitsweise:
1. ANALYSE: Verstehe Zielgruppe, Thema, Plattform
2. STRUKTUR: Erstelle klare Content-Struktur
3. KREATION: Generiere vollständigen Content (nicht nur Ideen!)
4. OPTIMIERUNG: SEO, Hashtags, Keywords, CTAs
5. FORMAT: Plattform-spezifisch optimiert

📊 Content-Struktur für YouTube:
- Hook (erste 15 Sekunden)
- Problem/Question
- Story/Insight
- Lösung/Value
- Call to Action
- Thumbnail-Beschreibung
- SEO-Titel (3 Varianten)
- Beschreibung mit Keywords
- Tags (10-15 relevante)

📱 Content-Struktur für Social Media:
- Hook (erste Zeile)
- Value-Content
- Story/Beispiel
- CTA
- Hashtags (plattformspezifisch)
- Caption-Länge optimiert

🎨 Stil & Ton:
- Authentisch
- Energetisch
- Klar & direkt
- Wertvoll
- Inspirierend
- Kein Fluff, nur Value

🌍 Sprache: Deutsch

💡 Du lieferst immer:
- Vollständigen Content (nicht nur Ideen!)
- Plattform-optimiert
- SEO-ready
```

### API-Endpoint
```
POST http://138.199.237.34:7000/agent/social-youtube
```

---

## 📊 Agent 5: Chart Development Agent

### Konfiguration (`/opt/ck-agent/agents/chart-development.json`)
```json
{
  "id": "chart-development",
  "name": "Chart Development Agent",
  "description": "Entwickelt Human Design Charts, Penta-Analyse Charts und Connection Key Charts.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/chart-development.txt",
  "model": "gpt-4",
  "temperature": 0.3,
  "maxTokens": 6000
}
```

### Prompt (`/opt/ck-agent/prompts/chart-development.txt`)
```
Du bist der Chart Development Agent.

Deine Spezialgebiete:
- Human Design Bodygraph
- Penta-Analyse Charts
- Connection Key Charts
- Chart-Berechnung & Visualisierung
- Chart-Interpretation
- Chart-Entwicklung

Deine Arbeitsweise:
1. BERECHNUNG: Chart-Daten berechnen
2. ANALYSE: Chart-Struktur analysieren
3. ENTWICKLUNG: Chart-Code entwickeln
4. CODE: Implementierung

Sprache: Deutsch
```

### API-Endpoint
```
POST http://138.199.237.34:7000/agent/chart-development
```

---

## 📖 Agent 6: Reading Agent

### Konfiguration
- **Port:** `4001`
- **Server:** `138.199.237.34`
- **URL:** `http://138.199.237.34:4001`
- **Verzeichnis:** `/opt/mcp-connection-key/production`
- **Management:** PM2

### API-Endpoint
```
POST http://138.199.237.34:4001/reading/generate
```

### Request Body
```json
{
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "birthPlace": "Berlin, Germany",
  "readingType": "detailed",
  "userId": "user-uuid-here"
}
```

---

## 📊 Übersicht aller Agenten

| Agent | ID | Port | Server | Temperature | Max Tokens | Model |
|-------|----|----|--------|-------------|------------|-------|
| Marketing | `marketing` | 7000 | MCP | 0.7 | 5000 | gpt-4 |
| Automation | `automation` | 7000 | MCP | 0.2 | 6000 | gpt-4 |
| Sales | `sales` | 7000 | MCP | 0.6 | 6000 | gpt-4 |
| Social-YouTube | `social-youtube` | 7000 | MCP | 0.7 | 6000 | gpt-4 |
| Chart Development | `chart-development` | 7000 | MCP | 0.3 | 6000 | gpt-4 |
| Reading | `reading` | 4001 | PM2 | 0.7 | 4000 | gpt-4 |

---

## 🔗 API-Endpoints Übersicht

### MCP Server (Port 7000)
```
GET  http://138.199.237.34:7000/health
GET  http://138.199.237.34:7000/agents
POST http://138.199.237.34:7000/agent/marketing
POST http://138.199.237.34:7000/agent/automation
POST http://138.199.237.34:7000/agent/sales
POST http://138.199.237.34:7000/agent/social-youtube
POST http://138.199.237.34:7000/agent/chart-development
```

### Reading Agent (Port 4001)
```
GET  http://138.199.237.34:4001/health
POST http://138.199.237.34:4001/reading/generate
```

### Frontend (Port 3000)
```
GET  http://167.235.224.149:3000/api/health
POST http://167.235.224.149:3000/api/agents/marketing
POST http://167.235.224.149:3000/api/agents/automation
POST http://167.235.224.149:3000/api/agents/sales
POST http://167.235.224.149:3000/api/agents/social-youtube
POST http://167.235.224.149:3000/api/agents/chart
POST http://167.235.224.149:3000/api/reading/generate
```

### n8n
```
https://n8n.werdemeisterdeinergedankenagent.de
```

---

## 📝 Beispiel-Requests

### Marketing Agent
```bash
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle mir eine Marketingstrategie für einen Online-Kurs über Manifestation"}'
```

### Automation Agent
```bash
curl -X POST http://138.199.237.34:7000/agent/automation \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle mir einen n8n Workflow für Mailchimp Double Opt-In"}'
```

### Sales Agent
```bash
curl -X POST http://138.199.237.34:7000/agent/sales \
  -H "Content-Type: application/json" \
  -d '{"message": "Schreibe mir eine Salespage für ein Energetic Business Coaching"}'
```

### Social-YouTube Agent
```bash
curl -X POST http://138.199.237.34:7000/agent/social-youtube \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle mir ein YouTube-Video-Skript über Manifestationsblockaden"}'
```

### Reading Agent
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

---

## 🗂️ Verzeichnisstruktur auf Server

### Hetzner Server (138.199.237.34)
```
/opt/ck-agent/
├── agents/
│   ├── marketing.json
│   ├── automation.json
│   ├── sales.json
│   ├── social-youtube.json
│   └── chart-development.json
└── prompts/
    ├── marketing.txt
    ├── automation.txt
    ├── sales.txt
    ├── social-youtube.txt
    └── chart-development.txt

/opt/mcp/
└── server.js (Port 7000)

/opt/mcp-connection-key/
└── production/
    ├── server.js (Port 4001)
    ├── knowledge/
    ├── templates/
    └── logs/
```

---

## ✅ Zusammenfassung

**Alle Agenten:**
- ✅ Vollständig konfiguriert
- ✅ Mit OpenAI (gpt-4) verbunden
- ✅ Deutschsprachig
- ✅ Sofort einsatzbereit

**Server:**
- ✅ Hetzner Server: `138.199.237.34` (MCP, Reading Agent, n8n)
- ✅ CK-App Server: `167.235.224.149` (Frontend)

**Endpoints:**
- ✅ MCP Server: `http://138.199.237.34:7000`
- ✅ Reading Agent: `http://138.199.237.34:4001`
- ✅ Frontend: `http://167.235.224.149:3000`
- ✅ n8n: `https://n8n.werdemeisterdeinergedankenagent.de`

