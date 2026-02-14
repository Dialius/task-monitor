# Implementation Plan: Discord Task Monitor

## Overview

This implementation plan breaks down the Discord Task Monitor feature into discrete, incremental coding tasks. Each task builds on previous work, with testing integrated throughout to catch errors early. The plan follows a bottom-up approach: configuration → core services → integration → testing.

## Tasks

- [x] 1. Create Discord configuration infrastructure
  - [x] 1.1 Create Discord configuration type definitions
    - Create `src/types/discord.types.ts` with all interfaces (DiscordConfig, EmojiKey, ValidationResult, TaskStatistics, etc.)
    - Define TypeScript types for all configuration structures
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [x] 1.2 Implement DiscordConfigManager service
    - Create `src/services/discord/DiscordConfigManager.ts`
    - Implement configuration loading from file
    - Implement emoji getter with validation
    - Implement channel ID getters
    - Implement embed configuration getters
    - Implement activity configuration getters
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.6, 7.7, 8.1, 8.6, 8.7_
  
  - [x] 1.3 Implement configuration validation
    - Add `validateConfig()` method to DiscordConfigManager
    - Validate all required fields present
    - Validate emoji format matches `<a:name:ID>` pattern
    - Validate hex color format
    - Validate channel IDs are valid snowflakes
    - Return detailed validation errors
    - _Requirements: 4.6, 7.4, 7.5, 7.8, 7.9_
  
  - [ ]* 1.4 Write property test for configuration validation
    - **Property 14: Configuration Completeness**
    - **Property 15: Emoji Format Validation**
    - **Property 16: Configuration Validation on Startup**
    - **Validates: Requirements 4.1, 4.2, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 8.1, 8.6, 8.7**
  
  - [x] 1.5 Create default Discord configuration file
    - Create `src/config/discord.config.ts` with example configuration
    - Include all required emoji placeholders
    - Include channel ID placeholders
    - Include embed styling defaults
    - Include activity templates
    - Add comments explaining each field
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.6, 7.7, 8.1_

- [x] 2. Implement Rate Limiter service
  - [x] 2.1 Create RateLimiter service
    - Create `src/services/discord/RateLimiter.ts`
    - Implement in-memory Map storage for cooldowns
    - Implement `checkCooldown()` method with context support
    - Implement `setCooldown()` method
    - Implement cooldown expiry checking
    - Return remaining time for active cooldowns
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 2.2 Implement cooldown cleanup
    - Add periodic cleanup of expired cooldowns (every 5 minutes)
    - Implement maximum entry limit (10,000 entries)
    - Add cleanup on service stop
    - _Requirements: 5.6_
  
  - [ ]* 2.3 Write property tests for rate limiting
    - **Property 9: Per-User Rate Limiting**
    - **Property 10: General Command Cooldown**
    - **Property 11: Command Channel Cooldown**
    - **Property 12: Cooldown Feedback**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
  
  - [ ]* 2.4 Write unit tests for rate limiter edge cases
    - Test cooldown expiry boundary
    - Test multiple users simultaneously
    - Test cleanup of expired entries
    - Test maximum entry limit
    - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [x] 3. Implement Task Monitor Service core functionality
  - [x] 3.1 Create TaskMonitorService skeleton
    - Create `src/services/discord/TaskMonitorService.ts`
    - Inject dependencies (DiscordClient, TaskService, DiscordConfigManager)
    - Implement service initialization
    - Add scheduling infrastructure (setInterval)
    - _Requirements: 2.1_
  
  - [x] 3.2 Implement task statistics calculation
    - Add `calculateStatistics()` method
    - Query TaskService for active tasks (status "aktif")
    - Query TaskService for completed tasks (status "selesai")
    - Count tasks by type (individu, kelompok)
    - Return TaskStatistics object
    - _Requirements: 1.2, 1.3, 1.4, 1.8, 1.9, 9.1, 9.3, 9.4, 9.5_
  
  - [ ]* 3.3 Write property test for statistics calculation
    - **Property 1: Task Statistics Accuracy**
    - **Property 19: Status Filtering Accuracy**
    - **Property 20: TaskService Integration**
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.8, 1.9, 9.1, 9.3, 9.4, 9.5**
  
  - [x] 3.4 Implement embed generation
    - Add `generateEmbed()` method
    - Create EmbedBuilder with title "⋅•⋅☾ Task Monitor ☽⋅•⋅"
    - Add "Status Tugas" field with active/completed counts and emojis
    - Add "Tipe Tugas" field with code block format
    - Add timestamp field with Discord timestamp format
    - Add footer with server name and icon
    - Apply configured embed color
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  
  - [ ]* 3.5 Write property test for embed formatting
    - **Property 2: Embed Format Consistency**
    - **Property 3: Configuration-Driven Styling**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 6.3, 7.4, 7.5, 7.6**
  
  - [x] 3.6 Implement embed finding logic
    - Add `findExistingEmbed()` method
    - Fetch last 50 messages from Info_Channel
    - Search for message with title "⋅•⋅☾ Task Monitor ☽⋅•⋅"
    - Return Message object or null
    - Cache message ID for faster subsequent lookups
    - _Requirements: 2.2_
  
  - [x] 3.7 Implement embed update logic
    - Add `updateEmbed()` method
    - Call `findExistingEmbed()` to check for existing message
    - If found, edit existing message with new embed
    - If not found, create new message in Info_Channel
    - Log update with timestamp and statistics
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 4.3, 10.5_
  
  - [ ]* 3.8 Write property test for idempotent updates
    - **Property 4: Idempotent Embed Updates**
    - **Property 5: Fresh Data on Updates**
    - **Property 22: Channel Isolation**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5, 4.3, 9.7**
  
  - [x] 3.9 Implement automatic update scheduling
    - Add `startAutoUpdate()` method
    - Set up 2-hour interval (7200000ms)
    - Call `updateEmbed()` on each interval
    - Add `stopAutoUpdate()` method to clear interval
    - _Requirements: 2.1_
  
  - [ ]* 3.10 Write property test for update scheduling
    - **Property 23: Update Scheduling**
    - **Validates: Requirements 2.1**

