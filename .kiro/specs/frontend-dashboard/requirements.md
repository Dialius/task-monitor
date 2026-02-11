# Frontend Dashboard Requirements - Full Version

## Overview

Web-based admin dashboard dengan terminal-style interface untuk monitoring dan controlling WhatsApp Class Reminder Bot. Inspired by Discord bot hosting panels dan PM2 web dashboards.

---

## User Stories

### US-1: Bot Control Panel
**As an** admin  
**I want to** start, stop, restart, and pause the bot from web dashboard  
**So that** I can manage bot without SSH access to VPS

**Acceptance Criteria:**
- 1.1. Dashboard shows current bot status (running/stopped/paused)
- 1.2. Start button launches bot process
- 1.3. Stop button gracefully shuts down bot
- 1.4. Restart button stops and starts bot
- 1.5. Pause button temporarily suspends bot operations
- 1.6. Resume button continues paused bot
- 1.7. All actions show confirmation dialog
- 1.8. Actions update status in real-time
- 1.9. Error messages shown if action fails

---

### US-2: Real-time Monitoring
**As an** admin  
**I want to** see real-time bot metrics and logs  
**So that** I can monitor bot health and debug issues

**Acceptance Criteria:**
- 2.1. CPU usage displayed with live chart
- 2.2. Memory usage displayed with live chart
- 2.3. Uptime counter updates every second
- 2.4. Connection status for WhatsApp/Discord/MongoDB
- 2.5. Live log streaming in terminal window
- 2.6. Log filtering by level (info/warn/error)
- 2.7. Auto-scroll logs (with pause option)
- 2.8. Download logs as file
- 2.9. Clear logs button

---

### US-3: Terminal Interface
**As an** admin  
**I want to** execute commands via terminal interface  
**So that** I can interact with bot like SSH terminal

**Acceptance Criteria:**
- 3.1. Terminal emulator with green text on black background
- 3.2. Command input with autocomplete
- 3.3. Command history (up/down arrows)
- 3.4. Execute bot commands (e.g., `bot status`, `task list`)
- 3.5. Clear terminal command
- 3.6. Copy terminal output
- 3.7. Resize terminal window
- 3.8. Multiple terminal tabs (optional)

---

### US-4: Task Management
**As an** admin  
**I want to** manage tasks via GUI  
**So that** I don't need to use command format

**Acceptance Criteria:**
- 4.1. View all tasks in table/card view
- 4.2. Create new task with form
- 4.3. Edit existing task
- 4.4. Delete task with confirmation
- 4.5. Mark task as complete
- 4.6. Filter tasks by status/subject/priority
- 4.7. Search tasks by keyword
- 4.8. Sort tasks by deadline/created date
- 4.9. Bulk actions (delete multiple, mark complete)
- 4.10. Export tasks to CSV/JSON

---

### US-5: Analytics Dashboard
**As an** admin  
**I want to** see analytics and statistics  
**So that** I can understand bot usage patterns

**Acceptance Criteria:**
- 5.1. Total tasks count
- 5.2. Completed vs pending tasks chart
- 5.3. Tasks by subject pie chart
- 5.4. Tasks by priority bar chart
- 5.5. Deadline distribution timeline
- 5.6. Command usage statistics
- 5.7. User activity heatmap
- 5.8. Date range filter for analytics
- 5.9. Export analytics as PDF/image

---

### US-6: Authentication & Security
**As an** admin  
**I want to** secure dashboard with authentication  
**So that** only authorized users can access

**Acceptance Criteria:**
- 6.1. Login page with username/password
- 6.2. JWT token-based authentication
- 6.3. Session timeout after 24 hours
- 6.4. Remember me option
- 6.5. Logout button
- 6.6. Password change functionality
- 6.7. Rate limiting on login attempts
- 6.8. HTTPS required for production

---

### US-7: Configuration Management
**As an** admin  
**I want to** update bot configuration via dashboard  
**So that** I don't need to edit .env file manually

**Acceptance Criteria:**
- 7.1. View current configuration
- 7.2. Edit environment variables
- 7.3. Toggle WhatsApp/Discord enable/disable
- 7.4. Update Notion credentials
- 7.5. Update AI service keys
- 7.6. Save configuration
- 7.7. Restart bot after config change
- 7.8. Validate configuration before save
- 7.9. Backup configuration

