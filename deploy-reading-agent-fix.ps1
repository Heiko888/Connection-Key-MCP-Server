# PowerShell Script: Reading Agent userId Fix auf Hetzner Server deployen

$SERVER = "138.199.237.34"
$REMOTE_DIR = "/opt/mcp-connection-key/production"

Write-Host "🚀 Deployment des Reading Agent Fix auf Hetzner Server ($SERVER)" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. server.js kopieren
Write-Host "📤 Kopiere server.js..." -ForegroundColor Yellow
scp production/server.js root@${SERVER}:${REMOTE_DIR}/server.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ server.js kopiert" -ForegroundColor Green
} else {
    Write-Host "❌ Fehler beim Kopieren von server.js!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Datei erfolgreich auf Hetzner Server kopiert!" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Nächste Schritte auf dem Hetzner Server ($SERVER):" -ForegroundColor Cyan
Write-Host "1. PM2 neu starten:" -ForegroundColor White
Write-Host "   ssh root@${SERVER} 'pm2 restart reading-agent'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Status prüfen:" -ForegroundColor White
Write-Host "   ssh root@${SERVER} 'pm2 status reading-agent'" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Logs prüfen:" -ForegroundColor White
Write-Host "   ssh root@${SERVER} 'pm2 logs reading-agent --lines 20'" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Testen:" -ForegroundColor White
Write-Host "   curl -X POST http://${SERVER}:4001/reading/generate \" -ForegroundColor Gray
Write-Host "     -H \"Content-Type: application/json\" \" -ForegroundColor Gray
Write-Host "     -d '{\"birthDate\": \"1990-05-15\", \"birthTime\": \"14:30\", \"birthPlace\": \"Berlin\", \"readingType\": \"detailed\"}'" -ForegroundColor Gray
Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan

