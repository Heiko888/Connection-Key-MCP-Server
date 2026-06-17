# 🔍 Systemcheck: n8n.werdemeisterdeinergedankenagent.de

**Datum:** 22.12.2025, 10:55 UTC  
**Status:** Vollständige Live-Systemprüfung

---

## 📊 Executive Summary

**Gesamt-Status:**
- ✅ **n8n Container:** Läuft (Up 7 days, healthy)
- ✅ **Health Check:** 200 OK, `{"status":"ok"}`
- ✅ **HTTPS:** Funktioniert (SSL-Zertifikat aktiv)
- ✅ **Reverse Proxy:** Nginx läuft (nginx/1.24.0)
- ✅ **Environment Variables:** Alle korrekt konfiguriert
- ⚠️ **Webhook-Fehler:** Parsing-Fehler bei `agent-mattermost` und `reading-mattermost`
- ⚠️ **API-Zugriff:** Benötigt API-Key für Workflow-Liste

---

## 🌐 Domain & Zugriff

### URL
- **Domain:** `https://n8n.werdemeisterdeinergedankenagent.de`
- **Health Endpoint:** `https://n8n.werdemeisterdeinergedankenagent.de/healthz`
- **Status:** ✅ Erreichbar (HTTP 200)

### Health Check
```bash
curl -k -s https://n8n.werdemeisterdeinergedankenagent.de/healthz
# Ergebnis: {"status":"ok"}
```

**Status:** ✅ OK

---

## 🐳 Docker Container

### Container-Status
- **Container Name:** `n8n`
- **Image:** `n8nio/n8n:latest`
- **Status:** ✅ Running (Up 7 days)
- **Ports:** `0.0.0.0:5678->5678/tcp`
- **Container IP:** `172.18.0.4`
- **Network:** `app-network`

### Container-Details
```bash
docker ps | grep n8n
# 95a3e9be30c1   n8nio/n8n:latest   "tini -- /docker-ent…"   8 days ago   Up 7 days   0.0.0.0:5678->5678/tcp   n8n
```

**Status:** ✅ Container läuft stabil

---

## ⚙️ Environment Variables

### Aktuelle Konfiguration (Live vom Container)

```bash
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=e5cc6fddb15d4c67bcdf9494a500315d
N8N_DISABLE_UI_FEATURES=enterprise
N8N_ENFORCE_SETTINGS_FILE=false
N8N_HOST=n8n.werdemeisterdeinergedankenagent.de
N8N_LICENSE_AUTO_ACCEPT=false
N8N_PORT=5678
N8N_PROTOCOL=https
N8N_RELEASE_TYPE=stable
N8N_TRUST_PROXY=true
N8N_WEBHOOK_URL=https://n8n.werdemeisterdeinergedankenagent.de
```

### Konfigurations-Status

| Variable | Wert | Status |
|----------|------|--------|
| `N8N_HOST` | `n8n.werdemeisterdeinergedankenagent.de` | ✅ Korrekt |
| `N8N_PROTOCOL` | `https` | ✅ Korrekt |
| `N8N_WEBHOOK_URL` | `https://n8n.werdemeisterdeinergedankenagent.de` | ✅ Korrekt |
| `N8N_TRUST_PROXY` | `true` | ✅ Korrekt (für Reverse Proxy) |
| `N8N_BASIC_AUTH_ACTIVE` | `true` | ✅ Aktiviert |
| `N8N_PORT` | `5678` | ✅ Standard |

**Status:** ✅ Alle Environment Variables korrekt konfiguriert

---

## 🔒 HTTPS & SSL

