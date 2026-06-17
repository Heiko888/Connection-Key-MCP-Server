# 🚀 Reading Agent Frontend Integration - Server Installation

## ⚠️ Dateien noch nicht im Repository

Die Scripts müssen direkt auf den Server kopiert werden.

---

## 📋 Option 1: Scripts direkt kopieren (schnellste Methode)

### Von lokal (PowerShell):

```powershell
# Scripts auf Server kopieren
scp install-reading-agent-frontend.sh root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/
scp check-reading-agent-integration.sh root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/
```

### Dann auf Server ausführen:

```bash
cd /opt/hd-app/The-Connection-Key/frontend
chmod +x check-reading-agent-integration.sh
chmod +x install-reading-agent-frontend.sh

# Erst prüfen
./check-reading-agent-integration.sh

# Dann installieren
./install-reading-agent-frontend.sh
```

---

## 📋 Option 2: Scripts manuell erstellen

Falls SCP nicht funktioniert, kannst du die Scripts direkt auf dem Server erstellen:

### Auf Server:

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Script 1: check-reading-agent-integration.sh erstellen
nano check-reading-agent-integration.sh
# [Inhalt aus lokalem check-reading-agent-integration.sh kopieren]

# Script 2: install-reading-agent-frontend.sh erstellen
nano install-reading-agent-frontend.sh
# [Inhalt aus lokalem install-reading-agent-frontend.sh kopieren]

# Ausführbar machen
chmod +x check-reading-agent-integration.sh
chmod +x install-reading-agent-frontend.sh
```

---

## 📋 Option 3: Git Pull (wenn Dateien später gepusht wurden)

```bash
cd /opt/hd-app/The-Connection-Key/frontend
git pull origin main
chmod +x check-reading-agent-integration.sh
chmod +x install-reading-agent-frontend.sh
./check-reading-agent-integration.sh
```

---

## 🎯 Empfohlene Vorgehensweise

**Am schnellsten:** Option 1 (SCP)

1. Scripts von lokal auf Server kopieren
2. Scripts ausführbar machen
3. Prüf-Script ausführen
4. Installations-Script ausführen

---

## 📁 Dateien die kopiert werden müssen:

1. `install-reading-agent-frontend.sh`
2. `check-reading-agent-integration.sh`

**Optional (für Dokumentation):**
- `FINAL_READING_AGENT_SETUP.md`
- `QUICK_START_READING_AGENT.md`

