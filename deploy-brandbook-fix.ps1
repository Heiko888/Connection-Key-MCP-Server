# ============================================
# Brand Book Integration Fix - Deployment
# ============================================
# Kopiert aktualisierte server.js auf Server und startet Agent neu
# ============================================

$server = "root@167.235.224.149"
$hetznerServer = "root@138.199.237.34"
$serverPath = "/opt/mcp-connection-key/production"
$localServerFile = "production\server.js"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Brand Book Integration Fix - Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Setze Encoding
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Prüfe ob server.js existiert
if (-not (Test-Path $localServerFile)) {
    Write-Host "❌ server.js nicht gefunden: $localServerFile" -ForegroundColor Red
    exit 1
}

Write-Host "[*] Prüfe Server-Verbindung..." -ForegroundColor Yellow
Write-Host ""

# Prüfe Hetzner Server Verbindung
Write-Host "  Test 1: Hetzner Server (Reading Agent)" -ForegroundColor Gray
try {
    $hetznerTest = ssh $hetznerServer "echo 'OK'" 2>&1
    if ($hetznerTest -match "OK") {
        Write-Host "  ✅ Hetzner Server erreichbar" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Hetzner Server nicht erreichbar" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ❌ Verbindungsfehler: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Schritt 1: Backup erstellen
Write-Host "[*] Schritt 1: Backup erstellen..." -ForegroundColor Yellow
Write-Host ""

try {
    $backupResult = ssh $hetznerServer "cd $serverPath && cp server.js server.js.backup-$(date +%Y%m%d-%H%M%S)" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Backup erstellt" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Backup konnte nicht erstellt werden: $backupResult" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠️  Backup-Fehler: $_" -ForegroundColor Yellow
}

Write-Host ""

# Schritt 2: server.js auf Server kopieren
Write-Host "[*] Schritt 2: server.js auf Server kopieren..." -ForegroundColor Yellow
Write-Host ""

try {
    Write-Host "  Kopiere $localServerFile → ${hetznerServer}:${serverPath}/server.js" -ForegroundColor Gray
    $scpResult = scp $localServerFile "${hetznerServer}:${serverPath}/server.js" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ server.js erfolgreich kopiert" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Fehler beim Kopieren: $scpResult" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ❌ Fehler: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Schritt 3: Prüfe ob Reading Agent läuft
Write-Host "[*] Schritt 3: Prüfe Reading Agent Status..." -ForegroundColor Yellow
Write-Host ""

try {
    $pm2Status = ssh $hetznerServer "pm2 list | grep reading-agent" 2>&1
    if ($pm2Status -match "reading-agent") {
        Write-Host "  ✅ Reading Agent läuft" -ForegroundColor Green
        Write-Host "  Status: $pm2Status" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠️  Reading Agent läuft nicht" -ForegroundColor Yellow
        Write-Host "  Versuche Agent zu starten..." -ForegroundColor Gray
        
        $startResult = ssh $hetznerServer "cd $serverPath && pm2 start server.js --name reading-agent" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Reading Agent gestartet" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Fehler beim Starten: $startResult" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "  ⚠️  Konnte Status nicht prüfen: $_" -ForegroundColor Yellow
}

Write-Host ""

# Schritt 4: Reading Agent neu starten
Write-Host "[*] Schritt 4: Reading Agent neu starten..." -ForegroundColor Yellow
Write-Host ""

try {
    Write-Host "  Starte Reading Agent neu..." -ForegroundColor Gray
    $restartResult = ssh $hetznerServer "pm2 restart reading-agent" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Reading Agent neu gestartet" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Fehler beim Neustart: $restartResult" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ❌ Fehler: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Schritt 5: Warte kurz und prüfe Status
Write-Host "[*] Schritt 5: Prüfe Agent Status..." -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Seconds 3

try {
    $status = ssh $hetznerServer "pm2 status reading-agent" 2>&1
    Write-Host "  Agent Status:" -ForegroundColor Gray
    Write-Host $status -ForegroundColor Gray
    
    if ($status -match "online") {
        Write-Host "  ✅ Reading Agent läuft erfolgreich" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Reading Agent Status unklar" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠️  Konnte Status nicht prüfen: $_" -ForegroundColor Yellow
}

Write-Host ""

# Schritt 6: Health Check
Write-Host "[*] Schritt 6: Health Check..." -ForegroundColor Yellow
Write-Host ""

try {
    $health = ssh $hetznerServer "curl -s http://localhost:4001/health" 2>&1
    if ($health -match "ok") {
        Write-Host "  ✅ Health Check erfolgreich" -ForegroundColor Green
        Write-Host "  Response: $health" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠️  Health Check: $health" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠️  Health Check fehlgeschlagen: $_" -ForegroundColor Yellow
}

Write-Host ""

# Schritt 7: Knowledge neu laden (optional)
Write-Host "[*] Schritt 7: Knowledge neu laden (optional)..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  Möchten Sie Knowledge neu laden? (j/n)" -ForegroundColor Gray
Write-Host "  (Drücken Sie Enter für 'n')" -ForegroundColor Gray
$reloadKnowledge = Read-Host

if ($reloadKnowledge -eq "j" -or $reloadKnowledge -eq "J" -or $reloadKnowledge -eq "y" -or $reloadKnowledge -eq "Y") {
    try {
        # Versuche AGENT_SECRET aus .env zu lesen
        $secretResult = ssh $hetznerServer "cd $serverPath && grep '^AGENT_SECRET=' .env 2>/dev/null | cut -d= -f2" 2>&1
        
        if ($secretResult -and $secretResult -notmatch "grep") {
            $secret = $secretResult.Trim()
            Write-Host "  Lade Knowledge neu mit Secret..." -ForegroundColor Gray
            
            $reloadResult = ssh $hetznerServer "curl -s -X POST http://localhost:4001/admin/reload-knowledge -H 'Content-Type: application/json' -d '{\"secret\": \"$secret\"}'" 2>&1
            
            if ($reloadResult -match "success") {
                Write-Host "  ✅ Knowledge erfolgreich neu geladen" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  Knowledge-Reload: $reloadResult" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  ⚠️  AGENT_SECRET nicht gefunden - Knowledge wird beim nächsten Neustart geladen" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ⚠️  Knowledge-Reload fehlgeschlagen: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⏭️  Knowledge-Reload übersprungen" -ForegroundColor Gray
}

Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment abgeschlossen!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Nächste Schritte:" -ForegroundColor Yellow
Write-Host "  1. Testen Sie ein Reading:" -ForegroundColor Gray
Write-Host "     curl -X POST http://138.199.237.34:4001/reading/generate \" -ForegroundColor Gray
Write-Host "       -H 'Content-Type: application/json' \" -ForegroundColor Gray
Write-Host "       -d '{\"birthDate\": \"1990-05-15\", \"birthTime\": \"14:30\", \"birthPlace\": \"Berlin\"}'" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Prüfen Sie ob Brand Voice verwendet wird" -ForegroundColor Gray
Write-Host "  3. Prüfen Sie ob Markenidentität reflektiert wird" -ForegroundColor Gray
Write-Host ""

