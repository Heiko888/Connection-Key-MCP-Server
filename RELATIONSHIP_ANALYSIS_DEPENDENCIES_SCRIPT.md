# 🔧 Relationship Analysis - Dependencies Script

**Script:** `check-and-copy-relationship-dependencies.sh`

---

## 📋 Was das Script macht

1. ✅ **Prüft vorhandene Dependencies**
   - `ReadingDisplay.tsx`
   - `ReadingGenerator.tsx`
   - `reading-response-types.ts`

2. ✅ **Kopiert fehlende Dependencies** (von `integration/`)

3. ✅ **Prüft Import-Pfade** (ob sie korrekt sind)

4. ✅ **Gibt klare Anweisungen** für nächste Schritte

---

## 🚀 Verwendung

### Schritt 1: Script auf Server kopieren (falls noch nicht da)

**Von lokal (Windows PowerShell):**
```powershell
scp check-and-copy-relationship-dependencies.sh root@167.235.224.149:/opt/hd-app/The-Connection-Key/
```

---

### Schritt 2: Script ausführen

**Auf CK-App Server:**
```bash
cd /opt/hd-app/The-Connection-Key

# Script ausführbar machen
chmod +x check-and-copy-relationship-dependencies.sh

# Script ausführen
./check-and-copy-relationship-dependencies.sh
```

---

## 📊 Was das Script prüft

### 1. ReadingDisplay.tsx
- **Pfad:** `components/ReadingDisplay.tsx`
- **Quelle:** `integration/frontend/components/ReadingDisplay.tsx`

### 2. ReadingGenerator.tsx
- **Pfad:** `components/ReadingGenerator.tsx`
- **Quelle:** `integration/frontend/components/ReadingGenerator.tsx`

### 3. reading-response-types.ts
- **Mögliche Pfade:**
  - `api-routes/reading-response-types.ts` (bevorzugt)
  - `app/api-routes/reading-response-types.ts`
  - `app/api/reading-response-types.ts`
- **Quelle:** `integration/api-routes/reading-response-types.ts`

---

## ✅ Nach dem Script

### Falls Dependencies kopiert wurden:

```bash
# Docker Container neu bauen
cd /opt/hd-app/The-Connection-Key
docker compose build frontend
docker compose up -d frontend
```

### Falls alle Dependencies bereits vorhanden waren:

```bash
# Optional: Frontend neu starten (falls Änderungen)
docker compose restart frontend
```

---

## 🧪 Test im Browser

```
http://167.235.224.149:3000/coach/readings/create
```

---

## ⚠️ Mögliche Probleme

### Problem 1: Integration-Verzeichnis fehlt

**Fehler:**
```
❌ Integration-Verzeichnis nicht gefunden: /opt/hd-app/The-Connection-Key/frontend/integration
```

**Lösung:**
```bash
# Integration-Verzeichnis von lokal kopieren
# (Von Windows PowerShell)
scp -r integration root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/
```

---

### Problem 2: Import-Pfad stimmt nicht

**Fehler im Browser:**
```
Module not found: Can't resolve '../../api-routes/reading-response-types'
```

**Lösung:**
```bash
# Prüfe wo reading-response-types.ts liegt
find /opt/hd-app/The-Connection-Key/frontend -name "reading-response-types.ts"

# Falls in app/api-routes/, aber Import erwartet api-routes/:
# Option 1: Datei verschieben
mv app/api-routes/reading-response-types.ts api-routes/

# Option 2: Import-Pfad in RelationshipAnalysisGenerator.tsx anpassen
nano components/RelationshipAnalysisGenerator.tsx
# Ändere: from '../../api-routes/reading-response-types'
# Zu: from '../../app/api-routes/reading-response-types'
```

---

## 📋 Vollständiger Ablauf

```bash
# 1. Auf CK-App Server
ssh root@167.235.224.149

# 2. Script ausführen
cd /opt/hd-app/The-Connection-Key
chmod +x check-and-copy-relationship-dependencies.sh
./check-and-copy-relationship-dependencies.sh

# 3. Falls kopiert wurde: Container neu bauen
docker compose build frontend
docker compose up -d frontend

# 4. Test im Browser
# http://167.235.224.149:3000/coach/readings/create
```

---

**🎯 Das Script macht alles automatisch!** 🚀