---

### US-8: Notification System
**As an** admin  
**I want to** receive notifications for important events  
**So that** I'm aware of issues immediately

**Acceptance Criteria:**
- 8.1. Browser notifications for bot crashes
- 8.2. Alert when bot disconnects from WhatsApp
- 8.3. Warning when memory usage > 80%
- 8.4. Error notifications in dashboard
- 8.5. Notification history
- 8.6. Mute notifications option
- 8.7. Email notifications (optional)

---

## Technical Requirements

### Frontend Stack
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **UI Library:** 
  - `@xterm/xterm` - Terminal emulator
  - `shadcn/ui` - UI components
  - `lucide-react` - Icons
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **WebSocket:** Socket.io-client
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Routing:** React Router v6
- **Auth:** JWT + localStorage

### Backend API Requirements
- **Framework:** Express.js
- **WebSocket:** Socket.io
- **Authentication:** JWT (jsonwebtoken)
- **Process Control:** PM2 programmatic API
- **CORS:** cors middleware
- **Rate Limiting:** express-rate-limit
- **Validation:** Zod
- **Logging:** Winston

### API Endpoints

**Authentication:**
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/change-password` - Change password

**Bot Control:**
- `GET /api/bot/status` - Get bot status
- `POST /api/bot/start` - Start bot
- `POST /api/bot/stop` - Stop bot
- `POST /api/bot/restart` - Restart bot
- `POST /api/bot/pause` - Pause bot
- `POST /api/bot/resume` - Resume bot
- `GET /api/bot/metrics` - Get CPU/Memory metrics
- `GET /api/bot/logs` - Get logs
- `POST /api/bot/command` - Execute command

**Tasks:**
- `GET /api/tasks` - List all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/complete` - Mark complete
- `POST /api/tasks/bulk-delete` - Bulk delete
- `GET /api/tasks/export` - Export tasks

**Analytics:**
- `GET /api/analytics/overview` - Overview stats
- `GET /api/analytics/tasks-by-subject` - Tasks by subject
- `GET /api/analytics/tasks-by-priority` - Tasks by priority
- `GET /api/analytics/completion-rate` - Completion rate
- `GET /api/analytics/command-usage` - Command usage

**Configuration:**
- `GET /api/config` - Get configuration
- `PUT /api/config` - Update configuration
- `POST /api/config/backup` - Backup config

### WebSocket Events

**Client → Server:**
- `subscribe:logs` - Subscribe to log stream
- `subscribe:metrics` - Subscribe to metrics
- `subscribe:status` - Subscribe to status updates
- `unsubscribe:logs` - Unsubscribe from logs
- `execute:command` - Execute terminal command

**Server → Client:**
- `log` - New log entry
- `metrics` - CPU/Memory metrics
- `status` - Bot status update
- `notification` - System notification
- `command:output` - Command execution result

---

## UI/UX Requirements

### Layout
```
┌─────────────────────────────────────────────────────┐
│  Header: Logo | Bot Status | User Menu              │
├──────────┬──────────────────────────────────────────┤
│          │                                           │
│ Sidebar  │           Main Content Area              │
│          │                                           │
│ - Home   │  ┌─────────────────────────────────┐    │
│ - Tasks  │  │  Control Panel                  │    │
│ - Logs   │  │  [Start] [Stop] [Restart]       │    │
│ - Config │  └─────────────────────────────────┘    │
│ - Analytics                                         │
│          │  ┌─────────────────────────────────┐    │
│          │  │  Terminal                       │    │
│          │  │  $ bot status                   │    │
│          │  │  ✅ Running                     │    │
│          │  └─────────────────────────────────┘    │
└──────────┴──────────────────────────────────────────┘
```

### Color Scheme (Terminal Dark Theme)
```css
--bg-primary: #1e1e1e
--bg-secondary: #252526
--bg-tertiary: #2d2d30
--text-primary: #00ff00
--text-secondary: #cccccc
--accent: #007acc
--success: #4ec9b0
--warning: #ce9178
--error: #f48771
--border: #3e3e42
```

