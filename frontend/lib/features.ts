/**
 * Zentrale Feature-Konfiguration
 * 
 * Diese Datei definiert alle Features und deren Paket-Zuordnungen.
 * Wird verwendet für:
 * - Route-Schutz (Middleware + ProtectedRoute)
 * - Feature-Flags
 * - UI-Anzeigen (welche Features sind verfügbar)
 */

export type SubscriptionLevel = 'basic' | 'premium' | 'vip' | 'admin';

export interface FeatureConfig {
  id: string;
  name: string;
  description: string;
  requiredPackage: SubscriptionLevel;
  routes: string[];
  category: 'basic' | 'connection-key' | 'premium' | 'vip' | 'admin';
}

/**
 * Feature-Konfiguration
 * 
 * Jedes Feature hat:
 * - id: Eindeutige Feature-ID
 * - name: Anzeigename
 * - description: Beschreibung
 * - requiredPackage: Mindest-Paket-Level
 * - routes: Alle Routen, die zu diesem Feature gehören
 * - category: Feature-Kategorie
 */
export const FEATURE_CONFIG: Record<string, FeatureConfig> = {
  // ============================================
  // BASIC FEATURES (Level 1+)
  // ============================================
  'human-design-chart': {
    id: 'human-design-chart',
    name: 'Human Design Chart',
    description: 'Grundlegendes Human Design Chart',
    requiredPackage: 'basic',
    routes: ['/human-design-chart', '/bodygraph'],
    category: 'basic',
  },
  'basic-analysis': {
    id: 'basic-analysis',
    name: 'Basis-Persönlichkeitsanalyse',
    description: 'Grundlegende Chart-Analyse',
    requiredPackage: 'basic',
    routes: ['/dashboard'],
    category: 'basic',
  },
  'community': {
    id: 'community',
    name: 'Community',
    description: 'Dating- & Friends-Community',
    requiredPackage: 'basic',
    routes: ['/community', '/friends'],
    category: 'basic',
  },
  'basic-matching': {
    id: 'basic-matching',
    name: 'Basis-Matching',
    description: 'Grundlegendes Matching',
    requiredPackage: 'basic',
    routes: [],
    category: 'basic',
  },
  'profile': {
    id: 'profile',
    name: 'Profil',
    description: 'Profil-Verwaltung',
    requiredPackage: 'basic',
    routes: ['/profil', '/settings'],
    category: 'basic',
  },

  // ============================================
  // CONNECTION KEY FEATURES (Level 2+)
  // ============================================
  'connection-key': {
    id: 'connection-key',
    name: 'Connection Key',
    description: 'Connection Key Analyse zwischen zwei Personen',
    requiredPackage: 'premium',
    routes: ['/connection-key', '/connection-key/booking', '/connection-key/results', '/connection-key/success'],
    category: 'connection-key',
  },
  'resonance-analysis': {
    id: 'resonance-analysis',
    name: 'Resonanzanalyse',
    description: 'Detaillierte Resonanzanalyse',
    requiredPackage: 'premium',
    routes: ['/resonanzanalyse', '/resonanzanalyse/sofort', '/resonanzanalyse/bereiche', '/resonanzanalyse/next-steps'],
    category: 'connection-key',
  },
  'penta-analysis': {
    id: 'penta-analysis',
    name: 'Penta-Analyse',
    description: 'Gruppendynamik-Analyse für 3-5 Personen',
    requiredPackage: 'premium',
    routes: ['/connection-key/penta', '/penta-booking', '/penta/booking'],
    category: 'connection-key',
  },

  // ============================================
  // PREMIUM FEATURES (Level 2+)
  // ============================================
  'dating': {
    id: 'dating',
    name: 'Dating',
    description: 'Energetisches Matching und Dating-Features',
    requiredPackage: 'premium',
    routes: ['/dating', '/dating/chat', '/dating/friends', '/dating/generator', '/dating/match-tips'],
    category: 'premium',
  },
  'api-access': {
    id: 'api-access',
    name: 'API-Zugriff',
    description: 'Zugriff auf die API',
    requiredPackage: 'premium',
    routes: ['/api-access'],
    category: 'premium',
  },
  'advanced-analytics': {
    id: 'advanced-analytics',
    name: 'Erweiterte Analytics',
    description: 'Detaillierte Statistiken und Insights',
    requiredPackage: 'premium',
    routes: ['/analytics'],
    category: 'premium',
  },
  'personal-learnings': {
    id: 'personal-learnings',
    name: 'Persönliche Learnings',
    description: 'Personalisierte Lerninhalte',
    requiredPackage: 'premium',
    routes: ['/learnings'],
    category: 'premium',
  },
  'moon-calendar-premium': {
    id: 'moon-calendar-premium',
    name: 'Mondkalender Premium',
    description: 'Erweiterter Mondkalender mit persönlichen Insights',
    requiredPackage: 'premium',
    routes: ['/mondkalender/premium'],
    category: 'premium',
  },

  // ============================================
  // VIP FEATURES (Level 3+)
  // ============================================
  'journal': {
    id: 'journal',
    name: 'Journaling & Notizen',
    description: 'Persönliches Journaling mit Human Design Integration',
    requiredPackage: 'vip',
    routes: ['/journal'],
    category: 'vip',
  },
  'planets': {
    id: 'planets',
    name: 'Planetenauswertungen',
    description: 'Detaillierte Planeten-Analysen (Chiron, Lilith, Nodes)',
    requiredPackage: 'vip',
    routes: ['/planets', '/lilith', '/blackmoonlilith'],
    category: 'vip',
  },
  'transits': {
    id: 'transits',
    name: 'Zeit-Dynamiken',
    description: 'Transite und zeitliche Dynamiken',
    requiredPackage: 'vip',
    routes: ['/transits'],
    category: 'vip',
  },
  'wellness': {
    id: 'wellness',
    name: 'Wellness-Analyse',
    description: 'Wellness und Gesundheit basierend auf Human Design',
    requiredPackage: 'vip',
    routes: ['/wellness'],
    category: 'vip',
  },
  'business-career': {
    id: 'business-career',
    name: 'Business & Karriere',
    description: 'Business-Analyse und Karriere-Empfehlungen',
    requiredPackage: 'vip',
    routes: ['/business-career'],
    category: 'vip',
  },
  'relationships': {
    id: 'relationships',
    name: 'Beziehungen',
    description: 'Beziehungs-Signatur und Dynamik-Analyse',
    requiredPackage: 'vip',
    routes: ['/relationships'],
    category: 'vip',
  },
  'realtime-analysis': {
    id: 'realtime-analysis',
    name: 'Echtzeit-Analyse',
    description: 'Deep Human Design Echtzeit-Analyse',
    requiredPackage: 'vip',
    routes: ['/realtime-analysis', '/realtime-analysis-demo'],
    category: 'vip',
  },
  'extended-analysis': {
    id: 'extended-analysis',
    name: 'Erweiterte Analyse',
    description: 'Deep Human Design erweiterte Analyse',
    requiredPackage: 'vip',
    routes: ['/extended-analysis'],
    category: 'vip',
  },
  'energetische-signatur': {
    id: 'energetische-signatur',
    name: 'Energetische Signatur',
    description: 'Deep Human Design energetische Signatur',
    requiredPackage: 'vip',
    routes: ['/energetische-signatur'],
    category: 'vip',
  },
  'coaching': {
    id: 'coaching',
    name: 'Coaching',
    description: 'Persönliches Coaching',
    requiredPackage: 'vip',
    routes: ['/coaching'],
    category: 'vip',
  },
  'vip-community': {
    id: 'vip-community',
    name: 'VIP-Community',
    description: 'Exklusive VIP-Community',
    requiredPackage: 'vip',
    routes: ['/vip-community'],
    category: 'vip',
  },
  'dashboard-vip': {
    id: 'dashboard-vip',
    name: 'Dashboard VIP',
    description: 'VIP-Dashboard mit erweiterten Features',
    requiredPackage: 'vip',
    routes: ['/dashboard-vip'],
    category: 'vip',
  },
  'weekly-forecast': {
    id: 'weekly-forecast',
    name: 'Wöchentliche Energievorhersage',
    description: 'Wöchentliche Vorhersage basierend auf Transits',
    requiredPackage: 'vip',
    routes: ['/weekly-forecast'],
    category: 'vip',
  },
  'ask-your-chart': {
    id: 'ask-your-chart',
    name: 'Frag dein Chart',
    description: 'KI-gestützte Chart-Befragung',
    requiredPackage: 'vip',
    routes: ['/ask-your-chart'],
    category: 'vip',
  },
  'prioritized-matches': {
    id: 'prioritized-matches',
    name: 'Priorisierte Matches',
    description: 'Algorithmus-basierte Match-Priorisierung',
    requiredPackage: 'vip',
    routes: ['/dating/prioritized'],
    category: 'vip',
  },
  'sleep-system': {
    id: 'sleep-system',
    name: 'Sleep System',
    description: 'Personalisierte Schlafsystem-Analyse',
    requiredPackage: 'vip',
    routes: ['/sleep-system'],
    category: 'vip',
  },
  'relationship-dynamics': {
    id: 'relationship-dynamics',
    name: 'Relationship Dynamics',
    description: 'Tiefe Beziehungsanalyse zwischen zwei Personen',
    requiredPackage: 'vip',
    routes: ['/relationship-dynamics'],
    category: 'vip',
  },
  'career-path': {
    id: 'career-path',
    name: 'Career Path',
    description: 'Karriere-Empfehlungen basierend auf Human Design',
    requiredPackage: 'vip',
    routes: ['/career-path'],
    category: 'vip',
  },
} as const;

