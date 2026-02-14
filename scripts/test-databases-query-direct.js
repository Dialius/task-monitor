/**
 * Test databases.query directly
 * Check if the method exists at runtime
 */

require('dotenv').config();
const { Client } = require('@notionhq/client');

async function testDatabasesQuery() {
  console.log('🔍 Testing databases.query Method\n');
  console.log('='.repeat(60));
  
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;
  
  console.log(`\n📋 Configuration:`);
  console.log(`   API Key: ${apiKey ? '✅ Present' : '❌ Missing'}`);
  console.log(`   Database ID: ${databaseId}`);
  
  if (!apiKey || !databaseId) {
    console.log('\n❌ Missing credentials!');
    return;
  }
  
  console.log('\n📦 Creating Notion client...');
  const notion = new Client({ auth: apiKey });
  
  console.log('\n🔍 Checking notion.databases object:');
  console.log(`   Type: ${typeof notion.databases}`);
  console.log(`   Methods: ${Object.keys(notion.databases)}`);
  
  console.log('\n🔍 Checking notion.databases.query:');
  console.log(`   Type: ${typeof notion.databases.query}`);
  console.log(`   Exists: ${!!notion.databases.query}`);
  
  if (typeof notion.databases.query === 'function') {
    console.log('\n✅ databases.query method exists!');
    console.log('\n🚀 Testing query...');
    
    try {
      const response = await notion.databases.query({
        database_id: databaseId,
        page_size: 1
      });
      
      console.log(`\n✅ Query successful!`);
      console.log(`   Results: ${response.results.length}`);
      console.log(`   Has more: ${response.has_more}`);
      
      if (response.results.length > 0) {
        console.log(`\n📄 First result:`);
        console.log(`   ID: ${response.results[0].id}`);
        console.log(`   Object: ${response.results[0].object}`);
      }
    } catch (error) {
      console.log(`\n❌ Query failed: ${error.message}`);
      if (error.code) {
        console.log(`   Error code: ${error.code}`);
      }
      if (error.status) {
        console.log(`   HTTP status: ${error.status}`);
      }
    }
  } else {
    console.log('\n❌ databases.query method does NOT exist!');
    console.log('\n💡 Available methods on databases:');
    for (const key of Object.keys(notion.databases)) {
      console.log(`   - ${key}: ${typeof notion.databases[key]}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
}

testDatabasesQuery().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
