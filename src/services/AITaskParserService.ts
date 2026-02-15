/**
 * AI Task Parser Service
 * Parse natural language input to extract task information
 */

import { AIService } from './AIService';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

export interface ParsedTask {
  judul: string;
  mata_pelajaran: string;
  deskripsi: string;
  deadline: Date;
  tipe: 'individu' | 'kelompok' | 'ujian';
  prioritas: 'urgent' | 'penting' | 'normal';
}

/**
 * AI Task Parser Service
 */
export class AITaskParserService {
  private aiService: AIService;

  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  /**
   * Parse natural language input to extract task information
   */
  async parseNaturalLanguage(input: string): Promise<ParsedTask | null> {
    try {
      const { DateTimeHelper } = require('../utils/DateTimeHelper');
      const currentDate = DateTimeHelper.now();
      const prompt = this.buildPrompt(input, currentDate);

      logger.info('Parsing natural language input', { input });

      // Use AI to parse (using rewriteText as a workaround)
      const context = 'Parse this natural language input and return ONLY valid JSON with task information. Follow the format and rules exactly.';
      const response = await this.aiService.rewriteText(prompt, context);
      
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                       response.match(/```\s*([\s\S]*?)\s*```/) ||
                       [null, response];
      
      const jsonStr = jsonMatch[1] || response;
      const parsed = JSON.parse(jsonStr.trim());

      // Validate and convert deadline to Date
      if (!parsed.deadline) {
        throw new Error('Deadline not found in parsed result');
      }

      parsed.deadline = DateTimeHelper.parseDate(parsed.deadline);

      // Validate deadline is in the future
      if (parsed.deadline <= currentDate) {
        throw new Error('Deadline must be in the future');
      }

      // Validate required fields
      if (!parsed.judul || !parsed.mata_pelajaran || !parsed.deskripsi) {
        throw new Error('Missing required fields');
      }

      // Validate enum values
      if (!['individu', 'kelompok', 'ujian'].includes(parsed.tipe)) {
        parsed.tipe = 'individu';
      }

      if (!['urgent', 'penting', 'normal'].includes(parsed.prioritas)) {
        parsed.prioritas = 'normal';
      }

      logger.info('Successfully parsed natural language', {
        input,
        parsed: {
          judul: parsed.judul,
          mata_pelajaran: parsed.mata_pelajaran,
          deadline: parsed.deadline.toISOString()
        }
      });

      return parsed as ParsedTask;
    } catch (error) {
      logger.error('Failed to parse natural language', error as Error, { input });
      return null;
    }
  }

  /**
   * Build AI prompt for parsing
   */
  private buildPrompt(input: string, currentDate: Date): string {
    const validSubjects = [
      'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'Sejarah', 
      'PAI', 'PJOK', 'BK', 'MP 1', 'MP 2', 'MP 3', 'MP 4', 
      'MK 1', 'MK 2', 'MK 3', 'MK 4', 'Bahasa Jawa', 'Lainnya'
    ];

    return `Extract task information from this natural language input in Indonesian.

Input: "${input}"

Current date and time: ${currentDate.toISOString()}
Current date (readable): ${currentDate.toLocaleDateString('id-ID', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}

Extract and return ONLY valid JSON with these exact fields:
{
  "judul": "Task title (string, concise)",
  "mata_pelajaran": "Subject name (must be one of: ${validSubjects.join(', ')})",
  "deskripsi": "Task description (string, detailed)",
  "deadline": "Deadline date and time (ISO format: YYYY-MM-DDTHH:mm:ss)",
  "tipe": "Task type (must be: individu, kelompok, or ujian)",
  "prioritas": "Priority (must be: urgent, penting, or normal)"
}

IMPORTANT RULES:
1. Parse relative dates correctly:
   - "besok" = tomorrow (${new Date(currentDate.getTime() + 86400000).toLocaleDateString('id-ID')})
   - "lusa" = day after tomorrow (${new Date(currentDate.getTime() + 172800000).toLocaleDateString('id-ID')})
   - "minggu depan" = next week same day
   - "senin" = next Monday
   - "selasa" = next Tuesday
   - etc.

2. If time not mentioned, use 23:59 (end of day)

3. Detect keywords for tipe:
   - "ujian", "tes", "ulangan" → tipe: ujian
   - "kelompok", "grup", "bersama" → tipe: kelompok
   - otherwise → tipe: individu

4. Detect keywords for prioritas:
   - "urgent", "penting banget", "segera", "cepat" → prioritas: urgent
   - "penting" → prioritas: penting
   - otherwise → prioritas: normal

5. If subject not clearly mentioned, use "Lainnya"

6. Create concise judul (max 50 chars) and detailed deskripsi

7. Return ONLY the JSON object, no explanation or markdown

Example input: "Besok ada tugas matematika halaman 45-50 deadline jam 10"
Example output:
{
  "judul": "Tugas Matematika",
  "mata_pelajaran": "Matematika",
  "deskripsi": "Halaman 45-50",
  "deadline": "2026-02-11T10:00:00",
  "tipe": "individu",
  "prioritas": "normal"
}

Now parse the input above and return ONLY valid JSON:`;
  }

  /**
   * Validate parsed task
   */
  validateParsedTask(parsed: ParsedTask): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!parsed.judul || parsed.judul.length < 3) {
      errors.push('Judul terlalu pendek (minimal 3 karakter)');
    }

    if (!parsed.deskripsi || parsed.deskripsi.length < 5) {
      errors.push('Deskripsi terlalu pendek (minimal 5 karakter)');
    }

    if (!parsed.deadline || !(parsed.deadline instanceof Date)) {
      errors.push('Deadline tidak valid');
    } else {
      const { DateTimeHelper } = require('../utils/DateTimeHelper');
      if (parsed.deadline <= DateTimeHelper.now()) {
        errors.push('Deadline harus di masa depan');
      }
    }

    if (!['individu', 'kelompok', 'ujian'].includes(parsed.tipe)) {
      errors.push('Tipe tidak valid (harus: individu, kelompok, atau ujian)');
    }

    if (!['urgent', 'penting', 'normal'].includes(parsed.prioritas)) {
      errors.push('Prioritas tidak valid (harus: urgent, penting, atau normal)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
