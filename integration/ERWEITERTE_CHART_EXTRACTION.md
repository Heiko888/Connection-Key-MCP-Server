# 🔧 Erweiterte Chart-Daten-Extraktion

## 📊 Vollständige Chart-Daten-Struktur

### Erweiterte `extractChartDataFromReading` Methode

```javascript
extractChartDataFromReading(readingText) {
  if (!readingText) return {};
  
  // Basis-Daten (bereits implementiert)
  const type = this.extractType(readingText);
  const profile = this.extractProfile(readingText);
  const authority = this.extractAuthority(readingText);
  const strategy = this.extractStrategy(readingText);
  
  // NEU: Planetendaten
  const planets = this.extractPlanets(readingText);
  
  // NEU: Gates
  const gates = this.extractGates(readingText);
  
  // NEU: Channels
  const channels = this.extractChannels(readingText);
  
  // NEU: Zentren
  const centers = this.extractCenters(readingText);
  
  // NEU: Incarnation Cross
  const incarnationCross = this.extractIncarnationCross(readingText);
  
  return {
    type,
    profile,
    authority,
    strategy,
    planets,
    gates,
    channels,
    centers,
    incarnationCross
  };
}

// NEU: Planetendaten extrahieren
extractPlanets(readingText) {
  const planets = {};
  
  // Sonne
  const sunMatch = readingText.match(/Sonne.*?Gate\s+(\d+).*?Linie\s+(\d+)/i) ||
                   readingText.match(/Sun.*?Gate\s+(\d+).*?Line\s+(\d+)/i);
  if (sunMatch) {
    planets.sun = { gate: parseInt(sunMatch[1]), line: parseInt(sunMatch[2]) };
  }
  
  // Mond
  const moonMatch = readingText.match(/Mond.*?Gate\s+(\d+).*?Linie\s+(\d+)/i) ||
                    readingText.match(/Moon.*?Gate\s+(\d+).*?Line\s+(\d+)/i);
  if (moonMatch) {
    planets.moon = { gate: parseInt(moonMatch[1]), line: parseInt(moonMatch[2]) };
  }
  
  // Weitere Planeten...
  // (Merkur, Venus, Mars, Jupiter, Saturn, Uranus, Neptun, Pluto, Nodes)
  
  return planets;
}

// NEU: Gates extrahieren
extractGates(readingText) {
  const gates = {
    defined: [],
    undefined: [],
    emphasis: []
  };
  
  // Extrahiere alle Gates (z.B. "Gate 43", "Gate 23")
  const gateMatches = readingText.matchAll(/Gate\s+(\d+)/gi);
  for (const match of gateMatches) {
    const gateNum = parseInt(match[1]);
    if (!gates.defined.includes(gateNum)) {
      gates.defined.push(gateNum);
    }
  }
  
  // Emphasis Gates (meist = defined Gates)
  gates.emphasis = [...gates.defined];
  
  // Undefined Gates (alle anderen 1-64)
  for (let i = 1; i <= 64; i++) {
    if (!gates.defined.includes(i)) {
      gates.undefined.push(i);
    }
  }
  
  return gates;
}

// NEU: Channels extrahieren
extractChannels(readingText) {
  const channels = {
    active: [],
    details: {}
  };
  
  // Extrahiere Channels (z.B. "Channel 1-8", "Channel 2-14")
  const channelMatches = readingText.matchAll(/Channel\s+(\d+)-(\d+)/gi);
  for (const match of channelMatches) {
    const channel = `${match[1]}-${match[2]}`;
    if (!channels.active.includes(channel)) {
      channels.active.push(channel);
    }
  }
  
  return channels;
}

// NEU: Zentren extrahieren
extractCenters(readingText) {
  const centers = {
    defined: [],
    undefined: [],
    details: {}
  };
  
  const centerNames = [
    { key: 'head', names: ['Head', 'Kopf'] },
    { key: 'ajna', names: ['Ajna', 'Stirn'] },
    { key: 'throat', names: ['Throat', 'Kehle'] },
    { key: 'g', names: ['G Center', 'G-Zentrum'] },
    { key: 'heart', names: ['Heart', 'Herz'] },
    { key: 'solarPlexus', names: ['Solar Plexus', 'Solarplexus'] },
    { key: 'sacral', names: ['Sacral', 'Sakral'] },
    { key: 'spleen', names: ['Spleen', 'Milz'] },
    { key: 'root', names: ['Root', 'Wurzel'] }
  ];
  
  for (const center of centerNames) {
    const isDefined = center.names.some(name => 
      readingText.match(new RegExp(`${name}.*?(?:definiert|defined|farbig)`, 'i'))
    );
    
    if (isDefined) {
      centers.defined.push(center.key);
    } else {
      centers.undefined.push(center.key);
    }
    
    centers.details[center.key] = { defined: isDefined };
  }
  
  return centers;
}

// NEU: Incarnation Cross extrahieren
extractIncarnationCross(readingText) {
  const crossMatch = readingText.match(/Inkarnationskreuz.*?([A-Za-z\s]+Cross)/i) ||
                     readingText.match(/Incarnation Cross.*?([A-Za-z\s]+Cross)/i);
  
  if (crossMatch) {
    return {
      name: crossMatch[1].trim(),
      type: this.determineCrossType(crossMatch[1]),
      meaning: null // Könnte aus Text extrahiert werden
    };
  }
  
  return null;
}

determineCrossType(crossName) {
  if (crossName.includes('Right Angle')) return 'Right Angle';
  if (crossName.includes('Left Angle')) return 'Left Angle';
  if (crossName.includes('Juxtaposition')) return 'Juxtaposition';
  return 'Unknown';
}
```

---

## ⚠️ Problem: Reading-Text enthält nicht alle Daten

**Lösung:** Reading Agent muss vollständige Chart-Daten berechnen und zurückgeben!

### Reading Agent erweitern

**In `production/server.js` - `/reading/generate` Endpoint:**

```javascript
// Nach OpenAI API Call
const reading = completion.choices[0].message.content;

// NEU: Berechne vollständige Chart-Daten
const chartData = await this.calculateFullChartData(birthDate, birthTime, birthPlace);

res.json({
  success: true,
  readingId,
  reading,
  chartData, // ← Vollständige Chart-Daten!
  readingType,
  birthDate,
  birthTime,
  birthPlace,
  tokens: completion.usage.total_tokens,
  timestamp: new Date().toISOString()
});

// NEU: Vollständige Chart-Berechnung
async calculateFullChartData(birthDate, birthTime, birthPlace) {
  // Option 1: Nutze externe API
  // Option 2: Nutze n8n Webhook
  // Option 3: Nutze Chart-Berechnungs-Bibliothek
  
  // Beispiel: n8n Webhook
  const n8nUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
  const response = await fetch(`${n8nUrl}/webhook/chart-calculation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ birthDate, birthTime, birthPlace })
  });
  
  if (response.ok) {
    return await response.json();
  }
  
  // Fallback: Basis-Daten aus Reading-Text
  return this.extractBasicChartData(reading);
}
```

---

## 🎯 Empfohlene Implementierung

1. ✅ **Reading Agent erweitern** - Vollständige Chart-Berechnung
2. ✅ **n8n Webhook erstellen** - Chart-Berechnungs-Workflow
3. ✅ **Oder externe API nutzen** - Chart-Berechnungs-Service

**Priorität:** Reading Agent erweitern, um vollständige Chart-Daten zu berechnen!

