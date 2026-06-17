#!/bin/bash
# Detaillierte Analyse der mcp-server Logs

cd /opt/mcp-connection-key

echo "🔍 Detaillierte mcp-server Log Analyse"
echo "=========================================="
echo ""

# 1. Container Status
echo "📊 Container Status:"
docker inspect mcp-server --format='{{.State.Status}} - Exit Code: {{.State.ExitCode}} - Restart Count: {{.RestartCount}}' 2>/dev/null
echo ""

# 2. Letzte Logs
echo "📋 Letzte 50 Log-Zeilen:"
echo "----------------------------------------"
docker-compose logs --tail=50 mcp-server
echo ""

# 3. Fehler suchen
echo "❌ Fehler in Logs:"
echo "----------------------------------------"
docker-compose logs mcp-server 2>&1 | grep -i -E "(error|exception|failed|fatal|crash)" | tail -20 || echo "Keine offensichtlichen Fehler gefunden"
echo ""

# 4. Exit Code prüfen
echo "🔍 Exit Code Analyse:"
echo "----------------------------------------"
docker inspect mcp-server --format='Exit Code: {{.State.ExitCode}}' 2>/dev/null
echo ""

# 5. Container Events
echo "📅 Container Events (letzte 10):"
echo "----------------------------------------"
docker events --filter container=mcp-server --since 5m --until now 2>/dev/null | tail -10 || echo "Keine Events gefunden"
echo ""

# 6. Prozess Status
echo "⚙️  Prozess Status im Container:"
echo "----------------------------------------"
docker exec mcp-server ps aux 2>/dev/null || echo "Container läuft nicht oder kann nicht betreten werden"
echo ""

# 7. Prüfe ob stdio blockiert
echo "🔌 STDIN/STDOUT Status:"
echo "----------------------------------------"
docker inspect mcp-server --format='{{.Config.OpenStdin}} - {{.Config.Tty}}' 2>/dev/null
echo ""

# 8. Environment Variables
echo "🌍 Environment Variables:"
echo "----------------------------------------"
docker inspect mcp-server --format='{{range .Config.Env}}{{println .}}{{end}}' 2>/dev/null | grep -E "(N8N|MCP|NODE)" || echo "Keine relevanten ENV Vars gefunden"
echo ""

# 9. Zusammenfassung
echo "=========================================="
echo "Zusammenfassung:"
echo "=========================================="
echo ""
echo "Der MCP Server verwendet StdioServerTransport, was bedeutet:"
echo "  - Er kommuniziert über stdin/stdout (nicht HTTP)"
echo "  - Er ist für die Verwendung mit Cursor IDE gedacht"
echo "  - In Docker ohne stdin/stdout Verbindung beendet er sich"
echo ""
echo "Mögliche Lösungen:"
echo "  1. MCP Server stoppen (wird normalerweise lokal verwendet)"
echo "  2. Restart-Policy auf 'no' ändern"
echo "  3. MCP Server als HTTP-Server umbauen (wenn benötigt)"
echo ""

