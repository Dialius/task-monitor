/**
 * Task Monitor Service
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 4.3, 9.1, 9.3, 9.4, 9.5, 10.5
 */

import { Client, EmbedBuilder, TextChannel, Message, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { TaskService } from '../TaskService';
import { DiscordConfigManager } from './DiscordConfigManager';
import { TaskStatistics } from '../../types/discord.types';
import { getLogger } from '../../utils/Logger';

const logger = getLogger();

/**
 * Task Monitor Service
 * Manages the task monitor embed lifecycle
 */
export class TaskMonitorService {
  private updateInterval?: NodeJS.Timeout;
  private lastMessageId?: string;
  private readonly UPDATE_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

  constructor(
    private client: Client,
    private taskService: TaskService,
    private configManager: DiscordConfigManager
  ) {}

  /**
   * Initialize service
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Task Monitor Service');

      // Perform initial update
      await this.updateEmbed();

      logger.info('Task Monitor Service initialized');
    } catch (error) {
      logger.error('Failed to initialize Task Monitor Service', error as Error);
      throw error;
    }
  }

  /**
   * Calculate task statistics
   * Requirement: 1.2, 1.3, 1.4, 1.8, 1.9, 9.1, 9.3, 9.4, 9.5
   */
  async calculateStatistics(): Promise<TaskStatistics> {
    try {
      // Get all tasks
      const allTasks = await this.taskService.getAllTasks();

      // Count active tasks (status "aktif")
      const activeTasks = allTasks.filter(task => task.status === 'aktif');
      const activeCount = activeTasks.length;

      // Count completed tasks (status "selesai")
      const completedCount = allTasks.filter(task => task.status === 'selesai').length;

      // Count by type (only active tasks)
      const individuCount = activeTasks.filter(task => task.tipe === 'individu').length;
      const kelompokCount = activeTasks.filter(task => task.tipe === 'kelompok').length;

      return {
        activeCount,
        completedCount,
        individuCount,
        kelompokCount,
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Failed to calculate statistics', error as Error);
      throw error;
    }
  }

  /**
   * Generate embed
   * Requirement: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
   */
  async generateEmbed(stats: TaskStatistics, serverName: string): Promise<EmbedBuilder> {
    const embed = new EmbedBuilder()
      .setTitle('⋅•⋅☾ **Task Monitor** ☽⋅•⋅')
      .setColor(this.configManager.getEmbedColor() as any)
      .setTimestamp();

    // Field 1: Status Tugas
    const onlineEmoji = this.configManager.getEmoji('online');
    const offlineEmoji = this.configManager.getEmoji('offline');
    
    const statusField = `${stats.activeCount} ┊ ${onlineEmoji} tugas aktif\n${stats.completedCount} ┊ ${offlineEmoji} tugas selesai`;
    embed.addFields({
      name: '**Status Tugas**',
      value: statusField,
      inline: false
    });

    // Field 2: Tipe Tugas
    const typeField = `\`\`\`${stats.individuCount} Individu | ${stats.kelompokCount} Kelompok\`\`\``;
    embed.addFields({
      name: '**Tipe Tugas**',
      value: typeField,
      inline: false
    });

    // Add spacing (empty field)
    embed.addFields({
      name: '\u200B',
      value: '\u200B',
      inline: false
    });

    // Field 3: Last Updated
    const clockEmoji = this.configManager.getEmoji('clock');
    const timestamp = Math.floor(stats.lastUpdated.getTime() / 1000);
    const lastUpdatedField = `${clockEmoji} **Last Updated:** <t:${timestamp}:R>`;
    
    embed.addFields({
      name: '\u200B',
      value: lastUpdatedField,
      inline: false
    });

    // Footer
    embed.setFooter({
      text: this.configManager.getFooterText(serverName),
      iconURL: this.configManager.getFooterIcon()
    });

    return embed;
  }

  /**
   * Create button action row
   * Requirement: 3.1, 3.2, 3.3
   */
  createButtons(): ActionRowBuilder<ButtonBuilder> {
    const calendarEmoji = this.configManager.getEmoji('calendar');

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('tasks_week')
          .setLabel(`${calendarEmoji} This Week`)
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('tasks_tomorrow')
          .setLabel(`${calendarEmoji} Tomorrow`)
          .setStyle(ButtonStyle.Primary)
      );

    return row;
  }

  /**
   * Find existing embed in channel
   * Requirement: 2.2
   */
  async findExistingEmbed(): Promise<Message | null> {
    try {
      const channelId = this.configManager.getInfoChannelId();
      const channel = await this.client.channels.fetch(channelId) as TextChannel;

      if (!channel || !channel.isTextBased()) {
        logger.error('Info channel not found or not text-based', new Error('Invalid channel'), {
          channelId
        });
        return null;
      }

      // If we have cached message ID, try to fetch it directly
      if (this.lastMessageId) {
        try {
          const message = await channel.messages.fetch(this.lastMessageId);
          if (message && message.embeds.length > 0) {
            const embed = message.embeds[0];
            if (embed.title?.includes('Task Monitor')) {
              return message;
            }
          }
        } catch (error) {
          // Message not found, clear cache
          this.lastMessageId = undefined;
        }
      }

      // Search last 50 messages
      const messages = await channel.messages.fetch({ limit: 50 });

      for (const message of messages.values()) {
        if (message.embeds.length > 0) {
          const embed = message.embeds[0];
          if (embed.title?.includes('Task Monitor')) {
            this.lastMessageId = message.id;
            return message;
          }
        }
      }

      return null;
    } catch (error) {
      logger.error('Failed to find existing embed', error as Error);
      return null;
    }
  }

  /**
   * Update embed
   * Requirement: 2.2, 2.3, 2.4, 2.5, 4.3, 10.5
   */
  async updateEmbed(): Promise<void> {
    try {
      logger.info('Updating Task Monitor embed');

      // Calculate statistics
      const stats = await this.calculateStatistics();

      // Get server name
      const guild = this.client.guilds.cache.first();
      const serverName = guild?.name || 'Discord Server';

      // Generate embed
      const embed = await this.generateEmbed(stats, serverName);

      // Create buttons
      const buttons = this.createButtons();

      // Find existing embed
      const existingMessage = await this.findExistingEmbed();

      const channelId = this.configManager.getInfoChannelId();
      const channel = await this.client.channels.fetch(channelId) as TextChannel;

      if (!channel || !channel.isTextBased()) {
        throw new Error(`Info channel not accessible: ${channelId}`);
      }

      if (existingMessage) {
        // Edit existing message
        await existingMessage.edit({
          embeds: [embed],
          components: [buttons]
        });

        logger.info('Task Monitor embed updated', {
          messageId: existingMessage.id,
          stats
        });
      } else {
        // Create new message
        const newMessage = await channel.send({
          embeds: [embed],
          components: [buttons]
        });

        this.lastMessageId = newMessage.id;

        logger.info('Task Monitor embed created', {
          messageId: newMessage.id,
          stats
        });
      }
    } catch (error) {
      logger.error('Failed to update Task Monitor embed', error as Error);
      // Don't throw - will retry on next cycle
    }
  }

  /**
   * Start auto-update
   * Requirement: 2.1
   */
  startAutoUpdate(): void {
    if (this.updateInterval) {
      logger.warn('Auto-update already started');
      return;
    }

    this.updateInterval = setInterval(() => {
      this.updateEmbed();
    }, this.UPDATE_INTERVAL);

    logger.info('Task Monitor auto-update started', {
      interval: this.UPDATE_INTERVAL / 1000 / 60 / 60,
      unit: 'hours'
    });
  }

  /**
   * Stop auto-update
   */
  stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
      logger.info('Task Monitor auto-update stopped');
    }
  }
}
