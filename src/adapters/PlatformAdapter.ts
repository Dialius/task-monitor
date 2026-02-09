/**
 * Platform Adapter Interface
 * Requirements: 16.1, 16.2
 * 
 * This interface abstracts platform-specific operations to keep business logic platform-independent.
 */

export interface MessageContext {
  messageId: string;
  userId: string;
  userName: string;
  channelId: string;
  guildId?: string; // Discord only
  groupId?: string; // WhatsApp only
  content: string;
  timestamp: Date;
  platform: 'discord' | 'whatsapp';
}

export interface TaskListOptions {
  tasks: any[];
  showButtons?: boolean; // Discord only
}

export interface ScheduleOptions {
  schedules: any[];
  useEmbeds?: boolean; // Discord only
}

export interface AnnouncementOptions {
  announcement: any;
  urgent?: boolean;
}

/**
 * Platform Adapter Interface
 * Provides unified interface for Discord and WhatsApp operations
 */
export interface PlatformAdapter {
  /**
   * Get platform name
   */
  getPlatformName(): 'discord' | 'whatsapp';

  /**
   * Send a simple text message
   * @param channelId - Target channel/group ID
   * @param message - Message text
   */
  sendMessage(channelId: string, message: string): Promise<void>;

  /**
   * Send message with user mentions
   * @param channelId - Target channel/group ID
   * @param message - Message text
   * @param userIds - Array of user IDs to mention
   */
  sendMessageWithMentions(
    channelId: string,
    message: string,
    userIds: string[]
  ): Promise<void>;

  /**
   * Send formatted task list
   * @param channelId - Target channel/group ID
   * @param options - Task list options
   */
  sendTaskList(channelId: string, options: TaskListOptions): Promise<void>;

  /**
   * Send formatted schedule
   * @param channelId - Target channel/group ID
   * @param options - Schedule options
   */
  sendSchedule(channelId: string, options: ScheduleOptions): Promise<void>;

  /**
   * Send formatted announcement
   * @param channelId - Target channel/group ID
   * @param options - Announcement options
   */
  sendAnnouncement(
    channelId: string,
    options: AnnouncementOptions
  ): Promise<void>;

  /**
   * Get user identifier from message context
   * @param context - Message context
   * @returns Platform-specific user identifier (Discord user ID or WhatsApp phone number)
   */
  getUserIdentifier(context: MessageContext): string;

  /**
   * Format user mention
   * @param userId - User identifier
   * @returns Platform-specific mention string
   */
  formatMention(userId: string): string;

  /**
   * Check if user has admin role (platform-specific)
   * @param userId - User identifier
   * @param guildId - Guild ID (Discord only)
   * @returns True if user has admin role
   */
  hasAdminRole(userId: string, guildId?: string): Promise<boolean>;
}
