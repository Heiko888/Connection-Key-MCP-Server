# 📚 Reading Agent - Knowledge Base erweitern (100 Dateien)

## 📋 Übersicht

Der Reading Agent lädt Knowledge-Dateien aus dem `knowledge/` Verzeichnis. Sie können bis zu 100+ Dateien hinzufügen.

**Aktueller Pfad:**
- **Lokal:** `production/knowledge/`
- **Server:** `/opt/mcp-connection-key/production/knowledge/`

---

## 1. 📁 Knowledge-Dateien Struktur

### Aktuelle Knowledge-Dateien

```
production/knowledge/
├── human-design-basics.txt
├── reading-types.txt
├── channels-gates.txt
├── strategy-authority.txt
└── incarnation-cross.txt
```

### Neue Knowledge-Dateien hinzufügen

Sie können beliebig viele `.txt` Dateien hinzufügen:

```
production/knowledge/
├── human-design-basics.txt
├── reading-types.txt
├── channels-gates.txt
├── strategy-authority.txt
├── incarnation-cross.txt
├── type-generator.txt
├── type-manifestor.txt
├── type-projector.txt
├── type-reflector.txt
├── centers-detailed.txt
├── gates-detailed.txt
├── channels-detailed.txt
├── profiles-detailed.txt
├── authority-detailed.txt
├── penta-formation.txt
├── connection-key.txt
├── ... (bis zu 100+ Dateien)
```

---

## 2. 🔧 Knowledge-Dateien hinzufügen

### Methode 1: Manuell (Einzelne Dateien)

```bash
# Auf Hetzner Server
cd /opt/mcp-connection-key/production/knowledge

# Erstelle neue Knowledge-Datei
cat > type-generator.txt << 'EOF'
# Generator Typ - Detaillierte Informationen

## Überblick
Generatoren sind die häufigste Human Design Typ (ca. 70% der Bevölkerung).

## Strategie
Warten auf die Antwort (Sacral Response)

## Autorität
Meistens Sacral Authority

## Energie
Konstante, nachhaltige Energie

## Herausforderungen
- Nicht initiieren
- Warten auf die richtige Gelegenheit
- Frustration vermeiden
EOF

# Knowledge neu laden (ohne Agent-Neustart)
curl -X POST http://localhost:4001/admin/reload-knowledge \
  -H "Content-Type: application/json" \
  -d '{"secret": "YOUR_AGENT_SECRET"}'
```

### Methode 2: Bulk-Upload (Viele Dateien)

**Script für Bulk-Upload:**

```bash
#!/bin/bash
# upload-knowledge.sh - Lädt viele Knowledge-Dateien hoch

KNOWLEDGE_DIR="/opt/mcp-connection-key/production/knowledge"
SOURCE_DIR="/path/to/your/knowledge/files"

echo "📚 Lade Knowledge-Dateien hoch..."
echo "================================"
echo ""

# Kopiere alle .txt Dateien
cp "$SOURCE_DIR"/*.txt "$KNOWLEDGE_DIR/"

# Zeige Anzahl
COUNT=$(ls -1 "$KNOWLEDGE_DIR"/*.txt | wc -l)
echo "✅ $COUNT Knowledge-Dateien geladen"
echo ""

# Liste alle Dateien
echo "📄 Geladene Dateien:"
ls -1 "$KNOWLEDGE_DIR"/*.txt
echo ""

# Knowledge neu laden
echo "🔄 Lade Knowledge neu..."
curl -X POST http://localhost:4001/admin/reload-knowledge \
  -H "Content-Type: application/json" \
  -d '{"secret": "YOUR_AGENT_SECRET"}'

echo ""
echo "✅ Knowledge erfolgreich erweitert!"
```

### Methode 3: Automatisch aus Verzeichnis

**Script für automatisches Laden:**

```bash
#!/bin/bash
# auto-load-knowledge.sh - Lädt alle .txt Dateien aus einem Verzeichnis

KNOWLEDGE_DIR="/opt/mcp-connection-key/production/knowledge"
SOURCE_DIR="/path/to/your/knowledge/files"

echo "📚 Automatisches Laden von Knowledge-Dateien"
echo "============================================="
echo ""

# Prüfe ob Source-Verzeichnis existiert
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Source-Verzeichnis nicht gefunden: $SOURCE_DIR"
    exit 1
fi

# Kopiere alle .txt Dateien
echo "📋 Kopiere Knowledge-Dateien..."
find "$SOURCE_DIR" -name "*.txt" -type f | while read file; do
    filename=$(basename "$file")
    cp "$file" "$KNOWLEDGE_DIR/$filename"
    echo "   ✅ $filename"
done

# Zeige Anzahl
COUNT=$(ls -1 "$KNOWLEDGE_DIR"/*.txt 2>/dev/null | wc -l)
echo ""
echo "✅ $COUNT Knowledge-Dateien geladen"
echo ""

# Knowledge neu laden
echo "🔄 Lade Knowledge neu..."
AGENT_SECRET=$(grep AGENT_SECRET /opt/mcp-connection-key/production/.env | cut -d= -f2)
curl -X POST http://localhost:4001/admin/reload-knowledge \
  -H "Content-Type: application/json" \
  -d "{\"secret\": \"$AGENT_SECRET\"}"

echo ""
echo "✅ Knowledge erfolgreich erweitert!"
```

