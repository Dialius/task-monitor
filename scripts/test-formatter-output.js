/**
 * Test Formatter Output
 * Script untuk test output formatter
 */

// Simulate task data
const tasks = [
  {
    _id: '6989fc62e52dcb6f17493d50',
    judul: 'Soal Matematika Bab 5',
    mata_pelajaran: 'Matematika',
    deadline: new Date('2026-02-10'),
    prioritas: 'urgent',
    tipe: 'individu',
    deskripsi: 'Selesaikan soal integral di halaman 45-50'
  }
];

// Format task list
function formatTaskList(tasks) {
  if (tasks.length === 0) {
    return '📝 Tidak ada tugas saat ini.';
  }

  let result = '📝 **Daftar Tugas:**\n\n';
  
  tasks.forEach((task, index) => {
    const emoji = task.tipe === 'individu' ? '👤' : '👥';
    const priorityEmoji = task.prioritas === 'urgent' ? '🚨' : 'ℹ️';
    const deadline = task.deadline.toLocaleDateString('id-ID', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
    
    result += `${index + 1}. ${emoji} **${task.judul}**\n`;
    result += `   ${priorityEmoji} ${task.mata_pelajaran} • ${deadline}\n`;
    result += `   ${task.deskripsi}\n`;
    result += `   🆔 \`${task._id}\`\n\n`;
  });

  return result;
}

const output = formatTaskList(tasks);

console.log('=== RAW OUTPUT ===');
console.log(output);
console.log('\n=== WITH ESCAPED NEWLINES ===');
console.log(JSON.stringify(output));
console.log('\n=== CHARACTER BY CHARACTER ===');
for (let i = 0; i < Math.min(output.length, 200); i++) {
  const char = output[i];
  const code = output.charCodeAt(i);
  if (char === '\n') {
    console.log(`[${i}] NEWLINE (code: ${code})`);
  } else {
    console.log(`[${i}] '${char}' (code: ${code})`);
  }
}
