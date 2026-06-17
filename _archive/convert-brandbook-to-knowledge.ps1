# ============================================
# Master Brand Book zu Knowledge-Dateien konvertieren
# ============================================
# Konvertiert HTML/PDF Dateien aus Masterbrandbook zu .txt Knowledge-Dateien
# ============================================

$brandbookPath = "C:\AppProgrammierung\Projekte\Masterbrandbook"
$outputPath = "production\knowledge\brandbook"
$tempPath = "temp-brandbook-extraction"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Master Brand Book Konvertierung" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Prüfe ob Brand Book Verzeichnis existiert
if (-not (Test-Path $brandbookPath)) {
    Write-Host "❌ Brand Book Verzeichnis nicht gefunden: $brandbookPath" -ForegroundColor Red
    exit 1
}

Write-Host "[*] Brand Book Verzeichnis gefunden" -ForegroundColor Green
Write-Host "    Pfad: $brandbookPath" -ForegroundColor Gray
Write-Host ""

# Erstelle Ausgabe-Verzeichnis
if (-not (Test-Path $outputPath)) {
    New-Item -ItemType Directory -Path $outputPath -Force | Out-Null
    Write-Host "[*] Ausgabe-Verzeichnis erstellt: $outputPath" -ForegroundColor Green
}

# Erstelle Temp-Verzeichnis
if (-not (Test-Path $tempPath)) {
    New-Item -ItemType Directory -Path $tempPath -Force | Out-Null
}

Write-Host "[*] Analysiere Brand Book Dateien..." -ForegroundColor Yellow
Write-Host ""

# Zähle Dateien
$htmlFiles = Get-ChildItem -Path $brandbookPath -Filter "kapitel-*.html" | Sort-Object Name
$pdfFiles = Get-ChildItem -Path $brandbookPath -Filter "*.pdf"
$mdFile = Get-ChildItem -Path $brandbookPath -Filter "*.md" | Where-Object { $_.Name -like "*brand*" }

Write-Host "  Gefundene Dateien:" -ForegroundColor Gray
Write-Host "    HTML-Kapitel: $($htmlFiles.Count)" -ForegroundColor Gray
Write-Host "    PDF-Dateien: $($pdfFiles.Count)" -ForegroundColor Gray
if ($mdFile) {
    Write-Host "    Markdown: 1 ($($mdFile.Name))" -ForegroundColor Gray
}
Write-Host ""

# Funktion: HTML zu Text konvertieren
function Convert-HtmlToText {
    param([string]$htmlPath, [string]$outputPath)
    
    try {
        $htmlContent = Get-Content -Path $htmlPath -Raw -Encoding UTF8
        
        # Entferne HTML-Tags (einfache Methode)
        $text = $htmlContent -replace '<script[^>]*>.*?</script>', '' -replace '<style[^>]*>.*?</style>', ''
        $text = $text -replace '<[^>]+>', ''
        
        # Decodiere HTML-Entities
        $text = [System.Web.HttpUtility]::HtmlDecode($text)
        
        # Bereinige Whitespace
        $text = $text -replace '\s+', ' '
        $text = $text -replace '\n\s*\n\s*\n+', "`n`n"
        
        # Speichere als .txt
        $text | Out-File -FilePath $outputPath -Encoding UTF8 -NoNewline
        
        return $true
    } catch {
        Write-Host "    ⚠️  Fehler bei $htmlPath : $_" -ForegroundColor Yellow
        return $false
    }
}

# Konvertiere HTML-Kapitel
Write-Host "[*] Konvertiere HTML-Kapitel zu .txt..." -ForegroundColor Yellow
$convertedCount = 0

foreach ($htmlFile in $htmlFiles) {
    $chapterNumber = $htmlFile.Name -replace 'kapitel-(\d+)\.html', '$1'
    $outputFile = Join-Path $outputPath "brandbook-kapitel-$chapterNumber.txt"
    
    Write-Host "  [$chapterNumber] $($htmlFile.Name) → brandbook-kapitel-$chapterNumber.txt" -ForegroundColor Gray
    
    if (Convert-HtmlToText -htmlPath $htmlFile.FullName -outputPath $outputFile) {
        $convertedCount++
    }
}

Write-Host ""
Write-Host "  ✅ $convertedCount von $($htmlFiles.Count) Kapitel konvertiert" -ForegroundColor Green
Write-Host ""

# Prüfe Markdown-Datei
if ($mdFile) {
    Write-Host "[*] Kopiere Markdown-Datei..." -ForegroundColor Yellow
    $mdOutput = Join-Path $outputPath "brandbook-complete.md"
    Copy-Item -Path $mdFile.FullName -Destination $mdOutput -Force
    Write-Host "  ✅ $($mdFile.Name) → brandbook-complete.md" -ForegroundColor Green
    Write-Host ""
}

# Erstelle Zusammenfassung
Write-Host "[*] Erstelle Zusammenfassung..." -ForegroundColor Yellow

$summaryContent = @"
# Master Brand Book - Knowledge-Dateien

## Übersicht

Dieses Verzeichnis enthält die konvertierten Knowledge-Dateien aus dem Master Brand Book.

## Dateien

"@

foreach ($htmlFile in $htmlFiles) {
    $chapterNumber = $htmlFile.Name -replace 'kapitel-(\d+)\.html', '$1'
    $summaryContent += "`n- `brandbook-kapitel-$chapterNumber.txt` - Kapitel $chapterNumber"
}

if ($mdFile) {
    $summaryContent += "`n- `brandbook-complete.md` - Vollständiges Brand Book (Markdown)"
}

$summaryContent += @"

## Verwendung

Diese Dateien werden automatisch von den Agenten geladen:
- **Reading Agent**: Lädt alle .txt und .md Dateien aus `production/knowledge/`
- **MCP Agenten**: Können über System-Prompts auf diese Knowledge zugreifen

## Aktualisierung

Um die Knowledge-Dateien zu aktualisieren:
1. Führen Sie dieses Script erneut aus
2. Starten Sie die Agenten neu oder laden Sie Knowledge neu:
   - Reading Agent: `curl -X POST http://localhost:4001/admin/reload-knowledge`
   - MCP Agenten: Neustart erforderlich

## Datum

Erstellt: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

$summaryPath = Join-Path $outputPath "README.md"
$summaryContent | Out-File -FilePath $summaryPath -Encoding UTF8

Write-Host "  ✅ README.md erstellt" -ForegroundColor Green
Write-Host ""

# Zeige Ergebnis
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fertig!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Konvertierte Dateien:" -ForegroundColor Yellow
Write-Host "  Pfad: $outputPath" -ForegroundColor Gray
Write-Host ""

$outputFiles = Get-ChildItem -Path $outputPath -Filter "*.txt" | Sort-Object Name
Write-Host "  Dateien ($($outputFiles.Count)):" -ForegroundColor Gray
foreach ($file in $outputFiles) {
    $size = [math]::Round($file.Length / 1KB, 2)
    Write-Host "    ✅ $($file.Name) ($size KB)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Nächste Schritte:" -ForegroundColor Yellow
Write-Host "  1. Prüfen Sie die konvertierten Dateien" -ForegroundColor Gray
Write-Host "  2. Kopieren Sie sie auf den Server (falls nötig)" -ForegroundColor Gray
Write-Host "  3. Laden Sie Knowledge neu oder starten Sie Agenten neu" -ForegroundColor Gray
Write-Host ""

