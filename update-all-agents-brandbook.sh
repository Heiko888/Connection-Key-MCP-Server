#!/bin/bash

# ============================================
# Alle MCP Agenten mit Brand Book ausstatten
# ============================================
# Erweitert alle Agent-Prompts mit Brand Book Integration
# ============================================

set -e

AGENT_DIR="/opt/ck-agent"
BRANDBOOK_PATH="/opt/mcp-connection-key/production/knowledge/brandbook"
PROMPTS_DIR="$AGENT_DIR/prompts"

echo "========================================"
echo "Alle Agenten mit Brand Book ausstatten"
echo "========================================"
echo ""

# Prüfe ob Prompt-Verzeichnis existiert
if [ ! -d "$PROMPTS_DIR" ]; then
    echo "❌ Prompt-Verzeichnis nicht gefunden: $PROMPTS_DIR"
    exit 1
fi

echo "[*] Prüfe Brand Book Knowledge..."
echo ""

# Prüfe ob Brand Book Dateien existieren
if [ ! -d "$BRANDBOOK_PATH" ]; then
    echo "⚠️  Brand Book Verzeichnis nicht gefunden: $BRANDBOOK_PATH"
    echo "   Erstelle leeres Verzeichnis..."
    mkdir -p "$BRANDBOOK_PATH"
fi

# Lade Brand Book Knowledge (erste 3 Kapitel als Beispiel)
BRANDBOOK_INTRO=""
if [ -f "$BRANDBOOK_PATH/brandbook-kapitel-01.txt" ]; then
    BRANDBOOK_INTRO=$(head -n 100 "$BRANDBOOK_PATH/brandbook-kapitel-01.txt" 2>/dev/null || echo "")
fi

# Brand Book Sektion für Prompts
BRANDBOOK_SECTION="

=== BRAND BOOK WISSEN (WICHTIG - IMMER VERWENDEN) ===

Du arbeitest für \"The Connection Key\" und MUSST das Brand Book Wissen in all deinen Antworten verwenden:

WICHTIG - Brand Book Richtlinien:
- Nutze den korrekten Tone of Voice von \"The Connection Key\"
- Reflektiere die Markenidentität und Werte in deinen Antworten
- Halte dich an die Kommunikationsrichtlinien
- Verwende den Brand Voice konsistent
- Markenstatement: \"Entdecke die Frequenz zwischen euch – klar, präzise, alltagsnah.\"

Markenwerte:
- Präzision: Echte Daten, klare Analysen, kein esoterisches Raten
- Verbindung: Zwischen Menschen, Körper, Seele, Design und Realität
- Transformation: Praktische Umsetzung im Alltag, Dating, Business, Coaching

=== DESIGN-KONSISTENZ (KRITISCH - IMMER EINHALTEN) ===

WICHTIG - Design-Richtlinien der App:
Du MUSST dich konsistent zum Design der App halten:

