# 📚 Reading-Typen - Vollständige Spezifikation

## 🎯 Übersicht

**10 Reading-Typen** für Human Design Readings

---

## 1. 📖 Basic Reading (`basic`)

### **Beschreibung:**
Grundlegendes Human Design Reading mit den wichtigsten Informationen.

### **Input-Anforderungen:**
- ✅ `birthDate` (YYYY-MM-DD)
- ✅ `birthTime` (HH:MM)
- ✅ `birthPlace` (City, Country)
- ❌ Keine zusätzlichen Parameter

### **Output-Struktur:**
```typescript
{
  overview: string;           // Kurze Übersicht
  type: string;               // Human Design Typ (Generator, Manifestor, etc.)
  strategy: string;           // Strategie
  authority: string;          // Autorität
  profile: string;            // Profil (z.B. "1/3")
  centers: {
    defined: string[];        // Definierte Zentren
    undefined: string[];      // Undefinierte Zentren
  };
  channels: string[];         // Wichtige Channels
  gates: string[];           // Wichtige Gates
}
```

### **Verwendungszweck:**
- Erste Einführung in Human Design
- Schneller Überblick
- Basis-Informationen

### **Beispiel-Output:**
```
Du bist ein Generator mit emotionaler Autorität.
Deine Strategie ist es, auf deine innere Autorität zu warten, bevor du handelst.
Dein Profil ist 1/3 - Der Forscher/Entdecker.
```

---

## 2. 🔍 Detailed Reading (`detailed`)

### **Beschreibung:**
Detailliertes, umfassendes Human Design Reading mit allen Aspekten.

### **Input-Anforderungen:**
- ✅ `birthDate` (YYYY-MM-DD)
- ✅ `birthTime` (HH:MM)
- ✅ `birthPlace` (City, Country)
- ❌ Keine zusätzlichen Parameter

### **Output-Struktur:**
```typescript
{
  overview: string;           // Ausführliche Übersicht
  type: {
    name: string;             // Typ-Name
    description: string;      // Detaillierte Beschreibung
    characteristics: string[]; // Charakteristika
  };
  strategy: {
    name: string;            // Strategie-Name
    description: string;      // Detaillierte Beschreibung
    howTo: string;           // Wie anwenden
  };
  authority: {
    name: string;            // Autoritäts-Name
    description: string;      // Detaillierte Beschreibung
    howTo: string;           // Wie nutzen
  };
  profile: {
    line1: number;            // Erste Linie
    line2: number;           // Zweite Linie
    description: string;      // Profil-Beschreibung
    characteristics: string[]; // Charakteristika
  };
  centers: {
    defined: Array<{
      name: string;
      description: string;
      characteristics: string[];
    }>;
    undefined: Array<{
      name: string;
      description: string;
      conditioning: string;
    }>;
  };
  channels: Array<{
    name: string;
    description: string;
    gates: string[];
  }>;
  gates: Array<{
    number: number;
    name: string;
    description: string;
  }>;
  incarnationCross: {
    name: string;
    description: string;
    purpose: string;
  };
}
```

### **Verwendungszweck:**
- Vollständige Human Design Analyse
- Tiefes Verständnis
- Alle Aspekte abgedeckt

---

## 3. 💼 Business Reading (`business`)

### **Beschreibung:**
Human Design Reading fokussiert auf berufliche Aspekte, Karriere und Business.

### **Input-Anforderungen:**
- ✅ `birthDate` (YYYY-MM-DD)
- ✅ `birthTime` (HH:MM)
- ✅ `birthPlace` (City, Country)
- ❌ Keine zusätzlichen Parameter

### **Output-Struktur:**
```typescript
{
  overview: string;           // Business-Übersicht
  careerPath: string;         // Karriereweg
  workStyle: string;          // Arbeitsstil
  strengths: string[];        // Stärken im Business
  challenges: string[];        // Herausforderungen
  idealWorkEnvironment: string; // Ideales Arbeitsumfeld
  leadershipStyle: string;    // Führungsstil
  decisionMaking: string;     // Entscheidungsfindung
  collaboration: string;      // Zusammenarbeit
  businessStrategy: string;   // Business-Strategie
}
```

### **Verwendungszweck:**
- Karriere-Beratung
- Business-Entwicklung
- Team-Zusammenstellung
- Führungskräfte-Entwicklung

