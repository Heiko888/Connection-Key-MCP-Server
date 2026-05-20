#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verify_live_charts.py
=====================

Validiert das Master-Mapping (data/incarnation_crosses_master.json) gegen
die 5 Live-Test-Charts aus der Iteration-2-Spezifikation.

Funktionen
----------
* Lookup eines Charts (pSun, pEarth, dSun, dEarth) im Master.
* Profil-basierte Disambiguierung von Mehrfachtreffern:
    - RAX-Profile: 1/3, 1/4, 2/4, 2/5, 3/5, 3/6
    - LAX-Profile: 4/6, 4/1, 5/1, 5/2, 6/2, 6/3
        (HD-Konvention: 4er-Linie unten + 1er/6er-Linie oben = Left Angle)
    - JUX-Profil:  4/1
        (Sonderfall: einzige Profil-Linie, die strikt Juxtaposition trigger;
         taucht in vielen Lehrbuechern als Grenzfall auf — als Hinweis behandelt)
* Wenn Single-Hit-Lookup, aber der gefundene Theme-Type nicht zum Profil
  passt → Warnung (echter HD-Mismatch, nicht Multimap).
* Optional `--update-report`: ueberschreibt die Live-Test-Sektion in
  BUILD_REPORT.md.

Aufruf:
    python3 scripts/verify_live_charts.py
    python3 scripts/verify_live_charts.py --update-report
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Optional

REPO = Path(__file__).resolve().parent.parent.parent
MASTER_JSON = REPO / "connection-key/lib/astro/crosses/incarnation_crosses_master.json"
REPORT_MD   = Path(__file__).resolve().parent / "BUILD_REPORT.md"

# ─── Profil → erwarteter Cross-Type ────────────────────────────────────────
# Quelle: HD-Standard. Profile mit 4er Linie + 1er/6er sind Left Angle, alle
# anderen 6 „natuerlichen" Profile sind Right Angle. 4/1 ist Juxtaposition
# (einziges Profil mit dieser Eigenschaft).
PROFILE_TYPE: dict[str, str] = {
    "1/3": "RAX",
    "1/4": "RAX",
    "2/4": "RAX",
    "2/5": "RAX",
    "3/5": "RAX",
    "3/6": "RAX",
    "4/6": "LAX",
    "5/1": "LAX",
    "5/2": "LAX",
    "6/2": "LAX",
    "6/3": "LAX",
    "4/1": "JUX",
}

# ─── Live-Test-Charts (Iteration 2 Spezifikation) ──────────────────────────
LIVE_CHARTS = [
    {
        "name":   "Berlin 85",
        "pSun":   12, "pEarth": 11, "dSun": 36, "dEarth": 6,
        "profile": "2/4",
        "expected_note": "irgendein RAX (Gates {6,11,12,36})",
    },
    {
        "name":   "Muenchen 92",
        "pSun":   25, "pEarth": 46, "dSun": 10, "dEarth": 15,
        "profile": "3/5",
        "expected_note": "RAX of Vessel of Love",
    },
    {
        "name":   "Hamburg 78",
        "pSun":   1, "pEarth": 2, "dSun": 7, "dEarth": 13,
        "profile": "4/6",
        "expected_note": "LAX of Alpha",
    },
    {
        "name":   "Wien 01",
        "pSun":   31, "pEarth": 41, "dSun": 24, "dEarth": 44,
        "profile": "6/2",
        "expected_note": "LAX of Refinement",
    },
    {
        "name":   "Koeln 69",
        "pSun":   30, "pEarth": 29, "dSun": 14, "dEarth": 8,
        "profile": "2/4",
        "expected_note": "RAX (Contagion oder Industriousness)",
    },
]


