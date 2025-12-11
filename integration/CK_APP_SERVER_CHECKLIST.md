# 📋 CK-App Server (167.235.224.149) - Checkliste

## ✅ Bereits erledigt
- ✅ API-Route erstellt: `pages/api/agents/chart-development.ts`
- ✅ Frontend-Komponente erstellt: `components/agents/ChartDevelopment.tsx`
- ✅ `READING_AGENT_URL` in `.env.local` vorhanden

## ⏳ Noch zu erledigen

### 1. MCP_SERVER_URL hinzufügen

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob MCP_SERVER_URL vorhanden
grep "MCP_SERVER_URL" .env.local

# Falls nicht vorhanden, hinzufügen:
echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local

# Prüfe Ergebnis
cat .env.local | grep -E "(MCP_SERVER_URL|READING_AGENT_URL)"
```

**Erwartete Ausgabe:**
```
MCP_SERVER_URL=http://138.199.237.34:7000
READING_AGENT_URL=http://138.199.237.34:4001
NEXT_PUBLIC_READING_AGENT_URL=http://138.199.237.34:4001
```

### 2. Next.js App neu starten

```bash
# Prüfe ob Next.js läuft
pm2 list

# Neu starten (wichtig für Environment Variables!)
pm2 restart next-app
# oder
pm2 restart all

# Prüfe Status
pm2 status
```

### 3. API-Route testen

```bash
# Test-Request
curl -X POST http://localhost:3000/api/agents/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Erstelle eine Bodygraph-Komponente"}' | python3 -m json.tool
```

**Erwartete Ausgabe:**
```json
{
  "success": true,
  "agent": "chart-development",
  "message": "Erstelle eine Bodygraph-Komponente",
  "response": "...",
  "tokens": ...,
  "model": "gpt-4"
}
```

### 4. Frontend-Komponente integrieren (optional)

**Option A: In Dashboard hinzufügen**

Fügen Sie zu `pages/agents-dashboard.tsx` hinzu:

```typescript
import { ChartDevelopment } from '../components/agents/ChartDevelopment';

// In der Komponente (z.B. nach den anderen Agenten):
<div className="agent-card">
  <h2>📊 Chart Development Agent</h2>
  <p>Entwickelt Human Design Charts, Penta-Analyse Charts und Connection Key Charts</p>
  <ChartDevelopment userId={userId} />
</div>
```

**Option B: Separate Seite erstellen**

Erstellen Sie `pages/chart-development.tsx`:

```typescript
import { ChartDevelopment } from '../components/agents/ChartDevelopment';

export default function ChartDevelopmentPage() {
  return (
    <div className="container">
      <h1>📊 Chart Development</h1>
      <ChartDevelopment />
    </div>
  );
}
```

Dann im Browser testen: `http://localhost:3000/chart-development`

---

## 📋 Vollständige Checkliste

- [x] API-Route erstellt (`pages/api/agents/chart-development.ts`)
- [x] Frontend-Komponente erstellt (`components/agents/ChartDevelopment.tsx`)
- [x] `READING_AGENT_URL` in `.env.local` vorhanden
- [ ] `MCP_SERVER_URL` in `.env.local` hinzufügen
- [ ] Next.js App neu gestartet
- [ ] API-Route getestet
- [ ] Frontend-Komponente integriert (optional)

---

## 🚀 Schnell-Befehle (Alles in einem)

```bash
cd /opt/hd-app/The-Connection-Key/frontend && \
echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local && \
pm2 restart next-app && \
sleep 3 && \
curl -X POST http://localhost:3000/api/agents/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Test"}' | python3 -m json.tool
```

---

## ✅ Nach erfolgreicher Installation

Der Chart Development Agent ist dann vollständig integriert und kann:

1. ✅ Bodygraph-Komponenten entwickeln
2. ✅ Penta-Analyse Charts erstellen
3. ✅ Connection Key Charts generieren
4. ✅ Chart-Daten automatisch berechnen (über Reading Agent)
5. ✅ React/TypeScript Code generieren

