# Frontend Dashboard - Detailed Design Document

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         React Frontend (Hostinger Business)                │ │
│  │  - Terminal UI (xterm.js)                                  │ │
│  │  - Control Panel (Start/Stop/Restart/Pause/Resume)         │ │
│  │  - Real-time Monitoring (CPU/Memory/Logs)                  │ │
│  │  - Task Management (CRUD)                                  │ │
│  │  - Analytics Dashboard                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              │ REST API + WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API (VPS)                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Express.js + Socket.io                        │ │
│  │  - Authentication (JWT)                                    │ │
│  │  - Bot Control API (PM2 integration)                       │ │
│  │  - Task API (MongoDB CRUD)                                 │ │
│  │  - Analytics API                                           │ │
│  │  - WebSocket Server (real-time updates)                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Existing Bot Services                         │
│  - WhatsApp Bot (Baileys)                                       │
│  - Discord Bot                                                   │
│  - MongoDB Database                                              │
│  - Notion Sync Service                                           │
│  - PM2 Process Manager                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Component Hierarchy

```
App
├── AuthProvider (Context)
│   └── Router
│       ├── LoginPage
│       └── DashboardLayout
│           ├── Header
│           │   ├── Logo
│           │   ├── BotStatusBadge
│           │   └── UserMenu
│           ├── Sidebar
│           │   └── Navigation
│           └── MainContent
│               ├── HomePage (Dashboard)
│               │   ├── ControlPanel
│               │   │   ├── StatusCard
│               │   │   └── ControlButtons
│               │   ├── MetricsPanel
│               │   │   ├── CPUChart
│               │   │   ├── MemoryChart
│               │   │   └── UptimeCounter
│               │   └── TerminalPanel
│               │       ├── Terminal (xterm.js)
│               │       └── CommandInput
│               ├── TasksPage
│               │   ├── TaskFilters
│               │   ├── TaskTable
│               │   ├── TaskForm (Modal)
│               │   └── BulkActions
│               ├── LogsPage
│               │   ├── LogFilters
│               │   ├── LogViewer
│               │   └── LogControls
│               ├── AnalyticsPage
│               │   ├── OverviewCards
│               │   ├── TasksBySubjectChart
│               │   ├── TasksByPriorityChart
│               │   ├── CompletionRateChart
│               │   └── DeadlineTimeline
│               └── ConfigPage
│                   ├── ConfigForm
│                   └── ConfigActions
```

### State Management (Zustand)

```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// stores/botStore.ts
interface BotState {
  status: 'running' | 'stopped' | 'paused' | 'unknown';
  connections: {
    whatsapp: boolean;
    discord: boolean;
    mongodb: boolean;
    notion: boolean;
  };
  metrics: {
    cpu: number;
    memory: number;
    uptime: number;
  };
  updateStatus: (status: BotStatus) => void;
  updateMetrics: (metrics: Metrics) => void;
}

// stores/taskStore.ts
interface TaskStore {
  tasks: Task[];
  filters: TaskFilters;
  loading: boolean;
  fetchTasks: () => Promise<void>;
  createTask: (task: CreateTaskDto) => Promise<void>;
  updateTask: (id: string, task: UpdateTaskDto) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setFilters: (filters: TaskFilters) => void;
}

// stores/logStore.ts
interface LogStore {
  logs: LogEntry[];
  filters: LogFilters;
  autoScroll: boolean;
  addLog: (log: LogEntry) => void;
  clearLogs: () => void;
  setFilters: (filters: LogFilters) => void;
  toggleAutoScroll: () => void;
}
```

### WebSocket Integration

```typescript
// hooks/useWebSocket.ts
interface WebSocketHook {
  connected: boolean;
  subscribe: (event: string, callback: (data: any) => void) => void;
  unsubscribe: (event: string) => void;
  emit: (event: string, data: any) => void;
}

// WebSocket Events
const WS_EVENTS = {
  // Client → Server
  SUBSCRIBE_LOGS: 'subscribe:logs',
  SUBSCRIBE_METRICS: 'subscribe:metrics',
  SUBSCRIBE_STATUS: 'subscribe:status',
  UNSUBSCRIBE_LOGS: 'unsubscribe:logs',
  EXECUTE_COMMAND: 'execute:command',
  
  // Server → Client
  LOG: 'log',
  METRICS: 'metrics',
  STATUS: 'status',
  NOTIFICATION: 'notification',
  COMMAND_OUTPUT: 'command:output'
};
```

---

