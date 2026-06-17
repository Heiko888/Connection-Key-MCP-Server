# 🔍 Server 138 - n8n Workflow Datei prüfen

**Frage:** Existiert die Workflow-Datei auf Server 138?

---

## 📋 PRÜFUNGS-BEFEHLE (auf Server 138 ausführen)

### Schritt 1: Prüfe ob Datei existiert

```bash
# Prüfe ob Datei existiert
ls -la n8n-workflows/reading-generation-workflow.json

# ODER
test -f n8n-workflows/reading-generation-workflow.json && echo "Datei existiert" || echo "Datei existiert NICHT"
```

---

### Schritt 2: Prüfe Verzeichnis

```bash
# Prüfe n8n-workflows Verzeichnis
ls -la n8n-workflows/

# Prüfe alle JSON-Dateien
ls -la n8n-workflows/*.json
```

---

### Schritt 3: Prüfe Datei-Inhalt (falls vorhanden)

```bash
# Prüfe ob Datei gültiges JSON ist
cat n8n-workflows/reading-generation-workflow.json | jq .name

# Prüfe Webhook-Pfad
cat n8n-workflows/reading-generation-workflow.json | jq '.nodes[] | select(.type == "n8n-nodes-base.webhook") | .parameters.path'
```

---

## ⚠️ FALLS DATEI NICHT EXISTIERT

**Option A: Datei vom lokalen Rechner kopieren**

```bash
# Vom lokalen Rechner (Windows PowerShell):
scp n8n-workflows/reading-generation-workflow.json root@138.199.237.34:/opt/mcp-connection-key/n8n-workflows/
```

**Option B: Datei direkt in n8n UI erstellen**

1. Öffne n8n UI
2. Erstelle neuen Workflow
3. Kopiere Inhalt aus lokaler Datei
4. Importiere manuell

---

## ✅ FALLS DATEI EXISTIERT

**Dann kannst du:**
1. Datei direkt in n8n UI importieren (wie beschrieben)
2. ODER via n8n API importieren

---

**Status:** ⏳ **Prüfe ob Datei existiert**
