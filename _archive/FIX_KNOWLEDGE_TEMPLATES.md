# 🔧 Knowledge & Templates Pfade korrigieren

Der Reading Agent läuft, aber lädt keine Knowledge/Templates. Prüfen Sie die Pfade:

```bash
cd /opt/mcp-connection-key/production

# Prüfe ob Knowledge/Templates existieren
ls -la knowledge/
ls -la templates/

# Prüfe .env Pfade
grep -E "^(KNOWLEDGE_PATH|TEMPLATE_PATH)=" .env

# Die Pfade sollten relativ zum production/ Verzeichnis sein:
# KNOWLEDGE_PATH=./knowledge  (nicht ./production/knowledge)
# TEMPLATE_PATH=./templates   (nicht ./production/templates)

# Korrigiere falls nötig
sed -i 's|KNOWLEDGE_PATH=./production/knowledge|KNOWLEDGE_PATH=./knowledge|' .env
sed -i 's|TEMPLATE_PATH=./production/templates|TEMPLATE_PATH=./templates|' .env

# Oder setze absolut
sed -i 's|KNOWLEDGE_PATH=.*|KNOWLEDGE_PATH=/opt/mcp-connection-key/production/knowledge|' .env
sed -i 's|TEMPLATE_PATH=.*|TEMPLATE_PATH=/opt/mcp-connection-key/production/templates|' .env

# Agent neu starten
pm2 restart reading-agent

# Prüfe Health erneut
sleep 2
curl http://localhost:4001/health
```

Die Health-Antwort sollte dann zeigen:
```json
{
  "status": "ok",
  "service": "reading-agent",
  "port": "4001",
  "knowledge": 5,  // ← Sollte > 0 sein
  "templates": 10, // ← Sollte > 0 sein
  "timestamp": "..."
}
```

