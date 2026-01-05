import { useState, useEffect } from 'react';

// Fallback-Daten für alle Planeten
function getFallbackData(planetName: string) {
  // Mappe Planet-Namen zu den korrekten Keys
  const planetMapping: { [key: string]: string } = {
    'mercury': 'merkur',
    'moon': 'mond',
    'sun': 'sonne',
    'mars': 'mars',
    'jupiter': 'jupiter',
    'saturn': 'saturn',
    'uranus': 'uranus',
    'neptune': 'neptun',
    'pluto': 'pluto',
    'chiron': 'chiron'
  };
  
  const planetKey = planetMapping[planetName.toLowerCase()] || planetName.toLowerCase();
  
  const planetInfos = {
    sonne: {
      id: "planet_sonne",
      planet_name: "Sonne",
      symbol: "☉",
      orbital_period: "365.25 Tage",
      discovery: "Seit Anbeginn der Zeit",
      mythology: "Das Zentrum des Bewusstseins",
      color: "#FFD700",
      description: "Die Sonne repräsentiert unser wahres Selbst, unsere Essenz und unser Bewusstsein. Sie zeigt, wer wir wirklich sind und was uns antreibt."
    },
    mond: {
      id: "planet_mond",
      planet_name: "Mond",
      symbol: "☽",
      orbital_period: "27.3 Tage",
      discovery: "Seit Anbeginn der Zeit",
      mythology: "Der Spiegel der Seele",
      color: "#C0C0C0",
      description: "Der Mond repräsentiert unsere Emotionen, Instinkte und unser Unterbewusstsein. Er zeigt, wie wir uns fühlen und reagieren."
    },
    merkur: {
      id: "planet_merkur",
      planet_name: "Merkur",
      symbol: "☿",
      orbital_period: "88 Tage",
      discovery: "Seit Anbeginn der Zeit",
      mythology: "Der Bote der Götter",
      color: "#87CEEB",
      description: "Merkur repräsentiert Kommunikation, Denken und Lernen. Er zeigt, wie wir Informationen verarbeiten und ausdrücken."
    },
    venus: {
      id: "planet_venus",
      planet_name: "Venus",
      symbol: "♀",
      orbital_period: "225 Tage",
      discovery: "Seit Anbeginn der Zeit",
      mythology: "Die Göttin der Liebe",
      color: "#FFB6C1",
      description: "Venus repräsentiert Liebe, Schönheit und Werte. Sie zeigt, was wir schätzen und wie wir Beziehungen gestalten."
    },
    mars: {
      id: "planet_mars",
      planet_name: "Mars",
      symbol: "♂",
      orbital_period: "687 Tage",
      discovery: "Seit Anbeginn der Zeit",
      mythology: "Der Gott des Krieges",
      color: "#FF4500",
      description: "Mars repräsentiert Energie, Aktion und Durchsetzung. Er zeigt, wie wir unsere Ziele verfolgen und kämpfen."
    },
    jupiter: {
      id: "planet_jupiter",
      planet_name: "Jupiter",
      symbol: "♃",
      orbital_period: "12 Jahre",
      discovery: "Seit Anbeginn der Zeit",
      mythology: "Der König der Götter",
      color: "#DAA520",
      description: "Jupiter repräsentiert Expansion, Weisheit und Optimismus. Er zeigt, wie wir wachsen und uns entwickeln."
    },
    saturn: {
      id: "planet_saturn",
      planet_name: "Saturn",
      symbol: "♄",
      orbital_period: "29 Jahre",
      discovery: "Seit Anbeginn der Zeit",
      mythology: "Der Lehrer",
      color: "#B0C4DE",
      description: "Saturn repräsentiert Struktur, Disziplin und Verantwortung. Er zeigt, wo wir lernen und reifen müssen."
    },
    uranus: {
      id: "planet_uranus",
      planet_name: "Uranus",
      symbol: "♅",
      orbital_period: "84 Jahre",
      discovery: "1781",
      mythology: "Der Revolutionär",
      color: "#00CED1",
      description: "Uranus repräsentiert Revolution, Innovation und Freiheit. Er zeigt, wo wir brechen und Neues erschaffen."
    },
    neptun: {
      id: "planet_neptun",
      planet_name: "Neptun",
      symbol: "♆",
      orbital_period: "165 Jahre",
      discovery: "1846",
      mythology: "Der Mystiker",
      color: "#4169E1",
      description: "Neptun repräsentiert Spiritualität, Illusion und Verbindung. Er zeigt, wo wir spirituell wachsen und uns verbinden."
    },
    pluto: {
      id: "planet_pluto",
      planet_name: "Pluto",
      symbol: "♇",
      orbital_period: "248 Jahre",
      discovery: "1930",
      mythology: "Der Transformator",
      color: "#8B008B",
      description: "Pluto repräsentiert Transformation, Macht und Regeneration. Er zeigt, wo wir sterben und wiedergeboren werden."
    },
    chiron: {
      id: "planet_chiron",
      planet_name: "Chiron",
      symbol: "♂",
      orbital_period: "50.7 Jahre",
      discovery: "1977",
      mythology: "Der verwundete Heiler",
      color: "#FF6B6B",
      description: "Chiron repräsentiert unsere tiefsten Wunden und unsere Fähigkeit, andere zu heilen. Er zeigt, wo wir verletzt wurden und wo wir anderen helfen können."
    }
  };

  const planetInfo = planetInfos[planetKey as keyof typeof planetInfos];
  
  if (!planetInfo) {
    throw new Error(`Planet ${planetName} nicht gefunden`);
  }

  // Generiere 64 Gates für den Planeten
  const gates: PlanetGate[] = [];
  for (let i = 1; i <= 64; i++) {
    // Spezielle Mercury-Daten für Tor 1
    if (planetKey === 'merkur' && i === 1) {
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Kreativität',
        essence: 'Die schöpferische Stimme in dir - Unbewusste Kreativität durch authentischen Ausdruck',
        consciousness: 'Kommunikation als Selbstvergewisserung - Bewusste Kreativität durch strategische Positionierung',
        description: 'Tor 1 im bewussten Merkur: Dein Ausdruck ist kein Nebeneffekt – er ist deine Lebensader. Du erschaffst nicht nur Sätze – du erschaffst dich selbst in dem Moment, in dem du sprichst.',
        deep_meaning: 'Der Tanz zwischen Stille und Sprache: Zu lange in der Stille – und du fühlst dich abgeschnitten. Zu viel Ausdruck ohne Tiefe – und du fühlst dich leer. Der Schlüssel liegt im Rhythmus: Dem Wechselspiel aus Hören und Sprechen, aus Sammeln und Teilen.',
        shadow_aspects: JSON.stringify([
          'Du formulierst so, dass du gefällst, nicht dass du echt bist',
          'Du weichst ab, um nicht anzuecken – und verlierst deine Klarheit',
          'Du schweigst, wenn deine Worte unbequem wären',
          'Du übernimmst den Ausdruck anderer, bis deine eigene Stimme verkümmert'
        ]),
        gifts: JSON.stringify([
          'Unverwechselbare sprachliche Signatur',
          'Kreativer Ausdruck als Marktposition',
          'Kommunikation als Verkaufshebel',
          'Authentizität als Business-Vorteil'
        ]),
        affirmation: 'Ich erschaffe durch meine Worte. Meine Sprache ist mein Markenzeichen.',
        center_name: "G"
      });
    } else if (planetKey === 'merkur' && i === 2) {
      // Spezielle Mercury-Daten für Tor 2
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Empfang',
        essence: 'Die innere Stimme, die den Weg kennt - Unbewusste Navigation durch klare Orientierung',
        consciousness: 'Sprache als strategischer Kompass - Bewusste Navigation durch Positionierung',
        description: 'Tor 2 im bewussten Merkur: Deine Sprache ist wie ein innerer Nordstern. Sie ordnet, strukturiert, lenkt – nicht, weil du laut bist, sondern weil deine Worte aus einer tiefen, inneren Orientierung kommen.',
        deep_meaning: 'Der Tanz zwischen Zuhören und Lenken: Sprichst du zu früh, fehlt deinen Worten Tiefe. Sprichst du zu spät, fehlt anderen der Anker, den sie brauchen.',
        shadow_aspects: JSON.stringify([
          'Du redest, um niemandem zu widersprechen',
          'Du gibst keine klare Richtung, um nicht in Verantwortung zu geraten',
          'Du bleibst vage, um alle Optionen offen zu halten',
          'Du verlierst deine innere Orientierung und führst in die Irre'
        ]),
        gifts: JSON.stringify([
          'Strategische Navigation durch Sprache',
          'Positionierung durch Klarheit',
          'Führung durch Orientierung',
          'Kompass für Business-Richtung'
        ]),
        affirmation: 'Ich spreche aus Klarheit. Meine Worte geben meinem Business Richtung.',
        center_name: "G"
      });
    } else if (planetKey === 'merkur' && i === 3) {
      // Spezielle Mercury-Daten für Tor 3
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Anfang',
        essence: 'Die Stimme, die Klarheit schafft - Unbewusste Strukturierung durch Ordnung',
        consciousness: 'Sprache als Strukturgeber im Business - Bewusste Strukturierung durch Klarheit',
        description: 'Tor 3 im bewussten Merkur: Du kannst Ungeordnetes, Rohes, Unfertiges in eine Form bringen, die verständlich und umsetzbar ist. Du bist der Moment, in dem ein verwirrendes Knäuel an Gedanken plötzlich eine klare Linie wird.',
        deep_meaning: 'Der Tanz zwischen Offenheit und Struktur: zu viel Struktur zu früh – und die Lebendigkeit erstickt. zu wenig Struktur – und die Möglichkeiten zerfallen ins Chaos. Deine Aufgabe ist es, die Mitte zu finden.',
        shadow_aspects: JSON.stringify([
          'Du presst Dinge zu früh in Formen',
          'Du formulierst vorschnell, ohne alle Informationen',
          'Du benutzt Struktur, um Unsicherheit zu vermeiden',
          'Du überstrukturierst und nimmst deiner Botschaft die Lebendigkeit'
        ]),
        gifts: JSON.stringify([
          'Strukturierung komplexer Prozesse',
          'Klarheitseffekt in Marketing',
          'Positionierung durch Struktur',
          'Kommunikation als Ordnungswerkzeug'
        ]),
        affirmation: 'Ich bringe Ordnung ins Chaos. Meine Kommunikation bringt Struktur ins Angebot.',
        center_name: "G"
      });
    } else if (planetKey === 'merkur' && i === 4) {
      // Spezielle Mercury-Daten für Tor 4
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Antwort',
        essence: 'Der innere Analytiker in dir - Unbewusste Logik durch durchdachte Antworten',
        consciousness: 'Sprache als Vertrauensanker - Bewusste Logik durch präzise Kommunikation',
        description: 'Tor 4 im bewussten Merkur: Du lebt in dir eine natürliche Tendenz, Dinge zu durchdenken, zu durchleuchten und so zu formulieren, dass sie für dich und andere Sinn ergeben. Es ist, als würdest du mit jedem Satz ein kleines Stück Unsicherheit aus der Welt schaffen.',
        deep_meaning: 'Der Tanz zwischen Analyse und Ausdruck: Zu viel Nachdenken – und deine Worte kommen zu spät. Zu wenig Klarheit – und sie sind nicht präzise genug. Tor 4 will, dass du eine Sprache findest, die durchdacht und zugänglich ist.',
        shadow_aspects: JSON.stringify([
          'Du sprichst nur, um recht zu haben',
          'Du überforderst andere mit zu viel Logik',
          'Du wartest so lange auf die perfekte Antwort, dass du gar nichts mehr sagst',
          'Du verlierst dich in Details und erschlägst Kunden mit Informationen'
        ]),
        gifts: JSON.stringify([
          'Übersetzung komplexer Probleme in verständliche Lösungen',
          'Vertrauen durch Logik',
          'Positionierung durch Klarheit',
          'Marketing mit Argumentationskraft'
        ]),
        affirmation: 'Ich bringe Logik in meine Worte. Ich übersetze komplexe Probleme in verständliche Lösungen.',
        center_name: "G"
      });
    } else if (planetKey === 'merkur' && i === 5) {
      // Spezielle Mercury-Daten für Tor 5
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Warten',
        essence: 'Die Stimme, die Ordnung durch Rhythmus gibt - Unbewusste Stabilität durch wiederkehrende Muster',
        consciousness: 'Sprache als Taktgeber für dein Business - Bewusste Stabilität durch Beständigkeit',
        description: 'Tor 5 im bewussten Merkur: Deine Kommunikation hat einen Pulsschlag. Du drückst dich nicht chaotisch aus – du baust innere und äußere Rhythmen in deine Sprache ein. Deine Worte geben Halt, weil sie nicht nur Inhalt, sondern auch Verlässlichkeit transportieren.',
        deep_meaning: 'Der Tanz zwischen Struktur und Spontanität: Zu viel Struktur: Deine Worte wirken starr und vorhersehbar. Zu wenig Struktur: Deine Botschaften verlieren an Klarheit und Halt. Tor 5 erinnert dich daran, den Rahmen so stabil zu halten, dass er Sicherheit gibt.',
        shadow_aspects: JSON.stringify([
          'Du wiederholst alte Aussagen, obwohl sie dich nicht mehr repräsentieren',
          'Du klammerst dich an Formulierungen, weil sie sich „bewährt" haben',
          'Du vermeidest Neues, um den Takt nicht zu verlieren',
          'Du wiederholst dich so sehr, dass es stagnierend wirkt'
        ]),
        gifts: JSON.stringify([
          'Vertrauen durch Beständigkeit',
          'Positionierung durch Wiedererkennbarkeit',
          'Marketing mit Kontinuitätseffekt',
          'Kommunikation als Stabilitätsgeber'
        ]),
        affirmation: 'Ich spreche im Rhythmus. Meine Kommunikation gibt meinem Business Struktur.',
        center_name: "SACRAL"
      });
    } else if (planetKey === 'merkur' && i === 6) {
      // Spezielle Mercury-Daten für Tor 6
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Konflikt',
        essence: 'Die Stimme, die Verbindung steuert - Unbewusste Nähe durch bewusste Grenzen',
        consciousness: 'Sprache als Qualitätsfilter - Bewusste Nähe durch selektive Kommunikation',
        description: 'Tor 6 im bewussten Merkur: Deine Kommunikation hat eine besondere Schwelle. Sie kann Nähe herstellen – oder Grenzen ziehen. Du spürst genau, wann der Moment reif ist, und wann es klüger ist, zu schweigen. Deine Worte sind wie Schlüssel: Manche öffnen Türen, manche verriegeln sie.',
        deep_meaning: 'Der Tanz zwischen Offenheit und Schutz: Zu viel Schutz: Du hältst Distanz, auch wenn Nähe möglich wäre. Zu viel Offenheit: Du lässt alles durch, ohne Filter, und verlierst Energie. Deine Kunst ist es, diesen Filter bewusst einzusetzen – nicht aus Angst, sondern aus Klarheit.',
        shadow_aspects: JSON.stringify([
          'Du hältst Informationen zurück, um Kontrolle zu behalten',
          'Du öffnest dich in unpassenden Momenten',
          'Du sprichst, um Nähe zu erzwingen, statt sie wachsen zu lassen',
          'Du bist zu vage, um die richtigen Kunden anzuziehen'
        ]),
        gifts: JSON.stringify([
          'Qualitätsfilter durch Sprache',
          'Positionierung durch Selektion',
          'Marketing mit Resonanzqualität',
          'Kommunikation als Tor'
        ]),
        affirmation: 'Ich spreche als Torhüter. Meine Kommunikation entscheidet, wer den Raum betritt.',
        center_name: "SOLAR"
      });
    } else if (planetKey === 'merkur' && i === 7) {
      // Spezielle Mercury-Daten für Tor 7
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Armee',
        essence: 'Die Stimme, die den Kurs hält - Unbewusste Führung durch klare Orientierung',
        consciousness: 'Sprache als Leadership-Tool - Bewusste Führung durch klare Kommunikation',
        description: 'Tor 7 im bewussten Merkur: Deine Kommunikation besitzt eine natürliche Führungsqualität. Du brauchst keine Machtposition, um Einfluss zu haben – deine Worte sind die Autorität. Es ist nicht die Lautstärke, die dich leitet, sondern die Klarheit, mit der du deine Gedanken formulierst.',
        deep_meaning: 'Der Tanz zwischen Zuhören und Lenken: Zu viel Führung: Du übernimmst Verantwortung, bevor sie gefragt ist. Zu wenig Führung: Du hältst dich zurück, obwohl deine Worte helfen würden. Die Kunst liegt darin, erst zu hören, dann zu sprechen – und das Gesagte als klare Richtung zu setzen.',
        shadow_aspects: JSON.stringify([
          'Du setzt Richtung, ohne Rücksicht auf andere Stimmen',
          'Du hältst an einem Kurs fest, obwohl er nicht mehr passt',
          'Du passt deine Worte so an, dass du Führung vermeidest',
          'Du wirkst zu bestimmend und schreckt damit potenzielle Partner ab'
        ]),
        gifts: JSON.stringify([
          'Führung durch klare Kommunikation',
          'Positionierung durch klare Richtung',
          'Marketing mit Führungscharakter',
          'Kommunikation als Führungsinstrument'
        ]),
        affirmation: 'Ich leite durch meine Worte. Meine Worte positionieren mich als Leader.',
        center_name: "G"
      });
    } else if (planetKey === 'merkur' && i === 8) {
      // Spezielle Mercury-Daten für Tor 8
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Beteiligung',
        essence: 'Die Stimme, die Individualität teilt - Unbewusste Einzigartigkeit durch authentischen Ausdruck',
        consciousness: 'Sprache als Differenzierungsfaktor - Bewusste Einzigartigkeit durch unverwechselbare Stimme',
        description: 'Tor 8 im bewussten Merkur: Du trägst die Fähigkeit in dir, deinen eigenen, unverwechselbaren Ausdruck in die Welt zu bringen – und andere damit zu inspirieren, ebenfalls ihre Einzigartigkeit zu leben. Du bist nicht hier, um dich anzupassen. Du bist hier, um das zu benennen, was nur durch dich gesagt werden kann.',
        deep_meaning: 'Der Tanz zwischen Authentizität und Anerkennung: Zu viel Anpassung: Du verlierst deine Eigenheit. Zu viel Abgrenzung: Du isolierst dich und deine Botschaft erreicht niemanden. Die Kunst liegt darin, dich zu zeigen, ohne dich zu verbiegen – und Resonanz willkommen zu heißen, ohne von ihr abhängig zu werden.',
        shadow_aspects: JSON.stringify([
          'Du wählst „sichere" Worte, die niemanden stören',
          'Du hältst deine Ideen zurück, aus Angst vor Ablehnung',
          'Du übernimmst die Sprache anderer, um dazuzugehören',
          'Du bleibst zu „neutral" und gehst in der Masse unter'
        ]),
        gifts: JSON.stringify([
          'Sprache als Differenzierungsfaktor',
          'Positionierung durch unverwechselbare Stimme',
          'Marketing mit Inspirationswirkung',
          'Kommunikation als Geschenk'
        ]),
        affirmation: 'Ich gebe meiner Einzigartigkeit eine Stimme. Meine Sprache macht meinen Beitrag sichtbar.',
        center_name: "THROAT"
      });
    } else if (planetKey === 'merkur' && i === 9) {
      // Spezielle Mercury-Daten für Tor 9
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Fokus',
        essence: 'Die Stimme der Präzision - Unbewusste Konzentration durch gezielte Kommunikation',
        consciousness: 'Sprache als Fokussierungswerkzeug - Bewusste Konzentration durch präzise Botschaften',
        description: 'Tor 9 im bewussten Merkur: Deine Sprache besitzt eine besondere Qualität - sie kann das Wesentliche herausfiltern und alles Überflüssige weglassen. Du bist nicht hier, um jedes Detail zu erzählen. Du bist hier, um den Kern zu treffen. Deine Worte bringen Klarheit, weil sie nicht zerfasern – sondern bündeln.',
        deep_meaning: 'Der Tanz zwischen Tiefe und Offenheit: Zu viel Fokus: Du schneidest Ideen ab, bevor sie reifen. Zu wenig Fokus: Die Energie verläuft sich und nichts kommt in die Umsetzung. Deine Kunst liegt darin, zu wissen, wann es Zeit ist, zu fokussieren – und wann es Zeit ist, Raum zu lassen.',
        shadow_aspects: JSON.stringify([
          'Du unterbrichst, um schneller zum Punkt zu kommen',
          'Du drängst andere zu früh auf ein Ziel fest',
          'Du verlierst Geduld für langsame Prozesse',
          'Du bist so stark fokussiert, dass du potenziell wertvolle Nebenthemen ausschließt'
        ]),
        gifts: JSON.stringify([
          'Sprache als Fokussierungswerkzeug',
          'Positionierung durch Klarheit',
          'Marketing mit Zielwirkung',
          'Kommunikation als Laserstrahl'
        ]),
        affirmation: 'Meine Worte bündeln Energie. Ich fokussiere meine Botschaft.',
        center_name: "ROOT"
      });
    } else if (planetKey === 'merkur' && i === 10) {
      // Spezielle Mercury-Daten für Tor 10
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Selbsttreue',
        essence: 'Die Stimme der Authentizität - Unbewusste Identität durch echte Kommunikation',
        consciousness: 'Sprache als Markenidentität - Bewusste Identität durch wertebasierte Kommunikation',
        description: 'Tor 10 im bewussten Merkur: Deine Kommunikation ist untrennbar mit deiner Identität verbunden. Du kannst dich nicht lange verstellen – deine Sprache verrät immer, wer du bist. Deine Worte tragen deine Haltung, deine Werte, deine gelebte Wahrheit. Egal, ob du es bewusst planst oder nicht – deine Kommunikation ist ein Spiegel deiner Selbstannahme.',
        deep_meaning: 'Der Tanz zwischen Echtheit und Anpassung: Zu viel Anpassung: Du verlierst deine Integrität. Zu viel Härte in der Echtheit: Du stößt Menschen unnötig vor den Kopf. Deine Aufgabe ist es, authentisch zu sprechen, ohne verletzend zu sein – und kompromisslos zu dir zu stehen, ohne dich von der Resonanz abhängig zu machen.',
        shadow_aspects: JSON.stringify([
          'Du vermeidest klare Aussagen',
          'Du übernimmst die Sichtweise anderer, um Konflikten aus dem Weg zu gehen',
          'Du gibst vor, etwas zu sein, was nicht deiner Wahrheit entspricht',
          'Du weichst von deinen Werten ab, um einen Auftrag zu bekommen'
        ]),
        gifts: JSON.stringify([
          'Sprache als Markenidentität',
          'Positionierung durch Wertekommunikation',
          'Marketing mit Authentizität',
          'Kommunikation als Identitätsanker'
        ]),
        affirmation: 'Ich spreche aus meiner Selbsttreue. Meine Kommunikation ist meine Marke.',
        center_name: "SOLAR"
      });
    } else if (planetKey === 'merkur' && i === 11) {
      // Spezielle Mercury-Daten für Tor 11
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Idee',
        essence: 'Die Stimme der Vorstellungskraft - Unbewusste Inspiration durch bildhafte Kommunikation',
        consciousness: 'Sprache als Visionskraft im Business - Bewusste Inspiration durch strategische Bilder',
        description: 'Tor 11 im bewussten Merkur: Deine Sprache ist mehr als Information – sie ist eine Projektionsfläche für Bilder, die andere in ihrem Inneren sehen. Du bist ein Geschichtenerzähler, selbst wenn du nüchterne Fakten vermittelst. Deine Worte erschaffen Landschaften, die Menschen betreten können.',
        deep_meaning: 'Der Tanz zwischen Inspiration und Überforderung: Zu viele Ideen: Deine Botschaft verliert an Fokus. Zu wenig Teilen: Deine Visionen verkümmern ungehört. Die Kunst liegt darin, aus der Fülle zu wählen und gezielt zu sprechen.',
        shadow_aspects: JSON.stringify([
          'Du inspirierst, aber es fehlt der nächste Schritt',
          'Du wechselst zu schnell von einem Bild zum anderen',
          'Du verlierst dich in Visionen, ohne Umsetzung',
          'Du inspirierst, ohne klar zu sagen, wie man starten kann'
        ]),
        gifts: JSON.stringify([
          'Sprache als Visionskraft im Business',
          'Positionierung durch Story und Vision',
          'Marketing mit Sogwirkung',
          'Kommunikation als Leinwand'
        ]),
        affirmation: 'Meine Worte tragen Bilder. Meine Kommunikation inspiriert Märkte.',
        center_name: "AJNA"
      });
    } else if (planetKey === 'merkur' && i === 12) {
      // Spezielle Mercury-Daten für Tor 12
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Zurückhaltung',
        essence: 'Die Stimme der Bedachtsamkeit - Unbewusste Wirkung durch bewusste Auswahl',
        consciousness: 'Sprache als strategisches Werkzeug - Bewusste Wirkung durch gezieltes Timing',
        description: 'Tor 12 im bewussten Merkur: Du hast die Gabe, Sprache bewusst zu wählen. Du redest nicht, um Raum zu füllen – du redest, um Wirkung zu erzeugen. Du spürst, dass nicht jedes Gespräch und nicht jeder Moment Worte braucht. Deine Stärke liegt darin, zu warten, bis das Timing stimmt – und dann genau die Formulierung zu wählen, die ins Herz trifft.',
        deep_meaning: 'Der Tanz zwischen Ausdruck und Zurückhaltung: Zu viel Zurückhaltung: Du sagst gar nichts und verlierst Einfluss. Zu viel Ausdruck: Du überforderst mit Worten, die nicht reifen konnten. Die Kunst liegt darin, deine Stimme bewusst einzusetzen, ohne dich aus Angst zu blockieren.',
        shadow_aspects: JSON.stringify([
          'Du wartest so lange, dass der Moment vorbei ist',
          'Du redest nur, wenn du sicher bist, dass es ankommt',
          'Du verlierst Authentizität, weil du zu vorsichtig bist',
          'Du kommunizierst zu selten und wirst übersehen'
        ]),
        gifts: JSON.stringify([
          'Sprache als strategisches Werkzeug',
          'Positionierung durch gezielte Kommunikation',
          'Marketing mit Spannungsaufbau',
          'Kommunikation als feine Kunst'
        ]),
        affirmation: 'Ich spreche, wenn es zählt. Meine Worte setzen den entscheidenden Impuls.',
        center_name: "THROAT"
      });
    } else if (planetKey === 'merkur' && i === 13) {
      // Spezielle Mercury-Daten für Tor 13
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Zuhören',
        essence: 'Die Stimme des Zuhörens - Unbewusste Empathie durch aufmerksame Kommunikation',
        consciousness: 'Sprache als Resonanzraum - Bewusste Empathie durch Community-Verständnis',
        description: 'Tor 13 im bewussten Merkur: Deine Kommunikation beginnt nicht beim Sprechen, sondern beim Hinhören. Du hast die Fähigkeit, Geschichten, Erfahrungen und Gefühle anderer aufzunehmen und ihnen in deiner Sprache eine neue Form zu geben. Oft bist du der Mensch, dem man Dinge anvertraut, weil deine Präsenz Sicherheit schafft.',
        deep_meaning: 'Der Tanz zwischen Empathie und Abgrenzung: Zu viel Offenheit: Du übernimmst fremde Geschichten, bis sie dich erdrücken. Zu viel Abgrenzung: Du verschließt dich und verlierst den Zugang zu dieser Gabe. Die Kunst liegt darin, dich als Kanal zu verstehen – nicht als Speicher, der alles behalten muss.',
        shadow_aspects: JSON.stringify([
          'Du erzählst Dinge weiter, die dir im Vertrauen gesagt wurden',
          'Du nutzt die Geschichte anderer für deine eigene Positionierung, ohne sie zu achten',
          'Du trägst Lasten, die nicht deine sind, und verstummst unter der Schwere',
          'Du passt dich so sehr an, dass deine eigene Botschaft untergeht'
        ]),
        gifts: JSON.stringify([
          'Sprache als Resonanzraum',
          'Positionierung durch das Verstehen anderer',
          'Marketing mit Zuhör-Strategie',
          'Kommunikation als Spiegel'
        ]),
        affirmation: 'Ich höre die Geschichten anderer. Ich höre den Markt, bevor ich spreche.',
        center_name: "THROAT"
      });
    } else if (planetKey === 'merkur' && i === 14) {
      // Spezielle Mercury-Daten für Tor 14
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Besitz',
        essence: 'Die Stimme des Reichtums - Unbewusste Wertschöpfung durch bewusste Kommunikation',
        consciousness: 'Sprache als Wertgenerator - Bewusste Wertschöpfung durch strategische Kommunikation',
        description: 'Tor 14 im bewussten Merkur: Du trägst eine besondere Gabe - du kannst das, was wertvoll ist, in Worte fassen – und dadurch sichtbar und nutzbar machen. Es geht nicht nur um Geld. Es geht um jede Form von Ressource: Fähigkeiten, Ideen, Kontakte, Möglichkeiten. Du bist jemand, der erkennt, was Potenzial hat, und es so benennt, dass andere es ebenfalls sehen und schätzen.',
        deep_meaning: 'Der Tanz zwischen Großzügigkeit und Fokus: Zu viel Großzügigkeit: Du verteilst Ressourcen wahllos, ohne Strategie. Zu viel Zurückhaltung: Du hältst Potenzial zurück, weil du Angst hast, es zu „verschwenden". Deine Aufgabe ist es, deine Worte bewusst als Investition zu sehen – nicht als beliebige Währung.',
        shadow_aspects: JSON.stringify([
          'Du betonst Wert nur, wenn er dir selbst zugutekommt',
          'Du übertreibst, um Ressourcen zu sichern',
          'Du schweigst über Wert, um andere kleinzuhalten',
          'Du sprichst zu abstrakt über den Wert deines Angebots'
        ]),
        gifts: JSON.stringify([
          'Sprache als Wertgenerator',
          'Positionierung durch Wertkommunikation',
          'Marketing mit Investitionslogik',
          'Kommunikation als Ressourcentransfer'
        ]),
        affirmation: 'Ich spreche den Wert aus. Meine Worte lenken Geld- und Energieflüsse.',
        center_name: "SACRAL"
      });
    } else if (planetKey === 'merkur' && i === 15) {
      // Spezielle Mercury-Daten für Tor 15
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Bescheidenheit',
        essence: 'Die Stimme der Balance - Unbewusste Harmonie durch bewusste Verbindung',
        consciousness: 'Sprache als Brücke im Business - Bewusste Harmonie durch inklusive Kommunikation',
        description: 'Tor 15 im bewussten Merkur: Du kannst Unterschiede, Gegensätze und Widersprüche benennen – ohne sie gegeneinander auszuspielen. Du bist nicht hier, um eine Seite zu wählen. Du bist hier, um das verbindende Muster sichtbar zu machen. Oft bist du der Mensch, der Spannungen im Gespräch entschärft, indem du Worte findest, die alle Seiten anerkennen.',
        deep_meaning: 'Der Tanz zwischen Neutralität und Position: Zu viel Neutralität: Du wirst unsichtbar und unverbindlich. Zu viel Stellungnahme: Du verlierst deine verbindende Wirkung. Deine Kunst ist es, klar zu sprechen, ohne Spaltung zu fördern.',
        shadow_aspects: JSON.stringify([
          'Du weichst heiklen Themen aus',
          'Du sprichst in so allgemeinen Begriffen, dass niemand wirklich versteht, wofür du stehst',
          'Du vermeidest Konfrontation, selbst wenn sie nötig wäre',
          'Zu breite Ansprache, die niemanden tief erreicht'
        ]),
        gifts: JSON.stringify([
          'Sprache als Brücke im Business',
          'Positionierung durch Werte der Inklusion',
          'Marketing mit Gemeinschaftsgefühl',
          'Kommunikation als Harmoniebringer'
        ]),
        affirmation: 'Ich spreche aus der Mitte. Meine Kommunikation schafft Balance im Markt.',
        center_name: "G"
      });
    } else if (planetKey === 'merkur' && i === 16) {
      // Spezielle Mercury-Daten für Tor 16
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Begeisterung',
        essence: 'Die Stimme der Begeisterung - Unbewusste Energie durch bewusste Leidenschaft',
        consciousness: 'Sprache als Energiequelle im Business - Bewusste Begeisterung durch authentische Kommunikation',
        description: 'Tor 16 im bewussten Merkur: In deiner Sprache steckt eine lebendige, ansteckende Energie. Deine Worte sind nicht nur Informationen – sie sind Funken, die Feuer entfachen können. Du bist nicht hier, um neutral zu klingen. Deine Sprache lebt, weil sie von echtem Interesse und Freude durchdrungen ist. Oft merken Menschen dir schon an deiner Stimmlage und Wortwahl an, dass dir etwas wirklich wichtig ist – und genau das zieht sie in deinen Bann.',
        deep_meaning: 'Der Tanz zwischen Show und Substanz: Zu viel Show: Die Begeisterung wirkt übertrieben und künstlich. Zu wenig Ausdruck: Die Botschaft bleibt farblos und wird überhört. Deine Kunst liegt darin, Begeisterung aus echter Verbindung zu deinem Thema zu schöpfen – und nicht aus reiner Wirkungslust.',
        shadow_aspects: JSON.stringify([
          'Du sprichst, um zu beeindrucken, nicht um zu verbinden',
          'Du nutzt Emotion, um von fehlender Substanz abzulenken',
          'Du übertreibst und verlierst dadurch Glaubwürdigkeit',
          'Du verlässt dich zu sehr auf Emotion und vernachlässigst Fakten'
        ]),
        gifts: JSON.stringify([
          'Sprache als Energiequelle im Business',
          'Positionierung durch spürbare Kompetenzfreude',
          'Marketing mit Sogwirkung',
          'Kommunikation als Verstärker'
        ]),
        affirmation: 'Ich spreche mit Begeisterung. Meine Worte wecken Kaufmotivation.',
        center_name: "THROAT"
      });
    } else if (planetKey === 'merkur' && i === 17) {
      // Spezielle Mercury-Daten für Tor 17
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Meinung',
        essence: 'Die Stimme der Klarheit und Ordnung - Unbewusste Struktur durch bewusste Meinungsbildung',
        consciousness: 'Sprache als Positionierungswerkzeug - Bewusste Meinungsbildung durch klare Haltung',
        description: 'Tor 17 im bewussten Merkur: Du besitzt eine besondere Strukturkraft. Du kannst aus einer Vielzahl von Eindrücken eine klar formulierte Meinung bilden – und diese so ausdrücken, dass sie nachvollziehbar ist. Du sprichst nicht, um zu verwirren. Du sprichst, um Orientierung zu geben. Deine Worte sind oft wie gut sortierte Werkzeuge: jedes an seinem Platz, bereit für den gezielten Einsatz.',
        deep_meaning: 'Der Tanz zwischen Meinung und Offenheit: Zu viel Meinung: Du wirkst starr und unflexibel. Zu wenig Meinung: Du verlierst Profil und Einfluss. Die Kunst liegt darin, deine Sicht klar zu formulieren, ohne den Dialog zu schließen.',
        shadow_aspects: JSON.stringify([
          'Du betonst Recht haben über Verstehen wollen',
          'Du schneidest alternative Sichtweisen ab',
          'Du formulierst so streng, dass kein Raum für Flexibilität bleibt',
          'Du bist so stark auf deine Sicht fixiert, dass du Marktsignale übersiehst'
        ]),
        gifts: JSON.stringify([
          'Sprache als Positionierungswerkzeug',
          'Positionierung durch Haltung',
          'Marketing mit Meinungsstärke',
          'Kommunikation als Strukturgeber'
        ]),
        affirmation: 'Ich formuliere meine Sicht klar. Meine Worte geben meiner Marke eine klare Haltung.',
        center_name: "AJNA"
      });
    } else if (planetKey === 'merkur' && i === 18) {
      // Spezielle Mercury-Daten für Tor 18
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Korrektur',
        essence: 'Die Stimme der Korrektur - Unbewusste Verbesserung durch bewusste Optimierung',
        consciousness: 'Sprache als Optimierungskraft - Bewusste Verbesserung durch lösungsorientiertes Feedback',
        description: 'Tor 18 im bewussten Merkur: Du trägst eine besondere Gabe - du kannst Ungleichgewichte, Schwachstellen und Optimierungspotenziale nicht nur erkennen, sondern so in Worte fassen, dass sie zu Verbesserungen führen können. Du bist nicht hier, um zu kritisieren, um der Kritik willen. Du bist hier, um Dinge zu heilen, zu verfeinern, zu verbessern – und deine Sprache ist eines deiner wichtigsten Werkzeuge dafür.',
        deep_meaning: 'Der Tanz zwischen Kritik und Verbesserung: Zu viel Kritik: Du wirkst destruktiv und demotivierend. Zu wenig Feedback: Potenzial bleibt ungenutzt. Deine Kunst liegt darin, Schwachstellen so anzusprechen, dass sie motivieren und zu Lösungen führen.',
        shadow_aspects: JSON.stringify([
          'Du kritisierst, um zu verletzen, nicht um zu helfen',
          'Du siehst nur das Negative und übersiehst Stärken',
          'Du gibst Feedback ohne konstruktive Lösungsvorschläge',
          'Du bist so perfektionistisch, dass du Fortschritte blockierst'
        ]),
        gifts: JSON.stringify([
          'Sprache als Optimierungskraft',
          'Positionierung durch lösungsorientiertes Feedback',
          'Marketing mit Qualitätsfokus',
          'Kommunikation als Verbesserungswerkzeug'
        ]),
        affirmation: 'Ich spreche, um zu verbessern. Meine Worte steigern Qualität.',
        center_name: "SPLEEN"
      });
    } else if (planetKey === 'merkur' && i === 19) {
      // Spezielle Mercury-Daten für Tor 19
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Nähe',
        essence: 'Die Stimme der Sensibilität - Unbewusste Verbindung durch bewusste Bedürfniswahrnehmung',
        consciousness: 'Sprache als Bindungskraft - Bewusste Verbindung durch achtsame Kommunikation',
        description: 'Tor 19 im bewussten Merkur: Du bist besonders feinfühlig für die unausgesprochenen Bedürfnisse in deinem Umfeld. Deine Worte können wie Fühler wirken – sie tasten ab, wo jemand mehr Nähe, Unterstützung oder Aufmerksamkeit braucht. Du bist nicht hier, um oberflächlich zu reden. Du bist hier, um Resonanzräume zu schaffen, in denen Menschen sich gesehen fühlen.',
        deep_meaning: 'Der Tanz zwischen Nähe und Unabhängigkeit: Zu viel Anpassung: Du verlierst deine eigene Stimme. Zu viel Rückzug: Du schließt andere von deiner Sensibilität aus. Die Kunst ist es, klar zu sprechen, ohne dich selbst aufzugeben.',
        shadow_aspects: JSON.stringify([
          'Du sprichst, um gemocht zu werden',
          'Du vermeidest klare Worte, um niemanden zu verletzen',
          'Du verlierst dich im „Kümmern" und vergisst dich selbst',
          'Du passt dich so stark an, dass deine Marke ihr Profil verliert'
        ]),
        gifts: JSON.stringify([
          'Sprache als Bindungskraft',
          'Positionierung durch Bedürfniswahrnehmung',
          'Marketing mit Sensibilität',
          'Kommunikation als Brücke'
        ]),
        affirmation: 'Ich spreche, um Verbindung zu schaffen. Meine Kommunikation baut Kundenbeziehungen auf.',
        center_name: "ROOT"
      });
    } else if (planetKey === 'merkur' && i === 20) {
      // Spezielle Mercury-Daten für Tor 20
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Gegenwart',
        essence: 'Die Stimme des Augenblicks - Unbewusste Spontanität durch bewusste Präsenz',
        consciousness: 'Sprache als Energie-Booster - Bewusste Spontanität durch authentische Kommunikation',
        description: 'Tor 20 im bewussten Merkur: Du lebst in der Sprache des Hier und Jetzt. Deine Worte haben Kraft, weil sie ungefiltert und direkt aus dem Moment entstehen. Du bist nicht hier, um lange zu überlegen. Du bist hier, um dem Augenblick eine Stimme zu geben. Du spürst, dass Wahrheit nicht immer vorbereitet werden muss. Manchmal genügt es, das zu sagen, was gerade da ist.',
        deep_meaning: 'Der Tanz zwischen Spontanität und Bedacht: Zu viel Spontanität: Worte kommen unbedacht und schaffen Konflikte. Zu viel Bedacht: Worte verlieren ihre Energie und verpassen den Moment. Die Kunst liegt darin, deine Spontanität mit Bewusstsein zu verbinden.',
        shadow_aspects: JSON.stringify([
          'Du sprichst, ohne zuzuhören',
          'Du suchst Bestätigung durch spontane Aussagen',
          'Du lenkst den Fokus, ohne Substanz zu haben',
          'Du sprichst zu spontan und wirkst unprofessionell'
        ]),
        gifts: JSON.stringify([
          'Sprache als Energie-Booster',
          'Positionierung durch Präsenz',
          'Marketing mit Lebendigkeit',
          'Kommunikation als Gegenwartsanker'
        ]),
        affirmation: 'Ich spreche im Jetzt. Meine Worte bringen mein Business in den Moment.',
        center_name: "THROAT"
      });
    } else if (planetKey === 'merkur' && i === 21) {
      // Spezielle Mercury-Daten für Tor 21
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Kontrolle',
        essence: 'Die Stimme der Führung - Unbewusste Kontrolle durch bewusste Strukturierung',
        consciousness: 'Sprache als Führungsinstrument - Bewusste Führung durch klare Kommunikation',
        description: 'Tor 21 im bewussten Merkur: Deine Worte tragen die Energie von Leitung und Klarheit. Du bist nicht hier, um nur zu beobachten – du bist hier, um Ordnung zu schaffen. Deine Sprache hat etwas Entscheidendes, Verbindliches. Oft bist du die Person, die im Gespräch sagt: „So machen wir es." Tor 21 erkennt sofort, wenn Chaos herrscht. Es drängt dich, Dinge zu benennen, die organisiert und geführt werden müssen.',
        deep_meaning: 'Der Tanz zwischen Macht und Verantwortung: Zu viel Machtanspruch: Du bestimmst, ohne Rücksicht. Zu wenig Führung: Du vermeidest Verantwortung. Die Kunst liegt darin, deine Führungsenergie klar und fair einzusetzen.',
        shadow_aspects: JSON.stringify([
          'Du formulierst Befehle statt Impulse',
          'Du nutzt Worte, um andere kleinzuhalten',
          'Du redest, um Kontrolle zu behalten, nicht um zu führen',
          'Du kontrollierst zu stark und verlierst Flexibilität'
        ]),
        gifts: JSON.stringify([
          'Sprache als Führungsinstrument',
          'Positionierung durch Klarheit',
          'Marketing mit Struktur',
          'Kommunikation als Ordnungsgeber'
        ]),
        affirmation: 'Ich spreche, um zu führen. Meine Kommunikation gibt meinem Business Struktur.',
        center_name: "HEART"
      });
    } else if (planetKey === 'merkur' && i === 22) {
      // Spezielle Mercury-Daten für Tor 22
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Anmut',
        essence: 'Die Stimme der Anmut - Unbewusste Freundlichkeit durch bewusste Würde',
        consciousness: 'Sprache als Beziehungsbrücke - Bewusste Anmut durch authentische Kommunikation',
        description: 'Tor 22 im bewussten Merkur: Deine Worte haben eine besondere Qualität - sie sind getragen von Charme, Höflichkeit und emotionaler Intelligenz. Deine Sprache kann Türen öffnen, die sonst verschlossen bleiben. Nicht, weil du unbedingt das perfekte Argument hast – sondern weil deine Worte mit einer besonderen Ausstrahlung kommen. Du spürst: Menschen öffnen sich schneller, wenn sie sich wohlfühlen. Darum nutzt du Sprache, um Atmosphäre zu schaffen.',
        deep_meaning: 'Der Tanz zwischen Höflichkeit und Echtheit: Zu viel Anpassung: Worte wirken oberflächlich. Zu viel Direktheit: Worte wirken verletzend. Deine Kunst liegt darin, freundlich zu sprechen, ohne dich zu verbiegen.',
        shadow_aspects: JSON.stringify([
          'Du bleibst höflich, obwohl du wütend bist',
          'Du sagst Ja, obwohl du Nein meinst',
          'Du nutzt Charme, um zu manipulieren',
          'Du bleibst zu höflich und verlierst an Durchschlagskraft'
        ]),
        gifts: JSON.stringify([
          'Sprache als Beziehungsbrücke',
          'Positionierung mit Charme und Klarheit',
          'Marketing mit Resonanz',
          'Kommunikation als Einladung'
        ]),
        affirmation: 'Ich spreche mit Anmut. Meine Worte öffnen Kundenherzen.',
        center_name: "HEART"
      });
    } else if (planetKey === 'merkur' && i === 23) {
      // Spezielle Mercury-Daten für Tor 23
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Einfachheit',
        essence: 'Die Stimme der Einfachheit - Unbewusste Klarheit durch bewusste Vereinfachung',
        consciousness: 'Sprache als Verkaufsfaktor - Bewusste Klarheit durch verständliche Kommunikation',
        description: 'Tor 23 im bewussten Merkur: Du besitzt die Fähigkeit, Komplexes in einfache Sprache zu verwandeln. Deine Worte können wie eine Übersetzung wirken – sie holen Ideen aus dem Abstrakten ins Greifbare. Du bist nicht hier, um in Rätseln zu reden. Du bist hier, um Dinge auf den Punkt zu bringen. Du spürst sofort, wenn Sprache unnötig kompliziert ist. Dein Drang ist es, den Kern sichtbar zu machen – für dich und für andere.',
        deep_meaning: 'Der Tanz zwischen Tiefe und Einfachheit: Zu viel Tiefe: Andere verstehen dich nicht. Zu viel Vereinfachung: Andere nehmen dich nicht ernst. Deine Kunst liegt darin, das Wesentliche klar auszudrücken – ohne Substanz zu verlieren.',
        shadow_aspects: JSON.stringify([
          'Du erklärst so kompliziert, dass andere sich dumm fühlen',
          'Du vereinfachst so stark, dass Inhalte an Wert verlieren',
          'Du benutzt Worte, um dich über andere zu stellen',
          'Du vereinfachst so stark, dass dein Angebot oberflächlich wirkt'
        ]),
        gifts: JSON.stringify([
          'Sprache als Verkaufsfaktor',
          'Positionierung durch Klarheit',
          'Marketing mit Verständlichkeit',
          'Kommunikation als Übersetzung'
        ]),
        affirmation: 'Ich spreche, um Klarheit zu schaffen. Meine Kommunikation macht mein Angebot verständlich.',
        center_name: "THROAT"
      });
    } else if (planetKey === 'merkur' && i === 24) {
      // Spezielle Mercury-Daten für Tor 24
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Reflexion',
        essence: 'Die Stimme der Reflexion - Unbewusste Wiederkehr durch bewusste Vertiefung',
        consciousness: 'Sprache als Wiedererkennungswert - Bewusste Wiederholung durch reflektierte Kommunikation',
        description: 'Tor 24 im bewussten Merkur: Du arbeitest gedanklich oft in Schleifen. Deine Worte kommen manchmal wiederholt – nicht, weil du dich wiederholst, sondern weil du durch die Wiederholung Tiefe findest. Du bist nicht hier, um alles sofort zu verstehen. Du bist hier, um Schritt für Schritt Klarheit zu gewinnen – und diese Klarheit dann in Sprache zu gießen. Deine Kommunikation folgt oft Zyklen. Du kommst immer wieder auf bestimmte Themen zurück, bis sie für dich und andere klarer werden.',
        deep_meaning: 'Der Tanz zwischen Vertiefung und Stagnation: Zu viel Wiederholung: Gespräche drehen sich im Kreis. Zu wenig Reflexion: Einsichten verschwinden, bevor sie wirken können. Deine Kunst liegt darin, Wiederholung bewusst einzusetzen – als Mittel zur Klarheit.',
        shadow_aspects: JSON.stringify([
          'Du sprichst immer wieder dieselben Worte, ohne sie zu fühlen',
          'Du drehst dich in endlosen Gedankenschleifen',
          'Du blockierst dich, weil du keine Entscheidung triffst',
          'Du wiederholst dich zu mechanisch und wirkst leblos'
        ]),
        gifts: JSON.stringify([
          'Sprache als Wiedererkennungswert',
          'Positionierung durch reflektierte Kommunikation',
          'Marketing mit Vertrautheit',
          'Kommunikation als Wiedergewinnung'
        ]),
        affirmation: 'Ich spreche, um zurückzukehren. Meine Worte geben meinem Business Tiefe.',
        center_name: "AJNA"
      });
    } else if (planetKey === 'merkur' && i === 25) {
      // Spezielle Mercury-Daten für Tor 25
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Unschuld',
        essence: 'Die Stimme der Unschuld - Unbewusste Reinheit durch bewusste Echtheit',
        consciousness: 'Sprache als Vertrauensfaktor - Bewusste Authentizität durch unverfälschte Kommunikation',
        description: 'Tor 25 im bewussten Merkur: Deine Worte tragen eine besondere Reinheit. Sie sind frei von Manipulation und wirken deshalb oft überraschend direkt, ehrlich und klar. Du bist nicht hier, um strategisch zu reden. Du bist hier, um die Wahrheit so auszusprechen, wie sie durch dich fließt. Du spürst, wenn Worte gespielt, unecht oder taktisch sind. Dein eigenes Bedürfnis ist es, Sprache als Spiegel deiner reinen Absicht zu nutzen.',
        deep_meaning: 'Der Tanz zwischen Naivität und Weisheit: Zu viel Unschuld: Deine Worte wirken naiv und weltfremd. Zu viel Kalkül: Deine Worte verlieren ihre Reinheit. Deine Kunst liegt darin, Echtheit zu bewahren – und trotzdem weise zu sprechen.',
        shadow_aspects: JSON.stringify([
          'Du sprichst „unschuldig", um Kritik zu vermeiden',
          'Du nutzt Offenheit, um andere zu manipulieren',
          'Du sagst, was „rein" klingt, ohne es zu fühlen',
          'Deine Worte wirken zu naiv und schwächen deine Autorität'
        ]),
        gifts: JSON.stringify([
          'Sprache als Vertrauensfaktor',
          'Positionierung durch authentische Sprache',
          'Marketing mit Echtheit',
          'Kommunikation als Herzöffnung'
        ]),
        affirmation: 'Ich spreche aus Unschuld. Meine Worte bringen Echtheit ins Business.',
        center_name: "HEART"
      });
    } else if (planetKey === 'merkur' && i === 26) {
      // Spezielle Mercury-Daten für Tor 26
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Überzeugung',
        essence: 'Die Stimme der geschickten Überzeugung - Unbewusste Wirkung durch bewusste Strategie',
        consciousness: 'Sprache als Verpackungskunst - Bewusste Wirkung durch strategische Kommunikation',
        description: 'Tor 26 im bewussten Merkur: Du besitzt eine besondere Einflusskraft in deiner Sprache. Du weißt instinktiv, wie du eine Botschaft so verpacken kannst, dass sie beim Gegenüber ankommt. Es geht dir nicht nur um den Inhalt, sondern um die Wirkung. Du spürst, wie du etwas formulieren musst, damit es nicht nur verstanden, sondern auch akzeptiert wird. Für dich ist Kommunikation nicht neutral. Du willst, dass sie etwas bewirkt. Oft bist du ein geborener Diplomat, der weiß, wie er Brücken baut, ohne den Kern der Botschaft zu verlieren.',
        deep_meaning: 'Der Tanz zwischen Integrität und Strategie: Zu strategisch: Deine Botschaft wirkt unecht. Zu direkt: Du verlierst den Zugang zum Gegenüber. Deine Kunst liegt darin, ehrliche Inhalte so zu formulieren, dass sie wirken – ohne ihre Wahrheit zu verlieren.',
        shadow_aspects: JSON.stringify([
          'Du „polierst" so sehr, dass der Kern verloren geht',
          'Du sagst, was andere hören wollen',
          'Du nutzt deine Gabe für Eigennutz statt Mehrwert',
          'Du verpackst so stark, dass Authentizität verloren geht'
        ]),
        gifts: JSON.stringify([
          'Sprache als Verpackungskunst',
          'Positionierung durch wirkungsvolle Kommunikation',
          'Marketing mit strategischer Wahrhaftigkeit',
          'Kommunikation als Überzeugungskraft'
        ]),
        affirmation: 'Ich spreche, um zu überzeugen. Ich positioniere mich durch wirkungsvolle Kommunikation.',
        center_name: "HEART"
      });
    } else if (planetKey === 'merkur' && i === 27) {
      // Spezielle Mercury-Daten für Tor 27
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Fürsorge',
        essence: 'Die Stimme der Fürsorge - Unbewusste Nährung durch bewusste Verantwortung',
        consciousness: 'Sprache als Nahrung - Bewusste Fürsorge durch nährende Kommunikation',
        description: 'Tor 27 im bewussten Merkur: Deine Worte tragen eine nährende Qualität. Du gibst Menschen das Gefühl, dass sie wichtig sind – und dass du Verantwortung übernimmst. Sprache ist für dich nicht nur Ausdruck, sondern ein Mittel, um andere zu stärken. Du kannst Sprache einsetzen, um Schutz und Sicherheit zu vermitteln. Mit Tor 27 fühlen sich deine Worte wie Nahrung an. Sie stärken, beruhigen, ermutigen.',
        deep_meaning: 'Der Tanz zwischen Selbstaufgabe und Abgrenzung: Du gibst dich sprachlich völlig für andere auf. Du verweigerst Fürsorge, um dich zu schützen. Deine Kunst ist es, Sprache zu finden, die nährt – ohne dich selbst zu verlieren.',
        shadow_aspects: JSON.stringify([
          'Du machst andere abhängig von deiner Fürsorge',
          'Du hältst Verantwortung zurück, um Macht zu behalten',
          'Du opferst dich auf, bis nichts mehr für dich bleibt',
          'Du sprichst, um andere zu retten'
        ]),
        gifts: JSON.stringify([
          'Sprache als Nahrung',
          'Positionierung durch Verantwortung und Fürsorge',
          'Marketing mit nährenden Botschaften',
          'Kommunikation als Stärkung'
        ]),
        affirmation: 'Ich spreche, um Fürsorge auszudrücken. Meine Worte stärken mein Team und meine Kunden.',
        center_name: "SPLEEN"
      });
    } else if (planetKey === 'merkur' && i === 28) {
      // Spezielle Mercury-Daten für Tor 28
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Sinn',
        essence: 'Die Stimme des Sinns - Unbewusste Tiefe durch bewusste Bedeutung',
        consciousness: 'Sprache als Sinnvermittler - Bewusste Orientierung durch sinnstiftende Kommunikation',
        description: 'Tor 28 im bewussten Merkur: Du trägst eine Sprache, die sich nicht mit Oberflächlichkeiten zufriedengibt. Du willst Bedeutung finden – und diese Bedeutung in Worte fassen. Oft bist du derjenige, der in Gesprächen fragt: „Wozu machen wir das eigentlich?" Für dich ist Sprache ein Werkzeug, um Orientierung zu schaffen, wenn der Weg unklar ist. Du sprichst nicht nur, um zu unterhalten, sondern um etwas zu verankern: eine Richtung, einen Wert, einen tieferen Grund.',
        deep_meaning: 'Der Tanz zwischen Tiefe und Schwere: Zu viel Tiefe: Gespräche werden schwer und bedrückend. Zu wenig Ausdruck: Das Wesentliche bleibt unausgesprochen. Deine Kunst liegt darin, über Sinn zu sprechen, ohne die Leichtigkeit zu verlieren.',
        shadow_aspects: JSON.stringify([
          'Du machst aus jeder Herausforderung einen existenziellen Kampf',
          'Du bleibst so lange im „Warum", dass es zu Handlungsunfähigkeit führt',
          'Du nutzt Sinnfragen, um Verantwortung zu vermeiden',
          'Du machst Gespräche zu schwer und bedrückend'
        ]),
        gifts: JSON.stringify([
          'Sprache als Sinnvermittler',
          'Positionierung durch klare Sinnbotschaften',
          'Marketing mit tieferen Werten',
          'Kommunikation als Orientierung'
        ]),
        affirmation: 'Ich spreche über Sinn und Richtung. Ich spreche über den tieferen Wert meiner Arbeit.',
        center_name: "ROOT"
      });
    } else if (planetKey === 'merkur' && i === 29) {
      // Spezielle Mercury-Daten für Tor 29
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Commitment',
        essence: 'Die Stimme des Commitments - Unbewusste Verbindlichkeit durch bewusste Hingabe',
        consciousness: 'Sprache als Vertrauensbasis - Bewusste Glaubwürdigkeit durch verbindliche Kommunikation',
        description: 'Tor 29 im bewussten Merkur: Deine Worte haben Gewicht, weil sie Bindung ausdrücken. Ein „Ja" von dir ist kein Lippenbekenntnis – es ist eine Entscheidung. Sprache ist für dich nicht beliebig. Du spürst, dass Worte Verpflichtungen schaffen können – und du willst, dass sie ehrlich sind. Mit Tor 29 sind deine Worte wie Verträge. Wenn du dich festlegst, spüren andere: Das ist verbindlich.',
        deep_meaning: 'Der Tanz zwischen Hingabe und Überforderung: Zu viel Hingabe: Du sagst zu allem Ja und brennst aus. Zu wenig Hingabe: Deine Worte verlieren ihre Kraft. Deine Kunst liegt darin, bewusst und klar zu wählen, wozu du dich sprachlich verpflichtest.',
        shadow_aspects: JSON.stringify([
          'Du sagst Ja, um Konflikte zu vermeiden',
          'Du versprichst mehr, als du leisten kannst',
          'Du bindest dich, ohne dich geprüft zu haben',
          'Du sagst zu allem Ja und brennst aus'
        ]),
        gifts: JSON.stringify([
          'Sprache als Vertrauensbasis',
          'Positionierung durch klare Zusagen',
          'Marketing mit Glaubwürdigkeit',
          'Kommunikation als Versprechen'
        ]),
        affirmation: 'Ich spreche mit Hingabe. Meine Worte schaffen Vertrauen durch Verbindlichkeit.',
        center_name: "SPLEEN"
      });
    } else if (planetKey === 'merkur' && i === 30) {
      // Spezielle Mercury-Daten für Tor 30
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Leidenschaft',
        essence: 'Die Stimme der Leidenschaft - Unbewusste Intensität durch bewusste Emotion',
        consciousness: 'Sprache als emotionaler Anker - Bewusste Herzenergie durch leidenschaftliche Kommunikation',
        description: 'Tor 30 im bewussten Merkur: Deine Worte sind nicht nur Information – sie sind Emotion, sie sind Feuer, sie sind der Ausdruck dessen, was dich im Innersten bewegt. Du kannst Gefühle so formulieren, dass andere sie miterleben. Deine Sprache brennt vor Intensität, weil sie nicht nur aus dem Kopf, sondern aus deinem Herzraum kommt. Für dich ist es schwer, dich mit rein sachlicher Kommunikation zufriedenzugeben. Du möchtest, dass Menschen fühlen, was du meinst – nicht nur, dass sie es verstehen.',
        deep_meaning: 'Der Tanz zwischen Intensität und Balance: Zu viel Feuer: Du überrollst andere mit deiner Emotion. Zu wenig Ausdruck: Du unterdrückst deine Leidenschaft. Deine Kunst liegt darin, dein Feuer so zu kanalisieren, dass es wärmt und inspiriert, statt zu verbrennen.',
        shadow_aspects: JSON.stringify([
          'Du sprichst in Extremen, um Wirkung zu erzeugen',
          'Du hängst an Wunschbildern, ohne ins Handeln zu kommen',
          'Du nutzt Emotion, um Zustimmung zu erzwingen',
          'Du überrollst andere mit deiner Emotion'
        ]),
        gifts: JSON.stringify([
          'Sprache als emotionaler Anker',
          'Positionierung durch Herzenergie',
          'Marketing mit Leidenschaft',
          'Kommunikation als emotionale Zündung'
        ]),
        affirmation: 'Ich spreche meine Sehnsucht aus. Ich verkaufe durch emotionale Verbindung.',
        center_name: "SOLAR_PLEXUS"
      });
    } else if (planetKey === 'merkur' && i === 31) {
      // Spezielle Mercury-Daten für Tor 31
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Führung',
        essence: 'Die Stimme der Führung durch Sprache - Unbewusste Kollektivität durch bewusste Richtung',
        consciousness: 'Sprache als Leadership-Tool - Bewusste Führung durch kollektive Kommunikation',
        description: 'Tor 31 im bewussten Merkur: Deine Worte haben eine kollektive Dimension. Sie sind nicht nur für dich gedacht – sie wirken für eine Gruppe, ein Team, eine Gemeinschaft. Du bist nicht hier, um allein zu sprechen. Du bist hier, um eine Stimme für viele zu sein. Deine Worte tragen Gewicht, weil sie nicht nur deine Sicht widerspiegeln, sondern auch die Bedürfnisse anderer. Mit Tor 31 kannst du Worte finden, die Orientierung für viele schaffen.',
        deep_meaning: 'Der Tanz zwischen Ego und Kollektiv: Zu viel Ego: Du nutzt Sprache für Macht. Zu wenig Stimme: Du hältst dich zurück, obwohl Führung gebraucht wird. Deine Kunst liegt darin, im Namen des Ganzen zu sprechen – ohne dich selbst zu verlieren.',
        shadow_aspects: JSON.stringify([
          'Du formulierst, um Macht zu sichern',
          'Du sagst, was gehört werden will, nicht was nötig ist',
          'Du sprichst über andere hinweg',
          'Du nutzt Sprache für persönliche Macht'
        ]),
        gifts: JSON.stringify([
          'Sprache als Leadership-Tool',
          'Positionierung als Leader',
          'Marketing mit Führungsenergie',
          'Kommunikation als kollektive Stimme'
        ]),
        affirmation: 'Ich spreche als Stimme der Führung. Meine Worte positionieren mich als Leader.',
        center_name: "THROAT"
      });
    } else if (planetKey === 'merkur' && i === 32) {
      // Spezielle Mercury-Daten für Tor 32
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Beständigkeit',
        essence: 'Die Stimme der Beständigkeit - Unbewusste Stabilität durch bewusste Werte',
        consciousness: 'Sprache als Stabilitätsanker - Bewusste Nachhaltigkeit durch beständige Kommunikation',
        description: 'Tor 32 im bewussten Merkur: Deine Worte haben ein Fundament. Du sprichst nicht, um Trends zu bedienen, sondern um das zu schützen, was sich bewährt hat und tragfähig ist. Für dich ist Kommunikation ein Werkzeug, um Beständigkeit zu sichern. Deine Worte können Vertrauen geben, weil sie auf Nachhaltigkeit und Stabilität ausgerichtet sind. Mit Tor 32 kannst du Worte setzen, die Sicherheit vermitteln, ohne Entwicklungen zu blockieren.',
        deep_meaning: 'Der Tanz zwischen Bewahren und Veränderung: Zu viel Festhalten: Du verteidigst Altes, auch wenn es überholt ist. Zu viel Anpassung: Du verlierst deine Wurzeln. Deine Kunst liegt darin, Beständigkeit nicht mit Stillstand zu verwechseln.',
        shadow_aspects: JSON.stringify([
          'Du verteidigst Altes, auch wenn es überholt ist',
          'Du verlierst deine Wurzeln durch zu viel Anpassung',
          'Du nutzt Sprache nur noch zur Verteidigung',
          'Du verwechselst Beständigkeit mit Stillstand'
        ]),
        gifts: JSON.stringify([
          'Sprache als Stabilitätsanker',
          'Positionierung als Garant für nachhaltigen Erfolg',
          'Marketing mit Beständigkeit',
          'Kommunikation als Wertebewahrung'
        ]),
        affirmation: 'Ich spreche über das, was Bestand hat. Ich sichere den langfristigen Wert meiner Arbeit.',
        center_name: "SPLEEN"
      });
    } else if (planetKey === 'merkur' && i === 33) {
      // Spezielle Mercury-Daten für Tor 33
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Rückblick',
        essence: 'Die Stimme des Rückblicks - Unbewusste Weisheit durch bewusste Erfahrung',
        consciousness: 'Sprache als Storytelling-Instrument - Bewusste Geschichte durch erzählende Kommunikation',
        description: 'Tor 33 im bewussten Merkur: Deine Worte haben eine historische Dimension. Du sprichst nicht nur aus dem Moment – du bringst die Weisheit vergangener Erfahrungen in die Gegenwart. Du erkennst, dass Sprache Erinnerungen konserviert. Deine Worte sind oft geprägt von Rückschau, Reflexion und dem Bedürfnis, Erfahrungen weiterzugeben. Mit Tor 33 kannst du Geschichten und Erfahrungen so erzählen, dass andere daraus lernen.',
        deep_meaning: 'Der Tanz zwischen Bewahrung und Loslassen: Festhalten an der Vergangenheit. Vergessen der Erfahrungen. Deine Kunst liegt darin, Worte zu finden, die Lehren bewahren – ohne im Alten zu verharren.',
        shadow_aspects: JSON.stringify([
          'Du hältst an der Vergangenheit fest',
          'Du vergisst wichtige Erfahrungen',
          'Du nutzt Sprache, um in Nostalgie festzuhängen',
          'Du redest, um nicht fühlen zu müssen'
        ]),
        gifts: JSON.stringify([
          'Sprache als Storytelling-Instrument',
          'Positionierung durch Storytelling',
          'Marketing mit gelebter Erfahrung',
          'Kommunikation als Archiv'
        ]),
        affirmation: 'Ich spreche aus Erfahrung. Meine Worte machen meine Geschichte zu einem Asset.',
        center_name: "THROAT"
      });
    } else if (planetKey === 'merkur' && i === 34) {
      // Spezielle Mercury-Daten für Tor 34
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Handlungskraft',
        essence: 'Die Stimme der reinen Handlungskraft - Unbewusste Energie durch bewusste Aktion',
        consciousness: 'Sprache als Handlungsimpuls - Bewusste Aktivierung durch kraftvolle Kommunikation',
        description: 'Tor 34 im bewussten Merkur: In deiner Sprache liegt eine unmittelbare Energie. Deine Worte sind nicht nur Ideen – sie sind wie ein Startschuss. Du redest nicht endlos um etwas herum, sondern bringst Dinge in Bewegung. Menschen spüren, dass hinter deinen Aussagen echte Kraft steckt – nicht nur Absicht, sondern Bereitschaft zu handeln. Für dich fühlt sich Kommunikation erst dann vollständig an, wenn sie in eine Handlung übergeht.',
        deep_meaning: 'Der Tanz zwischen Impulsivität und Fokus: Zu viel Energie: Du überrollst andere mit Dringlichkeit. Zu wenig Steuerung: Deine Worte sind kraftvoll, aber zerstreut. Deine Kunst liegt darin, Kraft so zu kanalisieren, dass sie wirksam wird, ohne zu überfordern.',
        shadow_aspects: JSON.stringify([
          'Du bist laut, aber nicht wirksam',
          'Du drängst, statt einzuladen',
          'Du nutzt Worte wie Druckmittel',
          'Du überrollst andere mit Dringlichkeit'
        ]),
        gifts: JSON.stringify([
          'Sprache als Handlungsimpuls',
          'Positionierung durch kraftvolle Kommunikation',
          'Marketing mit Aktivierung',
          'Kommunikation als Energieübertragung'
        ]),
        affirmation: 'Ich spreche mit Kraft. Ich bringe durch meine Worte Projekte in Bewegung.',
        center_name: "ROOT"
      });
    } else if (planetKey === 'merkur' && i === 35) {
      // Spezielle Mercury-Daten für Tor 35
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Erfahrung',
        essence: 'Die Stimme der Erfahrung - Unbewusste Vielfalt durch bewusste Erlebnisse',
        consciousness: 'Sprache als Storytelling-Kraft - Bewusste Inspiration durch erfahrungsbasierte Kommunikation',
        description: 'Tor 35 im bewussten Merkur: Deine Worte sind bunt und vielfältig. Du sprichst nicht nur aus Theorie, sondern aus gelebter Erfahrung. Du ziehst Sprache aus einem reichen Fundus an Erlebnissen. Deine Worte zeigen, dass du ausprobiert, erlebt, erfahren hast. Mit Tor 35 bist du Geschichtenerzähler. Deine Worte nehmen andere mit auf Reisen – ob in Erlebnisse, Projekte oder Visionen.',
        deep_meaning: 'Der Tanz zwischen Abwechslung und Fokus: Du springst zu sehr zwischen Themen. Du bleibst zu eng und verlierst Lebendigkeit. Deine Kunst liegt darin, Erfahrungen in Worte zu fassen, die sowohl Vielfalt als auch Klarheit zeigen.',
        shadow_aspects: JSON.stringify([
          'Du redest, um nicht fühlen zu müssen',
          'Du sammelst Geschichten, statt sie zu verdauen',
          'Du flüchtest in Erlebnisse, statt Tiefe zu finden',
          'Du springst zu sehr zwischen Themen'
        ]),
        gifts: JSON.stringify([
          'Sprache als Storytelling-Kraft',
          'Positionierung durch gelebte Erfahrung',
          'Marketing mit Vielfalt',
          'Kommunikation als Erzählen'
        ]),
        affirmation: 'Ich spreche aus Erfahrung. Meine Worte erzählen die Reise meines Angebots.',
        center_name: "THROAT"
      });
    } else if (planetKey === 'merkur' && i === 36) {
      // Spezielle Mercury-Daten für Tor 36
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Herausforderung',
        essence: 'Die Stimme der Erfahrung aus der Herausforderung - Unbewusste Transformation durch bewusste Krise',
        consciousness: 'Sprache als Transformationsraum - Bewusste Krisenkommunikation durch herzvolle Begleitung',
        description: 'Tor 36 im bewussten Merkur: Deine Worte haben eine besondere Tiefe, weil sie aus intensiven Erfahrungen stammen. Du kennst den Umgang mit Unsicherheit, Wandel und plötzlichen Veränderungen – und kannst diese Erfahrung in Sprache übersetzen, die andere beruhigt und stärkt. Für dich ist Sprache ein Werkzeug, um Chaos zu ordnen und Unsicherheit greifbar zu machen. Du kannst Gefühle benennen, die andere nicht aussprechen, und so einen Raum schaffen, in dem Transformation beginnt.',
        deep_meaning: 'Der Tanz zwischen Dramatik und Stabilität: Zu viel Drama: Du verstärkst Unsicherheit. Zu viel Kontrolle: Du unterdrückst Intensität. Deine Kunst liegt darin, Emotionen zuzulassen, aber Worte zu wählen, die Halt geben.',
        shadow_aspects: JSON.stringify([
          'Du sprichst in Extremen',
          'Du suchst Aufmerksamkeit über Dramatik',
          'Du bleibst im Problem hängen',
          'Du verstärkst Unsicherheit durch Drama'
        ]),
        gifts: JSON.stringify([
          'Sprache als Transformationsraum',
          'Positionierung durch Krisenkommunikation mit Herz',
          'Marketing mit Stabilität in unsicheren Zeiten',
          'Kommunikation als Wandelbegleitung'
        ]),
        affirmation: 'Ich spreche über das, was herausfordert. Ich nutze meine Sprache, um Wandel zu begleiten.',
        center_name: "SOLAR_PLEXUS"
      });
    } else if (planetKey === 'merkur' && i === 37) {
      // Spezielle Mercury-Daten für Tor 37
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Gemeinschaft',
        essence: 'Die Stimme der Gemeinschaft - Unbewusste Bindung durch bewusste Verbindung',
        consciousness: 'Sprache als Bindung - Bewusste Gemeinschaft durch ehrliche Kommunikation',
        description: 'Tor 37 im bewussten Merkur: Deine Worte sind getragen von dem Wunsch nach Miteinander. Du sprichst, um Nähe und Verbindlichkeit zu schaffen. Sprache ist für dich ein Mittel, um Bande zu knüpfen und Vertrauen zu stärken. Mit Tor 37 kannst du Sprache nutzen, um Brücken zu bauen – zwischen Partnern, Familien, Gruppen. Deine Worte schaffen Vertrauen und Verlässlichkeit.',
        deep_meaning: 'Der Tanz zwischen Nähe und Abgrenzung: Du sprichst nur, um dazuzugehören. Du schweigst, um unabhängig zu bleiben. Deine Kunst liegt darin, ehrlich und verbindend zu sprechen.',
        shadow_aspects: JSON.stringify([
          'Du forderst Loyalität, ohne sie zu geben',
          'Du passt dich übermäßig an',
          'Du vermeidest ehrliche Konfrontation',
          'Du sprichst nur, um dazuzugehören'
        ]),
        gifts: JSON.stringify([
          'Sprache als Bindung',
          'Positionierung durch Gemeinschaftssinn',
          'Marketing mit Kundenbindung',
          'Kommunikation als Brückenbau'
        ]),
        affirmation: 'Ich spreche, um Gemeinschaft zu stärken. Meine Worte stärken mein Team.',
        center_name: "HEART"
      });
    } else if (planetKey === 'merkur' && i === 38) {
      // Spezielle Mercury-Daten für Tor 38
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Standpunkt',
        essence: 'Die Stimme des Standpunkts - Unbewusste Haltung durch bewusste Klarheit',
        consciousness: 'Sprache als Positionslicht - Bewusste Werteverteidigung durch strategische Kommunikation',
        description: 'Tor 38 im bewussten Merkur: In deiner Sprache liegt eine kämpferische, entschlossene Frequenz – nicht im Sinne von Streitlust, sondern im Sinne von Haltung. Du bist nicht hier, um alles zu akzeptieren. Du bist hier, um klar zu benennen, wo es sich lohnt, Haltung zu zeigen. Für dich ist Kommunikation ein Mittel, Werte zu schützen. Du erhebst deine Stimme, wenn etwas gegen deine Überzeugungen verstößt – und genau dann spüren andere deine Klarheit.',
        deep_meaning: 'Der Tanz zwischen Kampfgeist und Starrheit: Zu viel Widerstand: Kämpfen um des Kämpfens willen. Zu wenig Standpunkt: Konflikte vermeiden und Klarheit verlieren. Deine Kunst liegt darin, gezielt zu wählen, wo deine Stimme den größten Unterschied macht.',
        shadow_aspects: JSON.stringify([
          'Widerspruch aus Prinzip',
          'Alte Standpunkte verteidigen',
          'Sprache für Konfrontation statt Lösung',
          'Kämpfen um des Kämpfens willen'
        ]),
        gifts: JSON.stringify([
          'Sprache als Positionslicht',
          'Positionierung durch klare Werteverteidigung',
          'Marketing mit Rückgrat',
          'Kommunikation als Werte-Schutzschild'
        ]),
        affirmation: 'Ich spreche, um für das Wesentliche einzustehen. Ich positioniere mich klar zu dem, wofür ich stehe.',
        center_name: "ROOT"
      });
    } else if (planetKey === 'merkur' && i === 39) {
      // Spezielle Mercury-Daten für Tor 39
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Provokation',
        essence: 'Die Stimme der Provokation - Unbewusste Bewegung durch bewusste Herausforderung',
        consciousness: 'Sprache als Innovationskraft - Bewusste Musterbrechung durch konstruktive Provokation',
        description: 'Tor 39 im bewussten Merkur: Deine Worte haben oft einen provozierenden Klang. Nicht, um zu verletzen – sondern um ins Nachdenken zu bringen. Du bist nicht hier, um es allen recht zu machen. Du bist hier, um Themen anzustoßen. Deine Sprache testet Grenzen. Du merkst schnell, wo Stillstand herrscht – und setzt dann Worte, die herausfordern. Mit Tor 39 kannst du Dinge ansprechen, die andere lieber vermeiden. Deine Worte sind wie Impulse, die Bewegung auslösen.',
        deep_meaning: 'Der Tanz zwischen Reiz und Inspiration: Worte, die blockieren. Worte, die befreien. Die Kunst ist es, deine Provokation konstruktiv einzusetzen.',
        shadow_aspects: JSON.stringify([
          'Du provozierst nur, um zu stören',
          'Du verletzt, statt zu inspirieren',
          'Du rebellierst ohne Ziel',
          'Zu viel Provokation wirkt destruktiv'
        ]),
        gifts: JSON.stringify([
          'Sprache als Innovationskraft',
          'Positionierung durch klare Reibungspunkte',
          'Marketing mit Musterbrechung',
          'Kommunikation als Wachrütteln'
        ]),
        affirmation: 'Ich spreche, um Anstoß zu geben. Meine Worte brechen Muster auf.',
        center_name: "ROOT"
      });
    } else if (planetKey === 'merkur' && i === 42) {
      // Spezielle Mercury-Daten für Tor 42
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Vollendung',
        essence: 'Die Stimme der Vollendung - Unbewusste Beständigkeit durch bewusste Abschlusskraft',
        consciousness: 'Sprache als Klammer - Bewusste Projektführung bis zur Reife durch klare Kommunikation',
        description: 'Tor 42 im bewussten Merkur: Deine Worte tragen die Energie von Beständigkeit und Abschluss. Du bist nicht hier, um Dinge nur anzustoßen – du bist hier, um sie zu begleiten, bis sie rund und reif sind. Sprache ist für dich ein Werkzeug, um Dinge abzuschließen. Du willst nicht, dass etwas ungesagt bleibt – genauso wenig wie du halbe Wege akzeptierst. Mit Tor 42 gibst du Erlebnissen einen Rahmen. Du sprichst, um etwas zu runden und einen klaren Abschluss zu schaffen.',
        deep_meaning: 'Der Tanz zwischen Ausdauer und Loslassen: Zu viel Festhalten: Du bleibst, obwohl es vorbei ist. Zu schnelles Loslassen: Du brichst ab, bevor etwas reifen konnte. Deine Kunst liegt darin, zu erkennen, wann noch ein Satz gebraucht wird – und wann Schweigen Vollendung ist.',
        shadow_aspects: JSON.stringify([
          'Du bleibst, obwohl es vorbei ist',
          'Du brichst ab, bevor etwas reifen konnte',
          'Du verwechselst Abschluss mit Kontrolle',
          'Du hältst fest, obwohl es rund ist'
        ]),
        gifts: JSON.stringify([
          'Sprache als Klammer',
          'Positionierung als Partner für Ganzheit',
          'Marketing mit Projektführung bis zur Reife',
          'Kommunikation als Vollendung'
        ]),
        affirmation: 'Ich spreche Geschichten zu Ende. Ich führe Projekte bis zur Reife.',
        center_name: "SACRAL"
      });
    } else if (planetKey === 'merkur' && i === 43) {
      // Spezielle Mercury-Daten für Tor 43
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Einsicht',
        essence: 'Die Stimme der Einsicht - Unbewusste Durchbrüche durch bewusste Klarheit',
        consciousness: 'Sprache als Offenbarung - Bewusste Innovation durch frische Einsichten und plötzliche Klarheit',
        description: 'Tor 43 im bewussten Merkur: Deine Worte tragen oft etwas Überraschendes. Du sprichst nicht linear – du sprichst, wenn plötzlich ein Geistesblitz kommt. Sprache ist für dich Ausdruck von Erkenntnis. Manchmal kommen deine Worte unerwartet, aber mit so viel Klarheit, dass sie alles verändern können. Mit Tor 43 bist du die Stimme, die Dinge ausspricht, die andere spüren, aber nicht greifen können. Deine Sprache kann wie ein Schlüssel wirken.',
        deep_meaning: 'Der Tanz zwischen Genialität und Unverständnis: Worte sind zu komplex, niemand versteht dich. Worte sind zu reduziert, die Tiefe geht verloren. Deine Kunst liegt darin, deine Einsichten so zu übersetzen, dass sie zugänglich sind.',
        shadow_aspects: JSON.stringify([
          'Du hältst deine Einsichten zurück',
          'Du fürchtest, komisch zu wirken',
          'Worte sind zu komplex, niemand versteht dich',
          'Du wirst nicht verstanden'
        ]),
        gifts: JSON.stringify([
          'Sprache als Offenbarung',
          'Positionierung durch frische Einsichten',
          'Marketing mit Innovation',
          'Kommunikation als Durchbruch'
        ]),
        affirmation: 'Ich spreche meine Einsichten. Meine Worte bringen Innovation.',
        center_name: "AJNA"
      });
    } else if (planetKey === 'merkur' && i === 40) {
      // Spezielle Mercury-Daten für Tor 40
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Verbindlichkeit',
        essence: 'Die Stimme der Verlässlichkeit - Unbewusste Bindung durch bewusste Klarheit',
        consciousness: 'Sprache als Bindungspunkt - Bewusste Vertrauensbildung durch klare Zusagen und Verbindlichkeit',
        description: 'Tor 40 im bewussten Merkur: In deiner Sprache liegt eine Qualität, die Vertrauen schafft. Deine Worte wirken wie ein Handschlag – ehrlich, klar und bindend. Für dich ist Kommunikation nicht nur Ausdruck, sondern auch ein Vertrag. Du willst, dass andere wissen, worauf sie sich verlassen können. Mit Tor 40 kannst du Beziehungen durch klare Worte stabilisieren.',
        deep_meaning: 'Der Tanz zwischen Geben und Abgrenzung: Zu viel Geben: Du verpflichtest dich über deine Grenzen hinaus. Zu viel Abgrenzung: Du wirkst kühl. Deine Kunst liegt darin, klar zu sagen, was du leisten kannst – und gleichzeitig offen für Verbindung zu bleiben.',
        shadow_aspects: JSON.stringify([
          'Du verpflichtest dich über deine Grenzen hinaus',
          'Du gibst Zusagen aus Pflichtgefühl',
          'Du wirkst kühl durch zu viel Abgrenzung',
          'Du versprichst zu schnell'
        ]),
        gifts: JSON.stringify([
          'Sprache als Bindungspunkt',
          'Positionierung als verlässlicher Partner',
          'Marketing mit klaren Zusagen',
          'Kommunikation als Vertrauensbildung'
        ]),
        affirmation: 'Ich spreche Verbindlichkeit aus. Ich schaffe Vertrauen durch klare Zusagen.',
        center_name: "HEART"
      });
    } else if (planetKey === 'merkur' && i === 41) {
      // Spezielle Mercury-Daten für Tor 41
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: 'Beginn',
        essence: 'Die Stimme des Beginns - Unbewusste Initiation durch bewusste Impulse',
        consciousness: 'Sprache als Anfangspunkt - Bewusste Projektinitiation durch inspirierende Kommunikation',
        description: 'Tor 41 im bewussten Merkur: Deine Worte sind wie ein Startschuss. Du gibst den ersten Impuls – nicht immer das ganze Ziel, aber den Anfang. Deine Sprache ist oft ein Anstoß für Veränderungen. Mit Tor 41 kannst du mit Worten Neugier wecken, Energie freisetzen und Richtung eröffnen.',
        deep_meaning: 'Der Tanz zwischen Vision und Umsetzung: Worte voller Träume, ohne Handlung. Worte, die blockieren, weil du den Anfang scheust. Deine Kunst ist es, Sprache als Einladung in etwas Neues zu nutzen.',
        shadow_aspects: JSON.stringify([
          'Du fängst an, ohne durchzuhalten',
          'Du hast Angst vor dem ersten Schritt',
          'Worte voller Träume, ohne Handlung',
          'Zu viele Impulse wirken flatterhaft'
        ]),
        gifts: JSON.stringify([
          'Sprache als Anfangspunkt',
          'Positionierung durch Mut zum Anfang',
          'Marketing mit Projektinitiation',
          'Kommunikation als Startimpuls'
        ]),
        affirmation: 'Ich spreche den Anfang aus. Ich starte durch meine Kommunikation neue Projekte.',
        center_name: "ROOT"
      });
    } else {
      // Generische Gates für alle anderen
      gates.push({
        id: `${planetKey}_gate_${i}`,
        planet_name: planetInfo.planet_name,
        gate_number: i,
        name: `Gate ${i}`,
        essence: `${planetInfo.planet_name} Gate ${i}`,
        consciousness: `${planetInfo.planet_name} Bewusstsein in Gate ${i}`,
        description: `${planetInfo.planet_name} hier zeigt, wie wir Gate ${i} entwickeln und nutzen.`,
        deep_meaning: `Die ${planetInfo.planet_name} Energie in Gate ${i} - wie du Gate ${i} mit ${planetInfo.planet_name} Kraft entwickelst.`,
        shadow_aspects: JSON.stringify([`Gate ${i} Blockaden`, "Perfektionismus", "Angst vor Kritik", `Gate ${i} Wunden`]),
        gifts: JSON.stringify([`${planetInfo.planet_name} Gate ${i}`, "Künstlerische Begabung", "Inspiration", "Innovative Lösungen"]),
        affirmation: `Ich entwickle Gate ${i} mit ${planetInfo.planet_name} Kraft. Mein Gate ${i} ist ${planetInfo.planet_name.toLowerCase()}.`,
        center_name: "G"
      });
    }
  }

  // Generiere 9 Centers für den Planeten
  const centers: PlanetCenter[] = [
    { center: "HEAD", gates: [64, 61, 63] },
    { center: "AJNA", gates: [47, 24, 11] },
    { center: "THROAT", gates: [62, 23, 56, 16, 20, 31, 33, 8] },
    { center: "G", gates: [1, 13, 25, 46, 2, 15, 10, 7] },
    { center: "HEART", gates: [21, 40, 26, 51] },
    { center: "SOLAR", gates: [36, 22, 37, 6, 49, 55, 30] },
    { center: "SACRAL", gates: [34, 5, 14, 29, 59, 9, 3] },
    { center: "SPLEEN", gates: [48, 57, 44, 50, 32, 28, 18] },
    { center: "ROOT", gates: [41, 39, 53, 38, 58, 54, 52, 19, 60] }
  ].map(center => ({
    id: `${planetKey}_center_${center.center}`,
    planet_name: planetInfo.planet_name,
    center_name: center.center,
    essence: `${planetInfo.planet_name} ${center.center}`,
    consciousness: `${planetInfo.planet_name} Bewusstsein im ${center.center} Center`,
    description: `${planetInfo.planet_name} hier zeigt, wie wir das ${center.center} Center entwickeln und nutzen.`,
    deep_meaning: `Die ${planetInfo.planet_name} Energie im ${center.center} Center - wie du das ${center.center} Center mit ${planetInfo.planet_name} Kraft entwickelst.`,
    shadow_aspects: JSON.stringify([`${center.center} Blockaden`, "Perfektionismus", "Angst vor Kritik", `${center.center} Wunden`]),
    gifts: JSON.stringify([`${planetInfo.planet_name} ${center.center}`, "Künstlerische Begabung", "Inspiration", "Innovative Lösungen"]),
    affirmation: `Ich entwickle das ${center.center} Center mit ${planetInfo.planet_name} Kraft. Mein ${center.center} Center ist ${planetInfo.planet_name.toLowerCase()}.`,
    gates: JSON.stringify(center.gates)
  }));

  return {
    info: planetInfo,
    gates,
    centers
  };
}

