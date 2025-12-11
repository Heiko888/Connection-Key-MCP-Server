#!/bin/bash

# ============================================
# Brandbook-Ergänzung: Signature Bodygraph System
# ============================================
# Aktualisiert alle Agent-Prompts mit Signature Bodygraph System-Regeln
# ============================================

set -e

AGENT_DIR="/opt/ck-agent"
PROMPTS_DIR="$AGENT_DIR/prompts"

echo "========================================"
echo "Brandbook-Ergänzung: Signature Bodygraph System"
echo "========================================"
echo ""

# Prüfe ob Prompt-Verzeichnis existiert
if [ ! -d "$PROMPTS_DIR" ]; then
    echo "❌ Prompt-Verzeichnis nicht gefunden: $PROMPTS_DIR"
    exit 1
fi

# Erweiterte Brandbook-Sektion mit Signature Bodygraph System
BRANDBOOK_SECTION="

=== SIGNATURE BODYGRAPH SYSTEM (VERBINDLICH) ===

Das Signature Bodygraph System ist ein modulares, zustandsbasiertes System.

WICHTIG - Systemregeln:

1. SYSTEMVERSTÄNDNIS:
   - Bodygraph ist KEIN statisches Designobjekt
   - Modulares, zustandsbasiertes System
   - Darstellung und Bedeutung sind STRICT GETRENNT

2. KOMPONENTENARCHITEKTUR:
   - Bodygraph Canvas, Center, Channel, Gate
   - Right Panel, Meta Header, Footer Hint
   - Alle Komponenten: wiederverwendbar, kontextunabhängig, systemweit konsistent

3. STATE-SYSTEM (VERBINDLICH):
   - Default: Reine Strukturansicht ohne Hervorhebung
   - Hover: Kurzzeitige visuelle Rückmeldung ohne Bedeutungsänderung
   - Focus: Exklusiver Analysezustand mit Panel-Anzeige
   - Disabled/Soft: Visuelle Zurücknahme bei Fremdfokus
   - REGEL: Es existiert immer nur EIN Fokuszustand gleichzeitig

4. INTERAKTIONSPRINZIPIEN:
   - Bodygraph bleibt visuell stabil
   - Interaktion erzeugt Informationsverlagerung, nicht Bewegung
   - Ebenentrennung: Bodygraph → Struktur, Panel → Bedeutung, Footer → Hinweise
   - Diese Ebenen dürfen NICHT vermischt werden

5. PANEL-SYSTEM:
   - Panels sind Denkflächen
   - Verbindliche Struktur (nicht veränderbar):
     1. Orientierung (Titel & Status)
     2. Kernfunktion
     3. Kontextabhängige Bedeutung
     4. Risiken / Übersteuerung
     5. Entscheidungsrelevanter Hinweis

6. KONTEXTSYSTEM:
   - Kontexte: personal, business, relationship, crisis
   - REGEL: Kontext verändert BEDEUTUNG, nicht DARSTELLUNG
   - Visueller Bodygraph bleibt unverändert
   - Nur Panel- und Footer-Inhalte wechseln

7. SYSTEMMODI:
   - Single: Individuelle Struktur und Entscheidungslogik
   - Dual: Interaktion zwischen zwei Systemen (Signature-Element)
   - Penta: Funktionsorientiert, rollenbasiert, systemisch

8. SPRACHLICHE SYSTEMREGELN (KRITISCH):
   - Sprache ist: beschreibend, sachlich, ruhig, systemisch
   - VERBOTENE BEGRIFFE (NIEMALS VERWENDEN):
     ❌ Heilung
     ❌ Blockade
     ❌ Transformation
     ❌ Manifestation
     ❌ Loslassen
     ❌ Energiearbeit
   - Sprache dient der Orientierung, nicht der Beeinflussung

9. WEITERENTWICKLUNG:
   - Alle Erweiterungen müssen bestehende Design Tokens respektieren
   - Bestehende States verwenden
   - Bestehende Interaktionslogik einhalten

WICHTIG: Diese Regeln sind VERBINDLICH für alle Agenten, die mit Bodygraph-Systemen arbeiten!
"

update_prompt() {
    local prompt_file=$1
    local agent_name=$2
    
    if [ ! -f "$prompt_file" ]; then
        echo "  ⚠️  Prompt-Datei nicht gefunden: $prompt_file"
        return 1
    fi
    
    # Prüfe ob Signature Bodygraph System bereits vorhanden
    if grep -q "SIGNATURE BODYGRAPH SYSTEM" "$prompt_file"; then
        echo "  ⏭️  $agent_name: Signature Bodygraph System bereits vorhanden"
        return 0
    fi
    
    # Backup erstellen
    cp "$prompt_file" "${prompt_file}.backup-$(date +%Y%m%d-%H%M%S)"
    
    # Signature Bodygraph System hinzufügen
    echo "$BRANDBOOK_SECTION" >> "$prompt_file"
    
    echo "  ✅ $agent_name: Signature Bodygraph System hinzugefügt"
    return 0
}

echo "[*] Aktualisiere Agent-Prompts..."
echo ""

# Alle Agenten aktualisieren
for prompt_file in "$PROMPTS_DIR"/*.txt; do
    if [ -f "$prompt_file" ]; then
        agent_name=$(basename "$prompt_file" .txt)
        update_prompt "$prompt_file" "$agent_name"
    fi
done

echo ""
echo "[*] Prüfe MCP Server Status..."
echo ""

# Prüfe ob MCP Server läuft
if systemctl is-active --quiet mcp-server 2>/dev/null; then
    echo "  ✅ MCP Server läuft (systemd)"
    echo "  🔄 MCP Server muss neu gestartet werden, damit Änderungen wirksam werden"
    echo ""
    read -p "  MCP Server jetzt neu starten? (j/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[JjYy]$ ]]; then
        systemctl restart mcp-server
        echo "  ✅ MCP Server neu gestartet"
    fi
else
    echo "  ⚠️  MCP Server läuft nicht oder Service-Name ist anders"
fi

echo ""
echo "========================================"
echo "Fertig!"
echo "========================================"
echo ""
echo "✅ Alle Agent-Prompts wurden aktualisiert"
echo "⚠️  MCP Server muss neu gestartet werden (falls noch nicht geschehen)"
echo ""
