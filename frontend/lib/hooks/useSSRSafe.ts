import { useState, useEffect } from 'react';
import { isProduction, getProductionSafeDate, getProductionRandom } from '@/lib/utils/productionSSR';

/**
 * SSR-sicherer Hook für Client-spezifische Werte
 * Verhindert Hydration-Mismatch zwischen Server und Client
 */
export function useSSRSafe<T>(serverValue: T, clientValue: T): T {
  const [isClient, setIsClient] = useState(false);
  const [value, setValue] = useState(serverValue);

  useEffect(() => {
    setIsClient(true);
    setValue(clientValue);
  }, [clientValue]);

  return isClient ? value : serverValue;
}

/**
 * SSR-sichere Datum-Berechnung
 * Verwendet feste Zeitzone für konsistente Ergebnisse
 */
export function useSSRSafeDate(): string {
  const [date, setDate] = useState('');

  useEffect(() => {
    // Production: Immer UTC verwenden für Konsistenz
    if (isProduction) {
      setDate(getProductionSafeDate());
    } else {
      const now = new Date();
      const utcDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
      setDate(utcDate.toISOString().split('T')[0]);
    }
  }, []);

  return date;
}

/**
 * SSR-sichere Zufallszahl
 * Verwendet deterministische Werte für SSR-Konsistenz
 */
export function useSSRSafeRandom(seed: string = 'default'): number {
  const [random, setRandom] = useState(0);

  useEffect(() => {
    // Production: Immer deterministische Werte
    if (isProduction) {
      setRandom(getProductionRandom(seed));
    } else {
      // Development: Einfacher Hash für deterministische "Zufallszahl"
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      setRandom(Math.abs(hash) / 2147483647); // Normalize to 0-1
    }
  }, [seed]);

  return random;
}

/**
 * SSR-sichere Client-Only Komponente
 * Rendert nur auf dem Client, verhindert Hydration-Mismatch
 */
export function useClientOnly(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
