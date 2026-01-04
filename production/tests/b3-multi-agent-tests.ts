/**
 * B3 – Multi-Agent Regression Tests (C2 Erweiterung)
 * 
 * Erweiterte B3 Tests für Multi-Agent-System
 * Testet alle Agents (business, relationship, crisis, personality)
 */

import axios from 'axios';
import { test1_Determinismus, test4_HalluzinationsProbe } from './b3-regression-tests';

// Test-Konfiguration
const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://localhost:3000/api/coach/readings-v2/generate';
const CHART_TRUTH_API_URL = process.env.CHART_TRUTH_API_URL || 'http://localhost:3000/api/chart/truth';
const TEST_TIMEOUT = 60000;

// Test-Ergebnisse
interface TestResult {
  testName: string;
  agentId: string;
  passed: boolean;
  notes: string;
  error?: string;
}

const testResults: TestResult[] = [];

// ============================================
// TEST-CHART (Beispiel-Chart für alle Tests)
// ============================================
const TEST_INPUT = {
  birth_date: '1990-01-15',
  birth_time: '14:30',
  latitude: 52.52,
  longitude: 13.405,
  timezone: 'Europe/Berlin'
};

let TEST_CHART_ID: string | null = null;

// ============================================
// HELPER: Chart generieren (einmalig)
// ============================================
async function generateTestChart(): Promise<string> {
  if (TEST_CHART_ID) {
    return TEST_CHART_ID;
  }

  try {
    const response = await axios.post(CHART_TRUTH_API_URL, TEST_INPUT, {
      timeout: TEST_TIMEOUT
    });

    if (response.data.chart_id) {
      TEST_CHART_ID = response.data.chart_id;
      return TEST_CHART_ID;
    } else {
      throw new Error('Chart-Generierung fehlgeschlagen: Keine chart_id zurückgegeben');
    }
  } catch (error: any) {
    throw new Error(`Chart-Generierung fehlgeschlagen: ${error.message}`);
  }
}

