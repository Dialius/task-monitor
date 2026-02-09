/**
 * Test AI Enhancement for Task Description
 * Script untuk test AI enhancement dengan prompt yang lebih ringkas
 */

require('dotenv').config();
const Groq = require('groq-sdk').default;

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║   🤖 AI ENHANCEMENT TEST                              ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Test cases
const testCases = [
  {
    input: 'Tulis essay tentang kemerdekaan Indonesia',
    context: 'Rewrite in Indonesian. Maximum 1-2 short sentences. Keep only the core task, remove any extra explanation or motivation. Be direct and concise.'
  },
  {
    input: 'Kerjakan soal matematika halaman 45-50',
    context: 'Rewrite in Indonesian. Maximum 1-2 short sentences. Keep only the core task, remove any extra explanation or motivation. Be direct and concise.'
  },
  {
    input: 'Buat presentasi tentang sistem tata surya',
    context: 'Rewrite in Indonesian. Maximum 1-2 short sentences. Keep only the core task, remove any extra explanation or motivation. Be direct and concise.'
  }
];

async function testEnhancement() {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  
  if (!apiKey) {
    console.log('❌ GROQ_API_KEY tidak ditemukan di .env');
    return;
  }
  
  const groq = new Groq({ apiKey });
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    
    console.log(`\n📋 Test Case ${i + 1}:`);
    console.log(`   Input: "${testCase.input}"`);
    console.log('   → Processing with AI...');
    
    try {
      const startTime = Date.now();
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a text editor that makes descriptions concise. ${testCase.context}. Output only the improved text, nothing else.`
          },
          {
            role: 'user',
            content: testCase.input
          }
        ],
        model: model,
        temperature: 0.3,
        max_tokens: 100
      });
      
      const latency = Date.now() - startTime;
      const enhanced = completion.choices[0]?.message?.content;
      
      console.log(`   ✅ Enhanced (${latency}ms):`);
      console.log(`   "${enhanced}"`);
      console.log(`   Length: ${enhanced.length} characters`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   📊 SUMMARY                                          ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  console.log('✅ AI enhancement sekarang lebih ringkas dan fokus!');
  console.log('   • Temperature: 0.3 (lebih konsisten dan ringkas)');
  console.log('   • Max tokens: 100 (lebih pendek)');
  console.log('   • Prompt: Hanya inti tugas, tanpa penjelasan tambahan\n');
}

testEnhancement().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
