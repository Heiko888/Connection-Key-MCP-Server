# Deploy n8n Workflows zum gehosteten Server
# Server: 138.199.237.34
# n8n URL: https://n8n.werdemeisterdeinergedankenagent.de

$SERVER = "root@138.199.237.34"
$REMOTE_PATH = "/opt/mcp-connection-key/n8n-workflows"
$LOCAL_PATH = "n8n-workflows"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "n8n Workflows zum Server kopieren" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Pruefe ob lokales Verzeichnis existiert
if (-not (Test-Path $LOCAL_PATH)) {
    Write-Host "Fehler: Lokales Verzeichnis '$LOCAL_PATH' nicht gefunden!" -ForegroundColor Red
    exit 1
}

Write-Host "Lokale Workflow-Dateien:" -ForegroundColor Yellow
Get-ChildItem -Path $LOCAL_PATH -Filter "*.json" | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor Gray
}
Write-Host ""

# Erstelle Remote-Verzeichnis
Write-Host "Erstelle Remote-Verzeichnis..." -ForegroundColor Yellow
try {
    ssh $SERVER "mkdir -p $REMOTE_PATH" | Out-Null
    Write-Host "  Remote-Verzeichnis erstellt" -ForegroundColor Green
} catch {
    Write-Host "  Warnung: Konnte Remote-Verzeichnis nicht erstellen (moeglicherweise bereits vorhanden)" -ForegroundColor Yellow
}
Write-Host ""

# Kopiere alle JSON-Dateien
Write-Host "Kopiere Workflow-Dateien zum Server..." -ForegroundColor Yellow
$files = Get-ChildItem -Path $LOCAL_PATH -Filter "*.json"
$successCount = 0
$errorCount = 0

foreach ($file in $files) {
    $localFile = Join-Path $LOCAL_PATH $file.Name
    Write-Host "  Kopiere: $($file.Name)..." -ForegroundColor Gray -NoNewline
    
    try {
        scp $localFile "${SERVER}:${REMOTE_PATH}/" | Out-Null
        Write-Host " OK" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host " FEHLER" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fertig!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ergebnis:" -ForegroundColor Yellow
Write-Host "  Erfolgreich: $successCount" -ForegroundColor Green
Write-Host "  Fehler: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Gray" })
Write-Host ""
Write-Host "Naechste Schritte:" -ForegroundColor Yellow
Write-Host "  1. SSH zum Server: ssh $SERVER" -ForegroundColor Gray
Write-Host "  2. Pruefe Dateien: ls -la $REMOTE_PATH" -ForegroundColor Gray
Write-Host "  3. Oeffne n8n: https://n8n.werdemeisterdeinergedankenagent.de" -ForegroundColor Gray
Write-Host "  4. Importiere Workflows in n8n" -ForegroundColor Gray
Write-Host ""
Write-Host "Siehe: N8N_WORKFLOWS_SERVER_DEPLOYMENT.md" -ForegroundColor Cyan
