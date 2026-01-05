/**
 * Legacy Reading Mapper
 * 
 * Transformiert Legacy-Reading-Daten in V2-Format
 * Für Migration von /api/readings (POST) zu /api/coach/readings-v2/create
 */

export interface LegacyReadingData {
  userId?: string;
  title?: string;
  question?: string;
  category?: string;
  datingType?: string;
  birthdate: string;
  birthtime?: string;
  birthplace: string;
  email?: string;
  phone?: string;
  // Connection Key spezifisch
  type?: string;
  name1?: string;
  name2?: string;
  person2?: {
    name: string;
    birthdate: string;
    birthtime?: string;
    birthplace: string;
    email?: string;
  };
  notes?: string;
}

export interface V2ReadingRequest {
  readingType: string;
  input: Record<string, any>;
  promptVersion?: string;
}

/**
 * Mappt Legacy-Reading-Daten zu V2-Format
 */
export function mapLegacyToV2(legacyData: LegacyReadingData): V2ReadingRequest | null {
  // Connection Key Reading
  if (legacyData.type === 'connectionKey' || legacyData.category === 'connection-key' || legacyData.name1 && legacyData.name2) {
    return {
      readingType: 'connection',
      input: {
        personA: {
          name: legacyData.name1 || legacyData.title?.split(' & ')[0] || 'Person A',
          birthDate: legacyData.birthdate,
          birthTime: legacyData.birthtime || undefined,
          birthPlace: legacyData.birthplace,
        },
        personB: {
          name: legacyData.name2 || legacyData.person2?.name || legacyData.title?.split(' & ')[1] || 'Person B',
          birthDate: legacyData.person2?.birthdate || legacyData.birthdate,
          birthTime: legacyData.person2?.birthtime || legacyData.birthtime || undefined,
          birthPlace: legacyData.person2?.birthplace || legacyData.birthplace,
        },
        connectionQuestion: legacyData.question || legacyData.notes || undefined,
      },
    };
  }

  // Human Design Reading (Standard)
  // Bestimme focusArea aus category
  let focusArea = 'personal';
  if (legacyData.category) {
    if (legacyData.category.includes('business') || legacyData.category.includes('career')) {
      focusArea = 'business';
    } else if (legacyData.category.includes('relationship') || legacyData.category.includes('dating')) {
      focusArea = 'relationship';
    }
  }

  // Extrahiere Client-Name aus title oder verwende Standard
  const clientName = legacyData.title 
    ? legacyData.title.replace('Human Design Reading: ', '').replace('Reading: ', '').trim()
    : 'Klient';

  return {
    readingType: 'basic',
    input: {
      clientName: clientName,
      birthDate: legacyData.birthdate,
      birthTime: legacyData.birthtime || undefined,
      birthPlace: legacyData.birthplace || undefined,
      focusArea: focusArea,
      question: legacyData.question || undefined,
    },
  };
}

/**
 * Mappt V2-Response zu Legacy-Format (für Kompatibilität)
 */
export function mapV2ToLegacy(v2Response: {
  success: boolean;
  readingId?: string;
  jobId?: string;
  status?: string;
  reading?: any;
}): {
  reading: {
    id: string;
    status: string;
    [key: string]: any;
  };
} {
  if (v2Response.success && v2Response.readingId) {
    return {
      reading: {
        id: v2Response.readingId,
        status: v2Response.status || 'pending',
        jobId: v2Response.jobId,
      },
    };
  }

  // Fallback für Fehler
  return {
    reading: {
      id: v2Response.reading?.id || '',
      status: v2Response.reading?.status || 'error',
      errorMessage: v2Response.reading?.errorMessage || 'Unbekannter Fehler',
    },
  };
}

