# 🚀 Chart-Berechnung einrichten - Befehle zum Ausführen

## 📋 Befehle für Hetzner Server

Führen Sie diese Befehle **auf dem Hetzner Server** aus:

```bash
# 1. Ins Verzeichnis wechseln
cd /opt/mcp-connection-key

# 2. Script ausführbar machen
chmod +x integration/scripts/manual-chart-setup.sh

# 3. Script ausführen
./integration/scripts/manual-chart-setup.sh
```

---

## 🔍 Was das Script macht

1. ✅ Prüft ob Chart-Berechnungs-Modul existiert
2. ✅ Erweitert `server.js` (fügt require und Endpoints hinzu)
3. ✅ Prüft/setzt Environment Variables
4. ✅ Startet MCP Server neu
5. ✅ Führt Test durch

---

## ✅ Nach der Ausführung

**Prüfen Sie:**

```bash
# 1. MCP Server Status
systemctl status mcp

# 2. Test Chart-Berechnung
curl -X POST http://localhost:7000/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin, Germany"}'

# 3. Test Cache-Statistiken
curl http://localhost:7000/chart/stats
```

---

## 📋 Falls Fehler auftreten

**Prüfen Sie Logs:**
```bash
journalctl -u mcp -n 50
```

**Prüfen Sie server.js:**
```bash
cat /opt/mcp/server.js | grep -A 5 "chart-calculation"
```

**Falls nötig, wiederherstelle Backup:**
```bash
cp /opt/mcp/server.js.backup.* /opt/mcp/server.js
systemctl restart mcp
```

