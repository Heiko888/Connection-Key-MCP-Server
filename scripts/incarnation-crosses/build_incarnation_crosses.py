#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_incarnation_crosses.py
=============================

Konsolidiert die Inkarnationskreuz-Daten von „The Connection Key" in eine
einzige Master-JSON: data/incarnation_crosses_master.json.

Quellen
-------
Q3  (MASTER fuer Themen-Texte):
    /opt/mcp-connection-key/reading-worker/knowledge/incarnation-cross.txt
    -> 16 RAX + 32 LAX + 64 Juxtapositions, jeweils mit Name/Tore/Lebensthema/Beschreibung.

Q2  (MASTER fuer Position-Keys — pSun-pEarth-dSun-dEarth):
    /opt/mcp-connection-key/reading-worker/data/incarnation_crosses.json
    -> 157 Eintraege. Schluesselformat: "pSun-pEarth-dSun-dEarth".
       Wenn Q2-Name <-> Q3-Name widersprechen, hat Q3 Vorrang.

Q1  (NUR Diagnose, nie Wahrheitsquelle):
    /opt/mcp-connection-key/connection-key/lib/astro/chartCalculation.js
    -> RAX_LAX_MAP, JUXTAPOSITION_NAMES, JUXTAPOSITION_NAMES_DE,
       CROSS_THEMATIC_DE, OPPOSITE_GATES (uebernehmen wir als Polaritaeten).

Iteration 2 (v3.1) — Aenderungen gegenueber v3.0
-----------------------------------------------
* Q3-Master-Themen: 8 Permutationen (pSun<->pEarth × dSun<->dEarth × P<->D-Swap)
  statt vorher 4. Damit faellt das P/D-Achsen-Problem fuer Faelle wie
  „Vessel of Love" weg — der Lookup matched unabhaengig davon, ob Q3 die
  Pol-Reihenfolge HD-konventionsgerecht angibt oder nicht. Disambiguierung
  von Mehrfachtreffern erledigt das Verify-Skript via Profil.
* Q2-Fallback-Themen ergaenzt: Wenn ein Q2-Key keinen Master-Treffer hat,
  aber ein FULL-Eintrag (mit theme/description) ist, wird ein eigenes
  Thema mit `source="q2_fallback"` angelegt. Diese bekommen ebenfalls
  8 Permutationen.
* `_validate_pd_axis_against_q2` annotiert jedes Theme, ob Q2 die Achse
  bestaetigt oder nicht (`pd_axis_q2_validated`).

Output
------
- data/incarnation_crosses_master.json  (Hauptoutput)
- BUILD_REPORT.md                       (Konflikte, Coverage, Gaps, Live-Tests)

Aufruf:  python3 scripts/build_incarnation_crosses.py
Python 3.10+, keine externen Dependencies. Deterministisch.
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from collections import OrderedDict
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# ─── Pfade ──────────────────────────────────────────────────────────────────
# Skript liegt in <repo>/scripts/incarnation-crosses/ — REPO ist zwei Ebenen hoch.
REPO       = Path(__file__).resolve().parent.parent.parent
Q3_PATH    = REPO / "reading-worker/knowledge/incarnation-cross.txt"
Q2_PATH    = REPO / "reading-worker/data/incarnation_crosses.json"
Q1_PATH    = REPO / "connection-key/lib/astro/chartCalculation.js"
OUT_JSON   = REPO / "connection-key/lib/astro/crosses/incarnation_crosses_master.json"
OUT_JSON_READING_WORKER = REPO / "reading-worker/data/incarnation_crosses_master.json"
OUT_REPORT = Path(__file__).resolve().parent / "BUILD_REPORT.md"

# ─── Gate-Polaritaeten (uebernommen aus Q1 OPPOSITE_GATES) ──────────────────
OPPOSITE_GATES: dict[int, int] = {
    1: 2, 2: 1, 3: 50, 50: 3, 4: 49, 49: 4, 5: 35, 35: 5, 6: 36, 36: 6,
    7: 13, 13: 7, 8: 14, 14: 8, 9: 16, 16: 9, 10: 15, 15: 10, 11: 12, 12: 11,
    17: 18, 18: 17, 19: 33, 33: 19, 20: 34, 34: 20, 21: 48, 48: 21, 22: 47, 47: 22,
    23: 43, 43: 23, 24: 44, 44: 24, 25: 46, 46: 25, 26: 45, 45: 26, 27: 28, 28: 27,
    29: 30, 30: 29, 31: 41, 41: 31, 32: 42, 42: 32, 37: 40, 40: 37, 38: 39, 39: 38,
    51: 57, 57: 51, 52: 58, 58: 52, 53: 54, 54: 53, 55: 59, 59: 55, 56: 60, 60: 56,
    61: 62, 62: 61, 63: 64, 64: 63,
}

# Juxtaposition-Namen (EN aus Q1 JUXTAPOSITION_NAMES, indiziert per pSun-Gate).
JUX_EN_BY_GATE: dict[int, str] = {
    1: "Self-Expression", 2: "Driver", 3: "Mutation", 4: "Formulization",
    5: "Fixed Patterns", 6: "Friction", 7: "Interaction", 8: "Contribution",
    9: "Focus", 10: "Behavior", 11: "Ideas", 12: "Caution", 13: "Listener",
    14: "Power Skills", 15: "Extremes", 16: "Skills", 17: "Opinions",
    18: "Correction", 19: "Wanting", 20: "Now", 21: "Control", 22: "Openness",
    23: "Assimilation", 24: "Rationalization", 25: "Innocence", 26: "Trickster",
    27: "Caring", 28: "Struggle", 29: "Commitment", 30: "Fates", 31: "Influence",
    32: "Conservation", 33: "Retreat", 34: "Power", 35: "Experience", 36: "Crisis",
    37: "Friendship", 38: "Opposition", 39: "Provocation", 40: "Denial",
    41: "Fantasy", 42: "Growth", 43: "Insight", 44: "Alertness", 45: "Ownership",
    46: "Serendipity", 47: "Realization", 48: "Depth", 49: "Principles",
    50: "Values", 51: "Shock", 52: "Stillness", 53: "Beginnings", 54: "Drive",
    55: "Moods", 56: "Stimulation", 57: "Intuition", 58: "Vitality",
    59: "Sexuality", 60: "Limitation", 61: "Mystery", 62: "Detail",
    63: "Doubt", 64: "Confusion",
}

