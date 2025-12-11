# 🔍 Lokale Konfiguration prüfen

## Wo ist der OpenAI API Key lokal?

### 1. System-Environment-Variablen (Windows)

```powershell
# Prüfen ob gesetzt
$env:OPENAI_API_KEY

# Setzen (nur für diese Session)
$env:OPENAI_API_KEY = "sk-your-key-here"

# Permanently setzen (User-Level)
[System.Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "sk-your-key-here", "User")
```

### 2. .env Datei (lokal)

```powershell
# Prüfen ob .env existiert
Test-Path .env

# Erstellen aus .env.example
Copy-Item .env.example .env

# Bearbeiten
notepad .env
```

### 3. Cursor IDE Environment (mcp.json)

Der lokale MCP Server läuft über `mcp.json`. Aktuell ist `"env": {}` leer.

Sie können Environment-Variablen in `mcp.json` setzen:

```json
{
  "mcpServers": {
    "mcp-server": {
      "command": "node",
      "args": [
        "C:\\AppProgrammierung\\Projekte\\MCP_Connection_Key\\index.js"
      ],
      "cwd": "C:\\AppProgrammierung\\Projekte\\MCP_Connection_Key",
      "env": {
        "OPENAI_API_KEY": "sk-your-key-here"
      }
    }
  }
}
```

## Empfehlung für lokale Entwicklung

**Option 1: .env Datei erstellen (empfohlen)**

```powershell
# .env aus .env.example erstellen
Copy-Item .env.example .env

# Bearbeiten und OPENAI_API_KEY eintragen
notepad .env
```

**Option 2: System-Environment-Variable setzen**

```powershell
[System.Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "sk-your-key-here", "User")
# Dann PowerShell neu starten
```

**Option 3: In mcp.json eintragen**

Bearbeiten Sie `mcp.json` und fügen Sie den Key in `"env"` ein.

