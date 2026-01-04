/**
 * C1 – Chart-Versionierungs-Tests
 * 
 * Test-Suite zur Sicherstellung von:
 * - Versionsisolierung (gleiches Input, unterschiedliche Versionen)
 * - Legacy-Sicherheit (alte Readings bleiben unverändert)
 * - Dedupe pro Version
 */

import axios from 'axios';

// Test-Konfiguration
const CHART_TRUTH_API_URL = process.env.CHART_TRUTH_API_URL || 'http://localhost:3000/api/chart/truth';
const TEST_TIMEOUT = 60000;

// Test-Ergebnisse
interface TestResult {
  testName: string;
  passed: boolean;
  notes: string;
  error?: string;
}

const testResults: TestResult[] = [];

// ============================================
// TEST-INPUT (Beispiel)
// ============================================
const TEST_INPUT = {
  birth_date: '1990-01-15',
  birth_time: '14:30',
  latitude: 52.52,
  longitude: 13.405,
  timezone: 'Europe/Berlin'
};

// ============================================
// HELPER: Chart generieren
// ============================================
async function generateChart(chartVersion?: string): Promise<any> {
  try {
    const payload = {
      ...TEST_INPUT,
      ...(chartVersion && { chart_version: chartVersion })
    };

    const response = await axios.post(CHART_TRUTH_API_URL, payload, {
      timeout: TEST_TIMEOUT
    });

    if (response.data.chart_id && response.data.chart_version) {
      return response.data;
    } else {
      throw new Error(`Chart-Generierung fehlgeschlagen: ${response.data.error || 'Unbekannter Fehler'}`);
    }
  } catch (error: any) {
    throw new Error(`API-Fehler: ${error.message}`);
  }
}

