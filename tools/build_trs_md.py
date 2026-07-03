# -*- coding: utf-8 -*-
"""Baut aus den TRS-Importdateien (production/knowledge*) bereinigte Markdown-Dateien
unter knowledge/trs/ im Connection-Key-MCP-Server-Repo."""
import os, re, sys

REPO = '/home/user/Connection-Key-MCP-Server'
SRC_MAIN = os.path.join(REPO, 'production', 'knowledge')
SRC_DIS = os.path.join(REPO, 'production', 'knowledge_disabled')
OUT = os.path.join(REPO, 'knowledge', 'trs')

LIG = {'ﬀ': 'ff', 'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬃ': 'ffi', 'ﬄ': 'ffl', 'ﬅ': 'ft', 'ﬆ': 'st'}
SENT_END = re.compile(r'[.!?:…"”\)\]]$')

def load_sections(path):
    txt = open(path, encoding='utf-8', errors='replace').read()
    parts = re.split(r'^## (.+\.pdf)\s*$', txt, flags=re.M)
    return {parts[i].strip(): parts[i + 1] for i in range(1, len(parts), 2)}

def clean(text):
    text = text.replace('﻿', '')
    for k, v in LIG.items():
        text = text.replace(k, v)
    # Tab-/Punkt-Bullets an Zeilenanfängen -> Markdown-Liste
    text = re.sub(r'(?m)^[\t ]*[•◦▪·][\t ]*', '- ', text)
    # PDF-Zeilenumbrüche heilen: Zeile endet mit Leerzeichen und ohne Satzende -> mit Folgezeile verbinden
    lines = text.split('\n')
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        while (line.endswith(' ') and line.strip()
               and not line.lstrip().startswith('#')
               and not SENT_END.search(line.rstrip())
               and i + 1 < len(lines) and lines[i + 1].strip()
               and not re.match(r'^[\t ]*(?:[-#⸻]|---)', lines[i + 1])):
            line = line.rstrip() + ' ' + lines[i + 1].strip()
            i += 1
        out.append(line.rstrip())
        i += 1
    text = '\n'.join(out)
    # ⸻-Trennzeilen -> Markdown-HR, Rest inline -> Gedankenstrich
    text = re.sub(r'(?m)^\s*⸻+\s*$', '---', text)
    text = text.replace('⸻', '—')
    # mehr als 2 Leerzeilen eindampfen
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def anchor_gate_headings(raw):
    """Setzt pro Tor genau eine ##-Überschrift: die Tore werden in allen Quell-PDFs
    strikt aufsteigend behandelt, also wird je Tor n die erste Erwähnung nach dem
    vorigen Anker gesucht. Titelzeilen (kurz, ohne Satzende) werden selbst zur
    Überschrift, sonst wird ein neutraler Anker '## Tor n' davor eingefügt.
    Läuft VOR clean(), damit unwrap Titelzeilen nicht mit Folgetext verschmilzt."""
    lines = raw.split('\n')
    pos = 0
    found = []
    for n in range(1, 65):
        pat = re.compile(r'\bTor\s+%d\b(?!\d)' % n)
        for i in range(pos, len(lines)):
            if pat.search(lines[i]):
                stripped = lines[i].strip()
                # Nur echte Titelzeilen promoten: beginnt mit "Tor n", kurz, kein
                # Satzende UND keine umgebrochene Zeile (PDF-Wrap = Leerzeichen am Ende)
                if (stripped.startswith('Tor %d' % n) and len(stripped) <= 90
                        and not SENT_END.search(stripped)
                        and not lines[i].endswith(' ')):
                    lines[i] = '## ' + stripped
                else:
                    lines.insert(i, '')
                    lines.insert(i + 1, '## Tor %d' % n)
                    i += 2
                pos = i + 1
                found.append(n)
                break
    return '\n'.join(lines), found

def header(title, sources, extra=''):
    src = ', '.join('`%s`' % s for s in sources)
    h = ('# %s\n\n'
         '> **Quelle:** „The Real Secret – Master of Manifestation“ – %s\n'
         '> **Aufbereitung:** automatisch aus PDF-Export extrahiert und bereinigt (2026-07-03).\n'
         '> **Status:** strukturell geprüft – fachliche Inhaltsprüfung noch ausstehend (siehe PRUEFBERICHT.md).\n') % (title, src)
    if extra:
        h += '> **Hinweis:** %s\n' % extra
    return h + '\n'

