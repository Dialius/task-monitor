# Requirements Document

## Introduction

The Multi-Platform Class Reminder Bot is a unified system that provides class management, task tracking, schedule management, and automated reminders across both Discord and WhatsApp platforms simultaneously. The system shares a common database and business logic while using platform-specific adapters to handle the unique characteristics of each messaging platform.

## Glossary

- **System**: The Multi-Platform Class Reminder Bot
- **Platform**: Either Discord or WhatsApp messaging service
- **Platform_Adapter**: Component that translates between platform-specific APIs and the System's unified interface
- **Service_Layer**: Platform-agnostic business logic components
- **Command_Parser**: Component that interprets user commands uniformly across platforms
- **User**: A person interacting with the System through either platform
- **Role**: Permission level assigned to a User (Ketua, Wakil, Koordinator, Member)
- **Task**: An assignment or homework item with a deadline
- **Schedule**: A class session with time, subject, and location information
- **Piket**: Cleaning duty assignment for class members
- **Announcement**: A broadcast message sent to all members
- **Reminder**: An automated notification sent before a deadline or event
- **Database**: MongoDB instance storing all System data
- **Discord_Client**: Platform-specific client using discord.js library
- **WhatsApp_Client**: Platform-specific client using Baileys library
- **AI_Service**: Integration with Groq or Gemini for intelligent responses
- **Notion_Sync**: Integration that synchronizes data with Notion workspace

## Requirements

### Requirement 1: Platform Support

**User Story:** As a class administrator, I want the bot to work on both Discord and WhatsApp simultaneously, so that all class members can access features regardless of their preferred platform.

#### Acceptance Criteria

1. THE System SHALL support Discord platform using discord.js library
2. THE System SHALL support WhatsApp platform using Baileys library
3. WHEN both platforms are enabled, THE System SHALL process commands from both Discord and WhatsApp concurrently
4. WHERE a platform is disabled in configuration, THE System SHALL not initialize that platform's client
5. WHEN a command is received on either platform, THE System SHALL execute the same business logic regardless of the originating platform

### Requirement 2: Platform Abstraction Layer

**User Story:** As a developer, I want a unified interface for messaging operations, so that business logic doesn't depend on platform-specific implementations.

#### Acceptance Criteria

1. THE Platform_Adapter SHALL provide a common interface for sending messages across all platforms
2. THE Platform_Adapter SHALL provide a common interface for receiving messages across all platforms
3. THE Platform_Adapter SHALL provide a common interface for user identification across all platforms
4. WHEN translating platform-specific data, THE Platform_Adapter SHALL convert it to a unified message format
5. WHEN sending messages through an adapter, THE Platform_Adapter SHALL translate unified format to platform-specific format

### Requirement 3: Shared Database

**User Story:** As a system architect, I want a single MongoDB database for all platforms, so that data remains consistent and synchronized across Discord and WhatsApp.

#### Acceptance Criteria

1. THE Database SHALL store user information with both discord_id and whatsapp_number fields
2. THE Database SHALL store tasks, schedules, piket assignments, and announcements in platform-agnostic format
3. WHEN a user performs an action on one platform, THE System SHALL reflect that change for the same user on the other platform
4. THE Database SHALL store platform preference for each user indicating their primary platform
5. WHEN querying user data, THE System SHALL support lookup by either discord_id or whatsapp_number

### Requirement 4: Unified Command System

**User Story:** As a user, I want to use the same commands on both Discord and WhatsApp, so that I don't need to learn different syntax for each platform.

#### Acceptance Criteria

1. THE Command_Parser SHALL accept identical command syntax from both Discord and WhatsApp
2. WHEN a command is received, THE Command_Parser SHALL extract command name and arguments in a platform-agnostic way
3. THE System SHALL support all task management commands on both platforms
4. THE System SHALL support all schedule management commands on both platforms
5. THE System SHALL support all piket management commands on both platforms
6. THE System SHALL support all announcement commands on both platforms

### Requirement 5: Task Management

**User Story:** As a class member, I want to manage homework and assignments through the bot, so that I can track deadlines and submissions.

#### Acceptance Criteria

