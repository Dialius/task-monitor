/**
 * Progress Message Utility
 * Handles "loading" messages that get edited with final results
 * Works for both WhatsApp and Discord
 */

import { WASocket } from '@whiskeysockets/baileys';
import { Client as DiscordClient, Message as DiscordMessage } from 'discord.js';
import { getLogger } from './Logger';

const logger = getLogger();

export interface ProgressMessageOptions {
  platform: 'whatsapp' | 'discord';
  chatId: string;
  initialMessage?: string;
}

export interface MessageReference {
  platform: 'whatsapp' | 'discord';
  chatId: string;
  messageId: string;
  key?: any; // WhatsApp message key
  discordMessage?: DiscordMessage; // Discord message object
}

/**
 * Progress Message Manager
 * Sends initial "loading" message and allows editing it later
 */
export class ProgressMessage {
  private whatsappSocket?: WASocket;
  private discordClient?: DiscordClient;

  constructor(whatsappSocket?: WASocket, discordClient?: DiscordClient) {
    this.whatsappSocket = whatsappSocket;
    this.discordClient = discordClient;
  }

  /**
   * Send initial progress message
   */
  async send(options: ProgressMessageOptions): Promise<MessageReference | null> {
    const { platform, chatId, initialMessage = '⏳ Memproses...' } = options;

    try {
      if (platform === 'whatsapp') {
        return await this.sendWhatsApp(chatId, initialMessage);
      } else if (platform === 'discord') {
        return await this.sendDiscord(chatId, initialMessage);
      }
    } catch (error) {
      logger.error('Failed to send progress message', error as Error, { platform, chatId });
    }

    return null;
  }

  /**
   * Send WhatsApp progress message
   */
  private async sendWhatsApp(chatId: string, message: string): Promise<MessageReference | null> {
    if (!this.whatsappSocket) {
      logger.warn('WhatsApp socket not available for progress message');
      return null;
    }

    try {
      const sent = await this.whatsappSocket.sendMessage(chatId, { text: message });
      
      if (!sent || !sent.key || !sent.key.id) {
        logger.warn('WhatsApp message sent but no key returned');
        return null;
      }
      
      return {
        platform: 'whatsapp',
        chatId,
        messageId: sent.key.id,
        key: sent.key
      };
    } catch (error) {
      logger.error('Failed to send WhatsApp progress message', error as Error);
      return null;
    }
  }

  /**
   * Send Discord progress message
   */
  private async sendDiscord(channelId: string, message: string): Promise<MessageReference | null> {
    if (!this.discordClient) {
      logger.warn('Discord client not available for progress message');
      return null;
    }

    try {
      const channel = await this.discordClient.channels.fetch(channelId);
      
      if (!channel || !channel.isTextBased()) {
        logger.warn('Discord channel not found or not text-based', { channelId });
        return null;
      }

      const sent = await (channel as any).send(message);
      
      return {
        platform: 'discord',
        chatId: channelId,
        messageId: sent.id,
        discordMessage: sent
      };
    } catch (error) {
      logger.error('Failed to send Discord progress message', error as Error);
      return null;
    }
  }

  /**
   * Edit progress message with final result
   */
  async edit(reference: MessageReference, newMessage: string): Promise<boolean> {
    try {
      if (reference.platform === 'whatsapp') {
        return await this.editWhatsApp(reference, newMessage);
      } else if (reference.platform === 'discord') {
        return await this.editDiscord(reference, newMessage);
      }
    } catch (error) {
      logger.error('Failed to edit progress message', error as Error, { 
        platform: reference.platform,
        messageId: reference.messageId 
      });
    }

    return false;
  }

