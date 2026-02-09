# Implementation Plan: Multi-Platform Class Reminder Bot

## Overview

This implementation plan breaks down the Multi-Platform Class Reminder Bot into incremental, testable steps. The approach follows a bottom-up strategy, starting with core infrastructure (database, configuration), then building the platform abstraction layer, implementing platform-specific adapters (Discord and WhatsApp), building business logic services, command handlers, and finally integrating everything together. Each major component includes property-based tests to validate correctness properties from the design document.

The bot supports both Discord (using Discord.js) and WhatsApp (using Baileys) through a unified platform abstraction layer that keeps business logic platform-independent.

## Tasks

- [x] 1. Project setup and core infrastructure
  - Initialize Node.js project with TypeScript
  - Install dependencies: @whiskeysockets/baileys, discord.js, mongodb, node-cron, fast-check, jest, dotenv
  - Create project directory structure (src/config, src/models, src/services, src/handlers, src/utils, src/templates, src/adapters)
  - Set up TypeScript configuration with strict mode
  - Create .env.example with all required environment variables (Discord and WhatsApp)
  - Set up Jest configuration for unit and property tests
  - _Requirements: 14.1, 15.1, 20.1, 20.3_

- [x] 2. Database configuration and models
  - [x] 2.1 Implement MongoDB connection with retry logic
    - Create database.js with connection function
    - Implement retry logic: 10 attempts, 5-second intervals
    - Add connection event handlers for monitoring
    - _Requirements: 15.1, 15.2, 15.3_
  
  - [x] 2.2 Create Mongoose schemas for all collections
    - Define Admin schema with role enum, platform field, and unique compound index on user_identifier + platform
    - Define Member schema with platform field, is_active flag, and unique compound index on user_identifier + platform
    - Define Task schema with prioritas calculation
    - Define Jadwal schema with hari enum
    - Define Piket schema with parallel arrays
    - Define Pengumuman schema with tipe enum
    - Define BotConfig schema with key-value structure (include Discord and WhatsApp config keys)
    - Define Log schema with action tracking
    - _Requirements: 1.5, 1.6, 2.1, 3.1, 4.1, 5.1, 14.2, 13.1, 18.1, 18.2, 20.6_
  
  - [x] 2.3 Create database indexes
    - Add unique compound index on admins (user_identifier, platform)
    - Add unique compound index on members (user_identifier, platform)
    - Add index on tasks.deadline and tasks.status
    - Add index on jadwal_pelajaran.hari
    - Add unique index on jadwal_piket.hari
    - Add index on pengumuman_khusus.tanggal
    - Add unique index on bot_config.key
    - Add index on logs.created_at
    - _Requirements: 15.6, 18.1, 18.2_
  
  - [ ]* 2.4 Write property tests for data models
    - **Property 4: Admin record structure completeness**
    - **Property 5: Member record structure completeness**
    - **Property 7: Task record structure completeness**
    - **Property 17: Schedule record structure completeness**
    - **Property 25: Piket record structure completeness**
    - **Property 31: Announcement record structure completeness**
    - **Validates: Requirements 1.5, 1.6, 2.1, 3.1, 4.1, 5.1**

