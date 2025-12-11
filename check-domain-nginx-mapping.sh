#!/bin/bash

# 🔍 Prüfe Domain → Port Mapping (Nginx)

echo "🔍 Prüfe Domain → Port Mapping"
echo "=========================================="
echo ""

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🌐 Nginx Konfigurationen${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Prüfe Nginx-Konfigurationen
if [ -d "/etc/nginx/sites-enabled" ]; then
  echo "Aktive Nginx-Konfigurationen:"
  echo ""
  
  for config in /etc/nginx/sites-enabled/*; do
    if [ -f "$config" ]; then
      echo -e "${BLUE}📄 $(basename $config)${NC}"
      
      # Server Name
      SERVER_NAME=$(grep -E "^\s*server_name" "$config" | head -1 | sed 's/.*server_name\s*//;s/;.*//' | tr -d ';')
      if [ ! -z "$SERVER_NAME" ]; then
        echo "   Domain: $SERVER_NAME"
      fi
      
      # Proxy Pass
      PROXY_PASS=$(grep -E "^\s*proxy_pass" "$config" | head -1 | sed 's/.*proxy_pass\s*//;s/;.*//' | tr -d ';')
      if [ ! -z "$PROXY_PASS" ]; then
        echo "   → $PROXY_PASS"
        
        # Extrahiere Port
        PORT=$(echo "$PROXY_PASS" | grep -oE ":[0-9]+" | tr -d ':')
        if [ ! -z "$PORT" ]; then
          if [ "$PORT" == "3000" ]; then
            echo -e "   ${YELLOW}⚠️  Zeigt auf Port 3000 (connection-key Docker Container)${NC}"
          elif [ "$PORT" == "3005" ]; then
            echo -e "   ${GREEN}✅ Zeigt auf Port 3005 (Next.js Frontend)${NC}"
          else
            echo -e "   ${BLUE}ℹ️  Zeigt auf Port $PORT${NC}"
          fi
        fi
      fi
      
      echo ""
    fi
  done
else
  echo -e "${RED}❌ /etc/nginx/sites-enabled nicht gefunden${NC}"
fi

echo ""

# Prüfe speziell für the-connection-key.de
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🔍 Suche nach the-connection-key.de${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

FOUND=0

if [ -d "/etc/nginx/sites-enabled" ]; then
  for config in /etc/nginx/sites-enabled/*; do
    if [ -f "$config" ] && grep -q "the-connection-key" "$config" 2>/dev/null; then
      echo -e "${GREEN}✅ Gefunden in: $(basename $config)${NC}"
      echo ""
      
      # Zeige relevante Zeilen
      echo "Relevante Konfiguration:"
      grep -A 5 "the-connection-key" "$config" | head -10
      
      # Proxy Pass
      PROXY_PASS=$(grep -A 10 "the-connection-key" "$config" | grep "proxy_pass" | head -1 | sed 's/.*proxy_pass\s*//;s/;.*//' | tr -d ';')
      if [ ! -z "$PROXY_PASS" ]; then
        PORT=$(echo "$PROXY_PASS" | grep -oE ":[0-9]+" | tr -d ':')
        echo ""
        if [ "$PORT" == "3000" ]; then
          echo -e "${YELLOW}⚠️  Domain zeigt auf Port 3000 (connection-key Docker Container)${NC}"
          echo "   → Das ist NICHT das Next.js Frontend!"
          echo "   → Sollte auf Port 3005 zeigen (Next.js Frontend)"
        elif [ "$PORT" == "3005" ]; then
          echo -e "${GREEN}✅ Domain zeigt auf Port 3005 (Next.js Frontend)${NC}"
          echo "   → Das ist korrekt!"
        else
          echo -e "${BLUE}ℹ️  Domain zeigt auf Port $PORT${NC}"
        fi
      fi
      
      FOUND=1
      echo ""
    fi
  done
fi

if [ $FOUND -eq 0 ]; then
  echo -e "${YELLOW}⚠️  Keine Nginx-Konfiguration für the-connection-key.de gefunden${NC}"
  echo ""
  echo "Mögliche Gründe:"
  echo "1. Domain ist nicht über Nginx konfiguriert"
  echo "2. Domain verwendet einen anderen Namen"
  echo "3. Nginx-Konfiguration liegt woanders"
fi

echo ""

# Zusammenfassung
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 Zusammenfassung${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Port 3000: connection-key Docker Container (älterer Service)"
echo "Port 3005: Next.js Frontend (richtiges Frontend)"
echo ""

if [ $FOUND -eq 1 ]; then
  echo "Nächste Schritte:"
  echo "1. Prüfe ob Domain auf Port 3005 zeigt"
  echo "2. Falls Port 3000 → Nginx-Konfiguration ändern"
  echo "3. Nginx neu laden: systemctl reload nginx"
else
  echo "Nächste Schritte:"
  echo "1. Prüfe welche Domain du verwendest"
  echo "2. Prüfe Nginx-Konfiguration für diese Domain"
  echo "3. Stelle sicher, dass Domain auf Port 3005 zeigt"
fi

echo ""
