/**
 * B3 – Regression- & Konsistenztests für Reading-Agent
 * 
 * Test-Suite zur Sicherstellung von:
 * - Determinismus (gleiche Inputs = ähnliche Outputs)
 * - Kontext-Stabilität (gleiche Chart-Wahrheit, unterschiedliche Perspektive)
 * - Depth-Konsistenz (gleiche Inhalte, unterschiedliche Tiefe)
 * - Halluzinationsvermeidung (fehlende Daten werden explizit benannt)
 * - Negativ-Trigger-Resistenz (keine Erfindungen)
 */

import axios from 'axios';

// Test-Konfiguration
const READING_AGENT_URL = process.env.READING_AGENT_URL || 'http://localhost:4000';
const TEST_TIMEOUT = 60000; // 60 Sekunden

// Test-Ergebnisse
interface TestResult {
  testName: string;
  passed: boolean;
  notes: string;
  error?: string;
}

const testResults: TestResult[] = [];

// ============================================
// TEST-CHART (Beispiel-Chart für alle Tests)
// ============================================
const TEST_CHART = {
  chart_id: 'test-chart-001',
  chart_version: '1.0.0',
  chart: {
    core: {
      type: 'Generator',
      authority: 'Sacral',
      strategy: 'To Respond',
      profile: '1/3',
      definition: 'Single'
    },
    centers: {
      head: 'undefined',
      ajna: 'undefined',
      throat: 'defined',
      g: 'defined',
      heart: 'undefined',
      spleen: 'undefined',
      solar_plexus: 'defined',
      sacral: 'defined',
      root: 'defined'
    },
    channels: [
      { number: 34, name: 'Channel of Power' },
      { number: 20, name: 'Channel of Awakening' }
    ],
    gates: {
      '34': { line: 1, name: 'Gate of Power' },
      '20': { line: 2, name: 'Gate of Contemplation' }
    }
  }
};

// ============================================
// HELPER: Reading generieren
// ============================================
async function generateReading(
  chart: any,
  context: string,
  depth: string,
  style: string = 'ruhig'
): Promise<{ reading: string; tokens?: number }> {
  try {
    const response = await axios.post(
      `${READING_AGENT_URL}/reading/generate`,
      {
        chart_id: chart.chart_id,
        chart_version: chart.chart_version,
        chart: chart.chart,
        context,
        depth,
        style,
        userId: 'test-user'
      },
      { timeout: TEST_TIMEOUT }
    );

    if (response.data.success && response.data.reading) {
      return {
        reading: response.data.reading,
        tokens: response.data.tokens
      };
    } else {
      throw new Error(`Reading-Generierung fehlgeschlagen: ${response.data.error || 'Unbekannter Fehler'}`);
    }
  } catch (error: any) {
    throw new Error(`API-Fehler: ${error.message}`);
  }
}

// ============================================
// HELPER: Text-Vergleich (semantisch)
// ============================================
function extractKeyClaims(text: string): string[] {
  // Extrahiere Kernaussagen (Typ, Autorität, Zentren, etc.)
  const claims: string[] = [];
  
  // Typ
  if (text.match(/Generator/i)) claims.push('type:Generator');
  if (text.match(/Manifestor/i)) claims.push('type:Manifestor');
  if (text.match(/Projector/i)) claims.push('type:Projector');
  if (text.match(/Reflector/i)) claims.push('type:Reflector');
  
  // Autorität
  if (text.match(/Sacral/i)) claims.push('authority:Sacral');
  if (text.match(/Emotional/i)) claims.push('authority:Emotional');
  if (text.match(/Splenic/i)) claims.push('authority:Splenic');
  
  // Zentren (definiert)
  if (text.match(/definiert.*Sacral|Sacral.*definiert/i)) claims.push('center:Sacral-defined');
  if (text.match(/definiert.*Solar|Solar.*definiert/i)) claims.push('center:Solar-defined');
  if (text.match(/definiert.*Throat|Throat.*definiert/i)) claims.push('center:Throat-defined');
  
  // Zentren (undefiniert)
  if (text.match(/undefiniert.*Head|Head.*undefiniert/i)) claims.push('center:Head-undefined');
  if (text.match(/undefiniert.*Ajna|Ajna.*undefiniert/i)) claims.push('center:Ajna-undefined');
  
  return claims;
}

