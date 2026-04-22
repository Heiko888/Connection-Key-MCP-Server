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

### fix(docker-compose): content-topics Volume-Mount
- Commit: `9523413`
- Latenter Bug aus Commit f7a8f91 (telegram-topics-json-migration):
  server.js las via `path.join(__dirname, '../content-topics/...')` aus drei
  JSON-Dateien am Repo-Root. Der reading-worker Build-Kontext ist aber nur
  `./reading-worker`, sodass der Ordner nie in den Container kam. Alter
  Container lief nur, weil sein Image noch vor f7a8f91 gebaut war.
- Fix: `./content-topics:/content-topics:ro` Volume-Mount. Bonus:
  JSON-Aenderungen wirken jetzt ohne Rebuild.

### fix(reading-worker): Block 2.5 — Composite-Klassifikation auf Block-2-Doktrin
- Commits: `a1ad462`, Merge `f309c87`
- Datei neu: `reading-worker/lib/composite-classification.js` (Port von
  `connection-key/lib/astro/composite.js`).
- Datei neu: `reading-worker/tests/composite-classification.test.js`
  (29 Tests, alle gruen).
- Datei geaendert: `reading-worker/server.js` (+125 / -59).
- Kontext: Block 2 am 2026-04-21 hatte die Klassifikation in connection-key
  auf vier gegenseitig ausschliessende Kategorien umgestellt (electromagnetic,
  compromise, companionship, parallel). reading-worker hatte aber eine
  eigene Duplikat-Klassifikation (`classifyChannel` in server.js:3768) mit
  den alten Labels EM/Goldader/Parallelenergie. Vier Pfade (Connection,
  HD-Job, Streaming, Sexuality) produzierten deshalb weiterhin die alten
  Labels im Prompt — unabhaengig davon dass connection-key intern die
  neue Klassifikation geliefert hatte.
- Fix:
  - `classifyChannel()` geloescht.
  - `analyzeConnectionDynamics()` nutzt jetzt `classifyTwoPersonChannels()`
    aus der neuen lib.
  - `dynamics`-Objekt um neue Felder erweitert: `compromise_channels`,
    `companionship_channels`, `parallel_channels`. `activatedChannels[].type`
    jetzt `electromagnetic | compromise | companionship | parallel`.
  - Legacy-Felder (`dominanz_channels`, `kompromiss_channels`) bleiben
    aus Rueckwaertskompatibilitaet befuellt: dominanz = companionship +
    compromise (alt-Goldader-Semantik), kompromiss = parallel (alt-Name
    war historisch falsch).
- Container rebuilt, Health-Check OK.

### feat(reading-worker): Baustein 4 — deterministischer Fakten-Block
- Commits: `4ef43f3`, Merge `2405c3c`
- Datei neu: `reading-worker/lib/facts-builder.js` (~350 Zeilen).
- Datei neu: `reading-worker/tests/facts-builder.test.js` (27 Tests, alle gruen).
- Datei geaendert: `reading-worker/server.js` (Import + Strict-Mode-Flag).
- Kontext: Plan v2.0 / Baustein 4. `buildChartInfo()` lieferte bisher einen
  freien Chart-Block in dem das LLM Tor-Namen, Kanal-Namen, Planeten-
  Positionen rekonstruieren musste — Quelle der Halluzinationen.
- Fix: `buildFactsBlock()` liefert jetzt einen strikt formatierten deutschen
  Fakten-Block:
  - Kern-Daten + Inkarnationskreuz mit 4 Gates + deutschen Namen + Keywords
  - Alle 9 Zentren (DEFINIERT / offen)
  - Kanaele mit deutschem Namen aus chartData.channels[i].name_de
  - Tore mit deutschem Namen + Keyword + Source-Tag [Persoenlichkeit /
    Design / beide]
  - Alle 15 Planeten-Positionen
  - Composite-Sektion (electromagnetic / compromise / companionship / parallel)
  - Konditionierungs-Matrix (nur zentrum-zu-zentrum gleichen Typs)
  - Transit-Whitelist bei Transit/Jahres/Tagesimpuls
  - ERLAUBTE ERWAEHNUNGEN: Liste aller erlaubten Gates/Kanaele/Planeten
  - VERBOTEN-Sektion (kein Goldader, keine cross-center Konditionierung,
    keine halluzinierten Planeten-Positionen)
  - WAHRHEITSQUELLE-Instruktion am Ende
- Quelle der deutschen Tor-Namen: `reading-worker/data/incarnation_crosses.json`
  (`gate_names`-Block, 64 Eintraege).
- Feature-Flag: `READING_STRICT_MODE` (default `true`). Auf `false` setzen
  → altes Verhalten zurueck.
- Smoke-Test gegen echten Chart (Generator 3/5 Sacral): 2950 Zeichen alt
  → 4344 Zeichen neu. Kanaele jetzt deutsch ("Der Pulsschlag", "Akzeptanz",
  "Strukturierung"), Tore deutsch mit Keywords ("Details (Praezision und
  Genauigkeit)", "Vollendung (Zyklen abschliessen)"), Source-Tags
  korrekt.
