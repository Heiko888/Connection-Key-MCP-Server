# Prüfe API-Routes Konfiguration - PowerShell Wrapper

$SERVER = "root@167.235.224.149"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API-Routes Konfiguration prüfen" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kopiere Script zum Server
Write-Host "Kopiere Prüf-Script zum Server..." -ForegroundColor Yellow
scp check-api-routes-server.sh "${SERVER}:/tmp/" | Out-Null

if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq $null) {
    Write-Host "  ✅ Script kopiert" -ForegroundColor Green
} else {
    Write-Host "  ❌ Fehler beim Kopieren" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Führe Script auf Server aus
Write-Host "Führe Prüfung auf Server aus..." -ForegroundColor Yellow
Write-Host ""

ssh $SERVER "chmod +x /tmp/check-api-routes-server.sh && /tmp/check-api-routes-server.sh"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Prüfung abgeschlossen" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Siehe: FRONTEND_API_ROUTES_PRÜFUNG.md" -ForegroundColor Cyan

