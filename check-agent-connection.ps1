# ============================================
# Agent-Verbindung prüfen
# ============================================
# Prüft die Verbindung zwischen Frontend und Agenten
# ============================================

$server = "root@167.235.224.149"
$serverPath = "/opt/hd-app/The-Connection-Key"
$hetzner = "138.199.237.34"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Agent-Verbindung prüfen" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Setze Encoding
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "[*] Prüfe Frontend-Struktur auf Server..." -ForegroundColor Yellow
Write-Host ""

# Prüfe Pages Router
Write-Host "  Test 1: Pages Router - /coach/readings/create" -ForegroundColor Gray
try {
    $pagesCheck = ssh $server "cd $serverPath/frontend && ls -la pages/coach/readings/create.tsx 2>&1" 2>&1
    if ($pagesCheck -match "No such file") {
        Write-Host "  ❌ Frontend-Seite fehlt (Pages Router)" -ForegroundColor Red
    } else {
        Write-Host "  ✅ Frontend-Seite existiert (Pages Router)" -ForegroundColor Green
        Write-Host "  $pagesCheck" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ⚠️  Konnte nicht prüfen: $_" -ForegroundColor Yellow
}

Write-Host ""

# Prüfe App Router
Write-Host "  Test 2: App Router - /coach/readings/create" -ForegroundColor Gray
try {
    $appCheck = ssh $server "cd $serverPath/frontend && ls -la app/coach/readings/create/page.tsx 2>&1" 2>&1
    if ($appCheck -match "No such file") {
        Write-Host "  ❌ Frontend-Seite fehlt (App Router)" -ForegroundColor Red
    } else {
        Write-Host "  ✅ Frontend-Seite existiert (App Router)" -ForegroundColor Green
        Write-Host "  $appCheck" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ⚠️  Konnte nicht prüfen: $_" -ForegroundColor Yellow
}

Write-Host ""

# Prüfe API-Route
Write-Host "  Test 3: API-Route - /api/readings/generate" -ForegroundColor Gray
try {
    $apiCheck = ssh $server "cd $serverPath/frontend && ls -la pages/api/readings/generate.ts 2>&1" 2>&1
    if ($apiCheck -match "No such file") {
        Write-Host "  ❌ API-Route fehlt (Pages Router)" -ForegroundColor Red
    } else {
        Write-Host "  ✅ API-Route existiert (Pages Router)" -ForegroundColor Green
        Write-Host "  $apiCheck" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ⚠️  Konnte nicht prüfen: $_" -ForegroundColor Yellow
}

Write-Host ""

# Prüfe Environment Variables
Write-Host "[*] Prüfe Environment Variables..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  Test 4: .env Datei" -ForegroundColor Gray
try {
    $envCheck = ssh $server "cd $serverPath && grep -E '^(MCP_SERVER_URL|READING_AGENT_URL)=' .env 2>&1" 2>&1
    if ($envCheck -match "MCP_SERVER_URL|READING_AGENT_URL") {
        Write-Host "  ✅ Environment Variables gefunden:" -ForegroundColor Green
        Write-Host "  $envCheck" -ForegroundColor Gray
    } else {
        Write-Host "  ❌ Environment Variables fehlen in .env" -ForegroundColor Red
    }
} catch {
    Write-Host "  ⚠️  Konnte nicht prüfen: $_" -ForegroundColor Yellow
}

Write-Host ""

Write-Host "  Test 5: Frontend .env.local" -ForegroundColor Gray
try {
    $envLocalCheck = ssh $server "cd $serverPath/frontend && grep -E '^(MCP_SERVER_URL|READING_AGENT_URL)=' .env.local 2>&1" 2>&1
    if ($envLocalCheck -match "MCP_SERVER_URL|READING_AGENT_URL") {
        Write-Host "  ✅ Environment Variables gefunden:" -ForegroundColor Green
        Write-Host "  $envLocalCheck" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠️  Environment Variables fehlen in .env.local" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠️  Konnte nicht prüfen: $_" -ForegroundColor Yellow
}

Write-Host ""

# Prüfe MCP Server
Write-Host "[*] Prüfe MCP Server Erreichbarkeit..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  Test 6: MCP Server Health" -ForegroundColor Gray
try {
    $mcpHealth = ssh $server "curl -s -o /dev/null -w '%{http_code}' http://${hetzner}:7000/health 2>&1" 2>&1
    if ($mcpHealth -eq "200") {
        Write-Host "  ✅ MCP Server erreichbar (HTTP $mcpHealth)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ MCP Server nicht erreichbar (HTTP $mcpHealth)" -ForegroundColor Red
    }
} catch {
    Write-Host "  ⚠️  Konnte nicht prüfen: $_" -ForegroundColor Yellow
}

Write-Host ""

# Prüfe Reading Agent
Write-Host "[*] Prüfe Reading Agent Erreichbarkeit..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  Test 7: Reading Agent Health" -ForegroundColor Gray
try {
    $readingHealth = ssh $server "curl -s -o /dev/null -w '%{http_code}' http://${hetzner}:4001/health 2>&1" 2>&1
    if ($readingHealth -eq "200") {
        Write-Host "  ✅ Reading Agent erreichbar (HTTP $readingHealth)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Reading Agent nicht erreichbar (HTTP $readingHealth)" -ForegroundColor Red
    }
} catch {
    Write-Host "  ⚠️  Konnte nicht prüfen: $_" -ForegroundColor Yellow
}

Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Zusammenfassung" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Zu prüfen:" -ForegroundColor Yellow
Write-Host "1. Frontend-Seite existiert? (/coach/readings/create)" -ForegroundColor Gray
Write-Host "2. API-Route existiert? (/api/readings/generate)" -ForegroundColor Gray
Write-Host "3. Environment Variables gesetzt? (MCP_SERVER_URL, READING_AGENT_URL)" -ForegroundColor Gray
Write-Host "4. MCP Server erreichbar? (http://${hetzner}:7000)" -ForegroundColor Gray
Write-Host "5. Reading Agent erreichbar? (http://${hetzner}:4001)" -ForegroundColor Gray
Write-Host ""
Write-Host "Siehe auch: AGENT_VERBINDUNG_DIAGNOSE.md" -ForegroundColor Cyan
Write-Host ""


