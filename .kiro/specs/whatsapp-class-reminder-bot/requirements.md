# Requirements Document

## Introduction

The Multi-Platform Class Reminder Bot is a comprehensive task and schedule management system designed for educational environments. The system provides automated reminders, AI-powered text formatting, and integration with Notion for seamless task management. The bot serves a primary class of 30-40 students with scalability for multiple classes within a grade level.

The system supports both Discord and WhatsApp as communication platforms, utilizing Discord.js for Discord integration and the Baileys framework for WhatsApp integration. The architecture includes a platform abstraction layer that enables unified business logic across both platforms. The system uses MongoDB for data persistence and AI services (Groq and Google Gemini) for intelligent text formatting and message generation.

## Glossary

- **Bot**: The Multi-Platform Class Reminder Bot system
- **Platform**: Communication platform (Discord or WhatsApp)
- **Discord_Client**: Discord.js client for Discord integration
- **WhatsApp_Client**: Baileys client for WhatsApp integration
- **Platform_Adapter**: Interface that abstracts platform-specific operations
- **Admin**: A user with elevated permissions (Ketua, Wakil, or Koordinator roles)
- **Ketua**: Admin role with full system access
- **Wakil**: Admin role with full system access
- **Koordinator**: Admin role with limited administrative privileges
- **Member**: A user with view-only permissions
- **Task**: An assignment or activity with a deadline
- **Jadwal**: Class schedule information
- **Piket**: Cleaning duty assignment
- **Pengumuman**: Special announcement or notice
- **Recap**: Automated summary message containing tasks, schedules, and announcements
- **Notion_Database**: External Notion database for task synchronization
- **Command**: A message starting with "/" (WhatsApp) or slash command (Discord) that triggers bot functionality
- **Groq_Service**: Primary AI service using Llama 3.1 70B model
- **Gemini_Service**: Backup AI service using Gemini 1.5 Flash model
- **Discord_Guild**: The target Discord server where the bot operates
- **Discord_Channel**: The target Discord channel for bot messages
- **WhatsApp_Group**: The target WhatsApp group where the bot operates
- **Session**: Authenticated connection state (WhatsApp or Discord)
- **Baileys**: Node.js library for WhatsApp Web API integration
- **Discord.js**: Node.js library for Discord API integration
- **MongoDB_Collection**: Database collection storing system data
- **Timezone**: WIB (Western Indonesian Time, UTC+7)
- **User_Identifier**: Platform-specific user ID (Discord user ID or WhatsApp phone number)

## Requirements

### Requirement 1: User Authentication and Role Management

**User Story:** As a system administrator, I want to manage user roles and permissions across both platforms, so that only authorized users can perform administrative actions.

#### Acceptance Criteria

1. WHEN the Bot starts, THE Bot SHALL load all admin and member data from MongoDB_Collection
2. WHEN a user sends a command, THE Bot SHALL verify the user's identifier (Discord user ID or WhatsApp number) against the stored user database
3. WHEN an admin command is received, THE Bot SHALL validate that the sender has Ketua, Wakil, or Koordinator role
4. WHEN a Koordinator attempts a restricted admin action, THE Bot SHALL reject the command and notify the user
5. THE Bot SHALL store admin records with nama, user_identifier (unique), platform, role, and created_at fields
6. THE Bot SHALL store member records with nama, user_identifier (unique), platform, kelas, is_active, and created_at fields
7. WHEN a duplicate user_identifier is added for the same platform, THE Bot SHALL reject the operation and return an error message
8. WHEN verifying permissions on Discord, THE Bot SHALL also check Discord role assignments
9. WHEN verifying permissions on WhatsApp, THE Bot SHALL use only database role assignments

### Requirement 2: Task Management

**User Story:** As an admin, I want to create and manage tasks with detailed properties, so that students can track their assignments effectively.

#### Acceptance Criteria

