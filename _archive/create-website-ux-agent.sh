#!/bin/bash

# 🚀 Website / UX Agent erstellen
# Erstellt den neuen Agenten nach dem gleichen Muster wie Marketing, Automation, etc.

set -e

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🚀 Website / UX Agent erstellen${NC}"
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

cat > "$AGENTS_DIR/website-ux-agent.json" << 'JSON_END'
{
  "id": "website-ux-agent",
  "name": "Website / UX Agent",
  "description": "Analysiert Webseiten, Landingpages und App-Seiten aus UX-, Struktur- und Conversion-Sicht. Liefert konkrete, umsetzbare Verbesserungsvorschläge.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/website-ux-agent.txt",
  "model": "gpt-4",
  "temperature": 0.6,
  "maxTokens": 6000
}
JSON_END

echo -e "${GREEN}✅ Agent-Konfiguration erstellt: $AGENTS_DIR/website-ux-agent.json${NC}"
echo ""

# Schritt 2: System-Prompt erstellen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📝 Schritt 2: System-Prompt erstellen${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat > "$PROMPTS_DIR/website-ux-agent.txt" << 'PROMPT_END'
Du bist ein spezialisierter Website-, UX- und Conversion-Agent.

Deine Aufgabe ist es, Webseiten, Landingpages und App-Seiten zu analysieren
und konkrete, umsetzbare Verbesserungsvorschläge zu liefern.

Du arbeitest NICHT als Grafikdesigner, sondern als strategischer UX-Architekt
mit Fokus auf:
- Nutzerführung
- Emotionale Wirkung
- Klarheit
- Premium-Wahrnehmung
- Conversion

Grundregeln:
- Keine vagen Aussagen wie „sieht moderner aus" oder „könnte schöner sein".
- Jede Kritik muss mit einer konkreten Lösung verbunden sein.
- Denke in Seitenabschnitten (Hero, Content-Sections, CTAs, Trust, Footer).
- Übersetze Inhalte immer in Layout-Logik (z. B. Cards, 2-Spalten, Grid, Flow).
- Berücksichtige Scroll-Verhalten, Above-the-Fold und visuelle Anker.

Deine Analysen beinhalten – wenn sinnvoll:
- Seitenstruktur (Reihenfolge & Aufbau)
- Headline- & Textlängen-Empfehlungen
- Bildtypen (Hero-Bild, Symbolik, Illustration, Emotion)
- CTA-Logik (primär / sekundär)
- Trust-Elemente (z. B. Proof, Orientierung, Sicherheit)
- UX-Hürden & Reibungspunkte

Du gibst Vorschläge so, dass ein Entwickler oder Website-Betreiber sie
direkt umsetzen kann (z. B. in WordPress, Next.js oder statischen Seiten).

Du programmierst selbst keinen Code,
aber deine Vorschläge sind technisch realistisch.

Wenn dir Inhalte fehlen, sag klar:
„Hier fehlt Inhalt X, um diese Sektion sinnvoll aufzubauen."

Ziel:
Die Seite soll sich klar, hochwertig, vertrauenswürdig und fokussiert anfühlen
– ohne Überladung.

Sprache: Deutsch
PROMPT_END

echo -e "${GREEN}✅ System-Prompt erstellt: $PROMPTS_DIR/website-ux-agent.txt${NC}"
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
  if echo "$AGENTS_LIST" | grep -q "website-ux-agent"; then
    echo -e "${GREEN}✅ Agent 'website-ux-agent' wurde erkannt!${NC}"
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

echo -e "${GREEN}✅ Website / UX Agent erfolgreich erstellt!${NC}"
echo ""
echo "Agent-Details:"
echo "  ID: website-ux-agent"
echo "  Name: Website / UX Agent"
echo "  Config: $AGENTS_DIR/website-ux-agent.json"
echo "  Prompt: $PROMPTS_DIR/website-ux-agent.txt"
echo ""
echo "API-Endpoint:"
echo "  POST http://138.199.237.34:7000/agent/website-ux-agent"
echo ""
echo "Test-Befehl:"
echo "  curl -X POST http://localhost:7000/agent/website-ux-agent \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"message\":\"Analysiere folgende Seite aus UX- und Conversion-Sicht: https://www.the-connection-key.de/agents\"}'"
echo ""
echo "Nächste Schritte:"
echo "  1. Teste den Agenten (siehe Test-Befehl oben)"
echo "  2. Optional: Erstelle Frontend-API-Route (siehe integration/api-routes/)"
echo "  3. Optional: Erstelle Frontend-Komponente (siehe integration/frontend/)"
echo ""
