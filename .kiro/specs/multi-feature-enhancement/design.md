# Multi-Feature Enhancement Design

## Overview

This design document covers three major enhancements to the WhatsApp Class Reminder Bot:

1. **Multi-line Description Support**: Parse and preserve complex formatting from Notion descriptions
2. **Auto-Edit Messages**: Automatically update previously sent messages when tasks change
3. **Natural Language Task Creation**: Allow users to create tasks using conversational input

These features work together to improve the user experience by supporting richer content, keeping information synchronized, and reducing friction in task creation.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     External Systems                         │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │    Notion    │         │   OpenAI     │                 │
│  │   Database   │         │     API      │                 │
│  └──────┬───────┘         └──────┬───────┘                 │
└─────────┼────────────────────────┼─────────────────────────┘
          │                        │
          │ Sync                   │ Parse NL
          ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      Core Services                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Notion     │  │    Change    │  │  AI Task     │     │
│  │   Service    │  │  Detection   │  │   Parser     │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         │                  │                  │              │
│         ▼                  ▼                  ▼              │
│  ┌──────────────────────────────────────────────────┐      │
│  │           Message Tracking Service                │      │
│  └──────────────────┬───────────────────────────────┘      │
│                     │                                        │
└─────────────────────┼────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────────────────────────────────────────┐      │
│  │              MongoDB (Task Model)                 │      │
│  │  - Task fields                                    │      │
│  │  - sent_messages[] (tracking)                     │      │
│  │  - updated_at (change detection)                  │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Platform Clients                            │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   WhatsApp   │         │   Discord    │                 │
│  │   (Baileys)  │         │  (Discord.js)│                 │
│  └──────────────┘         └──────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Feature 1: Multi-line Description**
```
Notion → NotionService.parseNotionPage() → Join all rich_text → MongoDB → Format → Platform
```

**Feature 2: Auto-Edit Messages**
```
Cron (hourly) → Notion Sync → Change Detection → Find Updated Tasks → 
Edit Messages (WhatsApp + Discord) → Update Tracking
```

**Feature 3: Natural Language Task Creation**
```
User Input → AI Parser → Parsed Task → Confirmation Service → 
User Confirms → Create Task → Sync to Notion
```

## Components and Interfaces

### 1. NotionService (Enhanced)

**Purpose**: Sync tasks from Notion with support for multi-line descriptions

**Key Methods**:
```typescript
class NotionService {
  // Parse Notion page with multi-line support
  private parseNotionPage(page: any): NotionTask {
    // Join ALL rich_text segments (not just first)
    const deskripsi = properties.Deskripsi?.rich_text
      ?.map((rt: any) => rt.plain_text)
      .join('')  // Preserves newlines, bullets, paragraphs
      .trim() || '';
    // ...
  }

  // Sync with retry logic
  async syncFromNotion(): Promise<{ synced: number; errors: number }> {
    // Max 3 retries with exponential backoff
    // Timeout: 10 seconds per request
  }
}
```

**Requirements Addressed**: 1.1, 1.2, 1.3, 1.4, 1.5

### 2. ChangeDetectionService

**Purpose**: Detect task changes and trigger message edits

**Key Methods**:
```typescript
class ChangeDetectionService {
  // Start cron job (runs every hour)
  start(): void {
    cron.schedule('0 * * * *', async () => {
      await this.runChangeDetection();
    });
  }

  // Main change detection logic
  async runChangeDetection(): Promise<{
    synced: number;
    edited: number;
    errors: number;
  }> {
    // 1. Sync from Notion with retry
    // 2. Find tasks updated in last hour with sent messages
    // 3. Edit all tracked messages
    // 4. Update tracking metadata
  }

  // Sync with exponential backoff
  private async syncWithRetry(maxRetries: number = 3): Promise<{
    synced: number;
    errors: number;
  }> {
    // Retry delays: 2s, 4s, 8s
  }
}
```

**Requirements Addressed**: 2.2, 2.3, 2.7

### 3. MessageTrackingService

**Purpose**: Track sent messages and identify tasks needing edits

**Key Methods**:
```typescript
class MessageTrackingService {
  // Track a sent message
  static async trackMessage(
    taskId: string,
    platform: 'whatsapp' | 'discord',
    messageId: string,
    chatId: string
  ): Promise<void> {
    // Add to task.sent_messages array
  }

  // Get tasks that need editing (updated in last N hours)
  static async getTasksNeedingEdit(
    hoursBack: number
  ): Promise<ITask[]> {
    // Find tasks where:
    // - updated_at is recent
    // - sent_messages array is not empty
    // - significant fields changed
  }

  // Check if task has significant changes
  static hasSignificantChanges(
    oldTask: ITask,
    newTask: ITask
  ): boolean {
    // Compare: judul, deskripsi, deadline, prioritas, status
  }
}
```

