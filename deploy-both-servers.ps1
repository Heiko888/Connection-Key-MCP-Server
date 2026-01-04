# Deployment-Script für beide Server
# Hetzner Server (138.199.237.34) und CK-App Server (167.235.224.149)

$HETZNER_SERVER = "138.199.237.34"
$CK_APP_SERVER = "167.235.224.149"
$BRANCH = "feature/reading-agent-option-a-complete"

Write-Host "🚀 Deployment auf beide Server" -ForegroundColor Cyan
Write-Host ""

# ============================================
# 1. HETZNER SERVER (138.199.237.34)
# ============================================
Write-Host "📦 Server 1: Hetzner ($HETZNER_SERVER)" -ForegroundColor Yellow
Write-Host "   Verzeichnis: /opt/mcp-connection-key" -ForegroundColor Gray
Write-Host ""

Write-Host "   Git Pull..." -ForegroundColor Gray
ssh root@$HETZNER_SERVER "cd /opt/mcp-connection-key; git pull origin $BRANCH"

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Git Pull erfolgreich" -ForegroundColor Green
} else {
    Write-Host "   ❌ Git Pull fehlgeschlagen" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "   Prüfe Services..." -ForegroundColor Gray
ssh root@$HETZNER_SERVER "cd /opt/mcp-connection-key; docker compose ps"

Write-Host ""
Write-Host "   ✅ Hetzner Server Deployment abgeschlossen" -ForegroundColor Green
Write-Host ""

# ============================================
# 2. CK-APP SERVER (167.235.224.149)
# ============================================
Write-Host "📦 Server 2: CK-App ($CK_APP_SERVER)" -ForegroundColor Yellow
Write-Host "   Verzeichnis: /opt/hd-app/The-Connection-Key/frontend" -ForegroundColor Gray
Write-Host ""

# Prüfe ob Git-Repository vorhanden ist
Write-Host "   Prüfe Git-Repository..." -ForegroundColor Gray
$gitCheck = ssh root@$CK_APP_SERVER "cd /opt/hd-app/The-Connection-Key/frontend; git status 2>&1"

if ($gitCheck -match "not a git repository") {
    Write-Host "   ⚠️  Kein Git-Repository - kopiere Dateien manuell" -ForegroundColor Yellow
    
    # Kopiere system-auth.ts
    Write-Host "   Kopiere system-auth.ts..." -ForegroundColor Gray
    scp frontend/lib/system-auth.ts root@${CK_APP_SERVER}:/opt/hd-app/The-Connection-Key/frontend/lib/system-auth.ts
    
    # Kopiere Frontend-Komponenten
    Write-Host "   Kopiere Frontend-Komponenten..." -ForegroundColor Gray
    ssh root@$CK_APP_SERVER "mkdir -p /opt/hd-app/The-Connection-Key/frontend/app/components"
    scp integration/frontend/components/AgentChat.tsx root@${CK_APP_SERVER}:/opt/hd-app/The-Connection-Key/frontend/app/components/AgentChat.tsx
    scp integration/frontend/components/AgentTasksDashboard.tsx root@${CK_APP_SERVER}:/opt/hd-app/The-Connection-Key/frontend/app/components/AgentTasksDashboard.tsx
    scp integration/frontend/components/ReadingDisplay.tsx root@${CK_APP_SERVER}:/opt/hd-app/The-Connection-Key/frontend/app/components/ReadingDisplay.tsx
    
    # Kopiere Services
    Write-Host "   Kopiere Services..." -ForegroundColor Gray
    ssh root@$CK_APP_SERVER "mkdir -p /opt/hd-app/The-Connection-Key/frontend/app/services"
    scp integration/frontend/services/readingService.ts root@${CK_APP_SERVER}:/opt/hd-app/The-Connection-Key/frontend/app/services/readingService.ts
    
    # Kopiere package.json und tsconfig.json (falls vorhanden)
    Write-Host "   Kopiere Konfigurationsdateien..." -ForegroundColor Gray
    if (Test-Path "package.json") {
        scp package.json root@${CK_APP_SERVER}:/opt/hd-app/The-Connection-Key/frontend/package.json
    }
    if (Test-Path "tsconfig.json") {
        scp tsconfig.json root@${CK_APP_SERVER}:/opt/hd-app/The-Connection-Key/frontend/tsconfig.json
    }
    
} else {
    Write-Host "   Git Pull..." -ForegroundColor Gray
    ssh root@$CK_APP_SERVER "cd /opt/hd-app/The-Connection-Key; git pull origin $BRANCH"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Git Pull erfolgreich" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Git Pull fehlgeschlagen - versuche manuelles Kopieren" -ForegroundColor Yellow
        
        # Fallback: Manuelles Kopieren
        scp frontend/lib/system-auth.ts root@${CK_APP_SERVER}:/opt/hd-app/The-Connection-Key/frontend/lib/system-auth.ts
    }
}

Write-Host ""
Write-Host "   Baue Container neu..." -ForegroundColor Gray
ssh root@$CK_APP_SERVER "cd /opt/hd-app/The-Connection-Key; docker compose stop frontend"
ssh root@$CK_APP_SERVER "cd /opt/hd-app/The-Connection-Key; docker compose build --no-cache frontend"
ssh root@$CK_APP_SERVER "cd /opt/hd-app/The-Connection-Key; docker compose up -d frontend"

Write-Host ""
Write-Host "   Warte 5 Sekunden..." -ForegroundColor Gray
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "   Prüfe Container-Status..." -ForegroundColor Gray
ssh root@$CK_APP_SERVER "cd /opt/hd-app/The-Connection-Key; docker compose ps frontend"

Write-Host ""
Write-Host "   ✅ CK-App Server Deployment abgeschlossen" -ForegroundColor Green
Write-Host ""

# ============================================
# 3. ZUSAMMENFASSUNG
# ============================================
Write-Host "✅ Deployment abgeschlossen!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Nächste Schritte:" -ForegroundColor Cyan
Write-Host "   1. Prüfe Logs auf beiden Servern" -ForegroundColor Gray
Write-Host "   2. Teste API-Endpoints" -ForegroundColor Gray
Write-Host "   3. Prüfe Frontend im Browser" -ForegroundColor Gray
Write-Host ""
Write-Host "🔍 Logs prüfen:" -ForegroundColor Cyan
Write-Host "   Hetzner: ssh root@$HETZNER_SERVER 'cd /opt/mcp-connection-key; docker compose logs --tail 50'" -ForegroundColor Gray
Write-Host "   CK-App:  ssh root@$CK_APP_SERVER 'cd /opt/hd-app/The-Connection-Key; docker compose logs --tail 50 frontend'" -ForegroundColor Gray
