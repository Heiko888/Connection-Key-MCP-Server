# 🔮 Reading Agent - Detaillierte Übersicht

## 📊 Grundinformationen

| Eigenschaft | Wert |
|-------------|------|
| **ID** | `reading` |
| **Name** | Reading Agent (Human Design) |
| **Port** | 4001 |
| **Server** | Hetzner (138.199.237.34) |
| **URL** | `http://138.199.237.34:4001` oder `https://agent.the-connection-key.de` |
| **Deployment** | PM2 (unabhängig von Docker) |
| **Model** | GPT-4 |
| **Temperature** | 0.7 |
| **Max Tokens** | 4000 |
| **Sprache** | Deutsch |

---

## 🎯 Hauptfunktionen

### 1. Human Design Readings generieren
- Generiert vollständige Human Design Readings basierend auf Geburtsdaten
- Nutzt OpenAI GPT-4 für intelligente Analysen
- Integriert Knowledge-Base für fundierte Inhalte
- Verwendet Templates für strukturierte Outputs

### 2. 10 verschiedene Reading-Typen
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

### 3. Knowledge-Integration
Lädt automatisch 5 Knowledge-Dateien:
- `human-design-basics.txt` - Grundlagen Human Design
- `reading-types.txt` - Beschreibungen aller Reading-Typen
- `channels-gates.txt` - Channels & Gates Informationen
- `strategy-authority.txt` - Strategie & Autorität
- `incarnation-cross.txt` - Inkarnationskreuz

### 4. Template-System
Verwendet 11 Template-Dateien:
- `default.txt` - Standard-Template
- `basic.txt` - Basic Reading Template
- `detailed.txt` - Detailed Reading Template
- `business.txt` - Business Reading Template
- `relationship.txt` - Relationship Reading Template
- `career.txt` - Career Reading Template
- `health.txt` - Health Reading Template
- `parenting.txt` - Parenting Reading Template
- `spiritual.txt` - Spiritual Reading Template
- `compatibility.txt` - Compatibility Reading Template
- `life-purpose.txt` - Life Purpose Reading Template

---

## 🔄 Arbeitsweise

### 1. Input-Verarbeitung
```
Geburtsdaten (Datum, Zeit, Ort) + Reading-Typ
    ↓
Template-Loading (basierend auf Reading-Typ)
    ↓
Knowledge-Integration (alle 5 Knowledge-Dateien)
    ↓
OpenAI API Call (GPT-4)
    ↓
Strukturiertes Reading
```

### 2. Prompt-Aufbau
1. **System-Prompt:** 
   - Human Design Grundlagen
   - Reading-Typ Beschreibung
   - Channels & Gates
   - Strategie & Autorität
   - Inkarnationskreuz

2. **User-Prompt:**
   - Template für Reading-Typ
   - Geburtsdaten
   - Spezifische Anforderungen

3. **OpenAI Response:**
   - Vollständiges, strukturiertes Reading
   - Basierend auf Human Design Prinzipien
   - Personalisiert für Reading-Typ

---

## 📡 API-Endpunkte

### Health Check
```bash
GET http://138.199.237.34:4001/health
```

**Response:**
```json
{
  "status": "ok",
  "service": "reading-agent",
  "port": "4001",
  "knowledge": 5,
  "templates": 11,
  "timestamp": "2025-12-08T..."
}
```

### Reading generieren
```bash
POST http://138.199.237.34:4001/reading/generate
Content-Type: application/json

{
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "birthPlace": "Berlin, Germany",
  "readingType": "detailed",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "reading": "...",
  "readingType": "detailed",
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "birthPlace": "Berlin, Germany",
  "timestamp": "2025-12-08T..."
}
```

### Knowledge neu laden (Admin)
```bash
POST http://138.199.237.34:4001/admin/reload-knowledge
Content-Type: application/json

{
  "secret": "AGENT_SECRET"
}
```

### Templates neu laden (Admin)
```bash
POST http://138.199.237.34:4001/admin/reload-templates
Content-Type: application/json

{
  "secret": "AGENT_SECRET"
}
```

---

## 📋 Beispiel-Anfragen

### Beispiel 1: Detailed Reading
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

**Antwort enthält:**
- Typ-Analyse (Generator, Manifestor, Projector, Reflector)
- Strategie & Autorität
- Zentren (definiert/undefiniert)
- Channels & Gates
- Profile (z.B. 1/3, 2/4)
- Inkarnationskreuz
- Praktische Anwendungen

### Beispiel 2: Business Reading
```bash
curl -X POST http://138.199.237.34:4001/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1985-03-20",
    "birthTime": "09:15",
    "birthPlace": "München, Germany",
    "readingType": "business"
  }'
```

