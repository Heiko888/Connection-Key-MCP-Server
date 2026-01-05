import { useState, useEffect } from 'react';

/**
 * Hook to safely access localStorage and window objects
 * Prevents hydration mismatches between server and client
 */
export function useHydrationSafe() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const safeLocalStorage = {
    getItem: (key: string) => {
      if (!isClient) return null;
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      if (!isClient) return;
      try {
        localStorage.setItem(key, value);
      } catch {
        // Silently fail
      }
    },
    removeItem: (key: string) => {
      if (!isClient) return;
      try {
        localStorage.removeItem(key);
      } catch {
        // Silently fail
      }
    }
  };

  const safeWindow = {
    location: isClient ? window.location : null,
    navigator: isClient ? window.navigator : null,
    innerWidth: isClient ? window.innerWidth : 0,
    innerHeight: isClient ? window.innerHeight : 0
  };

  return {
    isClient,
    localStorage: safeLocalStorage,
    window: safeWindow
  };
}

/**
 * Hook for deterministic random values
 * Uses a seed-based approach to ensure consistent values
 */
export function useDeterministicRandom(seed: string = 'default') {
  const [randomValue, setRandomValue] = useState(0);

  useEffect(() => {
    // Simple hash function to create deterministic "random" values
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    setRandomValue(Math.abs(hash) / 2147483647); // Normalize to 0-1
  }, [seed]);

  return randomValue;
}