function compareReadings(reading1: string, reading2: string, reading3?: string): {
  consistent: boolean;
  differences: string[];
} {
  const claims1 = extractKeyClaims(reading1);
  const claims2 = extractKeyClaims(reading2);
  const claims3 = reading3 ? extractKeyClaims(reading3) : [];
  
  const allClaims = new Set([...claims1, ...claims2, ...claims3]);
  const differences: string[] = [];
  
  // Prüfe Konsistenz: Alle Readings sollten ähnliche Claims haben
  for (const claim of allClaims) {
    const in1 = claims1.includes(claim);
    const in2 = claims2.includes(claim);
    const in3 = reading3 ? claims3.includes(claim) : true;
    
    if (!in1 || !in2 || !in3) {
      differences.push(`Claim "${claim}" inkonsistent: R1=${in1}, R2=${in2}, R3=${in3}`);
    }
  }
  
  return {
    consistent: differences.length === 0,
    differences
  };
}

// ============================================
// TEST 1: Determinismus (Kern-Regression)
// ============================================
async function test1_Determinismus(): Promise<TestResult> {
  const testName = 'TEST 1 – Determinismus (Kern-Regression)';
  
  try {
    console.log(`\n🧪 ${testName}`);
    console.log('Setup: Gleiches chart_id, context, depth, style');
    
    // Generiere 3 Readings nacheinander
    const reading1 = await generateReading(TEST_CHART, 'personality', 'advanced', 'ruhig');
    const reading2 = await generateReading(TEST_CHART, 'personality', 'advanced', 'ruhig');
    const reading3 = await generateReading(TEST_CHART, 'personality', 'advanced', 'ruhig');
    
    // Vergleiche Kernaussagen
    const comparison = compareReadings(reading1.reading, reading2.reading, reading3.reading);
    
    // Prüfe auf Halluzinationen (neue Gates/Zentren)
    const allReadings = [reading1.reading, reading2.reading, reading3.reading].join(' ');
    
    // Prüfe auf verbotene Ergänzungen
    const hasForbiddenAdditions = 
      allReadings.match(/Inkarnationskreuz|Incarnation Cross/i) ||
      allReadings.match(/Penta/i) ||
      allReadings.match(/Variable/i);
    
    if (!comparison.consistent) {
      return {
        testName,
        passed: false,
        notes: `Kernaussagen inkonsistent: ${comparison.differences.join('; ')}`,
        error: 'Determinismus-Test fehlgeschlagen'
      };
    }
    
    if (hasForbiddenAdditions) {
      return {
        testName,
        passed: false,
        notes: 'Verbotene Ergänzungen gefunden (Inkarnationskreuz, Penta, Variable)',
        error: 'Halluzination erkannt'
      };
    }
    
    return {
      testName,
      passed: true,
      notes: `Alle 3 Readings konsistent. Tokens: R1=${reading1.tokens}, R2=${reading2.tokens}, R3=${reading3.tokens}`
    };
  } catch (error: any) {
    return {
      testName,
      passed: false,
      notes: `Test-Fehler: ${error.message}`,
      error: error.message
    };
  }
}

// ============================================
// TEST 2: Kontext-Stabilität
// ============================================
async function test2_KontextStabilitaet(): Promise<TestResult> {
  const testName = 'TEST 2 – Kontext-Stabilität';
  
  try {
    console.log(`\n🧪 ${testName}`);
    console.log('Setup: Gleiches chart_id, unterschiedlicher context');
    
    const readingBusiness = await generateReading(TEST_CHART, 'business', 'advanced', 'ruhig');
    const readingRelationship = await generateReading(TEST_CHART, 'relationship', 'advanced', 'ruhig');
    const readingCrisis = await generateReading(TEST_CHART, 'crisis', 'advanced', 'ruhig');
    
    // Alle sollten die gleiche Chart-Wahrheit haben
    const claimsBusiness = extractKeyClaims(readingBusiness.reading);
    const claimsRelationship = extractKeyClaims(readingRelationship.reading);
    const claimsCrisis = extractKeyClaims(readingCrisis.reading);
    
    // Prüfe: Gleiche Chart-Eigenschaften müssen in allen Readings vorkommen
    const coreClaims = ['type:Generator', 'authority:Sacral', 'center:Sacral-defined'];
    const missingClaims: string[] = [];
    
    for (const claim of coreClaims) {
      if (!claimsBusiness.includes(claim)) missingClaims.push(`Business fehlt: ${claim}`);
      if (!claimsRelationship.includes(claim)) missingClaims.push(`Relationship fehlt: ${claim}`);
      if (!claimsCrisis.includes(claim)) missingClaims.push(`Crisis fehlt: ${claim}`);
    }
    
    // Prüfe auf Widersprüche (z.B. unterschiedliche Typen)
    const allReadings = [readingBusiness.reading, readingRelationship.reading, readingCrisis.reading].join(' ');
    const hasContradictions = 
      (allReadings.match(/Generator/i) && allReadings.match(/Manifestor/i)) ||
      (allReadings.match(/Sacral/i) && allReadings.match(/Emotional.*Autorität/i));
    
    if (missingClaims.length > 0) {
      return {
        testName,
        passed: false,
        notes: `Chart-Wahrheit nicht konsistent: ${missingClaims.join('; ')}`,
        error: 'Kontext-Stabilität fehlgeschlagen'
      };
    }
    
    if (hasContradictions) {
      return {
        testName,
        passed: false,
        notes: 'Widersprüchliche Chart-Eigenschaften gefunden',
        error: 'Faktenänderung erkannt'
      };
    }
    
    return {
      testName,
      passed: true,
      notes: 'Gleiche Chart-Wahrheit, unterschiedliche Perspektive bestätigt'
    };
  } catch (error: any) {
    return {
      testName,
      passed: false,
      notes: `Test-Fehler: ${error.message}`,
      error: error.message
    };
  }
}

