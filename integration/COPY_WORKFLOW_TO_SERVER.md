# 📤 Workflow auf Server kopieren

## 🚀 Option 1: Via SCP (Von Windows zu Hetzner)

```powershell
# In PowerShell auf Windows
scp integration/n8n-workflows/chart-calculation-workflow.json root@138.199.237.34:/tmp/chart-calculation-workflow.json
```

Dann auf dem Server:
```bash
# Auf Hetzner Server
cd /opt/mcp-connection-key
mkdir -p integration/n8n-workflows
cp /tmp/chart-calculation-workflow.json integration/n8n-workflows/
```

---

## 🚀 Option 2: Direkt in n8n hochladen (Einfachste Methode)

### Schritt 1: Öffnen Sie n8n

```
https://werdemeisterdeinergedankenagent.de
```

### Schritt 2: Workflow importieren

1. Klicken Sie auf **"Workflows"** (links)
2. Klicken Sie auf **"Import from File"** (oben rechts)
3. Wählen Sie die Datei: `integration/n8n-workflows/chart-calculation-workflow.json`
4. Klicken Sie auf **"Import"**

**Fertig!** Der Workflow ist jetzt in n8n.

---

## 🚀 Option 3: Workflow-Inhalt kopieren

Falls der Datei-Upload nicht funktioniert:

1. Öffnen Sie `integration/n8n-workflows/chart-calculation-workflow.json` in einem Text-Editor
2. Kopieren Sie den gesamten Inhalt (Strg+A, Strg+C)
3. In n8n: **"Workflows"** → **"Import from URL or File"** → **"Paste JSON"**
4. Fügen Sie den Inhalt ein (Strg+V)
5. Klicken Sie auf **"Import"**

---

## 🚀 Option 4: Via Git (Falls Repository auf Server)

```bash
# Auf Hetzner Server
cd /opt/mcp-connection-key
git pull
# Workflow ist jetzt in integration/n8n-workflows/
```

---

## ✅ Nach dem Import

1. **Workflow öffnen** - Klicken Sie auf den importierten Workflow
2. **Aktivieren** - Klicken Sie auf **"Active"** Toggle (oben rechts)
3. **Testen** - Testen Sie den Webhook

---

## 🧪 Test

```bash
curl -X POST http://138.199.237.34:5678/webhook/chart-calculation \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin, Germany"}'
```

