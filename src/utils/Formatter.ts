/**
 * Formatter Utility Class
 * Requirements: 4.6, 19.1, 19.2, 19.3, 19.4
 */

export class Formatter {
  /**
   * Format task list for display
   * Requirement: 19.2
   */
  static formatTaskList(tasks: any[]): string {
    if (tasks.length === 0) {
      return '📝 Tidak ada tugas saat ini.';
    }

    let result = '📝 *Daftar Tugas:*\n\n';
    
    tasks.forEach((task, index) => {
      const emoji = this.getTaskEmoji(task.tipe);
      const priorityEmoji = this.getPriorityEmoji(task.prioritas);
      const deadline = new Date(task.deadline).toLocaleDateString('id-ID', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
      
      result += `${index + 1}. ${emoji} *${task.judul}*\n`;
      result += `   ${priorityEmoji} ${task.mata_pelajaran} • ${deadline}\n`;
      result += `   ${task.deskripsi}\n`;
      result += `   🆔 \`${task._id}\`\n\n`;
    });

    return result;
  }

  /**
   * Format schedule for display
   * Requirement: 19.3, 19.4
   */
  static formatSchedule(schedules: any[]): string {
    if (schedules.length === 0) {
      return '📅 Tidak ada jadwal untuk hari ini.';
    }

    let result = '📅 *Jadwal Pelajaran:*\n\n';
    
    schedules.forEach((schedule, index) => {
      result += `${index + 1}. 📖 *${schedule.mata_pelajaran}*\n`;
      result += `   ⏰ ${schedule.jam_mulai}-${schedule.jam_selesai} • ${schedule.ruangan} • ${schedule.nama_guru}\n`;
      result += `   🆔 \`${schedule._id}\`\n\n`;
    });

    return result;
  }

  /**
   * Format piket assignment
   * Requirement: 4.6
   */
  static formatPiket(piket: any): string {
    if (!piket || piket.nama_siswa.length === 0) {
      return '🧹 Tidak ada jadwal piket untuk hari ini.';
    }

    let result = `🧹 *Piket ${piket.hari}:*\n\n`;
    
    piket.nama_siswa.forEach((nama: string, index: number) => {
      result += `${index + 1}. ${nama}\n`;
    });

    return result;
  }

  /**
   * Format announcement
   * Requirement: 19.7, 19.8
   */
  static formatAnnouncement(announcement: any): string {
    const typeEmoji = this.getAnnouncementEmoji(announcement.tipe);
    const tanggal = new Date(announcement.tanggal).toLocaleDateString('id-ID', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
    
    let result = `${typeEmoji} *${announcement.judul}*\n`;
    result += `📅 ${tanggal} • ${announcement.keterangan}\n`;
    result += `🆔 \`${announcement._id}\`\n`;
    
    return result;
  }

  /**
   * Format date to Indonesian format
   * Requirement: 19.2
   */
  static formatDate(date: Date): string {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const d = new Date(date);
    const dayName = days[d.getDay()];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    
    return `${dayName}, ${day} ${month} ${year}`;
  }

  /**
   * Format time to HH:MM
   */
  static formatTime(time: string): string {
    // Already in HH:MM format, just validate
    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    if (timeRegex.test(time)) {
      return time;
    }
    return '00:00';
  }

  /**
   * Add emojis based on content type
   */
  static addEmojis(text: string, type: string): string {
    const emojiMap: Record<string, string> = {
      'task': '📝',
      'schedule': '📅',
      'piket': '🧹',
      'announcement': '📢',
      'urgent': '🚨',
      'success': '✅',
      'error': '❌',
      'info': 'ℹ️'
    };
    
    const emoji = emojiMap[type] || '';
    return emoji ? `${emoji} ${text}` : text;
  }

  /**
   * Get task type emoji
   */
  private static getTaskEmoji(tipe: string): string {
    const emojiMap: Record<string, string> = {
      'individu': '👤',
      'kelompok': '👥',
      'ujian': '📝'
    };
    return emojiMap[tipe] || '📝';
  }

  /**
   * Get priority emoji
   */
  private static getPriorityEmoji(prioritas: string): string {
    const emojiMap: Record<string, string> = {
      'urgent': '🚨',
      'penting': '⚠️',
      'normal': 'ℹ️'
    };
    return emojiMap[prioritas] || 'ℹ️';
  }

  /**
   * Get announcement type emoji
   */
  private static getAnnouncementEmoji(tipe: string): string {
    const emojiMap: Record<string, string> = {
      'acara': '🎉',
      'perubahan_jadwal': '🔄',
      'praktikum': '🔬',
      'lainnya': '📢'
    };
    return emojiMap[tipe] || '📢';
  }
}
