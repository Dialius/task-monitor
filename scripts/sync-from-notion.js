/**
 * Sync Tasks from Notion to MongoDB
 * This will:
 * 1. Clear existing tasks in MongoDB
 * 2. Fetch all tasks from Notion
 * 3. Import them to MongoDB
 */

const { Client } = require('@notionhq/client');
const mongoose = require('mongoose');
require('dotenv').config();

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

// Task Schema (simplified)
const taskSchema = new mongoose.Schema({
  judul: { type: String, required: true },
  mata_pelajaran: { type: String, required: true },
  deskripsi: { type: String, required: true },
  deadline: { type: Date, required: true },
  tipe: { 
    type: String, 
    enum: ['individu', 'kelompok', 'ujian'],
    default: 'individu'
  },
  prioritas: {
    type: String,
    enum: ['urgent', 'penting', 'normal'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['aktif', 'selesai'],
    default: 'aktif'
  },
  link_pengumpulan: String,
  catatan: String,
  created_by: { type: String, default: 'notion' },
  notion_id: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);

async function syncFromNotion() {
  try {
    console.log('\n🔄 Syncing Tasks from Notion to MongoDB...\n');
    
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    if (!databaseId) {
      console.error('❌ NOTION_DATABASE_ID not set in .env');
      process.exit(1);
    }
    
    // Connect to MongoDB
    console.log('📊 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Step 1: Clear existing tasks
    console.log('🗑️  Clearing existing tasks in MongoDB...');
    const deleteResult = await Task.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing tasks\n`);
    
    // Step 2: Get database info first to get data source ID
    console.log('📥 Getting database info...');
    const database = await notion.databases.retrieve({
      database_id: databaseId
    });
    
    // Check if it has data sources
    let dataSourceId = null;
    if (database.data_sources && database.data_sources.length > 0) {
      dataSourceId = database.data_sources[0].id;
      console.log(`✅ Found data source: ${dataSourceId}\n`);
    }
    
    // Fetch tasks from Notion
    console.log('📥 Fetching tasks from Notion...');
    
    let response;
    if (dataSourceId) {
      // Use data source API
      response = await notion.request({
        path: `data_sources/${dataSourceId}/query`,
        method: 'POST',
        body: {
          filter: {
            property: 'Status',
            select: {
              does_not_equal: 'dibatalkan'
            }
          }
        }
      });
    } else {
      // Use regular database query
      response = await notion.databases.query({
        database_id: databaseId,
        filter: {
          property: 'Status',
          select: {
            does_not_equal: 'dibatalkan'
          }
        }
      });
    }
    
    console.log(`✅ Found ${response.results.length} tasks in Notion\n`);
    
    if (response.results.length === 0) {
      console.log('⚠️  No tasks found in Notion. Nothing to import.\n');
      await mongoose.disconnect();
      return;
    }
    
    // Step 3: Import tasks to MongoDB
    console.log('📝 Importing tasks to MongoDB...\n');
    
    let imported = 0;
    let skipped = 0;
    
    for (const page of response.results) {
      try {
        const properties = page.properties;
        
        // Extract properties
        const judul = properties.Judul?.title?.[0]?.plain_text;
        const mata_pelajaran = properties['Mata Pelajaran']?.select?.name;
        const deskripsi = properties.Deskripsi?.rich_text?.[0]?.plain_text || '';
        const deadlineStr = properties.Deadline?.date?.start;
        const tipe = properties.Tipe?.select?.name;
        const prioritas = properties.Prioritas?.select?.name;
        const status = properties.Status?.select?.name;
        const link_pengumpulan = properties['Link Pengumpulan']?.url;
        const catatan = properties.Catatan?.rich_text?.[0]?.plain_text;
        const created_by = properties['Created By']?.rich_text?.[0]?.plain_text || 'notion';
        
        // Validate required fields
        if (!judul || !mata_pelajaran || !deadlineStr) {
          console.log(`⚠️  Skipped: Missing required fields (${judul || 'No title'})`);
          skipped++;
          continue;
        }
        
        // Map values
        const deadline = new Date(deadlineStr);
        const mappedTipe = mapTipe(tipe);
        const mappedPrioritas = mapPrioritas(prioritas);
        const mappedStatus = mapStatus(status);
        
        // Create task
        const task = new Task({
          judul,
          mata_pelajaran,
          deskripsi,
          deadline,
          tipe: mappedTipe,
          prioritas: mappedPrioritas,
          status: mappedStatus,
          link_pengumpulan,
          catatan,
          created_by,
          notion_id: page.id
        });
        
        await task.save();
        
        console.log(`✅ Imported: ${judul} (${mata_pelajaran}) - Deadline: ${deadline.toLocaleDateString('id-ID')}`);
        imported++;
        
      } catch (error) {
        console.error(`❌ Failed to import task:`, error.message);
        skipped++;
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 Sync Summary:');
    console.log(`   Total in Notion: ${response.results.length}`);
    console.log(`   Imported: ${imported}`);
    console.log(`   Skipped: ${skipped}`);
    console.log('\n✅ Sync completed!\n');
    
    // Disconnect
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Helper functions
function mapTipe(notionTipe) {
  if (!notionTipe) return 'individu';
  const lower = notionTipe.toLowerCase();
  if (lower.includes('kelompok')) return 'kelompok';
  if (lower.includes('ujian') || lower.includes('uh')) return 'ujian';
  return 'individu';
}

function mapPrioritas(notionPrioritas) {
  if (!notionPrioritas) return 'normal';
  const lower = notionPrioritas.toLowerCase();
  if (lower === 'urgent') return 'urgent';
  if (lower === 'tinggi' || lower === 'penting') return 'penting';
  if (lower === 'rendah') return 'normal';
  return 'normal';
}

function mapStatus(notionStatus) {
  if (!notionStatus) return 'aktif';
  const lower = notionStatus.toLowerCase();
  if (lower === 'selesai') return 'selesai';
  return 'aktif';
}

syncFromNotion();
