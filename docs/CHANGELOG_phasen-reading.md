# CHANGELOG — Reading-Typ `phasen-reading`

**Datum:** 2026-04-28
**Branch:** `feature/phasen-reading`
**Code-Commit:** `d28ad02` (auf `Heiko888/Connection-Key-MCP-Server`)
**Server:** 138.199.237.34 (`reading-worker` Container, Port 4000)

## Was wurde hinzugefügt

Neuer Premium-Reading-Typ `phasen-reading`. Analysiert die ersten 90 Tage einer Beziehung in 3 Phasen — **Anziehung (Tag 1–30) / Reibung (Tag 31–60) / Wahrheit (Tag 61–90)**. 2-Pass-Generierung mit Claude Sonnet 4.6, ~5000 Wörter, 10 Sektionen.

## Geänderte Dateien

| Datei | Status |
|---|---|
| `reading-worker/templates/phasen-reading.txt` | NEU — 105 Zeilen, 10 Sektionen, Placeholder-getrieben |
| `reading-worker/server.js` | EDIT — 4 neue Funktionen + Routing-Eintrag in `pollForJobs()` |

## Neue Funktionen in `server.js`

| Funktion | Zeile (ca.) | Zweck |
|---|---|---|
| `calculatePhase(relationshipStartDate)` | 3123 | berechnet `currentDay`, `currentPhase`, `phaseLabel`. Post-90 wird als retrospektiv markiert |
| `generatePhasenReadingTwoParts({ userData, personAChart, personBChart, modelConfig, phaseInfo })` | 3151 | 2-Pass-Generation analog `generateConnectionReadingTwoParts`. Sektionen 1–5 + 6–10 via `generateTwoParts()` |
| `generatePhasenReflexionsfragen(...)` | 3238 | 5 Phase-spezifische Reflexionsfragen, JSON-Array-Output |
| `processPhasenReadingJob(job, reading)` | 3267 | Worker analog `processConnectionJob`. Lädt Charts, validiert Pflichtfelder, ruft Pipeline, speichert Reading |

## Routing

`pollForJobs()` wurde erweitert: bei `reading_type === 'phasen-reading'` wird `processPhasenReadingJob(job, reading)` aufgerufen. Position: **vor** dem Penta-Block, **nach** dem Sexuality-Block.

## Pflichtfelder im Job-Payload

| Feld | Erforderlich | Notiz |
|---|---|---|
| `birthdate`, `birthtime`, `birthplace` | ja | Person A |
| `birthdate2`, `birthtime2`, `birthplace2` | ja | Person B |
| `relationshipStartDate` | **ja** (YYYY-MM-DD) | bei Fehlen → Job `failed` mit klarer Fehlermeldung |
| `name`, `name2` | optional | Default: „Person A" / „Person B" |
| `reading_id` | optional | wenn gesetzt: `public.readings`-Update mit Progress + Resultat |

## Phasen-Logik

| Tag | Phase | Label |
|---|---|---|
| 1–30 | `phase-1-anziehung` | Phase 1 — Die Anziehung |
| 31–60 | `phase-2-reibung` | Phase 2 — Die Reibung |
| 61–90 | `phase-3-wahrheit` | Phase 3 — Die Wahrheit |
| >90 | `post-90` | Retrospektive Analyse (Beziehung läuft seit X Tagen) |

## 2-Pass-Generierung

- **Pass 1:** Sektionen 1–5 (Wo ihr steht, Anziehung, Reibung, Wahrheit, Composite-Detail), Mindestlänge 2500 Wörter
- **Pass 2:** Sektionen 6–10 (Strategien/Autoritäten, Konditionierung, Stärken, Empfehlungen, Muster), Mindestlänge 2500 Wörter
- **Reflexionsfragen:** parallel via `generatePhasenReflexionsfragen()`, JSON-Array mit 5 Fragen
- **Pipeline:** `runReadingPipeline(rawContent, personAChart)` validiert + korrigiert Output
- **Speichern:** `public.readings.reading_data` enthält `text`, `chart_data`, `chart_data2`, `phase_info`, `relationship_start_date`, `reflexionsfragen`, `_pipeline`

## Smoke-Test

| Test | Job-ID | Erwartet | Ergebnis |
|---|---|---|---|
| Positiv (alle Pflichtfelder, Tag 73, Phase 3) | `edb1e682-28cb-40d2-aaa4-b112b088bd0f` | `completed` in <120s | siehe Worker-Logs |
| Negativ (ohne `relationshipStartDate`) | `c5d0ec6e-b72f-4be0-af40-0e2465c459e7` | `failed` mit Fehlermeldung | ✅ `failed`, `"phasen-reading: relationshipStartDate ist Pflicht (Format YYYY-MM-DD)"` |

## Reading-Typen-Bestand nach dieser Änderung

24 Typen total (vorher 23). Das Template-Verzeichnis enthält jetzt 37 `.txt`-Files (vorher 36).

## Offene Punkte (außerhalb Worker-Code)

1. **Frontend-Formular** `PhasenReadingForm` mit DatePicker für `relationshipStartDate` (auf `frontend-coach` und/oder `frontend`)
2. **Stripe-Produkt** anlegen (Premium-Tier, vergleichbar mit `detailed`)
3. **User-Dashboard** Label/Icon für `phasen-reading` ergänzen
4. **PDF-Export** prüfen — vermutlich greift der existierende generische Reading-PDF-Renderer; ggf. `phase_info` im Header anzeigen
