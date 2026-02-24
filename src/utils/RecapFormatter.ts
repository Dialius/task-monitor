/**
 * Recap Formatter - Format pesan harian (Besok) dan mingguan (Minggu Depan)
 * Sesuai dengan format baru: Daily Reminder (Besok) & Weekly Reminder (Next Week)
 * Plus dukungan untuk Hari Libur
 */

import { ITask } from '../models/Task';
import { IJadwal } from '../models/Jadwal';
import { toBold, toItalic, formatHeader, formatSectionTitle, formatSubject, formatLabel } from './TextFormatter';
import { getSubjectEmoji } from '../config/SubjectConfig';

export interface DailyRecapData {
  date: Date; // Tanggal yang diingatkan (BESOK)
  tasks: ITask[];
  schedules: IJadwal[];
  isHoliday?: boolean; // New: Flag for holiday
  holidayReason?: string; // New: Reason for holiday
}

export interface WeeklyRecapData {
  weekNumber: number;
  month: string;
  year: number;
  tasksByDay: Map<string, ITask[]>;
  holidays?: Map<string, string>; // New: Map<DayName, HolidayReason>
}

// Global constants from user request
const SHARED_DRIVE_LINK = 'https://drive.google.com/drive/folders/1lmGJOxHKwlKmZIiS1fdiSEFnWCxau23v?usp=sharing';

/**
 * Format nama hari dalam Bahasa Indonesia
 */
function getDayName(date: Date): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[date.getDay()];
}

/**
 * Format nama bulan dalam Bahasa Indonesia
 */
function getMonthName(date: Date): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[date.getMonth()];
}

/**
 * Format tanggal lengkap (Senin, 3 Februari 2026)
 */
function formatFullDate(date: Date): string {
  const day = getDayName(date);
  const dateNum = date.getDate();
  const month = getMonthName(date);
  const year = date.getFullYear();
  return `${day}, ${dateNum} ${month} ${year}`;
}

/**
 * Group tasks by mata pelajaran
 */
function groupTasksByMapel(tasks: ITask[]): Map<string, ITask[]> {
  const grouped = new Map<string, ITask[]>();

  for (const task of tasks) {
    const mapel = task.mata_pelajaran || 'Lainnya';
    if (!grouped.has(mapel)) {
      grouped.set(mapel, []);
    }
    grouped.get(mapel)!.push(task);
  }

  return grouped;
}

/**
 * Group tasks by type (individu, kelompok, ujian)
 */
function groupTasksByType(tasks: ITask[]): Map<string, ITask[]> {
  const grouped = new Map<string, ITask[]>();
  for (const task of tasks) {
    const type = task.tipe || 'individu';
    if (!grouped.has(type)) {
      grouped.set(type, []);
    }
    grouped.get(type)!.push(task);
  }
  return grouped;
}

/**
 * Format detail tugas (bullet points)
 */
function formatTaskItems(tasks: ITask[]): string {
  return tasks.map(t => {
    return `• ${t.deskripsi}`;
  }).join('\n');
}

/**
 * Helper: Capitalize Type Title
 */
function getTitleForType(type: string): string {
  switch (type) {
    case 'kelompok': return 'Tugas Kelompok:';
    case 'individu': return 'Tugas Individu:';
    case 'ujian': return 'Info Ujian:';
    default: return 'Tugas:';
  }
}

/**
 * Sub-renderer for a list of tasks of a specific type
 */
function renderTaskBlock(type: string, tasks: ITask[]): string {
  if (tasks.length === 0) return '';

  let title = getTitleForType(type);

  // Override if task looks like generic info
  if (tasks.some(t => t.judul.toLowerCase().includes('info'))) {
    title = 'Info:';
  }

  let block = `${formatLabel(title, '📌')}\n`;
  block += formatTaskItems(tasks) + '\n';

  // Collect links
  const linkTasks = tasks.filter(t => t.link_pengumpulan);
  if (linkTasks.length > 0) {
    block += formatLabel('Link Pengumpulan:', '📥') + '\n';
    block += linkTasks.map(t => t.link_pengumpulan!.startsWith('http') ? t.link_pengumpulan : `${t.link_pengumpulan}`).join('\n') + '\n';
  }

  // Collect notes/modules
  const noteTasks = tasks.filter(t => t.catatan);
  if (noteTasks.length > 0) {
    const moduleLinks = noteTasks.filter(t => t.catatan?.includes('http'));
    const textNotes = noteTasks.filter(t => !t.catatan?.includes('http') && t.catatan!.length > 0);

    if (moduleLinks.length > 0) {
      block += '\n' + formatLabel('Modul:', '📂') + '\n';
      block += moduleLinks.map(t => t.catatan).join('\n') + '\n';
    }

    if (textNotes.length > 0) {
      block += '\n' + formatLabel('Catatan:', '📝') + '\n';
      block += textNotes.map(t => t.catatan).join('\n') + '\n';
    }
  }

  return block;
}


