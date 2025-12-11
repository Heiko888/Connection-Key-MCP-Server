# 🚀 Redis Fixes anwenden - Anleitung

**Server:** `root@ubuntu-8gb-fsn1-1`  
**Pfad:** `/opt/hd-app/The-Connection-Key/`

---

## 📋 Vorbereitung

### 1. Dateien auf Server kopieren

**Von lokal (Windows):**

```powershell
# redis.conf kopieren
scp redis.conf root@ubuntu-8gb-fsn1-1:/opt/hd-app/The-Connection-Key/

# docker-compose.yml (korrigiert) kopieren
scp docker-compose-redis-fixed.yml root@ubuntu-8gb-fsn1-1:/opt/hd-app/The-Connection-Key/docker-compose.yml

# Fix-Skript kopieren
scp apply-redis-fixes.sh root@ubuntu-8gb-fsn1-1:/tmp/
```

**Oder auf Server direkt:**

```bash
# Auf Server verbinden
ssh root@ubuntu-8gb-fsn1-1

cd /opt/hd-app/The-Connection-Key/
```

---

## 🔧 Option 1: Automatisch (mit Skript)

### Schritt 1: Skript ausführen

```bash
# Auf Server
chmod +x /tmp/apply-redis-fixes.sh
/tmp/apply-redis-fixes.sh
```

Das Skript führt automatisch aus:
- ✅ Backup erstellen
- ✅ redis.conf prüfen
- ✅ REDIS_PASSWORD in .env setzen
- ✅ Container neu starten
- ✅ Verifikation

---

## 🔧 Option 2: Manuell

### Schritt 1: Backup erstellen

```bash
cd /opt/hd-app/The-Connection-Key/
cp docker-compose.yml docker-compose.yml.backup
```

### Schritt 2: redis.conf kopieren (falls nicht vorhanden)

```bash
# Von lokal
scp redis.conf root@ubuntu-8gb-fsn1-1:/opt/hd-app/The-Connection-Key/
```

### Schritt 3: REDIS_PASSWORD in .env setzen

```bash
# Auf Server
cd /opt/hd-app/The-Connection-Key/

# Prüfe ob vorhanden
grep REDIS_PASSWORD .env

# Falls nicht, hinzufügen
echo "REDIS_PASSWORD=IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5" >> .env
```

### Schritt 4: docker-compose.yml ersetzen

```bash
# Korrigierte Version kopieren
# (von lokal: scp docker-compose-redis-fixed.yml root@...:/opt/hd-app/The-Connection-Key/docker-compose.yml)

# Oder manuell das Duplikat entfernen
nano docker-compose.yml
# Entferne die zweite Redis-Definition (nach volumes:)
```

### Schritt 5: Syntax prüfen

```bash
docker-compose config
```

**Erwartet:** Keine Fehler

### Schritt 6: Container neu starten

```bash
# Container stoppen
docker-compose stop redis redis-exporter

# Container neu starten
docker-compose up -d redis redis-exporter

# Status prüfen
docker-compose ps redis
```

### Schritt 7: Verifikation

```bash
# Test ohne Passwort (sollte fehlschlagen)
docker-compose exec redis redis-cli PING

# Test mit Passwort (sollte funktionieren)
docker-compose exec redis redis-cli -a "$REDIS_PASSWORD" PING

# FLUSHALL sollte deaktiviert sein
docker-compose exec redis redis-cli -a "$REDIS_PASSWORD" FLUSHALL

# Protected Mode prüfen
docker-compose exec redis redis-cli -a "$REDIS_PASSWORD" CONFIG GET protected-mode
```

---

## ✅ Erwartete Ergebnisse

### Nach erfolgreicher Anwendung:

1. ✅ **Container läuft:** `docker-compose ps redis` zeigt "Up"
2. ✅ **Passwort-Schutz:** Verbindung ohne Passwort wird abgelehnt
3. ✅ **Passwort funktioniert:** Verbindung mit Passwort funktioniert
4. ✅ **FLUSHALL deaktiviert:** `ERR unknown command 'FLUSHALL'`
5. ✅ **Protected Mode:** `protected-mode yes`
6. ✅ **Kein Duplikat:** docker-compose.yml hat nur eine Redis-Definition

---

## 🆘 Troubleshooting

### Problem: Container startet nicht

```bash
# Logs prüfen
docker-compose logs redis

# redis.conf Syntax prüfen
docker-compose exec redis redis-server /usr/local/etc/redis/redis.conf --test-memory 1
```

### Problem: Passwort funktioniert nicht

```bash
# .env prüfen
grep REDIS_PASSWORD .env

# Container-Logs prüfen
docker-compose logs redis | grep -i password
```

### Problem: redis.conf wird nicht geladen

```bash
# Prüfe ob redis.conf gemountet ist
docker-compose exec redis ls -la /usr/local/etc/redis/redis.conf

# Prüfe Container-Command
docker-compose exec redis ps aux | grep redis
```

---

## 📊 Checkliste

- [ ] Backup erstellt
- [ ] redis.conf auf Server kopiert
- [ ] REDIS_PASSWORD in .env gesetzt
- [ ] docker-compose.yml korrigiert (Duplikat entfernt)
- [ ] Syntax geprüft
- [ ] Container neu gestartet
- [ ] Verifikation durchgeführt
- [ ] Alle Tests erfolgreich

---

**Status:** 🚀 Bereit zur Anwendung!

