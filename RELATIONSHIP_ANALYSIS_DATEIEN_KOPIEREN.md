# 📦 Relationship Analysis Agent - Dateien auf Server kopieren

**Datum:** 17.12.2025

**Problem:** Dateien fehlen auf Server - müssen von lokal kopiert werden

---

## 🔍 Situation

**Du bist auf:** MCP Server (`/opt/mcp-connection-key`)  
**Frontend läuft auf:** CK-App Server (`/opt/hd-app/The-Connection-Key/frontend`)

**Fehlende Dateien:**
- ❌ `create-relationship-analysis-agent.sh`
- ❌ `integration/frontend/components/RelationshipAnalysisGenerator.tsx`
- ❌ `integration/api-routes/app-router/relationship-analysis/generate/route.ts`
- ❌ `integration/frontend/app/coach/readings/create/page.tsx`

---

## 🚀 Lösung: Dateien von lokal auf Server kopieren

### Schritt 1: Dateien auf MCP Server kopieren

**Von lokal (Windows) auf MCP Server (138.199.237.34):**

```powershell
# PowerShell (auf lokalem Windows-Rechner)
cd C:\AppProgrammierung\Projekte\MCP_Connection_Key

# Agent-Script kopieren
scp create-relationship-analysis-agent.sh root@138.199.237.34:/opt/mcp-connection-key/

# Integration-Verzeichnis kopieren (komplett)
scp -r integration root@138.199.237.34:/opt/mcp-connection-key/
```

---

### Schritt 2: Dateien auf CK-App Server kopieren

**Von lokal (Windows) auf CK-App Server (167.235.224.149):**

```powershell
# PowerShell (auf lokalem Windows-Rechner)
cd C:\AppProgrammierung\Projekte\MCP_Connection_Key

# Integration-Verzeichnis kopieren
scp -r integration root@167.235.224.149:/opt/hd-app/The-Connection-Key/

# ODER nur die notwendigen Dateien
scp -r integration/frontend root@167.235.224.149:/opt/hd-app/The-Connection-Key/
scp -r integration/api-routes root@167.235.224.149:/opt/hd-app/The-Connection-Key/
```

---

### Schritt 3: Prüf-Script auf MCP Server kopieren

```powershell
# PowerShell
scp check-relationship-analysis-files.sh root@138.199.237.34:/opt/mcp-connection-key/
scp deploy-relationship-analysis-complete.sh root@138.199.237.34:/opt/mcp-connection-key/
```

---

## 📋 Komplette Copy-Befehle (PowerShell)

```powershell
# Auf lokalem Windows-Rechner
cd C:\AppProgrammierung\Projekte\MCP_Connection_Key

# ============================================
# MCP Server (138.199.237.34)
# ============================================

# Agent-Script
scp create-relationship-analysis-agent.sh root@138.199.237.34:/opt/mcp-connection-key/

# Prüf-Script
scp check-relationship-analysis-files.sh root@138.199.237.34:/opt/mcp-connection-key/

# Deployment-Script
scp deploy-relationship-analysis-complete.sh root@138.199.237.34:/opt/mcp-connection-key/

# Integration-Verzeichnis (für Agent-Erstellung)
scp -r integration root@138.199.237.34:/opt/mcp-connection-key/

# ============================================
# CK-App Server (167.235.224.149)
# ============================================

# Integration-Verzeichnis (für Frontend)
scp -r integration root@167.235.224.149:/opt/hd-app/The-Connection-Key/
```

---

## 🔍 Alternative: Dateien direkt auf Server erstellen

**Falls `scp` nicht funktioniert, kannst du die Dateien direkt auf dem Server erstellen:**

### Auf MCP Server (138.199.237.34)

```bash
# SSH zum MCP Server
ssh root@138.199.237.34

# Erstelle Verzeichnisse
mkdir -p /opt/mcp-connection-key/integration

# Kopiere Dateien manuell (z.B. via nano/vim)
# ODER nutze Git (falls Repository vorhanden)
cd /opt/mcp-connection-key
git pull  # Falls Git-Repository
```

---

### Auf CK-App Server (167.235.224.149)

```bash
# SSH zum CK-App Server
ssh root@167.235.224.149

# Erstelle Verzeichnisse
mkdir -p /opt/hd-app/The-Connection-Key/integration

# Kopiere Dateien manuell
# ODER nutze Git (falls Repository vorhanden)
cd /opt/hd-app/The-Connection-Key
git pull  # Falls Git-Repository
```

---

## ✅ Nach dem Kopieren

### Auf MCP Server prüfen:

```bash
# Auf MCP Server (138.199.237.34)
cd /opt/mcp-connection-key

# Prüfe ob Dateien vorhanden sind
ls -la create-relationship-analysis-agent.sh
ls -la integration/frontend/components/RelationshipAnalysisGenerator.tsx
ls -la integration/api-routes/app-router/relationship-analysis/generate/route.ts

# Prüf-Script ausführen
chmod +x check-relationship-analysis-files.sh
./check-relationship-analysis-files.sh
```

---

### Auf CK-App Server prüfen:

```bash
# Auf CK-App Server (167.235.224.149)
cd /opt/hd-app/The-Connection-Key

# Prüfe ob Integration-Verzeichnis vorhanden ist
ls -la integration/frontend/components/RelationshipAnalysisGenerator.tsx
ls -la integration/api-routes/app-router/relationship-analysis/generate/route.ts
```

---

## 🎯 Quick-Fix: Nur notwendige Dateien

**Falls du nur die notwendigen Dateien kopieren willst:**

### Auf MCP Server:

```bash
# Auf MCP Server
cd /opt/mcp-connection-key

# Erstelle Verzeichnisse
mkdir -p integration/frontend/components
mkdir -p integration/api-routes/app-router/relationship-analysis/generate
mkdir -p integration/frontend/app/coach/readings/create

# Kopiere Dateien (von lokal via scp oder manuell)
```

### Auf CK-App Server:

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key

# Erstelle Verzeichnisse
mkdir -p integration/frontend/components
mkdir -p integration/api-routes/app-router/relationship-analysis/generate
mkdir -p integration/frontend/app/coach/readings/create

# Kopiere Dateien (von lokal via scp oder manuell)
```

---

## 📋 Checkliste

- [ ] Dateien auf MCP Server kopiert
- [ ] Dateien auf CK-App Server kopiert
- [ ] Prüf-Script ausgeführt
- [ ] Deployment gestartet

---

**💡 Tipp:** Nutze Git, falls beide Server Zugriff auf das Repository haben! 🚀