// ============================================================================
// PUBLIC FUNCTIONS
// ============================================================================

/**
 * DAILY REMINDER (BESOK)
 * Format Harian (Besok) sesuai request user.
 */
export function formatDailyRecap(data: DailyRecapData): string {
  const { date, tasks } = data;
  const dayName = getDayName(date);

  let message = formatHeader('INFO TUGAS HARIAN', '🌟') + '\n\n';
  message += formatHeader(`Besok | ${formatFullDate(date)}`, '📅') + '\n\n';
  message += `🌈 ${toItalic('Halo teman-teman XI PPLG 3!')}\n`;

  // Normal Day Logic
  if (dayName === 'Senin') {
    message += `Besok udah masuk hari Senin lagi nih. Cek dulu yuk tugas apa aja yang harus dikumpulin/dibawa besok, biar gak ada yang ketinggalan 💪\n\n`;
  } else {
    message += `Cek dulu yuk tugas apa aja yang harus dikumpulin/dibawa besok, biar gak ada yang ketinggalan 💪\n\n`;
  }

  // 2. Body
  if (tasks.length === 0) {
    message += 'Kabar gembira! 🎉\n';
    message += `Berdasarkan data admin, ${toBold('tidak ada tugas')} yang harus dikumpulkan untuk besok.\n\n`;
    message += 'Tetap cek jadwal pelajaran ya, siapa tahu ada perlengkapan yang perlu dibawa.\n';
    message += 'Selamat beristirahat! 😴\n\n';
    message += toBold('CMIIW') + ' 🤗';
    return message;
  }

  message += '━━━━━━━━━━━━━━━━━━\n';
  message += formatSectionTitle('DAFTAR TUGAS', '🗓') + '\n';
  message += '━━━━━━━━━━━━━━━━━━\n\n';

  // Group by Mapel
  const groupedTasks = groupTasksByMapel(tasks);
  const sortedMapels = Array.from(groupedTasks.keys()).sort();

  for (const mapel of sortedMapels) {
    const mapelTasks = groupedTasks.get(mapel)!;
    const emoji = getSubjectEmoji(mapel);

    message += formatSubject(mapel, emoji) + '\n\n';

    const groupedByType = groupTasksByType(mapelTasks);

    if (groupedByType.has('kelompok')) {
      message += renderTaskBlock('kelompok', groupedByType.get('kelompok')!) + '\n';
    }
    if (groupedByType.has('individu')) {
      message += renderTaskBlock('individu', groupedByType.get('individu')!) + '\n';
    }
    if (groupedByType.has('ujian')) {
      message += renderTaskBlock('ujian', groupedByType.get('ujian')!) + '\n';
    }

    message += '━━━━━━━━━━━━━━━━━━\n\n';
  }

  // 3. Tambahan Link Drive (Global Footer for Daily)
  message += '📂 Tambahan\n';
  message += 'Link Drive materi dan LKPD mata pelajaran:\n';
  message += `${SHARED_DRIVE_LINK}\n\n`;
  message += '━━━━━━━━━━━━━━━━━━\n\n';

  // 4. Footer
  message += formatHeader('Penutup', '🌟') + '\n';
  message += `Semangat buat besok ya! Jangan lupa istirahat yang cukup biar besok fresh.\n`;
  message += `Kalau ada info yang keliru, kabari admin ya.\n\n`;
  message += toBold('CMIIW') + ' 🤗';

  return message;
}


/**
 * WEEKLY REMINDER (NEXT WEEK)
 * Format Mingguan (Minggu Depan).
 */
