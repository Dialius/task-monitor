/**
 * Test Notion Configuration
 * Check if Notion is properly configured and enabled
 */

require('dotenv').config();

console.log('🔍 Testing Notion Configuration\n');
console.log('='.repeat(60));

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log(`   NOTION_ENABLED: "${process.env.NOTION_ENABLED}"`);
console.log(`   NOTION_API_KEY: ${process.env.NOTION_API_KEY ? '✅ Set (length: ' + process.env.NOTION_API_KEY.length + ')' : '❌ Not set'}`);
console.log(`   NOTION_DATABASE_ID: ${process.env.NOTION_DATABASE_ID ? '✅ Set (length: ' + process.env.NOTION_DATABASE_ID.length + ')' : '❌ Not set'}`);

// Parse NOTION_ENABLED
const enabled = process.env.NOTION_ENABLED === 'true';
console.log(`\n🔧 Parsed Values:`);
console.log(`   enabled (boolean): ${enabled}`);
console.log(`   Type check: ${typeof process.env.NOTION_ENABLED}`);
console.log(`   Strict equality: ${process.env.NOTION_ENABLED === 'true'}`);

// Check credentials
const hasApiKey = !!process.env.NOTION_API_KEY;
const hasDatabaseId = !!process.env.NOTION_DATABASE_ID;

console.log(`\n✅ Validation:`);
console.log(`   Has API Key: ${hasApiKey}`);
console.log(`   Has Database ID: ${hasDatabaseId}`);
console.log(`   All checks passed: ${enabled && hasApiKey && hasDatabaseId}`);

// Try to initialize Notion client
if (enabled && hasApiKey && hasDatabaseId) {
  console.log(`\n🔌 Testing Notion Client Initialization...`);
  
  try {
    const { Client } = require('@notionhq/client');
    
    const notion = new Client({
      auth: process.env.NOTION_API_KEY,
      timeoutMs: 30000
    });
    
    console.log(`   ✅ Notion client created successfully`);
    console.log(`   ✅ Client type: ${typeof notion}`);
    console.log(`   ✅ Has databases: ${!!notion.databases}`);
    console.log(`   ✅ Has query method: ${typeof notion.databases.query === 'function'}`);
    
    // Try to query database
    console.log(`\n🔍 Testing Database Connection...`);
    
    notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      page_size: 1
    })
    .then(response => {
      console.log(`   ✅ Database connection successful!`);
      console.log(`   ✅ Database has ${response.results.length} results (showing 1)`);
      console.log(`\n✅ NOTION IS FULLY FUNCTIONAL!`);
    })
    .catch(error => {
      console.log(`   ❌ Database connection failed:`);
      console.log(`   Error: ${error.message}`);
      console.log(`\n⚠️  Notion client works but database connection failed.`);
      console.log(`   Check:`);
      console.log(`   1. Database ID is correct`);
      console.log(`   2. Integration has access to the database`);
      console.log(`   3. API key is valid`);
    });
    
  } catch (error) {
    console.log(`   ❌ Failed to initialize Notion client:`);
    console.log(`   Error: ${error.message}`);
    console.log(`\n⚠️  Check if @notionhq/client is installed:`);
    console.log(`   npm install @notionhq/client`);
  }
} else {
  console.log(`\n❌ NOTION CONFIGURATION INCOMPLETE`);
  console.log(`\nMissing:`);
  if (!enabled) console.log(`   - NOTION_ENABLED must be "true"`);
  if (!hasApiKey) console.log(`   - NOTION_API_KEY is not set`);
  if (!hasDatabaseId) console.log(`   - NOTION_DATABASE_ID is not set`);
}

console.log('\n' + '='.repeat(60));
