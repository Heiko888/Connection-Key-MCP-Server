# PowerShell Script: Kopiere Integration-Dateien auf CK-App Server
# Führe auf lokalem Windows-Rechner aus

$CkAppServer = "167.235.224.149"
$LocalPath = "C:\AppProgrammierung\Projekte\MCP_Connection_Key"
$RemotePath = "/opt/hd-app/The-Connection-Key"

Write-Host "📦 Kopiere Integration-Dateien auf CK-App Server..." -ForegroundColor Cyan
Write-Host ""

# Prüfe ob lokales Verzeichnis existiert
if (-not (Test-Path $LocalPath)) {
    Write-Host "❌ Lokales Verzeichnis nicht gefunden: $LocalPath" -ForegroundColor Red
    exit 1
}

# Integration-Verzeichnis kopieren
$integrationPath = Join-Path $LocalPath "integration"
if (Test-Path $integrationPath) {
    Write-Host "📤 Kopiere integration/ Verzeichnis..." -ForegroundColor Yellow
    try {
        scp -r $integrationPath "root@${CkAppServer}:${RemotePath}/"
        Write-Host "✅ Integration-Verzeichnis kopiert" -ForegroundColor Green
    } catch {
        Write-Host "❌ Fehler beim Kopieren: $_" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Integration-Verzeichnis nicht gefunden: $integrationPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Fertig! Jetzt auf CK-App Server die Dateien kopieren:" -ForegroundColor Green
Write-Host "   cd /opt/hd-app/The-Connection-Key/frontend" -ForegroundColor Gray
Write-Host "   cp integration/frontend/components/RelationshipAnalysisGenerator.tsx components/" -ForegroundColor Gray
Write-Host "   cp integration/api-routes/app-router/relationship-analysis/generate/route.ts app/api/relationship-analysis/generate/" -ForegroundColor Gray