export function formatWeeklyRecap(data: WeeklyRecapData): string {
  const { weekNumber, month, year, tasksByDay, holidays } = data;

  let message = formatHeader('INFO TUGAS MINGGUAN', '🌟') + '\n\n';
  message += formatHeader(`Minggu ke-${weekNumber} | ${month} ${year}`, '📅') + '\n\n';

  message += `🌈 ${toItalic('Halo teman-teman XI PPLG 3!')}\n`;
  message += `Gimana kabarnya? Semoga weekend-nya menyenangkan ya! 🏖️\n`;
  message += 'Sebelum libur/memulai minggu baru, yuk cek dulu daftar tugas untuk minggu depan biar bisa dicicil 💪\n\n';

  message += '━━━━━━━━━━━━━━━━━━\n';
  message += formatSectionTitle('DAFTAR TUGAS MINGGU DEPAN', '🗓') + '\n';
  message += '━━━━━━━━━━━━━━━━━━\n\n';

  const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  let hasTasks = false;

  for (const day of daysOfWeek) {
    const dayTasks = tasksByDay.get(day) || [];
    const emoji = getSubjectEmojiDay(day);

    // Determine date string (simplified logic, assume caller handles if critical, or omitted)
    // If we really need dates, data.tasksByDay needs a better structure or we need startDate passed.
    // For now, let's omit specific dates unless tasks exist to provide context.

    let dateStr = '';
    if (dayTasks.length > 0) {
      const tDate = new Date(dayTasks[0].deadline);
      const d = tDate.getDate().toString().padStart(2, '0');
      const m = (tDate.getMonth() + 1).toString().padStart(2, '0');
      const y = tDate.getFullYear().toString().slice(-2);
      dateStr = `(${d}/${m}/${y})`;
    }

    message += `${emoji} ${toBold(day)} ${dateStr}\n\n`;

    // -- HOLIDAY LOGIC --
    if (holidays && holidays.has(day)) {
      const reason = holidays.get(day);
      message += `🔴 ${toBold(`LIBUR - ${reason}`)} 🧧\n`;
      message += `(${toItalic('Tidak ada KBM')})\n\n`;
      message += '━━━━━━━━━━━━━━━━━━\n\n';
      continue; // Skip tasks for holiday
    }
    // -------------------

    if (dayTasks.length === 0) {
      message += `→ ${toItalic('Belum ada tugas / info menyusul')}\n\n`;
    } else {
      hasTasks = true;
      const grouped = groupTasksByMapel(dayTasks);
      for (const [mapel, tasks] of grouped) {
        const mapelEmoji = getSubjectEmoji(mapel);
        message += `[${mapelEmoji} ${mapel}]\n`;

        const taskDescriptions = tasks.map(t => {
          let desc = `• ${t.deskripsi}`;
          if (t.tipe === 'kelompok') desc += ` (Kelompok)`;
          return desc;
        }).join('\n');

        message += `${taskDescriptions}\n\n`;
      }
    }
    message += '━━━━━━━━━━━━━━━━━━\n\n';
  }

  // Footer
  if (!hasTasks) {
    message += `Minggu depan terpantau aman! Nikmati liburmu! 🎉\n\n`;
  } else {
    message += toItalic('Udah segitu dulu tugasnya untuk minggu depan yaa') + ' 🌻\n';
    message += 'Kalau ada yang kelewat atau salah ketik, tolong kasih tahu admin ya~\n\n';
    message += toBold('Tetap semangat ngerjain tugasnya!') + ' 🤗\n';
  }

  message += toBold('CMIIW');

  return message;
}

/**
 * Get week number of month
 */
export function getWeekOfMonth(date: Date): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();
  const dayOfWeek = firstDay.getDay();
  return Math.ceil((dayOfMonth + dayOfWeek) / 7);
}

/**
 * Helper: Emoji for days
 */
function getSubjectEmojiDay(day: string): string {
  const map: { [key: string]: string } = {
    'Senin': '📖',
    'Selasa': '💻',
    'Rabu': '📚',
    'Kamis': '🌿',
    'Jumat': '🎨',
    'Sabtu': '🏖️',
    'Minggu': '🛌'
  };
  return map[day] || '📅';
}
