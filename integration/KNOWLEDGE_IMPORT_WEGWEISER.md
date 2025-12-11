# 📚 Knowledge-Import - Wegweiser

## 📁 Korrekter Pfad zu "Master of Manifestation"

Basierend auf dem Datei-Explorer:

**Vollständiger Pfad:**
```
D:\videomateri\The Real Secret - Master of manifestation\Master of Manifestation
```

**Oder relativ:**
```
The Real Secret - Master of manifestation\Master of Manifestation
```

---

## 🔍 Pfad-Struktur

```
D:\videomateri\
└── The Real Secret - Master of manifestation\
    ├── Beginner of manifestation\
    ├── Expert of Manifestation\
    ├── Master of Manifestation\          ← HIER sind die Knowledge-Ordner!
    │   ├── Autorität\
    │   ├── Die fünf Typen\
    │   ├── Die Sechs Linien (Profil)\
    │   ├── Kanäle\
    │   ├── Tore\
    │   ├── Zentren\
    │   ├── Praxisaufgaben Pfeile\
    │   └── Splits\
    └── Professional of Manifestation\
```

---

## 🚀 Import-Optionen

### Option 1: Script mit korrektem Pfad

```bash
# Windows PowerShell
cd C:\AppProgrammierung\Projekte\MCP_Connection_Key

# Pfad anpassen (Windows)
$sourcePath = "D:\videomateri\The Real Secret - Master of manifestation\Master of Manifestation"

# Script ausführen (muss für Windows angepasst werden)
```

**⚠️ Hinweis:** Die Scripts sind für Linux/Bash geschrieben. Für Windows benötigen wir PowerShell-Versionen.

---

### Option 2: Manueller Import (Empfohlen für Windows)

1. **Öffnen Sie den Ordner:**
   ```
   D:\videomateri\The Real Secret - Master of manifestation\Master of Manifestation
   ```

2. **Für jeden Ordner:**
   - Öffnen Sie den Ordner (z.B. `Kanäle`)
   - Kopieren Sie alle Dateien-Inhalte
   - Erstellen Sie eine neue Datei in `production\knowledge\`
   - Beispiel: `production\knowledge\channels-complete.txt`
   - Fügen Sie den Inhalt ein
   - Speichern Sie als `.txt`

---

### Option 3: PowerShell-Script (Windows)

```powershell
# PowerShell-Script für Windows
$sourcePath = "D:\videomateri\The Real Secret - Master of manifestation\Master of Manifestation"
$targetPath = "C:\AppProgrammierung\Projekte\MCP_Connection_Key\production\knowledge"

# Funktion zum Zusammenführen
function Merge-FolderToKnowledge {
    param(
        [string]$SourceFolder,
        [string]$TargetFile,
        [string]$Description
    )
    
    if (-not (Test-Path $SourceFolder)) {
        Write-Host "⚠️  $Description - Ordner nicht gefunden: $SourceFolder" -ForegroundColor Yellow
        return
    }
    
    Write-Host "📁 Importiere: $Description" -ForegroundColor Cyan
    
    $content = "# $Description`n`n"
    $content += "Diese Datei wurde automatisch importiert.`n`n---`n`n"
    
    $files = Get-ChildItem -Path $SourceFolder -File | Where-Object { 
        $_.Extension -in @('.txt', '.md') 
    }
    
    if ($files.Count -eq 0) {
        Write-Host "   ⚠️  Keine Text-Dateien gefunden" -ForegroundColor Yellow
        return
    }
    
    foreach ($file in $files) {
        $content += "`n## $($file.Name)`n`n"
        $content += Get-Content -Path $file.FullName -Raw
        $content += "`n`n---`n"
    }
    
    $content | Out-File -FilePath $TargetFile -Encoding UTF8
    Write-Host "   ✅ $TargetFile erstellt ($($files.Count) Dateien)" -ForegroundColor Green
}

