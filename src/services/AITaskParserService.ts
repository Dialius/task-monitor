/**
 * AI Task Parser Service
 * Parse natural language input to extract task information
 * 
 * Enhanced date handling:
 * - Provides a 14-day calendar table to AI so it doesn't guess dates
 * - Uses WIB timezone throughout (not UTC)
 * - Validates day-of-week matches after parsing
 * - Detects and warns about day/date conflicts
 */

import { AIService } from './AIService';
import { SubjectResolver } from './SubjectResolver';
import { getSubjectNames } from '../config/SubjectConfig';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

export interface ParsedTask {
  judul: string;
  mata_pelajaran: string;
  deskripsi: string;
  deadline: Date;
  tipe: 'individu' | 'kelompok' | 'ujian';
  prioritas: 'urgent' | 'penting' | 'normal';
  _dateWarning?: string; // Warning if day/date don't match
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

      // Use AI to parse with higher token limit for JSON output
      const context = 'Parse this natural language input and return ONLY valid JSON with task information. Follow the format and rules exactly. Do NOT add any explanation or markdown formatting.';
      const response = await this.aiService.parseTaskText(prompt, context);

      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
        response.match(/```\s*([\s\S]*?)\s*```/) ||
        [null, response];

      const jsonStr = jsonMatch[1] || response;

