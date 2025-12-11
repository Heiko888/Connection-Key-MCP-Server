# ✅ Chart Development Agent - Verifizierung

## Voraussetzungen (bereits erledigt)
- ✅ API-Route erstellt: `pages/api/agents/chart-development.ts`
- ✅ Frontend-Komponente erstellt: `components/agents/ChartDevelopment.tsx`

## Nächste Schritte

### 1. Environment Variables prüfen

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob vorhanden
cat .env.local | grep -E "(MCP_SERVER_URL|READING_AGENT_URL)"

# Falls nicht vorhanden, hinzufügen:
if ! grep -q "MCP_SERVER_URL" .env.local 2>/dev/null; then
    echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local
    echo "✅ MCP_SERVER_URL hinzugefügt"
fi

if ! grep -q "READING_AGENT_URL" .env.local 2>/dev/null; then
    echo "READING_AGENT_URL=http://138.199.237.34:4001" >> .env.local
    echo "✅ READING_AGENT_URL hinzugefügt"
fi
```

### 2. Next.js App neu starten

```bash
# Prüfe ob Next.js läuft
pm2 list | grep next

# Neu starten
pm2 restart next-app
# oder
pm2 restart all

# Oder Development
npm run dev
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

### 4. Frontend-Komponente testen (optional)

**Option A: In Dashboard integrieren**

Fügen Sie zu `pages/agents-dashboard.tsx` hinzu:

```typescript
import { ChartDevelopment } from '../components/agents/ChartDevelopment';

// In der Komponente:
<div className="agent-card">
  <h2>📊 Chart Development Agent</h2>
  <ChartDevelopment userId={userId} />
</div>
```

**Option B: Separate Seite**

Erstellen Sie `pages/chart-development.tsx`:

```typescript
import { ChartDevelopment } from '../components/agents/ChartDevelopment';

export default function ChartDevelopmentPage() {
  return (
    <div>
      <h1>Chart Development</h1>
      <ChartDevelopment />
    </div>
  );
}
```

Dann im Browser: `http://localhost:3000/chart-development`

---

## ✅ Checkliste

- [x] API-Route erstellt
- [x] Frontend-Komponente erstellt
- [ ] Environment Variables gesetzt
- [ ] Next.js App neu gestartet
- [ ] API-Route getestet
- [ ] Frontend-Komponente getestet (optional)

---

## 🐛 Troubleshooting

### API-Route gibt 500 Error

```bash
# Prüfe Next.js Logs
pm2 logs next-app --lines 50

# Oder Development
npm run dev  # und schaue in die Console
```

### CORS-Fehler

```bash
# Prüfe CORS auf Hetzner Server
curl -X POST http://138.199.237.34:7000/agent/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Test"}' \
  -H "Origin: http://localhost:3000" -v
```

### Environment Variables nicht geladen

```bash
# Stelle sicher, dass .env.local existiert
ls -la .env.local

# Prüfe Inhalt
cat .env.local

# Next.js neu starten (wichtig!)
pm2 restart next-app
```

---

## 🎉 Fertig!

Nach erfolgreicher Verifizierung können Sie:

1. ✅ Chart Development Agent über API verwenden
2. ✅ Frontend-Komponente im Dashboard nutzen
3. ✅ Bodygraph-Komponenten entwickeln
4. ✅ Penta-Analyse Charts erstellen
5. ✅ Connection Key Charts generieren

