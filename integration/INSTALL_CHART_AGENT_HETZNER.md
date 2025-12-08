# 📊 Chart Development Agent - Installation auf Hetzner Server

## ✅ Voraussetzungen

- SSH-Zugriff auf Hetzner Server (138.199.237.34)
- Repository ist auf dem Server vorhanden (`/opt/mcp-connection-key`)
- MCP Server läuft auf Port 7000

---

## 🚀 Installation

### Schritt 1: SSH-Verbindung zum Hetzner Server

```bash
ssh root@138.199.237.34
```

### Schritt 2: Repository aktualisieren

```bash
cd /opt/mcp-connection-key
git pull origin main
```

### Schritt 3: Installations-Script ausführen

```bash
chmod +x integration/install-chart-agent.sh
./integration/install-chart-agent.sh
```

---

## 📋 Was das Script macht

1. ✅ Erstellt Verzeichnisse (`/opt/ck-agent/prompts`, `/opt/ck-agent/agents`)
2. ✅ Erstellt Prompt-Datei (`chart-development.txt`)
3. ✅ Erstellt Config-Datei (`chart-development.json`)
4. ✅ Startet MCP Server neu (erkennt Agent automatisch)
5. ✅ Prüft Agent-Registrierung
6. ✅ Führt Test-Request durch

---

## ✅ Verifizierung

### Agent-Liste prüfen

```bash
curl http://localhost:7000/agents | python3 -m json.tool
```

**Erwartete Ausgabe:**
```json
{
  "agents": [
    ...
    {
      "id": "chart-development",
      "name": "Chart Development Agent"
    }
  ]
}
```

### Test-Request

```bash
curl -X POST http://localhost:7000/agent/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Erstelle eine Bodygraph-Komponente mit React und SVG"}' | python3 -m json.tool
```

**Erwartete Ausgabe:**
```json
{
  "agent": "chart-development",
  "message": "Erstelle eine Bodygraph-Komponente mit React und SVG",
  "response": "...",
  "model": "gpt-4",
  "tokens": ...
}
```

---

## 🔧 Manuelle Installation (falls Script fehlschlägt)

### 1. Verzeichnisse erstellen

```bash
mkdir -p /opt/ck-agent/prompts
mkdir -p /opt/ck-agent/agents
```

### 2. Prompt-Datei erstellen

```bash
cat > /opt/ck-agent/prompts/chart-development.txt << 'PROMPT_END'
[Inhalt siehe integration/install-chart-agent.sh]
PROMPT_END
```

### 3. Config-Datei erstellen

```bash
cat > /opt/ck-agent/agents/chart-development.json << 'JSON_END'
{
  "id": "chart-development",
  "name": "Chart Development Agent",
  "description": "Entwickelt Human Design Charts, Penta-Analyse Charts und Connection Key Charts für graphische Darstellung. Spezialisiert auf SVG/Canvas-Visualisierungen, React-Komponenten und interaktive Chart-Entwicklung.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/chart-development.txt",
  "model": "gpt-4",
  "temperature": 0.3,
  "maxTokens": 8000,
  "capabilities": [
    "bodygraph-development",
    "penta-analysis-charts",
    "connection-key-charts",
    "svg-canvas-visualization",
    "react-components",
    "d3-integration",
    "interactive-charts",
    "chart-export"
  ]
}
JSON_END
```

### 4. MCP Server neu starten

```bash
systemctl restart mcp
sleep 3
```

### 5. Prüfen

```bash
curl http://localhost:7000/agents | grep chart-development
```

---

## 🐛 Troubleshooting

### Agent wird nicht erkannt

```bash
# Prüfe MCP Server Logs
journalctl -u mcp -n 50

# Prüfe ob Dateien existieren
ls -la /opt/ck-agent/prompts/chart-development.txt
ls -la /opt/ck-agent/agents/chart-development.json

# Prüfe MCP Server Status
systemctl status mcp
```

### MCP Server startet nicht

```bash
# Prüfe Syntax-Fehler in server.js
node -c /opt/mcp/server.js

# Prüfe Systemd Service
systemctl status mcp
journalctl -u mcp -n 100
```

### Agent antwortet nicht

```bash
# Prüfe OpenAI API Key
grep OPENAI_API_KEY /opt/mcp-connection-key/.env

# Prüfe MCP Server Health
curl http://localhost:7000/health

# Teste direkt
curl -X POST http://localhost:7000/agent/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Test"}' -v
```

---

## ✅ Installation erfolgreich?

Nach erfolgreicher Installation sollte:

1. ✅ Agent in `/agents` Liste erscheinen
2. ✅ Test-Request erfolgreich sein
3. ✅ MCP Server ohne Fehler laufen

**Nächster Schritt:** Installation auf CK-App Server (siehe `integration/CHART_AGENT_IMPLEMENTATION_STATUS.md`)
