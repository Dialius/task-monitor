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
    
    if (!properties || Object.keys(properties).length === 0) {
      console.log('⚠️  No properties found in database!\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('📝 Required Properties:\n');
      console.log('1. "Judul" (title)');
      console.log('2. "Mata Pelajaran" (select)');
      console.log('3. "Deskripsi" (rich_text)');
      console.log('4. "Deadline" (date)');
      console.log('5. "Tipe" (select)');
      console.log('6. "Prioritas" (select)');
      console.log('7. "Status" (select)');
      console.log('8. "Link Pengumpulan" (url)');
      console.log('9. "Catatan" (rich_text)');
      console.log('10. "Created By" (rich_text)\n');
      console.log('💡 Add these properties in Notion UI manually.');
      console.log('   See NOTION_ADD_PROPERTIES_GUIDE.md for step-by-step guide.\n');
      return;
    }
    
    let index = 1;
    const propertyList = [];
    
    for (const [name, prop] of Object.entries(properties)) {
      console.log(`${index}. "${name}" (${prop.type})`);
      propertyList.push({ name, type: prop.type });
      index++;
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Check if all required properties exist
    const required = [
      { name: 'Judul', type: 'title' },
      { name: 'Mata Pelajaran', type: 'select' },
      { name: 'Deskripsi', type: 'rich_text' },
      { name: 'Deadline', type: 'date' },
      { name: 'Tipe', type: 'select' },
      { name: 'Prioritas', type: 'select' },
      { name: 'Status', type: 'select' },
      { name: 'Link Pengumpulan', type: 'url' },
      { name: 'Catatan', type: 'rich_text' },
      { name: 'Created By', type: 'rich_text' }
    ];
    
    const missing = [];
    const wrongType = [];
    
    for (const req of required) {
      const found = propertyList.find(p => p.name === req.name);
      if (!found) {
        missing.push(req.name);
      } else if (found.type !== req.type) {
        wrongType.push({ name: req.name, expected: req.type, actual: found.type });
      }
    }
    
    if (missing.length === 0 && wrongType.length === 0) {
      console.log('✅ All required properties found with correct types!\n');
      console.log('🎉 Bot is ready to sync tasks to Notion!\n');
      console.log('💡 Test with: node scripts/test-add-notion-task.js\n');
    } else {
      if (missing.length > 0) {
        console.log('⚠️  Missing properties:\n');
        missing.forEach(name => console.log(`   - ${name}`));
        console.log('');
      }
      
      if (wrongType.length > 0) {
        console.log('⚠️  Wrong property types:\n');
        wrongType.forEach(({ name, expected, actual }) => {
          console.log(`   - "${name}": expected ${expected}, got ${actual}`);
        });
        console.log('');
      }
      
      console.log('💡 See NOTION_ADD_PROPERTIES_GUIDE.md for instructions.\n');
    }
    
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
