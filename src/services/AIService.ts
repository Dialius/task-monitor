/**
 * AI Service with Groq and Gemini fallback
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
 */

import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

export interface AIConfig {
  apiKey: string;
  model: string;
  timeout: number;
}

export interface RecapData {
  tasks: any[];
  schedules: any[];
  piket: any[];
  announcements: any[];
  statistics?: {
    totalTasks: number;
    tasksByType: Record<string, number>;
    tasksByPriority: Record<string, number>;
  };
}

/**
 * AI Service for text formatting with fallback mechanism
 */
export class AIService {
  private groqClient: Groq;
  private geminiClient: GoogleGenerativeAI;
  private groqConfig: AIConfig;
  private geminiConfig: AIConfig;

  constructor(groqConfig: AIConfig, geminiConfig: AIConfig) {
    this.groqConfig = groqConfig;
    this.geminiConfig = geminiConfig;

    this.groqClient = new Groq({
      apiKey: groqConfig.apiKey
    });

    this.geminiClient = new GoogleGenerativeAI(geminiConfig.apiKey);
  }

  /**
   * Rewrite text with AI (Groq primary, Gemini fallback)
   * Requirement: 8.1, 8.2, 8.3, 8.6, 8.7
   */
  async rewriteText(text: string, context: string): Promise<string> {
    const startTime = Date.now();

    try {
      // Try Groq first
      const result = await this.rewriteWithGroq(text, context);
      const latency = Date.now() - startTime;

      logger.logAIRequest('groq', true, latency);
      return result;
    } catch (groqError) {
      logger.warn('Groq service failed, falling back to Gemini', {
        error: (groqError as Error).message
      });

      try {
        // Fallback to Gemini
        const result = await this.rewriteWithGemini(text, context);
        const latency = Date.now() - startTime;

        logger.logAIRequest('gemini', true, latency);
        return result;
      } catch (geminiError) {
        logger.error('Both AI services failed, using original text', geminiError as Error);
        logger.logAIRequest('gemini', false, Date.now() - startTime);

        // Return original text if both fail
        return text;
      }
    }
  }

  /**
   * Rewrite text using Groq
   */
  private async rewriteWithGroq(text: string, context: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.groqConfig.timeout * 1000);

