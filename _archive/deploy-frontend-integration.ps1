# Deploy Frontend-Integration zum CK-App Server
# Server: 167.235.224.149
# Pfad: /opt/hd-app/The-Connection-Key/frontend

$SERVER = "root@167.235.224.149"
$REMOTE_PATH = "/opt/hd-app/The-Connection-Key/frontend"
$LOCAL_INTEGRATION = "integration"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Frontend-Integration deployen" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Pruefe ob lokale Integration-Dateien existieren
if (-not (Test-Path $LOCAL_INTEGRATION)) {
    Write-Host "Fehler: Integration-Verzeichnis '$LOCAL_INTEGRATION' nicht gefunden!" -ForegroundColor Red
    exit 1
}

Write-Host "Lokale Integration-Dateien:" -ForegroundColor Yellow
Write-Host "  API-Routes: $LOCAL_INTEGRATION/api-routes/" -ForegroundColor Gray
Get-ChildItem -Path "$LOCAL_INTEGRATION/api-routes" -Filter "*.ts" | ForEach-Object {
    Write-Host "    - $($_.Name)" -ForegroundColor DarkGray
}
Write-Host "  Frontend-Komponenten: $LOCAL_INTEGRATION/frontend/components/" -ForegroundColor Gray
Get-ChildItem -Path "$LOCAL_INTEGRATION/frontend/components" -Filter "*.tsx" | ForEach-Object {
    Write-Host "    - $($_.Name)" -ForegroundColor DarkGray
}
Write-Host ""

# Schritt 1: API-Routes kopieren
Write-Host "Schritt 1: API-Routes zum Server kopieren..." -ForegroundColor Yellow

$apiRoutes = @(
    @{Source = "agents-marketing.ts"; Dest = "pages/api/agents/marketing.ts"},
    @{Source = "agents-automation.ts"; Dest = "pages/api/agents/automation.ts"},
    @{Source = "agents-sales.ts"; Dest = "pages/api/agents/sales.ts"},
    @{Source = "agents-social-youtube.ts"; Dest = "pages/api/agents/social-youtube.ts"},
    @{Source = "readings-generate.ts"; Dest = "pages/api/readings/generate.ts"}
)

foreach ($route in $apiRoutes) {
    $localFile = Join-Path "$LOCAL_INTEGRATION/api-routes" $route.Source
    $remoteFile = "$REMOTE_PATH/$($route.Dest)"
    
    if (Test-Path $localFile) {
        Write-Host "  Kopiere: $($route.Source) -> $($route.Dest)..." -ForegroundColor Gray -NoNewline
        
        # Erstelle Remote-Verzeichnis
        $remoteDir = Split-Path $remoteFile -Parent
        ssh $SERVER "mkdir -p $remoteDir" | Out-Null
        
        # Kopiere Datei
        scp $localFile "${SERVER}:${remoteFile}" | Out-Null
        
        if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq $null) {
            Write-Host " OK" -ForegroundColor Green
        } else {
            Write-Host " FEHLER" -ForegroundColor Red
        }
    } else {
        Write-Host "  Warnung: $localFile nicht gefunden" -ForegroundColor Yellow
    }
}

Write-Host ""

# Schritt 2: Frontend-Komponenten kopieren
Write-Host "Schritt 2: Frontend-Komponenten zum Server kopieren..." -ForegroundColor Yellow

$components = @(
    @{Source = "AgentChat.tsx"; Dest = "components/agents/AgentChat.tsx"},
    @{Source = "ReadingGenerator.tsx"; Dest = "components/agents/ReadingGenerator.tsx"}
)

foreach ($comp in $components) {
    $localFile = Join-Path "$LOCAL_INTEGRATION/frontend/components" $comp.Source
    $remoteFile = "$REMOTE_PATH/$($comp.Dest)"
    
    if (Test-Path $localFile) {
        Write-Host "  Kopiere: $($comp.Source) -> $($comp.Dest)..." -ForegroundColor Gray -NoNewline
        
        # Erstelle Remote-Verzeichnis
        $remoteDir = Split-Path $remoteFile -Parent
        ssh $SERVER "mkdir -p $remoteDir" | Out-Null
        
        # Kopiere Datei
        scp $localFile "${SERVER}:${remoteFile}" | Out-Null
        
        if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq $null) {
            Write-Host " OK" -ForegroundColor Green
        } else {
            Write-Host " FEHLER" -ForegroundColor Red
        }
    } else {
        Write-Host "  Warnung: $localFile nicht gefunden" -ForegroundColor Yellow
    }
}

Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fertig!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Naechste Schritte:" -ForegroundColor Yellow
Write-Host "  1. Environment Variables setzen auf Server" -ForegroundColor Gray
Write-Host "  2. CORS auf Hetzner Server konfigurieren" -ForegroundColor Gray
Write-Host "  3. Frontend neu bauen und starten" -ForegroundColor Gray
Write-Host ""
Write-Host "Siehe: FRONTEND_INTEGRATION_DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""

