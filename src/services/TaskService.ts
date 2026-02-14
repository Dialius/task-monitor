/**
 * Task Service
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.11, 2.12
 */

import Task, { ITask } from '../models/Task';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

export interface TaskInput {
  judul: string;
  deskripsi: string;
  deadline: Date;
  mata_pelajaran: string;
  tipe: 'individu' | 'kelompok' | 'ujian';
  created_by: string;
}

export interface TaskFilter {
  status?: string;
  deadline?: {
    $gte?: Date;
    $lte?: Date;
  };
  prioritas?: 'urgent' | 'penting' | 'normal';
}

export type Priority = 'urgent' | 'penting' | 'normal';

/**
 * Task Service for managing tasks
 */
export class TaskService {
  /**
   * Create new task with automatic priority calculation
   * Requirement: 2.1, 2.2
   */
  async createTask(taskData: TaskInput): Promise<ITask> {
    try {
      const prioritas = this.calculatePriority(taskData.deadline);

      const task = new Task({
        ...taskData,
        prioritas,
        status: 'aktif'
      });

      await task.save();

      logger.logDBOperation('create', 'tasks', true);
      logger.info('Task created', {
        taskId: task._id,
        judul: task.judul,
        prioritas
      });

      return task;
    } catch (error) {
      logger.logDBOperation('create', 'tasks', false);
      logger.error('Failed to create task', error as Error);
      throw error;
    }
  }

  /**
   * Calculate priority based on deadline proximity
   * Requirement: 2.2, 2.11, 2.12
   */
  calculatePriority(deadline: Date): Priority {
    const now = new Date();
    const deadlineTime = new Date(deadline).getTime();
    const currentTime = now.getTime();
    const diffHours = (deadlineTime - currentTime) / (1000 * 60 * 60);

    if (diffHours <= 24) {
      return 'urgent';
    } else if (diffHours <= 72) {
      return 'penting';
    } else {
      return 'normal';
    }
  }

  /**
   * Update task field
   * Requirement: 2.3
   */
  async updateTask(taskId: string, field: string, value: any): Promise<ITask> {
    try {
      const task = await Task.findById(taskId);
      
      if (!task) {
        throw new Error('Task not found');
      }

      // Update only the specified field
      (task as any)[field] = value;

      // Recalculate priority if deadline is updated
      if (field === 'deadline') {
        task.prioritas = this.calculatePriority(value);
      }

      await task.save();

      logger.logDBOperation('update', 'tasks', true);
      logger.info('Task updated', {
        taskId,
        field,
        value
      });

      return task;
    } catch (error) {
      logger.logDBOperation('update', 'tasks', false);
      logger.error('Failed to update task', error as Error);
      throw error;
    }
  }

  /**
   * Delete task
   * Requirement: 2.4
   */
  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const result = await Task.findByIdAndDelete(taskId);
      
      if (!result) {
        throw new Error('Task not found');
      }

      logger.logDBOperation('delete', 'tasks', true);
      logger.info('Task deleted', { taskId });

      return true;
    } catch (error) {
      logger.logDBOperation('delete', 'tasks', false);
      logger.error('Failed to delete task', error as Error);
      throw error;
    }
  }

  /**
   * Mark task as complete
   * Requirement: 2.5
   */
  async markComplete(taskId: string): Promise<ITask> {
    try {
      const task = await Task.findById(taskId);
      
      if (!task) {
        throw new Error('Task not found');
      }

      task.status = 'selesai';
      await task.save();

      logger.logDBOperation('update', 'tasks', true);
      logger.info('Task marked complete', { taskId });

      return task;
    } catch (error) {
      logger.logDBOperation('update', 'tasks', false);
      logger.error('Failed to mark task complete', error as Error);
      throw error;
    }
  }

  /**
   * Get tasks by filter
   * Requirement: 2.6
   */
  async getTasks(filter: TaskFilter = {}): Promise<ITask[]> {
    try {
      const query: any = { status: 'aktif', ...filter };
      
      const tasks = await Task.find(query)
        .sort({ deadline: 1 })
        .exec();

      logger.logDBOperation('read', 'tasks', true);

      return tasks;
    } catch (error) {
      logger.logDBOperation('read', 'tasks', false);
      logger.error('Failed to get tasks', error as Error);
      throw error;
    }
  }

  /**
   * Get tasks for today
   * Requirement: 2.7
   */
  async getTasksForToday(): Promise<ITask[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getTasks({
      deadline: {
        $gte: today,
        $lte: tomorrow
      }
    });
  }

  /**
   * Get tasks for this week
   * Requirement: 2.8
   */
  async getTasksForWeek(): Promise<ITask[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return this.getTasks({
      deadline: {
        $gte: today,
        $lte: nextWeek
      }
    });
  }

  /**
   * Get tasks for specific date
   */
  async getTasksForDate(date: Date): Promise<ITask[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getTasks({
      deadline: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: string): Promise<ITask | null> {
    try {
      const task = await Task.findById(taskId);
      return task;
    } catch (error) {
      logger.error('Failed to get task by ID', error as Error);
      return null;
    }
  }

  /**
   * Update all task priorities (run periodically)
   */
  async updateAllPriorities(): Promise<void> {
    try {
      const tasks = await Task.find({ status: 'aktif' });
      
      for (const task of tasks) {
        const newPriority = this.calculatePriority(task.deadline);
        if (task.prioritas !== newPriority) {
          task.prioritas = newPriority;
          await task.save();
        }
      }

      logger.info('All task priorities updated', { count: tasks.length });
    } catch (error) {
      logger.error('Failed to update priorities', error as Error);
    }
  }

  /**
   * Get all tasks (including completed)
   */
  async getAllTasks(): Promise<ITask[]> {
    try {
      const tasks = await Task.find()
        .sort({ deadline: 1 })
        .exec();

      logger.logDBOperation('read', 'tasks', true);

      return tasks;
    } catch (error) {
      logger.logDBOperation('read', 'tasks', false);
      logger.error('Failed to get all tasks', error as Error);
      throw error;
    }
  }
}
