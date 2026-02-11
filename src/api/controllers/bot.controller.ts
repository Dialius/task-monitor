/**
 * Bot Controller
 * Control and monitor bot process
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { getLogger } from '../../utils/Logger';
import BotMonitorService from '../services/bot-monitor.service';
import BotManagerService from '../services/bot-manager.service';

const logger = getLogger();
const botMonitor = new BotMonitorService();
const botManager = new BotManagerService();

/**
 * Get bot status
 */
export const getStatus = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const managerStatus = botManager.getStatus();
    const monitorStatus = await botMonitor.getStatus();
    
    res.json({
      ...monitorStatus,
      status: managerStatus.status,
      error: managerStatus.error
    });
  } catch (error: any) {
    logger.error('Get status error', error);
    res.status(500).json({ error: 'Failed to get bot status' });
  }
};

/**
 * Start bot
 */
export const start = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await botManager.start();
    logger.info(`Bot started by user: ${req.user?.username}`);
    res.json({ success: true, message: 'Bot started successfully' });
  } catch (error: any) {
    logger.error('Start bot error', error);
    res.status(500).json({ error: 'Failed to start bot', details: error.message });
  }
};

/**
 * Stop bot
 */
export const stop = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await botManager.stop();
    logger.info(`Bot stopped by user: ${req.user?.username}`);
    res.json({ success: true, message: 'Bot stopped successfully' });
  } catch (error: any) {
    logger.error('Stop bot error', error);
    res.status(500).json({ error: 'Failed to stop bot', details: error.message });
  }
};

/**
 * Restart bot
 */
export const restart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await botManager.restart();
    logger.info(`Bot restarted by user: ${req.user?.username}`);
    res.json({ success: true, message: 'Bot restarted successfully' });
  } catch (error: any) {
    logger.error('Restart bot error', error);
    res.status(500).json({ error: 'Failed to restart bot', details: error.message });
  }
};

/**
 * Pause bot (not implemented - same as stop for now)
 */
export const pause = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await botManager.stop();
    logger.info(`Bot paused by user: ${req.user?.username}`);
    res.json({ success: true, message: 'Bot paused successfully' });
  } catch (error: any) {
    logger.error('Pause bot error', error);
    res.status(500).json({ error: 'Failed to pause bot', details: error.message });
  }
};

/**
 * Resume bot (not implemented - same as start for now)
 */
export const resume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await botManager.start();
    logger.info(`Bot resumed by user: ${req.user?.username}`);
    res.json({ success: true, message: 'Bot resumed successfully' });
  } catch (error: any) {
    logger.error('Resume bot error', error);
    res.status(500).json({ error: 'Failed to resume bot', details: error.message });
  }
};

/**
 * Get bot metrics
 */
export const getMetrics = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const metrics = await botMonitor.getMetrics();
    res.json(metrics);
  } catch (error: any) {
    logger.error('Get metrics error', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
};

/**
 * Get bot logs
 */
export const getLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get query params (for future use)
    req.query.limit;
    req.query.level;
    
    // TODO: Implement log reading from Winston log files
    // For now, return empty array
    res.json({
      logs: [],
      total: 0
    });
  } catch (error: any) {
    logger.error('Get logs error', error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
};

/**
 * Execute command
 */
export const executeCommand = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { command } = req.body;

    if (!command) {
      res.status(400).json({ error: 'Command required' });
      return;
    }

    logger.info(`Command executed by ${req.user?.username}: ${command}`);

    // TODO: Implement command execution
    // For now, return mock response
    res.json({
      output: `Command executed: ${command}`,
      exitCode: 0
    });
  } catch (error: any) {
    logger.error('Execute command error', error);
    res.status(500).json({ error: 'Failed to execute command' });
  }
};
