# Implementation Plan: Discord Integration

## Overview

This implementation plan adds Discord support to the existing WhatsApp Class Reminder Bot through a platform adapter pattern. The approach maintains complete backward compatibility with the existing WhatsApp functionality while enabling simultaneous multi-platform operation. All existing services remain unchanged, with platform abstraction handled entirely in the new adapter layer.

## Tasks

- [ ] 1. Set up Discord dependencies and configuration
  - Install discord.js v14 and type definitions
  - Add Discord environment variables to .env.example
  - Create Discord configuration interface in src/config/
  - Update bot_config collection schema with Discord fields
  - _Requirements: 1.5, 15.1, 15.2_

- [ ] 2. Implement Platform Adapter interface and base types
  - [ ] 2.1 Create platform adapter interface
    - Define PlatformAdapter interface in src/adapters/PlatformAdapter.ts
    - Define UnifiedMessage, MessageContent, EmbedData, and BotResponse types
    - Define PlatformMessage interface
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 2.2 Write property test for unified message structure
    - **Property 14: Message conversion to unified format**
    - **Validates: Requirements 3.2, 3.3**
  
  - [ ] 2.3 Create response formatter utilities
    - Implement helper functions for formatting responses
    - Add validation for required fields in UnifiedMessage
    - _Requirements: 3.3, 3.4_

- [ ] 3. Implement Discord Embed Formatter
  - [ ] 3.1 Create DiscordEmbedFormatter class
    - Implement formatTaskList method
    - Implement formatSchedule method
    - Implement formatPiket method with mention support
    - Implement formatAnnouncement method
    - Implement formatDailyRecap and formatWeeklyRecap methods
    - Implement formatError and formatHelp methods
    - Add color mapping for priorities and announcement types
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [ ]* 3.2 Write property tests for embed formatting
    - **Property 25: Task list embed structure**
    - **Property 31: Priority color mapping**
    - **Validates: Requirements 5.1, 5.7**
  
  - [ ]* 3.3 Write unit tests for embed edge cases
    - Test embed with maximum fields (25 limit)
    - Test embed with content exceeding 6000 characters
    - Test invalid color codes
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 4. Implement Slash Command Builder
  - [ ] 4.1 Create SlashCommandBuilder class
    - Define CommandMetadata and ArgumentDefinition interfaces
    - Implement buildCommands method to convert metadata to Discord format
    - Implement buildOptions for command arguments
    - Map existing commands to slash command definitions
    - _Requirements: 2.1, 2.2, 2.6_
  
  - [ ]* 4.2 Write property test for command registration
    - **Property 7: Complete command registration**
    - **Property 8: Command metadata consistency**
    - **Validates: Requirements 2.1, 2.2**

- [ ] 5. Implement Discord Permission Validator
  - [ ] 5.1 Create DiscordPermissionValidator class
    - Implement validateChannelPermissions method
    - Implement hasPermission method for specific permissions
    - Implement getMissingPermissions method
    - Implement validateRole method
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.6_
  
  - [ ]* 5.2 Write property tests for permission validation
    - **Property 51: Send messages permission validation**
    - **Property 56: Pre-send permission checking**
    - **Validates: Requirements 9.1, 9.6**

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement Discord Adapter
  - [ ] 7.1 Create DiscordAdapter class structure
    - Implement PlatformAdapter interface
    - Set up Discord client initialization
    - Implement isReady method
    - Add configuration loading
    - _Requirements: 1.1, 1.2, 3.1_
  
  - [ ] 7.2 Implement slash command registration
    - Implement registerSlashCommands method
    - Handle registration errors gracefully
    - Log successful registrations
    - _Requirements: 1.6, 2.1, 2.7_
  
  - [ ] 7.3 Implement interaction handling
    - Implement handleInteraction method
    - Implement deferred reply logic
    - Convert interactions to UnifiedMessage
    - _Requirements: 2.3, 2.4, 2.5_
  
  - [ ] 7.4 Implement message sending
    - Implement sendMessage method
    - Implement sendMessageWithMentions method
    - Handle embeds and text messages
    - _Requirements: 5.1, 6.2_
  
  - [ ] 7.5 Implement role mapping
    - Implement mapDiscordRoleToAdminRole method
    - Implement getUserRole method
    - Handle multiple roles with precedence
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 7.6 Implement response formatting
    - Implement formatResponse method
    - Use DiscordEmbedFormatter for embeds
    - Handle platform-specific formatting
    - _Requirements: 3.4, 5.1_
  
  - [ ]* 7.7 Write property tests for Discord adapter
    - **Property 13: Adapter interface implementation**
    - **Property 15: Response formatting for target platform**
    - **Property 19: Discord role to admin role mapping**
    - **Validates: Requirements 3.1, 3.4, 4.1**
  
  - [ ]* 7.8 Write unit tests for Discord adapter
    - Test slash command registration with mocked Discord client
    - Test interaction handling with various option types
    - Test role mapping with different role combinations
    - Test error handling for API failures
    - _Requirements: 1.6, 2.3, 4.1_

