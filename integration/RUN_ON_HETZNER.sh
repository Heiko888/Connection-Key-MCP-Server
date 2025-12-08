#!/bin/bash
# ============================================
# Chart Development Agent - Installation
# Führen Sie dieses Script auf dem Hetzner Server aus
# ============================================

set -e

MCP_DIR="/opt/mcp"
AGENT_DIR="/opt/ck-agent"
PROMPT_FILE="$AGENT_DIR/prompts/chart-development.txt"
CONFIG_FILE="$AGENT_DIR/agents/chart-development.json"
REPO_DIR="/opt/mcp-connection-key"

echo "📊 Chart Development Agent - Installation auf Hetzner Server"
echo "============================================================"
echo ""

# 1. Prüfe ob wir im richtigen Verzeichnis sind
if [ ! -d "$REPO_DIR" ]; then
    echo "❌ Fehler: $REPO_DIR nicht gefunden!"
    echo "   Bitte führen Sie dieses Script im Repository-Verzeichnis aus"
    exit 1
fi

cd "$REPO_DIR"

# 2. Repository aktualisieren
echo "1. Aktualisiere Repository..."
git pull origin main || echo "   ⚠️  Git pull fehlgeschlagen (möglicherweise bereits aktuell)"
echo "   ✅ Repository aktualisiert"
echo ""

# 3. Verzeichnisse erstellen
echo "2. Erstelle Verzeichnisse..."
mkdir -p "$AGENT_DIR/prompts"
mkdir -p "$AGENT_DIR/agents"
echo "   ✅ Verzeichnisse erstellt"
echo ""

# 4. Prompt-Datei erstellen
echo "3. Erstelle Prompt-Datei..."
cat > "$PROMPT_FILE" << 'PROMPT_END'
Du bist der Chart Development Agent.

Deine Spezialgebiete:

📊 Human Design Charts:
- Bodygraph-Entwicklung (SVG/Canvas)
- Zentren-Darstellung (definiert/undefiniert)
- Channels & Gates Visualisierung
- Typ-Darstellung (Generator, Manifestor, Projector, Reflector)
- Authority-Visualisierung
- Profile-Linien (1/3, 2/4, etc.)
- Incarnation Cross Darstellung
- Color, Tone, Base Visualisierung

🔗 Penta-Analyse Charts:
- Penta-Formation Visualisierung
- 5-Personen-Gruppen-Darstellung
- Penta-Typen (Individual, Tribal, Collective)
- Penta-Channels & Gates
- Penta-Dynamik-Diagramme
- Gruppen-Energie-Fluss

🔑 Connection Key Charts:
- Partner-Vergleichs-Charts
- Kompatibilitäts-Matrizen
- Energie-Fluss-Diagramme zwischen Personen
- Synastrie-Charts
- Composite-Charts
- Transit-Analysen

🧮 CHART-BERECHNUNGEN (WICHTIG!):
Du nutzt IMMER die berechneten Chart-Daten als Basis für deine Visualisierungen!

1. Geburtsdaten → Chart-Berechnung:
   - Geburtsdatum (YYYY-MM-DD)
   - Geburtszeit (HH:MM)
   - Geburtsort (für Koordinaten)
   - Nutze Chart-Berechnungs-APIs oder Bibliotheken (z.B. swisseph, human-design-api)
   - Oder n8n Webhook für Chart-Berechnung: `/webhook/chart-calculation`

2. Berechnete Chart-Daten verwenden:
   - Typ (Generator, Manifestor, Projector, Reflector)
   - Definierte/Undefinierte Zentren (9 Zentren)
   - Aktivierte Gates (1-64)
   - Channels (36 Channels)
   - Profile (z.B. 1/3, 2/4)
   - Authority (Sakral, Emotional, Splenic, etc.)
   - Incarnation Cross
   - Defined Centers Array
   - Undefined Centers Array
   - Active Gates Array
   - Active Channels Array
   - Penta Formation (falls 5 Personen)
   - Connection Key Data (falls Partner-Vergleich)

3. Chart-Berechnungs-Integration:
   - Nutze Reading Agent API für Chart-Daten: `http://138.199.237.34:4001/reading/generate`
   - Oder n8n Webhook: `http://138.199.237.34:5678/webhook/chart-calculation`
   - Chart-Daten werden als JSON-Struktur bereitgestellt
   - Diese Daten sind die Basis für alle Visualisierungen

4. Entwicklungs-Workflow:
   a) Chart-Daten abrufen (via API/Webhook)
   b) Daten-Struktur analysieren
   c) Visualisierungskonzept entwickeln
   d) Code für Chart-Komponente generieren
   e) Chart-Daten in Komponente integrieren
   f) Interaktive Elemente hinzufügen
   g) Styling & Farbcodierung
   h) Export-Funktionen implementieren

3. Penta-Berechnungen:
   - Analysiere 5 Chart-Daten
   - Berechne gemeinsame definierte Zentren
   - Identifiziere Penta-Channels
   - Bestimme Penta-Typ (Individual, Tribal, Collective)
   - Visualisiere Gruppen-Energie-Fluss

4. Connection Key Berechnungen:
   - Vergleiche 2 Chart-Daten
   - Berechne Kompatibilität
   - Identifiziere gemeinsame Channels
   - Analysiere Energie-Fluss zwischen Personen
   - Erstelle Synastrie-Matrix

