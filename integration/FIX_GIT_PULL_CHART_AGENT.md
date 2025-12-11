# 🔧 Git Pull Fix - Chart Development Agent Installation

## Problem
```
fatal: Need to specify how to reconcile divergent branches.
```

## Lösung

Führen Sie diese Befehle auf dem Hetzner Server aus:

```bash
# 1. Git Pull mit Merge (empfohlen)
git pull --no-rebase origin main

# 2. Falls es Konflikte gibt, lösen Sie diese und committen Sie
# 3. Dann Installations-Script ausführen
chmod +x integration/RUN_ON_HETZNER.sh
./integration/RUN_ON_HETZNER.sh
```

## Alternative: Rebase (falls Sie keine lokalen Änderungen behalten müssen)

```bash
git pull --rebase origin main
chmod +x integration/RUN_ON_HETZNER.sh
./integration/RUN_ON_HETZNER.sh
```

## Falls lokale Änderungen vorhanden sind

```bash
# 1. Lokale Änderungen stashen
git stash

# 2. Pull durchführen
git pull --no-rebase origin main

# 3. Stash wieder anwenden (optional)
git stash pop

# 4. Installations-Script ausführen
chmod +x integration/RUN_ON_HETZNER.sh
./integration/RUN_ON_HETZNER.sh
```