- [x] 4. Checkpoint - Verify core services
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement Button Interaction Handler
  - [x] 5.1 Create ButtonInteractionHandler service
    - Create `src/services/discord/ButtonInteractionHandler.ts`
    - Inject dependencies (TaskService, DiscordConfigManager, RateLimiter, LoadingMessageManager)
    - Implement button registration with DiscordClient
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 5.2 Implement task query methods
    - Add `getTasksThisWeek()` method using TaskService
    - Add `getTasksTomorrow()` method using TaskService
    - Sort results by deadline ascending
    - _Requirements: 3.6, 9.1_
  
  - [ ]* 5.3 Write property test for task sorting
    - **Property 6: Button Response Sorting**
    - **Validates: Requirements 3.6**
  
  - [x] 5.4 Implement task list embed formatting
    - Add `formatTaskListEmbed()` method
    - Create embed with title "⋅•⋅☾ {button_name} ☽⋅•⋅"
    - List each task with name, deadline, type, status
    - Add footer "📊 Sorted by nearest deadline"
    - Handle empty task list with appropriate message
    - _Requirements: 3.5, 3.7, 3.8_
  
  - [ ]* 5.5 Write property test for button response format
    - **Property 8: Button Response Format**
    - **Validates: Requirements 3.5, 3.7, 3.8**
  
  - [x] 5.6 Implement button click handler
    - Add `handleButtonClick()` method
    - Check rate limit before processing
    - Send loading message via LoadingMessageManager
    - Query appropriate tasks based on button ID
    - Format response embed
    - Edit loading message with response
    - Ensure response is ephemeral
    - _Requirements: 3.4, 5.1, 5.2, 5.3, 6.1, 6.2_
  
  - [ ]* 5.7 Write property test for ephemeral responses
    - **Property 7: Ephemeral Responses**
    - **Validates: Requirements 3.4, 5.3**
  
  - [ ]* 5.8 Write unit tests for button interactions
    - Test "Minggu Ini" button flow
    - Test "Tugas Besok" button flow
    - Test empty task list handling
    - Test rate limit during button click
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.1, 5.2_

- [x] 6. Implement Loading Message Manager
  - [x] 6.1 Create LoadingMessageManager service
    - Create `src/services/discord/LoadingMessageManager.ts`
    - Inject DiscordConfigManager dependency
    - Implement `sendLoadingMessage()` method
    - Implement `editWithResponse()` method
    - Implement `editWithError()` method
    - _Requirements: 6.1, 6.2, 6.4_
  
  - [x] 6.2 Implement minimum display time
    - Track message send timestamp
    - Ensure 500ms minimum before editing
    - Use setTimeout if needed to delay edit
    - _Requirements: 6.5_
  
  - [ ]* 6.3 Write property test for loading message lifecycle
    - **Property 13: Loading Message Lifecycle**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**
  
  - [ ]* 6.4 Write unit tests for loading messages
    - Test loading message sent with correct emoji
    - Test minimum 500ms display time
    - Test edit with success response
    - Test edit with error response
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 7. Implement Activity Status integration
  - [x] 7.1 Extend ActivityStatusService for template variables
    - Modify existing `src/services/ActivityStatusService.ts`
    - Add support for {total}, {active}, {nearest} variables
    - Implement variable replacement logic
    - Handle empty task list with default message
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.9_
  
  - [ ]* 7.2 Write property test for variable substitution
    - **Property 17: Activity Template Variable Substitution**
    - **Property 25: Empty State Handling**
    - **Validates: Requirements 8.2, 8.3, 8.4, 8.5, 8.9**
  
  - [ ]* 7.3 Write unit tests for activity status
    - Test {total} replacement
    - Test {active} replacement
    - Test {nearest} replacement
    - Test empty task list default message
    - Test rotation through templates
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.8, 8.9_

