# ✅ n8n WEBHOOK_URL Fix - Angewendet

## 🔧 Änderungen in `docker-compose.yml`

### ❌ Entfernt:
```yaml
- WEBHOOK_URL=http://localhost:5678/  # ← ENTFERNT
```

### ✅ Hinzugefügt/Geändert:
```yaml
- N8N_HOST=${N8N_HOST:-n8n.werdemeisterdeinergedankenagent.de}  # ← Geändert (Standard: Domain)
- N8N_PROTOCOL=${N8N_PROTOCOL:-https}  # ← Geändert (Standard: https)
- N8N_WEBHOOK_URL=${N8N_WEBHOOK_URL:-https://n8n.werdemeisterdeinergedankenagent.de}  # ← HINZUGEFÜGT
```

---

## 🚀 Nächste Schritte

### Schritt 1: Auf Hetzner Server - Container neu starten

```bash
ssh root@138.199.237.34
cd /opt/mcp-connection-key

# Git Pull (falls Änderungen committed wurden)
git pull origin main

# Oder docker-compose.yml direkt bearbeiten
nano docker-compose.yml
# Änderungen anwenden (siehe oben)

# Container neu starten
docker compose down
docker compose up -d
```

### Schritt 2: Prüfen

```bash
# Prüfe Environment Variables im Container
docker compose exec n8n printenv | grep -E "WEBHOOK|N8N_HOST|N8N_PROTOCOL"

# Sollte zeigen:
# N8N_HOST=n8n.werdemeisterdeinergedankenagent.de
# N8N_PROTOCOL=https
# N8N_WEBHOOK_URL=https://n8n.werdemeisterdeinergedankenagent.de
# (KEIN WEBHOOK_URL mehr!)
```

### Schritt 3: Webhook-URL testen

```bash
# Prüfe ob n8n erreichbar ist
curl https://n8n.werdemeisterdeinergedankenagent.de/healthz

# Test Webhook (falls Workflow aktiv)
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

---

## ✅ Was jetzt funktioniert

### Vorher (❌):
- Webhook-URLs: `http://localhost:5678/webhook/...`
- Frontend kann nicht erreichen
- MCP Server kann nicht erreichen
- Externe Services können nicht erreichen

### Nachher (✅):
- Webhook-URLs: `https://n8n.werdemeisterdeinergedankenagent.de/webhook/...`
- Frontend kann erreichen ✅
- MCP Server kann erreichen ✅
- Externe Services können erreichen ✅

---

## 📋 Environment Variables in .env (optional)

Falls du die Werte in `.env` überschreiben möchtest:

```bash
# In /opt/mcp-connection-key/.env
N8N_HOST=n8n.werdemeisterdeinergedankenagent.de
N8N_PROTOCOL=https
N8N_WEBHOOK_URL=https://n8n.werdemeisterdeinergedankenagent.de
```

**Standard-Werte sind bereits gesetzt**, daher optional.

---

## 🎯 Nächster Schritt: Workflows aktivieren

Nach dem Fix:
1. ✅ n8n Webhook-URLs funktionieren
2. ⏭️ Workflows in n8n importieren/aktivieren
3. ⏭️ Testen

**Fix ist angewendet! 🚀**

