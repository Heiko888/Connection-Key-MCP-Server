#!/bin/bash
# Direktes Update-Script für Agent-Prompts

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
   - Ebenentrennung: Bodygraph -> Struktur, Panel -> Bedeutung, Footer -> Hinweise
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
     - Heilung
     - Blockade
     - Transformation
     - Manifestation
     - Loslassen
     - Energiearbeit
   - Sprache dient der Orientierung, nicht der Beeinflussung

9. WEITERENTWICKLUNG:
   - Alle Erweiterungen müssen bestehende Design Tokens respektieren
   - Bestehende States verwenden
   - Bestehende Interaktionslogik einhalten

WICHTIG: Diese Regeln sind VERBINDLICH für alle Agenten, die mit Bodygraph-Systemen arbeiten!
"

PROMPTS_DIR="/opt/ck-agent/prompts"

for file in "$PROMPTS_DIR"/*.txt; do
    if [ -f "$file" ]; then
        agent_name=$(basename "$file" .txt)
        if ! grep -q "SIGNATURE BODYGRAPH SYSTEM" "$file"; then
            cp "$file" "${file}.backup-$(date +%Y%m%d-%H%M%S)"
            echo "$BRANDBOOK_SECTION" >> "$file"
            echo "✅ $agent_name: Aktualisiert"
        else
            echo "⏭️  $agent_name: Bereits vorhanden"
        fi
    fi
done
