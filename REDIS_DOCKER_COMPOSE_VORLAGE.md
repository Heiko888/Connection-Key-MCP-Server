# 📋 Redis Docker-Compose Änderungsvorschlag

**Server-Pfad:** `/opt/hd-app/The-Connection-Key/`  
**Datei:** `docker-compose.yml`

---

## 🔍 Aktuelle Konfiguration (zu prüfen)

**Bitte auf dem Server prüfen:**

```bash
cd /opt/hd-app/The-Connection-Key/
cat docker-compose.yml | grep -A 20 "redis:"
```

---

## 💡 Erwartete Änderungen

### Vorher (vermutet):

```yaml
services:
  redis:  # oder chart-redis
    image: redis:alpine
    container_name: hd_app_chart-redis-1
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    # KEIN command mit redis.conf!
```

### Nachher (empfohlen):

```yaml
services:
  redis:  # oder chart-redis
    image: redis:alpine
    container_name: hd_app_chart-redis-1
    command: redis-server /data/redis.conf
    ports:
      - "127.0.0.1:6379:6379"  # Nur localhost!
    volumes:
      - redis_data:/data
      - ./redis.conf:/data/redis.conf:ro  # redis.conf mounten
    restart: unless-stopped
```

---

## 📝 Änderungen im Detail

### 1. Command hinzufügen

**Vorher:**
```yaml
# Kein command = Standard redis-server
```

**Nachher:**
```yaml
command: redis-server /data/redis.conf
```

### 2. redis.conf Volume hinzufügen

**Vorher:**
```yaml
volumes:
  - redis_data:/data
```

**Nachher:**
```yaml
volumes:
  - redis_data:/data
  - ./redis.conf:/data/redis.conf:ro  # Nur lesen
```

### 3. Port-Binding ändern

**Vorher:**
```yaml
ports:
  - "6379:6379"  # Oder "0.0.0.0:6379:6379"
```

**Nachher:**
```yaml
ports:
  - "127.0.0.1:6379:6379"  # Nur localhost!
```

---

## ⚠️ WICHTIG: Vor Änderungen prüfen!

1. **Backup erstellen:**
   ```bash
   cp docker-compose.yml docker-compose.yml.backup
   ```

2. **Aktuelle Konfiguration dokumentieren**

3. **redis.conf auf Server kopieren:**
   ```bash
   # Von lokal
   scp redis.conf root@ubuntu-8gb-fsn1-1:/opt/hd-app/The-Connection-Key/
   ```

4. **Änderungen testen:**
   ```bash
   docker-compose config  # Syntax prüfen
   docker-compose up -d redis  # Test-Start
   ```

---

## 🔄 Nach Änderungen

### Container neu starten:

```bash
cd /opt/hd-app/The-Connection-Key/
docker-compose down redis
docker-compose up -d redis
```

### Verifikation:

```bash
# Test ohne Passwort (sollte fehlschlagen)
docker exec hd_app_chart-redis-1 redis-cli PING

# Test mit Passwort (sollte funktionieren)
docker exec hd_app_chart-redis-1 redis-cli -a IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5 PING

# FLUSHALL sollte deaktiviert sein
docker exec hd_app_chart-redis-1 redis-cli -a IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5 FLUSHALL
```

---

## 📋 Checkliste

- [ ] Aktuelle docker-compose.yml gelesen
- [ ] Konfiguration dokumentiert
- [ ] redis.conf auf Server kopiert
- [ ] Backup erstellt
- [ ] Änderungen vorbereitet
- [ ] **NOCH NICHT ANGEWENDET!**

---

**Status:** 📋 Vorlage erstellt - Warte auf Analyse der aktuellen Konfiguration

