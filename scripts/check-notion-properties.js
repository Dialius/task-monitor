/**
 * Check Notion Database Properties
 */

const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

async function checkProperties() {
  try {
    console.log('\n🔍 Checking Notion Database Properties...\n');
    
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    if (!databaseId) {
      console.error('❌ NOTION_DATABASE_ID not set in .env');
      process.exit(1);
    }
    
    console.log(`📊 Database ID: ${databaseId}\n`);
    
    // Retrieve database to get properties
    const database = await notion.databases.retrieve({
      database_id: databaseId
    });
    
    console.log(`✅ Database: ${database.title[0]?.plain_text || 'Untitled'}\n`);
    console.log('📋 Properties:\n');
    
    const properties = database.properties;
    let index = 1;
    
    for (const [name, prop] of Object.entries(properties)) {
      console.log(`${index}. "${name}" (${prop.type})`);
      index++;
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💡 Use these exact property names when adding tasks!\n');
    
  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    
    if (error.code === 'object_not_found') {
      console.error('\n💡 Database not found or not shared with integration.');
      console.error('   1. Check NOTION_DATABASE_ID in .env');
      console.error('   2. Share database with integration in Notion\n');
    }
  }
}

checkProperties();
