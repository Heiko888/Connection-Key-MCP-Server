# Prüft Knowledge-Ordner und zeigt Inhalt
$basePath = "C:\Users\Heiko\OneDrive\Dateien TRS\Master of Manifestation"

Write-Host "Prüfe Knowledge-Ordner..." -ForegroundColor Cyan
Write-Host "Pfad: $basePath" -ForegroundColor Gray
Write-Host ""

if (-not (Test-Path $basePath)) {
    Write-Host "FEHLER: Pfad nicht gefunden!" -ForegroundColor Red
    exit 1
}

$folders = Get-ChildItem -Path $basePath -Directory

foreach ($folder in $folders) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Ordner: $($folder.Name)" -ForegroundColor Yellow
    Write-Host "Vollständiger Pfad: $($folder.FullName)" -ForegroundColor Gray
    
    $files = Get-ChildItem -Path $folder.FullName -File -Recurse | Where-Object {
        $_.Extension -in @('.txt', '.md', '.pdf') -or $_.Extension -eq ''
    }
    
    Write-Host "Dateien gefunden: $($files.Count)" -ForegroundColor $(if ($files.Count -gt 0) { "Green" } else { "Red" })
    
    if ($files.Count -gt 0) {
        Write-Host "Erste 5 Dateien:" -ForegroundColor Gray
        $files | Select-Object -First 5 | ForEach-Object {
            $size = [math]::Round($_.Length / 1KB, 2)
            Write-Host "  - $($_.Name) ($($_.Extension)) - $size KB" -ForegroundColor White
        }
    }
    Write-Host ""
}

