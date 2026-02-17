/**
 * Configuration Manager
 * Requirements: 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 18.1, 18.2
 */

import BotConfig from '../models/BotConfig';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

export interface AppConfig {
  // MongoDB
  mongodbUri: string;

  // Discord
  discordEnabled: boolean;
  discordBotToken?: string;
  discordClientId?: string;
  discordGuildId?: string;
  discordChannelId?: string;
  discordLogChannelId?: string;
  discordReminderChannelId?: string;
  discordActivityEnabled: boolean;
  discordActivityInterval: number;

  // WhatsApp
  whatsappEnabled: boolean;
  whatsappGroupId?: string;

  // AI Services
  groqApiKey?: string;
  groqModel: string;
  geminiApiKey?: string;
  geminiModel: string;
  aiTimeout: number;

  // Notion (Optional)
  notionEnabled: boolean;
  notionDatabaseId?: string;
  notionApiKey?: string;

  // Scheduler
  timezone: string;
  dailyReminderTime: string;
  weeklyReminderDay: number;
  weeklyReminderTime: string;

  // Logging
  logLevel: string;
  logDir: string;
}

/**
 * Configuration Manager
 * Loads configuration from environment variables and database
 */
export class ConfigManager {
  private config: AppConfig;
  private dbConfigCache: Map<string, string> = new Map();

  constructor() {
    this.config = this.loadFromEnvironment();
  }

  /**
   * Load configuration from environment variables
   */
  private loadFromEnvironment(): AppConfig {
    return {
      // MongoDB
      mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/multiplatform_class_bot',

      // Discord
      discordEnabled: process.env.DISCORD_ENABLED === 'true',
      discordBotToken: process.env.DISCORD_BOT_TOKEN,
      discordClientId: process.env.DISCORD_CLIENT_ID,
      discordGuildId: process.env.DISCORD_GUILD_ID,
      discordChannelId: process.env.DISCORD_CHANNEL_ID,
      discordLogChannelId: process.env.DISCORD_LOG_CHANNEL_ID,
      discordReminderChannelId: process.env.DISCORD_REMINDER_CHANNEL_ID,
      discordActivityEnabled: process.env.DISCORD_ACTIVITY_ENABLED !== 'false',
      discordActivityInterval: parseInt(process.env.DISCORD_ACTIVITY_INTERVAL || '5'),

      // WhatsApp
      whatsappEnabled: process.env.WHATSAPP_ENABLED === 'true',
      whatsappGroupId: process.env.WHATSAPP_GROUP_ID,

      // AI Services
      groqApiKey: process.env.GROQ_API_KEY,
      groqModel: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
      geminiApiKey: process.env.GEMINI_API_KEY,
      geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      aiTimeout: parseInt(process.env.AI_TIMEOUT || '10'),

      // Notion
      notionEnabled: process.env.NOTION_ENABLED === 'true',
      notionDatabaseId: process.env.NOTION_DATABASE_ID,
      notionApiKey: process.env.NOTION_API_KEY,

      // Scheduler
      timezone: process.env.TIMEZONE || 'Asia/Jakarta',
      dailyReminderTime: process.env.DAILY_REMINDER_TIME || '17:00',
      weeklyReminderDay: parseInt(process.env.WEEKLY_REMINDER_DAY || '5'),
      weeklyReminderTime: process.env.WEEKLY_REMINDER_TIME || '20:00',

      // Logging
      logLevel: process.env.LOG_LEVEL || 'info',
      logDir: process.env.LOG_DIR || './logs'
    };
  }

  /**
   * Get configuration value
   */
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  /**
   * Get all configuration
   */
  getAll(): AppConfig {
    return { ...this.config };
  }

  /**
   * Validate configuration
   * Requirement: 14.5, 14.6
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate MongoDB URI
    if (!this.config.mongodbUri) {
      errors.push('MONGODB_URI is required');
    }

    // Validate Discord configuration if enabled
    if (this.config.discordEnabled) {
      if (!this.config.discordBotToken) {
        errors.push('DISCORD_BOT_TOKEN is required when Discord is enabled');
      }
      if (!this.config.discordClientId) {
        errors.push('DISCORD_CLIENT_ID is required when Discord is enabled');
      }
      if (!this.config.discordGuildId) {
        errors.push('DISCORD_GUILD_ID is required when Discord is enabled');
      }
      if (!this.config.discordChannelId) {
        errors.push('DISCORD_CHANNEL_ID is required when Discord is enabled');
      }
    }

    // Validate WhatsApp configuration if enabled
    if (this.config.whatsappEnabled) {
      if (!this.config.whatsappGroupId) {
        // Group ID optional for first connection (will be shown in console)
        console.log('⚠️  WHATSAPP_GROUP_ID not set - bot will reply to any group');
        console.log('   Get Group ID from console after first connection');
      }
    }

    // At least one platform must be enabled
    if (!this.config.discordEnabled && !this.config.whatsappEnabled) {
      errors.push('At least one platform (Discord or WhatsApp) must be enabled');
    }

    // Validate AI configuration
    if (!this.config.groqApiKey && !this.config.geminiApiKey) {
      logger.warn('No AI API keys configured - AI features will be disabled');
    }

    // Validate scheduler times
    if (!this.isValidTime(this.config.dailyReminderTime)) {
      errors.push('DAILY_REMINDER_TIME must be in HH:MM format');
    }
    if (!this.isValidTime(this.config.weeklyReminderTime)) {
      errors.push('WEEKLY_REMINDER_TIME must be in HH:MM format');
    }
    if (this.config.weeklyReminderDay < 0 || this.config.weeklyReminderDay > 6) {
      errors.push('WEEKLY_REMINDER_DAY must be between 0 (Sunday) and 6 (Saturday)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate time format (HH:MM)
   */
  private isValidTime(time: string): boolean {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
  }

