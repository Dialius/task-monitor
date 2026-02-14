/**
 * Command With Progress Wrapper
 * Automatically adds progress messages to command execution
 */

import { ProgressMessage } from './ProgressMessage';
import { CommandResponse } from './CommandRouter';
import { Platform } from '../services/PermissionService';

export interface CommandContext {
  platform: Platform;
  chatId: string;
  userId: string;
  progressMessage?: ProgressMessage;
}

/**
 * Execute command with automatic progress message
 * 
 * Usage in command handler:
 * ```typescript
 * return await executeWithProgress(context, async (update) => {
 *   update('🔍 Mencari tugas...');
 *   const tasks = await taskService.getTasks();
 *   
 *   update('📊 Memformat hasil...');
 *   const formatted = formatTasks(tasks);
 *   
 *   return {
 *     success: true,
 *     message: formatted
 *   };
 * });
 * ```
 */
export async function executeWithProgress(
  context: CommandContext,
  operation: (update: (message: string) => Promise<void>) => Promise<CommandResponse>
): Promise<CommandResponse> {
  const { platform, chatId, progressMessage } = context;

  // If no progress message service, execute without progress
  if (!progressMessage) {
    return await operation(async () => {});
  }

  // Send initial progress message
  const reference = await progressMessage.send({
    platform,
    chatId,
    initialMessage: '⏳ Memproses perintah...'
  });

  // If failed to send progress message, execute without it
  if (!reference) {
    return await operation(async () => {});
  }

  try {
    // Create update function
    const update = async (message: string) => {
      await progressMessage.edit(reference, message);
    };

    // Execute operation with update callback
    const response = await operation(update);

    // Edit with final result
    if (platform === 'discord' && response.embedData) {
      // For Discord embeds, edit with embed
      await progressMessage.editWithEmbed(reference, response.embedData);
    } else {
      // For text messages, edit with text
      await progressMessage.edit(reference, response.message);
    }

    return response;
  } catch (error) {
    // Edit with error message
    await progressMessage.edit(reference, '❌ Terjadi kesalahan: ' + (error as Error).message);
    
    return {
      success: false,
      message: '❌ Terjadi kesalahan: ' + (error as Error).message
    };
  }
}

/**
 * Simple progress steps helper
 * 
 * Usage:
 * ```typescript
 * const steps = createProgressSteps([
 *   '🔍 Mencari data...',
 *   '📊 Memproses...',
 *   '✅ Selesai!'
 * ]);
 * 
 * await steps.next(update); // Shows step 1
 * await steps.next(update); // Shows step 2
 * await steps.next(update); // Shows step 3
 * ```
 */
export function createProgressSteps(steps: string[]) {
  let currentStep = 0;

  return {
    async next(update: (message: string) => Promise<void>): Promise<void> {
      if (currentStep < steps.length) {
        await update(steps[currentStep]);
        currentStep++;
      }
    },
    
    async skip(count: number, update: (message: string) => Promise<void>): Promise<void> {
      currentStep += count;
      if (currentStep < steps.length) {
        await update(steps[currentStep]);
      }
    },
    
    async jumpTo(step: number, update: (message: string) => Promise<void>): Promise<void> {
      if (step >= 0 && step < steps.length) {
        currentStep = step;
        await update(steps[currentStep]);
      }
    },
    
    reset(): void {
      currentStep = 0;
    }
  };
}