1. WHEN an admin executes /add_tugas command, THE Bot SHALL create a new task with judul, deskripsi, deadline, mata_pelajaran, tipe, prioritas, and status fields
2. WHEN a task is created, THE Bot SHALL automatically calculate prioritas based on deadline proximity
3. WHEN an admin executes /edit_tugas command, THE Bot SHALL update the specified field for the given task ID
4. WHEN an admin executes /hapus_tugas command, THE Bot SHALL remove the task from MongoDB_Collection
5. WHEN an admin executes /tandai_selesai command, THE Bot SHALL update the task status to "selesai"
6. WHEN a user executes /tugas command, THE Bot SHALL return all active tasks sorted by deadline
7. WHEN a user executes /tugas_hari_ini command, THE Bot SHALL return tasks with deadline matching the current date
8. WHEN a user executes /tugas_minggu_ini command, THE Bot SHALL return tasks with deadline within the next 7 days
9. THE Bot SHALL support task tipe values: individu, kelompok, and ujian
10. THE Bot SHALL support prioritas values: urgent, penting, and normal
11. WHEN a task deadline is within 24 hours, THE Bot SHALL automatically set prioritas to "urgent"
12. WHEN a task deadline is within 72 hours, THE Bot SHALL automatically set prioritas to "penting"

### Requirement 3: Schedule Management

**User Story:** As an admin, I want to manage class schedules, so that students can view their daily and weekly timetables.

#### Acceptance Criteria

1. WHEN an admin executes /add_jadwal command, THE Bot SHALL create a schedule entry with hari, jam_mulai, jam_selesai, mata_pelajaran, ruangan, and nama_guru fields
2. WHEN an admin executes /edit_jadwal command, THE Bot SHALL update the specified field for the given schedule ID
3. WHEN an admin executes /hapus_jadwal command, THE Bot SHALL mark the schedule as inactive
4. WHEN an admin executes /ganti_jadwal command, THE Bot SHALL create a special announcement for schedule changes
5. WHEN a user executes /jadwal or /jadwal_hari_ini command, THE Bot SHALL return schedules for the current day sorted by jam_mulai
6. WHEN a user executes /jadwal_besok command, THE Bot SHALL return schedules for the next day sorted by jam_mulai
7. WHEN a user executes /jadwal_minggu_ini command, THE Bot SHALL return all schedules for the current week organized by day
8. THE Bot SHALL support hari values: Senin, Selasa, Rabu, Kamis, Jumat, Sabtu

### Requirement 4: Piket Management

**User Story:** As an admin, I want to assign and manage cleaning duty schedules, so that students know when they are responsible for classroom maintenance.

#### Acceptance Criteria

1. WHEN an admin executes /set_piket command, THE Bot SHALL create or update piket assignment with hari, nama_siswa array, and nomor_wa array
2. WHEN an admin executes /edit_piket command, THE Bot SHALL update the piket assignment for the specified day
3. WHEN a user executes /piket command, THE Bot SHALL return piket assignments for the current day
4. WHEN a user executes /piket_minggu_ini command, THE Bot SHALL return all piket assignments for the current week
5. THE Bot SHALL store nama_siswa and nomor_wa as parallel arrays with matching indices
6. WHEN displaying piket assignments, THE Bot SHALL include WhatsApp mentions for assigned students

### Requirement 5: Announcement Management

**User Story:** As an admin, I want to create special announcements, so that important information reaches all students.

#### Acceptance Criteria

1. WHEN an admin executes /add_pengumuman command, THE Bot SHALL create an announcement with tanggal, judul, tipe, and keterangan fields
2. WHEN an admin executes /hapus_pengumuman command, THE Bot SHALL mark the announcement as inactive
3. THE Bot SHALL support announcement tipe values: acara, perubahan_jadwal, praktikum, and lainnya
4. WHEN an admin executes /broadcast command, THE Bot SHALL send the message to WhatsApp_Group
5. WHEN an admin executes /broadcast_urgent command, THE Bot SHALL send the message to WhatsApp_Group with urgent formatting
6. WHEN displaying announcements, THE Bot SHALL filter by is_active status and sort by tanggal

### Requirement 6: Automated Daily Reminder System

**User Story:** As a student, I want to receive daily reminders about tomorrow's schedule and tasks, so that I can prepare in advance.

#### Acceptance Criteria

