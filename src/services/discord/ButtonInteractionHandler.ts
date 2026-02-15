/**
 * Button Interaction Handler
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 5.1, 5.2, 5.3, 6.1, 6.2, 9.1
 */

import { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { TaskService } from '../TaskService';
import { DiscordConfigManager } from './DiscordConfigManager';
import { RateLimiter } from './RateLimiter';
import { LoadingMessageManager } from './LoadingMessageManager';
import { ITask } from '../../models/Task';
import { getLogger } from '../../utils/Logger';
import { format } from 'date-fns';

const logger = getLogger();

/**
 * Button Interaction Handler
 * Handles button click interactions for task queries
 */
export class ButtonInteractionHandler {
  private loadingManager: LoadingMessageManager;

  constructor(
    private taskService: TaskService,
    private configManager: DiscordConfigManager,
    private rateLimiter: RateLimiter
  ) {
    this.loadingManager = new LoadingMessageManager(configManager);
  }

  /**
   * Handle button click
   * Requirement: 3.4, 5.1, 5.2, 5.3, 6.1, 6.2
   */
  async handleButtonClick(interaction: ButtonInteraction): Promise<void> {
    try {
      const userId = interaction.user.id;
      const buttonId = interaction.customId;

      // Ignore pagination buttons handled by PaginationHelper (cmd_page_*)
      if (buttonId.startsWith('cmd_page_')) {
        return; // Let PaginationHelper handle these
      }

      // Handle pagination buttons for ephemeral responses (Task Monitor buttons)
      if (buttonId.startsWith('task_page_')) {
        await this.handleEphemeralPagination(interaction);
        return;
      }

      // Check if user is admin (admin bypass rate limiting)
      const isAdmin = await this.isUserAdmin(userId);

      if (!isAdmin) {
        // Check if this is in command channel
        const commandChannelId = this.configManager.getCommandChannelId();
        const isCommandChannel = interaction.channelId === commandChannelId;

        // Check rate limit (only for non-admin)
        const context = isCommandChannel ? 'command' : 'general';
        const cooldownResult = this.rateLimiter.checkCooldown(userId, context);

        if (!cooldownResult.allowed) {
          const minutes = Math.floor(cooldownResult.remainingSeconds! / 60);
          const seconds = cooldownResult.remainingSeconds! % 60;

          let timeMessage = '';
          if (minutes > 0) {
            timeMessage = `${minutes} minutes ${seconds} seconds`;
          } else {
            timeMessage = `${seconds} seconds`;
          }

          const loadingEmoji = this.configManager.getEmoji('loading');
          await interaction.reply({
            content: `${loadingEmoji} Tunggu ${timeMessage} sebelum menggunakan command ini lagi.`,
            ephemeral: true
          });
          return;
        }

        // Set cooldown (only for non-admin)
        this.rateLimiter.setCooldown(userId, context);
      }

      // Send loading message
      await this.loadingManager.sendLoadingMessage(interaction);

      // Query tasks based on button
      let tasks: ITask[];
      let title: string;

      if (buttonId === 'tasks_week') {
        tasks = await this.getTasksThisWeek();
        title = 'This Week';
      } else if (buttonId === 'tasks_tomorrow') {
        tasks = await this.getTasksTomorrow();
        title = 'Tomorrow';
      } else {
        await this.loadingManager.editWithError(interaction, 'Unknown button');
        return;
      }

      // Format response embed with pagination
      const page = 0; // Start at first page
      const { embed, buttons } = this.formatTaskListEmbedWithPagination(title, tasks, page);

      // Edit loading message with response
      await interaction.editReply({
        embeds: [embed],
        components: buttons.length > 0 ? buttons : []
      });

      logger.info('Button interaction handled', {
        userId,
        buttonId,
        taskCount: tasks.length,
        isAdmin
      });
    } catch (error) {
      logger.error('Failed to handle button interaction', error as Error, {
        userId: interaction.user.id,
        buttonId: interaction.customId
      });

      try {
        await this.loadingManager.editWithError(
          interaction,
          'An error occurred while processing your request'
        );
      } catch (editError) {
        logger.error('Failed to send error message', editError as Error);
      }
    }
  }

  /**
   * Handle ephemeral pagination button click
   */
  private async handleEphemeralPagination(interaction: ButtonInteraction): Promise<void> {
    try {
      const buttonId = interaction.customId;
      const message = interaction.message;

      // Parse button ID: task_page_prev_<type> or task_page_next_<type>
      const parts = buttonId.split('_');
      const action = parts[2]; // 'prev' or 'next'
      const taskType = parts[3]; // 'week' or 'tomorrow'

      // Get current page from footer
      const embed = message.embeds[0];
      const footerText = embed.footer?.text || '';
      const pageMatch = footerText.match(/Page (\d+)\/(\d+)/);

      if (!pageMatch) {
        await interaction.reply({
          content: '❌ Could not determine current page',
          ephemeral: true
        });
        return;
      }

      const currentPage = parseInt(pageMatch[1]) - 1; // Convert to 0-indexed
      const totalPages = parseInt(pageMatch[2]);

      // Calculate new page
      let newPage = currentPage;
      if (action === 'prev') {
        newPage = Math.max(0, currentPage - 1);
      } else if (action === 'next') {
        newPage = Math.min(totalPages - 1, currentPage + 1);
      }

      // If page didn't change, just acknowledge
      if (newPage === currentPage) {
        await interaction.deferUpdate();
        return;
      }

      // Defer update
      await interaction.deferUpdate();

      // Get tasks based on type (from cache - no new query)
      let tasks: ITask[];
      let title: string;

      if (taskType === 'week') {
        tasks = await this.getTasksThisWeek();
        title = 'This Week';
      } else if (taskType === 'tomorrow') {
        tasks = await this.getTasksTomorrow();
        title = 'Tomorrow';
      } else {
        return;
      }

      // Format response with new page
      const { embed: newEmbed, buttons } = this.formatTaskListEmbedWithPagination(title, tasks, newPage);

      // Update message
      await interaction.editReply({
        embeds: [newEmbed],
        components: buttons.length > 0 ? buttons : []
      });

      logger.info('Ephemeral pagination handled', {
        userId: interaction.user.id,
        taskType,
        oldPage: currentPage,
        newPage
      });
    } catch (error) {
      logger.error('Failed to handle ephemeral pagination', error as Error, {
        userId: interaction.user.id,
        buttonId: interaction.customId
      });
    }
  }

  /**
   * Format task list embed with pagination
   * Requirement: 3.5, 3.7, 3.8
   */
  formatTaskListEmbedWithPagination(
    title: string,
    tasks: ITask[],
    page: number = 0,
    tasksPerPage: number = 5
  ): { embed: EmbedBuilder; buttons: ActionRowBuilder<ButtonBuilder>[] } {
    // Calculate pagination
    const totalPages = Math.max(1, Math.ceil(tasks.length / tasksPerPage));
    const startIndex = page * tasksPerPage;
    const endIndex = Math.min(startIndex + tasksPerPage, tasks.length);
    const pageTasks = tasks.slice(startIndex, endIndex);

    const embed = new EmbedBuilder()
      .setTitle(`⋅•⋅☾ **${title}** ☽⋅•⋅`)
      .setColor(0x99AAB5); // Discord gray color

    // Set footer with icon and page info
    const footerIcon = this.configManager.getFooterIcon();
    const footerText = tasks.length > 0
      ? `Page ${page + 1}/${totalPages} • Made by VinTheGreat`
      : 'Made by VinTheGreat';

    embed.setFooter({
      text: footerText,
      iconURL: footerIcon
    });

    if (pageTasks.length === 0) {
      embed.setDescription('No tasks found for this period.');
    } else {
      const taskEmoji = this.configManager.getEmoji('task');
      const calendarEmoji = this.configManager.getEmoji('calendar');
      const individualEmoji = this.configManager.getEmoji('individual');
      const groupEmoji = this.configManager.getEmoji('group');
      const onlineEmoji = this.configManager.getEmoji('online');

      let description = '';

      for (const task of pageTasks) {
        const deadline = new Date(task.deadline);
        const formattedDate = format(deadline, 'dd MMM yyyy, HH:mm');

        const typeEmoji = task.tipe === 'individu' ? individualEmoji : groupEmoji;
        const typeText = task.tipe === 'individu' ? 'Individual' : 'Group';

        description += `${taskEmoji} **${task.judul}**\n`;
        description += `${calendarEmoji} Deadline: ${formattedDate}\n`;
        description += `${typeEmoji} Type: ${typeText}\n`;
        description += `${onlineEmoji} Status: Active\n\n`;
      }

      embed.setDescription(description.trim());
    }

    // Create pagination buttons if needed
    const buttons: ActionRowBuilder<ButtonBuilder>[] = [];

    if (totalPages > 1) {
      const taskType = title === 'This Week' ? 'week' : 'tomorrow';

      const prevButton = new ButtonBuilder()
        .setCustomId(`task_page_prev_${taskType}`)
        .setEmoji('1472405030584848599') // Animated previous emoji (ID only)
        .setStyle(ButtonStyle.Secondary) // Abu-abu
        .setDisabled(page === 0);

      const nextButton = new ButtonBuilder()
        .setCustomId(`task_page_next_${taskType}`)
        .setEmoji('1472405032594051104') // Animated next emoji (ID only)
        .setStyle(ButtonStyle.Secondary) // Abu-abu
        .setDisabled(page >= totalPages - 1);

      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(prevButton, nextButton);

      buttons.push(row);
    }

    return { embed, buttons };
  }

  /**
   * Check if user is admin
   */
  private async isUserAdmin(userId: string): Promise<boolean> {
    try {
      // Import Admin model dynamically to avoid circular dependency
      const Admin = (await import('../../models/Admin')).default;

      const admin = await Admin.findOne({
        user_identifier: userId,
        platform: 'discord',
        is_active: true
      });

      return admin !== null;
    } catch (error) {
      logger.error('Failed to check admin status', error as Error, { userId });
      return false; // Fail closed - treat as non-admin on error
    }
  }

  /**
   * Get tasks for this week
   * Requirement: 3.6, 9.1
   */
  async getTasksThisWeek(): Promise<ITask[]> {
    const now = new Date();

    // Get start of week (Monday)
    const weekStart = new Date(now);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);

    // Get end of week (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const allTasks = await this.taskService.getAllTasks();

    // Filter active tasks within this week
    const tasks = allTasks.filter((task: ITask) => {
      if (task.status !== 'aktif') return false;

      const deadline = new Date(task.deadline);
      return deadline >= weekStart && deadline <= weekEnd;
    });

    // Sort by deadline (ascending)
    return this.sortByDeadline(tasks);
  }

  /**
   * Get tasks for tomorrow
   * Requirement: 3.6, 9.1
   */
  async getTasksTomorrow(): Promise<ITask[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tomorrowStart = new Date(tomorrow);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const allTasks = await this.taskService.getAllTasks();

    // Filter active tasks for tomorrow
    const tasks = allTasks.filter((task: ITask) => {
      if (task.status !== 'aktif') return false;

      const deadline = new Date(task.deadline);
      return deadline >= tomorrowStart && deadline <= tomorrowEnd;
    });

    // Sort by deadline (ascending)
    return this.sortByDeadline(tasks);
  }

  /**
   * Sort tasks by deadline
   * Requirement: 3.6
   */
  private sortByDeadline(tasks: ITask[]): ITask[] {
    return tasks.sort((a, b) => {
      const dateA = new Date(a.deadline).getTime();
      const dateB = new Date(b.deadline).getTime();
      return dateA - dateB;
    });
  }

  /**
   * Format task list embed
   * Requirement: 3.5, 3.7, 3.8
   */
  formatTaskListEmbed(title: string, tasks: ITask[]): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`⋅•⋅☾ **${title}** ☽⋅•⋅`)
      .setColor(0x99AAB5); // Discord gray color

    // Set footer with icon
    const footerIcon = this.configManager.getFooterIcon();
    embed.setFooter({ 
      text: 'Made by VinTheGreat',
      iconURL: footerIcon
    });

    if (tasks.length === 0) {
      embed.setDescription('No tasks found for this period.');
    } else {
      const taskEmoji = this.configManager.getEmoji('task');
      const calendarEmoji = this.configManager.getEmoji('calendar');
      const individualEmoji = this.configManager.getEmoji('individual');
      const groupEmoji = this.configManager.getEmoji('group');
      const onlineEmoji = this.configManager.getEmoji('online');

      let description = '';

      for (const task of tasks) {
        const deadline = new Date(task.deadline);
        const formattedDate = format(deadline, 'dd MMM yyyy, HH:mm');

        const typeEmoji = task.tipe === 'individu' ? individualEmoji : groupEmoji;
        const typeText = task.tipe === 'individu' ? 'Individual' : 'Group';

        description += `${taskEmoji} **${task.judul}**\n`;
        description += `${calendarEmoji} Deadline: ${formattedDate}\n`;
        description += `${typeEmoji} Type: ${typeText}\n`;
        description += `${onlineEmoji} Status: Active\n`;
      }

      embed.setDescription(description);
    }

    return embed;
  }
}
