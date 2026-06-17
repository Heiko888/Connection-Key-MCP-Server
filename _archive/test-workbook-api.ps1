# Test-Script für Workbook API (PowerShell)
# Testet die /api/workbook/chart-data Route

param(
    [string]$ApiUrl = "http://localhost:3005"
)

$endpoint = "$ApiUrl/api/workbook/chart-data"

Write-Host "🧪 Workbook API Test" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 API URL: $endpoint" -ForegroundColor Yellow
Write-Host ""

# Test 1: GET - API Info
Write-Host "📋 Test 1: GET - API Info" -ForegroundColor Green
Write-Host "------------------------" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri $endpoint -Method Get -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
    Write-Host "✅ GET erfolgreich" -ForegroundColor Green
} catch {
    Write-Host "❌ GET fehlgeschlagen: $_" -ForegroundColor Red
    Write-Host "HTTP Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}
Write-Host ""
Write-Host ""

# Test 2: POST - Single Chart (ohne SVG)
Write-Host "📋 Test 2: POST - Single Chart (ohne SVG)" -ForegroundColor Green
Write-Host "------------------------------------------" -ForegroundColor Green
$body = @{
    chartType = "single"
    birthData = @{
        person_A = @{
            date = "1978-05-12"
            time = "14:32"
            location = "Berlin, Germany"
        }
    }
    options = @{
        includeSVG = $false
        includeData = $true
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri $endpoint -Method Post -Body $body -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
    Write-Host "✅ POST erfolgreich" -ForegroundColor Green
    Write-Host "Chart ID: $($response.chart_id)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ POST fehlgeschlagen: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}
Write-Host ""
Write-Host ""

# Test 3: POST - Single Chart (mit SVG)
Write-Host "📋 Test 3: POST - Single Chart (mit SVG)" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Green
Write-Host "⚠️  Dieser Test kann länger dauern (Chart-Berechnung + SVG-Generierung)..." -ForegroundColor Yellow
$body = @{
    chartType = "single"
    birthData = @{
        person_A = @{
            date = "1978-05-12"
            time = "14:32"
            location = "Berlin, Germany"
        }
    }
    options = @{
        includeSVG = $true
        includeLayers = $true
        includeData = $true
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri $endpoint -Method Post -Body $body -ContentType "application/json" -TimeoutSec 180
    Write-Host "✅ POST erfolgreich" -ForegroundColor Green
    Write-Host "Chart ID: $($response.chart_id)" -ForegroundColor Cyan
    Write-Host "SVG vorhanden: $($null -ne $response.svg)" -ForegroundColor Cyan
    Write-Host "SVG Layers vorhanden: $($null -ne $response.svg_layers)" -ForegroundColor Cyan
    Write-Host "Metadata: $($response.metadata | ConvertTo-Json -Compress)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ POST fehlgeschlagen: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}
Write-Host ""
Write-Host ""

# Test 4: POST - Dual Chart (Connection Key)
Write-Host "📋 Test 4: POST - Dual Chart (Connection Key)" -ForegroundColor Green
Write-Host "----------------------------------------------" -ForegroundColor Green
Write-Host "⚠️  Dieser Test kann länger dauern..." -ForegroundColor Yellow
$body = @{
    chartType = "dual"
    birthData = @{
        person_A = @{
            date = "1978-05-12"
            time = "14:32"
            location = "Berlin, Germany"
        }
        person_B = @{
            date = "1985-03-20"
            time = "10:15"
            location = "München, Germany"
        }
    }
    options = @{
        includeSVG = $true
        mode = "dual-overlay"
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri $endpoint -Method Post -Body $body -ContentType "application/json" -TimeoutSec 180
    Write-Host "✅ POST erfolgreich" -ForegroundColor Green
    Write-Host "Chart ID: $($response.chart_id)" -ForegroundColor Cyan
    Write-Host "Chart Type: $($response.metadata.chart_type)" -ForegroundColor Cyan
    Write-Host "Connections vorhanden: $($null -ne $response.data.connections)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ POST fehlgeschlagen: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}
Write-Host ""
Write-Host ""

# Test 5: POST - Fehler-Test (fehlende Felder)
Write-Host "📋 Test 5: POST - Fehler-Test (fehlende Felder)" -ForegroundColor Green
Write-Host "------------------------------------------------" -ForegroundColor Green
$body = @{
    chartType = "single"
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri $endpoint -Method Post -Body $body -ContentType "application/json"
    Write-Host "⚠️  Sollte fehlschlagen, aber hat funktioniert" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "✅ Fehler korrekt abgefangen" -ForegroundColor Green
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        $errorObj = $responseBody | ConvertFrom-Json
        Write-Host "Error Code: $($errorObj.error.code)" -ForegroundColor Cyan
        Write-Host "Error Message: $($errorObj.error.message)" -ForegroundColor Cyan
    }
}
Write-Host ""
Write-Host ""

# Test 6: POST - Fehler-Test (ungültiger chartType)
Write-Host "📋 Test 6: POST - Fehler-Test (ungültiger chartType)" -ForegroundColor Green
Write-Host "-----------------------------------------------------" -ForegroundColor Green
$body = @{
    chartType = "invalid"
    birthData = @{
        person_A = @{
            date = "1978-05-12"
            time = "14:32"
            location = "Berlin, Germany"
        }
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri $endpoint -Method Post -Body $body -ContentType "application/json"
    Write-Host "⚠️  Sollte fehlschlagen, aber hat funktioniert" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "✅ Fehler korrekt abgefangen" -ForegroundColor Green
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        $errorObj = $responseBody | ConvertFrom-Json
        Write-Host "Error Code: $($errorObj.error.code)" -ForegroundColor Cyan
        Write-Host "Error Message: $($errorObj.error.message)" -ForegroundColor Cyan
    }
}
Write-Host ""
Write-Host ""
Write-Host "✅ Tests abgeschlossen!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Verwendung:" -ForegroundColor Yellow
Write-Host "   .\test-workbook-api.ps1                    # Testet localhost:3005" -ForegroundColor Gray
Write-Host "   .\test-workbook-api.ps1 -ApiUrl http://167.235.224.149:3005  # Testet Server" -ForegroundColor Gray
