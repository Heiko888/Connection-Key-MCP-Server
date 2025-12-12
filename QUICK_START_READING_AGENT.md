# 🚀 Quick Start: Reading Agent Frontend Integration

## ✅ Alles ist vorbereitet!

Die Scripts und Dokumentation sind erstellt. Jetzt musst du sie auf dem Server ausführen.

---

## 📋 Schnell-Anleitung (3 Schritte)

### Schritt 1: Scripts auf Server kopieren

**Von lokal (PowerShell):**
```powershell
scp install-reading-agent-frontend.sh root@167.235.224.149:/tmp/
scp check-reading-agent-integration.sh root@167.235.224.149:/tmp/
```

**Oder auf Server (wenn Git Repository vorhanden):**
```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key/frontend
git pull origin main
```

---

### Schritt 2: Prüfung ausführen

```bash
cd /opt/hd-app/The-Connection-Key/frontend
chmod +x /tmp/check-reading-agent-integration.sh
/tmp/check-reading-agent-integration.sh
```

**Oder falls Git Pull gemacht wurde:**
```bash
chmod +x check-reading-agent-integration.sh
./check-reading-agent-integration.sh
```

**Das Script zeigt:**
- ✅ Was bereits vorhanden ist
- ❌ Was fehlt
- ⚠️ Was geprüft werden muss

---

### Schritt 3: Installation ausführen

```bash
chmod +x /tmp/install-reading-agent-frontend.sh
/tmp/install-reading-agent-frontend.sh
```

**Oder falls Git Pull gemacht wurde:**
```bash
chmod +x install-reading-agent-frontend.sh
./install-reading-agent-frontend.sh
```

**Das Script:**
- Erkennt was bereits existiert
- Fragt vor Überschreiben
- Installiert nur was fehlt

---

## 🎯 Nach der Installation

### App neu starten:
```bash
pm2 restart the-connection-key
# oder
npm run build && pm2 restart the-connection-key
```

### Testen:
```bash
# API-Route testen
curl -X POST http://localhost:3000/api/reading/generate \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-05-15","birthTime":"14:30","birthPlace":"Berlin"}'
```

**Im Browser:**
```
https://www.the-connection-key.de/coach/readings/create
```

---

## 📁 Wichtige Dateien

- `FINAL_READING_AGENT_SETUP.md` - Vollständige Anleitung
- `READING_AGENT_STATUS_ANALYSE.md` - Status-Analyse
- `install-reading-agent-frontend.sh` - Installations-Script
- `check-reading-agent-integration.sh` - Prüf-Script

---

## ✅ Fertig wenn:

- ✅ API-Route funktioniert
- ✅ Frontend-Seite lädt
- ✅ Reading wird generiert
- ✅ Keine Fehler

**Los geht's! 🚀**