- Bekannte Einschraenkung: Inkarnationskreuz-Kombi-Themen wie "RAX der
  Details / Growth" bleiben halb-deutsch, weil CROSS_THEMATIC_DE in
  connection-key/chartCalculation.js nicht alle Kombi-Namen abdeckt.
  Separater Folge-Fix.

### feat(reading-worker): Composite-Block + Konditionierungs-Matrix in Connection-Prompt
- Commit: `5bf9a64`
- Baustein-4-Follow-up. `generateConnectionReadingTwoParts` (Connection /
  Relationship / Compatibility) haengt jetzt im Strict-Mode den
  deterministischen Composite-Block + Konditionierungs-Matrix an die
  Prompts beider Teile.
- Vorher fehlte der Composite-Block bei Connection-Readings, weil
  `buildChartInfo()` ohne `opts.composite` aufgerufen wurde.
- Sektion-4-Prompt-Text aktualisiert: "Aktivierte Kanaele nach
  Block-2-Klassifikation" statt "EM / Goldader / Stabile Parallelenergie".
- Sektion-2-Konditionierung-Anweisung: nur zentrum-zu-zentrum gleichen Typs.
- Sexuality, ChannelAnalysis und Penta nutzen ad-hoc-Formatter statt
  `buildChartInfo` und bekommen den Composite-Block noch nicht — separater
  Folge-Commit.

### feat(knowledge): Baustein 6 — HD-Regel-Whitelist
- Commits: `d132875`, Merge `5c08e42`
- Datei neu: `reading-worker/knowledge/hd-regeln-strikt.txt` (~6.5k Zeichen).
- Datei neu: `reading-worker/tests/hd-regeln-loading.test.js` (28 Tests).
- Datei geaendert: `reading-worker/server.js` (`ALWAYS_KNOWLEDGE_KEYS` jetzt
  `['hd-regeln-strikt']` im Strict-Mode — Geruest aus d13b27b ist aktiv).
- Inhalt: 11 Regel-Bereiche als verbindliche, nicht-verhandelbare HD-Mechanik:
  Konditionierung (nur zentrum-zu-zentrum gleichen Typs), Kanaele (beide
  Gates noetig), Verbindungstypen (4 Kategorien, "Goldader" abgeschafft),
  Inkarnationskreuze (RAX/LAX/JUX, Namen aus Lookup nie raten),
  Planeten-Positionen (exakt aus Fakten-Block), Kehlkopf-Gates (genau 11),
  Zentren (genau 9), Autoritaeten (deterministische Hierarchie),
  Typen (genau 5), Profile (genau 12), Pflichten aus dem Fakten-Block.
- Pro Regel: Negativ-Beispiele + Positiv-Beispiele.
- Wird im Strict-Mode in jeden fachlichen Reading-Prompt vor allen anderen
  Knowledge-Dateien geladen.
- Live verifiziert: knowledge: 30 (war 29), Bundle fuer 'detailed'
  beginnt jetzt mit hd-regeln-strikt, 184k Zeichen total.
- Token-Kosten: ~1.6k zusaetzliche Input-Tokens pro Reading-Prompt.
  Mit Prompt-Caching vernachlaessigbar.

### feat(reading-worker): Baustein 7 — sequenzielle 2-Pass-Generierung
- Commits: `cb6732c`, Merge `...`
- Datei neu: `reading-worker/tests/sequential-generation.test.js` (10 Tests).
- Datei geaendert: `reading-worker/server.js` (+41 Zeilen Helper
  `injectPart1Context` + sequentielle Branches in `generateDetailedReading
  TwoParts` und `generateTwoParts`).
- Kontext: Teil 1 und Teil 2 liefen bisher parallel via Promise.all —
  wussten nichts voneinander. Daraus entstanden Widersprueche wie
  "Kanal 3-60 bei A vollstaendig" (Teil 1) vs. "Kanal 3-60 elektromagnetisch"
  (Teil 2).
