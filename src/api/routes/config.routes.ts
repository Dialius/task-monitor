/**
 * Configuration Routes
 */

import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../middleware/auth.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(requireAdmin);

// Get configuration
router.get('/', async (_req: AuthRequest, res) => {
  try {
    // Return safe config (no secrets)
    const config = {
      whatsappEnabled: process.env.WHATSAPP_ENABLED === 'true',
      discordEnabled: process.env.DISCORD_ENABLED === 'true',
      notionEnabled: process.env.NOTION_ENABLED === 'true',
      timezone: process.env.TIMEZONE || 'Asia/Jakarta',
      dailyReminderTime: process.env.DAILY_REMINDER_TIME || '17:00',
      weeklyReminderDay: process.env.WEEKLY_REMINDER_DAY || '5',
      weeklyReminderTime: process.env.WEEKLY_REMINDER_TIME || '20:00'
    };

    res.json({ config });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

// Update configuration
router.put('/', async (_req: AuthRequest, res) => {
  try {
    // TODO: Implement config update (write to .env file)
    res.json({ success: true, message: 'Configuration update not implemented yet' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// Backup configuration
router.post('/backup', async (_req: AuthRequest, res) => {
  try {
    // TODO: Implement config backup
    res.json({ success: true, message: 'Configuration backup not implemented yet' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to backup configuration' });
  }
});

export default router;
