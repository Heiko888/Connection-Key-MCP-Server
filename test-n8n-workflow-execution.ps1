# Test-Script fuer n8n Reading Generation Workflow
# Prueft die Executions-Ansicht und analysiert die Daten jedes Nodes

param(
    [string]$N8N_URL = "https://n8n.werdemeisterdeinergedankenagent.de",
    [string]$N8N_API_KEY = "",
    [switch]$SkipExecution = $false
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "n8n Workflow Execution Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test-Payload fuer Reading Generation
$testPayload = @{
    readingId = "test-$(Get-Date -Format 'yyyyMMddHHmmss')"
    name = "Test User"
    birthDate = "1990-05-15"
    birthTime = "14:30"
    birthPlace = "Berlin"
    readingType = "basic"
    focus = "Karriere"
    userId = $null
} | ConvertTo-Json

Write-Host "[INFO] Test-Payload:" -ForegroundColor Yellow
Write-Host $testPayload -ForegroundColor Gray
Write-Host ""

# Schritt 1: Workflow ausfuehren (Webhook aufrufen)
if (-not $SkipExecution) {
    Write-Host "[STEP 1] Workflow ausfuehren..." -ForegroundColor Green
    Write-Host "   Webhook URL: $N8N_URL/webhook/reading" -ForegroundColor Gray
    
    try {
        $webhookResponse = Invoke-RestMethod -Uri "$N8N_URL/webhook/reading" `
            -Method POST `
            -ContentType "application/json" `
            -Body $testPayload `
            -ErrorAction Stop
        
        Write-Host "   [OK] Webhook erfolgreich aufgerufen" -ForegroundColor Green
        Write-Host "   Response:" -ForegroundColor Gray
        $webhookResponse | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Gray
        
        $executionId = $webhookResponse.executionId
        if (-not $executionId) {
            Write-Host "   [WARN] Keine executionId in Response gefunden" -ForegroundColor Yellow
            Write-Host "   Warte 3 Sekunden fuer Execution..." -ForegroundColor Yellow
            Start-Sleep -Seconds 3
        }
    }
    catch {
        Write-Host "   [ERROR] Webhook-Fehler: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        Write-Host "   [WARN] Weiter mit Execution-Abfrage..." -ForegroundColor Yellow
    }
}
else {
    Write-Host "[SKIP] Schritt 1 uebersprungen (SkipExecution aktiviert)" -ForegroundColor Yellow
}

Write-Host ""

# Schritt 2: Executions abrufen (falls API Key vorhanden)
if ($N8N_API_KEY) {
    Write-Host "[STEP 2] Executions ueber API abrufen..." -ForegroundColor Green
    
    try {
        $headers = @{
            "X-N8N-API-KEY" = $N8N_API_KEY
            "Content-Type" = "application/json"
        }
        
        # Letzte Executions abrufen
        $executionsResponse = Invoke-RestMethod -Uri "$N8N_URL/api/v1/executions" `
            -Method GET `
            -Headers $headers `
            -ErrorAction Stop
        
        Write-Host "   [OK] Executions erfolgreich abgerufen" -ForegroundColor Green
        Write-Host "   Anzahl Executions: $($executionsResponse.data.Count)" -ForegroundColor Gray
        
        if ($executionsResponse.data.Count -gt 0) {
            # Neueste Execution nehmen
            $latestExecution = $executionsResponse.data[0]
            Write-Host ""
            Write-Host "[INFO] Neueste Execution:" -ForegroundColor Yellow
            Write-Host "   ID: $($latestExecution.id)" -ForegroundColor Gray
            Write-Host "   Status: $($latestExecution.finished)" -ForegroundColor Gray
            Write-Host "   Mode: $($latestExecution.mode)" -ForegroundColor Gray
            Write-Host "   Started: $($latestExecution.startedAt)" -ForegroundColor Gray
            
            # Execution-Details abrufen
            Write-Host ""
            Write-Host "[STEP 3] Execution-Details abrufen..." -ForegroundColor Green
            
            $executionDetails = Invoke-RestMethod -Uri "$N8N_URL/api/v1/executions/$($latestExecution.id)" `
                -Method GET `
                -Headers $headers `
                -ErrorAction Stop
            
            Write-Host "   [OK] Execution-Details erfolgreich abgerufen" -ForegroundColor Green
            Write-Host ""
            
            # Schritt 4: Nodes analysieren
            Write-Host "[STEP 4] Nodes analysieren..." -ForegroundColor Green
            Write-Host ""
            
            $nodeData = $executionDetails.data.resultData.runData
            
            # Wichtige Nodes pruefen
            $importantNodes = @(
                "Validate Payload",
                "Log Start",
                "Call Reading Agent",
                "Prepare Result",
                "Normalize Response",
                "Webhook Response"
            )
            
            foreach ($nodeName in $importantNodes) {
                if ($nodeData.$nodeName) {
                    $nodeExecution = $nodeData.$nodeName[0]
                    Write-Host "   [NODE] $nodeName" -ForegroundColor Cyan
                    Write-Host "      Status: $($nodeExecution.executionStatus)" -ForegroundColor Gray
                    
                    if ($nodeExecution.data) {
                        $outputData = $nodeExecution.data.main[0]
                        $itemCount = $outputData.Count
                        $color = if ($itemCount -eq 1) { "Green" } else { "Yellow" }
                        Write-Host "      Items: $itemCount" -ForegroundColor $color
                        
                        if ($itemCount -gt 1) {
                            Write-Host "      [WARN] Node gibt mehr als 1 Item zurueck!" -ForegroundColor Yellow
                        }
                        
                        # Erste Item-Struktur anzeigen
                        if ($itemCount -gt 0) {
                            $firstItem = $outputData[0].json
                            $keys = $firstItem.PSObject.Properties.Name -join ', '
                            Write-Host "      Erste Item Keys: $keys" -ForegroundColor Gray
                            
                            # Spezielle Pruefung fuer "Prepare Result" und "Normalize Response"
                            if ($nodeName -eq "Prepare Result") {
                                Write-Host "      [ANALYZE] Prepare Result Analyse:" -ForegroundColor Magenta
                                Write-Host "         readingId: $($firstItem.readingId)" -ForegroundColor Gray
                                $readingExists = if ($firstItem.reading) { 'Ja' } else { 'Nein' }
                                Write-Host "         reading vorhanden: $readingExists" -ForegroundColor Gray
                                Write-Host "         readingType: $($firstItem.readingType)" -ForegroundColor Gray
                                
                                if ($itemCount -gt 1) {
                                    Write-Host "         [CRITICAL] Prepare Result gibt $itemCount Items zurueck!" -ForegroundColor Red
                                }
                            }
                            
                            if ($nodeName -eq "Normalize Response") {
                                Write-Host "      [ANALYZE] Normalize Response Analyse:" -ForegroundColor Magenta
                                Write-Host "         readingId: $($firstItem.readingId)" -ForegroundColor Gray
                                Write-Host "         status: $($firstItem.status)" -ForegroundColor Gray
                                $readingTextExists = if ($firstItem.readingText) { 'Ja' } else { 'Nein' }
                                Write-Host "         readingText vorhanden: $readingTextExists" -ForegroundColor Gray
                                $readingTextLength = if ($firstItem.readingText) { $firstItem.readingText.Length } else { 0 }
                                Write-Host "         readingText Laenge: $readingTextLength Zeichen" -ForegroundColor Gray
                                
                                # Pruefe ob alle erforderlichen Felder vorhanden sind
                                $requiredFields = @("readingId", "status", "readingText")
                                $missingFields = $requiredFields | Where-Object { -not $firstItem.PSObject.Properties.Name.Contains($_) }
                                
                                if ($missingFields.Count -gt 0) {
                                    $missing = $missingFields -join ', '
                                    Write-Host "         [ERROR] FEHLENDE FELDER: $missing" -ForegroundColor Red
                                }
                                else {
                                    Write-Host "         [OK] Alle erforderlichen Felder vorhanden" -ForegroundColor Green
                                }
                                
                                if ($itemCount -gt 1) {
                                    Write-Host "         [CRITICAL] Normalize Response gibt $itemCount Items zurueck!" -ForegroundColor Red
                                }
                                else {
                                    Write-Host "         [OK] Genau 1 Item zurueckgegeben" -ForegroundColor Green
                                }
                            }
                        }
                    }
                    else {
                        Write-Host "      [WARN] Keine Daten vorhanden" -ForegroundColor Yellow
                    }
                    Write-Host ""
                }
                else {
                    Write-Host "   [WARN] Node '$nodeName' nicht in Execution gefunden" -ForegroundColor Yellow
                }
            }
            
            # Zusammenfassung
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "Zusammenfassung" -ForegroundColor Cyan
            Write-Host "========================================" -ForegroundColor Cyan
            
            $allNodesOk = $true
            foreach ($nodeName in $importantNodes) {
                if ($nodeData.$nodeName) {
                    $nodeExecution = $nodeData.$nodeName[0]
                    if ($nodeExecution.data) {
                        $itemCount = $nodeExecution.data.main[0].Count
                        if ($itemCount -ne 1 -and ($nodeName -eq "Prepare Result" -or $nodeName -eq "Normalize Response")) {
                            Write-Host "[X] $nodeName : $itemCount Items (erwartet: 1)" -ForegroundColor Red
                            $allNodesOk = $false
                        }
                        elseif ($itemCount -eq 1) {
                            Write-Host "[OK] $nodeName : 1 Item" -ForegroundColor Green
                        }
                    }
                }
            }
            
            if ($allNodesOk) {
                Write-Host ""
                Write-Host "[OK] Alle Nodes geben korrekte Anzahl Items zurueck!" -ForegroundColor Green
            }
            else {
                Write-Host ""
                Write-Host "[WARN] Einige Nodes geben nicht die erwartete Anzahl Items zurueck!" -ForegroundColor Yellow
            }
        }
        else {
            Write-Host "   [WARN] Keine Executions gefunden" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "   [ERROR] API-Fehler: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    }
}
else {
    Write-Host "[WARN] Schritt 2 uebersprungen (kein N8N_API_KEY angegeben)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "[TIP] Verwende -N8N_API_KEY 'dein-api-key' um Executions abzurufen" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "[INFO] Manuelle Pruefung in n8n UI:" -ForegroundColor Yellow
    Write-Host "   1. Oeffne: $N8N_URL" -ForegroundColor Gray
    Write-Host "   2. Gehe zu: Executions" -ForegroundColor Gray
    Write-Host "   3. Oeffne die neueste Execution" -ForegroundColor Gray
    Write-Host "   4. Pruefe jeden Node:" -ForegroundColor Gray
    Write-Host "      - Validate Payload: Sollte 1 Item zurueckgeben" -ForegroundColor Gray
    Write-Host "      - Prepare Result: Sollte 1 Item zurueckgeben (pruefen ob Array!)" -ForegroundColor Gray
    Write-Host "      - Normalize Response: Sollte 1 Item mit readingId, status, readingText zurueckgeben" -ForegroundColor Gray
    Write-Host "      - Webhook Response: Sollte normalisierte Daten verwenden" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test abgeschlossen" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
