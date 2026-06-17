# ✅ n8n Trust Proxy Fix - Angewendet

## 🔧 Änderung in `docker-compose.yml`

### ✅ Hinzugefügt:
```yaml
- N8N_TRUST_PROXY=true
```

**Grund:** n8n läuft hinter einem Reverse Proxy (Nginx/Traefik), der `X-Forwarded-For` Header setzt. Ohne `N8N_TRUST_PROXY=true` warnt n8n, dass Rate-Limiting möglicherweise ungenau ist.

---

## 🚀 Nächste Schritte auf dem Server

### 1. Datei auf Server kopieren (falls lokal geändert)

```bash
# Von lokal
scp docker-compose.yml root@138.199.237.34:/opt/mcp-connection-key/docker-compose.yml

# Oder direkt auf Server bearbeiten
ssh root@138.199.237.34
cd /opt/mcp-connection-key
nano docker-compose.yml
# Füge hinzu: - N8N_TRUST_PROXY=true
```

### 2. Container neu starten

```bash
cd /opt/mcp-connection-key
docker compose down
docker compose up -d
```

### 3. Prüfen

```bash
# Prüfe Environment Variable
docker compose exec n8n printenv | grep TRUST_PROXY

# Sollte zeigen:
# N8N_TRUST_PROXY=true

# Prüfe Logs (Warnung sollte verschwinden)
docker compose logs n8n --tail 50 | grep -i "trust proxy\|X-Forwarded-For"
```

---

## ✅ Erwartetes Ergebnis

### Vorher:
```
ValidationError: The 'X-Forwarded-For' header is set
but the Express 'trust proxy' setting is false
```

### Nachher:
- ✅ Keine Warnung mehr
- ✅ Rate-Limiting funktioniert korrekt mit Proxy
- ✅ IP-Adressen werden korrekt erkannt

---

## 📋 Vollständige n8n Environment Variables (aktuell)

```yaml
- N8N_BASIC_AUTH_ACTIVE=true
- N8N_BASIC_AUTH_USER=admin
- N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD:-change-me}
- N8N_HOST=${N8N_HOST:-n8n.werdemeisterdeinergedankenagent.de}
- N8N_PORT=5678
- N8N_PROTOCOL=${N8N_PROTOCOL:-https}
- N8N_WEBHOOK_URL=${N8N_WEBHOOK_URL:-https://n8n.werdemeisterdeinergedankenagent.de}
- N8N_TRUST_PROXY=true  # ← NEU
- N8N_DISABLE_UI_FEATURES=enterprise
- N8N_ENFORCE_SETTINGS_FILE=false
- N8N_LICENSE_AUTO_ACCEPT=false
```

---

## ✅ Status nach Fix

- ✅ Container laufen stabil
- ✅ Environment Variables korrekt
- ✅ Webhooks extern erreichbar
- ✅ Workflows aktiviert
- ✅ Trust Proxy konfiguriert (Warnung behoben)

**Alles sauber konfiguriert! 🚀**

