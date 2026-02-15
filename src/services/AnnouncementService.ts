/**
 * Announcement Service
 * Requirements: 5.1, 5.2, 5.6
 */

import Pengumuman, { IPengumuman } from '../models/Pengumuman';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

export interface AnnouncementInput {
  tanggal: Date;
  judul: string;
  tipe: 'acara' | 'perubahan_jadwal' | 'praktikum' | 'lainnya';
  keterangan: string;
}

/**
 * Announcement Service for managing special announcements
 */
export class AnnouncementService {
  /**
   * Create announcement
   * Requirement: 5.1
   */
  async createAnnouncement(data: AnnouncementInput): Promise<IPengumuman> {
    try {
      const announcement = new Pengumuman({
        ...data,
        is_active: true
      });

      await announcement.save();

      logger.logDBOperation('create', 'pengumuman_khusus', true);
      logger.info('Announcement created', {
        announcementId: announcement._id,
        judul: announcement.judul,
        tipe: announcement.tipe
      });

      return announcement;
    } catch (error) {
      logger.logDBOperation('create', 'pengumuman_khusus', false);
      logger.error('Failed to create announcement', error as Error);
      throw error;
    }
  }

  /**
   * Delete announcement (soft delete)
   * Requirement: 5.2
   */
  async deleteAnnouncement(id: string): Promise<boolean> {
    try {
      const announcement = await Pengumuman.findById(id);
      
      if (!announcement) {
        throw new Error('Announcement not found');
      }

      announcement.is_active = false;
      await announcement.save();

      logger.logDBOperation('update', 'pengumuman_khusus', true);
      logger.info('Announcement soft deleted', { announcementId: id });

      return true;
    } catch (error) {
      logger.logDBOperation('update', 'pengumuman_khusus', false);
      logger.error('Failed to delete announcement', error as Error);
      throw error;
    }
  }

  /**
   * Get announcements by date range
   * Requirement: 5.6
   */
  async getAnnouncementsByDateRange(startDate: Date, endDate: Date): Promise<IPengumuman[]> {
    try {
      const announcements = await Pengumuman.find({
        tanggal: {
          $gte: startDate,
          $lte: endDate
        },
        is_active: true
      }).sort({ tanggal: 1 });

      logger.logDBOperation('read', 'pengumuman_khusus', true);

      return announcements;
    } catch (error) {
      logger.logDBOperation('read', 'pengumuman_khusus', false);
      logger.error('Failed to get announcements by date range', error as Error);
      throw error;
    }
  }

  /**
   * Get announcements for today
   */
  async getTodayAnnouncements(): Promise<IPengumuman[]> {
    const { DateTimeHelper } = require('../utils/DateTimeHelper');
    const today = DateTimeHelper.now();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getAnnouncementsByDateRange(today, tomorrow);
  }

  /**
   * Get announcements for tomorrow
   */
  async getTomorrowAnnouncements(): Promise<IPengumuman[]> {
    const { DateTimeHelper } = require('../utils/DateTimeHelper');
    const tomorrow = DateTimeHelper.now();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    return this.getAnnouncementsByDateRange(tomorrow, dayAfter);
  }

  /**
   * Get announcements for this week
   */
  async getWeekAnnouncements(): Promise<IPengumuman[]> {
    const { DateTimeHelper } = require('../utils/DateTimeHelper');
    const today = DateTimeHelper.now();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return this.getAnnouncementsByDateRange(today, nextWeek);
  }
}
