#!/bin/bash
# Prüft alle konfigurierten Agenten auf dem Server

MCP_DIR="/opt/mcp"
AGENT_DIR="/opt/ck-agent"

echo "🤖 Konfigurierte Agenten prüfen"
echo "================================"
echo ""

# Prüfe ob MCP läuft
if systemctl is-active --quiet mcp 2>/dev/null; then
    echo "✅ MCP Server läuft"
    echo ""
    
    # Agenten über API abfragen
    echo "📡 Agenten über API:"
    curl -s http://localhost:7000/agents 2>/dev/null | python3 -m json.tool 2>/dev/null || curl -s http://localhost:7000/agents
    echo ""
else
    echo "⚠️  MCP Server läuft nicht"
    echo ""
fi

# Prüfe Agent-Dateien
if [ -d "$AGENT_DIR/agents" ]; then
    echo "📁 Agent-Konfigurationsdateien:"
    ls -la $AGENT_DIR/agents/*.json 2>/dev/null | awk '{print "   - " $9}' || echo "   Keine gefunden"
    echo ""
    
    echo "📋 Agent-Details:"
    for file in $AGENT_DIR/agents/*.json; do
        if [ -f "$file" ]; then
            echo ""
            echo "   $(basename $file):"
            cat "$file" | python3 -m json.tool 2>/dev/null || cat "$file"
        fi
    done
else
    echo "⚠️  Agent-Verzeichnis nicht gefunden: $AGENT_DIR/agents"
fi

echo ""
echo "================================"
echo "✅ Prüfung abgeschlossen"
echo ""

