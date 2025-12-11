# 🔧 PM2 ENV-Variablen neu laden

PM2 lädt ENV-Variablen nicht automatisch neu. Führen Sie diese Befehle aus:

```bash
cd /opt/mcp-connection-key/production

# 1. Prüfe ob Knowledge/Templates existieren
ls -la knowledge/
ls -la templates/

# 2. Prüfe .env Pfade
cat .env | grep -E "^(KNOWLEDGE_PATH|TEMPLATE_PATH)="

# 3. Stoppe Agent komplett
pm2 delete reading-agent

# 4. Lade ENV-Variablen und starte neu
export $(cat .env | grep -v '^#' | xargs)
pm2 start server.js \
    --name reading-agent \
    -o logs/reading-agent-out.log \
    -e logs/reading-agent-error.log \
    --merge-logs \
    --time \
    --update-env

# 5. PM2 speichern
pm2 save

# 6. Prüfe Health
sleep 3
curl http://localhost:4001/health | python3 -m json.tool
```

**Oder als einzeiliger Befehl:**

```bash
cd /opt/mcp-connection-key/production && ls -la knowledge/ templates/ && cat .env | grep -E "^(KNOWLEDGE_PATH|TEMPLATE_PATH)=" && pm2 delete reading-agent && export $(cat .env | grep -v '^#' | xargs) && pm2 start server.js --name reading-agent -o logs/reading-agent-out.log -e logs/reading-agent-error.log --merge-logs --time --update-env && pm2 save && sleep 3 && curl http://localhost:4001/health | python3 -m json.tool
```

