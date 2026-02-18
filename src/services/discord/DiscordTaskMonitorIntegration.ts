/**
 * Discord Task Monitor Integration
 * 
 * Integrates all Discord Task Monitor services with the Discord client.
 * Handles initialization, button interactions, and service lifecycle.
 */

import { Client, ButtonInteraction } from 'discord.js';
import { DiscordConfigManager } from './DiscordConfigManager';
import { RateLimiter } from './RateLimiter';
import { TaskMonitorService } from './TaskMonitorService';
import { ButtonInteractionHandler } from './ButtonInteractionHandler';
import { TaskService } from '../TaskService';
import { ScheduleService } from '../ScheduleService';
import { AnnouncementService } from '../AnnouncementService';
import { NotionService } from '../NotionService';
import { AIService } from '../AIService';
import { PiketService } from '../PiketService';
import { HolidayService } from '../HolidayService';
import { getLogger } from '../../utils/Logger';

const logger = getLogger();

export class DiscordTaskMonitorIntegration {
  private readonly client: Client;
  private readonly taskService: TaskService;
  private readonly scheduleService: ScheduleService;
  private readonly announcementService: AnnouncementService;

  private readonly notionService: NotionService;
  private readonly aiService: AIService;
  private readonly piketService: PiketService;
  private readonly holidayService: HolidayService;

  private configManager!: DiscordConfigManager;
  private rateLimiter!: RateLimiter;
  private taskMonitorService!: TaskMonitorService;
  private buttonHandler!: ButtonInteractionHandler;

  private isInitialized = false;

  constructor(
    client: Client,
    taskService: TaskService,
    scheduleService: ScheduleService,
    announcementService: AnnouncementService,
    notionService: NotionService,
    aiService: AIService,
    piketService: PiketService,
    holidayService: HolidayService
  ) {
    this.client = client;
    this.taskService = taskService;
    this.scheduleService = scheduleService;
    this.announcementService = announcementService;
    this.notionService = notionService;
    this.aiService = aiService;
    this.piketService = piketService;
    this.holidayService = holidayService;
  }

  /**
   * Initialize all Discord Task Monitor services
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Discord Task Monitor Integration');

      // Step 1: Load and validate configuration
      this.configManager = new DiscordConfigManager();

      const validation = this.configManager.validateConfig();
      if (!validation.valid) {
        logger.error('Discord configuration validation failed', new Error(validation.errors.join(', ')));
        throw new Error(`Discord configuration invalid: ${validation.errors.join(', ')}`);
      }

      logger.info('Discord configuration validated successfully');

      // Step 2: Initialize services
      this.rateLimiter = new RateLimiter(
        this.configManager.getGeneralRateLimit(),
        this.configManager.getCommandRateLimit()
      );

      this.taskMonitorService = new TaskMonitorService(
        this.client,
        this.taskService,
        this.configManager
      );

      this.buttonHandler = new ButtonInteractionHandler(
        this.taskService,
        this.scheduleService,
        this.announcementService,
        this.notionService,
        this.aiService,
        this.piketService,
        this.holidayService,
        this.configManager,
        this.rateLimiter
      );

      logger.info('All Discord Task Monitor services initialized');

      // Step 3: Register button interaction listeners
      this.registerButtonInteractionListeners();

      // Step 4: Initialize Task Monitor (create/update embed)
      await this.taskMonitorService.initialize();

      // Step 5: Start auto-update
      this.taskMonitorService.startAutoUpdate();

      this.isInitialized = true;
      logger.info('Discord Task Monitor Integration initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Discord Task Monitor Integration:', error as Error);
      throw error;
    }
  }

  /**
   * Register button interaction listeners
   */
  private registerButtonInteractionListeners(): void {
    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isButton()) return;

      // Only handle Task Monitor buttons
      if (!['tasks_week', 'tasks_tomorrow'].includes(interaction.customId)) {
        return;
      }

      try {
        await this.buttonHandler.handleButtonClick(interaction as ButtonInteraction);
      } catch (error) {
        logger.error('Error handling button interaction:', error as Error);
      }
    });

    logger.info('Button interaction listeners registered');
  }

  /**
   * Shutdown all services
   */
  async shutdown(): Promise<void> {
    try {
      logger.info('Shutting down Discord Task Monitor Integration');

      if (this.taskMonitorService) {
        this.taskMonitorService.stopAutoUpdate();
      }

      this.isInitialized = false;
      logger.info('Discord Task Monitor Integration shut down successfully');
    } catch (error) {
      logger.error('Error during shutdown', error as Error);
    }
  }

  /**
   * Check if integration is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get config manager instance
   */
  getConfigManager(): DiscordConfigManager {
    return this.configManager;
  }

  /**
   * Get task monitor service instance
   */
  getTaskMonitorService(): TaskMonitorService {
    return this.taskMonitorService;
  }

  /**
   * Get rate limiter instance
   */
  getRateLimiter(): RateLimiter {
    return this.rateLimiter;
  }

  /**
   * Manually trigger embed update
   */
  async updateTaskMonitor(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Discord Task Monitor Integration not initialized');
    }

    await this.taskMonitorService.updateEmbed();
  }
}