      // Clean up potential issues in JSON string
      const cleanedJson = jsonStr.trim()
        .replace(/,\s*}/g, '}')  // Remove trailing commas
        .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays

      const parsed = JSON.parse(cleanedJson);

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

      // Post-parsing: Validate day-of-week matches the date
      const dateWarning = this.validateDayOfWeek(input, parsed.deadline, currentDate);
      if (dateWarning) {
        parsed._dateWarning = dateWarning;
        logger.warn('Date/day mismatch detected', { input, warning: dateWarning });
      }

      logger.info('Successfully parsed natural language', {
        input,
        parsed: {
          judul: parsed.judul,
          mata_pelajaran: parsed.mata_pelajaran,
          deadline: parsed.deadline.toISOString(),
          dateWarning: dateWarning || 'none'
        }
      });

      // Resolve mata_pelajaran through SubjectResolver for validation
      const resolvedSubject = SubjectResolver.resolve(parsed.mata_pelajaran);
      if (resolvedSubject) {
        parsed.mata_pelajaran = resolvedSubject;
      }

      return parsed as ParsedTask;
    } catch (error) {
      logger.error('Failed to parse natural language', error as Error, { input });
      return null;
    }
  }

  /**
   * Build a 14-day calendar table for the AI prompt
   * This prevents the AI from incorrectly calculating dates
   */
  private buildCalendarTable(currentDate: Date): string {
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    let table = '| No | Hari     | Tanggal              | ISO Format            |\n';
    table += '|----|----------|----------------------|-----------------------|\n';

    for (let i = 0; i <= 30; i++) {
      const date = new Date(currentDate.getTime() + i * 86400000);
      const dayName = dayNames[date.getDay()];
      const dateStr = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      const isoStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const label = i === 0 ? ' (HARI INI)' : i === 1 ? ' (BESOK)' : i === 2 ? ' (LUSA)' : '';

      table += `| ${String(i + 1).padStart(2, ' ')} | ${dayName.padEnd(8, ' ')} | ${dateStr.padEnd(20, ' ')} | ${isoStr}T23:59:00   |${label}\n`;
    }

    return table;
  }

  /**
   * Build AI prompt for parsing — with full calendar reference
   */
  private buildPrompt(input: string, currentDate: Date): string {
    const validSubjects = getSubjectNames();
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const currentDayName = dayNames[currentDate.getDay()];
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    const calendarTable = this.buildCalendarTable(currentDate);

    return `Kamu adalah parser tugas sekolah. Ekstrak informasi tugas dari input bahasa Indonesia.

INPUT USER: "${input}"

═══════════════════════════════════════════════════
📅 WAKTU SEKARANG (WIB - Waktu Indonesia Barat):
   Hari: ${currentDayName}
   Tanggal: ${currentDate.getDate()} ${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][currentDate.getMonth()]} ${currentDate.getFullYear()}
   Jam: ${currentTimeStr} WIB

📅 KALENDER REFERENSI (WAJIB gunakan tabel ini, JANGAN menghitung sendiri!):
${calendarTable}
═══════════════════════════════════════════════════

ATURAN TANGGAL (SANGAT PENTING - IKUTI DENGAN KETAT!):

1. SELALU lihat tabel kalender di atas. JANGAN menghitung tanggal sendiri!

2. Jika user menyebut HARI dan TANGGAL sekaligus (misal "kamis tanggal 26"):
   - Cari "tanggal 26" di tabel → lihat hari apa
   - SELALU PRIORITASKAN TANGGAL yang disebut user
   - Gunakan tanggal tersebut meskipun harinya tidak cocok

3. Jika user hanya menyebut HARI tanpa tanggal (misal "hari kamis"):
   - Cari "Kamis" TERDEKAT di tabel (yang belum lewat)
   - Jika hari ini adalah hari yang sama dan belum lewat jam deadline, gunakan hari ini
   - Jika sudah lewat, gunakan minggu depan

4. Jika user hanya menyebut TANGGAL tanpa hari (misal "tanggal 26"):
   - Cari "tanggal 26" di tabel
   - Jika tanggal 26 bulan ini sudah lewat, gunakan tanggal 26 bulan depan

5. Kata kunci waktu relatif:
   - "hari ini" → baris pertama tabel (No. 1)
   - "besok" → baris kedua tabel (No. 2)
   - "lusa" → baris ketiga tabel (No. 3)
   - "minggu depan" → +7 hari dari hari ini
   - "minggu depan hari senin" → Senin terdekat setelah 7 hari

6. Jika JAM tidak disebutkan → gunakan 23:59

FORMAT OUTPUT - Return ONLY valid JSON:
{
  "judul": "Judul tugas (singkat, max 50 karakter)",
  "mata_pelajaran": "Nama pelajaran (HARUS salah satu dari: ${validSubjects.join(', ')})",
  "deskripsi": "Deskripsi tugas (detail)",
  "deadline": "YYYY-MM-DDTHH:mm:ss (ambil dari kolom ISO Format di tabel!)",
  "tipe": "individu / kelompok / ujian",
  "prioritas": "urgent / penting / normal"
}

ATURAN LAIN:
- Tipe: "ujian"/"tes"/"ulangan" → ujian, "kelompok"/"grup" → kelompok, lainnya → individu
- Prioritas: "urgent"/"segera"/"cepat" → urgent, "penting" → penting, lainnya → normal
- Jika pelajaran tidak jelas → "Lainnya"
- Judul singkat dan jelas, deskripsi lebih detail
- Return HANYA JSON, tanpa penjelasan atau markdown`;
  }

  /**
   * Validate that the day-of-week in the parsed date matches what the user mentioned
   * Returns a warning string if there's a mismatch, or null if OK
   */
  private validateDayOfWeek(input: string, parsedDeadline: Date, _currentDate: Date): string | null {
    const dayMap: Record<string, number> = {
      'minggu': 0, 'senin': 1, 'selasa': 2, 'rabu': 3,
      'kamis': 4, 'jumat': 5, 'jum\'at': 5, 'sabtu': 6
    };
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const inputLower = input.toLowerCase();

    // Check if user mentioned a specific day name
    let mentionedDay: number | null = null;
    for (const [dayStr, dayNum] of Object.entries(dayMap)) {
      // Match "hari kamis", "kamis", etc. but not as part of another word
      const regex = new RegExp(`(?:hari\\s+)?\\b${dayStr}\\b`, 'i');
      if (regex.test(inputLower)) {
        mentionedDay = dayNum;
        break;
      }
    }

    if (mentionedDay === null) {
      return null; // User didn't mention a specific day
    }

    const actualDay = parsedDeadline.getDay();

    if (mentionedDay !== actualDay) {
      const mentionedDayName = dayNames[mentionedDay];
      const actualDayName = dayNames[actualDay];
      const dateFormatted = `${parsedDeadline.getDate()} ${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][parsedDeadline.getMonth()]}`;

      return `⚠️ Tanggal ${dateFormatted} adalah hari ${actualDayName}, bukan ${mentionedDayName}. Deadline diatur ke tanggal ${dateFormatted} (${actualDayName}).`;
    }

    return null;
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