## Backend API Architecture

### API Structure

```
src/
├── api/
│   ├── index.ts                 # API entry point
│   ├── routes/
│   │   ├── auth.routes.ts       # Authentication routes
│   │   ├── bot.routes.ts        # Bot control routes
│   │   ├── tasks.routes.ts      # Task management routes
│   │   ├── analytics.routes.ts  # Analytics routes
│   │   └── config.routes.ts     # Configuration routes
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── bot.controller.ts
│   │   ├── tasks.controller.ts
│   │   ├── analytics.controller.ts
│   │   └── config.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT verification
│   │   ├── cors.middleware.ts   # CORS configuration
│   │   ├── rateLimit.middleware.ts
│   │   └── validation.middleware.ts
│   ├── services/
│   │   ├── pm2.service.ts       # PM2 process control
│   │   ├── metrics.service.ts   # System metrics
│   │   └── logs.service.ts      # Log management
│   └── websocket/
│       ├── index.ts             # WebSocket server
│       └── handlers/
│           ├── logs.handler.ts
│           ├── metrics.handler.ts
│           └── status.handler.ts
```

### PM2 Integration

```typescript
// api/services/pm2.service.ts
import pm2 from 'pm2';

export class PM2Service {
  /**
   * Get bot process status
   */
  async getStatus(): Promise<ProcessStatus> {
    return new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) return reject(err);
        
        pm2.describe('task-monitor', (err, processDescription) => {
          pm2.disconnect();
          if (err) return reject(err);
          
          const proc = processDescription[0];
          resolve({
            status: proc.pm2_env.status, // 'online', 'stopped', 'errored'
            pid: proc.pid,
            uptime: Date.now() - proc.pm2_env.pm_uptime,
            restarts: proc.pm2_env.restart_time,
            cpu: proc.monit.cpu,
            memory: proc.monit.memory
          });
        });
      });
    });
  }

  /**
   * Start bot process
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) return reject(err);
        
        pm2.start('ecosystem.config.js', (err) => {
          pm2.disconnect();
          if (err) return reject(err);
          resolve();
        });
      });
    });
  }

  /**
   * Stop bot process
   */
  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) return reject(err);
        
        pm2.stop('task-monitor', (err) => {
          pm2.disconnect();
          if (err) return reject(err);
          resolve();
        });
      });
    });
  }

  /**
   * Restart bot process
   */
  async restart(): Promise<void> {
    return new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) return reject(err);
        
        pm2.restart('task-monitor', (err) => {
          pm2.disconnect();
          if (err) return reject(err);
          resolve();
        });
      });
    });
  }

  /**
   * Pause bot (send SIGSTOP)
   */
  async pause(): Promise<void> {
    return new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) return reject(err);
        
        pm2.describe('task-monitor', (err, processDescription) => {
          if (err) {
            pm2.disconnect();
            return reject(err);
          }
          
          const proc = processDescription[0];
          if (!proc || !proc.pid) {
            pm2.disconnect();
            return reject(new Error('Process not found'));
          }
          
          // Send SIGSTOP to pause process
          process.kill(proc.pid, 'SIGSTOP');
          pm2.disconnect();
          resolve();
        });
      });
    });
  }

  /**
   * Resume bot (send SIGCONT)
   */
  async resume(): Promise<void> {
    return new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) return reject(err);
        
        pm2.describe('task-monitor', (err, processDescription) => {
          if (err) {
            pm2.disconnect();
            return reject(err);
          }
          
          const proc = processDescription[0];
          if (!proc || !proc.pid) {
            pm2.disconnect();
            return reject(new Error('Process not found'));
          }
          
          // Send SIGCONT to resume process
          process.kill(proc.pid, 'SIGCONT');
          pm2.disconnect();
          resolve();
        });
      });
    });
  }

  /**
   * Get process metrics
   */
  async getMetrics(): Promise<ProcessMetrics> {
    const status = await this.getStatus();
    return {
      cpu: status.cpu,
      memory: status.memory,
      uptime: status.uptime
    };
  }
}
```

---

## UI/UX Design

### Color Palette (Terminal Dark Theme)

