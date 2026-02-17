/**
 * Recap Formatter - Format pesan harian dan mingguan
 * Sesuai dengan format yang diminta user
 */

import { ITask } from '../models/Task';
import { IJadwal } from '../models/Jadwal';
import { toBold, toItalic, formatHeader, formatSectionTitle, formatSubject, formatLabel } from './TextFormatter';
import { getSubjectEmoji } from '../config/SubjectConfig';

export interface DailyRecapData {
  date: Date;
  tasks: ITask[];
  schedules: IJadwal[];
}

export interface WeeklyRecapData {
  weekNumber: number;
  month: string;
  year: number;
  tasksByDay: Map<string, ITask[]>;
}

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
 * Format daftar tugas untuk satu mata pelajaran
 */
function formatTaskList(tasks: ITask[]): string {
  if (tasks.length === 0) return '';

  let result = '';

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const number = i === 0 ? formatLabel('Tugas:', '📌') : '';
    const bullet = `${i + 1}️⃣`;

    if (number) {
      result += `${number}\n`;
    }

    result += `${bullet} ${task.deskripsi}\n`;
  }

  return result;
}

/**
 * Format link pengumpulan jika ada
 */
function formatSubmissionLink(tasks: ITask[]): string {
  // Cari task yang punya link pengumpulan
  const taskWithLink = tasks.find(t => t.link_pengumpulan);

  if (taskWithLink && taskWithLink.link_pengumpulan) {
    return formatLabel('Link Pengumpulan:', '📥') + `\n${taskWithLink.link_pengumpulan}\n`;
  }

  return '';
}

/**
 * Format catatan tambahan jika ada
 */
function formatNotes(tasks: ITask[]): string {
  const taskWithNotes = tasks.find(t => t.catatan);

  if (taskWithNotes && taskWithNotes.catatan) {
    return formatLabel('Catatan:', '⚠️') + `\n${toItalic(taskWithNotes.catatan)}\n`;
  }

  return '';
}

/**
 * Format recap harian
 */
export function formatDailyRecap(data: DailyRecapData): string {
  const { date, tasks } = data;

  // Header with Unicode bold
  let message = formatHeader('INFO TUGAS HARIAN', '🌟') + '\n\n';
  message += formatHeader(`Hari ini | ${formatFullDate(date)}`, '📅') + '\n\n';
  message += `🌈 ${toItalic('Halo halo teman-teman XI PPLG 3!')}\n`;
  message += `${toItalic('Semoga hari ini tetap sehat, semangat, dan gak ketinggalan info tugas ya')} 💪\n\n`;
  message += 'Setelah sekian lama, admin hadir lagi bawa update tugas hari ini. Yuk, disimak baik-baik 👇\n\n';
  message += '━━━━━━━━━━━━━━━━━━\n';
  message += formatSectionTitle('DAFTAR TUGAS HARI INI', '🗓') + '\n';
  message += '━━━━━━━━━━━━━━━━━━\n\n';

  // Group tasks by mata pelajaran
  const groupedTasks = groupTasksByMapel(tasks);

  if (groupedTasks.size === 0) {
    message += `✨ ${toItalic('Tidak ada tugas untuk hari ini!')}\n`;
    message += `${toItalic('Enjoy your day!')} 🎉\n\n`;
  } else {
    // Format each mata pelajaran
    for (const [mapel, mapelTasks] of groupedTasks) {
      // Emoji untuk mata pelajaran (bisa dikustomisasi)
      const emoji = getSubjectEmoji(mapel);

      message += formatSubject(mapel, emoji) + '\n';
      message += formatTaskList(mapelTasks);

      // Add submission link if exists
      const link = formatSubmissionLink(mapelTasks);
      if (link) {
        message += link;
      }

      // Add notes if exists
      const notes = formatNotes(mapelTasks);
      if (notes) {
        message += notes;
      }

      message += '━━━━━━━━━━━━━━━━━━\n\n';
    }
  }

  // Footer
  message += formatHeader('Penutup', '🌟') + '\n\n';
  message += `${toItalic('Tetap semangat mengerjakan tugas ya, teman-teman')} 💪\n`;
  message += `${toItalic('Terima kasih sudah membaca sampai akhir')} 🙏\n\n`;
  message += 'Kalau ada info yang kurang atau salah ketik, silakan kabari admin.\n';
  message += toBold('CMIIW') + ' 🤗';

  return message;
}

/**
 * Format recap mingguan
 */
export function formatWeeklyRecap(data: WeeklyRecapData): string {
  const { weekNumber, month, year, tasksByDay } = data;

  // Header with Unicode bold
  let message = formatHeader('INFO TUGAS MINGGUAN', '🌟') + '\n\n';
  message += formatHeader(`Minggu ke-${weekNumber} | ${month} ${year}`, '📅') + '\n\n';
  message += `🌈 ${toItalic('Halo halo teman teman XI PPLG 3!')}\n`;
  message += `${toItalic('Gimana kabarnya minggu ini? Semoga tetap semangat dan produktif ya')} 💪\n\n`;
  message += 'Nih admin bawain update tugas mingguan biar kalian gak ketinggalan info!\n';
  message += 'Yuk, cek dari hari Senin sampai Ahad 👇\n\n';
  message += formatSectionTitle('Daftar Tugas Mingguan', '🗓') + '\n\n';

  // Days of week
  const daysOfWeek = [
    { name: 'Senin', emoji: '📖' },
    { name: 'Selasa', emoji: '💻' },
    { name: 'Rabu', emoji: '📚' },
    { name: 'Kamis', emoji: '🌿' },
    { name: 'Jumat', emoji: '🎨' }
  ];

  // Format each day
  for (const day of daysOfWeek) {
    const dayTasks = tasksByDay.get(day.name) || [];

    message += formatSubject(day.name, day.emoji) + '\n';

    if (dayTasks.length === 0) {
      message += `→ ${toItalic('Belum ada tugas')}\n\n`;
    } else {
      // Group by mata pelajaran
      const grouped = groupTasksByMapel(dayTasks);

      for (const [mapel, tasks] of grouped) {
        message += `${toBold(`[${mapel}]`)} → `;

        // Format task descriptions
        const descriptions = tasks.map(t => t.deskripsi).join(', ');
        message += descriptions + '\n';

        // Add link if exists
        const taskWithLink = tasks.find(t => t.link_pengumpulan);
        if (taskWithLink && taskWithLink.link_pengumpulan) {
          message += `${toItalic('Link:')} ${taskWithLink.link_pengumpulan}\n`;
        }
      }

      message += '\n';
    }
  }

  // Footer
  message += `${toItalic('Udah segitu dulu tugasnya untuk minggu ini yaa')} 🌻\n\n`;
  message += 'Kalau ada yang kelewat atau salah ketik, tolong kasih tahu admin ya~\n';
  message += toBold('CMIIW') + '\n\n';
  message += `${toItalic('Tetap semangat ngerjain tugasnya, masukan dari kalian sangat berarti supaya info tetap akurat')} 🤗`;

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
