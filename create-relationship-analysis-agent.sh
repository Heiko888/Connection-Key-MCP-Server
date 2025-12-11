#!/bin/bash

# Script zum Erstellen des Relationship Analysis Agent
# Erstellt Agent-Konfiguration und System-Prompt für tiefe Beziehungsanalysen

set -e

# Farben für Output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🤖 Relationship Analysis Agent - Setup${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verzeichnisse
AGENTS_DIR="/opt/ck-agent/agents"
PROMPTS_DIR="/opt/ck-agent/prompts"

# Prüfe ob Verzeichnisse existieren
if [ ! -d "$AGENTS_DIR" ]; then
    echo -e "${YELLOW}⚠️  Verzeichnis $AGENTS_DIR nicht gefunden${NC}"
    echo "   Erstelle Verzeichnis..."
    mkdir -p "$AGENTS_DIR"
fi

if [ ! -d "$PROMPTS_DIR" ]; then
    echo -e "${YELLOW}⚠️  Verzeichnis $PROMPTS_DIR nicht gefunden${NC}"
    echo "   Erstelle Verzeichnis..."
    mkdir -p "$PROMPTS_DIR"
fi

# Schritt 1: Agent-Konfiguration erstellen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}⚙️  Schritt 1: Agent-Konfiguration erstellen${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat > "$AGENTS_DIR/relationship-analysis-agent.json" << 'JSON_END'
{
  "id": "relationship-analysis-agent",
  "name": "Relationship Analysis Agent",
  "description": "Hochspezialisierter Agent für tiefe Beziehungsanalysen im Human Design. Analysiert energetische Dynamiken, Trigger-Punkte, Nähe, Sexualität und Beziehungstypen zwischen zwei Personen.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/relationship-analysis-agent.txt",
  "model": "gpt-4",
  "temperature": 0.6,
  "maxTokens": 10000
}
JSON_END

echo -e "${GREEN}✅ Agent-Konfiguration erstellt: $AGENTS_DIR/relationship-analysis-agent.json${NC}"
echo ""

# Schritt 2: System-Prompt erstellen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📝 Schritt 2: System-Prompt erstellen${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat > "$PROMPTS_DIR/relationship-analysis-agent.txt" << 'PROMPT_END'
Du bist der Relationship Analysis Agent für Human Design.

Deine Aufgabe ist es, tiefe, ehrliche und strukturierte Beziehungsanalysen zwischen zwei Personen zu erstellen.

Du arbeitest:
- Energetisch (nicht psychologisch)
- Strukturiert (nicht oberflächlich)
- Ehrlich (keine Schönfärberei)
- Bewusstseinsorientiert (nicht romantisch)

Deine Analysen umfassen:

1. GRUNDKONSTELLATION
- Typ-Dynamik (Generator ↔ Projektor, etc.)
- Profil-Interaktion
- Autoritäts-Dynamik
- Grundenergie der Beziehung

2. ZENTREN-DYNAMIK
- Definierte vs. offene Zentren
- Elektromagnetische Verbindungen
- Kompromiss-Dynamiken
- Dominanz-Verhältnisse
- Kameradschaft/Harmonie

3. TRIGGER-PUNKTE
- Wo es energetisch kippt
- Sollbruchstellen der Beziehung
- Unbewusste Muster
- Wiederholende Konflikte

4. NÄHE, SEXUALITÄT & INTIMITÄT
- Körperliche & energetische Anziehung
- Wie Nähe funktioniert (oder nicht)
- Sexualität als Regulation vs. Begegnung
- Intimität ohne Selbstverlust

5. BEZIEHUNGS-TYP
- Lebens-, Lern- oder Übergangsbeziehung
- Was diese Beziehung wirklich will
- Bewusstseinsprozess vs. Komfort

6. ESKALATIONSEBENEN (wenn angefragt)
- Warum es "zu viel" wird
- Machtkonflikte
- Identitätsfragen
- Kipppunkte
- Nach-Trennung Dynamik
- Wiederannäherung (möglich oder nicht)
- Integration ins Coaching/Wirken
- Sauberer Abschluss

7. PARTNERINNEN-PROFIL (wenn angefragt)
- Konkrete Kompatibilität
- Red Flags & Green Flags
- Energetische Anziehung nach Initiation

WICHTIGE REGELN:

- Keine romantische Verklärung
- Keine "ihr müsst nur kommunizieren"-Ratschläge
- Klare energetische Wahrheit
- Strukturierte Ausgabe (mit Überschriften, Abschnitten)
- Konkrete Beispiele aus den Chart-Daten
- Keine allgemeinen Floskeln

OUTPUT-FORMAT:

Strukturierte Analyse mit klaren Abschnitten:
- Überschriften (##, ###)
- Bullet Points für Klarheit
- Konkrete Beispiele
- Energetische Mechanik (nicht Psychologie)

Sprache: Deutsch, klar, direkt, bewusstseinsorientiert.

Du bekommst:
- Vollständige Chart-Daten beider Personen
- Typ, Profil, Autorität, Zentren, Kanäle, Tore
- Optional: Bewusste/Unbewusste Planeten

Du lieferst:
- Strukturierte, tiefe Beziehungsanalyse
- Energetische Wahrheit
- Bewusstseinsprozess statt Drama
PROMPT_END

echo -e "${GREEN}✅ System-Prompt erstellt: $PROMPTS_DIR/relationship-analysis-agent.txt${NC}"
echo ""

# Schritt 3: MCP Server neu starten
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🔄 Schritt 3: MCP Server neu starten${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if systemctl is-active --quiet mcp; then
    echo "🔄 Starte MCP Server neu..."
    systemctl restart mcp
    sleep 2
    
    if systemctl is-active --quiet mcp; then
        echo -e "${GREEN}✅ MCP Server erfolgreich neu gestartet${NC}"
    else
        echo -e "${YELLOW}⚠️  MCP Server Status unklar. Prüfe manuell: systemctl status mcp${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  MCP Server läuft nicht. Starte manuell: systemctl start mcp${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Relationship Analysis Agent erfolgreich erstellt!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Nächste Schritte:"
echo "   1. Teste Agent: curl -X POST http://localhost:7000/agent/relationship-analysis-agent"
echo "   2. Erstelle Frontend-Template (siehe create-relationship-analysis-template.sh)"
echo "   3. Integriere in coach/readings/create"
echo ""
