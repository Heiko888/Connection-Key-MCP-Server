/**
 * Human Design - Ausführliche Tor-Beschreibungen
 * 
 * Alle 64 Tore mit Beschreibungen, Keywords und Linien-Bedeutungen
 */

export interface GateDescription {
  number: number;
  name: string;
  center: string;
  description: string;
  keywords: string[];
  gift: string;
  shadow: string;
  lines: {
    [key: number]: {
      name: string;
      description: string;
    };
  };
}

/**
 * Tor-Beschreibungen für alle 64 Tore
 */
export const GATE_DESCRIPTIONS: Record<number, GateDescription> = {
  1: {
    number: 1,
    name: 'Die Schöpferkraft',
    center: 'G-Zentrum',
    description: 'Das Tor der Selbstexpression und kreativen Kraft. Die Fähigkeit, die eigene Wahrheit auszudrücken und anderen den Weg zu zeigen.',
    keywords: ['Kreativität', 'Selbstausdruck', 'Führung', 'Einzigartigkeit'],
    gift: 'Authentische Selbstexpression',
    shadow: 'Arroganz oder Rückzug',
    lines: {
      1: { name: 'Kreation durch Willenskraft', description: 'Die Kraft, durch reinen Willen zu erschaffen.' },
      2: { name: 'Liebe ist Licht', description: 'Kreativität durch Liebe und Mitgefühl.' },
      3: { name: 'Energie ist ewige Freude', description: 'Freude als Motor der Kreativität.' },
      4: { name: 'Eros', description: 'Kreative Energie durch Verbindung.' },
      5: { name: 'Energie als Attraktion', description: 'Anziehungskraft der eigenen Energie.' },
      6: { name: 'Objektivität', description: 'Kreativität durch klaren Verstand.' }
    }
  },

  2: {
    number: 2,
    name: 'Das Empfangende',
    center: 'G-Zentrum',
    description: 'Das Tor der Richtung und des Wissens über den eigenen Weg. Die Fähigkeit, die richtige Richtung zu erkennen.',
    keywords: ['Richtung', 'Rezeptivität', 'Hingabe', 'Vertrauen'],
    gift: 'Inneres Wissen über den richtigen Weg',
    shadow: 'Orientierungslosigkeit',
    lines: {
      1: { name: 'Intuition', description: 'Spontanes Wissen über die Richtung.' },
      2: { name: 'Genie', description: 'Natürliche Begabung für den Weg.' },
      3: { name: 'Geduld', description: 'Warten auf die richtige Richtung.' },
      4: { name: 'Zurückgezogenheit', description: 'Innere Einkehr für Klarheit.' },
      5: { name: 'Erleuchtung', description: 'Plötzliche Einsicht in den Weg.' },
      6: { name: 'Fixierung', description: 'Unerschütterliches Wissen um die Richtung.' }
    }
  },

  3: {
    number: 3,
    name: 'Die Schwierigkeit am Anfang',
    center: 'Sakral',
    description: 'Das Tor der Innovation durch Mutation. Die Kraft, Neues zu beginnen und Ordnung aus dem Chaos zu schaffen.',
    keywords: ['Innovation', 'Mutation', 'Neuanfang', 'Chaos'],
    gift: 'Kreative Anpassung',
    shadow: 'Chaos ohne Ordnung',
    lines: {
      1: { name: 'Synthese', description: 'Ordnung aus Chaos erschaffen.' },
      2: { name: 'Unreife', description: 'Zu früh handeln.' },
      3: { name: 'Überleben', description: 'Durchhaltevermögen in schwierigen Zeiten.' },
      4: { name: 'Charisma', description: 'Andere durch Wandel führen.' },
      5: { name: 'Opfer', description: 'Sich für den Wandel hingeben.' },
      6: { name: 'Kapitulation', description: 'Dem Prozess vertrauen.' }
    }
  },

  4: {
    number: 4,
    name: 'Die jugendliche Torheit',
    center: 'Ajna',
    description: 'Das Tor der Formeln und Antworten. Die mentale Fähigkeit, logische Lösungen zu finden.',
    keywords: ['Logik', 'Antworten', 'Formeln', 'Verstehen'],
    gift: 'Logisches Verstehen',
    shadow: 'Dogmatismus',
    lines: {
      1: { name: 'Vergnügen', description: 'Freude am Verstehen.' },
      2: { name: 'Akzeptanz', description: 'Unwissen akzeptieren.' },
      3: { name: 'Unvorsichtigkeit', description: 'Leichtsinnig mit Wissen umgehen.' },
      4: { name: 'Lüge', description: 'Falsche Antworten geben.' },
      5: { name: 'Versuchung', description: 'Vorzeitige Schlüsse ziehen.' },
      6: { name: 'Überschuss', description: 'Zu viele Antworten haben.' }
    }
  },

  5: {
    number: 5,
    name: 'Das Warten',
    center: 'Sakral',
    description: 'Das Tor der Rhythmen und Timing. Die Weisheit, auf den richtigen Moment zu warten.',
    keywords: ['Timing', 'Rhythmus', 'Geduld', 'Natürliche Ordnung'],
    gift: 'Perfektes Timing',
    shadow: 'Ungeduld',
    lines: {
      1: { name: 'Durchhaltevermögen', description: 'Beständig warten können.' },
      2: { name: 'Innerer Frieden', description: 'Ruhe im Warten finden.' },
      3: { name: 'Zwang', description: 'Versucht sein zu handeln.' },
      4: { name: 'Jäger', description: 'Aktiv nach Möglichkeiten suchen.' },
      5: { name: 'Freude', description: 'Freude am Prozess.' },
      6: { name: 'Ertrag', description: 'Ernte zum richtigen Zeitpunkt.' }
    }
  },

  6: {
    number: 6,
    name: 'Der Konflikt',
    center: 'Solarplexus',
    description: 'Das Tor der Intimität und Reibung. Die emotionale Energie, die in Beziehungen entsteht.',
    keywords: ['Intimität', 'Emotion', 'Reibung', 'Sexualität'],
    gift: 'Emotionale Tiefe in Beziehungen',
    shadow: 'Konflikt und Drama',
    lines: {
      1: { name: 'Rückzug', description: 'Sich aus Konflikten zurückziehen.' },
      2: { name: 'Guerilla-Krieg', description: 'Indirekt kämpfen.' },
      3: { name: 'Hingabe', description: 'Sich dem Konflikt stellen.' },
      4: { name: 'Triumph', description: 'Durch Konflikt wachsen.' },
      5: { name: 'Kapitulation', description: 'Aufgeben und loslassen.' },
      6: { name: 'Pazifismus', description: 'Frieden suchen.' }
    }
  },

  7: {
    number: 7,
    name: 'Die Armee',
    center: 'G-Zentrum',
    description: 'Das Tor der Führung und Interaktion. Die Kraft, andere zu führen und zu organisieren.',
    keywords: ['Führung', 'Demokratie', 'Organisation', 'Interaktion'],
    gift: 'Natürliche Führungsqualität',
    shadow: 'Autoritarismus',
    lines: {
      1: { name: 'Autorität', description: 'Führung durch Kompetenz.' },
      2: { name: 'Demokratisch', description: 'Alle einbeziehen.' },
      3: { name: 'Anarchist', description: 'Gegen Autorität rebellieren.' },
      4: { name: 'Abgestimmt', description: 'Im Einklang führen.' },
      5: { name: 'General', description: 'Strategisch führen.' },
      6: { name: 'Administrator', description: 'Organisieren und verwalten.' }
    }
  },

  8: {
    number: 8,
    name: 'Das Zusammenhalten',
    center: 'Kehle',
    description: 'Das Tor des Beitragens und der Kreativität. Die Fähigkeit, seinen einzigartigen Beitrag auszudrücken.',
    keywords: ['Beitrag', 'Kreativität', 'Ausdruck', 'Authentizität'],
    gift: 'Einzigartiger kreativer Ausdruck',
    shadow: 'Nicht beitragen können',
    lines: {
      1: { name: 'Ehrlichkeit', description: 'Authentisch ausdrücken.' },
      2: { name: 'Dienst', description: 'Für andere da sein.' },
      3: { name: 'Null-Toleranz', description: 'Keine Kompromisse.' },
      4: { name: 'Respekt', description: 'Andere wertschätzen.' },
      5: { name: 'Timing', description: 'Zum richtigen Zeitpunkt beitragen.' },
      6: { name: 'Pragmatismus', description: 'Praktisch beitragen.' }
    }
  },

  9: {
    number: 9,
    name: 'Die kleine Zähmungskraft',
    center: 'Sakral',
    description: 'Das Tor der Fokussierung und des Details. Die Kraft, sich auf die Feinheiten zu konzentrieren.',
    keywords: ['Fokus', 'Detail', 'Konzentration', 'Perfektion'],
    gift: 'Perfektionierung durch Details',
    shadow: 'In Details verlieren',
    lines: {
      1: { name: 'Sinnlichkeit', description: 'Durch Sinne fokussieren.' },
      2: { name: 'Entschluss', description: 'Entschlossen bleiben.' },
      3: { name: 'Zusammenhalt', description: 'Details verbinden.' },
      4: { name: 'Hingabe', description: 'Sich Details widmen.' },
      5: { name: 'Überzeugung', description: 'Andere vom Detail überzeugen.' },
      6: { name: 'Dankbarkeit', description: 'Details wertschätzen.' }
    }
  },

  10: {
    number: 10,
    name: 'Das Auftreten',
    center: 'G-Zentrum',
    description: 'Das Tor der Selbstliebe und des Selbstausdrucks. Die Kraft, sich selbst zu sein und dies zu zeigen.',
    keywords: ['Selbstliebe', 'Verhalten', 'Authentizität', 'Sein'],
    gift: 'Natürliches Sein',
    shadow: 'Selbstverurteilung',
    lines: {
      1: { name: 'Bescheidenheit', description: 'Demut im Auftreten.' },
      2: { name: 'Eremit', description: 'Zurückgezogen, aber authentisch.' },
      3: { name: 'Märtyrer', description: 'Sich für andere aufopfern.' },
      4: { name: 'Opportunist', description: 'Flexibel im Verhalten.' },
      5: { name: 'Ketzer', description: 'Anders sein als andere.' },
      6: { name: 'Rollenmodell', description: 'Vorbild für andere sein.' }
    }
  },

  13: {
    number: 13,
    name: 'Gemeinschaft mit Menschen',
    center: 'G-Zentrum',
    description: 'Das Tor des Zuhörens und der Geheimnisse. Die Fähigkeit, die Geschichten anderer Menschen zu bewahren.',
    keywords: ['Zuhören', 'Geheimnisse', 'Erfahrung', 'Gemeinschaft'],
    gift: 'Empathisches Zuhören',
    shadow: 'Geheimnisse preisgeben',
    lines: {
      1: { name: 'Empathie', description: 'Tiefes Verständnis für andere.' },
      2: { name: 'Bigotterie', description: 'Vorsicht vor Vorurteilen.' },
      3: { name: 'Pessimist', description: 'Zweifel an Geschichten.' },
      4: { name: 'Ermüdung', description: 'Erschöpfung vom Zuhören.' },
      5: { name: 'Erlöser', description: 'Heilung durch Zuhören.' },
      6: { name: 'Optimist', description: 'Hoffnung bewahren.' }
    }
  },

  20: {
    number: 20,
    name: 'Die Betrachtung',
    center: 'Kehle',
    description: 'Das Tor des Jetzt und der Gegenwärtigkeit. Die Kraft, im Moment zu sein und zu handeln.',
    keywords: ['Präsenz', 'Jetzt', 'Bewusstheit', 'Ausdruck'],
    gift: 'Gegenwärtigkeit',
    shadow: 'Oberflächlichkeit',
    lines: {
      1: { name: 'Oberflächlichkeit', description: 'An der Oberfläche bleiben.' },
      2: { name: 'Dogmatismus', description: 'Starre Ansichten.' },
      3: { name: 'Selbst-Bewusstheit', description: 'Sich selbst erkennen.' },
      4: { name: 'Anwendung', description: 'Wissen anwenden.' },
      5: { name: 'Realismus', description: 'Praktisch sein.' },
      6: { name: 'Weisheit', description: 'Tiefes Verstehen.' }
    }
  },

  27: {
    number: 27,
    name: 'Die Ernährung',
    center: 'Sakral',
    description: 'Das Tor der Fürsorge und Verantwortung. Die Kraft, für andere zu sorgen und zu nähren.',
    keywords: ['Fürsorge', 'Verantwortung', 'Nähren', 'Unterstützung'],
    gift: 'Selbstlose Fürsorge',
    shadow: 'Überfürsorge',
    lines: {
      1: { name: 'Selbstsucht', description: 'Zuerst für sich sorgen.' },
      2: { name: 'Selbstgenügsamkeit', description: 'Unabhängig sein.' },
      3: { name: 'Gier', description: 'Zu viel wollen.' },
      4: { name: 'Großzügigkeit', description: 'Freigiebig teilen.' },
      5: { name: 'Exekutiv', description: 'Verantwortung übernehmen.' },
      6: { name: 'Wachsamkeit', description: 'Auf alles achten.' }
    }
  },

  34: {
    number: 34,
    name: 'Die Macht des Großen',
    center: 'Sakral',
    description: 'Das Tor der Kraft und Macht. Die pure sakrale Energie, Dinge zu tun.',
    keywords: ['Kraft', 'Macht', 'Tun', 'Energie'],
    gift: 'Kraftvolle Präsenz',
    shadow: 'Rohe Gewalt',
    lines: {
      1: { name: 'Macht, keine Wahrheit', description: 'Kraft ohne Weisheit.' },
      2: { name: 'Impuls', description: 'Spontan handeln.' },
      3: { name: 'Männlichkeit', description: 'Yang-Energie.' },
      4: { name: 'Triumph', description: 'Siegreich sein.' },
      5: { name: 'Vernichtung', description: 'Zerstörerische Kraft.' },
      6: { name: 'Common Sense', description: 'Gesunder Menschenverstand.' }
    }
  },

  11: {
    number: 11,
    name: 'Der Friede',
    center: 'Ajna',
    description: 'Das Tor der Ideen und Konzepte. Die mentale Fähigkeit, neue Gedanken zu empfangen.',
    keywords: ['Ideen', 'Konzepte', 'Mental', 'Inspiration'],
    gift: 'Inspirierte Ideen',
    shadow: 'Mentales Chaos',
    lines: {
      1: { name: 'Obskurität', description: 'Unklare Ideen.' },
      2: { name: 'Strenge', description: 'Disziplin im Denken.' },
      3: { name: 'Realismus', description: 'Praktische Ideen.' },
      4: { name: 'Lehrer', description: 'Ideen weitergeben.' },
      5: { name: 'Philanthrop', description: 'Zum Wohl aller denken.' },
      6: { name: 'Anpassung', description: 'Flexibel bleiben.' }
    }
  },

  12: {
    number: 12,
    name: 'Die Stockung',
    center: 'Kehle',
    description: 'Das Tor der Vorsicht und Artikulation. Die Fähigkeit, im richtigen Moment zu sprechen.',
    keywords: ['Vorsicht', 'Artikulation', 'Ausdruck', 'Timing'],
    gift: 'Perfekt getimter Ausdruck',
    shadow: 'Blockierter Ausdruck',
    lines: {
      1: { name: 'Mönch', description: 'Stille bewahren.' },
      2: { name: 'Reinigung', description: 'Sich von Altem befreien.' },
      3: { name: 'Egoist', description: 'Nur für sich sprechen.' },
      4: { name: 'Prophet', description: 'Vision ausdrücken.' },
      5: { name: 'Pragmatiker', description: 'Praktisch sprechen.' },
      6: { name: 'Metamorphose', description: 'Transformation durch Worte.' }
    }
  },

  14: {
    number: 14,
    name: 'Der Besitz von Großem',
    center: 'Sakral',
    description: 'Das Tor der Kraft und des Überfl usses. Die sakrale Energie für materielle Fülle.',
    keywords: ['Fülle', 'Kraft', 'Materiell', 'Besitz'],
    gift: 'Manifestationskraft',
    shadow: 'Gier',
    lines: {
      1: { name: 'Geld ist keine Macht', description: 'Materielles richtig einsetzen.' },
      2: { name: 'Management', description: 'Ressourcen verwalten.' },
      3: { name: 'Dienst', description: 'Fülle teilen.' },
      4: { name: 'Sicherheit', description: 'Stabilität schaffen.' },
      5: { name: 'Arroganz', description: 'Hybris vermeiden.' },
      6: { name: 'Bescheidenheit', description: 'Demut bewahren.' }
    }
  },

  15: {
    number: 15,
    name: 'Die Bescheidenheit',
    center: 'G-Zentrum',
    description: 'Das Tor der Extreme und Rhythmen. Die Fähigkeit, mit den Rhythmen des Lebens zu fließen.',
    keywords: ['Rhythmus', 'Extreme', 'Vielfalt', 'Menschlichkeit'],
    gift: 'Toleranz und Akzeptanz',
    shadow: 'Extreme ohne Balance',
    lines: {
      1: { name: 'Pflicht', description: 'Verantwortung übernehmen.' },
      2: { name: 'Einfluss', description: 'Andere bewegen.' },
      3: { name: 'Selbstsüchtig', description: 'Eigene Bedürfnisse erkennen.' },
      4: { name: 'Mauer', description: 'Grenzen setzen.' },
      5: { name: 'Sensitivität', description: 'Empfindsamkeit zeigen.' },
      6: { name: 'Selbstverteidigung', description: 'Sich schützen.' }
    }
  },

  16: {
    number: 16,
    name: 'Die Begeisterung',
    center: 'Kehle',
    description: 'Das Tor der Fähigkeiten und Talente. Die Kraft, Expertise zu entwickeln und zu teilen.',
    keywords: ['Talent', 'Fähigkeit', 'Expertise', 'Enthusiasmus'],
    gift: 'Meisterschaft',
    shadow: 'Oberflächliches Können',
    lines: {
      1: { name: 'Erleichterung', description: 'Komplexes einfach machen.' },
      2: { name: 'Führen', description: 'Durch Können leiten.' },
      3: { name: 'Unabhängigkeit', description: 'Eigenständig agieren.' },
      4: { name: 'Ableitung', description: 'Logisch vorgehen.' },
      5: { name: 'Opportunismus', description: 'Chancen nutzen.' },
      6: { name: 'Grinsen und ertragen', description: 'Durchhalten mit Humor.' }
    }
  },

  17: {
    number: 17,
    name: 'Die Nachfolge',
    center: 'Ajna',
    description: 'Das Tor der Meinungen. Die mentale Fähigkeit, Perspektiven und Ansichten zu bilden.',
    keywords: ['Meinung', 'Perspektive', 'Mental', 'Logik'],
    gift: 'Klare Perspektive',
    shadow: 'Starre Meinungen',
    lines: {
      1: { name: 'Offenheit', description: 'Offen für neue Sichtweisen.' },
      2: { name: 'Diskriminierung', description: 'Unterscheidungsvermögen.' },
      3: { name: 'Verständnis', description: 'Empathie für Ansichten.' },
      4: { name: 'Personal', description: 'Individuell denken.' },
      5: { name: 'Keine Alternative', description: 'Klare Meinung.' },
      6: { name: 'Bodhisattva', description: 'Weise Perspektive.' }
    }
  },

  18: {
    number: 18,
    name: 'Die Arbeit am Verdorbenen',
    center: 'Milz',
    description: 'Das Tor der Korrektur und des Urteils. Die intuitive Fähigkeit, Fehler zu erkennen.',
    keywords: ['Korrektur', 'Urteil', 'Perfektion', 'Kritik'],
    gift: 'Konstruktive Kritik',
    shadow: 'Destruktives Urteilen',
    lines: {
      1: { name: 'Konservativ', description: 'Bewährtes bewahren.' },
      2: { name: 'Heilung', description: 'Fehler heilen.' },
      3: { name: 'Enthusiast', description: 'Begeistert korrigieren.' },
      4: { name: 'Rigidität', description: 'Starr in Prinzipien.' },
      5: { name: 'Therapie', description: 'Heilend wirken.' },
      6: { name: 'Buddhahood', description: 'Akzeptanz der Unvollkommenheit.' }
    }
  },

  19: {
    number: 19,
    name: 'Die Annäherung',
    center: 'Wurzel',
    description: 'Das Tor der Bedürfnisse und Sensitivität. Die Druckenergie für grundlegende Bedürfnisse.',
    keywords: ['Bedürfnisse', 'Sensitivität', 'Gemeinschaft', 'Ressourcen'],
    gift: 'Für Bedürfnisse sorgen',
    shadow: 'Übermäßige Anforderungen',
    lines: {
      1: { name: 'Interdependenz', description: 'Gegenseitige Abhängigkeit.' },
      2: { name: 'Dienst', description: 'Anderen dienen.' },
      3: { name: 'Hingabe', description: 'Sich widmen.' },
      4: { name: 'Team-Player', description: 'Im Team arbeiten.' },
      5: { name: 'Opfer', description: 'Sich hingeben.' },
      6: { name: 'Maturation', description: 'Reifen durch Erfahrung.' }
    }
  },

  21: {
    number: 21,
    name: 'Das Durchbeißen',
    center: 'Herz/Ego',
    description: 'Das Tor der Kontrolle. Die Willenskraft, Kontrolle zu haben und auszuüben.',
    keywords: ['Kontrolle', 'Willenskraft', 'Management', 'Autorität'],
    gift: 'Effektive Kontrolle',
    shadow: 'Kontrollzwang',
    lines: {
      1: { name: 'Warnung', description: 'Andere warnen.' },
      2: { name: 'Macht-Orientiert', description: 'Macht anstreben.' },
      3: { name: 'Inkompetenz', description: 'Mangel an Fähigkeit.' },
      4: { name: 'Strategie', description: 'Strategisch kontrollieren.' },
      5: { name: 'Objektiv', description: 'Fair kontrollieren.' },
      6: { name: 'Verwirrung', description: 'Kontrolle verlieren.' }
    }
  },

  22: {
    number: 22,
    name: 'Die Anmut',
    center: 'Solarplexus',
    description: 'Das Tor der Offenheit und Zuhörens. Die emotionale Bereitschaft, sich zu öffnen.',
    keywords: ['Offenheit', 'Zuhören', 'Emotion', 'Gnade'],
    gift: 'Emotionale Offenheit',
    shadow: 'Verschlossenheit',
    lines: {
      1: { name: 'Zurückhaltung', description: 'Vorsichtig sein.' },
      2: { name: 'Takt', description: 'Sensibel kommunizieren.' },
      3: { name: 'Verzauberung', description: 'Andere bezaubern.' },
      4: { name: 'Sensitivität', description: 'Feinfühlig sein.' },
      5: { name: 'Direktheit', description: 'Ehrlich sein.' },
      6: { name: 'Maturation', description: 'Reife zeigen.' }
    }
  },

  23: {
    number: 23,
    name: 'Die Zersplitterung',
    center: 'Kehle',
    description: 'Das Tor der Assimilation und Einsicht. Die Fähigkeit, Wissen zu verdauen und auszudrücken.',
    keywords: ['Einsicht', 'Assimilation', 'Erklären', 'Wissen'],
    gift: 'Einfaches Erklären',
    shadow: 'Unverständlich sein',
    lines: {
      1: { name: 'Übertragung', description: 'Wissen weitergeben.' },
      2: { name: 'Selbst-Verteidigung', description: 'Position verteidigen.' },
      3: { name: 'Individualität', description: 'Einzigartig erklären.' },
      4: { name: 'Splitter', description: 'Fragmente zusammenfügen.' },
      5: { name: 'Assimilation', description: 'Vollständig verstehen.' },
      6: { name: 'Fusion', description: 'Ganzheitlich erklären.' }
    }
  },

  24: {
    number: 24,
    name: 'Die Wiederkehr',
    center: 'Ajna',
    description: 'Das Tor der Rationalisierung. Die mentale Fähigkeit, Dinge zu verstehen und zu erklären.',
    keywords: ['Rationalisierung', 'Verstehen', 'Mental', 'Erklären'],
    gift: 'Logisches Denken',
    shadow: 'Überdenken',
    lines: {
      1: { name: 'Die Sünde der Selbstsucht', description: 'Eigene Gedanken priorisieren.' },
      2: { name: 'Erkennung', description: 'Muster erkennen.' },
      3: { name: 'Sucht', description: 'Zwanghaftes Denken.' },
      4: { name: 'Stille', description: 'Gedankenstille finden.' },
      5: { name: 'Bekenntnis', description: 'Gedanken teilen.' },
      6: { name: 'Die Gabe Gottes', description: 'Inspirierte Gedanken.' }
    }
  },

  25: {
    number: 25,
    name: 'Die Unschuld',
    center: 'G-Zentrum',
    description: 'Das Tor der Universellen Liebe. Die Kraft, ohne Erwartungen zu lieben.',
    keywords: ['Unschuld', 'Liebe', 'Spirit', 'Universell'],
    gift: 'Bedingungslose Liebe',
    shadow: 'Naivität',
    lines: {
      1: { name: 'Selbstlos', description: 'Ohne Ego lieben.' },
      2: { name: 'Umsicht', description: 'Achtsam lieben.' },
      3: { name: 'Pragmatismus', description: 'Praktisch lieben.' },
      4: { name: 'Überleben', description: 'Liebe als Kraft.' },
      5: { name: 'Erholung', description: 'Heilende Liebe.' },
      6: { name: 'Ignoranz', description: 'Blindes Vertrauen.' }
    }
  },

  26: {
    number: 26,
    name: 'Die große Zähmungskraft',
    center: 'Herz/Ego',
    description: 'Das Tor des Egoist. Die Willenskraft für persönliche Ziele.',
    keywords: ['Ego', 'Willenskraft', 'Verkäufer', 'Überzeugung'],
    gift: 'Überzeugende Kraft',
    shadow: 'Manipulation',
    lines: {
      1: { name: 'Vogelscheuche', description: 'Andere abschrecken.' },
      2: { name: 'Transmissions-Linie', description: 'Wissen weitergeben.' },
      3: { name: 'Einfluss', description: 'Andere beeinflussen.' },
      4: { name: 'Sensibilität', description: 'Gefühlvoll überzeugen.' },
      5: { name: 'Anpassung', description: 'Flexibel überzeugen.' },
      6: { name: 'Autorität', description: 'Durch Kompetenz überzeugen.' }
    }
  },

  28: {
    number: 28,
    name: 'Des Großen Übermaß',
    center: 'Milz',
    description: 'Das Tor des Spielers und des Kampfes. Die intuitive Bereitschaft, Risiken einzugehen.',
    keywords: ['Risiko', 'Kampf', 'Leben', 'Sinn'],
    gift: 'Sinnvoller Kampf',
    shadow: 'Sinnloser Kampf',
    lines: {
      1: { name: 'Vorbereitung', description: 'Sich rüsten.' },
      2: { name: 'Kampfwürdig', description: 'Für das Richtige kämpfen.' },
      3: { name: 'Abenteuertum', description: 'Mutig vorangehen.' },
      4: { name: 'Beharrlichkeit', description: 'Durchhalten.' },
      5: { name: 'Treachery', description: 'Verrat vermeiden.' },
      6: { name: 'Confusion', description: 'Klarheit im Kampf finden.' }
    }
  },

  29: {
    number: 29,
    name: 'Das Abgründige',
    center: 'Sakral',
    description: 'Das Tor des Ja-Sagens. Die sakrale Energie für Commitment.',
    keywords: ['Commitment', 'Ja-Sagen', 'Hingabe', 'Durchhalten'],
    gift: 'Totales Engagement',
    shadow: 'Überforderung',
    lines: {
      1: { name: 'Anforderungen', description: 'Durchhalten trotz Herausforderungen.' },
      2: { name: 'Beurteilung', description: 'Situation einschätzen.' },
      3: { name: 'Übereinkunft', description: 'Sich verpflichten.' },
      4: { name: 'Direktheit', description: 'Klar committen.' },
      5: { name: 'Überlegung', description: 'Gut überlegen.' },
      6: { name: 'Verwirrung', description: 'Zweifeln beim Commitment.' }
    }
  },

  30: {
    number: 30,
    name: 'Das Haftende',
    center: 'Solarplexus',
    description: 'Das Tor der Sehnsucht und Gefühle. Die emotionale Intensität und Leidenschaft.',
    keywords: ['Sehnsucht', 'Leidenschaft', 'Emotion', 'Intensität'],
    gift: 'Emotionale Intensität',
    shadow: 'Brennen ohne Richtung',
    lines: {
      1: { name: 'Komposition', description: 'Gefühle strukturieren.' },
      2: { name: 'Pragmatismus', description: 'Praktisch mit Emotionen umgehen.' },
      3: { name: 'Resignation', description: 'Aufgeben oder Durchhalten.' },
      4: { name: 'Erschöpfung', description: 'Emotionale Müdigkeit.' },
      5: { name: 'Bestrahlung', description: 'Andere mit Emotionen berühren.' },
      6: { name: 'Erfüllung', description: 'Emotionale Erfüllung finden.' }
    }
  },

  31: {
    number: 31,
    name: 'Die Einwirkung',
    center: 'Kehle',
    description: 'Das Tor der Führung. Die Fähigkeit, durch Worte zu führen und zu beeinflussen.',
    keywords: ['Führung', 'Einfluss', 'Demokratie', 'Ausdruck'],
    gift: 'Inspirierende Führung',
    shadow: 'Autoritarismus',
    lines: {
      1: { name: 'Manifestation', description: 'Führung zeigen.' },
      2: { name: 'Arroganz', description: 'Hybris vermeiden.' },
      3: { name: 'Selektivität', description: 'Wählerisch führen.' },
      4: { name: 'Absicht', description: 'Zielgerichtet führen.' },
      5: { name: 'Selbst-Gerechtigkeit', description: 'Demut bewahren.' },
      6: { name: 'Anwendung', description: 'Praktisch führen.' }
    }
  },

  32: {
    number: 32,
    name: 'Die Dauer',
    center: 'Milz',
    description: 'Das Tor der Kontinuität und Beständigkeit. Die Intuition für das, was Bestand hat.',
    keywords: ['Kontinuität', 'Beständigkeit', 'Intuition', 'Dauer'],
    gift: 'Inneres Wissen über Beständigkeit',
    shadow: 'Angst vor Wandel',
    lines: {
      1: { name: 'Konservierung', description: 'Bewährtes bewahren.' },
      2: { name: 'Einschränkung', description: 'Grenzen setzen.' },
      3: { name: 'Mangel an Kontinuität', description: 'Instabilität spüren.' },
      4: { name: 'Recht', description: 'Gerechtigkeit bewahren.' },
      5: { name: 'Flexibilität', description: 'Anpassungsfähig bleiben.' },
      6: { name: 'Gelassenheit', description: 'Ruhe in Beständigkeit.' }
    }
  },

  33: {
    number: 33,
    name: 'Der Rückzug',
    center: 'Kehle',
    description: 'Das Tor des Rückzugs und der Privatsphäre. Die Kraft, sich zurückzuziehen.',
    keywords: ['Rückzug', 'Privatsphäre', 'Erinnerung', 'Reflexion'],
    gift: 'Heilsamer Rückzug',
    shadow: 'Isolation',
    lines: {
      1: { name: 'Flucht', description: 'Rechtzeitig zurückziehen.' },
      2: { name: 'Kapitulation', description: 'Aufgeben können.' },
      3: { name: 'Geist', description: 'Mental zurückziehen.' },
      4: { name: 'Würde', description: 'In Würde zurücktreten.' },
      5: { name: 'Timing', description: 'Richtiger Zeitpunkt.' },
      6: { name: 'Sympathie', description: 'Verständnis für Rückzug.' }
    }
  },

  35: {
    number: 35,
    name: 'Der Fortschritt',
    center: 'Kehle',
    description: 'Das Tor der Veränderung und Erfahrung. Die Kraft, durch Erfahrung voranzukommen.',
    keywords: ['Veränderung', 'Erfahrung', 'Fortschritt', 'Abenteuer'],
    gift: 'Transformative Erfahrungen',
    shadow: 'Unrast',
    lines: {
      1: { name: 'Bescheidenheit', description: 'Demut in Erfahrung.' },
      2: { name: 'Kreativität', description: 'Kreativ vorangehen.' },
      3: { name: 'Zusammenarbeit', description: 'Gemeinsam erleben.' },
      4: { name: 'Hunger', description: 'Sehnsucht nach Erfahrung.' },
      5: { name: 'Altruismus', description: 'Selbstlos erleben.' },
      6: { name: 'Korrektur', description: 'Aus Erfahrung lernen.' }
    }
  },

  36: {
    number: 36,
    name: 'Die Verfinsterung des Lichts',
    center: 'Solarplexus',
    description: 'Das Tor der emotionalen Krisen. Die Fähigkeit, durch emotionale Dunkelheit zu gehen.',
    keywords: ['Krise', 'Emotion', 'Erfahrung', 'Lernen'],
    gift: 'Weisheit durch Krise',
    shadow: 'Melodrama',
    lines: {
      1: { name: 'Widerstand', description: 'Gegen Krise ankämpfen.' },
      2: { name: 'Unterstützung', description: 'Hilfe in Krise annehmen.' },
      3: { name: 'Übergang', description: 'Durch Krise durchgehen.' },
      4: { name: 'Geheimnis', description: 'Verborgene Krise.' },
      5: { name: 'Altruismus', description: 'Anderen in Krise helfen.' },
      6: { name: 'Gerechtigkeit', description: 'Fairness in Krise.' }
    }
  },

  37: {
    number: 37,
    name: 'Die Sippe',
    center: 'Solarplexus',
    description: 'Das Tor der Freundschaft und Familie. Die emotionale Energie für Gemeinschaft.',
    keywords: ['Familie', 'Freundschaft', 'Gemeinschaft', 'Verträge'],
    gift: 'Starke Bindungen',
    shadow: 'Codependenz',
    lines: {
      1: { name: 'Mutter/Vater', description: 'Elterliche Energie.' },
      2: { name: 'Verantwortung', description: 'Für Familie sorgen.' },
      3: { name: 'Gleichheit', description: 'Fairness in Beziehungen.' },
      4: { name: 'Führung', description: 'Familie führen.' },
      5: { name: 'Liebe', description: 'Bedingungslose Liebe.' },
      6: { name: 'Sinn für Zweck', description: 'Familienziel.' }
    }
  },

  38: {
    number: 38,
    name: 'Der Gegensatz',
    center: 'Wurzel',
    description: 'Das Tor des Kämpfers. Der Druck, für das zu kämpfen, was einem wichtig ist.',
    keywords: ['Kampf', 'Opposition', 'Individualität', 'Sinn'],
    gift: 'Kampf für Bedeutung',
    shadow: 'Sinnloser Widerstand',
    lines: {
      1: { name: 'Qualifizierung', description: 'Würdige Kämpfe wählen.' },
      2: { name: 'Misshandlung', description: 'Unfaire Behandlung.' },
      3: { name: 'Allianz', description: 'Verbündete finden.' },
      4: { name: 'Aufschub', description: 'Geduld im Kampf.' },
      5: { name: 'Entfremdung', description: 'Allein kämpfen.' },
      6: { name: 'Auflösung', description: 'Kampf beenden.' }
    }
  },

  39: {
    number: 39,
    name: 'Die Hemmnis',
    center: 'Wurzel',
    description: 'Das Tor der Provokation. Der Druck, andere herauszufordern und zu testen.',
    keywords: ['Provokation', 'Emotion', 'Spirit', 'Herausforderung'],
    gift: 'Transformative Provokation',
    shadow: 'Destruktive Provokation',
    lines: {
      1: { name: 'Meditation', description: 'Innere Provokation.' },
      2: { name: 'Verantwortung', description: 'Bewusst provozieren.' },
      3: { name: 'Individualität', description: 'Einzigartig provozieren.' },
      4: { name: 'Charme', description: 'Charmant herausfordern.' },
      5: { name: 'Cool', description: 'Gelassen provozieren.' },
      6: { name: 'Stille', description: 'Schweigende Provokation.' }
    }
  },

  40: {
    number: 40,
    name: 'Die Befreiung',
    center: 'Herz/Ego',
    description: 'Das Tor der Einsamkeit und Befreiung. Die Willenskraft, alleine zu stehen.',
    keywords: ['Einsamkeit', 'Befreiung', 'Unabhängigkeit', 'Abgrenzung'],
    gift: 'Gesunde Abgrenzung',
    shadow: 'Isolation',
    lines: {
      1: { name: 'Erholung', description: 'Alleine regenerieren.' },
      2: { name: 'Entschlossenheit', description: 'Entschlossen abgrenzen.' },
      3: { name: 'Bescheidenheit', description: 'Demut in Abgrenzung.' },
      4: { name: 'Organisation', description: 'Strukturiert abgrenzen.' },
      5: { name: 'Rigidität', description: 'Starr abgrenzen.' },
      6: { name: 'Erschöpfung', description: 'Müde von Abgrenzung.' }
    }
  },

  41: {
    number: 41,
    name: 'Die Minderung',
    center: 'Wurzel',
    description: 'Das Tor der Kontraktion und Fantasie. Der Druck, neue Erfahrungen zu beginnen.',
    keywords: ['Fantasie', 'Anfang', 'Druck', 'Erfahrung'],
    gift: 'Inspirierte Fantasie',
    shadow: 'Unrealistische Träume',
    lines: {
      1: { name: 'Rationale', description: 'Vernünftige Fantasien.' },
      2: { name: 'Vorsicht', description: 'Vorsichtig träumen.' },
      3: { name: 'Geduld', description: 'Geduld mit Träumen.' },
      4: { name: 'Korrektur', description: 'Träume anpassen.' },
      5: { name: 'Autorität', description: 'Träume verwirklichen.' },
      6: { name: 'Anerkennung', description: 'Träume anerkennen.' }
    }
  },

  42: {
    number: 42,
    name: 'Die Mehrung',
    center: 'Sakral',
    description: 'Das Tor des Wachstums und Endes. Die sakrale Kraft, Zyklen abzuschließen.',
    keywords: ['Wachstum', 'Ende', 'Zyklen', 'Vollendung'],
    gift: 'Zyklen vollenden',
    shadow: 'Nicht loslassen können',
    lines: {
      1: { name: 'Diversifizierung', description: 'Vielfalt in Wachstum.' },
      2: { name: 'Identifikation', description: 'Mit Wachstum identifizieren.' },
      3: { name: 'Versuch und Irrtum', description: 'Durch Fehler wachsen.' },
      4: { name: 'Die Mitte', description: 'Balance im Wachstum.' },
      5: { name: 'Selbst-Aktualisierung', description: 'Sich verwirklichen.' },
      6: { name: 'Entwicklung', description: 'Kontinuierliches Wachstum.' }
    }
  },

  43: {
    number: 43,
    name: 'Der Durchbruch',
    center: 'Ajna',
    description: 'Das Tor der Einsicht und Strukturierung. Die mentale Kraft, Durchbrüche zu haben.',
    keywords: ['Einsicht', 'Durchbruch', 'Mental', 'Innovation'],
    gift: 'Revolutionäre Einsichten',
    shadow: 'Sture Meinungen',
    lines: {
      1: { name: 'Geduld', description: 'Geduldig auf Einsicht warten.' },
      2: { name: 'Hingabe', description: 'Sich der Einsicht widmen.' },
      3: { name: 'Kompromiss', description: 'Flexible Einsicht.' },
      4: { name: 'Ein-Kanal-Bewusstheit', description: 'Fokussierte Einsicht.' },
      5: { name: 'Progressiv', description: 'Voranschreitende Einsicht.' },
      6: { name: 'Breakthr ough', description: 'Vollständiger Durchbruch.' }
    }
  },

  44: {
    number: 44,
    name: 'Das Entgegenkommen',
    center: 'Milz',
    description: 'Das Tor der Wachsamkeit und Instinkt. Die intuitive Wachsamkeit.',
    keywords: ['Wachsamkeit', 'Instinkt', 'Vergangenheit', 'Muster'],
    gift: 'Instinktive Wachsamkeit',
    shadow: 'Übermäßige Vorsicht',
    lines: {
      1: { name: 'Bedingungen', description: 'Umstände beachten.' },
      2: { name: 'Management', description: 'Situationen managen.' },
      3: { name: 'Intervention', description: 'Eingreifen wenn nötig.' },
      4: { name: 'Fraktionalität', description: 'Teile vom Ganzen sehen.' },
      5: { name: 'Manipulation', description: 'Situationen beeinflussen.' },
      6: { name: 'Aloofness', description: 'Distanzierte Wachsamkeit.' }
    }
  },

  45: {
    number: 45,
    name: 'Die Sammlung',
    center: 'Kehle',
    description: 'Das Tor der Herrschaft und des Königs. Die Kraft, Ressourcen zu sammeln und zu verteilen.',
    keywords: ['Herrschaft', 'König', 'Ressourcen', 'Verteilung'],
    gift: 'Gerechte Verteilung',
    shadow: 'Gier und Horten',
    lines: {
      1: { name: 'Identifikation', description: 'Ressourcen erkennen.' },
      2: { name: 'Konsens', description: 'Gemeinsam entscheiden.' },
      3: { name: 'Ausschluss', description: 'Grenzen setzen.' },
      4: { name: 'Direktion', description: 'Führend verteilen.' },
      5: { name: 'Führung', description: 'Natürlich führen.' },
      6: { name: 'Gerechtigkeit', description: 'Fair verteilen.' }
    }
  },

  46: {
    number: 46,
    name: 'Das Empordringen',
    center: 'G-Zentrum',
    description: 'Das Tor des Körpers und der Liebe. Die Energie für körperliche Erfahrung.',
    keywords: ['Körper', 'Glück', 'Liebe', 'Erfahrung'],
    gift: 'Körperliche Präsenz',
    shadow: 'Vernachlässigung des Körpers',
    lines: {
      1: { name: 'Entdeckung', description: 'Den Körper entdecken.' },
      2: { name: 'Das Schloss', description: 'Den Körper schützen.' },
      3: { name: 'Aufstieg', description: 'Durch Körper wachsen.' },
      4: { name: 'Auswirkung', description: 'Körperliche Wirkung.' },
      5: { name: 'Annäherung', description: 'Körperliche Nähe.' },
      6: { name: 'Weisheit', description: 'Körperweisheit.' }
    }
  },

  47: {
    number: 47,
    name: 'Die Bedrängnis',
    center: 'Ajna',
    description: 'Das Tor der Realisierung und des Verstehens. Die mentale Fähigkeit, Sinn zu machen.',
    keywords: ['Verstehen', 'Realisierung', 'Mental', 'Sinn'],
    gift: 'Tiefes Verstehen',
    shadow: 'Verwirrung',
    lines: {
      1: { name: 'Inventarisierung', description: 'Gedanken sortieren.' },
      2: { name: 'Ambition', description: 'Nach Verstehen streben.' },
      3: { name: 'Selbst-Unterdrückung', description: 'Verstand blockieren.' },
      4: { name: 'Unterdrückung', description: 'Gedanken unterdrücken.' },
      5: { name: 'Heilige', description: 'Heiliges Verstehen.' },
      6: { name: 'Verschönerung', description: 'Verstehen verfeinern.' }
    }
  },

  48: {
    number: 48,
    name: 'Der Brunnen',
    center: 'Milz',
    description: 'Das Tor der Tiefe und Weisheit. Die intuitive Weisheit aus der Tiefe.',
    keywords: ['Tiefe', 'Weisheit', 'Talent', 'Können'],
    gift: 'Tiefe Weisheit',
    shadow: 'Oberflächlichkeit',
    lines: {
      1: { name: 'Unangemessenheit', description: 'Noch nicht bereit.' },
      2: { name: 'Beweis', description: 'Weisheit beweisen.' },
      3: { name: 'Verantwortungslosigkeit', description: 'Weisheit missbrauchen.' },
      4: { name: 'Umstrukturierung', description: 'Weisheit neu ordnen.' },
      5: { name: 'Aktion', description: 'Weisheit anwenden.' },
      6: { name: 'Selbst-Verwirklichung', description: 'Weisheit leben.' }
    }
  },

  49: {
    number: 49,
    name: 'Die Umwälzung',
    center: 'Solarplexus',
    description: 'Das Tor der Revolution und Prinzipien. Die emotionale Kraft für Wandel.',
    keywords: ['Revolution', 'Prinzipien', 'Wandel', 'Emotion'],
    gift: 'Transformative Prinzipien',
    shadow: 'Starre Prinzipien',
    lines: {
      1: { name: 'Das Prinzip des Rechts', description: 'Gerechtigkeit suchen.' },
      2: { name: 'Letzte Resort', description: 'Als letzter Ausweg.' },
      3: { name: 'Popularität', description: 'Beliebte Revolution.' },
      4: { name: 'Plattform', description: 'Basis für Wandel.' },
      5: { name: 'Organisation', description: 'Strukturierter Wandel.' },
      6: { name: 'Anziehung', description: 'Magnetische Revolution.' }
    }
  },

  50: {
    number: 50,
    name: 'Der Tiegel',
    center: 'Milz',
    description: 'Das Tor der Werte und Verantwortung. Die intuitive Weisheit über Werte.',
    keywords: ['Werte', 'Verantwortung', 'Fürsorge', 'Stammestradition'],
    gift: 'Starke Werte',
    shadow: 'Starre Traditionen',
    lines: {
      1: { name: 'Einwanderung', description: 'Neue Werte integrieren.' },
      2: { name: 'Entschlossenheit', description: 'Für Werte einstehen.' },
      3: { name: 'Anpassung', description: 'Werte anpassen.' },
      4: { name: 'Korruption', description: 'Werte bewahren.' },
      5: { name: 'Konsistenz', description: 'Werte leben.' },
      6: { name: 'Führung', description: 'Durch Werte führen.' }
    }
  },

  51: {
    number: 51,
    name: 'Das Erregende',
    center: 'Herz/Ego',
    description: 'Das Tor des Schocks und Wettkampfs. Die Willenskraft, durch Herausforderungen zu gehen.',
    keywords: ['Schock', 'Wettkampf', 'Initiative', 'Mut'],
    gift: 'Mut durch Schock',
    shadow: 'Trauma',
    lines: {
      1: { name: 'Referenz', description: 'Aus Schock lernen.' },
      2: { name: 'Rückzug', description: 'Nach Schock zurückziehen.' },
      3: { name: 'Anpassung', description: 'Mit Schock umgehen.' },
      4: { name: 'Beschränkung', description: 'Schock begrenzen.' },
      5: { name: 'Symmetrie', description: 'Balance nach Schock.' },
      6: { name: 'Trennung', description: 'Von Schock abgrenzen.' }
    }
  },

  52: {
    number: 52,
    name: 'Das Stillehalten',
    center: 'Wurzel',
    description: 'Das Tor der Stille und Konzentration. Der Druck, still zu sein und zu fokussieren.',
    keywords: ['Stille', 'Konzentration', 'Fokus', 'Bereitschaft'],
    gift: 'Kraftvolle Stille',
    shadow: 'Rastlosigkeit',
    lines: {
      1: { name: 'Denken', description: 'In Stille denken.' },
      2: { name: 'Sorge', description: 'Innere Sorgen.' },
      3: { name: 'Kontrolle', description: 'Stille kontrollieren.' },
      4: { name: 'Selbst-Disziplin', description: 'Sich selbst disziplinieren.' },
      5: { name: 'Erklärung', description: 'Stille erklären.' },
      6: { name: 'Gelassenheit', description: 'In Stille ruhen.' }
    }
  },

  53: {
    number: 53,
    name: 'Die Entwicklung',
    center: 'Wurzel',
    description: 'Das Tor der Anfänge und des Startens. Der Druck, neue Zyklen zu beginnen.',
    keywords: ['Anfang', 'Start', 'Zyklen', 'Entwicklung'],
    gift: 'Neue Anfänge',
    shadow: 'Zu früh starten',
    lines: {
      1: { name: 'Akkumulation', description: 'Energie sammeln.' },
      2: { name: 'Momentum', description: 'Schwung aufbauen.' },
      3: { name: 'Praktikabilität', description: 'Praktisch starten.' },
      4: { name: 'Assimilation', description: 'Einarbeiten.' },
      5: { name: 'Assertion', description: 'Durchsetzen.' },
      6: { name: 'Phlegmatisch', description: 'Gelassen beginnen.' }
    }
  },

  54: {
    number: 54,
    name: 'Das heiratende Mädchen',
    center: 'Wurzel',
    description: 'Das Tor des Aufstiegs und Ehrgeizes. Der Druck, aufzusteigen und sich zu verbessern.',
    keywords: ['Ehrgeiz', 'Aufstieg', 'Transformation', 'Druck'],
    gift: 'Transformativer Aufstieg',
    shadow: 'Rücksichtsloser Ehrgeiz',
    lines: {
      1: { name: 'Einfluss', description: 'Einfluss gewinnen.' },
      2: { name: 'Zurückhaltung', description: 'Geduldig aufsteigen.' },
      3: { name: 'Interaktion', description: 'Durch Kontakte aufsteigen.' },
      4: { name: 'Ehrgeiz', description: 'Ambitioniert sein.' },
      5: { name: 'Übertreibung', description: 'Zu viel wollen.' },
      6: { name: 'Selektivität', description: 'Wählerisch sein.' }
    }
  },

  55: {
    number: 55,
    name: 'Die Fülle',
    center: 'Solarplexus',
    description: 'Das Tor des Spirits und der Fülle. Die emotionale Energie für Fülle und Überfluss.',
    keywords: ['Fülle', 'Spirit', 'Emotion', 'Stimmung'],
    gift: 'Emotionale Fülle',
    shadow: 'Emotionales Chaos',
    lines: {
      1: { name: 'Kooperation', description: 'Gemeinsam Fülle schaffen.' },
      2: { name: 'Distrust', description: 'Misstrauen überwinden.' },
      3: { name: 'Unschuld', description: 'Naive Fülle.' },
      4: { name: 'Assimilation', description: 'Fülle integrieren.' },
      5: { name: 'Wachstum', description: 'In Fülle wachsen.' },
      6: { name: 'Selbstlosigkeit', description: 'Fülle teilen.' }
    }
  },

  56: {
    number: 56,
    name: 'Der Wanderer',
    center: 'Kehle',
    description: 'Das Tor des Geschichtenerzählens. Die Fähigkeit, Geschichten zu erzählen und zu stimulieren.',
    keywords: ['Geschichten', 'Wanderer', 'Stimulation', 'Ausdruck'],
    gift: 'Fesselnde Geschichten',
    shadow: 'Übertreibung',
    lines: {
      1: { name: 'Qualität', description: 'Qualität in Geschichten.' },
      2: { name: 'Verbindung', description: 'Durch Geschichten verbinden.' },
      3: { name: 'Entfremdung', description: 'Geschichten entfremden.' },
      4: { name: 'Bescheidenheit', description: 'Demut im Erzählen.' },
      5: { name: 'Anziehung', description: 'Magnetische Geschichten.' },
      6: { name: 'Vorsicht', description: 'Vorsichtig erzählen.' }
    }
  },

  57: {
    number: 57,
    name: 'Das Sanfte',
    center: 'Milz',
    description: 'Das Tor der intuitiven Einsicht. Die Fähigkeit, im Moment spontan zu wissen.',
    keywords: ['Intuition', 'Klarheit', 'Spontaneität', 'Hellhörigkeit'],
    gift: 'Hellhörigkeit',
    shadow: 'Mentale Angst',
    lines: {
      1: { name: 'Verwirrung', description: 'Klarheit aus Chaos finden.' },
      2: { name: 'Reinigung', description: 'Sich von Altem befreien.' },
      3: { name: 'Schärfe', description: 'Präzise Intuition.' },
      4: { name: 'Direktor', description: 'Andere leiten.' },
      5: { name: 'Progression', description: 'Schrittweise vorangehen.' },
      6: { name: 'Nutzung', description: 'Intuition praktisch einsetzen.' }
    }
  },

  58: {
    number: 58,
    name: 'Das Heitere',
    center: 'Wurzel',
    description: 'Das Tor der Vitalität und Lebensfreude. Der Druck, das Leben zu verbessern und zu perfektionieren.',
    keywords: ['Vitalität', 'Freude', 'Verbesserung', 'Lebenskraft'],
    gift: 'Lebensfreude',
    shadow: 'Unzufriedenheit',
    lines: {
      1: { name: 'Liebe zum Leben', description: 'Leben genießen.' },
      2: { name: 'Unerschütterlichkeit', description: 'Standhaft bleiben.' },
      3: { name: 'Elektrizität', description: 'Lebendige Energie.' },
      4: { name: 'Fokus', description: 'Konzentrierte Freude.' },
      5: { name: 'Verteidigung', description: 'Freude schützen.' },
      6: { name: 'Durchführung', description: 'Freude leben.' }
    }
  },

  59: {
    number: 59,
    name: 'Die Auflösung',
    center: 'Sakral',
    description: 'Das Tor der Intimität und Sexualität. Die sakrale Energie für tiefe Verbindung.',
    keywords: ['Intimität', 'Sexualität', 'Verbindung', 'Nähe'],
    gift: 'Tiefe Intimität',
    shadow: 'Oberflächliche Verbindungen',
    lines: {
      1: { name: 'Preemption', description: 'Vorwegnahme.' },
      2: { name: 'Schüchternheit', description: 'Zurückhaltung.' },
      3: { name: 'Offenheit', description: 'Offen für Verbindung.' },
      4: { name: 'Bruderschaft', description: 'Geschwisterliche Liebe.' },
      5: { name: 'Casanova/Femme Fatale', description: 'Verführerisch.' },
      6: { name: 'Ein-Nacht-Stand', description: 'Flüchtige Intimität.' }
    }
  },

  60: {
    number: 60,
    name: 'Die Beschränkung',
    center: 'Wurzel',
    description: 'Das Tor der Akzeptanz und Beschränkungen. Der Druck, Grenzen zu akzeptieren und damit zu arbeiten.',
    keywords: ['Beschränkung', 'Akzeptanz', 'Grenzen', 'Mutation'],
    gift: 'Akzeptanz von Grenzen',
    shadow: 'Widerstand gegen Grenzen',
    lines: {
      1: { name: 'Akzeptanz', description: 'Grenzen annehmen.' },
      2: { name: 'Entschlossenheit', description: 'Entschlossen handeln.' },
      3: { name: 'Konservativismus', description: 'Bewährtes bewahren.' },
      4: { name: 'Findigkeit', description: 'Kreativ mit Grenzen umgehen.' },
      5: { name: 'Führung', description: 'Durch Grenzen führen.' },
      6: { name: 'Rigidität', description: 'Starre Grenzen.' }
    }
  },

  61: {
    number: 61,
    name: 'Die innere Wahrheit',
    center: 'Krone',
    description: 'Das Tor der Mysterien und des inneren Wissens. Der Druck, die Wahrheit zu ergründen.',
    keywords: ['Mysterium', 'Wahrheit', 'Inspiration', 'Wissen'],
    gift: 'Inneres Wissen',
    shadow: 'Verwirrung',
    lines: {
      1: { name: 'Okkultes Wissen', description: 'Verborgenes Wissen.' },
      2: { name: 'Natürliche Brillanz', description: 'Natürliche Weisheit.' },
      3: { name: 'Abhängigkeit', description: 'Von Wissen abhängig.' },
      4: { name: 'Forschung', description: 'Nach Wahrheit forschen.' },
      5: { name: 'Einfluss', description: 'Durch Wahrheit beeinflussen.' },
      6: { name: 'Restriktion', description: 'Wahrheit eingrenzen.' }
    }
  },

  62: {
    number: 62,
    name: 'Des Kleinen Übermaß',
    center: 'Kehle',
    description: 'Das Tor der Details und Präzision. Die Fähigkeit, Details auszudrücken.',
    keywords: ['Details', 'Präzision', 'Sprache', 'Organisation'],
    gift: 'Präzise Artikulation',
    shadow: 'Pedanterie',
    lines: {
      1: { name: 'Routine', description: 'Details strukturieren.' },
      2: { name: 'Einschränkung', description: 'Details begrenzen.' },
      3: { name: 'Entdeckung', description: 'Details erforschen.' },
      4: { name: 'Wachsamkeit', description: 'Auf Details achten.' },
      5: { name: 'Transformation', description: 'Durch Details transformieren.' },
      6: { name: 'Selbstdisziplin', description: 'Disziplin in Details.' }
    }
  },

  63: {
    number: 63,
    name: 'Nach der Vollendung',
    center: 'Krone',
    description: 'Das Tor des Zweifels und der Logik. Der mentale Druck, Dinge zu hinterfragen.',
    keywords: ['Zweifel', 'Logik', 'Fragen', 'Ungewissheit'],
    gift: 'Produktiver Zweifel',
    shadow: 'Lähmende Zweifel',
    lines: {
      1: { name: 'Komposition', description: 'Gedanken ordnen.' },
      2: { name: 'Strukturalismus', description: 'Strukturen hinterfragen.' },
      3: { name: 'Nostalgie', description: 'Vergangenheit anzweifeln.' },
      4: { name: 'Erinnerung', description: 'Erinnerungen hinterfragen.' },
      5: { name: 'Bestätigung', description: 'Bestätigung suchen.' },
      6: { name: 'Nostalgie', description: 'Sehnsucht nach Gewissheit.' }
    }
  },

  64: {
    number: 64,
    name: 'Vor der Vollendung',
    center: 'Krone',
    description: 'Das Tor der Verwirrung und der Möglichkeiten. Der inspirierende Druck, Muster zu erkennen.',
    keywords: ['Verwirrung', 'Möglichkeiten', 'Muster', 'Inspiration'],
    gift: 'Muster erkennen',
    shadow: 'Überwältigende Verwirrung',
    lines: {
      1: { name: 'Bedingungen', description: 'Umstände verstehen.' },
      2: { name: 'Qualifizierung', description: 'Muster qualifizieren.' },
      3: { name: 'Vorherrschaft', description: 'Muster dominieren.' },
      4: { name: 'Übertragung', description: 'Muster weitergeben.' },
      5: { name: 'Versprechen', description: 'Mustern vertrauen.' },
      6: { name: 'Überwältigung', description: 'Von Mustern überwältigt.' }
    }
  }
};

