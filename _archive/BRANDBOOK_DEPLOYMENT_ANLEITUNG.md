# 🚀 Brand Book Integration Fix - Deployment

**Ziel:** Aktualisierte `server.js` auf Server deployen und Reading Agent neu starten

---

## 📋 Übersicht

Das Deployment-Script führt folgende Schritte aus:

1. ✅ Backup der aktuellen `server.js` erstellen
2. ✅ Aktualisierte `server.js` auf Server kopieren
3. ✅ Reading Agent Status prüfen
4. ✅ Reading Agent neu starten
5. ✅ Health Check durchführen
6. ✅ Optional: Knowledge neu laden

---

## 🚀 Option 1: PowerShell Script (von lokal)

### Voraussetzungen

- PowerShell auf Windows
- SSH-Zugriff auf Hetzner Server (138.199.237.34)
- `server.js` muss lokal aktualisiert sein

### Ausführung

```powershell
# Im Projekt-Verzeichnis
.\deploy-brandbook-fix.ps1
```

**Was passiert:**
1. Verbindung zum Hetzner Server prüfen
2. Backup erstellen
3. `production/server.js` → Server kopieren
4. Reading Agent neu starten
5. Status prüfen

---

## 🚀 Option 2: Bash Script (direkt auf Server)

### Voraussetzungen

- SSH-Zugriff auf Hetzner Server
- `server.js` muss bereits auf Server aktualisiert sein

### Ausführung

```bash
# Auf Hetzner Server
cd /opt/mcp-connection-key
chmod +x deploy-brandbook-fix.sh
./deploy-brandbook-fix.sh
```

**Oder manuell:**

```bash
# Auf Hetzner Server
cd /opt/mcp-connection-key/production

# Backup erstellen
cp server.js server.js.backup-$(date +%Y%m%d-%H%M%S)

# Reading Agent neu starten
pm2 restart reading-agent

# Status prüfen
pm2 status reading-agent
curl http://localhost:4001/health
```

---

## 🔧 Manuelles Deployment

### Schritt 1: server.js auf Server kopieren

**Von lokal (PowerShell):**
```powershell
scp production\server.js root@138.199.237.34:/opt/mcp-connection-key/production/server.js
```

**Oder auf Server direkt:**
```bash
# Falls Sie server.js bereits auf Server haben
cd /opt/mcp-connection-key/production
# server.js sollte bereits aktualisiert sein
```

### Schritt 2: Backup erstellen

```bash
cd /opt/mcp-connection-key/production
cp server.js server.js.backup-$(date +%Y%m%d-%H%M%S)
```

### Schritt 3: Reading Agent neu starten

```bash
pm2 restart reading-agent
```

### Schritt 4: Status prüfen

```bash
# PM2 Status
pm2 status reading-agent

# Health Check
curl http://localhost:4001/health

# Logs prüfen
pm2 logs reading-agent --lines 50
```

### Schritt 5: Knowledge neu laden (optional)

```bash
# AGENT_SECRET aus .env lesen
AGENT_SECRET=$(grep "^AGENT_SECRET=" /opt/mcp-connection-key/production/.env | cut -d= -f2)

# Knowledge neu laden
curl -X POST http://localhost:4001/admin/reload-knowledge \
  -H "Content-Type: application/json" \
  -d "{\"secret\": \"$AGENT_SECRET\"}"
```

---

## 🧪 Testen

### Test 1: Health Check

```bash
curl http://138.199.237.34:4001/health
```

**Erwartete Antwort:**
```json
{
  "status": "ok",
  "service": "reading-agent",
  "port": 4001,
  "knowledge": 23,
  "templates": 10,
  "timestamp": "2025-01-XX..."
}
```

### Test 2: Reading generieren

```bash
curl -X POST http://138.199.237.34:4001/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "detailed"
  }'
```

**Prüfen Sie:**
- ✅ Wird Brand Voice verwendet?
- ✅ Wird Markenidentität reflektiert?
- ✅ Wird Tone of Voice korrekt angewendet?
- ✅ Werden Brand Book Inhalte integriert?

---

## 📊 Was wurde geändert

### System-Prompt

- ✅ Explizite Anweisung zur Brand Book Verwendung
- ✅ Anweisung für Tone of Voice, Markenidentität, Brand Voice
- ✅ Brand Book Knowledge wird priorisiert

### Knowledge-Loading

- ✅ Unterstützung für Unterordner (z.B. `knowledge/brandbook/`)
- ✅ Automatische Erkennung von Brand Book Dateien

### Brand Book Integration

- ✅ Brand Book Knowledge in separater Sektion
- ✅ Höhere Priorität als andere Knowledge
- ✅ Klare Markierung als "WICHTIG - IMMER VERWENDEN"

---

## ❌ Troubleshooting

### Problem: Reading Agent startet nicht

```bash
# Prüfe Logs
pm2 logs reading-agent --lines 100

# Prüfe ob Port belegt ist
netstat -tulpn | grep 4001

# Prüfe .env Datei
cat /opt/mcp-connection-key/production/.env
```

### Problem: Knowledge wird nicht geladen

```bash
# Prüfe Knowledge-Verzeichnis
ls -la /opt/mcp-connection-key/production/knowledge/

# Prüfe ob Brand Book Dateien vorhanden sind
ls -la /opt/mcp-connection-key/production/knowledge/brandbook/

# Prüfe Logs beim Start
pm2 logs reading-agent --lines 50 | grep -i knowledge
```

### Problem: Brand Voice wird nicht verwendet

```bash
# Prüfe System-Prompt in Logs
pm2 logs reading-agent --lines 200 | grep -A 50 "System-Prompt"

# Teste mit expliziter Anfrage
curl -X POST http://localhost:4001/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "detailed"
  }' | jq '.reading'
```

---

## ✅ Checkliste

- [ ] Backup erstellt
- [ ] server.js auf Server kopiert
- [ ] Reading Agent neu gestartet
- [ ] Health Check erfolgreich
- [ ] Knowledge neu geladen (optional)
- [ ] Test-Reading generiert
- [ ] Brand Voice geprüft
- [ ] Markenidentität geprüft

---

**Status:** 🚀 Bereit für Deployment

