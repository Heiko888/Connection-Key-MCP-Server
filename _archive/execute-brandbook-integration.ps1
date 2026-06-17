# Brand Book Integration - Automatische Ausführung
# Führt das Script auf dem Server aus und startet MCP Server neu

$SERVER = "138.199.237.34"
$SCRIPT_PATH = "/opt/mcp-connection-key/update-all-agents-brandbook.sh"

Write-Host "🎨 Brand Book Integration - Automatische Ausführung" -ForegroundColor Cyan
Write-Host ""

# 1. Script ausführbar machen
Write-Host "1. Script ausführbar machen..." -ForegroundColor Yellow
ssh root@${SERVER} "chmod +x $SCRIPT_PATH"
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Script ist ausführbar" -ForegroundColor Green
} else {
    Write-Host "   ❌ Fehler beim Ausführbar machen" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Script ausführen (mit automatischem "j" für Neustart)
Write-Host "2. Script ausführen..." -ForegroundColor Yellow
$scriptContent = @"
cd /opt/mcp-connection-key
chmod +x update-all-agents-brandbook.sh
echo 'j' | ./update-all-agents-brandbook.sh
"@

ssh root@${SERVER} $scriptContent

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Script ausgeführt" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Script mit Fehlern ausgeführt (Exit Code: $LASTEXITCODE)" -ForegroundColor Yellow
}

Write-Host ""

# 3. Prüfe ob Brand Book in Prompts vorhanden ist
Write-Host "3. Prüfe Brand Book Integration..." -ForegroundColor Yellow
$checkCommand = "grep -l 'BRAND BOOK WISSEN' /opt/ck-agent/prompts/*.txt 2>/dev/null | wc -l"
$count = ssh root@${SERVER} $checkCommand

if ([int]$count -ge 4) {
    Write-Host "   ✅ Brand Book in $count Prompt-Dateien gefunden" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Brand Book nur in $count Prompt-Dateien gefunden (erwartet: 4)" -ForegroundColor Yellow
}

Write-Host ""

# 4. MCP Server Status prüfen
Write-Host "4. MCP Server Status prüfen..." -ForegroundColor Yellow
$mcpStatus = ssh root@${SERVER} "systemctl is-active mcp 2>/dev/null || echo 'inactive'"
if ($mcpStatus -eq "active") {
    Write-Host "   ✅ MCP Server läuft" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  MCP Server Status: $mcpStatus" -ForegroundColor Yellow
    Write-Host "   🔄 Starte MCP Server..." -ForegroundColor Yellow
    ssh root@${SERVER} "systemctl restart mcp"
    Start-Sleep -Seconds 2
    $mcpStatus = ssh root@${SERVER} "systemctl is-active mcp 2>/dev/null || echo 'inactive'"
    if ($mcpStatus -eq "active") {
        Write-Host "   ✅ MCP Server gestartet" -ForegroundColor Green
    } else {
        Write-Host "   ❌ MCP Server konnte nicht gestartet werden" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Brand Book Integration abgeschlossen!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Nächste Schritte:" -ForegroundColor Yellow
Write-Host "1. Agenten testen:" -ForegroundColor Gray
Write-Host "   curl -X POST http://138.199.237.34:7000/agent/marketing -H 'Content-Type: application/json' -d '{\"message\": \"Test\"}'" -ForegroundColor White
Write-Host ""
Write-Host "2. Prüfe ob Brand Voice verwendet wird" -ForegroundColor Gray
Write-Host ""

