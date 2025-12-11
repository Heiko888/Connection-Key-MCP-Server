# Deployment Script für Website-UX-Agent API Route (PowerShell)
# Kopiert die Route auf den Server und baut den Container neu

$SERVER = "root@167.235.224.149"
$SERVER_PATH = "/opt/hd-app/The-Connection-Key"
$ROUTE_SOURCE = "integration/api-routes/app-router/agents/website-ux-agent/route.ts"
$ROUTE_TARGET = "$SERVER_PATH/frontend/app/api/agents/website-ux-agent/route.ts"

Write-Host "🚀 Deploy Website-UX-Agent API Route" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Prüfe ob lokale Datei existiert
if (-not (Test-Path $ROUTE_SOURCE)) {
    Write-Host "❌ Fehler: Route-Datei nicht gefunden: $ROUTE_SOURCE" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Lokale Datei gefunden: $ROUTE_SOURCE" -ForegroundColor Green

# Erstelle Verzeichnis auf Server
Write-Host "📁 Erstelle Verzeichnis auf Server..." -ForegroundColor Yellow
ssh $SERVER "mkdir -p $SERVER_PATH/frontend/app/api/agents/website-ux-agent"

# Kopiere Datei auf Server
Write-Host "📤 Kopiere Route-Datei auf Server..." -ForegroundColor Yellow
scp $ROUTE_SOURCE "${SERVER}:${ROUTE_TARGET}"

# Prüfe ob Datei kopiert wurde
Write-Host "🔍 Prüfe ob Datei auf Server existiert..." -ForegroundColor Yellow
ssh $SERVER "test -f $ROUTE_TARGET && echo '✅ Datei erfolgreich kopiert' || echo '❌ Datei nicht gefunden'"

# Container neu bauen
Write-Host "🔨 Baue Frontend-Container neu..." -ForegroundColor Yellow
ssh $SERVER "cd $SERVER_PATH && docker compose build --no-cache frontend"

# Container neu starten
Write-Host "🔄 Starte Frontend-Container neu..." -ForegroundColor Yellow
ssh $SERVER "cd $SERVER_PATH && docker compose up -d frontend"

# Warte 15 Sekunden
Write-Host "⏳ Warte 15 Sekunden..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Teste API
Write-Host "🧪 Teste API..." -ForegroundColor Yellow
Write-Host ""
Write-Host "GET Request:" -ForegroundColor Cyan
ssh $SERVER "curl -s -X GET http://localhost:3000/api/agents/website-ux-agent | head -20"
Write-Host ""
Write-Host ""
Write-Host "POST Request (Test):" -ForegroundColor Cyan
ssh $SERVER "curl -s -X POST http://localhost:3000/api/agents/website-ux-agent -H 'Content-Type: application/json' -d '{\"message\": \"Test\", \"userId\": \"test\"}' | head -50"

Write-Host ""
Write-Host "✅ Deployment abgeschlossen!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Nächste Schritte:" -ForegroundColor Cyan
Write-Host "1. Prüfe Container-Logs: docker compose logs frontend"
Write-Host "2. Teste API: curl -X POST http://localhost:3000/api/agents/website-ux-agent -H 'Content-Type: application/json' -d '{\"message\": \"Test\"}'"