/**
 * Paket-Hierarchie
 */
export const ROLE_HIERARCHY: Record<SubscriptionLevel, number> = {
  basic: 1,
  premium: 2,
  vip: 3,
  admin: 4,
} as const;

/**
 * Prüft, ob ein User Zugriff auf ein Feature hat
 */
export function hasFeatureAccess(
  userPackage: SubscriptionLevel,
  requiredPackage: SubscriptionLevel
): boolean {
  const userLevel = ROLE_HIERARCHY[userPackage] || 1;
  const requiredLevel = ROLE_HIERARCHY[requiredPackage] || 1;
  return userLevel >= requiredLevel;
}

/**
 * Gibt alle Features zurück, die für ein Paket verfügbar sind
 */
export function getFeaturesForPackage(packageId: SubscriptionLevel): FeatureConfig[] {
  return Object.values(FEATURE_CONFIG).filter((feature) =>
    hasFeatureAccess(packageId, feature.requiredPackage)
  );
}

/**
 * Gibt alle Routen zurück, die für ein Paket geschützt werden müssen
 */
export function getRoutesForPackage(packageId: SubscriptionLevel): string[] {
  return Object.values(FEATURE_CONFIG)
    .filter((feature) => feature.requiredPackage === packageId)
    .flatMap((feature) => feature.routes);
}

/**
 * Findet Feature-Konfiguration für eine Route
 */
export function getFeatureForRoute(route: string): FeatureConfig | null {
  for (const feature of Object.values(FEATURE_CONFIG)) {
    if (feature.routes.some((r) => route.startsWith(r))) {
      return feature;
    }
  }
  return null;
}

/**
 * Premium-Routen (für Middleware)
 */
export const PREMIUM_ROUTES = getRoutesForPackage('premium');

/**
 * VIP-Routen (für Middleware)
 */
export const VIP_ROUTES = getRoutesForPackage('vip');

