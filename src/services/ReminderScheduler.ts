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
import { HolidayService } from './HolidayService';
import { TaskMonitorService } from './discord/TaskMonitorService';
import { PlatformAdapter } from '../adapters/PlatformAdapter';
import { getLogger } from '../utils/Logger';
import {
  getWeekOfMonth,
  DailyRecapData,
  WeeklyRecapData
} from '../utils/RecapFormatter';

const logger = getLogger();

export interface SchedulerConfig {
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
  private bidirectionalSyncJob: cron.ScheduledTask | null = null;
  private adapters: { adapter: PlatformAdapter, channelId: string }[] = [];

  constructor(
    private taskService: TaskService,
    private scheduleService: ScheduleService,
    _piketService: PiketService, // Reserved for future use
    _announcementService: AnnouncementService, // Reserved for future use
    _aiService: AIService, // Reserved for future use
    adapters: { adapter: PlatformAdapter, channelId: string }[],
    private config: SchedulerConfig,
    private notionService: NotionService,
    private holidayService: HolidayService,
    private taskMonitorService?: TaskMonitorService
  ) {
    this.adapters = adapters;
  }

  /**
   * Initialize cron jobs
   * Requirement: 6.1, 7.1
   * 
   * Schedule:
   * - Daily (Sun-Thu): 16:00 - Tasks for tomorrow (Mon-Fri)
   * - Weekly (Fri): 21:00 - Tasks for next week
   */
  initialize(): void {
    try {
      // Setup daily reminder (Minggu-Kamis)
      // Parse hour and minute from config like '16:00'
      const dailyTimeParts = (this.config.dailyReminderTime || '16:00').split(':');
      const dailyHour = dailyTimeParts[0] || '16';
      const dailyMinute = dailyTimeParts[1] || '00';

      // Cron: minute hour * * day-of-week
      // Day: 0=Minggu, 1=Senin, 2=Selasa, 3=Rabu, 4=Kamis
      const dailyCron = `${dailyMinute} ${dailyHour} * * 0-4`;

      this.dailyJob = cron.schedule(dailyCron, async () => {
        await this.sendDailyRecap();
      }, {
        timezone: this.config.timezone
      });

      logger.info(`Daily reminder scheduled (Sun-Thu ${this.config.dailyReminderTime})`, {
        cron: dailyCron,
        timezone: this.config.timezone
      });

      // Setup weekly reminder 
      const weeklyTimeParts = (this.config.weeklyReminderTime || '21:00').split(':');
      const weeklyHour = weeklyTimeParts[0] || '21';
      const weeklyMinute = weeklyTimeParts[1] || '00';
      const weeklyDay = this.config.weeklyReminderDay !== undefined ? this.config.weeklyReminderDay : 5;

      const weeklyCron = `${weeklyMinute} ${weeklyHour} * * ${weeklyDay}`;

      this.weeklyJob = cron.schedule(weeklyCron, async () => {
        await this.sendWeeklyRecap();
      }, {
        timezone: this.config.timezone
      });

      logger.info(`Weekly reminder scheduled (Day ${weeklyDay} ${this.config.weeklyReminderTime})`, {
        cron: weeklyCron,
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

      const recapData = await this.buildDailyRecapData(tomorrow);

      // Skip sending if tomorrow is a holiday
      if (recapData.isHoliday) {
        logger.info(`Skipping daily recap for tomorrow (${tomorrow.toLocaleDateString()}) because it is a holiday: ${recapData.holidayReason}`);
        return;
      }

      for (const { adapter, channelId } of this.adapters) {
        await adapter.sendDailyRecap(channelId, recapData);
      }

      logger.info('Daily recap sent successfully to all adapters');
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
      const recapData = await this.buildWeeklyRecapData(today);

      for (const { adapter, channelId } of this.adapters) {
        await adapter.sendWeeklyRecap(channelId, recapData);
      }

      logger.info('Weekly recap sent successfully to all adapters');
    } catch (error) {
      logger.error('Failed to send weekly recap', error as Error);
    }
  }



  /**
   * Build daily recap data
   * Requirement: 6.3, 6.4, 6.5, 6.6, 6.7, 6.8
   */
  async buildDailyRecapData(date: Date): Promise<DailyRecapData> {
    try {
      // Get tomorrow's tasks
      const tasks = await this.taskService.getTasksForDate(date);
      const schedules = await this.scheduleService.getScheduleForDate(date);

      // Check if tomorrow is holiday
      const isHoliday = await this.holidayService.isHoliday(date);
      let holidayReason = '';

      if (isHoliday) {
        const holiday = await this.holidayService.getHoliday(date);
        if (holiday) holidayReason = holiday.reason;
      }

      const recapData: DailyRecapData = {
        date,
        tasks,
        schedules,
        isHoliday,
        holidayReason
      };

      return recapData;
    } catch (error) {
      logger.error('Failed to build daily recap data', error as Error);
      return { date, tasks: [], schedules: [] };
    }
  }

  /**
   * Build weekly recap data
   * Requirement: 7.3, 7.4, 7.5, 7.6, 7.7
   */
  async buildWeeklyRecapData(startDate: Date): Promise<WeeklyRecapData> {
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

      // Check holidays for the week
      const holidays = new Map<string, string>();
      for (let i = 0; i < 5; i++) {
        const d = new Date(nextMonday);
        d.setDate(d.getDate() + i);

        if (await this.holidayService.isHoliday(d)) {
          const h = await this.holidayService.getHoliday(d);
          if (h) holidays.set(days[i], h.reason);
        }
      }

      const recapData: WeeklyRecapData = {
        weekNumber,
        month,
        year,
        tasksByDay,
        holidays
      };

      return recapData;
    } catch (error) {
      logger.error('Failed to build weekly recap data', error as Error);
      return { weekNumber: 0, month: '', year: 0, tasksByDay: new Map() };
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

      // Update Task Monitor if available
      if (this.taskMonitorService) {
        logger.info('Updating Task Monitor embed after sync...');
        await this.taskMonitorService.updateEmbed();
      }
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



    if (this.bidirectionalSyncJob) {
      this.bidirectionalSyncJob.stop();
      logger.info('Bidirectional sync job stopped');
    }
  }
}
