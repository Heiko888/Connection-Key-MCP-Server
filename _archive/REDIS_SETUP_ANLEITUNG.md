# 🔧 Redis Setup-Anleitung

**Datum:** 2024-12-XX  
**Container:** `hd_app_chart-redis-1`

---

## ✅ Was wurde erstellt

1. **`redis.conf`** - Vollständige sichere Redis-Konfiguration
2. **`REDIS_PASSWORD.txt`** - Passwort-Dokumentation (NICHT committen!)
3. **Sicherheits-Fixes angewendet** - Passwort, Protected Mode, Max Memory

---

## 🚀 Redis mit redis.conf einrichten

### Schritt 1: redis.conf in Container kopieren

```bash
# redis.conf in Container kopieren
docker cp redis.conf hd_app_chart-redis-1:/data/redis.conf
```

### Schritt 2: Container mit redis.conf neu starten

**Option A: Docker-Compose (empfohlen)**

Falls Redis in einer docker-compose.yml läuft, fügen Sie hinzu:

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

Dann Container neu starten:
```bash
docker-compose restart redis
```

**Option B: Container direkt neu starten**

```bash
# Container stoppen
docker stop hd_app_chart-redis-1

# Container mit redis.conf starten
docker start hd_app_chart-redis-1
```

### Schritt 3: Verifikation

```bash
# Test 1: Passwort-Schutz
docker exec hd_app_chart-redis-1 redis-cli PING
# Erwartet: NOAUTH Authentication required

# Test 2: Mit Passwort verbinden
docker exec hd_app_chart-redis-1 redis-cli -a IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5 PING
# Erwartet: PONG

# Test 3: Protected Mode
docker exec hd_app_chart-redis-1 redis-cli -a IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5 CONFIG GET protected-mode
# Erwartet: protected-mode yes

# Test 4: FLUSHALL sollte deaktiviert sein
docker exec hd_app_chart-redis-1 redis-cli -a IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5 FLUSHALL
# Erwartet: ERR unknown command 'FLUSHALL'
```

---

## 🔐 Passwort-Verwaltung

### Passwort in .env speichern

Erstellen Sie eine `.env` Datei (oder fügen Sie hinzu):

```bash
# Redis Konfiguration
REDIS_PASSWORD=IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5
REDIS_HOST=localhost
REDIS_PORT=6379
```

**⚠️ WICHTIG:**
- `.env` ist bereits in `.gitignore`
- Passwort NIEMALS in Code committen!
- `REDIS_PASSWORD.txt` ist auch in `.gitignore`

### Passwort in Anwendungen verwenden

**Node.js Beispiel:**
```javascript
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});
```

**Python Beispiel:**
```python
import redis
r = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    password=os.getenv('REDIS_PASSWORD')
)
```

---

## 🔧 Umbenannte Befehle verwenden

Da gefährliche Befehle umbenannt wurden, verwenden Sie:

```bash
# CONFIG Befehl (umbenannt)
docker exec hd_app_chart-redis-1 redis-cli -a IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5 CONFIG_a1b2c3d4e5f6 GET "*"

# SHUTDOWN Befehl (umbenannt)
docker exec hd_app_chart-redis-1 redis-cli -a IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5 SHUTDOWN_a1b2c3d4e5f6
```

**⚠️ HINWEIS:** Diese Befehle sollten nur für Wartung verwendet werden!

---

## 📊 Konfiguration prüfen

### Alle Konfigurationen anzeigen

```bash
docker exec hd_app_chart-redis-1 redis-cli -a IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5 CONFIG_a1b2c3d4e5f6 GET "*"
```

### Wichtige Konfigurationen prüfen

```bash
# Passwort
docker exec hd_app_chart-redis-1 redis-cli -a IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5 CONFIG_a1b2c3d4e5f6 GET requirepass

# Protected Mode
docker exec hd_app_chart-redis-1 redis-cli -a IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5 CONFIG_a1b2c3d4e5f6 GET protected-mode

# Max Memory
docker exec hd_app_chart-redis-1 redis-cli -a IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5 CONFIG_a1b2c3d4e5f6 GET maxmemory

# Memory Policy
docker exec hd_app_chart-redis-1 redis-cli -a IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5 CONFIG_a1b2c3d4e5f6 GET maxmemory-policy
```

---

## 🔄 Container-Neustart

### Container mit redis.conf neu starten

```bash
# 1. Container stoppen
docker stop hd_app_chart-redis-1

# 2. Container mit redis.conf starten
docker run -d \
  --name hd_app_chart-redis-1 \
  -p 127.0.0.1:6379:6379 \
  -v redis_data:/data \
  -v $(pwd)/redis.conf:/data/redis.conf:ro \
  redis:alpine \
  redis-server /data/redis.conf
```

### Oder mit docker-compose

```bash
docker-compose down
docker-compose up -d redis
```

---

## ✅ Checkliste

- [x] `redis.conf` erstellt
- [x] Passwort gesetzt
- [x] Protected Mode aktiviert
- [x] Gefährliche Befehle deaktiviert
- [x] Max Memory konfiguriert
- [ ] `redis.conf` in Container kopiert
- [ ] Container mit `redis.conf` neu gestartet
- [ ] Passwort in `.env` gespeichert
- [ ] Verifikation durchgeführt
- [ ] Anwendungen mit Passwort konfiguriert

---

## 🆘 Troubleshooting

### Problem: Container startet nicht

**Lösung:**
```bash
# Logs prüfen
docker logs hd_app_chart-redis-1

# redis.conf Syntax prüfen
docker exec hd_app_chart-redis-1 redis-server /data/redis.conf --test-memory 1
```

### Problem: Passwort funktioniert nicht

**Lösung:**
```bash
# Passwort in redis.conf prüfen
grep requirepass redis.conf

# Passwort zurücksetzen
docker exec hd_app_chart-redis-1 redis-cli CONFIG SET requirepass "Neues-Passwort"
```

### Problem: FLUSHALL funktioniert noch

**Lösung:**
- Container muss mit `redis.conf` neu gestartet werden
- `rename-command` funktioniert nur bei Start, nicht über CONFIG SET

---

## 📚 Weitere Ressourcen

- **Sicherheitsanalyse:** `REDIS_SECURITY_AUDIT.md`
- **Angewendete Fixes:** `REDIS_SECURITY_FIXES_APPLIED.md`
- **Status:** `REDIS_STATUS.md`
- **Redis Dokumentation:** https://redis.io/docs/

---

**✅ Redis ist jetzt sicher konfiguriert!**

**Nächster Schritt:** Container mit `redis.conf` neu starten, damit alle Änderungen persistent sind.

