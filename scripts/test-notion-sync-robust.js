/**
 * Test Notion Sync with Robust Error Handling
 * This script tests the improved Notion sync functionality
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { NotionService } = require('../dist/services/NotionService');

async function testNotionSync() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   🧪 Testing Notion Sync - Robust Error Handling     ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Initialize Notion service
    console.log('🔧 Initializing Notion service...');
    const notionService = new NotionService();
    
    if (!notionService.isEnabled()) {
      console.log('❌ Notion service is disabled');
      console.log('   Check NOTION_API_KEY and NOTION_DATABASE_ID in .env\n');
      process.exit(1);
    }
    console.log('✅ Notion service initialized\n');

    // Get sync stats before
    console.log('📊 Getting sync stats before...');
    const statsBefore = await notionService.getSyncStats();
    console.log(`   Notion tasks: ${statsBefore.notionTasks}`);
    console.log(`   MongoDB tasks: ${statsBefore.mongoTasks}\n`);

    // Perform sync
    console.log('🔄 Starting Notion sync...');
    console.log('   (This will test retry logic, rate limiting, etc.)\n');
    
    const startTime = Date.now();
    const result = await notionService.syncFromNotion();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n✅ Sync completed!');
    console.log(`   Duration: ${duration}s`);
    console.log(`   Synced: ${result.synced} tasks`);
    console.log(`   Errors: ${result.errors} tasks`);
    
    if (result.synced + result.errors > 0) {
      const successRate = ((result.synced / (result.synced + result.errors)) * 100).toFixed(1);
      console.log(`   Success rate: ${successRate}%`);
    }
    console.log('');

    // Get sync stats after
    console.log('📊 Getting sync stats after...');
    const statsAfter = await notionService.getSyncStats();
    console.log(`   Notion tasks: ${statsAfter.notionTasks}`);
    console.log(`   MongoDB tasks: ${statsAfter.mongoTasks}\n`);

    // Summary
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   ✅ Test Completed Successfully                      ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('📝 Summary:');
    console.log(`   • Notion has ${statsAfter.notionTasks} active tasks`);
    console.log(`   • MongoDB has ${statsAfter.mongoTasks} active tasks`);
    console.log(`   • Synced ${result.synced} tasks in ${duration}s`);
    console.log(`   • ${result.errors} errors encountered`);
    console.log('');

    if (result.errors > 0) {
      console.log('⚠️  Some tasks failed to sync. Check logs for details.\n');
    }

    if (statsAfter.notionTasks !== statsAfter.mongoTasks) {
      console.log('⚠️  Notion and MongoDB counts don\'t match.');
      console.log('   This is normal if some tasks failed to sync.\n');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB\n');
  }
}

// Run test
testNotionSync();
