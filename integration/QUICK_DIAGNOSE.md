# 🔍 Quick Diagnose - Wo ist das Problem?

## ❓ Fragen zur Diagnose

### 1. Wo sehen Sie den Fehler "Cannot GET /agent/marketing"?

**A) Im Browser auf der Frontend-Seite?**
```
https://www.the-connection-key.de/agents/marketing
```
→ Problem: Frontend-Komponente macht GET statt POST

**B) Direkt im Browser auf Hetzner Server?**
```
http://138.199.237.34:7000/agent/marketing
```
→ Normal: Browser macht GET, MCP Server akzeptiert nur POST

**C) In n8n Workflow?**
```
n8n → HTTP Request → http://138.199.237.34:7000/agent/marketing
```
→ Problem: HTTP Request Node ist auf GET statt POST

**D) In Browser-Console (F12)?**
```
Console zeigt: Cannot GET /agent/marketing
```
→ Problem: Frontend macht GET statt POST

---

## ✅ Was funktioniert hat

Sie haben erfolgreich getestet:
```bash
curl -X POST http://localhost:3000/api/agents/marketing ...
```
→ ✅ Das funktioniert! Next.js API-Route ist korrekt.

---

## 🔍 Schnell-Check

### Prüfen Sie Frontend-Komponente:

```bash
# Auf CK-App Server
find /opt/hd-app/The-Connection-Key/frontend -name "AgentChat.tsx" -exec grep -l "fetch.*agents" {} \;

# Prüfe ob POST verwendet wird
grep -A 3 "fetch.*agents" /opt/hd-app/The-Connection-Key/frontend/components/**/AgentChat.tsx
```

**Sollte zeigen:**
```typescript
method: 'POST'  // ✅
```

**Falls GET:**
```typescript
method: 'GET'  // ❌ Falsch!
```

---

## 🛠️ Quick Fix

### Falls Frontend GET verwendet:

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend

# Finde AgentChat.tsx
find . -name "AgentChat.tsx" -exec sed -i "s/method: 'GET'/method: 'POST'/g" {} \;
find . -name "AgentChat.tsx" -exec sed -i 's/method: "GET"/method: "POST"/g' {} \;
```

### Falls n8n GET verwendet:

1. Öffnen Sie n8n
2. Öffnen Sie HTTP Request Node
3. Ändern Sie **Method:** `GET` → `POST`

---

## 📋 Zusammenfassung

**Was funktioniert:**
- ✅ Next.js API-Route (`/api/agents/marketing`) funktioniert
- ✅ MCP Server funktioniert

**Was nicht funktioniert:**
- ❌ GET-Request an `/agent/marketing` (nur POST funktioniert)

**Wo ist das Problem?**
- Frontend-Komponente? → Prüfen Sie AgentChat.tsx
- n8n Workflow? → Prüfen Sie HTTP Request Node (Method: POST)
- Browser-Direktaufruf? → Normal, verwenden Sie POST mit curl

