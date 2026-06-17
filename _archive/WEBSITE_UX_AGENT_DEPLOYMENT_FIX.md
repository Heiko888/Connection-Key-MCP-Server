# 🔧 Website-UX-Agent Deployment - Fix

**Problem:** `scp: stat local "integration/api-routes/app-router/agents/website-ux-agent/route.ts": No such file or directory`

**Ursache:** Du bist auf dem Server, aber die Datei ist lokal auf deinem Windows-Rechner

---

## ✅ Lösung: Script auf Server ausführen

### **Option 1: Script direkt auf Server ausführen** (Empfohlen)

**1. Script auf Server kopieren:**

```bash
# Von lokal (Windows PowerShell)
scp copy-website-ux-agent-route-to-container.sh root@167.235.224.149:/opt/hd-app/The-Connection-Key/
```

**2. Script auf Server ausführen:**

```bash
# Auf Server (167.235.224.149)
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
chmod +x copy-website-ux-agent-route-to-container.sh
./copy-website-ux-agent-route-to-container.sh
```

**Das Script:**
- ✅ Erstellt Route-Datei direkt im Container
- ✅ Startet Container neu
- ✅ Testet API automatisch

---

### **Option 2: Datei von lokal kopieren** (Alternative)

**Von lokal (Windows PowerShell):**

```powershell
# Datei direkt auf Server kopieren
scp integration/api-routes/app-router/agents/website-ux-agent/route.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/agents/website-ux-agent/route.ts

# Dann auf Server:
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
docker compose build --no-cache frontend
docker compose up -d frontend
```

---

### **Option 3: Script direkt im Container erstellen** (Schnellste)

**Auf Server ausführen:**

```bash
# Script auf Server erstellen
cat > /opt/hd-app/The-Connection-Key/copy-website-ux-agent-route-to-container.sh << 'SCRIPT_END'
# [Script-Inhalt hier einfügen]
SCRIPT_END

# Script ausführen
chmod +x /opt/hd-app/The-Connection-Key/copy-website-ux-agent-route-to-container.sh
/opt/hd-app/The-Connection-Key/copy-website-ux-agent-route-to-container.sh
```

---

## 🚀 Schnellste Lösung

**Auf Server (167.235.224.149) ausführen:**

```bash
# 1. Script von lokal kopieren (Windows PowerShell)
scp copy-website-ux-agent-route-to-container.sh root@167.235.224.149:/opt/hd-app/The-Connection-Key/

# 2. Auf Server ausführen
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
chmod +x copy-website-ux-agent-route-to-container.sh
./copy-website-ux-agent-route-to-container.sh
```

**Das Script macht alles automatisch:**
- ✅ Erstellt Route-Datei im Container
- ✅ Startet Container neu
- ✅ Testet API

---

## 🧪 Nach dem Deployment testen

```bash
# Auf Server
curl -X POST http://localhost:3000/api/agents/website-ux-agent \
  -H "Content-Type: application/json" \
  -d '{"message": "Analysiere https://www.example.com", "userId": "test"}'
```

**Erwartet:** JSON-Response (kein 404!)

---

**🚀 Führe das Script aus, um die Route zu aktivieren!**
