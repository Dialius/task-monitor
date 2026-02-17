/**
 * Activity Status Service
 * Manages rotating activity status for Discord bot
 */

import { Client, PresenceStatusData } from 'discord.js';
import { TaskService } from './TaskService';
import { ITask } from '../models/Task';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

export interface ActivityConfig {
  enabled: boolean;
  rotationInterval: number; // in minutes
  activities: ActivityTemplate[];
  status?: PresenceStatusData; // Bot presence status (online, idle, dnd, invisible)
}

export interface ActivityTemplate {
  type?: 0 | 1 | 2 | 3 | 5; // 0: Playing, 1: Streaming, 2: Listening, 3: Watching, 5: Competing (optional per template)
  text: string;
  dynamic?: boolean; // if true, will fetch real-time data
  dataSource?: 'tasks_today' | 'tasks_week' | 'tasks_total' | 'tasks_urgent';
}

/**
 * Service for managing Discord bot activity status rotation
 * with smart randomization and type constraint
 */
export class ActivityStatusService {
  private client: Client;
  private taskService: TaskService;
  private config: ActivityConfig;
  private intervalId?: NodeJS.Timeout;

  // Random rotation state
  private templatesByType: Map<number, ActivityTemplate[]> = new Map();
  private currentPlaylist: ActivityTemplate[] = [];
  private playlistIndex: number = 0;
  private roundNumber: number = 0;

  constructor(client: Client, taskService: TaskService, config: ActivityConfig) {
    this.client = client;
    this.taskService = taskService;
    this.config = config;

    // Initialize random rotation system
    this.initializeRandomRotation();
  }

  /**
   * Initialize random rotation system
   * Groups templates by type and generates first playlist
   */
  private initializeRandomRotation(): void {
    // Group templates by activity type
    this.config.activities.forEach(template => {
      const type = template.type !== undefined ? template.type : 3; // Default to WATCHING

      if (!this.templatesByType.has(type)) {
        this.templatesByType.set(type, []);
      }

      this.templatesByType.get(type)!.push(template);
    });

    // Log grouped templates
    logger.info('Activity templates grouped by type', {
      types: Array.from(this.templatesByType.keys()),
      counts: Array.from(this.templatesByType.entries()).map(([type, templates]) => ({
        type: this.getActivityTypeName(type),
        count: templates.length
      }))
    });

    console.log('🎲 Random Activity Rotation initialized:');
    this.templatesByType.forEach((templates, type) => {
      console.log(`   → ${this.getActivityTypeName(type)}: ${templates.length} templates`);
    });

    // Generate first playlist
    this.generateNewPlaylist();
  }

  /**
   * Generate new randomized playlist with type constraint
   * Uses smart interleaving to minimize consecutive same types
   */
  private generateNewPlaylist(): void {
    this.roundNumber++;

    // Create shuffled copies of each type group
    const shuffledGroups = new Map<number, ActivityTemplate[]>();
    this.templatesByType.forEach((templates, type) => {
      const shuffled = [...templates];
      this.shuffleArray(shuffled);
      shuffledGroups.set(type, shuffled);
    });

    // Use interleaving strategy to build playlist
    const playlist = this.interleavedPlaylist(shuffledGroups);

    this.currentPlaylist = playlist;
    this.playlistIndex = 0;

    logger.info('New activity playlist generated', {
      round: this.roundNumber,
      totalTemplates: playlist.length,
      sequence: playlist.slice(0, 10).map(t => this.getActivityTypeName(t.type !== undefined ? t.type : 3)).join(' → ')
    });

    console.log(`\n🎲 Round ${this.roundNumber} playlist generated (${playlist.length} activities)`);
    console.log(`   Sequence: ${playlist.slice(0, 5).map(t => this.getActivityTypeName(t.type !== undefined ? t.type : 3)).join(' → ')}...`);
  }

  /**
   * Create interleaved playlist to minimize consecutive same types
   * Strategy: Distribute templates evenly, prioritizing types with more templates
   */
  private interleavedPlaylist(groups: Map<number, ActivityTemplate[]>): ActivityTemplate[] {
    const playlist: ActivityTemplate[] = [];
    const remaining = new Map(groups);
    let lastType: number | null = null;

    while (this.hasRemainingTemplates(remaining)) {
      // Get types sorted by remaining count (descending)
      const typesByCount = Array.from(remaining.entries())
        .filter(([_, templates]) => templates.length > 0)
        .sort((a, b) => b[1].length - a[1].length);

      // Find best type to use (not same as last, prefer higher count)
      let selectedType: number;
      const differentTypes = typesByCount.filter(([type, _]) => type !== lastType);

      if (differentTypes.length > 0) {
        // Pick randomly from top types (weighted towards higher counts)
        const topTypes = differentTypes.slice(0, Math.min(3, differentTypes.length));
        const randomIndex = Math.floor(Math.random() * topTypes.length);
        selectedType = topTypes[randomIndex][0];
      } else {
        // Forced to use same type (only one type remaining)
        selectedType = typesByCount[0][0];
        logger.warn('Consecutive same type unavoidable', {
          type: this.getActivityTypeName(selectedType),
          remaining: remaining.get(selectedType)!.length
        });
      }

      // Take template and add to playlist
      const template = remaining.get(selectedType)!.shift()!;
      playlist.push(template);
      lastType = selectedType;
    }

    return playlist;
  }

