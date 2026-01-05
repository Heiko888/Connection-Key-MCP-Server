/**
 * Geocoding Service für Geburtsorte
 * Verwendet OpenStreetMap Nominatim API (kostenlos, keine API-Key erforderlich)
 */

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  timezone?: string;
  displayName: string;
}

/**
 * Konvertiert einen Ortsnamen in Koordinaten
 * @param placeName - Ortsname (z.B. "Berlin, Deutschland" oder "Miltenberg")
 * @returns GeocodeResult mit Koordinaten und Timezone
 */
export async function geocodePlace(placeName: string): Promise<GeocodeResult> {
  if (!placeName || placeName.trim() === '') {
    throw new Error('Ortsname darf nicht leer sein');
  }

  try {
    // OpenStreetMap Nominatim API
    const encodedPlace = encodeURIComponent(placeName);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedPlace}&format=json&limit=1&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'The-Connection-Key-App/1.0' // Nominatim erfordert User-Agent
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding API Fehler: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error(`Keine Koordinaten für "${placeName}" gefunden`);
    }

    const result = data[0];
    const latitude = parseFloat(result.lat);
    const longitude = parseFloat(result.lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Ungültige Koordinaten von Geocoding API erhalten');
    }

    // Versuche Timezone zu bestimmen (vereinfacht - könnte erweitert werden)
    const timezone = estimateTimezone(latitude, longitude);

    return {
      latitude,
      longitude,
      timezone,
      displayName: result.display_name || placeName
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Geocoding Fehler: ${String(error)}`);
  }
}

/**
 * Schätzt die Timezone basierend auf Koordinaten
 * Vereinfachte Implementierung - könnte mit tz-lookup Bibliothek erweitert werden
 */
function estimateTimezone(latitude: number, longitude: number): string {
  // Grobe Schätzung basierend auf Längengrad
  // 1 Stunde = 15 Grad
  const offsetHours = Math.round(longitude / 15);
  
  // Bekannte Timezones für häufige Regionen
  if (latitude >= 47 && latitude <= 55 && longitude >= 5 && longitude <= 15) {
    return 'Europe/Berlin'; // Deutschland, Österreich, Schweiz
  }
  if (latitude >= 40 && latitude <= 50 && longitude >= -10 && longitude <= 10) {
    return 'Europe/London'; // UK, Irland
  }
  if (latitude >= 35 && latitude <= 45 && longitude >= -10 && longitude <= 5) {
    return 'Europe/Paris'; // Frankreich, Spanien
  }
  if (latitude >= 25 && latitude <= 50 && longitude >= -125 && longitude <= -65) {
    // USA - vereinfacht
    if (longitude >= -90) return 'America/New_York';
    if (longitude >= -105) return 'America/Chicago';
    if (longitude >= -120) return 'America/Denver';
    return 'America/Los_Angeles';
  }
  
  // Fallback: UTC basierend auf Längengrad
  return `UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}`;
}

/**
 * Validiert und normalisiert Koordinaten
 */
export function validateCoordinates(latitude: number, longitude: number): boolean {
  return (
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

