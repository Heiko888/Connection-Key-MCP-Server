# Brand Book Deployment - Komplett
# Deployt Brand Book Integration für Reading Agent und MCP Agenten

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Brand Book Deployment - Komplett" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Server-Informationen
$SERVER = "root@138.199.237.34"
$SERVER_PATH = "/opt/mcp-connection-key"
$READING_AGENT_PATH = "$SERVER_PATH/production"
$MCP_AGENT_PATH = "/opt/ck-agent"

Write-Host "Server: $SERVER" -ForegroundColor Yellow
Write-Host ""

# Prüfe ob Dateien vorhanden sind
Write-Host "[*] Prüfe lokale Dateien..." -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path "production/server.js")) {
    Write-Host "  ❌ production/server.js nicht gefunden!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "update-all-agents-brandbook.sh")) {
    Write-Host "  ❌ update-all-agents-brandbook.sh nicht gefunden!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "production/knowledge/brandbook")) {
    Write-Host "  ⚠️  production/knowledge/brandbook nicht gefunden" -ForegroundColor Yellow
    Write-Host "  (Wird übersprungen, falls nicht vorhanden)" -ForegroundColor Gray
}

Write-Host "  ✅ Alle benötigten Dateien vorhanden" -ForegroundColor Green
Write-Host ""

# Schritt 1: Reading Agent server.js deployen
Write-Host "[1/4] Deploye Reading Agent server.js..." -ForegroundColor Yellow
Write-Host ""

try {
    scp production/server.js "${SERVER}:${READING_AGENT_PATH}/server.js"
    Write-Host "  ✅ server.js auf Server kopiert" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Fehler beim Kopieren von server.js" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Schritt 2: Brand Book Knowledge deployen (falls vorhanden)
Write-Host "[2/4] Deploye Brand Book Knowledge..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path "production/knowledge/brandbook") {
    try {
        # Erstelle Verzeichnis auf Server
        ssh $SERVER "mkdir -p ${READING_AGENT_PATH}/knowledge/brandbook"
        
        # Kopiere alle Brand Book Dateien
        scp -r production/knowledge/brandbook/* "${SERVER}:${READING_AGENT_PATH}/knowledge/brandbook/"
        Write-Host "  ✅ Brand Book Knowledge auf Server kopiert" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Fehler beim Kopieren von Brand Book Knowledge" -ForegroundColor Yellow
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Gray
        Write-Host "  (Wird übersprungen)" -ForegroundColor Gray
    }
} else {
    Write-Host "  ⏭️  Brand Book Knowledge nicht vorhanden (übersprungen)" -ForegroundColor Gray
}

Write-Host ""

# Schritt 3: MCP Agenten Script deployen
Write-Host "[3/4] Deploye MCP Agenten Script..." -ForegroundColor Yellow
Write-Host ""

try {
    scp update-all-agents-brandbook.sh "${SERVER}:${SERVER_PATH}/update-all-agents-brandbook.sh"
    Write-Host "  ✅ update-all-agents-brandbook.sh auf Server kopiert" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Fehler beim Kopieren von update-all-agents-brandbook.sh" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Schritt 4: Scripts auf Server ausführen
Write-Host "[4/4] Führe Scripts auf Server aus..." -ForegroundColor Yellow
Write-Host ""

$deployScript = @"
#!/bin/bash
set -e

cd $SERVER_PATH

echo '[*] Brand Book Deployment auf Server...'
echo ''

# Schritt 1: MCP Agenten Brand Book Integration
echo '[1/2] MCP Agenten Brand Book Integration...'
if [ -f update-all-agents-brandbook.sh ]; then
    chmod +x update-all-agents-brandbook.sh
    ./update-all-agents-brandbook.sh
    echo '  ✅ MCP Agenten Brand Book Integration abgeschlossen'
else
    echo '  ❌ update-all-agents-brandbook.sh nicht gefunden!'
    exit 1
fi

echo ''

# Schritt 2: Reading Agent neu starten
echo '[2/2] Reading Agent neu starten...'
if pm2 list | grep -q reading-agent; then
    pm2 restart reading-agent
    echo '  ✅ Reading Agent neu gestartet'
else
    echo '  ⚠️  Reading Agent läuft nicht (wird übersprungen)'
fi

echo ''
echo '✅ Brand Book Deployment abgeschlossen!'
echo ''
echo 'Prüfe Status:'
pm2 status reading-agent
systemctl status mcp --no-pager | head -5
"@

try {
    # Script auf Server ausführen
    $deployScript | ssh $SERVER "bash -s"
    Write-Host "  ✅ Scripts auf Server ausgeführt" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Fehler beim Ausführen der Scripts" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Manuelle Ausführung:" -ForegroundColor Yellow
    Write-Host "  ssh $SERVER" -ForegroundColor Gray
    Write-Host "  cd $SERVER_PATH" -ForegroundColor Gray
    Write-Host "  chmod +x update-all-agents-brandbook.sh" -ForegroundColor Gray
    Write-Host "  ./update-all-agents-brandbook.sh" -ForegroundColor Gray
    Write-Host "  pm2 restart reading-agent" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Brand Book Deployment abgeschlossen!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Nächste Schritte:" -ForegroundColor Yellow
Write-Host "  1. Prüfe Reading Agent Status:" -ForegroundColor Gray
Write-Host "     ssh $SERVER 'pm2 status reading-agent'" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  2. Prüfe MCP Server Status:" -ForegroundColor Gray
Write-Host "     ssh $SERVER 'systemctl status mcp'" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  3. Teste Reading Agent:" -ForegroundColor Gray
Write-Host "     curl -X POST http://138.199.237.34:4001/reading/generate -H 'Content-Type: application/json' -d '{\"birthDate\":\"1990-05-15\",\"birthTime\":\"14:30\",\"birthPlace\":\"Berlin\",\"readingType\":\"basic\"}'" -ForegroundColor DarkGray
Write-Host ""

