# PowerShell Script: JSON Parse Fix auf Server deployen
# Kopiert die aktualisierten Frontend-Dateien auf den CK-App Server

$SERVER = "167.235.224.149"
$FRONTEND_DIR = "/opt/hd-app/The-Connection-Key/frontend"

Write-Host "🚀 Deployment des JSON Parse Fix auf CK-App Server ($SERVER)" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. ReadingGenerator.tsx
Write-Host "📤 Kopiere ReadingGenerator.tsx..." -ForegroundColor Yellow
scp integration/frontend/components/ReadingGenerator.tsx root@${SERVER}:${FRONTEND_DIR}/lib/components/ReadingGenerator.tsx

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ReadingGenerator.tsx kopiert" -ForegroundColor Green
} else {
    Write-Host "❌ Fehler beim Kopieren von ReadingGenerator.tsx!" -ForegroundColor Red
    exit 1
}

# 2. readingService.ts
Write-Host "📤 Kopiere readingService.ts..." -ForegroundColor Yellow
scp integration/frontend/services/readingService.ts root@${SERVER}:${FRONTEND_DIR}/lib/services/readingService.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ readingService.ts kopiert" -ForegroundColor Green
} else {
    Write-Host "❌ Fehler beim Kopieren von readingService.ts!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Alle Dateien erfolgreich auf CK-App Server kopiert!" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Nächste Schritte auf dem CK-App Server ($SERVER):" -ForegroundColor Cyan
Write-Host "1. Frontend neu bauen:" -ForegroundColor White
Write-Host "   cd $FRONTEND_DIR" -ForegroundColor Gray
Write-Host "   npm run build" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Container neu bauen:" -ForegroundColor White
Write-Host "   cd /opt/hd-app/The-Connection-Key" -ForegroundColor Gray
Write-Host "   docker compose build frontend" -ForegroundColor Gray
Write-Host "   docker compose up -d frontend" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Testen:" -ForegroundColor White
Write-Host "   curl -X POST http://localhost:3000/api/reading/generate \" -ForegroundColor Gray
Write-Host "     -H \"Content-Type: application/json\" \" -ForegroundColor Gray
Write-Host "     -d '{\"birthDate\": \"1990-05-15\", \"birthTime\": \"14:30\", \"birthPlace\": \"Berlin\"}'" -ForegroundColor Gray
Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan

