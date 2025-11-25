# MCP Server - Connection Key

Ein MCP (Model Context Protocol) Server mit verschiedenen nützlichen Tools für Cursor IDE.

## Verfügbare Tools

Der Server stellt folgende Tools zur Verfügung:

### 1. **ping**
Test-Tool zur Überprüfung der Server-Verbindung.
- **Parameter:** Keine
- **Ausgabe:** "pong"

### 2. **echo**
Gibt den eingegebenen Text zurück. Nützlich zum Testen von Parametern.
- **Parameter:**
  - `text` (string): Der Text, der zurückgegeben werden soll
- **Ausgabe:** Der eingegebene Text

### 3. **getDateTime**
Gibt das aktuelle Datum und die aktuelle Uhrzeit zurück.
- **Parameter:**
  - `timezone` (string, optional): Zeitzone (z.B. 'Europe/Berlin'), Standard: UTC
- **Ausgabe:**
  - `dateTime`: Formatierte Datum/Zeit-String
  - `timestamp`: Unix-Timestamp
  - `timezone`: Verwendete Zeitzone

### 4. **calculate**
Führt mathematische Berechnungen durch.
- **Parameter:**
  - `expression` (string): Mathematischer Ausdruck (z.B. '2 + 2', '10 * 5', '2 ** 3')
- **Unterstützte Operatoren:** +, -, *, /, %, ** (Potenz)
- **Ausgabe:**
  - `result`: Berechnungsergebnis
  - `expression`: Ursprünglicher Ausdruck

### 5. **generateUUID**
Generiert eine eindeutige UUID (Universally Unique Identifier).
- **Parameter:**
  - `version` (enum, optional): UUID Version - "v4" (zufällig, Standard) oder "v1" (zeitbasiert)
- **Ausgabe:**
  - `uuid`: Generierte UUID
  - `version`: Verwendete Version

## n8n Integration Tools

### 6. **callN8N**
Ruft die n8n REST API auf. Kann Workflows starten, Daten senden oder abrufen.
- **Parameter:**
  - `endpoint` (string): API-Endpoint (z.B. '/api/v1/workflows' oder '/webhook/reading')
  - `method` (enum): HTTP-Methode - GET, POST, PUT, DELETE, PATCH (Standard: POST)
  - `body` (object, optional): Request Body als JSON-Objekt
  - `headers` (object, optional): Zusätzliche HTTP-Header
- **Ausgabe:**
  - `status`: HTTP-Status-Code
  - `data`: Antwort-Daten
  - `success`: Erfolgsstatus

### 7. **createN8NWorkflow**
Erstellt einen neuen n8n Workflow mit dem angegebenen Namen und Nodes.
- **Parameter:**
  - `name` (string): Name des Workflows
  - `nodes` (array): Array von Workflow-Nodes
  - `active` (boolean, optional): Workflow aktivieren (Standard: false)
  - `tags` (array, optional): Tags für den Workflow
- **Ausgabe:**
  - `workflowId`: ID des erstellten Workflows
  - `name`: Workflow-Name
  - `nodeCount`: Anzahl der Nodes
  - `message`: Statusmeldung

### 8. **triggerN8NWebhook**
Löst einen n8n Webhook-Workflow aus. Nützlich zum Starten von Automatisierungen.
- **Parameter:**
  - `webhookPath` (string): Webhook-Pfad (z.B. 'reading', 'matching', 'chart-analysis')
  - `data` (object): Daten, die an den Webhook gesendet werden sollen
- **Ausgabe:**
  - `success`: Erfolgsstatus
  - `executionId`: ID der Ausführung (optional)
  - `message`: Statusmeldung

## Human Design Tools

### 9. **generateReading**
Generiert ein Human Design Reading basierend auf Geburtsdaten. Ruft n8n Workflow auf.
- **Parameter:**
  - `birthDate` (string): Geburtsdatum im Format YYYY-MM-DD
  - `birthTime` (string): Geburtszeit im Format HH:MM
  - `birthPlace` (string): Geburtsort
  - `userId` (string, optional): User-ID
  - `readingType` (enum, optional): Art des Readings - basic, detailed, business, relationship (Standard: basic)