  /**
   * Load configuration from database
   * Requirement: 18.1, 18.2
   */
  async loadFromDatabase(): Promise<void> {
    try {
      const configs = await BotConfig.find({});

      for (const config of configs) {
        this.dbConfigCache.set(config.key, config.value);
      }

      logger.info(`Loaded ${configs.length} configuration entries from database`);
    } catch (error) {
      logger.error('Failed to load configuration from database', error as Error);
    }
  }

  /**
   * Get configuration value from database
   */
  async getFromDatabase(key: string, defaultValue?: string): Promise<string | undefined> {
    // Check cache first
    if (this.dbConfigCache.has(key)) {
      return this.dbConfigCache.get(key);
    }

    // Query database
    try {
      const config = await BotConfig.findOne({ key });
      if (config) {
        this.dbConfigCache.set(key, config.value);
        return config.value;
      }
    } catch (error) {
      logger.error(`Failed to get config key: ${key}`, error as Error);
    }

    return defaultValue;
  }

  /**
   * Set configuration value in database
   */
  async setInDatabase(key: string, value: string): Promise<void> {
    try {
      await BotConfig.findOneAndUpdate(
        { key },
        { value, updated_at: new Date() },
        { upsert: true, new: true }
      );

      this.dbConfigCache.set(key, value);
      logger.info(`Configuration updated: ${key}`);
    } catch (error) {
      logger.error(`Failed to set config key: ${key}`, error as Error);
      throw error;
    }
  }

  /**
   * Initialize default configuration in database
   * Requirement: 14.2, 14.3, 14.4
   */
  async initializeDefaults(): Promise<void> {
    const defaults = [
      { key: 'daily_reminder_time', value: this.config.dailyReminderTime },
      { key: 'weekly_reminder_day', value: this.config.weeklyReminderDay.toString() },
      { key: 'weekly_reminder_time', value: this.config.weeklyReminderTime },
      { key: 'timezone', value: this.config.timezone },
      { key: 'ai_timeout', value: this.config.aiTimeout.toString() }
    ];

    for (const { key, value } of defaults) {
      const existing = await BotConfig.findOne({ key });
      if (!existing) {
        await BotConfig.create({ key, value });
        logger.info(`Created default config: ${key} = ${value}`);
      }
    }
  }

  /**
   * Create first admin from environment variables
   * This is used to bootstrap the first admin user
   * Supports creating admin for Discord and/or WhatsApp
   */
  async createFirstAdmin(): Promise<void> {
    const discordId = process.env.FIRST_ADMIN_DISCORD_ID;
    const whatsappId = process.env.FIRST_ADMIN_WHATSAPP_ID;
    const role = process.env.FIRST_ADMIN_ROLE || 'ketua';

    if (!discordId && !whatsappId) {
      logger.info('No first admin configured - skipping first admin creation');
      return;
    }

    try {
      // Import Admin model dynamically to avoid circular dependency
      const Admin = (await import('../models/Admin')).default;

      // Create Discord admin if configured
      if (discordId) {
        const existingDiscord = await Admin.findOne({
          user_identifier: discordId,
          platform: 'discord'
        });

        if (existingDiscord) {
          logger.info(`Discord admin already exists: ${discordId}`);
        } else {
          await Admin.create({
            user_identifier: discordId,
            platform: 'discord',
            role,
            nama: 'Admin Discord',
            is_active: true
          });

          logger.info(`✅ Discord admin created: ${discordId} with role ${role}`);
          console.log(`\n✅ Admin Discord berhasil dibuat!`);
          console.log(`   User ID: ${discordId}`);
          console.log(`   Platform: Discord`);
          console.log(`   Role: ${role}\n`);
        }
      }

      // Create WhatsApp admin if configured
      if (whatsappId) {
        const existingWhatsApp = await Admin.findOne({
          user_identifier: whatsappId,
          platform: 'whatsapp'
        });

        if (existingWhatsApp) {
          logger.info(`WhatsApp admin already exists: ${whatsappId}`);
        } else {
          await Admin.create({
            user_identifier: whatsappId,
            platform: 'whatsapp',
            role,
            nama: 'Admin WhatsApp',
            is_active: true
          });

          logger.info(`✅ WhatsApp admin created: ${whatsappId} with role ${role}`);
          console.log(`\n✅ Admin WhatsApp berhasil dibuat!`);
          console.log(`   User ID: ${whatsappId}`);
          console.log(`   Platform: WhatsApp`);
          console.log(`   Role: ${role}\n`);
        }
      }
    } catch (error) {
      logger.error('Failed to create first admin', error as Error);
      console.error('❌ Gagal membuat admin pertama:', error);
    }
  }

  /**
   * Clear database configuration cache
   */
  clearCache(): void {
    this.dbConfigCache.clear();
    logger.info('Configuration cache cleared');
  }
}

// Singleton instance
let configManager: ConfigManager | null = null;

/**
 * Get ConfigManager instance
 */
export function getConfigManager(): ConfigManager {
  if (!configManager) {
    configManager = new ConfigManager();
  }
  return configManager;
}

/**
 * Initialize ConfigManager
 */
export async function initializeConfig(): Promise<ConfigManager> {
  const manager = getConfigManager();

  // Validate environment configuration
  const validation = manager.validate();
  if (!validation.valid) {
    logger.error('Configuration validation failed:', new Error(validation.errors.join(', ')));
    throw new Error(`Configuration validation failed:\n${validation.errors.join('\n')}`);
  }

  // Load from database
  await manager.loadFromDatabase();

  // Initialize defaults
  await manager.initializeDefaults();

  // Create first admin if configured
  await manager.createFirstAdmin();

  logger.info('Configuration manager initialized');
  return manager;
}