1. WHEN the configured daily reminder time is reached, THE Bot SHALL generate and send a daily recap message
2. THE Bot SHALL configure daily reminder time as 17:00 in Timezone
3. THE daily recap SHALL include tomorrow's jadwal sorted by jam_mulai
4. THE daily recap SHALL include tasks with deadline matching tomorrow or within 48 hours
5. THE daily recap SHALL include piket assignments for tomorrow with WhatsApp mentions
6. THE daily recap SHALL include active pengumuman with tanggal matching tomorrow
7. WHEN no tasks are due tomorrow, THE Bot SHALL include a message indicating no pending tasks
8. WHEN no jadwal exists for tomorrow, THE Bot SHALL include a message indicating no scheduled classes

### Requirement 7: Automated Weekly Reminder System

**User Story:** As a student, I want to receive weekly summaries every Friday, so that I can plan for the upcoming week.

#### Acceptance Criteria

1. WHEN the configured weekly reminder time is reached on the configured day, THE Bot SHALL generate and send a weekly recap message
2. THE Bot SHALL configure weekly reminder day as Friday and time as 20:00 in Timezone
3. THE weekly recap SHALL include all tasks for the next 7 days categorized by prioritas
4. THE weekly recap SHALL include special announcements with tanggal within the next 7 days
5. THE weekly recap SHALL include summary statistics showing total tasks by tipe
6. THE weekly recap SHALL include summary statistics showing total tasks by prioritas
7. WHEN no tasks exist for the next week, THE Bot SHALL include a message indicating no pending tasks

### Requirement 8: AI-Powered Text Formatting

**User Story:** As a user, I want task descriptions and recap messages to be clear and engaging, so that information is easy to understand.

#### Acceptance Criteria

1. WHEN a task is created with deskripsi, THE Bot SHALL send the text to Groq_Service for rewriting
2. WHEN Groq_Service fails or times out, THE Bot SHALL fallback to Gemini_Service
3. WHEN both AI services fail, THE Bot SHALL use the original text without modification
4. WHEN generating daily recap, THE Bot SHALL use Groq_Service to format the message with emojis and structure
5. WHEN generating weekly recap, THE Bot SHALL use Groq_Service to format the message with emojis and structure
6. THE Bot SHALL log all AI service requests with success or failure status
7. THE Bot SHALL implement a timeout of 10 seconds for AI service requests

### Requirement 9: Notion Integration

**User Story:** As an admin, I want to synchronize tasks with Notion, so that I can manage tasks across multiple platforms.

#### Acceptance Criteria

1. WHEN an admin executes /connect_notion command, THE Bot SHALL store the Notion database_id and api_key in bot_config collection
2. WHEN an admin executes /sync_notion command, THE Bot SHALL fetch all tasks from Notion_Database
3. WHEN syncing from Notion, THE Bot SHALL create new tasks for entries not present in MongoDB_Collection
4. WHEN syncing from Notion, THE Bot SHALL update existing tasks based on notion_id matching
5. WHEN a task is marked complete in the Bot, THE Bot SHALL update the corresponding Notion_Database entry status
6. WHEN a task is created via Bot command, THE Bot SHALL create a corresponding entry in Notion_Database
7. WHEN Notion API fails, THE Bot SHALL log the error and continue operation without synchronization
8. THE Bot SHALL store notion_id in task records for bidirectional synchronization

### Requirement 10: Platform Connection and Session Management

**User Story:** As a system operator, I want the bot to maintain stable connections to both Discord and WhatsApp, so that it can reliably send and receive messages.

#### Acceptance Criteria

1. WHEN the Bot starts without existing WhatsApp Session, THE Bot SHALL generate a QR code for authentication
2. WHEN the WhatsApp QR code is scanned, THE Bot SHALL establish connection and save Session data
3. WHEN the Bot starts with existing WhatsApp Session, THE Bot SHALL restore the connection without requiring QR code
4. WHEN WhatsApp connection is lost, THE Bot SHALL attempt to reconnect automatically
5. WHEN WhatsApp reconnection fails after 5 attempts, THE Bot SHALL generate a new QR code
6. THE Bot SHALL store WhatsApp Session data in the auth_info directory
7. WHEN the Bot starts in Discord mode, THE Bot SHALL authenticate using bot token from environment
8. WHEN Discord_Client connects, THE Bot SHALL log guild and channel information
9. WHEN Discord connection is lost, THE Bot SHALL attempt to reconnect automatically
10. THE Bot SHALL log all connection state changes for both platforms

