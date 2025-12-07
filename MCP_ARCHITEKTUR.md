# 🏗️ MCP Multi-Agent System - Architektur

## 📊 System-Übersicht

```
                     ┌──────────────────────────────┐
                     │            MCP                │
                     │  Multi-Agent Control Layer    │
                     │  Port: 7000                   │
                     │  http://138.199.237.34:7000   │
                     └───────────┬──────────────────┘
                                 │
         ┌───────────────────────┼────────────────────────┐
         │                       │                        │
┌────────▼────────┐    ┌────────▼────────┐      ┌────────▼────────┐
│ Marketing-Agent │    │ Automation-Agent│      │  Sales-Agent    │
│ (Content, Ads,  │    │ (n8n, APIs,     │      │ (Funnels,       │
│  Funnels, Copy) │    │  Prozesse)       │      │  Verkaufspsych.)│
└────────┬────────┘    └────────┬────────┘      └────────┬────────┘
         │                       │                        │
         │                       │                        │
         ▼                       ▼                        ▼
 ┌───────────────┐      ┌──────────────────┐      ┌────────────────────┐
 │  liefert Texte │      │ erzeugt Flows    │      │ optimiert Verkauf  │
 │  Hooks, Reels  │      │ Webhooks, DTOs   │      │ CTAs, Sequenzen    │
 └───────────────┘      └──────────────────┘      └────────────────────┘

         ┌────────▼────────┐
         │ Social-YouTube  │
         │ Agent           │
         │ (Reels, Videos, │
         │  Thumbnails)    │
         └─────────────────┘
```

## 🔄 Datenfluss

```
Externe Systeme → MCP → Agenten

     Website (Next.js)
     Supabase Auth
     The-Connection-Key.de
             |
             v
    Mailchimp Opt-In → Lead → Tagging
             |
             v
          n8n Flow
             |
             v
   ┌─────────────────────────────┐
   │ Anfrage / Automation startet│
   └─────────┬───────────────────┘
             |
             v
     ┌───────────────┐
     │     MCP        │
     └───────────────┘
             |
             v
   Marketing-, Sales-, Automation- oder Social-YouTube-Agent
             |
             v
   Ergebnis → zurück an n8n → Mailchimp → Website
```

## 📁 Ordnerstruktur

```
/opt/mcp/
  ├── server.js              # MCP Server
  ├── mcp.config.json        # MCP Konfiguration
  ├── package.json
  └── node_modules/

/opt/ck-agent/
  ├── agents/
  │   ├── marketing.json
  │   ├── automation.json
  │   ├── sales.json
  │   └── social-youtube.json
  └── prompts/
      ├── marketing.txt
      ├── automation.txt
      ├── sales.txt
      └── social-youtube.txt
```

## 🤖 Agenten-Übersicht

### 1. Marketing Agent
- **ID:** `marketing`
- **Aufgaben:** Marketingstrategien, Reels, Newsletter, Funnels, Salescopy
- **Model:** gpt-4
- **Temperature:** 0.7

### 2. Automation Agent
- **ID:** `automation`
- **Aufgaben:** n8n-Flows, APIs, Webhooks, Serverkonfiguration
- **Model:** gpt-4
- **Temperature:** 0.2 (präzise)

### 3. Sales Agent
- **ID:** `sales`
- **Aufgaben:** Verkaufstexte, Funnels, Buyer Journey, Closing
- **Model:** gpt-4
- **Temperature:** 0.6

### 4. Social-YouTube Agent
- **ID:** `social-youtube`
- **Aufgaben:** YouTube-Skripte, Reels, Posts, Thumbnails
- **Model:** gpt-4
- **Temperature:** 0.7

## 🔌 API-Endpunkte

### Agent ansprechen

```bash
POST http://138.199.237.34:7000/agent/{agent-id}
Content-Type: application/json

{
  "message": "Deine Anfrage hier"
}
```

### Verfügbare Endpunkte

- `POST /agent/marketing` - Marketing-Agent
- `POST /agent/automation` - Automation-Agent
- `POST /agent/sales` - Sales-Agent
- `POST /agent/social-youtube` - Social-YouTube-Agent

## 🧪 Test-Beispiele

### Marketing-Agent
```bash
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message":"Gib mir 3 Hooks für ein Reel zum Thema Energie & Manifestation."}'
```

### Automation-Agent
```bash
curl -X POST http://138.199.237.34:7000/agent/automation \
  -H "Content-Type: application/json" \
  -d '{"message":"Erstelle einen n8n Flow für Mailchimp Double Opt-In."}'
```

### Sales-Agent
```bash
curl -X POST http://138.199.237.34:7000/agent/sales \
  -H "Content-Type: application/json" \
  -d '{"message":"Schreibe mir eine Salespage für ein Energetic Business Coaching."}'
```

### Social-YouTube-Agent
```bash
curl -X POST http://138.199.237.34:7000/agent/social-youtube \
  -H "Content-Type: application/json" \
  -d '{"message":"Erstelle mir ein YouTube-Video-Skript über Manifestationsblockaden."}'
```

## 🔧 Systemdienst

### Status prüfen
```bash
systemctl status mcp
```

### Logs anzeigen
```bash
journalctl -u mcp -f
```

### Neustarten
```bash
systemctl restart mcp
```

## 📝 Konfiguration

### MCP Config (`/opt/mcp/mcp.config.json`)
```json
{
  "host": "0.0.0.0",
  "port": 7000,
  "agents": [
    {
      "id": "marketing",
      "file": "/opt/ck-agent/agents/marketing.json"
    },
    {
      "id": "automation",
      "file": "/opt/ck-agent/agents/automation.json"
    },
    {
      "id": "sales",
      "file": "/opt/ck-agent/agents/sales.json"
    },
    {
      "id": "social-youtube",
      "file": "/opt/ck-agent/agents/social-youtube.json"
    }
  ]
}
```

## 🚀 Installation

Siehe: `setup-mcp-complete.sh`

```bash
chmod +x setup-mcp-complete.sh
./setup-mcp-complete.sh
```

## 🔗 Integration mit n8n

Der MCP kann von n8n aus angesprochen werden:

1. **HTTP Request Node** in n8n
2. **URL:** `http://localhost:7000/agent/{agent-id}`
3. **Method:** POST
4. **Body:** JSON mit `{"message": "..."}`

## 📊 Status & Monitoring

- **Port:** 7000
- **Health Check:** `curl http://138.199.237.34:7000/health` (falls implementiert)
- **Logs:** `journalctl -u mcp -f`

