/**
 * API Server Entry Point
 * Provides REST API and WebSocket server for dashboard
 */

import express, { Express } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { getLogger } from '../utils/Logger';
import mongoose from 'mongoose';

// Routes
import authRoutes from './routes/auth.routes';
import botRoutes from './routes/bot.routes';
import tasksRoutes from './routes/tasks.routes';
import analyticsRoutes from './routes/analytics.routes';
import configRoutes from './routes/config.routes';

// WebSocket
import { setupWebSocket } from './websocket';

// Middleware
import { errorHandler } from './middleware/error.middleware';

// Bootstrap
import { createDefaultDashboardUser } from './utils/bootstrap';

const logger = getLogger();

export class APIServer {
  private app: Express;
  private httpServer: any;
  private io: SocketIOServer;
  private port: number;

  constructor(port: number = 3001) {
    this.port = port;
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupErrorHandling();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // Trust proxy - required for running behind PHP proxy/reverse proxy
    this.app.set('trust proxy', true);

    // CORS
    this.app.use(cors({
      origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
      credentials: true
    }));

    // Body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'), // 1 minute
      max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // 100 requests per minute
      message: 'Too many requests from this IP, please try again later.'
    });
    this.app.use('/api/', limiter);

    // Request logging
    this.app.use((req, _res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      next();
    });
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/bot', botRoutes);
    this.app.use('/api/tasks', tasksRoutes);
    this.app.use('/api/analytics', analyticsRoutes);
    this.app.use('/api/config', configRoutes);

    // 404 handler
    this.app.use((_req, res) => {
      res.status(404).json({ error: 'Not found' });
    });
  }

  /**
   * Setup WebSocket server
   */
  private setupWebSocket(): void {
    setupWebSocket(this.io);
    
    // Add Socket.io transport to logger for real-time logs
    try {
      logger.addSocketIOTransport(this.io);
      logger.info('Socket.io transport added to logger - real-time logging enabled');
      console.log('   ✓ Real-time logging enabled');
    } catch (error) {
      logger.error('Failed to add Socket.io transport', error as Error);
      console.error('   ✗ Failed to enable real-time logging:', error);
    }
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  /**
   * Start API server
   */
  async start(): Promise<void> {
    // Connect to MongoDB first
    try {
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error('MONGODB_URI not found in environment variables');
      }

      console.log('   → Connecting to MongoDB...');
      await mongoose.connect(mongoUri);
      logger.info('MongoDB connected successfully');
      console.log('   ✓ MongoDB connected');
    } catch (error) {
      logger.error('MongoDB connection failed', error as Error);
      console.error('   ✗ MongoDB connection failed:', error);
      throw error;
    }

    return new Promise((resolve) => {
      this.httpServer.listen(this.port, async () => {
        logger.info(`API server started on port ${this.port}`);
        console.log(`   ✓ API server: http://localhost:${this.port}`);
        console.log(`   ✓ WebSocket server: ws://localhost:${this.port}`);
        
        // Create default dashboard user if none exists
        await createDefaultDashboardUser();
        
        resolve();
      });
    });
  }

  /**
   * Stop API server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer.close(() => {
        logger.info('API server stopped');
        resolve();
      });
    });
  }

  /**
   * Get Express app instance
   */
  getApp(): Express {
    return this.app;
  }

  /**
   * Get Socket.IO instance
   */
  getIO(): SocketIOServer {
    return this.io;
  }
}
