# 📤 Upload-Endpoint Status

**Frage:** Gibt es einen Upload-Endpoint für Dateien?

---

## ❌ Kein HTTP-Upload-Endpoint vorhanden

**Aktuell gibt es keinen HTTP-API-Endpoint zum Hochladen von Dateien.**

---

## ✅ Aktuelle Upload-Methoden

### 1. SCP/SSH (Für Dateien zum Server)

**Von Windows (PowerShell):**
```powershell
# n8n Workflows
scp n8n-workflows/*.json root@138.199.237.34:/opt/mcp-connection-key/n8n-workflows/

# API-Routes
scp integration/api-routes/*.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/agents/
```

**Von lokal:**
```bash
# SSH zum Server
ssh root@167.235.224.149

# Dateien kopieren
scp datei.txt root@167.235.224.149:/tmp/
```

---

### 2. n8n Workflow Import (Für n8n Workflows)

**Via Web-UI:**
1. n8n öffnen: `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Workflows** → **Import from File**
3. Datei auswählen
4. Import klicken

**Kein HTTP-Endpoint nötig** - Import über Web-Interface

---

### 3. Bash-Scripts (Für Knowledge-Dateien)

**Für Reading Agent Knowledge:**
```bash
# Auf Hetzner Server
./integration/scripts/bulk-upload-knowledge.sh /path/to/files
```

**Aber:** Kein HTTP-Endpoint, nur Bash-Script

---

## 🚀 Soll ein Upload-Endpoint erstellt werden?

### Option 1: HTTP-Upload-Endpoint für n8n Workflows

**Endpoint:** `POST /api/admin/upload-workflow`

**Funktion:**
- Empfängt JSON-Datei
- Speichert auf Server
- Optional: Importiert direkt in n8n

---

### Option 2: HTTP-Upload-Endpoint für Knowledge-Dateien

**Endpoint:** `POST /api/admin/upload-knowledge`

**Funktion:**
- Empfängt .txt oder .md Dateien
- Speichert in `production/knowledge/`
- Optional: Lädt Knowledge neu

---

### Option 3: Generischer File-Upload-Endpoint

**Endpoint:** `POST /api/admin/upload`

**Funktion:**
- Empfängt beliebige Dateien
- Speichert in konfiguriertem Verzeichnis
- Gibt URL zurück

---

## 📋 Aktuelle Upload-Punkte

### Für n8n Workflows:
- ✅ **n8n Web-UI:** `https://n8n.werdemeisterdeinergedankenagent.de` → Import from File
- ✅ **SCP:** `scp workflow.json root@138.199.237.34:/tmp/`
- ❌ **HTTP-Endpoint:** Nicht vorhanden

### Für Knowledge-Dateien:
- ✅ **Bash-Script:** `bulk-upload-knowledge.sh`
- ✅ **SCP:** `scp knowledge.txt root@138.199.237.34:/opt/mcp-connection-key/production/knowledge/`
- ❌ **HTTP-Endpoint:** Nicht vorhanden

### Für API-Routes/Frontend:
- ✅ **SCP:** `scp route.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/`
- ❌ **HTTP-Endpoint:** Nicht vorhanden

---

## 💡 Empfehlung

**Für n8n Workflows:**
- ✅ **Bereits vorhanden:** n8n Web-UI Import
- ⚠️ **Optional:** HTTP-Endpoint für Automatisierung

**Für Knowledge-Dateien:**
- ✅ **Bereits vorhanden:** Bash-Script
- ⚠️ **Optional:** HTTP-Endpoint für einfacheren Upload

**Für API-Routes:**
- ✅ **Bereits vorhanden:** SCP/SSH
- ⚠️ **Optional:** HTTP-Endpoint für CI/CD

---

## 🚀 Upload-Endpoint erstellen?

**Falls gewünscht, kann ich erstellen:**

1. **n8n Workflow Upload-Endpoint**
   - `POST /api/admin/upload-workflow`
   - Empfängt JSON, speichert, optional Import

2. **Knowledge Upload-Endpoint**
   - `POST /api/admin/upload-knowledge`
   - Empfängt .txt/.md, speichert, optional Reload

3. **Generischer Upload-Endpoint**
   - `POST /api/admin/upload`
   - Empfängt beliebige Dateien

---

**Status:** ❌ Kein HTTP-Upload-Endpoint vorhanden - SCP/SSH und n8n Web-UI werden verwendet

