# 📚 Knowledge-Import Plan - Master of Manifestation Ordner

## 📁 Verfügbare Ordner (aus "Master of Manifestation")

### ✅ Human Design Wissen-Ordner

1. **`Autorität`** (Authority)
   - → `production/knowledge/authority-detailed.txt`

2. **`Die fünf Typen`** (The Five Types)
   - → `production/knowledge/types-detailed.txt`
   - Oder aufgeteilt:
     - `type-generator.txt`
     - `type-manifestor.txt`
     - `type-projector.txt`
     - `type-reflector.txt`
     - `type-manifesting-generator.txt`

3. **`Die Sechs Linien (Profil)`** (The Six Lines (Profile))
   - → `production/knowledge/profiles-detailed.txt`
   - Oder: `lines-detailed.txt` + `profiles-detailed.txt`

4. **`Kanäle`** (Channels)
   - → `production/knowledge/channels-complete.txt`
   - **KRITISCH:** Alle 36 Channels!

5. **`Tore`** (Gates)
   - → `production/knowledge/gates-complete.txt`
   - **KRITISCH:** Alle 64 Gates!

6. **`Zentren`** (Centers)
   - → `production/knowledge/centers-detailed.txt`
   - Alle 9 Zentren detailliert

7. **`Praxisaufgaben Pfeile`** (Practical Tasks Arrows)
   - → `production/knowledge/arrows-detailed.txt`
   - Oder: `variables-detailed.txt`

8. **`Splits`**
   - → `production/knowledge/splits-detailed.txt`

---

## 🎯 Import-Strategie

### Option 1: Einzelne Knowledge-Dateien (Empfohlen)

**Vorteile:**
- Klare Struktur
- Einfaches Neuladen einzelner Bereiche
- Bessere Organisation

**Struktur:**
```
production/knowledge/
├── human-design-basics.txt          # (bereits vorhanden)
├── reading-types.txt                # (bereits vorhanden)
├── channels-gates.txt                # (bereits vorhanden, aber unvollständig)
├── strategy-authority.txt            # (bereits vorhanden)
├── incarnation-cross.txt             # (bereits vorhanden)
│
├── authority-detailed.txt            # ← NEU: Aus "Autorität" Ordner
├── types-detailed.txt                 # ← NEU: Aus "Die fünf Typen" Ordner
├── profiles-detailed.txt              # ← NEU: Aus "Die Sechs Linien" Ordner
├── channels-complete.txt              # ← NEU: Aus "Kanäle" Ordner (ALLE 36!)
├── gates-complete.txt                 # ← NEU: Aus "Tore" Ordner (ALLE 64!)
├── centers-detailed.txt               # ← NEU: Aus "Zentren" Ordner
├── arrows-detailed.txt                # ← NEU: Aus "Praxisaufgaben Pfeile" Ordner
└── splits-detailed.txt               # ← NEU: Aus "Splits" Ordner
```

---

### Option 2: Erweitern bestehender Dateien

**Vorteile:**
- Weniger Dateien
- Alles an einem Ort

**Nachteile:**
- Sehr große Dateien
- Schwerer zu warten

**Nicht empfohlen** für Channels & Gates (zu groß!)

---

## 📋 Import-Schritte

### Schritt 1: Ordner-Inhalte analysieren

```bash
# Prüfen Sie die Struktur jedes Ordners
# Wie viele Dateien? Welche Formate? (.txt, .docx, .pdf?)
```

**Wichtig:**
- Welche Dateiformate sind in den Ordnern? (.txt, .docx, .pdf, .md?)
- Wie sind die Dateien strukturiert?
- Gibt es Unterordner?

---

### Schritt 2: Dateien konvertieren (falls nötig)

**Wenn .docx oder .pdf:**
- Konvertieren zu `.txt` oder `.md`
- Struktur beibehalten

**Wenn bereits .txt:**
- Direkt verwendbar!

---

### Schritt 3: Knowledge-Dateien erstellen

**Für jeden Ordner:**