def load_master(path: Path) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def disambiguate(hits: list[dict], expected_type: Optional[str]) -> tuple[list[dict], str]:
    """Filtert die Treffer-Liste anhand des erwarteten Cross-Types.

    Liefert (filtered, mode):
       - mode='exact'         : genau ein Treffer mit passendem Type
       - mode='multiple_same' : >1 Treffer mit passendem Type
       - mode='single_no_match': nur 1 Treffer insgesamt, Type passt nicht
       - mode='multi_no_match': mehrere Treffer, keiner mit passendem Type
       - mode='no_hit'        : keine Treffer
    """
    if not hits:
        return [], "no_hit"
    if expected_type is None:
        # Ohne Profil-Info: alles zurueckgeben
        return hits, "multiple_same" if len(hits) > 1 else "exact"

    # Q2-Fallback type_short ist 'Q2' — die behandeln wir als „passt zu jedem
    # Type" (Fallback ist neutral). Aber wir bevorzugen exakte RAX/LAX-Treffer.
    type_matches = [h for h in hits if h.get("type_short") == expected_type]
    if type_matches:
        return type_matches, "exact" if len(type_matches) == 1 else "multiple_same"

    # Kein RAX/LAX/JUX-Match → schau ob Q2-Fallback verfuegbar (neutral)
    q2_fallbacks = [h for h in hits if h.get("type_short") == "Q2"]
    if q2_fallbacks:
        return q2_fallbacks, "multiple_same" if len(q2_fallbacks) > 1 else "exact"

    # Type-Mismatch
    if len(hits) == 1:
        return hits, "single_no_match"
    return hits, "multi_no_match"


def verify_chart(master: dict, chart: dict) -> dict:
    key = f"{chart['pSun']}-{chart['pEarth']}-{chart['dSun']}-{chart['dEarth']}"
    lookup = master["lookup"]
    themes = master["themes"]
    raw_hit_ids = lookup.get(key, [])
    raw_hits = [themes[tid] for tid in raw_hit_ids if tid in themes]

    expected_type = PROFILE_TYPE.get(chart["profile"])
    filtered, mode = disambiguate(raw_hits, expected_type)

    return {
        "chart": chart,
        "key": key,
        "expected_type": expected_type,
        "raw_hits": raw_hits,
        "raw_hit_count": len(raw_hits),
        "filtered": filtered,
        "filtered_count": len(filtered),
        "mode": mode,
    }


def render_result_human(res: dict) -> list[str]:
    lines: list[str] = []
    c = res["chart"]
    lines.append(f"=== {c['name']} (Profil {c['profile']}, Erwartung: {c['expected_note']}) ===")
    lines.append(f"  Lookup-Key: {res['key']}  →  {res['raw_hit_count']} Treffer")
    if res["expected_type"]:
        lines.append(f"  Profil-Filter: {c['profile']} → {res['expected_type']}")

    if res["raw_hit_count"] == 0:
        lines.append("  [FAIL] Kein Master-Match")
        return lines

    for h in res["raw_hits"]:
        marker = "★" if h in res["filtered"] else " "
        lines.append(f"   {marker} {h['id']}: {h.get('full_name_de')} "
                     f"[{h.get('type_short')} / {h.get('source','-')}]")

    if res["mode"] == "exact":
        lines.append(f"  [OK] Eindeutiger Match nach Profil-Filter: {res['filtered'][0]['id']}")
    elif res["mode"] == "multiple_same":
        ids = [h["id"] for h in res["filtered"]]
        lines.append(f"  [AMBIGUOUS] {len(ids)} Treffer mit passendem Type: {ids}")
    elif res["mode"] == "single_no_match":
        h = res["filtered"][0]
        lines.append(f"  [WARN] Single-Hit, aber Type {h['type_short']} != "
                     f"erwartet {res['expected_type']} (echter HD-Mismatch oder "
                     "Chart-Daten inkonsistent)")
    elif res["mode"] == "multi_no_match":
        lines.append(f"  [WARN] {res['raw_hit_count']} Treffer, aber keiner mit Type "
                     f"{res['expected_type']} (echter HD-Mismatch oder Datenluecke)")
    return lines


