# 🔍 Frontend-Struktur Analyse

**Problem:** Es gibt 2 Frontend-Verzeichnisse - was ist richtig?

---

## 📊 Die 2 Frontend-Verzeichnisse

### 1. `./frontend/` (Build Context)
**Was ist das:**
- ✅ Das **eigentliche Frontend-Projekt**
- ✅ **Build Context** für Docker (`context: ./frontend`)
- ✅ **Muss alle Dateien enthalten**, die gebaut werden sollen
- ✅ Läuft auf Server: `/opt/hd-app/The-Connection-Key/frontend`

**Struktur:**
```
frontend/
├── app/
│   ├── api/
│   │   └── agents/
│   │       ├── marketing/
│   │       │   └── route.ts  ← HIER müssen die Routen sein!
│   │       └── ...
│   └── coach/
│       └── agents/
│           ├── tasks/
│           │   └── page.tsx  ← HIER müssen die Seiten sein!
│           └── ...
├── components/
│   ├── AgentChat.tsx  ← HIER müssen die Komponenten sein!
│   └── AgentTasksDashboard.tsx
└── Dockerfile
```

---

### 2. `integration/frontend/` (Quelle)
**Was ist das:**
- ⚠️ **Nur neue Dateien** für die Integration
- ⚠️ **Müssen kopiert werden** nach `frontend/`
- ⚠️ **NICHT** das Build-Verzeichnis

**Struktur:**
```
integration/frontend/
├── components/
│   ├── AgentChat.tsx  ← Quelle
│   └── AgentTasksDashboard.tsx
└── app/
    └── coach/
        └── agents/
            └── tasks/
                └── page.tsx  ← Quelle
```

---

## 🔍 Das Problem

**Die Dateien sind in `integration/frontend/`, aber Docker baut aus `frontend/`!**

**Lösung:** Dateien von `integration/` nach `frontend/` kopieren

---

## 🚀 Korrektes Deployment

### Schritt 1: Diagnose ausführen
```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
chmod +x diagnose-frontend-structure.sh
./diagnose-frontend-structure.sh
```

**Das Script zeigt:**
- Welche Frontend-Verzeichnisse existieren
- Welche Dateien vorhanden sind
- Was fehlt

---

### Schritt 2: Dateien kopieren

**Agent-Routen kopieren:**
```bash
# Von integration/ nach frontend/
mkdir -p frontend/app/api/agents
cp -r integration/api-routes/app-router/agents/* frontend/app/api/agents/
```

**Komponenten kopieren:**
```bash
mkdir -p frontend/components
cp integration/frontend/components/AgentChat.tsx frontend/components/
cp integration/frontend/components/AgentTasksDashboard.tsx frontend/components/
```

**Seiten kopieren:**
```bash
mkdir -p frontend/app/coach/agents
cp -r integration/frontend/app/coach/agents/* frontend/app/coach/agents/
```

---

### Schritt 3: Container neu bauen
```bash
docker compose -f docker-compose-redis-fixed.yml stop frontend
docker compose -f docker-compose-redis-fixed.yml build --no-cache frontend
docker compose -f docker-compose-redis-fixed.yml up -d frontend
```

---

## ⚠️ Wichtig: Pages Router vs App Router

**Es gibt 2 Versionen der Agent-Routen:**

### Pages Router (alt, veraltet):
- `integration/api-routes/agents-marketing.ts`
- `integration/api-routes/agents-automation.ts`
- etc.

**Status:** ⚠️ Veraltet - nicht mehr verwenden

---

### App Router (neu, korrekt):
- `integration/api-routes/app-router/agents/marketing/route.ts`
- `integration/api-routes/app-router/agents/automation/route.ts`
- etc.

**Status:** ✅ Korrekt - diese verwenden!

---

## 📋 Checkliste

- [ ] Diagnose-Script ausgeführt
- [ ] Agent-Routen von `integration/api-routes/app-router/agents/` nach `frontend/app/api/agents/` kopiert
- [ ] Komponenten von `integration/frontend/components/` nach `frontend/components/` kopiert
- [ ] Seiten von `integration/frontend/app/coach/agents/` nach `frontend/app/coach/agents/` kopiert
- [ ] Container neu gebaut
- [ ] Container gestartet
- [ ] Seiten getestet

---

**🎯 Zusammenfassung: Docker baut aus `frontend/`, aber die Dateien sind in `integration/` - also kopieren!**