- [ ] 3. Utility layer implementation
  - [x] 3.1 Implement Validator utility class
    - Create isValidDate function with YYYY-MM-DD regex
    - Create isValidTime function with HH:MM regex
    - Create isValidPhoneNumber function
    - Create sanitizeInput function to prevent injection
    - Create enum validators: isValidTaskType, isValidPriority, isValidDay, isValidAnnouncementType
    - _Requirements: 12.1, 12.2, 12.8, 2.9, 2.10, 3.8, 5.3_
  
  - [ ]* 3.2 Write property tests for validators
    - **Property 64: Date format validation**
    - **Property 65: Time format validation**
    - **Property 71: Input sanitization**
    - **Property 15: Task type validation**
    - **Property 16: Priority validation**
    - **Property 24: Day name validation**
    - **Property 33: Announcement type validation**
    - **Validates: Requirements 12.1, 12.2, 12.8, 2.9, 2.10, 3.8, 5.3**
  
  - [x] 3.3 Implement Formatter utility class
    - Create formatTaskList function with emoji support
    - Create formatSchedule function with time formatting
    - Create formatPiket function with mention tags
    - Create formatAnnouncement function with type icons
    - Create formatDate function for Indonesian locale
    - Create addEmojis helper function
    - _Requirements: 4.6_
  
  - [ ]* 3.4 Write unit tests for formatters
    - Test task list formatting with various task types
    - Test schedule formatting with time ranges
    - Test piket formatting with multiple students
    - Test announcement formatting with different types
    - Test date formatting edge cases
  
  - [x] 3.5 Implement Logger utility class
    - Create Winston logger with console and file transports
    - Implement info, error, warn, debug methods
    - Implement logCommand function with structured data
    - Implement logAIRequest function with latency tracking
    - Implement logDBOperation function
    - Add daily log rotation
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_
  
  - [ ]* 3.6 Write property tests for logging
    - **Property 72: Command execution logging**
    - **Property 73: Database operation logging**
    - **Property 74: AI service request logging**
    - **Property 75: Error logging completeness**
    - **Property 76: Dual logging output**
    - **Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5**

- [ ] 3.7. Platform abstraction layer implementation
  - [x] 3.7.1 Create PlatformAdapter interface
    - Define interface with methods: getPlatformName, sendMessage, sendMessageWithMentions, sendTaskList, sendSchedule, sendAnnouncement, getUserIdentifier, formatMention, hasAdminRole
    - Create MessageContext interface for platform-agnostic message handling
    - _Requirements: 16.1, 16.2_
  
  - [ ]* 3.7.2 Write property tests for platform adapter interface
    - **Property 87: Platform adapter interface consistency**
    - **Validates: Requirements 16.1**
  
  - [x] 3.7.3 Implement WhatsAppAdapter
    - Create WhatsAppAdapter class implementing PlatformAdapter
    - Implement sendMessage using Baileys client
    - Implement sendMessageWithMentions with WhatsApp mention syntax
    - Implement sendTaskList with text formatting and emojis
    - Implement sendSchedule with text formatting
    - Implement sendAnnouncement with text formatting and emojis
    - Implement getUserIdentifier to extract phone number
    - Implement formatMention for WhatsApp (@phoneNumber)
    - Implement hasAdminRole using database lookup only
    - _Requirements: 16.5, 19.2, 19.4, 19.6_
  
  - [ ]* 3.7.4 Write property tests for WhatsAppAdapter
    - **Property 84: Platform adapter message sending**
    - **Property 85: Platform-specific user identifier extraction**
    - **Property 86: Platform-specific mention formatting**
    - **Property 102: WhatsApp task list text formatting**
    - **Property 104: WhatsApp schedule text formatting**
    - **Property 106: WhatsApp mention syntax**
    - **Validates: Requirements 16.2, 16.4, 16.7, 19.2, 19.4, 19.6**
  
  - [x] 3.7.5 Implement DiscordAdapter
    - Create DiscordAdapter class implementing PlatformAdapter
    - Implement sendMessage using Discord embeds
    - Implement sendMessageWithMentions with Discord mention syntax (<@userId>)
    - Implement sendTaskList with embeds, color coding by priority, and buttons
    - Implement sendSchedule with embed fields
    - Implement sendAnnouncement with embeds and icons
    - Implement getUserIdentifier to extract Discord user ID
    - Implement formatMention for Discord (<@userId>)
    - Implement hasAdminRole checking Discord role assignments
    - Implement registerSlashCommands for Discord API
    - Implement handleSlashCommand for interaction handling
    - _Requirements: 16.6, 17.6, 17.7, 17.8, 17.9, 19.1, 19.3, 19.5_
  
  - [ ]* 3.7.6 Write property tests for DiscordAdapter
    - **Property 84: Platform adapter message sending**
    - **Property 85: Platform-specific user identifier extraction**
    - **Property 86: Platform-specific mention formatting**
    - **Property 92: Discord embed formatting for tasks**
    - **Property 93: Discord button interaction**
    - **Property 94: Discord select menu interaction**
    - **Property 95: Discord role-based permissions**
    - **Property 101: Discord task list embed formatting**
    - **Property 103: Discord schedule embed formatting**
    - **Property 105: Discord mention syntax**
    - **Validates: Requirements 16.2, 16.4, 16.7, 17.6, 17.7, 17.8, 17.9, 19.1, 19.3, 19.5**

