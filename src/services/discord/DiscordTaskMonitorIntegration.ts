/**
 * Discord Task Monitor Integration
 * 
 * Integrates all Discord Task Monitor services with the Discord client.
 * Handles initialization, button interactions, and service lifecycle.
 */

import { Client, ButtonInteraction } from 'discord.js';
import { discordConfig } from '../../config/discord.config';
import { DiscordConfigManager } from './DiscordConfigManager';
import { RateLimiter } from './RateLimiter';
import { LoadingMessageManager } from './LoadingMessageManager';
import { TaskMonitorService } from './TaskMonitorService';
import { ButtonInteractionHandler } from './ButtonInteractionHandler';
import { TaskService } from '../TaskService';
import Logger from '../../utils/Logger';

export class DiscordTaskMonitorIntegration {
  private readonly client: Client;
  private readonly taskService: TaskService;
  private readonly logger = Logger;
  
  private configManager!: DiscordConfigManager;
  private rateLimiter!: RateLimiter;
  private loadingManager!: LoadingMessageManager;
  private taskMonitorService!: TaskMonitorService;
  private buttonHandler!: ButtonInteractionHandler;
  
  private isInitialized = false;

  constructor(client: Client, taskService: TaskService) {
    this.client = client;
    this.taskService = taskService;
  }

  /**
   * Initialize all Discord Task Monitor services
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Discord Task Monitor Integration');
      
      // Step 1: Load and validate configuration
      this.configManager = new DiscordConfigManager(discordConfig);
      
      const validation = this.configManager.validateConfig();
      if (!validation.valid) {
        this.logger.error('Discord configuration validation failed:', {
          errors: validation.errors
        });
        throw new Error(`Discord configuration invalid: ${validation.errors.join(', ')}`);
      }
      
      this.logger.info('Discord configuration validated successfully');
      
      // Step 2: Initialize services
      this.rateLimiter = new RateLimiter(this.configManager);
      this.rateLimiter.startCleanup();
      
      this.loadingManager = new LoadingMessageManager(this.configManager);
      
      this.taskMonitorService = new TaskMonitorService(
        this.client,
        this.taskService,
        this.configManager
      );
      
      this.buttonHandler = new ButtonInteractionHandler(
        this.taskService,
        this.configManager,
        this.rateLimiter,
        this.loadingManager
      );
      
      this.logger.info('All Discord Task Monitor services initialized');
      
      // Step 3: Register button interaction listeners
      this.registerButtonInteractionListeners();
      
      // Step 4: Initialize Task Monitor (create/update embed)
      await this.taskMonitorService.initialize();
      
      // Step 5: Start auto-update
      this.taskMonitorService.startAutoUpdate();
      
      this.isInitialized = true;
      this.logger.info('Discord Task Monitor Integration initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Discord Task Monitor Integration:', error);
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
        this.logger.error('Error handling button interaction:', error);
      }
    });
    
    this.logger.info('Button interaction listeners registered');
  }

  /**
   * Shutdown all services
   */
  async shutdown(): Promise<void> {
    try {
      this.logger.info('Shutting down Discord Task Monitor Integration');
      
      if (this.taskMonitorService) {
        this.taskMonitorService.stopAutoUpdate();
      }
      
      if (this.rateLimiter) {
        this.rateLimiter.stopCleanup();
      }
      
      this.isInitialized = false;
      this.logger.info('Discord Task Monitor Integration shut down successfully');
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
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