### Requirement 11: Command Parsing and Routing

**User Story:** As a user, I want to interact with the bot using simple commands, so that I can access features easily.

#### Acceptance Criteria

1. WHEN a message starts with "/", THE Bot SHALL parse it as a command
2. WHEN a command is parsed, THE Bot SHALL extract the command name and arguments
3. WHEN command arguments contain "|" delimiter, THE Bot SHALL split arguments by this delimiter
4. WHEN a command is received, THE Bot SHALL route it to the appropriate handler based on user role
5. WHEN an invalid command is received, THE Bot SHALL respond with an error message and suggest /help
6. WHEN /help or /bantuan command is received, THE Bot SHALL display available commands based on user role
7. WHEN /status command is received, THE Bot SHALL respond with bot uptime and system status
8. THE Bot SHALL trim whitespace from all command arguments before processing

### Requirement 12: Input Validation and Error Handling

**User Story:** As a developer, I want comprehensive input validation, so that the system handles errors gracefully.

#### Acceptance Criteria

1. WHEN a date argument is provided, THE Bot SHALL validate it matches YYYY-MM-DD format
2. WHEN a time argument is provided, THE Bot SHALL validate it matches HH:MM format
3. WHEN a required argument is missing, THE Bot SHALL respond with usage instructions for that command
4. WHEN an invalid task ID is provided, THE Bot SHALL respond with an error message
5. WHEN an invalid schedule ID is provided, THE Bot SHALL respond with an error message
6. WHEN a database operation fails, THE Bot SHALL log the error and respond with a user-friendly message
7. WHEN an unhandled exception occurs, THE Bot SHALL log the full error stack and continue operation
8. THE Bot SHALL sanitize all user inputs to prevent injection attacks

### Requirement 13: Logging and Monitoring

**User Story:** As a system administrator, I want comprehensive logging, so that I can monitor system health and debug issues.

#### Acceptance Criteria

1. WHEN any command is executed, THE Bot SHALL log the action, user_wa, details, status, and timestamp
2. WHEN a database operation is performed, THE Bot SHALL log the operation type and result
3. WHEN an AI service request is made, THE Bot SHALL log the service used, success status, and response time
4. WHEN an error occurs, THE Bot SHALL log the error message, stack trace, and context
5. THE Bot SHALL write logs to both console and log files in the logs directory
6. THE Bot SHALL rotate log files daily to prevent excessive file sizes
7. WHEN /status command is executed, THE Bot SHALL include recent error count in the response

### Requirement 14: Configuration Management

**User Story:** As a system administrator, I want to configure bot settings, so that I can customize behavior without code changes.

#### Acceptance Criteria

1. THE Bot SHALL load configuration from environment variables on startup
2. THE Bot SHALL store runtime configuration in bot_config MongoDB_Collection
3. THE Bot SHALL support configuration keys: group_id, daily_reminder_time, weekly_reminder_day, weekly_reminder_time, timezone
4. WHEN a configuration value is updated in bot_config, THE Bot SHALL apply the change without restart
5. THE Bot SHALL validate configuration values before applying them
6. WHEN an invalid configuration is provided, THE Bot SHALL reject the change and log an error
7. THE Bot SHALL provide default values for all configuration keys

### Requirement 15: Data Persistence and Backup

**User Story:** As a system administrator, I want reliable data storage, so that no information is lost during system failures.

#### Acceptance Criteria

1. THE Bot SHALL connect to MongoDB on startup with connection retry logic
2. WHEN MongoDB connection fails, THE Bot SHALL retry connection every 5 seconds up to 10 times
3. WHEN all connection attempts fail, THE Bot SHALL exit with an error code
4. THE Bot SHALL use MongoDB transactions for operations affecting multiple collections
5. WHEN a transaction fails, THE Bot SHALL rollback all changes and log the error
6. THE Bot SHALL create indexes on frequently queried fields: user_identifier, deadline, hari, tanggal
7. THE Bot SHALL validate data schema before inserting into MongoDB_Collection

### Requirement 16: Platform Abstraction Layer

**User Story:** As a developer, I want a unified interface for both Discord and WhatsApp, so that business logic remains platform-independent.

#### Acceptance Criteria

