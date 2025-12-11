# 🔧 Manuelle Git-Konflikt-Lösung auf Server

Führen Sie diese Befehle **direkt auf dem Server** aus:

```bash
cd /opt/mcp-connection-key

# 1. Lokale Änderungen an docker-compose.yml stashen
git stash push -m "Lokale docker-compose.yml Änderungen vor Pull"

# 2. Backup-Verzeichnis erstellen
mkdir -p backup-scripts

# 3. Ungetrackte Dateien verschieben
mv fix-docker-compose-and-https.sh backup-scripts/ 2>/dev/null || true
mv https-setup-final.sh backup-scripts/ 2>/dev/null || true
mv setup-https-now.sh backup-scripts/ 2>/dev/null || true
mv setup-mailchimp-final.sh backup-scripts/ 2>/dev/null || true
mv setup-mcp-simple.sh backup-scripts/ 2>/dev/null || true
mv setup-openai-integration.sh backup-scripts/ 2>/dev/null || true
mv start-services.sh backup-scripts/ 2>/dev/null || true

# 4. Jetzt git pull
git pull

# 5. Script ausführbar machen und ausführen (falls gewünscht)
chmod +x resolve-git-conflict.sh
```

**Oder alles in einem Befehl:**

```bash
cd /opt/mcp-connection-key && git stash push -m "Lokale Änderungen" && mkdir -p backup-scripts && mv fix-docker-compose-and-https.sh https-setup-final.sh setup-https-now.sh setup-mailchimp-final.sh setup-mcp-simple.sh setup-openai-integration.sh start-services.sh backup-scripts/ 2>/dev/null; git pull
```

