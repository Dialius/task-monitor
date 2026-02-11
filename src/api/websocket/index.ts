/**
 * WebSocket Server
 * Real-time updates for dashboard
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { getLogger } from '../../utils/Logger';
import { BotMonitorService } from '../services/bot-monitor.service';

const logger = getLogger();

// Active subscriptions
const subscriptions = new Map<string, Set<string>>();

/**
 * Setup WebSocket server
 */
export function setupWebSocket(io: SocketIOServer): void {
  // Authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-this';
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      (socket as any).user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      };

      next();
    } catch (error: any) {
      logger.error('WebSocket auth error', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    logger.info(`WebSocket client connected: ${user.username} (${socket.id})`);

    // Subscribe to logs
    socket.on('subscribe:logs', () => {
      logger.info(`Client ${socket.id} subscribed to logs`);
      console.log(`[WebSocket] Client ${socket.id} subscribed to logs`);
      
      socket.join('logs');
      addSubscription('logs', socket.id);
      
      // Send buffered logs to new client
      const bufferedLogs = logger.getBufferedLogs();
      console.log(`[WebSocket] Sending ${bufferedLogs.length} buffered logs to client ${socket.id}`);
      
      if (bufferedLogs.length > 0) {
        socket.emit('log:history', bufferedLogs);
      }
      
      // Send connection confirmation
      socket.emit('log:entry', {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Connected to log stream',
        meta: {}
      });
      
      console.log(`[WebSocket] Client ${socket.id} is now receiving logs`);
    });

    // Subscribe to metrics
    socket.on('subscribe:metrics', async () => {
      logger.info(`Client ${socket.id} subscribed to metrics`);
      addSubscription('metrics', socket.id);
      
      const botMonitor = new BotMonitorService();
      
      // Start sending metrics every 3 seconds
      const interval = setInterval(async () => {
        if (!hasSubscription('metrics', socket.id)) {
          clearInterval(interval);
          return;
        }

        try {
          const metrics = await botMonitor.getMetrics();
          const state = BotMonitorService.getState();
          socket.emit('metrics', {
            cpu: metrics.cpu,
            memory: metrics.memory,
            uptime: metrics.uptime,
            messageCount: state.messageCount,
            commandCount: state.commandCount,
            timestamp: new Date().toISOString()
          });
        } catch (error: any) {
          logger.error('Metrics broadcast error', error);
        }
      }, 3000);

      // Send initial metrics
      try {
        const metrics = await botMonitor.getMetrics();
        const state = BotMonitorService.getState();
        socket.emit('metrics', {
          cpu: metrics.cpu,
          memory: metrics.memory,
          uptime: metrics.uptime,
          messageCount: state.messageCount,
          commandCount: state.commandCount,
          timestamp: new Date().toISOString()
        });
      } catch (error: any) {
        logger.error('Initial metrics error', error);
      }
    });

    // Subscribe to status
    socket.on('subscribe:status', async () => {
      logger.info(`Client ${socket.id} subscribed to status`);
      addSubscription('status', socket.id);
      
      const botMonitor = new BotMonitorService();
      
      // Start sending status every 5 seconds
      const interval = setInterval(async () => {
        if (!hasSubscription('status', socket.id)) {
          clearInterval(interval);
          return;
        }

        try {
          const status = await botMonitor.getStatus();
          socket.emit('status', {
            status: status.status,
            connections: status.connections,
            uptime: status.uptime,
            lastActivity: status.activity.lastActivity,
            timestamp: new Date().toISOString()
          });
        } catch (error: any) {
          logger.error('Status broadcast error', error);
        }
      }, 5000);

      // Send initial status
      try {
        const status = await botMonitor.getStatus();
        socket.emit('status', {
          status: status.status,
          connections: status.connections,
          uptime: status.uptime,
          lastActivity: status.activity.lastActivity,
          timestamp: new Date().toISOString()
        });
      } catch (error: any) {
        logger.error('Initial status error', error);
      }
    });

    // Unsubscribe from logs
    socket.on('unsubscribe:logs', () => {
      logger.info(`Client ${socket.id} unsubscribed from logs`);
      socket.leave('logs');
      removeSubscription('logs', socket.id);
    });

    // Unsubscribe from metrics
    socket.on('unsubscribe:metrics', () => {
      logger.info(`Client ${socket.id} unsubscribed from metrics`);
      removeSubscription('metrics', socket.id);
    });

    // Unsubscribe from status
    socket.on('unsubscribe:status', () => {
      logger.info(`Client ${socket.id} unsubscribed from status`);
      removeSubscription('status', socket.id);
    });

    // Execute command
    socket.on('execute:command', async (data: { command: string }) => {
      logger.info(`Command executed via WebSocket by ${user.username}: ${data.command}`);
      
      // TODO: Implement command execution
      socket.emit('command:output', {
        command: data.command,
        output: `Command executed: ${data.command}`,
        exitCode: 0,
        timestamp: new Date().toISOString()
      });
    });

    // Disconnection handler
    socket.on('disconnect', () => {
      logger.info(`WebSocket client disconnected: ${user.username} (${socket.id})`);
      
      // Remove all subscriptions for this socket
      removeAllSubscriptions(socket.id);
    });
  });

  logger.info('WebSocket server initialized');
}

/**
 * Add subscription
 */
function addSubscription(type: string, socketId: string): void {
  if (!subscriptions.has(type)) {
    subscriptions.set(type, new Set());
  }
  subscriptions.get(type)!.add(socketId);
}

/**
 * Remove subscription
 */
function removeSubscription(type: string, socketId: string): void {
  if (subscriptions.has(type)) {
    subscriptions.get(type)!.delete(socketId);
  }
}

/**
 * Check if has subscription
 */
function hasSubscription(type: string, socketId: string): boolean {
  return subscriptions.has(type) && subscriptions.get(type)!.has(socketId);
}

/**
 * Remove all subscriptions for a socket
 */
function removeAllSubscriptions(socketId: string): void {
  for (const sockets of subscriptions.values()) {
    sockets.delete(socketId);
  }
}

/**
 * Broadcast log to all subscribed clients
 */
export function broadcastLog(io: SocketIOServer, log: any): void {
  if (subscriptions.has('logs')) {
    for (const socketId of subscriptions.get('logs')!) {
      io.to(socketId).emit('log', log);
    }
  }
}

/**
 * Broadcast notification to all clients
 */
export function broadcastNotification(io: SocketIOServer, notification: any): void {
  io.emit('notification', notification);
}
