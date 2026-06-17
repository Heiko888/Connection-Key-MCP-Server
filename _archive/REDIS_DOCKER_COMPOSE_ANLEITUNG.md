# 🔍 Redis Docker-Compose Analyse-Anleitung

**Server-Pfad:** `/opt/hd-app/The-Connection-Key/`  
**Datei:** `docker-compose.yml`

---

## 📋 Was zu prüfen ist

### 1. Docker-Compose Datei lesen

**Auf dem Server ausführen:**

```bash
# Auf Server verbinden
ssh root@ubuntu-8gb-fsn1-1

# Zu Verzeichnis wechseln
cd /opt/hd-app/The-Connection-Key/

# docker-compose.yml anzeigen
cat docker-compose.yml

# Oder nur Redis-Service anzeigen
grep -A 30 "redis:" docker-compose.yml
```

### 2. Redis-Service analysieren

**Zu prüfen:**
- [ ] Service-Name (z.B. `redis`, `chart-redis`)
- [ ] Container-Name
- [ ] Image
- [ ] Command/Entrypoint
- [ ] Volumes
- [ ] Ports
- [ ] Environment Variables

### 3. Container-Informationen

```bash
# Container-Status
docker ps --filter "name=redis"

# Container-Details
docker inspect hd_app_chart-redis-1

# Docker-Compose Labels
docker inspect hd_app_chart-redis-1 --format='{{range $key, $value := .Config.Labels}}{{printf "%s=%s\n" $key $value}}{{end}}'
```

---

## 🔧 Analyse-Skript verwenden

**Auf dem Server ausführen:**

```bash
# Skript hochladen (von lokal)
scp check-redis-docker-compose.sh root@ubuntu-8gb-fsn1-1:/tmp/

# Auf Server
ssh root@ubuntu-8gb-fsn1-1
chmod +x /tmp/check-redis-docker-compose.sh
/tmp/check-redis-docker-compose.sh
```

---

## 📝 Was zu dokumentieren ist

### Aktuelle Konfiguration

1. **Service-Definition:**
   ```yaml
   # Wie sieht der Redis-Service aus?
   redis:
     image: ...
     command: ...
     volumes: ...
   ```

2. **Command/Entrypoint:**
   - Wird `redis-server` verwendet?
   - Wird `redis.conf` geladen?
   - Welche Parameter werden übergeben?

3. **Volumes:**
   - Welche Volumes sind gemountet?
   - Wo ist `redis.conf` (falls vorhanden)?

4. **Ports:**
   - Welche Ports sind geöffnet?
   - Bindet an 0.0.0.0 oder localhost?

---

## ⚠️ WICHTIG: Nichts ändern!

**Nur prüfen und dokumentieren:**
- ✅ Datei lesen
- ✅ Konfiguration analysieren
- ✅ Dokumentation erstellen
- ❌ KEINE Änderungen vornehmen
- ❌ KEINE Container neu starten
- ❌ KEINE Dateien ändern

---

## 📊 Erwartete Informationen

Nach der Analyse sollten folgende Informationen vorliegen:

1. **Service-Name:** z.B. `redis` oder `chart-redis`
2. **Aktueller Command:** z.B. `redis-server` oder `redis-server /data/redis.conf`
3. **Volumes:** Welche Volumes sind gemountet?
4. **Ports:** Welche Ports sind geöffnet?
5. **Änderungsbedarf:** Was muss geändert werden, damit `redis.conf` geladen wird?

---

## 🎯 Nächste Schritte (nach der Analyse)

1. **Konfiguration dokumentieren**
2. **Änderungsvorschlag erstellen:**
   - Was muss geändert werden?
   - Wie sollte es aussehen?
   - Welche Auswirkungen hat es?

3. **Änderungen vorbereiten** (aber noch nicht anwenden!)

---

**Status:** 🔍 Warte auf Analyse der docker-compose.yml auf dem Server

