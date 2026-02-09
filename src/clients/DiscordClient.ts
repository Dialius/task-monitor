/**
 * Discord Client Wrapper
 * Requirements: 17.1, 17.2, 17.3, 17.4, 17.9, 17.10
 */

import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
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
import { getActivityTemplates } from '../config/activityTemplates';

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
    this.client.on('ready', () => {
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
  async registerSlashCommands(commands: SlashCommand[]): Promise<void> {
    try {
      const rest = new REST({ version: '10' }).setToken(this.config.token);

      const slashCommands = commands.map(cmd => {
        const builder = new SlashCommandBuilder()
          .setName(cmd.name)
          .setDescription(cmd.description);

        // Add options if provided
        if (cmd.options) {
          cmd.options.forEach(opt => {
            if (opt.type === 'string') {
              builder.addStringOption(option =>
                option
                  .setName(opt.name)
                  .setDescription(opt.description)
                  .setRequired(opt.required || false)
              );
            }
          });
        }

        return builder.toJSON();
      });

      logger.info('Registering Discord slash commands', {
        count: slashCommands.length
      });

      await rest.put(
        Routes.applicationGuildCommands(this.config.clientId, this.config.guildId),
        { body: slashCommands }
      );

      logger.info('Discord slash commands registered successfully');
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
    const activityConfig: ActivityConfig = {
      enabled: this.config.activityEnabled ?? true,
      rotationInterval: this.config.activityInterval ?? 5,
      activities: getActivityTemplates()
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
      interval: activityConfig.rotationInterval
    });
  }

  /**
   * Get activity status service
   */
  getActivityStatusService(): ActivityStatusService | undefined {
    return this.activityStatusService;
  }
}
