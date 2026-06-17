# 🤖 Alle Agenten - Komplette Funktionsübersicht

## 📊 Übersicht aller 6 Agenten

| # | Agent | ID | Port | Server | Status | Temperature | Max Tokens |
|---|-------|----|------|--------|--------|------------|------------|
| 1 | **Marketing Agent** | `marketing` | 7000 | MCP Server | ✅ Aktiv | 0.7 | 5000 |
| 2 | **Automation Agent** | `automation` | 7000 | MCP Server | ✅ Aktiv | 0.2 | 6000 |
| 3 | **Sales Agent** | `sales` | 7000 | MCP Server | ✅ Aktiv | 0.6 | 6000 |
| 4 | **Social-YouTube Agent** | `social-youtube` | 7000 | MCP Server | ✅ Aktiv | 0.7 | 6000 |
| 5 | **Reading Agent** | `reading` | 4001 | Production Server | ✅ Aktiv | 0.7 | 4000 |
| 6 | **Chart Development Agent** | `chart-development` | 7000 | MCP Server | ✅ Aktiv | 0.3 | 6000 |

**Server-URLs:**
- MCP Server: `http://138.199.237.34:7000`
- Reading Agent: `http://138.199.237.34:4001` (oder `https://agent.the-connection-key.de`)

---

## 1. 🎯 Marketing Agent (`marketing`)

### Hauptaufgaben:
- ✅ **Marketingstrategien** entwickeln
- ✅ **Reels & Short-Form Content** erstellen (Hooks, Struktur, CTAs)
- ✅ **Newsletter & E-Mail-Marketing** (Texte, Sequenzen, Betreffzeilen)
- ✅ **Funnels & Sales-Funnels** planen und optimieren
- ✅ **Salescopy & Werbetexte** für alle Kanäle
- ✅ **Social Media Posts** (Instagram, LinkedIn, Captions)
- ✅ **Growth-Hacking** Techniken
- ✅ **Brand-Entwicklung** und Positionierung

### Arbeitsweise:
1. **ANALYSE:** Zielgruppe, Markt, Wettbewerb
2. **STRATEGIE:** Klare Marketing-Strategie entwickeln
3. **KREATION:** Vollständigen Content erstellen
4. **OPTIMIERUNG:** Conversion & Engagement optimieren

### Beispiel-Anfragen:
```bash
# Marketingstrategie
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle mir eine Marketingstrategie für einen Online-Kurs über Manifestation"}'

# Reels-Ideen
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Gib mir 10 Reels-Ideen für Instagram zum Thema Energie & Manifestation"}'
```

---

## 2. ⚙️ Automation Agent (`automation`)

### Hauptaufgaben:
- ✅ **n8n Workflows** erstellen und erklären
- ✅ **Zapier & Make** Integrationen
- ✅ **Mailchimp Automatisierungen** (DOI, Sequenzen)
- ✅ **Webhooks & APIs** konzipieren
- ✅ **Serverkonfiguration** (Nginx, Docker, PM2)
- ✅ **Database-Integrationen** (Supabase, PostgreSQL)
- ✅ **API-Design** und Dokumentation
- ✅ **Error-Handling** und Logging

### Arbeitsweise:
1. **ANALYSE:** Anforderung verstehen
2. **KONZEPTION:** Workflow/Integration planen
3. **IMPLEMENTIERUNG:** Schritt-für-Schritt Anleitung
4. **TESTING:** Fehlerbehandlung und Validierung

### Beispiel-Anfragen:
```bash
# n8n Workflow
curl -X POST http://138.199.237.34:7000/agent/automation \
  -H "Content-Type: application/json" \
  -d '{"message": "Erkläre mir einen n8n Workflow für Mailchimp Double-Opt-In"}'

# API-Integration
curl -X POST http://138.199.237.34:7000/agent/automation \
  -H "Content-Type: application/json" \
  -d '{"message": "Wie integriere ich Supabase mit Next.js?"}'
```

---

## 3. 💰 Sales Agent (`sales`)

### Hauptaufgaben:
- ✅ **Verkaufstexte** schreiben (Salespages, Landing Pages)
- ✅ **Funnel-Strategien** entwickeln
- ✅ **Closing-Techniken** anwenden
- ✅ **Preisgestaltung** und Angebotsformulierungen
- ✅ **Buyer Journey** optimieren
- ✅ **Storyselling** Techniken
- ✅ **Objection-Handling** Strategien
- ✅ **Upsell/Downsell** Konzepte

