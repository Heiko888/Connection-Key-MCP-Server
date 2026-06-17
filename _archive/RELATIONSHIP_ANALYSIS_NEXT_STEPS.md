# ✅ Relationship Analysis Agent - Nächste Schritte

**Datum:** 17.12.2025

**Status:** Dateien vorhanden, bereit für Deployment

---

## 📊 Aktueller Status

✅ **Basis-Verzeichnis vorhanden** (`/opt/mcp-connection-key`)  
✅ **Integration-Verzeichnis vorhanden** (alle Dateien da)  
✅ **Agent-Script vorhanden** (muss ausführbar gemacht werden)  
✅ **MCP Server läuft**  
⚠️ **Frontend-Verzeichnis** (läuft auf anderem Server - normal)  
⚠️ **Agent-Script nicht ausführbar** (schnell fixbar)

---

## 🚀 Schnell-Fix (2 Befehle)

```bash
# Auf MCP Server (wo du gerade bist)
cd /opt/mcp-connection-key

# 1. Script ausführbar machen
chmod +x create-relationship-analysis-agent.sh
chmod +x deploy-relationship-analysis-complete.sh
chmod +x check-relationship-analysis-files.sh

# 2. Prüfung nochmal ausführen
./check-relationship-analysis-files.sh
```

**Erwartet:** ✅ Keine kritischen Fehler mehr

---

## 📋 Deployment-Optionen

### Option A: Automatisch (empfohlen)

```bash
# Auf MCP Server
cd /opt/mcp-connection-key

# Scripts ausführbar machen
chmod +x *.sh

# Deployment ausführen
./deploy-relationship-analysis-complete.sh
```

**Was passiert:**
1. ✅ Agent wird erstellt
2. ✅ Frontend-Dateien werden auf CK-App Server kopiert (via SSH/SCP)
3. ✅ Environment-Variablen werden gesetzt
4. ✅ Frontend wird neu gestartet

---

### Option B: Manuell (Schritt für Schritt)

**Siehe:** `RELATIONSHIP_ANALYSIS_DEPLOYMENT_MANUELL.md`

**Kurzfassung:**
1. Agent erstellen: `./create-relationship-analysis-agent.sh`
2. Frontend-Dateien auf CK-App Server kopieren
3. Environment-Variablen setzen
4. Frontend neu starten

---

## 🔍 Wichtige Hinweise

### Frontend-Verzeichnis

**Das Frontend-Verzeichnis fehlt hier, weil:**
- ✅ Du bist auf **MCP Server** (`138.199.237.34`)
- ✅ Frontend läuft auf **CK-App Server** (`167.235.224.149`)
- ✅ Das ist **normal** und **korrekt**

**Das Deployment-Script kopiert die Dateien automatisch auf den CK-App Server!**

---

### Environment-Variablen

**`.env.local` wird automatisch erstellt beim Deployment:**
- `MCP_SERVER_URL=http://138.199.237.34:7000`

**Falls du es manuell setzen willst:**

```bash
# Auf CK-App Server
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key/frontend

# Erstelle .env.local
echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local
```

---

## ✅ Checkliste

- [x] Dateien auf MCP Server vorhanden
- [ ] Scripts ausführbar gemacht (`chmod +x`)
- [ ] Deployment ausgeführt
- [ ] Frontend-Dateien auf CK-App Server kopiert
- [ ] Environment-Variablen gesetzt
- [ ] Frontend neu gestartet
- [ ] Getestet

---

## 🧪 Nach dem Deployment testen

### 1. Agent testen (auf MCP Server)

```bash
curl -X POST http://localhost:7000/agent/relationship-analysis-agent \
  -H "Content-Type: application/json" \
  -d '{"message": "Test", "userId": "test"}'
```

### 2. Frontend API testen (auf CK-App Server)

```bash
ssh root@167.235.224.149
curl -X GET http://localhost:3005/api/relationship-analysis/generate
```

### 3. Frontend-Seite öffnen

```
http://167.235.224.149:3005/coach/readings/create
```

---

## 🎯 Quick-Start (Copy & Paste)

```bash
# Auf MCP Server
cd /opt/mcp-connection-key
chmod +x *.sh
./deploy-relationship-analysis-complete.sh
```

**Fertig!** 🚀
