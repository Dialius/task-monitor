/**
 * Test Reminder Output
 * Show how the reminder will look with current data
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
  notion_id: String
});

const Task = mongoose.model('Task', taskSchema);

// Import RecapFormatter logic
function formatDailyReminder(tasks) {
  if (tasks.length === 0) {
    return '🌟 INFO TUGAS HARIAN\n\nSelamat pagi! 🌅\n\n✨ Tidak ada tugas untuk besok.\nManfaatkan waktu untuk belajar atau istirahat! 💪';
  }

  // Group by subject
  const bySubject = {};
  tasks.forEach(task => {
    if (!bySubject[task.mata_pelajaran]) {
      bySubject[task.mata_pelajaran] = [];
    }
    bySubject[task.mata_pelajaran].push(task);
  });

  let message = '🌟 INFO TUGAS HARIAN\n\n';
  message += 'Selamat pagi! 🌅\n\n';
  message += `📅 Tugas untuk besok (${new Date(Date.now() + 86400000).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })})\n\n`;
  message += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

  Object.entries(bySubject).forEach(([subject, subjectTasks]) => {
    const emoji = getSubjectEmoji(subject);
    message += `${emoji} ${subject.toUpperCase()}\n\n`;

    subjectTasks.forEach((task, index) => {
      message += `${index + 1}. ${task.judul}\n`;
      message += `   📝 ${task.deskripsi}\n`;
      if (task.link_pengumpulan) {
        message += `   🔗 ${task.link_pengumpulan}\n`;
      }
      if (task.catatan) {
        message += `   📌 ${task.catatan}\n`;
      }
      message += '\n';
    });
  });

  message += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
  message += '💪 Semangat mengerjakan tugasnya!\n';
  message += '📚 Jangan lupa cek deadline dan kumpulkan tepat waktu.\n\n';
  message += '✨ Tetap semangat dan jaga kesehatan! 🌟';

  return message;
}

function getSubjectEmoji(subject) {
  const emojiMap = {
    'PJOK': '🏃',
    'MP': '💻',
    'MK': '💻',
    'Matematika': '🔢',
    'MTK': '🔢',
    'Fisika': '⚛️',
    'Kimia': '🧪',
    'KIK': '🧪',
    'Biologi': '🌿',
    'Sejarah': '📚',
    'Geografi': '🌍',
    'Ekonomi': '💰',
    'Sosiologi': '👥',
    'B. Indonesia': '📖',
    'B. Inggris': '🇬🇧',
    'B. Jawa': '🗣️',
    'Seni': '🎨',
    'Prakarya': '✂️',
    'PKN': '🇮🇩',
    'Agama': '🕌',
    'PAI': '🕌',
    'PPc': '📋',
    'BK': '💭'
  };

  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (subject.includes(key)) {
      return emoji;
    }
  }

  return '📝';
}

async function testReminder() {
  try {
    console.log('\n🧪 Testing Reminder Output...\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    
    console.log(`📅 Testing for tomorrow: ${tomorrow.toLocaleDateString('id-ID')}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Get tasks for tomorrow
    const tasks = await Task.find({
      status: 'aktif',
      deadline: {
        $gte: tomorrow,
        $lt: dayAfter
      }
    }).sort({ mata_pelajaran: 1, prioritas: -1 });
    
    console.log(`📊 Found ${tasks.length} tasks for tomorrow\n`);
    
    if (tasks.length > 0) {
      console.log('Tasks:');
      tasks.forEach((task, i) => {
        console.log(`  ${i + 1}. ${task.judul} (${task.mata_pelajaran})`);
      });
      console.log('\n');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📱 REMINDER MESSAGE:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const message = formatDailyReminder(tasks);
    console.log(message);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Also test with all active tasks (weekly view)
    const allTasks = await Task.find({ status: 'aktif' }).sort({ deadline: 1 });
    console.log(`\n📊 Total active tasks: ${allTasks.length}\n`);
    console.log('Next 5 deadlines:');
    allTasks.slice(0, 5).forEach((task, i) => {
      console.log(`  ${i + 1}. ${task.deadline.toLocaleDateString('id-ID')} - ${task.judul} (${task.mata_pelajaran})`);
    });
    console.log('\n');
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  }
}

testReminder();
