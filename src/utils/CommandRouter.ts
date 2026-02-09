/**
 * Command Router
 * Requirements: 11.4, 11.5, 12.3
 */

import { ParsedCommand } from './CommandParser';
import { PermissionService, Platform } from '../services/PermissionService';
import { getLogger } from './Logger';

const logger = getLogger();

export interface CommandResponse {
  success: boolean;
  message: string;
  data?: any;
  embedData?: {
    title: string;
    color: number;
    fields: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
  };
}

export type CommandHandler = (
  args: string[],
  userId: string,
  platform: Platform
) => Promise<CommandResponse>;

/**
 * Command Router for routing commands to appropriate handlers
 */
export class CommandRouter {
  private permissionService: PermissionService;
  private handlers: Map<string, CommandHandler> = new Map();

  constructor(permissionService: PermissionService) {
    this.permissionService = permissionService;
  }

  /**
   * Register command handler
   */
  registerHandler(command: string, handler: CommandHandler): void {
    this.handlers.set(command.toLowerCase(), handler);
  }

  /**
   * Route command to appropriate handler
   * Requirement: 11.4, 11.5
   */
  async route(
    command: ParsedCommand,
    userId: string,
    platform: Platform
  ): Promise<CommandResponse> {
    try {
      // Check if handler exists
      const handler = this.handlers.get(command.command);
      
      if (!handler) {
        logger.warn('Invalid command', {
          command: command.command,
          userId,
          platform
        });
        
        return {
          success: false,
          message: `❌ Perintah tidak dikenali: /${command.command}\n\nGunakan /help untuk melihat daftar perintah.`
        };
      }

      // Check permissions
      const canExecute = await this.permissionService.canExecuteCommand(
        userId,
        platform,
        command.command
      );

      if (!canExecute) {
        logger.warn('Permission denied', {
          command: command.command,
          userId,
          platform
        });

        return {
          success: false,
          message: '❌ Anda tidak memiliki izin untuk menjalankan perintah ini.'
        };
      }

      // Execute handler
      logger.logCommand(command.command, userId, true, {
        platform,
        argCount: command.args.length
      });

      return await handler(command.args, userId, platform);
    } catch (error) {
      logger.error('Command execution failed', error as Error, {
        command: command.command,
        userId,
        platform
      });

      logger.logCommand(command.command, userId, false, {
        error: (error as Error).message
      });

      return {
        success: false,
        message: '❌ Terjadi kesalahan saat menjalankan perintah. Silakan coba lagi.'
      };
    }
  }

  /**
   * Get all registered commands
   */
  getRegisteredCommands(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Check if command is registered
   */
  isCommandRegistered(command: string): boolean {
    return this.handlers.has(command.toLowerCase());
  }
}
