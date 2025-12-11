# 🚀 Redis Fixes ausführen

**Status:** Bereit zur Ausführung

---

## 📋 Erstellte Dateien

1. ✅ `docker-compose-redis-fixed.yml` - Korrigierte docker-compose.yml (ohne Duplikat)
2. ✅ `apply-redis-fixes.sh` - Automatisches Fix-Skript für Linux
3. ✅ `apply-redis-fixes.ps1` - PowerShell-Skript zum Kopieren und Ausführen
4. ✅ `REDIS_FIXES_ANWENDEN.md` - Detaillierte Anleitung

---

## 🚀 Schnellstart

### Option 1: Automatisch (PowerShell)

```powershell
# Im aktuellen Verzeichnis
.\apply-redis-fixes.ps1
```

**Das Skript führt automatisch aus:**
- ✅ Dateien auf Server kopieren
- ✅ Fixes auf Server anwenden
- ✅ Verifikation durchführen

### Option 2: Manuell

**Schritt 1: Dateien kopieren**

```powershell
# Von Windows PowerShell
scp redis.conf root@ubuntu-8gb-fsn1-1:/opt/hd-app/The-Connection-Key/
scp docker-compose-redis-fixed.yml root@ubuntu-8gb-fsn1-1:/opt/hd-app/The-Connection-Key/docker-compose.yml
scp apply-redis-fixes.sh root@ubuntu-8gb-fsn1-1:/tmp/
```

**Schritt 2: Auf Server ausführen**

```bash
# SSH-Verbindung
ssh root@ubuntu-8gb-fsn1-1

# Auf Server
cd /opt/hd-app/The-Connection-Key/
chmod +x /tmp/apply-redis-fixes.sh
/tmp/apply-redis-fixes.sh
```

---

## ✅ Was wird gemacht

1. **Backup erstellen** - `docker-compose.yml.backup`
2. **redis.conf prüfen** - Existiert die Datei?
3. **REDIS_PASSWORD setzen** - In `.env` Datei
4. **Container neu starten** - Mit korrigierter Konfiguration
5. **Verifikation** - Alle Sicherheits-Fixes prüfen

---

## 📊 Erwartete Ergebnisse

Nach erfolgreicher Ausführung:

- ✅ Container läuft mit redis.conf
- ✅ Passwort-Schutz aktiv
- ✅ FLUSHALL deaktiviert
- ✅ Protected Mode aktiv
- ✅ Kein Duplikat in docker-compose.yml

---

## 🆘 Falls Probleme auftreten

### Problem: SSH-Verbindung fehlgeschlagen

```powershell
# Prüfe SSH-Verbindung
ssh root@ubuntu-8gb-fsn1-1 "echo 'Verbindung OK'"
```

### Problem: Dateien konnten nicht kopiert werden

```powershell
# Prüfe ob scp verfügbar ist
where.exe scp

# Falls nicht, verwende manuell:
# - WinSCP
# - FileZilla
# - Oder manuell auf Server kopieren
```

### Problem: Skript schlägt auf Server fehl

```bash
# Auf Server: Logs prüfen
cd /opt/hd-app/The-Connection-Key/
docker-compose logs redis

# Manuell ausführen
docker-compose stop redis redis-exporter
docker-compose up -d redis redis-exporter
```

---

## 📝 Checkliste

- [ ] `redis.conf` vorhanden
- [ ] `docker-compose-redis-fixed.yml` vorhanden
- [ ] `apply-redis-fixes.sh` vorhanden
- [ ] SSH-Zugriff auf Server
- [ ] Fixes angewendet
- [ ] Verifikation erfolgreich

---

**Bereit zur Ausführung!** 🚀