interface PlanetInfo {
  id: string;
  planet_name: string;
  symbol: string;
  orbital_period: string;
  discovery: string;
  mythology: string;
  color: string;
  description: string;
}

interface PlanetGate {
  id: string;
  planet_name: string;
  gate_number: number;
  name: string;
  essence: string;
  consciousness: string;
  description: string;
  deep_meaning: string;
  shadow_aspects: string;
  gifts: string;
  affirmation: string;
  personal_affirmation?: string;
  business_affirmation?: string;
  business_description?: string;
  center_name: string;
}

interface PlanetCenter {
  id: string;
  planet_name: string;
  center_name: string;
  essence: string;
  consciousness: string;
  description: string;
  deep_meaning: string;
  shadow_aspects: string;
  gifts: string;
  affirmation: string;
  gates: string;
}

export function usePlanetData(planetName: string) {
  const [planetInfo, setPlanetInfo] = useState<PlanetInfo | null>(null);
  const [planetGates, setPlanetGates] = useState<PlanetGate[]>([]);
  const [planetCenters, setPlanetCenters] = useState<PlanetCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlanetData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Versuche zuerst, Daten aus der Datenbank zu laden
        try {
          const [infoResponse, gatesResponse, centersResponse] = await Promise.all([
            fetch(`/api/planets/${planetName.toLowerCase()}/info`),
            fetch(`/api/planets/${planetName.toLowerCase()}/gates`),
            fetch(`/api/planets/${planetName.toLowerCase()}/centers`)
          ]);

          if (infoResponse.ok && gatesResponse.ok && centersResponse.ok) {
            const [infoData, gatesData, centersData] = await Promise.all([
              infoResponse.json(),
              gatesResponse.json(),
              centersResponse.json()
            ]);

            if (infoData.success && gatesData.success && centersData.success) {
              setPlanetInfo(infoData.data);
              setPlanetGates(gatesData.data);
              setPlanetCenters(centersData.data);
              setLoading(false);
              return;
            }
          }
        } catch (dbError) {
          console.warn('Datenbank-Daten konnten nicht geladen werden, verwende Fallback:', dbError);
        }

        // Fallback auf Fallback-Daten
        const fallbackData = getFallbackData(planetName);
        setPlanetInfo(fallbackData.info);
        setPlanetGates(fallbackData.gates);
        setPlanetCenters(fallbackData.centers);

        setLoading(false);
      } catch (error) {
        console.error(`Fehler beim Laden der ${planetName}-Daten:`, error);
        setError(error instanceof Error ? error.message : 'Unbekannter Fehler');
        setLoading(false);
        
        // Setze Fallback-Daten auch bei Fehlern
        try {
          const fallbackData = getFallbackData(planetName);
          setPlanetInfo(fallbackData.info);
          setPlanetGates(fallbackData.gates);
          setPlanetCenters(fallbackData.centers);
        } catch (fallbackError) {
          console.error('Auch Fallback-Daten konnten nicht geladen werden:', fallbackError);
        }
      }
    };

    loadPlanetData();
  }, [planetName]);

  return {
    planetInfo,
    planetGates,
    planetCenters,
    loading,
    error
  };
}