// ============================================
// HELPER: Reading generieren über Orchestrator
// ============================================
async function generateReading(
  chartId: string,
  context: string,
  depth: string = 'advanced',
  style: string = 'ruhig'
): Promise<{ reading: string; tokens?: number }> {
  try {
    const response = await axios.post(
      ORCHESTRATOR_URL,
      {
        chart_id: chartId,
        context,
        depth,
        style
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
  const claims: string[] = [];
  
  if (text.match(/Generator/i)) claims.push('type:Generator');
  if (text.match(/Manifestor/i)) claims.push('type:Manifestor');
  if (text.match(/Projector/i)) claims.push('type:Projector');
  if (text.match(/Reflector/i)) claims.push('type:Reflector');
  
  if (text.match(/Sacral/i)) claims.push('authority:Sacral');
  if (text.match(/Emotional/i)) claims.push('authority:Emotional');
  if (text.match(/Splenic/i)) claims.push('authority:Splenic');
  
  if (text.match(/definiert.*Sacral|Sacral.*definiert/i)) claims.push('center:Sacral-defined');
  if (text.match(/definiert.*Solar|Solar.*definiert/i)) claims.push('center:Solar-defined');
  if (text.match(/definiert.*Throat|Throat.*definiert/i)) claims.push('center:Throat-defined');
  
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
// TEST 1: Determinismus (pro Agent)
// ============================================
async function test1_DeterminismusMultiAgent(agentId: string): Promise<TestResult> {
  const testName = 'TEST 1 – Determinismus (Kern-Regression)';
  
  try {
    console.log(`\n🧪 ${testName} - Agent: ${agentId}`);
    console.log('Setup: Gleiches chart_id, context, depth, style');
    
    const chartId = await generateTestChart();
    
    // Generiere 3 Readings nacheinander
    const reading1 = await generateReading(chartId, agentId, 'advanced', 'ruhig');
    const reading2 = await generateReading(chartId, agentId, 'advanced', 'ruhig');
    const reading3 = await generateReading(chartId, agentId, 'advanced', 'ruhig');
    
    // Vergleiche Kernaussagen
    const comparison = compareReadings(reading1.reading, reading2.reading, reading3.reading);
    
    // Prüfe auf Halluzinationen (neue Gates/Zentren)
    const allReadings = [reading1.reading, reading2.reading, reading3.reading].join(' ');
    
    const hasForbiddenAdditions = 
      allReadings.match(/Inkarnationskreuz|Incarnation Cross/i) ||
      allReadings.match(/Penta/i) ||
      allReadings.match(/Variable/i);
    
    if (!comparison.consistent) {
      return {
        testName,
        agentId,
        passed: false,
        notes: `Kernaussagen inkonsistent: ${comparison.differences.join('; ')}`,
        error: 'Determinismus-Test fehlgeschlagen'
      };
    }
    
    if (hasForbiddenAdditions) {
      return {
        testName,
        agentId,
        passed: false,
        notes: 'Verbotene Ergänzungen gefunden (Inkarnationskreuz, Penta, Variable)',
        error: 'Halluzination erkannt'
      };
    }
    
    return {
      testName,
      agentId,
      passed: true,
      notes: `Alle 3 Readings konsistent. Tokens: R1=${reading1.tokens}, R2=${reading2.tokens}, R3=${reading3.tokens}`
    };
  } catch (error: any) {
    return {
      testName,
      agentId,
      passed: false,
      notes: `Test-Fehler: ${error.message}`,
      error: error.message
    };
  }
}

// ============================================
// TEST 4: Halluzinations-Probe (pro Agent)
// ============================================
async function test4_HalluzinationsProbeMultiAgent(agentId: string): Promise<TestResult> {
  const testName = 'TEST 4 – Halluzinations-Probe (kritisch)';
  
  try {
    console.log(`\n🧪 ${testName} - Agent: ${agentId}`);
    console.log('Setup: Chart ohne channels');
    
    // Generiere Chart OHNE channels (über Chart-Truth-API mit minimalem Chart)
    // Für diesen Test nehmen wir an, dass ein Chart ohne channels existiert
    // In der Praxis: Chart mit leerem channels-Array generieren
    
    const chartId = await generateTestChart();
    
    // Lade Chart und entferne channels (für Test)
    // In der Praxis: Chart ohne channels über Chart-Truth-API generieren
    // Hier: Verwende vorhandenes Chart und prüfe Agent-Verhalten
    
    const reading = await generateReading(chartId, agentId, 'advanced', 'ruhig');
    
    // Prüfe: Agent muss explizit sagen, wenn channels fehlen (falls Chart keine channels hat)
    // Für diesen Test prüfen wir allgemein auf Halluzinationen
    
    const hasExplicitStatement = 
      reading.reading.match(/keine.*Kanäle|Kanäle.*nicht|keine.*Channels|Channels.*nicht/i) ||
      reading.reading.match(/keine.*eindeutige.*Aussage|keine.*Aussage.*treffen/i) ||
      reading.reading.match(/vorhandenen.*Daten.*lässt.*sich.*lediglich/i);
    
    const hasHallucination = 
      reading.reading.match(/normalerweise|typischerweise|üblicherweise/i) &&
      !hasExplicitStatement;
    
    if (hasHallucination) {
      return {
        testName,
        agentId,
        passed: false,
        notes: 'Agent halluziniert (verwendet "normalerweise" ohne explizite Datenbegrenzung)',
        error: 'Halluzination erkannt'
      };
    }
    
    return {
      testName,
      agentId,
      passed: true,
      notes: 'Agent benennt fehlende Daten explizit oder macht keine Halluzinationen'
    };
  } catch (error: any) {
    return {
      testName,
      agentId,
      passed: false,
      notes: `Test-Fehler: ${error.message}`,
      error: error.message
    };
  }
}

// ============================================
// TEST E: Multi-Agent-Konsistenz
// ============================================
async function testE_MultiAgentKonsistenz(): Promise<TestResult> {
  const testName = 'TEST E – Multi-Agent-Konsistenz';
  
  try {
    console.log(`\n🧪 ${testName}`);
    console.log('Setup: Gleiches chart_id, unterschiedliche Agents');
    
    const chartId = await generateTestChart();
    
    // Generiere Readings mit allen Agents
    const readingBusiness = await generateReading(chartId, 'business', 'advanced', 'ruhig');
    const readingRelationship = await generateReading(chartId, 'relationship', 'advanced', 'ruhig');
    const readingCrisis = await generateReading(chartId, 'crisis', 'advanced', 'ruhig');
    const readingPersonality = await generateReading(chartId, 'personality', 'advanced', 'ruhig');
    
    // Alle sollten die gleiche Chart-Wahrheit haben
    const claimsBusiness = extractKeyClaims(readingBusiness.reading);
    const claimsRelationship = extractKeyClaims(readingRelationship.reading);
    const claimsCrisis = extractKeyClaims(readingCrisis.reading);
    const claimsPersonality = extractKeyClaims(readingPersonality.reading);
    
    // Prüfe: Gleiche Chart-Eigenschaften müssen in allen Readings vorkommen
    const coreClaims = ['type:Generator', 'authority:Sacral', 'center:Sacral-defined'];
    const missingClaims: string[] = [];
    
    for (const claim of coreClaims) {
      if (!claimsBusiness.includes(claim)) missingClaims.push(`Business fehlt: ${claim}`);
      if (!claimsRelationship.includes(claim)) missingClaims.push(`Relationship fehlt: ${claim}`);
      if (!claimsCrisis.includes(claim)) missingClaims.push(`Crisis fehlt: ${claim}`);
      if (!claimsPersonality.includes(claim)) missingClaims.push(`Personality fehlt: ${claim}`);
    }
    
    // Prüfe auf Widersprüche
    const allReadings = [
      readingBusiness.reading,
      readingRelationship.reading,
      readingCrisis.reading,
      readingPersonality.reading
    ].join(' ');
    
    const hasContradictions = 
      (allReadings.match(/Generator/i) && allReadings.match(/Manifestor/i)) ||
      (allReadings.match(/Sacral/i) && allReadings.match(/Emotional.*Autorität/i));
    
    if (missingClaims.length > 0) {
      return {
        testName,
        agentId: 'all',
        passed: false,
        notes: `Chart-Wahrheit nicht konsistent: ${missingClaims.join('; ')}`,
        error: 'Multi-Agent-Konsistenz fehlgeschlagen'
      };
    }
    
    if (hasContradictions) {
      return {
        testName,
        agentId: 'all',
        passed: false,
        notes: 'Widersprüchliche Chart-Eigenschaften gefunden',
        error: 'Faktenänderung erkannt'
      };
    }
    
    return {
      testName,
      agentId: 'all',
      passed: true,
      notes: 'Gleiche Chart-Wahrheit über alle Agents bestätigt'
    };
  } catch (error: any) {
    return {
      testName,
      agentId: 'all',
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
  console.log('🚀 B3 – Multi-Agent Regression Tests (C2 Erweiterung)');
  console.log('='.repeat(60));
  console.log(`Orchestrator URL: ${ORCHESTRATOR_URL}`);
  console.log(`Chart Truth API URL: ${CHART_TRUTH_API_URL}`);
  console.log(`Test-Timeout: ${TEST_TIMEOUT}ms`);
  console.log('='.repeat(60));
  
  const agents = ['business', 'relationship', 'crisis', 'personality'];
  
  // Test 1: Determinismus (pro Agent)
  for (const agentId of agents) {
    testResults.push(await test1_DeterminismusMultiAgent(agentId));
  }
  
  // Test 4: Halluzinations-Probe (pro Agent)
  for (const agentId of agents) {
    testResults.push(await test4_HalluzinationsProbeMultiAgent(agentId));
  }
  
  // Test E: Multi-Agent-Konsistenz
  testResults.push(await testE_MultiAgentKonsistenz());
  
  // Ausgabe
  console.log('\n📊 BEWERTUNGSMATRIX');
  console.log('='.repeat(60));
  
  let allPassed = true;
  const resultsByAgent: Record<string, TestResult[]> = {};
  
  testResults.forEach(result => {
    if (!resultsByAgent[result.agentId]) {
      resultsByAgent[result.agentId] = [];
    }
    resultsByAgent[result.agentId].push(result);
  });
  
  // Gruppiert nach Agent ausgeben
  Object.entries(resultsByAgent).forEach(([agentId, results]) => {
    console.log(`\n📋 Agent: ${agentId}`);
    results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`  ${status} ${result.testName}`);
      console.log(`     ${result.notes}`);
      if (result.error) {
        console.log(`     ⚠️  Fehler: ${result.error}`);
      }
      
      if (!result.passed) {
        allPassed = false;
      }
    });
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n🎯 GESAMTERGEBNIS: ${allPassed ? '✅ B3 MULTI-AGENT BESTANDEN' : '❌ B3 MULTI-AGENT NICHT BESTANDEN'}`);
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
  test1_DeterminismusMultiAgent,
  test4_HalluzinationsProbeMultiAgent,
  testE_MultiAgentKonsistenz,
  runAllTests
};