### Responsive Design
- Desktop: Full layout with sidebar
- Tablet: Collapsible sidebar
- Mobile: Bottom navigation

---

## Performance Requirements

- **Initial Load:** < 2 seconds
- **API Response:** < 500ms
- **WebSocket Latency:** < 100ms
- **Log Streaming:** Max 100 logs in memory
- **Chart Updates:** Every 5 seconds
- **Bundle Size:** < 500KB (gzipped)

---

## Security Requirements

- HTTPS only in production
- JWT tokens with 24h expiration
- Refresh tokens with 7d expiration
- Rate limiting: 100 requests/minute per IP
- Input validation on all endpoints
- SQL injection prevention
- XSS protection
- CSRF protection
- Secure password hashing (bcrypt)

---

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari, Chrome Android

---

## Deployment Requirements

### Frontend (Hostinger Business)
- Build output: `dist/` folder
- Static file hosting
- Custom domain/subdomain
- SSL certificate

### Backend (VPS)
- Node.js 18+
- PM2 process manager
- MongoDB local
- Nginx reverse proxy (optional)
- SSL certificate

---

## Testing Requirements

- Unit tests for components (Jest + React Testing Library)
- Integration tests for API (Supertest)
- E2E tests for critical flows (Playwright)
- WebSocket connection tests
- Authentication flow tests
- Bot control tests

---

## Documentation Requirements

- Setup guide for developers
- Deployment guide
- API documentation
- User manual
- Troubleshooting guide

---

## Success Metrics

- Dashboard loads in < 2 seconds
- Bot control actions complete in < 1 second
- Real-time logs update with < 100ms latency
- 99.9% uptime for dashboard
- Zero security vulnerabilities
- Positive user feedback

---

## Future Enhancements (Phase 2)

- Multi-user support with roles
- Audit log for all actions
- Scheduled tasks (cron jobs via UI)
- Backup/restore functionality
- Plugin system for extensions
- Mobile app (React Native)
- Dark/light theme toggle
- Internationalization (i18n)
- Advanced analytics with ML insights
- Integration with monitoring services (Sentry, DataDog)

---

## Dependencies

### Frontend
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.22.0",
  "@xterm/xterm": "^5.5.0",
  "socket.io-client": "^4.7.4",
  "zustand": "^4.5.0",
  "@tanstack/react-query": "^5.20.0",
  "axios": "^1.6.7",
  "recharts": "^2.12.0",
  "react-hook-form": "^7.50.0",
  "zod": "^3.22.4",
  "lucide-react": "^0.323.0",
  "tailwindcss": "^3.4.1",
  "vite": "^5.1.0"
}
```

### Backend
```json
{
  "express": "^4.21.1",
  "socket.io": "^4.7.4",
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^5.1.1",
  "cors": "^2.8.5",
  "express-rate-limit": "^7.1.5",
  "zod": "^3.22.4",
  "winston": "^3.11.0",
  "pm2": "^5.3.1"
}
```

---

## Risks & Mitigation

**Risk 1:** WebSocket connection drops
- **Mitigation:** Auto-reconnect with exponential backoff

**Risk 2:** High memory usage from log streaming
- **Mitigation:** Limit logs to 100 entries, implement pagination

**Risk 3:** Unauthorized access
- **Mitigation:** Strong authentication, rate limiting, HTTPS

**Risk 4:** Bot crashes during control actions
- **Mitigation:** Graceful error handling, status monitoring

**Risk 5:** CORS issues between frontend and backend
- **Mitigation:** Proper CORS configuration, environment variables

---

## Timeline Estimate

- **Phase 1:** Backend API (8-10 hours)
- **Phase 2:** Frontend UI (12-15 hours)
- **Phase 3:** Integration & Testing (4-6 hours)
- **Phase 4:** Deployment & Documentation (2-3 hours)

**Total:** 26-34 hours (~3-4 days full-time)

---

## Approval

**Status:** Pending approval  
**Approved by:** _____________  
**Date:** _____________

---

**Next Steps:**
1. Review and approve requirements
2. Create design.md with detailed architecture
3. Create tasks.md with implementation tasks
4. Begin implementation