```css
:root {
  /* Background */
  --bg-primary: #1e1e1e;      /* Main background */
  --bg-secondary: #252526;    /* Cards, panels */
  --bg-tertiary: #2d2d30;     /* Hover states */
  --bg-elevated: #3e3e42;     /* Modals, dropdowns */
  
  /* Text */
  --text-primary: #00ff00;    /* Terminal green */
  --text-secondary: #cccccc;  /* Regular text */
  --text-muted: #858585;      /* Disabled, hints */
  
  /* Accent */
  --accent: #007acc;          /* Links, focus */
  --accent-hover: #005a9e;
  
  /* Status */
  --success: #4ec9b0;         /* Running, success */
  --warning: #ce9178;         /* Warning, paused */
  --error: #f48771;           /* Error, stopped */
  --info: #569cd6;            /* Info */
  
  /* Border */
  --border: #3e3e42;
  --border-focus: #007acc;
  
  /* Shadow */
  --shadow: rgba(0, 0, 0, 0.5);
}
```

### Layout Design

#### Desktop (>1024px)
```
┌─────────────────────────────────────────────────────────────────┐
│  Header (h-16)                                                   │
│  Logo | Bot Status Badge | User Menu                            │
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                       │
│ Sidebar  │           Main Content Area                          │
│ (w-64)   │           (flex-1)                                   │
│          │                                                       │
│ Home     │  ┌─────────────────────────────────────────────┐    │
│ Tasks    │  │  Control Panel                              │    │
│ Logs     │  │  [Start] [Stop] [Restart] [Pause] [Resume]  │    │
│ Analytics│  └─────────────────────────────────────────────┘    │
│ Config   │                                                       │
│          │  ┌─────────────────────────────────────────────┐    │
│          │  │  Metrics (CPU, Memory, Uptime)              │    │
│          │  └─────────────────────────────────────────────┘    │
│          │                                                       │
│          │  ┌─────────────────────────────────────────────┐    │
│          │  │  Terminal                                   │    │
│          │  │  $ bot status                               │    │
│          │  │  ✅ Running                                 │    │
│          │  │  $ _                                        │    │
│          │  └─────────────────────────────────────────────┘    │
│          │                                                       │
└──────────┴──────────────────────────────────────────────────────┘
```

#### Tablet (768px - 1024px)
- Collapsible sidebar (hamburger menu)
- Stacked metrics cards (2 columns)
- Smaller terminal height

#### Mobile (<768px)
- Bottom navigation bar
- Full-width cards
- Compact control buttons
- Swipeable terminal

---

## Component Specifications

### 1. Control Panel Component

```typescript
// components/ControlPanel/ControlPanel.tsx
interface ControlPanelProps {
  status: BotStatus;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  onRestart: () => Promise<void>;
  onPause: () => Promise<void>;
  onResume: () => Promise<void>;
}

// Features:
// - Status indicator (running/stopped/paused)
// - 5 control buttons with icons
// - Confirmation dialogs for destructive actions
// - Loading states during operations
// - Error handling with toast notifications
// - Disabled states based on current status
```

### 2. Terminal Component

```typescript
// components/Terminal/Terminal.tsx
interface TerminalProps {
  height?: number;
  onCommand?: (command: string) => void;
}

// Features:
// - xterm.js integration
// - Command history (up/down arrows)
// - Autocomplete (Tab key)
// - Copy/paste support
// - Resize handle
// - Clear command
// - Search in terminal (Ctrl+F)
// - Export terminal output
```

### 3. Metrics Panel Component

```typescript
// components/MetricsPanel/MetricsPanel.tsx
interface MetricsPanelProps {
  metrics: {
    cpu: number;
    memory: number;
    uptime: number;
  };
  connections: {
    whatsapp: boolean;
    discord: boolean;
    mongodb: boolean;
    notion: boolean;
  };
}

// Features:
// - Real-time CPU chart (line chart, last 60 seconds)
// - Real-time Memory chart (line chart, last 60 seconds)
// - Uptime counter (formatted: "24h 15m 30s")
// - Connection status indicators
// - Auto-refresh every 5 seconds
```

### 4. Task Table Component

```typescript
// components/TaskTable/TaskTable.tsx
interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
}

// Features:
// - Sortable columns
// - Filterable by status/subject/priority
// - Search by keyword
// - Bulk selection
// - Pagination (20 per page)
// - Export to CSV/JSON
// - Responsive (cards on mobile)
```

### 5. Log Viewer Component

```typescript
// components/LogViewer/LogViewer.tsx
interface LogViewerProps {
  logs: LogEntry[];
  autoScroll: boolean;
  onToggleAutoScroll: () => void;
  onClear: () => void;
  onDownload: () => void;
}

// Features:
// - Virtual scrolling (react-window)
// - Filter by level (info/warn/error)
// - Search logs
// - Auto-scroll toggle
// - Clear logs button
// - Download logs as .txt
// - Syntax highlighting for errors
```

