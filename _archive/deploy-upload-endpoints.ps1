# Deploy Upload-Endpoints zum CK-App Server

$SERVER = "root@167.235.224.149"
$REMOTE_PATH = "/opt/hd-app/The-Connection-Key/frontend/app/api/admin"
$LOCAL_PATH = "integration/api-routes"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Upload-Endpoints deployen" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Pruefe ob lokale Dateien existieren
if (-not (Test-Path "$LOCAL_PATH/admin-upload")) {
    Write-Host "Fehler: Upload-Endpoints nicht gefunden!" -ForegroundColor Red
    exit 1
}

Write-Host "Lokale Upload-Endpoints:" -ForegroundColor Yellow
Get-ChildItem -Path "$LOCAL_PATH" -Filter "admin-upload*" -Directory | ForEach-Object {
    Write-Host "  - $($_.Name)/route.ts" -ForegroundColor Gray
}
Write-Host ""

# Upload-Endpoints kopieren
Write-Host "Kopiere Upload-Endpoints zum Server..." -ForegroundColor Yellow

$endpoints = @(
    @{Source = "admin-upload/route.ts"; Dest = "upload/route.ts"},
    @{Source = "admin-upload-workflow/route.ts"; Dest = "upload-workflow/route.ts"},
    @{Source = "admin-upload-knowledge/route.ts"; Dest = "upload-knowledge/route.ts"}
)

$successCount = 0
$errorCount = 0

foreach ($endpoint in $endpoints) {
    $localFile = Join-Path $LOCAL_PATH $endpoint.Source
    $remoteFile = "$REMOTE_PATH/$($endpoint.Dest)"
    
    if (Test-Path $localFile) {
        Write-Host "  Kopiere: $($endpoint.Source) -> $($endpoint.Dest)..." -ForegroundColor Gray -NoNewline
        
        # Erstelle Remote-Verzeichnis
        $remoteDir = Split-Path $remoteFile -Parent
        ssh $SERVER "mkdir -p $remoteDir" | Out-Null
        
        # Kopiere Datei
        scp $localFile "${SERVER}:${remoteFile}" | Out-Null
        
        if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq $null) {
            Write-Host " OK" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " FEHLER" -ForegroundColor Red
            $errorCount++
        }
    } else {
        Write-Host "  Warnung: $localFile nicht gefunden" -ForegroundColor Yellow
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
Write-Host "  1. Environment Variables setzen (optional):" -ForegroundColor Gray
Write-Host "     ADMIN_API_KEY=your-secret-key" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  2. Frontend neu starten:" -ForegroundColor Gray
Write-Host "     ssh $SERVER 'cd /opt/hd-app/The-Connection-Key/frontend && pm2 restart the-connection-key'" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  3. Upload-Endpoints testen:" -ForegroundColor Gray
Write-Host "     curl -X POST https://www.the-connection-key.de/api/admin/upload \" -ForegroundColor DarkGray
Write-Host "       -H 'x-api-key: YOUR_API_KEY' \" -ForegroundColor DarkGray
Write-Host "       -F 'file=@test.txt'" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Siehe: UPLOAD_ENDPOINT_ERSTELLT.md" -ForegroundColor Cyan

