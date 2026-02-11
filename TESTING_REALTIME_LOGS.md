# Testing Real-Time Logging System

## Prerequisites
- Backend built: `npm run build`
- Frontend built: `cd frontend && npm run build`
- MongoDB running
- .env configured correctly

## Step-by-Step Testing Guide

### 1. Start API Server

```bash
npm start
```

Expected output:
```
╔════════════════════════════════════════════════════════╗
║   🤖 Task Monitor Bot - API Server                    ║
╚════════════════════════════════════════════════════════╝

📋 Starting API server...
   Bot will NOT start automatically
   Use dashboard to start/stop bot

   → Adding Socket.io transport to Winston logger...
   ✓ Socket.io transport added successfully
   ✓ Logs will be streamed to dashboard in real-time
   ✓ API server: http://localhost:3001
   ✓ WebSocket server: ws://localhost:3001
   ✓ Real-time logging enabled
```

### 2. Start Frontend (Development Mode)

Open new terminal:

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v7.3.1  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 3. Open Dashboard

1. Open browser: http://localhost:5173
2. Login with credentials from .env:
   - Username: admin
   - Password: admin123

### 4. Check Browser Console

Open browser DevTools (F12) and check Console tab. You should see:

```
✅ WebSocket connected
[Terminal] Setting up log listeners
[Terminal] Log listeners registered
📡 Status update: {...}
📊 Metrics update: {...}
[Terminal] Received log history: X entries
[Terminal] New log entry: {...}
```

### 5. Check Terminal Component

On the Home page, you should see the Terminal component with logs like:

```
2024-01-XX XX:XX:XX ℹ️ [INFO] Connected to log stream
2024-01-XX XX:XX:XX ℹ️ [INFO] Real-time logging initialized - this message should appear in dashboard
```

### 6. Start Bot from Dashboard

1. Click "Start Bot" button in the control panel
2. Watch the Terminal component - you should see logs appearing in real-time:

```
2024-01-XX XX:XX:XX ℹ️ [INFO] Bot initialized successfully
2024-01-XX XX:XX:XX ℹ️ [INFO] Services initialized
2024-01-XX XX:XX:XX ℹ️ [INFO] Command system ready
2024-01-XX XX:XX:XX ℹ️ [INFO] Platforms connected
2024-01-XX XX:XX:XX ℹ️ [INFO] Scheduler started
2024-01-XX XX:XX:XX ℹ️ [INFO] 🤖 Multi-Platform Bot is running!
```

### 7. Test Bot Commands

Send a command to the bot (via WhatsApp or Discord):

```
/status
```

You should see logs in the Terminal:

```
2024-01-XX XX:XX:XX ℹ️ [INFO] 📨 WhatsApp command: /status from 628xxx
2024-01-XX XX:XX:XX ℹ️ [INFO] Command executed: status
```

### 8. Check Backend Console

In the terminal where you ran `npm start`, you should see:

```
[SocketIOTransport] Emitting log to room "logs": info Bot initialized successfully
[SocketIOTransport] Emitting log to room "logs": info Services initialized
[WebSocket] Client abc123 subscribed to logs
[WebSocket] Sending 5 buffered logs to client abc123
[WebSocket] Client abc123 is now receiving logs
```

## Troubleshooting

### Problem: Terminal shows "No logs yet. Waiting for bot activity..."

**Check:**
1. Browser console - is WebSocket connected?
   ```
   ✅ WebSocket connected
   ```

2. Are log listeners registered?
   ```
   [Terminal] Log listeners registered
   ```

3. Backend console - is Socket.io transport added?
   ```
   ✓ Socket.io transport added successfully
   ```

**Solution:**
- Refresh the page
- Check if token is valid (logout and login again)
- Check if API_ENABLED=true in .env

### Problem: WebSocket connection error

**Check:**
1. Is API server running on port 3001?
2. Is VITE_WS_URL correct in frontend/.env?
   ```
   VITE_WS_URL=http://localhost:3001
   ```

**Solution:**
- Restart API server
- Check firewall settings
- Try different port

### Problem: Logs not appearing in real-time

**Check:**
1. Backend console - are logs being emitted?
   ```
   [SocketIOTransport] Emitting log to room "logs": ...
   ```

2. Frontend console - are logs being received?
   ```
   [Terminal] New log entry: {...}
   ```

**Solution:**
- Check if client joined 'logs' room
- Restart both backend and frontend
- Clear browser cache

### Problem: "Socket.io transport already added" warning

This is normal if you restart the bot multiple times. The transport is only added once.

## Expected Behavior

### When API Server Starts
- Socket.io transport is added to Winston logger
- Test log is emitted: "Real-time logging initialized"
- WebSocket server is ready

### When Client Connects
- Client joins 'logs' room
- Buffered logs (last 100) are sent to client
- Confirmation log is sent: "Connected to log stream"

### When Bot Logs Something
- Log is written to file (Winston file transport)
- Log is printed to console (Winston console transport)
- Log is emitted to Socket.io room 'logs' (Winston Socket.io transport)
- All connected clients in 'logs' room receive the log
- Frontend Terminal component displays the log

### When Bot Starts
- Initialization logs appear in real-time
- Service startup logs appear
- Platform connection logs appear
- Scheduler logs appear

### When Bot Processes Command
- Command received log appears
- Command execution log appears
- Response sent log appears

## Performance Metrics

- Log latency: <100ms from backend to frontend
- Buffer size: 100 logs (backend), 500 logs (frontend)
- Update frequency: Real-time (event-based, no polling)
- Memory usage: ~1MB for 500 logs

## Debug Mode

To enable more verbose logging, set in .env:

```
LOG_LEVEL=debug
```

Then restart API server. You'll see more detailed logs including:
- Database operations
- AI service requests
- WebSocket events
- Internal service calls

## Success Criteria

✅ API server starts with Socket.io transport
✅ Frontend connects to WebSocket
✅ Terminal receives buffered logs on connect
✅ Terminal receives new logs in real-time
✅ Logs are color-coded by level
✅ Auto-scroll works
✅ Download logs works
✅ Clear logs works
✅ No console errors
✅ Logs appear within 100ms

## Next Steps

Once real-time logging is working:
1. Test with actual bot commands
2. Monitor performance under load
3. Test with multiple clients
4. Test log filtering (future feature)
5. Test log search (future feature)