---

## 3. 📝 Knowledge-Dateien Format

### Empfohlenes Format

```txt
# Titel der Knowledge-Datei

## Abschnitt 1
Detaillierte Informationen...

## Abschnitt 2
Weitere Informationen...

### Unterabschnitt
Spezifische Details...

## Beispiele
- Beispiel 1
- Beispiel 2
- Beispiel 3
```

### Beispiel: type-generator.txt

```txt
# Generator Typ - Human Design

## Überblick
Generatoren sind die häufigste Human Design Typ (ca. 70% der Bevölkerung).
Sie haben konstante, nachhaltige Energie und sind die "Arbeiter" des Systems.

## Strategie
Warten auf die Antwort (Sacral Response)
- Nicht initiieren
- Warten auf die richtige Gelegenheit
- Auf die innere Antwort hören

## Autorität
Meistens Sacral Authority
- Bauchgefühl als Entscheidungsgrundlage
- "Hmm-hmm" (Ja) oder "Uh-uh" (Nein)
- Körperliche Reaktionen beachten

## Energie
- Konstante, nachhaltige Energie
- Können lange arbeiten
- Brauchen Pausen zur Regeneration

## Herausforderungen
- Frustration wenn nicht auf Antwort gewartet wird
- Nicht initiieren (führt zu Frustration)
- Falsche Entscheidungen durch zu schnelles Handeln

## Beispiele
- Generator im Beruf: Warten auf das richtige Projekt
- Generator in Beziehungen: Auf die innere Antwort hören
- Generator bei Entscheidungen: Bauchgefühl nutzen
```

---

## 4. 🚀 Bulk-Upload Script (100 Dateien)

**Vollständiges Script für 100+ Dateien:**

```bash
#!/bin/bash
# bulk-upload-knowledge.sh - Lädt 100+ Knowledge-Dateien hoch

set -e

KNOWLEDGE_DIR="/opt/mcp-connection-key/production/knowledge"
SOURCE_DIR="${1:-/path/to/your/knowledge/files}"

echo "📚 Bulk-Upload von Knowledge-Dateien"
echo "====================================="
echo ""

# Prüfe ob Source-Verzeichnis existiert
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Source-Verzeichnis nicht gefunden: $SOURCE_DIR"
    echo "📋 Usage: $0 /path/to/knowledge/files"
    exit 1
fi

# Erstelle Knowledge-Verzeichnis falls nicht vorhanden
mkdir -p "$KNOWLEDGE_DIR"

# Kopiere alle .txt Dateien
echo "📋 Kopiere Knowledge-Dateien..."
COUNT=0
find "$SOURCE_DIR" -name "*.txt" -type f | while read file; do
    filename=$(basename "$file")
    cp "$file" "$KNOWLEDGE_DIR/$filename"
    COUNT=$((COUNT + 1))
    echo "   ✅ [$COUNT] $filename"
done

# Zeige Gesamtanzahl
TOTAL=$(ls -1 "$KNOWLEDGE_DIR"/*.txt 2>/dev/null | wc -l)
echo ""
echo "✅ $TOTAL Knowledge-Dateien geladen"
echo ""

# Liste alle Dateien (erste 10)
echo "📄 Erste 10 Dateien:"
ls -1 "$KNOWLEDGE_DIR"/*.txt | head -10
if [ "$TOTAL" -gt 10 ]; then
    echo "   ... und $((TOTAL - 10)) weitere"
fi
echo ""

# Knowledge neu laden
echo "🔄 Lade Knowledge neu..."
AGENT_SECRET=$(grep "^AGENT_SECRET=" /opt/mcp-connection-key/production/.env 2>/dev/null | cut -d= -f2)

if [ -z "$AGENT_SECRET" ]; then
    echo "⚠️  AGENT_SECRET nicht gefunden in .env"
    echo "📋 Bitte manuell neu laden:"
    echo "   curl -X POST http://localhost:4001/admin/reload-knowledge \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"secret\": \"YOUR_SECRET\"}'"
else
    RESPONSE=$(curl -s -X POST http://localhost:4001/admin/reload-knowledge \
      -H "Content-Type: application/json" \
      -d "{\"secret\": \"$AGENT_SECRET\"}")
    
    if echo "$RESPONSE" | grep -q "success"; then
        echo "   ✅ Knowledge erfolgreich neu geladen"
    else
        echo "   ⚠️  Fehler beim Neuladen: $RESPONSE"
    fi
fi

echo ""
echo "✅ Bulk-Upload abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Prüfe Health-Endpoint: curl http://localhost:4001/health"
echo "2. Teste Reading: curl -X POST http://localhost:4001/reading/generate ..."
echo ""
```

