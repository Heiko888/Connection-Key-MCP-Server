# 🔄 Next.js App in Docker neu starten

## ✅ Gefunden
- Container: `the-connection-key-frontend-1`
- Port: 3000
- Status: Up (healthy)
- docker-compose.yml: `/opt/hd-app/The-Connection-Key/docker-compose.yml`

## 🚀 App neu starten

### Option 1: Docker Compose (empfohlen)

```bash
cd /opt/hd-app/The-Connection-Key
docker-compose restart frontend
```

### Option 2: Docker direkt

```bash
docker restart the-connection-key-frontend-1
```

### Option 3: Komplett neu starten (falls Environment Variables nicht geladen werden)

```bash
cd /opt/hd-app/The-Connection-Key
docker-compose down frontend
docker-compose up -d frontend
```

## 📋 Prüfe Environment Variables in Container

```bash
# Prüfe ob Environment Variables im Container vorhanden sind
docker exec the-connection-key-frontend-1 env | grep -E "(MCP_SERVER_URL|READING_AGENT_URL)"
```

## 🔄 Vollständiger Neustart (mit Environment Variables)

```bash
cd /opt/hd-app/The-Connection-Key

# Stoppe Frontend
docker-compose stop frontend

# Starte Frontend neu (lädt .env.local neu)
docker-compose up -d frontend

# Prüfe Logs
docker-compose logs -f frontend
```

## ✅ Test nach Neustart

```bash
# Warte 5 Sekunden
sleep 5

# Teste API-Route
curl -X POST http://localhost:3000/api/agents/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Erstelle eine Bodygraph-Komponente"}' | python3 -m json.tool
```

