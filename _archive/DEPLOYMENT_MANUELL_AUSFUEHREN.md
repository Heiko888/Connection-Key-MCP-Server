# 🚀 Brand Book Integration - Manuelle Ausführung

**Da SSH/SCP möglicherweise nicht direkt funktioniert, hier die manuellen Schritte:**

---

## 📋 Schritt-für-Schritt Anleitung

### Schritt 1: Reading Agent aktualisieren

**Auf Hetzner Server (138.199.237.34):**

```bash
# 1. Verbinden
ssh root@138.199.237.34

# 2. Backup erstellen
cd /opt/mcp-connection-key/production
cp server.js server.js.backup-$(date +%Y%m%d-%H%M%S)

# 3. server.js von lokal kopieren (mit SCP oder manuell)
# Von lokal (PowerShell):
scp production\server.js root@138.199.237.34:/opt/mcp-connection-key/production/server.js

# 4. Reading Agent neu starten
pm2 restart reading-agent

# 5. Status prüfen
pm2 status reading-agent
curl http://localhost:4001/health
```

---

### Schritt 2: MCP Agenten mit Brand Book ausstatten

**Auf Hetzner Server:**

```bash
# 1. Script von lokal kopieren
# Von lokal (PowerShell):
scp update-all-agents-brandbook.sh root@138.199.237.34:/opt/mcp-connection-key/

# 2. Script ausführen
cd /opt/mcp-connection-key
chmod +x update-all-agents-brandbook.sh
./update-all-agents-brandbook.sh

# 3. Bei "MCP Server jetzt neu starten?" mit "j" antworten
```

---

### Schritt 3: Verifikation

```bash
# Reading Agent Health
curl http://localhost:4001/health

# MCP Server Health
curl http://localhost:7000/health

# MCP Agenten Liste
curl http://localhost:7000/agents
```

---

## 🔧 Alternative: Manuelle Prompt-Erweiterung

Falls das Script nicht funktioniert, können Sie die Prompts manuell erweitern:

### Marketing Agent

```bash
# Auf Server
cd /opt/ck-agent/prompts

# Backup erstellen
cp marketing.txt marketing.txt.backup

# Brand Book Sektion hinzufügen
cat >> marketing.txt << 'EOF'

=== BRAND BOOK WISSEN (WICHTIG - IMMER VERWENDEN) ===

Du arbeitest für "The Connection Key" und MUSST das Brand Book Wissen in all deinen Antworten verwenden:

WICHTIG - Brand Book Richtlinien:
- Nutze den korrekten Tone of Voice von "The Connection Key"
- Reflektiere die Markenidentität und Werte in deinen Antworten
- Halte dich an die Kommunikationsrichtlinien
- Verwende den Brand Voice konsistent
- Markenstatement: "Entdecke die Frequenz zwischen euch – klar, präzise, alltagsnah."

Markenwerte:
- Präzision: Echte Daten, klare Analysen, kein esoterisches Raten
- Verbindung: Zwischen Menschen, Körper, Seele, Design und Realität
- Transformation: Praktische Umsetzung im Alltag, Dating, Business, Coaching

Sprache: Deutsch
Stil: Authentisch, klar, wertvoll, persönlich - im Einklang mit The Connection Key Brand Voice
EOF
```

**Wiederholen Sie dies für:**
- `automation.txt`
- `sales.txt`
- `social-youtube.txt`

---

## ✅ Checkliste

- [ ] Reading Agent: server.js aktualisiert
- [ ] Reading Agent: Agent neu gestartet
- [ ] MCP Agenten: Brand Book Script ausgeführt
- [ ] MCP Agenten: Alle 4 Prompts erweitert
- [ ] MCP Server: Neu gestartet
- [ ] Health Checks durchgeführt

---

**Status:** 📋 Bereit zur manuellen Ausführung

