# 🔧 Git Pull Problem lösen

## Problem

```
fatal: Need to specify how to reconcile divergent branches.
```

## Lösung

Führen Sie auf dem Hetzner Server aus:

```bash
cd /opt/mcp-connection-key

# Option 1: Merge (empfohlen)
git pull --no-rebase origin main

# Oder Option 2: Rebase
# git pull --rebase origin main

# Dann Script ausführen
chmod +x integration/VERIFY_CORS_FIREWALL.sh
./integration/VERIFY_CORS_FIREWALL.sh
```

## Komplett-Befehl

```bash
cd /opt/mcp-connection-key && git pull --no-rebase origin main && chmod +x integration/VERIFY_CORS_FIREWALL.sh && ./integration/VERIFY_CORS_FIREWALL.sh
```

