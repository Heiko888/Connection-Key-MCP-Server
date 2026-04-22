# Changelog — mcp-connection-key (Server .138)

Chronologische Liste wichtiger Server-Aenderungen, ergaenzend zu den Commit-Messages.
Format: `## YYYY-MM-DD` Abschnitt pro Tag, darunter ein Block pro Fix/Feature.

---

## 2026-04-22 — Pre-flight vor Bausteinen 4-7 + Doku

Ein Branch `chore/blueprint-sections-knowledge` mit drei Commits, in `main` gemergt.
Zweck: Git mit Production-Zustand synchronisieren + Infrastruktur-Gerüst für
die kommenden Prompt-seitigen Fixes (Fakten-Block, Fakten-Whitelist, HD-Regeln,
Sequenzielle Generierung).

### chore(reading-worker): Blueprint-Sections + Knowledge aus Production committen
- Commit: `ed905ae`
- Dateien: 21 files, +3240 / -38
- Kontext: Knowledge-Files + sectionParser/Writer + Migrations liefen seit
  Wochen live im Container, waren aber nie nach Git geflossen. Git war
  hinter Production.
- Committed: 8 Knowledge-Files (business/career/emotions/kinder/parenting/
  spiritual + penta-communication-dynamics.md + penta-strategy-impulses.md),
  penta-knowledge.txt-Update (+325 Z "Die 9 Zentren im Penta-Kontext"),
  sectionParser.js + sectionsWriter.js, 3 Migrations (client_profiles +
  reading_sections + profiles.active_gates), backfillSections-Scripts,
  rls-smoke.sql, sectionParser.test.js, penta-communication.txt Template.
- .gitignore: .claude/, .agents/, *.bak, *.backup ergaenzt.
- Geloescht: generateReading.js.backup, production/agent-social.js.bak.
- Keine Verhaltensaenderung, nur Git-Sync.

### docs: komplette Reading-System-Dokumentation
- Commit: `9795806`
- Datei: `docs/READING_SYSTEM.md` (1377 Zeilen)
- Inhalt: 18 Abschnitte + 3 Anhaenge. Datenfluss, HTTP-Endpunkte, BullMQ-
  Queues, Modell-Config, Prompt-Aufbau (`buildChartInfo`, `buildKnowledgeText`,
  `generateReading`), Two-Pass-Generierung, Validator + Corrector
  (kompletter Prompt wortgenau in Anhang A/B), Chart-Engine, Composite-
  Klassifikation, 35 Templates tabelliert, 27+ Knowledge-Dateien, Section-
  Parser/Writer, Psychology-Worker, V4-Job-Flow, Frontend-Integration,
  Supabase-Schema, offene Punkte.
- Stichtag: Commit `65ab2ed`, 2026-04-22. Zeilennummern muessen bei
  Refactorings nachgezogen werden.

### fix(reading-worker): BullMQ lockDuration + Knowledge-Loading-Geruest
- Commit: `d13b27b`
- Datei: `reading-worker/server.js` (+35 / -16)
- Kontext: Vorbereitung fuer Bausteine 6 + 7 (HD-Regel-Whitelist und
  sequentielle Generierung).
- Fix 1 — BullMQ `lockDuration`:
  - Bisher kein Lock gesetzt -> BullMQ-Default 30s.
  - 2-Pass-Detailed (~360s) + Pipeline (~120s) reisst den Lock, sodass
    ein zweiter Worker den laufenden Job uebernommen haette.
  - `workerOptions()`-Factory an alle 5 Workers (V3, V4, Connection,
    Penta, Multi-Agent). Default 480_000 ms, via ENV
    `WORKER_LOCK_DURATION_MS` ueberschreibbar.
- Fix 2 — Knowledge-Loading:
  - `ALWAYS_KNOWLEDGE_KEYS` Array in `buildReadingKnowledge()` eingefuehrt
    (aktuell leer; Baustein 6 traegt dort `hd-regeln-strikt` ein).
  - Dedup-Logik: wenn Key doppelt, wird er nur einmal eingefuegt.
  - Fallback-Bundle in die Haupt-Funktion konsolidiert.
  - `buildKnowledgeText()` Deep-Fallback-Defaults: 8->20 Eintraege,
    1000->5000 Zeichen.

### Ausstehend
- Container-Neustart fuer reading-worker (notwendig, damit lockDuration
  wirkt). `docker compose up -d --build reading-worker`.
- Bausteine 4-7 + Monitoring (Plan v2.0).
- Frontend-UI auf .167 fuer `parallel`-Kategorie-Rendering (Block-2-Follow-up,
  anderes Repo).

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
