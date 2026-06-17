# 🚀 n8n Workflow - Nächste Schritte Befehle

**Status:** Workflow aktiviert, doppelte Workflows entfernt

---

## ✅ Schritt 1: System-Status prüfen

### Server 138 (Hetzner) - MCP Gateway & n8n

```bash
# SSH zu Server 138
ssh root@138.199.237.34

# MCP Gateway Status prüfen
docker ps | grep mcp-gateway

# n8n Status prüfen
docker ps | grep n8n

# MCP Gateway Logs prüfen
docker logs mcp-gateway --tail 50

# n8n Logs prüfen
docker logs n8n --tail 50
```

**Erwartete Ausgabe:**
- `mcp-gateway` Container läuft (Port 7000)
- `n8n` Container läuft (Port 5678)

---

## ✅ Schritt 2: Frontend Status prüfen (Server 167)

```bash
# SSH zu Server 167
ssh root@167.xxx.xxx.xxx

# Frontend Container Status
docker ps | grep frontend

# Frontend Logs prüfen
docker logs the-connection-key-frontend-1 --tail 50

# Prüfe API Route existiert
ls -la /opt/hd-app/The-Connection-Key/frontend/app/api/reading/generate/route.ts
```

**Erwartete Ausgabe:**
- Frontend Container läuft
- API Route existiert

---

## ✅ Schritt 3: Webhook-URL prüfen

**In n8n UI:**
1. Öffne: `https://n8n.werdemeisterdeinergedankenagent.de`
2. Workflow: "Reading Generation Workflow"
3. Klicke auf "Reading Webhook" Node
4. Kopiere Production URL

**Sollte sein:**
```
https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading
```

**Test mit curl:**
```bash
# Test-Request an n8n Webhook
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading \
  -H "Content-Type: application/json" \
  -d '{
    "readingId": "test-reading-123",
    "name": "Test User",
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany",
    "readingType": "basic",
    "focus": "Karriere"
  }'
```

**Erwartete Response:**
```json
{
  "success": true,
  "readingId": "test-reading-123",
  "message": "Reading erfolgreich generiert und reading_jobs updated"
}
```

---

## ✅ Schritt 4: End-to-End Test

### Option A: Manuell in n8n

**In n8n UI:**
1. Workflow öffnen
2. "Execute workflow" klicken
3. Test-Daten eingeben:
   ```json
   {
     "readingId": "test-reading-123",
     "name": "Test User",
     "birthDate": "1990-05-15",
     "birthTime": "14:30",
     "birthPlace": "Berlin, Germany",
     "readingType": "basic",
     "focus": "Karriere"
   }
   ```
4. Execution prüfen (Executions Tab)

### Option B: Vom Frontend testen

**Frontend öffnen:**
```
https://www.the-connection-key.de
```

**Reading-Job erstellen:**
1. Login
2. Reading-Formular ausfüllen
3. Submit
4. Status prüfen (sollte auf "completed" wechseln)

---

## ✅ Schritt 5: Supabase prüfen

```bash
# Auf Server 167 oder lokal
# Prüfe reading_jobs Tabelle

# Via Supabase Dashboard:
# https://supabase.com/dashboard/project/njjcywgskzepikyzhihy/editor

# Oder via SQL:
SELECT 
  id,
  status,
  reading_type,
  created_at,
  updated_at
FROM reading_jobs
ORDER BY created_at DESC
LIMIT 10;
```

**Erwartete Ausgabe:**
- Neue Jobs mit Status "completed" oder "failed"
- Keine Jobs mehr im Status "pending" (außer gerade laufende)

---

## ✅ Schritt 6: Logs prüfen

### n8n Execution Logs

**In n8n UI:**
1. Workflow → "Executions" Tab
2. Letzte Execution öffnen
3. Prüfe:
   - ✅ "Validate Payload" erfolgreich
   - ✅ "Call Reading Agent" erfolgreich
   - ✅ "Save Reading" erfolgreich
   - ✅ "Update Reading Job" erfolgreich

### MCP Gateway Logs

```bash
# Auf Server 138
docker logs mcp-gateway --tail 100 | grep -i "reading\|error"
```

### Frontend Logs

```bash
# Auf Server 167
docker logs the-connection-key-frontend-1 --tail 100 | grep -i "reading\|error"
```

---

## ✅ Schritt 7: Vollständiger Test-Durchlauf

**Test-Script (lokal ausführen):**

```bash
#!/bin/bash

# Test-Daten
READING_ID="test-$(date +%s)"
N8N_WEBHOOK="https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading"

echo "🧪 Test: Reading Generation Workflow"
echo "Reading ID: $READING_ID"
echo ""

# 1. Webhook triggern
echo "1️⃣ Trigger n8n Webhook..."
RESPONSE=$(curl -s -X POST "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d "{
    \"readingId\": \"$READING_ID\",
    \"name\": \"Test User\",
    \"birthDate\": \"1990-05-15\",
    \"birthTime\": \"14:30\",
    \"birthPlace\": \"Berlin, Germany\",
    \"readingType\": \"basic\",
    \"focus\": \"Karriere\"
  }")

echo "Response: $RESPONSE"
echo ""

# 2. Warte 10 Sekunden
echo "2️⃣ Warte 10 Sekunden..."
sleep 10

# 3. Prüfe reading_jobs Status
echo "3️⃣ Prüfe reading_jobs Status..."
echo "→ Öffne Supabase Dashboard und prüfe Status für ID: $READING_ID"
echo ""

echo "✅ Test abgeschlossen!"
```

---

## 📋 Checkliste

**Vor Produktion prüfen:**

- [ ] MCP Gateway läuft (Server 138)
- [ ] n8n läuft (Server 138)
- [ ] Frontend läuft (Server 167)
- [ ] Webhook-URL funktioniert
- [ ] Test-Request erfolgreich
- [ ] reading_jobs wird aktualisiert
- [ ] readings wird gespeichert
- [ ] Keine Fehler in Logs

---

## 🎯 Nächste Schritte nach erfolgreichem Test

1. **Frontend Integration prüfen:**
   - `/api/reading/generate` Route testen
   - Polling für Status prüfen

2. **Monitoring einrichten:**
   - n8n Executions überwachen
   - Fehler-Logs prüfen

3. **Dokumentation aktualisieren:**
   - Webhook-URL dokumentieren
   - Test-Prozedur dokumentieren

---

**Alle Befehle sind kopierbar und direkt ausführbar!** ✅