def write(relpath, content):
    p = os.path.join(OUT, relpath)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(content.rstrip() + '\n')
    print('%7d B  %s' % (os.path.getsize(p), relpath))

os.makedirs(OUT, exist_ok=True)

# ---------- 1) Typen ----------
sec = load_sections(os.path.join(SRC_MAIN, 'types-detailed.txt'))
ORDER = [
    ('Generator_BONUS_1730976656894.pdf', 'Generator'),
    ('MG_BONUS.pdf', 'Manifestierender Generator'),
    ('Manifestor_BONUS.pdf', 'Manifestor'),
    ('Projektor_Typen.pdf', 'Projektor'),
    ('Projektor_BONUS.pdf', 'Projektor – Vertiefung (Bonus)'),
    ('Reflektor_BONUS.pdf', 'Reflektor'),
]
body = ''.join('\n## %s\n\n%s\n' % (t, clean(sec[k])) for k, t in ORDER)
write('typen.md', header('Die fünf Typen', [k for k, _ in ORDER]) + body)

# ---------- 2) Autoritäten ----------
sec = load_sections(os.path.join(SRC_MAIN, 'authority-detailed.txt'))
ORDER = [
    ('Emotionale_Autorität.pdf', 'Emotionale Autorität (Solarplexus)'),
    ('Sakrale_Autorität.pdf', 'Sakrale Autorität'),
    ('Milz_Autorität.pdf', 'Milz-Autorität'),
    ('Ego-Autorität.pdf', 'Ego-Autorität (Herz)'),
    ('G_Zenter_Autorität.pdf', 'Selbstprojizierte Autorität (G-Zentrum)'),
    ('Mentale_Autorität_(Projektor)_1731246348522.pdf', 'Mentale Autorität (Projektor)'),
    ('Mond_Autorität.pdf', 'Mond-Autorität (Reflektor)'),
]
body = ''.join('\n## %s\n\n%s\n' % (t, clean(sec[k])) for k, t in ORDER)
write('autoritaeten.md', header('Die sieben Autoritäten', [k for k, _ in ORDER]) + body)

# ---------- 3) Zentren ----------
sec = load_sections(os.path.join(SRC_MAIN, 'centers-detailed.txt'))
ORDER = [
    ('Kronenzentrum_(definiert)_.pdf', 'Kronenzentrum – definiert'),
    ('Krone_(offen)_Erklärung.pdf', 'Kronenzentrum – offen'),
    ('Ajna_(definiert).pdf', 'Ajna – definiert'),
    ('Ajna_(offen).pdf', 'Ajna – offen'),
    ('Hals_(definiert).pdf', 'Halszentrum – definiert'),
    ('Hals_(offen)_Erklärung.pdf', 'Halszentrum – offen'),
    ('G_Zentrum_(definiert).pdf', 'G-Zentrum – definiert'),
    ('G-Zentrum_(offen)_.pdf', 'G-Zentrum – offen'),
    ('Ego_Zentrum_(definiert).pdf', 'Ego-/Herzzentrum – definiert'),
    ('Ego_Zentrum_(offen).pdf', 'Ego-/Herzzentrum – offen'),
    ('Sakral_(definiert).pdf', 'Sakralzentrum – definiert'),
    ('Sakral_(offen).pdf', 'Sakralzentrum – offen'),
    ('Emotionszentrum_(definiert).pdf', 'Emotionszentrum (Solarplexus) – definiert'),
    ('Emotionszentrum_(offen).pdf', 'Emotionszentrum (Solarplexus) – offen'),
    ('Milz_(definiert)_.pdf', 'Milzzentrum – definiert'),
    ('Milz_(offen).pdf', 'Milzzentrum – offen'),
    ('Wurzel_(definiert).pdf', 'Wurzelzentrum – definiert'),
    ('Wurzelzentrum_(offen).pdf', 'Wurzelzentrum – offen'),
]
body = ''.join('\n## %s\n\n%s\n' % (t, clean(sec[k])) for k, t in ORDER)
write('zentren.md', header('Die neun Zentren – definiert & offen', [k for k, _ in ORDER]) + body)

# ---------- 4) Profile / Linien ----------
sec = load_sections(os.path.join(SRC_MAIN, 'profiles-detailed.txt'))
body = ''.join('\n## Linie %d\n\n%s\n' % (n, clean(sec['Linie_%d.pdf' % n])) for n in range(1, 7))
write('profile-linien.md', header('Die sechs Linien (Profile)', ['Linie_%d.pdf' % n for n in range(1, 7)]) + body)

