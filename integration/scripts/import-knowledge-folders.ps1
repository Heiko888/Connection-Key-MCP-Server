# PowerShell-Script zum Importieren der Knowledge-Ordner
# Verwendung: .\import-knowledge-folders.ps1

param(
    [string]$SourcePath = "D:\videomateri\The Real Secret - Master of manifestation\Master of Manifestation",
    [string]$TargetPath = "C:\AppProgrammierung\Projekte\MCP_Connection_Key\production\knowledge"
)

Write-Host "Importiere Knowledge-Ordner..." -ForegroundColor Cyan
Write-Host "Quelle: $SourcePath" -ForegroundColor Gray
Write-Host "Ziel: $TargetPath" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Prüfe Quell-Pfad
if (-not (Test-Path $SourcePath)) {
    Write-Host "FEHLER: Quell-Ordner nicht gefunden: $SourcePath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Bitte passen Sie den Pfad an:" -ForegroundColor Yellow
    Write-Host "  .\import-knowledge-folders.ps1 -SourcePath 'IHR_PFAD'" -ForegroundColor Yellow
    exit 1
}

# Erstelle Ziel-Verzeichnis falls nicht vorhanden
if (-not (Test-Path $TargetPath)) {
    New-Item -ItemType Directory -Path $TargetPath -Force | Out-Null
    Write-Host "Ziel-Verzeichnis erstellt: $TargetPath" -ForegroundColor Green
}

# Funktion zum Zusammenführen von Dateien
function Merge-FolderToKnowledge {
    param(
        [string]$SourceFolder,
        [string]$TargetFile,
        [string]$Description
    )
    
    if (-not (Test-Path $SourceFolder)) {
        Write-Host "WARNUNG: $Description - Ordner nicht gefunden: $SourceFolder" -ForegroundColor Yellow
        return $false
    }
    
    Write-Host "Importiere: $Description" -ForegroundColor Cyan
    
    $content = "# $Description`n`n"
    $content += "Diese Datei wurde automatisch aus dem Ordner `"$Description`" importiert.`n`n"
    $content += "---`n`n"
    
    # Finde alle Dateien (TXT, MD, PDF)
    $files = Get-ChildItem -Path $SourceFolder -File -Recurse | Where-Object { 
        $_.Extension -in @('.txt', '.md', '.pdf') -or 
        ($_.Extension -eq '' -and (Get-Content $_.FullName -TotalCount 1 -ErrorAction SilentlyContinue))
    }
    
    if ($files.Count -eq 0) {
        Write-Host "   WARNUNG: Keine Dateien gefunden" -ForegroundColor Yellow
        return $false
    }
    
    $fileCount = 0
    $scriptDir = Split-Path -Parent $MyInvocation.PSCommandPath
    $pdfScript = Join-Path $scriptDir "pdf-to-text.py"
    
    foreach ($file in $files | Sort-Object Name) {
        try {
            $fileContent = ""
            
            if ($file.Extension -eq '.pdf') {
                # Extrahiere Text aus PDF mit Python
                if (Test-Path $pdfScript) {
                    $tempOutput = [System.IO.Path]::GetTempFileName()
                    $pythonResult = python $pdfScript $file.FullName $tempOutput 2>&1
                    if (Test-Path $tempOutput) {
                        $fileContent = Get-Content -Path $tempOutput -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
                        Remove-Item $tempOutput -ErrorAction SilentlyContinue
                        if ([string]::IsNullOrWhiteSpace($fileContent)) {
                            Write-Host "   WARNUNG: PDF konnte nicht extrahiert werden: $($file.Name)" -ForegroundColor Yellow
                            continue
                        }
                    } else {
                        Write-Host "   WARNUNG: PDF-Extraktion fehlgeschlagen: $($file.Name)" -ForegroundColor Yellow
                        Write-Host "   Tipp: Installieren Sie eine PDF-Bibliothek: pip install PyPDF2" -ForegroundColor Gray
                        continue
                    }
                } else {
                    Write-Host "   WARNUNG: PDF-Script nicht gefunden: $pdfScript" -ForegroundColor Yellow
                    continue
                }
            } else {
                # Normale Text-Datei
                $fileContent = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
            }
            
            $content += "`n## $($file.Name)`n`n"
            $content += $fileContent
            $content += "`n`n---`n"
            $fileCount++
        } catch {
            Write-Host "   WARNUNG: Konnte nicht gelesen werden: $($file.Name) - $_" -ForegroundColor Yellow
        }
    }
    
    if ($fileCount -eq 0) {
        Write-Host "   WARNUNG: Keine Dateien konnten gelesen werden" -ForegroundColor Yellow
        return $false
    }
    
    # Speichere Datei
    try {
        $content | Out-File -FilePath $TargetFile -Encoding UTF8 -NoNewline
        $fileName = [System.IO.Path]::GetFileName($TargetFile)
        Write-Host "   OK $fileName erstellt ($fileCount Dateien)" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "   FEHLER beim Speichern: $_" -ForegroundColor Red
        return $false
    }
}

