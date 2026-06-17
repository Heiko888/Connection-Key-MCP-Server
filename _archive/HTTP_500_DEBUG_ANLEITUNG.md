# 🔍 HTTP 500 Debug - Marketing & Sales Agent

**Problem:** `/api/agents/marketing` und `/api/agents/sales` geben HTTP 500 zurück

**Status:**
- ✅ `/api/agents/automation` - Funktioniert (HTTP 200)
- ✅ `/api/agents/social-youtube` - Funktioniert (HTTP 200)
- ✅ `/api/agents/chart-development` - Funktioniert (HTTP 200)
- ❌ `/api/agents/marketing` - HTTP 500
- ❌ `/api/agents/sales` - HTTP 500

---

## 🔍 Debug-Schritte

### Schritt 1: Debug-Script ausführen

```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
chmod +x debug-agent-500-errors.sh
./debug-agent-500-errors.sh
```

**Das Script prüft:**
- Container-Logs für Fehler
- Route-Dateien auf Unterschiede
- Environment Variables
- MCP Server Erreichbarkeit

---

### Schritt 2: Detaillierte Logs prüfen

```bash
# Vollständige Logs
docker compose -f docker-compose.yml logs frontend | tail -100

# Nur Fehler
docker compose -f docker-compose.yml logs frontend | grep -i -E "(error|500|marketing|sales)" | tail -50

# Live-Logs während Test
docker compose -f docker-compose.yml logs -f frontend
# (In anderem Terminal testen)
curl -X POST http://localhost:3000/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

---

### Schritt 3: MCP Server direkt testen

```bash
# Marketing Agent
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test", "userId": "test"}'

# Sales Agent
curl -X POST http://138.199.237.34:7000/agent/sales \
  -H "Content-Type: application/json" \
  -d '{"message": "Test", "userId": "test"}'
```

**Erwartet:** JSON Response mit `response` oder `error`

---

### Schritt 4: Route-Dateien prüfen

```bash
# Prüfe ob Dateien identisch sind
diff frontend/app/api/agents/automation/route.ts frontend/app/api/agents/marketing/route.ts
diff frontend/app/api/agents/automation/route.ts frontend/app/api/agents/sales/route.ts

# Prüfe erste 50 Zeilen
head -50 frontend/app/api/agents/marketing/route.ts
head -50 frontend/app/api/agents/sales/route.ts
```

---

## 🔧 Mögliche Ursachen

### 1. Supabase-Verbindungsfehler
**Symptom:** Fehler beim Erstellen des Tasks in Supabase

**Lösung:**
```bash
# Prüfe Environment Variables
docker exec $(docker ps -q -f name=frontend) env | grep SUPABASE

# Prüfe .env Datei
cat .env | grep SUPABASE
```

---

### 2. MCP Server nicht erreichbar
**Symptom:** Timeout oder Connection Error

**Lösung:**
```bash
# Teste MCP Server direkt
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'

# Prüfe MCP Server Status
curl http://138.199.237.34:7000/health || echo "MCP Server nicht erreichbar"
```

---

### 3. Fehler in Route-Logik
**Symptom:** JavaScript/TypeScript Fehler

**Lösung:**
- Route-Dateien neu kopieren
- Container neu bauen

```bash
# Route-Dateien neu kopieren (falls integration/ vorhanden)
cp integration/api-routes/app-router/agents/marketing/route.ts frontend/app/api/agents/marketing/route.ts
cp integration/api-routes/app-router/agents/sales/route.ts frontend/app/api/agents/sales/route.ts

# Container neu bauen
docker compose -f docker-compose.yml build --no-cache frontend
docker compose -f docker-compose.yml up -d frontend
```

---

### 4. Fehlende Environment Variables
**Symptom:** `undefined` Fehler in Logs

**Lösung:**
```bash
# Prüfe .env Datei
cat .env | grep -E "SUPABASE|MCP"

# Prüfe Container Environment
docker exec $(docker ps -q -f name=frontend) env | grep -E "SUPABASE|MCP"
```

---

## 🚀 Quick Fix

**Falls die Routen identisch sind, aber unterschiedlich funktionieren:**

```bash
# 1. Route-Dateien neu kopieren (von funktionierender Route)
cp frontend/app/api/agents/automation/route.ts frontend/app/api/agents/marketing/route.ts
cp frontend/app/api/agents/automation/route.ts frontend/app/api/agents/sales/route.ts

# 2. AGENT_ID anpassen
sed -i "s/AGENT_ID = 'automation'/AGENT_ID = 'marketing'/" frontend/app/api/agents/marketing/route.ts
sed -i "s/AGENT_NAME = 'Automation Agent'/AGENT_NAME = 'Marketing Agent'/" frontend/app/api/agents/marketing/route.ts

sed -i "s/AGENT_ID = 'automation'/AGENT_ID = 'sales'/" frontend/app/api/agents/sales/route.ts
sed -i "s/AGENT_NAME = 'Automation Agent'/AGENT_NAME = 'Sales Agent'/" frontend/app/api/agents/sales/route.ts

# 3. Container neu bauen
docker compose -f docker-compose.yml build --no-cache frontend
docker compose -f docker-compose.yml up -d frontend

# 4. Testen
curl -X POST http://localhost:3000/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'

curl -X POST http://localhost:3000/api/agents/sales \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

---

**🎯 Führe zuerst das Debug-Script aus, um die genaue Ursache zu finden!**
