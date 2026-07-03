# Prüfbericht — TRS-Wissensbasis (2026-07-03)

Prüfung und Aufbereitung des importierten Kursmaterials „The Real Secret –
Master of Manifestation" aus `production/knowledge/` +
`production/knowledge_disabled/` in bereinigte Markdown-Dateien unter
`knowledge/trs/`.

## 1. Vollständigkeitsmatrix (strukturell geprüft)

| Thema | Soll | Ist | Status |
|---|---|---|---|
| Typen | 5 | 5 (+1 Projektor-Bonus) | ✅ vollständig |
| Autoritäten | 7 | 7 | ✅ vollständig |
| Zentren (definiert/offen) | 9 × 2 = 18 | 18 | ✅ vollständig |
| Linien/Profile | 6 | 6 | ✅ vollständig |
| Kanäle | 36 | **34** | ⚠️ **26-44 und 27-50 fehlen** |
| Tore — bewusste Sonne (Gene Keys) | 64 | 64 | ✅ |
| Tore — unbewusste Sonne | 64 | **63** | ⚠️ **Tor 20 fehlt** |
| Tore — bewusste/unbewusste Erde | je 64 | je 64 | ✅ |
| Tore — Mond (bewusst/unbewusst) | je 64 | je 64 | ✅ |
| Tore — Merkur (bewusst/unbewusst) | je 64 | je 64 | ✅ |
| Tore — Nordknoten (bewusst/unbewusst) | je 64 | je 64 | ✅ |
| Tore — Südknoten (bewusst/unbewusst) | je 64 | je 64 | ✅ |
| Tore — Pluto (bewusst) | 64 | 64 | ✅ |
| Splits | 1 Dok. | 1 | ✅ |
| Pfeile (Praxisaufgaben) | 1 Dok. | 1 | ✅ |

Kanal-Nummern wurden gegen die kanonische 36er-Liste geprüft — alle 34
vorhandenen sind gültige HD-Kanäle, keine Falschnummern.

## 2. Gefundene und behobene Mängel

| Mangel | Umfang | Behebung |
|---|---|---|
| Mojibake (`AutoritÃ¤t`, `fÃ¼nf`, `KanÃ¤le`) | 6 Stellen, nur Import-Header | Header ersetzt |
| Typografische Ligaturen (`ﬀ ﬁ ﬂ`) | ~8.200 Stellen | zu `ff fi fl` aufgelöst |
| PDF-Zeilenumbrüche mitten im Satz | durchgängig | Wrap-Heuristik (Zeile endet mit Leerzeichen ohne Satzende → verbunden) |
| `⸻`-Trennzeichen | ~9.600 | Markdown-`---` |
| Tab-Bullets (`\t •\t`) | ~18.800 | Markdown-Listen (`- `) |
| Uneinheitliche/fehlende Tor-Überschriften | 13 Dokumente, 4 verschiedene Titelformate | Sequenzielle Anker: genau eine `## Tor N`-Überschrift je Tor, validiert (0 Duplikate, 0 Fehl-Anker) |

## 3. Was NICHT geprüft wurde (offene Punkte)

1. **Fachliche Inhaltsprüfung:** Die inhaltliche Korrektheit der HD-Aussagen
   (Zentren-Zuordnungen einzelner Tore, Hexagramm-Referenzen, Gene-Keys-Triaden)
   wurde nur stichprobenartig geprüft (z. B. Tor 1 → G-Zentrum ✅). Eine
   systematische Fachprüfung durch Heiko steht aus.
2. **Fehlendes Material beschaffen:** Kanäle 26-44 & 27-50 und Tor 20
   (unbewusste Sonne) fehlen bereits im PDF-Quellordner — bitte im
   Original-Kursmaterial (`D:\videomateri\…`) nachsehen und nachliefern.
3. **Bonus-/Kurs-Ebenen:** Nur „Master of Manifestation" wurde importiert;
   „Beginner", „Expert" und „Professional of Manifestation" sind nie
   importiert worden.
4. **Keine Integration:** `knowledge/trs/` wird von keinem Dienst geladen.
   Nächster Schritt wäre die Anbindung an `reading-worker/knowledge/`
   (Knowledge-Agent liest es dann automatisch mit) und/oder das Befüllen der
   151 Platzhalter in `ck-agent/data/`.

## 4. Prüfmethodik

- Struktur: PDF-Sektionen je Quelldatei extrahiert, gegen Soll-Listen
  (5 Typen, 7 Autoritäten, 9×2 Zentren, 6 Linien, kanonische 36 Kanäle,
  64 Tore je Planet) abgeglichen.
- Tore-Anker: Erste Erwähnung je Tor in aufsteigender Reihenfolge verifiziert
  (alle Quelldokumente behandeln die Tore strikt sequenziell 1→64).
- Nach der Konvertierung: 0 Artefakt-Reste (⸻/Ligaturen/•/Mojibake) über alle
  21 Markdown-Dateien, Überschriften-Validierung je Tore-Datei.
