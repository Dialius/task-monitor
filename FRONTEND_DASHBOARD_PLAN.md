# 🎨 Frontend Dashboard Plan - Terminal Style

## 💡 Konsep

**Ide:** Tambah web dashboard dengan terminal-style interface untuk monitoring dan manage bot.

**Architecture:**
```
┌─────────────────────────────────────────────────────┐
│                  Frontend (React)                    │
│  - Terminal-style UI                                 │
│  - Real-time logs                                    │
│  - Bot status monitoring                             │
│  - Task management                                   │
│  - Command execution                                 │
└─────────────────┬───────────────────────────────────┘
                  │ HTTP/WebSocket
┌─────────────────▼───────────────────────────────────┐
│              Backend API (Express)                   │
│  - REST API endpoints                                │
│  - WebSocket for real-time updates                  │
│  - Authentication                                    │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│              Existing Bot Services                   │
│  - WhatsApp Bot                                      │
│  - Discord Bot                                       │
│  - MongoDB                                           │
│  - Notion Sync                                       │
└─────────────────────────────────────────────────────┘
```

---

## ✅ BISA! Dan Ini Solusinya

### Deployment Strategy

**Option 1: Monorepo (Recommended) ⭐**
```
task-monitor/
├── backend/          ← Existing bot (VPS)
│   ├── src/
│   ├── dist/
│   └── package.json
├── frontend/         ← New dashboard (Hostinger Business)
│   ├── src/
│   ├── dist/
│   └── package.json
└── package.json      ← Root
```

**Deployment:**
- Backend (Bot): VPS ($4.99/month)
- Frontend (Dashboard): Hostinger Business (sudah punya!)

**Benefit:**
- ✅ Backend tetap di VPS (stable untuk bot)
- ✅ Frontend di Hostinger Business (static files)
- ✅ Pakai hosting yang sudah ada!
- ✅ No additional cost untuk frontend!

---

## 🎯 Features Dashboard

### 1. Terminal-Style Interface
```
┌─────────────────────────────────────────────────────┐
│ 🤖 Task Monitor Bot - Admin Dashboard               │
├─────────────────────────────────────────────────────┤
│                                                      │
│ $ bot status                                         │
│ ✅ Bot Status: Running                              │
│ ✅ WhatsApp: Connected (628994630519)               │
│ ❌ Discord: Disabled                                │
│ ✅ MongoDB: Connected                               │
│ ✅ Notion: Synced (5 tasks)                         │
│                                                      │
│ $ bot logs --tail 10                                │
│ [2026-02-10 15:30:45] WhatsApp connected            │
│ [2026-02-10 15:31:12] Task created: Tugas Math      │
│ [2026-02-10 15:32:00] Synced to Notion              │
│ ...                                                  │
│                                                      │
│ $ _                                                  │
└─────────────────────────────────────────────────────┘
```

### 2. Real-time Monitoring
- ✅ Bot status (running/stopped)
- ✅ Connection status (WhatsApp/Discord/MongoDB)
- ✅ Live logs streaming
- ✅ Task statistics
- ✅ Memory/CPU usage
- ✅ Uptime

### 3. Task Management
- ✅ View all tasks
- ✅ Create new task (GUI form)
- ✅ Edit task
- ✅ Delete task
- ✅ Mark as complete
- ✅ Filter by date/subject/priority

### 4. Command Execution
- ✅ Execute bot commands via web
- ✅ Test commands
- ✅ View command history
- ✅ Command autocomplete

### 5. Analytics
- ✅ Task completion rate
- ✅ Most active subjects
- ✅ Deadline distribution
- ✅ User activity

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **UI Library:** 
  - `xterm.js` - Terminal emulator
  - `react-terminal-ui` - Terminal components
  - Or custom terminal CSS
- **Styling:** Tailwind CSS (terminal theme)
- **State Management:** Zustand or React Query
- **WebSocket:** Socket.io-client
- **Charts:** Chart.js or Recharts
- **Build:** Vite (fast build)

### Backend API (New)
- **Framework:** Express.js (already have)
- **WebSocket:** Socket.io
- **Auth:** JWT tokens
- **CORS:** Enable for frontend domain
- **Rate Limiting:** Express-rate-limit

---

## 📁 Project Structure

