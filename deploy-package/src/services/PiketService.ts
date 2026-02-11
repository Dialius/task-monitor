/**
 * Piket Service
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */

import Piket, { IPiket } from '../models/Piket';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

export interface StudentInfo {
  nama: string;
  nomor_wa: string;
}

/**
 * Piket Service for managing cleaning duty schedules
 */
export class PiketService {
  /**
   * Set piket for a day (upsert)
   * Requirement: 4.1
   */
  async setPiket(day: string, students: StudentInfo[]): Promise<IPiket> {
    try {
      // Validate array parallelism
      if (students.length === 0) {
        throw new Error('At least one student required for piket');
      }

      const nama_siswa = students.map(s => s.nama);
      const nomor_wa = students.map(s => s.nomor_wa);

      // Upsert: update if exists, create if not
      const piket = await Piket.findOneAndUpdate(
        { hari: day },
        {
          hari: day,
          nama_siswa,
          nomor_wa,
          updated_at: new Date()
        },
        { upsert: true, new: true }
      );

      logger.logDBOperation('upsert', 'jadwal_piket', true);
      logger.info('Piket set', {
        hari: day,
        studentCount: students.length
      });

      return piket;
    } catch (error) {
      logger.logDBOperation('upsert', 'jadwal_piket', false);
      logger.error('Failed to set piket', error as Error);
      throw error;
    }
  }

  /**
   * Update piket assignment
   * Requirement: 4.2
   */
  async updatePiket(day: string, students: StudentInfo[]): Promise<IPiket> {
    return this.setPiket(day, students);
  }

  /**
   * Get piket for specific day
   * Requirement: 4.3
   */
  async getPiketByDay(day: string): Promise<IPiket | null> {
    try {
      const piket = await Piket.findOne({ hari: day });

      logger.logDBOperation('read', 'jadwal_piket', true);

      return piket;
    } catch (error) {
      logger.logDBOperation('read', 'jadwal_piket', false);
      logger.error('Failed to get piket by day', error as Error);
      throw error;
    }
  }

  /**
   * Get piket for week
   * Requirement: 4.4
   */
  async getPiketForWeek(_startDate: Date): Promise<IPiket[]> {
    try {
      const pikets = await Piket.find({});

      logger.logDBOperation('read', 'jadwal_piket', true);

      return pikets;
    } catch (error) {
      logger.logDBOperation('read', 'jadwal_piket', false);
      logger.error('Failed to get piket for week', error as Error);
      throw error;
    }
  }

  /**
   * Format piket message with mentions
   * Requirement: 4.6
   */
  formatPiketMessage(piket: IPiket): { text: string; mentions: string[] } {
    if (!piket || piket.nama_siswa.length === 0) {
      return {
        text: '🧹 Tidak ada jadwal piket untuk hari ini.',
        mentions: []
      };
    }

    let text = `🧹 *Piket ${piket.hari}:*\n\n`;
    
    piket.nama_siswa.forEach((nama, index) => {
      text += `${index + 1}. ${nama}\n`;
    });

    return {
      text,
      mentions: piket.nomor_wa
    };
  }

  /**
   * Get today's piket
   */
  async getTodayPiket(): Promise<IPiket | null> {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const today = new Date();
    const dayName = days[today.getDay()];

    return this.getPiketByDay(dayName);
  }

  /**
   * Get tomorrow's piket
   */
  async getTomorrowPiket(): Promise<IPiket | null> {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayName = days[tomorrow.getDay()];

    return this.getPiketByDay(dayName);
  }
}
