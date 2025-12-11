# 🚨 NOTFALL: Alle Seiten geben 404

## Sofort-Maßnahmen

### Schritt 1: Container-Status prüfen

```bash
cd /opt/hd-app/The-Connection-Key
docker compose ps
```

### Schritt 2: Container komplett neu starten

```bash
cd /opt/hd-app/The-Connection-Key
docker compose restart frontend
```

### Schritt 3: Falls das nicht hilft - Container neu erstellen

```bash
cd /opt/hd-app/The-Connection-Key
docker compose down frontend
docker compose up -d frontend
```

### Schritt 4: Logs prüfen

```bash
docker logs the-connection-key-frontend-1 --tail 100
```

### Schritt 5: Prüfe ob Next.js läuft

```bash
docker exec the-connection-key-frontend-1 ps aux | grep next
```

### Schritt 6: Falls Next.js nicht läuft - manuell starten

```bash
docker exec -it the-connection-key-frontend-1 sh
cd /app
npm start
# Oder für Development:
npm run dev
```

## Mögliche Ursachen

1. **Build fehlgeschlagen** - `.next` Verzeichnis beschädigt
2. **Container abgestürzt** - Prozess beendet
3. **Port-Konflikt** - Port 3000 bereits belegt
4. **Dateisystem-Problem** - Dateien nicht erreichbar

## Schnell-Fix: Build-Verzeichnis löschen und neu bauen

```bash
cd /opt/hd-app/The-Connection-Key
docker compose exec frontend sh -c 'rm -rf /app/.next && npm run build'
docker compose restart frontend
```

## Falls nichts hilft: Zurücksetzen auf vorherigen Stand

```bash
cd /opt/hd-app/The-Connection-Key
docker compose down
docker compose up -d
```