# ---------- 5) Kanäle ----------
sec = load_sections(os.path.join(SRC_DIS, 'channels-complete.txt'))
def chan_key(name):
    a, b = re.match(r'(\d+)-(\d+)_', name).groups()
    lo, hi = sorted((int(a), int(b)))
    return (lo, hi)
names = sorted(sec.keys(), key=chan_key)
body = ''
for name in names:
    a, b = re.match(r'(\d+)-(\d+)_', name).groups()
    body += '\n## Kanal %s-%s\n\n%s\n' % (a, b, clean(sec[name]))
extra = 'Es sind 34 von 36 Kanälen enthalten – die Kanäle 26-44 und 27-50 fehlen im Quellmaterial.'
write('kanaele.md', header('Die Kanäle (34 von 36)', ['channels-complete.txt (34 PDFs)'], extra) + body)

# ---------- 6) Splits & Pfeile ----------
sec = load_sections(os.path.join(SRC_MAIN, 'splits-detailed.txt'))
write('splits.md', header('Splits (Definitionstypen) ausleben', list(sec.keys())) + '\n' + clean(list(sec.values())[0]))
sec = load_sections(os.path.join(SRC_MAIN, 'arrows-detailed.txt'))
write('pfeile-praxis.md', header('Praxisaufgaben – die vier Pfeile (Variablen)', list(sec.keys())) + '\n' + clean(list(sec.values())[0]))

# ---------- 7) Tore je Planet ----------
sec = load_sections(os.path.join(SRC_DIS, 'gates-complete.txt'))
GATES = [
    ('64_Tore___Gene_Keys_(bewusste_Sonne).pdf', 'tore/bewusste-sonne.md', 'Die 64 Tore & Gene Keys – Bewusste Sonne', ''),
    ('64_Tore_(unbewusste_Sonne).pdf', 'tore/unbewusste-sonne.md', 'Die 64 Tore – Unbewusste Sonne', 'Tor 20 fehlt im Quellmaterial (63 von 64 Toren).'),
    ('64_Tore_(bewusste_Erde).pdf', 'tore/bewusste-erde.md', 'Die 64 Tore – Bewusste Erde', ''),
    ('64_Tore_(unbewusste_Erde).pdf', 'tore/unbewusste-erde.md', 'Die 64 Tore – Unbewusste Erde', ''),
    ('Bewusster_Mond.pdf', 'tore/bewusster-mond.md', 'Die 64 Tore – Bewusster Mond', ''),
    ('Unbewusster_Mond.pdf', 'tore/unbewusster-mond.md', 'Die 64 Tore – Unbewusster Mond', ''),
    ('Merkur_Bewusst.pdf', 'tore/bewusster-merkur.md', 'Die 64 Tore – Bewusster Merkur', ''),
    ('Unbewusst_Merkur.pdf', 'tore/unbewusster-merkur.md', 'Die 64 Tore – Unbewusster Merkur', ''),
    ('Nordknoten_(bewusst).pdf', 'tore/bewusster-nordknoten.md', 'Die 64 Tore – Bewusster Nordknoten', ''),
    ('Nordknoten_(unbewusst).pdf', 'tore/unbewusster-nordknoten.md', 'Die 64 Tore – Unbewusster Nordknoten', ''),
    ('Südknoten_(bewusst).pdf', 'tore/bewusster-suedknoten.md', 'Die 64 Tore – Bewusster Südknoten', ''),
    ('Südknoten_(unbewusst).pdf', 'tore/unbewusster-suedknoten.md', 'Die 64 Tore – Unbewusster Südknoten', ''),
    ('Pluto bewusst.pdf', 'tore/bewusster-pluto.md', 'Die 64 Tore – Bewusster Pluto', ''),
    ('Reflexionsfragen___Zusammenfassung.pdf', 'tore/reflexionsfragen.md', 'Tore – Reflexionsfragen & Zusammenfassung', ''),
]
for pdf, rel, title, note in GATES:
    if pdf == 'Reflexionsfragen___Zusammenfassung.pdf':
        body = clean(sec[pdf])
    else:
        anchored, found = anchor_gate_headings(sec[pdf])
        body = clean(anchored)
        missing = sorted(set(range(1, 65)) - set(found))
        if missing:
            print('   !! %s: Tore ohne Anker: %s' % (rel, missing))
    write(rel, header(title, [pdf], note) + '\n' + body)

print('\nFertig. Ausgabe unter', OUT)
