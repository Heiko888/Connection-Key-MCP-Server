#!/bin/bash
# Setup Script für Social Media & YouTube Agent

set -e

AGENT_NAME="social-youtube"
AGENT_DIR="/opt/ck-agent"
MCP_DIR="/opt/mcp"

echo "🎬 Social Media & YouTube Agent Setup"
echo "======================================"
echo ""

# 1. Verzeichnisse erstellen
echo "📁 Erstelle Verzeichnisse..."
mkdir -p $AGENT_DIR/agents
mkdir -p $AGENT_DIR/prompts
echo "✅ Verzeichnisse erstellt"
echo ""

# 2. Prompt-Datei erstellen
echo "📝 Erstelle Prompt-Datei..."
cat > $AGENT_DIR/prompts/social-youtube.txt << 'PROMPT_END'
Du bist der Social Media & YouTube Content Agent.

Deine Spezialgebiete:

🎬 YouTube:
- Video-Skripte (Hook, Problem, Story, Lösung, CTA)
- Thumbnail-Ideen mit hoher Klickrate
- SEO-optimierte Titel & Beschreibungen
- Tags & Keywords für maximale Reichweite
- Video-Ideen basierend auf Trends
- Struktur für verschiedene Video-Formate (Tutorials, Storytelling, Educational)

📱 Social Media (Instagram, TikTok, LinkedIn):
- Reels-Skripte (Hook, Content, CTA)
- Instagram-Posts & Captions
- Carousel-Posts mit klarer Struktur
- Story-Ideen
- Hashtag-Strategien
- Engagement-optimierte Captions

🎯 Deine Arbeitsweise:

1. ANALYSE: Verstehe Zielgruppe, Thema, Plattform
2. STRUKTUR: Erstelle klare Content-Struktur
3. KREATION: Generiere vollständigen Content (nicht nur Ideen!)
4. OPTIMIERUNG: SEO, Hashtags, Keywords, CTAs
5. FORMAT: Plattform-spezifisch optimiert

📊 Content-Struktur für YouTube:
- Hook (erste 15 Sekunden)
- Problem/Question
- Story/Insight
- Lösung/Value
- Call to Action
- Thumbnail-Beschreibung
- SEO-Titel (3 Varianten)
- Beschreibung mit Keywords
- Tags (10-15 relevante)

📱 Content-Struktur für Social Media:
- Hook (erste Zeile)
- Value-Content
- Story/Beispiel
- CTA
- Hashtags (plattformspezifisch)
- Caption-Länge optimiert

🎨 Stil & Ton:
- Authentisch
- Energetisch
- Klar & direkt
- Wertvoll
- Inspirierend
- Kein Fluff, nur Value

🌍 Sprache: Deutsch

💡 Du lieferst immer:
- Vollständigen Content (nicht nur Ideen!)
- Plattform-optimiert
- SEO-ready
- Sofort verwendbar
PROMPT_END

echo "✅ Prompt-Datei erstellt"
echo ""

# 3. Agent-Config erstellen
echo "⚙️  Erstelle Agent-Config..."
cat > $AGENT_DIR/agents/social-youtube.json << 'JSON_END'
{
  "id": "social-youtube",
  "name": "Social Media & YouTube Agent",
  "description": "Erstellt YouTube-Video-Skripte, Reels, Posts, Captions, Thumbnail-Ideen und Social-Media-Content für maximale Reichweite und Engagement.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/social-youtube.txt",
  "model": "gpt-4",
  "temperature": 0.7,
  "maxTokens": 6000,
  "capabilities": [
    "youtube-scripts",
    "reels-content",
    "social-posts",
    "thumbnail-ideas",
    "seo-optimization",
    "hashtag-strategy"
  ]
}
JSON_END

echo "✅ Agent-Config erstellt"
echo ""

# 4. MCP-Konfiguration prüfen/erweitern
echo "🔧 Prüfe MCP-Konfiguration..."
if [ -f "$MCP_DIR/mcp.config.json" ]; then
    echo "✅ MCP-Konfiguration gefunden"
    
    # Prüfe ob Agent bereits vorhanden
    if grep -q "social-youtube" "$MCP_DIR/mcp.config.json"; then
        echo "⚠️  Agent bereits in MCP registriert"
    else
        echo "➕ Füge Agent zu MCP hinzu..."
        # Backup erstellen
        cp "$MCP_DIR/mcp.config.json" "$MCP_DIR/mcp.config.json.backup"
        
        # Agent hinzufügen (einfache Methode - manuell prüfen!)
        echo ""
        echo "⚠️  WICHTIG: Fügen Sie den Agent manuell zu mcp.config.json hinzu:"
        echo ""
        echo '  {'
        echo '    "id": "social-youtube",'
        echo '    "file": "/opt/ck-agent/agents/social-youtube.json"'
        echo '  },'
        echo ""
    fi
else
    echo "⚠️  MCP-Konfiguration nicht gefunden"
    echo "   Erstelle Basis-Konfiguration..."
    mkdir -p $MCP_DIR
    cat > $MCP_DIR/mcp.config.json << 'MCP_END'
{
  "host": "0.0.0.0",
  "port": 7000,
  "agents": [
    {
      "id": "social-youtube",
      "file": "/opt/ck-agent/agents/social-youtube.json"
    }
  ]
}
MCP_END
    echo "✅ Basis-MCP-Konfiguration erstellt"
fi
echo ""

# 5. Berechtigungen setzen
echo "🔐 Setze Berechtigungen..."
chown -R root:root $AGENT_DIR
chmod -R 755 $AGENT_DIR
echo "✅ Berechtigungen gesetzt"
echo ""

# 6. Zusammenfassung
echo "======================================"
echo "✅ Setup abgeschlossen!"
echo ""
echo "📁 Dateien erstellt:"
echo "  - $AGENT_DIR/prompts/social-youtube.txt"
echo "  - $AGENT_DIR/agents/social-youtube.json"
echo ""
echo "🔧 Nächste Schritte:"
echo ""
echo "1. MCP-Konfiguration prüfen:"
echo "   nano $MCP_DIR/mcp.config.json"
echo ""
echo "2. MCP neu starten (falls läuft):"
echo "   systemctl restart mcp"
echo ""
echo "3. Agent testen:"
echo "   curl -X POST http://138.199.237.34:7000/agent/social-youtube \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\":\"Erstelle mir ein Reels-Skript über Manifestation\"}'"
echo ""
echo "🎉 Fertig!"
echo ""