- [ ] 8. Implement WhatsApp Adapter (refactor existing code)
  - [ ] 8.1 Create WhatsAppAdapter class
    - Wrap existing BaileysClient in adapter
    - Implement PlatformAdapter interface
    - Implement toUnifiedMessage for WhatsApp messages
    - Implement formatResponse for WhatsApp text
    - _Requirements: 3.1, 3.2, 3.4_
  
  - [ ] 8.2 Implement embed-to-text conversion
    - Implement formatEmbedAsText method
    - Convert Discord embeds to readable WhatsApp text
    - Preserve structure and formatting
    - _Requirements: 3.4_
  
  - [ ]* 8.3 Write property tests for WhatsApp adapter
    - **Property 13: Adapter interface implementation**
    - **Property 14: Message conversion to unified format**
    - **Validates: Requirements 3.1, 3.2**

- [ ] 9. Implement Bot Manager (orchestration layer)
  - [ ] 9.1 Create BotManager class
    - Implement initialize method for both platforms
    - Implement initializeDiscord and initializeWhatsApp methods
    - Store adapter instances in map
    - Handle conditional Discord initialization based on config
    - _Requirements: 1.7, 15.4_
  
  - [ ] 9.2 Implement message handling
    - Implement handleMessage method
    - Route UnifiedMessage to command router
    - Handle responses from command router
    - _Requirements: 3.5_
  
  - [ ] 9.3 Implement broadcast functionality
    - Implement broadcast method for multi-platform messaging
    - Handle partial failures gracefully
    - Return BroadcastResult with per-platform status
    - _Requirements: 12.6, 12.7_
  
  - [ ] 9.4 Implement health checking and shutdown
    - Implement healthCheck method
    - Implement shutdown method for graceful cleanup
    - _Requirements: 1.7_
  
  - [ ]* 9.5 Write property tests for bot manager
    - **Property 6: Concurrent platform operation**
    - **Property 50: Platform failure isolation**
    - **Property 72: Cross-platform broadcast delivery**
    - **Validates: Requirements 1.7, 8.7, 12.7**
  
  - [ ]* 9.6 Write unit tests for bot manager
    - Test initialization with Discord enabled/disabled
    - Test broadcast with one platform failing
    - Test health check with various platform states
    - _Requirements: 1.7, 12.6, 15.4_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Update Permission Service for multi-platform support
  - [ ] 11.1 Enhance PermissionService class
    - Add platform parameter to isAdmin and getUserRole methods
    - Implement linkDiscordUser and unlinkDiscordUser methods
    - Implement getDiscordUserId method
    - Implement validateDiscordUser method
    - _Requirements: 4.2, 6.5, 10.1, 10.2, 10.5_
  
  - [ ]* 11.2 Write property tests for permission service
    - **Property 20: Role-based permission checking**
    - **Property 57: Discord user linking to member**
    - **Property 61: Discord user ID guild validation**
    - **Validates: Requirements 4.2, 10.1, 10.5**

- [ ] 12. Update Command Router for platform awareness
  - [ ] 12.1 Enhance CommandRouter class
    - Accept BotManager in constructor
    - Update route method to accept UnifiedMessage
    - Update logCommand to include platform field
    - _Requirements: 3.5, 7.1_
  
  - [ ]* 12.2 Write property test for unified message routing
    - **Property 16: Unified message routing**
    - **Validates: Requirements 3.5**

- [ ] 13. Update Reminder Scheduler for multi-platform delivery
  - [ ] 13.1 Enhance ReminderScheduler class
    - Replace WhatsApp client with BotManager
    - Update sendDailyRecap to send to both platforms
    - Update sendWeeklyRecap to send to both platforms
    - Implement buildRecapForPlatform method
    - Implement sendToDiscord and sendToWhatsApp methods
    - _Requirements: 8.1, 8.2, 8.3, 8.6, 8.7_
  
  - [ ]* 13.2 Write property tests for multi-platform reminders
    - **Property 44: Daily recap Discord delivery**
    - **Property 49: Simultaneous multi-platform reminder delivery**
    - **Property 50: Platform failure isolation**
    - **Validates: Requirements 8.1, 8.6, 8.7**

- [ ] 14. Implement Discord-specific command handlers
  - [ ] 14.1 Add /link_discord command handler
    - Parse nomor_wa and discord_user_id arguments
    - Validate Discord user exists in guild
    - Call PermissionService.linkDiscordUser
    - Return success or error message
    - _Requirements: 10.1, 10.5, 10.6_
  
  - [ ] 14.2 Add /unlink_discord command handler
    - Parse nomor_wa argument
    - Call PermissionService.unlinkDiscordUser
    - Return success message
    - _Requirements: 10.2_
  
  - [ ] 14.3 Update /help command for Discord
    - Detect platform from UnifiedMessage
    - Format help as embed for Discord
    - Filter commands by user role
    - Include platform-specific notes
    - _Requirements: 14.1, 14.2, 14.6_
  
  - [ ]* 14.4 Write unit tests for Discord commands
    - Test /link_discord with valid and invalid user IDs
    - Test /unlink_discord
    - Test /help with different roles
    - _Requirements: 10.1, 10.2, 14.1_