TYPE_LONG = {"RAX": "Right Angle", "LAX": "Left Angle", "JUX": "Juxtaposition"}

# ─── Slug-Helper (ASCII, snake_case) ────────────────────────────────────────
_UMLAUT_MAP = str.maketrans({
    "ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss",
    "Ä": "Ae", "Ö": "Oe", "Ü": "Ue",
})

def slugify(s: str) -> str:
    s = s.translate(_UMLAUT_MAP)
    s = unicodedata.normalize("NFKD", s)
    s = s.encode("ascii", "ignore").decode("ascii")
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "_", s)
    return s.strip("_")

# ─── Q3 Parser ──────────────────────────────────────────────────────────────
HEADER_FULL_RE = re.compile(
    r"^##\s+"
    r"(?P<typ>RAX|LAX|Juxtaposition)\s+"
    r"(?P<rawname>.+?)\s+"
    r"\(Tor(?:e)?\s+(?P<gates>[\d,\s]+)\)\s*"
    r"(?P<suffix>—\s*transpersonal)?\s*$"
)
LIFETHEME_RE = re.compile(r"^Lebensthema:\s*(?P<theme>.+)$")

def parse_q3(text: str) -> list[dict]:
    """Liefert eine Liste von Theme-Dicts."""
    lines = text.splitlines()
    items: list[dict] = []
    i = 0
    n = len(lines)
    while i < n:
        raw = lines[i].rstrip()
        m = HEADER_FULL_RE.match(raw)
        if not m:
            i += 1
            continue
        typ_long = m.group("typ")
        typ = "JUX" if typ_long == "Juxtaposition" else typ_long
        rawname = m.group("rawname").strip()
        gates = [int(g.strip()) for g in m.group("gates").split(",") if g.strip()]
        suffix = m.group("suffix")
        i += 1
        life_theme: Optional[str] = None
        if i < n:
            mt = LIFETHEME_RE.match(lines[i].strip())
            if mt:
                life_theme = mt.group("theme").strip()
                i += 1
        desc_lines: list[str] = []
        while i < n:
            ln = lines[i]
            if ln.startswith("##") or ln.startswith("══") or ln.startswith("# "):
                break
            stripped = ln.strip()
            if stripped == "" and desc_lines and desc_lines[-1] == "":
                break
            desc_lines.append(stripped)
            i += 1
        description = " ".join(x for x in desc_lines if x).strip()
        prefix = "RAX" if typ == "RAX" else ("LAX" if typ == "LAX" else "Juxtaposition")
        full_name_de = f"{prefix} {rawname}".strip()
        if suffix:
            full_name_de = f"{full_name_de} — transpersonal"
        items.append({
            "typ": typ,
            "raw_header": rawname,
            "full_name_de": full_name_de,
            "gates": gates,
            "life_theme": life_theme,
            "description": description,
            "suffix": suffix.strip() if suffix else None,
        })
    return items

# ─── DE-Kernname extrahieren ────────────────────────────────────────────────
def extract_de_core(raw_header: str) -> str:
    parts = raw_header.split()
    if parts and parts[0].lower() in {"der", "die", "das", "des", "dem", "den"}:
        parts = parts[1:]
    if not parts:
        return raw_header
    last = parts[-1]
    last_clean = last
    if last.endswith("ses") and len(last) > 5:
        last_clean = last[:-3]
    elif last.endswith("es") and len(last) > 4 and not last.endswith("ges"):
        last_clean = last[:-2]
    elif last.endswith("s") and len(last) > 3 and not last.endswith("ss"):
        last_clean = last[:-1]
    parts[-1] = last_clean
    core = " ".join(parts).strip()
    core = re.sub(r"\s+", " ", core)
    return core

DE_CORE_OVERRIDES: dict[str, str] = {
    "der Sphinx":            "Sphinx",
    "des Liebesgefäßes":     "Liebesgefaess",
    "der Vier Wege":         "Vier Wege",
    "des Edens":             "Eden",
    "des schlafenden Phönix": "Schlafender Phoenix",
    "der Durchdringung":     "Durchdringung",
    "der Maya":              "Maya",
    "der Herrschaft":        "Herrschaft",
    "der Spannung":          "Spannung",
    "des Dienstes":          "Dienst",
    "der Erklärung":         "Erklaerung",
    "der Artikulation":      "Artikulation",
    "der Zyklen":            "Zyklen",
    "der Entschlossenheit":  "Entschlossenheit",
    "der Migration":         "Migration",
    "der Gemeinschaft":      "Gemeinschaft",
    "des Alpha":             "Alpha",
    "der Trennung":          "Trennung",
    "des Trotzes":           "Trotz",
    "der Revolution":        "Revolution",
    "der Verschleierung":    "Verschleierung",
    "der Hingabe":           "Hingabe",
    "der Strategie":         "Strategie",
    "der Konfrontation":     "Konfrontation",
    "der Verfeinerung":      "Verfeinerung",
    "der Vorbeugung":        "Vorbeugung",
    "der Ungewissheit":      "Ungewissheit",
    "des Ehrgeizes":         "Ehrgeiz",
    "der Wünsche":           "Wuensche",
    "des Bewusstseins":      "Bewusstsein",
    "des Wohlstands":        "Wohlstand",
    "der Masken":            "Masken",
    "der Erziehung":         "Erziehung",
    "der Industrie":         "Industrie",
    "der Erweckung":         "Erweckung",
    "der Übertragung":       "Uebertragung",
    "der Anmut":             "Anmut",
    "der Heilung":           "Heilung",
    "der Dualität":          "Dualitaet",
    "des Handels":           "Handel",
    "des Strebens":          "Streben",
    "des Urteils":           "Urteil",
    "der Tiefe":             "Tiefe",
    "der Ansteckung":        "Ansteckung",
    "der Herrschaft (transpersonal)": "Herrschaft (transpersonal)",
    "des Denkens":           "Denken",
    "der Abstraktion":       "Abstraktion",
    "der Schicksale":        "Schicksale",
}

