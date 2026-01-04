# A4 – Manuelle Deployment-Schritte (PowerShell)
# Führe diese Befehle Schritt für Schritt aus

$HETZNER_SERVER = "138.199.237.34"
$CK_APP_SERVER = "167.235.224.149"
$BRANCH = "feature/reading-agent-option-a-complete"

Write-Host "🔥 A4 – System-Konsolidierung: Manuelle Deployment-Schritte" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# HETZNER SERVER (138.199.237.34)
# ============================================
Write-Host "📦 HETZNER SERVER ($HETZNER_SERVER)" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "1️⃣  Git Pull..." -ForegroundColor Gray
ssh root@$HETZNER_SERVER "cd /opt/mcp-connection-key; git pull origin $BRANCH"

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Git Pull erfolgreich" -ForegroundColor Green
} else {
    Write-Host "   ❌ Git Pull fehlgeschlagen" -ForegroundColor Red
    Write-Host "   ⚠️  Bitte manuell prüfen!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "2️⃣  chatgpt-agent Container stoppen und entfernen..." -ForegroundColor Gray
ssh root@$HETZNER_SERVER "docker stop chatgpt-agent 2>&1; docker rm chatgpt-agent 2>&1"

Write-Host ""
Write-Host "   Prüfe ob Container noch existiert..." -ForegroundColor Gray
$containerCheck = ssh root@$HETZNER_SERVER "docker ps -a | grep chatgpt-agent 2>&1"
if ($containerCheck -match "chatgpt-agent") {
    Write-Host "   ⚠️  Container existiert noch!" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Container entfernt" -ForegroundColor Green
}

Write-Host ""
Write-Host "3️⃣  Docker Compose neu laden..." -ForegroundColor Gray
ssh root@$HETZNER_SERVER "cd /opt/mcp-connection-key; docker compose up -d --remove-orphans"

Write-Host ""
Write-Host "4️⃣  Docker Status prüfen..." -ForegroundColor Gray
ssh root@$HETZNER_SERVER "cd /opt/mcp-connection-key; docker compose ps"

Write-Host ""
Write-Host "5️⃣  PM2 Reading-Agent starten/restarten..." -ForegroundColor Gray
$pm2Status = ssh root@$HETZNER_SERVER "cd /opt/mcp-connection-key/production; pm2 list | grep reading-agent 2>&1"
if ($pm2Status -match "reading-agent") {
    Write-Host "   Reading-Agent läuft bereits, restart..." -ForegroundColor Gray
    ssh root@$HETZNER_SERVER "cd /opt/mcp-connection-key/production; pm2 restart reading-agent --update-env"
} else {
    Write-Host "   Reading-Agent starten..." -ForegroundColor Gray
    ssh root@$HETZNER_SERVER "cd /opt/mcp-connection-key/production; pm2 start server.js --name reading-agent"
    ssh root@$HETZNER_SERVER "cd /opt/mcp-connection-key/production; pm2 save"
}

Write-Host ""
Write-Host "6️⃣  PM2 Status prüfen..." -ForegroundColor Gray
ssh root@$HETZNER_SERVER "pm2 status"

Write-Host ""
Write-Host "7️⃣  Port 4000 verifizieren..." -ForegroundColor Gray
$portCheck = ssh root@$HETZNER_SERVER "lsof -i :4000 2>&1 || netstat -tuln 2>&1 | grep 4000 || ss -tuln 2>&1 | grep 4000 || echo 'Port-Check fehlgeschlagen'"
Write-Host $portCheck

Write-Host ""
Write-Host "8️⃣  Health Check..." -ForegroundColor Gray
$healthCheck = ssh root@$HETZNER_SERVER "curl -s http://localhost:4000/health 2>&1"
Write-Host $healthCheck

if ($healthCheck -match '"status".*"ok"') {
    Write-Host "   ✅ Health Check erfolgreich" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Health Check fehlgeschlagen" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "   ✅ Hetzner Server Deployment abgeschlossen" -ForegroundColor Green
Write-Host ""

# ============================================
# CK-APP SERVER (167.235.224.149)
# ============================================
Write-Host "📦 CK-APP SERVER ($CK_APP_SERVER)" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "1️⃣  Prüfe Git-Repository..." -ForegroundColor Gray
$gitCheck = ssh root@$CK_APP_SERVER "cd /opt/hd-app/The-Connection-Key/frontend; git status 2>&1"

if ($gitCheck -match "not a git repository") {
    Write-Host "   ⚠️  Kein Git-Repository - kopiere Dateien manuell" -ForegroundColor Yellow
    
    Write-Host ""
    Write-Host "   Kopiere readings-generate.ts..." -ForegroundColor Gray
    $targetPath = "/opt/hd-app/The-Connection-Key/frontend/app/api/readings/generate.ts"
    
    # Prüfe ob Verzeichnis existiert
    $dirCheck = ssh root@$CK_APP_SERVER "test -d /opt/hd-app/The-Connection-Key/frontend/app/api/readings && echo 'exists' || echo 'missing'"
    
    if ($dirCheck -match "missing") {
        Write-Host "   Erstelle Verzeichnis..." -ForegroundColor Gray
        ssh root@$CK_APP_SERVER "mkdir -p /opt/hd-app/The-Connection-Key/frontend/app/api/readings"
    }
    
    scp integration/api-routes/readings-generate.ts root@${CK_APP_SERVER}:${targetPath}
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Datei kopiert" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Fehler beim Kopieren" -ForegroundColor Red
    }
} else {
    Write-Host "   Git Pull..." -ForegroundColor Gray
    ssh root@$CK_APP_SERVER "cd /opt/hd-app/The-Connection-Key/frontend; git pull origin $BRANCH"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Git Pull erfolgreich" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Git Pull fehlgeschlagen" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "2️⃣  Frontend Container neu bauen..." -ForegroundColor Gray
ssh root@$CK_APP_SERVER "cd /opt/hd-app/The-Connection-Key; docker compose stop frontend"
ssh root@$CK_APP_SERVER "cd /opt/hd-app/The-Connection-Key; docker compose build --no-cache frontend"
ssh root@$CK_APP_SERVER "cd /opt/hd-app/The-Connection-Key; docker compose up -d frontend"

Write-Host ""
Write-Host "3️⃣  Container Status prüfen..." -ForegroundColor Gray
ssh root@$CK_APP_SERVER "cd /opt/hd-app/The-Connection-Key; docker compose ps frontend"

Write-Host ""
Write-Host "4️⃣  Logs prüfen (letzte 20 Zeilen)..." -ForegroundColor Gray
ssh root@$CK_APP_SERVER "cd /opt/hd-app/The-Connection-Key; docker compose logs frontend --tail 20"

Write-Host ""
Write-Host "   ✅ CK-App Server Deployment abgeschlossen" -ForegroundColor Green
Write-Host ""

# ============================================
# ZUSAMMENFASSUNG
# ============================================
Write-Host "✅ Deployment abgeschlossen!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Nächste Schritte:" -ForegroundColor Cyan
Write-Host "   1. Prüfe Logs auf beiden Servern" -ForegroundColor Gray
Write-Host "   2. Teste API-Endpoints" -ForegroundColor Gray
Write-Host "   3. Prüfe Frontend im Browser" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  WICHTIG: Supabase Migration 019 noch ausfuehren!" -ForegroundColor Yellow
Write-Host "   - Im Supabase Dashboard: SQL Editor" -ForegroundColor Gray
Write-Host "   - Datei: integration/supabase/migrations/019_add_agent_metadata_to_readings.sql" -ForegroundColor Gray
Write-Host ""
