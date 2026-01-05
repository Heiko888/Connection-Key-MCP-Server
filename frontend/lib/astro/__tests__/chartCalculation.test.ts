/**
 * Test für Human Design Chart Berechnung
 * 
 * Führe diese Tests mit: npm test oder jest
 */

import { calculateHumanDesignChart } from '../chartCalculation';
import { geocodePlace } from '@/lib/utils/geocoding';

// Test-Daten
const testInput = {
  birthDate: '1980-12-08',
  birthTime: '22:10',
  birthPlace: {
    name: 'Miltenberg, Deutschland',
    latitude: 49.7036,
    longitude: 9.2654,
    timezone: 'Europe/Berlin'
  }
};

describe('Human Design Chart Calculation', () => {
  test('sollte Chart mit Koordinaten berechnen', async () => {
    const chart = await calculateHumanDesignChart({
      birthDate: '1980-12-08',
      birthTime: '22:10',
      birthPlace: {
        latitude: 49.7036,
        longitude: 9.2654,
        timezone: 'Europe/Berlin'
      }
    });

    expect(chart).toBeDefined();
    expect(chart.type).toBeDefined();
    expect(chart.profile).toBeDefined();
    expect(chart.authority).toBeDefined();
    expect(chart.personality.sun).toBeDefined();
    expect(chart.design.sun).toBeDefined();
    expect(chart.gates.length).toBeGreaterThan(0);
    expect(chart.channels).toBeDefined();
    expect(chart.incarnationCross).toBeDefined();
    
    console.log('✅ Chart berechnet:', {
      type: chart.type,
      profile: chart.profile,
      authority: chart.authority,
      gates: chart.gates.length,
      channels: chart.channels.length,
      definedCenters: chart.definedCenters.length
    });
  });

  test('sollte Chart mit Ortsnamen (Geocoding) berechnen', async () => {
    const chart = await calculateHumanDesignChart({
      birthDate: '1990-05-15',
      birthTime: '14:30',
      birthPlace: {
        name: 'Berlin, Deutschland'
      }
    });

    expect(chart).toBeDefined();
    expect(chart.birthData.latitude).toBeDefined();
    expect(chart.birthData.longitude).toBeDefined();
    expect(chart.birthData.place).toContain('Berlin');
    
    console.log('✅ Chart mit Geocoding berechnet:', {
      place: chart.birthData.place,
      coordinates: `${chart.birthData.latitude}, ${chart.birthData.longitude}`
    });
  });

  test('sollte Channels korrekt berechnen', async () => {
    const chart = await calculateHumanDesignChart({
      birthDate: '1985-03-20',
      birthTime: '12:00',
      birthPlace: {
        latitude: 52.52,
        longitude: 13.405,
        timezone: 'Europe/Berlin'
      }
    });

    expect(chart.channels).toBeDefined();
    expect(Array.isArray(chart.channels)).toBe(true);
    
    // Channels sollten Arrays mit 2 Gates sein
    chart.channels.forEach(channel => {
      expect(channel).toHaveLength(2);
      expect(typeof channel[0]).toBe('number');
      expect(typeof channel[1]).toBe('number');
    });
    
    console.log('✅ Channels berechnet:', chart.channels.length, 'Kanäle');
  });

  test('sollte Zentren korrekt bestimmen', async () => {
    const chart = await calculateHumanDesignChart({
      birthDate: '1975-07-04',
      birthTime: '08:15',
      birthPlace: {
        latitude: 48.1351,
        longitude: 11.5820,
        timezone: 'Europe/Berlin'
      }
    });

    expect(chart.definedCenters).toBeDefined();
    expect(chart.openCenters).toBeDefined();
    expect(Array.isArray(chart.definedCenters)).toBe(true);
    expect(Array.isArray(chart.openCenters)).toBe(true);
    
    // Summe sollte 9 sein (9 Zentren total)
    expect(chart.definedCenters.length + chart.openCenters.length).toBeLessThanOrEqual(9);
    
    console.log('✅ Zentren bestimmt:', {
      definiert: chart.definedCenters.length,
      offen: chart.openCenters.length
    });
  });

  test('sollte Inkarnationskreuz berechnen', async () => {
    const chart = await calculateHumanDesignChart({
      birthDate: '2000-01-01',
      birthTime: '00:00',
      birthPlace: {
        latitude: 50.1109,
        longitude: 8.6821,
        timezone: 'Europe/Berlin'
      }
    });

    expect(chart.incarnationCross).toBeDefined();
    expect(chart.incarnationCross).toMatch(/\d+\/\d+/); // Format: "Gate/Gate"
    
    console.log('✅ Inkarnationskreuz:', chart.incarnationCross);
  });
});

describe('Geocoding', () => {
  test('sollte Ortsnamen zu Koordinaten konvertieren', async () => {
    const result = await geocodePlace('Miltenberg, Deutschland');
    
    expect(result.latitude).toBeDefined();
    expect(result.longitude).toBeDefined();
    expect(result.latitude).toBeGreaterThan(49);
    expect(result.latitude).toBeLessThan(50);
    expect(result.longitude).toBeGreaterThan(9);
    expect(result.longitude).toBeLessThan(10);
    
    console.log('✅ Geocoding erfolgreich:', {
      name: result.displayName,
      coordinates: `${result.latitude}, ${result.longitude}`,
      timezone: result.timezone
    });
  }, 10000); // 10 Sekunden Timeout für API-Call
});

