/**
 * Bot Monitor Service
 * Get actual bot status and metrics from running bot instance
 */

import { getLogger } from '../../utils/Logger';
import mongoose from 'mongoose';
import Task from '../../models/Task';
import os from 'os';

const logger = getLogger();

// Global bot state (will be updated by bot.ts)
let botState = {
  whatsappConnected: false,
  discordConnected: false,
  startTime: Date.now(),
  messageCount: 0,
  commandCount: 0,
  lastActivity: new Date()
};

export class BotMonitorService {
  /**
   * Update bot state (called from bot.ts)
   */
  static updateState(updates: Partial<typeof botState>) {
    botState = { ...botState, ...updates };
  }

  /**
   * Get current bot state
   */
  static getState() {
    return { ...botState };
  }

  /**
   * Get bot status with actual data
   */
  async getStatus() {
    try {
      const state = BotMonitorService.getState();
      const uptime = Math.floor((Date.now() - state.startTime) / 1000);

      return {
        status: 'online' as const,
        pid: process.pid,
        uptime,
        restarts: 0,
        connections: {
          whatsapp: state.whatsappConnected,
          discord: state.discordConnected,
          mongodb: mongoose.connection.readyState === 1,
          notion: !!process.env.NOTION_API_KEY && !!process.env.NOTION_DATABASE_ID
        },
        activity: {
          messageCount: state.messageCount,
          commandCount: state.commandCount,
          lastActivity: state.lastActivity
        }
      };
    } catch (error) {
      logger.error('Get status error:', error as Error);
      throw error;
    }
  }

  /**
   * Get system metrics
   */
  async getMetrics() {
    try {
      const cpuUsage = process.cpuUsage();
      const memUsage = process.memoryUsage();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;

      const state = BotMonitorService.getState();
      const uptime = Math.floor((Date.now() - state.startTime) / 1000);

      // Calculate CPU percentage (simplified)
      const cpuPercent = Math.min(
        ((cpuUsage.user + cpuUsage.system) / 1000000 / uptime) * 100,
        100
      );

      // Calculate memory percentage
      const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

      return {
        cpu: parseFloat(cpuPercent.toFixed(2)),
        memory: parseFloat(memPercent.toFixed(2)),
        uptime,
        memoryUsage: {
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal,
          rss: memUsage.rss,
          external: memUsage.external
        },
        systemMemory: {
          total: totalMem,
          free: freeMem,
          used: usedMem,
          percent: parseFloat(((usedMem / totalMem) * 100).toFixed(2))
        }
      };
    } catch (error) {
      logger.error('Get metrics error:', error as Error);
      throw error;
    }
  }

  /**
   * Get task statistics
   */
  async getTaskStats() {
    try {
      const [
        totalTasks,
        pendingTasks,
        completedTasks,
        urgentTasks,
        tasksByType,
        tasksByPriority
      ] = await Promise.all([
        Task.countDocuments(),
        Task.countDocuments({ status: 'pending' }),
        Task.countDocuments({ status: 'completed' }),
        Task.countDocuments({ prioritas: 'urgent' }),
        Task.aggregate([
          { $group: { _id: '$tipe', count: { $sum: 1 } } }
        ]),
        Task.aggregate([
          { $group: { _id: '$prioritas', count: { $sum: 1 } } }
        ])
      ]);

      // Convert aggregation results to objects
      const typeMap: Record<string, number> = {};
      tasksByType.forEach((item: any) => {
        typeMap[item._id] = item.count;
      });

      const priorityMap: Record<string, number> = {};
      tasksByPriority.forEach((item: any) => {
        priorityMap[item._id] = item.count;
      });

      return {
        total: totalTasks,
        pending: pendingTasks,
        completed: completedTasks,
        urgent: urgentTasks,
        byType: {
          tugas: typeMap.tugas || 0,
          ujian: typeMap.ujian || 0,
          kelompok: typeMap.kelompok || 0,
          lainnya: typeMap.lainnya || 0
        },
        byPriority: {
          urgent: priorityMap.urgent || 0,
          tinggi: priorityMap.tinggi || 0,
          sedang: priorityMap.sedang || 0,
          rendah: priorityMap.rendah || 0
        }
      };
    } catch (error) {
      logger.error('Get task stats error:', error as Error);
      throw error;
    }
  }

  /**
   * Get analytics data
   */
  async getAnalytics(timeRange: '7d' | '30d' | '90d' = '30d') {
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const state = BotMonitorService.getState();
      const taskStats = await this.getTaskStats();

      // Get tasks created in time range
      const tasksInRange = await Task.countDocuments({
        createdAt: { $gte: startDate }
      });

      // Calculate completion rate
      const completionRate = taskStats.total > 0
        ? Math.round((taskStats.completed / taskStats.total) * 100)
        : 0;

      return {
        totalMessages: state.messageCount,
        totalTasks: taskStats.total,
        completionRate,
        activeUsers: 1, // TODO: Track actual users
        messageGrowth: 0, // TODO: Calculate growth
        taskGrowth: Math.round((tasksInRange / taskStats.total) * 100) || 0,
        completionGrowth: 0, // TODO: Calculate growth
        userGrowth: 0, // TODO: Calculate growth
        tasksByType: taskStats.byType,
        tasksByPriority: taskStats.byPriority,
        whatsapp: {
          messagesSent: state.messageCount,
          commandsProcessed: state.commandCount,
          activeGroups: state.whatsappConnected ? 1 : 0
        },
        discord: {
          messagesSent: 0,
          commandsProcessed: 0,
          activeChannels: state.discordConnected ? 1 : 0
        }
      };
    } catch (error) {
      logger.error('Get analytics error:', error as Error);
      throw error;
    }
  }
}

export default BotMonitorService;
