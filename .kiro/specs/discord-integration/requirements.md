# Requirements Document

## Introduction

The Discord Integration extends the existing WhatsApp Class Reminder Bot to support Discord as an additional communication platform. The system will operate as a multi-platform bot that runs both WhatsApp and Discord clients simultaneously, sharing the same business logic, database, and services. This integration enables educational institutions to reach students on their preferred platform while maintaining a unified task and schedule management system.

The Discord integration leverages discord.js v14 for Discord API interaction, implements an adapter pattern for platform abstraction, and reuses all existing services (TaskService, ScheduleService, PiketService, etc.) without modification. The system supports Discord-specific features including slash commands, embeds for formatted messages, role-based permissions, and mentions for notifications.

## Glossary

- **Discord_Client**: The Discord bot client using discord.js v14
- **WhatsApp_Client**: The existing WhatsApp bot client using Baileys
- **Platform_Adapter**: Abstraction layer that converts platform-specific messages to unified format
- **Unified_Message**: Platform-agnostic message format used by business logic layer
- **Slash_Command**: Discord's native command format starting with "/" (e.g., /tugas)
- **Discord_Embed**: Rich message format with title, description, fields, and colors
- **Discord_Role**: Permission group in Discord server (e.g., @Ketua, @Member)
- **Discord_Channel**: Text channel where bot sends messages
- **Discord_Guild**: Discord server where the bot operates
- **Discord_Mention**: User reference in Discord format (<@user_id>)
- **Platform_Field**: Database field indicating which platform was used (discord or whatsapp)
- **Bot_Manager**: Orchestrator that initializes and manages both platform clients
- **Command_Context**: Unified context object containing sender info, platform, and message data
- **Response_Formatter**: Component that formats responses appropriately for each platform
- **Discord_Permission**: Discord's permission system for channels and roles
- **Application_Command**: Discord's registered slash command definition

## Requirements

### Requirement 1: Discord Client Initialization and Connection

**User Story:** As a system operator, I want the bot to connect to Discord, so that it can send and receive messages on the Discord platform.

#### Acceptance Criteria

1. WHEN the Bot starts, THE Bot SHALL initialize Discord_Client with the provided bot token
2. WHEN Discord_Client connects successfully, THE Bot SHALL log the connection status and bot username
3. WHEN Discord_Client fails to connect, THE Bot SHALL log the error and retry connection after 5 seconds
4. WHEN connection retry fails after 5 attempts, THE Bot SHALL exit with an error code
5. THE Bot SHALL store Discord configuration in bot_config collection with keys: discord_token, discord_guild_id, discord_channel_id
6. WHEN Discord_Client is ready, THE Bot SHALL register all slash commands with Discord API
7. THE Bot SHALL run Discord_Client and WhatsApp_Client simultaneously in the same process

### Requirement 2: Slash Command Registration and Handling

**User Story:** As a Discord user, I want to use slash commands, so that I can interact with the bot using Discord's native command interface.

#### Acceptance Criteria

1. WHEN the Bot initializes, THE Bot SHALL register all available commands as Application_Command definitions
2. THE Bot SHALL register slash commands with name, description, and options matching the existing command set
3. WHEN a slash command is received, THE Bot SHALL extract command name and options into Command_Context
4. WHEN a slash command is executed, THE Bot SHALL defer the reply to prevent timeout during processing
5. WHEN command processing completes, THE Bot SHALL edit the deferred reply with the response
6. THE Bot SHALL support slash command options for all existing command arguments
7. WHEN slash command registration fails, THE Bot SHALL log the error and continue with existing registrations

### Requirement 3: Platform Adapter Pattern Implementation

**User Story:** As a developer, I want platform-agnostic message handling, so that business logic works identically across Discord and WhatsApp.

#### Acceptance Criteria

1. THE Bot SHALL implement Platform_Adapter interface for both Discord and WhatsApp
2. WHEN a message is received on any platform, THE Platform_Adapter SHALL convert it to Unified_Message format
3. THE Unified_Message SHALL contain sender_id, sender_name, platform, command, arguments, and raw_message fields
4. WHEN business logic generates a response, THE Platform_Adapter SHALL format it appropriately for the target platform
5. THE Bot SHALL route all Unified_Message objects through the existing command router
6. WHEN a Platform_Adapter conversion fails, THE Bot SHALL log the error and return a generic error message
7. THE Bot SHALL maintain separate Platform_Adapter instances for Discord and WhatsApp

### Requirement 4: Discord Role Mapping to Admin System

**User Story:** As an admin, I want Discord roles to map to bot permissions, so that role-based access control works on Discord.

#### Acceptance Criteria

