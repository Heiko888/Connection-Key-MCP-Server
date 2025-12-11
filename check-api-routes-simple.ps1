# Prüfe API-Routes Konfiguration - Einfache Version

$SERVER = "root@167.235.224.149"
$FRONTEND_PATH = "/opt/hd-app/The-Connection-Key/frontend"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API-Routes Konfiguration prüfen" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Prüfe Environment Variables
Write-Host "1. Environment Variables prüfen..." -ForegroundColor Yellow
Write-Host ""

$envResult = ssh $SERVER "cat $FRONTEND_PATH/.env.local 2>/dev/null | grep -E 'MCP_SERVER_URL|READING_AGENT_URL' || echo 'NICHT_GEFUNDEN'"

if ($envResult -match "NICHT_GEFUNDEN" -or $envResult -eq "") {
    Write-Host "  ❌ Environment Variables fehlen" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Lösung: Environment Variables hinzufügen" -ForegroundColor Yellow
    Write-Host "    ssh $SERVER" -ForegroundColor Gray
    Write-Host "    cd $FRONTEND_PATH" -ForegroundColor Gray
    Write-Host "    echo 'MCP_SERVER_URL=http://138.199.237.34:7000' >> .env.local" -ForegroundColor DarkGray
    Write-Host "    echo 'READING_AGENT_URL=http://138.199.237.34:4001' >> .env.local" -ForegroundColor DarkGray
} else {
    Write-Host "  ✅ Environment Variables vorhanden:" -ForegroundColor Green
    $envResult -split "`n" | ForEach-Object {
        if ($_ -ne "") {
            Write-Host "    $_" -ForegroundColor Gray
        }
    }
}

Write-Host ""

# Prüfe API-Routes
Write-Host "2. API-Routes prüfen..." -ForegroundColor Yellow
Write-Host ""

$routes = @(
    "app/api/agents/marketing/route.ts",
    "app/api/agents/automation/route.ts",
    "app/api/agents/sales/route.ts",
    "app/api/agents/social-youtube/route.ts",
    "app/api/reading/generate/route.ts"
)

foreach ($route in $routes) {
    $routeName = Split-Path $route -Leaf
    $routeDir = Split-Path $route -Parent
    $fullPath = "$FRONTEND_PATH/$route"
    
    Write-Host "  Prüfe: $routeName..." -ForegroundColor Gray -NoNewline
    
    $exists = ssh $SERVER "test -f $fullPath && echo 'OK' || echo 'FEHLT'"
    
    if ($exists -match "OK") {
        Write-Host " ✅" -ForegroundColor Green
    } else {
        Write-Host " ❌" -ForegroundColor Red
    }
}

Write-Host ""

# Zusammenfassung
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Zusammenfassung" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Naechste Schritte:" -ForegroundColor Yellow
Write-Host "  1. Falls Environment Variables fehlen:" -ForegroundColor Gray
Write-Host "     ssh $SERVER" -ForegroundColor DarkGray
Write-Host "     cd $FRONTEND_PATH" -ForegroundColor DarkGray
Write-Host "     nano .env.local" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  2. Frontend neu starten:" -ForegroundColor Gray
Write-Host "     pm2 restart the-connection-key" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  3. Testen:" -ForegroundColor Gray
Write-Host "     curl -X POST https://www.the-connection-key.de/api/agents/marketing \" -ForegroundColor DarkGray
Write-Host "       -H 'Content-Type: application/json' \" -ForegroundColor DarkGray
Write-Host "       -d '{\"message\": \"Test\"}'" -ForegroundColor DarkGray
Write-Host ""