  /**
   * Check if there are remaining templates to process
   */
  private hasRemainingTemplates(remaining: Map<number, ActivityTemplate[]>): boolean {
    return Array.from(remaining.values()).some(templates => templates.length > 0);
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
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
   * Uses randomized playlist with type constraint
   */
  private async updateStatus(): Promise<void> {
    try {
      if (!this.client.user) {
        logger.warn('Client user not available, skipping status update');
        return;
      }

      // Check if we need to generate new playlist
      if (this.playlistIndex >= this.currentPlaylist.length) {
        console.log(`\n✅ Round ${this.roundNumber} completed! All ${this.currentPlaylist.length} activities shown.`);
        this.generateNewPlaylist();
      }

      // Get current activity from playlist
      const activity = this.currentPlaylist[this.playlistIndex];
      const statusText = await this.processActivityText(activity);

      // Use per-template type if specified, otherwise use default type
      const activityType = activity.type !== undefined ? activity.type : 3;

      // Get status from config (default: online)
      const status = this.config.status || 'online';

      // Set presence status and activity in one go
      this.client.user.setPresence({
        status: status,
        activities: [{
          name: statusText,
          type: activityType
        }]
      });

      // Get activity type name for logging
      const activityTypeName = this.getActivityTypeName(activityType);

      logger.info('Activity status updated', {
        round: this.roundNumber,
        type: activityType,
        typeName: activityTypeName,
        text: statusText,
        playlistIndex: this.playlistIndex,
        playlistTotal: this.currentPlaylist.length,
        progress: `${this.playlistIndex + 1}/${this.currentPlaylist.length}`
      });

      // Console log for easy visibility
      console.log(`🔄 [${this.playlistIndex + 1}/${this.currentPlaylist.length}] ${activityTypeName} ${statusText}`);

      // Move to next activity in playlist
      this.playlistIndex++;
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
      // Import DateTimeHelper for proper timezone handling
      const { DateTimeHelper } = await import('../utils/DateTimeHelper');

      let result = text;

      // Get all active tasks
      const activeTasks = await this.taskService.getTasks({ status: 'aktif' });
      const activeCount = activeTasks.length;

      // Replace {total} and {active} with active task count
      result = result.replace(/{total}/g, activeCount.toString());
      result = result.replace(/{active}/g, activeCount.toString());

      // Replace {today} with tasks due today
      if (result.includes('{today}')) {
        const todayTasks = activeTasks.filter((task: ITask) => {
          return DateTimeHelper.isToday(task.deadline);
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
        const urgentTasks = activeTasks.filter((task: ITask) => {
          return DateTimeHelper.isUrgent(task.deadline);
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
          const nearestDeadline = sortedTasks[0].deadline;
          const hoursUntil = DateTimeHelper.getHoursUntil(nearestDeadline);
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

          // Format deadline using DateTimeHelper
          const formattedDeadline = DateTimeHelper.formatShortDate(nearestTask.deadline);

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

    // Reinitialize random rotation if activities changed
    if (config.activities) {
      this.templatesByType.clear();
      this.initializeRandomRotation();
    }

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
   * Get current rotation statistics
   */
  getRotationStats(): {
    round: number;
    progress: string;
    playlistIndex: number;
    playlistTotal: number;
    templatesByType: { type: string; count: number }[];
  } {
    return {
      round: this.roundNumber,
      progress: `${this.playlistIndex}/${this.currentPlaylist.length}`,
      playlistIndex: this.playlistIndex,
      playlistTotal: this.currentPlaylist.length,
      templatesByType: Array.from(this.templatesByType.entries()).map(([type, templates]) => ({
        type: this.getActivityTypeName(type),
        count: templates.length
      }))
    };
  }

  /**
   * Manually trigger status update (skip to next)
   */
  async skipToNext(): Promise<void> {
    await this.updateStatus();
  }

  /**
   * Force generate new playlist (skip current round)
   */
  forceNewRound(): void {
    console.log(`\n⏭️  Forcing new round (skipping ${this.currentPlaylist.length - this.playlistIndex} remaining activities)`);
    this.generateNewPlaylist();
  }
}
