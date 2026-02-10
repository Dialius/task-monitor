/**
 * Test Notion Sync
 * Test sync dari Notion ke MongoDB
 */

const { Client } = require('@notionhq/client');
require('dotenv').config();

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

async function testSync() {
  try {
    console.log('\n🔍 Testing Notion sync...\n');
    
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    if (!databaseId) {
      console.error('❌ NOTION_DATABASE_ID not set in .env');
      return;
    }
    
    // Get database info
    console.log('📊 Retrieving database info...');
    const dbInfo = await notion.databases.retrieve({
      database_id: databaseId,
    });
    
    console.log(`✅ Database: ${dbInfo.title[0]?.plain_text || 'Untitled'}`);
    console.log(`   ID: ${dbInfo.id}`);
    console.log(`   Created: ${new Date(dbInfo.created_time).toLocaleString()}`);
    console.log(`   Last edited: ${new Date(dbInfo.last_edited_time).toLocaleString()}\n`);
    
    // Show properties
    console.log('📋 Database Properties:');
    const properties = dbInfo.properties || {};
    if (Object.keys(properties).length === 0) {
      console.log('   ⚠️  No properties found - database might be empty or not properly configured\n');
    } else {
      Object.keys(properties).forEach((key, index) => {
        const prop = properties[key];
        console.log(`   ${index + 1}. ${key} (${prop.type})`);
      });
      console.log('');
    }
    
    // Try to query pages
    console.log('📄 Querying pages...');
    
    // Use fetch API directly as fallback
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`✅ Found ${data.results.length} page(s) in database\n`);
    
    // Show first page as example
    if (data.results.length > 0) {
      console.log('📝 Example page:');
      const page = data.results[0];
      const props = page.properties;
      
      // Extract common fields
      const judul = props.Judul?.title?.[0]?.plain_text || props.Name?.title?.[0]?.plain_text || 'Untitled';
      const mataPelajaran = props['Mata Pelajaran']?.select?.name || props.Subject?.select?.name || '-';
      const deadline = props.Deadline?.date?.start || props.Date?.date?.start || '-';
      const status = props.Status?.select?.name || '-';
      
      console.log(`   Judul: ${judul}`);
      console.log(`   Mata Pelajaran: ${mataPelajaran}`);
      console.log(`   Deadline: ${deadline}`);
      console.log(`   Status: ${status}\n`);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Notion sync test successful!\n');
    console.log('💡 Next steps:');
    console.log('   1. Add tasks in Notion database');
    console.log('   2. Run bot: npm start');
    console.log('   3. Bot will auto-sync before sending reminders\n');
    
  } catch (error) {
    console.error('❌ Sync test failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure database is shared with integration');
    console.error('   2. Check NOTION_API_KEY is correct');
    console.error('   3. Check NOTION_DATABASE_ID is correct');
    console.error('   4. Make sure integration has Read content permission\n');
  }
}

testSync();
