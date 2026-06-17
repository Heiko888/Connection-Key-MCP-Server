# ============================================
# Redis Sicherheits-Fixes anwenden
# ============================================
# WICHTIG: Dieses Skript setzt kritische Sicherheitsmaßnahmen um
# ============================================

param(
    [string]$ContainerName = "hd_app_chart-redis-1",
    [string]$RedisPassword = "",
    [switch]$DryRun = $false
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Redis Sicherheits-Fixes" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "[DRY-RUN] Nur Pruefung, keine Aenderungen" -ForegroundColor Yellow
    Write-Host ""
}

# Pruefe ob Container existiert
Write-Host "[*] Pruefe Container..." -ForegroundColor Cyan
$containerExists = docker ps -a --format "{{.Names}}" | Select-String -Pattern $ContainerName
if (-not $containerExists) {
    Write-Host "[FEHLER] Container $ContainerName nicht gefunden!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Container gefunden: $ContainerName" -ForegroundColor Green
Write-Host ""

# Pruefe ob Redis laeuft
Write-Host "[*] Pruefe Redis-Verbindung..." -ForegroundColor Cyan
try {
    $pingResult = docker exec $ContainerName redis-cli ping 2>&1
    if ($pingResult -match "PONG") {
        Write-Host "[OK] Redis laeuft" -ForegroundColor Green
    } else {
        Write-Host "[FEHLER] Redis antwortet nicht!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[FEHLER] Kann nicht mit Redis verbinden: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 1. Passwort setzen
Write-Host "[*] Fix 1: Passwort setzen..." -ForegroundColor Cyan
if ([string]::IsNullOrEmpty($RedisPassword)) {
    Write-Host "[WARNUNG] Kein Passwort angegeben!" -ForegroundColor Yellow
    Write-Host "   Bitte Passwort eingeben oder -RedisPassword Parameter verwenden" -ForegroundColor Yellow
    
    if (-not $DryRun) {
        $securePassword = Read-Host "Redis Passwort eingeben" -AsSecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
        $RedisPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    } else {
        Write-Host "[DRY-RUN] Passwort wuerde gesetzt werden" -ForegroundColor Yellow
        $RedisPassword = "DRY-RUN-PASSWORD"
    }
}

if (-not $DryRun -and -not [string]::IsNullOrEmpty($RedisPassword)) {
    try {
        docker exec $ContainerName redis-cli CONFIG SET requirepass $RedisPassword | Out-Null
        Write-Host "[OK] Passwort gesetzt" -ForegroundColor Green
    } catch {
        Write-Host "[FEHLER] Konnte Passwort nicht setzen: $_" -ForegroundColor Red
    }
} else {
    Write-Host "[DRY-RUN] Passwort wuerde gesetzt werden" -ForegroundColor Yellow
}
Write-Host ""

# 2. Protected Mode aktivieren
Write-Host "[*] Fix 2: Protected Mode aktivieren..." -ForegroundColor Cyan
if (-not $DryRun) {
    try {
        if (-not [string]::IsNullOrEmpty($RedisPassword)) {
            docker exec $ContainerName redis-cli -a $RedisPassword CONFIG SET protected-mode yes | Out-Null
        } else {
            docker exec $ContainerName redis-cli CONFIG SET protected-mode yes | Out-Null
        }
        Write-Host "[OK] Protected Mode aktiviert" -ForegroundColor Green
    } catch {
        Write-Host "[FEHLER] Konnte Protected Mode nicht aktivieren: $_" -ForegroundColor Red
    }
} else {
    Write-Host "[DRY-RUN] Protected Mode wuerde aktiviert werden" -ForegroundColor Yellow
}
Write-Host ""

# 3. Gefaehrliche Befehle umbenennen
Write-Host "[*] Fix 3: Gefaehrliche Befehle umbenennen..." -ForegroundColor Cyan
$dangerousCommands = @(
    @{Name="FLUSHALL"; Action="deaktivieren"},
    @{Name="FLUSHDB"; Action="deaktivieren"},
    @{Name="CONFIG"; Action="umbenennen"},
    @{Name="SHUTDOWN"; Action="umbenennen"},
    @{Name="DEBUG"; Action="deaktivieren"}
)

foreach ($cmd in $dangerousCommands) {
    if (-not $DryRun) {
        try {
            $redisCli = if (-not [string]::IsNullOrEmpty($RedisPassword)) {
                "docker exec $ContainerName redis-cli -a $RedisPassword"
            } else {
                "docker exec $ContainerName redis-cli"
            }
            
            if ($cmd.Action -eq "deaktivieren") {
                Invoke-Expression "$redisCli CONFIG SET rename-command-$($cmd.Name) ''" | Out-Null
                Write-Host "  [OK] $($cmd.Name) deaktiviert" -ForegroundColor Green
            } elseif ($cmd.Action -eq "umbenennen") {
                $newName = "$($cmd.Name)_$(Get-Random -Minimum 100000 -Maximum 999999)"
                Invoke-Expression "$redisCli CONFIG SET rename-command-$($cmd.Name) $newName" | Out-Null
                Write-Host "  [OK] $($cmd.Name) umbenannt zu $newName" -ForegroundColor Green
            }
        } catch {
            Write-Host "  [FEHLER] Konnte $($cmd.Name) nicht aendern: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  [DRY-RUN] $($cmd.Name) wuerde $($cmd.Action) werden" -ForegroundColor Yellow
    }
}
Write-Host ""

# 4. Max Memory setzen
Write-Host "[*] Fix 4: Max Memory setzen..." -ForegroundColor Cyan
if (-not $DryRun) {
    try {
        $redisCli = if (-not [string]::IsNullOrEmpty($RedisPassword)) {
            "docker exec $ContainerName redis-cli -a $RedisPassword"
        } else {
            "docker exec $ContainerName redis-cli"
        }
        
        Invoke-Expression "$redisCli CONFIG SET maxmemory 512mb" | Out-Null
        Invoke-Expression "$redisCli CONFIG SET maxmemory-policy allkeys-lru" | Out-Null
        Write-Host "[OK] Max Memory auf 512MB gesetzt" -ForegroundColor Green
    } catch {
        Write-Host "[FEHLER] Konnte Max Memory nicht setzen: $_" -ForegroundColor Red
    }
} else {
    Write-Host "[DRY-RUN] Max Memory wuerde auf 512MB gesetzt werden" -ForegroundColor Yellow
}
Write-Host ""

# 5. ACL: Default User deaktivieren
Write-Host "[*] Fix 5: Default User deaktivieren..." -ForegroundColor Cyan
Write-Host "[WARNUNG] Dies erfordert einen neuen Admin-User!" -ForegroundColor Yellow
Write-Host "   Bitte manuell durchfuehren:" -ForegroundColor Yellow
Write-Host "   docker exec $ContainerName redis-cli -a $RedisPassword ACL SETUSER default off" -ForegroundColor Gray
Write-Host "   docker exec $ContainerName redis-cli -a $RedisPassword ACL SETUSER admin on >Admin-Passwort ~* &* +@all" -ForegroundColor Gray
Write-Host ""

# Zusammenfassung
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Zusammenfassung" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "[INFO] Dry-Run abgeschlossen. Keine Aenderungen vorgenommen." -ForegroundColor Yellow
    Write-Host "   Fuehren Sie das Skript ohne -DryRun aus, um Aenderungen anzuwenden." -ForegroundColor Yellow
} else {
    Write-Host "[OK] Sicherheits-Fixes angewendet!" -ForegroundColor Green
    Write-Host ""
    Write-Host "[WICHTIG] Naechste Schritte:" -ForegroundColor Yellow
    Write-Host "1. Passwort in .env Datei speichern: REDIS_PASSWORD=$RedisPassword" -ForegroundColor White
    Write-Host "2. Container neu starten, damit Aenderungen persistent sind" -ForegroundColor White
    Write-Host "3. ACL-User manuell konfigurieren (siehe oben)" -ForegroundColor White
    Write-Host "4. Bind auf localhost beschraenken (docker-compose.yml anpassen)" -ForegroundColor White
    Write-Host ""
    Write-Host "[HINWEIS] Aenderungen sind nur temporaer!" -ForegroundColor Yellow
    Write-Host "   Fuer persistente Aenderungen: redis.conf erstellen und Container neu starten" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Detaillierte Analyse: Siehe REDIS_SECURITY_AUDIT.md" -ForegroundColor Cyan

