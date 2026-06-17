# 🔍 Frontend-Vergleich: Port 3000 vs Port 3005

**Datum:** 17.12.2025

**Frage:** Was ist der Unterschied zwischen Port 3000 und Port 3005?

---

## 📊 Zwei verschiedene Services!

### Port 3000: `connection-key` Docker Container

**Was ist das?**
- Ein **Node.js API Server** (NICHT Next.js!)
- Läuft als Docker-Container
- Ist Teil des `docker-compose.yml` Services
- Wird als "Zentrale API" beschrieben

**Konfiguration:**
```yaml
# docker-compose.yml
connection-key:
  build:
    context: .
    dockerfile: Dockerfile.connection-key
  ports:
    - "3000:3000"
  environment:
    - NODE_ENV=production
    - PORT=3000
    - CHATGPT_AGENT_URL=http://chatgpt-agent:4000
    - N8N_BASE_URL=http://n8n:5678
```

**Zweck:**
- Zentrale API für ältere/andere Services
- Verbindet `chatgpt-agent` und `n8n`
- **NICHT das Next.js Frontend!**

---

### Port 3005: Next.js Frontend

**Was ist das?**
- Das **eigentliche Next.js Frontend**
- Läuft direkt (nicht in Docker)
- React/Next.js Anwendung
- Hat API Routes (`/api/agents/*`, `/api/reading/generate`)

**Konfiguration:**
```json
// package.json
"scripts": {
  "dev": "next dev -p 3005"
}
```

**Zweck:**
- Frontend für User-Interface
- API Routes für Agent-Integration
- Reading-Generierung
- **Das ist das richtige Frontend!**

---

## 🔍 Unterschiede im Detail

| Eigenschaft | Port 3000 (connection-key) | Port 3005 (Next.js) |
|-------------|---------------------------|---------------------|
| **Typ** | Node.js API Server | Next.js Frontend |
| **Container** | ✅ Docker | ❌ Direkt |
| **Framework** | Express/Node.js | Next.js/React |
| **Zweck** | Zentrale API | Frontend + API Routes |
| **Agent-Integration** | ❌ (alte Architektur?) | ✅ (neue Architektur) |
| **Reading-Generierung** | ❌ | ✅ |
| **Verzeichnis** | `/opt/mcp-connection-key` | `/opt/hd-app/The-Connection-Key/frontend` |

---

## 🎯 Welches ist das richtige Frontend?

**Port 3005 (Next.js) ist das richtige Frontend!**

**Warum?**
- ✅ Hat die API Routes für Agent-Integration (`/api/agents/*`)
- ✅ Hat Reading-Generierung (`/api/reading/generate`)
- ✅ Ist das moderne Next.js Frontend
- ✅ Verbindet mit MCP Server und Reading Agent

**Port 3000 (connection-key) ist:**
- ⚠️ Ein älterer Service
- ⚠️ Läuft parallel (kein Konflikt)
- ⚠️ Wird möglicherweise nicht mehr benötigt?

---

## ❓ Was ist mit Port 3000?

**Port 3000 läuft:**
- `connection-key` Docker Container
- Ein Node.js API Server
- Möglicherweise für ältere/andere Services

**Frage:** Wird Port 3000 noch benötigt?

**Prüfen:**
```bash
# Was läuft auf Port 3000?
docker ps | grep connection-key

# Container-Logs prüfen
docker logs connection-key --tail 50

# Container stoppen (falls nicht benötigt)
docker stop connection-key
```

---

## ✅ Empfehlung

**Für die MCP-Connection-Key Integration:**
- ✅ **Port 3005 (Next.js)** ist das richtige Frontend
- ✅ Verwende Port 3005 für alle Tests
- ⚠️ Port 3000 kann möglicherweise gestoppt werden (falls nicht benötigt)

**Nächste Schritte:**
1. ✅ API Routes auf Port 3005 testen
2. ⚠️ Prüfen ob Port 3000 noch benötigt wird
3. ⚠️ Falls nicht → Container stoppen

---

## 🎯 Zusammenfassung

**Port 3000:** Älterer Node.js API Server (Docker) - möglicherweise nicht mehr benötigt  
**Port 3005:** Modernes Next.js Frontend - **Das ist das richtige Frontend!**

**Es gibt keinen Konflikt - beide können parallel laufen!**

---

**🔍 Port 3005 ist das richtige Frontend für die MCP-Integration!** 🚀
