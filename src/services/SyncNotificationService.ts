import { EmbedBuilder } from 'discord.js';
import { DiscordClient } from '../clients/DiscordClient';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

export class SyncNotificationService {
    private discordClient: DiscordClient;
    private logChannelId: string;

    constructor(discordClient: DiscordClient, logChannelId: string) {
        this.discordClient = discordClient;
        this.logChannelId = logChannelId;

        if (!logChannelId) {
            logger.warn('SyncNotificationService initialized without logChannelId - notifications disabled');
        }
    }

    /**
     * Send sync success notification
     */
    async sendSyncSuccess(
        source: string,
        stats: { fromNotion: number; toNotion: number; updated: number; errors: number },
        durationMs: number
    ): Promise<void> {
        if (!this.logChannelId || !this.discordClient.isReady()) return;

        try {
            const embed = new EmbedBuilder()
                .setTitle(`✅ ${source} Sync Completed`)
                .setColor(0x57F287) // Green
                .addFields(
                    { name: '📥 From Notion', value: stats.fromNotion.toString(), inline: true },
                    { name: '📤 To Notion', value: stats.toNotion.toString(), inline: true },
                    { name: '🔄 Updated', value: stats.updated.toString(), inline: true },
                    { name: '❌ Errors', value: stats.errors.toString(), inline: true },
                    { name: '⏱️ Duration', value: `${(durationMs / 1000).toFixed(2)}s`, inline: true }
                )
                .setTimestamp();

            await this.discordClient.sendEmbed(this.logChannelId, embed);
        } catch (error) {
            logger.error('Failed to send sync success notification', error as Error);
        }
    }

    /**
     * Send sync error notification
     */
    async sendSyncError(source: string, error: Error): Promise<void> {
        if (!this.logChannelId || !this.discordClient.isReady()) return;

        try {
            const embed = new EmbedBuilder()
                .setTitle(`❌ ${source} Sync Failed`)
                .setDescription(`Error: ${error.message}`)
                .setColor(0xED4245) // Red
                .setTimestamp();

            await this.discordClient.sendEmbed(this.logChannelId, embed);
        } catch (sendError) {
            logger.error('Failed to send sync error notification', sendError as Error);
        }
    }

    /**
     * Send sync warning notification
     */
    async sendSyncWarning(source: string, message: string): Promise<void> {
        if (!this.logChannelId || !this.discordClient.isReady()) return;

        try {
            const embed = new EmbedBuilder()
                .setTitle(`⚠️ ${source} Sync Warning`)
                .setDescription(message)
                .setColor(0xFEE75C) // Yellow
                .setTimestamp();

            await this.discordClient.sendEmbed(this.logChannelId, embed);
        } catch (error) {
            logger.error('Failed to send sync warning notification', error as Error);
        }
    }
}
