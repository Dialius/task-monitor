/**
 * DateTime Helper
 * Handles timezone conversion and date formatting for Indonesia (WIB)
 */

import { format, addHours, differenceInHours, differenceInMinutes } from 'date-fns';
import { id } from 'date-fns/locale';

export class DateTimeHelper {
  private static readonly TIMEZONE = 'Asia/Jakarta'; // WIB

  /**
   * Get current date/time in WIB timezone
   */
  static now(): Date {
    // Get current UTC time
    const now = new Date();
    
    // Convert to WIB (UTC+7)
    const wibTime = new Date(now.toLocaleString('en-US', { timeZone: this.TIMEZONE }));
    
    return wibTime;
  }

  /**
   * Convert any date to WIB timezone
   */
  static toWIB(date: Date | string): Date {
    const inputDate = typeof date === 'string' ? new Date(date) : date;
    return new Date(inputDate.toLocaleString('en-US', { timeZone: this.TIMEZONE }));
  }

  /**
   * Format date in Indonesian format
   * @param date - Date to format
   * @param formatStr - Format string (default: 'dd MMMM yyyy')
   */
  static formatIndonesian(date: Date | string, formatStr: string = 'dd MMMM yyyy'): string {
    const wibDate = this.toWIB(date);
    return format(wibDate, formatStr, { locale: id });
  }

  /**
   * Get day name in Indonesian
   */
  static getDayName(date: Date | string): string {
    const wibDate = this.toWIB(date);
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return dayNames[wibDate.getDay()];
  }

  /**
   * Get month name in Indonesian
   */
  static getMonthName(date: Date | string): string {
    const wibDate = this.toWIB(date);
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return monthNames[wibDate.getMonth()];
  }

  /**
   * Format full date with day name in Indonesian
   * Example: "Senin, 15 Februari 2026"
   */
  static formatFullDate(date: Date | string): string {
    const wibDate = this.toWIB(date);
    const dayName = this.getDayName(wibDate);
    const dateNum = wibDate.getDate();
    const monthName = this.getMonthName(wibDate);
    const year = wibDate.getFullYear();
    
    return `${dayName}, ${dateNum} ${monthName} ${year}`;
  }

  /**
   * Format short date in Indonesian
   * Example: "Sen, 15 Feb"
   */
  static formatShortDate(date: Date | string): string {
    const wibDate = this.toWIB(date);
    return format(wibDate, 'EEE, dd MMM', { locale: id });
  }

  /**
   * Get hours until deadline from now
   */
  static getHoursUntil(deadline: Date | string): number {
    const now = this.now();
    const deadlineDate = this.toWIB(deadline);
    
    const hours = differenceInHours(deadlineDate, now);
    return Math.max(0, hours);
  }

  /**
   * Get minutes until deadline from now
   */
  static getMinutesUntil(deadline: Date | string): number {
    const now = this.now();
    const deadlineDate = this.toWIB(deadline);
    
    const minutes = differenceInMinutes(deadlineDate, now);
    return Math.max(0, minutes);
  }

  /**
   * Check if date is today (in WIB timezone)
   */
  static isToday(date: Date | string): boolean {
    const now = this.now();
    const checkDate = this.toWIB(date);
    
    return now.toDateString() === checkDate.toDateString();
  }

  /**
   * Check if date is tomorrow (in WIB timezone)
   */
  static isTomorrow(date: Date | string): boolean {
    const tomorrow = addHours(this.now(), 24);
    const checkDate = this.toWIB(date);
    
    return tomorrow.toDateString() === checkDate.toDateString();
  }

  /**
   * Check if date is in current week (in WIB timezone)
   */
  static isThisWeek(date: Date | string): boolean {
    const now = this.now();
    const checkDate = this.toWIB(date);
    
    // Get start of week (Monday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Get end of week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return checkDate >= startOfWeek && checkDate <= endOfWeek;
  }

  /**
   * Format relative time in Indonesian
   * Example: "2 jam lagi", "3 hari lagi"
   */
  static formatRelativeTime(date: Date | string): string {
    const now = this.now();
    const targetDate = this.toWIB(date);
    
    const diffMs = targetDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMs < 0) {
      return 'sudah lewat';
    } else if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} menit lagi`;
    } else if (diffHours < 24) {
      return `${diffHours} jam lagi`;
    } else if (diffDays === 1) {
      return 'besok';
    } else if (diffDays < 7) {
      return `${diffDays} hari lagi`;
    } else {
      const diffWeeks = Math.floor(diffDays / 7);
      return `${diffWeeks} minggu lagi`;
    }
  }

  /**
   * Get current time string in HH:mm format (WIB)
   */
  static getCurrentTime(): string {
    const now = this.now();
    return format(now, 'HH:mm');
  }

  /**
   * Get current date string in YYYY-MM-DD format (WIB)
   */
  static getCurrentDate(): string {
    const now = this.now();
    return format(now, 'yyyy-MM-dd');
  }

  /**
   * Parse date string to Date object (assumes WIB timezone)
   */
  static parseDate(dateStr: string): Date {
    const date = new Date(dateStr);
    return this.toWIB(date);
  }

  /**
   * Check if deadline is urgent (< 24 hours)
   */
  static isUrgent(deadline: Date | string): boolean {
    const hours = this.getHoursUntil(deadline);
    return hours < 24 && hours > 0;
  }

  /**
   * Get priority emoji based on deadline urgency
   */
  static getPriorityEmoji(deadline: Date | string): string {
    const hours = this.getHoursUntil(deadline);
    
    if (hours < 0) {
      return '⏰'; // Overdue
    } else if (hours < 6) {
      return '🚨'; // Very urgent
    } else if (hours < 24) {
      return '⚠️'; // Urgent
    } else if (hours < 72) {
      return '📌'; // Soon
    } else {
      return 'ℹ️'; // Normal
    }
  }
}
