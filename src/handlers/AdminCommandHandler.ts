/**
 * Admin Command Handler
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 5.1, 5.2, 5.4, 5.5
 */

import { CommandResponse } from '../utils/CommandRouter';
import { Platform } from '../services/PermissionService';
import { TaskService } from '../services/TaskService';
import { ScheduleService } from '../services/ScheduleService';
import { PiketService, StudentInfo } from '../services/PiketService';
import { AnnouncementService } from '../services/AnnouncementService';
import { AIService } from '../services/AIService';
import { Validator } from '../utils/Validator';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

export class AdminCommandHandler {
  constructor(
    private taskService: TaskService,
    private scheduleService: ScheduleService,
    private piketService: PiketService,
    private announcementService: AnnouncementService,
    private aiService: AIService
  ) {}

  /**
   * Handle /add_tugas command
   * Format: /add_tugas | judul | deskripsi | deadline (YYYY-MM-DD) | mata_pelajaran | tipe
   * Requirement: 2.1
   */
  async handleAddTugas(args: string[], userId: string, _platform: Platform): Promise<CommandResponse> {
    try {
      if (args.length < 5) {
        return {
          success: false,
          message: '❌ Format salah!\n\nGunakan: /add_tugas | judul | deskripsi | deadline (YYYY-MM-DD) | mata_pelajaran | tipe\n\nContoh: /add_tugas | Essay Sejarah | Tulis essay tentang kemerdekaan | 2024-12-25 | Sejarah | individu'
        };
      }

      const [judul, deskripsi, deadlineStr, mata_pelajaran, tipe] = args;

      // Validate date
      if (!Validator.isValidDate(deadlineStr)) {
        return {
          success: false,
          message: '❌ Format tanggal salah! Gunakan format YYYY-MM-DD (contoh: 2024-12-25)'
        };
      }

      // Validate task type
      if (!Validator.isValidTaskType(tipe)) {
        return {
          success: false,
          message: '❌ Tipe tugas tidak valid! Gunakan: individu, kelompok, atau ujian'
        };
      }

      // Enhance description with AI (keep it concise and focused)
      const enhancedDesc = await this.aiService.rewriteText(
        deskripsi,
        'Rewrite in Indonesian. Maximum 1-2 short sentences. Keep only the core task, remove any extra explanation or motivation. Be direct and concise.'
      );

      const task = await this.taskService.createTask({
        judul,
        deskripsi: enhancedDesc,
        deadline: new Date(deadlineStr),
        mata_pelajaran,
        tipe: tipe as any,
        created_by: userId
      });

      const deadlineFormatted = new Date(task.deadline).toLocaleDateString('id-ID', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });

      return {
        success: true,
        message: `✅ *Tugas ditambahkan!*\n\n📝 ${task.judul}\n${this.getPriorityEmoji(task.prioritas)} ${task.mata_pelajaran} • ${deadlineFormatted}\n🆔 \`${task._id}\`\n\n💡 Gunakan ID untuk edit/hapus`
      };
    } catch (error) {
      logger.error('Failed to add task', error as Error);
      return {
        success: false,
        message: '❌ Gagal menambahkan tugas. Silakan coba lagi.'
      };
    }
  }

  /**
   * Handle /edit_tugas command
   * Format: /edit_tugas | task_id | field | value
   * Requirement: 2.3
   */
  async handleEditTugas(args: string[], _userId: string, _platform: Platform): Promise<CommandResponse> {
    try {
      if (args.length < 3) {
        return {
          success: false,
          message: '❌ Format salah!\n\nGunakan: /edit_tugas | task_id | field | value\n\nField yang bisa diubah: judul, deskripsi, deadline, mata_pelajaran, tipe'
        };
      }

      const [taskId, field, value] = args;

      // Validate field
      const validFields = ['judul', 'deskripsi', 'deadline', 'mata_pelajaran', 'tipe'];
      if (!validFields.includes(field)) {
        return {
          success: false,
          message: `❌ Field tidak valid! Gunakan: ${validFields.join(', ')}`
        };
      }

      // Validate value based on field
      if (field === 'deadline' && !Validator.isValidDate(value)) {
        return {
          success: false,
          message: '❌ Format tanggal salah! Gunakan format YYYY-MM-DD'
        };
      }

      if (field === 'tipe' && !Validator.isValidTaskType(value)) {
        return {
          success: false,
          message: '❌ Tipe tugas tidak valid! Gunakan: individu, kelompok, atau ujian'
        };
      }

      const finalValue = field === 'deadline' ? new Date(value) : value;
      const task = await this.taskService.updateTask(taskId, field, finalValue);

      return {
        success: true,
        message: `✅ Tugas berhasil diupdate!\n\n📝 ${task.judul}\nField "${field}" diubah menjadi: ${value}`
      };
    } catch (error) {
      logger.error('Failed to edit task', error as Error);
      return {
        success: false,
        message: '❌ Gagal mengupdate tugas. Pastikan task_id benar.'
      };
    }
  }

  /**
   * Handle /hapus_tugas command
   * Format: /hapus_tugas | task_id
   * Requirement: 2.4
   */
  async handleHapusTugas(args: string[], _userId: string, _platform: Platform): Promise<CommandResponse> {
    try {
      if (args.length < 1) {
        return {
          success: false,
          message: '❌ Format salah!\n\nGunakan: /hapus_tugas | task_id'
        };
      }

      const [taskId] = args;
      await this.taskService.deleteTask(taskId);

      return {
        success: true,
        message: '✅ Tugas berhasil dihapus!'
      };
    } catch (error) {
      logger.error('Failed to delete task', error as Error);
      return {
        success: false,
        message: '❌ Gagal menghapus tugas. Pastikan task_id benar.'
      };
    }
  }

  /**
   * Handle /tandai_selesai command
   * Format: /tandai_selesai | task_id
   * Requirement: 2.5
   */
  async handleTandaiSelesai(args: string[], _userId: string, _platform: Platform): Promise<CommandResponse> {
    try {
      if (args.length < 1) {
        return {
          success: false,
          message: '❌ Format salah!\n\nGunakan: /tandai_selesai | task_id'
        };
      }

      const [taskId] = args;
      const task = await this.taskService.markComplete(taskId);

      return {
        success: true,
        message: `✅ Tugas selesai!\n\n📝 ${task.judul}\n🎉 Status: Selesai`
      };
    } catch (error) {
      logger.error('Failed to mark task complete', error as Error);
      return {
        success: false,
        message: '❌ Gagal menandai tugas selesai. Pastikan task_id benar.'
      };
    }
  }

  /**
   * Handle /add_jadwal command
   * Format: /add_jadwal | hari | jam_mulai | jam_selesai | mata_pelajaran | ruangan | nama_guru
   * Requirement: 3.1
   */
  async handleAddJadwal(args: string[], _userId: string, _platform: Platform): Promise<CommandResponse> {
    try {
      if (args.length < 6) {
        return {
          success: false,
          message: '❌ Format salah!\n\nGunakan: /add_jadwal | hari | jam_mulai | jam_selesai | mata_pelajaran | ruangan | nama_guru\n\nContoh: /add_jadwal | Senin | 08:00 | 09:30 | Matematika | R.101 | Pak Budi'
        };
      }

      const [hari, jam_mulai, jam_selesai, mata_pelajaran, ruangan, nama_guru] = args;

      // Validate day
      if (!Validator.isValidDay(hari)) {
        return {
          success: false,
          message: '❌ Hari tidak valid! Gunakan: Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu'
        };
      }

      // Validate time
      if (!Validator.isValidTime(jam_mulai) || !Validator.isValidTime(jam_selesai)) {
        return {
          success: false,
          message: '❌ Format waktu salah! Gunakan format HH:MM (contoh: 08:00)'
        };
      }

      const schedule = await this.scheduleService.createSchedule({
        hari,
        jam_mulai,
        jam_selesai,
        mata_pelajaran,
        ruangan,
        nama_guru
      });

      return {
        success: true,
        message: `✅ *Jadwal ditambahkan!*\n\n📖 ${schedule.mata_pelajaran}\n⏰ ${schedule.jam_mulai}-${schedule.jam_selesai} • ${schedule.hari} • ${schedule.ruangan}\n🆔 \`${schedule._id}\`\n\n💡 Gunakan ID untuk edit/hapus`
      };
    } catch (error) {
      logger.error('Failed to add schedule', error as Error);
      return {
        success: false,
        message: '❌ Gagal menambahkan jadwal. Silakan coba lagi.'
      };
    }
  }

  /**
   * Handle /set_piket command
   * Format: /set_piket | hari | nama1,nomor1 | nama2,nomor2 | ...
   * Requirement: 4.1
   */
  async handleSetPiket(args: string[], _userId: string, _platform: Platform): Promise<CommandResponse> {
    try {
      if (args.length < 2) {
        return {
          success: false,
          message: '❌ Format salah!\n\nGunakan: /set_piket | hari | nama1,nomor1 | nama2,nomor2\n\nContoh: /set_piket | Senin | Budi,081234567890 | Ani,081234567891'
        };
      }

      const [hari, ...studentArgs] = args;

      // Validate day
      if (!Validator.isValidDay(hari)) {
        return {
          success: false,
          message: '❌ Hari tidak valid! Gunakan: Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu'
        };
      }

      // Parse students
      const students: StudentInfo[] = studentArgs.map(arg => {
        const [nama, nomor_wa] = arg.split(',').map(s => s.trim());
        return { nama, nomor_wa };
      });

      const piket = await this.piketService.setPiket(hari, students);

      return {
        success: true,
        message: `✅ Piket berhasil diatur!\n\n🧹 Piket ${piket.hari}:\n${piket.nama_siswa.map((n, i) => `${i + 1}. ${n}`).join('\n')}`
      };
    } catch (error) {
      logger.error('Failed to set piket', error as Error);
      return {
        success: false,
        message: '❌ Gagal mengatur piket. Silakan coba lagi.'
      };
    }
  }

  /**
   * Handle /add_pengumuman command
   * Format: /add_pengumuman | tanggal | judul | tipe | keterangan
   * Requirement: 5.1
   */
  async handleAddPengumuman(args: string[], _userId: string, _platform: Platform): Promise<CommandResponse> {
    try {
      if (args.length < 4) {
        return {
          success: false,
          message: '❌ Format salah!\n\nGunakan: /add_pengumuman | tanggal (YYYY-MM-DD) | judul | tipe | keterangan\n\nTipe: acara, perubahan_jadwal, praktikum, lainnya'
        };
      }

      const [tanggalStr, judul, tipe, keterangan] = args;

      // Validate date
      if (!Validator.isValidDate(tanggalStr)) {
        return {
          success: false,
          message: '❌ Format tanggal salah! Gunakan format YYYY-MM-DD'
        };
      }

      // Validate type
      if (!Validator.isValidAnnouncementType(tipe)) {
        return {
          success: false,
          message: '❌ Tipe pengumuman tidak valid! Gunakan: acara, perubahan_jadwal, praktikum, lainnya'
        };
      }

      const announcement = await this.announcementService.createAnnouncement({
        tanggal: new Date(tanggalStr),
        judul,
        tipe: tipe as any,
        keterangan
      });

      const tanggalFormatted = new Date(announcement.tanggal).toLocaleDateString('id-ID', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });

      return {
        success: true,
        message: `✅ *Pengumuman ditambahkan!*\n\n📢 ${announcement.judul}\n📅 ${tanggalFormatted} • ${announcement.keterangan}\n🆔 \`${announcement._id}\`\n\n💡 Gunakan ID untuk hapus`
      };
    } catch (error) {
      logger.error('Failed to add announcement', error as Error);
      return {
        success: false,
        message: '❌ Gagal menambahkan pengumuman. Silakan coba lagi.'
      };
    }
  }

  /**
   * Helper: Get priority emoji
   */
  private getPriorityEmoji(prioritas: string): string {
    const emojiMap: Record<string, string> = {
      urgent: '🚨',
      penting: '⚠️',
      normal: 'ℹ️'
    };
    return emojiMap[prioritas] || 'ℹ️';
  }

  /**
   * Handle /edit_jadwal command
   * Format: /edit_jadwal | schedule_id | field | value
   * Requirement: 3.2
   */
  async handleEditJadwal(args: string[], _userId: string, _platform: Platform): Promise<CommandResponse> {
    try {
      if (args.length < 3) {
        return {
          success: false,
          message: '❌ Format salah!\n\nGunakan: /edit_jadwal | schedule_id | field | value\n\nField: jam_mulai, jam_selesai, mata_pelajaran, ruangan, nama_guru'
        };
      }

      const [scheduleId, field, value] = args;

      const validFields = ['jam_mulai', 'jam_selesai', 'mata_pelajaran', 'ruangan', 'nama_guru'];
      if (!validFields.includes(field)) {
        return {
          success: false,
          message: `❌ Field tidak valid! Gunakan: ${validFields.join(', ')}`
        };
      }

      if ((field === 'jam_mulai' || field === 'jam_selesai') && !Validator.isValidTime(value)) {
        return {
          success: false,
          message: '❌ Format waktu salah! Gunakan format HH:MM'
        };
      }

      const schedule = await this.scheduleService.updateSchedule(scheduleId, field, value);

      return {
        success: true,
        message: `✅ Jadwal berhasil diupdate!\n\n📖 ${schedule.mata_pelajaran}\nField "${field}" diubah menjadi: ${value}`
      };
    } catch (error) {
      logger.error('Failed to edit schedule', error as Error);
      return {
        success: false,
        message: '❌ Gagal mengupdate jadwal. Pastikan schedule_id benar.'
      };
    }
  }

  /**
   * Handle /hapus_jadwal command
   * Format: /hapus_jadwal | schedule_id
   * Requirement: 3.3
   */
  async handleHapusJadwal(args: string[], _userId: string, _platform: Platform): Promise<CommandResponse> {
    try {
      if (args.length < 1) {
        return {
          success: false,
          message: '❌ Format salah!\n\nGunakan: /hapus_jadwal | schedule_id'
        };
      }

      const [scheduleId] = args;
      await this.scheduleService.deleteSchedule(scheduleId);

      return {
        success: true,
        message: '✅ Jadwal berhasil dihapus!'
      };
    } catch (error) {
      logger.error('Failed to delete schedule', error as Error);
      return {
        success: false,
        message: '❌ Gagal menghapus jadwal. Pastikan schedule_id benar.'
      };
    }
  }

  /**
   * Handle /ganti_jadwal command
   * Format: /ganti_jadwal | schedule_id | field | value | alasan
   * Requirement: 3.4
   */
  async handleGantiJadwal(args: string[], _userId: string, _platform: Platform): Promise<CommandResponse> {
    try {
      if (args.length < 4) {
        return {
          success: false,
          message: '❌ Format salah!\n\nGunakan: /ganti_jadwal | schedule_id | field | value | alasan\n\nContoh: /ganti_jadwal | 123abc | ruangan | R.202 | Ruangan lama sedang renovasi'
        };
      }

      const [scheduleId, field, value, alasan] = args;

      // Update schedule
      const schedule = await this.scheduleService.updateSchedule(scheduleId, field, value);

      // Create announcement
      await this.announcementService.createAnnouncement({
        tanggal: new Date(),
        judul: `Perubahan Jadwal: ${schedule.mata_pelajaran}`,
        tipe: 'perubahan_jadwal',
        keterangan: `${field} diubah menjadi ${value}. Alasan: ${alasan}`
      });

      return {
        success: true,
        message: `✅ Jadwal berhasil diubah dan pengumuman dibuat!\n\n📖 ${schedule.mata_pelajaran}\n📝 ${field}: ${value}\n💬 Alasan: ${alasan}`
      };
    } catch (error) {
      logger.error('Failed to change schedule', error as Error);
      return {
        success: false,
        message: '❌ Gagal mengubah jadwal. Pastikan schedule_id benar.'
      };
    }
  }

  /**
   * Handle /edit_piket command
   * Format: /edit_piket | hari | nama1,nomor1 | nama2,nomor2 | ...
   * Requirement: 4.2
   */
  async handleEditPiket(args: string[], _userId: string, _platform: Platform): Promise<CommandResponse> {
    // Same as handleSetPiket (upsert logic)
    return this.handleSetPiket(args, _userId, _platform);
  }

  /**
   * Handle /hapus_pengumuman command
   * Format: /hapus_pengumuman | announcement_id
   * Requirement: 5.2
   */
  async handleHapusPengumuman(args: string[], _userId: string, _platform: Platform): Promise<CommandResponse> {
    try {
      if (args.length < 1) {
        return {
          success: false,
          message: '❌ Format salah!\n\nGunakan: /hapus_pengumuman | announcement_id'
        };
      }

      const [announcementId] = args;
      await this.announcementService.deleteAnnouncement(announcementId);

      return {
        success: true,
        message: '✅ Pengumuman berhasil dihapus!'
      };
    } catch (error) {
      logger.error('Failed to delete announcement', error as Error);
      return {
        success: false,
        message: '❌ Gagal menghapus pengumuman. Pastikan announcement_id benar.'
      };
    }
  }

  /**
   * Handle /broadcast command
   * Format: /broadcast | pesan
   * Requirement: 5.4
   */
  async handleBroadcast(args: string[], _userId: string, _platform: Platform): Promise<CommandResponse> {
    try {
      if (args.length < 1) {
        return {
          success: false,
          message: '❌ Format salah!\n\nGunakan: /broadcast | pesan'
        };
      }

      const message = args.join(' | ');

      return {
        success: true,
        message: `📢 *PENGUMUMAN*\n\n${message}`
      };
    } catch (error) {
      logger.error('Failed to broadcast', error as Error);
      return {
        success: false,
        message: '❌ Gagal mengirim broadcast.'
      };
    }
  }

  /**
   * Handle /broadcast_urgent command
   * Format: /broadcast_urgent | pesan
   * Requirement: 5.5
   */
  async handleBroadcastUrgent(args: string[], _userId: string, _platform: Platform): Promise<CommandResponse> {
    try {
      if (args.length < 1) {
        return {
          success: false,
          message: '❌ Format salah!\n\nGunakan: /broadcast_urgent | pesan'
        };
      }

      const message = args.join(' | ');

      return {
        success: true,
        message: `🚨 *PENGUMUMAN PENTING* 🚨\n\n${message}\n\n⚠️ Mohon segera dibaca!`
      };
    } catch (error) {
      logger.error('Failed to broadcast urgent', error as Error);
      return {
        success: false,
        message: '❌ Gagal mengirim broadcast urgent.'
      };
    }
  }
}