```
task-monitor/
├── backend/                    ← Existing bot
│   ├── src/
│   │   ├── api/               ← NEW: API routes
│   │   │   ├── routes/
│   │   │   │   ├── tasks.ts
│   │   │   │   ├── bot.ts
│   │   │   │   ├── logs.ts
│   │   │   │   └── auth.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   └── cors.ts
│   │   │   └── websocket.ts
│   │   ├── bot.ts             ← Existing
│   │   ├── services/          ← Existing
│   │   └── ...
│   └── package.json
│
├── frontend/                   ← NEW: Dashboard
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Terminal/
│   │   │   │   ├── Terminal.tsx
│   │   │   │   ├── CommandInput.tsx
│   │   │   │   └── LogViewer.tsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── StatusCard.tsx
│   │   │   │   ├── TaskList.tsx
│   │   │   │   └── Analytics.tsx
│   │   │   └── Layout/
│   │   │       ├── Header.tsx
│   │   │       └── Sidebar.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Tasks.tsx
│   │   │   ├── Logs.tsx
│   │   │   └── Login.tsx
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts
│   │   │   └── useAuth.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── package.json                ← Root (optional)
```

---

## 🚀 Implementation Plan

### Phase 1: Backend API (2-3 hours)

**Step 1.1: Create API Routes**
```typescript
// src/api/routes/bot.ts
import express from 'express';

const router = express.Router();

// Get bot status
router.get('/status', async (req, res) => {
  res.json({
    status: 'running',
    whatsapp: { connected: true, number: '628994630519' },
    discord: { connected: false },
    mongodb: { connected: true },
    notion: { synced: true, taskCount: 5 },
    uptime: process.uptime()
  });
});

// Get bot logs
router.get('/logs', async (req, res) => {
  const { limit = 100 } = req.query;
  // Read from log files
  res.json({ logs: [...] });
});

// Execute command
router.post('/command', async (req, res) => {
  const { command } = req.body;
  // Execute command and return result
  res.json({ success: true, output: '...' });
});

export default router;
```

**Step 1.2: Add WebSocket Support**
```typescript
// src/api/websocket.ts
import { Server } from 'socket.io';

export function setupWebSocket(io: Server) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Stream logs
    socket.on('subscribe:logs', () => {
      // Send real-time logs
    });
    
    // Bot status updates
    socket.on('subscribe:status', () => {
      // Send status updates every 5 seconds
    });
  });
}
```

**Step 1.3: Add Authentication**
```typescript
// src/api/middleware/auth.ts
import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

---

### Phase 2: Frontend Dashboard (3-4 hours)

**Step 2.1: Setup React + Vite**
```bash
cd task-monitor
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

**Step 2.2: Install Dependencies**
```bash
npm install \
  @xterm/xterm \
  socket.io-client \
  axios \
  zustand \
  react-router-dom \
  tailwindcss \
  chart.js \
  react-chartjs-2
```

**Step 2.3: Create Terminal Component**
```typescript
// src/components/Terminal/Terminal.tsx
import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';

export function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm>();

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      theme: {
        background: '#1e1e1e',
        foreground: '#00ff00',
        cursor: '#00ff00'
      },
      fontSize: 14,
      fontFamily: 'Fira Code, monospace'
    });

    term.open(terminalRef.current);
    term.writeln('🤖 Task Monitor Bot - Admin Dashboard');
    term.writeln('Type "help" for available commands\n');
    term.write('$ ');

    xtermRef.current = term;

    return () => term.dispose();
  }, []);

  return <div ref={terminalRef} className="h-full" />;
}
```

**Step 2.4: Create Dashboard Page**
```typescript
// src/pages/Dashboard.tsx
import { Terminal } from '../components/Terminal/Terminal';
import { StatusCard } from '../components/Dashboard/StatusCard';
import { TaskList } from '../components/Dashboard/TaskList';

export function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 p-4">
      {/* Status Cards */}
      <div className="col-span-12 grid grid-cols-4 gap-4">
        <StatusCard title="Bot Status" value="Running" status="success" />
        <StatusCard title="WhatsApp" value="Connected" status="success" />
        <StatusCard title="Tasks" value="12" status="info" />
        <StatusCard title="Uptime" value="24h 15m" status="info" />
      </div>

      {/* Terminal */}
      <div className="col-span-8 bg-gray-900 rounded-lg p-4 h-96">
        <Terminal />
      </div>

      {/* Task List */}
      <div className="col-span-4 bg-white rounded-lg p-4 h-96 overflow-auto">
        <TaskList />
      </div>
    </div>
  );
}
```

