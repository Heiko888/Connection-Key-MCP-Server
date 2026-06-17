# 🤖 ChatGPT-Agent - Übersicht

## 🎯 Hauptaufgabe

Der **ChatGPT-Agent** ist das **KI-Gehirn** Ihrer App. Er verarbeitet natürliche Sprache, nutzt MCP Tools, ruft n8n Workflows auf und verwaltet Chat-Sessions.

## 🚀 Hauptfunktionen

### 1. **Chat-Interface** (POST /chat)
- Verarbeitet Chat-Nachrichten von Nutzern
- Verwaltet Konversationsverlauf (Memory Management)
- Nutzt GPT-4o für intelligente Antworten
- Kombiniert mehrere Tools für komplexe Anfragen

### 2. **Human Design Readings** (POST /reading/generate)
- Generiert Human Design Readings basierend auf Geburtsdaten
- Unterstützt verschiedene Reading-Typen (basic, detailed, business, relationship)
- Analysiert Chart-Daten

### 3. **Partner-Matching** (POST /matching)
- Führt Human Design Partner-Matching durch
- Analysiert Kompatibilität zwischen zwei Personen
- Gibt Empfehlungen für Beziehungen

### 4. **Session-Management**
- Verwaltet Chat-Sessions pro User
- Speichert Konversationsverlauf (bis zu 50 Nachrichten)
- Löscht alte Nachrichten automatisch
- Unterstützt Session-Metadaten

### 5. **Tool-Integration**
- **MCP Tools**: Ruft Tools vom MCP Server auf
- **n8n Integration**: Startet Workflows und Automatisierungen
- **Human Design Tools**: Readings, Chart-Analyse, Matching

## 📡 API-Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/chat` | POST | Verarbeitet Chat-Nachricht |
| `/session/:userId` | GET | Gibt Session-Info zurück |
| `/session/:userId` | DELETE | Löscht Session |
| `/reading/generate` | POST | Generiert direkt ein Reading |
| `/matching` | POST | Führt Partner-Matching durch |
| `/health` | GET | Health Check |

## 🔧 Technische Details

### Port
- **Standard-Port**: `4000`
- Läuft im Docker-Container (`chatgpt-agent`)
- Wird vom `connection-key` Server verwendet

### Abhängigkeiten
- **OpenAI GPT-4o**: Für KI-Antworten
- **MCP Server**: Für Tool-Aufrufe
- **n8n**: Für Workflow-Automatisierung

### Memory Management
- Speichert Konversationsverlauf pro User
- Begrenzt auf 50 Nachrichten (Performance)
- Automatische Bereinigung alter Nachrichten

## 🆚 Unterschied zum Reading Agent

| Feature | ChatGPT-Agent | Reading Agent |
|---------|---------------|---------------|
| **Port** | 4000 | 4001 (oder 4000 wenn chatgpt-agent gestoppt) |
| **Hauptaufgabe** | Chat-Interface, Multi-Tool-Integration | Spezialisiert auf Human Design Readings |
| **Memory** | ✅ Session-Management | ❌ Kein Memory |
| **Tools** | ✅ MCP, n8n, Human Design | ❌ Nur OpenAI direkt |
| **Komplexität** | Hoch (Multi-Tool) | Niedrig (Fokussiert) |
| **Deployment** | Docker | PM2 (unabhängig) |

## 💡 Verwendungsbeispiele

### Beispiel 1: Chat-Nachricht
```bash
curl -X POST http://localhost:4000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "message": "Erstelle mir ein Human Design Reading für 1990-05-15, 14:30, Berlin"
  }'
```

### Beispiel 2: Reading direkt generieren
```bash
curl -X POST http://localhost:4000/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "detailed"
  }'
```

### Beispiel 3: Partner-Matching
```bash
curl -X POST http://localhost:4000/matching \
  -H "Content-Type: application/json" \
  -d '{
    "userId1": "user123",
    "userId2": "user456",
    "user1Chart": {...},
    "user2Chart": {...}
  }'
```

## 🔄 Integration mit anderen Services

```
┌─────────────┐
│   Client    │
│  (App/Web)  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ connection-key  │  Port 3000
│     Server      │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  chatgpt-agent  │  Port 4000
│   (KI-Gehirn)   │
└──────┬──────────┘
       │
       ├──► MCP Server (Port 7000) - Tools
       ├──► n8n (Port 5678) - Workflows
       └──► OpenAI API - GPT-4o
```

## 🎯 Wann welchen Agent verwenden?

### ChatGPT-Agent verwenden, wenn:
- ✅ Chat-Interface benötigt wird
- ✅ Multi-Tool-Integration gewünscht ist
- ✅ Session-Management benötigt wird
- ✅ Komplexe Anfragen mit mehreren Tools
- ✅ Integration mit n8n Workflows

### Reading Agent verwenden, wenn:
- ✅ Nur Human Design Readings generiert werden sollen
- ✅ Einfache, fokussierte API benötigt wird
- ✅ Unabhängiger Service (ohne Docker) gewünscht ist
- ✅ Direkte OpenAI-Integration ohne MCP/n8n

## 📊 Status prüfen

```bash
# Health Check
curl http://localhost:4000/health

# Docker Status
docker-compose ps chatgpt-agent

# Logs
docker-compose logs chatgpt-agent
```

## 🔧 Konfiguration

Umgebungsvariablen (in `.env`):
```bash
OPENAI_API_KEY=your-key
MCP_SERVER_URL=http://localhost:7777
N8N_BASE_URL=http://localhost:5678
PORT=4000
```

## ✅ Zusammenfassung

Der **ChatGPT-Agent** ist der **zentrale KI-Service** für:
- Chat-Interaktionen
- Multi-Tool-Integration
- Session-Management
- Komplexe Anfragen

Der **Reading Agent** ist ein **spezialisierter Service** für:
- Human Design Readings
- Einfache, fokussierte API
- Unabhängiger Betrieb (PM2)

Beide können parallel laufen, wenn sie unterschiedliche Ports verwenden!

