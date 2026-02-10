# Implementation Plan: Multi-Feature Enhancement

## Overview

This implementation plan covers three major enhancements to the WhatsApp Class Reminder Bot:
1. Multi-line description support from Notion
2. Auto-edit messages when tasks are updated
3. Natural language task creation with `/add_tugas_cepat`

The implementation follows a phased approach, building each feature incrementally with testing at each stage.

## Tasks

- [x] 1. Enhance NotionService for multi-line description support
  - [x] 1.1 Update `parseNotionPage()` to join all rich_text segments
    - Modify the deskripsi parsing to use `.map(rt => rt.plain_text).join('')`
    - Ensure newlines, bullets, and paragraphs are preserved
    - Test with various Notion page formats
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x]* 1.2 Write property test for multi-line text preservation
    - **Property 1: Multi-line Text Preservation**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

  - [x]* 1.3 Write unit tests for edge cases
    - Test empty descriptions
    - Test very long descriptions (near 2000 char limit)
    - Test special characters and emojis
    - _Requirements: 1.5_

- [x] 2. Extend Task model for message tracking
  - [x] 2.1 Add sent_messages array to Task schema
    - Add `sent_messages` field with platform, message_id, chat_id, sent_at, last_edited, edit_count
    - Add indexes for efficient queries
    - Add `last_synced_from_notion` and `notion_last_edited` fields
    - _Requirements: 2.1, 2.9_

  - [x] 2.2 Create database migration (if needed)
    - Ensure existing tasks have empty sent_messages array
    - _Requirements: 2.1_

- [x] 3. Implement MessageTrackingService
  - [x] 3.1 Create MessageTrackingService class
    - Implement `trackMessage()` to add message to sent_messages array
    - Implement `getTasksNeedingEdit()` to find tasks updated in last N hours
    - Implement `hasSignificantChanges()` to detect important field changes
    - _Requirements: 2.1, 2.3_

  - [x]* 3.2 Write property test for message tracking completeness
    - **Property 2: Message Tracking Completeness**
    - **Validates: Requirements 2.1**

  - [x]* 3.3 Write property test for significant change detection
    - **Property 3: Significant Change Detection**
    - **Validates: Requirements 2.3**

- [x] 4. Implement MessageEditService
  - [x] 4.1 Create MessageEditService class
    - Implement `editTaskMessages()` to edit all tracked messages
    - Implement `editWhatsAppMessage()` using Baileys edit API
    - Implement `editDiscordMessage()` using Discord.js edit API
    - Update edit_count and last_edited on successful edits
    - Log all edit operations
    - _Requirements: 2.4, 2.8, 2.9_

  - [x]* 4.2 Write property test for cross-platform message editing
    - **Property 4: Cross-Platform Message Editing**
    - **Validates: Requirements 2.4**

  - [x]* 4.3 Write property test for edit tracking updates
    - **Property 6: Edit Tracking Updates**
    - **Validates: Requirements 2.9**

  - [x]* 4.4 Write unit tests for error handling
    - Test message not found scenario
    - Test platform API errors
    - Test network failures
    - _Requirements: 2.8_

- [x] 5. Implement ChangeDetectionService
  - [x] 5.1 Create ChangeDetectionService class
    - Implement `start()` to start cron job (every 1 hour)
    - Implement `runChangeDetection()` main logic
    - Implement `syncWithRetry()` with exponential backoff
    - Integrate with NotionService, MessageTrackingService, MessageEditService
    - _Requirements: 2.2, 2.3, 2.7_

  - [x]* 5.2 Write property test for retry with exponential backoff
    - **Property 5: Retry with Exponential Backoff**
    - **Validates: Requirements 2.7**

  - [x]* 5.3 Write integration test for change detection flow
    - Test end-to-end: Notion sync → Change detection → Message edit
    - _Requirements: 2.2, 2.3, 2.4_

- [x] 6. Checkpoint - Ensure auto-edit feature works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement AITaskParserService
  - [x] 7.1 Create AITaskParserService class
    - Implement `parseNaturalLanguage()` to call AI and extract task info
    - Implement `buildPrompt()` with parsing rules and examples
    - Implement `validateParsedTask()` to check required fields
    - Handle relative dates: "besok", "lusa", "minggu depan"
    - Handle keyword detection: "ujian", "kelompok", "urgent"
    - _Requirements: 3.2, 3.3, 3.4_

  - [x]* 7.2 Write property test for AI parsing completeness
    - **Property 7: AI Parsing Completeness**
    - **Validates: Requirements 3.2**

  - [x]* 7.3 Write property test for relative date parsing
    - **Property 8: Relative Date Parsing**
    - **Validates: Requirements 3.3**

  - [x]* 7.4 Write property test for keyword detection
    - **Property 9: Keyword Detection**
    - **Validates: Requirements 3.4**

  - [x]* 7.5 Write unit tests for error handling
    - Test AI timeout
    - Test invalid JSON response
    - Test missing required fields
    - _Requirements: 3.8_

