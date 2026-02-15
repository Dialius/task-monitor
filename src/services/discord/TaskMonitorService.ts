/**
 * Task Monitor Service
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 4.3, 9.1, 9.3, 9.4, 9.5, 10.5
 */

import { Client, EmbedBuilder, TextChannel, Message, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { TaskService } from '../TaskService';
import { DiscordConfigManager } from './DiscordConfigManager';
import { TaskStatistics } from '../../types/discord.types';
import { ITask } from '../../models/Task';
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
  ) { }

  /**
   * Initialize service
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Task Monitor Service');

      // Perform initial update (will create embed if not exists)
      await this.updateEmbed();

      // Start auto-update cycle
      this.startAutoUpdate();

      logger.info('Task Monitor Service initialized with auto-update enabled');
      console.log('      ✓ Task Monitor embed initialized');
      console.log('      ✓ Auto-update every 2 hours');
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
      const activeTasks = allTasks.filter((task: ITask) => task.status === 'aktif');
      const activeCount = activeTasks.length;

      // Count completed tasks (status "selesai")
      const completedCount = allTasks.filter((task: ITask) => task.status === 'selesai').length;

      // Count by type (only active tasks)
      const individuCount = activeTasks.filter((task: ITask) => task.tipe === 'individu').length;
      const kelompokCount = activeTasks.filter((task: ITask) => task.tipe === 'kelompok').length;

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
   * Generate embed with task list (paginated)
   * Requirement: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
   */
  async generateEmbedWithTasks(stats: TaskStatistics, page: number = 0, tasksPerPage: number = 5): Promise<{ embed: EmbedBuilder; totalPages: number }> {
    // Get all active tasks
    const activeTasks = await this.taskService.getTasks({ status: 'aktif' });
    
    // Calculate pagination
    const totalPages = Math.max(1, Math.ceil(activeTasks.length / tasksPerPage));
    const startIndex = page * tasksPerPage;
    const endIndex = Math.min(startIndex + tasksPerPage, activeTasks.length);
    const pageTasks = activeTasks.slice(startIndex, endIndex);

    const embed = new EmbedBuilder()
      .setTitle('⋅•⋅☾ **Task Monitor** ☽⋅•⋅')
      .setColor(0x99AAB5); // Discord gray color

    // Set footer with icon and page info
    const footerIcon = this.configManager.getFooterIcon();
    const footerText = activeTasks.length > 0 
      ? `Page ${page + 1}/${totalPages} • Made by VinTheGreat`
      : 'Made by VinTheGreat';
    
    embed.setFooter({ 
      text: footerText,
      iconURL: footerIcon
    });

    // Field 1: Status Tugas
    const onlineEmoji = this.configManager.getEmoji('online');
    const offlineEmoji = this.configManager.getEmoji('offline');

    const statusField = `${onlineEmoji} ┊ ${stats.activeCount} tugas aktif\n${offlineEmoji} ┊ ${stats.completedCount} tugas selesai`;
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

    // Field 3: Task List (if any)
    if (pageTasks.length > 0) {
      let taskList = '';
      pageTasks.forEach((task: ITask, index: number) => {
        const globalIndex = startIndex + index + 1;
        const emoji = this.getTaskEmoji(task.tipe);
        const deadline = new Date(task.deadline).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short'
        });
        taskList += `${globalIndex}. ${emoji} **${task.judul}**\n   📅 ${deadline} • ${task.mata_pelajaran}\n\n`;
      });

      embed.addFields({
        name: '**📋 This Week**',
        value: taskList.trim(),
        inline: false
      });
    }

    // Field 4: Last Updated
    const clockEmoji = this.configManager.getEmoji('clock');
    const timestamp = Math.floor(stats.lastUpdated.getTime() / 1000);
    const lastUpdatedField = `${clockEmoji} **Last Updated:** <t:${timestamp}:R>`;

    embed.addFields({
      name: '\u200B',
      value: lastUpdatedField,
      inline: false
    });

    return { embed, totalPages };
  }

  /**
   * Get task emoji based on type
   */
  private getTaskEmoji(tipe: string): string {
    const emojiMap: Record<string, string> = {
      'individu': '👤',
      'kelompok': '👥',
      'ujian': '📝'
    };
    return emojiMap[tipe] || '📝';
  }

  /**
   * Generate embed (legacy - without task list)
   * Requirement: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
   */
  async generateEmbed(stats: TaskStatistics): Promise<EmbedBuilder> {
    const embed = new EmbedBuilder()
      .setTitle('⋅•⋅☾ **Task Monitor** ☽⋅•⋅')
      .setColor(0x99AAB5); // Discord gray color

    // Set footer with icon
    const footerIcon = this.configManager.getFooterIcon();
    embed.setFooter({ 
      text: 'Made by VinTheGreat',
      iconURL: footerIcon
    });

    // Field 1: Status Tugas
    const onlineEmoji = this.configManager.getEmoji('online');
    const offlineEmoji = this.configManager.getEmoji('offline');

    const statusField = `${onlineEmoji} ┊ ${stats.activeCount} tugas aktif\n${offlineEmoji} ┊ ${stats.completedCount} tugas selesai`;
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

    // Field 3: Last Updated
    const clockEmoji = this.configManager.getEmoji('clock');
    const timestamp = Math.floor(stats.lastUpdated.getTime() / 1000);
    const lastUpdatedField = `${clockEmoji} **Last Updated:** <t:${timestamp}:R>`;

    embed.addFields({
      name: '\u200B',
      value: lastUpdatedField,
      inline: false
    });


    return embed;
  }

  /**
   * Create button action row with pagination
   * Requirement: 3.1, 3.2, 3.3
   */
  createButtons(currentPage: number = 0, totalPages: number = 1): ActionRowBuilder<ButtonBuilder> {
    // Parse animated emoji string <a:name:id> into object for setEmoji()
    const calendarEmojiStr = this.configManager.getEmoji('calendar');
    const emojiMatch = calendarEmojiStr.match(/<a?:(\w+):(\d+)>/);
    const emojiData = emojiMatch
      ? { id: emojiMatch[2], name: emojiMatch[1], animated: calendarEmojiStr.startsWith('<a:') }
      : undefined;

    const buttons: ButtonBuilder[] = [];

    // Add previous button if there are multiple pages
    if (totalPages > 1) {
      const prevButton = new ButtonBuilder()
        .setCustomId('task_monitor_prev')
        .setEmoji('1472405030584848599') // Animated previous emoji (ID only)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 0);
      buttons.push(prevButton);
    }

    // Week button
    const weekButton = new ButtonBuilder()
      .setCustomId('tasks_week')
      .setLabel('Tasks This Week')
      .setStyle(ButtonStyle.Secondary);

    // Tomorrow button
    const tomorrowButton = new ButtonBuilder()
      .setCustomId('tasks_tomorrow')
      .setLabel('Tasks Tomorrow')
      .setStyle(ButtonStyle.Secondary);

    // Set emoji using the proper setEmoji method (renders animated emojis correctly)
    if (emojiData) {
      weekButton.setEmoji(emojiData);
      tomorrowButton.setEmoji(emojiData);
    }

    buttons.push(weekButton, tomorrowButton);

    // Add next button if there are multiple pages
    if (totalPages > 1) {
      const nextButton = new ButtonBuilder()
        .setCustomId('task_monitor_next')
        .setEmoji('1472405032594051104') // Animated next emoji (ID only)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage >= totalPages - 1);
      buttons.push(nextButton);
    }

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(...buttons);

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
   * Update embed with pagination support
   * Requirement: 2.2, 2.3, 2.4, 2.5, 4.3, 10.5
   */
  async updateEmbed(page: number = 0): Promise<void> {
    try {
      logger.info('Updating Task Monitor embed', { page });

      // Calculate statistics
      const stats = await this.calculateStatistics();

      // Generate embed with tasks (paginated)
      const { embed, totalPages } = await this.generateEmbedWithTasks(stats, page);

      // Create buttons with pagination
      const buttons = this.createButtons(page, totalPages);

      // Get channel
      const channelId = this.configManager.getInfoChannelId();
      const channel = await this.client.channels.fetch(channelId) as TextChannel;

      if (!channel || !channel.isTextBased()) {
        throw new Error(`Info channel not accessible: ${channelId}`);
      }

      // Find existing embed
      const existingMessage = await this.findExistingEmbed();

      if (existingMessage) {
        // Edit existing message
        await existingMessage.edit({
          embeds: [embed],
          components: [buttons]
        });

        logger.info('Task Monitor embed updated', {
          messageId: existingMessage.id,
          page,
          totalPages,
          stats
        });

        console.log(`   ✓ Task Monitor embed updated (ID: ${existingMessage.id}, Page: ${page + 1}/${totalPages})`);
      } else {
        // No existing embed found - create new one
        logger.info('No existing Task Monitor embed found, creating new one');

        const newMessage = await channel.send({
          embeds: [embed],
          components: [buttons]
        });

        this.lastMessageId = newMessage.id;

        logger.info('Task Monitor embed created', {
          messageId: newMessage.id,
          page,
          totalPages,
          stats
        });

        console.log(`   ✓ Task Monitor embed created (ID: ${newMessage.id}, Page: ${page + 1}/${totalPages})`);
      }
    } catch (error) {
      logger.error('Failed to update Task Monitor embed', error as Error);
      console.error('   ✗ Failed to update Task Monitor embed:', error);
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
