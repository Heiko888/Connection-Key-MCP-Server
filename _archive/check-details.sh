#!/bin/bash
# Detaillierte Prüfung des Hetzner Servers

echo "=== DETAILLIERTE SERVER-PRÜFUNG ==="
echo ""

# 1. Projekt-Verzeichnis Inhalt
echo "=== 1. Projekt-Verzeichnis Inhalt ==="
if [ -d "/opt/mcp-connection-key" ]; then
    echo "Verzeichnis existiert: /opt/mcp-connection-key"
    echo "Inhalt:"
    ls -la /opt/mcp-connection-key/
    echo ""
    
    # Prüfe wichtige Dateien
    echo "Wichtige Dateien:"
    [ -f "/opt/mcp-connection-key/docker-compose.yml" ] && echo "  ✅ docker-compose.yml vorhanden" || echo "  ❌ docker-compose.yml FEHLT"
    [ -f "/opt/mcp-connection-key/.env" ] && echo "  ✅ .env vorhanden" || echo "  ❌ .env FEHLT"
    [ -f "/opt/mcp-connection-key/package.json" ] && echo "  ✅ package.json vorhanden" || echo "  ❌ package.json FEHLT"
    [ -d "/opt/mcp-connection-key/.git" ] && echo "  ✅ Git Repository vorhanden" || echo "  ❌ Git Repository FEHLT"
    echo ""
else
    echo "❌ Verzeichnis /opt/mcp-connection-key existiert NICHT"
    echo ""
fi

# 2. Docker Status
echo "=== 2. Docker Status ==="
if command -v docker &> /dev/null; then
    echo "Docker installiert: $(docker --version)"
    systemctl is-active --quiet docker && echo "Docker Service: ✅ LÄUFT" || echo "Docker Service: ❌ LÄUFT NICHT"
    echo ""
    echo "Alle Container (inkl. gestoppte):"
    docker ps -a
    echo ""
    echo "Docker Images:"
    docker images
    echo ""
else
    echo "❌ Docker ist NICHT installiert"
    echo ""
fi

# 3. Docker Compose Status
echo "=== 3. Docker Compose Status ==="
if [ -f "/opt/mcp-connection-key/docker-compose.yml" ]; then
    cd /opt/mcp-connection-key
    echo "docker-compose.yml gefunden, prüfe Status..."
    docker-compose ps 2>/dev/null || echo "Fehler beim Ausführen von docker-compose ps"
    echo ""
fi

# 4. .env Datei (ohne sensible Daten)
echo "=== 4. .env Datei Status ==="
if [ -f "/opt/mcp-connection-key/.env" ]; then
    echo "✅ .env Datei vorhanden"
    echo "Berechtigungen: $(ls -l /opt/mcp-connection-key/.env | awk '{print $1}')"
    echo "Größe: $(du -h /opt/mcp-connection-key/.env | cut -f1)"
    echo ""
    echo "Variablen (ohne Werte):"
    grep -E "^[A-Z_]+=" /opt/mcp-connection-key/.env | cut -d'=' -f1 | sort
    echo ""
else
    echo "❌ .env Datei FEHLT"
    echo ""
fi

# 5. Git Status
echo "=== 5. Git Repository Status ==="
if [ -d "/opt/mcp-connection-key/.git" ]; then
    cd /opt/mcp-connection-key
    echo "Branch: $(git branch --show-current 2>/dev/null || echo 'unbekannt')"
    echo "Remote: $(git remote get-url origin 2>/dev/null || echo 'kein Remote')"
    echo "Letzter Commit: $(git log -1 --format='%h - %s (%ar)' 2>/dev/null || echo 'unbekannt')"
    echo ""
else
    echo "❌ Kein Git Repository gefunden"
    echo ""
fi

# 6. System Ressourcen
echo "=== 6. System Ressourcen ==="
echo "Disk Space:"
df -h / | tail -1
echo ""
echo "Memory:"
free -h
echo ""

# 7. Nginx Status
echo "=== 7. Nginx Status ==="
if command -v nginx &> /dev/null; then
    echo "✅ Nginx installiert"
    systemctl is-active --quiet nginx && echo "Nginx Service: ✅ LÄUFT" || echo "Nginx Service: ❌ LÄUFT NICHT"
    [ -f "/etc/nginx/sites-enabled/mcp-system" ] && echo "✅ MCP System Konfiguration vorhanden" || echo "❌ MCP System Konfiguration FEHLT"
else
    echo "❌ Nginx NICHT installiert"
fi
echo ""

# 8. Firewall Status
echo "=== 8. Firewall Status ==="
if command -v ufw &> /dev/null; then
    ufw status | head -5
else
    echo "UFW nicht installiert"
fi
echo ""

# 9. Zusammenfassung
echo "=== ZUSAMMENFASSUNG ==="
echo ""
echo "Was ist vorhanden:"
[ -d "/opt/mcp-connection-key" ] && echo "  ✅ Projekt-Verzeichnis" || echo "  ❌ Projekt-Verzeichnis FEHLT"
[ -f "/opt/mcp-connection-key/docker-compose.yml" ] && echo "  ✅ docker-compose.yml" || echo "  ❌ docker-compose.yml FEHLT"
[ -f "/opt/mcp-connection-key/.env" ] && echo "  ✅ .env Datei" || echo "  ❌ .env Datei FEHLT"
command -v docker &> /dev/null && echo "  ✅ Docker installiert" || echo "  ❌ Docker FEHLT"
docker ps -q | grep -q . && echo "  ✅ Container laufen" || echo "  ❌ KEINE Container laufen"
echo ""
echo "Nächste Schritte:"
if [ ! -f "/opt/mcp-connection-key/.env" ]; then
    echo "  1. .env Datei erstellen: cd /opt/mcp-connection-key && cp .env.example .env && nano .env"
fi
if ! docker ps -q | grep -q .; then
    echo "  2. Services starten: cd /opt/mcp-connection-key && docker-compose up -d"
fi

