#!/bin/bash
# Import-Script für Knowledge-Ordner aus "Master of Manifestation"
# Zusammenführt alle Dateien aus jedem Ordner in eine Knowledge-Datei

SOURCE_DIR="${1:-Heiko - Persönlich/Dateien TRS/Master of Manifestation}"
TARGET_DIR="${2:-production/knowledge}"

echo "📚 Importiere Knowledge-Ordner..."
echo "Quelle: $SOURCE_DIR"
echo "Ziel: $TARGET_DIR"
echo "=========================================="
echo ""

if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Quell-Ordner nicht gefunden: $SOURCE_DIR"
    exit 1
fi

# Erstelle Ziel-Verzeichnis falls nicht vorhanden
mkdir -p "$TARGET_DIR"

# Funktion zum Zusammenführen von Dateien
merge_files() {
    local source_folder="$1"
    local target_file="$2"
    local description="$3"
    
    if [ ! -d "$source_folder" ]; then
        echo "⚠️  $description - Ordner nicht gefunden: $source_folder"
        return 1
    fi
    
    echo "📁 Importiere: $description"
    
    # Erstelle temporäre Datei
    temp_file=$(mktemp)
    
    # Füge Header hinzu
    echo "# $description" > "$temp_file"
    echo "" >> "$temp_file"
    echo "Diese Datei wurde automatisch aus dem Ordner \"$description\" importiert." >> "$temp_file"
    echo "" >> "$temp_file"
    echo "---" >> "$temp_file"
    echo "" >> "$temp_file"
    
    # Finde alle Text-Dateien und füge sie hinzu
    file_count=0
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            echo "" >> "$temp_file"
            echo "## $(basename "$file")" >> "$temp_file"
            echo "" >> "$temp_file"
            
            # Versuche Datei zu lesen (nur Text-Dateien)
            if file "$file" | grep -q "text"; then
                cat "$file" >> "$temp_file"
                ((file_count++))
            elif [[ "$file" == *.txt ]] || [[ "$file" == *.md ]]; then
                cat "$file" >> "$temp_file" 2>/dev/null || echo "⚠️  Konnte nicht gelesen werden: $file"
                ((file_count++))
            else
                echo "⚠️  Nicht-Text-Datei übersprungen: $file"
            fi
            
            echo "" >> "$temp_file"
            echo "---" >> "$temp_file"
        fi
    done < <(find "$source_folder" -type f | sort)
    
    if [ "$file_count" -eq 0 ]; then
        echo "   ⚠️  Keine Text-Dateien gefunden"
        rm "$temp_file"
        return 1
    fi
    
    # Verschiebe temporäre Datei zum Ziel
    mv "$temp_file" "$target_file"
    echo "   ✅ $target_file erstellt ($file_count Dateien zusammengeführt)"
    
    return 0
}

# 1. Autorität
merge_files "$SOURCE_DIR/Autorität" "$TARGET_DIR/authority-detailed.txt" "Autorität"

# 2. Die fünf Typen
merge_files "$SOURCE_DIR/Die fünf Typen" "$TARGET_DIR/types-detailed.txt" "Die fünf Typen"

# 3. Die Sechs Linien (Profil)
merge_files "$SOURCE_DIR/Die Sechs Linien (Profil)" "$TARGET_DIR/profiles-detailed.txt" "Die Sechs Linien (Profil)"

# 4. Kanäle (KRITISCH!)
merge_files "$SOURCE_DIR/Kanäle" "$TARGET_DIR/channels-complete.txt" "Kanäle (ALLE 36 Channels)"

# 5. Tore (KRITISCH!)
merge_files "$SOURCE_DIR/Tore" "$TARGET_DIR/gates-complete.txt" "Tore (ALLE 64 Gates)"

# 6. Zentren
merge_files "$SOURCE_DIR/Zentren" "$TARGET_DIR/centers-detailed.txt" "Zentren"

# 7. Praxisaufgaben Pfeile
merge_files "$SOURCE_DIR/Praxisaufgaben Pfeile" "$TARGET_DIR/arrows-detailed.txt" "Praxisaufgaben Pfeile"

# 8. Splits
merge_files "$SOURCE_DIR/Splits" "$TARGET_DIR/splits-detailed.txt" "Splits"

echo ""
echo "=========================================="
echo "✅ Import abgeschlossen!"
echo ""
echo "📋 Erstellte Knowledge-Dateien:"
ls -lh "$TARGET_DIR"/*.txt | grep -E "(authority|types|profiles|channels-complete|gates-complete|centers|arrows|splits)" | awk '{print "   - " $9 " (" $5 ")"}'
echo ""
echo "📋 Nächste Schritte:"
echo "1. Prüfen Sie die erstellten Knowledge-Dateien"
echo "2. Formatieren Sie sie bei Bedarf (Markdown)"
echo "3. Laden Sie Knowledge neu:"
echo "   curl -X POST http://localhost:4001/admin/reload-knowledge \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"secret\": \"IHR_AGENT_SECRET\"}'"
echo ""
echo "4. Prüfen Sie den Status:"
echo "   curl http://localhost:4001/health"