- [x] 8. Implement ConfirmationService
  - [x] 8.1 Create ConfirmationService class
    - Implement `storePendingConfirmation()` with 60s timeout
    - Implement `getPendingConfirmation()` with expiry check
    - Implement `formatPreviewMessage()` to show parsed task
    - Implement `parseEditCommand()` to parse "edit [field] [value]"
    - Implement `applyEdit()` to update parsed task fields
    - Implement auto-cleanup for expired confirmations
    - _Requirements: 3.5, 3.6, 3.7_

  - [x]* 8.2 Write property test for confirmation edit application
    - **Property 10: Confirmation Edit Application**
    - **Validates: Requirements 3.6**

  - [x]* 8.3 Write unit tests for confirmation flow
    - Test timeout behavior
    - Test "ya" confirmation
    - Test "batal" cancellation
    - Test edit command parsing
    - _Requirements: 3.5, 3.6, 3.7_

- [x] 9. Enhance AdminCommandHandler for natural language task creation
  - [x] 9.1 Implement `handleAddTugasCepat()` command
    - Check for pending confirmation
    - Parse natural language input with AITaskParserService
    - Validate parsed task
    - Store pending confirmation
    - Show preview message
    - _Requirements: 3.1, 3.2, 3.5_

  - [x] 9.2 Implement `handleConfirmationResponse()` private method
    - Handle "ya" → Create task and sync to Notion
    - Handle "batal" → Cancel and remove pending confirmation
    - Handle "edit [field] [value]" → Apply edit and show updated preview
    - Handle invalid responses → Show error message
    - _Requirements: 3.6, 3.7_

  - [x]* 9.3 Write integration test for natural language task creation
    - Test full flow: Parse → Preview → Confirm → Create
    - Test edit flow: Parse → Preview → Edit → Confirm → Create
    - Test cancel flow: Parse → Preview → Cancel
    - _Requirements: 3.1, 3.5, 3.6, 3.7_

  - [x]* 9.4 Write unit tests for platform compatibility
    - Test command works on WhatsApp
    - Test command works on Discord
    - _Requirements: 3.9_

- [x] 10. Integrate change detection with bot startup
  - [x] 10.1 Start ChangeDetectionService in bot initialization
    - Call `changeDetectionService.start()` in main bot file
    - Ensure cron job runs every hour
    - Add graceful shutdown to stop cron job
    - _Requirements: 2.2_

  - [x] 10.2 Add manual trigger for testing
    - Add `/test_change_detection` admin command (optional)
    - Allow manual run of change detection for debugging

- [x] 11. Update message sending to track messages
  - [x] 11.1 Modify WhatsApp message sending
    - After sending task message, call `MessageTrackingService.trackMessage()`
    - Store message key for future edits
    - _Requirements: 2.1_

  - [x] 11.2 Modify Discord message sending
    - After sending task message, call `MessageTrackingService.trackMessage()`
    - Store message ID for future edits
    - _Requirements: 2.1_

- [x] 12. Final checkpoint - Ensure all features work together
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Documentation and cleanup
  - [x] 13.1 Update README with new features
    - Document `/add_tugas_cepat` command
    - Document auto-edit behavior
    - Document multi-line description support

  - [x] 13.2 Add inline code comments
    - Document complex logic in services
    - Add JSDoc comments to public methods

  - [x] 13.3 Update environment variables documentation
    - Ensure NOTION_API_KEY and NOTION_DATABASE_ID are documented
    - Document AI service configuration

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows
- All features are already implemented and working in production

## Testing Configuration

**Property-Based Testing**:
- Library: fast-check (TypeScript)
- Minimum iterations: 100 per property test
- Tag format: `// Feature: multi-feature-enhancement, Property N: [Property Title]`

**Unit Testing**:
- Framework: Jest with ts-jest
- Focus on edge cases, error conditions, and specific examples
- Mock external services (Notion API, AI API, platform clients)

**Integration Testing**:
- Test end-to-end flows with real services (or test doubles)
- Verify cross-component interactions
- Test error propagation and recovery

## Success Criteria

- ✅ All property tests pass (100 iterations each)
- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ Multi-line descriptions display correctly in WhatsApp and Discord
- ✅ Auto-edit updates messages within 1 hour of task changes
- ✅ Natural language task creation works with 90%+ accuracy
- ✅ No crashes or data loss in production
- ✅ Cron job completes in < 5 minutes
- ✅ All features work on both WhatsApp and Discord platforms

