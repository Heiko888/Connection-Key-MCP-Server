/**
 * Test-Snippet für Chart Truth Service
 * Verifiziert Deterministik: gleicher Input → gleicher Hash → identischer Output
 */

import { getChartTruth, ChartTruthInput } from './chartTruthService';

/**
 * Test: Deterministische Berechnung
 * 
 * Gleicher Input muss:
 * 1. Gleichen input_hash erzeugen
 * 2. Identischen Chart-Output liefern (abgesehen von calculated_at)
 */
async function testDeterminism() {
  const testInput: ChartTruthInput = {
    birth_date: '1990-01-15',
    birth_time: '14:30',
    latitude: 52.52,
    longitude: 13.405,
    timezone: 'Europe/Berlin'
  };

  console.log('🧪 Test: Deterministische Chart-Berechnung');
  console.log('==========================================\n');

  // Erste Berechnung
  console.log('1️⃣ Erste Berechnung...');
  const result1 = await getChartTruth(testInput);
  console.log(`   Input Hash: ${result1.input_hash.substring(0, 16)}...`);
  console.log(`   Calculated At: ${result1.calculated_at}`);
  console.log(`   Type: ${result1.core.type}`);
  console.log(`   Profile: ${result1.core.profile}`);
  console.log(`   Channels: ${result1.channels.length} aktiv`);
  console.log('');

  // Zweite Berechnung (gleicher Input)
  console.log('2️⃣ Zweite Berechnung (gleicher Input)...');
  const result2 = await getChartTruth(testInput);
  console.log(`   Input Hash: ${result2.input_hash.substring(0, 16)}...`);
  console.log(`   Calculated At: ${result2.calculated_at}`);
  console.log(`   Type: ${result2.core.type}`);
  console.log(`   Profile: ${result2.core.profile}`);
  console.log(`   Channels: ${result2.channels.length} aktiv`);
  console.log('');

  // Verifikation
  console.log('✅ Verifikation:');
  const hashMatch = result1.input_hash === result2.input_hash;
  const typeMatch = result1.core.type === result2.core.type;
  const profileMatch = result1.core.profile === result2.core.profile;
  const channelsMatch = JSON.stringify(result1.channels) === JSON.stringify(result2.channels);
  const centersMatch = JSON.stringify(result1.centers) === JSON.stringify(result2.centers);
  const gatesMatch = JSON.stringify(result1.gates) === JSON.stringify(result2.gates);

  console.log(`   Input Hash identisch: ${hashMatch ? '✅' : '❌'}`);
  console.log(`   Type identisch: ${typeMatch ? '✅' : '❌'}`);
  console.log(`   Profile identisch: ${profileMatch ? '✅' : '❌'}`);
  console.log(`   Channels identisch: ${channelsMatch ? '✅' : '❌'}`);
  console.log(`   Centers identisch: ${centersMatch ? '✅' : '❌'}`);
  console.log(`   Gates identisch: ${gatesMatch ? '✅' : '❌'}`);

  const allMatch = hashMatch && typeMatch && profileMatch && channelsMatch && centersMatch && gatesMatch;
  console.log(`\n   ${allMatch ? '✅ ALLE TESTS BESTANDEN' : '❌ FEHLER: Nicht-deterministisch'}`);

  return allMatch;
}

// Export für Verwendung in anderen Tests
export { testDeterminism };

// Direkter Aufruf (falls als Script ausgeführt)
if (require.main === module) {
  testDeterminism()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test fehlgeschlagen:', error);
      process.exit(1);
    });
}
