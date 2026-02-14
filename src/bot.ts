/**
 * Main Bot Entry Point
 * Requirements: 1.1, 14.1, 16.1, 16.2, 16.3
 * Version: 1.0.0 - Production Ready
 * Last Updated: 2026-02-11 - GitHub Actions Test
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
import { DiscordAdapter } from './adapters/DiscordAdapter';
import { WhatsAppAdapter } from './adapters/WhatsAppAdapter';
import { BotMonitorService } from './api/services/bot-monitor.service';
import { ProgressMessage } from './utils/ProgressMessage';

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
  
  // New services for message tracking and editing
  private messageEditService: any; // Will be imported
  private changeDetectionService: any; // Will be imported
  private progressMessage?: ProgressMessage; // For progress messages
  
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
      this.notionService
    );

    this.memberHandler = new MemberCommandHandler(
      this.taskService,
      this.scheduleService,
      this.piketService,
      this.notionService
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
    
    // Initialize ProgressMessage service after platforms are ready
    console.log('   → Initializing progress message service...');
    const whatsappSocket = this.whatsappClient?.getSocket() || undefined;
    const discordClient = this.discordClient?.getClient();
    
    this.progressMessage = new ProgressMessage(whatsappSocket, discordClient);
    
    // Set progress message in handlers
    this.memberHandler.setProgressMessage(this.progressMessage);
    // AdminHandler doesn't have setProgressMessage yet, can be added later
    
    console.log('   → Progress message service initialized');
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

    // Setup activity status rotation
    this.discordClient.setupActivityStatus(this.taskService);

    // Setup Task Monitor feature
    try {
      await this.discordClient.setupTaskMonitor(this.taskService);
    } catch (error) {
      this.logger.error('Failed to setup Task Monitor, continuing without it', error as Error);
      console.log('   ⚠ Task Monitor disabled due to configuration error');
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
        'test_reminder'
      ];
      
      const isEphemeral = adminCommands.includes(command);

      // Defer reply immediately to prevent timeout and set ephemeral state
      await interaction.deferReply({ ephemeral: isEphemeral });

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

      // Check if response has embed data
      if (response.embedData) {
        const { EmbedBuilder } = await import('discord.js');
        const embed = new EmbedBuilder()
          .setTitle(response.embedData.title)
          .setColor(response.embedData.color);

        // Get server name and footer icon
        const guild = interaction.guild;
        const serverName = guild ? guild.name : 'Unknown Server';
        const footerIcon = process.env.DISCORD_FOOTER_ICON || 'https://i.imgur.com/AfFp7pu.png';
        
        embed.setFooter({ 
          text: `Made by VinTheGreat • ${serverName}`,
          iconURL: footerIcon
        });

        // Add description if present
        if (response.embedData.description) {
          embed.setDescription(response.embedData.description);
        }

        // Add fields if present
        if (response.embedData.fields && response.embedData.fields.length > 0) {
          embed.addFields(response.embedData.fields);
        }

        await interaction.editReply({ 
          embeds: [embed]
        });
      } else {
        // Use plain text for other commands
        await interaction.editReply({
          content: response.message
        });
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

      // Check if response has embed data
      if (response.embedData) {
        const { EmbedBuilder } = await import('discord.js');
        const embed = new EmbedBuilder()
          .setTitle(response.embedData.title)
          .setColor(response.embedData.color);

        // Get server name and footer icon
        const guild = message.guild;
        const serverName = guild ? guild.name : 'Unknown Server';
        const footerIcon = process.env.DISCORD_FOOTER_ICON || 'https://i.imgur.com/AfFp7pu.png';
        
        embed.setFooter({ 
          text: `Made by VinTheGreat • ${serverName}`,
          iconURL: footerIcon
        });

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
    
    this.whatsappClient = new BaileysClient({
      authDir: './auth_info',
      printQRInTerminal: true,
      usePairingCode,
      phoneNumber
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

      // Register message handler for commands
      this.whatsappClient.onMessage(async (message) => {
        // Skip messages from bot itself to prevent loops
        if (message.key.fromMe) {
          return;
        }

        // Update message count
        BotMonitorService.updateState({
          messageCount: (BotMonitorService.getState().messageCount || 0) + 1,
          lastActivity: new Date()
        });

        // Extract text from message
        const text = message.message?.conversation || 
                    message.message?.extendedTextMessage?.text ||
                    '';
        
        if (!text) return;

        // Get sender ID (use participant for groups/channels, otherwise remoteJid)
        const senderId = message.key.participant || message.key.remoteJid || '';
        const chatId = message.key.remoteJid || '';

        // Parse command
        const parsed = this.commandParser.parse(text);
        
        // If not a command, check if user has pending confirmation
        if (!parsed) {
          // Check if this is a confirmation response (ya/edit/batal)
          const ConfirmationService = (await import('./services/ConfirmationService')).default;
          
          if (ConfirmationService.hasPendingConfirmation(senderId)) {
            // Treat as confirmation response to add_tugas_cepat
            console.log(`📨 WhatsApp confirmation response: "${text}" from ${senderId}`);
            
            // Update command count
            BotMonitorService.updateState({
              commandCount: (BotMonitorService.getState().commandCount || 0) + 1
            });
            
            const response = await this.commandRouter.route(
              {
                command: 'add_tugas_cepat',
                args: [text],
                rawMessage: text
              },
              senderId,
              'whatsapp'
            );

            // Send response
            if (this.whatsappAdapter) {
              await this.whatsappAdapter.sendMessage(
                chatId,
                response.message
              );
            }
          }
          return;
        }

        console.log(`📨 WhatsApp command: /${parsed.command} from ${senderId}`);

        // Update command count
        BotMonitorService.updateState({
          commandCount: (BotMonitorService.getState().commandCount || 0) + 1
        });

        // Route command
        const response = await this.commandRouter.route(
          parsed,
          senderId,
          'whatsapp'
        );

        // Send response
        if (this.whatsappAdapter) {
          await this.whatsappAdapter.sendMessage(
            chatId,
            response.message
          );
        }
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
      },
      this.notionService
    );

    this.reminderScheduler.initialize();

    console.log('   → Daily recap (Mon-Thu): 16:00 - Tugas besok');
    console.log('   → Weekly recap (Fri): 16:00 - Tugas minggu depan');
    console.log('   → Monday recap (Sun): 16:00 - Tugas hari Senin');
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
