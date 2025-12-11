# 🚀 Redis Fixes manuell ausführen

**Status:** Alle Dateien sind erstellt und bereit!

---

## ✅ Erstellte Dateien

1. ✅ `redis.conf` - Sichere Redis-Konfiguration
2. ✅ `docker-compose-redis-fixed.yml` - Korrigierte docker-compose.yml (ohne Duplikat)
3. ✅ `apply-redis-fixes.sh` - Automatisches Fix-Skript
4. ✅ `apply-redis-fixes.ps1` - PowerShell-Skript (für lokale Ausführung)

---

## 📋 Manuelle Ausführung

### Schritt 1: Dateien auf Server kopieren

**Option A: Mit SCP (von Windows PowerShell oder WSL)**

```powershell
# redis.conf kopieren
scp redis.conf root@ubuntu-8gb-fsn1-1:/opt/hd-app/The-Connection-Key/

# docker-compose.yml kopieren (ersetzt die alte)
scp docker-compose-redis-fixed.yml root@ubuntu-8gb-fsn1-1:/opt/hd-app/The-Connection-Key/docker-compose.yml

# Fix-Skript kopieren
scp apply-redis-fixes.sh root@ubuntu-8gb-fsn1-1:/tmp/
```

**Option B: Mit WinSCP oder FileZilla**

1. Verbinden Sie sich mit `root@ubuntu-8gb-fsn1-1`
2. Kopieren Sie `redis.conf` nach `/opt/hd-app/The-Connection-Key/`
3. Kopieren Sie `docker-compose-redis-fixed.yml` nach `/opt/hd-app/The-Connection-Key/docker-compose.yml` (überschreibt die alte)
4. Kopieren Sie `apply-redis-fixes.sh` nach `/tmp/`

**Option C: Manuell auf Server**

```bash
# Auf Server verbinden
ssh root@ubuntu-8gb-fsn1-1

# redis.conf erstellen (kopieren Sie den Inhalt von redis.conf)
nano /opt/hd-app/The-Connection-Key/redis.conf
# (Inhalt einfügen und speichern)

# docker-compose.yml ersetzen
nano /opt/hd-app/The-Connection-Key/docker-compose.yml
# (Inhalt von docker-compose-redis-fixed.yml einfügen)
```

---

### Schritt 2: Auf Server ausführen

**SSH-Verbindung herstellen:**

```bash
ssh root@ubuntu-8gb-fsn1-1
```

**Fix-Skript ausführen:**

```bash
cd /opt/hd-app/The-Connection-Key/

# Skript ausführbar machen
chmod +x /tmp/apply-redis-fixes.sh

# Skript ausführen
/tmp/apply-redis-fixes.sh
```

**ODER manuell Schritt für Schritt:**

```bash
cd /opt/hd-app/The-Connection-Key/

# 1. Backup erstellen
cp docker-compose.yml docker-compose.yml.backup

# 2. Prüfe redis.conf
ls -la redis.conf

# 3. REDIS_PASSWORD in .env setzen
echo "REDIS_PASSWORD=IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5" >> .env

# 4. Syntax prüfen
docker-compose config

# 5. Container neu starten
docker-compose stop redis redis-exporter
docker-compose up -d redis redis-exporter

# 6. Warten
sleep 5

# 7. Verifikation
docker-compose exec redis redis-cli -a "IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5" PING
```

---

## ✅ Verifikation

Nach der Ausführung sollten folgende Tests erfolgreich sein:

```bash
# Test 1: Ohne Passwort (sollte fehlschlagen)
docker-compose exec redis redis-cli PING
# Erwartet: NOAUTH Authentication required

# Test 2: Mit Passwort (sollte funktionieren)
docker-compose exec redis redis-cli -a "IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5" PING
# Erwartet: PONG

# Test 3: FLUSHALL deaktiviert
docker-compose exec redis redis-cli -a "IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5" FLUSHALL
# Erwartet: ERR unknown command 'FLUSHALL'

# Test 4: Protected Mode
docker-compose exec redis redis-cli -a "IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5" CONFIG GET protected-mode
# Erwartet: protected-mode yes
```

---

## 📊 Zusammenfassung

**Was wird gemacht:**
1. ✅ Duplikat in docker-compose.yml entfernt
2. ✅ redis.conf auf Server kopiert
3. ✅ REDIS_PASSWORD in .env gesetzt
4. ✅ Container mit redis.conf neu gestartet
5. ✅ Alle Sicherheits-Fixes aktiviert

**Ergebnis:**
- ✅ Passwort-Schutz aktiv
- ✅ Protected Mode aktiv
- ✅ FLUSHALL deaktiviert
- ✅ Port nicht öffentlich
- ✅ Sichere Konfiguration

---

## 🆘 Falls Probleme auftreten

### Container startet nicht

```bash
# Logs prüfen
docker-compose logs redis

# redis.conf Syntax prüfen
docker-compose exec redis redis-server /usr/local/etc/redis/redis.conf --test-memory 1
```

### Passwort funktioniert nicht

```bash
# .env prüfen
grep REDIS_PASSWORD .env

# Container-Logs
docker-compose logs redis | grep -i password
```

---

**Bereit zur Ausführung!** 🚀

**Nächster Schritt:** Dateien auf Server kopieren und Fixes ausführen.