- [ ] 3.8. Platform client implementations
  - [x] 3.8.1 Implement DiscordClient class
    - Set up Discord.js client with intents
    - Create connect function with bot token authentication
    - Implement sendMessage, sendEmbed, sendMessageWithComponents
    - Implement onMessage and onInteraction event handlers
    - Implement registerCommands for slash command registration
    - Implement getGuildMember and userHasRole for permission checking
    - Add connection state logging
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.9, 17.10_
  
  - [ ]* 3.8.2 Write property tests for DiscordClient
    - **Property 88: Discord client connection**
    - **Property 89: Discord slash command registration**
    - **Property 90: Discord slash command parsing**
    - **Property 91: Discord text command parsing**
    - **Validates: Requirements 17.1, 17.2, 17.3, 17.4, 17.5**
  
  - [ ]* 3.8.3 Write unit tests for Discord error handling
    - Test invalid bot token handling
    - Test missing permissions handling
    - Test guild not found handling
    - Test channel not found handling
    - Test rate limiting handling

- [ ] 4. Permission and authentication system
  - [x] 4.1 Implement PermissionService class
    - Create loadUsers function to cache admins and members
    - Create getUserRole function with database lookup
    - Create isAdmin function
    - Create canExecuteCommand function with permission matrix
    - Define permission matrix for all commands
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ]* 4.2 Write property tests for permissions
    - **Property 1: User verification on command execution**
    - **Property 2: Admin command authorization**
    - **Property 3: Koordinator role restrictions**
    - **Property 6: Phone number uniqueness constraint**
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.7**
  
  - [ ]* 4.3 Write unit tests for permission edge cases
    - Test unknown user handling
    - Test inactive member handling
    - Test Koordinator restricted commands
    - Test permission matrix completeness

- [ ] 5. Task service implementation
  - [x] 5.1 Implement TaskService class core methods
    - Create createTask function with schema validation
    - Implement calculatePriority function based on deadline
    - Create updateTask function with field isolation
    - Create deleteTask function
    - Create markComplete function
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.11, 2.12_
  
  - [ ]* 5.2 Write property tests for task operations
    - **Property 8: Automatic priority calculation**
    - **Property 9: Task field update isolation**
    - **Property 10: Task deletion completeness**
    - **Property 11: Task completion status update**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.11, 2.12**
  
  - [x] 5.3 Implement task query methods
    - Create getTasks function with filter support
    - Create getTasksForToday function
    - Create getTasksForWeek function
    - Add sorting by deadline
    - Add status filtering
    - _Requirements: 2.6, 2.7, 2.8_
  
  - [ ]* 5.4 Write property tests for task queries
    - **Property 12: Active task query filtering and sorting**
    - **Property 13: Today's task filtering**
    - **Property 14: Weekly task filtering**
    - **Validates: Requirements 2.6, 2.7, 2.8**

- [ ] 6. Schedule service implementation
  - [x] 6.1 Implement ScheduleService class
    - Create createSchedule function with validation
    - Create updateSchedule function with field isolation
    - Create deleteSchedule function (soft delete)
    - Create getSchedulesByDay function with sorting
    - Create getSchedulesForWeek function with grouping
    - Create announceScheduleChange function
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
  
  - [ ]* 6.2 Write property tests for schedule operations
    - **Property 18: Schedule field update isolation**
    - **Property 19: Schedule soft deletion**
    - **Property 20: Schedule change announcement creation**
    - **Property 21: Daily schedule query filtering and sorting**
    - **Property 22: Tomorrow's schedule query filtering and sorting**
    - **Property 23: Weekly schedule query filtering and grouping**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

