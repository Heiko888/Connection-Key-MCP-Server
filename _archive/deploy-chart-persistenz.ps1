# Deployment-Script: Chart-Persistenz & Versionierung
# Hetzner Server (138.199.237.34) und CK-App Server (167.235.224.149)

$HETZNER_SERVER = "138.199.237.34"
$CK_APP_SERVER = "167.235.224.149"
$BRANCH = "feature/reading-agent-option-a-complete"

Write-Host "🚀 Chart-Persistenz Deployment" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
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
Write-Host "   ⚠️  WICHTIG: n8n Workflows müssen manuell importiert werden!" -ForegroundColor Yellow
Write-Host "      - chart-calculation-workflow.json" -ForegroundColor Gray
Write-Host "      - reading-generation-workflow.json" -ForegroundColor Gray
Write-Host ""

Write-Host "   ✅ Hetzner Server Deployment abgeschlossen" -ForegroundColor Green
Write-Host ""

# ============================================
# 2. CK-APP SERVER (167.235.224.149)
# ============================================
Write-Host "📦 Server 2: CK-App ($CK_APP_SERVER)" -ForegroundColor Yellow
Write-Host "   Verzeichnis: /opt/hd-app/The-Connection-Key/frontend" -ForegroundColor Gray
Write-Host ""

# API Route: chart/truth
Write-Host "   Kopiere Chart-Truth API Route..." -ForegroundColor Gray
ssh root@$CK_APP_SERVER "mkdir -p /opt/hd-app/The-Connection-Key/frontend/app/api/chart/truth"
scp integration/api-routes/app-router/chart/truth/route.ts root@${CK_APP_SERVER}:/opt/hd-app/The-Connection-Key/frontend/app/api/chart/truth/route.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Chart-Truth API Route kopiert" -ForegroundColor Green
} else {
    Write-Host "   ❌ Fehler beim Kopieren der API Route" -ForegroundColor Red
}

# Services: chart-truth
Write-Host "   Kopiere Chart-Truth Service..." -ForegroundColor Gray
ssh root@$CK_APP_SERVER "mkdir -p /opt/hd-app/The-Connection-Key/frontend/services/chart-truth"
scp services/chart-truth/chartTruthService.ts root@${CK_APP_SERVER}:/opt/hd-app/The-Connection-Key/frontend/services/chart-truth/chartTruthService.ts
scp services/chart-truth/chartTruthService.test.ts root@${CK_APP_SERVER}:/opt/hd-app/The-Connection-Key/frontend/services/chart-truth/chartTruthService.test.ts
scp services/chart-truth/README.md root@${CK_APP_SERVER}:/opt/hd-app/The-Connection-Key/frontend/services/chart-truth/README.md

# Chart-Calculation-Modul (benötigt für Chart-Truth-Service)
Write-Host "   Kopiere Chart-Calculation-Modul..." -ForegroundColor Gray
ssh root@$CK_APP_SERVER "mkdir -p /opt/hd-app/The-Connection-Key/frontend/integration/scripts"
scp integration/scripts/chart-calculation-astronomy.js root@${CK_APP_SERVER}:/opt/hd-app/The-Connection-Key/frontend/integration/scripts/chart-calculation-astronomy.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Chart-Truth Service kopiert" -ForegroundColor Green
} else {
    Write-Host "   ❌ Fehler beim Kopieren des Services" -ForegroundColor Red
}

# Supabase Clients (falls nicht vorhanden)
Write-Host "   Prüfe Supabase Clients..." -ForegroundColor Gray
$supabaseClientsCheck = ssh root@$CK_APP_SERVER "test -f /opt/hd-app/The-Connection-Key/frontend/lib/supabase-clients.ts && echo 'exists' || echo 'missing'"

if ($supabaseClientsCheck -match "missing") {
    Write-Host "   ⚠️  Supabase Clients fehlen - kopiere..." -ForegroundColor Yellow
    ssh root@$CK_APP_SERVER "mkdir -p /opt/hd-app/The-Connection-Key/frontend/lib"
    scp integration/lib/supabase-clients.ts root@${CK_APP_SERVER}:/opt/hd-app/The-Connection-Key/frontend/lib/supabase-clients.ts
} else {
    Write-Host "   ✅ Supabase Clients vorhanden" -ForegroundColor Green
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
# 3. SUPABASE MIGRATIONEN
# ============================================
Write-Host "📦 Supabase Migrationen" -ForegroundColor Yellow
Write-Host ""
Write-Host "   ⚠️  WICHTIG: Migrationen müssen manuell ausgeführt werden!" -ForegroundColor Yellow
Write-Host "      1. Öffne Supabase Dashboard" -ForegroundColor Gray
Write-Host "      2. SQL Editor öffnen" -ForegroundColor Gray
Write-Host "      3. Führe aus: 017_create_charts_table.sql" -ForegroundColor Gray
Write-Host "      4. Führe aus: 018_add_chart_references_to_readings.sql" -ForegroundColor Gray
Write-Host ""

# ============================================
# 4. ZUSAMMENFASSUNG
# ============================================
Write-Host "✅ Deployment abgeschlossen!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Nächste Schritte:" -ForegroundColor Cyan
Write-Host "   1. Supabase Migrationen ausführen (017, 018)" -ForegroundColor Gray
Write-Host "   2. n8n Workflows importieren (chart-calculation, reading-generation)" -ForegroundColor Gray
Write-Host "   3. API testen: POST /api/chart/truth" -ForegroundColor Gray
Write-Host "   4. Logs prüfen auf beiden Servern" -ForegroundColor Gray
Write-Host ""
