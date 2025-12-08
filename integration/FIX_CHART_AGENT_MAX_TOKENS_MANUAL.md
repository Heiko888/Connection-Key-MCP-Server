# 🔧 Fix Chart Development Agent - maxTokens zu hoch

## Problem
```
400 This model's maximum context length is 8192 tokens. 
However, you requested 9560 tokens (1560 in the messages, 8000 in the completion).
```

## Ursache
Die `maxTokens` in der Config-Datei ist auf 8000 gesetzt, aber das Modell (gpt-4) hat ein Maximum von 8192 Tokens insgesamt. Die System-Prompt + Nachricht benötigen bereits ~1560 Tokens, daher bleibt nicht genug Platz für 8000 Tokens in der Completion.

## Lösung

### Option 1: Automatisch (empfohlen)

```bash
cd /opt/mcp-connection-key
chmod +x integration/FIX_CHART_AGENT_MAX_TOKENS.sh
./integration/FIX_CHART_AGENT_MAX_TOKENS.sh
```

### Option 2: Manuell

```bash
# 1. Config-Datei bearbeiten
nano /opt/ck-agent/agents/chart-development.json

# 2. Ändere "maxTokens": 8000 zu "maxTokens": 6000
# Oder noch sicherer: "maxTokens": 4000

# 3. MCP Server neu starten
systemctl restart mcp
sleep 3

# 4. Testen
curl -X POST http://localhost:7000/agent/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Test"}' | python3 -m json.tool
```

### Option 3: Schnell-Fix (sed)

```bash
# Reduziere maxTokens auf 6000
sed -i 's/"maxTokens": 8000/"maxTokens": 6000/' /opt/ck-agent/agents/chart-development.json

# Oder auf 4000 (sicherer)
sed -i 's/"maxTokens": 8000/"maxTokens": 4000/' /opt/ck-agent/agents/chart-development.json

# MCP Server neu starten
systemctl restart mcp
sleep 3
```

## Empfohlene maxTokens-Werte

- **6000**: Für längere Chart-Code-Generierungen (empfohlen)
- **4000**: Für mittlere Chart-Code-Generierungen (sicherer)
- **2000**: Für kurze Antworten (sehr sicher)

## Verifizierung

```bash
# Test-Request
curl -X POST http://localhost:7000/agent/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Erstelle eine Bodygraph-Komponente"}' | python3 -m json.tool
```

**Erwartete Ausgabe:**
```json
{
  "agent": "chart-development",
  "message": "...",
  "response": "...",
  "model": "gpt-4",
  "tokens": ...
}
```

**Kein Fehler mehr!** ✅

