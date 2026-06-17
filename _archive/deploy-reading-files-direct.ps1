# PowerShell Script: Dateien direkt auf Server erstellen
# Falls SCP nicht funktioniert, werden Dateien direkt auf Server erstellt

$SERVER = "167.235.224.149"
$FRONTEND_DIR = "/opt/hd-app/The-Connection-Key/frontend"

Write-Host "🚀 Erstelle Dateien direkt auf Server..." -ForegroundColor Cyan
Write-Host ""

# 1. reading-response-types.ts
Write-Host "📤 Erstelle reading-response-types.ts..." -ForegroundColor Yellow
$content1 = Get-Content -Path "integration/api-routes/reading-response-types.ts" -Raw
$content1Escaped = $content1 -replace '"', '\"' -replace '\$', '\$' -replace '`', '\`'

ssh root@${SERVER} "cat > ${FRONTEND_DIR}/app/api/reading-response-types.ts << 'EOF'
$content1
EOF"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ reading-response-types.ts erstellt" -ForegroundColor Green
} else {
    Write-Host "❌ Fehler beim Erstellen von reading-response-types.ts!" -ForegroundColor Red
    exit 1
}

# 2. reading-validation.ts
Write-Host "📤 Erstelle reading-validation.ts..." -ForegroundColor Yellow
$content2 = Get-Content -Path "integration/api-routes/reading-validation.ts" -Raw

ssh root@${SERVER} "cat > ${FRONTEND_DIR}/app/api/reading-validation.ts << 'EOF'
$content2
EOF"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ reading-validation.ts erstellt" -ForegroundColor Green
} else {
    Write-Host "❌ Fehler beim Erstellen von reading-validation.ts!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Alle Dateien erfolgreich auf Server erstellt!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Nächste Schritte auf dem Server:" -ForegroundColor Cyan
Write-Host "1. Prüfe ob Dateien vorhanden sind:"
Write-Host "   ls -la ${FRONTEND_DIR}/app/api/reading-response-types.ts"
Write-Host "   ls -la ${FRONTEND_DIR}/app/api/reading-validation.ts"
Write-Host ""
Write-Host "2. Build erneut versuchen:"
Write-Host "   cd ${FRONTEND_DIR}"
Write-Host "   npm run build"
Write-Host ""

