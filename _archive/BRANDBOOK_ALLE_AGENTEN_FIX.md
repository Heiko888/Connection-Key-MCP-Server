# 🎯 Brand Book - Alle Agenten ausstatten

**Problem:** Nur Reading Agent hat Brand Book, MCP Agenten fehlen noch

**Lösung:** Alle MCP Agenten Prompts mit Brand Book erweitern

---

## 📊 Aktueller Status

| Agent | Status | Brand Book | Deployment |
|-------|--------|------------|------------|
| Reading Agent | ✅ Code fertig | ✅ Integriert | ⏳ Ausstehend |
| Marketing Agent | ❌ Nicht angepasst | ❌ Fehlt | ❌ Nicht bereit |
| Automation Agent | ❌ Nicht angepasst | ❌ Fehlt | ❌ Nicht bereit |
| Sales Agent | ❌ Nicht angepasst | ❌ Fehlt | ❌ Nicht bereit |
| Social-YouTube Agent | ❌ Nicht angepasst | ❌ Fehlt | ❌ Nicht bereit |

---

## 🔧 Lösung

### Script: `update-all-agents-brandbook.sh`

**Funktion:**
- Erweitert alle MCP Agenten Prompts mit Brand Book Sektion
- Erstellt Backup der originalen Prompts
- Startet MCP Server neu (optional)

**Ausführung:**
```bash
# Auf Hetzner Server
cd /opt/mcp-connection-key
chmod +x update-all-agents-brandbook.sh
./update-all-agents-brandbook.sh
```

---

## 📋 Was wird hinzugefügt

### Brand Book Sektion für alle Agenten

```
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
```

---

## 🚀 Deployment

### Schritt 1: Script auf Server kopieren

```bash
# Von lokal
scp update-all-agents-brandbook.sh root@138.199.237.34:/opt/mcp-connection-key/
```

### Schritt 2: Script ausführen

```bash
# Auf Hetzner Server
cd /opt/mcp-connection-key
chmod +x update-all-agents-brandbook.sh
./update-all-agents-brandbook.sh
```

### Schritt 3: MCP Server neu starten

```bash
# Falls systemctl
systemctl restart mcp

# Falls PM2
pm2 restart mcp
```

---

## 🧪 Testen

### Marketing Agent testen

```bash
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle einen Marketing-Text für The Connection Key"
  }'
```

**Prüfen Sie:**
- ✅ Wird Brand Voice verwendet?
- ✅ Wird Markenidentität reflektiert?
- ✅ Wird Tone of Voice korrekt angewendet?

### Sales Agent testen

```bash
curl -X POST http://138.199.237.34:7000/agent/sales \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle eine Salespage für The Connection Key"
  }'
```

---

## 📁 Dateien

### Prompt-Dateien (auf Server)

- `/opt/ck-agent/prompts/marketing.txt`
- `/opt/ck-agent/prompts/automation.txt`
- `/opt/ck-agent/prompts/sales.txt`
- `/opt/ck-agent/prompts/social-youtube.txt`

### Backups

Vor jeder Änderung wird ein Backup erstellt:
- `marketing.txt.backup-YYYYMMDD-HHMMSS`
- `automation.txt.backup-YYYYMMDD-HHMMSS`
- etc.

---

## ✅ Checkliste

- [ ] Script auf Server kopiert
- [ ] Script ausgeführt
- [ ] Alle Prompts aktualisiert
- [ ] MCP Server neu gestartet
- [ ] Marketing Agent getestet
- [ ] Sales Agent getestet
- [ ] Brand Voice geprüft

---

**Status:** 🔧 Script bereit, muss auf Server ausgeführt werden

