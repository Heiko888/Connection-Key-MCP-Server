# 🚀 Automatisierung Quick Start

## 📋 Schnellstart für Agenten-Automatisierung

### 1. 🤖 Agenten nacheinander arbeiten lassen

#### n8n Workflow erstellen

1. **Öffnen Sie n8n:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Neuer Workflow erstellen**
3. **Nodes hinzufügen:**

**Beispiel: Content-Pipeline**
```
1. Schedule Trigger (täglich 9:00)
   ↓
2. HTTP Request → Marketing Agent
   URL: http://138.199.237.34:7000/agent/marketing
   Method: POST
   Body: {"message": "Erstelle 5 Content-Ideen"}
   ↓
3. HTTP Request → Social-YouTube Agent
   URL: http://138.199.237.34:7000/agent/social-youtube
   Method: POST
   Body: {"message": "Erstelle YouTube-Skript für: {{ $json.response }}"}
   ↓
4. Supabase → Speichern
```

### 2. 📚 Reading Agent - 100 Knowledge-Dateien hinzufügen

#### Schritt 1: Knowledge-Dateien vorbereiten

```bash
# Erstellen Sie Knowledge-Dateien lokal
mkdir -p ~/knowledge-files

# Beispiel-Dateien erstellen
cat > ~/knowledge-files/type-generator.txt << 'EOF'
# Generator Typ
...
EOF

# Weitere 99 Dateien erstellen...
```

#### Schritt 2: Bulk-Upload auf Server

```bash
# Auf Hetzner Server
cd /opt/mcp-connection-key

# Script ausführen
chmod +x integration/scripts/bulk-upload-knowledge.sh
./integration/scripts/bulk-upload-knowledge.sh ~/knowledge-files
```

#### Schritt 3: Prüfen

```bash
# Prüfe geladene Dateien
curl http://localhost:4001/health | jq '.knowledge'

# Sollte zeigen: "knowledge": 100
```

---

## 🎯 Häufige Automatisierungen

### A) Tägliche Content-Erstellung

**n8n Workflow:**
- Trigger: Schedule (täglich 9:00)
- Action: Marketing Agent → Social-YouTube Agent → Supabase

### B) Automatische Reading-Generierung

**n8n Workflow:**
- Trigger: Webhook (von Next.js App)
- Action: Reading Agent → Supabase → E-Mail

### C) Multi-Agent-Pipeline

**n8n Workflow:**
- Marketing Agent → Social-YouTube Agent → Sales Agent → Automation Agent

---

## 📋 Nützliche Scripts

1. **bulk-upload-knowledge.sh** - Lädt 100+ Knowledge-Dateien hoch
2. **agent-pipeline.sh** - Führt mehrere Agenten nacheinander aus
3. **scheduled-content.sh** - Tägliche Content-Erstellung

---

## ✅ Zusammenfassung

**Agenten automatisieren:**
- ✅ n8n Workflows erstellen
- ✅ API-Integration nutzen
- ✅ Scheduled Tasks einrichten

**Reading Agent erweitern:**
- ✅ Knowledge-Dateien erstellen
- ✅ Bulk-Upload Script nutzen
- ✅ Knowledge neu laden

