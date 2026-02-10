/**
 * Setup Notion Database
 * Add required properties to existing database
 */

const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

async function setupDatabase() {
  try {
    console.log('\n🔧 Setting up Notion database...\n');
    
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    if (!databaseId) {
      console.error('❌ NOTION_DATABASE_ID not set in .env');
      return;
    }
    
    console.log('📊 Updating database properties...');
    
    // Update database with required properties
    const response = await notion.databases.update({
      database_id: databaseId,
      properties: {
        'Judul': {
          title: {}
        },
        'Mata Pelajaran': {
          select: {
            options: [
              { name: 'Matematika', color: 'blue' },
              { name: 'Bahasa Indonesia', color: 'green' },
              { name: 'Bahasa Inggris', color: 'yellow' },
              { name: 'Sejarah', color: 'orange' },
              { name: 'PAI', color: 'purple' },
              { name: 'PJOK', color: 'pink' },
              { name: 'BK', color: 'brown' },
              { name: 'MP 1', color: 'red' },
              { name: 'MP 2', color: 'red' },
              { name: 'MP 3', color: 'red' },
              { name: 'MP 4', color: 'red' },
              { name: 'MK 1', color: 'red' },
              { name: 'MK 2', color: 'red' },
              { name: 'MK 3', color: 'red' },
              { name: 'MK 4', color: 'red' },
              { name: 'Bahasa Jawa', color: 'gray' },
              { name: 'Lainnya', color: 'default' }
            ]
          }
        },
        'Deskripsi': {
          rich_text: {}
        },
        'Deadline': {
          date: {}
        },
        'Tipe': {
          select: {
            options: [
              { name: 'Individu', color: 'blue' },
              { name: 'Kelompok', color: 'green' },
              { name: 'Ujian', color: 'red' }
            ]
          }
        },
        'Prioritas': {
          select: {
            options: [
              { name: 'Urgent', color: 'red' },
              { name: 'Penting', color: 'yellow' },
              { name: 'Normal', color: 'gray' }
            ]
          }
        },
        'Status': {
          select: {
            options: [
              { name: 'Aktif', color: 'blue' },
              { name: 'Selesai', color: 'green' }
            ]
          }
        },
        'Link Pengumpulan': {
          url: {}
        },
        'Catatan': {
          rich_text: {}
        },
        'Created By': {
          rich_text: {}
        }
      }
    });
    
    console.log('✅ Database properties updated!\n');
    console.log('📋 Properties added:');
    console.log('   1. Judul (Title)');
    console.log('   2. Mata Pelajaran (Select)');
    console.log('   3. Deskripsi (Rich Text)');
    console.log('   4. Deadline (Date)');
    console.log('   5. Tipe (Select)');
    console.log('   6. Prioritas (Select)');
    console.log('   7. Status (Select)');
    console.log('   8. Link Pengumpulan (URL)');
    console.log('   9. Catatan (Rich Text)');
    console.log('   10. Created By (Rich Text)\n');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Database setup complete!\n');
    console.log('💡 Next steps:');
    console.log('   1. Open database in Notion');
    console.log('   2. Add your first task');
    console.log('   3. Test sync: node scripts/test-notion-sync.js');
    console.log('   4. Run bot: npm start\n');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\nError details:', error);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure database is shared with integration');
    console.error('   2. Make sure integration has Edit content permission');
    console.error('   3. Check NOTION_API_KEY and NOTION_DATABASE_ID\n');
  }
}

setupDatabase();
