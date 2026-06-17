# Betroffene Readings — Inkarnationskreuz-Bug (Profil 4/6)

**Datum:** 2026-05-24
**Bug:** Profil 4/6 wurde als **Left Angle** statt **Right Angle** klassifiziert
(Winkel wurde nur aus der ersten Profillinie abgeleitet; 4/6 ist das einzige
Right-Angle-Profil mit erster Linie 4).
**Fix:** `connection-key/lib/astro/chartCalculation.js` + `reading-worker/server.js:1517`
(Commit-Branch `fix/incarnation-cross-4-6-right-angle`, deployed 2026-05-24).

## Wie identifiziert

Profil aller 101 Readings mit Geburtsdaten in `public.readings` neu berechnet
(Swiss-Ephemeris-Engine im `connection-key`-Container). Profil-Verteilung:
`6/3: 35 · 3/5: 17 · 2/4: 15 · 6/2: 13 · 4/6: 9 · 1/3: 8 · 3/6: 3 · 5/2: 1`.

Die 9 Readings mit Profil **4/6** enthalten in `reading_data.chart_data.incarnationCross`
ein falsches Kreuz (`type: "Left Angle"`). Die Spalte `chart_data` ist bei allen `null`.

## Liste (9 Readings)

### Mirjana — 1953-09-01 14:30, Đakovo (Kroatien)
Gespeichert (falsch): **LAX of Planning / LAX der Planung** (Left Angle)
Korrekt: **Right Angle Cross of Planning 3 / RAX der Planung** — Tore 40/37 | 16/9

| Reading-ID | Typ | Status | Erstellt |
|---|---|---|---|
| `30313d37-c7d6-490e-8491-eeb63af07abc` | connection | completed | 2026-05-13 |
| `742db68d-a418-4a94-adcd-a27b407e252c` | connection | completed | 2026-05-05 |
| `62c1c2bf-aadc-4fb9-9860-877e334cd6a2` | single | completed | 2026-05-05 |
| `4c240d43-067c-43de-90e1-ed4e9a76da41` | compatibility | completed | 2026-05-01 |
| `ed8fbe29-51b9-4aa9-aab8-8d410d895ba5` | single | completed | 2026-05-01 |
| `db145a59-d463-4cf8-9611-1b2fb8e7e842` | connection | completed | 2026-04-21 |
| `283cb89b-d70b-4159-8d2b-3bb3176a03b5` | single | completed | 2026-04-21 |
| `abd7f926-923d-4cd1-887a-3a8dcb7f07f3` | detailed | completed | 2026-04-21 |

### Heiko — Reading mit falschem Geburtsdatum (separate Daten-Qualität!)
| Reading-ID | Typ | Status | Erstellt | Anmerkung |
|---|---|---|---|---|
| `234e68db-abae-4bb7-b17e-6fadbe5b64ae` | detailed | completed | 2026-03-15 | Geburtsdatum **1980-03-15** statt korrekt **1980-12-08** → eigenes Datenproblem. Gespeichert: „LAX of Eden". Vor Neugenerierung Geburtsdatum korrigieren. |

## Regenerierung — wichtiger Vorbehalt

Der reading-worker lädt in `fetchChartFromReading()` (`reading-worker/server.js:322–332`)
**zuerst** einen vorberechneten Chart aus `chart_data` bzw. `reading_data.chart_data`.
Da dort das alte falsche Kreuz steckt, würde eine reine Neugenerierung es
**wiederverwenden**.

**Empfohlenes Vorgehen pro Reading:**
1. `reading_data.chart_data` leeren (auf `null` setzen), damit der Recompute-Pfad greift.
2. Reading neu generieren → reading-worker ruft `connection-key:3000/api/chart/calculate`
   (jetzt gefixt) auf → liefert korrekt **RAX der Planung**.
3. Verifizieren, dass im neuen Text „Right Angle / RAX der Planung" steht und das
   Kreuz als persönliches Schicksal (nicht transpersonal) beschrieben wird.

SQL zum Leeren des vorberechneten Charts (nur die 8 Mirjana-Readings):

```sql
UPDATE public.readings
SET reading_data = reading_data - 'chart_data'
WHERE id IN (
 '30313d37-c7d6-490e-8491-eeb63af07abc','742db68d-a418-4a94-adcd-a27b407e252c',
 '62c1c2bf-aadc-4fb9-9860-877e334cd6a2','4c240d43-067c-43de-90e1-ed4e9a76da41',
 'ed8fbe29-51b9-4aa9-aab8-8d410d895ba5','db145a59-d463-4cf8-9611-1b2fb8e7e842',
 '283cb89b-d70b-4159-8d2b-3bb3176a03b5','abd7f926-923d-4cd1-887a-3a8dcb7f07f3'
);
```

> Hinweis: Neugenerierung verursacht Claude-API-Kosten und überschreibt den
> Reading-Text. Vor Ausführung bestätigen.
