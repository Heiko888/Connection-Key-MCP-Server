# Connection Key Engine - Ultra Version

Vollständige Connection-Key-Analyse für Human Design Charts mit 4 Connection-Key-Typen, Scoring-System und Text-Generator.

## 🎯 Features

- ✅ **4 Connection-Key-Typen**: Electromagnetic, Compromise, Dominance, Companionship
- ✅ **Scoring-System**: Connection, Chemistry, Stability, Growth Scores
- ✅ **Profile-Typen**: Soul Mate, Twin Flame, Safe & Soft, Business Buddy, Growth Partner
- ✅ **Text-Generator**: Automatische Reports für Business, Relationship, Dating
- ✅ **API-ready**: JSON-Format für direkte Integration

## 📦 Installation & Import

```typescript
import { 
  analyzeConnectionKeys,
  type ChartInput,
  type ConnectionKeyResult 
} from '@/lib/human-design/connection-key-engine';
```

## 🚀 Verwendung

### Basis-Verwendung

```typescript
const personA: ChartInput = {
  gates: [25, 51, 59, 6], // Aktive Tore
  channels: ['25-51'], // Aktive Kanäle (optional)
  type: 'generator',
  profile: '1/3',
  authority: 'Sakral',
  strategy: 'Warten und Antworten'
};

const personB: ChartInput = {
  gates: [51, 25, 6, 59],
  channels: ['59-6'],
  type: 'projector',
  profile: '2/4',
  authority: 'Emotional',
  strategy: 'Warten auf Einladung'
};

const result = analyzeConnectionKeys(personA, personB, 'user-123', 'user-456');

console.log(result.scores);
// {
//   connection: 82,
//   chemistry: 76,
//   stability: 61,
//   growth: 88
// }

console.log(result.connectionKeys.electromagnetic);
// Array von Electromagnetic Connection Keys

console.log(result.profileType);
// 'twin-flame' | 'soul-mate' | 'safe-soft' | 'business-buddy' | 'growth-partner' | 'neutral'
```

### API-Verwendung

```typescript
// POST /api/connection-keys/analyze
const response = await fetch('/api/connection-keys/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    personA: {
      gates: [25, 51, 59, 6],
      channels: ['25-51'],
      type: 'generator',
      profile: '1/3'
    },
    personB: {
      gates: [51, 25, 6, 59],
      channels: ['59-6'],
      type: 'projector',
      profile: '2/4'
    },
    personAId: 'user-123',
    personBId: 'user-456'
  })
});

const { success, data } = await response.json();
```

## 🔑 Connection-Key-Typen

### 1. Electromagnetic (EM)

**Definition**: Person A hat Tor X, Person B hat das gegenüberliegende Tor Y im Kanal.

**Beispiel**: 
- Person A: Tor 25
- Person B: Tor 51
- → Kanal 25-51 wird aktiviert

**Bedeutung**: Magnetische Anziehung, Energie fließt zwischen beiden Personen.

### 2. Compromise

**Definition**: Eine Person hat den kompletten Kanal, die andere nur ein Tor davon.

**Beispiel**:
- Person A: Tor 25 + Tor 51 (kompletter Kanal 25-51)
- Person B: Tor 25 (nur ein Tor)

**Bedeutung**: Spannung, Frustration, unausgewogene Dynamik. Wachstumsfeld.

### 3. Dominance

**Definition**: Eine Person hat einen ganzen Kanal, die andere keinen Teil davon.

**Beispiel**:
- Person A: Tor 25 + Tor 51 (kompletter Kanal 25-51)
- Person B: Keine Tore davon

**Bedeutung**: Person A dominiert energetisch, Person B folgt.

### 4. Companionship

**Definition**: Beide haben das gleiche Tor.

**Beispiel**:
- Person A: Tor 25
- Person B: Tor 25

**Bedeutung**: Harmonische Begleitung, stabil, easy.

## 📊 Scoring-System

### Connection Score (0-100)
Gesamt-Kompatibilität basierend auf allen Connection Keys.

### Chemistry Score (0-100)
Sexuelle/körperliche Chemie basierend auf EM + Compromise (Spannung = Anziehung).

### Stability Score (0-100)
Langfristig tragfähig basierend auf Companionship + moderate EM.

