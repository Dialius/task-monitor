/**
 * Analytics Routes
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as analyticsController from '../controllers/analytics.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get analytics data
router.get('/', analyticsController.getAnalytics);

// Get task statistics
router.get('/tasks', analyticsController.getTaskStats);

export default router;