### Arbeitsweise:
1. **PSYCHOLOGIE:** Buyer Persona und Pain Points
2. **STRATEGIE:** Funnel-Struktur entwickeln
3. **KREATION:** Überzeugende Verkaufstexte
4. **OPTIMIERUNG:** Conversion-Optimierung

### Beispiel-Anfragen:
```bash
# Salespage
curl -X POST http://138.199.237.34:7000/agent/sales \
  -H "Content-Type: application/json" \
  -d '{"message": "Schreibe mir eine Salespage für einen Human Design Online-Kurs"}'

# Funnel-Strategie
curl -X POST http://138.199.237.34:7000/agent/sales \
  -H "Content-Type: application/json" \
  -d '{"message": "Entwickle eine Funnel-Strategie für ein Coaching-Programm"}'
```

---

## 4. 🎬 Social-YouTube Agent (`social-youtube`)

### Hauptaufgaben:
- ✅ **YouTube-Video-Skripte** erstellen
- ✅ **Social Media Posts** (Instagram, LinkedIn, TikTok)
- ✅ **Thumbnail-Ideen** und Beschreibungen
- ✅ **SEO-Optimierung** für Videos
- ✅ **Content-Kalender** erstellen
- ✅ **Hashtag-Strategien** entwickeln
- ✅ **Engagement-Strategien** (Kommentare, Community)
- ✅ **Video-Struktur** (Intro, Hauptteil, Outro)

### Arbeitsweise:
1. **KONZEPTION:** Thema und Zielgruppe
2. **STRUKTUR:** Video/Post-Struktur entwickeln
3. **KREATION:** Vollständiges Skript/Content
4. **OPTIMIERUNG:** SEO, Engagement, Conversion

### Beispiel-Anfragen:
```bash
# Video-Skript
curl -X POST http://138.199.237.34:7000/agent/social-youtube \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle mir ein YouTube-Video-Skript über Manifestationsblockaden"}'

# Social Media Post
curl -X POST http://138.199.237.34:7000/agent/social-youtube \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle einen Instagram-Post über Human Design Typen"}'
```

---

## 5. 🔮 Reading Agent (`reading`)

### Hauptaufgaben:
- ✅ **Human Design Readings** generieren
- ✅ **Chart-Berechnungen** durchführen
- ✅ **10 verschiedene Reading-Typen** unterstützen
- ✅ **Persönlichkeitsanalysen** basierend auf Human Design
- ✅ **Knowledge-Base** nutzen (5 Knowledge-Dateien)
- ✅ **Templates** verwenden (11 Template-Dateien)

### Reading-Typen:
1. **basic** - Grundlegendes Reading
2. **detailed** - Detailliertes Reading
3. **business** - Business-Reading
4. **relationship** - Beziehungs-Reading
5. **career** - Karriere-Reading
6. **health** - Health & Wellness Reading
7. **parenting** - Parenting & Family Reading
8. **spiritual** - Spiritual Growth Reading
9. **compatibility** - Compatibility Reading
10. **life-purpose** - Life Purpose Reading

### Beispiel-Anfragen:
```bash
# Reading generieren
curl -X POST http://138.199.237.34:4001/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany",
    "readingType": "detailed"
  }'
```

### Knowledge-Base:
- `human-design-basics.txt` - Grundlagen Human Design
- `reading-types.txt` - Alle Reading-Typen
- `channels-gates.txt` - Channels & Gates
- `strategy-authority.txt` - Strategy & Authority
- `incarnation-cross.txt` - Incarnation Cross

---

## 6. 📊 Chart Development Agent (`chart-development`)

### Hauptaufgaben:
- ✅ **Bodygraph-Komponenten** entwickeln (React, SVG, Canvas)
- ✅ **Penta-Analyse Charts** erstellen (5-Personen-Gruppen)
- ✅ **Connection Key Charts** generieren (Partner-Vergleiche)
- ✅ **Chart-Berechnungen** nutzen (über Reading Agent)
- ✅ **React/TypeScript Code** generieren
- ✅ **D3.js Integration** für Visualisierungen
- ✅ **Interaktive Charts** entwickeln
- ✅ **Export-Funktionen** (PNG, SVG, PDF)

### Chart-Typen:
- **Bodygraph Charts** - Hauptchart mit 9 Zentren, 36 Channels, 64 Gates
- **Penta Formation Charts** - 5-Personen-Gruppen-Analyse
- **Connection Key Charts** - Partner-Kompatibilität
- **Composite Charts** - Zusammengesetzte Charts
- **Synastrie Charts** - Beziehungs-Analyse
- **Transit Charts** - Zeitliche Entwicklungen

