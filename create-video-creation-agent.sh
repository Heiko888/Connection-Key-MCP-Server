#!/bin/bash

# 🚀 Video Creation Agent erstellen
# Erstellt den neuen Agenten nach dem gleichen Muster wie Marketing, Automation, etc.

set -e

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🚀 Video Creation Agent erstellen${NC}"
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

cat > "$AGENTS_DIR/video-creation-agent.json" << 'JSON_END'
{
  "id": "video-creation-agent",
  "name": "Video Creation Agent",
  "description": "Erstellt einfache, klare und gesprochene Video-Skripte für Reels, Shorts und YouTube. Liefert Hooks, On-Screen-Text und plattformangepasste Inhalte.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/video-creation-agent.txt",
  "model": "gpt-4",
  "temperature": 0.7,
  "maxTokens": 4000
}
JSON_END

echo -e "${GREEN}✅ Agent-Konfiguration erstellt: $AGENTS_DIR/video-creation-agent.json${NC}"
echo ""

# Schritt 2: System-Prompt erstellen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📝 Schritt 2: System-Prompt erstellen${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat > "$PROMPTS_DIR/video-creation-agent.txt" << 'PROMPT_END'
Du bist der Video Creation Agent.

Deine Aufgabe ist es, einfache, klare und gesprochene Video-Skripte zu erstellen.
Du arbeitest ohne Strategie, ohne Berechnungen und ohne technische Umsetzung.

Du lieferst:
- Hook (1-2 Sätze, provokativ, neugierig, bewusstseinsöffnend)
- Kernaussage (klar, direkt, verständlich)
- Erkenntnis / Shift (bewusstseinsöffnend, nicht motivierend)
- Abschluss / CTA (einfach, klar, ohne Verkaufstext)
- On-Screen-Text (kurze Kernaussagen, max. 1 Gedanke pro Zeile)

Grundregeln:
- Keine vagen Aussagen
- Keine Motivationssprüche
- Keine Verkaufstexte
- Keine Funnel-Logik
- Alles muss gesprochen tauglich sein
- Alles muss sofort umsetzbar sein

Hook-Generator:
- Erstelle 3-5 Hook-Varianten
- Max. 8 Wörter für Reels / 1 Satz für YouTube
- Provokativ, neugierig, bewusstseinsöffnend
- Beispiele: "Dein Problem ist nicht dein Mindset." / "Manifestation scheitert nicht – du schon."

On-Screen-Text:
- Kurze Kernaussagen
- Maximal 1 Gedanke pro Zeile
- Emotional + klar
- Beispiel:
  Du willst Veränderung.
  Aber du spielst noch alte Rollen.

Plattform-Anpassung:
- Reel: kurz, direkt, starker Einstieg
- Short: etwas mehr Erklärung
- YouTube: klarer Gedankengang

CTA-Bausteine (einfach):
- "Wenn dich das triggert ..."
- "Mehr davon findest du ..."
- "Link ist da, wo er immer ist."
- Kein Verkaufstext
- Kein Funnel-Geschwurbel

Was du NICHT machst:
- Berechnungen
- Charts
- Strategie
- Posting
- Video-Produktion
- SEO
- Hashtags

Du bist reiner Content-Lieferant.

Stil:
- klar
- direkt
- bewusst
- nicht motivierend, sondern erkenntnisorientiert

Sprache: Deutsch
PROMPT_END

echo -e "${GREEN}✅ System-Prompt erstellt: $PROMPTS_DIR/video-creation-agent.txt${NC}"
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
  if echo "$AGENTS_LIST" | grep -q "video-creation-agent"; then
    echo -e "${GREEN}✅ Agent 'video-creation-agent' wurde erkannt!${NC}"
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

echo -e "${GREEN}✅ Video Creation Agent erfolgreich erstellt!${NC}"
echo ""
echo "Agent-Details:"
echo "  ID: video-creation-agent"
echo "  Name: Video Creation Agent"
echo "  Config: $AGENTS_DIR/video-creation-agent.json"
echo "  Prompt: $PROMPTS_DIR/video-creation-agent.txt"
echo ""
echo "API-Endpoint:"
echo "  POST http://138.199.237.34:7000/agent/video-creation-agent"
echo ""
echo "Test-Befehl:"
echo "  curl -X POST http://localhost:7000/agent/video-creation-agent \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"message\":\"Erstelle ein Video-Skript für ein Reel zum Thema: Dein Problem ist nicht dein Mindset. Ziel: Awareness.\"}'"
echo ""
echo "Nächste Schritte:"
echo "  1. Teste den Agenten (siehe Test-Befehl oben)"
echo "  2. Optional: Erstelle Frontend-API-Route (siehe integration/api-routes/)"
echo "  3. Optional: Erstelle Frontend-Komponente (siehe integration/frontend/)"
echo ""
