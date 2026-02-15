# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-15

### 🎉 Feature Update - Bug Fixes, Session Persistence & UI Improvements

### Added
- ✨ WhatsApp session persistence (no re-login after deploy)
- ✨ QR code interval control (45 seconds, prevents spam)
- ✨ Extended connection timeout (2min → 5min)
- ✨ Animated emoji support for bot status command
- ✨ Auto-update description in Task Monitor embed ("Auto-update every 2 hours")
- ✨ ERROR emoji for disconnected services in status command
- ✨ Comprehensive timezone handling with DateTimeHelper
- ✨ Session checker script (`npm run test:session`)
- ✨ Notion API v2025-09-03 support with data sources

### Changed
- 🔧 All date operations now use WIB (Asia/Jakarta) timezone consistently
- 🔧 Updated status command format with animated emojis and quote blocks
- 🔧 Improved date filtering accuracy across all services
- 🔧 Enhanced deadline validation with proper timezone handling
- 🔧 Notion service migrated to data sources API
- 🔧 Database ID format auto-corrected to UUID format

### Fixed
- 🐛 **CRITICAL**: Fixed `getTasksForToday()` bug that included tomorrow's tasks
  - Changed from `$lte: tomorrow 00:00` to `$lte: today 23:59:59.999`
  - Tasks now filtered correctly by date
- 🐛 **CRITICAL**: Fixed Notion sync failure with API v2025-09-03
  - Migrated from `databases.query()` to `dataSources.query()`
  - Auto-fetch data source ID from database
- 🐛 Fixed duplicate embed issue in pagination for `/tugas` commands
  - Removed double message send in pagination
  - Single embed with buttons now
- 🐛 Fixed Mongoose duplicate index warnings
  - Removed duplicate unique constraints
  - Clean logs without warnings
- 🐛 Fixed QR code spam (every 1s → every 45s)
  - Added interval control
  - Better user experience
- 🐛 Fixed timezone inconsistencies across 50+ locations in 13 files:
  - TaskService.ts (4 fixes)
  - ButtonInteractionHandler.ts (2 fixes)
  - AdminCommandHandler.ts (5 fixes)
  - NotionService.ts (1 fix)
  - AITaskParserService.ts (3 fixes)
  - ConfirmationService.ts (4 fixes)
  - ScheduleService.ts (2 fixes)
  - PiketService.ts (3 fixes)
  - AnnouncementService.ts (3 fixes)
  - ReminderScheduler.ts (4 fixes)
  - MessageTrackingService.ts (1 fix)
  - Task.ts (1 fix)
  - MemberCommandHandler.ts (4 fixes)

### Technical Details
- Replaced all `new Date()` with `DateTimeHelper.now()` for WIB consistency
- Used `DateTimeHelper.parseDate()` for parsing date strings
- Used `DateTimeHelper.toWIB()` for converting existing Date objects
- Fixed end-of-day calculations to use 23:59:59.999 instead of next day 00:00
- Implemented auto-format for Notion database IDs
- Added data source ID caching for Notion API

### Impact
- ✅ No more timezone confusion between UTC and WIB
- ✅ Accurate task filtering by date (today, tomorrow, this week)
- ✅ Correct deadline calculations and reminders
- ✅ Reliable Notion sync with latest API
- ✅ Improved UI with animated emojis and better formatting
- ✅ Session persistence across deployments
- ✅ Clean logs without warnings

### Migration Notes
For users upgrading from v1.0.0:
1. Update Notion database ID to UUID format (8-4-4-4-12) if needed
2. Ensure `NOTION_API_KEY` and `NOTION_DATABASE_ID` are set correctly
3. Setup Railway Volume at `/app/auth_info` for session persistence
4. First deployment will require QR code scan
5. Subsequent deployments will auto-connect

---

## [1.0.0] - 2026-02-11

### 🎉 Initial Production Release

### Added
- ✨ Multi-platform support (Discord & WhatsApp)
- ✨ Task management (CRUD operations)
- ✨ Schedule management
- ✨ Piket (cleaning duty) management
- ✨ Announcement system
- ✨ Daily and weekly reminders
- ✨ Notion integration for task sync
- ✨ AI-powered natural language task parsing
- ✨ Pagination for long task lists
- ✨ Task Monitor with auto-update
- ✨ Comprehensive logging system
- ✨ MongoDB database integration
- ✨ Admin and member command separation
- ✨ Confirmation flow for task creation
- ✨ Message tracking for auto-edit feature

### Features
- 📝 Task commands: `/tugas`, `/tugas hari ini`, `/tugas besok`, `/tugas minggu ini`
- 📅 Schedule commands: `/jadwal`, `/jadwal hari ini`, `/jadwal besok`, `/jadwal minggu ini`
- 🧹 Piket commands: `/piket`, `/piket hari ini`, `/piket besok`, `/piket minggu ini`
- 📢 Announcement commands: `/pengumuman`
- 🤖 Status command: `/status`
- 👨‍💼 Admin commands: `/tambah tugas`, `/edit tugas`, `/hapus tugas`, etc.
- 🔄 Notion sync: Automatic bidirectional sync every 2 hours
- ⏰ Reminders: Daily (Mon-Thu 16:00), Weekly (Fri 16:00), Monday (Sun 16:00)

### Technical Stack
- TypeScript
- Discord.js v14
- WhatsApp Web.js
- MongoDB with Mongoose
- Node-cron for scheduling
- OpenAI API for AI features
- Notion API for integration

---

## Version Numbering

- **Major (X.0.0)**: Breaking changes, major features, significant refactoring
- **Minor (0.X.0)**: New features, non-breaking changes, bug fixes
- **Patch (0.0.X)**: Small bug fixes, minor improvements

[1.1.0]: https://github.com/yourusername/multi-platform-class-reminder-bot/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/yourusername/multi-platform-class-reminder-bot/releases/tag/v1.0.0
