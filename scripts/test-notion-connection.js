/**
 * Test Notion Connection
 * Script untuk test koneksi ke Notion API
 */

require('dotenv').config();
const { Client } = require('@notionhq/client');

async function testNotionConnection() {
  console.log('🔍 Testing Notion Connection...\n');

  // Check environment variables
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;

  console.log('Environment Variables:');
  console.log(`  NOTION_API_KEY: ${apiKey ? '✅ Set' : '❌ Not set'}`);
  console.log(`  NOTION_DATABASE_ID: ${databaseId ? '✅ Set' : '❌ Not set'}`);
  console.log();

  if (!apiKey || !databaseId) {
    console.error('❌ Missing Notion credentials in .env file');
    process.exit(1);
  }

  try {
    // Initialize Notion client
    console.log('📡 Initializing Notion client...');
    const notion = new Client({ 
      auth: apiKey,
      timeoutMs: 30000
    });

    // Test database access
    console.log('🔍 Testing database access...');
    const database = await notion.databases.retrieve({ 
      database_id: databaseId 
    });

    console.log('✅ Successfully connected to Notion!');
    console.log(`   Database: ${database.title?.[0]?.plain_text || 'Untitled'}`);
    console.log();

    // Test query
    console.log('📋 Testing database query...');
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 5
    });

    console.log(`✅ Query successful! Found ${response.results.length} items`);
    console.log();

    console.log('🎉 All tests passed! Notion integration is working correctly.');
    
  } catch (error) {
    console.error('❌ Notion connection failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.code === 'unauthorized') {
      console.error('\n💡 Possible solutions:');
      console.error('   1. Check if NOTION_API_KEY is correct');
      console.error('   2. Make sure the integration has access to the database');
      console.error('   3. Share the database with your integration');
    } else if (error.code === 'object_not_found') {
      console.error('\n💡 Possible solutions:');
      console.error('   1. Check if NOTION_DATABASE_ID is correct');
      console.error('   2. Make sure the database exists');
      console.error('   3. Share the database with your integration');
    }
    
    process.exit(1);
  }
}

testNotionConnection();
