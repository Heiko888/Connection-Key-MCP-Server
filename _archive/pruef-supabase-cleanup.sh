#!/bin/bash
echo "========== Supabase & Cleanup-Prüfung =========="
date

echo ""
echo "=== 1) Alle .env Dateien mit Supabase-Referenzen ==="
for dir in /opt /var/www /home /srv; do
  find "$dir" -maxdepth 5 -name ".env*" -not -name ".env.example" 2>/dev/null | while read f; do
    matches=$(grep -i "supabase" "$f" 2>/dev/null)
    if [ -n "$matches" ]; then
      echo "--- $f ---"
      echo "$matches" | sed 's/\(KEY\|SECRET\|TOKEN\|PASSWORD\|ANON_KEY\)=.*/\1=***REDACTED***/'
      echo ""
    fi
  done
done

echo ""
echo "=== 2) Supabase-Verbindungstest (Projekt 1: wdiadklhvhlndnjojrfu) ==="
echo "--- REST API Health ---"
curl -s -o /dev/null -w "HTTP %{http_code}" --max-time 5 "https://wdiadklhvhlndnjojrfu.supabase.co/rest/v1/" -H "apikey: placeholder" 2>/dev/null
echo ""
echo "--- Auth Health ---"
curl -s -o /dev/null -w "HTTP %{http_code}" --max-time 5 "https://wdiadklhvhlndnjojrfu.supabase.co/auth/v1/health" 2>/dev/null
echo ""
echo "--- Realtime Health ---"
curl -s -o /dev/null -w "HTTP %{http_code}" --max-time 5 "https://wdiadklhvhlndnjojrfu.supabase.co/realtime/v1/health" 2>/dev/null
echo ""

echo ""
echo "=== 3) Supabase-Verbindungstest (Projekt 2: njjcywgskzepikyzhihy) ==="
echo "--- REST API Health ---"
curl -s -o /dev/null -w "HTTP %{http_code}" --max-time 5 "https://njjcywgskzepikyzhihy.supabase.co/rest/v1/" -H "apikey: placeholder" 2>/dev/null
echo ""
echo "--- Auth Health ---"
curl -s -o /dev/null -w "HTTP %{http_code}" --max-time 5 "https://njjcywgskzepikyzhihy.supabase.co/auth/v1/health" 2>/dev/null
echo ""
echo "--- Realtime Health ---"
curl -s -o /dev/null -w "HTTP %{http_code}" --max-time 5 "https://njjcywgskzepikyzhihy.supabase.co/realtime/v1/health" 2>/dev/null
echo ""

echo ""
echo "=== 4) Docker Container Supabase-Verbindungen ==="
for container in $(docker ps --format '{{.Names}}'); do
  matches=$(docker exec "$container" env 2>/dev/null | grep -i supabase)
  if [ -n "$matches" ]; then
    echo "--- Container: $container ---"
    echo "$matches" | sed 's/\(KEY\|SECRET\|TOKEN\|PASSWORD\|ANON\)=.*/\1=***REDACTED***/'
    echo ""
  fi
done

echo ""
echo "=== 5) Cleanup-Kandidaten ==="
echo "--- Docker Images (ungenutzt) ---"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}" | head -30
echo ""
echo "--- Dangling Images ---"
docker images -f "dangling=true" --format "{{.ID}} {{.Size}}" 2>/dev/null
echo ""
echo "--- Gestoppte Container ---"
docker ps -a --filter "status=exited" --format "table {{.Names}}\t{{.Status}}\t{{.Size}}" 2>/dev/null
echo ""
echo "--- Docker Volumes (ungenutzt) ---"
docker volume ls -f "dangling=true" 2>/dev/null
echo ""
echo "--- Disk-Usage gesamt ---"
df -h / 2>/dev/null
echo ""
echo "--- Docker Disk-Usage ---"
docker system df 2>/dev/null
echo ""
echo "--- Backup-Dateien ---"
find /opt -maxdepth 4 -name "*.backup*" -o -name "*.bak" -o -name "*.old" -o -name "*backup*" 2>/dev/null | head -30
echo ""
echo "--- Log-Größen ---"
find /var/log -maxdepth 2 -type f -size +50M 2>/dev/null
docker ps --format '{{.Names}}' | while read c; do
  size=$(docker inspect "$c" --format='{{.LogPath}}' 2>/dev/null | xargs ls -lh 2>/dev/null | awk '{print $5}')
  if [ -n "$size" ]; then
    echo "  $c log: $size"
  fi
done

echo ""
echo "========== Ende =========="