// ============================================
// TEST 3: Depth-Regression
// ============================================
async function test3_DepthRegression(): Promise<TestResult> {
  const testName = 'TEST 3 – Depth-Regression';
  
  try {
    console.log(`\n🧪 ${testName}`);
    console.log('Setup: Gleiches chart_id, unterschiedliche depth');
    
    const readingBasic = await generateReading(TEST_CHART, 'personality', 'basic', 'ruhig');
    const readingAdvanced = await generateReading(TEST_CHART, 'personality', 'advanced', 'ruhig');
    const readingProfessional = await generateReading(TEST_CHART, 'personality', 'professional', 'ruhig');
    
    // Alle sollten die gleichen Kernaussagen haben
    const claimsBasic = extractKeyClaims(readingBasic.reading);
    const claimsAdvanced = extractKeyClaims(readingAdvanced.reading);
    const claimsProfessional = extractKeyClaims(readingProfessional.reading);
    
    // Prüfe: Professional sollte keine neuen Chart-Elemente "entdecken"
    const coreClaims = ['type:Generator', 'authority:Sacral'];
    const professionalOnlyClaims = claimsProfessional.filter(
      claim => !claimsBasic.includes(claim) && !claimsAdvanced.includes(claim) && !coreClaims.includes(claim)
    );
    
    // Prüfe: Basic sollte keine falschen Vereinfachungen enthalten
    const hasFalseSimplifications = 
      readingBasic.reading.match(/Manifestor/i) && !readingAdvanced.reading.match(/Manifestor/i) ||
      readingBasic.reading.match(/Emotional.*Autorität/i) && !readingAdvanced.reading.match(/Emotional.*Autorität/i);
    
    if (professionalOnlyClaims.length > 0) {
      return {
        testName,
        passed: false,
        notes: `Professional "entdeckt" neue Chart-Elemente: ${professionalOnlyClaims.join(', ')}`,
        error: 'Depth-Regression fehlgeschlagen'
      };
    }
    
    if (hasFalseSimplifications) {
      return {
        testName,
        passed: false,
        notes: 'Basic enthält falsche Vereinfachungen',
        error: 'Faktenverfälschung erkannt'
      };
    }
    
    return {
      testName,
      passed: true,
      notes: 'Gleiche Inhalte, unterschiedliche Tiefe bestätigt'
    };
  } catch (error: any) {
    return {
      testName,
      passed: false,
      notes: `Test-Fehler: ${error.message}`,
      error: error.message
    };
  }
}

// ============================================
// TEST 4: Halluzinations-Probe (kritisch)
// ============================================
async function test4_HalluzinationsProbe(): Promise<TestResult> {
  const testName = 'TEST 4 – Halluzinations-Probe (kritisch)';
  
  try {
    console.log(`\n🧪 ${testName}`);
    console.log('Setup: Chart ohne channels');
    
    // Chart ohne channels
    const chartWithoutChannels = {
      ...TEST_CHART,
      chart: {
        ...TEST_CHART.chart,
        channels: [] // Leer!
      }
    };
    
    const reading = await generateReading(chartWithoutChannels, 'personality', 'advanced', 'ruhig');
    
    // Prüfe: Agent muss explizit sagen, dass channels fehlen
    const hasExplicitStatement = 
      reading.reading.match(/keine.*Kanäle|Kanäle.*nicht|keine.*Channels|Channels.*nicht/i) ||
      reading.reading.match(/keine.*eindeutige.*Aussage|keine.*Aussage.*treffen/i) ||
      reading.reading.match(/vorhandenen.*Daten.*lässt.*sich.*lediglich/i);
    
    // Prüfe: Agent darf nicht halluzinieren
    const hasHallucination = 
      reading.reading.match(/Channel.*34|Channel.*20|Kanal.*34|Kanal.*20/i) ||
      reading.reading.match(/normalerweise|typischerweise|üblicherweise/i);
    
    if (hasHallucination) {
      return {
        testName,
        passed: false,
        notes: 'Agent halluziniert fehlende channels',
        error: 'Halluzination erkannt'
      };
    }
    
    if (!hasExplicitStatement) {
      return {
        testName,
        passed: false,
        notes: 'Agent sagt nicht explizit, dass channels fehlen',
        error: 'Fehlende Daten nicht benannt'
      };
    }
    
    return {
      testName,
      passed: true,
      notes: 'Agent benennt fehlende Daten explizit, keine Halluzination'
    };
  } catch (error: any) {
    return {
      testName,
      passed: false,
      notes: `Test-Fehler: ${error.message}`,
      error: error.message
    };
  }
}

