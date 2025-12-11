# 🤖 Alle 5 Agenten - Komplette Übersicht

## 📊 Übersicht aller Agenten

| # | Agent | Server | Port | Deployment | Status |
|---|-------|--------|------|------------|--------|
| 1 | **Marketing Agent** | MCP Server | 7000 | PM2/Systemd | ✅ Läuft |
| 2 | **Automation Agent** | MCP Server | 7000 | PM2/Systemd | ✅ Läuft |
| 3 | **Sales Agent** | MCP Server | 7000 | PM2/Systemd | ✅ Läuft |
| 4 | **Social-YouTube Agent** | MCP Server | 7000 | PM2/Systemd | ✅ Läuft |
| 5 | **Reading Agent** | Production Server | 4001 | PM2 | ⚠️ Noch zu starten |

---

## 1. 🎯 Marketing Agent

**Server:** MCP Server (Port 7000)  
**ID:** `marketing`  
**Hauptaufgaben:**
- Marketingstrategien entwickeln
- Reels & Social Media Content erstellen
- Newsletter & E-Mail-Marketing
- Funnels & Sales-Funnels planen
- Salescopy & Werbetexte schreiben

**API-Endpoint:**
```bash
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle mir eine Marketingstrategie"}'
```

---

## 2. ⚙️ Automation Agent

**Server:** MCP Server (Port 7000)  
**ID:** `automation`  
**Hauptaufgaben:**
- n8n Workflows erstellen
- Zapier & Make Integrationen
- Mailchimp Automatisierungen
- Webhooks & APIs konzipieren
- Serverkonfiguration

**API-Endpoint:**
```bash
curl -X POST http://138.199.237.34:7000/agent/automation \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle einen n8n Workflow für Mailchimp"}'
```

---

## 3. 💰 Sales Agent

**Server:** MCP Server (Port 7000)  
**ID:** `sales`  
**Hauptaufgaben:**
- Verkaufspsychologie anwenden
- Buyer Journey optimieren
- Storyselling Techniken
- Closing-Techniken
- Funnel-Analyse

**API-Endpoint:**
```bash
curl -X POST http://138.199.237.34:7000/agent/sales \
  -H "Content-Type: application/json" \
  -d '{"message": "Schreibe mir eine Salespage"}'
```

---

## 4. 🎬 Social-YouTube Agent

**Server:** MCP Server (Port 7000)  
**ID:** `social-youtube`  
**Hauptaufgaben:**
- YouTube-Video-Skripte erstellen
- Thumbnail-Ideen
- SEO-optimierte Titel & Beschreibungen
- Reels-Skripte
- Instagram-Posts & Captions

**API-Endpoint:**
```bash
curl -X POST http://138.199.237.34:7000/agent/social-youtube \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle mir ein YouTube-Video-Skript"}'
```

---

## 5. 📖 Reading Agent

**Server:** Production Server (Port 4001)  
**ID:** `reading`  
**Hauptaufgaben:**
- Human Design Readings generieren
- 10 verschiedene Reading-Typen (basic, detailed, business, relationship, career, health, parenting, spiritual, compatibility, life-purpose)
- Knowledge-Dateien integrieren
- Template-Dateien verwenden

**API-Endpoint:**
```bash
curl -X POST http://138.199.237.34:4001/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "detailed"
  }'
```

**Status:** ⚠️ Noch nicht gestartet (muss auf Port 4001 gestartet werden)

---

## 🏗️ Architektur

```
┌─────────────────────────────────────────┐
│         Hetzner Server                   │
│      (138.199.237.34)                   │
└─────────────────────────────────────────┘
           │
           ├──► MCP Server (Port 7000)
           │    ├──► Marketing Agent
           │    ├──► Automation Agent
           │    ├──► Sales Agent
           │    └──► Social-YouTube Agent
           │
           ├──► Production Server (Port 4001)
           │    └──► Reading Agent ⚠️
           │
           ├──► Docker Services
           │    ├──► chatgpt-agent (Port 4000)
           │    ├──► connection-key (Port 3000)
           │    └──► n8n (Port 5678)
```

---

## 🔍 Status prüfen

### MCP Server Agenten (Port 7000):
```bash
# Alle Agenten auflisten
curl http://138.199.237.34:7000/agents

# Health Check
curl http://138.199.237.34:7000/health

# Test Marketing Agent
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

### Reading Agent (Port 4001):
```bash
# Health Check (nach Start)
curl http://138.199.237.34:4001/health

# PM2 Status
pm2 status reading-agent
```

---

## 📋 Zusammenfassung

**5 Agenten:**
1. ✅ Marketing Agent (MCP Server, Port 7000)
2. ✅ Automation Agent (MCP Server, Port 7000)
3. ✅ Sales Agent (MCP Server, Port 7000)
4. ✅ Social-YouTube Agent (MCP Server, Port 7000)
5. ⚠️ Reading Agent (Production Server, Port 4001) - noch zu starten

**Zusätzliche Services (keine Agenten):**
- chatgpt-agent (Port 4000) - KI-Gehirn, nutzt die Agenten
- connection-key (Port 3000) - Zentrale API
- n8n (Port 5678) - Workflow Engine

---

## 🚀 Reading Agent starten

```bash
cd /opt/mcp-connection-key/production

# Port auf 4001 setzen
sed -i 's/^MCP_PORT=4000/MCP_PORT=4001/' ../production/.env

# AGENT_SECRET setzen
NEW_SECRET=$(openssl rand -hex 32)
sed -i '/^AGENT_SECRET=/d' ../production/.env
echo "AGENT_SECRET=$NEW_SECRET" >> ../production/.env

# Starten
chmod +x start.sh
./start.sh

# Prüfen
pm2 status reading-agent
curl http://localhost:4001/health
```

