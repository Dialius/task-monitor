/**
 * Activity Status Service
 * Manages rotating activity status for Discord bot
 */

import { Client } from 'discord.js';
import { TaskService } from './TaskService';
import { ITask } from '../models/Task';
import { getLogger } from '../utils/Logger';
import { format } from 'date-fns';

const logger = getLogger();

export interface ActivityConfig {
  enabled: boolean;
  rotationInterval: number; // in minutes
  activities: ActivityTemplate[];
}

export interface ActivityTemplate {
  type?: 0 | 1 | 2 | 3 | 5; // 0: Playing, 1: Streaming, 2: Listening, 3: Watching, 5: Competing (optional per template)
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

      // Use per-template type if specified, otherwise use default type
      const activityType = activity.type !== undefined ? activity.type : this.config.activities[0]?.type || 3;

      // Set activity using setActivity method for better compatibility
      await this.client.user.setActivity(statusText, { 
        type: activityType 
      });

      // Get activity type name for logging
      const activityTypeName = this.getActivityTypeName(activityType);
      
      logger.info('Activity status updated', {
        type: activityType,
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
   * Requirements: 8.2, 8.3, 8.4, 8.5, 8.9
   */
  private async processActivityText(activity: ActivityTemplate): Promise<string> {
    // Check if text contains new template variables
    const hasNewVariables = activity.text.includes('{total}') || 
                           activity.text.includes('{active}') || 
                           activity.text.includes('{nearest}');

    if (hasNewVariables) {
      return await this.processNewTemplateVariables(activity.text);
    }

    // Legacy support for old dataSource format
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
   * Process new template variables: {total}, {active}, {nearest}, {today}, {percent}, {urgent}, {hours}
   * Requirements: 8.2, 8.3, 8.4, 8.5, 8.9
   */
  private async processNewTemplateVariables(text: string): Promise<string> {
    try {
      let result = text;

      // Get all active tasks
      const activeTasks = await this.taskService.getTasks({ status: 'aktif' });
      const activeCount = activeTasks.length;

      // Replace {total} and {active} with active task count
      result = result.replace(/{total}/g, activeCount.toString());
      result = result.replace(/{active}/g, activeCount.toString());

      // Replace {today} with tasks due today
      if (result.includes('{today}')) {
        const today = new Date();
        const todayTasks = activeTasks.filter((task: ITask) => {
          const deadline = new Date(task.deadline);
          return deadline.toDateString() === today.toDateString();
        });
        result = result.replace(/{today}/g, todayTasks.length.toString());
      }

      // Replace {percent} with completion rate
      if (result.includes('{percent}')) {
        const allTasks = await this.taskService.getAllTasks();
        const completedTasks = allTasks.filter((task: ITask) => task.status === 'selesai');
        const totalTasks = allTasks.length;
        const percent = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
        result = result.replace(/{percent}/g, percent.toString());
      }

      // Replace {urgent} with urgent tasks (< 24 hours)
      if (result.includes('{urgent}')) {
        const now = new Date();
        const urgentTasks = activeTasks.filter((task: ITask) => {
          const deadline = new Date(task.deadline);
          const hoursUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
          return hoursUntil < 24 && hoursUntil > 0;
        });
        result = result.replace(/{urgent}/g, urgentTasks.length.toString());
      }

      // Replace {hours} with hours until nearest deadline
      if (result.includes('{hours}')) {
        if (activeTasks.length === 0) {
          result = result.replace(/{hours}/g, '0');
        } else {
          const sortedTasks = activeTasks.sort((a, b) => {
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          });
          const nearestDeadline = new Date(sortedTasks[0].deadline);
          const now = new Date();
          const hoursUntil = Math.max(0, Math.floor((nearestDeadline.getTime() - now.getTime()) / (1000 * 60 * 60)));
          result = result.replace(/{hours}/g, hoursUntil.toString());
        }
      }

      // Replace {nearest} with nearest deadline
      if (result.includes('{nearest}')) {
        if (activeTasks.length === 0) {
          // Empty state handling - show friendly message
          result = result.replace(/{nearest}/g, 'no tasks');
        } else {
          // Sort by deadline and get nearest
          const sortedTasks = activeTasks.sort((a, b) => {
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          });

          const nearestTask = sortedTasks[0];
          const deadline = new Date(nearestTask.deadline);
          
          // Format deadline using date-fns
          const formattedDeadline = format(deadline, 'dd MMM');

          result = result.replace(/{nearest}/g, formattedDeadline);
        }
      }

      return result;
    } catch (error) {
      logger.error('Failed to process new template variables', error as Error);
      // Return original text with placeholders removed
      return text
        .replace(/{total}/g, '0')
        .replace(/{active}/g, '0')
        .replace(/{today}/g, '0')
        .replace(/{percent}/g, '0')
        .replace(/{urgent}/g, '0')
        .replace(/{hours}/g, '0')
        .replace(/{nearest}/g, 'N/A');
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
