/**
 * Winston Socket.io Transport
 * Stream logs to dashboard in real-time
 */

import Transport from 'winston-transport';
import { Server as SocketIOServer } from 'socket.io';

interface SocketIOTransportOptions extends Transport.TransportStreamOptions {
  io: SocketIOServer;
  room?: string;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  meta?: any;
}

export class SocketIOTransport extends Transport {
  private io: SocketIOServer;
  private room: string;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize: number = 100;

  constructor(opts: SocketIOTransportOptions) {
    super(opts);
    this.io = opts.io;
    this.room = opts.room || 'logs';
  }

  log(info: any, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    // Format log entry
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: info.level,
      message: info.message,
      meta: info.meta || {}
    };

    // Add to buffer
    this.logBuffer.push(logEntry);
    
    // Keep buffer size limited
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    // Debug: Log to console to verify transport is working
    console.log(`[SocketIOTransport] Emitting log to room "${this.room}":`, logEntry.level, logEntry.message);

    // Emit to connected clients in the logs room
    this.io.to(this.room).emit('log:entry', logEntry);

    callback();
  }

  /**
   * Get buffered logs (for new connections)
   */
  getBufferedLogs(): LogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * Clear log buffer
   */
  clearBuffer(): void {
    this.logBuffer = [];
  }
}

export default SocketIOTransport;