RAX_LAX_EN_BY_CORE: dict[str, str] = {
    "Sphinx":                "Sphinx",
    "Liebesgefaess":         "Vessel of Love",
    "Vier Wege":             "The Four Ways",
    "Eden":                  "Eden",
    "Schlafender Phoenix":   "Sleeping Phoenix",
    "Durchdringung":         "Penetration",
    "Maya":                  "Maya",
    "Herrschaft":            "Rulership",
    "Spannung":              "Tension",
    "Dienst":                "Service",
    "Erklaerung":            "Explanation",
    "Artikulation":          "Articulation",
    "Zyklen":                "Cycles",
    "Entschlossenheit":      "Determination",
    "Migration":             "Migration",
    "Gemeinschaft":          "Community",
    "Alpha":                 "Alpha",
    "Trennung":              "Separation",
    "Trotz":                 "Defiance",
    "Revolution":            "Revolution",
    "Verschleierung":        "Obscuration",
    "Hingabe":               "Dedication",
    "Strategie":             "Strategy",
    "Konfrontation":         "Confrontation",
    "Verfeinerung":          "Refinement",
    "Vorbeugung":            "Prevention",
    "Ungewissheit":          "Uncertainty",
    "Ehrgeiz":               "Ambition",
    "Wuensche":              "Wishes",
    "Bewusstsein":           "Consciousness",
    "Wohlstand":             "Prosperity",
    "Masken":                "Masks",
    "Erziehung":             "Education",
    "Industrie":             "Industry",
    "Erweckung":             "Awakening",
    "Uebertragung":          "Transmission",
    "Anmut":                 "Grace",
    "Heilung":               "Healing",
    "Dualitaet":             "Duality",
    "Handel":                "Bargain",
    "Streben":               "Endeavor",
    "Urteil":                "Judgment",
    "Tiefe":                 "Depth",
    "Ansteckung":            "Contagion",
    "Herrschaft (transpersonal)": "Rulership (transpersonal)",
    "Denken":                "Thinking",
    "Abstraktion":           "Abstraction",
    "Schicksale":            "Fates",
}

# ─── Q2 Loader ──────────────────────────────────────────────────────────────
def load_q2(path: Path) -> dict[str, dict]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("crosses", {})

def is_q2_full(entry: dict) -> bool:
    """Q2-Eintrag gilt als „voll", wenn er description ODER theme hat."""
    return bool(entry.get("description") or entry.get("theme"))

# ─── Q1 Diagnose-Loader ─────────────────────────────────────────────────────
Q1_KEY_RE = re.compile(r'"(\d{1,2}-\d{1,2}-\d{1,2}-\d{1,2})"\s*:\s*"([^"]+)"')

