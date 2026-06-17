# 🔄 Redis Container mit redis.conf neu starten

**Problem:** Der Container `hd_app_chart-redis-1` läuft in einem separaten Docker-Compose-Setup und lädt die `redis.conf` nicht automatisch.

---

## ⚠️ Aktuelle Situation

Der Container läuft wahrscheinlich in einem anderen Docker-Compose-Projekt (z.B. `hd_app_chart`). Die `redis.conf` wurde zwar in den Container kopiert, aber der Container startet Redis mit dem Standard-Command, nicht mit `redis-server /data/redis.conf`.

---

## 🔧 Lösung: Container mit redis.conf neu starten

### Option 1: Docker-Compose anpassen (Empfohlen)

Falls der Container in einer `docker-compose.yml` läuft, fügen Sie hinzu:

```yaml
services:
  redis:
    image: redis:alpine
    container_name: hd_app_chart-redis-1
    command: redis-server /data/redis.conf
    volumes:
      - redis_data:/data
      - ./redis.conf:/data/redis.conf:ro
    ports:
      - "127.0.0.1:6379:6379"  # Nur localhost!
    restart: unless-stopped
```

Dann:
```bash
docker-compose down
docker-compose up -d redis
```

### Option 2: Container neu erstellen

```bash
# 1. Container stoppen und entfernen
docker stop hd_app_chart-redis-1
docker rm hd_app_chart-redis-1

# 2. Container mit redis.conf neu erstellen
docker run -d \
  --name hd_app_chart-redis-1 \
  -p 127.0.0.1:6379:6379 \
  -v hd_app_chart_redis-storage:/data \
  -v $(pwd)/redis.conf:/data/redis.conf:ro \
  redis:alpine \
  redis-server /data/redis.conf

# 3. Verifikation
docker exec hd_app_chart-redis-1 redis-cli -a IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5 PING
```

### Option 3: Temporäre Konfiguration (Bis Container neu gestartet wird)

Die Konfiguration wurde bereits temporär gesetzt:
- ✅ Passwort: `IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5`
- ✅ Protected Mode: `yes`
- ✅ Max Memory: `512mb`

**⚠️ HINWEIS:** Diese Einstellungen gehen bei Container-Neustart verloren!

---

## ✅ Verifikation

Nach dem Neustart mit `redis.conf`:

```bash
# 1. Test ohne Passwort (sollte fehlschlagen)
docker exec hd_app_chart-redis-1 redis-cli PING
# Erwartet: NOAUTH Authentication required

# 2. Test mit Passwort (sollte funktionieren)
docker exec hd_app_chart-redis-1 redis-cli -a IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5 PING
# Erwartet: PONG

# 3. Protected Mode prüfen
docker exec hd_app_chart-redis-1 redis-cli -a IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5 CONFIG GET protected-mode
# Erwartet: protected-mode yes

# 4. FLUSHALL sollte deaktiviert sein
docker exec hd_app_chart-redis-1 redis-cli -a IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5 FLUSHALL
# Erwartet: ERR unknown command 'FLUSHALL'
```

---

## 📋 Aktueller Status

✅ **Temporär gesetzt:**
- Passwort aktiv
- Protected Mode aktiv
- Max Memory gesetzt

⚠️ **Erfordert Container-Neustart:**
- `redis.conf` wird nicht automatisch geladen
- Gefährliche Befehle sind noch nicht deaktiviert
- Bind ist noch 0.0.0.0 (sollte localhost sein)

---

## 🎯 Empfehlung

**Für persistente Konfiguration:**
1. Finden Sie die `docker-compose.yml`, die diesen Container verwaltet
2. Passen Sie die Konfiguration an (siehe Option 1)
3. Starten Sie den Container neu

**Für sofortige Sicherheit:**
- Die temporären Einstellungen (Passwort, Protected Mode) sind aktiv
- Diese bleiben bis zum Container-Neustart bestehen
- Für vollständige Sicherheit: Container mit `redis.conf` neu starten

---

**⚠️ WICHTIG:** Die `redis.conf` ist im Container vorhanden (`/data/redis.conf`), wird aber nicht automatisch geladen. Der Container muss mit `redis-server /data/redis.conf` gestartet werden.

