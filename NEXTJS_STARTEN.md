# 🚀 Next.js starten - Anleitung

**Stand:** 16.12.2025

---

## 📍 Server-Info

**Next.js läuft auf:** CK-App Server (167.235.224.149)

---

## 🔍 Schritt 1: Prüfen wie Next.js läuft

**Auf CK-App Server ausführen:**

```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key

# Prüfe Docker
docker ps | grep frontend

# Prüfe PM2
pm2 list | grep -i next

# Prüfe Port 3000
lsof -i :3000
```

---

## 🐳 Option 1: Docker (wahrscheinlich)

**Falls Next.js über Docker läuft:**

### Status prüfen:
```bash
cd /opt/hd-app/The-Connection-Key
docker compose ps
```

### Starten:
```bash
# Frontend starten
docker compose up -d frontend

# Oder alles starten
docker compose up -d
```

### Neustarten (nach .env.local Änderung):
```bash
# Frontend neu starten
docker compose restart frontend

# Oder Container neu erstellen (lädt neue .env.local)
docker compose down frontend
docker compose up -d frontend
```

### Logs prüfen:
```bash
docker logs the-connection-key-frontend-1 --tail 50
```

---

## ⚙️ Option 2: PM2

**Falls Next.js über PM2 läuft:**

### Status prüfen:
```bash
pm2 list
```

### Starten:
```bash
cd /opt/hd-app/The-Connection-Key/frontend
pm2 start npm --name "next-app" -- start
```

### Neustarten (nach .env.local Änderung):
```bash
pm2 restart next-app
```

### Logs prüfen:
```bash
pm2 logs next-app
```

---

## 📝 Option 3: Direkt (Development)

**Falls Next.js direkt läuft:**

### Starten:
```bash
cd /opt/hd-app/The-Connection-Key/frontend
npm run dev
```

### Oder Production:
```bash
cd /opt/hd-app/The-Connection-Key/frontend
npm run build
npm start
```

---

## ✅ Nach .env.local Änderung

**Nachdem du N8N_API_KEY in `.env.local` eingetragen hast:**

### Docker:
```bash
cd /opt/hd-app/The-Connection-Key
docker compose restart frontend
```

### PM2:
```bash
pm2 restart next-app
```

### Direkt:
```bash
# Prozess beenden (Ctrl+C) und neu starten
npm start
```

---

## 🔍 Schnell-Check: Was läuft?

**Führe diesen Befehl aus:**

```bash
echo "=== Docker ===" && docker ps 2>/dev/null | grep -E "(frontend|next)" && \
echo "" && echo "=== PM2 ===" && pm2 list 2>/dev/null | grep -i next && \
echo "" && echo "=== Port 3000 ===" && lsof -i :3000 2>/dev/null || netstat -tulpn | grep 3000
```

**Das zeigt dir, wie Next.js läuft!**

---

## 📋 N8N_API_KEY in .env.local eintragen

**Auf CK-App Server:**

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# N8N_API_KEY eintragen
echo "N8N_API_KEY=0139efdef24110614ca2489077d2e786fd1d5e1cac1e22538d6adb68e6899d5c" >> .env.local

# Oder manuell bearbeiten
nano .env.local
```

**Dann Next.js neu starten (siehe oben)!**

---

**Status:** ✅ **Anleitung erstellt - Prüfe zuerst, wie Next.js läuft!**
