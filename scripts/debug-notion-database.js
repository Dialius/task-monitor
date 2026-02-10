/**
 * Debug Notion Database - Show full database object
 */

const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

async function debugDatabase() {
  try {
    console.log('\n🔍 Debugging Notion Database...\n');
    
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    if (!databaseId) {
      console.error('❌ NOTION_DATABASE_ID not set in .env');
      process.exit(1);
    }
    
    console.log(`📊 Database ID: ${databaseId}\n`);
    
    // Retrieve database
    const database = await notion.databases.retrieve({
      database_id: databaseId
    });
    
    console.log('📄 Full Database Object:\n');
    console.log(JSON.stringify(database, null, 2));
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📋 Database Info:');
    console.log(`   Title: ${database.title[0]?.plain_text || 'Untitled'}`);
    console.log(`   Object: ${database.object}`);
    console.log(`   ID: ${database.id}`);
    console.log(`   Created: ${database.created_time}`);
    console.log(`   Last Edited: ${database.last_edited_time}`);
    console.log(`   URL: ${database.url}`);
    
    console.log('\n📋 Properties:');
    if (database.properties && Object.keys(database.properties).length > 0) {
      console.log(JSON.stringify(database.properties, null, 2));
    } else {
      console.log('   ⚠️  No properties found!');
    }
    
    console.log('\n');
    
  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    console.error('\nFull error:');
    console.error(error);
    
    if (error.code === 'object_not_found') {
      console.error('\n💡 Database not found or not shared with integration.');
      console.error('   1. Check NOTION_DATABASE_ID in .env');
      console.error('   2. Share database with integration in Notion\n');
    }
  }
}

debugDatabase();
