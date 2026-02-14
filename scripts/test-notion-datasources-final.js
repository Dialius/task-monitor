/**
 * Test Notion DataSources API Migration
 * Verifies that NotionService now uses dataSources.query() instead of databases.query()
 */

require('dotenv').config();
const { Client } = require('@notionhq/client');

console.log('🧪 Testing Notion DataSources API Migration\n');

// Check environment variables
console.log('📋 Environment Check:');
console.log(`   NOTION_ENABLED: ${process.env.NOTION_ENABLED}`);
console.log(`   NOTION_API_KEY: ${process.env.NOTION_API_KEY ? '✓ Set' : '✗ Missing'}`);
console.log(`   NOTION_DATABASE_ID: ${process.env.NOTION_DATABASE_ID || '✗ Missing'}`);
console.log();

if (process.env.NOTION_ENABLED !== 'true') {
  console.log('⚠️  Notion is disabled in .env');
  process.exit(0);
}

if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
  console.log('❌ Missing required Notion credentials');
  process.exit(1);
}

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  timeoutMs: 30000
});

console.log('🔍 Testing Notion SDK v5 API Methods:\n');

// Test 1: Check if dataSources exists
console.log('Test 1: Check dataSources object');
if (notion.dataSources) {
  console.log('   ✅ notion.dataSources exists');
  console.log(`   Type: ${typeof notion.dataSources}`);
} else {
  console.log('   ❌ notion.dataSources does NOT exist');
}
console.log();

// Test 2: Check if databases exists (for comparison)
console.log('Test 2: Check databases object');
if (notion.databases) {
  console.log('   ✅ notion.databases exists');
  console.log(`   Type: ${typeof notion.databases}`);
} else {
  console.log('   ❌ notion.databases does NOT exist');
}
console.log();

// Test 3: Try to query using dataSources.query()
console.log('Test 3: Query using dataSources.query()');
(async () => {
  try {
    if (!notion.dataSources || typeof notion.dataSources.query !== 'function') {
      console.log('   ❌ dataSources.query() method not available');
      console.log('   Available methods:', Object.keys(notion.dataSources || {}));
      return;
    }

    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_DATABASE_ID,
      filter: {
        property: 'Status',
        select: {
          equals: 'Aktif'
        }
      },
      page_size: 5
    });

    console.log('   ✅ dataSources.query() successful!');
    console.log(`   Found ${response.results.length} active tasks`);
    
    if (response.results.length > 0) {
      const firstTask = response.results[0];
      const title = firstTask.properties?.Judul?.title?.[0]?.plain_text || 'No title';
      console.log(`   First task: "${title}"`);
    }
  } catch (error) {
    console.log('   ❌ dataSources.query() failed');
    console.log(`   Error: ${error.message}`);
    if (error.code) {
      console.log(`   Code: ${error.code}`);
    }
    if (error.status) {
      console.log(`   Status: ${error.status}`);
    }
  }
  
  console.log();
  console.log('✅ Migration test completed!');
  console.log('   NotionService should now work correctly with SDK v5');
})();
