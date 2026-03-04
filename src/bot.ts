/**
 * Main Bot Entry Point
 * Requirements: 1.1, 14.1, 16.1, 16.2, 16.3
 * Version: 1.1.0 - Bug Fixes & Improvements
 * Last Updated: 2026-02-15 - Timezone Fix, Session Persistence, UI Enhancements
 */

import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { initializeConfig, getConfigManager } from './config/ConfigManager';
import { initializeLogger, getLogger } from './utils/Logger';
import { CommandParser } from './utils/CommandParser';
import { CommandRouter } from './utils/CommandRouter';
import { PermissionService } from './services/PermissionService';
import { TaskService } from './services/TaskService';
import { ScheduleService } from './services/ScheduleService';
import { PiketService } from './services/PiketService';
import { AnnouncementService } from './services/AnnouncementService';
import { AIService } from './services/AIService';
import { NotionService } from './services/NotionService';
import { ReminderScheduler } from './services/ReminderScheduler';
import MessageEditService from './services/MessageEditService';
import { ChangeDetectionService } from './services/ChangeDetectionService';
import { AdminCommandHandler } from './handlers/AdminCommandHandler';
import { MemberCommandHandler } from './handlers/MemberCommandHandler';
import { DiscordClient } from './clients/DiscordClient';
import { BaileysClient } from './clients/BaileysClient';
import { PlatformAdapter } from './adapters/PlatformAdapter';
import { DiscordAdapter } from './adapters/DiscordAdapter';
import { WhatsAppAdapter } from './adapters/WhatsAppAdapter';
import { BotMonitorService } from './api/services/bot-monitor.service';
import { EditConfirmationService } from './services/discord/EditConfirmationService';
import { SyncNotificationService } from './services/SyncNotificationService';
import { HolidayService } from './services/HolidayService';

// Load environment variables
dotenv.config();

/**
 * Main Bot Class
 */
class MultiPlatformBot {
  private logger = getLogger();
  private commandParser = new CommandParser();
  private commandRouter!: CommandRouter;
  private permissionService!: PermissionService;

  // Services
  private taskService!: TaskService;
  private scheduleService!: ScheduleService;
  private piketService!: PiketService;
  private announcementService!: AnnouncementService;
  private aiService!: AIService;
  private notionService!: NotionService;
  private holidayService!: HolidayService;

  // New services for message tracking and editing
  private messageEditService: any; // Will be imported
  private changeDetectionService: any; // Will be imported

  // Handlers
  private adminHandler!: AdminCommandHandler;
  private memberHandler!: MemberCommandHandler;

  // Clients
  private discordClient?: DiscordClient;
  private whatsappClient?: BaileysClient;

  // Adapters
  private discordAdapter?: DiscordAdapter;
  private whatsappAdapter?: WhatsAppAdapter;

  // Scheduler
  private reminderScheduler?: ReminderScheduler;

  /**
   * Initialize bot
   */
  async initialize(): Promise<void> {
    try {
      console.log('\n╔════════════════════════════════════════════════════════╗');
      console.log('║   🤖 MULTI-PLATFORM CLASS REMINDER BOT                ║');
      console.log('╚════════════════════════════════════════════════════════╝\n');

      console.log('📋 Step 1/8: Initializing logger...');
      // Initialize logger
      const config = getConfigManager();
      initializeLogger({
        logDir: config.get('logDir'),
        logLevel: config.get('logLevel') as any,
        rotationInterval: 'daily'
      });
      console.log('✅ Logger initialized\n');

      console.log('📋 Step 2/8: Connecting to database...');
      // Connect to database
      await connectDatabase();
      console.log('✅ Database connected\n');

      console.log('📋 Step 3/8: Loading configuration...');
      // Initialize configuration from database
      await initializeConfig();
      console.log('✅ Configuration loaded\n');

      console.log('📋 Step 4/8: Initializing services...');
      // Initialize services
      await this.initializeServices();
      console.log('✅ Services initialized\n');

      console.log('📋 Step 5/8: Setting up command system...');
      // Initialize command system
      await this.initializeCommandSystem();
      console.log('✅ Command system ready\n');

      console.log('📋 Step 6/8: Connecting to platforms...');
      // Initialize platforms
      await this.initializePlatforms();
      console.log('✅ Platforms connected\n');

      console.log('📋 Step 6a/8: Performing initial sync...');
      // Initial sync
      try {
        if (this.notionService.isEnabled()) {
          await this.notionService.bidirectionalSync();
          console.log('✅ Initial sync completed\n');
        } else {
          console.log('   ℹ Notion sync disabled, skipping\n');
        }
      } catch (error) {
        this.logger.error('Initial sync failed', error as Error);
        console.log('   ⚠️ Initial sync failed (bot will continue)\n');
      }

      console.log('📋 Step 7/8: Starting reminder scheduler...');
      // Initialize reminder scheduler
      await this.initializeScheduler();
      console.log('✅ Scheduler started\n');

      console.log('📋 Step 8/8: Initializing message edit & change detection...');
      // Initialize message edit service and change detection
      await this.initializeMessageEditServices();
      console.log('✅ Message edit services started\n');

      this.logger.info('Bot initialized successfully');
    } catch (error) {
      console.error('\n❌ INITIALIZATION FAILED:', error);
      this.logger.error('Failed to initialize bot', error as Error);
      throw error;
    }
  }