def load_q1_diag(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    txt = path.read_text(encoding="utf-8")
    start = txt.find("const RAX_LAX_MAP")
    if start < 0:
        return {}
    end = txt.find("\n};", start)
    if end < 0:
        return {}
    block = txt[start:end]
    out: dict[str, str] = {}
    for m in Q1_KEY_RE.finditer(block):
        key, name = m.group(1), m.group(2)
        if key not in out:
            out[key] = name
    return out

# ─── Pers/Design-Achsen-Bestimmung ──────────────────────────────────────────
def find_axis_in_q2(gates4: list[int], q2: dict[str, dict]) -> Optional[tuple[int, int, int, int]]:
    """Sucht einen Q2-Key, dessen 4 Gates genau gates4 sind (als Set)."""
    target = sorted(gates4)
    for key in q2.keys():
        parts = key.split("-")
        if len(parts) != 4:
            continue
        try:
            nums = [int(p) for p in parts]
        except ValueError:
            continue
        if sorted(nums) == target:
            return (nums[0], nums[1], nums[2], nums[3])
    return None

def axis_from_q3_header(gates4: list[int]) -> tuple[int, int, int, int]:
    if len(gates4) == 4:
        return (gates4[0], gates4[1], gates4[2], gates4[3])
    raise ValueError(f"Erwartet 4 Tore, bekommen: {gates4}")

def validate_axis(p_sun: int, p_earth: int, d_sun: int, d_earth: int) -> bool:
    return (OPPOSITE_GATES.get(p_sun) == p_earth and
            OPPOSITE_GATES.get(d_sun)  == d_earth)

def jux_design_from_q2(p_sun: int, p_earth: int, q2: dict[str, dict]) -> Optional[tuple[int, int]]:
    for p_a, p_b in ((p_sun, p_earth), (p_earth, p_sun)):
        prefix = f"{p_a}-{p_b}-"
        for key in q2.keys():
            if key.startswith(prefix):
                parts = key.split("-")
                if len(parts) == 4:
                    try:
                        return (int(parts[2]), int(parts[3]))
                    except ValueError:
                        pass
    return None

def validate_pd_axis_against_q2(p_sun: int, p_earth: int, d_sun: int, d_earth: int,
                                en_name: str, q2: dict[str, dict]) -> tuple[bool, Optional[str]]:
    """Prueft, ob Q2 die P/D-Achse bestaetigt.

    Sucht volle Q2-Eintraege mit denselben 4 Gates UND demselben Namen
    (slugify-Vergleich). Falls gefunden: True, wenn pSun∈{p1,p2}-Pair des
    Q2-Keys identisch zu (p_sun,p_earth)-Pair. False sonst.

    Liefert (validated, q2_personality_pair_str_or_None).
    """
    target = sorted([p_sun, p_earth, d_sun, d_earth])
    our_p = sorted([p_sun, p_earth])
    en_slug = slugify(en_name)
    for k, v in q2.items():
        if not is_q2_full(v):
            continue
        if slugify(v.get("name", "")) != en_slug:
            continue
        parts = k.split("-")
        if len(parts) != 4:
            continue
        try:
            nums = [int(p) for p in parts]
        except ValueError:
            continue
        if sorted(nums) != target:
            continue
        q2_p = sorted([nums[0], nums[1]])
        if q2_p == our_p:
            return True, f"{nums[0]}-{nums[1]}"
        else:
            return False, f"{nums[0]}-{nums[1]}"
    return False, None  # Q2 hat keinen vollen Eintrag mit diesem Namen

# ─── 8-Permutationen-Generator ──────────────────────────────────────────────
def perms_8(p_sun: int, p_earth: int, d_sun: int, d_earth: int) -> list[str]:
    """Generiert 8 Permutationen:
       - 4× pSun<->pEarth × dSun<->dEarth (Standard)
       - 4× zusaetzlich mit P<->D-Swap (deckt umgekehrte Achsenkonvention ab)
    """
    a, b, c, d = p_sun, p_earth, d_sun, d_earth
    out = [
        f"{a}-{b}-{c}-{d}",
        f"{a}-{b}-{d}-{c}",
        f"{b}-{a}-{c}-{d}",
        f"{b}-{a}-{d}-{c}",
        # P<->D-Swap
        f"{c}-{d}-{a}-{b}",
        f"{c}-{d}-{b}-{a}",
        f"{d}-{c}-{a}-{b}",
        f"{d}-{c}-{b}-{a}",
    ]
    # Dedupe (falls a=c bei JUX o. ae. — sollte hier nicht passieren)
    seen: list[str] = []
    for k in out:
        if k not in seen:
            seen.append(k)
    return seen

# ─── Q2-Fallback Ingest ─────────────────────────────────────────────────────
def derive_q2_fallback_type(en_name: str, gates: list[int]) -> str:
    """Heuristik: pauschal 'q2' als type_prefix (deterministisch, ohne RAX/LAX-
       Vermutung). So ist klar abgegrenzt, dass diese Themes aus Q2 stammen.
    """
    return "q2"

def ingest_q2_fallback_themes(q2: dict[str, dict],
                              existing_keys: set[str],
                              existing_theme_ids: set[str],
                              existing_q3_by_name_and_gateset: dict[str, set[tuple[int, ...]]]) -> list[dict]:
    """Erzeugt fuer alle FULL-Q2-Keys, die nicht von Master-Themen abgedeckt
       sind, eigene Themes.

    Skip-Logik: Ein Q2-Eintrag wird uebersprungen, wenn ein bestehendes
    Q3-Master-Theme **denselben Namen UND dieselbe Gate-Menge** hat — nur
    dann ist Q3 wirklich Vorrang. Wenn Q2 das gleiche Theme-Label fuer
    eine andere Gate-Konstellation verwendet (z. B. „Eden" mit {6,11,12,36}
    statt {5,35,6,36}), wird das als eigenstaendiger Q2-Fallback erzeugt,
    mit ID-Disambiguierung (`q2_<slug>_<gateset>`).

    Q2-Fallbacks ueberlagern auch dann, wenn der Lookup-Key bereits durch
    JUX-Themen besetzt ist (Multimap-Disambiguierung erfolgt via Profil im
    Konsumenten).

    Deduplikation Q2-intern per (gateset, slug(name)).
    """
    seen_gatesets: set[tuple[tuple[int, ...], str]] = set()
    out_themes: list[dict] = []
    # Deterministisch: sortiert nach key
    for k in sorted(q2.keys(), key=lambda s: tuple(int(x) for x in s.split("-")) if all(c.isdigit() or c == "-" for c in s) else (999,)):
        v = q2[k]
        if not is_q2_full(v):
            continue
        name_slug = slugify(v.get("name", "").strip())
        parts = k.split("-")
        if len(parts) != 4:
            continue
        try:
            _nums_preview = [int(x) for x in parts]
        except ValueError:
            continue
        gateset_preview = tuple(sorted(_nums_preview))
        # Skip, wenn Q3 dieses Thema (per Name UND gleicher Gate-Menge) abdeckt
        q3_name_collision = (
            name_slug
            and name_slug in existing_q3_by_name_and_gateset
            and gateset_preview in existing_q3_by_name_and_gateset[name_slug]
        )
        if q3_name_collision:
            continue
        nums = _nums_preview
        gateset = gateset_preview
        name = v.get("name", "").strip()
        if not name:
            continue
        # name_slug ist oben schon berechnet (vor dem Q3-Check)
        dedupe_key = (gateset, name_slug)
        if dedupe_key in seen_gatesets:
            continue
        seen_gatesets.add(dedupe_key)
        # Wenn Q3 ein Theme mit demselben Namen, aber anderer Gate-Menge fuehrt:
        # ID kollidiert, deshalb suffixen wir mit Gates.
        q3_name_only_collision = (
            name_slug and name_slug in existing_q3_by_name_and_gateset
        )
        p_sun, p_earth, d_sun, d_earth = nums
        if not validate_axis(p_sun, p_earth, d_sun, d_earth):
            # Versuch: Polaritaeten neu pairen
            seen_g: set[int] = set()
            pairs: list[tuple[int, int]] = []
            for g in nums:
                if g in seen_g:
                    continue
                opp = OPPOSITE_GATES.get(g)
                if opp is not None and opp in nums and opp != g and opp not in seen_g:
                    pairs.append((g, opp))
                    seen_g.add(g); seen_g.add(opp)
            if len(pairs) == 2:
                p_sun, p_earth = pairs[0]
                d_sun, d_earth = pairs[1]
            else:
                # Skip — keine konsistente Achse moeglich
                continue
        type_prefix = derive_q2_fallback_type(name, nums)
        # Wenn Q3 schon einen gleichnamigen Eintrag fuehrt (andere Gates),
        # haengen wir die sortierten Gates an die ID, damit der Bezug klar ist.
        if q3_name_only_collision:
            gates_suffix = "_".join(str(g) for g in sorted(gateset))
            theme_id = f"{type_prefix}_{name_slug}_{gates_suffix}"
        else:
            theme_id = f"{type_prefix}_{name_slug}"
        # Eindeutigkeit sicherstellen
        suffix_n = 0
        base_id = theme_id
        while theme_id in existing_theme_ids:
            suffix_n += 1
            theme_id = f"{base_id}_{suffix_n}"
        existing_theme_ids.add(theme_id)
        theme = {
            "id": theme_id,
            "type": "Q2-Fallback",
            "type_short": "Q2",
            "name_de": name,
            "name_en": name,
            "full_name_de": v.get("theme", name),
            "full_name_en": f"Cross of {name}",
            "gates": nums,
            "personality_pair": [p_sun, p_earth],
            "design_pair": [d_sun, d_earth],
            "life_theme": v.get("theme"),
            "description": v.get("description"),
            "source": "q2_fallback",
            "q2_key": k,
        }
        out_themes.append(theme)
    return out_themes

# ─── Build-Main ─────────────────────────────────────────────────────────────
def build() -> int:
    print(f"[info] Q3 (Knowledge)  : {Q3_PATH}", file=sys.stderr)
    print(f"[info] Q2 (Position-JSON): {Q2_PATH}", file=sys.stderr)
    print(f"[info] Q1 (Diagnose)   : {Q1_PATH}", file=sys.stderr)

    q3_text = Q3_PATH.read_text(encoding="utf-8")
    q3_items = parse_q3(q3_text)
    q2 = load_q2(Q2_PATH)
    q1_map = load_q1_diag(Q1_PATH)

    cnt_rax = sum(1 for t in q3_items if t["typ"] == "RAX")
    cnt_lax = sum(1 for t in q3_items if t["typ"] == "LAX")
    cnt_jux = sum(1 for t in q3_items if t["typ"] == "JUX")
    print(f"[info] Q3 geparst: {len(q3_items)} Themen ({cnt_rax} RAX, {cnt_lax} LAX, {cnt_jux} JUX)", file=sys.stderr)
    print(f"[info] Q2 Eintraege: {len(q2)} (FULL: {sum(1 for v in q2.values() if is_q2_full(v))})", file=sys.stderr)
    print(f"[info] Q1 RAX_LAX_MAP Eintraege: {len(q1_map)}", file=sys.stderr)

    themes_out: "OrderedDict[str, dict]" = OrderedDict()
    lookup_multi: "OrderedDict[str, list[str]]" = OrderedDict()

    conflicts_q2_vs_q3: list[tuple[str, str, str]] = []
    only_in_q2: list[tuple[str, str]] = []
    gaps_no_design: list[str] = []
    used_keys: set[str] = set()
    key_collisions: list[tuple[str, list[str]]] = []
    pd_axis_unvalidated: list[str] = []
    pd_axis_validated: list[str] = []

    # ─── RAX/LAX verarbeiten ──────────────────────────────────────────────
    for t in q3_items:
        if t["typ"] not in ("RAX", "LAX"):
            continue
        gates = t["gates"]
        if len(gates) != 4:
            print(f"[warn] {t['full_name_de']}: erwartet 4 Gates, gefunden {len(gates)}", file=sys.stderr)
            continue
        de_core = DE_CORE_OVERRIDES.get(t["raw_header"]) or extract_de_core(t["raw_header"])
        en_core = RAX_LAX_EN_BY_CORE.get(de_core, de_core)
        type_prefix = "rax" if t["typ"] == "RAX" else "lax"
        cross_id = f"{type_prefix}_{slugify(en_core)}"

        axis = find_axis_in_q2(gates, q2)
        axis_source = "q2"
        if axis is None:
            axis = axis_from_q3_header(gates)
            axis_source = "q3_header"
        p_sun, p_earth, d_sun, d_earth = axis

        if not validate_axis(p_sun, p_earth, d_sun, d_earth):
            pairs: list[tuple[int, int]] = []
            seen: set[int] = set()
            for g in gates:
                if g in seen:
                    continue
                opp = OPPOSITE_GATES.get(g)
                if opp is not None and opp in gates and opp != g and opp not in seen:
                    pairs.append((g, opp))
                    seen.add(g); seen.add(opp)
            if len(pairs) == 2:
                p_sun, p_earth = pairs[0]
                d_sun, d_earth = pairs[1]
                axis_source = "polarity_pairs"
            else:
                print(f"[warn] {cross_id}: konnte Achse nicht validieren ({axis})", file=sys.stderr)

        # P/D-Achsen-Validierung gegen Q2 (FULL-Eintraege mit gleichem Namen)
        pd_valid, q2_p_observed = validate_pd_axis_against_q2(
            p_sun, p_earth, d_sun, d_earth, en_core, q2
        )

        full_name_en = f"{TYPE_LONG[t['typ']]} Cross of the {en_core}"
        if t.get("suffix"):
            full_name_en += " (transpersonal)"

        theme_obj = {
            "id": cross_id,
            "type": TYPE_LONG[t["typ"]],
            "type_short": t["typ"],
            "name_de": de_core,
            "name_en": en_core,
            "full_name_de": t["full_name_de"],
            "full_name_en": full_name_en,
            "gates": list(gates),
            "personality_pair": [p_sun, p_earth],
            "design_pair": [d_sun, d_earth],
            "life_theme": t.get("life_theme"),
            "description": t.get("description"),
            "source": "q3_master",
            "axis_source": axis_source,
            "pd_axis_q2_validated": pd_valid,
        }
        if q2_p_observed:
            theme_obj["q2_personality_pair_observed"] = q2_p_observed
        themes_out[cross_id] = theme_obj

        if pd_valid:
            pd_axis_validated.append(cross_id)
        else:
            pd_axis_unvalidated.append(cross_id)

        # 8 Permutationen (Standard 4 + P<->D-Swap 4)
        for k in perms_8(p_sun, p_earth, d_sun, d_earth):
            bucket = lookup_multi.setdefault(k, [])
            if cross_id not in bucket:
                bucket.append(cross_id)
            used_keys.add(k)

        # Q2-Konflikt-Check
        for k in perms_8(p_sun, p_earth, d_sun, d_earth):
            if k in q2:
                q2name = q2[k].get("name", "")
                if q2name and slugify(q2name) != slugify(en_core) and slugify(q2name) != slugify(de_core):
                    conflicts_q2_vs_q3.append((k, q2name, t["full_name_de"]))

    # ─── Juxtapositions verarbeiten ───────────────────────────────────────
    for t in q3_items:
        if t["typ"] != "JUX":
            continue
        if len(t["gates"]) != 1:
            print(f"[warn] {t['full_name_de']}: JUX braucht 1 Gate, gefunden {len(t['gates'])}", file=sys.stderr)
            continue
        p_sun = t["gates"][0]
        p_earth = OPPOSITE_GATES.get(p_sun)
        if p_earth is None:
            print(f"[warn] {t['full_name_de']}: keine Polaritaet fuer Gate {p_sun}", file=sys.stderr)
            continue
        de_core = DE_CORE_OVERRIDES.get(t["raw_header"]) or extract_de_core(t["raw_header"])
        en_core = JUX_EN_BY_GATE.get(p_sun, de_core)
        cross_id = f"jux_{slugify(en_core)}"

        design = jux_design_from_q2(p_sun, p_earth, q2)
        gaps: list[str] = []
        if design is None:
            d_sun = None
            d_earth = None
            gaps.append("no_q2_match_for_design_polarities")
        else:
            d_sun, d_earth = design

        full_name_en = f"Juxtaposition Cross of {en_core}"

        theme_obj = {
            "id": cross_id,
            "type": TYPE_LONG["JUX"],
            "type_short": "JUX",
            "name_de": de_core,
            "name_en": en_core,
            "full_name_de": t["full_name_de"],
            "full_name_en": full_name_en,
            "gates": [p_sun, p_earth] + ([d_sun, d_earth] if d_sun is not None else []),
            "personality_pair": [p_sun, p_earth],
            "design_pair": [d_sun, d_earth] if d_sun is not None else None,
            "life_theme": t.get("life_theme"),
            "description": t.get("description"),
            "source": "q3_master",
        }
        if gaps:
            theme_obj["gaps"] = gaps
            themes_out[cross_id] = theme_obj
            gaps_no_design.append(cross_id)
            continue
        themes_out[cross_id] = theme_obj

        # 8 Permutationen (auch fuer JUX — Achse von Q2 nicht 100% verlaesslich)
        for k in perms_8(p_sun, p_earth, d_sun, d_earth):
            bucket = lookup_multi.setdefault(k, [])
            if cross_id not in bucket:
                bucket.append(cross_id)
            used_keys.add(k)

    # ─── Q2-Fallback-Themen ergaenzen ─────────────────────────────────────
    existing_theme_ids = set(themes_out.keys())
    # Mapping: name_slug -> set of gatesets, fuer das Q3 dieses Theme fuehrt.
    existing_q3_by_name_and_gateset: dict[str, set[tuple[int, ...]]] = {}
    for t in themes_out.values():
        if t.get("source") != "q3_master":
            continue
        gs = tuple(sorted(g for g in t.get("gates", []) if g is not None))
        for nm in (t.get("name_en"), t.get("name_de")):
            ns = slugify(nm or "")
            if not ns:
                continue
            existing_q3_by_name_and_gateset.setdefault(ns, set()).add(gs)
    q2_fallbacks = ingest_q2_fallback_themes(q2, used_keys, existing_theme_ids, existing_q3_by_name_and_gateset)
    for theme in q2_fallbacks:
        cross_id = theme["id"]
        themes_out[cross_id] = theme
        p_sun, p_earth = theme["personality_pair"]
        d_sun, d_earth = theme["design_pair"]
        for k in perms_8(p_sun, p_earth, d_sun, d_earth):
            bucket = lookup_multi.setdefault(k, [])
            if cross_id not in bucket:
                bucket.append(cross_id)
            used_keys.add(k)

    print(f"[info] Q2-Fallback-Themen ergaenzt: {len(q2_fallbacks)}", file=sys.stderr)

    # ─── Kollisionen extrahieren ─────────────────────────────────────────
    for k, ids in lookup_multi.items():
        if len(ids) > 1:
            key_collisions.append((k, list(ids)))

    # ─── Only-in-Q2 ermitteln (nach Fallback-Ingest noch verbliebene) ─────
    for k, v in q2.items():
        if k not in used_keys:
            only_in_q2.append((k, v.get("name", "")))

    # ─── Output JSON ──────────────────────────────────────────────────────
    out_obj = {
        "_meta": {
            "version": "3.1",
            "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "source": "Konsolidierung aus knowledge/incarnation-cross.txt (Master) + data/incarnation_crosses.json (Position-Keys, Q2-Fallback)",
            "format": "Key 'pSun-pEarth-dSun-dEarth' -> cross_id, plus crosses-Map mit Vollmetadaten",
            "key_convention": "Positionsspezifisch — KEINE min/max-Normalisierung. pSun und pEarth sind 180° gegenueber, ebenso dSun/dEarth. Lookup enthaelt 8 Permutationen pro Thema (pSun<->pEarth × dSun<->dEarth × P<->D-Swap), um umgekehrte Achsenkonventionen in der Datenquelle abzudecken. Disambiguierung bei Mehrfachtreffern erfolgt via Profil im Konsumenten.",
            "total_themes_unique": len(themes_out),
            "themes_q3_master": sum(1 for v in themes_out.values() if v.get("source") == "q3_master"),
            "themes_q2_fallback": sum(1 for v in themes_out.values() if v.get("source") == "q2_fallback"),
            "permutations_per_theme": 8,
            "pd_axis_validated_count": len(pd_axis_validated),
            "pd_axis_unvalidated_count": len(pd_axis_unvalidated),
            "changelog": [
                "3.0: Initiale Konsolidierung Q3+Q2 mit 4 Permutationen.",
                "3.1: 8 Permutationen (inkl. P<->D-Swap) + Q2-Fallback-Themen + pd_axis_q2_validated-Annotation.",
            ],
        },
        "gate_polarities": {str(k): v for k, v in sorted(OPPOSITE_GATES.items())},
        "themes": themes_out,
        "lookup": OrderedDict(
            sorted(lookup_multi.items(), key=lambda kv: tuple(int(x) for x in kv[0].split("-")))
        ),
    }

    json_text = json.dumps(out_obj, ensure_ascii=False, indent=2, sort_keys=False) + "\n"

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json_text, encoding="utf-8")
    print(f"[ok] geschrieben: {OUT_JSON}", file=sys.stderr)

    # Zweitkopie fuer reading-worker-Docker-Build-Kontext (separater Build-Kontext)
    OUT_JSON_READING_WORKER.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON_READING_WORKER.write_text(json_text, encoding="utf-8")
    print(f"[ok] geschrieben: {OUT_JSON_READING_WORKER}", file=sys.stderr)

    # ─── Validierungs-Pass ────────────────────────────────────────────────
    errors: list[str] = []
    keys_per_theme: dict[str, int] = {}
    for k, ids in lookup_multi.items():
        for tid in ids:
            keys_per_theme[tid] = keys_per_theme.get(tid, 0) + 1
    weak_themes = [tid for tid, cnt in keys_per_theme.items() if cnt < 3]
    for tid in weak_themes:
        if tid in themes_out and themes_out[tid].get("design_pair") is None:
            continue
        errors.append(f"Thema {tid} hat nur {keys_per_theme.get(tid, 0)} Lookup-Keys")
    if sum(1 for v in themes_out.values() if v.get("source") == "q3_master") < 112:
        errors.append(
            f"Erwartet 112 Q3-Master-Themen, gefunden "
            f"{sum(1 for v in themes_out.values() if v.get('source') == 'q3_master')}"
        )

    total_q3 = sum(1 for v in themes_out.values() if v.get("source") == "q3_master")
    total_q2fb = sum(1 for v in themes_out.values() if v.get("source") == "q2_fallback")
    coverage_pct = 100.0 * total_q3 / 112.0
    total_mappings_for_log = sum(len(v) for v in lookup_multi.values())

    # ─── Q1-Diagnose-Vergleich ───────────────────────────────────────────
    q1_diff: list[tuple[str, str, str]] = []
    for k, q1name in q1_map.items():
        master_ids = lookup_multi.get(k, [])
        if not master_ids:
            continue
        match = any(
            slugify(q1name) in (slugify(themes_out[tid]["name_en"]), slugify(themes_out[tid]["name_de"]))
            for tid in master_ids
        )
        if not match:
            q1_diff.append((k, q1name, master_ids[0]))

    # ─── Report schreiben ─────────────────────────────────────────────────
    lines_r: list[str] = []
    lines_r.append("# Inkarnationskreuze — Build Report v3.1 (Iteration 2)")
    lines_r.append("")
    lines_r.append(f"_Erzeugt: {out_obj['_meta']['generated_at']}_")
    lines_r.append("")
    lines_r.append("## Aenderungen v3.0 → v3.1")
    lines_r.append("")
    lines_r.append("- **8 Permutationen pro Thema** (statt 4): zusaetzlich P-D-Swap. Damit faellt das P/D-Achsen-Reihenfolge-Problem weg: ein Theme wird unabhaengig davon gefunden, ob Q3 die HD-Standard-Konvention exakt einhaelt oder umgekehrt. **Keine** Themen wurden manuell umgedreht; der 8-Perms-Lookup deckt beide Konventionen ab.")
    lines_r.append(f"- **Q2-Fallback-Themen ergaenzt**: {total_q2fb} zusaetzliche Themen aus FULL-Q2-Eintraegen, die kein Q3-Pendant haben (bzw. einen mit anderer Gate-Konstellation).")
    lines_r.append(f"- **P/D-Achse gegen Q2 validiert**: {len(pd_axis_validated)} Themen bestaetigt durch einen FULL-Q2-Eintrag mit gleichem Namen, {len(pd_axis_unvalidated)} Themen unvalidiert (kein FULL-Q2-Eintrag mit passendem Namen — die Achse wurde wie bei v3.0 belassen, ist aber dank 8-Perms egal fuer den Lookup).")
    lines_r.append("- Disambiguierung von Mehrfachtreffern via Profil erfolgt im Konsumenten (siehe `scripts/verify_live_charts.py`).")
    lines_r.append("")

    lines_r.append("## Coverage")
    lines_r.append("")
    lines_r.append(f"- Q3-Master-Themen: **{total_q3}** (erwartet 112) → {coverage_pct:.1f} %")
    lines_r.append(f"  - RAX: {sum(1 for v in themes_out.values() if v['type_short']=='RAX')}")
    lines_r.append(f"  - LAX: {sum(1 for v in themes_out.values() if v['type_short']=='LAX')}")
    lines_r.append(f"  - JUX: {sum(1 for v in themes_out.values() if v['type_short']=='JUX')}")
    lines_r.append(f"- Q2-Fallback-Themen: **{total_q2fb}**")
    lines_r.append(f"- Themen gesamt: **{len(themes_out)}**")
    lines_r.append(f"- Lookup-Keys gesamt: **{len(lookup_multi)}**")
    lines_r.append(f"- Lookup-Mappings (Key→Theme, inkl. Kollisionen): **{total_mappings_for_log}**")
    lines_r.append(f"- Q2-Keys insgesamt: {len(q2)} (FULL: {sum(1 for v in q2.values() if is_q2_full(v))})")
    lines_r.append(f"- Q2-Keys ohne Master-Treffer nach Fallback-Ingest: {len(only_in_q2)}")
    lines_r.append(f"- Q1-Keys (Diagnose): {len(q1_map)}")
    lines_r.append("")

    lines_r.append("## P/D-Achse gegen Q2 validiert")
    lines_r.append("")
    lines_r.append(f"- **Validiert (Q2 bestaetigt P-Pair)**: {len(pd_axis_validated)}")
    lines_r.append(f"- **Nicht durch Q2 validiert** (kein voller Q2-Eintrag mit gleichem Namen): {len(pd_axis_unvalidated)}")
    lines_r.append("")
    if pd_axis_validated:
        lines_r.append("### Validierte Themen")
        lines_r.append("")
        for tid in pd_axis_validated[:50]:
            t = themes_out[tid]
            lines_r.append(f"- `{tid}` — P-Pair {t['personality_pair']}")
        if len(pd_axis_validated) > 50:
            lines_r.append(f"- … (+{len(pd_axis_validated)-50} weitere)")
        lines_r.append("")

    lines_r.append("## Q2-Fallback-Themen")
    lines_r.append("")
    if q2_fallbacks:
        lines_r.append(f"{len(q2_fallbacks)} Themen aus Q2 ergaenzt (FULL-Eintraege ohne Q3-Pendant):")
        lines_r.append("")
        lines_r.append("| Theme-ID | Q2-Key | Name | Lebensthema |")
        lines_r.append("|---|---|---|---|")
        for theme in q2_fallbacks:
            lt = (theme.get("life_theme") or "").replace("|", "\\|")[:80]
            lines_r.append(f"| `{theme['id']}` | `{theme['q2_key']}` | {theme['name_en']} | {lt} |")
    else:
        lines_r.append("_Keine Q2-Fallback-Themen ergaenzt._")
    lines_r.append("")

    lines_r.append("## Konflikte Q2 vs Q3 (Q3 hat Vorrang)")
    lines_r.append("")
    if conflicts_q2_vs_q3:
        lines_r.append(f"Insgesamt **{len(conflicts_q2_vs_q3)}** Konflikte gefunden. Top-Liste:")
        lines_r.append("")
        lines_r.append("| Key | Q2-Name | Q3-Master |")
        lines_r.append("|---|---|---|")
        seen_k: set[str] = set()
        dedup: list[tuple[str, str, str]] = []
        for c in conflicts_q2_vs_q3:
            if c[0] not in seen_k:
                seen_k.add(c[0])
                dedup.append(c)
        for k, q2n, q3n in dedup[:80]:
            lines_r.append(f"| `{k}` | {q2n} | {q3n} |")
        if len(dedup) > 80:
            lines_r.append(f"| … | … | (+{len(dedup)-80} weitere) |")
    else:
        lines_r.append("_Keine semantischen Konflikte zwischen Q2 und Q3._")
    lines_r.append("")

    lines_r.append("## Konflikte Q1 vs Master (Diagnose)")
    lines_r.append("")
    if q1_diff:
        lines_r.append(f"Insgesamt **{len(q1_diff)}** Q1-Eintraege weichen vom Master ab.")
        lines_r.append("")
        lines_r.append("| Key | Q1-Name | Master |")
        lines_r.append("|---|---|---|")
        for k, q1n, mid in q1_diff[:40]:
            lines_r.append(f"| `{k}` | {q1n} | {themes_out[mid]['name_en']} ({mid}) |")
        if len(q1_diff) > 40:
            lines_r.append(f"| … | … | (+{len(q1_diff)-40} weitere) |")
    else:
        lines_r.append("_Q1 deckt sich mit Master._")
    lines_r.append("")

    lines_r.append("## Q2-Keys ohne Master-Thema (nach Fallback-Ingest)")
    lines_r.append("")
    if only_in_q2:
        lines_r.append(f"**{len(only_in_q2)}** Q2-Keys haben kein passendes Master-Thema (i.d.R. Stubs ohne description/theme):")
        lines_r.append("")
        lines_r.append("| Q2-Key | Q2-Name |")
        lines_r.append("|---|---|")
        for k, n in only_in_q2[:80]:
            lines_r.append(f"| `{k}` | {n} |")
        if len(only_in_q2) > 80:
            lines_r.append(f"| … | (+{len(only_in_q2)-80} weitere) |")
    else:
        lines_r.append("_Alle Q2-Keys decken sich mit Master._")
    lines_r.append("")

    lines_r.append("## Gaps — Themen ohne Design-Polen")
    lines_r.append("")
    if gaps_no_design:
        lines_r.append(f"{len(gaps_no_design)} Juxtapositions ohne Design-Polen (Q2 lieferte keinen Match):")
        lines_r.append("")
        for tid in gaps_no_design:
            t = themes_out[tid]
            lines_r.append(f"- `{tid}` — pSun={t['personality_pair'][0]}, pEarth={t['personality_pair'][1]} → design unbekannt")
    else:
        lines_r.append("_Alle Themen haben Personality- und Design-Polen._")
    lines_r.append("")

    lines_r.append("## Key-Kollisionen (mehrere Themen am selben Key)")
    lines_r.append("")
    if key_collisions:
        lines_r.append(
            f"{len(key_collisions)} Keys verweisen auf mehrere Themen. "
            "Das ist legitim, wenn RAX/LAX/JUX dieselben 4 Gates teilen "
            "(Disambiguierung im Konsumenten via Profil)."
        )
        lines_r.append("")
        lines_r.append("| Key | Themen-IDs |")
        lines_r.append("|---|---|")
        for k, ids in key_collisions[:80]:
            lines_r.append(f"| `{k}` | {', '.join(ids)} |")
        if len(key_collisions) > 80:
            lines_r.append(f"| … | (+{len(key_collisions)-80} weitere) |")
    else:
        lines_r.append("_Keine Kollisionen._")
    lines_r.append("")

    lines_r.append("## Validierung")
    lines_r.append("")
    if errors:
        lines_r.append(f"**{len(errors)}** Validierungs-Warnungen:")
        for e in errors:
            lines_r.append(f"- {e}")
    else:
        lines_r.append("_Alle Validierungen bestanden._")
    lines_r.append("")
    lines_r.append("> **Live-Test-Ergebnisse**: siehe Sektion am Ende dieses Berichts ")
    lines_r.append("> (befuellt von `scripts/verify_live_charts.py --update-report`).")
    lines_r.append("")

    OUT_REPORT.write_text("\n".join(lines_r) + "\n", encoding="utf-8")
    print(f"[ok] geschrieben: {OUT_REPORT}", file=sys.stderr)

    print("", file=sys.stderr)
    print(
        f"=== Coverage: Q3-Master={total_q3}, Q2-Fallback={total_q2fb}, "
        f"Themen-gesamt={len(themes_out)}, Lookup-Keys={len(lookup_multi)}, "
        f"Mappings={total_mappings_for_log}, {coverage_pct:.1f}% ===",
        file=sys.stderr,
    )
    if errors:
        print(f"=== Warnungen: {len(errors)} (siehe BUILD_REPORT.md) ===", file=sys.stderr)

    return 0


if __name__ == "__main__":
    sys.exit(build())
