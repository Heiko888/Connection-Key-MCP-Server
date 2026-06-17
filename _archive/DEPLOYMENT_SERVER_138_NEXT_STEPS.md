# ✅ Server 138 - Nächste Schritte

**Status:** ✅ Branch korrekt, Code aktuell

---

## 📋 NÄCHSTE SCHRITTE

### Schritt 1: Prüfe wie MCP Server läuft

```bash
# Option A: Systemd
systemctl status mcp

# Option B: PM2
pm2 list | grep mcp

# Option C: Docker
docker ps | grep mcp

# Option D: Prozess
ps aux | grep "mcp-gateway\|server.js" | grep -v grep
```

---

### Schritt 2: MCP Core neu starten

**Falls Systemd:**
```bash
systemctl restart mcp
systemctl status mcp
journalctl -u mcp -n 50 --no-pager | grep "MCP Core"
```

**Falls PM2:**
```bash
pm2 restart mcp
# ODER
pm2 restart all
pm2 logs mcp --lines 50 --nostream | grep "MCP Core"
```

**Falls Docker:**
```bash
docker ps | grep mcp
docker restart <container-name>
docker logs <container-name> --tail 50 | grep "MCP Core"
```

---

### Schritt 3: Prüfe ob Dateien aktualisiert wurden

```bash
# Prüfe index.js (sollte aktuelle Version sein)
ls -la index.js
head -20 index.js | grep "generateReading"

# Prüfe n8n Workflow
ls -la n8n-workflows/reading-generation-workflow.json
```

---

### Schritt 4: n8n Workflow importieren

**Via n8n UI:**

1. Öffne: **https://n8n.werdemeisterdeinergedankenagent.de**
2. Login (Admin-Credentials)
3. Gehe zu: **Workflows** (linke Sidebar)
4. Klicke auf: **"+"** (oben rechts) → **"Import from File"**
5. Wähle Datei: `/opt/mcp-connection-key/n8n-workflows/reading-generation-workflow.json`
6. Klicke: **"Import"**
7. Prüfe Workflow:
   - Webhook-Pfad: `/webhook/reading` ✅
   - Node "Validate Payload" vorhanden ✅
   - Node "Save Reading" (INSERT readings) vorhanden ✅
   - Node "Update Reading Job" (UPDATE reading_jobs) vorhanden ✅
8. Aktiviere Workflow: Toggle oben rechts auf **GRÜN**

---

## ✅ CHECKLISTE

- [x] Branch korrekt (`feature/reading-agent-option-a-complete`)
- [x] Code aktuell (up to date)
- [ ] MCP Core neu gestartet
- [ ] MCP Core Logs zeigen: `[MCP Core] generateReading aufgerufen`
- [ ] n8n Workflow importiert
- [ ] n8n Workflow aktiviert (Toggle GRÜN)

---

**Status:** ✅ **Bereit für MCP Core Neustart + n8n Workflow**
