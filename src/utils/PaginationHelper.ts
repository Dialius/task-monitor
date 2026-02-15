/**
 * Pagination Helper for Discord Embeds
 * Handles pagination with next/previous buttons
 */

import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
  Message,
  ComponentType
} from 'discord.js';

export interface PaginationOptions {
  embeds: EmbedBuilder[];
  timeout?: number; // in milliseconds
  userId?: string; // Only this user can interact
}

export class PaginationHelper {
  /**
   * Create paginated embed with buttons
   * @param message - Discord message to reply to
   * @param options - Pagination options
   */
  static async createPaginatedEmbed(
    message: Message | ButtonInteraction,
    options: PaginationOptions
  ): Promise<void> {
    const { embeds, timeout = 120000, userId } = options;

    if (embeds.length === 0) {
      throw new Error('At least one embed is required');
    }

    // If only one embed, send without pagination
    if (embeds.length === 1) {
      if (message instanceof ButtonInteraction) {
        await message.editReply({ embeds: [embeds[0]] });
      } else {
        await message.reply({ embeds: [embeds[0]] });
      }
      return;
    }

    let currentPage = 0;

    // Create buttons with animated emojis (use only emoji ID for custom emojis)
    // Use unique prefix 'cmd_page_' to avoid conflicts with other button handlers
    const getButtons = (page: number) => {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('cmd_page_prev')
          .setEmoji('1472405030584848599') // Animated previous emoji (ID only)
          .setStyle(ButtonStyle.Secondary) // Abu-abu
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId('cmd_page_info')
          .setLabel(`${page + 1} / ${embeds.length}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('cmd_page_next')
          .setEmoji('1472405032594051104') // Animated next emoji (ID only)
          .setStyle(ButtonStyle.Secondary) // Abu-abu
          .setDisabled(page === embeds.length - 1)
      );
      return row;
    };

    // Send initial message
    const sentMessage = message instanceof ButtonInteraction
      ? await message.editReply({
          embeds: [embeds[currentPage]],
          components: [getButtons(currentPage)]
        })
      : await message.reply({
          embeds: [embeds[currentPage]],
          components: [getButtons(currentPage)]
        });

    // Create collector
    const collector = (sentMessage as Message).createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: timeout
    });

    collector.on('collect', async (interaction: ButtonInteraction) => {
      // Check if user is allowed to interact
      if (userId && interaction.user.id !== userId) {
        await interaction.reply({
          content: '❌ Hanya pengirim command yang bisa menggunakan tombol ini.',
          ephemeral: true
        });
        return;
      }

      // Handle button clicks
      if (interaction.customId === 'cmd_page_prev') {
        currentPage = Math.max(0, currentPage - 1);
      } else if (interaction.customId === 'cmd_page_next') {
        currentPage = Math.min(embeds.length - 1, currentPage + 1);
      }

      // Update message
      await interaction.update({
        embeds: [embeds[currentPage]],
        components: [getButtons(currentPage)]
      });
    });

    collector.on('end', async () => {
      // Disable buttons when collector ends
      try {
        await (sentMessage as Message).edit({
          components: []
        });
      } catch (error) {
        // Message might be deleted
      }
    });
  }

  /**
   * Split array into chunks for pagination
   * @param array - Array to split
   * @param chunkSize - Size of each chunk
   */
  static chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Create embeds from task list with pagination
   * @param tasks - Array of tasks
   * @param itemsPerPage - Number of tasks per page
   * @param title - Embed title
   * @param color - Embed color
   */
  static createTaskEmbeds(
    tasks: any[],
    itemsPerPage: number,
    title: string,
    color: number
  ): EmbedBuilder[] {
    const chunks = this.chunkArray(tasks, itemsPerPage);
    const embeds: EmbedBuilder[] = [];

    chunks.forEach((chunk, pageIndex) => {
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(color)
        .setFooter({
          text: `Halaman ${pageIndex + 1} dari ${chunks.length} • Made by VinTheGreat`,
          iconURL: process.env.DISCORD_FOOTER_ICON || 'https://i.imgur.com/AfFp7pu.png'
        });

      const fields = chunk.map((task, index) => {
        const globalIndex = pageIndex * itemsPerPage + index;
        const emoji = this.getTaskEmoji(task.tipe);
        const deadline = new Date(task.deadline).toLocaleDateString('id-ID', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        });

        return {
          name: `${globalIndex + 1}. ${emoji} ${task.judul}`,
          value: `**Mata Pelajaran:** ${task.mata_pelajaran}\n**Deadline:** ${deadline}\n**Deskripsi:** ${task.deskripsi}\n**ID:** \`${task._id}\``,
          inline: false
        };
      });

      embed.addFields(fields);
      embeds.push(embed);
    });

    return embeds;
  }

  /**
   * Get emoji for task type
   */
  private static getTaskEmoji(tipe: string): string {
    const emojiMap: Record<string, string> = {
      'individu': '👤',
      'kelompok': '👥',
      'ujian': '📝'
    };
    return emojiMap[tipe] || '📝';
  }
}