    try {
      const completion = await this.groqClient.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a text editor that makes descriptions concise. ${context}. Output only the improved text, nothing else.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        model: this.groqConfig.model,
        temperature: 0.3,
        max_tokens: 100
      });

      clearTimeout(timeoutId);

      return completion.choices[0]?.message?.content || text;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Parse task text with AI — uses higher token limit for JSON output
   * This is separate from rewriteText which has low token limits
   */
  async parseTaskText(text: string, context: string): Promise<string> {
    const startTime = Date.now();

    try {
      // Try Groq first with higher token limit
      const result = await this.parseWithGroq(text, context);
      const latency = Date.now() - startTime;

      logger.logAIRequest('groq', true, latency);
      return result;
    } catch (groqError) {
      logger.warn('Groq parse failed, falling back to Gemini', {
        error: (groqError as Error).message
      });

      try {
        // Fallback to Gemini
        const result = await this.parseWithGemini(text, context);
        const latency = Date.now() - startTime;

        logger.logAIRequest('gemini', true, latency);
        return result;
      } catch (geminiError) {
        logger.error('Both AI services failed for parsing', geminiError as Error);
        logger.logAIRequest('gemini', false, Date.now() - startTime);

        throw new Error('AI parsing failed on both providers');
      }
    }
  }

  /**
   * Parse task with Groq — higher token limit for JSON
   */
  private async parseWithGroq(text: string, context: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.groqConfig.timeout * 1000);

    try {
      const completion = await this.groqClient.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: context
          },
          {
            role: 'user',
            content: text
          }
        ],
        model: this.groqConfig.model,
        temperature: 0.1, // Very low temperature for deterministic date output
        max_tokens: 500   // Higher limit for JSON output
      });

      clearTimeout(timeoutId);

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Parse task with Gemini — higher token limit for JSON
   */
  private async parseWithGemini(text: string, context: string): Promise<string> {
    const model = this.geminiClient.getGenerativeModel({
      model: this.geminiConfig.model
    });

    const prompt = `${context}\n\n${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text() || '';
  }

  /**
   * Rewrite text using Gemini
   */
  private async rewriteWithGemini(text: string, context: string): Promise<string> {
    const model = this.geminiClient.getGenerativeModel({
      model: this.geminiConfig.model
    });

    const prompt = `${context}\n\nText: ${text}\n\nProvide a concise, clear version in Indonesian.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text() || text;
  }

  /**
   * Format recap message with AI
   * Requirement: 8.4, 8.5
   */
  async formatRecap(recapData: RecapData, type: 'daily' | 'weekly'): Promise<string> {
    const startTime = Date.now();

    try {
      // Build recap content
      let content = type === 'daily' ? '📅 Recap Harian\n\n' : '📊 Recap Mingguan\n\n';

      // Add schedules
      if (recapData.schedules.length > 0) {
        content += '📖 Jadwal:\n';
        recapData.schedules.forEach(s => {
          content += `- ${s.mata_pelajaran} (${s.jam_mulai}-${s.jam_selesai})\n`;
        });
        content += '\n';
      }

      // Add tasks
      if (recapData.tasks.length > 0) {
        content += '📝 Tugas:\n';
        recapData.tasks.forEach(t => {
          content += `- ${t.judul} (${t.mata_pelajaran}) - Deadline: ${new Date(t.deadline).toLocaleDateString('id-ID')}\n`;
        });
        content += '\n';
      }

      // Add piket
      if (recapData.piket.length > 0) {
        content += '🧹 Piket:\n';
        recapData.piket.forEach(p => {
          content += `- ${p.hari}: ${p.nama_siswa.join(', ')}\n`;
        });
        content += '\n';
      }

      // Add announcements
      if (recapData.announcements.length > 0) {
        content += '📢 Pengumuman:\n';
        recapData.announcements.forEach(a => {
          content += `- ${a.judul}: ${a.keterangan}\n`;
        });
        content += '\n';
      }

      // Add statistics for weekly recap
      if (type === 'weekly' && recapData.statistics) {
        content += '📊 Statistik:\n';
        content += `Total Tugas: ${recapData.statistics.totalTasks}\n`;
        content += 'Per Tipe:\n';
        Object.entries(recapData.statistics.tasksByType).forEach(([tipe, count]) => {
          content += `  - ${tipe}: ${count}\n`;
        });
        content += 'Per Prioritas:\n';
        Object.entries(recapData.statistics.tasksByPriority).forEach(([prioritas, count]) => {
          content += `  - ${prioritas}: ${count}\n`;
        });
      }

      // Format with AI
      const formatted = await this.rewriteText(
        content,
        `Format this ${type} recap to be engaging with emojis and clear structure`
      );

      const latency = Date.now() - startTime;
      logger.info(`Recap formatted successfully (${type})`, { latency });

      return formatted;
    } catch (error) {
      logger.error('Failed to format recap', error as Error);
      // Return basic formatted content if AI fails
      return this.buildBasicRecap(recapData, type);
    }
  }

  /**
   * Build basic recap without AI formatting
   */
  private buildBasicRecap(recapData: RecapData, type: 'daily' | 'weekly'): string {
    let content = type === 'daily' ? '📅 *Recap Harian*\n\n' : '📊 *Recap Mingguan*\n\n';

    if (recapData.schedules.length > 0) {
      content += '📖 *Jadwal:*\n';
      recapData.schedules.forEach(s => {
        content += `• ${s.mata_pelajaran} (${s.jam_mulai}-${s.jam_selesai})\n`;
      });
      content += '\n';
    }

    if (recapData.tasks.length > 0) {
      content += '📝 *Tugas:*\n';
      recapData.tasks.forEach(t => {
        content += `• ${t.judul} - ${t.mata_pelajaran}\n`;
      });
      content += '\n';
    }

    if (recapData.piket.length > 0) {
      content += '🧹 *Piket:*\n';
      recapData.piket.forEach(p => {
        content += `• ${p.hari}: ${p.nama_siswa.join(', ')}\n`;
      });
      content += '\n';
    }

    if (recapData.announcements.length > 0) {
      content += '📢 *Pengumuman:*\n';
      recapData.announcements.forEach(a => {
        content += `• ${a.judul}\n`;
      });
    }

    return content;
  }
}
