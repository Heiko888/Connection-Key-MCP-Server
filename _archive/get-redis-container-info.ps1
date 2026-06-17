# Redis Container Informationen abrufen
# NUR LESEN - KEINE ÄNDERUNGEN!

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Redis Container Analyse" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$containerName = "hd_app_chart-redis-1"

# Pruefe ob Container existiert
Write-Host "[*] Pruefe Container..." -ForegroundColor Cyan
$container = docker ps -a --filter "name=$containerName" --format "{{.Names}}"
if (-not $container) {
    Write-Host "[FEHLER] Container $containerName nicht gefunden!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Container gefunden: $containerName" -ForegroundColor Green
Write-Host ""

# Container Status
Write-Host "[*] Container Status:" -ForegroundColor Cyan
docker ps -a --filter "name=$containerName" --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
Write-Host ""

# Docker-Compose Labels
Write-Host "[*] Docker-Compose Informationen:" -ForegroundColor Cyan
$labels = docker inspect $containerName --format='{{range $key, $value := .Config.Labels}}{{printf "%s=%s\n" $key $value}}{{end}}'
if ($labels) {
    $labels | Select-String -Pattern "compose" | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Gray
    }
} else {
    Write-Host "  Keine Docker-Compose Labels gefunden" -ForegroundColor Yellow
}
Write-Host ""

# Command
Write-Host "[*] Container Command:" -ForegroundColor Cyan
$cmd = docker inspect $containerName --format='{{.Config.Cmd}}'
Write-Host "  Cmd: $cmd" -ForegroundColor Gray
Write-Host ""

# Entrypoint
Write-Host "[*] Container Entrypoint:" -ForegroundColor Cyan
$entrypoint = docker inspect $containerName --format='{{.Config.Entrypoint}}'
Write-Host "  Entrypoint: $entrypoint" -ForegroundColor Gray
Write-Host ""

# Image
Write-Host "[*] Container Image:" -ForegroundColor Cyan
$image = docker inspect $containerName --format='{{.Config.Image}}'
Write-Host "  Image: $image" -ForegroundColor Gray
Write-Host ""

# Volumes
Write-Host "[*] Container Volumes:" -ForegroundColor Cyan
$binds = docker inspect $containerName --format='{{.HostConfig.Binds}}'
Write-Host "  Binds: $binds" -ForegroundColor Gray
Write-Host ""

# Ports
Write-Host "[*] Container Ports:" -ForegroundColor Cyan
$ports = docker inspect $containerName --format='{{range $p, $conf := .NetworkSettings.Ports}}{{$p}} -> {{(index $conf 0).HostPort}} {{end}}'
Write-Host "  Ports: $ports" -ForegroundColor Gray
Write-Host ""

# Environment Variables
Write-Host "[*] Environment Variables:" -ForegroundColor Cyan
$env = docker inspect $containerName --format='{{range .Config.Env}}{{println .}}{{end}}'
if ($env) {
    $env | Select-String -Pattern "REDIS|PASS|PASSWORD" | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Gray
    }
} else {
    Write-Host "  Keine relevanten Environment Variables gefunden" -ForegroundColor Yellow
}
Write-Host ""

# Vollständige Inspect-Informationen in Datei speichern
Write-Host "[*] Speichere vollständige Container-Informationen..." -ForegroundColor Cyan
docker inspect $containerName | Out-File -FilePath "redis-container-inspect.json" -Encoding UTF8
Write-Host "[OK] Informationen gespeichert in: redis-container-inspect.json" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Analyse abgeschlossen!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

