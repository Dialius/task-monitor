# Requirements Document: Discord Task Monitor

## Introduction

The Discord Task Monitor feature extends the existing WhatsApp Class Reminder Bot to provide Discord users with an auto-updating task monitoring system. The feature displays real-time task statistics through an interactive embed with buttons for quick task queries, all configurable through a dedicated Discord configuration file.

## Glossary

- **Task_Monitor_Embed**: An auto-updating Discord embed message that displays task statistics and updates every 2 hours
- **Info_Channel**: The Discord channel where the Task Monitor Embed is posted and maintained
- **Command_Channel**: The Discord channel where users can execute task-related commands
- **Ephemeral_Response**: A Discord message visible only to the user who triggered the interaction
- **Rate_Limiter**: A system component that enforces cooldown periods between user command executions
- **Discord_Config**: A configuration file containing all Discord-specific settings including emojis, colors, and channel IDs
- **Active_Task**: A task with status "aktif" in the database
- **Completed_Task**: A task with status "selesai" in the database
- **Task_Type**: Classification of tasks as either "Individu" or "Kelompok"
- **Loading_Message**: A temporary message with animated emoji shown while processing a command
- **Activity_Status**: The bot's Discord presence status that displays dynamic information
- **Animated_Emoji**: A Discord custom emoji in format `<a:name:ID>` that can be animated

## Requirements

### Requirement 1: Task Monitor Embed Display

**User Story:** As a Discord user, I want to see an auto-updating embed with task statistics, so that I can quickly check the current task status without running commands.

#### Acceptance Criteria

1. THE Task_Monitor_Embed SHALL display a title "⋅•⋅☾ Task Monitor ☽⋅•⋅" in bold format
2. WHEN displaying task status, THE Task_Monitor_Embed SHALL show a field "Status Tugas" containing the count of Active_Tasks with format "{count} ┊ {emoji} tugas aktif"
3. WHEN displaying task status, THE Task_Monitor_Embed SHALL show the count of Completed_Tasks with format "{count} ┊ {emoji} tugas selesai"
4. WHEN displaying task types, THE Task_Monitor_Embed SHALL show a field "Tipe Tugas" containing task type breakdown in a code block with format "```{individu_count} Individu | {kelompok_count} Kelompok```"
5. THE Task_Monitor_Embed SHALL display a last updated timestamp field with format "🕐 Last Updated: <t:{timestamp}:R>"
6. THE Task_Monitor_Embed SHALL display a footer with text "Made By VinTheGreat • {server_name}" and a custom icon
7. THE Task_Monitor_Embed SHALL use an embed color value loaded from Discord_Config
8. WHEN counting tasks, THE Task_Monitor_Embed SHALL only count tasks with status "aktif" for active task statistics
9. WHEN counting task types, THE Task_Monitor_Embed SHALL categorize tasks based on the "tipe" field value

### Requirement 2: Task Monitor Embed Updates

**User Story:** As a Discord user, I want the task monitor to update automatically, so that I always see current information without manual intervention.

#### Acceptance Criteria

1. THE System SHALL update the Task_Monitor_Embed every 2 hours automatically
2. WHEN updating the Task_Monitor_Embed, THE System SHALL search for an existing embed in the Info_Channel
3. IF an existing Task_Monitor_Embed is found, THEN THE System SHALL edit the existing message with updated statistics
4. IF no existing Task_Monitor_Embed is found, THEN THE System SHALL create a new Task_Monitor_Embed in the Info_Channel
5. WHEN updating task statistics, THE System SHALL fetch current task data from the database
6. WHEN an update fails, THE System SHALL log the error and retry on the next scheduled update

### Requirement 3: Interactive Button Interface

**User Story:** As a Discord user, I want to click buttons below the task monitor to view specific task lists, so that I can quickly access relevant task information.

#### Acceptance Criteria

1. THE System SHALL display two buttons below the Task_Monitor_Embed
2. THE System SHALL display a button labeled "📅 Minggu Ini" that shows tasks for the current week
3. THE System SHALL display a button labeled "📆 Tugas Besok" that shows tasks for tomorrow
4. WHEN a user clicks a button, THE System SHALL respond with an Ephemeral_Response visible only to that user
5. WHEN generating button responses, THE System SHALL create an embed with title "⋅•⋅☾ {button_name} ☽⋅•⋅" in bold format
6. WHEN listing tasks in button responses, THE System SHALL sort tasks by nearest deadline first
7. WHEN displaying each task, THE System SHALL show task name, deadline, Task_Type, and status
8. THE button response embed SHALL display a footer with text "📊 Sorted by nearest deadline"

### Requirement 4: Channel Configuration

**User Story:** As a bot administrator, I want to configure which channels the bot monitors, so that I can control where the task monitor appears and where users can run commands.

#### Acceptance Criteria

1. THE Discord_Config SHALL contain an Info_Channel identifier
2. THE Discord_Config SHALL contain a Command_Channel identifier
3. THE System SHALL post the Task_Monitor_Embed only in the Info_Channel
4. THE System SHALL monitor button interactions in the Info_Channel
5. THE System SHALL monitor command executions in the Command_Channel
6. WHEN the bot starts, THE System SHALL validate that both channel identifiers are configured

