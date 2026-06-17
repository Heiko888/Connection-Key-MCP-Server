# 🔍 Stash-Inhalt prüfen

## Was wurde gestasht?

Beim `git stash push` wurde die **lokale Änderung an `docker-compose.yml`** gespeichert.

## Stash-Inhalt ansehen

### Auf dem Server ausführen:

```bash
# 1. Liste aller Stashes anzeigen
git stash list

# 2. Inhalt des letzten Stash anzeigen
git stash show

# 3. Detaillierte Änderungen anzeigen
git stash show -p

# 4. Nur docker-compose.yml Änderungen anzeigen
git stash show -p -- docker-compose.yml
```

## Was war wahrscheinlich geändert?

Basierend auf der Konversation wurden wahrscheinlich folgende Änderungen an `docker-compose.yml` gemacht:

1. **mcp-server Service entfernt** (da er nicht für Docker geeignet war)
2. **depends_on Einträge angepasst** (chatgpt-agent und connection-key hingen von mcp-server ab)

## Stash wieder anwenden

```bash
# Stash wieder anwenden (ohne zu löschen)
git stash apply

# Oder Stash anwenden und löschen
git stash pop
```

## Stash verwerfen (falls nicht mehr benötigt)

```bash
# Letzten Stash löschen
git stash drop

# Alle Stashes löschen
git stash clear
```

