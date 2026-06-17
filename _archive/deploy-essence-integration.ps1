# PowerShell Script: Essence-Integration Deployment
# Kopiert alle notwendigen Dateien auf die Server

$HETZNER_SERVER = "138.199.237.34"
$CK_APP_SERVER = "167.235.224.149"

Write-Host "🚀 Essence-Integration Deployment" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# TEIL 1: Reading-Agent (Hetzner Server)
# ============================================
Write-Host "📤 TEIL 1: Reading-Agent auf Hetzner Server ($HETZNER_SERVER)" -ForegroundColor Yellow
Write-Host ""

$readingAgentFile = "production/server.js"
if (Test-Path $readingAgentFile) {
    Write-Host "📤 Kopiere $readingAgentFile nach Hetzner Server..." -ForegroundColor Gray
    scp $readingAgentFile "root@${HETZNER_SERVER}:/opt/mcp-connection-key/production/server.js"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Reading-Agent Datei kopiert" -ForegroundColor Green
        Write-Host ""
        Write-Host "🔄 Nächste Schritte auf Hetzner Server:" -ForegroundColor Yellow
        Write-Host "   ssh root@${HETZNER_SERVER}" -ForegroundColor Gray
        Write-Host "   cd /opt/mcp-connection-key/production" -ForegroundColor Gray
        Write-Host "   pm2 restart reading-agent" -ForegroundColor Gray
        Write-Host "   pm2 logs reading-agent --lines 50" -ForegroundColor Gray
    } else {
        Write-Host "❌ Fehler beim Kopieren von Reading-Agent Datei!" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Datei nicht gefunden: $readingAgentFile" -ForegroundColor Red
}

Write-Host ""

# ============================================
# TEIL 2: Frontend-Dateien (CK-App Server)
# ============================================
Write-Host "📤 TEIL 2: Frontend-Dateien auf CK-App Server ($CK_APP_SERVER)" -ForegroundColor Yellow
Write-Host ""

$frontendFiles = @(
    @{
        Source = "integration/frontend/components/ReadingDisplay.tsx"
        Target = "/opt/hd-app/The-Connection-Key/frontend/lib/components/ReadingDisplay.tsx"
    },
    @{
        Source = "integration/api-routes/reading-response-types.ts"
        Target = "/opt/hd-app/The-Connection-Key/frontend/app/api/reading-response-types.ts"
    },
    @{
        Source = "integration/api-routes/app-router/reading/generate/route.ts"
        Target = "/opt/hd-app/The-Connection-Key/frontend/app/api/reading/generate/route.ts"
    }
)

$allSuccess = $true

foreach ($file in $frontendFiles) {
    if (Test-Path $file.Source) {
        Write-Host "📤 Kopiere $($file.Source)..." -ForegroundColor Gray
        
        # Erstelle Verzeichnis falls nötig
        $targetDir = $file.Target | Split-Path -Parent
        ssh "root@${CK_APP_SERVER}" "mkdir -p $targetDir" | Out-Null
        
        # Kopiere Datei
        scp $file.Source "root@${CK_APP_SERVER}:$($file.Target)"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $($file.Source) kopiert" -ForegroundColor Green
        } else {
            Write-Host "❌ Fehler beim Kopieren von $($file.Source)!" -ForegroundColor Red
            $allSuccess = $false
        }
    } else {
        Write-Host "❌ Datei nicht gefunden: $($file.Source)" -ForegroundColor Red
        $allSuccess = $false
    }
}

Write-Host ""

if ($allSuccess) {
    Write-Host "✅ Alle Frontend-Dateien kopiert" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔄 Nächste Schritte auf CK-App Server:" -ForegroundColor Yellow
    Write-Host "   ssh root@${CK_APP_SERVER}" -ForegroundColor Gray
    Write-Host "   cd /opt/hd-app/The-Connection-Key/frontend" -ForegroundColor Gray
    Write-Host "   npm run build" -ForegroundColor Gray
    Write-Host "   docker compose restart frontend" -ForegroundColor Gray
    Write-Host "   # Oder falls PM2:" -ForegroundColor Gray
    Write-Host "   # pm2 restart the-connection-key" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Einige Dateien konnten nicht kopiert werden!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Deployment-Script abgeschlossen" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Wichtig:" -ForegroundColor Yellow
Write-Host "   1. Reading-Agent auf Hetzner Server neu starten" -ForegroundColor Gray
Write-Host "   2. Frontend auf CK-App Server neu bauen und starten" -ForegroundColor Gray
Write-Host "   3. Testen: Reading generieren und Essence prüfen" -ForegroundColor Gray

