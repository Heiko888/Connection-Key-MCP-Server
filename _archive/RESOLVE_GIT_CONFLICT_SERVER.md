# 🔧 Git Pull Konflikt auf Server lösen

## Problem

Beim `git pull` gibt es Konflikte:
1. Lokale Änderungen an `docker-compose.yml`
2. Ungetrackte Dateien die überschrieben würden

## Lösung

### Option 1: Lokale Änderungen behalten (empfohlen)

```bash
# 1. Lokale Änderungen an docker-compose.yml stashen
git stash push -m "Lokale docker-compose.yml Änderungen"

# 2. Ungetrackte Dateien in Backup-Verzeichnis verschieben
mkdir -p /opt/mcp-connection-key/backup-scripts
mv fix-docker-compose-and-https.sh backup-scripts/
mv https-setup-final.sh backup-scripts/
mv setup-https-now.sh backup-scripts/
mv setup-mailchimp-final.sh backup-scripts/
mv setup-mcp-simple.sh backup-scripts/
mv setup-openai-integration.sh backup-scripts/
mv start-services.sh backup-scripts/

# 3. Git pull erneut ausführen
git pull

# 4. Lokale Änderungen wieder anwenden (falls gewünscht)
git stash pop
```

### Option 2: Lokale Änderungen verwerfen

```bash
# 1. Lokale Änderungen verwerfen
git checkout -- docker-compose.yml

# 2. Ungetrackte Dateien entfernen (oder verschieben)
mkdir -p /opt/mcp-connection-key/backup-scripts
mv fix-docker-compose-and-https.sh backup-scripts/
mv https-setup-final.sh backup-scripts/
mv setup-https-now.sh backup-scripts/
mv setup-mailchimp-final.sh backup-scripts/
mv setup-mcp-simple.sh backup-scripts/
mv setup-openai-integration.sh backup-scripts/
mv start-services.sh backup-scripts/

# 3. Git pull
git pull
```

### Option 3: Lokale Änderungen committen (wenn wichtig)

```bash
# 1. Lokale Änderungen committen
git add docker-compose.yml
git commit -m "Lokale docker-compose.yml Anpassungen"

# 2. Ungetrackte Dateien verschieben
mkdir -p /opt/mcp-connection-key/backup-scripts
mv fix-docker-compose-and-https.sh backup-scripts/
mv https-setup-final.sh backup-scripts/
mv setup-https-now.sh backup-scripts/
mv setup-mailchimp-final.sh backup-scripts/
mv setup-mcp-simple.sh backup-scripts/
mv setup-openai-integration.sh backup-scripts/
mv start-services.sh backup-scripts/

# 3. Git pull (kann Merge-Konflikt geben, dann manuell lösen)
git pull
```

## Empfehlung

**Option 1** ist am sichersten, da die lokalen Änderungen erhalten bleiben und später wieder angewendet werden können.

## Nach dem Pull

Nach erfolgreichem Pull sollten Sie haben:
- ✅ `production/` Verzeichnis mit Reading Agent
- ✅ `deployment/` Verzeichnis mit Installationsanleitung
- ✅ Alle neuen Dokumentationsdateien
- ✅ Alle neuen Scripts

