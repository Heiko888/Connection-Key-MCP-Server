# 🧪 Relationship Analysis Agent - Test nach maxTokens Fix

**Status:** maxTokens auf 6000 reduziert ✅

---

## ✅ Schritt 1: MCP Server Test (ohne jq)

```bash
# Auf MCP Server
curl -X POST http://localhost:7000/agent/relationship-analysis-agent \
  -H "Content-Type: application/json" \
  -d '{"message":"Test"}'
```

**Erwartet:** JSON-Response mit `"response"` oder `"error"` (kein Token-Fehler mehr)

---

## ✅ Schritt 2: Vollständiger Test von CK-App Server

```bash
# Auf CK-App Server (167.235.224.149)
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
  }'
```

**Erwartet:** 
- `"success": true`
- Vollständige Beziehungsanalyse (nicht mehr Token-Fehler)

---

## ✅ Schritt 3: Frontend testen

Öffne im Browser:
```
http://167.235.224.149:3000/coach/readings/create
```

**Erwartet:** 
- Seite lädt
- Relationship Analysis Formular ist sichtbar
- Analyse kann erstellt werden

---

## 🔧 Optional: jq installieren (für bessere JSON-Formatierung)

```bash
# Auf MCP Server
apt install jq -y

# Dann funktioniert:
curl -X POST http://localhost:7000/agent/relationship-analysis-agent \
  -H "Content-Type: application/json" \
  -d '{"message":"Test"}' | jq .
```

---

**🎯 Nach diesen Tests sollte alles funktionieren!** 🚀