# Import durchführen
Merge-FolderToKnowledge "$sourcePath\Autorität" "$targetPath\authority-detailed.txt" "Autorität"
Merge-FolderToKnowledge "$sourcePath\Die fünf Typen" "$targetPath\types-detailed.txt" "Die fünf Typen"
Merge-FolderToKnowledge "$sourcePath\Die Sechs Linien (Profil)" "$targetPath\profiles-detailed.txt" "Die Sechs Linien (Profil)"
Merge-FolderToKnowledge "$sourcePath\Kanäle" "$targetPath\channels-complete.txt" "Kanäle (ALLE 36 Channels)"
Merge-FolderToKnowledge "$sourcePath\Tore" "$targetPath\gates-complete.txt" "Tore (ALLE 64 Gates)"
Merge-FolderToKnowledge "$sourcePath\Zentren" "$targetPath\centers-detailed.txt" "Zentren"
Merge-FolderToKnowledge "$sourcePath\Praxisaufgaben Pfeile" "$targetPath\arrows-detailed.txt" "Praxisaufgaben Pfeile"
Merge-FolderToKnowledge "$sourcePath\Splits" "$targetPath\splits-detailed.txt" "Splits"

Write-Host "`n✅ Import abgeschlossen!" -ForegroundColor Green
```

---

## 📋 Schritt-für-Schritt (Manuell)

### 1. Ordner öffnen

```
D:\videomateri\The Real Secret - Master of manifestation\Master of Manifestation
```

### 2. Für jeden Ordner:

#### Beispiel: `Kanäle` → `channels-complete.txt`

1. Öffnen Sie `Kanäle`
2. Öffnen Sie alle Dateien im Ordner
3. Kopieren Sie den Inhalt
4. Erstellen Sie: `production\knowledge\channels-complete.txt`
5. Fügen Sie den Inhalt ein
6. Formatieren Sie bei Bedarf (Markdown)
7. Speichern Sie

#### Wiederholen Sie für:

- `Autorität` → `authority-detailed.txt`
- `Die fünf Typen` → `types-detailed.txt`
- `Die Sechs Linien (Profil)` → `profiles-detailed.txt`
- `Kanäle` → `channels-complete.txt` ⭐ **KRITISCH!**
- `Tore` → `gates-complete.txt` ⭐ **KRITISCH!**
- `Zentren` → `centers-detailed.txt`
- `Praxisaufgaben Pfeile` → `arrows-detailed.txt`
- `Splits` → `splits-detailed.txt`

---

## ✅ Nach dem Import

### 1. Prüfen Sie die Dateien

```powershell
# Windows PowerShell
cd C:\AppProgrammierung\Projekte\MCP_Connection_Key\production\knowledge
Get-ChildItem | Select-Object Name, Length, LastWriteTime
```

**Erwartet:** 13 Knowledge-Dateien (5 alte + 8 neue)

---

### 2. Knowledge neu laden (auf Server)

```bash
# Auf Hetzner Server (SSH)
curl -X POST http://localhost:4001/admin/reload-knowledge \
  -H "Content-Type: application/json" \
  -d '{"secret": "IHR_AGENT_SECRET"}'
```

**Oder:** Agent neu starten
```bash
pm2 restart reading-agent
```

---

### 3. Health Check

```bash
curl http://localhost:4001/health
```

**Erwartet:**
```json
{
  "status": "ok",
  "knowledge": 13,  // 5 alte + 8 neue
  "templates": 11,
  ...
}
```

---

## 🎯 Prioritäten

### ⭐ Priorität 1 (KRITISCH!)

- `Kanäle` → `channels-complete.txt` (ALLE 36 Channels!)
- `Tore` → `gates-complete.txt` (ALLE 64 Gates!)

**Warum:** Aktuell nur 4/36 Channels und 4/64 Gates vorhanden!

---

### Priorität 2

- `Zentren` → `centers-detailed.txt`
- `Die Sechs Linien (Profil)` → `profiles-detailed.txt`

---

### Priorität 3

- `Die fünf Typen` → `types-detailed.txt`
- `Autorität` → `authority-detailed.txt`

---

### Priorität 4

- `Praxisaufgaben Pfeile` → `arrows-detailed.txt`
- `Splits` → `splits-detailed.txt`

---

## 📝 Zusammenfassung

**Korrekter Pfad:**
```
D:\videomateri\The Real Secret - Master of manifestation\Master of Manifestation
```

**8 Knowledge-Ordner zu importieren:**
1. Autorität
2. Die fünf Typen
3. Die Sechs Linien (Profil)
4. Kanäle ⭐
5. Tore ⭐
6. Zentren
7. Praxisaufgaben Pfeile
8. Splits

**Ziel-Verzeichnis:**
```
C:\AppProgrammierung\Projekte\MCP_Connection_Key\production\knowledge\
```

**Nächste Schritte:**
1. Ordner öffnen
2. Inhalte kopieren
3. Knowledge-Dateien erstellen
4. Auf Server kopieren (oder Git commit)
5. Knowledge neu laden

