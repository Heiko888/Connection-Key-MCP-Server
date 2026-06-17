# Deploy n8n Workflow Fixes zum Hetzner-Server
# Server: 138.199.237.34

$SERVER = "root@138.199.237.34"
$REMOTE_PATH = "/opt/mcp-connection-key"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy n8n Workflow Fixes" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[STEP 1] Lokale Aenderungen verwerfen (falls vorhanden)..." -ForegroundColor Yellow
try {
    ssh $SERVER "cd $REMOTE_PATH && git checkout -- n8n-workflows/reading-generation-workflow.json" | Out-Null
    Write-Host "  [OK] Lokale Aenderungen verworfen" -ForegroundColor Green
}
catch {
    Write-Host "  [INFO] Keine lokalen Aenderungen vorhanden" -ForegroundColor Gray
}
Write-Host ""

Write-Host "[STEP 2] Git Pull..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && git pull origin feature/reading-agent-option-a-complete"
Write-Host ""

Write-Host "[STEP 3] Pruefe Workflow-Datei..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && ls -la n8n-workflows/reading-generation-workflow.json"
Write-Host ""

Write-Host "[STEP 4] Pruefe ob Normalize Response Node vorhanden ist..." -ForegroundColor Yellow
$checkResult = ssh $SERVER "cd $REMOTE_PATH && grep -q 'Normalize Response' n8n-workflows/reading-generation-workflow.json && echo 'FOUND' || echo 'NOT_FOUND'"
if ($checkResult -match "FOUND") {
    Write-Host "  [OK] Normalize Response Node gefunden" -ForegroundColor Green
}
else {
    Write-Host "  [WARN] Normalize Response Node nicht gefunden" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment abgeschlossen!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Naechste Schritte:" -ForegroundColor Yellow
Write-Host "1. Oeffne: https://n8n.werdemeisterdeinergedankenagent.de" -ForegroundColor Gray
Write-Host "2. Workflows -> Import from File" -ForegroundColor Gray
Write-Host "3. Waehle: /opt/mcp-connection-key/n8n-workflows/reading-generation-workflow.json" -ForegroundColor Gray
Write-Host "4. Workflow aktivieren" -ForegroundColor Gray
Write-Host ""

