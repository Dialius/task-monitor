/**
 * Analytics Controller
 * Get analytics and statistics
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { getLogger } from '../../utils/Logger';
import BotMonitorService from '../services/bot-monitor.service';

const logger = getLogger();
const botMonitor = new BotMonitorService();

/**
 * Get analytics data
 */
export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const range = (req.query.range as '7d' | '30d' | '90d') || '30d';
    const analytics = await botMonitor.getAnalytics(range);
    res.json(analytics);
  } catch (error: any) {
    logger.error('Get analytics error', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
};

/**
 * Get task statistics
 */
export const getTaskStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await botMonitor.getTaskStats();
    res.json(stats);
  } catch (error: any) {
    logger.error('Get task stats error', error);
    res.status(500).json({ error: 'Failed to get task statistics' });
  }
};