VISUELLE IDENTITÄT:
- Typografie: Inter (Sans-Serif) für UI, Fira Code für Code
- Schriftgrößen: xs (12px), sm (14px), base (16px), lg (18px), xl (20px), 2xl (24px), 3xl (30px), 4xl (36px)
- Neutrale Farben: Dunkelgrau (#2C3E50) für Text, Mittelgrau (#7F8C8D) für sekundären Text, Hellgrau (#ECF0F1) für Hintergründe

AGENT-SPEZIFISCHE FARBEN (verwende diese in Design-Vorschlägen):
- Marketing Agent: #FF6B6B (Warmes Rot)
- Automation Agent: #4ECDC4 (Türkis)
- Sales Agent: #FFE66D (Gold)
- Social-YouTube Agent: #A8E6CF (Mint)
- Reading Agent: #C7CEEA (Lavendel)

UI/UX PRINZIPIEN:
- Border-Radius: 8px (Buttons), 12px (Cards)
- Padding: 12px-24px (Buttons), 24px (Cards)
- Box-Shadow: 0 4px 6px rgba(0,0,0,0.1) (Standard), 0 8px 12px rgba(0,0,0,0.15) (Hover)
- Transitions: 0.2s für alle Hover-Effekte
- Responsive Design: Alle Elemente müssen auf Mobile funktionieren

DESIGN-DO'S:
✅ Konsistente Farben verwenden (Agent-spezifische Primärfarbe)
✅ Klare Hierarchie (Agent-Name prominent, Beschreibung sekundär)
✅ Emojis als visuelle Marker (🎯 Marketing, ⚙️ Automation, 💰 Sales, 🎬 Social-YouTube, 🔮 Reading)
✅ Zugänglichkeit (WCAG AA Kontrast, Keyboard-Navigation)

DESIGN-DON'TS:
❌ Keine Farbmischungen verschiedener Agenten
❌ Keine generischen Icons (verwende definierte Emojis)
❌ Keine übermäßige Komplexität (klar und einfach)
❌ Keine inkonsistente Terminologie

Sprache: Deutsch
Stil: Authentisch, klar, wertvoll, persönlich - im Einklang mit The Connection Key Brand Voice
Design: Konsistent zum App-Design - verwende die definierten Farben, Typografie und UI-Prinzipien"

# Funktion: Prompt mit Brand Book erweitern
update_prompt() {
    local prompt_file=$1
    local agent_name=$2
    
    if [ ! -f "$prompt_file" ]; then
        echo "  ⚠️  Prompt-Datei nicht gefunden: $prompt_file"
        return 1
    fi
    
    # Prüfe ob Brand Book bereits vorhanden
    if grep -q "BRAND BOOK WISSEN" "$prompt_file"; then
        echo "  ⏭️  $agent_name: Brand Book bereits vorhanden"
        return 0
    fi
    
    # Backup erstellen
    cp "$prompt_file" "${prompt_file}.backup-$(date +%Y%m%d-%H%M%S)"
    
    # Brand Book hinzufügen
    echo "$BRANDBOOK_SECTION" >> "$prompt_file"
    
    echo "  ✅ $agent_name: Brand Book hinzugefügt"
    return 0
}

echo "[*] Aktualisiere Agent-Prompts..."
echo ""

# Marketing Agent
echo "  Marketing Agent..."
update_prompt "$PROMPTS_DIR/marketing.txt" "Marketing Agent"

# Automation Agent
echo "  Automation Agent..."
update_prompt "$PROMPTS_DIR/automation.txt" "Automation Agent"

# Sales Agent
echo "  Sales Agent..."
update_prompt "$PROMPTS_DIR/sales.txt" "Sales Agent"

# Social-YouTube Agent
echo "  Social-YouTube Agent..."
update_prompt "$PROMPTS_DIR/social-youtube.txt" "Social-YouTube Agent"

echo ""

echo "[*] Prüfe MCP Server Status..."
echo ""

# Prüfe ob MCP Server läuft
if systemctl is-active --quiet mcp 2>/dev/null || pm2 list | grep -q "mcp"; then
    echo "  ✅ MCP Server läuft"
    echo "  🔄 MCP Server muss neu gestartet werden, damit Änderungen wirksam werden"
    echo ""
    read -p "  MCP Server jetzt neu starten? (j/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[JjYy]$ ]]; then
        if systemctl is-active --quiet mcp 2>/dev/null; then
            systemctl restart mcp
            echo "  ✅ MCP Server neu gestartet (systemctl)"
        elif pm2 list | grep -q "mcp"; then
            pm2 restart mcp
            echo "  ✅ MCP Server neu gestartet (pm2)"
        else
            echo "  ⚠️  MCP Server nicht gefunden"
        fi
    fi
else
    echo "  ⚠️  MCP Server läuft nicht"
fi

echo ""

echo "========================================"
echo "Fertig!"
echo "========================================"
echo ""
echo "Aktualisierte Agenten:"
echo "  ✅ Marketing Agent"
echo "  ✅ Automation Agent"
echo "  ✅ Sales Agent"
echo "  ✅ Social-YouTube Agent"
echo ""
echo "Nächste Schritte:"
echo "  1. MCP Server neu starten (falls noch nicht geschehen)"
echo "  2. Agenten testen"
echo "  3. Prüfen ob Brand Voice verwendet wird"
echo ""

