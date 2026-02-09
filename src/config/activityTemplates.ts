/**
 * Default Activity Templates Configuration
 * Define rotating activity status messages for Discord bot
 * 
 * Activity Types:
 * 0 = Playing
 * 1 = Streaming
 * 2 = Listening
 * 3 = Watching
 * 5 = Competing
 */

import { ActivityTemplate } from '../services/ActivityStatusService';

/**
 * Default activity templates
 * You can customize these messages or add more
 */
export const defaultActivityTemplates: ActivityTemplate[] = [
  {
    type: 3, // Watching
    text: 'Tugas hari ini: {count}',
    dynamic: true,
    dataSource: 'tasks_today'
  },
  {
    type: 3, // Watching
    text: 'Tugas minggu ini: {count}',
    dynamic: true,
    dataSource: 'tasks_week'
  },
  {
    type: 0, // Playing
    text: 'Total tugas aktif: {count}',
    dynamic: true,
    dataSource: 'tasks_total'
  },
  {
    type: 3, // Watching
    text: 'Tugas urgent: {count}',
    dynamic: true,
    dataSource: 'tasks_urgent'
  },
  {
    type: 2, // Listening
    text: 'Perintah dari kelas',
    dynamic: false
  },
  {
    type: 0, // Playing
    text: 'Reminder Bot v1.0',
    dynamic: false
  }
];

/**
 * Get activity templates from config or use defaults
 */
export function getActivityTemplates(): ActivityTemplate[] {
  // You can load custom templates from database or config file here
  // For now, return default templates
  return defaultActivityTemplates;
}
