/**
 * Discord Platform Adapter
 * Requirements: 16.6, 17.6, 17.7, 17.8, 17.9, 19.1, 19.3, 19.5
 */

import {
  Client,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
  PermissionFlagsBits
} from 'discord.js';
import {
  PlatformAdapter,
  MessageContext,
  TaskListOptions,
  ScheduleOptions,
  AnnouncementOptions
} from './PlatformAdapter';
import { DailyRecapData, WeeklyRecapData } from '../utils/RecapFormatter';

/**
 * Discord Adapter implementing PlatformAdapter interface
 * Uses Discord.js for Discord integration
 */
export class DiscordAdapter implements PlatformAdapter {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  /**
   * Get platform name
   */
  getPlatformName(): 'discord' {
    return 'discord';
  }

  /**
   * Send simple text message
   * Requirement: 16.2
   */
  async sendMessage(channelId: string, message: string): Promise<void> {
    const channel = await this.client.channels.fetch(channelId);
    if (channel && channel.isTextBased()) {
      await (channel as TextChannel).send(message);
    }
  }

  /**
   * Send message with Discord mentions
   * Requirement: 19.5
   */
  async sendMessageWithMentions(
    channelId: string,
    message: string,
    userIds: string[]
  ): Promise<void> {
    // Replace user IDs with Discord mention format
    let formattedMessage = message;
    userIds.forEach(userId => {
      formattedMessage = formattedMessage.replace(
        new RegExp(`@${userId}`, 'g'),
        `<@${userId}>`
      );
    });

    await this.sendMessage(channelId, formattedMessage);
  }

  /**
   * Send formatted task list with Discord embeds
   * Requirement: 17.6, 19.1
   */
  async sendTaskList(channelId: string, options: TaskListOptions): Promise<void> {
    const { tasks, showButtons = false } = options;

    if (tasks.length === 0) {
      await this.sendMessage(channelId, '📝 Tidak ada tugas saat ini.');
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('📝 Daftar Tugas')
      .setColor(this.getColorByPriority('normal'))
      .setTimestamp();

    tasks.forEach((task, index) => {
      const emoji = this.getTaskEmoji(task.tipe);
      const priorityEmoji = this.getPriorityEmoji(task.prioritas);
      const deadline = new Date(task.deadline).toLocaleDateString('id-ID');

      embed.addFields({
        name: `${index + 1}. ${emoji} ${task.judul}`,
        value: `📚 ${task.mata_pelajaran}\n📅 Deadline: ${deadline}\n${priorityEmoji} Prioritas: ${task.prioritas}\n📄 ${task.deskripsi}`,
        inline: false
      });
    });

    const channel = await this.client.channels.fetch(channelId);
    if (channel && channel.isTextBased()) {
      const messageOptions: any = { embeds: [embed] };

      // Add interactive buttons if requested
      if (showButtons) {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('refresh_tasks')
            .setLabel('🔄 Refresh')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('filter_urgent')
            .setLabel('🚨 Urgent Only')
            .setStyle(ButtonStyle.Danger)
        );
        messageOptions.components = [row];
      }

      await (channel as TextChannel).send(messageOptions);
    }
  }

