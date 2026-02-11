/**
 * Bot Manager Service
 * Manage bot lifecycle (start/stop/restart)
 */

import { getLogger } from '../../utils/Logger';
import { BotMonitorService } from './bot-monitor.service';

const logger = getLogger();

// Bot instance reference
let botInstance: any = null;
let botStatus: 'stopped' | 'starting' | 'running' | 'stopping' | 'error' = 'stopped';
let botError: string | null = null;

export class BotManagerService {
  /**
   * Start bot
   */
  async start(): Promise<void> {
    if (botStatus === 'running') {
      throw new Error('Bot is already running');
    }

    if (botStatus === 'starting') {
      throw new Error('Bot is already starting');
    }

    try {
      botStatus = 'starting';
      botError = null;
      logger.info('Starting bot...');

      // Dynamically import and initialize bot
      const { MultiPlatformBot } = await import('../../bot');
      botInstance = new MultiPlatformBot();
      
      await botInstance.initialize();
      
      botStatus = 'running';
      logger.info('Bot started successfully');

      // Update monitor state
      BotMonitorService.updateState({
        startTime: Date.now()
      });

    } catch (error: any) {
      botStatus = 'error';
      botError = error.message;
      logger.error('Failed to start bot', error);
      throw error;
    }
  }

  /**
   * Stop bot
   */
  async stop(): Promise<void> {
    if (botStatus === 'stopped') {
      throw new Error('Bot is already stopped');
    }

    if (botStatus === 'stopping') {
      throw new Error('Bot is already stopping');
    }

    try {
      botStatus = 'stopping';
      logger.info('Stopping bot...');

      if (botInstance && typeof botInstance.stop === 'function') {
        await botInstance.stop();
      }

      botInstance = null;
      botStatus = 'stopped';
      botError = null;
      logger.info('Bot stopped successfully');

      // Update monitor state
      BotMonitorService.updateState({
        whatsappConnected: false,
        discordConnected: false,
        messageCount: 0,
        commandCount: 0
      });

    } catch (error: any) {
      botStatus = 'error';
      botError = error.message;
      logger.error('Failed to stop bot', error);
      throw error;
    }
  }

  /**
   * Restart bot
   */
  async restart(): Promise<void> {
    logger.info('Restarting bot...');
    
    if (botStatus === 'running' || botStatus === 'error') {
      await this.stop();
      // Wait a bit before restarting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    await this.start();
  }

  /**
   * Get bot status
   */
  getStatus(): { status: typeof botStatus; error: string | null } {
    return {
      status: botStatus,
      error: botError
    };
  }

  /**
   * Check if bot is running
   */
  isRunning(): boolean {
    return botStatus === 'running';
  }
}

export default BotManagerService;