---

## API Endpoints Specification

### Authentication

```typescript
POST /api/auth/login
Request: { username: string, password: string }
Response: { token: string, refreshToken: string, user: User }

POST /api/auth/logout
Headers: Authorization: Bearer <token>
Response: { success: boolean }

POST /api/auth/refresh
Request: { refreshToken: string }
Response: { token: string }

POST /api/auth/change-password
Headers: Authorization: Bearer <token>
Request: { oldPassword: string, newPassword: string }
Response: { success: boolean }
```

### Bot Control

```typescript
GET /api/bot/status
Headers: Authorization: Bearer <token>
Response: {
  status: 'running' | 'stopped' | 'paused',
  connections: {
    whatsapp: boolean,
    discord: boolean,
    mongodb: boolean,
    notion: boolean
  },
  uptime: number,
  pid: number,
  restarts: number
}

POST /api/bot/start
Headers: Authorization: Bearer <token>
Response: { success: boolean, message: string }

POST /api/bot/stop
Headers: Authorization: Bearer <token>
Response: { success: boolean, message: string }

POST /api/bot/restart
Headers: Authorization: Bearer <token>
Response: { success: boolean, message: string }

POST /api/bot/pause
Headers: Authorization: Bearer <token>
Response: { success: boolean, message: string }

POST /api/bot/resume
Headers: Authorization: Bearer <token>
Response: { success: boolean, message: string }

GET /api/bot/metrics
Headers: Authorization: Bearer <token>
Response: {
  cpu: number,
  memory: number,
  uptime: number
}

GET /api/bot/logs?limit=100&level=info
Headers: Authorization: Bearer <token>
Response: {
  logs: LogEntry[],
  total: number
}

POST /api/bot/command
Headers: Authorization: Bearer <token>
Request: { command: string }
Response: { output: string, exitCode: number }
```

### Tasks

```typescript
GET /api/tasks?status=active&subject=Math&priority=urgent
Headers: Authorization: Bearer <token>
Response: { tasks: Task[], total: number }

GET /api/tasks/:id
Headers: Authorization: Bearer <token>
Response: { task: Task }

POST /api/tasks
Headers: Authorization: Bearer <token>
Request: CreateTaskDto
Response: { task: Task }

PUT /api/tasks/:id
Headers: Authorization: Bearer <token>
Request: UpdateTaskDto
Response: { task: Task }

DELETE /api/tasks/:id
Headers: Authorization: Bearer <token>
Response: { success: boolean }

POST /api/tasks/:id/complete
Headers: Authorization: Bearer <token>
Response: { task: Task }

POST /api/tasks/bulk-delete
Headers: Authorization: Bearer <token>
Request: { ids: string[] }
Response: { deleted: number }

GET /api/tasks/export?format=csv
Headers: Authorization: Bearer <token>
Response: File download
```

### Analytics

```typescript
GET /api/analytics/overview
Headers: Authorization: Bearer <token>
Response: {
  totalTasks: number,
  completedTasks: number,
  pendingTasks: number,
  completionRate: number
}

GET /api/analytics/tasks-by-subject
Headers: Authorization: Bearer <token>
Response: { subject: string, count: number }[]

GET /api/analytics/tasks-by-priority
Headers: Authorization: Bearer <token>
Response: { priority: string, count: number }[]

GET /api/analytics/completion-rate?startDate=2026-01-01&endDate=2026-02-11
Headers: Authorization: Bearer <token>
Response: { date: string, rate: number }[]
```

### Configuration

```typescript
GET /api/config
Headers: Authorization: Bearer <token>
Response: { config: ConfigData }

PUT /api/config
Headers: Authorization: Bearer <token>
Request: { config: Partial<ConfigData> }
Response: { success: boolean, config: ConfigData }

POST /api/config/backup
Headers: Authorization: Bearer <token>
Response: File download
```

---

## Security Design

### Authentication Flow

```
1. User enters credentials
2. Frontend sends POST /api/auth/login
3. Backend validates credentials (bcrypt)
4. Backend generates JWT token (24h expiry)
5. Backend generates refresh token (7d expiry)
6. Frontend stores tokens in localStorage
7. Frontend includes token in Authorization header
8. Backend validates token on each request
9. If token expired, frontend uses refresh token
10. If refresh token expired, redirect to login
```

### Security Measures