def render_result_md(res: dict) -> list[str]:
    """Markdown-Zeilen fuer Report-Sektion."""
    lines: list[str] = []
    c = res["chart"]
    lines.append(f"### {c['name']} — Profil {c['profile']}")
    lines.append("")
    lines.append(f"- **Lookup-Key**: `{res['key']}` ({c['pSun']},{c['pEarth']} / {c['dSun']},{c['dEarth']})")
    lines.append(f"- **Erwartung**: {c['expected_note']}")
    if res["expected_type"]:
        lines.append(f"- **Profil-Filter**: {c['profile']} → erwartet Type **{res['expected_type']}**")
    lines.append(f"- **Raw-Treffer**: {res['raw_hit_count']}")
    if res["raw_hits"]:
        lines.append("")
        lines.append("    | ★ | Theme-ID | Name (DE) | Type | Source |")
        lines.append("    |---|---|---|---|---|")
        for h in res["raw_hits"]:
            mark = "★" if h in res["filtered"] else ""
            lines.append(
                f"    | {mark} | `{h['id']}` | {h.get('full_name_de','')} | "
                f"{h.get('type_short','')} | {h.get('source','-')} |"
            )
    lines.append("")
    status_map = {
        "exact":          ("OK", f"Eindeutiger Match: `{res['filtered'][0]['id']}`" if res['filtered'] else ""),
        "multiple_same":  ("AMBIGUOUS", f"{res['filtered_count']} Treffer mit passendem Type"),
        "single_no_match":("WARN", f"Type mismatch ({res['filtered'][0]['type_short']} statt {res['expected_type']})"),
        "multi_no_match": ("WARN", f"Kein Treffer mit erwartetem Type {res['expected_type']}"),
        "no_hit":         ("FAIL", "Kein Master-Match"),
    }
    code, msg = status_map.get(res["mode"], ("?", "?"))
    lines.append(f"- **Ergebnis**: `[{code}]` {msg}")
    lines.append("")
    return lines


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--update-report", action="store_true",
                        help="Aktualisiert die Live-Test-Sektion in BUILD_REPORT.md")
    args = parser.parse_args(argv)

    if not MASTER_JSON.exists():
        print(f"[error] Master-JSON nicht gefunden: {MASTER_JSON}", file=sys.stderr)
        return 1
    master = load_master(MASTER_JSON)
    print(f"[info] Master geladen: {len(master['themes'])} Themen, "
          f"{len(master['lookup'])} Lookup-Keys", file=sys.stderr)

    results: list[dict] = []
    for chart in LIVE_CHARTS:
        res = verify_chart(master, chart)
        results.append(res)
        for line in render_result_human(res):
            print(line)
        print()

    # Zusammenfassung
    summary = {
        "ok":       sum(1 for r in results if r["mode"] == "exact"),
        "ambig":    sum(1 for r in results if r["mode"] == "multiple_same"),
        "warn":     sum(1 for r in results if r["mode"] in ("single_no_match", "multi_no_match")),
        "fail":     sum(1 for r in results if r["mode"] == "no_hit"),
        "total":    len(results),
    }
    print("Zusammenfassung:")
    print(f"  OK (exact + Profil-Match):       {summary['ok']}")
    print(f"  AMBIGUOUS (>1 Type-Treffer):     {summary['ambig']}")
    print(f"  WARN (Type-Mismatch):            {summary['warn']}")
    print(f"  FAIL (kein Master-Match):        {summary['fail']}")
    print(f"  Total:                           {summary['total']}")

    if args.update_report:
        update_report(results, summary)
        print(f"\n[ok] BUILD_REPORT.md aktualisiert (Sektion 'Live-Test-Ergebnisse')")

    # Exitcode: 0 wenn keine FAIL, sonst 2
    return 0 if summary["fail"] == 0 else 2


