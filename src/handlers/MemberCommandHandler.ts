/**
 * Member Command Handler
 * Requirements: 2.6, 2.7, 2.8, 3.5, 3.6, 3.7, 4.3, 4.4, 11.6, 11.7
 */

import { CommandResponse } from '../utils/CommandRouter';
import { Platform } from '../services/PermissionService';
import { TaskService } from '../services/TaskService';
import { ScheduleService } from '../services/ScheduleService';
import { PiketService } from '../services/PiketService';
import { NotionService } from '../services/NotionService';
import { Formatter } from '../utils/Formatter';
import { toBold, toItalic, formatHeader, formatSectionTitle, formatSubject, formatLabel } from '../utils/TextFormatter';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

export class MemberCommandHandler {
  constructor(
    private taskService: TaskService,
    private scheduleService: ScheduleService,
    private piketService: PiketService,
    private notionService: NotionService
  ) {}

  /**
   * Handle /tugas command - Get all active tasks
   * Requirement: 2.6
   */
  async handleTugas(_args: string[], _userId: string, platform: Platform, _chatId?: string): Promise<CommandResponse> {
    try {
      // Auto-sync from Notion before querying
      let syncStatus = '';
      if (this.notionService.isEnabled()) {
        logger.info('Auto-syncing from Notion before /tugas command');
        try {
          const result = await this.notionService.syncFromNotion();
          syncStatus = `\n\n🔄 Synced from Notion: ${result.synced} tasks`;
        } catch (syncError) {
          logger.warn('Notion sync failed, using cached data from MongoDB', syncError as Error);
          syncStatus = '\n\n⚠️ Using cached data (Notion sync failed)';
        }
      }

      const tasks = await this.taskService.getTasks();
      
      if (tasks.length === 0) {
        return {
          success: true,
          message: '',
          embedData: {
            title: '📝 Daftar Tugas',
            description: 'Tidak ada tugas aktif saat ini.',
            color: 0x99AAB5
          }
        };
      }

      // For Discord, return with pagination flag if many tasks
      if (platform === 'discord') {
        // If more than 5 tasks, use pagination
        if (tasks.length > 5) {
          return {
            success: true,
            message: syncStatus,
            data: {
              usePagination: true,
              tasks: tasks,
              title: '📝 Daftar Tugas',
              color: 0x99AAB5
            }
          };
        }

        // For 5 or fewer tasks, use regular embed
        const fields = tasks.map((task, index) => {
          const emoji = this.getTaskEmoji(task.tipe);
          const deadline = new Date(task.deadline).toLocaleDateString('id-ID', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
          });
          
          const spacing = index < tasks.length - 1 ? '\n' : '';
          
          return {
            name: `${index + 1}. ${emoji} ${task.judul}`,
            value: `**Mata Pelajaran:** ${task.mata_pelajaran}\n**Deadline:** ${deadline}\n**Deskripsi:** ${task.deskripsi}\n**ID:** \`${task._id}\`${spacing}`,
            inline: false
          };
        });

        return {
          success: true,
          message: syncStatus,
          embedData: {
            title: '📝 Daftar Tugas',
            color: 0x99AAB5,
            fields
          }
        };
      }

      // For WhatsApp, use reminder format
      const message = this.formatTasksLikeReminder(tasks, 'Semua Tugas Aktif');
      return {
        success: true,
        message: message + syncStatus
      };
    } catch (error) {
      logger.error('Failed to get tasks', error as Error);
      return {
        success: false,
        message: '',
        embedData: {
          title: '❌ Error',
          description: 'Gagal mengambil daftar tugas.',
          color: 0x99AAB5
        }
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

  /**
   * Handle /tugas_hari_ini command
   * Requirement: 2.7
   */
  async handleTugasHariIni(_args: string[], _userId: string, platform: Platform): Promise<CommandResponse> {
    try {
      // Auto-sync from Notion before querying
      let syncStatus = '';
      if (this.notionService.isEnabled()) {
        logger.info('Auto-syncing from Notion before /tugas_hari_ini command');
        try {
          const result = await this.notionService.syncFromNotion();
          syncStatus = `\n\n🔄 Synced from Notion: ${result.synced} tasks`;
        } catch (syncError) {
          logger.warn('Notion sync failed, using cached data from MongoDB', syncError as Error);
          syncStatus = '\n\n⚠️ Using cached data (Notion sync failed)';
        }
      }

      const tasks = await this.taskService.getTasksForToday();
      
      if (tasks.length === 0) {
        return {
          success: true,
          message: '',
          embedData: {
            title: '📅 Tugas Hari Ini',
            description: 'Tidak ada tugas untuk hari ini.',
            color: 0x99AAB5
          }
        };
      }

      // For Discord, return with pagination flag if many tasks
      if (platform === 'discord') {
        // If more than 5 tasks, use pagination
        if (tasks.length > 5) {
          return {
            success: true,
            message: syncStatus,
            data: {
              usePagination: true,
              tasks: tasks,
              title: '📅 Tugas Hari Ini',
              color: 0x99AAB5
            }
          };
        }

        // For 5 or fewer tasks, use regular embed
        const fields = tasks.map((task, index) => {
          const emoji = this.getTaskEmoji(task.tipe);
          const deadline = new Date(task.deadline).toLocaleDateString('id-ID', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
          });
          
          const spacing = index < tasks.length - 1 ? '\n' : '';
          
          return {
            name: `${index + 1}. ${emoji} ${task.judul}`,
            value: `**Mata Pelajaran:** ${task.mata_pelajaran}\n**Deadline:** ${deadline}\n**Deskripsi:** ${task.deskripsi}\n**ID:** \`${task._id}\`${spacing}`,
            inline: false
          };
        });

        return {
          success: true,
          message: '',
          embedData: {
            title: '📅 Tugas Hari Ini',
            color: 0x99AAB5,
            fields
          }
        };
      }

      // For WhatsApp, use reminder format
      const today = new Date();
      const dayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][today.getDay()];
      const dateNum = today.getDate();
      const monthName = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][today.getMonth()];
      const year = today.getFullYear();
      const fullDate = `${dayName}, ${dateNum} ${monthName} ${year}`;
      
      const message = this.formatTasksLikeReminder(tasks, `Hari Ini | ${fullDate}`);
      return {
        success: true,
        message: message + syncStatus
      };
    } catch (error) {
      logger.error('Failed to get today tasks', error as Error);
      return {
        success: false,
        message: '',
        embedData: {
          title: '❌ Error',
          description: 'Gagal mengambil tugas hari ini.',
          color: 0x99AAB5
        }
      };
    }
  }

  /**
   * Handle /tugas_minggu_ini command
   * Requirement: 2.8
   */
  async handleTugasMingguIni(_args: string[], _userId: string, platform: Platform): Promise<CommandResponse> {
    try {
      // Auto-sync from Notion before querying
      let syncStatus = '';
      if (this.notionService.isEnabled()) {
        logger.info('Auto-syncing from Notion before /tugas_minggu_ini command');
        try {
          const result = await this.notionService.syncFromNotion();
          syncStatus = `\n\n🔄 Synced from Notion: ${result.synced} tasks`;
        } catch (syncError) {
          logger.warn('Notion sync failed, using cached data from MongoDB', syncError as Error);
          syncStatus = '\n\n⚠️ Using cached data (Notion sync failed)';
        }
      }

      const tasks = await this.taskService.getTasksForWeek();
      
      if (tasks.length === 0) {
        return {
          success: true,
          message: '',
          embedData: {
            title: '📊 Tugas Minggu Ini',
            description: 'Tidak ada tugas untuk minggu ini.',
            color: 0x99AAB5
          }
        };
      }

      // For Discord, return with pagination flag if many tasks
      if (platform === 'discord') {
        // If more than 5 tasks, use pagination
        if (tasks.length > 5) {
          return {
            success: true,
            message: syncStatus,
            data: {
              usePagination: true,
              tasks: tasks,
              title: '📊 Tugas Minggu Ini',
              color: 0x99AAB5
            }
          };
        }

        // For 5 or fewer tasks, use regular embed
        const fields = tasks.map((task, index) => {
          const emoji = this.getTaskEmoji(task.tipe);
          const deadline = new Date(task.deadline).toLocaleDateString('id-ID', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
          });
          
          const spacing = index < tasks.length - 1 ? '\n' : '';
          
          return {
            name: `${index + 1}. ${emoji} ${task.judul}`,
            value: `**Mata Pelajaran:** ${task.mata_pelajaran}\n**Deadline:** ${deadline}\n**Deskripsi:** ${task.deskripsi}\n**ID:** \`${task._id}\`${spacing}`,
            inline: false
          };
        });

        return {
          success: true,
          message: '',
          embedData: {
            title: '📊 Tugas Minggu Ini',
            color: 0x99AAB5,
            fields
          }
        };
      }

      // For WhatsApp, use reminder format
      const today = new Date();
      const weekNumber = Math.ceil((today.getDate() + new Date(today.getFullYear(), today.getMonth(), 1).getDay()) / 7);
      const monthName = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][today.getMonth()];
      const year = today.getFullYear();
      
      const message = this.formatTasksLikeReminder(tasks, `Minggu ke-${weekNumber} | ${monthName} ${year}`);
      return {
        success: true,
        message: message + syncStatus
      };
    } catch (error) {
      logger.error('Failed to get week tasks', error as Error);
      return {
        success: false,
        message: '',
        embedData: {
          title: '❌ Error',
          description: 'Gagal mengambil tugas minggu ini.',
          color: 0x99AAB5
        }
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
          message: '',
          embedData: {
            title: '📅 Jadwal Hari Ini',
            description: 'Tidak ada jadwal untuk hari ini.',
            color: 0x99AAB5
          }
        };
      }

      // For Discord, return embed data with fields
      if (platform === 'discord') {
        const fields = schedules.map((schedule, index) => {
          // Add single newline at end for spacing between schedules (except last)
          const spacing = index < schedules.length - 1 ? '\n' : '';
          
          return {
            name: `${index + 1}. ${schedule.mata_pelajaran}`,
            value: `**Waktu:** ${schedule.jam_mulai}-${schedule.jam_selesai}\n**Ruangan:** ${schedule.ruangan}\n**Guru:** ${schedule.nama_guru}\n**ID:** \`${schedule._id}\`${spacing}`,
            inline: false
          };
        });

        return {
          success: true,
          message: '',
          embedData: {
            title: '📅 Jadwal Hari Ini',
            color: 0x99AAB5,
            fields
          }
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
        message: '',
        embedData: {
          title: '❌ Error',
          description: 'Gagal mengambil jadwal hari ini.',
          color: 0x99AAB5
        }
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
          message: '',
          embedData: {
            title: '📅 Jadwal Besok',
            description: 'Tidak ada jadwal untuk besok.',
            color: 0x99AAB5
          }
        };
      }

      // For Discord, return embed data with fields
      if (platform === 'discord') {
        const fields = schedules.map((schedule, index) => {
          // Add single newline at end for spacing between schedules (except last)
          const spacing = index < schedules.length - 1 ? '\n' : '';
          
          return {
            name: `${index + 1}. ${schedule.mata_pelajaran}`,
            value: `**Waktu:** ${schedule.jam_mulai}-${schedule.jam_selesai}\n**Ruangan:** ${schedule.ruangan}\n**Guru:** ${schedule.nama_guru}\n**ID:** \`${schedule._id}\`${spacing}`,
            inline: false
          };
        });

        return {
          success: true,
          message: '',
          embedData: {
            title: '📅 Jadwal Besok',
            color: 0x99AAB5,
            fields
          }
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
        message: '',
        embedData: {
          title: '❌ Error',
          description: 'Gagal mengambil jadwal besok.',
          color: 0x99AAB5
        }
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
          message: '',
          embedData: {
            title: '📊 Jadwal Minggu Ini',
            description: 'Tidak ada jadwal untuk minggu ini.',
            color: 0x99AAB5
          }
        };
      }

      // For Discord, return embed data with fields
      if (platform === 'discord') {
        const fields = schedules.map((schedule, index) => {
          // Add single newline at end for spacing between schedules (except last)
          const spacing = index < schedules.length - 1 ? '\n' : '';
          
          return {
            name: `${index + 1}. ${schedule.mata_pelajaran}`,
            value: `**Waktu:** ${schedule.jam_mulai}-${schedule.jam_selesai}\n**Ruangan:** ${schedule.ruangan}\n**Guru:** ${schedule.nama_guru}\n**ID:** \`${schedule._id}\`${spacing}`,
            inline: false
          };
        });

        return {
          success: true,
          message: '',
          embedData: {
            title: '📊 Jadwal Minggu Ini',
            color: 0x99AAB5,
            fields
          }
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
        message: '',
        embedData: {
          title: '❌ Error',
          description: 'Gagal mengambil jadwal minggu ini.',
          color: 0x99AAB5
        }
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
          message: '',
          embedData: {
            title: '🧹 Piket Hari Ini',
            description: 'Tidak ada jadwal piket untuk hari ini.',
            color: 0x99AAB5
          }
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
            description: studentList || 'Tidak ada petugas',
            color: 0x99AAB5,
            fields: []
          }
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
        message: '',
        embedData: {
          title: '❌ Error',
          description: 'Gagal mengambil jadwal piket hari ini.',
          color: 0x99AAB5
        }
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
          message: '',
          embedData: {
            title: '🧹 Jadwal Piket Minggu Ini',
            description: 'Tidak ada jadwal piket untuk minggu ini.',
            color: 0x99AAB5
          }
        };
      }

      // For Discord, return embed data with fields
      if (platform === 'discord') {
        const fields = pikets.map((piket, index) => {
          const studentList = piket.nama_siswa.map((nama, i) => `${i + 1}. ${nama}`).join('\n');
          
          // Add single newline at end for spacing between days (except last)
          const spacing = index < pikets.length - 1 ? '\n' : '';
          
          return {
            name: piket.hari,
            value: `${studentList || 'Tidak ada petugas'}${spacing}`,
            inline: false
          };
        });

        return {
          success: true,
          message: '',
          embedData: {
            title: '🧹 Jadwal Piket Minggu Ini',
            color: 0x99AAB5,
            fields
          }
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
        message: '',
        embedData: {
          title: '❌ Error',
          description: 'Gagal mengambil jadwal piket minggu ini.',
          color: 0x99AAB5
        }
      };
    }
  }

  /**
   * Handle /help or /bantuan command
   * Requirement: 11.6
   */
  async handleHelp(_args: string[], _userId: string, platform: Platform, _chatId?: string): Promise<CommandResponse> {
    const memberCommands = [
      '• `/tugas` - Lihat semua tugas aktif',
      '• `/tugas_hari_ini` - Tugas hari ini',
      '• `/tugas_minggu_ini` - Tugas minggu ini',
      '• `/jadwal` - Jadwal hari ini',
      '• `/jadwal_besok` - Jadwal besok',
      '• `/jadwal_minggu_ini` - Jadwal minggu ini',
      '• `/piket` - Piket hari ini',
      '• `/piket_minggu_ini` - Piket minggu ini',
      '• `/status` - Status bot',
      '• `/help` - Bantuan'
    ].join('\n');

    const adminCommands = [
      '• `/add_tugas` - Tambah tugas',
      '• `/add_tugas_cepat` - Tambah tugas cepat (natural language)',
      '• `/edit_tugas` - Edit tugas',
      '• `/hapus_tugas` - Hapus tugas',
      '• `/tandai_selesai` - Tandai selesai',
      '• `/add_jadwal` - Tambah jadwal',
      '• `/set_piket` - Atur piket',
      '• `/add_pengumuman` - Tambah pengumuman'
    ].join('\n');

    const leaderCommands = [
      '• `/broadcast` - Broadcast pesan',
      '• `/broadcast_urgent` - Broadcast urgent'
    ].join('\n');

    // For WhatsApp, return plain text
    if (platform === 'whatsapp') {
      const message = `📖 *Daftar Perintah*\n\n` +
        `👥 *Perintah Member*\n${memberCommands}\n\n` +
        `👨‍💼 *Perintah Admin*\n${adminCommands}\n\n` +
        `👑 *Perintah Ketua/Wakil*\n${leaderCommands}`;
      
      return {
        success: true,
        message
      };
    }

    // For Discord, return embed
    return {
      success: true,
      message: '',
      embedData: {
        title: '📖 Daftar Perintah',
        color: 0x5865F2,
        fields: [
          {
            name: '👥 Perintah Member',
            value: memberCommands,
            inline: false
          },
          {
            name: '👨‍💼 Perintah Admin',
            value: adminCommands,
            inline: false
          },
          {
            name: '👑 Perintah Ketua/Wakil',
            value: leaderCommands,
            inline: false
          }
        ]
      }
    };
  }

  /**
   * Handle /status command
   * Requirement: 11.7
   */
  async handleStatus(_args: string[], _userId: string, platform: Platform): Promise<CommandResponse> {
    try {
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);

      let mongoStatus = '';
      let notionStatus = '';
      
      // Check MongoDB status
      try {
        const mongoose = require('mongoose');
        const connectionState = mongoose.connection.readyState;
        
        // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        const stateMap: { [key: number]: { emoji: string; text: string } } = {
          0: { emoji: '❌', text: 'Disconnected' },
          1: { emoji: '✅', text: 'Connected' },
          2: { emoji: '🔄', text: 'Connecting...' },
          3: { emoji: '⚠️', text: 'Disconnecting...' }
        };
        
        const state = stateMap[connectionState] || { emoji: '❓', text: 'Unknown' };
        
        if (connectionState === 1) {
          // Get database name if connected
          const dbName = mongoose.connection.db?.databaseName || 'Unknown';
          mongoStatus = `**MongoDB Status:**\n${state.emoji} ${state.text}\n📊 Database: ${dbName}`;
        } else {
          mongoStatus = `**MongoDB Status:**\n${state.emoji} ${state.text}`;
        }
      } catch (error) {
        mongoStatus = `**MongoDB Status:**\n❌ Error checking status`;
      }
      
      // Check Notion status
      if (this.notionService.isEnabled()) {
        try {
          const stats = await this.notionService.getSyncStats();
          notionStatus = `**Notion Status:**\n✅ Connected\n📊 Tasks in Notion: ${stats.notionTasks}\n💾 Tasks in MongoDB: ${stats.mongoTasks}`;
        } catch (error) {
          notionStatus = `**Notion Status:**\n⚠️ Connection issue`;
        }
      } else {
        notionStatus = `**Notion Status:**\n❌ Disabled`;
      }

      // For WhatsApp, return plain text
      if (platform === 'whatsapp') {
        const message = `🤖 *Status Bot*\n\n` +
          `✅ Bot aktif\n` +
          `⏱️ Uptime: ${hours}h ${minutes}m\n` +
          `📊 Platform: Multi-platform (Discord + WhatsApp)\n` +
          `🔧 Version: 1.0.0\n\n` +
          `${mongoStatus.replace(/\*\*/g, '')}\n\n` +
          `${notionStatus.replace(/\*\*/g, '')}`;
        
        return {
          success: true,
          message
        };
      }

      // For Discord, return embed
      return {
        success: true,
        message: '',
        embedData: {
          title: '🤖 Status Bot',
          description: `✅ Bot aktif\n⏱️ Uptime: ${hours}h ${minutes}m\n📊 Platform: Multi-platform (Discord + WhatsApp)\n🔧 Version: 1.0.0\n\n${mongoStatus}\n\n${notionStatus}`,
          color: 0x57F287
        }
      };
    } catch (error) {
      logger.error('Failed to get status', error as Error);
      
      // For WhatsApp
      if (platform === 'whatsapp') {
        return {
          success: false,
          message: '❌ *Error*\n\nGagal mengambil status bot.'
        };
      }
      
      // For Discord
      return {
        success: false,
        message: '',
        embedData: {
          title: '❌ Error',
          description: 'Gagal mengambil status bot.',
          color: 0xED4245
        }
      };
    }
  }

  /**
   * Format tasks like reminder format
   */
  private formatTasksLikeReminder(tasks: any[], title: string): string {
    // Header with Unicode bold
    let message = formatHeader('INFO TUGAS', '🌟') + '\n\n';
    message += formatHeader(title, '📅') + '\n\n';
    message += `🌈 ${toItalic('Halo halo teman-teman XI PPLG 3!')}\n`;
    message += `${toItalic('Nih admin bawain update tugas terbaru')} 💪\n\n`;
    message += 'Yuk, disimak baik-baik 👇\n\n';
    message += '━━━━━━━━━━━━━━━━━━\n';
    message += formatSectionTitle('DAFTAR TUGAS', '🗓') + '\n';
    message += '━━━━━━━━━━━━━━━━━━\n\n';
    
    // Group tasks by mata pelajaran
    const grouped = new Map<string, any[]>();
    for (const task of tasks) {
      const mapel = task.mata_pelajaran || 'Lainnya';
      if (!grouped.has(mapel)) {
        grouped.set(mapel, []);
      }
      grouped.get(mapel)!.push(task);
    }
    
    // Format each mata pelajaran
    for (const [mapel, mapelTasks] of grouped) {
      const emoji = this.getMapelEmoji(mapel);
      
      message += formatSubject(mapel, emoji) + '\n';
      message += formatLabel('Tugas:', '📌') + '\n';
      
      // List tasks
      for (let i = 0; i < mapelTasks.length; i++) {
        const task = mapelTasks[i];
        const bullet = `${i + 1}️⃣`;
        message += `${bullet} ${task.deskripsi}\n`;
      }
      
      // Add submission link if exists
      const taskWithLink = mapelTasks.find((t: any) => t.link_pengumpulan);
      if (taskWithLink && taskWithLink.link_pengumpulan) {
        message += formatLabel('Link Pengumpulan:', '📥') + `\n${taskWithLink.link_pengumpulan}\n`;
      }
      
      // Add notes if exists
      const taskWithNotes = mapelTasks.find((t: any) => t.catatan);
      if (taskWithNotes && taskWithNotes.catatan) {
        message += formatLabel('Catatan:', '⚠️') + `\n${toItalic(taskWithNotes.catatan)}\n`;
      }
      
      message += '━━━━━━━━━━━━━━━━━━\n\n';
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
   * Get emoji for mata pelajaran
   */
  private getMapelEmoji(mapel: string): string {
    const emojiMap: Record<string, string> = {
      'PJOK': '🏃',
      'MP 1': '💻', 'MP 2': '💻', 'MP 3': '💻', 'MP 4': '💻',
      'MK 1': '💻', 'MK 2': '💻', 'MK 3': '💻', 'MK 4': '💻',
      'MK-1': '💻', 'MK-2': '💻', 'MK-3': '💻', 'MK-4': '💻',
      'Sejarah': '📚',
      'PAI': '🕌',
      'Matematika': '🔢',
      'MTK': '🔢',
      'Bahasa Indonesia': '📖',
      'B. Indonesia': '📖',
      'Bahasa Inggris': '🌍',
      'B. Inggris': '🌍',
      'Bahasa Jawa': '🎭',
      'BK': '🧠',
      'Fisika': '⚛️',
      'Kimia': '🧪',
      'KIK-A': '🧪',
      'Biologi': '🌱',
      'Ekonomi': '💰',
      'Geografi': '🌏',
      'Sosiologi': '👥',
      'Seni Budaya': '🎨',
      'PPKN': '🇮🇩'
    };
    
    return emojiMap[mapel] || '📝';
  }
}