- Fix: Im Strict-Mode laeuft Teil 2 sequentiell nach Teil 1 und bekommt
  dessen Text als Kontext-Praefix mit expliziter Anti-Widerspruchs-
  Anweisung ("Widerspreche KEINER Aussage aus Teil 1", "Verbindungstyp-
  Kategorien bleiben unveraendert").
- Performance: Detailed + Connection sind jetzt ~2x langsamer (160s statt 80s).
  Der in Preflight gesetzte BullMQ `lockDuration=480s` faengt das auf.
- Tests: 10/10 gruen.

### fix(chart-engine): Inkarnationskreuz-Kombi-Themen vollstaendig auf Deutsch
- Commit: `25a9d3f`
- Datei: `connection-key/lib/astro/chartCalculation.js`
- Neue Tabelle `JUXTAPOSITION_NAMES_DE` (64 Tor-Themen auf Deutsch).
- Bei unbekannten Kreuz-Kombinationen (kein Match in `RAX_LAX_MAP`) wird
  der Name aus `JUXTAPOSITION_NAMES_DE[pSun] / [dSun]` zusammengesetzt
  statt halb-deutsch zu bleiben.
- Vorher: "RAX der Details / Growth". Jetzt: "RAX der Details / Vollendung".

### refactor(reading-worker): Sexuality + ChannelAnalysis auf buildChartInfo
- Commit: `30bed72`
- Beide Pfade nutzten ad-hoc `formatChartCenters/Channels/Gates` statt
  `buildChartInfo` und bekamen weder Fakten-Block noch Composite-Block.
- Neuer Helper `buildTwoPersonCompositeBlock(chartA, chartB, nameA, nameB)`
  — DRY-Refactor der Inline-Logik aus `generateConnectionReadingTwoParts`.
- Sexuality: `userMessage` nutzt jetzt `buildChartInfo(chartA/B)` +
  Composite-Block.
- ChannelAnalysis: dito. Dead Code entfernt (CHANNEL_NAMES_MAP mit 35
  Zeilen, `getChName`, `emText`).
- Penta bleibt: benoetigt groesseren Refactor (Template-Pfad mit
  `chartData: null`), separater Folge-Commit.

### fix(pipeline): Validator CHECK 10-14 + Corrector REGEL 10-14
- Commit: `e939ca6`
- Baustein 3 komplett (Plan v2.0). Ergaenzt CHECK 7-9 um 5 weitere:
  - **CHECK 10** Cross-Pass-Widerspruch: Fakt in Teil 1 anders als in Teil 2.
  - **CHECK 11** HD-Regel-Konformitaet: Abgleich gegen `hd-regeln-strikt.txt`.
  - **CHECK 12** Goldader-Begriff: simpler String-Check (major).
  - **CHECK 13** Numerische Behauptungen: Zahlen-Abgleich + Beleg-Pflicht (major).
  - **CHECK 14** Whitelist-Verstoss: Gates/Kanaele ausserhalb der Whitelist.
- Corrector-Regeln 10-14 spiegeln die Checks. Whitelist-Verstoesse werden
  geloescht (kein Ersatz).

### feat(monitoring): Baustein 8 — reading_validation_log + Health-Dashboard
- Commits: Merge `...`
- Migration: `2026042201_reading_validation_log.sql` (applied auf
  Supabase-Projekt `connection-key-v3` = `wdiadklhvhlndnjojrfu`).
- Tabelle `public.reading_validation_log`: id, reading_id (ohne FK),
  reading_type, template, validated_at, error_count, errors (JSONB),
  correction_applied, pre/post_length, chart_fingerprint, model_used,
  duration_ms, strict_mode, sampled_for_review, reviewed_at, verdict.
- RLS: Service-Role insert, Coaches select + review.
- `reading-pipeline.js`: `setPipelineSupabase()`-Setter, `chartFingerprint()`
  SHA256, `logValidationRun()`-Helper. Jeder Pipeline-Lauf schreibt einen
  Eintrag. Sampling-Rate 1/20 (via `REVIEW_SAMPLING_RATE`).
- Dashboard-Endpoints auf reading-worker:
  - `GET /admin/reading-health?days=7` — Aggregate nach Typ / CHECK,
    Fehlerrate, pending_reviews.
  - `GET /admin/reading-health/recent?limit=20&only_errors=true` — letzte
    Laeufe tabellarisch.
- Frontend-Coach-UI unter `/admin/reading-health` nicht Teil dieses
  Commits (.167 separates Repo) — die JSON-Endpunkte sind direkt
  einbindbar.

### Baustein-Uebersicht Plan v2.0 — STATUS
| Baustein | Status |
|---|---|
| 1 Chart-Engine-Stammdaten | ✅ (21.4.) |
| 2 Composite-Klassifikation (connection-key) | ✅ (21.4.) |
| 2.5 Composite-Klassifikation (reading-worker) | ✅ |
| 3 Validator + Corrector (CHECK 7-14 + REGEL 7-14) | ✅ |
| 4 Deterministischer Fakten-Block | ✅ |
| 4 Composite-Block-Integration (Connection) | ✅ |
| 5 Fakten-Whitelist als Prompt-Addendum | ✅ (durch Baustein 4 abgedeckt) |
| 6 HD-Regel-Whitelist | ✅ |
| 7 Sequenzielle 2-Pass-Generierung | ✅ |
| 8 Monitoring + Dashboard | ✅ |
| Extra: CROSS_THEMATIC_DE vollstaendig | ✅ |
| Extra: Sexuality + ChannelAnalysis Refactor | ✅ |

### Ausstehend (nicht Plan-v2.0-kritisch)
- Penta auf `buildChartInfo` umstellen (braucht userData.memberCharts-Composite).
- Frontend-Coach UI `/admin/reading-health` fuer Dashboard-Rendering.
- Frontend-UI auf .167 fuer `parallel`-Kategorie-Rendering (Block-2-UI-Follow-up).
- End-to-End-Smoketest gegen echtes Reading mit Review-Queue fuellen.
- Deployment/Push nach origin/main (24 Commits ahead of origin).

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
