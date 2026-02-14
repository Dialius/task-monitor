/**
 * Button Interaction Handler
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 5.1, 5.2, 5.3, 6.1, 6.2, 9.1
 */

import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { TaskService } from '../TaskService';
import { DiscordConfigManager } from './DiscordConfigManager';
import { RateLimiter } from './RateLimiter';
import { LoadingMessageManager } from './LoadingMessageManager';
import { ITask } from '../../models/Task';
import { getLogger } from '../../utils/Logger';
import { format, startOfWeek, endOfWeek, addDays, startOfDay, endOfDay } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

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

      // Check if this is in command channel
      const commandChannelId = this.configManager.getCommandChannelId();
      const isCommandChannel = interaction.channelId === commandChannelId;

      // Check rate limit
      const context = isCommandChannel ? 'command' : 'general';
      const cooldownResult = this.rateLimiter.checkCooldown(userId, context);

      if (!cooldownResult.allowed) {
        const minutes = Math.floor(cooldownResult.remainingSeconds! / 60);
        const seconds = cooldownResult.remainingSeconds! % 60;
        
        let timeMessage = '';
        if (minutes > 0) {
          timeMessage = `${minutes} menit ${seconds} detik`;
        } else {
          timeMessage = `${seconds} detik`;
        }

        await interaction.reply({
          content: `⏳ Mohon tunggu ${timeMessage} sebelum menggunakan command lagi.`,
          ephemeral: true
        });
        return;
      }

      // Send loading message
      await this.loadingManager.sendLoadingMessage(interaction);

      // Set cooldown
      this.rateLimiter.setCooldown(userId, context);

      // Query tasks based on button
      let tasks: ITask[];
      let title: string;

      if (buttonId === 'tasks_week') {
        tasks = await this.getTasksThisWeek();
        title = 'Minggu Ini';
      } else if (buttonId === 'tasks_tomorrow') {
        tasks = await this.getTasksTomorrow();
        title = 'Tugas Besok';
      } else {
        await this.loadingManager.editWithError(interaction, 'Button tidak dikenal');
        return;
      }

      // Format response embed
      const embed = this.formatTaskListEmbed(title, tasks);

      // Edit loading message with response
      await this.loadingManager.editWithResponse(interaction, embed);

      logger.info('Button interaction handled', {
        userId,
        buttonId,
        taskCount: tasks.length
      });
    } catch (error) {
      logger.error('Failed to handle button interaction', error as Error, {
        userId: interaction.user.id,
        buttonId: interaction.customId
      });

      try {
        await this.loadingManager.editWithError(
          interaction,
          'Terjadi kesalahan saat memproses permintaan'
        );
      } catch (editError) {
        logger.error('Failed to send error message', editError as Error);
      }
    }
  }

  /**
   * Get tasks for this week
   * Requirement: 3.6, 9.1
   */
  async getTasksThisWeek(): Promise<ITask[]> {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday

    const allTasks = await this.taskService.getAllTasks();

    // Filter active tasks within this week
    const tasks = allTasks.filter(task => {
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
    const tomorrow = addDays(new Date(), 1);
    const tomorrowStart = startOfDay(tomorrow);
    const tomorrowEnd = endOfDay(tomorrow);

    const allTasks = await this.taskService.getAllTasks();

    // Filter active tasks for tomorrow
    const tasks = allTasks.filter(task => {
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
      .setColor(this.configManager.getEmbedColor() as any)
      .setTimestamp();

    if (tasks.length === 0) {
      embed.setDescription('Tidak ada tugas untuk periode ini.');
    } else {
      const taskEmoji = this.configManager.getEmoji('task');
      const calendarEmoji = this.configManager.getEmoji('calendar');
      const individualEmoji = this.configManager.getEmoji('individual');
      const groupEmoji = this.configManager.getEmoji('group');
      const onlineEmoji = this.configManager.getEmoji('online');

      let description = '';

      for (const task of tasks) {
        const deadline = new Date(task.deadline);
        const formattedDate = format(deadline, 'dd MMM yyyy, HH:mm', { locale: localeId });
        
        const typeEmoji = task.tipe === 'individu' ? individualEmoji : groupEmoji;
        const typeText = task.tipe === 'individu' ? 'Individu' : 'Kelompok';

        description += `${taskEmoji} **${task.judul}**\n`;
        description += `${calendarEmoji} Deadline: ${formattedDate}\n`;
        description += `${typeEmoji} Tipe: ${typeText}\n`;
        description += `${onlineEmoji} Status: Aktif\n\n`;
      }

      embed.setDescription(description);
    }

    // Footer
    embed.setFooter({
      text: '📊 Sorted by nearest deadline'
    });

    return embed;
  }
}
