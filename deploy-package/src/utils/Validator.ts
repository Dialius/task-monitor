/**
 * Validator Utility Class
 * Requirements: 12.1, 12.2, 12.8, 2.9, 2.10, 3.8, 5.3
 */

export class Validator {
  /**
   * Validate date format (YYYY-MM-DD)
   * Requirement: 12.1
   */
  static isValidDate(dateString: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return false;
    }
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Validate time format (HH:MM)
   * Requirement: 12.2
   */
  static isValidTime(timeString: string): boolean {
    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(timeString);
  }

  /**
   * Validate phone number format (Indonesian format)
   * Requirement: 12.8
   */
  static isValidPhoneNumber(phone: string): boolean {
    // Indonesian phone numbers: +62xxx or 08xxx or 62xxx
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Sanitize user input to prevent injection
   * Requirement: 12.8
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }
    
    // Remove potential MongoDB injection characters
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/[$]/g, '') // Remove MongoDB operators
      .trim();
  }

  /**
   * Validate task type
   * Requirement: 2.9
   */
  static isValidTaskType(type: string): boolean {
    const validTypes = ['individu', 'kelompok', 'ujian'];
    return validTypes.includes(type);
  }

  /**
   * Validate priority
   * Requirement: 2.10
   */
  static isValidPriority(priority: string): boolean {
    const validPriorities = ['urgent', 'penting', 'normal'];
    return validPriorities.includes(priority);
  }

  /**
   * Validate day name (Indonesian)
   * Requirement: 3.8
   */
  static isValidDay(day: string): boolean {
    const validDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    return validDays.includes(day);
  }

  /**
   * Validate announcement type
   * Requirement: 5.3
   */
  static isValidAnnouncementType(type: string): boolean {
    const validTypes = ['acara', 'perubahan_jadwal', 'praktikum', 'lainnya'];
    return validTypes.includes(type);
  }
}