  /**
   * Initialize all services
   */
  private async initializeServices(): Promise<void> {
    this.logger.info('Initializing services...');

    // Permission service
    this.permissionService = new PermissionService();
    await this.permissionService.loadUsers();

    // Business logic services
    this.taskService = new TaskService();
    this.scheduleService = new ScheduleService();
    this.piketService = new PiketService();
    this.announcementService = new AnnouncementService();

    // AI service
    this.aiService = new AIService(
      {
        apiKey: process.env.GROQ_API_KEY || '',
        model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
        timeout: parseInt(process.env.AI_TIMEOUT || '10')
      },
      {
        apiKey: process.env.GEMINI_API_KEY || '',
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        timeout: parseInt(process.env.AI_TIMEOUT || '10')
      }
    );

    // Notion service
    this.notionService = new NotionService();

    // Holiday service
    this.holidayService = new HolidayService();

    this.logger.info('Services initialized');
  }

  /**
   * Initialize command system
   */
  private async initializeCommandSystem(): Promise<void> {
    console.log('   → Setting up command parser...');

    // Initialize handlers (ProgressMessage will be set later after platform init)
    this.adminHandler = new AdminCommandHandler(
      this.taskService,
      this.scheduleService,
      this.piketService,
      this.announcementService,
      this.aiService,
      this.notionService,
      this.holidayService
    );

    this.memberHandler = new MemberCommandHandler(
      this.taskService,
      this.scheduleService,
      this.piketService,
      this.notionService,
      this.holidayService
    );

    // Initialize router
    this.commandRouter = new CommandRouter(this.permissionService);

    console.log('   → Registering admin commands...');
    // Register admin commands
    this.commandRouter.registerHandler('add_tugas', this.adminHandler.handleAddTugas.bind(this.adminHandler));
    this.commandRouter.registerHandler('add_tugas_cepat', this.adminHandler.handleAddTugasCepat.bind(this.adminHandler));
    this.commandRouter.registerHandler('edit_tugas', this.adminHandler.handleEditTugas.bind(this.adminHandler));
    this.commandRouter.registerHandler('hapus_tugas', this.adminHandler.handleHapusTugas.bind(this.adminHandler));
    this.commandRouter.registerHandler('tandai_selesai', this.adminHandler.handleTandaiSelesai.bind(this.adminHandler));
    this.commandRouter.registerHandler('add_jadwal', this.adminHandler.handleAddJadwal.bind(this.adminHandler));
    this.commandRouter.registerHandler('edit_jadwal', this.adminHandler.handleEditJadwal.bind(this.adminHandler));
    this.commandRouter.registerHandler('hapus_jadwal', this.adminHandler.handleHapusJadwal.bind(this.adminHandler));
    this.commandRouter.registerHandler('ganti_jadwal', this.adminHandler.handleGantiJadwal.bind(this.adminHandler));
    this.commandRouter.registerHandler('set_piket', this.adminHandler.handleSetPiket.bind(this.adminHandler));
    this.commandRouter.registerHandler('edit_piket', this.adminHandler.handleEditPiket.bind(this.adminHandler));
    this.commandRouter.registerHandler('add_pengumuman', this.adminHandler.handleAddPengumuman.bind(this.adminHandler));
    this.commandRouter.registerHandler('hapus_pengumuman', this.adminHandler.handleHapusPengumuman.bind(this.adminHandler));
    this.commandRouter.registerHandler('broadcast', this.adminHandler.handleBroadcast.bind(this.adminHandler));
    this.commandRouter.registerHandler('broadcast_urgent', this.adminHandler.handleBroadcastUrgent.bind(this.adminHandler));
    this.commandRouter.registerHandler('test_reminder', this.adminHandler.handleTestReminder.bind(this.adminHandler));
    this.commandRouter.registerHandler('sync_now', this.adminHandler.handleSyncNow.bind(this.adminHandler));

    // Holiday commands
    this.commandRouter.registerHandler('atur_libur', this.adminHandler.handleAturLibur.bind(this.adminHandler));
    // cek_libur moved to member handler
    this.commandRouter.registerHandler('hapus_libur', this.adminHandler.handleHapusLibur.bind(this.adminHandler));

    console.log('   → Registering member commands...');
    // Register member commands
    this.commandRouter.registerHandler('tugas', this.memberHandler.handleTugas.bind(this.memberHandler));
    this.commandRouter.registerHandler('tugas_hari_ini', this.memberHandler.handleTugasHariIni.bind(this.memberHandler));
    this.commandRouter.registerHandler('tugas_minggu_ini', this.memberHandler.handleTugasMingguIni.bind(this.memberHandler));
    this.commandRouter.registerHandler('jadwal', this.memberHandler.handleJadwal.bind(this.memberHandler));
    this.commandRouter.registerHandler('jadwal_hari_ini', this.memberHandler.handleJadwal.bind(this.memberHandler));
    this.commandRouter.registerHandler('jadwal_besok', this.memberHandler.handleJadwalBesok.bind(this.memberHandler));
    this.commandRouter.registerHandler('jadwal_minggu_ini', this.memberHandler.handleJadwalMingguIni.bind(this.memberHandler));
    this.commandRouter.registerHandler('piket', this.memberHandler.handlePiket.bind(this.memberHandler));
    this.commandRouter.registerHandler('piket_minggu_ini', this.memberHandler.handlePiketMingguIni.bind(this.memberHandler));
    this.commandRouter.registerHandler('cek_libur', this.memberHandler.handleCekLibur.bind(this.memberHandler));
    this.commandRouter.registerHandler('help', this.memberHandler.handleHelp.bind(this.memberHandler));
    this.commandRouter.registerHandler('bantuan', this.memberHandler.handleHelp.bind(this.memberHandler));
    this.commandRouter.registerHandler('status', this.memberHandler.handleStatus.bind(this.memberHandler));

    console.log('   → Registered 28 commands total');
    console.log('      • Admin commands: 16');
    console.log('      • Member commands: 12');
  }