1. **HTTPS Only** - All production traffic over HTTPS
2. **JWT Tokens** - Stateless authentication
3. **Refresh Tokens** - Long-lived tokens for renewal
4. **Rate Limiting** - 100 requests/minute per IP
5. **CORS** - Whitelist frontend domain only
6. **Input Validation** - Zod schemas on all endpoints
7. **SQL Injection Prevention** - Mongoose ODM
8. **XSS Protection** - React auto-escaping + CSP headers
9. **CSRF Protection** - SameSite cookies
10. **Password Hashing** - bcrypt with salt rounds=10

---

## Deployment Architecture

### Frontend Deployment (Hostinger Business)

```
1. Build React app: npm run build
2. Output: dist/ folder with static files
3. Upload to Hostinger via FTP/File Manager
4. Configure subdomain: dashboard.yourdomain.com
5. Point subdomain to dist/ folder
6. Enable SSL certificate (Let's Encrypt)
7. Configure .htaccess for SPA routing:

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Backend Deployment (VPS)

```
1. SSH into VPS
2. Pull latest code: git pull origin main
3. Install dependencies: npm install
4. Build TypeScript: npm run build
5. Update .env with API keys
6. Start with PM2: pm2 start ecosystem.config.js
7. Configure Nginx reverse proxy (optional):

server {
    listen 443 ssl;
    server_name api.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Environment Variables

```bash
# Frontend (.env)
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com

# Backend (.env)
# Existing bot variables...
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=7d
FRONTEND_URL=https://dashboard.yourdomain.com
CORS_ORIGINS=https://dashboard.yourdomain.com
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
```

---

## Performance Optimization

### Frontend

1. **Code Splitting** - Lazy load routes
2. **Bundle Optimization** - Tree shaking, minification
3. **Image Optimization** - WebP format, lazy loading
4. **Caching** - Service worker for offline support
5. **Virtual Scrolling** - For logs and task lists
6. **Debouncing** - Search inputs, filters
7. **Memoization** - React.memo, useMemo, useCallback

### Backend

1. **Connection Pooling** - MongoDB connection pool
2. **Caching** - Redis for frequently accessed data (optional)
3. **Compression** - Gzip responses
4. **Query Optimization** - MongoDB indexes
5. **Rate Limiting** - Prevent abuse
6. **WebSocket Throttling** - Limit message frequency

---

## Testing Strategy

### Frontend Tests

```typescript
// Unit Tests (Jest + React Testing Library)
- Component rendering
- User interactions
- State management
- Hooks behavior

// Integration Tests
- API calls
- WebSocket connections
- Authentication flow
- Form submissions

// E2E Tests (Playwright)
- Login flow
- Bot control actions
- Task CRUD operations
- Terminal commands
```

### Backend Tests

```typescript
// Unit Tests (Jest)
- Controller logic
- Service methods
- Middleware functions
- Utility functions

// Integration Tests (Supertest)
- API endpoints
- Authentication
- Database operations
- PM2 integration

// WebSocket Tests
- Connection handling
- Event emission
- Subscription management
```

---

## Monitoring & Logging

### Frontend Logging

```typescript
// Use console.log for development
// Use Sentry for production errors
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: import.meta.env.MODE
});
```

### Backend Logging

```typescript
// Use existing Winston logger
// Add API request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userId: req.user?.id
  });
  next();
});
```

---

## Future Enhancements

### Phase 2 Features

1. **Multi-user Support** - Multiple admin accounts with roles
2. **Audit Log** - Track all actions (who did what when)
3. **Scheduled Tasks** - Cron jobs via UI
4. **Backup/Restore** - Database backup via dashboard
5. **Plugin System** - Extend functionality with plugins
6. **Mobile App** - React Native version
7. **Dark/Light Theme** - Theme toggle
8. **i18n** - Multi-language support (EN, ID)
9. **Advanced Analytics** - ML insights, predictions
10. **Monitoring Integration** - Sentry, DataDog, etc.

---

## Success Criteria

✅ Dashboard loads in < 2 seconds  
✅ Bot control actions complete in < 1 second  
✅ Real-time logs update with < 100ms latency  
✅ 99.9% uptime for dashboard  
✅ Zero security vulnerabilities  
✅ Responsive on all devices  
✅ Accessible (WCAG 2.1 AA)  
✅ Positive user feedback  

---

**Status:** Design Complete  
**Next Step:** Create tasks.md with implementation tasks  
**Estimated Timeline:** 26-34 hours (3-4 days)
