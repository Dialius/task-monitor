/**
 * Test Add Task to Notion
 */

const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

async function testAddTask() {
  try {
    console.log('\n🧪 Testing Add Task to Notion...\n');
    
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    if (!databaseId) {
      console.error('❌ NOTION_DATABASE_ID not set in .env');
      process.exit(1);
    }
    
    console.log(`📊 Database ID: ${databaseId}\n`);
    
    // Create a test task
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const deadlineStr = tomorrow.toISOString().split('T')[0];
    
    console.log('📝 Creating test task...');
    console.log(`   Judul: Test Task dari Bot`);
    console.log(`   Mata Pelajaran: Matematika`);
    console.log(`   Deadline: ${deadlineStr}\n`);
    
    const response = await notion.pages.create({
      parent: {
        database_id: databaseId
      },
      properties: {
        'Judul': {
          title: [
            {
              text: {
                content: 'Test Task dari Bot'
              }
            }
          ]
        },
        'Mata Pelajaran': {
          select: {
            name: 'Matematika'
          }
        },
        'Deskripsi': {
          rich_text: [
            {
              text: {
                content: 'Ini adalah test task untuk verify bot bisa add ke Notion'
              }
            }
          ]
        },
        'Deadline': {
          date: {
            start: deadlineStr
          }
        },
        'Tipe': {
          select: {
            name: 'Individu'
          }
        },
        'Prioritas': {
          select: {
            name: 'Normal'
          }
        },
        'Status': {
          select: {
            name: 'Aktif'
          }
        },
        'Created By': {
          rich_text: [
            {
              text: {
                content: 'Bot Test'
              }
            }
          ]
        }
      }
    });
    
    console.log('✅ Task created successfully!\n');
    console.log(`📊 Page ID: ${response.id}`);
    console.log(`🔗 URL: ${response.url}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Bot BISA add task ke Notion!');
    console.log('💡 Cek database Notion kamu, task baru sudah muncul.\n');
    
  } catch (error) {
    console.error('\n❌ Failed to add task:', error.message);
    console.error('\n💡 Possible issues:');
    console.error('   1. Database ID salah');
    console.error('   2. Database belum di-share dengan integration');
    console.error('   3. Property names tidak match dengan database schema');
    console.error('   4. Integration tidak punya permission "Insert content"\n');
    
    if (error.code) {
      console.error(`   Error code: ${error.code}\n`);
    }
  }
}

testAddTask();