  /**
   * Initialize platforms (Discord & WhatsApp)
   */
  private async initializePlatforms(): Promise<void> {
    let platformCount = 0;

    // Initialize Discord if enabled
    if (process.env.DISCORD_ENABLED === 'true' && process.env.DISCORD_BOT_TOKEN) {
      console.log('   → Connecting to Discord...');
      await this.initializeDiscord();
      platformCount++;
    } else {
      console.log('   → Discord: Disabled');
    }

    // Initialize WhatsApp if enabled
    if (process.env.WHATSAPP_ENABLED === 'true') {
      console.log('   → Connecting to WhatsApp...');
      await this.initializeWhatsApp();
      platformCount++;
    } else {
      console.log('   → WhatsApp: Disabled');
    }

    if (platformCount === 0) {
      throw new Error('No platform enabled! Enable at least one platform (Discord or WhatsApp) in .env');
    }

    console.log(`   → ${platformCount} platform(s) active`);
  }

  /**
   * Initialize Discord
   */
  private async initializeDiscord(): Promise<void> {
    const config = getConfigManager();

    this.discordClient = new DiscordClient({
      token: process.env.DISCORD_BOT_TOKEN!,
      clientId: process.env.DISCORD_CLIENT_ID!,
      guildId: process.env.DISCORD_GUILD_ID!,
      channelId: process.env.DISCORD_CHANNEL_ID!,
      activityEnabled: config.get('discordActivityEnabled'),
      activityInterval: config.get('discordActivityInterval')
    });

    await this.discordClient.connect();

    // Register slash commands
    console.log('   → Registering slash commands...');
    try {
      await this.discordClient.registerSlashCommands();
    } catch (error) {
      this.logger.error('Failed to register slash commands', error as Error);
      console.log('   ⚠ Slash commands registration failed');
    }

    // Setup activity status rotation
    this.discordClient.setupActivityStatus(this.taskService);



    // Setup Task Monitor feature
    try {
      await this.discordClient.setupTaskMonitor(
        this.taskService,
        this.scheduleService,
        this.announcementService,
        this.notionService,
        this.aiService,
        this.piketService,
        this.holidayService
      );
    } catch (error) {
      this.logger.error('Failed to setup Task Monitor, continuing without it', error as Error);
      console.log('   ⚠ Task Monitor disabled due to configuration error');
    }

    // Initialize Sync Notification Service
    const logChannelId = config.get('discordLogChannelId') || process.env.DISCORD_LOG_CHANNEL_ID || '';

    if (logChannelId) {
      const syncNotificationService = new SyncNotificationService(
        this.discordClient,
        logChannelId
      );
      this.notionService.setSyncNotificationService(syncNotificationService);
      this.logger.info('Sync Notification Service initialized', { logChannelId });
      console.log(`   → Sync Notification configured for channel: ${logChannelId}`);
    } else {
      this.logger.warn('Sync Notification Service skipped - no log channel ID provided');
    }



    this.discordAdapter = new DiscordAdapter(this.discordClient.getClient());

    // Handle slash commands
    this.discordClient.onSlashCommand(async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      // Extract command and arguments from slash command
      const command = interaction.commandName;
      const args: string[] = [];

      // Get all options from the interaction
      interaction.options.data.forEach(option => {
        if (option.value !== undefined) {
          args.push(String(option.value));
        }
      });

      console.log(`📨 Discord slash command: /${command} from ${interaction.user.tag}`);

      // Determine if command should be ephemeral (admin commands)
      const adminCommands = [
        'add_tugas', 'add_tugas_cepat', 'edit_tugas', 'hapus_tugas', 'tandai_selesai',
        'add_jadwal', 'edit_jadwal', 'hapus_jadwal', 'ganti_jadwal',
        'set_piket', 'edit_piket',
        'add_pengumuman', 'hapus_pengumuman',
        'broadcast', 'broadcast_urgent',
        'test_reminder', 'sync_now'
      ];

      const isEphemeral = adminCommands.includes(command);

      // Defer reply immediately to prevent timeout and set ephemeral state using flags
      await interaction.deferReply({
        flags: isEphemeral ? 64 : undefined // 64 = EPHEMERAL flag
      });

      // Get channel ID for progress messages
      const channelId = interaction.channelId;

      const response = await this.commandRouter.route(
        {
          command,
          args,
          rawMessage: `/${command} ${args.join(' | ')}`
        },
        interaction.user.id,
        'discord',
        channelId // Pass channelId for progress messages
      );

      // Check if response needs pagination
      if (response.data?.usePagination) {
        const { PaginationHelper } = await import('./utils/PaginationHelper');

        const embeds = PaginationHelper.createTaskEmbeds(
          response.data.tasks,
          5, // 5 tasks per page
          response.data.title,
          response.data.color
        );

        // Send initial embed with pagination buttons directly
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');

        const getButtons = (page: number) => {
          const row = new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
              .setCustomId('cmd_page_prev')
              .setEmoji('1472405030584848599')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === 0),
            new ButtonBuilder()
              .setCustomId('cmd_page_info')
              .setLabel(`${page + 1} / ${embeds.length}`)
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId('cmd_page_next')
              .setEmoji('1472405032594051104')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === embeds.length - 1)
          );
          return row;
        };