1. **Alle Dateien aus dem Ordner zusammenführen**
2. **In eine Knowledge-Datei konvertieren**
3. **Struktur beibehalten** (Markdown-Format empfohlen)
4. **In `production/knowledge/` speichern**

---

### Schritt 4: Agent neu starten oder Knowledge neu laden

```bash
# Option A: Knowledge neu laden (ohne Neustart)
curl -X POST http://localhost:4001/admin/reload-knowledge \
  -H "Content-Type: application/json" \
  -d '{"secret": "IHR_AGENT_SECRET"}'

# Option B: Agent neu starten
pm2 restart reading-agent
```

---

## 🔧 Import-Script (Beispiel)

### Script: `import-knowledge-folders.sh`

```bash
#!/bin/bash
# Import-Script für Knowledge-Ordner

SOURCE_DIR="Heiko - Persönlich/Dateien TRS/Master of Manifestation"
TARGET_DIR="production/knowledge"

echo "📚 Importiere Knowledge-Ordner..."
echo ""

# 1. Autorität
if [ -d "$SOURCE_DIR/Autorität" ]; then
    echo "📁 Importiere: Autorität"
    # Zusammenführen aller Dateien aus "Autorität" Ordner
    cat "$SOURCE_DIR/Autorität"/*.txt > "$TARGET_DIR/authority-detailed.txt" 2>/dev/null || true
    echo "   ✅ authority-detailed.txt erstellt"
fi

# 2. Die fünf Typen
if [ -d "$SOURCE_DIR/Die fünf Typen" ]; then
    echo "📁 Importiere: Die fünf Typen"
    cat "$SOURCE_DIR/Die fünf Typen"/*.txt > "$TARGET_DIR/types-detailed.txt" 2>/dev/null || true
    echo "   ✅ types-detailed.txt erstellt"
fi

# 3. Die Sechs Linien (Profil)
if [ -d "$SOURCE_DIR/Die Sechs Linien (Profil)" ]; then
    echo "📁 Importiere: Die Sechs Linien (Profil)"
    cat "$SOURCE_DIR/Die Sechs Linien (Profil)"/*.txt > "$TARGET_DIR/profiles-detailed.txt" 2>/dev/null || true
    echo "   ✅ profiles-detailed.txt erstellt"
fi

# 4. Kanäle (KRITISCH!)
if [ -d "$SOURCE_DIR/Kanäle" ]; then
    echo "📁 Importiere: Kanäle (ALLE 36 Channels)"
    cat "$SOURCE_DIR/Kanäle"/*.txt > "$TARGET_DIR/channels-complete.txt" 2>/dev/null || true
    echo "   ✅ channels-complete.txt erstellt"
fi

# 5. Tore (KRITISCH!)
if [ -d "$SOURCE_DIR/Tore" ]; then
    echo "📁 Importiere: Tore (ALLE 64 Gates)"
    cat "$SOURCE_DIR/Tore"/*.txt > "$TARGET_DIR/gates-complete.txt" 2>/dev/null || true
    echo "   ✅ gates-complete.txt erstellt"
fi

# 6. Zentren
if [ -d "$SOURCE_DIR/Zentren" ]; then
    echo "📁 Importiere: Zentren"
    cat "$SOURCE_DIR/Zentren"/*.txt > "$TARGET_DIR/centers-detailed.txt" 2>/dev/null || true
    echo "   ✅ centers-detailed.txt erstellt"
fi

# 7. Praxisaufgaben Pfeile
if [ -d "$SOURCE_DIR/Praxisaufgaben Pfeile" ]; then
    echo "📁 Importiere: Praxisaufgaben Pfeile"
    cat "$SOURCE_DIR/Praxisaufgaben Pfeile"/*.txt > "$TARGET_DIR/arrows-detailed.txt" 2>/dev/null || true
    echo "   ✅ arrows-detailed.txt erstellt"
fi

# 8. Splits
if [ -d "$SOURCE_DIR/Splits" ]; then
    echo "📁 Importiere: Splits"
    cat "$SOURCE_DIR/Splits"/*.txt > "$TARGET_DIR/splits-detailed.txt" 2>/dev/null || true
    echo "   ✅ splits-detailed.txt erstellt"
fi

echo ""
echo "✅ Import abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Prüfen Sie die erstellten Knowledge-Dateien"
echo "2. Formatieren Sie sie bei Bedarf (Markdown)"
echo "3. Laden Sie Knowledge neu: curl -X POST http://localhost:4001/admin/reload-knowledge"
```

