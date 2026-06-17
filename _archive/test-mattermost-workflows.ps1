# Test-Skript für Mattermost Workflows (PowerShell)
# Führt beide Workflows aus und zeigt die Ergebnisse

Write-Host "🧪 Teste Mattermost Workflows..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Agent → Mattermost
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📤 Test 1: Agent → Mattermost" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

$body1 = @{
    agentId = "marketing"
    message = "Test-Nachricht"
    userId = "test-user"
} | ConvertTo-Json

try {
    $response1 = Invoke-WebRequest -Uri "https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $body1 `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "Response:" -ForegroundColor Gray
    Write-Host $response1.Content
    Write-Host ""
    
    if ($response1.Content -match "success|Workflow was started") {
        Write-Host "✅ Agent → Mattermost: ERFOLGREICH" -ForegroundColor Green
        $test1Success = $true
    } else {
        Write-Host "⚠️  Agent → Mattermost: Unerwartete Antwort" -ForegroundColor Yellow
        $test1Success = $false
    }
} catch {
    Write-Host "Response:" -ForegroundColor Gray
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host $responseBody
        if ($responseBody -match "404") {
            Write-Host "❌ Agent → Mattermost: 404 - Workflow nicht aktiviert!" -ForegroundColor Red
        }
    } else {
        Write-Host $_.Exception.Message
    }
    $test1Success = $false
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📤 Test 2: Reading → Mattermost" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

$body2 = @{
    birthDate = "1990-01-01"
    birthTime = "12:00"
    birthPlace = "Berlin, Germany"
    userId = "test-user"
} | ConvertTo-Json

try {
    $response2 = Invoke-WebRequest -Uri "https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading-mattermost" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $body2 `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "Response:" -ForegroundColor Gray
    Write-Host $response2.Content
    Write-Host ""
    
    if ($response2.Content -match "success|Workflow was started") {
        Write-Host "✅ Reading → Mattermost: ERFOLGREICH" -ForegroundColor Green
        $test2Success = $true
    } else {
        Write-Host "⚠️  Reading → Mattermost: Unerwartete Antwort" -ForegroundColor Yellow
        $test2Success = $false
    }
} catch {
    Write-Host "Response:" -ForegroundColor Gray
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host $responseBody
        if ($responseBody -match "404") {
            Write-Host "❌ Reading → Mattermost: 404 - Workflow nicht aktiviert!" -ForegroundColor Red
        }
    } else {
        Write-Host $_.Exception.Message
    }
    $test2Success = $false
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📊 Zusammenfassung" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

$successCount = 0
if ($test1Success) { $successCount++ }
if ($test2Success) { $successCount++ }

Write-Host "Erfolgreich: $successCount von 2"
Write-Host ""

if ($successCount -eq 2) {
    Write-Host "🎉 Alle Tests erfolgreich!" -ForegroundColor Green
    exit 0
} elseif ($successCount -eq 1) {
    Write-Host "⚠️  Ein Test fehlgeschlagen" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "❌ Beide Tests fehlgeschlagen" -ForegroundColor Red
    exit 2
}
