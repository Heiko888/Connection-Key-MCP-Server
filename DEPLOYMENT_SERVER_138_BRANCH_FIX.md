# 🔧 Server 138 - Branch-Wechsel + Cleanup

**Problem:** Server ist auf `main` Branch, nicht auf `feature/reading-agent-option-a-complete`

---

## ⚠️ AKTUELLER STATUS

- **Branch:** `main` (falsch!)
- **Viele uncommitted Änderungen** (modified files)
- **Viele untracked files**

---

## ✅ LÖSUNG: Branch wechseln + Cleanup

### Schritt 1: Uncommitted Änderungen verwerfen (oder stash)

**Option A: Verwerfen (wenn Änderungen nicht wichtig)**
```bash
# Verwirft alle uncommitted Änderungen
git checkout -- .
git clean -fd
```

**Option B: Stash (wenn Änderungen wichtig sein könnten)**
```bash
# Speichert Änderungen temporär
git stash push -u -m "Local changes before branch switch"
```

---

### Schritt 2: Branch wechseln

```bash
# Wechsle zu feature/reading-agent-option-a-complete
git checkout feature/reading-agent-option-a-complete
```

**Falls Branch lokal nicht existiert:**
```bash
# Erstelle Branch von Remote
git fetch origin
git checkout -b feature/reading-agent-option-a-complete origin/feature/reading-agent-option-a-complete
```

---

### Schritt 3: Prüfe Branch-Status

```bash
git branch
# Sollte zeigen: * feature/reading-agent-option-a-complete

git status
# Sollte sauber sein (keine uncommitted Änderungen)
```

---

### Schritt 4: Git Pull (falls nötig)

```bash
git pull origin feature/reading-agent-option-a-complete
```

---

## 🎯 EMPFOHLENE VORGEHENSWEISE

**Da viele Änderungen vorhanden sind, empfehle ich:**

**1. Stash (sicherer):**
```bash
git stash push -u -m "Local changes before deployment"
git fetch origin
git checkout -b feature/reading-agent-option-a-complete origin/feature/reading-agent-option-a-complete
```

**2. Oder verwerfen (wenn Änderungen nicht wichtig):**
```bash
git checkout -- .
git clean -fd
git fetch origin
git checkout -b feature/reading-agent-option-a-complete origin/feature/reading-agent-option-a-complete
```

---

## ⚠️ WICHTIGE DATEIEN PRÜFEN

**Falls du die Änderungen behalten möchtest, prüfe zuerst:**

```bash
# Prüfe wichtige Dateien
git diff index.js | head -100
git diff docker-compose.yml | head -100
```

**Wenn wichtig:** Stash verwenden  
**Wenn nicht wichtig:** Verwerfen

---

**Status:** ⏳ **Warte auf Entscheidung: Stash oder Verwerfen?**
