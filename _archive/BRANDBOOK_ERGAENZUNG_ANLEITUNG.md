# 📋 Brandbook-Ergänzung: Signature Bodygraph System - Anleitung

**Datum:** 24.12.2025

---

## ✅ Was wurde erstellt

1. **Brandbook-Ergänzung:**
   - `production/knowledge/brandbook/brandbook-signature-bodygraph.md`
   - Enthält alle Systemregeln für das Signature Bodygraph System

2. **Update-Script:**
   - `update-brandbook-signature-bodygraph.sh`
   - Aktualisiert alle Agent-Prompts automatisch

---

## 🚀 Deployment-Anleitung

### Schritt 1: Brandbook-Datei auf Server kopieren

```bash
# Auf lokalem Rechner
scp production/knowledge/brandbook/brandbook-signature-bodygraph.md root@138.199.237.34:/opt/mcp-connection-key/production/knowledge/brandbook/
```

### Schritt 2: Update-Script auf Server kopieren

```bash
# Auf lokalem Rechner
scp update-brandbook-signature-bodygraph.sh root@138.199.237.34:/opt/ck-agent/
```

### Schritt 3: Script ausführen

```bash
# Auf Server (SSH)
ssh root@138.199.237.34
cd /opt/ck-agent
chmod +x update-brandbook-signature-bodygraph.sh
./update-brandbook-signature-bodygraph.sh
```

Das Script:
- ✅ Erstellt Backups aller Prompt-Dateien
- ✅ Fügt Signature Bodygraph System-Regeln zu allen Agent-Prompts hinzu
- ✅ Fragt nach MCP Server Neustart

### Schritt 4: MCP Server neu starten

```bash
# Auf Server
systemctl restart mcp-server
```

### Schritt 5: Reading Agent neu starten (optional)

Der Reading Agent lädt Brandbook-Dateien automatisch beim Start:

```bash
# Auf Server
systemctl restart mcp-server  # Lädt auch Brandbook neu
```

---

## 📋 Wichtige Regeln für Agenten

### Sprachliche Systemregeln (VERBINDLICH)

**✅ ERLAUBT:**
- Beschreibend, sachlich, ruhig, systemisch
- Orientierung, nicht Beeinflussung

**❌ VERBOTEN (NIEMALS VERWENDEN):**
- Heilung
- Blockade
- Transformation
- Manifestation
- Loslassen
- Energiearbeit

### Systemverständnis

- Bodygraph ist modulares, zustandsbasiertes System
- Darstellung und Bedeutung sind strikt getrennt
- Nur ein Fokuszustand gleichzeitig

### Kontextsystem

- Kontexte: `personal`, `business`, `relationship`, `crisis`
- Kontext verändert **Bedeutung**, nicht **Darstellung**

---

## 🎯 Betroffene Agenten

**Besonders wichtig für:**
- ✅ Chart Development Agent
- ✅ Chart Architect Agent
- ✅ Reading Agent
- ✅ Relationship Analysis Agent

**Alle anderen Agenten:**
- ✅ Marketing Agent
- ✅ Sales Agent
- ✅ Social-YouTube Agent
- ✅ Automation Agent
- ✅ Website UX Agent
- ✅ Video Creation Agent
- ✅ Tasks Agent

---

## ✅ Checkliste

- [x] Brandbook-Ergänzung erstellt
- [x] Update-Script erstellt
- [ ] Brandbook-Datei auf Server kopiert
- [ ] Update-Script auf Server kopiert
- [ ] Script ausgeführt
- [ ] MCP Server neu gestartet
- [ ] Tests durchgeführt

---

**Status:** ✅ Vorbereitet. ⚠️ Deployment auf Server erforderlich.