**Antwort enthält:**
- Berufliche Talente
- Ideale Arbeitsumgebung
- Karriere-Empfehlungen
- Leadership-Stil
- Business-Strategien
- Team-Dynamik

### Beispiel 3: Relationship Reading
```bash
curl -X POST http://138.199.237.34:4001/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1992-07-10",
    "birthTime": "18:45",
    "birthPlace": "Hamburg, Germany",
    "readingType": "relationship"
  }'
```

**Antwort enthält:**
- Beziehungs-Dynamik
- Kommunikations-Stil
- Emotionale Bedürfnisse
- Kompatibilität
- Beziehungs-Empfehlungen

---

## 📁 Datei-Struktur

```
production/
├── server.js              # Hauptserver (Express.js)
├── package.json           # Dependencies (express, cors, openai, dotenv)
├── start.sh               # PM2 Start-Script
├── env.example            # Environment-Vorlage
├── .env                   # Environment (nicht in Git)
├── knowledge/             # Knowledge-Dateien
│   ├── human-design-basics.txt
│   ├── reading-types.txt
│   ├── channels-gates.txt
│   ├── strategy-authority.txt
│   └── incarnation-cross.txt
├── templates/             # Template-Dateien
│   ├── default.txt
│   ├── basic.txt
│   ├── detailed.txt
│   ├── business.txt
│   ├── relationship.txt
│   ├── career.txt
│   ├── health.txt
│   ├── parenting.txt
│   ├── spiritual.txt
│   ├── compatibility.txt
│   └── life-purpose.txt
└── logs/                  # PM2 Logs (täglich)
    └── agent-YYYY-MM-DD.log
```

---

## 🔧 Technische Details

### Environment Variables
```bash
OPENAI_API_KEY=sk-...          # OpenAI API Key (erforderlich)
AGENT_SECRET=...               # Secret für Admin-Endpunkte
MCP_PORT=4001                  # Port (Standard: 4000)
KNOWLEDGE_PATH=./knowledge     # Pfad zu Knowledge-Dateien
TEMPLATE_PATH=./templates      # Pfad zu Template-Dateien
LOGS_PATH=./logs              # Pfad zu Log-Dateien
LOG_LEVEL=info                # Log-Level (debug, info, error)
NODE_ENV=production          # Node Environment
```

### PM2 Management
```bash
# Status prüfen
pm2 status reading-agent

# Logs anzeigen
pm2 logs reading-agent

# Neustart
pm2 restart reading-agent

# Stoppen
pm2 stop reading-agent

# Löschen
pm2 delete reading-agent
```

### Logging
- **Console-Logging:** Je nach LOG_LEVEL
- **File-Logging:** Tägliche Log-Dateien in `logs/`
- **Format:** `[TIMESTAMP] [LEVEL] MESSAGE [DATA]`

---

## 🔗 Integration

### Mit Frontend (Next.js)
```typescript
// API-Route: /api/readings/generate
const response = await fetch('http://138.199.237.34:4001/reading/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    birthDate,
    birthTime,
    birthPlace,
    readingType: 'detailed'
  })
});
```

### Mit Chart Development Agent
```typescript
// Chart Development Agent nutzt Reading Agent für Chart-Berechnung
const chartResponse = await fetch('http://138.199.237.34:4001/reading/generate', {
  method: 'POST',
  body: JSON.stringify({ birthDate, birthTime, birthPlace, readingType: 'detailed' })
});
const chartData = await chartResponse.json();
```

---

## ✅ Status

- ✅ **Installiert** auf Hetzner Server (138.199.237.34)
- ✅ **Läuft** über PM2 auf Port 4001
- ✅ **Knowledge:** 5 Dateien geladen
- ✅ **Templates:** 11 Dateien geladen
- ✅ **OpenAI Integration:** Aktiv
- ✅ **Logging:** Aktiv (tägliche Log-Dateien)
- ✅ **Health Endpoint:** Funktioniert
- ✅ **Reading Generation:** Funktioniert

---

## 🎯 Zusammenfassung

Der Reading Agent ist ein spezialisierter Agent für Human Design Readings:

- ✅ **10 Reading-Typen** unterstützt
- ✅ **5 Knowledge-Dateien** für fundierte Inhalte
- ✅ **11 Templates** für strukturierte Outputs
- ✅ **OpenAI GPT-4** für intelligente Analysen
- ✅ **PM2** für Production-Deployment
- ✅ **Strukturiertes Logging** für Debugging
- ✅ **Admin-Endpunkte** für dynamisches Reloading

**Der Agent ist vollständig funktionsfähig und produktionsbereit!** 🚀

