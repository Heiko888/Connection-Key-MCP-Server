# 🔧 Fix: Chart Agent funktioniert nicht

## ❌ Problem

**Frontend-Seite:** `https://www.the-connection-key.de/agents/chart`  
**API-Route sollte sein:** `/api/agents/chart-development`  
**Agent-ID im MCP Server:** `chart-development`

**Mögliche Probleme:**
1. API-Route `/api/agents/chart-development.ts` fehlt auf CK-App Server
2. Frontend-Komponente ruft falschen Endpoint auf
3. Chart Agent nicht im MCP Server konfiguriert

---

## ✅ Lösung

### Schritt 1: Prüfen Sie API-Route auf CK-App Server

```bash
# Auf CK-App Server (167.235.224.149)
ls -la /opt/hd-app/The-Connection-Key/frontend/pages/api/agents/chart-development.ts
```

**Falls nicht vorhanden:**
- API-Route muss erstellt werden

### Schritt 2: Prüfen Sie Frontend-Komponente

```bash
# Auf CK-App Server
find /opt/hd-app/The-Connection-Key/frontend -name "*Chart*.tsx" -o -name "*chart*.tsx"
```

**Sollte zeigen:**
- `components/agents/ChartDevelopment.tsx` oder ähnlich

### Schritt 3: Prüfen Sie MCP Server (Hetzner)

```bash
# Auf Hetzner Server (138.199.237.34)
curl http://138.199.237.34:7000/agents | grep -i chart
```

**Sollte zeigen:**
- `"id": "chart-development"`

---

## 🛠️ Quick Fix

### Option 1: API-Route erstellen (falls fehlt)

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob Route existiert
if [ ! -f "pages/api/agents/chart-development.ts" ]; then
    echo "❌ API-Route fehlt - erstelle sie jetzt..."
    # Kopiere aus integration/api-routes/agents-chart-development.ts
    # Oder führe CREATE_FILES_ON_CK_APP.sh aus
fi
```

### Option 2: Frontend-Komponente prüfen

Die Frontend-Komponente sollte `/api/agents/chart-development` aufrufen:

```typescript
// ✅ Korrekt
const res = await fetch('/api/agents/chart-development', {
  method: 'POST',
  ...
});

// ❌ Falsch
const res = await fetch('/api/agents/chart', {
  method: 'POST',
  ...
});
```

### Option 3: Chart Agent im MCP Server prüfen

```bash
# Auf Hetzner Server
ls -la /opt/ck-agent/agents/chart-development.json
ls -la /opt/ck-agent/prompts/chart-development.txt
```

**Falls fehlt:**
- Führen Sie `integration/install-chart-agent.sh` auf Hetzner Server aus

---

## 📋 Vollständige Diagnose

### Auf CK-App Server:

```bash
# 1. Prüfe API-Route
ls -la pages/api/agents/chart-development.ts

# 2. Prüfe Frontend-Komponente
find . -name "*Chart*.tsx" -o -name "*chart*.tsx"

# 3. Teste API-Route
curl -X POST http://localhost:3000/api/agents/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

### Auf Hetzner Server:

```bash
# 1. Prüfe Agent-Konfiguration
ls -la /opt/ck-agent/agents/chart-development.json
ls -la /opt/ck-agent/prompts/chart-development.txt

# 2. Prüfe MCP Server
curl http://localhost:7000/agents | grep -i chart

# 3. Teste Agent direkt
curl -X POST http://localhost:7000/agent/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

---

## ✅ Erwartete Ergebnisse

### API-Route sollte existieren:
```
/opt/hd-app/The-Connection-Key/frontend/pages/api/agents/chart-development.ts
```

### Frontend-Komponente sollte existieren:
```
/opt/hd-app/The-Connection-Key/frontend/components/agents/ChartDevelopment.tsx
```

### MCP Server sollte Agent auflisten:
```json
{
  "agents": [
    ...
    {
      "id": "chart-development",
      "name": "Chart Development Agent"
    }
  ]
}
```

---

## 🚀 Schnell-Fix Script

Führen Sie auf dem **CK-App Server** aus:

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob API-Route existiert
if [ ! -f "pages/api/agents/chart-development.ts" ]; then
    echo "❌ API-Route fehlt!"
    echo "📋 Führen Sie aus: integration/CREATE_FILES_ON_CK_APP.sh"
    exit 1
fi

# Prüfe ob Frontend-Komponente existiert
if [ ! -f "components/agents/ChartDevelopment.tsx" ]; then
    echo "❌ Frontend-Komponente fehlt!"
    echo "📋 Führen Sie aus: integration/CREATE_FILES_ON_CK_APP.sh"
    exit 1
fi

echo "✅ Alle Dateien vorhanden!"
```

---

## 📋 Zusammenfassung

**Problem:** Chart Agent funktioniert nicht

**Mögliche Ursachen:**
1. ❌ API-Route fehlt auf CK-App Server
2. ❌ Frontend-Komponente fehlt oder ruft falschen Endpoint auf
3. ❌ Chart Agent nicht im MCP Server konfiguriert

**Lösung:**
1. ✅ Prüfen Sie API-Route: `pages/api/agents/chart-development.ts`
2. ✅ Prüfen Sie Frontend-Komponente: `components/agents/ChartDevelopment.tsx`
3. ✅ Prüfen Sie MCP Server: `curl http://138.199.237.34:7000/agents`

