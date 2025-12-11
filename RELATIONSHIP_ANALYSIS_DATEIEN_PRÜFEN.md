# 🔍 Relationship Analysis - Dateien prüfen

**Auf CK-App Server:** `/opt/hd-app/The-Connection-Key/frontend/integration`

---

## 📋 Prüfe ob Dateien vorhanden sind

```bash
# Auf CK-App Server (du bist bereits in integration/)
cd /opt/hd-app/The-Connection-Key/frontend/integration

# Prüfe Komponente
ls -la frontend/components/RelationshipAnalysisGenerator.tsx

# Prüfe API-Route
ls -la api-routes/app-router/relationship-analysis/generate/route.ts

# Prüfe Frontend-Seite
ls -la frontend/app/coach/readings/create/page.tsx
```

---

## ✅ Wenn Dateien vorhanden sind:

```bash
# Zurück ins Frontend-Verzeichnis
cd /opt/hd-app/The-Connection-Key/frontend

# Komponente kopieren
mkdir -p components
cp integration/frontend/components/RelationshipAnalysisGenerator.tsx components/

# API-Route kopieren
mkdir -p app/api/relationship-analysis/generate
cp integration/api-routes/app-router/relationship-analysis/generate/route.ts app/api/relationship-analysis/generate/

# Frontend-Seite kopieren (falls noch nicht vorhanden)
mkdir -p app/coach/readings/create
cp integration/frontend/app/coach/readings/create/page.tsx app/coach/readings/create/

# Prüfe
ls -la components/RelationshipAnalysisGenerator.tsx
ls -la app/api/relationship-analysis/generate/route.ts
```

---

## ❌ Wenn Dateien fehlen:

**Dann von lokal kopieren:**
```powershell
# Auf Windows (PowerShell)
cd C:\AppProgrammierung\Projekte\MCP_Connection_Key
scp -r integration/frontend/components/RelationshipAnalysisGenerator.tsx root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/integration/frontend/components/
scp -r integration/api-routes/app-router/relationship-analysis root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/integration/api-routes/app-router/
scp -r integration/frontend/app/coach/readings/create/page.tsx root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/integration/frontend/app/coach/readings/create/
```
