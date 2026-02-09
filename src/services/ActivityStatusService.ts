/**
 * Activity Status Service
 * Manages rotating activity status for Discord bot
 */

import { Client } from 'discord.js';
import { TaskService } from './TaskService';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

export interface ActivityConfig {
  enabled: boolean;
  rotationInterval: number; // in minutes
  activities: ActivityTemplate[];
}

export interface ActivityTemplate {
  type: 0 | 1 | 2 | 3 | 5; // 0: Playing, 1: Streaming, 2: Listening, 3: Watching, 5: Competing
  text: string;
  dynamic?: boolean; // if true, will fetch real-time data
  dataSource?: 'tasks_today' | 'tasks_week' | 'tasks_total' | 'tasks_urgent';
}

/**
 * Service for managing Discord bot activity status rotation
 */
export class ActivityStatusService {
  private client: Client;
  private taskService: TaskService;
  private config: ActivityConfig;
  private intervalId?: NodeJS.Timeout;
  private currentIndex: number = 0;

  constructor(client: Client, taskService: TaskService, config: ActivityConfig) {
    this.client = client;
    this.taskService = taskService;
    this.config = config;
  }

  /**
   * Start rotating activity status
   */
  start(): void {
    if (!this.config.enabled) {
      logger.info('Activity status rotation is disabled');
      console.log('ℹ️  Activity status rotation is disabled');
      return;
    }

    if (this.intervalId) {
      logger.warn('Activity status rotation is already running');
      return;
    }

    // Set initial status immediately
    this.updateStatus();

    // Set interval for rotation
    const intervalMs = this.config.rotationInterval * 60 * 1000;
    this.intervalId = setInterval(() => {
      this.updateStatus();
    }, intervalMs);

    logger.info('Activity status rotation started', {
      interval: this.config.rotationInterval,
      activitiesCount: this.config.activities.length
    });
    
    console.log(`✅ Activity status rotation started`);
    console.log(`   → Interval: ${this.config.rotationInterval} minutes`);
    console.log(`   → Total activities: ${this.config.activities.length}`);
  }

  /**
   * Stop rotating activity status
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      logger.info('Activity status rotation stopped');
      console.log('⏹️  Activity status rotation stopped');
    }
  }

  /**
   * Update bot activity status
   */
  private async updateStatus(): Promise<void> {
    try {
      if (!this.client.user) {
        logger.warn('Client user not available, skipping status update');
        return;
      }

      const activity = this.config.activities[this.currentIndex];
      const statusText = await this.processActivityText(activity);

      await this.client.user.setPresence({
        activities: [{
          name: statusText,
          type: activity.type // Discord.js accepts number directly
        }],
        status: 'online'
      });

      // Get activity type name for logging
      const activityTypeName = this.getActivityTypeName(activity.type);
      
      logger.info('Activity status updated', {
        type: activity.type,
        typeName: activityTypeName,
        text: statusText,
        index: this.currentIndex,
        nextIndex: (this.currentIndex + 1) % this.config.activities.length
      });

      // Console log for easy visibility
      console.log(`🔄 Activity Status: ${activityTypeName} ${statusText}`);

      // Move to next activity
      this.currentIndex = (this.currentIndex + 1) % this.config.activities.length;
    } catch (error) {
      logger.error('Failed to update activity status', error as Error);
      console.error('❌ Failed to update activity status:', error);
    }
  }

  /**
   * Process activity text with dynamic data
   */
  private async processActivityText(activity: ActivityTemplate): Promise<string> {
    if (!activity.dynamic || !activity.dataSource) {
      return activity.text;
    }

    try {
      let count = 0;

      switch (activity.dataSource) {
        case 'tasks_today':
          const tasksToday = await this.taskService.getTasksForToday();
          count = tasksToday.length;
          break;

        case 'tasks_week':
          const tasksWeek = await this.taskService.getTasksForWeek();
          count = tasksWeek.length;
          break;

        case 'tasks_total':
          const tasksTotal = await this.taskService.getTasks({ status: 'aktif' });
          count = tasksTotal.length;
          break;

        case 'tasks_urgent':
          const tasksUrgent = await this.taskService.getTasks({ 
            status: 'aktif',
            prioritas: 'urgent'
          });
          count = tasksUrgent.length;
          break;

        default:
          logger.warn(`Unknown data source: ${activity.dataSource}`);
      }

      // Replace placeholder with actual count
      return activity.text.replace('{count}', count.toString());
    } catch (error) {
      logger.error('Failed to process dynamic activity text', error as Error);
      return activity.text.replace('{count}', '0');
    }
  }

  /**
   * Get activity type name for logging
   */
  private getActivityTypeName(type: number): string {
    switch (type) {
      case 0:
        return '🎮 Playing';
      case 1:
        return '🎥 Streaming';
      case 2:
        return '🎧 Listening to';
      case 3:
        return '👀 Watching';
      case 5:
        return '🏆 Competing in';
      default:
        return `Unknown (${type})`;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ActivityConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Restart if running
    if (this.intervalId) {
      this.stop();
      this.start();
    }

    logger.info('Activity status configuration updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): ActivityConfig {
    return { ...this.config };
  }

  /**
   * Manually trigger status update (skip to next)
   */
  async skipToNext(): Promise<void> {
    await this.updateStatus();
  }
}