---

## 📝 Manueller Import (Empfohlen)

### Schritt-für-Schritt

1. **Öffnen Sie jeden Ordner**
2. **Kopieren Sie den Inhalt aller Dateien**
3. **Erstellen Sie eine neue Knowledge-Datei** in `production/knowledge/`
4. **Fügen Sie den Inhalt ein**
5. **Formatieren Sie bei Bedarf** (Markdown-Format)
6. **Speichern Sie als `.txt` oder `.md`**

---

## 🎯 Prioritäten

### Priorität 1: Channels & Gates (KRITISCH!)

**Ordner:**
- `Kanäle` → `channels-complete.txt` (ALLE 36 Channels!)
- `Tore` → `gates-complete.txt` (ALLE 64 Gates!)

**Warum:** Aktuell nur 4/36 Channels und 4/64 Gates vorhanden!

---

### Priorität 2: Zentren & Profile

**Ordner:**
- `Zentren` → `centers-detailed.txt`
- `Die Sechs Linien (Profil)` → `profiles-detailed.txt`

---

### Priorität 3: Typen & Autorität

**Ordner:**
- `Die fünf Typen` → `types-detailed.txt`
- `Autorität` → `authority-detailed.txt`

---

### Priorität 4: Erweiterte Themen

**Ordner:**
- `Praxisaufgaben Pfeile` → `arrows-detailed.txt`
- `Splits` → `splits-detailed.txt`

---

## ✅ Nach dem Import

### 1. Health Check

```bash
curl http://localhost:4001/health
```

**Erwartet:**
```json
{
  "status": "ok",
  "knowledge": 13,  // 5 alte + 8 neue = 13 Dateien
  "templates": 11,
  ...
}
```

---

### 2. Test-Reading generieren

```bash
curl -X POST http://localhost:4001/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-01-01",
    "birthTime": "12:00",
    "birthPlace": "Berlin, Germany",
    "readingType": "detailed"
  }'
```

**Prüfen Sie:**
- Werden alle 64 Gates erwähnt?
- Werden alle 36 Channels erwähnt?
- Sind die Zentren detailliert beschrieben?

---

## 📋 Zusammenfassung

**Verfügbare Ordner:**
- ✅ `Autorität` → `authority-detailed.txt`
- ✅ `Die fünf Typen` → `types-detailed.txt`
- ✅ `Die Sechs Linien (Profil)` → `profiles-detailed.txt`
- ✅ `Kanäle` → `channels-complete.txt` (KRITISCH!)
- ✅ `Tore` → `gates-complete.txt` (KRITISCH!)
- ✅ `Zentren` → `centers-detailed.txt`
- ✅ `Praxisaufgaben Pfeile` → `arrows-detailed.txt`
- ✅ `Splits` → `splits-detailed.txt`

**Nächste Schritte:**
1. Ordner-Inhalte analysieren (Dateiformate, Struktur)
2. Knowledge-Dateien erstellen (manuell oder per Script)
3. In `production/knowledge/` speichern
4. Knowledge neu laden
5. Test-Reading generieren

---

## 🚀 Quick Start

**Wenn alle Dateien bereits .txt sind:**

```bash
# Kopieren Sie die Dateien manuell oder verwenden Sie das Import-Script
# Dann:
cd production/knowledge
ls -la  # Prüfen Sie die neuen Dateien

# Knowledge neu laden
curl -X POST http://localhost:4001/admin/reload-knowledge \
  -H "Content-Type: application/json" \
  -d '{"secret": "IHR_AGENT_SECRET"}'
```

