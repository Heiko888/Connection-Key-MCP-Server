# 🧪 Alle Agenten Test - Anleitung

**Script:** `test-all-agents.sh`

**Zweck:** Testet alle Agent-API-Routen und Frontend-Seiten

---

## 🚀 Ausführung

**Auf Server ausführen:**
```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
chmod +x test-all-agents.sh
./test-all-agents.sh
```

---

## 📋 Was wird getestet?

### 1. API-Routen

**Tasks Route:**
- ✅ GET `/api/agents/tasks` - Tasks abrufen
- ✅ POST `/api/agents/tasks` - Statistiken abrufen

**Agent-Routen (POST):**
- ✅ `/api/agents/website-ux-agent` - Website / UX Agent
- ✅ `/api/agents/marketing` - Marketing Agent
- ✅ `/api/agents/automation` - Automation Agent
- ✅ `/api/agents/sales` - Sales Agent
- ✅ `/api/agents/social-youtube` - Social-YouTube Agent
- ✅ `/api/agents/chart-development` - Chart Development Agent

**Jede Route wird getestet:**
- POST Request mit Test-Nachricht
- HTTP Status Code prüfen
- Response validieren
- Fehler-Details anzeigen (falls vorhanden)

---

### 2. Frontend-Seiten (optional)

**Getestete Seiten:**
- `/coach/agents/tasks` - Tasks Dashboard
- `/coach/agents/marketing` - Marketing Agent Seite
- `/coach/agents/automation` - Automation Agent Seite
- `/coach/agents/sales` - Sales Agent Seite
- `/coach/agents/social-youtube` - Social-YouTube Agent Seite
- `/coach/agents/chart` - Chart Development Agent Seite

---

## 📊 Ausgabe

**Das Script zeigt:**
1. ✅ Erfolgreiche Routen (HTTP 200)
2. ❌ Fehlerhafte Routen (HTTP 500, 400, etc.)
3. ⚠️  Übersprungene Routen (HTTP 404)
4. 📄 Fehler-Details für fehlerhafte Routen
5. 💡 Empfehlungen für nächste Schritte

---

## 🔍 Beispiel-Ausgabe

```
🧪 Teste alle Agent-Routen
==========================

📋 1. Tasks Route
-----------------
🔍 Teste: Tasks Route
   ✅ GET funktioniert (HTTP 200)
   📊 Tasks gefunden: 42
   ✅ POST (Statistics) funktioniert (HTTP 200)

🤖 2. Agent-Routen
------------------
🔍 Teste: Website / UX Agent (website-ux-agent)
   ✅ POST funktioniert (HTTP 200)
   📄 Response: true

🔍 Teste: Marketing Agent (marketing)
   ✅ POST funktioniert (HTTP 200)

...

📊 3. Zusammenfassung
=====================

✅ Erfolgreich: 7
   - Tasks (GET)
   - Tasks (POST)
   - Website / UX Agent (website-ux-agent)
   - Marketing Agent (marketing)
   ...

❌ Fehler: 0

📈 Gesamt: 7 Routen getestet

💡 5. Empfehlungen
----------------

✅ Alle Agent-Routen funktionieren!
```

---

## 🔧 Bei Fehlern

**Wenn Routen HTTP 500 geben:**

1. **Prüfe Container-Logs:**
   ```bash
   docker compose -f docker-compose.yml logs frontend | tail -100
   ```

2. **Prüfe spezifische Route:**
   ```bash
   cat frontend/app/api/agents/[AGENT_ID]/route.ts | head -60
   ```

3. **Teste MCP Server direkt:**
   ```bash
   curl -X POST http://138.199.237.34:7000/agent/[AGENT_ID] \
     -H 'Content-Type: application/json' \
     -d '{"message": "Test"}'
   ```

4. **Prüfe Environment Variables:**
   ```bash
   docker exec $(docker ps -q -f name=frontend) env | grep SUPABASE
   docker exec $(docker ps -q -f name=frontend) env | grep MCP
   ```

---

## 📝 Nach erfolgreichem Test

**Route Status Matrix aktualisieren:**
- Alle erfolgreichen Routen als ✅ markieren
- Fehlerhafte Routen dokumentieren
- Nächste Schritte planen

---

**🎯 Führe das Script aus, um alle Agenten zu testen!**
