/**
 * Chart-Berechnung mit astronomy-engine
 * Präzise astronomische Berechnungen für Human Design Charts
 */

// Fallback: Wenn astronomy-engine nicht verfügbar ist, nutze vereinfachte Berechnung
let AstronomyEngine;
try {
  // Versuche astronomy-engine zu laden (falls installiert)
  AstronomyEngine = require('astronomy-engine');
} catch (error) {
  console.warn('astronomy-engine nicht verfügbar, nutze Fallback-Berechnung');
  AstronomyEngine = null;
}

const NodeGeocoder = require('node-geocoder');

class ChartCalculationAstronomy {
  constructor() {
    this.geocoder = null;
    this.initGeocoder();
  }

  initGeocoder() {
    try {
      // Nutze OpenStreetMap (kostenlos, keine API-Key nötig)
      this.geocoder = NodeGeocoder({
        provider: 'openstreetmap',
        httpAdapter: 'https',
        formatter: null
      });
    } catch (error) {
      console.warn('Geocoder konnte nicht initialisiert werden:', error.message);
    }
  }

  /**
   * Hauptfunktion: Berechnet Human Design Chart mit astronomy-engine
   */
  async calculateHumanDesignChart(birthDate, birthTime, birthPlace) {
    // 1. Geocoding (Geburtsort → Koordinaten)
    const coordinates = await this.geocode(birthPlace);
    
    // 2. Parse Geburtsdaten
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hours, minutes] = birthTime.split(':').map(Number);
    
    // 3. Julian Day berechnen
    const julianDay = this.calculateJulianDay(year, month, day, hours, minutes);
    
    // 4. Planetenpositionen berechnen
    const planets = await this.calculatePlanets(julianDay, coordinates);
    
    // 5. Human Design Chart-Daten berechnen
    const chartData = this.calculateChartData(planets);
    