// ============================================
// TEST A: Versionsisolierung
// ============================================
async function testA_VersionsIsolierung(): Promise<TestResult> {
  const testName = 'TEST A – Versionsisolierung';
  
  try {
    console.log(`\n🧪 ${testName}`);
    console.log('Setup: Gleiches Input, Version 1.0.0 vs 1.1.0');
    
    // Generiere Chart mit Version 1.0.0
    const chartV1 = await generateChart('1.0.0');
    
    // Generiere Chart mit Version 1.1.0
    const chartV11 = await generateChart('1.1.0');
    
    // Prüfe: Unterschiedliche chart_id
    if (chartV1.chart_id === chartV11.chart_id) {
      return {
        testName,
        passed: false,
        notes: `Beide Versionen haben gleiche chart_id: ${chartV1.chart_id}`,
        error: 'Versionsisolierung fehlgeschlagen'
      };
    }
    
    // Prüfe: Gleicher input_hash
    if (chartV1.input_hash !== chartV11.input_hash) {
      return {
        testName,
        passed: false,
        notes: `input_hash unterschiedlich: V1=${chartV1.input_hash.substring(0, 8)}..., V1.1=${chartV11.input_hash.substring(0, 8)}...`,
        error: 'input_hash sollte identisch sein (nur aus Geburtsdaten)'
      };
    }
    
    // Prüfe: Unterschiedliche chart_version
    if (chartV1.chart_version === chartV11.chart_version) {
      return {
        testName,
        passed: false,
        notes: `chart_version identisch: ${chartV1.chart_version}`,
        error: 'chart_version sollte unterschiedlich sein'
      };
    }
    
    // Prüfe: Unterschiedliche engine
    if (chartV1.engine === chartV11.engine) {
      return {
        testName,
        passed: false,
        notes: `engine identisch: ${chartV1.engine}`,
        error: 'engine sollte unterschiedlich sein'
      };
    }
    
    return {
      testName,
      passed: true,
      notes: `Versionsisolierung bestätigt: chart_id V1=${chartV1.chart_id.substring(0, 8)}..., chart_id V1.1=${chartV11.chart_id.substring(0, 8)}..., input_hash identisch`
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
// TEST B: Legacy-Sicherheit
// ============================================
async function testB_LegacySicherheit(): Promise<TestResult> {
  const testName = 'TEST B – Legacy-Sicherheit';
  
  try {
    console.log(`\n🧪 ${testName}`);
    console.log('Setup: Alte Version (1.0.0) bleibt unverändert');
    
    // Generiere Chart mit Version 1.0.0 (Legacy)
    const chartV1_1 = await generateChart('1.0.0');
    
    // Warte kurz
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generiere nochmal mit Version 1.0.0 (sollte deduped werden)
    const chartV1_2 = await generateChart('1.0.0');
    
    // Prüfe: Gleiche chart_id (Dedupe)
    if (chartV1_1.chart_id !== chartV1_2.chart_id) {
      return {
        testName,
        passed: false,
        notes: `Dedupe fehlgeschlagen: chart_id unterschiedlich (V1_1=${chartV1_1.chart_id.substring(0, 8)}..., V1_2=${chartV1_2.chart_id.substring(0, 8)}...)`,
        error: 'Dedupe sollte gleiche chart_id zurückgeben'
      };
    }
    
    // Prüfe: Chart-Daten identisch
    const chartData1 = JSON.stringify(chartV1_1.chart);
    const chartData2 = JSON.stringify(chartV1_2.chart);
    
    if (chartData1 !== chartData2) {
      return {
        testName,
        passed: false,
        notes: 'Chart-Daten unterschiedlich bei gleicher Version',
        error: 'Legacy-Sicherheit fehlgeschlagen'
      };
    }
    
    return {
      testName,
      passed: true,
      notes: 'Legacy-Sicherheit bestätigt: Alte Version bleibt unverändert, Dedupe funktioniert'
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
// TEST C: Default-Version
// ============================================
async function testC_DefaultVersion(): Promise<TestResult> {
  const testName = 'TEST C – Default-Version';
  
  try {
    console.log(`\n🧪 ${testName}`);
    console.log('Setup: Keine chart_version angegeben → Default 1.0.0');
    
    // Generiere Chart ohne chart_version
    const chartDefault = await generateChart();
    
    // Prüfe: Default sollte 1.0.0 sein
    if (chartDefault.chart_version !== '1.0.0') {
      return {
        testName,
        passed: false,
        notes: `Default-Version falsch: ${chartDefault.chart_version} (erwartet: 1.0.0)`,
        error: 'Default-Version sollte 1.0.0 sein'
      };
    }
    
    // Prüfe: Engine sollte astronomy-engine sein
    if (chartDefault.engine !== 'astronomy-engine') {
      return {
        testName,
        passed: false,
        notes: `Default-Engine falsch: ${chartDefault.engine} (erwartet: astronomy-engine)`,
        error: 'Default-Engine sollte astronomy-engine sein'
      };
    }
    
    return {
      testName,
      passed: true,
      notes: 'Default-Version bestätigt: 1.0.0 (astronomy-engine)'
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
// TEST D: Unsupported Version
// ============================================
async function testD_UnsupportedVersion(): Promise<TestResult> {
  const testName = 'TEST D – Unsupported Version';
  
  try {
    console.log(`\n🧪 ${testName}`);
    console.log('Setup: Nicht unterstützte Version (2.0.0)');
    
    try {
      await generateChart('2.0.0');
      
      return {
        testName,
        passed: false,
        notes: 'API akzeptiert nicht unterstützte Version',
        error: 'Unsupported Version sollte abgelehnt werden'
      };
    } catch (error: any) {
      // Erwarteter Fehler
      if (error.message.includes('Unsupported') || error.message.includes('400') || error.message.includes('chart_version')) {
        return {
          testName,
          passed: true,
          notes: 'Unsupported Version korrekt abgelehnt'
        };
      } else {
        return {
          testName,
          passed: false,
          notes: `Unerwarteter Fehler: ${error.message}`,
          error: 'Falscher Fehlertyp'
        };
      }
    }
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
  console.log('🚀 C1 – Chart-Versionierungs-Tests');
  console.log('='.repeat(60));
  console.log(`Chart Truth API URL: ${CHART_TRUTH_API_URL}`);
  console.log(`Test-Timeout: ${TEST_TIMEOUT}ms`);
  console.log('='.repeat(60));
  
  // Führe alle Tests aus
  testResults.push(await testA_VersionsIsolierung());
  testResults.push(await testB_LegacySicherheit());
  testResults.push(await testC_DefaultVersion());
  testResults.push(await testD_UnsupportedVersion());
  
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
  console.log(`\n🎯 GESAMTERGEBNIS: ${allPassed ? '✅ C1 BESTANDEN' : '❌ C1 NICHT BESTANDEN'}`);
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
  testA_VersionsIsolierung,
  testB_LegacySicherheit,
  testC_DefaultVersion,
  testD_UnsupportedVersion,
  runAllTests
};