---

### Phase 3: Integration (1-2 hours)

**Step 3.1: Connect Frontend to Backend**
```typescript
// src/services/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Bot API
export const botApi = {
  getStatus: () => api.get('/bot/status'),
  getLogs: (limit = 100) => api.get(`/bot/logs?limit=${limit}`),
  executeCommand: (command: string) => api.post('/bot/command', { command })
};

// Tasks API
export const tasksApi = {
  getAll: () => api.get('/tasks'),
  create: (data: any) => api.post('/tasks', data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`)
};
```

**Step 3.2: Setup WebSocket**
```typescript
// src/hooks/useWebSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useWebSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000');

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      newSocket.emit('subscribe:logs');
      newSocket.emit('subscribe:status');
    });

    newSocket.on('log', (log: string) => {
      setLogs(prev => [...prev, log].slice(-100));
    });

    newSocket.on('status', (newStatus: any) => {
      setStatus(newStatus);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, logs, status };
}
```

---

### Phase 4: Deployment (30 minutes)

**Backend (VPS):**
```bash
# Add API routes to existing bot
cd /opt/task-monitor/backend
npm install socket.io jsonwebtoken cors
npm run build
pm2 restart task-monitor
```

**Frontend (Hostinger Business):**
```bash
# Build frontend
cd frontend
npm run build

# Upload dist/ to Hostinger Business
# Via FTP or File Manager
# Point domain/subdomain to dist/
```

**Environment Variables:**
```bash
# Frontend (.env)
VITE_API_URL=https://your-vps-ip:3000/api
VITE_WS_URL=https://your-vps-ip:3000

# Backend (.env)
JWT_SECRET=your-secret-key
FRONTEND_URL=https://dashboard.yourdomain.com
```

---

## 🎨 UI Design (Terminal Style)

### Color Scheme
```css
:root {
  --bg-primary: #1e1e1e;
  --bg-secondary: #252526;
  --text-primary: #00ff00;
  --text-secondary: #cccccc;
  --accent: #007acc;
  --success: #4ec9b0;
  --warning: #ce9178;
  --error: #f48771;
}
```

### Terminal Commands
```
Available Commands:
  bot status              - Show bot status
  bot logs [--tail N]     - Show logs
  bot restart             - Restart bot
  task list               - List all tasks
  task create             - Create new task
  task delete <id>        - Delete task
  help                    - Show this help
  clear                   - Clear terminal
```

---

## 💰 Cost Analysis

### With Frontend Dashboard

**Hosting:**
- VPS (Backend): $4.99/month
- Hostinger Business (Frontend): $0 (sudah punya!)
- **Total: $4.99/month**

**No Additional Cost!** ✅

---

## ✅ Benefits

1. **Visual Monitoring** - See bot status at a glance
2. **Easy Management** - Manage tasks via GUI
3. **Real-time Logs** - Debug issues quickly
4. **Remote Access** - Access from anywhere
5. **Professional** - Looks more polished
6. **Use Existing Hosting** - Hostinger Business untuk frontend!

---

## 🚀 Quick Start

### Option 1: Minimal Dashboard (2-3 hours)
- Basic terminal UI
- Bot status display
- Task list
- Simple commands

### Option 2: Full Dashboard (1-2 days)
- Advanced terminal with autocomplete
- Real-time logs streaming
- Task management (CRUD)
- Analytics charts
- User authentication
- Command history

---

## 📝 Next Steps

1. **Decide Features** - Minimal or Full?
2. **Setup Frontend** - Create React app
3. **Add API Routes** - Backend endpoints
4. **Build UI** - Terminal components
5. **Deploy** - VPS + Hostinger Business
6. **Test** - Verify everything works

---

**Mau saya buatkan sekarang?** 

Saya bisa:
1. Setup project structure
2. Create basic terminal UI
3. Add API routes
4. Implement real-time logs
5. Deploy guide

**Pilih:**
- A: Minimal Dashboard (cepat, 2-3 jam)
- B: Full Dashboard (lengkap, 1-2 hari)
- C: Custom (kamu tentukan features)

Let me know! 🚀
