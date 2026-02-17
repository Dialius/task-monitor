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
import { NotionService } from '../services/NotionService';
import { AITaskParserService } from '../services/AITaskParserService';
import ConfirmationService from '../services/ConfirmationService';
import { formatDailyRecap, formatWeeklyRecap } from '../utils/RecapFormatter';
import { Validator } from '../utils/Validator';
import { SubjectResolver } from '../services/SubjectResolver';
import { EditConfirmationService } from '../services/discord/EditConfirmationService';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

export class AdminCommandHandler {
  private aiTaskParser: AITaskParserService;

  constructor(
    private taskService: TaskService,
    private scheduleService: ScheduleService,
    private piketService: PiketService,
    private announcementService: AnnouncementService,
    private aiService: AIService,
    private notionService: NotionService
  ) {
    this.aiTaskParser = new AITaskParserService(aiService);
  }

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
          message: '',
          embedData: {
            title: '❌ Format Salah',
            description: 'Gunakan: `/add_tugas | judul | deskripsi | deadline (YYYY-MM-DD) | mata_pelajaran | tipe`\n\n**Contoh:**\n`/add_tugas | Essay Sejarah | Tulis essay tentang kemerdekaan | 2024-12-25 | Sejarah | individu`',
            color: 0xED4245
          }
        };
      }

      const [judul, deskripsi, deadlineStr, mata_pelajaran_raw, tipe] = args;

      // Resolve mata_pelajaran using fuzzy matching
      const resolvedSubject = SubjectResolver.resolve(mata_pelajaran_raw);
      if (!resolvedSubject) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Mata Pelajaran Tidak Dikenali',
            description: `"${mata_pelajaran_raw}" tidak ditemukan.\n\n**Pelajaran yang tersedia:**\n${SubjectResolver.getAvailableSubjectsMessage()}`,
            color: 0xED4245
          }
        };
      }
      const mata_pelajaran = resolvedSubject;

      // Validate date
      if (!Validator.isValidDate(deadlineStr)) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Format Tanggal Salah',
            description: 'Gunakan format YYYY-MM-DD (contoh: 2024-12-25)',
            color: 0xED4245
          }
        };
      }

      // Validate task type
      if (!Validator.isValidTaskType(tipe)) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Tipe Tugas Tidak Valid',
            description: 'Gunakan: `individu`, `kelompok`, atau `ujian`',
            color: 0xED4245
          }
        };
      }

      // Enhance description with AI (keep it concise and focused)
      const enhancedDesc = await this.aiService.rewriteText(
        deskripsi,
        'Rewrite in Indonesian. Maximum 1-2 short sentences. Keep only the core task, remove any extra explanation or motivation. Be direct and concise.'
      );

      const { DateTimeHelper } = await import('../utils/DateTimeHelper');

      const task = await this.taskService.createTask({
        judul,
        deskripsi: enhancedDesc,
        deadline: DateTimeHelper.parseDate(deadlineStr),
        mata_pelajaran,
        tipe: tipe as any,
        created_by: userId
      });

      // Sync to Notion if enabled
      if (this.notionService.isEnabled()) {
        const notionId = await this.notionService.addTaskToNotion({
          judul: task.judul,
          mata_pelajaran: task.mata_pelajaran,
          deskripsi: task.deskripsi,
          deadline: task.deadline,
          tipe: task.tipe,
          prioritas: task.prioritas,
          created_by: userId
        });

        if (notionId) {
          // Update MongoDB task with Notion ID
          await this.taskService.updateTask(task._id.toString(), 'notion_id', notionId);
          logger.info('Task synced to Notion', { taskId: task._id, notionId });
        }
      }

      const deadlineFormatted = new Date(task.deadline).toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });

      return {
        success: true,
        message: '',
        embedData: {
          title: '✅ Tugas Berhasil Ditambahkan!',
          description: `**${task.judul}**\n\n${this.getPriorityEmoji(task.prioritas)} ${task.mata_pelajaran} • ${deadlineFormatted}\n\n**ID:** \`${task._id}\`\n\n💡 Gunakan ID untuk edit/hapus${this.notionService.isEnabled() ? '\n✨ Synced to Notion' : ''}`,
          color: 0x57F287
        }
      };
    } catch (error) {
      logger.error('Failed to add task', error as Error);
      return {
        success: false,
        message: '',
        embedData: {
          title: '❌ Gagal Menambahkan Tugas',
          description: 'Silakan coba lagi.',
          color: 0xED4245
        }
      };
    }
  }

  /**
   * Handle /add_tugas_cepat command (Natural Language)
   * Format: /add_tugas_cepat <natural language description>
   * Example: /add_tugas_cepat Besok ada tugas matematika halaman 45-50 deadline jam 10
   */
  async handleAddTugasCepat(args: string[], userId: string, platform: Platform): Promise<CommandResponse> {
    try {
      const input = args.join(' ');

      // Check if user is responding to pending confirmation (for WhatsApp)
      if (platform === 'whatsapp' && ConfirmationService.hasPendingConfirmation(userId)) {
        return await this.handleConfirmationResponse(input, userId, platform);
      }

      // Validate input
      if (!input || input.length < 10) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Input Terlalu Pendek',
            description: 'Gunakan: `/add_tugas_cepat <deskripsi natural>`\n\n**Contoh:**\n• Besok ada tugas matematika halaman 45-50 deadline jam 10\n• Ujian fisika minggu depan, bawa kalkulator\n• Tugas kelompok bahasa indonesia, bikin puisi, deadline 15 februari',
            color: 0xED4245
          }
        };
      }

      // Parse with AI
      logger.info('Parsing natural language for add_tugas_cepat', { userId, input });
      const parsed = await this.aiTaskParser.parseNaturalLanguage(input);

      if (!parsed) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Tidak Dapat Memahami Input',
            description: 'Coba format seperti ini:\n• "Besok ada tugas matematika halaman 45-50 deadline jam 10"\n• "Ujian fisika minggu depan jam 9"\n• "Tugas kelompok bahasa indonesia deadline lusa"\n\nAtau gunakan format manual:\n`/add_tugas | judul | deskripsi | deadline | mata_pelajaran | tipe`',
            color: 0xED4245
          }
        };
      }

      // Validate parsed task
      const validation = this.aiTaskParser.validateParsedTask(parsed);
      if (!validation.valid) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Parsing Gagal',
            description: validation.errors.join('\n') + '\n\nSilakan coba lagi dengan informasi yang lebih lengkap.',
            color: 0xED4245
          }
        };
      }

      // For Discord: Return with button confirmation
      if (platform === 'discord') {
        // Import TaskConfirmationService
        const { TaskConfirmationService } = await import('../services/discord/TaskConfirmationService');

        // Store pending confirmation
        TaskConfirmationService.setPendingConfirmation(userId, parsed);

        // Format preview embed
        const previewEmbed = this.formatTaskPreviewEmbed(parsed);

        return {
          success: true,
          message: '',
          embedData: previewEmbed,
          data: {
            showConfirmationButtons: true,
            parsedTask: parsed
          }
        };
      }

      // For WhatsApp: Store and show text confirmation
      ConfirmationService.storePendingConfirmation(userId, platform, parsed);
      const previewMessage = ConfirmationService.formatPreviewMessage(parsed);

      return {
        success: true,
        message: previewMessage
      };
    } catch (error) {
      logger.error('Failed to handle add_tugas_cepat', error as Error, { userId });
      return {
        success: false,
        message: '❌ Terjadi kesalahan saat memproses input. Silakan coba lagi.'
      };
    }
  }

  /**
   * Format task preview embed for Discord
   */
  private formatTaskPreviewEmbed(parsed: any): any {
    const deadline = new Date(parsed.deadline);
    const formattedDeadline = deadline.toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const fields = [
      {
        name: '📝 Judul',
        value: parsed.judul || '-',
        inline: false
      },
      {
        name: '📚 Mata Pelajaran',
        value: parsed.mata_pelajaran || '-',
        inline: true
      },
      {
        name: '👥 Tipe',
        value: parsed.tipe === 'individu' ? 'Individu' : parsed.tipe === 'kelompok' ? 'Kelompok' : 'Ujian',
        inline: true
      },
      {
        name: '📅 Deadline',
        value: formattedDeadline,
        inline: false
      },
      {
        name: '📄 Deskripsi',
        value: parsed.deskripsi || '-',
        inline: false
      }
    ];

    // Add date warning if present
    if (parsed._dateWarning) {
      fields.push({
        name: '⚠️ Peringatan Tanggal',
        value: parsed._dateWarning,
        inline: false
      });
    }

    return {
      title: '✅ Tugas Berhasil Di-parse',
      description: 'Silakan konfirmasi data tugas berikut:',
      color: parsed._dateWarning ? 0xFEE75C : 0x57F287, // Yellow if warning
      fields
    };
  }

  /**
   * Handle confirmation response (ya/edit/batal)
   */
  private async handleConfirmationResponse(
    input: string,
    userId: string,
    _platform: Platform
  ): Promise<CommandResponse> {
    const pending = ConfirmationService.getPendingConfirmation(userId);

    if (!pending) {
      return {
        success: false,
        message: '',
        embedData: {
          title: '⏱️ Konfirmasi Expired',
          description: 'Silakan gunakan `/add_tugas_cepat` lagi.',
          color: 0xFEE75C
        }
      };
    }

    const inputLower = input.toLowerCase().trim();

    // Handle "ya" - confirm and save
    if (inputLower === 'ya' || inputLower === 'yes') {
      try {
        // Create task
        const task = await this.taskService.createTask({
          judul: pending.parsedTask.judul,
          deskripsi: pending.parsedTask.deskripsi,
          deadline: pending.parsedTask.deadline,
          mata_pelajaran: pending.parsedTask.mata_pelajaran,
          tipe: pending.parsedTask.tipe,
          created_by: userId
        });

        // Update prioritas if not normal
        if (pending.parsedTask.prioritas !== 'normal') {
          await this.taskService.updateTask(task._id.toString(), 'prioritas', pending.parsedTask.prioritas);
        }

        // Sync to Notion if enabled
        if (this.notionService.isEnabled()) {
          const notionId = await this.notionService.addTaskToNotion({
            judul: task.judul,
            mata_pelajaran: task.mata_pelajaran,
            deskripsi: task.deskripsi,
            deadline: task.deadline,
            tipe: task.tipe,
            prioritas: pending.parsedTask.prioritas,
            created_by: userId
          });

          if (notionId) {
            await this.taskService.updateTask(task._id.toString(), 'notion_id', notionId);
          }
        }

        // Remove pending confirmation
        ConfirmationService.removePendingConfirmation(userId);

        const deadlineFormatted = new Date(task.deadline).toLocaleDateString('id-ID', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        });

        return {
          success: true,
          message: '',
          embedData: {
            title: '✅ Tugas Berhasil Ditambahkan!',
            description: `**${task.judul}**\n\n${this.getPriorityEmoji(pending.parsedTask.prioritas)} ${task.mata_pelajaran} • ${deadlineFormatted}\n\n**ID:** \`${task._id}\`${this.notionService.isEnabled() ? '\n✨ Synced to Notion' : ''}`,
            color: 0x57F287
          }
        };
      } catch (error) {
        logger.error('Failed to create task from confirmation', error as Error, { userId });
        ConfirmationService.removePendingConfirmation(userId);
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Gagal Menyimpan Tugas',
            description: 'Silakan coba lagi.',
            color: 0xED4245
          }
        };
      }
    }

    // Handle "batal" - cancel
    if (inputLower === 'batal' || inputLower === 'cancel') {
      ConfirmationService.removePendingConfirmation(userId);
      return {
        success: true,
        message: '',
        embedData: {
          title: '❌ Pembuatan Tugas Dibatalkan',
          description: 'Gunakan `/add_tugas_cepat` untuk mencoba lagi.',
          color: 0x99AAB5
        }
      };
    }

    // Handle "edit [field] [value]" - edit field
    const editParsed = ConfirmationService.parseEditCommand(input);
    if (editParsed) {
      const result = ConfirmationService.applyEdit(
        pending.parsedTask,
        editParsed.field,
        editParsed.value
      );

      if (!result.success) {
        return {
          success: false,
          message: result.message
        };
      }

      // Update pending confirmation with edited task
      ConfirmationService.updatePendingField(userId, editParsed.field as any, (result.updatedTask as any)[editParsed.field]);

      // Show updated preview
      const updatedPending = ConfirmationService.getPendingConfirmation(userId);
      if (updatedPending) {
        const previewMessage = ConfirmationService.formatPreviewMessage(updatedPending.parsedTask);
        return {
          success: true,
          message: `${result.message}\n\n${previewMessage}`
        };
      }
    }

    // Invalid response
    return {
      success: false,
      message: '',
      embedData: {
        title: '❌ Respon Tidak Dikenali',
        description: 'Ketik:\n• **ya** untuk simpan\n• **edit [field] [value]** untuk ubah\n• **batal** untuk cancel\n\nContoh: `edit prioritas urgent`',
        color: 0xED4245
      }
    };
  }

  /**
   * Handle /edit_tugas command — Step 1: Show preview + Edit/Cancel buttons
   * Format: /edit_tugas [id]
   * Requirement: 2.3
   */
  async handleEditTugas(args: string[], userId: string, _platform: Platform): Promise<CommandResponse> {
    try {
      if (args.length < 1) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Format Salah',
            description: 'Gunakan: `/edit_tugas [id]`',
            color: 0xED4245
          }
        };
      }

      const [taskId] = args;
      const task = await this.taskService.getTaskById(taskId);

      if (!task) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Tugas Tidak Ditemukan',
            description: `Tidak ada tugas dengan ID \`${taskId}\``,
            color: 0xED4245
          }
        };
      }

      // Store confirmation data
      const deadline = new Date(task.deadline);
      EditConfirmationService.setPending(userId, 'edit_tugas', taskId, {
        judul: task.judul,
        deskripsi: task.deskripsi,
        deadline: deadline.toISOString().slice(0, 16).replace('T', ' '),
        mata_pelajaran: task.mata_pelajaran,
        tipe: task.tipe
      });

      const formattedDeadline = deadline.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

      return {
        success: true,
        message: '',
        embedData: {
          title: '✏️ Edit Tugas',
          description: `Berikut detail tugas yang akan diedit:`,
          color: 0x5865F2,
          fields: [
            { name: '📝 Judul', value: task.judul, inline: false },
            { name: '📖 Deskripsi', value: task.deskripsi || '(kosong)', inline: false },
            { name: '📅 Deadline', value: formattedDeadline, inline: true },
            { name: '📚 Mata Pelajaran', value: task.mata_pelajaran, inline: true },
            { name: '📋 Tipe', value: task.tipe, inline: true },
          ]
        },
        data: {
          showEditButtons: true,
          editType: 'edit_tugas'
        }
      };
    } catch (error) {
      logger.error('Failed to preview task for edit', error as Error);
      return {
        success: false,
        message: '',
        embedData: {
          title: '❌ Gagal Memuat Tugas',
          description: 'Pastikan ID tugas benar.',
          color: 0xED4245
        }
      };
    }
  }

  /**
   * Handle /hapus_tugas command — Show preview + Confirm/Cancel buttons
   * Format: /hapus_tugas [id]
   * Requirement: 2.4
   */
  async handleHapusTugas(args: string[], userId: string, _platform: Platform): Promise<CommandResponse> {
    try {
      if (args.length < 1) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Format Salah',
            description: 'Gunakan: `/hapus_tugas [id]`',
            color: 0xED4245
          }
        };
      }

      const [taskId] = args;
      const task = await this.taskService.getTaskById(taskId);

      if (!task) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Tugas Tidak Ditemukan',
            description: `Tidak ada tugas dengan ID \`${taskId}\``,
            color: 0xED4245
          }
        };
      }

      // Store confirmation data
      EditConfirmationService.setPending(userId, 'hapus_tugas', taskId, {
        judul: task.judul,
        deskripsi: task.deskripsi,
        mata_pelajaran: task.mata_pelajaran
      });

      const deadline = new Date(task.deadline);
      const formattedDeadline = deadline.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

      return {
        success: true,
        message: '',
        embedData: {
          title: '🗑️ Hapus Tugas',
          description: `Apakah kamu yakin ingin menghapus tugas ini?`,
          color: 0xED4245,
          fields: [
            { name: '📝 Judul', value: task.judul, inline: false },
            { name: '📖 Deskripsi', value: task.deskripsi || '(kosong)', inline: false },
            { name: '📅 Deadline', value: formattedDeadline, inline: true },
            { name: '📚 Mata Pelajaran', value: task.mata_pelajaran, inline: true },
            { name: '📋 Tipe', value: task.tipe, inline: true },
          ]
        },
        data: {
          showDeleteButtons: true,
          editType: 'hapus_tugas'
        }
      };
    } catch (error) {
      logger.error('Failed to preview task for delete', error as Error);
      return {
        success: false,
        message: '',
        embedData: {
          title: '❌ Gagal Memuat Tugas',
          description: 'Pastikan ID tugas benar.',
          color: 0xED4245
        }
      };
    }
  }

  /**
   * Handle /tandai_selesai command — Show preview + Confirm/Cancel buttons
   * Format: /tandai_selesai [id]
   * Requirement: 2.5
   */
  async handleTandaiSelesai(args: string[], userId: string, _platform: Platform): Promise<CommandResponse> {
    try {
      if (args.length < 1) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Format Salah',
            description: 'Gunakan: `/tandai_selesai [id]`',
            color: 0xED4245
          }
        };
      }

      const [taskId] = args;
      const task = await this.taskService.getTaskById(taskId);

      if (!task) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Tugas Tidak Ditemukan',
            description: `Tidak ada tugas dengan ID \`${taskId}\``,
            color: 0xED4245
          }
        };
      }

      // Store confirmation data
      EditConfirmationService.setPending(userId, 'tandai_selesai', taskId, {
        judul: task.judul,
        status: task.status
      });

      const deadline = new Date(task.deadline);
      const formattedDeadline = deadline.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

      return {
        success: true,
        message: '',
        embedData: {
          title: '✅ Tandai Tugas Selesai',
          description: `Apakah kamu yakin ingin menandai tugas ini sebagai selesai?`,
          color: 0x57F287,
          fields: [
            { name: '📝 Judul', value: task.judul, inline: false },
            { name: '📅 Deadline', value: formattedDeadline, inline: true },
            { name: '📚 Mata Pelajaran', value: task.mata_pelajaran, inline: true },
            { name: '📋 Status', value: task.status, inline: true },
          ]
        },
        data: {
          showDeleteButtons: true,
          editType: 'tandai_selesai'
        }
      };
    } catch (error) {
      logger.error('Failed to preview task for completion', error as Error);
      return {
        success: false,
        message: '',
        embedData: {
          title: '❌ Gagal Memuat Tugas',
          description: 'Pastikan ID tugas benar.',
          color: 0xED4245
        }
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
          message: '',
          embedData: {
            title: '❌ Format Salah',
            description: 'Gunakan: `/add_jadwal | hari | jam_mulai | jam_selesai | mata_pelajaran | ruangan | nama_guru`\n\n**Contoh:**\n`/add_jadwal | Senin | 08:00 | 09:30 | Matematika | R.101 | Pak Budi`',
            color: 0xED4245
          }
        };
      }

      const [hari, jam_mulai, jam_selesai, mata_pelajaran_raw, ruangan, nama_guru] = args;

      // Resolve mata_pelajaran using fuzzy matching
      const resolvedSubject = SubjectResolver.resolve(mata_pelajaran_raw);
      if (!resolvedSubject) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Mata Pelajaran Tidak Dikenali',
            description: `"${mata_pelajaran_raw}" tidak ditemukan.\n\n**Pelajaran yang tersedia:**\n${SubjectResolver.getAvailableSubjectsMessage()}`,
            color: 0xED4245
          }
        };
      }
      const mata_pelajaran = resolvedSubject;

      // Validate day
      if (!Validator.isValidDay(hari)) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Hari Tidak Valid',
            description: 'Gunakan: Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu',
            color: 0xED4245
          }
        };
      }

      // Validate time
      if (!Validator.isValidTime(jam_mulai) || !Validator.isValidTime(jam_selesai)) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Format Waktu Salah',
            description: 'Gunakan format HH:MM (contoh: 08:00)',
            color: 0xED4245
          }
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
        message: '',
        embedData: {
          title: '✅ Jadwal Berhasil Ditambahkan!',
          description: `**${schedule.mata_pelajaran}**\n\n⏰ ${schedule.jam_mulai}-${schedule.jam_selesai}\n📅 ${schedule.hari}\n🏫 ${schedule.ruangan}\n👨‍🏫 ${schedule.nama_guru}\n\n**ID:** \`${schedule._id}\`\n\n💡 Gunakan ID untuk edit/hapus`,
          color: 0x57F287
        }
      };
    } catch (error) {
      logger.error('Failed to add schedule', error as Error);
      return {
        success: false,
        message: '',
        embedData: {
          title: '❌ Gagal Menambahkan Jadwal',
          description: 'Silakan coba lagi.',
          color: 0xED4245
        }
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
          message: '',
          embedData: {
            title: '❌ Format Salah',
            description: 'Gunakan: `/set_piket | hari | nama1,nomor1 | nama2,nomor2`\n\n**Contoh:**\n`/set_piket | Senin | Budi,081234567890 | Ani,081234567891`',
            color: 0xED4245
          }
        };
      }

      const [hari, ...studentArgs] = args;

      // Validate day
      if (!Validator.isValidDay(hari)) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Hari Tidak Valid',
            description: 'Gunakan: Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu',
            color: 0xED4245
          }
        };
      }

      // Parse students
      const students: StudentInfo[] = studentArgs.map(arg => {
        const [nama, nomor_wa] = arg.split(',').map(s => s.trim());
        return { nama, nomor_wa };
      });

      if (!this.piketService) {
        throw new Error('PiketService is not available');
      }

      const piket = await this.piketService.setPiket(hari, students);

      return {
        success: true,
        message: '',
        embedData: {
          title: '✅ Piket Berhasil Diatur!',
          description: `**🧹 Piket ${piket.hari}:**\n\n${piket.nama_siswa.map((n, i) => `${i + 1}. ${n}`).join('\n')}`,
          color: 0x57F287
        }
      };
    } catch (error) {
      logger.error('Failed to set piket', error as Error);
      return {
        success: false,
        message: '',
        embedData: {
          title: '❌ Gagal Mengatur Piket',
          description: 'Silakan coba lagi.',
          color: 0xED4245
        }
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
          message: '',
          embedData: {
            title: '❌ Format Salah',
            description: 'Gunakan: `/add_pengumuman | tanggal (YYYY-MM-DD) | judul | tipe | keterangan`\n\n**Tipe:** `acara`, `perubahan_jadwal`, `praktikum`, `lainnya`',
            color: 0xED4245
          }
        };
      }

      const [tanggalStr, judul, tipe, keterangan] = args;

      // Validate date
      if (!Validator.isValidDate(tanggalStr)) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Format Tanggal Salah',
            description: 'Gunakan format YYYY-MM-DD',
            color: 0xED4245
          }
        };
      }

      // Validate type
      if (!Validator.isValidAnnouncementType(tipe)) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Tipe Pengumuman Tidak Valid',
            description: 'Gunakan: `acara`, `perubahan_jadwal`, `praktikum`, `lainnya`',
            color: 0xED4245
          }
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
        message: '',
        embedData: {
          title: '✅ Pengumuman Berhasil Ditambahkan!',
          description: `**${announcement.judul}**\n\n📅 ${tanggalFormatted}\n📝 ${announcement.keterangan}\n\n**ID:** \`${announcement._id}\`\n\n💡 Gunakan ID untuk hapus`,
          color: 0x57F287
        }
      };
    } catch (error) {
      logger.error('Failed to add announcement', error as Error);
      return {
        success: false,
        message: '',
        embedData: {
          title: '❌ Gagal Menambahkan Pengumuman',
          description: 'Silakan coba lagi.',
          color: 0xED4245
        }
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
   * Handle /edit_jadwal command — Show preview + Edit/Cancel buttons
   * Format: /edit_jadwal [id]
   * Requirement: 3.2
   */
  async handleEditJadwal(args: string[], userId: string, _platform: Platform): Promise<CommandResponse> {
    try {
      if (args.length < 1) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Format Salah',
            description: 'Gunakan: `/edit_jadwal [id]`',
            color: 0xED4245
          }
        };
      }

      const [scheduleId] = args;
      const schedule = await this.scheduleService.getScheduleById(scheduleId);

      if (!schedule) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Jadwal Tidak Ditemukan',
            description: `Tidak ada jadwal dengan ID \`${scheduleId}\``,
            color: 0xED4245
          }
        };
      }

      // Store confirmation data
      EditConfirmationService.setPending(userId, 'edit_jadwal', scheduleId, {
        jam_mulai: schedule.jam_mulai,
        jam_selesai: schedule.jam_selesai,
        mata_pelajaran: schedule.mata_pelajaran,
        ruangan: schedule.ruangan,
        nama_guru: schedule.nama_guru
      });

      return {
        success: true,
        message: '',
        embedData: {
          title: '✏️ Edit Jadwal',
          description: `Berikut detail jadwal yang akan diedit:`,
          color: 0x5865F2,
          fields: [
            { name: '📅 Hari', value: schedule.hari, inline: true },
            { name: '🕐 Jam Mulai', value: schedule.jam_mulai, inline: true },
            { name: '🕑 Jam Selesai', value: schedule.jam_selesai, inline: true },
            { name: '📚 Mata Pelajaran', value: schedule.mata_pelajaran, inline: true },
            { name: '🏫 Ruangan', value: schedule.ruangan, inline: true },
            { name: '👨‍🏫 Guru', value: schedule.nama_guru, inline: true },
          ]
        },
        data: {
          showEditButtons: true,
          editType: 'edit_jadwal'
        }
      };
    } catch (error) {
      logger.error('Failed to preview schedule for edit', error as Error);
      return {
        success: false,
        message: '',
        embedData: {
          title: '❌ Gagal Memuat Jadwal',
          description: 'Pastikan ID jadwal benar.',
          color: 0xED4245
        }
      };
    }
  }

  /**
   * Handle /hapus_jadwal command — Show preview + Confirm/Cancel buttons
   * Format: /hapus_jadwal [id]
   * Requirement: 3.3
   */
  async handleHapusJadwal(args: string[], userId: string, _platform: Platform): Promise<CommandResponse> {
    try {
      if (args.length < 1) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Format Salah',
            description: 'Gunakan: `/hapus_jadwal [id]`',
            color: 0xED4245
          }
        };
      }

      const [scheduleId] = args;
      const schedule = await this.scheduleService.getScheduleById(scheduleId);

      if (!schedule) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Jadwal Tidak Ditemukan',
            description: `Tidak ada jadwal dengan ID \`${scheduleId}\``,
            color: 0xED4245
          }
        };
      }

      // Store confirmation data
      EditConfirmationService.setPending(userId, 'hapus_jadwal', scheduleId, {
        hari: schedule.hari,
        mata_pelajaran: schedule.mata_pelajaran,
        jam_mulai: schedule.jam_mulai,
        jam_selesai: schedule.jam_selesai
      });

      return {
        success: true,
        message: '',
        embedData: {
          title: '🗑️ Hapus Jadwal',
          description: `Apakah kamu yakin ingin menghapus jadwal ini?`,
          color: 0xED4245,
          fields: [
            { name: '📅 Hari', value: schedule.hari, inline: true },
            { name: '🕐 Jam', value: `${schedule.jam_mulai} - ${schedule.jam_selesai}`, inline: true },
            { name: '📚 Mata Pelajaran', value: schedule.mata_pelajaran, inline: true },
            { name: '🏫 Ruangan', value: schedule.ruangan, inline: true },
            { name: '👨‍🏫 Guru', value: schedule.nama_guru, inline: true },
          ]
        },
        data: {
          showDeleteButtons: true,
          editType: 'hapus_jadwal'
        }
      };
    } catch (error) {
      logger.error('Failed to preview schedule for delete', error as Error);
      return {
        success: false,
        message: '',
        embedData: {
          title: '❌ Gagal Memuat Jadwal',
          description: 'Pastikan ID jadwal benar.',
          color: 0xED4245
        }
      };
    }
  }

  /**
   * Handle /ganti_jadwal command — Show preview + Edit/Cancel buttons
   * Format: /ganti_jadwal [id]
   * Requirement: 3.4
   */
  async handleGantiJadwal(args: string[], userId: string, _platform: Platform): Promise<CommandResponse> {
    try {
      if (args.length < 1) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Format Salah',
            description: 'Gunakan: `/ganti_jadwal [id]`',
            color: 0xED4245
          }
        };
      }

      const [scheduleId] = args;
      const schedule = await this.scheduleService.getScheduleById(scheduleId);

      if (!schedule) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Jadwal Tidak Ditemukan',
            description: `Tidak ada jadwal dengan ID \`${scheduleId}\``,
            color: 0xED4245
          }
        };
      }

      // Store confirmation data
      EditConfirmationService.setPending(userId, 'ganti_jadwal', scheduleId, {
        jam_mulai: schedule.jam_mulai,
        jam_selesai: schedule.jam_selesai,
        mata_pelajaran: schedule.mata_pelajaran,
        ruangan: schedule.ruangan,
        nama_guru: schedule.nama_guru
      });

      return {
        success: true,
        message: '',
        embedData: {
          title: '🔄 Ganti Jadwal',
          description: `Berikut detail jadwal yang akan diubah:\n*(Akan membuat pengumuman perubahan)*`,
          color: 0xFEE75C,
          fields: [
            { name: '📅 Hari', value: schedule.hari, inline: true },
            { name: '🕐 Jam Mulai', value: schedule.jam_mulai, inline: true },
            { name: '🕑 Jam Selesai', value: schedule.jam_selesai, inline: true },
            { name: '📚 Mata Pelajaran', value: schedule.mata_pelajaran, inline: true },
            { name: '🏫 Ruangan', value: schedule.ruangan, inline: true },
            { name: '👨‍🏫 Guru', value: schedule.nama_guru, inline: true },
          ]
        },
        data: {
          showEditButtons: true, // This triggers the Confirm/Cancel buttons in bot.ts
          editType: 'ganti_jadwal'
        }
      };
    } catch (error) {
      logger.error('Failed to preview schedule for change', error as Error);
      return {
        success: false,
        message: '',
        embedData: {
          title: '❌ Gagal Memuat Jadwal',
          description: 'Pastikan ID jadwal benar.',
          color: 0xED4245
        }
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
          message: '',
          embedData: {
            title: '❌ Format Salah',
            description: 'Gunakan: `/hapus_pengumuman | announcement_id`',
            color: 0xED4245
          }
        };
      }

      const [announcementId] = args;
      await this.announcementService.deleteAnnouncement(announcementId);

      return {
        success: true,
        message: '',
        embedData: {
          title: '✅ Pengumuman Berhasil Dihapus!',
          description: 'Pengumuman telah dihapus dari database.',
          color: 0x57F287
        }
      };
    } catch (error) {
      logger.error('Failed to delete announcement', error as Error);
      return {
        success: false,
        message: '',
        embedData: {
          title: '❌ Gagal Menghapus Pengumuman',
          description: 'Pastikan announcement_id benar.',
          color: 0xED4245
        }
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
          message: '',
          embedData: {
            title: '❌ Format Salah',
            description: 'Gunakan: `/broadcast | pesan`',
            color: 0xED4245
          }
        };
      }

      const message = args.join(' | ');

      return {
        success: true,
        message: '',
        embedData: {
          title: '📢 PENGUMUMAN',
          description: message,
          color: 0x5865F2
        }
      };
    } catch (error) {
      logger.error('Failed to broadcast', error as Error);
      return {
        success: false,
        message: '',
        embedData: {
          title: '❌ Gagal Mengirim Broadcast',
          description: 'Silakan coba lagi.',
          color: 0xED4245
        }
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
          message: '',
          embedData: {
            title: '❌ Format Salah',
            description: 'Gunakan: `/broadcast_urgent | pesan`',
            color: 0xED4245
          }
        };
      }

      const message = args.join(' | ');

      return {
        success: true,
        message: '',
        embedData: {
          title: '🚨 PENGUMUMAN PENTING 🚨',
          description: `${message}\n\n⚠️ **Mohon segera dibaca!**`,
          color: 0xED4245
        }
      };
    } catch (error) {
      logger.error('Failed to broadcast urgent', error as Error);
      return {
        success: false,
        message: '',
        embedData: {
          title: '❌ Gagal Mengirim Broadcast Urgent',
          description: 'Silakan coba lagi.',
          color: 0xED4245
        }
      };
    }
  }

  /**
   * Handle /test_reminder command - Test reminder output
   * Format: /test_reminder | type (daily/weekly/monday)
   */
  async handleTestReminder(args: string[], _userId: string, _platform: Platform): Promise<CommandResponse> {
    try {
      const type = args[0]?.toLowerCase() || 'daily';

      if (!['daily', 'weekly', 'monday'].includes(type)) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Tipe Tidak Valid',
            description: 'Gunakan: `/test_reminder | daily/weekly/monday`\n\n**Contoh:**\n• `/test_reminder | daily`\n• `/test_reminder | weekly`\n• `/test_reminder | monday`',
            color: 0xED4245
          }
        };
      }

      // Auto-sync from Notion before generating reminder
      if (this.notionService && this.notionService.isEnabled()) {
        logger.info('Auto-syncing from Notion before /test_reminder command');
        try {
          await this.notionService.syncFromNotion();
        } catch (syncError) {
          logger.warn('Notion sync failed, using cached data from MongoDB', syncError as Error);
          // Continue with cached data - don't fail the command
        }
      }

      // Get tasks from database
      const tasks = await this.taskService.getTasks();

      if (tasks.length === 0) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Tidak Ada Tugas',
            description: 'Tidak ada tugas di database!\n\n💡 Tambah tugas dulu dengan `/add_tugas`',
            color: 0xFEE75C
          }
        };
      }

      let message: string = '';
      const { DateTimeHelper } = await import('../utils/DateTimeHelper');

      if (type === 'daily') {
        // Get tomorrow's date
        const tomorrow = DateTimeHelper.now();
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Filter tasks for tomorrow
        const tomorrowTasks = tasks.filter(task => {
          const taskDate = new Date(task.deadline);
          return taskDate.toDateString() === tomorrow.toDateString();
        });

        if (tomorrowTasks.length === 0) {
          message = formatDailyRecap({ date: tomorrow, tasks: [], schedules: [] });
          message += '\n\n⚠️ Tidak ada tugas untuk besok di database';
        } else {
          message = formatDailyRecap({ date: tomorrow, tasks: tomorrowTasks, schedules: [] });
        }
      } else if (type === 'weekly') {
        // Get next week's tasks
        const today = DateTimeHelper.now();
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const weekTasks = tasks.filter(task => {
          const taskDate = new Date(task.deadline);
          return taskDate >= today && taskDate <= nextWeek;
        });

        // Group tasks by day
        const tasksByDay = new Map<string, any[]>();
        weekTasks.forEach(task => {
          const taskDate = new Date(task.deadline);
          const dayKey = taskDate.toISOString().split('T')[0];
          if (!tasksByDay.has(dayKey)) {
            tasksByDay.set(dayKey, []);
          }
          tasksByDay.get(dayKey)!.push(task);
        });

        const weekNumber = Math.ceil(today.getDate() / 7);
        const month = today.toLocaleDateString('id-ID', { month: 'short' });

        if (weekTasks.length === 0) {
          message = formatWeeklyRecap({
            weekNumber,
            month,
            year: today.getFullYear(),
            tasksByDay
          });
          message += '\n\n⚠️ Tidak ada tugas untuk minggu depan di database';
        } else {
          message = formatWeeklyRecap({
            weekNumber,
            month,
            year: today.getFullYear(),
            tasksByDay
          });
        }
      }



      return {
        success: true,
        message: '',
        embedData: {
          title: '🧪 TEST REMINDER OUTPUT',
          description: `**Tipe:** ${type.toUpperCase()}\n**Total tugas di DB:** ${tasks.length}\n\n━━━━━━━━━━━━━━━━━━\n\n${message}\n\n━━━━━━━━━━━━━━━━━━\n\n✅ Preview berhasil!\n💡 Ini adalah preview format reminder yang akan dikirim otomatis.`,
          color: 0x5865F2
        }
      };
    } catch (error) {
      logger.error('Failed to test reminder', error as Error);
      return {
        success: false,
        message: '',
        embedData: {
          title: '❌ Gagal Generate Test Reminder',
          description: 'Silakan coba lagi.',
          color: 0xED4245
        }
      };
    }
  }

  /**
   * Handle button confirmation for add_tugas_cepat (Discord only)
   */
  async handleTaskConfirmation(userId: string, action: 'confirm' | 'cancel'): Promise<CommandResponse> {
    try {
      const { TaskConfirmationService } = await import('../services/discord/TaskConfirmationService');

      const pending = TaskConfirmationService.getPendingConfirmation(userId);

      if (!pending) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '⏱️ Konfirmasi Expired',
            description: 'Silakan gunakan `/add_tugas_cepat` lagi.',
            color: 0xFEE75C
          }
        };
      }

      if (action === 'cancel') {
        TaskConfirmationService.clearConfirmation(userId);

        return {
          success: true,
          message: '',
          embedData: {
            title: '❌ Pembuatan Tugas Dibatalkan',
            description: 'Gunakan `/add_tugas_cepat` untuk mencoba lagi.',
            color: 0x99AAB5
          }
        };
      }

      // Confirm - create task
      const parsed = pending.parsedTask;
      const { DateTimeHelper } = await import('../utils/DateTimeHelper');

      const task = await this.taskService.createTask({
        judul: parsed.judul,
        mata_pelajaran: parsed.mata_pelajaran,
        deskripsi: parsed.deskripsi,
        deadline: DateTimeHelper.parseDate(parsed.deadline),
        tipe: parsed.tipe,
        created_by: userId
      });

      // Clear confirmation
      TaskConfirmationService.clearConfirmation(userId);

      // Sync to Notion if enabled
      if (this.notionService && this.notionService.isEnabled()) {
        try {
          const notionId = await this.notionService.addTaskToNotion({
            judul: task.judul,
            mata_pelajaran: task.mata_pelajaran,
            deskripsi: task.deskripsi,
            deadline: task.deadline,
            tipe: task.tipe,
            prioritas: task.prioritas,
            created_by: userId
          });

          if (notionId) {
            await this.taskService.updateTask(task._id.toString(), 'notion_id', notionId);
            logger.info('Task synced to Notion after creation', { taskId: task._id, notionId });
          }
        } catch (syncError) {
          logger.warn('Failed to sync task to Notion', syncError as Error);
        }
      }
      logger.info('Task created via add_tugas_cepat', {
        taskId: task._id,
        userId
      });

      return {
        success: true,
        message: '',
        embedData: {
          title: '✅ Tugas Berhasil Ditambahkan',
          description: `**${task.judul}** telah ditambahkan ke database.`,
          color: 0x57F287,
          fields: [
            {
              name: 'ID',
              value: `\`${task._id}\``,
              inline: false
            }
          ]
        }
      };
    } catch (error) {
      logger.error('Failed to handle task confirmation', error as Error, { userId });
      return {
        success: false,
        message: '',
        embedData: {
          title: '❌ Gagal Membuat Tugas',
          description: 'Terjadi kesalahan saat menyimpan tugas. Silakan coba lagi.',
          color: 0xED4245
        }
      };
    }
  }
  /**
   * Handle /sync_now command
   * Trigger manual bidirectional sync
   * Requirement: 5.3
   */
  async handleSyncNow(_args: string[], _userId: string, _platform: Platform): Promise<CommandResponse> {
    try {
      if (!this.notionService.isEnabled()) {
        return {
          success: false,
          message: '',
          embedData: {
            title: '❌ Notion Sync Disabled',
            description: 'Notion service tidak aktif. Cek konfigurasi .env',
            color: 0xED4245
          }
        };
      }

      // Initial response to indicate processing (since sync might take time)
      // Note: The router will send this first, but since we await the sync here, 
      // the user might see a delay if we don't handle it carefully. 
      // However, for admin commands we usually defer reply in bot.ts.
      // Let's just await the sync.

      const stats = await this.notionService.bidirectionalSync();

      const color = stats.errors > 0 ? 0xFEE75C : 0x57F287; // Yellow if errors, Green if success

      return {
        success: true,
        message: '',
        embedData: {
          title: '🔄 Manual Sync Completed',
          description: 'Bidirectional sync finished.',
          color: color,
          fields: [
            { name: '📥 From Notion', value: stats.fromNotion.toString(), inline: true },
            { name: '📤 To Notion', value: stats.toNotion.toString(), inline: true },
            { name: '\u200b', value: '\u200b', inline: false },
            { name: '🔄 Updated', value: stats.updated.toString(), inline: true },
            { name: '❌ Errors', value: stats.errors.toString(), inline: true },
          ]
        }
      };
    } catch (error) {
      logger.error('Failed to run manual sync', error as Error);
      return {
        success: false,
        message: '',
        embedData: {
          title: '❌ Sync Failed',
          description: (error as Error).message || 'Terjadi kesalahan internal.',
          color: 0xED4245
        }
      };
    }
  }
}
