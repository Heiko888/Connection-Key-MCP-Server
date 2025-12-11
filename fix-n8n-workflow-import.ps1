# Fix n8n Workflow Import - Korrigiert Supabase Node Konfiguration
# 
# Problem: "propertyValues[itemName] is not iterable"
# Lösung: Korrigiert Supabase Node von "value" zu "values"

$workflowFiles = @(
    "n8n-workflows/reading-generation-workflow.json",
    "n8n-workflows/scheduled-reading-generation.json",
    "n8n-workflows/user-registration-reading.json"
)

Write-Host "🔧 Korrigiere n8n Workflow-Dateien..." -ForegroundColor Cyan
Write-Host ""

foreach ($file in $workflowFiles) {
    if (Test-Path $file) {
        Write-Host "📝 Bearbeite: $file" -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw | ConvertFrom-Json
        
        # Durchlaufe alle Nodes
        foreach ($node in $content.nodes) {
            if ($node.type -eq "n8n-nodes-base.supabase") {
                Write-Host "  ✅ Supabase Node gefunden: $($node.name)" -ForegroundColor Green
                
                # Prüfe ob "value" statt "values" verwendet wird
                if ($node.parameters.columns.value) {
                    Write-Host "  🔧 Korrigiere: value → values" -ForegroundColor Yellow
                    $node.parameters.columns.values = $node.parameters.columns.value
                    $node.parameters.columns.PSObject.Properties.Remove('value')
                }
            }
        }
        
        # Speichere korrigierte Datei
        $content | ConvertTo-Json -Depth 20 | Set-Content $file
        Write-Host "  ✅ Datei korrigiert: $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Datei nicht gefunden: $file" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "✅ Alle Workflow-Dateien korrigiert!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Nächste Schritte:" -ForegroundColor Cyan
Write-Host "1. Versuche erneut, die Workflows in n8n zu importieren" -ForegroundColor White
Write-Host "2. Falls es immer noch nicht funktioniert, verwende die manuelle Erstellung (N8N_IMPORT_FEHLER_FIX.md)" -ForegroundColor White