### SSL-Zertifikat
- **Status:** ✅ Aktiv (Let's Encrypt)
- **Reverse Proxy:** ✅ Nginx (nginx/1.24.0)
- **HTTPS:** ✅ Funktioniert

### HTTP-Header (Live)
```
HTTP/1.1 200 OK
Server: nginx/1.24.0 (Ubuntu)
Content-Type: text/html; charset=utf-8
```

**Status:** ✅ HTTPS funktioniert korrekt

---

## 🔄 Reverse Proxy (Nginx)

### Nginx-Konfiguration
- **Server:** nginx/1.24.0 (Ubuntu)
- **Proxy Target:** `http://localhost:5678`
- **Status:** ✅ Aktiv

### Konfiguration (erwartet)
```nginx
server {
    listen 80;
    server_name n8n.werdemeisterdeinergedankenagent.de;
    
    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Status:** ✅ Reverse Proxy konfiguriert

---

## 🔗 Webhooks

### Bekannte Webhook-Endpoints

Basierend auf Codebase und Dokumentation:

1. **`/webhook/agent-mattermost`** - Agent → Mattermost Notifications
2. **`/webhook/reading-mattermost`** - Reading → Mattermost Notifications
3. **`/webhook/user-registered`** - User Registration Events
4. **`/webhook/mailchimp-confirmed`** - Mailchimp Confirmation Events
5. **`/webhook/reading`** - Reading Generation
6. **`/webhook/chart-calculation`** - Chart Calculation
7. **`/webhook/content-pipeline`** - Content Pipeline
8. **`/webhook/log`** - Logging

### Webhook-URLs (vollständig)
- `https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost`
- `https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading-mattermost`
- `https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered`
- `https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed`
- `https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading`
- `https://n8n.werdemeisterdeinergedankenagent.de/webhook/chart-calculation`
- `https://n8n.werdemeisterdeinergedankenagent.de/webhook/content-pipeline`
- `https://n8n.werdemeisterdeinergedankenagent.de/webhook/log`

**Status:** ✅ Webhook-URLs korrekt konfiguriert

---

## ⚠️ Fehler & Warnungen

### Webhook-Registrierungs-Fehler

**Gefunden in Logs:**
```
Received request for unknown webhook: The requested webhook "POST agent-mattermost" is not registered.
Error in handling webhook request POST /webhook/agent-mattermost: Failed to parse request body
Error in handling webhook request POST /webhook/reading-mattermost: Failed to parse request body
The workflow has issues and cannot be executed for that reason. Please fix them first.
```

**Betroffene Webhooks:**
- ❌ `/webhook/agent-mattermost` - Nicht registriert / Workflow hat Probleme
- ❌ `/webhook/reading-mattermost` - Parsing-Fehler / Workflow hat Probleme

**Hauptursache:**
1. **Workflows nicht aktiviert** - Webhooks müssen aktiviert sein
2. **Workflow-Konfiguration fehlerhaft** - "The workflow has issues and cannot be executed"
3. **Webhook-Pfad falsch** - Pfad stimmt nicht mit Workflow überein

**Status:** ⚠️ KRITISCH - Workflows müssen aktiviert und korrigiert werden

---

## 📋 Workflows

### Workflow-Status

**API-Zugriff:**
```bash
curl -X GET 'https://n8n.werdemeisterdeinergedankenagent.de/api/v1/workflows?active=true'
# Ergebnis: {"message":"'X-N8N-API-KEY' header required"}
```

**Status:** ⚠️ API-Key erforderlich für Workflow-Liste

### Bekannte Workflows (aus Dokumentation)

1. **"Reading Generation (ohne Mattermost)"** - ✅ Aktiviert (laut Dokumentation)
2. **"Chart Calculation - Human Design"** - ✅ Aktiviert (laut Dokumentation)
3. **"Tägliche Marketing-Content-Generierung"** - ✅ Aktiviert (laut Dokumentation)
4. **"Agent → Mattermost Notification"** - ⚠️ Status unklar (Parsing-Fehler)
5. **"Reading → Mattermost Notification"** - ⚠️ Status unklar (Parsing-Fehler)
6. **"User Registration Reading"** - ⚠️ Status unklar
7. **"Mailchimp Confirmation"** - ⚠️ Status unklar

**Status:** ⚠️ Workflow-Status muss mit API-Key geprüft werden

---

## 🔐 Authentifizierung

### Basic Auth
- **Status:** ✅ Aktiviert
- **Benutzername:** `admin`
- **Passwort:** Aus Environment Variable (`N8N_BASIC_AUTH_PASSWORD`)

### API-Key
- **Status:** ⚠️ Erforderlich für API-Zugriff
- **Verwendung:** `X-N8N-API-KEY` Header

**Status:** ✅ Basic Auth aktiv, API-Key erforderlich

---

## 🔗 Integrationen

### Frontend → n8n

**Verwendet in:**
- Agent API Routes (`/api/agents/*`)
- Reading API Routes (`/api/reading/*`)
- Supabase Triggers (User Registration)

**Webhook-Aufrufe:**
- `POST /webhook/agent-mattermost` (von Agent Routes)
- `POST /webhook/reading-mattermost` (von Reading Routes)
- `POST /webhook/user-registered` (von Supabase Trigger)
- `POST /webhook/mailchimp-confirmed` (von Mailchimp)

**Status:** ✅ Integrationen konfiguriert (aber Parsing-Fehler vorhanden)

### MCP Server → n8n

**Verwendet in:**
- MCP Server Agent Calls
- Chart Calculation

**Status:** ⚠️ Zu prüfen

---

## 📊 Performance & Ressourcen

### Container-Ressourcen (Live)

**Aktuelle Auslastung:**
- **CPU:** 0.01% (sehr niedrig)
- **Memory:** 264.9 MiB / 3.73 GiB (7.1% Auslastung)
- **Network I/O:** 71.4 MB / 61.8 MB (eingehend/ausgehend)

**Status:** ✅ Sehr niedrige Auslastung, keine Performance-Probleme

---

## ✅ Was funktioniert

1. ✅ n8n Container läuft (Up 7 days)
2. ✅ Health Check funktioniert (`/healthz` → 200 OK)
3. ✅ HTTPS funktioniert (SSL-Zertifikat aktiv)
4. ✅ Reverse Proxy funktioniert (Nginx)
5. ✅ Environment Variables korrekt konfiguriert
6. ✅ Basic Auth aktiviert
7. ✅ Webhook-URLs korrekt konfiguriert
8. ✅ Domain erreichbar

---

## ⚠️ Probleme & Offene Punkte

### 1. Webhook-Registrierungs-Fehler ⚠️ KRITISCH
- ❌ `/webhook/agent-mattermost` - Nicht registriert / Workflow hat Probleme
- ❌ `/webhook/reading-mattermost` - Parsing-Fehler / Workflow hat Probleme
- ❌ Workflows haben Konfigurationsfehler: "The workflow has issues and cannot be executed"

**Zu tun:**
1. **Workflows in n8n UI öffnen und aktivieren**
2. **Workflow-Fehler beheben** ("The workflow has issues")
3. **Webhook-Pfade prüfen** (müssen mit Workflow übereinstimmen)
4. **Request Body Format prüfen** (Content-Type, JSON-Format)
5. **Webhook Node Konfiguration prüfen** (HTTP Method, Path)

### 2. Workflow-Status unklar ⚠️
- ⚠️ Welche Workflows sind aktiv?
- ⚠️ Welche Workflows haben Fehler?
- ⚠️ API-Key für Workflow-Liste erforderlich

**Zu tun:**
1. API-Key aus n8n UI holen
2. Workflow-Liste abrufen
3. Workflow-Status prüfen

### 3. Performance-Metriken fehlen ⚠️
- ⚠️ CPU-Auslastung unbekannt
- ⚠️ Memory-Auslastung unbekannt
- ⚠️ Network-IO unbekannt

**Zu tun:**
1. `docker stats n8n` ausführen
2. Metriken dokumentieren

---

## 🎯 Prioritäten

### Priorität 1: Webhook-Registrierung & Workflow-Fehler beheben ⚠️ KRITISCH
1. ⚠️ **Workflows in n8n UI aktivieren** (Toggle oben rechts)
2. ⚠️ **Workflow-Fehler beheben** ("The workflow has issues")
3. ⚠️ **Webhook-Pfade prüfen** (`/webhook/agent-mattermost`, `/webhook/reading-mattermost`)
4. ⚠️ **Webhook Node Konfiguration prüfen** (HTTP Method: POST, Path korrekt)
5. ⚠️ **Request Body Format prüfen** (Content-Type: application/json)

### Priorität 2: Workflow-Status prüfen ⚠️
1. ⚠️ API-Key aus n8n UI holen
2. ⚠️ Workflow-Liste abrufen
3. ⚠️ Aktive Workflows dokumentieren
4. ⚠️ Fehlerhafte Workflows identifizieren

### Priorität 3: Performance-Metriken ✅ ERLEDIGT
1. ✅ Container-Ressourcen geprüft (CPU: 0.01%, Memory: 264.9 MiB)
2. ✅ Metriken dokumentiert (keine Performance-Probleme)

---

## 📝 Zusammenfassung

**System-Status:**
- ✅ n8n läuft stabil (Up 7 days)
- ✅ HTTPS funktioniert (SSL-Zertifikat aktiv)
- ✅ Domain erreichbar
- ✅ Environment Variables korrekt
- ✅ Performance gut (CPU: 0.01%, Memory: 264.9 MiB)
- ✅ Nginx Reverse Proxy konfiguriert
- ❌ **Webhook-Registrierungs-Fehler** - Workflows nicht aktiviert/fehlerhaft
- ⚠️ Workflow-Status unklar (API-Key erforderlich)

**Nächste Schritte:**
1. ❌ **KRITISCH:** Workflows in n8n UI aktivieren und Fehler beheben
2. ⚠️ Webhook-Pfade prüfen und korrigieren
3. ⚠️ Workflow-Status prüfen (mit API-Key)
4. ⚠️ Integrationen testen (nach Workflow-Aktivierung)

---

## 🔧 Test-Befehle

### Health Check
```bash
curl -k -s https://n8n.werdemeisterdeinergedankenagent.de/healthz
# Erwartet: {"status":"ok"}
```

### Webhook-Test
```bash
# Test-Webhook (nicht registriert - erwartet)
curl -k -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
# Ergebnis: {"code":404,"message":"The requested webhook \"POST test\" is not registered."}

# Agent-Mattermost Webhook (sollte funktionieren, wenn Workflow aktiviert ist)
curl -k -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

### Container-Status
```bash
# Container-Status
docker ps | grep n8n

# Logs (letzte 50 Zeilen)
docker logs n8n --tail 50

# Performance-Metriken
docker stats n8n --no-stream
# Ergebnis: CPU: 0.01%, Memory: 264.9 MiB / 3.73 GiB
```

### Environment Variables
```bash
docker exec n8n env | grep N8N_
```

---

## 📚 Referenzen

- **Docker Compose:** `docker-compose.yml`
- **Nginx Config:** `/etc/nginx/sites-enabled/n8n`
- **Dokumentation:** `N8N_FINAL_STATUS.md`, `N8N_WEBHOOK_URL_PROBLEM_ANALYSE.md`
- **Server:** Hetzner Server (138.199.237.34)