### Requirement 5: Rate Limiting

**User Story:** As a bot administrator, I want to enforce cooldown periods on user commands, so that I can prevent spam and manage bot resource usage.

#### Acceptance Criteria

1. THE Rate_Limiter SHALL enforce a 30 second cooldown per user for general commands
2. THE Rate_Limiter SHALL enforce a 2 hour cooldown per user for commands executed in the Command_Channel
3. WHEN a user executes a command during cooldown, THE System SHALL respond with an Ephemeral_Response indicating remaining cooldown time
4. THE Rate_Limiter SHALL track cooldowns separately for each user identifier
5. WHEN a cooldown period expires, THE System SHALL allow the user to execute commands again
6. THE Rate_Limiter SHALL persist cooldown state in memory during bot runtime

### Requirement 6: Loading Messages

**User Story:** As a Discord user, I want to see a loading indicator when I run commands, so that I know the bot is processing my request.

#### Acceptance Criteria

1. WHEN a user executes a command, THE System SHALL send a Loading_Message with an animated loading emoji
2. WHEN command processing completes, THE System SHALL edit the Loading_Message with the actual response content
3. THE Loading_Message SHALL use an Animated_Emoji configured in Discord_Config
4. IF command processing fails, THEN THE System SHALL edit the Loading_Message with an error message
5. THE System SHALL display the Loading_Message for a minimum of 500 milliseconds before editing

### Requirement 7: Discord Configuration File

**User Story:** As a bot administrator, I want all Discord-specific settings in a dedicated configuration file, so that I can easily customize the bot's appearance and behavior.

#### Acceptance Criteria

1. THE System SHALL load Discord settings from a Discord_Config file
2. THE Discord_Config SHALL contain configuration entries for all Animated_Emojis used by the feature
3. THE Discord_Config SHALL define Animated_Emojis for: online status, offline status, clock, loading, calendar, task icon, individual type, group type, success, and error
4. THE Discord_Config SHALL store each Animated_Emoji in format `<a:name:ID>`
5. THE Discord_Config SHALL contain an embed color value in hexadecimal format
6. THE Discord_Config SHALL contain footer icon URL and footer text template
7. THE Discord_Config SHALL contain Info_Channel and Command_Channel identifiers
8. WHEN the bot starts, THE System SHALL validate that all required Discord_Config entries are present
9. IF any required Discord_Config entry is missing, THEN THE System SHALL log an error and prevent Discord feature initialization

### Requirement 8: Activity Status Configuration

**User Story:** As a bot administrator, I want to configure the bot's activity status with dynamic templates, so that the bot displays relevant task information in its presence.

#### Acceptance Criteria

1. THE Discord_Config SHALL contain activity status templates
2. THE System SHALL support template variables: {total}, {active}, and {nearest}
3. WHEN updating activity status, THE System SHALL replace {total} with the total count of Active_Tasks
4. WHEN updating activity status, THE System SHALL replace {active} with the count of Active_Tasks
5. WHEN updating activity status, THE System SHALL replace {nearest} with the nearest task deadline
6. THE Discord_Config SHALL specify an activity update interval in minutes
7. THE Discord_Config SHALL specify an activity type (WATCHING, PLAYING, LISTENING, or COMPETING)
8. THE System SHALL rotate through configured activity templates at the specified interval
9. WHEN no tasks exist, THE System SHALL display a default activity status message

### Requirement 9: Data Integration

**User Story:** As a system component, I want to fetch task data from existing database and Notion integration, so that the Discord feature displays consistent information across platforms.

#### Acceptance Criteria

1. THE System SHALL fetch task data using the existing TaskService
2. WHEN querying tasks, THE System SHALL use the existing Task model and database schema
3. THE System SHALL retrieve Active_Tasks by filtering tasks with status "aktif"
4. THE System SHALL retrieve Completed_Tasks by filtering tasks with status "selesai"
5. WHEN calculating task counts by type, THE System SHALL group tasks by the "tipe" field
6. THE System SHALL use the existing Notion integration for task synchronization
7. WHEN task data changes in the database, THE System SHALL reflect those changes in the next Task_Monitor_Embed update

### Requirement 10: Error Handling and Logging

**User Story:** As a bot administrator, I want comprehensive error handling and logging, so that I can troubleshoot issues and monitor bot health.

#### Acceptance Criteria

1. WHEN a Discord API error occurs, THE System SHALL log the error with context information
2. WHEN embed update fails, THE System SHALL log the failure and continue normal operation
3. WHEN button interaction fails, THE System SHALL send an Ephemeral_Response with an error message to the user
4. WHEN Rate_Limiter encounters an error, THE System SHALL log the error and allow the command to proceed
5. THE System SHALL log all Task_Monitor_Embed updates with timestamp and statistics
6. WHEN Discord_Config validation fails, THE System SHALL log specific missing or invalid configuration entries
7. IF the Info_Channel or Command_Channel cannot be accessed, THEN THE System SHALL log an error with channel identifier
