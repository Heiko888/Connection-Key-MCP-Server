# 🔧 createTask Fehler - Fix Anleitung

**Fehler:** `"createTask is not defined"` bei Website/UX Agent

**Ursache:** Alte Version der Route verwendet `createTask()` Funktion, die nicht existiert

---

## ✅ Lösung

### Schritt 1: Route korrigieren

**Script:** `fix-website-ux-agent-createTask-error.sh`

**Auf Server ausführen:**
```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
chmod +x fix-website-ux-agent-createTask-error.sh
./fix-website-ux-agent-createTask-error.sh
```

**Das Script:**
1. ✅ Prüft ob `createTask` in der Route vorhanden ist
2. ✅ Erstellt Backup der alten Route
3. ✅ Erstellt korrigierte Route (verwendet `supabase.from('agent_tasks').insert()`)
4. ✅ Baut Container neu
5. ✅ Startet Container
6. ✅ Testet Route

---

## 🔍 Was war falsch?

### ❌ Alte Version (falsch):
```typescript
// FALSCH - createTask existiert nicht
const taskId = await createTask({
  agent_id: AGENT_ID,
  message: message,
  status: 'pending'
});
```

### ✅ Neue Version (korrekt):
```typescript
// KORREKT - direkter Supabase-Insert
const { data: pendingTask, error: createError } = await supabase
  .from('agent_tasks')
  .insert([{
    user_id: userId || null,
    agent_id: AGENT_ID,
    agent_name: AGENT_NAME,
    task_message: message,
    task_type: 'analysis',
    status: 'pending'
  }])
  .select()
  .single();
```

---

## 📋 Nach dem Fix

**Alle Routen sollten funktionieren:**
- ✅ `/api/agents/website-ux-agent` - Jetzt korrigiert
- ✅ `/api/agents/automation` - Funktioniert bereits
- ✅ `/api/agents/social-youtube` - Funktioniert bereits
- ✅ `/api/agents/chart-development` - Funktioniert bereits
- ⏳ `/api/agents/marketing` - HTTP 500 (andere Ursache)
- ⏳ `/api/agents/sales` - HTTP 500 (andere Ursache)

---

## 🔍 Marketing & Sales HTTP 500

**Nach Fix der Website/UX Route:**

Falls Marketing und Sales immer noch HTTP 500 geben, prüfe:
1. Container-Logs für spezifische Fehler
2. MCP Server Erreichbarkeit für diese Agenten
3. Route-Dateien auf Unterschiede

**Debug-Script:**
```bash
./debug-agent-500-errors.sh
```

---

**🎯 Führe das Fix-Script aus, um den createTask-Fehler zu beheben!**
