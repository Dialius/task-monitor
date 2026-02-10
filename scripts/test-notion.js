/**
 * Test Notion Connection
 * Script untuk test koneksi ke Notion API dan membuat database
 */

const { Client } = require('@notionhq/client');
require('dotenv').config();

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

/**
 * Test koneksi ke Notion
 */
async function testConnection() {
  try {
    console.log('\n🔍 Testing Notion connection...\n');
    
    // Test dengan list users (basic API call)
    const response = await notion.users.list({});
    
    console.log('✅ Notion connection successful!');
    console.log(`📊 Found ${response.results.length} user(s) in workspace\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Notion connection failed:', error.message);
    console.error('\n💡 Tips:');
    console.error('   1. Pastikan NOTION_API_KEY sudah diisi di .env');
    console.error('   2. Pastikan API key valid (buat di https://www.notion.so/my-integrations)');
    console.error('   3. Pastikan integration sudah dibuat\n');
    return false;
  }
}

/**
 * Test akses ke database
 */
async function testDatabaseAccess() {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    if (!databaseId) {
      console.log('⚠️  NOTION_DATABASE_ID belum diisi di .env');
      console.log('   Lewati test database access\n');
      return false;
    }
    
    console.log('🔍 Testing database access...\n');
    
    // Try to retrieve database first
    try {
      const dbInfo = await notion.databases.retrieve({
        database_id: databaseId,
      });
      
      console.log('✅ Database found!');
      console.log(`📊 Database: ${dbInfo.title[0]?.plain_text || 'Untitled'}\n`);
      
      // Now try to query using proper syntax
      try {
        const response = await notion.databases.query({
          database_id: databaseId,
        });
        
        console.log('✅ Database access successful!');
        console.log(`📊 Found ${response.results.length} item(s) in database\n`);
        
        // Show database structure
        if (response.results.length > 0) {
          const firstPage = response.results[0];
          console.log('📋 Database Properties:');
          const properties = Object.keys(firstPage.properties);
          properties.forEach((prop, index) => {
            console.log(`   ${index + 1}. ${prop}`);
          });
          console.log('');
        }
        
        return true;
      } catch (queryError) {
        console.error('❌ Database query failed:', queryError.message);
        console.error('   Error code:', queryError.code);
        console.error('\n💡 Database found but cannot query. This might be a permission issue.');
        console.error('   Make sure integration has "Read content" permission.\n');
        return false;
      }
    } catch (retrieveError) {
      console.error('❌ Database access failed:', retrieveError.message);
      console.error('   Error code:', retrieveError.code);
      console.error('\n💡 Tips:');
      console.error('   1. Pastikan NOTION_DATABASE_ID sudah benar');
      console.error('   2. Pastikan database sudah di-share dengan integration');
      console.error('   3. Format ID: 32 karakter tanpa dash');
      console.error('   4. Cek apakah integration punya permission Read content\n');
      return false;
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

/**
 * Buat database baru untuk tugas
 */
async function createTaskDatabase(parentPageId) {
  try {
    console.log('📝 Creating new task database...\n');
    
    const response = await notion.databases.create({
      parent: {
        type: 'page_id',
        page_id: parentPageId,
      },
      title: [
        {
          type: 'text',
          text: {
            content: 'Tugas Kelas XI PPLG 3',
          },
        },
      ],
      properties: {
        'Judul': {
          title: {},
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
            ],
          },
        },
        'Deskripsi': {
          rich_text: {},
        },
        'Deadline': {
          date: {},
        },
        'Tipe': {
          select: {
            options: [
              { name: 'Individu', color: 'blue' },
              { name: 'Kelompok', color: 'green' },
              { name: 'Ujian', color: 'red' },
            ],
          },
        },
        'Prioritas': {
          select: {
            options: [
              { name: 'Urgent', color: 'red' },
              { name: 'Penting', color: 'yellow' },
              { name: 'Normal', color: 'gray' },
            ],
          },
        },
        'Status': {
          select: {
            options: [
              { name: 'Aktif', color: 'blue' },
              { name: 'Selesai', color: 'green' },
            ],
          },
        },
        'Link Pengumpulan': {
          url: {},
        },
        'Catatan': {
          rich_text: {},
        },
        'Created By': {
          rich_text: {},
        },
        'Created At': {
          created_time: {},
        },
        'Updated At': {
          last_edited_time: {},
        },
      },
    });
    
    console.log('✅ Database created successfully!');
    console.log(`📊 Database ID: ${response.id}`);
    console.log(`🔗 URL: ${response.url}\n`);
    console.log('💡 Copy Database ID ini ke .env file:');
    console.log(`   NOTION_DATABASE_ID=${response.id}\n`);
    
    return response.id;
  } catch (error) {
    console.error('❌ Failed to create database:', error.message);
    console.error('\n💡 Tips:');
    console.error('   1. Pastikan parent page ID valid');
    console.error('   2. Pastikan integration punya permission untuk create database');
    console.error('   3. Pastikan page sudah di-share dengan integration\n');
    return null;
  }
}

/**
 * Tambah sample task ke database
 */
async function addSampleTask(databaseId) {
  try {
    console.log('📝 Adding sample task...\n');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const response = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        'Judul': {
          title: [
            {
              text: {
                content: 'Sample Task - Test Notion Integration',
              },
            },
          ],
        },
        'Mata Pelajaran': {
          select: {
            name: 'Matematika',
          },
        },
        'Deskripsi': {
          rich_text: [
            {
              text: {
                content: 'Ini adalah sample task untuk test integrasi Notion. Kamu bisa hapus task ini setelah test berhasil.',
              },
            },
          ],
        },
        'Deadline': {
          date: {
            start: tomorrow.toISOString().split('T')[0],
          },
        },
        'Tipe': {
          select: {
            name: 'Individu',
          },
        },
        'Prioritas': {
          select: {
            name: 'Normal',
          },
        },
        'Status': {
          select: {
            name: 'Aktif',
          },
        },
        'Created By': {
          rich_text: [
            {
              text: {
                content: 'System Test',
              },
            },
          ],
        },
      },
    });
    
    console.log('✅ Sample task added successfully!');
    console.log(`🔗 URL: ${response.url}\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to add sample task:', error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   🧪 NOTION CONNECTION TEST                           ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  // Check if API key exists
  if (!process.env.NOTION_API_KEY) {
    console.error('❌ NOTION_API_KEY tidak ditemukan di .env file\n');
    console.log('📝 Cara setup:');
    console.log('   1. Buka https://www.notion.so/my-integrations');
    console.log('   2. Klik "New integration"');
    console.log('   3. Beri nama (contoh: "Class Reminder Bot")');
    console.log('   4. Copy "Internal Integration Token"');
    console.log('   5. Paste ke .env file sebagai NOTION_API_KEY\n');
    process.exit(1);
  }
  
  // Test connection
  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }
  
  // Test database access
  const hasDatabase = await testDatabaseAccess();
  
  // Jika belum ada database, tawarkan untuk create
  if (!hasDatabase) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Untuk membuat database baru:');
    console.log('   1. Buka Notion dan buat page baru');
    console.log('   2. Share page tersebut dengan integration kamu');
    console.log('   3. Copy page ID dari URL (32 karakter setelah workspace name)');
    console.log('      Contoh URL: notion.so/My-Page-1234567890abcdef1234567890abcdef');
    console.log('      Page ID: 1234567890abcdef1234567890abcdef');
    console.log('   4. Jalankan: node scripts/test-notion.js create <PAGE_ID>\n');
  } else {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Notion integration siap digunakan!\n');
    console.log('💡 Next steps:');
    console.log('   1. Bot akan otomatis sync tugas ke Notion');
    console.log('   2. Setiap tugas baru akan muncul di database Notion');
    console.log('   3. Kamu bisa edit di Notion atau via bot\n');
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args[0] === 'create' && args[1]) {
  // Create database mode
  const parentPageId = args[1];
  
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   📝 CREATE NOTION DATABASE                           ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  testConnection().then(async (connected) => {
    if (!connected) {
      process.exit(1);
    }
    
    const databaseId = await createTaskDatabase(parentPageId);
    
    if (databaseId) {
      // Add sample task
      await addSampleTask(databaseId);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('✅ Setup complete!\n');
      console.log('📝 Jangan lupa:');
      console.log(`   1. Copy Database ID ke .env: NOTION_DATABASE_ID=${databaseId}`);
      console.log('   2. Restart bot untuk apply changes');
      console.log('   3. Test dengan command /add_tugas\n');
    }
  });
} else if (args[0] === 'sample' && process.env.NOTION_DATABASE_ID) {
  // Add sample task mode
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   📝 ADD SAMPLE TASK                                  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  testConnection().then(async (connected) => {
    if (!connected) {
      process.exit(1);
    }
    
    await addSampleTask(process.env.NOTION_DATABASE_ID);
  });
} else {
  // Normal test mode
  main();
}