1. WHEN a user creates a task, THE System SHALL store it with title, description, deadline, and creator information
2. WHEN a user lists tasks, THE System SHALL return all active tasks sorted by deadline
3. WHEN a user marks a task as complete, THE System SHALL update the task status and record completion time
4. WHEN a user deletes a task, THE System SHALL remove it from the database
5. WHERE a user has Ketua or Wakil role, THE System SHALL allow task creation and deletion
6. WHERE a user has Member role, THE System SHALL allow viewing tasks and marking their own submissions

### Requirement 6: Schedule Management

**User Story:** As a class member, I want to view and manage class schedules, so that I know when and where classes occur.

#### Acceptance Criteria

1. WHEN a user creates a schedule entry, THE System SHALL store day, time, subject, location, and instructor information
2. WHEN a user requests today's schedule, THE System SHALL return all classes scheduled for the current day
3. WHEN a user requests tomorrow's schedule, THE System SHALL return all classes scheduled for the next day
4. WHEN a user requests the weekly schedule, THE System SHALL return all classes for the current week organized by day
5. WHERE a user has Koordinator role or higher, THE System SHALL allow schedule creation and modification

### Requirement 7: Piket Assignment Management

**User Story:** As a class coordinator, I want to assign and track cleaning duties, so that classroom maintenance is fairly distributed.

#### Acceptance Criteria

1. WHEN a coordinator creates a piket assignment, THE System SHALL store the date and assigned members
2. WHEN a user requests today's piket, THE System SHALL return the members assigned for the current day
3. WHEN a user requests the piket schedule, THE System SHALL return all upcoming piket assignments
4. WHERE a user has Koordinator role or higher, THE System SHALL allow piket assignment creation and modification
5. WHEN a piket assignment is created, THE System SHALL validate that assigned members exist in the database

### Requirement 8: Announcement System

**User Story:** As a class leader, I want to broadcast announcements to all members, so that important information reaches everyone.

#### Acceptance Criteria

1. WHEN a leader creates an announcement, THE System SHALL send it to both Discord channel and WhatsApp group
2. WHEN sending announcements, THE System SHALL include timestamp and sender information
3. WHERE a user has Ketua or Wakil role, THE System SHALL allow announcement creation
4. WHEN an announcement is sent, THE System SHALL log it in the Database for record keeping
5. THE System SHALL support text, images, and file attachments in announcements

### Requirement 9: Automated Reminders

**User Story:** As a class member, I want automatic reminders for upcoming deadlines and classes, so that I don't miss important events.

#### Acceptance Criteria

1. WHEN a task deadline is within 24 hours, THE System SHALL send a reminder to both Discord and WhatsApp
2. WHEN a class is scheduled to start within 30 minutes, THE System SHALL send a reminder to both platforms
3. WHEN a piket assignment is scheduled for the current day, THE System SHALL send a morning reminder at 6:00 AM
4. THE System SHALL check for reminder conditions every 15 minutes
5. WHEN sending reminders, THE System SHALL include relevant details such as task title, deadline, or class information

### Requirement 10: Role-Based Access Control

**User Story:** As a system administrator, I want different permission levels for users, so that sensitive operations are restricted to authorized members.

#### Acceptance Criteria

1. THE System SHALL support four roles: Ketua, Wakil, Koordinator, and Member
2. WHEN a user attempts a privileged operation, THE System SHALL verify their role before execution
3. WHERE a user has Ketua role, THE System SHALL grant all permissions
4. WHERE a user has Wakil role, THE System SHALL grant permissions for tasks, announcements, and schedules
5. WHERE a user has Koordinator role, THE System SHALL grant permissions for schedules and piket assignments
6. WHERE a user has Member role, THE System SHALL grant read-only access and personal task completion
7. WHEN a user's role is changed, THE System SHALL update their permissions immediately

### Requirement 11: AI Integration

**User Story:** As a user, I want intelligent responses to natural language queries, so that I can interact with the bot conversationally.

#### Acceptance Criteria

1. THE AI_Service SHALL integrate with either Groq or Gemini API
2. WHEN a user sends a message that is not a recognized command, THE System SHALL forward it to the AI_Service
3. WHEN the AI_Service generates a response, THE System SHALL send it back through the appropriate Platform_Adapter
4. THE System SHALL provide context to the AI_Service including user role and recent conversation history
5. WHERE AI integration is disabled in configuration, THE System SHALL respond with a default message for unrecognized commands

### Requirement 12: Notion Synchronization

**User Story:** As a class administrator, I want task and schedule data synchronized with Notion, so that information is accessible in multiple formats.

