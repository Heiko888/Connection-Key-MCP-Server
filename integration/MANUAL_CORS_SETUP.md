# 🔧 Manuelles CORS-Setup auf Hetzner Server

Falls die `integration/` Dateien noch nicht auf dem Server sind, führen Sie diese Befehle **direkt auf dem Hetzner Server** aus:

## Schritt 1: CORS für Connection-Key Server

```bash
cd /opt/mcp-connection-key

# Entferne alte CORS_ORIGINS Einträge
sed -i '/^CORS_ORIGINS=/d' .env

# Füge neue CORS Origins hinzu
echo "CORS_ORIGINS=https://www.the-connection-key.de,https://the-connection-key.de,http://localhost:3000" >> .env

echo "✅ CORS_ORIGINS gesetzt"
```

## Schritt 2: Firewall öffnen

```bash
# Prüfe ob Ports offen sind
ufw status | grep -E "(4001|7000)"

# Falls nicht, öffne sie
ufw allow 4001/tcp
ufw allow 7000/tcp

echo "✅ Firewall-Regeln gesetzt"
```

## Schritt 3: Services neu starten

```bash
cd /opt/mcp-connection-key

# Connection-Key Server
docker-compose restart connection-key

# MCP Server
systemctl restart mcp

# Reading Agent
pm2 restart reading-agent

echo "✅ Services neu gestartet"
```

## Schritt 4: Health Checks

```bash
# Warte kurz
sleep 3

# Prüfe alle Services
echo "Connection-Key Server:"
curl -s http://localhost:3000/health | head -1

echo "MCP Server:"
curl -s http://localhost:7000/health | head -1

echo "Reading Agent:"
curl -s http://localhost:4001/health | head -1
```

## ✅ Fertig!

Alle Befehle als einzeiliger Befehl:

```bash
cd /opt/mcp-connection-key && sed -i '/^CORS_ORIGINS=/d' .env && echo "CORS_ORIGINS=https://www.the-connection-key.de,https://the-connection-key.de,http://localhost:3000" >> .env && ufw allow 4001/tcp 2>/dev/null || true && ufw allow 7000/tcp 2>/dev/null || true && docker-compose restart connection-key && systemctl restart mcp && pm2 restart reading-agent && sleep 3 && echo "✅ CORS konfiguriert und Services neu gestartet"
```

