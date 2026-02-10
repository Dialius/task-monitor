/**
 * Schedule Service
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 */

import Jadwal, { IJadwal } from '../models/Jadwal';
import Pengumuman from '../models/Pengumuman';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

export interface ScheduleInput {
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  mata_pelajaran: string;
  ruangan: string;
  nama_guru: string;
}

/**
 * Schedule Service for managing class schedules
 */
export class ScheduleService {
  /**
   * Create schedule entry
   * Requirement: 3.1
   */
  async createSchedule(scheduleData: ScheduleInput): Promise<IJadwal> {
    try {
      const schedule = new Jadwal({
        ...scheduleData,
        is_active: true
      });

      await schedule.save();

      logger.logDBOperation('create', 'jadwal_pelajaran', true);
      logger.info('Schedule created', {
        scheduleId: schedule._id,
        hari: schedule.hari,
        mata_pelajaran: schedule.mata_pelajaran
      });

      return schedule;
    } catch (error) {
      logger.logDBOperation('create', 'jadwal_pelajaran', false);
      logger.error('Failed to create schedule', error as Error);
      throw error;
    }
  }

  /**
   * Update schedule field
   * Requirement: 3.2
   */
  async updateSchedule(scheduleId: string, field: string, value: any): Promise<IJadwal> {
    try {
      const schedule = await Jadwal.findById(scheduleId);
      
      if (!schedule) {
        throw new Error('Schedule not found');
      }

      // Update only the specified field
      (schedule as any)[field] = value;
      await schedule.save();

      logger.logDBOperation('update', 'jadwal_pelajaran', true);
      logger.info('Schedule updated', {
        scheduleId,
        field,
        value
      });

      return schedule;
    } catch (error) {
      logger.logDBOperation('update', 'jadwal_pelajaran', false);
      logger.error('Failed to update schedule', error as Error);
      throw error;
    }
  }

  /**
   * Delete schedule (soft delete)
   * Requirement: 3.3
   */
  async deleteSchedule(scheduleId: string): Promise<boolean> {
    try {
      const schedule = await Jadwal.findById(scheduleId);
      
      if (!schedule) {
        throw new Error('Schedule not found');
      }

      schedule.is_active = false;
      await schedule.save();

      logger.logDBOperation('update', 'jadwal_pelajaran', true);
      logger.info('Schedule soft deleted', { scheduleId });

      return true;
    } catch (error) {
      logger.logDBOperation('update', 'jadwal_pelajaran', false);
      logger.error('Failed to delete schedule', error as Error);
      throw error;
    }
  }

  /**
   * Get schedules by day
   * Requirement: 3.5
   */
  async getSchedulesByDay(day: string): Promise<IJadwal[]> {
    try {
      const schedules = await Jadwal.find({
        hari: day,
        is_active: true
      }).sort({ jam_mulai: 1 });

      logger.logDBOperation('read', 'jadwal_pelajaran', true);

      return schedules;
    } catch (error) {
      logger.logDBOperation('read', 'jadwal_pelajaran', false);
      logger.error('Failed to get schedules by day', error as Error);
      throw error;
    }
  }

  /**
   * Get schedules for week
   * Requirement: 3.7
   */
  async getSchedulesForWeek(_startDate: Date): Promise<IJadwal[]> {
    try {
      const schedules = await Jadwal.find({
        is_active: true
      }).sort({ hari: 1, jam_mulai: 1 });

      logger.logDBOperation('read', 'jadwal_pelajaran', true);

      return schedules;
    } catch (error) {
      logger.logDBOperation('read', 'jadwal_pelajaran', false);
      logger.error('Failed to get schedules for week', error as Error);
      throw error;
    }
  }

  /**
   * Create schedule change announcement
   * Requirement: 3.4
   */
  async announceScheduleChange(date: Date, changeInfo: string): Promise<void> {
    try {
      const announcement = new Pengumuman({
        tanggal: date,
        judul: 'Perubahan Jadwal',
        tipe: 'perubahan_jadwal',
        keterangan: changeInfo,
        is_active: true
      });

      await announcement.save();

      logger.logDBOperation('create', 'pengumuman_khusus', true);
      logger.info('Schedule change announcement created', {
        date,
        changeInfo
      });
    } catch (error) {
      logger.logDBOperation('create', 'pengumuman_khusus', false);
      logger.error('Failed to create schedule change announcement', error as Error);
      throw error;
    }
  }

  /**
   * Get today's schedule
   */
  async getTodaySchedule(): Promise<IJadwal[]> {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const today = new Date();
    const dayName = days[today.getDay()];

    return this.getSchedulesByDay(dayName);
  }

  /**
   * Get tomorrow's schedule
   * Requirement: 3.6
   */
  async getTomorrowSchedule(): Promise<IJadwal[]> {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayName = days[tomorrow.getDay()];

    return this.getSchedulesByDay(dayName);
  }

  /**
   * Get schedule for specific date
   */
  async getScheduleForDate(date: Date): Promise<IJadwal[]> {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = days[date.getDay()];

    return this.getSchedulesByDay(dayName);
  }
}