### Growth Score (0-100)
Potential für Wachstum & Triggerarbeit basierend auf Compromise + EM.

## 🎭 Profile-Typen

### Soul Mate
- Connection ≥ 75
- Stability ≥ 60
- Chemistry ≥ 60
- Growth ≥ 50

### Twin Flame
- Chemistry ≥ 80
- Growth ≥ 75

### Safe & Soft
- Stability ≥ 70
- Chemistry ≥ 50
- Growth < 50

### Business Buddy
- Connection ≥ 65
- Stability ≥ 60
- Chemistry < 50

### Growth Partner
- Growth ≥ 70

## 📝 Output-Format

```typescript
interface ConnectionKeyResult {
  pair: {
    personAId: string;
    personBId: string;
  };
  scores: {
    connection: number; // 0-100
    chemistry: number; // 0-100
    stability: number; // 0-100
    growth: number; // 0-100
  };
  connectionKeys: {
    electromagnetic: ConnectionKey[];
    compromise: ConnectionKey[];
    dominance: ConnectionKey[];
    companionship: ConnectionKey[];
    all: ConnectionKey[];
  };
  profileType: ProfileType;
  summaryText: string;
  businessText?: string;
  relationshipText?: string;
  datingText?: string;
  strengths: string[];
  challenges: string[];
  growthPotential: string[];
  coachingNotes?: string[];
}
```

## 🔧 Erweiterte Funktionen

### Nur Connection Keys finden (ohne Scores)

```typescript
import { findConnectionKeysEngine } from '@/lib/human-design/connection-key-engine';

const connectionKeys = findConnectionKeysEngine(personA, personB);
```

### Scores separat berechnen

```typescript
import { calculateConnectionScores } from '@/lib/human-design/connection-key-engine';

const scores = calculateConnectionScores(connectionKeys, personA, personB);
```

### Profile-Typ bestimmen

```typescript
import { determineProfileType } from '@/lib/human-design/connection-key-engine';

const profileType = determineProfileType(scores);
```

## 🎨 Integration in deine App

### Beispiel: Matching-Seite

```typescript
// In deiner Matching-Komponente
const analyzeMatch = async (userA: User, userB: User) => {
  const result = await fetch('/api/connection-keys/analyze', {
    method: 'POST',
    body: JSON.stringify({
      personA: {
        gates: userA.chart.gates,
        channels: userA.chart.channels,
        type: userA.chart.type
      },
      personB: {
        gates: userB.chart.gates,
        channels: userB.chart.channels,
        type: userB.chart.type
      },
      personAId: userA.id,
      personBId: userB.id
    })
  }).then(res => res.json());

  // Zeige Scores an
  displayScores(result.data.scores);
  
  // Zeige Connection Keys an
  displayConnectionKeys(result.data.connectionKeys);
  
  // Zeige Profil-Typ an
  displayProfileType(result.data.profileType);
};
```

### Beispiel: Filter für Dating-App

```typescript
const filterMatches = (matches: Match[], filters: {
  minConnection?: number;
  minChemistry?: number;
  minStability?: number;
  profileTypes?: ProfileType[];
}) => {
  return matches.filter(match => {
    const scores = match.connectionKeyResult.scores;
    
    if (filters.minConnection && scores.connection < filters.minConnection) {
      return false;
    }
    
    if (filters.minChemistry && scores.chemistry < filters.minChemistry) {
      return false;
    }
    
    if (filters.minStability && scores.stability < filters.minStability) {
      return false;
    }
    
    if (filters.profileTypes && !filters.profileTypes.includes(match.connectionKeyResult.profileType)) {
      return false;
    }
    
    return true;
  });
};
```

## 🚧 Nächste Schritte (Optional)

Die Engine ist modular aufgebaut und kann erweitert werden mit:

- **Sexuality Keys**: Spezielle Analyse für sexuelle Chemie
- **Penta Integration**: Team-Matching mit Penta-Logik
- **Transite**: Zeitqualität in die Analyse einbeziehen
- **Multi-Person**: Mehr als 2 Personen analysieren

## 📚 Weitere Ressourcen

- [Human Design System](https://www.humandesign.com/)
- [Connection Keys Explained](https://www.humandesign.com/connection-keys/)

