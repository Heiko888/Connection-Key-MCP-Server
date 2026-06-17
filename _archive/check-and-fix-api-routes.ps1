# Prüfe und korrigiere API-Routes Konfiguration auf CK-App Server
# Server: 167.235.224.149

$SERVER = "root@167.235.224.149"
$FRONTEND_PATH = "/opt/hd-app/The-Connection-Key/frontend"
$MCP_SERVER_URL = "http://138.199.237.34:7000"
$READING_AGENT_URL = "http://138.199.237.34:4001"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API-Routes Konfiguration prüfen und korrigieren" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Schritt 1: Prüfe Environment Variables
Write-Host "Schritt 1: Environment Variables prüfen..." -ForegroundColor Yellow

$envCheck = ssh $SERVER "if [ -f $FRONTEND_PATH/.env.local ]; then grep -E '^MCP_SERVER_URL=|^READING_AGENT_URL=' $FRONTEND_PATH/.env.local 2>/dev/null || echo 'FEHLT'; else echo 'FEHLT'; fi"

if ($envCheck -match "FEHLT" -or $envCheck -eq "") {
    Write-Host "  ❌ Environment Variables fehlen" -ForegroundColor Red
    Write-Host "  Erstelle .env.local..." -ForegroundColor Yellow
    
    # Erstelle .env.local mit den Variablen
    $envContent = @"
# MCP Server (für Agenten 1-4)
MCP_SERVER_URL=$MCP_SERVER_URL
NEXT_PUBLIC_MCP_SERVER_URL=$MCP_SERVER_URL

# Reading Agent (für Agent 5)
READING_AGENT_URL=$READING_AGENT_URL
NEXT_PUBLIC_READING_AGENT_URL=$READING_AGENT_URL
"@
    
    ssh $SERVER "echo '$envContent' >> $FRONTEND_PATH/.env.local" | Out-Null
    
    Write-Host "  ✅ Environment Variables hinzugefügt" -ForegroundColor Green
} else {
    Write-Host "  ✅ Environment Variables vorhanden:" -ForegroundColor Green
    $envCheck -split "`n" | ForEach-Object {
        if ($_ -match "MCP_SERVER_URL|READING_AGENT_URL") {
            Write-Host "    $_" -ForegroundColor Gray
        }
    }
}

Write-Host ""

# Schritt 2: Prüfe API-Routes
Write-Host "Schritt 2: API-Routes prüfen..." -ForegroundColor Yellow

$routes = @(
    @{Name = "Marketing"; Path = "app/api/agents/marketing/route.ts"; Var = "MCP_SERVER_URL"},
    @{Name = "Automation"; Path = "app/api/agents/automation/route.ts"; Var = "MCP_SERVER_URL"},
    @{Name = "Sales"; Path = "app/api/agents/sales/route.ts"; Var = "MCP_SERVER_URL"},
    @{Name = "Social-YouTube"; Path = "app/api/agents/social-youtube/route.ts"; Var = "MCP_SERVER_URL"},
    @{Name = "Reading"; Path = "app/api/reading/generate/route.ts"; Var = "READING_AGENT_URL"}
)

$allRoutesOK = $true

foreach ($route in $routes) {
    $routePath = "$FRONTEND_PATH/$($route.Path)"
    
    # Prüfe ob Datei existiert
    $exists = ssh $SERVER "test -f $routePath && echo 'EXISTS' || echo 'MISSING'"
    
    if ($exists -match "MISSING") {
        Write-Host "  ❌ $($route.Name): Datei nicht gefunden" -ForegroundColor Red
        $allRoutesOK = $false
        continue
    }
    
    # Prüfe ob URL korrekt ist
    $urlCheck = ssh $SERVER "grep -E '$($route.Var)|138.199.237.34' $routePath 2>/dev/null | head -1"
    
    if ($urlCheck -match $route.Var -or $urlCheck -match "138.199.237.34") {
        Write-Host "  ✅ $($route.Name): Konfiguration OK" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $($route.Name): Konfiguration unklar" -ForegroundColor Yellow
        Write-Host "     Prüfe manuell: $routePath" -ForegroundColor DarkGray
    }
}

Write-Host ""

# Schritt 3: Zusammenfassung
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Zusammenfassung" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($allRoutesOK) {
    Write-Host "✅ Alle API-Routes vorhanden" -ForegroundColor Green
} else {
    Write-Host "⚠️  Einige API-Routes fehlen oder sind unklar" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Naechste Schritte:" -ForegroundColor Yellow
Write-Host "  1. Frontend neu starten (falls .env.local geaendert):" -ForegroundColor Gray
Write-Host "     ssh $SERVER 'cd $FRONTEND_PATH && pm2 restart the-connection-key'" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  2. API-Routes testen:" -ForegroundColor Gray
Write-Host "     curl -X POST https://www.the-connection-key.de/api/agents/marketing \" -ForegroundColor DarkGray
Write-Host "       -H 'Content-Type: application/json' \" -ForegroundColor DarkGray
Write-Host "       -d '{\"message\": \"Test\"}'" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Siehe: FRONTEND_API_ROUTES_PRÜFUNG.md" -ForegroundColor Cyan

