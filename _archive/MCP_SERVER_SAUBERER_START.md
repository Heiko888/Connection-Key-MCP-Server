# ✅ MCP Server - Sauberer Start

**Status:** Health Checks funktionieren! ✅

**Problem:** Mehrere alte Prozesse laufen noch

---

## 🔍 Aktuelle Situation

```
Health Check lokal: ✅ {"status":"ok","port":7000,"service":"mcp-server"}
Health Check extern: ✅ {"status":"ok","port":7000,"service":"mcp-server"}

Laufende Prozesse:
- PID 523249: node connection-key/server.js (alt, seit Dec 14)
- PID 523291: node chatgpt-agent/server.js (alt, seit Dec 14)
- PID 566398: /usr/bin/node /opt/mcp-connection-key/server.js (systemd) ✅
- PID 566619: node /opt/mcp-connection-key/production/server.js (neu)
```

**Das bedeutet:** Systemd-Service läuft korrekt! ✅

---

## 🔧 Alte Prozesse beenden (optional, aber empfohlen)

### Schritt 1: Prüfe welche Ports die alten Prozesse verwenden

```bash
# Prüfe alle Ports
netstat -tlnp | grep node

# Oder spezifisch:
lsof -i -P -n | grep node
```

### Schritt 2: Beende alte Prozesse (falls sie nicht benötigt werden)

```bash
# Beende alte Prozesse
kill 523249 523291 566619

# Oder sanft beenden:
kill -TERM 523249 523291 566619

# Falls sie nicht reagieren:
kill -9 523249 523291 566619
```

### Schritt 3: Prüfe ob nur systemd läuft

```bash
# Prüfe Prozesse
ps aux | grep "server.js" | grep -v grep

# Sollte nur noch zeigen:
# root 566398 ... /usr/bin/node /opt/mcp-connection-key/server.js
```

---

## ✅ Finale Prüfung

```bash
# 1. Service Status
systemctl status mcp
# Sollte zeigen: Active: active (running) ✅

# 2. Nur systemd-Prozess sollte laufen
ps aux | grep "server.js" | grep -v grep
# Sollte nur PID 566398 zeigen ✅

# 3. Health Check lokal
curl http://localhost:7000/health
# Sollte zeigen: {"status":"ok",...} ✅

# 4. Health Check extern
curl http://138.199.237.34:7000/health
# Sollte zeigen: {"status":"ok",...} ✅

# 5. Marketing Agent testen (wie n8n es aufruft)
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
# Sollte eine Antwort zurückgeben ✅

# 6. Service aktivieren (Auto-Start)
systemctl enable mcp
systemctl is-enabled mcp
# Sollte zeigen: enabled ✅
```

---

## 🧪 n8n Verbindung testen

Jetzt sollte n8n den MCP Server erreichen können:

1. **In n8n:** Workflow "Agent → Mattermost Notification" ausführen
2. **Webhook aufrufen:** `http://138.199.237.34:5678/webhook/agent-mattermost`
3. **Daten senden:**
   ```json
   {
     "agentId": "marketing",
     "message": "Test von n8n"
   }
   ```

**Erwartetes Ergebnis:**
- ✅ Marketing Agent wird aufgerufen
- ✅ Antwort wird an Mattermost gesendet
- ✅ Kein "service refused connection" Fehler

---

## 🚨 Falls n8n weiterhin Fehler zeigt

### Prüfe Firewall:

```bash
# Prüfe ob Port 7000 offen ist
ufw status | grep 7000

# Falls nicht, öffne Port:
ufw allow 7000/tcp
ufw reload
```

### Prüfe n8n Workflow-Konfiguration:

- **URL sollte sein:** `http://138.199.237.34:7000/agent/{{ $json.agentId }}`
- **Methode:** `POST`
- **Content-Type:** `json`
- **Body:** `{{ JSON.stringify({ message: $json.message }) }}`

---

## ✅ Checkliste

- [x] Health Check lokal funktioniert ✅
- [x] Health Check extern funktioniert ✅
- [ ] Alte Prozesse beendet (optional)
- [ ] Nur systemd-Prozess läuft
- [ ] Service aktiviert (`systemctl enable mcp`)
- [ ] Marketing Agent Test erfolgreich
- [ ] n8n Workflow funktioniert

---

**Status:** ✅ **MCP Server läuft korrekt! n8n sollte jetzt funktionieren.**
