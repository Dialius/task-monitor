/**
 * Message Tracking Service
 * Track sent messages and enable auto-edit when tasks are updated
 */

import Task, { ITask } from '../models/Task';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

export interface SentMessageInfo {
  platform: 'whatsapp' | 'discord';
  message_id: string;
  chat_id: string;
}

/**
 * Message Tracking Service
 */
export class MessageTrackingService {
  /**
   * Track a sent message for a task
   */
  async trackSentMessage(
    taskId: string,
    messageInfo: SentMessageInfo
  ): Promise<boolean> {
    try {
      await Task.findByIdAndUpdate(taskId, {
        $push: {
          sent_messages: {
            platform: messageInfo.platform,
            message_id: messageInfo.message_id,
            chat_id: messageInfo.chat_id,
            sent_at: new Date(),
            edit_count: 0
          }
        }
      });

      logger.info('Message tracked successfully', {
        taskId,
        platform: messageInfo.platform,
        messageId: messageInfo.message_id
      });

      return true;
    } catch (error) {
      logger.error('Failed to track message', error as Error, {
        taskId,
        messageInfo
      });
      return false;
    }
  }

  /**
   * Get tasks that were updated recently and have sent messages
   */
  async getTasksNeedingEdit(hoursAgo: number = 1): Promise<ITask[]> {
    try {
      const { DateTimeHelper } = require('../utils/DateTimeHelper');
      const now = DateTimeHelper.now();
      const cutoffTime = new Date(now.getTime() - hoursAgo * 3600000);

      const tasks = await Task.find({
        updated_at: { $gt: cutoffTime },
        'sent_messages.0': { $exists: true }, // Has at least one sent message
        status: 'aktif' // Only active tasks
      });

      logger.info('Found tasks needing edit', {
        count: tasks.length,
        hoursAgo
      });

      return tasks;
    } catch (error) {
      logger.error('Failed to get tasks needing edit', error as Error);
      return [];
    }
  }

  /**
   * Update edit tracking after successfully editing a message
   */
  async updateEditTracking(
    taskId: string,
    messageId: string
  ): Promise<boolean> {
    try {
      const task = await Task.findById(taskId);
      if (!task || !task.sent_messages) {
        return false;
      }

      const messageIndex = task.sent_messages.findIndex(
        msg => msg.message_id === messageId
      );

      if (messageIndex === -1) {
        return false;
      }

      task.sent_messages[messageIndex].last_edited = new Date();
      task.sent_messages[messageIndex].edit_count += 1;

      await task.save();

      logger.info('Edit tracking updated', {
        taskId,
        messageId,
        editCount: task.sent_messages[messageIndex].edit_count
      });

      return true;
    } catch (error) {
      logger.error('Failed to update edit tracking', error as Error, {
        taskId,
        messageId
      });
      return false;
    }
  }

  /**
   * Check if task has significant changes worth editing messages for
   */
  hasSignificantChanges(oldTask: any, newTask: ITask): boolean {
    if (!oldTask) return false;

    return (
      oldTask.judul !== newTask.judul ||
      oldTask.deskripsi !== newTask.deskripsi ||
      oldTask.deadline.getTime() !== newTask.deadline.getTime() ||
      oldTask.prioritas !== newTask.prioritas ||
      oldTask.status !== newTask.status ||
      oldTask.mata_pelajaran !== newTask.mata_pelajaran ||
      oldTask.link_pengumpulan !== newTask.link_pengumpulan
    );
  }

  /**
   * Get all sent messages for a task
   */
  async getSentMessages(taskId: string): Promise<SentMessageInfo[]> {
    try {
      const task = await Task.findById(taskId);
      if (!task || !task.sent_messages) {
        return [];
      }

      return task.sent_messages.map(msg => ({
        platform: msg.platform,
        message_id: msg.message_id,
        chat_id: msg.chat_id
      }));
    } catch (error) {
      logger.error('Failed to get sent messages', error as Error, { taskId });
      return [];
    }
  }

  /**
   * Remove message tracking (e.g., when message is deleted)
   */
  async removeMessageTracking(
    taskId: string,
    messageId: string
  ): Promise<boolean> {
    try {
      await Task.findByIdAndUpdate(taskId, {
        $pull: {
          sent_messages: { message_id: messageId }
        }
      });

      logger.info('Message tracking removed', { taskId, messageId });
      return true;
    } catch (error) {
      logger.error('Failed to remove message tracking', error as Error, {
        taskId,
        messageId
      });
      return false;
    }
  }
}

export default new MessageTrackingService();
