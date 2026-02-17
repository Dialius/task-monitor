/**
 * Reminder Scheduler
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7
 * 
 * Schedule:
 * - Senin-Kamis: 16:00 (tugas besok)
 * - Jumat: 16:00 (tugas minggu depan - Senin s/d Jumat)
 * - Minggu: 16:00 (tugas hari Senin)
 * - Sabtu: Tidak ada reminder
 */

import cron from 'node-cron';
import { TaskService } from './TaskService';
import { ScheduleService } from './ScheduleService';
import { PiketService } from './PiketService';
import { AnnouncementService } from './AnnouncementService';
import { AIService } from './AIService';
import { NotionService } from './NotionService';
import { PlatformAdapter } from '../adapters/PlatformAdapter';
import { getLogger } from '../utils/Logger';
import {
  formatDailyRecap,
  formatWeeklyRecap,
  getWeekOfMonth,
  DailyRecapData,
  WeeklyRecapData
} from '../utils/RecapFormatter';

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
  private sundayJob: cron.ScheduledTask | null = null;
  private bidirectionalSyncJob: cron.ScheduledTask | null = null;

  constructor(
    private taskService: TaskService,
    private scheduleService: ScheduleService,
    _piketService: PiketService, // Reserved for future use
    _announcementService: AnnouncementService, // Reserved for future use
    _aiService: AIService, // Reserved for future use
    private platformAdapter: PlatformAdapter,
    private config: SchedulerConfig,
    private notionService: NotionService
  ) { }

  /**
   * Initialize cron jobs
   * Requirement: 6.1, 7.1
   * 
   * Schedule:
   * - Senin-Kamis (1-4): 16:00 - Daily recap (tugas besok)
   * - Jumat (5): 16:00 - Weekly recap (tugas minggu depan Senin-Jumat)
   * - Minggu (0): 16:00 - Monday recap (tugas hari Senin)
   * - Sabtu (6): Tidak ada reminder
   */
  initialize(): void {
    try {
      // Setup daily reminder (Senin-Kamis jam 16:00)
      // Cron: minute hour * * day-of-week
      // Day: 1=Senin, 2=Selasa, 3=Rabu, 4=Kamis
      const dailyCron = '0 16 * * 1-4'; // 16:00 Senin-Kamis

      this.dailyJob = cron.schedule(dailyCron, async () => {
        await this.sendDailyRecap();
      }, {
        timezone: this.config.timezone
      });

      logger.info('Daily reminder scheduled (Mon-Thu 16:00)', {
        cron: dailyCron,
        timezone: this.config.timezone
      });

      // Setup weekly reminder (Jumat jam 16:00)
      const weeklyCron = '0 16 * * 5'; // 16:00 Jumat

      this.weeklyJob = cron.schedule(weeklyCron, async () => {
        await this.sendWeeklyRecap();
      }, {
        timezone: this.config.timezone
      });

      logger.info('Weekly reminder scheduled (Fri 16:00)', {
        cron: weeklyCron,
        timezone: this.config.timezone
      });

      // Setup Sunday reminder (Minggu jam 16:00 - untuk tugas Senin)
      const sundayCron = '0 16 * * 0'; // 16:00 Minggu

      this.sundayJob = cron.schedule(sundayCron, async () => {
        await this.sendMondayRecap();
      }, {
        timezone: this.config.timezone
      });

      logger.info('Sunday reminder scheduled (Sun 16:00 - Monday tasks)', {
        cron: sundayCron,
        timezone: this.config.timezone
      });

      // Setup bidirectional sync (every 2 hours)
      const syncCron = '0 */2 * * *'; // Every 2 hours

      this.bidirectionalSyncJob = cron.schedule(syncCron, async () => {
        await this.runBidirectionalSync();
      }, {
        timezone: this.config.timezone
      });

      logger.info('Bidirectional sync scheduled (every 2 hours)', {
        cron: syncCron,
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

      // Sync from Notion first
      if (this.notionService.isEnabled()) {
        logger.info('Syncing tasks from Notion...');
        const syncResult = await this.notionService.syncFromNotion();
        logger.info('Notion sync completed', syncResult);
      }

      const { DateTimeHelper } = require('../utils/DateTimeHelper');
      const tomorrow = DateTimeHelper.now();
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

      // Sync from Notion first
      if (this.notionService.isEnabled()) {
        logger.info('Syncing tasks from Notion...');
        const syncResult = await this.notionService.syncFromNotion();
        logger.info('Notion sync completed', syncResult);
      }

      const { DateTimeHelper } = require('../utils/DateTimeHelper');
      const today = DateTimeHelper.now();
      const recap = await this.buildWeeklyRecap(today);

      await this.platformAdapter.sendMessage(this.config.groupId, recap);

      logger.info('Weekly recap sent successfully');
    } catch (error) {
      logger.error('Failed to send weekly recap', error as Error);
    }
  }

  /**
   * Generate and send Monday recap (sent on Sunday)
   */
  async sendMondayRecap(): Promise<void> {
    try {
      logger.info('Generating Monday recap (sent on Sunday)');

      // Get next Monday (tomorrow from Sunday)
      const { DateTimeHelper } = require('../utils/DateTimeHelper');
      const monday = DateTimeHelper.now();
      monday.setDate(monday.getDate() + 1);

      const recap = await this.buildDailyRecap(monday);

      await this.platformAdapter.sendMessage(this.config.groupId, recap);

      logger.info('Monday recap sent successfully');
    } catch (error) {
      logger.error('Failed to send Monday recap', error as Error);
    }
  }

  /**
   * Build daily recap message
   * Requirement: 6.3, 6.4, 6.5, 6.6, 6.7, 6.8
   */
  async buildDailyRecap(date: Date): Promise<string> {
    try {
      // Get tomorrow's tasks
      const tasks = await this.taskService.getTasksForDate(date);
      const schedules = await this.scheduleService.getScheduleForDate(date);

      const recapData: DailyRecapData = {
        date,
        tasks,
        schedules
      };

      // Format using custom formatter
      const formatted = formatDailyRecap(recapData);

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
  async buildWeeklyRecap(startDate: Date): Promise<string> {
    try {
      // Get next week's tasks (Senin-Jumat)
      const nextMonday = this.getNextMonday(startDate);
      const tasksByDay = new Map<string, any[]>();

      // Get tasks for each day (Senin-Jumat)
      const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

      for (let i = 0; i < 5; i++) {
        const date = new Date(nextMonday);
        date.setDate(date.getDate() + i);

        const tasks = await this.taskService.getTasksForDate(date);
        tasksByDay.set(days[i], tasks);
      }

      const weekNumber = getWeekOfMonth(nextMonday);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const month = monthNames[nextMonday.getMonth()];
      const year = nextMonday.getFullYear();

      const recapData: WeeklyRecapData = {
        weekNumber,
        month,
        year,
        tasksByDay
      };

      // Format using custom formatter
      const formatted = formatWeeklyRecap(recapData);

      return formatted;
    } catch (error) {
      logger.error('Failed to build weekly recap', error as Error);
      return '❌ Gagal membuat recap mingguan.';
    }
  }

  /**
   * Get next Monday from given date
   */
  private getNextMonday(date: Date): Date {
    const { DateTimeHelper } = require('../utils/DateTimeHelper');
    const result = DateTimeHelper.toWIB(date);
    const day = result.getDay();

    // If today is Friday (5), next Monday is 3 days away
    // If today is other day, calculate days until next Monday
    const daysUntilMonday = day === 5 ? 3 : (8 - day) % 7;

    result.setDate(result.getDate() + daysUntilMonday);
    return result;
  }

  /**
   * Run bidirectional sync between MongoDB and Notion
   */
  async runBidirectionalSync(): Promise<void> {
    try {
      if (!this.notionService.isEnabled()) {
        return;
      }

      logger.info('Running scheduled bidirectional sync...');
      const result = await this.notionService.bidirectionalSync();
      logger.info('Bidirectional sync completed', result);
    } catch (error) {
      logger.error('Failed to run bidirectional sync', error as Error);
    }
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

    if (this.sundayJob) {
      this.sundayJob.stop();
      logger.info('Sunday reminder stopped');
    }

    if (this.bidirectionalSyncJob) {
      this.bidirectionalSyncJob.stop();
      logger.info('Bidirectional sync job stopped');
    }
  }
}
