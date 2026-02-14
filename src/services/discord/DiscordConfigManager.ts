/**
 * Discord Configuration Manager
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 8.1, 8.6, 8.7
 */

import { getDiscordConfig } from '../../config/discord.config';
import {
  DiscordConfig,
  EmojiKey,
  ValidationResult
} from '../../types/discord.types';
import { getLogger } from '../../utils/Logger';

const logger = getLogger();

/**
 * Discord Configuration Manager Service
 * Manages all Discord-specific configuration
 */
export class DiscordConfigManager {
  private config: DiscordConfig;

  constructor() {
    this.config = getDiscordConfig();
  }

  /**
   * Get emoji by key
   * Requirement: 7.2, 7.4
   */
  getEmoji(key: EmojiKey): string {
    const emoji = this.config.emojis[key];
    if (!emoji) {
      logger.warn(`Emoji not found for key: ${key}`);
      return ''; // Return empty string if not found
    }
    return emoji;
  }

  /**
   * Get info channel ID
   * Requirement: 7.7
   */
  getInfoChannelId(): string {
    return this.config.channels.info;
  }

  /**
   * Get command channel ID
   * Requirement: 7.7
   */
  getCommandChannelId(): string {
    return this.config.channels.command;
  }

  /**
   * Get embed color
   * Requirement: 7.5
   */
  getEmbedColor(): string {
    return this.config.embed.color;
  }

  /**
   * Get footer icon URL
   * Requirement: 7.6
   */
  getFooterIcon(): string {
    return this.config.embed.footer.icon;
  }

  /**
   * Get footer text with server name
   * Requirement: 7.6
   */
  getFooterText(serverName: string): string {
    return `${this.config.embed.footer.text} • ${serverName}`;
  }

  /**
   * Get activity templates (returns as-is from config)
   * Requirement: 8.1
   */
  getActivityTemplates(): any[] {
    // Convert string types to numbers for ActivityStatusService
    return this.config.activity.templates.map(template => ({
      ...template,
      type: this.convertActivityTypeToNumber(template.type)
    }));
  }

  /**
   * Convert activity type string to number
   */
  private convertActivityTypeToNumber(type?: string): 0 | 1 | 2 | 3 | 5 | undefined {
    if (!type) return undefined;
    
    const typeMap: Record<string, 0 | 1 | 2 | 3 | 5> = {
      'PLAYING': 0,
      'STREAMING': 1,
      'LISTENING': 2,
      'WATCHING': 3,
      'COMPETING': 5
    };
    
    return typeMap[type];
  }

  /**
   * Get activity interval in milliseconds
   * Requirement: 8.6
   */
  getActivityInterval(): number {
    return this.config.activity.interval * 60 * 1000; // Convert minutes to milliseconds
  }

  /**
   * Get activity type
   * Requirement: 8.7
   */
  getActivityType(): 'WATCHING' | 'PLAYING' | 'LISTENING' | 'COMPETING' {
    return this.config.activity.type;
  }

  /**
   * Check if activity is enabled
   * Requirement: 8.1
   */
  isActivityEnabled(): boolean {
    return this.config.activity.enabled;
  }

  /**
   * Get general rate limit in seconds
   */
  getGeneralRateLimit(): number {
    return this.config.rateLimits.general;
  }

  /**
   * Get command channel rate limit in seconds
   */
  getCommandRateLimit(): number {
    return this.config.rateLimits.command;
  }

  /**
   * Validate emoji format
   * Requirement: 7.4
   */
  private validateEmojiFormat(emoji: string): boolean {
    // Animated emoji format: <a:name:ID>
    const animatedEmojiRegex = /^<a:[a-zA-Z0-9_]+:\d+>$/;
    return animatedEmojiRegex.test(emoji);
  }

  /**
   * Validate hex color format
   * Requirement: 7.5
   */
  private validateHexColor(color: string): boolean {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    return hexColorRegex.test(color);
  }

  /**
   * Validate channel ID (Discord snowflake)
   * Requirement: 7.7
   */
  private validateChannelId(channelId: string): boolean {
    // Discord snowflakes are 17-19 digit numbers
    const snowflakeRegex = /^\d{17,19}$/;
    return snowflakeRegex.test(channelId);
  }

  /**
   * Validate all emojis
   * Requirement: 7.4, 7.8
   */
  validateEmojis(): ValidationResult {
    const errors: string[] = [];
    const emojiKeys: EmojiKey[] = [
      'online',
      'offline',
      'clock',
      'loading',
      'calendar',
      'task',
      'individual',
      'group',
      'success',
      'error'
    ];

    for (const key of emojiKeys) {
      const emoji = this.config.emojis[key];
      if (!emoji) {
        errors.push(`Missing emoji configuration for: ${key}`);
      } else if (!this.validateEmojiFormat(emoji)) {
        errors.push(`Invalid emoji format for ${key}: ${emoji} (expected format: <a:name:ID>)`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate complete configuration
   * Requirement: 4.6, 7.8, 7.9
   */
  validateConfig(): ValidationResult {
    const errors: string[] = [];

    // Validate channels
    if (!this.config.channels.info) {
      errors.push('Missing info channel ID');
    } else if (!this.validateChannelId(this.config.channels.info)) {
      errors.push(`Invalid info channel ID: ${this.config.channels.info}`);
    }

    if (!this.config.channels.command) {
      errors.push('Missing command channel ID');
    } else if (!this.validateChannelId(this.config.channels.command)) {
      errors.push(`Invalid command channel ID: ${this.config.channels.command}`);
    }

    // Validate emojis
    const emojiValidation = this.validateEmojis();
    if (!emojiValidation.valid) {
      errors.push(...emojiValidation.errors);
    }

    // Validate embed color
    if (!this.config.embed.color) {
      errors.push('Missing embed color');
    } else if (!this.validateHexColor(this.config.embed.color)) {
      errors.push(`Invalid embed color format: ${this.config.embed.color} (expected format: #RRGGBB)`);
    }

    // Validate footer
    if (!this.config.embed.footer.icon) {
      errors.push('Missing footer icon URL');
    }

    if (!this.config.embed.footer.text) {
      errors.push('Missing footer text');
    }

    // Validate activity configuration
    if (this.config.activity.enabled) {
      if (!this.config.activity.templates || this.config.activity.templates.length === 0) {
        errors.push('Activity enabled but no templates configured');
      }

      if (this.config.activity.interval <= 0) {
        errors.push('Activity interval must be greater than 0');
      }

      const validTypes = ['WATCHING', 'PLAYING', 'LISTENING', 'COMPETING'];
      if (!validTypes.includes(this.config.activity.type)) {
        errors.push(`Invalid activity type: ${this.config.activity.type}`);
      }
    }

    // Validate rate limits
    if (this.config.rateLimits.general <= 0) {
      errors.push('General rate limit must be greater than 0');
    }

    if (this.config.rateLimits.command <= 0) {
      errors.push('Command rate limit must be greater than 0');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get full configuration
   */
  getConfig(): DiscordConfig {
    return this.config;
  }
}
