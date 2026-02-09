/**
 * Reminder Scheduler
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7
 */

import cron from 'node-cron';
import { TaskService } from './TaskService';
import { ScheduleService } from './ScheduleService';
import { PiketService } from './PiketService';
import { AnnouncementService } from './AnnouncementService';
import { AIService, RecapData } from './AIService';
import { PlatformAdapter } from '../adapters/PlatformAdapter';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

export interface SchedulerConfig {
  groupId: string;
  dailyReminderTime: string;  // "17:00"
  weeklyReminderDay: number;  // 5 for Friday
  weeklyReminderTime: string; // "20:00"
  timezone: string;           // "Asia/Jakarta"
}

/**
 * Reminder Scheduler for automated daily and weekly recaps
 */
export class ReminderScheduler {
  private dailyJob: cron.ScheduledTask | null = null;
  private weeklyJob: cron.ScheduledTask | null = null;

  constructor(
    private taskService: TaskService,
    private scheduleService: ScheduleService,
    private piketService: PiketService,
    private announcementService: AnnouncementService,
    private aiService: AIService,
    private platformAdapter: PlatformAdapter,
    private config: SchedulerConfig
  ) {}

  /**
   * Initialize cron jobs
   * Requirement: 6.1, 7.1
   */
  initialize(): void {
    try {
      // Setup daily reminder
      const [dailyHour, dailyMinute] = this.config.dailyReminderTime.split(':');
      const dailyCron = `${dailyMinute} ${dailyHour} * * *`;

      this.dailyJob = cron.schedule(dailyCron, async () => {
        await this.sendDailyRecap();
      }, {
        timezone: this.config.timezone
      });

      logger.info('Daily reminder scheduled', {
        time: this.config.dailyReminderTime,
        timezone: this.config.timezone
      });

      // Setup weekly reminder
      const [weeklyHour, weeklyMinute] = this.config.weeklyReminderTime.split(':');
      const weeklyCron = `${weeklyMinute} ${weeklyHour} * * ${this.config.weeklyReminderDay}`;

      this.weeklyJob = cron.schedule(weeklyCron, async () => {
        await this.sendWeeklyRecap();
      }, {
        timezone: this.config.timezone
      });

      logger.info('Weekly reminder scheduled', {
        day: this.config.weeklyReminderDay,
        time: this.config.weeklyReminderTime,
        timezone: this.config.timezone
      });
    } catch (error) {
      logger.error('Failed to initialize scheduler', error as Error);
      throw error;
    }
  }

  /**
   * Generate and send daily recap
   * Requirement: 6.1
   */
  async sendDailyRecap(): Promise<void> {
    try {
      logger.info('Generating daily recap');

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const recap = await this.buildDailyRecap(tomorrow);

      await this.platformAdapter.sendMessage(this.config.groupId, recap);

      logger.info('Daily recap sent successfully');
    } catch (error) {
      logger.error('Failed to send daily recap', error as Error);
    }
  }

  /**
   * Generate and send weekly recap
   * Requirement: 7.1
   */
  async sendWeeklyRecap(): Promise<void> {
    try {
      logger.info('Generating weekly recap');

      const today = new Date();
      const recap = await this.buildWeeklyRecap(today);

      await this.platformAdapter.sendMessage(this.config.groupId, recap);

      logger.info('Weekly recap sent successfully');
    } catch (error) {
      logger.error('Failed to send weekly recap', error as Error);
    }
  }

  /**
   * Build daily recap message
   * Requirement: 6.3, 6.4, 6.5, 6.6, 6.7, 6.8
   */
  async buildDailyRecap(_date: Date): Promise<string> {
    try {
      // Get tomorrow's data
      const schedules = await this.scheduleService.getTomorrowSchedule();
      const tasks = await this.taskService.getTasksForToday();
      const piket = await this.piketService.getTomorrowPiket();
      const announcements = await this.announcementService.getTomorrowAnnouncements();

      // Check if there's any data
      if (schedules.length === 0 && tasks.length === 0 && !piket && announcements.length === 0) {
        return '📅 *Recap Harian*\n\nTidak ada jadwal, tugas, atau pengumuman untuk besok. Enjoy your day! 🎉';
      }

      const recapData: RecapData = {
        tasks,
        schedules,
        piket: piket ? [piket] : [],
        announcements
      };

      // Format with AI
      const formatted = await this.aiService.formatRecap(recapData, 'daily');

      return formatted;
    } catch (error) {
      logger.error('Failed to build daily recap', error as Error);
      return '❌ Gagal membuat recap harian.';
    }
  }

  /**
   * Build weekly recap message
   * Requirement: 7.3, 7.4, 7.5, 7.6, 7.7
   */
  async buildWeeklyRecap(_startDate: Date): Promise<string> {
    try {
      // Get next week's data
      const tasks = await this.taskService.getTasksForWeek();
      const announcements = await this.announcementService.getWeekAnnouncements();

      // Calculate statistics
      const statistics = {
        totalTasks: tasks.length,
        tasksByType: this.groupBy(tasks, 'tipe'),
        tasksByPriority: this.groupBy(tasks, 'prioritas')
      };

      // Check if there's any data
      if (tasks.length === 0 && announcements.length === 0) {
        return '📊 *Recap Mingguan*\n\nTidak ada tugas atau pengumuman untuk minggu depan. Have a great week! 🎉';
      }

      const recapData: RecapData = {
        tasks,
        schedules: [],
        piket: [],
        announcements,
        statistics
      };

      // Format with AI
      const formatted = await this.aiService.formatRecap(recapData, 'weekly');

      return formatted;
    } catch (error) {
      logger.error('Failed to build weekly recap', error as Error);
      return '❌ Gagal membuat recap mingguan.';
    }
  }

  /**
   * Helper: Group array by field
   */
  private groupBy(array: any[], field: string): Record<string, number> {
    return array.reduce((acc, item) => {
      const key = item[field];
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Stop all scheduled jobs
   */
  stop(): void {
    if (this.dailyJob) {
      this.dailyJob.stop();
      logger.info('Daily reminder stopped');
    }

    if (this.weeklyJob) {
      this.weeklyJob.stop();
      logger.info('Weekly reminder stopped');
    }
  }
}