- [ ] 7. Piket and announcement services
  - [x] 7.1 Implement PiketService class
    - Create setPiket function with upsert logic
    - Create updatePiket function
    - Create getPiketByDay function
    - Create getPiketForWeek function
    - Create formatPiketMessage function with mentions
    - Add array parallelism validation
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  
  - [ ]* 7.2 Write property tests for piket operations
    - **Property 26: Piket assignment update**
    - **Property 27: Daily piket query filtering**
    - **Property 28: Weekly piket query filtering**
    - **Property 29: Piket array parallelism invariant**
    - **Property 30: Piket mention formatting**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5, 4.6**
  
  - [x] 7.3 Implement AnnouncementService class
    - Create createAnnouncement function with validation
    - Create deleteAnnouncement function (soft delete)
    - Create getAnnouncementsByDateRange function
    - Add filtering by is_active and sorting by tanggal
    - _Requirements: 5.1, 5.2, 5.6_
  
  - [ ]* 7.4 Write property tests for announcements
    - **Property 32: Announcement soft deletion**
    - **Property 34: Announcement query filtering and sorting**
    - **Validates: Requirements 5.2, 5.6**

- [ ] 8. AI service integration
  - [x] 8.1 Implement AIService class with Groq integration
    - Set up Groq API client with API key from env
    - Create rewriteText function with 10-second timeout
    - Create formatRecap function for daily/weekly recaps
    - Add error handling and logging
    - _Requirements: 8.1, 8.4, 8.5, 8.6, 8.7_
  
  - [x] 8.2 Add Gemini fallback mechanism
    - Set up Gemini API client with API key from env
    - Implement fallback logic in rewriteText
    - Implement fallback logic in formatRecap
    - Add graceful degradation to original text
    - _Requirements: 8.2, 8.3_
  
  - [ ]* 8.3 Write property tests for AI service
    - **Property 43: AI service invocation for task description**
    - **Property 44: AI service fallback mechanism**
    - **Property 45: AI service failure graceful degradation**
    - **Property 48: AI service request logging**
    - **Property 49: AI service timeout enforcement**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.6, 8.7**
  
  - [ ]* 8.4 Write unit tests for AI service edge cases
    - Test timeout handling
    - Test network error handling
    - Test invalid API key handling
    - Test rate limit handling

- [ ] 9. Notion integration service
  - [ ] 9.1 Implement NotionService class
    - Set up Notion client with @notionhq/client
    - Create connect function to validate credentials
    - Create fetchTasks function to query database
    - Create createTask function to add entries
    - Create updateTaskStatus function
    - Add error handling for API failures
    - _Requirements: 9.1, 9.2, 9.5, 9.6, 9.7_
  
  - [ ] 9.2 Implement bidirectional sync logic
    - Create syncFromNotion function with upsert logic
    - Add notion_id matching for updates
    - Create syncToNotion function for new tasks
    - Add conflict resolution strategy
    - _Requirements: 9.3, 9.4, 9.8_
  
  - [ ]* 9.3 Write property tests for Notion sync
    - **Property 50: Notion configuration storage**
    - **Property 51: Notion sync task creation**
    - **Property 52: Notion sync task update**
    - **Property 53: Notion bidirectional sync on completion**
    - **Property 54: Notion bidirectional sync on creation**
    - **Property 55: Notion failure graceful degradation**
    - **Property 56: Notion ID storage for sync**
    - **Validates: Requirements 9.1, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8**

