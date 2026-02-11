/**
 * Confirmation Service
 * Handle confirmation flow for natural language task creation
 */

import { ParsedTask } from './AITaskParserService';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

interface PendingConfirmation {
  userId: string;
  platform: 'whatsapp' | 'discord';
  parsedTask: ParsedTask;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Confirmation Service
 * Manages pending confirmations with timeout
 */
export class ConfirmationService {
  private pendingConfirmations: Map<string, PendingConfirmation> = new Map();
  private readonly TIMEOUT_MS = 60000; // 60 seconds

  /**
   * Store pending confirmation
   */
  storePendingConfirmation(
    userId: string,
    platform: 'whatsapp' | 'discord',
    parsedTask: ParsedTask
  ): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.TIMEOUT_MS);

    this.pendingConfirmations.set(userId, {
      userId,
      platform,
      parsedTask,
      createdAt: now,
      expiresAt
    });

    logger.info('Stored pending confirmation', {
      userId,
      platform,
      expiresAt: expiresAt.toISOString()
    });

    // Auto-cleanup after timeout
    setTimeout(() => {
      if (this.pendingConfirmations.has(userId)) {
        this.pendingConfirmations.delete(userId);
        logger.info('Pending confirmation expired', { userId });
      }
    }, this.TIMEOUT_MS);
  }

  /**
   * Get pending confirmation
   */
  getPendingConfirmation(userId: string): PendingConfirmation | null {
    const pending = this.pendingConfirmations.get(userId);
    
    if (!pending) {
      return null;
    }

    // Check if expired
    if (new Date() > pending.expiresAt) {
      this.pendingConfirmations.delete(userId);
      logger.info('Pending confirmation expired on retrieval', { userId });
      return null;
    }

    return pending;
  }

  /**
   * Remove pending confirmation
   */
  removePendingConfirmation(userId: string): void {
    this.pendingConfirmations.delete(userId);
    logger.info('Removed pending confirmation', { userId });
  }

  /**
   * Check if user has pending confirmation
   */
  hasPendingConfirmation(userId: string): boolean {
    const pending = this.getPendingConfirmation(userId);
    return pending !== null;
  }

  /**
   * Update field in pending confirmation
   */
  updatePendingField(
    userId: string,
    field: keyof ParsedTask,
    value: any
  ): boolean {
    const pending = this.getPendingConfirmation(userId);
    
    if (!pending) {
      return false;
    }

    // Update the field
    (pending.parsedTask as any)[field] = value;

    // Reset expiration time
    pending.expiresAt = new Date(Date.now() + this.TIMEOUT_MS);

    logger.info('Updated pending confirmation field', {
      userId,
      field,
      value
    });

    return true;
  }

  /**
   * Format preview message
   */
  formatPreviewMessage(parsedTask: ParsedTask): string {
    const priorityEmoji = {
      urgent: '🔴',
      penting: '🟡',
      normal: '🟢'
    };

    const tipeEmoji = {
      individu: '👤',
      kelompok: '👥',
      ujian: '📝'
    };

    const deadlineStr = parsedTask.deadline.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `🤖 *Saya deteksi informasi berikut:*

📝 *Judul:* ${parsedTask.judul}
📚 *Mata Pelajaran:* ${parsedTask.mata_pelajaran}
📄 *Deskripsi:* ${parsedTask.deskripsi}
📅 *Deadline:* ${deadlineStr}
${tipeEmoji[parsedTask.tipe]} *Tipe:* ${parsedTask.tipe.charAt(0).toUpperCase() + parsedTask.tipe.slice(1)}
${priorityEmoji[parsedTask.prioritas]} *Prioritas:* ${parsedTask.prioritas.charAt(0).toUpperCase() + parsedTask.prioritas.slice(1)}

*Apakah sudah benar?*
• Ketik *ya* untuk simpan
• Ketik *edit [field] [value]* untuk ubah
• Ketik *batal* untuk cancel

*Contoh edit:*
• edit prioritas urgent
• edit deadline 2026-02-15 10:00
• edit tipe kelompok

⏱️ _Konfirmasi akan expired dalam 60 detik_`;
  }

  /**
   * Parse edit command
   */
  parseEditCommand(input: string): { field: string; value: string } | null {
    // Format: edit [field] [value]
    const match = input.match(/^edit\s+(\w+)\s+(.+)$/i);
    
    if (!match) {
      return null;
    }

    return {
      field: match[1].toLowerCase(),
      value: match[2].trim()
    };
  }

  /**
   * Apply edit to parsed task
   */
  applyEdit(
    parsedTask: ParsedTask,
    field: string,
    value: string
  ): { success: boolean; message: string; updatedTask?: ParsedTask } {
    const updated = { ...parsedTask };

    try {
      switch (field) {
        case 'judul':
          if (value.length < 3) {
            return { success: false, message: '❌ Judul minimal 3 karakter' };
          }
          updated.judul = value;
          break;

        case 'mata_pelajaran':
        case 'mapel':
          updated.mata_pelajaran = value;
          break;

        case 'deskripsi':
          if (value.length < 5) {
            return { success: false, message: '❌ Deskripsi minimal 5 karakter' };
          }
          updated.deskripsi = value;
          break;

        case 'deadline':
          const deadline = new Date(value);
          if (isNaN(deadline.getTime())) {
            return { success: false, message: '❌ Format deadline tidak valid. Contoh: 2026-02-15 10:00' };
          }
          if (deadline <= new Date()) {
            return { success: false, message: '❌ Deadline harus di masa depan' };
          }
          updated.deadline = deadline;
          break;

        case 'tipe':
          const tipe = value.toLowerCase();
          if (!['individu', 'kelompok', 'ujian'].includes(tipe)) {
            return { success: false, message: '❌ Tipe harus: individu, kelompok, atau ujian' };
          }
          updated.tipe = tipe as 'individu' | 'kelompok' | 'ujian';
          break;

        case 'prioritas':
          const prioritas = value.toLowerCase();
          if (!['urgent', 'penting', 'normal'].includes(prioritas)) {
            return { success: false, message: '❌ Prioritas harus: urgent, penting, atau normal' };
          }
          updated.prioritas = prioritas as 'urgent' | 'penting' | 'normal';
          break;

        default:
          return { 
            success: false, 
            message: `❌ Field '${field}' tidak dikenali. Field yang bisa diedit: judul, mata_pelajaran, deskripsi, deadline, tipe, prioritas` 
          };
      }

      return {
        success: true,
        message: `✅ ${field} berhasil diubah!`,
        updatedTask: updated
      };
    } catch (error) {
      logger.error('Failed to apply edit', error as Error, { field, value });
      return {
        success: false,
        message: `❌ Gagal mengubah ${field}: ${(error as Error).message}`
      };
    }
  }

  /**
   * Get statistics
   */
  getStats(): {
    pending: number;
    oldest?: Date;
  } {
    const pending = Array.from(this.pendingConfirmations.values());
    
    return {
      pending: pending.length,
      oldest: pending.length > 0 
        ? pending.reduce((oldest, p) => p.createdAt < oldest ? p.createdAt : oldest, pending[0].createdAt)
        : undefined
    };
  }
}

export default new ConfirmationService();
