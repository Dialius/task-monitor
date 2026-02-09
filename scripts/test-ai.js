/**
 * Test AI Service Connection
 * Script untuk test koneksi Groq dan Gemini API
 */

require('dotenv').config();
const Groq = require('groq-sdk').default;
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║   🤖 AI SERVICE CONNECTION TEST                       ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Test Groq
async function testGroq() {
  console.log('📋 Testing Groq API...');
  
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';
  
  if (!apiKey) {
    console.log('❌ GROQ_API_KEY tidak ditemukan di .env');
    return false;
  }
  
  console.log(`   API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);
  console.log(`   Model: ${model}`);
  
  try {
    const groq = new Groq({ apiKey });
    
    console.log('   → Mengirim test request...');
    const startTime = Date.now();
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Respond in Indonesian.'
        },
        {
          role: 'user',
          content: 'Halo! Tolong balas dengan "Groq API berfungsi dengan baik!"'
        }
      ],
      model: model,
      temperature: 0.7,
      max_tokens: 100
    });
    
    const latency = Date.now() - startTime;
    const response = completion.choices[0]?.message?.content;
    
    console.log(`   ✅ Groq API berhasil! (${latency}ms)`);
    console.log(`   Response: ${response}\n`);
    return true;
  } catch (error) {
    console.log(`   ❌ Groq API gagal: ${error.message}`);
    if (error.status) {
      console.log(`   Status: ${error.status}`);
    }
    console.log('');
    return false;
  }
}

// Test Gemini
async function testGemini() {
  console.log('📋 Testing Gemini API...');
  
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  
  if (!apiKey) {
    console.log('❌ GEMINI_API_KEY tidak ditemukan di .env');
    return false;
  }
  
  console.log(`   API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);
  console.log(`   Model: ${model}`);
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model });
    
    console.log('   → Mengirim test request...');
    const startTime = Date.now();
    
    const result = await geminiModel.generateContent(
      'Halo! Tolong balas dengan "Gemini API berfungsi dengan baik!"'
    );
    const response = await result.response;
    const text = response.text();
    
    const latency = Date.now() - startTime;
    
    console.log(`   ✅ Gemini API berhasil! (${latency}ms)`);
    console.log(`   Response: ${text}\n`);
    return true;
  } catch (error) {
    console.log(`   ❌ Gemini API gagal: ${error.message}`);
    if (error.status) {
      console.log(`   Status: ${error.status}`);
    }
    console.log('');
    return false;
  }
}

// Test AI Service dengan fallback
async function testAIService() {
  console.log('📋 Testing AI Service (dengan fallback)...');
  
  const testText = 'Tugas matematika tentang integral harus dikumpulkan besok.';
  const context = 'Enhance this task description to be clear and motivating';
  
  console.log(`   Input: "${testText}"`);
  console.log(`   Context: "${context}"`);
  console.log('');
  
  // Try Groq first
  const groqSuccess = await testGroq();
  
  // Try Gemini as fallback
  const geminiSuccess = await testGemini();
  
  // Summary
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   📊 SUMMARY                                          ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  if (groqSuccess && geminiSuccess) {
    console.log('✅ Kedua AI service berfungsi dengan baik!');
    console.log('   Primary: Groq ✅');
    console.log('   Fallback: Gemini ✅');
    console.log('\n💡 Bot akan menggunakan Groq sebagai primary AI service.');
    console.log('   Jika Groq gagal, bot akan otomatis fallback ke Gemini.\n');
  } else if (groqSuccess) {
    console.log('⚠️  Groq berfungsi, tapi Gemini gagal');
    console.log('   Primary: Groq ✅');
    console.log('   Fallback: Gemini ❌');
    console.log('\n💡 Bot akan menggunakan Groq. Jika Groq gagal, bot akan');
    console.log('   menggunakan text original tanpa AI enhancement.\n');
  } else if (geminiSuccess) {
    console.log('⚠️  Gemini berfungsi, tapi Groq gagal');
    console.log('   Primary: Groq ❌');
    console.log('   Fallback: Gemini ✅');
    console.log('\n💡 Bot akan langsung fallback ke Gemini karena Groq gagal.\n');
  } else {
    console.log('❌ Kedua AI service gagal!');
    console.log('   Primary: Groq ❌');
    console.log('   Fallback: Gemini ❌');
    console.log('\n💡 Bot akan tetap berjalan, tapi tanpa AI enhancement.');
    console.log('   Text akan digunakan apa adanya tanpa formatting AI.\n');
  }
  
  console.log('═══════════════════════════════════════════════════════════\n');
}

// Run tests
testAIService().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});
