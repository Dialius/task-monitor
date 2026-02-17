/**
 * Discord Client Wrapper
 * Requirements: 17.1, 17.2, 17.3, 17.4, 17.9, 17.10
 */

import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  Interaction,
  Message,
  TextChannel
} from 'discord.js';
import { getLogger } from '../utils/Logger';
import { ActivityStatusService, ActivityConfig } from '../services/ActivityStatusService';
import { TaskService } from '../services/TaskService';
import { ScheduleService } from '../services/ScheduleService';
import { AnnouncementService } from '../services/AnnouncementService';
import { DiscordConfigManager } from '../services/discord/DiscordConfigManager';
import { RateLimiter } from '../services/discord/RateLimiter';
import { TaskMonitorService } from '../services/discord/TaskMonitorService';
import { ButtonInteractionHandler } from '../services/discord/ButtonInteractionHandler';
import { NotionService } from '../services/NotionService';
import { AIService } from '../services/AIService';
import { PiketService } from '../services/PiketService';

const logger = getLogger();

export interface DiscordConfig {
  token: string;
  clientId: string;
  guildId: string;
  channelId: string;
  activityEnabled?: boolean;
  activityInterval?: number;
}

export interface SlashCommand {
  name: string;
  description: string;
  options?: any[];
}

/**
 * Discord Client wrapper for bot operations
 */
export class DiscordClient {
  private client: Client;
  private config: DiscordConfig;
  private isConnected: boolean = false;
  private activityStatusService?: ActivityStatusService;
  private discordConfigManager?: DiscordConfigManager;
  private rateLimiter?: RateLimiter;
  private taskMonitorService?: TaskMonitorService;
  private buttonInteractionHandler?: ButtonInteractionHandler;

