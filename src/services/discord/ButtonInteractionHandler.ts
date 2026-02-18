/**
 * Button Interaction Handler
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 5.1, 5.2, 5.3, 6.1, 6.2, 9.1
 */

import {
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js';
import { TaskService } from '../TaskService';
import { DiscordConfigManager } from './DiscordConfigManager';
import { RateLimiter } from './RateLimiter';
import { LoadingMessageManager } from './LoadingMessageManager';
import { ITask } from '../../models/Task';
import { getLogger } from '../../utils/Logger';
import { format } from 'date-fns';
import { ScheduleService } from '../ScheduleService';
import { AnnouncementService } from '../AnnouncementService';
import { EditConfirmationService } from './EditConfirmationService';
import { NotionService } from '../NotionService';
import { AIService } from '../AIService';
import { PiketService } from '../PiketService';
import { HolidayService } from '../HolidayService';

const logger = getLogger();

/**
 * Button Interaction Handler
 * Handles button click interactions for task queries
 */
export class ButtonInteractionHandler {
  private loadingManager: LoadingMessageManager;

  constructor(
    private taskService: TaskService,
    private scheduleService: ScheduleService,
    private announcementService: AnnouncementService,
    private notionService: NotionService,
    private aiService: AIService,
    private piketService: PiketService,
    private holidayService: HolidayService,
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

      // Handle task confirmation buttons (add_tugas_cepat)
      if (buttonId.startsWith('task_confirm_')) {
        await this.handleTaskConfirmation(interaction);
        return;
      }

      // Handle generic edit/confirm/cancel buttons
      if (buttonId.startsWith('btn_edit_')) {
        await this.handleEditButton(interaction);
        return;
      }

      if (buttonId.startsWith('btn_confirm_')) {
        await this.handleConfirmButton(interaction);
        return;
      }

      if (buttonId.startsWith('btn_cancel_')) {
        await this.handleCancelButton(interaction);
        return;
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
    const { DateTimeHelper } = require('../../utils/DateTimeHelper');
    const now = DateTimeHelper.now();

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

      const deadline = DateTimeHelper.toWIB(task.deadline);
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
    const { DateTimeHelper } = require('../../utils/DateTimeHelper');
    const tomorrow = DateTimeHelper.now();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tomorrowStart = new Date(tomorrow);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const allTasks = await this.taskService.getAllTasks();

    // Filter active tasks for tomorrow
    const tasks = allTasks.filter((task: ITask) => {
      if (task.status !== 'aktif') return false;

      const deadline = DateTimeHelper.toWIB(task.deadline);
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

  /**
   * Handle task confirmation buttons (Yes/No/Revise)
   */
  private async handleTaskConfirmation(interaction: ButtonInteraction): Promise<void> {
    try {
      const buttonId = interaction.customId;
      const userId = interaction.user.id;

      // For Revise button, show modal immediately (before any defer)
      if (buttonId === 'task_confirm_revise') {
        await this.showRevisionModal(interaction);
        return;
      }

      // For Yes/No buttons, defer update
      await interaction.deferUpdate();

      if (buttonId === 'task_confirm_yes') {
        // Import AdminCommandHandler dynamically
        const { AdminCommandHandler } = await import('../../handlers/AdminCommandHandler');
        const adminHandler = new AdminCommandHandler(
          this.taskService,
          this.scheduleService,
          this.piketService,
          this.announcementService,
          this.aiService,
          this.notionService,
          this.holidayService
        );

        const response = await adminHandler.handleTaskConfirmation(userId, 'confirm');

        // Update message with result
        const embed = new EmbedBuilder()
          .setTitle(response.embedData?.title || 'Result')
          .setDescription(response.embedData?.description || '')
          .setColor(response.embedData?.color || 0x99AAB5);

        if (response.embedData?.fields) {
          embed.addFields(response.embedData.fields);
        }

        const footerIcon = this.configManager.getFooterIcon();
        embed.setFooter({
          text: 'Made by VinTheGreat',
          iconURL: footerIcon
        });

        await interaction.editReply({
          embeds: [embed],
          components: [] // Remove buttons
        });

      } else if (buttonId === 'task_confirm_no') {
        // Import AdminCommandHandler dynamically
        const { AdminCommandHandler } = await import('../../handlers/AdminCommandHandler');
        const adminHandler = new AdminCommandHandler(
          this.taskService,
          this.scheduleService,
          this.piketService,
          this.announcementService,
          this.aiService,
          this.notionService,
          this.holidayService
        );

        const response = await adminHandler.handleTaskConfirmation(userId, 'cancel');

        const embed = new EmbedBuilder()
          .setTitle(response.embedData?.title || 'Cancelled')
          .setDescription(response.embedData?.description || '')
          .setColor(response.embedData?.color || 0x99AAB5);

        const footerIcon = this.configManager.getFooterIcon();
        embed.setFooter({
          text: 'Made by VinTheGreat',
          iconURL: footerIcon
        });

        await interaction.editReply({
          embeds: [embed],
          components: [] // Remove buttons
        });
      }

      logger.info('Task confirmation handled', {
        userId,
        buttonId
      });
    } catch (error) {
      logger.error('Failed to handle task confirmation', error as Error, {
        userId: interaction.user.id,
        buttonId: interaction.customId
      });
    }
  }

  /**
   * Show modal for task revision
   */
  private async showRevisionModal(interaction: ButtonInteraction): Promise<void> {
    const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = await import('discord.js');
    const { TaskConfirmationService } = await import('./TaskConfirmationService');

    const pending = TaskConfirmationService.getPendingConfirmation(interaction.user.id);

    if (!pending) {
      await interaction.reply({
        content: '⏱️ Konfirmasi expired. Silakan gunakan `/add_tugas_cepat` lagi.',
        ephemeral: true
      });
      return;
    }

    const parsed = pending.parsedTask;

    // Create modal
    const modal = new ModalBuilder()
      .setCustomId('task_revise_modal')
      .setTitle('Revisi Tugas');

    // Add input fields
    const judulInput = new TextInputBuilder()
      .setCustomId('judul')
      .setLabel('Judul')
      .setStyle(TextInputStyle.Short)
      .setValue(parsed.judul || '')
      .setRequired(true);

    const mapelInput = new TextInputBuilder()
      .setCustomId('mata_pelajaran')
      .setLabel('Mata Pelajaran')
      .setStyle(TextInputStyle.Short)
      .setValue(parsed.mata_pelajaran || '')
      .setPlaceholder('Contoh: Matematika, B.Indo, PAI, PJOK, dll')
      .setRequired(true);

    const deskripsiInput = new TextInputBuilder()
      .setCustomId('deskripsi')
      .setLabel('Deskripsi')
      .setStyle(TextInputStyle.Paragraph)
      .setValue(parsed.deskripsi || '')
      .setRequired(true);

    const deadlineInput = new TextInputBuilder()
      .setCustomId('deadline')
      .setLabel('Deadline (YYYY-MM-DD HH:MM)')
      .setStyle(TextInputStyle.Short)
      .setValue(new Date(parsed.deadline).toISOString().slice(0, 16).replace('T', ' '))
      .setRequired(true);

    const tipeInput = new TextInputBuilder()
      .setCustomId('tipe')
      .setLabel('Tipe (individu/kelompok)')
      .setStyle(TextInputStyle.Short)
      .setValue(parsed.tipe || 'individu')
      .setRequired(true);

    // Add rows
    const row1 = new ActionRowBuilder<any>().addComponents(judulInput);
    const row2 = new ActionRowBuilder<any>().addComponents(mapelInput);
    const row3 = new ActionRowBuilder<any>().addComponents(deskripsiInput);
    const row4 = new ActionRowBuilder<any>().addComponents(deadlineInput);
    const row5 = new ActionRowBuilder<any>().addComponents(tipeInput);

    modal.addComponents(row1, row2, row3, row4, row5);

    // Show modal
    await interaction.showModal(modal);

    logger.info('Revision modal shown', {
      userId: interaction.user.id
    });
  }

  /**
   * Handle generic edit button (shows modal)
   */
  private async handleEditButton(interaction: ButtonInteraction): Promise<void> {
    try {
      const parts = interaction.customId.split('_');
      const userId = parts[2];
      const editType = parts.slice(3).join('_');

      if (interaction.user.id !== userId) {
        await interaction.reply({
          content: '❌ Hanya yang menjalankan command yang bisa mengedit.',
          ephemeral: true
        });
        return;
      }

      const pending = EditConfirmationService.getPending(userId);
      if (!pending) {
        await interaction.reply({
          content: '⏱️ Sesi edit telah berakhir. Silakan ulangi command.',
          ephemeral: true
        });
        return;
      }

      // Create Modal
      const modal = new ModalBuilder()
        .setCustomId(`modal_edit_${editType}`)
        .setTitle('Edit Data');

      // Add inputs based on editType
      if (editType === 'edit_tugas') {
        const judulInput = new TextInputBuilder()
          .setCustomId('judul')
          .setLabel('Judul')
          .setStyle(TextInputStyle.Short)
          .setValue(pending.originalData.judul || '')
          .setRequired(true);

        const mapelInput = new TextInputBuilder()
          .setCustomId('mata_pelajaran')
          .setLabel('Mata Pelajaran')
          .setStyle(TextInputStyle.Short)
          .setValue(pending.originalData.mata_pelajaran || '')
          .setRequired(true);

        const deskripsiInput = new TextInputBuilder()
          .setCustomId('deskripsi')
          .setLabel('Deskripsi')
          .setStyle(TextInputStyle.Paragraph)
          .setValue(pending.originalData.deskripsi || '')
          .setRequired(false);

        const deadlineInput = new TextInputBuilder()
          .setCustomId('deadline')
          .setLabel('Deadline (YYYY-MM-DD HH:MM)')
          .setStyle(TextInputStyle.Short)
          .setValue(pending.originalData.deadline ? pending.originalData.deadline.replace('T', ' ').slice(0, 16) : '')
          .setRequired(false);

        const tipeInput = new TextInputBuilder()
          .setCustomId('tipe')
          .setLabel('Tipe (individu/kelompok)')
          .setStyle(TextInputStyle.Short)
          .setValue(pending.originalData.tipe || 'individu')
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(judulInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(mapelInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(deskripsiInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(deadlineInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(tipeInput)
        );
      } else if (editType === 'edit_jadwal' || editType === 'ganti_jadwal') {
        const mapelInput = new TextInputBuilder()
          .setCustomId('mata_pelajaran')
          .setLabel('Mata Pelajaran')
          .setStyle(TextInputStyle.Short)
          .setValue(pending.originalData.mata_pelajaran || '')
          .setRequired(true);

        const ruanganInput = new TextInputBuilder()
          .setCustomId('ruangan')
          .setLabel('Ruangan')
          .setStyle(TextInputStyle.Short)
          .setValue(pending.originalData.ruangan || '')
          .setRequired(true);

        const jamMulaiInput = new TextInputBuilder()
          .setCustomId('jam_mulai')
          .setLabel('Jam Mulai (HH:MM)')
          .setStyle(TextInputStyle.Short)
          .setValue(pending.originalData.jam_mulai || '')
          .setRequired(true);

        const jamSelesaiInput = new TextInputBuilder()
          .setCustomId('jam_selesai')
          .setLabel('Jam Selesai (HH:MM)')
          .setStyle(TextInputStyle.Short)
          .setValue(pending.originalData.jam_selesai || '')
          .setRequired(true);

        const guruInput = new TextInputBuilder()
          .setCustomId('nama_guru')
          .setLabel('Nama Guru')
          .setStyle(TextInputStyle.Short)
          .setValue(pending.originalData.nama_guru || '')
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(mapelInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(ruanganInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(jamMulaiInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(jamSelesaiInput),
          new ActionRowBuilder<TextInputBuilder>().addComponents(guruInput)
        );
      }

      await interaction.showModal(modal);
    } catch (error) {
      logger.error('Failed to handle edit button', error as Error);
      await interaction.reply({
        content: '❌ Terjadi kesalahan saat membuka form edit.',
        ephemeral: true
      });
    }
  }

  /**
   * Handle generic confirm button
   */
  private async handleConfirmButton(interaction: ButtonInteraction): Promise<void> {
    try {
      const parts = interaction.customId.split('_');
      const userId = parts[2];
      const type = parts.slice(3).join('_');

      if (interaction.user.id !== userId) {
        await interaction.reply({
          content: '❌ Hanya yang menjalankan command yang bisa mengkonfirmasi.',
          ephemeral: true
        });
        return;
      }

      // Defer update immediately to prevent "Unknown interaction"
      await interaction.deferUpdate();

      const pending = EditConfirmationService.getPending(userId);
      if (!pending) {
        await interaction.editReply({
          content: '⏱️ Sesi konfirmasi telah berakhir.',
          embeds: [],
          components: []
        });
        return;
      }

      // Execute action based on type
      if (type === 'hapus_tugas') {
        // Get task first to retrieve notion_id for Notion sync
        const taskToDelete = await this.taskService.getTaskById(pending.itemId);
        await this.taskService.deleteTask(pending.itemId);

        // Sync deletion to Notion (archive)
        if (taskToDelete?.notion_id && this.notionService?.isEnabled()) {
          try {
            await this.notionService.archiveTaskInNotion(taskToDelete.notion_id);
            logger.info('Task archived in Notion after delete', { taskId: pending.itemId, notionId: taskToDelete.notion_id });
          } catch (syncError) {
            logger.warn('Failed to archive task in Notion', syncError as Error);
          }
        }

        await interaction.editReply({
          content: '✅ Tugas berhasil dihapus.',
          embeds: [],
          components: []
        });
      } else if (type === 'tandai_selesai') {
        const task = await this.taskService.markComplete(pending.itemId);

        // Sync status update to Notion
        if (task?.notion_id && this.notionService?.isEnabled()) {
          try {
            await this.notionService.updateTaskInNotion(task.notion_id, {
              status: 'selesai'
            });
            logger.info('Task marked complete in Notion', { taskId: pending.itemId, notionId: task.notion_id });
          } catch (syncError) {
            logger.warn('Failed to update task status in Notion', syncError as Error);
          }
        }

        const finishEmbed = new EmbedBuilder()
          .setTitle('✅ Tugas Selesai!')
          .setDescription(`**${task.judul}**\n\n🎉 Status: **Selesai**`)
          .setColor(0x57F287);

        await interaction.editReply({
          embeds: [finishEmbed],
          components: []
        });
      } else if (type === 'hapus_jadwal') {
        await this.scheduleService.deleteSchedule(pending.itemId);
        await interaction.editReply({
          content: '✅ Jadwal berhasil dihapus.',
          embeds: [],
          components: []
        });
      } else if (type === 'edit_tugas') {
        // Apply changes from newData
        if (!pending.newData) {
          await interaction.editReply({ content: '❌ Data perubahan tidak ditemukan.' });
          return;
        }

        // We need to apply all fields. TaskService.updateTask updates ONE field.
        const keys = Object.keys(pending.newData);
        for (const key of keys) {
          if (key === 'deadline') {
            await this.taskService.updateTask(pending.itemId, key, new Date(pending.newData[key]));
          } else {
            await this.taskService.updateTask(pending.itemId, key, pending.newData[key]);
          }
        }

        // Sync edit to Notion
        const editedTask = await this.taskService.getTaskById(pending.itemId);
        if (editedTask?.notion_id && this.notionService?.isEnabled()) {
          try {
            const notionUpdates: any = {};
            for (const key of keys) {
              if (key === 'deadline') {
                notionUpdates[key] = new Date(pending.newData[key]);
              } else {
                notionUpdates[key] = pending.newData[key];
              }
            }
            await this.notionService.updateTaskInNotion(editedTask.notion_id, notionUpdates);
            logger.info('Task updated in Notion after edit', { taskId: pending.itemId, notionId: editedTask.notion_id });
          } catch (syncError) {
            logger.warn('Failed to update task in Notion', syncError as Error);
          }
        }

        await interaction.editReply({
          content: '✅ Tugas berhasil diupdate.',
          embeds: [],
          components: []
        });
      } else if (type === 'edit_jadwal' || type === 'ganti_jadwal') {
        if (!pending.newData) {
          await interaction.editReply({ content: '❌ Data perubahan tidak ditemukan.' });
          return;
        }

        const keys = Object.keys(pending.newData);
        for (const key of keys) {
          await this.scheduleService.updateSchedule(pending.itemId, key, pending.newData[key]);
        }

        if (type === 'ganti_jadwal') {
          // Announcement
          const { DateTimeHelper } = await import('../../utils/DateTimeHelper');
          // Construct change description
          const changes = EditConfirmationService.formatDiff(pending.originalData, pending.newData);
          await this.announcementService.createAnnouncement({
            tanggal: DateTimeHelper.now(),
            judul: `Perubahan Jadwal: ${pending.newData.mata_pelajaran || pending.originalData.mata_pelajaran}`,
            tipe: 'perubahan_jadwal',
            keterangan: `Perubahan jadwal:\n${changes}`
          });
        }

        await interaction.editReply({
          content: '✅ Jadwal berhasil diupdate.',
          embeds: [],
          components: []
        });
      }

      EditConfirmationService.clear(userId);

    } catch (error) {
      logger.error('Failed to handle confirm button', error as Error);
      try {
        await interaction.editReply({
          content: '❌ Terjadi kesalahan saat memproses konfirmasi.',
          embeds: [],
          components: []
        });
      } catch (e) {
        logger.error('Failed to send error message', e as Error);
      }
    }
  }

  /**
   * Handle generic cancel button
   */
  private async handleCancelButton(interaction: ButtonInteraction): Promise<void> {
    try {
      const parts = interaction.customId.split('_');
      const userId = parts[2];

      if (interaction.user.id !== userId) {
        await interaction.reply({
          content: '❌ Hanya yang menjalankan command yang bisa membatalkan.',
          ephemeral: true
        });
        return;
      }

      await interaction.deferUpdate();

      EditConfirmationService.clear(userId);

      await interaction.editReply({
        content: '❌ Aksi dibatalkan.',
        embeds: [],
        components: []
      });
    } catch (error) {
      logger.error('Failed to handle cancel button', error as Error);
    }
  }
}