/**
 * Hilfsfunktion: Gibt die Beschreibung eines Tors zurück
 */
export function getGateDescription(gateNumber: number): GateDescription | null {
  return GATE_DESCRIPTIONS[gateNumber] || null;
}

/**
 * Hilfsfunktion: Gibt die Linien-Beschreibung eines Tors zurück
 */
export function getLineDescription(gateNumber: number, line: number): string | null {
  const gate = GATE_DESCRIPTIONS[gateNumber];
  if (!gate || !gate.lines[line]) return null;
  
  const lineInfo = gate.lines[line];
  return `${lineInfo.name}: ${lineInfo.description}`;
}

/**
 * Formatiert ein Tor mit Linie als lesbaren String
 */
export function formatGateWithLine(gateNumber: number, line: number): string {
  const gate = GATE_DESCRIPTIONS[gateNumber];
  if (!gate) return `Tor ${gateNumber}.${line}`;
  
  return `Tor ${gateNumber}.${line} - ${gate.name}`;
}

/**
 * Gibt eine kurze Zusammenfassung eines Tors
 */
export function getGateSummary(gateNumber: number): string {
  const gate = GATE_DESCRIPTIONS[gateNumber];
  if (!gate) return `Tor ${gateNumber}`;
  
  return `Tor ${gateNumber} - ${gate.name}: ${gate.keywords.join(', ')}`;
}

/**
 * Alle verfügbaren Tor-Nummern
 */
export const AVAILABLE_GATES = Object.keys(GATE_DESCRIPTIONS).map(Number);

/**
 * Prüft ob eine Tor-Beschreibung verfügbar ist
 */
export function hasGateDescription(gateNumber: number): boolean {
  return gateNumber in GATE_DESCRIPTIONS;
}

