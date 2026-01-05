/**
 * Production-sichere SSR-Utilities für Hetzner
 * Behandelt Unterschiede zwischen Development und Production
 */

export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Production-sichere Client-Detection
 * Verwendet verschiedene Strategien für Dev vs. Prod
 */
export function isClientSide(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Production: Zusätzliche Checks
  if (isProduction) {
    return typeof window !== 'undefined' && 
           typeof window.document !== 'undefined' &&
           typeof window.document.createElement !== 'undefined';
  }
  
  // Development: Standard Check
  return typeof window !== 'undefined';
}

/**
 * Production-sichere Datum-Berechnung
 * Verwendet UTC für konsistente Ergebnisse
 */
export function getProductionSafeDate(): string {
  const now = new Date();
  
  // Production: Immer UTC verwenden
  if (isProduction) {
    return now.toISOString().split('T')[0];
  }
  
  // Development: Lokale Zeit
  return now.toISOString().split('T')[0];
}

/**
 * Production-sichere Random-Werte
 * Verwendet deterministische Seeds
 */
export function getProductionRandom(seed: string = 'default'): number {
  // Einfacher Hash für deterministische Werte
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Production: Immer gleiche Werte für gleiche Seeds
  return Math.abs(hash) / 2147483647;
}

/**
 * Production-sichere Environment-Detection
 */
export function getEnvironmentInfo() {
  return {
    isProduction,
    isDevelopment,
    isClient: isClientSide(),
    nodeEnv: process.env.NODE_ENV,
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    timestamp: isProduction ? getProductionSafeDate() : new Date().toISOString()
  };
}
