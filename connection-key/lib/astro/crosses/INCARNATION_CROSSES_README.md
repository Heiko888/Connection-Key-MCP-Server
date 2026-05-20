# Inkarnationskreuze — Master Data (v3.1)

`incarnation_crosses_master.json` ist die **Single Source of Truth** fuer alle
Human-Design-Inkarnationskreuze. Konsolidiert aus drei Quellen + Q2-Fallback-
Themen fuer Konstellationen ohne Q3-Pendant.

## Quellen (Vorrangregel: Q3 > Q2 > Q1)

| Quelle | Pfad | Rolle |
|--------|------|-------|
| **Q3** | `reading-worker/knowledge/incarnation-cross.txt` | Master fuer **Namen, Lebensthemen, Beschreibungen** (16 RAX + 32 LAX + 64 JUX) |
| **Q2** | `reading-worker/data/incarnation_crosses.json` | Master fuer **Position-Keys** + FULL-Eintraege als Q2-Fallback-Themen, wenn Q3 keinen Eintrag fuer die Gate-Konstellation hat |
| **Q1** | `connection-key/lib/astro/chartCalculation.js` | Nur Diagnose. `OPPOSITE_GATES` uebernommen. Daten nicht uebernommen. |

## Versionen

| Version | Aenderung |
|---------|-----------|
| 3.0 | Initiale Konsolidierung Q3+Q2 mit 4 Permutationen pro Theme. |
| 3.1 | **8 Permutationen pro Theme** (zusaetzlich P↔D-Swap) gegen umgekehrte Achsenkonventionen. **Q2-Fallback-Themen** mit `source="q2_fallback"`. **`pd_axis_q2_validated`**-Annotation pro RAX/LAX-Theme. |

## Schema

```jsonc
{
  "_meta": {
    "version": "3.1",
    "generated_at": "...",
    "total_themes_unique": 136,        // 112 Q3-Master + 24 Q2-Fallback
    "themes_q3_master": 112,
    "themes_q2_fallback": 24,
    "permutations_per_theme": 8,
    "pd_axis_validated_count": 9,      // Themen mit Q2-bestaetigter P-Pair
    "pd_axis_unvalidated_count": 39    // Themen ohne FULL-Q2-Eintrag gleichen Namens
  },
  "gate_polarities": { "1": 2, "2": 1, "3": 50, ... },
  "themes": {
    "rax_sphinx": {
      "id": "rax_sphinx", "type": "Right Angle", "type_short": "RAX",
      "name_de": "Sphinx", "name_en": "Sphinx",
      "full_name_de": "RAX der Sphinx",
      "full_name_en": "Right Angle Cross of the Sphinx",
      "gates": [1, 2, 7, 13],
      "personality_pair": [1, 2], "design_pair": [7, 13],
      "life_theme": "...", "description": "...",
      "source": "q3_master",
      "axis_source": "q2",                       // q2 | q3_header | polarity_pairs
      "pd_axis_q2_validated": true,              // true = FULL-Q2 bestaetigt P-Pair
      "q2_personality_pair_observed": "1-2"      // optional
    },
    "q2_industriousness": {
      "id": "q2_industriousness", "type": "Q2-Fallback", "type_short": "Q2",
      "name_de": "Industriousness", "name_en": "Industriousness",
      "full_name_de": "Sacral-Kraft, Hingabe und Beitrag",
      "full_name_en": "Cross of Industriousness",
      "gates": [14, 8, 29, 30],
      "personality_pair": [14, 8], "design_pair": [29, 30],
      "life_theme": "...", "description": "...",
      "source": "q2_fallback",
      "q2_key": "14-8-29-30"
    }
  },
  "lookup": {
    "1-2-7-13":     ["rax_sphinx", "jux_listener"],
    "25-46-10-15":  ["rax_vessel_of_love", "jux_extremes",
                     "jux_innocence", "jux_serendipity",
                     "q2_healing_10_15_25_46"]
  }
}
```

### Felder

* **`source`**: `q3_master` (aus Knowledge-Text) oder `q2_fallback` (aus Q2-FULL-Eintrag ohne Q3-Pendant).
* **`type_short`**: `RAX` | `LAX` | `JUX` | `Q2`.
* **`pd_axis_q2_validated`** (nur RAX/LAX): `true` wenn ein FULL-Q2-Eintrag mit demselben Namen die P-Pair bestaetigt.
* **`axis_source`** (nur RAX/LAX): woher die P/D-Achse kommt (`q2` | `q3_header` | `polarity_pairs`).
* **`q2_key`** (nur Q2-Fallback): der Original-Q2-Key, aus dem das Theme generiert wurde.

