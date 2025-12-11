# 🔧 Redis Docker-Compose Fixes

**Server:** `root@ubuntu-8gb-fsn1-1`  
**Pfad:** `/opt/hd-app/The-Connection-Key/`  
**Datei:** `docker-compose.yml`

---

## ⚠️ GEFUNDENE PROBLEME

### 1. 🔴 Redis-Service ist DOPPELT definiert

**Problem:** Der Redis-Service erscheint zweimal in der Datei.

**Lösung:** Entfernen Sie die zweite Definition (ab ~Zeile 350).

---

## 📋 Korrigierte docker-compose.yml

### Redis-Service (NUR EINE Definition behalten):

```yaml
# ------------------------------------------------------
# REDIS (SICHER KONFIGURIERT)
# ------------------------------------------------------
redis:
  image: redis:alpine
  
  # ⚠️ Port NICHT öffentlich exponieren - nur interne Docker-Kommunikation
  # ports:
  #   - "6379:6379"  # ENTFERNT für Sicherheit
  
  volumes:
    - redis-storage:/data
    - ./redis.conf:/usr/local/etc/redis/redis.conf:ro
  
  restart: unless-stopped
  
  # Passwort wird über --requirepass übergeben (sicherer als in redis.conf)
  # Anführungszeichen schützen vor Sonderzeichen im Passwort
  command: >
    sh -c "redis-server /usr/local/etc/redis/redis.conf --requirepass \"$$REDIS_PASSWORD\""
  
  environment:
    - REDIS_PASSWORD=${REDIS_PASSWORD}
  
  networks:
    - app-network

# ------------------------------------------------------
# REDIS EXPORTER (SICHER KONFIGURIERT)
# ------------------------------------------------------
redis-exporter:
  image: oliver006/redis_exporter:latest
  ports:
    - "9121:9121"
  environment:
    - REDIS_ADDR=redis:6379
    - REDIS_PASSWORD=${REDIS_PASSWORD}
  depends_on:
    - redis
  restart: unless-stopped
  networks:
    - app-network
```

**WICHTIG:** Die zweite Definition (nach `volumes:`) muss **KOMPLETT ENTFERNT** werden!

---

## 🔍 Prüfungen vor Änderungen

### 1. Backup erstellen

```bash
cd /opt/hd-app/The-Connection-Key/
cp docker-compose.yml docker-compose.yml.backup
```

### 2. redis.conf prüfen

```bash
# Existiert redis.conf?
ls -la redis.conf

# Falls nicht, von lokal kopieren:
# scp redis.conf root@ubuntu-8gb-fsn1-1:/opt/hd-app/The-Connection-Key/
```

### 3. REDIS_PASSWORD prüfen

```bash
# In .env vorhanden?
grep REDIS_PASSWORD .env

# Falls nicht, hinzufügen:
echo "REDIS_PASSWORD=IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5" >> .env
```

---

## 🔧 Änderungen anwenden

### Schritt 1: Duplikat entfernen

**Auf Server:**

```bash
cd /opt/hd-app/The-Connection-Key/

# Backup erstellen
cp docker-compose.yml docker-compose.yml.backup

# Duplikat entfernen (manuell mit Editor)
nano docker-compose.yml
# Oder
vi docker-compose.yml
```

**Zu entfernen:**
- Die zweite `redis:` Definition (nach `volumes:`)
- Die zweite `redis-exporter:` Definition
- Die doppelten `networks:` und `volumes:` Definitionen

### Schritt 2: Syntax prüfen

```bash
docker-compose config
```

**Erwartet:** Keine Fehler, nur Warnungen (falls vorhanden)

### Schritt 3: Container neu starten

```bash
# Container stoppen
docker-compose down redis redis-exporter

# Container neu starten
docker-compose up -d redis redis-exporter

# Status prüfen
docker-compose ps redis
```

---

## ✅ Verifikation nach Änderungen

### 1. Container läuft

```bash
docker ps --filter "name=redis"
```

**Erwartet:** Container läuft

### 2. redis.conf geladen

```bash
# Test ohne Passwort (sollte fehlschlagen)
docker exec the-connection-key-redis-1 redis-cli PING

# Test mit Passwort (sollte funktionieren)
docker exec the-connection-key-redis-1 redis-cli -a $REDIS_PASSWORD PING
```

### 3. FLUSHALL deaktiviert

```bash
docker exec the-connection-key-redis-1 redis-cli -a $REDIS_PASSWORD FLUSHALL
```

**Erwartet:** `ERR unknown command 'FLUSHALL'`

### 4. Protected Mode aktiv

```bash
docker exec the-connection-key-redis-1 redis-cli -a $REDIS_PASSWORD CONFIG GET protected-mode
```

**Erwartet:** `protected-mode yes`

---

## 📊 Vorher/Nachher Vergleich

### Vorher:
- ❌ Redis-Service doppelt definiert
- ✅ redis.conf gemountet
- ✅ redis.conf geladen
- ✅ Port nicht öffentlich
- ✅ Passwort über ENV

### Nachher:
- ✅ Redis-Service nur einmal definiert
- ✅ redis.conf gemountet
- ✅ redis.conf geladen
- ✅ Port nicht öffentlich
- ✅ Passwort über ENV
- ✅ Saubere Konfiguration

---

## 🎯 Zusammenfassung

**Was zu tun ist:**
1. ✅ Backup erstellen
2. ✅ Duplikat entfernen
3. ✅ redis.conf prüfen/kopieren
4. ✅ REDIS_PASSWORD in .env setzen
5. ✅ Container neu starten
6. ✅ Verifikation durchführen

**Was bereits gut ist:**
- ✅ redis.conf wird bereits geladen
- ✅ Port ist nicht öffentlich
- ✅ Passwort über Environment-Variable
- ✅ Sichere Konfiguration

**Hauptproblem:**
- 🔴 Duplikat muss entfernt werden

---

**Status:** 📋 Fixes vorbereitet - Bereit zur Anwendung (nach Prüfungen)

