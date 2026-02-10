/**
 * Check Notion Data Source Properties
 * For new Notion databases with data_sources
 */

const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

async function checkDataSource() {
  try {
    console.log('\n🔍 Checking Notion Data Source...\n');
    
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
    
    console.log(`✅ Database: ${database.title[0]?.plain_text || 'Untitled'}\n`);
    
    // Check if it has data sources
    if (database.data_sources && database.data_sources.length > 0) {
      console.log('📦 This database uses Data Sources (new Notion feature)\n');
      console.log('Data Sources:');
      database.data_sources.forEach((ds, i) => {
        console.log(`  ${i + 1}. ID: ${ds.id}`);
        console.log(`     Name: ${ds.name}\n`);
      });
      
      // Try to get data source properties
      const dataSourceId = database.data_sources[0].id;
      console.log(`🔍 Fetching properties from data source: ${dataSourceId}\n`);
      
      try {
        // Try to retrieve data source
        const dataSource = await notion.request({
          path: `data_sources/${dataSourceId}`,
          method: 'GET'
        });
        
        console.log('📄 Data Source Object:\n');
        console.log(JSON.stringify(dataSource, null, 2));
        
        if (dataSource.properties) {
          console.log('\n📋 Properties:\n');
          let index = 1;
          for (const [name, prop] of Object.entries(dataSource.properties)) {
            console.log(`${index}. "${name}" (${prop.type})`);
            index++;
          }
        }
      } catch (dsError) {
        console.log('⚠️  Could not fetch data source directly');
        console.log('   Error:', dsError.message);
      }
      
    } else {
      console.log('⚠️  No data sources found\n');
    }
    
    // Check regular properties
    if (database.properties && Object.keys(database.properties).length > 0) {
      console.log('\n📋 Database Properties:\n');
      let index = 1;
      for (const [name, prop] of Object.entries(database.properties)) {
        console.log(`${index}. "${name}" (${prop.type})`);
        index++;
      }
    } else {
      console.log('\n⚠️  No properties in database object\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('💡 SOLUTION:\n');
      console.log('This database has NO properties yet. You need to add them manually in Notion:\n');
      console.log('1. Open database in Notion: https://www.notion.so/' + databaseId.replace(/-/g, ''));
      console.log('2. Click "+ Add a property" or "+ New property"');
      console.log('3. Add all 10 required properties (see NOTION_ADD_PROPERTIES_GUIDE.md)');
      console.log('4. Save and run this script again\n');
      console.log('Required properties:');
      console.log('  1. Judul (Title)');
      console.log('  2. Mata Pelajaran (Select)');
      console.log('  3. Deskripsi (Text)');
      console.log('  4. Deadline (Date)');
      console.log('  5. Tipe (Select)');
      console.log('  6. Prioritas (Select)');
      console.log('  7. Status (Select)');
      console.log('  8. Link Pengumpulan (URL)');
      console.log('  9. Catatan (Text)');
      console.log('  10. Created By (Text)\n');
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

checkDataSource();
