/**
 * Task Confirmation Service
 * Manages confirmation state for add_tugas_cepat command
 */

import { getLogger } from '../../utils/Logger';

const logger = getLogger();

interface ConfirmationData {
  userId: string;
  parsedTask: any;
  timestamp: number;
  messageId?: string;
}

/**
 * Service for managing task confirmation state
 */
export class TaskConfirmationService {
  private static confirmations: Map<string, ConfirmationData> = new Map();
  private static readonly TIMEOUT = 5 * 60 * 1000; // 5 minutes

  /**
   * Store confirmation data
   */
  static setPendingConfirmation(userId: string, parsedTask: any, messageId?: string): void {
    this.confirmations.set(userId, {
      userId,
      parsedTask,
      timestamp: Date.now(),
      messageId
    });

    logger.info('Pending confirmation stored', { userId, messageId });

    // Auto-cleanup after timeout
    setTimeout(() => {
      if (this.confirmations.has(userId)) {
        this.confirmations.delete(userId);
        logger.info('Confirmation expired', { userId });
      }
    }, this.TIMEOUT);
  }

  /**
   * Get pending confirmation
   */
  static getPendingConfirmation(userId: string): ConfirmationData | null {
    const data = this.confirmations.get(userId);
    
    if (!data) {
      return null;
    }

    // Check if expired
    if (Date.now() - data.timestamp > this.TIMEOUT) {
      this.confirmations.delete(userId);
      logger.info('Confirmation expired on retrieval', { userId });
      return null;
    }

    return data;
  }

  /**
   * Check if user has pending confirmation
   */
  static hasPendingConfirmation(userId: string): boolean {
    return this.getPendingConfirmation(userId) !== null;
  }

  /**
   * Clear confirmation
   */
  static clearConfirmation(userId: string): void {
    this.confirmations.delete(userId);
    logger.info('Confirmation cleared', { userId });
  }

  /**
   * Get all pending confirmations (for debugging)
   */
  static getAllPending(): Map<string, ConfirmationData> {
    return new Map(this.confirmations);
  }

  /**
   * Clear all confirmations (for testing)
   */
  static clearAll(): void {
    this.confirmations.clear();
    logger.info('All confirmations cleared');
  }
}
