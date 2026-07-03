# TRS-Wissensbasis — „The Real Secret – Master of Manifestation"

Bereinigte Markdown-Fassung des Human-Design-Kursmaterials **„The Real Secret –
Master of Manifestation"** (TRS). Quelle sind die PDF-Text-Importe unter
`production/knowledge/` und `production/knowledge_disabled/` (erzeugt mit
`integration/scripts/import-knowledge-folders.ps1` aus den Original-PDFs auf
`D:\videomateri\The Real Secret - Master of manifestation\`).

**Status:** strukturell geprüft und bereinigt — die **fachliche Inhaltsprüfung
steht noch aus** (siehe [PRUEFBERICHT.md](./PRUEFBERICHT.md)). Dieses Material
wird noch von keinem Dienst geladen; es ist die kuratierte Vorstufe für die
Integration in `reading-worker/knowledge/` bzw. die ck-agent-Wissensbasis.

## Inhalt

| Datei | Inhalt | Umfang |
|---|---|---|
| [typen.md](./typen.md) | Die 5 Typen (Generator, MG, Manifestor, Projektor ×2, Reflektor) | 6 Kapitel |
| [autoritaeten.md](./autoritaeten.md) | Die 7 Autoritäten | 7 Kapitel |
| [zentren.md](./zentren.md) | Die 9 Zentren, je definiert & offen | 18 Kapitel |
| [profile-linien.md](./profile-linien.md) | Die 6 Linien (Profile) | 6 Kapitel |
| [kanaele.md](./kanaele.md) | Die Kanäle — **34 von 36** (26-44 und 27-50 fehlen) | 34 Kapitel |
| [splits.md](./splits.md) | Splits (Definitionstypen) ausleben | 1 Kapitel |
| [pfeile-praxis.md](./pfeile-praxis.md) | Praxisaufgaben zu den 4 Pfeilen (Variablen) | 1 Kapitel |

### Tore (je Planet, alle 64 Tore pro Dokument)

| Datei | Planet/Punkt |
|---|---|
| [tore/bewusste-sonne.md](./tore/bewusste-sonne.md) | Bewusste Sonne (inkl. Gene Keys) |
| [tore/unbewusste-sonne.md](./tore/unbewusste-sonne.md) | Unbewusste Sonne — ⚠️ Tor 20 fehlt (63/64) |
| [tore/bewusste-erde.md](./tore/bewusste-erde.md) | Bewusste Erde |
| [tore/unbewusste-erde.md](./tore/unbewusste-erde.md) | Unbewusste Erde |
| [tore/bewusster-mond.md](./tore/bewusster-mond.md) | Bewusster Mond |
| [tore/unbewusster-mond.md](./tore/unbewusster-mond.md) | Unbewusster Mond |
| [tore/bewusster-merkur.md](./tore/bewusster-merkur.md) | Bewusster Merkur |
| [tore/unbewusster-merkur.md](./tore/unbewusster-merkur.md) | Unbewusster Merkur |
| [tore/bewusster-nordknoten.md](./tore/bewusster-nordknoten.md) | Bewusster Nordknoten |
| [tore/unbewusster-nordknoten.md](./tore/unbewusster-nordknoten.md) | Unbewusster Nordknoten |
| [tore/bewusster-suedknoten.md](./tore/bewusster-suedknoten.md) | Bewusster Südknoten |
| [tore/unbewusster-suedknoten.md](./tore/unbewusster-suedknoten.md) | Unbewusster Südknoten |
| [tore/bewusster-pluto.md](./tore/bewusster-pluto.md) | Bewusster Pluto |
| [tore/reflexionsfragen.md](./tore/reflexionsfragen.md) | Reflexionsfragen & Zusammenfassung |

Jedes Tore-Dokument hat genau eine `## Tor N`-Überschrift pro Tor (validiert).

## Durchgeführte Bereinigung

- Encoding-Fehler (Mojibake `Ã¼` → `ü`) entfernt (steckten nur in den Import-Headern)
- Typografische Ligaturen aufgelöst (`ﬀ ﬁ ﬂ` → `ff fi fl`, ~8.000 Stellen)
- PDF-Zeilenumbrüche mitten im Satz geheilt (Wrap-Heuristik)
- `⸻`-Trenner → Markdown-`---`, Tab-Bullets `•` → Markdown-Listen (~18.800 Stellen)
- Einheitliche Kapitel-Überschriften, Tore-Anker sequenziell validiert

Regeneration: `python3 build_trs_md.py` (Skript liegt als
[`tools/build_trs_md.py`](../../tools/build_trs_md.py) im Repo).
