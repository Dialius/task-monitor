/**
 * Command Parser
 * Requirements: 11.1, 11.2, 11.3, 11.8
 */

export interface ParsedCommand {
  command: string;
  args: string[];
  rawMessage: string;
}

/**
 * Command Parser for extracting commands and arguments
 */
export class CommandParser {
  /**
   * Parse message into command and arguments
   * Requirement: 11.1, 11.2, 11.3
   */
  parse(message: string): ParsedCommand | null {
    // Check if message starts with /
    if (!message.startsWith('/')) {
      return null;
    }

    // Remove leading /
    const content = message.substring(1).trim();
    
    if (!content) {
      return null;
    }

    // Split by | delimiter for arguments
    const parts = content.split('|').map(part => part.trim());
    
    // First part is the command
    const command = parts[0].toLowerCase();
    
    // Rest are arguments
    const args = parts.slice(1);

    return {
      command,
      args,
      rawMessage: message
    };
  }

  /**
   * Validate command format
   */
  isValidCommand(message: string): boolean {
    return message.startsWith('/') && message.length > 1;
  }

  /**
   * Extract command name only
   */
  getCommandName(message: string): string | null {
    const parsed = this.parse(message);
    return parsed ? parsed.command : null;
  }

  /**
   * Get argument count
   */
  getArgCount(message: string): number {
    const parsed = this.parse(message);
    return parsed ? parsed.args.length : 0;
  }
}
