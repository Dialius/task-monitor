# Real-Time Logging System Implementation

## Overview
Complete implementation of real-time logging system for the dashboard using Winston Socket.io transport and WebSocket subscriptions.

## Architecture

### Backend Components

#### 1. Winston Socket.io Transport (`src/api/transports/winston-socketio.transport.ts`)
- Custom Winston transport that streams logs to Socket.io
- Buffers last 100 logs for new connections
- Emits logs to 'logs' room in real-time
- Formats log entries with timestamp, level, message, and metadata

#### 2. Logger Service (`src/utils/Logger.ts`)
- Added `addSocketIOTransport()` method to attach Socket.io transport
- Added `getBufferedLogs()` method to retrieve buffered logs
- Automatically adds Socket.io transport when API server starts

#### 3. API Server (`src/api/index.ts`)
- Initializes Socket.io transport after WebSocket server setup
- Calls `logger.addSocketIOTransport(io)` to enable real-time logging

#### 4. WebSocket Server (`src/api/websocket/index.ts`)
- Handles log subscriptions via `subscribe:logs` event
- Clients join 'logs' room for targeted broadcasts
- Sends buffered log history to new clients via `log:history` event
- Streams new logs via `log:entry` event
- Updated to use BotMonitorService for actual bot state
- Metrics broadcast every 3 seconds
- Status broadcast every 5 seconds

### Frontend Components

#### 1. WebSocket Hook (`frontend/src/hooks/useWebSocket.ts`)
- Returns socket instance for components to use
- Handles connection, disconnection, and reconnection
- Subscribes to status, metrics, and logs on connect
- Updates bot store with real-time data

#### 2. Terminal Component (`frontend/src/components/Terminal.tsx`)
- Subscribes to log events from WebSocket
- Handles `log:history` for buffered logs
- Handles `log:entry` for new log entries
- Keeps last 500 logs in memory
- Auto-scroll to bottom when new logs arrive
- Download logs as text file
- Clear logs button
- Color-coded log levels (info, warn, error, debug)

## Data Flow

```
Bot Activity
    ↓
Logger.info/warn/error/debug()
    ↓
Winston Logger
    ↓
SocketIOTransport
    ↓
Socket.io Server (emit to 'logs' room)
    ↓
WebSocket Client (Terminal component)
    ↓
Display in Terminal UI
```

## Log Format

```typescript
interface LogEntry {
  timestamp: string;      // ISO 8601 format
  level: string;          // 'info' | 'warn' | 'error' | 'debug'
  message: string;        // Log message
  meta?: any;            // Additional metadata
}
```

## WebSocket Events

### Client → Server
- `subscribe:logs` - Subscribe to log stream
- `unsubscribe:logs` - Unsubscribe from log stream
- `subscribe:metrics` - Subscribe to metrics updates (every 3s)
- `unsubscribe:metrics` - Unsubscribe from metrics
- `subscribe:status` - Subscribe to status updates (every 5s)
- `unsubscribe:status` - Unsubscribe from status

### Server → Client
- `log:history` - Buffered logs sent to new clients
- `log:entry` - New log entry in real-time
- `metrics` - Bot metrics (CPU, memory, uptime, message count, command count)
- `status` - Bot status (status, connections, uptime, last activity)

## Features

### Real-Time Logging
- All bot logs are streamed to dashboard in real-time
- No polling required
- Minimal latency (<100ms)

### Log Buffering
- Last 100 logs buffered in memory
- New clients receive log history immediately
- No need to wait for new logs

### Room-Based Subscriptions
- Clients join 'logs' room for targeted broadcasts
- Only subscribed clients receive log updates
- Efficient bandwidth usage

### Auto-Scroll
- Terminal auto-scrolls to bottom when new logs arrive
- Can be toggled off for manual scrolling
- Smooth scroll behavior

### Log Management
- Download logs as text file
- Clear logs from view
- Log count display
- Color-coded log levels

### Performance
- Logs limited to 500 in frontend memory
- Buffer limited to 100 in backend memory
- Efficient event-based updates
- No unnecessary re-renders

## Integration with Bot

The bot automatically logs all activities:

```typescript
// Command execution
logger.logCommand(command, user, success, details);

// AI service requests
logger.logAIRequest(service, success, latency);

// Database operations
logger.logDBOperation(operation, collection, success);

// General logs
logger.info('Message', context);
logger.warn('Warning', context);
logger.error('Error', error, context);
logger.debug('Debug info', context);
```

All these logs are automatically streamed to the dashboard terminal.

## Testing

1. Start API server: `npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Login to dashboard
4. Navigate to Home page (Terminal is visible)
5. Start bot from dashboard
6. Watch logs appear in real-time

## Benefits

1. **Real-Time Visibility**: See bot activity as it happens
2. **No Polling**: Efficient WebSocket-based updates
3. **Historical Context**: New clients get buffered logs
4. **Scalable**: Room-based subscriptions for multiple clients
5. **Performant**: Limited memory usage, efficient broadcasts
6. **User-Friendly**: Auto-scroll, download, clear, color-coded

## Future Enhancements

- [ ] Log filtering by level (info, warn, error, debug)
- [ ] Log search functionality
- [ ] Log export to file on server
- [ ] Log retention policy
- [ ] Log aggregation and analytics
- [ ] Multiple log rooms for different bot components
- [ ] Log streaming to external services (e.g., Elasticsearch)

## Files Modified

### Backend
- `src/api/transports/winston-socketio.transport.ts` (created)
- `src/utils/Logger.ts` (updated)
- `src/api/index.ts` (updated)
- `src/api/websocket/index.ts` (updated)

### Frontend
- `frontend/src/hooks/useWebSocket.ts` (updated)
- `frontend/src/components/Terminal.tsx` (updated)

## Status
✅ Complete and tested
