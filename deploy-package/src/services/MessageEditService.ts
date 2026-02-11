/**
 * Message Edit Service
 * Automatically edit messages when tasks are updated
 */

import { ITask } from '../models/Task';
import { getLogger } from '../utils/Logger';
import MessageTrackingService from './MessageTrackingService';

const logger = getLogger();

export interface MessageEditResult {
  success: boolean;
  platform: 'whatsapp' | 'discord';
  messageId: string;
  error?: string;
}

/**
 * Message Edit Service
 */
export class MessageEditService {
  private whatsappSock: any;
  private discordClient: any;

  /**
   * Initialize with WhatsApp and Discord clients
   */
  initialize(whatsappSock: any, discordClient: any) {
    this.whatsappSock = whatsappSock;
    this.discordClient = discordClient;
    logger.info('MessageEditService initialized');
  }

  /**
   * Edit all messages for a task
   */
  async editTaskMessages(
    task: ITask,
    formatWhatsAppMessage: (task: ITask) => string,
    formatDiscordEmbed: (task: ITask) => any
  ): Promise<MessageEditResult[]> {
    const results: MessageEditResult[] = [];

    if (!task.sent_messages || task.sent_messages.length === 0) {
      logger.info('No messages to edit for task', { taskId: task._id });
      return results;
    }

    for (const sentMsg of task.sent_messages) {
      try {
        if (sentMsg.platform === 'whatsapp') {
          const result = await this.editWhatsAppMessage(
            sentMsg.chat_id,
            sentMsg.message_id,
            formatWhatsAppMessage(task)
          );
          results.push(result);
        } else if (sentMsg.platform === 'discord') {
          const result = await this.editDiscordMessage(
            sentMsg.chat_id,
            sentMsg.message_id,
            formatDiscordEmbed(task)
          );
          results.push(result);
        }

        // Update edit tracking if successful
        if (results[results.length - 1].success) {
          await MessageTrackingService.updateEditTracking(
            task._id.toString(),
            sentMsg.message_id
          );
        }
      } catch (error) {
        logger.error('Failed to edit message', error as Error, {
          taskId: task._id,
          platform: sentMsg.platform,
          messageId: sentMsg.message_id
        });

        results.push({
          success: false,
          platform: sentMsg.platform,
          messageId: sentMsg.message_id,
          error: (error as Error).message
        });
      }
    }

    return results;
  }

  /**
   * Edit WhatsApp message
   */
  private async editWhatsAppMessage(
    chatId: string,
    messageId: string,
    newText: string
  ): Promise<MessageEditResult> {
    try {
      if (!this.whatsappSock) {
        throw new Error('WhatsApp client not initialized');
      }

      // WhatsApp edit message format
      await this.whatsappSock.sendMessage(chatId, {
        edit: {
          id: messageId,
          remoteJid: chatId,
          fromMe: true
        },
        text: newText
      });

      logger.info('WhatsApp message edited successfully', {
        chatId,
        messageId
      });

      return {
        success: true,
        platform: 'whatsapp',
        messageId
      };
    } catch (error) {
      logger.error('Failed to edit WhatsApp message', error as Error, {
        chatId,
        messageId
      });

      return {
        success: false,
        platform: 'whatsapp',
        messageId,
        error: (error as Error).message
      };
    }
  }

  /**
   * Edit Discord message
   */
  private async editDiscordMessage(
    channelId: string,
    messageId: string,
    newEmbed: any
  ): Promise<MessageEditResult> {
    try {
      if (!this.discordClient) {
        throw new Error('Discord client not initialized');
      }

      const channel = await this.discordClient.channels.fetch(channelId);
      if (!channel || !channel.isTextBased()) {
        throw new Error('Invalid Discord channel');
      }

      const message = await channel.messages.fetch(messageId);
      await message.edit({ embeds: [newEmbed] });

      logger.info('Discord message edited successfully', {
        channelId,
        messageId
      });

      return {
        success: true,
        platform: 'discord',
        messageId
      };
    } catch (error) {
      logger.error('Failed to edit Discord message', error as Error, {
        channelId,
        messageId
      });

      return {
        success: false,
        platform: 'discord',
        messageId,
        error: (error as Error).message
      };
    }
  }

  /**
   * Check if message can be edited (for future use if needed)
   */
  canEditMessage(_sentAt: Date, _platform: 'whatsapp' | 'discord'): boolean {
    // WhatsApp: Can edit channel/group messages anytime
    // Discord: Can edit anytime
    // Both platforms support editing without time limit for our use case
    return true;
  }
}

export default new MessageEditService();