1. THE Bot SHALL implement a Platform_Adapter interface that abstracts platform-specific operations
2. THE Platform_Adapter SHALL provide methods for: sendMessage, sendMessageWithMentions, getUserIdentifier, formatMention
3. WHEN a message is sent, THE Bot SHALL use Platform_Adapter methods regardless of the underlying platform
4. WHEN a user identifier is needed, THE Bot SHALL use Platform_Adapter.getUserIdentifier to get platform-specific ID
5. THE Bot SHALL implement WhatsApp_Adapter that wraps Baileys client operations
6. THE Bot SHALL implement Discord_Adapter that wraps Discord.js client operations
7. WHEN formatting mentions, THE Bot SHALL use platform-specific mention syntax via Platform_Adapter

### Requirement 17: Discord Integration

**User Story:** As a user, I want to interact with the bot through Discord, so that I can use the platform I prefer.

#### Acceptance Criteria

1. WHEN the Bot starts in Discord mode, THE Bot SHALL initialize Discord_Client with bot token
2. WHEN Discord_Client connects, THE Bot SHALL log successful connection with guild information
3. WHEN a slash command is received, THE Bot SHALL parse it and route to appropriate handler
4. WHEN a text command starting with "/" is received, THE Bot SHALL parse it and route to appropriate handler
5. THE Bot SHALL register all slash commands with Discord API on startup
6. WHEN sending messages to Discord, THE Bot SHALL use Discord embeds for structured content
7. WHEN displaying task lists, THE Bot SHALL use Discord buttons for interactive actions
8. WHEN displaying options, THE Bot SHALL use Discord select menus for user selection
9. THE Bot SHALL support Discord role-based permissions mapped to Bot admin roles
10. WHEN a Discord user executes a command, THE Bot SHALL verify permissions using Discord roles

### Requirement 18: Multi-Platform User Management

**User Story:** As a system administrator, I want to manage users across both platforms, so that users can access the bot from their preferred platform.

#### Acceptance Criteria

1. THE Bot SHALL store user records with platform field indicating 'discord' or 'whatsapp'
2. THE Bot SHALL store user_identifier field containing platform-specific ID (Discord user ID or WhatsApp phone number)
3. WHEN a user is added, THE Bot SHALL validate user_identifier format based on platform
4. WHEN querying users, THE Bot SHALL filter by platform when needed
5. THE Bot SHALL support users having accounts on both platforms with different user_identifiers
6. WHEN a command is executed, THE Bot SHALL identify the user by platform and user_identifier combination

### Requirement 19: Multi-Platform Message Formatting

**User Story:** As a user, I want messages formatted appropriately for my platform, so that information is displayed optimally.

#### Acceptance Criteria

1. WHEN sending task lists to Discord, THE Bot SHALL format them as embeds with color coding by priority
2. WHEN sending task lists to WhatsApp, THE Bot SHALL format them as text with emojis
3. WHEN sending schedules to Discord, THE Bot SHALL use embed fields for structured display
4. WHEN sending schedules to WhatsApp, THE Bot SHALL use text formatting with line breaks
5. WHEN mentioning users on Discord, THE Bot SHALL use Discord mention syntax (<@user_id>)
6. WHEN mentioning users on WhatsApp, THE Bot SHALL use WhatsApp mention syntax (@phone_number)
7. WHEN sending announcements to Discord, THE Bot SHALL use embeds with announcement type icons
8. WHEN sending announcements to WhatsApp, THE Bot SHALL use text with emojis

### Requirement 20: Multi-Platform Configuration

**User Story:** As a system administrator, I want to configure platform-specific settings, so that the bot operates correctly on each platform.

#### Acceptance Criteria

1. THE Bot SHALL load Discord bot token from environment variables when Discord mode is enabled
2. THE Bot SHALL load Discord guild ID and channel ID from bot_config collection
3. THE Bot SHALL load WhatsApp group ID from bot_config collection when WhatsApp mode is enabled
4. THE Bot SHALL support running both platforms simultaneously
5. WHEN both platforms are enabled, THE Bot SHALL send reminders to both Discord and WhatsApp
6. THE Bot SHALL store platform-specific configuration with platform prefix (discord_*, whatsapp_*)
7. WHEN a platform is disabled, THE Bot SHALL skip initialization for that platform