- **Ausgabe:**
  - `readingId`: ID des generierten Readings
  - `chartData`: Chart-Daten
  - `reading`: Reading-Text
  - `success`: Erfolgsstatus

### 10. **analyzeChart**
Analysiert Human Design Chart-Daten und gibt detaillierte Informationen zurück.
- **Parameter:**
  - `chartData` (object): Chart-Daten (Typ, Zentren, Channels, etc.)
  - `analysisType` (enum, optional): Art der Analyse - type, centers, channels, gates, profile, full (Standard: full)
- **Ausgabe:**
  - `analysis`: Analyse-Ergebnisse
  - `summary`: Zusammenfassung
  - `success`: Erfolgsstatus

## Matching Tools

### 11. **matchPartner**
Führt Human Design Partner-Matching zwischen zwei Personen durch.
- **Parameter:**
  - `user1Chart` (object): Chart-Daten der ersten Person
  - `user2Chart` (object): Chart-Daten der zweiten Person
  - `matchingType` (enum, optional): Art des Matchings - compatibility, relationship, business, full (Standard: compatibility)
  - `userId1` (string, optional): User-ID der ersten Person
  - `userId2` (string, optional): User-ID der zweiten Person
- **Ausgabe:**
  - `matchId`: ID des Matchings
  - `compatibilityScore`: Kompatibilitäts-Score (0-100)
  - `analysis`: Detaillierte Analyse
  - `recommendations`: Empfehlungen als Array
  - `success`: Erfolgsstatus

## User Data Tools

### 12. **saveUserData**
Speichert User-Daten über n8n Webhook. Nützlich für App-User-Login und Datenverarbeitung.
- **Parameter:**
  - `userId` (string): User-ID
  - `data` (object): Zu speichernde Daten
  - `dataType` (enum, optional): Art der Daten - profile, chart, reading, preferences, custom (Standard: custom)
- **Ausgabe:**
  - `success`: Erfolgsstatus
  - `recordId`: ID des gespeicherten Records (optional)
  - `message`: Statusmeldung

## Installation

1. Stellen Sie sicher, dass Node.js installiert ist
2. Installieren Sie die Abhängigkeiten:
```bash
npm install
```

3. Konfigurieren Sie die n8n-Verbindung:
   - Öffnen Sie `config.js`
   - Passen Sie die `n8n.baseUrl` an Ihre n8n-Instanz an
   - Optional: Setzen Sie `N8N_API_KEY` als Umgebungsvariable, falls benötigt

   Oder setzen Sie Umgebungsvariablen:
   ```bash
   # Windows PowerShell
   $env:N8N_BASE_URL="https://n8n.deinedomain.tld"
   $env:N8N_API_KEY="your-api-key"
   
   # Linux/Mac
   export N8N_BASE_URL="https://n8n.deinedomain.tld"
   export N8N_API_KEY="your-api-key"
   ```

## Konfiguration in Cursor IDE

Um den MCP-Server in Cursor IDE zu verwenden, müssen Sie ihn in den Cursor-Einstellungen konfigurieren:

1. Öffnen Sie die Cursor-Einstellungen (File → Preferences → Settings)
2. Suchen Sie nach "MCP" oder "Model Context Protocol"
3. Fügen Sie die folgende Konfiguration hinzu:

```json
{
  "mcpServers": {
    "mcp-server": {
      "command": "node",
      "args": [
        "C:\\AppProgrammierung\\Projekte\\MCP_Connection_Key\\index.js"
      ],
      "cwd": "C:\\AppProgrammierung\\Projekte\\MCP_Connection_Key"
    }
  }
}
```

**Wichtig:** Passen Sie die Pfade an Ihren System an!

### Alternative: Verwendung von mcp.json

