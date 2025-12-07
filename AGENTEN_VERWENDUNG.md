# 🤖 Agenten verwenden - Komplette Anleitung

## ✅ Was bereits funktioniert

- ✅ MCP Server läuft auf Port 7000
- ✅ OpenAI Integration aktiv
- ✅ 4 Agenten verfügbar:
  - Marketing Agent
  - Automation Agent
  - Sales Agent
  - Social-YouTube Agent

## 🚀 Agenten verwenden

### Option 1: Direkt über HTTP-Request (curl, Postman, etc.)

**Marketing-Agent:**
```bash
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message":"Gib mir 3 Hooks für ein Reel über Manifestation"}'
```

**Automation-Agent:**
```bash
curl -X POST http://138.199.237.34:7000/agent/automation \
  -H "Content-Type: application/json" \
  -d '{"message":"Erkläre mir einen n8n Workflow für Mailchimp"}'
```

**Sales-Agent:**
```bash
curl -X POST http://138.199.237.34:7000/agent/sales \
  -H "Content-Type: application/json" \
  -d '{"message":"Schreibe mir eine Salespage für ein Energetic Business Coaching"}'
```

**Social-YouTube-Agent:**
```bash
curl -X POST http://138.199.237.34:7000/agent/social-youtube \
  -H "Content-Type: application/json" \
  -d '{"message":"Erstelle mir ein YouTube-Video-Skript über Manifestationsblockaden"}'
```

### Option 2: Von n8n aus aufrufen

#### Schritt 1: n8n öffnen
```
https://n8n.werdemeisterdeinergedankenagent.de
```

#### Schritt 2: Neuen Workflow erstellen

1. **Klicken Sie auf "Workflows" → "Add Workflow"**

2. **Webhook Node hinzufügen:**
   - Ziehen Sie einen "Webhook" Node in den Workflow
   - Konfigurieren:
     - **HTTP Method:** POST
     - **Path:** `test-agent` (oder beliebig)
     - **Response Mode:** "When Last Node Finishes"

3. **HTTP Request Node hinzufügen:**
   - Ziehen Sie einen "HTTP Request" Node in den Workflow
   - Verbinden Sie ihn mit dem Webhook Node
   - Konfigurieren:
     - **Method:** POST
     - **URL:** `http://localhost:7000/agent/marketing`
     - **Authentication:** None
     - **Send Body:** Yes
     - **Body Content Type:** JSON
     - **JSON Body:**
       ```json
       {
         "message": "={{ $json.body.message }}"
       }
       ```

4. **Workflow aktivieren:**
   - Klicken Sie auf den "Active" Toggle (oben rechts)

5. **Testen:**
   - Kopieren Sie die Webhook-URL
   - Testen Sie mit curl:
     ```bash
     curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/test-agent \
       -H "Content-Type: application/json" \
       -d '{"message":"Gib mir 3 Hooks für ein Reel"}'
     ```

### Option 3: Von Next.js App aus aufrufen

**API Route erstellen:** `/pages/api/agent.ts` oder `/app/api/agent/route.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { agentId, message } = req.body;

  if (!agentId || !message) {
    return res.status(400).json({ message: "agentId and message required" });
  }

  try {
    const response = await fetch(`http://138.199.237.34:7000/agent/${agentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Agent request failed" });
  }
}
```

**Verwendung in Frontend:**
```typescript
const response = await fetch("/api/agent", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    agentId: "marketing",
    message: "Gib mir 3 Hooks für ein Reel"
  })
});

const data = await response.json();
console.log(data.response); // KI-Antwort
```

## 📋 Verfügbare Agenten

### 1. Marketing Agent (`marketing`)
**Aufgaben:**
- Marketingstrategien
- Reels & Social Media Content
- Newsletter & E-Mail-Marketing
- Funnels & Sales-Funnels
- Salescopy & Werbetexte

**Beispiel:**
```json
{
  "message": "Erstelle mir eine Marketingstrategie für einen Online-Kurs über Manifestation"
}
```

### 2. Automation Agent (`automation`)
**Aufgaben:**
- n8n Workflows
- API-Strukturen
- Webhooks
- Serverkonfiguration
- Supabase Integrationen

**Beispiel:**
```json
{
  "message": "Erstelle mir einen n8n Workflow für Mailchimp Double Opt-In"
}
```

### 3. Sales Agent (`sales`)
**Aufgaben:**
- Verkaufstexte
- Funnels
- Buyer Journey
- Closing-Techniken
- Verkaufspsychologie

**Beispiel:**
```json
{
  "message": "Schreibe mir eine Salespage für ein Energetic Business Coaching"
}
```

### 4. Social-YouTube Agent (`social-youtube`)
**Aufgaben:**
- YouTube-Video-Skripte
- Reels-Skripte
- Instagram-Posts
- Thumbnail-Ideen
- SEO-Optimierung

**Beispiel:**
```json
{
  "message": "Erstelle mir ein YouTube-Video-Skript über Manifestationsblockaden"
}
```

## 🔧 Was wird benötigt?

### ✅ Bereits vorhanden:
- ✅ MCP Server läuft
- ✅ OpenAI Integration aktiv
- ✅ OPENAI_API_KEY in .env gesetzt
- ✅ Alle 4 Agenten funktionsfähig

### 📝 Optional (für erweiterte Nutzung):

1. **n8n Integration:**
   - Workflow erstellen (siehe oben)
   - Agenten von n8n aus aufrufen

2. **Next.js Integration:**
   - API Route erstellen (siehe oben)
   - Agenten von Frontend aus aufrufen

3. **Weitere Agenten hinzufügen:**
   - Neue Prompts in `/opt/ck-agent/prompts/` erstellen
   - Neue Configs in `/opt/ck-agent/agents/` erstellen
   - MCP Server neu starten: `systemctl restart mcp`

## 🧪 Testen

**Alle Agenten testen:**
```bash
# Health Check
curl http://138.199.237.34:7000/health

# Agenten auflisten
curl http://138.199.237.34:7000/agents

# Marketing-Agent testen
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message":"Test"}'
```

## 🎯 Typische Use Cases

### 1. Content-Generierung
- Marketing-Agent: Reels, Posts, Newsletter
- Social-YouTube-Agent: Video-Skripte, Thumbnails

### 2. Automatisierung
- Automation-Agent: n8n Workflows, API-Integrationen

### 3. Verkauf
- Sales-Agent: Salespages, Funnels, CTAs

### 4. Kombiniert in n8n
- Workflow: Mailchimp → n8n → Marketing-Agent → Content generieren → Zurück an Mailchimp

## 🚨 Troubleshooting

### Agent antwortet nicht
- Prüfen: `systemctl status mcp`
- Prüfen: `curl http://138.199.237.34:7000/health`
- Logs: `journalctl -u mcp -f`

### OpenAI Fehler
- Prüfen: `grep OPENAI_API_KEY /opt/mcp-connection-key/.env`
- Prüfen: Key ist gültig und hat Credits

### Agent gibt Platzhalter zurück
- OpenAI Integration nicht aktiv
- Führen Sie aus: `./setup-openai-integration.sh`

## 🎉 Fertig!

Ihre Agenten sind bereit und funktionsfähig. Sie können sie jetzt über HTTP-Requests, n8n oder Next.js verwenden!