**Requirements Addressed**: 2.1, 2.3, 2.9

### 4. MessageEditService

**Purpose**: Edit messages on WhatsApp and Discord

**Key Methods**:
```typescript
class MessageEditService {
  // Edit all messages for a task
  static async editTaskMessages(
    task: ITask,
    whatsappFormatter: (task: ITask) => string,
    discordFormatter: (task: ITask) => EmbedBuilder
  ): Promise<Array<{ success: boolean; platform: string; error?: string }>> {
    // For each sent_message:
    // - Format message for platform
    // - Call platform-specific edit
    // - Update edit_count and last_edited
    // - Log operation
  }

  // Edit WhatsApp message
  private static async editWhatsAppMessage(
    messageId: string,
    chatId: string,
    newText: string
  ): Promise<boolean> {
    // Use Baileys edit API
    await sock.sendMessage(jid, {
      edit: messageKey,
      text: newText
    });
  }

  // Edit Discord message
  private static async editDiscordMessage(
    messageId: string,
    channelId: string,
    newEmbed: EmbedBuilder
  ): Promise<boolean> {
    // Use Discord.js edit API
    const message = await channel.messages.fetch(messageId);
    await message.edit({ embeds: [newEmbed] });
  }
}
```

**Requirements Addressed**: 2.4, 2.8, 2.9

### 5. AITaskParserService

**Purpose**: Parse natural language input to extract task information

**Key Methods**:
```typescript
class AITaskParserService {
  // Parse natural language to structured task
  async parseNaturalLanguage(input: string): Promise<ParsedTask | null> {
    // Build prompt with:
    // - Current date/time
    // - Valid subjects list
    // - Parsing rules (relative dates, keywords)
    // - Examples
    
    // Call AI service
    // Extract JSON from response
    // Validate and return
  }

  // Build AI prompt
  private buildPrompt(input: string, currentDate: Date): string {
    // Include rules for:
    // - Relative dates: "besok", "lusa", "minggu depan"
    // - Keyword detection: "ujian", "kelompok", "urgent"
    // - Default values
    // - Time handling (default 23:59)
  }

  // Validate parsed task
  validateParsedTask(parsed: ParsedTask): { 
    valid: boolean; 
    errors: string[] 
  } {
    // Check all required fields
    // Validate enum values
    // Ensure deadline is future
  }
}
```

**Requirements Addressed**: 3.2, 3.3, 3.4, 3.8

### 6. ConfirmationService

**Purpose**: Manage confirmation flow for natural language task creation

**Key Methods**:
```typescript
class ConfirmationService {
  private pendingConfirmations: Map<string, PendingConfirmation>;
  private readonly TIMEOUT_MS = 60000; // 60 seconds

  // Store pending confirmation
  storePendingConfirmation(
    userId: string,
    platform: 'whatsapp' | 'discord',
    parsedTask: ParsedTask
  ): void {
    // Store with expiration
    // Auto-cleanup after timeout
  }

  // Get pending confirmation (check expiry)
  getPendingConfirmation(userId: string): PendingConfirmation | null

  // Format preview message
  formatPreviewMessage(parsedTask: ParsedTask): string {
    // Show all fields with emojis
    // Include instructions: ya/edit/batal
    // Show timeout warning
  }

  // Parse edit command: "edit [field] [value]"
  parseEditCommand(input: string): { field: string; value: string } | null

  // Apply edit to parsed task
  applyEdit(
    parsedTask: ParsedTask,
    field: string,
    value: string
  ): { success: boolean; message: string; updatedTask?: ParsedTask }

  // Update field in pending confirmation
  updatePendingField(
    userId: string,
    field: keyof ParsedTask,
    value: any
  ): boolean
}
```

**Requirements Addressed**: 3.5, 3.6, 3.7

### 7. AdminCommandHandler (Enhanced)

**Purpose**: Handle `/add_tugas_cepat` command and confirmation flow

