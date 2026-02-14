/**
 * Verify Notion Status
 * Test if NotionService properly detects enabled status
 */

require('dotenv').config();

async function testNotionService() {
  console.log('🔍 Verifying Notion Service Status\n');
  console.log('='.repeat(60));
  
  // Import NotionService
  const { NotionService } = require('../dist/services/NotionService');
  
  console.log('\n📦 Creating NotionService instance...\n');
  
  const notionService = new NotionService();
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Final Status:');
  console.log(`   isEnabled(): ${notionService.isEnabled()}`);
  
  if (notionService.isEnabled()) {
    console.log('\n✅ SUCCESS! Notion is properly enabled.');
    
    // Try to get sync stats
    console.log('\n🔍 Testing getSyncStats()...');
    try {
      const stats = await notionService.getSyncStats();
      console.log(`   ✅ Notion Tasks: ${stats.notionTasks}`);
      console.log(`   ✅ MongoDB Tasks: ${stats.mongoTasks}`);
      console.log(`   ✅ Synced: ${stats.synced}`);
      console.log(`   ✅ Last Sync: ${stats.lastSync || 'Never'}`);
      console.log('\n✅ Notion is fully functional!');
    } catch (error) {
      console.log(`   ⚠️  getSyncStats() failed: ${error.message}`);
      console.log(`   This might be normal if MongoDB is not running.`);
    }
  } else {
    console.log('\n❌ FAILED! Notion is still disabled.');
    console.log('\nPossible causes:');
    console.log('   1. NOTION_ENABLED is not "true" in .env');
    console.log('   2. NOTION_API_KEY is missing');
    console.log('   3. NOTION_DATABASE_ID is missing');
    console.log('   4. Notion client initialization failed');
  }
  
  console.log('\n' + '='.repeat(60));
}

testNotionService().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
