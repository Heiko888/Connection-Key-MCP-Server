// lib/readingTemplates.ts
export type HDType = 'MG' | 'Manifestor' | 'Generator' | 'Projektor' | 'Reflektor';
export type ReadingContext = 'business' | 'gesundheit' | 'beziehung' | 'privat';

type Sections = {
  title: string;
  body: string; // Markdown
};

type TypeTemplate = {
  type: HDType;
  base: Sections[];              // Grundtext im von dir gewünschten Stil
  contextAddons?: Partial<Record<ReadingContext, Sections[]>>; // optionale Zusätze
};

export const typeTemplates: Record<HDType, TypeTemplate> = {
  MG: {
    type: 'MG',
    base: [
      {
        title: 'Manifestierender Generator (MG)',
        body: [
          'Du bist ein **Manifestierender Generator** – eine Mischung aus Generator und Manifestor.',
          'Das bedeutet: Du hast die nachhaltige Lebensenergie eines Generators **plus** die Power eines Manifestors, Dinge direkt in die Welt zu bringen.',
        ].join(' ')
      },
      {
        title: 'Strategie',
        body: [
          'Deine Strategie ist zweistufig:',
          '1) **Reagieren** – dein Bauch zeigt dir ein klares *Ja* oder *Nein*.',
          '2) **Informieren** – wenn du losgehst, informiere die Menschen, die betroffen sind, um Widerstände zu vermeiden.',
        ].join('\n')
      },
      {
        title: 'Stärken & Lernfelder',
        body: [
          'Du bist schnell, findest Abkürzungen, kannst mehrere Dinge parallel bewegen.',
          'Achtung **Ungeduld**: Du willst oft schneller sein als der Prozess – das führt zu Frust.',
          'Lernaufgabe: **Geduld**. Projekte zu beenden ist kein Muss – Abbruch kann stimmig sein. Dein Bauch zeigt dir den nächsten Schritt.',
        ].join(' ')
      },
    ],
    contextAddons: {
      business: [
        {
          title: 'Business‑Fokus',
          body: [
            'Nutze deine Vielseitigkeit für Prototyping und schnelle Iteration.',
            'Informiere Stakeholder früh – das glättet Prozesse und beschleunigt Entscheidungen.',
            'Setze klare **Done‑Kriterien**, um „ewiges Optimieren“ zu verhindern.',
          ].join(' ')
        }
      ],
      gesundheit: [
        {
          title: 'Gesundheit‑Fokus',
          body: [
            'Plane **Regenerationsfenster**, auch wenn du dich „schnell“ fühlst.',
            'Achte auf Bauchsignale bei Ernährung/Training: weniger Kopf, mehr Körper.',
          ].join(' ')
        }
      ],
      beziehung: [
        {
          title: 'Beziehungs‑Fokus',
          body: [
            'Teile Impulse **vorher** mit („Ich habe gerade den Drang, …“). Das schafft Sicherheit.',
            'Akzeptiere, dass sich Interessen sprunghaft anfühlen – nenne es **Neugier** statt „unstet“.',
          ].join(' ')
        }
      ],
      privat: [
        {
          title: 'Privat‑Fokus',
          body: [
            'Gestalte deinen Tag in **Blöcken** (kurz & fokussiert).',
            'Räume bewusst **Wechselzeiten** ein – MG‑Energie liebt dynamische Übergänge.',
          ].join(' ')
        }
      ]
    }
  },

  Manifestor: {
    type: 'Manifestor',
    base: [
      {
        title: 'Manifestor',
        body: [
          'Du bist ein **Manifestor** – ein Initiator. Du bringst Bewegung in die Welt.',
          'Du eröffnest Wege und inspirierst andere, Dinge zu starten.',
        ].join(' ')
      },
      {
        title: 'Strategie',
        body: '**Informieren, bevor du handelst.** Menschen stellen sich weniger in den Weg, wenn sie abgeholt sind.'
      },
      {
        title: 'Stärken & Energie',
        body: [
          'Deine Kraft liegt im **Starten** – du musst nicht alles zu Ende führen.',
          'Teile deine Energie gut ein – du bist nicht für Dauer‑Power gebaut.',
        ].join(' ')
      },
    ],
    contextAddons: {
      business: [{ title: 'Business‑Fokus', body: 'Definiere klar den **Kick‑off** und übergib früh an Umsetzer‑Teams.' }],
      gesundheit: [{ title: 'Gesundheit‑Fokus', body: 'Plane **echte Off‑Phasen** ein – Initiationsphasen und Erholung abwechseln.' }],
      beziehung: [{ title: 'Beziehungs‑Fokus', body: 'Sag früh, **was** du tust und **warum** – das reduziert Missverständnisse.' }],
      privat: [{ title: 'Privat‑Fokus', body: 'Eigene Rituale zum Entladen (Spaziergang, Schreiben) halten dich klar und frei.' }],
    }
  },

  Generator: {
    type: 'Generator',
    base: [
      {
        title: 'Generator',
        body: [
          'Du bist ein **Generator** – Energiespezialist mit nachhaltiger Kraft.',
          'Deine Aufgabe: **Reagieren**, nicht initiieren. Dein Bauch entscheidet.',
        ].join(' ')
      },
      {
        title: 'Strategie',
        body: [
          'Wenn der Bauch **Ja** sagt, trägst du lange und kraftvoll.',
          'Ohne Bauch‑Ja kommen **Frust** und Leerlauf.',
        ].join(' ')
      },
      {
        title: 'Meisterschaft',
        body: 'Du bist hier, **Meisterschaft** aufzubauen – tief, stetig, mit Freude am Tun.'
      },
    ],
    contextAddons: {
      business: [{ title: 'Business‑Fokus', body: 'Sag **Ja** zu Aufgaben, die Resonanz haben – dann lieferst du konstant stark.' }],
      gesundheit: [{ title: 'Gesundheit‑Fokus', body: 'Gleichmäßige Belastung + Schlafqualität priorisieren – Bauchgefühl als Kompass.' }],
      beziehung: [{ title: 'Beziehungs‑Fokus', body: 'Reagiere auf Einladungen/Fragen („Hast du Lust…?“) – dein Bauch antwortet ehrlich.' }],
      privat: [{ title: 'Privat‑Fokus', body: 'Folge **Freude‑Signalen** im Alltag: kleine „Ja‑Momente“ füllen deinen Akku.' }],
    }
  },

  Projektor: {
    type: 'Projektor',
    base: [
      {
        title: 'Projektor',
        body: [
          'Du bist ein **Projektor** – hier, um zu **leiten**.',
          'Dein Talent: Menschen und Systeme erkennen, Energie klug lenken.',
        ].join(' ')
      },
      {
        title: 'Strategie',
        body: 'Auf **Einladung** warten – dann wirkt deine Weisheit am stärksten.'
      },
      {
        title: 'Energie & Fokus',
        body: 'Manage deine Energie bewusst, setze **Quality‑Time** statt Viel‑Tun.'
      },
    ],
    contextAddons: {
      business: [{ title: 'Business‑Fokus', body: 'Positioniere dich als **Guide** – klare Analysen, gezielte Empfehlungen.' }],
      gesundheit: [{ title: 'Gesundheit‑Fokus', body: 'Regelmäßige Pausen + Schlaf priorisieren – dein System liebt **Tiefe vor Menge**.' }],
      beziehung: [{ title: 'Beziehungs‑Fokus', body: 'Wertschätzung & **Einladung** sind Nährstoff – wähle Umfelder, die dich sehen.' }],
      privat: [{ title: 'Privat‑Fokus', body: 'Weniger To‑dos, mehr **Wirkung**: kleine Hebel mit großer Entlastung.' }],
    }
  },

  Reflektor: {
    type: 'Reflektor',
    base: [
      {
        title: 'Reflektor',
        body: [
          'Du bist ein **Reflektor** – selten, offen, spiegelnd.',
          'Du zeigst, wie es deiner Umgebung geht – ein feiner Seismograph.',
        ].join(' ')
      },
      {
        title: 'Strategie',
        body: 'Für große Entscheidungen: **einen Mondzyklus (≈28 Tage) abwarten** – Perspektiven sammeln, Klarheit gewinnen.'
      },
      {
        title: 'Umfeld',
        body: 'Wähle Orte und Menschen, bei denen du **aufblühst** – Umgebung ist dein Schlüssel.'
      },
    ],
    contextAddons: {
      business: [{ title: 'Business‑Fokus', body: 'Du spürst Teamklima sofort – nutze das als Früherkennung für Kultur & Prozesse.' }],
      gesundheit: [{ title: 'Gesundheit‑Fokus', body: 'Achte auf **Reizdosierung** und milde Routinen – dein System reguliert fein.' }],
      beziehung: [{ title: 'Beziehungs‑Fokus', body: 'Wähle **weise** – Partnerschaften prägen dein Erleben stark.' }],
      privat: [{ title: 'Privat‑Fokus', body: 'Natur, Licht, Schlafrhythmus: Umfeld‑Hygiene = Energiequalität.' }],
    }
  },
};

// Kleiner Helper, um Markdown zusammenzusetzen
export function buildReadingMarkdown(
  type: HDType,
  context?: ReadingContext
): string {
  const t = typeTemplates[type];
  if (!t) return '—';

  const parts: string[] = [];
  t.base.forEach(s => {
    parts.push(`## ${s.title}\n${s.body}`);
  });

  if (context && t.contextAddons?.[context]) {
    t.contextAddons[context]!.forEach(s => {
      parts.push(`### ${s.title}\n${s.body}`);
    });
  }

  // Abschluss-CTA
  parts.push('\n---\n**Reflexion:** Welche 1–2 Punkte möchtest du in den nächsten 7 Tagen konkret ausprobieren?');
  return parts.join('\n\n');
}
