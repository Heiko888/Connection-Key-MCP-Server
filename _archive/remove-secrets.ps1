# Script zum Entfernen von OpenAI API Keys aus Dateien

$files = @(
    "SETUP_SERVER_ENV.md",
    "SERVER_COMMANDS.md",
    "SETUP_PRODUCTION_SERVER.md",
    "START_READING_AGENT_FINAL.sh",
    "fix-production-env.sh",
    "setup-production-quick.sh"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        # Ersetze alle OpenAI API Keys mit Platzhaltern
        $content = $content -replace 'sk-[a-zA-Z0-9_-]{20,}', 'YOUR_OPENAI_API_KEY_HERE'
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "✅ $file bereinigt"
    }
}
