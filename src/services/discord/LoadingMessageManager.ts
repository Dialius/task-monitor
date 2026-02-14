/**
 * Loading Message Manager
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { DiscordConfigManager } from './DiscordConfigManager';
import { getLogger } from '../../utils/Logger';

const logger = getLogger();

/**
 * Loading Message Manager
 * Manages loading indicators for button interactions
 */
export class LoadingMessageManager {
  private readonly MIN_DISPLAY_TIME = 500; // milliseconds
  private sendTimestamps: Map<string, number> = new Map();

  constructor(private configManager: DiscordConfigManager) {}

  /**
   * Send loading message
   * Requirement: 6.1, 6.3
   */
  async sendLoadingMessage(interaction: ButtonInteraction): Promise<void> {
    try {
      // Use ephemeral for button interactions - only visible to the user who clicked
      await interaction.deferReply({ ephemeral: true });
      
      // Store timestamp
      this.sendTimestamps.set(interaction.id, Date.now());

      logger.debug('Loading message sent', {
        interactionId: interaction.id,
        userId: interaction.user.id
      });
    } catch (error) {
      logger.error('Failed to send loading message', error as Error);
      throw error;
    }
  }

  /**
   * Edit with response
   * Requirement: 6.2, 6.5
   */
  async editWithResponse(
    interaction: ButtonInteraction,
    embed: EmbedBuilder
  ): Promise<void> {
    try {
      // Ensure minimum display time
      await this.ensureMinimumDisplayTime(interaction.id);

      await interaction.editReply({
        content: '',
        embeds: [embed]
      });

      // Clean up timestamp
      this.sendTimestamps.delete(interaction.id);

      logger.debug('Loading message edited with response', {
        interactionId: interaction.id,
        userId: interaction.user.id
      });
    } catch (error) {
      logger.error('Failed to edit loading message with response', error as Error);
      throw error;
    }
  }

  /**
   * Edit with error
   * Requirement: 6.4
   */
  async editWithError(
    interaction: ButtonInteraction,
    errorMessage: string
  ): Promise<void> {
    try {
      // Ensure minimum display time
      await this.ensureMinimumDisplayTime(interaction.id);

      const errorEmoji = this.configManager.getEmoji('error');
      const message = `${errorEmoji} ${errorMessage}`;

      await interaction.editReply({
        content: message,
        embeds: []
      });

      // Clean up timestamp
      this.sendTimestamps.delete(interaction.id);

      logger.debug('Loading message edited with error', {
        interactionId: interaction.id,
        userId: interaction.user.id,
        error: errorMessage
      });
    } catch (error) {
      logger.error('Failed to edit loading message with error', error as Error);
      throw error;
    }
  }

  /**
   * Ensure minimum display time
   * Requirement: 6.5
   */
  private async ensureMinimumDisplayTime(interactionId: string): Promise<void> {
    const sendTime = this.sendTimestamps.get(interactionId);
    if (!sendTime) return;

    const elapsed = Date.now() - sendTime;
    if (elapsed < this.MIN_DISPLAY_TIME) {
      const remaining = this.MIN_DISPLAY_TIME - elapsed;
      await new Promise(resolve => setTimeout(resolve, remaining));
    }
  }
}
