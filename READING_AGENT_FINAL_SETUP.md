# ✅ Reading Agent Frontend Integration - Komplette To-Do-Liste

## 🎯 Ziel: Reading Agent funktioniert vollständig mit Frontend auf App-Server

---

## 📋 Checkliste: Was muss noch gemacht werden?

### ✅ Bereits vorhanden (lokal im Repository)

- [x] API-Route: `integration/api-routes/readings-generate.ts`
- [x] Frontend-Komponente: `integration/frontend/components/ReadingGenerator.tsx`
- [x] Dokumentation vorhanden
- [x] TypeScript-Konfiguration vorhanden

### ⏳ Noch zu tun auf CK-App Server (167.235.224.149)

#### 1. API-Route installieren
- [ ] Datei kopieren: `pages/api/readings/generate.ts` (Pages Router)
- [ ] Oder: `app/api/reading/generate/route.ts` (App Router)
- [ ] Prüfen ob Router-Typ (Pages vs App)

#### 2. Environment Variables setzen
- [ ] `READING_AGENT_URL=http://138.199.237.34:4001` in `.env.local`
- [ ] Prüfen ob Variable bereits vorhanden

#### 3. Frontend-Komponente installieren
- [ ] `ReadingGenerator.tsx` nach `components/agents/` kopieren
- [ ] Oder nach `app/components/agents/` (App Router)

#### 4. Frontend-Seite erstellen/aktualisieren
- [ ] Seite `/coach/readings/create` erstellen oder aktualisieren
- [ ] `ReadingGenerator` Komponente einbinden

#### 5. CSS/Styling hinzufügen (optional)
- [ ] `styles/agents.css` erstellen
- [ ] In `_app.tsx` oder `layout.tsx` importieren

#### 6. App neu starten
- [ ] Next.js App neu starten (PM2 oder npm)
- [ ] Build durchführen falls Production

### ⏳ Noch zu prüfen auf Hetzner Server (138.199.237.34)

#### 7. Reading Agent Status
- [ ] Prüfen ob Reading Agent läuft: `pm2 status reading-agent`
- [ ] Prüfen ob Port 4001 erreichbar ist
- [ ] Test direkt: `curl http://138.199.237.34:4001/reading/generate`

#### 8. CORS konfiguriert
- [ ] CORS erlaubt Requests von `https://www.the-connection-key.de`
- [ ] Firewall Port 4001 offen

---

## 🚀 Schnell-Installation: Automatisches Script

**Script erstellen:** `install-reading-agent-frontend.sh`

Dieses Script macht alles automatisch!

---

## 📝 Manuelle Installation (Schritt-für-Schritt)

### Schritt 1: Auf CK-App Server einloggen

```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key/frontend
```

### Schritt 2: Git Pull (falls Repository vorhanden)

```bash
git pull origin main
```

### Schritt 3: Prüfe Router-Typ

```bash
# Pages Router?
ls -d pages/ 2>/dev/null && echo "Pages Router erkannt"

# App Router?
ls -d app/ 2>/dev/null && echo "App Router erkannt"
```

### Schritt 4: API-Route installieren

**Für Pages Router:**
```bash
mkdir -p pages/api/readings
cp integration/api-routes/readings-generate.ts pages/api/readings/generate.ts
```

**Für App Router:**
```bash
mkdir -p app/api/reading/generate
# Datei anpassen nötig - siehe unten
```

### Schritt 5: Environment Variable setzen

```bash
# Prüfe ob vorhanden
grep "READING_AGENT_URL" .env.local 2>/dev/null || echo "Nicht gefunden"

# Hinzufügen
echo "READING_AGENT_URL=http://138.199.237.34:4001" >> .env.local

# Prüfen
cat .env.local | grep READING_AGENT_URL
```

### Schritt 6: Frontend-Komponente installieren

```bash
mkdir -p components/agents
cp integration/frontend/components/ReadingGenerator.tsx components/agents/
```

### Schritt 7: Frontend-Seite erstellen

**Für Pages Router:**
```bash
mkdir -p pages/coach/readings
cat > pages/coach/readings/create.tsx << 'EOF'
import { ReadingGenerator } from '@/components/agents/ReadingGenerator';

export default function CreateReadingPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Human Design Reading erstellen</h1>
      <ReadingGenerator />
    </div>
  );
}
EOF
```

### Schritt 8: App neu starten

```bash
# PM2
pm2 restart the-connection-key
# oder
pm2 restart all

# Oder Development
npm run dev
```

### Schritt 9: Testen

```bash
# API-Route testen
curl -X POST http://localhost:3000/api/readings/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "detailed"
  }'
```

---

## 🔍 Verifikation: Alles funktioniert?

### Test 1: API-Route erreichbar?

```bash
curl -X POST http://localhost:3000/api/readings/generate \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-05-15","birthTime":"14:30","birthPlace":"Berlin"}'
```

**Erwartet:** Status 200, JSON mit `reading`

### Test 2: Frontend-Seite erreichbar?

Im Browser: `https://www.the-connection-key.de/coach/readings/create`

**Erwartet:** Seite lädt, Formular sichtbar

### Test 3: Reading Agent erreichbar?

```bash
curl -X POST http://138.199.237.34:4001/reading/generate \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-05-15","birthTime":"14:30","birthPlace":"Berlin"}'
```

**Erwartet:** Status 200, JSON mit `reading`

---

## 🐛 Troubleshooting

### Problem: 404 bei `/api/readings/generate`

**Lösung:**
- Prüfe ob Datei existiert: `ls pages/api/readings/generate.ts`
- Prüfe Router-Typ (Pages vs App)
- App neu starten

### Problem: 500 Error "Reading Agent request failed"

**Lösung:**
- Prüfe Environment Variable: `grep READING_AGENT_URL .env.local`
- Prüfe ob Reading Agent läuft: `pm2 status reading-agent` (auf Hetzner)
- Teste Reading Agent direkt

### Problem: CORS Error

**Lösung:**
- Auf Hetzner Server CORS konfigurieren
- Firewall Port 4001 öffnen

---

## ✅ Fertig!

Wenn alle Punkte erledigt sind:
- ✅ API-Route funktioniert
- ✅ Frontend-Seite zeigt Reading Generator
- ✅ Reading wird erfolgreich generiert
- ✅ Keine Fehler in Browser Console

