# Changelog — mcp-connection-key (Server .138)

Chronologische Liste wichtiger Server-Aenderungen, ergaenzend zu den Commit-Messages.
Format: `## YYYY-MM-DD` Abschnitt pro Tag, darunter ein Block pro Fix/Feature.

---

## 2026-04-21 — Reading-System Fehlerbehebung (Connection / Penta / Chart)

Drei zusammenhaengende Bloecke, jeder auf eigenem Feature-Branch committed:
`fix/chart-engine-stammdaten`, `fix/composite-connection-types`,
`fix/reading-pipeline-connection-checks`. Alle drei werden in `main` gemergt.

### fix(chart-engine): deutsche Kanal- und Inkarnationskreuz-Namen im Response
- Commit: `0df47b6`
- Datei: `connection-key/lib/astro/chartCalculation.js`
- Kontext: Reading-Texte enthielten halluzinierte deutsche Namen
  (`Das Vergessen` fuer 13-33, `LAX der Unschuld` statt `LAX der Bildung`).
  Die Strings waren NICHT im Code falsch — `CHANNEL_NAMES` liefert korrekt
  `Prodigal` fuer 13-33, `KNOWN_CROSSES` hat `Education` fuer 9-16-37-40.
  Root-Cause war die LLM-Uebersetzungs-Freiheit bei fehlenden deutschen Mappings.
- Fix: zwei neue Tabellen + Response-Erweiterung.
  - `CHANNEL_NAMES_DE` — 36 Kanaele, Quelle `reading-worker/knowledge/channels-gates.txt`
  - `CROSS_THEMATIC_DE` — alle Themen aus RAX_LAX_MAP / JUXTAPOSITION_NAMES
  - `chart.channels[i].name_de`
  - `chart.incarnationCross.name_de` + `thematicName_de` + `fullName_de`
- Folge: Reading-Templates koennen erzwingen `nur name_de aus chartData`,
  keine freie Uebersetzung mehr.
- Rollback: `git revert 0df47b6`

### fix(composite): praezise Klassifikation der Verbindungstypen
- Commit: `2f8b953`
- Dateien: `connection-key/routes/chart.js`, `connection-key/lib/astro/composite.js` (neu),
  `connection-key/test/composite-classification.test.js` (neu)
- Kontext: Die alte Composite-Logik im `/api/chart/composite`-Endpoint war in
  allen vier Kategorien gleichzeitig fehlerhaft:
  - `electromagnetic` feuerte bei einseitig vollstaendigem Kanal
  - `compromise` nutzte `aCount > 1 || bCount > 1` statt richtiger HD-Doktrin
  - `companionship` und `compromise` konnten gleichzeitig auftreten
  - `parallel` fehlte als Kategorie
  - `HD_CHANNELS` enthielt nur 35 Kanaele (10-34 fehlte)
- Fix: Logik in `lib/astro/composite.js` als pure Funktion `classifyCompositeConnections`
  ausgelagert. Kategorien gegenseitig ausschliessend, auf n Personen verallgemeinert
  (Penta-tauglich).
  - `parallel`: ≥ 2 Personen haben den Kanal vollstaendig (NEU)
  - `companionship`: 1 Person komplett, sonst niemand Gates
  - `compromise`: 1 Person komplett, andere Partial am einzelnen Gate
  - `electromagnetic`: niemand komplett, ≥ 2 Personen decken beide Gates ab
  - `dominance`: ALIAS fuer compromise bei `persons.length === 2` (deprecated)
- Response-Shape rueckwaertskompatibel + reicher:
  - `connections.electromagnetic[i].personsByGate`
  - `connections.compromise[i].completePerson / partialPersons / partialDetails`
  - `connections.companionship[i].completePerson`
  - `connections.parallel[i].completePersons`
- Bonus-Fix: `HD_CHANNELS` in `routes/chart.js` 10-34 ergaenzt.
- Tests: 15/15 gruen (12 Faelle aus jani-feedback + Exklusivitaet + dominance-Alias).
- Rollback: `git revert 2f8b953`

### fix(pipeline): drei neue Validator-Checks fuer Verbindungstypen + Halluzinationen
- Commit: (dieser Commit)
- Dateien: `reading-worker/templates/validate-reading.txt`,
  `reading-worker/templates/correct-reading.txt`
- Kontext: Validator hatte nur 6 Checks (Zentren, Tor-Mapping, Inkarnationskreuz,
  Tore-Vollstaendigkeit, Pronomen). Keine Pruefung gegen Verbindungstypen im
  composite, keine Pruefung gegen halluzinierte Planeten-Positionen.
- Neue Checks:
  - **CHECK 7** — Verbindungstyp-Labels gegen `chartData.composite.connections`.
    Fehler wenn EM fuer einseitig vollstaendigen Kanal, Parallel ohne 2+ komplette,
    Kompromiss ohne komplette Person etc.
  - **CHECK 8** — halluzinierte Planeten-Positionen strikt blocken (Mond/Chiron/
    Lilith/Knotenachse + alle weiteren Planeten in Gate X).
  - **CHECK 9** — Begriffs-Widersprueche innerhalb eines Abschnitts, inkl.
    Kanaele die laut chartData gar nicht aktiv sind.
- Neue Corrector-Regeln:
  - **REGEL 7** — falsche Labels durch korrekten Typ aus chartData ersetzen.
  - **REGEL 8** — halluzinierte Planeten-Aussagen KOMPLETT LOESCHEN (kein Ersatz).
  - **REGEL 9** — Widersprueche auf einheitliche Formulierung zusammenfuehren.
- Ref: jani-feedback 2026-04-21, Block 3.

### Ausstehend (nicht Teil dieser Commits)
- Frontend-UI auf `.167` (`frontend-coach/components/dating/*`, `/resonance/*`, `/penta/*`):
  Neuen `parallel`-Typ rendern, Penta-3er-Harmonie vor 2er priorisieren, Labels
  an die neuen Kategorien anpassen. Muss im anderen Repo als eigener Commit.
- Kein Live-Reading-Smoketest gegen Lisi's Chart durchgefuehrt — kein Test-Datensatz
  verifiziert. Sobald Lisi's Birthdata + Partner-Birthdata vorliegen, ein
  End-to-End-Reading fahren und die 4 Checkpunkte aus der Anweisung (Kanal 13-33
  deutsch, LAX der Bildung, keine Mond-in-Gate-Halluzinationen, kein einseitiger
  Kanal unter EM) manuell verifizieren.

---

*Auftraggeber jani-feedback 2026-04-21. Alle Fixes in 3 separaten Commits
auf eigenen Feature-Branches. Merge nach `main` erfolgt nach manuellem
End-to-End-Test gegen ein echtes Reading.*