  /**
   * Send formatted schedule with Discord embeds
   * Requirement: 17.7, 19.3
   */
  async sendSchedule(channelId: string, options: ScheduleOptions): Promise<void> {
    const { schedules } = options;

    if (schedules.length === 0) {
      await this.sendMessage(channelId, '📅 Tidak ada jadwal untuk hari ini.');
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('📅 Jadwal Pelajaran')
      .setColor('#3498db')
      .setTimestamp();

    schedules.forEach((schedule, index) => {
      embed.addFields({
        name: `${index + 1}. 📖 ${schedule.mata_pelajaran}`,
        value: `⏰ ${schedule.jam_mulai} - ${schedule.jam_selesai}\n🏫 Ruangan: ${schedule.ruangan}\n👨‍🏫 Guru: ${schedule.nama_guru}`,
        inline: false
      });
    });

    const channel = await this.client.channels.fetch(channelId);
    if (channel && channel.isTextBased()) {
      await (channel as TextChannel).send({ embeds: [embed] });
    }
  }

  /**
   * Send formatted announcement with Discord embeds
   * Requirement: 19.7
   */
  async sendAnnouncement(
    channelId: string,
    options: AnnouncementOptions
  ): Promise<void> {
    const { announcement, urgent = false } = options;

    const typeEmoji = this.getAnnouncementEmoji(announcement.tipe);
    const tanggal = new Date(announcement.tanggal).toLocaleDateString('id-ID');

    const embed = new EmbedBuilder()
      .setTitle(`${typeEmoji} ${announcement.judul}`)
      .setDescription(announcement.keterangan)
      .addFields({ name: '📅 Tanggal', value: tanggal })
      .setColor(urgent ? '#e74c3c' : '#f39c12')
      .setTimestamp();

    if (urgent) {
      embed.setTitle(`🚨 URGENT: ${announcement.judul}`);
    }

    const channel = await this.client.channels.fetch(channelId);
    if (channel && channel.isTextBased()) {
      await (channel as TextChannel).send({ embeds: [embed] });
    }
  }

  /**
   * Get Discord user ID from message context
   * Requirement: 16.4
   */
  getUserIdentifier(context: MessageContext): string {
    return context.userId;
  }

  /**
   * Format Discord mention
   * Requirement: 19.5
   */
  formatMention(userId: string): string {
    return `<@${userId}>`;
  }

  /**
   * Check if user has admin role in Discord
   * Requirement: 17.10
   */
  async hasAdminRole(userId: string, guildId?: string): Promise<boolean> {
    if (!guildId) return false;

    try {
      const guild = await this.client.guilds.fetch(guildId);
      const member = await guild.members.fetch(userId);

      // Check if user has Administrator permission or specific admin roles
      return (
        member.permissions.has(PermissionFlagsBits.Administrator) ||
        member.roles.cache.some(role =>
          ['Admin', 'Ketua', 'Wakil', 'Koordinator'].includes(role.name)
        )
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Helper: Get color by priority
   */
  private getColorByPriority(priority: string): number {
    const colors: Record<string, number> = {
      urgent: 0xe74c3c, // Red
      penting: 0xf39c12, // Orange
      normal: 0x3498db // Blue
    };
    return colors[priority] || colors.normal;
  }

  /**
   * Helper: Get task type emoji
   */
  private getTaskEmoji(tipe: string): string {
    const emojiMap: Record<string, string> = {
      individu: '👤',
      kelompok: '👥',
      ujian: '📝'
    };
    return emojiMap[tipe] || '📝';
  }

  /**
   * Helper: Get priority emoji
   */
  private getPriorityEmoji(prioritas: string): string {
    const emojiMap: Record<string, string> = {
      urgent: '🚨',
      penting: '⚠️',
      normal: 'ℹ️'
    };
    return emojiMap[prioritas] || 'ℹ️';
  }

  /**
   * Helper: Get announcement type emoji
   */
  private getAnnouncementEmoji(tipe: string): string {
    const emojiMap: Record<string, string> = {
      acara: '🎉',
      perubahan_jadwal: '🔄',
      praktikum: '🔬',
      lainnya: '📢'
    };
    return emojiMap[tipe] || '📢';
  }

  /**
   * Send daily recap (Discord Embed format)
   */
  async sendDailyRecap(channelId: string, data: DailyRecapData): Promise<void> {
    const { date, tasks, schedules } = data;
    const dateStr = date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const embed = new EmbedBuilder()
      .setTitle(`📅 Daily Recap | ${dateStr}`)
      .setColor('#3498db')
      .setTimestamp();

    // Tasks Field
    if (tasks && tasks.length > 0) {
      const taskList = tasks.map((t, i) => {
        const priorityEmoji = this.getPriorityEmoji(t.prioritas);
        return `${i + 1}. ${priorityEmoji} **${t.mata_pelajaran}** - ${t.judul}`;
      }).join('\n');
      embed.addFields({ name: '📝 Tugas Besok', value: taskList });
    } else {
      embed.addFields({ name: '📝 Tugas Besok', value: 'Tidak ada tugas untuk besok! 🎉' });
    }

    // Schedule Field
    if (schedules && schedules.length > 0) {
      const scheduleList = schedules.map((s, i) => {
        return `${i + 1}. \`${s.jam_mulai}-${s.jam_selesai}\` **${s.mata_pelajaran}** (${s.ruangan})`;
      }).join('\n');
      embed.addFields({ name: '📅 Jadwal Besok', value: scheduleList });
    } else {
      embed.addFields({ name: '📅 Jadwal Besok', value: 'Tidak ada jadwal pelajaran.' });
    }

    const channel = await this.client.channels.fetch(channelId);
    if (channel && channel.isTextBased()) {
      await (channel as TextChannel).send({ embeds: [embed] });
    }
  }

  /**
   * Send weekly recap (Discord Embed format)
   */
  async sendWeeklyRecap(channelId: string, data: WeeklyRecapData): Promise<void> {
    const { weekNumber, month, year, tasksByDay } = data;

    const embed = new EmbedBuilder()
      .setTitle(`📊 Weekly Recap | Minggu ke-${weekNumber} ${month} ${year}`)
      .setDescription('Ringkasan tugas untuk minggu depan.')
      .setColor('#9b59b6')
      .setTimestamp();

    let hasTasks = false;
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

    days.forEach(day => {
      const tasks = tasksByDay.get(day);
      if (tasks && tasks.length > 0) {
        hasTasks = true;
        const taskList = tasks.map((t, i) => {
          const priorityEmoji = this.getPriorityEmoji(t.prioritas);
          return `${i + 1}. ${priorityEmoji} **${t.mata_pelajaran}** - ${t.judul}`;
        }).join('\n');
        embed.addFields({ name: `📅 ${day}`, value: taskList });
      }
    });

    if (!hasTasks) {
      embed.setDescription('Tidak ada tugas untuk minggu depan! 🎉');
    }

    const channel = await this.client.channels.fetch(channelId);
    if (channel && channel.isTextBased()) {
      await (channel as TextChannel).send({ embeds: [embed] });
    }
  }
}


