"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  Container
} from '@mui/material';
import {
  Calendar,
  User,
  ArrowLeft,
  Tag,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import PublicHeader from '../../components/PublicHeader';
import Logo from '../../components/Logo';
import { blogArticles } from '../page';

// Content-Typen für bessere Formatierung
type ContentItem = 
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'spacer' };

// Vollständige Artikel-Inhalte (unterstützt sowohl string[] als auch ContentItem[])
const articleContent: Record<string, { content: ContentItem[] | string[] }> = {
  'human-design-energetischer-blueprint': {
    content: [
      'Human Design ist mehr als nur ein System zur Persönlichkeitsanalyse – es ist dein energetischer Blueprint, der dir zeigt, wer du wirklich bist und wie du authentisch leben kannst.',
      'Jeder Mensch wird mit einem einzigartigen Human Design Chart geboren, das auf deinem Geburtsdatum, deiner Geburtszeit und deinem Geburtsort basiert. Dieses Chart offenbart die tiefsten Muster deiner Persönlichkeit, deine natürlichen Talente und wie du am besten mit der Welt interagierst.',
      'Das System kombiniert Elemente aus der Astrologie, dem I Ging, der Kabbala, dem Chakra-System und der Quantenphysik. Es zeigt dir nicht nur, wer du bist, sondern auch, wie du deine Energie optimal nutzen kannst.',
      'Dein Human Design Chart besteht aus verschiedenen Komponenten: deinem Typ (Generator, Manifestor, Projector, Reflector), deiner Strategie, deiner Autorität, deinen definierten und undefinierten Zentren, sowie deinen Channels und Gates.',
      'Wenn du beginnst, nach deinem Design zu leben, wirst du feststellen, dass Entscheidungen leichter fallen, Beziehungen harmonischer werden und du dich endlich authentisch fühlst. Es ist wie ein Kompass, der dir zeigt, welcher Weg wirklich zu dir passt.',
      'Die Kraft des Human Design liegt darin, dass es dir erlaubt, dich selbst zu akzeptieren, wie du wirklich bist – ohne die Erwartungen anderer zu erfüllen. Du lernst, deine einzigartige Energie zu respektieren und zu nutzen.',
      'Beginne heute damit, dein Human Design Chart zu erstellen und entdecke die tiefen Wahrheiten über dich selbst, die dir helfen werden, ein erfüllteres und authentischeres Leben zu führen.'
    ]
  },
  'kraft-der-resonanzanalyse': {
    content: [
      { type: 'heading', level: 1, text: '🔑 Energetische Resonanz verstehen' },
      { type: 'paragraph', text: '**Warum dich manche Menschen sofort berühren – und andere nie wirklich erreichen**' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Es gibt diese Begegnungen, die passieren scheinbar ohne Vorwarnung.' },
      { type: 'paragraph', text: 'Ein Blick. Ein Satz. Ein Moment.' },
      { type: 'paragraph', text: 'Und plötzlich ist da dieses Gefühl von **Vertrautheit**, obwohl man sich gerade erst kennengelernt hat.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Und dann gibt es die anderen Begegnungen.' },
      { type: 'paragraph', text: 'Nett. Freundlich. Korrekt.' },
      { type: 'paragraph', text: 'Aber egal, wie sehr man sich bemüht – **es entsteht keine echte Nähe**.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Ich habe mich lange gefragt, warum das so ist.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Eine kleine Szene aus dem echten Leben' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Ich saß mit zwei Menschen an einem Tisch.' },
      { type: 'paragraph', text: 'Gleicher Raum. Gleiches Gespräch. Gleiche Worte.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Mit der einen Person floss alles.' },
      { type: 'paragraph', text: 'Das Gespräch wurde tiefer, ruhiger, echter.' },
      { type: 'paragraph', text: 'Ich musste nichts erklären, nichts beweisen, nichts darstellen.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Mit der anderen blieb es anstrengend.' },
      { type: 'paragraph', text: 'Gedanklich korrekt – emotional leer.' },
      { type: 'paragraph', text: 'Als würde etwas Entscheidendes nie wirklich andocken.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Früher hätte ich gedacht:' },
      { type: 'quote', text: '*„Vielleicht liegt es an mir."*' },
      { type: 'paragraph', text: 'Oder: *„Ich muss mich mehr öffnen."*' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Heute weiß ich:' },
      { type: 'paragraph', text: 'Es war **energetische Resonanz**.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Was energetische Resonanz wirklich bedeutet' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Energetische Resonanz ist eines der faszinierendsten Phänomene in zwischenmenschlichen Beziehungen.' },
      { type: 'paragraph', text: 'Sie erklärt, warum wir uns zu manchen Menschen sofort hingezogen fühlen, während andere uns einfach nicht „erreichen".' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Nicht, weil jemand falsch ist.' },
      { type: 'paragraph', text: 'Sondern weil **Energie nicht automatisch miteinander schwingt**.' },
      { type: 'spacer' },
      { type: 'quote', text: 'Verbindung entsteht nicht durch Wollen.' },
      { type: 'quote', text: 'Sie entsteht durch Resonanz.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Die Human Design Resonanzanalyse' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'In der **Human Design Resonanzanalyse** geht es darum, die energetischen Verbindungen zwischen Menschen zu verstehen.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Jeder Mensch bringt ein **einzigartiges energetisches Muster** mit.' },
      { type: 'paragraph', text: 'Diese Muster bestehen unter anderem aus definierten und undefinierten Energiezentren.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Wenn:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'deine **definierten Zentren**',
        'auf die **offenen oder undefinierten Zentren** eines anderen Menschen treffen'
      ]},
      { type: 'spacer' },
      { type: 'paragraph', text: 'kann eine starke Anziehung entstehen.' },
      { type: 'paragraph', text: 'Man fühlt sich gesehen, gebraucht, ergänzt – manchmal sogar magnetisch verbunden.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Diese Anziehung passiert **nicht bewusst**.' },
      { type: 'paragraph', text: 'Sie geschieht automatisch.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Warum sich manche Verbindungen sofort intensiv anfühlen' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Es gibt Resonanzen, die schlagen ein wie ein Blitz.' },
      { type: 'spacer' },
      { type: 'list', items: [
        'sofortige Nähe',
        'starke Emotionen',
        'ein Gefühl von „das ist besonders"'
      ]},
      { type: 'spacer' },
      { type: 'paragraph', text: 'Diese **magnetische Resonanz** kann wunderschön sein.' },
      { type: 'paragraph', text: 'Sie kann aber auch herausfordernd werden, wenn sie dauerhaft auf Spannung basiert.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Daneben gibt es tiefere Resonanzen, die sich **langsam entwickeln**:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'ruhiger',
        'stabiler',
        'weniger Drama',
        'mehr Vertrauen'
      ]},
      { type: 'spacer' },
      { type: 'paragraph', text: 'Beide Formen haben ihren Platz –' },
      { type: 'paragraph', text: 'aber sie dienen **unterschiedlichen Beziehungsarten**.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Resonanz wirkt überall – nicht nur in Beziehungen' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Die Resonanzanalyse hilft nicht nur im romantischen Kontext.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Sie zeigt dir auch:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'warum manche Freundschaften mühelos sind',
        'warum bestimmte berufliche Partnerschaften tragen',
        'warum andere Konstellationen dauerhaft Kraft kosten'
      ]},
      { type: 'spacer' },
      { type: 'paragraph', text: 'Du erkennst:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'wo natürliche Verbindung entsteht',
        'wo Energie fließt',
        'und wo sie dauerhaft abgezogen wird'
      ]},
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Ein Perspektivwechsel, der vieles heilt' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Als ich begonnen habe, Resonanz zu verstehen, fiel ein großer innerer Druck weg.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Ich musste:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'niemanden mehr überzeugen',
        'mich nicht mehr anpassen',
        'keine Nähe mehr erzwingen'
      ]},
      { type: 'spacer' },
      { type: 'paragraph', text: 'Ich habe verstanden:' },
      { type: 'spacer' },
      { type: 'quote', text: 'Nicht jede Beziehung funktioniert für jeden Menschen gleich.' },
      { type: 'quote', text: 'Und das ist kein Mangel – das ist Wahrheit.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Bewusst mit deiner Energie umgehen' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Wenn du erkennst, **wie Resonanz funktioniert**, verändert sich dein Blick auf Beziehungen grundlegend.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Du wirst:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'klarer in deinen Entscheidungen',
        'ehrlicher mit dir selbst',
        'achtsamer darin, mit wem du deine Energie teilst'
      ]},
      { type: 'spacer' },
      { type: 'paragraph', text: 'Du erkennst, welche Beziehungen dich nähren –' },
      { type: 'paragraph', text: 'und welche dich langfristig erschöpfen.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Fazit: Verbindung folgt Resonanz, nicht Absicht' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Echte Nähe lässt sich nicht herstellen.' },
      { type: 'paragraph', text: 'Sie entsteht, wenn energetische Muster sich berühren.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Die Human Design Resonanzanalyse zeigt dir:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'warum sich manche Menschen sofort vertraut anfühlen',
        'warum andere trotz Bemühung auf Distanz bleiben',
        'und warum beides vollkommen in Ordnung ist'
      ]},
      { type: 'spacer' },
      { type: 'paragraph', text: 'Wenn du beginnst, **deine eigene Resonanz zu verstehen**,' },
      { type: 'paragraph', text: 'verändern sich deine Beziehungen – nicht durch Strategie, sondern durch Klarheit.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Und genau dort beginnt echte Verbindung.' }
    ]
  },
  'penta-analyse-gruppenenergie': {
    content: [
      { type: 'heading', level: 1, text: 'Penta-Analyse – Die verborgene Kraft jeder kleinen Gruppe' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Die Penta-Analyse ist ein mächtiges Werkzeug im Human Design System – und eines der am wenigsten verstandenen. Dabei zeigt sie dir etwas, das kaum jemand bewusst wahrnimmt:' },
      { type: 'quote', text: 'Eine kleine Gruppe (3–5 Personen) erzeugt eine eigene Energie, ein eigenes Feld – eine eigene Identität.' },
      { type: 'paragraph', text: 'Diese energetische Struktur nennt man Penta.' },
      { type: 'paragraph', text: 'Und sie beeinflusst jede Zusammenarbeit, jede Stimmung und jedes Ergebnis stärker, als jeder einzelne Charakter es je könnte.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Was ist eine Penta wirklich?' },
      { type: 'paragraph', text: 'Eine Penta entsteht immer dann, wenn drei bis fünf Menschen zusammenkommen. Ihre definierten Zentren, Gates und Channels verbinden sich – und daraus entsteht eine kollektive Energieform:' },
      { type: 'list', items: [
        'mit eigener Dynamik',
        'eigener Intelligenz',
        'eigener Art zu entscheiden',
        'eigener Art zu funktionieren'
      ]},
      { type: 'paragraph', text: 'Eine Penta ist nicht die Summe der einzelnen Personen.' },
      { type: 'paragraph', text: 'Sie ist ein eigenständiges energetisches Wesen.' },
      { type: 'paragraph', text: 'Das erklärt, warum Gruppen funktionieren können, obwohl einzelne Mitglieder „schwierig" wirken – und warum harmonische Einzelpersonen in der Gruppe plötzlich anecken.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Alltagsgeschichte 1: Die WG-Küche – wenn plötzlich alles fließt oder explodiert' },
      { type: 'paragraph', text: 'Stell dir eine WG vor: drei Personen, alles nette Menschen.' },
      { type: 'paragraph', text: 'Alleine sind sie entspannt und unkompliziert.' },
      { type: 'paragraph', text: 'Doch sobald sie zusammen in der Küche stehen, passiert etwas Merkwürdiges:' },
      { type: 'spacer' },
      { type: 'heading', level: 3, text: 'Manchmal funktioniert alles intuitiv und mühelos:' },
      { type: 'list', items: [
        'Einer kocht,',
        'einer deckt den Tisch,',
        'einer kümmert sich um Getränke,',
        'alle reden miteinander wie ein eingespieltes Team.'
      ]},
      { type: 'spacer' },
      { type: 'heading', level: 3, text: 'Und an anderen Tagen reicht ein schiefes Wort – und:' },
      { type: 'list', items: [
        'die Stimmung kippt,',
        'Kleinigkeiten eskalieren,',
        'jeder fühlt sich angegriffen,',
        'keiner versteht, warum.'
      ]},
      { type: 'paragraph', text: 'Die WG denkt:' },
      { type: 'quote', text: '„Wir haben ein Problem miteinander."' },
      { type: 'paragraph', text: 'Aber in Wahrheit hat die Penta ein Problem.' },
      { type: 'paragraph', text: 'Wenn die definierte Gruppenenergie harmonisch zusammenspielt, entsteht Flow. Ist eines der Mitglieder emotional überreizt oder mental überlastet, bricht die Penta zusammen – unabhängig von der Persönlichkeit.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Die drei Rollen jeder Penta – und wie sie wirken' },
      { type: 'paragraph', text: 'In jeder Penta entstehen automatisch drei archetypische Rollen. Niemand muss sie bewusst einnehmen – sie bilden sich durch die Energie der Charts.' },
      { type: 'spacer' },
      { type: 'heading', level: 3, text: '1. Der Initiator' },
      { type: 'paragraph', text: 'Der Mensch, der Impulse setzt und die Gruppe zusammenführt.' },
      { type: 'paragraph', text: 'Das ist der typische Satz:' },
      { type: 'quote', text: '„Kommt, wir machen das zusammen."' },
      { type: 'paragraph', text: 'In Teams wie Heiko, Janine, Stefanie, Anton und Elisabeth ist das der Mensch, der den Raum öffnet, Dinge anstößt und andere energetisch mitnimmt.' },
      { type: 'spacer' },
      { type: 'heading', level: 3, text: '2. Der Stabilisator' },
      { type: 'paragraph', text: 'Er hält die Gruppe zusammen, sorgt für Ruhe, Struktur und das „Wir-Gefühl".' },
      { type: 'paragraph', text: 'Das ist derjenige, der sagt:' },
      { type: 'quote', text: '„Warte, lass uns das kurz sortieren. Wer übernimmt was?"' },
      { type: 'paragraph', text: 'Er ist der energetische Klebstoff der Penta – ohne ihn entsteht Chaos.' },
      { type: 'spacer' },
      { type: 'heading', level: 3, text: '3. Der Transformer' },
      { type: 'paragraph', text: 'Er bringt Veränderung, neue Ideen, neue Perspektiven.' },
      { type: 'paragraph', text: 'Das ist die Person, die fragt:' },
      { type: 'quote', text: '„Warum machen wir das eigentlich so? Ich hab eine bessere Idee."' },
      { type: 'paragraph', text: 'Er kann unbequem sein – aber ohne diesen Energetiker würde die Gruppe stagnieren.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Alltagsgeschichte 2: Das Büro-Team, das plötzlich funktioniert' },
      { type: 'paragraph', text: 'Ein Team mit vier Personen arbeitet seit Monaten nebeneinander her.' },
      { type: 'list', items: [
        'Meetings ziehen sich.',
        'Entscheidungen dauern ewig.',
        'Projekte bleiben liegen.',
        'Keiner fühlt sich verantwortlich.'
      ]},
      { type: 'paragraph', text: 'Dann kommt Elisabeth ins Team.' },
      { type: 'paragraph', text: 'Sie macht nichts Spektakuläres. Keine Vision, keine großen Worte.' },
      { type: 'paragraph', text: 'Doch plötzlich:' },
      { type: 'list', items: [
        'Aufgaben werden erledigt',
        'Verantwortlichkeiten sind klar',
        'Projekte fließen',
        'die Stimmung hebt sich'
      ]},
      { type: 'paragraph', text: 'Was ist passiert?' },
      { type: 'paragraph', text: 'Elisabeth hat die fehlende Energie in die Penta gebracht. Vielleicht ein wichtiges Zentrum, vielleicht ein Channel, der Struktur bringt. Die Penta ist vollständig – und das Team funktioniert.' },
      { type: 'paragraph', text: 'Nicht, weil die Personen „besser" geworden sind. Sondern weil die Gruppenenergie jetzt harmonisch ist.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Warum eine Penta konstruktiv oder destruktiv wirken kann' },
      { type: 'paragraph', text: 'Eine Penta kann:' },
      { type: 'spacer' },
      { type: 'heading', level: 3, text: 'Konstruktive Energie erzeugen' },
      { type: 'list', items: [
        'Fokus',
        'Struktur',
        'Harmonie',
        'produktive Zusammenarbeit',
        'klare Kommunikation',
        'Verantwortlichkeit'
      ]},
      { type: 'spacer' },
      { type: 'heading', level: 3, text: 'ODER' },
      { type: 'spacer' },
      { type: 'heading', level: 3, text: 'Destruktive Energie erzeugen' },
      { type: 'list', items: [
        'Druck',
        'Chaos',
        'Konflikte',
        'Frust',
        'emotionale Schwankungen',
        'Machtkämpfe',
        'Orientierungslosigkeit'
      ]},
      { type: 'paragraph', text: 'Und das völlig unabhängig von den Charaktereigenschaften der Beteiligten.' },
      { type: 'paragraph', text: 'Die Frage ist nicht:' },
      { type: 'quote', text: '„Wer ist das Problem?"' },
      { type: 'paragraph', text: 'Sondern:' },
      { type: 'quote', text: '„Welche Energie wirkt im Feld der Penta – und welche fehlt?"' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Alltagsgeschichte 3: Die Familie am Frühstückstisch' },
      { type: 'paragraph', text: 'Eine Familie sitzt morgens am Tisch – perfekte Penta.' },
      { type: 'paragraph', text: 'Doch manche Tage sehen so aus:' },
      { type: 'list', items: [
        'ein Kind völlig aufgedreht,',
        'ein Elternteil überfordert,',
        'der andere zieht sich zurück,',
        'das zweite Kind fühlt sich übersehen.'
      ]},
      { type: 'paragraph', text: 'Die Familie denkt:' },
      { type: 'quote', text: '„Heute ist alles schwierig."' },
      { type: 'paragraph', text: 'In Wahrheit ist die Penta aus der Balance gefallen.' },
      { type: 'paragraph', text: 'Vielleicht ist das emotionale Zentrum definiert und launisch. Vielleicht fehlt ein stabiler Wurzelimpuls. Vielleicht verstärkt die Gruppe ein einzelnes Thema.' },
      { type: 'paragraph', text: 'Die Penta zeigt, woher die Wellen kommen – und wie man sie beeinflusst.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Warum die Penta-Analyse so wertvoll ist' },
      { type: 'paragraph', text: 'Die Penta-Analyse zeigt dir:' },
      { type: 'list', items: [
        'Welche Stärken die Gruppe hat',
        'Wie die Gruppe denkt und arbeitet',
        'Welche Rollen natürlich entstehen',
        'Wo Reibungspunkte auftauchen',
        'Welche Energie fehlt',
        'Welche Energie überdominant ist',
        'Wo Missverständnisse nur energetische Effekte sind'
      ]},
      { type: 'paragraph', text: 'Sie macht sichtbar, was man sonst nur spürt – aber nicht versteht.' },
      { type: 'paragraph', text: 'Viele Konflikte lösen sich sofort auf, wenn klar ist:' },
      { type: 'quote', text: '👉 Das Problem liegt nicht bei einzelnen Personen. 👉 Das Problem liegt in der energetischen Architektur der Penta.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Bewusster Umgang mit der Gruppenenergie' },
      { type: 'paragraph', text: 'Wenn du verstehst, wie deine Penta funktioniert:' },
      { type: 'list', items: [
        'erkennst du, wann der ideale Moment für Entscheidungen ist',
        'weißt du, wann jemand sich zurückziehen sollte',
        'kannst du Rollen im Team bewusst stärken',
        'erkennst du, welche Aufgaben die Gruppe gut kann – und welche nicht',
        'arbeitest du mit der Gruppenenergie, statt gegen sie'
      ]},
      { type: 'paragraph', text: 'Das bringt Klarheit, Harmonie und deutlich bessere Ergebnisse.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Nutze die Penta-Analyse für deine Gruppe' },
      { type: 'paragraph', text: 'Die Penta ist besonders wertvoll für:' },
      { type: 'list', items: [
        'Teams',
        'Arbeitsgruppen',
        'Familien',
        'Freundesgruppen',
        'kleine Unternehmen',
        'Projektteams'
      ]},
      { type: 'paragraph', text: 'Sie hilft dir:' },
      { type: 'list', items: [
        'bessere Teamarbeit zu fördern',
        'die kollektive Energie optimal auszurichten',
        'destruktive Muster zu vermeiden',
        'Rollen klar zu leben',
        'Herausforderungen früh zu erkennen',
        'Harmonie und Fokus zu stärken'
      ]},
      { type: 'spacer' },
      { type: 'quote', text: 'Eine funktionierende Penta erschafft mehr, als jeder Einzelne es je könnte.' },
      { type: 'quote', text: 'Eine dysfunktionale Penta zerstört mehr, als jeder Einzelne es will.' },
      { type: 'paragraph', text: 'Der Unterschied?' },
      { type: 'quote', text: 'Bewusstsein.' }
    ]
  },
  'dating-mit-human-design': {
    content: [
      'Dating mit Human Design ist eine völlig neue Art, Beziehungen zu verstehen und zu gestalten. Es geht nicht darum, den perfekten Partner zu finden, sondern den Partner zu finden, der wirklich zu dir passt.',
      'Jeder Human Design Typ hat eine andere Strategie für Dating und Beziehungen. Generatoren müssen auf ihre innere Autorität hören, Manifestoren müssen informieren, Projectoren müssen eingeladen werden, und Reflectoren müssen einen Mondzyklus abwarten.',
      'Die Resonanzanalyse zeigt dir, wie deine Energie mit der deines Partners interagiert. Sie offenbart, wo die natürlichen Verbindungen sind und wo Herausforderungen liegen könnten.',
      'Ein wichtiger Aspekt beim Dating mit Human Design ist das Verständnis der verschiedenen Beziehungstypen: Komplementäre Beziehungen, bei denen sich die Energien ergänzen, und ähnliche Beziehungen, bei denen die Energien parallel verlaufen.',
      'Die definierten und undefinierten Zentren spielen eine große Rolle in Beziehungen. Wenn du verstehst, wie deine Zentren mit denen deines Partners interagieren, kannst du Konflikte besser verstehen und lösen.',
      'Dating mit Human Design bedeutet auch, deine eigene Energie zu respektieren. Du lernst, wann du Zeit für dich brauchst, wann du bereit für eine Beziehung bist und wie du deine Grenzen kommunizierst.',
      'Die Kraft des Human Design Dating liegt darin, dass es dir hilft, realistische Erwartungen zu haben. Nicht jede Beziehung ist für immer gedacht, und das ist in Ordnung. Manche Beziehungen sind dazu da, dass du etwas lernst.',
      'Nutze Human Design, um authentischere, erfüllendere Beziehungen zu finden, die wirklich zu dir passen und dir helfen, zu wachsen.'
    ]
  },
  '9-zentren-human-design': {
    content: [
      'Die 9 Zentren im Human Design System sind die Grundlage für das Verständnis deiner Energie. Jedes Zentrum hat eine spezifische Funktion und zeigt dir, wie Energie durch deinen Körper fließt.',
      'Die Zentren können entweder definiert (farbig) oder undefiniert (weiß) sein. Definierte Zentren sind konsistent in ihrer Energie, während undefinierten Zentren flexibel sind und Energie von anderen aufnehmen können.',
      'Das Kopfzentrum (Inspiration) ist das Zentrum der Inspiration und der Fragen. Wenn es definiert ist, bist du ein natürlicher Fragesteller. Wenn es undefiniert ist, nimmst du die Fragen anderer auf.',
      'Das Ajna-Zentrum (Konzeptualisierung) ist das Zentrum der Konzeptualisierung und des Denkens. Es hilft dir, Informationen zu verarbeiten und Konzepte zu verstehen.',
      'Das Halszentrum (Manifestation) ist das Zentrum der Manifestation und Kommunikation. Es zeigt dir, wie du dich ausdrückst und wie du deine Ideen in die Welt bringst.',
      'Das G-Zentrum (Liebe und Richtung) ist das Zentrum der Liebe und der Richtung. Es zeigt dir, wer du bist und wohin du im Leben gehst.',
      'Das Herzzentrum (Willenskraft) ist das Zentrum der Willenskraft und des Egos. Es zeigt dir, wie du deine Willenskraft einsetzt und wie du mit Herausforderungen umgehst.',
      'Das Solarplexus-Zentrum (Emotionen) ist das Zentrum der Emotionen und des Bewusstseins. Es zeigt dir, wie du Emotionen erlebst und verarbeitest.',
      'Das Sakralzentrum (Lebenskraft) ist das Zentrum der Lebenskraft und der Sexualität. Es ist das mächtigste Zentrum und zeigt dir, wo deine natürliche Energie liegt.',
      'Das Wurzelzentrum (Druck) ist das Zentrum des Drucks und der Adrenalin-Energie. Es zeigt dir, wie du mit Druck und Stress umgehst.',
      'Das Milz-Zentrum (Intuition) ist das Zentrum der Intuition und des Überlebens. Es zeigt dir, wie du auf deine innere Stimme hörst und wie du dich schützt.',
      'Wenn du verstehst, welche Zentren bei dir definiert sind und welche undefiniert, kannst du besser verstehen, wie deine Energie funktioniert und wie du sie optimal nutzen kannst.'
    ]
  },
  'mondkalender-energie': {
    content: [
      'Der Mondkalender ist ein mächtiges Werkzeug im Human Design System, das dir zeigt, wie die Mondphasen deine Energiezyklen beeinflussen. Der Mond durchläuft alle 28 Tage alle 64 Gates des Human Design Systems.',
      'Jeder Tag hat eine andere Mondenergie, die durch das Gate bestimmt wird, in dem der Mond sich gerade befindet. Diese Energie beeinflusst, wie du dich fühlst, wie du denkst und wie du handelst.',
      'Der Mondkalender zeigt dir, welche Themen an jedem Tag im Vordergrund stehen. Wenn du verstehst, welche Mondenergie gerade aktiv ist, kannst du besser verstehen, warum du dich an manchen Tagen anders fühlst.',
      'Es gibt verschiedene Mondphasen, die unterschiedliche Energien mit sich bringen: Neumond, zunehmender Mond, Vollmond und abnehmender Mond. Jede Phase hat ihre eigene Qualität und ihren eigenen Zweck.',
      'Der Neumond ist eine Zeit für Neuanfänge und neue Projekte. Der zunehmende Mond ist eine Zeit für Wachstum und Expansion. Der Vollmond ist eine Zeit für Fülle und Manifestation. Der abnehmende Mond ist eine Zeit für Loslassen und Reflexion.',
      'Der Mondkalender hilft dir auch, die beste Zeit für bestimmte Aktivitäten zu finden. Manche Tage sind besser für Kommunikation, andere für Kreativität, wieder andere für Ruhe und Reflexion.',
      'Wenn du den Mondkalender regelmäßig nutzt, wirst du feststellen, dass du dich mit den natürlichen Rhythmen des Lebens verbindest. Du fühlst dich weniger gestresst und mehr im Einklang mit dir selbst.',
      'Die Kraft des Mondkalenders liegt darin, dass er dir zeigt, dass alles seine Zeit hat. Du musst nicht jeden Tag produktiv sein – manche Tage sind dafür da, dass du dich ausruhst und reflektierst.',
      'Nutze den Mondkalender, um deine Energiezyklen zu verstehen, die beste Zeit für wichtige Entscheidungen zu finden und dich mit den natürlichen Rhythmen des Lebens zu verbinden.'
    ]
  },
  'der-moment-in-dem-du-spuerst-das-wird-nix': {
    content: [
      { type: 'paragraph', text: 'Ich hatte mal ein Date.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Erstes Treffen.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Er wirkt nett.' },
      { type: 'paragraph', text: 'Kann sich artikulieren.' },
      { type: 'paragraph', text: 'Höflich.' },
      { type: 'paragraph', text: 'Saubere Schuhe.' },
      { type: 'paragraph', text: 'Kein Red Flag am Horizont.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Und du denkst innerlich:' },
      { type: 'spacer' },
      { type: 'quote', text: '„Komm… gib ihm wenigstens eine Chance."' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Und bevor ich überhaupt losfahre,' },
      { type: 'paragraph', text: 'startet natürlich das übliche Frauen-Protokoll:' },
      { type: 'spacer' },
      { type: 'quote', text: '„Wir treffen uns um 19:00.' },
      { type: 'quote', text: 'Ruf mich nach 40 Minuten an!"' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Wenn ich rangehe:' },
      { type: 'spacer' },
      { type: 'paragraph', text: '**Notfall. Sofort. Hol mich hier raus.**' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Wenn ich nicht rangehe:' },
      { type: 'spacer' },
      { type: 'paragraph', text: '**Läuft. Weiter machen.**' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Das ist kein Gossip.' },
      { type: 'paragraph', text: 'Das ist Überlebensstrategie.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Also sitze ich da,' },
      { type: 'paragraph', text: 'leicht angespannt,' },
      { type: 'paragraph', text: 'bereit für alles von Smalltalk bis Fluchtplan,' },
      { type: 'paragraph', text: 'als er plötzlich in seine Jackentasche greift.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Langsam.' },
      { type: 'paragraph', text: 'Bedeutungsschwer.' },
      { type: 'paragraph', text: 'Wie jemand,' },
      { type: 'paragraph', text: 'der gleich etwas präsentiert,' },
      { type: 'paragraph', text: 'das man nicht mehr „einfach ignorieren" kann.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Ich denke noch:' },
      { type: 'spacer' },
      { type: 'quote', text: 'Bitte lass es kein Ring sein. Bitte kein Ring.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Man weiß ja nie.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Und dann zieht er es raus:' },
      { type: 'spacer' },
      { type: 'paragraph', text: '**Ein Herz.**' },
      { type: 'paragraph', text: '**Aus Schiefer.**' },
      { type: 'paragraph', text: '**Mit einer Oberfläche wie eine Mondlandschaft.**' },
      { type: 'paragraph', text: '**Schief ausgesägt.**' },
      { type: 'paragraph', text: '**Liebevoll hässlich.**' },
      { type: 'spacer' },
      { type: 'quote', text: '„Das habe ich für dich gemacht."' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Für. Mich. Gemacht.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Wir kennen uns seit fünf Tagen.' },
      { type: 'paragraph', text: 'Wir sehen uns heute zum ersten Mal.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Und ich spüre, wie sofort' },
      { type: 'paragraph', text: '**ALLE meine Alarmanlagen losgehen:**' },
      { type: 'spacer' },
      { type: 'quote', text: '„Junge… DEIN ERNST!?!"' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Mein Gesicht lächelt.' },
      { type: 'paragraph', text: 'Mein Inneres nimmt Reißaus.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Ich nehme dieses steinige… Symbol' },
      { type: 'paragraph', text: 'und hoffe,' },
      { type: 'paragraph', text: 'dass mein Notfall-Anruf bald kommt.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Oder besser:' },
      { type: 'paragraph', text: 'dass der Tisch mich einfach verschluckt.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Und genau in diesem Moment weiß ich es:' },
      { type: 'paragraph', text: 'Mit der Klarheit eines Orakels.' },
      { type: 'spacer' },
      { type: 'quote', text: '**Das wird nix.**' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Nicht aus Bosheit.' },
      { type: 'paragraph', text: 'Nicht aus Arroganz.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Sondern weil mein Nervensystem so laut „Nein" brüllt,' },
      { type: 'paragraph', text: 'dass selbst meine Großmutter es hören würde.' },
      { type: 'spacer' },
      { type: 'paragraph', text: '⸻' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Das ist die Wahrheit über Dating,' },
      { type: 'paragraph', text: 'die niemand gerne zugibt:' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Es sind nicht die großen Katastrophen.' },
      { type: 'paragraph', text: 'Nicht die toxischen Red Flags.' },
      { type: 'paragraph', text: 'Nicht einmal die Ex,' },
      { type: 'paragraph', text: 'die noch im Hintergrund durchs Bild läuft.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Es sind diese Mikro-Momente.' },
      { type: 'paragraph', text: 'Diese kleinen, unscheinbaren „Oh Gott… Hilfe"-Reaktionen,' },
      { type: 'paragraph', text: 'die dir zeigen,' },
      { type: 'paragraph', text: 'dass die Energie einfach nicht passt.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Und genau da setzt' },
      { type: 'paragraph', text: '**The Connection Key** an:' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Nicht um dir Dates schönzureden.' },
      { type: 'paragraph', text: 'Und nicht, um dir deinen Schiefer-Herz-Moment zu ersparen.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Sondern um dir zu zeigen,' },
      { type: 'paragraph', text: 'warum dein System so reagiert —' },
      { type: 'paragraph', text: 'und welche Verbindungen sich wirklich richtig anfühlen.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Damit du nicht ständig Fluchtpläne brauchst.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Sondern endlich jemanden triffst,' },
      { type: 'paragraph', text: 'bei dem du dein Handy vergisst,' },
      { type: 'paragraph', text: 'weil du gar keinen Notfall mehr brauchst.' },
      { type: 'spacer' },
      { type: 'quote', text: '(Wahre Geschichte aus meinem Leben)' }
    ]
  },
  'warum-drama-suechtig-macht': {
    content: [
      { type: 'heading', level: 1, text: '🔥 Warum Drama süchtig macht' },
      { type: 'paragraph', text: '(biologisch & emotional – und warum es so oft mit Liebe verwechselt wird)' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Drama fühlt sich lebendig an.' },
      { type: 'paragraph', text: 'Intensiv.' },
      { type: 'paragraph', text: 'Bedeutungsvoll.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Und genau deshalb verwechseln es so viele mit Liebe.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Drama ist kein Zufall – es ist Biologie.' },
      { type: 'paragraph', text: 'Wenn es in Beziehungen ständig knallt, passiert im Körper Folgendes:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'Adrenalin → Spannung, Jagd, Wachsamkeit',
        'Cortisol → emotionaler Stress, innere Alarmbereitschaft',
        'Dopamin → Belohnung nach Schmerz',
        'Oxytocin → Bindung, obwohl es weh tut'
      ]},
      { type: 'spacer' },
      { type: 'paragraph', text: 'Das Nervensystem lernt:' },
      { type: 'quote', text: '„Nach Chaos kommt Nähe. Nach Schmerz kommt Verbindung."' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Und genau das macht Drama süchtig.' },
      { type: 'paragraph', text: 'Nicht psychologisch.' },
      { type: 'paragraph', text: 'Biologisch.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Drama erzeugt Hochs und Tiefs, Hoffnung nach Enttäuschung und Nähe nach Distanz.' },
      { type: 'paragraph', text: 'Diese Achterbahn brennt sich ins System ein.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Das Gehirn denkt:' },
      { type: 'quote', text: '„So fühlt sich Beziehung an."' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Aber in Wahrheit ist es kein Liebesmodus,' },
      { type: 'paragraph', text: 'sondern ein Überlebensmodus.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Liebe beruhigt.' },
      { type: 'paragraph', text: 'Drama aktiviert.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Emotional entsteht Drama dort, wo:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'Nähe unberechenbar ist',
        'Aufmerksamkeit verdient werden muss',
        'Bindung nicht sicher ist'
      ]},
      { type: 'spacer' },
      { type: 'paragraph', text: 'Das erzeugt innerlich:' },
      { type: 'paragraph', text: 'Warten. Hoffen. Grübeln. Anpassen.' },
      { type: 'spacer' },
      { type: 'quote', text: '👉 Du bist nicht verbunden – du bist beschäftigt.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Wenn dein System Drama gewohnt ist,' },
      { type: 'paragraph', text: 'fühlt sich Ruhe erstmal falsch an.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Sicherheit wirkt leer.' },
      { type: 'paragraph', text: 'Verlässlichkeit reizlos.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Nicht, weil etwas fehlt –' },
      { type: 'paragraph', text: 'sondern weil kein Alarm ausgelöst wird.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Drama bindet.' },
      { type: 'paragraph', text: 'Resonanz verbindet.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Drama hält fest.' },
      { type: 'paragraph', text: 'Resonanz lässt atmen.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Ruhe ist kein Mangel.' },
      { type: 'paragraph', text: 'Ruhe ist Sicherheit.' }
    ]
  },
  'echte-resonanz-vs-trauma-anziehung': {
    content: [
      { type: 'heading', level: 1, text: '🧬 Echte Resonanz vs. Trauma-Anziehung' },
      { type: 'paragraph', text: 'Wie du den Unterschied wirklich spürst – nicht denkst' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Viele sagen:' },
      { type: 'quote', text: '„Ich weiß einfach nicht, warum mich das so anzieht."' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Doch.' },
      { type: 'paragraph', text: 'Dein Körper weiß es sehr genau.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Was du erlebst, ist entweder Resonanz' },
      { type: 'paragraph', text: 'oder Trauma-Anziehung.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Trauma-Anziehung fühlt sich an wie:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'sofortige Intensität',
        'starke Chemie',
        'extremes „Wir"-Gefühl',
        'Angst, ihn oder sie zu verlieren',
        'Gedankenkarussell nach Kontakt'
      ]},
      { type: 'spacer' },
      { type: 'quote', text: '👉 Dein Nervensystem sagt nicht „Oh, Liebe", sondern: „Achtung – bekanntes Muster."' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Bekannt heißt nicht gut.' },
      { type: 'paragraph', text: 'Bekannt heißt nur: gelernt.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Echte Resonanz fühlt sich an wie:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'Ruhe',
        'Klarheit',
        'kein Drängen',
        'kein inneres Ziehen',
        'ein leises inneres „Ja"'
      ]},
      { type: 'spacer' },
      { type: 'paragraph', text: 'Nicht aufregend.' },
      { type: 'paragraph', text: 'Aber ehrlich.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Der entscheidende Unterschied liegt nach dem Kontakt.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Nach Trauma-Anziehung fühlst du dich:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'enger',
        'unruhig',
        'verstrickt',
        'wartend'
      ]},
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Nach Resonanz fühlst du dich:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'weiter',
        'ruhiger',
        'klarer',
        'bei dir'
      ]},
      { type: 'spacer' },
      { type: 'quote', text: '👉 Enge vs. Weite' },
      { type: 'paragraph', text: 'Das ist der Test.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Resonanz kickt nicht.' },
      { type: 'paragraph', text: 'Sie trägt.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Nicht jede starke Anziehung ist ein Zeichen.' },
      { type: 'paragraph', text: 'Manche sind nur alte Wunden,' },
      { type: 'paragraph', text: 'die sich wiedererkennen.' }
    ]
  },
  'wie-mann-und-frau-naehe-unterschiedlich-aufbauen': {
    content: [
      { type: 'heading', level: 1, text: '❤️ Wie Mann und Frau Nähe unterschiedlich aufbauen' },
      { type: 'paragraph', text: '– und warum ihr euch dabei so oft verpasst' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Viele Beziehungsprobleme entstehen nicht,' },
      { type: 'paragraph', text: 'weil keine Liebe da ist –' },
      { type: 'paragraph', text: 'sondern weil Nähe unterschiedlich hergestellt wird.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Beide wollen Verbindung.' },
      { type: 'paragraph', text: 'Beide fühlen sich missverstanden.' },
      { type: 'paragraph', text: 'Und beide denken irgendwann:' },
      { type: 'quote', text: '„Der andere gibt mir einfach nicht, was ich brauche."' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Dabei sprechen sie nur zwei verschiedene Sprachen von Nähe.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Wie Männer Nähe aufbauen' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Für viele Männer entsteht Nähe dann, wenn:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'sie innerlich ruhig bleiben dürfen',
        'kein emotionaler Druck entsteht',
        'sie sich kompetent und klar fühlen',
        'sie gemeinsam etwas tun oder auf etwas zugehen'
      ]},
      { type: 'spacer' },
      { type: 'paragraph', text: 'Nähe entsteht für ihn im gemeinsamen Erleben,' },
      { type: 'paragraph', text: 'nicht primär im Reden darüber.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Er fühlt sich verbunden,' },
      { type: 'paragraph', text: 'wenn er er selbst bleiben kann,' },
      { type: 'paragraph', text: 'ohne sich ständig erklären zu müssen.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Wie Frauen Nähe aufbauen' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Für viele Frauen entsteht Nähe dann, wenn:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'Gefühle geteilt werden',
        'Aufmerksamkeit spürbar ist',
        'sie sich gesehen und gehört fühlt',
        'emotionale Präsenz da ist'
      ]},
      { type: 'spacer' },
      { type: 'paragraph', text: 'Nähe entsteht für sie im Austausch,' },
      { type: 'paragraph', text: 'im Gespräch, im gemeinsamen Fühlen.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Der klassische Beziehungs-Kurzschluss' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Er zeigt Nähe, indem er da ist, aber wenig sagt.' },
      { type: 'paragraph', text: 'Sie braucht Nähe durch Worte und Spiegelung.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Er denkt:' },
      { type: 'quote', text: '„Ist doch alles gut – ich bin doch hier."' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Sie denkt:' },
      { type: 'quote', text: '„Wenn alles gut wäre, würde ich das spüren."' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Beide haben recht.' },
      { type: 'paragraph', text: 'Und beide fühlen sich trotzdem allein.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Das männliche Nervensystem reguliert sich oft durch Rückzug, Fokus und innere Ordnung.' },
      { type: 'paragraph', text: 'Das weibliche Nervensystem reguliert sich oft durch Kontakt, Austausch und emotionale Resonanz.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Was für den einen Entlastung ist,' },
      { type: 'paragraph', text: 'fühlt sich für den anderen wie Distanz an.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Wenn Nähe kippt, passiert fast immer dasselbe:' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Er zieht sich zurück – um ruhig zu bleiben.' },
      { type: 'paragraph', text: 'Sie sucht Nähe – um sich sicher zu fühlen.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Zwei Schutzmechanismen,' },
      { type: 'paragraph', text: 'die sich gegenseitig verstärken.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Resonanz entsteht nicht, wenn einer nachgibt,' },
      { type: 'paragraph', text: 'sondern wenn beide verstehen,' },
      { type: 'paragraph', text: 'wie das Nervensystem des anderen Nähe aufbaut.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Männer brauchen Raum,' },
      { type: 'paragraph', text: 'um Nähe halten zu können.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Frauen brauchen Nähe,' },
      { type: 'paragraph', text: 'um Raum geben zu können.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Wenn das verstanden wird,' },
      { type: 'paragraph', text: 'entspannt sich Beziehung.' }
    ]
  },
  'warum-rueckzug-oft-interesse-ist': {
    content: [
      { type: 'heading', level: 1, text: '🔄 Warum Rückzug oft Interesse ist' },
      { type: 'paragraph', text: '– und wann er ganz klar das Gegenteil bedeutet' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Rückzug ist eines der meistmissverstandenen Signale im Dating.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Für die einen ist er ein Warnsignal.' },
      { type: 'paragraph', text: 'Für die anderen ein Hoffnungsträger.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Die Wahrheit ist:' },
      { type: 'paragraph', text: 'Rückzug kann Interesse sein –' },
      { type: 'paragraph', text: 'oder emotionale Abwesenheit.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Der Unterschied liegt nicht im Rückzug selbst,' },
      { type: 'paragraph', text: 'sondern in dem, was danach passiert.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Nicht jeder Rückzug ist Ablehnung.' },
      { type: 'paragraph', text: 'Oft ist er Selbstregulation.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Vor allem dann, wenn:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'Gefühle stärker werden',
        'Nähe intensiver wird',
        'innere Themen aktiviert werden',
        'Verantwortung spürbar wird'
      ]},
      { type: 'spacer' },
      { type: 'paragraph', text: 'Das Nervensystem sagt:' },
      { type: 'quote', text: '„Kurz Abstand, um mich zu sortieren."' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Nicht, um zu fliehen –' },
      { type: 'paragraph', text: 'sondern um fähig zu bleiben.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Rückzug ist Interesse, wenn:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'er zeitlich begrenzt ist',
        'danach wieder echte Präsenz kommt',
        'Initiative zurückkehrt',
        'Nähe nicht vermieden wird',
        'Worte und Verhalten stimmig sind'
      ]},
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Rückzug ist kein echtes Interesse, wenn:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'Funkstille entsteht',
        'Ausreden sich häufen',
        'Verbindlichkeit fehlt',
        'Nähe dauerhaft vermieden wird'
      ]},
      { type: 'spacer' },
      { type: 'paragraph', text: 'Der größte Fehler im Umgang mit Rückzug ist,' },
      { type: 'paragraph', text: 'ihn zu verfolgen statt zu beobachten.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Rückzug mit Rückkehr ist Regulation.' },
      { type: 'paragraph', text: 'Rückzug ohne Rückkehr ist Vermeidung.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Beziehung entsteht dort,' },
      { type: 'paragraph', text: 'wo jemand wiederkommt –' },
      { type: 'paragraph', text: 'und bleibt.' }
    ]
  },
  'online-dating-zeigt-nicht-dein-muster': {
    content: [
      { type: 'heading', level: 1, text: 'Online-Dating zeigt nicht dein Muster – sondern dein Bewusstseinsniveau' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Online-Dating hat einen schlechten Ruf.' },
      { type: 'paragraph', text: 'Zu oberflächlich. Zu austauschbar. Zu unverbindlich. Zu toxisch.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Und ja – es fühlt sich oft genau so an.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Aber nicht, weil mit dir etwas nicht stimmt.' },
      { type: 'paragraph', text: 'Sondern weil Online-Dating etwas tut, was kaum jemand wirklich einordnen kann:' },
      { type: 'spacer' },
      { type: 'quote', text: '👉 Es verstärkt nicht deine Beziehungsprobleme – es entlarvt dein aktuelles Bewusstseinsniveau.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Online-Dating ist kein Datingraum – sondern ein Beschleuniger' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Dating-Apps sind kein neutraler Ort für Begegnung.' },
      { type: 'paragraph', text: 'Sie sind ein Hochgeschwindigkeitsfeld für unbewusste Dynamiken.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Was im echten Leben Wochen oder Monate braucht, passiert hier in Tagen:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'Projektion',
        'Idealisierung',
        'Erwartung',
        'Rückzug',
        'Entwertung'
      ]},
      { type: 'spacer' },
      { type: 'paragraph', text: 'Nicht, weil Menschen schlechter geworden sind –' },
      { type: 'paragraph', text: 'sondern weil Verfügbarkeit, Auswahl und fehlende Verbindlichkeit gleichzeitig auftreten.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Das überfordert viele innere Systeme.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Ghosting ist kein Charakterfehler – sondern ein Regulationsabbruch' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Ghosting wird oft moralisch bewertet:' },
      { type: 'quote', text: '„Feige."' },
      { type: 'quote', text: '„Unreif."' },
      { type: 'quote', text: '„Respektlos."' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Doch auf Bewusstseinsebene passiert etwas anderes:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'Kontakt entsteht',
        'Interesse wird real',
        'Nähe wird spürbar',
        'Verantwortung taucht auf',
        'Das Nervensystem kippt',
        'Kontakt bricht ab'
      ]},
      { type: 'spacer' },
      { type: 'quote', text: '👉 Ghosting ist kein aktives Ablehnen – sondern ein innerlicher Kollaps.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Nicht jeder Mensch kann Nähe halten, auch wenn er sie sucht.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Das bedeutet nicht, dass du „nicht genug warst".' },
      { type: 'paragraph', text: 'Es bedeutet, dass der andere nicht bleiben konnte.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Warum Online-Dating dein Selbstwertthema sofort triggert' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Offline wird vieles abgefedert:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'Körpersprache',
        'Tonfall',
        'Präsenz',
        'Resonanz'
      ]},
      { type: 'spacer' },
      { type: 'paragraph', text: 'Online fällt all das weg.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Was bleibt, ist:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'Text',
        'Zeitverzögerung',
        'Interpretation',
        'Fantasie'
      ]},
      { type: 'spacer' },
      { type: 'paragraph', text: 'Online-Dating konfrontiert dich gnadenlos mit einer Frage:' },
      { type: 'spacer' },
      { type: 'quote', text: '👉 Wie stabil bin ich innerlich, wenn ich keinen Spiegel bekomme?' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Wenn dein Selbstwert von Reaktion abhängt,' },
      { type: 'paragraph', text: 'wird jede nicht geschriebene Nachricht zur inneren Bedrohung.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Auswahl ist kein Luxus – sondern ein Belastungstest' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Viele glauben, das Problem beim Online-Dating sei:' },
      { type: 'quote', text: '„Zu viele Optionen."' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'In Wahrheit ist das Problem:' },
      { type: 'quote', text: '👉 Zu wenig innere Stabilität für Wahlfreiheit.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Denn Auswahl verlangt:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'Eigenverantwortung',
        'Klarheit',
        'Entscheidungskraft',
        'Abgrenzung'
      ]},
      { type: 'spacer' },
      { type: 'paragraph', text: 'Unreifes Bewusstsein reagiert darauf mit:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'Vergleich',
        'Überforderung',
        'Ausweichverhalten',
        'Kontaktabbruch'
      ]},
      { type: 'spacer' },
      { type: 'paragraph', text: 'Nicht, weil Menschen böse sind –' },
      { type: 'paragraph', text: 'sondern weil ihr inneres System dafür nicht gebaut ist.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Warum bewusste Menschen Apps oft als anstrengend erleben' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Nicht aus Arroganz.' },
      { type: 'paragraph', text: 'Nicht aus Überlegenheit.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Sondern weil sie schneller wahrnehmen:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'energetische Inkonsistenz',
        'Kontakt ohne Präsenz',
        'Nähe ohne Verantwortung',
        'Kommunikation ohne Tiefe'
      ]},
      { type: 'spacer' },
      { type: 'paragraph', text: 'Bewusste Menschen brauchen weniger Kontakt –' },
      { type: 'paragraph', text: 'aber echteren.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Online-Dating liefert viel Input,' },
      { type: 'paragraph', text: 'aber wenig echten Beziehungsraum.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Das erzeugt Erschöpfung statt Vorfreude.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Der entscheidende Unterschied: Reaktion oder Wahl' },
      { type: 'spacer' },
      { type: 'heading', level: 3, text: 'Unbewusstes Online-Dating' },
      { type: 'list', items: [
        'Reaktion auf Matches',
        'Bedürfnis nach Bestätigung',
        'Angst vor Ablehnung',
        'Anpassung'
      ]},
      { type: 'spacer' },
      { type: 'heading', level: 3, text: 'Bewusstes Online-Dating' },
      { type: 'list', items: [
        'bewusste Wahl',
        'innere Stabilität',
        'Akzeptanz von Nicht-Resonanz',
        'Selbstkontakt'
      ]},
      { type: 'spacer' },
      { type: 'quote', text: '👉 Online-Dating funktioniert erst dann gesund, wenn du nichts mehr brauchst.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Nicht zynisch.' },
      { type: 'paragraph', text: 'Nicht kalt.' },
      { type: 'paragraph', text: 'Sondern innerlich verankert.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Online-Dating zeigt dir nicht, wer du bist – sondern wo du stehst' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Apps sind kein Ort, um dich zu beweisen.' },
      { type: 'paragraph', text: 'Sie sind ein Spiegel.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Sie zeigen dir:' },
      { type: 'spacer' },
      { type: 'list', items: [
        'wie abhängig du von Resonanz bist',
        'wie gut du mit Nicht-Resonanz umgehen kannst',
        'wie sehr du dich selbst verlierst oder hältst'
      ]},
      { type: 'spacer' },
      { type: 'paragraph', text: 'Das ist unbequem.' },
      { type: 'paragraph', text: 'Aber ehrlich.' },
      { type: 'spacer' },
      { type: 'heading', level: 2, text: 'Fazit' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Online-Dating ist kein Zeichen dafür,' },
      { type: 'paragraph', text: 'dass Beziehungen kaputt sind.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Es zeigt nur,' },
      { type: 'paragraph', text: 'wie wenig Bewusstsein viele Menschen für Nähe, Verantwortung und Selbstregulation entwickelt haben – inklusive uns selbst.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Wenn du Online-Dating nicht mehr persönlich nimmst,' },
      { type: 'paragraph', text: 'sondern als Spiegel nutzt,' },
      { type: 'paragraph', text: 'verliert es seine zerstörerische Macht.' },
      { type: 'spacer' },
      { type: 'paragraph', text: 'Dann wird klar:' },
      { type: 'spacer' },
      { type: 'quote', text: '👉 Nicht jeder Kontakt ist ein Resonanzraum.' },
      { type: 'paragraph', text: 'Und das ist völlig okay.' }
    ]
  }
};

export default function BlogArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [mounted, setMounted] = useState(false);
  const [starPositions, setStarPositions] = useState<Array<{left: number, top: number, width: number, height: number, opacity: number, duration: number, delay: number}>>([]);

  // Nur client-seitig rendern, um Hydration-Fehler zu vermeiden
  useEffect(() => {
    setMounted(true);
    // Generiere Sterne-Positionen nur auf dem Client
    const stars = Array.from({ length: 50 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      width: Math.random() * 3 + 1,
      height: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setStarPositions(stars);
  }, []);

  const article = blogArticles.find(a => a.slug === slug);
  const content = article ? articleContent[slug] : null;

  if (!article || !content) {
    return (
      <Box sx={{ minHeight: '100vh', background: '#0b0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, sm: 3 } }}>
          <PublicHeader />
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 4, md: 6 } }}>
            <Logo mb={0} height={{ xs: 160, md: 180 }} width={{ xs: '90%', md: 600 }} maxWidth={600} />
          </Box>
          <Typography variant="h4" sx={{ color: 'white', mb: 2, textAlign: 'center' }}>Artikel nicht gefunden</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              component={Link}
              href="/blogartikel"
              variant="outlined" 
              startIcon={<ArrowLeft size={18} />}
            >
              Zurück zur Übersicht
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
        radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
        radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
        linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
      `,
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animierte Sterne im Hintergrund - nur nach Mount */}
      {mounted && starPositions.length > 0 && starPositions.map((star, i) => (
        <motion.div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            width: `${star.width}px`,
            height: `${star.height}px`,
            background: '#F29F05',
            borderRadius: '50%',
            left: `${star.left}%`,
            top: `${star.top}%`,
            pointerEvents: 'none',
            opacity: star.opacity,
            zIndex: 0,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: star.delay,
          }}
        />
      ))}

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, sm: 3 } }}>
        <PublicHeader />
        {/* Logo - Mobile: zentriert und größer, Desktop: wie bisher */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 4, md: 6 } }}>
          <Logo mb={0} height={{ xs: 160, md: 180 }} width={{ xs: '90%', md: 600 }} maxWidth={600} />
        </Box>
        {/* Zurück-Button */}
        <Box sx={{ mb: 4 }}>
            <Link href="/blogartikel" style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                startIcon={<ArrowLeft size={18} />}
                sx={{
                  color: 'rgba(242, 159, 5, 0.9)',
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  '&:hover': {
                    borderColor: 'rgba(242, 159, 5, 0.8)',
                    backgroundColor: 'rgba(242, 159, 5, 0.1)',
                  }
                }}
              >
                Zurück zur Übersicht
              </Button>
            </Link>
          </Box>

          {/* Artikel-Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ mb: 4 }}>
              <Chip
                icon={<Tag size={14} />}
                label={article.category}
                size="small"
                sx={{
                  background: 'rgba(242, 159, 5, 0.15)',
                  color: '#F29F05',
                  border: '1px solid rgba(242, 159, 5, 0.3)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  mb: 3
                }}
              />
              <Typography variant="h2" sx={{
                color: 'white',
                fontWeight: 800,
                mb: 3,
                fontSize: { xs: '1.8rem', md: '2.8rem' },
                lineHeight: 1.2
              }}>
                {article.title}
              </Typography>

              {/* Meta-Informationen */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                mb: 4,
                flexWrap: 'wrap'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <User size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {article.author}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Calendar size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {mounted ? new Date(article.date).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    }) : article.date}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Clock size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {article.readTime} Lesezeit
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: 'rgba(242, 159, 5, 0.2)', mb: 4 }} />
            </Box>
          </motion.div>

          {/* Artikel-Inhalt */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Box sx={{
              background: 'rgba(242, 159, 5, 0.05)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(242, 159, 5, 0.2)',
              p: { xs: 3, md: 5 },
              mb: 4,
              maxWidth: '800px',
              mx: 'auto'
            }}>
              {content.content.map((item, index) => {
                // Unterstützung für altes Format (string[])
                if (typeof item === 'string') {
                  // Leere Strings als Spacer behandeln
                  if (item === '') {
                    return <Box key={index} sx={{ mb: 2 }} />;
                  }
                  return (
                    <Typography
                      key={index}
                      variant="body1"
                      sx={{
                        color: 'rgba(255,255,255,0.9)',
                        mb: 3,
                        lineHeight: 1.8,
                        fontSize: '1.1rem'
                      }}
                    >
                      {item}
                    </Typography>
                  );
                }

                // Neues Format (ContentItem)
                const contentItem = item as ContentItem;
                
                switch (contentItem.type) {
                  case 'heading':
                    const HeadingComponent = contentItem.level === 1 ? 'h1' : contentItem.level === 2 ? 'h2' : 'h3';
                    return (
                      <Typography
                        key={index}
                        component={HeadingComponent}
                        sx={{
                          color: contentItem.level === 1 ? 'white' : contentItem.level === 2 ? '#F29F05' : '#F29F05',
                          fontWeight: contentItem.level === 1 ? 900 : contentItem.level === 2 ? 800 : 800,
                          mb: contentItem.level === 1 ? 3 : 2,
                          mt: contentItem.level === 1 ? 0 : 4,
                          fontSize: contentItem.level === 1 
                            ? { xs: '2rem', md: '3.5rem' }
                            : contentItem.level === 2 
                            ? { xs: '1.8rem', md: '2.8rem' }
                            : { xs: '1.5rem', md: '2rem' },
                          lineHeight: 1.2,
                          ...(contentItem.level === 2 && {
                            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          })
                        }}
                      >
                        {contentItem.text}
                      </Typography>
                    );
                  
                  case 'paragraph':
                    // Unterstützung für **fett** und *kursiv*
                    const formatText = (text: string) => {
                      let formatted = text;
                      // **fett** zu <strong>
                      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                      // *kursiv* zu <em>
                      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
                      return formatted;
                    };
                    // Kurze Zeilen zusammenfassen für bessere Lesbarkeit
                    const isShortLine = contentItem.text.length < 50;
                    return (
                      <Typography
                        key={index}
                        variant="body1"
                        component="div"
                        sx={{
                          color: 'rgba(255,255,255,0.95)',
                          mb: isShortLine ? 1.5 : 2.5,
                          lineHeight: 1.9,
                          fontSize: { xs: '1.125rem', md: '1.25rem' },
                          fontWeight: 400,
                          letterSpacing: '0.01em',
                          '& strong': {
                            color: '#F29F05',
                            fontWeight: 700,
                            fontSize: '1.1em'
                          },
                          '& em': {
                            fontStyle: 'italic',
                            color: 'rgba(255,255,255,0.85)'
                          }
                        }}
                        dangerouslySetInnerHTML={{ __html: formatText(contentItem.text) }}
                      />
                    );
                  
                  case 'list':
                    return (
                      <Box key={index} component="ul" sx={{ 
                        mb: 3, 
                        pl: 3,
                        color: 'rgba(255,255,255,0.9)',
                        '& li': {
                          mb: 1,
                          lineHeight: 1.8,
                          fontSize: '1.1rem'
                        }
                      }}>
                        {contentItem.items.map((listItem, listIndex) => (
                          <li key={listIndex}>{listItem}</li>
                        ))}
                      </Box>
                    );
                  
                  case 'quote':
                    // Unterstützung für **fett** und Emojis
                    const formatQuote = (text: string) => {
                      let formatted = text;
                      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                      return formatted;
                    };
                    return (
                      <Box
                        key={index}
                        component="div"
                        sx={{
                          borderLeft: '4px solid #F29F05',
                          pl: { xs: 2.5, md: 3.5 },
                          pr: 2,
                          py: 1.5,
                          mb: 3,
                          mt: 2,
                          fontStyle: 'italic',
                          color: 'rgba(255,255,255,0.9)',
                          fontSize: { xs: '1.125rem', md: '1.25rem' },
                          lineHeight: 1.9,
                          background: 'rgba(242, 159, 5, 0.08)',
                          borderRadius: '0 8px 8px 0',
                          '& strong': {
                            color: '#F29F05',
                            fontWeight: 700,
                            fontStyle: 'normal'
                          }
                        }}
                        dangerouslySetInnerHTML={{ __html: formatQuote(contentItem.text) }}
                      />
                    );
                  
                  case 'spacer':
                    return <Box key={index} sx={{ mb: { xs: 2, md: 3 } }} />;
                  
                  default:
                    return null;
                }
              })}
            </Box>
          </motion.div>

          {/* Zurück-Button am Ende */}
          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Button
              component={Link}
              href="/blogartikel"
              variant="outlined"
              startIcon={<ArrowLeft size={18} />}
              sx={{
                color: 'rgba(242, 159, 5, 0.9)',
                borderColor: 'rgba(242, 159, 5, 0.5)',
                px: 4,
                py: 1.5,
                '&:hover': {
                  borderColor: 'rgba(242, 159, 5, 0.8)',
                  backgroundColor: 'rgba(242, 159, 5, 0.1)',
                }
              }}
            >
              Zurück zur Übersicht
            </Button>
          </Box>
        </Container>
    </Box>
  );
}