### Arbeitsweise:
1. **BERECHNUNG:** Nutze Geburtsdaten → Chart-Berechnung (oder erhalte berechnete Daten)
2. **ANALYSE:** Verstehe berechnete Chart-Daten (Typ, Zentren, Channels, etc.)
3. **DESIGN:** Erstelle visuelles Konzept basierend auf berechneten Daten
4. **ENTWICKLUNG:** Generiere Code für Chart-Komponente mit berechneten Daten
5. **OPTIMIERUNG:** Performance, Responsive, Accessibility
6. **DOKUMENTATION:** Code-Kommentare, Props, Usage, Datenstruktur

### Beispiel-Anfragen:
```bash
# Bodygraph-Komponente
curl -X POST http://138.199.237.34:7000/agent/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle eine Bodygraph-Komponente mit React und SVG basierend auf berechneten Chart-Daten"}'

# Mit Geburtsdaten (automatische Chart-Berechnung)
curl -X POST http://138.199.237.34:7000/agent/chart-development \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle eine Bodygraph-Komponente",
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany"
  }'
```

---

## 🔄 Kombinierte Workflows

### Workflow 1: Content-Pipeline
```
Marketing-Agent → Social-YouTube-Agent → Automation-Agent
```
1. Marketing-Agent: Strategie entwickeln
2. Social-YouTube-Agent: Content erstellen
3. Automation-Agent: Automatisierung in n8n einrichten

### Workflow 2: Sales-Funnel
```
Marketing-Agent → Sales-Agent → Automation-Agent
```
1. Marketing-Agent: Traffic-Strategie
2. Sales-Agent: Funnel & Salespage
3. Automation-Agent: n8n Workflow für E-Mail-Sequenz

### Workflow 3: Reading + Chart-Entwicklung
```
Reading-Agent → Chart-Development-Agent
```
1. Reading-Agent: Chart-Daten berechnen
2. Chart-Development-Agent: Bodygraph-Komponente entwickeln

### Workflow 4: Reading + Marketing
```
Reading-Agent → Marketing-Agent → Social-YouTube-Agent
```
1. Reading-Agent: Human Design Reading generieren
2. Marketing-Agent: Content-Strategie basierend auf Reading
3. Social-YouTube-Agent: Personalisierter Content

---

## 📡 API-Endpunkte

### MCP Server (Port 7000)

#### Health Check
```bash
GET http://138.199.237.34:7000/health
```

#### Agenten auflisten
```bash
GET http://138.199.237.34:7000/agents
```

#### Agent ansprechen
```bash
POST http://138.199.237.34:7000/agent/{agentId}
Content-Type: application/json

{
  "message": "Ihre Anfrage hier"
}
```

**Verfügbare Agent-IDs:**
- `marketing`
- `automation`
- `sales`
- `social-youtube`
- `chart-development`

### Reading Agent (Port 4001)

#### Health Check
```bash
GET http://138.199.237.34:4001/health
```

#### Reading generieren
```bash
POST http://138.199.237.34:4001/reading/generate
Content-Type: application/json

{
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "birthPlace": "Berlin, Germany",
  "readingType": "detailed"
}
```

---

## ✅ Status aller Agenten

| Agent | Server | Status | API-Route (CK-App) |
|-------|--------|--------|-------------------|
| Marketing | Hetzner:7000 | ✅ Aktiv | `/api/agents/marketing` |
| Automation | Hetzner:7000 | ✅ Aktiv | `/api/agents/automation` |
| Sales | Hetzner:7000 | ✅ Aktiv | `/api/agents/sales` |
| Social-YouTube | Hetzner:7000 | ✅ Aktiv | `/api/agents/social-youtube` |
| Reading | Hetzner:4001 | ✅ Aktiv | `/api/readings/generate` |
| Chart Development | Hetzner:7000 | ✅ Aktiv | `/api/agents/chart-development` |

---

## 🎯 Zusammenfassung

**Alle 6 Agenten sind aktiv und funktionsfähig!**

- **4 Agenten** laufen über MCP Server (Port 7000)
- **1 Agent** läuft als Production Server (Port 4001)
- **1 Agent** (Chart Development) läuft über MCP Server (Port 7000)

**Alle Agenten können:**
- ✅ Über API-Routes aufgerufen werden
- ✅ Über Frontend-Komponenten verwendet werden
- ✅ In kombinierten Workflows zusammenarbeiten
- ✅ Mit n8n integriert werden

