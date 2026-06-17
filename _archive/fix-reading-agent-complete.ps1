# PowerShell Script: Reading Agent Fix - Komplett neu starten

$SERVER = "138.199.237.34"
$REMOTE_DIR = "/opt/mcp-connection-key/production"

Write-Host "🔧 Reading Agent Fix - Komplett neu starten" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Prüfe aktuelle Zeile 340 auf Server
Write-Host "📋 Prüfe Zeile 340 auf Server..." -ForegroundColor Yellow
ssh root@${SERVER} "sed -n '340,341p' ${REMOTE_DIR}/server.js"

Write-Host ""
Write-Host "📋 Sollte sein:" -ForegroundColor Green
Write-Host "      userId: userId || \"anonymous\"," -ForegroundColor Gray
Write-Host "      birthDate: birthDate || \"unknown\"" -ForegroundColor Gray
Write-Host ""

# 2. Datei nochmal kopieren
Write-Host "📤 Kopiere server.js nochmal..." -ForegroundColor Yellow
scp production/server.js root@${SERVER}:${REMOTE_DIR}/server.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ server.js kopiert" -ForegroundColor Green
} else {
    Write-Host "❌ Fehler beim Kopieren!" -ForegroundColor Red
    exit 1
}

# 3. PM2 komplett stoppen und löschen
Write-Host ""
Write-Host "🛑 PM2 komplett stoppen..." -ForegroundColor Yellow
ssh root@${SERVER} "pm2 stop reading-agent"
ssh root@${SERVER} "pm2 delete reading-agent"

# 4. PM2 neu starten
Write-Host "🚀 PM2 neu starten..." -ForegroundColor Yellow
ssh root@${SERVER} "cd ${REMOTE_DIR} && pm2 start server.js --name reading-agent"

# 5. Status prüfen
Write-Host ""
Write-Host "📊 Status prüfen..." -ForegroundColor Yellow
ssh root@${SERVER} "pm2 status reading-agent"

# 6. Logs prüfen
Write-Host ""
Write-Host "📋 Logs prüfen (sollte keine userId-Fehler mehr zeigen)..." -ForegroundColor Yellow
ssh root@${SERVER} "pm2 logs reading-agent --lines 10 --nostream"

Write-Host ""
Write-Host "✅ Fertig!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Testen:" -ForegroundColor Cyan
Write-Host "   curl -X POST http://${SERVER}:4001/reading/generate \" -ForegroundColor Gray
Write-Host "     -H \"Content-Type: application/json\" \" -ForegroundColor Gray
Write-Host "     -d '{\"birthDate\": \"1990-05-15\", \"birthTime\": \"14:30\", \"birthPlace\": \"Berlin\", \"readingType\": \"detailed\"}'" -ForegroundColor Gray
Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan

