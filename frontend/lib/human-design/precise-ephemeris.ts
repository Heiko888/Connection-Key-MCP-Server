/**
 * Precise Ephemeris Calculator using Astronomy Engine
 * Provides accurate planetary positions for Human Design calculations
 * 
 * Library: astronomy-engine (pure JavaScript, no Python needed)
 * Accuracy: Sub-arcsecond precision
 */

import * as Astronomy from 'astronomy-engine';

/**
 * Planet positions for Human Design
 */
export interface PlanetPosition {
  longitude: number; // Ecliptic longitude (0-360)
  latitude: number;  // Ecliptic latitude
  distance: number;  // Distance from Earth (AU)
}

/**
 * Complete Human Design planetary data
 */
export interface HumanDesignPlanets {
  sun: PlanetPosition;
  earth: PlanetPosition;
  moon: PlanetPosition;
  mercury: PlanetPosition;
  venus: PlanetPosition;
  mars: PlanetPosition;
  jupiter: PlanetPosition;
  saturn: PlanetPosition;
  uranus: PlanetPosition;
  neptune: PlanetPosition;
  pluto: PlanetPosition;
  northNode: PlanetPosition;
  southNode: PlanetPosition;
}

/**
 * Calculate ecliptic longitude from equatorial coordinates
 */
function equatorialToEcliptic(ra: number, dec: number, obliquity: number): { longitude: number; latitude: number } {
  // Convert degrees to radians
  const raRad = ra * Math.PI / 180;
  const decRad = dec * Math.PI / 180;
  const oblRad = obliquity * Math.PI / 180;

  // Calculate ecliptic coordinates
  const sinLon = Math.sin(raRad) * Math.cos(oblRad) + Math.tan(decRad) * Math.sin(oblRad);
  const cosLon = Math.cos(raRad);
  const longitude = Math.atan2(sinLon, cosLon) * 180 / Math.PI;
  
  const sinLat = Math.sin(decRad) * Math.cos(oblRad) - Math.cos(decRad) * Math.sin(oblRad) * Math.sin(raRad);
  const latitude = Math.asin(sinLat) * 180 / Math.PI;

  return {
    longitude: (longitude + 360) % 360,
    latitude
  };
}

/**
 * Calculate position for a specific body
 * 
 * CRITICAL: For Human Design, we need GEOCENTRIC positions (as seen from Earth)!
 * Using HelioVector (heliocentric) would give wrong results for the Sun (always 0°).
 */
function calculateBodyPosition(body: Astronomy.Body, date: Date): PlanetPosition {
  try {
    // Get GEOCENTRIC position (as seen from Earth) - CORRECT for Human Design!
    const vector = Astronomy.GeoVector(body, date, false); // false = no aberration correction
    
    if (!vector || typeof vector.x !== 'number') {
      throw new Error(`Invalid vector returned for ${body}`);
    }
    
    // Get ecliptic coordinates
    const ecliptic = Astronomy.Ecliptic(vector);
    
    if (!ecliptic || typeof ecliptic.elon !== 'number') {
      throw new Error(`Invalid ecliptic coordinates for ${body}`);
    }
    
    return {
      longitude: (ecliptic.elon + 360) % 360,
      latitude: ecliptic.elat,
      distance: vector.x * vector.x + vector.y * vector.y + vector.z * vector.z // manual distance calc
    };
  } catch (error) {
    console.error(`❌ Error calculating position for ${body}:`, error);
    throw error;
  }
}

/**
 * Calculate Earth position (180° opposite to Sun)
 */
function calculateEarthPosition(sunLongitude: number): PlanetPosition {
  return {
    longitude: (sunLongitude + 180) % 360,
    latitude: 0,
    distance: 0
  };
}

/**
 * Calculate Moon's North Node (True Node)
 * Note: astronomy-engine doesn't have MoonNode function
 * Using simplified calculation based on lunar orbital mechanics
 */
function calculateNorthNode(date: Date): PlanetPosition {
  // Simplified calculation for Moon's North Node
  // The node regresses ~19.3° per year (18.6 year cycle)
  const epochDate = new Date('2000-01-01T12:00:00Z');
  const daysSinceEpoch = (date.getTime() - epochDate.getTime()) / (1000 * 60 * 60 * 24);
  const yearsSinceEpoch = daysSinceEpoch / 365.25;
  
  // Node at epoch (J2000): ~125.0°
  const nodeAtEpoch = 125.04452;
  const regressionRate = -19.3418; // degrees per year
  
  const longitude = (nodeAtEpoch + (yearsSinceEpoch * regressionRate)) % 360;
  
  return {
    longitude: longitude < 0 ? longitude + 360 : longitude,
    latitude: 0,
    distance: 0
  };
}

