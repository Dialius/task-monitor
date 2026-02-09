/**
 * Main Bot Entry Point
 * Requirements: 1.1, 14.1, 16.1, 16.2, 16.3
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
      console.log('\n╔════════════════════════════════════════════════════════╗');
      console.log('║   🤖 MULTI-PLATFORM CLASS REMINDER BOT               ║');
      console.log('╚════════════════════════════════════════════════════════╝\n');
      
      console.log('📋 Step 1/7: Initializing logger...');
      // Initialize logger
      const config = getConfigManager();
      initializeLogger({
        logDir: config.get('logDir'),
        logLevel: config.get('logLevel') as any,
        rotationInterval: 'daily'
      });
      console.log('✅ Logger initialized\n');

      console.log('📋 Step 2/7: Connecting to database...');
      // Connect to database
      await connectDatabase();
      console.log('✅ Database connected\n');

      console.log('📋 Step 3/7: Loading configuration...');
      // Initialize configuration from database
      await initializeConfig();
      console.log('✅ Configuration loaded\n');

      console.log('📋 Step 4/7: Initializing services...');
      // Initialize services
      await this.initializeServices();
      console.log('✅ Services initialized\n');

      console.log('📋 Step 5/7: Setting up command system...');
      // Initialize command system
      await this.initializeCommandSystem();
      console.log('✅ Command system ready\n');

      console.log('📋 Step 6/7: Connecting to platforms...');
      // Initialize platforms
      await this.initializePlatforms();
      console.log('✅ Platforms connected\n');

      console.log('📋 Step 7/7: Starting reminder scheduler...');
      // Initialize reminder scheduler
      await this.initializeScheduler();
      console.log('✅ Scheduler started\n');

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

    this.logger.info('Services initialized');
  }

  /**
   * Initialize command system
   */
  private async initializeCommandSystem(): Promise<void> {
    console.log('   → Setting up command parser...');

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

    console.log('   → Registering admin commands...');
    // Register admin commands
    this.commandRouter.registerHandler('add_tugas', this.adminHandler.handleAddTugas.bind(this.adminHandler));
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
    this.commandRouter.registerHandler('help', this.memberHandler.handleHelp.bind(this.memberHandler));
    this.commandRouter.registerHandler('bantuan', this.memberHandler.handleHelp.bind(this.memberHandler));
    this.commandRouter.registerHandler('status', this.memberHandler.handleStatus.bind(this.memberHandler));

    console.log('   → Registered 26 commands total');
    console.log('      • Admin commands: 14');
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

      console.log(`📨 Discord command: /${parsed.command} from ${message.author.tag}`);

      const response = await this.commandRouter.route(
        parsed,
        message.author.id,
        'discord'
      );

      await message.reply(response.message);
    });

    console.log('      ✓ Discord bot online');
    console.log(`      ✓ Server: ${process.env.DISCORD_GUILD_ID}`);
    console.log(`      ✓ Channel: ${process.env.DISCORD_CHANNEL_ID}`);
  }

  /**
   * Initialize WhatsApp
   */
  private async initializeWhatsApp(): Promise<void> {
    console.log('      → Initializing Baileys client...');
    
    this.whatsappClient = new BaileysClient({
      authDir: './auth_info',
      printQRInTerminal: true
    });

    console.log('      → Connecting to WhatsApp...');
    console.log('      → Scan QR code with your phone if this is first time\n');
    
    await this.whatsappClient.connect();

    const socket = this.whatsappClient.getSocket();
    if (socket) {
      this.whatsappAdapter = new WhatsAppAdapter(socket);

      // Handle messages
      this.whatsappClient.onMessage(async (message) => {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        if (!text) return;

        // Only process commands (starting with /)
        if (!text.startsWith('/')) return;

        const parsed = this.commandParser.parse(text);
        if (!parsed) return;

        const userId = message.key.remoteJid?.split('@')[0] || '';
        const groupId = message.key.remoteJid || '';
        
        console.log(`📨 WhatsApp command: /${parsed.command} from ${userId} in ${groupId}`);

        const response = await this.commandRouter.route(
          parsed,
          userId,
          'whatsapp'
        );

        const targetGroupId = process.env.WHATSAPP_GROUP_ID || groupId;
        if (this.whatsappAdapter) {
          await this.whatsappAdapter.sendMessage(targetGroupId, response.message);
        }
      });
      
      console.log('      ✓ WhatsApp connected');
      if (process.env.WHATSAPP_GROUP_ID) {
        console.log(`      ✓ Target group: ${process.env.WHATSAPP_GROUP_ID}`);
      } else {
        console.log('      ⚠ WHATSAPP_GROUP_ID not set - will reply to any group');
      }
    } else {
      throw new Error('Failed to get WhatsApp socket');
    }
  }

  /**
   * Initialize reminder scheduler
   */
  private async initializeScheduler(): Promise<void> {
    // Use WhatsApp adapter if available, otherwise Discord
    const adapter = this.whatsappAdapter || this.discordAdapter;
    if (!adapter) {
      console.log('   ⚠ No platform adapter available - scheduler disabled');
      return;
    }

    const groupId = process.env.WHATSAPP_GROUP_ID || process.env.DISCORD_CHANNEL_ID || '';
    
    if (!groupId) {
      console.log('   ⚠ No group/channel ID configured - scheduler disabled');
      return;
    }

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

    console.log('   → Daily recap: ' + (process.env.DAILY_REMINDER_TIME || '17:00'));
    console.log('   → Weekly recap: Friday ' + (process.env.WEEKLY_REMINDER_TIME || '20:00'));
    console.log('   → Timezone: ' + (process.env.TIMEZONE || 'Asia/Jakarta'));
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