Die Datei `mcp.json` in diesem Projekt kann als Referenz dienen. Kopieren Sie den Inhalt in Ihre Cursor-Konfiguration.

## Server starten (manuell)

Um den Server manuell zu testen:

```bash
npm start
```

Der Server läuft dann über stdio und wartet auf Verbindungen von Cursor.

## Fehlerbehebung

### Tools werden nicht angezeigt

1. **Server-Verbindung prüfen:**
   - Stellen Sie sicher, dass der Server in den Cursor-Einstellungen korrekt konfiguriert ist
   - Überprüfen Sie die Pfade in der Konfiguration

2. **Cursor neu starten:**
   - Starten Sie Cursor neu, damit die MCP-Konfiguration geladen wird

3. **Logs überprüfen:**
   - Öffnen Sie das Output-Panel in Cursor
   - Wählen Sie "MCP" oder "Model Context Protocol" aus
   - Suchen Sie nach Fehlermeldungen

4. **Server manuell testen:**
   - Führen Sie `npm start` aus
   - Der Server sollte ohne Fehler starten

### Häufige Fehler

- **"Cannot find module"**: Stellen Sie sicher, dass `npm install` ausgeführt wurde
- **"EACCES" oder Berechtigungsfehler**: Überprüfen Sie die Dateiberechtigungen
- **"Command not found"**: Stellen Sie sicher, dass Node.js im PATH ist

## Entwicklung

### Neue Tools hinzufügen

Um ein neues Tool hinzuzufügen, verwenden Sie die `registerTool`-Methode:

```javascript
server.registerTool(
  "toolName",
  {
    title: "Tool Titel",
    description: "Beschreibung des Tools",
    inputSchema: z.object({
      // Ihre Parameter hier
    }),
    outputSchema: z.object({
      // Ihre Ausgabe hier
    })
  },
  async (params) => {
    // Ihre Tool-Logik hier
    return {
      content: [{ type: "text", text: "Ergebnis" }],
      structuredContent: { /* strukturierte Daten */ }
    };
  }
);
```

## Architektur

Der MCP-Server ist Teil einer größeren Architektur:

```
App
 ↓  
Connection-Key Server  ←→  MCP Server
 ↓                      ↑
n8n ←———————————————————
```

**Komponenten:**
- **App**: Sendet User-Wünsche
- **Connection-Key Server**: Zentrale API, steuert n8n + MCP
- **MCP Server**: Tools, KI-Agenten, Automationen (dieser Server)
- **n8n**: Workflows, Datenfluss, Integration, Datenverarbeitung

**Kommunikation:**
- Die App kommuniziert nur mit dem Connection-Key Server
- Der Connection-Key Server ruft n8n Workflows auf
- Der Connection-Key Server nutzt den MCP-Server als Agenten-Framework
- Der MCP-Server ruft n8n APIs/Webhooks auf

## Beispiel-Verwendung

### Beispiel 1: Human Design Reading generieren

```javascript
// In Cursor können Sie jetzt sagen:
"Erstelle mir ein Human Design Reading für einen User, geboren am 1990-05-15 um 14:30 in Berlin"
```

Der MCP-Server ruft dann automatisch den n8n Webhook auf und generiert das Reading.

### Beispiel 2: Workflow erstellen

```javascript
"Erstelle einen n8n Workflow namens 'User Login Reading' mit 3 Nodes"
```

### Beispiel 3: Partner-Matching

```javascript
"Führe ein Partner-Matching zwischen User 123 und User 456 durch"
```

## Technische Details

- **Framework:** @modelcontextprotocol/sdk v1.0.0+
- **Schema-Validierung:** Zod
- **Transport:** stdio (Standard Input/Output)
- **Node.js:** Erforderlich
- **n8n Integration:** Über REST API und Webhooks
- **Konfiguration:** Über `config.js` oder Umgebungsvariablen

## Lizenz

Dieses Projekt ist für den persönlichen Gebrauch bestimmt.