# Import-Mapping - Finde tatsächliche Ordner-Namen dynamisch (um Encoding-Probleme zu vermeiden)
$actualFolders = Get-ChildItem -Path $SourcePath -Directory | ForEach-Object { $_.Name }

# Mapping: Suchmuster (als Byte-Array für Encoding-Sicherheit) -> Ziel-Datei
$importMappings = @(
    @{ Keywords = @("Autorit"); Target = "authority-detailed.txt"; Desc = "Autorität" },
    @{ Keywords = @("Typen"); Target = "types-detailed.txt"; Desc = "Die fünf Typen" },
    @{ Keywords = @("Sechs", "Linien"); Target = "profiles-detailed.txt"; Desc = "Die Sechs Linien (Profil)" },
    @{ Keywords = @("Kan"); Target = "channels-complete.txt"; Desc = "Kanäle (ALLE 36 Channels)" },
    @{ Keywords = @("Tore"); Target = "gates-complete.txt"; Desc = "Tore (ALLE 64 Gates)" },
    @{ Keywords = @("Zentren"); Target = "centers-detailed.txt"; Desc = "Zentren" },
    @{ Keywords = @("Praxisaufgaben", "Pfeile"); Target = "arrows-detailed.txt"; Desc = "Praxisaufgaben Pfeile" },
    @{ Keywords = @("Splits"); Target = "splits-detailed.txt"; Desc = "Splits" }
)

$successCount = 0
$failCount = 0

foreach ($mapping in $importMappings) {
    # Suche nach Ordner, der alle Keywords enthält
    $matchingFolder = $actualFolders | Where-Object {
        $folderName = $_
        $allKeywordsMatch = $true
        foreach ($keyword in $mapping.Keywords) {
            if ($folderName -notmatch $keyword) {
                $allKeywordsMatch = $false
                break
            }
        }
        $allKeywordsMatch
    } | Select-Object -First 1
    
    if ($matchingFolder) {
        $sourceFolder = Join-Path $SourcePath $matchingFolder
        $targetFile = Join-Path $TargetPath $mapping.Target
        
        if (Merge-FolderToKnowledge -SourceFolder $sourceFolder -TargetFile $targetFile -Description $mapping.Desc) {
            $successCount++
        } else {
            $failCount++
        }
    } else {
        Write-Host "WARNUNG: Kein passender Ordner gefunden für: $($mapping.Desc)" -ForegroundColor Yellow
        Write-Host "   Gesuchte Keywords: $($mapping.Keywords -join ', ')" -ForegroundColor Gray
        $failCount++
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Import abgeschlossen!" -ForegroundColor Green
Write-Host "   Erfolgreich: $successCount" -ForegroundColor Green
Write-Host "   Fehlgeschlagen: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Yellow" } else { "Green" })
Write-Host ""

# Zeige erstellte Dateien
Write-Host "Erstellte Knowledge-Dateien:" -ForegroundColor Cyan
Get-ChildItem -Path $TargetPath -Filter "*.txt" | 
    Where-Object { $_.Name -match "(authority|types|profiles|channels-complete|gates-complete|centers|arrows|splits)" } |
    ForEach-Object {
        $size = [math]::Round($_.Length / 1KB, 2)
        Write-Host "   - $($_.Name) ($size KB)" -ForegroundColor Gray
    }

Write-Host ""
Write-Host "Naechste Schritte:" -ForegroundColor Cyan
Write-Host "1. Pruefen Sie die erstellten Knowledge-Dateien" -ForegroundColor White
Write-Host "2. Formatieren Sie sie bei Bedarf (Markdown)" -ForegroundColor White
Write-Host "3. Commit und Push zu Git:" -ForegroundColor White
Write-Host "   git add production/knowledge/" -ForegroundColor Gray
Write-Host "   git commit -m 'Add knowledge files from Master of Manifestation'" -ForegroundColor Gray
Write-Host "   git push" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Auf Server kopieren (SSH):" -ForegroundColor White
Write-Host "   scp production/knowledge/*.txt user@138.199.237.34:/opt/mcp-connection-key/production/knowledge/" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Knowledge neu laden (auf Server):" -ForegroundColor White
Write-Host "   curl -X POST http://localhost:4001/admin/reload-knowledge -H 'Content-Type: application/json' -d '{\"secret\": \"IHR_AGENT_SECRET\"}'" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Status pruefen:" -ForegroundColor White
Write-Host "   curl http://localhost:4001/health" -ForegroundColor Gray