---

## 5. 🔄 Knowledge automatisch neu laden

### Option 1: Admin-Endpoint (ohne Neustart)

```bash
# Knowledge neu laden
curl -X POST http://localhost:4001/admin/reload-knowledge \
  -H "Content-Type: application/json" \
  -d '{"secret": "YOUR_AGENT_SECRET"}'
```

### Option 2: PM2 Neustart (vollständiger Neustart)

```bash
# Reading Agent neu starten
pm2 restart reading-agent
```

### Option 3: Automatisch nach Upload

**Script mit automatischem Neuladen:**

```bash
#!/bin/bash
# upload-and-reload.sh

# 1. Dateien hochladen
./bulk-upload-knowledge.sh /path/to/files

# 2. Knowledge neu laden
AGENT_SECRET=$(grep "^AGENT_SECRET=" production/.env | cut -d= -f2)
curl -X POST http://localhost:4001/admin/reload-knowledge \
  -H "Content-Type: application/json" \
  -d "{\"secret\": \"$AGENT_SECRET\"}"
```

---

## 6. 📊 Knowledge-Dateien organisieren

### Empfohlene Struktur (100 Dateien)

```
production/knowledge/
├── basics/
│   ├── human-design-basics.txt
│   ├── reading-types.txt
│   └── overview.txt
├── types/
│   ├── type-generator.txt
│   ├── type-manifestor.txt
│   ├── type-projector.txt
│   └── type-reflector.txt
├── centers/
│   ├── centers-detailed.txt
│   ├── head-center.txt
│   ├── ajna-center.txt
│   └── ... (9 Zentren)
├── gates/
│   ├── gates-detailed.txt
│   ├── gate-1.txt
│   ├── gate-2.txt
│   └── ... (64 Gates)
├── channels/
│   ├── channels-detailed.txt
│   ├── channel-1-8.txt
│   └── ... (36 Channels)
├── profiles/
│   ├── profiles-detailed.txt
│   ├── profile-1-3.txt
│   └── ... (12 Profile)
├── authority/
│   ├── authority-detailed.txt
│   ├── sacral-authority.txt
│   └── ... (7 Authority-Typen)
├── penta/
│   ├── penta-formation.txt
│   ├── penta-types.txt
│   └── penta-dynamics.txt
└── connection-key/
    ├── connection-key.txt
    ├── compatibility.txt
    └── synastry.txt
```

**Hinweis:** Der Reading Agent lädt alle `.txt` Dateien aus dem `knowledge/` Verzeichnis, auch aus Unterverzeichnissen (wenn rekursiv implementiert).

---

## 7. ✅ Prüfen ob Knowledge geladen wurde

### Health-Check

```bash
# Prüfe geladene Knowledge-Dateien
curl http://localhost:4001/health | jq '.knowledge'
```

**Erwartete Antwort:**
```json
{
  "status": "ok",
  "knowledge": 100,
  "templates": 10
}
```

### Test-Reading

```bash
# Teste Reading mit erweitertem Knowledge
curl -X POST http://localhost:4001/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany",
    "readingType": "detailed"
  }'
```

---

## 📋 Zusammenfassung

**Knowledge-Dateien hinzufügen:**
1. ✅ Erstellen Sie `.txt` Dateien im `knowledge/` Verzeichnis
2. ✅ Nutzen Sie das Bulk-Upload-Script für viele Dateien
3. ✅ Laden Sie Knowledge neu (Admin-Endpoint oder PM2 Neustart)
4. ✅ Prüfen Sie Health-Check für Anzahl geladener Dateien

**Empfohlene Vorgehensweise:**
1. Erstellen Sie Knowledge-Dateien lokal
2. Nutzen Sie `bulk-upload-knowledge.sh` für Upload
3. Knowledge automatisch neu laden
4. Testen Sie mit Health-Check und Test-Reading

