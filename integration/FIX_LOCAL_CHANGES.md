# 🔧 Lokale Änderungen vor Git Pull

## Problem

```
error: Your local changes to the following files would be overwritten by merge:
        production/start.sh
```

## Lösung - Option 1: Änderungen stashen (empfohlen)

```bash
cd /opt/mcp-connection-key

# Lokale Änderungen stashen
git stash

# Pull durchführen
git pull --no-rebase origin main

# Stash wieder anwenden (falls nötig)
git stash pop

# Dann Script ausführen
chmod +x integration/VERIFY_CORS_FIREWALL.sh
./integration/VERIFY_CORS_FIREWALL.sh
```

## Lösung - Option 2: Änderungen committen

```bash
cd /opt/mcp-connection-key

# Änderungen committen
git add production/start.sh
git commit -m "Local changes to production/start.sh"

# Pull durchführen
git pull --no-rebase origin main

# Dann Script ausführen
chmod +x integration/VERIFY_CORS_FIREWALL.sh
./integration/VERIFY_CORS_FIREWALL.sh
```

## Lösung - Option 3: Änderungen verwerfen (nur wenn nicht wichtig!)

```bash
cd /opt/mcp-connection-key

# Änderungen verwerfen
git checkout -- production/start.sh

# Pull durchführen
git pull --no-rebase origin main

# Dann Script ausführen
chmod +x integration/VERIFY_CORS_FIREWALL.sh
./integration/VERIFY_CORS_FIREWALL.sh
```

## Empfehlung: Option 1 (Stash)

**Komplett-Befehl:**

```bash
cd /opt/mcp-connection-key && git stash && git pull --no-rebase origin main && git stash pop && chmod +x integration/VERIFY_CORS_FIREWALL.sh && ./integration/VERIFY_CORS_FIREWALL.sh
```

**Oder Schritt-für-Schritt:**

```bash
cd /opt/mcp-connection-key
git stash
git pull --no-rebase origin main
git stash pop
chmod +x integration/VERIFY_CORS_FIREWALL.sh
./integration/VERIFY_CORS_FIREWALL.sh
```

