/**
 * Check Tasks in MongoDB
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

// Task Schema
const taskSchema = new mongoose.Schema({
  judul: String,
  mata_pelajaran: String,
  deskripsi: String,
  deadline: Date,
  tipe: String,
  prioritas: String,
  status: String,
  link_pengumpulan: String,
  catatan: String,
  created_by: String,
  notion_id: String,
  created_at: Date,
  updated_at: Date
});

const Task = mongoose.model('Task', taskSchema);

async function checkTasks() {
  try {
    console.log('\n📊 Checking Tasks in MongoDB...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get all tasks
    const tasks = await Task.find({}).sort({ deadline: 1 });
    
    console.log(`📋 Total Tasks: ${tasks.length}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (tasks.length === 0) {
      console.log('⚠️  No tasks found in MongoDB\n');
    } else {
      tasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.judul}`);
        console.log(`   📚 Mata Pelajaran: ${task.mata_pelajaran}`);
        console.log(`   📅 Deadline: ${task.deadline.toLocaleDateString('id-ID')}`);
        console.log(`   📝 Tipe: ${task.tipe}`);
        console.log(`   🎯 Prioritas: ${task.prioritas}`);
        console.log(`   ✅ Status: ${task.status}`);
        if (task.link_pengumpulan) {
          console.log(`   🔗 Link: ${task.link_pengumpulan}`);
        }
        if (task.catatan) {
          console.log(`   📌 Catatan: ${task.catatan.substring(0, 50)}${task.catatan.length > 50 ? '...' : ''}`);
        }
        console.log(`   👤 Created by: ${task.created_by}`);
        if (task.notion_id) {
          console.log(`   🔗 Notion ID: ${task.notion_id}`);
        }
        console.log('');
      });
    }
    
    // Group by status
    const aktif = tasks.filter(t => t.status === 'aktif').length;
    const selesai = tasks.filter(t => t.status === 'selesai').length;
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 Summary by Status:');
    console.log(`   Aktif: ${aktif}`);
    console.log(`   Selesai: ${selesai}`);
    
    // Group by prioritas
    const urgent = tasks.filter(t => t.prioritas === 'urgent').length;
    const penting = tasks.filter(t => t.prioritas === 'penting').length;
    const normal = tasks.filter(t => t.prioritas === 'normal').length;
    
    console.log('\n📊 Summary by Prioritas:');
    console.log(`   Urgent: ${urgent}`);
    console.log(`   Penting: ${penting}`);
    console.log(`   Normal: ${normal}`);
    
    // Group by mata pelajaran
    const byMapel = {};
    tasks.forEach(t => {
      byMapel[t.mata_pelajaran] = (byMapel[t.mata_pelajaran] || 0) + 1;
    });
    
    console.log('\n📊 Summary by Mata Pelajaran:');
    Object.entries(byMapel)
      .sort((a, b) => b[1] - a[1])
      .forEach(([mapel, count]) => {
        console.log(`   ${mapel}: ${count}`);
      });
    
    console.log('\n');
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  }
}

checkTasks();