1. THE Bot SHALL map Discord_Role names to admin roles: @Ketua → ketua, @Wakil → wakil, @Koordinator → koordinator
2. WHEN a Discord user executes a command, THE Bot SHALL check their Discord_Role assignments
3. WHEN a user has multiple mapped roles, THE Bot SHALL use the highest permission level
4. WHEN a user has no mapped roles, THE Bot SHALL treat them as member role
5. THE Bot SHALL store Discord role mappings in bot_config collection
6. WHEN role mapping configuration is updated, THE Bot SHALL apply changes without restart
7. WHEN a user lacks required permissions, THE Bot SHALL respond with a permission denied message

### Requirement 5: Discord Embed Message Formatting

**User Story:** As a Discord user, I want formatted messages with embeds, so that information is visually organized and easy to read.

#### Acceptance Criteria

1. WHEN displaying task lists, THE Bot SHALL format them as Discord_Embed with title, description, and fields
2. WHEN displaying schedules, THE Bot SHALL format them as Discord_Embed with color-coded entries
3. WHEN displaying piket assignments, THE Bot SHALL format them as Discord_Embed with Discord_Mention for assigned users
4. WHEN displaying announcements, THE Bot SHALL format them as Discord_Embed with appropriate color based on tipe
5. WHEN sending daily recap, THE Bot SHALL use Discord_Embed with sections for tasks, schedules, piket, and announcements
6. WHEN sending weekly recap, THE Bot SHALL use Discord_Embed with statistics and categorized task lists
7. THE Bot SHALL use color codes: urgent tasks (red #FF0000), important tasks (orange #FFA500), normal tasks (green #00FF00)

### Requirement 6: Discord Mention Support for Notifications

**User Story:** As a student, I want to receive Discord mentions for piket assignments, so that I get notified about my responsibilities.

#### Acceptance Criteria

1. WHEN storing member data, THE Bot SHALL optionally store discord_user_id alongside nomor_wa
2. WHEN displaying piket assignments on Discord, THE Bot SHALL use Discord_Mention format for users with discord_user_id
3. WHEN a user lacks discord_user_id, THE Bot SHALL display their name as plain text
4. WHEN sending daily recap on Discord, THE Bot SHALL include Discord_Mention for piket assignments
5. THE Bot SHALL support linking WhatsApp numbers to Discord user IDs via admin command
6. WHEN a Discord_Mention is invalid, THE Bot SHALL fallback to displaying the user's name
7. THE Bot SHALL validate discord_user_id format before storing

### Requirement 7: Platform-Specific Logging

**User Story:** As a system administrator, I want to track which platform was used for each action, so that I can monitor usage across platforms.

#### Acceptance Criteria

1. WHEN logging any command execution, THE Bot SHALL include Platform_Field indicating discord or whatsapp
2. WHEN logging task creation, THE Bot SHALL record which platform was used
3. WHEN logging schedule updates, THE Bot SHALL record which platform was used
4. WHEN generating usage reports, THE Bot SHALL aggregate statistics by platform
5. THE Bot SHALL log Discord-specific events: slash command registration, role sync, embed rendering
6. WHEN a platform-specific error occurs, THE Bot SHALL log the platform context
7. THE Bot SHALL maintain separate error counters for Discord and WhatsApp

### Requirement 8: Scheduled Reminder Delivery to Discord

**User Story:** As a student, I want to receive daily and weekly reminders on Discord, so that I stay informed about upcoming tasks and schedules.

#### Acceptance Criteria

1. WHEN daily reminder time is reached, THE Bot SHALL send the daily recap to the configured Discord_Channel
2. WHEN weekly reminder time is reached, THE Bot SHALL send the weekly recap to the configured Discord_Channel
3. THE Bot SHALL format Discord reminders using Discord_Embed with appropriate sections
4. WHEN Discord_Channel is not configured, THE Bot SHALL log a warning and skip Discord reminder
5. WHEN Discord message send fails, THE Bot SHALL retry up to 3 times with 2-second delay
6. THE Bot SHALL send reminders to both Discord and WhatsApp simultaneously
7. WHEN one platform fails, THE Bot SHALL continue sending to the other platform

### Requirement 9: Discord Permission Validation

**User Story:** As a server administrator, I want the bot to validate Discord permissions, so that it can function properly in the server.

#### Acceptance Criteria

1. WHEN the Bot connects to Discord_Guild, THE Bot SHALL verify it has Send Messages permission in Discord_Channel
2. WHEN the Bot connects to Discord_Guild, THE Bot SHALL verify it has Embed Links permission in Discord_Channel
3. WHEN the Bot connects to Discord_Guild, THE Bot SHALL verify it has Mention Everyone permission for piket notifications
4. WHEN required permissions are missing, THE Bot SHALL log a warning with specific missing permissions
5. WHEN the Bot cannot send messages due to permissions, THE Bot SHALL log the error and notify via WhatsApp
6. THE Bot SHALL check permissions before attempting to send each message type
7. WHEN permissions change during runtime, THE Bot SHALL detect and log the change

### Requirement 10: Discord User Registration and Linking

**User Story:** As an admin, I want to link Discord users to existing member records, so that the bot recognizes Discord users.

#### Acceptance Criteria

1. WHEN an admin executes /link_discord command, THE Bot SHALL link a discord_user_id to an existing member by nomor_wa
2. WHEN an admin executes /unlink_discord command, THE Bot SHALL remove discord_user_id from the member record
3. WHEN a Discord user executes a command without being linked, THE Bot SHALL treat them as guest with view-only permissions
4. WHEN displaying linked users, THE Bot SHALL show both nomor_wa and discord_user_id
5. THE Bot SHALL validate that discord_user_id exists in the Discord_Guild before linking
6. WHEN linking fails due to invalid discord_user_id, THE Bot SHALL return an error message
7. THE Bot SHALL support bulk linking via CSV import with nomor_wa and discord_user_id pairs

### Requirement 11: Discord Text Channel and DM Support

**User Story:** As a user, I want to interact with the bot in both text channels and DMs, so that I can use the bot flexibly.

#### Acceptance Criteria

1. WHEN a slash command is received in Discord_Channel, THE Bot SHALL process it normally
2. WHEN a slash command is received in DM, THE Bot SHALL process it with the same logic
3. WHEN sending scheduled reminders, THE Bot SHALL only send to the configured Discord_Channel, not DMs
4. WHEN a user requests personal information in DM, THE Bot SHALL respond privately
5. WHEN an admin command is executed in DM, THE Bot SHALL verify permissions and process normally
6. THE Bot SHALL log whether commands were executed in channel or DM
7. WHEN a command requires channel context, THE Bot SHALL reject DM execution with an appropriate message

### Requirement 12: Discord Broadcast Commands

**User Story:** As an admin, I want to broadcast messages on Discord, so that I can send urgent announcements to all students.

#### Acceptance Criteria

1. WHEN an admin executes /broadcast command on Discord, THE Bot SHALL send the message to Discord_Channel
2. WHEN an admin executes /broadcast_urgent command on Discord, THE Bot SHALL send the message as Discord_Embed with red color
3. WHEN broadcast is executed, THE Bot SHALL support @everyone or @here mentions if configured
4. WHEN broadcast includes attachments, THE Bot SHALL forward them to Discord_Channel
5. THE Bot SHALL log all broadcast commands with sender, platform, and message content
6. WHEN broadcast fails on one platform, THE Bot SHALL continue broadcasting on other platforms
7. THE Bot SHALL support cross-platform broadcast: command on Discord sends to both Discord and WhatsApp

### Requirement 13: Discord Error Handling and Reconnection

**User Story:** As a system operator, I want the bot to handle Discord disconnections gracefully, so that service remains reliable.

#### Acceptance Criteria

1. WHEN Discord_Client disconnects, THE Bot SHALL log the disconnection reason
2. WHEN disconnection is recoverable, THE Bot SHALL attempt automatic reconnection
3. WHEN reconnection fails after 5 attempts, THE Bot SHALL notify admins via WhatsApp
4. WHEN Discord API returns rate limit error, THE Bot SHALL respect the retry-after header
5. WHEN Discord API returns 4xx error, THE Bot SHALL log the error and return user-friendly message
6. WHEN Discord API returns 5xx error, THE Bot SHALL retry the request up to 3 times
7. THE Bot SHALL continue WhatsApp operations even when Discord is disconnected

### Requirement 14: Discord Command Help and Documentation

**User Story:** As a Discord user, I want to see available commands and their usage, so that I can learn how to use the bot.

#### Acceptance Criteria

1. WHEN a user executes /help command on Discord, THE Bot SHALL display available commands as Discord_Embed
2. THE Bot SHALL filter displayed commands based on the user's Discord_Role permissions
3. WHEN a user executes /help with a command name, THE Bot SHALL display detailed usage for that command
4. THE Bot SHALL include command descriptions, required options, and examples in help messages
5. WHEN slash commands are registered, THE Bot SHALL include descriptions that appear in Discord's command picker
6. THE Bot SHALL display platform-specific notes for commands that behave differently on Discord
7. WHEN a command fails due to invalid arguments, THE Bot SHALL include usage instructions in the error message

### Requirement 15: Configuration Management for Discord

**User Story:** As a system administrator, I want to configure Discord settings, so that I can customize bot behavior without code changes.

#### Acceptance Criteria

1. THE Bot SHALL load Discord configuration from environment variables: DISCORD_TOKEN, DISCORD_GUILD_ID, DISCORD_CHANNEL_ID
2. THE Bot SHALL store Discord runtime configuration in bot_config collection
3. THE Bot SHALL support configuration keys: discord_enabled, discord_role_mappings, discord_mention_enabled
4. WHEN discord_enabled is false, THE Bot SHALL skip Discord client initialization
5. WHEN Discord configuration is updated in bot_config, THE Bot SHALL apply changes without restart for non-critical settings
6. WHEN critical Discord settings change (token, guild_id), THE Bot SHALL require restart
7. THE Bot SHALL validate all Discord configuration values before applying them

