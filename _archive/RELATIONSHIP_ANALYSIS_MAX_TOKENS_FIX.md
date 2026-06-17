# 🔧 Relationship Analysis Agent - maxTokens Fix

**Datum:** 18.12.2025

**Problem:** `maxTokens: 10000` ist zu hoch für GPT-4 (Maximum: 8192 Tokens)

---

## ❌ Fehler

```json
{
  "success": false,
  "error": "Relationship Analysis Agent request failed: 500 {
    \"success\":false,
    \"error\":\"400 This model's maximum context length is 8192 tokens. 
    However, you requested 11080 tokens (1080 in the messages, 10000 in the completion). 
    Please reduce the length of the messages or completion.\"
  }"
}
```

**Ursache:**
- GPT-4 hat ein Maximum von **8192 Tokens** (Context + Completion zusammen)
- System-Prompt + Message benötigen bereits ~1080 Tokens
- `maxTokens: 10000` ist zu hoch

---

## ✅ Lösung

### Option 1: Automatisch (Script)

```bash
# Auf MCP Server
cd /opt/mcp-connection-key

# Script auf Server kopieren (falls noch nicht da)
# ODER direkt ausführen:

chmod +x fix-relationship-analysis-max-tokens.sh
./fix-relationship-analysis-max-tokens.sh
```

---

### Option 2: Manuell (schnell)

```bash
# Auf MCP Server
# Reduziere maxTokens auf 6000
sed -i 's/"maxTokens": 10000/"maxTokens": 6000/' /opt/ck-agent/agents/relationship-analysis-agent.json

# MCP Server neu starten
systemctl restart mcp
sleep 3

# Testen
curl -X POST http://localhost:7000/agent/relationship-analysis-agent \
  -H "Content-Type: application/json" \
  -d '{"message":"Test"}' | jq .
```

---

### Option 3: Manuell (nano)

```bash
# Auf MCP Server
nano /opt/ck-agent/agents/relationship-analysis-agent.json

# Ändere:
# "maxTokens": 10000
# zu:
# "maxTokens": 6000

# Speichern (Ctrl+O, Enter, Ctrl+X)

# MCP Server neu starten
systemctl restart mcp
sleep 3
```

---

## 📊 Empfohlene maxTokens-Werte

- **6000**: Für längere Beziehungsanalysen (empfohlen)
- **4000**: Für mittlere Analysen (sicherer)
- **2000**: Für kurze Analysen (sehr sicher, aber möglicherweise zu kurz)

**Empfehlung:** 6000 (wie bei anderen Agenten)

---

## 🧪 Test nach Fix

```bash
# Test POST (vollständige Analyse)
curl -X POST http://localhost:3000/api/relationship-analysis/generate \
  -H "Content-Type: application/json" \
  -d '{
    "person1": {
      "name": "Heiko",
      "birthDate": "1980-12-08",
      "birthTime": "22:10",
      "birthPlace": "Miltenberg, Germany"
    },
    "person2": {
      "name": "Jani",
      "birthDate": "1977-06-03",
      "birthTime": "19:49",
      "birthPlace": "Wolfenbüttel, Germany"
    },
    "options": {
      "includeEscalation": true,
      "includePartnerProfile": true
    }
  }' | jq .
```

**Erwartet:** Erfolgreiche Analyse (nicht mehr Token-Fehler)

---

## ✅ Nach dem Fix

- [x] maxTokens auf 6000 reduziert
- [x] MCP Server neu gestartet
- [ ] API getestet (sollte jetzt funktionieren)
- [ ] Frontend-Seite getestet

---

**🎯 Nach dem Fix sollte alles funktionieren!** 🚀