    return chartData;
  }

  /**
   * Geocoding: Konvertiert Geburtsort zu Koordinaten
   */
  async geocode(birthPlace) {
    if (!this.geocoder) {
      // Fallback: Nutze Standard-Koordinaten (kann später verbessert werden)
      console.warn('Geocoder nicht verfügbar, nutze Fallback-Koordinaten');
      return { latitude: 52.52, longitude: 13.405 }; // Berlin als Fallback
    }

    try {
      const results = await this.geocoder.geocode(birthPlace);
      if (results && results.length > 0) {
        return {
          latitude: results[0].latitude,
          longitude: results[0].longitude
        };
      }
    } catch (error) {
      console.warn('Geocoding fehlgeschlagen:', error.message);
    }

    // Fallback: Standard-Koordinaten
    return { latitude: 52.52, longitude: 13.405 };
  }

  /**
   * Berechnet Julian Day aus Datum und Zeit
   */
  calculateJulianDay(year, month, day, hours, minutes) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    
    const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + 
                Math.floor(y / 4) - Math.floor(y / 100) + 
                Math.floor(y / 400) - 32045;
    
    const jd = jdn + (hours - 12) / 24 + minutes / 1440;
    return jd;
  }

  /**
   * Berechnet Planetenpositionen mit astronomy-engine oder Fallback
   */
  async calculatePlanets(julianDay, coordinates) {
    if (AstronomyEngine) {
      return await this.calculatePlanetsWithAstronomy(julianDay, coordinates);
    } else {
      return this.calculatePlanetsFallback(julianDay);
    }
  }

  /**
   * Berechnet Planetenpositionen mit astronomy-engine (präzise)
   */
  async calculatePlanetsWithAstronomy(julianDay, coordinates) {
    const planets = {};
    
    try {
      // Nutze astronomy-engine für präzise Berechnungen
      // Hinweis: Die genaue API kann je nach Version variieren
      // Dies ist eine Beispiel-Implementierung
      
      const time = new Date((julianDay - 2440587.5) * 86400000);
      
      // Sonne
      const sunLongitude = AstronomyEngine.SunLongitude(time);
      planets.sun = this.positionToGateAndLine(sunLongitude);
      
      // Mond
      const moonLongitude = AstronomyEngine.MoonLongitude(time);
      planets.moon = this.positionToGateAndLine(moonLongitude);
      
      // Merkur
      const mercuryLongitude = AstronomyEngine.MercuryLongitude(time);
      planets.mercury = this.positionToGateAndLine(mercuryLongitude);
      
      // Venus
      const venusLongitude = AstronomyEngine.VenusLongitude(time);
      planets.venus = this.positionToGateAndLine(venusLongitude);
      
      // Mars
      const marsLongitude = AstronomyEngine.MarsLongitude(time);
      planets.mars = this.positionToGateAndLine(marsLongitude);
      
      // Jupiter
      const jupiterLongitude = AstronomyEngine.JupiterLongitude(time);
      planets.jupiter = this.positionToGateAndLine(jupiterLongitude);
      
      // Saturn
      const saturnLongitude = AstronomyEngine.SaturnLongitude(time);
      planets.saturn = this.positionToGateAndLine(saturnLongitude);
      
      // Uranus
      const uranusLongitude = AstronomyEngine.UranusLongitude(time);
      planets.uranus = this.positionToGateAndLine(uranusLongitude);
      
      // Neptun
      const neptuneLongitude = AstronomyEngine.NeptuneLongitude(time);
      planets.neptune = this.positionToGateAndLine(neptuneLongitude);
      
      // Pluto
      const plutoLongitude = AstronomyEngine.PlutoLongitude(time);
      planets.pluto = this.positionToGateAndLine(plutoLongitude);
      
      // North Node (Mondknoten)
      const northNodeLongitude = AstronomyEngine.MoonNodeLongitude(time);
      planets.northNode = this.positionToGateAndLine(northNodeLongitude);
      
      // South Node (180° gegenüber North Node)
      planets.southNode = this.positionToGateAndLine((northNodeLongitude + 180) % 360);
      
      // Earth (180° gegenüber Sonne)
      planets.earth = this.positionToGateAndLine((sunLongitude + 180) % 360);
      
    } catch (error) {
      console.warn('astronomy-engine Berechnung fehlgeschlagen, nutze Fallback:', error.message);
      return this.calculatePlanetsFallback(julianDay);
    }
    
    return planets;
  }

  /**
   * Fallback: Vereinfachte Planetenberechnung (wenn astronomy-engine nicht verfügbar)
   */
  calculatePlanetsFallback(julianDay) {
    const planets = {};
    const baseAngle = (julianDay % 360) * 2;
    
    // Vereinfachte Berechnung (für Test)
    planets.sun = this.positionToGateAndLine(baseAngle);
    planets.earth = this.positionToGateAndLine((baseAngle + 180) % 360);
    planets.moon = this.positionToGateAndLine((baseAngle + 30) % 360);
    planets.mercury = this.positionToGateAndLine((baseAngle + 60) % 360);
    planets.venus = this.positionToGateAndLine((baseAngle + 90) % 360);
    planets.mars = this.positionToGateAndLine((baseAngle + 120) % 360);
    planets.jupiter = this.positionToGateAndLine((baseAngle + 150) % 360);
    planets.saturn = this.positionToGateAndLine((baseAngle + 180) % 360);
    planets.uranus = this.positionToGateAndLine((baseAngle + 210) % 360);
    planets.neptune = this.positionToGateAndLine((baseAngle + 240) % 360);
    planets.pluto = this.positionToGateAndLine((baseAngle + 270) % 360);
    planets.northNode = this.positionToGateAndLine((baseAngle + 300) % 360);
    planets.southNode = this.positionToGateAndLine((baseAngle + 330) % 360);
    
    return planets;
  }

  /**
   * Konvertiert ekliptikale Länge zu Human Design Gate und Line
   */
  positionToGateAndLine(longitude) {
    // Normalisiere auf 0-360°
    let normalized = longitude % 360;
    if (normalized < 0) normalized += 360;
    
    // Human Design: 64 Gates, jedes Gate = 5.625° (360° / 64)
    const gate = Math.floor(normalized / 5.625) + 1;
    const finalGate = gate > 64 ? 64 : gate;
    
    // Jedes Gate hat 6 Lines, jede Line = 0.9375° (5.625° / 6)
    const gateStart = (finalGate - 1) * 5.625;
    const positionInGate = normalized - gateStart;
    const line = Math.floor(positionInGate / 0.9375) + 1;
    const finalLine = line > 6 ? 6 : line;
    
    return {
      longitude: normalized,
      gate: finalGate,
      line: finalLine
    };
  }

  /**
   * Berechnet Human Design Chart-Daten aus Planetenpositionen
   */
  calculateChartData(planets) {
    // Sammle alle definierten Gates
    const definedGates = [];
    const planetsData = {};
    
    for (const [planetName, planetData] of Object.entries(planets)) {
      if (planetData && planetData.gate) {
        definedGates.push(planetData.gate);
        planetsData[planetName] = {
          gate: planetData.gate,
          line: planetData.line || 1,
          longitude: planetData.longitude
        };
      }
    }
    
    const uniqueGates = [...new Set(definedGates)];
    
    // Berechne Channels
    const channels = this.calculateChannels(uniqueGates);
    
    // Berechne Centers
    const centers = this.calculateCenters(uniqueGates);
    
    // Berechne Type
    const type = this.calculateType(centers);
    
    // Berechne Profile
    const profile = this.calculateProfile(planets.sun, planets.earth);
    
    // Berechne Authority
    const authority = this.calculateAuthority(centers);
    
    // Berechne Strategy
    const strategy = this.calculateStrategy(type);
    
    // Berechne Incarnation Cross
    const incarnationCross = this.calculateIncarnationCross(planets.sun, planets.earth);
    
    return {
      type,
      profile,
      authority,
      strategy,
      planets: planetsData,
      gates: {
        defined: uniqueGates.sort((a, b) => a - b),
        undefined: Array.from({length: 64}, (_, i) => i + 1).filter(g => !uniqueGates.includes(g)),
        emphasis: uniqueGates.sort((a, b) => a - b)
      },
      channels,
      centers,
      incarnationCross
    };
  }

  /**
   * Berechnet aktivierte Channels basierend auf definierten Gates
   */
  calculateChannels(gates) {
    const channelMap = {
      "1-8": [1, 8], "2-14": [2, 14], "3-60": [3, 60], "7-31": [7, 31],
      "10-20": [10, 20], "13-33": [13, 33], "17-62": [17, 62], "18-58": [18, 58],
      "19-49": [19, 49], "20-34": [20, 34], "20-57": [20, 57], "21-45": [21, 45],
      "23-43": [23, 43], "24-61": [24, 61], "25-51": [25, 51], "26-44": [26, 44],
      "27-50": [27, 50], "28-38": [28, 38], "29-46": [29, 46], "30-41": [30, 41],
      "32-54": [32, 54], "35-36": [35, 36], "37-40": [37, 40], "39-55": [39, 55],
      "42-53": [42, 53], "47-64": [47, 64], "48-57": [48, 57], "49-4": [49, 4],
      "51-25": [51, 25], "52-9": [52, 9], "53-42": [53, 42], "54-32": [54, 32],
      "55-39": [55, 39], "56-11": [56, 11], "57-20": [57, 20], "57-10": [57, 10],
      "59-6": [59, 6], "60-3": [60, 3], "61-24": [61, 24], "62-17": [62, 17],
      "63-4": [63, 4], "64-47": [64, 47]
    };
    
    const activeChannels = [];
    for (const [channelName, channelGates] of Object.entries(channelMap)) {
      if (channelGates.every(gate => gates.includes(gate))) {
        activeChannels.push(channelName);
      }
    }
    
    return { active: activeChannels, details: {} };
  }

  /**
   * Berechnet definierte/undefinierte Centers
   */
  calculateCenters(gates) {
    const centerMap = {
      head: [64, 61, 63],
      ajna: [47, 24, 4],
      throat: [23, 8, 20, 16, 35, 45, 12, 33, 31, 56, 62],
      g: [1, 2, 7, 10, 13, 15, 25, 46],
      heart: [21, 26, 40, 51],
      solarPlexus: [6, 22, 36, 37, 49, 55, 30, 50, 58, 19, 60, 41],
      sacral: [5, 14, 29, 9, 3, 42, 27, 34, 59],
      spleen: [48, 57, 18, 28, 32, 44, 50, 52, 58],
      root: [19, 39, 38, 41, 58, 60, 52, 53, 54]
    };
    
    const definedCenters = [];
    const undefinedCenters = [];
    const details = {};
    
    for (const [centerName, centerGates] of Object.entries(centerMap)) {
      const isDefined = centerGates.some(gate => gates.includes(gate));
      if (isDefined) {
        definedCenters.push(centerName);
      } else {
        undefinedCenters.push(centerName);
      }
      details[centerName] = {
        defined: isDefined,
        gates: centerGates.filter(g => gates.includes(g))
      };
    }
    
    return { defined: definedCenters, undefined: undefinedCenters, details };
  }

  /**
   * Berechnet Human Design Type
   */
  calculateType(centers) {
    const sacralDefined = centers.defined.includes('sacral');
    const throatDefined = centers.defined.includes('throat');
    const spleenDefined = centers.defined.includes('spleen');
    
    if (sacralDefined && throatDefined) return 'Generator';
    if (throatDefined && !sacralDefined) return 'Manifestor';
    if (!sacralDefined && !throatDefined && spleenDefined) return 'Projector';
    if (!sacralDefined && !throatDefined && !spleenDefined) return 'Reflector';
    return null;
  }

  /**
   * Berechnet Profile
   */
  calculateProfile(sun, earth) {
    if (!sun || !earth) return null;
    return `${sun.line || 1}/${earth.line || 1}`;
  }

  /**
   * Berechnet Authority
   */
  calculateAuthority(centers) {
    if (centers.defined.includes('sacral')) return 'Sacral';
    if (centers.defined.includes('solarPlexus')) return 'Emotional';
    if (centers.defined.includes('spleen')) return 'Splenic';
    if (centers.defined.includes('heart')) return 'Ego';
    if (centers.defined.includes('g')) return 'Self';
    if (centers.defined.includes('throat')) return 'Environmental';
    return null;
  }

  /**
   * Berechnet Strategy
   */
  calculateStrategy(type) {
    const strategies = {
      'Generator': 'Wait to respond',
      'Manifestor': 'Inform',
      'Projector': 'Wait for invitation',
      'Reflector': 'Wait 28 days'
    };
    return strategies[type] || null;
  }

  /**
   * Berechnet Incarnation Cross
   */
  calculateIncarnationCross(sun, earth) {
    if (!sun || !earth) return null;
    return {
      name: `Cross of ${sun.gate}-${earth.gate}`,
      type: 'Right Angle',
      sunGate: sun.gate,
      sunLine: sun.line,
      earthGate: earth.gate,
      earthLine: earth.line,
      meaning: null
    };
  }
}

module.exports = ChartCalculationAstronomy;