        await interaction.editReply({
          embeds: [embeds[0]],
          components: [getButtons(0)],
          content: response.message || undefined
        });

        // Get the message to add collector
        const message = await interaction.fetchReply();

        // Create collector for pagination
        let currentPage = 0;
        const collector = message.createMessageComponentCollector({
          componentType: 2, // Button
          time: 120000 // 2 minutes
        });

        collector.on('collect', async (btnInteraction: any) => {
          if (interaction.user.id !== btnInteraction.user.id) {
            await btnInteraction.reply({
              content: '❌ Hanya pengirim command yang bisa menggunakan tombol ini.',
              ephemeral: true
            });
            return;
          }

          if (btnInteraction.customId === 'cmd_page_prev') {
            currentPage = Math.max(0, currentPage - 1);
          } else if (btnInteraction.customId === 'cmd_page_next') {
            currentPage = Math.min(embeds.length - 1, currentPage + 1);
          }

          await btnInteraction.update({
            embeds: [embeds[currentPage]],
            components: [getButtons(currentPage)]
          });
        });

        collector.on('end', async () => {
          try {
            await interaction.editReply({ components: [] });
          } catch (error) {
            // Message might be deleted
          }
        });

        return;
      }

      // Check if response has embed data
      if (response.embedData) {
        const { EmbedBuilder } = await import('discord.js');
        const embed = new EmbedBuilder()
          .setTitle(response.embedData.title)
          .setColor(response.embedData.color);

        // Get footer - use custom footer if provided, otherwise use default
        if (response.embedData.footer) {
          embed.setFooter(response.embedData.footer);
        } else {
          const footerIcon = process.env.DISCORD_FOOTER_ICON || 'https://i.imgur.com/AfFp7pu.png';
          embed.setFooter({
            text: 'Made by VinTheGreat',
            iconURL: footerIcon
          });
        }

        // Add timestamp if requested
        if (response.embedData.timestamp) {
          embed.setTimestamp();
        }

        // Add description if present
        if (response.embedData.description) {
          embed.setDescription(response.embedData.description);
        }

        // Add fields if present
        if (response.embedData.fields && response.embedData.fields.length > 0) {
          embed.addFields(response.embedData.fields);
        }

        // Check if we need to show confirmation buttons (for add_tugas_cepat)
        if (response.data?.showConfirmationButtons) {
          const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');

          const row = new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
              .setCustomId('task_confirm_yes')
              .setLabel('✅ Yes')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId('task_confirm_no')
              .setLabel('❌ No')
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId('task_confirm_revise')
              .setLabel('✏️ Revise')
              .setStyle(ButtonStyle.Secondary)
          );

          await interaction.editReply({
            embeds: [embed],
            components: [row]
          });
        }
        // Check for Edit buttons (Edit/Cancel)
        else if (response.data?.showEditButtons) {
          const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');
          const userId = interaction.user.id;
          const isGantiJadwal = response.data.editType === 'ganti_jadwal'; // Special case for ganti_jadwal which is a confirm flow

          // If ganti_jadwal, it's actually a confirm flow, not an edit-modal flow
          if (isGantiJadwal) {
            const row = new ActionRowBuilder<any>().addComponents(
              new ButtonBuilder()
                .setCustomId(`btn_confirm_${userId}_${response.data.editType}`)
                .setLabel('✅ Konfirmasi')
                .setStyle(ButtonStyle.Success),
              new ButtonBuilder()
                .setCustomId(`btn_cancel_${userId}`)
                .setLabel('❌ Batal')
                .setStyle(ButtonStyle.Secondary)
            );
            await interaction.editReply({ embeds: [embed], components: [row] });
          } else {
            // Standard Edit flow (triggers modal)
            const row = new ActionRowBuilder<any>().addComponents(
              new ButtonBuilder()
                .setCustomId(`btn_edit_${userId}_${response.data.editType}`)
                .setLabel('✏️ Edit')
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId(`btn_cancel_${userId}`)
                .setLabel('❌ Batal')
                .setStyle(ButtonStyle.Secondary)
            );
            await interaction.editReply({ embeds: [embed], components: [row] });
          }
        }
        // Check for Delete/Confirm buttons
        else if (response.data?.showDeleteButtons) {
          const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');
          const userId = interaction.user.id;

          let label = '🗑️ Hapus';
          let style = ButtonStyle.Danger;

          if (response.data.editType === 'tandai_selesai') {
            label = '✅ Selesai';
            style = ButtonStyle.Success;
          }

          const row = new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
              .setCustomId(`btn_confirm_${userId}_${response.data.editType}`)
              .setLabel(label)
              .setStyle(style),
            new ButtonBuilder()
              .setCustomId(`btn_cancel_${userId}`)
              .setLabel('❌ Batal')
              .setStyle(ButtonStyle.Secondary)
          );

          await interaction.editReply({
            embeds: [embed],
            components: [row]
          });
        } else {
          await interaction.editReply({
            embeds: [embed]
          });
        }
      } else {
        // Use plain text for other commands
        await interaction.editReply({
          content: response.message
        });
      }
    });

    // Handle modal submissions
    this.discordClient.getClient().on('interactionCreate', async (interaction) => {
      if (!interaction.isModalSubmit()) return;

      const userId = interaction.user.id;

      // Handle task revision modal (add_tugas_cepat flow)
      if (interaction.customId === 'task_revise_modal') {
        try {
          await interaction.deferReply({ ephemeral: true });

          const { TaskConfirmationService } = await import('./services/discord/TaskConfirmationService');

          // Get pending confirmation
          const pending = TaskConfirmationService.getPendingConfirmation(userId);

          if (!pending) {
            await interaction.editReply({
              content: '⏱️ Konfirmasi expired. Silakan gunakan `/add_tugas_cepat` lagi.'
            });
            return;
          }

          // Get values from modal
          const judul = interaction.fields.getTextInputValue('judul');
          const mata_pelajaran = interaction.fields.getTextInputValue('mata_pelajaran');
          const deskripsi = interaction.fields.getTextInputValue('deskripsi');
          const deadlineStr = interaction.fields.getTextInputValue('deadline');
          const tipe = interaction.fields.getTextInputValue('tipe');

          // Parse deadline
          const deadline = new Date(deadlineStr);

          if (isNaN(deadline.getTime())) {
            await interaction.editReply({
              content: '❌ Format deadline tidak valid. Gunakan format: YYYY-MM-DD HH:MM'
            });
            return;
          }

          // Validate tipe
          if (tipe !== 'individu' && tipe !== 'kelompok') {
            await interaction.editReply({
              content: '❌ Tipe harus "individu" atau "kelompok"'
            });
            return;
          }

          // Update pending confirmation with revised data
          const revisedTask = {
            judul,
            mata_pelajaran,
            deskripsi,
            deadline: deadline.toISOString(),
            tipe
          };

          TaskConfirmationService.setPendingConfirmation(userId, revisedTask);

          // Show updated preview with confirmation buttons
          const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');

          const formattedDeadline = deadline.toLocaleString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          const embed = new EmbedBuilder()
            .setTitle('✅ Tugas Telah Direvisi')
            .setDescription('Silakan konfirmasi data tugas yang sudah direvisi:')
            .setColor(0x57F287)
            .addFields([
              {
                name: '📝 Judul',
                value: judul,
                inline: false
              },
              {
                name: '📚 Mata Pelajaran',
                value: mata_pelajaran,
                inline: true
              },
              {
                name: '👥 Tipe',
                value: tipe === 'individu' ? 'Individu' : 'Kelompok',
                inline: true
              },
              {
                name: '📅 Deadline',
                value: formattedDeadline,
                inline: false
              },
              {
                name: '📄 Deskripsi',
                value: deskripsi,
                inline: false
              }
            ]);

          const footerIcon = process.env.DISCORD_FOOTER_ICON || 'https://i.imgur.com/AfFp7pu.png';
          embed.setFooter({
            text: 'Made by VinTheGreat',
            iconURL: footerIcon
          });

          const row = new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
              .setCustomId('task_confirm_yes')
              .setLabel('✅ Yes')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId('task_confirm_no')
              .setLabel('❌ No')
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId('task_confirm_revise')
              .setLabel('✏️ Revise Again')
              .setStyle(ButtonStyle.Secondary)
          );

          await interaction.editReply({
            embeds: [embed],
            components: [row]
          });

          this.logger.info('Task revised via modal', { userId });
        } catch (error) {
          this.logger.error('Failed to handle modal submission', error as Error);
          try {
            await interaction.editReply({
              content: '❌ Terjadi kesalahan saat memproses revisi. Silakan coba lagi.'
            });
          } catch (e) {
            // Ignore if already replied
          }
        }
      }

      // Handle generic edit modal (edit_tugas, edit_jadwal, ganti_jadwal)
      if (interaction.customId.startsWith('modal_edit_')) {
        try {
          // Defer update to allow processing
          await interaction.deferUpdate();

          const parts = interaction.customId.split('_');
          // customId: modal_edit_editType
          // parts: ['modal', 'edit', ...editTypeParts]
          const editType = parts.slice(2).join('_');

          const pending = EditConfirmationService.getPending(userId);
          if (!pending) {
            await interaction.followUp({ content: '⏱️ Sesi edit telah berakhir / expired.', ephemeral: true });
            return;
          }

          // Extract fields based on editType
          const newData: Record<string, any> = {};

          if (editType === 'edit_tugas') {
            newData.judul = interaction.fields.getTextInputValue('judul');
            newData.mata_pelajaran = interaction.fields.getTextInputValue('mata_pelajaran');
            newData.deskripsi = interaction.fields.getTextInputValue('deskripsi');
            const deadlineStr = interaction.fields.getTextInputValue('deadline');
            // validation?
            if (deadlineStr) {
              // Try parse
              const d = new Date(deadlineStr);
              if (!isNaN(d.getTime())) {
                newData.deadline = d.toISOString();
              }
            }
            newData.tipe = interaction.fields.getTextInputValue('tipe');
          } else if (editType === 'edit_jadwal' || editType === 'ganti_jadwal') {
            newData.mata_pelajaran = interaction.fields.getTextInputValue('mata_pelajaran');
            newData.ruangan = interaction.fields.getTextInputValue('ruangan');
            newData.jam_mulai = interaction.fields.getTextInputValue('jam_mulai');
            newData.jam_selesai = interaction.fields.getTextInputValue('jam_selesai');
            newData.nama_guru = interaction.fields.getTextInputValue('nama_guru');
          }

          // Store new data
          EditConfirmationService.setNewData(userId, newData);

          // Show confirmation preview
          const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');

          // Helper to format diff
          const changes = EditConfirmationService.formatDiff(pending.originalData, newData);

          const embed = new EmbedBuilder()
            .setTitle('✅ Konfirmasi Perubahan')
            .setDescription(`Periksa kembali data sebelum menyimpan:\n\n${changes}`)
            .setColor(0x57F287);

          const row = new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
              .setCustomId(`btn_confirm_${userId}_${editType}`)
              .setLabel('💾 Simpan / Konfirmasi')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`btn_edit_${userId}_${editType}`) // Clicking this opens the modal again
              .setLabel('✏️ Revisi')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId(`btn_cancel_${userId}`)
              .setLabel('❌ Batal')
              .setStyle(ButtonStyle.Secondary)
          );

          // Edit the original message (which had the "Edit" button)
          await interaction.editReply({
            embeds: [embed],
            components: [row]
          });

        } catch (error) {
          this.logger.error('Failed to handle edit modal submission', error as Error);
          await interaction.followUp({ content: '❌ Terjadi kesalahan saat memproses data edit.', ephemeral: true });
        }
      }
    });

    // Handle text commands (fallback)
    this.discordClient.onTextCommand(async (message) => {
      const parsed = this.commandParser.parse(message.content);
      if (!parsed) return;

      console.log(`📨 Discord text command: /${parsed.command} from ${message.author.tag}`);

      // Get channel ID for progress messages
      const channelId = message.channelId;
      const response = await this.commandRouter.route(
        parsed,
        message.author.id,
        'discord',
        channelId // Pass channelId for progress messages
      );

      // Check if response needs pagination
      if (response.data?.usePagination) {
        const { PaginationHelper } = await import('./utils/PaginationHelper');
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');

        const embeds = PaginationHelper.createTaskEmbeds(
          response.data.tasks,
          5, // 5 tasks per page
          response.data.title,
          response.data.color
        );

        const getButtons = (page: number) => {
          const row = new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
              .setCustomId('cmd_page_prev')
              .setEmoji('1472405030584848599')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === 0),
            new ButtonBuilder()
              .setCustomId('cmd_page_info')
              .setLabel(`${page + 1} / ${embeds.length}`)
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId('cmd_page_next')
              .setEmoji('1472405032594051104')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === embeds.length - 1)
          );
          return row;
        };

        // Send initial message with pagination buttons
        const sentMessage = await message.reply({
          embeds: [embeds[0]],
          components: [getButtons(0)],
          content: response.message || undefined
        });

        // Create collector for pagination
        let currentPage = 0;
        const collector = sentMessage.createMessageComponentCollector({
          componentType: 2, // Button
          time: 120000 // 2 minutes
        });

        collector.on('collect', async (btnInteraction: any) => {
          if (message.author.id !== btnInteraction.user.id) {
            await btnInteraction.reply({
              content: '❌ Hanya pengirim command yang bisa menggunakan tombol ini.',
              ephemeral: true
            });
            return;
          }

          if (btnInteraction.customId === 'cmd_page_prev') {
            currentPage = Math.max(0, currentPage - 1);
          } else if (btnInteraction.customId === 'cmd_page_next') {
            currentPage = Math.min(embeds.length - 1, currentPage + 1);
          }

          await btnInteraction.update({
            embeds: [embeds[currentPage]],
            components: [getButtons(currentPage)]
          });
        });

        collector.on('end', async () => {
          try {
            await sentMessage.edit({ components: [] });
          } catch (error) {
            // Message might be deleted
          }
        });

        return;
      }

      // Check if response has embed data
      if (response.embedData) {
        const { EmbedBuilder } = await import('discord.js');
        const embed = new EmbedBuilder()
          .setTitle(response.embedData.title)
          .setColor(response.embedData.color);

        // Get footer - use custom footer if provided, otherwise use default
        if (response.embedData.footer) {
          embed.setFooter(response.embedData.footer);
        } else {
          const footerIcon = process.env.DISCORD_FOOTER_ICON || 'https://i.imgur.com/AfFp7pu.png';
          embed.setFooter({
            text: 'Made by VinTheGreat',
            iconURL: footerIcon
          });
        }

        // Add timestamp if requested
        if (response.embedData.timestamp) {
          embed.setTimestamp();
        }

        // Add description if present
        if (response.embedData.description) {
          embed.setDescription(response.embedData.description);
        }

        // Add fields if present
        if (response.embedData.fields && response.embedData.fields.length > 0) {
          embed.addFields(response.embedData.fields);
        }

        await message.reply({ embeds: [embed] });
      } else {
        await message.reply(response.message);
      }
    });

    console.log('      ✓ Discord bot online');
    console.log(`      ✓ Server: ${process.env.DISCORD_GUILD_ID}`);
    console.log(`      ✓ Channel: ${process.env.DISCORD_CHANNEL_ID}`);

    const activityService = this.discordClient.getActivityStatusService();
    if (activityService) {
      const activityConfig = activityService.getConfig();
      console.log(`      ✓ Activity rotation: ${activityConfig.enabled ? 'Enabled' : 'Disabled'}`);
      if (activityConfig.enabled) {
        console.log(`      ✓ Rotation interval: ${activityConfig.rotationInterval} minutes`);
      }
    }
  }

  /**
   * Initialize WhatsApp
   */
  private async initializeWhatsApp(): Promise<void> {
    console.log('      → Initializing Baileys client...');

    // Check if pairing code mode is enabled
    const usePairingCode = process.env.WHATSAPP_USE_PAIRING_CODE === 'true';
    const phoneNumber = process.env.WHATSAPP_PAIRING_NUMBER || process.env.FIRST_ADMIN_WHATSAPP_ID;

    // Use MongoDB auth for persistent sessions (survives container restarts)
    const useMongoAuth = process.env.WHATSAPP_USE_MONGO_AUTH !== 'false'; // Default: true

    this.whatsappClient = new BaileysClient({
      authDir: './auth_info',
      printQRInTerminal: true,
      usePairingCode,
      phoneNumber,
      useMongoAuth
    });

    if (usePairingCode && phoneNumber) {
      console.log('      → Using PAIRING CODE mode (better for Railway)');
      console.log(`      → Phone number: ${phoneNumber}`);
    } else {
      console.log('      → Using QR CODE mode');
    }

    console.log('      → Connecting to WhatsApp...');
    if (!usePairingCode) {
      console.log('      → Scan QR code with your phone if this is first time\n');
    }

    // Start connection (don't await - it will connect in background)
    this.whatsappClient.connect();

    // Wait for connection to be ready
    console.log('      → Waiting for WhatsApp connection...\n');
    await this.waitForWhatsAppReady();

    const socket = this.whatsappClient.getSocket();
    if (socket) {
      this.whatsappAdapter = new WhatsAppAdapter(socket);

      // Register message handler — WhatsApp is reminder-only, no command processing
      this.whatsappClient.onMessage(async (message) => {
        // Skip messages from bot itself to prevent loops
        if (message.key.fromMe) {
          return;
        }

        // Only track message activity, do NOT process commands
        BotMonitorService.updateState({
          messageCount: (BotMonitorService.getState().messageCount || 0) + 1,
          lastActivity: new Date()
        });
      });

      console.log('      ✓ WhatsApp connected');
      console.log('      ✓ Commands enabled - bot can add tasks');
      console.log('      ✓ Reminders enabled - auto sync from Notion');

      // Update bot monitor status
      BotMonitorService.updateState({
        whatsappConnected: true,
        lastActivity: new Date()
      });

      if (process.env.WHATSAPP_GROUP_ID) {
        console.log(`      ✓ Target channel: ${process.env.WHATSAPP_GROUP_ID}`);
      } else {
        console.log('      ⚠ WHATSAPP_GROUP_ID not set');
      }
    } else {
      throw new Error('Failed to get WhatsApp socket');
    }
  }

  /**
   * Wait for WhatsApp to be ready
   */
  private async waitForWhatsAppReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      const maxWait = 300000; // 5 minutes (lebih lama untuk scan QR)
      const checkInterval = 1000; // Check every 1 second (lebih jarang)
      let elapsed = 0;
      let lastLogTime = 0;

      const interval = setInterval(() => {
        if (this.whatsappClient?.isReady()) {
          clearInterval(interval);
          console.log('      ✓ WhatsApp ready!\n');
          resolve();
        } else if (elapsed >= maxWait) {
          clearInterval(interval);
          reject(new Error('WhatsApp connection timeout after 5 minutes'));
        }

        // Log progress setiap 30 detik
        if (elapsed - lastLogTime >= 30000) {
          const remaining = Math.floor((maxWait - elapsed) / 1000);
          console.log(`      ⏳ Menunggu koneksi... (${remaining}s tersisa)`);
          lastLogTime = elapsed;
        }

        elapsed += checkInterval;
      }, checkInterval);
    });
  }

  /**
   * Initialize reminder scheduler
   */
  private async initializeScheduler(): Promise<void> {
    // Build adapters list
    const adapters: { adapter: PlatformAdapter, channelId: string }[] = [];

    // Add WhatsApp adapter if available
    if (this.whatsappAdapter) {
      const waGroupId = process.env.WHATSAPP_GROUP_ID;
      if (waGroupId) {
        adapters.push({
          adapter: this.whatsappAdapter,
          channelId: waGroupId
        });
        console.log(`      ✓ Scheduler: Added WhatsApp adapter (Group: ${waGroupId})`);
      }
    }

    // Add Discord adapter if available
    if (this.discordAdapter) {
      const discordChannelId = process.env.DISCORD_REMINDER_CHANNEL_ID || process.env.DISCORD_CHANNEL_ID;
      if (discordChannelId) {
        adapters.push({
          adapter: this.discordAdapter,
          channelId: discordChannelId
        });
        console.log(`      ✓ Scheduler: Added Discord adapter (Channel: ${discordChannelId})`);
      }
    }

    if (adapters.length === 0) {
      console.log('   ⚠ No platform adapters configured for scheduler - disabled');
      return;
    }

    this.reminderScheduler = new ReminderScheduler(
      this.taskService,
      this.scheduleService,
      this.piketService,
      this.announcementService,
      this.aiService,
      adapters,
      {
        dailyReminderTime: process.env.DAILY_REMINDER_TIME || '16:00',
        weeklyReminderDay: parseInt(process.env.WEEKLY_REMINDER_DAY || '5'), // 5 = Friday
        weeklyReminderTime: process.env.WEEKLY_REMINDER_TIME || '21:00',
        timezone: process.env.TIMEZONE || 'Asia/Jakarta'
      },
      this.notionService,
      this.holidayService,
      this.discordClient?.getTaskMonitorService()
    );

    this.reminderScheduler.initialize();

    const dailyTime = process.env.DAILY_REMINDER_TIME || '16:00';
    const weeklyTime = process.env.WEEKLY_REMINDER_TIME || '21:00';
    console.log(`   → Daily recap (Sun-Thu): ${dailyTime} - Tasks for tomorrow`);
    console.log(`   → Weekly recap (Fri): ${weeklyTime} - Tasks for next week`);
    console.log('   → Timezone: ' + (process.env.TIMEZONE || 'Asia/Jakarta'));
  }

  /**
   * Initialize message edit services and change detection
   */
  private async initializeMessageEditServices(): Promise<void> {
    try {
      // Get WhatsApp socket and Discord client
      const whatsappSocket = this.whatsappClient?.getSocket();
      const discordClient = this.discordClient?.getClient();

      // Initialize MessageEditService with clients
      this.messageEditService = MessageEditService;
      this.messageEditService.initialize(whatsappSocket, discordClient);

      console.log('   → Message edit service initialized');

      // Initialize ChangeDetectionService with NotionService
      this.changeDetectionService = new ChangeDetectionService(this.notionService);
      this.changeDetectionService.start();

      console.log('   → Change detection cron started (runs every 1 hour)');
      console.log('   → Auto-edit messages when tasks are updated in Notion');
    } catch (error) {
      this.logger.error('Failed to initialize message edit services', error as Error);
      console.log('   ⚠ Message edit services disabled due to error');
    }
  }


  /**
   * Start bot
   */
  async start(): Promise<void> {
    await this.initialize();

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║   ✅ BOT IS RUNNING!                                  ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('📝 Available Commands:');
    console.log('   Member Commands:');
    console.log('   • /help atau /bantuan - Daftar command');
    console.log('   • /status - Status bot');
    console.log('   • /tugas - Semua tugas aktif');
    console.log('   • /tugas_hari_ini - Tugas hari ini');
    console.log('   • /jadwal - Jadwal hari ini');
    console.log('   • /piket - Piket hari ini');
    console.log('');
    console.log('   Admin Commands:');
    console.log('   • /add_tugas - Tambah tugas');
    console.log('   • /edit_tugas - Edit tugas');
    console.log('   • /hapus_tugas - Hapus tugas');
    console.log('   • /tandai_selesai - Tandai tugas selesai');
    console.log('   • /add_jadwal - Tambah jadwal');
    console.log('   • /edit_jadwal - Edit jadwal');
    console.log('   • /hapus_jadwal - Hapus jadwal');
    console.log('   • /ganti_jadwal - Ganti jadwal + announcement');
    console.log('   • /set_piket - Set piket');
    console.log('   • /edit_piket - Edit piket');
    console.log('   • /add_pengumuman - Tambah pengumuman');
    console.log('   • /hapus_pengumuman - Hapus pengumuman');
    console.log('   • /broadcast - Broadcast pesan');
    console.log('   • /broadcast_urgent - Broadcast urgent');
    console.log('');
    console.log('💡 Tip: Kirim /help di chat untuk melihat semua command\n');

    this.logger.info('🤖 Multi-Platform Bot is running!');
  }

  /**
  /**
   * Stop bot
   */
  async stop(): Promise<void> {
    this.logger.info('Stopping bot...');

    try {
      // Stop scheduler
      if (this.reminderScheduler) {
        this.reminderScheduler.stop();
      }

      // Stop change detection
      if (this.changeDetectionService) {
        this.changeDetectionService.stop();
      }

      // Disconnect clients
      if (this.whatsappClient) {
        await this.whatsappClient.disconnect();
      }

      if (this.discordClient) {
        await this.discordClient.disconnect();
      }

      // Update monitor state
      BotMonitorService.updateState({
        whatsappConnected: false,
        discordConnected: false
      });

      this.logger.info('Bot stopped successfully');
      console.log('\n✅ Bot stopped successfully\n');
    } catch (error) {
      this.logger.error('Error stopping bot', error as Error);
      throw error;
    }
  }
}

// Export class for use by BotManagerService
export { MultiPlatformBot };

// Note: Bot will NOT start automatically
// Use dashboard or BotManagerService to start/stop bot
