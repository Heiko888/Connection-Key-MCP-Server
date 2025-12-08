# 💻 Befehle für beide Server

## 🖥️ Hetzner Server (138.199.237.34)

### Komplett-Befehl (alles in einem):

```bash
ssh root@138.199.237.34 << 'EOF'
cd /opt/mcp-connection-key
chmod +x integration/install-hetzner-server.sh
./integration/install-hetzner-server.sh
EOF
```

### Schritt-für-Schritt:

```bash
# 1. SSH-Verbindung
ssh root@138.199.237.34

# 2. Ins Verzeichnis
cd /opt/mcp-connection-key

# 3. Script ausführen
chmod +x integration/install-hetzner-server.sh
./integration/install-hetzner-server.sh

# 4. Prüfen
docker-compose ps
pm2 status
curl http://localhost:7000/health
curl http://localhost:4001/health
```

---

## 🖥️ CK-App Server (167.235.224.149)

### Komplett-Befehl (alles in einem):

```bash
# Sie müssen zuerst wissen, wo Ihr Next.js Projekt liegt
# Beispiel: /var/www/the-connection-key oder ähnlich

ssh root@167.235.224.149 << 'EOF'
cd /path/to/your/nextjs-app
chmod +x integration/install-ck-app-server.sh
./integration/install-ck-app-server.sh
EOF
```

### Schritt-für-Schritt:

```bash
# 1. SSH-Verbindung
ssh root@167.235.224.149

# 2. Finden Sie Ihr Next.js Projekt
find / -name "package.json" -type f 2>/dev/null | grep -i next

# 3. Ins Projekt-Verzeichnis
cd /path/to/your/nextjs-app

# 4. Prüfen Sie, ob integration/ existiert
ls integration/

# Falls nicht, Git Pull oder Dateien kopieren
git pull origin main
# ODER
# Kopieren Sie die integration/ Dateien manuell

# 5. Script ausführen
chmod +x integration/install-ck-app-server.sh
./integration/install-ck-app-server.sh

# 6. CSS importieren (manuell in _app.tsx oder layout.tsx)
# import '../styles/agents.css'

# 7. Environment Variables prüfen
cat .env.local

# 8. Development Server starten
npm run dev
```

---

## 🧪 Test-Befehle

### Auf CK-App Server:

```bash
# Test-Script ausführen
chmod +x integration/test-integration.sh
./integration/test-integration.sh

# Oder manuell testen
curl -X POST http://localhost:3000/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

### Vom Browser aus:

```javascript
// In Browser-Console (F12)
fetch('/api/agents/marketing', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Test' })
})
.then(r => r.json())
.then(console.log)
```

---

## 📋 Quick Reference

| Server | Befehl | Zweck |
|--------|--------|-------|
| Hetzner | `./integration/install-hetzner-server.sh` | CORS konfigurieren |
| CK-App | `./integration/install-ck-app-server.sh` | API-Routes installieren |
| CK-App | `./integration/test-integration.sh` | Integration testen |

---

## ⚠️ Wichtig

**Bevor Sie starten:**

1. **Hetzner Server:**
   - ✅ Alle Services laufen
   - ✅ Ports sind offen

2. **CK-App Server:**
   - ✅ Next.js Projekt gefunden
   - ✅ `integration/` Verzeichnis vorhanden
   - ✅ Node.js und npm installiert

**Nach der Installation:**
- ✅ CSS importiert
- ✅ Environment Variables gesetzt
- ✅ Development Server läuft

