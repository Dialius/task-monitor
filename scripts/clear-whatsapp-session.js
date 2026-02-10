/**
 * Clear WhatsApp Session
 * Use this to force re-authentication with QR code
 */

const fs = require('fs').promises;
const path = require('path');

async function clearSession() {
  try {
    console.log('\n🗑️  Clearing WhatsApp Session...\n');
    
    const authDir = path.resolve('./auth_info');
    
    // Check if directory exists
    try {
      await fs.access(authDir);
    } catch {
      console.log('⚠️  Auth directory does not exist');
      console.log('💡 Session is already clear\n');
      return;
    }
    
    // Read all files
    const files = await fs.readdir(authDir);
    
    if (files.length === 0 || (files.length === 1 && files[0] === '.gitkeep')) {
      console.log('⚠️  No session files found');
      console.log('💡 Session is already clear\n');
      return;
    }
    
    console.log(`📋 Found ${files.length} file(s) in auth_info/\n`);
    
    let deleted = 0;
    
    // Delete all files except .gitkeep
    for (const file of files) {
      if (file !== '.gitkeep') {
        const filePath = path.join(authDir, file);
        await fs.unlink(filePath);
        console.log(`   ✅ Deleted: ${file}`);
        deleted++;
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`✅ Session cleared successfully!`);
    console.log(`   Deleted ${deleted} file(s)\n`);
    console.log('💡 Next time you start the bot, QR code will be generated\n');
    console.log('🚀 Start bot with: npm start\n');
    
  } catch (error) {
    console.error('\n❌ Failed to clear session:', error.message);
    console.error('\n💡 Manual solution:');
    console.error('   1. Stop bot if running');
    console.error('   2. Delete auth_info folder manually');
    console.error('   3. Start bot again\n');
    process.exit(1);
  }
}

clearSession();
