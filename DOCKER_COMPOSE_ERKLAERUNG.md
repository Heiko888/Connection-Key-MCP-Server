# 📋 Docker Compose Dateien - Erklärung

**Es gibt 2 docker-compose Dateien:**

---

## 1. `docker-compose.yml` (ALT / ANDERE SERVICES)

**Enthält:**
- ✅ n8n (Workflow Engine)
- ✅ chatgpt-agent (KI-Agent)
- ✅ connection-key (Zentrale API)

**Enthält NICHT:**
- ❌ Frontend (Next.js)
- ❌ Redis
- ❌ Grafana
- ❌ Prometheus

**Status:** ⚠️ Wird für andere Services verwendet (nicht für Frontend)

---

## 2. `docker-compose-redis-fixed.yml` (AKTUELL / FRONTEND)

**Enthält:**
- ✅ **Frontend** (Next.js) - Port 3000
- ✅ nginx (Reverse Proxy)
- ✅ ck-agent
- ✅ Redis
- ✅ Grafana
- ✅ Prometheus
- ✅ Node Exporter
- ✅ Alertmanager

**Status:** ✅ **DIESE wird für das Frontend verwendet!**

---

## 🎯 Welche wird verwendet?

**Für Frontend:**
```bash
docker compose -f docker-compose-redis-fixed.yml up -d frontend
```

**Für andere Services (n8n, etc.):**
```bash
docker compose -f docker-compose.yml up -d
```

---

## 📋 Zusammenfassung

| Datei | Frontend? | Verwendung |
|-------|-----------|------------|
| `docker-compose.yml` | ❌ Nein | n8n, chatgpt-agent, connection-key |
| `docker-compose-redis-fixed.yml` | ✅ **Ja** | **Frontend, Redis, Monitoring** |

---

## ✅ Für System Auth Token

**Token wird in `docker-compose-redis-fixed.yml` hinzugefügt:**
- ✅ Bereits gemacht (Zeile 60)
- ✅ Liest aus `.env` Datei

**Du musst nur:**
1. Token in `.env` speichern
2. Container neu starten

---

**🎯 `docker-compose-redis-fixed.yml` ist die richtige Datei für das Frontend!**
