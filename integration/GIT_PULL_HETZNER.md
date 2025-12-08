# 📥 Git Pull auf Hetzner Server

Führen Sie auf dem **Hetzner Server** aus, um die `integration/` Dateien zu holen:

```bash
cd /opt/mcp-connection-key
git pull origin main
```

Dann sind die `integration/` Dateien verfügbar.

---

## ⚠️ Wichtig: Next.js Projekt ist auf anderem Server!

Das Next.js Projekt läuft auf **167.235.224.149** (CK-App Server), nicht auf dem Hetzner Server.

**Sie müssen:**
1. Auf **CK-App Server (167.235.224.149)** wechseln
2. Dort das Next.js Projekt finden
3. Dort Git Pull machen
4. Dort die Installation durchführen

