# 🚀 Quick Import - Knowledge-Ordner

## 📁 Pfad finden

**Öffnen Sie den Datei-Explorer und navigieren Sie zu:**
```
Master of Manifestation
```

**Kopieren Sie den vollständigen Pfad** (Rechtsklick auf Ordner → Eigenschaften → Pfad kopieren)

---

## 🔧 Script ausführen

### Option 1: Mit korrektem Pfad

```powershell
# Im Projekt-Verzeichnis
cd C:\AppProgrammierung\Projekte\MCP_Connection_Key

# Script mit Ihrem Pfad ausführen
.\integration\scripts\import-knowledge-folders.ps1 -SourcePath "IHR_PFAD_HIER"
```

**Beispiel:**
```powershell
.\integration\scripts\import-knowledge-folders.ps1 -SourcePath "D:\videomateri\The Real Secret - Master of manifestation\Master of Manifestation"
```

---

### Option 2: Pfad im Script ändern

**Öffnen Sie:** `integration\scripts\import-knowledge-folders.ps1`

**Ändern Sie Zeile 5:**
```powershell
[string]$SourcePath = "IHR_PFAD_HIER",
```

**Dann ausführen:**
```powershell
.\integration\scripts\import-knowledge-folders.ps1
```

---

## ✅ Nach dem Import

1. **Prüfen Sie die Dateien:**
   ```powershell
   dir production\knowledge\*.txt
   ```

2. **Erwartete Dateien:**
   - `authority-detailed.txt`
   - `types-detailed.txt`
   - `profiles-detailed.txt`
   - `channels-complete.txt` ⭐
   - `gates-complete.txt` ⭐
   - `centers-detailed.txt`
   - `arrows-detailed.txt`
   - `splits-detailed.txt`

3. **Git Commit:**
   ```powershell
   git add production/knowledge/
   git commit -m "Add knowledge files from Master of Manifestation"
   git push
   ```

---

## 🔍 Pfad finden (Windows)

1. **Datei-Explorer öffnen**
2. **Navigieren Sie zu:** `Master of Manifestation`
3. **Klicken Sie in die Adressleiste** (oben)
4. **Kopieren Sie den Pfad** (Strg+C)
5. **Verwenden Sie diesen Pfad** im Script

**Oder:**
- Rechtsklick auf `Master of Manifestation` → Eigenschaften
- Kopieren Sie den "Pfad"