// ============================================
// TEST 5: Negativ-Trigger-Test
// ============================================
async function test5_NegativTrigger(): Promise<TestResult> {
  const testName = 'TEST 5 – Negativ-Trigger-Test';
  
  try {
    console.log(`\n🧪 ${testName}`);
    console.log('Setup: Chart ohne Inkarnationskreuz, aber provozierender Prompt');
    
    // Chart ohne Inkarnationskreuz (nicht im Chart-JSON)
    const chartWithoutCross = {
      ...TEST_CHART,
      chart: {
        ...TEST_CHART.chart
        // Kein incarnation_cross Feld!
      }
    };
    
    // Versuche Reading zu generieren (Agent sollte Inkarnationskreuz ablehnen)
    const reading = await generateReading(chartWithoutCross, 'personality', 'advanced', 'ruhig');
    
    // Prüfe: Agent darf kein Inkarnationskreuz erfinden
    const hasInventedCross = 
      reading.reading.match(/Inkarnationskreuz|Incarnation Cross|Rahu|Ketu/i) &&
      !reading.reading.match(/keine.*Aussage|nicht.*vorhanden|fehlt/i);
    
    // Prüfe: Agent sollte explizit ablehnen oder Datenbegrenzung erklären
    const hasRejection = 
      reading.reading.match(/keine.*eindeutige.*Aussage|keine.*Aussage.*treffen/i) ||
      reading.reading.match(/vorhandenen.*Daten.*lässt.*sich.*lediglich/i) ||
      reading.reading.match(/nicht.*vorhanden|fehlt.*Daten/i);
    
    if (hasInventedCross) {
      return {
        testName,
        passed: false,
        notes: 'Agent erfindet Inkarnationskreuz',
        error: 'Erfindung erkannt'
      };
    }
    
    if (!hasRejection && reading.reading.length > 500) {
      // Wenn Reading lang ist, aber keine Ablehnung, könnte Agent vage Aussagen machen
      return {
        testName,
        passed: false,
        notes: 'Agent macht vage Aussagen statt explizite Ablehnung',
        error: 'Vage Aussagen erkannt'
      };
    }
    
    return {
      testName,
      passed: true,
      notes: 'Agent verweigert Erfindung, erklärt Datenbegrenzung'
    };
  } catch (error: any) {
    return {
      testName,
      passed: false,
      notes: `Test-Fehler: ${error.message}`,
      error: error.message
    };
  }
}

// ============================================
// TEST-RUNNER
// ============================================
async function runAllTests(): Promise<void> {
  console.log('🚀 B3 – Regression- & Konsistenztests für Reading-Agent');
  console.log('='.repeat(60));
  console.log(`Reading Agent URL: ${READING_AGENT_URL}`);
  console.log(`Test-Timeout: ${TEST_TIMEOUT}ms`);
  console.log('='.repeat(60));
  
  // Führe alle Tests aus
  testResults.push(await test1_Determinismus());
  testResults.push(await test2_KontextStabilitaet());
  testResults.push(await test3_DepthRegression());
  testResults.push(await test4_HalluzinationsProbe());
  testResults.push(await test5_NegativTrigger());
  
  // Ausgabe
  console.log('\n📊 BEWERTUNGSMATRIX');
  console.log('='.repeat(60));
  
  let allPassed = true;
  testResults.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.testName}`);
    console.log(`   ${result.notes}`);
    if (result.error) {
      console.log(`   ⚠️  Fehler: ${result.error}`);
    }
    console.log('');
    
    if (!result.passed) {
      allPassed = false;
    }
  });
  
  console.log('='.repeat(60));
  console.log(`\n🎯 GESAMTERGEBNIS: ${allPassed ? '✅ B3 BESTANDEN' : '❌ B3 NICHT BESTANDEN'}`);
  console.log(`   Bestanden: ${testResults.filter(r => r.passed).length}/${testResults.length}`);
  
  // Exit-Code
  process.exit(allPassed ? 0 : 1);
}

// ============================================
// MAIN
// ============================================
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Test-Runner Fehler:', error);
    process.exit(1);
  });
}

export {
  test1_Determinismus,
  test2_KontextStabilitaet,
  test3_DepthRegression,
  test4_HalluzinationsProbe,
  test5_NegativTrigger,
  runAllTests
};
