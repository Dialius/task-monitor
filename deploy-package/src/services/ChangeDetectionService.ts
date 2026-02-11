/**
 * Change Detection Service
 * Detect task changes and trigger message edits
 * Runs every 1 hour via cron job
 */

import cron from 'node-cron';
import { NotionService } from './NotionService';
import MessageTrackingService from './MessageTrackingService';
import MessageEditService from './MessageEditService';
import { getLogger } from '../utils/Logger';
import { ITask } from '../models/Task';

const logger = getLogger();

export class ChangeDetectionService {
  private notionService: NotionService;
  private isRunning: boolean = false;
  private cronJob: cron.ScheduledTask | null = null;

  constructor(notionService: NotionService) {
    this.notionService = notionService;
  }

  /**
   * Start the cron job (every 1 hour)
   */
  start() {
    // Run every hour at minute 0
    this.cronJob = cron.schedule('0 * * * *', async () => {
      await this.runChangeDetection();
    });

    logger.info('Change detection cron job started (runs every 1 hour)');
  }

  /**
   * Stop the cron job
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      logger.info('Change detection cron job stopped');
    }
  }

  /**
   * Run change detection manually (for testing)
   */
  async runChangeDetection(): Promise<{
    synced: number;
    edited: number;
    errors: number;
  }> {
    if (this.isRunning) {
      logger.warn('Change detection already running, skipping');
      return { synced: 0, edited: 0, errors: 0 };
    }

    this.isRunning = true;
    logger.info('Starting change detection...');

    try {
      // Step 1: Sync from Notion with retry
      const syncResult = await this.syncWithRetry();
      
      if (syncResult.synced === 0 && syncResult.errors > 0) {
        logger.error('Notion sync failed after all retries');
        return { synced: 0, edited: 0, errors: syncResult.errors };
      }

      // Step 2: Find tasks that need editing
      const tasksToEdit = await MessageTrackingService.getTasksNeedingEdit(1);
      
      if (tasksToEdit.length === 0) {
        logger.info('No tasks need editing');
        return { synced: syncResult.synced, edited: 0, errors: 0 };
      }

      // Step 3: Edit messages for each task
      let editedCount = 0;
      let errorCount = 0;

      for (const task of tasksToEdit) {
        try {
          const results = await this.editTaskMessagesWithFormatters(task);
          
          const successCount = results.filter(r => r.success).length;
          const failCount = results.filter(r => !r.success).length;

          editedCount += successCount;
          errorCount += failCount;

          logger.info('Task messages edited', {
            taskId: task._id,
            success: successCount,
            failed: failCount
          });
        } catch (error) {
          logger.error('Failed to edit task messages', error as Error, {
            taskId: task._id
          });
          errorCount++;
        }
      }

      logger.info('Change detection completed', {
        synced: syncResult.synced,
        edited: editedCount,
        errors: errorCount
      });

      return {
        synced: syncResult.synced,
        edited: editedCount,
        errors: errorCount
      };
    } catch (error) {
      logger.error('Change detection failed', error as Error);
      return { synced: 0, edited: 0, errors: 1 };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Sync from Notion with retry logic
   */
  private async syncWithRetry(maxRetries: number = 3): Promise<{
    synced: number;
    errors: number;
  }> {
    const baseDelay = 2000; // 2 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info('Attempting Notion sync', { attempt, maxRetries });
        
        const result = await this.notionService.syncFromNotion();
        
        logger.info('Notion sync successful', {
          attempt,
          synced: result.synced,
          errors: result.errors
        });

        return result;
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;

        if (isLastAttempt) {
          logger.error('Notion sync failed after all retries', error as Error, {
            attempts: maxRetries
          });
          return { synced: 0, errors: 1 };
        }

        // Exponential backoff: 2s, 4s, 8s
        const delay = baseDelay * Math.pow(2, attempt - 1);
        logger.warn('Notion sync failed, retrying...', {
          attempt,
          maxRetries,
          retryIn: `${delay}ms`,
          error: (error as Error).message
        });

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return { synced: 0, errors: 1 };
  }

  /**
   * Edit task messages with proper formatters
   * This is a wrapper that will be implemented with actual formatters
   */
  private async editTaskMessagesWithFormatters(task: ITask) {
    // Import formatters dynamically to avoid circular dependencies
    const { formatTaskForWhatsApp } = await import('../utils/TaskFormatter');
    const { formatTaskEmbedForDiscord } = await import('../utils/TaskFormatter');

    return await MessageEditService.editTaskMessages(
      task,
      formatTaskForWhatsApp,
      formatTaskEmbedForDiscord
    );
  }
}