---

## 4. 💑 Relationship Reading (`relationship`)

### **Beschreibung:**
Human Design Reading fokussiert auf Beziehungen, Partnerschaft und Kommunikation.

### **Input-Anforderungen:**
- ✅ `birthDate` (YYYY-MM-DD)
- ✅ `birthTime` (HH:MM)
- ✅ `birthPlace` (City, Country)
- ❌ Keine zusätzlichen Parameter

### **Output-Struktur:**
```typescript
{
  overview: string;           // Beziehungs-Übersicht
  communicationStyle: string; // Kommunikationsstil
  needs: string[];            // Bedürfnisse in Beziehungen
  challenges: string[];       // Herausforderungen
  strengths: string[];        // Stärken
  idealPartner: string;       // Idealer Partner
  relationshipStrategy: string; // Beziehungs-Strategie
  intimacy: string;          // Intimität
  conflictResolution: string; // Konfliktlösung
}
```

### **Verwendungszweck:**
- Beziehungs-Beratung
- Partnerschafts-Entwicklung
- Kommunikations-Verbesserung
- Familien-Dynamik

---

## 5. 🎯 Career Reading (`career`)

### **Beschreibung:**
Human Design Reading fokussiert auf Karriere, Berufung und Lebensaufgabe.

### **Input-Anforderungen:**
- ✅ `birthDate` (YYYY-MM-DD)
- ✅ `birthTime` (HH:MM)
- ✅ `birthPlace` (City, Country)
- ❌ Keine zusätzlichen Parameter

### **Output-Struktur:**
```typescript
{
  overview: string;           // Karriere-Übersicht
  calling: string;            // Berufung
  careerPath: string;         // Karriereweg
  idealRoles: string[];       // Ideale Rollen
  skills: string[];           // Fähigkeiten
  development: string;        // Entwicklung
  fulfillment: string;        // Erfüllung
  purpose: string;            // Lebenszweck
}
```

### **Verwendungszweck:**
- Karriere-Beratung
- Berufungsfindung
- Lebenszweck-Entdeckung
- Persönlichkeitsentwicklung

---

## 6. 🌿 Health Reading (`health`)

### **Beschreibung:**
Human Design Reading fokussiert auf Gesundheit, Wellness und Wohlbefinden.

### **Input-Anforderungen:**
- ✅ `birthDate` (YYYY-MM-DD)
- ✅ `birthTime` (HH:MM)
- ✅ `birthPlace` (City, Country)
- ❌ Keine zusätzlichen Parameter

### **Output-Struktur:**
```typescript
{
  overview: string;           // Health-Übersicht
  healthStrategy: string;     // Gesundheits-Strategie
  vulnerabilities: string[];  // Vulnerabilitäten
  strengths: string[];        // Stärken
  nutrition: string;         // Ernährung
  exercise: string;          // Bewegung
  sleep: string;             // Schlaf
  stressManagement: string;  // Stress-Management
  wellness: string;         // Wellness
}
```

### **Verwendungszweck:**
- Gesundheits-Beratung
- Wellness-Entwicklung
- Prävention
- Lebensstil-Optimierung

---

## 7. 👨‍👩‍👧‍👦 Parenting Reading (`parenting`)

### **Beschreibung:**
Human Design Reading fokussiert auf Elternschaft, Familie und Kindererziehung.

### **Input-Anforderungen:**
- ✅ `birthDate` (YYYY-MM-DD)
- ✅ `birthTime` (HH:MM)
- ✅ `birthPlace` (City, Country)
- ❌ Keine zusätzlichen Parameter

### **Output-Struktur:**
```typescript
{
  overview: string;           // Parenting-Übersicht
  parentingStyle: string;     // Erziehungsstil
  strengths: string[];        // Stärken als Elternteil
  challenges: string[];       // Herausforderungen
  communication: string;     // Kommunikation mit Kindern
  boundaries: string;         // Grenzen
  support: string;           // Unterstützung
  familyDynamics: string;     // Familien-Dynamik
}
```

### **Verwendungszweck:**
- Elternschafts-Beratung
- Familien-Dynamik
- Kindererziehung
- Beziehungs-Verbesserung

---

## 8. 🕉️ Spiritual Reading (`spiritual`)

### **Beschreibung:**
Human Design Reading fokussiert auf Spiritualität, Wachstum und Bewusstsein.