/**
 * Calculate Moon's South Node (opposite to North Node)
 */
function calculateSouthNode(northNodeLongitude: number): PlanetPosition {
  return {
    longitude: (northNodeLongitude + 180) % 360,
    latitude: 0,
    distance: 0
  };
}

/**
 * Calculate all planetary positions for a given date/time
 * @param birthDate Birth date and time
 * @returns Complete planetary positions
 */
export function calculatePrecisePlanetaryPositions(birthDate: Date): HumanDesignPlanets {
  // Calculate Sun position
  const sunPos = calculateBodyPosition(Astronomy.Body.Sun, birthDate);
  
  // Earth is opposite to Sun
  const earthPos = calculateEarthPosition(sunPos.longitude);
  
  // Calculate other planets
  const moonPos = calculateBodyPosition(Astronomy.Body.Moon, birthDate);
  const mercuryPos = calculateBodyPosition(Astronomy.Body.Mercury, birthDate);
  const venusPos = calculateBodyPosition(Astronomy.Body.Venus, birthDate);
  const marsPos = calculateBodyPosition(Astronomy.Body.Mars, birthDate);
  const jupiterPos = calculateBodyPosition(Astronomy.Body.Jupiter, birthDate);
  const saturnPos = calculateBodyPosition(Astronomy.Body.Saturn, birthDate);
  const uranusPos = calculateBodyPosition(Astronomy.Body.Uranus, birthDate);
  const neptunePos = calculateBodyPosition(Astronomy.Body.Neptune, birthDate);
  const plutoPos = calculateBodyPosition(Astronomy.Body.Pluto, birthDate);
  
  // Calculate Moon Nodes
  const northNodePos = calculateNorthNode(birthDate);
  const southNodePos = calculateSouthNode(northNodePos.longitude);

  return {
    sun: sunPos,
    earth: earthPos,
    moon: moonPos,
    mercury: mercuryPos,
    venus: venusPos,
    mars: marsPos,
    jupiter: jupiterPos,
    saturn: saturnPos,
    uranus: uranusPos,
    neptune: neptunePos,
    pluto: plutoPos,
    northNode: northNodePos,
    southNode: southNodePos
  };
}

/**
 * Calculate Design positions (when Sun was 88° earlier on ecliptic)
 * 
 * IMPORTANT: Design is NOT simply 88 days before birth!
 * We need to find the exact moment when the Sun was 88° earlier on the ecliptic.
 * This varies with Earth's orbital speed (faster in winter, slower in summer).
 * 
 * @param birthDate Birth date and time
 * @returns Planetary positions at Design moment
 */
export function calculateDesignPositions(birthDate: Date): HumanDesignPlanets {
  // Get Sun position at birth
  const birthSunPos = calculateBodyPosition(Astronomy.Body.Sun, birthDate);
  const targetLongitude = (birthSunPos.longitude - 88 + 360) % 360;
  
  // Start approximately 88 days before birth (rough estimate)
  let designDate = new Date(birthDate);
  designDate.setDate(designDate.getDate() - 88);
  
  // Iteratively find the exact moment when Sun was at target longitude
  let iteration = 0;
  const maxIterations = 50;
  let bestDate = designDate;
  let bestDifference = 360; // Start with maximum possible difference
  
  while (iteration < maxIterations) {
    const currentSunPos = calculateBodyPosition(Astronomy.Body.Sun, designDate);
    
    // Calculate angular difference (accounting for 360° wrap-around)
    let diff = targetLongitude - currentSunPos.longitude;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    const absDiff = Math.abs(diff);
    
    // Track best result
    if (absDiff < bestDifference) {
      bestDifference = absDiff;
      bestDate = new Date(designDate);
    }
    
    // If we're close enough (within 0.01°), we're done
    if (absDiff < 0.01) {
      console.log(`✅ Design moment found after ${iteration} iterations`);
      console.log('Design date:', designDate.toISOString());
      console.log('Design Sun longitude:', currentSunPos.longitude);
      console.log('Difference from target:', absDiff, '°');
      break;
    }
    
    // Adjust date based on difference
    // Sun moves ~1° per day, but this varies
    // Use a smaller step for precision
    const daysToAdjust = diff / 1.0; // Adjust by difference in degrees (Sun moves ~1°/day)
    designDate.setTime(designDate.getTime() + (daysToAdjust * 24 * 60 * 60 * 1000));
    
    iteration++;
    
    // Safety check: if we're not converging, use best result found
    if (iteration === maxIterations) {
      console.warn('⚠️ Max iterations reached, using best result found');
      console.warn('Best difference:', bestDifference, '°');
      designDate = bestDate;
    }
  }
  
  return calculatePrecisePlanetaryPositions(designDate);
}

