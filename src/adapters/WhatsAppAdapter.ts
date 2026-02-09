/**
 * WhatsApp Platform Adapter
 * Requirements: 16.5, 16.7, 19.2, 19.4, 19.6
 */

import {
  PlatformAdapter,
  MessageContext,
  TaskListOptions,
  ScheduleOptions,
  AnnouncementOptions
} from './PlatformAdapter';
import { Formatter } from '../utils/Formatter';

/**
 * WhatsApp Adapter implementing PlatformAdapter interface
 * Uses Baileys client for WhatsApp Web integration
 */
export class WhatsAppAdapter implements PlatformAdapter {
  private client: any; // Baileys client type

  constructor(client: any) {
    this.client = client;
  }

  /**
   * Get platform name
   */
  getPlatformName(): 'whatsapp' {
    return 'whatsapp';
  }

  /**
   * Send simple text message
   * Requirement: 16.2
   */
  async sendMessage(channelId: string, message: string): Promise<void> {
    await this.client.sendMessage(channelId, { text: message });
  }

  /**
   * Send message with WhatsApp mentions
   * Requirement: 19.6
   */
  async sendMessageWithMentions(
    channelId: string,
    message: string,
    userIds: string[]
  ): Promise<void> {
    // WhatsApp mentions format: @phone_number
    const mentions = userIds.map(id => `${id}@s.whatsapp.net`);
    
    await this.client.sendMessage(channelId, {
      text: message,
      mentions: mentions
    });
  }

  /**
   * Send formatted task list (WhatsApp text format)
   * Requirement: 19.2
   */
  async sendTaskList(channelId: string, options: TaskListOptions): Promise<void> {
    const formattedMessage = Formatter.formatTaskList(options.tasks);
    await this.sendMessage(channelId, formattedMessage);
  }

  /**
   * Send formatted schedule (WhatsApp text format)
   * Requirement: 19.4
   */
  async sendSchedule(channelId: string, options: ScheduleOptions): Promise<void> {
    const formattedMessage = Formatter.formatSchedule(options.schedules);
    await this.sendMessage(channelId, formattedMessage);
  }

  /**
   * Send formatted announcement (WhatsApp text format)
   * Requirement: 19.8
   */
  async sendAnnouncement(
    channelId: string,
    options: AnnouncementOptions
  ): Promise<void> {
    let message = Formatter.formatAnnouncement(options.announcement);
    
    if (options.urgent) {
      message = `🚨 *URGENT* 🚨\n\n${message}`;
    }
    
    await this.sendMessage(channelId, message);
  }

  /**
   * Get WhatsApp phone number from message context
   * Requirement: 16.4
   */
  getUserIdentifier(context: MessageContext): string {
    // Extract phone number from WhatsApp JID format
    // Format: phone_number@s.whatsapp.net
    return context.userId.split('@')[0];
  }

  /**
   * Format WhatsApp mention
   * Requirement: 19.6
   */
  formatMention(userId: string): string {
    // WhatsApp mention format: @phone_number
    return `@${userId}`;
  }

  /**
   * Check admin role (WhatsApp uses database only, no platform roles)
   * Requirement: 1.9
   */
  async hasAdminRole(_userId: string): Promise<boolean> {
    // WhatsApp doesn't have built-in roles
    // This will be handled by PermissionService checking database
    return false;
  }
}
