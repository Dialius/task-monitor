/**
 * Discord Type Definitions
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7
 */

/**
 * Emoji keys for Discord configuration
 */
export type EmojiKey =
  | 'online'
  | 'offline'
  | 'clock'
  | 'loading'
  | 'calendar'
  | 'task'
  | 'individual'
  | 'group'
  | 'success'
  | 'error';

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Task statistics interface
 */
export interface TaskStatistics {
  activeCount: number;
  completedCount: number;
  individuCount: number;
  kelompokCount: number;
  lastUpdated: Date;
}

/**
 * Discord emoji configuration
 */
export interface DiscordEmojiConfig {
  online: string;
  offline: string;
  clock: string;
  loading: string;
  calendar: string;
  task: string;
  individual: string;
  group: string;
  success: string;
  error: string;
}

/**
 * Discord channel configuration
 */
export interface DiscordChannelConfig {
  info: string;
  command: string;
}

/**
 * Discord embed configuration
 */
export interface DiscordEmbedConfig {
  color: string;
  footer: {
    icon: string;
    text: string;
  };
}

/**
 * Activity template configuration
 */
export interface ActivityTemplate {
  text: string;
  dynamic: boolean;
  type?: 'WATCHING' | 'PLAYING' | 'LISTENING' | 'COMPETING'; // Optional per-template type
}

/**
 * Discord activity configuration
 */
export interface DiscordActivityConfig {
  enabled: boolean;
  interval: number;
  type: 'WATCHING' | 'PLAYING' | 'LISTENING' | 'COMPETING';
  templates: ActivityTemplate[];
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  general: number;
  command: number;
}

/**
 * Main Discord configuration interface
 */
export interface DiscordConfig {
  channels: DiscordChannelConfig;
  emojis: DiscordEmojiConfig;
  embed: DiscordEmbedConfig;
  activity: DiscordActivityConfig;
  rateLimits: RateLimitConfig;
}

/**
 * Rate limit entry
 */
export interface RateLimitEntry {
  userId: string;
  context: 'general' | 'command';
  timestamp: number;
  expiresAt: number;
}

/**
 * Cooldown result
 */
export interface CooldownResult {
  allowed: boolean;
  remainingSeconds?: number;
}

/**
 * Embed message reference
 */
export interface EmbedMessageReference {
  messageId: string;
  channelId: string;
  createdAt: Date;
  lastUpdated: Date;
}
