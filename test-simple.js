/**
 * Einfacher Test für lokale Konfiguration
 */

import dotenv from 'dotenv';
import OpenAI from 'openai';

// Lade .env Datei
dotenv.config();

console.log('🔍 Teste lokale Konfiguration...\n');

// 1. Prüfe Environment-Variablen
const openaiKey = process.env.OPENAI_API_KEY;
if (openaiKey) {
  const keyPreview = openaiKey.substring(0, 20) + '...' + openaiKey.substring(openaiKey.length - 4);
  console.log(`✅ OPENAI_API_KEY: Gesetzt (${keyPreview})`);
} else {
  console.log('❌ OPENAI_API_KEY: Nicht gesetzt');
  process.exit(1);
}

// 2. Test OpenAI Client
console.log('\n📡 Teste OpenAI Client...');
try {
  const openai = new OpenAI({
    apiKey: openaiKey,
  });
  console.log('✅ OpenAI Client initialisiert');
  
  // Einfacher Test-Request
  console.log('📤 Sende Test-Request...');
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "user", content: "Antworte nur mit 'OK' wenn du diese Nachricht erhältst." }
    ],
    max_tokens: 10
  });
  
  if (completion.choices[0].message.content) {
    console.log(`✅ API-Verbindung erfolgreich!`);
    console.log(`   Antwort: "${completion.choices[0].message.content}"`);
    console.log(`   Tokens: ${completion.usage.total_tokens}`);
    console.log('\n🎉 Konfiguration funktioniert perfekt!');
  }
} catch (error) {
  console.log(`❌ Fehler: ${error.message}`);
  if (error.status === 401) {
    console.log('⚠️  API Key ist ungültig oder abgelaufen');
  }
  process.exit(1);
}