- [x] 8. Implement error handling and logging
  - [x] 8.1 Add error handling to TaskMonitorService
    - Wrap embed update in try-catch
    - Log errors with context (timestamp, statistics, error message)
    - Continue operation on failure
    - Retry on next scheduled update
    - _Requirements: 2.6, 10.1, 10.2, 10.5_
  
  - [x] 8.2 Add error handling to ButtonInteractionHandler
    - Wrap button handling in try-catch
    - Send ephemeral error message to user on failure
    - Log errors with context (user ID, button ID, error message)
    - _Requirements: 10.3_
  
  - [x] 8.3 Add error handling to RateLimiter
    - Wrap cooldown checks in try-catch
    - Log errors with context
    - Fail open (allow command) on error
    - _Requirements: 10.4_
  
  - [x] 8.4 Add channel access error handling
    - Check channel accessibility before operations
    - Log errors with channel ID on access failure
    - Prevent initialization if channels inaccessible
    - _Requirements: 10.7_
  
  - [ ]* 8.5 Write property test for error logging
    - **Property 21: Error Logging with Context**
    - **Property 24: Error Recovery**
    - **Validates: Requirements 2.6, 10.1, 10.2, 10.3, 10.4, 10.5, 10.7**
  
  - [ ]* 8.6 Write unit tests for error scenarios
    - Test Discord API error handling
    - Test embed update failure recovery
    - Test button interaction error response
    - Test rate limiter error fail-open
    - Test channel access error logging
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.7_

- [x] 9. Checkpoint - Verify error handling
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Create button components and attach to embed
  - [x] 10.1 Create button action row builder
    - Create utility function to build button ActionRow
    - Add "Minggu Ini" button with animated calendar emoji
    - Add "Tugas Besok" button with animated calendar emoji
    - Use custom IDs: 'tasks_week' and 'tasks_tomorrow'
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 10.2 Attach buttons to Task Monitor embed
    - Modify TaskMonitorService to include buttons when creating/updating embed
    - Pass button ActionRow to Discord message send/edit
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 10.3 Write unit tests for button components
    - Test button ActionRow creation
    - Test button labels include animated emoji
    - Test button custom IDs are correct
    - Test buttons attached to embed
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 11. Integrate all services with DiscordClient
  - [x] 11.1 Update DiscordClient initialization
    - Modify `src/clients/DiscordClient.ts` or create Discord bot initialization file
    - Load and validate Discord configuration on startup
    - Initialize DiscordConfigManager
    - Initialize RateLimiter
    - Initialize LoadingMessageManager
    - Initialize TaskMonitorService
    - Initialize ButtonInteractionHandler
    - _Requirements: 4.6, 7.8, 7.9_
  
  - [x] 11.2 Register button interaction listeners
    - Register ButtonInteractionHandler with DiscordClient
    - Set up event listener for button interactions
    - Route button clicks to appropriate handler methods
    - _Requirements: 3.4_
  
  - [x] 11.3 Start Task Monitor auto-update
    - Call TaskMonitorService.startAutoUpdate() after initialization
    - Perform initial embed update immediately
    - Log successful initialization
    - _Requirements: 2.1_
  
  - [ ]* 11.4 Write integration tests
    - Test full initialization sequence
    - Test configuration validation prevents initialization on error
    - Test button interaction end-to-end flow
    - Test embed update end-to-end flow
    - _Requirements: 4.6, 7.8, 7.9_

- [x] 12. Add configuration documentation
  - [x] 12.1 Create Discord configuration guide
    - Create `DISCORD_SETUP.md` documentation file
    - Document how to get animated emoji IDs from Discord
    - Document how to get channel IDs
    - Document configuration file structure
    - Provide example configuration with placeholders
    - Document how to customize embed colors and footer
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.6, 7.7_
  
  - [x] 12.2 Update main README
    - Add Discord Task Monitor feature section
    - Link to Discord setup guide
    - Document new environment variables if any
    - Document button interactions
    - _Requirements: 1.1, 3.1, 3.2, 3.3_

- [x] 13. Final checkpoint - End-to-end verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples, edge cases, and integration points
- The implementation follows a bottom-up approach: configuration → services → integration
- All services use dependency injection for testability
- Error handling is integrated throughout, not added as an afterthought
