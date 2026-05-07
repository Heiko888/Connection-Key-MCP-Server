# Telegram Post-Bilder

Statische Brand-Bilder, die zu den automatischen Telegram-Community-Posts dazu
gepostet werden. Pro Topic-Kategorie ein eigener Ordner. Bei jedem Post wird
zufällig **ein** Bild aus dem passenden Ordner ausgewählt.

## Struktur

```
images/
  general/      ← tägliche Begrüßung in #General
  hd-wissen/    ← HD-Wissen-Posts in #HD-Wissen
  business-hd/  ← Business-HD-Posts in #Business-HD
```

## Format

- **Erlaubt:** `.jpg`, `.jpeg`, `.png`, `.webp`
- **Max:** 10 MB pro Datei (Telegram-Limit)
- **Empfohlen:** 1280×720 (16:9) oder 1080×1080 (1:1), unter 1 MB

## Hinzufügen / Entfernen

Einfach Dateien rein/raus kopieren — kein Container-Rebuild nötig
(Verzeichnis ist als Read-only Volume gemountet).

## Caption-Verhalten

Telegram erlaubt max. 1024 Zeichen Caption an einem Foto.

- **Text ≤ 1024 Zeichen:** Foto + Text in **einem** Post (Caption)
- **Text > 1024 Zeichen:** Foto **zuerst** (ohne Caption), dann Text als
  zweiter Post — du siehst beide in der Timeline.

## Fallback

Ist der Ordner leer → wird der Post **ohne Bild** gesendet (text-only).
