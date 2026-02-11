/**
 * PM2 Service
 * Control bot process via PM2 API
 */

import pm2 from 'pm2';
import { getLogger } from '../../utils/Logger';

const logger = getLogger();

export interface ProcessStatus {
  status: 'online' | 'stopped' | 'errored' | 'unknown';
  pid?: number;
  uptime: number;
  restarts: number;
  cpu: number;
  memory: number;
}

export interface ProcessMetrics {
  cpu: number;
  memory: number;
  uptime: number;
}

export class PM2Service {
  private processName: string;

  constructor(processName: string = 'task-monitor') {
    this.processName = processName;
  }

  /**
   * Connect to PM2
   */
  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) {
          logger.error('PM2 connect error', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Disconnect from PM2
   */
  private disconnect(): void {
    pm2.disconnect();
  }

  /**
   * Get bot process status
   */
  async getStatus(): Promise<ProcessStatus> {
    try {
      await this.connect();

      return new Promise((resolve, reject) => {
        pm2.describe(this.processName, (err, processDescription) => {
          this.disconnect();

          if (err) {
            logger.error('PM2 describe error', err);
            return reject(err);
          }

          if (!processDescription || processDescription.length === 0) {
            return resolve({
              status: 'stopped',
              uptime: 0,
              restarts: 0,
              cpu: 0,
              memory: 0
            });
          }

          const proc = processDescription[0];
          const pm2Env = proc.pm2_env as any;

          resolve({
            status: pm2Env.status as any,
            pid: proc.pid,
            uptime: pm2Env.pm_uptime ? (Date.now() - pm2Env.pm_uptime) / 1000 : 0,
            restarts: pm2Env.restart_time || 0,
            cpu: proc.monit?.cpu || 0,
            memory: proc.monit?.memory || 0
          });
        });
      });
    } catch (error: any) {
      logger.error('Get status error', error);
      throw error;
    }
  }

  /**
   * Start bot process
   */
  async start(): Promise<void> {
    try {
      await this.connect();

      return new Promise((resolve, reject) => {
        pm2.start('ecosystem.config.js', (err) => {
          this.disconnect();

          if (err) {
            logger.error('PM2 start error', err);
            return reject(err);
          }

          logger.info(`Bot process started: ${this.processName}`);
          resolve();
        });
      });
    } catch (error: any) {
      logger.error('Start error', error);
      throw error;
    }
  }

  /**
   * Stop bot process
   */
  async stop(): Promise<void> {
    try {
      await this.connect();

      return new Promise((resolve, reject) => {
        pm2.stop(this.processName, (err) => {
          this.disconnect();

          if (err) {
            logger.error('PM2 stop error', err);
            return reject(err);
          }

          logger.info(`Bot process stopped: ${this.processName}`);
          resolve();
        });
      });
    } catch (error: any) {
      logger.error('Stop error', error);
      throw error;
    }
  }

  /**
   * Restart bot process
   */
  async restart(): Promise<void> {
    try {
      await this.connect();

      return new Promise((resolve, reject) => {
        pm2.restart(this.processName, (err) => {
          this.disconnect();

          if (err) {
            logger.error('PM2 restart error', err);
            return reject(err);
          }

          logger.info(`Bot process restarted: ${this.processName}`);
          resolve();
        });
      });
    } catch (error: any) {
      logger.error('Restart error', error);
      throw error;
    }
  }

  /**
   * Pause bot process (send SIGSTOP)
   */
  async pause(): Promise<void> {
    try {
      const status = await this.getStatus();

      if (status.status !== 'online') {
        throw new Error('Process is not running');
      }

      if (!status.pid) {
        throw new Error('Process PID not found');
      }

      // Send SIGSTOP to pause process
      process.kill(status.pid, 'SIGSTOP');
      logger.info(`Bot process paused: ${this.processName} (PID: ${status.pid})`);
    } catch (error: any) {
      logger.error('Pause error', error);
      throw error;
    }
  }

  /**
   * Resume bot process (send SIGCONT)
   */
  async resume(): Promise<void> {
    try {
      const status = await this.getStatus();

      if (!status.pid) {
        throw new Error('Process PID not found');
      }

      // Send SIGCONT to resume process
      process.kill(status.pid, 'SIGCONT');
      logger.info(`Bot process resumed: ${this.processName} (PID: ${status.pid})`);
    } catch (error: any) {
      logger.error('Resume error', error);
      throw error;
    }
  }

  /**
   * Get process metrics
   */
  async getMetrics(): Promise<ProcessMetrics> {
    try {
      const status = await this.getStatus();
      
      // Convert memory from bytes to percentage
      const totalMemory = require('os').totalmem();
      const memoryPercent = (status.memory / totalMemory) * 100;
      
      // Convert uptime from milliseconds to seconds
      const uptimeSeconds = Math.floor(status.uptime / 1000);
      
      return {
        cpu: status.cpu,
        memory: memoryPercent,
        uptime: uptimeSeconds
      };
    } catch (error: any) {
      logger.error('Get metrics error', error);
      throw error;
    }
  }

  /**
   * Delete process from PM2
   */
  async delete(): Promise<void> {
    try {
      await this.connect();

      return new Promise((resolve, reject) => {
        pm2.delete(this.processName, (err) => {
          this.disconnect();

          if (err) {
            logger.error('PM2 delete error', err);
            return reject(err);
          }

          logger.info(`Bot process deleted: ${this.processName}`);
          resolve();
        });
      });
    } catch (error: any) {
      logger.error('Delete error', error);
      throw error;
    }
  }
}
