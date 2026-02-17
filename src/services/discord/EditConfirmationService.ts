/**
 * Edit Confirmation Service
 * Manages confirmation state for edit/delete/complete command flows
 */

import { getLogger } from '../../utils/Logger';

const logger = getLogger();

export type EditActionType =
    | 'edit_tugas'
    | 'edit_jadwal'
    | 'hapus_tugas'
    | 'hapus_jadwal'
    | 'tandai_selesai'
    | 'ganti_jadwal';

export interface EditConfirmationData {
    userId: string;
    type: EditActionType;
    itemId: string;
    originalData: Record<string, any>;
    newData?: Record<string, any>;  // Set after modal submission
    timestamp: number;
}

/**
 * Service for managing edit/delete confirmation state
 */
export class EditConfirmationService {
    private static confirmations: Map<string, EditConfirmationData> = new Map();
    private static readonly TIMEOUT = 5 * 60 * 1000; // 5 minutes

    /**
     * Store pending edit/delete confirmation
     */
    static setPending(userId: string, type: EditActionType, itemId: string, originalData: Record<string, any>): void {
        this.confirmations.set(userId, {
            userId,
            type,
            itemId,
            originalData,
            timestamp: Date.now()
        });

        logger.info('Edit confirmation stored', { userId, type, itemId });

        // Auto-cleanup after timeout
        setTimeout(() => {
            if (this.confirmations.has(userId)) {
                this.confirmations.delete(userId);
                logger.info('Edit confirmation expired', { userId });
            }
        }, this.TIMEOUT);
    }

    /**
     * Update with new data after modal submission
     */
    static setNewData(userId: string, newData: Record<string, any>): boolean {
        const data = this.getPending(userId);
        if (!data) return false;

        data.newData = newData;
        data.timestamp = Date.now(); // Reset timeout
        this.confirmations.set(userId, data);

        logger.info('Edit confirmation updated with new data', { userId });
        return true;
    }

    /**
     * Get pending confirmation
     */
    static getPending(userId: string): EditConfirmationData | null {
        const data = this.confirmations.get(userId);

        if (!data) return null;

        // Check if expired
        if (Date.now() - data.timestamp > this.TIMEOUT) {
            this.confirmations.delete(userId);
            logger.info('Edit confirmation expired on retrieval', { userId });
            return null;
        }

        return data;
    }

    /**
     * Check if user has pending confirmation
     */
    static hasPending(userId: string): boolean {
        return this.getPending(userId) !== null;
    }

    /**
     * Clear confirmation
     */
    static clear(userId: string): void {
        this.confirmations.delete(userId);
        logger.info('Edit confirmation cleared', { userId });
    }

    /**
     * Format diff message comparing original vs new data
     */
    static formatDiff(originalData: Record<string, any>, newData: Record<string, any>): string {
        const lines: string[] = [];

        for (const key of Object.keys(newData)) {
            const newVal = newData[key];
            if (newVal === '' || newVal === undefined || newVal === null) continue; // Skip empty = no change

            const oldVal = originalData[key] ?? '(kosong)';

            // Format display values
            let displayOld = String(oldVal);
            let displayNew = String(newVal);

            // Special formatting for dates
            if (key === 'deadline' && oldVal instanceof Date) {
                displayOld = oldVal.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
            }

            if (displayOld !== displayNew) {
                const fieldLabel = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                lines.push(`**${fieldLabel}:** \`${displayOld}\` → \`${displayNew}\``);
            }
        }

        if (lines.length === 0) {
            return '*Tidak ada perubahan*';
        }

        return lines.join('\n');
    }
}