### **Input-Anforderungen:**
- ✅ `birthDate` (YYYY-MM-DD)
- ✅ `birthTime` (HH:MM)
- ✅ `birthPlace` (City, Country)
- ❌ Keine zusätzlichen Parameter

### **Output-Struktur:**
```typescript
{
  overview: string;           // Spiritual-Übersicht
  spiritualPath: string;      // Spiritueller Weg
  growth: string;            // Wachstum
  awareness: string;         // Bewusstsein
  practices: string[];        // Praktiken
  challenges: string[];       // Herausforderungen
  purpose: string;           // Spiritueller Zweck
  connection: string;        // Verbindung
}
```

### **Verwendungszweck:**
- Spirituelle Entwicklung
- Bewusstseins-Wachstum
- Persönlichkeitsentwicklung
- Sinnfindung

---

## 9. 🤝 Compatibility Reading (`compatibility`)

### **Beschreibung:**
Human Design Reading für zwei Personen - Kompatibilität und Beziehungs-Dynamik.

### **Input-Anforderungen:**
- ✅ `birthDate` (YYYY-MM-DD) - Person 1
- ✅ `birthTime` (HH:MM) - Person 1
- ✅ `birthPlace` (City, Country) - Person 1
- ✅ `birthDate2` (YYYY-MM-DD) - Person 2
- ✅ `birthTime2` (HH:MM) - Person 2
- ✅ `birthPlace2` (City, Country) - Person 2
- ❌ Keine zusätzlichen Parameter

### **Output-Struktur:**
```typescript
{
  overview: string;           // Kompatibilitäts-Übersicht
  person1: {
    type: string;
    strategy: string;
    authority: string;
  };
  person2: {
    type: string;
    strategy: string;
    authority: string;
  };
  compatibility: {
    score: number;           // 0-100
    strengths: string[];      // Stärken der Beziehung
    challenges: string[];     // Herausforderungen
    dynamics: string;        // Dynamik
  };
  communication: string;     // Kommunikation
  conflictResolution: string; // Konfliktlösung
  growth: string;            // Wachstumspotenzial
}
```

### **Verwendungszweck:**
- Partnerschafts-Analyse
- Team-Zusammenstellung
- Beziehungs-Beratung
- Kompatibilitäts-Check

---

## 10. 🌟 Life Purpose Reading (`life-purpose`)

### **Beschreibung:**
Human Design Reading fokussiert auf Lebenszweck, Mission und Bestimmung.

### **Input-Anforderungen:**
- ✅ `birthDate` (YYYY-MM-DD)
- ✅ `birthTime` (HH:MM)
- ✅ `birthPlace` (City, Country)
- ❌ Keine zusätzlichen Parameter

### **Output-Struktur:**
```typescript
{
  overview: string;           // Life Purpose-Übersicht
  purpose: string;            // Lebenszweck
  mission: string;            // Mission
  incarnationCross: {
    name: string;
    description: string;
    purpose: string;
  };
  gifts: string[];            // Gaben
  challenges: string[];       // Herausforderungen
  path: string;              // Weg
  fulfillment: string;       // Erfüllung
}
```

### **Verwendungszweck:**
- Sinnfindung
- Lebenszweck-Entdeckung
- Persönlichkeitsentwicklung
- Mission-Entwicklung

---

## 📋 Validierung

### **Erlaubte Reading-Typen:**
```typescript
const ALLOWED_READING_TYPES = [
  'basic',
  'detailed',
  'business',
  'relationship',
  'career',
  'health',
  'parenting',
  'spiritual',
  'compatibility',
  'life-purpose'
];
```

### **Validierungs-Regeln:**
1. ✅ Reading-Typ muss in erlaubter Liste sein
2. ✅ `birthDate` muss YYYY-MM-DD Format sein
3. ✅ `birthDate` muss in der Vergangenheit sein
4. ✅ `birthTime` muss HH:MM Format sein (24h)
5. ✅ `birthPlace` muss nicht leer sein
6. ✅ Für `compatibility`: Beide Personen-Daten erforderlich

---

## 🎯 Nächste Schritte

1. ✅ **A1: Reading-Typen definiert** ← **FERTIG**
2. ⏭️ **A2: Input-Validierung implementieren**
3. ⏭️ **A3: Output-Struktur standardisieren**

