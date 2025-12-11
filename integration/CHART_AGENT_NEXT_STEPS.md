# 📊 Chart Development Agent - Nächste Schritte

## ✅ Aktueller Status

### Hetzner Server (138.199.237.34)
- ✅ Chart Development Agent installiert
- ✅ Agent läuft auf Port 7000 (über MCP Server)
- ✅ maxTokens Fix angewendet (6000)
- ✅ Agent funktioniert und antwortet korrekt

### CK-App Server (167.235.224.149)
- ⏳ API-Route noch nicht installiert
- ⏳ Frontend-Komponente noch nicht installiert
- ⏳ Environment Variables müssen geprüft werden

---

## 🚀 Nächste Schritte

### Schritt 1: Dateien auf CK-App Server erstellen

**Option A: Script verwenden (empfohlen)**

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend

# Script vom Hetzner Server kopieren
scp root@138.199.237.34:/opt/mcp-connection-key/integration/CREATE_FILES_ON_CK_APP.sh .

# Oder direkt ausführen (wenn Repository vorhanden)
git pull origin main
chmod +x integration/CREATE_FILES_ON_CK_APP.sh
./integration/CREATE_FILES_ON_CK_APP.sh
```

**Option B: Manuell erstellen**

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# 1. API-Route erstellen
mkdir -p pages/api/agents
nano pages/api/agents/chart-development.ts
# [Fügen Sie den Inhalt ein - siehe integration/api-routes/agents-chart-development.ts]

# 2. Frontend-Komponente erstellen
mkdir -p components/agents
nano components/agents/ChartDevelopment.tsx
# [Fügen Sie den Inhalt ein - siehe integration/frontend/components/ChartDevelopment.tsx]
```

### Schritt 2: Environment Variables prüfen

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe .env.local
cat .env.local | grep -E "(MCP_SERVER_URL|READING_AGENT_URL)"

# Falls nicht vorhanden, hinzufügen:
echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local
echo "READING_AGENT_URL=http://138.199.237.34:4001" >> .env.local
```

### Schritt 3: Next.js App neu starten

```bash
# Development
npm run dev

# Oder Production (PM2)
pm2 restart next-app
# oder
pm2 restart all
```

### Schritt 4: API-Route testen

```bash
curl -X POST http://localhost:3000/api/agents/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Erstelle eine Bodygraph-Komponente"}' | python3 -m json.tool
```

**Erwartete Ausgabe:**
```json
{
  "success": true,
  "agent": "chart-development",
  "message": "...",
  "response": "...",
  "tokens": ...,
  "model": "gpt-4"
}
```

### Schritt 5: Frontend-Komponente testen (optional)

**Option A: In Dashboard integrieren**

```typescript
// pages/agents-dashboard.tsx
import { ChartDevelopment } from '../components/agents/ChartDevelopment';

// In der Komponente:
<div className="agent-card">
  <h2>📊 Chart Development Agent</h2>
  <ChartDevelopment userId={userId} />
</div>
```

**Option B: Separate Seite erstellen**

```typescript
// pages/chart-development.tsx
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

Dann im Browser testen: `http://localhost:3000/chart-development`

---

## 📋 Checkliste

- [ ] API-Route erstellt (`pages/api/agents/chart-development.ts`)
- [ ] Frontend-Komponente erstellt (`components/agents/ChartDevelopment.tsx`)
- [ ] Environment Variables gesetzt (`.env.local`)
- [ ] Next.js App neu gestartet
- [ ] API-Route getestet
- [ ] Frontend-Komponente getestet (optional)
- [ ] Dashboard aktualisiert (optional)

---

## 🐛 Troubleshooting

### API-Route antwortet nicht

```bash
# Prüfe ob Datei existiert
ls -la pages/api/agents/chart-development.ts

# Prüfe Next.js Logs
pm2 logs next-app
# oder
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
# Prüfe .env.local
cat .env.local

# Stelle sicher, dass Next.js neu gestartet wurde
pm2 restart next-app
```

---

## ✅ Fertig!

Nach erfolgreicher Installation können Sie:

1. **Über API-Route:** Direkt API-Aufrufe machen
2. **Über Frontend:** Chart Development Komponente verwenden
3. **Bodygraph-Komponenten entwickeln:** Mit berechneten Chart-Daten
4. **Penta-Analyse Charts:** Für 5-Personen-Gruppen
5. **Connection Key Charts:** Für Partner-Vergleiche

**Der Chart Development Agent ist vollständig integriert!** 🎉

