/**
 * Rate Limiter Service
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */

import { CooldownResult } from '../../types/discord.types';
import { getLogger } from '../../utils/Logger';

const logger = getLogger();

/**
 * Rate Limiter Service
 * Enforces per-user cooldown periods
 */
export class RateLimiter {
  private cooldowns: Map<string, Map<string, number>> = new Map();
  private cleanupInterval?: NodeJS.Timeout;
  private readonly MAX_ENTRIES = 10000;
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private generalCooldown: number, // in seconds
    private commandCooldown: number // in seconds
  ) {
    this.startCleanup();
  }

  /**
   * Check if user is on cooldown
   * Requirement: 5.1, 5.2, 5.4
   */
  checkCooldown(userId: string, context: 'general' | 'command'): CooldownResult {
    try {
      const userCooldowns = this.cooldowns.get(userId);
      if (!userCooldowns) {
        return { allowed: true };
      }

      const lastUsed = userCooldowns.get(context);
      if (!lastUsed) {
        return { allowed: true };
      }

      const cooldownDuration = context === 'general' 
        ? this.generalCooldown * 1000 
        : this.commandCooldown * 1000;

      const now = Date.now();
      const timePassed = now - lastUsed;

      if (timePassed >= cooldownDuration) {
        return { allowed: true };
      }

      const remainingMs = cooldownDuration - timePassed;
      const remainingSeconds = Math.ceil(remainingMs / 1000);

      return {
        allowed: false,
        remainingSeconds
      };
    } catch (error) {
      logger.error('Error checking cooldown', error as Error, { userId, context });
      // Fail open - allow command on error
      return { allowed: true };
    }
  }

  /**
   * Set cooldown for user
   * Requirement: 5.1, 5.2, 5.4
   */
  setCooldown(userId: string, context: 'general' | 'command'): void {
    try {
      let userCooldowns = this.cooldowns.get(userId);
      
      if (!userCooldowns) {
        userCooldowns = new Map();
        this.cooldowns.set(userId, userCooldowns);
      }

      userCooldowns.set(context, Date.now());

      // Check if we need to cleanup due to max entries
      if (this.cooldowns.size > this.MAX_ENTRIES) {
        this.clearExpiredCooldowns();
      }
    } catch (error) {
      logger.error('Error setting cooldown', error as Error, { userId, context });
    }
  }

  /**
   * Clear expired cooldowns
   * Requirement: 5.6
   */
  clearExpiredCooldowns(): void {
    try {
      const now = Date.now();
      const maxCooldown = Math.max(this.generalCooldown, this.commandCooldown) * 1000;

      for (const [userId, userCooldowns] of this.cooldowns.entries()) {
        // Remove expired contexts
        for (const [context, timestamp] of userCooldowns.entries()) {
          if (now - timestamp > maxCooldown) {
            userCooldowns.delete(context);
          }
        }

        // Remove user entry if no cooldowns left
        if (userCooldowns.size === 0) {
          this.cooldowns.delete(userId);
        }
      }

      logger.debug('Cleared expired cooldowns', {
        remainingUsers: this.cooldowns.size
      });
    } catch (error) {
      logger.error('Error clearing expired cooldowns', error as Error);
    }
  }

  /**
   * Start periodic cleanup
   * Requirement: 5.6
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.clearExpiredCooldowns();
    }, this.CLEANUP_INTERVAL);

    logger.info('Rate limiter cleanup started', {
      interval: this.CLEANUP_INTERVAL / 1000 / 60,
      unit: 'minutes'
    });
  }

  /**
   * Stop periodic cleanup
   * Requirement: 5.6
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
      logger.info('Rate limiter cleanup stopped');
    }
  }

  /**
   * Get cooldown statistics
   */
  getStats(): { totalUsers: number; totalCooldowns: number } {
    let totalCooldowns = 0;
    for (const userCooldowns of this.cooldowns.values()) {
      totalCooldowns += userCooldowns.size;
    }

    return {
      totalUsers: this.cooldowns.size,
      totalCooldowns
    };
  }

  /**
   * Clear all cooldowns (for testing)
   */
  clearAll(): void {
    this.cooldowns.clear();
    logger.info('All cooldowns cleared');
  }
}