**Key Methods**:
```typescript
class AdminCommandHandler {
  // Handle natural language task creation
  async handleAddTugasCepat(
    args: string[],
    userId: string,
    platform: Platform
  ): Promise<CommandResponse> {
    // Check if user has pending confirmation
    if (ConfirmationService.hasPendingConfirmation(userId)) {
      return await this.handleConfirmationResponse(input, userId, platform);
    }

    // Parse with AI
    const parsed = await this.aiTaskParser.parseNaturalLanguage(input);
    
    // Validate
    // Store pending confirmation
    // Show preview
  }

  // Handle confirmation response (ya/edit/batal)
  private async handleConfirmationResponse(
    input: string,
    userId: string,
    platform: Platform
  ): Promise<CommandResponse> {
    // "ya" → Create task and sync to Notion
    // "batal" → Cancel
    // "edit [field] [value]" → Apply edit and show updated preview
  }
}
```

**Requirements Addressed**: 3.1, 3.5, 3.6, 3.7, 3.9

## Data Models

### Task Model (Enhanced)

```typescript
interface ITask extends Document {
  // Existing fields
  judul: string;
  deskripsi: string;  // Now supports multi-line with formatting
  deadline: Date;
  mata_pelajaran: string;
  tipe: 'individu' | 'kelompok' | 'ujian';
  prioritas: 'urgent' | 'penting' | 'normal';
  status: 'aktif' | 'selesai';
  link_pengumpulan?: string;
  catatan?: string;
  notion_id?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  
  // NEW: Message tracking for auto-edit
  sent_messages?: Array<{
    platform: 'whatsapp' | 'discord';
    message_id: string;
    chat_id: string;
    sent_at: Date;
    last_edited?: Date;
    edit_count: number;
  }>;
  
  // NEW: Change tracking for Notion sync
  last_synced_from_notion?: Date;
  notion_last_edited?: Date;
}
```

**Schema Constraints**:
- `deskripsi`: maxlength 2000 characters (unchanged)
- `sent_messages`: Array of message tracking objects
- `edit_count`: Increments on each edit
- `last_edited`: Updates on each edit

### ParsedTask Interface

```typescript
interface ParsedTask {
  judul: string;
  mata_pelajaran: string;
  deskripsi: string;
  deadline: Date;
  tipe: 'individu' | 'kelompok' | 'ujian';
  prioritas: 'urgent' | 'penting' | 'normal';
}
```

### PendingConfirmation Interface

