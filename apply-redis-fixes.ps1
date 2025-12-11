# ============================================
# Redis Docker-Compose Fixes anwenden
# ============================================
# Kopiert Dateien auf Server und wendet Fixes an
# ============================================

param(
    [string]$Server = "root@ubuntu-8gb-fsn1-1",
    [string]$ServerPath = "/opt/hd-app/The-Connection-Key",
    [string]$RedisPassword = "IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Redis Docker-Compose Fixes anwenden" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Pruefe ob Dateien existieren
if (-not (Test-Path "redis.conf")) {
    Write-Host "[FEHLER] redis.conf nicht gefunden!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "docker-compose-redis-fixed.yml")) {
    Write-Host "[FEHLER] docker-compose-redis-fixed.yml nicht gefunden!" -ForegroundColor Red
    exit 1
}

Write-Host "[*] Kopiere Dateien auf Server..." -ForegroundColor Cyan

# Kopiere redis.conf
Write-Host "  - redis.conf..." -ForegroundColor Gray
$scpRedis = scp redis.conf "${Server}:${ServerPath}/redis.conf" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] redis.conf kopiert" -ForegroundColor Green
} else {
    Write-Host "  [FEHLER] redis.conf konnte nicht kopiert werden: $scpRedis" -ForegroundColor Red
    exit 1
}

# Kopiere docker-compose.yml
Write-Host "  - docker-compose.yml..." -ForegroundColor Gray
$scpCompose = scp docker-compose-redis-fixed.yml "${Server}:${ServerPath}/docker-compose.yml" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] docker-compose.yml kopiert" -ForegroundColor Green
} else {
    Write-Host "  [FEHLER] docker-compose.yml konnte nicht kopiert werden: $scpCompose" -ForegroundColor Red
    exit 1
}

# Kopiere Fix-Skript
Write-Host "  - apply-redis-fixes.sh..." -ForegroundColor Gray
$scpScript = scp apply-redis-fixes.sh "${Server}:/tmp/apply-redis-fixes.sh" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Fix-Skript kopiert" -ForegroundColor Green
} else {
    Write-Host "  [FEHLER] Fix-Skript konnte nicht kopiert werden: $scpScript" -ForegroundColor Red
    exit 1
}

Write-Host ""

Write-Host "[*] Fuehre Fixes auf Server aus..." -ForegroundColor Cyan

# SSH-Befehle ausfuehren
$sshCommands = @"
cd $ServerPath
chmod +x /tmp/apply-redis-fixes.sh
/tmp/apply-redis-fixes.sh
"@

$sshResult = ssh $Server $sshCommands 2>&1

Write-Host $sshResult

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Fixes erfolgreich angewendet!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[FEHLER] Fixes konnten nicht angewendet werden!" -ForegroundColor Red
    Write-Host "Bitte manuell auf Server ausfuehren:" -ForegroundColor Yellow
    Write-Host "  ssh $Server" -ForegroundColor Gray
    Write-Host "  cd $ServerPath" -ForegroundColor Gray
    Write-Host "  /tmp/apply-redis-fixes.sh" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fertig!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