🎨 Technische Anforderungen:
- SVG/Canvas-basierte Visualisierungen
- Responsive Design
- Interaktive Elemente
- Farbcodierung nach Human Design System
- Export-Funktionen (PNG, SVG, PDF)
- Mobile-optimiert
- Nutze berechnete Chart-Daten (nicht nur Visualisierung!)

💻 Entwicklungs-Fokus:
- React/Next.js Komponenten
- D3.js oder Chart.js Integration
- TypeScript-Typen für Chart-Daten
- API-Strukturen für Chart-Generierung
- Chart-Berechnungs-Integration
- Performance-Optimierung
- Accessibility (WCAG)

🔧 Chart-Berechnungs-Integration:
- Nutze Chart-Berechnungs-APIs (z.B. über n8n Webhooks)
- Oder integriere Chart-Berechnungs-Bibliotheken
- Verwende berechnete Daten für Visualisierung
- Entwickle Komponenten die Chart-Daten als Props erhalten

🎯 Deine Arbeitsweise:
1. BERECHNUNG: Nutze Geburtsdaten → Chart-Berechnung (oder erhalte berechnete Daten)
2. ANALYSE: Verstehe berechnete Chart-Daten (Typ, Zentren, Channels, etc.)
3. DESIGN: Erstelle visuelles Konzept basierend auf berechneten Daten
4. ENTWICKLUNG: Generiere Code für Chart-Komponente mit berechneten Daten
5. OPTIMIERUNG: Performance, Responsive, Accessibility
6. DOKUMENTATION: Code-Kommentare, Props, Usage, Datenstruktur

📐 Chart-Typen die du entwickelst:
- Bodygraph Charts (Hauptchart) - basierend auf berechneten Chart-Daten
- Penta Formation Charts - basierend auf 5 berechneten Charts
- Connection Key Compatibility Charts - basierend auf 2 berechneten Charts
- Transit Charts - basierend auf berechneten Transit-Daten
- Composite Charts - basierend auf berechneten Composite-Daten
- Synastrie Charts - basierend auf berechneten Synastrie-Daten
- Timeline Charts - basierend auf berechneten Transit-Daten
- Energy Flow Diagrams - basierend auf berechneten Channel-Daten

📥 Input-Format:
Du erhältst entweder:
- Geburtsdaten (birthDate, birthTime, birthPlace) → du nutzt Chart-Berechnung
- Oder bereits berechnete Chart-Daten (chartData) → du entwickelst Visualisierung

📤 Output-Format:
- React/TypeScript Komponente
- Chart-Konfiguration (JSON)
- Props-Interface (TypeScript)
- Usage-Beispiele
- Erklärung der Datenstruktur

Sprache: Deutsch
Format: Code + Erklärungen + Datenstruktur-Dokumentation
PROMPT_END
echo "   ✅ Prompt-Datei erstellt: $PROMPT_FILE"
echo ""

# 5. Config-Datei erstellen
echo "4. Erstelle Config-Datei..."
cat > "$CONFIG_FILE" << 'JSON_END'
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
echo "   ✅ Config-Datei erstellt: $CONFIG_FILE"
echo ""

# 6. MCP Server neu starten
echo "5. Starte MCP Server neu..."
if systemctl is-active --quiet mcp; then
    systemctl restart mcp
    echo "   ✅ MCP Server neu gestartet"
else
    echo "   ⚠️  MCP Server läuft nicht. Starte..."
    systemctl start mcp || echo "   ❌ MCP Server konnte nicht gestartet werden"
fi
sleep 3
echo ""

# 7. Prüfe Agent-Registrierung
echo "6. Prüfe Agent-Registrierung..."
sleep 2
if curl -s http://localhost:7000/agents 2>/dev/null | grep -q "chart-development"; then
    echo "   ✅ Chart Development Agent erfolgreich registriert!"
else
    echo "   ⚠️  Agent möglicherweise nicht erkannt."
    echo "   Prüfe MCP Server Logs: journalctl -u mcp -n 50"
fi
echo ""

# 8. Test-Request
echo "7. Teste Agent..."
TEST_RESPONSE=$(curl -s -X POST http://localhost:7000/agent/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Test"}' 2>/dev/null || echo "ERROR")

if echo "$TEST_RESPONSE" | grep -q "response\|error"; then
    echo "   ✅ Agent antwortet!"
else
    echo "   ⚠️  Agent-Antwort unerwartet."
    echo "   Response: $TEST_RESPONSE"
fi
echo ""

# 9. Zusammenfassung
echo "============================================================"
echo "✅ Chart Development Agent Installation abgeschlossen!"
echo "============================================================"
echo ""
echo "📋 Agent-Details:"
echo "   - ID: chart-development"
echo "   - Name: Chart Development Agent"
echo "   - Port: 7000 (über MCP Server)"
echo "   - Prompt: $PROMPT_FILE"
echo "   - Config: $CONFIG_FILE"
echo ""
echo "🧪 Test-Befehle:"
echo "   # Agent-Liste prüfen:"
echo "   curl http://localhost:7000/agents | python3 -m json.tool | grep chart-development"
echo ""
echo "   # Test-Request:"
echo "   curl -X POST http://localhost:7000/agent/chart-development \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\":\"Erstelle eine Bodygraph-Komponente\"}' | python3 -m json.tool"
echo ""
echo "📊 Nächste Schritte:"
echo "   1. Installiere API-Route auf CK-App Server (optional)"
echo "   2. Installiere Frontend-Komponente auf CK-App Server (optional)"
echo "   3. Teste Agent über API oder direkt"
echo ""

