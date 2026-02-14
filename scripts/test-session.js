/**
 * Test WhatsApp Session Persistence
 * 
 * Script ini untuk test apakah session tersimpan dengan benar
 */

const fs = require('fs');
const path = require('path');

const AUTH_DIR = path.join(__dirname, '..', 'auth_info');

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║  🔍 WHATSAPP SESSION CHECKER                          ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Check if auth_info folder exists
if (!fs.existsSync(AUTH_DIR)) {
  console.log('❌ Folder auth_info tidak ditemukan!');
  console.log('   Buat folder dengan: mkdir auth_info\n');
  process.exit(1);
}

console.log('✅ Folder auth_info ditemukan\n');

// Check files in auth_info
const files = fs.readdirSync(AUTH_DIR);

if (files.length === 0 || (files.length === 1 && files[0] === '.gitkeep')) {
  console.log('⚠️  Belum ada session tersimpan\n');
  console.log('📋 Cara mendapatkan session:');
  console.log('   1. Jalankan bot: npm start');
  console.log('   2. Scan QR code dengan WhatsApp');
  console.log('   3. Session akan tersimpan otomatis\n');
  process.exit(0);
}

console.log('✅ Session ditemukan!\n');
console.log('📁 Files dalam auth_info:');

let hasCredsJson = false;
let hasAppStateKeys = false;

files.forEach(file => {
  if (file === '.gitkeep') return;
  
  const filePath = path.join(AUTH_DIR, file);
  const stats = fs.statSync(filePath);
  const sizeKB = (stats.size / 1024).toFixed(2);
  
  console.log(`   • ${file} (${sizeKB} KB)`);
  
  if (file === 'creds.json') {
    hasCredsJson = true;
    
    // Check creds.json content
    try {
      const creds = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (creds.me && creds.me.id) {
        console.log(`     ✓ Phone: ${creds.me.id}`);
      }
      if (creds.registered !== undefined) {
        console.log(`     ✓ Registered: ${creds.registered}`);
      }
    } catch (error) {
      console.log(`     ⚠️  Error reading creds.json: ${error.message}`);
    }
  }
  
  if (file.startsWith('app-state-sync-key-')) {
    hasAppStateKeys = true;
  }
});

console.log('');

// Validation
console.log('📊 Session Status:\n');

if (hasCredsJson) {
  console.log('   ✅ creds.json - Credentials tersimpan');
} else {
  console.log('   ❌ creds.json - MISSING! Session tidak lengkap');
}

if (hasAppStateKeys) {
  console.log('   ✅ app-state-sync-key-* - State keys tersimpan');
} else {
  console.log('   ⚠️  app-state-sync-key-* - Tidak ada (mungkin belum sync)');
}

console.log('');

if (hasCredsJson) {
  console.log('🎉 Session VALID! Bot akan auto-connect tanpa QR code\n');
  console.log('💡 Tips:');
  console.log('   • Backup folder auth_info secara berkala');
  console.log('   • Jangan commit file session ke git (sudah di .gitignore)');
  console.log('   • Untuk Railway: setup volume di /app/auth_info\n');
} else {
  console.log('⚠️  Session TIDAK LENGKAP! Bot akan minta QR code lagi\n');
}

// Check .gitignore
const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf8');
  
  if (gitignore.includes('auth_info/*') && gitignore.includes('!auth_info/.gitkeep')) {
    console.log('✅ .gitignore configured correctly\n');
  } else {
    console.log('⚠️  .gitignore might need update:\n');
    console.log('   Add these lines:');
    console.log('   auth_info/*');
    console.log('   !auth_info/.gitkeep\n');
  }
}

// Calculate total size
const totalSize = files
  .filter(f => f !== '.gitkeep')
  .reduce((sum, file) => {
    const filePath = path.join(AUTH_DIR, file);
    return sum + fs.statSync(filePath).size;
  }, 0);

if (totalSize > 0) {
  console.log(`📦 Total session size: ${(totalSize / 1024).toFixed(2)} KB\n`);
}