- [ ] 10. Command parsing and routing
  - [x] 10.1 Implement CommandParser class
    - Create parse function to extract command and args
    - Implement "/" prefix detection
    - Implement "|" delimiter splitting
    - Add whitespace trimming
    - Add validation for command format
    - _Requirements: 11.1, 11.2, 11.3, 11.8_
  
  - [ ]* 10.2 Write property tests for command parsing
    - **Property 57: Command recognition**
    - **Property 58: Command parsing extraction**
    - **Property 59: Command argument delimiter splitting**
    - **Property 63: Command argument whitespace normalization**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.8**
  
  - [x] 10.3 Implement CommandRouter class
    - Create route function with permission checking
    - Implement handler delegation based on role
    - Add error handling for invalid commands
    - Add error handling for missing arguments
    - _Requirements: 11.4, 11.5, 12.3_
  
  - [ ]* 10.4 Write property tests for command routing
    - **Property 60: Command routing by role**
    - **Property 61: Invalid command error handling**
    - **Property 66: Missing argument error handling**
    - **Validates: Requirements 11.4, 11.5, 12.3**

- [ ] 11. Admin command handlers
  - [x] 11.1 Implement task management commands
    - Create handleAddTugas with validation and AI enhancement
    - Create handleEditTugas with field update
    - Create handleHapusTugas with deletion
    - Create handleTandaiSelesai with status update
    - Add Notion sync integration
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 9.6_
  
  - [ ]* 11.2 Write property tests for task commands
    - **Property 67: Invalid task ID error handling**
    - **Property 69: Database failure error handling**
    - **Validates: Requirements 12.4, 12.6**
  
  - [x] 11.3 Implement schedule management commands
    - Create handleAddJadwal with validation
    - Create handleEditJadwal with field update
    - Create handleHapusJadwal with soft delete
    - Create handleGantiJadwal with announcement creation
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 11.4 Write property tests for schedule commands
    - **Property 68: Invalid schedule ID error handling**
    - **Validates: Requirements 12.5**
  
  - [x] 11.5 Implement piket and announcement commands
    - Create handleSetPiket with array validation
    - Create handleEditPiket with update logic
    - Create handleAddPengumuman with validation
    - Create handleHapusPengumuman with soft delete
    - Create handleBroadcast for normal messages
    - Create handleBroadcastUrgent with formatting
    - _Requirements: 4.1, 4.2, 5.1, 5.2, 5.4, 5.5_
  
  - [ ] 11.6 Implement Notion sync commands
    - Create handleConnectNotion with credential storage
    - Create handleSyncNotion with manual sync trigger
    - Add validation for database ID and API key
    - _Requirements: 9.1, 9.2_

- [ ] 12. Member command handlers
  - [x] 12.1 Implement query commands
    - Create handleTugas for all active tasks
    - Create handleTugasHariIni for today's tasks
    - Create handleTugasMingguIni for weekly tasks
    - Create handleJadwal for today's schedule
    - Create handleJadwalBesok for tomorrow's schedule
    - Create handleJadwalMingguIni for weekly schedule
    - Create handlePiket for today's piket
    - Create handlePiketMingguIni for weekly piket
    - _Requirements: 2.6, 2.7, 2.8, 3.5, 3.6, 3.7, 4.3, 4.4_
  
  - [x] 12.2 Implement utility commands
    - Create handleHelp with role-based command list
    - Create handleStatus with uptime and error count
    - Add command usage examples
    - _Requirements: 11.6, 11.7_
  
  - [ ]* 12.3 Write property tests for member commands
    - **Property 62: Role-based help display**
    - **Validates: Requirements 11.6**

- [ ] 13. Checkpoint - Ensure all tests pass
  - Run all unit tests and verify passing
  - Run all property tests with 100 iterations
  - Fix any failing tests
  - Ask the user if questions arise