```typescript
interface PendingConfirmation {
  userId: string;
  platform: 'whatsapp' | 'discord';
  parsedTask: ParsedTask;
  createdAt: Date;
  expiresAt: Date;  // 60 seconds from creation
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Multi-line Text Preservation

*For any* Notion page with rich_text array containing multiple segments, newlines, bullets, or paragraphs, parsing should preserve all text content, formatting characters, and whitespace exactly as written.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

### Property 2: Message Tracking Completeness

*For any* task message sent to WhatsApp or Discord, the system should record all required tracking fields (platform, message_id, chat_id, sent_at) in the task's sent_messages array.

**Validates: Requirements 2.1**

### Property 3: Significant Change Detection

*For any* two task states (old and new), the change detection function should return true if and only if at least one significant field (judul, deskripsi, deadline, prioritas, status) has changed.

**Validates: Requirements 2.3**

### Property 4: Cross-Platform Message Editing

*For any* task with tracked messages on both WhatsApp and Discord, when the task is updated, all messages on both platforms should be successfully edited with the new content.

**Validates: Requirements 2.4, 3.9**

### Property 5: Retry with Exponential Backoff

*For any* sync operation that fails, the system should retry up to 3 times with exponentially increasing delays (2s, 4s, 8s) before giving up.

**Validates: Requirements 2.7**

### Property 6: Edit Tracking Updates

*For any* message edit operation, the system should increment the edit_count and update the last_edited timestamp in the corresponding sent_messages entry.

**Validates: Requirements 2.9**

### Property 7: AI Parsing Completeness

*For any* natural language input that contains task information, the AI parser should extract all six required fields (judul, mata_pelajaran, deskripsi, deadline, tipe, prioritas) or return null if parsing fails.

**Validates: Requirements 3.2**

### Property 8: Relative Date Parsing

*For any* natural language input containing relative date expressions ("besok", "lusa", "minggu depan"), the parser should calculate the correct absolute date based on the current date.

**Validates: Requirements 3.3**

### Property 9: Keyword Detection

*For any* natural language input containing type keywords ("ujian", "kelompok") or priority keywords ("urgent", "penting"), the parser should set the corresponding field values correctly.

**Validates: Requirements 3.4**

### Property 10: Confirmation Edit Application

*For any* valid edit command ("edit [field] [value]") applied to a pending confirmation, the system should update the specified field and return the updated task, or return an error if the field or value is invalid.

**Validates: Requirements 3.6**

## Error Handling

### Notion Sync Errors

**Scenarios**:
- Network timeout (10 seconds)
- API rate limiting
- Invalid response format
- Database connection failure

**Handling**:
- Retry up to 3 times with exponential backoff (2s, 4s, 8s)
- Log all failures with context
- Continue with cached data if sync fails
- Don't crash the application

### Message Edit Errors

**Scenarios**:
- Message not found (deleted by user)
- Platform API error
- Network failure
- Invalid message ID

**Handling**:
- Log error with full context (task ID, message ID, platform)
- Continue editing other messages
- Don't remove tracking entry (may succeed later)
- Return partial success results

### AI Parsing Errors

**Scenarios**:
- AI service timeout (10 seconds)
- Invalid JSON response
- Missing required fields
- Unparseable input

**Handling**:
- Return null from parser
- Show user-friendly error message
- Suggest correct format with examples
- Log error for debugging

### Confirmation Timeout

**Scenarios**:
- User doesn't respond within 60 seconds
- User sends unrelated message

**Handling**:
- Auto-cleanup expired confirmations
- Show timeout message if user responds late
- Allow user to restart with new command

## Testing Strategy

### Dual Testing Approach

This feature requires both **unit tests** and **property-based tests** for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Both are complementary and necessary

### Unit Testing Focus

Unit tests should cover:
- Specific parsing examples (e.g., "Besok tugas matematika jam 10")
- Edge cases (empty input, very long descriptions, special characters)
- Error conditions (network failures, invalid responses)
- Integration points (Notion API, Discord API, WhatsApp API)
- Confirmation flow state transitions

### Property-Based Testing Configuration

- **Library**: fast-check (TypeScript/JavaScript)
- **Iterations**: Minimum 100 per property test
- **Tagging**: Each test must reference its design property

**Tag Format**:
```typescript
// Feature: multi-feature-enhancement, Property 1: Multi-line Text Preservation
```

### Property Test Implementation

Each correctness property must be implemented as a single property-based test:

**Property 1: Multi-line Text Preservation**
```typescript
// Feature: multi-feature-enhancement, Property 1: Multi-line Text Preservation
fc.assert(
  fc.property(
    fc.array(fc.string()),  // Generate array of text segments
    (segments) => {
      const notionPage = createMockNotionPage(segments);
      const parsed = notionService.parseNotionPage(notionPage);
      const expected = segments.join('').trim();
      return parsed.deskripsi === expected;
    }
  ),
  { numRuns: 100 }
);
```

**Property 2: Message Tracking Completeness**
```typescript
// Feature: multi-feature-enhancement, Property 2: Message Tracking Completeness
fc.assert(
  fc.property(
    fc.record({
      taskId: fc.string(),
      platform: fc.constantFrom('whatsapp', 'discord'),
      messageId: fc.string(),
      chatId: fc.string()
    }),
    async (data) => {
      await MessageTrackingService.trackMessage(
        data.taskId, data.platform, data.messageId, data.chatId
      );
      const task = await Task.findById(data.taskId);
      const tracked = task.sent_messages.find(
        m => m.message_id === data.messageId
      );
      return tracked && 
             tracked.platform === data.platform &&
             tracked.chat_id === data.chatId &&
             tracked.sent_at instanceof Date;
    }
  ),
  { numRuns: 100 }
);
```

**Property 3: Significant Change Detection**
```typescript
// Feature: multi-feature-enhancement, Property 3: Significant Change Detection
fc.assert(
  fc.property(
    fc.record({
      oldTask: generateRandomTask(),
      field: fc.constantFrom('judul', 'deskripsi', 'deadline', 'prioritas', 'status'),
      newValue: fc.anything()
    }),
    (data) => {
      const newTask = { ...data.oldTask, [data.field]: data.newValue };
      const hasChanges = MessageTrackingService.hasSignificantChanges(
        data.oldTask, newTask
      );
      return hasChanges === true;
    }
  ),
  { numRuns: 100 }
);
```

### Integration Testing

**Scenarios to test**:
1. End-to-end: Create task with NL → Confirm → Sync to Notion → Update in Notion → Auto-edit messages
2. Multi-platform: Send to WhatsApp and Discord → Update task → Verify both edited
3. Retry logic: Simulate Notion failures → Verify exponential backoff
4. Confirmation flow: Parse → Edit fields → Confirm → Verify task created

### Performance Testing

**Metrics to monitor**:
- Cron job completion time: < 5 minutes
- AI parse time: < 10 seconds
- Notion sync time: < 30 seconds (with retries)
- Message edit batch: Max 50 messages per run

### Manual Testing Checklist

**Feature 1: Multi-line Description**
- [ ] Single line description
- [ ] Multi-line with bullets
- [ ] Multi-line with paragraphs
- [ ] Mixed bullets and paragraphs
- [ ] Very long description (near 2000 char limit)
- [ ] Special characters and emojis

**Feature 2: Auto-Edit Messages**
- [ ] Update task in Notion → Message edited in WhatsApp
- [ ] Update task in Notion → Message edited in Discord
- [ ] Multiple messages for same task → All edited
- [ ] Update within 1 hour → Detected and edited
- [ ] Sync fails → Retry with backoff
- [ ] Edit count increments correctly

**Feature 3: Natural Language**
- [ ] Simple: "Besok tugas matematika"
- [ ] Complex: "Ujian fisika minggu depan jam 10, bawa kalkulator, urgent"
- [ ] Ambiguous: "Ada tugas besok" → Ask for more info
- [ ] Invalid: "asdfghjkl" → Show error
- [ ] Edit flow: User edits field before confirming
- [ ] Cancel flow: User cancels with "batal"
- [ ] Timeout: User doesn't respond within 60s

## Security & Safety

### Input Validation

- Sanitize all user inputs before AI parsing
- Validate parsed task fields before saving
- Limit description length to 2000 characters
- Validate date formats and ranges

### Rate Limiting

- Max 10 AI parse requests per user per hour
- Prevent spam of `/add_tugas_cepat` command
- Throttle Notion sync to avoid API limits

### Error Logging

- Log all failures with full context
- Include user ID, input, and error details
- Don't log sensitive information (API keys)
- Use structured logging for easy debugging

### Graceful Degradation

- If Notion sync fails, use cached data
- If message edit fails, log but don't crash
- If AI parsing fails, show helpful error
- If confirmation expires, allow restart

## Performance Considerations

### Cron Job Optimization

- Process max 50 messages per run
- Use database indexes on `updated_at` and `sent_messages`
- Batch message edits by platform
- Skip tasks with no tracked messages

### AI Parsing Optimization

- Timeout: 10 seconds per parse
- Cache common parsing patterns (future enhancement)
- Use concise prompts to reduce tokens
- Validate before calling AI to avoid unnecessary calls

### Database Optimization

- Index on `updated_at` for change detection
- Index on `sent_messages.message_id` for lookups
- Use projection to fetch only needed fields
- Limit query results to recent tasks

### Memory Management

- Clear expired confirmations automatically
- Limit pending confirmations per user (1)
- Don't load all tasks into memory
- Stream large result sets

## Implementation Notes

### Notion API Considerations

- Use `@notionhq/client` v5.9.0
- Type assertions needed for incomplete types
- Handle pagination for large databases (future)
- Respect rate limits (3 requests/second)

### WhatsApp (Baileys) Considerations

- Message edit requires original message key
- Store full message key in tracking
- No time limit on edits (unlike personal chats)
- Handle connection state carefully

### Discord.js Considerations

- Message edit requires message object
- Fetch message before editing
- No time limit on edits
- Handle missing messages gracefully

### AI Service Considerations

- Use OpenAI GPT-4 or similar
- Prompt engineering is critical
- Handle JSON extraction from markdown
- Validate all parsed fields

## Future Enhancements

1. **Batch Notion Sync**: Sync only changed pages using `last_edited_time`
2. **Smart Change Detection**: Ignore insignificant changes (whitespace, case)
3. **AI Caching**: Cache common parsing patterns to reduce API calls
4. **Message Edit History**: Track full edit history for debugging
5. **Multi-language Support**: Support English and other languages
6. **Voice Input**: Parse voice messages to text then to task
7. **Attachment Support**: Handle file attachments in descriptions
8. **Collaborative Editing**: Multiple users can edit same task

## Success Metrics

- Multi-line descriptions display correctly: 100% of time
- Auto-edit success rate: > 95%
- Natural language parse accuracy: > 90%
- Cron job completion time: < 5 minutes
- Zero crashes or data loss
- User satisfaction: Positive feedback on ease of use

