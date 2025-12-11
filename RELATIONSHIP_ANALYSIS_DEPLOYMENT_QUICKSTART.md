# 🚀 Relationship Analysis Agent - Quick Start

**Datum:** 17.12.2025

**Ziel:** Schnellstart für Deployment

---

## 📋 Schnellstart (3 Schritte)

### Schritt 1: Dateien prüfen

```bash
# Auf Server
cd /opt/hd-app/The-Connection-Key

# Prüfe alle Dateien
chmod +x check-relationship-analysis-files.sh
./check-relationship-analysis-files.sh
```

**Erwartet:** ✅ Keine kritischen Fehler

---

### Schritt 2: Deployment ausführen

**Option A: Automatisch (Script)**
```bash
chmod +x deploy-relationship-analysis-complete.sh
./deploy-relationship-analysis-complete.sh
```

**Option B: Manuell**
```bash
# Siehe RELATIONSHIP_ANALYSIS_DEPLOYMENT_MANUELL.md
```

---

### Schritt 3: Testen

```bash
# Test Agent
curl -X POST http://localhost:7000/agent/relationship-analysis-agent \
  -H "Content-Type: application/json" \
  -d '{"message": "Test", "userId": "test"}'

# Test Frontend API
curl -X GET http://localhost:3005/api/relationship-analysis/generate
```

---

## 📋 Komplette Befehls-Sequenz (Copy & Paste)

```bash
# ============================================
# SCHRITT 1: Dateien prüfen
# ============================================
cd /opt/hd-app/The-Connection-Key
chmod +x check-relationship-analysis-files.sh
./check-relationship-analysis-files.sh

# ============================================
# SCHRITT 2: Agent erstellen
# ============================================
chmod +x create-relationship-analysis-agent.sh
./create-relationship-analysis-agent.sh

# ============================================
# SCHRITT 3: Frontend-Dateien kopieren
# ============================================
cd frontend

# Komponente
mkdir -p components
cp integration/frontend/components/RelationshipAnalysisGenerator.tsx components/

# API-Route
mkdir -p app/api/relationship-analysis/generate
cp integration/api-routes/app-router/relationship-analysis/generate/route.ts app/api/relationship-analysis/generate/

# Seite
mkdir -p app/coach/readings/create
cp integration/frontend/app/coach/readings/create/page.tsx app/coach/readings/create/

# ============================================
# SCHRITT 4: Environment Variable
# ============================================
if ! grep -q "MCP_SERVER_URL" .env.local; then
  echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local
fi

# ============================================
# SCHRITT 5: Frontend neu starten
# ============================================
cd ..
docker-compose restart frontend
# ODER: pm2 restart frontend

# ============================================
# SCHRITT 6: Verifikation
# ============================================
sleep 5
curl http://localhost:7000/agents | grep relationship-analysis-agent
curl -X GET http://localhost:3005/api/relationship-analysis/generate
```

---

## ✅ Checkliste

- [ ] Dateien geprüft (`check-relationship-analysis-files.sh`)
- [ ] Agent erstellt
- [ ] Frontend-Dateien kopiert
- [ ] Environment Variable gesetzt
- [ ] Frontend neu gestartet
- [ ] Getestet

---

**🎉 Fertig!** 🚀
