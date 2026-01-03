/**
 * Reading Service
 * 
 * Zentrale Service-Schicht für Reading-Operationen
 * Garantiert ID-Konsistenz und saubere Service-Grenzen
 */

import { ReadingResponse, ReadingErrorResponse, ReadingType } from '../../api-routes/reading-response-types';

export interface GenerateReadingInput {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  readingType?: ReadingType;
  userId?: string;
  // Für Compatibility Reading
  birthDate2?: string;
  birthTime2?: string;
  birthPlace2?: string;
}

export interface ReadingStatus {
  readingId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  statusHistory?: Array<{
    oldStatus: string | null;
    newStatus: string;
    changedBy: string;
    changedAt: string;
    reason?: string;
  }>;
}

/**
 * Generiert ein neues Reading
 * 
 * @param input - Reading-Input-Daten
 * @returns Reading-Response mit Reading-ID
 */
export async function generateReading(
  input: GenerateReadingInput
): Promise<ReadingResponse | ReadingErrorResponse> {
  try {
    const response = await fetch('/api/reading/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    // Prüfe Content-Type bevor JSON parsen
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('API returned non-JSON:', {
        status: response.status,
        statusText: response.statusText,
        contentType,
        body: text.substring(0, 200)
      });
      throw new Error(`API-Fehler: Server antwortete nicht mit JSON. Status: ${response.status}`);
    }

    const data = await response.json();

    if (!response.ok) {
      return data as ReadingErrorResponse;
    }

    return data as ReadingResponse;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to generate reading',
      code: 'NETWORK_ERROR',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Ruft den Status eines Readings ab
 * 
 * @param readingId - Reading-ID
 * @returns Reading-Status
 */
export async function getReadingStatus(readingId: string): Promise<ReadingStatus | null> {
  try {
    const response = await fetch(`/api/readings/${readingId}/status`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.status as ReadingStatus;
  } catch (error) {
    console.error('Failed to get reading status:', error);
    return null;
  }
}

/**
 * Pollt den Status eines Readings bis es completed oder failed ist
 * 
 * @param readingId - Reading-ID
 * @param interval - Polling-Intervall in ms (default: 1000)
 * @param maxAttempts - Maximale Anzahl Versuche (default: 60)
 * @returns Reading-Status (completed oder failed)
 */
export async function pollReadingStatus(
  readingId: string,
  interval: number = 1000,
  maxAttempts: number = 60
): Promise<ReadingStatus | null> {
  let attempts = 0;

  return new Promise((resolve) => {
    const poll = async () => {
      attempts++;

      const status = await getReadingStatus(readingId);

      if (!status) {
        if (attempts >= maxAttempts) {
          resolve(null);
          return;
        }
        setTimeout(poll, interval);
        return;
      }

      if (status.status === 'completed' || status.status === 'failed') {
        resolve(status);
        return;
      }

      if (attempts >= maxAttempts) {
        resolve(status); // Return current status even if not completed
        return;
      }

      setTimeout(poll, interval);
    };

    poll();
  });
}

/**
 * Ruft ein Reading anhand seiner ID ab
 * 
 * @param readingId - Reading-ID
 * @param userId - User-ID (optional, für RLS)
 * @returns Reading-Response
 */
export async function getReadingById(
  readingId: string,
  userId?: string
): Promise<ReadingResponse | ReadingErrorResponse | null> {
  try {
    const params = new URLSearchParams();
    if (userId) {
      params.append('userId', userId);
    }

    const response = await fetch(`/api/readings/${readingId}?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      return error as ReadingErrorResponse;
    }

    const data = await response.json();
    return data.reading as ReadingResponse;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get reading',
      code: 'NETWORK_ERROR',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Ruft die Reading-History eines Users ab
 * 
 * @param userId - User-ID
 * @param options - Optionale Parameter (limit, offset, filter, search)
 * @returns Liste von Readings
 */
export async function getReadingHistory(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    readingType?: ReadingType;
    searchTerm?: string;
  }
): Promise<{
  readings: ReadingResponse[];
  total: number;
  limit: number;
  offset: number;
} | null> {
  try {
    const params = new URLSearchParams({
      userId,
      limit: (options?.limit || 50).toString(),
      offset: (options?.offset || 0).toString(),
    });

    if (options?.readingType) {
      params.append('readingType', options.readingType);
    }

    if (options?.searchTerm) {
      params.append('searchTerm', options.searchTerm);
    }

    const response = await fetch(`/api/readings/history?${params.toString()}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      readings: data.readings || [],
      total: data.total || 0,
      limit: data.limit || 50,
      offset: data.offset || 0,
    };
  } catch (error) {
    console.error('Failed to get reading history:', error);
    return null;
  }
}