- [ ] 15. Update database models for Discord support
  - [ ] 15.1 Update Member model
    - Add discord_user_id field (optional String)
    - Add index for discord_user_id
    - Update validation to allow discord_user_id
    - _Requirements: 6.1_
  
  - [ ] 15.2 Update Log model
    - Add user_discord field (optional String)
    - Add platform field (required String: 'discord' | 'whatsapp')
    - Add compound index on platform and created_at
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ] 15.3 Add Discord configuration to BotConfig
    - Add default entries for Discord settings
    - Add validation for Discord config keys
    - _Requirements: 1.5, 15.2, 15.3_

- [ ] 16. Implement error handling and reconnection logic
  - [ ] 16.1 Add Discord connection error handling
    - Implement retry logic with exponential backoff
    - Log connection failures with context
    - Exit after 5 failed attempts
    - _Requirements: 1.3, 1.4_
  
  - [ ] 16.2 Add Discord API error handling
    - Handle rate limits with retry-after
    - Handle 4xx errors without retry
    - Handle 5xx errors with retry
    - Log all errors with platform context
    - _Requirements: 13.4, 13.5, 13.6, 7.6_
  
  - [ ] 16.3 Add reconnection logic
    - Detect recoverable disconnections
    - Attempt automatic reconnection
    - Notify admins via WhatsApp after 5 failed attempts
    - _Requirements: 13.1, 13.2, 13.3_
  
  - [ ]* 16.4 Write property tests for error handling
    - **Property 3: Connection failure retry mechanism**
    - **Property 75: Rate limit respect**
    - **Property 78: Platform failure isolation**
    - **Validates: Requirements 1.3, 13.4, 13.7**

- [ ] 17. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Update main application entry point
  - [ ] 18.1 Refactor src/index.ts
    - Create BotManager instance
    - Initialize both platforms
    - Set up event handlers for both adapters
    - Connect adapters to command router
    - Start reminder scheduler with BotManager
    - _Requirements: 1.7_
  
  - [ ] 18.2 Add graceful shutdown handling
    - Listen for SIGINT and SIGTERM
    - Call BotManager.shutdown
    - Close database connections
    - _Requirements: 1.7_

- [ ] 19. Implement logging enhancements
  - [ ] 19.1 Update Logger class
    - Add platform parameter to all log methods
    - Update logCommand to include platform field
    - Add logDiscordEvent method for Discord-specific events
    - Maintain separate error counters per platform
    - _Requirements: 7.1, 7.5, 7.6, 7.7_
  
  - [ ]* 19.2 Write property tests for platform logging
    - **Property 39: Command execution platform logging**
    - **Property 42: Platform-specific error logging**
    - **Validates: Requirements 7.1, 7.6**

- [ ] 20. Add configuration validation and loading
  - [ ] 20.1 Create Discord configuration validator
    - Validate token format
    - Validate guild ID and channel ID (snowflake format)
    - Validate role mappings
    - Validate color codes
    - _Requirements: 15.7_
  
  - [ ] 20.2 Implement configuration hot-reload
    - Watch bot_config collection for changes
    - Apply non-critical changes without restart
    - Log configuration updates
    - _Requirements: 4.6, 15.5_
  
  - [ ]* 20.3 Write property tests for configuration
    - **Property 85: Environment variable configuration loading**
    - **Property 89: Configuration validation**
    - **Validates: Requirements 15.1, 15.7**

- [ ] 21. Integration testing and wiring
  - [ ] 21.1 Create integration test suite
    - Test end-to-end Discord command flow
    - Test multi-platform broadcast
    - Test scheduled reminders on both platforms
    - Test platform failure isolation
    - Test user linking workflow
    - _Requirements: 1.7, 8.6, 12.7_
  
  - [ ] 21.2 Test with mock Discord client
    - Use discord.js test utilities
    - Mock guild, channel, and user data
    - Test all slash commands
    - Test permission validation
    - _Requirements: 2.1, 4.2, 9.1_
  
  - [ ]* 21.3 Write property tests for integration scenarios
    - **Property 6: Concurrent platform operation**
    - **Property 49: Simultaneous multi-platform reminder delivery**
    - **Property 72: Cross-platform broadcast delivery**
    - **Validates: Requirements 1.7, 8.6, 12.7**

- [ ] 22. Documentation and deployment preparation
  - [ ] 22.1 Update README.md
    - Add Discord setup instructions
    - Document environment variables
    - Add Discord bot creation guide
    - Document role mapping configuration
    - _Requirements: 15.1_
  
  - [ ] 22.2 Create Discord deployment guide
    - Document Discord bot permissions required
    - Document slash command registration process
    - Add troubleshooting section
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ] 22.3 Update API documentation
    - Document PlatformAdapter interface
    - Document UnifiedMessage format
    - Document BotManager API
    - _Requirements: 3.1, 3.2_

- [ ] 23. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The adapter pattern ensures existing WhatsApp code remains unchanged
- Discord and WhatsApp clients run simultaneously in the same process
- All business logic services (TaskService, ScheduleService, etc.) remain unchanged

