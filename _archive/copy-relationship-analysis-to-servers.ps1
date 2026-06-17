# PowerShell Script zum Kopieren der Relationship Analysis Dateien auf Server
# Kopiert alle notwendigen Dateien auf MCP Server und CK-App Server

param(
    [string]$McpServer = "138.199.237.34",
    [string]$CkAppServer = "167.235.224.149",
    [string]$LocalPath = "C:\AppProgrammierung\Projekte\MCP_Connection_Key"
)

Write-Host "📦 Relationship Analysis Agent - Dateien kopieren" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Prüfe ob lokales Verzeichnis existiert
if (-not (Test-Path $LocalPath)) {
    Write-Host "❌ Lokales Verzeichnis nicht gefunden: $LocalPath" -ForegroundColor Red
    Write-Host "💡 Bitte passe den Pfad an oder wechsle ins richtige Verzeichnis" -ForegroundColor Yellow
    exit 1
}

Write-Host "📍 Lokales Verzeichnis: $LocalPath" -ForegroundColor Yellow
Write-Host ""

# ============================================
# MCP Server (138.199.237.34)
# ============================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "📋 Schritt 1: Dateien auf MCP Server kopieren ($McpServer)" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

$mcpFiles = @(
    "create-relationship-analysis-agent.sh",
    "check-relationship-analysis-files.sh",
    "deploy-relationship-analysis-complete.sh"
)

foreach ($file in $mcpFiles) {
    $localFile = Join-Path $LocalPath $file
    if (Test-Path $localFile) {
        Write-Host "📤 Kopiere $file..." -ForegroundColor Yellow
        try {
            scp $localFile "root@${McpServer}:/opt/mcp-connection-key/"
            Write-Host "✅ $file kopiert" -ForegroundColor Green
        } catch {
            Write-Host "❌ Fehler beim Kopieren von $file : $_" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  Datei nicht gefunden: $file" -ForegroundColor Yellow
    }
}

# Integration-Verzeichnis kopieren
$integrationPath = Join-Path $LocalPath "integration"
if (Test-Path $integrationPath) {
    Write-Host "📤 Kopiere integration/ Verzeichnis..." -ForegroundColor Yellow
    try {
        scp -r $integrationPath "root@${McpServer}:/opt/mcp-connection-key/"
        Write-Host "✅ integration/ Verzeichnis kopiert" -ForegroundColor Green
    } catch {
        Write-Host "❌ Fehler beim Kopieren von integration/ : $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Integration-Verzeichnis nicht gefunden: $integrationPath" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# CK-App Server (167.235.224.149)
# ============================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "📋 Schritt 2: Dateien auf CK-App Server kopieren ($CkAppServer)" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

# Integration-Verzeichnis kopieren
if (Test-Path $integrationPath) {
    Write-Host "📤 Kopiere integration/ Verzeichnis..." -ForegroundColor Yellow
    try {
        scp -r $integrationPath "root@${CkAppServer}:/opt/hd-app/The-Connection-Key/"
        Write-Host "✅ integration/ Verzeichnis kopiert" -ForegroundColor Green
    } catch {
        Write-Host "❌ Fehler beim Kopieren von integration/ : $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Integration-Verzeichnis nicht gefunden: $integrationPath" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# Zusammenfassung
# ============================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "✅ Kopieren abgeschlossen!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""
Write-Host "📋 Nächste Schritte:" -ForegroundColor Yellow
Write-Host "   1. SSH zum MCP Server: ssh root@$McpServer" -ForegroundColor Gray
Write-Host "   2. Prüfe Dateien: ./check-relationship-analysis-files.sh" -ForegroundColor Gray
Write-Host "   3. Deploye Agent: ./deploy-relationship-analysis-complete.sh" -ForegroundColor Gray
Write-Host ""
