# PowerShell Script: Deployment via SCP
# Kopiert Dateien direkt auf Server

$SERVER = "167.235.224.149"
$FRONTEND_DIR = "/opt/hd-app/The-Connection-Key/frontend"

Write-Host "🚀 Deployment via SCP" -ForegroundColor Green
Write-Host "====================" -ForegroundColor Green
Write-Host ""

# Prüfe ob Dateien lokal vorhanden sind
$files = @(
    "integration/api-routes/app-router/reading/generate/route.ts",
    "integration/api-routes/app-router/readings/[id]/status/route.ts",
    "integration/frontend/services/readingService.ts"
)

Write-Host "📋 Schritt 1: Prüfe lokale Dateien..." -ForegroundColor Yellow
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file nicht gefunden!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📋 Schritt 2: Kopiere Dateien auf Server..." -ForegroundColor Yellow

# 1. Reading Generate Route
Write-Host "📤 Kopiere Reading Generate Route..." -ForegroundColor Cyan
scp integration/api-routes/app-router/reading/generate/route.ts `
   root@${SERVER}:${FRONTEND_DIR}/app/api/reading/generate/route.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Reading Generate Route kopiert" -ForegroundColor Green
} else {
    Write-Host "❌ Fehler beim Kopieren!" -ForegroundColor Red
    exit 1
}

# 2. Status Route (Verzeichnis erstellen)
Write-Host "📤 Erstelle Verzeichnis für Status Route..." -ForegroundColor Cyan
ssh root@${SERVER} "mkdir -p ${FRONTEND_DIR}/app/api/readings/[id]/status"

Write-Host "📤 Kopiere Status Route..." -ForegroundColor Cyan
scp "integration/api-routes/app-router/readings/[id]/status/route.ts" `
   root@${SERVER}:${FRONTEND_DIR}/app/api/readings/[id]/status/route.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Status Route kopiert" -ForegroundColor Green
} else {
    Write-Host "❌ Fehler beim Kopieren!" -ForegroundColor Red
    exit 1
}

# 3. Frontend Service
Write-Host "📤 Erstelle Verzeichnis für Service..." -ForegroundColor Cyan
ssh root@${SERVER} "mkdir -p ${FRONTEND_DIR}/lib/services"

Write-Host "📤 Kopiere Frontend Service..." -ForegroundColor Cyan
scp integration/frontend/services/readingService.ts `
   root@${SERVER}:${FRONTEND_DIR}/lib/services/readingService.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend Service kopiert" -ForegroundColor Green
} else {
    Write-Host "❌ Fehler beim Kopieren!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Alle Dateien kopiert!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Nächste Schritte auf Server:" -ForegroundColor Yellow
Write-Host "1. Import-Pfade prüfen:" -ForegroundColor White
Write-Host "   cd $FRONTEND_DIR" -ForegroundColor Gray
Write-Host "   grep 'from.*reading-response-types' app/api/reading/generate/route.ts" -ForegroundColor Gray
Write-Host ""
Write-Host "2. TypeScript-Kompilierung prüfen:" -ForegroundColor White
Write-Host "   npm run build" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Frontend neu starten:" -ForegroundColor White
Write-Host "   pm2 restart the-connection-key" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Supabase Migration ausführen:" -ForegroundColor White
Write-Host "   - Öffne Supabase Dashboard" -ForegroundColor Gray
Write-Host "   - SQL Editor → integration/supabase/migrations/003_add_processing_status.sql" -ForegroundColor Gray