- [ ] 14. Reminder scheduler implementation
  - [x] 14.1 Implement ReminderScheduler class
    - Set up node-cron with timezone support
    - Create initialize function to set up cron jobs
    - Create stop function to clean up jobs
    - Load schedule config from bot_config collection
    - _Requirements: 6.1, 6.2, 7.1, 7.2_
  
  - [x] 14.2 Implement daily recap generation
    - Create buildDailyRecap function
    - Query tomorrow's schedules, tasks, piket, announcements
    - Format with AI service
    - Handle empty results with appropriate messages
    - Add WhatsApp mentions for piket
    - _Requirements: 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_
  
  - [ ]* 14.3 Write property tests for daily recap
    - **Property 35: Daily recap schedule inclusion**
    - **Property 36: Daily recap task inclusion**
    - **Property 37: Daily recap piket inclusion with mentions**
    - **Property 38: Daily recap announcement inclusion**
    - **Validates: Requirements 6.3, 6.4, 6.5, 6.6**
  
  - [x] 14.4 Implement weekly recap generation
    - Create buildWeeklyRecap function
    - Query next week's tasks and announcements
    - Calculate statistics by tipe and prioritas
    - Format with AI service
    - Handle empty results with appropriate messages
    - _Requirements: 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [ ]* 14.5 Write property tests for weekly recap
    - **Property 39: Weekly recap task categorization**
    - **Property 40: Weekly recap announcement inclusion**
    - **Property 41: Weekly recap task statistics by type**
    - **Property 42: Weekly recap task statistics by priority**
    - **Validates: Requirements 7.3, 7.4, 7.5, 7.6**
  
  - [x] 14.6 Implement sendDailyRecap and sendWeeklyRecap
    - Create sendDailyRecap function with error handling
    - Create sendWeeklyRecap function with error handling
    - Add retry logic for message send failures
    - Log all recap generations
    - _Requirements: 6.1, 7.1_

- [ ] 15. WhatsApp integration with Baileys
  - [x] 15.1 Implement BaileysClient class
    - Set up Baileys with auth state management
    - Create connect function with QR code generation
    - Implement session save and load functions
    - Add connection state event handlers
    - _Requirements: 10.1, 10.2, 10.3, 10.6_
  
  - [ ] 15.2 Implement reconnection logic
    - Add automatic reconnection on connection loss
    - Implement exponential backoff (1s, 2s, 4s, 8s, 16s)
    - Generate new QR code after 5 failed attempts
    - Log all connection state changes
    - _Requirements: 10.4, 10.5, 10.7_
  
  - [ ]* 15.3 Write property tests for connection logging
    - **Property 77: Connection state change logging**
    - **Validates: Requirements 10.7**
  
  - [ ] 15.4 Implement message handling
    - Create onMessage handler to receive messages
    - Create sendMessage function for text messages
    - Create sendMessageWithMentions function for piket
    - Add rate limiting (1-second delay between messages)
    - Filter messages to only process group messages
    - _Requirements: 4.6_

- [ ] 16. Main bot integration and wiring
  - [x] 16.1 Create bot.js main entry point
    - Initialize database connection
    - Load configuration from environment and database
    - Initialize all services (Task, Schedule, Piket, Announcement, AI, Notion)
    - Initialize permission service and load users
    - Initialize command parser and router
    - Initialize admin and member command handlers
    - _Requirements: 1.1, 14.1_
  
  - [ ] 16.2 Wire WhatsApp client with command handlers
    - Initialize Baileys client
    - Connect onMessage handler to command router
    - Add message filtering for commands only
    - Add error handling for message processing
    - _Requirements: 11.1_
  
  - [ ] 16.3 Initialize and start reminder scheduler
    - Create ReminderScheduler instance with all services
    - Pass WhatsApp client for message sending
    - Call initialize to start cron jobs
    - Add graceful shutdown handler
    - _Requirements: 6.1, 7.1_
  
  - [ ]* 16.4 Write integration tests
    - Test end-to-end command execution flow
    - Test scheduled reminder generation
    - Test AI service fallback chain
    - Test Notion sync flow
    - Test error recovery scenarios

