/**
 * Simplified Ephemeris Calculator
 * Provides approximate planetary positions for Human Design calculations
 * 
 * IMPORTANT: This is a simplified calculation for demonstration purposes.
 * For production use, integrate a proper ephemeris library like:
 * - swiss-ephemeris
 * - astronomy-engine
 * - moshier (lightweight alternative)
 */

/**
 * Calculate approximate Sun position (ecliptic longitude) from date
 * Uses simplified formula based on day of year
 * Accuracy: ±2-3 degrees (sufficient for gate demonstration, not for production)
 * 
 * @param date Birth date
 * @returns Approximate Sun longitude in degrees (0-360)
 */
export function calculateApproximateSunPosition(date: Date): number {
  // Get day of year (1-365/366)
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Spring Equinox (0° Aries) is approximately March 20 (day 79)
  const springEquinoxDay = 79;
  
  // Sun moves approximately 360° / 365.25 days ≈ 0.9856° per day
  const degreesPerDay = 360 / 365.25;
  
  // Calculate degrees from spring equinox
  const daysSinceEquinox = dayOfYear - springEquinoxDay;
  const longitude = (daysSinceEquinox * degreesPerDay) % 360;
  
  // Normalize to 0-360
  return longitude < 0 ? longitude + 360 : longitude;
}

/**
 * Calculate Earth position (opposite to Sun, 180° difference)
 * @param sunLongitude Sun's ecliptic longitude
 * @returns Earth longitude in degrees (0-360)
 */
export function calculateEarthPosition(sunLongitude: number): number {
  return (sunLongitude + 180) % 360;
}

/**
 * Calculate Design Sun position (88° before Personality Sun)
 * In Human Design, Design happens approximately 88 days (~88°) before birth
 * @param personalitySun Personality Sun longitude
 * @returns Design Sun longitude in degrees (0-360)
 */
export function calculateDesignSun(personalitySun: number): number {
  const designSun = personalitySun - 88;
  return designSun < 0 ? designSun + 360 : designSun;
}

/**
 * Calculate Design Earth position (opposite to Design Sun)
 * @param designSun Design Sun longitude
 * @returns Design Earth longitude in degrees (0-360)
 */
export function calculateDesignEarth(designSun: number): number {
  return (designSun + 180) % 360;
}

/**
 * Get zodiac sign from ecliptic longitude
 * @param longitude Ecliptic longitude (0-360)
 * @returns Zodiac sign name (German)
 */
export function getZodiacSign(longitude: number): string {
  const signs = [
    'Widder', 'Stier', 'Zwillinge', 'Krebs',
    'Löwe', 'Jungfrau', 'Waage', 'Skorpion',
    'Schütze', 'Steinbock', 'Wassermann', 'Fische'
  ];
  const signIndex = Math.floor(longitude / 30);
  const degreeInSign = longitude % 30;
  
  return `${signs[signIndex]} ${degreeInSign.toFixed(1)}°`;
}

/**
 * Calculate simplified moon position (very approximate!)
 * Moon moves ~13° per day
 * NOTE: This is extremely simplified and should NOT be used for production
 */
export function calculateApproximateMoonPosition(date: Date): number {
  const daysSinceEpoch = date.getTime() / (1000 * 60 * 60 * 24);
  // Moon orbital period: ~27.3 days
  const lunarCycle = 27.321661;
  const degreesPerDay = 360 / lunarCycle;
  
  // Arbitrary starting position (not astronomically accurate)
  const startPosition = 0;
  const moonPosition = (startPosition + (daysSinceEpoch * degreesPerDay)) % 360;
  
  return moonPosition;
}

/**
 * Simplified planetary positions (placeholder - not astronomically accurate)
 * For production, use proper ephemeris
 */
export function calculateApproximatePlanetaryPositions(date: Date) {
  const sunLongitude = calculateApproximateSunPosition(date);
  const earthLongitude = calculateEarthPosition(sunLongitude);
  const designSunLongitude = calculateDesignSun(sunLongitude);
  const designEarthLongitude = calculateDesignEarth(designSunLongitude);
  const moonLongitude = calculateApproximateMoonPosition(date);
  
  // Very simplified positions for other planets (NOT ACCURATE - just for demo)
  // In production, use proper ephemeris!
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    // Personality (birth moment)
    personality: {
      sun: sunLongitude,
      earth: earthLongitude,
      moon: moonLongitude,
      mercury: (sunLongitude + 15) % 360, // Very rough approximation
      venus: (sunLongitude + 30) % 360,
      mars: (sunLongitude + 45) % 360,
    },
    // Design (88 days before birth)
    design: {
      sun: designSunLongitude,
      earth: designEarthLongitude,
      moon: (moonLongitude - 88 * 13) % 360,
      mercury: (sunLongitude - 88 + 15) % 360,
      venus: (sunLongitude - 88 + 30) % 360,
      mars: (sunLongitude - 88 + 45) % 360,
    }
  };
}

/**
 * Warning message for users about accuracy
 */
export const EPHEMERIS_DISCLAIMER = `
⚠️ HINWEIS: Diese Berechnungen verwenden eine vereinfachte Formel und sind 
nur für Demonstrationszwecke geeignet. Für präzise Human Design Readings 
sollten professionelle Ephemeris-Daten (z.B. Swiss Ephemeris) verwendet werden.

Abweichung: ±2-3 Grad für Sonne, größere Abweichungen für andere Planeten.
`;

/**
 * Check if ephemeris library is available
 */
export function isProperEphemerisAvailable(): boolean {
  // Swiss-ephemeris is not installed (needs Python)
  // We use astronomy-engine instead
  return false;
}

