/**
 * Tasks Routes
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import TaskModel from '../../models/Task';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all tasks
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { status, subject, priority } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (subject) filter.mataPelajaran = subject;
    if (priority) filter.prioritas = priority;

    const tasks = await TaskModel.find(filter).sort({ deadline: 1 });
    res.json({ tasks, total: tasks.length });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get single task
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json({ task });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create task
router.post('/', async (req: AuthRequest, res) => {
  try {
    const task = new TaskModel(req.body);
    await task.save();
    res.status(201).json({ task });
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to create task', details: error.message });
  }
});

// Update task
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const task = await TaskModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json({ task });
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to update task', details: error.message });
  }
});

// Delete task
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const task = await TaskModel.findByIdAndDelete(req.params.id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Mark task complete
router.post('/:id/complete', async (req: AuthRequest, res) => {
  try {
    const task = await TaskModel.findByIdAndUpdate(
      req.params.id,
      { status: 'selesai' },
      { new: true }
    );
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json({ task });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

// Bulk delete
router.post('/bulk-delete', async (req: AuthRequest, res) => {
  try {
    const { ids } = req.body;
    const result = await TaskModel.deleteMany({ _id: { $in: ids } });
    res.json({ deleted: result.deletedCount });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete tasks' });
  }
});

// Export tasks
router.get('/export', async (req: AuthRequest, res) => {
  try {
    const { format = 'json' } = req.query;
    const tasks = await TaskModel.find();

    if (format === 'csv') {
      // TODO: Implement CSV export
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=tasks.csv');
      res.send('CSV export not implemented yet');
    } else {
      res.json({ tasks });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to export tasks' });
  }
});

export default router;
