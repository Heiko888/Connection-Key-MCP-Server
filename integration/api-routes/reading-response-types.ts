/**
 * Reading Response Types
 * Standardisierte Output-Struktur für Reading-Responses
 */

// Reading-Typ
export type ReadingType = 
  | 'basic'
  | 'detailed'
  | 'business'
  | 'relationship'
  | 'career'
  | 'health'
  | 'parenting'
  | 'spiritual'
  | 'compatibility'
  | 'life-purpose';

// Basis-Reading-Sections (für alle Typen)
export interface ReadingSections {
  overview?: string;
  type?: string;
  strategy?: string;
  authority?: string;
  profile?: string;
}

// Basic Reading Sections
export interface BasicReadingSections extends ReadingSections {
  centers?: {
    defined: string[];
    undefined: string[];
  };
  channels?: string[];
  gates?: string[];
}

// Detailed Reading Sections
export interface DetailedReadingSections {
  overview: string;
  type: {
    name: string;
    description: string;
    characteristics: string[];
  };
  strategy: {
    name: string;
    description: string;
    howTo: string;
  };
  authority: {
    name: string;
    description: string;
    howTo: string;
  };
  profile: {
    line1: number;
    line2: number;
    description: string;
    characteristics: string[];
  };
  centers: {
    defined: Array<{
      name: string;
      description: string;
      characteristics: string[];
    }>;
    undefined: Array<{
      name: string;
      description: string;
      conditioning: string;
    }>;
  };
  channels: Array<{
    name: string;
    description: string;
    gates: string[];
  }>;
  gates: Array<{
    number: number;
    name: string;
    description: string;
  }>;
  incarnationCross: {
    name: string;
    description: string;
    purpose: string;
  };
}

// Business Reading Sections
export interface BusinessReadingSections {
  overview: string;
  careerPath: string;
  workStyle: string;
  strengths: string[];
  challenges: string[];
  idealWorkEnvironment: string;
  leadershipStyle: string;
  decisionMaking: string;
  collaboration: string;
  businessStrategy: string;
}

// Relationship Reading Sections
export interface RelationshipReadingSections {
  overview: string;
  communicationStyle: string;
  needs: string[];
  challenges: string[];
  strengths: string[];
  idealPartner: string;
  relationshipStrategy: string;
  intimacy: string;
  conflictResolution: string;
}

// Career Reading Sections
export interface CareerReadingSections {
  overview: string;
  calling: string;
  careerPath: string;
  idealRoles: string[];
  skills: string[];
  development: string;
  fulfillment: string;
  purpose: string;
}

// Health Reading Sections
export interface HealthReadingSections {
  overview: string;
  healthStrategy: string;
  vulnerabilities: string[];
  strengths: string[];
  nutrition: string;
  exercise: string;
  sleep: string;
  stressManagement: string;
  wellness: string;
}

// Parenting Reading Sections
export interface ParentingReadingSections {
  overview: string;
  parentingStyle: string;
  strengths: string[];
  challenges: string[];
  communication: string;
  boundaries: string;
  support: string;
  familyDynamics: string;
}

// Spiritual Reading Sections
export interface SpiritualReadingSections {
  overview: string;
  spiritualPath: string;
  growth: string;
  awareness: string;
  practices: string[];
  challenges: string[];
  purpose: string;
  connection: string;
}

// Compatibility Reading Sections
export interface CompatibilityReadingSections {
  overview: string;
  person1: {
    type: string;
    strategy: string;
    authority: string;
  };
  person2: {
    type: string;
    strategy: string;
    authority: string;
  };
  compatibility: {
    score: number; // 0-100
    strengths: string[];
    challenges: string[];
    dynamics: string;
  };
  communication: string;
  conflictResolution: string;
  growth: string;
}

// Life Purpose Reading Sections
export interface LifePurposeReadingSections {
  overview: string;
  purpose: string;
  mission: string;
  incarnationCross: {
    name: string;
    description: string;
    purpose: string;
  };
  gifts: string[];
  challenges: string[];
  path: string;
  fulfillment: string;
}

// Chart Data (optional)
export interface ChartData {
  type?: string;
  centers?: any;
  channels?: any;
  gates?: any;
  profile?: string;
  incarnationCross?: string;
  [key: string]: any; // Für zusätzliche Chart-Daten
}

// Reading Metadata
export interface ReadingMetadata {
  readingType: ReadingType;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  tokens: number;
  model: string;
  timestamp: string;
  userId?: string;
  // Für Compatibility Reading
  birthDate2?: string;
  birthTime2?: string;
  birthPlace2?: string;
}

// Standardisierte Reading Response
export interface ReadingResponse {
  success: boolean;
  readingId: string; // UUID für Persistenz
  reading: {
    text: string; // Vollständiger Reading-Text
    sections?: ReadingSections | DetailedReadingSections | BusinessReadingSections 
      | RelationshipReadingSections | CareerReadingSections | HealthReadingSections
      | ParentingReadingSections | SpiritualReadingSections | CompatibilityReadingSections
      | LifePurposeReadingSections; // Strukturierte Sections (optional)
  };
  essence?: string; // Optional: Essence - energetischer Kern des Readings
  metadata: ReadingMetadata;
  chartData?: ChartData; // Optional: Chart-Daten
}

// Error Response
export interface ReadingErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: any;
  timestamp: string;
}

// Type Guards
export function isDetailedReadingSections(
  sections: any
): sections is DetailedReadingSections {
  return sections && typeof sections.type === 'object' && sections.type.name;
}

export function isCompatibilityReadingSections(
  sections: any
): sections is CompatibilityReadingSections {
  return sections && sections.person1 && sections.person2 && sections.compatibility;
}

// Helper: Erstelle standardisierte Response
export function createReadingResponse(
  readingId: string,
  readingText: string,
  readingType: ReadingType,
  metadata: Omit<ReadingMetadata, 'readingType'>,
  sections?: any,
  chartData?: ChartData,
  essence?: string // Optional: Essence
): ReadingResponse {
  return {
    success: true,
    readingId,
    reading: {
      text: readingText,
      ...(sections && { sections })
    },
    ...(essence && { essence }), // Essence hinzufügen, falls vorhanden
    metadata: {
      readingType,
      ...metadata
    },
    ...(chartData && { chartData })
  };
}

// Helper: Erstelle Error Response
export function createErrorResponse(
  error: string,
  code: string,
  details?: any
): ReadingErrorResponse {
  return {
    success: false,
    error,
    code,
    ...(details && { details }),
    timestamp: new Date().toISOString()
  };
}

