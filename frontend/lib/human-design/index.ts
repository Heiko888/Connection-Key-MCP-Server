/**
 * Human Design Library - Main Export
 */

export {
  GATE_SPANS,
  gateForLongitude,
  lineForLongitude,
  getGateAndLine,
  formatGateAndLine,
  getGateInfo,
} from './gate-calculator';

export {
  calculatePrecisePlanetaryPositions,
  calculateDesignPositions,
  calculateCompleteChart,
  parseBirthDateTime,
  getZodiacSignFromLongitude,
  getZodiacSignFromLongitude as getZodiacSign,
  isPreciseEphemerisAvailable,
  formatPlanetPosition,
  type PlanetPosition,
  type HumanDesignPlanets,
} from './precise-ephemeris';

// Note: Precise ephemeris functions are preferred over simplified ones
export {
  calculateApproximateSunPosition,
  calculateEarthPosition,
  calculateDesignSun,
  calculateDesignEarth,
  calculateApproximateMoonPosition,
  calculateApproximatePlanetaryPositions,
  EPHEMERIS_DISCLAIMER,
  isProperEphemerisAvailable,
} from './simplified-ephemeris';

export {
  CHANNELS,
  findActivatedChannels,
  formatChannels,
  collectActiveGates,
  type Channel,
} from './channels';

export {
  calculateProfile,
  getProfileInfo,
  getAllProfiles,
  PROFILE_DESCRIPTIONS,
} from './profile';

export {
  calculateCenters,
  getCenterDescription,
  GATE_TO_CENTER,
  CHANNEL_CENTERS,
  type CenterStatus,
} from './centers';

export {
  calculateIncarnationCross,
  formatIncarnationCross,
  getCrossType,
  generateCrossName,
  generateShortCrossName,
  generateCrossDescription,
  CROSS_TYPE_ICONS,
  CROSS_TYPE_DESCRIPTIONS,
  type IncarnationCrossData
} from './incarnation-cross';

export {
  calculateTypeAndAuthority,
  calculateType,
  calculateAuthority,
  calculateStrategy,
  calculateNotSelfTheme,
  calculateSignature,
  calculateDefinition,
  TYPE_ICONS,
  AUTHORITY_ICONS,
  STRATEGY_ICONS,
  NOT_SELF_ICONS,
  SIGNATURE_ICONS,
  DEFINITION_ICONS,
  type HDType,
  type HDAuthority,
  type Strategy,
  type NotSelfTheme,
  type Signature,
  type DefinitionType,
  type TypeAuthorityResult
} from './type-authority';

export {
  calculateCircuits,
  getDominantCircuitGroup,
  CIRCUITS,
  CIRCUIT_ICONS,
  CIRCUIT_GROUP_ICONS,
  CIRCUIT_GROUP_COLORS,
  CHANNEL_TO_CIRCUIT,
  type Circuit,
  type CircuitResult,
  type CircuitGroup,
  type CircuitName
} from './circuits';

export {
  getGateDescription,
  getLineDescription,
  formatGateWithLine,
  getGateSummary,
  hasGateDescription,
  GATE_DESCRIPTIONS,
  AVAILABLE_GATES,
  type GateDescription
} from './gate-descriptions';

export {
  calculateVariables,
  formatVariables,
  VARIABLE_ICONS,
  COGNITION_DESCRIPTIONS,
  type VariableData,
  type PHSType,
  type EnvironmentType,
  type PerspectiveType,
  type MotivationType,
  type ArrowDirection
} from './variables';

export {
  analyzeConnectionKey,
  analyzeTypeConnection,
  analyzeProfileInteraction,
  analyzeCombinedAuthorityStrategy,
  findConnectionKeys,
  generateEnergeticSummary,
  compareCenters,
  findResonanceAxes,
  findGoldenThreads,
  formatConnectionKeyAnalysis,
  type ConnectionKeyAnalysis,
  type ConnectionKey,
  type TypeConnection,
  type ProfileInteraction,
  type CombinedAuthorityStrategy,
  type ResonanceAxis,
  type GoldenThread,
  type CenterComparison,
  type ResonanceLevel
} from './connection-key';

