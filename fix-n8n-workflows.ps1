# Fix n8n Workflows - Prüfe und korrigiere häufige Probleme

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "n8n Workflows - Problem-Diagnose" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Haeufige Probleme:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Rote Markierungen an Nodes" -ForegroundColor Gray
Write-Host "   - Node oeffnen und Fehlermeldung lesen" -ForegroundColor DarkGray
Write-Host "   - Fehlende Werte eintragen" -ForegroundColor DarkGray
Write-Host ""
Write-Host "2. URL-Fehler" -ForegroundColor Gray
Write-Host "   - HTTP Request Node: URL pruefen" -ForegroundColor DarkGray
Write-Host "   - Sollte sein: http://138.199.237.34:7000/agent/..." -ForegroundColor DarkGray
Write-Host ""
Write-Host "3. Webhook Path bereits verwendet" -ForegroundColor Gray
Write-Host "   - Webhook Trigger: Path aendern" -ForegroundColor DarkGray
Write-Host "   - Z.B.: agent-notification -> agent-notification-v2" -ForegroundColor DarkGray
Write-Host ""
Write-Host "4. Expression-Fehler" -ForegroundColor Gray
Write-Host "   - Expression pruefen: ={{ `$json.message }}" -ForegroundColor DarkGray
Write-Host "   - Syntax korrigieren" -ForegroundColor DarkGray
Write-Host ""
Write-Host "5. Disabled Nodes" -ForegroundColor Gray
Write-Host "   - Node oeffnen" -ForegroundColor DarkGray
Write-Host "   - Disabled Toggle deaktivieren" -ForegroundColor DarkGray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Schritt-fuer-Schritt Anleitung:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. n8n oeffnen: https://n8n.werdemeisterdeinergedankenagent.de" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Fuer jeden Workflow:" -ForegroundColor Yellow
Write-Host "   a) Workflow oeffnen" -ForegroundColor Gray
Write-Host "   b) Alle Nodes pruefen (rote Markierungen?)" -ForegroundColor Gray
Write-Host "   c) Fehler beheben" -ForegroundColor Gray
Write-Host "   d) Save klicken" -ForegroundColor Gray
Write-Host "   e) Active Toggle aktivieren" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Pruefen:" -ForegroundColor Yellow
Write-Host "   - Keine roten Markierungen mehr" -ForegroundColor Gray
Write-Host "   - Workflow ist GRUEN" -ForegroundColor Gray
Write-Host ""
Write-Host "Siehe: N8N_WORKFLOWS_AKTIVIERUNG_PROBLEM.md" -ForegroundColor Cyan
Write-Host ""