def update_report(results: list[dict], summary: dict) -> None:
    """Schreibt/ersetzt die 'Live-Test-Ergebnisse'-Sektion in BUILD_REPORT.md."""
    if not REPORT_MD.exists():
        print(f"[warn] {REPORT_MD} existiert nicht, ueberspringe Report-Update", file=sys.stderr)
        return

    body = REPORT_MD.read_text(encoding="utf-8")
    section_lines: list[str] = []
    section_lines.append("## Live-Test-Ergebnisse (Iteration 2)")
    section_lines.append("")
    section_lines.append(
        "Die 5 Test-Charts aus der Iteration-2-Spezifikation wurden gegen den "
        "v3.1-Master gemappt. Profil-basierte Disambiguierung kennzeichnet den "
        "★-Treffer."
    )
    section_lines.append("")
    section_lines.append("**Profil → Type-Konvention** (HD-Standard):")
    section_lines.append("")
    section_lines.append("- RAX: `1/3`, `1/4`, `2/4`, `2/5`, `3/5`, `3/6`")
    section_lines.append("- LAX: `4/6`, `5/1`, `5/2`, `6/2`, `6/3`")
    section_lines.append("- JUX: `4/1`")
    section_lines.append("")
    section_lines.append(
        f"**Resultat**: {summary['ok']} OK, {summary['ambig']} AMBIGUOUS, "
        f"{summary['warn']} WARN, {summary['fail']} FAIL "
        f"(von {summary['total']})."
    )
    section_lines.append("")
    for res in results:
        section_lines.extend(render_result_md(res))

    # Offene Luecken / WARNs
    warn_results = [r for r in results
                    if r["mode"] in ("single_no_match", "multi_no_match", "no_hit")]
    if warn_results:
        section_lines.append("### Offene Luecken (WARN/FAIL)")
        section_lines.append("")
        section_lines.append(
            "Charts, deren erwarteter Cross-Type nicht im Master gefunden wurde. "
            "I. d. R. bedeutet das, dass die Gate-Konstellation des Charts kein "
            "Q3-Master-Theme mit dem entsprechenden Type hat (echter HD-Mismatch "
            "zwischen Chart-Daten und Theme-Katalog, oder Quartal-Varianten-Problem)."
        )
        section_lines.append("")
        for r in warn_results:
            c = r["chart"]
            section_lines.append(
                f"- **{c['name']}** ({c['profile']}, {r['key']}): erwartet "
                f"{r['expected_type']}, gefunden: " +
                (", ".join(f"{h['type_short']}" for h in r["raw_hits"]) or "(keine Treffer)")
            )
            section_lines.append(
                f"  - Hypothese: {c['expected_note']} — die Gate-Konstellation "
                f"({c['pSun']},{c['pEarth']},{c['dSun']},{c['dEarth']}) hat aber "
                "kein passendes Master-Theme. Datenseite pruefen (Quartal-Variante? "
                "Anderes RAX/LAX mit aehnlichem Namen?)."
            )
        section_lines.append("")

    section_text = "\n".join(section_lines).rstrip() + "\n"

    # Marker
    start_marker = "## Live-Test-Ergebnisse"
    if start_marker in body:
        # Sektion ersetzen
        before = body.split(start_marker, 1)[0].rstrip() + "\n\n"
        # Naechste ##-Section finden
        rest_idx = body.index(start_marker) + len(start_marker)
        rest = body[rest_idx:]
        # Suche naechste ##-Zeile (nicht ###)
        next_section_pos = -1
        for line_start in range(len(rest)):
            if rest[line_start] == "\n" and rest[line_start+1:line_start+3] == "##" and rest[line_start+3:line_start+4] != "#":
                next_section_pos = line_start + 1
                break
        if next_section_pos > 0:
            after = rest[next_section_pos:]
        else:
            after = ""
        new_body = before + section_text + ("\n" + after if after else "")
    else:
        new_body = body.rstrip() + "\n\n" + section_text
    REPORT_MD.write_text(new_body, encoding="utf-8")


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