export {
  analyzeConnectionKeys,
  findConnectionKeys as findConnectionKeysEngine,
  calculateConnectionScores,
  determineProfileType,
  generateSummaryText,
  generateAnalysisDetails,
  type ConnectionKeyType,
  type ConnectionKeyWeight,
  type ConnectionKey as ConnectionKeyEngine,
  type ConnectionKeysAnalysis,
  type ConnectionScores,
  type ProfileType,
  type ConnectionKeyResult,
  type ChartInput
} from './connection-key-engine';

/**
 * Human Design Profile Definition
 */
export type HDProfile = 
  | '1/3' | '1/4' | '2/4' | '2/5' | '3/5' | '3/6' 
  | '4/6' | '4/1' | '5/1' | '5/2' | '6/2' | '6/3';

/**
 * Example: Calculate Sun/Earth Gates from birth data
 * (You would integrate with an ephemeris library like Swiss Ephemeris)
 */
export function calculateSunGate(birthDate: Date): { gate: number; line: number } | null {
  // TODO: Integrate with ephemeris to get Sun's ecliptic longitude
  // For now, this is a placeholder
  console.warn('calculateSunGate: Ephemeris integration required');
  return null;
}

/**
 * Gate Names (German)
 */
export const GATE_NAMES: Record<number, string> = {
  1: 'Die Schöpferische Kraft',
  2: 'Die Rezeptive Kraft',
  3: 'Die Schwierigkeit am Anfang',
  4: 'Die jugendliche Torheit',
  5: 'Das Warten',
  6: 'Der Konflikt',
  7: 'Die Armee',
  8: 'Das Zusammenhalten',
  9: 'Die kleine Zähmungskraft',
  10: 'Das Auftreten',
  11: 'Der Friede',
  12: 'Die Stockung',
  13: 'Gemeinschaft mit Menschen',
  14: 'Der Besitz von Großem',
  15: 'Die Bescheidenheit',
  16: 'Die Begeisterung',
  17: 'Die Nachfolge',
  18: 'Die Arbeit am Verdorbenen',
  19: 'Die Annäherung',
  20: 'Die Betrachtung',
  21: 'Das Durchbeißen',
  22: 'Die Anmut',
  23: 'Die Zersplitterung',
  24: 'Die Wiederkehr',
  25: 'Die Unschuld',
  26: 'Die große Zähmungskraft',
  27: 'Die Ernährung',
  28: 'Des Großen Übermaß',
  29: 'Das Abgründige',
  30: 'Das Haftende',
  31: 'Die Einwirkung',
  32: 'Die Dauer',
  33: 'Der Rückzug',
  34: 'Des Großen Macht',
  35: 'Der Fortschritt',
  36: 'Die Verfinsterung des Lichts',
  37: 'Die Sippe',
  38: 'Der Gegensatz',
  39: 'Die Hemmnis',
  40: 'Die Befreiung',
  41: 'Die Minderung',
  42: 'Die Mehrung',
  43: 'Der Durchbruch',
  44: 'Das Entgegenkommen',
  45: 'Die Sammlung',
  46: 'Das Empordringen',
  47: 'Die Bedrängnis',
  48: 'Der Brunnen',
  49: 'Die Umwälzung',
  50: 'Der Tiegel',
  51: 'Das Erregende',
  52: 'Das Stillehalten',
  53: 'Die Entwicklung',
  54: 'Das heiratende Mädchen',
  55: 'Die Fülle',
  56: 'Der Wanderer',
  57: 'Das Sanfte',
  58: 'Das Heitere',
  59: 'Die Auflösung',
  60: 'Die Beschränkung',
  61: 'Die innere Wahrheit',
  62: 'Des Kleinen Übermaß',
  63: 'Nach der Vollendung',
  64: 'Vor der Vollendung',
};

/**
 * Get gate name with number
 */
export function getGateName(gateNumber: number): string {
  return `Tor ${gateNumber}: ${GATE_NAMES[gateNumber] || 'Unbekannt'}`;
}

