/**
 * Member Command Handler
 * Requirements: 2.6, 2.7, 2.8, 3.5, 3.6, 3.7, 4.3, 4.4, 11.6, 11.7
 */

import { CommandResponse } from '../utils/CommandRouter';
import { Platform, UserRole } from '../services/PermissionService';
import { TaskService } from '../services/TaskService';
import { ScheduleService } from '../services/ScheduleService';
import { PiketService } from '../services/PiketService';
import { Formatter } from '../utils/Formatter';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

export class MemberCommandHandler {
  constructor(
    private taskService: TaskService,
    private scheduleService: ScheduleService,
    private piketService: PiketService
  ) {}

  /**
   * Handle /tugas command - Get all active tasks
   * Requirement: 2.6
   */
  async handleTugas(_args: string[], _userId: string, platform: Platform): Promise<CommandResponse> {
    try {
      const tasks = await this.taskService.getTasks();
      
      if (tasks.length === 0) {
        return {
          success: true,
          message: '📝 Tidak ada tugas aktif saat ini.',
          ephemeral: true
        };
      }

      // For Discord, return embed data with description
      if (platform === 'discord') {
        const taskLines = tasks.map((task, index) => {
          const emoji = this.getTaskEmoji(task.tipe);
          const priorityEmoji = this.getPriorityEmoji(task.prioritas);
          const deadline = new Date(task.deadline).toLocaleDateString('id-ID', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
          });
          
          return `**${index + 1}. ${emoji} ${task.judul}**\n${priorityEmoji} ${task.mata_pelajaran} • ${deadline}\n${task.deskripsi}\n🆔 \`${task._id}\``;
        });

        return {
          success: true,
          message: '',
          embedData: {
            title: '📝 Daftar Tugas',
            description: taskLines.join('\n\n'), // Double newline for spacing
            color: 0x3498db
          },
          ephemeral: true
        };
      }

      // For WhatsApp, return plain text
      const message = Formatter.formatTaskList(tasks);
      return {
        success: true,
        message
      };
    } catch (error) {
      logger.error('Failed to get tasks', error as Error);
      return {
        success: false,
        message: '❌ Gagal mengambil daftar tugas.',
        ephemeral: true
      };
    }
  }

  private getTaskEmoji(tipe: string): string {
    const emojiMap: Record<string, string> = {
      'individu': '👤',
      'kelompok': '👥',
      'ujian': '📝'
    };
    return emojiMap[tipe] || '📝';
  }

  private getPriorityEmoji(prioritas: string): string {
    const emojiMap: Record<string, string> = {
      'urgent': '🚨',
      'penting': '⚠️',
      'normal': 'ℹ️'
    };
    return emojiMap[prioritas] || 'ℹ️';
  }

  /**
   * Handle /tugas_hari_ini command
   * Requirement: 2.7
   */
  async handleTugasHariIni(_args: string[], _userId: string, platform: Platform): Promise<CommandResponse> {
    try {
      const tasks = await this.taskService.getTasksForToday();
      
      if (tasks.length === 0) {
        return {
          success: true,
          message: '📝 Tidak ada tugas untuk hari ini.',
          ephemeral: true
        };
      }

      // For Discord, return embed data with description
      if (platform === 'discord') {
        const taskLines = tasks.map((task, index) => {
          const emoji = this.getTaskEmoji(task.tipe);
          const priorityEmoji = this.getPriorityEmoji(task.prioritas);
          const deadline = new Date(task.deadline).toLocaleDateString('id-ID', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
          });
          
          return `**${index + 1}. ${emoji} ${task.judul}**\n${priorityEmoji} ${task.mata_pelajaran} • ${deadline}\n${task.deskripsi}\n🆔 \`${task._id}\``;
        });

        return {
          success: true,
          message: '',
          embedData: {
            title: '📅 Tugas Hari Ini',
            description: taskLines.join('\n\n'),
            color: 0x3498db
          },
          ephemeral: true
        };
      }

      // For WhatsApp, return plain text
      const message = Formatter.formatTaskList(tasks);
      return {
        success: true,
        message: `📅 *Tugas Hari Ini*\n\n${message}`
      };
    } catch (error) {
      logger.error('Failed to get today tasks', error as Error);
      return {
        success: false,
        message: '❌ Gagal mengambil tugas hari ini.',
        ephemeral: true
      };
    }
  }

  /**
   * Handle /tugas_minggu_ini command
   * Requirement: 2.8
   */
  async handleTugasMingguIni(_args: string[], _userId: string, platform: Platform): Promise<CommandResponse> {
    try {
      const tasks = await this.taskService.getTasksForWeek();
      
      if (tasks.length === 0) {
        return {
          success: true,
          message: '📝 Tidak ada tugas untuk minggu ini.',
          ephemeral: true
        };
      }

      // For Discord, return embed data with description
      if (platform === 'discord') {
        const taskLines = tasks.map((task, index) => {
          const emoji = this.getTaskEmoji(task.tipe);
          const priorityEmoji = this.getPriorityEmoji(task.prioritas);
          const deadline = new Date(task.deadline).toLocaleDateString('id-ID', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
          });
          
          return `**${index + 1}. ${emoji} ${task.judul}**\n${priorityEmoji} ${task.mata_pelajaran} • ${deadline}\n${task.deskripsi}\n🆔 \`${task._id}\``;
        });

        return {
          success: true,
          message: '',
          embedData: {
            title: '📊 Tugas Minggu Ini',
            description: taskLines.join('\n\n'),
            color: 0x3498db
          },
          ephemeral: true
        };
      }

      // For WhatsApp, return plain text
      const message = Formatter.formatTaskList(tasks);
      return {
        success: true,
        message: `📊 *Tugas Minggu Ini*\n\n${message}`
      };
    } catch (error) {
      logger.error('Failed to get week tasks', error as Error);
      return {
        success: false,
        message: '❌ Gagal mengambil tugas minggu ini.',
        ephemeral: true
      };
    }
  }

  /**
   * Handle /jadwal or /jadwal_hari_ini command
   * Requirement: 3.5
   */
  async handleJadwal(_args: string[], _userId: string, platform: Platform): Promise<CommandResponse> {
    try {
      const schedules = await this.scheduleService.getTodaySchedule();
      
      if (schedules.length === 0) {
        return {
          success: true,
          message: '📅 Tidak ada jadwal untuk hari ini.',
          ephemeral: true
        };
      }

      // For Discord, return embed data with description
      if (platform === 'discord') {
        const scheduleLines = schedules.map((schedule, index) => {
          return `**${index + 1}. 📖 ${schedule.mata_pelajaran}**\n⏰ ${schedule.jam_mulai}-${schedule.jam_selesai} • 🏫 ${schedule.ruangan} • 👨‍🏫 ${schedule.nama_guru}\n🆔 \`${schedule._id}\``;
        });

        return {
          success: true,
          message: '',
          embedData: {
            title: '📅 Jadwal Hari Ini',
            description: scheduleLines.join('\n\n'),
            color: 0x3498db
          },
          ephemeral: true
        };
      }

      // For WhatsApp, return plain text
      const message = Formatter.formatSchedule(schedules);
      return {
        success: true,
        message
      };
    } catch (error) {
      logger.error('Failed to get today schedule', error as Error);
      return {
        success: false,
        message: '❌ Gagal mengambil jadwal hari ini.',
        ephemeral: true
      };
    }
  }

  /**
   * Handle /jadwal_besok command
   * Requirement: 3.6
   */
  async handleJadwalBesok(_args: string[], _userId: string, platform: Platform): Promise<CommandResponse> {
    try {
      const schedules = await this.scheduleService.getTomorrowSchedule();
      
      if (schedules.length === 0) {
        return {
          success: true,
          message: '📅 Tidak ada jadwal untuk besok.',
          ephemeral: true
        };
      }

      // For Discord, return embed data with description
      if (platform === 'discord') {
        const scheduleLines = schedules.map((schedule, index) => {
          return `**${index + 1}. 📖 ${schedule.mata_pelajaran}**\n⏰ ${schedule.jam_mulai}-${schedule.jam_selesai} • 🏫 ${schedule.ruangan} • 👨‍🏫 ${schedule.nama_guru}\n🆔 \`${schedule._id}\``;
        });

        return {
          success: true,
          message: '',
          embedData: {
            title: '📅 Jadwal Besok',
            description: scheduleLines.join('\n\n'),
            color: 0x3498db
          },
          ephemeral: true
        };
      }

      // For WhatsApp, return plain text
      const message = Formatter.formatSchedule(schedules);
      return {
        success: true,
        message: `📅 *Jadwal Besok*\n\n${message}`
      };
    } catch (error) {
      logger.error('Failed to get tomorrow schedule', error as Error);
      return {
        success: false,
        message: '❌ Gagal mengambil jadwal besok.',
        ephemeral: true
      };
    }
  }

  /**
   * Handle /jadwal_minggu_ini command
   * Requirement: 3.7
   */
  async handleJadwalMingguIni(_args: string[], _userId: string, platform: Platform): Promise<CommandResponse> {
    try {
      const schedules = await this.scheduleService.getSchedulesForWeek(new Date());
      
      if (schedules.length === 0) {
        return {
          success: true,
          message: '📅 Tidak ada jadwal untuk minggu ini.',
          ephemeral: true
        };
      }

      // For Discord, return embed data with description
      if (platform === 'discord') {
        const scheduleLines = schedules.map((schedule, index) => {
          return `**${index + 1}. 📖 ${schedule.mata_pelajaran}**\n⏰ ${schedule.jam_mulai}-${schedule.jam_selesai} • 🏫 ${schedule.ruangan} • 👨‍🏫 ${schedule.nama_guru}\n🆔 \`${schedule._id}\``;
        });

        return {
          success: true,
          message: '',
          embedData: {
            title: '📊 Jadwal Minggu Ini',
            description: scheduleLines.join('\n\n'),
            color: 0x3498db
          },
          ephemeral: true
        };
      }

      // For WhatsApp, return plain text
      const message = Formatter.formatSchedule(schedules);
      return {
        success: true,
        message: `📊 *Jadwal Minggu Ini*\n\n${message}`
      };
    } catch (error) {
      logger.error('Failed to get week schedule', error as Error);
      return {
        success: false,
        message: '❌ Gagal mengambil jadwal minggu ini.',
        ephemeral: true
      };
    }
  }

  /**
   * Handle /piket command
   * Requirement: 4.3
   */
  async handlePiket(_args: string[], _userId: string, platform: Platform): Promise<CommandResponse> {
    try {
      const piket = await this.piketService.getTodayPiket();
      
      if (!piket) {
        return {
          success: true,
          message: '🧹 Tidak ada jadwal piket untuk hari ini.',
          ephemeral: true
        };
      }

      // For Discord, return embed data with description
      if (platform === 'discord') {
        const studentList = piket.nama_siswa.map((nama, i) => `${i + 1}. ${nama}`).join('\n');
        
        return {
          success: true,
          message: '',
          embedData: {
            title: `🧹 Piket ${piket.hari}`,
            description: `**Petugas Piket:**\n${studentList || 'Tidak ada petugas'}`,
            color: 0x2ecc71
          },
          ephemeral: true
        };
      }

      // For WhatsApp, return plain text with mentions
      const formatted = this.piketService.formatPiketMessage(piket);
      return {
        success: true,
        message: formatted.text,
        data: { mentions: formatted.mentions }
      };
    } catch (error) {
      logger.error('Failed to get today piket', error as Error);
      return {
        success: false,
        message: '❌ Gagal mengambil jadwal piket hari ini.',
        ephemeral: true
      };
    }
  }

  /**
   * Handle /piket_minggu_ini command
   * Requirement: 4.4
   */
  async handlePiketMingguIni(_args: string[], _userId: string, platform: Platform): Promise<CommandResponse> {
    try {
      const pikets = await this.piketService.getPiketForWeek(new Date());
      
      if (pikets.length === 0) {
        return {
          success: true,
          message: '🧹 Tidak ada jadwal piket untuk minggu ini.',
          ephemeral: true
        };
      }

      // For Discord, return embed data with description
      if (platform === 'discord') {
        const piketLines = pikets.map(piket => {
          const studentList = piket.nama_siswa.map((nama, i) => `${i + 1}. ${nama}`).join('\n');
          return `**📅 ${piket.hari}**\n${studentList || 'Tidak ada petugas'}`;
        });

        return {
          success: true,
          message: '',
          embedData: {
            title: '🧹 Jadwal Piket Minggu Ini',
            description: piketLines.join('\n\n'),
            color: 0x2ecc71
          },
          ephemeral: true
        };
      }

      // For WhatsApp, return plain text
      let message = '🧹 *Jadwal Piket Minggu Ini*\n\n';
      pikets.forEach(piket => {
        message += `📅 ${piket.hari}:\n`;
        piket.nama_siswa.forEach((nama, i) => {
          message += `  ${i + 1}. ${nama}\n`;
        });
        message += '\n';
      });

      return {
        success: true,
        message
      };
    } catch (error) {
      logger.error('Failed to get week piket', error as Error);
      return {
        success: false,
        message: '❌ Gagal mengambil jadwal piket minggu ini.',
        ephemeral: true
      };
    }
  }

  /**
   * Handle /help or /bantuan command
   * Requirement: 11.6
   */
  async handleHelp(_args: string[], _userId: string, _platform: Platform, role?: UserRole): Promise<CommandResponse> {
    let message = '📖 *Daftar Perintah*\n\n';

    // Member commands (available to all)
    message += '👥 *Perintah Member:*\n';
    message += '• /tugas - Lihat semua tugas aktif\n';
    message += '• /tugas_hari_ini - Tugas hari ini\n';
    message += '• /tugas_minggu_ini - Tugas minggu ini\n';
    message += '• /jadwal - Jadwal hari ini\n';
    message += '• /jadwal_besok - Jadwal besok\n';
    message += '• /jadwal_minggu_ini - Jadwal minggu ini\n';
    message += '• /piket - Piket hari ini\n';
    message += '• /piket_minggu_ini - Piket minggu ini\n';
    message += '• /status - Status bot\n';
    message += '• /help - Bantuan\n\n';

    // Admin commands
    if (role && role !== 'member') {
      message += '👨‍💼 *Perintah Admin:*\n';
      message += '• /add_tugas - Tambah tugas\n';
      message += '• /edit_tugas - Edit tugas\n';
      message += '• /hapus_tugas - Hapus tugas\n';
      message += '• /tandai_selesai - Tandai selesai\n';
      message += '• /add_jadwal - Tambah jadwal\n';
      message += '• /set_piket - Atur piket\n';
      message += '• /add_pengumuman - Tambah pengumuman\n\n';
    }

    // Ketua/Wakil only commands
    if (role && (role === 'ketua' || role === 'wakil')) {
      message += '👑 *Perintah Ketua/Wakil:*\n';
      message += '• /broadcast - Broadcast pesan\n';
      message += '• /broadcast_urgent - Broadcast urgent\n';
    }

    return {
      success: true,
      message,
      ephemeral: true // Only visible to user
    };
  }

  /**
   * Handle /status command
   * Requirement: 11.7
   */
  async handleStatus(_args: string[], _userId: string, _platform: Platform): Promise<CommandResponse> {
    try {
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);

      const message = `🤖 *Status Bot*\n\n` +
        `✅ Bot aktif\n` +
        `⏱️ Uptime: ${hours}h ${minutes}m\n` +
        `📊 Platform: Multi-platform (Discord + WhatsApp)\n` +
        `🔧 Version: 1.0.0`;

      return {
        success: true,
        message,
        ephemeral: true // Only visible to user
      };
    } catch (error) {
      logger.error('Failed to get status', error as Error);
      return {
        success: false,
        message: '❌ Gagal mengambil status bot.',
        ephemeral: true
      };
    }
  }
}
