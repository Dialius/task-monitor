/**
 * Main Bot Entry Point
 * Requirements: 1.1, 14.1, 16.1, 16.2, 16.3
 */

import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { initializeLogger, getLogger } from './utils/Logger';
import { CommandParser } from './utils/CommandParser';
import { CommandRouter } from './utils/CommandRouter';
import { PermissionService } from './services/PermissionService';
import { TaskService } from './services/TaskService';
import { ScheduleService } from './services/ScheduleService';
import { PiketService } from './services/PiketService';
import { AnnouncementService } from './services/AnnouncementService';
import { AIService } from './services/AIService';
import { ReminderScheduler } from './services/ReminderScheduler';
import { AdminCommandHandler } from './handlers/AdminCommandHandler';
import { MemberCommandHandler } from './handlers/MemberCommandHandler';
import { DiscordClient } from './clients/DiscordClient';
import { BaileysClient } from './clients/BaileysClient';
import { DiscordAdapter } from './adapters/DiscordAdapter';
import { WhatsAppAdapter } from './adapters/WhatsAppAdapter';

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
      this.logger.info('Initializing Multi-Platform Bot...');

      // Initialize logger
      initializeLogger({
        logDir: process.env.LOG_DIR || './logs',
        logLevel: (process.env.LOG_LEVEL as any) || 'info',
        rotationInterval: 'daily'
      });

      // Connect to database
      await connectDatabase();

      // Initialize services
      await this.initializeServices();

      // Initialize command system
      await this.initializeCommandSystem();

      // Initialize platforms
      await this.initializePlatforms();

      // Initialize reminder scheduler
      await this.initializeScheduler();

      this.logger.info('Bot initialized successfully');
    } catch (error) {
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

    this.logger.info('Services initialized');
  }

  /**
   * Initialize command system
   */
  private async initializeCommandSystem(): Promise<void> {
    this.logger.info('Initializing command system...');

    // Initialize handlers
    this.adminHandler = new AdminCommandHandler(
      this.taskService,
      this.scheduleService,
      this.piketService,
      this.announcementService,
      this.aiService
    );

    this.memberHandler = new MemberCommandHandler(
      this.taskService,
      this.scheduleService,
      this.piketService
    );

    // Initialize router
    this.commandRouter = new CommandRouter(this.permissionService);

    // Register admin commands
    this.commandRouter.registerHandler('add_tugas', this.adminHandler.handleAddTugas.bind(this.adminHandler));
    this.commandRouter.registerHandler('edit_tugas', this.adminHandler.handleEditTugas.bind(this.adminHandler));
    this.commandRouter.registerHandler('hapus_tugas', this.adminHandler.handleHapusTugas.bind(this.adminHandler));
    this.commandRouter.registerHandler('tandai_selesai', this.adminHandler.handleTandaiSelesai.bind(this.adminHandler));
    this.commandRouter.registerHandler('add_jadwal', this.adminHandler.handleAddJadwal.bind(this.adminHandler));
    this.commandRouter.registerHandler('set_piket', this.adminHandler.handleSetPiket.bind(this.adminHandler));
    this.commandRouter.registerHandler('add_pengumuman', this.adminHandler.handleAddPengumuman.bind(this.adminHandler));

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
    this.commandRouter.registerHandler('help', this.memberHandler.handleHelp.bind(this.memberHandler));
    this.commandRouter.registerHandler('bantuan', this.memberHandler.handleHelp.bind(this.memberHandler));
    this.commandRouter.registerHandler('status', this.memberHandler.handleStatus.bind(this.memberHandler));

    this.logger.info('Command system initialized');
  }

  /**
   * Initialize platforms (Discord & WhatsApp)
   */
  private async initializePlatforms(): Promise<void> {
    this.logger.info('Initializing platforms...');

    // Initialize Discord if enabled
    if (process.env.DISCORD_ENABLED === 'true' && process.env.DISCORD_BOT_TOKEN) {
      await this.initializeDiscord();
    }

    // Initialize WhatsApp if enabled
    if (process.env.WHATSAPP_ENABLED === 'true') {
      await this.initializeWhatsApp();
    }

    this.logger.info('Platforms initialized');
  }

  /**
   * Initialize Discord
   */
  private async initializeDiscord(): Promise<void> {
    this.logger.info('Initializing Discord...');

    this.discordClient = new DiscordClient({
      token: process.env.DISCORD_BOT_TOKEN!,
      clientId: process.env.DISCORD_CLIENT_ID!,
      guildId: process.env.DISCORD_GUILD_ID!,
      channelId: process.env.DISCORD_CHANNEL_ID!
    });

    await this.discordClient.connect();

    this.discordAdapter = new DiscordAdapter(this.discordClient.getClient());

    // Handle text commands
    this.discordClient.onTextCommand(async (message) => {
      const parsed = this.commandParser.parse(message.content);
      if (!parsed) return;

      const response = await this.commandRouter.route(
        parsed,
        message.author.id,
        'discord'
      );

      await message.reply(response.message);
    });

    this.logger.info('Discord initialized');
  }

  /**
   * Initialize WhatsApp
   */
  private async initializeWhatsApp(): Promise<void> {
    this.logger.info('Initializing WhatsApp...');

    this.whatsappClient = new BaileysClient({
      authDir: './auth_info',
      printQRInTerminal: true
    });

    await this.whatsappClient.connect();

    const socket = this.whatsappClient.getSocket();
    if (socket) {
      this.whatsappAdapter = new WhatsAppAdapter(socket);

      // Handle messages
      this.whatsappClient.onMessage(async (message) => {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        if (!text) return;

        const parsed = this.commandParser.parse(text);
        if (!parsed) return;

        const userId = message.key.remoteJid?.split('@')[0] || '';
        const response = await this.commandRouter.route(
          parsed,
          userId,
          'whatsapp'
        );

        const groupId = process.env.WHATSAPP_GROUP_ID || message.key.remoteJid!;
        if (this.whatsappAdapter) {
          await this.whatsappAdapter.sendMessage(groupId, response.message);
        }
      });
    }

    this.logger.info('WhatsApp initialized');
  }

  /**
   * Initialize reminder scheduler
   */
  private async initializeScheduler(): Promise<void> {
    this.logger.info('Initializing reminder scheduler...');

    // Use WhatsApp adapter if available, otherwise Discord
    const adapter = this.whatsappAdapter || this.discordAdapter;
    if (!adapter) {
      this.logger.warn('No platform adapter available for scheduler');
      return;
    }

    const groupId = process.env.WHATSAPP_GROUP_ID || process.env.DISCORD_CHANNEL_ID || '';

    this.reminderScheduler = new ReminderScheduler(
      this.taskService,
      this.scheduleService,
      this.piketService,
      this.announcementService,
      this.aiService,
      adapter,
      {
        groupId,
        dailyReminderTime: process.env.DAILY_REMINDER_TIME || '17:00',
        weeklyReminderDay: parseInt(process.env.WEEKLY_REMINDER_DAY || '5'),
        weeklyReminderTime: process.env.WEEKLY_REMINDER_TIME || '20:00',
        timezone: process.env.TIMEZONE || 'Asia/Jakarta'
      }
    );

    this.reminderScheduler.initialize();

    this.logger.info('Reminder scheduler initialized');
  }

  /**
   * Start bot
   */
  async start(): Promise<void> {
    await this.initialize();
    this.logger.info('🤖 Multi-Platform Bot is running!');
  }

  /**
   * Stop bot
   */
  async stop(): Promise<void> {
    this.logger.info('Stopping bot...');

    if (this.reminderScheduler) {
      this.reminderScheduler.stop();
    }

    if (this.discordClient) {
      await this.discordClient.disconnect();
    }

    if (this.whatsappClient) {
      await this.whatsappClient.disconnect();
    }

    this.logger.info('Bot stopped');
  }
}

// Create and start bot
const bot = new MultiPlatformBot();
const logger = getLogger();

// Global error handlers (Requirement 17.1: 12.7)
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception - Bot will continue operation', error);
  console.error('❌ Uncaught Exception:', error);
  // Log but don't exit - bot should continue operation
});

process.on('unhandledRejection', (reason: any) => {
  const errorMessage = reason instanceof Error ? reason.message : String(reason);
  const errorStack = reason instanceof Error ? reason.stack : undefined;
  
  logger.error('Unhandled Promise Rejection - Bot will continue operation', 
    new Error(`Unhandled Rejection: ${errorMessage}`)
  );
  
  console.error('❌ Unhandled Rejection:', reason);
  if (errorStack) {
    console.error('Stack:', errorStack);
  }
  // Log but don't exit - bot should continue operation
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  await bot.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  await bot.stop();
  process.exit(0);
});

// Start bot
bot.start().catch((error) => {
  console.error('Failed to start bot:', error);
  process.exit(1);
});

export default bot;