- [ ] 17. Error handling and resilience
  - [ ] 17.1 Implement global error handlers
    - Add process.on('uncaughtException') handler
    - Add process.on('unhandledRejection') handler
    - Log all unhandled errors with full context
    - Ensure bot continues operation after errors
    - _Requirements: 12.7_
  
  - [ ]* 17.2 Write property tests for error handling
    - **Property 70: Unhandled exception recovery**
    - **Validates: Requirements 12.7**
  
  - [ ] 17.3 Add transaction support for multi-collection operations
    - Wrap task creation + Notion sync in transaction
    - Wrap schedule change + announcement in transaction
    - Add rollback on failure
    - _Requirements: 15.4, 15.5_
  
  - [ ]* 17.4 Write property tests for transactions
    - **Property 81: Multi-collection transaction usage**
    - **Property 82: Transaction rollback on failure**
    - **Validates: Requirements 15.4, 15.5**

- [ ] 18. Configuration and environment setup
  - [ ] 18.1 Create comprehensive .env.example
    - Add MongoDB connection string
    - Add WhatsApp group ID
    - Add Groq API key and model
    - Add Gemini API key and model
    - Add Notion credentials (optional)
    - Add timezone and reminder times
    - Add log level configuration
    - _Requirements: 14.1_
  
  - [ ] 18.2 Implement configuration management
    - Create config loader from environment variables
    - Create default bot_config entries in database
    - Implement hot reload for bot_config changes
    - Add configuration validation
    - _Requirements: 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_
  
  - [ ]* 18.3 Write property tests for configuration
    - **Property 78: Configuration storage**
    - **Property 79: Configuration validation**
    - **Property 80: Invalid configuration rejection**
    - **Validates: Requirements 14.2, 14.5, 14.6**

- [ ] 19. Schema validation and data integrity
  - [ ] 19.1 Add Mongoose schema validation
    - Add required field validators
    - Add enum validators for tipe, prioritas, hari, role
    - Add custom validators for date/time formats
    - Add pre-save hooks for data normalization
    - _Requirements: 15.7_
  
  - [ ]* 19.2 Write property tests for schema validation
    - **Property 83: Schema validation before insertion**
    - **Validates: Requirements 15.7**
  
  - [ ]* 19.3 Write unit tests for validation edge cases
    - Test invalid enum values
    - Test missing required fields
    - Test invalid date/time formats
    - Test array length mismatches for piket

- [ ] 20. Documentation and deployment preparation
  - [ ] 20.1 Create comprehensive README.md
    - Add project overview and features
    - Add installation instructions
    - Add configuration guide
    - Add command reference for admins and members
    - Add troubleshooting section
    - Add architecture diagram
  
  - [ ] 20.2 Create COMMANDS.md reference
    - Document all admin commands with examples
    - Document all member commands with examples
    - Add command syntax and argument formats
    - Add permission requirements for each command
  
  - [ ] 20.3 Add deployment scripts
    - Create start script with PM2 configuration
    - Create backup script for MongoDB
    - Create log cleanup script
    - Add health check endpoint (optional)
  
  - [ ] 20.4 Create Docker configuration (optional)
    - Create Dockerfile for Node.js application
    - Create docker-compose.yml with MongoDB
    - Add volume mounts for auth_info and logs
    - Document Docker deployment process

- [ ] 21. Final checkpoint - Complete testing and validation
  - Run full test suite (unit + property + integration)
  - Verify all 83 correctness properties are tested
  - Test bot with real WhatsApp connection
  - Verify all commands work as expected
  - Test reminder scheduling with mock time
  - Verify AI service fallback works
  - Test Notion sync if configured
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each property test should run minimum 100 iterations
- All property tests must reference their design document property number
- Integration tests should use mocked external services (WhatsApp, AI, Notion)
- Database tests should use MongoDB in-memory server for isolation
- Focus on incremental progress - each task should build on previous work
- Ensure no orphaned code - all components should be integrated by the end
