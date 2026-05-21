# Telegram Post-Bilder

Statische Brand-Bilder, die zu den automatischen Telegram-Community-Posts dazu
gepostet werden. Pro Topic-Kategorie ein eigener Ordner.

**Thematisches Matching:** Bei jedem Post tokenisiert der Code den Post-Text
und sucht im Topic-Ordner nach Bildern, deren **Dateiname-Tags** im Text
vorkommen. Es wird das Bild mit dem höchsten Tag-Treffer-Score gewählt. Wenn
kein Tag matched: zufälliges Bild aus dem Topic-Ordner. Wenn der Ordner leer
ist: text-only Fallback.

## Struktur

```
images/
  general/         ← tägliche Begrüßung in #General
  hd-wissen/       ← HD-Wissen-Posts in #HD-Wissen
  business-hd/    ← Business-HD-Posts in #Business-HD
  connection-key/ ← Connection-Key-Posts
```

## Dateiname-Konvention für thematisches Matching

`tag1-tag2-...-NN.ext`

- Tags zwischen `-` oder `_`
- Numerische Suffixe (`01`, `02`) werden ignoriert
- Tags sollten lowercase und ohne Umlaute sein (`generator`, nicht `Generator`)
- Algorithmus berücksichtigt nur Tokens ≥ 3 Zeichen, Umlaute werden zu `ae/oe/ue/ss`

Beispiele:

- `hd-wissen/typ-generator-01.jpg` → matched Posts mit „Generator"
- `hd-wissen/autoritaet-sakral-02.png` → matched „Sakral" und/oder „Autorität"
- `hd-wissen/zentren-milz-03.webp` → matched „Milz"
- `hd-wissen/kanal-1-8-inspiration.jpg` → matched „Inspiration" (Zahlen ignoriert)
- `business-hd/sales-strategie-01.png` → matched „Sales", „Strategie"
- `general/begruessung-01.jpg` → matched „Begrüßung"

Wenn ein Bild mehrere Themen abdeckt: alle Tags im Namen aneinanderketten —
z. B. `connection-key/goldader-em-bruecke-01.jpg`.

Wenn kein Tag matched (z. B. weil der Post über etwas ganz anderes ist):
zufälliges Bild aus dem Topic-Ordner.

## Format

- **Erlaubt:** `.jpg`, `.jpeg`, `.png`, `.webp`
- **Max:** 10 MB pro Datei (Telegram-Limit)
- **Empfohlen:** 1280×720 (16:9) oder 1080×1080 (1:1), unter 1 MB

## Hinzufügen / Entfernen

Einfach Dateien rein/raus kopieren — kein Container-Rebuild nötig
(Verzeichnis ist als Read-only Volume gemountet).

```bash
# Per SFTP / SCP
scp meinBild.jpg root@138.199.237.34:/opt/mcp-connection-key/reading-worker/images/hd-wissen/
```

## Caption-Verhalten

Telegram erlaubt max. 1024 Zeichen Caption an einem Foto.

- **Text ≤ 1024 Zeichen:** Foto + Text in **einem** Post (Caption)
- **Text > 1024 Zeichen:** Foto **zuerst** (ohne Caption), dann Text als
  zweiter Post — du siehst beide in der Timeline.

## Fallback

Ist der Ordner leer → wird der Post **ohne Bild** gesendet (text-only).