  /**
   * Edit WhatsApp message
   */
  private async editWhatsApp(reference: MessageReference, newMessage: string): Promise<boolean> {
    if (!this.whatsappSocket) {
      logger.warn('WhatsApp socket not available for editing message');
      return false;
    }

    try {
      await this.whatsappSocket.sendMessage(reference.chatId, {
        text: newMessage,
        edit: reference.key
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to edit WhatsApp message', error as Error);
      return false;
    }
  }

  /**
   * Edit Discord message
   */
  private async editDiscord(reference: MessageReference, newMessage: string): Promise<boolean> {
    if (!this.discordClient) {
      logger.warn('Discord client not available for editing message');
      return false;
    }

    try {
      // Try to use cached message first
      if (reference.discordMessage) {
        await reference.discordMessage.edit(newMessage);
        return true;
      }

      // Fallback: fetch message and edit
      const channel = await this.discordClient.channels.fetch(reference.chatId);
      
      if (!channel || !channel.isTextBased()) {
        logger.warn('Discord channel not found or not text-based', { channelId: reference.chatId });
        return false;
      }

      const message = await (channel as any).messages.fetch(reference.messageId);
      await message.edit(newMessage);
      
      return true;
    } catch (error) {
      logger.error('Failed to edit Discord message', error as Error);
      return false;
    }
  }

  /**
   * Edit with embed (Discord only)
   */
  async editWithEmbed(reference: MessageReference, embedData: any): Promise<boolean> {
    if (reference.platform !== 'discord') {
      logger.warn('Embed editing only supported on Discord');
      return false;
    }

    if (!this.discordClient) {
      logger.warn('Discord client not available for editing message');
      return false;
    }

    try {
      const { EmbedBuilder } = await import('discord.js');
      const embed = new EmbedBuilder()
        .setTitle(embedData.title)
        .setColor(embedData.color)
        .setTimestamp();

      if (embedData.description) {
        embed.setDescription(embedData.description);
      }

      if (embedData.fields && embedData.fields.length > 0) {
        embed.addFields(embedData.fields);
      }

      // Try to use cached message first
      if (reference.discordMessage) {
        await reference.discordMessage.edit({ embeds: [embed] });
        return true;
      }

      // Fallback: fetch message and edit
      const channel = await this.discordClient.channels.fetch(reference.chatId);
      
      if (!channel || !channel.isTextBased()) {
        return false;
      }

      const message = await (channel as any).messages.fetch(reference.messageId);
      await message.edit({ embeds: [embed] });
      
      return true;
    } catch (error) {
      logger.error('Failed to edit Discord message with embed', error as Error);
      return false;
    }
  }

  /**
   * Delete progress message (if needed)
   */
  async delete(reference: MessageReference): Promise<boolean> {
    try {
      if (reference.platform === 'whatsapp') {
        return await this.deleteWhatsApp(reference);
      } else if (reference.platform === 'discord') {
        return await this.deleteDiscord(reference);
      }
    } catch (error) {
      logger.error('Failed to delete progress message', error as Error);
    }

    return false;
  }

  /**
   * Delete WhatsApp message
   */
  private async deleteWhatsApp(reference: MessageReference): Promise<boolean> {
    if (!this.whatsappSocket) {
      return false;
    }

    try {
      await this.whatsappSocket.sendMessage(reference.chatId, {
        delete: reference.key
      });
      return true;
    } catch (error) {
      logger.error('Failed to delete WhatsApp message', error as Error);
      return false;
    }
  }

  /**
   * Delete Discord message
   */
  private async deleteDiscord(reference: MessageReference): Promise<boolean> {
    if (!this.discordClient) {
      return false;
    }

    try {
      if (reference.discordMessage) {
        await reference.discordMessage.delete();
        return true;
      }

      const channel = await this.discordClient.channels.fetch(reference.chatId);
      if (!channel || !channel.isTextBased()) {
        return false;
      }

      const message = await (channel as any).messages.fetch(reference.messageId);
      await message.delete();
      
      return true;
    } catch (error) {
      logger.error('Failed to delete Discord message', error as Error);
      return false;
    }
  }
}

/**
 * Helper function to create progress message with auto-edit
 * 
 * Usage:
 * ```typescript
 * await withProgress(
 *   progressMessage,
 *   { platform: 'whatsapp', chatId: '123@s.whatsapp.net' },
 *   async (update) => {
 *     update('🔍 Mencari data...');
 *     const data = await fetchData();
 *     
 *     update('📊 Memproses data...');
 *     const result = await processData(data);
 *     
 *     return '✅ Selesai! ' + result;
 *   }
 * );
 * ```
 */
export async function withProgress(
  progressMessage: ProgressMessage,
  options: ProgressMessageOptions,
  operation: (update: (message: string) => Promise<void>) => Promise<string>
): Promise<void> {
  // Send initial progress message
  const reference = await progressMessage.send(options);
  
  if (!reference) {
    logger.warn('Failed to send progress message, operation will continue without progress updates');
    await operation(async () => {}); // No-op update function
    return;
  }

  try {
    // Create update function
    const update = async (message: string) => {
      await progressMessage.edit(reference, message);
    };

    // Execute operation with update callback
    const finalMessage = await operation(update);

    // Edit with final result
    await progressMessage.edit(reference, finalMessage);
  } catch (error) {
    // Edit with error message
    await progressMessage.edit(reference, '❌ Terjadi kesalahan: ' + (error as Error).message);
    throw error;
  }
}