#### Acceptance Criteria

1. WHEN a task is created in the System, THE Notion_Sync SHALL create a corresponding entry in the configured Notion database
2. WHEN a task is updated in the System, THE Notion_Sync SHALL update the corresponding Notion entry
3. WHEN a schedule is modified in the System, THE Notion_Sync SHALL update the Notion calendar
4. THE Notion_Sync SHALL run synchronization every 5 minutes
5. WHERE Notion integration is disabled in configuration, THE System SHALL function normally without synchronization

### Requirement 13: User Registration and Identification

**User Story:** As a new user, I want to register with the bot on my preferred platform, so that the system recognizes me and my permissions.

#### Acceptance Criteria

1. WHEN a new user sends their first command, THE System SHALL prompt them to register
2. WHEN a user registers, THE System SHALL collect their name, student ID, and platform identifier
3. THE System SHALL support registration through both Discord and WhatsApp
4. WHEN a user is registered on one platform, THE System SHALL allow them to link their account on the other platform
5. WHEN looking up a user, THE System SHALL support identification by either discord_id or whatsapp_number

### Requirement 14: Error Handling and Resilience

**User Story:** As a system operator, I want the bot to handle errors gracefully, so that one platform's failure doesn't affect the other.

#### Acceptance Criteria

1. WHEN a Discord_Client encounters an error, THE System SHALL log it and continue processing WhatsApp messages
2. WHEN a WhatsApp_Client encounters an error, THE System SHALL log it and continue processing Discord messages
3. WHEN the Database connection fails, THE System SHALL attempt reconnection with exponential backoff
4. WHEN an external API (AI_Service or Notion_Sync) fails, THE System SHALL return an error message to the user and continue operation
5. THE System SHALL log all errors with timestamp, platform, and error details

### Requirement 15: Configuration Management

**User Story:** As a system administrator, I want to configure platform settings independently, so that I can enable or disable features as needed.

#### Acceptance Criteria

1. THE System SHALL read configuration from environment variables or a configuration file
2. THE System SHALL support independent enable/disable flags for Discord and WhatsApp platforms
3. THE System SHALL support configuration of MongoDB connection string
4. THE System SHALL support configuration of AI service provider (Groq or Gemini) and API keys
5. THE System SHALL support configuration of Notion API credentials and database IDs
6. WHEN configuration is invalid or missing required values, THE System SHALL fail to start with a descriptive error message

### Requirement 16: Message Formatting

**User Story:** As a user, I want messages to be properly formatted for each platform, so that information is readable and well-organized.

#### Acceptance Criteria

1. WHEN sending messages to Discord, THE System SHALL use Discord markdown formatting
2. WHEN sending messages to WhatsApp, THE System SHALL use WhatsApp formatting conventions
3. THE System SHALL format task lists with clear structure including title, deadline, and status
4. THE System SHALL format schedules in a table or list format appropriate for each platform
5. WHEN sending error messages, THE System SHALL use clear, user-friendly language

### Requirement 17: Service Layer Architecture

**User Story:** As a developer, I want business logic separated from platform code, so that the system is maintainable and testable.

#### Acceptance Criteria

1. THE Service_Layer SHALL implement TaskService for all task-related operations
2. THE Service_Layer SHALL implement ScheduleService for all schedule-related operations
3. THE Service_Layer SHALL implement PiketService for all piket-related operations
4. THE Service_Layer SHALL implement UserService for all user-related operations
5. THE Service_Layer SHALL implement AnnouncementService for all announcement-related operations
6. WHEN a Platform_Adapter calls a service method, THE Service_Layer SHALL execute business logic without platform-specific code
7. THE Service_Layer SHALL return results in a platform-agnostic format

### Requirement 18: Logging and Monitoring

**User Story:** As a system operator, I want comprehensive logging, so that I can troubleshoot issues and monitor system health.

#### Acceptance Criteria

1. THE System SHALL log all incoming commands with timestamp, platform, user, and command details
2. THE System SHALL log all outgoing messages with timestamp, platform, and recipient
3. THE System SHALL log all database operations with timestamp and operation type
4. THE System SHALL log all errors with full stack traces
5. THE System SHALL support configurable log levels (debug, info, warn, error)
6. WHEN logging sensitive information, THE System SHALL redact API keys and passwords
