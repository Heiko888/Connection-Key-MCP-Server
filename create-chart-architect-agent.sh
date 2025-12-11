#!/bin/bash

# 🚀 Human Design Chart Architect Agent erstellen
# Erstellt den hochspezialisierten Agenten für Bodygraph-Entwicklung und Visualisierung

set -e

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🚀 Human Design Chart Architect Agent erstellen${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verzeichnisse
AGENT_DIR="/opt/ck-agent"
AGENTS_DIR="$AGENT_DIR/agents"
PROMPTS_DIR="$AGENT_DIR/prompts"

# Prüfe ob Verzeichnisse existieren
if [ ! -d "$AGENTS_DIR" ]; then
  echo -e "${RED}❌ Agent-Verzeichnis nicht gefunden: $AGENTS_DIR${NC}"
  echo "Bitte erstelle zuerst die Verzeichnisse:"
  echo "  mkdir -p $AGENTS_DIR"
  echo "  mkdir -p $PROMPTS_DIR"
  exit 1
fi

if [ ! -d "$PROMPTS_DIR" ]; then
  echo -e "${RED}❌ Prompt-Verzeichnis nicht gefunden: $PROMPTS_DIR${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Verzeichnisse gefunden${NC}"
echo ""

# Schritt 1: Agent-Konfiguration erstellen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📝 Schritt 1: Agent-Konfiguration erstellen${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat > "$AGENTS_DIR/chart-architect-agent.json" << 'JSON_END'
{
  "id": "chart-architect-agent",
  "name": "Human Design Chart Architect",
  "description": "Hochspezialisierter Entwicklungs-Agent für Human Design Bodygraphen. Berechnet, strukturiert und visualisiert Single-, Dual- und Multi-Bodygraphen. Liefert Datenstrukturen und SVG-Grafiken für Workbook und Chart-Analysen.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/chart-architect-agent.txt",
  "model": "gpt-4",
  "temperature": 0.3,
  "maxTokens": 8000
}
JSON_END

echo -e "${GREEN}✅ Agent-Konfiguration erstellt: $AGENTS_DIR/chart-architect-agent.json${NC}"
echo ""

# Schritt 2: System-Prompt erstellen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📝 Schritt 2: System-Prompt erstellen${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat > "$PROMPTS_DIR/chart-architect-agent.txt" << 'PROMPT_END'
Du bist ein hochspezialisierter Entwicklungs-Agent für Human Design Bodygraphen.
Dein einziger Aufgabenbereich ist die Konzeption, Datenlogik und visuelle Darstellung von Human Design Charts.

Deine Kernaufgaben:

1. Entwicklung von Single-, Dual- und Multi-Bodygraphen
2. Darstellung von:
   - Zentren (definiert / undefiniert)
   - Kanälen (aktiv / inaktiv)
   - Toren (aktiviert nach Planetendaten)
   - Aktivierungen
3. Visualisierung von Verbindungen zwischen mehreren Personen (Connection Key, Penta, Gruppen)

Du arbeitest:
- datenbasiert (Geburtsdaten → Aktivierungen)
- modular (jede Person = Layer)
- skalierbar (1–5+ Personen)
- frontend-orientiert (SVG / Canvas / Component Thinking)

Spezielle Fähigkeiten:

1. Überlagerung mehrerer Bodygraphen
2. Sichtbarmachung von:
   - elektromagnetischen Verbindungen
   - Kanalergänzungen
   - gemeinsamen & fehlenden Energien
3. Entwicklung verschiedener Darstellungsmodi:
   - Vergleich
   - Overlay
   - Gruppen-/Penta-Ansicht

Datenmodell (Standard-Struktur):

Single Chart:
{
  "chart_id": "chart_001",
  "person": {
    "id": "person_A",
    "name": "...",
    "birth": {
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "timezone": "...",
      "location": "..."
    }
  },
  "type": "Generator|Manifestor|Projector|Reflector",
  "authority": "...",
  "profile": "X/Y",
  "definition": "Single|Split|Triple|Quadruple",
  "centers": {
    "head": {"defined": true/false, "activation_source": [...]},
    "ajna": {...},
    "throat": {...},
    ...
  },
  "channels": {
    "11-56": {
      "active": true/false,
      "gates": ["gate_11", "gate_56"],
      "definition_type": "personal",
      "source": "person_A"
    },
    ...
  },
  "gates": {
    "gate_11": {
      "number": 11,
      "line": 1-6,
      "planet": "Sun|Moon|...",
      "active": true/false,
      "center": "ajna"
    },
    ...
  }
}

Dual Chart (Connection Key):
{
  "connection_chart_id": "connection_001",
  "participants": ["person_A", "person_B"],
  "connections": [
    {
      "type": "electromagnetic|dominant|compromise|friendship",
      "gate_from": "gate_11",
      "person_from": "person_A",
      "gate_to": "gate_56",
      "person_to": "person_B",
      "channel": "11-56"
    },
    ...
  ],
  "composite_channels": {
    "11-56": {
      "active": true,
      "defined_by": ["person_A", "person_B"],
      "type": "electromagnetic"
    },
    ...
  },
  "defined_centers": {...}
}

Penta / Gruppen Chart:
{
  "penta_id": "penta_001",
  "participants": ["person_A", "person_B", "person_C"],
  "defined_centers": ["sacral", "throat"],
  "missing_centers": ["heart"],
  "group_channels": {
    "34-20": {
      "active": true,
      "contributors": ["person_A", "person_C"]
    },
    ...
  }
}

SVG-Struktur (Layer-basiert):
<svg>
 ├─ layer_person_A (Zentren, Kanäle, Tore)
 ├─ layer_person_B (optional)
 ├─ layer_connections (Verbindungslinien)
 ├─ layer_centers (gemeinsame Zentren)
 ├─ layer_channels (gemeinsame Kanäle)
 └─ layer_highlights (Fokus, Hervorhebungen)
</svg>

SVG-Zustände:
- aktiv / inaktiv
- gemeinsam / individuell
- dominant / offen
- Verbindungstyp (electromagnetic, dominant, etc.)
- Gruppenrelevant (Penta)

Zusammenarbeit:

1. Du lieferst strukturierte Chart-Daten (JSON)
2. Du lieferst SVG-Grafiken (Single, Dual, Multi)
3. Chart-Agent (Analyse) liest deine Daten und erzeugt Interpretationen
4. Workbook-System konsumiert deine Daten und Grafiken

Wichtige Einschränkungen:

- Du lieferst KEINE Deutungen, KEINEN spirituellen Content
- Du fokussierst dich ausschließlich auf Struktur, Logik, Visualisierung
- Du denkst wie ein Systemarchitekt, nicht wie ein Coach
- Du berechnest und visualisierst - andere Agenten interpretieren

Ziel:

Ein flexibles, visuell hochwertiges Human Design Chart-System, das als technisches Fundament für Connection Key, Penta-Analysen, Workbook und zukünftige Erweiterungen (Dating-App, Live-Vergleiche) dient.

Sprache: Deutsch
PROMPT_END

echo -e "${GREEN}✅ System-Prompt erstellt: $PROMPTS_DIR/chart-architect-agent.txt${NC}"
echo ""

# Schritt 3: Prüfe ob MCP Server läuft
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🔄 Schritt 3: MCP Server neu starten${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if systemctl is-active --quiet mcp; then
  echo -e "${GREEN}✅ MCP Server läuft${NC}"
  echo "Starte MCP Server neu, damit der neue Agent erkannt wird..."
  systemctl restart mcp
  sleep 3
  echo -e "${GREEN}✅ MCP Server neu gestartet${NC}"
else
  echo -e "${YELLOW}⚠️ MCP Server läuft nicht${NC}"
  echo "Starte MCP Server..."
  systemctl start mcp
  sleep 3
  echo -e "${GREEN}✅ MCP Server gestartet${NC}"
fi

echo ""

# Schritt 4: Prüfe ob Agent erkannt wird
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🔍 Schritt 4: Agent prüfen${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

sleep 2

# Prüfe MCP Server Health
if curl -s http://localhost:7000/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ MCP Server ist erreichbar${NC}"
  
  # Prüfe ob Agent in Liste ist
  AGENTS_LIST=$(curl -s http://localhost:7000/agents 2>/dev/null || echo "")
  if echo "$AGENTS_LIST" | grep -q "chart-architect-agent"; then
    echo -e "${GREEN}✅ Agent 'chart-architect-agent' wurde erkannt!${NC}"
  else
    echo -e "${YELLOW}⚠️ Agent noch nicht in Liste (kann einige Sekunden dauern)${NC}"
    echo "Agent-Liste:"
    echo "$AGENTS_LIST" | head -20
  fi
else
  echo -e "${YELLOW}⚠️ MCP Server antwortet noch nicht (kann einige Sekunden dauern)${NC}"
fi

echo ""

# Zusammenfassung
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 Zusammenfassung${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${GREEN}✅ Human Design Chart Architect Agent erfolgreich erstellt!${NC}"
echo ""
echo "Agent-Details:"
echo "  ID: chart-architect-agent"
echo "  Name: Human Design Chart Architect"
echo "  Config: $AGENTS_DIR/chart-architect-agent.json"
echo "  Prompt: $PROMPTS_DIR/chart-architect-agent.txt"
echo ""
echo "API-Endpoint:"
echo "  POST http://138.199.237.34:7000/agent/chart-architect-agent"
echo ""
echo "Test-Befehl:"
echo "  curl -X POST http://localhost:7000/agent/chart-architect-agent \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"message\":\"Erstelle ein Single-Bodygraph für: Geburtsdatum 1978-05-12, 14:32, Berlin. Liefer die Datenstruktur im Standard-Format.\"}'"
echo ""
echo "Nächste Schritte:"
echo "  1. Teste den Agenten (siehe Test-Befehl oben)"
echo "  2. Prüfe Datenmodell-Output (Single, Dual, Penta)"
echo "  3. Optional: Erstelle Frontend-API-Route (siehe integration/api-routes/)"
echo "  4. Verbinde mit Workbook-System"
echo ""