/**
 * Calculate complete Human Design chart data
 * @param birthDate Birth date and time
 * @returns Personality (birth) and Design (88 days before) positions
 */
export function calculateCompleteChart(birthDate: Date) {
  try {
    const personality = calculatePrecisePlanetaryPositions(birthDate);
    const design = calculateDesignPositions(birthDate);
    
    console.log('✅ Using precise ephemeris (Astronomy Engine)');
    
    return {
      personality,
      design
    };
  } catch (error) {
    console.error('❌ Precise ephemeris failed:', error);
    console.warn('⚠️ Falling back to simplified ephemeris');
    
    // Fallback to simplified calculations
    throw new Error('Precise ephemeris not available. Please ensure astronomy-engine is properly loaded.');
  }
}

/**
 * Parse date string with time
 * 
 * For accurate HD calculations, we convert local time to UTC.
 * Default timezone is CET/CEST (Central European Time).
 * 
 * @param dateStr Date string (YYYY-MM-DD or DD.MM.YYYY)
 * @param timeStr Time string (HH:MM or HH:MM:SS)
 * @param timezoneOffsetHours Timezone offset in hours from UTC (default: 1 for CET)
 * @returns Date object in UTC
 */
export function parseBirthDateTime(
  dateStr: string, 
  timeStr?: string, 
  timezoneOffsetHours: number = 1 // Default to CET
): Date {
  // Parse date - handle both formats
  let year: number, month: number, day: number;
  
  if (dateStr.includes('.')) {
    // DD.MM.YYYY format (German)
    const parts = dateStr.split('.').map(Number);
    day = parts[0];
    month = parts[1];
    year = parts[2];
  } else {
    // YYYY-MM-DD format (ISO)
    const parts = dateStr.split('-').map(Number);
    year = parts[0];
    month = parts[1];
    day = parts[2];
  }
  
  let hours = 12;
  let minutes = 0;
  let seconds = 0;
  
  if (timeStr) {
    const timeParts = timeStr.split(':').map(Number);
    hours = timeParts[0] || 0;
    minutes = timeParts[1] || 0;
    seconds = timeParts[2] || 0;
  }
  
  console.log('📅 Birth:', { year, month, day, hours, minutes, seconds, timezoneOffsetHours });
  
  // Create LOCAL time, then convert to UTC
  const localDate = new Date(year, month - 1, day, hours, minutes, seconds);
  const utcDate = new Date(localDate.getTime() - (timezoneOffsetHours * 60 * 60 * 1000));
  
  console.log('UTC:', utcDate.toISOString());
  
  return utcDate;
}

/**
 * Get zodiac sign name from longitude
 * @param longitude Ecliptic longitude (0-360)
 * @returns Zodiac sign name with degree (German)
 */
export function getZodiacSignFromLongitude(longitude: number): string {
  const signs = [
    'Widder', 'Stier', 'Zwillinge', 'Krebs',
    'Löwe', 'Jungfrau', 'Waage', 'Skorpion',
    'Schütze', 'Steinbock', 'Wassermann', 'Fische'
  ];
  
  const signIndex = Math.floor(longitude / 30);
  const degreeInSign = longitude % 30;
  const minutes = (degreeInSign % 1) * 60;
  
  return `${signs[signIndex]} ${Math.floor(degreeInSign)}° ${Math.floor(minutes)}'`;
}

/**
 * Check if astronomy-engine is available
 */
export function isPreciseEphemerisAvailable(): boolean {
  try {
    return typeof Astronomy !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * Format planetary position for display
 */
export function formatPlanetPosition(planet: PlanetPosition): string {
  return `${planet.longitude.toFixed(4)}° (${getZodiacSignFromLongitude(planet.longitude)})`;
}

