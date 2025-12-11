# ============================================
# Redis Server Status prüfen (PowerShell)
# ============================================

Write-Host "[*] Pruefe Redis Server..." -ForegroundColor Cyan
Write-Host ""

# Pruefe ob Redis lokal installiert ist
$redisCli = Get-Command redis-cli -ErrorAction SilentlyContinue

if ($redisCli) {
    Write-Host "[OK] redis-cli gefunden" -ForegroundColor Green
    Write-Host ""
    
    # Pruefe Redis-Verbindung
    Write-Host "[*] Pruefe Redis-Verbindung..." -ForegroundColor Cyan
    try {
        $pingResult = redis-cli ping 2>&1
        if ($pingResult -match "PONG") {
            Write-Host "[OK] Redis Server laeuft!" -ForegroundColor Green
            Write-Host ""
            
            # Zeige Redis-Info
            Write-Host "[*] Redis-Informationen:" -ForegroundColor Cyan
            Write-Host "===================="
            redis-cli info server | Select-String -Pattern "redis_version|os|process_id|uptime_in_seconds"
            Write-Host ""
            
            # Zeige Redis-Stats
            Write-Host "[*] Redis-Statistiken:" -ForegroundColor Cyan
            Write-Host "===================="
            redis-cli info stats | Select-String -Pattern "total_connections_received|total_commands_processed|keyspace"
            Write-Host ""
            
            # Pruefe Keys
            Write-Host "[*] Anzahl gespeicherter Keys:" -ForegroundColor Cyan
            redis-cli dbsize
            Write-Host ""
            
            # Pruefe Memory
            Write-Host "[*] Memory-Verbrauch:" -ForegroundColor Cyan
            redis-cli info memory | Select-String -Pattern "used_memory_human|used_memory_peak_human|maxmemory_human"
            Write-Host ""
        } else {
            Write-Host "[FEHLER] Redis Server laeuft NICHT oder ist nicht erreichbar" -ForegroundColor Red
        }
    } catch {
        Write-Host "[FEHLER] Fehler beim Verbinden mit Redis: $_" -ForegroundColor Red
    }
} else {
    Write-Host "[WARNUNG] redis-cli nicht gefunden" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Redis ist nicht lokal installiert." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Installation:" -ForegroundColor Cyan
    Write-Host "  Windows: Download von https://redis.io/download oder WSL verwenden"
    Write-Host "  Oder: Docker Container verwenden"
}

# Pruefe Docker Redis Container
Write-Host ""
Write-Host "[*] Pruefe Docker Redis Container..." -ForegroundColor Cyan
try {
    $dockerRedis = docker ps -a 2>&1 | Select-String -Pattern "redis"
    if ($dockerRedis) {
        Write-Host "[OK] Redis Container gefunden:" -ForegroundColor Green
        docker ps -a | Select-String -Pattern "redis"
        Write-Host ""
        
        # Pruefe ob Container laeuft
        $runningRedis = docker ps 2>&1 | Select-String -Pattern "redis"
        if ($runningRedis) {
            Write-Host "[OK] Redis Container laeuft!" -ForegroundColor Green
            
            # Zeige Redis-Info aus Container
            $containerId = (docker ps | Select-String -Pattern "redis").ToString().Split()[0]
            Write-Host ""
            Write-Host "[*] Redis-Informationen (Container):" -ForegroundColor Cyan
            docker exec $containerId redis-cli info server | Select-String -Pattern "redis_version|os"
            Write-Host ""
            Write-Host "[*] Anzahl Keys:" -ForegroundColor Cyan
            docker exec $containerId redis-cli dbsize
        } else {
            Write-Host "[WARNUNG] Redis Container ist gestoppt" -ForegroundColor Yellow
            Write-Host "   Starte mit: docker start <container-name>" -ForegroundColor Yellow
        }
    } else {
        Write-Host "[INFO] Kein Redis Container gefunden" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[WARNUNG] Docker nicht verfuegbar oder Fehler: $_" -ForegroundColor Yellow
}

# Pruefe docker-compose.yml fuer Redis
Write-Host ""
Write-Host "[*] Pruefe docker-compose.yml fuer Redis..." -ForegroundColor Cyan
if (Test-Path "docker-compose.yml") {
    $composeContent = Get-Content "docker-compose.yml" -Raw
    if ($composeContent -match "redis") {
        Write-Host "[OK] Redis in docker-compose.yml gefunden" -ForegroundColor Green
        Write-Host ""
        Write-Host "Redis Service:" -ForegroundColor Cyan
        Get-Content "docker-compose.yml" | Select-String -Pattern "redis" -Context 0,10
    } else {
        Write-Host "[INFO] Redis nicht in docker-compose.yml konfiguriert" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "[TIP] Redis kann fuer Caching und Session-Management hinzugefuegt werden" -ForegroundColor Cyan
    }
} else {
    Write-Host "[WARNUNG] docker-compose.yml nicht gefunden" -ForegroundColor Yellow
}

# Pruefe ob Redis auf Hetzner Server laeuft (wenn SSH verfuegbar)
Write-Host ""
Write-Host "[*] Pruefe Hetzner Server (138.199.237.34)..." -ForegroundColor Cyan
Write-Host "   (Nur wenn SSH-Zugriff konfiguriert ist)" -ForegroundColor Gray

Write-Host ""
Write-Host "[OK] Pruefung abgeschlossen!" -ForegroundColor Green

