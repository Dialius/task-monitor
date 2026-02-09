/**
 * Logger Utility Class
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

export interface LoggerConfig {
  logDir: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  rotationInterval: 'daily' | 'weekly';
}

export class Logger {
  private logger: winston.Logger;
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
    this.logger = this.createLogger();
  }

  /**
   * Create Winston logger with console and file transports
   * Requirement: 13.5
   */
  private createLogger(): winston.Logger {
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        if (Object.keys(meta).length > 0) {
          log += ` ${JSON.stringify(meta)}`;
        }
        return log;
      })
    );

    // Daily rotate file transport
    const fileTransport = new DailyRotateFile({
      dirname: this.config.logDir,
      filename: 'bot-%DATE%.log',
      datePattern: this.config.rotationInterval === 'daily' ? 'YYYY-MM-DD' : 'YYYY-WW',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    });

    // Console transport
    const consoleTransport = new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    });

    return winston.createLogger({
      level: this.config.logLevel,
      transports: [fileTransport, consoleTransport]
    });
  }

  /**
   * Log info message
   * Requirement: 13.1
   */
  info(message: string, context?: any): void {
    this.logger.info(message, context);
  }

  /**
   * Log error message
   * Requirement: 13.4
   */
  error(message: string, error?: Error, context?: any): void {
    this.logger.error(message, {
      error: error ? {
        message: error.message,
        stack: error.stack
      } : undefined,
      ...context
    });
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: any): void {
    this.logger.warn(message, context);
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: any): void {
    this.logger.debug(message, context);
  }

  /**
   * Log command execution
   * Requirement: 13.1
   */
  logCommand(command: string, user: string, success: boolean, details?: any): void {
    this.logger.info('Command executed', {
      command,
      user,
      success,
      details
    });
  }

  /**
   * Log AI service request
   * Requirement: 13.3
   */
  logAIRequest(service: string, success: boolean, latency: number): void {
    this.logger.info('AI service request', {
      service,
      success,
      latency_ms: latency
    });
  }

  /**
   * Log database operation
   * Requirement: 13.2
   */
  logDBOperation(operation: string, collection: string, success: boolean): void {
    this.logger.info('Database operation', {
      operation,
      collection,
      success
    });
  }

  /**
   * Rotate log files
   * Requirement: 13.6
   */
  async rotateLogs(): Promise<void> {
    // Winston daily rotate file handles rotation automatically
    this.logger.info('Log rotation check completed');
  }
}

// Export singleton instance
let loggerInstance: Logger | null = null;

export function initializeLogger(config: LoggerConfig): Logger {
  if (!loggerInstance) {
    loggerInstance = new Logger(config);
  }
  return loggerInstance;
}

export function getLogger(): Logger {
  if (!loggerInstance) {
    // Create default logger if not initialized
    loggerInstance = new Logger({
      logDir: path.join(process.cwd(), 'logs'),
      logLevel: 'info',
      rotationInterval: 'daily'
    });
  }
  return loggerInstance;
}
