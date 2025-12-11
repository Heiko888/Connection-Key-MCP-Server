# 🔍 Prüfung: Integration-Dateien im Frontend-Repository

## Problem

Die Integration-Dateien sind im **Connection-Key-MCP-Server** Repository, nicht im **The-Connection-Key** Repository!

## Lösung

### Option 1: Dateien vom MCP-Repository kopieren

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob integration/ vorhanden ist
ls integration/

# Falls nicht vorhanden, kopieren Sie die Dateien vom MCP-Repository
# Oder per SCP vom lokalen Rechner
```

### Option 2: Dateien per SCP vom lokalen Rechner kopieren

**Von Windows (PowerShell):**

```powershell
cd C:\AppProgrammierung\Projekte\MCP_Connection_Key
scp -r integration/ root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/
```

### Option 3: Dateien manuell erstellen

Die wichtigsten Dateien sind:
- `integration/api-routes/*.ts` (5 Dateien)
- `integration/frontend/components/*.tsx` (2 Dateien)
- `integration/install-ck-app-server.sh`
- `integration/QUICK_DEPLOY_CK_APP.sh`

---

## Schnell-Check

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob integration/ vorhanden ist
if [ -d "integration" ]; then
    echo "✅ integration/ vorhanden"
    ls integration/
else
    echo "❌ integration/ nicht vorhanden"
    echo "💡 Dateien müssen kopiert werden"
fi
```

