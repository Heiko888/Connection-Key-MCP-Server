#!/bin/bash
# Script zum Analysieren der Knowledge-Ordner
# Zeigt Struktur, Dateiformate und Anzahl der Dateien

SOURCE_DIR="${1:-Heiko - Persönlich/Dateien TRS/Master of Manifestation}"

echo "📚 Analysiere Knowledge-Ordner: $SOURCE_DIR"
echo "=========================================="
echo ""

if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Ordner nicht gefunden: $SOURCE_DIR"
    echo ""
    echo "Verwendung:"
    echo "  ./analyze-knowledge-folders.sh [PFAD_ZU_MASTER_OF_MANIFESTATION]"
    exit 1
fi

# Liste aller Human Design Ordner
FOLDERS=(
    "Autorität"
    "Die fünf Typen"
    "Die Sechs Linien (Profil)"
    "Kanäle"
    "Tore"
    "Zentren"
    "Praxisaufgaben Pfeile"
    "Splits"
)

for folder in "${FOLDERS[@]}"; do
    folder_path="$SOURCE_DIR/$folder"
    
    if [ -d "$folder_path" ]; then
        echo "📁 $folder"
        echo "   Pfad: $folder_path"
        
        # Anzahl Dateien
        file_count=$(find "$folder_path" -type f | wc -l)
        echo "   Dateien: $file_count"
        
        # Dateiformate
        echo "   Formate:"
        find "$folder_path" -type f -exec basename {} \; | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -5 | while read count ext; do
            echo "     - .$ext: $count Dateien"
        done
        
        # Unterordner?
        subdir_count=$(find "$folder_path" -mindepth 1 -type d | wc -l)
        if [ "$subdir_count" -gt 0 ]; then
            echo "   Unterordner: $subdir_count"
        fi
        
        echo ""
    else
        echo "⚠️  $folder - Ordner nicht gefunden"
        echo ""
    fi
done

echo "=========================================="
echo "✅ Analyse abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Prüfen Sie die Dateiformate"
echo "2. Konvertieren Sie bei Bedarf (.docx/.pdf → .txt)"
echo "3. Verwenden Sie import-knowledge-folders.sh zum Import"