### Q2-Fallback-IDs

* Ueblich: `q2_<slug(name)>` (z. B. `q2_industriousness`).
* Bei Namenskollision mit einem Q3-Master-Theme, das andere Gates hat:
  `q2_<slug(name)>_<sortierte_gates>` (z. B. `q2_eden_6_11_12_36`).

## Lookup-Multimap & Disambiguierung

**`lookup` ist eine Multimap.** Mehrere Themen koennen denselben 4-Gates-Key
teilen. Disambiguierung erfolgt im Konsumenten **ueber das Profil**:

| Profil | Erwarteter Type |
|--------|-----------------|
| 1/3, 1/4, 2/4, 2/5, 3/5, 3/6 | RAX |
| 4/6, 5/1, 5/2, 6/2, 6/3 | LAX |
| 4/1 | JUX (Sonderfall) |

**8 Permutationen pro Theme**: Jeder Master-Eintrag erscheint in `lookup` mit
8 Schluessel-Varianten — pSun↔pEarth, dSun↔dEarth UND P↔D-Swap. Damit
spielt es keine Rolle, ob die Quelle die HD-Standard-Achsenkonvention exakt
einhaelt; Profil-Filterung waehlt im Konsumenten den korrekten Type.

## Lookup (Pseudocode)

```js
const master = require("./data/incarnation_crosses_master.json");

const PROFILE_TYPE = {
  "1/3":"RAX","1/4":"RAX","2/4":"RAX","2/5":"RAX","3/5":"RAX","3/6":"RAX",
  "4/6":"LAX","5/1":"LAX","5/2":"LAX","6/2":"LAX","6/3":"LAX",
  "4/1":"JUX",
};

function lookupCross({ pSun, pEarth, dSun, dEarth, profile }) {
  const key = `${pSun}-${pEarth}-${dSun}-${dEarth}`;
  const ids = master.lookup[key] || [];
  if (!ids.length) return null;
  const wantType = PROFILE_TYPE[profile];
  // 1. Exakter Type-Match (RAX/LAX/JUX) — bevorzugt
  let match = ids.find(i => master.themes[i].type_short === wantType);
  // 2. Q2-Fallback als neutraler Sekundaer-Match
  if (!match) match = ids.find(i => master.themes[i].type_short === "Q2");
  // 3. Erste Option als letzte Notloesung
  return master.themes[match || ids[0]];
}
```

Siehe **`scripts/verify_live_charts.py`** fuer eine Referenz-Implementierung
inklusive Type-Mismatch-Erkennung.

## Build & Reproduzierbarkeit

```bash
python3 scripts/build_incarnation_crosses.py        # Generiert Master-JSON + Report
python3 scripts/verify_live_charts.py               # Live-Tests
python3 scripts/verify_live_charts.py --update-report  # Schreibt Test-Sektion in BUILD_REPORT.md
```

Deterministisch, keine pip-Dependencies (Python 3.10+).

## Nach Migration loeschen / aussortieren

* **Q1**: `RAX_LAX_MAP`, `JUXTAPOSITION_NAMES`, `JUXTAPOSITION_NAMES_DE`,
  `CROSS_THEMATIC_DE` in `chartCalculation.js` durch JSON-Lookup ersetzen.
  `OPPOSITE_GATES` darf bleiben (oder aus `gate_polarities` lesen).
* **Q2**: `reading-worker/data/incarnation_crosses.json` ersetzen durch
  diese Master-JSON. `gate_names` aus Q2 gehoert in eine separate Datei.

## TODOs / Folgearbeiten

* [ ] Quartal-Suffix-Varianten („RAX der Sphinx 1/2/3/4") bei Bedarf erzeugen.
* [ ] EN-Uebersetzungen fuer `life_theme` und `description` ergaenzen.
* [ ] Tests gegen offizielle MyBodyGraph-Charts (10–20 Fixtures).
* [ ] `pd_axis_q2_validated=false`-Themes manuell gegen HD-Standardliteratur abgleichen.
