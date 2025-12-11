/**
 * Test-Script für lokale Konfiguration
 * Prüft ob OpenAI API Key korrekt geladen wird
 */

import { config } from './config.js';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Lade .env Datei
dotenv.config();

console.log('🔍 Teste lokale Konfiguration...\n');

// 1. Prüfe Environment-Variablen
console.log('1. Environment-Variablen:');
const openaiKey = process.env.OPENAI_API_KEY;
if (openaiKey) {
  const keyPreview = openaiKey.substring(0, 20) + '...' + openaiKey.substring(openaiKey.length - 4);
  console.log(`   ✅ OPENAI_API_KEY: Gesetzt (${keyPreview})`);
} else {
  console.log('   ❌ OPENAI_API_KEY: Nicht gesetzt');
}
console.log(`   N8N_BASE_URL: ${process.env.N8N_BASE_URL || 'Nicht gesetzt (Standard: http://localhost:5678)'}`);
console.log('');

// 2. Prüfe config.js
console.log('2. Config.js:');
if (config.openai.apiKey) {
  const keyPreview = config.openai.apiKey.substring(0, 20) + '...' + config.openai.apiKey.substring(config.openai.apiKey.length - 4);
  console.log(`   ✅ OpenAI Key: Gesetzt (${keyPreview})`);
} else {
  console.log('   ❌ OpenAI Key: Nicht gesetzt');
}
console.log(`   n8n Base URL: ${config.n8n.baseUrl}`);
console.log('');

// 3. Test OpenAI Client (falls Key vorhanden)
if (openaiKey) {
  console.log('3. OpenAI Client Test:');
  try {
    const openai = new OpenAI({
      apiKey: openaiKey,
    });
    console.log('   ✅ OpenAI Client initialisiert');
    
    // Einfacher Test-Request (optional - kostet Tokens)
    console.log('   📡 Teste API-Verbindung...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "user", content: "Antworte nur mit 'OK' wenn du diese Nachricht erhältst." }
      ],
      max_tokens: 10
    });
    
    if (completion.choices[0].message.content) {
      console.log(`   ✅ API-Verbindung erfolgreich! Antwort: "${completion.choices[0].message.content}"`);
      console.log(`   📊 Tokens verwendet: ${completion.usage.total_tokens}`);
    }
  } catch (error) {
    console.log(`   ❌ Fehler: ${error.message}`);
    if (error.status === 401) {
      console.log('   ⚠️  API Key ist ungültig oder abgelaufen');
    }
  }
} else {
  console.log('3. OpenAI Client Test:');
  console.log('   ⚠️  OPENAI_API_KEY nicht gesetzt - Test übersprungen');
}

console.log('\n✅ Test abgeschlossen!');

