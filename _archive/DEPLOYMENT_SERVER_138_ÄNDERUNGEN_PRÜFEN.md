# 🔍 Server 138 - Lokale Änderungen prüfen

**Ziel:** Prüfe welche lokalen Änderungen wichtig sind und auf den Server müssen

---

## 📋 PRÜFUNGS-BEFEHLE (auf Server 138 ausführen)

### Schritt 1: Prüfe wichtige Code-Dateien

```bash
# Prüfe index.js (MCP Core)
git diff index.js | head -100

# Prüfe docker-compose.yml
git diff docker-compose.yml | head -100

# Prüfe package.json
git diff package.json | head -50
```

---

### Schritt 2: Prüfe n8n Workflows

```bash
# Prüfe reading-generation-workflow
git diff n8n-workflows/reading-generation-workflow.json | head -100

# Prüfe andere Workflows
git diff integration/n8n-workflows/ | head -100
```

---

### Schritt 3: Prüfe alle geänderten Dateien (Übersicht)

```bash
# Liste aller geänderten Dateien
git status --short

# Prüfe welche Dateien wichtig sind (Code, nicht Dokumentation)
git status --short | grep -E "\.(js|ts|json|yml|yaml)$"
```

---

### Schritt 4: Prüfe spezifische wichtige Dateien

```bash
# MCP Core Dateien
git diff index.js
git diff chatgpt-agent/agent.js

# Docker/Konfiguration
git diff docker-compose.yml
git diff production/server.js

# API Routes (falls vorhanden)
git diff integration/api-routes/ | head -200
```

---

## 🎯 STRATEGIE: Wichtige Änderungen behalten

### Option A: Wichtige Dateien committen, Rest verwerfen

```bash
# 1. Prüfe welche Dateien wichtig sind (siehe oben)

# 2. Füge wichtige Dateien hinzu
git add index.js
git add docker-compose.yml
# ... weitere wichtige Dateien

# 3. Committe wichtige Änderungen
git commit -m "Local server changes before deployment"

# 4. Verwerfe restliche Änderungen
git checkout -- .
git clean -fd

# 5. Wechsle Branch
git fetch origin
git checkout -b feature/reading-agent-option-a-complete origin/feature/reading-agent-option-a-complete

# 6. Merge lokale Commits (falls nötig)
git merge main --no-edit
```

---

### Option B: Alles stashen, dann selektiv wiederherstellen

```bash
# 1. Stash alles
git stash push -u -m "All local changes before deployment"

# 2. Wechsle Branch
git fetch origin
git checkout -b feature/reading-agent-option-a-complete origin/feature/reading-agent-option-a-complete

# 3. Prüfe Stash-Inhalt
git stash show -p stash@{0} | head -200

# 4. Wichtige Dateien selektiv wiederherstellen
git checkout stash@{0} -- index.js
git checkout stash@{0} -- docker-compose.yml
# ... weitere wichtige Dateien

# 5. Committe wiederhergestellte Dateien
git add .
git commit -m "Apply important local server changes"
```

---

### Option C: Wichtige Änderungen in separaten Branch committen

```bash
# 1. Committe wichtige Änderungen auf main
git add index.js docker-compose.yml # ... wichtige Dateien
git commit -m "Important local server changes"

# 2. Erstelle Branch für lokale Änderungen
git checkout -b local-server-changes

# 3. Wechsle zu feature Branch
git fetch origin
git checkout -b feature/reading-agent-option-a-complete origin/feature/reading-agent-option-a-complete

# 4. Cherry-pick wichtige Commits
git cherry-pick <commit-hash>
```

---

## ✅ EMPFOHLENE VORGEHENSWEISE

**1. Führe Prüfungs-Befehle aus (Schritt 1-4)**

**2. Identifiziere wichtige Dateien:**
- ✅ Code-Dateien (`.js`, `.ts`)
- ✅ Konfigurations-Dateien (`.yml`, `.json`)
- ❌ Dokumentation (`.md`) - kann verworfen werden

**3. Basierend auf Ergebnissen:**

**Wenn nur wenige wichtige Dateien:**
→ Option A (committen, Rest verwerfen)

**Wenn viele wichtige Dateien:**
→ Option B (stashen, selektiv wiederherstellen)

**Wenn komplexe Änderungen:**
→ Option C (separater Branch)

---

## 📝 WICHTIGE DATEIEN CHECKLISTE

Prüfe diese Dateien besonders:

- [ ] `index.js` - MCP Core Hauptdatei
- [ ] `docker-compose.yml` - Docker Konfiguration
- [ ] `package.json` - Dependencies
- [ ] `production/server.js` - Production Server
- [ ] `n8n-workflows/*.json` - n8n Workflows
- [ ] `integration/api-routes/*` - API Routes
- [ ] `.env` oder `.env.local` - Environment Variables

---

**Status:** ⏳ **Führe Prüfungs-Befehle aus und teile Ergebnisse**
