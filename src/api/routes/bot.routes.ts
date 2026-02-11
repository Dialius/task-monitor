/**
 * Bot Control Routes
 */

import { Router } from 'express';
import * as botController from '../controllers/bot.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Bot status (all authenticated users)
router.get('/status', botController.getStatus);
router.get('/metrics', botController.getMetrics);
router.get('/logs', botController.getLogs);

// Bot control (admin only)
router.post('/start', requireAdmin, botController.start);
router.post('/stop', requireAdmin, botController.stop);
router.post('/restart', requireAdmin, botController.restart);
router.post('/pause', requireAdmin, botController.pause);
router.post('/resume', requireAdmin, botController.resume);
router.post('/command', requireAdmin, botController.executeCommand);

export default router;
