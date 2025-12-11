# 🔧 Fix mit lokalen Änderungen

## Problem
```
error: Your local changes to the following files would be overwritten by merge:
        integration/RUN_ON_HETZNER.sh
```

## Lösung

### Option 1: Stash + Pull + Fix (empfohlen)

```bash
# 1. Lokale Änderungen stashen
git stash

# 2. Git Pull
git pull --no-rebase origin main

# 3. Fix anwenden
sed -i 's/"maxTokens": 8000/"maxTokens": 6000/' /opt/ck-agent/agents/chart-development.json

# 4. MCP Server neu starten
systemctl restart mcp
sleep 3

# 5. Testen
curl -X POST http://localhost:7000/agent/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Erstelle eine Bodygraph-Komponente"}' | python3 -m json.tool
```

### Option 2: Alles in einem Befehl

```bash
git stash && \
git pull --no-rebase origin main && \
sed -i 's/"maxTokens": 8000/"maxTokens": 6000/' /opt/ck-agent/agents/chart-development.json && \
systemctl restart mcp && \
sleep 3 && \
curl -X POST http://localhost:7000/agent/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Erstelle eine Bodygraph-Komponente"}' | python3 -m json.tool
```

### Option 3: Lokale Änderungen verwerfen (wenn nicht wichtig)

```bash
# 1. Lokale Änderungen verwerfen
git checkout -- integration/RUN_ON_HETZNER.sh

# 2. Git Pull
git pull --no-rebase origin main

# 3. Fix anwenden
sed -i 's/"maxTokens": 8000/"maxTokens": 6000/' /opt/ck-agent/agents/chart-development.json

# 4. MCP Server neu starten
systemctl restart mcp
sleep 3
```

## Empfehlung

**Option 1** ist am sichersten, da lokale Änderungen gespeichert werden (falls sie wichtig sind).

