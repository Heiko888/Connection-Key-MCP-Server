# 🔧 Quick Fix - maxTokens Problem

## Problem
- Git Pull fehlgeschlagen (divergente Branches)
- Fix-Script noch nicht auf Server

## Lösung

### Schritt 1: Git Pull mit Merge

```bash
git pull --no-rebase origin main
```

### Schritt 2: Fix direkt anwenden (ohne Script)

```bash
# Reduziere maxTokens auf 6000
sed -i 's/"maxTokens": 8000/"maxTokens": 6000/' /opt/ck-agent/agents/chart-development.json

# MCP Server neu starten
systemctl restart mcp
sleep 3

# Testen
curl -X POST http://localhost:7000/agent/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Erstelle eine Bodygraph-Komponente"}' | python3 -m json.tool
```

### Schritt 3: Oder Fix-Script ausführen (nach Git Pull)

```bash
chmod +x integration/FIX_CHART_AGENT_MAX_TOKENS.sh
./integration/FIX_CHART_AGENT_MAX_TOKENS.sh
```

## Alles in einem Befehl

```bash
git pull --no-rebase origin main && \
sed -i 's/"maxTokens": 8000/"maxTokens": 6000/' /opt/ck-agent/agents/chart-development.json && \
systemctl restart mcp && \
sleep 3 && \
curl -X POST http://localhost:7000/agent/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Test"}' | python3 -m json.tool
```

