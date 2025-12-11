# 📤 Integration-Dateien zum CK-App Server kopieren

## Problem

Das Zielverzeichnis existiert nicht auf dem Server.

## Lösung

### Schritt 1: Verzeichnis auf dem Server erstellen

**Auf CK-App Server (167.235.224.149) ausführen:**

```bash
cd /opt/hd-app/The-Connection-Key/frontend
mkdir -p integration
```

### Schritt 2: Dateien kopieren

**Von Windows (PowerShell):**

```powershell
cd C:\AppProgrammierung\Projekte\MCP_Connection_Key
scp -r integration/* root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/integration/
```

**Oder mit tar (empfohlen):**

**Von Windows (PowerShell):**

```powershell
cd C:\AppProgrammierung\Projekte\MCP_Connection_Key

# Erstelle Archiv
tar -czf integration.tar.gz integration/

# Kopiere Archiv
scp integration.tar.gz root@167.235.224.149:/tmp/

# Auf Server entpacken (SSH zum Server)
# ssh root@167.235.224.149
# cd /opt/hd-app/The-Connection-Key/frontend
# tar -xzf /tmp/integration.tar.gz
# rm /tmp/integration.tar.gz
```

---

## Alternative: Einzeiliger Befehl (Server-seitig)

**Auf CK-App Server (167.235.224.149) ausführen:**

```bash
cd /opt/hd-app/The-Connection-Key/frontend && mkdir -p integration && echo "✅ Verzeichnis erstellt - jetzt können Sie SCP ausführen"
```

**Dann von Windows:**

```powershell
scp -r integration/* root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/integration/
```

---

## Oder: Vom Hetzner Server kopieren

**Auf Hetzner Server (138.199.237.34):**

```bash
cd /opt/mcp-connection-key
tar -czf integration.tar.gz integration/
scp integration.tar.gz root@167.235.224.149:/tmp/
```

**Auf CK-App Server (167.235.224.149):**

```bash
cd /opt/hd-app/The-Connection-Key/frontend
tar -xzf /tmp/integration.tar.gz
rm /tmp/integration.tar.gz
ls integration/
```