  constructor(config: DiscordConfig) {
    this.config = config;

    // Initialize Discord client with required intents
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
      ]
    });

    this.setupEventHandlers();
  }

  /**
   * Setup Discord event handlers
   * Requirement: 17.2
   */
  private setupEventHandlers(): void {
    this.client.on('clientReady', () => {
      logger.info('Discord client connected', {
        username: this.client.user?.tag,
        guildId: this.config.guildId
      });
      this.isConnected = true;

      // Start activity status rotation if enabled
      if (this.activityStatusService) {
        this.activityStatusService.start();
      }
    });

    this.client.on('error', (error) => {
      logger.error('Discord client error', error);
    });

    this.client.on('disconnect', () => {
      logger.warn('Discord client disconnected');
      this.isConnected = false;

      // Stop activity status rotation
      if (this.activityStatusService) {
        this.activityStatusService.stop();
      }
    });
  }

  /**
   * Connect to Discord
   * Requirement: 17.1
   */
  async connect(): Promise<void> {
    try {
      await this.client.login(this.config.token);
      logger.info('Discord bot logged in successfully');
    } catch (error) {
      logger.error('Failed to connect to Discord', error as Error);
      throw error;
    }
  }

  /**
   * Disconnect from Discord
   */
  async disconnect(): Promise<void> {
    // Stop activity status rotation
    if (this.activityStatusService) {
      this.activityStatusService.stop();
    }

    // Stop Task Monitor
    this.stopTaskMonitor();

    this.client.destroy();
    this.isConnected = false;
    logger.info('Discord client disconnected');
  }

  /**
   * Check if client is connected
   */
  isReady(): boolean {
    return this.isConnected && this.client.isReady();
  }

  /**
   * Get the underlying Discord.js client
   */
  getClient(): Client {
    return this.client;
  }

  /**
   * Send a simple text message
   */
  async sendMessage(channelId: string, content: string): Promise<void> {
    const channel = await this.client.channels.fetch(channelId);
    if (channel && channel.isTextBased()) {
      await (channel as TextChannel).send(content);
    }
  }

  /**
   * Send an embed message
   */
  async sendEmbed(channelId: string, embed: EmbedBuilder): Promise<void> {
    const channel = await this.client.channels.fetch(channelId);
    if (channel && channel.isTextBased()) {
      await (channel as TextChannel).send({ embeds: [embed] });
    }
  }

  /**
   * Send message with components (buttons, select menus)
   */
  async sendMessageWithComponents(
    channelId: string,
    content: string,
    components: ActionRowBuilder<ButtonBuilder>[]
  ): Promise<void> {
    const channel = await this.client.channels.fetch(channelId);
    if (channel && channel.isTextBased()) {
      await (channel as TextChannel).send({
        content,
        components
      });
    }
  }

  /**
   * Register slash commands with Discord API
   * Requirement: 17.5
   */
  async registerSlashCommands(): Promise<void> {
    try {
      const { getSlashCommands } = await import('../config/slashCommands');
      const commands = getSlashCommands();

      const rest = new REST({ version: '10' }).setToken(this.config.token);

      const slashCommands = commands.map(cmd => cmd.data.toJSON());

      logger.info('Registering Discord slash commands', {
        count: slashCommands.length
      });

      console.log(`   → Registering ${slashCommands.length} slash commands...`);

      await rest.put(
        Routes.applicationGuildCommands(this.config.clientId, this.config.guildId),
        { body: slashCommands }
      );

      logger.info('Slash commands registered successfully');
      console.log(`   ✓ ${slashCommands.length} slash commands registered`);
    } catch (error) {
      logger.error('Failed to register slash commands', error as Error);
      throw error;
    }
  }


  /**
   * Handle slash command interaction
   * Requirement: 17.4
   */
  onSlashCommand(
    handler: (interaction: Interaction) => Promise<void>
  ): void {
    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      try {
        await handler(interaction);
      } catch (error) {
        logger.error('Error handling slash command', error as Error, {
          commandName: interaction.commandName,
          userId: interaction.user.id
        });
      }
    });
  }

  /**
   * Handle text command (messages starting with /)
   * Requirement: 17.4
   */
  onTextCommand(
    handler: (message: Message) => Promise<void>
  ): void {
    this.client.on('messageCreate', async (message) => {
      // Ignore bot messages
      if (message.author.bot) return;

      // Only process messages starting with /
      if (!message.content.startsWith('/')) return;

      try {
        await handler(message);
      } catch (error) {
        logger.error('Error handling text command', error as Error, {
          content: message.content,
          userId: message.author.id
        });
      }
    });
  }

  /**
   * Handle button interactions
   */
  onButtonInteraction(
    handler: (interaction: Interaction) => Promise<void>
  ): void {
    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isButton()) return;

      try {
        await handler(interaction);
      } catch (error) {
        logger.error('Error handling button interaction', error as Error, {
          customId: interaction.customId,
          userId: interaction.user.id
        });
      }
    });
  }

  /**
   * Get guild information
   */
  async getGuildInfo(): Promise<any> {
    try {
      const guild = await this.client.guilds.fetch(this.config.guildId);
      return {
        id: guild.id,
        name: guild.name,
        memberCount: guild.memberCount
      };
    } catch (error) {
      logger.error('Failed to fetch guild info', error as Error);
      return null;
    }
  }

  /**
   * Setup activity status rotation
   * Call this after client is ready and TaskService is available
   */
  setupActivityStatus(taskService: TaskService): void {
    // Initialize Discord Config Manager to get activity configuration
    const configManager = new DiscordConfigManager();

    // Get bot status from environment variable
    const botStatus = (process.env.DISCORD_BOT_STATUS || 'online') as 'online' | 'idle' | 'dnd' | 'invisible';

    // Validate status
    const validStatuses = ['online', 'idle', 'dnd', 'invisible'];
    const status = validStatuses.includes(botStatus) ? botStatus : 'online';

    const activityConfig: ActivityConfig = {
      enabled: configManager.isActivityEnabled(),
      rotationInterval: configManager.getActivityInterval() / (60 * 1000), // Convert ms to minutes
      activities: configManager.getActivityTemplates(),
      status: status
    };

    this.activityStatusService = new ActivityStatusService(
      this.client,
      taskService,
      activityConfig
    );

    // Start immediately if client is already ready
    if (this.isConnected) {
      this.activityStatusService.start();
    }

    logger.info('Activity status service initialized', {
      enabled: activityConfig.enabled,
      interval: activityConfig.rotationInterval,
      templatesCount: activityConfig.activities.length,
      status: status
    });

    console.log(`   → Bot Status: ${status}`);
  }

  /**
   * Setup Task Monitor feature
   * Requirements: 4.6, 7.8, 7.9, 11.1, 11.2, 11.3
   */
  async setupTaskMonitor(
    taskService: TaskService,
    scheduleService: ScheduleService,
    announcementService: AnnouncementService,
    notionService: NotionService,
    aiService: AIService,
    piketService: PiketService
  ): Promise<void> {
    try {
      logger.info('Setting up Task Monitor feature');

      // Initialize Discord Config Manager
      this.discordConfigManager = new DiscordConfigManager();

      // Validate configuration
      const validation = this.discordConfigManager.validateConfig();
      if (!validation.valid) {
        logger.error('Discord configuration validation failed', new Error(validation.errors.join(', ')));
        console.error('❌ Discord Task Monitor configuration validation failed:');
        validation.errors.forEach(error => console.error(`   - ${error}`));
        throw new Error('Discord configuration validation failed');
      }

      logger.info('Discord configuration validated successfully');

      // Initialize Rate Limiter
      this.rateLimiter = new RateLimiter(
        this.discordConfigManager.getGeneralRateLimit(),
        this.discordConfigManager.getCommandRateLimit()
      );

      logger.info('Rate limiter initialized', {
        generalCooldown: this.discordConfigManager.getGeneralRateLimit(),
        commandCooldown: this.discordConfigManager.getCommandRateLimit()
      });

      // Initialize Task Monitor Service
      this.taskMonitorService = new TaskMonitorService(
        this.client,
        taskService,
        this.discordConfigManager
      );

      // Initialize Button Interaction Handler
      this.buttonInteractionHandler = new ButtonInteractionHandler(
        taskService,
        scheduleService,
        announcementService,
        notionService,
        aiService,
        piketService,
        this.discordConfigManager,
        this.rateLimiter
      );

      // Register button interaction listener
      this.client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;

        try {
          await this.buttonInteractionHandler!.handleButtonClick(interaction);
        } catch (error) {
          logger.error('Error handling button interaction', error as Error, {
            customId: interaction.customId,
            userId: interaction.user.id
          });
        }
      });

      logger.info('Button interaction handler registered');

      // Initialize Task Monitor (will create/update embed and start auto-update)
      await this.taskMonitorService.initialize();

      logger.info('Task Monitor feature initialized successfully');
      console.log('✅ Discord Task Monitor feature enabled');
      console.log(`   → Info Channel: ${this.discordConfigManager.getInfoChannelId()}`);
      console.log(`   → Command Channel: ${this.discordConfigManager.getCommandChannelId()}`);
    } catch (error) {
      logger.error('Failed to setup Task Monitor feature', error as Error);
      console.error('❌ Failed to setup Discord Task Monitor:', error);
      throw error;
    }
  }

  /**
   * Stop Task Monitor feature
   */
  stopTaskMonitor(): void {
    if (this.taskMonitorService) {
      this.taskMonitorService.stopAutoUpdate();
      logger.info('Task Monitor stopped');
    }

    if (this.rateLimiter) {
      this.rateLimiter.stop();
      logger.info('Rate limiter stopped');
    }
  }

  /**
   * Get activity status service
   */
  getActivityStatusService(): ActivityStatusService | undefined {
    return this.activityStatusService;
  }
}
