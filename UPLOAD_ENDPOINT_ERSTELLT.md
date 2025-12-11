# ✅ Upload-Endpoints erstellt

**Status:** 3 Upload-Endpoints erstellt

---

## 📋 Erstellte Endpoints

### 1. Generischer Upload-Endpoint
**Route:** `POST /api/admin/upload`

**Funktionen:**
- Empfängt beliebige Dateien
- Unterstützt verschiedene Upload-Typen:
  - `workflow` - n8n Workflows
  - `knowledge` - Knowledge-Dateien
  - `file` - Beliebige Dateien
- Optional: API-Key Authentifizierung
- Automatische Verzeichnis-Erstellung

**Verwendung:**
```bash
curl -X POST https://www.the-connection-key.de/api/admin/upload \
  -H "x-api-key: YOUR_API_KEY" \
  -F "file=@workflow.json" \
  -F "type=workflow" \
  -F "subfolder=my-workflows"
```

---

### 2. n8n Workflow Upload-Endpoint
**Route:** `POST /api/admin/upload-workflow`

**Funktionen:**
- Spezialisiert für n8n Workflow JSON-Dateien
- Validiert JSON-Format
- Speichert in `n8n-workflows/`
- Optional: Workflow-Name angeben

**Verwendung:**
```bash
curl -X POST https://www.the-connection-key.de/api/admin/upload-workflow \
  -H "x-api-key: YOUR_API_KEY" \
  -F "file=@my-workflow.json" \
  -F "name=my-workflow"
```

---

### 3. Knowledge Upload-Endpoint
**Route:** `POST /api/admin/upload-knowledge`

**Funktionen:**
- Spezialisiert für Knowledge-Dateien (.txt, .md)
- Speichert in `production/knowledge/`
- Optional: Subfolder angeben
- Optional: Knowledge automatisch neu laden

**Verwendung:**
```bash
curl -X POST https://www.the-connection-key.de/api/admin/upload-knowledge \
  -H "x-api-key: YOUR_API_KEY" \
  -F "file=@knowledge.txt" \
  -F "subfolder=brandbook" \
  -F "reload=true"
```

---

## 🚀 Deployment

### Schritt 1: API-Routes zum Server kopieren

**Automatisch:**
```powershell
.\deploy-upload-endpoints.ps1
```

**Manuell:**
```bash
scp integration/api-routes/admin-upload/route.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/admin/upload/route.ts
scp integration/api-routes/admin-upload-workflow/route.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/admin/upload-workflow/route.ts
scp integration/api-routes/admin-upload-knowledge/route.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/admin/upload-knowledge/route.ts
```

---

### Schritt 2: Environment Variables setzen (optional)

**In `.env.local` auf CK-App Server:**
```bash
# Optional: API-Key für Upload-Endpoints
ADMIN_API_KEY=your-secret-api-key-here

# Optional: Custom Paths
N8N_WORKFLOWS_PATH=/opt/mcp-connection-key/n8n-workflows
KNOWLEDGE_PATH=/opt/mcp-connection-key/production/knowledge
READING_AGENT_URL=http://138.199.237.34:4001
AGENT_SECRET=your-agent-secret
```

---

### Schritt 3: Frontend neu starten

```bash
cd /opt/hd-app/The-Connection-Key/frontend
pm2 restart the-connection-key
```

---

## 🧪 Testen

### Test 1: Generischer Upload

```bash
curl -X POST https://www.the-connection-key.de/api/admin/upload \
  -H "x-api-key: YOUR_API_KEY" \
  -F "file=@test.txt" \
  -F "type=file"
```

### Test 2: n8n Workflow Upload

```bash
curl -X POST https://www.the-connection-key.de/api/admin/upload-workflow \
  -H "x-api-key: YOUR_API_KEY" \
  -F "file=@n8n-workflows/multi-agent-pipeline.json" \
  -F "name=multi-agent-pipeline"
```

### Test 3: Knowledge Upload

```bash
curl -X POST https://www.the-connection-key.de/api/admin/upload-knowledge \
  -H "x-api-key: YOUR_API_KEY" \
  -F "file=@knowledge.txt" \
  -F "subfolder=brandbook" \
  -F "reload=true"
```

---

## 🔒 Sicherheit

### API-Key Authentifizierung

**Falls `ADMIN_API_KEY` gesetzt ist:**
- Header: `x-api-key: YOUR_API_KEY`
- Oder: `Authorization: Bearer YOUR_API_KEY`

**Falls nicht gesetzt:**
- Endpoints sind öffentlich zugänglich
- ⚠️ **Nicht empfohlen für Production!**

---

## 📋 Verzeichnis-Struktur

**Nach Upload:**

```
/opt/mcp-connection-key/
├── n8n-workflows/          ← workflow Uploads
│   └── my-workflow.json
├── production/
│   └── knowledge/         ← knowledge Uploads
│       └── brandbook/
│           └── knowledge.txt
└── uploads/               ← generische Uploads
    └── test.txt
```

---

## ✅ Checkliste

- [ ] API-Routes zum Server kopiert
- [ ] Environment Variables gesetzt (optional)
- [ ] Frontend neu gestartet
- [ ] Upload-Endpoints getestet
- [ ] API-Key konfiguriert (für Production)

---

**Status:** ✅ Upload-Endpoints erstellt und bereit für Deployment!

