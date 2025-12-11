#!/bin/bash
# Agent-Status Check Script
# Prüft Status aller Agenten

echo "🤖 Agent-Status Check"
echo "===================="
echo ""

# MCP Server
echo "📡 MCP Server (Port 7000):"
if curl -s --max-time 5 http://138.199.237.34:7000/health > /dev/null 2>&1; then
    echo "   ✅ Online"
    AGENTS=$(curl -s http://138.199.237.34:7000/agents 2>/dev/null | jq -r '.agents[].id' 2>/dev/null | tr '\n' ', ' | sed 's/,$//')
    if [ ! -z "$AGENTS" ]; then
        echo "   Agenten: $AGENTS"
    fi
else
    echo "   ❌ Offline"
fi
echo ""

# Reading Agent
echo "📚 Reading Agent (Port 4001):"
if curl -s --max-time 5 http://138.199.237.34:4001/health > /dev/null 2>&1; then
    echo "   ✅ Online"
    HEALTH=$(curl -s http://138.199.237.34:4001/health 2>/dev/null | jq -r '.status // "ok"' 2>/dev/null)
    KNOWLEDGE=$(curl -s http://138.199.237.34:4001/health 2>/dev/null | jq -r '.knowledge // 0' 2>/dev/null)
    TEMPLATES=$(curl -s http://138.199.237.34:4001/health 2>/dev/null | jq -r '.templates // 0' 2>/dev/null)
    echo "   Status: $HEALTH"
    echo "   Knowledge: $KNOWLEDGE Dateien"
    echo "   Templates: $TEMPLATES Dateien"
else
    echo "   ❌ Offline"
fi
echo ""

# Systemd Services
echo "⚙️  Systemd Services:"
if systemctl is-active --quiet mcp 2>/dev/null; then
    echo "   ✅ MCP Service aktiv"
else
    echo "   ❌ MCP Service inaktiv"
fi
echo ""

# PM2 Processes
echo "🔄 PM2 Processes:"
if command -v pm2 > /dev/null 2>&1; then
    if pm2 list 2>/dev/null | grep -q reading-agent; then
        echo "   ✅ Reading Agent läuft"
        STATUS=$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.name=="reading-agent") | .pm2_env.status' 2>/dev/null)
        echo "   Status: $STATUS"
    else
        echo "   ❌ Reading Agent läuft nicht"
    fi
else
    echo "   ⚠️  PM2 nicht installiert"
fi
echo ""

# Docker Services
echo "🐳 Docker Services:"
if command -v docker > /dev/null 2>&1; then
    if docker ps 2>/dev/null | grep -q chatgpt-agent; then
        echo "   ✅ chatgpt-agent läuft"
    else
        echo "   ❌ chatgpt-agent läuft nicht"
    fi
    
    if docker ps 2>/dev/null | grep -q n8n; then
        echo "   ✅ n8n läuft"
    else
        echo "   ❌ n8n läuft nicht"
    fi
else
    echo "   ⚠️  Docker nicht installiert"
fi
echo ""

echo "===================="
echo "✅ Status-Check abgeschlossen"
echo ""

